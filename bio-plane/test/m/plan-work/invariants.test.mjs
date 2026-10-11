/* plan-work R12: a machine writes nothing here but R10's marks (through action-plans' planMark) and labelled
   assemblies; every table append-only and declared to purge; no field holds a cost, hours, assignee or score; nothing
   reachable from publication or any public read; no place named in the module's outward text. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { URL } from "node:url";
import { world, code, by, V, MACHINE, option } from "./fixture.mjs";
import { PLAN_WORK_CHECKS, PLAN_WORK_TABLES, DRAFT_LABEL, planWorkOps, planWorkOwns } from "../../../src/plan-work/index.mjs";

/* Every act of the module, with arguments that land for bob. */
function acts(w) {
  const s = w.started({ subjects: [w.S1], dates: [{ date: "2026-11-01", basis: "statute" }] });
  const o = option(w, { summary: "Ask again" });
  const item = w.pw.prepItemAdd({ plan: w.PL, option: o, text: "Find the contract", ...by("bob") }).item;
  return {
    matterOutcomeSet: { plan: w.PL, subject: w.S1, text: "Lights fixed" },
    planReviewRhythm: { plan: w.PL, recurrence: { rrule: "FREQ=WEEKLY", dtstart: "2026-10-05", zone: "UTC" } },
    planReviewRecord: { plan: w.PL, decided: "Wait." },
    prepItemAdd: { plan: w.PL, option: o, text: "Find the minutes" },
    prepItemTakeUp: { plan: w.PL, item },
    prepItemDone: { plan: w.PL, item },
    planComment: { plan: w.PL, on: { option: o }, text: "Fine." },
    statusReportSave: { plan: w.PL, text: "Report." },
    itemTakeUp: { item: { kind: "clock", action: s.action, entry: 0 } },
  };
}

test("R12: a machine or unstamped author writes nothing here: every act refuses it first, and lands for a member", () => {
  const w = world();
  const all = acts(w);
  const rows = w.snapshot();
  for (const [name, args] of Object.entries(all)) {
    for (const author of [MACHINE, "class:ai/tok-1", "", null]) {
      const r = w.pw[name]({ ...args, author, viewer: author || V("bob") });
      assert.equal(code(r), "MACHINE_CANNOT_PLAN", `${name} by ${author}`);
    }
  }
  assert.deepEqual(w.snapshot(), rows, "no machine act wrote anything");
  for (const [name, args] of Object.entries(all)) assert.equal(w.pw[name]({ ...args, ...by("bob") }).ok, true, name);
  /* the assemblies the machine makes are labelled */
  assert.equal(w.pw.statusReportDraft({ plan: w.PL, viewer: V("bob") }).label, DRAFT_LABEL);
});

test("R12: every table is append-only (a later statement adds a row; the earlier stays) and declared to purge, keyed so a plan's purge clears its rows", () => {
  const w = world();
  const all = acts(w);
  for (const [name, args] of Object.entries(all)) w.pw[name]({ ...args, ...by("bob") });
  const tables = PLAN_WORK_TABLES.map((t) => t.name);
  const before = Object.fromEntries(tables.map((t) => [t, w.rows(`SELECT * FROM ${t}`)]));
  for (const [name, args] of Object.entries(all)) if (name !== "prepItemDone" && name !== "prepItemTakeUp") w.pw[name]({ ...args, ...by("alice") });
  for (const t of tables) {
    const now = w.rows(`SELECT * FROM ${t}`);
    for (const r of before[t]) assert.ok(now.some((x) => JSON.stringify(x) === JSON.stringify(r)), `${t}: an earlier row stays as written`);
  }
  const declared = w.record.declaredTables().filter((d) => d.module === "plan-work");
  assert.deepEqual(declared.map((d) => d.name).sort(), [...tables].sort());
  for (const d of declared) assert.equal(d.purge, "clear", d.name);
  assert.ok(tables.every((t) => planWorkOwns(t)));
  /* a single-bundle purge of the plan clears its rows here */
  w.record.purge({ bundleId: w.PL });
  for (const t of tables.filter((x) => x !== "pw_takeups")) assert.equal(w.count(t), 0, t);
});

test("R12: no field holds a cost, hours, assignee or score; such a key is refused at every act that could take one", () => {
  const w = world();
  for (const t of PLAN_WORK_TABLES) {
    const cols = w.rows(`PRAGMA table_info(${t.name})`).map((c) => c.name);
    assert.equal(cols.some((c) => /cost|budget|hours|assignee|score|priority|significance/i.test(c)), false, t.name);
  }
  const all = acts(w);
  for (const name of ["prepItemAdd", "prepItemTakeUp", "itemTakeUp"])
    for (const k of ["assignee", "hours", "cost", "score"])
      assert.equal(code(w.pw[name]({ ...all[name], [k]: 1, ...by("bob") })), "OPTION_KEY_REFUSED", `${name} ${k}`);
});

test("R12: nothing is reachable from publication or any public read: the only registrations are the two at start, and an outsider reads every read as no plan", () => {
  const w = world();
  acts(w);
  assert.deepEqual(Object.keys(w.pw.registered).sort(), ["close_snapshot", "response_listener"]);
  for (const read of ["matters", "planTimeline", "planReviewOpen", "planReviews", "prepItems", "planComments", "whereItStands",
                      "statusReportDraft", "statusReports", "reexaminations"])
    assert.equal(code(w.pw[read]({ plan: w.PL, viewer: V("dave") })), "NO_SUCH_PLAN", read);
  /* the op map holds no public read: every op takes the control plane's viewer stamp */
  const url = new URL(`https://x/?op=whereitstands&plan=${w.PL}`);
  assert.equal(code(planWorkOps(w.pw, url, {}).whereitstands()), "NO_SUCH_PLAN", "no viewer stamped, nothing answered");
});

test("R12: no place is named in the module's outward text", () => {
  const text = JSON.stringify(PLAN_WORK_CHECKS) + JSON.stringify(DRAFT_LABEL);
  assert.doesNotMatch(text, /Oakland|Alameda|California|Port Ellery|Berkeley/i);
  for (const r of Object.values(PLAN_WORK_CHECKS)) assert.match(r.check, /^C-151\.\d+$/);
});
