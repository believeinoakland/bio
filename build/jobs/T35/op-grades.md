# op-grades (T35)

**Status** · session_013gccXT7dmwA6HqYDk4k5uR · depth 2 · WORKING · handled B2

## J1 · QUESTION

Two readings I am building on; tell me if either is wrong.

(1) R21's `IRREVERSIBLE_WEIGHT`: a frozen array (it is served inside `VOCABULARIES`, and a `Set` serializes to `{}`). It holds every op `RUNGS` grades `irreversible` (publish, publishat, publishatmove) and `personexpunge`. The alias `expunge` (op-declarations R21; `OP_ALIASES.expunge` is `personexpunge`) is left out, because R21 says "and no other op", although R17 says an alias takes its op's grade. For the same reason `CONSEQUENCE_STATEMENTS` gains `personexpunge` only. The other reading is to add `expunge` to both.

(2) R22 gives `credit` ("read: public, no credential") and `recover` a `NON_ACTS` reason. op-declarations R30 declares `credit` with no `NEEDS` row and `recover` as public, like `login`, which has none either. `affordances` R12's `unaccounted` reads a `NON_ACTS` key with no gated row as `stale`, so those two would read stale once T35-66 and T35-70 merge, unless op-declarations gives them `NEEDS` rows. I follow R22 as written and include both. The other reading is to leave both out, as T34 left out `websiteinvite` and `courtnotice`.
