// ============================================================================
// CLASSES/INVENTORY.JS - Inventory System
// ============================================================================
// This file contains the Inventory class - your item storage system. It manages
// all your items: kashaballs (throwing items), weapons, caught kashas, and
// kasha cores. The inventory handles item organization, stacking (multiple
// of the same item), drag-and-drop between slots, scrolling through items,
// and the weapon fusion system (combining weapons with kasha cores to create
// powerful fused weapons). Think of it as your backpack that holds everything!
// ============================================================================

// This message appears in the browser console when the file loads
console.log('Loading classes/inventory.js...');

class Inventory {
    constructor() {
        // items: array of inventory entry objects. Two main shapes:
        // - Stackable: { type: 'kashaball', count, stackable: true }
        // - Unique (caught kasha, etc.): { type: 'kasha', count: 1, stackable: false, id, data: {...} }
        this.items = []; // Main inventory (9 slots visible in HUD)
        this.storageItems = []; // Storage inventory (18 slots in pause menu)
        this.selectedSlot = 0; // 0-8 for visible slots (1-9 for user)
        this.scrollOffset = 0; // How far we've scrolled through inventory
        this.extendedOpen = false; // Whether extended inventory is open (E key)
        this.maxSlots = 9; // Visible slots in HUD
        this.storageSlots = 18; // Storage slots in pause menu
        this.nextId = 1; // Unique ID generator for non-stackable items
        
        // Drag and drop state
        this.draggedItem = null; // { item: {...}, source: 'main'|'storage', sourceIndex: number }
        this.dragStartSlot = null; // Which slot the drag started from
    }
    
    // Add item to inventory - finds first available slot
    // data: optional metadata for unique items (e.g. kasha info)
    addItem(type, count = 1, data = null, target = 'main') {
        const targetArray = target === 'main' ? this.items : this.storageItems;
        const maxSlots = target === 'main' ? this.maxSlots : this.storageSlots;
        
        // Empty kashaballs are stackable - try to stack with existing
        if (type === 'kashaball') {
            // Find existing stackable kashaball item
            for (let i = 0; i < targetArray.length && i < maxSlots; i++) {
                const item = targetArray[i];
                if (item && item.type === type && item.stackable) {
                    item.count += count;
                    return;
                }
            }
            // No existing stack found, add to first empty slot
            for (let i = 0; i < maxSlots; i++) {
                if (i >= targetArray.length || !targetArray[i]) {
                    this.setItemAtSlot(i, { type: type, count: count, stackable: true }, target);
                    return;
                }
            }
            return; // No space
        }
        
        // Empty weapons are stackable - try to stack with existing
        if (type === 'weapon' && data && !data.fused) {
            // Find existing stackable weapon of same type
            for (let i = 0; i < targetArray.length && i < maxSlots; i++) {
                const item = targetArray[i];
                if (item && item.type === type && item.stackable && 
                    item.data && item.data.weaponType === data.weaponType && !item.data.fused) {
                    item.count += count;
                    return;
                }
            }
            // No existing stack found, add to first empty slot
            for (let i = 0; i < maxSlots; i++) {
                if (i >= targetArray.length || !targetArray[i]) {
                    this.setItemAtSlot(i, { 
                        type: type, 
                        count: count, 
                        stackable: true,
                        data: data ? { ...data } : null
                    }, target);
                    return;
                }
            }
            return; // No space
        }
        
        // All other types are treated as unique (non-stackable) - add to first empty slot
        // This includes: kasha, kasha_core, fused weapons
        for (let i = 0; i < count; i++) {
            let added = false;
            for (let j = 0; j < maxSlots; j++) {
                if (j >= targetArray.length || !targetArray[j]) {
                    this.setItemAtSlot(j, {
                        type: type,
                        count: 1,
                        stackable: false,
                        id: this.nextId++,
                        data: data ? { ...data } : null
                    }, target);
                    added = true;
                    break;
                }
            }
            if (!added) break; // No more space
        }
    }
    
    // Remove item from inventory (finds first matching item)
    removeItem(type, count = 1, source = 'main') {
        const targetArray = source === 'main' ? this.items : this.storageItems;
        
        for (let i = 0; i < targetArray.length; i++) {
            const item = targetArray[i];
            if (item && item.type === type) {
                if (item.stackable) {
                    item.count -= count;
                    if (item.count <= 0) {
                        this.setItemAtSlot(i, null, source);
                    }
                } else {
                    // Non-stackable - remove the item
                    this.setItemAtSlot(i, null, source);
                    count--;
                    if (count <= 0) break;
                }
            }
        }
        
        // Adjust selected slot if needed
        if (source === 'main' && this.selectedSlot >= targetArray.length) {
            this.selectedSlot = Math.max(0, targetArray.length - 1);
        }
    }
    
