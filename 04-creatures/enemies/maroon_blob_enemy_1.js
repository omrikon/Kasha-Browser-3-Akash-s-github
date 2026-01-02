// Maroon Blob Enemy 1 - A basic enemy creature that attacks the player
// Now uses tiles
class MaroonBlobEnemy1 {
    constructor(x, y) {
        this.x = x; // Pixel position
        this.y = y; // Pixel position
        this.width = 35;
        this.height = 40;
        this.velocityX = -1.5;
        this.velocityY = 0;
        this.speed = 1.5;
        this.onGround = false;
        this.gravity = 0.6;
        this.color = '#8B0000';
        this.direction = -1; // -1 for left, 1 for right
        this.patrolDistance = 100;
        this.startX = x;
        this.startY = y;
        this.attacking = false;
        this.attackTimer = 0;
        this.attackCooldown = 0;
        this.mouthOpen = 0; // 0-1, how open the mouth is
        this.health = 2; // 2 ground slams to kill
        this.maxHealth = 2;
        this.dead = false;
        this.deathAnimation = 0;
        this.damageFlash = 0;
        this.scale = 1.0; // For bite animation
        this.scaleY = 1.0; // Vertical scale for fattening up
        this.originalWidth = 35;
        this.originalHeight = 40;
        this.rotation = 0; // For death animation
        this.biteDirection = 0; // -1 for left, 1 for right
        
        // Tile-based properties
        this.tileX = 0;
        this.tileY = 0;
        this.tileWidth = Math.ceil(this.width / (window.TILE_SIZE || 16));
        this.tileHeight = Math.ceil(this.height / (window.TILE_SIZE || 16));
    }
    
