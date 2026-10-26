/* agent-worker — T49 (T49-37; N1137; K3402, K3407): R90, AT THE MEMBER'S INTERFACE. `collect`'s holdings carry, for each
 * held document, the record id a leg's `target` takes beside its `address_norm`, and `compose`'s facts pass it on, so a
 * model can name the leg an accepted reading rests on (`conclude` is no longer refused NO_BASIS, C-33.40).
 *
 * The default export `fetch(request, env)` is driven in this process with a recording plane binding that answers
 * `search` and `versionchain` as the plane does (`provenance` R17: one entry per capture, `bundle_id` and `capture_sha`
 * each), and the global `fetch` replaced by a scripted model API, so the facts compose is handed are read off the
 * request the model sees, not off a stub's opinion. Every arm that admits has its refusing counterpart beside it (K874). */
import worker from "./shell.mjs";
import { withRecordIds } from "../src/holdings.mjs";
import { documentHoldings } from "../../agent-harness/src/subsession.mjs";
import { MEMBER, withAccount } from "./account.mjs";
import { versionChainNoSuchVersion } from "../../bio-plane/test/m/provenance/fixtures.mjs";

const chainRefusal = await versionChainNoSuchVersion();

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const section = (s) => console.log(`\n--- ${s} ---`);

const AIK = "aik-" + "d".repeat(64);
const SHA = (c) => c.repeat(64);

/* ================================================================
 * PART A · THE HELPER, PURE: the id a leg names, read off the chains the plane answered
 * ================================================================ */
section("R20 A · withRecordIds, pure");
{
  const chain = { address_norm: "notice.example/n", total: 3, truncated: false, versions: [
    { bundle_id: "NB1", capture_sha: SHA("1") }, { bundle_id: "NB2", capture_sha: SHA("2") }, { bundle_id: "NB3", capture_sha: SHA("3") }] };
  const one = { address_norm: "other.example/o", total: 1, truncated: false, versions: [{ bundle_id: "OB1", capture_sha: SHA("4") }] };
  const resolved = [
    { citation: "NB2", bundle: "NB2", address: "https://notice.example/n", chain },
    { citation: "https://other.example/o", bundle: null, address: "https://other.example/o", chain: one },
    { citation: "LOOSE", bundle: "LOOSE", address: "https://loose.example/", chain: { address_norm: "loose.example/", total: 0, versions: [] } },
    { citation: "https://bare.example/", bundle: null, address: "https://bare.example/", chain: { address_norm: "bare.example/", total: 0, versions: [] } },
    { citation: "GONE", refused: { at: "versionchain", code: "SOME_CODE", check: "C-0.0" } },
  ];
  const before = documentHoldings(resolved);
  const frozen = JSON.stringify(before);
  const h = withRecordIds(before, resolved);
  const byAddr = Object.fromEntries(h.by_document.map((d) => [d.address_norm, d]));
  t("R20 A1: a document cited by a version carries THAT version's record id and capture",
    [byAddr["notice.example/n"].record_id, byAddr["notice.example/n"].capture_sha], ["NB2", SHA("2")]);
  t("R20 A2: a document cited by its address carries the newest version the plane listed",
    [byAddr["other.example/o"].record_id, byAddr["other.example/o"].capture_sha], ["OB1", SHA("4")]);
  t("R20 A3: the address_norm, the counts and the UNDETERMINED item are as documentHoldings made them",
    [h.documents, h.citations, h.unchained, h.undetermined, h.undetermined_items, h.by_document.map((d) => d.address_norm)],
    [2, 5, 2, 1, before.undetermined_items, ["notice.example/n", "other.example/o"]]);
  t("R20 A4: an item in no chain cited as a held bundle carries that bundle; one cited as a bare address has none, stated as null",
    h.unchained_items.map((u) => [u.citation, u.record_id]), [["LOOSE", "LOOSE"], ["https://bare.example/", null]]);
  t("R20 A5: CONTROL — a refused read is UNDETERMINED and is given no record id, in no document and no item",
    [h.by_document.some((d) => d.record_id === "GONE"), h.unchained_items.some((u) => u.citation === "GONE"),
     h.undetermined_items[0].citation], [false, false, "GONE"]);
  t("R20 A6: the input is not changed", JSON.stringify(before), frozen);
  t("R20 A7: CONTROL — a document whose chain answered no bundle id has a null id, never an invented one",
    withRecordIds(documentHoldings([{ citation: "https://n.example/", bundle: null, address: "https://n.example/",
      chain: { address_norm: "n.example/", total: 1, versions: [{ capture_sha: SHA("5") }] } }]),
      [{ citation: "https://n.example/", bundle: null, address: "https://n.example/",
         chain: { address_norm: "n.example/", total: 1, versions: [{ capture_sha: SHA("5") }] } }]).by_document[0].record_id, null);
}

