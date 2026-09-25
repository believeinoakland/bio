/* CPDF-10: THE TRANSCRIPTION PROVENANCE CHAIN.
 *
 * "THE PROVENANCE RULE IS THE ITEM, not the engine" (QUEUE.md CPDF-10). This
 * module is that rule, and it holds NO engine: it does not render a page, does
 * not run an OCR pass, and does not know what tesseract or Moondream or Azure
 * DI Read are. It knows what a DERIVATION is, what a derivation may claim, and
 * what it may never claim — so the day an engine arrives (CPDF-12's fleet
 * member, or an external tier if that is ever funded) the honesty rules are
 * already built, already driven, and already refusing.
 *
 * That ordering is deliberate rather than a consequence of the renderer being
 * late. The hazard this capability carries is OUTPUT THAT LOOKS BETTER THAN ITS
 * INPUT: an OCR pass turns a scan into fluent prose, an AI clean-up turns
 * garbled OCR into readable English, and at the end of it the record holds a
 * paragraph indistinguishable from one a publisher typed. CPDF-11 MEASURED that
 * hazard rather than supposing it — Moondream at 75 dpi with blur produced
 * 16-20 minted digits per run in prose "structurally perfect and
 * indistinguishable from a clean run", turning $50,000 into $10,000 and
 * "lowest responsible bidder" into "least responsible bidder", and REFUSED
 * NOTHING while doing it. Nothing downstream can tell those apart from the
 * text. Only the chain can.
 *
 * ===================================================================== *
 * THE FOUR RULES, each of which is a refusal below and an arm in the suite
 * ===================================================================== *
 *
 * 1. A CHAIN, NEVER A TOKEN. `text_source` was the string "layer" (FW-15,
 *    D-152's discriminator, correct for its day). It is now an ORDERED ARRAY
 *    of steps, each naming what performed it:
 *
 *        pixels -> ocr(engine, version) -> ai(function, version)
 *                                       -> attested(member, date, extent)
 *
 *    A single label is REFUSED (TEXT_CHAIN_COLLAPSED). This is not fussiness
 *    about types: "ocr" as a label loses which engine, and an engine is what a
 *    calibration is OF (CPDF-13) and what a reader would have to re-run to
 *    check the claim. A chain that collapses is a chain that cannot be audited.
 *
 * 2. EVERY DERIVATION STEP WEAKENS. Never strengthens. Each step carries a
 *    `cap` — the strongest transcription-fidelity letter that step can support
 *    — and the chain's cap is the MINIMUM over its derivation steps, computed
 *    here rather than declared by a caller. Appending a step that claims a
 *    STRONGER cap than the chain it extends is REFUSED (TEXT_CHAIN_STRENGTHENS),
 *    and the refusal names the exact case it exists for: an AI that cleans a
 *    garbled line produced more READABLE text, not more RELIABLE text.
 *
 * 3. CONFIDENCE WHERE THE ENGINE SUPPLIES IT, `none` STATED OTHERWISE, AND
 *    PSEUDO-CONFIDENCE FORBIDDEN (DEC-35's confidence contract). A confidence
 *    number is only a number when a CLASSIC engine computed it from its own
 *    decode. Asking a generative model how sure it is and thresholding the
 *    answer as if calibrated is the costs-nothing class CLAUDE.md rules out,
 *    and it is REFUSED by BASIS (TEXT_CHAIN_PSEUDO_CONFIDENCE) rather than by
 *    a value range — because a self-reported 0.99 and a computed 0.99 are the
 *    same bytes and can only be told apart by who produced them.
 *
 * 4. A REGION BELOW THE FLOOR READS `undetermined`, NEVER A BEST GUESS. And
 *    the text of a refused region is DISCARDED here, not carried alongside a
 *    flag — a best guess sitting in a field beside its own warning is one
 *    careless join away from being read as content.
 *
 * ===================================================================== *
 * ATTESTATION IS NOT A DERIVATION STEP, AND THAT IS THE SUBTLE PART
 * ===================================================================== *
 *
 * Rule 2 says every step weakens. Attestation plainly does not weaken — member
 * attestation is the only route to the top (DEC-4's doctrine, unchanged). The
 * resolution is NOT an exception to rule 2; it is that `attested` is a
 * VERIFICATION step and not a derivation at all:
 *
 *   - `derivationCap(chain)` is the min over DERIVATION steps and is never
 *     raised by anything, including an attestation. The chain still RECORDS
 *     the attestation, because the record is the record.
 *   - `gradeCeiling(chain, extent)` is what a leg may claim, and THERE an
 *     attestation covering the extent supersedes the derivation cap.
 *
 * QUEUE.md CPDF-10 states exactly this and it is worth quoting rather than
 * paraphrasing: "verification supersedes it as grade determinant, never as
 * record". The two functions are the two halves of that sentence, and the
 * suite drives both, because collapsing them is how an attestation would come
 * to look like a derivation that made the text better.
 *
 * AND ATTESTATION IS SCOPED. A member attests to WHAT THEY CHECKED — a page, a
 * region, or the document — and a leg citing outside that extent DOES NOT
 * INHERIT IT. `extentCovers` is that rule, and it defaults to NOT covering:
 * an extent this module cannot parse covers nothing, because the failure that
 * matters is an unreadable extent silently reading as "all of it".
 *
 * ===================================================================== *
 * WHAT THIS MODULE DELIBERATELY DOES NOT DO
 * ===================================================================== *
 *
 * It does not grade a capture. `captureBound` returns the BOUND transcription
 * fidelity places on the capture axis and nothing else: DEC-4's doctrine is
 * that fidelity BOUNDS the capture axis as its weakest link, so there is no
 * third scale and no new machinery. The letters are `BASIS_GRADES` and the
 * ceiling is `EARNED_CAPTURE_CEILING` — both IMPORTED from the catalogue, both
 * already the only spelling this project has, and neither re-typed here. If a
 * fifth grade letter is ever added, this module follows without an edit.
 *
 * It does not decide whether OCR should run. That is the wire's, in index.mjs.
 *
 * It holds NO ENGINE and NO CALIBRATION. `cap` arrives as a parameter because
 * it is a MEASUREMENT (MEASUREMENTS.md, per engine, per version) and this
 * module must not become a second place a measured number lives — the failure
 * CLAUDE.md records as this project's most-repeated. CPDF-13 builds the
 * calibration construct that supplies it; until then a caller passes the
 * measured letter and NAMES where it was measured.
 */

import {
  TEXT_CHAIN_CHECKS, BASIS_GRADES, EARNED_CAPTURE_CEILING, isMachineIdentity,
} from "../checks/bio-checks.mjs";

/* ------------------------------------------------------------------ *
 * The vocabulary
 * ------------------------------------------------------------------ */

/** The step kinds, and the ONE thing that distinguishes them: whether the step
 *  DERIVED the text (and therefore may only weaken it) or VERIFIED it (and
 *  therefore bears on the grade without touching the derivation cap).
 *
 *  A new step kind is added HERE and every rule below follows it. Nothing in
 *  this module tests a step name against a literal; `STEP_KINDS[k].role` is
 *  the question everything asks, so a step nobody classified cannot slip
 *  through as a derivation OR as a verification — it is refused as unknown. */
export const STEP_KINDS = {
  /* The document's own text layer, decoded through the file's own /ToUnicode
     map. NOT a strong step and never was: a text layer is ITSELF an unverified
     transcription — CPDF-9 measured that 3 of 14 recent Legistar attachments
     name ABBYY FineReader in their producer metadata, so the Clerk's certified
     enacted resolutions carry somebody else's machine OCR as their text layer.
     The record has been reading those as authored text. It now says what they
     are. */
  layer:    { role: "derivation", label: "the document's own text layer", tier: "step" },
  /* A page turned into pixels — rendered, or (CPDF-12's observation, to be
     verified across the corpus) EXTRACTED, where a scanned page is one
     full-page embedded image and rasterising it would be work nobody needs. */
  pixels:   { role: "derivation", label: "the page as pixels", tier: 3 },
  /* An OCR engine over those pixels. Names engine and version, because that
     pair is what a calibration is of and what a re-run would need. */
  ocr:      { role: "derivation", label: "optical character recognition", tier: 3 },
  /* A model that rewrote the text — cleaning, joining, correcting. THE STEP
     THIS WHOLE MODULE IS MOST AFRAID OF, and rule 2 is pointed at it. */
  ai:       { role: "derivation", label: "a model rewrote the text", tier: null },
  /* A member checked the text against the image and said so, over a stated
     extent. Not a derivation: see the header. */
  attested: { role: "verification", label: "a member checked it against the image", tier: null },
  /* CAP-10 / DEC-75 / IC-122 — A CONVERSION OF THE DOCUMENT, MADE BY WHOEVER
     SERVED IT, BEFORE ANY TEXT WAS READ OUT OF IT. The case it exists for is a
     Google Drive export: the record fetched Google's OpenDocument RENDERING of
     a file nobody outside Google has seen, made at fetch time and not
     reproducible (D-351). Capture grade is about the FETCH PATH and stays
     `direct`/B (DEC-75); what Google did to the document is a transformation
     of the TEXT, so it is a derivation step here and rule 2 governs it.

     `convert(producer, format)` is carried as `{ step: "convert", engine:
     <producer>, format: <format> }`. THE PRODUCER RIDES `engine` DELIBERATELY:
     `engine` is the one field this grammar already has for "what performed a
     derivation", and it is what a calibration is OF (CPDF-13), what
     `#writeTextSource` projects into `engines`, and what `describeChain`
     prints. A second field name for the same fact would split every one of
     those joins in two.

     THREE DECLARED PROPERTIES, and each is read by a rule below rather than by
     a test against the word "convert":

       `names`      the fields the step must carry, non-empty. A conversion that
                    does not say who converted, or into what, is rule 1's collapse
                    one level down (C-35.5).
       `unmeasured` "undetermined": an UNMEASURED conversion makes the whole
                    document's cap UNDETERMINED, instead of the landed sequence
                    rule where an unmeasured step neither raises nor lowers. The
                    reason is where the step sits. Every later step measured the
                    CONVERTED text against the CONVERTED bytes; none of them saw
                    the original, so no downstream measurement bounds what the
                    conversion lost. `derivationCap` explains it at the site.
       `letter`     "calibrated": a letter on this step must NAME the calibration
                    it rests on (C-35.13). DEC-75: the step is raised by a
                    calibration row, never by a caller writing a letter.

     `tier: null` — a conversion is not a rung on the extraction ladder. It is
     how the BYTES came to be; the `layer` step after it is the extraction. */
  convert:  { role: "derivation", label: "the document as converted by the host that served it",
              tier: null, names: ["engine", "format"], unmeasured: "undetermined", letter: "calibrated" },
  /* REC-87 / IC-127 — A MEMBER TYPED THE TEXT (Bob's 5.2, CONTENT-EXTENT-DESIGN-
     SPACE.md §5.2). The case it exists for is his: a hundred-year-old title, a
     photocopy of a mimeograph, terms in cursive no engine reads and a person can.
     The member selects a portion and types what it says.

     A DERIVATION, NOT A VERIFICATION, and that is the ruling rather than a
     classification of convenience: there is no machine text the member is
     checking — they PRODUCED the text, so it is authored with the provenance of an
     authored act, and rule 2 governs it like any other step that produced text.
     What RAISES it is a SECOND member's attestation (`gradeCeiling`, unchanged),
     never the transcriber's own — the store refuses that by name (C-52).

     `typed(member)` is carried as `{ step: "typed", member: <handle>,
     text_sha256: <digest of the typed text> }`. The digest binds the step to the
     text it produced, so a content row's id (hash of capture, extent, chain)
     differs for different text and an attestation of one typing can never be read
     as an attestation of another.

     THREE DECLARED PROPERTIES, each read by a rule rather than by a test against
     the word "member":

       `names`      the member must be named (C-35.5) — a transcription nobody
                    typed is not one.
       `unmeasured` "undetermined", CAP-10's property, and HERE IT IS NOT AN EDGE
                    CASE — it is the whole of the member's cap. A person is not an
                    engine with a calibration; the sequence rule (an unmeasured step
                    neither raises nor lowers) would let an OCR letter measured on
                    OTHER text silently bound what the member typed, which is the
                    swallow this property exists to refuse. `derivationCap` answers
                    UNDETERMINED over the member's extent, and so `captureBound`
                    does too, with no code beyond the kind.
       `letter`     "never": a letter on this step is refused (C-35.14). Not
                    "calibrated" — there is no calibration of a person to name, so
                    the permitted route to a letter is the attestation, and only
                    that.

     `tier: null` — typing is not a rung on the extraction ladder.

     THE KIND IS SPELLED `typed`, NOT `member`, AND THE ROW SAID `member(handle)`.
     Measured, not preferred: the query compiler DERIVES its `content:chain`
     vocabulary from these keys (`query.mjs`), and `member` is already a bare word
     of the same arm — `content:member`, a document a MEMBER marked (`minted`).
     A kind named `member` made that published query AMBIGUOUS and refused it
     (content-arm.test and meaningquery.test went red on exactly that). The
     handle still rides the step's `member` field, so the notation is
     `typed(member)`. */
  typed:    { role: "derivation", label: "a member typed the text",
              tier: null, names: ["member"], unmeasured: "undetermined", letter: "never" },
};

