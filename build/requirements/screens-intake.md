# screens-intake — requirements

**Status** · New in T46 (T46-56; K657, K1043): a module built fresh, layer 11 after `screens-settings` (N897 (1), Bob's K2816; DEC-97, DEC-153, DEC-168; N821's upload surface; N714's screen side; N747). Drafted in `build/plan/draft-T46-interface.md` §2.4, worded here by BOB (P5). No ids move. Not yet met (T46). Last changed T47 (T47-59: R10 new, the writing-help draft filled into its field and a knock's card, N987; R11 new, a held row's grade and thumbnail, N979; R12 new, the knock's source read with no typed ids, N980; R13 new, the set-aside list, N969; R14 new, watching from Add through `monitorset` and "Ask for this later" as a member's own request, N969; R15 new, the `archive` screen, N688's screen part); marked not yet met (T47).

**Size (P6).** Estimated 2,000–2,600 lines with comments, its own keyed sentences included, measured at its START (M-T46-1, K617).

## Public

### Purpose

Bringing material in and deciding what enters the record: capturing from an address, uploading a file, recording what a member saw (`capture`), vouching for or setting aside held captures and restoring set-aside ones (`held`), the files an archive held (`archive`, since T47), opening a file safely (`open-file`), and the doorbell's inbox (`inbox`). Pure: every read and act is an op, through `interface-shell`.

### Provides

**`SCREENS`, `SCREEN_WORDS`** (the screen contract, `interface-shell` R21; words, its R5)

