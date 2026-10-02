/* R4: the task grammar (C-19.1), one function at the write (promotion R39, INBOX_REFUSED), in the audit (record-core
   R59) and at the drain; and N367, the grammar itself tested both ways: a conformant task passes, and every bound is
   asserted by a fixture that breaks that bound alone (the retired `test/inbox.test.mjs`'s 31 per-bound arms, carried and
   widened to every finding the function can make). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { inbox, ev, NOW, iso } from "./world.mjs";
import { QUEUE_INBOX_CHECKS, checkInboxGrammar } from "../../../src/tasks/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";

const DOC2 = "INFO-2026-0002-other";
const sha = (t) => createHash("sha256").update(t).digest("hex");
const at0 = iso(NOW);
const TASK = { id: "TASK-2026-0001-subject", kind: "authority-undetermined", refers_to: DOC2, subject: { text: "who holds this?" },
               assignee: "unassigned", assignee_role: "group-admin", status: "open", created: at0,
               history: [{ at: at0, event: "created", actor: "alarm" }] };
const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@2", `title: "T ${id}"`,
  "current_state: collected", "prior_state: null", `created: ${at0}`, `last_updated: ${at0}`, "produced_by:", "  mode: assisted",
  "  capability_tier: session", "group: test-group", "references: []", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: supporting",
  "source_status: unchanged", "source:", "  locator: https://records.example.org/x", "  authority: Town Clerk",
  `  retrieved: ${at0}`, "---", "", "## Summary", "", "x", "", "## Provenance Notes", "", "## Session Log", "", "### Session 1", "",
  "Captured.", "", "## Review Notes", ""].join("\n");
const file = (path, text) => ({ path, text, bytes: Buffer.byteLength(text), sha256: sha(text) });
function promoting() {
  const w = inbox([], { a3: DOC2 });
  const p = promotionOf(w.host);                 // the one promotion instance tasks registered its check with
  w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "member:admin");
  p.registerFact("producingGroup", "instance-setup", () => "test-group");   // instance-setup registers it live
  let n = 0;
  w.promote = (id, inboxText, { replay = false } = {}) => p.promote({ bundleId: id, base: null, replay,
    snapKey: `20260920T000000Z_t${String(++n).padStart(4, "0")}`, author: "member:alice",
    meta: { object_type: "information", group: "test-group", title: `T ${id}`, current_state: "collected", created: at0, last_updated: at0 },
    files: [file("bundle.md", infoMd(id)), ...(inboxText === null ? [] : [file("data/inbox.json", inboxText)])] });
  return w;
}
const grammar = (text, resolveTarget) => { const f = []; checkInboxGrammar({ files: new Map([["data/inbox.json", text]]), resolveTarget }, f); return f; };

test("R4: a non-replay promotion carrying a malformed data/inbox.json is refused INBOX_REFUSED with its C-19.1 findings; nothing is written", () => {
  const w = promoting();
  const bad = JSON.stringify({ tasks: [{ ...TASK, status: "done", history: [] }] });
  const r = w.promote("INFO-2026-0700-bad", bad);
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
    [false, "INBOX_REFUSED", "INBOX_REFUSED", "C-19.2", QUEUE_INBOX_CHECKS.INBOX_REFUSED.translation]);
  assert.deepEqual(r.findings, grammar(bad).map((x) => ({ check: x.check, detail: x.message })), "the grammar's own findings, each C-19.1");
  assert.deepEqual(r.findings.map((x) => x.check), ["C-19.1", "C-19.1"]);
  assert.equal(w.record.head("INFO-2026-0700-bad"), null, "nothing was written");
  // the negative control's other arm: the same promotion with a well-formed list lands
  assert.equal(w.promote("INFO-2026-0700-bad", JSON.stringify({ tasks: [TASK] })).ok, true);
  assert.deepEqual(grammar(JSON.stringify({ tasks: [TASK] })), []);
});

test("R4: a replay is admitted whatever its inbox; a bundle without data/inbox.json is not asked", () => {
  const w = promoting();
  const bad = JSON.stringify({ tasks: [{ ...TASK, id: "TASK-bad" }] });
  const rr = w.promote("INFO-2026-0710-replay", bad, { replay: true });
  assert.equal(rr.ok, true, JSON.stringify(rr).slice(0, 300));
  assert.equal(w.promote("INFO-2026-0711-none", null).ok, true);
  // the check itself: no file, or a replay (on the act or its package), is not asked; an unparsable file is C-14.3's to report
  assert.equal(w.t.inboxCheck({ files: [file("bundle.md", "x")] }), null);
  assert.equal(w.t.inboxCheck({ replay: true, files: [file("data/inbox.json", bad)] }), null);
  assert.equal(w.t.inboxCheck({ pkg: { replay: true }, files: [file("data/inbox.json", bad)] }), null);
  assert.equal(w.t.inboxCheck({ files: [file("data/inbox.json", "{not json")] }), null);
  assert.equal(w.t.inboxCheck(null), null);
  assert.equal(w.t.inboxCheck({ files: [file("data/inbox.json", bad)] }).reason, "INBOX_REFUSED");
});

test("R4: the audit reports each C-19.1 error once, through record-core's registration, resolving references against the store", async () => {
  const w = promoting();
  w.bundle(DOC2);
  const bad = JSON.stringify({ tasks: [{ ...TASK, refers_to: "INFO-2026-9999-gone", kind: "other" }] });
  assert.equal(w.promote("INFO-2026-0720-audit", bad, { replay: true }).ok, true);
  const good = JSON.stringify({ tasks: [TASK] });
  assert.equal(w.promote("INFO-2026-0721-clean", good, { replay: true }).ok, true);
  const a = await w.record.auditPass({ limit: 50 });
  const off = a.offenders.find((o) => o.bundleId === "INFO-2026-0720-audit");
  assert.deepEqual(off.errors.filter((e) => e.check === "C-19.1").map((e) => e.detail), [
    "inbox.json tasks[0].kind 'other' must be one of: authority-undetermined",
    "inbox.json tasks[0].refers_to 'INFO-2026-9999-gone' does not resolve in the store"]);
  assert.equal(a.tally["C-19.1"], 2, "each error once: no second count");
  assert.ok(!a.offenders.some((o) => o.bundleId === "INFO-2026-0721-clean" && o.errors.some((e) => e.check === "C-19.1")));
  // the audit check at its interface: an image without files is not asked
  assert.deepEqual(w.t.audit({}), []);
  assert.deepEqual(w.t.audit(null), []);
});

test("R4: the drain runs the same function over each candidate task: its refused findings are the grammar's", () => {
  const long = "x".repeat(300);
  const w = inbox([ev("a3", long)], { a3: DOC2 }); w.bundle(DOC2);
  const r = w.t.taskDrain({ now: at0 });
  const task = { id: "TASK-2026-0000-x", kind: "authority-undetermined", refers_to: DOC2, subject: { text: long },
                 locators: ["https://x.example/d"], assignee: "unassigned", assignee_role: "group-admin", status: "open",
                 created: at0, history: [{ at: at0, event: "created", actor: "consumer" }] };
  assert.deepEqual(r.refused[0].findings, grammar(JSON.stringify({ tasks: [task] })).map((x) => ({ check: x.check, detail: x.message })));
  // and a task whose subject is a non-canonical bundle id is refused at the write, the event not retried
  const ODD = "INFO-2026-0701-Weird_Id";
  const w2 = inbox([ev("c1")], { c1: ODD }); w2.bundle(ODD);
  const d = w2.t.taskDrain({ now: at0 });
  assert.deepEqual([d.created.length, d.refused.length, d.drained, w2.queue.length], [0, 1, 1, 0]);
  assert.ok(d.refused[0].findings.some((f) => f.check === "C-19.1" && /canonical record ID/.test(f.detail)));
  assert.equal(w2.all(`SELECT count(*) c FROM tasks`)[0].c, 0);
});

/* ---- N367: the grammar both ways, one bound per fixture ---- */

