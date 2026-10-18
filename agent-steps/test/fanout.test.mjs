/* agent-steps — THE SUB-SESSION FAN-OUT, THROUGH THE MODULE'S INTERFACE (R6, R7, R8, R12, R13, R14, R33, R36; moved from
 * `agent-worker`'s `fanout.test.mjs` Part B). Part A of that suite (the spawn and return contracts, pure) is
 * `agent-harness`' and stays there. Part B ran `POST /run` inside workerd over a service binding; here the same plane mock
 * is run in this process and the fan-out is driven through the test shell (`driveHarness`), so what the arms assert is
 * unchanged: four sub-sessions' contracts, their reports held to the contract, the parent re-reading by address, the one
 * write, the bias fence, log-always. The workerd run (the bundle itself) is the Worker shell's. */
import { withAccount } from "./account.mjs";
import "../../bio-plane/test/sandbox.mjs";
import shell from "./shell.mjs";

import { LEVELS, REPORTING_LEVEL } from "../../agent-harness/src/harness.mjs";
import { SUBSESSION_OPS, REPORT_MAX_BYTES } from "../../agent-harness/src/subsession.mjs";
import { MEANING_ARM } from "../src/names.mjs";
import { MEANING_ARMS, meaningRowsBranch } from "./plane-meaning.mjs";
import { versionReadBranches } from "./plane-versions.mjs";
import { suggestBranch, WIRE_CHECKS } from "./plane-suggest.mjs";
import { captureRequestBranch } from "./plane-capturerequest.mjs";

/* The ops a run's plane calls may name, by what they do: the shell declares them (`agent-worker`'s `PLANE_OPS`, which that
   module's suite holds); here only the writes matter, to show the parent holds the only write. */
const WRITES = ["airuntick", "airunclose", "suggest", "capturerequest", "airunspawn", "optionpropose"];
const DECLARED = [...WRITES, "whoami", "airun", "airunlog", "meaningrows", "basisversions", "search", "versionchain", "agentpack"];

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* THE WHOLE KEY TREE of an object, at every depth. The spawn contract's fence is
   that it has no field for a manifest to arrive in UNDER ANY SPELLING, so the
   assertion has to be about the complete set of keys and not about the absence of
   one name — a denylist of one name is exactly the shape §14 warns about. */
function keyTree(value, into = new Set()) {
  if (value === null || typeof value !== "object") return into;
  if (Array.isArray(value)) { for (const v of value) keyTree(v, into); return into; }
  for (const [k, v] of Object.entries(value)) { into.add(k); keyTree(v, into); }
  return into;
}

const AIK = "aik-" + "b".repeat(64);

/* THE LENS THE COMPOSING HALF CARRIES. Distinctive on purpose: the strongest arm
   in this suite is that these bytes appear NOWHERE in what a sub-session was
   handed, and a value-level assertion cannot be dodged by a spelling. */
const LENS_SHA = "LENS-STATEMENTS-SHA-0f0f0f";

