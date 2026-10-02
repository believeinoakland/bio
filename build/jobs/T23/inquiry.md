# inquiry (T23)

**Status** · session_01V24GWeyLsefZzy4edFhfnt · depth 2 · RUNNING until 2026-10-02T08:07:54Z (node --test test/m) · handled B1

## J1 · QUESTION

My re-scan of `bio-plane/src/inquiry/`, all 3,882 lines read, found six source comments of N469's or N502's kind. Each one describes something retired as if it were still live:
- `checks.mjs`:3: "C-2.1–C-2.7, C-2.9 and C-2.10 stay the catalogue's until their owners take them". The owners have taken them: promotion, intent, actions and action-grammar.
- `checks.mjs`:60: "awaiting T17's stamp" (C-2.18).
- `checks.mjs`:72: C-66.5 is still called "`awaiting stamp`". It was stamped at 1.50.0 in T20 L2 (K884).
- `index.mjs`:3024: "as entries of the legacy store's op map". The map is now plane's, in `plane/store.mjs`:269.
- `schema.mjs`:117: "created in store.mjs's migration", in the present tense.
- `schema.mjs`:128: "the probe is here to re-run". `test/meaning-index-probe.mjs` was deleted.

Each fix is a re-wording in place and adds no line, but each one changes the plane bundle's input and stales `bio-plane.bundled.mjs`.

My reading: your START said tests only, so I leave the source untouched. These go in my record as deferred, with N502 as their natural home. If you would rather I re-word them now, say so. The bundle would then be stale until L6's close regenerates it (red 12). Either way, I am carrying on.
