/* R085-22 (K3510) — R101 a candidate `dedup` drops is logged, R102 a cited record id ends at `¶` as well.
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
const PACK_VERSION = "investigative-session@r101+0000000000000000";
const PACK = { id: "investigative-session", edition: "r101", version: PACK_VERSION,
               resident: { objective: { text: "find what the record holds" }, disclosable: [] }, disclosed: {} };
const WIDE = [{ bound: "fetches", allowed: 50 }, { bound: "subsessions", allowed: 50 },
              { bound: "wallclock", allowed: 5000000 }, { bound: "runtime", allowed: 5000 }];
const READ_LIMIT = 7; /* the limit every sub-session read asks for, to tell them from the parent's own reads */

function planeStub(rec) {
  const ok = (result) => Response.json({ ok: true, result, store: "scratch", tokenClass: "ai", version: "r101" });
  return { fetch: async (url, init) => {
    const u = new URL(url);
    const op = u.searchParams.get("op") || "";
    const body = init && typeof init.body === "string" ? JSON.parse(init.body) : null;
    rec.calls.push({ op, body, query: Object.fromEntries(u.searchParams.entries()) });
    switch (op) {
      case "whoami": return ok({ tokenClass: "ai", session: false, member: null });
      case "airun": return ok({ run: u.searchParams.get("run"), found: true, session: {
        id: u.searchParams.get("run"), mode: "check", status: "running", context: { type: "inquiry", id: "INQ-096" },
        max_passes: 1, principal: { plane: "member:ruth", claude: ACCOUNT.member, ref: ACCOUNT.member, skill: PACK_VERSION },
        state: null, budget: WIDE.map((b) => ({ ...b, consumed: 0, unit: null })) } });
      case "airunlog": return ok({ run: u.searchParams.get("run"), found: true, entries: [], limit: 200, truncated: false });
      case "agentpack": return Response.json({ ok: true, fences: [], pack: PACK, store: "scratch", tokenClass: "ai" });
      case "airunspawn": return ok({ found: true, half: "search", payload: { run: u.searchParams.get("run"),
        context: { type: "inquiry", id: "INQ-096" }, mode: "check", skill: PACK_VERSION, standard_pair: null,
        subjects: { items: [{ id: "INQ-LEG-1", extent: "¶1", kind: "leg" }] } } });
      case "meaningrows": return ok({ ok: true, arm: "leg", rows: [], scope: { documents: 3, documents_with_rows: 0, documents_without_rows: 3 }, count: 0 });
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
      case "suggest": return ok({ wrote: true });
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

async function run(held, cites = false) {
  const rec = { calls: [], requests: [], held };
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
      run_id: "RUN-r101", store: "scratch", credential: AIK, account: ACCOUNT }) }),
      { VERSION: "r101", PLANE: planeStub(rec) });
    return { status: res.status, out: await res.json(), rec };
  } finally { globalThis.fetch = saved; }
}
const logged = (rec) => rec.calls.filter((c) => c.op === "airuntick").flatMap((c) => c.body.log || []);
const droppedEntries = (rec) => logged(rec).filter((e) => e.subject === "dedup -> candidate dropped");

console.log("\n--- R29 · a candidate dedup drops is logged ---");
const dropped = await run(["level-empty-documents"]);
t("ARMED: the check run completed over the model", [dropped.status, dropped.out.ok, dropped.out.judgement_source], [200, true, "model"]);
const entries = droppedEntries(dropped.rec);
t("R29: one entry, at the dropped candidate's level, LOOKED_INDETERMINATE", entries.map((e) => [e.level, e.state, e.governed, e.condition]),
  [["document", "LOOKED_INDETERMINATE", false, null]]);
t("R29: its detail names the dropped name and says it is already held on the question",
  [entries[0]?.detail.includes("'level-empty-documents'"), /already held on the question/.test(entries[0]?.detail ?? "")], [true, true]);
t("R29: it rides the dedup step's tick, and the plane appended it (counted in `logged`)",
  [dropped.rec.calls.some((c) => c.op === "airuntick" && (c.body.log || []).some((e) => e.subject === "dedup -> candidate dropped")),
   dropped.out.logged >= logged(dropped.rec).length, dropped.out.log_refused], [true, true, []]);
t("R29: the candidates not held still go on to the plane, the dropped one does not",
  dropped.rec.calls.filter((c) => c.op === "suggest").map((c) => c.body.name).sort(),
  ["level-empty-content", "level-empty-internet", "level-empty-meaning"]);
const twoHeld = await run(["level-empty-documents", "level-empty-meaning"]);
t("R29: one entry per level when several are dropped, each naming its own",
  droppedEntries(twoHeld.rec).map((e) => [e.level, e.detail.includes(e.level === "document" ? "level-empty-documents" : "level-empty-meaning")]),
  [["meaning", true], ["document", true]]);
const none = await run([]);
t("R29 (control): no drop, no entry", [droppedEntries(none.rec).length, none.rec.calls.filter((c) => c.op === "suggest").length], [0, 4]);
const elsewhere = await run(["unrelated-name"]);
t("R29 (control): a held name that no candidate bears drops nothing and logs nothing", droppedEntries(elsewhere.rec).length, 0);

console.log("\n--- R30 · a cited record id also ends at the first ¶ ---");
const cited = await run([], true);
const searches = cited.rec.calls.filter((c) => c.op === "search").map((c) => c.query.q);
t("R30: `<id>¶1`, `<id> ¶1` and `<id>#p1` are each looked up by the record id alone",
  [searches.includes('id:"INFO-1"'), searches.includes('id:"INFO-1¶1"'), searches.includes('id:"INFO-1 ¶1"'), searches.includes('id:"INFO-1#p1"')],
  [true, false, false, false]);
t("R30: each resolves to the record, so the document is counted held once", [cited.out.holdings.documents, cited.out.holdings.by_document?.[0]?.record_id], [1, "INFO-1"]);
t("R30: the re-read of the record is by its id for each of the three forms",
  cited.rec.calls.filter((c) => c.op === "meaningrows" && Number(c.query.limit) === 1 && JSON.stringify(c.body) === JSON.stringify({ ids: ["INFO-1"] })).length, 3);
t("R30 (control): an address naming no held record is read as the address it is, `¶` and all",
  [searches.includes('id:"nothing-held"'), searches.includes('id:"nothing-held¶x"')], [true, true]);

console.log(`\nr101: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
