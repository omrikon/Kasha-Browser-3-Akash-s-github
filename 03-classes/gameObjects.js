// ============================================================================
// CLASSES/GAMEOBJECTS.JS - Game Object Classes
// ============================================================================
// This file contains classes for various game objects that exist in the world:
// - Platform: The ground and platforms you can jump on
// - Box: Question mark boxes that contain kashaballs (break them to get items)
// - Kashaball: The throwing items you use to catch kashas (like pokeballs)
// - KashaCorpse: Dead kashas that you can extract cores from
// Each class handles its own behavior, collision detection, and drawing.
// ============================================================================

// This message appears in the browser console when the file loads
console.log('Loading classes/gameObjects.js...');

class Platform {
    constructor(x, y, width, height, color = '#8B4513') {
        this.x = x; // Pixel position
        this.y = y; // Pixel position
        this.width = width; // Pixel width
        this.height = height; // Pixel height
        this.color = color;
        this.destroyed = false; // Whether platform has been destroyed by ground slam
        this.destructionTime = 0; // When platform was destroyed (for fade out)
        
        // Tile-based properties
        this.tileX = window.worldMap ? window.worldMap.pixelToTile(x) : Math.floor(x / window.TILE_SIZE);
        this.tileY = window.worldMap ? window.worldMap.pixelToTile(y) : Math.floor(y / window.TILE_SIZE);
        this.tileWidth = Math.ceil(width / window.TILE_SIZE);
        this.tileHeight = Math.ceil(height / window.TILE_SIZE);
        
        // Register this platform in the tile map
        this.registerInTileMap();
    }
    
    // Register platform tiles in the world map
    registerInTileMap() {
        if (!window.worldMap) return;
        
        // Ground platforms (green) are SOLID (indestructible)
        // Other platforms are PLATFORM (destructible by ground slam)
        const tileType = this.color === '#228B22' ? window.TILE_TYPE.SOLID : window.TILE_TYPE.PLATFORM;
        
        for (let ty = 0; ty < this.tileHeight; ty++) {
            for (let tx = 0; tx < this.tileWidth; tx++) {
                window.worldMap.setTile(this.tileX + tx, this.tileY + ty, tileType);
            }
        }
    }

    draw() {
        // Don't draw if platform is destroyed and has dirt tiles
        if (this.destroyed) {
            return; // Platform has dissipated after destruction
        }
        
        internalCtx.save();
        internalCtx.translate(Math.floor(-cameraX / pixelScale), Math.floor(-cameraY / pixelScale));
        
        // Platform body (pixelated) - draw as tiles
        internalCtx.fillStyle = this.color;
        
        // Draw tile by tile for crisp pixel art
        for (let ty = 0; ty < this.tileHeight; ty++) {
            for (let tx = 0; tx < this.tileWidth; tx++) {
                const pixelX = this.x + tx * window.TILE_SIZE;
                const pixelY = this.y + ty * window.TILE_SIZE;
                
                // Only draw if within platform bounds
                if (pixelX < this.x + this.width && pixelY < this.y + this.height) {
                    const drawWidth = Math.min(window.TILE_SIZE, this.x + this.width - pixelX);
                    const drawHeight = Math.min(window.TILE_SIZE, this.y + this.height - pixelY);
                    
                    internalCtx.fillRect(
                        Math.round(pixelX / pixelScale), 
                        Math.round(pixelY / pixelScale),
                        Math.round(drawWidth / pixelScale),
                        Math.round(drawHeight / pixelScale)
                    );
                }
            }
        }
        
        // Platform top highlight
        internalCtx.fillStyle = '#A0522D';
        const highlightHeight = Math.min(5, this.height);
        internalCtx.fillRect(Math.round(this.x / pixelScale), Math.round(this.y / pixelScale), 
                           Math.round(this.width / pixelScale), Math.round(highlightHeight / pixelScale));
        
        internalCtx.restore();
    }
}
// Box Class (contains kashaballs) - Now uses tiles
class Box {
    constructor(x, y) {
        this.x = x; // Pixel position
        this.y = y; // Pixel position
        this.width = 40;
        this.height = 40;
        this.hit = false;
        this.kashaballReleased = false;
        
        // Tile-based properties
        this.tileX = 0;
        this.tileY = 0;
        this.tileWidth = Math.ceil(this.width / window.TILE_SIZE);
        this.tileHeight = Math.ceil(this.height / window.TILE_SIZE);
        
        // Update tile position
        if (window.worldMap) {
            this.tileX = window.worldMap.pixelToTile(x);
            this.tileY = window.worldMap.pixelToTile(y);
        }
    }
    
