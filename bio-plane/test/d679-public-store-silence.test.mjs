/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/d679-public-store-silence.control.mjs` (not a `.test.mjs`: it builds
 * ARMED copies of `src/` while it runs). Arms, each ALONE, each declaring what MUST fail by label prefix:
 *   (1) baseline            — nothing fails.
 *   (2)–(5) <op>-bare       — ONE door's read restored to the pre-D-679 `json(await r.json(), 200)` (claim, login,
 *                         invitelook, enroll, each its own arm): MUST fail that door's S<n>: and G<n>: and nothing else.
 *   (6) refusal-as-silence  — THE OTHER DIRECTION: login's guard widened to treat a refusal the store RETURNED
 *                         (`result.ok === false`) as a silence: MUST fail A2: only.
 *   (7) over-strict         — login's answer re-wrapped by another spelling that puts the same bytes on the wire:
 *                         NOTHING may fail.
 *   RESULTS — every arm RAN 2026-09-25 (WORKER D-679, worktree of land/worker/D-679 over land/worker/D-629 @ 5e202b33),
 *   all eight AS DECLARED: baseline 17/0; claim-bare, login-bare, invitelook-bare, enroll-bare 15/2 each (that door's
 *   S and G); pre-d679 (all four restored) 9/8, the four doors answering [200, STORE_INTERNAL_ERROR] to a throw and
 *   [500, PLANE_INTERNAL_ERROR] to a non-JSON store; refusal-as-silence 16/1 (A2); over-strict 17/0; real sources
 *   untouched by hash. And one arm of an instrument NOT this one, run by hand and restored by sha256 AND cmp
 *   (index.mjs 891382 B, 9c31248a…): the pre-D-679 index.mjs under `plane-envelope.test.mjs` -> 61/1, DETECTOR C's set
 *   arm naming claim, enroll, invitelook, login — which the same source passed green before D-679 widened the detector.
 * =========================================================================
 * D-679 — FOUR CREDENTIAL-FREE DOORS ANSWERED A STORE FAILURE AT HTTP 200.
 *
 * THE DEFECT, measured on land/worker/D-629 @ 5e202b33: `index.mjs`'s op=claim, login, invitelook and enroll read the
 * store's answer as `json(await r.json(), 200)` and never read `ok`. A store that THREW (500, STORE_INTERNAL_ERROR)
 * reached an anonymous caller as HTTP 200; a store that answered something other than JSON made `r.json()` throw
 * into the plane's outermost catch (500, PLANE_INTERNAL_ERROR — the plane blaming itself for the store). The row named
 * three; the sweep found the fourth (claim) on the same four lines. plane-envelope's detector C could not see any of
 * them: it counted a Response as read only when `.json()` was CHAINED onto the fetch (corrected there, D-679).
 *
 * WHAT THIS ASSERTS, in the row's own terms (accepts-when): a FORCED store failure on each door answers a non-200
 * status with its named code — 502 STORE_DID_NOT_ANSWER, naming the op, as op=verify always has (S, G); an ANSWER is
 * unchanged, byte for byte: `{ ok: true, result }` at 200, including a refusal the store RETURNED inside it (A); and
 * with the injection off the same store answers again (B), so a failure here is the injection, not the instrument.
 *
 * TWO REAL FAILURES, neither a hand-written envelope: `throw` makes the shipped Store's own SQL raise inside the
 * genuine `Store.fetch` try (D-629's method), and `garbage` makes the store answer HTTP 200 with a body that is not
 * JSON — the shape a doAnswer-less read turned into the plane's own exception.
 *
 * WHAT THIS CANNOT SEE, stated: the production runtime (miniflare answers here); a store that answers `ok: true` with
 * a wrong result, which is not a silence and no envelope check can see.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const PLANE_DIR = fileURLToPath(new URL("..", import.meta.url));
/* The control driver points this at an ARMED copy of src/. */
const SRC_DIR = process.env.D679_SRC || join(PLANE_DIR, "src");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-d679-public-store-silence", MEM = "mem-d679-public-store-silence", PRB = "prb-d679-public-store-silence";
const MISSING_TABLE = "d679_no_such_table";
const PASSWORD = "d679-correct-horse-battery";

/* THE FAILING STORE — the shipped `index.mjs` in front of it. `/__d679?mode=throw|garbage|off`. */
const HARNESS = `import worker, { Store as PlaneStore } from "./index.mjs";
export class FailingStore extends PlaneStore {
  async fetch(req) {
    const u = new URL(req.url);
    if (u.pathname === "/__d679") {
      this.__d679 = u.searchParams.get("mode") || "off";
      return Response.json({ ok: true, result: { mode: this.__d679 } });
    }
    if (this.__d679 === "garbage") return new Response("<html>not an envelope</html>", { status: 200 });
    if (this.__d679 !== "throw") return super.fetch(req);
    const real = this.sql;
    this.sql = { exec: () => real.exec("SELECT * FROM ${MISSING_TABLE}") };
    try { return await super.fetch(req); } finally { this.sql = real; }
  }
}
export default {
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    if (u.pathname === "/__d679")
      return env.STORE.get(env.STORE.idFromName("bio")).fetch("http://ctl/__d679?mode=" + (u.searchParams.get("mode") || ""));
    return worker.fetch(req, env, ctx);
  },
};
`;

const mf = new Miniflare({
  modules: true, modulesRoot: "/",
  scriptPath: join(SRC_DIR, "d679-failing-harness.mjs"), script: HARNESS,
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "FailingStore", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, PROBE_TOKEN: PRB, VERSION: "test" },
  handleRuntimeStdio: (out, err) => { out.resume(); err.resume(); },
});

const call = async (op, post) => {
  const r = await mf.dispatchFetch(`http://x/api/?op=${op}`, { method: "POST", body: JSON.stringify(post) });
  const text = await r.text();
  let j = null;
  try { j = JSON.parse(text); } catch { j = null; }
  return { status: r.status, text, j };
};
const mode = async (m) => (await (await mf.dispatchFetch(`http://x/__d679?mode=${m}`)).json())?.result?.mode;

