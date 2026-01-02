// ============================================================================
// INPUT.JS - Input Handling
// ============================================================================
// This file handles all keyboard and mouse input.
// ============================================================================

console.log('Loading input.js...');

// Input Handling - keys variable is declared in gameState.js

window.addEventListener('keydown', (e) => {
    // Admin Cheat Code Detection (Hidden - no visual feedback)
    // Only check if not in level selector menu
    if (!showLevelSelector) {
        const key = e.key.toLowerCase();
        // Only track alphabetic characters
        if (key.length === 1 && /[a-z]/.test(key)) {
            cheatCodeBuffer += key;
            // Keep buffer size limited to cheat code length
            if (cheatCodeBuffer.length > CHEAT_CODE.length) {
                cheatCodeBuffer = cheatCodeBuffer.slice(-CHEAT_CODE.length);
            }
            // Check if cheat code matches
            if (cheatCodeBuffer === CHEAT_CODE) {
                showLevelSelector = true;
                gamePaused = true; // Pause game when selector opens
                cheatCodeBuffer = ''; // Reset buffer
                e.preventDefault();
                return;
            }
        }
    }
    
    // Handle level selector menu navigation
    if (showLevelSelector) {
        // ESC to close level selector
        if (e.key.toLowerCase() === 'escape') {
            showLevelSelector = false;
            gamePaused = false;
            e.preventDefault();
            return;
        }
        // Number keys 1-9 to select levels
        if (e.key >= '1' && e.key <= '9') {
            const levelNum = parseInt(e.key);
            if (levelNum <= MAX_LEVELS) {
                loadLevel(levelNum);
                showLevelSelector = false;
                gamePaused = false;
                e.preventDefault();
                return;
            }
        }
        // Allow typing 10 for level 10
        if (e.key === '0') {
            loadLevel(10);
            showLevelSelector = false;
            gamePaused = false;
            e.preventDefault();
            return;
        }
    }
    
    // Handle retry on game over
    if (gameOver) {
        resetGame();
        return;
    }
    
    // Handle next level on level finished
    if (levelFinished) {
        nextLevel();
        return;
    }
    
    keys[e.key.toLowerCase()] = true;
    if (e.key === 'ArrowUp' || e.key === ' ') {
        e.preventDefault();
    }
    
    // Inventory slot selection (1-9)
    if (!gamePaused && e.key >= '1' && e.key <= '9') {
        const slotNumber = parseInt(e.key);
        inventory.selectSlot(slotNumber);
        e.preventDefault();
    }
    
    // Extended inventory toggle (E) - also checks for corpse extraction
    if (!gamePaused && e.key.toLowerCase() === 'e') {
        // First check for corpse extraction
        let extracted = false;
        for (let i = kashaCorpses.length - 1; i >= 0; i--) {
            const corpse = kashaCorpses[i];
            if (corpse && corpse.checkPlayerInteraction(player)) {
                const coreData = corpse.extractCore();
                if (coreData) {
                    inventory.addItem('kasha_core', 1, coreData);
                    kashaCorpses.splice(i, 1);
                    extracted = true;
                    playCollectSound(); // Use collect sound for extraction
                    break;
                }
            }
        }
        
        // If no corpse interaction, toggle extended inventory
        if (!extracted) {
            inventory.toggleExtended();
        }
        e.preventDefault();
    }
    
    // Action button (Q) - now general action button
    if (e.key.toLowerCase() === 'q' && !gamePaused) {
        const selectedItem = inventory.getSelectedItem();
        if (selectedItem && selectedItem.type === 'kashaball' && selectedItem.count > 0) {
            showingTrajectory = true;
        }
    }
    
    if (e.key.toLowerCase() === 'escape') {
        e.preventDefault();
        gamePaused = !gamePaused;
        if (gamePaused) {
            pauseMusic();
            inventory.extendedOpen = false; // Close extended inventory when pausing
        } else {
            if (!musicMuted) {
                resumeMusic();
            }
        }
    }
    if (e.key.toLowerCase() === 'r' && gamePaused) {
        e.preventDefault();
        resetGame();
    }
    if (e.key.toLowerCase() === 'm' && gamePaused) {
        e.preventDefault();
        toggleMusicMute();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
    if (e.key.toLowerCase() === 'q') {
        showingTrajectory = false;
    }
});

// Mouse handling - update on multiple events to ensure we always have current position
let lastMouseUpdateTime = 0;
function updateMousePosition(e) {
    const rect = canvas.getBoundingClientRect();
    const newX = e.clientX - rect.left;
    const newY = e.clientY - rect.top;
    
    // Only update if position actually changed (avoid unnecessary updates)
    if (newX !== rawMouseX || newY !== rawMouseY) {
        rawMouseX = newX;
        rawMouseY = newY;
        lastMouseUpdateTime = performance.now();
        
        // Debug log mouse updates
        if (showingTrajectory) {
            console.log('MOUSE EVENT:', e.type, `x=${rawMouseX.toFixed(1)}, y=${rawMouseY.toFixed(1)}`);
        }
    }
}

canvas.addEventListener('mousemove', updateMousePosition);
canvas.addEventListener('mousedown', updateMousePosition);
canvas.addEventListener('mouseenter', updateMousePosition);
canvas.addEventListener('mouseover', updateMousePosition);

// Also track mouse position globally as fallback
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    // Only update if mouse is over canvas
    if (e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom) {
        updateMousePosition(e);
    }
});