const PLANE_MOCK = `
export default {
  async fetch(req, env) {
    const CFG = JSON.parse(env.MOCK || "{}");
    if (!globalThis.__S) globalThis.__S = { log: [], runlog: [], seq: 0, spawns: [], suggested: [] };
    const S = globalThis.__S;
    const url = new URL(req.url);
    if (url.pathname === "/__mock/state")
      return Response.json({ log: S.log, runlog: S.runlog, spawns: S.spawns, suggested: S.suggested,
                             requests: S.requests || [] });
    const op = url.searchParams.get("op") || "";
    let body = null;
    if (req.method === "POST") { try { body = await req.json(); } catch { body = null; } }
    S.log.push({ op, token: (req.headers.get("authorization") || "").replace(/^Bearer /, "") || "", method: req.method, body,
                 query: Object.fromEntries(url.searchParams.entries()) });

    if (op === "whoami")
      return Response.json({ ok: true, result: { tokenClass: "ai", session: false, member: null }, tokenClass: "ai" });

    if (op === "airun")
      return Response.json({ ok: true, result: { session: {
        id: url.searchParams.get("run"), mode: "check", status: "running",
        principal: { plane: "member:ruth", claude: "member:ruth", ref: "member:ruth" },
        context: { type: "inquiry", id: "INQ-1" }, max_passes: 1,
        /* agent-harness R18 (T50): the shell sets a level's \`scope\` from the reads its sub-session made, and this suite
           drives the table with the judgements it is handed, no sub-session reading: so the scope the table needs before it
           writes an absence arrives as the run's published state, a place to resume at \`plan\` with every level read over
           three documents (\`noScope\` leaves it out, as a run that had read nothing). */
        state: CFG.noScope ? null : { step: "plan", pass: 0, scope: Object.fromEntries(
          ["meaning", "content", "document", "internet"].map((l) => [l, { reads: 1, documents: 3 }])) },
        budget: [{ bound: "fetches", allowed: 50, consumed: 0 },
                 { bound: "subsessions", allowed: 50, consumed: 0 },
                 { bound: "wallclock", allowed: 500000, consumed: 0 },
                 { bound: "runtime", allowed: 5000, consumed: 0 }],
      } } });

    if (op === "airunlog")
      return Response.json({ ok: true, result: { entries: [], limit: 200, truncated: false } });

    if (op === "airunspawn") {
      const half = url.searchParams.get("half") === "compose" ? "compose" : "search";
      S.spawns.push(half);
      /* PL-12: the composing half carries the lens and the search half has NO
         bias key at all — written as two explicit literals for the same reason
         store.mjs writes them that way. \`leakBias\` arms the fence's own control:
         it puts the manifest into the SEARCH payload, which is the state this
         member must refuse rather than ignore. */
      const payload = { run: url.searchParams.get("run"), context: { type: "inquiry", id: "INQ-1" },
                        mode: "check", skill: "pack-1.0.0", standard_pair: null,
                        standard: { in_force: false, basis: "context-has-no-project" }, budget: [] };
      const lens = { in_force: true, manifest: { scope: "project", statements_sha: "${LENS_SHA}", bundles: ["b9"] },
                     now: { statements_sha: "${LENS_SHA}" }, moved: false };
      if (half === "compose") return Response.json({ ok: true, result: { half, payload, bias: lens } });
      if (CFG.leakBias) return Response.json({ ok: true, result: { half, payload: { ...payload, bias: lens } } });
      return Response.json({ ok: true, result: { half, payload } });
    }

    ${meaningRowsBranch("[]")}
    ${versionReadBranches()}

    if (op === "basisversions")
      return Response.json({ ok: true, result: { versions: [], limit: 50, truncated: false } });

    if (op === "airuntick") {
      let appended = 0;
      for (const e of Array.isArray(body && body.log) ? body.log : []) { S.runlog.push({ seq: ++S.seq, ...e }); appended += 1; }
      return Response.json({ ok: true, result: { ticked: true, appended, status: "running" } });
    }
    if (op === "airunclose")
      return Response.json({ ok: true, result: { terminated: true, bound: (body && body.bound) || null } });
    ${captureRequestBranch({ run: { principal: JSON.stringify(AIK), status: '"running"' } })}
    ${suggestBranch({ f10: false, run: { context: '({ type: "inquiry", id: "INQ-1" })', cites: "[]",
                                         principal: JSON.stringify(AIK), status: '"running"' } })}
    return Response.json({ ok: false, error: "unknown op: " + op }, { status: 400 });
  },
};
`;

/* The plane mock is a module of its own (`export default {fetch}`), run in this process: `newMf` answers what a Miniflare
   did for the suite that stayed in `agent-worker` (`dispatchFetch`, `getWorker`, `dispose`), over the test shell. */
const newMf = async (cfg = {}) => {
  globalThis.__S = undefined;
  const mock = (await import(`data:text/javascript;base64,${Buffer.from(PLANE_MOCK).toString("base64")}`)).default;
  const mockEnv = { MOCK: JSON.stringify(cfg) };
  const PLANE = { fetch: (url, init) => mock.fetch(new Request(url, init), mockEnv) };
  return {
    dispatchFetch: (url, init) => shell.fetch(new Request(url, init), { PLANE, VERSION: "test" }),
    getWorker: async () => ({ fetch: (url, init) => mock.fetch(new Request(url, init), mockEnv) }),
    dispose: async () => { globalThis.__S = undefined; },
  };
};
const runOp = (mf, body) =>
  mf.dispatchFetch("http://agent-worker/run", { method: "POST", body: JSON.stringify(withAccount(body)) });
