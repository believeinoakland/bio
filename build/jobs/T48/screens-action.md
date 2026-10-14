# screens-action (T48)

**Status** · session_01Y4r4SkWUhFeH2s4ocMcMLc · depth 2 · COMPLETE · handled B3

## Completion

**Read** (whole): `build/requirements/screens-action.md`; `build/plan/current.md` T48-76 (both lines); B1 START; the module's nine source files; the tests naming a requirement I changed (`action`, `contract`, `help-records`, `matter`, `plan`, `request`, `start-send` tests and `page.mjs`); `interface-shell` R5, R8, R10, R19–R21, R35, R55, R56 and the kit's `act`, `state`, `field`, `choice`, `checks`, `later`, `call` (`browser.mjs`); `filings` `filingRead` and `#fill`, `action-plans` `planAsk`, `action-holds` `pressureFor` (the answers I draw); `screens-inquiry`'s `assistant.mjs` (the `cs.later` pattern, R8). Not read: `build/layers.md` (the screen contract is `interface-shell` R21; nothing in the layer's contract changed), generated artifacts, `words.mjs` beyond the rows I touched.

**Entries applied (T48-76)**
- **R11** (`filingread`): a draft prepared and not approved is read again on load, once per filing, by `readFiling` (page memory, as `screens-inquiry` R8); it draws the text, blanks with their sources, unfilled blanks with why, the member's fills labelled hers, the advisory and the offers (`counsel_packet`); nothing is prepared by reading. `NO_SUCH_FILING` draws "Nothing is here" (`shell.unavailable.nothing`); a failed read draws failed and offers no approval.
- **R12** (`action` R102, `pressurefor`): the action heads the screen with its `title` (a null draws the screen's own name, never "untitled"); the path's project step comes from the `project` the `action` read answers (the `file` read of `bundle.md` and its regex are gone, here and in `request`); the pressure marks draw as "Pressure on this action" with where each arrived, paged by `after` until no cursor follows (at most 20 pages); a mark naming another action is not drawn.
- **R13** (`planask`): "Ask the assistant for options" is `planask` (label `act.optionpropose.label.plan`), reachable only; the run draws running and is re-read by `cs.later` every 10 seconds (stops when ended or after 60 polls); when it ends the tray (`planproposals`) is read again; `existed: true` draws the run already asked. `optionpropose` and its four fields are no longer drawn.
- **R14** (the common line): `mk-form` wrappers gone (the kit's fields stand alone); `mk-done` became `mk-note`; `mk-grid` removed; the bare `<label>`/`<select>` fields (office, law, matter, start-kind's breach tick) are `cs.choice`/`cs.checks`; every empty sentence inside a section is gone and an empty section is not drawn (plan, action, matter, help-records, request); a closed, empty plan draws its one empty state (`screen.plan.empty`); the pressure section and the "Checks" count are drawn only when held.

**Found and fixed in my own module (P8):** a member's fill arrives with `label` an object (`member_fill`), and the blank list drew it as "[object Object]"; it now draws a word saying the preparer wrote it, not read from the record, and a filled blank names its `source` string. The pickup/`prepared` sentence that stood in for a draft nobody could read is gone (the draft is read).

**Decisions of mine, for BOB to overrule (reported once, not asked):**
- The "one designed empty state" (R14) is drawn only where a screen can have nothing: a closed plan with nothing in it. Every other screen of this module always holds an act or a form, so no section is empty and none draws a sentence for it. A request that asked for offices and found none still says so (feedback to her act, not an empty section).
- `act.planask.does` is not a `words.json` key (the file has `act.optionpropose.does`); I hold an own row with the same English until `words.json` keys it (REPORT to BOB).
- The scenario form's option check boxes carry the options' own summaries (record data) and `cs.checks` takes word keys only, so that one group stays a hand-drawn `fieldset.cs-field`. It uses only defined classes. A data-labelled `cs.checks` (as `cs.choice` has) would let it use the kit: an `interface-shell` improvement.
- `cs.rows` draws `cs-pickc` internally (R14's list renames it `mk-pickc`); that is `interface-shell`'s job's change, and my class test exempts it by name.

**Deferred:** none.

**Depends on unmerged same-layer work (merge order puts both before me):** `op-declarations` (T48-63: `planask`, `filingread`, `pressurefor` in `OPS` and the session sets) and `interface-shell` (R55: `planask` a re-point on `plan`). Until both are on `tranche/T48`, `interfacePage(SCREENS)` throws "act names planask, which OPS does not hold" and every page test of this module fails at `checkScreens`. I ran the module's tests in a scratch worktree with those two edits stood in (a three-line change to each file, never committed): 68 pass, 0 fail. After they merge, `tranche/T48` merged into this branch and a re-run should show the same; send CHANGE when they are in. R14's class test reads the design page's product rules from `docs/` as the stand-in for `shell.css` (`interface-assets` R7, not yet merged).

**Tests and checks:** `node --test bio-plane/test/m/screens-action/` in the scratch worktree 68 pass, 0 fail (53 before this job). format 0 failures; architecture 0 failures (17 files); coverage 14 of 14 live ids named, 0 failures; ownership 0 failures (18 files). `checks/run.mjs` over the product: format 0, architecture 0, ownership 0; coverage 21 failures, none in screens-action.

Size (session_01Y4r4SkWUhFeH2s4ocMcMLc): test runs 14, module lines 1626

## J1 · COMPLETE

T48-76 applied: R11 (filingread re-read on load), R12 (title, project step from action, pressurefor marks paged by after), R13 (planask as a planning run, re-read by cs.later, tray re-read at the end), R14 (classes, cs.field/cs.choice, no empty sections or zeros). 68 pass in a scratch worktree with op-declarations (planask, filingread, pressurefor) and interface-shell R55 (planask re-point on plan) stood in; on the branch as it is every page test fails at checkScreens until those two merge. Please send CHANGE when op-declarations and interface-shell are merged; I will merge tranche/T48 and re-run. REPORTS: (1) words.json has no act.planask.does; I hold an own row with act.optionpropose.does's English until it is keyed. (2) cs.checks takes word keys only; the scenario form's record-data options stay a hand-drawn fieldset.cs-field (interface-shell improvement: data options like cs.choice). (3) cs.rows draws cs-pickc internally (R14 renames it mk-pickc): interface-shell's. Fixed in my module: a member's fill label (object) drew as [object Object]. format/architecture/coverage/ownership 0 failures; run.mjs coverage failures are other modules'. Record: build/jobs/T48/screens-action.md.

## J2 · COMPLETE

B2 applied: tranche/T48 (op-declarations merged) merged into my branch. 68 pass, 0 fail with only interface-shell R55's one line (plan: planask in RE_POINTS) stood in, uncommitted and restored. On the branch as it is, 62 tests fail at checkScreens with 'planask is not the registry's for plan, nor a named re-point' until interface-shell merges; nothing else is red. Reports from J1 stand.

## J3 · COMPLETE

B3 applied: tranche/T48 (op-declarations, interface-shell) merged, no stand-in left. R56 flagged one class (src, help-records' sources line): now mk-note. node --test test/m/screens-action/: 68 pass, 0 fail. format, architecture, coverage (14 of 14), ownership: 0 failures. Nothing red. Test change: crumbs are read as the shell now draws them (nav.cs-crumbs children); R14's class test allows the shell's HOOK_CLASSES. Reports from J1 stand (act.planask.does not in words.json; cs.checks has no data options).
