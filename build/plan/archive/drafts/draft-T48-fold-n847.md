**Status** · UNREVIEWED worker draft for BOB, 2026-10-14, read-only against `tranche/T47` (and `origin/main` @ 82d0e5b484; PR #34's head `origin/claude/gallant-brown-zg0wc1` @ 9fcf787df4). Folds N847, N1048, N1049 and N1050 into the T48 plan (`build/plan/draft-T48-plan.md` with `draft-T48-fold.md`). BOB reviews it before T48 opens.

# T48 fold: N847 (DEC-227), N1048 (DEC-224), N1049, N1050

## 0. What the sources say, and five corrections to N847's module list

Sources read: `next.md` N847, N1048–N1050 (lines 12, 133–135); `rulings.md` K945, K2591, K3166, K3171, K3177, K3178, K3183, K3186; DEC-227 (PR #34's `DECISIONS.md`, line 3622 on the branch); DEC-224 (`main`'s `DECISIONS.md`, line 3580); PR #34's diff (`registry.json`, `registry.src.py`, `mock-screens.js` `SCR.elsewhere` and `SCR.places`, `mock-shell.js` `DOOR_WIZ`/`wizardGuide`/`PATH`, `mock-refs.js`, `words-t48.src.py`, `words.json`, `library.json`); the requirements files of jurisdictions, wizard-scripts, plane, setup-words, interface-assets, interface-shell, screens-wizards, screens-settings, screens-daily, people (whole), plus op-declarations R21/R28/R60, journey-check R1–R2 and the screens-* Purposes; `modules.json`; the code at `wizard-scripts/index.mjs`:776–786 and :1356–1370, `wizard-scripts/start.mjs`, `plane/wizards.mjs`:20–35, `plane/wiring.mjs`:223, `screens-daily/home.mjs`, `screens-wizards/guide.mjs`, `interface-shell/index.mjs`:256–257, `interface-shell/browser.mjs`:811, `people/index.mjs`:1230–1250, `setup.mjs`:1722–1843.

1. **The pointer seam already exists.** `wizardRegister` takes `door: {findExisting, pointer}` (R23; `index.mjs`:783–786) and `startFrom` already answers `routes[elsewhere].pointer` from `door.pointer(viewer)` (`index.mjs`:1366–1367). K2591: "no pointer provider exists: the plane registers none (wizard-scripts answers null); the provider and its data to N847." So no new op is needed: the screen reads `op=startfrom` (declared by op-declarations R28, `NEEDS` null, graded by op-grades R17). This keeps op-grades and affordances out of N847.
2. **`library.json` has no sixth door, and this process may not add one.** On PR #34's head `library.json`'s `doors` still hold five (problem, person, money, read, tip). PR #34 does not touch `library.json`. DEC-227's "owed: R23's sixth door `elsewhere` in `library.json`'s doors" cannot be met by editing that file (K945: this process never edits `ux-substrate/`). The sixth door names no script; it opens a screen. **BOB's choice, made here:** wizard-scripts carries it as its own frozen data from DEC-227 (1), after the file's five. If the design stream's `library.json` holds it by the job's START, it is read from there. This is wizard-scripts R37 below. A one-line channel note to UX-DESIGN is optional (so the file and the code agree); nothing waits on it.
3. **The guide's line belongs to `screens-wizards`, not `interface-shell`.** The guide is `screens-wizards`' `GUIDE` (its R2; `screens-wizards/guide.mjs`). `interface-shell` R31 only holds the dock. `interface-shell` is still touched for the screen's path (R8's `PATH`), and by N1048 and N1049.
4. **Two shared re-takes are needed, and N847's list leaves them out.** PR #34 adds the screen `elsewhere` to `registry.json` (66 → 67 screens) and 92 words to `words.json` (1,803 → 1,895; 652 protected, unchanged). Without the re-takes:
   - `interfacePage` throws for a screen whose id is not in `SCREEN_REGISTRY` (`interface-shell` R21);
   - the screens' word keys would ride the English fallback (`interface-shell` R5's test fails on an unknown key).
   So `wizard-scripts` (registry), `setup-words` (words) and `op-declarations` (R21/R27 read the same file, its R60) each need one line. One re-take at PR #34's merge also covers DEC-226's `updates` screen and words (N1047) and `dash-home`'s absence (N1036; T48-30's fold item). Write it once.
