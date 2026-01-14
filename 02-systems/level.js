// ============================================================================
// LEVEL.JS - Level Creation and Management
// ============================================================================
// This file handles everything related to game levels - creating them,
// loading them, resetting them, and moving to the next level. Think of this
// as the "level designer" that builds the world you play in. It creates
// platforms, places enemies, spawns items, and sets up the entire level
// layout. It also handles level progression (completing levels, moving to
// the next one, etc.).
// ============================================================================

// This message appears in the browser console when the file loads
console.log('Loading level.js...');

// Weapon Behavior System (placeholder for future Kasha abilities)
function getWeaponBehavior(weaponItem) {
    if (!weaponItem || weaponItem.type !== 'weapon') return null;
    
    const weaponData = weaponItem.data || {};
    const isFused = weaponData.fused || false;
    const weaponType = weaponData.weaponType || 'sword';
    const kashaCore = weaponData.kashaCore || null;
    
    if (!isFused || !kashaCore) {
        // Base weapon behavior (placeholder - no special abilities yet)
        return {
            type: 'base',
            weaponType: weaponType,
            damage: 1,
            attackSpeed: 1.0,
            range: 50,
            effects: []
        };
    }
    
    // Fused weapon behavior (placeholder - will be extended with Kasha abilities)
    return {
        type: 'fused',
        weaponType: weaponType,
        kashaType: kashaCore.kashaType,
        kashaName: kashaCore.kashaName,
        damage: 1, // Base damage (will be modified by abilities)
        attackSpeed: 1.0, // Base attack speed (will be modified by abilities)
        range: 50, // Base range (will be modified by abilities)
        effects: [], // Will contain ability effects when implemented
        abilities: kashaCore.abilities || []
    };
}

// Helper function to handle Kasha death (for future summoning system)
// Called when an owned Kasha dies in battle
function handleKashaDeath(kasha, inventoryId) {
    if (!kasha || !kasha.ownedByPlayer) return;
    
    // Create corpse at death location
    const corpse = new KashaCorpse(kasha.x, kasha.y, {
        type: kasha.type,
        name: kasha.name || 'Kasha',
        data: {
            abilities: kasha.abilities || [],
            inventoryId: inventoryId
        }
    });
    kashaCorpses.push(corpse);
    
    // Remove Kasha from inventory (it's dead, so remove the item)
    // Note: This will be called when summoning system is implemented
    if (inventoryId !== null) {
        // Find and remove the Kasha item from inventory
        for (let i = 0; i < inventory.items.length; i++) {
            const item = inventory.items[i];
            if (item && item.type === 'kasha' && item.id === inventoryId) {
                inventory.setItemAtSlot(i, null, 'main');
                break;
            }
        }
        // Also check storage
        for (let i = 0; i < inventory.storageItems.length; i++) {
            const item = inventory.storageItems[i];
            if (item && item.type === 'kasha' && item.id === inventoryId) {
                inventory.setItemAtSlot(i, null, 'storage');
                break;
            }
        }
    }
}

