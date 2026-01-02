// ============================================================================
// AUDIO.JS - Audio System
// ============================================================================
// This file handles all audio functionality including background music and sound effects.
// ============================================================================

console.log('Loading audio.js...');

// Audio System
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Background Music - Using HTML5 Audio for better quality
let backgroundMusic = null;

// Initialize audio
function initAudio() {
    console.log('Initializing audio system...');
    // Create audio element for background music
    backgroundMusic = new Audio();
    
    // Try local music file first (user can add their own music here)
    // If local file doesn't exist, fallback to online source
    backgroundMusic.src = 'assets/music/background.mp3';
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.05; // Very low volume (5% - background ambiance)
    backgroundMusic.playbackRate = 0.80; // Slow down the music to make it more chill (80% speed - adjust between 0.5-1.0)
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

function playMusic() {
    if (musicPlaying || musicMuted || !backgroundMusic) return;
    musicPlaying = true;
    backgroundMusic.play().catch(err => {
        console.log('Music play failed:', err);
        musicPlaying = false;
    });
}

function pauseMusic() {
    if (backgroundMusic && !backgroundMusic.paused) {
        backgroundMusic.pause();
    }
}

function resumeMusic() {
    if (backgroundMusic && !musicMuted && musicPlaying) {
        backgroundMusic.play().catch(err => {
            console.log('Music resume failed:', err);
        });
    }
}

function toggleMusicMute() {
    musicMuted = !musicMuted;
    if (backgroundMusic) {
        if (musicMuted) {
            backgroundMusic.pause();
        } else {
            if (musicPlaying && !gamePaused) {
                backgroundMusic.play().catch(err => {
                    console.log('Music play failed:', err);
                });
            }
        }
    }
}

// Sound Effects
function playSound(frequency, duration, type = 'sine', volume = 0.2) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + duration);
}

function playCollectSound() {
    // Pleasant chime sound
    playSound(523.25, 0.2, 'sine', 0.3); // C5
    setTimeout(() => playSound(659.25, 0.2, 'sine', 0.25), 50); // E5
}

function playThrowSound() {
    // Whoosh sound
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.15);
    
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.15);
}

function playBounceSound() {
    // Quick bounce sound
    playSound(200, 0.1, 'square', 0.15);
}

function playDamageSound() {
    // Ouch sound - lower pitch, quick
    playSound(150, 0.3, 'sawtooth', 0.25);
    setTimeout(() => playSound(120, 0.2, 'sawtooth', 0.2), 50);
}

function playEnemyDamageSound() {
    // Enemy taking damage sound
    playSound(200, 0.2, 'square', 0.2);
    setTimeout(() => playSound(180, 0.15, 'square', 0.15), 30);
}

function playEnemyDeathSound() {
    // Enemy death sound - lower pitch, longer
    playSound(100, 0.4, 'sawtooth', 0.3);
    setTimeout(() => playSound(80, 0.3, 'sawtooth', 0.25), 100);
}

console.log('audio.js loaded successfully');

