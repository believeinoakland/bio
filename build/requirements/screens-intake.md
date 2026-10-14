# screens-intake — requirements

**Status** · New in T46 (T46-56; K657, K1043): a module built fresh, layer 11 after `screens-settings` (N897 (1), Bob's K2816; DEC-97, DEC-153, DEC-168; N821's upload surface; N714's screen side; N747). Drafted in `build/plan/draft-T46-interface.md` §2.4, worded here by BOB (P5). No ids move. Not yet met (T46). Last changed T47 (T47-59: R10 new, the writing-help draft filled into its field and a knock's card, N987; R11 new, a held row's grade and thumbnail, N979; R12 new, the knock's source read with no typed ids, N980; R13 new, the set-aside list, N969; R14 new, watching from Add through `monitorset` and "Ask for this later" as a member's own request, N969; R15 new, the `archive` screen, N688's screen part); marked not yet met (T47). Last changed T48 (K3254, the L11 design fold of WALK-084 #2, K3250: R17 new, the common line; R18 new, the tab bar and act row; R19 new, no empty Set aside, the `heldcaptures` stall traced; R20 new, bare `archive` and `open-file`); marked not yet met (T48). Last changed T49 (T49-23: R21–R25 new; K3334); marked not yet met (T49).

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

#### T48 (T48-85)

**The design walk folded** (T48; WALK-084 #2; K3250, K3254)
- **R17** (T48; K3250, K3254 (1), (5); walk C1, C4, C5; DEC-219 (3); K3052; amends R8) The common line, on `capture`, `held`, `archive`, `open-file` and `inbox`: every element these screens draw uses a class that a served stylesheet defines (`interface-shell` R56).
  - Where the design draws the element, the screen uses the design's own class: an `mk-*` class as `shell.css` carries it, and a `cs-*` class the design spells `mk-*` (`cs-frontgrid`, `cs-signin`, `cs-fronthead`, `cs-flogo`, `cs-facts`, `cs-note`, `cs-sub`, `cs-small`, `cs-steps`, `cs-passage`, `cs-strengthbox`, `cs-gapblock`, `cs-pickc`, `cs-areas`, `cs-table`) is renamed to the design's spelling. A class the design does not draw is mapped to the kit's or a design class; only where none fits does `interface-shell` carry its style (its R56), with an ASK to UX-DESIGN to draw it (K3254 (1)).
  - Every labelled field is drawn with `cs.field`. No screen draws `cs-form` or a bare `<label>` with `.help`.
  - A section, tray, list, block or reading that holds nothing is not drawn. No count, reading or "finished by" is drawn at zero. A screen with nothing at all to show draws its one designed empty state, which names the first step. (DEC-219 (3) applied to every screen is BOB's reading of K3052, K3254 (5); the designed screen-level empty states are kept.)
  - A read that failed is still drawn as failed (`interface-shell` R10).

  Test: the module's real `SCREENS` compose under `interface-shell` R56, and each screen drawn over an empty fixture shows no empty section and no zero. Control: a failed read is drawn `state.failed`.
- **R18** (T48; K3250, K3254; walk row 12; amends R1, R14, R16) `capture`'s three tabs are the design's underlined tab bar (`mk-tabs2`), and its acts are one act row (`mk-acts`). "Watch this address" and "Check it now" join that row once the address has a document. No "Watching for changes" section is drawn before anything is captured. Test: before a capture, no watch section. Control: after one, the two acts are in the act row.
- **R19** (T48; K3250, K3254; walk row 14; amends R4, R13) `held` draws "Set aside" only when it holds something, and every read leaves "still loading" by answering or failing (`interface-shell` R10). The unfiltered `heldcaptures` read that stalled on `biosmoke7` is traced at START to its cause and fixed where the cause lies. Test: an empty set-aside list is not drawn. Control: a read that never answers is drawn failed at the shell's limit.
- **R20** (T48; K3250, K3254; walk row 20; amends R5, R15) `archive` and `open-file` opened bare or not found draw `interface-shell` R61's "Nothing is here" with the way back, and never "Name an archive to open" or "Name a file to open". Test: each screen bare.

#### T49 (T49-23)

- **R21** (T49; D9 **B**; K3324 (1); `capture` R86; `control-plane` R72; amends R2) An upload's answer (a provenance document, `capture` R86) is promoted as an information bundle at `collected`, exactly as R1 promotes `acquire`'s document (`allocid`, then `promote` with the same composition, R23's files included). Its refusals are drawn on the tab. "It waits in Held captures" is said only once that promotion answers. An answer with `existed: true` promotes nothing new. Test: an upload draws its document in `heldcaptures`. Control: a refused promotion draws its refusal and not "It waits". *(not yet met: T49)*
- **R22** (T49; D12 **M**; M-T49-5; amends R1, R2) `capture` opened with a project or a question as its subject (`/app/capture/<tab>/<id>`, from screens-inquiry R38) files what it captures there. The promoted bundle names that project in the field M-T49-5 finds the project's reads count (the question's project, for a question). The result offers "Cite a passage", which opens `find-in` over the document with the question chosen. Test: a capture from a question is held under the question's project (`heldcaptures` with `project`), and the project's Find counts it. Control: a capture with no subject is filed under no project. Its naming of the question as `captured_for` waits on N1117 (K3369); the project filing is met in T49. *(not yet met: T49)*
- **R23** (T49; D13 **M**; `ratification` R22's entry requirements; amends R1, R2, R4) Two rules:
  - **The bundle meets `verified`'s entry.** The bundle R1 and R21 compose carries every file `verified`'s entry requirements name: `data/dataset.json`, at least one file under `snapshots/`, and a well-formed `content_hash` (`ratification/release.mjs`:192–197). So `release` of a well-formed capture is not refused `ENTRY_REQUIREMENTS`.
  - **Refusals in words.** A held row's refusal (`eligible: false`, or a `release` refusal) is drawn by its words (`interface-shell` R61), never as raw catalogue text (`held.mjs`:21).

  Test: a captured address and an upload are each vouched for. Control: a crucial capture is still refused `CRUCIAL_IN_BATCH`, in words. *(not yet met: T49)*
- **R24** (T49; D22 **M**, its first half) The capture's result links the document it made: a reference to `document` at the bundle the promotion answered. Test: the result's link opens the document. Control: a refused promotion draws no link. *(not yet met: T49)*
- **R25** (T49; N1100; DEC-245, DEC-246; K3327 (BOB's: `capturerequest`'s `lead_inquiry`); `capture-requests` R48, `capture` R83; amends R1, R2) Two parts:
  - **"For which question".** Opened from a question, "From an address" draws "For which question" (`capture.forquestion`, help `capture.forquestion.help`), preset to that question and changeable among the questions the member may see (`cs.choice` over record data). Before `acquire`, the screen sends `capturerequest` with the address and `lead_inquiry` the chosen question, so the held row's `captured_for` names it. It is filed as R22 files it, and once vouched for it opens beside that question (DEC-245). The measure in START line 1 governs this clause (finding 7).
  - **Refusals beside the address.** `refusal.BAD_LOCATOR`, `refusal.SOURCE_REFUSED`, `refusal.FETCH_FAILED`, `refusal.EMPTY` and `refusal.TOO_LARGE` are drawn by key beside the address. An empty required field draws `capture.fieldneeded` with `{field}` its label. R1's own `screen.capture.refusal.*` rows go.

  Test: a capture from a question answers `captured_for` with that question. Each refusal draws its key's words. Controls: no subject, no request; an empty address draws `capture.fieldneeded`. *(not yet met: T49)*

#### T49: words by key (K3366, K3368; DEC-257, DEC-258)

- **R26** (T49; K3366; DEC-257, DEC-258; `setup-words` R11–R13; amends every requirement here that quotes a member-facing sentence) **Words by key.** This module holds no member-facing English: every sentence it draws or answers is read through `setup-words` `word(key, vars)`, and the module holds only keys. Its keys are the `reads` list for it in `docs/development/ux-substrate/screens/words-reads.json` (DEC-258; 255 keys at `fa3c8b7e8e`), with any key a requirement here names. A sentence an earlier requirement here quotes means the key whose English it is: the quotation identifies the key and binds no wording, so a word changed in `words.json` changes no requirement and no code here. Test: each key it reads is asserted with `setup-words` `hasWord`; over fixtures, what it draws for a sample of its keys equals `word(key, vars)`; no test holds a sentence's English. *(not yet met: T49)*

## Private

### Uses

- `setup-words.word`, `setup-words.hasWord` (K3366, K3368): every member-facing sentence, by key.

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
