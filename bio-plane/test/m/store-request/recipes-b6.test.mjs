/* store-request R19 (STORE-REQUEST #3, B6 START; SCREENS-INQUIRY #29 J42, op-tables §5.3): the recipes the screens' jobs need to make states by real
   acts through the world's door: a held web page and a held PDF whose readings carry text units; a question with legs; a contradiction candidate
   proposed over a pair the pairing forms; a captured request for a real set-aside; many questions in a project. Each answers what its acts answered. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "./fixtures.mjs";

const member = async (w, handle = "ann") => w.signIn(handle, { capabilities: ["contribute", "create_projects"] });

test("R19 recipes.page and recipes.pdf hold a file whose reading carries text units; a question promotes legs at a paragraph, a page and a footnote over them, and the same legs over a text/plain hold are refused CONTENT_EXTENT_NO_CHAIN", async () => {
  const w = await storeWorld();
  const ann = await member(w);
  const project = await w.recipes.project(ann, "Stormwater");
  const page = await w.recipes.page(ann, "Council minutes", { paragraphs: ["The council met on Tuesday.", "The vote was five to two."], footnotes: ["Footnote text."], project });
  const pdf = await w.recipes.pdf(ann, "Annual report", { pages: 3, lines: 4, project });
  const plain = await w.recipes.hold(ann, "Plain note", "The council met.\n\nThe vote was five to two.\n", project, { read: true });

  const pageReading = await ann.read("reading", { query: { sha256: page.sha } });
  assert.equal(pageReading.found, true);
  assert.ok(pageReading.text_provenance.chain.length > 0, "the web page's reading holds an extraction chain");
  assert.equal(pageReading.reading.text_container, "html");
  assert.ok(pageReading.reading.container_extent.paragraphs >= 3, "its paragraphs are units: " + JSON.stringify(pageReading.reading.container_extent));
  const pdfReading = await ann.read("reading", { query: { sha256: pdf.sha } });
  assert.equal(pdfReading.found, true);
  assert.ok(pdfReading.text_provenance.chain.length > 0, "the PDF's reading holds an extraction chain");
  assert.equal(pdfReading.reading.page_count, 3);

  const legs = [
    { target: page.bundle, role: "supports", extent_kind: "doc-para", extent_para: 1 },
    { target: pdf.bundle, role: "supports", extent_kind: "pdf-page", extent_page: 1 },
    { target: page.bundle, role: "supports", extent_kind: "doc-part", extent_part: "word/footnotes.xml", extent_ref: "footnote 1" },
  ];
  const q = await w.recipes.question(ann, project, { legs });
  assert.deepEqual(q.content.map((c) => c.extent_kind), ["doc-para", "pdf-page", "doc-part"]);
  assert.deepEqual(q.content.map((c) => c.target), [page.bundle, pdf.bundle, page.bundle]);

  await assert.rejects(() => w.recipes.question(ann, project, { legs: [{ target: plain.bundle, role: "supports", extent_kind: "doc-para", extent_para: 1 }] }),
    /CONTENT_EXTENT_NO_CHAIN/, "control: a text/plain hold has no chain to address");
});

test("R19 recipes.hold with a type and read: true holds a web page's bytes as a file whose reading is held; without read the file is held unread, as before", async () => {
  const w = await storeWorld();
  const ann = await member(w);
  const html = "<html><head><title>Notice</title></head><body><p>First.</p><p>Second.</p></body></html>";
  const unread = await w.recipes.hold(ann, "Notice", html, "", { type: "text/html" });
  assert.equal(unread.read, undefined);
  assert.equal((await ann.read("reading", { query: { sha256: unread.sha } })).found, false, "held and not read");
  const read = await w.recipes.hold(ann, "Notice read", html + "\n", "", { type: "text/html", read: true });
  assert.equal(read.read.ok, true);
  assert.equal((await ann.read("reading", { query: { sha256: read.sha } })).found, true);
  const old = await w.recipes.hold(ann, "Old way", "The council met.");
  assert.deepEqual(Object.keys(old).sort(), ["bundle", "sha"], "the four-argument call answers what it answered");
});

test("R19 recipes.contradiction makes a contradiction candidate by real acts: a team key, an open run, two projects' documents, a question resting on both, the pair the pairing forms, proposed over; contradictioncandidates reads it", async () => {
  const w = await storeWorld({ ai: true });
  const founder = await w.signIn("admin");
  const made = await w.recipes.contradiction(founder);
  assert.equal(made.projects.length, 2);
  assert.notEqual(made.projects[0], made.projects[1]);
  const read = await founder.read("contradictioncandidates", { query: { inquiry: made.inquiry } });
  assert.equal(read.candidates.length, 1);
  const c = read.candidates[0];
  assert.equal(c.candidate, made.candidate);
  assert.equal(c.key, "K1");
  assert.equal(c.state, "open");
  assert.equal(c.weight, "duty");
  assert.equal(c.machine.run, made.run);
  assert.equal(c.machine.label, "record");
  assert.deepEqual([c.a.target, c.b.target].sort(), [...made.documents].sort());
  const run = await founder.read("airun", { query: { run: made.run } });
  assert.equal(run.session.status, "running");
  assert.equal(run.session.principal.plane, "member:admin");
  const facts = await founder.read("contradictionfacts", { query: { candidate: made.candidate } });
  assert.equal(facts.ok, true);
  assert.equal(facts.candidate, made.candidate);
  /* the documents are two projects' own */
  const homes = await Promise.all(made.documents.map(async (d) => (await founder.read("image", { query: { id: d } }))["bundle.md"]));
  assert.deepEqual(homes.map((md) => /project: (\S+)/.exec(md)[1]).sort(), [...made.projects].sort());
  await assert.rejects(() => (async () => { const plain = await storeWorld(); return plain.recipes.contradiction(await plain.signIn("admin")); })(),
    /storeWorld\(\{ ai: true \}\)/, "control: a world made without the test instance's AI account has no run to propose under");
});

