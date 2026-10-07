/* Preloaded (`node --import`) into a bundler command under test (R30): it watches `process.env` and appends one line
 * to `$ENV_SPY_LOG` each time the command itself asks for `BIO_RELEASE_SEED` — reads it, tests for it, or asks for
 * its descriptor. Node's own copying of the environment into a child process (`node:child_process`, which hands a
 * child what the parent was given and reads nothing for itself) is not the command asking, and is not logged. */
import { appendFileSync } from "node:fs";

const LOG = process.env.ENV_SPY_LOG;
const WATCHED = "BIO_RELEASE_SEED";
const real = process.env;
const asked = (how) => {
  const stack = new Error().stack || "";
  if (/node:(?:internal\/)?child_process/.test(stack)) return;
  if (LOG) appendFileSync(LOG, JSON.stringify({ how, at: stack.split("\n").slice(2, 5).map((l) => l.trim()) }) + "\n");
};
process.env = new Proxy(real, {
  get(t, k) { if (k === WATCHED) asked("get"); return Reflect.get(t, k); },
  has(t, k) { if (k === WATCHED) asked("has"); return Reflect.has(t, k); },
  getOwnPropertyDescriptor(t, k) { if (k === WATCHED) asked("descriptor"); return Reflect.getOwnPropertyDescriptor(t, k); },
});
