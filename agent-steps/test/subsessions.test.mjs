/* agent-steps — THE SUB-SESSIONS, THE LOG AND THE FENCE, THROUGH A SCRIPTED MODEL (R21–R23, R37–R42). A check run is
 * driven through the test shell over the fake plane and a scripted Messages API on the global fetch: the coordinating
 * rows are answered with judgements, each level's sub-session reads and reports as the script says. Every arm that
 * admits has its refusing or absent counterpart beside it (K874). */
import "../../bio-plane/test/sandbox.mjs";
import shell from "./shell.mjs";
import { MODEL_FOR_MODE, SUBSESSION_MODEL } from "../../agent-model/src/model.mjs";
import { LEVELS, REPORTING_LEVEL, CONTROL_FLOW, NOT_JUDGEABLE } from "../../agent-harness/src/harness.mjs";
import { ACCOUNT } from "./account.mjs";
import { world, body, CHECK, SCOPED } from "./world.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const section = (s) => console.log(`\n--- ${s} ---`);

const text = (m) => (typeof m.content === "string" ? m.content : (Array.isArray(m.content) ? m.content.map((c) => c.text ?? "").join("") : ""));
/** spec: reads {level: [input, ...]} (each a meaningrows tool input, in order), reports {level: [input, ...]} (the attempts, the
 *  last repeated), judge {step: input}. Records the requests as `seen`. */
function scripted(spec = {}) {
  const seen = [];
  const answer = (sent) => {
    seen.push(sent);
    const names = (sent.tools || []).map((x) => x.name);
    if (names.includes("report")) {
      const level = (/Search the (\w+) level/.exec(text(sent.messages[0])) || [])[1];
      const uses = sent.messages.filter((m) => m.role === "assistant" && Array.isArray(m.content)).flatMap((m) => m.content).filter((b) => b.type === "tool_use");
      const reads = uses.filter((u) => u.name === "meaningrows").length, reports = uses.filter((u) => u.name === "report").length;
      const plan = spec.reads?.[level] || [];
      if (reads < plan.length) return [{ type: "tool_use", id: `q${reads}`, name: "meaningrows", input: plan[reads] }];
      const attempts = spec.reports?.[level] || [{ state: "LOOKED_ABSENT", summary: "nothing here" }];
      return [{ type: "tool_use", id: `r${reports}`, name: "report", input: attempts[Math.min(reports, attempts.length - 1)] }];
    }
    const prompt = [...sent.messages].reverse().filter((m) => m.role === "user").map(text).find((c) => /judge_/.test(c)) || "";
    const step = (/Answer by calling judge_([a-z]+)/.exec(prompt) || [])[1] || "plan";
    return [{ type: "tool_use", id: "j", name: `judge_${step}`, input: spec.judge?.[step] ?? {} }];
  };
  return { answer, seen };
}
async function model(spec, cfg = {}, extra = {}) {
  const sc = scripted(spec), w = world(cfg), saved = globalThis.fetch;
  globalThis.fetch = async (url, init) => Response.json({ id: "msg", type: "message", role: "assistant", content: sc.answer(JSON.parse(init.body)), stop_reason: "tool_use", usage: { input_tokens: 1, output_tokens: 1 } });
  try {
    const res = await shell.fetch(new Request("http://steps/run", { method: "POST", body: JSON.stringify(body({ judgements: undefined, ...extra })) }),
      { PLANE: { fetch: w.fetch }, VERSION: "w" });
    return { status: res.status, out: await res.json(), rec: w.rec, seen: sc.seen };
  } finally { globalThis.fetch = saved; }
}
const stub = async (cfg, judgements, extra = {}) => {
  const w = world(cfg);
  const res = await shell.fetch(new Request("http://steps/run", { method: "POST", body: JSON.stringify(body({ judgements, ...extra })) }), { PLANE: { fetch: w.fetch }, VERSION: "w" });
  return { status: res.status, out: await res.json(), rec: w.rec };
};
const PRESENT = (address, extra = {}) => ({ state: "PRESENT", summary: "found it", citations: [{ address }], ...extra });
const noteOf = (out, step) => (out.trace || []).find((x) => x.step === step)?.note ?? "";