    // Update tile position
    updateTilePosition() {
        if (window.worldMap) {
            this.tileX = window.worldMap.pixelToTile(this.x);
            this.tileY = window.worldMap.pixelToTile(this.y);
        }
    }

    checkHit(player) {
        if (this.hit) return false;
        
        // Check if player hits from below
        // Player must be horizontally overlapping with box (with some margin)
        const horizontalOverlap = player.x + player.width > this.x + 5 && 
                                  player.x < this.x + this.width - 5;
        
        // Player's top should be hitting the box's bottom
        // More forgiving range for easier hitting
        const boxBottom = this.y + this.height;
        const hittingFromBelow = player.y <= boxBottom + 10 && 
                                 player.y + player.height >= boxBottom - 20;
        
        // Player should be moving upward
        const movingUp = player.velocityY < 0;
        
        if (horizontalOverlap && hittingFromBelow && movingUp) {
            this.hit = true;
            this.kashaballReleased = true;
            return true;
        }
        return false;
    }

    draw() {
        internalCtx.save();
        internalCtx.translate(Math.floor(-cameraX / pixelScale), Math.floor(-cameraY / pixelScale));
        
        if (!this.hit) {
            // Draw box (pixelated)
            internalCtx.fillStyle = '#D4A574';
            internalCtx.fillRect(Math.round(this.x / pixelScale), Math.round(this.y / pixelScale), 
                               Math.round(this.width / pixelScale), Math.round(this.height / pixelScale));
            
            // Box border
            internalCtx.strokeStyle = '#8B4513';
            internalCtx.lineWidth = 1;
            internalCtx.strokeRect(Math.round(this.x / pixelScale), Math.round(this.y / pixelScale), 
                                 Math.round(this.width / pixelScale), Math.round(this.height / pixelScale));
            
            // Question mark
            internalCtx.fillStyle = '#FFD700';
            internalCtx.font = `bold ${Math.round(24 / pixelScale)}px Arial`;
            internalCtx.textAlign = 'center';
            internalCtx.fillText('?', Math.round((this.x + this.width / 2) / pixelScale), 
                                Math.round((this.y + this.height / 2 + 8) / pixelScale));
        } else {
            // Draw broken box
            internalCtx.fillStyle = '#8B4513';
            internalCtx.fillRect(Math.round(this.x / pixelScale), Math.round((this.y + 20) / pixelScale), 
                               Math.round(this.width / pixelScale), Math.round(20 / pixelScale));
        }
        
        internalCtx.restore();
    }
}
// Kashaball Class - Now uses tiles
class Kashaball {
    constructor(x, y, thrown = false) {
        this.x = x; // Pixel position
        this.y = y; // Pixel position
        this.width = 25;
        this.height = 25;
        this.collected = false;
        this.rotation = 0;
        this.bounceDamping = 0.7; // Energy loss on bounce
        this.onGround = false;
        this.thrown = thrown; // Whether this kashaball was thrown by player
        this.throwTime = 0; // Time since thrown (to prevent immediate collection
        this.invincible = !thrown; // Box kashaballs start invincible
        this.invincibleTime = 0; // Time invincible
        this.lastBounceTime = 0; // Track bounce sounds
        
        // Whether this pokeball contains a caught kasha (unique capture)
        this.hasKasha = false;
        this.kashaType = null;  // e.g. 'cassieduck'
        this.kashaName = null;  // for future use (nickname, etc.)
        this.kashaData = null;  // arbitrary metadata about the caught kasha
        
        // Tile-based properties
        this.tileX = 0;
        this.tileY = 0;
        this.tileWidth = Math.ceil(this.width / window.TILE_SIZE);
        this.tileHeight = Math.ceil(this.height / window.TILE_SIZE);
        
        // Bounce out with random horizontal velocity (if not thrown)
        if (!this.thrown) {
            this.velocityX = (Math.random() - 0.5) * 8; // Random direction, -4 to 4
            this.velocityY = -6; // Pop up initially
        }
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

    update(platforms) {
        if (this.collected) return;
        
        // Increment timers
        if (this.thrown) {
            this.throwTime++;
        }
        if (this.invincible) {
            this.invincibleTime++;
            // Invincibility lasts 60 frames (1 second at 60fps)
            if (this.invincibleTime > 60) {
                this.invincible = false;
            }
        }
        
        // Apply gravity
        this.velocityY += 0.5;
        
        // Store previous position for collision resolution
        const prevX = this.x;
        const prevY = this.y;
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Update tile position
        this.updateTilePosition();
        
        // Collision with tiles
        this.onGround = false;
        
        // Collision with platforms (keeping platform-based collision for stability)
        this.onGround = false;
        
        for (let platform of platforms) {
            if (this.checkCollision(platform)) {
                // Top collision (landing on platform)
                if (this.velocityY > 0 && this.y - this.velocityY < platform.y) {
                    this.y = platform.y - this.height;
                    const wasBouncing = Math.abs(this.velocityY) > 2;
                    this.velocityY *= -this.bounceDamping; // Bounce up with energy loss
                    if (Math.abs(this.velocityY) < 1) {
                        this.velocityY = 0; // Stop bouncing if too small
                    }
                    this.onGround = true;
                    
                    // Play bounce sound if significant bounce
                    if (wasBouncing && this.invincibleTime > 5) {
                        // Only play bounce sound if enough time has passed since last bounce
                        if (this.invincibleTime - this.lastBounceTime > 10) {
                            playBounceSound();
                            this.lastBounceTime = this.invincibleTime;
                        }
                    }
                }
                // Bottom collision (hitting platform from below)
                else if (this.velocityY < 0 && this.y - this.velocityY > platform.y + platform.height) {
                    this.y = platform.y + platform.height;
                    this.velocityY *= -this.bounceDamping;
                }
                // Side collisions (bounce off sides)
                else if (this.velocityX > 0) {
                    this.x = platform.x - this.width;
                    this.velocityX *= -this.bounceDamping;
                } else if (this.velocityX < 0) {
                    this.x = platform.x + platform.width;
                    this.velocityX *= -this.bounceDamping;
                }
            }
        }
        
        // Apply friction when on ground
        if (this.onGround) {
            this.velocityX *= 0.9;
            if (Math.abs(this.velocityX) < 0.5) {
                this.velocityX = 0;
            }
        }
        
        // Rotate based on movement
        this.rotation += Math.abs(this.velocityX) * 0.1 + Math.abs(this.velocityY) * 0.1;
        
        // Stop if velocity is very small and on ground
        if (this.onGround && Math.abs(this.velocityX) < 0.1 && Math.abs(this.velocityY) < 0.1) {
            this.velocityX = 0;
            this.velocityY = 0;
        }
    }

    checkCollection(player) {
        if (this.collected) return false;
        
        // Don't collect immediately after being thrown (prevent self-collection)
        if (this.thrown && this.throwTime < 30) return false;
        
        // Don't collect if invincible (box kashaballs), BUT caught kasha pokeballs should always be collectible
        if (this.invincible && !this.hasKasha) return false;
        
        // Check collision
        const colliding = player.x < this.x + this.width &&
            player.x + player.width > this.x &&
            player.y < this.y + this.height &&
            player.y + player.height > this.y;
        
        if (colliding) {
            console.log('Kashaball collision detected!', {
                hasKasha: this.hasKasha,
                kashaType: this.kashaType,
                invincible: this.invincible,
                thrown: this.thrown
            });
            
            this.collected = true;
            
            // Trigger player pickup animation
            player.pickingUp = true;
            player.pickupFrame = player.pickupDuration;
            
            // If this pokeball contains a caught kasha, add a unique item to inventory
            if (this.hasKasha) {
                console.log('Adding caught kasha to inventory:', {
                    type: this.kashaType,
                    name: this.kashaName,
                    data: this.kashaData
                });
                inventory.addItem('kasha', 1, {
                    type: this.kashaType,
                    name: this.kashaName,
                    data: this.kashaData
                });
                console.log('Inventory after adding kasha:', inventory.items);
                
                // No change to empty pokeball count here; this is a separate inventory category
            } else {
                // Normal empty kashaball pickup (stackable)
                inventory.addItem('kashaball', 1);
                
                // Update UI (keep for compatibility)
                kashaballsCollected = inventory.getItemCount('kashaball');
                kashaballCountElement.textContent = kashaballsCollected;
            }
            
            playCollectSound();
            return true;
        }
        return false;
    }

    draw() {
        if (this.collected) return;
        
        internalCtx.save();
        internalCtx.translate(Math.floor(-cameraX / pixelScale), Math.floor(-cameraY / pixelScale));
        internalCtx.translate((this.x + this.width / 2) / pixelScale, (this.y + this.height / 2) / pixelScale);
        internalCtx.rotate(this.rotation);
        
        // Draw kashaball (pixelated) - reversed colors: white on top, red on bottom
        const radius = (this.width / 2) / pixelScale;
        // Top half (white)
        internalCtx.fillStyle = '#FFFFFF';
        internalCtx.beginPath();
        internalCtx.arc(0, 0, radius, Math.PI, 0, false);
        internalCtx.fill();
        
        // Bottom half (red)
        internalCtx.fillStyle = '#FF0000';
        internalCtx.beginPath();
        internalCtx.arc(0, 0, radius, 0, Math.PI, false);
        internalCtx.fill();
        
        // Center line
        internalCtx.strokeStyle = '#000';
        internalCtx.lineWidth = 1;
        internalCtx.beginPath();
        internalCtx.moveTo(-radius, 0);
        internalCtx.lineTo(radius, 0);
        internalCtx.stroke();
        
        // Center circle
        internalCtx.fillStyle = '#000';
        internalCtx.beginPath();
        internalCtx.arc(0, 0, 5 / pixelScale, 0, Math.PI * 2);
        internalCtx.fill();
        
        internalCtx.restore();
    }
}

class KashaCorpse {
    constructor(x, y, kashaData) {
        this.x = x; // Pixel position
        this.y = y; // Pixel position
        this.width = 30;
        this.height = 35;
        this.kashaData = kashaData; // { type, name, data }
        this.extracted = false; // Whether core has been extracted
        this.extractionTime = 0; // Time since death (for fade out)
        this.maxExtractionTime = 1800; // 30 seconds at 60fps
        this.pulseAnimation = 0; // For visual indicator
    }
    
