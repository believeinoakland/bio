/* screens-inquiry fix round 6 (T51), the project screen: G12a (the project's documents are read as picker rows, never the full row whose examination of every
 * capture with no recorded format cost a page seconds) and G12c (the strength of the project's questions is ONE read for each 50, strength's batch, never one
 * read for each question). On interface-shell's served page over a scripted plane; every expectation is a word read by key (R44). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../interface-shell/harness.mjs";
import { open, main, section, says, word, day, P, Q, Q2 } from "./fixtures.mjs";

process.env.TZ = "UTC";
const at = "/app/project/" + P;

/* a picker row as capture's `heldcaptures` answers it with `fields=picker` (title, id, source with the capture's day, standing; `format` since fix round 6) */
const pick = (id, title, o = {}) => ({ bundle_id: id, title, project: P, source: { address: "https://example.org/" + id, via: "https", retrieved: o.retrieved || "2026-09-14T09:00:00Z" },
  collected_since: "2026-09-14T09:00:00Z", capture: { sha256: "a".repeat(64) }, actor: "member:dev", whole: true, standing: "collected", ...(o.format ? { format: o.format } : {}) });

test("R128 G12a every read of the project's documents asks for picker rows, page after page, and the rows are drawn from them: title, kind from `format`, the capture's day", async () => {
  const first = { ok: true, held: [pick("INFO-2026-0031", "A page", { format: "html" }), pick("INFO-2026-0032", "A sheet", { format: "xlsx", retrieved: "2026-10-02T09:00:00Z" })], truncated: true, next: "CUR1" };
  const second = { ok: true, held: [pick("INFO-2026-0033", "No format stated")], truncated: false, next: null };
  const p = await open(at, { plane: { heldcaptures: (r) => ok(r.query.after === "CUR1" ? second : first) } });
  const asked = p.byOp("heldcaptures");
  assert.ok(asked.length >= 2, "both pages are read");
  assert.deepEqual(asked.map((r) => r.query.fields), asked.map(() => "picker"), "every read of the project's documents is a picker read, none a full row");
  const s = section(p, "screen.project.docs.head");
  const rows = s.querySelectorAll(".cs-row");
  assert.deepEqual(rows.map((r) => r.querySelector("a.cs-ref").textContent), ["A page", "A sheet", "No format stated"]);
  assert.ok(rows[0].textContent.includes(word("screen.project.docs.kind.web")) && rows[0].textContent.includes(word("screen.project.docs.captured") + " " + day("2026-09-14")), "kind and day");
  assert.ok(rows[1].textContent.includes(word("screen.project.docs.kind.sheet")) && rows[1].textContent.includes(day("2026-10-02")));
  assert.ok(["web", "sheet", "photo"].every((k) => !rows[2].textContent.includes(word("screen.project.docs.kind." + k))), "no format stated, no kind drawn");
});

const QS = (n) => ({ ok: true, project: P, items: Array.from({ length: n }, (_, i) => ({ inquiry: "INQ-2026-" + String(100 + i).padStart(4, "0"), title: "Question " + i })), cursor: null });
const graded = (i) => ({ ok: true, capture: { state: "graded", grade: "BCDA"[i % 4] }, connection: { state: "graded", grade: "CDAB"[i % 4] } });

test("R1 R9 G12c a project with five questions asks for their strength once (inquirystrength with their five ids), draws each question's own pair, and sends no read for one id", async () => {
  const items = QS(5);
  const ids = items.items.map((x) => x.inquiry);
  const p = await open(at, { plane: { projectquestions: ok(items),
    inquirystrength: (r) => ok(r.query.ids ? { ok: true, results: Object.fromEntries(String(r.query.ids).split(",").map((id) => [id, { ok: true, target: id, ...graded(ids.indexOf(id)) }])) } : { ok: false, code: "NO_ID" }) } });
  const reads = p.byOp("inquirystrength");
  assert.equal(reads.length, 1, "one strength read for five questions");
  assert.deepEqual(String(reads[0].query.ids).split(","), ids, "naming all five");
  assert.equal(reads[0].query.id, undefined, "and not one");
  const rows = section(p, "screen.project.questions.head").querySelectorAll(".cs-row");
  assert.equal(rows.length, 5);
  for (const [i, r] of rows.entries()) {
    const marks = r.querySelectorAll(".cs-strength .cs-grade, .cs-strength [data-grade]").map((m) => m.textContent);
    assert.ok(marks.join("").includes("BCDA"[i % 4]) && marks.join("").includes("CDAB"[i % 4]), "question " + i + " draws its own two grades: " + marks.join("|"));
  }
});

test("R1 R9 G12c more than fifty questions are asked for fifty at a time; a question the batch refuses (or leaves out) is drawn failed alone, the others graded", async () => {
  const items = QS(120);
  const ids = items.items.map((x) => x.inquiry);
  const p = await open(at, { plane: { projectquestions: ok(items),
    inquirystrength: (r) => ok({ ok: true, results: Object.fromEntries(String(r.query.ids).split(",").filter((id) => id !== ids[3]).map((id) => [id, id === ids[2] ? { ok: false, code: "NO_SUCH_BUNDLE", target: id } : { ok: true, target: id, ...graded(1) }])) }) } });
  const reads = p.byOp("inquirystrength");
  assert.deepEqual(reads.map((r) => String(r.query.ids).split(",").length).sort((a, b) => a - b), [20, 50, 50], "three reads for 120 questions");
  const rows = section(p, "screen.project.questions.head").querySelectorAll(".cs-row");
  assert.equal(rows.length, 120);
  const failed = rows.map((r, i) => [i, !!r.querySelector('[data-state="failed"]')]).filter(([, f]) => f).map(([i]) => i);
  assert.deepEqual(failed, [2, 3], "only the refused and the left-out question are drawn failed");
});

test("R79 G12c the project's dashboard asks for the questions' strength once too", async () => {
  const items = QS(5);
  const p = await open("/app/dash-project/" + P, { plane: { projectquestions: ok(items), inquirystrength: (r) => ok({ ok: true, results: Object.fromEntries(String(r.query.ids).split(",").map((id) => [id, { ok: true, target: id, ...graded(1) }])) }) } });
  assert.equal(p.byOp("inquirystrength").length, 1);
});
