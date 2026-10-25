/* screens-publish, T51 fix round 4, C47 (the walker's CA36/CA38, "EVIDENCE lists the address, not the title or the paragraph"; K4427 (2), K4449 (1)):
 * the whole chain, run once and whole over the real modules. The member's act as the ceremony performs it (op=publish: case-authoring over
 * the real case-disclosures, which writes the document's `title` on the `materials:` row (R7, K4438), through the real case-grammar's writer
 * (R12's `title`, R17's passages)), the case signed and its finding published, then the outside reader's answer from the real public-read
 * (R41: the entry named by the title, else the address; the place the passage's), drawn by the real case page (R80, R76). No stand-in
 * for those four; the world is case-authoring's (the four plus publication, strength, inquiry, content, record on one host).
 * The signing key's ceremony (C51) is not this chain: the fixture's `ratify` commits the edition as op=caseratify does after its gate. */
import { registerDeclared } from "../../declared-ops.mjs";
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";
await registerDeclared(new URL("../../../../", import.meta.url).pathname, registerDeclaredOps);
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, press, tick, main, norm, word, ok, hasWord, drew, SCREENS } from "./fixtures.mjs";
import { world, V, AUTHORED } from "../case-authoring/fixture.mjs";
import { planeHelpers } from "../answer-envelope/fixtures.mjs";
import { stubOf, bucket, docketOn } from "../public-read/fixture.mjs";
import { publicReadOf } from "../../../src/public-read/index.mjs";
import { bindPublishedPlane, publishedRoutes } from "../../../src/publication/worker.mjs";
import { materialsOf, gradingFactsOf, passagesOf, publishedGraphEdges } from "../../../src/case-grammar/index.mjs";
import { reviewOf } from "../../../src/review/index.mjs";
import { canonicalJson } from "../../../src/record-grammar/index.mjs";
import { createHash } from "node:crypto";

const sha = (s) => createHash("sha256").update(s).digest("hex");
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({ ...planeHelpers, PUBLISHED_STORE: "bio" }); // answer-envelope's published helpers, as the plane binds them (fixtures-run by their provider)

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q";
const TITLE = `Document ${DOC}`;          /* the capture's title as the record holds it (infoMd): never the address */
const ADDRESS = `https://example.org/${DOC}`;
const ENC = (t) => new TextEncoder().encode(t);

/* The member's capture, a finding citing paragraph 4 (para 3, counted from zero) and paragraph 2 of it, a project, a draft asking for a new case. */
function chain() {
  const w = world(); w.member("alice");
  const a = w.graded(DOC);
  w.indexText(a, DOC, [{ text: "one" }, { text: "two" }, { text: "three" }, { text: "four" }]);
  const cid = (n) => sha(`passage ${n} of ${DOC}`);
  for (const n of [3, 1]) w.st.sql.exec(`INSERT INTO content (content_id, capture_sha, bundle_id, extent_kind, extent, ref, minted_by, at, stale)
    VALUES (?, ?, ?, 'doc-para', ?, ?, 'plane', '2026-01-01', 0)`, cid(n), a, DOC, canonicalJson({ kind: "doc-para", para: n }), `paragraph ${n + 1}`);
  w.finding(Q, [{ target: DOC, content_id: cid(3), grade: "B", grade_axis: "capture", grade_source: "capture" },
                { target: DOC, content_id: cid(1), grade: "B", grade_axis: "capture", grade_source: "capture" }]);
  const P = w.project("Team", "alice", [Q]);
  w.draft("DRAFT-C47", P, { ...AUTHORED, targets: [Q], roles: { [Q]: "load_bearing" }, newCase: true, selfAttested: [{ capture: a, reason: "I saved it myself." }] });
  const me = { viewer: V("alice"), author: "alice" };
  const r = reviewOf(w.host, { record: w.record, membership: w.membership, strength: w.strength, basisVersions: w.basisVersions, publication: w.publication,
    caseAuthoring: w.ca, caseInputs: w.ci, caseAccount: w.cacc, ratification: w.ratification, now: () => w.clock.ms });
  const plane = {
    image: ok({ "bundle.md": w.text(P) }),
    publishpreflight: (req) => ok(w.ca.publishPreflight({ ...req.body, ...me })),
    publish: (req) => ok(w.ca.publishCase({ ...req.body, ...me })),
    casedrafts: () => ok(r.list({ project: P, ...me })),
    reviewcopy: () => ok(r.copy({ draft: "DRAFT-C47", viewer: V("alice") })),
  };
  return { w, P, a, plane };
}