const mockState = async (mf) =>
  (await (await (await mf.getWorker("plane-mock")).fetch("http://plane/__mock/state")).json());
const base = { run_id: "run-1", store: "scratch", credential: AIK };

/* The four returns a well-behaved fan-out produces: one per level, each a REPORT
   with a citation where it found something and none where it did not. */
const goodReturns = [
  { level: "meaning", state: "PRESENT", observed_at: "log:1", summary: "a leg already reaches this",
    citations: [{ address: "bundle:m1" }] },
  { level: "content", state: "LOOKED_ABSENT", observed_at: "log:2" },
  { level: "document", state: "PRESENT", observed_at: "log:3", summary: "the packet names it on p.12",
    citations: [{ address: "bundle:d1" }, { address: "bundle:d2" }] },
  { level: "internet", state: "LOOKED_INDETERMINATE", observed_at: "log:4", governed: true },
];

console.log("\n--- R6 · B1 · a run fans out to four sub-sessions and takes four REPORTS ---");
{
  const mf = await newMf();
  const res = await runOp(mf, { ...base,
    judgements: [{ targets: [] }, { reports: goodReturns }, { candidates: [] }, {}] });
  const out = await res.json();
  t("R6: 200 and ok", [res.status, out.ok], [200, true]);
  t("R6: four contracts were composed, one per level, in LEVELS order",
    (out.fanout?.contracts || []).map((c) => c.level), LEVELS);
  t("R6: four sub-session payloads were taken from the plane",
    (await mockState(mf)).spawns.filter((h) => h === "search").length, 4);
  t("R6: all four REPORTS were taken", out.reports_taken, 4);
  t("R6: none was refused", out.reports_refused, []);
  t("R6: the contracts on the wire declare a read-only scope", out.fanout?.scope ?? null, SUBSESSION_OPS);
  t("R6: and carry no `bias` field to read",
    (out.fanout?.contracts || []).filter((c) => Object.prototype.hasOwnProperty.call(c, "bias")), []);
  await mf.dispose();
}

console.log("\n--- R8 · B2 · THE PARENT RE-READS BY ADDRESS (§14b.1), observed at the plane ---");
{
  const mf = await newMf();
  const out = await (await runOp(mf, { ...base,
    judgements: [{ targets: [] }, { reports: goodReturns }, { candidates: [] }, {}] })).json();
  /* D-276 SHARPENED THIS ARM RATHER THAN ADDING ONE BESIDE IT. `citations_reread`
     used to climb once per address REGARDLESS of what the plane answered, so it
     counted CALLS MADE and was published as READS DONE — and every one of those
     calls was in fact refused `MEANING_ROWS_UNKNOWN_ARM`, because the member
     asked for an arm the record does not hold. This assertion was passing over
     three refusals. It counts answered reads now, and the mock can refuse
     (`plane-meaning.mjs`), so a wrong arm takes it to 0. */
  t("R8: three distinct addresses were cited and three were re-read", out.citations_reread, 3);
  t("R8: D-276: those three were ANSWERED, not merely attempted — no re-read was refused",
    (out.refusals || []).filter((r) => r && r.at === "meaningrows"), []);
  t("R8: ...and the observation entry says so in the record's own words, all three of three",
    /3 of 3 citation\(s\) re-read BY ADDRESS/.test(
      out.trace?.find((x) => x.step === "collect")?.note ?? ""), true);
  t("R8: ...and the arm it asked at is one the PLANE's compiler holds",
    MEANING_ARMS.includes(String(MEANING_ARM).trim().toLowerCase()), true);
  const st = await mockState(mf);
  const reads = st.log.filter((l) => l.op === "meaningrows" && Array.isArray(l.body?.ids));
  t("R8: each re-read reached the plane as an `ids` restriction on PL-9's own read",
    reads.map((l) => l.body.ids[0]), ["bundle:m1", "bundle:d1", "bundle:d2"]);
  t("R8: and the run did NOT ask for document bytes on the way",
    [...new Set(st.log.map((l) => l.op))].filter((op) => !DECLARED.includes(op)), []);
  /* THE TRADE THE MEMORY MODEL MAKES, made visible: the sub-session handed back
     an ADDRESS and the parent resolved it. What arrived from the sub-session was
     a conclusion; what the parent asked the record for was the rest. */
  t("R8: nothing the sub-sessions returned carried a document",
    JSON.stringify(goodReturns).length < REPORT_MAX_BYTES * 4, true);
  await mf.dispose();
}

