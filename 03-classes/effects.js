// ============================================================================
// CLASSES/EFFECTS.JS - Visual Effect Classes
// ============================================================================
// This file contains classes for visual effects like ground slam and platform breaking.
// Visual effects are the animations you see on screen when certain actions happen,
// like when the player slams the ground or when a platform breaks.
// ============================================================================

// This message appears in the browser console when the file loads
// It helps us know that this file loaded successfully
console.log('Loading classes/effects.js...');

// ============================================================================
// GROUND SLAM EFFECT CLASS
// ============================================================================
// This class creates a visual effect that appears when the player performs
// a "ground slam" attack. Think of it like a shockwave that expands outward
// from where the player hits the ground - like ripples in water, but golden!
// ============================================================================
class GroundSlamEffect {
    // This is the "constructor" - it's called when we create a new ground slam effect
    // It sets up all the starting values for the effect
    // 
    // Parameters (the information we need to create the effect):
    //   x - The horizontal position (left/right) where the effect starts
    //   y - The vertical position (up/down) where the effect starts
    constructor(x, y) {
        // Store the starting position where the effect appears
        // These are like coordinates on a map - x is left/right, y is up/down
        this.x = x;
        this.y = y;
        
        // Start with a radius of 0 (no circle visible yet)
        // The radius is how big the circle is - we'll make it grow over time
        this.radius = 0;
        
        // The maximum size the circle can grow to (in pixels)
        // Once it reaches this size, the effect will disappear
        this.maxRadius = 60;
        
        // Alpha controls how transparent/see-through the effect is
        // 1 = completely visible, 0 = completely invisible
        // We start at 1 (fully visible) and make it fade out over time
        this.alpha = 1;
        
        // This tells us if the effect is still active (visible) or finished
        // true = still showing, false = done and can be removed
        this.active = true;
    }

    // This function is called every frame (many times per second) to update the effect
    // It makes the circle grow bigger and fade out over time
    update() {
        // Make the circle grow by 3 pixels each frame
        // This creates the expanding shockwave effect
        this.radius += 3;
        
        // Make the effect fade out by reducing its visibility
        // Each frame it becomes 5% more transparent
        this.alpha -= 0.05;
        
        // Check if the effect should stop (either too big or too faded)
        // If the circle is as big as it can get OR completely invisible, turn it off
        if (this.radius >= this.maxRadius || this.alpha <= 0) {
            // Mark this effect as inactive so it can be removed from the game
            this.active = false;
        }
    }

    // This function draws (renders) the effect on the screen
    // It's called every frame to show the visual effect to the player
    draw() {
        // If the effect is no longer active, don't draw anything
        // This prevents drawing invisible or finished effects
        if (!this.active) return;
        
        // Save the current drawing settings (like a bookmark)
        // We'll change some settings to draw the effect, then restore them
        internalCtx.save();
        
        // Move the drawing position to account for the camera
        // The camera follows the player, so we need to adjust where we draw
        // to make sure the effect stays in the right place on screen
        // Math.floor rounds down to whole numbers (no decimals) for pixel-perfect drawing
        internalCtx.translate(Math.floor(-cameraX / pixelScale), Math.floor(-cameraY / pixelScale));
        
        // Set how transparent the effect should be
        // This makes it fade out over time
        internalCtx.globalAlpha = this.alpha;
        
        // Set the color of the outer circle to gold (#FFD700 is the color code for gold)
        internalCtx.strokeStyle = '#FFD700';
        
        // Set how thick the circle's outline should be (2 pixels)
        internalCtx.lineWidth = 2;
        
        // Start drawing a circle (arc)
        internalCtx.beginPath();
        // Draw a full circle (360 degrees = Math.PI * 2)
        // The circle is centered at the effect's position, with the current radius
        // We divide by pixelScale to convert game coordinates to screen pixels
        internalCtx.arc(this.x / pixelScale, this.y / pixelScale, this.radius / pixelScale, 0, Math.PI * 2);
        // Actually draw the circle outline
        internalCtx.stroke();
        
        // Draw a second, smaller circle inside the first one for a layered effect
        // This makes it look more interesting - like two shockwaves
        // Set the color to orange (lighter gold)
        internalCtx.strokeStyle = '#FFA500';
        
        // Make this inner circle's outline thinner (1 pixel)
        internalCtx.lineWidth = 1;
        
        // Start drawing the inner circle
        internalCtx.beginPath();
        // Draw a circle that's 70% the size of the outer circle (0.7 = 70%)
        // This creates a nice layered effect
        internalCtx.arc(this.x / pixelScale, this.y / pixelScale, (this.radius * 0.7) / pixelScale, 0, Math.PI * 2);
        // Draw the inner circle
        internalCtx.stroke();
        
        // Reset the transparency back to fully visible (for other things we draw)
        internalCtx.globalAlpha = 1;
        
        // Restore the drawing settings we saved earlier
        // This undoes all the changes we made (like moving the camera position)
        internalCtx.restore();
    }
}

