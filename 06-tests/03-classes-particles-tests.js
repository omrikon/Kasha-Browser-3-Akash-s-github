// ============================================================================
// 03-CLASSES-PARTICLES-TESTS.JS - Tests for Particle Classes
// ============================================================================
// This file contains tests for particle classes (particles.js):
// - DirtTile class
// ============================================================================

console.log('Loading 03-classes-particles-tests.js...');

function runParticleTests() {
    const particleTests = [];
    
    // Test: DirtTile class exists
    particleTests.push(createTest('DirtTile class exists', function() {
        assertTrue(typeof DirtTile === 'function', 'DirtTile class should exist');
    }));
    
    // Test: DirtTile can be created
    particleTests.push(createTest('DirtTile can be created', function() {
        try {
            const testParticle = new DirtTile(100, 200);
            assertNotNull(testParticle, 'DirtTile instance should be created');
            assertTrue(testParticle instanceof DirtTile, 'Should be instance of DirtTile');
        } catch (error) {
            throw new Error('Failed to create DirtTile: ' + error.message);
        }
    }));
    
    particleTests.push(createTest('DirtTile initializes with position', function() {
        const testParticle = new DirtTile(150, 250);
        assertEquals(testParticle.x, 150, 'Particle X should be set correctly');
        assertEquals(testParticle.y, 250, 'Particle Y should be set correctly');
    }));
    
    particleTests.push(createTest('DirtTile initializes as active', function() {
        const testParticle = new DirtTile(100, 200);
        assertTrue(testParticle.active, 'Particle should start as active');
    }));
    
    particleTests.push(createTest('DirtTile has update method', function() {
        const testParticle = new DirtTile(100, 200);
        assertTrue(typeof testParticle.update === 'function', 'Particle should have update method');
    }));
    
    particleTests.push(createTest('DirtTile has draw method', function() {
        const testParticle = new DirtTile(100, 200);
        assertTrue(typeof testParticle.draw === 'function', 'Particle should have draw method');
    }));
    
    runTestSuite('Particle Class Tests', particleTests);
}

function runAllParticleTests() {
    console.log('\n🌫️  Running Particle Tests');
    console.log('='.repeat(50));
    runParticleTests();
}

console.log('03-classes-particles-tests.js loaded successfully');
