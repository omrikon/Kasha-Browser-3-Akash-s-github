// ============================================================================
// CLASSES/EFFECTS.JS - Visual Effect Classes
// ============================================================================
// This file contains classes for visual effects like ground slam and platform breaking.
// ============================================================================

console.log('Loading classes/effects.js...');

// Ground Slam Effect Class
class GroundSlamEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 60;
        this.alpha = 1;
        this.active = true;
    }

    update() {
        this.radius += 3;
        this.alpha -= 0.05;
        if (this.radius >= this.maxRadius || this.alpha <= 0) {
            this.active = false;
        }
    }

    draw() {
        if (!this.active) return;
        
        internalCtx.save();
        internalCtx.translate(Math.floor(-cameraX / pixelScale), Math.floor(-cameraY / pixelScale));
        internalCtx.globalAlpha = this.alpha;
        internalCtx.strokeStyle = '#FFD700';
        internalCtx.lineWidth = 2;
        internalCtx.beginPath();
        internalCtx.arc(this.x / pixelScale, this.y / pixelScale, this.radius / pixelScale, 0, Math.PI * 2);
        internalCtx.stroke();
        
        internalCtx.strokeStyle = '#FFA500';
        internalCtx.lineWidth = 1;
        internalCtx.beginPath();
        internalCtx.arc(this.x / pixelScale, this.y / pixelScale, (this.radius * 0.7) / pixelScale, 0, Math.PI * 2);
        internalCtx.stroke();
        
        internalCtx.globalAlpha = 1;
        internalCtx.restore();
    }
}

// Platform Breaking Animation (Minecraft-style)
class PlatformBreakingEffect {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.breakStage = 0; // 0-10, 10 = fully broken
        this.alpha = 1;
        this.active = true;
    }
    
    update() {
        this.breakStage += 0.5; // Animate breaking
        if (this.breakStage >= 10) {
            this.active = false;
        }
    }
    
    draw() {
        if (!this.active) return;
        
        internalCtx.save();
        internalCtx.translate(Math.floor(-cameraX / pixelScale), Math.floor(-cameraY / pixelScale));
        
        // Draw breaking cracks (pixelated)
        internalCtx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        internalCtx.lineWidth = 1;
        
        const crackPattern = Math.floor(this.breakStage);
        const pixelX = Math.round(this.x / pixelScale);
        const pixelY = Math.round(this.y / pixelScale);
        const pixelW = Math.round(this.width / pixelScale);
        const pixelH = Math.round(this.height / pixelScale);
        
        // Draw increasingly visible cracks
        for (let i = 0; i < crackPattern; i++) {
            const startX = pixelX + (pixelW / 4) * (i % 3);
            const startY = pixelY + (pixelH / 4) * Math.floor(i / 3);
            const endX = pixelX + pixelW * (0.3 + Math.random() * 0.4);
            const endY = pixelY + pixelH * (0.3 + Math.random() * 0.4);
            
            internalCtx.beginPath();
            internalCtx.moveTo(startX, startY);
            internalCtx.lineTo(endX, endY);
            internalCtx.stroke();
        }
        
        // Fade out effect
        internalCtx.globalAlpha = 1 - (this.breakStage / 10);
        internalCtx.fillStyle = 'rgba(139, 69, 19, 0.5)';
        internalCtx.fillRect(pixelX, pixelY, pixelW, pixelH);
        
        internalCtx.globalAlpha = 1;
        internalCtx.restore();
    }
}

console.log('classes/effects.js loaded successfully');

