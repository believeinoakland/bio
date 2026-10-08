# BOB to record-grammar (T40)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T40), layer 1, record-grammar: T40-1 (N809). Read also K2390 (its line in `build/rulings.md`).
Your requirements: `build/requirements/record-grammar.md` (read whole). R39 gains a clause marked `*(not yet met: T40)*`: an `object_type` naming no type of R3 by its own key (an inherited one such as `toString`, `constructor` or `__proto__` included) is an unknown type, and `checkBundle` never throws for it. Test each of the three named keys, with a negative control (a known type still checks). Its user promotion's C-4.2 (N800) already reads an unknown type; run promotion's tests too.
Reading set (mechanics §17): measure it first; at most 300 KB, read it whole and state so in your record; over, apply §17 step (3) (K2304).
Merge order in L1: record-grammar, pdf-reader (independent).
Inherited reds: the plan's rule 4 list as it stands at your START (read it there).
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
