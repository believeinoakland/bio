/* agent-worker (I8) — the fleet member's OWN test estate, driven THROUGH workerd.
 *
 * It runs `src/index.mjs` under miniflare (workerd), the runtime the Worker
 * actually serves in, beside a PLANE MOCK bound over a real service binding —
 * because the binding is the subject as much as the handler is. FL-1 measured
 * that a Worker cannot reach another Worker on this account's `*.workers.dev`
 * name (404, `error code: 1042`, every time) while the service binding answered
 * 200, so a suite that drove the handler by calling its function directly would
 * be testing the half that was never in doubt.
 *
 * THE MOCK IS NOT A CONVENIENCE, IT IS THE INSTRUMENT. It records every request
 * it receives — op, token, namespace — and holds a mutable RECORD that any
 * MUTATING op changes. That is what makes "this member writes nothing" a
 * BEHAVIOURAL measurement rather than a source-scan promise: the record's bytes
 * are hashed before and after a run and must be identical. `pdf-worker` proves
 * the same property against R2; this member holds no R2, so the plane's record is
 * where a write would have to land.
 *
 * MINIFLARE IS RESOLVED FROM THE PLANE'S INSTALL when this directory has no
 * `node_modules`, and that is deliberate rather than lazy. `pdf-worker`'s suite
 * imports `miniflare` bare, has no install of its own, and is therefore run by
 * NOTHING — the battery discovers only `bio-plane/test/`, so the first fleet
 * member's suite has never executed while `coverage.mjs` credited its surface as
 * reached from a source read. A suite that cannot run wherever the battery runs
 * is a suite that will stop running, which is `bundle.test.mjs`'s defect (D-93)
 * one directory out.
 */
