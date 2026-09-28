/* extraction's pipeline (R1–R18, R31–R35's reading half): the tier ladder, the chain composed as it goes, the
   content type's reader over the text, and the reading with its provenance, its container, its dialect and its
   text units. Moved from `index.mjs` (the acquire wire's reading block, `op=pdfstructure`'s re-read and the helpers
   between them), with their reasons kept where the reason is the code's; the rows applied here are named at their
   sites. It fetches nothing about the source: the bytes come from the evidence store the caller hands in (R1), and
   tiers 2 and 3 are reached only through their bindings with the capture's digest (R17). */
import { layerChain, appendStep, describeChain, checkChain, checkAnchor, applyConfidenceFloor, mergedChain,
         convertedChain, readingSource, mergeTier2Text, tier2Note, glyphCount, stepCovers } from "../textchain.mjs";
import { getFormat, readingDialect } from "../formats.mjs";
import { identify, doctypeFor, readText } from "../../../docprofile/registry.mjs";
import { driveConvertStep } from "../drive.mjs";
import { readingProvenance, describePages } from "../readingprov.mjs";

/* ===================================================================== *
 * The bounds (R16).
 * ===================================================================== */

/* REC-91: how much of a capture's text the reading's wire answer may carry. Half of `op=promote`'s INLINE_MAX
   (1 MiB), so JSON escaping and the rest of the acquire document cannot push a promotion over it. */
export const ACQUIRE_TEXT_UNITS_BUDGET = 512 * 1024;
/* What one unit costs the wire BESIDE its text: its extent, its seq and its keys as a caller serialising with
   `JSON.stringify(doc, null, 1)` spends them. Charged per unit, so twenty thousand short paragraphs cannot pass the
   byte budget on their words and blow INLINE_MAX on their punctuation. The smallest chargeable unit is 1 + 128 B, so
   this wire emits at most floor(524288 / 129) = 4,064 units: under the index's own unit bound (R22's 4,096), which
   is why no second unit check sits in the loop (REC-111). */
export const ACQUIRE_TEXT_UNIT_ENVELOPE = 128;
/* CONTENT-SEARCH-DESIGN §4.3: one indexed unit's text is stored to this many characters (M-20: 6.2x the largest
   unit its census produced). The wire cuts a unit to it before charging it (D-685), and the index writer caps at the
   same number (R22): one number, so the wire never pays for text the index discards. */
export const CAPTURE_TEXT_UNIT_CAP = 128 * 1024;
/* R3: a multi-part capture (streamed in 8 MiB parts, the whole never stored under its own digest) is assembled for
   its format entry only up to this many bytes: the office entries' measured text bound (M-20's 20 MiB, `ooxml.mjs`),
   which every entry in the registry guards at or under. Over it the capture is not read, and the reading says so. */
export const MULTIPART_READ_MAX = 20 * 1024 * 1024;

/* ===================================================================== *
 * Tier 2 (R4).
 * ===================================================================== */

/* D-665 (BOB #35, 2026-09-25 06:25Z): `image_unread` says an image is painted and its content unread; it is not an
   undecoded character and counts 0. Two readers judge the DECODE by the marker count (`needsTier2` and docprofile's
   `readText`), so both are handed the text with those markers taken out and the count lowered by as many. The
   markers stay on the text itself. */
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

/* R4: a PDF escalates to the pdf-worker only when tier 1 got essentially nothing: more undetermined regions than
   glyphs of the text in hand (D-514: glyphs, never raw characters; `counts.chars` only when there is no document
   string), unless every marker is a scan marker, since tier 2 reads no image (CPDF-10; D-627's image-content
   markers are scan markers too). A mixed document still escalates. A missing or malformed text escalates nothing. */
export function needsTier2(text0) {
  const text = decodeView(text0);
  const c = text && text.counts;
  if (!c || typeof c.chars !== "number" || typeof c.undetermined !== "number") return false;
  const glyphs = typeof text.document === "string" ? glyphCount(text.document) : c.chars;
  if (!(c.undetermined > glyphs)) return false;
  const marks = Array.isArray(text.undetermined) ? text.undetermined : [];
  if (marks.length && marks.every((m) => m && (m.reason === "no_text_layer"
      || m.reason === "image_content_unread" || m.reason === "image_content_undetermined"))) return false;
  return true;
}

/* D-697 (R9): a page tier 2 wins keeps a still-true `image_unread`. `mergeTier2Text` (text-chain) carries tier 1's
   `image_content_*` markers onto a page tier 2 won and not `image_unread`, which is as true after tier 2 as before
   (tier 2 reads no image). So each such marker tier 1 stated for a replaced page is carried after tier 2's own,
   unless tier 2 already states it, and the document's marker list and count are recomputed from the pages. */
