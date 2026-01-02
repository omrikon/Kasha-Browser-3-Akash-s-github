// ============================================================================
// CONFIG.JS - Configuration and Canvas Setup
// ============================================================================
// This file contains all configuration constants and canvas setup.
// ============================================================================

console.log('Loading config.js...');

// Game Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Pixelization Setup - Create a smaller internal canvas for pixel art effect (Terraria-style)
const pixelScale = 4; // Pixel size multiplier (higher = more pixelated, Terraria uses 2x but we'll use 4x for more visible pixels)
const internalWidth = Math.floor(canvas.width / pixelScale);
const internalHeight = Math.floor(canvas.height / pixelScale);
const internalCanvas = document.createElement('canvas');
internalCanvas.width = internalWidth;
internalCanvas.height = internalHeight;
const internalCtx = internalCanvas.getContext('2d');

// Disable image smoothing for pixel art effect (critical for Terraria-style)
ctx.imageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false; // IE
internalCtx.imageSmoothingEnabled = false;
internalCtx.msImageSmoothingEnabled = false; // IE

// Set canvas CSS to prevent smoothing
canvas.style.imageRendering = 'pixelated';
canvas.style.imageRendering = '-moz-crisp-edges';
canvas.style.imageRendering = 'crisp-edges';

// DOM Element References
const kashaballCountElement = document.getElementById('pokeballCount'); // Keep ID for HTML compatibility
const kashaCountElement = document.getElementById('kashaCount');
const healthDisplayElement = document.getElementById('healthDisplay');

// Weapon Type Data Structure (consolidates all weapon properties)
const WEAPON_TYPES = {
    sword: {windup:6,attack:10,recovery:8,range:35,extension:15,cooldown:20,color:'#C0C0C0',width:3,windupAngle:-Math.PI/3,attackStart:-Math.PI/3,attackEnd:Math.PI*2/3,hitStart:6,hitEnd:16,hitArc:Math.PI/3},
    axe: {windup:10,attack:8,recovery:10,range:40,extension:20,cooldown:30,color:'#8B4513',width:4,windupAngle:-Math.PI/2-Math.PI/4,attackStart:-Math.PI/2-Math.PI/4,attackEnd:Math.PI/2+Math.PI/4,hitStart:10,hitEnd:18,hitArc:Math.PI/2.5},
    staff: {windup:5,attack:12,recovery:7,range:45,extension:25,cooldown:15,color:'#9370DB',width:2.5,windupAngle:-Math.PI/6,attackStart:0,attackEnd:0,hitStart:5,hitEnd:17,hitArc:Math.PI/6},
    dagger: {windup:3,attack:6,recovery:5,range:25,extension:10,cooldown:10,color:'#708090',width:2,windupAngle:-Math.PI/8,attackStart:0,attackEnd:0,hitStart:3,hitEnd:9,hitArc:Math.PI/4}
};

// Admin Cheat Code Constants
const CHEAT_CODE = 'lop'; // Admin level selector cheat code
const MAX_LEVELS = 10; // Maximum number of levels available for testing

console.log('config.js loaded successfully');

