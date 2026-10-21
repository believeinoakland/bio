/* screens-inquiry fix round 2 of T51 (B23): the `document` screen's causes C16 (reads), C17 (a picture's re-read, "read N of M words", a typed
 * page as the reading), C20 (the statement an upload stored), C27 (the vouch box wherever the project is), C30 (a cite answered
 * `alreadyCited`), C32 (the route check sends its query) and C35 (Watch for changes shows the value it sends). On interface-shell's served
 * page over a scripted plane; the shell's guard checks every request against its owner's declaration. Every expectation is a word read by key
 * (K3810); no test holds a sentence's English. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn, boot } from "../interface-shell/harness.mjs";
import { main, actsIn, fill, press, says, word, plane, READING, DOCUMENT_MD, provenanceOf, SCREENS, P, Q, Q2, D, SHA, PROJECT_QUESTIONS } from "./fixtures.mjs";

process.env.TZ = "UTC";
const at = "/app/document/" + D;
const text = (el) => String(el && el.textContent || "");
async function openWith(path, o = {}) {
  const p = await boot({ screens: SCREENS, plane: plane(o), path, ...(o.boot || {}) });
  await p.settle();
  return p;
}
const P2 = "PROJ-2026-0009", Q3 = "INQ-2026-0009-lease";
const MANY_PROJECTS = { projectlist: ok({ ok: true, projects: [{ id: P, name: "Pothole repairs", stage: "investigating" }, { id: P2, name: "The Coliseum lease", stage: "investigating" },
    { id: "PROJ-2026-0011", name: "Third", stage: "investigating" }] }),
  projectquestions: (r) => ok(r.query.project === P2 ? { ok: true, project: P2, items: [{ inquiry: Q3, title: "Did the lease go to a vote?" }], cursor: null } : PROJECT_QUESTIONS) };
const HELD_ROW = { bundle_id: D, title: "Pothole repair policy", project: P, collected_since: "2026-10-02T09:00:00Z", capture: { sha256: SHA, grade: { grade: "B" } },
  captured_for: { questions: [{ question: Q, title: "Seven days?", asker: "mai" }], withheld: null } };
/* what the plane answers `heldcaptures` for a member filter: only that member's rows (capture R77) */
const heldOf = (rows) => (r) => ok({ ok: true, held: rows.filter((x) => !r.query.member || String(x.actor).replace(/^member:/, "") === r.query.member) });

/* ---- C16 ---- */
test("R3 C16 the document page reads heldcaptures once and each project's questions once, however many projects the member is in", async () => {
  const p = await openWith(at, { plane: { ...MANY_PROJECTS, heldcaptures: heldOf([{ ...HELD_ROW, actor: "member:mai" }]) } });
  assert.equal(p.byOp("heldcaptures").length, 1, "one heldcaptures");
  const asked = p.byOp("projectquestions").map((r) => r.query.project);
  assert.equal(new Set(asked).size, asked.length, "no project's questions read twice");
  assert.equal(asked[0], P, "this project first");
  /* control: the cite picker still lists the project's questions */
  const values = p.doc.getElementById("document-cite-question").querySelectorAll("option").map((o) => o.getAttribute("value")).filter(Boolean);
  assert.ok(values.includes(Q) && values.includes(Q2), "this project's questions are still listed");
});

/* ---- C27 ---- */
const NO_PROJECT_MD = DOCUMENT_MD.replace(`project: ${P}\n`, "");
const noProject = { images: { [D]: { "bundle.md": NO_PROJECT_MD, "data/provenance.json": provenanceOf(SHA) } } };
test("R55 R111 C27 a held copy outside any project draws the vouch box for the member whose id the plane records, though her handle differs", async () => {
  const row = { ...HELD_ROW, project: null, actor: "member:admin" };
  const p = await openWith(at, { ...noProject, plane: { heldcaptures: heldOf([row]), whoami: ok({ tokenClass: "member", session: true, member: "admin", handle: "sparky", administer: true, capabilities: ["contribute"], vocabulary: ["contribute"] }) } });
  assert.equal(p.byOp("heldcaptures").length, 1, "one read");
  assert.equal(p.byOp("heldcaptures")[0].query.member, "admin", "matched on the member id");
  const box = main(p).querySelector("[data-held]");
  assert.ok(box && says(box, "document.held.says"), "the vouch box");
  assert.ok(actsIn(box).includes("release"));
});

