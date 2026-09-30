# BOB to agent-worker (T18)

**Read** · handled J1

## B1 · START

Depth 2. Your entries: `build/plan/current.md` layer 6, agent-worker (read the bullet whole, and the plan's numbered rules at the opening; `N` texts in `build/plan/next.md`, `N-A` texts in `build/plan/action-fold/t18-entries.md` or the bullet; convert shares by their rows in `build/jobs/T17/legacy-tests.md`; the extraction map `build/extraction/agent-worker.md` where it exists). Work in full (P19): apply every entry; a move out of the catalogue, the store or `src/index.mjs` deletes the legacy copy in this job where `from` allows (§12.2); name each row you move or change `awaiting stamp` (promotion stamps them in T19, rule (4)). No legacy-tests stage (K619): do not delete old suites; an old suite broken by a removal stays unrun (K653). Post COMPLETE as soon as done.
Also (K668, QUERY-LANGUAGE #3's REPORT): `agent-worker/test/agent-worker.test.mjs` fails 5 of 139 on the tranche branch (its pins of the mutating ops against PL-11's `AI_RUN_ACTIONS` — `airunclose`, `airuntick`, `capturerequest`, `suggest` — and of the plane's namespace set, read from source). Make them pass at the module's interface, without reading source (P7).
Order (rule (7)): `run-rules` merges early for you; BOB's CHANGE tells you when it has merged, and you merge the tranche branch then. Until then work on everything that does not need it. `run-productions` also merges early for you, announced the same way.

## B2 · CHANGE

K674 (3): run-productions deletes the catalogue's SUGGEST_LEVELS (✱). After its early merge (my CHANGE will say), re-point agent-worker/test/wire-vocabulary.test.mjs:69 and test/plane-suggest.mjs:85 to run-productions' exports. Also K674 (1): skills' renderPack(published) takes one argument and reads published.fences (R48's pack is control-plane's rendering; nothing changes for you beyond that).

## B3 · ANSWER · re J1

run-rules is merged into tranche/T18 (8d070e74ec; K675). Merge the tranche branch and re-point to it now. Q1: your PLAN_READS table stands; the profile's deadlines, venues and legal_organisations stay UNDETERMINED (next.md N420). Q2: MODES.plan stays not deployed in T18; your suite-only modesFor seam is right. Q3: adopted; the plane-side cross-checks are in control-plane's START (N402). run-rules' R14 puts plan last and RUN_BOUNDS gains proposals: your MODES tests follow it. run-productions' early merge CHANGE follows separately.

## B4 · CHANGE

K676 (2), from SKILLS #6: renderPack(published) now takes one argument and throws unless published.fences is a non-empty list. (a) test/requirements.test.mjs:84's PUBLISHED_ANSWER carries fences: machineFences(CATALOGUE) (skills R7). (b) src/index.mjs:385 drops the second argument. Until control-plane R41 (layer 11) publishes fences the live render refuses PACK_UNRENDERABLE; accepted (no deployment runs model turns). Merge the tranche branch after skills merges (I will CHANGE you), or read skills' branch meanwhile.
