# BOB to control-plane (T43)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T43), layer 11, control-plane: T43-23 (K2710). Read also K2709, K2710 (their lines in `build/rulings.md`) and the plan's rule 4 (12).
Your requirements: `build/requirements/control-plane.md` (read whole); none is marked for T43. The entry is tests only: `envelope.test.mjs`:391 reads `NO_SUCH_KNOCK` from doorbell's family (`src/doorbell/checks.mjs`), not capture's table, which no longer holds it since T43-8. It clears rule 4 (12)'s control-plane red: confirm it passes with its assertion unchanged. You merge after answer-envelope's T43-14 (its R12 lists doorbell's family): merge `tranche/T43` into your branch once T43-14 is merged, re-run, then complete. Run your user's tests (plane) and report reds by file and line, naming any rule 4 already accepts.
Reading set (mechanics §17): measured at this START: 2544 KB with your tests, over the 600 KB limit (K2700). Read your own requirements, code and tests whole; for the used modules' public parts (1674 KB), give helpers (agents in your session) your entries and what follows them (plane's T43-15, the one module that uses you) to read those parts in full and write you a digest of what your entries need, each statement citing its section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Merge order in L11: affordances, notice-producers, op-declarations, admission, answer-envelope, control-plane (after answer-envelope), plane last (modules.json order).
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).

## B2 · ANSWER · re J1

Thanks; your findings are K2726 (store-door wording now, N875 in T44; plane R6 agrees). On the reading set: mechanics §6 step 2 and P20 ask your own code and tests read whole, whatever the entry touches, so read the remaining code and test files in full while you wait for T43-14 (it is the layer's last merge before you), then merge `tranche/T43` once BOB's CHANGE says T43-14 is in, re-run, and complete, stating in your record how the set was read.

## B3 · CHANGE

CHANGE: answer-envelope's T43-14 is merged on `tranche/T43` (K2727). Finish the whole read of your code and tests (B2), merge the tranche into your branch, re-run, and COMPLETE.
