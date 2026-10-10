/* investigation R6–R9: status reports, drafted by code from the record since the last one, kept as she keeps them,
   naming no figure about a member, and never required. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, ANN, BOB, DAN, OUT, AI, P1, PH, Q1, Q2, Q3 } from "./fixture.mjs";

test("R6: reportDraft composes by code, with no AI, the steps taken and ended (outcomes, learned lines), what was found and what is waiting, each line citing its source; it writes nothing", () => {
  const w = world();
  const s = w.step();
  w.steps.stepStart({ step: s, by: ANN });
  w.steps.stepEnd({ step: s, end: "ended", outcomes: { [Q1]: "helped" }, learned: "The clerk keeps a paper file.", by: ANN });
  w.steps.stepProduct({ step: s, record: Q2, by: ANN });
  const open = w.step({ work: "Wait for the reply", place: { project: P1 }, by: BOB });
  w.steps.stepWait({ step: open, on: { date: "2026-12-01" }, by: BOB });
  w.leg(Q1, 0, Q2, "supports", "B", "2026-10-09T17:00:00Z");
  w.leg(Q2, 0, Q1, "cuts_against", "C", "2026-10-09T17:00:00Z");
  w.conclusions.set(`${P1}|${Q1}`, [{ act: "concluded", state: "concluded", claim: "The award followed the rule.", at: "2026-10-09T17:30:00Z" }]);
  w.dated.set(Q1, [{ index: 0, text: "the district's reply", date: "2026-11-01", state: "waiting" }]);
  w.docWaits.set(Q2, [{ document: "INFO-2026-0009", by: "bob-h", reason: "illegible", at: NOWISH }]);
  w.inv.milestoneSet({ project: P1, name: "Board meeting", date: "2026-11-14", waitsOn: [Q1], by: ANN });
  const before = w.snapshot();
  const d = w.inv.reportDraft({ project: P1, viewer: ANN });
  assert.equal(w.snapshot(), before, "it writes nothing");
  assert.equal(d.ok, true);
  assert.deepEqual([d.drafted_by, d.machine_work, d.since], ["code", false, null]);
  const sec = (k) => d.lines.filter((l) => l.section === k);
  assert.ok(sec("taken").some((l) => l.source.id === s && l.text.includes("ann-h took a step")));
  assert.ok(sec("ended").some((l) => l.source.id === s && l.text.includes("helped")));
  assert.ok(sec("ended").some((l) => l.text.includes("The clerk keeps a paper file.")));
  assert.ok(sec("found").some((l) => l.source.kind === "record" && l.source.id === Q2 && l.source.step === s), "a product of the step");
  assert.ok(sec("found").some((l) => l.source.kind === "leg" && l.text.includes("supporting")));
  assert.ok(sec("found").some((l) => l.source.kind === "leg" && l.text.includes("cutting against")));
  assert.ok(sec("found").some((l) => l.source.kind === "conclusion" && l.text.includes("The award followed the rule.")));
  assert.ok(sec("waiting").some((l) => l.source.id === open && l.text.includes("2026-12-01")), "a step's wait");
  assert.ok(sec("waiting").some((l) => l.source.kind === "wait" && l.text.includes("the district's reply")), "a question's dated wait (inquiry R55)");
  assert.ok(sec("waiting").some((l) => l.source.kind === "document-wait"), "a document set aside (inquiry R58)");
  assert.ok(sec("waiting").some((l) => l.source.kind === "milestone"), "an open milestone");
  for (const l of d.lines) assert.ok(l.source && l.source.kind && l.source.id, "each line cites its source");
  assert.ok(d.text.includes("Steps taken") && d.text.includes("What is waiting"));
  /* a report on one question carries that question's lines only */
  const q = w.inv.reportDraft({ project: P1, question: Q2, viewer: ANN });
  assert.equal(q.lines.some((l) => l.text.includes("The award followed the rule.")), false);
  assert.ok(q.lines.some((l) => l.source.kind === "document-wait"));
  assert.equal(w.inv.reportDraft({ project: P1, question: Q3, viewer: ANN }).code, "NO_SUCH_QUESTION");
});

const NOWISH = "2026-10-09T17:00:00Z";

test("R6: since the last report kept for the project (or that question in it); only what the viewer may see enters", () => {
  const w = world();
  const s = w.step();
  w.inv.reportKeep({ project: P1, text: "First report.", by: ANN });
  /* after keeping: the step taken before is not taken again; ending it now is */
  w.end(s);
  const t = w.step({ work: "Call the vendor" });
  const d = w.inv.reportDraft({ project: P1, viewer: ANN });
  assert.ok(d.since);
  assert.deepEqual(d.lines.filter((l) => l.section === "taken").map((l) => l.source.id), [t]);
  assert.deepEqual(d.lines.filter((l) => l.section === "ended").map((l) => l.source.id), [s]);
  /* a question's report runs from that question's last report, not the project's */
  assert.equal(w.inv.reportDraft({ project: P1, question: Q1, viewer: ANN }).since, null);
  /* sight: a step Bob may not see (a group's other project) never enters; a hidden project's draft is absent to an outsider */
  w.drawn.set(P1, [{ inquiry: Q1 }, { inquiry: Q2 }]);
  assert.equal(w.inv.reportDraft({ project: PH, viewer: ANN }).code, "NO_SUCH_PROJECT");
  assert.equal(w.inv.reportDraft({ project: P1, viewer: DAN }).code, "PROJECT_SEEN_NOT_A_PARTICIPANT");
  /* a leg on a record the viewer may not see is left out */
  w.bundle("INFO-2026-0005-x", { type: "information", project: PH });
  w.leg(Q1, 1, "INFO-2026-0005-x", "supports", "A", "2099-01-01T00:00:00Z");
  assert.equal(w.inv.reportDraft({ project: P1, viewer: ANN }).lines.some((l) => l.text.includes("INFO-2026-0005-x")), false);
});

