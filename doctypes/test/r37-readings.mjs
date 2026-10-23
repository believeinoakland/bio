/* R37's reference: what each type answers on the module's fixtures, as digests, so a test can say the answers of the
 * bounded types are the answers they gave before (`fixtures/r37-answers.json`, written by `make-r37-answers.mjs` from
 * the types as they stood on the tranche tip before R37). Nothing here is the module under test. */
import { createHash } from "node:crypto";
import { DOCTYPES } from "../index.mjs";
import { flattenText } from "../../docprofile/readtext.mjs";
import { CASES } from "./golden-cases.mjs";
import { HELD } from "./fixtures.mjs";
import { POLICIES, FRESH } from "./policies.mjs";
import { servedDocuments, textOf } from "./codifier.mjs";
import { registryOf, readWith } from "./read.mjs";

export const sha = (v) => createHash("sha256").update(JSON.stringify(v === undefined ? null : v)).digest("hex");

/** Every fixture reading: `{id, supplied, ctx}`. */
export function fixtureReadings() {
  const out = CASES.map((c) => ({ id: c.id, supplied: c.supplied, ctx: c.ctx }));
  for (const d of POLICIES.documents) out.push({ id: `policy:${d.id}`, supplied: d.text, ctx: { view: HELD } });
  for (const d of FRESH.documents) out.push({ id: `policy-fresh:${d.id}`, supplied: d.text, ctx: { view: HELD } });
  servedDocuments().forEach((s, i) => out.push({ id: `codifier:${i}`, supplied: textOf(s.doc), ctx: { view: HELD } }));
  return out;
}

const REG = registryOf(DOCTYPES);

/** The answers on one reading: each type's own `detect`, and the registry's verdict with the parse of the winner. */
export function answerOf(reading) {
  const text = flattenText(reading.supplied).text;
  const detects = {};
  for (const t of DOCTYPES) {
    let r;
    try { r = t.detect({ ...reading.ctx, text }); } catch (e) { r = { threw: String(e && e.message) }; }
    detects[t.key] = sha(r);
  }
  const r = readWith(REG, reading.supplied, reading.ctx);
  return { detects, type: r.doctype.type.key, confidence: r.doctype.confidence, also: r.doctype.also.map((x) => x.key),
           signals: sha(r.doctype.signals), parsed: sha(r.parsed) };
}

/** The answer `docprofile.readText` gave on a PDF's reading (a determined or an undetermined one). */
export function textAnswerOf(r) {
  return { determined: r.determined, chars: r.chars, type: r.doctype && r.doctype.type.key,
           confidence: r.doctype && r.doctype.confidence, also: ((r.doctype && r.doctype.also) || []).map((x) => x.key),
           signals: sha(r.doctype && r.doctype.signals), parsed: sha(r.parsed), parse_error: r.parse_error || null };
}
