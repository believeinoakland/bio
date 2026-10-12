# screens-intake — requirements

**Status** · New in T46 (T46-56; K657, K1043): a module built fresh, layer 11 after `screens-settings` (N897 (1), Bob's K2816; DEC-97, DEC-153, DEC-168; N821's upload surface; N714's screen side; N747). Drafted in `build/plan/draft-T46-interface.md` §2.4, worded here by BOB (P5). No ids move. Not yet met (T46).

**Size (P6).** Estimated 2,000–2,600 lines with comments, its own keyed sentences included, measured at its START (M-T46-1, K617).

## Public

### Purpose

Bringing material in and deciding what enters the record: capturing from an address, uploading a file, recording what a member saw (`capture`), vouching for or setting aside held captures (`held`), opening a file safely (`open-file`), and the doorbell's inbox (`inbox`). Pure: every read and act is an op, through `interface-shell`.

### Provides

**`SCREENS`, `SCREEN_WORDS`** (the screen contract, `interface-shell` R21; words, its R5)

**capture** (Add; three tabs, each its own; the registry's 6 acts, `capture` re-pointed to `captureupload`)
- **R1** "From an address": `acquire` with the address; `capturerequest` ("Ask for this later"); `monitor` ("Watch this address"). `acquire`'s refusals `BAD_LOCATOR`, `SOURCE_REFUSED`, `FETCH_FAILED`, `EMPTY` and `TOO_LARGE` are drawn each in its own sentence (as `setup-page` R10), any other by `interface-shell` R13. (N747; `control-plane` R58) An acquire whose answer carries `promoted` (an archive the door already promoted) is not promoted again by the screen; one without it is promoted as the screen's flow does. *(not yet met: T46)*
- **R2** "A file or photo" (`captureupload`, `capture` R86; `control-plane` R72): the member chooses a file (on a phone the camera may open, through the input's `accept` and `capture` attributes); the screen asks "How you got it" (four choices, none preselected), "Where and when" and "What it shows, in your own words", and composes `statement` from the three in that order, each with its label, at most 2,000 characters, refusing to send while any is empty and saying which; it sends `POST /api/?op=captureupload&statement=<s>&name=<the file's name>` with the file's bytes as the raw body and the session header. An answer with `existed: true` says the record already held the bytes; otherwise the screen says the capture waits in Held captures. `UPLOAD_NO_STATEMENT`, `EMPTY`, `TOO_LARGE` and `MEMBER_SESSION_REQUIRED` are drawn each in its own sentence. "Downloaded from a website?" offers the address tab instead. The photo reminder is drawn by its key (`photo.reminder`). *(not yet met: T46)*
- **R3** "What I saw or heard": `testify` with the member's words, where and when; `writinghelp` under the words field only while the assistant is reachable (`interface-shell` R20), helping word only what the member saw (DEC-153 (2)). *(not yet met: T46)*

**held** (Add › Held captures; the registry's 4 acts; DEC-97)
- **R4** Reads `heldcaptures` (each capture with its grade, age, project, and its eligibility: a capture not eligible for a batch drawn `mark.gap.refused` with its reason; a capture for a question this member may not see, `mark.gap.withheld`). Rows are picked (`interface-shell` R19); the hold strip offers `release` (vouch for the picked; friction by its weight, `interface-shell` R11), `heldsetaside` (one reason for all picked; the reason field has no writing help, K1841) and `heldrestore`. A row's thumbnail opens `open-file` for it. *(not yet met: T46)*

**open-file** (four states; the registry's 5 acts; DEC-168, K1888, K1892; N714's screen side)
- **R5** Reads `threatof`, `originalstate`, `scanstatus`, `scanfindings` and `verdictnotes` for the capture, and draws one state: low risk (`openoriginal`); high risk (`safeview` first, `deepercheck`, and `openwithwarning` only after the member ticks both confirmations, and never for a file a scanner flagged or the built-in scanner has not checked within the week, as `file-safety` answers it); held after a finding (`releasescanhold` with a reason, offered only as `file-safety` answers it may be). The safe view is drawn from `op=safeview`'s pages, marked `mark.origin.machine` as a safe copy derived from the original, with the sentence that the original, never the safe copy, is cited. *(not yet met: T46)*
- **R6** Opening the original fetches its bytes with the session header and hands them to the browser as a file (a `Blob` behind an object address, released once the download starts, `setup-page` R26's form); no link written carries a token. *(not yet met: T46)*

**inbox** (Queue › Inbox; the registry's 3 acts)
- **R7** Reads `inbox` (each knock: what was handed in, its note, the same-knocker mark, the identification ladder) and `inboxget` for one knock. Acts: `inboxpull` ("Move into the record"); `inboxresolve` to `discarded`, asking the reason first and sending it as `reason` (`setup-page` R11's rule; `RESOLVE_NO_REASON` drawn by its words, the knock left as it was); `sourcelink`. *(not yet met: T46)*

**Common**
- **R8** `interface-shell` R8–R13 hold on every screen; after an act, the screen re-reads what it changed and draws it. *(not yet met: T46)*

## Private

### Uses

- `interface-shell`: the kit `cs` and the screen contract (its R21).
- `setup-words`: `WORD_ROWS` keys.
- Through the plane: `acquisition` (R10), `capture` (R76–R81, R86), `capture-requests`, `monitoring`, `entities` and `provenance` (`testify`), `ratification` (`release`), `file-safety` (R6, R8, R27–R32 and the open ops), `doorbell`, `store-door`, `sources`, `wizard-scripts` (`writinghelp`), `control-plane` (R58's `promoted`, R72).
- Tests only: `op-declarations` (`OPS`).

### Invariants

- **R9** No act or read of these screens records, in the browser or in a request beyond the op's own, which member opened which file (K1888). *(not yet met: T46)*

### Satisfies

- Registry screens `capture`, `held`, `open-file`, `inbox` (DEC-139); N897 (1).
- DEC-97 (R4), DEC-153 (R3), DEC-168 and DEC-173 (R5, R6), K1852, K1888 (R9); N821 (a member's upload of a file she holds: R2); N714 (the open ops' screen: R5); N747 (R1).

### Suggestions

- "For which project" on the upload tab has no field in `capture` R86; T46 omits it (`draft-T46-interface.md` §7 T4 (a)).
- The camera's photo date and place (EXIF) are read in the browser only to pre-fill "Where and when", never sent apart from the bytes.
- `mark.gap.refused.means` is drawn from this module's own row (`interface-shell` R5: it names Civicsmith bare).
