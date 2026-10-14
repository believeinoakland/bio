/* screens-action R2, R3 (and R7 on `start-send`): Step 1, what starting does, first, with every refusal resolved in place,
   and nothing run before the member's confirm; Step 2, prepare, approve, the second approval, and record the sending. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, main, text, ops, press, last, ok, refusedIn, button, beside, fill, DATA_PLANE, PREVIEW, PLAN_ID, ACTION_ID, FILING, FILINGS, draft } from "./page.mjs";

const STEP1 = `/app/start-send/${PLAN_ID}~opt-1`;
const STEP2 = `/app/start-send/${ACTION_ID}`;

test("R2: Step 1 reads optionstartpreview first and draws the kind, the office by its role, what it rests on with each matter's state, the clock and the breach", async () => {
  const p = await open(STEP1, DATA_PLANE);
  assert.deepEqual(p.byOp("optionstartpreview")[0].body, { plan: PLAN_ID, option: "opt-1", kind: "records_request", breach: false });
  const t = text(p);
  for (const s of ["Start “Records request: inspection logs”", "Nothing runs until you confirm", "records request", "City Clerk, Office of the City Clerk · an office, by its role",
    "INQ-2026-ffffffffffffffff · hypothetical: not yet shown", "24 October 2026 · the records law's ten days", "Asserts a breachno"]) assert.ok(t.includes(s), s);
  assert.deepEqual(ops(p), ["optionstartpreview", "optionstart"]);
});

test("R2 (v0.2 rules 1–3): a refusal starting would meet is drawn first; the member resolves it in place: the breach unticked, or a reason to proceed anyway, which the preview then states", async () => {
  const refusal = { ok: false, reason: "BREACH_ON_HYPOTHESIS", code: "BREACH_ON_HYPOTHESIS", translation: "A breach claim rests on an established matter." };
  const p = await open(STEP1, { ...DATA_PLANE, optionstartpreview: (req) => ok(req.body.premise_override
    ? { ...PREVIEW, action: { ...PREVIEW.action, breach: true, premise_override: req.body.premise_override } }
    : { ...PREVIEW, would_start: false, refusal, action: { ...PREVIEW.action, breach: req.body.breach } }) });
  const first = main(p).querySelector(".cs-gap");
  assert.ok(first && /Would be refused/.test(first.textContent) && /A breach claim rests on an established matter/.test(first.textContent));
  assert.ok(main(p).innerHTML.indexOf("cs-gap") < main(p).innerHTML.indexOf("mk-dl"), "the refusal comes first");
  await press(p, "optionstartpreview", { values: { "start-breach": true, "start-override": "the logs are public already" } });
  assert.deepEqual(last(p, "optionstartpreview").body, { plan: PLAN_ID, option: "opt-1", kind: "records_request", breach: true, premise_override: { reason: "the logs are public already" } });
  assert.equal(main(p).querySelector(".cs-gap"), null, "resolved");
  assert.match(text(p), /proceeding anyway, with the reason stated/);
});

test("R2: 'Start the action' runs only on the member's confirm, then opens Step 2 for the action started; control: a refusal stays beside it and nothing moves", async () => {
  const p = await open(STEP1, { ...DATA_PLANE, optionstart: ok({ plan: PLAN_ID, option: "opt-1", action: ACTION_ID, reminders: [] }) });
  const b = button(p, "optionstart");
  await p.click(b);
  assert.equal(p.byOp("optionstart").length, 0, "nothing runs before her confirm");
  await press(p, b, { reason: "first, to see what closed means" });
  assert.deepEqual(last(p, "optionstart").body, { plan: PLAN_ID, option: "opt-1", kind: "records_request", breach: false,
    why_first: "first, to see what closed means", reason: "first, to see what closed means" });
  assert.equal(p.location.pathname, `/app/start-send/${ACTION_ID}`);
  const q = await open(STEP1, { ...DATA_PLANE, optionstart: refusedIn("OPTION_NOT_CHOSEN", "This option is not chosen.") });
  const c = await press(q, "optionstart", { reason: "x" });
  assert.match(beside(q, c), /This option is not chosen/);
  assert.equal(q.location.pathname, STEP1);
});

test("R3: Step 2 prepares what is sent (her own words, labelled; each filled blank naming its source), then offers only its approval", async () => {
  let drafts = [];
  const p = await open(STEP2, { ...DATA_PLANE, filingsfor: () => ok(FILINGS(drafts)),
    communicationprepare: () => { drafts = [draft()]; return ok({ id: FILING, action: ACTION_ID, form: "communication", text: "We request the logs for {{period}}.",
      blanks: [{ name: "period", value: "2025", source: "member", label: "your own" }], disclosure: { machine: false } }); } });
  assert.deepEqual(ops(p), ["communicationprepare", "filingprepare"]);
  assert.match(text(p), /Your group's Civicsmith sends nothing: you send it by the office's own means/);
  const b = await press(p, "communicationprepare", { reason: "ready" });
  assert.match(beside(p, b), /Write what is sent first/);
  assert.equal(p.byOp("communicationprepare").length, 0);
  await press(p, "communicationprepare", { values: { "send-text-0": "We request the inspection logs." }, reason: "ready" });
  assert.deepEqual({ ...last(p, "communicationprepare").body, reason: undefined }, { action: ACTION_ID, purpose: "request", text: "We request the inspection logs.", reason: undefined });
  assert.equal(p.doc.getElementById("send-text-1").value, "We request the logs for {{period}}.");
  assert.match(text(p), /Your own words/);
  assert.match(text(p), /period: 2025 \(from your own\)/);
  assert.deepEqual(ops(p), ["filingapprove"]);
});

test("R3: filingprepare prepares the filing from the group's template when no text is written", async () => {
  const p = await open(STEP2, { ...DATA_PLANE, filingprepare: ok({ id: FILING, text: "From the template.", template: { id: "TPL-1" }, blanks: [] }) });
  await press(p, "filingprepare");
  assert.deepEqual(last(p, "filingprepare").body, { action: ACTION_ID });
  assert.match(text(p), /From your group's template/);
});

test("R3: 'Approve this text' is terminal: its dialog says approving fixes it and it sends only on confirm, with the edited text", async () => {
  let drafts = [draft()];
  const p = await open(STEP2, { ...DATA_PLANE, filingsfor: () => ok(FILINGS(drafts)), filingapprove: () => { drafts = [draft({ approval: { approved_by: "member:mai", at: "x", sha: "s" } })]; return ok({ filing: FILING }); } });
  assert.match(text(p), /A text was prepared/);
  const b = button(p, "filingapprove");
  await p.click(b);
  assert.equal(p.byOp("filingapprove").length, 0);
  assert.match(text(p, p.root().querySelector('[role="dialog"]')), /Approves this exact text for sending/);
  await press(p, b, { confirm: true });
  assert.deepEqual(last(p, "filingapprove").body, { filing: FILING });
  assert.deepEqual(ops(p), ["filingrecordsent"], "approved: the send step");
});

test("R3: where the project asks a second approval, the screen says it waits and offers filingsecondapprove, never the send; control: once given, the send", async () => {
  const waiting = draft({ approval: { approved_by: "member:dev", at: "x", sha: "s" }, second_needed: true });
  let drafts = [waiting];
  const p = await open(STEP2, { ...DATA_PLANE, filingsfor: () => ok(FILINGS(drafts)), filingsecondapprove: () => { drafts = [{ ...waiting, second_approval: { approved_by: "member:mai" } }]; return ok({}); } });
  assert.match(text(p), /Waiting for a second member's approval/);
  assert.deepEqual(ops(p), ["filingsecondapprove"]);
  await press(p, "filingsecondapprove", { confirm: true });
  assert.deepEqual(last(p, "filingsecondapprove").body, { filing: FILING });
  assert.deepEqual(ops(p), ["filingrecordsent"]);
});

test("R3: 'I have sent it · record the sending' is outward and records the day, how and the office's reference; the screen then says it was sent", async () => {
  let drafts = [draft({ approval: { approved_by: "member:mai", at: "x", sha: "s" } })];
  const p = await open(STEP2, { ...DATA_PLANE, filingsfor: () => ok(FILINGS(drafts)),
    filingrecordsent: () => { drafts = [{ ...drafts[0], sending: { ord: 1, sent_on: "2026-10-10", reference: "R-12" } }]; return ok({}); } });
  const b = button(p, "filingrecordsent");
  assert.match(b.textContent, /I have sent it · record the sending/);
  assert.ok(b.querySelector("svg use[href$='#i-outward']"), "outward mark");
  assert.match(text(p), /Outward · seen outside your group/);
  const r = await press(p, b, { values: { "send-at": "10 Oct" }, reason: "sent" });
  assert.match(beside(p, r), /Give the day you sent it first/);
  await press(p, "filingrecordsent", { values: { "send-at": "2026-10-10", "send-account": "by the office's web form", "send-reference": "R-12" }, reason: "sent" });
  assert.deepEqual({ ...last(p, "filingrecordsent").body, reason: undefined }, { filing: FILING, at: "2026-10-10", account: "by the office's web form", reference: "R-12", reason: undefined });
  assert.match(text(p), /Recorded as sent on 10 October 2026 · reference R-12/);
  assert.deepEqual(ops(p), []);
});