    // Get count of a specific item type
    getItemCount(type, source = 'main') {
        const targetArray = source === 'main' ? this.items : this.storageItems;
        
        // For stackable items (like empty kashaballs), return the total stack count
        if (type === 'kashaball') {
            let total = 0;
            for (let item of targetArray) {
                if (item && item.type === type && item.stackable) {
                    total += item.count;
                }
            }
            return total;
        }
        
        // For stackable weapons, return total count
        if (type === 'weapon') {
            let total = 0;
            for (let item of targetArray) {
                if (item && item.type === type && item.stackable) {
                    total += item.count;
                } else if (item && item.type === type && !item.stackable) {
                    total += 1; // Count fused weapons as 1 each
                }
            }
            return total;
        }
        
        // For unique items (like caught kashas, cores), return how many entries of that type exist
        return targetArray.filter(item => item && item.type === type).length;
    }
    
    // Fuse a weapon with a Kasha core
    // weaponSlot: slot index of weapon item
    // coreSlot: slot index of core item
    // source: 'main' or 'storage' for both items
    // Returns true if fusion successful, false otherwise
    fuseWeapon(weaponSlot, coreSlot, source = 'main') {
        const targetArray = source === 'main' ? this.items : this.storageItems;
        
        if (weaponSlot < 0 || weaponSlot >= targetArray.length) return false;
        if (coreSlot < 0 || coreSlot >= targetArray.length) return false;
        
        const weaponItem = targetArray[weaponSlot];
        const coreItem = targetArray[coreSlot];
        
        // Validate items
        if (!weaponItem || weaponItem.type !== 'weapon') return false;
        if (!coreItem || coreItem.type !== 'kasha_core') return false;
        
        // Check if weapon is already fused
        if (weaponItem.data && weaponItem.data.fused) return false;
        
        // Check if weapon is stackable (empty weapon)
        if (!weaponItem.stackable) return false; // Shouldn't happen, but safety check
        
        // Get weapon type from data
        const weaponType = weaponItem.data?.weaponType || 'sword';
        
        // Get core data
        const coreData = coreItem.data || {};
        
        // Create fused weapon
        const fusedWeapon = {
            type: 'weapon',
            count: 1,
            stackable: false, // Fused weapons are unique
            id: this.nextId++,
            data: {
                weaponType: weaponType,
                fused: true,
                kashaCore: {
                    kashaType: coreData.kashaType || 'unknown',
                    kashaName: coreData.kashaName || 'Kasha',
                    abilities: coreData.abilities || []
                }
            }
        };
        
        // Remove one weapon from stack (or remove stack if count is 1)
        if (weaponItem.count > 1) {
            weaponItem.count--;
        } else {
            this.setItemAtSlot(weaponSlot, null, source);
        }
        
        // Remove core (always unique, so just remove it)
        this.setItemAtSlot(coreSlot, null, source);
        
        // Add fused weapon to first available slot
        for (let i = 0; i < targetArray.length; i++) {
            if (!targetArray[i]) {
                this.setItemAtSlot(i, fusedWeapon, source);
                return true;
            }
        }
        
        // If no empty slot, try to add to the weapon slot if it's now empty
        if (!targetArray[weaponSlot]) {
            this.setItemAtSlot(weaponSlot, fusedWeapon, source);
            return true;
        }
        
        // If still no space, restore items (fusion failed due to no space)
        // This shouldn't happen often, but handle it gracefully
        if (weaponItem.count === undefined) {
            // We removed the weapon, restore it
            this.setItemAtSlot(weaponSlot, { 
                type: 'weapon', 
                count: 1, 
                stackable: true,
                data: { weaponType: weaponType }
            }, source);
        } else {
            weaponItem.count++;
        }
        
        // Restore core
        this.setItemAtSlot(coreSlot, coreItem, source);
        
        return false; // Fusion failed - no space
    }
    
    // Get currently selected item
    getSelectedItem() {
        return this.getItemAtSlot(this.selectedSlot, 'main');
    }
    
