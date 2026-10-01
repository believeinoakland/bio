# affordances (T18)

**Status** · session_01FgotLQ7FibdK7RNpDfo4m4 · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Two questions; I carry on with the rest of the job on my best readings.

(1) N13's share: removing the `affordancefacts` arm from `store.mjs` now opens a red window. Until control-plane spreads `affordancesOps`, the durable object has no `affordancefacts` route, so `op=affordances` with a target fails at `index.mjs`:281. That turns red most of my `plane.test.mjs` (R13–R18, R20, R22, R24) and other modules' tests that read `op=affordances` with a target: `basis-versions` (conclude-project-arm, sufficiency-state, versionstate) and possibly `skills` (pack, planning, fixture).
   Best reading (A): I build and export `affordancesOps(a, url, body)` holding `affordancefacts`, tested in-process at my interface. I leave the store arm in place. Control-plane removes it in the same edit that spreads the map: its `from` includes `legacy-store`, so that is its §12.2 removal, with no red window.
   Alternative (B), the plan as written: I also remove the arm and its import now, and every arm above is accepted red by name until control-plane's job (K705's pattern).
   I recommend A. If you rule B, I make the removal in one commit and list the red arms.

(2) K705/K709 grading. I graded the four new writes on R27's rule, all `undetermined`: `communicationprepare` (on `filingprepare`'s ground), `templatesave`, `actioncreate` (`entitycreate`'s ground: a member's chosen act, not `promote`'s substrate) and `actionpressure` (its required note describes what was received; `PRESSURE_REFUSED` is a malformed mark and is not added to `JUSTIFICATION_REFUSALS`). Each also has a `NON_ACTS` reason. `templates`, `action` and `actions` join `LAYER9_READS`. That makes 65 undetermined ops, so R27's sentence "The 61 ops graded `undetermined` today …" and R3's named list are now stale wording. Please confirm the grades and amend R27's count (and name the four in R3 if you want them named). `catalogue.test.mjs` asserts 65 with the four listed, and it is green.

## J2 · QUESTION

Replaces J1. One correction: basis-versions' and skills' tests only mention `op=affordances` in comments, and none of them calls the route. The rest of J1 stands.

(1) N13's share. `affordancesOps(a, url)` is built, exported and tested in-process (`test/m/affordances/ops.test.mjs`, 3 pass). Removing the store's `affordancefacts` arm now leaves `op=affordances` with a target unanswered (`index.mjs`:281 asks the durable object) until control-plane spreads the map. The red would be in my own suite only: `plane.test.mjs`, which reaches the facts through the durable object and `op=affordances` through the Worker (R13–R18, R20, R22, R24; about 20 tests).
   Best reading (A), which I recommend: I leave the arm in place, and control-plane removes it in the edit that spreads `affordancesOps`. Its `from` includes `legacy-store`, so that is its §12.2 removal, and there is no red window.
   (B), the plan as written: I remove the arm and its import now, and those `plane.test.mjs` arms are accepted red by name until control-plane's job (K705's pattern).
   I am carrying on with the converts. The removal is one small commit whichever way you rule.

(2) Unchanged from J1: the four K705/K709 writes are graded `undetermined` on R27's rule, each with a `NON_ACTS` reason, and `templates`, `action` and `actions` are in `LAYER9_READS`. That makes R27's "61" 65 (its wording is yours to amend). `catalogue.test.mjs` is green.
