/* reading-pipeline (R1–R35): a capture's reading from its stored bytes, for `extraction`, which stores it. The tier
   ladder, the chain composed as it goes, the content type's reader over the text, and the reading with its
   provenance, its container, its dialect and its text units; and the pieces of it `extraction`'s re-read (its
   R31–R35) composes (R23). Split from `extraction` by N513 with no change of meaning (its `pipeline.mjs`, which it
   took from the plane's old `index.mjs`), with the reasons kept where the reason is the code's; the rows applied here
   are named at their sites. It is pure: no record, no table, no catalogue row. It fetches nothing about the source:
   the bytes come from the evidence store the caller hands in (R24), and tiers 2 and 3 are reached only through their
   bindings with the capture's digest (R16). R32 (T49) gives text read as text through no format entry its text units
   (`textUnitsOfText`; R33, T50: a text with no blank line split at its line breaks), R34 (T50) its `title`. T33-23 adds the opt-in after-read hook (R25–R27, `hooks.mjs`), which
   `read` never reaches. R37 (fix round 4b): a failed reading says whether its cause is `transient` or `final`; the units
   budget binds the acquire answer only; OCR past its per-request pages states its cursor and owes the rest; a whole above
   what the object can hold is never loaded. */
import { layerChain, appendStep, describeChain, checkChain, checkAnchor, applyConfidenceFloor, mergedChain,
         convertedChain, readingSource, mergeTier2Text, tier2Note, glyphCount, stepCovers } from "../textchain.mjs";
import { getFormat, readingDialect } from "../formats.mjs";
import { identify, doctypeFor, readText } from "../../../docprofile/registry.mjs";
import { driveConvertStep } from "../drive.mjs";
import { readingProvenance, describePages } from "./readingprov.mjs";
import { word, localize } from "../setup-words/index.mjs";

export { readingProvenance, compareProvenance, describePages, PROVENANCE_SCHEME } from "./readingprov.mjs";
export { ReadHooks, readHooksOf } from "./hooks.mjs";

/* ===================================================================== *
 * The bounds (R15).
 * ===================================================================== */

/* REC-91: how much of a capture's text the reading's wire answer may carry. Half of `op=promote`'s INLINE_MAX
   (1 MiB), so JSON escaping and the rest of the acquire document cannot push a promotion over it. */
export const ACQUIRE_TEXT_UNITS_BUDGET = 512 * 1024;
/* What one unit costs the wire BESIDE its text: its extent, its seq and its keys as a caller serialising with
   `JSON.stringify(doc, null, 1)` spends them. Charged per unit, so twenty thousand short paragraphs cannot pass the
   byte budget on their words and blow INLINE_MAX on their punctuation. The smallest chargeable unit is 1 + 128 B, so
   this wire emits at most floor(524288 / 129) = 4,064 units: under the index's own unit bound (extraction R22's 4,096), which
   is why no second unit check sits in the loop (REC-111). */
export const ACQUIRE_TEXT_UNIT_ENVELOPE = 128;
/* CONTENT-SEARCH-DESIGN §4.3: one indexed unit's text is stored to this many characters (M-20: 6.2x the largest
   unit its census produced). The wire cuts a unit to it before charging it (D-685), and the index writer caps at the
   same number (extraction R22): one number, so the wire never pays for text the index discards. */
export const CAPTURE_TEXT_UNIT_CAP = 128 * 1024;
/* R2: a multi-part capture (streamed in 8 MiB parts, the whole never stored under its own digest) is assembled for
   its format entry only up to this many bytes: the office entries' measured text bound (M-20's 20 MiB, `ooxml.mjs`),
   which every entry in the registry guards at or under. Over it the capture is not read, and the reading says so. */
export const MULTIPART_READ_MAX = 20 * 1024 * 1024;
/* R37 (fix round 4b, F10; K4487): the largest whole the object holds to read, measured under workerd with the object's
   128 MB (build/jobs/T51/cause-reading-4.md, step 0): the reading's heap grows with the pages (about 25 MB + 0.031 MB a
   page), and the whole's bytes sit beside it. A whole over this is never loaded: the reading is `final` and says its size. */
export const WHOLE_READ_MAX = 24 * 1024 * 1024;
/* R37 (D4): why a reading failed, as `reading.failure`. `transient`: the cause is outside the document (the store did not
   answer, a member was down or answered 5xx, an entry threw), so a later read can succeed; `final`: the document's own
   content, or its size, so reading it again cannot. A reading that is not a failed one carries neither. */
export const FAILURE_TRANSIENT = "transient";
export const FAILURE_FINAL = "final";

/* ===================================================================== *
 * Tier 2 (R3).
 * ===================================================================== */

/* D-665 (BOB #35, 2026-09-25 06:25Z): `image_unread` says an image is painted and its content unread; it is not an
   undecoded character and counts 0. Two readers judge the DECODE by the marker count (`needsTier2` and docprofile's
   `readText`), so both are handed the text with those markers taken out and the count lowered by as many. The
   markers stay on the text itself. N253 (R3, R11): pdf-reader emits one per painted image (its R34), so without this
   a photo page would escalate to tier 2, which reads no image. */
export function decodeView(text) {
  const marks = text && Array.isArray(text.undetermined) ? text.undetermined : null;
  if (!marks || !marks.some((m) => m && m.reason === "image_unread")) return text;
  const keep = (a) => (Array.isArray(a) ? a.filter((m) => !(m && m.reason === "image_unread")) : a);
  const undetermined = keep(marks);
  const c = text.counts;
  return { ...text, undetermined,
           ...(Array.isArray(text.pages) ? { pages: text.pages.map((p) => (p ? { ...p, undetermined: keep(p.undetermined) } : p)) } : {}),
           ...(c && typeof c.undetermined === "number"
             ? { counts: { ...c, undetermined: c.undetermined - (marks.length - undetermined.length) } } : {}) };
}

/* R3: a PDF escalates to the pdf-worker only when tier 1 got essentially nothing: more undetermined regions than
   glyphs of the text in hand (D-514: glyphs, never raw characters; `counts.chars` only when there is no document
   string), unless every marker is a scan marker, since tier 2 reads no image (CPDF-10; D-627's image-content
   markers are scan markers too). A mixed document still escalates. A missing or malformed text escalates nothing. */
/* The reading's memory (R2): a PDF's `document` is its pages' non-empty text joined by a newline (pdf-reader R2), held
   as a lazily-joined string until something reads it, and reading it makes a second flat copy of the whole book (two
   bytes a character once one page holds a character past U+00FF). When the pages are held beside it and the document's
   length is exactly theirs joined, the glyphs are counted over the pages and the document is never read. */
function pagesJoinLength(text) {
  const pages = text && Array.isArray(text.pages) ? text.pages : null;
  if (!pages || !pages.length || typeof text.document !== "string") return false;
  let n = 0, held = 0;
  for (const p of pages) {
    const t = p && typeof p.text === "string" ? p.text : "";
    if (t.length) { n += t.length; held++; }
  }
  return held > 0 && n + held - 1 === text.document.length;
}
export function glyphsOfDocument(text) {
  if (!text || typeof text.document !== "string") return null;
  return pagesJoinLength(text) ? text.pages.reduce((n, p) => n + (p && typeof p.text === "string" ? glyphCount(p.text) : 0), 0)
                               : glyphCount(text.document);
}
/* The same text without the joined copy, for the stages that read it whole (`docprofile.readText` joins the pages
   itself when the document is absent, R38), or the text itself when its document is not the pages joined. */
export function withoutJoinedDocument(text) {
  if (!pagesJoinLength(text)) return text;
  const { document, ...rest } = text;
  return rest;
}
export function needsTier2(text0) {
  const text = decodeView(text0);
  const c = text && text.counts;
  if (!c || typeof c.chars !== "number" || typeof c.undetermined !== "number") return false;
  const glyphs = typeof text.document === "string" ? glyphsOfDocument(text) : c.chars;
  if (!(c.undetermined > glyphs)) return false;
  const marks = Array.isArray(text.undetermined) ? text.undetermined : [];
  if (marks.length && marks.every((m) => m && (m.reason === "no_text_layer"
      || m.reason === "image_content_unread" || m.reason === "image_content_undetermined"))) return false;
  return true;
}

/* D-697 (R8, N253): a page tier 2 wins keeps a still-true `image_unread`. That is text-chain's `mergeTier2Text` (its
   R90), which carries each such marker after tier 2's own; this module no longer re-carries them. */

/* One tier-2 escalation, as both paths run it (R3). `text` is tier 1's I2 text. Answers `{outcome, text, replaced,
   kept, perPage, note, memberNotes}`. `outcome`: "not_needed" (tier 1 did not get essentially nothing), "unbound"
   (no member), "unavailable" (the binding threw), "no_improvement" (the member answered and could not help),
   "merged" (the merge ran: `text` is the merged text, tier 1's where no page moved, `note` the merge's own), or
   "refused" (the merge refused: tier 1 stands, `note` its reason). `memberNotes` are the member's own notes.
   `transient` is true when the member was down (the binding threw, an answer that is not JSON) or answered 5xx (R37). */
export async function tier2Escalate(env, { sha, storeName, text }) {
  const out = { outcome: "not_needed", text, replaced: [], kept: [], perPage: null, note: null, memberNotes: [] };
  if (!needsTier2(text)) return out;
  if (!(env && env.PDF_WORKER)) { out.outcome = "unbound"; return out; }
  try {
    const r = await env.PDF_WORKER.fetch("https://pdf-worker/structure", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ capture_sha: sha, store: storeName }),
    });
    if (r.status >= 500) out.transient = true;
    const t2 = await r.json();
    if (!(r.ok && t2 && t2.ok && t2.text)) { out.outcome = "no_improvement"; return out; }
    out.memberNotes = (Array.isArray(t2.notes) ? t2.notes : []).filter((n) => typeof n === "string");
    const m = mergeTier2Text(text, t2.text);
    if (m.ok) {
      /* D-251: who made the layer is a fact about the FILE; the member returns no `producer`, so tier 1's is
         carried when the member supplied none. */
      out.outcome = "merged";
      out.text = (text && text.producer && !m.text.producer) ? { ...m.text, producer: text.producer } : m.text;
      out.replaced = m.replaced; out.kept = m.kept || [];
      out.perPage = m.perPageTier || null;
      out.note = tier2Note(m) || null;
    } else { out.outcome = "refused"; out.note = m.why || null; }
  } catch { out.outcome = "unavailable"; out.transient = true; }
  return out;
}

/* The sentence a reading's basis carries when tier 2 could not help (R3: "the reason is carried"). */
export function tier2FailureNote(failure) {
  /* DEC-149 (T35-24, K1960): on the reading's basis, so it names the group's Civicsmith, never "this instance". */
  return failure === "unbound"
    ? word("reading-pipeline.tier_read_essentially")
    : failure === "no_improvement"
      ? word("reading-pipeline.tier_read_essentially_nothing")
      : failure === "unavailable"
        ? word("reading-pipeline.tier_read_essentially_nothing_document")
        : null;
}

/* ===================================================================== *
 * The chain of a text layer (R10).
 * ===================================================================== */

/* CPDF-10: a text layer is itself an unverified transcription (CPDF-9 measured ABBYY FineReader in 3 of 14 recent
   Legistar attachments), so its fidelity is NULL: undetermined, stated. No letter is invented for it. */
export const LAYER_FIDELITY_CAP = null;
export const LAYER_FIDELITY_SOURCE = "unmeasured: a text layer is itself an unverified transcription "
                            + "(CPDF-9, the MEASUREMENTS ledger 2026-08-03)";
/* D-251: a layer whose /Info names OCR software gains `ocr(<product>)`, the engine NAMED from the document's own
   bytes and its cap NULL: somebody else's engine, run at a quality nobody here measured. */
export const NAMED_ENGINE_CAP = null;
export const NAMED_ENGINE_SOURCE = "unmeasured: the engine is NAMED by the document's own /Info producer "
                          + "metadata (D-251; CPDF-9, the MEASUREMENTS ledger 2026-08-03), and no "
                          + "calibration of it exists here (CPDF-13)";

/* R10: `layerChain` at the tier, cap undetermined and the reason stated, extended by `ocr(<product>)` when the
   producer marker names OCR software; a refused append keeps the base chain. */
export function layerChainFor(i2text, { tier, container }) {
  const base = layerChain({ tier, container, cap: LAYER_FIDELITY_CAP, measured_by: LAYER_FIDELITY_SOURCE });
  const p = i2text && i2text.producer;
  if (!p || p.determination !== "ocr") return base;
  const engine = p.ocr && typeof p.ocr.engine === "string" ? p.ocr.engine.trim() : "";
  if (!engine) return base;
  const ext = appendStep(base, {
    step: "ocr", engine, version: null, field: p.ocr.field, marker: p.ocr.marker,
    cap: NAMED_ENGINE_CAP, measured_by: NAMED_ENGINE_SOURCE,
  });
  return Array.isArray(ext) ? ext : base;
}

/* ===================================================================== *
 * Tier 3 (R4–R9, extraction R35).
 * ===================================================================== */

/* R4: the markers that select a page for OCR. `no_text_layer` (a scan) and D-627's `image_content_unread` (an
   image fills the page and its text is a folio). `image_content_undetermined` and D-665's per-image `image_unread`
   route nothing: no measured signal separates a chart under a title from a photo page (M-182). */
export const TIER3_REASONS = Object.freeze(["no_text_layer", "image_content_unread"]);

/* R4: a document is a candidate when a page carries a selecting marker and none carries `encrypted`. */
export function needsTier3(text) {
  const marks = (text && Array.isArray(text.undetermined)) ? text.undetermined : [];
  if (marks.some((m) => m && m.reason === "encrypted")) return false;
  return marks.some((m) => m && TIER3_REASONS.includes(m.reason));
}

/* R4: the pages asked for are the selected pages, ascending. */
export function tier3Pages(text) {
  const marks = (text && Array.isArray(text.undetermined)) ? text.undetermined : [];
  if (marks.some((m) => m && m.reason === "encrypted")) return [];
  const pages = [];
  for (const m of marks) {
    if (!m || !TIER3_REASONS.includes(m.reason)) continue;
    if (!Number.isInteger(m.page) || m.page < 0) continue;
    if (!pages.includes(m.page)) pages.push(m.page);
  }
  return pages.sort((a, b) => a - b);
}