/* ================================================================
 * PART B · THROUGH POST /run, and the facts compose is handed
 * ================================================================ */
const DOC = { bundle: "BND-NOTICE-1", sha: SHA("a"), address: "https://notice.example/agenda" };

function plane({ refuseChain = false } = {}) {
  const calls = [];
  const ok = (result) => Response.json({ ok: true, result, store: "scratch", tokenClass: "ai", version: "t49r90" });
  const handle = async (url, init) => {
    const u = new URL(url);
    const op = u.searchParams.get("op") || "";
    let body = null; try { body = JSON.parse(init?.body ?? "null"); } catch { body = null; }
    calls.push({ op, body });
    switch (op) {
      case "whoami": return ok({ tokenClass: "ai", session: false, member: null });
      case "airun": return ok({ run: "run-r90", found: true, session: { id: "run-r90", mode: "check", status: "running", plan: null,
        context: { type: "inquiry", id: "INQ-90" }, max_passes: 1,
        principal: { plane: "member:ruth", claude: MEMBER, ref: MEMBER, skill: "pack@t49r90" }, state: {},
        budget: [{ bound: "fetches", allowed: 50 }, { bound: "subsessions", allowed: 50 }, { bound: "wallclock", allowed: 500000 },
                 { bound: "runtime", allowed: 5000 }].map((b) => ({ ...b, consumed: 0, unit: null })) } });
      case "airunlog": return ok({ run: "run-r90", found: true, entries: [], limit: 200, truncated: false });
      case "airunspawn": return ok({ found: true, half: "search", payload: { run: "run-r90", context: { type: "inquiry", id: "INQ-90" },
        mode: "check", skill: "pack@t49r90", standard_pair: null } });
      case "agentpack": return Response.json({ ok: true, fences: [], pack: { id: "investigative-session", version: "pack@t49r90",
        resident: { objective: { text: "find what the record holds" }, disclosable: [] }, disclosed: {} }, store: "scratch", tokenClass: "ai" });
      case "meaningrows": return ok({ ok: true, arm: "leg", rows: [], scope: { documents: 3, documents_with_rows: 0, documents_without_rows: 3 }, count: 0 });
      case "basisversions": return ok({ id: "INQ-90", versions: [], limit: 50, truncated: false });
      case "search": return ok({ hits: [{ bundle_id: DOC.bundle, source_locator: DOC.address }] });
      case "versionchain":
        return refuseChain
          ? Response.json({ ...chainRefusal, code: chainRefusal.reason }, { status: 403 })
          : ok({ address_norm: "notice.example/agenda", total: 1, truncated: false,
                 versions: [{ capture_sha: DOC.sha, bundle_id: DOC.bundle, first_retrieved: "2026-10-01" }] });
      case "airuntick": return ok({ ticked: true, appended: (body?.log || []).length, refused: [], status: "running" });
      case "airunclose": return ok({ terminated: true, bound: body?.bound ?? null });
      case "suggest": return ok({ wrote: true, version: body?.name ?? null });
      // fixtures-contract: control-plane ask-wire (UNKNOWN_OP: an op with no spec is 400)
      default: return Response.json({ ok: false, error: "unknown op: " + op }, { status: 400 });
    }
  };
  return { binding: { fetch: handle }, calls };
}

/* The model API as it answers: a sub-session of the document level cites the held bundle; the others report an
   absence; the parent answers each judge tool with an empty judgement. Every request is kept. */
