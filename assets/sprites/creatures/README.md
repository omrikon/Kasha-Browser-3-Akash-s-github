# Creature Sprites

Sprites for all creatures in the game (enemies and catchable creatures).

## Current Creatures

- **enemy/** - Enemy creature sprites
  - Currently drawn as simple colored rectangles
  - Add sprite sheets here for better visuals

- **cassieduck/** - Cassieduck creature sprites
  - Currently drawn programmatically (yellow duck shape)
  - Add sprite sheets here for animations

## Adding New Creature Sprites

1. **Create a folder** for your creature: `creatures/[creature_name]/`

2. **Add sprite sheets:**
   - `idle_sprite_sheet.png` - Idle/walking animation
   - `attack_sprite_sheet.png` - Attack animation (if applicable)
   - `hurt_sprite_sheet.png` - Taking damage
   - `death_sprite_sheet.png` - Death animation

3. **Update the creature class** in `04-creatures/[creature_name].js` to load and use the sprites

## Sprite Guidelines

- Frame size: Match creature size (typically 30-40px)
- Include animations for: idle, walk, attack, hurt, death
- Format: PNG with transparency
- Layout: Horizontal sprite sheet

## Example Structure

```
creatures/
  enemy/
    idle_sprite_sheet.png
    attack_sprite_sheet.png
  cassieduck/
    waddle_sprite_sheet.png
    caught_sprite_sheet.png
  your_new_creature/
    idle_sprite_sheet.png
    ...
```

