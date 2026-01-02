// ============================================================================
// MAIN.JS - Game Entry Point
// ============================================================================
// This is where the game starts! Everything else loads before this.
// ============================================================================

console.log('=== STARTING GAME ===');

// Initialize game objects (variables declared in gameState.js)
// Spawn player on ground: ground is at y=550, player height is 80, so spawn at y=470
player = new Player(100, 470);
// Load sprite sheets after player creation
player.loadAllSpriteSheets();
inventory = new Inventory();

// Initialize the game
createLevel(currentLevel);
initAudio();
updateHealthDisplay();

// Start the game loop
gameLoop();

console.log('=== GAME STARTED ===');

