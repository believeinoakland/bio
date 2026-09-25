/* D-536 — A READING CARRIES ITS OWN PROVENANCE, AND A RE-READ IS COMPARED WITH THE ONE BEFORE IT.
 *
 * BOB #33 RULED 2026-09-24 21:25Z, folded into `BIO_Content_Framework_v0_10.md` Part II §16
 * ("Reading provenance"): a reading carries its TIER, its PRODUCING MEMBER, the PAGES TRANSCRIBED and
 * a SHA-256 OF THE EXACT TEXT IT CLASSIFIED; a re-read is compared with the earlier one and a
 * disagreement is ATTRIBUTED ("tier 2 on pdf-worker returned different text for pages 3-4"); both
 * readings are kept and neither overwrites; a reading from before this landed reads provenance
 * UNDETERMINED, never inferred.
 *
 * THE MEASURED FAILURE IT MOVES (M-143): the same 332 documents escalated to the plane in two walks of
 * one sample and the classes of several moved, because tiers 2 and 3 did not return the same text
 * twice — and nothing in the record could say WHICH tier's text had changed, because a reading stated
 * only a document-level `text_tier` and the store replaced one reading with the next.
 *
 * TWO FUNCTIONS, both pure, so the acquire path, the read path's re-extraction and the store all use
 * ONE rule:
 *
 *   `readingProvenance`  — composed where the text is final, over the SAME flatten the content-type
 *                          reader classifies (`docprofile/readtext.mjs`'s `flattenText`), so the digest
 *                          is of the exact text classified and not of a second spelling of it.
 *   `compareProvenance`  — the attribution, run by the store when a reading of a capture arrives and an
 *                          earlier one is held.
 *
 * WHERE THE PER-PAGE TIER COMES FROM, IN ORDER, AND WHY THE CHAIN IS FIRST. §16 rules that THE CHAIN IS
 * THE AUTHORITY for a per-page question (D-284): each derivation step names the pages it covers. So a
 * page's tier is read off the chain when there is one — a `pixels` step covering the page is tier 3 (no
 * tier-3 route is not an engine over pixels), otherwise the covering `layer` step's own `tier`. Only when
 * no chain speaks for the page does the page's own `tier` stamp (the tier-2 merge's) answer, and only
 * after that the document's tier. A page nothing speaks for reads tier NULL, and says so. */

import { flattenText } from "../../docprofile/readtext.mjs";

export const PROVENANCE_SCHEME = "reading-provenance/1";

/* WHICH MEMBER PRODUCES EACH TIER, as the plane wires it (§16's three-tier table). A table and not a
   guess: tier 2 is reached only through the `PDF_WORKER` binding and tier 3 only through `OCR_WORKER`,
   and tier 1 runs inside the plane. A tier this table does not name reads member NULL. */
export const TIER_MEMBERS = Object.freeze({ 1: "plane", 2: "pdf-worker", 3: "ocr-worker" });

async function sha256Hex(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* A step's pages, or "all" for an unscoped step (mergedChain's own shape: a derivation step of a MIXED
   document carries `extent: {kind:"pages", pages}`; one of an unmixed document carries none). */
function stepPages(s) {
  const e = s && s.extent;
  if (e && e.kind === "pages" && Array.isArray(e.pages)) return new Set(e.pages.filter(Number.isInteger));
  return "all";
}
const covers = (pages, p) => pages === "all" || pages.has(p);

/* The chain's answer for one page: `{tier, engine}` or null when no step speaks for it. */
function chainTierOf(chain, page) {
  if (!Array.isArray(chain)) return null;
  let layer = null, pixels = null;
  for (let i = 0; i < chain.length; i++) {
    const s = chain[i];
    if (!s || typeof s !== "object") continue;
    const pages = stepPages(s);
    if (!covers(pages, page)) continue;
    if (s.step === "pixels") {
      /* The engine is the `ocr` step that READ these pixels — the next step in the same part. */
      const next = chain[i + 1];
      pixels = { tier: 3, engine: next && next.step === "ocr" && typeof next.engine === "string"
        ? `${next.engine}${next.version ? ` ${next.version}` : ""}` : null };
    } else if (s.step === "layer") {
      layer = { tier: Number.isInteger(s.tier) ? s.tier : null, engine: null };
    }
  }
  return pixels || layer;
}

