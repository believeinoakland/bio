/* NEGATIVE CONTROL: (RUN 2026-08-04, REC-28, TWO ARMS, both restored byte-identical) (a) THE ITEM'S OWN, reproducing D-151 exactly — disable the two act-level refusals in store.mjs (guard the `if (/^token:/.test(String(actor)))` block at the top of taskForward and of taskResolve with `false &&`) -> 17 of these 32 assertions fail: `token:probe` RESOLVES the unassigned task (`[true,null]` where `[false,"MACHINE_CANNOT_RESOLVE"]` was wanted), the task reads `resolved` while still `unassigned`, its history holds `{event:"resolved",actor:"token:member"}` and `{event:"forwarded",actor:"token:member"}` — an obligation closed with no member in it — and MEMBER_TOKEN/ADMIN_TOKEN close tasks straight through the control plane. MEANWHILE EVERY EXISTING SUITE STAYS GREEN: 83/84, 4375 assertions passing, the only failure this file — task-fence 19, task-drain-alarm 19, queue 35, queue-state 66 all pass over the hole, which is the whole reason this suite had to be written. (b) THE CLASS HALF — restore "probe" to the `classes` of taskforward/taskresolve in index.mjs -> 3 assertions fail (both control-plane class refusals and the structural pin), and PROBE_TOKEN's op call REACHES the store, where the act refusal answers it `MACHINE_CANNOT_RESOLVE` by name in its scratch scope: the ACL narrows who knocks, the act refusal is what answers the door. Restored: 32 pass. */
/* REC-28 / D-151: A MACHINE CREDENTIAL MAY NOT RESOLVE OR FORWARD A TASK.
 *
 * The defect, verified in the source by DEC-7 and reproduced by arm (a) above:
 * `#refuseNotYours` — the REC-4 TASK-ACTOR FENCE — returns "allow" the moment a
 * task is `assignee: "unassigned"`, BEFORE it has looked at who is calling. That
 * is deliberate and stays (D-98's routing produces `unassigned` precisely when it
 * has exhausted PM and active admin, so fencing it would strand the task
 * forever). What it was never asked is whether the caller is a PERSON. So a
 * machine credential could RESOLVE an unassigned task: an obligation the record
 * raised was discharged, its history reading `actor: "token:probe"`, and no
 * member ever acted. A daemon cannot close somebody's work; it could close
 * NOBODY'S work, and closing is the act.
 *
 * THE RULE UNDER TEST, and it is one rule in a fifth and sixth place rather than
 * a new one — a machine may surface, route and prepare; a member authors,
 * resolves and concludes (MACHINE_CANNOT_RELEASE, _CONCLUDE, _REOPEN, _PUBLISH,
 * _DECLARE are the same shape):
 *   - a machine credential is refused BY NAME on both verbs — MACHINE_CANNOT_
 *     RESOLVE and MACHINE_CANNOT_FORWARD — on an UNASSIGNED task and on an
 *     ASSIGNED one alike, because the refusal is at the ACT and does not consult
 *     assignment state at all;
 *   - the refused acts are INERT: nothing is closed, nothing is re-addressed,
 *     and no `token:` actor appears anywhere in the task's history;
 *   - the ASSIGNEE still succeeds and an ADMIN MEMBER still succeeds — the fix
 *     must not strand the Tasks screen it exists to protect;
 *   - the FENCE IS KEPT: an ordinary member who is neither assignee nor admin is
 *     still NOT_YOURS on another member's task, and a member may still claim an
 *     unassigned one. The two fences answer different questions ("is this THIS
 *     member's task" / "is this a person at all") and the second is not derivable
 *     from the first, which is exactly why the hole existed;
 *   - `taskdrain` is UNTOUCHED and a machine credential still drains: draining
 *     turns queued events into routed tasks, which is surfacing work rather than
 *     discharging it.
 *
 * WHY THE PROBE IS DRIVEN AT THE DURABLE OBJECT and its class refusal at the
 * control plane. `"probe"` is removed from both ops' `classes`, so PROBE_TOKEN
 * is now stopped at the door and the string `token:probe` is never minted on
 * this route — which is why the class list ALONE cannot be the fix and is
 * asserted as the smaller half here. The actor the control plane WOULD stamp is
 * driven straight at the store, where the act refusal answers it by name; that
 * is the caller D-151 named, and it is one line of `classes` away from being
 * reachable again. MEMBER_TOKEN and ADMIN_TOKEN need no such staging: a machine
 * credential of those classes is INDISTINGUISHABLE from a session at the class
 * check, reaches both ops through the real control plane, and is refused by the
 * store — which is the half of this that could not be done with an ACL.
 *
 * EVERY REFUSAL HERE IS PAIRED WITH THE IDENTICAL CALL BY A PERSON, on the SAME
 * task with the SAME body, and that pairing is the point: an outcome that costs
 * nothing to produce is not evidence, and a forward that would have failed
 * anyway (no such member, task already resolved, not yours) would prove nothing
 * about the actor. The only difference between the refused call and the accepted
 * one is who is making it.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const AT = "2026-08-04T12:00:00Z";
const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  /* Pin the automatic drain far out so the manual drains below are not raced. */
  bindings: { ADMIN_TOKEN: "t-admin", MEMBER_TOKEN: "t-member", PROBE_TOKEN: "t-probe", VERSION: "test",
              TASK_DRAIN_DELAY_MS: "600000" },
});

