/* case-grammar — the complete edition, rendered from a case file (requirements: `build/requirements/case-grammar.md`
 * R14, with R9, R12, R15, R16; DEC-112 (2), `BIO_Publication_v0_1.md` §5C "The complete edition"; DEC-34's identifying
 * notice; DEC-118's foot line; DEC-96 item 4, N522). One function, so the plane (`public-read` R24), the checker
 * (`case-checker` R10) and import render a case one way.
 *
 * WHAT IT IS. One HTML file: every style inline, no script, no external reference (an archived copy's address is
 * printed as text, never linked), so it opens with nothing installed and no network. No length limit, and nothing left
 * out for length. Ordered so a reader can stop early: the claims; each finding (its standing line, its two grades with
 * their plain meanings, its chain down to the passages relied on); the materials; what was searched; the declared
 * bias; disclosed contradictions; the strength section; the grading method; how to check the case yourself. The
 * identifying notice heads the file and, printed, every page.
 *
 * WHAT IT READS: the case file alone, as K1315 (4) hands it: the manifest's facts and every file but the complete
 * edition, with no part, `{format, group, case, edition, case_document_sha, keys, files: [{path, kind, sha256, bytes,
 * content}]}`, `content` the file's bytes or text (R13). Every fact comes from the signed case document (its R17
 * blocks first, the per-finding files where it carries none) or from the files listed, in the document's own order, so
 * the same case file always gives the same bytes and the order files are handed in never
 * matters. THE WORDS of its sentences and headings are the UX stream's; these are used until it gives them. Pure; never
 * throws.
 *
 * THE PRODUCT'S NAME, AND LIGHT ONLY, BY FORMAT (DEC-124, K1365 (1); DEC-122 (2)). A `/6` case document, or an earlier
 * one, renders exactly the bytes it rendered before T31: "CivicOS" in the foot, in the line saying the case can be
 * checked without the product, and in the grading method's text, and no colour-scheme declaration (its colours are its
 * own and light already), so a published `/6` case file's edition re-renders byte for byte. A `/7` document renders
 * "Civicsmith" in those three places and declares only the light colour scheme, so a reader's dark setting does not
 * restyle it.
 *
 * THE TIMELINE AND THE CALCULATIONS (C11, K1494; C:A-12, K1448; T33-60). A document carrying R20's `timeline:` block
 * gains "The timeline" right after the findings (C11: the timeline of its findings), its two lanes as two lists, never
 * one; a document carrying R18's `calculations:` block gains "The calculations" right after the materials, each
 * calculation's recipe, inputs, results, recompute status and disclosure. Each is added only when its block is carried,
 * and the sections are numbered as rendered, so a case file published before T33 re-renders byte for byte.
 *
 * A PHOTO CARRIED AS ITS COPY (T37; N757; DEC-180 (4); T38: N779, K2248). A material whose row states R12's `obscured`
 * is listed with the original's fingerprint, the copy's fingerprint and, when the copy has one, its label, word for word,
 * in place of the line saying whether it is included. Since T38 every photo a published case carries travels as its
 * copy, marked or not: a marked photo's copy carries `case-carriage`'s label and is listed as before T38, byte for byte;
 * an unmarked photo's copy (nothing covered, no metadata) carries no label, so none is listed and its copy line says
 * nothing is covered. Every other row renders exactly as before T37, so an edition whose document states no `obscured`
 * renders the bytes it rendered before.
 *
 * A MEMBER DOCUMENT CARRIED AS ITS CLEANED COPY (T39; N806, K2333). Its row states `obscured` as a photo's does, with
 * `case-carriage`'s `COPY_CLEANED_LABEL`, and nothing in the row tells it from a photo, so the edition reads which it
 * is from the copy's own bytes, which the case file carries at `materials/<ref>/obscured`: a copy that is a PDF or a
 * zip package (doc-clean's output: PDF, OOXML, ODF) is a cleaned document and its copy line says so, then its label
 * word for word; every other copy (an image) is a photo's, listed as before T39, so every photo's edition keeps its
 * bytes. */