/* D-252 / R6–R9: THE MERGE. An OCR pass may fill a page; it may never replace text a page holds.
 *
 * A page the member returns is merged only when it was ASKED FOR (selected) and exists in the base; any other is
 * refused with its own reason (D-614, R9): `no_such_page`, `not_asked`, or `carries_glyphs` (a selected page whose
 * text holds a glyph and that was not routed as a folio page).
 *
 * D-635 (BOB #35, 2026-09-25 06:25Z: APPEND, R7): a selected page routed by `image_content_unread` whose text is only
 * a folio keeps every glyph it held and gains the transcription APPENDED after it; it is listed in both parts. Its
 * routing marker is discharged, its other markers kept, the engine's added.
 *
 * D-697 (R8): a page OCR fills, by replacement or append, discharges `image_unread`: the engine has read its images.
 *
 * D-616 / D-713 (extraction R35): `kept` is the pages an earlier reading of this capture already transcribed, their whole
 * recorded text handed in as the member's answer. A kept page whose recorded text already begins with the page's
 * layer text is taken as recorded, never appended again, so a folio page re-read keeps ONE copy of its folio.
 *
 * A base with no usable per-page text takes the OCR answer whole only when it holds no glyph; otherwise the answer is
 * refused and the base stands (R6). */
export function mergeTier3Text(base, ocr, eligible, { kept = [] } = {}) {
  const basePages = (base && Array.isArray(base.pages)) ? base.pages : [];
  const usable = basePages.filter((p) => p && Number.isInteger(p.page));
  const ocrPages = (ocr && Array.isArray(ocr.pages)) ? ocr.pages : [];
  const wanted = new Set(eligible);
  const keptSet = new Set(kept);

  if (!usable.length) {
    const baseText = (typeof (base && base.document) === "string") ? base.document : null;
    const baseGlyphs = baseText === null ? null : glyphCount(baseText);
    const reported = (base && base.counts && Number.isFinite(base.counts.chars)) ? base.counts.chars : 0;
    if (baseGlyphs === null ? reported > 0 : baseGlyphs > 0)
      return { ok: false, filled: [], appended: [], refused: [], refusedWhy: [], unanswered: [],
               why: word("reading-pipeline.why.document_text_merged", { base_glyphs: String(baseGlyphs === null
                        ? localize("reading-pipeline.index.reported_characters", "{reported} character(s) its producer counted and no text this merge can read", { reported: String(reported) })
                        : localize("reading-pipeline.index.decoded_glyphs", "{glyphs} decoded glyph(s)", { glyphs: String(baseGlyphs) })) }) };
    return { ok: true, text: ocr, filled: ocrPages.map((p) => p.page).filter(Number.isInteger),
             appended: [], refused: [], refusedWhy: [], unanswered: [], wholesale: true };
  }

  const byPage = new Map();
  const refusedWhy = [];
  const isFolioRouted = (b) => (Array.isArray(b.undetermined) ? b.undetermined : [])
    .some((u) => u && u.reason === "image_content_unread");
  for (const p of ocrPages) {
    if (!p || !Number.isInteger(p.page)) continue;
    const target = usable.find((b) => b.page === p.page);
    if (!target) { refusedWhy.push({ page: p.page, reason: "no_such_page" }); continue; }
    if (!wanted.has(p.page)) { refusedWhy.push({ page: p.page, reason: "not_asked" }); continue; }
    const empty = !(typeof target.text === "string" && glyphCount(target.text) > 0);
    if (!empty && !isFolioRouted(target)) { refusedWhy.push({ page: p.page, reason: "carries_glyphs" }); continue; }
    byPage.set(p.page, { ocr: p, append: !empty });
  }

  const discharged = (u) => u && (TIER3_REASONS.includes(u.reason) || u.reason === "image_unread");
  const filled = [], appended = [], pages = [], undetermined = [];
  for (const b of usable) {
    const hit = byPage.get(b.page);
    const got = hit && hit.ocr;
    const said = got && typeof got.text === "string" ? got.text : "";
    const fromOcr = got && Array.isArray(got.undetermined) ? got.undetermined : [];
    if (got && hit.append) {
      filled.push(b.page); appended.push(b.page);
      const already = keptSet.has(b.page) && said.startsWith(b.text);
      pages.push({ ...b, text: already ? said : (said.length ? `${b.text}\n${said}` : b.text),
                   ...(got.unread_words ? { unread_words: got.unread_words } : {}),
                   undetermined: [...(Array.isArray(b.undetermined) ? b.undetermined : []).filter((u) => !discharged(u)),
                                  ...fromOcr] });
    } else if (got) {
      filled.push(b.page);
      pages.push({ page: b.page, text: said, undetermined: fromOcr,
                   ...(got.unread_words ? { unread_words: got.unread_words } : {}) });
    } else {
      pages.push(b);
    }
    for (const u of pages[pages.length - 1].undetermined || []) undetermined.push(u);
  }
  const unanswered = eligible.filter((p) => !filled.includes(p));
  const document = pages.map((p) => p.text).filter((t) => typeof t === "string" && t.length).join("\n");
  const regions = (ocr && Array.isArray(ocr.regions))
    ? ocr.regions.filter((r) => r && r.source && filled.includes(r.source.page)) : [];
  const text = { ...base, document, pages, undetermined,
                 counts: { chars: document.length, undetermined: undetermined.length } };
  if (regions.length) text.regions = regions;
  return { ok: true, text, filled, appended, refused: refusedWhy.map((r) => r.page), refusedWhy, unanswered,
           wholesale: false };
}

const REFUSAL_SAYS = {
  no_such_page: word("reading-pipeline.document_page"),
  not_asked: word("reading-pipeline.ocr_member_asked"),
  carries_glyphs: word("reading-pipeline.already_carries_text"),
};

/* R9 (D-614, D-607, D-635): what the merge did, in the record's own sentence. Each refused page with its own
   reason; the kept-text clause only when a page kept text (`layerPages`, the pages carrying a glyph that were not
   filled); the appended pages said; null when there is nothing to say. Pages are numbered from 1. */
export function tier3Note(m, memberNote, layerPages) {
  const say = [];
  const kept = Array.isArray(layerPages) ? layerPages.length : 0;
  if (!m.wholesale && m.filled.length)
    say.push(word("reading-pipeline.scanned_page_transcribed", { filled: String(m.filled.length), kept: String(kept ? word("reading-pipeline.already_text_kept", { kept: kept === 1 ? "page" : "pages" }) : "") }));
  if (!m.wholesale && Array.isArray(m.appended) && m.appended.length)
    say.push(word("reading-pipeline.page_already_held", { appended: String(m.appended.length), appended_2: String(m.appended.length === 1 ? "that page is" : "those pages are") }));
  if (m.unanswered.length)
    say.push(word("reading-pipeline.page_text_layer", { unanswered: String(m.unanswered.length) }));
  const why = Array.isArray(m.refusedWhy) ? m.refusedWhy : [];
  if (why.length)
    say.push(word("reading-pipeline.page_ocr_member", { why: String(why.length), page: String(why.map((r) => `${describePages([r.page])} (${REFUSAL_SAYS[r.reason] || r.reason})`).join(", ")) }));
  if (memberNote) say.push(memberNote);
  return say.length ? say.join("; ") : null;
}

/* D-606 (R4): the member reads one page per invocation and names the rest in `deferred`; the caller loops, one page
   per call, in order, within a budget. Cloudflare states a limit of 32 Worker invocations per request (their claim,
   not measured here; Miniflare does not enforce it, M-175); the reserve of 8 covers the other invocations one
   request can make. Past the budget, after a call that throws, a declined page, a page answered under another
   engine build than the first answer, and a page answered to the wrong call are not merged, and the note names
   them. */
export const OCR_INVOCATIONS_PER_REQUEST = 24;
export const OCR_SAME_PROVENANCE = ["engine", "version", "cap", "measured_by", "confidence_floor"];

export async function askMemberPerPage(env, { sha, storeName, wantPages, invocations = OCR_INVOCATIONS_PER_REQUEST }) {
  const call = (pages) => env.OCR_WORKER.fetch("https://ocr-worker/transcribe", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ capture_sha: sha, store: storeName, pages }),
  });
  const r = await call(wantPages);
  if (!r.ok) return { status: r.status };
  const first = await r.json();
  const wanted = new Set(wantPages);
  const deferred = (first && Array.isArray(first.deferred) ? first.deferred : [])
    .filter((p) => Number.isInteger(p) && wanted.has(p));
  const answers = [{ asked: null, body: first }];
  const loop = { invocations: 1, asked: 0, notAsked: [], threw: null, strays: [], mismatched: [], refused: [], down: [] };
  for (let i = 0; i < deferred.length; i++) {
    const page = deferred[i];
    if (loop.invocations >= invocations) { loop.notAsked = deferred.slice(i); break; }
    loop.invocations++; loop.asked++;
    try {
      const rp = await call([page]);
      if (rp.status >= 500) loop.down.push(page);   /* R37: the member was down for this page; it is owed, not declined */
      const body = rp.ok ? await rp.json() : { ok: false, reason: `HTTP_${rp.status}` };
      answers.push({ asked: page, body });
    } catch {
      loop.threw = { at: page, rest: deferred.slice(i) };
      break;
    }
  }
  if (answers.length === 1) return { status: r.status, answer: first, loop };
  const ok = answers.filter((a) => a.body && a.body.ok === true);
  for (const a of answers) if (!(a.body && a.body.ok === true))
    loop.refused.push(a.asked != null ? a.asked : (Number.isInteger(a.body && a.body.page) ? a.body.page : wantPages[0]));
  if (!ok.length) return { status: r.status, answer: first, loop };
  const lead = ok[0].body;
  const pages = [];
  for (const a of ok) {
    const own = (Array.isArray(a.body.pages) ? a.body.pages : []);
    if (a.asked == null) { pages.push(...own); continue; }
    if (OCR_SAME_PROVENANCE.some((k) => a.body[k] !== lead[k])) { loop.mismatched.push(a.asked); continue; }
    for (const p of own) {
      if (p && p.page === a.asked) pages.push(p);
      else loop.strays.push(p && Number.isInteger(p.page) ? p.page : null);
    }
  }
  return { status: r.status, answer: { ...lead, pages, deferred: [] }, loop };
}

/* D-606 (R4): what the loop did not do, naming the pages (numbered from 1). */
export function tier3LoopNote(loop) {
  if (!loop) return null;
  const say = [];
  const named = (ps) => describePages(ps.filter(Number.isInteger));
  if (loop.notAsked.length)
    say.push(localize("reading-pipeline.index.pages_not_asked_request", "{count} of them ({pages}) were not asked for in this request: the OCR member reads one page per call and one request may make at most {limit} such calls here (Cloudflare states a limit of 32 Worker invocations per request — their claim, not measured on this runtime); a re-read (op=pdfstructure&ocr=1) asks for them next",
      { count: String(loop.notAsked.length), pages: String(named(loop.notAsked)), limit: String(OCR_INVOCATIONS_PER_REQUEST) }));
  if (loop.threw)
    say.push(word("reading-pipeline.call_failed_page", { at: String(named([loop.threw.at])), rest: String(loop.threw.rest.length), rest_2: String(named(loop.threw.rest)) }));
  if (loop.refused.length)
    say.push(word("reading-pipeline.ocr_member_declined", { refused: String(loop.refused.length), refused_2: String(named(loop.refused)) }));
  if (loop.mismatched.length)
    say.push(word("reading-pipeline.page_answered_different", { mismatched: String(loop.mismatched.length), mismatched_2: String(named(loop.mismatched)) }));
  if (loop.strays.length)
    say.push(word("reading-pipeline.page_ocr_member_returned", { strays: String(loop.strays.length) }));
  return say.length ? say.join("; ") : null;
}
const withLoopNote = (note, loop) => {
  const extra = tier3LoopNote(loop);
  return extra ? (note ? `${note}; ${extra}` : extra) : note;
};

/* D-616 (extraction R35): the pages a stored reading already transcribed, so a re-read asks the member for the rest and a scan
   longer than one request's budget is read to its tail over successive re-reads. Two sources, each saying one
   thing: the stored CHAIN says which pages a tier-3 part produced and under which build (its `pixels`/`ocr` steps,
   grouped by part); the record's whole per-page UNITS hold the words. A page is kept only when both speak for it:
   a unit with a glyph on a page exactly one tier-3 part covers. Each kept part carries its own chain (the stored
   steps without their stamped extent), so its pages stay under the build that read them.
   R30 (T42; N832, K2611): a part the AI transcribed (`pixels -> ai_transcription`, R29) is seeded by the same rule,
   under its own chain, so a re-read keeps the AI's pages and never asks the OCR member or the AI for them again. */
const TRANSCRIBED = ["ocr", "ai_transcription"];
const SEEDED_STEPS = ["pixels", ...TRANSCRIBED];
export function tier3SeedFrom(reading, units) {
  const chain = reading && Array.isArray(reading.text_source) ? reading.text_source : null;
  if (!chain || checkChain(chain) || !Array.isArray(units) || !units.length) return null;
  const groups = new Map();
  for (const step of chain) {
    if (!SEEDED_STEPS.includes(step.step)) continue;
    const key = JSON.stringify(step.extent ?? null);
    if (!groups.has(key)) groups.set(key, { extent: step.extent ?? null, chain: [] });
    const { extent, ...bare } = step;
    groups.get(key).chain.push(bare);
  }
  const parts = [];
  for (const g of groups.values()) {
    if (!g.chain.some((x) => TRANSCRIBED.includes(x.step)) || checkChain(g.chain)) continue;
    if (g.extent == null && chain.some((x) => !SEEDED_STEPS.includes(x.step))) continue;
    parts.push({ chain: g.chain, covers: (p) => stepCovers({ step: "ocr", extent: g.extent ?? undefined }, p) });
  }
  const text = new Map(), pagesOf = parts.map(() => []);
  for (const u of units) {
    if (!u || !Number.isInteger(u.page) || typeof u.text !== "string" || !(glyphCount(u.text) > 0)) continue;
    const owners = parts.map((pt, i) => (pt.covers(u.page) ? i : -1)).filter((i) => i >= 0);
    if (owners.length !== 1) continue;
    text.set(u.page, u.text);
    pagesOf[owners[0]].push(u.page);
  }
  const kept = parts.map((pt, i) => ({ chain: pt.chain, pages: pagesOf[i] })).filter((pt) => pt.pages.length);
  return kept.length ? { parts: kept, text } : null;
}

/* D-616: the member's answer with the kept pages added, in the I2 shape the merge reads. */
function withKeptPages(text, kept, seed) {
  if (!kept.length) return text;
  const pages = [...(Array.isArray(text && text.pages) ? text.pages : []),
                 ...kept.map((p) => ({ page: p, text: seed.text.get(p), undetermined: [] }))]
    .sort((a, b) => a.page - b.page);
  const document = pages.map((p) => p.text).filter(Boolean).join("\n");
  return { ...(text || {}), document, pages,
           counts: { ...((text && text.counts) || {}), chars: pages.reduce((n, p) => n + (p.text || "").length, 0) } };
}