section("R21 · a run's tick entries and its sub-agents' reports reach the log");
{
  const run = await model({ reports: { meaning: [PRESENT("INFO-1")], content: [{ state: "LOOKED_ABSENT" }] } }, { hits: { "INFO-1": { bundle_id: "INFO-1", source_locator: "upload:a" } } });
  t("R21: a check run's tick entries are appended (logged > 0, the plane holds them) and every sub-agent's report is located and taken",
    [run.status, run.out.logged > 0, run.out.logged === run.rec.log.length, run.out.reports_taken, run.out.reports_refused], [200, true, true, LEVELS.length, []]);
  t("R21: each report's observed_at is the address of its own logged look (log:<seq>), and the look is in the record",
    run.rec.log.filter((e) => /sub-session/.test(String(e.subject || ""))).length > 0, true);
  const unlocated = await stub({}, CHECK([{ level: "meaning", state: "LOOKED_ABSENT" }]));
  t("R21 (control): a report that states a look but names where it was logged is refused REPORT_UNLOCATED", (unlocated.out.reports_refused || []).map((r) => r.code), ["REPORT_UNLOCATED"]);
  t("R21: no entry sent to the log states a condition outside the record's vocabulary, or a governed look with a definitive state",
    run.rec.log.filter((e) => e.condition != null && !["runtime-ceiling-reached", "source-unreachable-governed"].includes(e.condition)).length, 0);
}

section("R22 · a sub-session's report is checked before it is taken; a refused one is handed back once");
{
  const long = (n) => ({ state: "LOOKED_ABSENT", summary: "x".repeat(n) });
  const fixed = await model({ reports: { content: [long(700), long(300)] } });
  t("R22: a first report with a 700-character summary is handed back once with the refusal, and the second (300) is taken", [fixed.out.reports_taken, (fixed.out.reports_refused || []).map((r) => r.level)], [LEVELS.length, []]);
  const handedBack = fixed.seen.filter((s) => (s.tools || []).some((x) => x.name === "report")).filter((s) => /REPORT_OVER_BOUND/.test(JSON.stringify(s.messages)));
  t("R22: the hand-back names the refusal's code to the sub-session", handedBack.length > 0, true);
  const bad = await model({ reports: { content: [long(700), long(701)] } });
  t("R22 (control): two over-bound reports leave that level refused REPORT_OVER_BOUND and the others taken, never read as an absence",
    [bad.out.reports_taken, (bad.out.reports_refused || []).map((r) => [r.level, r.code])], [LEVELS.length - 1, [["content", "REPORT_OVER_BOUND"]]]);
  t("R22 (control): the refused level wrote no level-empty candidate", bad.rec.wrote.includes(`level-empty-${REPORTING_LEVEL.content}`), false);
}

section("R23 · a check's sub-sessions call converse with the subsession role; no other conversation does");
{
  const run = await model({});
  const sub = run.seen.filter((s) => (s.tools || []).some((x) => x.name === "report"));
  const coord = run.seen.filter((s) => !(s.tools || []).some((x) => x.name === "report"));
  const subConversations = new Set(sub.map((s) => text(s.messages[0]).match(/Search the (\w+) level/)?.[1]));
  t("R23: each of the four sub-sessions ran on the sub-session model", [[...subConversations].sort(), [...new Set(sub.map((s) => s.model))]], [[...LEVELS].sort(), [SUBSESSION_MODEL]]);
  t("R23 (control): the coordinating rows ran on the mode's model, none on the sub-session's", [[...new Set(coord.map((s) => s.model))], SUBSESSION_MODEL !== MODEL_FOR_MODE.check], [[MODEL_FOR_MODE.check], true]);
}

