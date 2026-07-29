/* Measuring what a capture actually costs in compute, and finding out where the
 * runtime cuts it off.
 *
 * The subrequest ceiling was found by being refused: the runtime throws a
 * distinguishable error, the code catches it, records the count, and stops on
 * its own terms next time. CPU is not like that. Exceeding the CPU limit
 * TERMINATES THE ISOLATE. There is no catch block, no chance to write a record,
 * and nothing for the next invocation to read. The caller sees an opaque error.
 *
 * So "determine and record limits empirically" has to mean two different things
 * for CPU, and both are here.
 *
 * 1. CONSUMPTION is measured continuously, in every real capture, and recorded.
 *    That is the useful number: knowing a capture spends 6ms against a 10ms
 *    ceiling tells you the headroom before anything breaks, which is strictly
 *    better than learning the ceiling by being killed at it.
 *
 * 2. The CEILING is found by a deliberate stepped probe that checkpoints after
 *    every step. When the isolate is killed, the checkpoint from the last
 *    completed step survives, and the NEXT probe reads it and knows the ceiling
 *    lies between that step and the one after. It converges without any single
 *    invocation ever having to report its own death.
 *
 * MEASURED 2026-07-29 and it changed this file. The first version timed
 * synchronous segments with Date.now() and reported ZERO for every segment of
 * every capture. Cloudflare freezes the clock during synchronous execution as a
 * timing-attack defence, so a Worker cannot time its own compute at all. The
 * clock advances only at I/O boundaries, which is why the stepped probe below
 * DOES produce rising numbers: each step is followed by a durable checkpoint,
 * and that write is the I/O that lets the clock move.
 *
 * So consumption is counted in WORK (bytes hashed, references parsed, entries
 * serialised) and the ceiling is measured in REFERENCE ITERATIONS. Neither is a
 * millisecond, and that is honest rather than a limitation: a millisecond
 * reported from inside a Worker would be a fabrication.
 *
 * The first live probe, on Workers Free, completed 20 steps of 2,000,000
 * iterations, 40,000,000 in total, before the isolate was killed during step 21.
 * The documented free-plan figure is 10ms of CPU per invocation, and 40 million
 * modular multiplications is not 10ms of anything. Whatever is enforced here is
 * not the documented number, which is the entire argument for measuring.
 */

/** A meter that counts WORK, because time cannot be measured here.
 *
 *  The first version of this timed synchronous segments with Date.now() and
 *  reported zero for every segment of every capture, on every real page. That is
 *  not a bug in the meter. Cloudflare FREEZES THE CLOCK during synchronous
 *  execution as a timing-attack defence: Date.now() returns the same value
 *  throughout a block of compute and only advances at an I/O boundary. Nothing
 *  running inside a Worker can time its own compute, and any design that
 *  depends on doing so is dead on arrival.
 *
 *  What CAN be measured is the work itself, and the work is what drives the
 *  cost: bytes hashed, references parsed, entries serialised. Those are exact,
 *  they are comparable between runs and between instances, and they are the
 *  numbers that would explain a kill after the fact. So this counts calls and
 *  bytes per segment and reports no times at all rather than reporting zeros
 *  that look like measurements.
 *
 *  The CEILING is found in the same currency by cpuProbe below: reference
 *  iterations, not milliseconds. */
export function makeMeter() {
  const seg = Object.create(null);
  const bump = (label, bytes) => {
    const e = seg[label] || (seg[label] = { calls: 0, bytes: 0 });
    e.calls++;
    if (typeof bytes === "number" && Number.isFinite(bytes)) e.bytes += bytes;
  };
  return {
    /** Run a synchronous block, counting it. `bytes` is the size of what it
     *  worked on, when that is known and meaningful. */
    sync(label, fn, bytes) { bump(label, bytes); return fn(); },
    /** Same, for an await that is compute rather than I/O: a crypto digest is
     *  async in the Workers API and is not a network wait. */
    async cpuAwait(label, fn, bytes) { bump(label, bytes); return await fn(); },
    report() {
      const calls = Object.values(seg).reduce((a, e) => a + e.calls, 0);
      const bytes = Object.values(seg).reduce((a, e) => a + e.bytes, 0);
      return { work_calls: calls, work_bytes: bytes, segments: { ...seg },
        measured_ms: null,
        note: "COUNTS, not times. Cloudflare freezes Date.now() during synchronous execution as a "
            + "timing-attack defence, so a Worker cannot measure its own compute and any millisecond "
            + "figure reported from inside one is meaningless. These are the quantities that DRIVE "
            + "the cost and that would explain a kill afterwards. The ceiling is measured separately, "
            + "in reference iterations, by op=cpuprobe." };
    },
  };
}

/* ------------------------------------------------------------------ *
 * Finding the ceiling
 * ------------------------------------------------------------------ */

/** Busy-work with no allocation growth and no optimiser escape, so a step costs
 *  roughly the same every time. Deliberately not crypto: a digest's cost depends
 *  on input size and platform acceleration, which makes steps incomparable. */
export function burn(iterations) {
  let x = 1;
  for (let i = 0; i < iterations; i++) x = (x * 1103515245 + 12345) % 2147483647;
  return x;
}

/** One probe pass. Burns in increasing steps, calling `checkpoint(step, ms)`
 *  after each, and returns when the declared budget is reached.
 *
 *  If the isolate is killed mid-step, this function never returns and never
 *  reports anything: the checkpoint written after the LAST COMPLETED step is
 *  the whole record, which is why the checkpoint has to be durable rather than
 *  buffered until the end. That is the entire design of this thing. */
export async function cpuProbe({ checkpoint, startStep = 0, maxStep = 40,
                                 iterationsPerStep = 2_000_000, budgetMs = 20_000,
                                 now = () => Date.now() }) {
  const t0 = now();
  let step = startStep;
  for (; step < maxStep; step++) {
    burn(iterationsPerStep);
    const elapsed = now() - t0;
    await checkpoint(step + 1, elapsed);
    if (elapsed >= budgetMs) return { completed: step + 1, elapsed_ms: elapsed, reason: "BUDGET_REACHED" };
  }
  return { completed: step, elapsed_ms: now() - t0, reason: "MAX_STEP_REACHED" };
}
