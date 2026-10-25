# Fix round 10 of T51: words and layout for UX-DESIGN (one HANDOFF)

**Status** · For BOB to send in this round's one HANDOFF to UX-DESIGN (K5047, K5053 to K5057; R-WORDS, K3930, K4269). Each cause job writes a stand-in via `localize` in its own module, so nothing waits on this file; the rows replace the stand-ins. Source: `fix-round-10-T51.md` §1 and the placement files. None changes what a member may do or upload, so none is Bob's.

## Words (sentences a member reads)

| Module (job) | Cause | Key or item | What UX-DESIGN supplies |
|---|---|---|---|
| `screens-inquiry` | R1 | `refusal.NOTHING_TRANSCRIBED`, `refusal.PICTURE_NOT_LEGIBLE`, `refusal.PAGE_NOT_LEGIBLE`, `refusal.PASSWORD_REQUIRED`, `refusal.PAGE_KILLED_READER`, `refusal.STRUCTURE_OVER_BOUND` | six held sentences for a final reading refused for that reason (`refusal.ENCRYPTED` and `refusal.IMAGE_TOO_LARGE` exist); until then a stand-in, never the machine sentence |
| `screens-inquiry` | R2a | `screen.document.reading.toolarge` (held, `{size}`, `{limit}`; no code drew it before) | the unit word where the figure is rows or objects, and the exact byte count where two figures print alike after rounding |
| `screens-inquiry` | R4 | archive Document page: statement, member count, door to the archive screen | one sentence: this is an archive of N members, read member by member; no "Read it" |
| `screens-inquiry` | R35a | `screen.document.gradenote.head` for a document with no grade | a "not graded" heading in place of "Why {letter}?" |
| `screens-inquiry` | R37 | assumed-encoding sentence (key chosen by the module, `hasWord`-guarded) | one sentence naming the encoding, shown only when it was assumed |
| `screens-inquiry` | R38 | first-load statement and "N pictures kept, not read" (two keys chosen by the module) | the two sentences (acquisition R119; capture-sources exports the first-load statement) |
| `screens-inquiry` | R17b | part-kind line for a `doc-part` leg (key chosen by the module) | the wording that places a cited passage in a footnote, endnote or header, e.g. "In the footnote" |
| `screens-inquiry` | R9 (following entry) | recovery-notes sentence: `xref_reconstructed`, `pages_missing` ("8 of 30") | one sentence for each note once reading-pipeline carries it on the reading |
| `screens-intake` | R35b | Open-file sentence for an unread image type (new key) | one sentence: the type is not read, and the scanner's "Clean" does not stand for its structure |
| `screens-intake` | R14 | check line beside "Clean" (new key) | "its inside could not be checked" for an encrypted file, a macro container, a format not checked |
| `screens-intake` | R33 | paging control, "Mine" and "Everyone's" filter, replacing the dead-end `screen.held.more` | labels and layout of the Held list (DEC-97 clause 1: per member and per project) |
| `screens-daily` | R17a | part-kind word on a Find-in term item (key chosen by the module) | the word for a footnote, endnote, header or hidden-slide hit |
| `reading-pipeline` | R2b | `reading-pipeline.index.too_large`, `.structure_over_bound` (module code rows) | the sentence per unit: bytes, rows, objects (the count and the limit) |
| `reading-pipeline` | R3 | `reading-pipeline.index.unsupported_legacy_word` (held and right) | the "it did not look like one" clause for a file declared Word whose bytes are not |
| `ocr-worker` | R7 | wording for a picture or page stated sideways (`PICTURE_NOT_LEGIBLE` says "too unclear") | the sentence that says the page was turned or could not be turned upright |
| `calculations` | R19 | refusal for a tied delimiter (key chosen by the module) | one sentence: the table's delimiter could not be told, so it is not read as a table |
| `office-readers` | R21(b) | refusal for a workbook past 16,384 columns (R6's marker with `metric:"columns"`, key chosen by the module) | one sentence with the count and the limit, as the CSV's |
| `inquiry` | R30b (K5077) | `NO_PARTITION`'s detail ("Pass an EMPTY array to remove the grouping") | an empty list now saves a partition with no ground (every supporting leg necessary, DEC-32 clause 4), not a removal: the sentence that says so |
| `plane` R24 (design gap, K5078) | `screen.objective.purpose`, `screen.about-knocker.purpose` | the registry at `c752a602da` names screens `objective` and `about-knocker` whose purpose sentence `words.json` lacks: the two sentences |

- **Rows the round's screens jobs now read by key (K5090; SCREENS-INQUIRY #27 J39, SCREENS-INTAKE #25 J53).** A drawn-screen module holds no English (words check `marker`; screens-intake R26, K4640): until each row is held the page draws the nearest held row or the figures alone. screens-inquiry: `refusal.NOTHING_TRANSCRIBED`, `.PICTURE_NOT_LEGIBLE`, `.PAGE_NOT_LEGIBLE`, `.PASSWORD_REQUIRED`, `.PAGE_KILLED_READER`, `.STRUCTURE_OVER_BOUND`; `screen.document.reading.unit.bytes|rows|columns|cells|objects` ({n}); `screen.document.archive.says` ({n}); `screen.document.gradenote.head.ungraded`; `screen.document.encoding.assumed` ({name}); `screen.document.supporting.pictures`, `.one` ({count}, {size}); `screen.question.leg.part` ({ref}). screens-intake: `screen.open-file.check.inside`, `screen.open-file.image.unread`, `screen.held.who`, `.who.mine`, `.who.all`, `.next`, `.back`.

## Layout and scope

| Module | Cause | Item | What UX-DESIGN supplies |
|---|---|---|---|
| `interface-assets` | R32 | the sign dialog's scrim (`.mk-scrim`, `docs/development/ux-substrate/screens/page.src.html:299`) | a scroll and height rule: the dialog never exceeds the window and the last button stays reachable at 1280x900 and 390x844 with 16 statements; interface-assets regenerates `shell.css` after your reply is merged |
| `screens-inquiry` | R13a | the Document page's connect and contradict pickers (R99, R127) | scope and layout: project grouping, a search box, paging, members shown under their archive; the same documents offered (no limit changes, so not Bob's); needs a live reading first of why other Document pages showed no members; no job until then |
| `screens-intake` | R33 | the Held list | paging and "Mine" first, "Everyone's" as a filter (see words) |

## Not words (for the record)

- R5, R36: the keys exist (`reading-pipeline.index.unsupported_gif`, `_tiff`; the stored reading's own line is chosen by the module). R27a (option A) changes no sentence. R34's first-load `session.ended` sentence exists. R39: no sentence. R25 and R28a are not defects.
- The Chromium test for R32 (1280x900 and 390x844) belongs to `interface-assets` once the rule is merged.
