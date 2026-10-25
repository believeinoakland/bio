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

## The final pass's words and layout (K5148; diagnoses `walk-T51-final/diagnosis/diag2-*.md`)

- 04B OV-15 (`diag2-04.md` §9): "secret phrase" (29 rows, e.g. `screen.doorbell.secret.label`), "Confidential" (`screen.action.confidential`, `.scope.confidential`, `.scope.open`) and British "recognised" (`screen.doorbell.consent.refused.secret`) against the overlay's own rule (check 15).
- 04B R146 (`diag2-04.md` §6): an authority task's Queue row carries no basis (the task grammar keeps none): what the row says.
- 03 R20 (`diag2-020305.md` §3): step 1 "Name your team" has no sentence (screens-daily R40 gives none): one, if wanted.
- 03 R20 (§2): the heading over the lone "Help for my own situation" door, now none (K5148).
- 07 R60 (`diag2-07.md` §1): "Record an event" now records the form's date as the event's dated fact (K5148): the form's words.
- 07 R158 (§9): Explore's picker offers the viewer's documents by title, newest first (K5148): its layout.
- 08 C3, C8 (`diag2-08.md`): the relate form's label (no "content id"; a choice among the standard's passages) and the incoming-direction words for a related law ("Referred to by", "Implemented by", ...; and `rel.interprets`, `applies`, `holds_invalid`).
- 08 C9: whether the Standard screen also offers `standardadoption` and `standardimpose` (with `bindsat`'s words); the issuer route to "binds" is fixed now (K5148).
- 08 C13: the glossary holds no law term (standard, in force, benchmark, discretion, writ, proceeding): screens-settings R59 names two groups; a third, if wanted, with its definitions.
- 08 C14: the records help page draws the profile's laws under "none is shown here" when a profile holds laws and no `records_help` (the first profile gains the block now, K5148).
- 08 OV4.1: a failed read says "This could not be read. Try again in a moment." with no reason.
- 10B C8: "Vouch for the 6 photos you captured" for documents (already `later-ux.md:19`).
- New member sentences written at their use this round (to review through the unreviewed list): people `PERSON_ITEM_NOT_HELD`, monitoring's `unconfirmed_removal`, `moved`, `refused` and the concealment sentence, calculations' `BINDING_UNREADABLE`, `ROW_ALREADY_WRITTEN`, the published page's unrated, no-bar and verification lines.
