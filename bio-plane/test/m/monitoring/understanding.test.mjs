/* monitoring R28–R35 and R44: standing intent, what reaches members, and what the understanding and action layers
   rest on. R34 and R44 run over the real actions module (its clock rule, `pendingClocks` and its R33 bound). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubIntent, sha, V, NOW_MS } from "./fixture.mjs";
import { markOverdue, MONITOR_AUTHOR, MONITOR_VIEWER } from "../../../src/monitoring/index.mjs";
import { MECHANICAL_FIELD_SETS, parseFrontmatter } from "../../../checks/bio-checks.mjs";

test.todo("R28 each open named request in data/gathering.json whose cadence is due is captured through capture.acquire from its locators in order, the request named as authority (not yet met: Intake Doctrine §4; nothing executes a gathering request, and T8 plans no build of it)");
test.todo("R29 a ratified sweep runs within its scope and breadth budget and lands at collected (not yet met: K102; sweeps wait for a design of what a sweep's query is)");
test.todo("R30 an administrator may pause the daemon, and its due slate is exported as quoted data inside fixed instruction framing (not yet met: Intake Doctrine §4, K102, K259; N222)");
test.todo("R31 items in the item contract with their options: source-modified, source-removed, archive-fallback-eligible, monitoring-recheck-due, read by queue (not yet met: the item contract's catalogue ids and options are composed by legacy-store and affordances today (queue, layer 11); this module offers the facts through R8's flag, R20's eligible addresses and R32's rows, and publishes no item yet)");

/* An action with two clock entries, one past and one not, by a member. */
const ACT = "ACTN-2026-0700-req";
const actionMd = (id, clock) => ["---", `id: ${id}`, "object_type: action", `title: ${id}`, "current_state: planned",
  'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "action_kind: records_request", "risk_tier: 1",
  "counterparty:", "  state: named", "  role: Town Clerk", "  body: Town of Port Ellery",
  "clock:", ...clock.flatMap(([text, date, status]) => [`  - text: ${text}`, `    description: ${text} window`, `    date: ${date}`,
    "    basis: statute", `    status: ${status}`]), "---", "", "An action.", ""].join("\n");
const createAction = (w, id, clock) => {
  const md = actionMd(id, clock);
  const r = w.promotion.promote({ bundleId: id, base: null, snapKey: `20260920T000000Z_${id.slice(10, 14)}`, author: V("alice"),
    meta: { object_type: "action", group: "test-group", title: id, current_state: "planned", created: "2026-09-01T00:00:00Z", last_updated: "2026-09-01T00:00:00Z" },
    files: [{ path: "bundle.md", text: md, bytes: Buffer.byteLength(md), sha256: sha(md) }] });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  return md;
};

test("R33 (N170) the sources a live objective rests on are known to monitoring through intent's watchSet, followed to its end; one not monitored is proposed to the project's members through intent's registration, never enabled", () => {
  const w = world();
  const a = w.monitored("INFO-2026-0710-watched", "https://records.example.org/w1", "w1", { freq: "daily" });
  const b = w.monitored("INFO-2026-0711-unwatched", "https://records.example.org/w2", "w2", { enabled: false });
  const c = w.monitored("INFO-2026-0712-also", "https://records.example.org/w3", "w3", { enabled: false });
  w.intent.watch["PROJ-2026-0001-p"] = [a.cap, b.cap, c.cap];
  const k = w.m.watched({ project: "PROJ-2026-0001-p" });
  assert.equal(k.ok, true);
  assert.deepEqual(k.captures.map((x) => [x.bundle, x.monitored]),
    [["INFO-2026-0710-watched", true], ["INFO-2026-0711-unwatched", false], ["INFO-2026-0712-also", false]]);
  assert.deepEqual(w.intent.calls.map((x) => x.after), [null, b.cap], "the cursor is followed to null");
  /* registered as intent's proposal source at start (intent R15) */
  const src = w.intent.sources.find((s) => s.kind === "monitoring");
  assert.ok(src, "monitoring registered its proposal source");
  const props = src.reader({ project: "PROJ-2026-0001-p", viewer: "class:daemon" });
  assert.deepEqual(props.map((p) => p.basis.bundle), ["INFO-2026-0711-unwatched", "INFO-2026-0712-also"]);
  for (const p of props) {
    assert.deepEqual([p.source, p.kind, p.surfaced_by], ["monitoring", "monitor-source", "machine"]);
    assert.match(p.basis.says, /the daemon never enables it/);
  }
  assert.equal(w.fm("INFO-2026-0711-unwatched").monitoring.enabled, false, "never enabled by the daemon");
  assert.equal(src.reader({ project: "PROJ-2026-0001-p", viewer: "nobody" }).length, 0, "through the viewer's sight");
  /* a change at a watched source reaches reevaluation as R8's flag: the document's own reeval_pending (tick.test R8) */
});
test.todo("R33 the sources a published finding rests on are known to monitoring and proposed the same way (not yet met: publication offers no read of what a published finding rests on that this module can follow; the objective half is built, N170)");

