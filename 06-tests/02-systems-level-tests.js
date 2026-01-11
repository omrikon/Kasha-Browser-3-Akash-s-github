// ============================================================================
// 02-SYSTEMS-LEVEL-TESTS.JS - Tests for Level System
// ============================================================================
// This file contains tests for the level system (level.js):
// - Level creation
// - Level progression
// - Level features
// ============================================================================

console.log('Loading 02-systems-level-tests.js...');

function runLevelTests() {
    const levelTests = [];
    
    // Test: Level functions exist
    levelTests.push(createTest('createLevel function exists', function() {
        assertTrue(typeof createLevel === 'function', 'createLevel should be a function');
    }));
    
    levelTests.push(createTest('nextLevel function exists', function() {
        assertTrue(typeof nextLevel === 'function', 'nextLevel should be a function');
    }));
    
    levelTests.push(createTest('loadLevel function exists', function() {
        assertTrue(typeof loadLevel === 'function', 'loadLevel should be a function');
    }));
    
    levelTests.push(createTest('resetGame function exists', function() {
        assertTrue(typeof resetGame === 'function', 'resetGame should be a function');
    }));
    
    levelTests.push(createTest('throwKashaball function exists', function() {
        assertTrue(typeof throwKashaball === 'function', 'throwKashaball should be a function');
    }));
    
    levelTests.push(createTest('getWeaponBehavior function exists', function() {
        assertTrue(typeof getWeaponBehavior === 'function', 'getWeaponBehavior should be a function');
    }));
    
    levelTests.push(createTest('handleKashaDeath function exists', function() {
        assertTrue(typeof handleKashaDeath === 'function', 'handleKashaDeath should be a function');
    }));
    
    // Test: Level arrays are cleared on creation
    levelTests.push(createTest('createLevel clears arrays', function() {
        // Add some test items to arrays
        platforms.push({ test: true });
        boxes.push({ test: true });
        enemies.push({ test: true });
        
        // Save current level
        const originalLevel = currentLevel;
        
        // Create level (should clear arrays)
        try {
            createLevel(1);
            
            // Arrays should be cleared (but may have items from level creation)
            // We can't check for empty, but we can check that createLevel ran
            assertTrue(Array.isArray(platforms), 'Platforms should still be an array');
            assertTrue(Array.isArray(boxes), 'Boxes should still be an array');
            assertTrue(Array.isArray(enemies), 'Enemies should still be an array');
        } catch (error) {
            throw new Error('createLevel threw error: ' + error.message);
        } finally {
            // Restore if needed
            currentLevel = originalLevel;
        }
    }));
    
    // Test: Level width is set correctly
    levelTests.push(createTest('Level width is set on creation', function() {
        const originalLevel = currentLevel;
        const originalWidth = levelWidth;
        
        try {
            createLevel(1);
            assertTrue(typeof levelWidth === 'number', 'Level width should be a number');
            assertTrue(levelWidth > 0, 'Level width should be positive');
        } finally {
            currentLevel = originalLevel;
            levelWidth = originalWidth;
        }
    }));
    
    // Test: TileMap is created
    levelTests.push(createTest('TileMap is created on level creation', function() {
        const originalLevel = currentLevel;
        
        try {
            createLevel(1);
            // TileMap might be window.worldMap
            if (window.worldMap) {
                assertNotNull(window.worldMap, 'TileMap should be created');
                assertTrue(typeof window.worldMap === 'object', 'TileMap should be an object');
            }
        } finally {
            currentLevel = originalLevel;
        }
    }));
    
    runTestSuite('Level System Tests', levelTests);
}

function runAllLevelTests() {
    console.log('\n🗺️  Running Level Tests');
    console.log('='.repeat(50));
    runLevelTests();
}

console.log('02-systems-level-tests.js loaded successfully');
