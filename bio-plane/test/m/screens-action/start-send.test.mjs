/* screens-action R2, R3 (and R7 on `start-send`): Step 1, what starting does, first, with every refusal resolved in place,
   and nothing run before the member's confirm; Step 2, prepare, approve, the second approval, and record the sending.
   Every sentence is asserted by its key through `setup-words` (R19). */
const said = (p, key, vars) => assert.ok(text(p).includes(W(key, vars)), key);
import test from "node:test";
import assert from "node:assert/strict";
import { open, main, text, ops, press, last, ok, refused, refusedIn, button, beside, fill, W, D, DATA_PLANE, PREVIEW, PLAN_ID, ACTION_ID, FILING, FILINGS, READ, draft } from "./page.mjs";

const STEP1 = `/app/start-send/${PLAN_ID}~opt-1`;
const STEP2 = `/app/start-send/${ACTION_ID}`;

test("R2: Step 1 reads optionstartpreview first and draws the kind, the office by its role, what it rests on with each matter's state, the clock and the breach", async () => {
  const p = await open(STEP1, DATA_PLANE);
  assert.deepEqual(p.byOp("optionstartpreview")[0].body, { plan: PLAN_ID, option: "opt-1", kind: "records_request", breach: false });
  const t = text(p);
  for (const s of [W("screen.start-send.title", { option: "Records request: inspection logs" }), W("screen.start-send.nothingruns"), W("screen.start-send.kind.records_request"),
    `City Clerk, Office of the City Clerk · ${W("screen.start-send.byrole")}`, `INQ-2026-ffffffffffffffff · ${W("screen.plan.support.hypothetical")}`,
    `${D("2026-10-24")} · the records law's ten days`, W("screen.start-send.breach") + W("screen.start-send.breach.no")]) assert.ok(t.includes(s), s);
  assert.deepEqual(ops(p), ["optionstartpreview", "optionstart"]);
});

test("R2 (v0.2 rules 1–3): a refusal starting would meet is drawn first; the member resolves it in place: the breach unticked, or a reason to proceed anyway, which the preview then states", async () => {
  const refusal = { ok: false, reason: "BREACH_ON_HYPOTHESIS", code: "BREACH_ON_HYPOTHESIS", translation: "A breach claim rests on an established matter." };
  const p = await open(STEP1, { ...DATA_PLANE, optionstartpreview: (req) => ok(req.body.premise_override
    ? { ...PREVIEW, action: { ...PREVIEW.action, breach: true, premise_override: req.body.premise_override } }
    : { ...PREVIEW, would_start: false, refusal, action: { ...PREVIEW.action, breach: req.body.breach } }) });
  const first = main(p).querySelector(".cs-gap");
  assert.ok(first && first.textContent.includes(W("screen.start-send.wouldrefuse")) && first.textContent.includes("A breach claim rests on an established matter"));
  assert.ok(first.textContent.includes(W("screen.start-send.resolve")));
  assert.ok(main(p).innerHTML.indexOf("cs-gap") < main(p).innerHTML.indexOf("mk-dl"), "the refusal comes first");
  await press(p, "optionstartpreview", { values: { "start-breach-0": true, "start-override": "the logs are public already" } });
  assert.deepEqual(last(p, "optionstartpreview").body, { plan: PLAN_ID, option: "opt-1", kind: "records_request", breach: true, premise_override: { reason: "the logs are public already" } });
  assert.equal(main(p).querySelector(".cs-gap"), null, "resolved");
  said(p, "screen.start-send.override.stated");
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
  assert.ok(beside(q, c).includes(W("refusal.OPTION_NOT_CHOSEN")), "by the design's word for the code");
  assert.equal(q.location.pathname, STEP1);
});