test("R55 R111 C27 control: another member's held copy draws no box, with a project or without", async () => {
  const mine = { ...HELD_ROW, project: null, actor: "member:rosa" };
  const o = await openWith(at, { ...noProject, plane: { heldcaptures: heldOf([mine]) } });
  assert.equal(main(o).querySelector("[data-held]"), null);
  const o2 = await openWith(at, { plane: { heldcaptures: heldOf([{ ...HELD_ROW, actor: "member:rosa" }]) } });
  assert.equal(main(o2).querySelector("[data-held]"), null);
});

/* ---- C17 ---- */
const REACH = { assistantstate: ok({ on: true }), accountreference: ok({ held: true }) };
const PICTURE = (o = {}) => READING({ reading: { content_type: "image/jpeg", found: true, text_chars: 0 }, text_units: [], unread_pages: [0], ...o });
const acts = (p, op) => main(p).querySelectorAll(`button[data-act="${op}"]`).length;
test("R96 R3 C17 a photograph offers no PDF re-read: its re-read sends the picture's op once, and the PDF reader is never asked", async () => {
  const p = await openWith(at, { plane: { reading: ok(PICTURE()), ...REACH, pagetranscribe: ok({ ok: true, transcription: { performed: true, written: true, pages: [0] } }) } });
  assert.equal(acts(p, "pdfstructure"), 0, "no PDF reader act on a picture");
  assert.equal(acts(p, "pagetranscribe"), 1, "the picture's re-read, once");
  await press(p, "pagetranscribe", { reason: "the photograph holds the dates" });
  assert.equal(p.byOp("pdfstructure").length, 0);
  assert.equal(p.byOp("pagetranscribe")[0].query.sha256, SHA);
  /* a picture whose reading holds no pages to name still offers the same one act, never the PDF reader */
  const none = await openWith(at, { plane: { reading: ok(PICTURE({ unread_pages: [] })), ...REACH } });
  assert.equal(acts(none, "pdfstructure"), 0);
  assert.equal(acts(none, "pagetranscribe"), 1);
  /* with the assistant unreachable the picture offers no re-read at all (the page can still be typed) */
  const cold = await openWith(at, { plane: { reading: ok(PICTURE()) } });
  assert.equal(acts(cold, "pdfstructure") + acts(cold, "pagetranscribe"), 0);
  assert.ok(cold.doc.getElementById("document-unread-words"), "the typing form stays");
});

test("R96 R3 C17 control: a PDF keeps its OCR re-read and sends the PDF op", async () => {
  const pdf = READING({ reading: { content_type: "application/pdf", found: true, text_chars: 100 }, unread_pages: [7, 8] });
  const p = await openWith(at, { plane: { reading: ok(pdf), pdfstructure: ok({ ok: true, reextraction: { performed: true } }) } });
  assert.equal(acts(p, "pdfstructure"), 1);
  await press(p, "pdfstructure");
  assert.deepEqual([p.byOp("pdfstructure")[0].query.sha256, p.byOp("pdfstructure")[0].query.ocr], [SHA, "1"]);
});

const TYPING = (by, page) => ({ content_id: "c".repeat(64), transcriber: by, at: "2026-10-05T09:00:00Z", extent: { kind: "pdf-page", page } });
test("R3 R97 C17 a page typed by hand is drawn as the page's reading: its words, read from the typing, under the page typed", async () => {
  const p = await openWith(at, { plane: { transcriptions: ok({ ok: true, transcriptions: [TYPING("ben", 7)] }),
    transcription: (r) => ok({ ok: true, content_id: r.query.id, text: "Eight repairs were closed in March.", transcriber: "ben" }) } });
  assert.equal(p.byOp("transcription")[0].query.id, "c".repeat(64));
  const fold = main(p).querySelector("details[data-fold=typed]");
  assert.ok(fold && text(fold).includes("Eight repairs were closed in March."), "the typed words");
  /* control: no typing, no read of one */
  const none = await openWith(at);
  assert.equal(none.byOp("transcription").length, 0);
  assert.equal(main(none).querySelector("details[data-fold=typed]"), null);
});

