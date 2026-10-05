/* Run under `--disallow-code-generation-from-strings`: loads calc-grammar, then forbids every module load, clock,
   randomness source and network call, and runs the battery. Prints its answers as JSON. */
import { registerHooks } from "node:module";
const late = [];
let sealed = false;
registerHooks({ resolve(spec, ctx, next) { if (sealed) late.push(spec); return next(spec, ctx); } });
const c = await import("../../../../src/calc-grammar/index.mjs");
const { battery } = await import("./battery.mjs");
sealed = true;
const forbid = (name) => () => { throw new Error(`calc-grammar read ${name}`); };
const RealDate = Date;
globalThis.Date = new Proxy(RealDate, { construct: forbid("the clock (new Date)"), apply: forbid("the clock (Date())") });
globalThis.Date.now = forbid("the clock (Date.now)");
Math.random = forbid("Math.random");
performance.now = forbid("performance.now");
globalThis.fetch = forbid("the network (fetch)");
crypto.getRandomValues = forbid("crypto.getRandomValues");
let evalBlocked = false;
try { (0, eval)("1"); } catch { evalBlocked = true; }
const answers = battery(c);
process.stdout.write(JSON.stringify({ answers, late, evalBlocked }));
