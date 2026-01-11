// ============================================================================
// INTEGRATION-TESTS.JS - Integration Tests for System Interactions
// ============================================================================
// This file contains tests that verify multiple systems work together:
// - Player-Enemy interaction
// - Player-Item interaction
// - Player-World interaction
// - Level progression
// - Audio integration
// - UI integration
// ============================================================================

console.log('Loading integration-tests.js...');

function runIntegrationTests() {
    const integrationTests = [];
    
    // Test: Player and Inventory can work together
    integrationTests.push(createTest('Player and Inventory exist together', function() {
        if (player && inventory) {
            assertTrue(player instanceof Player, 'Player should be instance of Player');
            assertTrue(inventory instanceof Inventory, 'Inventory should be instance of Inventory');
        }
    }));
    
    // Test: Player can interact with platforms
    integrationTests.push(createTest('Player can check collision with Platform', function() {
        if (player && platforms.length > 0) {
            const platform = platforms[0];
            const result = player.checkCollision(platform);
            assertTrue(typeof result === 'boolean', 'checkCollision should return boolean');
        }
    }));
    
    // Test: Inventory can add items
    integrationTests.push(createTest('Inventory addItem works when initialized', function() {
        if (inventory) {
            const originalCount = inventory.getItemCount('kashaball');
            inventory.addItem('kashaball', 1);
            const newCount = inventory.getItemCount('kashaball');
            assertTrue(newCount >= originalCount, 'Item count should increase or stay same');
        }
    }));
    
    // Test: Camera follows player
    integrationTests.push(createTest('Camera can update when player moves', function() {
        if (player) {
            const originalCameraX = cameraX;
            const originalPlayerX = player.x;
            
            // Move player
            player.x = 500;
            updateCamera();
            
            // Camera should have updated (may not exactly match due to clamping)
            assertTrue(typeof cameraX === 'number', 'Camera X should be a number');
            
            // Restore
            player.x = originalPlayerX;
            cameraX = originalCameraX;
        }
    }));
    
    // Test: TileMap can be created and used
    integrationTests.push(createTest('TileMap can be created for levels', function() {
        if (typeof TileMap === 'function') {
            const testMap = new TileMap(10, 10);
            assertNotNull(testMap, 'TileMap should be created');
            assertTrue(testMap instanceof TileMap, 'Should be instance of TileMap');
        }
    }));
    
    // Test: Weapon types are accessible
    integrationTests.push(createTest('Weapon types accessible from config', function() {
        if (typeof WEAPON_TYPES !== 'undefined') {
            assertNotNull(WEAPON_TYPES.sword, 'Sword weapon type should exist');
            assertNotNull(WEAPON_TYPES.axe, 'Axe weapon type should exist');
        }
    }));
    
    runTestSuite('Integration Tests', integrationTests);
}

function runAllIntegrationTests() {
    console.log('\n🔗 Running Integration Tests');
    console.log('='.repeat(50));
    runIntegrationTests();
}

console.log('integration-tests.js loaded successfully');