try {
  const POST = async (q, body) => (await mf.dispatchFetch("http://x/api/?" + q,
    body === undefined ? { method: "POST" } : { method: "POST", body: JSON.stringify(body) })).json();

  const stub = await mf.getDurableObjectNamespace("STORE");
  const obj = stub.get(stub.idFromName("bio"));
  const doPost = async (op, body) => (await obj.fetch(`http://x/${op}`,
    { method: "POST", body: JSON.stringify(body) })).json();
  /* REC-30: op=tasks fails closed on an absent viewer. A direct-DO suite stands in
     for a machine credential — D-15's own carve-out — so it stamps class:member,
     the task-fence precedent. */
  const doGet = async (path) =>
    (await obj.fetch(`http://x/${path}${path.includes("?") ? "&" : "?"}viewer=class:member`)).json();
  const rowOf = async (id) => (await doGet("tasks")).result.tasks.find((x) => x.id === id);

  /* A task by the only route the producer has: enqueue at the DO, promote the
     capture it refers to, drain. With NO active admin on the roster the drain
     routes it `unassigned`, which is the state D-151 is about. */
  let n = 0;
  const makeTask = async () => {
    n++;
    const sha = (0xd151 * n).toString(16).padStart(64, "0");
    const bundle = `INFO-2026-08${String(10 + n).padStart(2, "0")}-machine-fixture-${n}`;
    await doPost("taskenqueue", {
      kind: "authority-undetermined", captureSha: sha,
      subject: "https://www.oaklandca.gov/documents/agenda.pdf", at: AT });
    await doPost("promote", {
      bundleId: bundle, base: null, snapKey: `20260804T120000Z_machine_${n}`, author: "consumer",
      meta: { object_type: "information", group: "believe-in-oakland", title: "Machine fixture",
              current_state: "collected", created: AT, last_updated: AT },
      files: [{ path: "bundle.md", text: "---\nid: " + bundle + "\n---\n", bytes: 10, sha256: sha }],
      register: [{ sha256: sha, path: "snapshots/agenda.pdf", encoding: "binary", bytes: 10 }],
    });
    const d = (await doPost("taskdrain", { actor: "consumer", now: AT })).result;
    const made = d.created.find((c) => c.refers_to === bundle);
    if (!made) throw new Error(`drain created no task for ${bundle}: ${JSON.stringify(d)}`);
    return made.id;
  };

  /* ------------------------------------------------------------------ phase 1:
     two honestly UNASSIGNED tasks, made while the roster is empty so routing has
     nobody to route to. One is the resolve subject, one the forward subject. */
  console.log("\n--- two unassigned tasks exist (no PM, no admin at routing time) ---");
  const taskU = await makeTask();
  const taskV = await makeTask();
  t("the resolve subject is honestly unassigned, not addressed to a phantom",
    [(await rowOf(taskU)).assignee, (await rowOf(taskU)).assignee_role], ["unassigned", "group-admin"]);
  t("and so is the forward subject", (await rowOf(taskV)).assignee, "unassigned");

  /* ------------------------------------------------------------------ the roster.
     ADMINS_FIRST: the first two members must be administrators. iris and adam are
     admins; mona and nate are ordinary members. */
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
  const S_adam = await addMember("adam", "admin");   // second admin (ADMINS_FIRST floor)
  const S_mona = await addMember("mona", "member");  // ordinary — the assignee
  const S_nate = await addMember("nate", "member");  // ordinary — the interloper
  void S_adam;
  t("adam is an active member, so a forward addressed to him is otherwise good",
    (await POST(`op=memberlist&token=t-admin`)).result.members.some((m) => m.member_id === "adam" && m.status === "active"),
    true);

  /* ------------------------------------------------------------------ phase 2:
     THE ACT REFUSAL, through the real control plane, on an UNASSIGNED task —
     the exact act D-151 says closed an obligation with no member in it. */
  console.log("\n--- a machine credential is refused BY NAME on an unassigned task (control plane) ---");
  const machineResolveM = (await POST(`op=taskresolve&token=t-member`, { id: taskU, now: AT })).result;
  t("MEMBER_TOKEN cannot RESOLVE an unassigned task", machineResolveM.ok, false);
  t("and the reason is the named act refusal", machineResolveM.reason, "MACHINE_CANNOT_RESOLVE");
  t("and the detail says a member must sign in, not that the task is somebody else's",
    /Sign in as a member/.test(machineResolveM.detail || ""), true);

  const machineResolveA = (await POST(`op=taskresolve&token=t-admin`, { id: taskU, now: AT })).result;
  t("ADMIN_TOKEN — the root of trust itself — cannot RESOLVE it either",
    [machineResolveA.ok, machineResolveA.reason], [false, "MACHINE_CANNOT_RESOLVE"]);

  const machineForwardM = (await POST(`op=taskforward&token=t-member`, { id: taskV, to: "adam", now: AT })).result;
  t("MEMBER_TOKEN cannot FORWARD an unassigned task", machineForwardM.ok, false);
  t("and the reason is the named act refusal", machineForwardM.reason, "MACHINE_CANNOT_FORWARD");
  const machineForwardA = (await POST(`op=taskforward&token=t-admin`, { id: taskV, to: "adam", now: AT })).result;
  t("ADMIN_TOKEN cannot FORWARD it either",
    [machineForwardA.ok, machineForwardA.reason], [false, "MACHINE_CANNOT_FORWARD"]);

  console.log("\n--- and `token:probe` itself, the actor D-151 names, driven at the store ---");
  /* The control plane no longer mints this actor (probe is out of `classes`, asserted
     below), so it is driven where it would arrive if that one line were changed back.
     This is the assertion the item is FOR: the act refusal, not the ACL, is the fence. */
  const probeResolve = (await doPost("taskresolve", { id: taskU, actor: "token:probe", now: AT })).result;
  t("token:probe cannot RESOLVE the unassigned task",
    [probeResolve.ok, probeResolve.reason], [false, "MACHINE_CANNOT_RESOLVE"]);
  const probeForward = (await doPost("taskforward", { id: taskV, actor: "token:probe", to: "adam", now: AT })).result;
  t("token:probe cannot FORWARD the unassigned task",
    [probeForward.ok, probeForward.reason], [false, "MACHINE_CANNOT_FORWARD"]);

  console.log("\n--- the refused acts were INERT ---");
  const stillU = await rowOf(taskU), stillV = await rowOf(taskV);
  t("the resolve subject is still open, still unassigned, still nobody's",
    [stillU.status, stillU.assignee], ["open", "unassigned"]);
  t("the forward subject is still unassigned", stillV.assignee, "unassigned");
  t("and NO `token:` actor appears anywhere in either history",
    [...stillU.history, ...stillV.history].filter((h) => /^token:/.test(h.actor || "")), []);

  /* ------------------------------------------------------------------ phase 3:
     THE PAIRED CONTROL. The identical call, the same task, the same body — only
     the caller is a person. An outcome that costs nothing to produce is not
     evidence, so the refusals above only mean something if these succeed. */
  console.log("\n--- the identical calls by a PERSON succeed: the unassigned task stays claimable (D-98) ---");
  const monaForwardsV = (await POST(`op=taskforward&${S_mona}`, { id: taskV, to: "adam", now: AT })).result;
  t("mona — an ordinary member, neither assignee nor admin — may claim the unassigned task by forwarding it",
    [monaForwardsV.ok, monaForwardsV.assignee], [true, "adam"]);
  const monaResolvesU = (await POST(`op=taskresolve&${S_mona}`, { id: taskU, now: AT })).result;
  t("and may RESOLVE the unassigned one the machine could not",
    [monaResolvesU.ok, monaResolvesU.status], [true, "resolved"]);
  const claimedU = await rowOf(taskU);
  t("and the closing act is recorded under a person",
    claimedU.history[claimedU.history.length - 1].actor, "mona");

  /* ------------------------------------------------------------------ phase 4:
     the refusal does not consult assignment state — the whole reason it is at the
     act and not at the fence. */
  console.log("\n--- the same refusal on an ASSIGNED task: it never looks at assignment ---");
  const assignTo = async (memberId) => {
    const id = await makeTask();
    const fwd = (await POST(`op=taskforward&${S_iris}`, { id, to: memberId, now: AT })).result;
    if (!fwd.ok) throw new Error(`seed-forward to ${memberId}: ${JSON.stringify(fwd)}`);
    return id;
  };
  const taskM = await assignTo("mona");
  const machineOnAssigned = (await POST(`op=taskresolve&token=t-member`, { id: taskM, now: AT })).result;
  t("a machine credential on mona's ASSIGNED task is refused with the SAME reason, not NOT_YOURS",
    machineOnAssigned.reason, "MACHINE_CANNOT_RESOLVE");
  const probeOnAssigned = (await doPost("taskforward", { id: taskM, actor: "token:probe", to: "adam", now: AT })).result;
  t("and so is token:probe on the forward verb", probeOnAssigned.reason, "MACHINE_CANNOT_FORWARD");

  /* ------------------------------------------------------------------ phase 5:
     the surface this fix exists to protect still works. */
  console.log("\n--- the ASSIGNEE still succeeds at both verbs ---");
  const monaResolve = (await POST(`op=taskresolve&${S_mona}`, { id: taskM, now: AT })).result;
  t("mona (the assignee) resolves her own task",
    [monaResolve.ok, monaResolve.status], [true, "resolved"]);
  const taskF = await assignTo("mona");
  const monaForward = (await POST(`op=taskforward&${S_mona}`, { id: taskF, to: "adam", now: AT })).result;
  t("mona (the assignee) forwards her own task", [monaForward.ok, monaForward.assignee], [true, "adam"]);

  console.log("\n--- an ADMIN MEMBER still succeeds at both verbs on another member's task ---");
  const taskG = await assignTo("mona");
  const irisResolve = (await POST(`op=taskresolve&${S_iris}`, { id: taskG, now: AT })).result;
  t("iris (admin member) resolves mona's task", [irisResolve.ok, irisResolve.status], [true, "resolved"]);
  const taskH = await assignTo("mona");
  const irisForward = (await POST(`op=taskforward&${S_iris}`, { id: taskH, to: "adam", now: AT })).result;
  t("iris (admin member) forwards mona's task", [irisForward.ok, irisForward.assignee], [true, "adam"]);

  console.log("\n--- the TASK-ACTOR FENCE is KEPT: it answers the other question ---");
  const taskI = await assignTo("mona");
  const nateResolve = (await POST(`op=taskresolve&${S_nate}`, { id: taskI, now: AT })).result;
  t("nate (a person, but not this task's) is still refused NOT_YOURS, not the act refusal",
    [nateResolve.ok, nateResolve.reason, nateResolve.assignee], [false, "NOT_YOURS", "mona"]);

  /* ------------------------------------------------------------------ phase 6:
     taskdrain is the daemon's path and draining is not resolving. */
  console.log("\n--- taskdrain is untouched: the daemon still routes work in ---");
  await doPost("taskenqueue", {
    kind: "authority-undetermined", captureSha: "d151".padStart(64, "0"),
    subject: "https://www.oaklandca.gov/documents/late.pdf", at: AT });
  const drained = (await POST(`op=taskdrain&token=t-member`, { now: AT })).result;
  t("a MEMBER_TOKEN machine credential still drains the queue, and the drain creates the task",
    [drained.ok, drained.created.length], [true, 1]);
  const drainedRow = await rowOf(drained.created[0].id);
  t("the drained task is OPEN — routing surfaced work, it did not discharge any",
    drainedRow.status, "open");

  /* ------------------------------------------------------------------ phase 7:
     the class list, the smaller half — asserted so it cannot quietly come back. */
  console.log("\n--- the OPS class list: probe is off the two member verbs, and still on taskdrain ---");
  const probeResolveOp = await POST(`op=taskresolve&token=t-probe`, { id: taskM, now: AT });
  t("PROBE_TOKEN is stopped at the control plane on taskresolve",
    [probeResolveOp.ok, probeResolveOp.error, probeResolveOp.cls], [false, "forbidden for token class", "probe"]);
  const probeForwardOp = await POST(`op=taskforward&token=t-probe`, { id: taskM, to: "adam", now: AT });
  t("PROBE_TOKEN is stopped at the control plane on taskforward",
    [probeForwardOp.ok, probeForwardOp.error, probeForwardOp.cls], [false, "forbidden for token class", "probe"]);

  const src = readFileSync(SRC, "utf8");
  const classesOf = (op) => {
    const m = src.match(new RegExp(`^\\s{2}${op}:\\s*\\{\\s*classes:\\s*\\[([^\\]]*)\\]`, "m"));
    if (!m) throw new Error(`no OPS entry for ${op}`);
    return [...m[1].matchAll(/"([a-z]+)"/g)].map((x) => x[1]);
  };
  t("structural: taskforward and taskresolve name no probe class",
    [classesOf("taskforward"), classesOf("taskresolve")], [["admin", "member"], ["admin", "member"]]);
  t("structural: taskdrain KEEPS every class — draining is not resolving",
    classesOf("taskdrain"), ["admin", "member", "probe"]);
  t("structural: both verbs keep the member and admin classes, or the Tasks screen is stranded",
    classesOf("taskresolve").includes("member") && classesOf("taskforward").includes("admin"), true);
} finally {
  await mf.dispose();
}

console.log(`\ntask-machine: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
