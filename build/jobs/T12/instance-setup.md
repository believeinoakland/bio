# instance-setup (T12)

**Status** · session_01Qk57v2crns3EGpjW9ysjS3 · depth 2 · WORKING · handled B3

## J1 · REPORT

N234 pushed (`job/T12/instance-setup` @ HEAD): `bio-plane/src/setup.mjs` now exports `GROUP_SLUG_RE` and `FLEET_BINDINGS` (with `memberVersions`, which moved with them from legacy-index, the map's §1 row). legacy-store imports `GROUP_SLUG_RE` from `./setup.mjs` (its `static GROUP_SLUG_RE` removed); legacy-index imports `memberVersions` (the block removed). Ownership: 0 failures (legacy-store +3/−6, legacy-index +1/−44). Module tests 4/0 (`test/m/instance-setup/`); `bootstrap.test.mjs` 18/0.

Made red by the move, anchored on moved source (not mine to edit):
- installer: `newgroup/test/wizard.test.mjs` reads `const FLEET_BINDINGS = […];` from the plane's `index.mjs` source (line 1286) — 206/0 on the tranche base, 7 fail here (the two PINs and the five INSTALL/UPDATE arms fed by `PLANE_FLEET`). INSTALLER's N234 import (`import { FLEET_BINDINGS, GROUP_SLUG_RE } from "../../bio-plane/src/setup.mjs"`) fixes it.
- legacy-tests: `bio-plane/test/instance-group.test.mjs` S4 reads `static GROUP_SLUG_RE` from `store.mjs` by source (46/1 here); retired by N234's import (map §4).

The rest of the extraction continues; the next push will move more of the same legacy files.

## J2 · QUESTION

Four readings I am building on now; each carries on unless you answer otherwise.

**Q1 · R34's keys.** R34 names `mean_ms` while forbidding a count described as a time. **Best reading:** `runtime_observations` gains a `unit` column (R33 takes an optional `unit`, default `ms`; the R42 listener passes `bytes`; the existing rows are migrated to the metric's unit, `bytes` for `capture_work_bytes`). R34 answers every metric as `{metric, unit, peak, peak_at, peak_detail, last, last_at, samples, total, mean}`, and adds `peak_ms`, `last_ms`, `total_ms`, `mean_ms` only for a metric whose unit is `ms`; the note is per unit. R33's own answer keeps its stated shape.

**Q2 · R38's start step against R40.** R38 says a run starts from `highest_completed`; R40 says a run never continues an earlier run's numbering and each run's steps are timed from its own start. Starting a fresh isolate at step k measures k fewer steps of work under the old numbers, which is R40's defect. **Best reading:** every run starts at step 0 under its own run id (`cpu_probe` keyed `(run, step)`, a `cpu_probe_runs` row per run: started, iterations, budget, and its end when it returned); the existing rows migrate as one run `legacy`. R36 keeps its top-level keys as a lower bound over all runs (`elapsed_at_highest_ms` the largest elapsed any run completed, `highest_completed` that step) and adds `runs`, each with its steps, whether it returned, and for a run that never returned the bracket (its last completed step and the next). R35 takes `run`. R39: the start, each step and the end are written through the store and each answer is read; a start the store does not confirm answers the store-silence refusal and burns nothing, a step it does not confirm ends the probe, and the op answers `ok: true` with `trail_complete: false` and `last_confirmed_step` (no new refusal code).

**Q3 · R12–R16's ops.** R14 needs the control plane to stamp `by` from an administrator's own signed-in session, and R15's page needs two ops: `profiles` (a read) and `profilesset` (a write). Their `OPS` rows, classes and stamps are control-plane's. **Best reading:** I build the store side (`profiles()`, `profilesSet({profiles, by})`, their Durable Object routes, R13 at first boot) and the page; the page calls `op=profiles` and `op=profilesset`; CONTROL-PLANE adds the two rows (`profiles`: admin, member and every session, a read; `profilesset`: sessions only, `by` stamped from the session, a bearer refused) and I post a REPORT naming them. R15's test is a `test.todo` naming that cause until the routes exist.

**Q4 · R14's four codes.** `NOT_A_LIST`, `UNKNOWN_PROFILE`, `PROFILE_IS_TEST`, `PROFILES_NOT_ADMIN` have no rows anywhere. **Best reading:** a new family C-119 (the next free) in this module's own table, four arrivals for promotion R34's next stamp (N318), reported. The five C-64 rows R30 names move to this module's table unchanged but for their `where`s.

Also stated (no answer needed): the moved code lives in `bio-plane/src/setup.mjs`, this module's one code path besides `livefire.mjs` (its tables are created by its own `migrate`, out of `schema.mjs`); legacy-index's `Store` export wraps legacy-store's class to start it and route its Durable Object ops first (map §3).

## J3 · QUESTION

B2 applied and pushed: `bio-plane/src/setup-fleet.mjs` holds `GROUP_SLUG_RE` (a RegExp) and `FLEET_BINDINGS` (`[member, binding]` pairs), imports nothing (tested: it loads alone as a `data:` module), and `setup.mjs` re-exports both. The installer can import the leaf now. B3 merged (tranche @ its head); the extraction itself is pushed too (module tests 22/0 so far; the rest are being written).

**Q5 · the one legacy-store line the ownership check fails.** Map §3 names it: `filingsOf`'s `producingGroup` (store.mjs 622) must read promotion's fact once `#producingGroup` leaves, so it reads `producingGroup: () => { const f = promotion.fact("producingGroup"); return f.ok ? f.value : null; }`. It uses no name from my paths, so `ownership` reports 1 failure (store.mjs:622). No form of it can use my names: legacy-store may not import instance-setup (it is earlier). **Best reading:** you accept this one line at review as the map's own row. The alternative is a filings entry (filings reads promotion's fact itself, N56, and legacy-store drops the dependency as a removal); say if you want that instead.
