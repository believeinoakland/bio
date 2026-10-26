/* screens-entry, interface-shell R21 ("self-contained"): the page holds each screen function as its own text, so no function a screen
   serves may name a value the module declares at its own scope (S-1, re-walk 11: `setup`'s zone step named `ZONE_PATH`, the page threw
   a `ReferenceError` that the shell's read loop swallowed, and every part after the claim stayed "Still loading").
   Two checks over EVERY screen of `SCREENS`: (1) a probe runs each served function, and each function it is handed, where no name
   but the platform's own is in scope, and lists every other name it looks up; (2) every screen is drawn in each of its states from the
   served source and equals what the module's own functions draw. */
import test from "node:test";
import assert from "node:assert/strict";
import { toSource } from "../../../src/interface-shell/index.mjs";
import { SCREENS, scenes } from "./kit.mjs";

/** A value that answers anything: called, read, awaited, iterated or built, it gives itself back, and a function it is handed it runs
 *  (once: a timer that sets itself again is not run again). */
const ran = new WeakSet();
function ghost() {
  const g = new Proxy(function () {}, {
    get: (t, k) => (k === "then" || k === "catch" ? undefined : k === Symbol.toPrimitive ? (hint) => (hint === "number" ? 0 : "") : k === Symbol.iterator ? function* () {} : g),
    apply: (t, self, args) => { for (const a of args) if (typeof a === "function" && !ran.has(a)) { ran.add(a); try { a(g, g, g); } catch {} } return g; },
    construct: () => g,
    has: () => true,
  });
  return g;
}
/** The names `fn` looks up that are neither its own nor the platform's (`globalThis`'s). */
async function freeNames(fn) {
  const names = new Set();
  const scope = new Proxy({}, {
    has: (t, k) => { if (typeof k === "symbol" || k in globalThis) return false; names.add(k); return true; },
    get: (t, k) => (k === Symbol.unscopables ? undefined : ghost()),
  });
  // the function is made inside the scope object, as a script's function sees only the page's globals
  const made = new Function("scope", "with (scope) { return (" + toSource(fn) + "); }")(scope);
  // a bare ghost leaves a function at its first guard (`me.rootOfTrust !== true`): also run it where a signed founder with a handle stands
  const founder = { me: { session: true, member: "m1", handle: "rivera", rootOfTrust: true, administer: true }, data: {}, ui: {}, fragment: {}, session: {}, parts: {} };
  for (const args of [[ghost(), ghost(), ghost()], [founder, ghost(), ghost()], [ghost(), founder, ghost()]]) {
    try { await made(...args); } catch {}
  }
  return [...names];
}
/** Every function a screen serves, with where it sits. */
function* functions(v, at) {
  if (typeof v === "function") yield [at, v];
  else if (Array.isArray(v)) for (let i = 0; i < v.length; i++) yield* functions(v[i], at + "[" + i + "]");
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) yield* functions(x, at + "." + k);
}

test("interface-shell R21 control: the probe lists a module-scope name a served function looks up, and not its own names or the platform's", async () => {
  const MODULE_LEVEL = "@team/time_zone";
  assert.deepEqual(await freeNames(function (view) { return { path: MODULE_LEVEL, n: Math.max(1, Number(view.n)), own: [1].map((x) => x) }; }), ["MODULE_LEVEL"]);
  assert.deepEqual(await freeNames({ f(view) { const local = "x"; return String(local) + JSON.stringify(view); } }.f), []);
  assert.deepEqual(await freeNames(async function (a, b, c) { await a; return (() => MODULE_LEVEL)(); }), ["MODULE_LEVEL"], "inside a nested function too");
});

for (const screen of SCREENS) {
  test(`interface-shell R21 ${screen.id}: no function the screen serves names a value of the module's own scope (S-1)`, async () => {
    const found = [...functions(screen, screen.id)];
    assert.ok(found.length >= 2, "the screen serves reads and render at least");
    const leaks = [];
    for (const [at, fn] of found) { const names = await freeNames(fn); if (names.length) leaks.push([at, names]); }
    assert.deepEqual(leaks, []);
  });
}

/* what is drawn once and differs in each world: the ten recovery codes and an invitation's link */
const drawn = (html) => String(html).replace(/\b[A-Z0-9]{5}(-[A-Z0-9]{5}){3}\b/g, "CODE").replace(/#invite=[^<"]*/g, "#invite=LINK");

test("interface-shell R21 R34: every screen drawn in each of its states from the served source equals what the module's own functions draw", async () => {
  for (const full of [true, false]) {
    const own = await scenes(full), page = await scenes(full, true);
    for (const kind of ["pages", "acted"]) {
      assert.equal(page[kind].length, own[kind].length);
      page[kind].forEach((p, i) => assert.equal(drawn(p.o.html), drawn(own[kind][i].o.html), `${p.label} (${full ? "set up" : "bare"})`));
    }
  }
});