import { parseFrontmatter, canonicalJson, createSha256 } from "../record-grammar/index.mjs";
import { gradingMethodText } from "../strength/method.mjs";
import { caseDocumentBlocks, sourceRowWithheld, WITHHELD_SOURCE_LABEL, WITHHELD_SOURCE_REASON } from "./blocks.mjs";
import { caseTensionsOf } from "./tensions.mjs";
import { lensOf, LENS_KIND_WORDS, LENS_CLOSING_SENTENCES, LENS_NONE_SENTENCE, LENS_UNDETERMINED_SENTENCE } from "./edition.mjs";
import { methodOf, materialsOf, acceptedWorkOf, PAIR_AXES } from "./materials.mjs";
import { caseFilePath } from "./casefile.mjs";
import { CASE_DOCUMENT_FORMAT, CASE_DOCUMENT_FORMATS_ACCEPTED, caseDocumentRequiresMaterials } from "./formats.mjs";
import { gradingFactsOf, passagesOf } from "./facts.mjs";
import { standingOf } from "./standing.mjs";
import { calculationsOf } from "./calculations.mjs";
import { timelineOf } from "./timeline.mjs";

/** R14: the sections, in order, by their headings (the UX stream's words, until it gives them). */
export const COMPLETE_EDITION_HEADINGS = Object.freeze(["The claims", "The findings", "The documents and observations",
  "What was searched", "The declared bias", "Disclosed contradictions", "Strength", "How grades are worked out",
  "How to check this case yourself"]);
/** R14 (C11, C:A-12): the two sections a document carrying R20's or R18's block adds, after "The findings" and after
 *  "The documents and observations" (the UX stream's words, until it gives them). */
export const TIMELINE_HEADING = "The timeline";
export const CALCULATIONS_HEADING = "The calculations";
/** R14 (C11): the timeline's two lanes, by their names in the edition. */
export const TIMELINE_LANE_WORDS = Object.freeze({ they_did: "What they did", we_did: "What we did" });
/** R14 (C:A-12): each recompute status in words. */
export const RECOMPUTE_WORDS = Object.freeze({
  agrees: "recomputed at publication, and the result agrees with the one stored",
  differs: "recomputed at publication, and the result differs from the one stored",
  unbound: "not recomputed at publication: an input it names was not bound",
  /* DEC-149 (K1821): the complete edition is read with no credential, so it names "this group's Civicsmith". */
  not_recomputed: "not recomputed here: a workbook this group's Civicsmith did not recompute",
});
/** R14: the sentence the strength section opens with (§5C). */
export const TWO_STRENGTHS_SENTENCE = "A case has two strengths, never one.";
/** R14: the plain meaning each grade opens with (DEC-82: a grade tells you how easily someone else could check it,
 *  never whether it is true). */
export const GRADE_MEANINGS = Object.freeze({
  capture: "Capture: how faithfully the documents this rests on were taken in, so that someone else can check they are "
    + "what they say. A is the strongest, D the weakest. It never says whether the finding is true.",
  connection: "Connection: how firmly those documents are tied to what the finding is about, so that someone else can "
    + "follow the link. A is the strongest, D the weakest. It never says whether the finding is true.",
  testimony: "Testimony: a member's own firsthand account, graded beside the two and never combined with them.",
});
/** R14 (DEC-124; K1365 (1)): the product's name an edition renders: before T31's `/7`, and from it. */
export const PRODUCT_NAMES = Object.freeze({ before_v7: "CivicOS", current: "Civicsmith" });
/** R14: the name an edition of a case document with front matter `fm` renders: "CivicOS" for a `/6` document or an
 *  earlier one, "Civicsmith" for `/7` and for anything that is not an earlier accepted format. Pure; never throws. */
export function editionProductOf(fm) {
  try {
    const f = fm && typeof fm === "object" ? fm.format : undefined;
    return f !== CASE_DOCUMENT_FORMAT && CASE_DOCUMENT_FORMATS_ACCEPTED.includes(f) ? PRODUCT_NAMES.before_v7
      : PRODUCT_NAMES.current;
  } catch {
    return PRODUCT_NAMES.current;
  }
}
/** R14: the foot line (DEC-118: the group leads; the product is credited quietly). */
export const madeWithLine = (product) => `Made with ${product}`;
/** R14 (T37; N757; T38: N779; T39: N806): the words of a material carried as its copy (the UX stream's, until it gives
 *  them): `copy` for a photo's copy that carries a label (a marked photo's), `unmarked` for one that carries none
 *  (nothing covered), `cleaned` for a member document's cleaned copy; the label itself is the row's, printed word for
 *  word, and only when the copy has one. */