/* The four doors, each with a body that passes the control plane's own gates AND the store's own shape checks, so it
   reaches SQL. MEASURED, not assumed: the first run sent `"i".repeat(32)` and S3/S4 answered 200 — `#invited` refuses a
   non-hex invitation before any query, so the throw never fired. The invitation is hex for that reason. */
const DOORS = [
  ["claim", { bootstrapToken: ADM, password: PASSWORD }],
  ["login", { role: "admin", password: PASSWORD }],
  ["invitelook", { invite: "a".repeat(32) }],
  ["enroll", { invite: "a".repeat(32), handle: "d679-member", password: PASSWORD }],
];
/* What a silence must look like on the wire: its status, its code, the op it names — and NOTHING of the store's
   envelope: no correlation id (that stays in the operator's log, D-629) and none of SQLite's text. */
const silence = (r) => [r.status, r.j?.ok, r.j?.reason, r.j?.op, "correlation" in (r.j || {}),
                        /SQLITE_|no such table|\.mjs\b/i.test(r.text)];
const SILENT = (op) => [502, false, "STORE_DID_NOT_ANSWER", op, false, false];

try {
  t("F1: the harness starts with the store answering", await mode("off"), "off");

  /* A — AN ANSWER IS UNCHANGED. The store's envelope is `{ ok: true, result }` and the door re-wraps exactly that. */
  const a1 = await call("claim", DOORS[0][1]);
  t("A1: op=claim with the store answering claims the instance: 200, `{ ok, result }` and nothing else, result.ok",
    [a1.status, Object.keys(a1.j || {}), a1.j?.ok, a1.j?.result?.ok], [200, ["ok", "result"], true, true]);
  const a2 = await call("login", { role: "admin", password: "d679-a-wrong-password" });
  t("A2: a REFUSAL the store returned is an ANSWER, not a silence: op=login's wrong password is 200 with the refusal "
    + "inside `result`", [a2.status, a2.j?.ok, a2.j?.result?.ok, a2.j?.result?.reason], [200, true, false, "SIGN_IN_REFUSED"]);
  const a3 = await call("login", DOORS[1][1]);
  t("A3: op=login with the right password answers 200 with a token in `result`",
    [a3.status, a3.j?.ok, a3.j?.result?.ok, typeof a3.j?.result?.token], [200, true, true, "string"]);
  const a4 = await call("invitelook", DOORS[2][1]);
  const a5 = await call("enroll", DOORS[3][1]);
  t("A4: op=invitelook and op=enroll on an unknown invitation answer 200 with the store's own miss inside `result`",
    [a4.status, a4.j?.ok, a4.j?.result?.ok, a5.status, a5.j?.ok, a5.j?.result?.ok], [200, true, false, 200, true, false]);

  /* S — THE STORE THROWS. Each door, its own assertion, so a control arm is named by the door it broke. */
  t("F2: the throwing injection took", await mode("throw"), "throw");
  for (const [i, [op, body]] of DOORS.entries())
    t(`S${i + 1}: op=${op} whose store THREW answers 502 STORE_DID_NOT_ANSWER naming the op, nothing of the store's `
      + `envelope`, silence(await call(op, body)), SILENT(op));

  /* G — THE STORE ANSWERS SOMETHING THAT IS NOT JSON, at 200. */
  t("F3: the garbage injection took", await mode("garbage"), "garbage");
  for (const [i, [op, body]] of DOORS.entries())
    t(`G${i + 1}: op=${op} whose store answered NOT-JSON answers 502 STORE_DID_NOT_ANSWER naming the op`,
      silence(await call(op, body)), SILENT(op));

  /* B — the injection off, the same store answers the same door again. */
  t("F4: the injection is off again", await mode("off"), "off");
  const b1 = await call("login", DOORS[1][1]);
  t("B1: the same store answers op=login again, 200 with a token", [b1.status, b1.j?.result?.ok], [200, true]);
} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nd679-public-store-silence: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
