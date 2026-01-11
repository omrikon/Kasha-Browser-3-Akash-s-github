// ============================================================================
// CLASSES/PLAYER.JS - Player Class
// ============================================================================
// This file contains the Player class - the character you control in the game.
// The Player class handles everything about your character: movement (walking,
// jumping, ground slamming), combat (weapon attacks), health and damage,
// animations (idle, walking, jumping, etc.), and collision detection
// (making sure you don't fall through platforms). This is one of the most
// important classes in the game - it's the main character!
// ============================================================================

// This message appears in the browser console when the file loads
console.log('Loading classes/player.js...');

class Player {
    constructor(x, y) {
        this.x = x; // Pixel position
        this.y = y; // Pixel position
        this.width = 60; // Collision box width (smaller to fit under platforms)
        this.height = 80; // Collision box height (smaller to fit under platforms)
        this.spriteWidth = 120; // Visual sprite width (kept large for visibility)
        this.spriteHeight = 120; // Visual sprite height (kept large for visibility)
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpPower = 18; // Increased for more air time
        this.gravity = 0.5; // Reduced gravity for more floaty feel
        this.onGround = false;
        this.color = '#FF6B6B';
        this.groundSlamming = false;
        this.slamChargeTime = 0;
        this.slamSpeed = 20;
        this.slamAnimationFrame = 0;
        this.health = 6; // 3 hearts = 6 half hearts
        this.maxHealth = 6;
        this.invincible = false;
        this.invincibleTime = 0;
        this.damageFlash = 0;
        this.flinchOffset = 0;
        
        // Direction tracking (1 = right, -1 = left)
        this.direction = 1;
        
        // Weapon attack state
        this.attacking = false;
        this.attackTimer = 0;
        this.attackCooldown = 0;
        this.weaponAngle = 0; // Current weapon rotation angle for animation
        this.weaponExtension = 0; // How far weapon extends during attack
        
        // Tile-based properties
        this.tileX = 0;
        this.tileY = 0;
        this.tileWidth = Math.ceil(this.width / window.TILE_SIZE);
        this.tileHeight = Math.ceil(this.height / window.TILE_SIZE);
        
        // Sprite sheet animation properties
        this.currentState = 'idle';
        this.animationFrame = 0;
        this.frameTimer = 0;
        this.framesPerSecond = 1.5; // Very slow animation speed for idle (was 8, then 3)
        
        // Sprite sheets (will be loaded as images are added)
        this.spriteSheets = {
            idle: null,
            walk: null,
            jump: null,
            fall: null,
            land: null,
            groundslam_start: null,
            groundslam_impact: null,
            throw: null,
            aim: null,
            pickup: null,
            hurt: null
        };
        
        // Sprite sheet frame dimensions (can be customized per state if needed)
        // These are the source frame dimensions in the sprite sheet (before scaling)
        this.frameWidth = 64; // Actual sprite frame width in sprite sheet
        this.frameHeight = 64; // Actual sprite frame height in sprite sheet
        
        // Track landing state (brief state after landing)
        this.landingFrame = 0;
        this.landingDuration = 8; // Frames to show landing animation
        
        // Track pickup state
        this.pickingUp = false;
        this.pickupFrame = 0;
        this.pickupDuration = 10; // Frames to show pickup animation
        
        // Track throwing state
        this.throwing = false;
        this.throwFrame = 0;
        this.throwDuration = 8; // Frames to show throw animation
        
        // Previous onGround state to detect landing
        this.prevOnGround = false;
        
        // Direction tracking (1 = right, -1 = left)
        this.direction = 1;
    }
    
    // Update tile position
    updateTilePosition() {
        if (window.worldMap) {
            this.tileX = window.worldMap.pixelToTile(this.x);
            this.tileY = window.worldMap.pixelToTile(this.y);
        }
    }
    
    // Determine current player state based on game state
    getCurrentState() {
        // Priority order matters - check more specific states first
        
        // Hurt state takes priority when taking damage
        if (this.damageFlash > 0 || (this.invincible && Math.floor(this.invincibleTime / 3) % 2 === 0)) {
            return 'hurt';
        }
        
        // Pickup state (when collecting kashaball)
        if (this.pickingUp && this.pickupFrame < this.pickupDuration) {
            return 'pickup';
        }
        
        // Throw state (when throwing kashaball)
        if (this.throwing && this.throwFrame < this.throwDuration) {
            return 'throw';
        }
        
        // Aim state (when showing trajectory)
        const selectedItem = inventory.getSelectedItem();
        if (showingTrajectory && selectedItem && selectedItem.type === 'kashaball' && selectedItem.count > 0) {
            return 'aim';
        }
        
        // Ground slam states
        if (this.groundSlamming) {
            if (this.slamChargeTime < 5) {
                return 'groundslam_start';
            } else if (this.velocityY > 5) {
                return 'groundslam_impact';
            }
        }
        
        // Landing state (brief transition after landing)
        if (this.landingFrame > 0 && this.landingFrame < this.landingDuration) {
            return 'land';
        }
        
        // Jump and fall states (in air)
        if (!this.onGround) {
            if (this.velocityY < 0) {
                return 'jump';
            } else {
                return 'fall';
            }
        }
        
        // Walk state (on ground and moving)
        if (Math.abs(this.velocityX) > 0.5) {
            return 'walk';
        }
        
        // Default to idle (on ground and not moving)
        return 'idle';
    }
    