export const OBSCURED_WORDS = Object.freeze({
  original: "Fingerprint of the original (SHA-256), which the group holds and this case file does not carry: ",
  copy: "Carried as a copy with marked areas covered; the copy's fingerprint (SHA-256): ",
  unmarked: "Carried as a copy with nothing covered and none of the original's metadata; the copy's fingerprint (SHA-256): ",
  cleaned: "Carried as a cleaned copy, with none of the details of who made it or of its pictures; the copy's fingerprint (SHA-256): ",
});
/** R14: what the checker's public reads are called (`case-checker` R15). */
export const CHECKER_READS = Object.freeze({ program: "casechecker", specification: "casefilespec" });

const STYLE = [
  "body{font:16px/1.5 Georgia,serif;color:#1b1b1b;background:#fff;max-width:46em;margin:0 auto;padding:1em}",
  "h1{font-size:1.6em}h2{font-size:1.3em;border-bottom:1px solid #999;margin-top:2em}h3{font-size:1.1em}",
  ".notice{font:13px/1.4 Helvetica,Arial,sans-serif;border:1px solid #555;padding:.5em;background:#f4f4f4}",
  ".standing{font-weight:bold}.quote{border-left:3px solid #999;padding-left:.75em}.foot{font-size:12px;color:#555}",
  "code{font-size:.9em;word-break:break-all}",
  "@media print{.notice{position:fixed;top:0;left:0;right:0}body{margin-top:7em}}",
].join("");

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const said = (v, none = "not stated") => (v === null || v === undefined || v === "" ? none : String(v));
/* A value that a sentence goes on after: its own closing stops dropped, so no sentence ends twice. */
const clause = (v, none) => said(v, none).replace(/[.\s]+$/, "");
const RESULT_WORDS = { recreated: "recreated", recreated_in_part: "recreated in part", did_not_recreate: "did not recreate" };
const p = (s) => `<p>${esc(s)}</p>`;
const li = (s) => `<li>${esc(s)}</li>`;
const ul = (items) => (items.length ? `<ul>${items.join("")}</ul>` : "");
const objects = (xs) => (Array.isArray(xs) ? xs.filter((x) => x && typeof x === "object" && !Array.isArray(x)) : []);

/* The files as a lookup by path. A path listed twice keeps the copy whose content hashes to the SHA-256 its row states,
   else the copy with the lowest SHA-256, so the order the files are handed in never changes what is rendered. */
function filesOf(files) {
  const all = new Map();
  for (const f of objects(files)) {
    const c = f.content;
    if (typeof f.path !== "string" || (typeof c !== "string" && !(c instanceof Uint8Array))) continue;
    all.set(f.path, [...(all.get(f.path) || []), [shaOf(c), c, f.sha256]]);
  }
  const out = new Map();
  for (const [path, copies] of all) {
    const ranked = copies.sort((x, y) => (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0));
    out.set(path, (ranked.find(([h, , stated]) => h === stated) || ranked[0])[1]);
  }
  return out;
}
const decoder = new TextDecoder("utf-8");
const textOf = (v) => (typeof v === "string" ? v : v instanceof Uint8Array ? decoder.decode(v) : null);
const shaOf = (v) => (typeof v === "string" ? createSha256().update(new TextEncoder().encode(v)).hex()
  : v instanceof Uint8Array ? createSha256().update(v).hex() : null);
const jsonOf = (v) => { try { const t = textOf(v); return t === null ? null : JSON.parse(t); } catch { return null; } };
/* T39 (N806): whether a carried copy is a cleaned member document: its bytes begin as a PDF (`%PDF-`) or a zip package
   (`PK\x03\x04`: OOXML, ODF), the formats `doc-clean` writes; an image, or a copy not handed, is not. */