test("R34 a pending clock entry whose date has passed is marked overdue by a mechanical deadline-recheck promotion changing only clock[].status and last_updated", async () => {
  const w = world({ realActions: true, escalation: { calls: [], escalationsDue(q) { this.calls.push(q); return { ok: true, items: [], truncated: false }; } } });
  const before = createAction(w, ACT, [["answer", "2026-09-01", "pending"], ["appeal", "2099-12-01", "pending"], ["today", "2026-09-28", "pending"]]);
  const r = await w.m.deadlineRecheck(NOW_MS);
  assert.equal(r.ok, true);
  assert.deepEqual(r.marked.map((m) => [m.action, m.ords, m.dates]), [[ACT, [0], ["2026-09-01"]]], "a deadline of today is not yet past");
  const after = w.text(ACT);
  const fa = parseFrontmatter(after).data, fb = parseFrontmatter(before).data;
  assert.deepEqual(fa.clock.map((e) => e.status), ["overdue", "pending", "pending"]);
  const m = w.manifest(ACT).at(-1);
  assert.deepEqual([m.writer, m.operation, m.author], ["mechanical", "deadline-recheck", MONITOR_AUTHOR]);
  assert.deepEqual(MECHANICAL_FIELD_SETS["deadline-recheck"], ["clock[].status", "last_updated"]);
  for (const k of Object.keys(fb)) if (k !== "clock" && k !== "last_updated") assert.deepEqual(fa[k], fb[k], k);
  assert.deepEqual(fa.clock.map(({ status, ...rest }) => rest), fb.clock.map(({ status, ...rest }) => rest));
  assert.match(after, /Deadline recheck: the clock entry dated 2026-09-01 passed while pending and is marked overdue/);
  /* nothing further to mark: a second recheck writes nothing */
  const n = w.manifest(ACT).length;
  const again = await w.m.deadlineRecheck(NOW_MS);
  assert.deepEqual([again.marked, w.manifest(ACT).length], [[], n]);
});
test.todo("R34 the action's members are told of an overdue mark (not yet met: needs R31's items, which this module does not yet publish)");

