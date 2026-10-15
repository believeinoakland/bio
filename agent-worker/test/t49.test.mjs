/* agent-worker — T49 (T49-9; D17 M; K3268): R89 (`POST /ask`'s `answer` tool asks for the whole of `answers`' contract:
 * its `input_schema` names `ANSWER_FIELDS` as `properties`, in order, and as `required`, and the label reads
 * `ANSWER_LABEL`), AT THE MEMBER'S INTERFACE: the default export `fetch(request, env)` driven in this process with a
 * recording plane binding and the global `fetch` replaced by a scripted model API. The plane's `askcheck` here is the
 * plane's own `checkAnswer`, so a refused answer is refused by the plane's check, not by a stub's opinion.
 *
 * Every arm that admits has its refusing counterpart beside it (K874). */
import worker from "../src/index.mjs";
import { askTools } from "../src/ask.mjs";
import { ANSWER_FIELDS, ANSWER_LABEL, checkAnswer } from "../../bio-plane/src/answers/index.mjs";
import { MEMBER } from "./account.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const section = (s) => console.log(`\n--- ${s} ---`);

const GRANT = "aig-t49-fixture-grant-never-echoed";
const ACCOUNT = { kind: "apikey", level: "member", secret: "sk-ant-t49-fixture-never-echoed", member: MEMBER };
const PACK = { id: "investigative-session", version: "pack@t49", resident: { objective: "answer from the record" },
               disclosed: { ask: { body: "closed book" } } };
/* a whole answer in `answers`' contract, nothing held: a clarifying-free absence */
const WHOLE = { question_as_read: "who held the seat in March", clarifying: null, summary: null, sentences: [],
  holdings: [], rules: [], looks: [], bound: null, truncated: false, out_of_view: false, lens: null,
  not_established: [], query: null, next_acts: [], label: ANSWER_LABEL };

function plane() {
  const calls = [];
  const ok = (result) => Response.json({ ok: true, result, tokenClass: "ai", version: "t49" });
  return { calls, binding: { async fetch(url, init) {
    const op = new URL(url).searchParams.get("op");
    let body = null; try { body = init?.body ? JSON.parse(init.body) : null; } catch { body = null; }
    calls.push({ op });
    switch (op) {
      case "askceiling": return ok({ ok: true, reached: false });
      case "agentpack": return Response.json({ ok: true, fences: [], pack: PACK, tokenClass: "ai" });
      case "askusage": return ok({ ok: true });
      case "askcheck": { const r = checkAnswer(body?.answer);
        return r.ok === false ? Response.json(r, { status: 400 }) : ok({ ok: true, answer: r.answer, withheld: r.withheld ?? [] }); }
      default: return Response.json({ ok: false, reason: "UNKNOWN_OP" }, { status: 400 });
    }
  } } };
}

async function ask(answerInput) {
  const p = plane(), seen = [];
  const saved = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body);
    const names = (body.tools || []).map((x) => x.name);
    seen.push(body.tools);
    const use = (name, input) => Response.json({ id: "m", type: "message", role: "assistant", stop_reason: "tool_use",
      content: [{ type: "tool_use", id: `u${seen.length}`, name, input }], usage: { input_tokens: 3, output_tokens: 2 } });
    return names.includes("done_reading") ? use("done_reading", { question_as_read: WHOLE.question_as_read })
                                          : use("answer", answerInput);
  };
  try {
    const res = await worker.fetch(new Request("http://agent-worker/ask", { method: "POST",
      body: JSON.stringify({ question: "Who held the seat in March?", grant: GRANT, account: ACCOUNT }) }),
      { VERSION: "t49", PLANE: p.binding });
    const lines = (await res.text()).trim().split("\n").map((l) => JSON.parse(l));
    const tool = seen.flat().find((x) => x?.name === "answer");
    return { lines, last: lines[lines.length - 1], tool, plane: p.calls };
  } finally { globalThis.fetch = saved; }
}

section("R89 · the answer tool asks for the whole contract, read from answers");
{
  const r = await ask(WHOLE);
  const schema = r.tool?.input_schema;
  t("R89: the answer tool's required deep-equals ANSWER_FIELDS", schema?.required, [...ANSWER_FIELDS]);
  t("R89: its properties' keys equal ANSWER_FIELDS, in order", Object.keys(schema?.properties ?? {}), [...ANSWER_FIELDS]);
  t("R89: no field beyond the contract is admitted", schema?.additionalProperties, false);
  t("R89: label's schema reads ANSWER_LABEL", schema?.properties?.label?.enum, [ANSWER_LABEL]);
  t("R89: a whole answer passes the plane's check and reaches the member", [r.last.event, r.last.ok], ["answer", true]);
}

section("R89 · a field added to the contract appears in both (test double)");
{
  const double = { fields: Object.freeze([...ANSWER_FIELDS, "added_by_a_double"]), label: "double label" };
  const schema = askTools(["ask"], double).composing.find((x) => x.name === "answer").input_schema;
  t("R89: the double's added field is in required and in properties, last", [schema.required.at(-1), Object.keys(schema.properties).at(-1)],
    ["added_by_a_double", "added_by_a_double"]);
  t("R89: the double's label is the label's enum", schema.properties.label.enum, ["double label"]);
}

section("R89 (control) · a model answer missing one field is refused by the plane's check, nothing of it reaches the member");
{
  for (const k of ANSWER_FIELDS) {
    const { [k]: _gone, ...short } = WHOLE;
    const r = await ask(short);
    t(`R89 (control, ${k}): refused PLANE_REFUSED at askcheck with ANSWER_MALFORMED naming the field`,
      [r.last.event, r.last.ok, r.last.at, r.last.plane?.code ?? r.last.plane?.reason, r.last.plane?.field], ["refused", false, "askcheck", "ANSWER_MALFORMED", k]);
    t(`R89 (control, ${k}): no answer event reached the member`, r.lines.some((l) => l.event === "answer"), false);
  }
}

console.log(`\nt49: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
