/* NEGATIVE CONTROL: (run 2026-07-31) neuter the TASK-ACTOR FENCE — make #refuseNotYours always return null so it never fires -> 9 assertions fail: nate's resolve of mona's task now succeeds (its NOT_YOURS + who-it-is-with checks fail), nate's forward mutates the task (the two inertness checks fail), nate's forward now trips ALREADY_RESOLVED not NOT_YOURS (its reason/structured checks fail), and the spoofed-actor resolve succeeds. Restored, 19 pass. */
/* REC-4: the server-side TASK-ACTOR FENCE (D-98; construct T · TASK).
 *
 * The plane stamps the actor honestly into a task's history, so who resolved or
 * forwarded a task was always TRACEABLE — but until this fence it was not
 * PREVENTED: any member-class credential could resolve or forward ANY task by
 * id. UI-1 hides the verb on another member's task, but that gating is cosmetic
 * until the plane enforces it. This suite proves the plane enforces it, and it
 * drives the fence THROUGH THE CONTROL PLANE so the refusal path is exercised
 * the way a real caller reaches it, with the actor stamped from the session
 * rather than sent by the browser.
 *
 * The rule under test (construct's refusal shape "this is not yours to resolve,
 * and here is who it is with"):
 *   - a member who is neither the assignee nor an admin is REFUSED taskResolve
 *     AND taskForward on another's assigned task, with reason NOT_YOURS naming
 *     who it is with;
 *   - the ASSIGNEE succeeds; an ADMIN succeeds;
 *   - an `unassigned` task stays CLAIMABLE (D-98 routing keeps that path open),
 *     so a non-assignee, non-admin MEMBER may resolve it.
 *
 * NARROWED 2026-08-04 (REC-28, D-151), and this suite is why the narrowing was
 * needed. The claimability rule above read "any caller", and every assertion here
 * drove it with a member SESSION — so the suite proved the rule for people and
 * said nothing about machines, while the code allowed both. A machine credential
 * could RESOLVE an unassigned task and close an obligation with no member act.
 * The rule is unchanged for the callers this suite tests; the missing half is
 * `test/task-machine.test.mjs`, which refuses a `token:` actor at the ACT
 * (MACHINE_CANNOT_RESOLVE / MACHINE_CANNOT_FORWARD) before this fence is reached.
 * BOTH fences stand: this one answers *is this THIS member's task*, that one
 * answers *is this a person at all*.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const AT = "2026-07-31T12:00:00Z";
const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  /* Pin the automatic drain far out so the manual drains below are not raced. */
  bindings: { ADMIN_TOKEN: "t-admin", MEMBER_TOKEN: "t-member", PROBE_TOKEN: "t-probe", VERSION: "test",
              TASK_DRAIN_DELAY_MS: "600000" },
});

/* Control plane. Task ops answer wrapped in `.result` (the DO wraps every op
   result and the task dispatch preserves it), exactly as op=login does. */
const POST = async (q, body) => (await mf.dispatchFetch("http://x/api/?" + q,
  body === undefined ? { method: "POST" } : { method: "POST", body: JSON.stringify(body) })).json();

