/* R54–R56 — `POST /ask`: ONE MEMBER'S QUESTION, ANSWERED UNDER THAT MEMBER'S GRANT AND THE ACCOUNT THAT SERVES THEIR
 * ASK, AND CHECKED BY THE
 * PLANE BEFORE ANY WORD OF IT IS RETURNED (Q1-4; ladders §9.4 L1; K1450, K1474, K1479, K1502, K1601).
 *
 * WHAT IT IS. A member asks; the plane mints the member a short-lived, read-only `ai` grant (credentials R27) and hands
 * this member the question, the grant and the Claude account that serves that member's ask (R6's shape, as
 * `credentials.accountFor` answers it: the member's own reference, else the group's API key while held and on, K1755),
 * with the earlier turns of this one ask, which the member's device holds (nothing is kept here or in the plane,
 * K1450). An ask the group's key serves is still the member's own ask. This member then:
 *
 *   1. asks the plane whether the member is over their use ceiling (`op=askceiling`, ai-runs R50), before any model
 *      call, relaying a refusal unchanged (R43);
 *   2. reads the pack the ask is instructed by (`op=agentpack`, R48), whose `ask` layer carries the closed-book rule;
 *   3. INTERPRETS and READS: one conversation in which the model reads the question (asking at most one clarifying
 *      question, answers R3) and writes its queries, reading the record only through the grant and only the ops of
 *      `ASK_OPS` (R55) — a tool call naming any other op is refused here, before any plane call, and the refusal is
 *      the tool's result;
 *   4. COMPOSES: the same transcript, with reading closed, answered in `answers`' contract (its R3);
 *   5. CHECKS: hands the answer to the plane's `answers` checks (`op=askcheck`, `checkAnswer` over the read log the
 *      plane holds for the grant, its R4) and returns ONLY what they pass, with what they withheld named.
 *
 * It writes no run row and no observation; it reports each conversation's `usage` to the plane (`op=askusage`, ai-runs
 * R48's `countAskUsage`), with `calls`, the model calls that usage covers, exactly as `agent-model` R6 answers them
 * (N588; a `calls` it did not state is passed as `null`). Progress is streamed as each step begins, and no
 * progress event carries text the checks have not passed: a step's name, and a read's op, nothing more.
 *
 * THE STREAM (K1601 (5)): NDJSON (`application/x-ndjson`), one object per line, `{event: "step", step}` for
 * `interpreting`, `composing` and `checking`, `{event: "read", op}` before each read, and last exactly one of
 * `{event: "answer", ok: true, answer, withheld}` or `{event: "refused", …refusal}`. A refusal made before any model
 * call (R1, R2, `NO_GRANT`, `NO_ACCOUNT`, the ceiling) is answered as plain JSON with its status, not as a stream.
 *
 * THE BOUNDS are `run-rules`' `ASK_BOUNDS` (its R17), their provisional defaults (M-Q7 measures them): `turns` model
 * turns, `bytes` of the record's answers read into the model, `wall_ms` from start to answer, `reads` of the record. */
import { ASK_BOUNDS, askBoundReached } from "../../bio-plane/src/run-rules/index.mjs";
import { ASK_OPS } from "./ops.mjs";
import { toolContent } from "./reads.mjs";

/** The ask's bounds: `ASK_BOUNDS`' defaults, the figure an ask declares when it starts (run-rules R17). */
export const ASK_DECLARED = Object.freeze(Object.fromEntries(Object.entries(ASK_BOUNDS).map(([k, v]) => [k, v.default])));
export const QUESTION_MAX = 4000;
export const CONVERSATION_MAX = 40;
const ARG_MAX = 500;

/** R55, R59 — the one read tool an ask or a draft is offered: an op of `ASK_OPS` (`answers`' `ASK_SCOPE`), its arguments
 *  as plain values, read under the member's grant. */
export function readTool() {
  return {
    name: "read",
    description: "read the record through the plane, under the member's grant: one op of the ask's list, with its "
      + "arguments as plain values. Nothing is answered from your own knowledge: what is not read is not held.",
    input_schema: { type: "object", properties: {
      op: { type: "string", enum: [...ASK_OPS] },
      args: { type: "object", additionalProperties: { type: ["string", "number", "boolean"] } } },
      required: ["op"], additionalProperties: false },
  };
}

/** The ask's model tools: `read` (only `ASK_OPS`) and `done_reading` for the first conversation; `answer` (answers
 *  R3's shape) for the second; `load_layer` in both, gated by the switch that governs the ask (R56). */