section("R37 · a run does not go around the fence of its credential");
{
  const V = (id) => ({ bundle_id: id, capture_sha: "s".repeat(8) });
  const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b";
  const hits = { [A]: { bundle_id: A, source_locator: "upload:a" } };
  const cite = (...a) => ({ level: "meaning", state: "PRESENT", observed_at: "log:1", summary: "there", citations: a.map((address) => ({ address })) });
  const chains = { "upload:a": [V(A)], "upload:b": [V(B)] };
  const fenced = await stub({ hits, chains }, CHECK([cite(A, B)]));
  t("R37: a cited record the plane does not answer to the credential gets no record_id and no capture in holdings, counts as no document, and is named UNDETERMINED in the note",
    [fenced.out.holdings.documents, fenced.out.holdings.by_document.map((d) => d.record_id), JSON.stringify([fenced.out.holdings.by_document, fenced.out.holdings.unchained_items]).includes(B) || fenced.out.holdings.undetermined_items.some((u) => u.citation === B && ("record_id" in u || "capture_sha" in u)), new RegExp(B).test(noteOf(fenced.out, "collect")), /UNDETERMINED/.test(noteOf(fenced.out, "collect"))],
    [1, [A], false, true, true]);
  const open = await stub({ hits: { ...hits, [B]: { bundle_id: B, source_locator: "upload:b" } }, chains }, CHECK([cite(A, B)]));
  t("R37 (control): with both records answered, both are held", [open.out.holdings.documents, open.out.holdings.by_document.map((d) => d.record_id).sort()], [2, [A, B]]);
  t("R37: the module's reads all go under the run's one credential", [...new Set(fenced.rec.calls.map((c) => c.token))].length, 1);
}
section("R38 · a disagreement between levels is stated and read once, never looped");
{
  const pair = { record: "INFO-1", levels: ["meaning", "content"] };
  const run = await stub({}, [{ targets: [] }, { reports: [] }, { candidates: [], disagreements: [pair] }, {}]);
  const passage = run.rec.calls.filter((c) => c.op === "meaningrows" && c.query.rows === "passage");
  t("R38: a judgement naming one pair gives one passage read of that record (ids=[record]) and one log entry carrying disagree data",
    [passage.length, passage.map((c) => c.body), run.rec.log.filter((e) => e.disagree).map((e) => e.disagree), run.rec.log.filter((e) => e.disagree).map((e) => [e.level, e.state])],
    [1, [{ ids: ["INFO-1"] }], [{ record: "INFO-1", levels: ["meaning", "content"] }], [["meaning", "LOOKED_INDETERMINATE"]]]);
  t("R38: the entry says whether the read answered", /answered|read/.test(run.rec.log.find((e) => e.disagree)?.detail ?? ""), true);
  const twice = await stub({ session: { max_passes: 2 } }, [{ targets: [] }, { reports: [] }, { candidates: [], disagreements: [pair] }, {}, {}, { targets: [] }, { reports: [] }, { candidates: [], disagreements: [pair] }, {}, {}]);
  t("R38: the same pair named in a later pass is not read again", [twice.rec.calls.filter((c) => c.op === "meaningrows" && c.query.rows === "passage").length, twice.rec.log.filter((e) => e.disagree).length], [1, 1]);
  const none = await stub({}, CHECK());
  t("R38 (control): no disagreements, no passage read and no entry", [none.rec.calls.filter((c) => c.op === "meaningrows" && c.query.rows === "passage").length, none.rec.log.filter((e) => e.disagree).length], [0, 0]);
  const refused = await stub({ answer: { meaningrows: (q, b, ok, refuse) => (q.rows === "passage" ? refuse("PASSAGE_REFUSED") : ok({ ok: true, arm: q.rows, rows: [], count: 0, scope: { documents: 3 } })) } },
    [{ targets: [] }, { reports: [] }, { candidates: [], disagreements: [pair] }, {}]);
  t("R38: a refused passage read is stated as unread, and the run goes on", [refused.out.ok, /unread/.test(refused.rec.log.find((e) => e.disagree)?.detail ?? "")], [true, true]);
}