// Create level - MUCH LONGER
function createLevel(level = 1) {
    // Clear existing level objects
    platforms.length = 0;
    boxes.length = 0;
    kashaballs.length = 0;
    groundSlamEffects.length = 0;
    platformBreakingEffects.length = 0;
    dirtTiles.length = 0;
    enemies.length = 0;
    kashas.length = 0;
    
    // Initialize tile map (calculate size based on level width)
    // For now, all levels use the same width, but this can be customized per level later
    levelWidth = 52000; // Total level width in pixels (update global)
    const levelHeight = 2000; // Total level height in pixels
    const mapWidth = Math.ceil(levelWidth / window.TILE_SIZE);
    const mapHeight = Math.ceil(levelHeight / window.TILE_SIZE);
    window.worldMap = new TileMap(mapWidth, mapHeight);
    worldMap = window.worldMap;
    
    // Level-specific generation
    if (level === 1) {
        // TUTORIAL LEVEL - Keep exactly as is, don't touch!
        // Ground platforms - extended much further
        for (let i = 0; i < 30; i++) {
            platforms.push(new Platform(i * 2000, 550, 2000, 50, '#228B22'));
        }
        
        // Elevated platforms - many more throughout the level
        const platformPositions = [
            // First section
            [400, 450], [700, 350], [1000, 250], [1300, 350], [1600, 450],
            [2000, 300], [2300, 400], [2800, 350], [3200, 250], [3600, 400],
            // Second section
            [4200, 450], [4500, 300], [4800, 400], [5200, 350], [5600, 250],
            [6000, 400], [6400, 350], [6800, 450], [7200, 300], [7600, 400],
            // Third section
            [8000, 250], [8400, 400], [8800, 350], [9200, 450], [9600, 300],
            [10000, 400], [10400, 350], [10800, 250], [11200, 400], [11600, 450],
            // Fourth section
            [12000, 300], [12400, 400], [12800, 350], [13200, 250], [13600, 400],
            [14000, 450], [14400, 300], [14800, 400], [15200, 350], [15600, 250],
            // Fifth section
            [16000, 400], [16400, 450], [16800, 300], [17200, 400], [17600, 350],
            [18000, 250], [18400, 400], [18800, 450], [19200, 300], [19600, 400],
            // Sixth section
            [20000, 350], [20400, 250], [20800, 400], [21200, 450], [21600, 300],
            [22000, 400], [22400, 350], [22800, 250], [23200, 400], [23600, 450],
            // Seventh section
            [24000, 300], [24400, 400], [24800, 350], [25200, 250], [25600, 400],
            [26000, 450], [26400, 300], [26800, 400], [27200, 350], [27600, 250],
            // Eighth section
            [28000, 400], [28400, 450], [28800, 300], [29200, 400], [29600, 350],
            [30000, 250], [30400, 400], [30800, 450], [31200, 300], [31600, 400],
            // Ninth section
            [32000, 350], [32400, 250], [32800, 400], [33200, 450], [33600, 300],
            [34000, 400], [34400, 350], [34800, 250], [35200, 400], [35600, 450],
            // Tenth section
            [36000, 300], [36400, 400], [36800, 350], [37200, 250], [37600, 400],
            [38000, 450], [38400, 300], [38800, 400], [39200, 350], [39600, 250],
            [40000, 400], [40400, 450], [40800, 300], [41200, 400], [41600, 350],
            [42000, 250], [42400, 400], [42800, 450], [43200, 300], [43600, 400],
            [44000, 350], [44400, 250], [44800, 400], [45200, 450], [45600, 300],
            [46000, 400], [46400, 350], [46800, 250], [47200, 400], [47600, 450],
            [48000, 300], [48400, 400], [48800, 350], [49200, 250], [49600, 400],
            [50000, 450], [50400, 300], [50800, 400], [51200, 350], [51600, 250]
        ];
        
        platformPositions.forEach(([x, y]) => {
            platforms.push(new Platform(x, y, 200, 20));
        });
        
        // Boxes with kashaballs - many more throughout the level
        const boxPositions = [
            // First section
            [450, 410], [750, 310], [1050, 210], [1350, 310], [1650, 410],
            [2050, 260], [2350, 360], [2850, 310], [3250, 210], [3650, 360],
            // Second section
            [4250, 410], [4550, 260], [4850, 360], [5250, 310], [5650, 210],
            [6050, 360], [6450, 310], [6850, 410], [7250, 260], [7650, 360],
            // Third section
            [8050, 210], [8450, 360], [8850, 310], [9250, 410], [9650, 260],
            [10050, 360], [10450, 310], [10850, 210], [11250, 360], [11650, 410],
            // Continue with more boxes every 400-500 units
        ];
        
        // Generate more boxes programmatically
        for (let i = 0; i < 200; i++) {
            const x = 12000 + i * 250;
            const platformY = platformPositions.find(p => Math.abs(p[0] - x) < 200)?.[1] || 450;
            if (platformY < 550) {
                boxes.push(new Box(x, platformY - 40));
            }
        }
        
        // Add initial boxes
        boxPositions.forEach(([x, y]) => {
            boxes.push(new Box(x, y));
        });
        
        // Add enemies throughout the level - place on ground or nearby platforms
        for (let i = 0; i < 50; i++) {
            const x = 1000 + i * 1000;
            // Try to find a nearby platform, otherwise use ground
            let platformY = 500;
            const nearbyPlatform = platformPositions.find(p => Math.abs(p[0] - x) < 200);
            if (nearbyPlatform) {
                platformY = nearbyPlatform[1];
            }
            enemies.push(new MaroonBlobEnemy1(x, platformY - 40));
        }
        
        // Add kashas (waddling Cassieducks) throughout the level - place on ground or nearby platforms
        for (let i = 0; i < 30; i++) {
            const x = 2000 + i * 1500;
            // Try to find a nearby platform, otherwise use ground
            let platformY = 500;
            const nearbyPlatform = platformPositions.find(p => Math.abs(p[0] - x) < 200);
            if (nearbyPlatform) {
                platformY = nearbyPlatform[1];
            }
            kashas.push(new CassieDuck(x, platformY - 35));
        }
    } else if (level === 2) {
        // LEVEL 2 - Terraria-style terrain with hills, dungeons, and varied biomes
        try {
        const baseGroundY = 550; // Base ground level in pixels
        const baseGroundTileY = Math.floor(baseGroundY / window.TILE_SIZE);
        
        // Generate terrain height map using multiple noise functions (Terraria-style)
        const terrainHeights = [];
        for (let tx = 0; tx < mapWidth; tx++) {
            // Combine multiple sine waves for natural-looking hills
            const height1 = Math.sin(tx * 0.02) * 8; // Large hills
            const height2 = Math.sin(tx * 0.05) * 4; // Medium hills
            const height3 = Math.sin(tx * 0.1) * 2; // Small hills
            const height4 = Math.sin(tx * 0.15) * 1; // Tiny variations
            const totalHeight = height1 + height2 + height3 + height4;
            
            // Base height with variation
            const groundHeight = baseGroundTileY + Math.floor(totalHeight);
            terrainHeights.push(groundHeight);
        }
        
        // Create terrain layers (Terraria-style: grass on top, stone below, dirt in between)
        for (let tx = 0; tx < mapWidth; tx++) {
            const surfaceY = terrainHeights[tx];
            const depth = 15 + Math.floor(Math.random() * 10); // 15-25 tiles deep
            
            for (let ty = 0; ty < depth; ty++) {
                const tileY = surfaceY + ty;
                if (tileY >= mapHeight) break;
                
                let tileType;
                if (ty === 0) {
                    // Surface layer - mostly grass, some dirt patches
                    tileType = Math.random() < 0.7 ? window.TILE_TYPE.GRASS : window.TILE_TYPE.DIRT;
                } else if (ty < 3) {
                    // Top layers - dirt
                    tileType = window.TILE_TYPE.DIRT;
                } else {
                    // Deep layers - stone
                    tileType = window.TILE_TYPE.STONE;
                }
                
                window.worldMap.setTile(tx, tileY, tileType);
            }
        }
        
        // Add underground stone layers (Terraria-style depth)
        for (let tx = 0; tx < mapWidth; tx++) {
            const surfaceY = terrainHeights[tx];
            const deepStart = surfaceY + 20;
            const deepEnd = Math.min(mapHeight, deepStart + 30);
            
            for (let ty = deepStart; ty < deepEnd; ty++) {
                if (window.worldMap.getTile(tx, ty) === window.TILE_TYPE.EMPTY) {
                    window.worldMap.setTile(tx, ty, window.TILE_TYPE.STONE);
                }
            }
        }
        
        // Create dungeons (Terraria-style underground structures)
        for (let dungeonNum = 0; dungeonNum < 8; dungeonNum++) {
            const dungeonX = 2000 + dungeonNum * 6000 + Math.random() * 2000;
            const dungeonStartY = baseGroundTileY + 10 + Math.floor(Math.random() * 15);
            
            // Dungeon entrance (vertical shaft)
            const entranceWidth = 3;
            const entranceDepth = 8 + Math.floor(Math.random() * 12);
            const tileX = Math.floor(dungeonX / window.TILE_SIZE);
            
            for (let py = 0; py < entranceDepth; py++) {
                for (let px = 0; px < entranceWidth; px++) {
                    const tx = tileX + px;
                    const ty = dungeonStartY + py;
                    if (tx < mapWidth && ty < mapHeight) {
                        // Carve out entrance
                        if (window.worldMap.isSolidTile(window.worldMap.getTile(tx, ty))) {
                            window.worldMap.setTile(tx, ty, window.TILE_TYPE.EMPTY);
                        }
                    }
                }
            }
            
            // Dungeon rooms (horizontal chambers)
            const roomY = dungeonStartY + entranceDepth;
            const roomWidth = 12 + Math.floor(Math.random() * 20);
            const roomHeight = 6 + Math.floor(Math.random() * 8);
            
            // Main room
            for (let py = 0; py < roomHeight; py++) {
                for (let px = 0; px < roomWidth; px++) {
                    const tx = tileX + px;
                    const ty = roomY + py;
                    if (tx < mapWidth && ty < mapHeight) {
                        window.worldMap.setTile(tx, ty, window.TILE_TYPE.EMPTY);
                    }
                }
            }
            
            // Dungeon walls (STONE)
            for (let px = 0; px < roomWidth; px++) {
                const tx = tileX + px;
                const floorY = roomY + roomHeight;
                if (tx < mapWidth && floorY < mapHeight) {
                    // Floor
                    window.worldMap.setTile(tx, floorY, window.TILE_TYPE.STONE);
                    // Ceiling
                    if (roomY > 0) {
                        window.worldMap.setTile(tx, roomY - 1, window.TILE_TYPE.STONE);
                    }
                }
            }
            // Side walls
            for (let py = 0; py < roomHeight; py++) {
                const ty = roomY + py;
                if (tileX > 0 && ty < mapHeight) {
                    window.worldMap.setTile(tileX - 1, ty, window.TILE_TYPE.STONE);
                }
                if (tileX + roomWidth < mapWidth && ty < mapHeight) {
                    window.worldMap.setTile(tileX + roomWidth, ty, window.TILE_TYPE.STONE);
                }
            }
        }
        
        // Create natural caves (winding underground passages)
        for (let caveNum = 0; caveNum < 15; caveNum++) {
            const caveStartX = 1000 + caveNum * 3000 + Math.random() * 1000;
            const caveStartY = baseGroundTileY + 5 + Math.floor(Math.random() * 20);
            const caveLength = 20 + Math.floor(Math.random() * 30);
            const caveWidth = 3 + Math.floor(Math.random() * 4);
            
            let currentX = Math.floor(caveStartX / window.TILE_SIZE);
            let currentY = caveStartY;
            let direction = Math.random() < 0.5 ? -1 : 1; // Start going up or down
            
            for (let step = 0; step < caveLength; step++) {
                // Carve out cave segment
                for (let wy = 0; wy < caveWidth; wy++) {
                    for (let wx = 0; wx < 3; wx++) {
                        const tx = currentX + wx;
                        const ty = currentY + wy;
                        if (tx < mapWidth && ty < mapHeight && ty > 0) {
                            window.worldMap.setTile(tx, ty, window.TILE_TYPE.EMPTY);
                        }
                    }
                }
                
                // Move cave forward and change direction occasionally
                currentX += 2;
                if (Math.random() < 0.3) {
                    direction *= -1; // Change vertical direction
                }
                currentY += direction;
                
                // Keep cave within bounds
                if (currentY < baseGroundTileY) currentY = baseGroundTileY;
                if (currentY > mapHeight - 10) currentY = mapHeight - 10;
            }
        }
        
        // Create floating islands (Terraria-style sky islands)
        for (let islandNum = 0; islandNum < 25; islandNum++) {
            const islandX = 500 + islandNum * 2000 + Math.random() * 1000;
            const islandY = 50 + Math.sin(islandNum * 0.5) * 80 + Math.random() * 100;
            const islandWidth = 8 + Math.floor(Math.random() * 12);
            const islandHeight = 4 + Math.floor(Math.random() * 6);
            
            const tileX = Math.floor(islandX / window.TILE_SIZE);
            const tileY = Math.floor(islandY / window.TILE_SIZE);
            
            // Island base (STONE)
            for (let py = 0; py < islandHeight; py++) {
                for (let px = 0; px < islandWidth; px++) {
                    if (tileX + px < mapWidth && tileY + py < mapHeight) {
                        const tileType = py === 0 ? window.TILE_TYPE.GRASS : window.TILE_TYPE.DIRT;
                        window.worldMap.setTile(tileX + px, tileY + py, tileType);
                    }
                }
            }
        }
        
        // Create water lakes in valleys
        for (let lakeNum = 0; lakeNum < 12; lakeNum++) {
            const lakeX = 1500 + lakeNum * 4000 + Math.random() * 1500;
            const lakeTileX = Math.floor(lakeX / window.TILE_SIZE);
            
            // Find a valley (low point in terrain)
            let lowestY = terrainHeights[lakeTileX];
            for (let checkX = Math.max(0, lakeTileX - 5); checkX < Math.min(mapWidth, lakeTileX + 5); checkX++) {
                if (terrainHeights[checkX] < lowestY) {
                    lowestY = terrainHeights[checkX];
                }
            }
            
            const lakeY = lowestY;
            const lakeWidth = 8 + Math.floor(Math.random() * 15);
            const lakeDepth = 4 + Math.floor(Math.random() * 6);
            
            for (let py = 0; py < lakeDepth; py++) {
                for (let px = 0; px < lakeWidth; px++) {
                    const tx = lakeTileX + px;
                    const ty = lakeY + py;
                    if (tx < mapWidth && ty < mapHeight) {
                        const belowTile = window.worldMap.getTile(tx, ty + 1);
                        if (window.worldMap.isSolidTile(belowTile)) {
                            window.worldMap.setTile(tx, ty, window.TILE_TYPE.WATER);
                        }
                    }
                }
            }
        }
        
        // Create oil deposits underground
        for (let oilNum = 0; oilNum < 10; oilNum++) {
            const oilX = 2000 + oilNum * 5000 + Math.random() * 2000;
            const oilY = baseGroundTileY + 15 + Math.floor(Math.random() * 20);
            const oilWidth = 6 + Math.floor(Math.random() * 8);
            const oilHeight = 3 + Math.floor(Math.random() * 4);
            
            const tileX = Math.floor(oilX / window.TILE_SIZE);
            const tileY = oilY;
            
            for (let py = 0; py < oilHeight; py++) {
                for (let px = 0; px < oilWidth; px++) {
                    if (tileX + px < mapWidth && tileY + py < mapHeight) {
                        const belowTile = window.worldMap.getTile(tileX + px, tileY + py + 1);
                        if (window.worldMap.isSolidTile(belowTile)) {
                            window.worldMap.setTile(tileX + px, tileY + py, window.TILE_TYPE.OIL);
                        }
                    }
                }
            }
        }
        
        // Create destructible rock formations on surface
        for (let rockNum = 0; rockNum < 30; rockNum++) {
            const rockX = 1000 + rockNum * 1500 + Math.random() * 800;
            const rockTileX = Math.floor(rockX / window.TILE_SIZE);
            const surfaceY = terrainHeights[rockTileX];
            const rockY = surfaceY - 1; // On surface
            const rockWidth = 2 + Math.floor(Math.random() * 4);
            const rockHeight = 3 + Math.floor(Math.random() * 5);
            
            for (let py = 0; py < rockHeight; py++) {
                for (let px = 0; px < rockWidth; px++) {
                    const tx = rockTileX + px;
                    const ty = rockY - py; // Build upward
                    if (tx < mapWidth && ty >= 0 && ty < mapHeight) {
                        if (window.worldMap.getTile(tx, ty) === window.TILE_TYPE.EMPTY) {
                            window.worldMap.setTile(tx, ty, window.TILE_TYPE.DESTRUCTIBLE);
                        }
                    }
                }
            }
        }
        
        // Helper function to find top surface of solid tile at x position
        const findTopSurface = (x) => {
            const tileX = Math.floor(x / window.TILE_SIZE);
            // Scan from top to bottom to find first solid tile with empty space above
            for (let ty = 1; ty < mapHeight; ty++) {
                const tile = window.worldMap.getTile(tileX, ty);
                const aboveTile = window.worldMap.getTile(tileX, ty - 1);
                // If current tile is solid and tile above is empty, we found a surface
                if (tile !== window.TILE_TYPE.EMPTY && tile !== window.TILE_TYPE.WATER && 
                    tile !== window.TILE_TYPE.OIL && tile !== window.TILE_TYPE.FIRE &&
                    aboveTile === window.TILE_TYPE.EMPTY) {
                    return ty * window.TILE_SIZE; // Return pixel Y of top of tile
                }
            }
            return null;
        };
        
        // Place boxes on tile platforms
        for (let i = 0; i < 150; i++) {
            const x = 500 + i * 300 + Math.random() * 200;
            const foundY = findTopSurface(x);
            if (foundY !== null) {
                boxes.push(new Box(x, foundY - 40));
            }
        }
        
        // Place enemies on solid tiles
        for (let i = 0; i < 60; i++) {
            const x = 1000 + i * 800 + Math.random() * 400;
            const foundY = findTopSurface(x);
            if (foundY !== null) {
                enemies.push(new MaroonBlobEnemy1(x, foundY - 40));
            }
        }
        
        // Place kashas on solid tiles
        for (let i = 0; i < 40; i++) {
            const x = 2000 + i * 1200 + Math.random() * 600;
            const foundY = findTopSurface(x);
            if (foundY !== null) {
                kashas.push(new CassieDuck(x, foundY - 35));
            }
        }
        } catch (error) {
            console.error('Error generating level 2:', error);
            // Fallback to level 1 if level 2 generation fails
            createLevel(1);
        }
    } else if (level === 3) {
        // LEVEL 3 - Celeste-style vertical climbing platformer
        // Features: Vertical climbing, precise platforming, floating platforms
        
        const baseGroundY = 550; // Base ground level in pixels
        const baseGroundTileY = Math.floor(baseGroundY / window.TILE_SIZE);
        
        // Create ground platform (starting area)
        platforms.push(new Platform(0, baseGroundY, 800, 50, '#228B22'));
        
        // CELESTE-STYLE VERTICAL CLIMBING SECTIONS
        // Section 1: Initial vertical climb (right side start)
        const verticalPlatforms1 = [
            // Starting platforms (ground level)
            [800, 500], [1200, 450],
            // First vertical ascent
            [1600, 400], [2000, 350], [2400, 300], [2800, 250],
            // Peak 1
            [3200, 200], [3600, 200], [4000, 250],
            // Drop and climb
            [4400, 300], [4800, 350], [5200, 400],
            // Second ascent
            [5600, 350], [6000, 300], [6400, 250], [6800, 200],
            // Peak 2
            [7200, 150], [7600, 150], [8000, 200],
            // Descent
            [8400, 250], [8800, 300],
            // Third major climb
            [9200, 250], [9600, 200], [10000, 150], [10400, 100],
            [10800, 100], [11200, 150], [11600, 200],
            // Large drop
            [12000, 300], [12400, 350],
            // Fourth climb (bigger platforms)
            [12800, 300], [13200, 250], [13600, 200], [14000, 150],
            [14400, 100], [14800, 100], [15200, 150], [15600, 200],
            // Valley
            [16000, 300], [16400, 350],
            // Final major climb
            [16800, 300], [17200, 250], [17600, 200], [18000, 150],
            [18400, 100], [18800, 50], [19200, 50], [19600, 100],
            [20000, 150], [20400, 200], [20800, 250],
            // Descent to finish
            [21200, 300], [21600, 350], [22000, 400], [22400, 450],
            [22800, 500], [23200, baseGroundY - 50]
        ];
        
        verticalPlatforms1.forEach(([x, y]) => {
            platforms.push(new Platform(x, y, 200, 20));
        });
        
        // Add longer horizontal platforms at key points (landing spots)
        const horizontalPlatforms = [
            [3400, 180, 400], [7400, 130, 400], [10900, 80, 400],
            [14600, 80, 400], [19000, 30, 400]
        ];
        
        horizontalPlatforms.forEach(([x, y, width]) => {
            platforms.push(new Platform(x, y, width, 20));
        });
        
        // CELESTE-STYLE FLOATING ISLANDS (small precise platforms)
        const floatingIslands = [
            // First section - precise jumps
            [9000, 450], [9400, 400], [9800, 350], [10200, 300],
            // Second section - alternating pattern
            [13000, 400], [13400, 350], [13800, 400], [14200, 350],
            // Third section - zigzag pattern
            [17000, 400], [17400, 350], [17800, 400], [18200, 350],
            [18600, 400], [19000, 350],
            // Fourth section - scattered
            [21000, 400], [21400, 380], [21800, 360], [22200, 380],
            [22600, 400], [23000, 420]
        ];
        
        floatingIslands.forEach(([x, y]) => {
            platforms.push(new Platform(x, y, 150, 20));
        });
        
        // CELESTE-STYLE STEP PLATFORMS (staircase patterns for climbing)
        const stepPlatforms = [
            // Right-facing stairs
            [25000, baseGroundY - 50], [25200, baseGroundY - 100],
            [25400, baseGroundY - 150], [25600, baseGroundY - 200],
            // Left-facing stairs
            [26000, baseGroundY - 200], [26200, baseGroundY - 150],
            [26400, baseGroundY - 100], [26600, baseGroundY - 50],
            // Upward spiral
            [27000, baseGroundY - 50], [27200, baseGroundY - 100],
            [27400, baseGroundY - 100], [27600, baseGroundY - 150],
            [27800, baseGroundY - 150], [28000, baseGroundY - 200]
        ];
        
        stepPlatforms.forEach(([x, y]) => {
            platforms.push(new Platform(x, y, 200, 20));
        });
        
        // Extended ground platforms for continuity
        for (let i = 1; i < 15; i++) {
            platforms.push(new Platform(i * 2000, baseGroundY, 2000, 50, '#228B22'));
        }
        
        // Place boxes (kashaball containers) on platforms - Celeste-style collectibles
        const boxPositions = [
            // Starting area
            [900, 460], [1300, 410],
            // First climb
            [1700, 360], [2100, 310], [2500, 260], [2900, 210],
            [3300, 160], [3700, 160], [4100, 210],
            // Second climb
            [5700, 310], [6100, 260], [6500, 210], [6900, 160],
            [7300, 110], [7700, 110], [8100, 160],
            // Third climb
            [9300, 210], [9700, 160], [10100, 110], [10500, 60],
            [10900, 60], [11300, 110], [11700, 160],
            // Floating islands
            [9100, 410], [9500, 360], [9900, 310], [10300, 260],
            [13100, 360], [13500, 310], [13900, 360], [14300, 310],
            // Steps
            [25100, 510], [25300, 460], [25500, 410], [25700, 360],
            [26100, 360], [26300, 410], [26500, 460], [26700, 510]
        ];
        
        boxPositions.forEach(([x, y]) => {
            boxes.push(new Box(x, y));
        });
        
        // Generate more boxes programmatically on platforms
        for (let i = 0; i < 100; i++) {
            const x = 12000 + i * 200;
            // Find nearest platform
            let nearestPlatform = verticalPlatforms1.find(p => Math.abs(p[0] - x) < 300);
            if (nearestPlatform) {
                boxes.push(new Box(x, nearestPlatform[1] - 40));
            }
        }
        
        // Place enemies strategically - fewer but more challenging placement
        const enemyPositions = [
            // Ground level guards
            [1000, baseGroundY - 40], [5000, baseGroundY - 40],
            // Platform guards
            [1800, 360], [2600, 210], [5800, 310], [6200, 210],
            [9400, 160], [10200, 60], [13200, 210], [13800, 310],
            [17200, 160], [18000, 60], [19000, 60],
            // Floating island guards
            [9200, 410], [9800, 310], [14200, 310],
            // Step guards
            [25200, 460], [25600, 360], [26200, 410], [27200, 460]
        ];
        
        enemyPositions.forEach(([x, y]) => {
            enemies.push(new MaroonBlobEnemy1(x, y));
        });
        
        // Place kashas (collectibles) on challenging platforms
        const kashaPositions = [
            // High platforms (challenging to reach)
            [3300, 160], [3700, 160], [7400, 110], [7700, 110],
            [10900, 60], [14600, 60], [19000, 30],
            // Floating islands
            [9000, 410], [9400, 360], [13400, 310], [17800, 360],
            [21400, 340], [21800, 320],
            // Steps
            [25600, 360], [27800, 410],
            // Extended platforms
            [23000, baseGroundY - 50], [25000, baseGroundY - 50]
        ];
        
        kashaPositions.forEach(([x, y]) => {
            kashas.push(new CassieDuck(x, y - 35));
        });
        
        // Generate more kashas throughout the level
        for (let i = 0; i < 20; i++) {
            const x = 24000 + i * 1000;
            let nearestPlatform = verticalPlatforms1.find(p => Math.abs(p[0] - x) < 400);
            if (nearestPlatform && nearestPlatform[1] < baseGroundY) {
                kashas.push(new CassieDuck(x, nearestPlatform[1] - 35));
            } else {
                kashas.push(new CassieDuck(x, baseGroundY - 85));
            }
        }
    } else {
        // Future levels can be added here
        // For now, default to level 1 structure if level doesn't exist
        createLevel(1);
    }
    
}

