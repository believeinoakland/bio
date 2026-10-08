# BOB to doc-clean (T39)

**Read** · handled J1

## B1 · START

Depth 2. You build a new module. Your entry: `build/plan/current.md` (T39), layer 1, doc-clean: T39-2c (N806). Read also the plan's "Rules at the opening", K2248, K2315, K2333 and K2334 (Bob's: a member-supplied document's own metadata is removed too) in `build/rulings.md`, and `build/plan/draft-T39-N806.md` whole (the packaging, the refusals, the tests).
Your requirements: `build/requirements/doc-clean.md` (read whole; every id is yours, marked `*(not yet met: T39)*`). `modules.json` lists you with empty `paths` and `tests` (K1043): create `bio-plane/src/doc-clean/` and `bio-plane/test/m/doc-clean/` and name them in your COMPLETE; BOB fills them in before your ownership check.
You use two services built concurrently in this layer: image-cover's `stripMetadata` and pdf-reader's `PdfDoc.objects()`. Build and test against their requirement text; merge the tranche branch into yours when BOB tells you each has merged (CHANGE), and finish your tests against the merged code. You merge last in L1.
Test fixtures: generate them in tests (`test-support`'s zip helper, small PDFs written by your tests); no binary fixture over 64 KB. Measure R4's size limit in the plane's isolate as the requirement says, or state in your record how you measured it.
P6: a new module, expected about 1,200–1,800 lines; report if you would pass about 4,000.
Reading set (mechanics §17): 64 KB (its own requirements and the used modules' public parts), under the 300 KB limit: read it whole, and state in your record that you did.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.
Merge order in L1: bundler → pdf-reader → image-cover → doc-clean (doc-clean uses the other two and merges last).
Inherited reds: the plan's rule 3 list as it stands at your START (read it there).

## B2 · CHANGE

pdf-reader is merged into tranche/T39 (K2345): R37 `PdfDoc.objects()` is built as its requirement states. Merge tranche/T39 into your branch and build and test against the merged code.

## B3 · ANSWER · re J1

Answers to J1 (K2346). Your readings 3, 4, 5 and 6 stand as you wrote them (6: the extra fields are the same kind K2334 covers, nothing visible changes).
1. Done: `modules.json` gives doc-clean `office-readers` and `odf-reader` (both earlier, layer 1), and its Uses names them for R5's test. Merge tranche/T39.
2. qpdf: call it when on PATH and skip by name otherwise, as you propose; record the results you ran here. pdfjs-dist: the same for now; adding it as a dev dependency of `bio-plane/package.json` is the plane's file, so it goes to T39's L11 plane share (N810), after which the skip no longer fires in CI.
7. A signed PDF: remove the signer's identity from each signature dictionary (`/Name`, `/Contents`, `/Location`, `/Reason`, `/ContactInfo`, `/M`), keeping the field unsigned; the rewrite voids the signature anyway. R6 now says so (merge tranche/T39); test it.
pdf-reader is merged (B2). image-cover is not yet.

## B4 · CHANGE

image-cover is merged into tranche/T39 (K2347): R8 `stripMetadata` is built as its requirement states. With pdf-reader (B2) both services you use are merged: merge tranche/T39 into your branch and finish your tests against the merged code.

## B5 · CHANGE

CHANGE (K2351): your findings are taken into this job. Merge tranche/T39: doc-clean.md R3 gains EMBEDDED_MEDIA (a video, audio, PDF RichMedia or 3D part is refused, never carried) and R6 removes printerSettings and customXml parts with their relationships, an EMF description string, SVG editor-namespace attributes and elements, JBIG2 comment segments, and a legacy Excel comment's leading author run. Build and test each, then record COMPLETE again. modules.json now carries your paths and tests. The pdf-reader findings are N813 for the next tranche.
