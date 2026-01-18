// ============================================================================
// DRAWING.JS - Drawing Functions
// ============================================================================
// This file contains all the drawing/rendering code - everything that appears
// on screen. It's like the game's "artist" that draws all the graphics.
// This includes drawing the player, enemies, platforms, UI elements (health,
// inventory), menus (pause menu, game over screen), and visual effects.
// Every visual element you see in the game is drawn by functions in this file.
// ============================================================================

// This message appears in the browser console when the file loads
console.log('Loading drawing.js...');

// Update Health Display
function updateHealthDisplay() {
    let html = '';
    const fullHearts = Math.floor(player.health / 2);
    const halfHeart = player.health % 2;
    
    for (let i = 0; i < fullHearts; i++) {
        html += '❤️';
    }
    if (halfHeart > 0) {
        html += '💛'; // Half heart
    }
    for (let i = 0; i < Math.floor((player.maxHealth - player.health) / 2); i++) {
        html += '🖤'; // Empty heart
    }
    
    healthDisplayElement.innerHTML = html;
}

function drawTrajectory() {
    const selectedItem = inventory.getSelectedItem();
    if (!kashaballCharging || !selectedItem || selectedItem.type !== 'kashaball' || selectedItem.count <= 0) return;
    
    internalCtx.save();
    internalCtx.translate(-cameraX / pixelScale, -cameraY / pixelScale);
    
    const startX = player.x + player.width / 2;
    const startY = player.y + player.height / 2;
    
    // Calculate charge percentage (clamped to prevent jittering at max charge)
    // Ensure charge time never exceeds max before calculating percentage
    const clampedChargeTime = Math.min(Math.max(0, kashaballChargeTime), kashaballChargeMaxTime);
    const isMaxCharge = clampedChargeTime >= kashaballChargeMaxTime;
    // When at max charge, use exact 1.0 instead of calculating to avoid floating point precision issues
    const chargePercent = isMaxCharge ? 1.0 : (clampedChargeTime / kashaballChargeMaxTime);
    
    // Calculate throw speed based on charge (min 6, max 18)
    // When at max charge, use exact max value to prevent floating point jittering
    const minSpeed = 6;
    const maxSpeed = 18;
    // If at max charge, use exact maxSpeed to avoid calculation precision issues
    const throwSpeed = isMaxCharge ? maxSpeed : (minSpeed + (maxSpeed - minSpeed) * chargePercent);
    
    // Fixed angle: 45 degrees upward in player facing direction
    // For upward throws in canvas (Y increases downward), we need negative Y velocity
    // Right: -45 degrees (up-right), Left: -135 degrees (up-left)
    const throwAngle = player.direction === -1 ? (Math.PI * 5 / 4) : (-Math.PI / 4);
    
    // Pre-calculate cos/sin for consistency
    const cosAngle = Math.cos(throwAngle);
    const sinAngle = Math.sin(throwAngle);
    
    // Calculate velocities for parabolic trajectory
    const velocityX = cosAngle * throwSpeed;
    const velocityY = sinAngle * throwSpeed;
    
    // Simulate trajectory path with gravity (creates parabolic arc)
    let x = startX;
    let y = startY;
    let vx = velocityX;
    let vy = velocityY;
    const gravity = 0.5;
    const points = [];
    const maxSteps = 400; // Maximum simulation steps
    
    // Calculate path for preview (parabolic arc) - no clamps, run full simulation
    // Store points directly without rounding to maintain smooth trajectory
    for (let i = 0; i < maxSteps; i++) {
        points.push({ x, y });
        vy += gravity; // Gravity pulls down, creating parabolic arc
        x += vx;
        y += vy;
    }
    
    // Calculate color based on charge (Blue → Cyan → White)
    let r, g, b;
    if (chargePercent < 0.5) {
        // Blue to Cyan
        const t = chargePercent * 2; // 0 to 1 for first half
        r = Math.round(0 + (0 - 0) * t);
        g = Math.round(150 + (255 - 150) * t);
        b = Math.round(255 + (255 - 255) * t);
    } else {
        // Cyan to White
        const t = (chargePercent - 0.5) * 2; // 0 to 1 for second half
        r = Math.round(0 + (255 - 0) * t);
        g = Math.round(255 + (255 - 255) * t);
        b = Math.round(255 + (255 - 255) * t);
    }
    
    const colorString = `rgba(${r}, ${g}, ${b}, 0.7)`;
    
    // Draw trajectory line with smooth rendering
    internalCtx.strokeStyle = colorString;
    internalCtx.lineWidth = 1;
    internalCtx.lineCap = 'round';
    internalCtx.lineJoin = 'round';
    internalCtx.setLineDash([3, 3]);
    internalCtx.beginPath();
    if (points.length > 0) {
        // Use moveTo for first point
        internalCtx.moveTo(points[0].x / pixelScale, points[0].y / pixelScale);
        // Draw line segments smoothly
        for (let i = 1; i < points.length; i++) {
            internalCtx.lineTo(points[i].x / pixelScale, points[i].y / pixelScale);
        }
    }
    internalCtx.stroke();
    internalCtx.setLineDash([]);
    
    // Draw start point
    internalCtx.fillStyle = colorString;
    internalCtx.beginPath();
    internalCtx.arc(startX / pixelScale, startY / pixelScale, 5 / pixelScale, 0, Math.PI * 2);
    internalCtx.fill();
    
    // Draw end point
    if (points.length > 0) {
        const endPoint = points[points.length - 1];
        internalCtx.fillStyle = colorString;
        internalCtx.globalAlpha = 0.5;
        internalCtx.beginPath();
        internalCtx.arc(endPoint.x / pixelScale, endPoint.y / pixelScale, 8 / pixelScale, 0, Math.PI * 2);
        internalCtx.fill();
        internalCtx.globalAlpha = 1.0;
    }
    
    internalCtx.restore();
}

// Camera System
function updateCamera() {
    // Follow player horizontally
    const targetX = player.x - canvas.width / 2;
    cameraX = targetX;
    
    // Keep camera from going too far left
    if (cameraX < 0) {
        cameraX = 0;
    }
    
    // Keep camera from going too far right (adjust based on level width)
    const maxCameraX = levelWidth - canvas.width * pixelScale;
    if (cameraX > maxCameraX) {
        cameraX = maxCameraX;
    }
}