// Throw Kashaball Function
function throwKashaball() {
    const selectedItem = inventory.getSelectedItem();
    if (!selectedItem || selectedItem.type !== 'kashaball' || selectedItem.count <= 0) return;
    
    // Trigger player throw animation
    player.throwing = true;
    player.throwFrame = player.throwDuration;
    
    // Calculate charge percentage (can exceed 1.0 if charging continues)
    const chargePercent = kashaballChargeTime / kashaballChargeMaxTime;
    
    // Calculate throw speed based on charge (min 6, max 18)
    const minSpeed = 6;
    const maxSpeed = 18;
    const throwSpeed = minSpeed + (maxSpeed - minSpeed) * chargePercent;
    
    // Fixed angle: 45 degrees upward in player facing direction
    // For upward throws in canvas (Y increases downward), we need negative Y velocity
    // Right: -45 degrees (up-right), Left: -135 degrees (up-left)
    const throwAngle = player.direction === -1 ? (Math.PI * 5 / 4) : (-Math.PI / 4);
    
    // Calculate velocities for parabolic trajectory
    const velocityX = Math.cos(throwAngle) * throwSpeed;
    const velocityY = Math.sin(throwAngle) * throwSpeed;
    
    // Create kashaball at player position (marked as thrown)
    const kashaball = new Kashaball(player.x + player.width / 2 - 12.5, player.y + player.height / 2 - 12.5, true);
    kashaball.velocityX = velocityX;
    kashaball.velocityY = velocityY;
    
    kashaballs.push(kashaball);
    inventory.removeItem('kashaball', 1);
    
    // Reset charge state
    kashaballCharging = false;
    kashaballChargeTime = 0;
    
    // Update UI (keep for compatibility)
    kashaballsCollected = inventory.getItemCount('kashaball');
    kashaballCountElement.textContent = kashaballsCollected;
    playThrowSound();
}

