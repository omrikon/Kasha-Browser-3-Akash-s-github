// ============================================================================
// 02-SYSTEMS-AUDIO-TESTS.JS - Tests for Audio System
// ============================================================================
// This file contains tests for the audio system (audio.js):
// - Audio context initialization
// - Background music controls
// - Sound effect functions
// ============================================================================

console.log('Loading 02-systems-audio-tests.js...');

function runAudioTests() {
    const audioTests = [];
    
    // Test: Audio context exists
    audioTests.push(createTest('Audio context exists', function() {
        assertNotNull(audioContext, 'Audio context should exist');
        assertTrue(audioContext instanceof (window.AudioContext || window.webkitAudioContext), 
                   'Audio context should be instance of AudioContext');
    }));
    
    // Test: Background music variable exists
    audioTests.push(createTest('Background music variable exists', function() {
        // Note: backgroundMusic may be null until initAudio() is called
        assertTrue(typeof backgroundMusic === 'object' || backgroundMusic === null, 
                   'Background music should be object or null');
    }));
    
    // Test: initAudio function exists
    audioTests.push(createTest('initAudio function exists', function() {
        assertTrue(typeof initAudio === 'function', 'initAudio should be a function');
    }));
    
    // Test: Music control functions exist
    audioTests.push(createTest('playMusic function exists', function() {
        assertTrue(typeof playMusic === 'function', 'playMusic should be a function');
    }));
    
    audioTests.push(createTest('pauseMusic function exists', function() {
        assertTrue(typeof pauseMusic === 'function', 'pauseMusic should be a function');
    }));
    
    audioTests.push(createTest('resumeMusic function exists', function() {
        assertTrue(typeof resumeMusic === 'function', 'resumeMusic should be a function');
    }));
    
    audioTests.push(createTest('toggleMusicMute function exists', function() {
        assertTrue(typeof toggleMusicMute === 'function', 'toggleMusicMute should be a function');
    }));
    
    // Test: Sound effect functions exist
    audioTests.push(createTest('playSound function exists', function() {
        assertTrue(typeof playSound === 'function', 'playSound should be a function');
    }));
    
    audioTests.push(createTest('playCollectSound function exists', function() {
        assertTrue(typeof playCollectSound === 'function', 'playCollectSound should be a function');
    }));
    
    audioTests.push(createTest('playThrowSound function exists', function() {
        assertTrue(typeof playThrowSound === 'function', 'playThrowSound should be a function');
    }));
    
    audioTests.push(createTest('playBounceSound function exists', function() {
        assertTrue(typeof playBounceSound === 'function', 'playBounceSound should be a function');
    }));
    
    audioTests.push(createTest('playDamageSound function exists', function() {
        assertTrue(typeof playDamageSound === 'function', 'playDamageSound should be a function');
    }));
    
    audioTests.push(createTest('playEnemyDamageSound function exists', function() {
        assertTrue(typeof playEnemyDamageSound === 'function', 'playEnemyDamageSound should be a function');
    }));
    
    audioTests.push(createTest('playEnemyDeathSound function exists', function() {
        assertTrue(typeof playEnemyDeathSound === 'function', 'playEnemyDeathSound should be a function');
    }));
    
    // Test: Music mute toggle functionality
    audioTests.push(createTest('toggleMusicMute toggles mute state', function() {
        const originalMuted = musicMuted;
        toggleMusicMute();
        assertNotEquals(musicMuted, originalMuted, 'Music muted state should change after toggle');
        // Toggle back to restore original state
        toggleMusicMute();
        assertEquals(musicMuted, originalMuted, 'Music muted state should restore after second toggle');
    }));
    
    // Test: Music respects muted state
    audioTests.push(createTest('Music respects muted state when playing', function() {
        // Set muted state
        const originalMuted = musicMuted;
        musicMuted = true;
        
        // Try to play music - should not play if muted
        if (backgroundMusic) {
            const wasPlaying = !backgroundMusic.paused;
            playMusic();
            // Music should remain paused if muted
            if (musicMuted) {
                assertTrue(backgroundMusic.paused, 'Music should remain paused when muted');
            }
        }
        
        // Restore original state
        musicMuted = originalMuted;
    }));
    
    runTestSuite('Audio System Tests', audioTests);
}

function runAllAudioTests() {
    console.log('\n🔊 Running Audio Tests');
    console.log('='.repeat(50));
    runAudioTests();
}

console.log('02-systems-audio-tests.js loaded successfully');
