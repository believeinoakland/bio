# Draft T48: the walk folded into L11 (K3250)

**Status** · Draft for BOB #171's review. It was written by a worker on `tranche/T48` on 14 October 2026 and changes no other file. Its source is `draft-T48-live-vs-design.md` (WALK-084 #2: C1–C9 and rows 1–21), applied with BOB's decisions (a)–(h) from K3250. It also draws on `plan/current.md` § L11 and its "Rules at the opening", `modules.json`, `layers.md`, each owning module's requirements, DEC-218 and DEC-219, and the code at the lines the walk cites.

**Owners and layers.** Every owner is in **L11, which has not started**, so nothing needs a closed or running layer. There are two conditional exceptions:
- the stalled `heldcaptures` read (row 14), if its cause turns out to be in `capture` (L3, closed);
- the explore groups (row 15), which are routed to `affordances` (L11), so no CHANGE to `explore` (L5, running) is needed.

Both are covered in "Could not place".

**Numbering.** The plan's highest entry is T48-84, so the two new entries are **T48-85 · screens-intake** and **T48-86 · queue-producers**. Every other module already has a T48 L11 entry, and its line below is written as "also". New requirement ids start at each module's next free id; the highest id was checked, retired ids included. Each new line ends *(not yet met: T48)*, which the plan's rule 1 requires and which is left off below to save room.

**Words.** Any new sentence uses UX-DESIGN's words where the design draws them. Otherwise it uses BOB's interim words, held in the drawing module's `SCREEN_WORDS` and marked "interim, for UX-DESIGN". All of them go to UX-DESIGN in one channel act (open point 6).

---

## 1. The Common line (CL)

The same rule applies to every screen module. It folds C1, C4 and C5, using DEC-219 (3) as BOB extends it under K3052. Each screen module below takes it under its own id, written as "CL":