export function askTools(layers) {
  const load = {
    name: "load_layer", description: "load one of the skill pack's disclosed layers when the work needs it",
    input_schema: { type: "object", properties: { name: { type: "string", enum: layers } }, required: ["name"],
                    additionalProperties: false },
  };
  const read = readTool();
  const done = {
    name: "done_reading",
    description: "end reading: the question as you read it, and at most one clarifying question when it cannot be "
      + "answered without one",
    input_schema: { type: "object", properties: {
      question_as_read: { type: "string" }, clarifying: { type: ["string", "null"] } },
      required: ["question_as_read"], additionalProperties: false },
  };
  const answer = {
    name: "answer",
    description: "the answer, in the answers contract: every sentence rests on what was read, quotes are exact, an "
      + "absence names its level, and every rule is the plane's",
    input_schema: { type: "object", properties: {
      question_as_read: { type: "string" }, clarifying: { type: ["string", "null"] }, summary: {},
      sentences: { type: "array" }, holdings: { type: "array" }, rules: { type: "array" }, looks: { type: "array" },
      bound: {}, truncated: {}, out_of_view: {}, lens: {}, not_established: {}, query: {}, next_acts: {},
      label: { type: "string", enum: ["machine work"] } },
      required: ["question_as_read"], additionalProperties: false },
  };
  return { reading: [load, read, done], composing: [load, answer] };
}

/** R55 — the one door a read comes through: an op in `ASK_OPS` with scalar arguments, or the refusal the model is
 *  handed as the tool's result. No plane call is made for a refused one. */
export function admitRead(input) {
  const op = String(input?.op ?? "");
  if (!ASK_OPS.includes(op))
    return { refused: { code: "ASK_OP_REFUSED", op: op.slice(0, 60),
      detail: `'${op.slice(0, 60)}' is not a read an ask may make; an ask reads only ${ASK_OPS.join(", ")}` } };
  const args = input?.args == null ? {} : input.args;
  if (typeof args !== "object" || Array.isArray(args))
    return { refused: { code: "ASK_ARGS_REFUSED", op, detail: "a read's arguments are a map of plain values" } };
  const query = {};
  for (const [k, v] of Object.entries(args)) {
    if (["op", "token", "store"].includes(k) || !/^[a-z_][a-z0-9_]{0,40}$/i.test(k)
        || !["string", "number", "boolean"].includes(typeof v) || String(v).length > ARG_MAX)
      return { refused: { code: "ASK_ARGS_REFUSED", op,
        detail: `the argument '${k.slice(0, 40)}' is not one a read may carry: a name, and a plain value of at most ${ARG_MAX} characters` } };
    query[k] = v;
  }
  return { op, query };
}

/* The earlier turns of this one ask, as the member's device holds them: `[{role: "user"|"assistant", content}]`. */
function conversationOf(c) {
  if (c == null) return { turns: [] };
  if (!Array.isArray(c) || c.length > CONVERSATION_MAX
      || !c.every((t) => t && (t.role === "user" || t.role === "assistant") && typeof t.content === "string"
                         && t.content.length <= QUESTION_MAX * 4))
    return { bad: true };
  return { turns: c.map((t) => ({ role: t.role, content: t.content })) };
}

/** `POST /ask`. `deps` are the shell's own pieces (index.mjs), so the plane is reached by one route and every refusal
 *  is made by one helper. */
