/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/d629-internal-error.control.mjs` (not a `.test.mjs`: it builds ARMED
 * copies of `src/` while it runs). Arms, each ALONE, each declaring what MUST fail by label prefix:
 *   (1) baseline            — nothing fails.
 *   (2) store-stack-back    — `Store.fetch`'s catch answers `String(e && e.stack || e)` again, as before D-629:
 *                         MUST fail M1:, M2:, U1:, U2:, L1:, L3: (the member and public no-stack arms, and the log arm,
 *                         because nothing is logged); every plane arm stays green.
 *   (3) plane-catch-removed — the control plane's outermost catch is removed (`export default` is `PLANE` again):
 *                         MUST fail P1:, P2:, L2:, L3:; every store arm stays green.
 *   (4) over-strict         — the same envelope with its keys in another order and a differently worded log line
 *                         carrying the same facts: NOTHING may fail.
 *   RESULTS (2026-09-25, WORKER D-629, worktree of land/worker/D-629 over origin/main 5e8a65a8): all four AS
 *   DECLARED — baseline 17/0, store-stack-back 11/6 (M1 M2 U1 U2 L1 L3), plane-catch-removed 13/4 (P1 P2 L2 L3),
 *   over-strict 17/0; real sources untouched by hash.
 * =========================================================================
 * D-629 — THE STORE ANSWERED ANY THROWN ERROR WITH ITS STACK.
 *
 * THE DEFECT, measured on origin/main 5e8a65a8: `Store.fetch`'s outermost catch (store.mjs) returned
 * `{ ok: false, error: String(e && e.stack || e) }` for ANY throw on ANY op, and the control plane relays the store's
 * envelope VERBATIM on its pass-through route and on the public `invitelook` / `enroll` / `login` routes (at HTTP
 * 200). So a throw inside the store handed file paths, line numbers and SQLite's own text to the caller — to an
 * ANONYMOUS caller on the three public routes. The control plane itself had no outermost catch at all: a throw there
 * reached the Workers runtime as an uncaught exception.
 *
 * WHAT THIS ASSERTS, in the row's own terms (accepts-when): a FORCED THROW on a MEMBER op and on a PUBLIC op answers
 * the named code with no stack, path or line text (M, U); a throw in the CONTROL PLANE answers its own named code
 * (P); the stack is LOGGED server-side under the correlation id the caller received (L); named refusals do not move
 * (R); and with the injection off the same store answers normally (B) — so a failure here is the throw, not a broken
 * instrument.
 *
 * THE THROW IS REAL, not a hand-written envelope: a subclass of the shipped Store swaps `this.sql` for one whose
 * `exec` runs a query against a table that does not exist, so SQLite raises its own error, from inside the op's own
 * code path, inside the genuine `Store.fetch` try. The control-plane throw is a real Error raised by a
 * binding read (`env` behind a Proxy), inside the genuine `PLANE.fetch`.
 *
 * WHAT THIS CANNOT SEE, stated: the production Workers runtime's own answer to an uncaught exception (the
 * "error code: 1101" page — miniflare answers differently), and whether Cloudflare's log pipeline keeps the
 * `console.error` line; it reads the line off the runtime's stderr here, which is where `wrangler tail` reads it.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { DISPATCH_CHECKS } from "../checks/bio-checks.mjs";

const PLANE_DIR = fileURLToPath(new URL("..", import.meta.url));
/* The control driver points this at an ARMED copy of src/. */
const SRC_DIR = process.env.D629_SRC || join(PLANE_DIR, "src");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-d629-internal-error", MEM = "mem-d629-internal-error", PRB = "prb-d629-internal-error";
const MISSING_TABLE = "d629_no_such_table";
const INJECTED = "D629 injected control-plane failure";

/* THE THROWING STORE AND THE THROWING PLANE — one module, the shipped `index.mjs` behind it. `/__d629?store=on` makes
   the store's SQL throw for real; a request carrying `x-d629-plane-throw: 1` reaches the shipped worker with an `env`
   whose `STORE` read throws, which is inside `PLANE.fetch` and outside any op's own handling. */
const HARNESS = `import worker, { Store as PlaneStore } from "./index.mjs";
export class ThrowingStore extends PlaneStore {
  async fetch(req) {
    const u = new URL(req.url);
    if (u.pathname === "/__d629") {
      this.__d629 = u.searchParams.get("store") === "on";
      return Response.json({ ok: true, result: { throwing: this.__d629 } });
    }
    if (!this.__d629) return super.fetch(req);
    const real = this.sql;
    this.sql = { exec: () => real.exec("SELECT * FROM ${MISSING_TABLE}") };
    try { return await super.fetch(req); } finally { this.sql = real; }
  }
}
export default {
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    if (u.pathname === "/__d629")
      return env.STORE.get(env.STORE.idFromName("bio")).fetch("http://ctl/__d629?store=" + (u.searchParams.get("store") || ""));
    if (req.headers.get("x-d629-plane-throw") === "1")
      env = new Proxy(env, { get(o, k) { if (k === "STORE") throw new Error("${INJECTED}"); return o[k]; } });
    return worker.fetch(req, env, ctx);
  },
};
`;

/* The runtime's stderr, collected: the server-side log the L arms read. */
let logged = "";
const collect = (stream) => { stream.setEncoding("utf8"); stream.on("data", (c) => { logged += c; }); };
const mf = new Miniflare({
  modules: true, modulesRoot: "/",
  scriptPath: join(SRC_DIR, "d629-throwing-harness.mjs"), script: HARNESS,
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "ThrowingStore", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, PROBE_TOKEN: PRB, VERSION: "test" },
  handleRuntimeStdio: (out, err) => { collect(out); collect(err); },
});

const call = async (q, { post = null, planeThrow = false } = {}) => {
  const headers = planeThrow ? { "x-d629-plane-throw": "1" } : {};
  const r = await mf.dispatchFetch(`http://x/api/?${q}`,
    post ? { method: "POST", headers, body: JSON.stringify(post) } : { headers });
  const text = await r.text();
  let j = null;
  try { j = JSON.parse(text); } catch { j = null; }
  return { status: r.status, text, j };
};
const storeThrows = async (on) => (await mf.dispatchFetch(`http://x/__d629?store=${on ? "on" : "off"}`)).json();