// Draw Pause Menu with Inventory
function drawPauseMenu() {
    if (!gamePaused || showLevelSelector) return; // Don't show pause menu when level selector is open
    
    // Draw on main canvas (not pixelated)
    ctx.save();
    
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Larger menu box to accommodate inventory
    const menuWidth = 1000;
    const menuHeight = 700;
    const menuX = (canvas.width - menuWidth) / 2;
    const menuY = (canvas.height - menuHeight) / 2;
    
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(menuX, menuY, menuWidth, menuHeight);
    
    ctx.strokeStyle = '#34495E';
    ctx.lineWidth = 4;
    ctx.strokeRect(menuX, menuY, menuWidth, menuHeight);
    
    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED - INVENTORY', canvas.width / 2, menuY + 40);
    
    // Draw main inventory (9 slots)
    const slotSize = 60;
    const slotSpacing = 5;
    const invStartX = menuX + 50;
    const invStartY = menuY + 80;
    const invTitleY = menuY + 70;
    
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Main Inventory (9 slots)', invStartX, invTitleY);
    
    for (let i = 0; i < inventory.maxSlots; i++) {
        const slotX = invStartX + (i % 9) * (slotSize + slotSpacing);
        const slotY = invStartY + Math.floor(i / 9) * (slotSize + slotSpacing);
        const item = inventory.getItemAtSlot(i, 'main');
        
        drawInventorySlot(ctx, slotX, slotY, slotSize, item, i, 'main');
    }
    
    // Draw storage inventory (18 slots in 2 rows of 9)
    const storageStartY = invStartY + 100;
    const storageTitleY = storageStartY - 10;
    
    ctx.fillText('Storage Inventory (18 slots)', invStartX, storageTitleY);
    
    for (let i = 0; i < inventory.storageSlots; i++) {
        const slotX = invStartX + (i % 9) * (slotSize + slotSpacing);
        const slotY = storageStartY + Math.floor(i / 9) * (slotSize + slotSpacing);
        const item = inventory.getItemAtSlot(i, 'storage');
        
        drawInventorySlot(ctx, slotX, slotY, slotSize, item, i, 'storage');
    }
    
    // Draw dragged item following mouse
    if (inventory.draggedItem) {
        const dragX = rawMouseX - slotSize / 2;
        const dragY = rawMouseY - slotSize / 2;
        drawInventorySlot(ctx, dragX, dragY, slotSize, inventory.draggedItem.item, -1, 'drag');
    }
    
    // Controls section at bottom
    const controlsY = menuY + menuHeight - 120;
    const buttonHeight = 50;
    const buttonWidth = 150;
    const buttonSpacing = 20;
    const buttonStartX = menuX + (menuWidth - (buttonWidth * 3 + buttonSpacing * 2)) / 2;
    
    // Fusion section
    const fusionY = storageStartY + 140;
    const fusionTitleY = fusionY - 10;
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Weapon Fusion (Drag weapon + core here)', invStartX, fusionTitleY);
    
    // Fusion slots (2 slots side by side: weapon and core)
    const fusionSlotSize = 70;
    const fusionSlotSpacing = 20;
    const fusionSlot1X = invStartX;
    const fusionSlot1Y = fusionY + 20;
    const fusionSlot2X = invStartX + fusionSlotSize + fusionSlotSpacing;
    const fusionSlot2Y = fusionY + 20;
    
    // Fusion slot 1 (weapon)
    ctx.fillStyle = 'rgba(150, 150, 150, 0.5)';
    ctx.fillRect(fusionSlot1X, fusionSlot1Y, fusionSlotSize, fusionSlotSize);
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 2;
    ctx.strokeRect(fusionSlot1X, fusionSlot1Y, fusionSlotSize, fusionSlotSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Weapon', fusionSlot1X + fusionSlotSize / 2, fusionSlot1Y + fusionSlotSize + 15);
    
    // Fusion slot 2 (core)
    ctx.fillStyle = 'rgba(150, 150, 150, 0.5)';
    ctx.fillRect(fusionSlot2X, fusionSlot2Y, fusionSlotSize, fusionSlotSize);
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 2;
    ctx.strokeRect(fusionSlot2X, fusionSlot2Y, fusionSlotSize, fusionSlotSize);
    ctx.fillText('Core', fusionSlot2X + fusionSlotSize / 2, fusionSlot2Y + fusionSlotSize + 15);
    
    // Fusion button
    const fuseButtonX = fusionSlot2X + fusionSlotSize + fusionSlotSpacing;
    const fuseButtonY = fusionSlot1Y;
    const fuseButtonWidth = 120;
    const fuseButtonHeight = fusionSlotSize;
    
    // Check if fusion slots have valid items (use global variables)
    const canFuse = fusionWeaponSlot && fusionCoreSlot && 
                    fusionWeaponSlot.type === 'weapon' && 
                    fusionCoreSlot.type === 'kasha_core' &&
                    (!fusionWeaponSlot.data || !fusionWeaponSlot.data.fused);
    
    // Check if mouse is over fuse button
    const mouseOverFuseButton = rawMouseX >= fuseButtonX && rawMouseX <= fuseButtonX + fuseButtonWidth &&
                                rawMouseY >= fuseButtonY && rawMouseY <= fuseButtonY + fuseButtonHeight;
    
    ctx.fillStyle = canFuse ? (mouseOverFuseButton ? '#27AE60' : '#229954') : '#7F8C8D';
    ctx.fillRect(fuseButtonX, fuseButtonY, fuseButtonWidth, fuseButtonHeight);
    ctx.strokeStyle = canFuse ? '#2ECC71' : '#95A5A6';
    ctx.lineWidth = 2;
    ctx.strokeRect(fuseButtonX, fuseButtonY, fuseButtonWidth, fuseButtonHeight);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FUSE', fuseButtonX + fuseButtonWidth / 2, fuseButtonY + fuseButtonHeight / 2 + 6);
    
    // Store fusion button bounds for click detection
    window.fusionButtonBounds = {
        x: fuseButtonX,
        y: fuseButtonY,
        width: fuseButtonWidth,
        height: fuseButtonHeight
    };
    window.fusionWeaponSlotBounds = {
        x: fusionSlot1X,
        y: fusionSlot1Y,
        width: fusionSlotSize,
        height: fusionSlotSize
    };
    window.fusionCoreSlotBounds = {
        x: fusionSlot2X,
        y: fusionSlot2Y,
        width: fusionSlotSize,
        height: fusionSlotSize
    };
    
    // Draw items in fusion slots if any
    if (fusionWeaponSlot) {
        drawInventorySlot(ctx, fusionSlot1X, fusionSlot1Y, fusionSlotSize, fusionWeaponSlot, -1, 'fusion');
    }
    if (fusionCoreSlot) {
        drawInventorySlot(ctx, fusionSlot2X, fusionSlot2Y, fusionSlotSize, fusionCoreSlot, -1, 'fusion');
    }
    
    // Instructions above buttons
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#BDC3C7';
    ctx.fillText('Click and drag items to move them between slots | Drag weapon + core to fusion slots', canvas.width / 2, controlsY - 30);
    
    // Resume button
    const resumeX = buttonStartX;
    const resumeY = controlsY;
    ctx.fillStyle = '#27AE60';
    ctx.fillRect(resumeX, resumeY, buttonWidth, buttonHeight);
    ctx.strokeStyle = '#2ECC71';
    ctx.lineWidth = 2;
    ctx.strokeRect(resumeX, resumeY, buttonWidth, buttonHeight);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Resume (ESC)', resumeX + buttonWidth / 2, resumeY + buttonHeight / 2 + 6);
    
    // Restart button
    const restartX = buttonStartX + buttonWidth + buttonSpacing;
    const restartY = controlsY;
    ctx.fillStyle = '#E67E22';
    ctx.fillRect(restartX, restartY, buttonWidth, buttonHeight);
    ctx.strokeStyle = '#F39C12';
    ctx.lineWidth = 2;
    ctx.strokeRect(restartX, restartY, buttonWidth, buttonHeight);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Restart (R)', restartX + buttonWidth / 2, restartY + buttonHeight / 2 + 6);
    
    // Music toggle button
    const musicX = buttonStartX + (buttonWidth + buttonSpacing) * 2;
    const musicY = controlsY;
    ctx.fillStyle = musicMuted ? '#E74C3C' : '#3498DB';
    ctx.fillRect(musicX, musicY, buttonWidth, buttonHeight);
    ctx.strokeStyle = musicMuted ? '#C0392B' : '#2980B9';
    ctx.lineWidth = 2;
    ctx.strokeRect(musicX, musicY, buttonWidth, buttonHeight);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(musicMuted ? 'Unmute (M)' : 'Mute (M)', musicX + buttonWidth / 2, musicY + buttonHeight / 2 + 6);
    
    // Music status text below buttons
    ctx.font = '14px Arial';
    ctx.fillStyle = '#BDC3C7';
    ctx.fillText(`Music: ${musicMuted ? 'Muted' : 'Playing'}`, canvas.width / 2, controlsY + buttonHeight + 25);
    
    ctx.restore();
}

// Helper function to draw a kasha sprite based on type
function drawKashaSprite(ctx, x, y, size, kashaType) {
    // Default to cassieduck if type not specified
    const type = kashaType || 'cassieduck';
    
    if (type === 'cassieduck') {
        // Draw duck head (smaller, positioned for top-right)
        const headX = x + size * 0.7; // Top right position
        const headY = y + size * 0.25;
        const headSize = size * 0.25;
        
        // Duck head (yellow circle)
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(headX, headY, headSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Duck bill (orange)
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.ellipse(headX + headSize * 0.5, headY + headSize * 0.3, headSize * 0.4, headSize * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Duck eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(headX - headSize * 0.3, headY - headSize * 0.3, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    // Add more kasha types here in the future
}

// Helper function to draw a kashaball icon
function drawKashaballIcon(ctx, x, y, size) {
    const ballX = x + size * 0.25; // Bottom left position
    const ballY = y + size * 0.75;
    const triangleSize = size * 0.25;
    
    const centerX = ballX;
    const centerY = ballY;
    
    // Draw triangle (blue)
    ctx.fillStyle = '#0000FF';
    ctx.beginPath();
    // Equilateral triangle pointing up
    ctx.moveTo(centerX, centerY - triangleSize); // Top point
    ctx.lineTo(centerX - triangleSize * 0.866, centerY + triangleSize * 0.5); // Bottom left
    ctx.lineTo(centerX + triangleSize * 0.866, centerY + triangleSize * 0.5); // Bottom right
    ctx.closePath();
    ctx.fill();
    
    // Triangle outline
    ctx.strokeStyle = '#000080';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Center circle (white)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();
}

// Helper function to draw an inventory slot
function drawInventorySlot(ctx, x, y, size, item, slotIndex, source) {
    // Slot background
    const isSelected = (source === 'main' && slotIndex === inventory.selectedSlot);
    ctx.fillStyle = isSelected ? 'rgba(255, 255, 255, 0.3)' : 'rgba(100, 100, 100, 0.5)';
    ctx.fillRect(x, y, size, size);
    
    // Slot border
    ctx.strokeStyle = isSelected ? '#FFFFFF' : '#888888';
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.strokeRect(x, y, size, size);
    
    // Draw item if exists
    if (item) {
        if (item.type === 'kashaball') {
            // Draw kashaball icon as blue triangle
            const centerX = x + size / 2;
            const centerY = y + size / 2;
            const triangleSize = size / 3;
            
            // Draw triangle (blue)
            ctx.fillStyle = '#0000FF';
            ctx.beginPath();
            // Equilateral triangle pointing up
            ctx.moveTo(centerX, centerY - triangleSize); // Top point
            ctx.lineTo(centerX - triangleSize * 0.866, centerY + triangleSize * 0.5); // Bottom left
            ctx.lineTo(centerX + triangleSize * 0.866, centerY + triangleSize * 0.5); // Bottom right
            ctx.closePath();
            ctx.fill();
            
            // Triangle outline
            ctx.strokeStyle = '#000080';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Center circle (white)
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Count text
            if (item.count > 1) {
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'right';
                ctx.fillText(item.count.toString(), x + size - 5, y + size - 5);
            }
        } else if (item.type === 'kasha') {
            // Draw captured kasha: ball in bottom left, sprite in top right
            const kashaType = item.data?.type || 'cassieduck';
            
            // Check if kasha is "used" (future feature - show only ball)
            const isUsed = item.data?.used || false;
            
            if (isUsed) {
                // Future: when kasha is used, show only the ball
                drawKashaballIcon(ctx, x, y, size);
            } else {
                // Normal captured state: ball + sprite
                drawKashaballIcon(ctx, x, y, size);
                drawKashaSprite(ctx, x, y, size, kashaType);
            }
        } else if (item.type === 'kasha_core') {
            // Draw Kasha core icon (glowing orb)
            const centerX = x + size / 2;
            const centerY = y + size / 2;
            const radius = size / 5;
            
            // Outer glow
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 2);
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.4)');
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Core body (golden)
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner highlight
            ctx.fillStyle = '#FFA500';
            ctx.beginPath();
            ctx.arc(centerX - radius / 3, centerY - radius / 3, radius / 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (item.type === 'weapon') {
            // Draw weapon icon
            const centerX = x + size / 2;
            const centerY = y + size / 2;
            const weaponType = item.data?.weaponType || 'sword';
            const isFused = item.data?.fused || false;
            
            // Weapon color based on type
            let weaponColor = '#C0C0C0'; // Default silver
            if (weaponType === 'sword') weaponColor = '#C0C0C0';
            else if (weaponType === 'axe') weaponColor = '#8B4513';
            else if (weaponType === 'staff') weaponColor = '#9370DB';
            else if (weaponType === 'dagger') weaponColor = '#708090';
            
            // Draw weapon based on type
            ctx.save();
            ctx.translate(centerX, centerY);
            
            if (weaponType === 'sword') {
                // Sword blade (vertical line)
                ctx.strokeStyle = weaponColor;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(0, -size / 3);
                ctx.lineTo(0, size / 3);
                ctx.stroke();
                
                // Sword hilt
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(-size / 12, size / 3, size / 6, size / 8);
                
                // Cross guard
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-size / 6, size / 4);
                ctx.lineTo(size / 6, size / 4);
                ctx.stroke();
            } else if (weaponType === 'axe') {
                // Axe head (triangle)
                ctx.fillStyle = weaponColor;
                ctx.beginPath();
                ctx.moveTo(0, -size / 4);
                ctx.lineTo(size / 4, size / 4);
                ctx.lineTo(-size / 4, size / 4);
                ctx.closePath();
                ctx.fill();
                
                // Axe handle
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, size / 4);
                ctx.lineTo(0, size / 3);
                ctx.stroke();
            } else if (weaponType === 'staff') {
                // Staff (vertical line with orb)
                ctx.strokeStyle = weaponColor;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(0, -size / 3);
                ctx.lineTo(0, size / 3);
                ctx.stroke();
                
                // Staff orb
                ctx.fillStyle = '#9370DB';
                ctx.beginPath();
                ctx.arc(0, -size / 3, size / 10, 0, Math.PI * 2);
                ctx.fill();
            } else if (weaponType === 'dagger') {
                // Dagger (small sword)
                ctx.strokeStyle = weaponColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, -size / 4);
                ctx.lineTo(0, size / 4);
                ctx.stroke();
                
                // Dagger hilt
                ctx.fillStyle = '#654321';
                ctx.fillRect(-size / 16, size / 4, size / 8, size / 10);
            }
            
            ctx.restore();
            
            // If fused, add glow effect
            if (isFused) {
                const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size / 2);
                glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
                glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
                ctx.fillStyle = glowGradient;
                ctx.beginPath();
                ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Count text for stackable weapons
            if (item.count > 1) {
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'right';
                ctx.fillText(item.count.toString(), x + size - 5, y + size - 5);
            }
        }
    }
    
    // Slot number (for main inventory slots 1-9)
    if (source === 'main' && slotIndex >= 0 && slotIndex < 9) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText((slotIndex + 1).toString(), x + 3, y + 15);
    }
}

// Draw Level Finished Screen
function drawLevelFinished() {
    if (!levelFinished) return;
    
    // Draw on main canvas (not pixelated)
    ctx.save();
    
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Menu box - larger to accommodate button
    const menuWidth = 600;
    const menuHeight = 400;
    const menuX = (canvas.width - menuWidth) / 2;
    const menuY = (canvas.height - menuHeight) / 2;
    
    ctx.fillStyle = '#27AE60';
    ctx.fillRect(menuX, menuY, menuWidth, menuHeight);
    
    ctx.strokeStyle = '#2ECC71';
    ctx.lineWidth = 4;
    ctx.strokeRect(menuX, menuY, menuWidth, menuHeight);
    
    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    const levelName = currentLevel === 1 ? 'TUTORIAL' : `LEVEL ${currentLevel}`;
    ctx.fillText(`CONGRATULATIONS!`, canvas.width / 2, menuY + 60);
    ctx.font = 'bold 32px Arial';
    ctx.fillText(`${levelName} COMPLETE!`, canvas.width / 2, menuY + 100);
    
    // Congratulations message
    ctx.font = '20px Arial';
    ctx.fillStyle = '#ECF0F1';
    ctx.fillText('Great job completing the level!', canvas.width / 2, menuY + 150);
    
    // Next Level button
    const buttonWidth = 250;
    const buttonHeight = 50;
    const buttonX = (canvas.width - buttonWidth) / 2;
    const buttonY = menuY + 200;
    
    // Check if mouse is over button
    const mouseOverButton = rawMouseX >= buttonX && rawMouseX <= buttonX + buttonWidth &&
                           rawMouseY >= buttonY && rawMouseY <= buttonY + buttonHeight;
    
    // Button background
    ctx.fillStyle = mouseOverButton ? '#2ECC71' : '#229954';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Button border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Button text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Next Level', canvas.width / 2, buttonY + 35);
    
    // Store button bounds for click detection
    window.levelFinishedButtonBounds = {
        x: buttonX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight
    };
    
    ctx.restore();
}

// Draw Game Over Screen
function drawGameOver() {
    if (!gameOver) return;
    
    // Draw on main canvas (not pixelated)
    ctx.save();
    
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Menu box
    const menuWidth = 500;
    const menuHeight = 300;
    const menuX = (canvas.width - menuWidth) / 2;
    const menuY = (canvas.height - menuHeight) / 2;
    
    ctx.fillStyle = '#C0392B';
    ctx.fillRect(menuX, menuY, menuWidth, menuHeight);
    
    ctx.strokeStyle = '#E74C3C';
    ctx.lineWidth = 4;
    ctx.strokeRect(menuX, menuY, menuWidth, menuHeight);
    
    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, menuY + 80);
    
    // Instructions
    ctx.font = '20px Arial';
    ctx.fillText('Click any button to retry', canvas.width / 2, menuY + 150);
    
    ctx.font = '16px Arial';
    ctx.fillStyle = '#ECF0F1';
    ctx.fillText('You ran out of hearts!', canvas.width / 2, menuY + 200);
    
    ctx.restore();
}

