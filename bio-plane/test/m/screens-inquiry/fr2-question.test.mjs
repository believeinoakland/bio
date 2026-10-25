/* screens-inquiry fix round 2 (T51), the question screen: C34 (R104, R62: reopen a project-concluded finding by withdrawing the
 * conclusion), C36 (R23, R24, R34: each leg draws the first words of the passage it cites), C37 (R2: the parts of a leg and of the
 * read-back are separate elements), C41 (R35, R50, R117: BASIS_VERSION_REFUSED is drawn with its findings), C44 and C62 (R2: the
 * head and the crumb name the project). On interface-shell's served page over a scripted plane; every expectation is a word read by key
 * (R44), never copied (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, actsIn, fill, press, inquiryMd, INQUIRY_REFS, BASIS, says, word, lead, P, Q, D, SHA, POLICY } from "./fixtures.mjs";

const at = "/app/question/" + Q;
const CONCLUDED = (r) => ok(BASIS(r.query.project ? { conclusion: { claim: { text: "Yes." }, by: "member:dev", at: "2026-10-13T09:00:00Z" }, conclusion_stance: "concluded" } : {}));
const withState = (state) => inquiryMd().replace("object_type: inquiry\n", `object_type: inquiry\ncurrent_state: ${state}\n`);
const refusedBody = (code, extra = {}) => ({ status: 200, json: { ok: true, result: { ok: false, reason: code, code, ...extra } } });

/* ------------------------------------------------------------------------------------------------------------------ C34 */

test("R104 R62 a finding concluded within a project (its own state still open) is reopened by withdrawing that conclusion: withdrawconclusion carries the project and the reason, and no reopen is sent", async () => {
  const p = await open(at, { plane: { basisversions: CONCLUDED, withdrawconclusion: ok({ ok: true, target: Q, project: P, act: "withdrawn" }), reopen: ok({ ok: true }) } });
  const fold = main(p).querySelector("details[data-reopen]");
  assert.ok(fold && says(fold.querySelector("summary"), "screen.question.reopen.summary"), "the fold is offered");
  assert.ok(says(await press(p, "reopen", { within: fold }), "screen.question.reopen.refused.noreason"), "the reason is required");
  assert.equal(p.byOp("withdrawconclusion").length + p.byOp("reopen").length, 0, "nothing sent without one");
  fill(p, { "question-reopen-why": "a later audit corrects the figure" });
  await press(p, "reopen", { within: fold });
  assert.equal(p.byOp("reopen").length, 0, "no state move is sent for it");
  const q = p.byOp("withdrawconclusion")[0].query;
  assert.deepEqual([q.target, q.project, q.reason], [Q, P, "a later audit corrects the figure"]);
});

test("R104 a question whose own state is concluded, or a disposition, is reopened by the state move, and withdrawconclusion is not sent for it; control: an open, unconcluded one draws neither", async () => {
  for (const state of ["concluded", "deferred", "dismissed"]) {
    const p = await open(at, { images: { [Q]: { "bundle.md": withState(state) } }, plane: { reopen: ok({ ok: true, target: Q, to: "open" }), withdrawconclusion: ok({ ok: true }) } });
    const fold = main(p).querySelector("details[data-reopen]");
    assert.ok(fold, state + ": the fold is offered");
    fill(p, { "question-reopen-why": "new evidence" });
    await press(p, "reopen", { within: fold });
    const q = p.byOp("reopen")[0].query;
    assert.deepEqual([q.target, q.reason], [Q, "new evidence"], state);
    assert.equal(p.byOp("withdrawconclusion").length, 0, state);
  }
  const open1 = await open(at);
  assert.ok(!actsIn(main(open1)).includes("reopen") && !actsIn(main(open1)).includes("withdrawconclusion"));
  assert.equal(main(open1).querySelector("details[data-reopen]"), null);
});

test("R104 each failure has its own sentence: a withdrawal with nothing to withdraw, and a reopen of a finding that cannot be reopened", async () => {
  const w = await open(at, { plane: { basisversions: CONCLUDED, withdrawconclusion: refusedBody("NOTHING_TO_WITHDRAW") } });
  fill(w, { "question-reopen-why": "a reason" });
  const sw = await press(w, "reopen", { within: main(w).querySelector("details[data-reopen]") });
  assert.ok(says(sw, "refusal.NOTHING_TO_WITHDRAW"), "the withdrawal's own sentence");
  const r = await open(at, { images: { [Q]: { "bundle.md": withState("concluded") } }, plane: { reopen: refusedBody("ILLEGAL_TRANSITION") } });
  fill(r, { "question-reopen-why": "a reason" });
  const sr = await press(r, "reopen", { within: main(r).querySelector("details[data-reopen]") });
  assert.ok(says(sr, "screen.question.reopen.refused.notsetdown") && !says(sr, "refusal.ILLEGAL_TRANSITION"), "the reopen's own sentence, not the release act's");
});

