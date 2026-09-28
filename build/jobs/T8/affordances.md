# affordances (T8)

**Status** · session_01GC8QNKei7sU5uBHF2DgCy8 · depth 2 · WORKING · handled B0

## J1 · REPORT

For legacy-index (N177, N80), as B1 asks. Both are on `tranche/T8` already; nothing below waits on my job.

**1. `decorate(act, gate)` (R11), exported by `bio-plane/src/affordances.mjs`.**
- `act`: an entry of `ACTS`, `CAPTURE_ACTS` or `PER_ITEM_ACTS` (it reads `id`, `label`, `weight`, `prompt`).
- `gate`: `{needs(op), mode(op)}`, both functions of the op id:
  - `needs: (op) => NEEDS[op] ?? null`
  - `mode: (op) => SESSION_OPS.member.has(op) ? "session" : SESSION_OPS.admin.has(op) ? "admin-session" : "machine"`
- Answer: `{id, label, weight, needs, mode, rung, rung_absence, prompt}`, every key present, an absent value a stated `null`.
- With that `gate` the answer equals today's `decorateAct(a)` (index.mjs 2781) key for key, so `op=affordances` (`catalog`, `acts`, `capture_acts`) and `op=queue`'s item options (index.mjs 4780, 4906) can call `decorate(a, gate)` with one `gate` built once at module level. `op=affordances`' `set_acts` rows spread `decorate(a, gate)` and add `set_key`, `item_keys`, `shared_keys`, `max_items` as today.

**2. N80.** `ACQUIRE_GRADE_NOTE` is imported by index.mjs 94 from `./affordances.mjs` and used at 5194. Capture already exports `acquireGradeNote` and `ACQUIRE_GRADE_NOTE` from `./capture/index.mjs` (the same composed string). When I drop my copy, index.mjs must import it from capture in the same merge or earlier, or the plane fails to load. My plan: drop both from affordances in this job; legacy-index's re-point should merge first (or with mine). If you would rather I keep a re-export from capture until legacy-index lands, say so.

**3. R5's text** still names `ACQUIRE_GRADE_NOTE` and `acquireGradeNote` as this module's. Once N80 lands they are capture's, so R5 should lose that sentence (a fold for you). My R5 test will check only the attest fence and the prompts.

## J2 · QUESTION

Two questions. I carry on with my best reading of each; neither blocks the op rows (the bulk of my entries), N80 or the imports.

**Q1. R26: how actions' live kinds reach `op=affordances`.** Actions answers the kinds per instance: `Actions#kinds()` reads the `jurisdiction_profiles` setting in the Durable Object and returns `actionKinds(view)` (the product's kinds, then the view's). `op=affordances` is composed in the Worker (index.mjs 4777), which publishes the module-level `VOCABULARIES` and, with no target, makes no Durable Object call at all. So no change inside my paths alone can make `vocabularies.action_kind` the value actions answers at the moment of the call.
- Best reading:
  - My module exports a pure `vocabulariesFor(kinds)` → `VOCABULARIES` with `action_kind` replaced by the given kinds (the same object for every other key, R4).
  - `VOCABULARIES.action_kind` at module level becomes actions' own `PRODUCT_KINDS` (what actions answers with no profile), and `risk_tiers` actions' `RISK_TIERS`. No kind is held here.
  - The handler (legacy-index) asks the Durable Object for the instance's kinds (a read answering `actionsOf(host).kinds()`) and publishes `vocabulariesFor(kinds)`, in both the target and no-target answers, and `op=queue`'s.
  - I test R26 at my interface: `vocabulariesFor(actions' kinds for a view with and without profiles)` equals what actions answers, and the module-level value equals the no-profile answer. The live half in the plane stays a `test.todo` naming legacy-index's route until it lands.
- The alternative is to extract the composition (R17, map §1: index.mjs `op=affordances`) into my module this tranche. That rewires the same handler lines legacy-index is changing for N177, concurrently, so I have not done it.

**Q2. N144: `surfaces` and `recipes` in `op=affordances`.** Three things stand in the way of my share as written:
1. **R17 fixes the answer's keys.** The no-target answer is `{target, catalog, vocabularies, capture_acts, set_acts, detail}`, and my plane test pins exactly those keys. R17 needs your fold first: say which answers gain `surfaces` and `recipes`, and their shapes.
2. **The data is legacy-ui's.** `SURFACES` (app.html 2191, 18 surfaces) and `RECIPES` (2484, 3 recipes) live in `civicos-ui/app.html`. `civicos-ui/test/surface-registry.test.mjs` proves them against app.html's own routing. The plane can publish them only by holding them: either a copy in my module (the drift DEC-8 forbids, since the UI's walk would then prove the UI's copy and not the plane's), or by moving them out of app.html, which is a legacy-ui change (no job this tranche, ruling 4).
3. **The shapes disagree.** Skills R10 validates each recipe step's `act` against `published.catalog`'s ids, which are `ACTS` only. The recipes' steps name an `op` (`searchfields`, `search`, `meaningrows`, `concerns`, `image`, `acquire`, `projection`, `cite`, `queue`, …), most of which are reads, not acts. Published as they are, `renderPack` would throw on the first step.

Best reading: N144 cannot be applied in this job. I leave R17 as it is and defer my share with this cause. It needs your R17 fold, a ruling on where the registry lives (moved into the plane with legacy-ui reading it, or the UI build publishing it), and a skills R10 reading of `act` against the ops the plane emits. If you rule instead that the registry moves into my module now (for example `bio-plane/src/affordances/surfaces.mjs`, published under R17's new keys, with app.html's copy left for legacy-ui), say so and I will build it.