// Mouse down handler for inventory drag and drop
let mouseDownOnSlot = null;
canvas.addEventListener('mousedown', (e) => {
    // Always update mouse position first
    updateMousePosition(e);
    
    // Check level selector FIRST (before gamePaused check)
    if (showLevelSelector) {
        // Check if clicking on a level button
        console.log('=== LEVEL SELECTOR CLICK ===');
        console.log('Mouse position:', rawMouseX, rawMouseY);
        console.log('Button bounds object:', window.levelSelectorButtons);
        
        if (window.levelSelectorButtons) {
            for (let levelNum = 1; levelNum <= MAX_LEVELS; levelNum++) {
                const bounds = window.levelSelectorButtons[levelNum];
                if (bounds) {
                    const inBounds = rawMouseX >= bounds.x && rawMouseX <= bounds.x + bounds.width &&
                                    rawMouseY >= bounds.y && rawMouseY <= bounds.y + bounds.height;
                    console.log(`Level ${levelNum}: bounds=`, bounds, 'inBounds=', inBounds);
                    
                    if (inBounds) {
                        console.log(`*** LOADING LEVEL ${levelNum} ***`);
                        loadLevel(levelNum);
                        return;
                    }
                } else {
                    console.log(`Level ${levelNum}: No bounds found`);
                }
            }
        } else {
            console.log('ERROR: No button bounds object found!');
        }
        // Clicking outside closes the selector
        console.log('Click outside buttons, closing selector');
        showLevelSelector = false;
        gamePaused = false;
        return;
    }
    
    if (gameOver) {
        resetGame();
        return;
    }
    
    if (gamePaused && e.button === 0) {
        // Check if clicking on a control button first
        const buttonClicked = getPauseMenuButtonAtPosition(rawMouseX, rawMouseY);
        if (buttonClicked) {
            // Handle button click
            if (buttonClicked === 'restart') {
                resetGame();
            } else if (buttonClicked === 'music') {
                toggleMusicMute();
            }
            // Resume is handled by ESC key, but could add click here too
            return;
        }
        
        // Check if clicking on inventory slot in pause menu
        const slotInfo = getInventorySlotAtPosition(rawMouseX, rawMouseY);
        if (slotInfo) {
            mouseDownOnSlot = slotInfo;
            const item = inventory.getItemAtSlot(slotInfo.slotIndex, slotInfo.source);
            if (item) {
                // Start dragging
                inventory.draggedItem = {
                    item: { ...item },
                    source: slotInfo.source,
                    sourceIndex: slotInfo.slotIndex
                };
                inventory.dragStartSlot = slotInfo;
            }
        }
        return;
    }
    
    if (levelFinished) {
        // Check if click is on "Next Level" button
        if (window.levelFinishedButtonBounds) {
            const bounds = window.levelFinishedButtonBounds;
            if (rawMouseX >= bounds.x && rawMouseX <= bounds.x + bounds.width &&
                rawMouseY >= bounds.y && rawMouseY <= bounds.y + bounds.height) {
                nextLevel();
                return;
            }
        }
        // If not on button, still allow clicking anywhere to continue (for now)
        // Could remove this if you only want button clicks
        nextLevel();
        return;
    }
    
    // Check if clicking on HUD inventory slot (when not paused)
    if (!gamePaused && e.button === 0) {
        const hudSlotInfo = getHUDInventorySlotAtPosition(rawMouseX, rawMouseY);
        if (hudSlotInfo) {
            mouseDownOnSlot = hudSlotInfo;
            const item = inventory.getItemAtSlot(hudSlotInfo.slotIndex, 'main');
            if (item) {
                // Start dragging from HUD
                inventory.draggedItem = {
                    item: { ...item },
                    source: 'main',
                    sourceIndex: hudSlotInfo.slotIndex
                };
                inventory.dragStartSlot = hudSlotInfo;
            }
            return; // Don't process throw trajectory if clicking on inventory
        }
    }
    
    if (gamePaused) return;
    if (e.button === 0 && showingTrajectory) {
        const selectedItem = inventory.getSelectedItem();
        if (selectedItem && selectedItem.type === 'kashaball' && selectedItem.count > 0) {
            // Left mouse click - throw kashaball
            throwKashaball();
            showingTrajectory = false;
        }
    }
});