function scriptedModel(requests) {
  return async (url, init) => {
    const body = JSON.parse(init.body);
    requests.push(body);
    const names = (body.tools || []).map((x) => x.name);
    const text = JSON.stringify(body.messages);
    let content;
    if (names.includes("report")) {
      const last = body.messages[body.messages.length - 1];
      const answered = Array.isArray(last?.content)
        && last.content.some((b) => b.type === "tool_result" && !String(b.tool_use_id).startsWith("facts_"));
      if (!answered) content = [{ type: "tool_use", id: "q", name: "meaningrows", input: { rows: "leg", q: "", limit: 5 } }];
      else if (/Search the document level/.test(text))
        content = [{ type: "tool_use", id: "r", name: "report",
                     input: { state: "PRESENT", summary: "the notice names it", citations: [{ address: DOC.bundle }] } }];
      else content = [{ type: "tool_use", id: "r", name: "report", input: { state: "LOOKED_ABSENT", summary: "nothing" } }];
    } else {
      const prompt = [...body.messages].reverse().map((m) => (m.role !== "user" ? "" : typeof m.content === "string" ? m.content
        : (Array.isArray(m.content) ? m.content.filter((c) => c.type === "text").map((c) => c.text).join("") : ""))).find((s) => /judge_/.test(s)) || "";
      const step = (/Answer by calling judge_([a-z]+)/.exec(prompt) || [])[1] || "";
      content = [{ type: "tool_use", id: "j", name: `judge_${step}`, input: {} }];
    }
    return Response.json({ id: "msg", type: "message", role: "assistant", content, stop_reason: "tool_use",
                           usage: { input_tokens: 1, output_tokens: 1 } });
  };
}

async function drive(opts) {
  const p = plane(opts);
  const requests = [];
  const saved = globalThis.fetch;
  globalThis.fetch = scriptedModel(requests);
  try {
    const res = await worker.fetch(new Request("http://agent-worker/run", { method: "POST", body: JSON.stringify(withAccount({
      run_id: "run-r90", store: "scratch", credential: AIK,
      account: { kind: "apikey", level: "member", secret: "sk-ant-r90-fixture-never-echoed", member: MEMBER } })) }),
      { VERSION: "t49r90", PLANE: p.binding });
    return { status: res.status, out: await res.json(), calls: p.calls, requests };
  } finally { globalThis.fetch = saved; }
}

/* The facts a model is handed at `compose`: the `read_facts` result in the conversation that judged compose. */
function composeFacts(requests) {
  for (const r of requests) {
    const msgs = r.messages || [];
    const names = (r.tools || []).map((x) => x.name);
    if (!names.includes("judge_compose")) continue;
    for (const m of msgs) for (const b of Array.isArray(m.content) ? m.content : []) {
      if (b.type !== "tool_result" || !String(b.tool_use_id).startsWith("facts_")) continue;
      const txt = (b.content || []).map((c) => c.text).join("");
      try { const f = JSON.parse(txt); if (f && "holdings" in f) return f; } catch { /* not facts */ }
    }
  }
  return null;
}

section("R20 B · a held document, through /run: the answer's holdings and compose's facts");
{
  const { status, out, requests, calls } = await drive({});
  const doc = (out.holdings?.by_document || [])[0] || null;
  t("R20 B1: the run answers 200 and its holdings count the held notice once", [status, out.ok, out.holdings?.documents], [200, true, 1]);
  t("R20 B2: that document carries the record id and capture a leg's target and extent_capture take, beside its address",
    doc && [doc.address_norm, doc.record_id, doc.capture_sha], ["notice.example/agenda", DOC.bundle, DOC.sha]);
  const facts = composeFacts(requests);
  const fdoc = facts?.holdings?.by_document?.[0] || null;
  t("R20 B3: compose's facts, as the model is handed them, pass the record id on",
    fdoc && [fdoc.address_norm, fdoc.record_id, fdoc.capture_sha], ["notice.example/agenda", DOC.bundle, DOC.sha]);
  t("R20 B4: the id came from the plane's own chain (one search, one versionchain), never from the model",
    [calls.filter((c) => c.op === "search").length, calls.filter((c) => c.op === "versionchain").length], [1, 1]);
}

section("R20 C · CONTROL (R9): a document whose read is refused stays UNDETERMINED and gets no record id");
{
  const { status, out, requests } = await drive({ refuseChain: true });
  t("R20 C1: the run still answers, the document is UNDETERMINED and published, never a zero",
    [status, out.holdings?.documents, out.holdings?.undetermined, (out.refusals || []).some((r) => r?.at === "versionchain")], [200, 0, 1, true]);
  t("R20 C2: no document and no item in the answer carries a record id",
    [(out.holdings?.by_document || []).length, (out.holdings?.unchained_items || []).length], [0, 0]);
  const facts = composeFacts(requests);
  t("R20 C3: compose's facts name the document UNDETERMINED and carry no record id for it",
    [facts?.holdings?.undetermined, /"record_id"/.test(JSON.stringify(facts?.holdings || {}))], [1, false]);
}

console.log(`\n${pass} pass, ${fail} fail`);
process.exitCode = fail ? 1 : 0;
