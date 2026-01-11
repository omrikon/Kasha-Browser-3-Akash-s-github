# Test Suite Documentation

## Overview

This directory contains a comprehensive test suite for the Kasha Browser Game. The tests are organized by system/module and can be run individually or all together using the test runner.

## Test Structure

### Test Files

- **test-framework.js** - Core test framework with assertion functions and test runner
- **01-core-tests.js** - Tests for core configuration and game state
- **02-systems-audio-tests.js** - Tests for audio system
- **02-systems-input-tests.js** - Tests for input system
- **02-systems-drawing-tests.js** - Tests for drawing/rendering system
- **02-systems-gameloop-tests.js** - Tests for game loop
- **02-systems-level-tests.js** - Tests for level system
- **03-classes-player-tests.js** - Tests for Player class
- **03-classes-inventory-tests.js** - Tests for Inventory class
- **03-classes-gameObjects-tests.js** - Tests for game object classes (Platform, Box, Kashaball, etc.)
- **03-classes-effects-tests.js** - Tests for visual effect classes
- **03-classes-particles-tests.js** - Tests for particle classes
- **04-creatures-tests.js** - Tests for creature classes (enemies, kashas)
- **05-world-tests.js** - Tests for TileMap/world system
- **integration-tests.js** - Tests for system interactions
- **test-runner.html** - HTML page to run all tests in a browser

## Running Tests

### Using the Test Runner (Recommended)

1. Open `test-runner.html` in a web browser
2. Click the "Run All Tests" button
3. View results in the console and on the page

### Using Browser Console

1. Open the main game in a browser
2. Open the browser's developer console (F12)
3. Run individual test suites:
   ```javascript
   runAllCoreTests();
   runAllAudioTests();
   runAllPlayerTests();
   // etc.
   ```

### Running All Tests

```javascript
runAllTests();
```

## Test Assertions

The test framework provides several assertion functions:

- `assertTrue(condition, message)` - Asserts that condition is true
- `assertFalse(condition, message)` - Asserts that condition is false
- `assertEquals(actual, expected, message)` - Asserts that two values are equal
- `assertNotEquals(actual, expected, message)` - Asserts that two values are not equal
- `assertNull(value, message)` - Asserts that value is null or undefined
- `assertNotNull(value, message)` - Asserts that value is not null or undefined
- `assertApproxEquals(actual, expected, tolerance, message)` - Asserts values are approximately equal
- `assertContains(array, value, message)` - Asserts array contains value
- `assertNotContains(array, value, message)` - Asserts array does not contain value

## Writing New Tests

To add a new test:

1. Create a test function:
   ```javascript
   const newTest = createTest('Test name', function() {
       // Test code here
       assertTrue(someCondition, 'Test message');
   });
   ```

2. Add it to a test suite:
   ```javascript
   const tests = [];
   tests.push(newTest);
   runTestSuite('Suite Name', tests);
   ```

## Test Coverage

The test suite covers:

- ✅ Core configuration and game state
- ✅ Audio system (music and sound effects)
- ✅ Input system (keyboard and mouse)
- ✅ Drawing/rendering system
- ✅ Game loop
- ✅ Level creation and management
- ✅ Player class (movement, combat, health)
- ✅ Inventory system
- ✅ Game objects (Platforms, Boxes, Kashaballs)
- ✅ Visual effects
- ✅ Particle system
- ✅ Creatures (enemies and kashas)
- ✅ TileMap/world system
- ✅ Integration between systems

## Notes

- Tests run in the browser environment where the game runs
- Some tests require game initialization (player, inventory, etc.)
- Tests that modify game state should restore original values when possible
- Check browser console for detailed test output
- Failed tests include error messages and expected vs actual values