/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/agent-worker.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and neither the battery nor the fleet walk must discover it (PL-3/PL-4/PL-11's precedent). THE HARNESS LIVES INSIDE THIS WORKTREE and never in a shared scratchpad, which a concurrent worker overwrote between ARM and RESTORE once already. Every arm is armed ALONE with the other defences held OPEN, every restore is verified BY sha256 AND BY CONTENT (`cmp`), and every arm names what MUST fail AND what MUST NOT.
   ALL TWELVE ARMS RUN 2026-08-08 IN WORKTREE agent-ad2c65dacc2cd14ed, baseline 89/0 before each; every one AS DECLARED on the recorded pass. Figures below are MEASURED. **TWO ARMS CAME BACK WRONG FIRST AND BOTH WERE FINDINGS ABOUT THE INSTRUMENT RATHER THAN THE SUBJECT — recorded, not smoothed** (see A2 and A3).
   (A1) FL-2'S NAMED CONTROL, HALF ONE — A DIRECT WRITE. In src/index.mjs make the member call the plane's MUTATING `op=purge` beside its read -> **83 pass, 6 FAIL**: the BEHAVIOURAL arm fails (the plane record's sha256 MOVES) AND the source-scan arm fails (the pinned op set is no longer exactly {whoami}). Held as declared: every refusal arm, the version endpoint, the bound.
   (A2) FL-2'S NAMED CONTROL, HALF TWO — A SECOND CREDENTIAL. Call the plane again under a token of the member's own -> **86 pass, 3 FAIL** (one-credential arm + compiled-in-credential arm); the write arm HELD, which is why this is armed separately: a member may write nothing and still act as somebody it was not handed. **THIS ARM CAME BACK HALF-GREEN FIRST AND THE SOURCE SCAN WAS WRONG:** it read `/aik-[0-9a-f]/`, and a credential spelled `"aik-" + "f".repeat(64)` has no hex after the prefix anywhere in the source, so the scan reported the member clean while it was calling the plane under its own token. Tightened to match the START of any string literal.
   (A3) THE BINDING IS THE ONLY ROUTE. Replace `env.PLANE.fetch(url)` with a bare global fetch at this account's own workers.dev name -> **54 pass, 35 FAIL**: the URL-literal, workers.dev and bare-fetch source arms all fail, and so does the round trip. FL-1 MEASURED that route as a 404 every time, so this demonstrates the routing finding rather than restating it. **THIS ARM FIRST KILLED THE SUITE INSTEAD OF FAILING IT** — `out.plane_says.token_class` threw on a refusal body, there was no tail line, and the harness would have read the whole file as "stayed GREEN" had it not treated a missing tally as `-1` rather than `0`. That is the exact defect PL-11's own control met. Every nested read in this suite is now null-tolerant: the CLASS was swept, not the one site.
   (A4) THE SCOPE IS THE PLANE'S. Give the member a second op it may name -> **87 pass, 2 FAIL** on the pinned-op-set arm; the write arm HELD, because the gained op is non-mutating — which is exactly why a write test alone would not catch it. D-199 (2): a scope compiled into a Worker is the settings row the determination refused.
   (A5) THE BOUND IS SIZED ON MEMORY, NOT CPU. Set DEFAULT_MAX_TURNS_PER_SEGMENT to 1100 (the figure FL-1's CPU curve extrapolates to) -> **82 pass, 7 FAIL**: the "inside FL-1's measured 100-150 band" arm and the exact-value arm both fail. A bound sized on CPU headroom is ~10x too long and meets the MEMORY wall instead.
   (A6) A REFUSAL IS PASSED THROUGH, NOT RE-WORDED. Replace the plane's refusal body with the member's own sentence -> **86 pass, 3 FAIL**, all three verbatim arms (code, C-number, canned translation). A component that paraphrases a refusal is thirteen surfaces inventing wording.
   (V1) **VF-3'S NAMED CONTROL — HIDE THE FLEET MANIFEST.** Rename `agent-worker/fleet-member.json` away -> `coverage.mjs --strict` **exits 1** naming the undeclared Worker directory, instead of reporting the pre-FL-2 figure. The fleet FLOOR fired too (two gates over one arm, recorded rather than claimed as one). The plane's own OPS/CHECKS figures held at 100%.
   (V2) THE FLOOR — a whole member DIRECTORY vanishing, which the undeclared-Worker gate structurally cannot see. Raise FLEET_FLOOR.members to 3 -> **exit 1** naming FLEET FLOOR; the undeclared-Worker gate stayed silent, as declared.
   (V3) A MEMBER WITH NO READABLE SURFACE. Rename the SURFACE table -> **exit 1**. This used to report `0/0 ops reached` and PASS — the emptiest possible green.
   (V4) FLEET RULE 2. Declare the `run` surface op `mutating: true` -> **exit 1** naming FLEET RULE 2; every other fleet gate silent.
   (V5) THE BATTERY ACTUALLY RUNS THIS SUITE. Break one assertion here -> `battery.mjs agent-worker` **exits 1** and NAMES this suite in FAILED. Before FL-2 the battery ran no fleet suite at all, so a member's coverage stood on a source read of a suite nobody executed.
   (O1) OVER-STRICTNESS, nothing broken, and these must PASS: a request exactly at the bound, `turns` omitted entirely, namespaces with hyphens/underscores/capitals, a run_id carrying punctuation, and a DIFFERENT well-formed credential used alone -> **89 pass, 0 FAIL, coverage --strict exit 0**.
 * ========================================================================= */

/* D-186: owns $TMPDIR for this process and removes it on exit. Miniflare's
   `dispose()` disarms its own exit hook and then does not wait for the removal,
   so the leak is on the SUCCESS path; the battery leaked 41.0 GB that way and
   filled the machine's disk. A fleet suite the battery now runs must own its
   ground like every plane suite does. */
import "../../bio-plane/test/sandbox.mjs";

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

/* Prefer this directory's own install; fall back to the PLANE's, which is
   present wherever the battery can run at all. Neither path is a guess: both are
   resolved and the one that answers is used. */
const { Miniflare } = await (async () => {
  try { return await import("miniflare"); } catch { /* fall through */ }
  const planePkg = fileURLToPath(new URL("../../bio-plane/package.json", import.meta.url));
  const resolved = createRequire(planePkg).resolve("miniflare");
  return await import(pathToFileURL(resolved).href);
})();

const WORKER_SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const WRANGLER = fileURLToPath(new URL("../wrangler.jsonc", import.meta.url));
const MANIFEST = fileURLToPath(new URL("../fleet-member.json", import.meta.url));
const SRC = readFileSync(WORKER_SRC, "utf8");
/* Comments carry this project's reasoning and are long; a scan that reads them
   would match its own explanation of what must not appear.
 *
 * THE LINE-COMMENT STRIPPER IS NOT THE OBVIOUS ONE, AND THE DIFFERENCE IS A
 * DEFECT THIS SUITE MET. `pdf-worker`'s suite strips a line comment as "two
 * slashes to end of line", which is correct there and wrong here: the string
 * "http" plus a colon plus two slashes contains those two slashes, so the naive
 * stripper DELETED THE URL LITERAL AND THE REST OF ITS LINE, and the
 * only-one-absolute-URL arm came back green over a source it had silently
 * truncated by two thirds (6,029 characters read of 17,265). It found nothing and
 * reported nothing wrong — a walk that has gone blind reading as a subject that
 * is clean. Requiring a non-`:` before the `//` keeps every real line comment and
 * every scheme-relative-looking string literal. A DELEGATION is filed for
 * `pdf-worker`, where the same idiom is harmless today and is a trap the moment
 * that member holds a URL. */
const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
const sha = (v) => createHash("sha256").update(v).digest("hex");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const AIK = "aik-" + "a".repeat(64);
const AIK2 = "aik-" + "b".repeat(64);

/* ---------------------------------------------------------------- THE MOCK
 * The plane's envelope, its `ai`-class refusal shape, a request LOG and a
 * mutable RECORD. `MUTATING` is the set of ops that change the record; the
 * member is expected never to name one, and the record's hash is the evidence. */
const PLANE_MOCK = `
const MUTATING = new Set(["purge", "promote", "suggest", "capturerequest", "ratify", "publish"]);
let RECORD = { rows: [] };
let LOG = [];
export default {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/__mock/state")
      return Response.json({ record: RECORD, log: LOG });
    const op = url.searchParams.get("op") || "";
    const token = url.searchParams.get("token") || "";
    const store = url.searchParams.get("store") || "";
    LOG.push({ op, token, store, method: req.method });
    if (MUTATING.has(op)) {
      RECORD = { rows: [...RECORD.rows, { op, at: LOG.length }] };
      return Response.json({ ok: true, result: { wrote: true }, store });
    }
    if (token === "aik-" + "c".repeat(64))
      /* A refused credential, worded exactly as the plane words one: the code,
         the C-number and the DEC-49 canned translation. */
      return Response.json({ ok: false, reason: "AI_CREDENTIAL_REVOKED", code: "AI_CREDENTIAL_REVOKED",
        check: "C-29.7",
        translation: "This agent credential has been withdrawn by a member of the group, so it no longer reaches anything here.",
        op, cls: "ai" }, { status: 403 });
    if (op === "whoami")
      return Response.json({ ok: true, result: {
        tokenClass: "ai", session: false, member: null, handle: null,
        administer: false, rootOfTrust: false, capabilities: null,
      }, store, tokenClass: "ai" });
    return Response.json({ ok: false, error: "unknown op: " + op }, { status: 400 });
  },
};
`;

const newMf = (vars = {}, opts = {}) => new Miniflare({
  workers: [
    {
      name: "agent-worker",
      modules: true, modulesRoot: "/", scriptPath: WORKER_SRC, script: SRC,
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
      bindings: { VERSION: "test", ...vars },
      ...(opts.noPlane ? {} : { serviceBindings: { PLANE: "plane-mock" } }),
    },
    {
      name: "plane-mock",
      modules: true, script: PLANE_MOCK,
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    },
  ],
});

const run = (mf, body) =>
  mf.dispatchFetch("http://agent-worker/run", { method: "POST", body: JSON.stringify(body) });
const mockState = async (mf) => {
  const w = await mf.getWorker("plane-mock");
  return (await (await w.fetch("http://plane/__mock/state")).json());
};

/* ================================================================ 1 · THE ROUND TRIP */
console.log("\n--- 1 · the round trip: the member asks the plane and reports what the PLANE said ---");
{
  const mf = newMf();
  const before = await mockState(mf);
  const res = await run(mf, { run_id: "run-1", store: "scratch", credential: AIK });
  t("200", res.status, 200);
  const out = await res.json();
  t("ok", out.ok, true);
  t("the run identity is echoed, not minted here", out.run_id, "run-1");
  t("the namespace is echoed", out.store, "scratch");
  t("the class comes from the PLANE's answer", out.plane_says?.token_class ?? null, "ai");
  t("the namespace the PLANE confined the call to", out.plane_says?.store ?? null, "scratch");
  t("it names its own build (fleet rule 4)", out.worker ?? null, { name: "agent-worker", version: "test" });

  console.log("\n  -- what was actually DONE is NAMED, so it cannot be read as a finished run --");
  t("the stage says round-trip, not run", out.stage, "round-trip");
  t("zero model turns were run, stated", out.turns_run, 0);

  console.log("\n  -- the principal is UNDETERMINED and SAYS SO (never guessed, never dropped) --");
  t("principal is null", out.principal, null);
  t("and the reason is on the wire", /UNPUBLISHED/.test(out.principal_source), true);

  console.log("\n  -- WRITES NOTHING: the plane's record is byte-for-byte unchanged after a run --");
  const after = await mockState(mf);
  t("the record's sha256 is unchanged", sha(JSON.stringify(after.record)), sha(JSON.stringify(before.record)));
  t("the record is empty and stayed empty", after.record, { rows: [] });

  console.log("\n  -- ONE credential, the one it was handed, and no other --");
  const tokens = [...new Set(after.log.map((l) => l.token))];
  t("exactly one distinct credential reached the plane", tokens.length, 1);
  t("and it is the one handed in", tokens[0], AIK);
  const ops = [...new Set(after.log.map((l) => l.op))].sort();
  t("exactly one op was named, and it is non-mutating", ops, ["whoami"]);

  console.log("\n  -- the credential is never echoed back --");
  t("the response body does not contain the credential", JSON.stringify(out).includes(AIK), false);
  await mf.dispose();
}

/* ================================================================ 2 · THE SEGMENT BOUND */
console.log("\n--- 2 · the segment bound, SIZED ON FL-1's MEMORY CURVE AND NOT ITS CPU CURVE ---");
{
  const mf = newMf();
  const out = await (await run(mf, { run_id: "r", store: "scratch", credential: AIK })).json();
  const bound = out.segment?.turns_bound ?? null;
  /* THE ASSERTION THAT MAKES THE SIZING FALSIFIABLE. FL-1 measured 120.4 MB of a
     128 MB isolate at 200 turns while CPU sat at 2.5% of its ceiling, and named
     100–150 as inside both. Extrapolated on the measured CPU exponent, ~1,100
     turns fit the CPU ceiling — so a bound sized on CPU headroom is ~10x too long
     and meets the memory wall instead. A default outside the measured band fails
     here rather than being discovered in production. */
  t("the default bound is inside FL-1's measured 100-150 band", bound >= 100 && bound <= 150, true);
  t("the default bound is 120", bound, 120);
  t("the answer names which measurement set it", /memory curve/i.test(out.segment?.bound_source ?? ""), true);
  t("and names that it was NOT the CPU curve", /not the CPU curve/i.test(out.segment?.bound_source ?? ""), true);
  t("omitting turns takes the bound", out.segment?.turns_requested ?? null, 120);

  console.log("\n  -- over the bound is REFUSED, never silently clamped --");
  const over = await run(mf, { run_id: "r", store: "scratch", credential: AIK, turns: 400 });
  t("400 turns is 400", over.status, 400);
  const ob = await over.json();
  t("reason SEGMENT_OVER_BOUND", ob.reason, "SEGMENT_OVER_BOUND");
  t("the refusal states what was asked and what is allowed", [ob.turns_requested, ob.turns_bound], [400, 120]);
  t("and names the measurement behind the bound", /FL-1/.test(ob.bound_source), true);

  console.log("\n  -- the bound is overridable, and the override is honoured --");
  const mf2 = newMf({ MAX_TURNS_PER_SEGMENT: "40" });
  const tight = await (await run(mf2, { run_id: "r", store: "scratch", credential: AIK, turns: 41 })).json();
  t("41 over an override of 40 is refused", tight.reason, "SEGMENT_OVER_BOUND");
  t("naming the override", tight.turns_bound, 40);
  await mf2.dispose();
  await mf.dispose();
}

/* ================================================================ 3 · REFUSALS */
console.log("\n--- 3 · every refusable condition is STATED, with a code, and never faked ---");
{
  const mf = newMf();
  const cases = [
    ["no credential",             { run_id: "r", store: "scratch" },                                  401, "NO_CREDENTIAL"],
    ["a credential of the wrong shape", { run_id: "r", store: "scratch", credential: "hunter2" },      400, "BAD_CREDENTIAL_SHAPE"],
    ["no run identity",           { store: "scratch", credential: AIK },                              400, "BAD_RUN_ID"],
    ["no namespace",              { run_id: "r", credential: AIK },                                   400, "BAD_STORE"],
    ["a namespace that is not a token", { run_id: "r", store: "a b", credential: AIK },                400, "BAD_STORE"],
    ["turns that are not a count", { run_id: "r", store: "scratch", credential: AIK, turns: 0 },       400, "BAD_TURNS"],
  ];
  for (const [label, body, status, reason] of cases) {
    const res = await run(mf, body);
    const out = await res.json();
    t(`${label} -> ${status} ${reason}`, [res.status, out.reason, out.code], [status, reason, reason]);
    t(`  ${label}: the code is on the wire as \`code\` as well as \`reason\``, out.code, reason);
    t(`  ${label}: a detail a reader can act on`, (out.detail ?? "").length > 40, true);
  }
  const bad = await mf.dispatchFetch("http://agent-worker/run", { method: "POST", body: "{{{" });
  t("an unreadable body -> 400 BAD_BODY", (await bad.json()).reason, "BAD_BODY");
  const nope = await mf.dispatchFetch("http://agent-worker/nope", { method: "GET" });
  t("an unknown path -> 404 UNKNOWN", [nope.status, (await nope.json()).reason], [404, "UNKNOWN"]);
  const getRun = await mf.dispatchFetch("http://agent-worker/run", { method: "GET" });
  t("GET /run is not a route", getRun.status, 404);

  console.log("\n  -- a refusal writes nothing either --");
  const st = await mockState(mf);
  t("the plane's record is still empty after six refusals", st.record, { rows: [] });
  await mf.dispose();
}

/* ================================================================ 4 · THE PLANE'S ANSWER IS THE PLANE'S */
console.log("\n--- 4 · a plane refusal is PASSED THROUGH VERBATIM, and a silent plane is not an answer ---");
{
  const mf = newMf();
  const res = await run(mf, { run_id: "r", store: "scratch", credential: "aik-" + "c".repeat(64) });
  t("403", res.status, 403);
  const out = await res.json();
  t("the member names its own role in the failure", out.reason, "PLANE_REFUSED");
  t("the plane's code is UNCHANGED", out.plane?.reason ?? null, "AI_CREDENTIAL_REVOKED");
  t("the plane's C-number is UNCHANGED", out.plane?.check ?? null, "C-29.7");
  t("the plane's canned translation is UNCHANGED, to the byte",
    out.plane?.translation ?? null,
    "This agent credential has been withdrawn by a member of the group, so it no longer reaches anything here.");
  await mf.dispose();
}
{
  /* REC-52's rule one layer out: a failure to ANSWER is not an answer. With no
     binding at all the member must say the plane is unreachable — never convert
     its own failure into a claim about the credential or the record. */
  const mf = newMf({}, { noPlane: true });
  const res = await run(mf, { run_id: "r", store: "scratch", credential: AIK });
  const out = await res.json();
  t("no plane binding -> 503 PLANE_NOT_CONFIGURED", [res.status, out.reason], [503, "PLANE_NOT_CONFIGURED"]);
  t("it does NOT answer with a claim about the credential", out.reason === "NO_CREDENTIAL", false);
  await mf.dispose();
}

/* ================================================================ 5 · WHICH BUILD ANSWERED */
console.log("\n--- 5 · GET /version — fleet rule 4: a verification must establish which build ANSWERED ---");
{
  const mf = newMf({ VERSION: "0.1.0-probe" });
  const res = await mf.dispatchFetch("http://agent-worker/version", { method: "GET" });
  const out = await res.json();
  t("200", res.status, 200);
  t("it names itself and its build", [out.ok, out.name, out.version], [true, "agent-worker", "0.1.0-probe"]);
  t("POST /version is not a route", (await mf.dispatchFetch("http://agent-worker/version", { method: "POST", body: "{}" })).status, 404);
  await mf.dispose();
}

/* ================================================================ 6 · THE FENCE, FROM THE SOURCE */
console.log("\n--- 6 · WRITES NOTHING, HOLDS NOTHING, REACHES NOTHING BUT THE PLANE — structurally ---");
{
  t("no .put( anywhere in the source", /\.put\s*\(/.test(CODE), false);
  t("no .delete( anywhere in the source", /\.delete\s*\(/.test(CODE), false);
  t("no STORE (Durable Object) binding is read", /env\s*\.\s*STORE/.test(CODE), false);
  /* WORD-BOUNDED, and that is not tidiness. A bare `/PUBLISHED/` matched the
     substring inside `UNPUBLISHED` — the word this member uses to say its
     principal is undetermined — and failed a Worker that holds no such binding.
     An arm that fires on correct work is an arm that gets relaxed. */
  t("no CAPTURES binding is read", /\bCAPTURES\b/.test(CODE), false);
  t("no PUBLISHED binding is read", /\bPUBLISHED\b/.test(CODE), false);

  console.log("\n  -- the binding is the ONLY route out (FL-1's routing finding, enforced) --");
  t("no workers.dev literal", /workers\.dev/.test(CODE), false);
  const urls = [...new Set([...CODE.matchAll(/https?:\/\/[^"'`\s]*/g)].map((m) => m[0]))];
  t("the only absolute URL in the source is the binding's own request name", urls, ["http://plane"]);
  t("the plane is reached through the binding", /env\s*\.\s*PLANE\s*\.\s*fetch/.test(CODE), true);
  /* A bare global `fetch(` — not `.fetch(` on a binding — would be an egress this
     member is not entitled to. FL-1 measured that it would 404 against the
     account's own name anyway, so this is a fence and not a style rule.
     `async fetch(` is EXCLUDED because it is the module's own exported handler:
     the first spelling of this arm fired on the Worker's entry point, which is
     the shape every Worker in this repository has. */
  t("no bare global fetch(", /(?<![.\w])(?<!async\s)fetch\s*\(/.test(CODE), false);

  console.log("\n  -- THE SCOPE IS THE PLANE'S, and the ops this member may name are PINNED --");
  const named = [...new Set([...CODE.matchAll(/askPlane\(\s*env\s*,\s*"([a-z]+)"/g)].map((m) => m[1]))].sort();
  /* FLOOR AND CEILING BOTH, by exact equality. A call this member gains is a call
     somebody decided to give it, and a call it loses is visible too. D-199 (2):
     what an agent may reach is a row a member authored and read at the plane's
     gate — never a list compiled into a Worker. */
  t("the pinned op set is exactly {whoami}", named, ["whoami"]);
  t("no mutating op name appears in the source at all",
    /\b(purge|promote|ratify|publish|suggest|capturerequest)\b/.test(CODE), false);
  /* THE FIRST SPELLING OF THIS ARM WAS `/aik-[0-9a-f]/` AND CONTROL ARM A2
     WALKED STRAIGHT PAST IT. A credential written as `"aik-" + "f".repeat(64)`
     has no hex after the prefix anywhere in the source, so the scan found
     nothing and reported the member clean while it was calling the plane under a
     token of its own. The arm was right that something must be caught and wrong
     about what the thing looks like — recorded here rather than quietly widened,
     because a control that comes back green when red was predicted is a finding
     about the control. Matching the START of any string literal catches the
     split spelling and every simpler one. */
  t("no credential is compiled in (no string literal opens with aik-)", /["'`]aik-/.test(CODE), false);

  console.log("\n  -- the config declares the narrowest bindings that do the job --");
  const cfg = readFileSync(WRANGLER, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  t("account_id is PINNED to this project's account", /"account_id":\s*"20b533579290b9b93168345edd3b7f72"/.test(cfg), true);
  t("no durable_objects (STORE) binding declared", /durable_objects/.test(cfg), false);
  t("no r2_buckets declared at all", /r2_buckets/.test(cfg), false);
  t("no PUBLISHED binding declared", /PUBLISHED/.test(cfg), false);
  t("no secret or token var declared", /TOKEN/.test(cfg), false);
  const services = [...cfg.matchAll(/"binding":\s*"([A-Z_]+)"/g)].map((m) => m[1]);
  t("exactly one binding, and it is the plane", services, ["PLANE"]);

  console.log("\n  -- the fleet manifest is what makes this member countable (D-117/VF-3) --");
  const meta = JSON.parse(readFileSync(MANIFEST, "utf8"));
  t("it declares its name, entry, surface table and test dir",
    [meta.name, meta.entry, meta.surface, meta.testDir],
    ["agent-worker", "src/index.mjs", "SURFACE", "test"]);
  t("the SURFACE table it points at exists in the entry", /export const SURFACE\s*=/.test(SRC), true);
  t("every surface op declares itself non-mutating (fleet rule 2)",
    /mutating:\s*true/.test(SRC.slice(SRC.indexOf("export const SURFACE"), SRC.indexOf("export const SURFACE") + 400)), false);
}

/* ================================================================ 7 · OVER-STRICTNESS */
console.log("\n--- 7 · OVER-STRICTNESS: correct work in a spelling the guard did not anticipate must PASS ---");
{
  const mf = newMf();
  const okCases = [
    ["exactly at the bound",            { run_id: "r", store: "scratch", credential: AIK, turns: 120 }],
    ["turns omitted entirely",          { run_id: "r", store: "scratch", credential: AIK }],
    ["a namespace with a hyphen",       { run_id: "r", store: "biosmoke-fleet", credential: AIK }],
    ["a namespace with an underscore",  { run_id: "r", store: "bio_smoke", credential: AIK }],
    ["a namespace with capitals",       { run_id: "r", store: "BioSmoke", credential: AIK }],
    ["a run id carrying punctuation",   { run_id: "run:2026-08-08/seg-3", store: "scratch", credential: AIK }],
    ["a second credential, used alone", { run_id: "r", store: "scratch", credential: AIK2 }],
  ];
  for (const [label, body] of okCases) {
    const res = await run(mf, body);
    const out = await res.json();
    t(`${label} -> accepted`, [res.status, out.ok], [200, true]);
  }
  const st = await mockState(mf);
  t("and none of them wrote anything", st.record, { rows: [] });
  await mf.dispose();
}

console.log(`\nagent-worker: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
