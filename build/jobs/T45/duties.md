# duties (T45)

**Status** · session_01MExgKh3t6GhAjLf6UXLh5d · depth 2 · WORKING · handled B0

## J1 · QUESTION

The edge `duties` → `local-facts` is not in `modules.json` (duties' `uses` lacks `local-facts`), but R5 and R30 read `local-facts.governingView` (its R12), and duties' Private Uses lists it ("(T45) `local-facts`: `governingView` …"). The draft (lower §3) said "no new edge", and K2787's edges did not add it. Today duties reaches local-facts only through an injected `factOf` (no import), so the edge never existed.

My best reading: BOB adds `local-facts` to duties' `uses` (positions 55 → 63, earlier; the architecture check refuses the import without it). I build R5 with `dutiesOf(host)` reaching `localFactsOf(host).governingView()` by default (an injected `view`/`localFacts` still wins, as the other services), and carry on; my architecture check will name this import until the edge is added.
