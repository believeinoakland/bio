/* screens-publish, T51 fix round 4 (K4429), the seam tests: the page's own act into the real merged provider, no scripted double of it.
 * C28 (R9): "Hand it over" through the page into the real doorbell, and the Inbox list the real doorbell answers. */
import { registerDeclared } from "../../declared-ops.mjs";
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";
await registerDeclared(new URL("../../../../", import.meta.url).pathname, registerDeclaredOps);
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, press, choose, until, last, ok } from "./fixtures.mjs";
import { fresh, bucket } from "../doorbell/fixture.mjs";
import { planeHelpers } from "../answer-envelope/fixtures.mjs";
import { doorbellOps } from "../../../src/doorbell/index.mjs";
import { knockOp } from "../../../src/doorbell/door.mjs";

const { json, doAnswer } = planeHelpers;
const helpers = planeHelpers; // answer-envelope's published helpers, as the plane binds them (fixtures-run by their provider)

/* the real doorbell behind the page's `knock`: the control plane's own door handler over the module's store routes */
function doorbell() {
  const f = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "inst" } });
  const store = { async fetch(req) {
    const url = new URL(req.url), body = req.method === "POST" ? JSON.parse(await req.text() || "null") : null;
    return json({ ok: true, result: await doorbellOps(f.c, url, body)[url.pathname.slice(1)]() });
  } };
  let n = 0;
  const knock = async (req) => {
    const res = await knockOp(new Request("https://plane/?op=knock", { method: "POST", headers: { "cf-connecting-ip": `203.0.113.${++n}` }, body: JSON.stringify(req.body) }), f.c.env, store, helpers);
    return { status: res.status, json: await res.json() };
  };
  return { f, knock };
}
const PUBLIC = { session: null };

test("R9 C28 through the page into the real doorbell, a JPEG named notice.jpg is handed in and the Inbox row carries file_name and media_type image/jpeg; the detail carries them too", async () => {
  const d = doorbell();
  const p = await open("/app/doorbell", { boot: PUBLIC, plane: { knock: d.knock } });
  choose(p, "db-file", new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]), "notice.jpg", "image/jpeg");
  await press(p, "knock");
  await until(p, () => d.f.c.inboxList(null).inbox.length > 0);
  const sent = last(p, "knock").body;
  assert.equal(sent.fileName, "notice.jpg");
  assert.equal(sent.mediaType, "image/jpeg");
  const id = d.f.c.inboxList(null).inbox[0];
  assert.equal(id.file_name, "notice.jpg");
  assert.equal(id.media_type, "image/jpeg");
  const got = d.f.c.inboxGet(id.knock_id).item;
  assert.deepEqual([got.file_name, got.media_type], ["notice.jpg", "image/jpeg"]);
});

test("R9 C28 control: a file that states no type sends no mediaType, and the row's type is absent (null)", async () => {
  const d = doorbell();
  const p = await open("/app/doorbell", { boot: PUBLIC, plane: { knock: d.knock } });
  choose(p, "db-file", new Uint8Array([1, 2, 3]), "memo.bin");
  await press(p, "knock");
  await until(p, () => d.f.c.inboxList(null).inbox.length > 0);
  const sent = last(p, "knock").body;
  assert.equal(sent.fileName, "memo.bin");
  assert.ok(!("mediaType" in sent));
  assert.equal(d.f.c.inboxList(null).inbox[0].media_type, null);
});

/* ---------- C47 (R80, R76): the evidence entry names the document and the paragraph; no stray separator ---------- */
import { main, text, drew, drewIn, FINDING, publishedPlane, findingPath, leg, word, C } from "./fixtures.mjs";

test("R80 R76 C47 the case page names an evidence entry by the document's title and the paragraph it cites, and a finding stating only its role draws no trailing separator", async () => {
  const f = FINDING("FND-2026-0031", { strength: [], standing: { role: "load_bearing", bar: null, meets: null },
    basis: [leg("INFO-2026-0004", "supports", "B", "capture", { document: { name: "FOIA frequently asked questions", place: { kind: "doc-para", para: 3 } } }),
      leg("INFO-2026-0005", "supports", "B", "capture", { document: { name: "FOIA frequently asked questions", place: { kind: "pdf-page", page: 1 } } })] });
  const p = await open(`/app/published/${encodeURIComponent(C + "/2")}`, { boot: PUBLIC, plane: publishedPlane([f]) });
  const names = [...main(p).querySelectorAll("[data-evidence-names] li")].map((li) => li.textContent.replace(/\s+/g, " ").trim());
  assert.equal(names.length, 2);
  assert.ok(names[0].includes("FOIA frequently asked questions") && names[0].includes(word("screen.question.leg.paragraph", { n: "4" })), "Paragraph 4, counted from the zero of the file");
  assert.ok(names[1].includes(word("screen.document.passage.where", { page: "2" })), "a page of a PDF is still a page");
  const card = main(p).querySelectorAll("[data-finding] p")[1].textContent.replace(/\s+/g, " ").trim();
  assert.equal(card, word("case-grammar.load_bearing"), "the role alone, no trailing separator");
});

