# D-627: nine pages of a public budget book whose content is a painted image and whose only text is a folio

| file | sha256 | bytes | serves |
| --- | --- | --- | --- |
| `fy2325-budget-p633-651.pdf` | `481099369d7ae92dcfdbd965be654cc236a9cb152bb9a560b851eebcc109ad34` | 20,963 | the REAL PAGES and THE ROUTE arms of `bio-plane/test/d627-image-content.test.mjs`. Each page paints images of a table or of text, and its only text is a three-digit folio drawn inside a Form XObject in an Arial with no `/ToUnicode` (M-174). Tier 1 marks every one `image_content_unread` and the plane routes all nine to OCR (M-178). |

## Where it came from

- **Document:** City of Oakland, *FY 2023-25 Adopted Policy Budget*, published by the City's Finance Department.
  It is a public record that the City publishes for anyone to read.
- **Held capture:** instance `biosmoke7`, store `bio`, bundle `INFO-2026-0301-fy-2023-25-adopted-policy-budget-book`.
  The file is held in two parts, `159a0b7e9c21337c8de5c9b577d8dc7d8baba86ef45f4678518273a5f4539855` (25,165,824 B)
  and `7e6e1501bbfce563711d8f0aaa93cca4e213d2ecd8d6a39c3313bff1b72f6416` (16,337,080 B). They were fetched on
  2026-09-25 with read-only `op=capture` GETs, each matched its sha256 on arrival, and together they reassemble to
  the registered whole file `3f21377d8b8e190a01daf6428ab52eb1fb2d5d37c0edda32e3fa30c9ff177dd8` (41,502,904 B), as
  M-166 and M-174 found.
- **Pages:** page indices 633, 634 and 645 to 651 (0-based, I2's numbering). They are pages 0 to 8 of this file, in
  that order.

## How it was made, and what that means

This file is a **DERIVED STRUCTURAL EXTRACT**, not the publisher's bytes. The nine page objects and every object
they reach were copied into a new file. From the page objects, `/Parent`, `/Annots`, `/StructParents`, `/B`,
`/Thumb`, `/PieceInfo` and `/Metadata` were dropped. Content streams, forms, fonts and CMaps went across **raw, with
their own filters**. The object numbers were renumbered, and a new catalog, page tree and xref were written.

**Image SAMPLES were dropped.** Each of the 18 image XObjects keeps its dictionary (`/Width`, `/Height`, `/Filter`)
but its stream is empty and carries `/D627SamplesDropped /true`; its `/SMask` was removed. That took out 1,526,074
bytes of JPEG 2000 samples. The marker reads where an image is PAINTED (the CTM at its `Do`) and never its samples,
so nothing it reads was removed. This file cannot be rendered or OCR'd, and the suite's OCR member is a stub.

The tool was a scratch script that used the module's own `PdfDoc` reader. It is not committed; this section is its
logic.

**Checked against the whole document:** for each of the nine pages, tier 1's text, its undetermined markers
(including `image_content_unread` with the same `image_share` and `glyphs`) and the painted images' rectangles,
names, dimensions and filters are identical whether they are read from this extract or from the full capture.
9 of 9 pages matched.