    // Load a sprite sheet for a specific state
    loadSpriteSheet(state, imagePath, frameWidth = null, frameHeight = null) {
        const img = new Image();
        img.onload = () => {
            this.spriteSheets[state] = img;
            if (frameWidth) this.frameWidth = frameWidth;
            if (frameHeight) this.frameHeight = frameHeight;
        };
        img.src = imagePath;
    }
    
    // Load all sprite sheets (called after player creation)
    loadAllSpriteSheets() {
        // Load idle sprite sheet (2 frames: idle0 and idle1)
        this.loadSpriteSheet('idle', 'assets/sprites/player/idle/idle sprite sheet.png', 64, 64);
        
        // Load walk sprite sheet (8 frames: run8 frames east 0-7)
        this.loadSpriteSheet('walk', 'assets/sprites/player/walk/walk_sprite_sheet.png', 64, 64);
    }

    update(platforms) {
        // Update animation state frames
        if (this.landingFrame > 0) {
            this.landingFrame--;
        }
        
        if (this.pickupFrame > 0) {
            this.pickupFrame--;
            if (this.pickupFrame <= 0) {
                this.pickingUp = false;
            }
        }
        
        if (this.throwFrame > 0) {
            this.throwFrame--;
            if (this.throwFrame <= 0) {
                this.throwing = false;
            }
        }
        
        // Update current state and animation frame
        const newState = this.getCurrentState();
        if (newState !== this.currentState) {
            this.currentState = newState;
            this.animationFrame = 0; // Reset frame when state changes
            this.frameTimer = 0;
        } else {
            // Update animation frame timer
            // Use different frame rates for different states
            let currentFPS = this.framesPerSecond; // Default (idle)
            if (this.currentState === 'walk') {
                currentFPS = this.framesPerSecond * 6; // 500% faster (6x speed) for walk
            }
            
            this.frameTimer++;
            const framesPerFrame = 60 / currentFPS;
            if (this.frameTimer >= framesPerFrame) {
                this.frameTimer = 0;
                // Get number of frames in current sprite sheet
                const spriteSheet = this.spriteSheets[this.currentState];
                if (spriteSheet) {
                    const framesInSheet = Math.floor(spriteSheet.width / this.frameWidth);
                    this.animationFrame = (this.animationFrame + 1) % framesInSheet;
                } else {
                    this.animationFrame = 0;
                }
            }
        }
        
        // Update invincibility and damage flash
        if (this.invincible) {
            this.invincibleTime++;
            if (this.invincibleTime > 60) { // 1 second invincibility
                this.invincible = false;
                this.invincibleTime = 0;
            }
        }
        
        if (this.damageFlash > 0) {
            this.damageFlash--;
        }
        
        if (this.flinchOffset > 0) {
            this.flinchOffset *= 0.9; // Decay flinch
            if (this.flinchOffset < 0.1) this.flinchOffset = 0;
        }
        
        // Update weapon attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
        
        // Update weapon attack animation
        if (this.attacking) {
            this.attackTimer++;
            
            const selectedItem = inventory.getSelectedItem();
            const weaponType = (selectedItem?.type === 'weapon') ? (selectedItem.data?.weaponType || 'sword') : 'sword';
            const w = WEAPON_TYPES[weaponType] || WEAPON_TYPES.sword;
            const totalFrames = w.windup + w.attack + w.recovery;
            const progress = this.attackTimer < w.windup ? this.attackTimer / w.windup : 
                           (this.attackTimer < w.windup + w.attack) ? (this.attackTimer - w.windup) / w.attack :
                           (this.attackTimer - w.windup - w.attack) / w.recovery;
            
            if (this.attackTimer < w.windup) {
                this.weaponAngle = w.windupAngle * progress;
                this.weaponExtension = 0;
            } else if (this.attackTimer < w.windup + w.attack) {
                if (weaponType === 'staff') {
                    this.weaponAngle = 0;
                    this.weaponExtension = w.extension * (1 + progress * 1.5);
                } else if (weaponType === 'dagger') {
                    this.weaponAngle = 0;
                    this.weaponExtension = w.extension * progress;
                } else {
                    this.weaponAngle = w.attackStart + (w.attackEnd - w.attackStart) * progress;
                    this.weaponExtension = w.extension + (weaponType === 'axe' ? 15 : 10) * Math.sin(progress * Math.PI);
                }
            } else if (this.attackTimer < totalFrames) {
                this.weaponAngle *= (1 - progress);
                this.weaponExtension *= (1 - progress);
            } else {
                this.attacking = false;
                this.attackTimer = this.weaponAngle = this.weaponExtension = 0;
                this.attackCooldown = w.cooldown;
            }
        }
        
        // Ground slam check (only when in air)
        if (!this.onGround && (keys['s'] || keys['arrowdown'])) {
            if (!this.groundSlamming) {
                this.groundSlamming = true;
                this.slamChargeTime = 0;
                this.slamAnimationFrame = 0;
            }
        }

        // Ground slam execution
        if (this.groundSlamming) {
            this.slamChargeTime++;
            this.slamAnimationFrame++;
            
            // Quick charge animation (squash effect)
            if (this.slamChargeTime < 5) {
                // Slight upward movement during charge
                this.velocityY = -2;
            } else {
                // Slam down with high speed
                this.velocityY = this.slamSpeed;
                this.velocityX *= 0.9; // Reduce horizontal movement during slam
            }
        } else {
            // Normal horizontal movement
            if (keys['a'] || keys['arrowleft']) {
                this.velocityX = -this.speed;
                this.direction = -1; // Moving left
            } else if (keys['d'] || keys['arrowright']) {
                this.velocityX = this.speed;
                this.direction = 1; // Moving right
            } else {
                this.velocityX *= 0.8; // Friction
                // Keep last direction when stopped
            }

            // Jumping (only when on ground and not slamming)
            if ((keys['w'] || keys['arrowup'] || keys[' ']) && this.onGround) {
                this.velocityY = -this.jumpPower;
                this.onGround = false;
            }

            // Apply gravity (only if not slamming)
            this.velocityY += this.gravity;
        }

        // Update direction based on horizontal velocity (keep last direction when stopped)
        if (this.velocityX > 0) {
            this.direction = 1; // Moving right
        } else if (this.velocityX < 0) {
            this.direction = -1; // Moving left
        }
        // If velocityX === 0, keep the last direction

        // Store previous position for collision resolution
        const prevX = this.x;
        const prevY = this.y;
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Update tile position
        this.updateTilePosition();
        
        // Collision detection - check both platforms and tilemap
        // Track landing detection before collision check
        this.prevOnGround = this.onGround;
        this.onGround = false;
        
        // For level 2 (tilemap-native), check tile collisions first
        if (currentLevel === 2 && window.worldMap) {
            // Check for ground collision (standing on tiles)
            const feetY = this.y + this.height;
            const feetTileY = window.worldMap.pixelToTile(feetY);
            const leftTileX = window.worldMap.pixelToTile(this.x);
            const rightTileX = window.worldMap.pixelToTile(this.x + this.width);
            
            // Check if there's a solid tile directly below the player's feet
            let onGroundTile = false;
            for (let tx = leftTileX; tx <= rightTileX; tx++) {
                const tileBelow = window.worldMap.getTile(tx, feetTileY);
                if (window.worldMap.isSolidTile(tileBelow)) {
                    const tileTopY = window.worldMap.tileToPixel(feetTileY);
                    const distanceToTile = feetY - tileTopY;
                    if (distanceToTile >= -2 && distanceToTile <= 5) { // Small tolerance for floating
                        this.y = tileTopY - this.height;
                        this.velocityY = 0;
                        onGroundTile = true;
                        if (!this.prevOnGround) {
                            this.landingFrame = this.landingDuration;
                        }
                        this.onGround = true;
                        break;
                    }
                }
            }
            
            // Check for movement collisions (only if not already on ground from above check)
            if (!onGroundTile) {
                const collisionInfo = window.worldMap.getCollisionInfo(
                    this.x, this.y, this.width, this.height, prevX, prevY
                );
                
                if (collisionInfo.collides) {
                // Handle collision based on side
                if (collisionInfo.side === 'top') {
                    // Check if this was a ground slam (before resetting velocity)
                    const wasGroundSlam = this.groundSlamming && this.velocityY > 10;
                    
                    // Landing on top of tile
                    this.y = collisionInfo.pixelY - this.height;
                    this.velocityY = 0;
                    
                    // Handle ground slam effects
                    if (wasGroundSlam) {
                        // Create ground slam effect
                        const slamX = this.x + this.width / 2;
                        const slamY = collisionInfo.pixelY;
                        groundSlamEffects.push(new GroundSlamEffect(slamX, slamY));
                        
                        // Ground slam tile interaction
                        const slamRadius = 60;
                        const dislodgedDirtTiles = window.worldMap.dislodgeDirtTiles(slamX, slamY, slamRadius, 8);
                        
                        if (dislodgedDirtTiles.length > 0) {
                            playDamageSound();
                            dislodgedDirtTiles.forEach(dirtTile => {
                                const breakingEffect = new PlatformBreakingEffect(
                                    dirtTile.pixelX, dirtTile.pixelY, 
                                    window.TILE_SIZE, window.TILE_SIZE
                                );
                                platformBreakingEffects.push(breakingEffect);
                                setTimeout(() => {
                                    const dirtParticle = new DirtTile(
                                        dirtTile.pixelX, dirtTile.pixelY,
                                        dirtTile.velocityX, dirtTile.velocityY
                                    );
                                    dirtTiles.push(dirtParticle);
                                }, 100);
                            });
                        }
                        
                        const destroyedTiles = window.worldMap.destroyTiles(slamX, slamY, slamRadius);
                        if (destroyedTiles.length > 0) {
                            playDamageSound();
                            destroyedTiles.forEach(tile => {
                                const breakingEffect = new PlatformBreakingEffect(
                                    tile.pixelX, tile.pixelY, 
                                    window.TILE_SIZE, window.TILE_SIZE
                                );
                                platformBreakingEffects.push(breakingEffect);
                                setTimeout(() => {
                                    const dirtTile = new DirtTile(tile.pixelX, tile.pixelY);
                                    dirtTiles.push(dirtTile);
                                }, 200);
                            });
                        }
                    }
                    
                    // Detect landing transition
                    if (!this.prevOnGround) {
                        this.landingFrame = this.landingDuration;
                    }
                    this.onGround = true;
                    this.groundSlamming = false;
                    this.slamChargeTime = 0;
                    this.slamAnimationFrame = 0;
                } else if (collisionInfo.side === 'bottom') {
                    // Hitting tile from below
                    this.y = collisionInfo.pixelY + window.TILE_SIZE;
                    this.velocityY = 0;
                } else if (collisionInfo.side === 'left') {
                    // Hitting left side of tile
                    this.x = collisionInfo.pixelX - this.width;
                    this.velocityX = 0;
                } else if (collisionInfo.side === 'right') {
                    // Hitting right side of tile
                    this.x = collisionInfo.pixelX + window.TILE_SIZE;
                    this.velocityX = 0;
                }
                }
            }
            
            // Also check horizontal collisions separately (for side collisions when moving)
            if (this.velocityX !== 0) {
                const checkY = this.y + this.height / 2; // Check middle of player
                const checkTileY = window.worldMap.pixelToTile(checkY);
                
                if (this.velocityX > 0) {
                    // Moving right - check right edge
                    const rightX = this.x + this.width;
                    const rightTileX = window.worldMap.pixelToTile(rightX);
                    const tile = window.worldMap.getTile(rightTileX, checkTileY);
                    if (window.worldMap.isSolidTile(tile)) {
                        this.x = window.worldMap.tileToPixel(rightTileX) - this.width;
                        this.velocityX = 0;
                    }
                } else if (this.velocityX < 0) {
                    // Moving left - check left edge
                    const leftTileX = window.worldMap.pixelToTile(this.x);
                    const tile = window.worldMap.getTile(leftTileX, checkTileY);
                    if (window.worldMap.isSolidTile(tile)) {
                        this.x = window.worldMap.tileToPixel(leftTileX) + window.TILE_SIZE;
                        this.velocityX = 0;
                    }
                }
            }
        }
        
        // Also check platform collisions (for level 1 and any platforms in level 2)
        for (let platform of platforms) {
            // Skip collision with platforms whose tiles were destroyed (but keep solid ground)
            // This prevents glitchy movement when platforms are destroyed by ground slam
            if (window.worldMap && platform.color !== '#228B22') {
                // Check if platform's center tile still exists (if not, platform was destroyed)
                const platformCenterX = platform.x + platform.width / 2;
                const platformCenterY = platform.y + platform.height / 2;
                const tileType = window.worldMap.getTileAtPixel(platformCenterX, platformCenterY);
                if (tileType === window.TILE_TYPE.EMPTY) {
                    continue; // Skip destroyed platforms
                }
            }
            
            if (this.checkCollision(platform)) {
                // Top collision (landing on platform)
                if (this.velocityY > 0 && this.y - this.velocityY < platform.y) {
                    this.y = platform.y - this.height;
                    
                    // Check if this was a ground slam
                    if (this.groundSlamming && this.velocityY > 10) {
                        // Create ground slam effect
                        const slamX = this.x + this.width / 2;
                        const slamY = platform.y;
                        groundSlamEffects.push(new GroundSlamEffect(slamX, slamY));
                        
                        // Ground slam tile interaction - destroy destructible/platform tiles and dislodge DIRT tiles
                        // Only destroy tiles when actually landing, not while falling
                        if (window.worldMap) {
                            const slamRadius = 60; // Ground slam radius in pixels
                            
                            // First, dislodge DIRT tiles with physics (they fly outward like real dirt)
                            const dislodgedDirtTiles = window.worldMap.dislodgeDirtTiles(slamX, slamY, slamRadius, 8);
                            
                            if (dislodgedDirtTiles.length > 0) {
                                // Play extra impact sound for dirt dislodging
                                playDamageSound();
                                
                                // Create dirt particles with physics from dislodged DIRT tiles
                                dislodgedDirtTiles.forEach(dirtTile => {
                                    // Create breaking animation (Minecraft-style)
                                    const breakingEffect = new PlatformBreakingEffect(
                                        dirtTile.pixelX, 
                                        dirtTile.pixelY, 
                                        window.TILE_SIZE, 
                                        window.TILE_SIZE
                                    );
                                    platformBreakingEffects.push(breakingEffect);
                                    
                                    // Create dirt particle with physics (flies outward from impact)
                                    setTimeout(() => {
                                        const dirtParticle = new DirtTile(
                                            dirtTile.pixelX, 
                                            dirtTile.pixelY,
                                            dirtTile.velocityX,
                                            dirtTile.velocityY
                                        );
                                        dirtTiles.push(dirtParticle);
                                    }, 100); // Shorter delay for dirt (more immediate)
                                });
                            }
                            
                            // Then destroy destructible/platform tiles (normal behavior)
                            const destroyedTiles = window.worldMap.destroyTiles(slamX, slamY, slamRadius);
                            
                            // Convert destroyed tiles to falling dirt particles with breaking animation
                            if (destroyedTiles.length > 0) {
                                // Play extra impact sound for tile destruction
                                playDamageSound();
                                
                                // Track which platforms were destroyed
                                const destroyedPlatforms = new Set();
                                
                                // Create breaking animations and dirt particles for each destroyed tile
                                destroyedTiles.forEach(tile => {
                                    // Create breaking animation (Minecraft-style)
                                    const breakingEffect = new PlatformBreakingEffect(
                                        tile.pixelX, 
                                        tile.pixelY, 
                                        window.TILE_SIZE, 
                                        window.TILE_SIZE
                                    );
                                    platformBreakingEffects.push(breakingEffect);
                                    
                                    // Find which platform this tile belongs to and mark it for destruction
                                    for (let platform of platforms) {
                                        if (platform.color !== '#228B22' && !platform.destroyed) {
                                            if (tile.pixelX >= platform.x && tile.pixelX < platform.x + platform.width &&
                                                tile.pixelY >= platform.y && tile.pixelY < platform.y + platform.height) {
                                                destroyedPlatforms.add(platform);
                                            }
                                        }
                                    }
                                    
                                    // After a short delay, create falling dirt tile
                                    setTimeout(() => {
                                        const dirtTile = new DirtTile(tile.pixelX, tile.pixelY);
                                        dirtTiles.push(dirtTile);
                                    }, 200); // Delay for breaking animation to play
                                });
                                
                                // Mark platforms as destroyed after dirt tiles are created
                                setTimeout(() => {
                                    destroyedPlatforms.forEach(platform => {
                                        platform.destroyed = true;
                                        platform.destructionTime = Date.now();
                                    });
                                }, 400); // Wait for breaking animation and initial dirt creation
                            }
                        }
                    }
                    
                    this.velocityY = 0;
                    // Detect landing transition (was in air, now landing)
                    if (!this.prevOnGround) {
                        this.landingFrame = this.landingDuration; // Start landing animation
                    }
                    this.onGround = true;
                    // Reset ground slam when landing
                    this.groundSlamming = false;
                    this.slamChargeTime = 0;
                    this.slamAnimationFrame = 0;
                }
                // Bottom collision (hitting platform from below)
                else if (this.velocityY < 0 && this.y - this.velocityY > platform.y + platform.height) {
                    this.y = platform.y + platform.height;
                    this.velocityY = 0;
                }
                // Side collisions
                else if (this.velocityX > 0) {
                    this.x = platform.x - this.width;
                    this.velocityX = 0;
                } else if (this.velocityX < 0) {
                    this.x = platform.x + platform.width;
                    this.velocityX = 0;
                }
            }
        }

        // Keep player in bounds (left side)
        if (this.x < 0) {
            this.x = 0;
            this.velocityX = 0;
        }

        // Fall detection (reset if too far down)
        if (this.y > 2000) {
            this.x = 100;
            this.y = 100;
            this.velocityY = 0;
            this.health = this.maxHealth; // Reset health on respawn
        }
    }
    
