# screens-wizards (T47)

**Status** · session_0118dwXjnwwYydM1sWbE5P8u · depth 2 · WORKING · handled B1

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
