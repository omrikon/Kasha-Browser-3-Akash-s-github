// ============================================================================
// TILE SYSTEM - Source of Truth for All Tile-Based Physics
// ============================================================================
// This file contains all tile-related constants, classes, and methods.
// Used for Noita-like physics: destructible terrain, liquids, particles, etc.
// ============================================================================

// Tile Constants - Global for access from all scripts
window.TILE_SIZE = 16; // Size of each tile in pixels
window.TILE_TYPE = {
    EMPTY: 0,
    SOLID: 1,
    PLATFORM: 2,
    DESTRUCTIBLE: 3, // For future: can be destroyed by ground slam
    LIQUID: 4,       // For future: water/liquid physics
    DIRT: 5,         // Settled dirt particles (can be destroyed by ground slam)
    WATER: 6,         // True liquid, flows quickly
    OIL: 7,           // Slow liquid, highly flammable
    FIRE: 8,           // Dynamic burning tile
    GRASS: 9,         // Solid, flammable
    STONE: 10,        // Solid, fireproof
    ASH: 11           // Leftover tile after GRASS burns
};

// Tile Definitions Registry - Extended properties for all tiles
window.TILE_DEFINITIONS = {
    // Existing tiles (0-5)
    0: { // EMPTY
        id: 0,
        name: 'EMPTY',
        color: '#000000',
        solid: false,
        liquid: false,
        flammable: false,
        flowRate: 0,
        density: 0,
        burnTime: 0,
        temperature: 0,
        updateBehavior: 'none'
    },
    1: { // SOLID
        id: 1,
        name: 'SOLID',
        color: '#228B22',
        solid: true,
        liquid: false,
        flammable: false,
        flowRate: 0,
        density: 0,
        burnTime: 0,
        temperature: 0,
        updateBehavior: 'none'
    },
    2: { // PLATFORM
        id: 2,
        name: 'PLATFORM',
        color: '#8B4513',
        solid: true,
        liquid: false,
        flammable: false,
        flowRate: 0,
        density: 0,
        burnTime: 0,
        temperature: 0,
        updateBehavior: 'none'
    },
    3: { // DESTRUCTIBLE
        id: 3,
        name: 'DESTRUCTIBLE',
        color: '#654321',
        solid: true,
        liquid: false,
        flammable: false,
        flowRate: 0,
        density: 0,
        burnTime: 0,
        temperature: 0,
        updateBehavior: 'none'
    },
    4: { // LIQUID (placeholder)
        id: 4,
        name: 'LIQUID',
        color: '#4169E1',
        solid: false,
        liquid: true,
        flammable: false,
        flowRate: 0,
        density: 0,
        burnTime: 0,
        temperature: 0,
        updateBehavior: 'none'
    },
    5: { // DIRT
        id: 5,
        name: 'DIRT',
        color: '#8B4513',
        solid: true,
        liquid: false,
        flammable: false,
        flowRate: 0,
        density: 0,
        burnTime: 0,
        temperature: 0,
        updateBehavior: 'none'
    },
    // New tiles (6-11)
    6: { // WATER
        id: 6,
        name: 'WATER',
        color: '#4169E1',
        solid: false,
        liquid: true,
        flammable: false,
        flowRate: 3, // Fast flow
        density: 1.0,
        burnTime: 0,
        temperature: 0,
        updateBehavior: 'water'
    },
    7: { // OIL
        id: 7,
        name: 'OIL',
        color: '#1C1C1C',
        solid: false,
        liquid: true,
        flammable: true,
        flowRate: 1, // Slow flow
        density: 0.8,
        burnTime: 0,
        temperature: 0,
        updateBehavior: 'oil'
    },
    8: { // FIRE
        id: 8,
        name: 'FIRE',
        color: '#FF4500',
        solid: false,
        liquid: false,
        flammable: false,
        flowRate: 0,
        density: 0,
        burnTime: 300, // Frames before fire dies out
        temperature: 1000,
        updateBehavior: 'fire'
    },
    9: { // GRASS
        id: 9,
        name: 'GRASS',
        color: '#228B22',
        solid: true,
        liquid: false,
        flammable: true,
        flowRate: 0,
        density: 0,
        burnTime: 120, // Frames before GRASS turns to ASH
        temperature: 0,
        updateBehavior: 'grass'
    },
    10: { // STONE
        id: 10,
        name: 'STONE',
        color: '#808080',
        solid: true,
        liquid: false,
        flammable: false,
        flowRate: 0,
        density: 0,
        burnTime: 0,
        temperature: 0,
        updateBehavior: 'none'
    },
    11: { // ASH
        id: 11,
        name: 'ASH',
        color: '#696969',
        solid: true,
        liquid: false,
        flammable: false,
        flowRate: 0,
        density: 0,
        burnTime: 0,
        temperature: 0,
        updateBehavior: 'none'
    }
};