/* ---- C20 ---- */
const STATEMENT = () => [`${word("screen.capture.file.how")}: ${word("screen.capture.file.how.made")}`, `${word("screen.capture.file.where")}: 6012 Seminary Ave, October 4, 2026, 9:12 AM`,
  `${word("screen.capture.file.what")}: The pothole, about 60 cm across.`].join("\n");
const withStatement = (s) => ({ images: { [D]: { "bundle.md": DOCUMENT_MD, "data/provenance.json": JSON.stringify({ documents: [{ capture: { sha256: SHA },
  ...(s ? { origin_statement: { text: s, words_of: "member:mai", evidence_of_truth: false } } : {}) }] }) } } });
test("R108 C20 the statement the upload stored is drawn as its three fields, each under its word key, with who said it", async () => {
  const p = await openWith(at, withStatement(STATEMENT()));
  const box = main(p).querySelector("[data-statement]");
  assert.ok(box, "the statement");
  for (const [k, v] of [["screen.capture.file.how", word("screen.capture.file.how.made")], ["screen.capture.file.where", "6012 Seminary Ave, October 4, 2026, 9:12 AM"], ["screen.capture.file.what", "The pothole, about 60 cm across."]]) {
    const row = box.querySelector(`[data-statement-field="${k}"]`);
    assert.ok(row, k);
    assert.ok(text(row).includes(word(k)) && text(row).includes(v), `${k} head and value`);
  }
  assert.ok(text(box).includes("mai"), "by whom");
});

test("R108 C20 control: a capture with no statement draws no empty heads; a statement with one field draws that one only", async () => {
  const none = await openWith(at, withStatement(null));
  assert.equal(main(none).querySelector("[data-statement]"), null);
  assert.ok(!text(main(none)).includes(word("screen.capture.file.where")));
  const one = await openWith(at, withStatement(`${word("screen.capture.file.where")}: Fourth and Main`));
  assert.ok(one.doc && main(one).querySelector('[data-statement-field="screen.capture.file.where"]'));
  assert.equal(main(one).querySelector('[data-statement-field="screen.capture.file.what"]'), null);
});

/* ---- C30 ---- */
const QUESTION_WITH_LEG = { images: { [Q]: { "bundle.md": ["---", `id: ${Q}`, "object_type: inquiry", 'title: "Seven days"', `project: ${P}`, "references:", `  - target: ${D}`, "    rel: cites", "    status: confirmed",
  "basis:", `  - target: ${D}`, "    role: supports", "    grade: B", "    extent_page: 2", "---", "", "## Question", "", "Is it?", ""].join("\n") } } };
const REF = `${D}#x`;
test("R3 R49 C30 a cite answered alreadyCited says the question already rests on the document, at which passage, and links the question to narrow it; a cited answer says it is cited", async () => {
  const p = await openWith(at, { ...QUESTION_WITH_LEG, plane: { cite: ok({ ok: true, inquiry: Q, role: "supports", cited: [], alreadyCited: [REF] }) } });
  fill(p, { "document-cite-question": Q });
  await press(p, "cite");
  const m = main(p);
  assert.ok(says(m, "screen.finder.a17.left_as_it_was") && says(m, "screen.finder.a17.the_question_already_cited_it"), "not silent");
  assert.ok(says(m, "screen.document.passage.where", { page: 3 }), "the passage the question rests on, from one");
  const note = m.querySelector("[data-cite-done=already]");
  assert.ok(note && note.querySelector('a[href*="/app/question/"]'), "a way to narrow: the question");
  /* a cited answer says so */
  const q = await openWith(at, { ...QUESTION_WITH_LEG, plane: { cite: ok({ ok: true, inquiry: Q, role: "supports", cited: [REF], alreadyCited: [] }) } });
  fill(q, { "document-cite-question": Q });
  await press(q, "cite");
  assert.ok(says(main(q), "screen.finder.cite.cited") && main(q).querySelector("[data-cite-done=cited]"));
  assert.equal(main(q).querySelector("[data-cite-done=already]"), null);
});

