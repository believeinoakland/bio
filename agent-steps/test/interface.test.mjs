/* agent-steps — THE MODULE'S INTERFACE, PART 1: the run read, the payer, the log and the target, the pack, and what the
 * rows do against the plane (R1–R5, R9–R11, R13, R16). `driveHarness(host, env, opts)` is driven through the test shell
 * over a configurable fake plane (`world.mjs`) that records every call at the binding. Every arm that admits has its
 * refusing or absent counterpart beside it (K874). */
import "../../bio-plane/test/sandbox.mjs";
import shell, { HOST } from "./shell.mjs";
import { driveHarness, MAX_STEPS } from "../src/index.mjs";
import { ACCOUNT } from "./account.mjs";
import { world, body, CHECK, AIK, PACK, PACK_VERSION, SCOPED } from "./world.mjs";
import { airunRefusal } from "../../bio-plane/test/m/ai-runs/fixtures.mjs";
import { versionChainNoSuchVersion } from "../../bio-plane/test/m/provenance/fixtures.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const section = (s) => console.log(`\n--- ${s} ---`);

/** One segment over the shell: the wire-shaped answer and the plane's record. */
async function go(cfg = {}, extra = {}, env = {}) {
  const w = world(cfg);
  const res = await shell.fetch(new Request("http://steps/run", { method: "POST", body: JSON.stringify(body(extra)) }),
    { PLANE: { fetch: w.fetch }, VERSION: "w", ...env });
  return { status: res.status, out: await res.json(), rec: w.rec };
}
const ops = (rec) => rec.calls.map((c) => c.op);
const steps = (out) => (out.trace || []).map((x) => `${x.step}>${x.to}`);

section("R1 · the run is read from the plane, never from the caller");
{
  const silent = await go({ silent: ["airun"] }, { judgements: CHECK() });
  t("R1: a plane that does not answer op=airun is 502 PLANE_SILENT, and nothing else is asked", [silent.status, silent.out.code, ops(silent.rec)], [502, "PLANE_SILENT", ["airun"]]);
  const refused = await go({ refuse: { airun: "NOT_FOR_YOU" } }, { judgements: CHECK() });
  t("R1: a plane that refuses op=airun is 403 PLANE_REFUSED, its refusal passed on unchanged", [refused.status, refused.out.code, refused.out.plane?.code, refused.out.plane?.check, refused.out.plane?.translation],
    [403, "PLANE_REFUSED", "NOT_FOR_YOU", "C-0.0", "canned NOT_FOR_YOU"]);
  const { notPrincipal } = await airunRefusal();
  const wrapped = await go({ answer: { airun: (q, b, ok) => ok(notPrincipal) } }, { judgements: CHECK() });
  t("R1: a refusal nested in a well-formed 200 answer is a refusal too, never a missing run", [wrapped.status, wrapped.out.code, wrapped.out.plane?.result?.code], [403, "PLANE_REFUSED", "AI_RUN_NOT_PRINCIPAL"]);
  const none = await go({ noSession: true }, { judgements: CHECK() });
  t("R1: no session is 404 NO_SUCH_RUN with the run's id", [none.status, none.out.code, none.out.run_id], [404, "NO_SUCH_RUN", "RUN-W"]);
  const w = world({ session: { mode: "check" } });
  const drive = await driveHarness(HOST, { PLANE: { fetch: w.fetch } }, { runId: "RUN-W", store: "scratch", credential: AIK, account: ACCOUNT,
    judgements: CHECK(), mode: "plan", maxSteps: 50 });
  t("R1: a `mode` handed in beside the run has no effect: the run's own mode drives", [drive.mode, ops(w.rec).includes("plan"), ops(w.rec).includes("airunspawn")], ["check", false, true]);
  const planned = await go({ session: { mode: "plan", context: { type: "inquiry", id: "INQ-W" } } }, { judgements: [] });
  t("R1: and the mode is the record's whichever way it points (plan)", planned.out.mode, "plan");
}