const DOCUMENT_MAGIC = ["%PDF-", "PK\x03\x04"].map((m) => [...m].map((c) => c.charCodeAt(0)));
const isDocumentCopy = (v) => {
  const b = typeof v === "string" ? [...v.slice(0, 5)].map((c) => c.charCodeAt(0)) : v instanceof Uint8Array ? [...v.subarray(0, 5)] : [];
  return DOCUMENT_MAGIC.some((m) => m.every((c, i) => b[i] === c));
};

/* A leg's words. */
const ROLE_WORDS = { supports: "Supports", cuts_against: "Cuts against" };
const extentWords = (e) => (e === null || e === undefined ? "no location stated"
  : typeof e === "string" ? e : (() => { try { return canonicalJson(e); } catch { return "an unreadable location"; } })());
const pairWords = (pair) => (pair ? PAIR_AXES.filter((x) => pair[x])
  .map((x) => `${x} ${pair[x].state === "graded" ? pair[x].grade : pair[x].state}`).join(", ") : "not stated");

/** R14: the complete edition of `caseFile` (`{format, group, case, edition, case_document_sha, keys, files}`), one HTML file as text. The same case file always gives
 *  the same bytes. A case file carrying no readable case document gives a file that says so. Pure; never throws. */
export function completeEditionOf(caseFile) {
  try {
    const cf = caseFile && typeof caseFile === "object" ? caseFile : {};
    const files = filesOf(cf.files);
    const docBytes = files.get(caseFilePath("case_document"));
    const docText = textOf(docBytes);
    const parsed = docText === null ? null : parseFrontmatter(docText);
    const fm = parsed && parsed.data && typeof parsed.data === "object" ? parsed.data : null;
    const group = typeof cf.group === "string" ? cf.group : null;
    const product = editionProductOf(fm);
    if (!fm) return page({ product, title: "A case file with no readable case document", notice: null, group,
      sections: [p("This case file carries no readable case document, so nothing of the case can be shown from it.")] });

    const caseId = said(fm.case_id ?? cf.case);
    const edition = said(fm.case_edition ?? cf.edition);
    const bar = fm.required_strength && typeof fm.required_strength === "object" ? fm.required_strength : {};
    const floors = bar.declared === false ? "no bar declared"
      : `capture ${said(bar.capture, "not set")}, connection ${said(bar.connection, "not set")}`;
    const docSha = shaOf(docBytes);
    const notice = `${said(group, "a group not named")} · Case ${caseId} · Edition ${edition}. Declared bias: `
      + `${clause(fm.bias_acknowledgement, "none stated")}. Bar (floors): ${floors}. Case document SHA-256: ${docSha}. `
      + `Verify it with the checker from the group's public read ${CHECKER_READS.program}, or against the case file's `
      + "manifest and the group's published record.";

    const roster = Array.isArray(fm.case_findings) ? fm.case_findings.map(String) : [];
    const roles = new Map(objects(fm.case_roles).map((r) => [String(r.target), r.role ?? null]));
    const strengthRows = objects(fm.case_strength);
    const pairOfMember = (m) => Object.fromEntries(strengthRows.filter((r) => String(r.target) === m)
      .map((r) => [r.axis, { state: r.state ?? null, grade: r.grade ?? null }]));
    const accepted = acceptedWorkOf(fm);
    /* R17: each finding's legs and passages as the document signs them; the per-finding files where it carries none. */
    const signedLegs = gradingFactsOf(fm);
    const signedPassages = passagesOf(fm);
    const chainFacts = {
      /* the block holds a row per leg of every finding a chain reaches, so a finding with none rests on nothing */
      legs: (f) => (signedLegs ? signedLegs[f] || []
        : (() => { const j = jsonOf(files.get(caseFilePath("grading_facts", f))); return j && Array.isArray(j.legs) ? objects(j.legs) : null; })()),
      passages: (f) => (signedPassages ? signedPassages[f] || []
        : objects(jsonOf(files.get(caseFilePath("passages", f))))),
    };
    const method = methodOf(fm);

    /* 1. the claims */
    const conclusions = new Map(objects(fm.case_conclusions).map((c) => [String(c.target), c]));
    const claims = [
      p(`What this case is about: ${said(fm.case_scope)}`),
      ul(roster.map((m) => {
        const c = conclusions.get(m);
        return li(!c ? `${m}: no conclusion is recorded for it.`
          : c.claim_state === "adopted" ? `${m}: ${said(c.claim)}`
          : `${m}: the claim is undetermined: ${said(c.claim_detail, "the record cannot establish which claim was concluded")}.`);
      })),
    ];

    /* 2. each finding */
    const findingHtml = roster.map((m) => {
      const pair = pairOfMember(m);
      const s = standingOf({ role: roles.get(m) ?? null, bar, pair });
      const grades = ["capture", "connection", ...("testimony" in pair ? ["testimony"] : [])].map((axis) => {
        const a = pair[axis];
        const g = !a ? "not stated" : a.state === "graded" ? `grade ${a.grade}` : said(a.state);
        return li(`${GRADE_MEANINGS[axis]} This finding: ${g}.`);
      });
      return `<h3>${esc(m)}</h3><p class="standing">${esc(s.line)}</p>${ul(grades)}${chainHtml(m, chainFacts, accepted, m, 0, new Set())}`;
    });

    /* 3. the materials */
    const mats = materialsOf(fm);
    const sources = (caseDocumentBlocks(docText).sources) || [];
    const attestOf = (ref) => ((mats && mats.attestations) || []).filter((a) => a.ref === ref);
    const materialHtml = !mats || !mats.materials
      ? [p("This case document lists no materials.")]
      : mats.materials.length === 0 ? [p("No document or observation is reached by this case's findings.")]
      : mats.materials.map((x) => {
          const src = sources.filter((r) => r.capture && r.capture === x.sha);
          const ob = x.obscured;
          return `<h3>${esc(said(x.ref))} (${esc(said(x.kind))})</h3>${ul([
            li(ob ? `${OBSCURED_WORDS.original}${said(x.sha)}` : `Fingerprint (SHA-256): ${said(x.sha)}`),
            ...(x.text_sha ? [li(`Extracted text fingerprint: ${x.text_sha}`)] : []),
            li(`Origin: ${said(x.origin)}`),
            li(`Archived copy: ${said(x.archived_copy, "none recorded")}`),
            ...(ob ? (isDocumentCopy(files.get(caseFilePath("obscured", x.ref)))
                ? [li(`${OBSCURED_WORDS.cleaned}${said(ob.copy)}`), ...(ob.label === null ? [] : [li(ob.label)])]
              : ob.label === null ? [li(`${OBSCURED_WORDS.unmarked}${said(ob.copy)}`)]
              : [li(`${OBSCURED_WORDS.copy}${said(ob.copy)}`), li(ob.label)])
              : [li(x.included ? "Included whole in this case file." : "Not included: only its fingerprint, origin and archived copy travel.")]),
            li(x.rests_under === "load_bearing" ? "A finding this case relies on rests on it." : "Only supporting findings rest on it."),
            ...src.map((r) => li(sourceRowWithheld(r) ? `Source: ${WITHHELD_SOURCE_LABEL}: ${WITHHELD_SOURCE_REASON}.`
                                                      : `Source: ${said(r.stated)}`)),
            ...attestOf(x.ref).map((a) => li(attestationWords(a))),
          ])}`;
        });

    /* 4. what was searched */
    const searched = fm.searched && typeof fm.searched === "object" ? fm.searched : null;
    const searchedHtml = !searched ? [p("This case document does not state what was searched.")] : [
      p(`Computed at ${said(searched.computed_at)} over ${said(searched.subjects)} subject(s), ${said(searched.looked)} `
        + "with a recorded observation. It records what was looked for, not how much exists."),
      ul(objects(fm.searched_levels).map((l) => li(`${said(l.level)} level (${said(l.subject_kind)}): `
        + `${String(said(l.outcome)).replace(/_/g, " ")}: ${said(l.subjects)} subject(s), ${said(l.looked)} looked at, `
        + `${said(l.never_looked)} never looked at, ${said(l.undetermined)} undetermined. ${said(l.detail, "")}`.trim()))),
    ];

    /* 5. the declared bias (R9) */
    const lens = lensOf(fm);
    const inForce = fm.bias_manifest && typeof fm.bias_manifest === "object" ? fm.bias_manifest.in_force : undefined;
    const biasHtml = [
      p(`The publisher's acknowledgement: ${said(fm.bias_acknowledgement, "none is stated")}`),
      ...(inForce === true && lens ? [ul(lens.statements.map((s) => li(`${LENS_KIND_WORDS[s.kind] ?? `a statement of kind ${said(s.kind)}`}, `
          + `on ${said(s.subject)}: ${said(s.text)} Justification: ${clause(s.justification)}. Evidence: `
          + `${s.citations.length ? s.citations.join("; ") : "none printed"}. Citations withheld: `
          + `${s.withheld ? `${s.withheld} (which ones is not stated)` : s.withheld === 0 ? "none" : "undetermined"}.`)))]
        : inForce === null ? [p(`${LENS_UNDETERMINED_SENTENCE}.`)]
        : [p(LENS_NONE_SENTENCE)]),
      ...LENS_CLOSING_SENTENCES.map(p),
    ];

    /* 6. disclosed contradictions */
    const t = caseTensionsOf(docText);
    const tensionHtml = t.tensions === null ? [p(`${t.detail}.`)]
      : t.tensions.length === 0 ? [p("This case disclosed no contradiction.")]
      : [ul(t.tensions.map((x) => li(x.highlighted
          ? `${said(x.finding)}: ${x.sentence} Seen side: ${clause(x.side && x.side.text)}. State: ${said(x.state)}.`
          : `${said(x.finding)}: ${clause(x.sides.a.text)}, against ${clause(x.sides.b.text)}. State: ${said(x.state)}.`
            + `${x.explanation ? ` Explanation: ${clause(x.explanation)}.` : ""}`
            + `${x.owner_words ? ` The case's owner says: ${x.owner_words.text}` : ""}`))),
         p(`${clause(t.depth)}.`)];

    /* 7. strength */
    const strengthHtml = [p(TWO_STRENGTHS_SENTENCE),
      p("Each finding is graded on its own, on capture and on connection separately, as this case read it. Nothing "
        + "combines them, and this case has no strength of its own."),
      ul(roster.map((m) => li(`${m}: ${["capture", "connection", "testimony"].filter((a) => a in pairOfMember(m))
        .map((a) => { const x = pairOfMember(m)[a]; return `${a} ${x.state === "graded" ? x.grade : said(x.state)}`; })
        .join(", ") || "no frozen strength is recorded for it"}.`))),
      p(`This project's bar: ${floors}.`)];

    /* 8. the grading method */
    const methodText = method && method.grading ? gradingMethodText(method.grading, product) : null;
    const methodHtml = methodText ? methodText.split("\n").filter((l) => l.trim()).map(p)
      : [p(method && method.grading
        ? `This case was graded by method ${method.grading}, whose words this rendering does not hold.`
        : "This case document does not state the grading method it was graded by.")];
    if (method && method.checks) methodHtml.push(p(`It was checked under catalogue version ${method.checks}.`));

    /* 9. how to check it */
    const checkHtml = [
      p(`You can check this case yourself, without ${product} and without a network connection.`),
      p(`1. Get the checker, one file, from the publishing group's public read ${CHECKER_READS.program}, and the `
        + `specification of the case file's format from ${CHECKER_READS.specification}.`),
      p("2. Run the checker on every part of this case file. It checks every fingerprint and signature, finds each "
        + "passage where it is said to be, works each grade out again by the method stated above, checks each relied-on "
        + "finding against the bar, and runs the same publication checks."),
      p("3. Each finding is then recreated, recreated in part (naming what is missing, such as a document to fetch: a "
        + "document whose fingerprint matches completes it), or did not recreate (naming what differs)."),
      p("Recreating a case shows it is intact and consistent. It does not show that it is true."),
    ];

    /* C11, C:A-12: the timeline after the findings, the calculations after the materials, each only when carried */
    const bodies = [claims, findingHtml, materialHtml, searchedHtml, biasHtml, tensionHtml, strengthHtml, methodHtml, checkHtml];
    const sections = COMPLETE_EDITION_HEADINGS.map((h, i) => [h, bodies[i]]);
    const v6up = caseDocumentRequiresMaterials(fm);
    if (v6up && Array.isArray(fm.calculations)) sections.splice(3, 0, [CALCULATIONS_HEADING, calculationsHtml(calculationsOf(fm))]);
    if (v6up && Array.isArray(fm.timeline)) sections.splice(2, 0, [TIMELINE_HEADING, timelineHtml(timelineOf(fm))]);

    return page({ product, title: `${said(group, "A group")} · Case ${caseId} · Edition ${edition}`, notice, group, sections:
      sections.map(([h, body], i) => `<h2>${esc(`${i + 1}. ${h}`)}</h2>${body.join("")}`) });
  } catch {
    return page({ product: PRODUCT_NAMES.current, title: "A case file that could not be read", notice: null, group: null,
                  sections: [p("This case file could not be read whole, so nothing of the case is shown from it.")] });
  }
}

/* One finding's chain, down to the passages relied on: its legs from its grading facts (`strength` R35's legs), a leg
   to a question followed into that question's own facts when the case file carries them (to `strength`'s depth bound,
   6, never round a loop), a leg to another group's finding stopping there with what the case states of it (R16). */
function chainHtml(finding, facts, accepted, member, depth, seen) {
  if (seen.has(finding)) return p(`${finding} is already shown above in this chain.`);
  if (depth > 6) return p("This chain goes deeper than six steps; the steps below are not followed.");
  const next = new Set([...seen, finding]);
  const legs = facts.legs(finding);
  const legHtml = legs === null
    ? p(`This case file carries no grading facts for ${finding}, so its chain is not shown.`)
    : legs.length === 0 ? p(`${finding} rests on nothing.`)
    : ul(legs.map((l) => {
        const target = said(l.target);
        const head = `${ROLE_WORDS[l.role] ?? said(l.role, "Rests on")}: ${target}`
          + `${l.grade_axis ? `, ${l.grade_axis} grade ${said(l.grade)}` : ""}`
          + `${l.grade_source ? ` (${l.grade_source})` : ""}${l.ground ? `, in the set of reasons '${l.ground}'` : ""}`;
        if (l.kind === "imported" || /^imported:/.test(target)) {
          const rows = accepted.rows.filter((r) => r.ref === target && (r.member === null || r.member === member));
          const flags = accepted.flags.filter((f) => f.ref === target);
          return `<li>${esc(`${head}. This is another group's finding.`)}${ul([
            ...(rows.length ? rows.flatMap((r) => [
              li(`Accepted by ${said(r.accepted_by)} on ${said(r.accepted_at)}, edition ${said(r.edition)}, because: ${clause(r.reason)}.`),
              li(`Recreated as: ${RESULT_WORDS[r.result] ?? said(r.result)}${r.gaps ? `; the gaps stated: ${r.gaps}` : ""}. Its grades as that edition published them: ${pairWords(r.pair)}.`),
              li(`Check that finding in its own case file: ${said(r.group)}, case ${said(r.case)}, edition ${said(r.edition)}, `
                 + `finding ${said(r.finding)}, manifest SHA-256 ${said(r.manifest_sha)}.`)])
              : [li("This case states no acceptance for it.")]),
            ...flags.filter((f) => rows.length === 0 || rows.some((r) => r.edition === f.edition))
              .map((f) => li(`An open flag is disclosed: ${clause(f.issue)} (flagged ${said(f.flagged_at)})`
                + `${f.words ? `. The case's owner says: ${clause(f.words)}` : ""}.`)),
            li("The chain stops here: what that finding rests on is in its own case file."),
          ])}</li>`;
        }
        if (l.kind === "inquiry") return `<li>${esc(head)}${chainHtml(target, facts, accepted, member, depth + 1, next)}</li>`;
        return li(head);
      }));
  const quoted = facts.passages(finding);
  const passageHtml = quoted.length
    ? `<p>${esc(`The passages ${finding} relies on:`)}</p>${quoted.map((q) => `<blockquote class="quote">${esc(said(q.quoted, ""))}`
      + `<br><small>${esc(`In the document captured as ${said(q.capture_sha)}, at ${extentWords(q.extent)} (content `
      + `${said(q.content_id)}).`)}</small></blockquote>`).join("")}`
    : "";
  return legHtml + passageHtml;
}

/* A value as the edition prints it: a string as written, anything else its canonical JSON. */
const valueWords = (v, none = "not stated") => (v === null || v === undefined ? none
  : typeof v === "string" ? v : (() => { try { return canonicalJson(v); } catch { return "an unreadable value"; } })());

/* R20 (C11): the two lanes as two lists, never one; each item with its when and its source. */
function timelineHtml(t) {
  return [p("What they did and what we did are two lists, never mixed. Each item shows the record it rests on."),
    ...["they_did", "we_did"].flatMap((lane) => [`<h3>${esc(TIMELINE_LANE_WORDS[lane])}</h3>`,
      t[lane].length ? ul(t[lane].map((x) => li(`${valueWords(x.when, "when undetermined")}: ${clause(valueWords(x.label, "an item"))}`
        + `${x.ref ? ` (${valueWords(x.ref)})` : ""}. Source: ${valueWords(x.source)}.`)))
        : p("Nothing is stated in this lane.")])];
}

/* R18 (C:A-12): each calculation, with what it computed from, what it stored, and whether it recomputed. */
function calculationsHtml(rows) {
  if (!rows.length) return [p("No calculation is reached by this case's findings.")];
  return [p("Each calculation is stated so that anyone can run its recipe again on the same inputs. A result is a "
    + "computed fact, never a judgment."), ...rows.map((c) => `<h3>${esc(said(c.calc))}</h3>${ul([
    li(`Recipe: ${valueWords(c.recipe)}`),
    li(`Method version: ${said(c.method_version)}`),
    ...(c.inputs ? Object.keys(c.inputs).sort().map((n) => li(`Input ${n}: SHA-256 ${c.inputs[n]}`)) : [li("Its inputs are not stated.")]),
    ...(c.results ? Object.keys(c.results).sort().map((k) => li(`Result ${k}: ${valueWords(c.results[k])}`)) : [li("Its results are not stated.")]),
    li(`Result key: ${said(c.result_key, "undetermined")}`),
    li(`It was ${RECOMPUTE_WORDS[c.recompute] ?? "recomputed at publication with an outcome not stated"}.`),
    ...(c.disclosed ? [li(`The publisher's disclosure: ${c.disclosed}`)] : []),
  ])}`)];
}

/* An attestation row in words (R12): an anonymous member is never named. */
function attestationWords(a) {
  switch (a.by_kind) {
    case "member":
      return a.level === "group" || a.level === "project"
        ? `Attested by a member of the group, credited to the ${a.level}${a.at ? `, on ${a.at}` : ""}.`
        : `Attested by ${said(a.by, "a member")}${a.level ? ` (credited by ${a.level === "cover" ? "cover name" : "name"})` : ""}`
          + `${a.at ? `, on ${a.at}` : ""}${a.signature ? ", signed" : ""}.`;
    case "co_attestation":
      return `Co-attested by ${said(a.by)}${a.at ? ` on ${a.at}` : ""}${a.recorded_in ? `, recorded in ${a.recorded_in}` : ""}.`;
    case "project":
      return `Held in the record of ${said(a.by)}${a.at ? `, registered ${a.at}` : ""}${a.recorded_in ? `, in ${a.recorded_in}` : ""}.`;
    case "group":
      return `Vouched for by the group ${said(a.by)}, under this case's own signature.`;
    default:
      return `An attestation of a kind this rendering does not know: ${said(a.by_kind)}.`;
  }
}

function page({ product, title, notice, group, sections }) {
  return ["<!doctype html>", '<html lang="en">', "<head>", '<meta charset="utf-8">',
    ...(product === PRODUCT_NAMES.before_v7 ? [] : ['<meta name="color-scheme" content="light">']),
    `<title>${esc(title)}</title>`, `<style>${STYLE}</style>`, "</head>", "<body>",
    ...(notice ? [`<div class="notice">${esc(notice)}</div>`] : []),
    `<h1>${esc(title)}</h1>`,
    ...(group ? [p(`Published and signed by ${group}.`)] : []),
    ...sections,
    `<p class="foot">${esc(madeWithLine(product))}</p>`,
    "</body>", "</html>", ""].join("\n");
}