/**
 * The provenance of ONE reading.
 *
 * @param {object} a
 * @param {object|string|null} a.text   the I2 text the content-type reader was handed (or null: none)
 * @param {Array|null}         a.chain  the reading's `text_source` chain
 * @param {number|null}        a.tier   the reading's document-level `text_tier`
 * @param {string|null}        a.container  the format key
 * @param {string|null}        a.planeVersion  the plane's VERSION binding, which names tier 1's producer
 * @param {string|null}        a.member  the producer to name when the text is on NO tier of the ladder —
 *                                       an HTML page's text, read at intake in the plane
 */
export async function readingProvenance({ text = null, chain = null, tier = null, container = null,
                                          planeVersion = null, member: offLadder = null } = {}) {
  const out = { scheme: PROVENANCE_SCHEME, text_tier: Number.isInteger(tier) ? tier : null,
                container: typeof container === "string" ? container : null,
                text_sha256: null, text_chars: 0, text_from: null,
                producers: [], pages: null, pages_why: null };
  if (text == null) {
    out.why = "no text surface answered for this document, so no text was classified and there is nothing "
            + "to digest";
    out.pages_why = out.why;
    return out;
  }
  const flat = flattenText(text);
  out.text_from = flat.source;
  out.text_chars = flat.text.length;
  /* AN EMPTY TEXT IS NOT DIGESTED. Two empty strings agree on nothing (`CLAUDE.md` §5), so a digest of
     one would let two readings that read NOTHING compare as agreeing. */
  out.text_sha256 = flat.text.length ? await sha256Hex(flat.text) : null;
  const byKey = new Map();
  const credit = (t, engine, page, fallback = null) => {
    const member = t == null ? fallback : (TIER_MEMBERS[t] ?? null);
    const key = `${t}|${member}|${engine || ""}`;
    if (!byKey.has(key))
      byKey.set(key, { tier: t, member,
                       ...(member === "plane" && planeVersion ? { version: String(planeVersion) } : {}),
                       ...(engine ? { engine } : {}), pages: page == null ? null : [] });
    if (page != null) byKey.get(key).pages.push(page);
  };
  const pages = (text && typeof text === "object" && Array.isArray(text.pages)) ? text.pages : null;
  if (pages && pages.some((p) => p && Number.isInteger(p.page))) {
    out.pages = [];
    for (const p of pages) {
      if (!p || !Number.isInteger(p.page)) continue;
      const fromChain = chainTierOf(chain, p.page);
      const t = fromChain && fromChain.tier != null ? fromChain.tier
        : Number.isInteger(p.tier) ? p.tier
        : out.text_tier;
      const pt = typeof p.text === "string" ? p.text : "";
      out.pages.push({ page: p.page, tier: t, member: t == null ? null : (TIER_MEMBERS[t] ?? null),
                       chars: pt.length, text_sha256: pt.length ? await sha256Hex(pt) : null });
      /* THE PAGES TRANSCRIBED are the pages that carry text; a page read to nothing is listed on
         `pages` with its tier and no digest, and is not credited to a producer as transcribed. */
      if (pt.length) credit(t, fromChain && fromChain.engine, p.page);
    }
  } else {
    /* NO PAGE GRAIN — an office container, a bare string. The whole text is one producer's, and which
       part of it changed on a re-read is not said, rather than guessed. */
    out.pages_why = "this text carries no per-page grain (its producer itemised no pages), so a re-read "
                  + "that differs is attributed to the document, not to a page";
    const c = chainTierOf(chain, -1);
    if (flat.text.length) credit(c && c.tier != null ? c.tier : out.text_tier, c && c.engine, null,
           typeof offLadder === "string" && offLadder ? offLadder : null);
  }
  out.producers = [...byKey.values()];
  return out;
}

/* "page 3", "pages 3-4", "pages 1, 3-4" — 1-based, as a reader counts, from I2's 0-based indices. */
export function describePages(list) {
  const ps = [...new Set(list.filter(Number.isInteger))].sort((a, b) => a - b).map((p) => p + 1);
  if (!ps.length) return "no page";
  const runs = [];
  for (const p of ps) {
    const r = runs[runs.length - 1];
    if (r && p === r[1] + 1) r[1] = p; else runs.push([p, p]);
  }
  return `${ps.length === 1 ? "page" : "pages"} ${runs.map(([a, b]) => (a === b ? `${a}` : `${a}-${b}`)).join(", ")}`;
}