section("R2 · the run is held to the member whose act the account serves");
{
  const other = await go({ session: { principal: { plane: "member:ruth", claude: "member:ruth", ref: "member:somebody-else", skill: PACK_VERSION } } }, { judgements: CHECK() });
  t("R2: a run recorded for another member is 409 RUN_NAMES_A_DIFFERENT_PAYER, naming both members", [other.status, other.out.code, other.out.recorded, other.out.supplied],
    [409, "RUN_NAMES_A_DIFFERENT_PAYER", "member:somebody-else", ACCOUNT.member]);
  t("R2: before any step: only the run was read, nothing ticked, spawned or closed", [ops(other.rec), other.rec.closed], [["airun"], null]);
  t("R2: no secret is in the refusal", JSON.stringify(other.out).includes(ACCOUNT.secret), false);
  const owner = await go({ session: { principal: { plane: "member:ruth", claude: "group", ref: ACCOUNT.member, skill: PACK_VERSION } } }, { judgements: CHECK() });
  t("R2 (control): the paying owner (`principal.claude`) is never compared: a run the team's key pays is still that member's act", [owner.status, owner.out.ok], [200, true]);
  const same = await go({}, { judgements: CHECK() });
  t("R2 (control): the same member proceeds", [same.status, same.out.ok], [200, true]);
}

section("R3 · the log is read; a resumed run continues");
{
  const silent = await go({ silent: ["airunlog"] }, { judgements: CHECK() });
  t("R3: a plane silent on op=airunlog is 502 PLANE_SILENT (no guess of an empty log)", [silent.status, silent.out.code], [502, "PLANE_SILENT"]);
  const refused = await go({ refuse: { airunlog: "LOG_NOT_FOR_YOU" } }, { judgements: CHECK() });
  t("R3: a refused op=airunlog is 403 PLANE_REFUSED, passed on", [refused.status, refused.out.code, refused.out.plane?.code], [403, "PLANE_REFUSED", "LOG_NOT_FOR_YOU"]);
  const fresh = await go({}, { judgements: CHECK() });
  const resumed = await go({ entries: [{ seq: 1 }, { seq: 2 }, { seq: 3 }] }, { judgements: CHECK() });
  t("R3: resumed_from is the number of entries the log holds", [fresh.out.resumed_from, resumed.out.resumed_from], [0, 3]);
  const at = await go({ session: { state: { ...SCOPED, step: "compose", pass: 0, reports: [] } } }, { judgements: [{ candidates: [] }, {}] });
  t("R3: a run with a published state continues at it", [steps(at.out)[0], steps(at.out)[1]], ["gate-mode>resume", "resume>compose"]);
  const none = await go({ session: { state: null } }, { judgements: CHECK() });
  t("R3: a run with no published state starts from the resume step", [steps(none.out)[0], steps(none.out)[1]], ["gate-mode>resume", "resume>plan"]);
}

section("R4 · the run's target is its context's question, never a project");
{
  const inq = await go({ session: { context: { type: "inquiry", id: "INQ-W" } } }, { judgements: CHECK() });
  t("R4: an inquiry context's id is the target", inq.out.target?.id, "INQ-W");
  const one = await go({ session: { context: { type: "project", id: "PROJ-1", questions: ["INQ-Q"] } } }, { judgements: CHECK() });
  t("R4: a project with one published question has that question for target, never the project", [one.out.target?.id, one.out.target?.id === "PROJ-1"], ["INQ-Q", false]);
  const many = await go({ session: { context: { type: "project", id: "PROJ-1", questions: ["INQ-A", "INQ-B"] } } }, { judgements: CHECK() });
  const zero = await go({ session: { context: { type: "project", id: "PROJ-1", questions: [] } } }, { judgements: CHECK() });
  const unpub = await go({ session: { context: { type: "project", id: "PROJ-1" } } }, { judgements: CHECK() });
  const kind = await go({ session: { context: { type: "profile", id: "X" } } }, { judgements: CHECK() });
  t("R4: several, none, not published and an unread kind are each null with a basis saying UNDETERMINED",
    [many, zero, unpub, kind].map((r) => [r.out.target?.id ?? null, /^UNDETERMINED/.test(r.out.target?.basis ?? "")]), [[null, true], [null, true], [null, true], [null, true]]);
}

