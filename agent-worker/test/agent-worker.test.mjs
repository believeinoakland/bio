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
   ALL TWELVE ARMS RUN 2026-08-08 IN WORKTREE agent-ad2c65dacc2cd14ed, baseline 89/0 before each; every one AS DECLARED on the recorded pass. **RE-MEASURED 2026-08-08 BY FL-3 IN WORKTREE agent-ad6e5ed43aac4a2ab, because FL-3 changed this suite and the figures below went stale the moment it did — corrected, never left standing.** New baseline **98/0**; all twelve arms AS DECLARED again. Re-measured figures: A1 91/7 · A2 95/3 · A3 61/37 · A4 94/4 · A5 91/7 · A6 95/3 · V1-V5 unchanged (they read the instrument, not this suite) · O1 98/0 with coverage --strict exit 0. **TWO CONTROL DEFECTS THIS ITEM INTRODUCED AND FIXED, RECORDED RATHER THAN SMOOTHED:** (i) A3's patch string went stale when FL-3 gave `askPlane` a body, so the arm matched ZERO times and reported "THE ARM DID NOT ARM" — a control keyed to a source line goes stale when the line moves, and the only defence is a harness that refuses to score an arm it never armed; (ii) once re-armed, A3 KILLED this suite (`0 pass, -1 FAIL`) because FL-3's new arms read `after.log[0].op` and A3 leaves the mock's log EMPTY. The CLASS was swept across BOTH suites, not the site that bit.  Figures below are MEASURED. **TWO ARMS CAME BACK WRONG FIRST AND BOTH WERE FINDINGS ABOUT THE INSTRUMENT RATHER THAN THE SUBJECT — recorded, not smoothed** (see A2 and A3).
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
   **RE-MEASURED 2026-08-09 BY D-276 IN WORKTREE agent-a76b49f4f882535a0 at base `8b60106`, because D-276 changed this suite and every figure above went stale the moment it did — corrected, never left standing.** New baselines **agent-worker 113/0 · fanout 175/0 · harness 199/0** (they were 98 · 172 · 194). Re-measured: A1 106/7 · A2 110/3 · A3 74/39 · A4 109/4 · A5 106/7 · A6 110/3 · V1/V3/V4/V5 unchanged (they read the instrument, not this suite) · O1 113/0 with coverage --strict exit 0. **V2 CAME BACK "THE ARM DID NOT ARM" ON A CLEAN `main` AND IT WAS PRE-EXISTING** — its anchor in `coverage.mjs` was rewritten by VF-5 (`  members:    2,   // …` became `  members:     2,`), so the patch matched ZERO times; re-anchored on the shortest unambiguous span and AS DECLARED afterwards. That is the THIRD control in this file to go stale when a source line moved, and it was visible only because this harness scores a never-armed arm as a FINDING.
   **SECTION D — D-276: THE MEANING ARM, THE ANSWER CHECK, AND THE FIXTURE.** Three separate defences, armed one at a time and then together, because what matters is which one is load-bearing for which suite. `runNamedSuite` was added to the harness for these: it could previously run only ONE of this member's three suites.
   (D1) THE DEFECT REINTRODUCED. `MEANING_ARM` back to `"legs"`, the spelling that shipped; fixture and answer check held OPEN -> **agent-worker 107/6 · fanout 171/4 · harness 192/7**, all three RED, with the meaning arms NAMED in each and every unrelated arm (bound, refusal passthrough, version, write) held.
   (D2) THE FIXTURE ALONE. `plane-meaning.mjs` stops reading `rows` and accepts anything — exactly what all three mocks used to do — with the member's arm left CORRECT -> **agent-worker 111/2** (only the mock-agrees-with-the-plane arms), **fanout 175/0 · harness 199/0** untouched. The member is not broken here; its instrument is.
   (D3) **THE WORLD AS IT SHIPPED, and it is the arm worth reading.** Wrong arm AND a fixture that cannot refuse, two defences down deliberately -> **agent-worker 107/6 · fanout 174/1 · harness 198/1**. **EVERY BEHAVIOURAL ARM in fanout and harness went GREEN over a call that cannot succeed** — D-276's condition, reproduced — and the only things that saw it were the arms that ask the PLANE rather than the fixture. **DECLARED WRONG FIRST AND CORRECTED INTO SOMETHING STRONGER RATHER THAN SMOOTHED:** it was declared as "fanout and harness go GREEN" and they came back 1 FAIL each — this item's own structural arms, which do not go through the mock. The declaration now names the EXACT label permitted to fail in each, so RED alone will not satisfy it.
   (D4) **"CHECK `ok`" IS NOT ENOUGH, AND THIS ARM MEASURED A SECOND DEFENCE NOBODY DECLARED.** Wrong arm AND `planeAnswer` stops looking inside `result`, checking only the ENVELOPE's `ok` — which the plane sets to TRUE on a refused arm (measured: HTTP 200, `ok:true`, the refusal nested one level in) -> **agent-worker 109/4 · harness 197/2**. **DECLARED WRONG FIRST:** the false zero `0 meaning-grain row(s) queried` was declared to come back, and it did NOT. It needed BOTH the missing check AND the old `Array.isArray(got.rows) ? got.rows.length : 0`; the rewrite's third branch fires instead and the entry reads *"is UNDETERMINED — the plane answered without a rows collection"*. The arm now asserts the false zero is ABSENT, which is the stronger statement.
   (D5) OVER-STRICTNESS FOR D-276. `MEANING_ARM` spelled `"LEG"` — the plane NORMALISES `rows` (`String(input.rows).trim().toLowerCase()`), so this is CORRECT WORK in a spelling the suite did not anticipate and an arm that failed it would be a fence tighter than its rule -> **agent-worker 113/0 · fanout 175/0 · harness 199/0**, all three unchanged.
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

