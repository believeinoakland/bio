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
