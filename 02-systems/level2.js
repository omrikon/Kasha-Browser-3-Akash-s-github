// ============================================================================
// LEVEL2.JS - Mario-style athletic course (inspiration only)
// ============================================================================
// Authored left-to-right tile course for Level 2. Sections:
// intro → hills → tunnel → athletic → chase valley → hide pocket → finish.
// Do not copy Nintendo geometry or assets.
// ============================================================================

console.log('Loading level2.js...');

window.LEVEL2_WIDTH = 11200;
window.LEVEL2_HEIGHT = 2000;

/**
 * Build Level 2 into the current worldMap and spawn entities.
 * Assumes createLevel() already created worldMap and set levelWidth.
 */
function buildLevel2() {
    const map = window.worldMap;
    const TS = window.TILE_SIZE;
    const T = window.TILE_TYPE;
    const groundTileY = Math.floor(550 / TS); // ~34, surface top at 544px

    // ------------------------------------------------------------------
    // Tile helpers
    // ------------------------------------------------------------------
    function inBounds(tx, ty) {
        return tx >= 0 && ty >= 0 && tx < map.width && ty < map.height;
    }

    function setTile(tx, ty, type) {
        if (inBounds(tx, ty)) map.setTile(tx, ty, type);
    }

    function fillRect(tx, ty, w, h, type) {
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                setTile(tx + x, ty + y, type);
            }
        }
    }

    function carveRect(tx, ty, w, h) {
        fillRect(tx, ty, w, h, T.EMPTY);
    }

    /** Column of ground from surfaceY down with grass/dirt/stone layers */
    function groundColumn(tx, surfaceY, depth) {
        for (let d = 0; d < depth; d++) {
            const ty = surfaceY + d;
            let type;
            if (d === 0) type = T.GRASS;
            else if (d < 4) type = T.DIRT;
            else type = T.STONE;
            setTile(tx, ty, type);
        }
    }

    /** Flat ground strip from pixel x0 to x1 (exclusive) at a surface tile Y */
    function groundStrip(px0, px1, surfaceY, depth = 18) {
        const tx0 = Math.floor(px0 / TS);
        const tx1 = Math.ceil(px1 / TS);
        for (let tx = tx0; tx < tx1; tx++) {
            groundColumn(tx, surfaceY, depth);
        }
    }

    /** Stepped hill: surface rises then falls (tile units) */
    function rollingHill(px0, px1, baseSurfaceY, peakRise) {
        const tx0 = Math.floor(px0 / TS);
        const tx1 = Math.ceil(px1 / TS);
        const span = Math.max(1, tx1 - tx0);
        for (let i = 0; i < span; i++) {
            const t = i / span;
            // Smooth rise and fall
            const rise = Math.sin(t * Math.PI) * peakRise;
            const surfaceY = baseSurfaceY - Math.floor(rise);
            groundColumn(tx0 + i, surfaceY, 18 + Math.floor(rise));
        }
    }

    /** Floating platform block (grass top, dirt below) */
    function platformBlock(px, py, widthPx, heightTiles = 2) {
        const tx = Math.floor(px / TS);
        const ty = Math.floor(py / TS);
        const w = Math.ceil(widthPx / TS);
        for (let x = 0; x < w; x++) {
            for (let y = 0; y < heightTiles; y++) {
                setTile(tx + x, ty + y, y === 0 ? T.GRASS : T.DIRT);
            }
        }
    }

    /**
     * Tunnel / underpass: keep floor, add ceiling over a corridor.
     * floorSurfaceY = tile Y of ground surface; corridor height in tiles.
     */
    function tunnel(px0, px1, floorSurfaceY, corridorH, ceilingThickness = 3) {
        const tx0 = Math.floor(px0 / TS);
        const tx1 = Math.ceil(px1 / TS);
        const ceilingBottom = floorSurfaceY - corridorH;
        // Ensure ground under tunnel
        for (let tx = tx0; tx < tx1; tx++) {
            groundColumn(tx, floorSurfaceY, 18);
            // Ceiling block above corridor
            for (let t = 0; t < ceilingThickness; t++) {
                setTile(tx, ceilingBottom - 1 - t, T.STONE);
            }
            // Fill dirt above ceiling so it reads as a hill overpass
            for (let ty = 0; ty < ceilingBottom - ceilingThickness; ty++) {
                if (map.getTile(tx, ty) === T.EMPTY && ty > ceilingBottom - ceilingThickness - 8) {
                    setTile(tx, ty, T.DIRT);
                }
            }
            // Grass on top of the overpass mound
            const moundTop = ceilingBottom - ceilingThickness;
            if (moundTop > 0) {
                setTile(tx, moundTop, T.GRASS);
                // Clear air in corridor
                for (let cy = ceilingBottom; cy < floorSurfaceY; cy++) {
                    setTile(tx, cy, T.EMPTY);
                }
            }
        }
    }

    /** Staircase steps going up to the right */
    function stairUp(px, py, steps, stepW = 48, stepH = 16) {
        for (let i = 0; i < steps; i++) {
            platformBlock(px + i * stepW, py - i * stepH, stepW, 2);
        }
    }

    function surfacePixelY(surfaceTileY) {
        return surfaceTileY * TS;
    }

    function spawnOnSurface(surfaceTileY, height) {
        return surfacePixelY(surfaceTileY) - height;
    }

    /** Scan column for top solid surface pixel Y (or null) */
    function findTopSurface(px) {
        const tx = Math.floor(px / TS);
        for (let ty = 1; ty < map.height; ty++) {
            const tile = map.getTile(tx, ty);
            const above = map.getTile(tx, ty - 1);
            if (map.isSolidTile(tile) && above === T.EMPTY) {
                return ty * TS;
            }
        }
        return null;
    }

    function spawnAtX(px, entityHeight) {
        const surfaceY = findTopSurface(px);
        if (surfaceY === null) return spawnOnSurface(G, entityHeight);
        return surfaceY - entityHeight;
    }

    // ------------------------------------------------------------------
    // Course layout (Mario-style athletic — original geometry)
    // ------------------------------------------------------------------
    const G = groundTileY;

    // 1) SAFE INTRO (0–1200): flat ground, low ledges
    groundStrip(0, 1200, G);
    platformBlock(400, surfacePixelY(G) - 64, 96, 2);
    platformBlock(700, surfacePixelY(G) - 96, 80, 2);
    platformBlock(950, surfacePixelY(G) - 64, 96, 2);

    // 2) ROLLING HILLS (1200–2800)
    rollingHill(1200, 1800, G, 6);
    rollingHill(1800, 2400, G, 8);
    groundStrip(2400, 2800, G);

    // 3) TUNNEL / UNDERPASS (2800–3800) — LOS break for stalker ghost AI
    groundStrip(2800, 2900, G);
    tunnel(2900, 3600, G, 5, 4);
    groundStrip(3600, 3800, G);

    // 4) ATHLETIC MID (3800–5600) — gaps + floating platforms + stairs
    groundStrip(3800, 4100, G);
    // Gap 1 — pit floor below so a miss is recoverable / not endless fall
    groundStrip(4100, 4250, G + 10, 12);
    platformBlock(4140, surfacePixelY(G) - 48, 64, 2);
    groundStrip(4250, 4600, G);
    // Pit under floating chain (recoverable floor)
    groundStrip(4600, 5120, G + 10, 12);
    // Floating chain
    platformBlock(4680, surfacePixelY(G) - 80, 80, 2);
    platformBlock(4840, surfacePixelY(G) - 120, 80, 2);
    platformBlock(5000, surfacePixelY(G) - 80, 80, 2);
    groundStrip(5120, 5400, G);
    stairUp(5200, surfacePixelY(G) - 16, 5, 48, 16);
    groundStrip(5400, 5600, G - 5);

    // Bridge back to normal height
    groundStrip(5600, 5800, G);

    // 5) CHASE VALLEY (5800–7800) — open run for committed hunts
    groundStrip(5800, 7800, G);
    platformBlock(6200, surfacePixelY(G) - 72, 100, 2);
    platformBlock(6800, surfacePixelY(G) - 96, 100, 2);
    platformBlock(7200, surfacePixelY(G) - 64, 120, 2);

    // 6) HIDE POCKET (7800–9600) — alcove + high ledge
    groundStrip(7800, 8200, G);
    // Raised alcove wall with pocket behind
    fillRect(Math.floor(8200 / TS), G - 8, 4, 8, T.STONE);
    groundStrip(8200, 8600, G);
    // High hide ledge
    platformBlock(8400, surfacePixelY(G) - 128, 160, 2);
    // Second wall / pocket
    fillRect(Math.floor(8700 / TS), G - 6, 3, 6, T.STONE);
    groundStrip(8600, 9600, G);
    platformBlock(9000, surfacePixelY(G) - 80, 120, 2);
    // Small roofed hide niche
    tunnel(9200, 9450, G, 4, 3);

    // 7) FINISH PAD (9600–11200)
    groundStrip(9600, 11200, G);
    platformBlock(10000, surfacePixelY(G) - 48, 200, 2);
    platformBlock(10400, surfacePixelY(G) - 80, 160, 2);
    // Finish marker mound
    rollingHill(10600, 11000, G, 4);
    groundStrip(11000, 11200, G);

    // ------------------------------------------------------------------
    // Spawns (designed encounters)
    // ------------------------------------------------------------------
    const stalkerH = 28;
    const boxH = 40;
    const kashaH = 35;

    // Boxes — breadcrumbs (prefer ledges via explicit offsets when needed)
    const boxXs = [420, 720, 1600, 2100, 3200, 6400, 7000, 9050, 10050];
    boxXs.forEach((px) => {
        boxes.push(new Box(px, spawnAtX(px, boxH)));
    });
    // Boxes on designed floating ledges (above pits / hide shelf)
    boxes.push(new Box(4700, surfacePixelY(G) - 80 - boxH));
    boxes.push(new Box(5020, surfacePixelY(G) - 80 - boxH));
    boxes.push(new Box(8450, surfacePixelY(G) - 128 - boxH));

    // Silt Stalkers at section landmarks
    const stalkerXs = [
        1500,  // hills — first sightline
        2200,  // second hill crest
        3100,  // tunnel mouth
        4500,  // athletic mid
        6000,  // chase valley start
        7000,  // chase valley mid
        8500,  // near hide pocket
        9800   // before finish
    ];
    stalkerXs.forEach((px) => {
        if (typeof SiltStalker !== 'undefined') {
            enemies.push(new SiltStalker(px, spawnAtX(px, stalkerH)));
        }
    });

    // Sparse kashas
    const kashaXs = [600, 2500, 4000, 5500, 6600, 8800, 10200];
    kashaXs.forEach((px) => {
        kashas.push(new CassieDuck(px, spawnAtX(px, kashaH)));
    });

    console.log('Level 2 (Mario-style athletic course) built');
}

window.buildLevel2 = buildLevel2;