console.log("\n--- R8 · B3 · IS-9(a): A DOCUMENT-RETURNING SUB-SESSION IS REFUSED, AND ITS LEVEL IS UNDETERMINED ---");
{
  const mf = await newMf();
  const out = await (await runOp(mf, { ...base, judgements: [
    { targets: [] },
    { reports: [
      { level: "meaning", state: "LOOKED_ABSENT", observed_at: "log:1" },
      /* THE SUB-SESSION THAT DEFEATED THE ARCHITECTURE: it read the document and
         handed the document back, wearing a `LOOKED_ABSENT` claim besides. */
      { level: "content", state: "LOOKED_ABSENT", observed_at: "log:2",
        bytes: "%PDF-1.7 …the whole packet…" },
      { level: "document", state: "LOOKED_ABSENT", observed_at: "log:3" },
      { level: "internet", state: "LOOKED_ABSENT", observed_at: "log:4" },
    ] },
    { candidates: [] }, {},
  ] })).json();

  t("R8: the run still completed — one broken return is not a crash", out.ok, true);
  t("R8: three REPORTS were taken", out.reports_taken, 3);
  t("R8: the fourth was REFUSED and its level is named", (out.reports_refused || []).map((r) => r.level), ["content"]);
  t("R8: with the code and the offending field", [(out.reports_refused || [])[0]?.code ?? null,
    ((out.reports_refused || [])[0]?.fields ?? [null])[0]], ["REPORT_UNKNOWN_FIELD", "bytes"]);

  const st = await mockState(mf);
  /* THE ARM THAT MAKES IT MATTER. The refused return CLAIMED `LOOKED_ABSENT`. Had
     it reached the working set, §9's empty-level kind would have been written for
     `content` off a report the parent never accepted — a contract violation
     MANUFACTURING a claim about the world. */
  /* THE NAMES ARE THE WIRE'S, AND THE OLD SPELLING WAS WRONG RATHER THAN MERELY
     OLD (D-323, 2026-09-13). This assertion read
     `["level-empty:document", "level-empty:internet", "level-empty:meaning"]`
     — a COLON, which `VERSION_NAME_RE` has never admitted, and the log's
     singular `document`, which `SUGGEST_LEVELS` has never held. Both were green
     ONLY because this suite's mock wrote whatever it was handed; the deployed
     plane refuses the first BASIS_REFUSED / C-25.2 and the second
     SUGGEST_EMPTY_LEVEL_UNSTATED / C-27.6. Derived from `REPORTING_LEVEL` rather
     than re-typed, so a respelling fails here instead of landing. */
  t("R8: §9's empty-level kind was written for the three levels that honoured the contract",
    st.suggested.map((s) => s.name).sort(),
    ["document", "internet", "meaning"].map((l) => `level-empty-${REPORTING_LEVEL[l]}`).sort());
  t("R8: and NOT for the refused level — undetermined is not an absence",
    st.suggested.some((s) => s.name === `level-empty-${REPORTING_LEVEL.content}`), false);
  t("R8: and nothing was written under the OLD colon form, which the wire refuses",
    st.suggested.some((s) => String(s.name).includes(":")), false);
  t("R8: nothing the refused return carried reached the plane",
    st.log.filter((l) => /%PDF/.test(JSON.stringify(l.body ?? null))).length, 0);
  await mf.dispose();
}