/* CPDF-13 (R5): what the OCR member answered, taken only when it names its engine and version and a measured cap
   with `measured_by`. A region with no checkable image anchor is dropped and counted; a region below the member's
   confidence floor reads undetermined and its text is discarded (`applyConfidenceFloor`); a page no region anchors
   is not merged. The chain is `pixels → ocr(engine, version)`, both at the member's cap, naming `calibration` (the
   live calibration of that engine and version, R5) or none. */
export function ocrTextFromMember(res, { calibration = null } = {}) {
  const r = res && typeof res === "object" ? res : {};
  if (r.ok !== true)
    return { ok: false, why: word("reading-pipeline.why.ocr_member_declined", { reason: typeof r.reason === "string" ? ` (${r.reason})` : "" }) };
  if (!(typeof r.engine === "string" && r.engine) || !(typeof r.version === "string" && r.version))
    return { ok: false, why: word("reading-pipeline.why.ocr_member_name") };
  if (!(typeof r.cap === "string" && r.cap) || !(typeof r.measured_by === "string" && r.measured_by))
    return { ok: false, why: word("reading-pipeline.why.ocr_member_reported") };
  const pages = Array.isArray(r.pages) ? r.pages : [];
  let anchorless = 0, kept = 0, floored = 0, undetermined = 0;
  const outPages = [];
  /* R35: the words of a region the confidence floor (or an unusable confidence) discards are counted, never carried:
     only the count rides on the page, so a reading can say how many words it could not read. */
  const unreadOf = (before, after) => before.reduce((n, region, i) =>
    n + (after[i] && after[i].text == null && typeof region.text === "string" ? wordsIn(region.text) : 0), 0);
  for (const p of pages) {
    const pageNo = p && Number.isInteger(p.page) ? p.page : null;
    if (pageNo == null) continue;
    const anchored = [];
    for (const region of (Array.isArray(p && p.regions) ? p.regions : [])) {
      if (checkAnchor(region && region.source)) { anchorless++; continue; }
      anchored.push(region);
    }
    if (!anchored.length) continue;
    const f = applyConfidenceFloor(anchored, typeof r.confidence_floor === "number" ? r.confidence_floor : null);
    floored += f.floored; undetermined += f.undetermined;
    kept += f.regions.filter((x) => x.text != null).length;
    const unread = unreadOf(anchored, f.regions);
    outPages.push({ page: pageNo, regions: f.regions, ...(unread ? { unread_words: unread } : {}),
                    text: f.regions.map((x) => x.text).filter((t) => typeof t === "string").join("\n"),
                    undetermined: f.regions.filter((x) => x.undetermined)
                      .map((x) => ({ page: pageNo, reason: "ocr_below_floor", font: null,
                                     codes: null, count: 1, why: x.why })) });
  }
  if (!outPages.length)
    return { ok: false, why: word("reading-pipeline.why.ocr_member_returned") };
  const chain = appendStep([{ step: "pixels", cap: r.cap, measured_by: r.measured_by, calibration }],
                           { step: "ocr", engine: r.engine, version: r.version,
                             cap: r.cap, measured_by: r.measured_by, calibration });
  if (!Array.isArray(chain))
    return { ok: false, why: word("reading-pipeline.why.ocr_member_provenance", { detail: String(chain.detail) }) };
  const text = {
    document: outPages.map((p) => p.text).filter(Boolean).join("\n"),
    pages: outPages.map((p) => ({ page: p.page, text: p.text, undetermined: p.undetermined,
                                 ...(p.unread_words ? { unread_words: p.unread_words } : {}) })),
    undetermined: outPages.flatMap((p) => p.undetermined),
    counts: { chars: outPages.reduce((n, p) => n + p.text.length, 0), undetermined },
    regions: outPages.flatMap((p) => p.regions),
  };
  const note = anchorless
    ? word("reading-pipeline.region_ocr_member", { anchorless: String(anchorless) })
    : null;
  return { ok: true, text, chain, kept, floored, note };
}

/* CPDF-19 / D-319 (R4–R7, extraction R35): the tier-3 seam, one function both paths call, so an acquire and a re-read compose
   one chain by one rule. `liveCalibration({engine, version})` is `calibration.liveCalibration` (R10 there): the
   calibration the chain names, or null; one that cannot be read is none, never the nearest measurement. `seed` is
   `tier3SeedFrom`'s answer (the re-read only). Never throws for a member's failure: that is `ocrNote`. */
export async function tier3Extend(env, { sha, storeName, i2text, wiredTier, tier2PerPage, fmt, seed = null,
                                         liveCalibration = null, invocations = OCR_INVOCATIONS_PER_REQUEST }) {
  let chain, chainSet = false, ocrNote = null, filled = [], engine = null, unanswered = [], loop = null;
  let seeded = [], transient = false, owed = [];
  const wanted = !!(i2text && needsTier3(i2text));
  if (wanted) {
    const wantPages = tier3Pages(i2text);
    const baseTier = wiredTier;
    const baseText = i2text;
    const kept = seed ? wantPages.filter((p) => seed.text.has(p)) : [];
    const askPages = wantPages.filter((p) => !kept.includes(p));
    /* The merge and the chain, one rule for the member's answer and for the kept pages alone: `answer` is the I2 text
       merged (the kept pages added), `fresh` the chain of the pages read now (null when none were). */
    const compose = (answer, freshChain) => {
      const m = mergeTier3Text(baseText, answer, wantPages, { kept });
      if (!m.ok) return m;
      i2text = m.text;
      const appendedTo = Array.isArray(m.appended) ? m.appended : [];
      /* The pages that kept their own text, from the TEXT: a page with no glyph is in no part (D-514), an
         appended page is in the layer part and the engine's (D-635). */
      const layerPages = (Array.isArray(m.text.pages) ? m.text.pages : [])
        .filter((p) => p && Number.isInteger(p.page)
                    && (!m.filled.includes(p.page) || appendedTo.includes(p.page))
                    && typeof p.text === "string" && glyphCount(p.text) > 0)
        .map((p) => p.page);
      const parts = [];
      /*__REC102_TIER3_LAYER_PARTS_START__*/
      /* REC-102 / D-372: the layer part is partitioned by the tier-2 merge's own per-page statement; a page
         it does not speak for goes to the part at the document's own tier, never guessed into one. With
         no partition this is the one part at `baseTier` it always was. */
      const layerSet = new Set(layerPages);
      const spokenFor = tier2PerPage
        ? [[1, (tier2PerPage.tier1 || []).filter((p) => layerSet.has(p))],
           [2, (tier2PerPage.tier2 || []).filter((p) => layerSet.has(p))]]
        : [];
      const spoken = new Set(spokenFor.flatMap(([, ps]) => ps));
      for (const [tier, ps] of spokenFor)
        if (ps.length) parts.push({ pages: ps, chain: layerChainFor(baseText, { tier, container: fmt }) });
      const unspoken = layerPages.filter((p) => !spoken.has(p));
      if (unspoken.length)
        parts.push({ pages: unspoken, chain: layerChainFor(baseText, { tier: baseTier, container: fmt }) });
      /*__REC102_TIER3_LAYER_PARTS_END__*/
      /* D-616: the kept pages under the chain of the build that read them (R30: the AI's under its own), the pages
         read now under this build's; one part when the two chains are the same. */
      const keptIn = m.filled.filter((p) => kept.includes(p));
      const fresh = m.filled.filter((p) => !kept.includes(p));
      const t3parts = [];
      for (const pt of [...(seed ? seed.parts : []).map((x) => ({ chain: x.chain,
                           pages: x.pages.filter((p) => keptIn.includes(p)) })),
                        ...(freshChain ? [{ chain: freshChain, pages: fresh }] : [])]) {
        if (!pt.pages.length) continue;
        const same = t3parts.find((q) => JSON.stringify(q.chain) === JSON.stringify(pt.chain));
        if (same) same.pages = [...same.pages, ...pt.pages].sort((a, b) => a - b);
        else t3parts.push({ chain: pt.chain, pages: [...pt.pages] });
      }
      parts.push(...t3parts);
      /* One part gives its chain back unscoped; two give the scoped chain, its cap undetermined. A refusal
         from the chain builder records no chain. */
      const merged = mergedChain(parts);
      chain = Array.isArray(merged) ? merged : null; chainSet = true;
      /* R30: a kept page the AI read keeps the reading at the AI's tier (R29's 4). */
      if (m.filled.length)
        wiredTier = t3parts.some((pt) => pt.chain.some((s) => s.step === "ai_transcription")) ? 4 : 3;
      filled = fresh; seeded = keptIn; unanswered = m.unanswered || [];
      return { ...m, layerPages, appendedTo };
    };
    /* R30 (D-616): the kept pages alone, when the member is not asked for them or could not add to them; never
       dropped because the member was absent, failed or had nothing left to read. */
    const keepSeeded = () => (kept.length ? compose(withKeptPages(null, kept, seed), null) : { ok: false });
    const keptSaid = () => word("reading-pipeline.transcribed_earlier_reading", { seeded: String(seeded.length) });
    if (env && env.OCR_WORKER && kept.length && !askPages.length) {
      const k = keepSeeded();
      if (!k.ok) seeded = kept;
      ocrNote = word("reading-pipeline.page_document_without", { kept: String(kept.length) });
    } else if (env && env.OCR_WORKER) {
      let failure = null;
      try {
        const asked = await askMemberPerPage(env, { sha, storeName, wantPages: askPages, invocations });
        loop = asked.loop || null;
        /* The status is read before the body: a 500's body may not parse, and "could not be reached" is a
           different finding from "answered an error". */
        if (!(asked.status >= 200 && asked.status < 300)) {
          failure = word("reading-pipeline.ocr_member_answered", { status: String(asked.status) });
          if (asked.status >= 500) { transient = true; owed = askPages; }
        } else {
          const ocrAnswer = asked.answer;
          let calRef = null;
          try {
            const live = typeof liveCalibration === "function"
              ? await liveCalibration({ engine: String(ocrAnswer && ocrAnswer.engine || ""),
                                        version: String(ocrAnswer && ocrAnswer.version || "") })
              : null;
            calRef = live && typeof live.calibration_id === "string" ? live.calibration_id : null;
          } catch { calRef = null; }
          const built = ocrTextFromMember(ocrAnswer, { calibration: calRef });
          if (built.ok) {
            const m = compose(withKeptPages(built.text, kept, seed), built.chain);
            if (!m.ok) failure = withLoopNote(m.why, loop);
            else {
              engine = { engine: String(ocrAnswer.engine), version: String(ocrAnswer.version), calibration: calRef };
              ocrNote = withLoopNote(tier3Note(m, built.note, m.layerPages.filter((p) => !m.appendedTo.includes(p))), loop);
              if (seeded.length) ocrNote = `${ocrNote}; ${keptSaid()}`;
            }
          } else failure = withLoopNote(built.why, loop);
        }
      } catch {
        failure = word("reading-pipeline.ocr_member_reached");
        transient = true; owed = askPages;
      }
      /* R37 (F9): the pages the request did not reach (past its calls, after a call that threw, or a call the member
         failed with a 5xx) are owed, not lost: they are named here for the caller to carry on from the first of them. */
      if (loop) owed = [...owed, ...loop.notAsked, ...(loop.threw ? loop.threw.rest : []), ...loop.down];
      if (loop && (loop.threw || loop.down.length)) transient = true;
      if (failure !== null) {
        ocrNote = failure;
        if (keepSeeded().ok && seeded.length) ocrNote = `${ocrNote}; ${keptSaid()}`;
      }
    } else if (keepSeeded().ok && seeded.length) {
      /* R30: no member is bound, and the pages an earlier reading transcribed are kept all the same. */
      const rest = unanswered.length;
      ocrNote = word("reading-pipeline.page_document_without_text", { seeded: String(seeded.length), rest: String(rest ? word("reading-pipeline.text_layer_read", { rest: String(rest) }) : "") });
    } else {
      /* DEC-149 (T35-24): member-facing, so it names the group's Civicsmith, never "this instance". */
      ocrNote = word("reading-pipeline.document_text_layer");
    }
  }
  /* D-418 (R6): a document still wants OCR when it was selected and nothing was filled, or a selected page is
     still unread. A page kept from an earlier reading is read (D-616). */
  const stillWanting = wanted && (!(filled.length + seeded.length) || unanswered.length > 0);
  /* R37: `left` is the pages still owed to the OCR member, ascending, and `cursor` the first of them; none when every
     page was read or declined (a declined page is the document's own, final). */
  const gone = new Set([...filled, ...seeded]);
  const pagesLeft = [...new Set(owed)].filter((p) => !gone.has(p)).sort((a, b) => a - b);
  return { i2text, wiredTier, chain, chainSet, ocrNote, filled, seeded, engine, stillWanting, transient,
           ...(pagesLeft.length ? { left: { cursor: pagesLeft[0], pages: pagesLeft } } : {}) };
}

/* ===================================================================== *
 * Tier 4: the AI's reading of a page (R29).
 * ===================================================================== */

/* R29 (T41-9; N820, D21; text-chain R104): a transcription tier above tier 3. For the pages Civicsmith's own text
   recognition could not read, and only at a member's act, on the account that pays for that act and within its
   limits (`use: "transcribe"`), the AI's reading is merged as tier 3's is (R6's rule: an asked-for page with no
   glyph is filled, a folio page gains it appended) under the part `pixels -> ai_transcription(<model>)`, both
   uncapped: the AI's reading, undetermined until its accuracy is measured (BIO_Investigation §6).

   The module stays pure and reaches none of it by import. The caller acting at the member's request hands in
   `transcription = {member, project?, accounts, useCheck, transcribe, at?}`:
   - `accounts`: the paying account's service, an object whose `accountFor` is `ai-accounts.accountFor` (its R7, R11;
     R31, T48), asked for the act `{kind: "transcribe", member, project}`. It refuses a "no AI" material limit first
     (the group's, or the project's), then no account, the use switched off, a project the member has not joined; any
     refusal sends nothing. Through T48 a `transcription` that hands `credentials` and no `accounts` is read the same
     way (`credentials` R72's delegate answers `accountFor` as `ai-accounts` does), until the plane's transcriber
     re-points; the alias is removed in the tranche after (R31);
   - `useCheck`: `ai-use.useCheck` (its R3), asked `{owner, member, use: "transcribe", at}` for the account chosen;
     a refusal, or none handed in, sends nothing (a limit nobody checked is not one the act is within);
   - `transcribe`: the caller's AI path, handed `{account, capture_sha, store, pages, use}`, answering
     `{ok: true, engine, version?, pages: [{page, text}]}`.
   The account's key goes to `transcribe` only, never into the reading or a note. */