/** The BASES a per-region confidence number may have, and this enum IS the
 *  pseudo-confidence fence. `engine` means a classic decoder computed it from
 *  its own character-level decode (tesseract's per-word confidence). `none`
 *  means the engine supplies none, STATED first-class rather than defaulted to
 *  a number. There is deliberately no third value: a model's self-report has
 *  no basis to name, which is the point — it is refused because it cannot say
 *  where its number came from. */
export const CONFIDENCE_BASES = { engine: 1, none: 1 };

/** The extent kinds an attestation may be scoped to, narrowest first. */
export const EXTENT_KINDS = { region: 1, page: 1, document: 1 };

/* ===================================================================== *
 * D-252 — A DERIVATION HAS AN EXTENT TOO, AND IT IS THE MIRROR OF THE ONE
 * ATTESTATION ALREADY CARRIES.
 * ===================================================================== *
 *
 * CPDF-10 built this module for a document with ONE provenance: every step
 * derived every character. A MIXED document breaks that assumption and it is an
 * ordinary Council packet shape — a text-layer report with three scanned
 * exhibits stapled to the back. Its pages have DIFFERENT provenance: some came
 * out of the file's own text layer, some out of an OCR engine. Neither chain is
 * the document's chain, and picking either one is the record claiming something
 * about pages it did not describe.
 *
 * SO A DERIVATION STEP MAY NAME WHAT IT COVERS. `step.extent` is
 * `{ kind: "pages", pages: [<0-based>, ...] }`, and three cases are distinct:
 *
 *   ABSENT      — the step derived the whole document. Every chain written
 *                 before this rule existed is this case, which is why the field
 *                 is absent rather than defaulted to something: an unscoped
 *                 chain means exactly what it always meant.
 *   PAGES       — the step derived those pages and NOTHING ELSE.
 *   UNREADABLE  — an extent this module cannot parse covers NOTHING, and the
 *                 document's cap becomes undetermined. That direction is
 *                 `extentCovers`' own (an unreadable extent must never silently
 *                 read as "all of it"), applied to the other half of the module.
 *
 * AND THE RULE THAT MATTERS IS ABOUT THE CAP, NOT ABOUT THE TEXT. A mixed
 * document's derivation cap is the weakest over its PARTS, and a part with no
 * measured cap makes the whole UNDETERMINED — because there is then a stretch of
 * this document's text that nothing measured bounds.
 *
 * That last sentence is the whole reason this exists, so it is worth being
 * explicit about the mistake it refuses. A text layer's fidelity is `null`:
 * UNDETERMINED, STATED (CPDF-10's finding — a layer is authored text and
 * third-party OCR mixed together, ABBYY FineReader in 3 of 14 recent Legistar
 * attachments, and nobody has separated them). An OCR pass is a measured `C`.
 * If a mixed document's cap came out `C`, that null would have been quietly
 * RESOLVED INTO A LETTER for the layer pages — and downstream that is not a
 * cosmetic difference: `gradeCeiling` reads a null cap as "undetermined, which
 * is a statement, not a permission" and a `C` as permission up to C. The merge
 * would have handed a leg citing an unmeasured text layer a ceiling nobody
 * measured. `null` is not a weaker letter. It is the absence of one, and it
 * stays that way.
 *
 * NOTE THE ASYMMETRY WITH "A STEP WITH NO CAP NEITHER RAISES NOR LOWERS", which
 * is the landed rule for an UNSCOPED step and is not disturbed here. An unscoped
 * unmeasured step sits in sequence over text another step DID measure, so that
 * measurement still bounds it. A SCOPED unmeasured step covers text no other
 * step measured at all. Sequence and partition are different questions and this
 * module now asks them separately. */

/** What a derivation step covers: the string "all", the string "unreadable", or
 *  an array of 0-based page numbers. Never throws and never guesses. */
function extentOf(step) {
  const e = step.extent;
  if (e == null) return "all";
  if (e && typeof e === "object" && !Array.isArray(e) && e.kind === "pages"
      && Array.isArray(e.pages) && e.pages.length
      && e.pages.every((p) => Number.isInteger(p) && p >= 0)
      /* D-635: a `part` that is present must be a readable index, or the extent is unreadable. */
      && (e.part === undefined || (Number.isInteger(e.part) && e.part >= 0)))
    return e.pages;
  return "unreadable";
}

/* D-635 — WHICH PART A SCOPED STEP BELONGS TO. Until D-635 the parts PARTITIONED the pages, so a part was
   named by its page list. BOB #35 ruled at 06:25Z that a routed page whose folio decoded keeps its layer text
   and gains the transcription, and is listed in BOTH parts. Two parts can then share a page, and can even
   share their whole page list (a scanned book with a decoded folio on every page). So `mergedChain` stamps
   each part's index as `extent.part` whenever its parts overlap, and a part is named by that index. A chain
   whose parts partition carries no `part`, byte for byte as before, and is still named by its pages. */
function partKeyOf(step) {
  const e = step.extent;
  return Number.isInteger(e && e.part) ? `#${e.part}` : extentOf(step).join(",");
}

/** "page 3" / "pages 0-2" / "pages 0-1, 4" — contiguous runs collapsed, because
 *  a scanned exhibit is a RUN of pages and a chain sentence listing forty of
 *  them individually is one nobody reads. */
function pageList(pages) {
  const runs = [];
  for (const p of pages) {
    const last = runs[runs.length - 1];
    if (last && p === last[1] + 1) last[1] = p; else runs.push([p, p]);
  }
  return `${pages.length === 1 ? "page" : "pages"} `
       + runs.map(([a, b]) => (a === b ? `${a}` : `${a}-${b}`)).join(", ");
}

/** Does this step cover this page? An unscoped step covers every page; an
 *  unreadable extent covers none. Exported because the wire and the suite both
 *  need to ask it, and a second implementation of it would be D-164's lesson. */
export function stepCovers(step, page) {
  if (!step || typeof step !== "object") return false;
  const ext = extentOf(step);
  if (ext === "all") return true;
  if (ext === "unreadable") return false;
  return Number.isInteger(page) && ext.includes(page);
}

/** Build a document's chain from the chains of its PARTS.
 *
 *  `parts` is `[{ chain, pages }]` — one entry per stretch of the document with
 *  its own provenance. Each part's chain is stamped with the pages it covers and
 *  the parts are CONCATENATED — deliberately not appended through `appendStep`,
 *  because rule 2's monotone comparison is about a step extending what it
 *  RECEIVED, and one part did not receive the other. Rule 2 still holds WITHIN
 *  each part: every part arrives here already built by `appendStep`.
 *
 *  THE FUNCTION IS TOTAL, and the two degenerate cases are the point rather than
 *  defensive padding, because they are the cases that occur:
 *
 *    NO parts  -> `null`. No text surface answered, so there is no chain to
 *                 record — which is a different fact from an empty chain and is
 *                 what the wire already carries for a document it never read.
 *    ONE part  -> that part's chain, UNSCOPED and unchanged. A document with one
 *                 provenance is not a mixed document, and scoping its only chain
 *                 to "all its pages" would dress a whole document as a partition
 *                 and quietly change what every chain written before D-252 says.
 *                 This is why a wholly-scanned document and a wholly-text-layer
 *                 one record exactly what they recorded before this rule existed.
 *
 *  A refusal from `checkChain` is returned as-is, so a malformed part cannot
 *  become half a chain. */
