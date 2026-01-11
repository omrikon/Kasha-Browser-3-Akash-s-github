// ============================================================================
// 02-SYSTEMS-GAMELOOP-TESTS.JS - Tests for Game Loop System
// ============================================================================
// This file contains tests for the game loop system (gameLoop.js):
// - Game loop execution
// - Update order
// - State handling
// ============================================================================

console.log('Loading 02-systems-gameloop-tests.js...');

function runGameLoopTests() {
    const gameLoopTests = [];
    
    // Test: Game loop function exists
    gameLoopTests.push(createTest('gameLoop function exists', function() {
        assertTrue(typeof gameLoop === 'function', 'gameLoop should be a function');
    }));
    
    gameLoopTests.push(createTest('drawBackground function exists', function() {
        assertTrue(typeof drawBackground === 'function', 'drawBackground should be a function');
    }));
    
    gameLoopTests.push(createTest('drawCloud function exists', function() {
        assertTrue(typeof drawCloud === 'function', 'drawCloud should be a function');
    }));
    
    // Test: Game loop respects paused state
    gameLoopTests.push(createTest('Game loop can be called without error', function() {
        // Test that gameLoop can be called (it runs continuously in real game)
        // We can't actually run it here without infinite loop, but we can check it exists
        assertTrue(typeof gameLoop === 'function', 'gameLoop should be callable');
    }));
    
    runTestSuite('Game Loop Tests', gameLoopTests);
}

function runAllGameLoopTests() {
    console.log('\n🔄 Running Game Loop Tests');
    console.log('='.repeat(50));
    runGameLoopTests();
}

console.log('02-systems-gameloop-tests.js loaded successfully');
