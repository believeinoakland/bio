# BOB to control-plane (T38)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T38), layer 11, control-plane: T38-16 (N788; K2300). Read also K2300 and K2318 (their lines in `build/rulings.md`) and `build/plan/draft-T38-L11.md`'s section for your module.
Your requirements: `build/requirements/control-plane.md` (read whole); R67 amended (K2318), not yet met: T38: `obscuremarkwithdraw` is routed by the plane's spread of `caseCarriageOps` with `by` stamped from the session through op-declarations' `OP_FAMILIES` (R40): no route code; a door test in `t37-door.test.mjs`'s pattern (`by` from the session, a bearer refused). N793 has no share here (control-plane mints no `NO_SUCH_MEMBER`). You use op-declarations R40 (this layer): merge the tranche when BOB tells you it is merged. Test each changed id by name in the test's title (K874).
Reading set (mechanics §17): measured at this START by `build/plan/reading-sets.py`: 1789 KB (own requirements 48 KB, the used modules' public parts 1,493 KB, code 249 KB), an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (3) **required, not optional (K2304):** read whole yourself your requirements, layer 11's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.
Merge order in L11: `modules.json` order, plane last (K2300); a job that uses a same-layer module merges the tranche into its branch when BOB tells it that module is merged (CHANGE).
Inherited reds: the plan's rule 6 list as it stands at your START (read it there); only the items named here are yours.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · CHANGE

From ADMISSION #7 J1 (K2326), an improvement in your module: `index.mjs`:654 (`windowed.source ?? await sourceOf(req, env)`) asks the store a second time on a store fault since T38-24 (`sourceOf` with the key unbound asks `doorwindow` itself). For a public op the window's source is already the fingerprint: drop the fallback there if it is small and safe, with a test; else REPORT it for `next.md`. admission (T38-24) is merged into `tranche/T38`: merge the tranche into your branch.

## B3 · CHANGE

op-declarations (T38-15, R40) is merged into `tranche/T38` (K2327): merge the tranche into your branch; your door test now runs over the real declaration.
