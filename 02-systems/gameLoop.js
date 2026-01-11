// ============================================================================
// GAMELOOP.JS - Main Game Loop and Initialization
// ============================================================================
// This file contains the main game loop - the heart of the game that runs
// continuously. The game loop is like a movie projector that shows many
// frames per second. Each frame, it updates everything (player movement,
// enemy AI, physics, etc.) and then redraws everything on screen. This
// happens 60 times per second, creating the illusion of smooth animation
// and responsive gameplay. Without the game loop, nothing would move or
// respond to your input!
// ============================================================================

// This message appears in the browser console when the file loads
console.log('Loading gameLoop.js...');

// Game initialization is now in main.js
// This file only contains the game loop function

function gameLoop() {
    // Clear internal canvas
    internalCtx.clearRect(0, 0, internalWidth, internalHeight);
    
    // Draw background elements
    drawBackground();
    
    // Update game objects (only if not paused and not game over/level finished/level selector)
    if (!gamePaused && !gameOver && !levelFinished && !showLevelSelector) {
        player.update(platforms);
    
        // Check box hits
        for (let box of boxes) {
            if (box.checkHit(player)) {
                // Create kashaball
                kashaballs.push(new Kashaball(box.x + box.width / 2 - 12.5, box.y - 30));
            }
        }
        
        // Update kashaballs
        for (let kashaball of kashaballs) {
            kashaball.update(platforms);
            kashaball.checkCollection(player);
        }
        
        // Update enemies and check for ground slam damage
        for (let enemy of enemies) {
            enemy.update(platforms, player);
            
            // Check if player ground slammed this enemy
            if (enemy.checkGroundSlamHit(player)) {
                enemy.takeDamage(1);
            }
            
            // Check if player weapon hit this enemy
            if (player.attacking) {
                const selectedItem = inventory.getSelectedItem();
                if (selectedItem && selectedItem.type === 'weapon') {
                    const weaponType = selectedItem.data?.weaponType || 'sword';
                    const w = WEAPON_TYPES[weaponType] || WEAPON_TYPES.sword;
                    if (player.attackTimer >= w.hitStart && player.attackTimer < w.hitEnd) {
                        const weaponLength = w.range + player.weaponExtension;
                        const playerCenterX = player.x + player.width / 2;
                        const playerCenterY = player.y + player.height / 2;
                        const baseAngle = player.direction === 1 ? 0 : Math.PI;
                        const finalAngle = baseAngle + player.weaponAngle;
                        
                        // Check if enemy is within weapon range
                        const distanceToEnemy = Math.sqrt(
                            Math.pow(enemy.x + enemy.width / 2 - playerCenterX, 2) +
                            Math.pow(enemy.y + enemy.height / 2 - playerCenterY, 2)
                        );
                        
                        if (distanceToEnemy < weaponLength + 25) {
                            // Check if enemy is in weapon arc
                            const angleToEnemy = Math.atan2(
                                enemy.y + enemy.height / 2 - playerCenterY,
                                enemy.x + enemy.width / 2 - playerCenterX
                            );
                            const angleDiff = Math.abs(angleToEnemy - finalAngle);
                            const normalizedAngleDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);
                            if (normalizedAngleDiff < w.hitArc) {
                                enemy.takeDamage(1);
                                playEnemyDamageSound();
                            }
                        }
                    }
                }
            }
        }
        
        // Update kashas
        for (let kasha of kashas) {
            kasha.update(platforms, kashaballs);
        }
        
        // Update kasha corpses
        for (let i = kashaCorpses.length - 1; i >= 0; i--) {
            kashaCorpses[i].update();
            if (kashaCorpses[i].extracted) {
                kashaCorpses.splice(i, 1);
            }
        }
        
        // Update ground slam effects
        for (let i = groundSlamEffects.length - 1; i >= 0; i--) {
            groundSlamEffects[i].update();
            if (!groundSlamEffects[i].active) {
                groundSlamEffects.splice(i, 1);
            }
        }
        
        // Update platform breaking effects
        for (let i = platformBreakingEffects.length - 1; i >= 0; i--) {
            platformBreakingEffects[i].update();
            if (!platformBreakingEffects[i].active) {
                platformBreakingEffects.splice(i, 1);
            }
        }
        
        // Update dirt tiles (falling particles)
        for (let i = dirtTiles.length - 1; i >= 0; i--) {
            dirtTiles[i].update(platforms);
            if (!dirtTiles[i].active) {
                dirtTiles.splice(i, 1);
            }
        }
        
        // Update camera
        updateCamera();
        
        // Check if player reached the end of the level
        // Player reaches end when they get close to the right edge (within 200 pixels)
        if (player.x + player.width >= levelWidth - 200) {
            if (!levelFinished) {
                levelFinished = true;
                // Roll for special item (RNG in background)
                const roll = Math.random();
                if (roll < 0.1) { // 10% chance for special item
                    specialItemRolled = {
                        type: 'special',
                        name: 'Mystery Item',
                        rarity: 'rare',
                        roll: roll
                    };
                } else {
                    specialItemRolled = null;
                }
            }
        }
    }
    
    // Update mouse coordinates in world space (account for camera movement every frame)
    const prevMouseX = mouseX;
    const prevMouseY = mouseY;
    mouseX = rawMouseX * pixelScale + cameraX;
    mouseY = rawMouseY * pixelScale + cameraY;
    
    // Debug: warn if mouse hasn't updated in a while
    if (showingTrajectory) {
        const timeSinceLastUpdate = performance.now() - lastMouseUpdateTime;
        if (timeSinceLastUpdate > 100) {
            console.warn('MOUSE STALE:', `No mouse update for ${timeSinceLastUpdate.toFixed(0)}ms`);
        }
    }
    
    // Draw game objects
    platforms.forEach(platform => platform.draw());
    
    // Draw tiles from tile map
    // Level 2 uses full tilemap rendering, level 1 uses platforms + dirt tiles
    if (currentLevel === 2) {
        drawTileMap();
    } else {
        // Draw DIRT tiles from tile map (settled dirt particles) for level 1
        drawDirtTiles();
    }
    
    boxes.forEach(box => box.draw());
    enemies.forEach(enemy => enemy.draw());
    kashas.forEach(kasha => kasha.draw());
    kashaCorpses.forEach(corpse => corpse.draw());
    kashaballs.forEach(kashaball => kashaball.draw());
    player.draw();
    
    // Draw platform breaking effects (behind other objects)
    platformBreakingEffects.forEach(effect => effect.draw());
    
    // Draw ground slam effects
    groundSlamEffects.forEach(effect => effect.draw());
    
    // Draw dirt tiles (falling particles)
    dirtTiles.forEach(dirt => dirt.draw());
    
    // Draw trajectory preview (only if not paused)
    if (!gamePaused) {
        drawTrajectory();
    }
    
    // Scale up internal canvas to main canvas with pixelation (Terraria-style)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Use nearest-neighbor scaling for crisp pixels
    ctx.imageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.drawImage(internalCanvas, 0, 0, internalWidth, internalHeight, 0, 0, canvas.width, canvas.height);
    
    // Draw inventory HUD (on top, not pixelated, but always visible)
    if (!gameOver && !levelFinished) {
        drawInventoryHUD();
        
        // Draw dragged item following mouse (when dragging from HUD, not paused)
        if (inventory.draggedItem && !gamePaused) {
            ctx.save();
            const slotSize = 50;
            const dragX = rawMouseX - slotSize / 2;
            const dragY = rawMouseY - slotSize / 2;
            drawInventorySlot(ctx, dragX, dragY, slotSize, inventory.draggedItem.item, -1, 'drag');
            ctx.restore();
        }
    }
    
    // Draw pause menu (on top, not pixelated)
    drawPauseMenu();
    
    // Draw level selector (admin/testing - on top, not pixelated)
    drawLevelSelector();
    
    // Draw level finished or game over screens (on top, not pixelated)
    drawLevelFinished();
    drawGameOver();
    
    requestAnimationFrame(gameLoop);
}

