/* screens-action R4, R8, R10 (and R7 on `request`): a records request in the flow's order, its period, form and cost
   limit sent as `fills`, the portal's warning and number, and an action opened at the step it has reached. Every sentence is
   asserted by its key through `setup-words` (R19). */
const said = (p, key, vars) => assert.ok(text(p).includes(W(key, vars)), key);
import test from "node:test";
import assert from "node:assert/strict";
import { open, main, text, ops, press, last, ok, button, beside, W, D, DATA_PLANE, ACTION, ACTION_ID, PROJECT, FILING, FILINGS, READ, draft } from "./page.mjs";

const NEW = `/app/request/${PROJECT}`;
const AT = `/app/request/${ACTION_ID}`;
const OFFICES = { subject: PROJECT, offices: [
  { addressee: { state: "named", kind: "office", role: "City Clerk", body: "Office of the City Clerk", entity_id: "ENT-1" } },
  { addressee: { state: "named", kind: "office", role: "Director of Public Works", body: "Public Works", entity_id: "ENT-2" } }], suggestion: true };

test("R4: says to look first (a public record is captured instead), then the office by its role, then what is wanted; 'Start the request' creates the action and opens it", async () => {
  const p = await open(NEW, { ...DATA_PLANE, addresseesuggest: ok(OFFICES), actioncreate: ok({ id: ACTION_ID }) });
  said(p, "screen.request.lookfirst");
  assert.ok(main(p).querySelector('a[href="/app/capture"]'));
  assert.deepEqual(ops(p), ["addresseesuggest", "actioncreate"]);
  await press(p, "addresseesuggest");
  assert.deepEqual(last(p, "addresseesuggest").query, { op: "addresseesuggest", subject: PROJECT });
  assert.match(text(p), /Director of Public Works, Public Works/);
  const none = await press(p, "actioncreate", { values: { "req-office": "1" }, reason: "x" });
  assert.ok(beside(p, none).includes(W("screen.request.what.needed")));
  await press(p, "actioncreate", { values: { "req-office": "1", "req-what": "Inspection logs for pothole reports closed in 2025" }, reason: "x" });
  const doc = last(p, "actioncreate").body.document;
  for (const line of ["object_type: action", 'title: "Inspection logs for pothole reports closed in 2025"', `project: ${PROJECT}`, 'action_kind: "records_request"',
    'role: "Director of Public Works"', 'body: "Public Works"', 'entity_id: "ENT-2"', "current_state: planned"]) assert.ok(doc.includes(line), line);
  assert.equal(p.location.pathname, `/app/request/${ACTION_ID}`);
});

test("R4: the law it goes under is chosen among the laws the profile names for a records request, each with its window", async () => {
  const p = await open(AT, { ...DATA_PLANE, actionlaws: ok({}) });
  const opts = p.doc.getElementById("req-law").querySelectorAll("option").map((o) => o.textContent);
  assert.deepEqual(opts, [W("screen.request.law.option", { citation: "Gov. Code § 7922.535(b)", window: W("screen.request.window.calendar", { n: "10" }) }),
    W("screen.request.law.option", { citation: "Mun. Code § 2.20.230", window: W("screen.request.window.business", { n: "3" }) })]);
  await press(p, "actionlaws", { values: { "req-law": "1", "req-level": "city" } });
  assert.deepEqual(last(p, "actionlaws").body, { target: ACTION_ID, laws: [{ level: "city", citation: "Mun. Code § 2.20.230" }] });
  assert.ok(main(p).querySelector('a[href="/app/help-records"]'), "R9: help-records is reached from request");
  // the laws a member stated are `action`'s `governing_laws.laws` (actions R25), drawn above the choice
  const stated = main(p).querySelectorAll("section.cs-section").find((s) => s.textContent.includes(W("screen.request.step.law")));
  assert.ok(stated.querySelector(".cs-sheet").textContent.includes("Gov. Code § 7922.535(b)"));
});

