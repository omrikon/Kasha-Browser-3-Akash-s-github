// ============================================================================
// 02-SYSTEMS-DRAWING-TESTS.JS - Tests for Drawing System
// ============================================================================
// This file contains tests for the drawing system (drawing.js):
// - Health display updates
// - Trajectory drawing
// - Camera system
// - UI drawing functions
// ============================================================================

console.log('Loading 02-systems-drawing-tests.js...');

function runDrawingTests() {
    const drawingTests = [];
    
    // Test: Drawing functions exist
    drawingTests.push(createTest('updateHealthDisplay function exists', function() {
        assertTrue(typeof updateHealthDisplay === 'function', 'updateHealthDisplay should be a function');
    }));
    
    drawingTests.push(createTest('drawTrajectory function exists', function() {
        assertTrue(typeof drawTrajectory === 'function', 'drawTrajectory should be a function');
    }));
    
    drawingTests.push(createTest('updateCamera function exists', function() {
        assertTrue(typeof updateCamera === 'function', 'updateCamera should be a function');
    }));
    
    drawingTests.push(createTest('drawPauseMenu function exists', function() {
        assertTrue(typeof drawPauseMenu === 'function', 'drawPauseMenu should be a function');
    }));
    
    drawingTests.push(createTest('drawLevelFinished function exists', function() {
        assertTrue(typeof drawLevelFinished === 'function', 'drawLevelFinished should be a function');
    }));
    
    drawingTests.push(createTest('drawGameOver function exists', function() {
        assertTrue(typeof drawGameOver === 'function', 'drawGameOver should be a function');
    }));
    
    drawingTests.push(createTest('drawLevelSelector function exists', function() {
        assertTrue(typeof drawLevelSelector === 'function', 'drawLevelSelector should be a function');
    }));
    
    drawingTests.push(createTest('drawInventoryHUD function exists', function() {
        assertTrue(typeof drawInventoryHUD === 'function', 'drawInventoryHUD should be a function');
    }));
    
    drawingTests.push(createTest('drawInventorySlot function exists', function() {
        assertTrue(typeof drawInventorySlot === 'function', 'drawInventorySlot should be a function');
    }));
    
    drawingTests.push(createTest('drawTileMap function exists', function() {
        assertTrue(typeof drawTileMap === 'function', 'drawTileMap should be a function');
    }));
    
    drawingTests.push(createTest('drawDirtTiles function exists', function() {
        assertTrue(typeof drawDirtTiles === 'function', 'drawDirtTiles should be a function');
    }));
    
    drawingTests.push(createTest('drawBackground function exists', function() {
        assertTrue(typeof drawBackground === 'function', 'drawBackground should be a function');
    }));
    
    // Test: Health display updates correctly when player exists
    drawingTests.push(createTest('updateHealthDisplay updates when player exists', function() {
        if (player) {
            const originalHealth = player.health;
            const originalMaxHealth = player.maxHealth;
            
            // Set player health
            player.health = 4;
            player.maxHealth = 6;
            
            // Call update function (should not throw)
            try {
                updateHealthDisplay();
                assertTrue(true, 'updateHealthDisplay should execute without error');
            } catch (error) {
                throw new Error('updateHealthDisplay threw error: ' + error.message);
            }
            
            // Restore original health
            player.health = originalHealth;
            player.maxHealth = originalMaxHealth;
            updateHealthDisplay();
        }
    }));
    
    // Test: Camera doesn't go negative
    drawingTests.push(createTest('Camera X does not go negative', function() {
        if (player) {
            const originalCameraX = cameraX;
            const originalPlayerX = player.x;
            
            // Move player to left edge
            player.x = 0;
            updateCamera();
            
            assertTrue(cameraX >= 0, 'Camera X should not be negative');
            
            // Restore
            cameraX = originalCameraX;
            player.x = originalPlayerX;
        }
    }));
    
    // Test: Camera clamps to level boundaries
    drawingTests.push(createTest('Camera X does not exceed level width', function() {
        if (player && levelWidth) {
            const originalCameraX = cameraX;
            const originalPlayerX = player.x;
            
            // Move player to right edge
            player.x = levelWidth - player.width;
            updateCamera();
            
            const maxCameraX = levelWidth - canvas.width * pixelScale;
            assertTrue(cameraX <= maxCameraX, 'Camera X should not exceed level width');
            
            // Restore
            cameraX = originalCameraX;
            player.x = originalPlayerX;
        }
    }));
    
    runTestSuite('Drawing System Tests', drawingTests);
}

function runAllDrawingTests() {
    console.log('\n🎨 Running Drawing Tests');
    console.log('='.repeat(50));
    runDrawingTests();
}

console.log('02-systems-drawing-tests.js loaded successfully');
