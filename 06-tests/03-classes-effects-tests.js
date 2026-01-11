// ============================================================================
// 03-CLASSES-EFFECTS-TESTS.JS - Tests for Effect Classes
// ============================================================================
// This file contains tests for effect classes (effects.js):
// - GroundSlamEffect class
// - PlatformBreakingEffect class
// ============================================================================

console.log('Loading 03-classes-effects-tests.js...');

function runEffectTests() {
    const effectTests = [];
    
    // Test: Classes exist
    effectTests.push(createTest('GroundSlamEffect class exists', function() {
        assertTrue(typeof GroundSlamEffect === 'function', 'GroundSlamEffect class should exist');
    }));
    
    effectTests.push(createTest('PlatformBreakingEffect class exists', function() {
        assertTrue(typeof PlatformBreakingEffect === 'function', 'PlatformBreakingEffect class should exist');
    }));
    
    // Test: GroundSlamEffect can be created
    effectTests.push(createTest('GroundSlamEffect can be created', function() {
        try {
            const testEffect = new GroundSlamEffect(100, 200);
            assertNotNull(testEffect, 'GroundSlamEffect instance should be created');
            assertTrue(testEffect instanceof GroundSlamEffect, 'Should be instance of GroundSlamEffect');
        } catch (error) {
            throw new Error('Failed to create GroundSlamEffect: ' + error.message);
        }
    }));
    
    effectTests.push(createTest('GroundSlamEffect initializes with position', function() {
        const testEffect = new GroundSlamEffect(150, 250);
        assertEquals(testEffect.x, 150, 'Effect X should be set correctly');
        assertEquals(testEffect.y, 250, 'Effect Y should be set correctly');
    }));
    
    effectTests.push(createTest('GroundSlamEffect initializes as active', function() {
        const testEffect = new GroundSlamEffect(100, 200);
        assertTrue(testEffect.active, 'Effect should start as active');
    }));
    
    effectTests.push(createTest('GroundSlamEffect has update method', function() {
        const testEffect = new GroundSlamEffect(100, 200);
        assertTrue(typeof testEffect.update === 'function', 'Effect should have update method');
    }));
    
    effectTests.push(createTest('GroundSlamEffect has draw method', function() {
        const testEffect = new GroundSlamEffect(100, 200);
        assertTrue(typeof testEffect.draw === 'function', 'Effect should have draw method');
    }));
    
    // Test: PlatformBreakingEffect can be created
    effectTests.push(createTest('PlatformBreakingEffect can be created', function() {
        try {
            const testEffect = new PlatformBreakingEffect(100, 200, 300, 50);
            assertNotNull(testEffect, 'PlatformBreakingEffect instance should be created');
            assertTrue(testEffect instanceof PlatformBreakingEffect, 'Should be instance of PlatformBreakingEffect');
        } catch (error) {
            throw new Error('Failed to create PlatformBreakingEffect: ' + error.message);
        }
    }));
    
    effectTests.push(createTest('PlatformBreakingEffect initializes with dimensions', function() {
        const testEffect = new PlatformBreakingEffect(100, 200, 300, 50);
        assertEquals(testEffect.x, 100, 'Effect X should be set correctly');
        assertEquals(testEffect.y, 200, 'Effect Y should be set correctly');
        assertEquals(testEffect.width, 300, 'Effect width should be set correctly');
        assertEquals(testEffect.height, 50, 'Effect height should be set correctly');
    }));
    
    effectTests.push(createTest('PlatformBreakingEffect initializes as active', function() {
        const testEffect = new PlatformBreakingEffect(100, 200, 300, 50);
        assertTrue(testEffect.active, 'Effect should start as active');
    }));
    
    runTestSuite('Effect Class Tests', effectTests);
}

function runAllEffectTests() {
    console.log('\n✨ Running Effect Tests');
    console.log('='.repeat(50));
    runEffectTests();
}

console.log('03-classes-effects-tests.js loaded successfully');
