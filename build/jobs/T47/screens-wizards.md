# screens-wizards (T47)

**Status** · session_0118dwXjnwwYydM1sWbE5P8u · depth 2 · WAITING ON BOB (J3) · handled B3


**Progress** (kept above the entries) · Built at 6d1d24e0b5: `bio-plane/src/screens-wizards/` (`index.mjs`, `library.mjs`, `guide.mjs`, `words.mjs`) and `bio-plane/test/m/screens-wizards/` (`kit.mjs`, `fixtures.mjs`, `standin.mjs`, `library.test.mjs`, `guide.test.mjs`, `words.test.mjs`). 26 of 27 tests pass; the one red is R8's path (Settings › Wizards), which waits on interface-shell R28's `PATHS` entry. The guide is tested over a stand-in for the shell's half of the J2/J3 contract (K3143); next: on interface-shell's merge (CHANGE), merge `tranche/T47` and re-run the guide's walk over the real page, then COMPLETE.
## J1 · QUESTION

The GUIDE contract between this module and `interface-shell` (its R31; my R2–R7) is not written anywhere, and INTERFACE-SHELL #1 is building its half now. My best reading, which I am building to; please confirm it or relay it (or interface-shell's own shape) so both halves meet:

1. `GUIDE` is one object, every function self-contained as R21's screens are: `{words, parts?, ops, render, marks, start, entered, pressed, ring}`. `ops` lists every op the guide calls through `cs.call` (`wizardsat`, `wizardread`, `wizardprogress`, `wizarddraft`, and the machine-draft ops `writinghelp`, `whatchangedpropose`, `escalationreasondraft`, `groupdescriptiondraft`), so the page carries their gate rows (R12) and `checkScreens` checks them against `OPS`.
2. The shell keeps ONE guide instance for the page's life (not reset per route): `view = {ui, me, reachable, screen, subject}`, `view.ui` in page memory only (my R6), `screen`/`subject` the current route. `cs` is the kit bound to the guide instance (`cs.set` redraws).
3. `render(cs, view)` → the dock panel's HTML, or `""` when no wizard runs. While it answers non-empty, the dock holds the guide in place of the assistant's panel (R31), drawn whether or not the assistant is reachable, with its own close control absent (Stop is the guide's).
4. `marks(cs, view)` → HTML the shell draws at the top of every working screen's main area, directly under the path (each screen's wizard marks, R2; Home's welcome offers, R7). Called on each draw.
5. `start(cs, view, {script, version, at?, joined?})`: what `cs.wizard(script, version, o)` calls; `script` an id (or `{id, version, name, start}` as `startfrom` answers it).
6. `entered(cs, view, {screen, subject})`: called after each route change once the main screen's reads have settled (none loading), so the guide reads `wizardsat` for that screen and rings the step's control (`cs.ring` answers false until the control is drawn).
7. `pressed(cs, view, {op, screen})`: called on every act press on the main screen (op and screen only, never a value; R31); the guide ignores it unless recording.
8. `ring(cs, view)`: Alt+Shift+W.
9. R7 "after join": I read it as `screens-entry` calling `cs.wizard("WIZ-7db08189cc0e58c3", null, {joined: true})` at join's end, after `login`; the guide then sends `wizardprogress` `start` and `step` 3 once, runs nothing, and Home shows the welcome mark continuing at step 3 ("Not now" keeps it). If you would rather the shell or screens-entry send those two counts, say so.

Until interface-shell merges, I test the guide over a stand-in kit and the `wizards` screen over the real page; I re-run the runner's tests over the real page when you announce interface-shell's merge (CHANGE).

## J2 · QUESTION

Replaces J1 (J1's points 1–9 stand, amended and extended here).

1. `GUIDE` is one object, every function self-contained as R21's screens are: `{words, parts?, ops, acts, render, marks, start, entered, pressed, ring}`. `ops` lists every op the guide reads through `cs.call` (`wizardsat`, `wizardread`, `wizardprogress`, and the machine-draft ops `writinghelp`, `whatchangedpropose`, `escalationreasondraft`, `groupdescriptiondraft`), so the page carries their gate rows (R12) and `checkScreens` checks them against `OPS`; `acts` is R21's act list for the guide's own buttons (`wizarddraft`, saving a recording, R3), drawn by `cs.act` in `render` and handled by the shell as a screen's acts are (weight, friction, refusal beside the act).
2. The shell keeps ONE guide instance for the page's life (not reset per route): `view = {ui, me, reachable, screen, subject}`, `view.ui` in page memory only (my R6), `screen`/`subject` the current route. `cs` is the kit bound to the guide instance (`cs.set` redraws).
3. `render(cs, view)` → the dock panel's HTML, or `""` when no wizard runs. While it answers non-empty, the dock holds the guide in place of the assistant's panel (R31), drawn whether or not the assistant is reachable, with its own close control absent (Stop is the guide's).
4. `marks(cs, view)` → HTML the shell draws at the top of every working screen's main area, directly under the path (each screen's wizard marks, R2; Home's welcome offers, R7). Called on each draw.
5. `start(cs, view, {script, version, at?, joined?})`: what `cs.wizard(script, version, o)` calls; `script` an id (or `{id, version, name, start}` as `startfrom` answers it).
6. `entered(cs, view, {screen, subject})`: called after each route change once the main screen's reads have settled (none loading), so the guide reads `wizardsat` for that screen and rings the step's control (`cs.ring` answers false until the control is drawn).
7. `pressed(cs, view, {op, screen})`: called on every act press on the main screen (op and screen only, never a value; R31); the guide ignores it unless recording.
8. `ring(cs, view)`: Alt+Shift+W.
9. R7 "after join": I read it as `screens-entry` calling `cs.wizard("WIZ-7db08189cc0e58c3", null, {joined: true})` at join's end, after `login`; the guide then sends `wizardprogress` `start` and `step` 3 once, runs nothing, and Home shows the welcome mark continuing at step 3 ("Not now" keeps it). If you would rather the shell or screens-entry send those two counts, say so.

Until interface-shell merges, I test the guide over a stand-in kit and the `wizards` screen over the real page; I re-run the runner's tests over the real page when you announce interface-shell's merge (CHANGE).

Further points of the same contract:
10. Recording (R3) starts from the `wizards` screen: its "Record a new wizard" act calls `cs.wizard(null, null, {record: {project}})` and sends nothing; the guide then records each `pressed` pair and, at the member's save, sends `wizarddraft` `{project, name, recorded}` through its own act (point 1).
11. R7's device note ("the finish kept on the device, never sent") needs storage a self-contained function cannot reach. I ask the kit for `cs.kept(key)` / `cs.keep(key, value)`: the browser's `localStorage` under a `cs-guide:` prefix, wrapped as R26's (an unreadable or unwritable storage answers null, keeps nothing). The guide keeps only `done:<script>:<member>` = "1"; never a run's place (R6).
12. R4 places a draft "in the field of the step's act". The guide knows the act, not the screen's field id. I ask the kit for `cs.fieldOf(op)`: the id of the text field (a `textarea`, else a text `input`) that the control `data-act=op` sends, found as the nearest such field before the control inside its enclosing section or row panel, or null; then `cs.fill(id, value, {label})` (R27) with `label` the drawn draft label, which the shell draws beside the field (as `cs.field`'s `draft` option). With no field found, the guide shows the draft in the dock with "Copy it into the field yourself" and fills nothing.
13. R4's "a step whose act is one the assistant may not help with is never given a machine draft (wizard-scripts R24, R12)": the set is `wizard-scripts`' `helpRefusedActs({machineRefused, irreversible})`, built from `op-grades`' tables, and my Uses name `wizard-scripts` for tests only and not `op-grades` at all. My best reading: the offered scripts already pass R12 (which refuses such a step, `WIZARD_STEP_CONCLUDES`), and the op itself refuses it (`WRITING_HELP_REFUSED`), so the guide asks only on steps the plane served and places nothing on a refusal; it holds no copy of the set. If you want the guide to filter too, I need `wizard-scripts` (and `op-grades`) as source edges.

## J3 · QUESTION

Adds point 14 to J2 (J2 otherwise stands; it replaced J1).

14. The guide's own controls send no op (Back, Next, Stop, "Show me where", "Draft it", a wizard mark's start, "Not now", removing a recorded pair, stopping a recording), so they cannot be R21 acts. I ask: an element the guide draws (in `render` or `marks`) carrying `data-guide="<control>"` is handled by the shell on click (and Enter/Space) by calling `GUIDE.control(cs, view, control, dataset)`, the element's `data-*` as `dataset`; the shell does nothing else for it.

And one gap I will record as deferred unless you rule otherwise: R4's `{template}` draft ("Draft · from your group's template"). A step names its template by handle (`@records-request`), which only `filing-templates` R26's in-process `offeredVersion` resolves; `op=templateread` takes a template id, and `filing-templates` is not in my Uses. Until an op answers a template's text by handle to a member's session, the guide shows the step's words and the label and fills nothing. Today no offered script carries a `{template}` draft (`wizard-scripts` R22: "Get a record" is withheld), so nothing a member can reach is affected.