section("R39 · a condition outside the record's vocabulary is handed back once");
{
  const withCondition = (condition) => PRESENT("INFO-1", { condition });
  const once = await model({ reports: { meaning: [withCondition("the source was slow"), withCondition("runtime-ceiling-reached")] } });
  t("R39: a report PRESENT with prose in `condition` is handed back once and taken when the second names a vocabulary condition", [once.out.reports_taken, (once.out.reports_refused || []).length], [LEVELS.length, 0]);
  t("R39: the hand-back carries the code and the vocabulary", once.seen.some((s) => /AI_RUN_CONDITION_UNKNOWN/.test(JSON.stringify(s.messages)) && /runtime-ceiling-reached/.test(JSON.stringify(s.messages))), true);
  const twice = await model({ reports: { meaning: [withCondition("the source was slow"), withCondition("still prose")] } });
  const entry = twice.rec.log.find((e) => e.level === "meaning" && /still prose/.test(e.detail ?? ""));
  t("R39: two prose conditions: the second is taken with condition null, the state as stated (PRESENT is recorded LOOKED_INDETERMINATE as R14 says), and the prose is in `detail`, never a lower state",
    [twice.out.reports_taken, entry?.condition ?? null, entry?.state, /still prose/.test(entry?.detail ?? "")], [LEVELS.length, null, "LOOKED_INDETERMINATE", true]);
  const plain = await model({ reports: { meaning: [PRESENT("INFO-1")] } });
  t("R39 (control): a report with no condition is not handed back", plain.seen.some((s) => /AI_RUN_CONDITION_UNKNOWN/.test(JSON.stringify(s.messages))), false);
  const judged = await model({ judge: { compose: { candidates: [], condition: "prose" } } });
  t("R39: a judged row (compose) stating a condition outside the vocabulary is handed back once too", judged.seen.some((s) => /AI_RUN_CONDITION_UNKNOWN/.test(JSON.stringify(s.messages))), true);
}

section("R40 · the shell sets each level's scope from what its sub-session's reads stated");
{
  const scoped = (docs) => (q) => ({ ok: true, arm: q.rows, rows: [], count: 0, ...(docs === undefined ? {} : { scope: { documents: docs, documents_with_rows: 0, documents_without_rows: docs } }) });
  const stated = { 11: 0, 12: 2, 13: 0 };
  const rows = (q) => scoped(stated[Number(q.limit)])(q);
  const run = await model({ reads: { meaning: [{ rows: "leg", q: "", limit: 11 }, { rows: "leg", q: "", limit: 12 }], content: [{ rows: "leg", q: "", limit: 13 }], document: [{ rows: "leg", q: "", limit: 14 }] } },
    { rows, session: { state: null } });
  const written = run.rec.wrote;
  /* The requirement's own sentence reads these two the other way about; agent-harness R18 and the member's suite from which
     this moved say a level with nothing in scope (documents 0) gets no absence written, and one with documents in scope does. */
  t("R40: a level whose reads state 0 and 2 has documents 2: an absence is written for it", written.includes(`level-empty-${REPORTING_LEVEL.meaning}`), true);
  t("R40: one whose reads all state 0 has documents 0: none is written for it (agent-harness R18)", written.includes(`level-empty-${REPORTING_LEVEL.content}`), false);
  t("R40: a level whose reads state no documents is left out of the scope, and gets none (the table fails closed)", [written.includes(`level-empty-${REPORTING_LEVEL.document}`), written.includes(`level-empty-${REPORTING_LEVEL.internet}`)], [false, false]);
  const scopeTick = [...run.rec.ticks].reverse().find((tk) => tk.state && tk.state.scope);
  t("R40: the published scope holds {reads, documents} per level, reads counting the answered reads, documents the greatest stated",
    [scopeTick?.state.scope.meaning, scopeTick?.state.scope.content, "document" in (scopeTick?.state.scope ?? {}) ? scopeTick.state.scope.document : "absent"],
    [{ reads: 2, documents: 2 }, { reads: 1, documents: 0 }, { reads: 1 }]);
  const supplied = await stub({ session: { state: SCOPED } }, CHECK(ABSENT_ALL()));
  t("R40: reports a caller supplies carry no reads: those levels get a scope only from the run's published state", supplied.rec.wrote.length, LEVELS.length);
  const noState = await stub({ session: { state: null } }, CHECK(ABSENT_ALL()));
  t("R40 (control): with no published state and no reads, no level-empty candidate is written", noState.rec.wrote, []);
}
function ABSENT_ALL() { return LEVELS.map((l, i) => ({ level: l, state: "LOOKED_ABSENT", observed_at: `log:${i + 1}` })); }

