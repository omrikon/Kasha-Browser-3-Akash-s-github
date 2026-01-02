# Sprites Directory

This folder contains all sprite images (character animations, weapons, creatures, effects).

## 📁 Structure

### 📁 player/
Player character sprites organized by animation state.

**Current sprites loaded:**
- ✅ `idle/idle sprite sheet.png` - Idle animation (2 frames)
- ✅ `walk/walk_sprite_sheet.png` - Walking animation (8 frames)

**Future sprites to add:**
- `jump/jump_sprite_sheet.png` - Jumping animation
- `fall/fall_sprite_sheet.png` - Falling animation
- `land/land_sprite_sheet.png` - Landing animation
- `groundslam_start/groundslam_start_sprite_sheet.png` - Ground slam charge
- `groundslam_impact/groundslam_impact_sprite_sheet.png` - Ground slam impact
- `throw/throw_sprite_sheet.png` - Throwing animation
- `aim/aim_sprite_sheet.png` - Aiming animation
- `pickup/pickup_sprite_sheet.png` - Picking up items
- `hurt/hurt_sprite_sheet.png` - Taking damage

**Sprite Sheet Format:**
- All frames in one horizontal image
- Each frame: 64x64 pixels
- Name format: `[state]_sprite_sheet.png`

### 📁 weapons/
Weapon sprites (currently weapons are drawn programmatically, but you can add sprites here).

**Folders:**
- `sword/` - Sword weapon sprites
- `axe/` - Axe weapon sprites
- `staff/` - Staff weapon sprites
- `dagger/` - Dagger weapon sprites

**Note:** Weapons are currently drawn as shapes in code. To use sprites instead, add images here and update the drawing code in `03-classes/player.js`.

### 📁 creatures/
Creature sprites (enemies and catchable creatures).

**Folders:**
- `enemy/` - Enemy creature sprites
- `cassieduck/` - Cassieduck creature sprites
- (Add more creature folders as you create them)

### 📁 effects/
Visual effect sprites.

**Folders:**
- `groundslam/` - Ground slam effect sprites
- `breaking/` - Platform breaking effect sprites
- `particles/` - Particle effect sprites

## 📝 Adding New Sprites

1. **Player animations:** Add sprite sheet to the appropriate folder in `player/`
2. **Weapons:** Add to `weapons/[weapon_type]/`
3. **Creatures:** Add to `creatures/[creature_name]/`
4. **Effects:** Add to `effects/[effect_type]/`

## 🎨 Sprite Sheet Guidelines

- **Format:** PNG with transparency
- **Frame size:** 64x64 pixels (or consistent size)
- **Layout:** All frames in one horizontal image, left to right
- **Naming:** Use descriptive names like `walk_sprite_sheet.png`

