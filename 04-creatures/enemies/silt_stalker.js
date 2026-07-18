// ============================================================================
// SILT_STALKER.JS - Pursuit predator (Rain World–inspired AI, original look)
// ============================================================================
// Long, low segmented stalker: vision → hunt → ghost estimate → investigate.
// Lunges with a telescoping snout. Tilemap collision for Level 2.
// ============================================================================

class SiltStalker {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 56;
        this.height = 28;
        this.velocityX = -1.2;
        this.velocityY = 0;
        this.baseSpeed = 1.2;
        this.huntSpeed = 3.2;
        this.investigateSpeed = 2.0;
        this.lungeSpeed = 6.5;
        this.speed = this.baseSpeed;
        this.onGround = false;
        this.gravity = 0.6;
        this.color = '#6B4F3A';
        this.segmentColor = '#8A6A4B';
        this.snoutColor = '#4A3528';
        this.direction = -1;
        this.roamDistance = 180;
        this.startX = x;
        this.startY = y;
        this.idleTurnTimer = 0;
        this.nextIdleTurn = 90 + Math.floor(Math.random() * 120);

        // Lunge attack
        this.attacking = false;
        this.attackTimer = 0;
        this.attackCooldown = 0;
        this.lungePhase = 'none'; // windup | dash | recover
        this.snoutExtend = 0;
        this.lungeDirection = 0;

        // Compat fields for resetGame / debug overlays
        this.mouthOpen = 0;
        this.scale = 1.0;
        this.scaleY = 1.0;
        this.biteDirection = 0;

        this.health = 3;
        this.maxHealth = 3;
        this.dead = false;
        this.deathAnimation = 0;
        this.damageFlash = 0;
        this.rotation = 0;

        this.tileX = 0;
        this.tileY = 0;

        this.visionSystem = new VisionSystem({
            visionAngle: Math.PI * 2 / 3,
            visionRange: 420,
            closeRangeAwareness: 60,
            canSeeBackwards: false
        });

        this.memorySystem = new MemorySystem({
            memoryDecayTime: 450
        });

        this.stateMachine = new BehaviorStateMachine(BEHAVIOR_STATE.IDLE);

        this.investigationBehavior = new InvestigationBehavior({
            searchRadius: 120,
            scoutDistance: 70,
            maxInvestigationTime: 240
        });

        this.estimationSystem = new EstimationSystem({
            estimationTime: 90,
            maxEstimationDistance: 280
        });