export function carryImageUnread(tier1, merged) {
  if (!merged || !merged.ok || !Array.isArray(merged.replaced) || !merged.replaced.length) return merged;
  const t1 = new Map((tier1 && Array.isArray(tier1.pages) ? tier1.pages : [])
    .filter((p) => p && Number.isInteger(p.page)).map((p) => [p.page, p]));
  const text = merged.text;
  if (!text || !Array.isArray(text.pages)) return merged;
  let added = 0;
  const same = (a, b) => a && b && a.reason === b.reason && JSON.stringify(a.rect ?? null) === JSON.stringify(b.rect ?? null);
  const pages = text.pages.map((p) => {
    if (!p || !merged.replaced.includes(p.page)) return p;
    const own = Array.isArray(p.undetermined) ? p.undetermined : [];
    const had = t1.get(p.page);
    const carry = (had && Array.isArray(had.undetermined) ? had.undetermined : [])
      .filter((u) => u && u.reason === "image_unread" && !own.some((o) => same(o, u)));
    if (!carry.length) return p;
    added += carry.length;
    return { ...p, undetermined: [...own, ...carry] };
  });
  if (!added) return merged;
  const pageless = (Array.isArray(text.undetermined) ? text.undetermined : []).filter((m) => m && !Number.isInteger(m.page));
  const undetermined = [...pages.flatMap((p) => (p && Array.isArray(p.undetermined) ? p.undetermined : [])), ...pageless];
  return { ...merged, text: { ...text, pages, undetermined,
    counts: { ...(text.counts || {}), undetermined: undetermined.length } } };
}

/* One tier-2 escalation, as both paths run it (R4). `text` is tier 1's I2 text. Answers `{outcome, text, replaced,
   kept, perPage, note, memberNotes}`. `outcome`: "not_needed" (tier 1 did not get essentially nothing), "unbound"
   (no member), "unavailable" (the binding threw), "no_improvement" (the member answered and could not help),
   "merged" (the merge ran: `text` is the merged text, tier 1's where no page moved, `note` the merge's own), or
   "refused" (the merge refused: tier 1 stands, `note` its reason). `memberNotes` are the member's own notes. */
export async function tier2Escalate(env, { sha, storeName, text }) {
  const out = { outcome: "not_needed", text, replaced: [], kept: [], perPage: null, note: null, memberNotes: [] };
  if (!needsTier2(text)) return out;
  if (!(env && env.PDF_WORKER)) { out.outcome = "unbound"; return out; }
  try {
    const r = await env.PDF_WORKER.fetch("https://pdf-worker/structure", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ capture_sha: sha, store: storeName }),
    });
    const t2 = await r.json();
    if (!(r.ok && t2 && t2.ok && t2.text)) { out.outcome = "no_improvement"; return out; }
    out.memberNotes = (Array.isArray(t2.notes) ? t2.notes : []).filter((n) => typeof n === "string");
    const m = carryImageUnread(text, mergeTier2Text(text, t2.text));
    if (m.ok) {
      /* D-251: who made the layer is a fact about the FILE; the member returns no `producer`, so tier 1's is
         carried when the member supplied none. */
      out.outcome = "merged";
      out.text = (text && text.producer && !m.text.producer) ? { ...m.text, producer: text.producer } : m.text;
      out.replaced = m.replaced; out.kept = m.kept || [];
      out.perPage = m.perPageTier || null;
      out.note = tier2Note(m) || null;
    } else { out.outcome = "refused"; out.note = m.why || null; }
  } catch { out.outcome = "unavailable"; }
  return out;
}

/* The sentence a reading's basis carries when tier 2 could not help (R4: "the reason is carried"). */
export function tier2FailureNote(failure) {
  return failure === "unbound"
    ? "tier 1 read essentially nothing of this document and no pdf-worker member is bound to this instance, so tier 1's reading stands"
    : failure === "no_improvement"
      ? "tier 1 read essentially nothing of this document and the pdf-worker member answered without improving it, so tier 1's reading stands"
      : failure === "unavailable"
        ? "tier 1 read essentially nothing of this document and the pdf-worker member could not be reached, so tier 1's reading stands"
        : null;
}

/* ===================================================================== *
 * The chain of a text layer (R11).
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

/* R11: `layerChain` at the tier, cap undetermined and the reason stated, extended by `ocr(<product>)` when the
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
 * Tier 3 (R5–R10, R35).
 * ===================================================================== */

/* R5: the markers that select a page for OCR. `no_text_layer` (a scan) and D-627's `image_content_unread` (an
   image fills the page and its text is a folio). `image_content_undetermined` and D-665's per-image `image_unread`
   route nothing: no measured signal separates a chart under a title from a photo page (M-182). */
export const TIER3_REASONS = Object.freeze(["no_text_layer", "image_content_unread"]);

/* R5: a document is a candidate when a page carries a selecting marker and none carries `encrypted`. */
export function needsTier3(text) {
  const marks = (text && Array.isArray(text.undetermined)) ? text.undetermined : [];
  if (marks.some((m) => m && m.reason === "encrypted")) return false;
  return marks.some((m) => m && TIER3_REASONS.includes(m.reason));
}

/* R5: the pages asked for are the selected pages, ascending. */
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

