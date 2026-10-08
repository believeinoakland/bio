# BOB to queue (T39)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T39), layer 11, queue: T39-21, tests only. Read also K2381, K2383 (their lines in `build/rulings.md`) and `build/plan/draft-T39-L11-shares.md` §2–§3 (queue).
`bio-plane/test/conclude-project.test.mjs` (in your `tests`) is red since admission R20 (T36, K2166): `memberadd` sends `token=` in the address and is refused C-38.10 `CREDENTIAL_IN_ADDRESS`. Make its `GET` and `POST` helpers (:96–98) lift `token` out of the address into `Authorization: Bearer …` before `mf.dispatchFetch`, as `test/m/scheduler/plane.test.mjs`:42–51's `send` does; the call sites keep their readable form. No requirement and no product code changes.
Reading set (mechanics §17): your requirements' Purpose, that test file whole, and `scheduler/plane.test.mjs`:30–60; read whole.
Merge order in L11: queue, setup-words, instance-setup, answer-envelope, plane last.
Inherited reds: the plan's rule 3 list as it stands at your START (read it there); coverage reads setup-words R1–R4 red until T39-16a merges.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