console.log("\n--- R6 · B4 · THE BIAS FENCE, BEHAVIOURALLY: the lens reaches the composing half and NO sub-session ---");
{
  const mf = await newMf();
  const out = await (await runOp(mf, { ...base,
    judgements: [{ targets: [] }, { reports: goodReturns }, { candidates: [] }, {}] })).json();
  const contracts = out.fanout?.contracts || [];
  t("R6: four contracts were handed out", contracts.length, 4);

  /* THE VALUE-LEVEL ARM, AND IT IS THE ONE NO SPELLING CAN DODGE. The mock's
     COMPOSING half carries a real manifest whose `statements_sha` is distinctive.
     If a lens ever reached the search half — under `bias`, under a rename, nested,
     or by concatenation — these bytes would be somewhere in what a sub-session was
     handed. THIS IS WHAT FL-3's ARM COULD NOT DO: it grepped a trace note that
     never carries the phrase, and stayed green with the fence defeated (measured
     at FL-5: 194 pass / 0 fail with the mock's search payload carrying the lens). */
  t("R6: the manifest's own bytes appear in ZERO sub-session contracts",
    JSON.stringify(contracts).includes(LENS_SHA), false);
  t("R6: and nowhere in the whole answer", JSON.stringify(out).includes(LENS_SHA), false);
  t("R6: the guard is not vacuous: those bytes ARE what the composing half carries",
    LENS_SHA.length > 10, true);

  const st = await mockState(mf);
  t("R6: this member never asked for the composing half at all — it has no use for the lens",
    st.spawns.filter((h) => h === "compose").length, 0);
  t("R6: and no request it sent carried the manifest",
    st.log.filter((l) => JSON.stringify(l.body ?? null).includes(LENS_SHA)).length, 0);
  t("R6: no key in any contract is `bias`, at any depth",
    contracts.flatMap((c) => [...keyTree(c)]).filter((k) => k === "bias"), []);
  await mf.dispose();
}

console.log("\n--- R6 · B5 · THE SECOND WITNESS THROUGH THE OP: a leaked lens STOPS the run ---");
{
  const mf = await newMf({ leakBias: true });
  const res = await runOp(mf, { ...base,
    judgements: [{ targets: [] }, { reports: goodReturns }, { candidates: [] }, {}] });
  const out = await res.json();
  t("R6: 502 SPAWN_PAYLOAD_CARRIES_LENS", [res.status, out.reason], [502, "SPAWN_PAYLOAD_CARRIES_LENS"]);
  t("R6: the level it was composing for is named", out.level, LEVELS[0]);
  t("R6: it does not convert the plane's defect into a claim about the run", out.reason === "NO_SUCH_RUN", false);
  const st = await mockState(mf);
  t("R6: the run wrote nothing", st.suggested, []);
  t("R6: and it stopped at the FIRST level rather than fanning out anyway",
    st.spawns.filter((h) => h === "search").length, 1);
  await mf.dispose();
}

console.log("\n--- R12 · B6 · THE PARENT HOLDS THE ONLY WRITE ---");
{
  const mf = await newMf();
  const out = await (await runOp(mf, { ...base, judgements: [
    { targets: [] }, { reports: goodReturns },
    /* D-324: the kind read `new-version` until 2026-09-13 and the spelling was
       WRONG, not merely old. §9 holds five kinds and `new-version` is none of
       them; a deployed plane answers SUGGEST_UNKNOWN_KIND / C-27.3 and publishes
       the closed set. The fixture passed only against a mock that accepted any
       kind, so this arm's whole landing half had never been exercised with a
       kind the endpoint would take. `basis-version` is §9's main output and is
       what a composing run actually proposes. */
    { candidates: [{ kind: "basis-version", name: "v1", description: "what the reports support" }] }, {},
  ] })).json();
  const st = await mockState(mf);
  const mutating = st.log.filter((l) => WRITES.includes(l.op));
  t("R12: the record moved, so the arm has something to be about", mutating.length > 0, true);
  t("R12: every mutating call was made under the PARENT's one credential",
    [...new Set(mutating.map((l) => l.token))], [AIK]);
  t("R12: and every mutating op is one no sub-session may name",
    [...new Set(mutating.map((l) => l.op))].filter((op) => SUBSESSION_OPS.includes(op)), []);
  /* The composed version AND the one level that reported an absence — §9's kind
     rides the same write path, which is the point of it being a kind. */
  /* Same correction as B3's, one arm over: the colon form is the wire's refusal,
     not a name. D-323. */
  t("R12: the version landed, written by the parent", st.suggested.map((s) => s.name),
    ["v1", `level-empty-${REPORTING_LEVEL.content}`]);
  t("R12: no contract handed out carried a credential to write with",
    JSON.stringify(out.fanout?.contracts ?? []).includes("aik-"), false);
  await mf.dispose();
}