export const TRANSCRIBE_USE = "transcribe";
export const AI_TRANSCRIPTION_SOURCE = "unmeasured: the AI's reading of a page that is only a picture is "
  + "undetermined until its accuracy is measured (text-chain R104; BIO_Investigation_v0_1.md §6)";
export const AI_READING_LABEL = localize("reading-pipeline.index.ai_reading_label", "the AI's reading");

/* R29: the pages Civicsmith's own text recognition could not read, ascending: a page still carrying a marker that
   selects it for OCR (tier 3 did not fill it), or one OCR filled with no glyph (every region below its floor). None
   for a document with no per-page text, or one carrying `encrypted`. */
export function tier4Pages(text) {
  const pages = (text && Array.isArray(text.pages)) ? text.pages : [];
  const marks = (text && Array.isArray(text.undetermined)) ? text.undetermined : [];
  if (marks.some((m) => m && m.reason === "encrypted")) return [];
  const out = [];
  for (const p of pages) {
    if (!p || !Number.isInteger(p.page) || p.page < 0 || out.includes(p.page)) continue;
    const own = Array.isArray(p.undetermined) ? p.undetermined : [];
    const routed = own.some((u) => u && TIER3_REASONS.includes(u.reason));
    const floored = own.some((u) => u && u.reason === "ocr_below_floor")
      && !(typeof p.text === "string" && glyphCount(p.text) > 0);
    if (routed || floored) out.push(p.page);
  }
  return out.sort((a, b) => a - b);
}

/* The parts a settled chain is made of, so the AI's part can be added beside them (`mergedChain`'s input). An
   unscoped chain is one part, over `unscopedPages`; a scoped one is its parts as `mergedChain` stamped them, each
   with its pages and its steps without the stamp. Null when a part cannot be read back. */
function partsOfChain(chain, unscopedPages) {
  if (!Array.isArray(chain) || checkChain(chain)) return null;
  const derivations = chain.filter((x) => x && x.extent != null);
  if (!derivations.length) return unscopedPages.length ? [{ pages: unscopedPages, chain }] : [];
  const parts = new Map();
  for (const step of chain) {
    const e = step.extent;
    if (!(e && e.kind === "pages" && Array.isArray(e.pages))) return null;
    const key = Number.isInteger(e.part) ? `#${e.part}` : e.pages.join(",");
    const { extent, ...bare } = step;
    if (!parts.has(key)) parts.set(key, { pages: e.pages.slice(), chain: [] });
    parts.get(key).chain.push(bare);
  }
  return [...parts.values()];
}

const AI_REFUSAL_SAYS = {
  no_such_page: word("reading-pipeline.document_page"),
  not_asked: word("reading-pipeline.asked"),
  carries_glyphs: word("reading-pipeline.already_carries_text_reading"),
};
const refusalSays = (r) => [r && r.code, r && (r.detail || r.translation)].filter((x) => typeof x === "string" && x)
  .join(": ") || "refused";

/* R29: the tier-4 seam. `chain` is the chain settled through tier 3 (before a Drive export's conversion), `wiredTier`
   its tier. Answers `{i2text, chain, wiredTier, aiNote, filled, engine}`: unchanged, with the reason in `aiNote`,
   whenever nothing was filled. (T43; N853a, K2611) When the paying account or its limits refuse (`accountFor`'s
   answer that is not `ok`, or `useCheck`'s refusal, each an object), that refusal is also answered as given in
   `aiRefusal`, so the caller can answer it as the refusal it is; every other stop is `aiNote` alone, with no
   `aiRefusal` key. Never throws. */
export async function tier4Extend(transcription, { sha, storeName, i2text, chain, wiredTier }) {
  const out = { i2text, chain, wiredTier, aiNote: null, filled: [], engine: null };
  if (!transcription || typeof transcription !== "object") return out;
  const pages = tier4Pages(i2text);
  const not = (why) => { out.aiNote = word("reading-pipeline.asked_transcribe", { pages: String(describePages(pages)), why: String(why) }); return out; };
  const refused = (r) => {
    if (r && typeof r === "object") out.aiRefusal = r;
    return not(refusalSays(r));
  };
  if (!pages.length) {
    out.aiNote = word("reading-pipeline.page_left_civicsmith");
    return out;
  }
  const { member = null, project = null, accounts = null, credentials = null, useCheck = null, transcribe = null }
    = transcription;
  if (!(typeof member === "string" && member))
    return not(word("reading-pipeline.transcribes_member_act"));
  /* R31 (T48): `accounts` when handed; `credentials` only in its place, through T48. */
  const payer = accounts != null ? accounts : credentials;
  if (!(payer && typeof payer.accountFor === "function"))
    return not(word("reading-pipeline.account_pay_checked"));
  let account;
  try {
    account = await payer.accountFor({ member, act: { kind: TRANSCRIBE_USE, member,
                                                      ...(project != null ? { project } : {}) } });
  } catch { return not(word("reading-pipeline.account_pay_checked")); }
  if (!(account && account.ok === true)) return refused(account);
  /* N835 (ai-use R1): the paying owner is spelled from the bare member id, whether `member` was handed bare or
     stamped `member:<id>`; `member:member:<id>` is no owner ai-use can judge. */
  const owner = account.level === "project" ? `project:${account.project}`
    : account.level === "group" ? "group" : `member:${member.startsWith("member:") ? member.slice(7) : member}`;
  if (typeof useCheck !== "function") return not(word("reading-pipeline.limits_account_pay"));
  const at = typeof transcription.at === "string" && transcription.at ? transcription.at : new Date().toISOString();
  try {
    const limit = await useCheck({ owner, member, use: TRANSCRIBE_USE, at });
    if (limit) return refused(limit);
  } catch { return not(word("reading-pipeline.limits_account_pay")); }
  if (typeof transcribe !== "function") return not(word("reading-pipeline.set_transcribe"));
  let res;
  try {
    res = await transcribe({ account, capture_sha: sha, store: storeName, pages: [...pages], use: TRANSCRIBE_USE });
  } catch { return not(word("reading-pipeline.reached")); }
  const r = res && typeof res === "object" ? res : {};
  if (r.ok !== true) return not(localize("reading-pipeline.index.ai_declined", "the AI declined{reason}", { reason: typeof r.reason === "string" ? ` (${r.reason})` : "" }));
  const engine = typeof r.engine === "string" ? r.engine.trim() : "";
  if (!engine) return not(word("reading-pipeline.answer_name_model"));
  const version = typeof r.version === "string" && r.version.trim() ? r.version.trim() : null;
  const answered = (Array.isArray(r.pages) ? r.pages : [])
    .filter((p) => p && Number.isInteger(p.page) && typeof p.text === "string" && glyphCount(p.text) > 0)
    .map((p) => ({ page: p.page, text: p.text, undetermined: [] }));
  const m = mergeTier3Text(i2text, { pages: answered }, pages);
  if (!m.ok) return not(m.why);
  if (!m.filled.length) return not(word("reading-pipeline.returned_text_page"));
  const part = appendStep([{ step: "pixels", cap: null, measured_by: AI_TRANSCRIPTION_SOURCE, calibration: null }],
                          { step: "ai_transcription", engine, version, cap: null, measured_by: AI_TRANSCRIPTION_SOURCE,
                            calibration: null });
  if (!Array.isArray(part)) return not(word("reading-pipeline.provenance_refused", { detail: String(part.detail) }));
  const replaced = m.filled.filter((p) => !m.appended.includes(p));
  const held = (m.text.pages || []).filter((p) => p && Number.isInteger(p.page) && !replaced.includes(p.page)
                                                  && typeof p.text === "string" && glyphCount(p.text) > 0).map((p) => p.page);
  const parts = partsOfChain(chain, held);
  if (!parts) return not(word("reading-pipeline.chain_text_already"));
  const merged = mergedChain([...parts, { pages: m.filled, chain: part }]);
  if (!Array.isArray(merged)) return not(word("reading-pipeline.provenance_refused", { detail: String(merged.detail) }));
  out.i2text = m.text; out.chain = merged; out.wiredTier = 4;
  out.filled = m.filled; out.engine = { engine, version };
  const say = [word("reading-pipeline.civicsmith_text_recognition", { filled: String(describePages(m.filled)), filled_2: String(m.filled.length === 1
    ? "was" : "were"), engine: String(engine), version: String(version ? ` ${version}` : ""), ai_reading_label: String(AI_READING_LABEL) })];
  if (m.appended.length)
    say.push(word("reading-pipeline.already_held_little", { appended: String(describePages(m.appended)) }));
  if (m.unanswered.length) say.push(word("reading-pipeline.transcribe_unread", { unanswered: String(describePages(m.unanswered)), unanswered_2: String(m.unanswered.length
    === 1 ? "it stays" : "they stay") }));
  if (m.refusedWhy.length)
    say.push(word("reading-pipeline.page_returned_merged", { refused_why: String(m.refusedWhy.length), page: String(m.refusedWhy.map((x) => `${describePages([x.page])} (${AI_REFUSAL_SAYS[x.reason] || x.reason})`).join(", ")) }));
  out.aiNote = say.join("; ");
  return out;
}

/* ===================================================================== *
 * Text units (R15).
 * ===================================================================== */

/* REC-91 (R15): the indexable units of a capture's final text, recognised by SHAPE: one per page (`pages[]`, a
   `pdf-page` extent with the rect null, the whole page), paragraph (`paragraphs[]`, `doc-para`) or slide (`slides[]`,
   `slide-shape` with the shape omitted, the whole slide, Bob 2026-09-15) holding a glyph (D-531), its extent in the
   producer's own numbering and `seq` its position. An absent list and an empty one are different answers: no unit
   list is null.
   THE WIRE'S BUDGET: at most ACQUIRE_TEXT_UNITS_BUDGET, each unit charged its UTF-8 bytes plus the envelope.
   D-685 (R15): a unit is cut to CAPTURE_TEXT_UNIT_CAP before it is charged, and the cut is said (`truncated`), so
   the prefix the index receives is the prefix it would keep. A unit whose capped prefix does not fit what remains is
   left out, and every unit left out is NAMED (D-724, BOB #36 2026-09-25 11:20Z, option (b)): as runs of consecutive
   skipped units (first and last extent and seq, a count), because the keys ride in `data/provenance.json` under
   INLINE_MAX; a capture sends at most ~1,018 runs.
   N108 (R15, retrieval R25, D-672): a workbook's unit is its SHEET, `sheet-range` at the whole used range its reader
   names (`sheets[].range`, `usedSheetRange` in the xlsx, ods and csv entries); a sheet whose range the reader could
   not name is no unit, never a guessed rectangle. A workbook's defined names and tables are not units here. */
const sheetRangeOf = (u) => {
  const r = u.range;
  return r && r.kind === "sheet-range" && typeof r.sheet === "string" && r.sheet && typeof r.range === "string" && r.range
    ? { sheet: r.sheet, range: r.range } : { sheet: null, range: null };
};
/* Every unit of the text, before the wire's cap and budget: null when the text has no unit list. */
function allUnitsOf(i2text) {
  if (!i2text) return null;
  const arm = (list, kind, fields) => (Array.isArray(list) ? list : [])
    .map((u, i) => (u && typeof u === "object" && typeof u.text === "string" && glyphCount(u.text) > 0
      ? { extent: { kind, ...fields(u, i) }, seq: i, text: u.text } : null))
    .filter(Boolean);
  return Array.isArray(i2text.pages)      ? arm(i2text.pages, "pdf-page",
        (u, i) => ({ page: Number.isInteger(u.page) ? u.page : i, rect: null }))
    : Array.isArray(i2text.paragraphs) ? arm(i2text.paragraphs, "doc-para",
        (u, i) => ({ para: Number.isInteger(u.para) ? u.para : i, run: null }))
    : Array.isArray(i2text.slides)     ? arm(i2text.slides, "slide-shape",
        (u, i) => ({ slide: Number.isInteger(u.slide) ? u.slide : i, shape: null }))
    : Array.isArray(i2text.sheets)     ? arm(i2text.sheets, "sheet-range", sheetRangeOf)
        .filter((u) => u.extent.sheet !== null)
    : null;
}
/* The UTF-8 length of a string, counted without encoding it (the wire charges every unit, and a book is thousands). */
export function utf8Length(s) {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 0x80) n += 1;
    else if (c < 0x800) n += 2;
    else if (c >= 0xd800 && c <= 0xdbff && i + 1 < s.length && (s.charCodeAt(i + 1) & 0xfc00) === 0xdc00) { n += 4; i++; }
    else n += 3;
  }
  return n;
}
/* R37 (F8): `budget` is the bytes the units may spend. The default is the acquire answer's (R15): the wire carries at
   most that. The index path (a held reading read again, a re-read) has no wire, so its caller hands `Infinity` and
   every unit is given, each still cut to CAPTURE_TEXT_UNIT_CAP; the index's own bound is the caller's (extraction R22). */
export function textUnitsFor(i2text, { budget: wireBudget = ACQUIRE_TEXT_UNITS_BUDGET } = {}) {
  let textUnits = null, textUnitsOverBound = 0, textUnitsSkipped = null;
  if (i2text) {
    const units = allUnitsOf(i2text);
    let budget = wireBudget, dropped = 0;
    const kept = [], runs = [];
    let run = null;
    const skip = (u) => {
      if (run) { run.last = u.extent; run.last_seq = u.seq; run.units++; return; }
      run = { first: u.extent, first_seq: u.seq, last: u.extent, last_seq: u.seq, units: 1 };
      runs.push(run);
    };
    for (const u of (units || [])) {
      const cut = u.text.length > CAPTURE_TEXT_UNIT_CAP;
      const text = cut ? u.text.slice(0, CAPTURE_TEXT_UNIT_CAP) : u.text;
      /* A string's UTF-8 is never shorter than its length in UTF-16 units, so a unit that cannot fit even at one
         byte a unit is left out without being measured. */
      const size = text.length + ACQUIRE_TEXT_UNIT_ENVELOPE > budget ? Infinity : utf8Length(text) + ACQUIRE_TEXT_UNIT_ENVELOPE;
      if (size > budget) { dropped++; skip(u); continue; }
      budget -= size; kept.push(cut ? { ...u, text, truncated: true } : u); run = null;
    }
    textUnits = kept.length ? kept : null;
    textUnitsOverBound = dropped;
    textUnitsSkipped = runs.length ? runs : null;
  }
  return { textUnits, textUnitsOverBound, textUnitsSkipped };
}

