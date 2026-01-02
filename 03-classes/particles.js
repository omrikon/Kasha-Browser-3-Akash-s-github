// ============================================================================
// CLASSES/PARTICLES.JS - Particle Classes
// ============================================================================
// This file contains classes for particle effects like falling dirt tiles.
// ============================================================================

console.log('Loading classes/particles.js...');

// Dirt Tile Particle - Falls with gravity and converts to tile when settled
class DirtTile {
    constructor(x, y, initialVelocityX = null, initialVelocityY = null) {
        this.x = x; // Pixel position
        this.y = y; // Pixel position
        this.width = window.TILE_SIZE;
        this.height = window.TILE_SIZE;
        
        // Use provided velocities if given (from ground slam), otherwise use random spread
        if (initialVelocityX !== null && initialVelocityY !== null) {
            this.velocityX = initialVelocityX;
            this.velocityY = initialVelocityY;
        } else {
            this.velocityX = (Math.random() - 0.5) * 0.8; // Reduced horizontal spread (dirt doesn't fly far)
            this.velocityY = -0.5 - Math.random() * 0.5; // Small upward pop, then fall
        }
        
        this.gravity = 0.6;
        this.onGround = false;
        this.active = true;
        this.color = '#8B4513'; // Brown dirt color
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1; // Slower rotation
        this.settledFrames = 0; // Track how long dirt has been settled
        this.convertedToTile = false; // Whether this particle has been converted to a tile
        this.requiredSettleFrames = 30; // Frames dirt must be settled before converting (0.5 seconds at 60fps)
    }
    
