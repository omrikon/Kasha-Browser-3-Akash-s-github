// ============================================================================
// 01-CORE-TESTS.JS - Tests for Core Configuration and Game State
// ============================================================================
// This file contains tests for the core game files:
// - config.js: Game configuration, canvas setup, weapon definitions
// - gameState.js: Game state variables, arrays, flags
// ============================================================================

// This message appears in the browser console when the file loads
console.log('Loading 01-core-tests.js...');

// ============================================================================
// CONFIG.JS TESTS
// ============================================================================
// These tests check if the game configuration is set up correctly.
// ============================================================================

function runConfigTests() {
    const configTests = [];
    
    // Test: Canvas element exists
    configTests.push(createTest('Canvas element exists', function() {
        assertNotNull(canvas, 'Canvas element should exist');
        assertNotNull(ctx, 'Canvas context should exist');
    }));
    
    // Test: Internal canvas exists
    configTests.push(createTest('Internal canvas exists', function() {
        assertNotNull(internalCanvas, 'Internal canvas should exist');
        assertNotNull(internalCtx, 'Internal canvas context should exist');
    }));
    
    // Test: Pixel scale is set correctly
    configTests.push(createTest('Pixel scale is 4', function() {
        assertEquals(pixelScale, 4, 'Pixel scale should be 4 for Terraria-style graphics');
    }));
    
    // Test: Internal canvas dimensions are calculated correctly
    configTests.push(createTest('Internal canvas dimensions calculated correctly', function() {
        const expectedWidth = Math.floor(canvas.width / pixelScale);
        const expectedHeight = Math.floor(canvas.height / pixelScale);
        assertEquals(internalWidth, expectedWidth, 'Internal width should match calculated value');
        assertEquals(internalHeight, expectedHeight, 'Internal height should match calculated value');
    }));
    
    // Test: Image smoothing is disabled
    configTests.push(createTest('Image smoothing disabled on main canvas', function() {
        assertFalse(ctx.imageSmoothingEnabled, 'Image smoothing should be disabled on main canvas for pixel art');
    }));
    
    configTests.push(createTest('Image smoothing disabled on internal canvas', function() {
        assertFalse(internalCtx.imageSmoothingEnabled, 'Image smoothing should be disabled on internal canvas');
    }));
    
    // Test: UI elements exist
    configTests.push(createTest('Kashaball count element exists', function() {
        assertNotNull(kashaballCountElement, 'Kashaball count element should exist');
    }));
    
    configTests.push(createTest('Kasha count element exists', function() {
        assertNotNull(kashaCountElement, 'Kasha count element should exist');
    }));
    
    configTests.push(createTest('Health display element exists', function() {
        assertNotNull(healthDisplayElement, 'Health display element should exist');
    }));
    
    // Test: Weapon types are defined
    configTests.push(createTest('WEAPON_TYPES object exists', function() {
        assertNotNull(WEAPON_TYPES, 'WEAPON_TYPES object should exist');
    }));
    
    configTests.push(createTest('Sword weapon type exists', function() {
        assertNotNull(WEAPON_TYPES.sword, 'Sword weapon type should exist');
    }));
    
    configTests.push(createTest('Axe weapon type exists', function() {
        assertNotNull(WEAPON_TYPES.axe, 'Axe weapon type should exist');
    }));
    
    configTests.push(createTest('Staff weapon type exists', function() {
        assertNotNull(WEAPON_TYPES.staff, 'Staff weapon type should exist');
    }));
    
    configTests.push(createTest('Dagger weapon type exists', function() {
        assertNotNull(WEAPON_TYPES.dagger, 'Dagger weapon type should exist');
    }));
    
    // Test: Each weapon type has required properties
    function testWeaponProperties(weaponType, typeName) {
        configTests.push(createTest(`${typeName} has windup property`, function() {
            assertNotNull(WEAPON_TYPES[weaponType].windup, `${typeName} should have windup property`);
            assertTrue(typeof WEAPON_TYPES[weaponType].windup === 'number', `${typeName} windup should be a number`);
        }));
        
        configTests.push(createTest(`${typeName} has attack property`, function() {
            assertNotNull(WEAPON_TYPES[weaponType].attack, `${typeName} should have attack property`);
            assertTrue(typeof WEAPON_TYPES[weaponType].attack === 'number', `${typeName} attack should be a number`);
        }));
        
        configTests.push(createTest(`${typeName} has recovery property`, function() {
            assertNotNull(WEAPON_TYPES[weaponType].recovery, `${typeName} should have recovery property`);
            assertTrue(typeof WEAPON_TYPES[weaponType].recovery === 'number', `${typeName} recovery should be a number`);
        }));
        
        configTests.push(createTest(`${typeName} has range property`, function() {
            assertNotNull(WEAPON_TYPES[weaponType].range, `${typeName} should have range property`);
            assertTrue(typeof WEAPON_TYPES[weaponType].range === 'number', `${typeName} range should be a number`);
            assertTrue(WEAPON_TYPES[weaponType].range > 0, `${typeName} range should be positive`);
        }));
        
        configTests.push(createTest(`${typeName} has cooldown property`, function() {
            assertNotNull(WEAPON_TYPES[weaponType].cooldown, `${typeName} should have cooldown property`);
            assertTrue(typeof WEAPON_TYPES[weaponType].cooldown === 'number', `${typeName} cooldown should be a number`);
            assertTrue(WEAPON_TYPES[weaponType].cooldown > 0, `${typeName} cooldown should be positive`);
        }));
        
        configTests.push(createTest(`${typeName} has color property`, function() {
            assertNotNull(WEAPON_TYPES[weaponType].color, `${typeName} should have color property`);
            assertTrue(typeof WEAPON_TYPES[weaponType].color === 'string', `${typeName} color should be a string`);
        }));
    }
    
    testWeaponProperties('sword', 'Sword');
    testWeaponProperties('axe', 'Axe');
    testWeaponProperties('staff', 'Staff');
    testWeaponProperties('dagger', 'Dagger');
    
    // Test: Cheat code constant exists
    configTests.push(createTest('Cheat code constant exists', function() {
        assertNotNull(CHEAT_CODE, 'CHEAT_CODE constant should exist');
        assertEquals(CHEAT_CODE, 'lop', 'Cheat code should be "lop"');
    }));
    
    // Test: Max levels constant exists
    configTests.push(createTest('MAX_LEVELS constant exists', function() {
        assertNotNull(MAX_LEVELS, 'MAX_LEVELS constant should exist');
        assertTrue(typeof MAX_LEVELS === 'number', 'MAX_LEVELS should be a number');
        assertTrue(MAX_LEVELS > 0, 'MAX_LEVELS should be positive');
    }));
    
    runTestSuite('Config Tests', configTests);
}

