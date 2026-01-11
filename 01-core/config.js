// ============================================================================
// CONFIG.JS - Configuration and Canvas Setup
// ============================================================================
// This file contains all the game's configuration settings and sets up the
// drawing canvas. Think of this as the "settings menu" for the game engine.
// Everything that controls how the game looks and behaves starts here.
// ============================================================================

// This message appears in the browser console when the file loads
// It helps us know that this file loaded successfully
console.log('Loading config.js...');

// ============================================================================
// GAME CANVAS SETUP
// ============================================================================
// The canvas is like a blank piece of paper where we draw everything.
// We get the canvas element from the HTML page and set up a drawing context.
// ============================================================================

// Get the canvas element from the HTML page (the game screen)
// This is the actual visible game area that players see
const canvas = document.getElementById('gameCanvas');

// Get the 2D drawing context - this is like getting a paintbrush
// We use this to draw everything on the canvas
const ctx = canvas.getContext('2d');

// ============================================================================
// PIXEL ART SETUP (Terraria-style pixelated graphics)
// ============================================================================
// To create a retro pixel art look, we draw everything on a smaller canvas
// and then scale it up. This makes the pixels look big and blocky, like
// classic games. It's like drawing on graph paper and then zooming in.
// ============================================================================

// How much to scale up the pixels (4x means each game pixel becomes 4 screen pixels)
// Higher numbers = more pixelated/blocky look
// Terraria uses 2x, but we use 4x for an even more retro look
const pixelScale = 4;

// Calculate the size of our internal (smaller) canvas
// We divide the visible canvas size by the pixel scale
// Math.floor rounds down to whole numbers (no half-pixels)
const internalWidth = Math.floor(canvas.width / pixelScale);
const internalHeight = Math.floor(canvas.height / pixelScale);

// Create a hidden canvas that we'll draw on first
// This is the "graph paper" we draw on before scaling up
const internalCanvas = document.createElement('canvas');
internalCanvas.width = internalWidth;
internalCanvas.height = internalHeight;

// Get the drawing context for the internal canvas
// This is our "paintbrush" for the smaller canvas
const internalCtx = internalCanvas.getContext('2d');

// ============================================================================
// DISABLE IMAGE SMOOTHING (Keep pixels sharp and blocky)
// ============================================================================
// By default, browsers try to smooth/blur images when scaling them up.
// We don't want that for pixel art - we want sharp, blocky pixels!
// So we turn off smoothing for both canvases.
// ============================================================================

// Turn off smoothing on the main canvas (prevents blurry pixels)
ctx.imageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false; // For Internet Explorer (old browser support)

// Turn off smoothing on the internal canvas (prevents blurry pixels)
internalCtx.imageSmoothingEnabled = false;
internalCtx.msImageSmoothingEnabled = false; // For Internet Explorer

// Also tell the browser's CSS to not smooth the canvas
// This ensures pixels stay sharp even when the browser tries to resize
canvas.style.imageRendering = 'pixelated';
canvas.style.imageRendering = '-moz-crisp-edges'; // For Firefox
canvas.style.imageRendering = 'crisp-edges'; // Standard way

// ============================================================================
// UI ELEMENT REFERENCES (Connecting to HTML display elements)
// ============================================================================
// These variables point to the HTML elements that show game information
// like health, item counts, etc. We use these to update what the player sees.
// ============================================================================

// Reference to the element that shows how many kashaballs the player has
// Note: The HTML uses "pokeballCount" as the ID, but we call them kashaballs in code
const kashaballCountElement = document.getElementById('pokeballCount');

// Reference to the element that shows how many kashas the player has caught
const kashaCountElement = document.getElementById('kashaCount');

// Reference to the element that shows the player's health (hearts)
const healthDisplayElement = document.getElementById('healthDisplay');

// ============================================================================
// WEAPON TYPE DEFINITIONS (All weapon stats in one place)
// ============================================================================
// This object contains all the properties for each weapon type in the game.
// Each weapon has different stats like attack speed, range, damage timing, etc.
// Think of this as a "weapon database" that the game looks up when you use a weapon.
// ============================================================================

