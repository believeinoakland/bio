# doctypes (T35)

**Status** · session_01Y6hcEDnNpHHyH8SJXrD1tK · depth 2 · WORKING · handled B2

## J1 · QUESTION

R35's capture, "as the plane captures them": PowerDMS serves each OPD/City policy's PDF at its public address (`public.powerdms.com/OAKLAND/documents/<id>`, plus the City's own copies of AI 594 and AI 123), so the 50 are fetched (10 Special Orders, 6 AIs, 34 DGOs). Tier 1 reads almost none of them (fonts without ToUnicode), so the plane's reading is Tier 1 then pdf-worker's Tier 2 (unpdf 1.8.0), merged by text-chain's `mergeTier2Text`. 47 of 50 carry text; 3 are image-only scans (SO 8791, SO 8793, DGO B-08), which only OCR would read: I keep them in the 50 and count them as not read.

The question: the hand-run capture script needs `bio-plane/src/pdfstructure.mjs` (pdf-reader), `bio-plane/src/textchain.mjs` (text-chain) and pdf-worker's `unpdf`; doctypes' `uses` lists none of them, so a relative import from `doctypes/test/` fails the architecture check. My best reading, which I am acting on: the script is committed as `doctypes/test/capture-policies.mjs` taking the product root on its command line and loading those files by absolute file URL (as a tool run by hand, never by a test, like `capture-codifier.mjs`); no test imports them, and the fixture records the tiers and versions used. If you would rather add `pdf-reader` and `text-chain` to doctypes' `uses`, or keep the script out of the product tree, say so and I will change it.

## J2 · QUESTION

Replaces nothing; follows B2 (K1918 (3)), which I have applied (relative imports, `unpdf` by package name, tranche merged).

R35's measurement is done, and it lands on either side of the 90% line depending on one thing B2 settled before I had found it: the plane's own Tier 3. The 3 image-only scans (SO 8791, SO 8793, DGO D-12) are read by the ocr-worker member (its committed bundle and engine, tesseract-wasm 0.11.0, booted under miniflare exactly as its own suite boots it), and that is how the plane's reading pipeline captures an image-only PDF (pages joined from the member's line regions).

- Scans counted as not read (B2): 44 of 50 headers read wholly right, 88%: below target, R25–R34 wait.
- Scans read through Tier 3, as the plane captures them: 46 of 50, 92%: above target, R25–R34 are built.
Per field over the 50 (with Tier 3): type 48, number 49, title 49, effective 47/49, supersedes 6/6, reference 18/18, coordinator 16/17, review_due 8/9, revision_cycle 8/9. The four misses: AI 580 misspells its own series ("ADMINSTRATIVE INSTRUCTION"), DGO B-21 prints its date with no label, DGO N-5's text layer lost the word "ORDER", and D-12's OCR interleaves the boxed header's two columns. Caveats I will record either way: the answer key was written by me as a member's reading before any reader existed, but the reader was then tuned on the same 50 it is measured on (in-sample); and the series and labels are a measured stand-in held in the test tree until jurisdictions' first profile holds R67/R69, under which the measurement should be re-run.

Question: does "as the plane captures them" include the plane's Tier 3 for these 3 scans (my best reading, since R35 names the plane's capture and the plane does OCR them)? If yes, 92% and I build R25–R34. If B2's "keep the 3 scans counted as not read" stands, 88% and they wait as a measurement. I am building R25–R34 on my best reading meanwhile; if you rule otherwise I unregister `policy`, keep R1 at seven types, and record the measurement. Booting the OCR member reads ocr-worker's committed bundle and assets as files (no import), with `miniflare` by package name; say if you want that done differently.
