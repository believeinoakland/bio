# journey-check — requirements

**Status** · New in T47 (T47-88; N999, N1004; K3052, K3053, K3054, K3059; folded K3100): a helper module carrying no product capability (K1043), registered in layer 11 last (after `stewards`) with empty `paths` and `tests`, listed under "Helper modules" in `build/layers.md`. Drafted in `build/plan/draft-T47-L11-fold.md` §B, worded here by BOB (P5). Not yet met (T47). Last changed T48 (T48-80: R4 new, the journey runs only when executed directly; N1056; K3192; K3195); marked not yet met (T48). Last changed T48 (K3254, the L11 design fold of WALK-084 #2, K3250: R5 new, amending R1 (b), the administrator and the member reached directly; R6 new, amending R2, each live screen against the design mock before a release); marked not yet met (T48). Last changed T49 (T49-32: R7–R13 new; K3334); marked not yet met (T49).

## Public

### Purpose

The release check: a Playwright walk of journeys 28 and 3 with screenshots, failing on any refusal, old page or missing screen. It is not product: nothing in the plane, the installer or the screens imports it.

### Provides

- **R1** (N1004; K3052, K3053) A Playwright (Chromium) walk, run by `npm run journey` from its directory, in two arms: (a) local, with no account: the installer Worker over the installer's fake Cloudflare account, the hand-over into a plane under Miniflare, then journey 28 (claim, codes, setup, invite, join, codes, a member's first settings, Home, first testimony, sign out, sign in kept, lock, unlock) and journey 3; (b) live, against a named test instance, signing in as the administrator and as a member with credentials read from the environment, never printed, opening `/` and every working screen of the registry.
- **R2** Each step is screenshotted into its output directory (generated, never committed); the walk fails on any `ok: false` not expected by the step, any 4xx/5xx, any page whose script throws, any setup-page or legacy-ui address reached, and any registry screen not drawn, except `site` (N1011, not built in T47) and the treatments DEC-214 (4) names (`dash-home`, `dash-action`, `dash-project`) (K3137).