    takeDamage(amount = 1) {
        if (this.invincible || this.health <= 0) return false;
        
        this.health -= amount;
        this.invincible = true;
        this.invincibleTime = 0;
        this.damageFlash = 10;
        this.flinchOffset = 5; // Flinch animation
        
        // Update health display
        updateHealthDisplay();
        
        // Play damage sound
        playDamageSound();
        
        if (this.health <= 0) {
            // Player died
            this.health = 0;
            gameOver = true;
        }
        
        return true;
    }

    checkCollision(platform) {
        return this.x < platform.x + platform.width &&
               this.x + this.width > platform.x &&
               this.y < platform.y + platform.height &&
               this.y + this.height > platform.y;
    }

    draw() {
        internalCtx.save();
        // Round camera translation for pixel-perfect rendering
        internalCtx.translate(Math.floor(-cameraX / pixelScale), Math.floor(-cameraY / pixelScale));
        
        // Apply flinch offset
        internalCtx.translate(Math.round(this.flinchOffset / pixelScale), 0);
        
        // Get current state and sprite sheet
        const currentState = this.getCurrentState();
        const spriteSheet = this.spriteSheets[currentState];
        
        // Check if sprite sheet exists and is loaded
        if (spriteSheet && spriteSheet.complete && spriteSheet.naturalWidth > 0) {
            // Draw sprite frame from sprite sheet
            const frameX = this.animationFrame * this.frameWidth;
            const frameY = 0; // Assuming single row sprite sheets for now
            
            // Determine draw dimensions (respecting any transformations)
            // Use sprite dimensions for visual size, but center on collision box
            let drawWidth = this.spriteWidth;
            let drawHeight = this.spriteHeight;
            // Center sprite on collision box
            let drawX = this.x - (this.spriteWidth - this.width) / 2;
            let drawY = this.y - (this.spriteHeight - this.height) / 2;
            
            // Apply transformations for ground slam if needed
            if (this.groundSlamming && this.slamChargeTime < 5) {
                // Squash effect
                drawWidth = this.spriteWidth * 1.2;
                drawHeight = this.spriteHeight * 0.8;
                drawX = this.x - (this.spriteWidth - this.width) / 2 - (drawWidth - this.spriteWidth) / 2;
                drawY = this.y - (this.spriteHeight - this.height) / 2 + (this.spriteHeight - drawHeight);
            } else if (this.groundSlamming && this.velocityY > 5) {
                // Stretch effect while falling fast
                drawWidth = this.spriteWidth * 0.9;
                drawHeight = this.spriteHeight * 1.1;
                drawX = this.x - (this.spriteWidth - this.width) / 2 + (this.spriteWidth - drawWidth) / 2;
                drawY = this.y - (this.spriteHeight - this.height) / 2;
            }
            
            // Adjust y position to account for sprite padding/transparent space at bottom
            // Shift sprite up slightly so it doesn't sink into the ground
            const spriteYOffset = -2; // Pixels to shift sprite up (negative = up)
            drawY = drawY + spriteYOffset;
            
            // Apply horizontal flipping if moving left
            const needsFlip = this.direction === -1;
            if (needsFlip) {
                internalCtx.save();
                // Calculate center x position for flipping
                const centerX = (this.x + this.width / 2) / pixelScale;
                internalCtx.translate(centerX, 0);
                internalCtx.scale(-1, 1);
                internalCtx.translate(-centerX, 0);
            }
            
            // Apply damage flash tint if hurt
            if (currentState === 'hurt') {
                internalCtx.globalCompositeOperation = 'multiply';
                internalCtx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                internalCtx.fillRect(Math.round(drawX / pixelScale), Math.round(drawY / pixelScale), 
                                   Math.round(drawWidth / pixelScale), Math.round(drawHeight / pixelScale));
                internalCtx.globalCompositeOperation = 'source-over';
            }
            
            // Draw sprite frame
            internalCtx.drawImage(
                spriteSheet,
                frameX, frameY, this.frameWidth, this.frameHeight, // Source rectangle
                Math.round(drawX / pixelScale), Math.round(drawY / pixelScale), // Destination position
                Math.round(drawWidth / pixelScale), Math.round(drawHeight / pixelScale) // Destination size
            );
            
            // Restore flip transformation if applied
            if (needsFlip) {
                internalCtx.restore();
            }
        } else {
            // Fallback to red rectangle placeholder
            // Ground slam animation (squash effect during charge)
            let drawWidth = this.width;
            let drawHeight = this.height;
            let drawX = this.x;
            let drawY = this.y;
            
            if (this.groundSlamming && this.slamChargeTime < 5) {
                // Squash effect
                drawWidth = this.width * 1.2;
                drawHeight = this.height * 0.8;
                drawX = this.x - (drawWidth - this.width) / 2;
                drawY = this.y + (this.height - drawHeight);
            } else if (this.groundSlamming && this.velocityY > 5) {
                // Stretch effect while falling fast
                drawWidth = this.width * 0.9;
                drawHeight = this.height * 1.1;
                drawX = this.x + (this.width - drawWidth) / 2;
            }
            
            // Damage flash effect
            let drawColor = this.color;
            if (this.damageFlash > 0 || (this.invincible && Math.floor(this.invincibleTime / 3) % 2 === 0)) {
                drawColor = '#FF0000'; // Flash red when damaged
            }
            
            // Draw player body (pixelated)
            internalCtx.fillStyle = drawColor;
            internalCtx.fillRect(Math.round(drawX / pixelScale), Math.round(drawY / pixelScale), 
                               Math.round(drawWidth / pixelScale), Math.round(drawHeight / pixelScale));
            
            // Draw simple face
            internalCtx.fillStyle = '#000';
            const eyeOffsetX = (drawWidth - this.width) / 2;
            const eyeOffsetY = (this.height - drawHeight);
            internalCtx.fillRect(Math.round((drawX + 10 + eyeOffsetX) / pixelScale), 
                               Math.round((drawY + 15 + eyeOffsetY) / pixelScale), 
                               Math.round(8 / pixelScale), Math.round(8 / pixelScale)); // Left eye
            internalCtx.fillRect(Math.round((drawX + 22 + eyeOffsetX) / pixelScale), 
                               Math.round((drawY + 15 + eyeOffsetY) / pixelScale), 
                               Math.round(8 / pixelScale), Math.round(8 / pixelScale)); // Right eye
        }
        
        // Draw weapon during attack
        if (this.attacking) {
            const selectedItem = inventory.getSelectedItem();
            if (selectedItem && selectedItem.type === 'weapon') {
                const weaponType = selectedItem.data?.weaponType || 'sword';
                const isFused = selectedItem.data?.fused || false;
                
                // Calculate weapon position (in front of player)
                const playerCenterX = (this.x + this.width / 2) / pixelScale;
                const playerCenterY = (this.y + this.height / 2) / pixelScale;
                
                // Different base ranges per weapon type
                let baseRange = 30;
                if (weaponType === 'sword') baseRange = 35;
                else if (weaponType === 'axe') baseRange = 40;
                else if (weaponType === 'staff') baseRange = 45;
                else if (weaponType === 'dagger') baseRange = 25;
                
                const weaponLength = (baseRange + this.weaponExtension) / pixelScale;
                
                // Weapon angle relative to player direction
                const baseAngle = this.direction === 1 ? 0 : Math.PI;
                const finalAngle = baseAngle + this.weaponAngle;
                
                // Calculate weapon end position
                const weaponEndX = playerCenterX + Math.cos(finalAngle) * weaponLength;
                const weaponEndY = playerCenterY + Math.sin(finalAngle) * weaponLength;
                
                // Draw weapon based on type
                internalCtx.save();
                
                const w = WEAPON_TYPES[weaponType] || WEAPON_TYPES.sword;
                const weaponColor = w.color;
                const weaponWidth = w.width;
                const isInAttackPhase = this.attackTimer >= w.windup && this.attackTimer < w.windup + w.attack;
                
                // Draw attack trail/effect based on weapon type
                if (isInAttackPhase) {
                    if (weaponType === 'sword') {
                        // Slash trail - arc
                        internalCtx.globalAlpha = 0.4;
                        internalCtx.strokeStyle = weaponColor;
                        internalCtx.lineWidth = 5;
                        internalCtx.beginPath();
                        internalCtx.arc(playerCenterX, playerCenterY, weaponLength, 
                                      finalAngle - 0.4, finalAngle + 0.4);
                        internalCtx.stroke();
                        internalCtx.globalAlpha = 1;
                    } else if (weaponType === 'axe') {
                        // Overhead swing trail - wider arc
                        internalCtx.globalAlpha = 0.5;
                        internalCtx.strokeStyle = weaponColor;
                        internalCtx.lineWidth = 6;
                        internalCtx.beginPath();
                        internalCtx.arc(playerCenterX, playerCenterY, weaponLength, 
                                      finalAngle - 0.5, finalAngle + 0.5);
                        internalCtx.stroke();
                        internalCtx.globalAlpha = 1;
                    } else if (weaponType === 'staff') {
                        // Thrust trail - straight line with glow
                        internalCtx.globalAlpha = 0.3;
                        internalCtx.strokeStyle = '#9370DB';
                        internalCtx.lineWidth = 8;
                        internalCtx.beginPath();
                        internalCtx.moveTo(playerCenterX, playerCenterY);
                        internalCtx.lineTo(weaponEndX, weaponEndY);
                        internalCtx.stroke();
                        internalCtx.globalAlpha = 1;
                    } else if (weaponType === 'dagger') {
                        // Quick poke - small trail
                        internalCtx.globalAlpha = 0.3;
                        internalCtx.strokeStyle = weaponColor;
                        internalCtx.lineWidth = 3;
                        internalCtx.beginPath();
                        internalCtx.moveTo(playerCenterX, playerCenterY);
                        internalCtx.lineTo(weaponEndX, weaponEndY);
                        internalCtx.stroke();
                        internalCtx.globalAlpha = 1;
                    }
                }
                
                // Draw weapon shaft/handle
                internalCtx.strokeStyle = weaponColor;
                internalCtx.lineWidth = weaponWidth;
                internalCtx.beginPath();
                internalCtx.moveTo(playerCenterX, playerCenterY);
                internalCtx.lineTo(weaponEndX, weaponEndY);
                internalCtx.stroke();
                
                // Draw weapon tip/head based on type (more detailed)
                if (weaponType === 'sword') {
                    // Sword blade - longer, pointed
                    const bladeLength = 12 / pixelScale;
                    const bladeEndX = weaponEndX + Math.cos(finalAngle) * bladeLength;
                    const bladeEndY = weaponEndY + Math.sin(finalAngle) * bladeLength;
                    internalCtx.strokeStyle = weaponColor;
                    internalCtx.lineWidth = weaponWidth;
                    internalCtx.beginPath();
                    internalCtx.moveTo(weaponEndX, weaponEndY);
                    internalCtx.lineTo(bladeEndX, bladeEndY);
                    internalCtx.stroke();
                    // Pointed tip
                    internalCtx.fillStyle = weaponColor;
                    internalCtx.beginPath();
                    internalCtx.arc(bladeEndX, bladeEndY, 2 / pixelScale, 0, Math.PI * 2);
                    internalCtx.fill();
                } else if (weaponType === 'axe') {
                    // Axe head - larger, more visible
                    const axeHeadSize = 8 / pixelScale;
                    internalCtx.fillStyle = weaponColor;
                    internalCtx.beginPath();
                    // Triangle pointing in attack direction
                    const tipX = weaponEndX + Math.cos(finalAngle) * axeHeadSize;
                    const tipY = weaponEndY + Math.sin(finalAngle) * axeHeadSize;
                    const leftX = weaponEndX + Math.cos(finalAngle + Math.PI / 2) * axeHeadSize * 0.6;
                    const leftY = weaponEndY + Math.sin(finalAngle + Math.PI / 2) * axeHeadSize * 0.6;
                    const rightX = weaponEndX + Math.cos(finalAngle - Math.PI / 2) * axeHeadSize * 0.6;
                    const rightY = weaponEndY + Math.sin(finalAngle - Math.PI / 2) * axeHeadSize * 0.6;
                    internalCtx.moveTo(tipX, tipY);
                    internalCtx.lineTo(leftX, leftY);
                    internalCtx.lineTo(rightX, rightY);
                    internalCtx.closePath();
                    internalCtx.fill();
                    // Axe edge highlight
                    internalCtx.strokeStyle = '#654321';
                    internalCtx.lineWidth = 1;
                    internalCtx.beginPath();
                    internalCtx.moveTo(tipX, tipY);
                    internalCtx.lineTo(leftX, leftY);
                    internalCtx.stroke();
                    internalCtx.beginPath();
                    internalCtx.moveTo(tipX, tipY);
                    internalCtx.lineTo(rightX, rightY);
                    internalCtx.stroke();
                } else if (weaponType === 'staff') {
                    // Staff - longer shaft with orb at end
                    const staffShaftLength = 20 / pixelScale;
                    const staffEndX = weaponEndX + Math.cos(finalAngle) * staffShaftLength;
                    const staffEndY = weaponEndY + Math.sin(finalAngle) * staffShaftLength;
                    // Draw shaft
                    internalCtx.strokeStyle = weaponColor;
                    internalCtx.lineWidth = weaponWidth;
                    internalCtx.beginPath();
                    internalCtx.moveTo(weaponEndX, weaponEndY);
                    internalCtx.lineTo(staffEndX, staffEndY);
                    internalCtx.stroke();
                    // Staff orb at tip
                    internalCtx.fillStyle = '#9370DB';
                    internalCtx.beginPath();
                    internalCtx.arc(staffEndX, staffEndY, 5 / pixelScale, 0, Math.PI * 2);
                    internalCtx.fill();
                    // Orb glow
                    internalCtx.globalAlpha = 0.6;
                    internalCtx.fillStyle = '#BA55D3';
                    internalCtx.beginPath();
                    internalCtx.arc(staffEndX, staffEndY, 3 / pixelScale, 0, Math.PI * 2);
                    internalCtx.fill();
                    internalCtx.globalAlpha = 1;
                } else if (weaponType === 'dagger') {
                    // Dagger - short blade
                    const bladeLength = 8 / pixelScale;
                    const bladeEndX = weaponEndX + Math.cos(finalAngle) * bladeLength;
                    const bladeEndY = weaponEndY + Math.sin(finalAngle) * bladeLength;
                    internalCtx.strokeStyle = weaponColor;
                    internalCtx.lineWidth = weaponWidth;
                    internalCtx.beginPath();
                    internalCtx.moveTo(weaponEndX, weaponEndY);
                    internalCtx.lineTo(bladeEndX, bladeEndY);
                    internalCtx.stroke();
                    // Small pointed tip
                    internalCtx.fillStyle = weaponColor;
                    internalCtx.beginPath();
                    internalCtx.arc(bladeEndX, bladeEndY, 1.5 / pixelScale, 0, Math.PI * 2);
                    internalCtx.fill();
                }
                
                // Fused weapon glow
                if (isFused) {
                    internalCtx.globalAlpha = 0.6;
                    internalCtx.strokeStyle = '#FFD700';
                    internalCtx.lineWidth = weaponWidth + 1;
                    internalCtx.beginPath();
                    internalCtx.moveTo(playerCenterX, playerCenterY);
                    internalCtx.lineTo(weaponEndX, weaponEndY);
                    internalCtx.stroke();
                    // Golden particles/sparkles
                    internalCtx.globalAlpha = 0.8;
                    internalCtx.fillStyle = '#FFD700';
                    for (let i = 0; i < 3; i++) {
                        const sparkX = weaponEndX + (Math.random() - 0.5) * 4 / pixelScale;
                        const sparkY = weaponEndY + (Math.random() - 0.5) * 4 / pixelScale;
                        internalCtx.beginPath();
                        internalCtx.arc(sparkX, sparkY, 1 / pixelScale, 0, Math.PI * 2);
                        internalCtx.fill();
                    }
                    internalCtx.globalAlpha = 1;
                }
                
                internalCtx.restore();
            }
        }
        
        internalCtx.restore();
    }
}

// Platform Class - Now uses tiles

console.log('classes/player.js loaded successfully');