// Draw Trajectory Preview
let lastDebugTime = 0;
function resetGame() {
    // Reset player
    player.x = 100;
    player.y = 470; // Spawn on ground (ground at y=550, player height=80, so y=470)
    player.velocityX = 0;
    player.velocityY = 0;
    player.health = player.maxHealth;
    player.invincible = false;
    player.invincibleTime = 0;
    player.damageFlash = 0;
    player.flinchOffset = 0;
    
    // Reset game state
    kashaballsCollected = 0;
    kashasCaught = 0;
    gamePaused = false;
    levelFinished = false;
    gameOver = false;
    cameraX = 0;
    cameraY = 0;
    
    // Reset level system
    currentLevel = 1;
    specialItemRolled = null;
    
    // Reset inventory
    inventory.items = [];
    inventory.selectedSlot = 0;
    inventory.scrollOffset = 0;
    inventory.extendedOpen = false;
    
    // Reset fusion slots
    fusionWeaponSlot = null;
    fusionCoreSlot = null;
    
    // Clear arrays
    kashaballs.length = 0;
    groundSlamEffects.length = 0;
    platformBreakingEffects.length = 0;
    dirtTiles.length = 0;
    
    // Clear all DIRT tiles from tile map
    if (window.worldMap) {
        for (let ty = 0; ty < window.worldMap.height; ty++) {
            for (let tx = 0; tx < window.worldMap.width; tx++) {
                if (window.worldMap.getTile(tx, ty) === window.TILE_TYPE.DIRT) {
                    window.worldMap.setTile(tx, ty, window.TILE_TYPE.EMPTY);
                }
            }
        }
    }
    
    // Reset all boxes (reload kashaballs)
    for (let box of boxes) {
        box.hit = false;
        box.kashaballReleased = false;
    }
    
    // Reset all platforms (undo destruction)
    for (let platform of platforms) {
        platform.destroyed = false;
        platform.destructionTime = 0;
    }
    
    // Reset all enemies
    for (let enemy of enemies) {
        enemy.health = enemy.maxHealth;
        enemy.dead = false;
        enemy.deathAnimation = 0;
        enemy.damageFlash = 0;
        enemy.attacking = false;
        enemy.attackTimer = 0;
        enemy.attackCooldown = 0;
        enemy.mouthOpen = 0;
        enemy.scale = 1.0;
        enemy.scaleY = 1.0;
        enemy.biteDirection = 0;
        enemy.rotation = 0;
        enemy.velocityX = enemy.speed * enemy.direction;
        enemy.velocityY = 0;
        // Reset position to start
        enemy.x = enemy.startX;
        enemy.y = enemy.startY;
    }
    
    // Reset all kashas
    for (let kasha of kashas) {
        kasha.caught = false;
        kasha.inPokeball = false;
        kasha.catchProgress = 0;
        kasha.waddleFrame = 0;
    }
    
    // Reset UI
    kashaballCountElement.textContent = 0;
    kashaCountElement.textContent = 0;
    updateHealthDisplay();
    
    // Recreate level (reset to level 1)
    createLevel(currentLevel);
    
    // Clear button bounds
    window.levelFinishedButtonBounds = null;
}