/* ---- the model, for the arms that run turns: a scripted Messages API over the global fetch ---- */
async function withModel(answer, fn) {
  const saved = globalThis.fetch, requests = [];
  globalThis.fetch = async (url, init) => {
    const sent = JSON.parse(init.body);
    requests.push(sent);
    return Response.json({ id: "msg", type: "message", role: "assistant", content: answer(sent), stop_reason: "tool_use", usage: { input_tokens: 1, output_tokens: 1 } });
  };
  try { return await fn(requests); } finally { globalThis.fetch = saved; }
}
const lastPrompt = (sent) => [...sent.messages].reverse().map((m) => (m.role !== "user" ? "" : typeof m.content === "string" ? m.content
  : (Array.isArray(m.content) ? m.content.filter((c) => c.type === "text").map((c) => c.text).join("") : ""))).find((c) => /judge_/.test(c)) || "";
const judging = (sent) => {
  const step = (/Answer by calling judge_([a-z]+)/.exec(lastPrompt(sent)) || [])[1] || "plan";
  return [{ type: "tool_use", id: "j", name: `judge_${step}`, input: {} }];
};
const noModelCalls = (requests) => requests.length;

section("R5 · the pack the model is instructed by is the plane's, held to the run's record, before any turn");
{
  const other = await withModel(judging, async (requests) => ({ ...(await go({ packVersion: "investigative-session@other+1111111111111111" }, { judgements: undefined })), calls: noModelCalls(requests) }));
  t("R5: a pack of another version than the run recorded is 409 SKILL_VERSION_MISMATCH, with both versions, and no model call",
    [other.status, other.out.code, other.out.recorded, other.out.rendered, other.calls], [409, "SKILL_VERSION_MISMATCH", PACK_VERSION, "investigative-session@other+1111111111111111", 0]);
  const absent = await withModel(judging, async (requests) => ({ ...(await go({ pack: null, packAbsent: "the plane renders none" }, { judgements: undefined })), calls: noModelCalls(requests) }));
  t("R5: an answer with no usable pack gives the same code, `rendered` null, UNDETERMINED and the plane's reason, and no model call",
    [absent.status, absent.out.code, absent.out.rendered, absent.out.rendered_basis, absent.out.pack_absent, absent.calls], [409, "SKILL_VERSION_MISMATCH", null, "UNDETERMINED", "the plane renders none", 0]);
  const partial = await withModel(judging, async () => await go({ pack: { version: "v", resident: {} } }, { judgements: undefined }));
  t("R5: a partial pack (no disclosed map) is never used: its version is UNDETERMINED", [partial.status, partial.out.code, partial.out.rendered], [409, "SKILL_VERSION_MISMATCH", null]);
  t("R5: each of the three runs the dispatch settlement (R34): the run is closed on `lease`, not left to lapse", [other.rec.closed, absent.rec.closed, partial.rec.closed], ["lease", "lease", "lease"]);
  const refused = await withModel(judging, async (requests) => ({ ...(await go({ refuse: { agentpack: "PACK_NOT_FOR_YOU" } }, { judgements: undefined })), calls: noModelCalls(requests) }));
  t("R5: a read the plane refuses is passed on as PLANE_REFUSED, unchanged, with no model call", [refused.status, refused.out.code, refused.out.plane?.code, refused.calls], [403, "PLANE_REFUSED", "PACK_NOT_FOR_YOU", 0]);
  const silent = await withModel(judging, async (requests) => ({ ...(await go({ silent: ["agentpack"] }, { judgements: undefined })), calls: noModelCalls(requests) }));
  t("R5: a read the plane does not answer is PLANE_SILENT", [silent.status, silent.out.code], [502, "PLANE_SILENT"]);
  const same = await withModel(judging, async (requests) => ({ ...(await go({}, { judgements: undefined }, {})), requests }));
  t("R5 (control): the same version proceeds to the first turn, and the request the model receives carries the pack's system text",
    [same.status, same.requests.length > 0, JSON.stringify(same.requests[0]?.system ?? "").includes("find what the record holds")], [200, true, true]);
  const stubbed = await go({}, { judgements: CHECK() });
  t("R5 (control): with `judgements` (no model) no op=agentpack is sent", ops(stubbed.rec).includes("agentpack"), false);
  t("R5: the pack is read under the run's credential", same.rec.calls.filter((c) => c.op === "agentpack").map((c) => c.token), [AIK]);
}