test("R80 C47 control: a finding that states its role and both grades keeps the separator between the role and the grades only", async () => {
  const p = await open(`/app/published/${encodeURIComponent(C + "/2")}`, { boot: PUBLIC, plane: publishedPlane([FINDING("FND-2026-0031")]) });
  const card = main(p).querySelectorAll("[data-finding] p")[1].textContent.replace(/\s+/g, " ").trim();
  assert.ok(card.startsWith(word("case-grammar.load_bearing") + " · ") && !/·\s*$/.test(card));
});

/* ---------- C46 (R75, R61): a concluded question, concluded by the real `conclude` and by a project's adoption, through the real review ---------- */
import { world, V, readingLines, currentLines } from "../case-authoring/fixture.mjs";
import { reviewOf } from "../../../src/review/index.mjs";
import { sha as shaOf } from "../review/fixture.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-what-does-the-federal-freedom", OWN = "INQ-2026-0002-o";
const CLAIM = "Federal agencies must disclose requested records unless one of nine exemptions applies.";
const OWN_WORDS = "The agency answered inside the statutory twenty days.";
const SECRET = "SECRET-C46";
function chain() {
  const w = world({ provider: false });
  w.member("alice");
  w.doc(DOC);
  for (const q of [Q, OWN]) w.finding(q, [{ target: DOC }], { state: "open", lines: readingLines("first", [DOC], q === OWN ? OWN_WORDS : CLAIM) });
  const P = w.project("Team", "alice", [Q, OWN], { extra: [...currentLines(Q), ...currentLines(OWN).slice(1)] });
  const r = reviewOf(w.host, { record: w.record, membership: w.membership, strength: w.strength, basisVersions: w.basisVersions, publication: w.publication,
    caseAuthoring: w.ca, caseInputs: w.ci, caseAccount: w.cacc, ratification: w.ratification, now: () => w.clock.ms });
  const conclude = (o) => w.basisVersions.conclude({ author: "alice", viewer: V("alice"), identity: V("alice"), ...o });
  assert.equal(conclude({ target: Q, project: P, falsifier: "A court order holding an exemption applies to every record." }).ok, true);
  assert.equal(conclude({ target: OWN, conclusion: OWN_WORDS, falsifier: "A clerk's log dating the answer later.", version: "first" }).ok, true);
  const d = r.act({ act: "draft", author: "alice", project: P, targets: [Q, OWN] });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 200));
  assert.equal(r.act({ act: "grant", author: "alice", draft: d.draftId, recipient: "Reader", secretSha: shaOf(SECRET) }).ok, true);
  const plane = {
    image: ok({ "bundle.md": w.text(P) }),
    casedrafts: ok({ kind: "review-drafts", project: P, drafts: [{ draft_id: d.draftId, case: { case_id: null }, created_by: "alice", updated_by: "alice" }] }),
    reviewcopy: (req) => ok(req.body && req.body.secret ? r.copy({ secretSha: shaOf(req.body.secret), bySecret: true }) : r.copy({ draft: d.draftId, viewer: V("alice") })),
  };
  return { P, d, plane, r, V };
}