    // Update tile position
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
            // Death animation
            this.deathAnimation++;
            this.velocityY += this.gravity;
            this.y += this.velocityY;
            this.rotation = this.deathAnimation * 0.1; // Rotate as they fall
            return;
        }
        
        // Update damage flash
        if (this.damageFlash > 0) {
            this.damageFlash--;
        }
        
        // Attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
        
        // Check if player is nearby and start attack
        const distanceToPlayer = Math.abs(this.x - player.x);
        if (distanceToPlayer < 60 && !this.attacking && this.attackCooldown === 0) {
            this.attacking = true;
            this.attackTimer = 0;
            this.mouthOpen = 0;
            this.scale = 1.0;
            this.scaleY = 1.0;
            // Determine bite direction based on player position
            this.biteDirection = player.x < this.x ? -1 : 1; // -1 for left, 1 for right
        }
        
        // Handle attack animation
        if (this.attacking) {
            this.attackTimer++;
            
            // Open mouth over 15 frames (dodge window) - fatten up and grow taller
            if (this.attackTimer < 15) {
                const progress = this.attackTimer / 15;
                this.mouthOpen = progress;
                // Grow wider (fatten up)
                this.scale = 1.0 + progress * 0.4; // Grow 40% wider
                // Grow taller
                this.scaleY = 1.0 + progress * 0.5; // Grow 50% taller
                this.velocityX = 0; // Stop moving during attack
            } else if (this.attackTimer < 25) {
                // Bite phase - check for damage
                this.mouthOpen = 1;
                this.scale = 1.4; // Stay fat
                this.scaleY = 1.5; // Stay tall
                if (this.checkPlayerHit(player)) {
                    player.takeDamage(1); // Half a heart
                    this.attackCooldown = 120; // 2 second cooldown
                    this.attacking = false;
                    this.mouthOpen = 0;
                    this.scale = 1.0;
                    this.scaleY = 1.0;
                }
            } else {
                // Attack finished
                this.attacking = false;
                this.mouthOpen = 0;
                this.scale = 1.0;
                this.scaleY = 1.0;
                this.attackCooldown = 120;
            }
        } else {
            // Simple patrol AI - move back and forth
            if (Math.abs(this.x - this.startX) > this.patrolDistance) {
                this.direction *= -1;
            }
            
            this.velocityX = this.speed * this.direction;
        }
        
        // Apply gravity
        this.velocityY += this.gravity;
        
        // Store previous position for collision resolution
        const prevX = this.x;
        const prevY = this.y;
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Update tile position
        this.updateTilePosition();
        
        // Collision with platforms (keeping platform-based collision for stability)
        this.onGround = false;
        
        for (let platform of platforms) {
            if (this.checkCollision(platform)) {
                // Top collision (landing on platform)
                if (this.velocityY > 0 && this.y - this.velocityY < platform.y) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.onGround = true;
                }
                // Side collisions - turn around
                else if (this.velocityX > 0) {
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
        // Check if player is in bite range (including extended mouth)
        let hitBoxX = this.x;
        let hitBoxWidth = this.width;
        
        // Extend hit box in bite direction when attacking
        if (this.attacking && this.mouthOpen > 0.5) {
            const mouthExtension = 25 * this.mouthOpen;
            if (this.biteDirection === -1) {
                // Bite left - extend hit box left
                hitBoxX = this.x - mouthExtension;
                hitBoxWidth = this.width + mouthExtension;
            } else {
                // Bite right - extend hit box right
                hitBoxWidth = this.width + mouthExtension;
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
        
        // Play damage sound
        playEnemyDamageSound();
        
        if (this.health <= 0) {
            this.health = 0;
            this.dead = true;
            this.deathAnimation = 0;
            this.velocityY = -2; // Small bounce before falling
            this.attacking = false;
            playEnemyDeathSound();
            return true;
        }
        
        return true;
    }
    
    checkGroundSlamHit(player) {
        // Check if player ground slammed this enemy
        if (player.groundSlamming && player.velocityY > 10) {
            // Check if player is above enemy
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
        if (this.dead && this.deathAnimation > 120) return; // Don't draw after falling off screen
        
        internalCtx.save();
        internalCtx.translate(Math.floor(-cameraX / pixelScale), Math.floor(-cameraY / pixelScale));
        
        // Calculate scaled dimensions
        const scaledWidth = this.width * this.scale;
        const scaledHeight = this.height * this.scaleY;
        
        // Calculate position to keep bottom aligned when scaling
        const centerX = this.x + this.width / 2;
        const bottomY = this.y + this.height;
        const drawX = this.x - (scaledWidth - this.width) / 2;
        const drawY = bottomY - scaledHeight;
        
        // Apply transformations for body
        internalCtx.translate(centerX / pixelScale, bottomY / pixelScale);
        if (this.dead) {
            internalCtx.rotate(this.rotation);
        }
        internalCtx.scale(this.scale, this.scaleY);
        internalCtx.translate(-this.width / 2 / pixelScale, -this.height / pixelScale);
        
        // Damage flash
        let drawColor = this.color;
        if (this.damageFlash > 0 && Math.floor(this.damageFlash / 2) % 2 === 0) {
            drawColor = '#FF6B6B'; // Flash red when damaged
        }
        
        // Draw enemy body (at origin after transform, pixelated)
        internalCtx.fillStyle = drawColor;
        internalCtx.fillRect(Math.round(0), Math.round(0), 
                            Math.round(this.width / pixelScale), Math.round(this.height / pixelScale));
        
        // Draw simple eyes (at origin after transform, pixelated)
        if (!this.dead) {
            internalCtx.fillStyle = '#000';
            internalCtx.fillRect(Math.round(8 / pixelScale), Math.round(10 / pixelScale), 
                               Math.round(6 / pixelScale), Math.round(6 / pixelScale));
            internalCtx.fillRect(Math.round(21 / pixelScale), Math.round(10 / pixelScale), 
                               Math.round(6 / pixelScale), Math.round(6 / pixelScale));
        }
        
        internalCtx.restore();
        
        // Draw mouth separately in world coordinates
        if (this.attacking && this.mouthOpen > 0 && !this.dead) {
            internalCtx.save();
            internalCtx.translate(-cameraX / pixelScale, -cameraY / pixelScale);
            
            const mouthHeight = this.mouthOpen * 35; // Mouth height
            const mouthWidth = 30 * this.mouthOpen; // Mouth width
            const mouthExtension = this.mouthOpen * 30; // How far mouth extends
            
            // Calculate mouth position - extends toward player from scaled enemy
            let mouthX, mouthY;
            const enemyBottomY = this.y + this.height;
            
            if (this.biteDirection === -1) {
                // Bite left - mouth extends from left side of scaled enemy
                mouthX = drawX - mouthExtension;
                mouthY = enemyBottomY - 5;
            } else {
                // Bite right - mouth extends from right side of scaled enemy
                mouthX = drawX + scaledWidth;
                mouthY = enemyBottomY - 5;
            }
            
            // Draw mouth (pixelated)
            internalCtx.fillStyle = '#000';
            internalCtx.fillRect(Math.round(mouthX / pixelScale), Math.round(mouthY / pixelScale), 
                                Math.round(mouthWidth / pixelScale), Math.round(mouthHeight / pixelScale));
            
            // Draw teeth - pointing in bite direction (pixelated)
            internalCtx.fillStyle = '#FFFFFF';
            const numTeeth = 4;
            for (let i = 0; i < numTeeth; i++) {
                const toothY = mouthY + (mouthHeight / numTeeth) * i;
                if (this.biteDirection === -1) {
                    // Teeth pointing left
                    internalCtx.beginPath();
                    internalCtx.moveTo((mouthX + mouthWidth) / pixelScale, toothY / pixelScale);
                    internalCtx.lineTo((mouthX + mouthWidth - 8) / pixelScale, (toothY + mouthHeight / (numTeeth * 2)) / pixelScale);
                    internalCtx.lineTo((mouthX + mouthWidth) / pixelScale, (toothY + mouthHeight / numTeeth) / pixelScale);
                    internalCtx.closePath();
                    internalCtx.fill();
                } else {
                    // Teeth pointing right
                    internalCtx.beginPath();
                    internalCtx.moveTo(mouthX / pixelScale, toothY / pixelScale);
                    internalCtx.lineTo((mouthX + 8) / pixelScale, (toothY + mouthHeight / (numTeeth * 2)) / pixelScale);
                    internalCtx.lineTo(mouthX / pixelScale, (toothY + mouthHeight / numTeeth) / pixelScale);
                    internalCtx.closePath();
                    internalCtx.fill();
                }
            }
            
            // Draw mouth interior (dark red, pixelated)
            internalCtx.fillStyle = '#8B0000';
            internalCtx.fillRect(Math.round((mouthX + 2) / pixelScale), Math.round((mouthY + 2) / pixelScale), 
                               Math.round((mouthWidth - 4) / pixelScale), Math.round((mouthHeight - 4) / pixelScale));
            
            internalCtx.restore();
        }
    }
}