section("R9 · holdings: each document once, by the record's own chain; a refused read leaves it UNDETERMINED");
{
  const V = (id, sha) => ({ bundle_id: id, capture_sha: sha });
  const cfg = {
    hits: { "INFO-1": { bundle_id: "INFO-1", source_locator: "upload:a" }, "INFO-2": { bundle_id: "INFO-2", source_locator: "upload:a" },
            "INFO-3": { bundle_id: "INFO-3", source_locator: "upload:b" }, "INFO-4": { bundle_id: "INFO-4", source_locator: "upload:c" } },
    chains: { "upload:a": [V("INFO-1", "s1"), V("INFO-2", "s2")], "upload:b": [V("INFO-3", "s3")] },
    answer: { versionchain: (q, b, ok, refuse) => (q.address === "upload:c" ? refuse("CHAIN_REFUSED") : ok({ address_norm: q.address, total: 0, truncated: false, versions: [] })) },
  };
  const report = (...addrs) => ({ level: "meaning", state: "PRESENT", observed_at: "log:1", summary: "found", citations: addrs.map((address) => ({ address })) });
  const chainRefusal = await versionChainNoSuchVersion();
  const cfgFull = { ...cfg, answer: { versionchain: (q, b, ok, refuse) => (q.address === "upload:c" ? refuse(chainRefusal)
    : ok({ address_norm: q.address, total: (cfg.chains[q.address] || []).length, truncated: false, versions: cfg.chains[q.address] || [] })) } };
  const run = await go(cfgFull, { judgements: CHECK([report("INFO-1", "INFO-2", "INFO-3", "INFO-4")]) });
  t("R9: two captures of one address count as one document and a second address as another: 2 documents, not 3", run.out.holdings?.documents, 2);
  t("R9: the citation looked up as a held bundle (op=search, id:) and the chain read at its source address",
    [run.rec.calls.filter((c) => c.op === "search").map((c) => c.query.q).includes('id:"INFO-1"'), run.rec.calls.filter((c) => c.op === "versionchain").map((c) => c.query.address).sort()],
    [true, ["upload:a", "upload:a", "upload:b", "upload:c"]]);
  t("R9: a refused chain read leaves that citation's document UNDETERMINED, published, and never counted",
    [(run.out.refusals || []).some((r) => r.at === "versionchain" && r.code === "VERSION_CHAIN_NO_SUCH_VERSION"), JSON.stringify(run.out.holdings ?? {}).includes("INFO-4")], [true, true]);
  const titled = await go({ ...cfgFull, hits: { "INFO-1": cfg.hits["INFO-1"], "INFO-3": cfg.hits["INFO-3"] } }, { judgements: CHECK([report("INFO-1", "INFO-3")]) });
  t("R9 (control): two different documents are two, whatever their titles or text: documents are never merged by anything but the record's address", titled.out.holdings?.documents, 2);
  const nochain = await go({ hits: cfg.hits, chains: {}, answer: undefined }, { judgements: CHECK([report("INFO-3")]) });
  t("R9 (control): an item with no chain is counted as itself (one citation, unchained), never as a document of the chain and never dropped",
    [nochain.out.holdings?.documents, nochain.out.holdings?.citations, nochain.out.holdings?.unchained, nochain.out.holdings?.unchained_items?.[0]?.citation], [0, 1, 1, "INFO-3"]);
}

