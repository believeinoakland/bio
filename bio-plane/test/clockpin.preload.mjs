/* M0-147 — THE CLOCK-PIN INSTRUMENT. A node preload (`--import`) that FREEZES `Date.now()` and bare `new Date()` at
 * `CLOCK_PIN_MS` for this process. `clockshift.preload.mjs` (M0-22) is its sibling and the reason it is a separate
 * file: a SHIFT keeps the clock running, so a shift to 1 ms before New Year crosses it one millisecond later — long
 * before a suite's module body reads the year — and the straddle it was meant to reproduce never happens. A pin holds
 * the instant still for the whole run.
 *
 * WHAT IT REPRODUCES. A suite that read the year off its own clock and a plane that minted after midnight UTC: pin the
 * suite 1 ms before the New Year that BEGAN the plane's current year (the plane's `workerd` keeps the true wall, as
 * `clockshift.preload.mjs` states), and the suite reads the year before while every id the plane mints carries the
 * year after. Which instant to pin is the caller's; the control drivers compute it from the true wall.
 *
 * WHAT IT DOES NOT REACH, STATED AS A LIMIT: workerd (above); any read made from `node_modules/` (below — Miniflare
 * refuses a compatibility date later than its clock, so the harness keeps the wall); `performance.now()`, `process.hrtime` and timers, which
 * keep running — so a wait bounded on `Date.now()` in the test process would never expire under a pin. Neither suite
 * it is used on has one (measured: both reach their feet under it). Any other suite run under it must be checked for
 * that before its result is believed.
 */
const PIN_MS = Number(process.env.CLOCK_PIN_MS);
if (process.env.CLOCK_PIN_MS && Number.isFinite(PIN_MS)) {
  const RealDate = Date;
  const realNow = RealDate.now.bind(RealDate);
  const SELF = new URL(import.meta.url).pathname;
  /* THE SUITE'S CLOCK, NOT THE HARNESS'S. Miniflare checks its compatibility date against node's clock
     (`ERR_FUTURE_COMPATIBILITY_DATE`, measured: a whole-process pin before a suite's `compatibilityDate` ends the suite
     at its first constructor, before any assertion). Miniflare is the plane's side of the harness, and the plane's side
     keeps the true wall — so a read whose nearest caller outside this file is under `node_modules/` reads the wall,
     and every other read (the suite, its helpers, `checks/`, `scripts/`) reads the pin. */
  const pinned = () => {
    const caller = (new Error().stack || "").split("\n").slice(1).find((l) => !l.includes(SELF)) || "";
    return !caller.includes("/node_modules/");
  };
  /* Subclassing, as clockshift does: only the READING of "now" moves; an explicitly-argued `new Date(x)`, `Date.parse`,
     `Date.UTC` and every prototype method stay the real ones. */
  class PinnedDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) super(pinned() ? PIN_MS : realNow());
      else super(...args);
    }
    static now() { return pinned() ? PIN_MS : realNow(); }
  }
  Object.defineProperty(PinnedDate, "name", { value: "Date" });
  globalThis.Date = PinnedDate;
}