/* R35 (T51 fix round 2, C17): the words of a text, a word being a run of non-whitespace holding a glyph. */
const SPACE = /\s/;
export function wordsIn(s) {
  if (typeof s !== "string") return 0;
  let n = 0, inWord = false;
  for (let i = 0; i < s.length; i++) {
    const w = !SPACE.test(s[i]);
    if (w && !inWord) n++;
    inWord = w;
  }
  return n;
}

/* R35: `{words_total, words_read}` of a text that has text units, else null. `words_total` is the words of every unit the
   text has plus the words an OCR region below its floor held (carried as a count on the page, `unread_words`, never
   as text); `words_read` is the words of the units `textUnitsFor` keeps, a unit cut to its cap by the prefix it keeps. They
   are equal when the whole text was read. */
export function textWordsFor(i2text, keptUnits = undefined, { budget } = {}) {
  const kept = keptUnits !== undefined ? keptUnits : textUnitsFor(i2text, { budget }).textUnits;
  if (!kept) return null;
  const all = allUnitsOf(i2text) || [];
  const unread = (Array.isArray(i2text.pages) ? i2text.pages : [])
    .reduce((n, p) => n + (p && Number.isInteger(p.unread_words) && p.unread_words > 0 ? p.unread_words : 0), 0);
  const sum = (units) => units.reduce((n, u) => n + wordsIn(u.text), 0);
  return { words_total: sum(all) + unread, words_read: sum(kept) };
}

/* ===================================================================== *
 * Text units of a capture read as text (R32).
 * ===================================================================== */

/* R32: a capture read as text through no format entry (R1) has no `paragraphs` list from an entry, so its units are
   drawn here from the decoded text: one `doc-para` per paragraph, a paragraph being a run of text between blank lines,
   numbered from 0 over all paragraphs in the text's order (`textUnitsFor` skips the ones with no glyph and keeps
   `seq` as the position, R15). Nothing is added to the format registry: this is the one site. */
const HTML_ENTITIES = { amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'", nbsp: " ", copy: "©", reg: "®",
  trade: "™", mdash: "—", ndash: "–", hellip: "…", lsquo: "‘", rsquo: "’", ldquo: "“",
  rdquo: "”", bull: "•", middot: "·", sect: "§", para: "¶", deg: "°", times: "×",
  laquo: "«", raquo: "»", eacute: "é", egrave: "è", aacute: "á", iacute: "í",
  oacute: "ó", uacute: "ú", ntilde: "ñ", uuml: "ü", ouml: "ö", auml: "ä", ccedil: "ç" };
const decodeReferences = (s) => s.replace(/&(?:#(\d{1,7})|#[xX]([0-9a-fA-F]{1,6})|([A-Za-z][A-Za-z0-9]{1,8}));/g,
  (whole, dec, hex, name) => {
    if (name) return Object.prototype.hasOwnProperty.call(HTML_ENTITIES, name) ? HTML_ENTITIES[name] : whole;
    const cp = dec !== undefined ? Number(dec) : parseInt(hex, 16);
    if (!(cp > 0 && cp <= 0x10ffff) || (cp >= 0xd800 && cp <= 0xdfff)) return whole;
    const ch = String.fromCodePoint(cp);
    return /^\s$/.test(ch) ? " " : ch;   /* a referenced space or newline is a space, never a paragraph break */
  });
const BLOCK_TAG = "address|article|aside|blockquote|body|caption|dd|details|div|dl|dt|fieldset|figcaption|figure|footer|form"
  + "|h[1-6]|header|hr|html|li|main|nav|ol|p|pre|section|table|tbody|td|tfoot|th|thead|tr|ul";

/* R32 (T51; K4194; fix round 2, K4303; fix round 3, K4356): a captured page's reading is its evidentiary region, never
   its furniture. An element `nav`, or any element whose `role` is `navigation`, goes with its contents, counted by its
   own name so a nested one of the same name does not end it early; an element with no end tag is not guessed at (its
   tag goes, its words stay). When the page has a `main` element (else an `article` element), only its contents give
   passages (subresources R8's body regions); with neither, an element `header`, `footer` or `aside`, and any element
   whose `role` is `banner`, `contentinfo`, `complementary` or `search`, goes the same way: inside a main or an article
   they are kept. Fix round 3: the rest of the furniture goes wherever it sits, inside the region as well (`moreFurniture`):
   a dialog, a government-site banner or cookie or consent notice, a share bar (each by its role, class or id), a block
   of only controls or only links, and a notice that only says to skip ahead or that the reader is leaving the site. A
   skip link (an `a` whose `href` begins `#` and whose text begins "Skip to") goes. An unresolved template token goes. A
   page with none of this keeps all its text. */
const TAG_ATTRS = "(?:\"[^\"]*\"|'[^']*'|[^'\">])*";
const VOID_TAG = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const attrOf = (attrs, name) => {
  const m = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(attrs);
  return m ? (m[1] ?? m[2] ?? m[3]) : null;
};
const roleOf = (attrs) => (attrOf(attrs, "role") ?? "").trim().split(/\s+/)[0].toLowerCase();
const isNavigation = (name, attrs) => name.toLowerCase() === "nav" || roleOf(attrs) === "navigation";
const FURNITURE_NAME = new Set(["header", "footer", "aside"]);
const FURNITURE_ROLE = new Set(["banner", "contentinfo", "complementary", "search"]);
const isFurniture = (name, attrs) => FURNITURE_NAME.has(name.toLowerCase()) || FURNITURE_ROLE.has(roleOf(attrs));
const openTag = () => new RegExp(`<([A-Za-z][A-Za-z0-9:-]*)(${TAG_ATTRS})>`, "g");
/* The end of the element a start tag opened, counted by its own name: where its contents end and where it does. Null
   when it is never closed. `after` is the index just past the start tag. */
function endOfElement(markup, name, after) {
  const same = new RegExp(`<(/?)${name}(?=[\\s>/])(${TAG_ATTRS})>`, "gi");
  same.lastIndex = after;
  for (let depth = 1, t = same.exec(markup); t; t = same.exec(markup)) {
    if (t[1]) depth--;
    else if (!t[2].endsWith("/")) depth++;
    if (depth === 0) return { inner: t.index, end: same.lastIndex };
  }
  return null;
}
function dropElements(markup, isDropped) {
  const open = openTag();
  let out = "", from = 0;
  for (let m = open.exec(markup); m; m = open.exec(markup)) {
    if (!isDropped(m[1], m[2], markup, open.lastIndex)) continue;
    const name = m[1].toLowerCase(), after = m.index + m[0].length;
    let end = after;   /* a void or self-closing tag, or one never closed, is only itself */
    if (!VOID_TAG.has(name) && !m[2].endsWith("/")) end = endOfElement(markup, name, after)?.end ?? after;
    out += markup.slice(from, m.index) + " ";
    from = open.lastIndex = end;
  }
  return out + markup.slice(from);
}
/* The contents of every outermost closed element `name` in the page, in its order, a block break between them; null
   when the page has none. */
function contentsOf(markup, name) {
  const open = openTag(), parts = [];
  for (let m = open.exec(markup); m; m = open.exec(markup)) {
    if (m[1].toLowerCase() !== name || m[2].endsWith("/")) continue;
    const e = endOfElement(markup, name, open.lastIndex);
    if (!e) continue;
    parts.push(markup.slice(open.lastIndex, e.inner));
    open.lastIndex = e.end;
  }
  return parts.length ? parts.join("<hr>") : null;
}
/* Fix round 3: the furniture that goes wherever it sits. By name and attribute (`html`, `head`, `body`, `main` and
   `article` are never dropped by their class: a page's own class names are no judgement of the page). */
const NEVER_BY_ATTRIBUTE = new Set(["html", "head", "body", "main", "article"]);
const wordsOfToken = (t) => t.toLowerCase().split(/[-_]+/).filter(Boolean);
const classTokens = (attrs) => (attrOf(attrs, "class") ?? "").split(/\s+/).filter(Boolean).concat(attrOf(attrs, "id") ?? []);
const isDialogToken = (t) => /^(?:modal|modal-dialog|dialog)$/i.test(t);
const isBannerToken = (t) => /(?:usa|gov|government|govt|official)[-_]?banner/i.test(t)
  || wordsOfToken(t).some((w) => w === "cookie" || w === "cookies" || w === "consent" || w === "gdpr" || w === "ccpa");
const isShareToken = (t) => wordsOfToken(t).some((w) => w === "share" || w === "shares" || w === "sharing" || w === "sharer")
  || /^(?:addthis|sharethis|a2a)/i.test(t)
  || /^social(?:[-_](?:share|sharing|links|media|icons|buttons|bar|nav|follow|networks|menu))?$/i.test(t);
const DIALOG_ROLE = new Set(["dialog", "alertdialog"]);
const isFurnitureByAttribute = (name, attrs) => {
  const n = name.toLowerCase();
  if (NEVER_BY_ATTRIBUTE.has(n)) return false;
  if (n === "dialog" || DIALOG_ROLE.has(roleOf(attrs)) || (attrOf(attrs, "aria-modal") ?? "").trim().toLowerCase() === "true") return true;
  return classTokens(attrs).some((t) => isDialogToken(t) || isBannerToken(t) || isShareToken(t));
};
/* A block of only controls or only links, or a short notice that only says to skip ahead or that the reader is leaving
   the site, is told by walking the element's own contents from its start tag, stopping at once when it cannot be one. */
const BLOCK_CANDIDATE = new Set(["div", "section", "ul", "ol", "li", "p", "form", "fieldset", "menu", "dl", "dd", "dt",
  "span", "figure"]);
/* A heading, a caption or a quotation is a notice's candidate only: a heading that is a link is the page's own words. */
const NOTICE_CANDIDATE = new Set([...BLOCK_CANDIDATE, "h1", "h2", "h3", "h4", "h5", "h6", "figcaption", "blockquote"]);
const CONTROL_TAG = new Set(["button", "select", "textarea", "option", "optgroup", "label", "datalist", "output"]);
/* A link that wraps a heading or a paragraph is a card, the page's own words under a link, not a menu entry. */
const CARD_PART = new Set(["p", "h1", "h2", "h3", "h4", "h5", "h6", "div", "ul", "ol", "li", "section", "article", "figure", "blockquote", "table"]);
const NOTICE_TEXT_MAX = 400;
const NOTICE_TEXT = [/^skip (?:to|ahead|navigation|the|past)\b/i, /^jump to\b/i, /^exiting\s+[\w.-]+\.[a-z]{2,}\b/i,
  /^you (?:are|'re) (?:now )?(?:leaving|exiting)\b/i, /^you (?:are|'re) about to (?:leave|exit)\b/i, /^leaving (?:this|the|our)\b.*\b(?:site|website)\b/i];
const tagWalk = () => new RegExp(`<(/?)([A-Za-z][A-Za-z0-9:-]*)(?=[\\s>/])(${TAG_ATTRS})>`, "g");
function probeBlock(markup, name, after) {
  const walk = tagWalk(), own = name.toLowerCase();
  walk.lastIndex = after;
  let depth = 1, at = after, inLink = 0, inControl = 0, inCard = 0, loose = false, seen = false, said = "";
  for (let t = walk.exec(markup); t; t = walk.exec(markup)) {
    const seg = decodeReferences(markup.slice(at, t.index).replace(/\s+/g, " "));
    at = walk.lastIndex;
    if (glyphCount(seg) > 0) {
      said += seg;
      if ((!inLink && !inControl) || inCard) loose = true;
      if (loose && said.length > NOTICE_TEXT_MAX) return null;
    }
    const tag = t[2].toLowerCase(), closing = t[1] === "/", selfClosed = t[3].endsWith("/");
    if (tag === own) {
      if (closing) depth--; else if (!selfClosed) depth++;
      if (depth === 0) return { loose, seen, text: said.replace(/\s+/g, " ").trim(), long: said.length > NOTICE_TEXT_MAX };
    }
    if (inLink && CARD_PART.has(tag)) inCard = Math.max(0, inCard + (closing ? -1 : selfClosed ? 0 : 1));
    if (tag === "a") { inLink = Math.max(0, inLink + (closing ? -1 : selfClosed ? 0 : 1)); if (!closing) seen = true; }
    else if (tag === "input") { if (!closing) seen = true; }
    else if (CONTROL_TAG.has(tag)) { inControl = Math.max(0, inControl + (closing ? -1 : selfClosed ? 0 : 1)); if (!closing && tag !== "label") seen = true; }
  }
  return null;   /* never closed: not guessed at */
}
const isFurnitureBlock = (name, attrs, markup, after) => {
  const n = name.toLowerCase();
  if (!NOTICE_CANDIDATE.has(n) || attrs.endsWith("/")) return false;
  const p = probeBlock(markup, name, after);
  if (!p) return false;
  if (!p.loose && p.seen && BLOCK_CANDIDATE.has(n)) return true;
  return !p.long && p.text !== "" && NOTICE_TEXT.some((re) => re.test(p.text));
};
const moreFurniture = (name, attrs, markup, after) => isFurnitureByAttribute(name, attrs) || isFurnitureBlock(name, attrs, markup, after);
/* Fix round 4 (C19; K4429; RC-R11): furniture by name. A block that is no landmark but names itself furniture by a word
   of its `class` or `id` (split at `-`, `_` and camel-case humps) and holds no sentence of body prose goes, when the
   page has a region: a `main` element, else an `article`, else an element whose `role` is `main`. A sentence is a run of
   three or more words ending in a full stop, `!` or `?`, outside a heading, a label, a link and a control. */
const NAME_WORDS = new Set(["footer", "contact", "search", "breadcrumb", "breadcrumbs", "share", "social", "sidebar", "related", "explore", "promo", "promos", "gallery", "carousel"]);
const nameWords = (t) => t.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase().split(/[\s_-]+/).filter(Boolean);
const isNamedFurniture = (attrs) => classTokens(attrs).some((t) => nameWords(t).some((w) => NAME_WORDS.has(w)));
const NON_PROSE = /<(a|h[1-6]|label|button|select|option|textarea|script|style)\b(?:"[^"]*"|'[^']*'|[^'">])*>[\s\S]*?<\/\1\s*>/gi;
const SENTENCE = /(?:[\p{L}\p{N}'’-]+\s+){2,}[\p{L}\p{N}'’-]+[.!?](?=\s|$)/u;
const holdsProse = (inner) => SENTENCE.test(decodeReferences(inner.replace(NON_PROSE, " ").replace(/<\/?[A-Za-z][^\s>/]*(?:"[^"]*"|'[^']*'|[^'">])*>/g, " ")).replace(/\s+/g, " "));
const hasRegion = (markup) => contentsOf(markup, "main") !== null || contentsOf(markup, "article") !== null
  || new RegExp(`<[A-Za-z][A-Za-z0-9:-]*(?:"[^"]*"|'[^']*'|[^'">])*?\\srole\\s*=\\s*["']?main\\b`, "i").test(markup);
