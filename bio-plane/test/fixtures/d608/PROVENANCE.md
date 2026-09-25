# D-608: one page of a public financial report, with text inside Form XObjects

| file | sha256 | bytes | serves |
| --- | --- | --- | --- |
| `acfr-fy2023-24-p39.pdf` | `5878cac9d67135397eb494fb332b7d8b9abbf066143a108e062923f380026898` | 79,008 | the REAL PAGE arm of `bio-plane/test/d608-form-text.test.mjs`. 34 of its 40 text-show operators are inside Form XObjects (the labels of two pie charts). Tier 1 read 80 glyphs here before D-608 and reads 546 after, which is tier 2's count (M-166, M-174). |

## Where it came from

- **Document:** City of Oakland, *Annual Comprehensive Financial Report, fiscal year ended June 30, 2024*,
  published by the Oakland Finance Department. It is a public record that the City publishes for anyone to read.
- **Source:** `https://www.oaklandca.gov/files/assets/city/v/1/finance/documents/financial-reporting/annual-comprehensive-financial-reports/2024-city-of-oakland-acfr_final-121324.pdf`
- **Held capture:** instance `biosmoke7`, store `bio`, bundle `INFO-2026-0103-acfr-fy2023-24-pdf`, captured
  2026-07-19T19:15:50Z, whole-file sha256 `4cb9b8ad38c9708407874e8c987fa7d77ee3fcc8b1635d7769db4b659c44fa03`
  (5,995,747 bytes). It was fetched 2026-09-25 with `op=capture` and matched that sha on arrival.
- **Page:** page index 38 (0-based, I2's numbering), which is the 39th page and is printed as "13" (Management's
  Discussion and Analysis).

## How the one page was made, and what that means

This file is a **DERIVED EXTRACT**, not the publisher's bytes. The page object and every object it reaches
were copied into a new one-page file, except `/Parent`, `/Annots` and `/StructParents`. Every stream went
across **raw, with its own filters**, so no content stream, font or form was re-encoded. The object numbers
were renumbered and a new catalog, page tree and xref were written. The tool was a scratch script that used the
module's own `PdfDoc` reader. It is not committed; this paragraph is its logic.

**Checked against the whole document:** tier 1's text for this page is byte-identical whether it is read from the
extract or from page index 38 of the full capture. Tier 2 (`unpdf`) reads 546 glyphs on both. Neither reading
paints any image.
