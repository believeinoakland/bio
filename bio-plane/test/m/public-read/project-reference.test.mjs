/* public-read — R19 (DEC-111; `case-grammar` R10, K1144): `publishedCase` (R3) carries `project_reference`, the notice
   id the signed case document names in `working_on`, read with `case-grammar`'s `workingOnOf`; null when the document
   names none or is not `/5`. Every document is written with `case-grammar`'s own line builder (`workingOnLines`), as
   case-authoring writes it (its R41), into the fixture's document; driven through this module's `publishedcase` op and
   the Worker's route. Each claim has its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf, bucket, caseDoc, V, NOW } from "./fixture.mjs";
import { workingOnLines, WORKING_ON_KEY } from "../../../src/case-grammar/index.mjs";
import { bindPublishedPlane, publishedRoutes } from "../../../src/publication/worker.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});

const CASE = "CASE-2026-0001", F = "INQ-2026-0001", DOC = "INFO-2026-0001-minutes";
const NOTICE = "NOTICE-2026-0003", OTHER = "NOTICE-2026-0009";

/* The fixture's document at `format`, with `lines` inserted before its closing fence. */
function docWith(edition, opts, format, lines) {
  const text = caseDoc(CASE, edition, { ...opts, format });
  const all = text.split("\n");
  const close = all.indexOf("---", 1);
  return [...all.slice(0, close), ...lines, ...all.slice(close)].join("\n");
}
/* CASE edition 1 over F, signed and published, its document at `format` carrying `lines`. */
function published(format, lines) {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.doc(DOC);
  w.inquiry(F, { legs: [{ target: DOC }] });
  const pin = w.head(F);
  const text = docWith(1, { project: proj, roles: [{ target: F, version_sha: pin }] }, format, lines);
  const stored = w.p.storeCaseDocument({ case: CASE, edition: 1, text, author: V("olive"), at: NOW });
  assert.equal(stored.ok, true, JSON.stringify(stored));
  assert.equal(w.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin, role: "load_bearing" }] }).ok, true);
  assert.equal(w.signFinding(F).ok, true);
  return w;
}
const read = (w) => w.read("publishedcase", { id: CASE });

test("R19 a /5 document naming a notice in `working_on` answers it as `project_reference`, read from the signed bytes", async () => {
  const w = published("bio-case-document/5", workingOnLines(NOTICE));
  const c = read(w);
  assert.equal(c.ok, true);
  assert.equal(c.project_reference, NOTICE);
  assert.ok(c.document.text.includes(`${WORKING_ON_KEY}: "${NOTICE}"`), "as the signed document holds it");
  /* the same by finding and by hash, and through the Worker's public route */
  assert.equal(w.read("publishedcase", { id: F }).project_reference, NOTICE);
  assert.equal(w.read("publishedcase", { sha256: w.head(F) }).project_reference, NOTICE);
  const r = await publishedRoutes({ op: "publishedcase", url: new URL(`https://plane/?op=publishedcase&id=${CASE}`),
                                    env: { PUBLISHED: bucket() }, stub: stubOf(w) });
  assert.equal((await r.json()).project_reference, NOTICE);
  /* never live: the published row rewritten after signing changes nothing (negative control: the row did change) */
  w.st.sql.exec(`UPDATE published_cases SET scope='CHANGED LIVE' WHERE case_id=?`, CASE);
  assert.equal(read(w).scope, "CHANGED LIVE");
  assert.equal(read(w).project_reference, NOTICE);
  /* negative control: another notice in the document is the answer, so it is read, not constant */
  assert.equal(read(published("bio-case-document/5", workingOnLines(OTHER))).project_reference, OTHER);
});

test("R19 a /5 document without `working_on` names no notice: `project_reference` is null, and the key is always present", () => {
  const c = read(published("bio-case-document/5", workingOnLines(null)));
  assert.equal(c.ok, true);
  assert.equal("project_reference" in c, true);
  assert.equal(c.project_reference, null);
  /* a value present and not a notice reference names none either (ratification R38 refuses such a document) */
  assert.equal(read(published("bio-case-document/5", workingOnLines("not a notice"))).project_reference, null);
});

test("R19 a document before /5 names no notice, even carrying the line; a ratified record in no case names none", () => {
  const old = read(published("bio-case-document/4", workingOnLines(NOTICE)));
  assert.equal(old.ok, true);
  assert.ok(old.document.text.includes(NOTICE), "negative control: the line is in the signed bytes");
  assert.equal(old.project_reference, null);
  /* a loose record: no case, no document */
  const w = published("bio-case-document/5", workingOnLines(NOTICE));
  w.signFinding(DOC);
  const loose = w.read("publishedcase", { id: DOC });
  assert.deepEqual([loose.ok, loose.caseId, loose.project_reference], [true, null, null]);
});