// Draw Level Selector Screen (Admin/Testing)
function drawLevelSelector() {
    if (!showLevelSelector) return;
    
    // Draw on main canvas (not pixelated)
    ctx.save();
    
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Menu box
    const menuWidth = 700;
    const menuHeight = 500;
    const menuX = (canvas.width - menuWidth) / 2;
    const menuY = (canvas.height - menuHeight) / 2;
    
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(menuX, menuY, menuWidth, menuHeight);
    
    ctx.strokeStyle = '#34495E';
    ctx.lineWidth = 4;
    ctx.strokeRect(menuX, menuY, menuWidth, menuHeight);
    
    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL SELECTOR (ADMIN)', canvas.width / 2, menuY + 50);
    
    // Instructions
    ctx.font = '18px Arial';
    ctx.fillStyle = '#ECF0F1';
    ctx.fillText('Press number key (1-9, 0 for 10) to select level', canvas.width / 2, menuY + 90);
    ctx.fillText('Press ESC to close', canvas.width / 2, menuY + 115);
    
    // Current level indicator
    ctx.font = '20px Arial';
    ctx.fillStyle = '#3498DB';
    ctx.fillText(`Current Level: ${currentLevel}`, canvas.width / 2, menuY + 150);
    
    // Level buttons grid (2 rows of 5)
    const buttonWidth = 100;
    const buttonHeight = 60;
    const buttonSpacing = 20;
    const startX = menuX + (menuWidth - (5 * buttonWidth + 4 * buttonSpacing)) / 2;
    const startY = menuY + 200;
    
    // Initialize button bounds array
    if (!window.levelSelectorButtons) {
        window.levelSelectorButtons = [];
    }
    
    for (let i = 1; i <= MAX_LEVELS; i++) {
        const row = Math.floor((i - 1) / 5);
        const col = (i - 1) % 5;
        const buttonX = startX + col * (buttonWidth + buttonSpacing);
        const buttonY = startY + row * (buttonHeight + buttonSpacing);
        
        // Check if mouse is over button
        const mouseOverButton = rawMouseX >= buttonX && rawMouseX <= buttonX + buttonWidth &&
                               rawMouseY >= buttonY && rawMouseY <= buttonY + buttonHeight;
        
        // Highlight current level
        const isCurrentLevel = i === currentLevel;
        
        // Button background
        if (isCurrentLevel) {
            ctx.fillStyle = '#3498DB';
        } else if (mouseOverButton) {
            ctx.fillStyle = '#5DADE2';
        } else {
            ctx.fillStyle = '#34495E';
        }
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Button border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Button text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        const levelName = i === 1 ? 'Tutorial' : `Level ${i}`;
        ctx.fillText(levelName, buttonX + buttonWidth / 2, buttonY + 35);
        
        // Store button bounds for click detection
        window.levelSelectorButtons[i] = {
            x: buttonX,
            y: buttonY,
            width: buttonWidth,
            height: buttonHeight
        };
    }
    
    ctx.restore();
}

