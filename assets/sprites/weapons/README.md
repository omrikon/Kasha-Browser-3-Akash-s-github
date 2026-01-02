# Weapon Sprites

Weapon sprites for different weapon types.

## Current Status

⚠️ **Weapons are currently drawn programmatically** (as shapes/lines in code, not using sprites).

The weapons are defined in `01-core/config.js` with properties like:
- Sword (silver, 35px range)
- Axe (brown, 40px range)
- Staff (purple, 45px range)
- Dagger (gray, 25px range)

## Future: Adding Weapon Sprites

If you want to use sprite images instead of programmatic drawing:

1. **Create sprite sheets** for each weapon type:
   - `sword/sword_sprite_sheet.png` - Sword sprites (idle, swing frames)
   - `axe/axe_sprite_sheet.png` - Axe sprites
   - `staff/staff_sprite_sheet.png` - Staff sprites
   - `dagger/dagger_sprite_sheet.png` - Dagger sprites

2. **Update the drawing code** in `03-classes/player.js` around line 1893 where weapons are drawn

3. **Add animation frames** for:
   - Idle/held state
   - Windup (charging attack)
   - Attack swing
   - Recovery

## Sprite Guidelines

- Frame size: Match weapon size (typically 16-48px depending on weapon)
- Include frames for: idle, windup, attack, recovery
- Format: PNG with transparency
- Layout: Horizontal sprite sheet