const ABSENT = ["meaning", "content", "document", "internet"].map((l, i) => ({ level: l, state: "LOOKED_ABSENT", observed_at: `log:${i + 1}` }));
const cand = (name, extra = {}) => ({ kind: "basis-version", name, description: "d", ...extra });
const noteOf = (out, step) => (out.trace || []).find((x) => x.step === step)?.note ?? "";

section("R10 · compose: one meaning read, honest about what it did not read, and the table's level-empty candidates");
{
  const ok = await go({}, { judgements: CHECK(ABSENT) });
  t("R10: one op=meaningrows read at the leg grain is made by compose", ok.rec.calls.filter((c) => c.op === "meaningrows").map((c) => c.query.rows).slice(0, 1), ["leg"]);
  t("R10: one level-empty candidate per level a report found LOOKED_ABSENT, in the suggestion spelling (document -> documents), named level-empty-<level>",
    ok.rec.wrote, ["level-empty-meaning", "level-empty-content", "level-empty-documents", "level-empty-internet"]);
  const first = ok.rec.suggested[0];
  t("R10: each carries its level, observed_at, the run's target and a description composed from those facts",
    [first.kind, first.level, first.observed_at, first.target, first.run, /log:1/.test(first.description)], ["level-empty", "meaning", "log:1", "INQ-W", "RUN-W", true]);
  const refused = await go({ refuse: { meaningrows: "MR_REFUSED" } }, { judgements: CHECK(ABSENT) });
  t("R10: a refused read says the meaning layer was NOT READ, names the plane's refusal, and reports no zero", [/NOT READ/.test(noteOf(refused.out, "compose")), /MR_REFUSED/.test(noteOf(refused.out, "compose")), /\b0 meaning-grain/.test(noteOf(refused.out, "compose"))], [true, true, false]);
  const norows = await go({ answer: { meaningrows: (q, b, ok2) => ok2({ ok: true, count: 0 }) } }, { judgements: CHECK(ABSENT) });
  t("R10: an answer with no rows list says UNDETERMINED, never zero", [/UNDETERMINED/.test(noteOf(norows.out, "compose")), /\b0 meaning-grain/.test(noteOf(norows.out, "compose"))], [true, false]);
  const none = await go({}, { judgements: CHECK([{ level: "meaning", state: "PRESENT", observed_at: "log:1", summary: "there", citations: [{ address: "INFO-9" }] }]) });
  t("R10 (control): no level reported LOOKED_ABSENT, no level-empty candidate", none.rec.wrote, []);
}

section("R11 · dedup compares against the record's own versions, before any write");
{
  const run = await go({ held: ["v-held"] }, { judgements: CHECK([], [cand("v-held"), cand("v-new"), cand("v-other", { target: "INQ-OTHER" })]) });
  t("R11: a candidate aimed at the target whose name is held is dropped; the others go on", run.rec.wrote, ["v-new", "v-other"]);
  t("R11: the basis versions are read for the target", run.rec.calls.filter((c) => c.op === "basisversions").map((c) => c.query.id), ["INQ-W"]);
  t("R11: a candidate aimed at another question goes on uncompared, and the note counts it", [/not compared|NOT compared/i.test(noteOf(run.out, "dedup")), /1 already held/.test(noteOf(run.out, "dedup"))], [true, true]);
  t("R11: nothing is written before dedup has compared: the held name is never posted", run.rec.suggested.some((s) => s.name === "v-held"), false);
  const refused = await go({ held: ["v-held"], refuse: { basisversions: "BV_REFUSED" } }, { judgements: CHECK([], [cand("v-held")]) });
  t("R11: a refused read sends every candidate on, and the note says they were compared against NOTHING", [refused.rec.wrote, /NOTHING/.test(noteOf(refused.out, "dedup"))], [["v-held"], true]);
  const nothing = await go({ held: [] }, { judgements: CHECK([], [cand("v-new")]) });
  t("R11 (control): a name the record does not hold is written", nothing.rec.wrote, ["v-new"]);
}