        this.playerVisible = false;
        this.lastKnownPlayerPosition = null;
        this.lastKnownPlayerVelocity = { x: 0, y: 0 };
        this.timeSinceLastSighting = 0;
    }

    updateTilePosition() {
        if (window.worldMap) {
            this.tileX = window.worldMap.pixelToTile(this.x);
            this.tileY = window.worldMap.pixelToTile(this.y);
        }
    }

    checkCollision(platform) {
        return this.x < platform.x + platform.width &&
               this.x + this.width > platform.x &&
               this.y < platform.y + platform.height &&
               this.y + this.height > platform.y;
    }

    update(platforms, player) {
        if (this.dead) {
            this.deathAnimation++;
            this.velocityY += this.gravity;
            this.y += this.velocityY;
            this.rotation = this.deathAnimation * 0.12;
            return;
        }

        this.memorySystem.update();
        this.stateMachine.update();
        this.investigationBehavior.update();

        if (this.damageFlash > 0) this.damageFlash--;
        if (this.attackCooldown > 0) this.attackCooldown--;

        // Vision
        const visionResult = this.visionSystem.canSee(this, player, platforms);
        this.playerVisible = visionResult !== null;

        if (this.playerVisible) {
            this.timeSinceLastSighting = 0;
            this.lastKnownPlayerPosition = {
                x: player.x + player.width / 2,
                y: player.y + player.height / 2
            };
            this.lastKnownPlayerVelocity = {
                x: player.velocityX || 0,
                y: player.velocityY || 0
            };
            this.memorySystem.updateMemory('player', this.lastKnownPlayerPosition, 0);
        } else {
            this.timeSinceLastSighting++;
            if (this.lastKnownPlayerPosition) {
                this.memorySystem.updateMemory(
                    'player',
                    this.lastKnownPlayerPosition,
                    this.timeSinceLastSighting
                );
            }
        }

        // State transitions (skip while committed to lunge)
        const currentState = this.stateMachine.getState();
        if (!this.attacking) {
            if (this.playerVisible && currentState !== BEHAVIOR_STATE.HUNTING) {
                this.stateMachine.changeState(BEHAVIOR_STATE.HUNTING);
                this.investigationBehavior.reset();
            } else if (!this.playerVisible && currentState === BEHAVIOR_STATE.HUNTING) {
                const memory = this.memorySystem.getMemory('player');
                if (memory) {
                    this.stateMachine.changeState(BEHAVIOR_STATE.INVESTIGATING);
                    const estimatedPos = this.estimationSystem.estimatePosition(
                        memory.position,
                        this.lastKnownPlayerVelocity,
                        this.timeSinceLastSighting
                    );
                    this.investigationBehavior.startInvestigation(estimatedPos);
                } else {
                    this.stateMachine.changeState(BEHAVIOR_STATE.IDLE);
                    this.investigationBehavior.reset();
                }
            } else if (currentState === BEHAVIOR_STATE.INVESTIGATING) {
                if (this.investigationBehavior.isComplete()) {
                    this.stateMachine.changeState(BEHAVIOR_STATE.IDLE);
                    this.memorySystem.deleteMemory('player');
                    this.investigationBehavior.reset();
                }
            }
        }

        // Behavior / lunge
        if (this.attacking) {
            this.updateLunge(player);
        } else {
            this.executeBehavior(currentState, visionResult, player);
        }

        // Physics
        this.velocityY += this.gravity;
        const prevX = this.x;
        const prevY = this.y;
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.updateTilePosition();
        this.resolveCollisions(platforms, prevX, prevY);
    }

    updateLunge(player) {
        this.attackTimer++;
        this.biteDirection = this.lungeDirection;
        this.mouthOpen = this.snoutExtend;

        if (this.lungePhase === 'windup') {
            // Dodge window — stop, telegraph snout
            this.velocityX = 0;
            this.snoutExtend = Math.min(1, this.attackTimer / 18);
            if (this.attackTimer >= 18) {
                this.lungePhase = 'dash';
                this.attackTimer = 0;
            }
        } else if (this.lungePhase === 'dash') {
            this.velocityX = this.lungeSpeed * this.lungeDirection;
            this.snoutExtend = 1;
            if (this.checkPlayerHit(player)) {
                player.takeDamage(1);
                this.endLunge(90);
                return;
            }
            if (this.attackTimer >= 16) {
                this.lungePhase = 'recover';
                this.attackTimer = 0;
            }
        } else if (this.lungePhase === 'recover') {
            this.velocityX = this.lungeDirection * this.baseSpeed * 0.4;
            this.snoutExtend = Math.max(0, 1 - this.attackTimer / 12);
            if (this.attackTimer >= 12) {
                this.endLunge(100);
            }
        }
    }

    endLunge(cooldown) {
        this.attacking = false;
        this.lungePhase = 'none';
        this.attackTimer = 0;
        this.snoutExtend = 0;
        this.mouthOpen = 0;
        this.attackCooldown = cooldown;
    }

    startLunge(player) {
        this.attacking = true;
        this.lungePhase = 'windup';
        this.attackTimer = 0;
        this.snoutExtend = 0;
        this.lungeDirection = (player.x + player.width / 2) < (this.x + this.width / 2) ? -1 : 1;
        this.direction = this.lungeDirection;
        this.biteDirection = this.lungeDirection;
    }

    executeBehavior(currentState, visionResult, player) {
        if (currentState === BEHAVIOR_STATE.IDLE) {
            this.speed = this.baseSpeed;
            this.idleTurnTimer++;
            if (Math.abs(this.x - this.startX) > this.roamDistance) {
                this.direction *= -1;
                this.idleTurnTimer = 0;
                this.nextIdleTurn = 60 + Math.floor(Math.random() * 100);
            } else if (this.idleTurnTimer >= this.nextIdleTurn) {
                this.direction *= -1;
                this.idleTurnTimer = 0;
                this.nextIdleTurn = 80 + Math.floor(Math.random() * 140);
            }
            this.velocityX = this.speed * this.direction;

        } else if (currentState === BEHAVIOR_STATE.HUNTING) {
            this.speed = this.huntSpeed;
            if (this.playerVisible && visionResult) {
                const dx = visionResult.position.x - (this.x + this.width / 2);
                this.direction = dx > 0 ? 1 : -1;
                this.velocityX = this.speed * this.direction;

                const distanceToPlayer = Math.abs(
                    (player.x + player.width / 2) - (this.x + this.width / 2)
                );
                if (distanceToPlayer < 90 && this.attackCooldown === 0) {
                    this.startLunge(player);
                }
            } else {
                this.velocityX = this.speed * this.direction;
            }

        } else if (currentState === BEHAVIOR_STATE.INVESTIGATING) {
            this.speed = this.investigateSpeed;
            const target = this.investigationBehavior.getCurrentTarget();
            if (target) {
                const dx = target.x - (this.x + this.width / 2);
                this.direction = dx > 0 ? 1 : -1;
                this.velocityX = this.speed * this.direction;
                if (this.investigationBehavior.isAtTarget({
                    x: this.x + this.width / 2,
                    y: this.y + this.height / 2
                }, 24)) {
                    this.investigationBehavior.nextScoutPoint();
                }
            } else {
                this.velocityX = this.speed * this.direction;
            }
        }
    }

    resolveCollisions(platforms, prevX, prevY) {
        this.onGround = false;

        if (window.worldMap) {
            const feetY = this.y + this.height;
            const feetTileY = window.worldMap.pixelToTile(feetY);
            const leftTileX = window.worldMap.pixelToTile(this.x);
            const rightTileX = window.worldMap.pixelToTile(this.x + this.width - 1);

            let onGroundTile = false;
            for (let tx = leftTileX; tx <= rightTileX; tx++) {
                const tileBelow = window.worldMap.getTile(tx, feetTileY);
                if (window.worldMap.isSolidTile(tileBelow)) {
                    const tileTopY = window.worldMap.tileToPixel(feetTileY);
                    const distanceToTile = feetY - tileTopY;
                    if (distanceToTile >= -2 && distanceToTile <= 8) {
                        this.y = tileTopY - this.height;
                        this.velocityY = 0;
                        onGroundTile = true;
                        this.onGround = true;
                        break;
                    }
                }
            }

            if (!onGroundTile) {
                const collisionInfo = window.worldMap.getCollisionInfo(
                    this.x, this.y, this.width, this.height, prevX, prevY
                );
                if (collisionInfo.collides) {
                    if (collisionInfo.side === 'top') {
                        this.y = collisionInfo.pixelY - this.height;
                        this.velocityY = 0;
                        this.onGround = true;
                    } else if (collisionInfo.side === 'bottom') {
                        this.y = collisionInfo.pixelY + window.TILE_SIZE;
                        this.velocityY = 0;
                    } else if (collisionInfo.side === 'left') {
                        this.x = collisionInfo.pixelX - this.width;
                        this.direction *= -1;
                        this.velocityX = 0;
                        if (this.attacking && this.lungePhase === 'dash') {
                            this.endLunge(60);
                        }
                    } else if (collisionInfo.side === 'right') {
                        this.x = collisionInfo.pixelX + window.TILE_SIZE;
                        this.direction *= -1;
                        this.velocityX = 0;
                        if (this.attacking && this.lungePhase === 'dash') {
                            this.endLunge(60);
                        }
                    }
                }
            } else {
                // Side collisions while grounded
                if (window.worldMap.checkCollision(this.x, this.y, this.width, this.height * 0.7)) {
                    this.x = prevX;
                    this.direction *= -1;
                    this.velocityX = 0;
                }
            }
            return;
        }

        // Platform fallback
        for (let platform of platforms) {
            if (this.checkCollision(platform)) {
                if (this.velocityY > 0 && this.y - this.velocityY < platform.y) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.onGround = true;
                } else if (this.velocityX > 0) {
                    this.x = platform.x - this.width;
                    this.direction *= -1;
                } else if (this.velocityX < 0) {
                    this.x = platform.x + platform.width;
                    this.direction *= -1;
                }
            }
        }
    }

    checkPlayerHit(player) {
        let hitBoxX = this.x;
        let hitBoxWidth = this.width;
        const snoutLen = 36 * this.snoutExtend;

        if (this.attacking && this.snoutExtend > 0.4) {
            if (this.lungeDirection === -1) {
                hitBoxX = this.x - snoutLen;
                hitBoxWidth = this.width + snoutLen;
            } else {
                hitBoxWidth = this.width + snoutLen;
            }
        }

        return hitBoxX < player.x + player.width &&
               hitBoxX + hitBoxWidth > player.x &&
               this.y < player.y + player.height &&
               this.y + this.height > player.y;
    }

    takeDamage(amount = 1) {
        if (this.dead) return false;

        this.health -= amount;
        this.damageFlash = 10;
        playEnemyDamageSound();

        if (this.health <= 0) {
            this.health = 0;
            this.dead = true;
            this.deathAnimation = 0;
            this.velocityY = -2.5;
            this.attacking = false;
            this.lungePhase = 'none';
            playEnemyDeathSound();
            return true;
        }
        return true;
    }

    checkGroundSlamHit(player) {
        if (player.groundSlamming && player.velocityY > 10) {
            if (player.x < this.x + this.width &&
                player.x + player.width > this.x &&
                player.y + player.height < this.y + 10 &&
                player.y + player.height > this.y - 20) {
                return true;
            }
        }
        return false;
    }

    draw() {
        if (this.dead && this.deathAnimation > 120) return;

        internalCtx.save();
        internalCtx.translate(Math.floor(-cameraX / pixelScale), Math.floor(-cameraY / pixelScale));

        const centerX = this.x + this.width / 2;
        const bottomY = this.y + this.height;

        internalCtx.translate(centerX / pixelScale, bottomY / pixelScale);
        if (this.dead) {
            internalCtx.rotate(this.rotation);
        }
        // Face movement direction
        if (this.direction < 0) {
            internalCtx.scale(-1, 1);
        }
        internalCtx.translate(-this.width / 2 / pixelScale, -this.height / pixelScale);

        let bodyColor = this.color;
        let segColor = this.segmentColor;
        if (this.damageFlash > 0 && Math.floor(this.damageFlash / 2) % 2 === 0) {
            bodyColor = '#C4785A';
            segColor = '#E09A7A';
        }

        const ps = pixelScale;
        const w = this.width / ps;
        const h = this.height / ps;

        // Segmented body (long low shape)
        const segments = 4;
        const segW = w / segments;
        for (let i = 0; i < segments; i++) {
            internalCtx.fillStyle = i % 2 === 0 ? bodyColor : segColor;
            const segH = h * (0.85 + (i === segments - 1 ? 0.15 : 0));
            const segY = h - segH;
            internalCtx.fillRect(
                Math.round(i * segW),
                Math.round(segY),
                Math.round(segW + 0.5),
                Math.round(segH)
            );
        }

        // Eyes on head (right side in local space; flipped with direction)
        if (!this.dead) {
            internalCtx.fillStyle = '#1A120C';
            internalCtx.fillRect(Math.round(w - 14 / ps), Math.round(6 / ps), Math.round(5 / ps), Math.round(5 / ps));
            internalCtx.fillRect(Math.round(w - 22 / ps), Math.round(8 / ps), Math.round(4 / ps), Math.round(4 / ps));
            // Eye shine
            internalCtx.fillStyle = '#E8D5A3';
            internalCtx.fillRect(Math.round(w - 12 / ps), Math.round(7 / ps), Math.round(2 / ps), Math.round(2 / ps));
        }

        // Telescoping snout during lunge
        if (this.attacking && this.snoutExtend > 0 && !this.dead) {
            const snoutLen = (36 * this.snoutExtend) / ps;
            const snoutH = (10 + 6 * this.snoutExtend) / ps;
            const snoutY = (h / 2) - snoutH / 2;
            internalCtx.fillStyle = this.snoutColor;
            internalCtx.fillRect(Math.round(w - 2 / ps), Math.round(snoutY), Math.round(snoutLen), Math.round(snoutH));
            // Jaw tip
            internalCtx.fillStyle = '#2C1E14';
            internalCtx.fillRect(
                Math.round(w - 2 / ps + snoutLen - 4 / ps),
                Math.round(snoutY - 2 / ps),
                Math.round(6 / ps),
                Math.round(snoutH + 4 / ps)
            );
        }

        internalCtx.restore();
    }
}

window.SiltStalker = SiltStalker;