test("R4, R8: 'Prepare the text' sends communicationprepare with the period, the form and the cost limit as fills; 'Approve this text' then follows", async () => {
  let drafts = [];
  const p = await open(AT, { ...DATA_PLANE, filingsfor: () => ok(FILINGS(drafts)),
    communicationprepare: () => { drafts = [draft()]; return ok({ id: FILING, text: "We request the logs.", blanks: [] }); }, filingapprove: ok({}) });
  said(p, "screen.request.describe");
  await press(p, "communicationprepare", { values: { "req-from": "2025-07-01", "req-to": "2026-06-30", "req-form": "spreadsheet", "req-cost": "$25",
    "send-text-0": "We request the inspection logs." }, reason: "ready" });
  assert.deepEqual(last(p, "communicationprepare").body.fills, { period: "2025-07-01 – 2026-06-30", form: "spreadsheet", cost_limit: "$25" });
  assert.equal(last(p, "communicationprepare").body.action, ACTION_ID);
  assert.deepEqual(ops(p).filter((o) => o !== "actionlaws"), ["filingapprove"]);
});

test("R8: the outward warning names that the portal shows the text to anyone; 'I have sent it' takes the portal's request number; control: a malformed number is refused in words", async () => {
  const sent = draft({ approval: { approved_by: "member:mai", at: "x", sha: "s" } });
  const p = await open(AT, { ...DATA_PLANE, filingsfor: ok(FILINGS([sent])), filingrecordsent: (req) => (String(req.body.reference).length > 100
    ? ok({ ok: false, reason: "SENT_REFERENCE_MALFORMED" }) : ok({})) });
  said(p, "screen.request.outward");
  said(p, "screen.request.howsend");
  said(p, "screen.request.reference");
  await press(p, "filingrecordsent", { values: { "send-at": "2026-10-10", "send-account": "on the portal", "send-reference": "26-11902" }, reason: "sent" });
  assert.equal(last(p, "filingrecordsent").body.reference, "26-11902");
  const b = await press(p, "filingrecordsent", { values: { "send-at": "2026-10-10", "send-account": "on the portal", "send-reference": "x".repeat(101) }, reason: "sent" });
  assert.ok(beside(p, b).includes(W("screen.request.reference.malformed")));
});

test("R10 (DEC-212): an action opened at its address opens at the step it has reached: approved and not sent opens at the send; control: nothing prepared opens at the text", async () => {
  const unsent = draft({ approval: { approved_by: "member:mai", at: "2026-10-09", sha: "s" } });
  const p = await open(AT, { ...DATA_PLANE, filingsfor: ok(FILINGS([unsent])) });
  assert.deepEqual(ops(p).filter((o) => o !== "actionlaws"), ["filingrecordsent"]);
  assert.ok(button(p, "filingrecordsent"));
  const q = await open(AT, { ...DATA_PLANE, filingsfor: ok(FILINGS([])) });
  assert.deepEqual(ops(q).filter((o) => o !== "actionlaws"), ["communicationprepare"]);
});

test("R4: control: an action already sent draws its sending and offers no act of the flow but the law", async () => {
  const done = draft({ approval: { approved_by: "member:mai", at: "x", sha: "s" }, sending: { ord: 1, sent_on: "2026-10-02", reference: "26-11902" } });
  const p = await open(AT, { ...DATA_PLANE, action: ok(ACTION), filingsfor: ok(FILINGS([done])) });
  assert.ok(text(p).includes(`${W("screen.start-send.sent", { date: D("2026-10-02") })} · ${W("screen.start-send.reference", { reference: "26-11902" })}`));
  assert.deepEqual(ops(p), ["actionlaws"]);
});

/* R11 (T48; N1034; K3145; filings R59) on `request`: a draft prepared and not yet approved is read again on load. */
test("R11: a request reloaded between preparing and approving draws the same text and fills; control: nothing is prepared again by reading", async () => {
  const prepared = READ({ text: "We request inspection logs for 2025 – 2026.", blanks: [], unfilled: [] });
  const p = await open(AT, { ...DATA_PLANE, filingsfor: ok(FILINGS([draft()])), filingread: ok(prepared), communicationprepare: ok(prepared) });
  assert.equal(p.byOp("filingread")[0].query.filing, FILING);
  assert.equal(p.doc.getElementById("send-text-1").value, "We request inspection logs for 2025 – 2026.");
  assert.deepEqual(ops(p).filter((o) => o === "filingapprove" || o === "communicationprepare"), ["filingapprove"]);
  assert.equal(p.byOp("communicationprepare").length, 0);
});