section("R13 · adjust resends a candidate only when its canonical bytes differ from the refused submission");
{
  const refuse = (b) => (b.name === "v1" && b.description === "d" ? "SUGGEST_REFUSED" : null);
  const changed = await go({ suggestRefuse: refuse }, { judgements: [...CHECK([], [cand("v1")]).slice(0, 3), {}, { submission: cand("v1", { description: "d2" }) }] });
  t("R13: a changed submission is resent, and lands", [changed.rec.suggested.map((s) => s.description), changed.rec.wrote, changed.out.adjusted], [["d", "d2"], ["v1"], 1]);
  const same = await go({ suggestRefuse: refuse }, { judgements: [...CHECK([], [cand("v1"), cand("v2")]).slice(0, 3), {}, { submission: cand("v1") }] });
  t("R13: an unchanged one is dropped and never resent; the rest of the queue is still written", [same.rec.suggested.map((s) => s.name), same.rec.wrote, same.out.adjusted], [["v1", "v2"], ["v2"], 0]);
  const dropped = await go({ suggestRefuse: refuse }, { judgements: [...CHECK([], [cand("v1")]).slice(0, 3), {}, {}] });
  t("R13 (control): a verbatim resubmit is never made: the refused candidate was posted once", [dropped.rec.suggested.length, dropped.out.verbatim_resubmits], [1, 0]);
}

section("R16 · close names the bound; the segment's own ceiling is never a run's bound");
{
  const done = await go({}, { judgements: CHECK() });
  t("R16: op=airunclose names the bound, and ended is {bound, by: the table} when the plane accepted", [done.rec.closed, done.out.ended], ["completed", { bound: "completed", by: "the table" }]);
  const { notPrincipal } = await airunRefusal();
  const refused = await go({ closeRefuse: notPrincipal }, { judgements: CHECK() });
  t("R16: a refused close leaves ended null and the refusal published", [refused.out.ended, (refused.out.refusals || []).some((r) => r.at === "airunclose" && r.code === "AI_RUN_NOT_PRINCIPAL")], [null, true]);
  const short = await go({}, { judgements: CHECK(), max_steps: 3 });
  t("R16: max_steps ends the invocation, not the run: three rows walked, no close sent, no bound reported", [short.out.trace.length, short.out.ended, short.rec.closed], [3, null, null]);
  t("R16: max_steps is at most 400 (the module's own ceiling)", MAX_STEPS, 400);
}