// Draw Inventory HUD
function drawInventoryHUD() {
    // Draw on main canvas (not pixelated) positioned underneath the screen (below canvas)
    ctx.save();
    
    const slotSize = 50;
    const slotSpacing = 5;
    const padding = 5; // Small padding from bottom edge
    const gameAreaHeight = 600; // Original game area height
    const hudY = gameAreaHeight + padding; // Position below game area, underneath canvas game area
    const totalWidth = (slotSize + slotSpacing) * inventory.maxSlots - slotSpacing;
    const hudX = (canvas.width - totalWidth) / 2; // Center the inventory
    const hudHeight = slotSize + padding * 2; // Height of HUD bar for background
    
    // Background bar (dark with transparency) - starts at bottom of game area
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, gameAreaHeight, canvas.width, hudHeight);
    
    // Border line at bottom of game area (where inventory starts)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, gameAreaHeight);
    ctx.lineTo(canvas.width, gameAreaHeight);
    ctx.stroke();
    
    const visibleItems = inventory.getVisibleItems();
    
    // Draw each slot
    for (let i = 0; i < inventory.maxSlots; i++) {
        const slotX = hudX + i * (slotSize + slotSpacing);
        const slotY = hudY;
        const item = inventory.getItemAtSlot(i, 'main');
        
        // Slot background - selected if this slot matches the selected slot
        const isSelected = (i === inventory.selectedSlot);
        ctx.fillStyle = isSelected ? 'rgba(255, 255, 255, 0.3)' : 'rgba(100, 100, 100, 0.5)';
        ctx.fillRect(slotX, slotY, slotSize, slotSize);
        
        // Slot border
        ctx.strokeStyle = isSelected ? '#FFFFFF' : '#888888';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.strokeRect(slotX, slotY, slotSize, slotSize);
        
        // Slot number (1-9)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText((i + 1).toString(), slotX + 3, slotY + 16);
        
        // Draw item if exists
        if (item) {
            if (item.type === 'kashaball') {
                // Draw kashaball icon as blue triangle
                const centerX = slotX + slotSize / 2;
                const centerY = slotY + slotSize / 2 + 5;
                const triangleSize = 12;
                
                // Draw triangle (blue)
                ctx.fillStyle = '#0000FF';
                ctx.beginPath();
                // Equilateral triangle pointing up
                ctx.moveTo(centerX, centerY - triangleSize); // Top point
                ctx.lineTo(centerX - triangleSize * 0.866, centerY + triangleSize * 0.5); // Bottom left
                ctx.lineTo(centerX + triangleSize * 0.866, centerY + triangleSize * 0.5); // Bottom right
                ctx.closePath();
                ctx.fill();
                
                // Triangle outline
                ctx.strokeStyle = '#000080';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // Center circle (white)
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Count text
                if (item.count > 1) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = 'bold 12px Arial';
                    ctx.textAlign = 'right';
                    ctx.fillText(item.count.toString(), slotX + slotSize - 3, slotY + slotSize - 3);
                }
            } else if (item.type === 'kasha') {
                // Draw captured kasha: ball in bottom left, sprite in top right
                const kashaType = item.data?.type || 'cassieduck';
                
                // Check if kasha is "used" (future feature - show only ball)
                const isUsed = item.data?.used || false;
                
                if (isUsed) {
                    // Future: when kasha is used, show only the ball
                    drawKashaballIcon(ctx, slotX, slotY, slotSize);
                } else {
                    // Normal captured state: ball + sprite
                    drawKashaballIcon(ctx, slotX, slotY, slotSize);
                    drawKashaSprite(ctx, slotX, slotY, slotSize, kashaType);
                }
            }
        }
    }
    
        // Draw extended inventory indicator if open (E key)
        if (inventory.extendedOpen) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            const extendedHeight = Math.min(300, Math.ceil(inventory.maxSlots / 9) * (slotSize + slotSpacing) + 40);
            const extendedY = gameAreaHeight - extendedHeight; // Position above the game area, below the main inventory bar
            ctx.fillRect(0, extendedY, canvas.width, extendedHeight);
            
            // Title
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Extended Inventory (Press E to close)', canvas.width / 2, extendedY + 25);
            
            // Draw all main inventory slots in extended view (grid of 9 columns)
            const itemsPerRow = 9;
            const rows = Math.ceil(inventory.maxSlots / itemsPerRow);
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < itemsPerRow; col++) {
                    const itemIndex = row * itemsPerRow + col;
                    if (itemIndex >= inventory.maxSlots) break;
                    
                    const item = inventory.getItemAtSlot(itemIndex, 'main');
                    const extSlotX = hudX + col * (slotSize + slotSpacing);
                    const extSlotY = extendedY + 40 + row * (slotSize + slotSpacing);
                    
                    // Slot background
                    const isSelected = itemIndex === inventory.selectedSlot;
                    ctx.fillStyle = isSelected ? 'rgba(255, 255, 255, 0.3)' : 'rgba(100, 100, 100, 0.5)';
                    ctx.fillRect(extSlotX, extSlotY, slotSize, slotSize);
                    
                    // Slot border
                    ctx.strokeStyle = isSelected ? '#FFFFFF' : '#888888';
                    ctx.lineWidth = isSelected ? 3 : 2;
                    ctx.strokeRect(extSlotX, extSlotY, slotSize, slotSize);
                    
                    // Draw item if exists
                    if (item) {
                        if (item.type === 'kashaball') {
                            const centerX = extSlotX + slotSize / 2;
                            const centerY = extSlotY + slotSize / 2 + 5;
                            const triangleSize = 12;
                            
                            // Draw triangle (blue)
                            ctx.fillStyle = '#0000FF';
                            ctx.beginPath();
                            // Equilateral triangle pointing up
                            ctx.moveTo(centerX, centerY - triangleSize); // Top point
                            ctx.lineTo(centerX - triangleSize * 0.866, centerY + triangleSize * 0.5); // Bottom left
                            ctx.lineTo(centerX + triangleSize * 0.866, centerY + triangleSize * 0.5); // Bottom right
                            ctx.closePath();
                            ctx.fill();
                            
                            // Triangle outline
                            ctx.strokeStyle = '#000080';
                            ctx.lineWidth = 1;
                            ctx.stroke();
                            
                            // Center circle (white)
                            ctx.fillStyle = '#FFFFFF';
                            ctx.beginPath();
                            ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
                            ctx.fill();
                            
                            if (item.count > 1) {
                                ctx.fillStyle = '#FFFFFF';
                                ctx.font = 'bold 12px Arial';
                                ctx.textAlign = 'right';
                                ctx.fillText(item.count.toString(), extSlotX + slotSize - 3, extSlotY + slotSize - 3);
                            }
                        } else if (item.type === 'kasha') {
                            // Draw captured kasha: ball in bottom left, sprite in top right
                            const kashaType = item.data?.type || 'cassieduck';
                            
                            // Check if kasha is "used" (future feature - show only ball)
                            const isUsed = item.data?.used || false;
                            
                            if (isUsed) {
                                // Future: when kasha is used, show only the ball
                                drawKashaballIcon(ctx, extSlotX, extSlotY, slotSize);
                            } else {
                                // Normal captured state: ball + sprite
                                drawKashaballIcon(ctx, extSlotX, extSlotY, slotSize);
                                drawKashaSprite(ctx, extSlotX, extSlotY, slotSize, kashaType);
                            }
                        }
                    }
                }
            }
        }
    
    ctx.restore();
}