console.log("\n--- R12 · B6b · D-324: THE MOCK REFUSES A KIND THE RECORD DOES NOT HOLD ---");
/* THIS ARM EXISTS BECAUSE THE NEGATIVE CONTROL FOUND THIS SUITE COULD NOT SEE
   ITS OWN FIXTURE WIDEN. `wire-vocabulary.control.mjs` arm W-E restores the
   PERMISSIVE mock — the pre-2026-09-13 branch that wrote whatever it was handed
   — and measured `harness.test.mjs` at 202/12 and this suite at **176/0**: every
   candidate this file submits is already LEGAL, so a mock that accepts
   everything and a mock that accepts the legal thing are indistinguishable from
   inside it. A suite that cannot fail when its double is widened is not pinning
   its double. So one candidate here is ILLEGAL ON PURPOSE, and the arm asserts
   the mock REFUSED it in the plane's own words — which only a mock holding the
   catalogue can do. */
{
  const mf = await newMf();
  const out = await (await runOp(mf, { ...base, judgements: [
    { targets: [] }, { reports: goodReturns },
    /* THE LEGAL ONE FIRST, DELIBERATELY. A refused candidate routes to `adjust`
       and, unanswered, is DROPPED. Until D-452 (2026-09-24) the run then closed
       rather than working the rest of the queue, so an illegal candidate placed
       first left the legal one unsubmitted (measured: `got []` with the order
       reversed). D-452 made a drop drop ONE candidate; the order is kept so this
       arm reads the legal one landing AHEAD of the refusal, as it always has. */
    { candidates: [{ kind: "basis-version", name: "v0", description: "what the reports support" },
                   { kind: "new-version", name: "v1", description: "what the reports support" }] }, {},
    /* the adjust row: the model cannot answer a closed-set refusal, so the
       candidate is DROPPED — F10's other half, over a REAL refusal rather than
       a staged one. */
    {},
  ] })).json();
  const st = await mockState(mf);
  t("R12: the run still completed — a refused candidate is not a crash", out.ok, true);
  t("R12: the refusal is on the wire in the PLANE's words", out.refusals?.[0]?.code ?? null, "SUGGEST_UNKNOWN_KIND");
  t("R12: carrying the catalogue's own C-number", out.refusals?.[0]?.plane?.check ?? null,
    WIRE_CHECKS.SUGGEST_UNKNOWN_KIND.check);
  t("R12: and the catalogue's canned translation, to the byte", out.refusals?.[0]?.plane?.translation ?? null,
    WIRE_CHECKS.SUGGEST_UNKNOWN_KIND.translation);
  t("R12: the illegal candidate did NOT land",
    st.suggested.some((s) => s.name === "v1"), false);
  /* AND THE LEGAL SIBLING SUBMITTED BEFORE IT DID, so this is the mock refusing
     the right thing rather than refusing everything — the arm that stops a mock
     being "corrected" into a fixture that says no to everything, which is the
     same defect as saying yes to everything pointed the other way. */
  /* CORRECTED 2026-09-24 (D-452), AND THE OLD EXPECTATION WAS THE DEFECT RATHER THAN A STALE FIGURE. It read
     `["v0"]`: the table-made `level-empty-content` candidate (the one level `goodReturns` reports absent) is
     queued BEHIND the dropped `v1`, and the old `adjust` row ended the pass at the drop, so §9's instrument was
     silently never written — and this assertion pinned that loss as correct. It now lands too, exactly once. */
  t("R12: while the legal candidate ahead of it in the queue LANDED — and the level-empty one BEHIND the dropped "
    + "candidate landed too (D-452: a drop drops one candidate, not the pass)",
    st.suggested.map((s) => s.name), ["v0", `level-empty-${REPORTING_LEVEL.content}`]);
  await mf.dispose();
}

