/* R085 (S4 N1, N4; K3557) — R107 a segment refused at dispatch does not lapse silently; R108 dedup logs every candidate it
 * drops, whatever its level.
 *
 * A check run is driven in this process over a recording plane that keeps the run's published state and log as the real
 * plane does (the last tick's `state`, every appended entry), and a model that answers as the Messages API does. The
 * first segment is stopped on its own bound (`max_steps`) after `dedup`, so the state it publishes holds a composed
 * candidate queue; the plane then publishes another pack and the second segment is refused SKILL_VERSION_MISMATCH.
 * Every arm that admits has its refusing counterpart beside it. */
import "../../bio-plane/test/sandbox.mjs";
import worker from "./shell.mjs";
import { ACCOUNT } from "./account.mjs";

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass += 1; else fail += 1;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `\n        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`}`);
};

const AIK = "aik-" + "e".repeat(64);
const mkPack = (tag) => ({ id: "investigative-session", edition: tag, version: `investigative-session@${tag}+0000000000000000`,
                           resident: { objective: { text: "find what the record holds" }, disclosable: [] }, disclosed: {} });
const OLD = mkPack("old"), NEW = mkPack("new");
const WIDE = [{ bound: "fetches", allowed: 50 }, { bound: "subsessions", allowed: 50 },
              { bound: "wallclock", allowed: 5000000 }, { bound: "runtime", allowed: 5000 }];

/* The plane: it keeps what the real one keeps of a run, its published `state` and its log. */
function planeStub(rec) {
  const ok = (result) => Response.json({ ok: true, result, store: "scratch", tokenClass: "ai", version: "r107" });
  return { fetch: async (url, init) => {
    const u = new URL(url);
    const op = u.searchParams.get("op") || "";
    const body = init && typeof init.body === "string" ? JSON.parse(init.body) : null;
    rec.calls.push({ op, body, query: Object.fromEntries(u.searchParams.entries()) });
    switch (op) {
      case "whoami": return ok({ tokenClass: "ai", session: false, member: null });
      case "airun": return ok({ run: u.searchParams.get("run"), found: true, session: {
        id: u.searchParams.get("run"), mode: "check", status: rec.closed ? "stopped" : "running",
        context: { type: "inquiry", id: "INQ-107" }, max_passes: 1,
        principal: { plane: "member:ruth", claude: ACCOUNT.member, ref: rec.payer ?? ACCOUNT.member, skill: OLD.version },
        state: rec.state, budget: WIDE.map((b) => ({ ...b, consumed: 0, unit: null })) } });
      case "airunlog": return ok({ run: u.searchParams.get("run"), found: true, entries: rec.log, limit: 200, truncated: false });
      case "agentpack": return Response.json({ ok: true, fences: [], pack: rec.pack, store: "scratch", tokenClass: "ai" });
      case "airunspawn": return ok({ found: true, half: "search", payload: { run: u.searchParams.get("run"),
        context: { type: "inquiry", id: "INQ-107" }, mode: "check", skill: OLD.version, standard_pair: null,
        subjects: { items: [] } } });
      case "meaningrows": return ok({ ok: true, arm: "leg", rows: [], scope: { documents: 3, documents_with_rows: 0, documents_without_rows: 3 }, count: 0 });
      case "basisversions": return ok({ id: u.searchParams.get("id"), limit: 50, truncated: false,
                                        versions: (rec.held || []).map((name) => ({ name })) });
      case "suggest": {
        if ((rec.suggestRefuses || []).includes(body.name))
          return ok({ ok: false, wrote: false, code: "SUGGEST_REFUSED_FOR_TEST", check: "C-27.1" });
        rec.wrote.push(body.name);
        return ok({ wrote: true });
      }
      case "airuntick": {
        if (body.state) rec.state = body.state;
        for (const e of body.log || []) rec.log.push(e);
        return ok({ run: body.run, found: true, ticked: true, status: "running", appended: (body.log || []).length, refused: [] });
      }
      case "airunclose": rec.closed = body?.bound ?? "?"; return ok({ terminated: true, bound: body?.bound ?? null });
      default: return Response.json({ ok: false, error: "unknown op: " + op }, { status: 400 });
    }
  } };
}

/* The model: every sub-session reports its level empty; `compose` may add candidates of its own. */
function modelAnswer(extra) {
  return (body) => {
    const names = (body.tools || []).map((x) => x.name);
    const last = body.messages[body.messages.length - 1];
    const answered = Array.isArray(last?.content)
      && last.content.some((b) => b.type === "tool_result" && !String(b.tool_use_id).startsWith("facts_"));
    if (names.includes("report") && !answered)
      return [{ type: "tool_use", id: "q", name: "meaningrows", input: { rows: "leg", q: "", limit: 7 } }];
    if (names.includes("report"))
      return [{ type: "tool_use", id: "r", name: "report", input: { state: "LOOKED_ABSENT", summary: "nothing here" } }];
    const prompt = [...body.messages].reverse().map((m) => (m.role !== "user" ? "" : typeof m.content === "string"
      ? m.content : (Array.isArray(m.content) ? m.content.filter((c) => c.type === "text").map((c) => c.text).join("") : "")))
      .find((c) => /judge_/.test(c)) || "";
    const step = (/Answer by calling judge_([a-z]+)/.exec(prompt) || [])[1] || "";
    return [{ type: "tool_use", id: "j", name: `judge_${step}`, input: step === "compose" && extra ? { candidates: extra } : {} }];
  };
}

const newRec = (over = {}) => ({ calls: [], log: [], state: null, wrote: [], closed: null, pack: OLD, held: [], ...over });

async function segment(rec, { maxSteps, extra, runId = "RUN-r107" } = {}) {
  const answer = modelAnswer(extra);
  const saved = globalThis.fetch;
  globalThis.fetch = async (url, init) => Response.json({ id: "msg", type: "message", role: "assistant",
    content: answer(JSON.parse(init.body)), stop_reason: "tool_use", usage: { input_tokens: 1, output_tokens: 1 } });
  try {
    const res = await worker.fetch(new Request("http://agent-worker/run", { method: "POST", body: JSON.stringify({
      run_id: runId, store: "scratch", credential: AIK, account: ACCOUNT, ...(maxSteps ? { max_steps: maxSteps } : {}) }) }),
      { VERSION: "r107", PLANE: planeStub(rec) });
    return { status: res.status, out: await res.json() };
  } finally { globalThis.fetch = saved; }
}
const ops = (rec, op) => rec.calls.filter((c) => c.op === op);

/* The first segment, stopped on its own bound after `dedup`: its last tick published `submit` with the queue. */
async function firstSegment(extra) {
  for (let n = 3; n <= 12; n += 1) {
    const rec = newRec();
    await segment(rec, { maxSteps: n, extra });
    if (rec.state?.step === "submit" && rec.state.queue?.length) return { rec, steps: n };
  }
  return { rec: null, steps: 0 };
}

console.log("\n--- R34 · a segment refused at dispatch does not lapse silently ---");
const first = await firstSegment();
t("ARMED: segment 1 ends on its own bound with the composed candidates queued and unwritten",
  [first.rec?.state?.step, first.rec?.state?.queue?.length, first.rec?.wrote.length, first.rec?.closed],
  ["submit", 4, 0, null]);
const queued = (first.rec?.state?.queue ?? []).map((c) => c.name);
const rec = first.rec;
const callsBefore = rec.calls.length;
rec.pack = NEW; /* the plane publishes another pack between the two segments */
const two = await segment(rec);
const after = rec.calls.slice(callsBefore);
t("the refusal is answered as it was: 409 SKILL_VERSION_MISMATCH carrying both versions, no model turn",
  [two.status, two.out.code, two.out.recorded, two.out.rendered], [409, "SKILL_VERSION_MISMATCH", OLD.version, NEW.version]);
t("R34: every composed candidate not yet written is written through op=suggest, in the queue's order",
  [after.filter((c) => c.op === "suggest").map((c) => c.body.name), rec.wrote], [queued, queued]);
t("R34: each carries the run and the run's target",
  after.filter((c) => c.op === "suggest").map((c) => [c.body.run, c.body.target]),
  queued.map(() => ["RUN-r107", "INQ-107"]));
const refusedEntry = rec.log.find((e) => e.subject === "dispatch -> refused");
t("R34: one log entry names the refusal, and says what was written",
  [!!refusedEntry, /SKILL_VERSION_MISMATCH/.test(refusedEntry?.detail ?? ""), /4 composed candidate\(s\) were written/.test(refusedEntry?.detail ?? "")],
  [true, true, true]);
t("R34: the entry is in the record's own words (a look not made is LOOKED_INDETERMINATE, no condition)",
  [refusedEntry?.state, refusedEntry?.condition], ["LOOKED_INDETERMINATE", null]);
t("R34: the run is closed, and not as `completed` (the bound `lease` stops it: status `stopped`)",
  [rec.closed, rec.closed === "completed"], ["lease", false]);
t("R34: the answer says so", [two.out.lapse?.written, two.out.lapse?.closed], [queued, true]);
t("R34: the order is write, log, close",
  after.map((c) => c.op).filter((o) => ["suggest", "airuntick", "airunclose"].includes(o)),
  [...queued.map(() => "suggest"), "airuntick", "airunclose"]);
t("R34: no model turn was taken", (two.out.turns_run ?? 0), 0);

console.log("\n--- R34 · what the plane does not accept is named, not retried ---");
{
  const f = await firstSegment();
  f.rec.suggestRefuses = [queued[0]];
  f.rec.pack = NEW;
  const r = await segment(f.rec);
  t("a candidate the plane refuses is not written and not resent; the others are", [f.rec.wrote, ops(f.rec, "suggest").filter((c) => c.body.name === queued[0]).length],
    [queued.slice(1), 1]);
  t("the entry and the answer name the refusal's code",
    [/SUGGEST_REFUSED_FOR_TEST/.test(f.rec.log.find((e) => e.subject === "dispatch -> refused")?.detail ?? ""),
     r.out.lapse?.not_accepted], [true, [{ name: queued[0], code: "SUGGEST_REFUSED_FOR_TEST" }]]);
  t("the run is still closed", f.rec.closed, "lease");
}

console.log("\n--- R34 (controls) ---");
{
  const same = await firstSegment();
  const mark = same.rec.calls.length;
  const r = await segment(same.rec); /* the pack is unchanged: the second segment is not refused */
  t("control: the pack unchanged, segment 2 is not refused and no dispatch entry is logged",
    [r.status, same.rec.log.some((e) => e.subject === "dispatch -> refused"), same.rec.calls.slice(mark).some((c) => c.op === "airunclose" && c.body.bound === "lease")],
    [200, false, false]);

  const fresh = newRec({ pack: NEW });
  const fr = await segment(fresh);
  t("control: a run that has done nothing is refused as before: nothing written, nothing logged, nothing closed (it lapses nothing)",
    [fr.status, fr.out.code, fresh.wrote.length, fresh.log.length, fresh.closed, fr.out.lapse ?? null], [409, "SKILL_VERSION_MISMATCH", 0, 0, null, null]);

  const other = await firstSegment();
  other.rec.pack = NEW; other.rec.payer = "member:somebody-else";
  const o = await segment(other.rec);
  t("control: a run recorded for another payer is refused RUN_NAMES_A_DIFFERENT_PAYER first: nothing written, logged or closed",
    [o.status, o.out.code, other.rec.wrote.length, other.rec.log.some((e) => e.subject === "dispatch -> refused"), other.rec.closed],
    [409, "RUN_NAMES_A_DIFFERENT_PAYER", 0, false, null]);
}

console.log("\n--- R35 · dedup logs every candidate it drops, whatever its level ---");
{
  const NOLEVEL = [{ name: "no-level-candidate", description: "a candidate that states no level", kind: "basis-version" }];
  const droppedEntries = (r) => r.log.filter((e) => e.subject === "dedup -> candidate dropped");
  const r = newRec({ held: ["no-level-candidate", "level-empty-documents"] });
  const run = await segment(r, { extra: NOLEVEL });
  t("ARMED: the run reached its end over the model", [run.status, run.out.ok], [200, true]);
  const entries = droppedEntries(r);
  const named = entries.filter((e) => e.detail.includes("'no-level-candidate'"));
  t("R35: the candidate with no level, dropped by name, is logged", named.length, 1);
  t("R35: its entry says it states no level and names the held version it matched",
    [/stating no level/.test(named[0]?.detail ?? ""), /matching the held version of that name/.test(named[0]?.detail ?? ""),
     named[0]?.state, named[0]?.governed], [true, true, "LOOKED_INDETERMINATE", false]);
  t("R35: the candidate with a level is still logged at its own level, as R101 words it",
    entries.filter((e) => e.detail.includes("'level-empty-documents'")).map((e) => [e.level, /already held on the question/.test(e.detail)]),
    [["document", true]]);
  t("R35: neither is written", r.wrote.includes("no-level-candidate") || r.wrote.includes("level-empty-documents"), false);

  const none = newRec({ held: [] });
  await segment(none, { extra: NOLEVEL });
  t("R35 (control): a name the record does not hold is not dropped, not logged, and is written",
    [droppedEntries(none).length, none.wrote.includes("no-level-candidate")], [0, true]);
}

console.log(`\nr107: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
