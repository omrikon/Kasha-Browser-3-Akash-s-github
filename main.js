// ============================================================================
// MAIN.JS - Game Entry Point
// ============================================================================
// This is where the game actually starts! All the other files load first
// (in the order specified in index.html), and then this file runs to
// initialize everything and start the game loop. Think of this as the
// "power button" that turns the game on.
// ============================================================================

// This message appears in the browser console when the game starts
console.log('=== STARTING GAME ===');

// ============================================================================
// CREATE THE PLAYER CHARACTER
// ============================================================================
// The player is the character you control. We create it at a specific position
// on the screen. The position is calculated so the player spawns on the ground.
// ============================================================================

// Create the player object at position (100, 470)
// x=100: 100 pixels from the left edge of the level
// y=470: Calculated so player's feet are on the ground
//        Ground is at y=550, player height is 80, so spawn at y=470 (550-80=470)
player = new Player(100, 470);

// Load all the player's sprite sheets (animation images)
// This loads the images for walking, jumping, idle, etc.
// Must be called after creating the player so the player object exists
player.loadAllSpriteSheets();

// ============================================================================
// CREATE THE INVENTORY SYSTEM
// ============================================================================
// The inventory stores all your items (kashaballs, weapons, caught kashas, etc.)
// ============================================================================

// Create a new inventory object to manage all player items
inventory = new Inventory();

// ============================================================================
// INITIALIZE THE GAME WORLD
// ============================================================================
// Now we set up the game world - create the level, start audio, and update
// the display to show the starting state.
// ============================================================================

// Create the first level (level 1)
// This generates all platforms, boxes, enemies, kashas, etc.
createLevel(currentLevel);

// Initialize the audio system (set up music and sound effects)
// This prepares the background music and sound effect system
initAudio();

// Update the health display to show the player's starting health
// This draws the hearts in the top-left corner
updateHealthDisplay();

// ============================================================================
// START THE GAME LOOP
// ============================================================================
// The game loop is the heart of the game - it runs continuously, updating
// everything and redrawing the screen many times per second (usually 60 times).
// This is what makes the game actually run and respond to your input.
// ============================================================================

// Start the main game loop
// This function runs forever, updating and drawing the game every frame
gameLoop();

// This message appears when the game has fully started
console.log('=== GAME STARTED ===');

