// ============================================================================
// 04-CREATURES-TESTS.JS - Tests for Creature Classes
// ============================================================================
// This file contains tests for creature classes:
// - MaroonBlobEnemy1 class
// - CassieDuck class
// ============================================================================

console.log('Loading 04-creatures-tests.js...');

function runCreatureTests() {
    const creatureTests = [];
    
    // Test: Enemy class exists
    creatureTests.push(createTest('MaroonBlobEnemy1 class exists', function() {
        assertTrue(typeof MaroonBlobEnemy1 === 'function', 'MaroonBlobEnemy1 class should exist');
    }));
    
    // Test: Enemy can be created
    creatureTests.push(createTest('MaroonBlobEnemy1 can be created', function() {
        try {
            const testEnemy = new MaroonBlobEnemy1(100, 200);
            assertNotNull(testEnemy, 'Enemy instance should be created');
            assertTrue(testEnemy instanceof MaroonBlobEnemy1, 'Should be instance of MaroonBlobEnemy1');
        } catch (error) {
            throw new Error('Failed to create Enemy: ' + error.message);
        }
    }));
    
    creatureTests.push(createTest('Enemy initializes with health', function() {
        const testEnemy = new MaroonBlobEnemy1(100, 200);
        assertTrue(typeof testEnemy.health === 'number', 'Enemy health should be a number');
        assertTrue(testEnemy.health > 0, 'Enemy health should be positive');
    }));
    
    creatureTests.push(createTest('Enemy initializes not dead', function() {
        const testEnemy = new MaroonBlobEnemy1(100, 200);
        assertFalse(testEnemy.dead, 'Enemy should start not dead');
    }));
    
    creatureTests.push(createTest('Enemy has takeDamage method', function() {
        const testEnemy = new MaroonBlobEnemy1(100, 200);
        assertTrue(typeof testEnemy.takeDamage === 'function', 'Enemy should have takeDamage method');
    }));
    
    creatureTests.push(createTest('Enemy has update method', function() {
        const testEnemy = new MaroonBlobEnemy1(100, 200);
        assertTrue(typeof testEnemy.update === 'function', 'Enemy should have update method');
    }));
    
    // Test: Kasha class exists
    creatureTests.push(createTest('CassieDuck class exists', function() {
        assertTrue(typeof CassieDuck === 'function', 'CassieDuck class should exist');
    }));
    
    // Test: Kasha can be created
    creatureTests.push(createTest('CassieDuck can be created', function() {
        try {
            const testKasha = new CassieDuck(150, 250);
            assertNotNull(testKasha, 'Kasha instance should be created');
            assertTrue(testKasha instanceof CassieDuck, 'Should be instance of CassieDuck');
        } catch (error) {
            throw new Error('Failed to create Kasha: ' + error.message);
        }
    }));
    
    creatureTests.push(createTest('Kasha initializes with type', function() {
        const testKasha = new CassieDuck(100, 200);
        assertTrue(typeof testKasha.type === 'string', 'Kasha type should be a string');
        assertTrue(testKasha.type.length > 0, 'Kasha type should not be empty');
    }));
    
    creatureTests.push(createTest('Kasha initializes not caught', function() {
        const testKasha = new CassieDuck(100, 200);
        assertFalse(testKasha.caught, 'Kasha should start not caught');
    }));
    
    creatureTests.push(createTest('Kasha has update method', function() {
        const testKasha = new CassieDuck(100, 200);
        assertTrue(typeof testKasha.update === 'function', 'Kasha should have update method');
    }));
    
    runTestSuite('Creature Tests', creatureTests);
}

function runAllCreatureTests() {
    console.log('\n👾 Running Creature Tests');
    console.log('='.repeat(50));
    runCreatureTests();
}

console.log('04-creatures-tests.js loaded successfully');