// Draw background
function drawBackground() {
    // Sky gradient
    const gradient = internalCtx.createLinearGradient(0, 0, 0, internalHeight);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98D8E8');
    internalCtx.fillStyle = gradient;
    internalCtx.fillRect(0, 0, internalWidth, internalHeight);
    
    // Simple clouds
    internalCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    drawCloud(-cameraX * 0.3 / pixelScale + 200 / pixelScale, 100 / pixelScale);
    drawCloud(-cameraX * 0.3 / pixelScale + 800 / pixelScale, 150 / pixelScale);
    drawCloud(-cameraX * 0.3 / pixelScale + 1500 / pixelScale, 120 / pixelScale);
    drawCloud(-cameraX * 0.3 / pixelScale + 2500 / pixelScale, 110 / pixelScale);
}

function drawCloud(x, y) {
    internalCtx.beginPath();
    internalCtx.arc(x, y, 30 / pixelScale, 0, Math.PI * 2);
    internalCtx.arc(x + 25 / pixelScale, y, 35 / pixelScale, 0, Math.PI * 2);
    internalCtx.arc(x + 50 / pixelScale, y, 30 / pixelScale, 0, Math.PI * 2);
    internalCtx.fill();
}

// Game initialization is now in main.js
// This file only contains the game loop function

console.log('gameLoop.js loaded successfully');