// Draw DIRT tiles from tile map
// Draw all tiles from the tilemap
function drawTileMap() {
    if (!window.worldMap) return;
    
    internalCtx.save();
    internalCtx.translate(Math.floor(-cameraX / pixelScale), Math.floor(-cameraY / pixelScale));
    
    // Calculate visible tile range (with some padding for smooth scrolling)
    const startTileX = Math.max(0, window.worldMap.pixelToTile(cameraX - window.TILE_SIZE));
    const endTileX = Math.min(window.worldMap.width - 1, window.worldMap.pixelToTile(cameraX + canvas.width * pixelScale + window.TILE_SIZE));
    const startTileY = Math.max(0, window.worldMap.pixelToTile(cameraY - window.TILE_SIZE));
    const endTileY = Math.min(window.worldMap.height - 1, window.worldMap.pixelToTile(cameraY + canvas.height * pixelScale + window.TILE_SIZE));
    
    // Draw each tile in the visible area
    for (let ty = startTileY; ty <= endTileY; ty++) {
        for (let tx = startTileX; tx <= endTileX; tx++) {
            const tileType = window.worldMap.getTile(tx, ty);
            if (tileType === window.TILE_TYPE.EMPTY) continue;
            
            const pixelX = window.worldMap.tileToPixel(tx);
            const pixelY = window.worldMap.tileToPixel(ty);
            const tileDef = window.getTileDefinition(tileType);
            
            // Draw base tile color
            internalCtx.fillStyle = tileDef.color;
            internalCtx.fillRect(
                Math.round(pixelX / pixelScale),
                Math.round(pixelY / pixelScale),
                Math.round(window.TILE_SIZE / pixelScale),
                Math.round(window.TILE_SIZE / pixelScale)
            );
            
            // Add texture/pattern based on tile type
            if (tileType === window.TILE_TYPE.DIRT) {
                // Draw dirt texture (simple pattern)
                internalCtx.fillStyle = '#654321';
                const patternSize = Math.round(4 / pixelScale);
                for (let i = 0; i < 4; i++) {
                    const offsetX = (Math.sin(i) * 3) / pixelScale;
                    const offsetY = (Math.cos(i) * 3) / pixelScale;
                    internalCtx.fillRect(
                        Math.round(pixelX / pixelScale + offsetX),
                        Math.round(pixelY / pixelScale + offsetY),
                        patternSize,
                        patternSize
                    );
                }
            } else if (tileType === window.TILE_TYPE.STONE) {
                // Stone texture - darker edges
                internalCtx.fillStyle = '#606060';
                internalCtx.fillRect(
                    Math.round(pixelX / pixelScale),
                    Math.round(pixelY / pixelScale),
                    Math.round(window.TILE_SIZE / pixelScale),
                    Math.round(2 / pixelScale)
                );
            } else if (tileType === window.TILE_TYPE.GRASS) {
                // Grass texture - lighter top
                internalCtx.fillStyle = '#32CD32';
                internalCtx.fillRect(
                    Math.round(pixelX / pixelScale),
                    Math.round(pixelY / pixelScale),
                    Math.round(window.TILE_SIZE / pixelScale),
                    Math.round(2 / pixelScale)
                );
            } else if (tileType === window.TILE_TYPE.WATER) {
                // Water animation effect (subtle)
                internalCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                const waveOffset = Math.sin((pixelX + Date.now() * 0.01) * 0.1) * 2;
                internalCtx.fillRect(
                    Math.round(pixelX / pixelScale),
                    Math.round((pixelY + waveOffset) / pixelScale),
                    Math.round(window.TILE_SIZE / pixelScale),
                    Math.round(4 / pixelScale)
                );
            } else if (tileType === window.TILE_TYPE.OIL) {
                // Oil shimmer effect
                internalCtx.fillStyle = 'rgba(100, 100, 100, 0.3)';
                internalCtx.fillRect(
                    Math.round(pixelX / pixelScale),
                    Math.round(pixelY / pixelScale),
                    Math.round(window.TILE_SIZE / pixelScale),
                    Math.round(window.TILE_SIZE / pixelScale)
                );
            } else if (tileType === window.TILE_TYPE.FIRE) {
                // Fire animation effect
                const fireIntensity = Math.sin((pixelX + Date.now() * 0.05) * 0.2) * 0.3 + 0.7;
                internalCtx.fillStyle = `rgba(255, ${Math.floor(69 * fireIntensity)}, 0, ${fireIntensity})`;
                internalCtx.fillRect(
                    Math.round(pixelX / pixelScale),
                    Math.round(pixelY / pixelScale),
                    Math.round(window.TILE_SIZE / pixelScale),
                    Math.round(window.TILE_SIZE / pixelScale)
                );
            } else if (tileType === window.TILE_TYPE.ASH) {
                // Ash texture - speckled
                internalCtx.fillStyle = '#555555';
                for (let i = 0; i < 3; i++) {
                    const offsetX = (Math.random() * 8) / pixelScale;
                    const offsetY = (Math.random() * 8) / pixelScale;
                    internalCtx.fillRect(
                        Math.round((pixelX + offsetX) / pixelScale),
                        Math.round((pixelY + offsetY) / pixelScale),
                        Math.round(2 / pixelScale),
                        Math.round(2 / pixelScale)
                    );
                }
            }
        }
    }
    
    internalCtx.restore();
}

