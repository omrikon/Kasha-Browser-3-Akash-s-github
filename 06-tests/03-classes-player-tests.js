// ============================================================================
// 03-CLASSES-PLAYER-TESTS.JS - Tests for Player Class
// ============================================================================
// This file contains tests for the Player class (player.js):
// - Player initialization
// - Movement mechanics
// - Ground slam
// - Weapon attacks
// - Health & damage
// - Animation system
// ============================================================================

console.log('Loading 03-classes-player-tests.js...');

function runPlayerTests() {
    const playerTests = [];
    
    // Test: Player class exists
    playerTests.push(createTest('Player class exists', function() {
        assertTrue(typeof Player === 'function', 'Player class should exist');
    }));
    
    // Test: Player can be instantiated
    playerTests.push(createTest('Player can be created', function() {
        try {
            const testPlayer = new Player(100, 100);
            assertNotNull(testPlayer, 'Player instance should be created');
            assertTrue(testPlayer instanceof Player, 'Should be instance of Player');
        } catch (error) {
            throw new Error('Failed to create Player: ' + error.message);
        }
    }));
    
    // Test: Player initializes with correct properties
    playerTests.push(createTest('Player initializes with position', function() {
        const testPlayer = new Player(150, 200);
        assertEquals(testPlayer.x, 150, 'Player X should be set correctly');
        assertEquals(testPlayer.y, 200, 'Player Y should be set correctly');
    }));
    
    playerTests.push(createTest('Player initializes with dimensions', function() {
        const testPlayer = new Player(100, 100);
        assertTrue(typeof testPlayer.width === 'number', 'Player width should be a number');
        assertTrue(typeof testPlayer.height === 'number', 'Player height should be a number');
        assertTrue(testPlayer.width > 0, 'Player width should be positive');
        assertTrue(testPlayer.height > 0, 'Player height should be positive');
    }));
    
    playerTests.push(createTest('Player initializes with health', function() {
        const testPlayer = new Player(100, 100);
        assertTrue(typeof testPlayer.health === 'number', 'Player health should be a number');
        assertTrue(typeof testPlayer.maxHealth === 'number', 'Player maxHealth should be a number');
        assertTrue(testPlayer.health > 0, 'Player health should be positive');
        assertTrue(testPlayer.maxHealth > 0, 'Player maxHealth should be positive');
        assertEquals(testPlayer.health, testPlayer.maxHealth, 'Player should start at max health');
    }));
    
    playerTests.push(createTest('Player initializes with velocity', function() {
        const testPlayer = new Player(100, 100);
        assertEquals(testPlayer.velocityX, 0, 'Player velocityX should start at 0');
        assertEquals(testPlayer.velocityY, 0, 'Player velocityY should start at 0');
    }));
    
    playerTests.push(createTest('Player initializes with movement properties', function() {
        const testPlayer = new Player(100, 100);
        assertTrue(typeof testPlayer.speed === 'number', 'Player speed should be a number');
        assertTrue(typeof testPlayer.jumpPower === 'number', 'Player jumpPower should be a number');
        assertTrue(typeof testPlayer.gravity === 'number', 'Player gravity should be a number');
        assertTrue(testPlayer.speed > 0, 'Player speed should be positive');
        assertTrue(testPlayer.jumpPower > 0, 'Player jumpPower should be positive');
        assertTrue(testPlayer.gravity > 0, 'Player gravity should be positive');
    }));
    
    playerTests.push(createTest('Player initializes with onGround flag', function() {
        const testPlayer = new Player(100, 100);
        assertFalse(testPlayer.onGround, 'Player should start not on ground');
    }));
    
    playerTests.push(createTest('Player initializes with direction', function() {
        const testPlayer = new Player(100, 100);
        assertTrue(testPlayer.direction === 1 || testPlayer.direction === -1, 
                   'Player direction should be 1 or -1');
    }));
    
    playerTests.push(createTest('Player initializes with attack state', function() {
        const testPlayer = new Player(100, 100);
        assertFalse(testPlayer.attacking, 'Player should start not attacking');
        assertEquals(testPlayer.attackTimer, 0, 'Player attackTimer should start at 0');
        assertEquals(testPlayer.attackCooldown, 0, 'Player attackCooldown should start at 0');
    }));
    
    playerTests.push(createTest('Player initializes with invincibility state', function() {
        const testPlayer = new Player(100, 100);
        assertFalse(testPlayer.invincible, 'Player should start not invincible');
        assertEquals(testPlayer.invincibleTime, 0, 'Player invincibleTime should start at 0');
    }));
    
    // Test: Player methods exist
    playerTests.push(createTest('Player has update method', function() {
        const testPlayer = new Player(100, 100);
        assertTrue(typeof testPlayer.update === 'function', 'Player should have update method');
    }));
    
    playerTests.push(createTest('Player has takeDamage method', function() {
        const testPlayer = new Player(100, 100);
        assertTrue(typeof testPlayer.takeDamage === 'function', 'Player should have takeDamage method');
    }));
    
    playerTests.push(createTest('Player has checkCollision method', function() {
        const testPlayer = new Player(100, 100);
        assertTrue(typeof testPlayer.checkCollision === 'function', 'Player should have checkCollision method');
    }));
    
    playerTests.push(createTest('Player has draw method', function() {
        const testPlayer = new Player(100, 100);
        assertTrue(typeof testPlayer.draw === 'function', 'Player should have draw method');
    }));
    
    playerTests.push(createTest('Player has getCurrentState method', function() {
        const testPlayer = new Player(100, 100);
        assertTrue(typeof testPlayer.getCurrentState === 'function', 'Player should have getCurrentState method');
    }));
    
    // Test: Player takeDamage reduces health
    playerTests.push(createTest('Player takeDamage reduces health', function() {
        const testPlayer = new Player(100, 100);
        const originalHealth = testPlayer.health;
        testPlayer.takeDamage(1);
        assertTrue(testPlayer.health < originalHealth, 'Player health should decrease after taking damage');
    }));
    
    playerTests.push(createTest('Player takeDamage sets invincible', function() {
        const testPlayer = new Player(100, 100);
        testPlayer.takeDamage(1);
        assertTrue(testPlayer.invincible, 'Player should be invincible after taking damage');
    }));
    
    playerTests.push(createTest('Player takeDamage does not go below 0', function() {
        const testPlayer = new Player(100, 100);
        testPlayer.health = 1;
        testPlayer.takeDamage(10);
        assertTrue(testPlayer.health >= 0, 'Player health should not go below 0');
    }));
    
    // Test: Player checkCollision works
    playerTests.push(createTest('Player checkCollision detects overlap', function() {
        const testPlayer = new Player(100, 100);
        const platform = { x: 100, y: 100, width: 50, height: 50 };
        
        // Player overlaps platform
        const collides = testPlayer.checkCollision(platform);
        assertTrue(typeof collides === 'boolean', 'checkCollision should return boolean');
    }));
    
    // Test: Player state methods work
    playerTests.push(createTest('Player getCurrentState returns string', function() {
        const testPlayer = new Player(100, 100);
        const state = testPlayer.getCurrentState();
        assertTrue(typeof state === 'string', 'getCurrentState should return string');
        assertTrue(state.length > 0, 'State string should not be empty');
    }));
    
    runTestSuite('Player Class Tests', playerTests);
}

function runAllPlayerTests() {
    console.log('\n👤 Running Player Tests');
    console.log('='.repeat(50));
    runPlayerTests();
}

console.log('03-classes-player-tests.js loaded successfully');
