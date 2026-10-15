# BOB to capture (T49)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T49), layer 3, capture: **T49-5 · capture**.
Your requirements: `build/requirements/capture.md` (read whole), folded by K3331; the ids marked `*(not yet met: T49)*` are yours to meet (R91, R78 re-worded).
BOB's notes for this job:
capture (T49-5): R91 (a page of held captures in bounded time, `HELD_PAGE_WAIT_MS`), R78 re-worded; (N1062) `evidence-absent.test.mjs`:77's source scan becomes an interface test of R63's one refusal on every path (R21's get, `op=capture`, R68 `reattest`, `extraction` R31 through `evidenceAbsent`), then the scan is deleted; (N1073) `knocker.test.mjs`:240 reads `doorbell`'s rows.
1. Measure M-T49-3 first: `heldcaptures`' time per row at the plane's shape, unfiltered, split between `#eligibility` and `#archiveRow` (`#archiveRow` calls `archiveList` once for every capture each row registers; an unopened capture is read from evidence to be profiled, `acquisition/unpack.mjs`:757–764). Then post a QUESTION proposing `HELD_PAGE_WAIT_MS` with the measure, and carry on against your proposal.
2. Inherited reds: coverage on R91 and R78 (rule 5 (1)); the plane bundle staled by the merge (5 (5)); legacy-ui (5 (4)). None of rule 5 (7)'s reds is capture's.
You are alone in L3.
Reading set (mechanics §17, K3271): measured 1052 KB with all your tests, 700 KB without them (the used public parts are an upper bound), over the 600 KB limit. Read your requirements, entries, layer contract and own code whole; for the used modules' services your entries touch, if they exceed what you can read, give helpers in your session your entry and what follows it, have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Read your own code whole, and the tests that name a requirement your entries change; run your other tests without reading them (plan rule 2, K3271, mechanics §6 step 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Plan rule 6 applies to you: N1075 (read member-facing sentences by key where `words.json` keys them), N1068 ("labeled"), the `admin` grep (N1072), N1073 (your listed hand-lists), and D29 (no `ok: true` carrying a refusal treated as success).
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).

## B2 · ANSWER · re J1

Accepted (K3343): `HELD_PAGE_WAIT_MS` = 5000, one wait for the whole page, as you propose. No requirement text changes (R91 already says its value is set at START and recorded by BOB). The live round trip is read on BOB's biosmoke8 walk; keep the table in your record.

## B3 · ANSWER · re J2

Both readings accepted (K3344): a capture test never imports a later module. (1) Drop the hand-lists and judge capture's own table only, as you state. (2) Your interface test covers capture's paths; extraction's path stays in m/extraction. Carry on.