test("R75 R61 C46 the case editor and the outside reader draw a question concluded by a project's adoption and one concluded by `conclude` in the conclusion's words, never 'Not concluded yet'; the cites list names the question by its title", async () => {
  const { P, d, plane } = chain();
  const ed = await open(`/app/case-editor/${P}/${d.draftId}`, { plane });
  const rows = text(ed);
  assert.ok(rows.includes(CLAIM) && rows.includes(OWN_WORDS), "both conclusions drawn in their words at the editor");
  const out = await open("/app/review", { boot: { session: null, hash: "#grant=" + SECRET }, plane });
  const t = text(out);
  assert.ok(t.includes(CLAIM) && t.includes(OWN_WORDS), "and to the outside reader");
  for (const [who, page] of [["editor", ed], ["reader", out]]) {
    assert.ok(!drew(page, "review.index.not_concluded_yet"), `${who}: not drawn as not concluded yet`);
    assert.ok(!/(^|\s)## /.test(text(page)), `${who}: no heading marks`);
  }
});

test("R75 C46 the passages the case cites are named by the question's title, never its id (the walker's list), and a cited target that is no finding keeps its id (control)", async () => {
  const { P, d, plane } = chain();
  const md = ["---", `id: ${P}`, "title: Team", "references:", `  - target: ${Q}`, "    rel: cites", "    status: live", "  - target: INFO-2026-0099", "    rel: cites", "    status: live", "---", ""].join("\n");
  const ed = await open(`/app/case-editor/${P}/${d.draftId}`, { plane: { ...plane, image: ok({ "bundle.md": md }) } });
  const cited = [...main(ed).querySelectorAll("[data-cited]")].map((e) => [e.getAttribute("data-cited"), e.textContent.trim()]);
  const title = JSON.parse(JSON.stringify(plane.reviewcopy({ body: {} }).json.result)).findings.find((f) => f.target === Q).title;
  assert.ok(title && title !== Q, "the real review states the question's title");
  assert.deepEqual(cited, [[Q, title], ["INFO-2026-0099", "INFO-2026-0099"]]);
});

/* ---------- C48 / N6 (R80, R70, R71, R77): prepared and published, read from the record, in a fresh page ---------- */
import { AUTHORED } from "../case-authoring/fixture.mjs";
import { tick, ops } from "./fixtures.mjs";
function prep() {
  const w = world({ provider: false });
  w.member("alice");
  w.doc(DOC);
  w.finding(Q, [{ target: DOC }], { state: "open", lines: readingLines("first", [DOC], CLAIM) });
  const P = w.project("Team", "alice", [Q], { extra: currentLines(Q) });
  assert.equal(w.basisVersions.conclude({ author: "alice", viewer: V("alice"), identity: V("alice"), target: Q, project: P, falsifier: "A court order." }).ok, true);
  w.draft("DRAFT-N", P, { ...AUTHORED, targets: [Q], roles: { [Q]: "load_bearing" }, newCase: true });
  const r = reviewOf(w.host, { record: w.record, membership: w.membership, strength: w.strength, basisVersions: w.basisVersions, publication: w.publication,
    caseAuthoring: w.ca, caseInputs: w.ci, caseAccount: w.cacc, ratification: w.ratification, now: () => w.clock.ms });
  const me = { viewer: V("alice"), author: "alice" };
  const plane = {
    image: ok({ "bundle.md": w.text(P) }),
    casedrafts: () => ok(r.list({ project: P, ...me })),
    reviewcopy: () => ok(r.copy({ draft: "DRAFT-N", viewer: V("alice") })),
    publishpreflight: (req) => ok(w.ca.publishPreflight({ ...req.body, ...me })),
    publish: (req) => ok(w.ca.publishCase({ ...req.body, ...me })),
    /* the door's answer: the document, and beside it the statement to sign (publication door, THE STATEMENT TO SIGN) */
    casedocument: (req) => { const d = w.publication.caseDocument(req.query.case, Number(req.query.edition), V("alice"));
      return ok(d && d.ok ? { ...d, sign: { namespace: "bio-ratify", statement: `bio-ratify-case ${d.case_id} ${d.edition} ${d.doc_sha}\n` } } : d); },
    publishedcase: () => ({ status: 200, json: { ok: true, result: { ok: false, reason: "NOT_PUBLISHED", code: "NOT_PUBLISHED" } } }),
  };
  return { w, P, plane };
}
const CER2 = (P) => `/app/ceremony/${P}/DRAFT-N`;

test("R80 R70 C48 a draft that asks for a new case, prepared through the real act, is 'Edition 1 is prepared' in a fresh page, with no reasons that stop the signing beside it (the walker's reload)", async () => {
  const { P, plane } = prep();
  const first = await open(CER2(P), { plane });
  tick(first, "ce-tie", "yes");
  await press(first, "publish", { reason: "because" });
  assert.ok(drew(first, "screen.ceremony.prepared", { edition: "1" }), "prepared, in the page that prepared it");
  const again = await open(CER2(P), { plane });
  assert.ok(drew(again, "screen.ceremony.prepared", { edition: "1" }), "and in a fresh page, from the record alone");
  assert.equal(again.root().querySelector("[data-blockers]"), null, "no reasons that stop the signing beside a prepared edition");
  assert.ok(ops(again).includes("caseratify") || again.root().querySelector("[data-act=caseratify],[data-phone]"), "and Sign is offered");
});

test("R80 R71 C48 N6 once edition 1 is signed, the ceremony and the case editor say 'Published: edition 1' and link the case page's route; the editor never says it names no case yet", async () => {
  const { w, P, plane } = prep();
  const done = w.ca.publishCase({ ...AUTHORED, project: P, draft: "DRAFT-N", viewer: V("alice"), author: "alice", tieAttested: true });
  assert.equal(done.ok, true, JSON.stringify(done).slice(0, 200));
  w.ratify(done);
  const href = "/app/published/" + encodeURIComponent(done.caseId + "/1");
  for (const path of [CER2(P), `/app/case-editor/${P}/DRAFT-N`, `/app/review-copy/${P}/DRAFT-N`]) {
    const p = await open(path, { plane });
    assert.ok(drew(p, "screen.ceremony.published.edition", { n: "1" }), path);
    assert.ok(main(p).querySelector(`a[href="${href}"]`), `${path}: the link is the case page's route`);
    assert.ok(!drew(p, "review.body.nocase"), `${path}: never 'names no case yet'`);
  }
});

/* ---------- E4 (fix round 5; R13, R70, R77, C48): a reloaded ceremony signs what the edition pins ---------- */
import { keptKey, answerSign } from "./fixtures.mjs";
const planeFor = (base, asked) => ({ ...base, caseratify: (req) => { asked.push(req); return ok({ caseId: req.body.caseId, edition: req.body.edition, sitting: [] }); } });
const rosterOfDocument = (w, caseId, edition) => w.fm(w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, caseId, edition).text).case_roles;

