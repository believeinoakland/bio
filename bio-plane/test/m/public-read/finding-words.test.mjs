/* public-read — R39 the words of a finding's claim and falsifier (T51 fix round 2; C2): `body.conclusion` and
   `body.falsifies` of one finding's page carry the words, never a section heading. The signed case document's
   `case_conclusions` claim and falsifier come first, the front matter's authored words next, the section's own words
   (heading removed) last; empty only when there are none. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf, bucket, SIG, KEY, caseDoc, inquiryMd } from "./fixture.mjs";
import { rowOf } from "../../../src/public-read/checks.mjs";
import { bindPublishedPlane, publishedRoutes } from "../../../src/publication/worker.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});
const call = async (w, env, q) => {
  const url = new URL("https://plane/?op=publishedcase");
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  return publishedRoutes({ op: "publishedcase", url, env, stub: stubOf(w) });
};
const enc = (t) => new TextEncoder().encode(t);

const CASE = "CASE-2026-2400", F = "INQ-2026-2400-case";
const T1 = "2026-09-28T01:00:00Z";
const BAR = { declared: true, capture: "B", connection: "C" };
const CLAIM = "The sewer transfer was authorised by the council.", FALSIFIER = "A recorded vote against the transfer.";
const AUTHORED = "The transfer was authorised.", AUTHORED_F = "A signed minute saying otherwise.";

/* One case over F whose bytes are `md` (an inquiry document), the case document optionally stating F's conclusion row. */
function published({ extra = [], section = null, row = null } = {}) {
  const w = world();
  w.member("olive");
  const proj = w.project("Sewer transfer", "olive");
  let md = inquiryMd(F, { question: "Was the sewer transfer authorised?", extra });
  if (section) md = md.replace("## Conclusion\n", `## Conclusion\n\n${section.claim}\n`)
                      .replace(word("conformance.falsify"), `${word("conformance.falsify")}\n\n${section.falsifier}`);
  w.promote(F, md);
  const pin = w.head(F);
  const opts = { format: "bio-case-document/5", project: proj, roles: [{ target: F, version_sha: pin, role: "load_bearing" }],
    strength: [{ target: F, axis: "capture", grade: "B" }, { target: F, axis: "connection", grade: "C" }] };
  let text = caseDoc(CASE, 1, opts);
  if (row) text = text.replace("case_findings:", ["case_conclusions:", `  - target: ${F}`, `    claim: "${row.claim}"`,
    `    claim_detail: ""`, `    falsifier: "${row.falsifier}"`, "case_findings:"].join("\n"));
  assert.equal(w.p.storeCaseDocument({ case: CASE, edition: 1, text, author: "olive", at: T1 }).ok, true);
  assert.equal(w.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin, role: "load_bearing" }],
                                     bar: BAR, sig: SIG(1), at: T1 }).ok, true);
  const bytes = w.text(F);
  assert.equal(w.signFinding(F, { title: "Finding F", sig: SIG(11), at: T1,
    shas: [{ sha256: pin, path: "bundle.md", kind: "bundle", bytes: Buffer.byteLength(bytes) }] }).ok, true);
  const env = { PUBLISHED: bucket() };
  env.PUBLISHED.m.set(`bio/published/${pin}`, enc(bytes));
  return { w, env };
}
const bodyOf = async ({ w, env }) => (await (await call(w, env, { id: F })).json()).findings[0].body;
const authored = [`conclusion: "${AUTHORED}"`, `falsifier: "${AUTHORED_F}"`];

test("R39 a concluded finding (words in front matter, no words in the section) answers its claim and falsifier as words, never a heading", async () => {
  const b = await bodyOf(published({ extra: authored }));
  assert.equal(b.state, "published");
  assert.equal(b.conclusion, AUTHORED);
  assert.equal(b.falsifies, AUTHORED_F);
  assert.equal(b.conclusion.includes("##") || b.falsifies.includes("##"), false);
  assert.deepEqual([b.authored.conclusion, b.authored.falsifier], [AUTHORED, AUTHORED_F], "`authored` is unchanged");
});

test("R39 the signed case document's claim and falsifier come before the authored words", async () => {
  const b = await bodyOf(published({ extra: authored, row: { claim: CLAIM, falsifier: FALSIFIER } }));
  assert.equal(b.conclusion, CLAIM);
  assert.equal(b.falsifies, FALSIFIER);
  assert.equal(b.authored.conclusion, AUTHORED, "the authored words are still served beside it");
});

test("R39 control: a finding whose sections hold words and states none elsewhere answers those words without their headings", async () => {
  const b = await bodyOf(published({ section: { claim: "The section says it was authorised.", falsifier: "The section's falsifier." } }));
  assert.equal(b.conclusion, "The section says it was authorised.");
  assert.equal(b.falsifies, "The section's falsifier.");
});

test("R39 a finding with no words anywhere answers null for both, never a heading", async () => {
  const b = await bodyOf(published());
  assert.deepEqual([b.conclusion, b.falsifies], [null, null]);
});
