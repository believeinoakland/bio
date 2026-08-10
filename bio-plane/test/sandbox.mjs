/* The suite's own temp sandbox — imported for its SIDE EFFECT, not its exports.
 *
 * D-186: the battery leaked 23,263 `miniflare-*` directories holding 41.0 GB
 * into the machine's `$TMPDIR` and filled the disk to zero, at which point
 * every command failed before it started and nothing could be committed or
 * pushed. The cost was never the disk.
 *
 * THE MECHANISM, MEASURED 2026-08-04 rather than assumed, because the obvious
 * reading is wrong in an instructive way. `Miniflare#dispose()`
 * (miniflare 4.20260722.0, `dist/src/index.js:104655`) does two things in this
 * order:
 *
 *     this.#removeExitHook?.();                              // disarm
 *     removeDir(this.#tmpPath, { fireAndForget: true });     // and do not wait
 *
 * The exit hook is miniflare's own `process.on("exit")` handler, and it removes
 * the sandbox SYNCHRONOUSLY. `dispose()` unregisters it and then starts the
 * removal without awaiting it. Every suite here ends
 * `await mf.dispose(); process.exit(fail ? 1 : 0)` — as `hygiene.test.mjs`
 * REQUIRES, so a lingering handle can never turn a green run into a hang — and
 * `process.exit()` on the next line kills the process before the unawaited
 * removal lands, with the safety net already taken down.
 *
 * So the leak is on the SUCCESS path, which inverts the intuition this fix was
 * commissioned on: a suite that THROWS mid-run cleans up perfectly, because it
 * never reaches `dispose()` and miniflare's exit hook is still armed. Probed
 * three ways, three runs each: `dispose()`+`process.exit()` leaked 3 of 3;
 * throwing without disposing leaked 0 of 3; `dispose()` plus a 250 ms settle
 * leaked 0 of 3. A `finally` around the suite body would therefore have fixed
 * NOTHING, and sleeping to let the race resolve is not a mechanism.
 *
 * THE FIX IS TO OWN THE GROUND INSTEAD OF CHASING THE RACE. `os.tmpdir()` reads
 * `$TMPDIR` on every call, so this module makes one directory, points the whole
 * process at it, and removes it synchronously when the process exits. Miniflare
 * still picks its own random name and still fails to finish removing it — but
 * it now does that INSIDE a directory we delete outright, and `rmSync` in an
 * `exit` listener cannot be outrun because `process.exit()` runs `exit`
 * listeners to completion before it returns to the OS.
 *
 * It covers the suites that mint their own sandboxes for free, for the same
 * reason: `ratify-`, `sshsig-`, `signpage-`, `attest-`, `reuse-ratify-`,
 * `publish-`, `publishedcase-` and `reeval-` all `mkdtempSync(join(tmpdir(),…))`
 * and so land inside the owned directory too. Nothing else changes for a suite;
 * the import is the whole contract, and `hygiene.test.mjs` requires it of every
 * suite that builds a Miniflare or mkdtemps, so the list maintains itself
 * rather than falling behind the directory the way the old `npm test` chain did
 * (D-93).
 *
 * WHAT THIS DOES NOT COVER, and why `scripts/battery.mjs` sweeps orphans: a
 * process killed with SIGKILL runs no handler at all. Its directory carries the
 * pid in its name so the sweep can tell a dead owner from a live one.
 *
 * NOT imported by the probes (`*-probe.mjs`, `*-scale.mjs`). They are not
 * battery, they are bounded separately, and `tier1-coverage-probe.mjs` keeps a
 * deliberately PERSISTENT PDF cache in `$TMPDIR` that this module would delete.
 *
 * D-282, 2026-08-10: THIS MODULE NOW TAKES A SECOND SIDE EFFECT, and it is stated
 * here rather than left to be discovered. `./stdio.mjs` makes stdout and stderr
 * synchronous, so the `process.exit()` on the last line of every suite — the same
 * line this module's whole header is about — cannot discard the suite's own tally
 * when a reader hands it a pipe. It is imported here as well as by every suite so
 * that the CONTROL and PROBE harnesses which already take this module's side
 * effect take that one too; D-282 was found by a control arm, not by the battery.
 */
import "./stdio.mjs";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/* Read the host's temp directory BEFORE redirecting, so a suite spawned by a
   battery that has already redirected still nests rather than escaping. */
const HOST_TMP = tmpdir();

/* The pid is in the NAME because it is the only thing a surviving directory can
   tell a later sweep about its owner: a directory whose pid is gone is garbage,
   and one whose pid is alive may be a concurrent worker's battery in flight.
   Deleting that second kind is the failure this whole item exists to avoid — a
   live sandbox WAS in flight during the manual cleanup that found D-186, and
   removing it would have broken a verification in progress. */
export const SANDBOX = mkdtempSync(join(HOST_TMP, `bio-battery-${process.pid}-`));

/* os.tmpdir() consults $TMPDIR on every call and caches nothing, so this
   redirects miniflare, the suites' own mkdtemps, and anything else in the
   process that asks the platform where to put temporary files. */
process.env.TMPDIR = SANDBOX;

let swept = false;
export const sweepSandbox = () => {
  if (swept) return;
  swept = true;
  /* Synchronous on purpose. The whole defect is an asynchronous removal losing
     a race with process exit; an async sweep here would reproduce it. */
  try { rmSync(SANDBOX, { recursive: true, force: true, maxRetries: 3 }); } catch { /* orphan sweep gets it */ }
};

process.on("exit", sweepSandbox);

/* A signal kills the process WITHOUT running `exit` listeners unless something
   is listening for the signal itself, so these are not redundant with the line
   above. Miniflare installs its own SIGINT/SIGTERM handlers, but only while an
   instance is undisposed, and half the suites here outlive their instances. */
for (const [sig, code] of [["SIGINT", 130], ["SIGTERM", 143], ["SIGHUP", 129]]) {
  process.on(sig, () => { sweepSandbox(); process.exit(code); });
}