test("R19 recipes.setAside makes a request captured by the daemon for a question and its document set aside by a member; heldrestore then restores it", async () => {
  const w = await storeWorld();
  const ann = await member(w);
  const made = await w.recipes.setAside(ann);
  const rows = (await ann.read("capturerequests", { query: { target: made.question } })).requests;
  assert.equal(rows.length, 1);
  assert.equal(rows[0].state, "captured");
  assert.equal(rows[0].request, made.request);
  assert.equal(rows[0].capture_sha, made.sha);
  assert.equal(made.aside.act, "set_aside");
  assert.deepEqual(made.aside.documents[0].waiting.questions.map((x) => x.question), [made.question]);
  const restored = await ann.act("heldrestore", { body: { ids: [made.document], reason: "it is the right year" } });
  assert.equal(restored.act, "restore");
  await assert.rejects(() => ann.act("heldrestore", { body: { ids: [made.document], reason: "again" } }), /NOT_SET_ASIDE/, "control: a document not set aside is not restored twice");
  assert.equal((await ann.read("capturerequests", { query: { target: made.question } })).requests[0].state, "captured", "the request stays captured");
});

test("R19 recipes.questions(as, project, n) draws n questions into a project by real acts, fast enough for a test (120 for the batch bound)", async () => {
  const w = await storeWorld();
  const ann = await member(w);
  const project = await w.recipes.project(ann, "Stormwater");
  const t0 = performance.now();
  const ids = await w.recipes.questions(ann, project, 120);
  const took = performance.now() - t0;
  assert.equal(ids.length, 120);
  assert.equal(new Set(ids).size, 120);
  const listed = await ann.read("projectquestions", { query: { project } });
  assert.deepEqual(listed.items.map((x) => x.inquiry).sort(), [...ids].sort(), "all of them, drawn into the project");
  console.log(`recipes.questions(120): ${Math.round(took)} ms`);
  assert.ok(took < 20_000, `120 questions in ${Math.round(took)} ms`);
});

test("R19 recipes.finding makes a concluded finding by real acts: the pre-flight is ready and publishcheck holds a check the case-check reads as held; each authored field is the pre-flight's", async () => {
  const w = await storeWorld();
  const ann = await w.signIn("ann", { capabilities: ["contribute", "create_projects", "publish"] });
  const project = await w.recipes.project(ann, "Stormwater");
  const f = await w.recipes.finding(ann, project);
  assert.equal(f.concluded.to, "concluded");
  assert.equal(f.concluded.own_reading, true);
  assert.equal((await ann.read("inquirystrength", { query: { id: f.id } })).ok, true);
  const pre = await ann.act("publishpreflight", f.publish);
  assert.equal(pre.ready, true, JSON.stringify(pre.first || pre.blockers).slice(0, 400));
  const held = await ann.act("publishcheck", f.publish);
  assert.equal(held.ok, true);
  assert.equal(held.held, true);
  assert.match(held.check, /^CHK-2026-\d{4}$/);
  assert.equal((await ann.read("casecheck", { query: { case: held.case } })).state, "held");
  const { body: { subjectPosition: _omitted, ...rest } } = f.publish;
  await assert.rejects(() => ann.act("publishcheck", { query: f.publish.query, body: rest }), /NO_SUBJECT_POSITION/, "control: left out, a field of the case is the pre-flight's first refusal");
  const another = await w.recipes.finding(ann, project, { title: "Eight days", reading: "Reported potholes are repaired within eight days." });
  assert.notEqual(another.id, f.id);
  assert.equal((await ann.act("publishcheck", another.publish)).held, true, "a second finding in the project is held too");
});