const namedFurniture = (markup) => {
  if (!hasRegion(markup)) return () => false;
  return (name, attrs, whole, after) => {
    const n = name.toLowerCase();
    if (NEVER_BY_ATTRIBUTE.has(n) || roleOf(attrs) === "main" || VOID_TAG.has(n) || attrs.endsWith("/") || !isNamedFurniture(attrs)) return false;
    const e = endOfElement(whole, n, after);
    return e !== null && !holdsProse(whole.slice(after, e.inner));
  };
};
const SKIP_LINK = new RegExp(`<a\\b(${TAG_ATTRS})>([\\s\\S]*?)</a\\s*>`, "gi");
const dropSkipLinks = (markup) => markup.replace(SKIP_LINK, (whole, attrs, inner) => {
  const href = attrOf(attrs, "href");
  const said = decodeReferences(inner.replace(/<\/?[A-Za-z][^\s>/]*(?:"[^"]*"|'[^']*'|[^'">])*>/g, "")).replace(/\s+/g, " ").trim();
  return href !== null && href.trim().startsWith("#") && /^skip to/i.test(said) ? " " : whole;
});
const TEMPLATE_TOKEN = /\{[0-9]+\}|\{[A-Za-z_][A-Za-z0-9_]*\}|##LOC\[[^\]]*\]##/g;

/* The page's visible text: comments, `head`, `script`, `style` and `template` contents are dropped (an unclosed one
   drops to the end), then navigation, then the page's main or article contents or else its landmark furniture, then the rest of the furniture wherever it sits, as above, every tag is removed (a block tag ends its paragraph, `br` its line),
   and character references are decoded, so a decoded `&lt;` is text, never a tag. Template tokens go last, so one
   written as references goes too. */
export function visibleTextOfHtml(html) {
  const live = dropElements(html
    .replace(/<!--[\s\S]*?(?:-->|$)/g, " ")
    .replace(/<(script|style|template|head)\b(?:"[^"]*"|'[^']*'|[^'">])*>[\s\S]*?(?:<\/\1\s*>|$)/gi, " ")
    .replace(/<!\[CDATA\[[\s\S]*?(?:\]\]>|$)/g, " ")
    .replace(/<![^>]*>|<\?[^>]*>/g, " "), isNavigation);
  const named = namedFurniture(live);
  const region = dropElements(contentsOf(live, "main") ?? contentsOf(live, "article") ?? dropElements(live, isFurniture),
                              (name, attrs, whole, after) => moreFurniture(name, attrs, whole, after) || named(name, attrs, whole, after));
  const dropped = dropSkipLinks(region)
    .replace(/\s+/g, " ");   /* the source's own line breaks and blank lines are no paragraph break in a page */
  const bare = dropped
    .replace(new RegExp(`</?(?:${BLOCK_TAG})\\b(?:"[^"]*"|'[^']*'|[^'">])*>`, "gi"), "\n\n")
    .replace(/<br\b(?:"[^"]*"|'[^']*'|[^'">])*>/gi, "\n")
    .replace(/<\/?[A-Za-z][^\s>/]*(?:"[^"]*"|'[^']*'|[^'">])*>/g, "");
  return decodeReferences(bare).replace(TEMPLATE_TOKEN, " ");
}

/* R32: the units of text read as text. `html` is true for a capture whose detected format is `html`.
   R33 (T50; N1191 (a)): a text that is not HTML and holds no blank line but at least two non-empty lines is split at
   its line breaks: one unit per non-empty line (the line trimmed), `para` counting the non-empty lines from 0. A text
   with a blank line anywhere keeps its paragraphs (a wrapped paragraph is never split), a one-line text is one unit,
   and an HTML page is read by R32's rule. */
const BLANK_LINE_RUN = /\r?\n[ \t\f\v\u00a0 ]*(?:\r?\n[ \t\f\v\u00a0 ]*)+/;
function paragraphsOfText(text, html) {
  const visible = html ? visibleTextOfHtml(text) : text;
  /* Runs between blank lines; a run of no character (the text's edges, a markup-only block) is no paragraph, so `para`
     counts the paragraphs the text has, from 0, and a page's leading blank does not shift it. */
  const runs = visible.split(BLANK_LINE_RUN);
  const lines = !html && runs.length === 1 ? runs[0].split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length) : [];
  const paragraphs = (lines.length >= 2 ? lines : runs
    .map((p) => (html ? p.replace(/[ \t\f\v\u00a0 \r\n]+/g, " ") : p).trim())
    .filter((p) => p.length))
    .map((p, para) => ({ para, text: p }));
  return { paragraphs };
}
export function textUnitsOfText(text, { html = false, budget } = {}) {
  if (typeof text !== "string" || !text) return { textUnits: null, textUnitsOverBound: 0, textUnitsSkipped: null };
  return textUnitsFor(paragraphsOfText(text, html), { budget });
}
/* R35: the words of a capture read as text, over the text its units are drawn from. */
export function textWordsOfText(text, { html = false, budget } = {}) {
  if (typeof text !== "string" || !text) return null;
  const paras = paragraphsOfText(text, html);
  return textWordsFor(paras, textUnitsFor(paras, { budget }).textUnits);
}

/* ===================================================================== *
 * A reading's title (R34).
 * ===================================================================== */

export const TITLE_MAX_CHARS = 200;

/* R34: a title is the text with markup removed and character references decoded as R32 decodes them (markup first,
   so a decoded `&lt;` is text), whitespace runs collapsed to one space, trimmed, at most TITLE_MAX_CHARS characters
   (code points); one with no glyph is none (null). */
function cleanTitle(s) {
  if (typeof s !== "string") return null;
  const bare = decodeReferences(s.replace(/<\/?[A-Za-z][^\s>/]*(?:"[^"]*"|'[^']*'|[^'">])*>/g, ""))
    .replace(/\s+/g, " ").trim();
  const t = [...bare].slice(0, TITLE_MAX_CHARS).join("").trimEnd();
  return glyphCount(t) > 0 ? t : null;
}

/* The inner markup of the first element named `names` (a regex alternation) in `markup` that has an end tag; a
   self-closing tag and a start tag with no end tag are no element. */
function firstElementInner(markup, names) {
  const open = new RegExp(`<(${names})(?=[\\s>/])((?:"[^"]*"|'[^']*'|[^'">])*)>`, "gi");
  for (let m = open.exec(markup); m; m = open.exec(markup)) {
    if (m[2].endsWith("/")) continue;
    const end = new RegExp(`</${m[1]}\\s*>`, "i").exec(markup.slice(open.lastIndex));
    if (end) return markup.slice(open.lastIndex, open.lastIndex + end.index);
  }
  return null;
}

/* R34: the title of a capture read as HTML: its first `<title>` element, else its first heading (`h1` to `h6`) in
   document order. Nothing inside a comment, `script`, `style` or `template` is a title; `head` is not dropped, since
   it is where the title is. A `<title>` that holds no glyph is none, and the heading is read in its place. */
export function titleOfHtml(html) {
  if (typeof html !== "string" || !html) return null;
  const live = html
    .replace(/<!--[\s\S]*?(?:-->|$)/g, " ")
    .replace(/<(script|style|template)\b(?:"[^"]*"|'[^']*'|[^'">])*>[\s\S]*?(?:<\/\1\s*>|$)/gi, " ")
    .replace(/<!\[CDATA\[[\s\S]*?(?:\]\]>|$)/g, " ");
  for (const names of ["title", "h[1-6]"]) {
    const t = cleanTitle(firstElementInner(live, names));
    if (t !== null) return t;
  }
  return null;
}

/* R34: the title a format entry's metadata states (R28), when it is a non-blank string, else null. */
export function titleOfMetadata(metadata) {
  return metadata && typeof metadata === "object" && !Array.isArray(metadata) ? cleanTitle(metadata.title) : null;
}

/* ===================================================================== *
 * The reading (R1, R11).
 * ===================================================================== */

/* The references a reader emitted, as they appear (extraction R46): kind:key raw, never resolved; the position re-normalised
   by `readingSource` (FW-17 / IC-86), null where it does not normalise, never "the whole document". */
export const readEntities = (list) => (Array.isArray(list) ? list : []).map((e) => ({
  key: e && e.key != null ? String(e.key) : null,
  kind: e && e.kind != null ? e.kind : null,
  label: e && e.label != null ? e.label : null,
  facts: e && e.facts && typeof e.facts === "object" ? e.facts : {},
  ref: `${e && e.kind != null ? e.kind : ""}:${e && e.key != null ? e.key : ""}`,
  source: readingSource(e && e.source),
  ...(Array.isArray(e && e.occurrences) ? { occurrences: e.occurrences } : {}),
})).filter((e) => e.key != null || e.kind != null);

/* D-375 / N139 (R17): how much text the reader was handed, as three facts. `text_chars` is I2's `counts.chars`, the
   producer's claim; `text_glyphs` the glyphs of the text in hand (D-514: what "holds text" means here); and
   `text_undetermined` I2's `counts.undetermined`, the residue a producing tier marked unread, over the decode view
   (R3: an `image_unread` marker is no undecoded character). OBSERVATION-LOG-DESIGN §4.2's fourth outcome, a scan read
   to nothing, is told from a document read whole by these. Null where the text states no such figure; no text, no
   keys (null answered here); never a zero nothing counted. */
export function textCountsOf(text) {
  if (text == null) return null;
  if (typeof text === "string")
    return { text_chars: text.length, text_glyphs: glyphCount(text), text_undetermined: null };
  if (typeof text !== "object") return null;
  const c = decodeView(text).counts;
  const n = (v) => (Number.isInteger(v) && v >= 0 ? v : null);
  return { text_chars: n(c && c.chars),
           text_glyphs: typeof text.document === "string" ? glyphsOfDocument(text) : null,
           text_undetermined: n(c && c.undetermined) };
}

/* D-374 / N100 (R12): each page's box as pdf-reader answered it (its R33, `pageBoxes`), read whole or not at all: one
   box this wire cannot read makes the answer null, because a partial list would bound the pages it kept and silently
   not the rest. A page whose box the reader could not read is null in `of_page`, as it said. */
export function pageBoxesFrom(v) {
  if (!v || typeof v !== "object" || !Array.isArray(v.boxes) || !Array.isArray(v.of_page)) return null;
  const fin = (x) => typeof x === "number" && Number.isFinite(x);
  const boxes = [];
  for (const b of v.boxes) {
    const m = b && Array.isArray(b.media_box) && b.media_box.length === 4 && b.media_box.every(fin) ? b.media_box : null;
    if (!m || !(m[2] > m[0] && m[3] > m[1])) return null;
    boxes.push({ media_box: m.slice(), w: m[2] - m[0], h: m[3] - m[1],
                 rotate: [0, 90, 180, 270].includes(b.rotate) ? b.rotate : null });
  }
  const of_page = [];
  for (const i of v.of_page) {
    if (i !== null && !(Number.isInteger(i) && i >= 0 && i < boxes.length)) return null;
    of_page.push(i);
  }
  return { boxes, of_page };
}

/* R11: the reading a wired text produces. A determined reading carries `text_source` (the chain), `text_tier`,
   `text_container`, and a basis naming the reader, the chain, the tier, the tier-2 and tier-3 notes and where
   references were read; an undetermined one is a failed reading whose basis gives the tier notes and the entry's
   reason. `docType` is read only on the failed branch. */
export function readingFromWire({ wired, docType, chain, wiredTier, fmt, retrieved, tier2note, ocrNote,
                                  tier3Candidate = !!ocrNote }) {
  let reading = null;
  if (wired && wired.determined) {
    const { entities: wiredEntities, ...wrest } = (wired.parsed || {});
    const wfacts = (wrest && typeof wrest.facts === "object" && Object.keys(wrest).length === 1)
      ? wrest.facts : wrest;
    const entities = wired.parse_error ? [] : readEntities(wiredEntities);
    const wtype = wired.doctype.type;
    const positioned = entities.filter((e) => e.source).length;
    const posNote = !entities.length ? null
      : positioned === entities.length
        ? word("reading-pipeline.reference_carries_read", { positioned: String(positioned), entities: String(entities.length) })
        : positioned
          ? word("reading-pipeline.references_carry_read", { positioned: String(positioned), entities: String(entities.length) })
          : word("reading-pipeline.no_reference_carries_where_it", { position_why: String(wired.position_why
              || word("reading-pipeline.reader_say")) });
    reading = {
      content_type: wtype.key, reader_version: wtype.version ?? null,
      read_from_text: true, found: entities.length > 0,
      entities, facts: wired.parse_error ? {} : (wfacts || {}), at: retrieved,
      text_source: chain, text_tier: wiredTier, text_container: fmt,
      basis: (wired.parse_error
        ? word("reading-pipeline.why.reader_parse_text", { key: String(wtype.key), fmt: String(fmt), parse_error: String(wired.parse_error) })
        : (entities.length
            ? word("reading-pipeline.why.read_reader_tier", { key: String(wtype.key), version: String(wtype.version), fmt: String(fmt), chain: String(describeChain(chain)), wired_tier: String(wiredTier), why: String(wired.why) })
            : word("reading-pipeline.why.reader_found_entities", { key: String(wtype.key), fmt: String(fmt), wired_tier: String(wiredTier) })))
        + (tier2note ? ` — ${tier2note}` : "")
        + (ocrNote ? ` — ${ocrNote}` : "")
        + (posNote ? ` — ${posNote}` : ""),
      ...(tier3Candidate ? { tier3_candidate: true } : {}),
      position_parts: wired.position_parts ?? 0,
      position_why: positioned ? null : (wired.position_why || null),
    };
  } else if (wired) {
    reading = {
      content_type: docType.type.key, reader_version: docType.type.version ?? null,
      read_from_text: false, found: false, entities: [], facts: {}, at: retrieved,
      text_source: chain, text_tier: wiredTier, text_container: fmt,
      basis: [tier2note, ocrNote ? `${ocrNote} (${wired.why})` : wired.why].filter(Boolean).join(" — "),
      ...(tier3Candidate ? { tier3_candidate: true } : {}),
    };
  }
  return reading;
}