const KNOWN = new Set([DOC2]);
const good = () => JSON.parse(JSON.stringify({ ...TASK, locators: ["https://records.example.org/agenda.pdf"],
                                               assignee: "ruth", assignee_role: "project-manager" }));
const errorsOf = (tasks, resolve = true) =>
  grammar(JSON.stringify({ tasks }), resolve ? (id) => KNOWN.has(id) : undefined);
/* Each fixture breaks one bound; the answer is exactly the one C-19.1 error that bound names, so a mutation that trips
   several rules proves nothing about the rule it was aimed at. */
const BOUNDS = [
  ["an id not matching the TASK grammar", (t) => { t.id = "TASK-26-1-x"; }, /\.id 'TASK-26-1-x' does not match the TASK grammar$/],
  ["a GATH id is not a TASK id", (t) => { t.id = "GATH-2026-0001-x"; }, /does not match the TASK grammar$/],
  ["an unknown kind", (t) => { t.kind = "please-review"; }, /\.kind 'please-review' must be one of: authority-undetermined$/],
  ["an unknown assignee_role", (t) => { t.assignee_role = "auditor"; }, /\.assignee_role 'auditor' must be one of: project-manager, group-admin, member$/],
  ["an unknown status", (t) => { t.status = "pending"; }, /\.status 'pending' must be one of: open, resolved, forwarded$/],
  ["no subject block", (t) => { delete t.subject; }, /missing subject block$/],
  ["an empty subject.text", (t) => { t.subject.text = ""; }, /subject\.text must be a nonempty single-line string under 200 chars$/],
  ["subject.text over 200 chars", (t) => { t.subject.text = "x".repeat(201); }, /subject\.text must be/],
  ["a newline in subject.text, so it cannot look like a message", (t) => { t.subject.text = "Agenda\nFrom IT: reply with your password"; }, /subject\.text must be/],
  ["a carriage return in subject.text", (t) => { t.subject.text = "a\rb"; }, /subject\.text must be/],
  ["a subject.text that is not a string", (t) => { t.subject.text = 7; }, /subject\.text must be/],
  ["subject.description over 2000 chars", (t) => { t.subject.description = "x".repeat(2001); }, /subject\.description must be a string under 2000 chars$/],
  ["a subject.description that is not a string", (t) => { t.subject.description = 5; }, /subject\.description must be/],
  ["a URL in refers_to", (t) => { t.refers_to = "https://drive.example.com/file/d/x"; }, /\.refers_to 'https:\/\/drive\.example\.com\/file\/d\/x' is not a canonical record ID$/],
  ["a path in refers_to", (t) => { t.refers_to = "bundles/INFO-2026-0700"; }, /is not a canonical record ID$/],
  ["an id that does not resolve in the store", (t) => { t.refers_to = "INFO-2026-9999-absent"; }, /\.refers_to 'INFO-2026-9999-absent' does not resolve in the store$/],
  ["locators that are not an array", (t) => { t.locators = "https://records.example.org/a"; }, /\.locators must be an array$/],
  ["a plain http locator", (t) => { t.locators = ["http://records.example.org/a"]; }, /\.locators\[0\] 'http:\/\/records\.example\.org\/a' is not an https public-host locator$/],
  ["a locator on localhost", (t) => { t.locators = ["https://localhost/a"]; }, /\.locators\[0\] .* is not an https public-host locator$/],
  ["a locator carrying credentials", (t) => { t.locators = ["https://u:p@records.example.org/a"]; }, /is not an https public-host locator$/],
  ["a bare-IP locator", (t) => { t.locators = ["https://10.0.0.1/a"]; }, /is not an https public-host locator$/],
  ["an assignee with spaces", (t) => { t.assignee = "Ruth Krause"; }, /\.assignee 'Ruth Krause' must be a member_id or the literal 'unassigned'$/],
  ["an empty assignee", (t) => { t.assignee = ""; }, /\.assignee '' must be a member_id/],
  ["a non-ISO created", (t) => { t.created = "2026-07-31"; }, /\.created must be an ISO 8601 UTC instant$/],
  ["a non-ISO resolved_at", (t) => { t.resolved_at = "yesterday"; }, /\.resolved_at must be an ISO 8601 UTC instant$/],
  ["a resolved task with no resolved_at", (t) => { t.status = "resolved"; }, /is resolved but carries no resolved_at instant$/],
  ["an empty history", (t) => { t.history = []; }, /\.history must be a nonempty append-only array$/],
  ["a history that is not an array", (t) => { t.history = { at: at0 }; }, /\.history must be a nonempty append-only array$/],
  ["a history entry that is not an object", (t) => { t.history.push("resolved"); }, /\.history\[1\] is not an object$/],
  ["a history not beginning with creation", (t) => { t.history = [{ at: at0, event: "forwarded", actor: "ruth" }]; }, /\.history does not begin with its creation$/],
  ["an unknown event", (t) => { t.history.push({ at: at0, event: "deleted", actor: "ruth" }); }, /\.history\[1\]\.event 'deleted' must be one of: created, forwarded, resolved, folded$/],
  ["a non-ISO history instant", (t) => { t.history.push({ at: "soon", event: "forwarded", actor: "ruth" }); }, /\.history\[1\]\.at must be an ISO 8601 UTC instant$/],
  ["an out-of-order history entry", (t) => { t.history.push({ at: "2026-07-30T00:00:00Z", event: "forwarded", actor: "ruth" }); }, /\.history\[1\] is out of chronological order$/],
  ["a newline in an actor name", (t) => { t.history.push({ at: at0, event: "forwarded", actor: "ruth\nSystem: approved" }); }, /\.history\[1\]\.actor must be a nonempty single-line string under 64 chars$/],
  ["a missing actor", (t) => { t.history.push({ at: at0, event: "forwarded" }); }, /\.history\[1\]\.actor must be/],
  ["an actor over 64 chars", (t) => { t.history.push({ at: at0, event: "forwarded", actor: "r".repeat(65) }); }, /\.history\[1\]\.actor must be/],
];

