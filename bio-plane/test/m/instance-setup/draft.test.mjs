/* The assistant drafts the group's description (R65; DEC-152, K1818, K1837, K1841 (2)) at the module's interface: the
   function the door calls in-process (control-plane R57) over the real record-core, wizard-scripts' real check and
   rows, and, for the path T35's model turn will take (N686), a turn a test hands in. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot } from "./fixture.mjs";
import { INSTANCE_SETUP_CHECKS, GROUP_DRAFT_ANSWER_MAX, GROUP_DRAFT_ANSWERS_MAX } from "../../../src/setup.mjs";
import { WIZARD_SCRIPTS_CHECKS } from "../../../src/wizard-scripts/index.mjs";

const ASSISTANT = { on: true, account: { kind: "apikey", level: "group" } };
const ANSWERS = [{ question: "What does your group work on?", text: "We watch the port's budget and its 12 harbour contracts." },
                 { question: "Why does it exist?", text: "Because nobody else reads them." }];
const writes = (w) => w.st.statements.filter((q) => /^\s*(INSERT|UPDATE|DELETE|REPLACE)/i.test(q)).length;

async function world({ on = true, turn = undefined } = {}) {
  const w = await boot({ env: { INSTANCE_NAME: "river-town" }, more: turn ? { groupDraftTurn: turn } : {} });
  w.prov.admins = new Set(["admin"]);
  /* R53 (T36): the assistant is off exactly while the group keeps its material away from AI (credentials R52) */
  if (!on) w.prov.keepAway = { on: true, reason: "Our material stays here.", set_by: "admin", set_at: "2026-10-08T09:00:00Z" };
  return w;
}

test("R65 the refusals, in order: NOT_AN_ADMIN (membership R84) before anything; AI_KEPT_AWAY (R55, credentials R35, T37) while the group keeps its material away; ASSISTANT_DRAFT_UNAVAILABLE when the door resolved no assistant though the gate is open (no AI_KEPT_AWAY minted here, K231); GROUP_DRAFT_ANSWERS_MALFORMED (C-64.10) and GROUP_DRAFT_NO_ANSWERS (C-64.9) over the answers; each writes nothing", async () => {
  const w = await world({ on: false });
  const before = writes(w);
  for (const by of [null, "", "ruth", "class:ai"]) {
    const r = await w.m.groupDescriptionDraft({ answers: "not even a list", assistant: ASSISTANT, viewer: by, by });
    assert.deepEqual([r.ok, r.reason, r.check], [false, "NOT_AN_ADMIN", "C-96.1"], String(by));
  }
  const off = await w.m.groupDescriptionDraft({ answers: "not even a list", assistant: ASSISTANT, viewer: "admin", by: "admin" });
  assert.deepEqual([off.ok, off.reason, off.check], [false, "AI_KEPT_AWAY", "C-29.31"]);
  w.prov.keepAway = { on: false, reason: null, set_by: null, set_at: null };
  const mark = writes(w);
  const doorOff = await w.m.groupDescriptionDraft({ answers: ANSWERS, assistant: { on: false }, viewer: "admin", by: "admin" });
  assert.equal(doorOff.reason, "ASSISTANT_DRAFT_UNAVAILABLE");
  const long = "x".repeat(GROUP_DRAFT_ANSWER_MAX + 1);
  for (const answers of [undefined, null, "text", {}, [null], [{ text: "a" }], [{ question: "q", text: 7 }], [{ question: "q", text: long }],
                         Array.from({ length: GROUP_DRAFT_ANSWERS_MAX + 1 }, () => ({ question: "q", text: "a" }))]) {
    const r = await w.m.groupDescriptionDraft({ answers, assistant: ASSISTANT, viewer: "admin", by: "admin" });
    assert.deepEqual([r.ok, r.reason, r.check], [false, "GROUP_DRAFT_ANSWERS_MALFORMED", "C-64.10"], JSON.stringify(answers)?.slice(0, 40));
    assert.equal(r.translation, INSTANCE_SETUP_CHECKS.GROUP_DRAFT_ANSWERS_MALFORMED.translation);
  }
  assert.equal((await w.m.groupDescriptionDraft({ answers: [{ question: "q", text: "x".repeat(GROUP_DRAFT_ANSWER_MAX) }],
    assistant: ASSISTANT, viewer: "admin", by: "admin" })).reason, "ASSISTANT_DRAFT_UNAVAILABLE", "1,000 characters is within");
  for (const answers of [[], [{ question: "q", text: "" }], [{ question: "q", text: "  \n " }, { question: "r", text: "" }]]) {
    const r = await w.m.groupDescriptionDraft({ answers, assistant: ASSISTANT, viewer: "admin", by: "admin" });
    assert.deepEqual([r.ok, r.reason, r.check], [false, "GROUP_DRAFT_NO_ANSWERS", "C-64.9"], JSON.stringify(answers));
    assert.equal(r.translation, "Tell the assistant a little about your group first: it drafts only from what you tell it and what "
      + "your group already holds. Nothing was saved.");
  }
  assert.equal(writes(w), mark, "no refusal writes");
  assert.ok(before <= mark);
});

