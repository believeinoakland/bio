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

## THE CLOUDFLARE PATH — added 2026-08-04, and it reframes the ranking above

Bob asked whether Cloudflare has a service worth considering, *"from the perspective
of a new instance setting up."* It does, and the question exposes a defect in the
ranking above: **the survey optimised for THIS instance, and the product is SOVEREIGN
INSTANCES.** Every instance the installer creates already HAS a Cloudflare account by
construction. An external service means every future group opens, funds and holds a
credential for a SECOND vendor — a D-115-class distribution liability the table had no
column for.

| | external service (Azure/Google) | Workers AI (Moondream 3.1) |
| --- | --- | --- |
| new vendor account per group | yes — signup, payment card, billing | **none** |
| standing credential in `.env` | yes, a key per instance | **none** — a service binding in `wrangler.jsonc` |
| installer change | docs + per-group manual steps | one binding line; `newgroup` stays one-account |
| third party named in provenance | a NEW one, per transcription | Cloudflare + model + version — already in every instance's trust base |
| cost at our volumes | ~$1/mo plus a billing relationship | free allocation (10k neurons/day, Free plan included) |

**What is actually there** (vendor-stated, retrieved 2026-08-04):

- **Moondream 3.1** (`moondream3.1-9B-A2B`) in the Workers AI catalog — a 9B MoE vision
  model whose declared capabilities are object detection, pointing, **OCR** and
  structured output, **returning coordinates and bounding boxes**. Reached via the
  `env.AI` binding. Model string is pinnable. THE CANDIDATE.
- **`ai.toMarkdown()`** — text-layer PDFs only (we extract those better in-plane) and
  *captions* images rather than transcribing them. NOT a candidate.
- **Containers / Sandbox** running a real engine (RapidOCR is the community pattern) —
  requires the PAID Workers plan, and CPDF-7 made Free-plan viability the floor because
  the installer puts instances into other groups' accounts, most of them Free. FAILS
  DISTRIBUTION.
- **AI Gateway** — proxies external vendors; every group still needs the external
  account. No simplification.
- No classic (non-LLM) OCR engine exists in the catalog. All Workers AI OCR is
  vision-model OCR.

### The cost of the in-account path, and it is exactly one thing

**Moondream is a GENERATIVE vision model, not a classic OCR engine.** It returns
coordinates; it offers **no calibrated per-word confidence contract** of the kind this
survey's constraint column names. A generative model's failure mode is precisely the
minted-text hazard — output that looks BETTER than its input. Third-party blog claims
of *"zero hallucination risk"* on Cloudflare OCR pipelines are marketing and are
labelled as such here.

### What replaces per-word confidence — DEC-35's determination

The record needs the FUNCTION of per-region confidence, not the number. It does two
jobs, and they separate cleanly:

1. **The checkability anchor** — the image region a reader or an attester checks the
   claim against, instead of trusting our transcription. This needs COORDINATES, not
   confidence. Moondream claims them; CPDF-11 VERIFIES they align. Non-negotiable.
2. **The refusal trigger** — garbled region reads `undetermined` rather than a best
   guess (the mojibake rule one layer up). For a confidence-less engine:
   - the chain STATES `ocr(moondream3.1, confidence: none)` — an engine with no
     per-region self-knowledge says so, exactly as an unreadable font does;
   - the engine's transcription-fidelity CAP is set LOWER by measurement — DEC-4's
     existing knob (no machine mints the grade), not new machinery;
   - **pseudo-confidence is FORBIDDEN** — asking the model how sure it is and
     thresholding that as though calibrated is an unearned number dressed as
     calibration, the costs-nothing-to-produce class;
   - **but measured self-refusal is EARNABLE** — CPDF-11's degradation ladder scores
     whether the model refuses or invents on progressively degraded regions. Only that
     measured reliability licenses structured self-refusal as a per-region trigger; if
     it fails, the Moondream path has NO per-region trigger and the cap carries
     everything, which is a statable limit rather than a hidden one;
   - **escalation covers the rest** — a leg needing a higher capture grade than the cap
     allows goes to the calibrated external tier or to member attestation, which is the
     chain shape DEC-4's amendment already anticipated.

**Consequence for the ranking above: it is now the ESCALATION/FALLBACK ranking**, not
the primary one. Azure DI Read remains the primary EXTERNAL candidate. Nothing external
is funded pending CPDF-11.

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