section("R19 · a re-examination run reads the recorded response and the procedure guide, besides the plan's reads");
{
  const A = { summary: "Ask the clerk for the minutes", category: "awareness", subjects: [{ kind: "outcome", determination: "DET-1", standard: "STD-1" }], why: "the response was late", sources: ["DET-1"] };
  const plan = (extra = {}, answers = {}) => ({
    session: { mode: "plan", plan: "PLN-1", context: { type: "project", id: "PROJ-7", questions: [] }, state: {}, budget: [{ bound: "proposals", allowed: 20, consumed: 0 }, { bound: "wallclock", allowed: 600000, consumed: 0 }, { bound: "runtime", allowed: 5000, consumed: 0 }], ...extra },
    other: (op, q, b, ok) => {
      if (answers[op]) return answers[op](q, b, ok);
      switch (op) {
        case "plan": return ok({ id: "PLN-1", project: "PROJ-7", subjects: [], options: [], proposals: [] });
        case "plans": return ok({ plans: [], truncated: false });
        case "profiles": return ok({ profiles: [{ id: "us-ca" }], conflicts: [] });
        // fixtures-contract: control-plane ask-wire (UNKNOWN_OP: an op with no spec is 400)
        default: return Response.json({ ok: false, error: "unknown op: " + op }, { status: 400 });
      }
    },
  });
  const full = { action: (q, b, ok) => ok({ id: q.id, kind: "records_request", correspondence: [{ ord: 0, artifact_sha: "a".repeat(64) }, { ord: 1 }] }),
                 reading: (q, b, ok) => ok({ text: "the response, as the readers extracted it" }),
                 procedureguides: (q, b, ok) => ok({ kind: q.kind, guides: [{ id: "G-1" }] }) };
  const re = await go(plan({ origin: "reexamination", response: "ACT-1#0" }, full), { judgements: [{ candidates: [A] }] });
  const asked = (rec, op) => rec.calls.filter((c) => c.op === op).map((c) => c.query);
  t("R19: it reads the action by the id before the `#`, the capture's text by the entry's sha, and the guide by the action's kind",
    [asked(re.rec, "action"), asked(re.rec, "reading"), asked(re.rec, "procedureguides")].map((l) => l.map(({ id, sha256, kind }) => id ?? sha256 ?? kind)), [["ACT-1"], ["a".repeat(64)], ["records_request"]]);
  t("R19: its candidates are optionpropose proposals as R18, and it writes nothing else",
    [re.rec.proposals.map((p) => p.summary), [...new Set(re.rec.calls.map((c) => c.op))].filter((op) => ["suggest", "capturerequest", "airunspawn", "optionadd"].includes(op)), re.out.ended?.bound], [[A.summary], [], "completed"]);
  t("R19: every read is under the run's credential and nothing else", [...new Set(re.rec.calls.map((c) => c.token))], [AIK]);
  const plain = await go(plan({}, full), { judgements: [{ candidates: [A] }] });
  t("R19 (control): a plan-mode run that is not a re-examination reads none of the three", ["action", "reading", "procedureguides"].map((op) => asked(plain.rec, op).length), [0, 0, 0]);
  const bad = await go(plan({ origin: "reexamination", response: "no-ordinal" }, full), { judgements: [{ candidates: [A] }] });
  t("R19: a response id it cannot take apart reads nothing, and is UNDETERMINED in the read's note, never a refusal of the run",
    [asked(bad.rec, "action").length, / [1-9]\d* UNDETERMINED/.test(noteOf(bad.out, "read")), bad.out.ok, bad.rec.proposals.length], [0, true, true, 1]);
  const bare = await go(plan({ origin: "reexamination", response: "ACT-1#1" }, full), { judgements: [{ candidates: [A] }] });
  t("R19: an entry with no capture is a member's account: no reading is made, the guide still is, and the gap is UNDETERMINED",
    [asked(bare.rec, "reading").length, asked(bare.rec, "procedureguides").length, / [1-9]\d* UNDETERMINED/.test(noteOf(bare.out, "read"))], [0, 1, true]);
  const missing = await go(plan({ origin: "reexamination", response: "ACT-1#7" }, full), { judgements: [{ candidates: [A] }] });
  t("R19: an entry the action does not hold is UNDETERMINED (no capture read), the run goes on", [asked(missing.rec, "reading").length, / [1-9]\d* UNDETERMINED/.test(noteOf(missing.out, "read")), missing.out.ok], [0, true, true]);
  const refusedReading = await go(plan({ origin: "reexamination", response: "ACT-1#0" }, { ...full, reading: (q, b, ok) => ok({ ok: false, reason: "NOT_FOR_YOU", code: "NOT_FOR_YOU" }) }), { judgements: [{ candidates: [A] }] });
  t("R19: a refused or silent read is carried as UNDETERMINED and the proposal still goes out", [refusedReading.out.ok, refusedReading.rec.proposals.length], [true, 1]);
}