const who = (t, m) => (t == null ? "an undetermined tier" : `tier ${t} on ${m || "an unnamed member"}`);
const isProv = (p) => !!(p && typeof p === "object" && p.scheme === PROVENANCE_SCHEME);

/**
 * Compare a re-read with the reading before it and ATTRIBUTE any difference.
 *
 * Returns `{state, says, changed?}` where `state` is one of
 *   `agrees`        — the same text was classified (by digest);
 *   `differs`       — it was not, and `changed[]` says which pages, by which producer before and now;
 *   `undetermined`  — one side carries no provenance (a reading from before D-536), so which tier's text
 *                     changed CANNOT be said, and is not inferred from `text_tier` or from the chain;
 *   `no_text`       — neither reading classified any text, so there is nothing to compare.
 */
export function compareProvenance(prior, next) {
  if (!isProv(prior) || !isProv(next)) {
    const which = !isProv(prior) && !isProv(next) ? "neither reading carries" :
      !isProv(prior) ? "the earlier reading carries" : "this reading carries";
    return { state: "undetermined",
             says: `${which} no reading provenance (it was written before D-536, or by a caller that did not `
                 + `carry it), so whether the text changed, and which tier's, is UNDETERMINED — it is not `
                 + `inferred from the document-level tier or from the chain` };
  }
  if (prior.text_sha256 == null && next.text_sha256 == null)
    return { state: "no_text", says: "neither reading classified any text, so there is nothing to compare" };
  if (prior.text_sha256 === next.text_sha256)
    return { state: "agrees", says: "the re-read classified the same text as the reading before it (SHA-256 equal)" };
  if (!Array.isArray(prior.pages) || !Array.isArray(next.pages)) {
    const pp = (prior.producers || []).map((p) => who(p.tier, p.member)).join(" and ") || who(prior.text_tier, null);
    const np = (next.producers || []).map((p) => who(p.tier, p.member)).join(" and ") || who(next.text_tier, null);
    return { state: "differs", changed: [],
             says: `the re-read classified different text (earlier: ${pp}; now: ${np}); `
                 + `the text carries no per-page grain, so which part of the document changed is not said` };
  }
  const before = new Map(prior.pages.map((p) => [p.page, p]));
  const after = new Map(next.pages.map((p) => [p.page, p]));
  const all = [...new Set([...before.keys(), ...after.keys()])].sort((a, b) => a - b);
  const groups = new Map();
  for (const pg of all) {
    const a = before.get(pg) || null, b = after.get(pg) || null;
    if (a && b && a.text_sha256 === b.text_sha256) continue;
    const key = `${a ? a.tier : "-"}|${a ? a.member : "-"}|${b ? b.tier : "-"}|${b ? b.member : "-"}`;
    if (!groups.has(key))
      groups.set(key, { before: a ? { tier: a.tier, member: a.member } : null,
                        now: b ? { tier: b.tier, member: b.member } : null, pages: [] });
    groups.get(key).pages.push(pg);
  }
  const changed = [...groups.values()];
  if (!changed.length)
    return { state: "differs", changed,
             says: "the re-read classified different text but no page's text differs, so the difference is in "
                 + "how the pages were joined into the text the reader was handed" };
  const says = changed.map((g) => {
    const pgs = describePages(g.pages);
    if (!g.before) return `${who(g.now.tier, g.now.member)} returned ${pgs}, which the earlier reading did not have`;
    if (!g.now) return `the earlier reading had ${pgs} (${who(g.before.tier, g.before.member)}), which this reading does not`;
    if (g.before.tier === g.now.tier && g.before.member === g.now.member)
      return `${who(g.now.tier, g.now.member)} returned different text for ${pgs}`;
    return `${pgs} ${g.pages.length === 1 ? "was" : "were"} read by ${who(g.before.tier, g.before.member)} before and by `
         + `${who(g.now.tier, g.now.member)} now, `
         + `and the text differs`;
  }).join("; ");
  return { state: "differs", changed, says };
}
