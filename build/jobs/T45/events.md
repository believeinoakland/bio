# events (T45)

**Status** · session_01834bxkNUQSs2DdTKq9mwAW · depth 2 · RUNNING until 2026-10-11T19:53:21Z (tests of the 29 modules that use events) · handled B2

## J1 · QUESTION

R28/R30 (T45-5): `timeline`'s "what we did" lane rebuilds each source item as `{at, label, ref, kind}` (R30's item shape). Under `audience: "public"` a source answers "only its public items, each marked `public: true`" (R30, actions R66, docket R26), and R28 says this module "adds, drops and re-marks no item". Rebuilding the item would drop that mark.

My reading, which I am building now: an item a source marks `public: true` keeps `public: true` in the lane, exactly as given; this module never adds the key (an item with no mark, or any other value, gets none), and it changes nothing else in the lane's shape. So callers that read the lane today (case-authoring, filings) see no change unless a source marks its items.

Say if you want the mark dropped instead (the lane strictly `{at, label, ref, kind}`); nothing else I build depends on the answer.
