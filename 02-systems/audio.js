// ============================================================================
// AUDIO.JS - Audio System
// ============================================================================
// This file handles all the game's audio - both background music and sound
// effects. It's like the game's sound system that plays music and makes
// noise when things happen (collecting items, taking damage, etc.).
// ============================================================================

// This message appears in the browser console when the file loads
console.log('Loading audio.js...');

// ============================================================================
// AUDIO CONTEXT SETUP (The audio engine)
// ============================================================================
// The audio context is like the "sound card" for the game. It's the system
// that actually generates and plays sounds. We create it once and use it
// for all sound effects throughout the game.
// ============================================================================

// Create the Web Audio API context (the audio engine)
// This is what actually generates and plays sounds
// window.AudioContext is the standard, webkitAudioContext is for older browsers
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// ============================================================================
// BACKGROUND MUSIC
// ============================================================================
// Background music plays continuously while you play. It's separate from
// sound effects and can be turned on/off independently.
// ============================================================================

// The background music audio object (starts as null, gets created in initAudio)
// This is the actual music file that plays in the background
let backgroundMusic = null;

// ============================================================================
// INITIALIZE AUDIO SYSTEM
// ============================================================================
// This function sets up the background music. It tries to load a music file
// from the game's assets folder, and if that doesn't exist, it falls back
// to online music sources. This ensures the game always has music available.
// ============================================================================

function initAudio() {
    console.log('Initializing audio system...');
    
    // Create a new HTML5 Audio element for background music
    // This is like creating a music player
    backgroundMusic = new Audio();
    
    // Try to load music from the local game files first
    // This is the preferred source - users can add their own music here
    backgroundMusic.src = 'assets/music/background.mp3';
    
    // Make the music loop forever (when it ends, it starts over)
    // This creates continuous background music
    backgroundMusic.loop = true;
    
    // Set the volume to 5% (very quiet for background ambiance)
    // 0.05 means 5% volume - low enough to not be distracting
    backgroundMusic.volume = 0.05;
    
    // Slow down the music to 80% speed (makes it more relaxed/chill)
    // 0.80 means 80% of normal speed - adjust between 0.5 (half speed) and 1.0 (normal speed)
    backgroundMusic.playbackRate = 0.80;
    
    // Tell the browser to preload the music file
    // This means it starts downloading immediately, so it's ready when needed
    backgroundMusic.preload = 'auto';
    
    // Fallback to online royalty-free music if local file doesn't exist
    backgroundMusic.addEventListener('error', () => {
        console.log('Local music file not found, using online source...');
        // Using a chill, relaxed royalty-free game music URL
        // This is a slower, more peaceful track perfect for a relaxed gaming experience
        // Source: SoundHelix - ambient/chill style (slower tempo)
        backgroundMusic.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3';
        // Ensure playback rate is maintained after source change
        backgroundMusic.playbackRate = 0.80;
        
        // If online source also fails, try another reliable source
        backgroundMusic.addEventListener('error', () => {
            console.log('Primary online source failed, trying alternative...');
            // Alternative: Another chill/relaxed free music source
            backgroundMusic.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';
            backgroundMusic.playbackRate = 0.80;
            
            // Final fallback
            backgroundMusic.addEventListener('error', () => {
                console.log('All music sources failed. Please add your own music file to: assets/music/background.mp3');
                console.log('Recommended: Download a chill/ambient royalty-free track from freesound.org, incompetech.com, or opengameart.org');
            }, { once: true });
        }, { once: true });
    }, { once: true });
    
    // Music will not autoplay - user must manually start it via pause menu
    console.log('Audio system initialized');
}

// ============================================================================
// BACKGROUND MUSIC CONTROL FUNCTIONS
// ============================================================================
// These functions control when the background music plays, pauses, and stops.
// They're called from the pause menu and game state management.
// ============================================================================

// Start playing the background music
// Only plays if music isn't already playing, isn't muted, and the music file exists
function playMusic() {
    // Don't play if already playing, muted, or no music file
    if (musicPlaying || musicMuted || !backgroundMusic) return;
    
    // Mark music as playing
    musicPlaying = true;
    
    // Try to play the music
    // .catch() handles errors if the music can't play (e.g., browser restrictions)
    backgroundMusic.play().catch(err => {
        console.log('Music play failed:', err);
        musicPlaying = false; // Reset flag if play failed
    });
}

// Pause the background music (temporarily stop it)
// Used when the game is paused or music is muted
function pauseMusic() {
    // Only pause if music exists and is currently playing
    if (backgroundMusic && !backgroundMusic.paused) {
        backgroundMusic.pause();
    }
}

// Resume playing the background music (continue from where it paused)
// Used when unpausing the game or unmuting music
function resumeMusic() {
    // Only resume if music exists, isn't muted, and was playing before
    if (backgroundMusic && !musicMuted && musicPlaying) {
        backgroundMusic.play().catch(err => {
            console.log('Music resume failed:', err);
        });
    }
}

// Toggle music mute on/off (like a mute button)
// When muted, music stops. When unmuted, music resumes if it was playing
function toggleMusicMute() {
    // Flip the mute state (if muted, unmute; if unmuted, mute)
    musicMuted = !musicMuted;
    
    if (backgroundMusic) {
        if (musicMuted) {
            // If we're muting, pause the music
            backgroundMusic.pause();
        } else {
            // If we're unmuting, resume music if it was playing and game isn't paused
            if (musicPlaying && !gamePaused) {
                backgroundMusic.play().catch(err => {
                    console.log('Music play failed:', err);
                });
            }
        }
    }
}

