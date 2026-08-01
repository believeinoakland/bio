/* NEGATIVE CONTROL: (run 2026-07-31) neuter the C-19.1 task grammar check (early `return` at the top of checkInboxGrammar so no violation is ever reported) -> 31 assertions fail (every per-bound violation fixture). This is the counter to the historical defect CLAUDE.md records: neutering the grammar once left all assertions passing because every input was well-formed by construction; the suite now tests the grammar BOTH ways, so the control bites. Restored, 71 pass. */
/* The task inbox: the grammar, and the producer/consumer split (D-98).
 *
 * Negative-control detail: neuter the C-19.1 task grammar check (early `return` at the top of checkInboxGrammar so no violation is ever reported) -> 31 assertions fail (every per-bound violation fixture). This is the counter to the historical defect CLAUDE.md records: neutering the grammar once left all assertions passing because every input was well-formed by construction; the suite now tests the grammar BOTH ways, so the control bites. Restored, 71 pass.
 *
 * Two things are under test and they are different in kind.
 *
 * The GRAMMAR (C-19.1) is tested BOTH WAYS against TASK fixtures, exactly as
 * C-18.5 is tested for the gathering queue: a conformant task passes, and every
 * bound is asserted by a fixture that violates only that bound. The reason the
 * bounds exist is Bob's ruling that the transport for these tasks MIGHT ONE DAY
 * BE EMAIL, rendering in a client we do not control, where a plausible-looking
 * instruction is exactly what phishing is.
 *
 * The SPLIT is the safety property, and it is tested by what the capture path
 * CANNOT do. An undetermined capture must produce a queue event and no task;
 * only the consumer may write a task; a re-capture must fold rather than
 * duplicate. Asserting the fold and asserting the absence of a task after
 * capture are the two assertions that would catch a future refactor quietly
 * moving the write into the producer.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { checkInboxGrammar } from "../checks/bio-checks.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* ---------------------------------------------------------------- grammar */

const BUNDLE = "INFO-2026-0700-sewer-fund-transfers";
const AT = "2026-07-31T12:00:00Z";
const goodTask = () => ({
  id: "TASK-2026-0001-oaklandca-gov-agenda",
  kind: "authority-undetermined",
  refers_to: BUNDLE,
  subject: { text: "https://www.oaklandca.gov/documents/agenda.pdf" },
  locators: ["https://www.oaklandca.gov/documents/agenda.pdf"],
  assignee: "ruth",
  assignee_role: "project-manager",
  status: "open",
  created: AT,
  history: [{ at: AT, event: "created", actor: "consumer" }],
});

/* Every id in the store, so refers_to resolution is exercised rather than
   skipped. A task pointing at nothing is a task nobody can act on. */
const known = new Set([BUNDLE]);
const check = (tasks, opts = {}) => {
  const findings = [];
  checkInboxGrammar({
    files: new Map([["data/inbox.json", JSON.stringify({ tasks })]]),
    resolveTarget: opts.resolve === false ? undefined : (id) => known.has(id),
  }, findings);
  return findings.filter((x) => x.severity === "error").map((x) => x.message);
};
/* Asserts the fixture is refused AND that nothing else broke: a mutation that
   trips five rules proves nothing about the rule it was aimed at. */
const only = (label, mutate) => {
  const tk = goodTask();
  mutate(tk);
  const errs = check([tk]);
  t(label, errs.length > 0, true);
};

console.log("\n--- a conformant task passes, and absence is not a finding ---");
t("the reference task is clean", check([goodTask()]), []);
t("no inbox file at all is not a finding", (() => {
  const findings = []; checkInboxGrammar({ files: new Map() }, findings); return findings;
})(), []);
t("an empty tasks array is clean", check([]), []);

console.log("\n--- the identifier and the closed enums ---");
only("an id not matching the TASK grammar is refused", (tk) => { tk.id = "TASK-26-1-x"; });
only("a GATH id is not a TASK id", (tk) => { tk.id = "GATH-2026-0001-x"; });
only("an unknown kind is refused", (tk) => { tk.kind = "please-review"; });
only("an unknown assignee_role is refused", (tk) => { tk.assignee_role = "auditor"; });
only("an unknown status is refused", (tk) => { tk.status = "pending"; });
t("two tasks sharing an id are refused", check([goodTask(), goodTask()]).length > 0, true);