const WEAPON_TYPES = {
    // SWORD - Balanced weapon, medium speed and range
    sword: {
        windup: 6,        // Frames before attack starts (windup animation)
        attack: 10,        // Frames during active attack (when it can hit)
        recovery: 8,       // Frames after attack (recovery animation)
        range: 35,         // How far the weapon reaches (in pixels)
        extension: 15,     // How much extra reach during attack
        cooldown: 20,      // Frames before you can attack again
        color: '#C0C0C0', // Silver color for the weapon
        width: 3,          // How thick the weapon looks
        windupAngle: -Math.PI/3,  // Starting angle for windup (backward swing)
        attackStart: -Math.PI/3,  // Angle when attack starts
        attackEnd: Math.PI*2/3,   // Angle when attack ends (forward swing)
        hitStart: 6,       // Frame when weapon can start hitting enemies
        hitEnd: 16,        // Frame when weapon stops being able to hit
        hitArc: Math.PI/3  // The angle range where weapon can hit (60 degrees)
    },
    
    // AXE - Slow but powerful, wide swing
    axe: {
        windup: 10,       // Longer windup (slower to start)
        attack: 8,        // Shorter attack window
        recovery: 10,       // Longer recovery (slower to finish)
        range: 40,         // Longer reach than sword
        extension: 20,     // More extension during attack
        cooldown: 30,      // Longer cooldown (slower attack rate)
        color: '#8B4513',  // Brown color for the axe
        width: 4,          // Thicker than sword
        windupAngle: -Math.PI/2-Math.PI/4,  // Bigger backward swing
        attackStart: -Math.PI/2-Math.PI/4,  // Starts from far back
        attackEnd: Math.PI/2+Math.PI/4,     // Swings all the way forward
        hitStart: 10,      // Later hit start (more windup)
        hitEnd: 18,        // Later hit end
        hitArc: Math.PI/2.5  // Wider hit arc (can hit more enemies)
    },
    
    // STAFF - Fast, long range, but weaker
    staff: {
        windup: 5,        // Quick windup
        attack: 12,       // Longer attack window
        recovery: 7,      // Quick recovery
        range: 45,         // Longest range
        extension: 25,     // Most extension
        cooldown: 15,      // Short cooldown (fast attack rate)
        color: '#9370DB',  // Purple color for the staff
        width: 2.5,        // Thinner than sword
        windupAngle: -Math.PI/6,  // Small backward angle
        attackStart: 0,    // Starts straight
        attackEnd: 0,      // Stays straight (thrusting motion)
        hitStart: 5,       // Early hit start
        hitEnd: 17,        // Late hit end (long hit window)
        hitArc: Math.PI/6  // Narrow hit arc (precise)
    },
    
    // DAGGER - Very fast, short range
    dagger: {
        windup: 3,        // Very quick windup
        attack: 6,         // Short attack window
        recovery: 5,       // Very quick recovery
        range: 25,         // Shortest range
        extension: 10,     // Least extension
        cooldown: 10,      // Shortest cooldown (fastest attack rate)
        color: '#708090',  // Gray color for the dagger
        width: 2,          // Thinnest weapon
        windupAngle: -Math.PI/8,  // Small backward angle
        attackStart: 0,    // Starts straight
        attackEnd: 0,      // Stays straight (stabbing motion)
        hitStart: 3,       // Very early hit start
        hitEnd: 9,         // Early hit end (quick attack)
        hitArc: Math.PI/4  // Medium hit arc
    }
};

// ============================================================================
// ADMIN/TESTING FEATURES (Hidden developer tools)
// ============================================================================
// These are special codes and settings for testing the game.
// Regular players won't see these, but developers can use them to test levels.
// ============================================================================

// The secret cheat code to open the level selector menu
// Type "lop" to access developer level selection
const CHEAT_CODE = 'lop';

// Maximum number of levels available in the game
// Used by the level selector to know how many levels exist
const MAX_LEVELS = 10;

console.log('config.js loaded successfully');