test("R3: Step 2 prepares what is sent (her own words, labelled; each filled blank naming its source), then offers only its approval", async () => {
  let drafts = [];
  const p = await open(STEP2, { ...DATA_PLANE, filingsfor: () => ok(FILINGS(drafts)),
    communicationprepare: () => { drafts = [draft()]; return ok({ id: FILING, action: ACTION_ID, form: "communication", text: "We request the logs for {{period}}.",
      blanks: [{ name: "period", value: "2025", source: "fills:member:mai", label: { kind: "member_fill", by: "member:mai" } },
        { name: "office", value: "City Clerk", source: ACTION_ID }], disclosure: { machine: false } }); } });
  assert.deepEqual(ops(p), ["communicationprepare", "filingprepare"]);
  said(p, "screen.start-send.nosend");
  const b = await press(p, "communicationprepare", { reason: "ready" });
  assert.ok(beside(p, b).includes(W("screen.start-send.text.needed")));
  assert.equal(p.byOp("communicationprepare").length, 0);
  await press(p, "communicationprepare", { values: { "send-text-0": "We request the inspection logs." }, reason: "ready" });
  assert.deepEqual({ ...last(p, "communicationprepare").body, reason: undefined }, { action: ACTION_ID, purpose: "request", text: "We request the inspection logs.", reason: undefined });
  assert.equal(p.doc.getElementById("send-text-1").value, "We request the logs for {{period}}.");
  said(p, "screen.start-send.draft.own");
  said(p, "screen.start-send.blank.own", { name: "period", value: "2025" }); // a member's fill is labelled hers, not given a source
  said(p, "screen.start-send.blank", { name: "office", value: "City Clerk", source: ACTION_ID }); // a filled blank names its source
  assert.deepEqual(ops(p), ["filingapprove"]);
});

test("R3: filingprepare prepares the filing from the group's template when no text is written", async () => {
  const p = await open(STEP2, { ...DATA_PLANE, filingprepare: ok({ id: FILING, text: "From the template.", template: { id: "TPL-1" }, blanks: [] }) });
  await press(p, "filingprepare");
  assert.deepEqual(last(p, "filingprepare").body, { action: ACTION_ID });
  said(p, "screen.start-send.draft.template");
});

test("R3: 'Approve this text' is terminal: its dialog says approving fixes it and it sends only on confirm, with the edited text", async () => {
  let drafts = [draft()];
  const p = await open(STEP2, { ...DATA_PLANE, filingread: ok(READ()), filingsfor: () => ok(FILINGS(drafts)), filingapprove: () => { drafts = [draft({ approval: { approved_by: "member:mai", at: "x", sha: "s" } })]; return ok({ filing: FILING }); } });
  assert.equal(p.doc.getElementById("send-text-1").value, "We request the logs for 2025.", "R11: the text it was prepared with");
  const b = button(p, "filingapprove");
  await p.click(b);
  assert.equal(p.byOp("filingapprove").length, 0);
  assert.ok(text(p, p.root().querySelector('[role="dialog"]')).includes(W("act.filingapprove.does")), "the dialog states what approving does");
  await press(p, b, { confirm: true });
  assert.deepEqual(last(p, "filingapprove").body, { filing: FILING });
  assert.deepEqual(ops(p), ["filingrecordsent"], "approved: the send step");
});

test("R3: where the project asks a second approval, the screen says it waits and offers filingsecondapprove, never the send; control: once given, the send", async () => {
  const waiting = draft({ approval: { approved_by: "member:dev", at: "x", sha: "s" }, second_needed: true });
  let drafts = [waiting];
  const p = await open(STEP2, { ...DATA_PLANE, filingsfor: () => ok(FILINGS(drafts)), filingsecondapprove: () => { drafts = [{ ...waiting, second_approval: { approved_by: "member:mai" } }]; return ok({}); } });
  said(p, "screen.start-send.waitsecond");
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
  assert.ok(b.textContent.includes(W("screen.start-send.recordsent")));
  assert.ok(b.querySelector("svg use[href$='#i-outward']"), "outward mark");
  said(p, "screen.start-send.outward");
  const r = await press(p, b, { values: { "send-at": "10 Oct" }, reason: "sent" });
  assert.ok(beside(p, r).includes(W("screen.start-send.sentat.needed")));
  await press(p, "filingrecordsent", { values: { "send-at": "2026-10-10", "send-account": "by the office's web form", "send-reference": "R-12" }, reason: "sent" });
  assert.deepEqual({ ...last(p, "filingrecordsent").body, reason: undefined }, { filing: FILING, at: "2026-10-10", account: "by the office's web form", reference: "R-12", reason: undefined });
  assert.ok(text(p).includes(`${W("screen.start-send.sent", { date: D("2026-10-10") })} · ${W("screen.start-send.reference", { reference: "R-12" })}`));
  assert.deepEqual(ops(p), []);
});