try {
  const stub = await mf.getDurableObjectNamespace("STORE");
  const obj = stub.get(stub.idFromName("bio"));
  const doPost = async (op, body) => (await obj.fetch(`http://x/${op}`,
    { method: "POST", body: JSON.stringify(body) })).json();
  /* REC-30: op=tasks fails closed on an absent viewer (a task's `refers_to` is a
     bundle id and the D-15 predicate governs which rows may be named). A direct-DO
     suite stands in for a machine credential — D-15's own carve-out — so it stamps
     class:member; unstamped, these reads are empty and assert nothing. */
  const doGet = async (path) =>
    (await obj.fetch(`http://x/${path}${path.includes("?") ? "&" : "?"}viewer=class:member`)).json();
  const rowOf = async (id) => (await doGet("tasks")).result.tasks.find((x) => x.id === id);

  /* Create a task by the only route the producer has (enqueue at the DO), file
     its capture (promote), and drain it. With NO active admin the drain routes
     it `unassigned`; with an admin present it routes to the first admin. Each
     call uses a fresh, hex-only capture sha + bundle so tasks are independent. */
  let n = 0;
  const makeTask = async () => {
    n++;
    const sha = n.toString(16).padStart(64, "0");
    const bundle = `INFO-2026-07${String(10 + n).padStart(2, "0")}-fence-fixture-${n}`;
    await doPost("taskenqueue", {
      kind: "authority-undetermined", captureSha: sha,
      subject: "https://www.oaklandca.gov/documents/agenda.pdf", at: AT });
    await doPost("promote", {
      bundleId: bundle, base: null, snapKey: `20260731T120000Z_fence_${n}`, author: "consumer",
      meta: { object_type: "information", group: "believe-in-oakland", title: "Fence fixture",
              current_state: "collected", created: AT, last_updated: AT },
      files: [{ path: "bundle.md", text: "---\nid: " + bundle + "\n---\n", bytes: 10, sha256: sha }],
      register: [{ sha256: sha, path: "snapshots/agenda.pdf", encoding: "binary", bytes: 10 }],
    });
    const d = (await doPost("taskdrain", { actor: "consumer", now: AT })).result;
    const made = d.created.find((c) => c.refers_to === bundle);
    if (!made) throw new Error(`drain created no task for ${bundle}: ${JSON.stringify(d)}`);
    return made.id;
  };

  /* --------------------------------------------------------------- phase 1:
     an UNASSIGNED task, made while no admin exists so routing has nobody to
     route to and honestly leaves it unassigned. Kept for phase 4. */
  console.log("\n--- an unassigned task exists (no PM, no admin at routing time) ---");
  const taskU = await makeTask();
  const uRow = await rowOf(taskU);
  t("the task is honestly unassigned, not addressed to a phantom",
    [uRow.assignee, uRow.assignee_role], ["unassigned", "group-admin"]);

  /* ------------------------------------------------------------------ members.
     ADMINS_FIRST: the first two members must be administrators, so iris and adam
     are admins; mona and nate are ordinary members. iris is the admin actor. */
  console.log("\n--- a roster: two admins, two ordinary members ---");
  const addMember = async (memberId, role) => {
    const a = await POST(`op=memberadd&token=t-admin`, { memberId, cover: memberId, role });
    if (!a.result.ok) throw new Error(`memberadd ${memberId}: ${JSON.stringify(a.result)}`);
    const e = await POST("op=enroll", { invite: a.result.invite, handle: memberId, password: `${memberId}-passphrase-x` });
    if (!e.result.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(e.result)}`);
    const l = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-x` });
    if (!l.result.ok) throw new Error(`login ${memberId}: ${JSON.stringify(l.result)}`);
    return "token=" + l.result.token;
  };
  const S_iris = await addMember("iris", "admin");   // admin
  await addMember("adam", "admin");                   // second admin (ADMINS_FIRST floor)
  const S_mona = await addMember("mona", "member");   // ordinary — the assignee
  const S_nate = await addMember("nate", "member");   // ordinary — the interloper

  /* With admins present, a freshly drained task routes to the first admin (iris),
     which proves the roster is live and gives us a deterministic starting owner. */
  const seed = await makeTask();
  t("a drained task now routes to the first active admin, iris", (await rowOf(seed)).assignee, "iris");

  /* Assign a fresh task to mona: drained task lands on iris, then iris — assignee
     AND admin — forwards it to mona. */
  const assignTo = async (memberId) => {
    const id = await makeTask();
    const fwd = (await POST(`op=taskforward&${S_iris}`, { id, to: memberId, now: AT })).result;
    if (!fwd.ok) throw new Error(`seed-forward to ${memberId}: ${JSON.stringify(fwd)}`);
    return id;
  };

  /* --------------------------------------------------------------- phase 2 & 3:
     the fence on an ASSIGNED task. */
  console.log("\n--- a member who is neither assignee nor admin is REFUSED both verbs ---");
  const taskM = await assignTo("mona");
  const baseM = await rowOf(taskM);
  t("the task is now mona's", [baseM.assignee, baseM.assignee_role], ["mona", "member"]);

  const nateResolve = (await POST(`op=taskresolve&${S_nate}`, { id: taskM, now: AT })).result;
  t("nate cannot RESOLVE mona's task", nateResolve.ok, false);
  t("and the reason is the named fence", nateResolve.reason, "NOT_YOURS");
  t("and it names who it is with (structured)", nateResolve.assignee, "mona");
  t("and the human detail names who it is with", /it is with mona/.test(nateResolve.detail || ""), true);

  const nateForward = (await POST(`op=taskforward&${S_nate}`, { id: taskM, to: "adam", now: AT })).result;
  t("nate cannot FORWARD mona's task", nateForward.ok, false);
  t("and the reason is the named fence", nateForward.reason, "NOT_YOURS");
  t("and it names who it is with (structured)", nateForward.assignee, "mona");

  const stillM = await rowOf(taskM);
  t("the refused acts were inert: assignee and status unchanged",
    [stillM.assignee, stillM.status], [baseM.assignee, baseM.status]);
  t("and no forwarded/resolved event was appended by the refused acts",
    stillM.history.length, baseM.history.length);

  console.log("\n--- the ASSIGNEE succeeds at both verbs ---");
  const taskA = await assignTo("mona");
  const monaForward = (await POST(`op=taskforward&${S_mona}`, { id: taskA, to: "nate", now: AT })).result;
  t("mona (the assignee) can forward her own task", [monaForward.ok, monaForward.assignee], [true, "nate"]);
  const taskB = await assignTo("mona");
  const monaResolve = (await POST(`op=taskresolve&${S_mona}`, { id: taskB, now: AT })).result;
  t("mona (the assignee) can resolve her own task", [monaResolve.ok, monaResolve.status], [true, "resolved"]);

  console.log("\n--- an ADMIN succeeds at both verbs on another member's task ---");
  const taskC = await assignTo("mona");
  const adminForward = (await POST(`op=taskforward&${S_iris}`, { id: taskC, to: "nate", now: AT })).result;
  t("iris (admin) can forward mona's task (admin override)", [adminForward.ok, adminForward.assignee], [true, "nate"]);
  const taskD = await assignTo("mona");
  const adminResolve = (await POST(`op=taskresolve&${S_iris}`, { id: taskD, now: AT })).result;
  t("iris (admin) can resolve mona's task (admin override)", [adminResolve.ok, adminResolve.status], [true, "resolved"]);

  console.log("\n--- an UNASSIGNED task stays CLAIMABLE per D-98 routing ---");
  /* nate is neither its assignee (it has none) nor an admin, yet routing intends
     an unassigned task to remain claimable/routable by hand. The fence must NOT
     strand it. He is also, and this is the part the assertion below did not used
     to say, A PERSON: a MACHINE credential reaching the same call is refused
     MACHINE_CANNOT_RESOLVE at the act (REC-28/D-151, task-machine.test.mjs). */
  const nateClaims = (await POST(`op=taskresolve&${S_nate}`, { id: taskU, now: AT })).result;
  t("a non-assignee, non-admin member may resolve an unassigned task", [nateClaims.ok, nateClaims.status], [true, "resolved"]);
  const claimed = await rowOf(taskU);
  t("and the claim is recorded under nate", claimed.history[claimed.history.length - 1].actor, "nate");

  console.log("\n--- the actor is the plane's to stamp, never the browser's ---");
  /* nate tries to sign a resolution as mona by sending actor in the body. The
     control plane overwrites it from the session, so the fence still sees nate. */
  const taskE = await assignTo("mona");
  const spoof = (await POST(`op=taskresolve&${S_nate}`, { id: taskE, actor: "mona", now: AT })).result;
  t("a spoofed actor in the body does not get nate past the fence", spoof.reason, "NOT_YOURS");
} finally {
  await mf.dispose();
}

console.log(`\ntask-fence: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