// Mouse up handler for dropping items
canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0 && inventory.draggedItem) {
        let slotInfo = null;
        
        // Check if dropping on a slot (pause menu or HUD)
        if (gamePaused) {
            slotInfo = getInventorySlotAtPosition(rawMouseX, rawMouseY);
        } else {
            slotInfo = getHUDInventorySlotAtPosition(rawMouseX, rawMouseY);
        }
        
        // Check if dropping on fusion slot
        const fusionSlotInfo = getFusionSlotAtPosition(rawMouseX, rawMouseY);
        if (fusionSlotInfo) {
            const draggedItem = inventory.draggedItem.item;
            
            // Validate item type for fusion slot
            if (fusionSlotInfo.slot === 'weapon' && draggedItem.type === 'weapon' && 
                (!draggedItem.data || !draggedItem.data.fused)) {
                // Place weapon in fusion slot
                if (fusionWeaponSlot) {
                    // Swap - put fusion slot item back in inventory
                    inventory.setItemAtSlot(inventory.dragStartSlot.slotIndex, fusionWeaponSlot, inventory.dragStartSlot.source);
                } else {
                    // Remove from inventory
                    inventory.setItemAtSlot(inventory.dragStartSlot.slotIndex, null, inventory.dragStartSlot.source);
                }
                fusionWeaponSlot = { ...draggedItem };
                if (fusionWeaponSlot.count > 1) {
                    fusionWeaponSlot.count = 1; // Only take one from stack
                    const remaining = draggedItem.count - 1;
                    inventory.setItemAtSlot(inventory.dragStartSlot.slotIndex, {
                        ...draggedItem,
                        count: remaining
                    }, inventory.dragStartSlot.source);
                }
            } else if (fusionSlotInfo.slot === 'core' && draggedItem.type === 'kasha_core') {
                // Place core in fusion slot
                if (fusionCoreSlot) {
                    // Swap - put fusion slot item back in inventory
                    inventory.setItemAtSlot(inventory.dragStartSlot.slotIndex, fusionCoreSlot, inventory.dragStartSlot.source);
                } else {
                    // Remove from inventory
                    inventory.setItemAtSlot(inventory.dragStartSlot.slotIndex, null, inventory.dragStartSlot.source);
                }
                fusionCoreSlot = { ...draggedItem };
            }
        } else if (slotInfo) {
            const draggedItem = inventory.draggedItem.item;
            const targetItem = inventory.getItemAtSlot(slotInfo.slotIndex, slotInfo.source);
            
            // Check if we're dropping on the same slot we dragged from (cancel)
            if (slotInfo.slotIndex === inventory.dragStartSlot.slotIndex && 
                slotInfo.source === inventory.dragStartSlot.source) {
                // Cancel drag - do nothing
            }
            // Check if items can stack (both are stackable and same type)
            else if (targetItem && draggedItem.stackable && targetItem.stackable && 
                     draggedItem.type === targetItem.type) {
                // Combine stacks
                targetItem.count += draggedItem.count;
                // Clear source slot
                inventory.setItemAtSlot(inventory.dragStartSlot.slotIndex, null, inventory.dragStartSlot.source);
            }
            // If target slot has an item, swap them
            else if (targetItem) {
                inventory.setItemAtSlot(inventory.dragStartSlot.slotIndex, targetItem, inventory.dragStartSlot.source);
                // Place dragged item in target slot
                inventory.setItemAtSlot(slotInfo.slotIndex, draggedItem, slotInfo.source);
            } else {
                // Empty target slot - just move the item
                inventory.setItemAtSlot(inventory.dragStartSlot.slotIndex, null, inventory.dragStartSlot.source);
                inventory.setItemAtSlot(slotInfo.slotIndex, draggedItem, slotInfo.source);
            }
        } else {
            // Check if clicking on fusion button
            if (window.fusionButtonBounds && 
                rawMouseX >= window.fusionButtonBounds.x && 
                rawMouseX < window.fusionButtonBounds.x + window.fusionButtonBounds.width &&
                rawMouseY >= window.fusionButtonBounds.y && 
                rawMouseY < window.fusionButtonBounds.y + window.fusionButtonBounds.height) {
                // Attempt fusion
                if (fusionWeaponSlot && fusionCoreSlot && 
                    fusionWeaponSlot.type === 'weapon' && 
                    fusionCoreSlot.type === 'kasha_core' &&
                    (!fusionWeaponSlot.data || !fusionWeaponSlot.data.fused)) {
                    // Create fused weapon
                    const weaponType = fusionWeaponSlot.data?.weaponType || 'sword';
                    const coreData = fusionCoreSlot.data || {};
                    
                    const fusedWeapon = {
                        type: 'weapon',
                        count: 1,
                        stackable: false,
                        id: inventory.nextId++,
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
                    
                    // Add fused weapon to inventory
                    inventory.addItem('weapon', 1, fusedWeapon.data);
                    
                    // Clear fusion slots
                    fusionWeaponSlot = null;
                    fusionCoreSlot = null;
                    
                    playCollectSound(); // Use collect sound for successful fusion
                }
            } else {
                // Dropped outside inventory - cancel drag (return to original slot)
                // Don't do anything, just cancel
            }
        }
        
        inventory.draggedItem = null;
        inventory.dragStartSlot = null;
        mouseDownOnSlot = null;
    }
});

