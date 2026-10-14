# journey-check — requirements

**Status** · New in T47 (T47-88; N999, N1004; K3052, K3053, K3054, K3059; folded K3100): a helper module carrying no product capability (K1043), registered in layer 11 last (after `stewards`) with empty `paths` and `tests`, listed under "Helper modules" in `build/layers.md`. Drafted in `build/plan/draft-T47-L11-fold.md` §B, worded here by BOB (P5). Not yet met (T47). Last changed T48 (T48-80: R4 new, the journey runs only when executed directly; N1056; K3192; K3195); marked not yet met (T48). Last changed T48 (K3254, the L11 design fold of WALK-084 #2, K3250: R5 new, amending R1 (b), the administrator and the member reached directly; R6 new, amending R2, each live screen against the design mock before a release); marked not yet met (T48).

## Public

### Purpose

The release check: a Playwright walk of journeys 28 and 3 with screenshots, failing on any refusal, old page or missing screen. It is not product: nothing in the plane, the installer or the screens imports it.

### Provides

- **R1** (N1004; K3052, K3053) A Playwright (Chromium) walk, run by `npm run journey` from its directory, in two arms: (a) local, with no account: the installer Worker over the installer's fake Cloudflare account, the hand-over into a plane under Miniflare, then journey 28 (claim, codes, setup, invite, join, codes, a member's first settings, Home, first testimony, sign out, sign in kept, lock, unlock) and journey 3; (b) live, against a named test instance, signing in as the administrator and as a member with credentials read from the environment, never printed, opening `/` and every working screen of the registry.
- **R2** Each step is screenshotted into its output directory (generated, never committed); the walk fails on any `ok: false` not expected by the step, any 4xx/5xx, any page whose script throws, any setup-page or legacy-ui address reached, and any registry screen not drawn, except `site` (N1011, not built in T47) and the treatments DEC-214 (4) names (`dash-home`, `dash-action`, `dash-project`) (K3137).

- **R4** (T48; N1056; K3192 group T) `journey.mjs` runs its journey only when executed directly (a main-module guard: its own file is the process's entry), never on import: importing it starts no walk, opens no browser or server and does not exit the process. Test: importing the module in a test process leaves the process running and starts nothing; control: running it directly starts the walk. *(not yet met: T48)*

**The design walk folded** (T48; WALK-084 #2; K3250, K3254)
- **R5** (T48; K3250, K3254; walk "Limits"; rulings-active §4; amends R1 (b)) The live arm reaches the instance directly: it uses no agent proxy (Chromium `--no-proxy-server`, or `NO_PROXY` for the host). It signs in as the administrator and as a member. It fails unless `whoami` answers the administrator with `administer: true` and the member with `false`. Each role walks every working screen it may open, including the acts only an administrator is drawn. Test: a member credential given as the administrator fails the walk. Control: correct roles pass. *(not yet met: T48)*
- **R6** (T48; K3250, K3254 (7); amends R2) Before a release is called ready, the live arm puts each working screen beside the design mock's drawing of that screen and state (`layouts.html`, built from `screens/mock-*.js` at `ASSETS_COMMIT`), at 1280 and 390 px, with screenshots in pairs as WALK-084 #2 made them. It fails on any of: *(not yet met: T48)*
  - a page wider than the viewport;
  - at 390 px, tabs that are not at the viewport's foot;
  - a test band narrower than the frame;
  - an element whose class no loaded stylesheet defines;
  - text matching a slug, a language tag, a record id or a refusal code.

  The pairs are put to BOB, who records the comparison in a K before the release is called ready. Test: a fixture page that overflows fails. Control: a fixture matching its pair passes.

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
