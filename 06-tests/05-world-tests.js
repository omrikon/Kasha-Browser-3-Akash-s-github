// ============================================================================
// 05-WORLD-TESTS.JS - Tests for World/TileMap System
// ============================================================================
// This file contains tests for the TileMap system (tilemap.js):
// - TileMap initialization
// - Coordinate conversion
// - Tile access
// - Collision detection
// - Tile destruction
// ============================================================================

console.log('Loading 05-world-tests.js...');

function runWorldTests() {
    const worldTests = [];
    
    // Test: TileMap class exists
    worldTests.push(createTest('TileMap class exists', function() {
        assertTrue(typeof TileMap === 'function', 'TileMap class should exist');
    }));
    
    // Test: Tile constants exist
    worldTests.push(createTest('TILE_SIZE constant exists', function() {
        assertTrue(typeof window.TILE_SIZE === 'number', 'TILE_SIZE should be a number');
        assertTrue(window.TILE_SIZE > 0, 'TILE_SIZE should be positive');
    }));
    
    worldTests.push(createTest('TILE_TYPE object exists', function() {
        assertNotNull(window.TILE_TYPE, 'TILE_TYPE object should exist');
    }));
    
    worldTests.push(createTest('TILE_DEFINITIONS object exists', function() {
        assertNotNull(window.TILE_DEFINITIONS, 'TILE_DEFINITIONS object should exist');
    }));
    
    // Test: TileMap can be created
    worldTests.push(createTest('TileMap can be created', function() {
        try {
            const testMap = new TileMap(10, 10);
            assertNotNull(testMap, 'TileMap instance should be created');
            assertTrue(testMap instanceof TileMap, 'Should be instance of TileMap');
        } catch (error) {
            throw new Error('Failed to create TileMap: ' + error.message);
        }
    }));
    
    worldTests.push(createTest('TileMap initializes with dimensions', function() {
        const testMap = new TileMap(20, 15);
        assertEquals(testMap.width, 20, 'TileMap width should be set correctly');
        assertEquals(testMap.height, 15, 'TileMap height should be set correctly');
    }));
    
    // Test: TileMap methods exist
    worldTests.push(createTest('TileMap has pixelToTile method', function() {
        const testMap = new TileMap(10, 10);
        assertTrue(typeof testMap.pixelToTile === 'function', 'TileMap should have pixelToTile method');
    }));
    
    worldTests.push(createTest('TileMap has tileToPixel method', function() {
        const testMap = new TileMap(10, 10);
        assertTrue(typeof testMap.tileToPixel === 'function', 'TileMap should have tileToPixel method');
    }));
    
    worldTests.push(createTest('TileMap has getTile method', function() {
        const testMap = new TileMap(10, 10);
        assertTrue(typeof testMap.getTile === 'function', 'TileMap should have getTile method');
    }));
    
    worldTests.push(createTest('TileMap has setTile method', function() {
        const testMap = new TileMap(10, 10);
        assertTrue(typeof testMap.setTile === 'function', 'TileMap should have setTile method');
    }));
    
    worldTests.push(createTest('TileMap has isSolidTile method', function() {
        const testMap = new TileMap(10, 10);
        assertTrue(typeof testMap.isSolidTile === 'function', 'TileMap should have isSolidTile method');
    }));
    
    // Test: Coordinate conversion works
    worldTests.push(createTest('pixelToTile converts correctly', function() {
        const testMap = new TileMap(10, 10);
        const tileSize = window.TILE_SIZE || 16;
        const tile = testMap.pixelToTile(tileSize * 2);
        assertEquals(tile, 2, 'Pixel to tile conversion should work correctly');
    }));
    
    worldTests.push(createTest('tileToPixel converts correctly', function() {
        const testMap = new TileMap(10, 10);
        const tileSize = window.TILE_SIZE || 16;
        const pixel = testMap.tileToPixel(3);
        assertEquals(pixel, tileSize * 3, 'Tile to pixel conversion should work correctly');
    }));
    
    // Test: Tile access works
    worldTests.push(createTest('getTile returns EMPTY for new map', function() {
        const testMap = new TileMap(10, 10);
        const tile = testMap.getTile(5, 5);
        assertEquals(tile, window.TILE_TYPE.EMPTY, 'New map tiles should be EMPTY');
    }));
    
    worldTests.push(createTest('setTile sets tile correctly', function() {
        const testMap = new TileMap(10, 10);
        testMap.setTile(5, 5, window.TILE_TYPE.SOLID);
        const tile = testMap.getTile(5, 5);
        assertEquals(tile, window.TILE_TYPE.SOLID, 'Tile should be set correctly');
    }));
    
    // Test: Collision detection works
    worldTests.push(createTest('isSolidTile identifies solid tiles', function() {
        const testMap = new TileMap(10, 10);
        const isSolid = testMap.isSolidTile(window.TILE_TYPE.SOLID);
        assertTrue(isSolid, 'SOLID tile should be identified as solid');
    }));
    
    worldTests.push(createTest('isSolidTile identifies empty tiles', function() {
        const testMap = new TileMap(10, 10);
        const isSolid = testMap.isSolidTile(window.TILE_TYPE.EMPTY);
        assertFalse(isSolid, 'EMPTY tile should not be identified as solid');
    }));
    
    runTestSuite('World/TileMap Tests', worldTests);
}

function runAllWorldTests() {
    console.log('\n🌍 Running World Tests');
    console.log('='.repeat(50));
    runWorldTests();
}

console.log('05-world-tests.js loaded successfully');
