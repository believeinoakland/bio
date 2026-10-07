# doctypes (T35)

**Status** · session_01Y6hcEDnNpHHyH8SJXrD1tK · depth 2 · WORKING · handled B2

## J1 · QUESTION

R35's capture, "as the plane captures them": PowerDMS serves each OPD/City policy's PDF at its public address (`public.powerdms.com/OAKLAND/documents/<id>`, plus the City's own copies of AI 594 and AI 123), so the 50 are fetched (10 Special Orders, 6 AIs, 34 DGOs). Tier 1 reads almost none of them (fonts without ToUnicode), so the plane's reading is Tier 1 then pdf-worker's Tier 2 (unpdf 1.8.0), merged by text-chain's `mergeTier2Text`. 47 of 50 carry text; 3 are image-only scans (SO 8791, SO 8793, DGO B-08), which only OCR would read: I keep them in the 50 and count them as not read.

The question: the hand-run capture script needs `bio-plane/src/pdfstructure.mjs` (pdf-reader), `bio-plane/src/textchain.mjs` (text-chain) and pdf-worker's `unpdf`; doctypes' `uses` lists none of them, so a relative import from `doctypes/test/` fails the architecture check. My best reading, which I am acting on: the script is committed as `doctypes/test/capture-policies.mjs` taking the product root on its command line and loading those files by absolute file URL (as a tool run by hand, never by a test, like `capture-codifier.mjs`); no test imports them, and the fixture records the tiers and versions used. If you would rather add `pdf-reader` and `text-chain` to doctypes' `uses`, or keep the script out of the product tree, say so and I will change it.
