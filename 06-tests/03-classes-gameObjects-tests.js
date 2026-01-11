// ============================================================================
// 03-CLASSES-GAMEOBJECTS-TESTS.JS - Tests for Game Object Classes
// ============================================================================
// This file contains tests for game object classes (gameObjects.js):
// - Platform class
// - Box class
// - Kashaball class
// - KashaCorpse class
// ============================================================================

console.log('Loading 03-classes-gameObjects-tests.js...');

function runGameObjectTests() {
    const gameObjectTests = [];
    
    // Test: Classes exist
    gameObjectTests.push(createTest('Platform class exists', function() {
        assertTrue(typeof Platform === 'function', 'Platform class should exist');
    }));
    
    gameObjectTests.push(createTest('Box class exists', function() {
        assertTrue(typeof Box === 'function', 'Box class should exist');
    }));
    
    gameObjectTests.push(createTest('Kashaball class exists', function() {
        assertTrue(typeof Kashaball === 'function', 'Kashaball class should exist');
    }));
    
    gameObjectTests.push(createTest('KashaCorpse class exists', function() {
        assertTrue(typeof KashaCorpse === 'function', 'KashaCorpse class should exist');
    }));
    
    // Test: Platform can be created
    gameObjectTests.push(createTest('Platform can be created', function() {
        try {
            const testPlatform = new Platform(100, 200, 300, 50);
            assertNotNull(testPlatform, 'Platform instance should be created');
            assertTrue(testPlatform instanceof Platform, 'Should be instance of Platform');
        } catch (error) {
            throw new Error('Failed to create Platform: ' + error.message);
        }
    }));
    
    gameObjectTests.push(createTest('Platform initializes with position and size', function() {
        const testPlatform = new Platform(100, 200, 300, 50);
        assertEquals(testPlatform.x, 100, 'Platform X should be set correctly');
        assertEquals(testPlatform.y, 200, 'Platform Y should be set correctly');
        assertEquals(testPlatform.width, 300, 'Platform width should be set correctly');
        assertEquals(testPlatform.height, 50, 'Platform height should be set correctly');
    }));
    
    // Test: Box can be created
    gameObjectTests.push(createTest('Box can be created', function() {
        try {
            const testBox = new Box(150, 250);
            assertNotNull(testBox, 'Box instance should be created');
            assertTrue(testBox instanceof Box, 'Should be instance of Box');
        } catch (error) {
            throw new Error('Failed to create Box: ' + error.message);
        }
    }));
    
    gameObjectTests.push(createTest('Box initializes not hit', function() {
        const testBox = new Box(150, 250);
        assertFalse(testBox.hit, 'Box should start not hit');
        assertFalse(testBox.kashaballReleased, 'Box should start with no kashaball released');
    }));
    
    gameObjectTests.push(createTest('Box has checkHit method', function() {
        const testBox = new Box(150, 250);
        assertTrue(typeof testBox.checkHit === 'function', 'Box should have checkHit method');
    }));
    
    // Test: Kashaball can be created
    gameObjectTests.push(createTest('Kashaball can be created', function() {
        try {
            const testKashaball = new Kashaball(100, 100);
            assertNotNull(testKashaball, 'Kashaball instance should be created');
            assertTrue(testKashaball instanceof Kashaball, 'Should be instance of Kashaball');
        } catch (error) {
            throw new Error('Failed to create Kashaball: ' + error.message);
        }
    }));
    
    gameObjectTests.push(createTest('Kashaball initializes not collected', function() {
        const testKashaball = new Kashaball(100, 100);
        assertFalse(testKashaball.collected, 'Kashaball should start not collected');
    }));
    
    gameObjectTests.push(createTest('Kashaball has update method', function() {
        const testKashaball = new Kashaball(100, 100);
        assertTrue(typeof testKashaball.update === 'function', 'Kashaball should have update method');
    }));
    
    gameObjectTests.push(createTest('Kashaball has checkCollection method', function() {
        const testKashaball = new Kashaball(100, 100);
        assertTrue(typeof testKashaball.checkCollection === 'function', 'Kashaball should have checkCollection method');
    }));
    
    // Test: KashaCorpse can be created
    gameObjectTests.push(createTest('KashaCorpse can be created', function() {
        try {
            const testCorpse = new KashaCorpse(100, 100, { type: 'test' });
            assertNotNull(testCorpse, 'KashaCorpse instance should be created');
            assertTrue(testCorpse instanceof KashaCorpse, 'Should be instance of KashaCorpse');
        } catch (error) {
            throw new Error('Failed to create KashaCorpse: ' + error.message);
        }
    }));
    
    gameObjectTests.push(createTest('KashaCorpse initializes not extracted', function() {
        const testCorpse = new KashaCorpse(100, 100, { type: 'test' });
        assertFalse(testCorpse.extracted, 'KashaCorpse should start not extracted');
    }));
    
    gameObjectTests.push(createTest('KashaCorpse has extractCore method', function() {
        const testCorpse = new KashaCorpse(100, 100, { type: 'test' });
        assertTrue(typeof testCorpse.extractCore === 'function', 'KashaCorpse should have extractCore method');
    }));
    
    runTestSuite('Game Object Tests', gameObjectTests);
}

function runAllGameObjectTests() {
    console.log('\n🎮 Running Game Object Tests');
    console.log('='.repeat(50));
    runGameObjectTests();
}

console.log('03-classes-gameObjects-tests.js loaded successfully');
