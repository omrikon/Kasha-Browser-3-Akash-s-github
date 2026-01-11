// ============================================================================
// 03-CLASSES-INVENTORY-TESTS.JS - Tests for Inventory Class
// ============================================================================
// This file contains tests for the Inventory class (inventory.js):
// - Item addition
// - Item removal
// - Slot management
// - Weapon fusion
// - Drag and drop
// ============================================================================

console.log('Loading 03-classes-inventory-tests.js...');

function runInventoryTests() {
    const inventoryTests = [];
    
    // Test: Inventory class exists
    inventoryTests.push(createTest('Inventory class exists', function() {
        assertTrue(typeof Inventory === 'function', 'Inventory class should exist');
    }));
    
    // Test: Inventory can be instantiated
    inventoryTests.push(createTest('Inventory can be created', function() {
        try {
            const testInventory = new Inventory();
            assertNotNull(testInventory, 'Inventory instance should be created');
            assertTrue(testInventory instanceof Inventory, 'Should be instance of Inventory');
        } catch (error) {
            throw new Error('Failed to create Inventory: ' + error.message);
        }
    }));
    
    // Test: Inventory initializes correctly
    inventoryTests.push(createTest('Inventory initializes with arrays', function() {
        const testInventory = new Inventory();
        assertTrue(Array.isArray(testInventory.items), 'Items should be an array');
        assertTrue(Array.isArray(testInventory.storageItems), 'Storage items should be an array');
    }));
    
    inventoryTests.push(createTest('Inventory initializes with slot count', function() {
        const testInventory = new Inventory();
        assertTrue(typeof testInventory.maxSlots === 'number', 'maxSlots should be a number');
        assertTrue(typeof testInventory.storageSlots === 'number', 'storageSlots should be a number');
        assertTrue(testInventory.maxSlots > 0, 'maxSlots should be positive');
        assertTrue(testInventory.storageSlots > 0, 'storageSlots should be positive');
    }));
    
    inventoryTests.push(createTest('Inventory initializes with selected slot', function() {
        const testInventory = new Inventory();
        assertEquals(testInventory.selectedSlot, 0, 'Selected slot should start at 0');
    }));
    
    inventoryTests.push(createTest('Inventory initializes with ID counter', function() {
        const testInventory = new Inventory();
        assertTrue(typeof testInventory.nextId === 'number', 'nextId should be a number');
        assertTrue(testInventory.nextId > 0, 'nextId should be positive');
    }));
    
    // Test: Inventory methods exist
    inventoryTests.push(createTest('Inventory has addItem method', function() {
        const testInventory = new Inventory();
        assertTrue(typeof testInventory.addItem === 'function', 'Inventory should have addItem method');
    }));
    
    inventoryTests.push(createTest('Inventory has removeItem method', function() {
        const testInventory = new Inventory();
        assertTrue(typeof testInventory.removeItem === 'function', 'Inventory should have removeItem method');
    }));
    
    inventoryTests.push(createTest('Inventory has getItemCount method', function() {
        const testInventory = new Inventory();
        assertTrue(typeof testInventory.getItemCount === 'function', 'Inventory should have getItemCount method');
    }));
    
    inventoryTests.push(createTest('Inventory has getSelectedItem method', function() {
        const testInventory = new Inventory();
        assertTrue(typeof testInventory.getSelectedItem === 'function', 'Inventory should have getSelectedItem method');
    }));
    
    inventoryTests.push(createTest('Inventory has selectSlot method', function() {
        const testInventory = new Inventory();
        assertTrue(typeof testInventory.selectSlot === 'function', 'Inventory should have selectSlot method');
    }));
    
    inventoryTests.push(createTest('Inventory has getItemAtSlot method', function() {
        const testInventory = new Inventory();
        assertTrue(typeof testInventory.getItemAtSlot === 'function', 'Inventory should have getItemAtSlot method');
    }));
    
    inventoryTests.push(createTest('Inventory has setItemAtSlot method', function() {
        const testInventory = new Inventory();
        assertTrue(typeof testInventory.setItemAtSlot === 'function', 'Inventory should have setItemAtSlot method');
    }));
    
    inventoryTests.push(createTest('Inventory has fuseWeapon method', function() {
        const testInventory = new Inventory();
        assertTrue(typeof testInventory.fuseWeapon === 'function', 'Inventory should have fuseWeapon method');
    }));
    
    // Test: Inventory addItem works
    inventoryTests.push(createTest('Inventory addItem adds stackable item', function() {
        const testInventory = new Inventory();
        testInventory.addItem('kashaball', 1);
        const count = testInventory.getItemCount('kashaball');
        assertTrue(count > 0, 'Item count should be greater than 0 after adding');
    }));
    
    inventoryTests.push(createTest('Inventory addItem stacks same items', function() {
        const testInventory = new Inventory();
        testInventory.addItem('kashaball', 1);
        testInventory.addItem('kashaball', 2);
        const count = testInventory.getItemCount('kashaball');
        assertTrue(count >= 3, 'Items should stack together');
    }));
    
    // Test: Inventory removeItem works
    inventoryTests.push(createTest('Inventory removeItem removes items', function() {
        const testInventory = new Inventory();
        testInventory.addItem('kashaball', 5);
        testInventory.removeItem('kashaball', 2);
        const count = testInventory.getItemCount('kashaball');
        assertTrue(count < 5, 'Item count should decrease after removal');
    }));
    
    // Test: Inventory selectSlot works
    inventoryTests.push(createTest('Inventory selectSlot changes selected slot', function() {
        const testInventory = new Inventory();
        const originalSlot = testInventory.selectedSlot;
        testInventory.selectSlot(2);
        assertNotEquals(testInventory.selectedSlot, originalSlot, 'Selected slot should change');
    }));
    
    runTestSuite('Inventory Class Tests', inventoryTests);
}

function runAllInventoryTests() {
    console.log('\n🎒 Running Inventory Tests');
    console.log('='.repeat(50));
    runInventoryTests();
}

console.log('03-classes-inventory-tests.js loaded successfully');