test("R7: reportKeep, by a joined participant, kept as she keeps it, dated, with its author, never edited after; reportsOf answers the participants", () => {
  const w = world();
  const before = w.snapshot();
  assert.equal(w.inv.reportKeep({ project: P1, text: "", by: ANN }).code, "REPORT_NO_TEXT");
  assert.equal(w.inv.reportKeep({ project: P1, text: "x".repeat(20001), by: ANN }).code, "REPORT_NO_TEXT");
  assert.equal(w.inv.reportKeep({ project: P1, text: "t", since: "yesterday", by: ANN }).code, "REPORT_BAD_SINCE");
  assert.equal(w.inv.reportKeep({ project: P1, text: "t", since: "2099-01-01T00:00:00Z", by: ANN }).code, "REPORT_BAD_SINCE");
  assert.equal(w.inv.reportKeep({ project: P1, text: "t", question: Q3, by: ANN }).code, "NO_SUCH_QUESTION");
  assert.equal(w.inv.reportKeep({ project: P1, text: "t", by: OUT }).code, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(w.inv.reportKeep({ project: P1, text: "t", by: AI }).code, "INVESTIGATION_MEMBER_ONLY");
  assert.equal(w.snapshot(), before);
  const draft = w.inv.reportDraft({ project: P1, viewer: BOB });
  const text = `${draft.text}\n\nMy own words: we are close.`;
  const r = w.inv.reportKeep({ project: P1, text, by: BOB });
  assert.equal(r.ok, true);
  const second = w.inv.reportKeep({ project: P1, question: Q1, text: "On Q1: corrected.", corrects: r.report, by: ANN });
  const list = w.inv.reportsOf({ project: P1, viewer: OUT }).reports;
  assert.deepEqual(list.map((x) => [x.report, x.author, x.question]), [[second.report, "ann-h", Q1], [r.report, "bob-h", null]]);
  assert.equal(list[1].text, text, "kept exactly as she kept it");
  assert.equal(list[0].corrects, r.report, "a later report corrects; the earlier stands");
  assert.throws(() => w.st.sql.exec(`UPDATE inv_reports SET text = 'changed' WHERE report_id = ?`, r.report), /never edited/);
  assert.equal(w.inv.reportsOf({ project: P1, viewer: DAN }).code, "PROJECT_SEEN_NOT_A_PARTICIPANT");
  assert.equal(w.inv.reportsOf({ project: PH, viewer: ANN }).code, "NO_SUCH_PROJECT");
  /* no service edits or deletes a report */
  assert.equal(Object.getOwnPropertyNames(Object.getPrototypeOf(w.inv)).some((n) => /^report(Edit|Revise|Delete|Remove)/.test(n)), false);
});

test("R8: no draft or report states a figure about an individual member: handles appear only as attribution, never counted, ranked or compared", () => {
  const w = world();
  for (let i = 0; i < 3; i++) w.end(w.step({ work: `Ann's step ${i}` }));
  w.end(w.step({ work: "Bob's step", by: BOB }), "ended", BOB);
  const d = w.inv.reportDraft({ project: P1, viewer: ANN });
  /* every mention of a handle is an attribution of one act */
  for (const l of d.lines) {
    const hs = (l.text.match(/\b(ann|bob)-h\b/g) ?? []);
    assert.ok(hs.length <= 1, l.text);
    if (hs.length) assert.match(l.text, /^(ann|bob)-h (took a step|wrote what was learned):/);
  }
  const words = JSON.stringify(d);
  assert.equal(/\b\d+ (steps|acts|reports)\b/.test(words), false, "nothing counted");
  assert.equal(/"(per_member|by_member|counts?|tally|rank|share)"/.test(words), false);
  assert.equal(/most active|fewest|more than|ranked/.test(words), false);
  /* the negative control: the acts are there, attributed */
  assert.equal(d.lines.filter((l) => l.text.startsWith("ann-h took a step")).length, 3);
  assert.equal(JSON.stringify(w.inv.reportsOf({ project: P1, viewer: ANN })).includes("count"), false);
});

test("R9: no report is required or scheduled; nothing reminds anyone to write one", () => {
  const w = world();
  w.end(w.step());
  /* no notice-producer read here answers anything about reports */
  const at = "2026-12-01T18:00:00Z";
  const due = w.inv.milestonesOverdue({ viewer: ANN, at });
  assert.equal(JSON.stringify(due).includes("report"), false);
  assert.equal(JSON.stringify(w.inv.quietPrompts({ viewer: ANN, at })).includes("report"), false);
  const names = Object.getOwnPropertyNames(Object.getPrototypeOf(w.inv));
  assert.equal(names.some((n) => /report(Due|Reminder|Schedule|sDue|Owed)/i.test(n)), false);
  /* a project with no report is answered as such, never as overdue */
  assert.deepEqual(w.inv.reportsOf({ project: P1, viewer: ANN }).reports, []);
  /* the negative control: a member may keep one whenever she chooses */
  assert.equal(w.inv.reportKeep({ project: P1, text: "When I chose to.", by: ANN }).ok, true);
});
