# legacy-index (T11)

**Status** · session_017wnYAQFtWif7k7G5n1MVfL · depth 2 · WORKING · handled B2

## J1 · QUESTION

Two readings. I am building both as stated below while the question is open.

Q1 (N247, legacy-index's share). "With op=monitor in the durable object, the Worker holds the computed-verdict success site (D-240 (b), (c))." My reading: nothing is added to the Worker for (b) and (c). LEGACY-TESTS re-anchored both arms in T9 on a planted specimen (plane-envelope.test.mjs ~L480, `PLANT_COMPUTED`), and they pass today. Writing a computed-verdict site into index.mjs only so a detector has a specimen would pin a shape and not meet a requirement. My share is therefore the envelope half: hand `doAnswer` into `monitorOp` (K372). The one plane-envelope arm still red is "`doAnswer` is the only thing ... that reads `ok` off a Durable Object envelope" (63/1 today). It stays red until monitoring drops its `openEnvelope` fallback (monitoring/index.mjs ~2126), which is monitoring's file; I am reporting it separately.

Q2 (monitoring R30, `monitorpause`, "an administrator"). legacy-index has no requirements file. Two things limit what I can build: the Worker has no administrator refusal code of its own, and NOT_AN_ADMIN is membership's (C-96.1, one code one site, K231/K275). My reading: `monitorpause` is reached by the root of trust only. That is the ADMIN_TOKEN bearer (`classes: ["admin"]`) and the founder's session (`SESSION_OPS.admin` alone), the same cut as `governorconfig`. An enrolled administrator's session is refused with the existing SESSION_ROLE_CANNOT_REACH_OP ("reserved to the founder's session"), and no new code is minted. `by` is the control plane's `actor` stamp (the session's member, or `class:admin`). The wider reading, every enrolled administrator, needs one of two things: a membership service that refuses a non-administrator by its own code, or a new row. Both belong to other modules, and I would defer that half through you. `monitorslate` is a read on `monitoring`'s cut (admin, member, probe) and takes the viewer stamp.

## J2 · REPORT

New ops on the control plane (branch job/T11/legacy-index, not yet complete). Three totality guards now name them, and each needs a line in another module:

1. **affordances (R3, R12; running in layer 11).** `monitorpause` is a new MUTATING op with a NEEDS row (`null`: the root of trust's act, `governorconfig`'s reason). It needs a `NON_ACTS` entry, so `unpublished` stays empty (`affordances.test`: "every op in NEEDS is a published act or a named NON_ACT", got ["monitorpause"]). It also needs a `RUNG_ABSENT` ground, so `unranked` stays empty (`rung-ladder.test` FORWARD and the exact-count arm: want 169, got 168). My suggestion: NON_ACTS "a machine-directed setting over the instance's own fetching, not an act on an object"; RUNG_ABSENT ground `substrate` (or `observational`), whichever affordances judges true. The two new reads, `actionkinds` and `monitorslate`, have no NEEDS row and are not mutating, so they need nothing from affordances.
   Also affordances R26: `op=affordances` (target and no target) and `op=queue` now publish `vocabulariesFor(kinds)`, `kinds` being actions' `kinds()` asked through the store's `actionkinds` route at each call. R26's `not yet met` mark can be struck once BOB confirms (the file is BOB's).
2. **legacy-tests.** `gate-reads.test` "EVERY read op is classified" names `actionkinds` and `monitorslate`. `actionkinds` names no bundle and takes no viewer stamp (ungated, reason: "answers the instance's kinds and names no bundle"). `monitorslate` is viewer-stamped (gated, `monitoring`'s class).
3. **monitoring.** With `doAnswer` handed into `monitorOp` (K372), the fallback `openEnvelope` in `src/monitoring/index.mjs` (~2126) is dead code. It is also what keeps plane-envelope's "`doAnswer` is the only thing in index.mjs that reads `ok` off a Durable Object envelope" red: the Worker corpus counts two `out.ok === true` (63/1, the same before and after my change). Removing it, and making `doAnswer` a required argument, is monitoring's.

Baseline reds I did not cause are unchanged: daemon-token 54/2, rung-ladder's determine, actionmove and escalationresume arms, refusal-wire 41/1 (the pinned forward set gained `r.body`, monitorOp's spread), machinefences-dec49 88/1, monitor-cadence 64/3 and d334 33/8.
