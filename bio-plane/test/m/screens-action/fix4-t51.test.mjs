/* screens-action, fix round 4 of T51 (K4429): C53-min (the reminder's date defaults to the option's first date), C64-more
   (the office she names herself: one agency box, one entry per name), C64-template and C64-law (a federal request through its
   steps), C65 (the door to keep a sent filing as the team's template) and C14 (this screens' read set). Each test enters by
   the member's act (a press), never by calling an act's done function; every sentence is read by its key (R19). */
import test from "node:test";
import assert from "node:assert/strict";
import { open, main, text, ops, press, last, ok, W, D, DATA_PLANE, ROUTES, PLAN, PLAN_ID, DET, PROJECT, PROFILES, ACTION_ID } from "./page.mjs";

const withPlan = (o) => ({ ...DATA_PLANE, plan: ok({ ...PLAN, ...o }) });
const markBtn = (p, option, disposition) => main(p).querySelectorAll('button[data-act="optiondispose"]').find((b) => b.dataset.option === option && b.dataset.disposition === disposition);

/* ---------- C53-min: choose without touching the reminder's date ---------- */

const TWO_DATES = withPlan({ options: [
  { id: "opt-1", summary: "Public comment", category: "legal", subjects: [`outcome:${DET}#STD-1`], dates: [{ date: "2026-11-30", basis: "law" }, { date: "2026-12-15", basis: "order" }], disposition: "open", dispositions: [], reminders: null, action: null },
  { id: "opt-2", summary: "Story with a reporter", category: "awareness", subjects: [`outcome:${DET}#STD-1`], dates: [{ date: "2026-12-20", basis: "law" }], disposition: "open", dispositions: [], reminders: null, action: null },
  { id: "opt-3", summary: "Write the board", category: "awareness", subjects: [`outcome:${DET}#STD-1`], dates: [], disposition: "open", dispositions: [], reminders: null, action: null }] });

test("R44 (c) (C53-min): choosing an option with a reminder day and the date list left blank succeeds: the reminder is for the option's first date; control: a date picked is the one sent, and no day sends no reminder", async () => {
  const p = await open(ROUTES.plan, { ...TWO_DATES, optiondispose: ok({}) });
  await press(p, markBtn(p, "opt-1", "chosen"), { values: { "plan-rem-on": "2026-11-27" }, reason: "worth it" });
  assert.equal(p.byOp("optiondispose").length, 1, "the choice is sent, not refused");
  assert.deepEqual(last(p, "optiondispose").body, { plan: PLAN_ID, options: ["opt-1"], disposition: "chosen", reason: "worth it",
    reminders: [{ option: "opt-1", date: "2026-11-30", on: "2026-11-27" }] });
  // control: the date she picks is the date sent
  await press(p, markBtn(p, "opt-1", "chosen"), { values: { "plan-rem-date": "opt-1|2026-12-15", "plan-rem-on": "2026-12-01" }, reason: "worth it" });
  assert.deepEqual(last(p, "optiondispose").body.reminders, [{ option: "opt-1", date: "2026-12-15", on: "2026-12-01" }]);
  // control: no day asked, no reminder sent
  await press(p, markBtn(p, "opt-1", "chosen"), { values: { "plan-rem-date": "", "plan-rem-on": "" }, reason: "worth it" });
  assert.ok(!("reminders" in last(p, "optiondispose").body));
});

test("R44 (c) (C53-min): the picked options chosen together with a day and no date each take their own first date; an option with no date takes none", async () => {
  const p = await open(ROUTES.plan, { ...TWO_DATES, optiondispose: ok({}) });
  for (const id of ["opt-1", "opt-2", "opt-3"]) await p.click(p.doc.getElementById(`pick-options-${id}`));
  const hold = main(p).querySelector(".cs-hold").querySelectorAll('button[data-act="optiondispose"]');
  await press(p, hold.find((b) => b.dataset.disposition === "chosen"), { values: { "plan-rem-on": "2026-11-27" }, reason: "all three" });
  assert.deepEqual(last(p, "optiondispose").body.reminders, [{ option: "opt-1", date: "2026-11-30", on: "2026-11-27" }, { option: "opt-2", date: "2026-12-20", on: "2026-11-27" }]);
});

/* ---------- C64-more: the office she names herself (DEC-412): two fields, drawn once, one entry per name ---------- */

const NEW = `/app/request/${PROJECT}`;
const OGIS = "Office of Government Information Services";
/* `entitycreate` as `entities` R65 answers a member's naming: a held office with the same folded name is answered with `existed: true`,
   otherwise one is registered; the plane keeps what it was given, so naming twice meets the first entry */