function drawDirtTiles() {
    if (!window.worldMap) return;
    
    internalCtx.save();
    internalCtx.translate(Math.floor(-cameraX / pixelScale), Math.floor(-cameraY / pixelScale));
    
    // Calculate visible tile range (with some padding for smooth scrolling)
    const startTileX = Math.max(0, window.worldMap.pixelToTile(cameraX - window.TILE_SIZE));
    const endTileX = Math.min(window.worldMap.width - 1, window.worldMap.pixelToTile(cameraX + canvas.width * pixelScale + window.TILE_SIZE));
    const startTileY = Math.max(0, window.worldMap.pixelToTile(cameraY - window.TILE_SIZE));
    const endTileY = Math.min(window.worldMap.height - 1, window.worldMap.pixelToTile(cameraY + canvas.height * pixelScale + window.TILE_SIZE));
    
    // Draw each DIRT tile in the visible area
    for (let ty = startTileY; ty <= endTileY; ty++) {
        for (let tx = startTileX; tx <= endTileX; tx++) {
            if (window.worldMap.getTile(tx, ty) === window.TILE_TYPE.DIRT) {
                const pixelX = window.worldMap.tileToPixel(tx);
                const pixelY = window.worldMap.tileToPixel(ty);
                
                // Draw dirt tile (pixelated)
                internalCtx.fillStyle = '#8B4513'; // Brown dirt color
                internalCtx.fillRect(
                    Math.round(pixelX / pixelScale),
                    Math.round(pixelY / pixelScale),
                    Math.round(window.TILE_SIZE / pixelScale),
                    Math.round(window.TILE_SIZE / pixelScale)
                );
                
                // Draw dirt texture (simple pattern)
                internalCtx.fillStyle = '#654321';
                const patternSize = Math.round(4 / pixelScale);
                for (let i = 0; i < 4; i++) {
                    const offsetX = (Math.sin(i) * 3) / pixelScale;
                    const offsetY = (Math.cos(i) * 3) / pixelScale;
                    internalCtx.fillRect(
                        Math.round(pixelX / pixelScale + offsetX),
                        Math.round(pixelY / pixelScale + offsetY),
                        patternSize,
                        patternSize
                    );
                }
            }
        }
    }
    
    internalCtx.restore();
}

// ============================================================================
// DEBUG VISUALIZATION
// ============================================================================
// Draws debug overlays showing collision boxes, hitboxes, vision cones, etc.
// Toggle with 'p' key
// ============================================================================

