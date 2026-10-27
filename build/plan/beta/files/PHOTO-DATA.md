# DEC-460: the photo data kept as data and left out of the safe picture

**Status** · READY (FILES #1, F13, 2026-10-27). **One source:** PLANNING's `lines-A3-A4-source-picture.md` on `lane/planning` (§ A4: the two tables "Kept as data" and "Dropped", and lines A4-R2 and A4-R3). This file no longer carries a table of its own; F12's first table is withdrawn. It records only (1) what the screens read, (2) the differences from F12 and how each is settled, and (3) what is still open.

## 1. What the screens read
- **Kept as data** ("the file says"): the fields of A4-R2's closed list, each `{value, from: "the file", checked: false}`, shown beside the safe picture. Plain text only, capped, never markup.
- **Left out** (`{what}` in "Left out of the safe picture: {what}"): A4-R3's `left_out`, a closed set of kinds: `thumbnail`, `maker_note`, `profile`, `extra_picture`, `after_end`, `xmp`, `credentials`, `other_metadata`, `unreadable`, each with count and bytes. The screen's plain words for each kind are UX-DESIGN's, one per kind; the list above is their key set.

## 2. Differences from F12, settled to A4's table
| point | F12 said | A4's table | settled |
|---|---|---|---|
| camera and exposure fields | make, model, software only | adds lens, exposure, ISO, focal length, flash | A4's (a superset) |
| the photographer's text | one caption | artist, copyright, description, comments, keywords, byline, credit, place name, PNG text | A4's |
| colour profile | pixels converted to sRGB | profile dropped; picture shown in standard colours; profile name and colour space beside it (Q-A3A4-4, Bob's/BOB's) | A4's; F12's conversion is option C of Q-A3A4-4, not assumed |
| serial numbers and owner name | read into the record, not shown by default | in `file_says`, depending on L7 | **K5471 (BOB)**: read into the record, not shown by default; A4-R2 is to say so for these fields |
| place | place name; exact figures one step away | latitude, longitude, altitude, direction, time, datum, range-checked (L8) | A4's fields; **K5471**: place name shown, exact coordinates one step away |
| face regions, embedded audio, motion-photo video, paths and edit history | listed separately | covered by `xmp`, `after_end` (a motion photo's video follows the image), `other_metadata` | A4's kinds |
| the "saved by" software | its own row | the software field (and XMP properties named in the kept list) | A4's |

## 3. Open (not FILES')
- **Published edition shows place?** On QUESTIONS.html to Bob; recommendation: the author chooses, off by default.
- Q-A3A4-4 and Q-A3A4-5 are PLANNING's to bring; this lane's drafts follow whatever is ruled.