/* D-252 / R7–R10: THE MERGE. An OCR pass may fill a page; it may never replace text a page holds.
 *
 * A page the member returns is merged only when it was ASKED FOR (selected) and exists in the base; any other is
 * refused with its own reason (D-614, R10): `no_such_page`, `not_asked`, or `carries_glyphs` (a selected page whose
 * text holds a glyph and that was not routed as a folio page).
 *
 * D-635 (BOB #35, 2026-09-25 06:25Z: APPEND, R8): a selected page routed by `image_content_unread` whose text is only
 * a folio keeps every glyph it held and gains the transcription APPENDED after it; it is listed in both parts. Its
 * routing marker is discharged, its other markers kept, the engine's added.
 *
 * D-697 (R9): a page OCR fills, by replacement or append, discharges `image_unread`: the engine has read its images.
 *
 * D-616 / D-713 (R35): `kept` is the pages an earlier reading of this capture already transcribed, their whole
 * recorded text handed in as the member's answer. A kept page whose recorded text already begins with the page's
 * layer text is taken as recorded, never appended again, so a folio page re-read keeps ONE copy of its folio.
 *
 * A base with no usable per-page text takes the OCR answer whole only when it holds no glyph; otherwise the answer is
 * refused and the base stands (R7). */
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
               why: `this document's text could not be merged page by page (the tier that read it `
                  + `reported no per-page text), and it already holds ${baseGlyphs === null
                        ? `${reported} character(s) its producer counted and no text this merge can read`
                        : `${baseGlyphs} decoded glyph(s)`}`
                  + `, so an OCR pass was refused rather than allowed to replace text `
                  + `that may be better than it` };
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
                   undetermined: [...(Array.isArray(b.undetermined) ? b.undetermined : []).filter((u) => !discharged(u)),
                                  ...fromOcr] });
    } else if (got) {
      filled.push(b.page);
      pages.push({ page: b.page, text: said, undetermined: fromOcr });
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
  no_such_page: "the document has no such page",
  not_asked: "the OCR member was not asked for it",
  carries_glyphs: "it already carries text of its own, which a transcription may not replace",
};

/* R10 (D-614, D-607, D-635): what the merge did, in the record's own sentence. Each refused page with its own
   reason; the kept-text clause only when a page kept text (`layerPages`, the pages carrying a glyph that were not
   filled); the appended pages said; null when there is nothing to say. Pages are numbered from 1. */
export function tier3Note(m, memberNote, layerPages) {
  const say = [];
  const kept = Array.isArray(layerPages) ? layerPages.length : 0;
  if (!m.wholesale && m.filled.length)
    say.push(`${m.filled.length} scanned page(s) were transcribed by the OCR member and merged into `
           + `this document's own text`
           + (kept ? `; the ${kept === 1 ? "page" : "pages"} that already had text kept it` : ""));
  if (!m.wholesale && Array.isArray(m.appended) && m.appended.length)
    say.push(`${m.appended.length} of those page(s) already held a little text of their own (an image `
           + `fills the page and its text is a folio), and kept it: the transcription was appended after it, `
           + `so ${m.appended.length === 1 ? "that page is" : "those pages are"} credited to both the text `
           + `layer and the OCR member`);
  if (m.unanswered.length)
    say.push(`${m.unanswered.length} page(s) with no text layer were not transcribed and stay `
           + `honestly unread`);
  const why = Array.isArray(m.refusedWhy) ? m.refusedWhy : [];
  if (why.length)
    say.push(`${why.length} page(s) the OCR member returned were not merged: `
           + why.map((r) => `${describePages([r.page])} (${REFUSAL_SAYS[r.reason] || r.reason})`).join(", "));
  if (memberNote) say.push(memberNote);
  return say.length ? say.join("; ") : null;
}

/* D-606 (R5): the member reads one page per invocation and names the rest in `deferred`; the caller loops, one page
   per call, in order, within a budget. Cloudflare states a limit of 32 Worker invocations per request (their claim,
   not measured here; Miniflare does not enforce it, M-175); the reserve of 8 covers the other invocations one
   request can make. Past the budget, after a call that throws, a declined page, a page answered under another
   engine build than the first answer, and a page answered to the wrong call are not merged, and the note names
   them. */
export const OCR_INVOCATIONS_PER_REQUEST = 24;
export const OCR_SAME_PROVENANCE = ["engine", "version", "cap", "measured_by", "confidence_floor"];

