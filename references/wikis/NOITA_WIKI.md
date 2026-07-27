# Noita Wiki + Dev Talks (local archive)

**Status:** Ready — full wiki XML + images, curated clusters, both talks with transcripts  
**Use:** Reference / inspiration ONLY — do not copy copyrighted material into the game.

Wiki text/graphics on noita.wiki.gg are generally **CC BY-NC-SA 3.0**. Noita game IP remains with **Nolla Games Oy**.

## Where the files are

Local path (large; gitignored):

`references/wikis/noita-wiki-archive/`

Open **`noita-wiki-archive/START_HERE.md`** first (dumb-agent router).

| Item | What it is |
|------|------------|
| `START_HERE.md` | Read order, cluster map, keyword cheat sheet |
| `01-talks/` | Petri Purho talks: video + transcript + NOTES |
| `02-physics-and-simulation/` | Cell types, density, fire, explosions, etc. |
| `03-materials/` | Materials overview + property tables + examples |
| `04-reactions/` | Alchemy / reaction docs + rendered tables |
| `05-modding-docs/` | materials.xml-style modding docs |
| `06-supplemental/` | 80.lv interview, reaction CSV, extra notes |
| `00-raw-dump/` | Full wiki XML (current revisions) + images |
| `scripts/` | Re-download helpers (`api_dump.py`, `api_dump_resume.py`) |

## Talks

| Talk | Path | Notes |
|------|------|-------|
| GDC 2019 — Exploring the Tech and Design of Noita (~31m) | `01-talks/gdc-2019-exploring-tech/` | Prefer this for sim tech. Transcript from [GDC-transcript](https://github.com/dklassic/GDC-transcript). Video: https://www.youtube.com/watch?v=prXuyMCgbTc |
| IEEE CoG 2021 — The Design History of Noita (~57m) | `01-talks/ieee-cog-2021-design-history/` | Design history. Video: https://video.itu.dk/video/71884487/the-design-history-of-noita |

## If you are building falling sand — read order

1. `01-talks/gdc-2019-exploring-tech/NOTES.md` + `KEY_QUOTES.md` + `transcript.md`
2. `06-supplemental/80lv-falling-sand-interview.md`
3. `02-physics-and-simulation/` (start with `Cell_types_and_static_sand.md`)
4. `03-materials/` then `04-reactions/`
5. `05-modding-docs/Modding_Making_a_custom_material.md`
6. IEEE talk for history context
7. `00-raw-dump/` only if needed

## Official / upstream sources

- Wiki: https://noita.wiki.gg/
- GDC talk: https://www.youtube.com/watch?v=prXuyMCgbTc
- IEEE CoG talk: https://video.itu.dk/video/71884487/the-design-history-of-noita
- 80.lv interview: https://80.lv/articles/noita-a-game-based-on-falling-sand-simulation
- Reactions sheet: https://docs.google.com/spreadsheets/d/1MVcKCzQ9-LL6JNh1sle36MNrKLXsgDdAyKw39NxVl-Q/edit

## Dump method note

`wikiteam3` Special:Export hits **Cloudflare 403** on this wiki. The archive uses a **MediaWiki API** dump instead (`scripts/api_dump.py` / `api_dump_resume.py`): current page wikitext XML + `allimages` binaries. File: description pages are skipped in XML (binaries still downloaded).

## Re-download

Requires local venv (gitignored): `references/wikis/.venv-archive/`

```bash
cd "/path/to/Kasha Browser 3"
python3 -m venv references/wikis/.venv-archive
source references/wikis/.venv-archive/bin/activate
pip install wikiteam3 yt-dlp requests faster-whisper

# Full wiki (API dump)
python references/wikis/noita-wiki-archive/scripts/api_dump.py
# Or resume XML+images from existing all-titles.txt:
python references/wikis/noita-wiki-archive/scripts/api_dump_resume.py

# GDC video
yt-dlp -f "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/best" --merge-output-format mp4 \
  -o "references/wikis/noita-wiki-archive/01-talks/gdc-2019-exploring-tech/video.%(ext)s" \
  "https://www.youtube.com/watch?v=prXuyMCgbTc"

# IEEE video
curl -L -o "references/wikis/noita-wiki-archive/01-talks/ieee-cog-2021-design-history/video.mp4" \
  "https://video.itu.dk/64968558/71884487/f01f75dc68c0080b0fc5a5322bc69a21/video_1080p/the-design-history-of-noita-10-video.mp4"
```

GDC transcript raw sources:

- https://raw.githubusercontent.com/dklassic/GDC-transcript/main/static/src/transcript/prXuyMCgbTc.txt
- https://raw.githubusercontent.com/dklassic/GDC-transcript/main/static/src/subtitle/prXuyMCgbTc.srt