export function mergedChain(parts) {
  if (!Array.isArray(parts) || parts.length === 0) return null;
  if (parts.length === 1) {
    const bad = checkChain(parts[0] && parts[0].chain);
    return bad || parts[0].chain;
  }
  const out = [];
  /* D-635: do any two parts share a page? Only then is each part's index stamped (see `partKeyOf`). */
  const seen = new Set();
  let overlap = false;
  for (const part of parts)
    for (const p of new Set(Array.isArray(part && part.pages) ? part.pages : [])) {
      if (seen.has(p)) overlap = true;
      seen.add(p);
    }
  for (const [index, part] of parts.entries()) {
    const bad = checkChain(part && part.chain);
    if (bad) return bad;
    const pages = Array.isArray(part.pages)
      ? [...new Set(part.pages.filter((p) => Number.isInteger(p) && p >= 0))].sort((a, b) => a - b)
      : [];
    for (const step of part.chain) {
      /* A VERIFICATION step is copied through UNSCOPED. Attestation carries its
         own extent, checked by `extentCovers`, and stamping a second one on it
         would give one fact two homes that can disagree. */
      out.push(STEP_KINDS[step.step].role === "derivation"
        ? { ...step, extent: overlap ? { kind: "pages", pages, part: index } : { kind: "pages", pages } }
        : { ...step });
    }
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Refusals — DEC-49. One row per condition in TEXT_CHAIN_CHECKS, the code a
 * STRING LITERAL at its site, so the guard can see it.
 * ------------------------------------------------------------------ */

function refusal(key, detail) {
  const row = TEXT_CHAIN_CHECKS[key];
  return { ok: false, code: key, check: row.check, translation: row.translation, detail };
}

/* Rank helpers. A grade's STRENGTH is its position in BASIS_GRADES (A strongest
   at index 0), so "weaker" is a HIGHER index. Read from the imported array
   rather than written down, so the letters have exactly one home. */
function rank(letter) {
  const i = BASIS_GRADES.indexOf(letter);
  return i < 0 ? null : i;
}
/** The weaker of two grade letters, or null if either is unknown. Undetermined
 *  is first-class: an unknown letter does NOT silently become the other one. */
export function weaker(a, b) {
  const ra = rank(a), rb = rank(b);
  if (ra == null || rb == null) return null;
  return ra >= rb ? a : b;
}

/* ------------------------------------------------------------------ *
 * Building a chain
 * ------------------------------------------------------------------ */

/** Is this a well-formed chain? An ARRAY of at least one step object, each
 *  naming a known kind. A STRING is the case rule 1 exists for and is called
 *  out by name in the refusal, because "text_source: 'ocr'" is exactly what a
 *  well-meaning caller writes. */
export function checkChain(chain) {
  /* DEC-49 REGION is-text-chain-shape
     Rule 1. The order matters: the collapsed case is judged BEFORE the generic
     shape complaint, so a caller who wrote a label gets the sentence about
     labels rather than "expected an array". */
  if (typeof chain === "string")
    return refusal("TEXT_CHAIN_COLLAPSED",
      `text_source is '${chain}', a single label. A transcription's provenance is a CHAIN — `
      + `each step naming what performed it — because 'ocr' does not say which engine, and an `
      + `engine is what a re-run and a calibration are OF`);
  if (!Array.isArray(chain) || chain.length === 0)
    return refusal("TEXT_CHAIN_EMPTY",
      `a transcription must name at least one step that produced it; `
      + `${chain == null ? "nothing" : "an empty chain"} was given, and text with no stated `
      + `provenance is indistinguishable from text a publisher typed`);
  for (const [i, step] of chain.entries()) {
    if (!step || typeof step !== "object" || Array.isArray(step))
      return refusal("TEXT_CHAIN_STEP_SHAPE", `step ${i} is not an object`);
    if (!Object.prototype.hasOwnProperty.call(STEP_KINDS, step.step))
      return refusal("TEXT_CHAIN_STEP_UNKNOWN",
        `step ${i} is '${step.step == null ? "(absent)" : String(step.step)}', which is not one of `
        + `${Object.keys(STEP_KINDS).join(", ")}. A step nobody classified is neither a derivation `
        + `nor a verification, and this record will not guess which`);
    /* An OCR or AI step that does not name what performed it is the collapse of
       rule 1 arriving one level down: the chain is an array, and one of its
       entries is still just a label. */
    if ((step.step === "ocr" || step.step === "ai") && !(typeof step.engine === "string" && step.engine))
      return refusal("TEXT_CHAIN_STEP_UNNAMED",
        `the ${step.step} step names no engine. What performed a derivation is the fact the chain `
        + `exists to carry — a calibration is OF an engine and a version, and neither can be `
        + `recovered from the word '${step.step}'`);
    /* CAP-10 / IC-122: a kind that DECLARES the fields it must name. Read from
       `STEP_KINDS`, so the rule follows the kind rather than a spelling. */
    const mustName = STEP_KINDS[step.step].names || [];
    const unnamed = mustName.filter((f) => !(typeof step[f] === "string" && step[f].trim()));
    if (unnamed.length)
      return refusal("TEXT_CHAIN_STEP_UNNAMED",
        `the ${step.step} step does not name its ${unnamed.join(" or ")}. Who performed a `
        + `derivation, and what it produced, are the facts the chain exists to carry — a `
        + `calibration is OF a named producer and format, and neither can be recovered from the `
        + `word '${step.step}'`);
    /* CPDF-13 / D-253 — THE CALIBRATION REFERENCE. Optional, and read the
       comment in the checks catalogue for why it is optional rather than
       required: every chain written before this rule existed carries a `cap`
       and no calibration, and refusing those would be a fence tighter than its
       rule. What is refused is a reference PRESENT AND UNREADABLE, because an
       unresolvable pointer looks like a binding and joins to nothing — which is
       strictly worse than the honest absence `measured_by`'s free string
       already is. */
    if (step.calibration != null
        && !(typeof step.calibration === "string" && step.calibration.trim()))
      return refusal("TEXT_CHAIN_CAL_REF",
        `step ${i} names a calibration that is not a readable identifier `
        + `(${JSON.stringify(step.calibration)}). A transcription names the MEASUREMENT its grade `
        + `rests on so a superseded measurement can name exactly the transcriptions resting on it; `
        + `a pointer nothing can resolve breaks that join while looking like it works`);
    /* CAP-10 / DEC-75: a kind whose letter must be CALIBRATED may carry one only
       beside the calibration it rests on. An unmeasured step may not claim a
       letter — the move Bob's 5.8 forbids is a letter now, lowered later under
       authored legs; the permitted one is undetermined now, raised later by a
       calibration row without a migration. */
    if (STEP_KINDS[step.step].letter === "calibrated" && step.cap != null
        && !(typeof step.calibration === "string" && step.calibration.trim()))
      return refusal("TEXT_CHAIN_LETTER_UNCALIBRATED",
        `the ${step.step} step claims fidelity ${JSON.stringify(step.cap)} and names no calibration. `
        + `A ${step.step} step's cap is UNDETERMINED until a measurement of it exists, and a letter `
        + `written here without one would be the record claiming a fidelity nobody measured`);
    /* REC-87 / IC-127: a kind whose letter is NEVER a caller's to write (`member`).
       A person's typing has no calibration, so a letter here could only be the
       transcriber grading their own act — the equality that costs nothing, one
       altitude below the attestation fence that refuses the same thing by name. */
    if (STEP_KINDS[step.step].letter === "never" && step.cap != null)
      return refusal("TEXT_CHAIN_LETTER_ON_PERSON",
        `the ${step.step} step claims fidelity ${JSON.stringify(step.cap)}. What a member typed is `
        + `UNDETERMINED until a SECOND member attests it against the page; a letter on the step itself `
        + `would be the typist grading their own work`);
  }
  /* END DEC-49 REGION is-text-chain-shape */
  return null;
}

/** Append a step, enforcing rule 2. Returns the NEW chain, or a refusal.
 *
 *  THE INPUT CHAIN IS NEVER MUTATED. A caller holding the pre-append chain is
 *  holding what it held; this is the shape a reading assembly wants and it also
 *  means a refused append leaves nothing half-extended. */
export function appendStep(chain, step) {
  const bad = checkChain(chain);
  if (bad) return bad;
  const one = checkChain([step]);
  if (one) return one;
  const role = STEP_KINDS[step.step].role;
  if (role === "derivation") {
    /* DEC-49 REGION is-text-chain-monotone
       RULE 2, and it is computed rather than trusted. The incoming step's cap
       is compared against the cap the chain ALREADY has; a step claiming a
       stronger letter is refused with the sentence that says why, because the
       plausible mistake here is not malice — it is an author who genuinely
       believes their clean-up improved the text. It did. It improved the
       READABILITY. Reliability is bounded by the worst thing that touched it. */
    const have = derivationCap(chain);
    if (step.cap != null && have != null && rank(step.cap) != null && rank(step.cap) < rank(have))
      return refusal("TEXT_CHAIN_STRENGTHENS",
        `this ${step.step} step claims fidelity ${step.cap}, stronger than the ${have} the chain `
        + `already carries. A derivation can only weaken what it received: text that was cleaned `
        + `is more READABLE, not more RELIABLE, and the hazard of this whole capability is output `
        + `that looks better than its input`);
    /* END DEC-49 REGION is-text-chain-monotone */
  }
  return [...chain, { ...step }];
}

/** The chain a document's OWN text layer produces (FW-15's case, restated as a
 *  chain). `cap` is the measured fidelity a text layer supports and arrives
 *  from the caller for the reason in the header — it is a measurement. */
export function layerChain({ tier = null, container = null, cap = null, measured_by = null,
                             calibration = null } = {}) {
  return [{ step: "layer", tier, container, cap, measured_by, calibration }];
}

/** CAP-10 / DEC-75 / IC-122 — PUT A CONVERSION AT THE HEAD OF A CHAIN.
 *
 *  The chain a reading already built says how text came out of the bytes; a
 *  conversion says how the BYTES came to be, so it goes AHEAD of every step
 *  rather than after the last one — `convert -> layer`, never `layer ->
 *  convert`. That is why this is a separate builder and not `appendStep`.
 *
 *  RULE 2 STILL HOLDS AND IS CHECKED, NOT ASSUMED: every derivation step in the
 *  chain now received the conversion's output, so each is run through
 *  `appendStep([step], s)` — the one monotone comparison this module has, at
 *  its own DEC-49 region — and a step claiming a stronger letter than the
 *  conversion is refused there. With the conversion unmeasured (every Drive
 *  export today) nothing can be stronger than undetermined and no refusal is
 *  possible; the check is what holds the day a calibration raises the step.
 *
 *  The chain is returned WHOLE and UNSCOPED at the head: a conversion is of the
 *  whole document, and a mixed chain's parts (D-252) keep their own extents.
 *  Neither input is mutated. A refusal is returned as-is, so a caller never
 *  holds half a chain. */
export function convertedChain(step, chain) {
  const one = checkChain([step]);
  if (one) return one;
  const bad = checkChain(chain);
  if (bad) return bad;
  for (const s of chain) {
    if (STEP_KINDS[s.step].role !== "derivation") continue;
    const r = appendStep([step], s);
    if (!Array.isArray(r)) return r;
  }
  return [{ ...step }, ...chain.map((s) => ({ ...s }))];
}

/* ------------------------------------------------------------------ *
 * CPDF-13 / D-253 — THE CALIBRATION REFERENCE, READ BACK
 * ------------------------------------------------------------------ */

/** Which calibrations does this chain's provenance rest on?
 *
 *  THE ANSWER IS A SET OF IDS AND NOTHING ELSE. This module still holds no
 *  calibration and still knows no engine: it returns the pointers the chain
 *  carries, and `calibration.mjs` plus the store decide what any of them mean.
 *  That boundary is the same one the header states for `cap` — a measurement
 *  must not acquire a second home — and it is why the drift handler lives over
 *  there rather than here.
 *
 *  VERIFICATION STEPS ARE INCLUDED IF THEY CARRY ONE, and none does today. An
 *  attestation rests on a person, not on a measurement, so it has no
 *  calibration to name; walking every step rather than only the derivations is
 *  the shape that stays right if that ever stops being true, and costs nothing
 *  now. What matters for the drift join is that a step naming a calibration is
 *  FOUND, whatever kind it is.
 *
 *  A MALFORMED CHAIN ANSWERS THE EMPTY SET rather than throwing, on
 *  `derivationCap`'s precedent — a reader asking what a broken chain rests on
 *  should get "nothing this record can name", which is true. */
export function calibrationsOf(chain) {
  if (checkChain(chain)) return [];
  const out = [];
  for (const s of chain)
    if (typeof s.calibration === "string" && s.calibration.trim() && !out.includes(s.calibration))
      out.push(s.calibration);
  return out;
}

/* ------------------------------------------------------------------ *
 * Reading a chain
 * ------------------------------------------------------------------ */

/** The strongest transcription fidelity the DERIVATION steps support: the
 *  weakest link, computed here. Returns null when NO derivation step carries a
 *  measured cap — and null means UNDETERMINED, stated, never "fine".
 *
 *  A verification step is skipped deliberately and that is rule 2 holding: see
 *  the header. `gradeCeiling` is where an attestation is allowed to matter. */
export function derivationCap(chain, target = null) {
  if (checkChain(chain)) return null;
  const page = target && Number.isInteger(target.page) && target.page >= 0 ? target.page : null;
  const measured = (s) => (s.cap != null && rank(s.cap) != null ? s.cap : null);
  let cap = null, unreadable = false;
  /* D-252: the parts, collected by the pages they cover. A document whose steps
     are all unscoped has none of these and takes the original path exactly.
     D-635: collected by `partKeyOf`, because two parts may now share pages. */
  const parts = new Map();
  for (const step of chain) {
    if (STEP_KINDS[step.step].role !== "derivation") continue;
    const ext = extentOf(step);
    if (ext === "unreadable") { unreadable = true; continue; }
    /* CAP-10 / DEC-75 — A KIND THAT DECLARES `unmeasured: "undetermined"`, and
       the one place the sequence rule below does NOT hold. That rule says an
       unmeasured step neither raises nor lowers, because the text it touched
       is still bounded by a step that WAS measured. A conversion at the head
       of the chain breaks the premise: every step after it measured the
       CONVERTED text against the CONVERTED bytes, and none of them saw the
       original, so nothing downstream bounds what the conversion lost. An
       unmeasured one therefore makes the answer UNDETERMINED, stated — which
       is also what the item requires of every Drive export until CAP-11's
       measurement lets a calibration row raise it. Today the `layer` step's
       own cap is null too, so this changes no value the record holds; it is
       what keeps the answer honest the day a text-layer letter is measured. */
    if (STEP_KINDS[step.step].unmeasured === "undetermined" && measured(step) == null
        && (page == null || ext === "all" || ext.includes(page)))
      unreadable = true;
    if (page != null) {
      /* ASKING ABOUT ONE PAGE. Only a step that covers it bounds it — which is
         the read a basis leg citing that page needs, and the reason a mixed
         document is still usable: the OCR'd exhibit answers C and the text-layer
         report answers undetermined, each about itself. */
      if (ext !== "all" && !ext.includes(page)) continue;
      const m = measured(step);
      /* D-635: a SCOPED step is collected by its part, as the document branch does, because a page
         listed in two parts holds two stretches of text with different provenance. Below, one part
         answers exactly as before; two or more answer by the document's partition rule. */
      if (ext !== "all") {
        const key = partKeyOf(step);
        if (!parts.has(key)) parts.set(key, null);
        if (m) parts.set(key, parts.get(key) == null ? m : weaker(parts.get(key), m));
        continue;
      }
      if (m) cap = cap == null ? m : weaker(cap, m);
      continue;
    }
    if (ext === "all") {
      const m = measured(step);
      if (m) cap = cap == null ? m : weaker(cap, m);
      continue;
    }
    /* WITHIN a part the steps are sequential, so the landed rule holds
       unchanged: an unmeasured step neither raises nor lowers, and the part's
       cap is the weakest MEASURED step in it. A part with no measured step at
       all is the undetermined one. */
    const key = partKeyOf(step);
    const m = measured(step);
    if (!parts.has(key)) parts.set(key, null);
    if (m) parts.set(key, parts.get(key) == null ? m : weaker(parts.get(key), m));
  }
  /* An extent this module could not read covers nothing it can name, so it could
     be covering the page in hand or a stretch of the document nothing else
     measured. Either way the answer is UNDETERMINED, stated. (CAP-10: so does an
     unmeasured head conversion, above — the flag is shared because the answer is
     the same sentence.) */
  if (unreadable) return null;
  if (page != null) {
    /* D-635 — ONE PART covering the page is the rule it always was: its unmeasured steps neither raise
       nor lower. TWO OR MORE are a page whose text is a folio from the layer plus a transcription
       appended after it, and a part with no measured cap makes that page undetermined, for the reason
       the document branch gives: some of the page's text is bounded by nothing measured. */
    if (parts.size <= 1) {
      for (const one of parts.values())
        if (one != null) cap = cap == null ? one : weaker(cap, one);
      return cap;
    }
    for (const each of parts.values()) {
      if (each == null) return null;
      cap = cap == null ? each : weaker(cap, each);
    }
    return cap;
  }
  /* THE MIXED DOCUMENT'S CAP: the weakest over the parts, and a part with NO
     measured cap makes the whole undetermined — see the header. This is the step
     that refuses to resolve a text layer's `null` into an OCR pass's letter. */
  for (const partCap of parts.values()) {
    if (partCap == null) return null;
    cap = cap == null ? partCap : weaker(cap, partCap);
  }
  return cap;
}

/** Does this chain contain a derivation this record did not author — i.e. is
 *  this text a TRANSCRIPTION rather than something a publisher typed? True for
 *  a text layer too, and that is the point: `pdfstructure.mjs` decodes through
 *  the FILE'S OWN /ToUnicode map, so a text layer is somebody else's
 *  transcription that we have been reading as authored text. */
export function isTranscribed(chain) {
  return !checkChain(chain) && chain.some((s) => STEP_KINDS[s.step].role === "derivation");
}

/** REC-94 — WHICH EXTRACTION TIERS DOES THIS CHAIN EVIDENCE, AND OVER WHAT?
 *
 *  `OBSERVATION-LOG-DESIGN.md` §4.2 asks for *one row per extraction attempt per
 *  capture per tier*, so the content-level writer has to be able to say which
 *  tiers a persisted reading is evidence of. The chain is the only record of
 *  that: a tier that ran left a step, and a tier that did not run left nothing —
 *  which is the design's own rule that a look not taken is `NEVER_LOOKED` and
 *  `NEVER_LOOKED` is the ABSENCE of a row, arriving one level down.
 *
 *  THE TIER IS A PROPERTY OF THE STEP KIND, DECLARED IN `STEP_KINDS`, AND THIS
 *  FUNCTION MATCHES NO STEP NAME. That is the inversion this module already
 *  makes for `role` and it is made for the same reason: a list of spellings goes
 *  stale the moment a sixth kind is written. Three declared values and each says
 *  a different true thing —
 *
 *    `tier: "step"`  the STEP names its own tier, because the kind spans several
 *                    (a `layer` decode is tier 1 or tier 2 and only the step can
 *                    say which);
 *    `tier: <int>`   the KIND is the tier (pixels and ocr ARE tier 3 — there is
 *                    no tier-3 route that is not an engine over pixels);
 *    `tier: null`    the kind is deliberately NOT a rung on this ladder. `ai` is
 *                    a derivation and `attested` is a verification, and neither
 *                    is a way of getting text OUT of a document — folding either
 *                    into a tier would make SK-8's proposed reading look like a
 *                    fourth extraction tier, which it is not.
 *
 *  AND A KIND THAT DECLARED NOTHING IS NAMED, NEVER SCORED ZERO. A sixth step
 *  kind added without a `tier` key comes back in `unclassified` and the caller
 *  must state it. A thing the matcher does not understand must be NAMED — a
 *  silent zero here would be a tier the frontier cannot see, which is exactly
 *  the false-coverage failure the observation log exists to prevent.
 *
 *  `covers` IS THE STEP'S EXTENT (D-252), so a MIXED document — a text-layer
 *  report with scanned exhibits — answers two tiers, each over its own pages,
 *  and the writer can say `partial` about each rather than PRESENT about the
 *  document. A malformed chain answers the empty set on `derivationCap`'s
 *  precedent, because a reader asking what a broken chain evidences should get
 *  "nothing this record can name", which is true. */
export function tiersEvidenced(chain) {
  if (checkChain(chain)) return { tiers: [], unclassified: [] };
  const byTier = new Map();
  const unclassified = [];
  for (const s of chain) {
    const kind = STEP_KINDS[s.step];
    /* The KEY's presence is the declaration; its VALUE is the answer. `null` is
       a declared answer and `undefined` is no answer at all, and collapsing the
       two is how a kind nobody classified would read as a kind deliberately off
       the ladder. */
    if (!Object.prototype.hasOwnProperty.call(kind, "tier")) {
      if (!unclassified.includes(s.step)) unclassified.push(s.step);
      continue;
    }
    if (kind.tier === null) continue;
    const t = kind.tier === "step"
      ? (Number.isInteger(s.tier) ? s.tier : null)
      : kind.tier;
    /* A `layer` step whose own `tier` is absent is a tier THIS RECORD DID NOT
       RECORD, and it is carried as `null` rather than dropped: the extraction
       happened and the rung it happened on is undetermined, which is a fact to
       state and not one to discard. */
    const key = t == null ? "unrecorded" : t;
    const prev = byTier.get(key);
    const covers = extentOf(s);
    byTier.set(key, { tier: t, steps: [...(prev ? prev.steps : []), s.step],
                      /* "all" beats a page list: if ANY step of this tier was
                         unscoped, the tier covered the document. Two scoped
                         steps of one tier union their pages. */
                      covers: prev ? unionExtent(prev.covers, covers) : covers });
  }
  /* IN THE ORDER THE ATTEMPTS HAPPENED, WHICH IS THE CHAIN'S ORDER, AND NOT
     SORTED BY TIER NUMBER. A Map keeps insertion order, and the chain is a
     record of WHAT HAPPENED in sequence -- the page became pixels and an engine
     read them, after the layer decode had already had its go. The content-level
     writer walks these CUMULATIVELY, so an order that is not the order of events
     would make each row say the state after a tier that had not run yet. Sorting
     would also be right today by accident (escalation runs 1 -> 2 -> 3) and
     wrong the first time a chain is composed in any other order, which is the
     class of correctness this repository keeps paying for. */
  return { tiers: [...byTier.values()], unclassified };
}

/* Union of two step extents in `extentOf`'s own vocabulary. `all` absorbs
   everything; `unreadable` absorbs a page list, because an extent this record
   cannot parse must never narrow to the part of it that happened to parse —
   `extentCovers`' default-to-not-covering rule pointed the other way. */
function unionExtent(a, b) {
  if (a === "all" || b === "all") return "all";
  if (a === "unreadable" || b === "unreadable") return "unreadable";
  return [...new Set([...a, ...b])].sort((x, y) => x - y);
}

/** Was a machine the last thing to touch this text? The question a projection
 *  asks to keep an OCR'd document distinguishable from a published text layer
 *  at a glance, without re-deriving the chain everywhere. */
export function terminalStep(chain) {
  return checkChain(chain) ? null : chain[chain.length - 1].step;
}

/** The word `content.chain_kind` holds for a unit read in MORE THAN ONE way (BOB #35, 2026-09-25 09:35Z).
 *  Not a step kind — no step is `mixed` — so it lives here beside the function that answers it, and the
 *  query registry adds it to the `chain` vocabulary from this constant. A reader that labels machine-read
 *  text treats it as CONTAINING machine-read text (DEC-4): some of the unit was not the publisher's typing. */
export const CHAIN_KIND_MIXED = "mixed";

/** `chainKindFor`'s target for `capture_text`'s DOCUMENT-level fact: the chain's last derivation step,
 *  "the last step of this document's chain, not how any given page was read" (BOB #35, 09:05Z: KEEP). */
export const CHAIN_LAST = "chain";

/** D-686 (BOB #35, 2026-09-25 09:05Z and 09:35Z) — HOW WAS THIS UNIT READ? The ONE computation of
 *  `content.chain_kind` and `capture_text.chain_kind`: every writer and the migration call this and
 *  nothing else. Until D-686 `content.chain_kind` was the WHOLE chain's last step, so every unit of a mixed
 *  document read `ocr` — a text-layer page of a document OCR also touched was labelled as OCR'd. The
 *  extraction method is one of a content unit's two intrinsic facts (Part II §14.2), so it is asked of
 *  the unit. Three targets:
 *
 *    `{ page }`     the kind of the LAST derivation step covering that page. Walked from the END, so on a
 *                   page two parts share (D-635) the part appended last answers. A step whose extent this
 *                   module cannot read, met before a covering one, could be covering the page, so the answer
 *                   is UNDETERMINED (null), stated, as `derivationCap` answers it; so is a page no step covers.
 *    `null`         a unit with NO page (a whole document, an office unit), which every page's reading
 *                   covers. BOB #35 09:35Z: the single kind when every page the chain's scoped steps name was
 *                   read the same way, and `mixed` when they differ — NOT null, because the record knows the
 *                   answer. A chain with no scoped step has one provenance and answers its last derivation
 *                   step, as it always did. A page among them that is undetermined makes the unit so.
 *    `CHAIN_LAST`   `capture_text`'s document-level fact: the chain's last derivation step, whatever it covers.
 *
 *  A chain holding a step of no known kind is undetermined. A VERIFICATION step is not how the text was
 *  produced and is never the answer. */
export function chainKindFor(chain, target = null) {
  /* STRUCTURAL, NOT `checkChain`. The kind needs only each step's KIND and EXTENT, and a stored chain
     written before a later field rule (an `ocr` step minted before an engine was required) is a chain
     whose kind this record still knows: REC-104's column read it, and a recompute that answered null
     for it would erase a fact the record held. A step of a kind this module does not know is refused
     as undetermined, as `checkChain` would refuse it. */
  if (!Array.isArray(chain) || !chain.length
      || !chain.every((s) => s && typeof s === "object" && Object.hasOwn(STEP_KINDS, s.step))) return null;
  const derivations = chain.filter((s) => STEP_KINDS[s.step].role === "derivation");
  /* A target with no readable page is the whole-unit question, exactly as `derivationCap` reads it. */
  const page = target && target !== CHAIN_LAST && Number.isInteger(target.page) && target.page >= 0
    ? target.page : null;
  if (target === CHAIN_LAST || (page == null && derivations.every((s) => extentOf(s) === "all")))
    return derivations.length ? derivations[derivations.length - 1].step : null;
  if (page == null) {
    /* EVERY PAGE THE CHAIN NAMES, each asked the page question below — so the whole-unit answer is built
       from the per-page answers and cannot disagree with them. */
    const pages = new Set();
    for (const s of derivations) {
      const ext = extentOf(s);
      if (ext === "unreadable") return null;
      if (ext !== "all") for (const p of ext) pages.add(p);
    }
    const kinds = new Set();
    for (const p of pages) {
      const k = chainKindFor(chain, { page: p });
      if (k == null) return null;
      kinds.add(k);
    }
    return kinds.size === 1 ? [...kinds][0] : CHAIN_KIND_MIXED;
  }
  for (let i = derivations.length - 1; i >= 0; i--) {
    const ext = extentOf(derivations[i]);
    if (ext === "unreadable") return null;
    if (ext === "all" || ext.includes(page)) return derivations[i].step;
  }
  return null;
}

/** A one-line human sentence for the whole chain. Composed FROM the chain, so
 *  it cannot describe a chain other than the one it was given — the drift that
 *  a hand-written summary beside a structured field always eventually has. */
export function describeChain(chain) {
  if (checkChain(chain)) return "this text's provenance was not recorded";
  return chain.map((s) => {
    const base = STEP_KINDS[s.step].label;
    /* CAP-10: a kind that declares a `format` says what it produced, beside who
       produced it — "(google-export to odt)". Every other kind's sentence is the
       sentence it was. */
    const into = (STEP_KINDS[s.step].names || []).includes("format") && s.format ? ` to ${s.format}` : "";
    const who = s.engine ? ` (${s.engine}${s.version ? ` ${s.version}` : ""}${into})` : "";
    /* REC-87: a `typed` step says WHO typed, beside the label, as `attested` does. */
    const by = (s.step === "attested" || s.step === "typed") && s.member
      ? ` (${s.member}${s.at ? `, ${s.at}` : ""})` : "";
    /* D-252: a SCOPED step says which pages it covers, and it has to. Without
       it a mixed document's chain reads as a sequence — "the text layer was
       turned into pixels and OCR'd" — which is not what happened to any page
       in it. An unscoped step says nothing extra, so every sentence written
       before this rule is the sentence it was. */
    const ext = extentOf(s);
    const over = STEP_KINDS[s.step].role === "derivation" && ext !== "all"
      ? (ext === "unreadable" ? " (over an extent this record cannot read)" : ` (${pageList(ext)})`)
      : "";
    return base + who + by + over;
  }).join(" -> ");
}

/* ------------------------------------------------------------------ *
 * Per-region confidence, and the floor
 * ------------------------------------------------------------------ */

/** Check one region's confidence declaration. `confidence` is either the
 *  literal string "none" — first-class, stated, what a confidence-less engine
 *  honestly reports — or `{ value:<0..1>, basis:"engine" }`.
 *
 *  THE FENCE IS ON `basis`, NOT ON `value`, and that is the whole design: a
 *  self-reported 0.99 and a computed 0.99 are the same bytes. Only who
 *  produced it tells them apart, so only that is checked. */
export function checkConfidence(confidence) {
  /* DEC-49 REGION is-text-region-confidence */
  if (confidence === "none") return null;
  if (!confidence || typeof confidence !== "object")
    return refusal("TEXT_CONFIDENCE_SHAPE",
      `a region's confidence is either the stated string 'none' or {value, basis}; `
      + `an absent confidence is not the same claim as a stated absent one`);
  if (!Object.prototype.hasOwnProperty.call(CONFIDENCE_BASES, confidence.basis))
    return refusal("TEXT_CONFIDENCE_PSEUDO",
      `confidence basis '${confidence.basis == null ? "(absent)" : String(confidence.basis)}' is not `
      + `${Object.keys(CONFIDENCE_BASES).join(" or ")}. A number a model reported about itself is not a `
      + `calibrated confidence and may not be thresholded as one — it costs nothing to produce, which `
      + `is exactly what makes it worthless as evidence`);
  if (confidence.basis === "engine"
      && !(typeof confidence.value === "number" && confidence.value >= 0 && confidence.value <= 1))
    return refusal("TEXT_CONFIDENCE_SHAPE",
      `an engine-computed confidence carries a value in 0..1; got `
      + `${confidence.value == null ? "nothing" : JSON.stringify(confidence.value)}`);
  /* END DEC-49 REGION is-text-region-confidence */
  return null;
}

/** Rule 4. Walk regions and REPLACE any whose engine-computed confidence falls
 *  below `floor` with a stated `undetermined` — DISCARDING the text.
 *
 *  Three things this does that a naive version would not:
 *
 *  - IT DELETES THE TEXT. A best guess kept in a field beside its own warning
 *    is one careless join away from being read as content, and this project's
 *    whole threat model is the record claiming more than it can support.
 *  - A region whose confidence is the stated `none` is NOT floored out. It has
 *    no number to compare, so flooring it would be inventing a judgement; the
 *    engine's measured CAP is what carries a confidence-less engine (DEC-35's
 *    own named alternative, and what CPDF-11's ladder returned).
 *  - A region whose confidence declaration is REFUSED is not silently dropped
 *    and not silently kept: it becomes undetermined carrying the refusal's own
 *    detail, so a pseudo-confidence attempt is visible in the output rather
 *    than merely rejected somewhere upstream.
 *
 *  Returns { regions, floored, undetermined } — `floored` counted so a caller
 *  can state the shortfall on a reading's basis rather than implying a clean
 *  read (FW-15's partial-decode honesty rule, applied one layer up). */
export function applyConfidenceFloor(regions, floor) {
  const out = [], list = Array.isArray(regions) ? regions : [];
  let floored = 0, undetermined = 0;
  for (const r of list) {
    const region = r && typeof r === "object" ? r : {};
    const bad = checkConfidence(region.confidence);
    if (bad) {
      out.push(undeterminedRegion(region, bad.detail));
      floored++; undetermined++;
      continue;
    }
    const c = region.confidence;
    if (c !== "none" && typeof floor === "number" && c.value < floor) {
      out.push(undeterminedRegion(region,
        `this region decoded at ${c.value} against a floor of ${floor}, so what it says is `
        + `undetermined; the record does not offer a best guess at a number nobody could read`));
      floored++; undetermined++;
      continue;
    }
    out.push({ ...region });
  }
  return { regions: out, floored, undetermined };
}

/* The text is DROPPED, not carried. `source` (the image-region anchor) is
   KEPT, and keeping it is the useful half: a reader or an attester can still
   be pointed at the exact pixels nobody could read, which is what makes an
   undetermined region actionable rather than merely absent. */
function undeterminedRegion(region, why) {
  const { text, confidence, ...rest } = region;
  return { ...rest, text: null, undetermined: true, why, confidence: "none" };
}

/* ------------------------------------------------------------------ *
 * The image-region anchor
 * ------------------------------------------------------------------ */

/** The anchor a basis leg resting on OCR'd text must carry: page + rect, in
 *  I2's OWN tagged-union shape (IC-1, `{kind:"pdf-page", ref, page, rect}`).
 *
 *  IMPORTED SHAPE, NOT A NEW ONE. I2 already carries `source` for exactly this
 *  — an element reference into a page — and D-164's lesson is that solving one
 *  problem twice produces two answers that disagree. So this validates I2's
 *  shape rather than defining a rival. */
export function checkAnchor(source) {
  /* DEC-49 REGION is-text-anchor */
  if (!source || typeof source !== "object")
    return refusal("TEXT_ANCHOR_MISSING",
      `text produced by a machine carries the image region a reader can check it against; `
      + `without one, nothing in the record can be verified against the pixels it came from`);
  if (source.kind !== "pdf-page")
    return refusal("TEXT_ANCHOR_MISSING",
      `the anchor names kind '${String(source.kind)}'; a transcription's anchor is a pdf-page `
      + `reference (I2 IC-1), because that is the arm carrying page and rect`);
  if (!Number.isInteger(source.page) || source.page < 0)
    return refusal("TEXT_ANCHOR_MISSING", `the anchor names no page (0-based integer required)`);
  if (!Array.isArray(source.rect) || source.rect.length !== 4
      || !source.rect.every((n) => typeof n === "number" && Number.isFinite(n)))
    return refusal("TEXT_ANCHOR_MISSING",
      `the anchor names no rect; a page alone is not a region a reader can be pointed at`);
  /* END DEC-49 REGION is-text-anchor */
  return null;
}

/* ------------------------------------------------------------------ *
 * Attestation
 * ------------------------------------------------------------------ */

/** Check an attestation before it is recorded. TWO rules, and they are
 *  different rules that a single "is this valid" would have blurred:
 *
 *  (a) IT IS A MEMBER ACT, REFUSABLE TO A MACHINE CREDENTIAL. Attestation is a
 *      person saying "I looked at the image and this text is what it says".
 *      There is no version of that a token can perform, and letting one would
 *      put a claim on the record that nobody holds. The predicate is
 *      `isMachineIdentity`, IMPORTED — this file does not get its own opinion
 *      about what a machine looks like, because REC-46 measured what eleven
 *      hand-typed copies of that question cost.
 *
 *  (b) IT IS SCOPED TO WHAT WAS ACTUALLY CHECKED. An extent is required and
 *      must be one this module can evaluate. An attestation with no extent
 *      would be read as covering the document — the generous direction, which
 *      this project treats as the worse one. */
export function checkAttestation(att) {
  const a = att && typeof att === "object" ? att : {};
  /* DEC-49 REGION is-text-attestation
     (a) FIRST. Who is asking is judged before what they asked for, so a
     machine credential is refused for BEING a machine rather than for the
     shape of an extent it should never have been composing. */
  if (isMachineIdentity(a.member))
    return refusal("TEXT_ATTEST_MACHINE",
      `'${String(a.member)}' is a machine credential. Attesting is a person saying they checked this `
      + `text against the image — an act with a name behind it. A machine cannot perform it, and `
      + `recording one would put a claim on the record that nobody holds`);
  if (!(typeof a.member === "string" && a.member.trim()))
    return refusal("TEXT_ATTEST_MACHINE",
      `an attestation names no member. Nobody said this, and unattributed is not the same as attested`);
  if (!(typeof a.at === "string" && a.at.trim()))
    return refusal("TEXT_ATTEST_EXTENT", `an attestation carries the date it was made`);
  const e = a.extent;
  if (!e || typeof e !== "object" || !Object.prototype.hasOwnProperty.call(EXTENT_KINDS, e.kind))
    return refusal("TEXT_ATTEST_EXTENT",
      `an attestation is scoped to what was actually checked — one of `
      + `${Object.keys(EXTENT_KINDS).join(", ")}. An unscoped attestation would be read as covering `
      + `the whole document, which is the generous reading of a claim nobody made`);
  if (e.kind === "page" && !(Number.isInteger(e.page) && e.page >= 0))
    return refusal("TEXT_ATTEST_EXTENT", `a page extent names which page (0-based)`);
  if (e.kind === "region") {
    const bad = checkAnchor(e.source);
    if (bad) return refusal("TEXT_ATTEST_EXTENT",
      `a region extent names the region that was checked: ${bad.detail}`);
  }
  /* END DEC-49 REGION is-text-attestation */
  return null;
}

/** Does `extent` cover `target`? THE DEFAULT IS NO.
 *
 *  This is the rule "a leg citing outside the attested extent does not inherit
 *  it", and every unreadable, unparseable or unrecognised case answers FALSE —
 *  because the failure that matters is an extent nobody could evaluate quietly
 *  reading as "all of it", which is how a member's careful check of one
 *  paragraph would come to underwrite a whole scanned budget book. */
export function extentCovers(extent, target) {
  if (!extent || typeof extent !== "object") return false;
  if (!target || typeof target !== "object") return false;
  if (!Object.prototype.hasOwnProperty.call(EXTENT_KINDS, extent.kind)) return false;
  if (extent.kind === "document") return true;
  if (!Number.isInteger(target.page) || target.page < 0) return false;
  if (extent.kind === "page") return extent.page === target.page;
  /* region: the target must sit INSIDE the attested rect, on the same page.
     A target with no rect at all is not covered — "somewhere on that page" is
     not what the member checked. */
  const src = extent.source;
  if (!src || src.page !== target.page) return false;
  if (!Array.isArray(target.rect) || target.rect.length !== 4) return false;
  const [ax0, ay0, ax1, ay1] = normRect(src.rect);
  const [bx0, by0, bx1, by1] = normRect(target.rect);
  return bx0 >= ax0 && by0 >= ay0 && bx1 <= ax1 && by1 <= ay1;
}

/* A PDF rect is not guaranteed to be given lower-left-first, and a containment
   test against an inverted rect answers FALSE for regions that are plainly
   inside it. Normalising is not tidiness: an inverted attested rect would have
   made a member's real attestation cover nothing, which fails SAFE but fails
   silently, and a member would have had no way to tell. */
function normRect(r) {
  const [x0, y0, x1, y1] = r;
  return [Math.min(x0, x1), Math.min(y0, y1), Math.max(x0, x1), Math.max(y0, y1)];
}

/** What a leg citing `target` may claim on the TRANSCRIPTION axis.
 *
 *  The second half of "verification supersedes it as grade determinant, never
 *  as record": an attestation covering the target supersedes the derivation
 *  cap; nothing else does. The chain is unchanged either way — this function
 *  reads, and writes nothing. */
export function gradeCeiling(chain, target, attestations = []) {
  const covering = (Array.isArray(attestations) ? attestations : [])
    .filter((a) => !checkAttestation(a) && extentCovers(a.extent, target));
  if (covering.length) {
    return { ceiling: EARNED_CAPTURE_CEILING, determinant: "attestation",
             by: covering.map((a) => a.member),
             why: `a member checked this text against the image over the extent it cites` };
  }
  /* D-252: the cap is asked ABOUT THE TARGET, not about the document. On an
     unscoped chain that is the same question and the same answer. On a MIXED
     document it is the difference between a leg citing the OCR'd exhibit (the
     engine's measured letter) and a leg citing the text-layer report
     (undetermined) — and answering either one with the document's cap would
     hand one of them a ceiling nobody measured for it. */
  const cap = derivationCap(chain, target);
  return { ceiling: cap, determinant: "derivation", by: [],
           why: cap == null
             ? `no step in this text's provenance carries a measured fidelity${
                 target && Number.isInteger(target.page) ? ` for page ${target.page}` : ""
               }, so what it may support is undetermined — which is a statement, not a permission`
             : `bounded by the weakest step that produced it (${describeChain(chain)})` };
}

/* ------------------------------------------------------------------ *
 * The capture-axis bound
 * ------------------------------------------------------------------ */

/** Transcription fidelity BOUNDS the capture axis — the weakest link of byte
 *  provenance and fidelity, and NO THIRD SCALE (DEC-4's doctrine).
 *
 *  So this returns a letter from the SAME `BASIS_GRADES` the capture axis
 *  already uses, and it can only ever be the same as or weaker than
 *  `EARNED_CAPTURE_CEILING`. OCR NEVER RAISES A CAPTURE GRADE: there is no
 *  argument shape here that returns something stronger than the byte
 *  provenance it was handed, which is checked by the suite rather than left to
 *  reading. */
export function captureBound(chain, byteGrade = EARNED_CAPTURE_CEILING) {
  if (!isTranscribed(chain)) return byteGrade;
  const cap = derivationCap(chain);
  /* An undetermined fidelity does not silently pass the byte grade through.
     Text whose provenance carries no measured fidelity cannot bound anything,
     and treating that as "no bound" would let an unmeasured engine's output
     ride a direct capture's B. */
  if (cap == null) return null;
  return weaker(byteGrade, cap);
}

/* ------------------------------------------------------------------ *
 * FW-17 / IC-86 · READING POSITION — where a reference was read
 * ------------------------------------------------------------------ */

/** The arms of IC-1's element-reference union that a READING may carry.
 *
 *  FOUR, not five, and the missing one is the point: `dom` is in IC-1's union
 *  and has NO PRODUCER anywhere in this tree, so it is refused by name rather
 *  than admitted-and-unused. An arm the record accepts and nothing emits is a
 *  precision the record advertises and does not have — the same rule
 *  `schema.mjs` states about a nullable extent column with no writer, one level
 *  up at the vocabulary instead of at the column. When CONTENT-HTML produces
 *  it, the arm is added HERE and nowhere else. */
export const READING_POSITION_KINDS = { "pdf-page": 1, "sheet-cell": 1, "slide-shape": 1, "doc-para": 1 };

/** The arm named in IC-1 that deliberately has no producer, kept as a constant
 *  so a refusal can NAME it rather than lumping it in with a typo. */
export const READING_POSITION_UNPRODUCED = "dom";

const isNonEmptyString = (s) => typeof s === "string" && s.trim().length > 0;
const isIndex = (n) => Number.isInteger(n) && n >= 0;

/** Normalise a reader's `source` to the canonical IC-1 shape, or null.
 *
 *  TOTAL, AND THE FAILURE DIRECTION IS NULL. Every malformed, unrecognised or
 *  incomplete input answers null — the reading still writes and the position is
 *  simply absent, which is the honest outcome and never a refusal that would
 *  pressure a caller into inventing an address to get a reading recorded. That
 *  is CLAUDE.md's rule about gates, applied at this boundary.
 *
 *  `ref` IS REQUIRED ON EVERY ARM and is IC-1's own load-bearing rule: the
 *  human-readable form is produced by the container that knows it, because
 *  deriving it downstream puts per-container knowledge in the wrong layer where
 *  it drifts. A source with structure and no `ref` is therefore not a weaker
 *  source — it is not one of these at all.
 *
 *  AND THE RESULT IS KEY-ORDERED. The object is rebuilt field by field in a
 *  fixed order rather than spread from the input, so JSON.stringify over it is
 *  canonical: two readings of the same place produce byte-identical `pos`
 *  columns and compare equal without a parse. Spreading the caller's object
 *  would make the serialisation depend on the order the reader happened to
 *  write its literal in. */
export function readingSource(source) {
  if (!source || typeof source !== "object" || Array.isArray(source)) return null;
  const kind = source.kind;
  if (!isNonEmptyString(kind)) return null;
  if (!Object.prototype.hasOwnProperty.call(READING_POSITION_KINDS, kind)) return null;
  if (!isNonEmptyString(source.ref)) return null;
  const ref = String(source.ref).slice(0, 200);
  if (kind === "pdf-page") {
    if (!isIndex(source.page)) return null;
    /* rect is OPTIONAL and normally absent: Tier-1 and Tier-2 text is a flat
       per-page string with no geometry, so the page is the honest maximum a
       reading can carry. A malformed rect drops to null rather than refusing
       the whole position — the page is still true. */
    const rect = Array.isArray(source.rect) && source.rect.length === 4
      && source.rect.every((n) => typeof n === "number" && Number.isFinite(n))
      ? source.rect.map(Number) : null;
    return { kind, ref, page: source.page, rect };
  }
  if (kind === "doc-para") {
    if (!isIndex(source.para)) return null;
    return { kind, ref, para: source.para, run: isIndex(source.run) ? source.run : null };
  }
  if (kind === "sheet-cell") {
    if (!isNonEmptyString(source.sheet) || !isNonEmptyString(source.cell)) return null;
    return { kind, ref, sheet: String(source.sheet).slice(0, 200), cell: String(source.cell).slice(0, 64) };
  }
  /* slide-shape */
  if (!isIndex(source.slide) || !isIndex(source.shape)) return null;
  return { kind, ref, slide: source.slide, shape: source.shape };
}

/** The canonical JSON for a reading position's per-arm fields — everything but
 *  kind and ref, which the projection stores in their own columns. Null in,
 *  null out. */
export function readingSourceJson(source) {
  const s = readingSource(source);
  if (!s) return null;
  const { kind, ref, ...rest } = s;
  return JSON.stringify(rest);
}

/** D-454 — WHICH OCCURRENCE of a reference a `reading_refs` row is: the place it was read,
 *  as `<kind>:<canonical fields>`, and `''` where the reading could not say. It is the third
 *  column of the table's key, so one reference string read on three pages is three rows and
 *  a member can choose between them. Built from the SAME two values the writer stores in
 *  `pos_kind` and `pos` and no others, so the migration can compute it in SQL from rows
 *  already written (`pos_kind || ':' || pos`) and the two cannot disagree. The human form
 *  (`pos_ref`) is NOT part of it: two reads of one place are one place however it is
 *  spelled. Every unplaced read of a reference is ONE occurrence — the record cannot tell
 *  two reads it cannot place apart, and claiming it could would be inventing a distinction. */
export function readingOccurrenceKey(source) {
  const s = readingSource(source);
  return s ? `${s.kind}:${readingSourceJson(s)}` : "";
}

/** Rebuild a reading position from the three projected columns. The inverse of
 *  the writer, kept beside it so the two cannot drift. */
export function readingSourceFromColumns(posKind, pos, posRef) {
  if (!isNonEmptyString(posKind) || !isNonEmptyString(posRef) || typeof pos !== "string") return null;
  let fields;
  try { fields = JSON.parse(pos); } catch { return null; }
  if (!fields || typeof fields !== "object") return null;
  return readingSource({ kind: posKind, ref: posRef, ...fields });
}

/** Does a CONTENT ROW's extent contain the place a reference was READ?
 *
 *  THE DEFAULT IS NO, for extentCovers' own reason one construct over: the
 *  failure that matters is a position nobody could evaluate quietly reading as
 *  "inside", which is how a leg citing one page would come to earn a connection
 *  established three hundred pages away. Every unparseable, unrecognised or
 *  cross-container case answers false.
 *
 *  extentKind/extent are the content row's columns as REC-82 writes them
 *  (IC-83): document with no fields, or one of IC-1's arms with the per-arm
 *  fields JSON-decoded.
 *
 *  THE document ARM COVERS EVERYTHING IN ITS OWN CAPTURE and that is not a
 *  loophole: Bob's 5.1 ruling is that a citation refers only to its portion, and
 *  a document-extent row's portion IS the whole document (5.3 — a citation
 *  naming no part means the whole document). The caller is responsible for
 *  asking only about positions in the row's own capture. This function compares
 *  PLACES, not documents.
 *
 *  A COARSER READING POSITION IS NOT COVERED BY A FINER EXTENT. A page-grained
 *  reading (rect null, which is every reading a text tier produces today) is
 *  NOT inside a region-grained extent: "somewhere on that page" is not "inside
 *  that rectangle", and answering true would let a member's careful citation of
 *  one paragraph earn from a reference read anywhere on the sheet. */
export function readingPositionInExtent(position, extentKind, extent) {
  const p = readingSource(position);
  if (!p) return false;
  if (!isNonEmptyString(extentKind)) return false;
  if (extentKind === "document") return true;
  if (extentKind !== p.kind) return false;
  const e = extent && typeof extent === "object" && !Array.isArray(extent) ? extent : null;
  if (!e) return false;
  if (p.kind === "pdf-page") {
    if (!isIndex(e.page) || e.page !== p.page) return false;
    /* No rect on the extent: the whole page is the extent and the page matched. */
    if (!Array.isArray(e.rect) || e.rect.length !== 4) return true;
    /* A rect on the extent and none on the reading: NOT established to be
       inside it. The honest no. */
    if (!Array.isArray(p.rect) || p.rect.length !== 4) return false;
    const [ax0, ay0, ax1, ay1] = normRect(e.rect);
    const [bx0, by0, bx1, by1] = normRect(p.rect);
    return bx0 >= ax0 && by0 >= ay0 && bx1 <= ax1 && by1 <= ay1;
  }
  if (p.kind === "doc-para") {
    if (!isIndex(e.para) || e.para !== p.para) return false;
    /* A run-grained extent needs a run-grained reading, the rect rule again. */
    if (!isIndex(e.run)) return true;
    return isIndex(p.run) && e.run === p.run;
  }
  if (p.kind === "sheet-cell")
    return isNonEmptyString(e.sheet) && isNonEmptyString(e.cell)
        && e.sheet === p.sheet && e.cell === p.cell;
  /* slide-shape */
  if (!isIndex(e.slide) || e.slide !== p.slide) return false;
  if (!isIndex(e.shape)) return true;
  return e.shape === p.shape;
}

/*__CPDF20_PER_PAGE_START__*/
/* ===================================================================== *
 * CPDF-20 / D-283 — WHICH OF TWO DECODES OF ONE LAYER WINS, PAGE BY PAGE
 * ===================================================================== *
 *
 * D-283, stated as it was found by D-252's class sweep: `needsTier2` is a
 * DOCUMENT-level predicate and `i2text = t2.text` is a WHOLESALE assignment, so
 * a document Tier 1 read well on page 0 and failed on page 1 escalates whole,
 * and if Tier 2 recovers page 1 but does worse on page 0 the plane keeps the
 * worse page silently. Tier 1 and Tier 2 are both `layer` derivations of the
 * same source under the same null cap, so nothing is OVERCLAIMED by the swap —
 * what is unbounded is TEXT LOSS.
 *
 * ---------------------------------------------------------------------------
 * THE MEASUREMENT CAME FIRST AND IT FALSIFIED THE DESIGN'S RULE. READ THIS.
 * ---------------------------------------------------------------------------
 * `EXTRACTION-BREADTH-DESIGN.md` §5.2 states the rule as "the decode with fewer
 * undetermined characters on that page wins; a tie keeps tier 1". CPDF-20 built
 * the fixture D-283 said did not exist, measured both decodes page-wise over it
 * and over a live 50-document census sample, and the rule as written does not
 * survive contact with real documents (MEASUREMENTS.md 2026-09-14, CPDF-20):
 *
 *   TIER 2 REPORTS ZERO UNDETERMINED CHARACTERS ON EVERY PAGE — 203 of 203 in
 *   the census sample, 15 of 15 in the committed fixture.
 *
 * Not because it decodes perfectly. Because it HAS NO UNDETERMINED-CHARACTER
 * VOCABULARY: `pdf-worker/src/index.mjs` emits one `no_text_layer` marker with
 * `count: 0` for a page pdf.js returned nothing for, and says nothing at all
 * about characters pdf.js dropped inside a page it did return text for. Tier 1
 * counts every code its `/ToUnicode` cannot map. THE TWO NUMBERS ARE NOT
 * COMMENSURABLE, so "fewer undetermined characters" performs no comparison:
 * it reduces to "did Tier 1 flag this page", and hands Tier 2 every flagged
 * page however little it recovered.
 *
 * Measured cost of shipping it as written: 145 of 203 census pages go to Tier
 * 2, and on 23 of those Tier 1 HAD DECODED MORE CHARACTERS — 692 characters of
 * real text traded for a handful of unmapped glyphs. Those 23 pages are exactly
 * the page §8 requires the rule to KEEP from Tier 1, so the rule as written
 * fails its own negative control on real documents. This is reported as a
 * DESIGN GAP against §5.2 rather than resolved silently (WORKER.md).
 *
 * ---------------------------------------------------------------------------
 * THE RULE THAT SHIPS — TWO CONDITIONS, AND THE SECOND ONLY EVER WITHHOLDS
 * ---------------------------------------------------------------------------
 * D-283's row warns that "character count is exactly the instrument CPDF-9
 * argued against", and it is right: volume is not fidelity, and a tier emitting
 * fluent garbage would win on it. So character count is NOT the award axis
 * here. §5.2's award axis is kept exactly as designed, and a ONE-DIRECTIONAL
 * guard is added that can only ever REFUSE an award, never make one:
 *
 *   1. TIER 1 ADMITTED IT FAILED ON THIS PAGE — strictly fewer undetermined
 *      characters in Tier 2's decode than in Tier 1's. This is §5.2's rule,
 *      unchanged, and it is a claim by a producer about its OWN output.
 *   2. TIER 2 ACTUALLY RECOVERED SOMETHING — strictly more decoded characters
 *      than Tier 1. This is a fact about the text in hand rather than a claim
 *      by anybody, and it is what makes condition 1 safe to act on.
 *
 * Anything else keeps Tier 1 — which subsumes §5.2's "a tie keeps tier 1"
 * (fewer steps, the same cap, the same producer marker carried forward).
 *
 * THE SHAPE IS DELIBERATELY `mergeTier3Text`'s, ONE TIER UP (D-252,
 * `index.mjs`): "condition 1 is a claim by a producer about its own output;
 * condition 2 is a fact about the text in hand... a guarantee that rests on
 * another component's correctness is the class of mechanism this project meets
 * most often and believes least." Two mechanisms for one job is how the next
 * tier goes dark differently, so this is that mechanism with its comparison
 * changed, not a second one invented. The one-directional discipline is
 * `OCR_PRODUCER_MARKERS`' (D-251): a detector whose miss is the status quo ante.
 *
 * Measured over the same corpora: 122 of 203 census pages to Tier 2, ZERO
 * degraded, +186,242 characters recovered, and NOTHING left behind — every page
 * where Tier 2 genuinely had more text still moves.
 *
 * ---------------------------------------------------------------------------
 * THE CHAIN RECORDS THE WINNER PER PAGE, WHICH IS THE HALF THAT IS NOT A MERGE
 * ---------------------------------------------------------------------------
 * §5.2: "the mixed-document chain the plane already composes records which tier
 * produced each page, so the document's chain is honest about being a merge."
 * `layerChain` already carries `tier` on the `layer` step; what did not exist is
 * a per-PAGE statement. `mergeTier2Text` writes `tier` onto every merged page
 * and returns `perPageTier` — the pages each tier produced, by number — so a
 * consumer composing the document's chain can say "layer, tier 1 on pages 0 and
 * 2-5, tier 2 on page 1" instead of one document-level tier true of neither.
 *
 * A page nobody's decode carries keeps Tier 1's and is recorded as Tier 1: an
 * absence with nothing to report is not a finding.
 *
 * WHAT THIS DOES NOT DO. It does not decide whether to CALL Tier 2 — that is
 * `needsTier2`'s, in `index.mjs`, unchanged and deliberately so (the routing
 * half was closed on purpose; it is the ASSIGNMENT half D-283 left open). It
 * holds no engine and reaches no network. And it is NOT WIRED by this landing:
 * the two call sites are `index.mjs`'s, RECORD's control plane, and are a
 * DELEGATION (CLAIMS.md 2026-09-14) exactly as the existing Tier-2 call site's
 * own note in that file already says. Until they are wired the plane's
 * behaviour is unchanged, and that is stated rather than implied. */

/** The rule in one sentence, so the probe, the suite and any report quote ONE
 *  spelling of it rather than three that drift. */
export const TIER_RULE =
  "per page, tier 2 replaces tier 1 only when it has strictly fewer undetermined "
+ "characters AND strictly more decoded GLYPHS — non-whitespace code points, so "
+ "neither tier's whitespace policy can move the award; anything else keeps tier 1";

const undeterminedChars = (page) =>
  (page && Array.isArray(page.undetermined))
    ? page.undetermined.reduce((n, m) => n + (m && Number.isFinite(m.count) ? m.count : 0), 0)
    : 0;

/* D-501 — THE AWARD COUNTS GLYPHS, AND `text.length` IS NOT A COUNT OF GLYPHS.
 *
 * THE DEFECT, and it is a defect in the INSTRUMENT rather than in the rule.
 * `perPageTierWinner`'s second condition asks whether tier 2 decoded MORE than
 * tier 1 — "more" meaning more of the document recovered. It was reading
 * `text.length`, which is the UTF-16 length of the whole string, whitespace and
 * all. The two tiers are two independent engines with two independent
 * line-breaking policies over the SAME bytes, so that number differs between
 * them for reasons that have nothing to do with how much of the document either
 * one read. **A change to one tier's whitespace policy then moves an award with
 * no glyph changing hands**, which is how this was found: D-481 changed tier 1's
 * line-breaking rule (a line breaks when the BASELINE moves) and the margin on
 * `legistar-73618` page 1 — the fixture's own degradation trap — fell from 129
 * to 77 while tier 1 decoded not one character less. M-133 measured the same
 * thing from the other end: on `Budget-Basics-FY23-25` the reading went from
 * 4,528 lines to 194 with the non-whitespace character count UNCHANGED at 4,228.
 *
 * WHAT THE MEASUREMENT SAYS ABOUT THIS FIXTURE, and it is stronger than the row
 * expected (M-140). On EVERY page of the four committed PDFs that tier 1 read at
 * all, the two tiers decode the IDENTICAL number of non-whitespace code points —
 * 73450: 1503/2601/914, 73545 p6: 2856, 73618: 915 and 486, each side equal. The
 * whole of every margin the old instrument saw (40, 39, 22, 4, 104, 77) was
 * whitespace. So the second condition was doing its work, on this corpus,
 * entirely on a whitespace artifact — and it keeps doing it under this counter,
 * but for the honest reason: tier 2 offers no glyph tier 1 did not already have.
 *
 * WHY CODE POINTS AND NOT UTF-16 UNITS. An astral glyph is one glyph and two
 * UTF-16 units, so an engine that emits it where the other emits a replacement
 * character would score two-for-one on a `.length` comparison. The committed
 * corpus contains none (measured: code-point count equals `.length` on all 15
 * pages), so that half of this counter is exercised by a synthetic arm in the
 * suite and by nothing in the wild — stated rather than implied.
 *
 * WHAT THIS DOES NOT TOUCH. `undeterminedChars` reads counts the decoder
 * reported and is not a length at all. `counts.chars` — the figure I2 REPORTS —
 * is deliberately left as the raw character count: it is a reported quantity
 * rather than an award, and moving it is an interface change.
 *
 * D-514 CLOSED THE FOUR READER SITES D-501 LEFT, 2026-09-24, and the paragraph
 * that stood here is CORRECTED rather than deleted because what it recorded was
 * a real closure whose reason did not survive the sweep. It read: *that leaves
 * `needsTier2` in `index.mjs`, which compares undetermined REGIONS against
 * `counts.chars`, reading the same class of number; it is the ROUTING half,
 * closed on purpose (index.mjs's own note), and is named in D-501's report
 * rather than changed here.* D-501's worker then found three MORE sites reading
 * the same class of number, and two of them make the record CLAIM MORE THAN IT
 * HOLDS rather than merely route a document to the wrong member — which is what
 * moved the closure. SCHEDULER #19 rowed all of them as D-514. They are, and
 * each now counts glyphs through `glyphCount` below:
 *   - `needsTier2` (`index.mjs`) — the ROUTING half, the one named above.
 *   - the wholesale-base refusal in `mergeTier2Text` HERE, and its twin in
 *     `mergeTier3Text` (`index.mjs`), each of which refused a whitespace-only
 *     base SAYING it "already holds N decoded character(s)". A false sentence
 *     in a note is the class CLAUDE.md §2 puts above a missing feature.
 *   - the tier-3 LAYER ATTRIBUTION (`index.mjs`), which put a whitespace-only
 *     page into the `layer` part of the chain, so the record named a tier-1
 *     derivation for a page from which nothing was derived.
 * `counts.chars` is UNCHANGED at every one of them — no interface moves — because
 * a judgment about whether a document holds decoded text is read off THE TEXT IN
 * HAND, never off a producer's counter. The counter is a claim; the string is the
 * fact, and the two disagree by exactly the whitespace. */
const WHITESPACE = /\s/u;
/**
 * The glyphs a string holds: non-whitespace CODE POINTS, D-501's unit and the
 * one counter every reader that judges "is there decoded text here" must read
 * (D-514). Exported for those readers; the SUITE deliberately spells the rule
 * again for itself rather than importing it, which is the note in
 * `tier-pagewise.test.mjs` and still true — a suite that shares its subject's
 * helper has stopped being able to disagree with it.
 *
 * @param {string} s
 * @returns {number}
 */
export function glyphCount(s) {
  if (typeof s !== "string") return 0;
  /* `for…of` over a string iterates CODE POINTS, so a surrogate pair counts
     once. A lone surrogate counts once too, which is the honest answer for a
     thing that is not a glyph either way. */
  let n = 0;
  for (const ch of s) if (!WHITESPACE.test(ch)) n++;
  return n;
}
/* The AWARD's counter — one page's glyphs. The loop moved into `glyphCount`
   above at D-514 so the four reader sites that judge the same question read the
   same counter; this wrapper keeps the page shape the award is written against,
   and keeps `decodedChars` unexported, which is what lets the suite spell the
   rule independently. */
const decodedChars = (page) =>
  (page && typeof page.text === "string") ? glyphCount(page.text) : 0;

/**
 * Which tier wins ONE page. The whole rule, isolated so it can be driven
 * directly and inverted by a control without touching the merge around it.
 *
 * @param {object} p1  tier 1's page: {page, text, undetermined:[{count}]}
 * @param {object} p2  tier 2's page, same shape
 * @returns {"tier1"|"tier2"}
 */
export function perPageTierWinner(p1, p2) {
  if (!p2) return "tier1";                       // nothing offered, nothing to weigh
  if (!p1) return "tier2";                       // tier 1 has no page here at all
  const u1 = undeterminedChars(p1), u2 = undeterminedChars(p2);
  const c1 = decodedChars(p1), c2 = decodedChars(p2);
  /* (1) tier 1's own admission, and (2) the fact about the text in hand. Both,
     or the page stays where it is. */
  return (u2 < u1 && c2 > c1) ? "tier2" : "tier1";
}

/**
 * Merge tier 2's decode into tier 1's PAGE BY PAGE, and say which tier produced
 * each page. The D-283 answer, and the counterpart to `mergeTier3Text`.
 *
 * Returns `{ok, text, perPageTier, replaced, kept, why}`. `ok:false` with a
 * `why` when the merge cannot be made page-wise — the base has no usable
 * `pages[]` grain — because there is then no way to tell WHICH text a wholesale
 * assignment would replace, and refusing costs an unread document while
 * accepting costs an overwritten one. Only the second makes the record claim
 * more than it can support.
 */
export function mergeTier2Text(base, t2) {
  const basePages = (base && Array.isArray(base.pages)) ? base.pages : [];
  const usable = basePages.filter((p) => p && Number.isInteger(p.page));
  const t2Pages = (t2 && Array.isArray(t2.pages)) ? t2.pages : [];

  if (!usable.length) {
    /* D-514 — WHAT THE BASE HOLDS IS COUNTED IN GLYPHS, AND READ OFF THE TEXT IN
       HAND. This read `counts.chars`, the raw character count, and fell back to
       `document.length`: both count whitespace as decoded text, so a page whose
       tier-1 reading is 39 space characters and NO glyph (`legistar-73550` p1,
       M-140) refused a tier-2 decode while SAYING it "already holds 39 decoded
       character(s)". The sentence was false and the refusal it justified cost a
       document its reading — the record claiming more than it holds, which
       CLAUDE.md §2 ranks above a missing feature.
       THE ORDER IS INVERTED ON PURPOSE. The document string is the FACT and
       `counts.chars` is the producer's CLAIM about it, so the string is asked
       first. The counter is consulted only when there is no string to count, and
       then a counter claiming characters over a payload this merge cannot read is
       still REFUSED, in its own words: a producer disagreeing with its own output
       is not a licence to replace what it may be describing. No producer in this
       plane reaches that branch (`tier2-wire.test.mjs` §8 measured it), so it is
       a guard, named rather than dressed up as behaviour. */
    const baseText = (typeof (base && base.document) === "string") ? base.document : null;
    const baseGlyphs = baseText === null ? null : glyphCount(baseText);
    const reported = (base && base.counts && Number.isFinite(base.counts.chars)) ? base.counts.chars : 0;
    if (baseGlyphs === null ? reported > 0 : baseGlyphs > 0)
      return { ok: false, replaced: [], kept: [], perPageTier: null,
               why: `this document's tier-1 reading has no per-page grain and already holds `
                  + `${baseGlyphs === null
                        ? `${reported} character(s) its producer counted and no text this merge can read`
                        : `${baseGlyphs} decoded glyph(s)`}`
                  + `, so a tier-2 decode was refused rather `
                  + `than allowed to replace text page by page it cannot be compared against` };
    /* Nothing to lose — the wholly-unread document. Tier 2 takes it whole, and
       the per-page statement says so honestly rather than inventing pages. */
    return { ok: true, text: t2, wholesale: true, perPageTier: null,
             replaced: t2Pages.map((p) => p.page).filter(Number.isInteger), kept: [] };
  }

  const byPage = new Map();
  for (const p of t2Pages) if (p && Number.isInteger(p.page)) byPage.set(p.page, p);

  const pages = [], undetermined = [], replaced = [], kept = [];
  for (const b of usable) {
    const cand = byPage.get(b.page) || null;
    const winner = perPageTierWinner(b, cand);
    if (winner === "tier2" && cand) {
      replaced.push(b.page);
      pages.push({ page: b.page,
                   text: typeof cand.text === "string" ? cand.text : "",
                   undetermined: Array.isArray(cand.undetermined) ? cand.undetermined : [],
                   tier: 2 });
    } else {
      kept.push(b.page);
      pages.push({ ...b, tier: 1 });
    }
    for (const u of pages[pages.length - 1].undetermined || []) undetermined.push(u);
  }

  const document = pages.map((p) => p.text).filter((t) => typeof t === "string" && t.length).join("\n");
  const text = { ...base, document, pages, undetermined,
                 counts: { chars: document.length, undetermined: undetermined.length } };
  return { ok: true, text, wholesale: false, replaced, kept,
           perPageTier: { tier1: kept, tier2: replaced } };
}

/**
 * The merge in the record's own sentence, for the document's notes. `null` when
 * there is nothing to say, so a document no page moved on reads as it always
 * did — three findings kept apart because collapsing them loses the one a
 * reader needs (D-252's rule, applied here).
 */
export function tier2Note(m) {
  if (!m || !m.ok) return m && m.why ? m.why : null;
  if (m.wholesale) return null;
  const say = [];
  if (m.replaced.length)
    say.push(`${m.replaced.length} page(s) were re-read by the tier-2 decoder, which recovered text `
           + `tier 1 could not map and more of it; the other ${m.kept.length} page(s) kept tier 1's reading`);
  if (m.replaced.length && m.kept.length)
    say.push(`this document's text layer is a merge of two decodes and its chain names the tier per page`);
  return say.length ? say.join("; ") : null;
}
/*__CPDF20_PER_PAGE_END__*/
