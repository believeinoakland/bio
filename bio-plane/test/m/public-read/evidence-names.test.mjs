/* R41 (T51 fix round 3; C47, C94): what the published page names. `op=publishedcase`'s per-finding answer carries, on each
   evidence entry whose leg rests on a captured document, `document: {name, place}` as the signed case states them; the
   finding's `falsifier` beside `case_words`; and wherever it names a member, her handle and never her member id. Driven at
   the module's interface: the store's read (`w.read`) and the Worker's `publishedRoutes` over this module's op map, on a
   case document the fixture's world signs with the blocks `case-grammar` R12 and R17 write. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf, bucket, sha, SIG } from "./fixture.mjs";
import { publishedGraphEdges, gradingFactsLines, passagesLines } from "../../../src/case-grammar/index.mjs";
import { bindPublishedPlane, publishedRoutes } from "../../../src/publication/worker.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, StoreSilent: class extends Error {}, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent",
  PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});
const anon = async (w, env, q) => {
  const url = new URL("https://plane/?op=publishedcase");
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  return (await publishedRoutes({ op: "publishedcase", url, env, stub: stubOf(w) })).json();
};

const CASE = "CASE-2026-4100", F = "INQ-2026-4100-case";
const DOC_A = "INFO-2026-4100-minutes", DOC_W = "INFO-2026-4100-working";
const CAP_A = sha(`the text of ${DOC_A}`);
const ORIGIN = "https://example.org/council-minutes-2024-03-12.pdf";
const T1 = "2026-09-28T01:00:00Z";
const ENC = (t) => new TextEncoder().encode(t);

/* One case edition (`/7`) over F, which rests on two legs of one captured document (the minutes, at two places) and on one
   leg of working material (an observation). The case document signs the blocks R12 and R17 write for them. `falsifier`
   is the sentence the finding's published bytes state, when a test gives one. */
async function evidenceWorld({ members = null, ids = {}, falsifier = null } = {}) {
  const w = world(members ? { members } : {});
  const writer = ids.writer ?? "olive", publisher = ids.publisher ?? "olive";
  for (const m of new Set([writer, publisher])) w.member(m, { handle: ids.handles?.[m] ?? `h_${m}` });
  const proj = w.project("Minutes", publisher);
  for (const d of [DOC_A, DOC_W]) w.doc(d);
  w.inquiry(F, { question: "Was the transfer authorised?", legs: [{ target: DOC_A }, { target: DOC_A }, { target: DOC_W }] });
  const pin = w.head(F);
  const grading = [
    { finding: F, ord: 0, target: DOC_A, kind: "document", role: "supports", captures: [CAP_A] },
    { finding: F, ord: 1, target: DOC_A, kind: "document", role: "supports", captures: [CAP_A] },
    { finding: F, ord: 2, target: DOC_W, kind: "observation", role: "supports", captures: [] }];
  const passages = [
    { finding: F, ord: 0, content_id: "a".repeat(64), capture_sha: CAP_A, extent: { kind: "pdf-page", page: 1 }, chain: null, quoted: "the transfer was approved" },
    { finding: F, ord: 1, content_id: "b".repeat(64), capture_sha: CAP_A, extent: { kind: "pdf-page", page: 4 }, chain: null, quoted: "from the sewer fund" }];
  const text = (await import("../publication/fixture.mjs")).caseDoc(CASE, 1, {
    format: "bio-case-document/7", project: proj, method: { grading: "bio-grading/1", checks: "1.57.0" },
    materials: [{ ref: DOC_A, kind: "document", sha: CAP_A, text_sha: null, origin: ORIGIN, archived_copy: null, included: false,
                  rests_under: "load_bearing" }],
    roles: [{ target: F, version_sha: pin, role: "load_bearing" }],
    strength: [{ target: F, axis: "capture", grade: "B" }, { target: F, axis: "connection", grade: "C" }] });
  const lines = text.split("\n"), close = lines.indexOf("---", 1);
  const doc = [...lines.slice(0, close), ...gradingFactsLines(grading), ...passagesLines(passages), ...lines.slice(close)].join("\n");
  const stored = w.p.storeCaseDocument({ case: CASE, edition: 1, text: doc, author: `member:${publisher}`, at: T1 });
  assert.equal(stored.ok, true, "fixture: the case document stored");
  const signed = w.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin, role: "load_bearing" }],
    signer: publisher, sig: SIG(1), at: T1,
    completeness: { statement: "It leaves out the minutes of 2023.", author: publisher, statement_by: writer, at: T1,
                    acknowledgements: [] } });
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 300));
  const fText = w.text(F);
  const fin = w.signFinding(F, { title: "Finding F", sig: SIG(11), at: T1, signer: publisher, edges: publishedGraphEdges(w.fm(F)),
    shas: [{ sha256: pin, path: "bundle.md", kind: "bundle", bytes: Buffer.byteLength(fText) }] });
  assert.equal(fin.ok, true, "fixture: the finding ratified");
  const env = { PUBLISHED: bucket() };
  /* the finding's published bytes, with the falsifier its author stated when the test gives one */
  const published = falsifier == null ? fText : fText.replace("\n---\n", `\nfalsifier: "${falsifier}"\n---\n`);
  env.PUBLISHED.m.set(`bio/published/${pin}`, ENC(published));
  return { w, env, pin };
}