test("R3 (op-grades R18; interface-shell R50): at the phone width, 'I have sent it' is read, not done: what it does is drawn and nothing is sent", async () => {
  const drafts = [draft({ approval: { approved_by: "member:mai", at: "x", sha: "s" } })];
  const p = await open(STEP2, { ...DATA_PLANE, filingsfor: ok(FILINGS(drafts)), filingrecordsent: ok({}) }, { phone: true });
  assert.equal(button(p, "filingrecordsent"), null, "no button to press");
  said(p, "act.filingrecordsent.does");
  assert.equal(p.byOp("filingrecordsent").length, 0);
  const wide = await open(STEP2, { ...DATA_PLANE, filingsfor: ok(FILINGS(drafts)) });
  assert.ok(button(wide, "filingrecordsent"), "control: drawn as an act on a wider screen");
});

/* ---------- R11 (T48; N1034; K3145; filings R59): a prepared draft is read again on load ---------- */

test("R11: prepare, reload, and the same text, blanks with their sources, unfilled blanks with why, the member's fills, the advisory and the offers are drawn; nothing is prepared again by reading", async () => {
  let drafts = [];
  const prepared = READ({ advisory: "A demand is a Tier 2 act: a lawyer's view helps.", offers: ["counsel_packet"] });
  const first = await open(STEP2, { ...DATA_PLANE, filingsfor: () => ok(FILINGS(drafts)),
    communicationprepare: () => { drafts = [draft()]; return ok(prepared); } });
  await press(first, "communicationprepare", { values: { "send-text-0": "We request the logs for {{period}}." }, reason: "ready" });
  const shown = (p) => ({ text: p.doc.getElementById("send-text-1").value, page: text(p) });
  const before = shown(first);
  // the reload: a new page over the same record, the draft now held and approved by no one
  const again = await open(STEP2, { ...DATA_PLANE, filingsfor: () => ok(FILINGS(drafts)), filingread: ok(prepared),
    communicationprepare: ok(prepared), filingprepare: ok(prepared) });
  const after = shown(again);
  assert.equal(again.byOp("filingread").length, 1, "read once");
  assert.equal(again.byOp("filingread")[0].query.filing, FILING);
  assert.equal(after.text, before.text);
  assert.equal(after.text, "We request the logs for 2025.");
  for (const s of [W("screen.start-send.blank.own", { name: "period", value: "2025" }), W("screen.start-send.blank", { name: "office", value: "City Clerk", source: ACTION_ID }),
    W("screen.start-send.unfilled", { names: "cost_limit" }), W("screen.start-send.unfilled.why", { name: "cost_limit", why: "the record holds no value for this blank: the member fills it in" }),
    W("screen.start-send.advisory", { advisory: "A demand is a Tier 2 act: a lawyer's view helps." }), W("screen.start-send.offer.counsel_packet"),
    W("screen.start-send.draft.own")]) assert.ok(after.page.includes(s), s);
  assert.deepEqual(ops(again), ["filingapprove"]);
  assert.equal(again.byOp("communicationprepare").length + again.byOp("filingprepare").length, 0, "control: reading prepares nothing");
});

test("R11: NO_SUCH_FILING is drawn as 'Nothing is here'; a read that failed is drawn as failed; either way nothing is offered to approve", async () => {
  const held = ok(FILINGS([draft()]));
  const gone = await open(STEP2, { ...DATA_PLANE, filingsfor: held, filingread: refused("NO_SUCH_FILING", "No such draft.", 404) });
  said(gone, "shell.unavailable.nothing");
  assert.ok(!ops(gone).includes("filingapprove"));
  const failed = await open(STEP2, { ...DATA_PLANE, filingsfor: held, filingread: refused("STORE_DID_NOT_ANSWER", null, 502) });
  assert.ok(main(failed).querySelector('[data-state="failed"]'));
  assert.ok(!ops(failed).includes("filingapprove"));
  const fine = await open(STEP2, { ...DATA_PLANE, filingsfor: held, filingread: ok(READ()) });
  assert.ok(ops(fine).includes("filingapprove"), "control: a draft that reads is offered for approval");
});

test("R11: a draft already approved is not read again; control: a page with no draft reads none", async () => {
  const approved = await open(STEP2, { ...DATA_PLANE, filingsfor: ok(FILINGS([draft({ approval: { approved_by: "member:mai", at: "x", sha: "s" } })])), filingread: ok(READ()) });
  assert.equal(approved.byOp("filingread").length, 0);
  const none = await open(STEP2, { ...DATA_PLANE, filingread: ok(READ()) });
  assert.equal(none.byOp("filingread").length, 0);
});
