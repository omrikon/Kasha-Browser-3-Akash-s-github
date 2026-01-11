// ============================================================================
// 02-SYSTEMS-INPUT-TESTS.JS - Tests for Input System
// ============================================================================
// This file contains tests for the input system (input.js):
// - Keyboard input handling
// - Mouse input handling
// - Cheat code detection
// - Input state management
// ============================================================================

console.log('Loading 02-systems-input-tests.js...');

function runInputTests() {
    const inputTests = [];
    
    // Test: Keys object exists and is object
    inputTests.push(createTest('Keys object exists', function() {
        assertNotNull(keys, 'Keys object should exist');
        assertTrue(typeof keys === 'object', 'Keys should be an object');
    }));
    
    // Test: Helper functions exist
    inputTests.push(createTest('getPauseMenuButtonAtPosition function exists', function() {
        assertTrue(typeof getPauseMenuButtonAtPosition === 'function', 
                   'getPauseMenuButtonAtPosition should be a function');
    }));
    
    inputTests.push(createTest('getInventorySlotAtPosition function exists', function() {
        assertTrue(typeof getInventorySlotAtPosition === 'function', 
                   'getInventorySlotAtPosition should be a function');
    }));
    
    inputTests.push(createTest('getHUDInventorySlotAtPosition function exists', function() {
        assertTrue(typeof getHUDInventorySlotAtPosition === 'function', 
                   'getHUDInventorySlotAtPosition should be a function');
    }));
    
    // Test: Input disabled when game paused
    inputTests.push(createTest('Keys object structure allows key tracking', function() {
        // Test that we can set and get keys
        const testKey = 'testkey123';
        keys[testKey] = true;
        assertTrue(keys[testKey] === true, 'Should be able to set key state');
        delete keys[testKey];
    }));
    
    // Test: Mouse position tracking
    inputTests.push(createTest('Raw mouse position variables exist', function() {
        assertTrue(typeof rawMouseX === 'number', 'rawMouseX should be a number');
        assertTrue(typeof rawMouseY === 'number', 'rawMouseY should be a number');
    }));
    
    inputTests.push(createTest('World mouse position variables exist', function() {
        assertTrue(typeof mouseX === 'number', 'mouseX should be a number');
        assertTrue(typeof mouseY === 'number', 'mouseY should be a number');
    }));
    
    // Test: Cheat code buffer exists
    inputTests.push(createTest('Cheat code buffer exists', function() {
        assertTrue(typeof cheatCodeBuffer === 'string', 'Cheat code buffer should be a string');
    }));
    
    // Test: Helper function returns null when not paused
    inputTests.push(createTest('getPauseMenuButtonAtPosition returns null when not paused', function() {
        const originalPaused = gamePaused;
        gamePaused = false;
        const result = getPauseMenuButtonAtPosition(100, 100);
        assertNull(result, 'Should return null when game not paused');
        gamePaused = originalPaused;
    }));
    
    inputTests.push(createTest('getInventorySlotAtPosition returns null when not paused', function() {
        const originalPaused = gamePaused;
        gamePaused = false;
        const result = getInventorySlotAtPosition(100, 100);
        assertNull(result, 'Should return null when game not paused');
        gamePaused = originalPaused;
    }));
    
    inputTests.push(createTest('getHUDInventorySlotAtPosition returns null when paused', function() {
        const originalPaused = gamePaused;
        gamePaused = true;
        const result = getHUDInventorySlotAtPosition(100, 100);
        assertNull(result, 'Should return null when game paused');
        gamePaused = originalPaused;
    }));
    
    runTestSuite('Input System Tests', inputTests);
}

function runAllInputTests() {
    console.log('\n⌨️  Running Input Tests');
    console.log('='.repeat(50));
    runInputTests();
}

console.log('02-systems-input-tests.js loaded successfully');