function drawDebugVisualization() {
    if (!debugVisualizationEnabled) return;
    
    // Save ALL canvas state to prevent affecting sprite rendering
    internalCtx.save();
    internalCtx.translate(Math.floor(-cameraX / pixelScale), Math.floor(-cameraY / pixelScale));
    
    // Reset any canvas state that might affect rendering
    internalCtx.globalCompositeOperation = 'source-over';
    internalCtx.globalAlpha = 1.0;
    internalCtx.imageSmoothingEnabled = false;
    
    // Draw collision boxes (cyan)
    internalCtx.strokeStyle = '#00FFFF';
    internalCtx.lineWidth = 1;
    
    // Player collision box
    if (player) {
        internalCtx.strokeRect(
            Math.round(player.x / pixelScale),
            Math.round(player.y / pixelScale),
            Math.round(player.width / pixelScale),
            Math.round(player.height / pixelScale)
        );
    }
    
    // Enemy collision boxes
    enemies.forEach(enemy => {
        if (!enemy.dead) {
            internalCtx.strokeRect(
                Math.round(enemy.x / pixelScale),
                Math.round(enemy.y / pixelScale),
                Math.round(enemy.width / pixelScale),
                Math.round(enemy.height / pixelScale)
            );
        }
    });
    
    // Kasha collision boxes
    kashas.forEach(kasha => {
        if (!kasha.caught && !kasha.dead) {
            internalCtx.strokeRect(
                Math.round(kasha.x / pixelScale),
                Math.round(kasha.y / pixelScale),
                Math.round(kasha.width / pixelScale),
                Math.round(kasha.height / pixelScale)
            );
        }
    });
    
    // Platform collision boxes
    platforms.forEach(platform => {
        if (!platform.destroyed) {
            internalCtx.strokeRect(
                Math.round(platform.x / pixelScale),
                Math.round(platform.y / pixelScale),
                Math.round(platform.width / pixelScale),
                Math.round(platform.height / pixelScale)
            );
        }
    });
    
    // Box collision boxes
    boxes.forEach(box => {
        if (!box.hit) {
            internalCtx.strokeRect(
                Math.round(box.x / pixelScale),
                Math.round(box.y / pixelScale),
                Math.round(box.width / pixelScale),
                Math.round(box.height / pixelScale)
            );
        }
    });
    
    // Kashaball collision boxes
    kashaballs.forEach(kashaball => {
        if (!kashaball.collected) {
            internalCtx.strokeRect(
                Math.round(kashaball.x / pixelScale),
                Math.round(kashaball.y / pixelScale),
                Math.round(kashaball.width / pixelScale),
                Math.round(kashaball.height / pixelScale)
            );
        }
    });
    
    // Draw sprite outlines vs collision boxes (yellow - backup sprite bounds)
    internalCtx.strokeStyle = '#FFFF00';
    internalCtx.lineWidth = 1;
    internalCtx.setLineDash([2, 2]);
    
    if (player) {
        // Player sprite outline (backup bounds)
        const spriteOffsetX = (player.spriteWidth - player.width) / 2;
        const spriteOffsetY = (player.spriteHeight - player.height) / 2;
        internalCtx.strokeRect(
            Math.round((player.x - spriteOffsetX) / pixelScale),
            Math.round((player.y - spriteOffsetY) / pixelScale),
            Math.round(player.spriteWidth / pixelScale),
            Math.round(player.spriteHeight / pixelScale)
        );
    }
    
    internalCtx.setLineDash([]);
    
    // Draw actual sprite shape outline (pink for organisms - hugs the sprite pixels)
    internalCtx.strokeStyle = '#FF00FF';
    internalCtx.lineWidth = 1;
    internalCtx.setLineDash([]);
    
    // Player sprite outline (pink - organism)
    if (player) {
        const currentState = player.getCurrentState();
        const spriteSheet = player.spriteSheets[currentState];
        
        if (spriteSheet && spriteSheet.complete && spriteSheet.naturalWidth > 0) {
            // Calculate actual sprite draw position (matching player.draw() logic)
            let drawWidth = player.spriteWidth;
            let drawHeight = player.spriteHeight;
            let drawX = player.x - (player.spriteWidth - player.width) / 2;
            let drawY = player.y - (player.spriteHeight - player.height) / 2;
            
            // Account for ground slam transformations
            if (player.groundSlamming && player.slamChargeTime < 5) {
                drawWidth = player.spriteWidth * 1.2;
                drawHeight = player.spriteHeight * 0.8;
                drawX = player.x - (player.spriteWidth - player.width) / 2 - (drawWidth - player.spriteWidth) / 2;
                drawY = player.y - (player.spriteHeight - player.height) / 2 + (player.spriteHeight - drawHeight);
            } else if (player.groundSlamming && player.velocityY > 5) {
                drawWidth = player.spriteWidth * 0.9;
                drawHeight = player.spriteHeight * 1.1;
                drawX = player.x - (player.spriteWidth - player.width) / 2 + (player.spriteWidth - drawWidth) / 2;
                drawY = player.y - (player.spriteHeight - player.height) / 2;
            }
            
            // Apply sprite Y offset
            const spriteYOffset = -2;
            drawY = drawY + spriteYOffset;
            
            // Get current frame from sprite sheet
            const frameX = player.animationFrame * player.frameWidth;
            const frameY = 0;
            
            // Draw pink outline based on frame bounds (simpler, doesn't affect sprite rendering)
            // This creates an outline that hugs the sprite frame dimensions
            // For a true pixel-perfect outline, we'd need to analyze pixels, but that's too expensive
            internalCtx.strokeRect(
                Math.round(drawX / pixelScale),
                Math.round(drawY / pixelScale),
                Math.round(drawWidth / pixelScale),
                Math.round(drawHeight / pixelScale)
            );
        }
    }
    
    // Cassieduck sprite outline (pink - organism, traced from programmatic shapes)
    // Pink line is rendered by tracing the actual shapes (ellipse for body, circle for head, ellipse for bill)
    // All shapes are drawn in one continuous path to create a single organism outline
    kashas.forEach(kasha => {
        if (!kasha.caught && !kasha.dead && kasha.type === 'cassieduck') {
            const waddleOffset = Math.sin(kasha.waddleFrame * 0.2) * 2;
            const centerX = (kasha.x + kasha.width / 2) / pixelScale;
            const centerY = (kasha.y + kasha.height / 2 + waddleOffset) / pixelScale;
            const headX = (kasha.x + kasha.width / 2 + (kasha.direction * 8)) / pixelScale;
            const headY = (kasha.y + 8 + waddleOffset) / pixelScale;
            const billX = (kasha.x + kasha.width / 2 + (kasha.direction * 15)) / pixelScale;
            const billY = (kasha.y + 10 + waddleOffset) / pixelScale;
            
            const bodyRadiusX = (kasha.width / 2) / pixelScale;
            const bodyRadiusY = (kasha.height / 2.5) / pixelScale;
            const headRadius = 10 / pixelScale;
            const billRadiusX = 6 / pixelScale;
            const billRadiusY = 3 / pixelScale;
            
            // Draw all shapes as one continuous outline
            internalCtx.beginPath();
            
            // Body ellipse (main body)
            internalCtx.ellipse(centerX, centerY, bodyRadiusX, bodyRadiusY, 0, 0, Math.PI * 2);
            
            // Head circle (overlaps with body, creates continuous shape)
            internalCtx.arc(headX, headY, headRadius, 0, Math.PI * 2);
            
            // Bill ellipse (extends from head)
            internalCtx.ellipse(billX, billY, billRadiusX, billRadiusY, 0, 0, Math.PI * 2);
            
            // Stroke as one path (browser will render as overlapping shapes creating one outline)
            internalCtx.stroke();
        }
    });
    
    // Item outlines (green - for boxes, kashaballs, etc.)
    internalCtx.strokeStyle = '#00FF00';
    internalCtx.lineWidth = 1;
    
    // Box outlines (items)
    boxes.forEach(box => {
        if (!box.hit) {
            internalCtx.strokeRect(
                Math.round(box.x / pixelScale),
                Math.round(box.y / pixelScale),
                Math.round(box.width / pixelScale),
                Math.round(box.height / pixelScale)
            );
        }
    });
    
    // Kashaball outlines (items)
    kashaballs.forEach(kashaball => {
        if (!kashaball.collected) {
            const centerX = (kashaball.x + kashaball.width / 2) / pixelScale;
            const centerY = (kashaball.y + kashaball.height / 2) / pixelScale;
            const radius = (kashaball.width / 2) / pixelScale;
            internalCtx.beginPath();
            internalCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            internalCtx.stroke();
        }
    });
    
    // Draw hitboxes (red/orange)
    // Player weapon attack hitbox
    if (player && player.attacking) {
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
                
                // Draw weapon hit arc
                internalCtx.strokeStyle = '#FF0000';
                internalCtx.lineWidth = 2;
                internalCtx.beginPath();
                internalCtx.arc(
                    playerCenterX / pixelScale,
                    playerCenterY / pixelScale,
                    weaponLength / pixelScale,
                    finalAngle - w.hitArc / 2,
                    finalAngle + w.hitArc / 2
                );
                internalCtx.lineTo(playerCenterX / pixelScale, playerCenterY / pixelScale);
                internalCtx.closePath();
                internalCtx.stroke();
            }
        }
    }
    
    // Ground slam hitbox
    if (player && player.groundSlamming && player.velocityY > 10) {
        internalCtx.strokeStyle = '#FF8800';
        internalCtx.lineWidth = 2;
        const slamRadius = 60;
        internalCtx.beginPath();
        internalCtx.arc(
            (player.x + player.width / 2) / pixelScale,
            (player.y + player.height) / pixelScale,
            slamRadius / pixelScale,
            0,
            Math.PI * 2
        );
        internalCtx.stroke();
    }
    
    // Enemy attack hitboxes
    enemies.forEach(enemy => {
        if (!enemy.dead && enemy.attacking && enemy.checkPlayerHit) {
            // MaroonBlobEnemy1 bite hitbox
            if (enemy.mouthOpen !== undefined && enemy.mouthOpen > 0.5) {
                let hitBoxX = enemy.x;
                let hitBoxWidth = enemy.width;
                const mouthExtension = 25 * enemy.mouthOpen;
                if (enemy.biteDirection === -1) {
                    hitBoxX = enemy.x - mouthExtension;
                    hitBoxWidth = enemy.width + mouthExtension;
                } else {
                    hitBoxWidth = enemy.width + mouthExtension;
                }
                
                internalCtx.strokeStyle = '#FF0000';
                internalCtx.lineWidth = 2;
                internalCtx.strokeRect(
                    Math.round(hitBoxX / pixelScale),
                    Math.round(enemy.y / pixelScale),
                    Math.round(hitBoxWidth / pixelScale),
                    Math.round(enemy.height / pixelScale)
                );
            }
        }
    });
    
    // Draw vision cones (green/yellow) - proper vision angle visualization
    enemies.forEach(enemy => {
        if (!enemy.dead && enemy.visionSystem) {
            const enemyCenterX = (enemy.x + enemy.width / 2) / pixelScale;
            const enemyCenterY = (enemy.y + enemy.height / 2) / pixelScale;
            const visionRange = enemy.visionSystem.visionRange / pixelScale;
            const visionAngle = enemy.visionSystem.visionAngle || (Math.PI * 2 / 3); // 120 degrees default
            const direction = enemy.direction || -1; // -1 for left, 1 for right
            
            // Determine if player is visible (check if playerVisible property exists)
            const isPlayerVisible = enemy.playerVisible || false;
            
            // Calculate vision cone angle based on enemy direction
            // Enemy facing left (direction = -1) means vision cone points left
            // Enemy facing right (direction = 1) means vision cone points right
            const baseAngle = direction === 1 ? 0 : Math.PI; // 0 = right, Math.PI = left
            const startAngle = baseAngle - visionAngle / 2;
            const endAngle = baseAngle + visionAngle / 2;
            
            // Draw vision cone (sector)
            internalCtx.strokeStyle = isPlayerVisible ? '#00FF00' : '#FFFF00';
            internalCtx.fillStyle = isPlayerVisible ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 255, 0, 0.1)';
            internalCtx.lineWidth = 1;
            internalCtx.setLineDash([3, 3]);
            
            // Draw filled vision cone
            internalCtx.beginPath();
            internalCtx.moveTo(enemyCenterX, enemyCenterY);
            internalCtx.arc(enemyCenterX, enemyCenterY, visionRange, startAngle, endAngle);
            internalCtx.closePath();
            internalCtx.fill();
            internalCtx.stroke();
            
            internalCtx.setLineDash([]);
            
            // Draw enemy state text above enemy
            if (enemy.stateMachine) {
                const state = enemy.stateMachine.getState() || 'idle';
                const stateText = state.toUpperCase();
                const textX = enemyCenterX;
                const textY = (enemy.y - 15) / pixelScale;
                
                // Draw text background for readability
                internalCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                internalCtx.fillRect(textX - 30, textY - 8, 60, 12);
                
                // Draw state text
                internalCtx.fillStyle = '#FFFFFF';
                internalCtx.font = '10px monospace';
                internalCtx.textAlign = 'center';
                internalCtx.textBaseline = 'middle';
                internalCtx.fillText(stateText, textX, textY);
                
                // Reset text alignment
                internalCtx.textAlign = 'left';
                internalCtx.textBaseline = 'alphabetic';
            }
        }
    });
    
    // Draw patrol paths (blue)
    internalCtx.strokeStyle = '#0000FF';
    internalCtx.lineWidth = 1;
    internalCtx.setLineDash([5, 5]);
    
    enemies.forEach(enemy => {
        if (!enemy.dead && enemy.startX !== undefined && enemy.patrolDistance !== undefined) {
            const patrolY = enemy.y + enemy.height + 5;
            const patrolLeft = enemy.startX - enemy.patrolDistance;
            const patrolRight = enemy.startX + enemy.patrolDistance;
            
            // Draw patrol line (full range)
            internalCtx.beginPath();
            internalCtx.moveTo(Math.round(patrolLeft / pixelScale), Math.round(patrolY / pixelScale));
            internalCtx.lineTo(Math.round(patrolRight / pixelScale), Math.round(patrolY / pixelScale));
            internalCtx.stroke();
            
            // Draw start position marker
            internalCtx.fillStyle = '#0000FF';
            internalCtx.beginPath();
            internalCtx.arc(
                Math.round(enemy.startX / pixelScale),
                Math.round(patrolY / pixelScale),
                3,
                0,
                Math.PI * 2
            );
            internalCtx.fill();
            
            // Draw current position indicator
            internalCtx.fillStyle = '#00FFFF';
            internalCtx.beginPath();
            internalCtx.arc(
                Math.round((enemy.x + enemy.width / 2) / pixelScale),
                Math.round((enemy.y + enemy.height) / pixelScale),
                2,
                0,
                Math.PI * 2
            );
            internalCtx.fill();
        }
    });
    
    // Kasha patrol paths
    kashas.forEach(kasha => {
        if (!kasha.caught && !kasha.dead && kasha.startX !== undefined && kasha.patrolDistance !== undefined) {
            const patrolY = kasha.y + kasha.height + 5;
            const patrolLeft = kasha.startX - kasha.patrolDistance;
            const patrolRight = kasha.startX + kasha.patrolDistance;
            
            // Draw patrol line (full range)
            internalCtx.beginPath();
            internalCtx.moveTo(Math.round(patrolLeft / pixelScale), Math.round(patrolY / pixelScale));
            internalCtx.lineTo(Math.round(patrolRight / pixelScale), Math.round(patrolY / pixelScale));
            internalCtx.stroke();
            
            // Draw start position marker
            internalCtx.fillStyle = '#0000FF';
            internalCtx.beginPath();
            internalCtx.arc(
                Math.round(kasha.startX / pixelScale),
                Math.round(patrolY / pixelScale),
                3,
                0,
                Math.PI * 2
            );
            internalCtx.fill();
        }
    });
    
    internalCtx.setLineDash([]);
    
    internalCtx.restore();
}

console.log('drawing.js loaded successfully');