// ============================================================================
// GAMESTATE.JS TESTS
// ============================================================================
// These tests check if the game state variables are initialized correctly.
// ============================================================================

function runGameStateTests() {
    const gameStateTests = [];
    
    // Test: Progress variables start at 0
    gameStateTests.push(createTest('Kashaballs collected starts at 0', function() {
        assertEquals(kashaballsCollected, 0, 'Kashaballs collected should start at 0');
    }));
    
    gameStateTests.push(createTest('Kashas caught starts at 0', function() {
        assertEquals(kashasCaught, 0, 'Kashas caught should start at 0');
    }));
    
    // Test: Camera starts at (0, 0)
    gameStateTests.push(createTest('Camera X starts at 0', function() {
        assertEquals(cameraX, 0, 'Camera X should start at 0');
    }));
    
    gameStateTests.push(createTest('Camera Y starts at 0', function() {
        assertEquals(cameraY, 0, 'Camera Y should start at 0');
    }));
    
    // Test: Mouse position starts at 0
    gameStateTests.push(createTest('Mouse X starts at 0', function() {
        assertEquals(mouseX, 0, 'Mouse X should start at 0');
    }));
    
    gameStateTests.push(createTest('Mouse Y starts at 0', function() {
        assertEquals(mouseY, 0, 'Mouse Y should start at 0');
    }));
    
    gameStateTests.push(createTest('Raw mouse X starts at 0', function() {
        assertEquals(rawMouseX, 0, 'Raw mouse X should start at 0');
    }));
    
    gameStateTests.push(createTest('Raw mouse Y starts at 0', function() {
        assertEquals(rawMouseY, 0, 'Raw mouse Y should start at 0');
    }));
    
    // Test: Flags initialize to false
    gameStateTests.push(createTest('Game paused flag starts as false', function() {
        assertFalse(gamePaused, 'Game should not be paused initially');
    }));
    
    gameStateTests.push(createTest('Music playing flag starts as false', function() {
        assertFalse(musicPlaying, 'Music should not be playing initially');
    }));
    
    gameStateTests.push(createTest('Music muted flag starts as false', function() {
        assertFalse(musicMuted, 'Music should not be muted initially');
    }));
    
    gameStateTests.push(createTest('Level finished flag starts as false', function() {
        assertFalse(levelFinished, 'Level should not be finished initially');
    }));
    
    gameStateTests.push(createTest('Game over flag starts as false', function() {
        assertFalse(gameOver, 'Game should not be over initially');
    }));
    
    gameStateTests.push(createTest('Showing trajectory flag starts as false', function() {
        assertFalse(showingTrajectory, 'Trajectory should not be showing initially');
    }));
    
    gameStateTests.push(createTest('Level selector flag starts as false', function() {
        assertFalse(showLevelSelector, 'Level selector should not be showing initially');
    }));
    
    // Test: Level system variables
    gameStateTests.push(createTest('Current level starts at 1', function() {
        assertEquals(currentLevel, 1, 'Current level should start at 1');
    }));
    
    gameStateTests.push(createTest('Level width is set', function() {
        assertTrue(typeof levelWidth === 'number', 'Level width should be a number');
        assertTrue(levelWidth > 0, 'Level width should be positive');
    }));
    
    gameStateTests.push(createTest('Special item rolled starts as null', function() {
        assertNull(specialItemRolled, 'Special item rolled should start as null');
    }));
    
    // Test: Arrays initialize empty
    gameStateTests.push(createTest('Platforms array exists and is array', function() {
        assertNotNull(platforms, 'Platforms array should exist');
        assertTrue(Array.isArray(platforms), 'Platforms should be an array');
    }));
    
    gameStateTests.push(createTest('Boxes array exists and is array', function() {
        assertNotNull(boxes, 'Boxes array should exist');
        assertTrue(Array.isArray(boxes), 'Boxes should be an array');
    }));
    
    gameStateTests.push(createTest('Kashaballs array exists and is array', function() {
        assertNotNull(kashaballs, 'Kashaballs array should exist');
        assertTrue(Array.isArray(kashaballs), 'Kashaballs should be an array');
    }));
    
    gameStateTests.push(createTest('Enemies array exists and is array', function() {
        assertNotNull(enemies, 'Enemies array should exist');
        assertTrue(Array.isArray(enemies), 'Enemies should be an array');
    }));
    
    gameStateTests.push(createTest('Kashas array exists and is array', function() {
        assertNotNull(kashas, 'Kashas array should exist');
        assertTrue(Array.isArray(kashas), 'Kashas should be an array');
    }));
    
    gameStateTests.push(createTest('Ground slam effects array exists', function() {
        assertNotNull(groundSlamEffects, 'Ground slam effects array should exist');
        assertTrue(Array.isArray(groundSlamEffects), 'Ground slam effects should be an array');
    }));
    
    gameStateTests.push(createTest('Platform breaking effects array exists', function() {
        assertNotNull(platformBreakingEffects, 'Platform breaking effects array should exist');
        assertTrue(Array.isArray(platformBreakingEffects), 'Platform breaking effects should be an array');
    }));
    
    gameStateTests.push(createTest('Dirt tiles array exists', function() {
        assertNotNull(dirtTiles, 'Dirt tiles array should exist');
        assertTrue(Array.isArray(dirtTiles), 'Dirt tiles should be an array');
    }));
    
    gameStateTests.push(createTest('Kasha corpses array exists', function() {
        assertNotNull(kashaCorpses, 'Kasha corpses array should exist');
        assertTrue(Array.isArray(kashaCorpses), 'Kasha corpses should be an array');
    }));
    
    // Test: Keys object exists
    gameStateTests.push(createTest('Keys object exists', function() {
        assertNotNull(keys, 'Keys object should exist');
        assertTrue(typeof keys === 'object', 'Keys should be an object');
    }));
    
    // Test: Player and inventory start as null
    gameStateTests.push(createTest('Player starts as null', function() {
        assertNull(player, 'Player should start as null (created in main.js)');
    }));
    
    gameStateTests.push(createTest('Inventory starts as null', function() {
        assertNull(inventory, 'Inventory should start as null (created in main.js)');
    }));
    
    // Test: Fusion slots start as null
    gameStateTests.push(createTest('Fusion weapon slot starts as null', function() {
        assertNull(fusionWeaponSlot, 'Fusion weapon slot should start as null');
    }));
    
    gameStateTests.push(createTest('Fusion core slot starts as null', function() {
        assertNull(fusionCoreSlot, 'Fusion core slot should start as null');
    }));
    
    // Test: Cheat code buffer starts empty
    gameStateTests.push(createTest('Cheat code buffer starts empty', function() {
        assertEquals(cheatCodeBuffer, '', 'Cheat code buffer should start empty');
    }));
    
    runTestSuite('GameState Tests', gameStateTests);
}

// Run all core tests
function runAllCoreTests() {
    console.log('\n🎯 Running Core Tests');
    console.log('='.repeat(50));
    runConfigTests();
    runGameStateTests();
}

console.log('01-core-tests.js loaded successfully');