// ============================================================================
// SOUND EFFECT SYSTEM
// ============================================================================
// Sound effects are short audio clips that play when specific events happen
// (like collecting an item, taking damage, etc.). We generate these sounds
// programmatically using the Web Audio API instead of using sound files.
// This allows us to create sounds on-the-fly with different pitches and tones.
// ============================================================================

// ============================================================================
// GENERIC SOUND PLAYER (The base function for all sound effects)
// ============================================================================
// This function creates and plays a sound with specific properties.
// It's like a sound synthesizer - we tell it what pitch, how long, and
// what type of sound wave to make, and it generates the sound.
// 
// Parameters:
//   frequency - How high or low the sound is (pitch) in Hz
//               Higher numbers = higher pitch (like a bird chirp)
//               Lower numbers = lower pitch (like a drum)
//   duration - How long the sound lasts in seconds
//   type - What kind of sound wave to use ('sine', 'square', 'sawtooth')
//          Different types create different tones (smooth, buzzy, etc.)
//   volume - How loud the sound is (0.0 to 1.0, where 1.0 is maximum)
// ============================================================================

function playSound(frequency, duration, type = 'sine', volume = 0.2) {
    // Create an oscillator - this generates the sound wave
    // Think of it as a speaker that vibrates at a specific frequency
    const osc = audioContext.createOscillator();
    
    // Create a gain node - this controls the volume
    // Think of it as a volume knob
    const gain = audioContext.createGain();
    
    // Set the type of sound wave (sine = smooth, square = buzzy, sawtooth = harsh)
    osc.type = type;
    
    // Set the pitch (frequency) of the sound
    osc.frequency.value = frequency;
    
    // Set up volume envelope (how the sound fades in and out)
    // Start at volume 0 (silent)
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    
    // Quickly fade in to full volume over 0.01 seconds (prevents clicks/pops)
    gain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    
    // Fade out exponentially over the duration (smooth fade out)
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    // Connect the oscillator to the gain (volume control)
    osc.connect(gain);
    
    // Connect the gain to the speakers (audio output)
    gain.connect(audioContext.destination);
    
    // Start playing the sound now
    osc.start(audioContext.currentTime);
    
    // Stop playing after the duration
    osc.stop(audioContext.currentTime + duration);
}

// ============================================================================
// SPECIFIC SOUND EFFECT FUNCTIONS
// ============================================================================
// These functions play specific sounds for different game events.
// Each one is called when something happens in the game (collecting items,
// taking damage, etc.). They use the playSound() function or create custom
// sounds with special effects.
// ============================================================================

// Play a pleasant chime sound when collecting items (kashaballs, etc.)
// Uses two musical notes (C5 and E5) played in quick succession
// Creates a happy "ding-ding" sound
function playCollectSound() {
    // Play first note (C5 - middle C, pleasant tone)
    playSound(523.25, 0.2, 'sine', 0.3);
    
    // Play second note (E5) 50 milliseconds later (creates harmony)
    // setTimeout delays the second sound slightly for a nice chord effect
    setTimeout(() => playSound(659.25, 0.2, 'sine', 0.25), 50);
}

// Play a whoosh sound when throwing a kashaball
// Creates a custom sound that starts high and drops low (like something flying)
function playThrowSound() {
    // Create the sound components
    const osc = audioContext.createOscillator(); // The sound generator
    const gain = audioContext.createGain(); // Volume control
    const filter = audioContext.createBiquadFilter(); // Sound filter (makes it sound muffled)
    
    // Use sawtooth wave (harsh, whooshy sound)
    osc.type = 'sawtooth';
    
    // Start at high pitch (200 Hz) and drop to low pitch (100 Hz) over 0.15 seconds
    // This creates the "whoosh" effect - like something flying past
    osc.frequency.setValueAtTime(200, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.15);
    
    // Apply a low-pass filter (muffles the sound, makes it less harsh)
    filter.type = 'lowpass';
    filter.frequency.value = 1000; // Cut off frequencies above 1000 Hz
    
    // Set up volume envelope (fade in and out)
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    // Connect: oscillator -> filter -> gain -> speakers
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    
    // Play the sound
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.15);
}

// Play a quick bounce sound when kashaballs bounce
// Short, sharp sound that plays when items hit the ground
function playBounceSound() {
    // Low pitch (200 Hz), very short (0.1 seconds), square wave (buzzy)
    playSound(200, 0.1, 'square', 0.15);
}

// Play a damage sound when the player takes damage
// Lower pitch, harsh sound that indicates pain/hurt
function playDamageSound() {
    // First sound: low pitch (150 Hz), sawtooth wave (harsh), medium length
    playSound(150, 0.3, 'sawtooth', 0.25);
    
    // Second sound: even lower pitch (120 Hz), plays 50ms later
    // Creates a "thud-thud" effect like getting hit
    setTimeout(() => playSound(120, 0.2, 'sawtooth', 0.2), 50);
}

// Play a sound when an enemy takes damage
// Similar to player damage but slightly different tone
function playEnemyDamageSound() {
    // First sound: medium-low pitch (200 Hz), square wave (buzzy)
    playSound(200, 0.2, 'square', 0.2);
    
    // Second sound: slightly lower (180 Hz), plays 30ms later
    // Creates a "pop-pop" effect
    setTimeout(() => playSound(180, 0.15, 'square', 0.15), 30);
}

// Play a sound when an enemy dies
// Low pitch, longer sound that indicates defeat/death
function playEnemyDeathSound() {
    // First sound: very low pitch (100 Hz), longer duration (0.4 seconds)
    playSound(100, 0.4, 'sawtooth', 0.3);
    
    // Second sound: even lower (80 Hz), plays 100ms later
    // Creates a descending "doom-doom" effect like something falling
    setTimeout(() => playSound(80, 0.3, 'sawtooth', 0.25), 100);
}

console.log('audio.js loaded successfully');