/* ---- C32 ---- */
test("R98 C32 the route check sends bundleId in the query, as the arm reads it, and no body field", async () => {
  const p = await openWith(at, { plane: { provenanceroute: ok({ ok: true, bundleId: D, appended: true, route: { finding: "LOOKED_INDETERMINATE" } }) } });
  await press(p, "provenanceroute");
  const r = p.byOp("provenanceroute")[0];
  assert.equal(r.query.bundleId, D);
  assert.ok(!r.body || !("bundleId" in r.body), "no body field");
  assert.ok(says(main(p), "screen.document.route.notshown"));
});

/* ---- C35 ---- */
const UNWATCHED = DOCUMENT_MD.replace("\nsource:", "\nmonitoring:\n  enabled: false\n  frequency: none\nsource:");
const unwatched = (extra = {}) => ({ images: { [D]: { "bundle.md": UNWATCHED, "data/provenance.json": provenanceOf(SHA) } }, ...extra });
test("R92 C35 Watch for changes shows the frequency it sends: Every day is first, chosen, and sent untouched", async () => {
  const p = await openWith(at, unwatched({ plane: { monitorset: ok({ ok: true, bundleId: D, enabled: true }) } }));
  const f = p.doc.getElementById("document-watch-freq");
  const opts = f.querySelectorAll("option");
  assert.deepEqual(opts.map((o) => o.getAttribute("value")), ["daily", "weekly", "monthly", "hourly", "per_meeting"], "no empty first option");
  assert.equal(text(opts[0]), word("screen.capture.address.freq.daily"));
  assert.equal(f.value, "daily", "what is shown is chosen");
  await press(p, "monitorset");
  assert.equal(p.byOp("monitorset")[0].body.frequency, "daily", "and sent as shown");
  /* control: another frequency chosen is sent */
  const w = await openWith(at, unwatched({ plane: { monitorset: ok({ ok: true, bundleId: D, enabled: true }) } }));
  fill(w, { "document-watch-freq": "weekly" });
  await press(w, "monitorset");
  assert.equal(w.byOp("monitorset")[0].body.frequency, "weekly");
});

/* ---- C41 (document half: Adopt newer version) ---- */
const REFUSED_WITH_FINDINGS = (code) => ({ status: 200, json: { ok: true, result: { ok: false, reason: code, code, findings: [{ check: "C-45.2",
  detail: "The newer copy has no reading chain for the passage on page 3.", translation: "The newer copy has no reading chain for the passage on page 3." }, { check: "C-45.3", detail: "A second finding." }] } } });
test("R35 R50 R117 C41 a basis version refused when a newer copy is adopted is drawn by its first finding, not only the generic sentence; a refusal with no finding keeps the generic sentence", async () => {
  const notice = (r) => ok({ ok: true, notices: r.query.holder === Q ? [{ id: "REN-1", state: "open", capture_sha: SHA, newer_capture: "9".repeat(64) }] : [] });
  const p = await openWith(at, { plane: { reevaluationnotices: notice, adoptversion: REFUSED_WITH_FINDINGS("BASIS_VERSION_REFUSED") } });
  fill(p, { "document-version-why-REN-1": "the newer one adds the supervisor" });
  const slot = await press(p, "adoptversion");
  assert.ok(text(slot).includes("The newer copy has no reading chain for the passage on page 3."), "the first finding's words");
  assert.ok(!text(slot).includes("A second finding."), "the first finding");
  const bare = await openWith(at, { plane: { reevaluationnotices: notice, adoptversion: refusedIn("BASIS_VERSION_REFUSED") } });
  fill(bare, { "document-version-why-REN-1": "the newer one adds the supervisor" });
  assert.ok(says(await press(bare, "adoptversion"), "refusal.BASIS_VERSION_REFUSED"), "no finding: the code's sentence");
});
