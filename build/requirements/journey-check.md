# journey-check — requirements

**Status** · New in T47 (T47-88; N999, N1004; K3052, K3053, K3054, K3059; folded K3100): a helper module carrying no product capability (K1043), registered in layer 11 last (after `stewards`) with empty `paths` and `tests`, listed under "Helper modules" in `build/layers.md`. Drafted in `build/plan/draft-T47-L11-fold.md` §B, worded here by BOB (P5). Not yet met (T47).

## Public

### Purpose

The release check: a Playwright walk of journeys 28 and 3 with screenshots, failing on any refusal, old page or missing screen. It is not product: nothing in the plane, the installer or the screens imports it.

### Provides

- **R1** (N1004; K3052, K3053) A Playwright (Chromium) walk, run by `npm run journey` from its directory, in two arms: (a) local, with no account: the installer Worker over the installer's fake Cloudflare account, the hand-over into a plane under Miniflare, then journey 28 (claim, codes, setup, invite, join, codes, a member's first settings, Home, first testimony, sign out, sign in kept, lock, unlock) and journey 3; (b) live, against a named test instance, signing in as the administrator and as a member with credentials read from the environment, never printed, opening `/` and every working screen of the registry. *(not yet met: T47)*
- **R2** Each step is screenshotted into its output directory (generated, never committed); the walk fails on any `ok: false` not expected by the step, any 4xx/5xx, any page whose script throws, any setup-page or legacy-ui address reached, and any registry screen not drawn, except `site` (N1011, not built in T47) and the treatments DEC-214 (4) names (`dash-home`, `dash-action`, `dash-project`) (K3137). *(not yet met: T47)*

## Private

### Uses

- None imported (`modules.json` `uses` empty). It drives the installer Worker, the plane and a named test instance from outside, over HTTP, as a browser does.

### Invariants

- **R3** It writes nothing to the instance but what the journey's acts write, and runs only against an instance whose `bootstrap` answers `test_instance: true`. Test: the walker refuses a non-test instance. *(not yet met: T47)*

### Satisfies

- N999, N1004 (journeys 28 and 3 walked before a release); K3052, K3053, K3054, K3059.

### Suggestions

- Its registration reopens `membership` R140's list test until T48's membership job, an accepted red named at L11's START (doubt 4 of the fold draft).
- Journey 28's first two steps (civicsmith.org, `site`) cannot run until Bob's DNS act (N1011).