test("R13 R70 R77 C48 E4 a ceremony reloaded after 'Edition 1 is prepared' counts the edition and its finding, and signs the finding with the edition (the walker's 'signs all 1: the edition and its 0 findings')", async () => {
  const { w, P, plane } = prep();
  const first = await open(CER2(P), { plane });
  tick(first, "ce-tie", "yes");
  await press(first, "publish", { reason: "because" });
  const caseId = w.row(`SELECT case_id FROM case_documents`).case_id;
  const pinned = rosterOfDocument(w, caseId, 1);
  assert.equal(pinned.length, 1, "the real prepared document pins the finding");
  const asked = [];
  const again = await open(CER2(P), { boot: { idb: await keptKey() }, plane: planeFor(plane, asked) });
  assert.ok(drew(again, "screen.ceremony.signs.count", { n: "3", findings: "1", evidence: "1" }), "the edition, its one finding and the document it rests on, after the reload");
  assert.equal(again.root().querySelector("[data-roster-unread]"), null, "nothing is unreadable");
  assert.deepEqual(main(again).querySelectorAll("[data-statement]").map((li) => li.getAttribute("data-statement")), ["case", "finding", "evidence"]);
  await press(again, "caseratify");
  await answerSign(again, true, "caseratify");
  const sent = last(again, "caseratify").body;
  assert.deepEqual(sent.members.map((m) => [m.id, m.sha]), [[Q, pinned[0].version_sha], [DOC, w.record.head(DOC).bundleSha]], "the finding is signed with the edition, with the sha the document pins, and the document at its head");
  assert.equal(sent.members[0].signature.length > 0, true);
});

test("R13 R70 E4 control: the same flow with no reload counts and signs the same; the page that prepared it and the reloaded page send the same sitting", async () => {
  const { w, P, plane } = prep();
  const asked = [];
  const same = await open(CER2(P), { boot: { idb: await keptKey() }, plane: planeFor(plane, asked) });
  tick(same, "ce-tie", "yes");
  await press(same, "publish", { reason: "because" });
  assert.ok(drew(same, "screen.ceremony.signs.count", { n: "3", findings: "1", evidence: "1" }));
  await press(same, "caseratify");
  await answerSign(same, true, "caseratify");
  const a = last(same, "caseratify").body;
  const again = await open(CER2(P), { boot: { idb: await keptKey() }, plane: planeFor(plane, asked) });
  await press(again, "caseratify");
  await answerSign(again, true, "caseratify");
  const b = last(again, "caseratify").body;
  assert.deepEqual(b.members.map((m) => [m.id, m.sha]), a.members.map((m) => [m.id, m.sha]));
  assert.equal(b.expectedSha, a.expectedSha);
});

