// ============================================================================
// GAMESTATE.JS - Game State Variables
// ============================================================================
// This file contains all game state variables and object arrays.
// ============================================================================

console.log('Loading gameState.js...');

// Game State Variables
var kashaballsCollected = 0;
var kashasCaught = 0;
var cameraX = 0;
var cameraY = 0;
var showingTrajectory = false;
var mouseX = 0;
var mouseY = 0;
var rawMouseX = 0; // Raw canvas-relative mouse position
var rawMouseY = 0; // Raw canvas-relative mouse position
var gamePaused = false;
var musicPlaying = false;
var musicMuted = false;
var levelFinished = false;
var gameOver = false;

// Level System
var currentLevel = 1;
var levelWidth = 52000;
var specialItemRolled = null;

// Admin Cheat Code System (Hidden)
var cheatCodeBuffer = ''; // Tracks recent key presses for cheat code detection
var showLevelSelector = false; // Whether to show the level selector menu

// Input Handling
var keys = {};

// Game Object Arrays (will be initialized after classes are loaded)
var platforms = [];
var boxes = [];
var kashaballs = [];
var groundSlamEffects = [];
var platformBreakingEffects = []; // Minecraft-style breaking animations
var dirtTiles = []; // Falling dirt particles
var enemies = [];
var kashas = [];
var kashaCorpses = []; // Dead owned Kasha for core extraction

// Player and Inventory (will be initialized after classes are loaded)
var player = null;
var inventory = null;

// Fusion system state
var fusionWeaponSlot = null; // Item in weapon fusion slot
var fusionCoreSlot = null; // Item in core fusion slot

console.log('gameState.js loaded successfully');

