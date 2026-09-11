/* M0-22 — THE CLOCK-ADVANCE INSTRUMENT. A node preload (`--import`) that moves
 * `Date.now()` and bare `new Date()` forward by `CLOCK_SHIFT_MS` for this
 * process AND for every child it spawns, because `NODE_OPTIONS` is inherited
 * and `scripts/battery.mjs` spawns each suite with `{ ...process.env }`.
 *
 * WHY THIS EXISTS AT ALL, AND WHY IT IS NOT AN ARGUMENT. The defect M0-22 fixes
 * is a suite that went red because the CALENDAR moved, not because anything
 * changed. The only honest way to show a fix for that is to MOVE THE CALENDAR
 * and re-run — arguing that a date is now far enough in the future is the same
 * reasoning that produced the defect. The system clock is not ours to set, so
 * the shift is applied inside node instead.
 *
 * WHAT IT REACHES, STATED AS A LIMIT RATHER THAN A CLAIM. It reaches every
 * wall-clock read in the NODE process: the harness's own date arithmetic and,
 * decisively, `checks/bio-checks.mjs`, which runs in node and holds all five of
 * the catalog's `ctx.nowMs ?? Date.now()` sites.
 *
 * IT DOES NOT REACH WORKERD. Miniflare runs the plane in a `workerd` CHILD
 * PROCESS with its own clock, so `src/store.mjs`'s `#nowMs()` fallback still
 * reads the true wall. That blind spot is NAMED rather than papered over, and
 * it is the reason the fix pins `BIO_NOW_MS` as well: a suite that binds it
 * never reaches the fallback, so for that suite the blind spot is empty. Arm
 * (4) of `clockadvance.control.mjs` proves the binding is load-bearing instead
 * of assuming it. For any suite that does NOT bind it, a result from this
 * instrument is a FLOOR on that suite's wall-clock exposure and never a
 * clearance.
 */
const SHIFT_MS = Number(process.env.CLOCK_SHIFT_MS || 0);
if (Number.isFinite(SHIFT_MS) && SHIFT_MS !== 0) {
  const RealDate = Date;
  const realNow = RealDate.now.bind(RealDate);
  /* Subclassing rather than replacing: `instanceof Date`, `Date.parse`,
     `Date.UTC` and every prototype method stay the real ones, so nothing that
     merely HOLDS a date behaves differently — only the reading of "now" moves.
     An explicitly-argued `new Date(x)` is untouched, which is what keeps every
     literal in a fixture meaning what it says. */
  class ShiftedDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) super(realNow() + SHIFT_MS);
      else super(...args);
    }
    static now() { return realNow() + SHIFT_MS; }
  }
  Object.defineProperty(ShiftedDate, "name", { value: "Date" });
  globalThis.Date = ShiftedDate;
}