/* ===================================================================== *
 * The container extent (R12).
 * ===================================================================== */

/* CAP-12 / COFF-12 / COFF-13 / FW-19 (R12): the container's own extent, READ off the I2 shape the entry returned,
   recognised by the keys it emitted (sheets, paragraphs, slides by list; tables, images by key), never re-derived.
   An integer or null, never a coercion; a list over the bound (empty) is NULL, never zero; `tables`/`images` empty
   is a measured zero and null is a walk that did not finish; the slide map is keyed on the unit's own `slide` and
   is as long as the deck's `deckLength`. For a PDF (D-420): the images its pages paint as `{page, rect}`, exhaustive
   or null with `images_why`. Null when the entry itemised nothing. */
export function containerExtentOf(i2text, { pdfPaints = null, fmt = null } = {}) {
  let containerExtent = null;
  if (i2text) {
    const has = (k) => Array.isArray(i2text[k]);
    const held = (k) => (has(k) && i2text[k].length ? i2text[k] : null);
    if (has("sheets") || has("paragraphs") || has("slides")) {
      const sh = held("sheets"), pa = held("paragraphs"), sl = held("slides");
      const deckLen = Number.isInteger(i2text.deckLength) && i2text.deckLength > 0 ? i2text.deckLength : null;
      const int = (v) => (Number.isInteger(v) ? v : null);
      const slideExtents = (units) => {
        let n = Math.max(units.length, deckLen ?? 0);
        for (const u of units) if (u && Number.isInteger(u.slide) && u.slide > n) n = u.slide;
        const out = Array.from({ length: n }, () => ({ shapes: null }));
        for (const u of units) {
          if (!(u && Number.isInteger(u.slide) && u.slide >= 1)) continue;
          out[u.slide - 1] = { shapes: int(u.shapes) };
        }
        return out;
      };
      const own = (k) => Object.prototype.hasOwnProperty.call(i2text, k);
      const tablesOf = (list) => (Array.isArray(list)
        ? list.map((t) => ({ rows: int(t && t.rows), cols: int(t && t.cols) })) : null);
      const imagesOf = (list) => (Array.isArray(list)
          && list.every((x) => x && typeof x.part === "string" && /^[0-9a-f]{64}$/.test(x.part))
        ? list.map((x) => ({ part: x.part, mime: typeof x.mime === "string" ? x.mime : null }))
        : null);
      containerExtent = {
        container: typeof i2text.container === "string" ? i2text.container : null,
        levels: [...["sheets", "paragraphs", "slides"].filter(has), ...["tables", "images"].filter(own)],
        sheets: sh ? sh.map((s) => ({
          name: s && typeof s.name === "string" ? s.name : null,
          rows: int(s && s.rows), cols: int(s && s.cols),
          usedRows: int(s && s.usedRows), usedCols: int(s && s.usedCols) })) : null,
        paragraphs: pa ? pa.length : null,
        slides: sl || deckLen ? slideExtents(sl || []) : null,
        ...(has("slides") && own("deckLength") ? { deckLength: deckLen } : {}),
        ...(own("tables") ? { tables: tablesOf(i2text.tables) } : {}),
        ...(own("images") ? { images: imagesOf(i2text.images) } : {}),
      };
    }
  }
  if (!containerExtent && pdfPaints && fmt === "pdf") {
    const placements = Array.isArray(pdfPaints.images)
        && pdfPaints.images.every((x) => x && Number.isInteger(x.page) && x.page >= 0
          && Array.isArray(x.rect) && x.rect.length === 4
          && x.rect.every((n) => typeof n === "number" && Number.isFinite(n)))
      ? pdfPaints.images.map((x) => ({ page: x.page, rect: x.rect.slice() }))
      : null;
    containerExtent = {
      container: "pdf", levels: ["images"], images: placements,
      ...(placements ? {} : { images_why: pdfPaints.why
        || localize("reading-pipeline.index.placement_not_read", "a placement the structure op reported could not be read as {shape}", { shape: "{page, rect}" }) }),
    };
  }
  return containerExtent;
}

/* ===================================================================== *
 * What the entry emitted beside the text (R28).
 * ===================================================================== */

/* R28 (T33-24; C:A-5; K1556): the entry's document `metadata` as it emitted it (office-readers R31), or null; and, for
   a workbook (a text with a `sheets` list), `cells`: each named sheet's cells as the entry emitted them
   (office-readers R30, odf-reader R46), or null where it emitted none (over its size guard). Neither is altered; a
   sheet with no name is no key, since a key would be one this module made up. N724 (K1972, K2092): for a `.docx`
   text (container `docx`), `cells` keyed by each table's `ref` (`table <n+1>`, office-readers R16), its cells as the
   entry emitted them (office-readers R11's `tables[].cells`), nested tables under their own keys as the entry lists
   them; `{}` for a body with no tables, and null when `tables` is null (the body not read, or over its size guard),
   three facts kept apart (R21). A table with no `ref` is no key, as a sheet with no name. No text, or no entry:
   metadata null and no `cells`; any other document: no `cells`. */
export function emittedFieldsOf(i2text) {
  const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
  const out = { metadata: isObj(i2text) && isObj(i2text.metadata) ? i2text.metadata : null };
  if (isObj(i2text) && Array.isArray(i2text.sheets)) {
    const cells = {};
    for (const sh of i2text.sheets)
      if (isObj(sh) && typeof sh.name === "string") cells[sh.name] = Array.isArray(sh.cells) ? sh.cells : null;
    out.cells = cells;
  } else if (isObj(i2text) && i2text.container === "docx") {
    if (!Array.isArray(i2text.tables)) out.cells = null;
    else {
      const cells = {};
      for (const t of i2text.tables)
        if (isObj(t) && typeof t.ref === "string" && t.ref) cells[t.ref] = Array.isArray(t.cells) ? t.cells : null;
      out.cells = cells;
    }
  }
  return out;
}

/* ===================================================================== *
 * read (R1–R17, R24).
 * ===================================================================== */

/* The document's own address, for the recognisers (R11): a Drive export's document address from Google's hop, an
   archive replay's from the archive's hop, else the locator. */
function documentAddressOf(doc) {
  const chain = Array.isArray(doc && doc.provenance_chain) ? doc.provenance_chain : [];
  const drive = chain.find((h) => h && h.drive_file_id && typeof h.document_address === "string");
  if (drive) return drive.document_address;
  const arch = chain.find((h) => h && h.via === "archive.org" && typeof h.document_address === "string");
  return arch ? arch.document_address : (doc && typeof doc.locator === "string" ? doc.locator : null);
}

/* R10: Google's export hop, when the document's chain carries one; its format is what the conversion produced. */
function driveHopOf(doc) {
  const chain = Array.isArray(doc && doc.provenance_chain) ? doc.provenance_chain : [];
  const h = chain.find((x) => x && x.drive_file_id && typeof x.export_format === "string");
  return h ? { format: h.export_format } : null;
}

/* N615 (K1773): the origin of the bytes of every capture `read` is handed (see `readInner`). */
const CAPTURE_ORIGIN = "fetch";

const failed = (doc, docType, basis, extra = {}) => ({
  content_type: docType ? docType.type.key : null, reader_version: docType ? (docType.type.version ?? null) : null,
  read_from_text: false, found: false, entities: [], facts: {}, at: doc && typeof doc.retrieved === "string" ? doc.retrieved : null,
  basis, ...extra });

/** R24 (R1–R17): reads a stored capture. `document` is capture's acquire answer's document. The rest is what the
 *  caller (`extraction`, its R1 and R18) hands in: `evidence` (record-core's `evidenceStore()`, or null), `env` (the
 *  fleet bindings PDF_WORKER and OCR_WORKER), `storeName` (the namespace the members read the capture under), `view` (`jurisdictions.combine`'s
 *  view of the instance's profiles, or undefined when the instance holds none, extraction R18), `planeVersion`, and
 *  `liveCalibration` (R5); and, only at a member's act, `transcription` (R29, `tier4Extend`): without it the answer is
 *  exactly what it was before R29. R37: `unitsBudget` is the bytes the text units may spend (default the acquire answer's,
 *  R15; the index path hands `Infinity`), `ocrInvocations` the OCR calls this request may make (default 24), and `owe` the
 *  hook the caller composed, `owe({kind: "ocr", sha, cursor, pages_left})`, called once when OCR left pages unread, which
 *  never throws out of `read` and is how the pages left become owed work. Never throws; every failure is a failed reading,
 *  and says whether it is `transient` or `final`. */
export async function read(document, { evidence = null, env = {}, storeName = "bio", view, planeVersion = null,
                                        liveCalibration = null, transcription = null, unitsBudget, ocrInvocations,
                                        owe = null } = {}) {
  try { return await readInner(document, { evidence, env, storeName, view, planeVersion, liveCalibration, transcription,
                                           unitsBudget, ocrInvocations, owe }); }
  catch (e) {
    const reading = failed(document, null, localize("reading-pipeline.index.reading_not_composed", "the reading could not be composed ({detail}), so nothing is claimed about this document's text; it is a failed reading, never an emptied document", { detail: String(String(e && e.message || e).slice(0, 200)) }), { failure: FAILURE_TRANSIENT });
    reading.metadata = null;   /* R28: no entry's answer reached the reading */
    reading.provenance = await readingProvenance({ text: null, planeVersion });
    return { reading };
  }
}

/* R37 (F10): the size of a held object, from the store's `head` when it answers one, else null. */
async function sizeHeld(evidence, digest) {
  try {
    const h = typeof evidence.head === "function" ? await evidence.head(digest) : null;
    return h && Number.isFinite(h.size) ? h.size : null;
  } catch { return null; }
}
/* `{bytes, why?, failure?}`. A failure is `transient` (R37: the object, or a part, is not held yet, or the parts cannot
   be assembled within MULTIPART_READ_MAX while no whole is held: it can be) or `final` (the capture is over WHOLE_READ_MAX
   and is never loaded: nothing later changes that). It throws only when the store does, which the caller marks transient. */
export async function bytesOf(evidence, doc) {
  const whole = async (digest) => {
    const o = await evidence.get(digest);
    return o ? new Uint8Array(await o.arrayBuffer()) : null;
  };
  const parts = Array.isArray(doc.parts) ? doc.parts : null;
  const wholeSha = typeof (doc.capture && doc.capture.sha256) === "string" ? doc.capture.sha256 : null;
  const total = parts ? parts.reduce((n, p) => n + (Number.isFinite(p && p.bytes) ? p.bytes : 0), 0)
                      : (Number.isFinite(doc.capture && doc.capture.bytes) ? doc.capture.bytes : null);
  /* R37: a whole the object cannot hold is never loaded, whatever else is held; the size is the capture's own, else the
     store's. */
  const tooBig = (size) => ({ bytes: null, failure: FAILURE_FINAL,
    why: word("reading-pipeline.why.capture_bytes_parts", { total: String(size), parts: String(parts ? parts.length : 1),
                                                              multipart_read_max: String(WHOLE_READ_MAX) }) });
  if (total !== null && total > WHOLE_READ_MAX) return tooBig(total);
  /* the store is asked only when the document states no size */
  const held = wholeSha && total === null ? await sizeHeld(evidence, wholeSha) : null;
  if (held !== null && held > WHOLE_READ_MAX) return tooBig(held);
  if (!parts) return { bytes: await whole(doc.capture.sha256) };
  /* R2 (T51 fix round 2, C5): the whole object held under the document's fingerprint is read first; parts are
     assembled, and bounded, only when none is held. */
  const got = wholeSha ? await whole(wholeSha).catch(() => null) : null;
  if (got) return { bytes: got };
  if (total > MULTIPART_READ_MAX)
    return { bytes: null, failure: FAILURE_TRANSIENT,
             why: word("reading-pipeline.why.capture_bytes_parts", { total: String(total), parts: String(parts.length), multipart_read_max: String(MULTIPART_READ_MAX) }) };
  const out = new Uint8Array(total);
  let at = 0;
  for (const p of parts) {
    const b = p && typeof p.sha256 === "string" ? await whole(p.sha256) : null;
    if (!b) return { bytes: null, failure: FAILURE_TRANSIENT, why: word("reading-pipeline.why.part_held_evidence", { index_of: String(parts.indexOf(p) + 1), parts: String(parts.length) }) };
    out.set(b.subarray(0, Math.max(0, total - at)), at); at += b.length;
  }
  return at === total ? { bytes: out }
                      : { bytes: null, failure: FAILURE_TRANSIENT, why: word("reading-pipeline.why.parts_held_add") };
}