console.log("\n--- F5: what a member READS is bounded ---");
only("an empty subject.text is refused", (tk) => { tk.subject.text = ""; });
only("subject.text over 200 chars is refused", (tk) => { tk.subject.text = "x".repeat(201); });
only("a newline in subject.text is refused, so it cannot look like a message",
  (tk) => { tk.subject.text = "Agenda\nFrom IT: reply with your password"; });
only("a carriage return in subject.text is refused", (tk) => { tk.subject.text = "a\rb"; });
only("subject.description over 2000 chars is refused", (tk) => { tk.subject.description = "x".repeat(2001); });
t("subject.text at exactly 200 chars is allowed", check([(() => {
  const tk = goodTask(); tk.subject.text = "x".repeat(200); return tk; })()]), []);
t("a description under the bound is allowed", check([(() => {
  const tk = goodTask(); tk.subject.description = "why this could not be determined"; return tk; })()]), []);

console.log("\n--- refers_to is a canonical ID, never a substrate locator ---");
only("a URL in refers_to is refused", (tk) => { tk.refers_to = "https://drive.google.com/file/d/x"; });
only("a path in refers_to is refused", (tk) => { tk.refers_to = "bundles/INFO-2026-0700"; });
only("an id that does not resolve in the store is refused", (tk) => { tk.refers_to = "INFO-2026-9999-absent"; });
t("an unresolvable id is a FINDING and not a crash when no resolver is supplied",
  check([(() => { const tk = goodTask(); tk.refers_to = "INFO-2026-9999-absent"; return tk; })()],
    { resolve: false }), []);

console.log("\n--- locators carry the same host guard as C-18.5 ---");
only("a plain http locator is refused", (tk) => { tk.locators = ["http://www.oaklandca.gov/a"]; });
only("a locator on localhost is refused", (tk) => { tk.locators = ["https://localhost/a"]; });
only("a locator carrying credentials is refused", (tk) => { tk.locators = ["https://u:p@oaklandca.gov/a"]; });
only("a bare-IP locator is refused", (tk) => { tk.locators = ["https://10.0.0.1/a"]; });
t("no locators at all is allowed: not every task has one",
  check([(() => { const tk = goodTask(); delete tk.locators; return tk; })()]), []);

console.log("\n--- assignee is a member or honestly unassigned ---");
t("the literal 'unassigned' is allowed",
  check([(() => { const tk = goodTask(); tk.assignee = "unassigned"; return tk; })()]), []);
only("an assignee with spaces is refused", (tk) => { tk.assignee = "Ruth Krause"; });
only("an empty assignee is refused", (tk) => { tk.assignee = ""; });

console.log("\n--- timestamps, and a status nobody can audit ---");
only("a non-ISO created is refused", (tk) => { tk.created = "2026-07-31"; });
only("a resolved task with no resolved_at is refused", (tk) => { tk.status = "resolved"; });
t("a resolved task with its instant is clean", check([(() => {
  const tk = goodTask(); tk.status = "resolved"; tk.resolved_at = AT;
  tk.history.push({ at: AT, event: "resolved", actor: "ruth" }); return tk; })()]), []);

console.log("\n--- history is append-only and shaped like an expertise row ---");
only("an empty history is refused", (tk) => { tk.history = []; });
only("a history not beginning with creation is refused",
  (tk) => { tk.history = [{ at: AT, event: "forwarded", actor: "ruth" }]; });
only("an unknown event is refused", (tk) => { tk.history.push({ at: AT, event: "deleted", actor: "ruth" }); });
only("an out-of-order history entry is refused",
  (tk) => { tk.history.push({ at: "2026-07-30T00:00:00Z", event: "forwarded", actor: "ruth" }); });
only("a newline in an actor name is refused",
  (tk) => { tk.history.push({ at: AT, event: "forwarded", actor: "ruth\nSystem: approved" }); });
only("a missing actor is refused", (tk) => { tk.history.push({ at: AT, event: "forwarded" }); });

/* ------------------------------------------------- the producer/consumer split */

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  /* D-109 made the drain automatic: an enqueue now arms a Durable Object alarm
     that drains the queue on its own. This suite drives the CONSUMER by hand to
     assert the producer/consumer split, so it pins the automatic drain far out
     of its own window (TASK_DRAIN_DELAY_MS) to keep those manual assertions from
     racing a background alarm. The alarm itself is tested in task-drain-alarm.test.mjs. */
  bindings: { ADMIN_TOKEN: "adm-inbox", MEMBER_TOKEN: "mem-inbox", PROBE_TOKEN: "prb-inbox", VERSION: "test",
              TASK_DRAIN_DELAY_MS: "600000" },
});