// Helper function to get pause menu button at mouse position
function getPauseMenuButtonAtPosition(mouseX, mouseY) {
    if (!gamePaused) return null;
    
    const menuWidth = 1000;
    const menuHeight = 700;
    const menuX = (canvas.width - menuWidth) / 2;
    const menuY = (canvas.height - menuHeight) / 2;
    
    const controlsY = menuY + menuHeight - 120;
    const buttonHeight = 50;
    const buttonWidth = 150;
    const buttonSpacing = 20;
    const buttonStartX = menuX + (menuWidth - (buttonWidth * 3 + buttonSpacing * 2)) / 2;
    
    // Check restart button
    const restartX = buttonStartX + buttonWidth + buttonSpacing;
    if (mouseX >= restartX && mouseX < restartX + buttonWidth &&
        mouseY >= controlsY && mouseY < controlsY + buttonHeight) {
        return 'restart';
    }
    
    // Check music button
    const musicX = buttonStartX + (buttonWidth + buttonSpacing) * 2;
    if (mouseX >= musicX && mouseX < musicX + buttonWidth &&
        mouseY >= controlsY && mouseY < controlsY + buttonHeight) {
        return 'music';
    }
    
    // Check resume button
    const resumeX = buttonStartX;
    if (mouseX >= resumeX && mouseX < resumeX + buttonWidth &&
        mouseY >= controlsY && mouseY < controlsY + buttonHeight) {
        return 'resume';
    }
    
    return null;
}