// Helper function to get tile definition by ID
window.getTileDefinition = function(tileId) {
    return window.TILE_DEFINITIONS[tileId] || window.TILE_DEFINITIONS[0]; // Default to EMPTY if not found
};

// TileMap Class - Manages the world grid for physics
class TileMap {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tiles = [];
        
        // Initialize all tiles as empty
        for (let y = 0; y < height; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < width; x++) {
                this.tiles[y][x] = window.TILE_TYPE.EMPTY;
            }
        }
    }
    
    // ========================================================================
    // Coordinate Conversion Methods
    // ========================================================================
    
    // Convert pixel coordinates to tile coordinates
    pixelToTile(pixel) {
        return Math.floor(pixel / window.TILE_SIZE);
    }
    
    // Convert tile coordinates to pixel coordinates (returns top-left corner)
    tileToPixel(tile) {
        return tile * window.TILE_SIZE;
    }
    
    // Get tile at pixel position
    getTileAtPixel(x, y) {
        const tileX = this.pixelToTile(x);
        const tileY = this.pixelToTile(y);
        return this.getTile(tileX, tileY);
    }
    
    // ========================================================================
    // Tile Access Methods
    // ========================================================================
    
    // Get tile at tile coordinates
    getTile(tileX, tileY) {
        if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
            return window.TILE_TYPE.EMPTY; // Out of bounds = empty
        }
        return this.tiles[tileY][tileX];
    }
    
    // Set tile at tile coordinates
    setTile(tileX, tileY, type) {
        if (tileX >= 0 && tileX < this.width && tileY >= 0 && tileY < this.height) {
            this.tiles[tileY][tileX] = type;
        }
    }
    
    // Fill a rectangular area with tiles
    fillRect(tileX, tileY, tileWidth, tileHeight, type) {
        for (let y = 0; y < tileHeight; y++) {
            for (let x = 0; x < tileWidth; x++) {
                this.setTile(tileX + x, tileY + y, type);
            }
        }
    }
    
    // ========================================================================
    // Collision Detection Methods
    // ========================================================================
    
    // Helper function to check if a tile is solid (collidable)
    isSolidTile(tile) {
        return tile === window.TILE_TYPE.SOLID || 
               tile === window.TILE_TYPE.PLATFORM || 
               tile === window.TILE_TYPE.DIRT ||
               tile === window.TILE_TYPE.DESTRUCTIBLE ||
               tile === window.TILE_TYPE.STONE ||
               tile === window.TILE_TYPE.GRASS ||
               tile === window.TILE_TYPE.ASH;
    }
    
    // Check if a pixel rectangle collides with solid tiles
    checkCollision(rectX, rectY, rectWidth, rectHeight) {
        const startTileX = this.pixelToTile(rectX);
        const startTileY = this.pixelToTile(rectY);
        const endTileX = this.pixelToTile(rectX + rectWidth);
        const endTileY = this.pixelToTile(rectY + rectHeight);
        
        for (let ty = startTileY; ty <= endTileY; ty++) {
            for (let tx = startTileX; tx <= endTileX; tx++) {
                const tile = this.getTile(tx, ty);
                if (this.isSolidTile(tile)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // Get collision info for more detailed collision resolution
    getCollisionInfo(rectX, rectY, rectWidth, rectHeight, prevX, prevY) {
        const info = {
            collides: false,
            tileX: 0,
            tileY: 0,
            side: null, // 'top', 'bottom', 'left', 'right'
            pixelX: 0,
            pixelY: 0
        };
        
        const dx = rectX - prevX;
        const dy = rectY - prevY;
        
        // Check each edge separately for more accurate collision detection
        if (Math.abs(dy) > Math.abs(dx)) {
            // Vertical movement - check top or bottom edge
            if (dy > 0) {
                // Moving down - check bottom edge
                const bottomY = rectY + rectHeight;
                const bottomTileY = this.pixelToTile(bottomY);
                const startTileX = this.pixelToTile(rectX);
                const endTileX = this.pixelToTile(rectX + rectWidth);
                
                for (let tx = startTileX; tx <= endTileX; tx++) {
                    const tile = this.getTile(tx, bottomTileY);
                    if (this.isSolidTile(tile)) {
                        info.collides = true;
                        info.tileX = tx;
                        info.tileY = bottomTileY;
                        info.pixelX = this.tileToPixel(tx);
                        info.pixelY = this.tileToPixel(bottomTileY);
                        info.side = 'top'; // Hitting top of tile = landing on platform
                        return info;
                    }
                }
            } else if (dy < 0) {
                // Moving up - check top edge
                const topTileY = this.pixelToTile(rectY);
                const startTileX = this.pixelToTile(rectX);
                const endTileX = this.pixelToTile(rectX + rectWidth);
                
                for (let tx = startTileX; tx <= endTileX; tx++) {
                    const tile = this.getTile(tx, topTileY);
                    if (this.isSolidTile(tile)) {
                        info.collides = true;
                        info.tileX = tx;
                        info.tileY = topTileY;
                        info.pixelX = this.tileToPixel(tx);
                        info.pixelY = this.tileToPixel(topTileY);
                        info.side = 'bottom'; // Hitting bottom of tile = hitting platform from below
                        return info;
                    }
                }
            }
        } else {
            // Horizontal movement - check left or right edge
            if (dx > 0) {
                // Moving right - check right edge
                const rightX = rectX + rectWidth;
                const rightTileX = this.pixelToTile(rightX);
                const startTileY = this.pixelToTile(rectY);
                const endTileY = this.pixelToTile(rectY + rectHeight);
                
                for (let ty = startTileY; ty <= endTileY; ty++) {
                    const tile = this.getTile(rightTileX, ty);
                    if (this.isSolidTile(tile)) {
                        info.collides = true;
                        info.tileX = rightTileX;
                        info.tileY = ty;
                        info.pixelX = this.tileToPixel(rightTileX);
                        info.pixelY = this.tileToPixel(ty);
                        info.side = 'left'; // Hitting left side of tile
                        return info;
                    }
                }
            } else if (dx < 0) {
                // Moving left - check left edge
                const leftTileX = this.pixelToTile(rectX);
                const startTileY = this.pixelToTile(rectY);
                const endTileY = this.pixelToTile(rectY + rectHeight);
                
                for (let ty = startTileY; ty <= endTileY; ty++) {
                    const tile = this.getTile(leftTileX, ty);
                    if (this.isSolidTile(tile)) {
                        info.collides = true;
                        info.tileX = leftTileX;
                        info.tileY = ty;
                        info.pixelX = this.tileToPixel(leftTileX);
                        info.pixelY = this.tileToPixel(ty);
                        info.side = 'right'; // Hitting right side of tile
                        return info;
                    }
                }
            }
        }
        
        return info;
    }
    
    // ========================================================================
    // Ground Slam / Destruction Methods
    // ========================================================================
    
    // Dislodge DIRT tiles with physics (makes them fly outward like real dirt)
    // Returns array of dislodged dirt tiles with velocity information
    dislodgeDirtTiles(centerX, centerY, radius, impactForce = 8) {
        const dislodgedTiles = [];
        const centerTileX = this.pixelToTile(centerX);
        const centerTileY = this.pixelToTile(centerY);
        const radiusTiles = Math.ceil(radius / window.TILE_SIZE);
        
        // Check all tiles in radius
        for (let ty = centerTileY - radiusTiles; ty <= centerTileY + radiusTiles; ty++) {
            for (let tx = centerTileX - radiusTiles; tx <= centerTileX + radiusTiles; tx++) {
                const tile = this.getTile(tx, ty);
                if (tile === window.TILE_TYPE.DIRT) {
                    // Check if within circular radius
                    const tileCenterX = (tx + 0.5) * window.TILE_SIZE;
                    const tileCenterY = (ty + 0.5) * window.TILE_SIZE;
                    const distance = Math.sqrt(
                        Math.pow(tileCenterX - centerX, 2) + 
                        Math.pow(tileCenterY - centerY, 2)
                    );
                    
                    if (distance <= radius) {
                        // Calculate direction away from impact point
                        const angle = Math.atan2(tileCenterY - centerY, tileCenterX - centerX);
                        
                        // Calculate force based on distance (closer = more force)
                        const forceMultiplier = 1 - (distance / radius); // 1.0 at center, 0.0 at edge
                        const force = impactForce * forceMultiplier;
                        
                        // Dirt flies outward and upward (like real dirt explosion)
                        const velocityX = Math.cos(angle) * force * (0.8 + Math.random() * 0.4); // Some randomness
                        const velocityY = -Math.abs(Math.sin(angle)) * force * 0.6 - 2 - Math.random() * 2; // Upward pop
                        
                        // Remove tile from map
                        this.setTile(tx, ty, window.TILE_TYPE.EMPTY);
                        
                        dislodgedTiles.push({
                            tileX: tx,
                            tileY: ty,
                            pixelX: this.tileToPixel(tx),
                            pixelY: this.tileToPixel(ty),
                            velocityX: velocityX,
                            velocityY: velocityY
                        });
                    }
                }
            }
        }
        
        return dislodgedTiles;
    }
    
    // Destroy tiles in a circular area (for ground slam)
    // Returns array of destroyed tile positions for effects
    destroyTiles(centerX, centerY, radius) {
        const destroyedTiles = [];
        const centerTileX = this.pixelToTile(centerX);
        const centerTileY = this.pixelToTile(centerY);
        const radiusTiles = Math.ceil(radius / window.TILE_SIZE);
        
        // Check all tiles in radius
        for (let ty = centerTileY - radiusTiles; ty <= centerTileY + radiusTiles; ty++) {
            for (let tx = centerTileX - radiusTiles; tx <= centerTileX + radiusTiles; tx++) {
                // Check if within circular radius
                const tileCenterX = (tx + 0.5) * window.TILE_SIZE;
                const tileCenterY = (ty + 0.5) * window.TILE_SIZE;
                const distance = Math.sqrt(
                    Math.pow(tileCenterX - centerX, 2) + 
                    Math.pow(tileCenterY - centerY, 2)
                );
                
                if (distance <= radius) {
                    const tile = this.getTile(tx, ty);
                    // Only destroy destructible or platform tiles (DIRT tiles handled separately)
                    if (tile === window.TILE_TYPE.DESTRUCTIBLE || tile === window.TILE_TYPE.PLATFORM) {
                        this.setTile(tx, ty, window.TILE_TYPE.EMPTY);
                        destroyedTiles.push({
                            tileX: tx,
                            tileY: ty,
                            pixelX: this.tileToPixel(tx),
                            pixelY: this.tileToPixel(ty)
                        });
                    }
                }
            }
        }
        
        return destroyedTiles;
    }
    
    // Get tiles in a circular area (for effects/visualization)
    getTilesInRadius(centerX, centerY, radius) {
        const tiles = [];
        const centerTileX = this.pixelToTile(centerX);
        const centerTileY = this.pixelToTile(centerY);
        const radiusTiles = Math.ceil(radius / window.TILE_SIZE);
        
        for (let ty = centerTileY - radiusTiles; ty <= centerTileY + radiusTiles; ty++) {
            for (let tx = centerTileX - radiusTiles; tx <= centerTileX + radiusTiles; tx++) {
                const tileCenterX = (tx + 0.5) * window.TILE_SIZE;
                const tileCenterY = (ty + 0.5) * window.TILE_SIZE;
                const distance = Math.sqrt(
                    Math.pow(tileCenterX - centerX, 2) + 
                    Math.pow(tileCenterY - centerY, 2)
                );
                
                if (distance <= radius) {
                    const tile = this.getTile(tx, ty);
                    if (tile !== window.TILE_TYPE.EMPTY) {
                        tiles.push({
                            tileX: tx,
                            tileY: ty,
                            pixelX: this.tileToPixel(tx),
                            pixelY: this.tileToPixel(ty),
                            type: tile
                        });
                    }
                }
            }
        }
        
        return tiles;
    }
    
    // Check if there are any tiles at a position (for ground slam detection)
    hasSolidTilesAt(centerX, centerY, radius) {
        const tiles = this.getTilesInRadius(centerX, centerY, radius);
        return tiles.some(tile => this.isSolidTile(tile.type));
    }
}

// Global world tile map (initialized in createLevel)
window.worldMap = null;