5. **The screen goes in `screens-daily`.** Its Purpose is "Where a member starts and works each day: the group's home…". The registry places `elsewhere` under Home (`PATH` `['Home', 'Where else to go']`; `rail: 'home'` in `SCR.elsewhere`). No other screens-* Purpose fits: entry is sessionless, wizards is the library and runner, and settings is administrators' day-to-day. So "Home's sixth door" and "the screen for `elsewhere`" are one `screens-daily` job, joining T48-38.

**Id collisions to watch.** `draft-T48-reqs-n880-n882-n670.md` already claims `plane` R50, `op-declarations` R64 and `op-grades` R38. The ids below skip those. N1047's fold names no ids yet; BOB re-checks each "next free" id when writing.

## 1. Per module

Layers are from `modules.json` `layer`. "Joins T48-n" means the module already has a T48 entry (one job per module). New entry numbers continue after T48-66 and are BOB's to renumber.

### L1 · jurisdictions (new to T48) · **T48-67 · jurisdictions**

**Plan entry:** (N847; DEC-227 (3), (4); K3183, K3186) adds a `pointers` section to the profile: shape, validation, `combine`, and the test profile's pointers. The first profile's pointers are researched by the job from each body's own published page, each with its source and the dated read as basis; what no primary page supports is absent · text BOB's · directly after record-grammar in L1.

Next free id: **R89** (R1–R88 in use; none retired).