async function readInner(doc, { evidence, env, storeName, view, planeVersion, liveCalibration, transcription,
                              unitsBudget, ocrInvocations, owe }) {
  const retrieved = doc && typeof doc.retrieved === "string" ? doc.retrieved : null;
  const sha = doc && doc.capture && typeof doc.capture.sha256 === "string" ? doc.capture.sha256 : null;
  const ct = doc && doc.capture && typeof doc.capture.content_type === "string" ? doc.capture.content_type : "";
  const profile = doc && doc.profile && typeof doc.profile === "object" ? doc.profile : {};
  const headerPairs = ((doc && doc.capture && doc.capture.transport) || (doc && doc.shell && doc.shell.transport) || {}).http_headers || [];
  const headers = {};
  for (const [hk, hv] of (Array.isArray(headerPairs) ? headerPairs : [])) headers[String(hk).toLowerCase()] = hv;
  const locator = documentAddressOf(doc);
  const multipart = Array.isArray(doc && doc.parts);
  const fmt = profile.format && typeof profile.format.format === "string" ? profile.format.format : null;
  const vw = view ? { view } : {};

  /* R24: no store bound, no digest or no object is a failed reading saying so. No field the caller sends supplies
     text. */
  /* R14: every branch's reading gets its provenance at the one site below, a failure's included. */
  const early = async (reading) => {
    reading.metadata = null;   /* R28: no entry answered */
    reading.provenance = await readingProvenance({ text: null, chain: null, tier: null, container: null, planeVersion, member: null });
    return { reading };
  };
  if (!sha) return early(failed(doc, null, localize("reading-pipeline.index.no_capture_digest", "the document names no capture digest, so there are no bytes to read"), { failure: FAILURE_FINAL }));
  /* DEC-149 (T35-24): member-facing, so it names the group's Civicsmith, never "this instance". */
  if (!evidence) return early(failed(doc, null, word("reading-pipeline.no_evidence_store"), { failure: FAILURE_TRANSIENT }));
  const got = await bytesOf(evidence, doc).catch(() => ({ bytes: null, failure: FAILURE_TRANSIENT, why: word("acquisition.why.evidence_store_read") }));
  let bytes = got.bytes;
  got.bytes = null;
  const textRead = !multipart && profile.profiled_from_text === true && bytes;
  const text = textRead ? new TextDecoder("utf-8", { fatal: false }).decode(bytes) : "";
  /* N615 (K1683, K1773): every recogniser is handed the capture's origin, `"member"` only for bytes a member supplied by
     their own act outside the copy. The document records none: every capture it can be is a fetch the copy made, a
     member session's request included (acquisition, K1775), or a knock, which carries no member session (capture R30,
     K1776). So it is `"fetch"`, never read off `capture.actor_class` or the request's `origin`, and a content type read
     only from a member's own capture (court-doctypes R2) never matches here, as it never matches at intake. */
  const profCtx = { headers, locator, content_type: ct || null, text, origin: CAPTURE_ORIGIN };
  const stackId = identify(profCtx);
  const docType = doctypeFor({ ...profCtx, handler: stackId.handler, kind: stackId.kind, ...vw });
  if (!bytes)
    return early(failed(doc, docType, got.why || localize("reading-pipeline.index.bytes_not_held", "the capture's bytes are not held in the evidence store, so nothing was read"),
                        { failure: got.failure || FAILURE_TRANSIENT }));

  const entry = fmt && fmt !== "undetermined" ? getFormat(fmt) : null;
  const wireable = !!(entry && (typeof entry.text === "function" || typeof entry.structure === "function"));
  let reading, classifiedText = null, member = null;
  let textUnits = null, textUnitsOverBound = 0, textUnitsSkipped = null, readDialect, emitted = null, heldCounts = null, joinedDropped = false;

  if (!wireable && textRead) {
    /* R1: text read as text with no format entry that reads it goes to the content type's reader. */
    classifiedText = text; member = "plane";
    /* R32: its text units, drawn from the decoded text (the page's visible text for HTML); a capture whose text holds
       no glyph has none. The reader's outcome below does not change them. */
    ({ textUnits, textUnitsOverBound, textUnitsSkipped } = textUnitsOfText(text, { html: fmt === "html", budget: unitsBudget }));
    /* R34: the title, read from the markup R32's units drop; null for any text that is not HTML. A reader that throws
       gives a failed reading, which carries none. */
    const title = fmt === "html" ? titleOfHtml(text) : null;
    if (typeof docType.type.parse === "function") {
      try {
        const parsed = docType.type.parse({ ...profCtx, handler: stackId.handler, at: retrieved, ...vw }) || {};
        const { entities: parsedEntities, ...rest } = parsed;
        const facts = (rest && typeof rest.facts === "object" && Object.keys(rest).length === 1) ? rest.facts : rest;
        const entities = readEntities(parsedEntities);
        reading = {
          content_type: docType.type.key, reader_version: docType.type.version ?? null,
          read_from_text: true, found: entities.length > 0,
          entities, facts: facts || {}, at: retrieved,
          title,
          basis: entities.length
            ? word("reading-pipeline.why.read_reader", { key: String(docType.type.key), version: String(docType.type.version), entities: String(entities.some((e) => e.source) ? "" : localize("reading-pipeline.index.read_one_undivided_string", " — no reference carries where it was read: this document was read as one undivided string, which names no part of a container to point at")) })
            : word("reading-pipeline.why.reader_found_entities_document", { key: String(docType.type.key) }),
          position_parts: 0,
          position_why: entities.some((e) => e.source) ? null
            : word("reading-pipeline.text_read_back"),
        };
      } catch (e) {
        reading = {
          content_type: docType.type.key, reader_version: docType.type.version ?? null,
          read_from_text: true, found: false, entities: [], facts: {}, at: retrieved,
          basis: word("reading-pipeline.why.reader_parse_document", { key: String(docType.type.key), entry: String(String(e && e.message || e)) }),
          failure: FAILURE_FINAL,   /* R37: the content type's reader threw over this text; it throws again */
        };
      }
    } else {
      reading = {
        content_type: docType.type.key, reader_version: docType.type.version ?? null,
        read_from_text: false, found: false, entities: [], facts: {}, at: retrieved,
        title,
        basis: word("reading-pipeline.why.content_type_declares", { key: String(docType.type.key) }),
      };
    }
    /* R13: an entry with a decoding choice but no text answers its dialect over the same bytes. */
    try {
      if (entry && typeof entry.dialect === "function") readDialect = readingDialect(await entry.dialect(bytes));
    } catch { readDialect = undefined; }
    /* R33: a reading given text units carries the chain they were formed by, the plane's layer at tier null (R14 stays
       true), so `extraction` stores it and `content`'s extent gate finds one. A reading with no unit list has none. */
    if (textUnits) {
      const container = fmt && fmt !== "undetermined" ? fmt : "text";
      reading.text_source = layerChainFor(null, { tier: null, container });
      reading.text_container = container;
      /* R35: the words of the text the units were drawn from, and the words the units hold. */
      Object.assign(reading, textWordsOfText(text, { html: fmt === "html", budget: unitsBudget }));
    }
  } else if (wireable) {
    /* R2 (D-593, D-684): through the entry over the stored bytes, tier 1, including delimited text read as text at
       intake and a multi-part capture within the bound: a CSV's text is the entry's own decode. */
    let i2text = null, wiredTier = null, pageCount = null, pageBoxes = null, pdfPaints = null, wired = null;
    let chain = null, ocrNote = null, tier2note = null, tier2PerPage = null, t3Wanting = false, aiRead = null, structMeta = null;
    let memberDown = false, ocrLeft = null;
    try {
      if (typeof entry.text === "function") {
        const parts = typeof entry.parts === "function" ? await entry.parts(bytes) : bytes;
        const tt = await entry.text(parts);
        bytes = null;
        if (tt && tt.ok !== false) { i2text = tt; wiredTier = 1; }
      } else {
        const st = await entry.structure(bytes);
        bytes = null;   /* the parse is done: the capture's bytes are held no longer (R2, the reading's memory) */
        if (st && st.ok) {
          i2text = st.text || null; wiredTier = 1;
          /* R34: a structure reader states the document's own metadata beside its text (pdf-reader R39: the /Info Title). */
          structMeta = st.metadata || null;
          if (Number.isInteger(st.pages) && st.pages > 0) pageCount = st.pages;
          /* N100 (R12): each page's box, off the structure object (tier 2 and 3 replace `text`, not it). */
          pageBoxes = pageBoxesFrom(st.pageBoxes);
          pdfPaints = { images: Array.isArray(st.images) ? st.images : null,
                        why: typeof st.imagesWhy === "string" ? st.imagesWhy : null };
          /* R3: tier 2, merged page by page; two page-scoped parts when both tiers hold pages. */
          const t2 = await tier2Escalate(env, { sha, storeName, text: i2text });
          if (t2.transient) memberDown = true;
          if (t2.outcome === "refused") tier2note = t2.note;
          else if (t2.outcome !== "merged") tier2note = tier2FailureNote(t2.outcome);
          else {
            i2text = t2.text; tier2PerPage = t2.perPage; tier2note = t2.note;
            if (t2.replaced.length) wiredTier = 2;
            if (t2.replaced.length && t2.kept.length) {
              const merged = mergedChain([
                { pages: t2.kept,     chain: layerChainFor(i2text, { tier: 1, container: fmt }) },
                { pages: t2.replaced, chain: layerChainFor(i2text, { tier: 2, container: fmt }) },
              ]);
              if (Array.isArray(merged)) chain = merged;
            }
          }
        }
      }
      /* R4–R6: tier 3. */
      const t3 = await tier3Extend(env, { sha, storeName, i2text, wiredTier, tier2PerPage, fmt, liveCalibration,
                                          ...(Number.isInteger(ocrInvocations) && ocrInvocations > 0 ? { invocations: ocrInvocations } : {}) });
      i2text = t3.i2text; wiredTier = t3.wiredTier;
      if (t3.transient) memberDown = true;
      ocrLeft = t3.left || null;
      if (t3.chainSet) chain = t3.chain;
      if (t3.ocrNote != null) ocrNote = t3.ocrNote;
      t3Wanting = t3.stillWanting;
      /* R29: tier 4, at a member's act only, over what tiers 1-3 settled and before a Drive export's conversion. */
      if (transcription && i2text) {
        const t4 = await tier4Extend(transcription, { sha, storeName, i2text, wiredTier,
          chain: chain || layerChainFor(i2text, { tier: wiredTier, container: fmt }) });
        if (t4.filled.length) {
          i2text = t4.i2text; chain = t4.chain; wiredTier = t4.wiredTier;
          aiRead = { pages: t4.filled, engine: t4.engine.engine, version: t4.engine.version, label: AI_READING_LABEL };
        }
        if (t4.aiNote) ocrNote = ocrNote ? `${ocrNote}; ${t4.aiNote}` : t4.aiNote;
      }
      if (i2text && Object.prototype.hasOwnProperty.call(i2text, "dialect")) {
        try { readDialect = readingDialect(i2text.dialect); } catch { readDialect = undefined; }
      }
      /* R17 over the text in hand, then the joined copy let go: the stages below read the pages. */
      heldCounts = textCountsOf(i2text);
      { const lean = withoutJoinedDocument(i2text); if (lean !== i2text) joinedDropped = true; i2text = lean; }
      emitted = i2text;
      const extent = containerExtentOf(i2text, { pdfPaints, fmt });
      ({ textUnits, textUnitsOverBound, textUnitsSkipped } = textUnitsFor(i2text, { budget: unitsBudget }));
      if (i2text) {
        wired = readText(decodeView(i2text), { headers, locator, content_type: ct || null, at: retrieved, origin: CAPTURE_ORIGIN,
                                               ...vw });
        classifiedText = i2text;
      }
      if (i2text && !chain) chain = layerChainFor(i2text, { tier: wiredTier, container: fmt });
      /* R10: a Drive export's conversion at the head, after every other part is settled; a refused prepend records
         no chain and fails the reading, naming the refusal. */
      const drive = driveHopOf(doc);
      if (drive && Array.isArray(chain)) {
        const converted = convertedChain(driveConvertStep(drive), chain);
        if (Array.isArray(converted)) chain = converted;
        else {
          chain = null;
          wired = { determined: false,
                    why: word("reading-pipeline.why.text_chain_google", { check: String(converted.check), code: String(converted.code), detail: String(converted.detail) }) };
        }
      }
      reading = wired
        ? readingFromWire({ wired, docType, chain, wiredTier, fmt, retrieved, tier2note, ocrNote, tier3Candidate: t3Wanting })
        : { ...failed(doc, docType, [tier2note, ocrNote, localize("reading-pipeline.index.entry_no_text", "the {fmt} entry produced no text from these bytes", { fmt: String(fmt) })]
              .filter(Boolean).join(" — "), { failure: memberDown ? FAILURE_TRANSIENT : FAILURE_FINAL }) };
      /* R35: a reading with text units counts its words. */
      if (textUnits) Object.assign(reading, textWordsFor(i2text, textUnits));
      /* R37 (D4): a reading that read nothing says whether it can be read again: a member that was down is a cause outside
         the document, anything else is the document's own. */
      if (!wired || !wired.determined) reading.failure = memberDown ? FAILURE_TRANSIENT : FAILURE_FINAL;
      /* R37 (F9): the OCR pages this request did not reach, the first of them (the cursor) and how many, stated on the
         reading and owed to the caller's ledger. */
      if (ocrLeft) {
        reading.ocr_left = { cursor: ocrLeft.cursor, pages: ocrLeft.pages.length };
        if (typeof owe === "function") {
          try { await owe({ kind: "ocr", sha, cursor: ocrLeft.cursor, pages_left: ocrLeft.pages.length }); } catch { /* the hook is the caller's */ }
        }
      }
      /* R34: a determined reading carries the title its entry's metadata states, else null; a failed one carries none. */
      if (wired && wired.determined) reading.title = titleOfMetadata(i2text && i2text.metadata) ?? titleOfMetadata(structMeta);
      /* R29: the pages the AI read, labeled as its reading. */
      if (aiRead) reading.ai_transcription = aiRead;
      /* R12: never zero. */
      reading.page_count = Number.isInteger(pageCount) && pageCount > 0 ? pageCount : null;
      /* N100 (R12): the boxes under the count's rule: present where it is, null where no box was read. */
      reading.page_boxes = pageBoxes;
      reading.container_extent = extent;
    } catch (e) {
      reading = failed(doc, docType, localize("reading-pipeline.index.entry_not_read_bytes", "the {fmt} entry could not read these bytes ({detail}), so nothing is claimed about its text", { fmt: String(fmt), detail: String(String(e && e.message || e).slice(0, 200)) }), { failure: FAILURE_TRANSIENT, page_count: null, page_boxes: null, container_extent: null });
      textUnits = null; textUnitsOverBound = 0; textUnitsSkipped = null; classifiedText = null; emitted = null; heldCounts = null; joinedDropped = false;
    }
  } else {
    reading = failed(doc, docType, localize("reading-pipeline.index.document_not_read_text", "the document was not read as text ({why}), so no reading was attempted", { why: multipart ? localize("reading-pipeline.index.multipart", "multipart") : localize("reading-pipeline.index.non_textual_large", "non-textual or too large") }),
                     { failure: FAILURE_FINAL, page_count: null, page_boxes: null, container_extent: null });
  }

  /* R14: the reading's provenance, at one site for every branch, over exactly the text the reader was handed; text
     read as text at intake names the plane with tier null. */
  reading.provenance = await readingProvenance({
    text: classifiedText, chain: Array.isArray(reading.text_source) ? reading.text_source : null,
    tier: Number.isInteger(reading.text_tier) ? reading.text_tier : null,
    container: typeof reading.text_container === "string" ? reading.text_container : null,
    planeVersion, member, ...(joinedDropped ? { textFrom: "document" } : {}) });
  /* N139 (R17): the counts of exactly the text the reader was handed; none when no text was. */
  { const n = heldCounts || textCountsOf(classifiedText); if (n) Object.assign(reading, n); }
  /* R28: the entry's metadata, or null, and a workbook's or a `.docx` document's cells, as emitted. */
  Object.assign(reading, emittedFieldsOf(emitted));
  /* R13: absent when no entry answered a decoding choice. */
  if (readDialect !== undefined) reading.dialect = readDialect;
  return { reading,
           ...(textUnits ? { text_units: textUnits } : {}),
           ...(textUnitsOverBound ? { text_units_over_bound: textUnitsOverBound } : {}),
           ...(textUnitsSkipped ? { text_units_skipped: textUnitsSkipped } : {}) };
}