const namingPlane = () => {
  const held = new Map();
  let n = 0;
  return {
    ...DATA_PLANE, profiles: ok(PROFILES), peopledirectory: ok({ rows: [], truncated: false }), actioncreate: ok({ id: ACTION_ID }),
    entitycreate: (req) => {
      const body = req.body && req.body.json ? req.body.json : req.body || {};
      const key = String(body.label).toLowerCase();
      if (held.has(key)) return ok({ ...held.get(key), existed: true });
      const row = { entity_id: `ENT-2026-${String(++n).padStart(16, "0")}`, label: body.label, kind: "office" };
      held.set(key, row);
      return ok(row);
    },
  };
};
const officeOptions = (p) => p.doc.getElementById("req-office").querySelectorAll("option").map((o) => o.textContent.trim());

test("R20 (C64-more): an office named by its agency alone (no comma, no office within it) is drawn once; the two fields are the agency and the office within it, the entity labelled by both", async () => {
  const p = await open(NEW, namingPlane());
  for (const k of ["screen.request.nameoffice.name", "screen.request.nameoffice.role", "screen.request.nameoffice.role.help", "screen.request.nameoffice.why", "screen.request.nameoffice.why.help"])
    assert.ok(text(p).includes(W(k)), k);
  assert.ok(!text(p).includes(W("shell.reason")), "the note is the design's own (DEC-412), not the kit's reason field");
  await press(p, "entitycreate", { values: { "req-noff-name": OGIS, "req-noff-note": "It answers federal records requests." } });
  assert.equal(last(p, "entitycreate").body.label, OGIS, "the label is the name as typed, not split at a comma");
  assert.deepEqual(officeOptions(p), [OGIS], "drawn once, never 'Office, Office'");
  assert.ok(!text(p).includes(`${OGIS}, ${OGIS}`));
  // an agency and the office within it: both are kept, the office first as every office line draws it
  const q = await open(NEW, namingPlane());
  await press(q, "entitycreate", { values: { "req-noff-name": "City of Oakland", "req-noff-role": "Office of the City Clerk", "req-noff-note": "It holds the council's records." } });
  assert.equal(last(q, "entitycreate").body.label, "City of Oakland, Office of the City Clerk");
  assert.deepEqual(officeOptions(q), ["Office of the City Clerk, City of Oakland"]);
  await press(q, "actioncreate", { values: { "req-what": "Council minutes", "req-office": "0" }, reason: "x" });
  const doc = last(q, "actioncreate").body.document;
  assert.ok(doc.includes('role: "Office of the City Clerk"') && doc.includes('body: "City of Oakland"'));
  // control: a comma in the agency's own name is kept whole (it is no longer a separator)
  const c = await open(NEW, namingPlane());
  await press(c, "entitycreate", { values: { "req-noff-name": "Housing, Planning and Building Department", "req-noff-note": "x" } });
  assert.equal(last(c, "entitycreate").body.label, "Housing, Planning and Building Department");
  assert.deepEqual(officeOptions(c), ["Housing, Planning and Building Department"]);
});

test("R20 (C64-more): naming the same office again returns the first entry, which is the one chosen; a different office within the same agency is another entry", async () => {
  const plane = namingPlane();
  const first = await open(NEW, plane);
  await press(first, "entitycreate", { values: { "req-noff-name": OGIS, "req-noff-note": "x" } });
  await press(first, "actioncreate", { values: { "req-what": "A", "req-office": "0" }, reason: "x" });
  const firstId = /entity_id: "([^"]+)"/.exec(last(first, "actioncreate").body.document)[1];
  const again = await open(NEW, plane);
  await press(again, "entitycreate", { values: { "req-noff-name": ` ${OGIS.toUpperCase()} `, "req-noff-note": "x again" } });
  assert.equal(again.byOp("entitycreate").length, 1);
  assert.deepEqual(ops(again), ["actioncreate"], "chosen at once: what is wanted is asked");
  await press(again, "actioncreate", { values: { "req-what": "B", "req-office": "0" }, reason: "x" });
  assert.equal(/entity_id: "([^"]+)"/.exec(last(again, "actioncreate").body.document)[1], firstId, "the first entry, not another");
  // control: another office within the same agency is not the first one
  const other = await open(NEW, plane);
  await press(other, "entitycreate", { values: { "req-noff-name": OGIS, "req-noff-role": "FOIA Public Liaison", "req-noff-note": "x" } });
  await press(other, "actioncreate", { values: { "req-what": "C", "req-office": "0" }, reason: "x" });
  assert.notEqual(/entity_id: "([^"]+)"/.exec(last(other, "actioncreate").body.document)[1], firstId);
});
