# setup-page (T46)

**Status** · session_01D7vhiucs6Yq1H95ANNK4SF · depth 2 · WORKING · handled B2

## J1 · QUESTION

R31 says the record's `w` is "the `op=whoami` answer". The page has always stored in `w` the name the session signed in as (`WHO`: `"admin"`, or the member's handle typed at sign-in or answered by `enroll`), written at sign-in before any `op=whoami` is sent (index.mjs:1062), and read back as that name (:921). The interface draft's I4 cites exactly those lines as the shape, and interface-shell R3 sends its own `op=whoami` on load, so it needs no stored answer.

**My reading (building on it now):** `w` is the name signed in with, as today (a string, `"admin"` or the handle), not the `whoami` answer object; R31's test pins that. If you meant the whoami answer itself (an object), say so and I will write it after `whoami` answers and keep reading the name from it.

## Completion (SETUP-PAGE #5)

**Read.** My requirements (`build/requirements/setup-page.md`) and my code (`bio-plane/src/setup-page/index.mjs`, 2,580 lines at START) read whole by me, with `fixture.mjs`, my plan entry T46-48 and the plan's rules, interface §5 I4 and §7 Q1, trial §1.2 and §3.2, `instance-setup` R80, R81 and `interface-shell` R3, R25 (the parts naming this module), and layer 11's contract. The reading set was over the 600 KB limit (742 KB, B1), so two helpers in this session each read in full and wrote a digest citing file:line or requirement:line (K2032, mechanics §17 (3)): one over my 12 test files (3,110 lines), one over the public parts of my 8 Uses. Each test file I changed was then read by me in the parts I changed and their helpers. The sources remain binding.

**Entries applied (T46-48).**
- **R30 amended.** The template no longer holds any sentence saying files are scanned. The script draws the step's opening (`<P>-st-built`) and its skip sentence from `op=bootstrap`'s `parts`:
  - scanner `true`: DEC-182 (6)'s words exactly, and "…and nothing needs adding."
  - `false`: the interim words for no scanner.
  - `null`, no `parts`, or `bootstrap` not answering: "Whether your group's Civicsmith has a file scanner installed could not be read just now." It never says that none is installed.
  - The empty tools list's "The built-in scanner and the safe view work without any." is shown only with a scanner present.
  - The healthy panel lists each part `parts` answers (`#p-parts`: signin, scanner, safe_view) as installed, not installed or "could not be read", in member words. It says one sentence when `parts` is unread.
- **R31.** `SESSION_STORE_KEY = "bio-session"` is exported and injected into the script; the literal no longer appears anywhere else in the module or its tests. The record is `{t, e, c, w}` in `sessionStorage` only, and a 401 removes it. `w` is the name signed in with, per J1 and BOB's B2 (K2996). R31's text on the tranche still reads "the `op=whoami` answer" until that fold lands.
- **R32.** `HOME_HREF = "/app"` is exported.
  - A sign-in through `op=login` writes the record (with `c` from `bootstrap`) and then goes `location.assign("/app")`.
  - Enrolment's sign-in sends `memberlanguageset` under the new session and then goes to `/app`. The language is sent whatever its answer, as R32 reads ("once R22's language has been sent").
  - The panel offers `<a id="go-app" href="/app">Open your group's Civicsmith</a>` before its settings buttons.
  - A saved session shows the panel and does not leave.
  - The claim keeps its section and offers the same link (`#cl-app`) after its steps. "Go on" still opens the panel.
- **R33.** A notice (`#test-instance`) sits under the group line, above every section. It is shown with the interim words only while `bootstrap` answers `test_instance === true`, and it holds no act. The invitation and join-link first views read `bootstrap` for it; that read carries no body, query or session, so R2 holds. The R2 tests now check that read and judge every other call as before.

**A reading of my own requirements (no change asked).** R27 says the guide "reads nothing", so the guide reached by its address on load reads no `bootstrap`. R33's notice is drawn when Back opens the page's own start. That start is the first view of the page proper, so R27 is kept.

**Own code read, flaws (P8).** The literal session key was spelled three times in the script; it is now one exported name. Every test that pinned `"bio-session"` reads the export. No other flaw found in the code I read.

**Found in other modules (REPORT).**
- `jurisdictions`: `COUNTERPARTY_LEVELS`, which this page imports (R5), is named in no Provides of its public part.
- `capture`: `INFORMATION_GRAMMAR`, which my tests import, is likewise named in no Provides.
- `file-safety`: `onOwnServers`, which this page imports (R30), is likewise named in no Provides.
- `file-safety`: R42's row says "no virus scanner"; my R30 interim says "no file scanner". These are two wordings for the same absence, and the design stream's words should reconcile them.
- No generated artifact is staled beyond rule 5 (4). The plane bundle embeds this page.

**Deferred.** None.

**Tests and checks.**
- `node --test test/m/setup-page/` (bio-plane): tests 87, pass 87, fail 0. That includes the new `handover.test.mjs` (R31, R32, R33, each with its control) and a new R30 (T46) test.
- Mutations of each new behaviour each turn one test red.
- Users of the page: `instance-setup/`, `store-door/dispatch`, `admission/`, `control-plane` t35-door, t37-door, r53-routes: tests 226, pass 226, fail 0. No layer tests are named in the manifest.
- `format`: 159 modules, 0 failures. `architecture setup-page`: 14 files, 0 failures. `coverage setup-page`: 33 of 33 live ids named by a test, 0 failures. `ownership setup-page tranche/T46`: 10 files, 0 failures.
- `checks/run.mjs`:
  - architecture: 2968 files, 0 failures.
  - coverage: 15 failures, all other L11 modules' ids not yet met (rule 5 (1)); none is setup-page's.
  - channels: 0 failures.
- Merge note: I use instance-setup R80/R81's `test_instance` and `parts`. I test against my own interface and will merge `tranche/T46` when BOB announces instance-setup's merge (doubt 14).

Size (session_01D7vhiucs6Yq1H95ANNK4SF): test runs 11, module lines 2657

## J2 · REPORT

Found while reading my Uses' public parts (none blocks me):
- `jurisdictions`: `COUNTERPARTY_LEVELS`, which setup-page imports (R5), is named in no Provides of its public part.
- `file-safety`: `onOwnServers`, which setup-page imports (R30), is named in no Provides; R42's row says "no virus scanner" where setup-page R30's interim says "no file scanner" (the design stream's words should reconcile them).
- `capture`: `INFORMATION_GRAMMAR`, which my tests import, is named in no Provides.
