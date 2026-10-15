# BOB to agent-worker (T49)

**Read** · handled J4

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T49), layer 6, agent-worker: **T49-9 · agent-worker**.
Your requirements: `build/requirements/agent-worker.md` (read whole), folded by K3331; the ids marked `*(not yet met: T49)*` are yours to meet (R89; R88 retired, K3347).
BOB's notes for this job:
agent-worker (T49-9): R88 is WITHDRAWN (Bob, K3347: no API-key support until subscription support is fully running and debugged); your entry is R89 (the `answer` tool's `input_schema` reads `answers.ANSWER_FIELDS` and `ANSWER_LABEL`, never a hand-list; amends R54); (N1073) the four hand-lists `harness:128`, `plan:293`, `requirements:1369`, `t36:94` read `ai-runs`', `capture`'s and `action-plans`' declarations.
1. M-T49-7 is dropped with R88: build nothing for a member's API-key run.
2. Check doubt 11: whether the model address is configurable, so journey-check (T49-32) can serve its own fake model over HTTP at agent-worker's model address. If it is not, post a QUESTION proposing a one-line requirement; BOB adds it to this job.
3. Confirm that importing `ANSWER_FIELDS` from `answers`' public entry does not pull the plane's store code into the Worker bundle. If it would, import `answers/check.mjs`'s export (named in `answers`' Provides by rule 7).
4. Inherited reds: `harness.test.mjs` REC100-1b/2/2b (rule 5 (7) (A)), untouched until T49-29; coverage on R89 (5 (1)).
Merge order in L6: ai-runs first, then you. When BOB's CHANGE says ai-runs is merged, merge tranche/T49 into your branch and re-run your tests before COMPLETE.
Reading set (mechanics §17, K3271): measured 2661 KB with all your tests, 1693 KB without them (the used public parts are an upper bound), over the 600 KB limit. Read your requirements, entries, layer contract and own code whole; for the used modules' services your entries touch, if they exceed what you can read, give helpers in your session your entry and what follows it, have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Read your own code whole, and the tests that name a requirement your entries change; run your other tests without reading them (plan rule 2, K3271, mechanics §6 step 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Plan rule 6 applies to you: N1075 (read member-facing sentences by key where `words.json` keys them), N1068 ("labeled"), the `admin` grep (N1072), N1073 (your listed hand-lists), and D29 (no `ok: true` carrying a refusal treated as success).
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).

## B2 · ANSWER · re J1

Option (a) (K3351): no model address is added anywhere; journey-check binds a stub of agent-runner's contract as your RUNNER. Nothing for you to build. Your R88 marker is fixed in the checks' form.

## B3 · CHANGE

ai-runs is merged into tranche/T49 (K3351). Merge tranche/T49 into your branch, re-run your tests (REC100-0/1b/2/2b/2c are accepted until T49-29), and post COMPLETE again.

## B4 · START

Depth 2. Your entry: `build/plan/current.md` (T49), "Out of layer": **T49-37 · agent-worker**. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/agent-worker.md` (read whole); R90 is marked *(not yet met: T49)* and is yours to meet.
BOB's notes: (N1137; K3402; JOURNEY-CHECK #4 J10) At journey step 12 the founder's accept leads to `conclude`, refused NO_BASIS (C-33.40): compose's facts name each held document only by its `address_norm`, never the record id a leg's `target` takes (`run-productions` R1, R9), so the model cannot name the leg the accepted reading rests on. R90: `collect`'s holdings carry each held document's record id beside its address, and `compose`'s facts pass it on. Owner: agent-worker (facts), not agent-harness (a read tool at compose), as the smaller change; if you find the facts cannot carry it without a change to a module you use, say so in a QUESTION before building. R21's UNDETERMINED for a citation whose read is refused stands; the control is required.
Reading set (mechanics §17, K3271): read your requirements whole, your entry, your layer contract, your own code, the used services your entry touches, and the tests that name a requirement your entry changes; run your other tests without reading them. If what your entry touches still exceeds what you can read, have helpers in your session read it in full and write you a digest citing each section (K2032). State in your record how the set was read. Never stop your test run midway: its negative controls mutate the working tree (K1994).
Every new id needs an explicit test naming it (K874); every refusal a control. Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here.
Out of layer (Bob's approval, K3407): merge tranche/T49 into your branch first (it carries every later layer); also run the L11 screens' tests that read your module and journey-check's local arm (after `npm ci` in `bio-plane/src/journey-check`) before COMPLETE; the agent-worker bundle goes stale (report it; BOB regenerates at L11's close).
