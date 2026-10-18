/* R085-30 (K3528) — R103 a meaning read asks for the longest snippet, R104 an absence the read contradicts is not
 * written, R105 a write is logged and a later drop names it. Built on r103.test.mjs's recording plane and Messages-API model.
 *
 * (R101's header, for the instrument:)
 *
 * One check run is driven in this process over a recording plane and a model that answers as the Messages API does:
 * every sub-session reports its level empty (so the table forms one `level-empty` candidate per level), and the record's
 * versions either hold `level-empty-documents` (the drop) or hold nothing (the control). A second run has the
 * sub-sessions cite one record in each of R102's forms. Every arm that admits has its refusing counterpart beside it. */
import "../../bio-plane/test/sandbox.mjs";
import worker from "./shell.mjs";
import { ACCOUNT } from "./account.mjs";
import { MEANING } from "../../bio-plane/src/query.mjs";
import { MODEL_FOR_MODE, SUBSESSION_MODEL } from "../../agent-model/src/model.mjs";
import { LEVELS } from "../../agent-harness/src/harness.mjs";

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass += 1; else fail += 1;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `\n        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`}`);
};

const AIK = "aik-" + "d".repeat(64);
const PACK_VERSION = "investigative-session@r103+0000000000000000";
const PACK = { id: "investigative-session", edition: "r103", version: PACK_VERSION,
               resident: { objective: { text: "find what the record holds" }, disclosable: [] }, disclosed: {} };
const WIDE = [{ bound: "fetches", allowed: 50 }, { bound: "subsessions", allowed: 50 },
              { bound: "wallclock", allowed: 5000000 }, { bound: "runtime", allowed: 5000 }];
const READ_LIMIT = 7; /* the limit every sub-session read asks for, to tell them from the parent's own reads */

function planeStub(rec) {
  const ok = (result) => Response.json({ ok: true, result, store: "scratch", tokenClass: "ai", version: "r103" });
  return { fetch: async (url, init) => {
    const u = new URL(url);
    const op = u.searchParams.get("op") || "";
    const body = init && typeof init.body === "string" ? JSON.parse(init.body) : null;
    rec.calls.push({ op, body, query: Object.fromEntries(u.searchParams.entries()) });
    switch (op) {
      case "whoami": return ok({ tokenClass: "ai", session: false, member: null });
      case "airun": return ok({ run: u.searchParams.get("run"), found: true, session: {
        id: u.searchParams.get("run"), mode: "check", status: "running", context: { type: "inquiry", id: "INQ-096" },
        max_passes: rec.passes || 1, principal: { plane: "member:ruth", claude: ACCOUNT.member, ref: ACCOUNT.member, skill: PACK_VERSION },
        state: null, budget: WIDE.map((b) => ({ ...b, consumed: 0, unit: null })) } });
      case "airunlog": return ok({ run: u.searchParams.get("run"), found: true, entries: [], limit: 200, truncated: false });
      case "agentpack": return Response.json({ ok: true, fences: [], pack: PACK, store: "scratch", tokenClass: "ai" });
      case "airunspawn": return ok({ found: true, half: "search", payload: { run: u.searchParams.get("run"),
        context: { type: "inquiry", id: "INQ-096" }, mode: "check", skill: PACK_VERSION, standard_pair: null,
        subjects: { items: [{ id: "INQ-LEG-1", extent: "¶1", kind: "leg" }] } } });
      case "meaningrows": {
        /* the parent's compose read asks for 50 rows; the sub-sessions' and the re-reads' ask for fewer */
        const parent = Number(u.searchParams.get("limit")) === 50;
        if (parent && rec.rows === "refuse")
          return ok({ ok: false, reason: "MEANING_ROWS_UNKNOWN_ARM", check: "C-23.2", translation: "no", detail: "x" });
        const rows = parent && rec.rows === "target" ? [{ bundle_id: "INQ-096", ord: 1, target_id: "INFO-1" }]
          : parent && rec.rows === "other" ? [{ bundle_id: "INQ-OTHER", ord: 1, target_id: "INFO-1" }] : [];
        return ok({ ok: true, arm: "leg", rows, scope: { documents: 3, documents_with_rows: 0, documents_without_rows: 3 }, count: rows.length });
      }
      case "basisversions": return ok({ id: u.searchParams.get("id"), versions: (rec.held || []).map((name) => ({ name })), limit: 50, truncated: false });
      case "search": {
        const held = /^id:"INFO-1"$/.test(u.searchParams.get("q") || "");
        return ok({ hits: held ? [{ bundle_id: "INFO-1", source_locator: "upload:abc" }] : [] });
      }
      case "versionchain": {
        const held = u.searchParams.get("address") === "upload:abc";
        return ok({ address_norm: held ? "upload:abc" : null, total: held ? 1 : 0, truncated: false,
                    versions: held ? [{ bundle_id: "INFO-1", capture_sha: "s".repeat(8) }] : [] });
      }
      case "suggest": (rec.held ||= []).push(body.name); return ok({ wrote: true });
      case "airuntick": return ok({ run: body.run, found: true, ticked: true, status: "running",
                                    appended: (body.log || []).length, refused: [] });
      case "airunclose": return ok({ terminated: true, bound: body?.bound ?? null });
      default: return Response.json({ ok: false, error: "unknown op: " + op }, { status: 400 });
    }
  } };
}

const CITES = ["INFO-1 ¶1", "INFO-1¶1", "INFO-1#p1", "nothing-held¶x"];
function modelAnswer(rec, cites) {
  let sub = 0;
  return (body) => {
    const names = (body.tools || []).map((x) => x.name);
    const last = body.messages[body.messages.length - 1];
    const answered = Array.isArray(last?.content)
      && last.content.some((b) => b.type === "tool_result" && !String(b.tool_use_id).startsWith("facts_"));
    if (names.includes("report") && !answered)
      return [{ type: "tool_use", id: "q", name: "meaningrows", input: { rows: "leg", q: "", limit: 7 } }];
    if (names.includes("report")) {
      sub += 1;
      const address = cites ? CITES[sub - 1] : null;
      return [{ type: "tool_use", id: "r", name: "report", input: address
        ? { state: "PRESENT", summary: "found it", citations: [{ address }] }
        : { state: "LOOKED_ABSENT", summary: "nothing here" } }];
    }
    const prompt = [...body.messages].reverse().map((m) => (m.role !== "user" ? "" : typeof m.content === "string"
      ? m.content : (Array.isArray(m.content) ? m.content.filter((c) => c.type === "text").map((c) => c.text).join("") : "")))
      .find((c) => /judge_/.test(c)) || "";
    const step = (/Answer by calling judge_([a-z]+)/.exec(prompt) || [])[1] || "";
    return [{ type: "tool_use", id: "j", name: `judge_${step}`, input: {} }];
  };
}

async function run(held, cites = false, opts = {}) {
  const rec = { calls: [], requests: [], held: [...held], rows: opts.rows || "none", passes: opts.passes || 1 };
  const answer = modelAnswer(rec, cites);
  const saved = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const sent = JSON.parse(init.body);
    rec.requests.push(sent);
    return Response.json({ id: "msg", type: "message", role: "assistant", content: answer(sent), stop_reason: "tool_use",
      usage: { input_tokens: 1, output_tokens: 1 } });
  };
  try {
    const res = await worker.fetch(new Request("http://agent-worker/run", { method: "POST", body: JSON.stringify({
      run_id: "RUN-r103", store: "scratch", credential: AIK, account: ACCOUNT }) }),
      { VERSION: "r103", PLANE: planeStub(rec) });
    return { status: res.status, out: await res.json(), rec };
  } finally { globalThis.fetch = saved; }
}
const logged = (rec) => rec.calls.filter((c) => c.op === "airuntick").flatMap((c) => c.body.log || []);

const suggested = (rec) => rec.calls.filter((c) => c.op === "suggest").map((c) => c.body.name).sort();
const ALL4 = ["level-empty-content", "level-empty-documents", "level-empty-internet", "level-empty-meaning"];

console.log("\n--- R31 · a meaning read asks for the longest snippet, and nothing else of the call changes ---");
const base = await run([]);
t("ARMED: the check run completed over the model", [base.status, base.out.ok, base.out.judgement_source], [200, true, "model"]);
const reads = base.rec.calls.filter((c) => c.op === "meaningrows");
t("R31: every meaning read this run makes (the parent's, the sub-sessions', the re-reads') carries snippet=64",
  [reads.length > 4, reads.every((c) => c.query.snippet === "64")], [true, true]);
t("R31: a sub-session's read still carries the rows, q and limit it was given, and no other parameter changes",
  reads.filter((c) => Number(c.query.limit) === READ_LIMIT).map((c) => [c.query.rows, c.query.q, c.query.limit,
    Object.keys(c.query).filter((k) => !["op", "store", "rows", "q", "limit", "snippet"].includes(k)).length]),
  [["leg", null, "7", 0], ["leg", null, "7", 0], ["leg", null, "7", 0], ["leg", null, "7", 0]]);
t("R31: the parent's compose read still asks rows=leg, limit=50",
  reads.filter((c) => Number(c.query.limit) === 50).map((c) => [c.query.rows, c.query.limit]), [["leg", "50"]]);

console.log("\n--- R32 · an absence is kept only when the compose-time read confirms it ---");
t("R32 (control): a read holding no row keeps every absence", suggested(base.rec), ALL4);
const contradicted = await run([], false, { rows: "target" });
t("R32: a read holding a row for the target composes no meaning candidate; the other levels' are kept",
  suggested(contradicted.rec), ["level-empty-content", "level-empty-documents", "level-empty-internet"]);
const dropEntries = (rec) => logged(rec).filter((e) => e.subject === "compose -> level-empty candidate dropped");
t("R32: the tick logs it, at the meaning level, saying the report is contradicted by the read",
  dropEntries(contradicted.rec).map((e) => [e.level, e.state, /contradicted by the read/.test(e.detail), e.detail.includes("level-empty-meaning")]),
  [["meaning", "LOOKED_INDETERMINATE", true, true]]);
t("R32 (control): a row for another question does not contradict", [suggested((await run([], false, { rows: "other" })).rec).length], [4]);
const unread = await run([], false, { rows: "refuse" });
t("R32: a read the plane refused cannot confirm, so the meaning candidate is not composed, and the log says so",
  [suggested(unread.rec).includes("level-empty-meaning"), dropEntries(unread.rec).map((e) => /no rows to confirm/.test(e.detail))], [false, [true]]);
t("R32 (control): no entry when nothing is dropped", dropEntries(base.rec).length, 0);

console.log("\n--- R33 · a write is logged, and a later drop names it ---");
const written = (rec) => logged(rec).filter((e) => e.subject === "submit -> candidate written");
t("R33: pass 1 logs each write with its name, its level and its pass",
  written(base.rec).map((e) => [e.level, e.state, e.detail]).sort(),
  [["content", "LOOKED_INDETERMINATE", "wrote 'level-empty-content' at level content in pass 1"],
   ["document", "LOOKED_INDETERMINATE", "wrote 'level-empty-documents' at level document in pass 1"],
   ["internet", "LOOKED_INDETERMINATE", "wrote 'level-empty-internet' at level internet in pass 1"],
   ["meaning", "LOOKED_INDETERMINATE", "wrote 'level-empty-meaning' at level meaning in pass 1"]]);
const twice = await run([], false, { passes: 2 });
const drops = (rec) => logged(rec).filter((e) => e.subject === "dedup -> candidate dropped");
t("R33: pass 2's drop names the write of pass 1 as this run's",
  [twice.out.passes, drops(twice.rec).length, drops(twice.rec).every((e) => /'level-empty-[a-z]+' \(written by this run in pass 1\)/.test(e.detail))],
  [2, 4, true]);
const heldBefore = await run(["level-empty-documents"]);
t("R33 (control): a held version this run did not write is worded as held on the question, with no claim it is this run's",
  drops(heldBefore.rec).map((e) => [/already held on the question/.test(e.detail), /written by this run/.test(e.detail)]), [[true, false]]);
t("R33: a candidate never composed (R104) is not logged as written",
  written((await run([], false, { rows: "target" })).rec).length, 3);

console.log(`\nr103: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
