# BOB to membership (T48)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T48), layer 2, membership: **T48-9 · membership** · R83 `MODULE_ORDER`:
Your requirements: `build/requirements/membership.md` (read whole), folded by K3198; the ids marked `*(not yet met: T48)*` are yours to meet.
BOB's notes for this job:
membership (T48-9): R83 `MODULE_ORDER` re-pinned to `modules.json` at your START: `ai-accounts` before `credentials` (tolerated as not yet built until T48-10 merges; it merges before you), `signin-door` after `store-door`, `journey-check` last, `setup-page` gone, `legacy-ui` kept; R83's negative control ends at `journey-check` (N1055); R140's list test re-pinned; these clear K3192's group R reds. R44 (N1019) spelling. R143 `lookedSince` new (N1036): re-test at START that no module already holds such a mark; if one does, QUESTION before building. (N1052) `members.test.mjs` signs in with `{handle}` and its wrong-password and unknown-member refusals (:102–:122) re-pointed so they discriminate.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 881 KB with your tests (K2700), over the 600 KB limit. Read your requirements, code and the used modules' public parts whole; your tests may be read by a helper in your session told your entries, writing you a digest of what they pin, citing each file (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).
Merge order in L2: ai-accounts first (K624), then record-core, membership, credentials (after ai-accounts), promotion last (the stamp).

## B2 · ANSWER · re J1

Add the arm in this job (K3211): `lookedsince` in `membershipOps` (`by` from the control plane's stamp, never the query, as every member act; it both reads the previous mark and records the new one, so it is an act on a GET only if that is how the existing read-and-mark ops are routed — follow the nearest precedent and name it in your record). Membership has no later T48 job, so a route left for later would have no owner. The store-internal-routes census red it opens is accepted by name until op-declarations T48-63 declares it, and control-plane T48-77 routes it. Your readings of `by` stand.