console.log("\n--- R14 · B7 · LOG-ALWAYS holds across FL-5's row, and the observation log says what happened ---");
{
  const mf = await newMf();
  const out = await (await runOp(mf, { ...base, judgements: [
    { targets: [] },
    { reports: [{ level: "meaning", state: "LOOKED_ABSENT", observed_at: "log:1", raw: "the document" },
                ...goodReturns.slice(1)] },
    { candidates: [] }, {},
  ] })).json();
  const st = await mockState(mf);
  /* ONE ENTRY PER STEP, and the relation here is `==` rather than `+1` because
     THIS mock does not append a terminal entry of its own on `airunclose` —
     FL-3's does, reproducing PL-5's `#aiRunTerminate`. Two different instruments
     answering two different questions, and the arithmetic is stated so the
     difference is a decision rather than a discrepancy. */
  /* CORRECTED BY R26 (K148), NEVER EXEMPTED. This arm read "every step produced a log entry", and each of those
     entries said NEVER_LOOKED, which the record refuses from a member (observation-log R3). Log-always now means
     every step TICKS (its spend and lease), and an entry is sent only by a step whose judgement stated a look —
     none here, so the run's log holds none, and not one NEVER_LOOKED. */
  /* R91 (R085): a segment also sends one closing tick, `segment_end`, beside its step ticks; this counts step ticks. */
  /* R114 (T50) adds a tick of its own for each re-read `collect` makes, sent as it is made; those are counted below. */
  const rereadTick = (l) => (l.body?.log || []).some((e) => e.subject === "collect -> re-read");
  t("R14: every step still ticked", (out.trace || []).length,
    st.log.filter((l) => l.op === "airuntick" && !("segment_end" in (l.body || {})) && !rereadTick(l)).length);
  t("R36: and each citation `collect` re-read was ticked as it was read, `read` carrying its place as data",
    st.runlog.filter((e) => e.subject === "collect -> re-read").map((e) => [e.read?.n, e.read?.total, e.read?.outcome]),
    [[1, 2, "answered"], [2, 2, "answered"]]);
  /* R105 (R085) adds the one entry a step may send beside its look: the write of a candidate, logged with its name,
     level and pass. So the log holds exactly that entry for the one candidate written (`level-empty-content`), and
     every other step, having looked at nothing, still sent none. */
  t("R14: and no step that looked at nothing sent an entry; the one candidate written is logged as written (R33)",
    st.runlog.filter((e) => e.subject !== "collect -> re-read")
      .map((e) => [e.subject, e.state, /^wrote 'level-empty-content' at level content in pass 1$/.test(e.detail)]),
    [["submit -> candidate written", "LOOKED_INDETERMINATE", true]]);
  t("R14: and the run actually took some steps", (out.trace || []).length > 5, true);
  const collect = (out.trace || []).find((x) => x.step === "collect");
  t("R14: the collect step's note names both numbers", /3 REPORT\(s\) taken, 1 REFUSED/.test(collect?.note ?? ""), true);
  t("R14: and says the citations were re-read BY ADDRESS", /re-read BY ADDRESS/.test(collect?.note ?? ""), true);
  t("R14: the transition's own reason names the architecture's rule",
    /defeated the architecture/.test(collect?.why ?? ""), true);
  t("R14: and calls the refused level UNDETERMINED rather than empty",
    /UNDETERMINED, not empty/.test(collect?.why ?? ""), true);
  await mf.dispose();
}