/* the outside reader: public-read over the same host, the case and its finding published, asked as the Worker asks it */
async function reader(w, caseId) {
  const pr = publicReadOf(w.host, { publication: w.publication, docket: docketOn() });
  const doc = w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=1`, caseId).text;
  const fm = w.fm(doc);
  w.ratify({ caseId, edition: 1 });
  const pin = w.head(Q), text = w.text(Q);
  const fin = w.record.transact(() => w.publication.commitEdition({ bundleId: Q, bundleSha: pin, edition: undefined, title: "A finding", completeness: null, strength: null,
    memberCarriesBlocks: false, group: "test-group", edges: publishedGraphEdges(w.fm(Q)), shas: [{ sha256: pin, path: "bundle.md", kind: "bundle", bytes: Buffer.byteLength(text) }],
    attestorKey: "key-1", attestorMember: "alice", gateVersion: "plane-gate/test", sigArmored: "sig-finding", deliveredBy: "founder", at: "2026-09-28T02:00:00Z" }));
  assert.equal(fin && fin.ok !== false, true, `the finding published: ${JSON.stringify(fin).slice(0, 200)}`);
  const env = { PUBLISHED: bucket() };
  env.PUBLISHED.m.set(`bio/published/${pin}`, ENC(text));
  const url = new URL("https://plane/?op=publishedcase");
  url.searchParams.set("id", caseId);
  const answer = await (await publishedRoutes({ op: "publishedcase", url, env, stub: stubOf({ p: w.publication, pr }) })).json();
  return { fm, doc, answer };
}


const STATES = ["being_prepared", "retrying", "stopped", "waiting_on_members"];
const CODES = ["NO_BUCKET", "STORE_SILENT", "MATERIAL_MISSING", "FINDING_MISSING", "BUCKET_FAILED", "NOT_RECORDED", "INTERRUPTED", "TOO_LARGE", "UNKNOWN"];
const dl = (page) => main(page).querySelectorAll('button[data-act="publishedcase"]').filter((b) => b.textContent.includes(word("screen.published.download")));

/* the real chain: a complete, signed, published edition whose case file was never built (manifest_sha null, the 4783 shape) */
async function edition() {
  const { w, P, plane } = chain();
  const cer = await open(`/app/ceremony/${P}/DRAFT-C47`, { plane });
  tick(cer, "ce-tie", "yes");
  await press(cer, "publish", { reason: "because" });
  const { case_id: caseId } = w.row(`SELECT case_id FROM case_documents ORDER BY rowid DESC LIMIT 1`);
  const { answer } = await reader(w, caseId);
  return { caseId, answer };
}
const pageOf = (caseId, answer) => open(`/app/published/${encodeURIComponent(caseId + "/1")}`, { boot: { session: null }, plane: { publishedcase: ok(answer) } });

test("R22 G54 (public-read R23 seam) a complete edition from the real publishedcase with no case file states a case_file; red until public-read answers it", async () => {
  const { answer } = await edition();
  assert.ok(!answer.manifest_sha, "complete, signed, no case file");
  assert.ok(answer.case_file && typeof answer.case_file.state === "string", `publishedcase answers case_file: ${JSON.stringify(Object.keys(answer))}`);
  assert.equal(answer.case_file.state, "being_prepared");
});

test("R22 G54 (screens-publish) a complete edition with no built case file draws its state's and its code's sentence by key where the download is not drawn, and the verify press answers them, sending nothing", async () => {
  const { caseId, answer } = await edition();
  for (const state of STATES) for (const code of state === "retrying" || state === "stopped" ? CODES : [null]) {
    const cf = { state, code, attempted_at: "2026-10-22T13:40:00Z", attempts: 2 };
    const p = await pageOf(caseId, { ...answer, case_file: cf });
    const m = main(p);
    const s = m.querySelector(`[data-casefile="${state}"]`);
    assert.ok(s, `${state}: its sentence is drawn`);
    if (hasWord(`screen.published.casefile.${state}`)) assert.equal(norm(s.textContent), word(`screen.published.casefile.${state}`));
    if (code) assert.ok(m.querySelector(`[data-casefile-code="${code}"]`), `${state}/${code}: its code is drawn`);
    assert.equal(dl(p).length, 0, `${state}: no download button`);
    const before = p.byOp("verify").length;
    await press(p, "verify");
    assert.equal(p.byOp("verify").length, before, "nothing is sent");
    assert.ok(!norm(main(p).textContent).includes(word("screen.published.verify.none")), `${state}: not "nothing to check"`);
    assert.ok(main(p).querySelector('[data-said="verify"] [data-casefile]'), `${state}: the press answers it`);
  }
  // fixtures-generic: NOT_A_CODE (a code no module gives: the page draws a bare code for a case-file code it holds no word for)
  const q = await pageOf(caseId, { ...answer, case_file: { state: "retrying", code: "NOT_A_CODE" } });
  assert.ok(main(q).querySelector('[data-casefile-code="NOT_A_CODE"]'), "an unknown code is drawn bare, never English");
  const v = await pageOf(caseId, { ...Object.fromEntries(Object.entries(answer).filter(([k]) => k !== "case_file")), verification: { case_file: { state: "stopped", code: "MATERIAL_MISSING" } } });
  assert.ok(main(v).querySelector('[data-casefile="stopped"]'), "verification.case_file is read too");
});

test("R22 G54 controls: a built case file, or an edition with a manifest, is drawn as today; an answer stating no case_file draws no sentence", async () => {
  const { caseId, answer } = await edition();
  const sha = "a".repeat(64);
  const built = await pageOf(caseId, { ...answer, manifest_sha: sha, case_file: { state: "built", code: null } });
  assert.equal(main(built).querySelector("[data-casefile]"), null);
  assert.equal(dl(built).length, 1, "the download is offered");
  const retried = await pageOf(caseId, { ...answer, manifest_sha: sha, case_file: { state: "retrying", code: "NO_BUCKET" } });
  assert.equal(main(retried).querySelector("[data-casefile]"), null, "a manifest is there: unchanged");
  const none = await pageOf(caseId, { ...Object.fromEntries(Object.entries(answer).filter(([k]) => k !== "case_file")), verification: { container: null } });
  assert.equal(main(none).querySelector("[data-casefile]"), null);
  await press(none, "verify");
  assert.ok(drew(none, "screen.published.verify.none"), "today's answer when nothing is stated");
});

test("R24 G54 the thirteen casefile keys are listed by published and are words", () => {
  const listed = SCREENS.find((s) => s.id === "published").words;
  for (const k of [...STATES.map((s) => `screen.published.casefile.${s}`), ...CODES.map((c) => `screen.published.casefile.code.${c}`)]) {
    assert.ok(listed.includes(k), `${k} listed`);
    assert.ok(hasWord(k), `${k} is a word (the row is owed: red by name until it exists)`);
  }
});
