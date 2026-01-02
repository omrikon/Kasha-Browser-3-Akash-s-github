# Coding Rules - Kasha Browser Game

## 🚫 ABSOLUTE RULE: File Size Limit

### **NO FILE SHALL EXCEED 2000 LINES OF CODE**

This is a **hard limit** - if any file approaches or exceeds 2000 lines, it **MUST** be split into smaller modules.

## Why This Rule Exists

1. **Maintainability** - Smaller files are easier to understand and modify
2. **Collaboration** - Easier for non-coders to navigate and understand
3. **Debugging** - Problems are easier to locate in smaller files
4. **Future Expansion** - Modular code makes adding features easier
5. **Code Quality** - Forces better organization and separation of concerns

## Current File Status

All files are currently under the 2000 line limit:
- ✅ Largest file: `drawing.js` (~1175 lines)
- ✅ All other files: Well under 1000 lines

## What To Do If a File Gets Too Large

### Step 1: Identify the Problem
- Check file size: `wc -l filename.js`
- If approaching 1800+ lines, start planning to split

### Step 2: Split the File
- Identify logical sections (functions, classes, features)
- Create new files for each section
- Update imports/loading order in `index.html`

### Step 3: Examples of How to Split

**If `drawing.js` gets too large:**
- Split into: `drawing-ui.js`, `drawing-game.js`, `drawing-effects.js`

**If `player.js` gets too large:**
- Split into: `player-movement.js`, `player-combat.js`, `player-rendering.js`

**If `level.js` gets too large:**
- Split into: `level-creation.js`, `level-management.js`, `level-utilities.js`

## Enforcement

### Manual Check
Run this command to check all file sizes:
```bash
find . -name "*.js" -exec wc -l {} + | sort -rn
```

### Before Committing
Always verify no file exceeds 2000 lines before making major changes.

## File Organization Strategy

Files should be organized by:
1. **Single Responsibility** - Each file does one thing well
2. **Logical Grouping** - Related functions/classes together
3. **Size Management** - Keep files focused and small

## Folder Structure Helps

The numbered folder structure (01-core, 02-systems, etc.) helps enforce this:
- Each folder has a specific purpose
- Files within folders are naturally smaller
- Easy to see where new code should go

## Remember

**2000 lines = MAXIMUM, not a target!**

Aim for much smaller files (200-800 lines is ideal). Only approach 2000 lines if absolutely necessary, and even then, consider splitting further.