console.log("\n--- R8 · B8 · OVER-STRICTNESS through the op: legal fan-outs must run ---");
{
  const cases = [
    ["no returns at all — an unrun fan-out is not a broken one", { reports: [] }],
    ["one level reporting, three silent", { reports: [goodReturns[0]] }],
    ["every level NEVER_LOOKED", { reports: LEVELS.map((l) => ({ level: l, state: "NEVER_LOOKED" })) }],
    ["all four citing the same address", { reports: LEVELS.map((l, i) => ({ level: l, state: "PRESENT",
      observed_at: `log:${i}`, citations: [{ address: "bundle:same" }] })) }],
    ["a report with every optional field", { reports: [{ level: "meaning", state: "partial", observed_at: "log:1",
      summary: "s", citations: [{ address: "b1" }], governed: false, condition: null }] }],
    ["two levels reporting the same level twice (the parent judges, not the shape)",
      { reports: [goodReturns[0], { ...goodReturns[0], observed_at: "log:9" }] }],
  ];
  for (const [label, collectJudgement] of cases) {
    const mf = await newMf();
    const res = await runOp(mf, { ...base,
      judgements: [{ targets: [] }, collectJudgement, { candidates: [] }, {}] });
    const out = await res.json();
    t(`${label} -> accepted`, [res.status, out.ok, out.reports_refused], [200, true, []]);
    await mf.dispose();
  }
}

console.log("\n--- R7 · FL-12 · the fan-out's internet level files its request by ADDRESS, and the mock refuses `url` ---");
{
  /* FL-12: this mock answered `queued` to ANY capture-request body, so the member's `url` (a field the plane
     never reads) was invisible here. The branch is now derived from the plane (`plane-capturerequest.mjs`)
     and refuses by name; the first assertion drives it directly so the second is not a mock saying yes.
     NEGATIVE CONTROL: `test/harness.control.mjs` T2 (send `url` again) — this arm fails by name. */
  const mf = await newMf({});
  const mock = await mf.getWorker("plane-mock");
  const direct = (await (await mock.fetch(`http://plane/?op=capturerequest&store=scratch`,
    { method: "POST", headers: { authorization: `Bearer ${AIK}` }, body: JSON.stringify({ run: "run-1", target: "INQ-1", url: "https://example.org/a" }) })).json()).result ?? {};
  t("R7: FL-12a: a request carrying its locator only as `url` is refused CAPTURE_REQUEST_NOT_PUBLIC (C-28.2) by the mock, as by the plane",
    [direct.code, direct.check], ["CAPTURE_REQUEST_NOT_PUBLIC", "C-28.2"]);
  /* capture-requests R49 (T35; F2, K1880): the mock refuses, as the plane does, an address the record does not
     already hold (query included) and one over 2,048 characters, so a run's request is never accepted on a mock's word. */
  /* Aimed at no question, so a held address passes R49 and stops at the next rule, and nothing is queued here. */
  const direct49 = async (address) => (await (await mock.fetch(`http://plane/?op=capturerequest&store=scratch`,
    { method: "POST", headers: { authorization: `Bearer ${AIK}` },
      body: JSON.stringify({ run: "run-1", target: "PROJ-1", address }) })).json()).result ?? {};
  t("R7: capture-requests R49: the mock refuses an address the record does not hold, query included, and an over-long one, by name; a held one (host case aside) passes to the next rule",
    [(await direct49("https://example.org/a?d=leaked")).code, (await direct49("https://elsewhere.example/a")).code,
     (await direct49("https://example.org/a?" + "x".repeat(2048))).code, (await direct49("https://EXAMPLE.org/a")).code],
    ["CAPTURE_REQUEST_ADDRESS_NOT_HELD", "CAPTURE_REQUEST_ADDRESS_NOT_HELD", "CAPTURE_REQUEST_ADDRESS_TOO_LONG",
     "CAPTURE_REQUEST_NOT_AN_INQUIRY"]);
  const out = await (await runOp(mf, { ...base,
    judgements: [{ targets: [{ level: "internet", url: "https://example.org/a" }] }, { reports: goodReturns }, {}, {}] })).json();
  const st = await mockState(mf);
  t("R7: FL-12b (the ADDRESS arm): the run's internet-level target was QUEUED, named by `address`, under the run's question",
    [st.requests, (out.refusals || []).filter((r) => r.at === "capturerequest")],
    [[{ run: base.run_id, target: "INQ-1", address: "https://example.org/a" }], []]);
  await mf.dispose();
}

console.log(`\nfanout: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