section("R41 · it never writes runtime-ceiling-reached or any ending itself");
{
  let n = 0;
  const tight = await stub({ tick: () => (++n === 3 ? { ended: { bound: "runtime", condition: "runtime-ceiling-reached" } } : {}) }, CHECK());
  t("R41: the member spends runtime on its ticks; when the plane writes the ending at its own exit the segment stops, names it the plane's, and sends no ending of its own (no close, no entry or condition of an ending)",
    [tight.out.ended?.bound, tight.out.ended?.by, tight.rec.closed, tight.rec.ticks.flatMap((tk) => tk.log || []).filter((e) => e.condition === "runtime-ceiling-reached" || e.terminal === true).length, tight.rec.ticks.some((tk) => (tk.consume?.runtime ?? 0) > 0)],
    ["runtime", "the plane's own exit", null, 0, true]);
  const plain = await stub({}, CHECK());
  t("R41 (control): a run that completes sends no ending entry either", [plain.rec.ticks.flatMap((tk) => tk.log || []).filter((e) => e.condition === "runtime-ceiling-reached" || e.terminal === true).length, plain.rec.closed], [0, "completed"]);
}

section("R42 · no judgement sets the mode, the step, the pass count or limit, the budget, a bound, the run, the namespace or the target");
{
  const offending = { mode: "plan", step: "close", pass: 9, maxPasses: 9, budget: {}, bound: "wallclock", run: "RUN-X", store: "bio", target: "INQ-X" };
  const results = [];
  for (const [key, value] of Object.entries(offending)) {
    const r = await stub({}, [{ [key]: value }]);
    results.push([key, r.status, r.out.code, r.out.fields]);
  }
  t("R42: a judgement naming any of them is refused JUDGEMENT_OVERREACH (400) naming the field, before the row works",
    results, Object.keys(offending).map((k) => [k, 400, "JUDGEMENT_OVERREACH", [k]]));
  t("R42: the refusable keys are the table's own list (the module adds none)", NOT_JUDGEABLE.slice().sort(), Object.keys(offending).slice().sort().concat([]).filter((k) => NOT_JUDGEABLE.includes(k)).sort());
  const refused = await stub({}, [{ step: "close" }]);
  t("R42: the refused run did nothing at the plane beyond reading it (no spawn, no write, no close)", [refused.rec.closed, refused.rec.calls.filter((c) => ["airunspawn", "suggest", "airunclose"].includes(c.op)).length], [null, 0]);
  const ok = await stub({}, [{ targets: [{ level: "meaning", target: "INFO-1" }] }, { reports: [] }, { candidates: [] }, {}]);
  t("R42 (control): a judgeable key (targets) is applied", [ok.status, ok.out.ok], [200, true]);
  void CONTROL_FLOW; void ACCOUNT;
}

console.log(`\nsubsessions: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