/* FL-3: the pinned op set lives in `harness.mjs`, beside the table rows that
   use it, rather than being retyped here where a copy would age separately —
   the defect this file's own A2 note is about, one construct over. */
import { PLANE_OPS } from "../src/harness.mjs";
/* D-276: the mock's `op=meaningrows` branch, DERIVED from the plane's own arm
   registry and refusal catalog rather than typed here. See `plane-meaning.mjs`
   for why a fixture that says yes to everything is not a fixture. */
import { MEANING_ARMS, meaningRowsBranch } from "./plane-meaning.mjs";
/* D-276: the arm the MEMBER actually sends, imported rather than retyped — a
   suite asserting about its own copy of the value is the failure this item is
   about, one file over. */
import { MEANING_ARM } from "../src/harness.mjs";

const WORKER_SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const WRANGLER = fileURLToPath(new URL("../wrangler.jsonc", import.meta.url));
const MANIFEST = fileURLToPath(new URL("../fleet-member.json", import.meta.url));
const SRC = readFileSync(WORKER_SRC, "utf8");
/* FL-3: read so `AI_RUN_ACTIONS` — the record's OWN declaration of what an
   agent's task scope may write — is the authority for what this member may
   name, rather than a list kept here. */
const PLANE_INDEX = readFileSync(fileURLToPath(new URL("../../bio-plane/src/index.mjs", import.meta.url)), "utf8");
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
const MUTATING = new Set(["purge", "promote", "suggest", "capturerequest", "ratify", "publish",
                          "airunopen", "airuntick", "airunclose"]);
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
    /* A refused credential, worded exactly as the plane words one: the code, the
       C-number and the DEC-49 canned translation. **MOVED TO THE TOP BY FL-3,
       and the move is the correction rather than a tidy-up:** it used to sit
       BELOW the mutating branch, which was harmless while \`/run\` made exactly
       one non-mutating call and is wrong now — a revoked credential that reached
       a write branch first would have been answered \`wrote: true\`, and the
       pass-through-verbatim arm would have been measuring a mock that admitted a
       withdrawn credential. A refusal is answered before anything else is
       considered, which is what the plane's own gate does. */
    if (token === "aik-" + "c".repeat(64))
      return Response.json({ ok: false, reason: "AI_CREDENTIAL_REVOKED", code: "AI_CREDENTIAL_REVOKED",
        check: "C-29.7",
        translation: "This agent credential has been withdrawn by a member of the group, so it no longer reaches anything here.",
        op, cls: "ai" }, { status: 403 });
    /* FL-3: THE RUN OPS THIS MOCK GAINED, AND WHY IT HAD TO.
       FL-2's \`/run\` did ONE read and this mock answered ONE op. FL-3 fills the
       endpoint with the IS-9 control-flow table, so the envelope this suite
       tests now sits on top of a loop that reads the run object, the run's own
       log and the spawn payload. The answers are the SHALLOWEST that let the
       envelope be exercised — the table itself is proved in harness.test.mjs,
       exhaustively and through the op, and duplicating that here would be two
       instruments measuring one thing and agreeing at zero cost. */
    if (op === "airun")
      return Response.json({ ok: true, result: { run: url.searchParams.get("run"), found: true, session: {
        id: url.searchParams.get("run"), mode: "check", status: "running", max_passes: 1,
        context: { type: "inquiry", id: "INQ-1" },
        budget: [{ bound: "fetches", allowed: 50, consumed: 0 },
                 { bound: "subsessions", allowed: 50, consumed: 0 },
                 { bound: "wallclock", allowed: 500000, consumed: 0 },
                 { bound: "runtime", allowed: 5000, consumed: 0 }] } }, store });
    if (op === "airunlog")
      return Response.json({ ok: true, result: { run: url.searchParams.get("run"), found: true,
        entries: [], limit: 200, truncated: false } });
    if (op === "airunspawn")
      /* PL-12's fence, and this mock reproduces its SHAPE rather than a null:
         the search half's payload has no \`bias\` key AT ALL. */
      return Response.json({ ok: true, result: { found: true, half: "search",
        payload: { run: url.searchParams.get("run"), mode: "check", skill: "pack-1.0.0",
                   context: { type: "inquiry", id: "INQ-1" }, standard_pair: null, budget: [] } } });
    ${meaningRowsBranch("[]")}
    if (op === "basisversions")
      return Response.json({ ok: true, result: { versions: [], limit: 50, truncated: false } });
    if (MUTATING.has(op)) {
      RECORD = { rows: [...RECORD.rows, { op, at: LOG.length }] };
      if (op === "airuntick")
        return Response.json({ ok: true, result: { ticked: true, appended: 1, status: "running" } });
      if (op === "airunclose")
        return Response.json({ ok: true, result: { terminated: true, bound: "completed" } });
      return Response.json({ ok: true, result: { wrote: true }, store });
    }
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
  /* CORRECTED BY FL-3, NEVER EXEMPTED, AND THE OLD ASSERTION WAS RIGHT WHEN IT
     WAS WRITTEN. FL-2 shipped `/run` as a ROUND TRIP and said so on the wire so
     nobody could read it as a finished run. FL-3 fills the endpoint with the
     IS-9 control-flow table, so `round-trip` became a false statement about what
     ran — the assertion moves with the fact. The RULE it enforces is unchanged
     and is now checked in three places rather than one: what ran is named
     (`stage`), no model turns were run (`turns_run`), and where the judgement
     came from is named rather than implied (`judgement_source`). That third one
     is new here because FL-3 introduced the thing it guards: a table-driven walk
     presented without it would be indistinguishable from a model run. */
  t("the stage says the HARNESS ran", out.stage, "harness");
  t("zero model turns were run, stated", out.turns_run, 0);
  t("and the judgement source is NAMED rather than implied", out.judgement_source, "supplied");
  t("with FL-6's unresolved half stated in words", /FL-6/.test(out.judgement_note ?? ""), true);

  console.log("\n  -- the principal is UNDETERMINED and SAYS SO (never guessed, never dropped) --");
  t("principal is null", out.principal, null);
  t("and the reason is on the wire", /UNPUBLISHED/.test(out.principal_source), true);

  console.log("\n  -- WRITES NOTHING ITSELF: every change to the record went through the PLANE --");
  /* CORRECTED BY FL-3, NEVER EXEMPTED. FL-2's arm hashed the plane's record
     before and after a run and required it to be BYTE-IDENTICAL, which was the
     honest measurement of a member that made one read. It is the wrong
     measurement now and it was always slightly the wrong RULE: fleet rule 2 is
     that a member ASSERTS nothing and writes nothing DIRECTLY — no store
     binding, no R2, no provenance of its own — and PL-11's `ai` credential class
     is specified as *"writes ONLY PL-3's endpoint and PL-4's table"*, a scope
     with no consumer if the member holding it may never name those ops. A run
     that logged nothing and proposed nothing would satisfy the old arm perfectly
     while being useless.
     SO THE ARM SPLITS INTO THE TWO THINGS IT WAS CONFLATING, and both are
     stronger than what they replace:
       (1) the record moves ONLY through ops in the pinned set, and every
           mutating one of those is a member PL-11's AI_RUN_ACTIONS declares —
           so a write this member gains is a write somebody decided to give it;
       (2) a REFUSED call still writes nothing at all, byte-identical, which is
           the property FL-2's hash was really protecting and is kept verbatim
           below in section 3. */
  const after = await mockState(mf);
  const wrote = [...new Set(after.record.rows.map((r) => r.op))].sort();
  t("the record moved only through ops in the pinned set",
    wrote.filter((op) => !PLANE_OPS[op]), []);
  t("and every op that moved it is one PL-11's credential scope can declare",
    wrote.filter((op) => !new RegExp(`const AI_RUN_ACTIONS = \\[[^\\]]*"${op}"`).test(PLANE_INDEX)), []);
  /* NULL-TOLERANT, AND THE CLASS WAS SWEPT ACROSS BOTH SUITES RATHER THAN THE
     SITE THAT BIT. Measured: with control arm A3 armed (the binding replaced by
     a bare global fetch) NO request reaches the mock, so `after.log` is EMPTY
     and `after.log[0].op` THREW — the suite DIED rather than failing, and A3
     came back `0 pass, -1 FAIL`. A3 had reported 54/35 before FL-3 added these
     arms, so this was a regression THIS item introduced into a landed control.
     An assertion that throws cannot name what it broke and takes every arm
     behind it with it (FL-2's own A3 note, one file over). */
  t("nothing was written before the run object was read (identity first, always)",
    after.log[0]?.op === "whoami" && after.record.rows.length > 0
      ? after.log.findIndex((l) => l.op === after.record.rows[0]?.op) > 0 : true, true);
  t("the record was empty before the run", before.record, { rows: [] });

  console.log("\n  -- ONE credential, the one it was handed, and no other --");
  const tokens = [...new Set(after.log.map((l) => l.token))];
  t("exactly one distinct credential reached the plane", tokens.length, 1);
  t("and it is the one handed in", tokens[0], AIK);
  const ops = [...new Set(after.log.map((l) => l.op))].sort();
  /* CORRECTED BY FL-3, NEVER EXEMPTED. `["whoami"]` was FL-2's exact truth and
     is now a floor that no longer describes the endpoint. The RULE — an exact
     set, floor and ceiling both — is unchanged, and the set itself is declared
     in `harness.mjs`'s `PLANE_OPS` where the rows that use it live, rather than
     retyped here where it would age separately. */
  t("every op named is in the pinned set, and no other op was reached",
    ops.filter((op) => !PLANE_OPS[op]), []);
  t("and the round trip's own op is still the FIRST thing asked", after.log[0]?.op ?? null, "whoami");

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
  /* CORRECTED BY D-276, NEVER EXEMPTED, AND THE OLD SCAN WAS RIGHT WHEN IT WAS
     WRITTEN. It read op names out of `call("literal"` only. D-276 gave the
     meaning read's op name a CONSTANT — `const MEANING_OP = "meaningrows"` —
     because `planeAnswer` needs the same name and writing the literal twice
     would have fired `harness.test.mjs`'s one-meaning-reader pin on a LABEL.
     The moment that landed, this arm reported `meaningrows` as an op the source
     "never names" while the source was calling it every run: a matcher that
     goes blind reads exactly like a subject that changed. So the scan RESOLVES
     a const alias, and — because a matcher must say what it cannot see — every
     `call(IDENTIFIER,` it fails to resolve is NAMED by the arm below rather
     than silently scored zero. */
  const OP_ALIAS = Object.fromEntries(
    [...CODE.matchAll(/const\s+([A-Z][A-Z0-9_]*)\s*=\s*"([a-z]+)"\s*;/g)].map((m) => [m[1], m[2]]));
  const viaAlias = [...CODE.matchAll(/call\(\s*([A-Za-z_$][\w$]*)\s*,/g)].map((m) => m[1]);
  t("every op named through a CONSTANT resolves to a literal — none is invisible to this scan",
    viaAlias.filter((id) => !(id in OP_ALIAS)), []);
  const named = [...new Set([
    ...[...CODE.matchAll(/askPlane\(\s*env\s*,\s*"([a-z]+)"/g)].map((m) => m[1]),
    ...[...CODE.matchAll(/call\(\s*"([a-z]+)"/g)].map((m) => m[1]),
    ...viaAlias.map((id) => OP_ALIAS[id]).filter(Boolean),
  ])].sort();
  /* FLOOR AND CEILING BOTH, by exact equality. A call this member gains is a call
     somebody decided to give it, and a call it loses is visible too. D-199 (2):
     what an agent may reach is a row a member authored and read at the plane's
     gate — never a list compiled into a Worker.
     CORRECTED BY FL-3, NEVER EXEMPTED. The literal `["whoami"]` was FL-2's exact
     truth; it is compared against `harness.mjs`'s declaration now so the set has
     ONE home rather than a copy here that ages separately — which is the defect
     this file's own header spends a paragraph on one arm over. It is still an
     EXACT equality and still catches a gained call and a lost one. */
  t("every op named in the source is in the pinned set", named.filter((op) => !PLANE_OPS[op]), []);
  t("and the pinned set has no member the source never names",
    Object.keys(PLANE_OPS).filter((op) => !named.includes(op)), []);
  /* CORRECTED BY FL-3, NEVER EXEMPTED, AND THE OLD ARM WAS THE RIGHT ARM FOR A
     MEMBER THAT MADE ONE READ. "No mutating op name appears in the source AT
     ALL" cannot survive an endpoint that must write a version and spend a
     budget, and FL-3's acceptance is unreachable without both. What replaces it
     is not weaker: every mutating op this member names must be one PL-11's
     `AI_RUN_ACTIONS` declares, READ FROM THE PLANE'S OWN SOURCE rather than from
     a list here — so a mutating op that is not in the record's own declaration
     of what an agent's task scope may cover fails this arm, and the plane's list
     shrinking fails it too. */
  const mutatingNamed = named.filter((op) => PLANE_OPS[op] && PLANE_OPS[op].mutating);
  t("the member does name mutating ops now, so this arm has a subject", mutatingNamed.length > 0, true);
  t("and every one of them is declared by PL-11's AI_RUN_ACTIONS in the plane's own source",
    mutatingNamed.filter((op) => !new RegExp(`const AI_RUN_ACTIONS = \\[[^\\]]*"${op}"`).test(PLANE_INDEX)), []);
  t("no op outside the record's own agent-write declaration is named",
    named.filter((op) => !PLANE_OPS[op]), []);
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
  /* CORRECTED BY FL-3, NEVER EXEMPTED — the same correction as section 1's, and
     for the same reason. `{ rows: [] }` was FL-2's exact truth for an endpoint
     that made one read; an endpoint that logs every step it takes legitimately
     moves the record, and requiring stillness here would make the over-strictness
     section fail on CORRECT work, which is precisely what an over-strictness
     section exists to catch. What must still hold is that nothing outside the
     pinned set moved it, and that no version was proposed by a run whose
     judgement composed none. */
  t("and none of them wrote through an op outside the pinned set",
    [...new Set(st.record.rows.map((r) => r.op))].filter((op) => !PLANE_OPS[op]), []);
  t("and none of them proposed a version, because none of them composed one",
    st.record.rows.filter((r) => r.op === "suggest"), []);
  await mf.dispose();
}

/* ================================================================ 8 · D-276
 * THE ARM IS ONE THE RECORD ACTUALLY HOLDS, AND IT IS DRIVEN AGAINST THE REAL
 * PLANE RATHER THAN AGAINST THIS FILE'S MOCK.
 *
 * D-276: this member asked `op=meaningrows` for `rows: "legs"` at all three call
 * sites. The compiler's arms are `leg`, `resolves` and `concerns`, so the plane
 * refused every one of those calls `MEANING_ROWS_UNKNOWN_ARM` (C-23.2) — the one
 * fence built to stop a false sense of coverage — and the caller, which checked
 * only whether the plane had ANSWERED, wrote `0 meaning-grain row(s) queried`
 * into an AI run's observation entries. **A refusal recorded as a confident
 * zero, in the record.**
 *
 * IT WAS INVISIBLE TO EVERY SUITE, WHICH IS THE HALF THAT MATTERS HERE. All
 * three plane mocks answered that op `{ ok: true, rows: [] }` for ANY argument,
 * so 464 assertions were green over a call that could not succeed. A mock and a
 * caller that agree because the mock agrees with everything have measured
 * nothing — the hand-copy-agrees-for-free class, and the reason `plane-meaning.mjs`
 * DERIVES the fixture from the plane's own registry instead of restating it.
 *
 * SO THIS SECTION STANDS UP `bio-plane/src/index.mjs` ITSELF in workerd, with a
 * real Durable Object, and asks it. The plane is the authority on which arms
 * exist; a suite that asked the mock would be asking the thing that was wrong.
 * ============================================================================ */
console.log("\n--- 8 · D-276: the meaning ARM, driven against the REAL plane in workerd ---");
{
  const PLANE_ENTRY = fileURLToPath(new URL("../../bio-plane/src/index.mjs", import.meta.url));
  const plane = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: PLANE_ENTRY, script: readFileSync(PLANE_ENTRY, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: "adm-d276", MEMBER_TOKEN: "mem-d276", PROBE_TOKEN: "prb-d276", VERSION: "test" },
  });
  const askArm = async (spelling) => (await (await plane.dispatchFetch(
    `http://x/api/?op=meaningrows&token=mem-d276&limit=1&rows=${encodeURIComponent(spelling)}`)).json());

  /* THE PLANE NORMALISES `rows` — `String(input.rows).trim().toLowerCase()` in
     `Store#meaningRows` — so a member spelling the arm `"LEG"` or `" leg "` is
     doing CORRECT WORK IN A SPELLING THIS SUITE DID NOT ANTICIPATE, and an arm
     that failed it would be a fence tighter than its rule. These comparisons are
     made against the plane's own normalisation rather than against the literal,
     and the over-strictness arm in `agent-worker.control.mjs` drives it. */
  const ARM_NORM = String(MEANING_ARM).trim().toLowerCase();
  console.log(`  the plane's arms: ${MEANING_ARMS.join(", ")} · this member reads at: ${JSON.stringify(MEANING_ARM)}`);
  t("ARMED: the plane declares arms at all (a walk over an empty registry proves nothing)",
    MEANING_ARMS.length > 0, true);
  t("the arm this member sends is one the plane's own compiler holds",
    MEANING_ARMS.includes(ARM_NORM), true);

  /* THE POSITIVE POLE, THROUGH THE OP. Not "the string matches a key" — the real
     plane, asked with the member's own exported constant, ANSWERS. */
  const good = await askArm(MEANING_ARM);
  t("THE REAL PLANE ANSWERS the arm this member sends: envelope ok, and the answer's own ok",
    [good?.ok, good?.result?.ok, good?.result?.arm], [true, true, ARM_NORM]);
  t("...and it answers with a rows collection, which is what the run note counts",
    Array.isArray(good?.result?.rows), true);

  /* THE NEGATIVE POLE, AND IT IS WHAT STOPS THE ARM ABOVE FROM BEING FREE. If
     the plane accepted anything, the positive arm would pass over a subject that
     could not fail. This is D-276's exact defect, reproduced live. */
  const bad = await askArm("legs");
  t("D-276 REPRODUCED: the spelling this member used to send is REFUSED by the real plane",
    [bad?.ok, bad?.result?.ok, bad?.result?.reason, bad?.result?.check],
    [true, false, "MEANING_ROWS_UNKNOWN_ARM", "C-23.2"]);
  /* AND WHERE THE REFUSAL SITS IS ITSELF THE FINDING. HTTP 200, top-level
     `ok: true`, the refusal nested in `result` — so a member that checked the
     ENVELOPE's `ok` would have read this as a successful call, which is the same
     defect one layer in from the `.reached` check that shipped. */
  t("...at HTTP 200 with a TOP-LEVEL ok:true — checking the envelope alone would NOT have seen it",
    [bad?.ok, "reason" in (bad ?? {}), bad?.result?.reason != null], [true, false, true]);
  t("...and the caller's old arithmetic over that body still computes ZERO, which is the defect",
    Array.isArray(bad?.result?.rows) ? bad.result.rows.length : 0, 0);

  /* THE MOCK AND THE PLANE MUST AGREE ABOUT BOTH POLES, or this file's other
     seven sections are measuring a plane that does not exist. */
  const mf = newMf();
  const mockAsk = async (spelling) => {
    const w = await mf.getWorker("plane-mock");
    return (await (await w.fetch(
      `http://plane/?op=meaningrows&store=scratch&token=${AIK}&rows=${encodeURIComponent(spelling)}`)).json());
  };
  const mockBad = await mockAsk("legs");
  const mockGood = await mockAsk(MEANING_ARM);
  t("THE MOCK CAN REFUSE, and refuses the same spelling with the same code and the same C-number",
    [mockBad?.ok, mockBad?.result?.ok, mockBad?.result?.reason, mockBad?.result?.check],
    [bad?.ok, bad?.result?.ok, bad?.result?.reason, bad?.result?.check]);
  t("...and it accepts the same arm the plane accepts",
    [mockGood?.ok, mockGood?.result?.ok, mockGood?.result?.arm],
    [good?.ok, good?.result?.ok, good?.result?.arm]);
  t("...and it refuses a MISSING arm too, as C-23.1 does, so no default can creep back in",
    [(await mockAsk(""))?.result?.reason, (await mockAsk(""))?.result?.check],
    ["MEANING_ROWS_NO_ARM", "C-23.1"]);

  /* AND THROUGH THE MEMBER: a whole run, and the observation entry it wrote.
     This is the arm that fails if the argument is ever wrong again — the note in
     an AI run's log must say rows were QUERIED, and the run must publish no
     `meaningrows` refusal. */
  const out = await (await run(mf, { run_id: "run-d276", store: "scratch", credential: AIK })).json();
  const compose = (out.trace || []).find((x) => x.step === "compose");
  /* PRINTED — the SENTENCE that lands in an AI run's observation entries is this
     item's actual subject, and a reader (or a control) that could only see
     `want true / got false` would know something moved and never what. */
  console.log(`  observation entry: ${JSON.stringify(compose?.note ?? null)}`);
  t("ARMED: the run really reached the step that reads the meaning layer",
    compose != null, true);
  t("THE OBSERVATION ENTRY SAYS THE RECORD WAS QUERIED, at the grain it was asked at",
    new RegExp(`meaning-grain row\\(s\\) queried at the '${MEANING_ARM}' grain`).test(compose?.note ?? ""),
    true);
  t("...and it does NOT say the meaning layer went unread, which is what a refused arm writes",
    /NOT READ/.test(compose?.note ?? ""), false);
  t("...and the run published no meaningrows refusal at all",
    (out.refusals || []).filter((r) => r && r.at === "meaningrows"), []);
  await mf.dispose();
  await plane.dispose();
}

console.log(`\nagent-worker: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