    update() {
        if (this.extracted) return;
        
        this.extractionTime++;
        this.pulseAnimation++;
        
        // Fade out after max time
        if (this.extractionTime >= this.maxExtractionTime) {
            this.extracted = true;
        }
    }
    
    checkPlayerInteraction(player) {
        if (this.extracted) return false;
        
        // Check if player is near (within 50 pixels)
        const distance = Math.sqrt(
            Math.pow(player.x + player.width / 2 - (this.x + this.width / 2), 2) +
            Math.pow(player.y + player.height / 2 - (this.y + this.height / 2), 2)
        );
        
        return distance < 50;
    }
    
    extractCore() {
        if (this.extracted) return null;
        
        this.extracted = true;
        
        // Return core data for inventory
        return {
            kashaType: this.kashaData.type,
            kashaName: this.kashaData.name || 'Kasha',
            abilities: this.kashaData.data?.abilities || []
        };
    }
    
    draw() {
        if (this.extracted) return;
        
        internalCtx.save();
        internalCtx.translate(Math.floor(-cameraX / pixelScale), Math.floor(-cameraY / pixelScale));
        
        // Fade out over time
        const fadeProgress = this.extractionTime / this.maxExtractionTime;
        const alpha = 1 - fadeProgress * 0.7; // Fade to 30% opacity
        internalCtx.globalAlpha = alpha;
        
        // Pulse effect for extractable indicator
        const pulse = Math.sin(this.pulseAnimation * 0.1) * 0.2 + 1;
        
        // Draw corpse (simplified Kasha shape, grayed out)
        const centerX = (this.x + this.width / 2) / pixelScale;
        const centerY = (this.y + this.height / 2) / pixelScale;
        
        // Draw grayed out body
        internalCtx.fillStyle = '#666666';
        internalCtx.beginPath();
        internalCtx.ellipse(centerX, centerY, 
                          (this.width / 2) / pixelScale * pulse, 
                          (this.height / 2.5) / pixelScale * pulse, 
                          0, 0, Math.PI * 2);
        internalCtx.fill();
        
        // Draw core glow indicator (pulsing)
        if (this.extractionTime < this.maxExtractionTime * 0.8) {
            const glowAlpha = (Math.sin(this.pulseAnimation * 0.15) + 1) / 2 * 0.5;
            internalCtx.globalAlpha = glowAlpha * alpha;
            internalCtx.fillStyle = '#FFD700';
            internalCtx.beginPath();
            internalCtx.arc(centerX, centerY - 5 / pixelScale, 8 / pixelScale, 0, Math.PI * 2);
            internalCtx.fill();
        }
        
        internalCtx.globalAlpha = 1;
        internalCtx.restore();
    }
}

console.log('classes/gameObjects.js loaded successfully');
