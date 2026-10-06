/* R40, R41, D-611 — THE MODEL HALF: model turns, run under the Claude account the cascade resolved and the
 * skill pack the run names, inside a segment bounded on turns AND on the bytes it sends.
 *
 * WHAT THIS FILE DOES AND DOES NOT DECIDE. It asks the model for a judgement INSIDE a step and hands the
 * answer back as a judgement object; the table (`harness.mjs`) still decides every step, and `applyJudgement`
 * still refuses a judgement that reaches for control flow (R16, R39). Nothing here names a plane op: a
 * sub-session's one plane tool is performed by the caller's `onTool`, through the same meaning reader the
 * parent uses (R37).
 *
 * THE ONE EGRESS THAT IS NOT THE PLANE. The model is reached at `MODEL_ENDPOINT` by `fetch`, with the token the
 * cascade resolved for this call (R36: it arrives per call, is sent only there, and is never stored, logged or
 * echoed). It is not a binding and holds no secret (R35). This member depends on nothing from npm, so the call
 * is the raw Messages API.
 *
 * D-611 — THE SEGMENT IS BOUNDED ON BYTES. M-168 measured that what binds a segment is CPU spent re-serialising
 * the transcript, ~7–10 ms per MB, ~3 GB under the 30 s default. So every request body is counted as sent, and a
 * request that would carry the segment past `bytesBound` is not sent: the SEGMENT stops (never the run), and
 * resuming is what segments are for. The turn bound (R7) is checked the same way. */

export const MODEL_ENDPOINT = "https://api.anthropic.com/v1/messages";
export const MODEL_API_VERSION = "2023-06-01";
export const DEFAULT_MODEL = "claude-opus-5";
export const MODEL_MAX_TOKENS = 16000;
/* A third of the ~3 GB M-168 locates under the 30 s CPU default: ~10 s of re-serialising at its measured rate. */
export const DEFAULT_MAX_SEGMENT_BYTES = 1_000_000_000;
export const SEGMENT_BYTES_SOURCE = "D-611 on M-168: CPU binds at ~7-10 ms per MB re-serialised, ~3 GB under the "
  + "30 s default; a segment sends at most a third of that";
/* One conversation's own ceiling, so a model that never answers cannot spend the whole segment in one row. */
export const CONVERSATION_MAX_TURNS = 12;

/** The segment's meter: what it may spend and what it has. Plain data, so the driver can publish it. */
export function segmentMeter({ turnsBound, bytesBound }) {
  return { turns: 0, turnsBound, bytes: 0, bytesBound, stopped: null };
}

/** THE ONE MODEL CALL. Three outcomes, named, like `planeAnswer`'s: `silent` (no answer), `refused` (the API
 *  said no, or the model declined), `result` (the message). The token goes in one header and nowhere else. */
export async function modelCall(token, serialized) {
  let res;
  try {
    res = await fetch(MODEL_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": token, "anthropic-version": MODEL_API_VERSION },
      body: serialized,
    });
  } catch (e) {
    return { silent: { detail: String((e && e.message) || e).slice(0, 200) } };
  }
  let body = null;
  try { body = await res.json(); } catch { body = null; }
  if (body == null) return { silent: { detail: `the model API answered ${res.status} with a body that is not JSON` } };
  if (res.status !== 200)
    return { refused: { status: res.status, type: body?.error?.type ?? null,
                        message: String(body?.error?.message ?? "").slice(0, 300) } };
  if (body.stop_reason === "refusal")
    return { refused: { status: 200, type: "refusal",
                        message: String(body?.stop_details?.explanation ?? "").slice(0, 300) } };
  return { result: body };
}

/** ONE CONVERSATION, TO ITS ANSWER. `messages` is the transcript and is appended to in place (the parent's
 *  persists across rows; each sub-session has its own). The conversation ends when the model calls `finalTool`
 *  (answer: its input), or with `stopped` (the segment's turn or byte bound), `exhausted` (this conversation's
 *  own ceiling), `silent` or `refused`. Any other tool call is performed by `onTool` and its result returned. */