    update(platforms) {
        if (!this.active) return;
        
        // Always apply gravity unless truly on ground (prevents floating)
        if (!this.onGround || this.velocityY < 0) {
            this.velocityY += this.gravity;
        }
        
        // Store previous position for collision detection
        const prevY = this.y;
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Rotate (slower when on ground)
        if (this.onGround) {
            this.rotation += this.rotationSpeed * 0.3; // Much slower rotation on ground
        } else {
            this.rotation += this.rotationSpeed;
        }
        
        // Check collision with platforms/ground
        this.onGround = false;
        
        // Check if hit solid ground tiles - check multiple points along bottom edge
        if (window.worldMap) {
            const bottomY = this.y + this.height;
            const bottomTileY = window.worldMap.pixelToTile(bottomY);
            
            // Check left, center, and right points along bottom edge
            const leftTileX = window.worldMap.pixelToTile(this.x);
            const centerTileX = window.worldMap.pixelToTile(this.x + this.width / 2);
            const rightTileX = window.worldMap.pixelToTile(this.x + this.width);
            
            let hitGround = false;
            let groundPixelY = 0;
            
            // Check all three points
            for (let checkX of [leftTileX, centerTileX, rightTileX]) {
                const tileType = window.worldMap.getTile(checkX, bottomTileY);
                
                if (tileType === window.TILE_TYPE.SOLID || tileType === window.TILE_TYPE.PLATFORM || tileType === window.TILE_TYPE.DIRT) {
                    hitGround = true;
                    groundPixelY = window.worldMap.tileToPixel(bottomTileY);
                    break;
                }
            }
            
            if (hitGround && this.velocityY >= 0) {
                // Land on solid ground
                this.y = groundPixelY - this.height;
                this.velocityY = 0;
                // High friction for dirt - stops quickly
                this.velocityX *= 0.3; // 70% friction (dirt doesn't slide much)
                this.onGround = true;
                if (Math.abs(this.velocityX) < 0.3) { // Higher threshold - dirt stops sooner
                    this.velocityX = 0;
                    this.rotationSpeed *= 0.5; // Stop rotation when stopped
                }
            }
        }
        
        // Check collision with platforms (fallback) - only if not already on ground
        if (!this.onGround) {
            for (let platform of platforms) {
                if (platform.color === '#228B22' && !platform.destroyed) { // Only solid ground, not destroyed
                    if (this.x < platform.x + platform.width &&
                        this.x + this.width > platform.x &&
                        this.y < platform.y + platform.height &&
                        this.y + this.height > platform.y) {
                        
                        if (this.velocityY > 0 && prevY + this.height <= platform.y) {
                            // Land on top
                            this.y = platform.y - this.height;
                            this.velocityY = 0;
                            // High friction for dirt
                            this.velocityX *= 0.3; // 70% friction
                            this.onGround = true;
                            if (Math.abs(this.velocityX) < 0.3) {
                                this.velocityX = 0;
                                this.rotationSpeed *= 0.5;
                            }
                        }
                    }
                }
            }
        }
        
        // Stop at screen bottom (can't sink below)
        const screenBottom = canvas.height * pixelScale; // Bottom of world in pixel coordinates
        if (this.y + this.height > screenBottom) {
            this.y = screenBottom - this.height;
            this.velocityY = 0;
            // High friction on screen bottom
            this.velocityX *= 0.3; // 70% friction
            this.onGround = true;
            if (Math.abs(this.velocityX) < 0.3) {
                this.velocityX = 0;
                this.rotationSpeed *= 0.5;
            }
        }
        
        // Apply additional friction when on ground (dirt settles)
        if (this.onGround) {
            this.velocityX *= 0.5; // Extra friction per frame when on ground
            if (Math.abs(this.velocityX) < 0.2) {
                this.velocityX = 0;
            }
        }
        
        // Track settled state - dirt is settled if on ground, no velocity, and not moving
        if (this.onGround && Math.abs(this.velocityX) < 0.1 && Math.abs(this.velocityY) < 0.1) {
            this.settledFrames++;
        } else {
            this.settledFrames = 0; // Reset if moved
        }
        
        // Convert to tile when settled for required frames
        if (!this.convertedToTile && this.settledFrames >= this.requiredSettleFrames && window.worldMap) {
            const tileX = window.worldMap.pixelToTile(this.x + this.width / 2);
            const tileY = window.worldMap.pixelToTile(this.y + this.height / 2);
            
            // Only convert if the tile space is empty (don't overwrite existing tiles)
            const existingTile = window.worldMap.getTile(tileX, tileY);
            if (existingTile === window.TILE_TYPE.EMPTY) {
                window.worldMap.setTile(tileX, tileY, window.TILE_TYPE.DIRT);
                this.convertedToTile = true;
                this.active = false; // Remove particle after converting to tile
            } else {
                // If space is occupied, just remove the particle
                this.active = false;
            }
        }
        
        // Deactivate if off screen for too long (cleanup)
        if (this.y > screenBottom + 200) {
            this.active = false;
        }
    }
    
    draw() {
        if (!this.active) return;
        
        internalCtx.save();
        internalCtx.translate(Math.floor(-cameraX / pixelScale), Math.floor(-cameraY / pixelScale));
        internalCtx.translate(
            Math.round((this.x + this.width / 2) / pixelScale),
            Math.round((this.y + this.height / 2) / pixelScale)
        );
        internalCtx.rotate(this.rotation);
        
        // Draw dirt tile (pixelated)
        internalCtx.fillStyle = this.color;
        internalCtx.fillRect(
            Math.round(-this.width / 2 / pixelScale),
            Math.round(-this.height / 2 / pixelScale),
            Math.round(this.width / pixelScale),
            Math.round(this.height / pixelScale)
        );
        
        // Draw dirt texture (simple pattern)
        internalCtx.fillStyle = '#654321';
        const patternSize = Math.round(4 / pixelScale);
        for (let i = 0; i < 4; i++) {
            const offsetX = (Math.sin(i) * 3) / pixelScale;
            const offsetY = (Math.cos(i) * 3) / pixelScale;
            internalCtx.fillRect(
                Math.round(-this.width / 2 / pixelScale + offsetX),
                Math.round(-this.height / 2 / pixelScale + offsetY),
                patternSize,
                patternSize
            );
        }
        
        internalCtx.restore();
    }
}
console.log('classes/particles.js loaded successfully');
