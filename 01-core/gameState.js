// ============================================================================
// GAMESTATE.JS - Game State Variables
// ============================================================================
// This file stores all the game's current state - like a save file that updates
// every frame. It tracks things like player position, collected items, game
// status, and all the objects in the world. Think of it as the game's "memory"
// that remembers everything that's happening right now.
// ============================================================================

// This message appears in the browser console when the file loads
console.log('Loading gameState.js...');

// ============================================================================
// PLAYER PROGRESS AND STATISTICS
// ============================================================================
// These variables track what the player has accomplished in the game.
// ============================================================================

// How many kashaballs (throwing items) the player has collected
// Starts at 0 and increases when you break boxes or collect them
var kashaballsCollected = 0;

// How many kashas (catchable creatures) the player has successfully caught
// Increases when you throw a kashaball at a kasha and catch it
var kashasCaught = 0;

// ============================================================================
// CAMERA SYSTEM (What the player sees on screen)
// ============================================================================
// The camera follows the player around the level. These variables track
// where the camera is positioned so we know what part of the world to show.
// ============================================================================

// The camera's horizontal position (left/right) in the game world
// This moves as the player moves, keeping them centered on screen
var cameraX = 0;

// The camera's vertical position (up/down) in the game world
// Currently not used much, but available for future features
var cameraY = 0;

// ============================================================================
// MOUSE INPUT TRACKING
// ============================================================================
// These variables track where the mouse cursor is, which is used for aiming
// when throwing kashaballs and for clicking on UI elements.
// ============================================================================

// Whether the player is currently showing the throwing trajectory preview
// When true, a line shows where the kashaball will go when thrown
var showingTrajectory = false;

// The mouse position in the game world (accounts for camera movement)
// This is where the mouse is in the actual game world, not just on screen
var mouseX = 0;
var mouseY = 0;

// The raw mouse position on the canvas (screen coordinates)
// This is the mouse position relative to the game window, before camera adjustment
var rawMouseX = 0;
var rawMouseY = 0;

// ============================================================================
// GAME STATUS FLAGS (On/Off switches for game states)
// ============================================================================
// These boolean (true/false) variables track different game states.
// They're like light switches - either on or off.
// ============================================================================

// Whether the game is currently paused (true) or running (false)
// When paused, everything stops except the pause menu
var gamePaused = false;

// Whether background music is currently playing
// Used to track if music should be playing (separate from muted)
var musicPlaying = false;

// Whether the player has muted the music
// When true, music won't play even if musicPlaying is true
var musicMuted = false;

// Whether the current level has been completed
// When true, shows the "Level Complete" screen
var levelFinished = false;

// Whether the game is over (player died and needs to restart)
// When true, shows the "Game Over" screen
var gameOver = false;

// ============================================================================
// LEVEL SYSTEM
// ============================================================================
// These variables track information about the current level.
// ============================================================================

// Which level the player is currently on (1, 2, 3, etc.)
// Starts at 1 and increases when you complete a level
var currentLevel = 1;

// How wide the current level is in pixels
// Used to know where the level ends (so you can't go too far right)
var levelWidth = 52000;

// Special item that was randomly rolled when completing a level
// Can be null (no special item) or an object with item information
// This is for future features where completing levels gives random rewards
var specialItemRolled = null;

// ============================================================================
// ADMIN/TESTING FEATURES (Hidden developer tools)
// ============================================================================
// These variables are used for developer testing features that regular
// players won't normally see.
// ============================================================================

// Tracks the last few keys pressed to detect cheat codes
// When you type "lop", it opens the level selector
var cheatCodeBuffer = '';

// Whether the level selector menu is currently showing
// When true, shows a menu where developers can jump to any level
var showLevelSelector = false;

// Whether debug visualization is enabled (shows collision boxes, hitboxes, etc.)
// Toggle with 'p' key - displays visual debug information overlaid on the game
var debugVisualizationEnabled = false;

// ============================================================================
// INPUT HANDLING
// ============================================================================
// This object tracks which keys are currently being pressed.
// ============================================================================

// An object that stores which keys are currently pressed
// Example: keys['w'] = true means the W key is being held down
// Used to check player input every frame
var keys = {};

// ============================================================================
// GAME OBJECT ARRAYS (Lists of all objects in the world)
// ============================================================================
// These arrays store all the objects that exist in the game world.
// Think of them as lists - we add objects to the list when they're created,
// and remove them when they're destroyed or collected.
// ============================================================================

// Array of all platforms (the ground and platforms you can jump on)
// Each platform is an object with position, size, and color
var platforms = [];

// Array of all boxes (the question mark boxes that contain kashaballs)
// When you hit a box from below, it releases a kashaball
var boxes = [];

// Array of all kashaballs in the world (both thrown and collected ones)
// Includes kashaballs that popped out of boxes and ones you threw
var kashaballs = [];

// Array of ground slam visual effects (the golden shockwave circles)
// Created when the player performs a ground slam attack
var groundSlamEffects = [];

// Array of platform breaking animations (crack effects when platforms break)
// Shows the Minecraft-style breaking animation when a platform is destroyed
var platformBreakingEffects = [];

// Array of falling dirt particles (created when ground slam breaks dirt)
// These are individual dirt tiles that fall with physics and settle on the ground
var dirtTiles = [];

// Array of all enemies in the current level
// Each enemy is an object that moves, attacks, and can be defeated
var enemies = [];

// Array of all kashas (catchable creatures) in the current level
// These are the creatures you can catch with kashaballs
var kashas = [];

// Array of kasha corpses (dead kashas that you can extract cores from)
// When a kasha you own dies, it becomes a corpse you can interact with
var kashaCorpses = [];

// ============================================================================
// PLAYER AND INVENTORY REFERENCES
// ============================================================================
// These variables store references to the main player object and inventory.
// They start as null and get created in main.js after all classes are loaded.
// ============================================================================

// Reference to the player object (the character you control)
// Contains all player data like position, health, movement, etc.
// Starts as null and gets created when the game initializes
var player = null;

// Reference to the inventory system (manages all your items)
// Handles item storage, selection, and organization
// Starts as null and gets created when the game initializes
var inventory = null;

// ============================================================================
// WEAPON FUSION SYSTEM
// ============================================================================
// These variables track items placed in the fusion slots for combining
// weapons with kasha cores to create powerful fused weapons.
// ============================================================================

// The weapon item currently placed in the weapon fusion slot
// When you drag a weapon here, it's ready to be fused with a core
// null means the slot is empty
var fusionWeaponSlot = null;

// The kasha core item currently placed in the core fusion slot
// When you drag a core here, it's ready to be fused with a weapon
// null means the slot is empty
var fusionCoreSlot = null;

console.log('gameState.js loaded successfully');