/* ------------------------------------------------------------------------------------------------------------------ C36 */

const D2 = "INFO-2026-0005";
const SHA2 = "7c1d" + "0".repeat(56) + "e002";
const SITE_TITLE = "A PDF from www.oaklandca.gov";
const docImage = (id, sha, extra = "") => ({ "bundle.md": ["---", `id: ${id}`, "object_type: information", `title: "${SITE_TITLE}"`, `project: ${P}`, "source:", "  locator: https://www.oaklandca.gov/x", "---", "", extra].join("\n"),
  "data/provenance.json": JSON.stringify({ documents: [{ capture: { sha256: sha } }] }) });
const legsMd = (legs) => ["---", `id: ${Q}`, "object_type: inquiry", 'title: "Seven days"', "created: 2026-10-03T10:00:00Z", `project: ${P}`, "references:",
  ...legs.flatMap((l) => [`  - target: ${l.target}`, "    rel: cites", "    status: confirmed"]), "basis:",
  ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role || "supports"}`, "    grade: B", ...(l.ext || [])]), "---", "", "## Question", "", "Is the city repairing reported potholes within seven days?", "", "## Session Log", ""].join("\n");
const unit = (reference, extent, text) => ({ seq: 1, extent, reference, truncated: false, text });
const readings = { [SHA]: [unit("u1", { kind: "pdf-page", page: 0 }, "The Director shall repair each reported pothole within seven calendar days of the report.")],
  [SHA2]: [unit("u9", { kind: "pdf-page", page: 0 }, "Repairs are recorded as closed when the crew reports the work complete.")] };
const readingOf = (r) => ok({ ok: true, found: true, capture_sha: r.query.sha256, reading: { content_type: "application/pdf", found: true }, text_units: readings[r.query.sha256] || [], unread_pages: [] });
const twoDocs = (legs) => ({ images: { [Q]: { "bundle.md": legsMd(legs) }, [D]: docImage(D, SHA), [D2]: docImage(D2, SHA2) }, plane: { reading: readingOf, basisversions: ok({ ok: true, inquiry: Q, versions: [] }) } });

test("R34 R23 R24 two legs on two documents with the same name draw different rows, each with the first words of its own passage and its page", async () => {
  const p = await open(at, twoDocs([{ target: D, ext: ["    extent_kind: pdf-page", "    extent_page: 0"] }, { target: D2, ext: ["    extent_kind: pdf-page", "    extent_page: 0"] }]));
  const rows = main(p).querySelectorAll("[data-leg-words]");
  assert.equal(rows.length, 2);
  assert.ok(rows[0].textContent.includes("The Director shall repair each reported pothole") && !rows[0].textContent.includes("Repairs are recorded"));
  assert.ok(rows[1].textContent.includes("Repairs are recorded as closed") && !rows[1].textContent.includes("The Director shall repair"));
  const sup = main(p).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word("screen.question.supports.head"));
  assert.ok(sup.textContent.split(SITE_TITLE).length - 1 >= 2, "both rows still name their document");
  assert.ok(says(sup, "screen.document.passage.where", { page: "1" }), "and the page, drawn from one");
});

test("R34 a web-page leg (no page, a part of the text) draws its cited words; control: a leg whose passage the reading does not hold draws none", async () => {
  readings[SHA][0].extent = { kind: "pdf-page", page: 0 };
  const web = unit("u7", { kind: "html-text", ref: "u7" }, "Potholes reported through 311 are repaired within seven days.");
  readings[SHA2] = [web];
  const p = await open(at, twoDocs([{ target: D2, ext: ["    extent_kind: html-text", "    extent_ref: u7"] }, { target: D, ext: ["    extent_kind: html-text", "    extent_ref: u99"] }]));
  const rows = main(p).querySelectorAll("[data-leg-words]");
  assert.equal(rows.length, 1, "one leg's words, none invented for the other");
  assert.ok(rows[0].textContent.includes("Potholes reported through 311 are repaired within seven days."));
  readings[SHA2] = [unit("u9", { kind: "pdf-page", page: 0 }, "Repairs are recorded as closed when the crew reports the work complete.")];
});

/* ------------------------------------------------------------------------------------------------------------------ C37 */

test("R2 the parts of a leg and of the read-back are separate elements: a leg's carries line is set off from its name, and the read-back's lead and each passage are separated", async () => {
  const GROUNDS = [{ ground: "part 1", asserted_by: "member:dev", at: "2026-10-05T09:00:00Z" }];
  const grouped = inquiryMd(P, INQUIRY_REFS, { legs: [{ target: D, role: "supports", grade: "B", ground: "part 1", extent_page: 0 }, { target: "INFO-2026-0006", role: "supports", grade: "B", ground: "part 1" }], grounds: GROUNDS });
  const a = await open(at, { images: { [Q]: { "bundle.md": grouped } } });
  const carries = main(a).querySelectorAll("[data-carries]");
  assert.ok(carries.length > 0);
  for (const c of carries) assert.equal(c.previousElementSibling && c.previousElementSibling.localName, "br", "the carries line follows a break, not the page number");
  const b = await open(at);
  const back = main(b).querySelector("[data-readback]");
  assert.ok(back);
  for (const el of back.children) if (el.localName !== "br") assert.ok(el.previousElementSibling === null || el.previousElementSibling.localName === "br", "no two parts of the read-back run together");
});

/* ------------------------------------------------------------------------------------------------------------------ C41 */

test("R35 R50 R117 a BASIS_VERSION_REFUSED answer lists its findings: the first finding's own translation and its repair, not only the generic sentence; control: BASIS_REFUSED is drawn as before", async () => {
  const finding = { check: "C-27.9", code: "VERSION_PARTITION_INCOMPLETE", detail: "version 'main' has 1 leg with no ground", translation: "Every passage must be placed in a part.", repairs: ["repair-sentinel-qq"] };
  const go = async (code, findings) => {
    const p = await open(at, { plane: { conclude: refusedBody(code, { findings }) } });
    fill(p, { "question-conclude-falsifier": "logs dated later", "question-conclude-reason": "it answers it" });
    return press(p, "conclude");
  };
  const slot = await go("BASIS_VERSION_REFUSED", [finding]);
  assert.ok(slot.textContent.includes("repair-sentinel-qq"), "the repair");
  assert.ok(!says(slot, "refusal.BASIS_VERSION_REFUSED") || slot.textContent.includes("give every leg"), "the finding is listed");
  /* a real finding code, as basis-version-grammar's catalogue gives it with its own words (`translation` is the row of its code): drawn by the word held for the code */
  const own = await go("BASIS_VERSION_REFUSED", [{ check: "C-27.1", code: "VERSION_PARTITION_INCOMPLETE", detail: "d", translation: word("refusal.VERSION_PARTITION_INCOMPLETE") }]);
  assert.ok(says(own, "refusal.VERSION_PARTITION_INCOMPLETE"), "the code's own words");
  const bare = await go("BASIS_VERSION_REFUSED", undefined);
  assert.ok(says(bare, "refusal.BASIS_VERSION_REFUSED"), "with no finding, the generic sentence");
  // fixtures-generic: SOMETHING_ELSE (a finding code made up on purpose: the control that BASIS_REFUSED is drawn by its detail, whatever code it carries)
  const old = await go("BASIS_REFUSED", [{ check: "C-9.9", code: "SOMETHING_ELSE", detail: "the leg names no edition" }]);
  assert.ok(old.textContent.includes("the leg names no edition"), "control: BASIS_REFUSED unchanged");
});

/* ------------------------------------------------------------------------------------------------------------------ C44, C62 */

const bareProject = { [P]: { "bundle.md": ["---", `id: ${P}`, "object_type: project", "---", ""].join("\n") } };
const listed = ok({ ok: true, projects: [{ id: P, name: "Pothole repairs" }] });

test("R2 the head and the crumb name the project even when its record states no title: the project list's name is read; control: the record's own title is not read past", async () => {
  const p = await open(at, { images: bareProject, plane: { projectlist: listed } });
  assert.ok(p.root().querySelector(".cs-crumbs").textContent.includes("Pothole repairs"), "the crumb");
  const sub = main(p).querySelector(".mk-sub");
  assert.ok(sub.textContent.includes("Pothole repairs"), "the head");
  const ref = main(p).querySelector('a.cs-ref[href="/app/project/' + P + '"]');
  assert.ok(ref && ref.textContent === "Pothole repairs");
  const titled = await open(at);
  assert.equal(titled.byOp("projectlist").length, 0, "control: with the title on the record the list is not read");
});

test("R2 a project that states no title and is listed by none draws no 'because' stub; a read that refused with words draws them after 'because'", async () => {
  const none = await open(at, { images: bareProject, plane: { projectlist: ok({ ok: true, projects: [] }) } });
  assert.ok(main(none).querySelector(".mk-sub"), "the head is drawn");
  assert.equal(main(none).querySelector('a.cs-ref[href="/app/project/' + P + '"]'), null, "no project link whose text is a dangling 'because'");
  const why = await open(at, { plane: { image: (r) => (r.query.id === P ? refusedIn("NO_SUCH_BUNDLE", "it is not readable by you") : ok(r.query.id === Q ? { "bundle.md": inquiryMd() } : null)), projectlist: ok({ ok: true, projects: [] }) } });
  assert.ok(main(why).querySelector(".mk-sub").textContent.includes(word("state.undetermined", { reason: "it is not readable by you" })));
});
