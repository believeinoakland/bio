/* D-109: the task queue drains on a Durable Object alarm.
 *
 * The mechanism is the one #armSweep proved for selections: an alarm armed on
 * enqueue, re-armed by the alarm while the queue is non-empty, self-terminating
 * when it drains. Before D-109 an undetermined-authority capture enqueued
 * correctly and NO task ever appeared unless someone called op=taskdrain by
 * hand; "automatically" was honoured only as far as the queue boundary. This
 * suite asserts the four things that make the boundary automatic:
 *
 *   1. an enqueue ARMS the alarm;
 *   2. firing the alarm DRAINS queued items into tasks;
 *   3. the alarm RE-ARMS while items remain and STOPS when the queue empties;
 *   4. the reserved alarm() entry workerd invokes really runs the drain,
 *      end-to-end, not just the onAlarm body a test can call directly.
 *
 * The producer/consumer split is preserved throughout: the enqueue path only
 * SCHEDULES the consumer (it arms an alarm); it never writes a task. That is why
 * the drain assertions below are driven by onAlarm and never by the producer.
 *
 * Determinism. `alarm()` is a reserved handler that cannot be called over RPC,
 * so its whole body is the public `onAlarm`, which the deterministic assertions
 * drive by hand. To keep those hand-driven ticks from racing the wall-clock
 * alarm an enqueue arms, this instance pins TASK_DRAIN_DELAY_MS far out of the
 * test window; a SECOND instance with a short delay proves the real alarm fires.
 *
 * NEGATIVE CONTROL (recorded in the CLAIM): neuter onAlarm's drain (skip the
 * taskDrain call) and this suite FAILS on "firing the alarm drains ..." and
 * "the queue is empty after the drain", naming the queue that was left undrained.
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

const SRC = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const script = readFileSync(SRC, "utf8");
const AT = "2026-07-31T12:00:00Z";
const BUNDLE = "INFO-2026-0700-sewer-fund-transfers";
const SHA_A = "a".repeat(64);
const TASK_ID = /^TASK-\d{4}-\d{4}-[a-z0-9]+(-[a-z0-9]+)*$/;

const makeMf = (delayMs) => new Miniflare({
  modules: true, script, modulesRoot: "/", scriptPath: SRC,
  compatibilityDate: "2026-07-01",
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  bindings: { TASK_DRAIN_DELAY_MS: String(delayMs) },
});

const doOn = (obj) => ({
  post: async (op, body) => (await obj.fetch(`http://x/${op}`, { method: "POST", body: JSON.stringify(body) })).json(),
  get: async (path) => (await obj.fetch(`http://x/${path}`)).json(),
});
const promoteBundle = (post) => post("promote", {
  bundleId: BUNDLE, base: null, snapKey: "20260731T120000Z_inbox", author: "ruth",
  meta: { object_type: "information", group: "believe-in-oakland", title: "Sewer fund transfers",
          current_state: "collected", created: AT, last_updated: AT },
  files: [{ path: "bundle.md", text: "---\nid: " + BUNDLE + "\n---\n", bytes: 10, sha256: SHA_A }],
  register: [{ sha256: SHA_A, path: "snapshots/agenda.pdf", encoding: "binary", bytes: 10 }],
});

/* ------- deterministic: onAlarm is the alarm's body, driven by hand ------- */
const mf = makeMf(600000);
try {
  const ns = await mf.getDurableObjectNamespace("STORE");
  const obj = ns.get(ns.idFromName("bio"));
  const { post, get } = doOn(obj);

  console.log("\n--- an enqueue arms the drain alarm ---");
  const t0 = Date.now();
  const e1 = (await post("taskenqueue", {
    captureSha: SHA_A, subject: "https://www.oaklandca.gov/agenda.pdf",
    locator: "https://www.oaklandca.gov/agenda.pdf", at: AT })).result;
  t("an undetermined capture enqueues an event", e1.queued, true);
  t("and the enqueue ARMS an alarm in the future", typeof e1.armedAt === "number" && e1.armedAt > t0, true);

  console.log("\n--- the alarm re-arms while items remain ---");
  /* The capture is not filed in any bundle yet, so the consumer keeps the event
     rather than inventing a refers_to. The queue is still non-empty, so the
     alarm must re-arm rather than terminate on a queue it did not empty. */
  const a0 = await obj.onAlarm();
  t("a tick with the capture still unfiled drains nothing", a0.drained, 0);
  t("the event is kept, not dropped", a0.waiting, 1);
  t("the queue is still non-empty", a0.remaining, 1);
  t("so the alarm RE-ARMS while items remain",
    [a0.rearmed, typeof a0.nextAt === "number"], [true, true]);

  console.log("\n--- once the capture is filed, firing the alarm drains it into a task ---");
  await promoteBundle(post);
  const a1 = await obj.onAlarm();
  t("firing the alarm drains the queued item into a task", a1.drained, 1);
  t("exactly one task is created", a1.created, 1);
  t("the queue is empty after the drain", a1.remaining, 0);
  t("and with nothing left to wake for the alarm STOPS (self-terminating)",
    [a1.rearmed, a1.nextAt], [false, null]);

  console.log("\n--- the drained task is real, not a bare counter ---");
  const listed = (await get("tasks")).result;
  t("the drained task is now readable", listed.tasks.length, 1);
  t("and the queue count is zero", listed.counts.queued, 0);
  const task = listed.tasks[0];
  t("it refers to the bundle that filed the capture", task.refers_to, BUNDLE);
  t("its id matches the TASK grammar", TASK_ID.test(task.id), true);
  t("and it was written by the alarm-driven consumer",
    [task.history[0].event, task.history[task.history.length - 1].actor], ["created", "alarm"]);

  console.log("\n--- an alarm tick on an empty queue is a no-op and stays terminated ---");
  const a2 = await obj.onAlarm();
  t("an empty tick creates nothing", [a2.drained, a2.created], [0, 0]);
  t("and leaves no alarm pending", [a2.rearmed, a2.nextAt], [false, null]);

  console.log("\n--- the manual op=taskdrain still works: the alarm did not replace it ---");
  /* D-109 makes draining automatic; it does not remove the manual consumer. A
     fresh filed capture, drained by hand, must still produce its task. */
  const BUNDLE2 = "INFO-2026-0701-manual-coexist", SHA_D = "d".repeat(64);
  await post("promote", {
    bundleId: BUNDLE2, base: null, snapKey: "20260731T130000Z_manual", author: "ruth",
    meta: { object_type: "information", group: "believe-in-oakland", title: "Manual coexist",
            current_state: "collected", created: AT, last_updated: AT },
    files: [{ path: "bundle.md", text: "---\nid: " + BUNDLE2 + "\n---\n", bytes: 10, sha256: SHA_D }],
    register: [{ sha256: SHA_D, path: "snapshots/x.pdf", encoding: "binary", bytes: 10 }],
  });
  await post("taskenqueue", { captureSha: SHA_D, subject: "a manually drained capture", at: AT });
  const dm = (await post("taskdrain", { actor: "consumer", now: AT })).result;
  t("op=taskdrain still drains by hand, alongside the alarm", dm.created.length, 1);
} finally {
  await mf.dispose();
}

/* ---- end-to-end: the RESERVED alarm() entry actually fires and drains ---- */
const mf2 = makeMf(150);
try {
  const ns = await mf2.getDurableObjectNamespace("STORE");
  const obj = ns.get(ns.idFromName("bio"));
  const { post, get } = doOn(obj);

  console.log("\n--- the reserved alarm() entry drains end-to-end when workerd fires it ---");
  await promoteBundle(post);
  /* No manual onAlarm here: the enqueue arms the real alarm, and workerd is left
     to invoke alarm() -> onAlarm -> taskDrain on its own. */
  await post("taskenqueue", {
    captureSha: SHA_A, subject: "https://www.oaklandca.gov/agenda.pdf",
    locator: "https://www.oaklandca.gov/agenda.pdf", at: AT });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let seen = 0;
  for (let i = 0; i < 50; i++) {           /* bounded ~5s, so a neutered drain FAILS rather than hangs */
    await sleep(100);
    seen = (await get("tasks")).result.tasks.length;
    if (seen >= 1) break;
  }
  t("the alarm workerd fired created the task without any manual drain", seen, 1);
} finally {
  await mf2.dispose();
}

console.log(`\ntask-drain-alarm: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