// Helper function to get HUD inventory slot at mouse position (when not paused)
function getHUDInventorySlotAtPosition(mouseX, mouseY) {
    if (gamePaused) return null;
    
    const slotSize = 50;
    const slotSpacing = 5;
    const padding = 5;
    const gameAreaHeight = 600;
    const hudY = gameAreaHeight + padding;
    const totalWidth = (slotSize + slotSpacing) * inventory.maxSlots - slotSpacing;
    const hudX = (canvas.width - totalWidth) / 2;
    
    // Check if mouse is in HUD area
    if (mouseY < gameAreaHeight || mouseY > gameAreaHeight + slotSize + padding * 2) {
        return null;
    }
    
    // Check each HUD slot
    for (let i = 0; i < inventory.maxSlots; i++) {
        const slotX = hudX + i * (slotSize + slotSpacing);
        
        if (mouseX >= slotX && mouseX < slotX + slotSize &&
            mouseY >= hudY && mouseY < hudY + slotSize) {
            return { slotIndex: i, source: 'main', x: slotX, y: hudY };
        }
    }
    
    return null;
}

// Helper function to get inventory slot at mouse position (pause menu)
function getInventorySlotAtPosition(mouseX, mouseY) {
    if (!gamePaused) return null;
    
    const menuWidth = 1000;
    const menuHeight = 700;
    const menuX = (canvas.width - menuWidth) / 2;
    const menuY = (canvas.height - menuHeight) / 2;
    
    const slotSize = 60;
    const slotSpacing = 5;
    const invStartX = menuX + 50;
    const invStartY = menuY + 80;
    const storageStartY = invStartY + 100;
    
    // Check main inventory (9 slots)
    for (let i = 0; i < inventory.maxSlots; i++) {
        const slotX = invStartX + (i % 9) * (slotSize + slotSpacing);
        const slotY = invStartY + Math.floor(i / 9) * (slotSize + slotSpacing);
        
        if (mouseX >= slotX && mouseX < slotX + slotSize &&
            mouseY >= slotY && mouseY < slotY + slotSize) {
            return { slotIndex: i, source: 'main', x: slotX, y: slotY };
        }
    }
    
    // Check storage inventory (18 slots)
    for (let i = 0; i < inventory.storageSlots; i++) {
        const slotX = invStartX + (i % 9) * (slotSize + slotSpacing);
        const slotY = storageStartY + Math.floor(i / 9) * (slotSize + slotSpacing);
        
        if (mouseX >= slotX && mouseX < slotX + slotSize &&
            mouseY >= slotY && mouseY < slotY + slotSize) {
            return { slotIndex: i, source: 'storage', x: slotX, y: slotY };
        }
    }
    
    return null;
}

// Mouse wheel for inventory scrolling
canvas.addEventListener('wheel', (e) => {
    if (gamePaused || gameOver || levelFinished) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    inventory.scroll(delta);
}, { passive: false });



console.log('input.js loaded successfully');
