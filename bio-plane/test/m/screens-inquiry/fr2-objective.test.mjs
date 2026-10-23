/* screens-inquiry fix round 2 (T51), the `objective` screen: C58 (R106: a flow must exist before a measure names it, the open form
 * survives choosing a flow, and how it is going is read and drawn) and C62 (R106: the crumb names the project). On interface-shell's
 * served page over a scripted plane. Words by key (R44): each expectation is `word(key, vars)`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { word } from "../../../src/setup-words/index.mjs";
import { SCREENS } from "../../../src/screens-inquiry/index.mjs";
import { boot, ok, refusedIn } from "../interface-shell/harness.mjs";
import { fill } from "./fixtures.mjs";

const P = "PROJ-2026-0007";
const AT = "/app/objective/" + P;
const NOCOND = { ok: true, project: P, objective: "Whether the city kept the terms of its lease.", condition: null, computable: false, why: "x",
  matched: null, meeting: null, short: null, undetermined: null, satisfied: null, computed_at: "2026-10-20T09:00:00Z" };
const COND = { progression: "PRG-rent", entity: "ENT-city", relation: null, filter: null, required: { grade: "B", stages: ["authorized"] }, satisfied: { share: 90 } };
const PROJECT_MD = ["---", `id: ${P}`, "object_type: project", "title: \"Pothole repairs\"", "---", "", "## Summary", ""].join("\n");
const NONE = { ok: true, count: 0, items: [], entities: [], truncated: false };
function plane(o = {}) {
  return {
    objectiveprogress: ok(NOCOND), objectivegaps: ok({ ok: true, project: P, condition: null, gaps: [] }),
    intentproposals: ok({ ok: true, project: P, proposals: [], count: 0, set_aside: [] }),
    aspirations: ok({ ok: true, project: P, aspirations: [], departures: [] }), list: ok({ bundles: [] }),
    progressions: ok(NONE), entitieskind: ok(NONE),
    image: (r) => ok(r.query.id === P ? { "bundle.md": PROJECT_MD } : null),
    projectparticipants: ok({ ok: true, projectId: P, participants: [{ handle: "dev", state: "joined", owner: 1 }, { handle: "mai", state: "joined", owner: 0 }] }),
    assistantstate: ok({ on: true }), accountreference: ok({ held: true }),
    ...o,
  };
}
const open = async (o = {}) => { const p = await boot({ screens: SCREENS, plane: plane(o), path: AT }); await p.settle(); return p; };
const main = (p) => p.doc.getElementById("cs-main");
const FLOWS = { progressions: ok({ ok: true, count: 2, items: [{ progression_key: "PRG-rent", label: "Lease rent flow", stages: [] }, { progression_key: "PRG-permits", label: "Permit flow", stages: [] }], truncated: false }) };

test("C62 R106 the objective's crumb names the project from the project's own title, not its id; control: a project with no title draws no id", async () => {
  const p = await open();
  const crumbs = p.root().querySelector(".cs-crumbs");
  assert.ok(crumbs.textContent.includes("Pothole repairs"), "the project's name is in the crumb");
  assert.ok(!crumbs.textContent.includes(P), "never its id");
  const bare = await open({ image: ok(null) });
  assert.ok(!bare.root().querySelector(".cs-crumbs").textContent.includes(P));
});

test("C58 R106 a flow typed where the group holds none draws the flow-must-exist sentence beside the field before anything is sent; control: a picker of held flows draws it not", async () => {
  const p = await open();
  assert.equal(p.doc.getElementById("ob-flow").localName, "input");
  assert.ok(main(p).querySelector('[data-note="flowfirst"]'), "the note is drawn");
  assert.ok(main(p).querySelector('[data-note="flowfirst"]').textContent.includes(word("refusal.INTENT_NO_SUCH_PROGRESSION")));
  assert.equal(p.byOp("objectivecondition").length, 0);
  /* and the plane's refusal of a typed name is that sentence too, never the plane's own jargon */
  const r = await open({ objectivecondition: refusedIn("INTENT_NO_SUCH_PROGRESSION", "the condition names a progression and an entity the record has not declared") });
  fill(r, { "ob-flow": "rent", "ob-ent": "city", "ob-share": "50", "ob-why": "Because." });
  await r.click(main(r).querySelectorAll('button[data-act="objectivecondition"]')[0]);
  const said = main(r).querySelectorAll('[role="alert"]').map((e) => e.textContent).join(" ");
  assert.ok(said.includes(word("refusal.INTENT_NO_SUCH_PROGRESSION")));
  assert.ok(!/progression|entity/i.test(said.replace(word("refusal.INTENT_NO_SUCH_PROGRESSION"), "")), "no jargon beside it");
  const held = await open(FLOWS);
  assert.equal(held.doc.getElementById("ob-flow").localName, "select");
  assert.equal(main(held).querySelector('[data-note="flowfirst"]'), null, "control: flows exist, no note");
});

test("C58 R106 choosing a flow redraws the page with the measure's fold still open and the flow chosen; control: a page nobody touched has it closed", async () => {
  const p = await open(FLOWS);
  const fold = () => main(p).querySelectorAll("details").find((d) => d.querySelector("summary") && d.querySelector("summary").textContent === word("screen.objective.set-how-success-is-measured"));
  assert.ok(fold() && fold().getAttribute("open") === null, "closed at first");
  fold().setAttribute("open", "");
  const sel = p.doc.getElementById("ob-flow");
  sel.value = "PRG-permits";
  p.fire(sel, "change");
  await p.settle();
  assert.equal(p.doc.getElementById("ob-flow").value, "PRG-permits", "the flow chosen stays");
  assert.notEqual(fold().getAttribute("open"), null, "the fold stays open");
});

test("C58 R106 how it is going is read and drawn from the progress read: counts when it is computed, the not-counted-yet note when no measure is set; control: no read, no section", async () => {
  const PROG = { ...NOCOND, condition: COND, computable: true, matched: 12, meeting: 9, satisfied: false, computed_at: "2026-10-20T09:00:00Z",
    short: [{ entity_id: "ENT-p1", entity_label: "Invoice 1", grade: "C", why: { stages_missing: ["authorized"] } }], undetermined: [] };
  const p = await open({ ...FLOWS, objectiveprogress: ok(PROG), progression: ok({ ok: true, found: true, progression_key: "PRG-rent", label: "Lease rent flow", stages: [{ stage_key: "authorized", label: "Council signed off" }] }) });
  const sec = main(p).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word("screen.objective.how-it-is-going"));
  assert.ok(sec, "the section is drawn");
  assert.ok(sec.textContent.includes(word("screen.objective.rent-payments-meet-the-measure-are-short", { met: "9", short: "1" })));
  /* a measure nothing matches: the plane's own words for it fill the section, which is never blank */
  const ZERO = { ...PROG, matched: 0, meeting: 0, short: [], satisfied: null, satisfied_why: "No instance matches the measure yet." };
  const z = await open({ ...FLOWS, objectiveprogress: ok(ZERO) });
  const sz = main(z).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word("screen.objective.how-it-is-going"));
  assert.ok(sz && sz.textContent.includes("No instance matches the measure yet."));
  const none = await open();
  const s2 = main(none).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word("screen.objective.how-it-is-going"));
  assert.ok(s2.textContent.includes(word("screen.objective.not-counted-yet-no-measure-of-success-is-set")));
  const failed = await open({ objectiveprogress: refusedIn("SOME_REFUSAL", "x") });
  assert.equal(main(failed).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word("screen.objective.how-it-is-going")), undefined);
});
