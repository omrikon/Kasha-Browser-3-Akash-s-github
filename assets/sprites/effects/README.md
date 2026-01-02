# Effect Sprites

Visual effect sprites (particles, explosions, etc.).

## Current Status

⚠️ **Effects are currently drawn programmatically** (shapes, particles, etc. drawn in code).

## Future: Adding Effect Sprites

### 📁 groundslam/
Ground slam effect sprites:
- Shockwave rings
- Impact particles
- Screen shake effects

### 📁 breaking/
Platform breaking effect sprites:
- Crack patterns
- Debris particles
- Breaking animation frames

### 📁 particles/
Particle effect sprites:
- Dirt particles
- Smoke
- Sparks
- Magic effects

## Sprite Guidelines

- Frame size: Varies by effect (8-32px typical)
- Format: PNG with transparency
- Layout: Horizontal sprite sheet or individual frames
- Animation: Usually short loops (3-10 frames)

## Usage

Effects are drawn in:
- `03-classes/effects.js` - GroundSlamEffect, PlatformBreakingEffect
- `03-classes/particles.js` - DirtTile particles
- `02-systems/drawing.js` - Various visual effects

