/* R59 — `POST /draft`: THE ASSISTANT'S LABELLED DRAFT OF A MEMBER'S OWN WORDS (N686; DEC-152, DEC-153; K1837, K1841,
 * K1364, K1755).
 *
 * WHAT IT IS. A member asks for help writing in one of their own-words fields ("Help me write this", `wizard-scripts`
 * R24, R27), or an administrator for a draft of the group's description (`instance-setup` R65). The plane's door routes
 * `writinghelp` and `groupdescriptiondraft` here (`control-plane` R57) with what the member typed (`told`), the account
 * that serves that member's act (R6's wire shape, its `suggestions` that account's switch), and, only when the draft
 * may read, the member's short-lived, read-only `ai` grant: the switch on, and the field not one that records what the
 * member saw (`firsthand`). This member then runs ONE conversation through `agent-model` (`converse`, mode `draft`,
 * within `run-rules`' bounds for that mode, its `ASK_BOUNDS`), instructed by the published pack's `writing_help` layer
 * (`skills` R36), with its `suggestions` layer only when the switch is on (R56), and answers the draft, labelled machine
 * work.
 *
 * WHAT IT IS NOT. It checks, stores and shows no draft: the door checks it whole with `wizard-scripts` R25 against the
 * read log the plane holds for the grant (none when no grant was sent) before the member sees a word, and counts its
 * `usage` to the member's day (`ai-runs` R48, R52). It makes no write op, no capture request and no run row, and keeps
 * nothing between calls (R36). Without a grant the model is offered NO read tool, so the draft works only from `told`.
 *
 * THE WORDS IT SENDS THE MODEL (R61). The system prompt carries this member's own words and the pack's layers; what the
 * member told goes in the user turn as it arrived; anything the record answers reaches the model only as a read tool's
 * result, text only (R63). It answers once, with no stream: a draft is short and the door checks it whole. */
import { admitRead, readTool, ASK_DECLARED } from "./ask.mjs";
import { toolContent } from "./reads.mjs";
import { askBoundReached } from "../../bio-plane/src/run-rules/index.mjs";

/** The two tasks a draft is asked for, and the field shapes of each. */
export const DRAFT_OPS = Object.freeze(["writinghelp", "groupdescriptiondraft"]);
/** `wizard-scripts` R27's `told`: 1 to 4,000 characters. */
export const TOLD_MAX = 4000;
/** `instance-setup` R65's answers: each `text` at most 1,000 characters. */
export const ANSWER_TEXT_MAX = 1000;
const NAME_MAX = 100;
const ANSWERS_MAX = 20;
const WRITING_HELP_LAYER = "writing_help";
const SUGGESTIONS_LAYER = "suggestions";

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const sameKeys = (o, keys) => Object.keys(o).length === keys.length && keys.every((k) => k in o);
const isName = (v) => typeof v === "string" && v.trim().length > 0 && v.length <= NAME_MAX;

/** The task as the door sends it, or null: `{op: "writinghelp", act, field}` or `{op: "groupdescriptiondraft"}`. */
export function taskOf(t) {
  if (!isObject(t)) return null;
  if (t.op === "writinghelp" && sameKeys(t, ["op", "act", "field"]) && isName(t.act) && isName(t.field))
    return { op: "writinghelp", act: t.act, field: t.field };
  if (t.op === "groupdescriptiondraft" && sameKeys(t, ["op"])) return { op: "groupdescriptiondraft" };
  return null;
}

/** What the member told, held to its task's shape, or null. */
export function toldOf(op, told) {
  if (op === "writinghelp")
    return typeof told === "string" && told.trim().length > 0 && told.length <= TOLD_MAX ? told : null;
  if (!Array.isArray(told) || told.length === 0 || told.length > ANSWERS_MAX) return null;
  if (!told.every((a) => isObject(a) && sameKeys(a, ["question", "text"]) && typeof a.question === "string"
                          && a.question.length <= TOLD_MAX && typeof a.text === "string" && a.text.length <= ANSWER_TEXT_MAX))
    return null;
  if (told.every((a) => !a.text.trim())) return null;
  return told.map((a) => ({ question: a.question, text: a.text }));
}

/** The final tool: the draft's own shape for its task, labelled machine work by this member, never by the model. */
function draftTool(op) {
  const properties = op === "writinghelp"
    ? { text: { type: "string", description: "the drafted words for the member's field, only from what they told you "
                                              + "(and, where you were given the read tool, what you read)" } }
    : { focus: { type: "string", description: "what the group works on, in the administrator's own terms" },
        purpose: { type: "string", description: "why the group exists, in the administrator's own terms" } };
  return { name: "draft", description: "the draft, once: it is labelled machine work, nothing is saved, and the words "
             + "become the member's only by their own act of keeping or editing them",
           input_schema: { type: "object", properties, required: Object.keys(properties), additionalProperties: false } };
}

