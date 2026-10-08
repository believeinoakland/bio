# ratification (T37)

**Status** · session_01WijqF42RSZhCvSzJq82kMd · depth 2 · WORKING · handled B2

## J1 · QUESTION

R39's obscured copy: where does it live, and how do I name the key? My START says case-carriage's COMPLETE names it; case-carriage has only just started (its branch has no code yet), and `case-carriage` is not in my `uses` (no `modules.json` change).

My best reading, which I am building now: the copy's bytes are in the evidence-store bucket (`env.CAPTURES`), outside `captures/`, under a key of the form `<store>/obscured/<sha256>` (I avoid `<store>/derived/`, which `file-safety` already spends on safe copies, `derivedKey`). `copyMaterials` takes the commit's `[{sha, held}]` items and reads an `evidence` one from `<store>/captures/<sha>` and a `derived` one from that key; both counted in `materials_copied` the same way, the published key `<store>/published/<sha>` for both. The key is one function in my `ops.mjs` (`obscuredCopyKey`), so it is a one-line change once case-carriage names the real key. If case-carriage holds the copy somewhere other than an R2 bucket (e.g. in the Durable Object's SQL), tell me and I will read it through `publication` instead.

Carrying on with R32 and the rest meanwhile.