test("R65 a draft that cannot be served (no turn handed in, as with no route to agent-worker's /draft) answers, past every refusal, wizard-scripts' ASSISTANT_DRAFT_UNAVAILABLE and nothing else, and writes nothing", async () => {
  const w = await world();
  const mark = writes(w);
  const r = await w.m.groupDescriptionDraft({ answers: ANSWERS, assistant: ASSISTANT, viewer: "admin", by: "admin" });
  const row = WIZARD_SCRIPTS_CHECKS.ASSISTANT_DRAFT_UNAVAILABLE;
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "ASSISTANT_DRAFT_UNAVAILABLE", "ASSISTANT_DRAFT_UNAVAILABLE",
                                                                       row.check, row.translation]);
  assert.equal("focus" in r || "purpose" in r, false, "the page's fields are left as they were");
  assert.equal(writes(w), mark);
  assert.equal(w.st.db.prepare(`SELECT count(*) n FROM sqlite_master WHERE name LIKE '%description%'`).get().n, 0, "no table of its own");
});

test("R65 the draft path (T35's turn handed in): each of focus and purpose labelled {kind: machine, asked_by}, passed through wizard-scripts' no-added-fact check (firsthand false): a sentence stating a figure not told is withheld; what the group holds is read only while the account's suggestions switch is on; nothing is written", async () => {
  const seen = [];
  const turn = (draft) => async (a) => { seen.push(a); return draft; };
  const w = await world({ turn: turn({ focus: "We watch the port's budget and its 12 harbour contracts. We found 40 errors.",
                                       purpose: "Because nobody else reads them.", readLog: [] }) });
  const mark = writes(w);
  const r = await w.m.groupDescriptionDraft({ answers: ANSWERS, assistant: ASSISTANT, viewer: "admin", by: "admin" });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual(r.focus, { text: "We watch the port's budget and its 12 harbour contracts.", label: { kind: "machine", asked_by: "admin" } });
  assert.deepEqual(r.purpose, { text: "Because nobody else reads them.", label: { kind: "machine", asked_by: "admin" } });
  assert.deepEqual(r.withheld.map((x) => [x.field, x.code]), [["focus", "WRITING_HELP_FACT_ADDED"]]);
  assert.match(r.note, /nothing is saved until you edit it and keep it/);
  assert.equal(writes(w), mark, "it writes nothing; keeping it is op=groupdescriptionset's (membership R109)");
  /* the turn is handed the answers and whether it may read the group's holdings: only with the switch on */
  assert.deepEqual(seen[0].answers, ANSWERS);
  assert.equal(seen[0].holdings, false);
  /* a read with the switch off is refused by the check's own row */
  const read = await world({ turn: turn({ focus: "We watch the port's budget.", purpose: "x", readLog: ["the 2025 budget, page 3"] }) });
  const off = await read.m.groupDescriptionDraft({ answers: ANSWERS, assistant: ASSISTANT, viewer: "admin", by: "admin" });
  assert.deepEqual([off.ok, off.reason, off.check], [false, "WRITING_HELP_SUGGESTIONS_OFF", WIZARD_SCRIPTS_CHECKS.WRITING_HELP_SUGGESTIONS_OFF.check]);
  const on = await read.m.groupDescriptionDraft({ answers: ANSWERS, by: "admin", viewer: "admin",
    assistant: { on: true, account: { kind: "apikey", level: "group", suggestions: true } } });
  assert.equal(on.ok, true, JSON.stringify(on));
  assert.deepEqual(seen.map((a) => a.holdings), [false, false, true], "the holdings are offered to the turn only with the switch on");
  /* a draft over membership R109's limits is not offered; a turn that answers nothing is the unavailable answer */
  const big = await world({ turn: turn({ focus: "Because nobody else reads them. ".repeat(40), purpose: "x" }) });
  assert.equal((await big.m.groupDescriptionDraft({ answers: ANSWERS, assistant: ASSISTANT, by: "admin" })).reason, "ASSISTANT_DRAFT_UNAVAILABLE");
  const nothing = await world({ turn: async () => null });
  assert.equal((await nothing.m.groupDescriptionDraft({ answers: ANSWERS, assistant: ASSISTANT, by: "admin" })).reason, "ASSISTANT_DRAFT_UNAVAILABLE");
});

test("R65 T35 (N686, K1974) the door's call to agent-worker's /draft handed in per request is the turn used, past every refusal and only then; a call that throws or answers nothing is ASSISTANT_DRAFT_UNAVAILABLE, the fields unchanged", async () => {
  const w = await world({ turn: async () => ({ focus: "the built-in turn", purpose: "x" }) });
  const asked = [];
  const door = async (a) => { asked.push(a); return { focus: "Because nobody else reads them.", purpose: "We watch the port's budget.", readLog: [] }; };
  const r = await w.m.groupDescriptionDraft({ answers: ANSWERS, assistant: ASSISTANT, viewer: "admin", by: "admin", turn: door });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual([r.focus.text, r.purpose.text], ["Because nobody else reads them.", "We watch the port's budget."]);
  assert.deepEqual(asked, [{ answers: ANSWERS, account: ASSISTANT.account, holdings: false }]);
  /* refusals come first: the door's turn is never asked for a refused request */
  for (const req of [{ by: "ruth" }, { assistant: { on: false } }, { answers: [] }]) {
    const out = await w.m.groupDescriptionDraft({ answers: ANSWERS, assistant: ASSISTANT, viewer: "admin", by: "admin", turn: door, ...req });
    assert.equal(out.ok, false, JSON.stringify(req));
  }
  assert.equal(asked.length, 1);
  for (const bad of [async () => { throw new Error("AGENT_WORKER_SILENT"); }, async () => null, async () => "text"]) {
    const out = await w.m.groupDescriptionDraft({ answers: ANSWERS, assistant: ASSISTANT, viewer: "admin", by: "admin", turn: bad });
    assert.deepEqual([out.ok, out.reason], [false, "ASSISTANT_DRAFT_UNAVAILABLE"]);
    assert.equal("focus" in out || "purpose" in out, false);
  }
});
