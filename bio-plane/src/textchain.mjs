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
  layer:    { role: "derivation", label: "the document's own text layer" },
  /* A page turned into pixels — rendered, or (CPDF-12's observation, to be
     verified across the corpus) EXTRACTED, where a scanned page is one
     full-page embedded image and rasterising it would be work nobody needs. */
  pixels:   { role: "derivation", label: "the page as pixels" },
  /* An OCR engine over those pixels. Names engine and version, because that
     pair is what a calibration is of and what a re-run would need. */
  ocr:      { role: "derivation", label: "optical character recognition" },
  /* A model that rewrote the text — cleaning, joining, correcting. THE STEP
     THIS WHOLE MODULE IS MOST AFRAID OF, and rule 2 is pointed at it. */
  ai:       { role: "derivation", label: "a model rewrote the text" },
  /* A member checked the text against the image and said so, over a stated
     extent. Not a derivation: see the header. */
  attested: { role: "verification", label: "a member checked it against the image" },
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
export function layerChain({ tier = null, container = null, cap = null, measured_by = null } = {}) {
  return [{ step: "layer", tier, container, cap, measured_by }];
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
export function derivationCap(chain) {
  if (checkChain(chain)) return null;
  let cap = null;
  for (const step of chain) {
    if (STEP_KINDS[step.step].role !== "derivation") continue;
    if (step.cap == null || rank(step.cap) == null) continue;
    cap = cap == null ? step.cap : weaker(cap, step.cap);
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

/** Was a machine the last thing to touch this text? The question a projection
 *  asks to keep an OCR'd document distinguishable from a published text layer
 *  at a glance, without re-deriving the chain everywhere. */
export function terminalStep(chain) {
  return checkChain(chain) ? null : chain[chain.length - 1].step;
}

/** A one-line human sentence for the whole chain. Composed FROM the chain, so
 *  it cannot describe a chain other than the one it was given — the drift that
 *  a hand-written summary beside a structured field always eventually has. */
export function describeChain(chain) {
  if (checkChain(chain)) return "this text's provenance was not recorded";
  return chain.map((s) => {
    const base = STEP_KINDS[s.step].label;
    const who = s.engine ? ` (${s.engine}${s.version ? ` ${s.version}` : ""})` : "";
    const by = s.step === "attested" && s.member ? ` (${s.member}${s.at ? `, ${s.at}` : ""})` : "";
    return base + who + by;
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
  const cap = derivationCap(chain);
  return { ceiling: cap, determinant: "derivation", by: [],
           why: cap == null
             ? `no step in this text's provenance carries a measured fidelity, so what it may `
               + `support is undetermined — which is a statement, not a permission`
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