export async function handleAsk(req, env, deps) {
  const { refusal, json, askPlane, planeAnswer, publishedPack, accountOf, cascadeToken, modelHalf, loadableLayers,
          loadLayer, converse, segmentMeter, NAMESPACES, DEFAULT_MAX_SEGMENT_BYTES, now = () => Date.now() } = deps;
  if (typeof env.PLANE?.fetch !== "function")
    return refusal("PLANE_NOT_CONFIGURED",
      "this member reaches the record only through the plane service binding, and the binding is absent, so no "
      + "question can be answered and none was sent anywhere.", 503);
  const body = await req.json().catch(() => null);
  if (body == null || typeof body !== "object" || Array.isArray(body))
    return refusal("BAD_BODY", "the request body could not be read as a JSON object.", 400);

  if (typeof body.question !== "string" || !body.question.trim() || body.question.length > QUESTION_MAX)
    return refusal("BAD_QUESTION", `an ask carries one question in words, of at most ${QUESTION_MAX} characters.`, 400);
  /* K1601 (5): an ask names its namespace or not; one it names is held to R4, one it does not is the plane's default. */
  let store = null;
  if (body.store !== undefined) {
    if (typeof body.store !== "string")
      return refusal("BAD_STORE", "store, when an ask names one, is the namespace's name.", 400);
    if (!NAMESPACES.includes(body.store))
      return refusal("NAMESPACE_UNKNOWN",
        "an ask names the namespace it reads, and no namespace by that name exists on any instance this member can be "
        + "bound to, so nothing was read; they are listed beside this message.", 400,
        { asked: body.store.slice(0, 80), namespaces: [...NAMESPACES] });
    store = body.store;
  }
  const grant = typeof body.grant === "string" ? body.grant : "";
  if (!grant)
    return refusal("NO_GRANT",
      "an ask is read only under the asking member's own short-lived, read-only grant, and none arrived. This member "
      + "holds no credential of its own, so nothing was read and no model was called.", 401);
  const acct = await accountOf(body);
  if (acct.refusal) return acct.refusal;
  const { account } = acct;
  const conv = conversationOf(body.conversation);
  if (conv.bad)
    return refusal("BAD_CONVERSATION",
      `conversation, when present, is this ask's earlier turns: at most ${CONVERSATION_MAX}, each {role: user or `
      + "assistant, content: words}.", 400);

  /* Every call this ask makes reaches the plane under the GRANT and nothing else. */
  const call = (op, query, post) => askPlane(env, op, grant, store, query, post);
  const relayed = (asked, at) => json({ ok: false, reason: "PLANE_REFUSED", code: "PLANE_REFUSED",
    worker: "agent-worker", at,
    detail: "the record refused this ask under the member's grant. Its refusal is passed through exactly as it was "
          + "worded.", plane_status: asked.status ?? null, plane: asked.body ?? null }, 403);
  const silentNow = (asked) => refusal("PLANE_SILENT",
    "the record could not be reached, so nothing was read and no model was called. A failure to answer is not an "
    + "answer.", 502, { detail_from_binding: asked.detail ?? null });

  /* (1) THE CEILING, BEFORE ANY MODEL CALL (ai-runs R50), its refusal relayed unchanged (R43). */
  const ceiling = await call("askceiling");
  if (!ceiling.reached) return silentNow(ceiling);
  if (planeAnswer(ceiling, "askceiling").refused) return relayed(ceiling, "askceiling");

  /* (2) THE PACK (R48): its `ask` layer instructs the ask. A pack the plane did not publish whole is not used. */
  const pub = await call("agentpack");
  if (!pub.reached) return silentNow(pub);
  const pubAnswer = planeAnswer(pub, "agentpack");
  if (pubAnswer.refused) return relayed(pub, "agentpack");
  const pack = publishedPack(pubAnswer.result);
  if (!pack.ok)
    return refusal("PACK_UNDETERMINED",
      "no skill pack this ask can be instructed by was published, so no model was called: an ask answered "
      + `without the pack's closed-book rule would answer from the model's own knowledge (${pack.why}).`, 502);

  const reference = (await cascadeToken(account)).reference;
  const meter = segmentMeter({ turnsBound: ASK_DECLARED.turns, bytesBound: DEFAULT_MAX_SEGMENT_BYTES });
  const model = modelHalf({ reference, runner: env.RUNNER ?? null, meter, suggestions: account.suggestions });
  model.pack = pack.pack;
  model.layers = loadableLayers(pack.pack, model.suggestions);
  const tools = askTools(model.layers);
  const started = now();

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const enc = new TextEncoder();
  const emit = (o) => writer.write(enc.encode(`${JSON.stringify(o)}\n`));

  (async () => {
    const used = { turns: 0, bytes: 0, wall_ms: 0, reads: 0 };
    const reached = () => { used.turns = meter.turns; used.wall_ms = Math.max(0, now() - started);
                            return askBoundReached(ASK_DECLARED, used); };
    const report = async (got) => {
      if (!got || !got.usage) return;
      const entries = model.drain();
      for (const e of entries)
        await call("askusage", null, { mode: "ask", model: e.model, usage: e.usage, calls: e.calls });
    };
    const spend = (got) => model.spent(got, "ask");
    const finish = async (o) => { await emit(o); await writer.close(); };
    const refusedEvent = (code, detail, extra) => ({ event: "refused", ok: false, reason: code, code, detail,
                                                     worker: "agent-worker", ...(extra || {}) });
    const modelEnded = (got) => {
      if (got.stopped || got.exhausted)
        return refusedEvent("ASK_BOUND_REACHED",
          `the ask reached its ${got.stopped ?? "turns"} bound before it was answered, so nothing is returned.`,
          { bound: got.stopped ?? "turns" });
      if (got.silent)
        return refusedEvent("MODEL_SILENT", "the model could not be reached, so nothing is returned.",
          { detail_from_model: got.silent.detail ?? null });
      return refusedEvent("MODEL_REFUSED",
        "the model's provider refused the call, or the model declined, so nothing is returned. Its own error type and "
        + "status are beside this, unchanged.",
        { model_status: got.refused?.status ?? null, model_error: got.refused?.type ?? null,
          model_message: got.refused?.message ?? null });
    };
    try {
      const messages = [...conv.turns, { role: "user", content: `QUESTION: ${body.question}` }];
      const system = "You answer one member's question from the BIO record and nothing else. Read what the record "
        + "holds through the read tool, under the member's grant, then end reading; you will then compose the answer. "
        + "You never answer from your own knowledge. The instructions you work under are this skill pack, version "
        + `${String(pack.pack.version)}.\n\nRESIDENT LAYER:\n${JSON.stringify(pack.pack.resident)}\n\n`
        + "Disclosed layers, loaded with load_layer: " + model.layers.join(", ")
        + ". Load the ask layer before you read.";

      /* (3) INTERPRETING, AND READING THROUGH THE GRANT. */
      await emit({ event: "step", step: "interpreting" });
      const reading = await converse({
        reference, runner: model.runner, mode: "ask", meter, system, messages, tools: tools.reading,
        finalTool: "done_reading", maxTurns: ASK_DECLARED.turns,
        onTool: async (name, input) => {
          if (name === "load_layer") return loadLayer(model, input);
          if (name !== "read") return { content: `'${String(name).slice(0, 40)}' is not a tool of this step`, error: true };
          const bound = reached();
          if (bound) return { content: { code: "ASK_BOUND_REACHED", bound,
                                         detail: `the ask's ${bound} bound is reached; end reading` }, error: true };
          const admitted = admitRead(input);
          if (admitted.refused) return { content: admitted.refused, error: true };
          used.reads += 1;
          await emit({ event: "read", op: admitted.op });
          const got = await call(admitted.op, admitted.query);
          if (!got.reached) return { content: { code: "PLANE_SILENT", detail: "the plane did not answer this read; "
                                                  + "what it would have answered is not held" }, error: true };
          const a = planeAnswer(got, admitted.op);
          /* R63: the model is handed the readers' text and `active` lists only; a field holding bytes is dropped and
             the drop told beside the answer. */
          const { content } = toolContent(a.refused ? (a.refused.plane ?? { code: a.refused.code }) : a.result);
          used.bytes += JSON.stringify(content ?? null).length;
          return a.refused ? { content, error: true } : { content };
        },
      });
      spend(reading);
      await report(reading);
      if (!reading.answer) return await finish(modelEnded(reading));

      /* (4) COMPOSING, reading closed. A clarifying question is still an answer, and still checked. */
      await emit({ event: "step", step: "composing" });
      const bound = reached();
      if (bound) return await finish(refusedEvent("ASK_BOUND_REACHED",
        `the ask reached its ${bound} bound before it was answered, so nothing is returned.`, { bound }));
      messages.push({ role: "user", content: "Reading is closed. Compose the answer by calling the answer tool, in "
        + "the answers contract, resting every sentence on what was read." });
      const composed = await converse({
        reference, runner: model.runner, mode: "ask", meter, system, messages, tools: tools.composing,
        finalTool: "answer", maxTurns: ASK_DECLARED.turns,
        onTool: async (name, input) => (name === "load_layer" ? loadLayer(model, input)
          : { content: "reading is closed; answer with the answer tool", error: true }),
      });
      spend(composed);
      await report(composed);
      if (!composed.answer) return await finish(modelEnded(composed));

      /* (5) CHECKING: only what answers' checks pass is returned (answers R4). */
      await emit({ event: "step", step: "checking" });
      const checked = await call("askcheck", null, { question: body.question, answer: composed.answer });
      if (!checked.reached)
        return await finish(refusedEvent("PLANE_SILENT",
          "the record could not be reached to check the answer, so nothing is returned: an unchecked answer is never "
          + "shown.", { detail_from_binding: checked.detail ?? null }));
      const c = planeAnswer(checked, "askcheck");
      if (c.refused)
        return await finish(refusedEvent("PLANE_REFUSED",
          "the record refused to check the answer, so nothing is returned. Its refusal is passed through exactly as "
          + "it was worded.", { at: "askcheck", plane: c.refused.plane ?? null }));
      const r = c.result || {};
      if (!r.answer || typeof r.answer !== "object")
        return await finish(refusedEvent("ASK_UNCHECKED",
          "the record's checks answered without a checked answer, so nothing is returned: an unchecked answer is never "
          + "shown."));
      await finish({ event: "answer", ok: true, answer: r.answer, withheld: Array.isArray(r.withheld) ? r.withheld : [] });
    } catch (e) {
      await finish(refusedEvent("ASK_FAILED", "the ask failed inside this member, so nothing is returned.",
        { detail_from_member: String(e?.message ?? e).slice(0, 200) })).catch(() => {});
    }
  })();

  return new Response(stream.readable, { status: 200, headers: { "content-type": "application/x-ndjson" } });
}