export async function askMemberPerPage(env, { sha, storeName, wantPages }) {
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
  const loop = { invocations: 1, asked: 0, notAsked: [], threw: null, strays: [], mismatched: [], refused: [] };
  for (let i = 0; i < deferred.length; i++) {
    const page = deferred[i];
    if (loop.invocations >= OCR_INVOCATIONS_PER_REQUEST) { loop.notAsked = deferred.slice(i); break; }
    loop.invocations++; loop.asked++;
    try {
      const rp = await call([page]);
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

/* D-606 (R5): what the loop did not do, naming the pages (numbered from 1). */
export function tier3LoopNote(loop) {
  if (!loop) return null;
  const say = [];
  const named = (ps) => describePages(ps.filter(Number.isInteger));
  if (loop.notAsked.length)
    say.push(`${loop.notAsked.length} of them (${named(loop.notAsked)}) were not asked for in this `
           + `request: the OCR member reads one page per call and one request may make at most `
           + `${OCR_INVOCATIONS_PER_REQUEST} such calls here (Cloudflare states a limit of 32 Worker `
           + `invocations per request — their claim, not measured on this runtime); a re-read `
           + `(op=pdfstructure&ocr=1) asks for them next`);
  if (loop.threw)
    say.push(`the call for ${named([loop.threw.at])} failed, so ${loop.threw.rest.length} page(s) from it on `
           + `(${named(loop.threw.rest)}) were not transcribed in this request`);
  if (loop.refused.length)
    say.push(`the OCR member declined ${loop.refused.length} page(s) it was asked for one at a time (${named(loop.refused)})`);
  if (loop.mismatched.length)
    say.push(`${loop.mismatched.length} page(s) (${named(loop.mismatched)}) were answered under a different engine build `
           + `than the first and were not merged, so no page is filed under another build's provenance`);
  if (loop.strays.length)
    say.push(`${loop.strays.length} page(s) the OCR member returned were not the page that call asked `
           + `for, and were dropped`);
  return say.length ? say.join("; ") : null;
}
const withLoopNote = (note, loop) => {
  const extra = tier3LoopNote(loop);
  return extra ? (note ? `${note}; ${extra}` : extra) : note;
};

/* D-616 (R35): the pages a stored reading already transcribed, so a re-read asks the member for the rest and a scan
   longer than one request's budget is read to its tail over successive re-reads. Two sources, each saying one
   thing: the stored CHAIN says which pages a tier-3 part produced and under which build (its `pixels`/`ocr` steps,
   grouped by part); the record's whole per-page UNITS hold the words. A page is kept only when both speak for it:
   a unit with a glyph on a page exactly one tier-3 part covers. Each kept part carries its own chain (the stored
   steps without their stamped extent), so its pages stay under the build that read them. */
export function tier3SeedFrom(reading, units) {
  const chain = reading && Array.isArray(reading.text_source) ? reading.text_source : null;
  if (!chain || checkChain(chain) || !Array.isArray(units) || !units.length) return null;
  const groups = new Map();
  for (const step of chain) {
    if (step.step !== "pixels" && step.step !== "ocr") continue;
    const key = JSON.stringify(step.extent ?? null);
    if (!groups.has(key)) groups.set(key, { extent: step.extent ?? null, chain: [] });
    const { extent, ...bare } = step;
    groups.get(key).chain.push(bare);
  }
  const parts = [];
  for (const g of groups.values()) {
    if (!g.chain.some((x) => x.step === "ocr") || checkChain(g.chain)) continue;
    if (g.extent == null && chain.some((x) => x.step !== "pixels" && x.step !== "ocr")) continue;
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

/* CPDF-13 (R6): what the OCR member answered, taken only when it names its engine and version and a measured cap
   with `measured_by`. A region with no checkable image anchor is dropped and counted; a region below the member's
   confidence floor reads undetermined and its text is discarded (`applyConfidenceFloor`); a page no region anchors
   is not merged. The chain is `pixels → ocr(engine, version)`, both at the member's cap, naming `calibration` (the
   live calibration of that engine and version, R6) or none. */
export function ocrTextFromMember(res, { calibration = null } = {}) {
  const r = res && typeof res === "object" ? res : {};
  if (r.ok !== true)
    return { ok: false, why: `the OCR member declined to transcribe this document`
                             + `${typeof r.reason === "string" ? ` (${r.reason})` : ""}` };
  if (!(typeof r.engine === "string" && r.engine) || !(typeof r.version === "string" && r.version))
    return { ok: false, why: `the OCR member did not name its engine and version, so nothing it `
                             + `produced could be re-run or calibrated later` };
  if (!(typeof r.cap === "string" && r.cap) || !(typeof r.measured_by === "string" && r.measured_by))
    return { ok: false, why: `the OCR member reported no MEASURED fidelity for itself; a `
                             + `transcription's ceiling is a measurement, never a default` };
  const pages = Array.isArray(r.pages) ? r.pages : [];
  let anchorless = 0, kept = 0, floored = 0, undetermined = 0;
  const outPages = [];
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
    outPages.push({ page: pageNo, regions: f.regions,
                    text: f.regions.map((x) => x.text).filter((t) => typeof t === "string").join("\n"),
                    undetermined: f.regions.filter((x) => x.undetermined)
                      .map((x) => ({ page: pageNo, reason: "ocr_below_floor", font: null,
                                     codes: null, count: 1, why: x.why })) });
  }
  if (!outPages.length)
    return { ok: false, why: `the OCR member returned no page this record could anchor, so nothing `
                             + `it produced can be checked against the document` };
  const chain = appendStep([{ step: "pixels", cap: r.cap, measured_by: r.measured_by, calibration }],
                           { step: "ocr", engine: r.engine, version: r.version,
                             cap: r.cap, measured_by: r.measured_by, calibration });
  if (!Array.isArray(chain))
    return { ok: false, why: `the OCR member's own provenance was refused: ${chain.detail}` };
  const text = {
    document: outPages.map((p) => p.text).filter(Boolean).join("\n"),
    pages: outPages.map((p) => ({ page: p.page, text: p.text, undetermined: p.undetermined })),
    undetermined: outPages.flatMap((p) => p.undetermined),
    counts: { chars: outPages.reduce((n, p) => n + p.text.length, 0), undetermined },
    regions: outPages.flatMap((p) => p.regions),
  };
  const note = anchorless
    ? `${anchorless} region(s) the OCR member returned carried no checkable image region and were `
      + `dropped rather than recorded`
    : null;
  return { ok: true, text, chain, kept, floored, note };
}

/* CPDF-19 / D-319 (R5–R8, R35): the tier-3 seam, one function both paths call, so an acquire and a re-read compose
   one chain by one rule. `liveCalibration({engine, version})` is `calibration.liveCalibration` (R10 there): the
   calibration the chain names, or null; one that cannot be read is none, never the nearest measurement. `seed` is
   `tier3SeedFrom`'s answer (the re-read only). Never throws for a member's failure: that is `ocrNote`. */
export async function tier3Extend(env, { sha, storeName, i2text, wiredTier, tier2PerPage, fmt, seed = null,
                                         liveCalibration = null }) {
  let chain, chainSet = false, ocrNote = null, filled = [], engine = null, unanswered = [], loop = null;
  let seeded = [];
  const wanted = !!(i2text && needsTier3(i2text));
  if (wanted) {
    const wantPages = tier3Pages(i2text);
    const baseTier = wiredTier;
    const baseText = i2text;
    const kept = seed ? wantPages.filter((p) => seed.text.has(p)) : [];
    const askPages = wantPages.filter((p) => !kept.includes(p));
    if (env && env.OCR_WORKER && kept.length && !askPages.length) {
      seeded = kept;
      ocrNote = `every page of this document without a text layer (${kept.length}) was already transcribed `
              + `by an earlier reading of this capture, so the OCR member was not asked again`;
    } else if (env && env.OCR_WORKER) {
      try {
        const asked = await askMemberPerPage(env, { sha, storeName, wantPages: askPages });
        loop = asked.loop || null;
        /* The status is read before the body: a 500's body may not parse, and "could not be reached" is a
           different finding from "answered an error". */
        if (!(asked.status >= 200 && asked.status < 300)) {
          ocrNote = `the OCR member answered ${asked.status}, so this document stays unread`;
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
            engine = { engine: String(ocrAnswer.engine), version: String(ocrAnswer.version), calibration: calRef };
            const m = mergeTier3Text(baseText, withKeptPages(built.text, kept, seed), wantPages, { kept });
            if (!m.ok) ocrNote = withLoopNote(m.why, loop);
            else {
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
              /* D-616: the kept pages under the chain of the build that read them, the pages read now under this
                 build's; one part when the two chains are the same. */
              const keptIn = m.filled.filter((p) => kept.includes(p));
              const fresh = m.filled.filter((p) => !kept.includes(p));
              const t3parts = [];
              for (const pt of [...(seed ? seed.parts : []).map((x) => ({ chain: x.chain,
                                   pages: x.pages.filter((p) => keptIn.includes(p)) })),
                                { chain: built.chain, pages: fresh }]) {
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
              if (m.filled.length) wiredTier = 3;
              filled = fresh; seeded = keptIn; unanswered = m.unanswered || [];
              ocrNote = withLoopNote(tier3Note(m, built.note, layerPages.filter((p) => !appendedTo.includes(p))), loop);
              if (keptIn.length)
                ocrNote = `${ocrNote}; ${keptIn.length} of them were transcribed by an earlier reading of this `
                        + `capture and kept, not asked for again`;
            }
          } else ocrNote = withLoopNote(built.why, loop);
        }
      } catch {
        ocrNote = "the OCR member could not be reached, so this document stays unread";
      }
    } else {
      ocrNote = "this document has no text layer to read and no OCR engine is installed "
              + "in this instance, so nothing is claimed about what it says";
    }
  }
  /* D-418 (R7): a document still wants OCR when it was selected and nothing was filled, or a selected page is
     still unread. A page kept from an earlier reading is read (D-616). */
  const stillWanting = wanted && (!(filled.length + seeded.length) || unanswered.length > 0);
  return { i2text, wiredTier, chain, chainSet, ocrNote, filled, seeded, engine, stillWanting };
}

/* ===================================================================== *
 * Text units (R16).
 * ===================================================================== */

/* REC-91 (R16): the indexable units of a capture's final text, recognised by SHAPE: one per page (`pages[]`, a
   `pdf-page` extent with the rect null, the whole page), paragraph (`paragraphs[]`, `doc-para`) or slide (`slides[]`,
   `slide-shape` with the shape omitted, the whole slide, Bob 2026-09-15) holding a glyph (D-531), its extent in the
   producer's own numbering and `seq` its position. An absent list and an empty one are different answers: no unit
   list is null.
   THE WIRE'S BUDGET: at most ACQUIRE_TEXT_UNITS_BUDGET, each unit charged its UTF-8 bytes plus the envelope.
   D-685 (R16): a unit is cut to CAPTURE_TEXT_UNIT_CAP before it is charged, and the cut is said (`truncated`), so
   the prefix the index receives is the prefix it would keep. A unit whose capped prefix does not fit what remains is
   left out, and every unit left out is NAMED (D-724, BOB #36 2026-09-25 11:20Z, option (b)): as runs of consecutive
   skipped units (first and last extent and seq, a count), because the keys ride in `data/provenance.json` under
   INLINE_MAX; a capture sends at most ~1,018 runs.
   N108 (R16, retrieval R25, D-672): a workbook's unit is its SHEET, `sheet-range` at the whole used range its reader
   names (`sheets[].range`, `usedSheetRange` in the xlsx, ods and csv entries); a sheet whose range the reader could
   not name is no unit, never a guessed rectangle. A workbook's defined names and tables are not units here. */
const sheetRangeOf = (u) => {
  const r = u.range;
  return r && r.kind === "sheet-range" && typeof r.sheet === "string" && r.sheet && typeof r.range === "string" && r.range
    ? { sheet: r.sheet, range: r.range } : { sheet: null, range: null };
};
export function textUnitsFor(i2text) {
  let textUnits = null, textUnitsOverBound = 0, textUnitsSkipped = null;
  if (i2text) {
    const arm = (list, kind, fields) => (Array.isArray(list) ? list : [])
      .map((u, i) => (u && typeof u === "object" && typeof u.text === "string" && glyphCount(u.text) > 0
        ? { extent: { kind, ...fields(u, i) }, seq: i, text: u.text } : null))
      .filter(Boolean);
    const units =
        Array.isArray(i2text.pages)      ? arm(i2text.pages, "pdf-page",
          (u, i) => ({ page: Number.isInteger(u.page) ? u.page : i, rect: null }))
      : Array.isArray(i2text.paragraphs) ? arm(i2text.paragraphs, "doc-para",
          (u, i) => ({ para: Number.isInteger(u.para) ? u.para : i, run: null }))
      : Array.isArray(i2text.slides)     ? arm(i2text.slides, "slide-shape",
          (u, i) => ({ slide: Number.isInteger(u.slide) ? u.slide : i, shape: null }))
      : Array.isArray(i2text.sheets)     ? arm(i2text.sheets, "sheet-range", sheetRangeOf)
          .filter((u) => u.extent.sheet !== null)
      : null;
    let budget = ACQUIRE_TEXT_UNITS_BUDGET, dropped = 0;
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
      const size = new TextEncoder().encode(text).length + ACQUIRE_TEXT_UNIT_ENVELOPE;
      if (size > budget) { dropped++; skip(u); continue; }
      budget -= size; kept.push(cut ? { ...u, text, truncated: true } : u); run = null;
    }
    textUnits = kept.length ? kept : null;
    textUnitsOverBound = dropped;
    textUnitsSkipped = runs.length ? runs : null;
  }
  return { textUnits, textUnitsOverBound, textUnitsSkipped };
}

/* ===================================================================== *
 * The reading (R2, R12).
 * ===================================================================== */

/* The references a reader emitted, as they appear (R46): kind:key raw, never resolved; the position re-normalised
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

/* R12: the reading a wired text produces. A determined reading carries `text_source` (the chain), `text_tier`,
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
        ? `every reference carries where it was read (${positioned} of ${entities.length})`
        : positioned
          ? `${positioned} of ${entities.length} references carry where they were read; the rest were `
            + `read in stretches of text no part of the container claims, so their position is not stated`
          : `no reference carries where it was read — ${wired.position_why
              || "this reader does not say where"}`;
    reading = {
      content_type: wtype.key, reader_version: wtype.version ?? null,
      read_from_text: true, found: entities.length > 0,
      entities, facts: wired.parse_error ? {} : (wfacts || {}), at: retrieved,
      text_source: chain, text_tier: wiredTier, text_container: fmt,
      basis: (wired.parse_error
        ? `the ${wtype.key} reader could not parse the ${fmt} text-layer text (${wired.parse_error}), so nothing is claimed about its entities`
        : (entities.length
            ? `read by the ${wtype.key} reader v${wtype.version} over ${fmt} ${describeChain(chain)} (tier ${wiredTier}); ${wired.why}`
            : `the ${wtype.key} reader found no entities in this document's ${fmt} text-layer text (tier ${wiredTier}); recorded as an empty reading, never an emptied document`))
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
 * The container extent (R13).
 * ===================================================================== */

/* CAP-12 / COFF-12 / COFF-13 / FW-19 (R13): the container's own extent, READ off the I2 shape the entry returned,
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
        || "a placement the structure op reported could not be read as {page, rect}" }),
    };
  }
  return containerExtent;
}

/* ===================================================================== *
 * read (R1–R18).
 * ===================================================================== */

/* The document's own address, for the recognisers (R12): a Drive export's document address from Google's hop, an
   archive replay's from the archive's hop, else the locator. */
function documentAddressOf(doc) {
  const chain = Array.isArray(doc && doc.provenance_chain) ? doc.provenance_chain : [];
  const drive = chain.find((h) => h && h.drive_file_id && typeof h.document_address === "string");
  if (drive) return drive.document_address;
  const arch = chain.find((h) => h && h.via === "archive.org" && typeof h.document_address === "string");
  return arch ? arch.document_address : (doc && typeof doc.locator === "string" ? doc.locator : null);
}

/* R11: Google's export hop, when the document's chain carries one; its format is what the conversion produced. */
function driveHopOf(doc) {
  const chain = Array.isArray(doc && doc.provenance_chain) ? doc.provenance_chain : [];
  const h = chain.find((x) => x && x.drive_file_id && typeof x.export_format === "string");
  return h ? { format: h.export_format } : null;
}

const failed = (doc, docType, basis, extra = {}) => ({
  content_type: docType ? docType.type.key : null, reader_version: docType ? (docType.type.version ?? null) : null,
  read_from_text: false, found: false, entities: [], facts: {}, at: doc && typeof doc.retrieved === "string" ? doc.retrieved : null,
  basis, ...extra });

/** R1–R18: reads a stored capture. `document` is capture's acquire answer's document. `io` is what the Durable
 *  Object supplies: `evidence` (record-core's `evidenceStore()`, or null), `env` (the fleet bindings PDF_WORKER and
 *  OCR_WORKER), `storeName` (the namespace the members read the capture under), `view` (`jurisdictions.combine`'s
 *  view of the instance's profiles, or undefined when the instance holds none, R18), `planeVersion`, and
 *  `liveCalibration` (R6). Never throws; every failure is a failed reading. */
export async function read(document, { evidence = null, env = {}, storeName = "bio", view, planeVersion = null,
                                        liveCalibration = null } = {}) {
  try { return await readInner(document, { evidence, env, storeName, view, planeVersion, liveCalibration }); }
  catch (e) {
    const reading = failed(document, null, `the reading could not be composed (${String(e && e.message || e).slice(0, 200)}), `
      + `so nothing is claimed about this document's text; it is a failed reading, never an emptied document`);
    reading.provenance = await readingProvenance({ text: null, planeVersion });
    return { reading };
  }
}

async function bytesOf(evidence, doc) {
  const whole = async (digest) => {
    const o = await evidence.get(digest);
    return o ? new Uint8Array(await o.arrayBuffer()) : null;
  };
  if (!Array.isArray(doc.parts)) return { bytes: await whole(doc.capture.sha256) };
  const total = doc.parts.reduce((n, p) => n + (Number.isFinite(p && p.bytes) ? p.bytes : 0), 0);
  if (total > MULTIPART_READ_MAX)
    return { bytes: null, why: `the capture is ${total} bytes in ${doc.parts.length} parts, over the ${MULTIPART_READ_MAX} B `
                             + `a format entry is handed here, so it was not read` };
  const out = new Uint8Array(total);
  let at = 0;
  for (const p of doc.parts) {
    const b = p && typeof p.sha256 === "string" ? await whole(p.sha256) : null;
    if (!b) return { bytes: null, why: `part ${doc.parts.indexOf(p) + 1} of ${doc.parts.length} is not held in the evidence store` };
    out.set(b.subarray(0, Math.max(0, total - at)), at); at += b.length;
  }
  return { bytes: at === total ? out : null, why: at === total ? null : "the parts held do not add up to the capture's size" };
}

async function readInner(doc, { evidence, env, storeName, view, planeVersion, liveCalibration }) {
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

  /* R1: no store bound, no digest or no object is a failed reading saying so. No field the caller sends supplies
     text. */
  /* R15: every branch's reading gets its provenance at the one site below, a failure's included. */
  const early = async (reading) => {
    reading.provenance = await readingProvenance({ text: null, chain: null, tier: null, container: null, planeVersion, member: null });
    return { reading };
  };
  if (!sha) return early(failed(doc, null, "the document names no capture digest, so there are no bytes to read"));
  if (!evidence) return early(failed(doc, null, "this instance has no evidence store bound, so the capture's bytes cannot be read"));
  const got = await bytesOf(evidence, doc).catch(() => ({ bytes: null, why: "the evidence store could not be read" }));
  const bytes = got.bytes;
  const textRead = !multipart && profile.profiled_from_text === true && bytes;
  const text = textRead ? new TextDecoder("utf-8", { fatal: false }).decode(bytes) : "";
  const profCtx = { headers, locator, content_type: ct || null, text };
  const stackId = identify(profCtx);
  const docType = doctypeFor({ ...profCtx, handler: stackId.handler, kind: stackId.kind, ...vw });
  if (!bytes)
    return early(failed(doc, docType, got.why || "the capture's bytes are not held in the evidence store, so nothing was read"));

  const entry = fmt && fmt !== "undetermined" ? getFormat(fmt) : null;
  const wireable = !!(entry && (typeof entry.text === "function" || typeof entry.structure === "function"));
  let reading, classifiedText = null, member = null;
  let textUnits = null, textUnitsOverBound = 0, textUnitsSkipped = null, readDialect;

  if (!wireable && textRead) {
    /* R2: text read as text with no format entry that reads it goes to the content type's reader. */
    classifiedText = text; member = "plane";
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
          basis: entities.length
            ? `read by the ${docType.type.key} reader v${docType.type.version}`
              + `${entities.some((e) => e.source) ? "" : " — no reference carries where it was read: this "
                + "document was read as one undivided string, which names no part of a container to point at"}`
            : `the ${docType.type.key} reader found no entities in this document; recorded as an empty reading, never an emptied document`,
          position_parts: 0,
          position_why: entities.some((e) => e.source) ? null
            : "the text was read back as one decoded string, which carries no container structure, so "
            + "where in the document a reference was read cannot be said",
        };
      } catch (e) {
        reading = {
          content_type: docType.type.key, reader_version: docType.type.version ?? null,
          read_from_text: true, found: false, entities: [], facts: {}, at: retrieved,
          basis: `the ${docType.type.key} reader could not parse this document (${String(e && e.message || e)}), so nothing is claimed about its entities`,
        };
      }
    } else {
      reading = {
        content_type: docType.type.key, reader_version: docType.type.version ?? null,
        read_from_text: false, found: false, entities: [], facts: {}, at: retrieved,
        basis: `the ${docType.type.key} content type declares no reader, so this document has no reading`,
      };
    }
    /* R14: an entry with a decoding choice but no text answers its dialect over the same bytes. */
    try {
      if (entry && typeof entry.dialect === "function") readDialect = readingDialect(await entry.dialect(bytes));
    } catch { readDialect = undefined; }
  } else if (wireable) {
    /* R3 (D-593, D-684): through the entry over the stored bytes, tier 1, including delimited text read as text at
       intake and a multi-part capture within the bound: a CSV's text is the entry's own decode. */
    let i2text = null, wiredTier = null, pageCount = null, pdfPaints = null, wired = null;
    let chain = null, ocrNote = null, tier2note = null, tier2PerPage = null, t3Wanting = false;
    try {
      if (typeof entry.text === "function") {
        const parts = typeof entry.parts === "function" ? await entry.parts(bytes) : bytes;
        const tt = await entry.text(parts);
        if (tt && tt.ok !== false) { i2text = tt; wiredTier = 1; }
      } else {
        const st = await entry.structure(bytes);
        if (st && st.ok) {
          i2text = st.text || null; wiredTier = 1;
          if (Number.isInteger(st.pages) && st.pages > 0) pageCount = st.pages;
          pdfPaints = { images: Array.isArray(st.images) ? st.images : null,
                        why: typeof st.imagesWhy === "string" ? st.imagesWhy : null };
          /* R4: tier 2, merged page by page; two page-scoped parts when both tiers hold pages. */
          const t2 = await tier2Escalate(env, { sha, storeName, text: i2text });
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
      /* R5–R7: tier 3. */
      const t3 = await tier3Extend(env, { sha, storeName, i2text, wiredTier, tier2PerPage, fmt, liveCalibration });
      i2text = t3.i2text; wiredTier = t3.wiredTier;
      if (t3.chainSet) chain = t3.chain;
      if (t3.ocrNote != null) ocrNote = t3.ocrNote;
      t3Wanting = t3.stillWanting;
      if (i2text && Object.prototype.hasOwnProperty.call(i2text, "dialect")) {
        try { readDialect = readingDialect(i2text.dialect); } catch { readDialect = undefined; }
      }
      const extent = containerExtentOf(i2text, { pdfPaints, fmt });
      ({ textUnits, textUnitsOverBound, textUnitsSkipped } = textUnitsFor(i2text));
      if (i2text) {
        wired = readText(decodeView(i2text), { headers, locator, content_type: ct || null, at: retrieved, ...vw });
        classifiedText = i2text;
      }
      if (i2text && !chain) chain = layerChainFor(i2text, { tier: wiredTier, container: fmt });
      /* R11: a Drive export's conversion at the head, after every other part is settled; a refused prepend records
         no chain and fails the reading, naming the refusal. */
      const drive = driveHopOf(doc);
      if (drive && Array.isArray(chain)) {
        const converted = convertedChain(driveConvertStep(drive), chain);
        if (Array.isArray(converted)) chain = converted;
        else {
          chain = null;
          wired = { determined: false,
                    why: `the text chain of this Google Drive export could not be stated honestly `
                       + `(${converted.check} ${converted.code}: ${converted.detail}), so nothing is `
                       + `claimed about its text rather than claiming it was read from original bytes` };
        }
      }
      reading = wired
        ? readingFromWire({ wired, docType, chain, wiredTier, fmt, retrieved, tier2note, ocrNote, tier3Candidate: t3Wanting })
        : { ...failed(doc, docType, [tier2note, ocrNote, `the ${fmt} entry produced no text from these bytes`]
              .filter(Boolean).join(" — ")) };
      /* R13: never zero. */
      reading.page_count = Number.isInteger(pageCount) && pageCount > 0 ? pageCount : null;
      reading.container_extent = extent;
    } catch (e) {
      reading = failed(doc, docType, `the ${fmt} entry could not read these bytes (${String(e && e.message || e).slice(0, 200)}), `
        + `so nothing is claimed about its text`, { page_count: null, container_extent: null });
      textUnits = null; textUnitsOverBound = 0; textUnitsSkipped = null; classifiedText = null;
    }
  } else {
    reading = failed(doc, docType, `the document was not read as text (${multipart ? "multipart" : "non-textual or too large"}), so no reading was attempted`,
                     { page_count: null, container_extent: null });
  }

  /* R15: the reading's provenance, at one site for every branch, over exactly the text the reader was handed; text
     read as text at intake names the plane with tier null. */
  reading.provenance = await readingProvenance({
    text: classifiedText, chain: Array.isArray(reading.text_source) ? reading.text_source : null,
    tier: Number.isInteger(reading.text_tier) ? reading.text_tier : null,
    container: typeof reading.text_container === "string" ? reading.text_container : null,
    planeVersion, member });
  /* R14: absent when no entry answered a decoding choice. */
  if (readDialect !== undefined) reading.dialect = readDialect;
  return { reading,
           ...(textUnits ? { text_units: textUnits } : {}),
           ...(textUnitsOverBound ? { text_units_over_bound: textUnitsOverBound } : {}),
           ...(textUnitsSkipped ? { text_units_skipped: textUnitsSkipped } : {}) };
}