- **R89** (T48; N847; DEC-227 (3); K3186) `pointers`: `[{kind, name, does, contacts, hours?, languages?, source, status, basis}]`. These are the places outside Civicsmith that a member is sent to when what she needs is a matter hers alone (`wizard-scripts` R23's `elsewhere` route), researched per place like every other fact, never a member's data. `kind` is one of the frozen exported `POINTER_KINDS`, in this order: `legalaid`, `selfhelp`, `service`, `agency`, `representative`, `tipline` (a new kind is a requirement change). `name` is the body's own name, one line of 1–200 characters. `does` says what it does and for whom, in the profile's words, 1–500 characters (one or two sentences; a state agency's subject is said here). `contacts` is a non-empty list of `{how, value}` as R32 has them, `how` one of `web`, `email`, `phone`, `mail`, `address`. `hours` is R42's form. `languages` is a non-empty list of tags `isLocale` accepts (R37). `source` is the address or citation read, non-empty. `status` is `researched` and `basis` a dated measurement entry (`YYYY-MM-DD`, optionally qualified, R2), so the date read can be shown with the pointer; in a test profile, `TEST`. R44 holds: a pointer without a source is not written, and `UNMEASURED`, `ruled` or an `M-<n>` with no date are refused `BASIS_INVALID`. A profile may hold several pointers of one kind and none of another. A known section, never `UNKNOWN_SECTION`. *(not yet met: T48)*
- **R90** (T48; N847; R89; amends R28, R35) A malformed pointer is named by its field:
  - a `kind` outside `POINTER_KINDS` is `KIND_INVALID`;
  - an empty or over-long `name` or `does` is `VALUE_INVALID`;
  - an empty `contacts`, a `how` outside R89's list or an empty `value` is `CONTACT_INVALID`;
  - a malformed `hours` is `HOURS_INVALID`;
  - a language `isLocale` refuses is `LOCALE_INVALID`;
  - no `source` is `SOURCE_MISSING`;
  - a `status` or `basis` outside R89 is `BASIS_INVALID`.
  In `combine`, `pointers` are unioned in the order given (R14): an entry equal to an earlier one in everything but its basis and `profile` is kept once, carrying both. *(not yet met: T48)*
- **R91** (T48; amends R22, R84) The test profile supplies `pointers`, with values differing from the first profile's: at least one pointer of each of the six kinds, two of one kind, one carrying `hours` and `languages`, and each `how`. The module's tests show each R90 code with a negative control. *(not yet met: T48)*
- **R92** (T48; N847; DEC-227 (3); amends R21, R30; R44's rule) The first profile holds `pointers` only as researched by the job.
  - Each pointer is read from the body's own published page (its address the `source`, the day read its dated basis, each read named in the job's record).
  - Where a primary list exists, it is the place to start for that kind: the courts' self-help page for `selfhelp`, the city's own service-line page for `service`, the council's roster for `representative` (each district office it lists, since the screen reads no member's address).
  - For `legalaid`, `agency` and `tipline`, the job lists what BOB's criterion admits (§2, item 3), stated in the job's START.
  - A pointer no primary page supports is absent, never `UNMEASURED` and never invented. None is taken from the design stream's mockup: its entries are illustrative (`555` numbers, `.example` addresses; PR #34 `mock-screens.js` `SCR.elsewhere`).
  - No emergency number is held (DEC-227 (4): the screen names none).
  - The first profile holds at least one pointer of each kind a primary page supports, and every kind it holds none of is named in the job's record. *(not yet met: T48)*

Satisfies gains DEC-227 (3), (4). Provides lists `POINTER_KINDS`. No `uses` change.

**How the job gets Oakland's content.** The content needs real sources, and the job researches it itself. Its session reads each body's own page with its web tool and records the address and the date read. That is the M-note form R56 and R85 already use. A host the session's network refuses is named in the job record, and that pointer stays absent. Nothing comes from memory, from the mockup or from a secondary aggregator where the body publishes its own page. If the job's network cannot reach the primary pages at all, the job stops and says so. BOB then reads `mcp__claude-code-remote__read_documentation` topic `environment.network` and either has the host allowed or reports the gap; that is a hard reason for R92 only, while R89–R91 still merge.

### L5 · people · joins **T48-50 · people**

**Plan entry gains:** (N1050; SCREENS-INVESTIGATE #1 J5; K3178) R37's organisation rows say who wrote their note.

Next free id: **R38** (R1–R37 in use).

- **R38** (T48; N1050; K3177, K3178; amends R37) A row of an organisation kind answers, in `today`, beside `note`:
  - `note_by`, the entity's `declared_by` as `entities` holds it (its Terms);
  - `machine`, `true` exactly when that author is a machine identity (`record-grammar.isMachineIdentity`; setup's seeding declares as one, `instance-setup` R50).
  A screen can then tell setup's seeding from a member's words without reading the note's text. A person row is unchanged. Test: a seeded office answers `machine: true`; control: an office a member registered answers her stamp and `machine: false`. *(not yet met: T48)*

No new edge: `record-grammar` and `entities` are already uses.

**Follow-on, same tranche (L11):** **T48-63 · screens-investigate** gains (N1050) **R15**: `people` draws "Added at setup from your group's place" (`today.seeded`) from `today.machine` and never by matching the note's text. Retire the regex at `screens-investigate/people.mjs`:58 and :64. Control: a member's note ending "seeded at setup." is drawn as her words. *(not yet met: T48)* (screens-investigate's next free id is R15; R1–R14 are in use.)

### L11

#### wizard-scripts · joins **T48-30 · wizard-scripts**

**Plan entry gains:** (N847; DEC-227 (1); K3186) the sixth door `elsewhere`, always answered, and the pointer's answered shape; the registry re-taken at PR #34's merge (`elsewhere` added; shared with N1047's `updates` and N1036's `dash-home`).

Next free id: **R37** (R1–R36 in use).

- **R37** (T48; N847; DEC-227 (1), (4); K2591; amends R23, R33)
  - **The sixth door.** `startFrom`'s `doors` end with a sixth door, `{door: "elsewhere", scripts: [], opens: "elsewhere"}`, after the five `library.json` holds. It is carried as this module's frozen data from DEC-227 (1), or read from `library.json` when the design stream's file holds it at the job's START. It is answered to every viewer whatever is offered and never left out ("the way out is always visible"). R23's and R33's rule (a door with no offered script is left out) holds for the five. Its words are `door.front.elsewhere.*` (read by the interface).
  - **The pointer.** The `elsewhere` route's `pointer` is the registered `door.pointer(viewer)`'s answer when it is `{places, pointers}`: `places` a list of the active places' names (`[]` when the group follows none), `pointers` a list of objects, each passed through as the provider gives it. Any other answer, a provider that throws, or no provider answers `null`. A string is no longer accepted.
  - No place, law or venue enters this module's behaviour or text (R20): the pointers are profile data handed in.
  - Control: with no script offered, `doors` is the sixth door alone; a provider answering a string, or throwing, gives `pointer: null`. *(not yet met: T48)*
- **R38** (T48; DEC-227; DEC-226; DEC-218; amends R13, R35) The screen registry is re-taken from `registry.json` at PR #34's merge to `main` (the commit named as the snapshot's source, read at the job's START): 67 screens as read at PR #34's head. The new screen is `elsewhere` (working frame, no acts); `updates` (DEC-226) and the absence of `dash-home` (DEC-218) are as the file gives them. R13's rules are unchanged. Test: `registeredScreens()` lists `elsewhere` with no act; control: `wizardsAt("elsewhere")` answers `[]`. *(not yet met: T48)*

#### setup-words (new to T48) · **T48-68 · setup-words**

**Plan entry:** (N847, N1047; DEC-226, DEC-227) `WORD_ROWS` re-taken at PR #34's merge · generated · after wizard-scripts and before instance-setup.

Next free id: **R8**.

- **R8** (T48; DEC-226, DEC-227; amends R7) `WORD_ROWS` is `words.json` as it stands on `main` at PR #34's merge, and `WORDS_COMMIT` is that commit. Read at PR #34's head: 1,895 rows, 652 of them protected; the counts as read at the merge bind, by R1's rule. Test: equal word by word. *(not yet met: T48)*

#### op-declarations · joins **T48-34 · op-declarations**

**Plan entry gains:** (DEC-227) R21 and R27 read the registry and library at PR #34's merge.

Next free id: **R65** (R63 is the highest in use; R64 is claimed by N670's draft).

- **R65** (T48; DEC-227; amends R60) R21 and R27 read the registry and library at PR #34's merge, the same commit as `wizard-scripts` R38. `elsewhere` lists no act, so no spec or alias is added. Test: the alias table equals the file's `function` acts at that commit. *(not yet met: T48)*

#### interface-assets · joins **T48-60 · interface-assets**

**Plan entry gains:** (N1048; DEC-224; K3166) `ASSETS_COMMIT` moves to `main` after PR #33. The stylesheet then carries no `cursor: help`, and `.cs-card` carries no `cursor: pointer`. The same re-take brings N1028's three kind tokens, already in T48-60.

Next free id: **R5**.

- **R5** (T48; N1048, N1028; DEC-224, DEC-215 (3); amends R1) `ASSETS_COMMIT` is `82d0e5b484` (PR #33's merge to `main`), or the later `main` commit named at the job's START if the visual language changed after. PR #34 changes none of its files. `ASSET_FILES` is read there by R1's rule. By it:
  - `civicsmith.css` holds no `cursor: help` anywhere;
  - its `.cs-card` rule carries no `cursor` (DEC-224: the cursor changes only over a control);
  - it holds `--c-kind-money`, `--c-kind-part` and `--c-kind-mention`.
  Test: R1's byte equality; a scan finds no `cursor: help` and no `cursor` in `.cs-card`; control: `.cs-btn` keeps `cursor: pointer`. *(not yet met: T48)*

#### interface-shell (new to T48) · **T48-69 · interface-shell**

**Plan entry:** (N1048; DEC-224) no help cursor in the shell's own styles; (N1049; JOURNEY-CHECK #1 J4 (3); K3171) the test-instance band drawn across the frame; (N847) `elsewhere`'s path · text BOB's · after interface-assets.

Next free id: **R52** (R1–R51 in use; R25 and R29 retired, still counted).

- **R52** (T48; N1048; DEC-224; K3166) No style the shell carries gives `cursor: help` to any element, or `cursor: pointer` to an element that only explains itself. This removes `.cs-mast .cs-mark`'s `cursor: help` (`index.mjs`:256). The cursor changes only over a control: a button, a link, a resize grip, a drawing control (`cs.areas`). Test: the page's styles scanned for `cursor: help`; control: the rail's grip keeps `col-resize`. *(not yet met: T48)*
- **R53** (T48; N1049; K3171; amends R36) In the working frame the test-instance band spans the frame's whole width, every column, at the top of the frame above the rail and the work. It is not a block inside the rail's column. Its look is the shell's own (`.cs-testband`) until the design stream draws one (§3). Test: at both widths the band's box is as wide as the frame; control: no band while `test_instance` is not `true`. *(not yet met: T48)*
- **R54** (T48; N847; DEC-227; amends R8, R28) `elsewhere`'s path is Home › Where else to go, from `mock-shell.js`' `PATH` at PR #34's merge. Its rail place is Home. *(not yet met: T48)*

#### screens-wizards (new to T48) · **T48-70 · screens-wizards**

**Plan entry:** (N847; DEC-227 (1)) the guide's line on every step of a script a door offers · text BOB's · after interface-shell.

Next free id: **R10**.

- **R10** (T48; N847; DEC-227 (1); `wizard-scripts` R33, R37; amends R2) While the guide runs a script that any of `startfrom`'s doors names, every step carries one quiet line, `wizard.guide.elsewhere`. Its `{link}` is `wizard.guide.elsewhere_link`, a reference opening `elsewhere` (its card `screen.elsewhere.name` and `.purpose`). The guide reads `startfrom` once when a run starts; a read that fails draws no line and stops nothing. Opening the screen sends nothing and keeps the run where it was (R6). Test: "Get a record" carries the line on every step; control: "Welcome a new member" (no door names it) carries none. *(not yet met: T48)*

Uses gains, through the plane: `wizard-scripts` (`startfrom`, R23, R33, R37). No `modules.json` edge.

#### screens-settings · joins **T48-61 · screens-settings**

**Plan entry gains:** (N847; DEC-227 (1)) Places and offices says how many places its place lists for needs Civicsmith doesn't serve, with a link to the list.

Next free id: **R25** (R1–R24 in use).

- **R25** (T48; N847; DEC-227 (1); amends R19) **places** draws the section "Where else to go" (`places.elsewhere.head`), reading `startfrom`'s `elsewhere` route:
  - with `n` pointers, `n` ≥ 1, it shows `places.elsewhere.says` with `{n}` and `places.elsewhere.open`, a reference opening `elsewhere`;
  - a `pointer` of `null` is drawn `state.failed`, never as none;
  - with no pointer, it shows only the reference (§3: no words are drawn for zero).
  The group neither chooses nor edits the list: no act is drawn. Test: the count from a fixture; control: `null` drawn failed. *(not yet met: T48)*

Uses gains, through the plane: `wizard-scripts` (`startfrom`, R37).

#### screens-daily · joins **T48-38 · screens-daily**

**Plan entry gains:** (N847; DEC-227 (1), (2), (4); K3186) Home's sixth door, and the screen `elsewhere` ("Where else to go") with its six kinds and its no-pointer states.

Next free id: **R14** (R1–R13 in use).

- **R14** (T48; N847; DEC-227 (1); `wizard-scripts` R37; amends R9) Home's "What happened?" draws the sixth door `startfrom` answers (`door.front.elsewhere.name`, `.hint`), last among the doors. Pressing it opens `elsewhere` (`cs.go`), starts no script and sends nothing. It is drawn whatever else is offered, so the section is always drawn. Control: with no script offered, the sixth door alone is drawn. *(not yet met: T48)*
- **R15** (T48; N847; DEC-227 (2), (4)) **elsewhere** (Home › Where else to go; the registry's screen, no acts) reads `startfrom` (no message) and draws its `elsewhere` route's `pointer`:
  - the heading `elsewhere.title`, the sentence `elsewhere.says` and `elsewhere.records_nothing`;
  - then, for each kind in DEC-227's order (`legalaid`, `selfhelp`, `service`, `agency`, `representative`, `tipline`, held as this module's data), only kinds holding a pointer: the kind's heading `elsewhere.kind.<k>`, explained by `elsewhere.kind.<k>_says` (`interface-shell` R14);
  - under it each pointer of that kind, in the profile's order: its `name`, its `does`, each contact as `elsewhere.reach.<how>` with its value (a `web` value an outside link, `interface-shell` R21's rule), and `elsewhere.source` with `{source}` and `{date}` (the basis's date, `cs.date`);
  - "Back to Home" (`elsewhere.back`).
  With `places` empty it draws `elsewhere.none.head` and `elsewhere.none.noplace`. With places and no pointer it draws `elsewhere.none.head` and `elsewhere.none.says`, `{place}` the places' names (joined with ", "). Both of those draw `elsewhere.danger`. A `pointer` of `null` is drawn `state.failed`, never as none (`interface-shell` R10). The record's data (names, sentences, addresses) is drawn as data, HTML-escaped. Test: each state over a fixture with every kind; control: a profile with one kind draws only that heading. *(not yet met: T48)*
- **R16** (T48; DEC-227 (1)) Opening `elsewhere` records nothing and tells nobody. Its only reads are `startfrom` and the shell's own; it sends no act and no `wizardprogress`. Test: the requests sent on opening are listed; control: the sixth door's press sends none. *(not yet met: T48)*

Uses gains, through the plane: `wizard-scripts` (`startfrom`, R37). Satisfies gains the registry screen `elsewhere`, DEC-227.

#### plane · joins **T48-40 · plane**

**Plan entry gains:** (N847; K2591; DEC-227 (3)) the front door's pointer provider, composed from the active profiles' `pointers`; `modules.json` edge plane → jurisdictions.

Next free id: **R51** (R49 is the highest in use; R50 is claimed by N670's draft).

- **R51** (T48; N847; K2591; DEC-227 (3), (4); amends R19) The composition root hands `wizard-scripts` (its R23, R37) a `door.pointer(viewer)` beside the finder (`plane/wizards.mjs`' `wizardRegistration({door})`, `wiring.mjs`). It reads `record-core`'s setting `jurisdiction_profiles` (its R26) at the call, never once at start, and `jurisdictions.combine` over it:
  - with no active profile it answers `{places: [], pointers: []}`;
  - with active profiles, `{places: [each active profile's name], pointers: view.pointers || []}`;
  - a `combine` answering `ok: false`, or anything that throws, answers `null`.
  It names no place itself (R9). Test: the test profile's pointers reach `startfrom`'s `elsewhere` route through the door; control: no active profile gives `places: []`. *(not yet met: T48)*

`modules.json`: `plane` gains `jurisdictions` (index 1, earlier than 163). Uses gains `jurisdictions` (`combine`, `get`; R51).

## 2. Merge order and notes within each layer

- **L1:** record-grammar, **jurisdictions**, signatures, bundler, court-citations, ooxml, file-scanner (`modules.json` order: jurisdictions is index 1).
- **L5:** events, connections, standards, duties, **people** (T48-50 with N1050), explore, calculations. Unchanged.
- **L11:** wizard-scripts (T48-30: R37, R38), op-grades, affordances, notice-producers, queue-producers, **setup-words** (T48-68), instance-setup, op-declarations (T48-34: R65), admission, answer-envelope, store-door, signin-door, interface-assets (T48-60: R5), **interface-shell** (T48-69), **screens-wizards** (T48-70), screens-settings (T48-61: R25), screens-daily (T48-38: R14–R16), screens-inquiry, screens-investigate (T48-63: R15), screens-publish, screens-action, control-plane, plane (T48-40: R51), installer, legacy-ui. journey-check runs after. If N1047's settlement (K3189) moved T48-58 to machinery-producers, it sits at index 138, after op-grades.

Why this order:
1. **The registry re-take comes first.** `wizard-scripts`' registry re-take (R38) and `setup-words` R8 must merge before any screen module draws `elsewhere` or its words: `interface-shell` R21 throws on an unregistered screen, and R5's word test fails on an unknown key. Both are earlier in the order.
2. **`screens-daily` needs `wizard-scripts` R37's door and pointer shape.** It merges well after. `screens-settings` and `screens-wizards` read the same.
3. **The plane provides the pointer but merges last.** Until it merges, `startfrom` answers `pointer: null` and the screens draw `state.failed`. The screen modules test against a fake plane answering R37's shape, as the T47 screens did. This is K31's pattern (registered in-process, null-tolerant), so no edge points later.
4. **journey-check.** Its R2 fails on "any registry screen not drawn". With `elsewhere` in the registry it passes only once `screens-daily` R15 merges. It runs after every L11 merge, so the order already holds. No journey-check line is needed: `/app/elsewhere` is a working screen it opens.
5. **Shared re-take with N1047.** One re-take at PR #34's merge serves N847 (`elsewhere`), N1047 (DEC-226's `updates` screen and its words, already on `main`) and N1036 (`dash-home` absent). Write wizard-scripts R38, setup-words R8 and op-declarations R65 once. The T48-30 fold item "(N1036) `dash-home` retired from `screen-registry.mjs`" is met by R38 and can be dropped as a separate item.
6. **The criterion for Oakland's lists is BOB's (P17), recorded once in `rulings.md` before jurisdictions' START.** Recommended:
   - `legalaid`: the legal-services organisations an official list names as serving the county (the State Bar's Legal Services Trust Fund grantees), each read on its own page;
   - `agency`: the state offices whose own pages say they act on one person's complaint about housing, work, a utility or a purchase;
   - `tipline`: every newsroom based in the city whose own site publishes a tip channel.
   If BOB judges that naming newsrooms is policy, not detail, it goes to Bob with these options before L1 opens.
7. **PR #34 must be on `main`.** K3186: it is merged at the T47/T48 boundary, before T48 is cut. The commits "PR #34's merge" are named at each job's START.

## 3. Not drawn by the design stream: left out (hard reasons)

| what | hard reason |
|---|---|
| A pointer's `hours` and `languages` on the screen | Not drawn: no words are keyed for days, times or a languages label (`words.json` holds only `elsewhere.reach.hours`; the mockup writes hours and languages inside `does` text). They are held in the profile (R89) and not drawn until the design stream keys them. Channel ask to UX-DESIGN. |
| Places and offices' sentence for zero pointers or no place, and the section's hover help | Not drawn: `places.elsewhere.says` is drawn only with a count (`SCR.places` shows "7 places"); the mockup's section help is not keyed. R25 draws the link alone in those cases. |
| The test-instance band's look | Not drawn: no class or mock in the visual language, only the word `instance.test.notice`. Its placement across the frame is BOB's fix (R53); its look waits on the design stream. Channel ask. |
| The assistant naming `elsewhere` when it refuses advice | DEC-227 (1): "not owed". |
| Choosing a pointer by the member's own district or address | Not drawn, and the record holds no member's address. Every `representative` pointer the profile holds is drawn. |

Everything else in DEC-227 is drawn and keyed: `elsewhere`'s states, Home's sixth door, the guide's line, and Places' count with a count. DEC-224 is on `main` (82d0e5b484). N1050 needs no design: it is a data field, and screens-investigate's word `today.seeded` already exists.

## 4. Counts

New T48 entries: 4 (T48-67 jurisdictions, T48-68 setup-words, T48-69 interface-shell, T48-70 screens-wizards). Joined to existing entries: 8 (T48-30, T48-34, T48-38, T48-40, T48-50, T48-60, T48-61, T48-63). New requirement lines: 20 (jurisdictions R89–R92; people R38; screens-investigate R15; wizard-scripts R37–R38; setup-words R8; op-declarations R65; interface-assets R5; interface-shell R52–R54; screens-wizards R10; screens-settings R25; screens-daily R14–R16; plane R51). New `modules.json` edge: 1 (plane → jurisdictions).

`next.md` entries closed by these, once merged: N847, N1048, N1049, N1050.