test("R13 R77 E4 control: a draft whose roster cannot be read (the document states none) refuses to sign in words, and nothing is sent", async () => {
  const { P, plane } = prep();
  const first = await open(CER2(P), { plane });
  tick(first, "ce-tie", "yes");
  await press(first, "publish", { reason: "because" });
  const asked = [];
  const blind = { ...planeFor(plane, asked), casedocument: (req) => { const r = plane.casedocument(req); const { findings, ...rest } = r.json.result; return ok(rest); } };
  const again = await open(CER2(P), { boot: { idb: await keptKey() }, plane: blind });
  assert.ok(again.root().querySelector("[data-roster-unread]"), "said before the press");
  await press(again, "caseratify");
  await until(again, () => drew(again, "screen.ceremony.sign.nodoc"));
  assert.ok(drew(again, "screen.ceremony.sign.nodoc"));
  assert.equal(again.byOp("caseratify").length, 0, "nothing sent");
  assert.equal(signDialog(again), null, "and no signing was asked of the key");
});
import { signDialog } from "./fixtures.mjs";

test("R73 C49 G12c (fix round 6, seam) the ceremony of a project with four drafts reads the real review's batch once for the three others, each named by the scope its own copy states", async () => {
  const { P, d, plane, r, V: view } = chain();
  const made = [d];
  for (const scope of ["Second scope", "Third scope", "Fourth scope"]) {
    const x = r.act({ act: "draft", author: "alice", project: P, targets: [Q], scope });
    assert.equal(x.ok, true, JSON.stringify(x).slice(0, 200));
    made.push(x);
  }
  const ids = made.map((x) => x.draftId);
  const p = await open(`/app/ceremony/${P}/${ids[3]}`, { plane: { ...plane,
    casedrafts: ok({ kind: "review-drafts", project: P, drafts: ids.map((id, i) => ({ draft_id: id, case: { case_id: null }, created_by: "alice", updated_by: "alice", created_at: `2026-10-0${i + 1}T10:00:00Z` })) }),
    reviewcopy: (req) => ok(req.query.drafts ? r.copyMany({ drafts: req.query.drafts, viewer: view("alice") }) : r.copy({ draft: req.query.draft, viewer: view("alice") })) } });
  assert.equal(p.byOp("reviewcopy").length, 2, "the draft shown, and one batch for the rest");
  const batch = p.byOp("reviewcopy").filter((q) => q.query.drafts);
  assert.equal(batch.length, 1);
  assert.deepEqual(batch[0].query.drafts.split(",").sort(), ids.slice(0, 3).sort());
  const labels = p.doc.getElementById("drafts-ceremony").querySelectorAll("option").map((o) => o.textContent);
  for (const scope of ["Second scope", "Third scope", "Fourth scope"]) assert.ok(labels.some((t) => t.includes(scope)), scope);
});

/* ---------- G29 (fix round 6; R13; K4607, K4609): the evidence a case rests on is signed with the edition, at the document's head ---------- */
test("R13 G29 (seam) the real cite, conclude and prepare: the ceremony signs a line for the cited document at its head `bundle_sha` (what ratification verifies, R4/R52), beside the finding's; RED BY NAME until case-authoring's rows carry `bundle_sha` (K4609)", async () => {
  const { w, P, plane } = prep();
  const first = await open(CER2(P), { plane });
  tick(first, "ce-tie", "yes");
  await press(first, "publish", { reason: "because" });
  const caseId = w.row(`SELECT case_id FROM case_documents`).case_id;
  const rows = w.fm(w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, caseId, 1).text).case_citations;
  const head = w.record.head(DOC).bundleSha;
  assert.match(head, /^[0-9a-f]{64}$/);
  const row = rows.find((r) => r.target === DOC);
  assert.ok(row, "the cited document is a row");
  assert.equal(row.bundle_sha, head, "the row carries the document's head (case-authoring, K4609)");
  const asked = [];
  const again = await open(CER2(P), { boot: { idb: await keptKey() }, plane: planeFor(plane, asked) });
  assert.deepEqual(main(again).querySelectorAll("[data-statement]").map((li) => li.getAttribute("data-statement")), ["case", "finding", "evidence"]);
  await press(again, "caseratify");
  await answerSign(again, true, "caseratify");
  const sent = last(again, "caseratify").body;
  assert.ok(sent.members.some((m) => m.id === DOC && m.sha === head), "the document is signed at its head, not at its capture");
});
