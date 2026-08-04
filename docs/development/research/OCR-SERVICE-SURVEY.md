# OCR service survey — input to DEC-35

Session BOB, 2026-08-03, at Bob's direction. **Every number here is a VENDOR CLAIM
or a third-party report gathered from the web on this date, not a measurement.**
Prices move; verify against the vendor's page before funding anything. The
measured facts this survey composes with are in `MEASUREMENTS.md` (2026-08-03):
the local tesseract floor a service must beat — 99.96% character accuracy, 90/90
digits, zero minted digits on the ground-truthed page — and the bundle-size
finding that ruled out in-account WASM placements.

## DEC-35's constraints, restated as columns

A candidate is only viable if it: (a) returns PER-REGION CONFIDENCE and
COORDINATES (the provenance chain and the image-region anchor need both, DEC-4);
(b) has terms permitting processing of public government records; (c) has an
identity and VERSION that can be pinned into the provenance chain — a
transcription is only checkable if you can say who made it, and a service that
retrains silently under one name fails that.

## The table (vendor-stated, 2026-08-03)

| Service | Cost / 1k pages | High-volume | Free tier | Per-region confidence | Coordinates | Version pinnable | Data use for improvement | Handwriting |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Azure AI Document Intelligence — Read** | $1.50 | $0.60 >1M/mo; $0.45 commitment | 500 pp/mo standing (F0: first 2 pages/doc, 4MB cap) | word confidence | word polygons | **YES** — dated `model-version` + `api-version` params | not used to train without consent (vendor claim) | yes |
| **Google Document AI — Enterprise Document OCR** | $1.50 | $0.60 >5M/mo | none standing ($300 new-account credit; free-trial tier retired 2026-04) | token/symbol confidence | bounding polys | **YES** — named `processorVersion` selected per call | not used to train without permission (vendor claim) | yes |
| **AWS Textract — DetectDocumentText** | $1.50 | $0.60 >1M/mo | 1k pp/mo, FIRST 3 MONTHS only | word/line confidence | bbox + polygon | **NO** — service-managed model, no user-visible version | **used BY DEFAULT**; opt-out only via AWS Organizations policy | yes |
| **Google Cloud Vision — DOCUMENT_TEXT_DETECTION** | $1.50 (per 1k images/pages) | tiered | 1,000 units/mo standing | word/symbol confidence | bounding boxes | partial — feature, not a named model version | not used to train (vendor claim) | yes |
| **Mistral OCR 4** | $4.00 ($2.00 batch API) | — | unverified | **per-word confidence** (new in v4, 2026-06) | bboxes + typed blocks | **YES** — dated model string | API data not used for training on paid tiers (vendor claim, unverified) | claimed strong; OlmOCRBench 85.20 |
| **OCR.space** | $0 (free API) | paid tiers exist | 25k req/mo, 500/day/IP, 1MB/file | weak/engine-dependent | word overlay boxes | no | files deleted after processing (claim); informal terms | poor |

Notes that do not fit a cell:

- **Cloud Vision's PDF path is clunkier than it looks**: multi-page PDFs go through
  an async batch flow staged in GCS — an extra moving part and an extra data hop
  the other three do not require. Its standing free quota still makes it a cheap
  PROBE.
- **Azure's F0 free tier reads only the first 2 pages of any document** — useless
  for production, exactly sufficient for the ground-truth probe.
- **Textract's two marks against are both provenance marks**, not quality marks:
  no pinnable version (the chain can name only service+date, and a silent retrain
  changes the claim-maker under an unchanged name), and content used for service
  improvement by default (public records per DEC-5, so not a privacy issue — but
  an account-level policy we would have to set and state).
- **At Oakland's measured volumes, price does not discriminate.** The scanned
  class was ~14% of a 14-document sample (CPDF-5); even generous assumptions put
  monthly OCR volume in the hundreds of pages, ~$0.30–$1/mo at the standard rate.
  The discriminators are the provenance columns, not the cost column.

## Ranking against DEC-35's constraints

1. **Azure Document Intelligence Read** — ticks every structural box: pinnable
   dated model version, word confidence + polygons, standing free tier sized for
   the probe, cheapest committed path ($0.45/1k). Primary candidate.
2. **Google Document AI Enterprise OCR** — structurally equal (pinnable processor
   versions, token confidence); loses only on no standing free quota for the
   probe. Close second; the ground-truth probe should still include it (the $300
   credit covers it).
3. **Mistral OCR 4** — newest, per-word confidence, pinnable, benchmark-strong;
   2.7× the price and the least operational history. Worth including in the probe
   if cheap to do; not the default.
4. **Textract** — price-equal but fails the version-pinning constraint outright.
   Only reachable if the probe shows a decisive accuracy win.
5. **OCR.space** — fails the confidence constraint; a free floor, not a candidate.
6. Excluded from the table: LLM-vision endpoints (Gemini, GPT-4o class) — no
   per-region confidence contract, no stable coordinates, and a hallucination
   failure mode that is precisely the minted-text hazard CPDF-9's negative
   control exists to catch.

## What decides it

The survey RANKS; the ground-truthed page DECIDES. CPDF-9's instrument (the
ground-truthed Oakland exhibit, digit-level scoring) run through the top
candidates' free tiers costs nothing and produces the number the choice actually
turns on — accuracy against the 99.96%/90-90-digits tesseract floor. Vendor
benchmark claims above are labelled as theirs; none of them is that number.

Sources (retrieved 2026-08-03): aws.amazon.com/textract/pricing ·
cloud.google.com/document-ai/pricing · cloud.google.com/vision/pricing ·
learn.microsoft.com (Azure DI pricing Q&A) · docs.aws.amazon.com (AI services
opt-out policies) · aws.amazon.com/textract/faqs · mistral OCR 4 launch coverage
(marktechpost.com 2026-06-23, explainx.ai) · ocr.space/ocrapi.