- **R4** (T48; N1056; K3192 group T) `journey.mjs` runs its journey only when executed directly (a main-module guard: its own file is the process's entry), never on import: importing it starts no walk, opens no browser or server and does not exit the process. Test: importing the module in a test process leaves the process running and starts nothing; control: running it directly starts the walk.

**The design walk folded** (T48; WALK-084 #2; K3250, K3254)
- **R5** (T48; K3250, K3254; walk "Limits"; rulings-active §4; amends R1 (b)) The live arm reaches the instance directly: it uses no agent proxy (Chromium `--no-proxy-server`, or `NO_PROXY` for the host). It signs in as the administrator and as a member. It fails unless `whoami` answers the administrator with `administer: true` and the member with `false`. Each role walks every working screen it may open, including the acts only an administrator is drawn. Test: a member credential given as the administrator fails the walk. Control: correct roles pass.
- **R6** (T48; K3250, K3254 (7); amends R2) Before a release is called ready, the live arm puts each working screen beside the design mock's drawing of that screen and state (`layouts.html`, built from `screens/mock-*.js` at `ASSETS_COMMIT`), at 1280 and 390 px, with screenshots in pairs as WALK-084 #2 made them. It fails on any of:
  - a page wider than the viewport;
  - at 390 px, tabs that are not at the viewport's foot;
  - a test band narrower than the frame;
  - an element whose class no loaded stylesheet defines;
  - text matching a slug, a language tag, a record id or a refusal code.

  The pairs are put to BOB, who records the comparison in a K before the release is called ready. Test: a fixture page that overflows fails. Control: a fixture matching its pair passes.

#### T49 (T49-32)

- **R7** (T49; N1072; K3265, "never shown"; DEC-230 (3)) A walk through every screen, signed in as the founder with a handle held and with none, finds no drawn text naming `admin` as a person's name or handle. There is one exception: DEC-230's step for a founder with no handle (`founder.handle.says`, `founder.handle.later.help`), which says she signs in as admin until she chooses. Test: the walk as stated. Control: a screen fixture drawing `admin` as a name fails it. *(not yet met: T49)*
- **R8** (T49; D29 **M**; amends R2) A step fails on a refusal carried inside an HTTP 200, anywhere in its answer, where the step expects success. That is `ok: false` at any depth, or `started: false`, `dispatched: false`, `found: false` or `withheld` (`walker.mjs`:73 reads only the top level). The refusal a step expects is excused by its code wherever it sits. Test: fixtures of D1's, D3's and D5's answers each fail the step. Control: the expected refusal of a step that tests a refusal passes. *(not yet met: T49)*
- **R9** (T49; K3320, K3324 (2); amends R1 (a)) **The journey as administrator**, each step through the screens' own controls only, with ops called only to observe:
  1. claim with her own handle, and sign in by it;
  2. start a project with a title, and open it;
  3. open a question in it (its first question, `screens-inquiry` R43);
  4. connect an assistant by her own Claude subscription on `connect` (the sign-in, K3347);
  5. capture by address into the question (from its "Add a document"), and capture by upload into the question;
  6. see both held, and vouch for one;
  7. open the document, see its words, and Find-in a passage;
  8. cite it with a role (supports);
  9. run the assistant on the question from the dock;
  10. read its run's answer and its suggested reading;
  11. Ask, and read the answer;
  12. accept a reading, stand on it for the project, and conclude.

  Each step asserts what the design says the screen then shows, and the walk fails on any refused or missing step (R8). *(not yet met: T49)*
- **R10** (T49; K3320, K3324 (2); K3347; `ai-runs` R18's T46 clause) **The same journey as a member** invited to the group and joined to the project. She connects her own Claude subscription, her own run is dispatched on that sign-in, and `projectai`, plan help (`planask`) and Ask are walked as hers. *(not yet met: T49)*
- **R11** (T49; K3324 (2); amends R1 (a)) The local arm binds four things:
  - the plane's `AGENT_WORKER` to `agent-worker`, run under Miniflare with a fake model that answers the answers contract and the run modes' tools. The fake is served by this module at `agent-worker`'s model address, so `uses` stays empty;
  - a stub city site for captures by address;
  - a stub of `agent-runner`'s sign-in, served by this module at the address the plane's sign-in part calls, answering a subscription sign-in as `agent-runner`'s contract states, so step 4 and R10's connection walk the screens' own controls (K3347);
  - the test-instance mark, set as its deployer, as `local.mjs`:42 does.

  This replaces the walk worker's scratch harness. Its seam for the fake model is confirmed at START (doubt 11). Test: the local arm walks R9. Control: with no fake model bound, step 9 fails by name. *(not yet met: T49)*
- **R12** (T49; K3296; K3347; amends R1 (b), R5) The live arm walks R9 and R10 on a named test instance through its real subscription sign-in (`agent-runner`). The sign-in's own code is entered by the person signing in; the arm reads nothing secret from its output and prints none. It must pass before BOB's own live walk (K3296). Test: with no sign-in completed, step 4 fails by name before any later act. Control: no token or code in any output. *(not yet met: T49)*
- **R13** (T49; N1099, N1100; DEC-241, DEC-245; amends R6) R6's comparison covers two things:
  - design journey 29 ("From installing to a first conclusion", DEC-245), step by step;
  - `/app/more` at 390 px, against `more` (DEC-241).

  Every step of R9 and R10 is screenshotted (R2), and R6's design pairs are taken for each screen of the journey. Test: the pairs are made for each of journey 29's steps. Control: a missing pair fails. *(not yet met: T49)*

## Private

### Uses

- None imported (`modules.json` `uses` empty). It drives the installer Worker, the plane and a named test instance from outside, over HTTP, as a browser does.

### Invariants

- **R3** It writes nothing to the instance but what the journey's acts write, and runs only against an instance whose `bootstrap` answers `test_instance: true`. Test: the walker refuses a non-test instance.

### Satisfies

- N999, N1004 (journeys 28 and 3 walked before a release); K3052, K3053, K3054, K3059. (T48) N1056, K3192 (R4).

### Suggestions

- Its registration reopens `membership` R140's list test until T48's membership job, an accepted red named at L11's START (doubt 4 of the fold draft).
- Journey 28's first two steps (civicsmith.org, `site`) cannot run until Bob's DNS act (N1011).