    // Select slot by number (1-9)
    selectSlot(slotNumber) {
        if (slotNumber >= 1 && slotNumber <= 9) {
            const slotIndex = slotNumber - 1; // Convert to 0-based index (1->0, 2->1, ... 9->8)
            if (this.extendedOpen) {
                // In extended mode, select the item at the visible slot position
                const visibleIndex = slotIndex + this.scrollOffset;
                if (visibleIndex >= 0 && visibleIndex < this.items.length) {
                    this.selectedSlot = visibleIndex;
                }
            } else {
                // In normal mode, always allow selecting slots 1-9 (0-8 in 0-indexed)
                // Allow selection even if slot is empty - user can see which slot they selected
                if (slotIndex >= 0 && slotIndex < this.maxSlots) {
                    this.selectedSlot = slotIndex;
                }
            }
        }
    }
    
    // Scroll inventory (mouse wheel)
    scroll(delta) {
        if (this.extendedOpen) {
            // Extended inventory scrolling
            this.scrollOffset += delta;
            if (this.scrollOffset < 0) this.scrollOffset = 0;
            const maxScroll = Math.max(0, this.items.length - this.maxSlots);
            if (this.scrollOffset > maxScroll) {
                this.scrollOffset = maxScroll;
            }
            // Keep selected item in view if possible
            if (this.selectedSlot < this.scrollOffset) {
                this.scrollOffset = this.selectedSlot;
            } else if (this.selectedSlot >= this.scrollOffset + this.maxSlots) {
                this.scrollOffset = Math.max(0, this.selectedSlot - this.maxSlots + 1);
            }
        } else {
            // Normal scrolling - move selection
            if (delta > 0) {
                // Scroll up (select previous)
                if (this.selectedSlot > 0) {
                    this.selectedSlot--;
                }
            } else {
                // Scroll down (select next)
                const maxVisibleSlot = Math.min(this.items.length - 1, this.maxSlots - 1);
                if (this.selectedSlot < maxVisibleSlot) {
                    this.selectedSlot++;
                }
            }
        }
    }
    
    // Toggle extended inventory
    toggleExtended() {
        this.extendedOpen = !this.extendedOpen;
        if (this.extendedOpen) {
            this.scrollOffset = 0;
        }
    }
    
    // Get visible items for HUD (considering scroll) - returns array of items for visible slots
    getVisibleItems() {
        const visible = [];
        for (let i = 0; i < this.maxSlots; i++) {
            visible.push(this.getItemAtSlot(i, 'main'));
        }
        return visible;
    }
    
    // Move item from one slot to another (within same inventory)
    moveItem(sourceIndex, targetIndex, source = 'main', target = 'main') {
        const sourceArray = source === 'main' ? this.items : this.storageItems;
        const targetArray = target === 'main' ? this.items : this.storageItems;
        
        if (sourceIndex < 0 || sourceIndex >= sourceArray.length) return false;
        if (targetIndex < 0) return false;
        
        const item = sourceArray[sourceIndex];
        if (!item) return false;
        
        // Remove from source
        sourceArray.splice(sourceIndex, 1);
        
        // Ensure target array is large enough
        while (targetArray.length <= targetIndex) {
            targetArray.push(null);
        }
        
        // If target slot has an item, swap them
        if (targetArray[targetIndex]) {
            sourceArray.splice(sourceIndex, 0, targetArray[targetIndex]);
        }
        
        // Place item in target slot
        targetArray[targetIndex] = item;
        
        // Clean up null entries at the end
        while (targetArray.length > 0 && targetArray[targetArray.length - 1] === null) {
            targetArray.pop();
        }
        while (sourceArray.length > 0 && sourceArray[sourceArray.length - 1] === null) {
            sourceArray.pop();
        }
        
        return true;
    }
    
    // Get item at a specific slot (handles null slots)
    getItemAtSlot(index, source = 'main') {
        const array = source === 'main' ? this.items : this.storageItems;
        if (index < 0 || index >= array.length) return null;
        return array[index] || null;
    }
    
    // Set item at a specific slot
    setItemAtSlot(index, item, source = 'main') {
        const array = source === 'main' ? this.items : this.storageItems;
        const maxSlots = source === 'main' ? this.maxSlots : this.storageSlots;
        
        if (index < 0 || index >= maxSlots) return false;
        
        // Ensure array is large enough
        while (array.length <= index) {
            array.push(null);
        }
        
        array[index] = item;
        
        // Clean up null entries at the end
        while (array.length > 0 && array[array.length - 1] === null) {
            array.pop();
        }
        
        return true;
    }
}

console.log('classes/inventory.js loaded successfully');