// ============================================================================
// PLATFORM BREAKING EFFECT CLASS
// ============================================================================
// This class creates a visual effect that shows a platform breaking apart
// It's inspired by Minecraft's block breaking animation - you see cracks
// appear and get more intense until the block disappears
// ============================================================================
class PlatformBreakingEffect {
    // This is the constructor - it sets up the breaking animation
    // 
    // Parameters (the information we need to create the effect):
    //   x - The left edge of the platform
    //   y - The top edge of the platform
    //   width - How wide the platform is
    //   height - How tall the platform is
    constructor(x, y, width, height) {
        // Store the platform's position and size
        // We need these to know where to draw the breaking effect
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // Track how broken the platform is (0 = not broken, 10 = completely broken)
        // This is like a progress bar - as it increases, more cracks appear
        this.breakStage = 0; // 0-10, 10 = fully broken
        
        // How visible the platform still is (1 = fully visible, 0 = invisible)
        // As it breaks, it fades away
        this.alpha = 1;
        
        // Whether this effect is still active (true = showing, false = done)
        this.active = true;
    }
    
    // This function is called every frame to update the breaking animation
    // It makes the platform look more and more broken over time
    update() {
        // Increase the break stage by 0.5 each frame
        // This makes the cracks appear gradually (not all at once)
        this.breakStage += 0.5; // Animate breaking
        
        // If the platform is completely broken (stage 10), stop the effect
        if (this.breakStage >= 10) {
            // Mark the effect as inactive so it can be removed
            this.active = false;
        }
    }
    
    // This function draws the breaking effect on the screen
    // It shows cracks appearing on the platform and makes it fade out
    draw() {
        // If the effect is no longer active, don't draw anything
        if (!this.active) return;
        
        // Save the current drawing settings
        internalCtx.save();
        
        // Adjust for the camera position (so it stays in the right place on screen)
        internalCtx.translate(Math.floor(-cameraX / pixelScale), Math.floor(-cameraY / pixelScale));
        
        // Draw breaking cracks (the lines that show the platform is breaking)
        // Set the crack color to dark/black with some transparency
        internalCtx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        
        // Make the cracks thin (1 pixel wide)
        internalCtx.lineWidth = 1;
        
        // Figure out how many cracks to show based on how broken the platform is
        // Math.floor rounds down, so if breakStage is 3.7, we show 3 cracks
        const crackPattern = Math.floor(this.breakStage);
        
        // Convert the platform's position and size to pixel coordinates
        // Math.round makes sure we're drawing on whole pixels (not between pixels)
        // This keeps the cracks looking sharp and pixelated
        const pixelX = Math.round(this.x / pixelScale);
        const pixelY = Math.round(this.y / pixelScale);
        const pixelW = Math.round(this.width / pixelScale);
        const pixelH = Math.round(this.height / pixelScale);
        
        // Draw increasingly visible cracks as the platform breaks
        // Each crack is a line drawn from one point to another
        for (let i = 0; i < crackPattern; i++) {
            // Calculate where each crack should start
            // We spread them out across the platform in a grid pattern
            // The modulo operator (%) gives us the remainder, so i % 3 cycles 0,1,2,0,1,2...
            const startX = pixelX + (pixelW / 4) * (i % 3);
            const startY = pixelY + (pixelH / 4) * Math.floor(i / 3);
            
            // Calculate where each crack should end (randomly within the platform)
            // Math.random() gives a number between 0 and 1, so we use it to pick
            // a random spot within 30-70% of the platform's width/height
            const endX = pixelX + pixelW * (0.3 + Math.random() * 0.4);
            const endY = pixelY + pixelH * (0.3 + Math.random() * 0.4);
            
            // Start drawing a line (the crack)
            internalCtx.beginPath();
            // Move to the starting point
            internalCtx.moveTo(startX, startY);
            // Draw a line to the ending point
            internalCtx.lineTo(endX, endY);
            // Actually draw the line
            internalCtx.stroke();
        }
        
        // Fade out effect - make the platform gradually disappear as it breaks
        // Calculate how transparent it should be (more broken = more transparent)
        // If breakStage is 5 (half broken), alpha is 0.5 (half visible)
        internalCtx.globalAlpha = 1 - (this.breakStage / 10);
        
        // Draw a semi-transparent brown rectangle over the platform
        // This makes it look like it's fading away
        // rgba(139, 69, 19, 0.5) is brown color with 50% transparency
        internalCtx.fillStyle = 'rgba(139, 69, 19, 0.5)';
        // Fill the entire platform area with this fading color
        internalCtx.fillRect(pixelX, pixelY, pixelW, pixelH);
        
        // Reset transparency back to fully visible for other things
        internalCtx.globalAlpha = 1;
        
        // Restore the drawing settings we saved earlier
        internalCtx.restore();
    }
}

// This message appears in the browser console when the file finishes loading
// It confirms that all the classes in this file are ready to use
console.log('classes/effects.js loaded successfully');
