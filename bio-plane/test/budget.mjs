/* budget.mjs — M0-107: AN EXPIRED BUDGET MEASURED NOTHING, SO IT READS *NOT MEASURED*, NEVER A FINDING.
 *
 * THE DEFECT. A suite that spawns a subprocess with `timeout:` (or waits on a wall-clock deadline) and
 * then asserts on what came back reads an EXPIRY as a FINDING: the child was killed, its output is short,
 * its status is null, and every assertion over it fails as though the SUBJECT were wrong. Under load that is
 * a false RED — DIST #4's 0.71.0 gate read RED on `owed-controls` A13/A13b beside a concurrent battery
 * (M0-103) — and since D-293 a false RED is RECORDED and refuses the push.
 *
 * THE RULING (BOB #28, 2026-09-22, item 5; written into `docs/development/VERIFICATION.md`): an expired
 * budget measured nothing, so it reads NOT MEASURED, naming what was not measured — never a finding and
 * never GREEN. `ETIMEDOUT` IS ITS ONLY TEST: a subject that dies by its own signal is a FINDING (measured on
 * node v26: an expiry sets `error.code === "ETIMEDOUT"` with `signal: "SIGTERM"`; a child that SIGTERMs itself
 * has the same `signal` and NO error), so M0-103's "or the signal is set" is not taken.
 *
 * THE CONTRACT WITH THE BATTERY. On expiry `budgetAssert` does two things and both are load-bearing:
 *   1. it prints ONE marker line, `TIMEOUT (M0-107) [pid <this suite's pid>]: …`, naming the site, the
 *      budget and what was NOT MEASURED — the pid is what lets `scripts/battery.mjs` tell THIS suite's
 *      marker from a marker a child echoed (a suite driving a scratch battery prints its children's output);
 *   2. it records ONE FAILING assertion through the suite's own `t`, so the suite's tally counts it and
 *      its exit is non-zero exactly as before — the battery, not the suite, decides what a failure MEANS.
 * The caller then SKIPS every assertion that would read the expired result. `scripts/battery.mjs` reads a
 * suite whose failures are ALL accounted for by its own markers as NOT MEASURED; one failure more than its
 * markers is RED. So the only honest way to use this is to skip what the expiry did not measure.
 *
 * HOW A LIAR PASSES M0-107, stated before anything else here: raise every budget until none expires. That
 * hides a REAL hang behind a longer wait, and the hang is then read as nothing at all. So nothing here
 * scales, raises or ignores a budget: the number the caller passes is the number the child gets, and
 * `battery-verdict.test.mjs` plants a hang and asserts it is still NAMED, within its budget.
 *
 * NEGATIVE CONTROL: DECLARED IN THE SUITES THAT USE THIS, and driven by `test/m0107-budget.control.mjs`
 * (a 1 ms budget on `owed-controls`'s `--strict` spawn fails its budget assertion by name and no finding).
 */

export const TIMEOUT_TAG = "TIMEOUT (M0-107)";

/* The marker the battery reads. `scripts/battery.mjs` RESTATES it (scratch estates copy the runner without
   `test/`), and `budget-sweep.test.mjs` pins the two sources equal, so they cannot drift apart in silence. */
export const TIMEOUT_MARKER_RE = /^TIMEOUT \(M0-107\) \[pid (\d+)\]: (.*)$/gm;

/* THE ONLY TEST (BOB #28). A spawn result, an `execFileSync` error, or an `until()` result. */
export const expired = (r) => !!(r && ((r.error && r.error.code === "ETIMEDOUT") || r.code === "ETIMEDOUT"));

/* The one line. `what` names what was NOT measured — the assertions the caller will now skip. */
export function timeoutMarker(name, ms, what, pid = process.pid) {
  return `${TIMEOUT_TAG} [pid ${pid}]: ${name} — its ${ms} ms budget EXPIRED (ETIMEDOUT), so NOT MEASURED: ${what}`;
}

/* ONE named assertion through the suite's own `t(name, got, want)`. Returns true when the budget held and
   the caller may read the result; false when it expired and the caller must skip what it would have read. */
export function budgetAssert(t, name, r, ms, what) {
  const exp = expired(r);
  if (exp) console.log(timeoutMarker(name, ms, what));
  t(`${name} — its ${ms} ms budget did not expire (M0-107)`,
    exp ? `EXPIRED — NOT MEASURED: ${what}` : "within budget", "within budget");
  return !exp;
}

/* AN ASYNCHRONOUS CHILD'S BUDGET. `done` is the promise its `close` resolves; the answer is `{ value, error }`
   in the shape `expired()` reads. On expiry the CALLER kills the child it started (by that child's pid, never by
   a pattern) — this helper owns no process. */
export async function withinBudget(done, ms) {
  let timer;
  const clock = new Promise((res) => { timer = setTimeout(() => res({ value: undefined, error: { code: "ETIMEDOUT" } }), ms); });
  try { return await Promise.race([done.then((value) => ({ value, error: null })), clock]); }
  finally { clearTimeout(timer); }
}

/* A WALL-CLOCK DEADLINE, spelled once. Polls `pred` every `stepMs` until it is true or `ms` passes, and
   answers in the shape `expired()` reads: `{ ok, waited, error }`, `error.code === "ETIMEDOUT"` only when the
   deadline passed with `pred` still false. A caller that ALSO knows the subject has ended (a child that
   exited) passes that as `stop`: the wait is then over and NOT expired — a subject that died before it got
   there is a FINDING about the subject, never a timeout. */
export async function until(pred, ms, { stepMs = 50, stop = () => false } = {}) {
  const t0 = Date.now();
  for (;;) {
    if (pred()) return { ok: true, waited: Date.now() - t0, error: null };
    if (stop()) return { ok: false, waited: Date.now() - t0, error: null };
    if (Date.now() - t0 >= ms) return { ok: false, waited: Date.now() - t0, error: { code: "ETIMEDOUT" } };
    await new Promise((res) => setTimeout(res, stepMs));
  }
}