export async function converse({ token, model, meter, system, messages, tools, finalTool, onTool,
                                 maxTurns = CONVERSATION_MAX_TURNS }) {
  for (let k = 0; k < maxTurns; k += 1) {
    const serialized = JSON.stringify({ model, max_tokens: MODEL_MAX_TOKENS, system, messages, tools,
                                        tool_choice: { type: "auto" } });
    if (meter.turns >= meter.turnsBound) { meter.stopped = "turns"; return { stopped: "turns" }; }
    if (meter.bytes + serialized.length > meter.bytesBound) { meter.stopped = "bytes"; return { stopped: "bytes" }; }
    meter.turns += 1;
    meter.bytes += serialized.length;
    const got = await modelCall(token, serialized);
    if (got.silent || got.refused) return got;
    const content = Array.isArray(got.result.content) ? got.result.content : [];
    messages.push({ role: "assistant", content });
    const uses = content.filter((b) => b && b.type === "tool_use");
    const final = uses.find((u) => u.name === finalTool);
    if (final) {
      /* Every tool call gets its result, so the transcript stays one the API accepts when the next row is asked. */
      messages.push({ role: "user", content: uses.map((u) => ({ type: "tool_result", tool_use_id: u.id,
        content: u === final ? "received" : "not performed: the answer ended this step" })) });
      return { answer: final.input && typeof final.input === "object" ? final.input : {} };
    }
    if (!uses.length) {
      messages.push({ role: "user", content: `Answer by calling the \`${finalTool}\` tool.` });
      continue;
    }
    const results = [];
    for (const u of uses) {
      const r = await onTool(u.name, u.input || {});
      if (r && r.halt) return r.halt;
      results.push({ type: "tool_result", tool_use_id: u.id, content: JSON.stringify(r?.content ?? null),
                     ...(r?.error ? { is_error: true } : {}) });
    }
    messages.push({ role: "user", content: results });
  }
  return { exhausted: true };
}

/* ------------------------------------------------------------------ THE PARENT'S JUDGEMENTS (R40)
 *
 * One tool per judged row, all declared on every turn so the transcript's earlier calls always name a tool the
 * request declares. Each tool's schema is exactly the judgeable fields that row decides (§14b.4's right-hand
 * column); `applyJudgement` polices the answer whatever the schema says. `collect` has none: its judgements are
 * the sub-sessions' REPORTS (R41). */
const STATE_ENUM = ["LOOKED_ABSENT", "LOOKED_INDETERMINATE", "PRESENT", "partial"];
const LOOK_FIELDS = (levels) => ({
  level: { type: "string", enum: levels, description: "the level a look at this step was made at, if any" },
  observed: { type: "string", enum: STATE_ENUM, description: "what a look at this step established; omit when nothing was looked at" },
  governed: { type: "boolean" },
  condition: { type: "string" },
});

export function judgeTools(levels) {
  const obj = (properties, description, name) => ({
    name, description, input_schema: { type: "object", properties, additionalProperties: false },
  });
  return [
    obj({ targets: { type: "array", items: { type: "object", properties: {
            level: { type: "string", enum: levels }, url: { type: "string" }, target: { type: "string" } },
            required: ["level"] } },
          ...LOOK_FIELDS(levels) },
        "plan: what to search for this pass. An internet target names the https address to request.", "judge_plan"),
    obj({ candidates: { type: "array", items: { type: "object" },
                        description: "candidate versions, each the body of op=suggest (see the acts layer)" },
          ...LOOK_FIELDS(levels) },
        "compose: what the reports mean, and what each version says.", "judge_compose"),
    obj({ candidates: { type: "array", items: { type: "object" },
                        description: "the candidates that differ in substance from what the record holds" } },
        "dedup: whether each reading differs in substance.", "judge_dedup"),
    obj({ submission: { type: "object", description: "the changed submission; the refused one unchanged drops it" } },
        "adjust: how to answer the plane's refusal.", "judge_adjust"),
  ];
}

/* R52 (K660) — MODE `plan`'s judgements: `compose` answers candidate proposals strongest first, each with only
 * `optionPropose`'s fields, and `adjust` a changed proposal. No field for a score, a rank or a strength exists in
 * either schema; `applyPlanJudgement` refuses one whatever the schema says. */
export function planJudgeTools(optionKeys) {
  const option = { type: "object", properties: Object.fromEntries(optionKeys.map((k) => [k, {}])),
                   additionalProperties: false };
  const obj = (properties, description, name) => ({
    name, description, input_schema: { type: "object", properties, additionalProperties: false },
  });
  return [
    obj({ candidates: { type: "array", items: option,
                        description: "the proposals, STRONGEST FIRST: their order is the only sign of strength; each "
                                   + "carries only optionPropose's fields, with why (at most 500 characters) and sources" } },
        "compose: which options to propose to the plan, in order of strength, and why.", "judge_compose"),
    obj({ submission: { ...option, description: "the changed proposal; the refused one unchanged drops it" } },
        "adjust: how to answer the plane's refusal of a proposal.", "judge_adjust"),
  ];
}