> **R<n>** (T48; K3250; walk C1, C4, C5; DEC-219 (3); K3052; amends the module's Common id) Every element these screens draw uses a class that a served stylesheet defines (`interface-shell` R56).
> - Where the design draws the element, the screen uses the design's own class: an `mk-*` class as `shell.css` carries it, and a `cs-*` class the design spells `mk-*` (`cs-frontgrid`, `cs-signin`, `cs-fronthead`, `cs-flogo`, `cs-facts`, `cs-note`, `cs-sub`, `cs-small`, `cs-steps`, `cs-passage`, `cs-strengthbox`, `cs-gapblock`, `cs-pickc`, `cs-areas`, `cs-table`) is renamed to the design's spelling.
> - Every labelled field is drawn with `cs.field`. No screen draws `cs-form` or a bare `<label>` with `.help`.
> - A section, tray, list, block or reading that holds nothing is not drawn. No count, reading or "finished by" is drawn at zero. A screen with nothing at all to show draws its one designed empty state, which names the first step.
> - A read that failed is still drawn as failed (`interface-shell` R10).
>
> Test: the module's real `SCREENS` compose under `interface-shell` R56, and each screen drawn over an empty fixture shows no empty section and no zero. Control: a failed read is drawn `state.failed`.

---

## 2. Root causes

### C1 · the design's page CSS never ships (decision (a))

**Who does what.** `interface-assets` holds the files. `control-plane` R75 serves any `ASSET_FILES` name generically at `/app/assets/<name>`, so it needs no change. `interface-shell` emits the `<link>` (`index.mjs:304`, `STYLESHEET`) and owns the page, so the coverage check belongs to it. The rename and the `cs.field` rule land in each screen module through CL.

**Undefined classes, measured on `tranche/T48`.** The table counts classes emitted in `class` literals that are defined in neither `civicsmith.css` nor the shell's `STYLE`.

| module | undefined | of them, in `page.src.html` | defined nowhere |
|---|---|---|---|
| screens-daily | 22 | 16 | `cs-untested`, `mk-actd`, `mk-count`, `mk-owner`, `mk-last`, `mk-sorts` |
| screens-investigate | 22 | 10 | `cs-meta`, `cs-visit`, `cs-note`¹, `cs-sub`¹, `cs-current`, `cs-proposal`, `cs-chain`, `cs-hops`, `cs-refusal`, `cs-filters`, `cs-gapblock`¹, `mk-lane` |
| screens-settings | 15 | 0 | `cs-form`, `cs-notice`, `cs-note`¹, `cs-situation`, `cs-draft-label`, `cs-label-untested`, `cs-shown`, `mk-key`, `mk-all`, `mk-scope`, `mk-some`, `mk-why`, `cs-table`¹, `cs-kv`, `cs-tag-machine` |
| screens-intake | 15 | 12 | `cs-tab`, `cs-refusal`, `cs-untested` |
| screens-inquiry | 12 | 0 | `cs-sub`¹, `cs-meta`, `cs-refusal`, `cs-label`, `cs-machine`, `cs-rec`, `cs-note`¹, `cs-facts`¹, `cs-id`, `cs-passage`¹, `cs-form`, `cs-strengthbox`¹ |
| screens-entry | 10 | 0 | all ten are `cs-*` with an `mk-*` twin¹, except `cs-codes` and `cs-shown` |
| screens-action | 10 | 7 | `mk-form`, `mk-done`, `mk-grid` |
| screens-publish | 7 | 5 | `cs-note`¹, `cs-refusal` |
| screens-wizards | 4 | 0 | `cs-note`¹, `cs-label-untested`, `cs-wizmarks`, `cs-form` |

¹ The design has an `mk-*` twin, which CL renames to. Each remaining class is handled in one of three ways: the screen switches to the kit or the design's class; the class is a script hook listed in `HOOK_CLASSES`; or the shell carries the style (open point 1). My count included ids such as `cs-lock-t` for interface-shell, so the shell's own figure is left out; R56's check counts only `class` attributes.

**interface-assets** (asked by no id today):
- **R7** (T48; K3250; walk C1; amends R1's "no other name", R5) `ASSET_FILES` also holds `shell.css`, of type `text/css`. It holds the product rules of the design's page stylesheet: the `<style>` of `docs/development/ux-substrate/screens/page.src.html` at `ASSETS_COMMIT`. `generate.mjs` writes it beside `civicsmith.css`; it is never copied or edited by hand and is regenerated whenever the visual language is.
  - **Which rules are carried.** A rule is carried when every one of its selectors names an `mk-` or `cs-` class, and none names a mock-only class or one of the page's own. The mock-only classes are `mk-device`'s frame, `mk-scaler`, `mk-mockctl`, `mk-osprompt` and the viewer's controls. The page's own are `anat`, `asfig`, `viewer` and `vlist`.
  - **How selectors are rewritten.** `.mk-page` becomes `.cs-frame`. A rule under `.mk-device[data-device="phone"]` is carried inside `@media (max-width: 760px)` with that prefix removed.
  - **Other rules.** R2 holds for the new file.
  - Test: the file equals the generator's transform of the source, read from git at `ASSETS_COMMIT`. It holds `.mk-door`, `.mk-acts`, `.mk-frontgrid` and `.mk-avatar`, and `.cs-tabs` inside the 760 px query. Control: no selector names `mk-device`, `mk-scaler` or `.anat`, and no rule lacks a `cs-` or `mk-` class.

**interface-shell** (asked by no id today):
- **R56** (T48; K3250; walk C1; amends R1, R21) The page links `civicsmith.css` and then `shell.css`, both before its own `<style>`. `interfacePage` throws for any class in a `class` attribute literal (written by a screen's functions, the guide's, or the shell's own program) that no served stylesheet defines. Served means `civicsmith.css`, `shell.css` or the shell's `STYLE`. The error names the screen and the class. Two exceptions:
  - the script-hook classes the shell lists in `HOOK_CLASSES`, each with what reads it;
  - the classes `civicsmith.css` draws on its own elements.

  So a screen that draws an unstyled class is never served. Test: the two links. A stand-in screen drawing `cs-nonesuch` throws and names it. Control: a stand-in drawing `mk-door` composes. With the real screens, the check runs in `control-plane`'s page test (`t46-app.test.mjs`), so the composed product fails on any undefined class.

**Entries.**
- **T48-68 · interface-assets** also · (K3250; walk C1) R7: `shell.css` generated from the design page's product rules · text BOB's.
- **T48-69 · interface-shell** also · (K3250; walk C1) R56: the two stylesheets, and `interfacePage` refuses an undefined class · text BOB's.
- Each screen module takes CL (§4).

### C2 · the shell frame (decision (b))

The owner is `interface-shell`, with `control-plane` passing the test flag (T48-77).

**What is already asked.** (a) R53 is in T48-69. The first paint is not asked.

**New ids:**
- **R57** (T48; K3250; walk C2 (b)–(d), rows 1–2; amends R7, R26) The working frame is the design's page at both widths:
  - **Height and scrolling.** The frame (`.cs-frame`, which also carries `data-frame`) fills the viewport's height (`100dvh`). Its main column scrolls; the page itself never does.
  - **Classes.** The masthead, band, rail, main column, dock and tabs carry the design's classes (`mk-mastsearch`, `mk-avatar`, `mk-hide-phone`, `cs-band`, `cs-tabs`), so `shell.css` lays them out.
  - **The phone masthead (below 760 px).** It shows icons only: the mark and the group's name, search as its icon (its label kept as the accessible name), the explanation control as its icon, and the member's avatar. Nothing wraps, and nothing is wider than the viewport.
  - **The tabs (below 760 px).** The five tabs are pinned to the foot of the viewport, with the dock as a sheet above them.
  - **The band.** It reads as drawn: `mark.path.working.name` followed by `shell.band.working` ("· not public · seen by your group's members"; interim, for UX-DESIGN, where `mark.path.working.means` holds the same sense).

  Test: at the phone width the masthead's labels are hidden and the tabs are drawn last inside the frame, which is fixed-height. Control: at 1280 px the labels are drawn and the tabs are not. The live measurement is in `journey-check` R6.
- **R58** (T48; K3250; walk C2 (a), row 2; amends R36, R53) While `options.testInstance` is `true`, the test band is part of the page as served (`control-plane` R95), spans the frame from first paint, and the page does not move when `bootstrap` answers. An answer of `test_instance` that is not `true` removes the band. Test: the served HTML holds the band before any script runs. Control: `testInstance: false` serves no band.

**control-plane** (also T48-77; asked by no id today):
- **R95** (T48; K3250; walk C2 (a)) The page route passes `testInstance` to `interfacePage`, taken from `ai-runs.testInstance()`, as `bootstrap` R80 answers it. A read that throws passes `false`. Test: a test instance's `/app` HTML holds the band. Control: a non-test instance's does not.

**Entries.**
- **T48-69 · interface-shell** also · (K3250; walk C2, rows 1–2) R53 built with R57's phone masthead, pinned tabs and fixed-height frame, and R58's band from first paint · text BOB's.
- **T48-77 · control-plane** also · (K3250; walk C2 (a)) R95: the page composed with `testInstance` · text BOB's.

### C3 · wizard marks (decision (c))

The owners are `screens-wizards` (`guide.mjs:342-359`) and `interface-shell` (placement, `browser.mjs:767`). DEC-219 (3) is read as no chip at zero; DEC-218 adds nothing here. `wizardsat` already answers each script's `steps` (`wizard-scripts` R11), so the filter needs no provider change.

**screens-wizards** (R2 and R7 are asked and amended):
- **R11** (T48; K3250; walk C3, row 8; DEC-219 (3); amends R2, R7) A screen's wizard marks are one chip, the visual language's `cs-wizmark`, beside the screen's title. It reads "<n> wizards start here" (`wizard.marks.chip`, or `.chip.one` for one), where `<n>` counts the scripts offered here that this viewer can walk:
  - the viewer's own drafts are counted;
  - a script is left out when its steps name any act that the shell's gate (`cs.can`, `interface-shell` R12) would not draw for her;
  - with none, there is no chip.

  Pressing the chip opens the list beneath it: each script's name with "Start". A required one shows `wizard.mark.recommended` ("Recommended for everyone"; interim, for UX-DESIGN) in place of "Required". The finished count appears only above zero. Home's welcome offer (R7) keeps its own band, which is not a chip. Test: on `members`, a member with two administrator-only scripts sees no chip. Controls: an administrator sees "2 wizards start here"; a script finished by nobody shows no count.
- **R12** = CL (`wizards`, the guide). The library's "No wizards to show here" is not drawn while the read is pending or refused (row 17; see `wizard-scripts` R39).

**interface-shell:**
- **R59** (T48; K3250; walk C3; amends R31, R51) The guide's marks (`GUIDE.marks`) are drawn inside the screen's title row, after its heading. They are never a block above the path or the heading. Test: the chip is a child of the title row. Control: a screen with no marks keeps its title row unchanged.

**Entries.**
- **T48-70 · screens-wizards** also · (K3250; walk C3, rows 8, 17) R11: one chip, filtered by what the viewer can do, never zero; R12 (CL) · text BOB's.
- **T48-69 · interface-shell** also · (K3250; walk C3) R59: the marks in the title row.

### C4 · hand-built forms

Code wrong; the kit's rule is asked by `interface-shell` R21 and R27. The fix is CL's `cs.field` clause, in `screens-settings` (account, connect, places, group, members, settings) and every other module that emits `cs-form`: inquiry and wizards. `interface-shell` R62 makes the kit's field and rows match the design (row 9).

- **R62** (T48; K3250; walk C4, rows 9, 11; amends R19, R27) `cs.field` draws the label bold with its help beneath, tied by `aria-describedby`. The two never run together at any width. At the phone width `cs.rows`:
  - draws each row as the design's one-line row (the name and its first value on one line, the rest beneath);
  - draws no label for an empty cell;
  - leaves out a column that is empty in every row.

  Test: a field's label and help are separate boxes. Controls: a member row with no expertise shows no "Expertise" label; a column empty everywhere is not drawn.

### C5 · empty blocks and zero readings (decision (d))

DEC-219 (3) is asked only for Home (`screens-daily` R17, T48-72). Every screen module the walk names takes CL: daily, intake, settings, investigate, wizards, and (through C1) inquiry, entry, publish and action. The shell's own zero ("0 TO DO") is R60.

### C6 · mechanical source notices (decision (e))

The owners are `queue-producers` (`index.mjs:1325-1342`, which names an untitled document by its bundle id) and `screens-daily` (`queue.mjs:36,140`). Neither is asked today: no words exist for the two kinds.

**What is folded where.**
- **Kept as it is.** The fold is drawn and decided per document: queue R32's one decision governs one item.
- **Folded on screen.** `screens-daily` draws one item per kind, with a count.
- **queue-producers' share.** It stops putting an id or a mechanism into member-facing text.

**queue-producers** (a new entry; it has no T48 entry):
- **R40** (T48; K3250; walk C6, C8) A `source-modified` or `source-removed` item:
  - carries `title`: the document's title, or `null` when it has none;
  - has a `summary` and `detail` that name no bundle id, HTTP status or mechanism ("a monitoring check", "404 or 410"). `basis` keeps those facts for the record.

  Test: an untitled document's item carries `title: null`, and its summary has no `B-` id. Control: a titled one's summary names the title.

**screens-daily:**
- **R22** (T48; K3250; walk C6, row 5; amends R2, R17) The `source-modified` and `source-removed` items are drawn in members' keyed words, never the producer's English: `queue.source-modified.one` or `.many` with `{n}` ("A document changed at its source" / "{n} documents changed at their source"), and `queue.source-removed.*` ("… is gone from its source"). Each has the detail `queue.source.detail` ("Your group's Civicsmith noticed this when it checked. Open each one to see what changed; nothing has been decided."). These are interim words, for UX-DESIGN.
  - On `queue` and in Home's blocks, all items of one kind are one item with its count, which opens the list of its documents. Each document is a reference (its `title`, or `queue.source.untitled`) with its own options.
  - Test: five `source-modified` items draw one item reading "5 documents changed at their source". Control: a single item draws `.one`.

**Entries.**
- **T48-86 · queue-producers** · (K3250; walk C6, C8) R40: source items carry `title`, and their text names no id or mechanism · text BOB's · merges before `queue` (modules.json order).
- **T48-72 · screens-daily** also · (K3250; walk C6, row 5) R22: keyed words, one item per kind with its count · text BOB's.

### C7 · bare subject screens

This is asked by `interface-shell` R35 and R9 (K3171 fixed only screens-publish). The shell side widens the absence codes and the refusal wrapper:
- **R61** (T48; K3250; walk C7, C8, rows 6, 16, 20; amends R13, R35) Three rules:
  1. **Absence.** A read marked `subject: true` that is refused with an absence code draws only R35's "Nothing is here", with the way back to its place, and nothing else of the screen. The absence codes are: `NO_SUCH_*`, `*_NOT_FOUND`, `NOT_FOUND`, `NO_ENTITY`, `NO_CALC`, `NO_NODE`, and any code a screen module lists in its `ABSENT_CODES`. The same applies when a subject screen is opened with no subject.
  2. **A refusal with its own words.** It is drawn as those words alone (the `refusal.<code>` word, or the answer's `translation`), never wrapped in `state.failed`'s "Could not read this, because …".
  3. **A failure without words.** It is drawn as "could not be read" with R39's reference, and names no code.

  Test: a bare `calculation` refused `NO_CALC` draws "Nothing is here". `NOT_AN_ADMIN` with its words draws those words alone. Control: a 5xx still draws "can't be reached".

Each screen module marks its subject reads (§4: inquiry R21, investigate R26, intake R20, daily R21's find-in).

### C8 · developer words (decision (f))

| what is shown | owner | fixed by |
|---|---|---|
| the slug as the group's name | interface-shell (`browser.mjs:1737`), screens-daily (`home.mjs:51`), screens-entry (`front.mjs:25`) | shell R60; daily R23; entry R13 (merging T48-84's slug clause) |
| `en-US` tags | screens-settings (account, group, translations) | settings R31 |
| recorder `admin` | screens-settings (group's histories) | settings R33 |
| record ids in fields | screens-investigate (ties, standard, proceeding, person) | investigate R23 (asked: `interface-shell` R27, so the code is wrong) |
| "because NO_CALC" | interface-shell | R61 |
| word keys in Translations | screens-settings | R31 |
| "Required" | screens-wizards | R11 |
| "Explanations: {level}" | interface-shell (`words.mjs:19`) | R60 |
| a bundle id in a notice | queue-producers | R40 |

- **interface-shell R60** (T48; K3250; walk C8, C5; amends R7, R17) The masthead:
  - never draws a count at zero;
  - never draws the group's slug as its name: when `groupidentity` answers no `display_name`, it draws `shell.group.unnamed` ("Your group");
  - names the chosen explanation level by its own words, `level.<l>.name` ("Explain promptly"), with the row `shell.level` retired.

  No element the shell draws shows a slug, language tag, record id or code to a member. Test: zero To-do items draw no count, and `display_name: null` draws "Your group". Control: a set name is drawn.
- **Asking for the name.** This is decision (f)'s "instance-setup asks for the name". The setup page left `instance-setup` at its R83, so the asking is drawn by `screens-entry` R14 and `screens-daily` R23. `instance-setup` already records the name (R6, `groupnameset`) and answers `display_name: null` until one is set (R10). It needs no new id (open point 3).

### C9 · weight marks (decision (g))

The owners are `op-grades` (declaring) and `interface-shell` (drawing). R11's no-mark rule for reads and for `RUNG_ABSENT` grounds other than `undetermined` is BOB's own (K3002, K3011), not Bob's, so changing it is BOB's. The design marks every act: `mock-kit.js` `WEIGHT`, which defaults to Reasoned. Examples: `login` 1, `search` 1, `queuemute` 1, `startfrom` 1, `promote` 2, `acquire` 2, `captureupload` 2.

- **op-grades R42** (T48; K3250; walk C9, row 21) `MARKS` is a frozen map from op to weight name. It covers each op that a registered screen lists as an act and that has no rung in `RUNGS` (a read, or an op in `RUNG_ABSENT` under a ground other than `undetermined`). Its values are the design kit's `WEIGHT` (`mock-kit.js` at `ASSETS_COMMIT`), with an absent op taken as Reasoned, the kit's default; each entry names its source. It grades nothing: `RUNGS`, `RUNG_ABSENT` and `phoneOf` are unchanged. Test: it is total over the registry's rungless acts; `login` is reversible and `promote` reasoned. Control: no op in `RUNGS` is in `MARKS`.
- **interface-shell R64** (T48; K3250; walk C9; amends R11) An act that R11 draws with no weight carries the mark that `MARKS` names, as a mark and its explanation only. Its friction stays R11's: it runs on press, and asks no reason (open point 4). Test: Sign in, Search, Start a project, Capture and Mute each draw their mark. Control: Search still runs on press.

**Entries.**
- **T48-56 · op-grades** also · (K3250; walk C9, row 21) R42: `MARKS` for rungless acts, from the design kit · text BOB's.
- **T48-69 · interface-shell** also · (K3250; walk C9) R64: the mark drawn and friction unchanged.

---

## 3. Ranked defects

| # | owner(s) · layer | requirement | entry |
|---|---|---|---|
| 1 | interface-shell, interface-assets · L11 | new: shell R57; assets R7 | T48-69, T48-68 |
| 2 | interface-shell, control-plane · L11 | asked: shell R53; new: shell R58, control-plane R95 | T48-69, T48-77 |
| 3 | screens-daily · L11 | asked: R14, R17. New: R21 (CL), R22 (C6), R23 (door cards, title on press, name) | T48-72 |
| 4 | interface-shell, screens-daily, screens-entry · L11 | new: shell R60, daily R23, entry R13 and R14 | T48-69, -72, -84 |
| 5 | screens-daily, queue-producers · L11 | new: daily R22, queue-producers R40 | T48-72, T48-86 |
| 6 | screens-inquiry, screens-investigate, interface-shell · L11 | asked: shell R35. New: shell R61, inquiry R21, investigate R26 | T48-73, -74, -69 |
| 7 | screens-inquiry · L11 (`document.mjs:106`; the walk's "screens-intake R5" is the target's id) | new: inquiry R22 | T48-73 |
| 8 | screens-wizards, interface-shell · L11 | new: wizards R11, shell R59 | T48-70, -69 |
| 9 | screens-settings, interface-shell · L11 | new: settings R28 (CL) and R32; shell R62 | T48-71, -69 |
| 10 | screens-entry · L11 | new: R13 (merges T48-84's fold clause) | T48-84 |
| 11 | screens-settings, interface-shell · L11 | new: settings R29, shell R62 | T48-71, -69 |
| 12 | screens-intake · L11 | asked: R14, R16 (the code diverges). New: R17 (CL), R18 | T48-85 |
| 13 | screens-settings · L11 | asked: R5 (the order). New: R30 (the chooser) | T48-71 |
| 14 | daily (finder), intake (held), settings (notes, group, places), investigate (ties) · L11 | new: CL in each; intake R19 (the stall) | T48-72, -85, -71, -74 |
| 15 | screens-investigate, affordances · L11 | asked: shell R27 (ids). New: investigate R23, R24; affordances R59 | T48-74, T48-57 |
| 16 | screens-settings, interface-shell · L11 | asked: settings R16. New: settings R31, shell R61 | T48-71, -69 |
| 17 | wizard-scripts, screens-wizards · L11 | asked: wizards R1. New: wizard-scripts R39 (`wizards` for members), wizards R12 | T48-55, -70 |
| 18 | screens-investigate · L11 | asked: R12, R13. New: R25 | T48-74 |
| 19 | screens-daily · L11 | asked: R10. New: R23 | T48-72 |
| 20 | screens-intake, screens-daily, interface-shell · L11 | new: intake R20, daily R21 (find-in), shell R61 | T48-85, -72 |
| 21 | op-grades, interface-shell · L11 | new: op-grades R42, shell R64 | T48-56, -69 |

**Screens the walk lists apart from the rows.**
- `more` is the shell's own page: shell R63.
- Built by no module, and covered by existing entries or reasons: `updates` (T48-71), `elsewhere` (T48-72), `install` and `update` (the installer, which is not the app), `unavailable` (the shell's own state).
- Not built, with the plan's existing hard reasons: `site` (N1011, DNS) and `dash-action`/`dash-project` (DEC-214 (4); plan "Left out": the design stream's).

---

## 4. Requirement text per module (beyond §2)

**interface-shell (T48-69)**
- **R63** (T48; K3250; the walk's "Screens") The phone's More page lists the rail's places that the tabs do not hold, as the design draws rail rows: each place's icon and name as its reference, with `rail.<k>.holds` beneath. It is never a bare bulleted list. Test: More at 390 px draws Projects, People and Settings as rows. Control: no `<ul>` without a class.

**screens-daily (T48-72)** (asked: R14, R17, R10, R12)
- **R21** = CL for `home`, `queue`, `finder`, `find-in`, `answers` and `projects`.
  - `finder` draws no empty hold tray.
  - `find-in` opened with no scope draws `interface-shell` R61's "Nothing is here" with the way back.
- **R23** (T48; K3250; walk rows 3, 4, 19; DEC-218, DEC-219; amends R1, R9, R10, R11, R14, R17):
  - **The doors.** Home's "What happened?" draws each door as the design's card (`mk-door`: its name and hint, with the sixth door last). Pressing a door opens its offer in place: its scripts (each started by `cs.wizard`), the matching work, and "Start a project". Scripts' names are never drawn inline under the doors.
  - **Starting a project.** "Start a project" (on Home and on `projects`) opens its title field on press, as the act's own words (DEC-88). It is never an always-open field. `projects` says its definition once, as its purpose, and repeats it in no section.
  - **The name.** Home's heading is the group's name, or "Your group" (`shell.group.unnamed`) while none is set, never the slug.
  - **A new group.** Its home is as R17 draws it: that it is ready, its first steps, and "What happened?". To an administrator, while the group has no name, "Name your group" (`home.first.name`; interim, for UX-DESIGN) leads the first steps and opens `group`.
  - Test: pressing a door opens its offer, and no script name is drawn before that. Control: a named group draws its name, and no "Name your group" step.

**screens-settings (T48-71)** (asked: R5, R16, R17)
- **R28** = CL for every screen of the module. It covers `notes`' "You have kept no notes yet", `group`'s "has not described itself" and "No website is recorded", and `places`' "Offices and seats: none", none of which is drawn.
- **R29** (T48; K3250; row 11; amends R1, R12) `members`' counts are counts of the rows drawn (members, administrators and invitations, each by its status as listed), so a count never disagrees with its list. An empty cell draws nothing. Test: five rows with two administrators read "Administrators: 2". Control: a member with no expertise shows no "Expertise".
- **R30** (T48; K3250; row 13; amends R5) While nothing serves the member, `connect` asks one choice first (`cs.choice`: "My Claude subscription", "An API key" or "Not now"), with the subscription preselected (DEC-156's order). It draws only the chosen path's steps; "Not now" draws nothing more. Test: choosing "An API key" draws only its field. Control: the subscription path draws no key field.
- **R31** (T48; K3250; walk C8, row 16; amends R3, R16, R18) Every language is shown by its name in the member's language, on `account`, `group` and `translations`. A tag such as `en-US` is never shown or typed: it is chosen by name. `translations` never offers the group's source English as a language to translate into. Each word's row shows its English and its meaning, never its key. A member who is not granted sees the refusal's own words alone (`interface-shell` R61). Test: `translations` lists "Spanish" and not `es`. Control: no row shows a `screen.` key.
- **R32** (T48; K3250; row 9; amends R17) `settings` draws its sections as the design's link list (`mk-links`): each has its icon and its screen's name as the reference, with its purpose beneath, and the two never run together. Test: each section's name and purpose are separate boxes.
- **R33** (T48; K3250; walk C8) A value recorded at setup or by the system (`by` the founder's bootstrap, a seed, or a machine credential) is drawn as "set at setup" (`settings.set.setup`; interim, for UX-DESIGN), never as a credential's name such as `admin`. Test: the slug's history row reads "set at setup".

**screens-intake (T48-85, new)** (asked: R5, R14, R15, R16)
- **R17** = CL for `capture`, `held`, `archive`, `open-file` and `inbox`.
- **R18** (T48; K3250; row 12; amends R1, R14, R16) `capture`'s three tabs are the design's underlined tab bar (`mk-tabs2`), and its acts are one act row (`mk-acts`). "Watch this address" and "Check it now" join that row once the address has a document. No "Watching for changes" section is drawn before anything is captured. Test: before a capture, no watch section. Control: after one, the two acts are in the act row.
- **R19** (T48; K3250; row 14; amends R4, R13) `held` draws "Set aside" only when it holds something, and every read leaves "still loading" by answering or failing (`interface-shell` R10). The unfiltered `heldcaptures` read that stalled on `biosmoke7` is traced at START to its cause and fixed where the cause lies. Test: an empty set-aside list is not drawn. Control: a read that never answers is drawn failed at the shell's limit.
- **R20** (T48; K3250; row 20; amends R5, R15) `archive` and `open-file` opened bare or not found draw `interface-shell` R61's "Nothing is here" with the way back, and never "Name an archive to open" or "Name a file to open". Test: each screen bare.

**screens-inquiry (T48-73)** (asked: R3; shell R35)
- **R20** = CL for every screen of the module.
- **R21** (T48; K3250; walk C7, row 6; amends R1, R3, R14) `project`, `question`, `projectai` and `document` mark their subject read `subject: true`. Bare or not found, each draws only "Nothing is here" (`interface-shell` R61): no empty heading, refusal blocks or live forms. Test: each screen bare.
- **R22** (T48; K3250; row 7; amends R3) "Open the original" links `open-file` by the capture's SHA-256, never by the bundle id. A document with no capture digest draws no such link. Test: the link carries the digest. Control: no digest, no link.

**screens-investigate (T48-74)** (asked: R12, R13; shell R27)
- **R22** = CL for every screen of the module. It covers `ties`' "You have listed no tie", which is not drawn and is replaced by the designed empty state with "Add this tie".
- **R23** (T48; K3250; walk C8, row 15; amends R1, R6, R8, R9) No field asks for a record id or content ids. A tie's person, a passage, a party and a proceeding are each chosen by `cs.choice` over the record data that a read answers (`interface-shell` R27). Test: `ties` offers named people. Control: no field's label or help names "record id".
- **R24** (T48; K3250; row 15; amends R2) `explore`'s "Follow" offers the design's five groups (Positions and memberships, Money, Took part, Mentioned together, Same person?), with the first three ticked. Each group sends its kinds, by the group that `affordances`' vocabulary answers for each kind (its R59). No raw kind checkbox is drawn. Test: ticking Money sends exactly the money kinds. Control: no checkbox per kind.
- **R25** (T48; K3250; row 18; amends R12, R13) With nothing followed, `people` draws only its empty state ("follows no one yet", with Add and Capture), and no search, filters or counts. Its words use DEC-221's spelling ("organizations"). Test: the empty fixture shows no search box. Control: one follow draws the full screen.
- **R26** (T48; K3250; walk C7, row 6) `person`, `calculation`, `proceeding` and `standard` mark their subject read `subject: true`, and list `NO_ENTITY` and `NO_CALC` in `ABSENT_CODES` (`interface-shell` R61). Test: a bare `calculation` draws "Nothing is here".

**screens-publish (T48-75)** · **R20** = CL. It covers `cs-note`, which becomes `mk-note`, and `cs-refusal`, which becomes the shell's refusal (R61).

**screens-action (T48-76)** · **R14** = CL. It covers `mk-form`, which becomes `cs.field`, and `mk-done` and `mk-grid`, which become the design's classes or `HOOK_CLASSES`.

**screens-entry (T48-84)**. T48-84's four clauses have no ids yet. This fold takes R12–R14 and merges two of those clauses; the other two (the setup lede, `published` with no id) take R15 and R16 at BOB's wording.
- **R12** = CL for `front`, `tour`, `forgot`, `reset`, `setup` and `join`. It covers `cs-codes` and `cs-shown`, which become the design's classes or `HOOK_CLASSES`.
- **R13** (T48; K3240, K3250; rows 4, 10; amends R1) At desktop widths `front` draws the design's two columns (`mk-frontgrid`): the group's page on the left, and the sign-in card (`mk-signin`) on the right, visible without scrolling at 1280 px. At the phone width it is one column. Its head (`mk-fronthead`) shows the logo or monogram and the group's name in the serif title, or "Your group" while none is set, never the slug. Test: at 1280 px the sign-in's box lies above the fold. Control: an unnamed group shows no slug.
- **R14** (T48; K3250; walk C8, row 4; amends R6) `setup`'s first part after the codes asks the group's name (`groupnameset`), before any other part, and says where the name shows. Skipping it leaves "Your group", and Home's first step "Name your group" (`screens-daily` R23). Test: the name is the first part. Control: a skip keeps the step open.

**wizard-scripts (T48-55)** (asked: screens-wizards R1)
- **R39** (T48; K3250; row 17; amends R10) `wizards` also answers every active member with the scripts offered to her: Civicsmith's library and every approved group script she may run, with name, whose, `based_on` and the finished count. The other states (drafts, submitted, withdrawn, retired, broken, proposals) stay as R10 answers them. Test: a member who owns no project sees the library. Control: her `state: "draft"` read answers only her own drafts.

**affordances (T48-57)**
- **R59** (T48; K3250; row 15) The vocabulary's `connection_kinds` answers each value's `group`, one of `pos`, `part`, `money`, `ment` and `same` (the design's five), from a frozen map in this module covering every kind the connection registry holds. Test: totality over the registry. Control: an unmapped kind fails the test.

**journey-check (T48-80)**. This is decision (h). The "Limits" of the walk say the credential walked was a member. journey-check owns the release check (its R1 arm (b)).
- **R5** (T48; K3250; walk "Limits"; rulings-active §4; amends R1 (b)) The live arm reaches the instance directly: it uses no agent proxy (Chromium `--no-proxy-server`, or `NO_PROXY` for the host). It signs in as the administrator and as a member. It fails unless `whoami` answers the administrator with `administer: true` and the member with `false`. Each role walks every working screen it may open, including the acts only an administrator is drawn. Test: a member credential given as the administrator fails the walk. Control: correct roles pass.
- **R6** (T48; K3250; amends R2) Before a release is called ready, the live arm puts each working screen beside the design mock's drawing of that screen and state (`layouts.html`, built from `screens/mock-*.js` at `ASSETS_COMMIT`), at 1280 and 390 px, with screenshots in pairs as WALK-084 #2 made them. It fails on any of:
  - a page wider than the viewport;
  - at 390 px, tabs that are not at the viewport's foot;
  - a test band narrower than the frame;
  - an element whose class no loaded stylesheet defines;
  - text matching a slug, a language tag, a record id or a refusal code.

  The pairs are put to BOB, who records the comparison in a K before the release is called ready. Test: a fixture page that overflows fails. Control: a fixture matching its pair passes.

---

## 5. Plan entry lines

Each "also" line joins the existing entry and adds to it. The two new entries are T48-85 and T48-86.

- **T48-55 · wizard-scripts** also · (K3250; walk row 17) R39: `wizards` lists the offered library to every member · text BOB's.
- **T48-56 · op-grades** also · (K3250; walk C9, row 21) R42: `MARKS`, the design's weight for each rungless act, which grades nothing · text BOB's.
- **T48-57 · affordances** also · (K3250; walk row 15) R59: each connection kind's design group in the vocabulary · text BOB's.
- **T48-68 · interface-assets** also · (K3250; walk C1) R7: `shell.css` generated from `page.src.html`'s product rules, with phone rules under the 760 px query, regenerated with the visual language · text BOB's.
- **T48-69 · interface-shell** also · (K3250; walk C1–C4, C7–C9, rows 1, 2, 4, 6, 8, 9, 11, 16, 20, 21) R53 built, with R56 (two stylesheets, an undefined class refused), R57 (phone masthead, pinned tabs, fixed-height frame, the band's words), R58 (band from first paint), R59 (marks in the title row), R60 (no zero, no slug, the level's own name), R61 (absence codes, a refusal's own words), R62 (field and rows as designed), R63 (More as rows) and R64 (rungless marks) · text BOB's · after T48-68.
- **T48-70 · screens-wizards** also · (K3250; walk C3, C5, rows 8, 17) R11: one chip, never zero, filtered by what the viewer can do; R12 (CL) · text BOB's.
- **T48-71 · screens-settings** also · (K3250; walk C1, C4, C5, C8, rows 9, 11, 13, 14, 16) R28 (CL), R29 (counts), R30 (the connect chooser), R31 (languages by name, no keys), R32 (the link list), R33 (no credential names) · text BOB's.
- **T48-85 · screens-intake** · (K3250; walk C1, C5, rows 12, 14, 20) R17 (CL), R18 (the tab bar and act row, Watch after a capture), R19 (no empty Set aside; the `heldcaptures` stall traced and fixed), R20 (bare `archive` and `open-file`) · text BOB's · merges after screens-settings.
- **T48-72 · screens-daily** also · (K3250; walk C1, C5, C6, C8, rows 3, 4, 5, 14, 19, 20) R21 (CL), R22 (source notices keyed, one per kind with a count), R23 (door cards, the title on press, "Your group", the name as a first step) · text BOB's.
- **T48-73 · screens-inquiry** also · (K3250; walk C1, C7, rows 6, 7) R20 (CL), R21 (the subject guard), R22 (the original by its SHA-256) · text BOB's.
- **T48-74 · screens-investigate** also · (K3250; walk C1, C5, C7, C8, rows 6, 14, 15, 18) R22 (CL), R23 (no id fields), R24 (explore's five groups), R25 (people's empty state), R26 (the subject guard) · text BOB's · after T48-57.
- **T48-75 · screens-publish** also · (K3250; walk C1) R20 (CL) · text BOB's.
- **T48-76 · screens-action** also · (K3250; walk C1) R14 (CL) · text BOB's.
- **T48-84 · screens-entry** also · (K3250; walk C1, C8, rows 4, 10) R12 (CL), R13 (two columns; the name, never the slug; merges T48-84's heading and fold clauses), R14 (the name asked first at setup); T48-84's remaining clauses take R15 and R16 · text BOB's.
- **T48-86 · queue-producers** · (K3250; walk C6, C8) R40: source items carry `title`, and their summary and detail name no id or mechanism · text BOB's · merges before queue.
- **T48-77 · control-plane** also · (K3250; walk C2 (a)) R95: `/app` composed with `testInstance` · text BOB's.
- **T48-80 · journey-check** also · (K3250; walk "Limits") R5 (the administrator and the member, each verified, reached directly), R6 (each live screen against the design mock before a release is called ready) · text BOB's · last in L11.

**Changes to the plan's L11 text.**
- **Merge order:** add queue-producers after machinery-producers, and screens-intake after screens-settings.
- **Counts:** L11 rises from 26 to 28, for **85 jobs**.
- **Rule 5 (8):** release 0.84.0's acceptance is withdrawn (K3250: not ready). The next release follows L11, with journey-check R5 and R6 green.

---

## 6. All entries

| module | T48 | layer | ids |
|---|---|---|---|
| wizard-scripts | 55 (also) | L11 | R39 |
| op-grades | 56 (also) | L11 | R42 |
| affordances | 57 (also) | L11 | R59 |
| queue-producers | **86 (new)** | L11 | R40 |
| interface-assets | 68 (also) | L11 | R7 |
| interface-shell | 69 (also) | L11 | R53 (built), R56–R64 |
| screens-entry | 84 (also) | L11 | R12–R14 |
| screens-wizards | 70 (also) | L11 | R11, R12 |
| screens-settings | 71 (also) | L11 | R28–R33 |
| screens-intake | **85 (new)** | L11 | R17–R20 |
| screens-daily | 72 (also) | L11 | R21–R23 |
| screens-inquiry | 73 (also) | L11 | R20–R22 |
| screens-investigate | 74 (also) | L11 | R22–R26 |
| screens-publish | 75 (also) | L11 | R20 |
| screens-action | 76 (also) | L11 | R14 |
| control-plane | 77 (also) | L11 | R95 |
| journey-check | 80 (also) | L11 | R5, R6 |

## 7. Could not place

1. **Row 14, the stalled `heldcaptures` read.** Its cause is not yet known. If it lies in `capture` (L3, closed), the fix cannot wait for L11's job, so the route is a CHANGE opened now. If it lies in the plane's composition, it is T48-78 (also). intake R19 makes the trace part of the START.
2. **Row 17, the cause.** It is probably `wizard-scripts` R10's owners-only listing, but that is not confirmed live, because the walk was a member's. R39 fixes it either way. If the empty library has another cause, it is found at T48-55's START.
3. **Decision (f), "instance-setup asks for the name".** `instance-setup` holds no page since its R83. The ask is placed with entry R14 and daily R23, and instance-setup is unchanged (open point 3).
4. **The classes defined nowhere, design included** (`cs-meta`, `cs-refusal`, `cs-untested`, `mk-sorts` and the others in the C1 table). No generated rule can style them. Each one's fate is settled in its own job: the kit, a design class, or `HOOK_CLASSES` (open point 1).

## 8. Open points for BOB (none is Bob's)

1. **Classes the design does not draw.** Recommendation: each job maps them to the kit or a design class. Only where nothing fits does interface-shell carry a style in `STYLE`, named in R56's list, with an ASK to UX-DESIGN to draw it. The shell never carries a hand copy of a design rule.
2. **`shell.css` as a superset.** Decision (a) asks for rules "for every class a screen module emits". `interface-assets` comes before the screens and imports nothing (R4), so a subset chosen by emitted classes would make it depend on later modules. Recommendation: carry every product rule of the page, as R7 does, and let R56's coverage check enforce the "emitted" side. This is a BOB detail that changes no ruling's meaning.
3. **Decision (f)'s placement.** Recommendation: as written. The setup screen (`screens-entry` R14) and Home's first step (`screens-daily` R23) ask for the name, and `instance-setup` keeps R6 and R10 unchanged.
4. **C9 friction.** R64 gives a mark only. The design weighs `acquire` and `captureupload` as Reasoned, while R11 runs them on press:
   - `captureupload` already has a statement, which serves as its reason (DEC-88);
   - `acquire` has none, and asking a reason in order to fetch an address would be friction a real user meets.

   Recommendation: draw the mark and keep the friction, and ASK UX-DESIGN whether `acquire` is Reversible (it only fetches; the result waits in Held).
5. **Extending DEC-219 beyond Home.** DEC-219 (3) was about Home. Applying it to every screen is BOB's reading of K3052 (decision (d)), and it keeps the designed screen-level empty states (people, queue, find). It does not change what either ruling means. Recommendation: record it in `rulings.md` with this fold.
6. **One channel act to UX-DESIGN.** It would cover:
   - the interim words: `shell.band.working`, `shell.group.unnamed`, `wizard.marks.chip`/`.chip.one`, `wizard.mark.recommended`, `queue.source-*` and `queue.source.detail`/`.untitled`, `home.first.name`, `settings.set.setup`;
   - the classes the design does not draw (point 1);
   - `acquire`'s weight (point 4).

   Recommendation: send it with the L11 fold, before L11's START.
7. **0.84.0.** Recommendation: withdraw rule 5 (8)'s acceptance (K3250 says it is not ready), and cut the next release only after L11 merges and journey-check R5 and R6 pass.