/** The model's draft held to its task's shape, or null. */
function draftOf(op, answer) {
  if (!isObject(answer)) return null;
  if (op === "writinghelp")
    return typeof answer.text === "string" && answer.text.trim() ? { text: answer.text } : null;
  return typeof answer.focus === "string" && typeof answer.purpose === "string"
         && (answer.focus.trim() || answer.purpose.trim()) ? { focus: answer.focus, purpose: answer.purpose } : null;
}

/** `POST /draft`. `deps` are the shell's own pieces (index.mjs): one route to the plane, one refusal helper, one
 *  account judgement. */
export async function handleDraft(req, env, deps) {
  const { refusal, json, askPlane, planeAnswer, publishedPack, accountOf, cascadeToken, converse, segmentMeter,
          DEFAULT_MAX_SEGMENT_BYTES, now = () => Date.now() } = deps;
  if (typeof env.PLANE?.fetch !== "function")
    return refusal("PLANE_NOT_CONFIGURED",
      "this member reaches the record only through the plane service binding, and the binding is absent, so no "
      + "draft was made and no model was called.", 503);
  const body = await req.json().catch(() => null);
  if (!isObject(body)) return refusal("BAD_BODY", "the request body could not be read as a JSON object.", 400);

  const task = taskOf(body.task);
  if (!task)
    return refusal("BAD_TASK",
      "a draft is asked for one task: help writing in one field of one act ({op: writinghelp, act, field}), or a "
      + "draft of the group's description ({op: groupdescriptiondraft}). What arrived is neither.", 400);
  const told = toldOf(task.op, body.told);
  if (told == null)
    return refusal("BAD_TOLD", task.op === "writinghelp"
      ? `a draft works from what the member typed: words of 1 to ${TOLD_MAX} characters.`
      : `a draft of the group's description works from the administrator's answers: a list of {question, text}, each `
        + `text at most ${ANSWER_TEXT_MAX} characters, not all of them empty.`, 400);
  const acct = await accountOf(body);
  if (acct.refusal) return acct.refusal;
  const { account } = acct;
  /* K1841 (2), DEC-153 (2): the draft reads the record only with the member's own suggestions switch on, and never for
     a field that records what the member saw (testimony stays the witness's). A grant sent otherwise is refused, so the
     door's own mistake cannot widen a draft's reach. */
  const grantSent = body.grant !== undefined && body.grant !== null;
  if (grantSent && (account.suggestions !== true || body.firsthand === true))
    return refusal("DRAFT_READ_NOT_ALLOWED",
      body.firsthand === true
        ? "this field records what the member saw, so its draft only words what they told and reads nothing; a grant "
          + "to read was sent with it, so nothing was done."
        : "a draft reads what the group holds only when the member's own suggestions switch is on, and it is off; a "
          + "grant to read was sent with it, so nothing was done.", 400);
  if (grantSent && !(typeof body.grant === "string" && body.grant))
    return refusal("BAD_GRANT", "grant, when a draft may read, is the member's read-only grant: a non-empty string.", 400);
  const grant = grantSent ? body.grant : null;

  /* THE PACK (R48). With a grant, the plane's `op=agentpack` read under it (N695). Without one this member has
     no credential to read with, so the pack is the one the door sends beside the draft (`pack`, the rendered pack it
     holds, control-plane R41), held to the same whole-pack test (J1's reading, pending BOB's answer). */
  let pub;
  if (grant) {
    const asked = await askPlane(env, "agentpack", grant, null);
    if (!asked.reached)
      return refusal("PLANE_SILENT", "the record could not be reached, so nothing was read and no model was called.",
        502, { detail_from_binding: asked.detail ?? null });
    const a = planeAnswer(asked, "agentpack");
    if (a.refused)
      return json({ ok: false, reason: "PLANE_REFUSED", code: "PLANE_REFUSED", worker: "agent-worker", at: "agentpack",
        detail: "the record refused this draft under the member's grant. Its refusal is passed through exactly as it "
              + "was worded.", plane_status: asked.status ?? null, plane: asked.body ?? null }, 403);
    pub = publishedPack(a.result);
  } else {
    pub = publishedPack({ pack: body.pack ?? null });
  }
  const layer = pub.ok ? pub.pack.disclosed?.[WRITING_HELP_LAYER] : null;
  if (!pub.ok || !isObject(layer) || layer.sourcing === "absent")
    return refusal("PACK_UNDETERMINED",
      "no skill pack with its writing-help layer was published for this draft, so no model was called: a draft made "
      + `without that layer would not be held to the member's own words (${pub.ok
        ? "the pack carries no writing_help layer" : pub.why}).`, 502);
  const pack = pub.pack;
  const suggestionsOn = account.suggestions === true;
  const suggestionsLayer = suggestionsOn && isObject(pack.disclosed?.[SUGGESTIONS_LAYER])
    ? pack.disclosed[SUGGESTIONS_LAYER] : null;

  /* R59, R61: this member's own words and the pack's layers in `system`; the member's words in the user turn. */
  const system = "You draft words for one member of a BIO group, in their own field, from what they told you. Your "
    + "draft is labelled machine work, nothing is saved, and it becomes theirs only by their own act. The instructions "
    + `you work under are this skill pack, version ${String(pack.version)}.\n\n`
    + `RESIDENT LAYER:\n${JSON.stringify(pack.resident)}\n\n`
    + `WRITING HELP LAYER:\n${JSON.stringify(layer)}\n\n`
    + (suggestionsLayer ? `SUGGESTIONS LAYER (the member's suggestions switch is on):\n${JSON.stringify(suggestionsLayer)}\n\n` : "")
    + (grant
      ? "You may read what the group holds through the read tool, under the member's grant. Add no figure, date, name "
        + "or quotation that the member did not tell you or that you did not read. "
      : "You have no read tool: draft only from what the member told you, and add no figure, date, name or quotation "
        + "they did not tell you. ")
    + "Answer once, by calling the draft tool.";
  const asked = task.op === "writinghelp"
    ? `TASK: help writing the field '${task.field}' of the act '${task.act}'.${body.firsthand === true
        ? " This field records what the member saw: only word what they told you." : ""}\n\nWHAT THE MEMBER TOLD YOU:\n${told}`
    : `TASK: draft the group's description, its focus and its purpose, from the administrator's answers.\n\n`
      + `THE ADMINISTRATOR'S ANSWERS:\n${told.map((a) => `Q: ${a.question}\nA: ${a.text}`).join("\n\n")}`;
  const messages = [{ role: "user", content: asked }];
  const tools = [...(grant ? [readTool()] : []), draftTool(task.op)];

  const reference = (await cascadeToken(account)).reference;
  const meter = segmentMeter({ turnsBound: ASK_DECLARED.turns, bytesBound: DEFAULT_MAX_SEGMENT_BYTES });
  const started = now();
  const used = { turns: 0, bytes: 0, wall_ms: 0, reads: 0 };
  const reached = () => { used.turns = meter.turns; used.wall_ms = Math.max(0, now() - started);
                          return askBoundReached(ASK_DECLARED, used); };

  const got = await converse({
    reference, runner: env.RUNNER ?? null, mode: "draft", meter, system, messages, tools, finalTool: "draft",
    maxTurns: ASK_DECLARED.turns,
    onTool: async (name, input) => {
      /* R55, R59: a read only with a grant, only of `ASK_OPS`; anything else is refused here, before any plane call,
         and the refusal is the tool's result. */
      if (name !== "read" || !grant)
        return { content: `'${String(name).slice(0, 40)}' is not a tool of this draft`, error: true };
      const bound = reached();
      if (bound) return { content: { code: "DRAFT_BOUND_REACHED", bound,
                                     detail: `the draft's ${bound} bound is reached; answer with the draft tool` }, error: true };
      const admitted = admitRead(input);
      if (admitted.refused) return { content: admitted.refused, error: true };
      used.reads += 1;
      const r = await askPlane(env, admitted.op, grant, null, admitted.query);
      if (!r.reached) return { content: { code: "PLANE_SILENT", detail: "the plane did not answer this read; what it "
                                            + "would have answered is not held" }, error: true };
      const a = planeAnswer(r, admitted.op);
      const { content } = toolContent(a.refused ? (a.refused.plane ?? { code: a.refused.code }) : a.result);
      used.bytes += JSON.stringify(content ?? null).length;
      return a.refused ? { content, error: true } : { content };
    },
  });
  const spent = { usage: got.usage ?? null, calls: got.calls === undefined ? null : got.calls };
  if (got.answer !== undefined) {
    const draft = draftOf(task.op, got.answer);
    if (draft) return json({ ok: true, task, draft, label: { kind: "machine" }, ...spent });
    return refusal("DRAFT_UNFORMED", "the model answered without a draft of the task's shape, so nothing is returned.",
      502, { ending: "unformed", ...spent });
  }
  if (got.stopped || got.exhausted)
    return refusal("DRAFT_BOUND_REACHED",
      `the draft reached its ${got.stopped ?? "turns"} bound before it was made, so nothing is returned.`, 409,
      { ending: got.stopped ? "stopped" : "exhausted", bound: got.stopped ?? "turns", ...spent });
  if (got.silent)
    return refusal("MODEL_SILENT", "the model could not be reached, so nothing is returned.", 502,
      { ending: "silent", detail_from_model: got.silent.detail ?? null, ...spent });
  return refusal("MODEL_REFUSED",
    "the model's provider refused the call, or the model declined, so nothing is returned. Its own error type and "
    + "status are beside this, unchanged.", 502,
    { ending: "refused", model_status: got.refused?.status ?? null, model_error: got.refused?.type ?? null,
      model_message: got.refused?.message ?? null, ...spent });
}