export const LOAD_LAYER = (disclosable) => ({
  name: "load_layer",
  description: "load one of the skill pack's disclosed layers when the work needs it",
  input_schema: { type: "object", properties: { name: { type: "string", enum: disclosable } },
                  required: ["name"], additionalProperties: false },
});

/** The parent's system prompt: the pack's resident layer, verbatim, and what can be loaded. */
export function parentSystem(pack) {
  return "You make the judgements inside the steps of a BIO AI run. The run's control flow is a table you do not "
    + "decide: at each judged step you are told the step and its facts, and you answer only by calling that step's "
    + "judge tool. The instructions you work under are this skill pack, version " + String(pack.version) + ".\n\n"
    + "RESIDENT LAYER:\n" + JSON.stringify(pack.resident) + "\n\n"
    + "Disclosed layers, loaded with load_layer when your work needs them: "
    + (pack.resident?.disclosable ?? []).map((d) => `${d.layer} (${d.load_when})`).join("; ");
}

/** The user turn for a judged row: the row's own words from the table, and the facts it judges over. */
export function rowPrompt(step, row, facts) {
  return `STEP ${step}: ${row.does}. You judge: ${row.judged}. Facts: ${JSON.stringify(facts)}. `
    + `Answer by calling judge_${step}.`;
}

/** The facts a judged row judges over, taken from the table's state: what the row needs and nothing that would
 *  let a judgement reach control flow (it may still try; `applyJudgement` refuses it). */
export function rowFacts(s, levels) {
  if (s.mode === "plan")
    switch (s.step) {
      case "compose":
        return { plan: s.planDoc ?? null, earlier_plans: s.earlier || [], reads: s.reads || [],
                 undetermined: s.undetermined || [], candidates: s.candidates || [] };
      case "adjust":
        return { refusal: s.refusal ?? null, refused_submission: s.refusedSubmission ?? null };
      default:
        return {};
    }
  switch (s.step) {
    case "plan":
      return { pass: Number(s.pass) + 1, max_passes: s.maxPasses, mode: s.mode, target: s.target ?? null,
               target_basis: s.targetBasis ?? null, levels, resumed_from: s.resumedFrom };
    case "compose":
      return { target: s.target ?? null, reports: s.reports || [], reports_refused: s.reportsRefused || [],
               holdings: s.holdings ?? null, candidates: s.candidates || [] };
    case "dedup":
      return { target: s.target ?? null, candidates: s.candidates || [] };
    case "adjust":
      return { refusal: s.refusal ?? null, refused_submission: s.refusedSubmission ?? null };
    default:
      return {};
  }
}

/* ------------------------------------------------------------------ THE SUB-SESSION (R41)
 *
 * Its own conversation — nothing shared with the parent or another level — briefed with its frozen spawn
 * contract, holding the contract's `scope` as its only plane tool and `report` as its answer. It is never told
 * the lens (the contract has no field for it, R17) and it returns a REPORT, never documents (R20). The member,
 * not the model, supplies `level` (the contract's) and `observed_at` (where its look was logged). */
export function subsessionSystem(pack, contract) {
  return "You are a search sub-session of a BIO AI run, searching ONE level and returning a REPORT, never "
    + "documents: the parent re-reads by address. Search with the meaningrows tool, then call report once.\n\n"
    + "RESIDENT LAYER:\n" + JSON.stringify(pack.resident) + "\n\nYOUR SPAWN CONTRACT:\n" + JSON.stringify(contract);
}

export function subsessionTools(contract) {
  const r = contract.returns || {};
  return [
    { name: "meaningrows",
      description: "query the record at meaning grain through the plane (op=meaningrows)",
      input_schema: { type: "object", properties: {
        q: { type: "string" }, rows: { type: "string", description: "the meaning arm, e.g. leg" },
        limit: { type: "integer", minimum: 1, maximum: 50 } }, required: ["rows"], additionalProperties: false } },
    { name: "report",
      description: String(r.rule || "return a REPORT with a citation, never documents"),
      input_schema: { type: "object", properties: {
        state: { type: "string", enum: r.states || [] },
        summary: { type: "string", maxLength: r.summary_max || 500 },
        citations: { type: "array", maxItems: r.citations_max || 20, items: { type: "object", properties: {
          address: { type: "string", maxLength: r.address_max || 200 } }, required: ["address"],
          additionalProperties: false } },
        governed: { type: "boolean" }, condition: { type: "string" } },
        required: ["state"], additionalProperties: false } },
  ];
}