// Next Level Function
function nextLevel() {
    // Increment level
    currentLevel++;
    
    // Reset player position
    player.x = 100;
    player.y = 470;
    player.velocityX = 0;
    player.velocityY = 0;
    
    // Reset level finished state
    levelFinished = false;
    gamePaused = false;
    cameraX = 0;
    cameraY = 0;
    
    // Clear special item roll (will be rolled again when level completes)
    specialItemRolled = null;
    
    // Clear arrays (keep inventory and player health)
    kashaballs.length = 0;
    groundSlamEffects.length = 0;
    platformBreakingEffects.length = 0;
    dirtTiles.length = 0;
    
    // Create new level
    createLevel(currentLevel);
    
    // Clear button bounds
    window.levelFinishedButtonBounds = null;
}

// Load Specific Level (for admin/testing)
function loadLevel(levelNum) {
    try {
        console.log(`=== LOADING LEVEL ${levelNum} ===`);
        // Set current level
        currentLevel = levelNum;
        
        // Reset level finished state
        levelFinished = false;
        gamePaused = false;
        cameraX = 0;
        cameraY = 0;
        
        // Clear special item roll
        specialItemRolled = null;
        
        // Clear arrays (keep inventory and player health)
        kashaballs.length = 0;
        groundSlamEffects.length = 0;
        platformBreakingEffects.length = 0;
        dirtTiles.length = 0;
        
        // Create the selected level
        console.log('Calling createLevel...');
        createLevel(currentLevel);
        console.log('createLevel completed');
    
    // Reset player position after level is created
    // For level 2, find a safe spawn position on solid ground
    if (levelNum === 2 && window.worldMap) {
        // Find first solid tile from left side to spawn player
        let spawnX = 100;
        let spawnY = null;
        for (let tx = 0; tx < window.worldMap.width; tx++) {
            for (let ty = 1; ty < window.worldMap.height; ty++) {
                const tile = window.worldMap.getTile(tx, ty);
                const aboveTile = window.worldMap.getTile(tx, ty - 1);
                if (tile !== window.TILE_TYPE.EMPTY && tile !== window.TILE_TYPE.WATER && 
                    tile !== window.TILE_TYPE.OIL && tile !== window.TILE_TYPE.FIRE &&
                    aboveTile === window.TILE_TYPE.EMPTY) {
                    spawnX = tx * window.TILE_SIZE;
                    spawnY = (ty - 1) * window.TILE_SIZE - player.height;
                    break;
                }
            }
            if (spawnY !== null) break;
        }
        if (spawnY === null) {
            // Fallback spawn position
            spawnY = 470;
        }
        player.x = spawnX;
        player.y = spawnY;
    } else {
        // Default spawn for level 1 and other levels
        player.x = 100;
        player.y = 470;
    }
    
    player.velocityX = 0;
    player.velocityY = 0;
    
    // Clear button bounds
    window.levelFinishedButtonBounds = null;
    
    // Close level selector if it was open
    showLevelSelector = false;
    
        // Reset cheat code buffer
        cheatCodeBuffer = '';
        
        console.log(`*** Level ${levelNum} loaded successfully ***`);
    } catch (error) {
        console.error(`ERROR loading level ${levelNum}:`, error);
        console.error(error.stack);
        // Try to fallback to level 1
        console.log('Falling back to level 1...');
        currentLevel = 1;
        createLevel(1);
    }
}

// Game Loop

console.log('level.js loaded successfully');