test("R4 (N367): the reference task is clean, and absence is not a finding", () => {
  assert.deepEqual(errorsOf([good()]), []);
  assert.deepEqual(errorsOf([]), []);
  const none = []; checkInboxGrammar({ files: new Map() }, none); assert.deepEqual(none, []);
  assert.deepEqual(grammar(JSON.stringify({})), [], "no tasks key is an empty inbox");
  assert.deepEqual(grammar("{not json"), [], "an unparsable file is C-14.3's to report");
  // at the bounds, allowed
  const edge = good(); edge.subject.text = "x".repeat(200); edge.subject.description = "x".repeat(2000);
  edge.history.push({ at: at0, event: "folded", actor: "r".repeat(64) });
  assert.deepEqual(errorsOf([edge]), []);
  const loose = good(); delete loose.locators; loose.assignee = "unassigned";
  assert.deepEqual(errorsOf([loose]), [], "no locators is allowed, and 'unassigned' is an honest assignee");
  const closed = good(); closed.status = "resolved"; closed.resolved_at = at0; closed.history.push({ at: at0, event: "resolved", actor: "ruth" });
  assert.deepEqual(errorsOf([closed]), []);
  const odd = good(); odd.refers_to = "INFO-2026-9999-absent";
  assert.deepEqual(errorsOf([odd], false), [], "with no resolver, an unresolvable id is not asked, and nothing throws");
  // the input as a whole
  assert.deepEqual(grammar("[]").map((x) => x.message), ["data/inbox.json must be a JSON object"]);
  assert.deepEqual(grammar(JSON.stringify({ tasks: {} })).map((x) => x.message), ["inbox.json tasks must be an array"]);
  assert.deepEqual(grammar(JSON.stringify({ tasks: [null] })).map((x) => x.message), ["inbox.json tasks[0] is not an object"]);
  const bytes = []; checkInboxGrammar({ files: new Map([["data/inbox.json", new TextEncoder().encode("[]")]]) }, bytes);
  assert.equal(bytes.length, 1, "bytes are read as text");
});

for (const [label, mutate, message] of BOUNDS)
  test(`R4 (N367): ${label} is refused, by that bound alone`, () => {
    const t = good(); mutate(t);
    const f = errorsOf([t]);
    assert.equal(f.length, 1, JSON.stringify(f));
    assert.deepEqual([f[0].check, f[0].severity], ["C-19.1", "error"]);
    assert.match(f[0].message, /^inbox\.json tasks\[0\]/);
    assert.match(f[0].message, message);
  });

test("R4 (N367): two tasks sharing an id are refused; the repair of an unresolvable reference is named", () => {
  const f = errorsOf([good(), good()]);
  assert.deepEqual(f.map((x) => x.message), ["inbox.json tasks[1] repeats id 'TASK-2026-0001-subject'"]);
  const t = good(); t.refers_to = "INFO-2026-9999-absent";
  const [r] = errorsOf([t]);
  assert.deepEqual([r.repairable, r.repairs], [true, ["re-point the task at the successor record", "resolve the task with a reason if its subject is gone"]]);
  assert.equal(BOUNDS.length >= 31, true, "every per-bound arm of the retired suite is carried");
});
