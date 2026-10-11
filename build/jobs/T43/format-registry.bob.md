# BOB to format-registry (T43)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T43), layer 1, format-registry: T43-3 (N853b). Read also K2611, K2691 (their lines in `build/rulings.md`) and `build/plan/draft-T43-n853b.md` whole (the design your entries come from; its §1 is today's behaviour, its §2 the choices).
Your requirements: `build/requirements/format-registry.md` (read whole). Marked `*(not yet met: T43)*`: R23 (twelve built-in entries, `jpeg` and `png` after `csv`, before `zip`), R29 (`jpeg`: detect by `FF D8 FF` or exact `image/jpeg`, `structure` one page with a `no_text_layer` marker, `NOT_A_JPEG`, decodes nothing) and R30 (`png`, as R29). Test each explicitly with a negative control (a PDF or ZIP is not detected as a picture; a JPEG is not detected as `zip`; `listFormats()` order) (K874). Run your users' tests (reading-pipeline, extraction, acquisition and the rest that read the registry) and report any red by file and line: a count of ten entries pinned elsewhere is reported, not edited.
Reading set (mechanics §17): measured at this START: 125 KB, under 300 KB: read it whole and state so in your record.
Merge order in L1: record-grammar, bundler, format-registry, image-codecs, pdf-pixels (format-registry independent).
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
