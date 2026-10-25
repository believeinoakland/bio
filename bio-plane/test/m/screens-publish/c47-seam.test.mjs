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
import { open, press, tick, main, norm, word, ok } from "./fixtures.mjs";
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

test("R80 R76 C47 (case-disclosures R7 + case-grammar R12 + public-read R41 + screens-publish R80/R76) from a member's capture, through the ceremony's publish act, the signed case and the outside reader's answer, to the published page: the entry is named by the document's title and 'Paragraph 4', never the address, and the role line carries no stray dot", async () => {
  const { w, P, plane } = chain();

  /* the member's act, as the ceremony performs it: the page's own Publish press, through case-authoring over the real case-disclosures */
  const cer = await open(`/app/ceremony/${P}/DRAFT-C47`, { plane });
  tick(cer, "ce-tie", "yes");
  await press(cer, "publish", { reason: "because" });
  const { case_id: caseId } = w.row(`SELECT case_id FROM case_documents ORDER BY rowid DESC LIMIT 1`);
  assert.ok(caseId, "the page's act prepared a case edition through the real act");

  const { fm, doc, answer } = await reader(w, caseId);

  /* case-disclosures R7 wrote the title, case-grammar R12 carried it in the signed bytes (the row still reads back) */
  const row = materialsOf(fm).materials.find((m) => m.ref === DOC);
  assert.equal(row.title, TITLE, "R7/R12: the signed materials row carries the capture's title");
  assert.equal(row.origin, ADDRESS);
  assert.notEqual(row.title, row.origin, "the title is not the address");
  /* ... and the passages (R17) carry the cited paragraphs */
  const places = passagesOf(fm)[Q].map((p) => (typeof p.extent === "string" ? JSON.parse(p.extent) : p.extent)).map((e) => e.para).sort();
  assert.deepEqual(places, [1, 3], "R17: the passages state the cited paragraphs, counted from zero");
  assert.ok(Object.keys(gradingFactsOf(fm)).includes(Q) && doc.includes(TITLE));

  /* public-read R41: the entry's name is the title, its place the passage's extent */
  const f = answer.findings.find((x) => x.bundle_id === Q);
  assert.ok(f, `the published finding is among the answer's: ${JSON.stringify(Object.keys(answer))}`);
  const named = f.basis.map((l) => l.document);
  assert.ok(named.every((d) => d && d.name === TITLE), `R41: named by the title, not the address: ${JSON.stringify(named)}`);
  assert.deepEqual(named.map((d) => d.place && d.place.para).sort(), [1, 3], "R41: the place is the passage's signed extent (an object with para), counted from zero");
  assert.ok(!JSON.stringify(f.basis).includes(ADDRESS), "no address among the names");

  /* screens-publish R80 R76: the outside reader's page draws what the real chain gave */
  const page = await open(`/app/published/${encodeURIComponent(caseId + "/1")}`, { boot: { session: null }, plane: { publishedcase: ok(answer) } });
  const names = [...main(page).querySelectorAll("[data-evidence-names] li")].map((li) => norm(li.textContent));
  assert.equal(names.length, 2, "two entries of one document, told apart");
  assert.ok(names.every((n) => n.includes(TITLE)), `the document's title: ${JSON.stringify(names)}`);
  assert.ok(names.some((n) => n.includes(word("screen.question.leg.paragraph", { n: "4" }))), "Paragraph 4, counted from the zero of the file");
  assert.ok(names.some((n) => n.includes(word("screen.question.leg.paragraph", { n: "2" }))));
  assert.ok(names.every((n) => !n.includes("example.org") && !n.includes("https://")), "the address is not drawn as the name");
  for (const p of main(page).querySelectorAll("[data-finding] p")) {
    const t = norm(p.textContent);
    assert.ok(!/(^|\s)·\s*$/.test(t) && !/·\s*·/.test(t), `no stray separator: ${t}`);
  }
});