test("R41 (1) each evidence entry resting on a captured document names it and the place it cites; two legs of one capture are told apart", async () => {
  const { w, env } = await evidenceWorld();
  const c = await anon(w, env, { id: F });
  const basis = c.findings[0].basis;
  assert.equal(basis.length, 3);
  assert.deepEqual(basis.map((l) => l.target), [DOC_A, DOC_A, DOC_W]);
  assert.deepEqual(basis[0].document, { name: ORIGIN, place: { kind: "pdf-page", page: 1 } },
    "the document's name as the signed case states it, and the place its passage cites");
  assert.deepEqual(basis[1].document, { name: ORIGIN, place: { kind: "pdf-page", page: 4 } });
  assert.equal(basis[0].document.name, basis[1].document.name, "one capture: one name");
  assert.notDeepEqual(basis[0].document.place, basis[1].document.place, "two entries of one case told apart by their places");
  /* CONTROL: a leg resting on working material is named, not served, and carries no document; no leg's bytes are served. */
  assert.deepEqual([basis[2].served, basis[2].document, basis[2].cited_edition], [false, null, null]);
  for (const l of basis) assert.equal(l.cited_edition, null, "nothing of the leg's bytes is handed over (B318 4)");
  assert.ok(!JSON.stringify(basis).includes(CAP_A), "not even the capture's fingerprint travels in an entry");
  assert.ok(basis.every((l) => "document" in l), "every entry states its document or null, never omits it");
});

test("R41 (1) a case document that states no grading facts (withheld, or before /6) leaves every entry's document null, never filled", async () => {
  const { w, env } = await evidenceWorld();
  w.st.sql.exec(`UPDATE case_documents SET text=REPLACE(text, 'grading_facts:', 'grading_facts_removed:') WHERE case_id=?`, CASE);
  const c = await anon(w, env, { id: F });
  assert.deepEqual(c.findings[0].basis.map((l) => l.document), [null, null, null]);
});

test("R41 (2) the finding's falsifier is served beside case_words, from its published bytes; null when the bytes state none", async () => {
  const SENTENCE = "A later audit finding the transfer was never authorised would change it.";
  const { w, env } = await evidenceWorld({ falsifier: SENTENCE });
  const f = (await anon(w, env, { id: F })).findings[0];
  assert.equal(f.falsifier, SENTENCE);
  assert.equal(f.falsifier, f.body.authored.falsifier, "it is R39's authored.falsifier, as the published bytes state it");
  assert.ok("case_words" in f && "falsifier" in f, "beside case_words");
  /* CONTROL: bytes that state none answer null, and the key is there. */
  const bare = await evidenceWorld();
  const g = (await anon(bare.w, bare.env, { id: F })).findings[0];
  assert.equal(g.falsifier, null);
  assert.ok("falsifier" in g);
  /* CONTROL: a body that cannot be read states none, and says nothing it did not read. */
  const gone = await evidenceWorld({ falsifier: SENTENCE });
  gone.env.PUBLISHED.m.clear();
  assert.equal((await anon(gone.w, gone.env, { id: F })).findings[0].falsifier, null);
});

test("R41 (3) wherever the answer names a member it names her by her handle, never by her member id", async () => {
  const ids = { writer: "mem-7731", publisher: "mem-4821", handles: { "mem-7731": "rowan", "mem-4821": "olive" } };
  const { w, env } = await evidenceWorld({ ids });
  for (const [label, a] of [["store", w.read("publishedcase", { id: F })], ["worker", await anon(w, env, { id: F })]]) {
    assert.equal(a.completeness.author, "olive", `${label}: the publisher of the case`);
    assert.equal(a.completeness.statement_by, "rowan", `${label}: the writer of the statement`);
    assert.equal(a.findings[0].attestor.member, "olive", `${label}: the attestor`);
    assert.equal(a.findings[0].delivered_by.member, "olive", `${label}: who delivered the finding`);
    assert.equal(a.document.attestor.member, "olive", `${label}: the case document's signer`);
    assert.equal(a.document.delivered_by.member, "olive", `${label}: and who delivered it`);
    const named = JSON.stringify({ ...a, document: { ...a.document, text: null } });
    assert.ok(!named.includes("mem-4821") && !named.includes("mem-7731"), `${label}: no member id among the names`);
    /* CONTROL: the same people are named as before, no more and none fewer, and the keys beside them are untouched. */
    assert.deepEqual(Object.keys(a.findings[0].attestor).sort(), ["key_b64", "member"]);
    assert.equal(a.findings[0].attestor.key_b64.length > 0, true);
    assert.equal(a.findings[0].delivered_by.kind, "member");
  }
  /* the signed bytes are served as signed: the document's own text still says whom it says */
  assert.ok(w.read("publishedcase", { id: F }).document.text.includes("author: member:olive"));
});

test("R41 (3) the founder, who holds no handle, is named by the design's word and never by her id; a value that is no member stays as it is", async () => {
  const members = { memberFacts: (id) => (id === "admin" ? { cover: null, handle: null, role: "admin", status: "active" } : null) };
  const { w } = await evidenceWorld({ members, ids: { writer: "admin", publisher: "admin" } });
  const a = w.read("publishedcase", { id: F });
  assert.equal(a.completeness.author, word("member.founder.unnamed"));
  assert.equal(a.findings[0].attestor.member, word("member.founder.unnamed"));
  assert.ok(!JSON.stringify(a.findings).includes('"admin"'));
  /* CONTROL: a value the roster knows no member by is not renamed (nothing is invented); a roster that cannot be read leaves
     no id on the page either: the member is named by the design's plain word. */
  const none = await evidenceWorld({ members: { memberFacts: () => null }, ids: { writer: "olive", publisher: "olive" } });
  assert.equal(none.w.read("publishedcase", { id: F }).findings[0].attestor.member, "olive");
  const down = await evidenceWorld({ members: { memberFacts: () => { throw new Error("roster down"); } }, ids: { writer: "olive", publisher: "olive" } });
  const d = down.w.read("publishedcase", { id: F });
  assert.equal(d.findings[0].attestor.member, word("shell.card.member"));
  assert.ok(!JSON.stringify(d.findings).includes('"olive"'));
});