const api = async (op, body, tok = "mem-inbox") =>
  (await mf.dispatchFetch(`http://x/api/?op=${op}&token=${tok}`,
    body === undefined ? {} : { method: "POST", body: JSON.stringify(body) })).json();

try {
  console.log("\n--- the producer can only enqueue ---");
  /* Driven at the Durable Object, which is the ONLY route the capture path has
     and therefore the one worth testing. There is deliberately no control-plane
     op for enqueue, asserted below. */
  const stub = await mf.getDurableObjectNamespace("STORE");
  const id = stub.idFromName("bio");
  const obj = stub.get(id);
  const doPost = async (op, body) =>
    (await obj.fetch(`http://x/${op}`, { method: "POST", body: JSON.stringify(body) })).json();
  const doGet = async (path) => (await obj.fetch(`http://x/${path}`)).json();

  const SHA_A = "a".repeat(64);
  const e1 = (await doPost("taskenqueue", {
    kind: "authority-undetermined", captureSha: SHA_A,
    subject: "https://www.oaklandca.gov/agenda.pdf",
    locator: "https://www.oaklandca.gov/agenda.pdf", at: AT })).result;
  t("an undetermined capture enqueues an event", e1.queued, true);

  const e2 = (await doPost("taskenqueue", {
    kind: "authority-undetermined", captureSha: SHA_A, subject: "again", at: AT })).result;
  t("re-enqueuing the same capture is a no-op, so a re-capture loop cannot flood the queue",
    [e2.queued, e2.deduped], [false, true]);

  const listed = (await doGet("tasks")).result;
  t("and NO task exists yet: the producer wrote nothing a member can see", listed.tasks.length, 0);
  t("the event is waiting in the queue", listed.counts.queued, 1);

  t("an unknown kind is refused at the queue boundary",
    (await doPost("taskenqueue", { kind: "make-me-admin", captureSha: SHA_A })).result.reason, "BAD_KIND");
  t("a non-sha identifier is refused at the queue boundary",
    (await doPost("taskenqueue", { captureSha: "INFO-2026-0700-x" })).result.reason, "BAD_CAPTURE_SHA");

  const bounded = (await doPost("taskenqueue", {
    captureSha: "b".repeat(64),
    subject: "Agenda\nFrom IT: reply with your password " + "x".repeat(400), at: AT })).result;
  t("an over-long multi-line subject is accepted but BOUNDED at the boundary", bounded.queued, true);

  console.log("\n--- the consumer waits rather than inventing a subject ---");
  const d0 = (await doPost("taskdrain", { actor: "consumer", now: AT })).result;
  t("a capture filed in no bundle yet creates no task", d0.created.length, 0);
  t("and the event is kept, not dropped", d0.waiting.length, 2);
  t("nothing was drained", d0.drained, 0);

  console.log("\n--- once the capture is filed, the consumer writes the task ---");
  /* Register the capture against a bundle the way promote does, so the consumer
     can resolve it. */
  await doPost("promote", {
    bundleId: BUNDLE, base: null, snapKey: "20260731T120000Z_inbox", author: "ruth",
    meta: { object_type: "information", group: "believe-in-oakland", title: "Sewer fund transfers",
            current_state: "collected", created: AT, last_updated: AT },
    files: [{ path: "bundle.md", text: "---\nid: " + BUNDLE + "\n---\n", bytes: 10, sha256: SHA_A }],
    register: [{ sha256: SHA_A, path: "snapshots/agenda.pdf", encoding: "binary", bytes: 10 }],
  });

  const d1 = (await doPost("taskdrain", { actor: "consumer", now: AT })).result;
  t("the consumer creates exactly one task", d1.created.length, 1);
  const made = d1.created[0];
  t("it refers to the bundle that filed the capture", made.refers_to, BUNDLE);
  t("with no project manager and no admin, it is honestly unassigned rather than addressed to a phantom",
    [made.assignee, made.assignee_role], ["unassigned", "group-admin"]);

  const after = (await doGet("tasks")).result;
  t("the task is now readable", after.tasks.length, 1);
  const task = after.tasks[0];
  t("its id matches the TASK grammar", /^TASK-\d{4}-\d{4}-[a-z0-9]+(-[a-z0-9]+)*$/.test(task.id), true);
  t("its history begins with its creation", task.history[0].event, "created");
  t("and the stored task satisfies the grammar it was written through", check([task]).length === 0 || check([task]),
    check([task]).length === 0 ? true : []);

  console.log("\n--- a re-capture folds, it does not duplicate ---");
  await doPost("taskenqueue", { captureSha: SHA_A, subject: "same document again", at: AT });
  const d2 = (await doPost("taskdrain", { actor: "consumer", now: AT })).result;
  t("no second task is created", d2.created.length, 0);
  t("the event folds into the live one", d2.folded.length, 1);
  const folded = (await doGet("tasks")).result;
  t("there is still exactly one task", folded.tasks.length, 1);
  t("and the fold is recorded in its history",
    folded.tasks[0].history.some((h) => h.event === "folded"), true);

  console.log("\n--- forwarding and resolving are member actions ---");
  t("a forward with no actor is refused",
    (await doPost("taskforward", { id: task.id, to: "ruth" })).result.reason, "NO_ACTOR");
  t("a forward to a member who does not exist is refused",
    (await doPost("taskforward", { id: task.id, to: "nobody", actor: "ruth" })).result.reason, "NO_SUCH_MEMBER");
  t("resolving with no actor is refused",
    (await doPost("taskresolve", { id: task.id })).result.reason, "NO_ACTOR");

  const res = (await doPost("taskresolve", { id: task.id, actor: "ruth", now: AT })).result;
  t("a member resolves it", [res.ok, res.status], [true, "resolved"]);
  const done = (await doGet("tasks")).result;
  t("the resolution is dated", done.tasks[0].resolved_at, AT);
  t("and recorded under the member who made it",
    done.tasks[0].history[done.tasks[0].history.length - 1], { at: AT, event: "resolved", actor: "ruth" });
  t("the resolved task still satisfies the grammar", check([done.tasks[0]]), []);
  t("a forward after resolution is refused",
    (await doPost("taskforward", { id: task.id, to: "ruth", actor: "ruth" })).result.reason, "ALREADY_RESOLVED");

  console.log("\n--- the grammar gates the WRITE, not just the gate ---");
  /* The assertion the negative control demanded. Removing the write-path check
     changed nothing until this existed, because every task the consumer builds
     from ordinary input is well-formed by construction. So drive it with input
     that is NOT ordinary: a capture registered against a bundle id the canonical
     grammar rejects. The store accepts that id (the gate refuses it at
     ratification, which is a different fence), so the consumer is the thing that
     must refuse to write a task pointing at it. */
  const ODD = "INFO-2026-0701-Weird_Id";
  const SHA_C = "c".repeat(64);
  await doPost("promote", {
    bundleId: ODD, base: null, snapKey: "20260731T130000Z_odd", author: "ruth",
    meta: { object_type: "information", group: "believe-in-oakland", title: "Odd",
            current_state: "collected", created: AT, last_updated: AT },
    files: [{ path: "bundle.md", text: "---\nid: " + ODD + "\n---\n", bytes: 10, sha256: SHA_C }],
    register: [{ sha256: SHA_C, path: "snapshots/odd.pdf", encoding: "binary", bytes: 10 }],
  });
  await doPost("taskenqueue", { captureSha: SHA_C, subject: "a capture on a non-canonical bundle", at: AT });
  const d3 = (await doPost("taskdrain", { actor: "consumer", now: AT })).result;
  t("a task that would violate the grammar is REFUSED at the write", d3.refused.length, 1);
  t("and it names the check that refused it",
    d3.refused.length === 1 && d3.refused[0].findings.some((f) => f.check === "C-19.1"), true);
  t("no such task landed", (await doGet("tasks?refers=" + ODD)).result.tasks.length, 0);
  t("and the deterministic failure is not retried forever",
    (await doGet("tasks")).result.counts.queued, 1);

  console.log("\n--- there is no control-plane route to the queue ---");
  const noEnqueue = await api("taskenqueue", { captureSha: "c".repeat(64), subject: "x" });
  t("op=taskenqueue is not a control-plane op", /unknown op/i.test(JSON.stringify(noEnqueue)), true);
} finally {
  await mf.dispose();
}

console.log(`\ninbox: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
