# Player Sprites

Player character animation sprites organized by state.

## Current Sprites (Loaded in Game)

✅ **idle/** - Idle animation
- `idle sprite sheet.png` - 2 frames, 64x64 each

✅ **walk/** - Walking animation  
- `walk_sprite_sheet.png` - 8 frames, 64x64 each

## Future Sprites (Not Yet Loaded)

These folders exist but need sprite sheets added:

- **jump/** - Jumping upward animation
- **fall/** - Falling downward animation
- **land/** - Landing animation (brief)
- **groundslam_start/** - Ground slam charge/windup
- **groundslam_impact/** - Ground slam impact
- **throw/** - Throwing kashaball animation
- **aim/** - Aiming trajectory animation
- **pickup/** - Picking up items animation
- **hurt/** - Taking damage animation

## How to Add Sprites

1. Create a sprite sheet with all frames in one horizontal image
2. Each frame should be 64x64 pixels
3. Name it: `[state]_sprite_sheet.png` (e.g., `jump_sprite_sheet.png`)
4. Place it in the appropriate folder
5. Update `03-classes/player.js` in the `loadAllSpriteSheets()` function:
   ```javascript
   this.loadSpriteSheet('jump', 'assets/sprites/player/jump/jump_sprite_sheet.png', 64, 64);
   ```

## Sprite Sheet Format

```
[Frame 1][Frame 2][Frame 3]...
  64px    64px    64px
```

All frames side-by-side, same height (64px).

