/* screens-action T51 fix round 2, the causes of wave 1 (cause-action-t51): C62 (Start and send step 2 names its project), C63 (a plan's checks name an
   option or a phase by its place, never by its id), C65 (the screen's template act sends the scope the rule accepts), C66 (a reply's words and quote
   shown back; "Show the routes" says when none). Behaviour at the interface only; every sentence is read by its key (R19). */
import test from "node:test";
import assert from "node:assert/strict";
import { open, main, crumbs, text, ok, W, D, DATA_PLANE, PLAN, PLAN_ID, ACTION_ID, PROJECT, DET } from "./page.mjs";

const said = (p, key, vars) => assert.ok(text(p).includes(W(key, vars)), key);
const unsaid = (p, key, vars) => assert.ok(!text(p).includes(W(key, vars)), key);
const withPlan = (o) => ({ ...DATA_PLANE, plan: ok({ ...PLAN, ...o }) });

test("R2, R3 (C62): Start and send step 2 names its project in the path, as step 1 does; control: an action in no project names none", async () => {
  const step2 = await open(`/app/start-send/${ACTION_ID}`, DATA_PLANE);
  assert.deepEqual(crumbs(step2).slice(1, 2), ["Pothole repairs"], "step 2 names the action's project by its title");
  const step1 = await open(`/app/start-send/${PLAN_ID}~opt-1`, DATA_PLANE);
  assert.deepEqual(crumbs(step1).slice(1, 2), ["Pothole repairs"]);
  const bare = await open(`/app/start-send/${ACTION_ID}`, { ...DATA_PLANE, action: ok({ ...DATA_PLANE.action.json.result, project: null }) });
  assert.ok(!crumbs(bare).includes("Pothole repairs"), "no project: no project step");
});

test("R1 (C63): a plan's checks name the option or the phase by its place in the list, never by its id ('opt-1', 'p1'); control: a check the data cannot name keeps the plan's own sentence", async () => {
  const checks = [
    { check: "date_past", option: "opt-1", date: "2026-11-30", says: "opt-1's regulated date 2026-11-30 has passed (law)" },
    { check: "outward_on_hypothesis", option: "opt-2", says: "opt-2 addresses someone outside the team" },
    { check: "no_hostile_branch", scenario: 1, phase: "p1", says: "phase p1 addresses someone outside the team" },
    { check: "unbranched", scenario: 1, phase: "p1", outcomes: ["not_met"], says: "phase p1's checkpoint leads nowhere when judged not_met" },
    { check: "date_before_phase", scenario: 1, phase: "p1", option: "opt-1", date: "2026-11-30", says: "opt-1's regulated date falls before phase p1 can start (2026-12-01)" },
  ];
  const p = await open("/app" + `/plan/${PLAN_ID}`, withPlan({ checks }));
  const strip = text(p, main(p).querySelector(".mk-checks2"));
  // the design's own sentence for a hostile response spells a code in its words ("not_met", a WORDS row for the design stream); the fills are what is mapped here
  const own = W("action-plans.index.phase_id_addresses_someone_outside", { id: "Phase 1" });
  const drawn = strip.replace(own, "").replace("opt-1's regulated date falls before phase p1 can start (2026-12-01)", "");
  for (const raw of ["opt-1", "opt-2", "p1", "not_met"]) assert.ok(!drawn.includes(raw), `${raw} is not drawn`);
  const name = PLAN.options[0].summary;
  assert.ok(strip.includes(W("action-plans.says.regulated_date_passed", { id: name, date: D("2026-11-30"), basis: "law" })));
  assert.ok(strip.includes(W("action-plans.says.addresses_someone_outside", { id: PLAN.options[1].summary })));
  assert.ok(strip.includes(own), "the phase by its place");
  assert.ok(strip.includes(W("action-plans.says.phase_checkpoint_leads", { id: "Phase 1", miss: W("screen.plan.judged.not_met") })));
  // control: the check whose sentence needs a fact the data does not carry (the day the phase can start) is drawn in the plan's own words
  assert.ok(strip.includes("opt-1's regulated date falls before phase p1 can start (2026-12-01)"));
});
