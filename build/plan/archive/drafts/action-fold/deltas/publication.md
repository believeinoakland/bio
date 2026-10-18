# publication — the fold's changes

**Status** · Written by a worker for BOB #74, 2026-09-30. No requirement text changes; two stale marks, which the design (`deltas.md` §4) would strike "once the wiring lands" but which are met now, independent of any wiring.

- **R36** — mark `*(not yet met: K102)*` struck: `registerEvidenceBlock` (`src/publication/index.mjs`:413) is filled by `filings` (`src/filings/index.mjs`:1087) and tested (`test/m/publication/published.test.mjs` "R36 one evidence-package block, filled once …").
- **R37** — mark `*(not yet met: K171)*` struck: `publishedEditionsOf` (`index.mjs`:1082) is built, read by `filings` (`:751`) and tested (`test/m/publication/…` "R37 publishedEditionsOf answers every ratified case edition …").

R16 (`inbandQuartet`) is unchanged; `filings` R22 is its new reader.