test("R44 the mark reads actions.pendingClocks and moves an entry only from pending to overdue; met, waived and overdue entries are left; nothing is added, removed or re-dated", async () => {
  const w = world({ realActions: true, escalation: { escalationsDue: () => ({ ok: true, items: [] }) } });
  const id = "ACTN-2026-0720-mixed";
  createAction(w, id, [["a", "2026-08-01", "met"], ["b", "2026-08-02", "waived"], ["c", "2026-08-03", "overdue"], ["d", "2026-08-04", "pending"]]);
  let read = null;
  const orig = w.act.pendingClocks.bind(w.act);
  w.act.pendingClocks = (q) => { read = q; return orig(q); };
  const r = await w.m.deadlineRecheck(NOW_MS);
  assert.deepEqual(read, { before: "2026-09-28", limit: 500, viewer: MONITOR_VIEWER }, "through actions R31");
  assert.deepEqual(r.marked.map((m) => m.ords), [[3]]);
  const clock = w.fm(id).clock;
  assert.deepEqual(clock.map((e) => [e.text, e.date, e.status]),
    [["a", "2026-08-01", "met"], ["b", "2026-08-02", "waived"], ["c", "2026-08-03", "overdue"], ["d", "2026-08-04", "overdue"]]);
  /* an entry the read names that the document no longer holds pending is not moved */
  w.act.pendingClocks = () => ({ ok: true, items: [{ action: id, ord: 0, date: "2026-08-01", past: true }], truncated: false });
  const stale = await w.m.deadlineRecheck(NOW_MS);
  assert.deepEqual([stale.marked, stale.failed.map((f) => f.reason)], [[], ["NOTHING_PENDING"]]);
  /* the rewrite itself touches only named pending status lines */
  const text = "---\nclock:\n  - text: x\n    status: pending\n  - text: y\n    status: met\n---\n";
  assert.equal(markOverdue(text, [0]), "---\nclock:\n  - text: x\n    status: overdue\n  - text: y\n    status: met\n---\n");
  assert.equal(markOverdue(text, [1]), null, "a met entry is never moved");
  /* the real actions module holds the same bound at the write: a machine move to anything but overdue is refused */
  const live = w.text(id);
  const tampered = live.replace("    status: overdue\n", "    status: met\n");
  const refused = w.promotion.promote({ bundleId: id, base: sha(live), snapKey: "20260928T120000Z_tamper", author: MONITOR_AUTHOR,
    writer: "mechanical", operation: "deadline-recheck",
    meta: { object_type: "action", title: id, current_state: "planned", created: "2026-09-01T00:00:00Z", last_updated: "2026-09-28T12:00:00Z" },
    files: [{ path: "bundle.md", text: tampered, bytes: Buffer.byteLength(tampered), sha256: sha(tampered) }] });
  assert.equal(refused.ok, false);
});

test("R35 when a clock is marked overdue or a response is recorded against an action, monitoring asks escalation (as its own viewer) whether a stage's trigger is met; it never advances a stage", async () => {
  const calls = [];
  const esc = { escalationsDue(q) { calls.push(q); return { ok: true, as_of: "2026-09-28T12:00:00Z", items: [{ id: "ESC-2026-0001-x", stage: "response_evaluation" }], truncated: false, limit: 500 }; },
                advance() { throw new Error("monitoring never advances a stage"); } };
  const w = world({ realActions: true, escalation: esc });
  createAction(w, "ACTN-2026-0730-esc", [["a", "2026-09-01", "pending"]]);
  calls.length = 0;
  const r = await w.m.deadlineRecheck(NOW_MS);
  assert.equal(r.marked.length, 1);
  assert.ok(calls.length >= 1);
  assert.deepEqual(calls[0], { nowMs: NOW_MS, viewer: MONITOR_VIEWER }, "asked with its own viewer");
  assert.deepEqual(r.escalations.items.map((i) => i.id), ["ESC-2026-0001-x"]);
  /* a response recorded: the action's promotion commits, and escalation is asked */
  calls.length = 0;
  const live = w.text("ACTN-2026-0730-esc");
  const withReply = live.replace("---\n\nAn action.", "correspondence:\n  - direction: received\n    at: 2026-09-27\n    medium: email\n    party: Town Clerk\n    account: the clerk answered\n    author: member:alice\n---\n\nAn action.");
  const rr = w.promotion.promote({ bundleId: "ACTN-2026-0730-esc", base: sha(live), snapKey: "20260928T120000Z_reply", author: V("alice"),
    meta: { object_type: "action", title: "ACTN-2026-0730-esc", current_state: "planned", created: "2026-09-01T00:00:00Z", last_updated: "2026-09-28T12:00:00Z" },
    files: [{ path: "bundle.md", text: withReply, bytes: Buffer.byteLength(withReply), sha256: sha(withReply) }] });
  assert.equal(rr.ok, true, JSON.stringify(rr).slice(0, 300));
  await new Promise((res) => setTimeout(res, 5));
  assert.equal(calls.length, 1, "asked once the response was recorded");
  assert.equal(w.m.escalationsSeen().action, "ACTN-2026-0730-esc");
  assert.deepEqual(calls.at(-1), { nowMs: NOW_MS, viewer: MONITOR_VIEWER });
  /* another type, or a replay, asks nothing */
  calls.length = 0;
  w.m.actionCommitted({ bundleId: "INFO-2026-0001-x", type: "information" });
  w.m.actionCommitted({ bundleId: "ACTN-2026-0730-esc", type: "action", replay: true });
  assert.equal(calls.length, 0);
  assert.ok(stubIntent);
});