**capture** (Add; three tabs, each its own; the registry's 6 acts, `capture` re-pointed to `captureupload`)
- **R1** "From an address": `acquire` with the address; `capturerequest` ("Ask for this later"); `monitor` ("Watch this address"). `acquire`'s refusals `BAD_LOCATOR`, `SOURCE_REFUSED`, `FETCH_FAILED`, `EMPTY` and `TOO_LARGE` are drawn each in its own sentence (as `setup-page` R10), any other by `interface-shell` R13. (N747; `control-plane` R58) An acquire whose answer carries `promoted` (an archive the door already promoted) is not promoted again by the screen; one without it is promoted as the screen's flow does.
- **R2** "A file or photo" (`captureupload`, `capture` R86; `control-plane` R72): the member chooses a file (on a phone the camera may open, through the input's `accept` and `capture` attributes); the screen asks "How you got it" (four choices, none preselected), "Where and when" and "What it shows, in your own words", and composes `statement` from the three in that order, each with its label, at most 2,000 characters, refusing to send while any is empty and saying which; it sends `POST /api/?op=captureupload&statement=<s>&name=<the file's name>` with the file's bytes as the raw body and the session header. An answer with `existed: true` says the record already held the bytes; otherwise the screen says the capture waits in Held captures. `UPLOAD_NO_STATEMENT`, `EMPTY`, `TOO_LARGE` and `MEMBER_SESSION_REQUIRED` are drawn each in its own sentence. "Downloaded from a website?" offers the address tab instead. The photo reminder is drawn by its key (`photo.reminder`).
- **R3** "What I saw or heard": `testify` with the member's words, where and when; `writinghelp` under the words field only while the assistant is reachable (`interface-shell` R20), helping word only what the member saw (DEC-153 (2)).

**held** (Add › Held captures; the registry's 4 acts; DEC-97)
- **R4** Reads `heldcaptures` (each capture with its grade, age, project, and its eligibility: a capture not eligible for a batch drawn `mark.gap.refused` with its reason; a capture for a question this member may not see, `mark.gap.withheld`). Rows are picked (`interface-shell` R19); the hold strip offers `release` (vouch for the picked; friction by its weight, `interface-shell` R11), `heldsetaside` (one reason for all picked; the reason field has no writing help, K1841) and `heldrestore`. A row's thumbnail opens `open-file` for it.

**open-file** (four states; the registry's 5 acts; DEC-168, K1888, K1892; N714's screen side)
- **R5** Reads `threatof`, `originalstate`, `scanstatus`, `scanfindings` and `verdictnotes` for the capture, and draws one state: low risk (`openoriginal`); high risk (`safeview` first, `deepercheck`, and `openwithwarning` only after the member ticks both confirmations, and never for a file a scanner flagged or the built-in scanner has not checked within the week, as `file-safety` answers it); held after a finding (`releasescanhold` with a reason, offered only as `file-safety` answers it may be). The safe view is drawn from `op=safeview`'s pages, marked `mark.origin.machine` as a safe copy derived from the original, with the sentence that the original, never the safe copy, is cited.
- **R6** Opening the original fetches its bytes with the session header and hands them to the browser as a file (a `Blob` behind an object address, released once the download starts, `setup-page` R26's form); no link written carries a token.

**inbox** (Queue › Inbox; the registry's 3 acts)
- **R7** Reads `inbox` (each knock: what was handed in, its note, the same-knocker mark, the identification ladder) and `inboxget` for one knock. Acts: `inboxpull` ("Move into the record"); `inboxresolve` to `discarded`, asking the reason first and sending it as `reason` (`setup-page` R11's rule; `RESOLVE_NO_REASON` drawn by its words, the knock left as it was); `sourcelink`.

**Common**
- **R8** `interface-shell` R8–R13 hold on every screen; after an act, the screen re-reads what it changed and draws it.

**T47: drafts filled, held rows graded, the source read, the set-aside list, watching and asking later, the archive** (T47)
- **R10** (T47; N987; K3014; amends R3, R7; `interface-shell` R27) The writing-help draft (R3) is filled into the words field it asks for, by `cs.fill`, labelled "Draft · the assistant's, asked by <handle>" (with `ai.label.untested` where its answer carries `untested`, `wizard-scripts` R34), and kept only by the member's own `testify`; no field of a new id is drawn for it. A knock named on `inbox` is a reference of the kind `knock`, with its card.
- **R11** (T47; N979; amends R4; `capture` R77) `held` draws each row's grade as one mark from the row's `capture.grade` (`mark.scale.capture.*`; a received or authored capture as `capture` states it, never as measured), and its thumbnail opens `open-file` for `capture.sha256`; a row whose `capture` is null draws `state.undetermined` for its grade and no thumbnail.
- **R12** (T47; N980; amends R7; `op-declarations` R56; `sources` R1, R9) `inbox` reads the source of a pulled knock through `sourceof` (by the knock's capture digest) and its rung through `sourcerung`, and draws the identification ladder at that rung ("Same knocker" when the secret proved it). `sourcelink` names that source and, as `to`, a source chosen among those the group's earlier knocks read through `sourceof` (the same-knocker mark's source first), with the member's evidence: no source id is typed.
- **R13** (T47; N969; amends R4; `capture` R88) `held` has two lists: "Held" (`heldcaptures`, `state` absent) and "Set aside" (`heldcaptures` with `state: "set_aside"`), the latter's rows each naming who set the document aside, when, and their reason as `set_aside` answers it, offering `heldrestore` with a reason (in its panel, and in the hold strip for picked rows), so a document set aside in an earlier visit is restored.
- **R14** (T47; N969; amends R1; `monitoring` R74, `capture-requests` R56) On "From an address": "Watch this address" first sends `monitorset` with `enabled: true` (and the frequency chosen, a word of `MONITOR_FREQ`) for the document the address was captured into (the `acquire` answer's bundle, or the held document for that address), then `monitor` for its first check; a `NOT_MONITORED`, `NO_LOCATOR` or `MONITOR_SET_REFUSED` refusal is drawn by `interface-shell` R13. "Ask for this later" sends `capturerequest` with the address and no `run`, as the member's own request (`capture-requests` R56), and draws what it answers: with `drains: false` the sentence that the request waits until the group's Civicsmith captures unattended.
- **R15** (T47; N688, its screen part; DEC-167; K1844, K1940) **archive** (Add › Held captures › Archive; the registry's 4 acts). Reads `archivelist` for the archive (`acquisition` R41: its grade, its summary, and each entry's name, folder, size and state, every name as the archive states it, never trusted as a place) and `gradenote`. An archive that opened draws its entries as rows (`interface-shell` R19): `filed` rows, held for review beside it at the archive's grade, can be picked; `already_held` rows name the earlier capture they repeat; `not_filed` rows name their reason (`mark.gap.refused`); folders are listed with their files. The hold strip offers `release` and `heldsetaside` (one reason for all picked) and `archivelist` "Show only those not filed". An archive refused whole draws its refusal by its row's words and that nothing in it is filed, with `archivelist` to see what it lists. A file of the archive opens `open-file`.

#### T47's L11 fold (K3100)

- **R16** (DEC-200 (2); amends R1, R14) On "From an address", "Watch this address" sends `monitorset` (`enabled: true`, the frequency chosen) and "Check it now" sends `monitor`, two acts. Test: each act alone.

## Private

### Uses

- `interface-shell`: the kit `cs` and the screen contract (its R21).
- `setup-words`: `WORD_ROWS` keys.
- `wizard-scripts`: `SCREEN_REGISTRY` (its R13), in tests only (K3014).
- (T47) Through the plane: `acquisition` (`archivelist`, R41; R15), `capture` (R77's `capture`, R88; R11, R13), `monitoring` (`monitorset`, R74; R14), `capture-requests` (R56; R14), `sources` (`sourceof`, `sourcerung`; R12), `wizard-scripts` (R34's label; R10).
- Through the plane: `acquisition` (R10), `capture` (R76–R81, R86), `capture-requests`, `monitoring`, `entities` and `provenance` (`testify`), `ratification` (`release`), `file-safety` (R6, R8, R27–R32 and the open ops), `doorbell`, `store-door`, `sources`, `wizard-scripts` (`writinghelp`), `control-plane` (R58's `promoted`, R72).
- Tests only: `op-declarations` (`OPS`).

### Invariants

- **R9** No act or read of these screens records, in the browser or in a request beyond the op's own, which member opened which file (K1888).

### Satisfies

- Registry screens `capture`, `held`, `open-file`, `inbox` (DEC-139); N897 (1). (T47) `archive` (`registry.json` at `a0fab7abf0`; DEC-167, N688): R15; N969 (R13, R14), N979 (R11), N980 (R12), N987 (R10).
- DEC-97 (R4), DEC-153 (R3), DEC-168 and DEC-173 (R5, R6), K1852, K1888 (R9); N821 (a member's upload of a file she holds: R2); N714 (the open ops' screen: R5); N747 (R1).

### Suggestions

- "For which project" on the upload tab has no field in `capture` R86; T46 omits it (`draft-T46-interface.md` §7 T4 (a)).
- The camera's photo date and place (EXIF) are read in the browser only to pre-fill "Where and when", never sent apart from the bytes.
- `mark.gap.refused.means` is drawn from this module's own row (`interface-shell` R5: it names Civicsmith bare).