section("R14 · after every step one tick carries the spend, and an entry only when a look is stated");
{
  const run = await go({}, { judgements: CHECK() });
  const stepTicks = run.rec.ticks.filter((tk) => !("segment_end" in tk));
  t("R14: one op=airuntick follows every step the table walked", stepTicks.length, run.out.trace.length);
  const consumes = Object.fromEntries(run.out.trace.map((x, i) => [x.step, stepTicks[i].consume]));
  t("R14: runtime is the plane calls of that step + 1: fanout makes 4 spawns and spends 4 subsessions and 5 runtime; a step that calls nothing spends 1",
    [consumes.fanout?.subsessions, consumes.fanout?.runtime, consumes.plan?.runtime, consumes["gate-mode"]?.runtime], [4, 5, 1, 1]);
  t("R14: a step that looked at nothing and wrote nothing sends no entry, and no entry carries NEVER_LOOKED", [run.out.logged, run.rec.log.length, run.rec.log.filter((e) => e.state === "NEVER_LOOKED").length], [0, 0, 0]);
  const present = await go({}, { judgements: [{ targets: [], level: "meaning", observed: "PRESENT", summary: "x" }, { reports: [] }, { candidates: [] }, {}] });
  t("R14: a step judged PRESENT that can name nothing is logged LOOKED_INDETERMINATE with the stated reason and counted in present_unbacked",
    [present.out.present_unbacked, present.rec.log.map((e) => e.state), /PRESENT/.test(present.rec.log[0]?.detail ?? ""), present.rec.log[0]?.detail.length <= 500], [1, ["LOOKED_INDETERMINATE"], true, true]);
  t("R14: logged counts the entries the plane appended", [present.out.logged, present.rec.log.length], [1, 1]);
  const refusedEntry = await go({ tick: (b) => ((b.log || []).length ? { appended: 0, refused: [{ index: 0, code: "AI_LOG_STATE_UNKNOWN", check: "C-22.1" }] } : {}) },
    { judgements: [{ targets: [], level: "meaning", observed: "PRESENT", summary: "x" }, { reports: [] }, { candidates: [] }, {}] });
  t("R14: each entry the plane refused is in log_refused and in refusals, and not in logged", [refusedEntry.out.logged, refusedEntry.out.log_refused.length, refusedEntry.out.refusals.some((r) => r.code === "AI_LOG_STATE_UNKNOWN")], [0, 1, true]);
  const ended = await go({ tick: (b) => ("segment_end" in b ? {} : { ended: { bound: "wallclock", condition: null } }) }, { judgements: CHECK() });
  t("R14: when the tick reports the run ended, the segment stops and ended.by is the plane's own exit", [ended.out.ended?.by, ended.out.trace.length], ["the plane's own exit", 1]);
  t("R14: a tick after no conversation carries no usage", run.rec.ticks.some((tk) => "usage" in tk), false);
}

section("R15 · the state a tick publishes stays within the ceiling, and a refusal for its size is a refusal, not a failure of the plane");
{
  const big = "x".repeat(300);
  const many = Array.from({ length: 1200 }, (_, i) => ({ kind: "basis-version", name: `v${i}`, description: big }));
  const huge = await go({}, { judgements: CHECK([], many) });
  const sizes = huge.rec.ticks.filter((tk) => tk.state).map((tk) => JSON.stringify(tk.state).length);
  t("R15: no published state exceeds run-rules' AI_RUN_STATE_MAX_BYTES (262,144), though the working set is larger", [Math.max(...sizes) <= 262144, JSON.stringify(many).length > 262144], [true, true]);
  let ticks = 0;
  const refused = await go({ answer: { airuntick: (q, b, ok, refuse) => ((b.state && ++ticks === 2) ? Response.json({ ok: false, reason: "AI_RUN_STATE_TOO_LARGE", code: "AI_RUN_STATE_TOO_LARGE", check: "C-22.9" }, { status: 403 }) : ok({ ticked: true, appended: 0, refused: [] })) } }, { judgements: CHECK() });
  t("R15: a tick refused AI_RUN_STATE_TOO_LARGE is recorded as a refusal at airuntick with its code and check, and the run is not stopped as a failure of the plane",
    [refused.status, refused.out.ok, refused.out.refusals.filter((r) => r.at === "airuntick").map((r) => [r.code, r.check])], [200, true, [["AI_RUN_STATE_TOO_LARGE", "C-22.9"]]]);
}

console.log(`\ninterface: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
