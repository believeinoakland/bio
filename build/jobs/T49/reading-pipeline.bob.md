# BOB to reading-pipeline (T49)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T49), layer 4, reading-pipeline: **T49-6 · reading-pipeline**.
Your requirements: `build/requirements/reading-pipeline.md` (read whole), folded by K3331; the ids marked `*(not yet met: T49)*` are yours to meet (R32).
BOB's notes for this job:
reading-pipeline (T49-6): R32 (text units for a capture read as text through no wireable format entry: HTML and plain text, `doc-para` units from the decoded text; no format-registry entry is added); (N1065) R22's "no place named" proven over the module's whole outward text against `jurisdictions`' full place list, replacing `read.test.mjs`'s two-name sample.
1. Measure first which captures reach R1's branch today: `profiled_from_text: true`, a single part, and a format entry with neither `text` nor `structure` (`formats.mjs`:152–174: `html` has both null). Measure also how many HTML and plain-text captures exceed the profile's text bound (those take R1's "not read as text" branch and get no units); say both in your record.
2. Inherited reds: coverage on R32 (rule 5 (1)); the plane bundle (5 (5)). The PDF check M-T49-6 is BOB's live check at biosmoke8, not yours.
You are alone in L4.
Reading set (mechanics §17, K3271): measured 819 KB with all your tests; 491 KB without them, under the 600 KB limit, so read your requirements, entries, layer contract, own code and the used services your entries touch whole.
Read your own code whole, and the tests that name a requirement your entries change; run your other tests without reading them (plan rule 2, K3271, mechanics §6 step 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Plan rule 6 applies to you: N1075 (read member-facing sentences by key where `words.json` keys them), N1068 ("labeled"), the `admin` grep (N1072), N1073 (your listed hand-lists), and D29 (no `ok: true` carrying a refusal treated as success).
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).

## B2 · START

Depth 2. Your entry: `build/plan/current.md` (T49), "Out of layer": **T49-34 · reading-pipeline**. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/reading-pipeline.md` (read whole); R33 is marked *(not yet met: T49)* and is yours to meet.
BOB's notes (K3392 (1), K3397; a worker's read, to check): `content`'s gate (`content/extent-core.mjs`:567–569) refuses C-45.2 when the reading's `text_source` (read through `extraction.readingOf`, `extraction/index.mjs`:1058–1074) is empty. The wireable path builds it in `readInner` (`reading-pipeline/index.mjs`:1274–1370, `layerChainFor` :144) and `readingFromWire` (:994, :1011). R32's text branch (:1230–1273) builds three reading literals (:1241–1269) with no `text_source`/`text_container`. The suggested fix: in that branch, when text units were formed, set `text_source = layerChainFor(null, {tier: null, container: fmt || "text"})` and `text_container`, before the provenance site (:1375), keeping R14 (tier null) true. Extraction needs no code change (`writeReading` stores the chain). Test at your interface plus, if a test of yours can reach it, `cite` admitted on a captured HTML notice; control: no reading, C-45.2 still refused.
Reading set (mechanics §17, K3271): read your requirements whole, your entry, your layer contract, your own code, the used services your entry touches, and the tests that name a requirement your entry changes; run your other tests without reading them. The used-public figure is an upper bound (whole public parts); if what your entry touches still exceeds what you can read, have helpers in your session read it in full and write you a digest citing each section (K2032). State in your record how the set was read.
Every new id needs an explicit test naming it (K874); every refusal a control. Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here.
Out of layer (Bob's approval, K3398): you branch from tranche/T49 as it stands, with every later layer merged; also run the L11 screens' tests that read your module (screens-*, journey-check's local arm) before COMPLETE.