/* WHAT A STACK LOOKS LIKE ON THE WIRE, as a SET of tells, each printed with its own verdict so a matcher that has gone
   blind shows as a line rather than a green: a V8 frame, a module path, SQLite's own error text, the table the
   injected query names, the injected plane message, and an Error's `Name:` prefix. */
const TELLS = [
  ["a V8 stack frame", /\bat\s+[\w$.#<>]+\s*\(|\n\s+at\s/],
  ["a module path", /\.mjs\b|file:\/\//],
  ["SQLite's error text", /SQLITE_|no such table/i],
  ["the injected table's name", new RegExp(MISSING_TABLE)],
  ["the injected plane message", new RegExp(INJECTED)],
  ["an Error name prefix", /\b(?:Type|Reference|Range|Syntax)?Error:/],
];
const tellsIn = (text) => TELLS.filter(([, re]) => re.test(String(text))).map(([name]) => name);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
/* The envelope's facts, read as a projection so the key ORDER is not what is asserted (the over-strict arm). */
const facts = (j) => j && ({ ok: j.ok, reason: j.reason, code: j.code, check: j.check,
                             translation: j.translation, correlationIsId: UUID.test(String(j.correlation || "")) });
const rowFacts = (code) => ({ ok: false, reason: code, code, check: DISPATCH_CHECKS[code].check,
                              translation: DISPATCH_CHECKS[code].translation, correlationIsId: true });

try {
  /* THE INSTRUMENT'S OWN FLOOR: the tell set detects a real stack. A tell set that sees nothing would pass every
     "no stack" arm below over a response full of one. */
  const probe = new Error(`no such table: ${MISSING_TABLE}: SQLITE_ERROR`);
  t("F1: the tell set sees a real stack (floor: at least 4 tells in an Error's own stack)",
    tellsIn(String(probe.stack)).length >= 4, true);
  t("F2: the rows exist and are translated", ["STORE_INTERNAL_ERROR", "PLANE_INTERNAL_ERROR"]
    .map((c) => typeof DISPATCH_CHECKS[c]?.translation === "string" && DISPATCH_CHECKS[c].translation.length > 40),
    [true, true]);

  await call("op=bootstrap");
  /* BASELINE: the same store, the injection off, answers the member op. */
  const b1 = await call(`op=index&token=${MEM}`);
  t("B1: with the store answering, a member op=index answers ok", [b1.status, b1.j?.ok], [200, true]);

  const on = await storeThrows(true);
  t("B2: the injection took", on?.result?.throwing, true);

  /* MEMBER OP, STORE THROWS: the pass-through route. */
  const m = await call(`op=index&token=${MEM}`);
  t("M1: a member op whose store throws answers 500 STORE_INTERNAL_ERROR (C-69.2) with its row",
    [m.status, facts(m.j)], [500, rowFacts("STORE_INTERNAL_ERROR")]);
  t("M2: and its body carries no stack, path, line or SQLite text", tellsIn(m.text), []);

  /* PUBLIC OP, STORE THROWS: `invitelook` takes no credential and relays the store's envelope as it stands. */
  const u = await call("op=invitelook", { post: { invite: "a".repeat(16) } });
  t("U1: an ANONYMOUS op=invitelook whose store throws answers STORE_INTERNAL_ERROR with its row",
    facts(u.j), rowFacts("STORE_INTERNAL_ERROR"));
  t("U2: and its body carries no stack, path, line or SQLite text", tellsIn(u.text), []);
  /* A public op the control plane opens through `doAnswer`: it was already silent (REC-52), and must stay so. */
  const v = await call(`op=verify&sha256=${"0".repeat(64)}`);
  t("U3: an anonymous op=verify whose store throws still answers STORE_DID_NOT_ANSWER, no stack",
    [v.status, v.j?.reason, tellsIn(v.text)], [502, "STORE_DID_NOT_ANSWER", []]);

  /* THE LOG: the stack went somewhere an operator can read, under the id the caller was given. */
  /* The log ENTRY around the id, not one line of it: a log that writes the stack on lines of its own after the id is
     as good as one that escapes it into a JSON string (the over-strict arm writes it that way). */
  const logLine = (id) => {
    const i = logged.indexOf(id);
    if (i < 0) return "";
    const next = logged.indexOf("INTERNAL_ERROR", i + id.length);     /* the NEXT entry's code ends this one */
    return logged.slice(Math.max(0, logged.lastIndexOf("\n", i)), next < 0 ? i + 3000 : next);
  };
  const mLine = logLine(String(m.j?.correlation || "(no correlation)"));
  t("L1: the member throw's correlation id is in the server-side log WITH the stack",
    [mLine.includes("STORE_INTERNAL_ERROR"), /no such table/.test(mLine), /store\.mjs/.test(mLine)], [true, true, true]);

  await storeThrows(false);

  /* CONTROL PLANE THROWS, on a public op and on a member op. */
  const p1 = await call("op=bootstrap", { planeThrow: true });
  t("P1: a PUBLIC op whose control plane throws answers 500 PLANE_INTERNAL_ERROR (C-69.3) with its row, no stack",
    [p1.status, facts(p1.j), tellsIn(p1.text)], [500, rowFacts("PLANE_INTERNAL_ERROR"), []]);
  const p2 = await call(`op=index&token=${MEM}`, { planeThrow: true });
  t("P2: a MEMBER op whose control plane throws answers 500 PLANE_INTERNAL_ERROR with its row, no stack",
    [p2.status, facts(p2.j), tellsIn(p2.text)], [500, rowFacts("PLANE_INTERNAL_ERROR"), []]);
  const pLine = logLine(String(p1.j?.correlation || "(no correlation)"));
  t("L2: the plane throw's correlation id is in the server-side log WITH the stack",
    [pLine.includes("PLANE_INTERNAL_ERROR"), pLine.includes(INJECTED), /\.mjs/.test(pLine)], [true, true, true]);
  t("L3: four throws, four distinct correlation ids", new Set([m.j?.correlation, u.j?.correlation, p1.j?.correlation,
                                                    p2.j?.correlation]).size, 4);

  /* NAMED REFUSALS DO NOT MOVE: they are returned, never thrown, and never pass the new catch. */
  const NOT_AN_OP = ["nosuch", "opd629"].join("");   /* built apart, d278's way: op-claims reads `op=<name>` in prose */
  const r1 = await call(`op=${NOT_AN_OP}`);
  t("R1: an unknown op is still 400 UNKNOWN_OP, `error: \"unknown op\"` first after ok",
    [r1.status, r1.j?.reason, Object.keys(r1.j || {}).slice(0, 2)], [400, "UNKNOWN_OP", ["ok", "error"]]);
  const r2 = await call("op=index");
  t("R2: a credential-less member op is still 401 NOT_AUTHENTICATED", [r2.status, r2.j?.reason], [401, "NOT_AUTHENTICATED"]);
  const b3 = await call(`op=index&token=${MEM}`);
  t("B3: the injection off again, the same store answers", [b3.status, b3.j?.ok], [200, true]);
} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nd629-internal-error: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
