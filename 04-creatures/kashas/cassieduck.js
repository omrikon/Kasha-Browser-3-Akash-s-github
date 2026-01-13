// ============================================================================
// CASSIEDUCK.JS - CassieDuck Kasha Class
// ============================================================================
// This file contains the CassieDuck class - a type of Kasha (catchable creature).
// Kashas are like Pokemon - you can catch them by throwing kashaballs at them.
// The CassieDuck waddles around the level, and when hit by a kashaball, it
// enters a catching animation. Once caught, it becomes an item in your
// inventory. This is one type of kasha - more types can be added in the future!
// ============================================================================

// Cassieduck Class - A type of Kasha (catchable NPC) - Now uses tiles
class CassieDuck {
    constructor(x, y) {
        this.x = x; // Pixel position
        this.y = y; // Pixel position
        this.width = 30;
        this.height = 35;
        this.velocityX = -1;
        this.velocityY = 0;
        this.speed = 1;
        this.onGround = false;
        this.gravity = 0.5;
        this.direction = -1;
        this.startX = x;
        this.patrolDistance = 80;
        this.type = 'cassieduck'; // Type identifier for this kasha
        this.caught = false;
        this.waddleFrame = 0;
        this.inPokeball = false;
        this.catchProgress = 0; // 0-100, how close to being caught
        this.ownedByPlayer = false; // Whether this Kasha is owned by the player (from inventory)
        this.inventoryId = null; // ID of the inventory item if owned
        this.health = 1; // Health for future battle system
        this.maxHealth = 1;
        this.dead = false; // Death state
        
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

    update(platforms, kashaballs) {
        if (this.caught) return; // Only return if fully caught, not during catching animation
        
        // Catching animation - handle this first so it can still update even after being hit
        if (this.inPokeball) {
            this.catchProgress += 2;
            if (this.catchProgress >= 100) {
                // Catch completed - convert to unique kasha-in-ball item
                this.caught = true;
                this.inPokeball = false;
                kashasCaught++;
                kashaCountElement.textContent = kashasCaught;
                
                // Spawn a special pokeball on the ground that contains this kasha
                // Player can pick it up and it will become a unique inventory item
                const capturedBall = new Kashaball(this.x, this.y, false);
                capturedBall.hasKasha = true;
                capturedBall.kashaType = this.type; // e.g. 'cassieduck'
                capturedBall.kashaName = 'Kasha'; // Placeholder name; can be customized later
                capturedBall.kashaData = {
                    type: this.type
                    // Additional per-kasha data could be stored here
                };
                // Make caught kasha pokeballs collectible immediately (not invincible like box kashaballs)
                capturedBall.invincible = false;
                capturedBall.invincibleTime = 0;
                // Ensure it has velocity to fall and be visible
                if (!capturedBall.velocityX) capturedBall.velocityX = 0;
                if (!capturedBall.velocityY) capturedBall.velocityY = 0;
                console.log('Created caught kasha pokeball:', {
                    x: capturedBall.x,
                    y: capturedBall.y,
                    hasKasha: capturedBall.hasKasha,
                    kashaType: capturedBall.kashaType,
                    invincible: capturedBall.invincible
                });
                kashaballs.push(capturedBall);
            }
            return; // Don't do normal movement while being caught
        }
        
        // Waddling animation
        this.waddleFrame++;
        
        // Simple patrol AI - waddle back and forth
        if (Math.abs(this.x - this.startX) > this.patrolDistance) {
            this.direction *= -1;
        }
        
        this.velocityX = this.speed * this.direction;
        
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
        
        // Check if hit by kashaball
        for (let kashaball of kashaballs) {
            if (kashaball.collected || kashaball.invincible) continue;
            
            if (this.x < kashaball.x + kashaball.width &&
                this.x + this.width > kashaball.x &&
                this.y < kashaball.y + kashaball.height &&
                this.y + this.height > kashaball.y) {
                // Hit by kashaball - start catching process
                this.inPokeball = true;
                kashaball.collected = true; // Remove the thrown pokeball from the world
                this.catchProgress = 0;
                playCollectSound(); // Use collect sound for catch
            }
        }
    }

    draw() {
        if (this.caught) return;
        
        internalCtx.save();
        internalCtx.translate(Math.floor(-cameraX / pixelScale), Math.floor(-cameraY / pixelScale));
        
        if (this.inPokeball) {
            // Draw kashaball with kasha inside (catching animation)
            const progress = this.catchProgress / 100;
            const scale = 1 - progress * 0.5;
            
            internalCtx.translate((this.x + this.width / 2) / pixelScale, (this.y + this.height / 2) / pixelScale);
            internalCtx.scale(scale, scale);
            
            // Draw kashaball as blue triangle (pixelated)
            const size = 15 / pixelScale;
            
            // Draw triangle (blue)
            internalCtx.fillStyle = '#0000FF';
            internalCtx.beginPath();
            // Equilateral triangle pointing up
            internalCtx.moveTo(0, -size); // Top point
            internalCtx.lineTo(-size * 0.866, size * 0.5); // Bottom left (cos(30°) ≈ 0.866, sin(30°) = 0.5)
            internalCtx.lineTo(size * 0.866, size * 0.5); // Bottom right
            internalCtx.closePath();
            internalCtx.fill();
            
            // Triangle outline
            internalCtx.strokeStyle = '#000080';
            internalCtx.lineWidth = 1;
            internalCtx.stroke();
        } else {
            // Draw waddling Cassieduck (pixelated)
            const waddleOffset = Math.sin(this.waddleFrame * 0.2) * 2;
            
            // Cassieduck body (yellow)
            internalCtx.fillStyle = '#FFD700';
            internalCtx.beginPath();
            internalCtx.ellipse((this.x + this.width / 2) / pixelScale, 
                              (this.y + this.height / 2 + waddleOffset) / pixelScale, 
                              (this.width / 2) / pixelScale, (this.height / 2.5) / pixelScale, 
                              0, 0, Math.PI * 2);
            internalCtx.fill();
            
            // Cassieduck head
            internalCtx.fillStyle = '#FFD700';
            internalCtx.beginPath();
            internalCtx.arc((this.x + this.width / 2 + (this.direction * 8)) / pixelScale, 
                           (this.y + 8 + waddleOffset) / pixelScale, 
                           10 / pixelScale, 0, Math.PI * 2);
            internalCtx.fill();
            
            // Cassieduck bill (orange)
            internalCtx.fillStyle = '#FF8C00';
            internalCtx.beginPath();
            internalCtx.ellipse((this.x + this.width / 2 + (this.direction * 15)) / pixelScale, 
                              (this.y + 10 + waddleOffset) / pixelScale, 
                              6 / pixelScale, 3 / pixelScale, 0, 0, Math.PI * 2);
            internalCtx.fill();
            
            // Cassieduck eyes
            internalCtx.fillStyle = '#000';
            internalCtx.beginPath();
            internalCtx.arc((this.x + this.width / 2 + (this.direction * 5)) / pixelScale, 
                          (this.y + 6 + waddleOffset) / pixelScale, 
                          2 / pixelScale, 0, Math.PI * 2);
            internalCtx.fill();
            
            // Cassieduck feet (when on ground, pixelated)
            if (this.onGround) {
                internalCtx.fillStyle = '#FF8C00';
                internalCtx.fillRect(Math.round((this.x + 5) / pixelScale), 
                                    Math.round((this.y + this.height - 3) / pixelScale), 
                                    Math.round(6 / pixelScale), Math.round(3 / pixelScale));
                internalCtx.fillRect(Math.round((this.x + this.width - 11) / pixelScale), 
                                    Math.round((this.y + this.height - 3) / pixelScale), 
                                    Math.round(6 / pixelScale), Math.round(3 / pixelScale));
            }
        }
        
        internalCtx.restore();
    }
}