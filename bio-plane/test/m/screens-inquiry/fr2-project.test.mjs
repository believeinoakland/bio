/* screens-inquiry fix round 2 (T51), the `project` screen: C43 (R39, R116: a question's card names its title and its strength once,
 * never the record id), C63 (R1, R36: Plan what to do opens the plan page), C90 (R75, R29: a sole owner's Stand down is not offered).
 * On interface-shell's served page over a scripted plane; every expectation is a word read by key (R44). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, fill, press, says, section, word, SCREENS, P, Q, Q2, D } from "./fixtures.mjs";

const at = "/app/project/" + P;
const cardOf = (p, q) => section(p, "screen.project.questions.head").querySelectorAll(".cs-row").find((r) => r.querySelector(`a[href$="${q}"]`));
const everything = (el) => el.outerHTML;

test("C43 R39 R116 a question's card on the project page draws no record id and the unrated reason once, where the plane's detail names ids", async () => {
  const detail = `${Q} sentinel-head-zz: ${D} sentinel-tail-zz`;
  const unrated = { state: "unrated", detail, not_load_bearing: [{ target_id: D }], population: 1 };
  const p = await open(at, { plane: { inquirystrength: (r) => ok({ ok: true, target: r.query.id, capture: unrated, connection: unrated }) } });
  const card = cardOf(p, Q);
  assert.ok(card, "the question's card is drawn");
  assert.ok(card.textContent.includes("Is the city repairing"), "the card names the question by its title");
  const html = card.outerHTML.replace(/href="[^"]*"/g, "");
  assert.ok(!/INQ-\d|INFO-\d/.test(html), "no record id in what the card draws (text or tips)");
  assert.equal(card.querySelectorAll('.cs-gap[data-gap="unrated"]').length, 2, "both axes keep their mark");
  assert.ok(!card.textContent.includes("sentinel-head-zz"), "the plane's long sentence for the quiet axes is not repeated on the card");
  /* an undetermined reason the plane gives for both axes is told once */
  const und = { state: "undetermined", detail: `its owner has not settled ${D}` };
  const q = await open(at, { plane: { inquirystrength: (r) => ok({ ok: true, target: r.query.id, capture: und, connection: und }) } });
  const c2 = cardOf(q, Q);
  assert.equal(c2.querySelectorAll('.cs-gap[data-gap="undetermined"]').length, 2, "both axes keep their mark");
  assert.equal(c2.textContent.split("its owner has not settled").length - 1, 1, "the same reason is drawn once");
  assert.ok(!/INQ-\d|INFO-\d/.test(c2.outerHTML.replace(/href="[^"]*"/g, "")));
});

test("C43 R39 control: a graded card keeps its two grades and its title", async () => {
  const p = await open(at);
  const card = cardOf(p, Q);
  assert.deepEqual(card.querySelectorAll(".cs-grade").map((g) => g.textContent.slice(-1)), ["B", "C"]);
  assert.ok(card.textContent.includes("Is the city repairing"));
});

/* the screens of other modules a press opens: stand-ins, so the page serves them and navigation lands */
const stub = (id) => ({ id, reads: () => ({}), render: () => "", acts: [], words: [] });
const SERVED = { boot: { screens: [...SCREENS, stub("plan")] } };

test("C63 R1 R36 Plan what to do opens the plan page it made; a refused or unanswered press stays on the project and opens none (control)", async () => {
  const p = await open(at, { ...SERVED, plane: { planopen: ok({ ok: true, id: "PLAN-2026-0004", title: "Ask the committee" }) } });
  fill(p, { "project-plan": "Ask the committee", "project-plan-about": Q });
  await press(p, "planopen");
  assert.deepEqual(p.byOp("planopen")[0].body, { project: P, title: "Ask the committee", subjects: [{ kind: "inquiry", inquiry: Q }] });
  assert.equal(p.location.pathname, "/app/plan/PLAN-2026-0004", "the plan page opens with the plan as subject");
  /* control: an empty title sends nothing and the project stays */
  const c = await open(at, { ...SERVED, plane: { planopen: ok({ ok: true, id: "PLAN-2026-0004" }) } });
  await press(c, "planopen");
  assert.equal(c.byOp("planopen").length, 0);
  assert.equal(c.location.pathname, at);
  /* control: an answer with no plan id opens nothing */
  const n = await open(at, { ...SERVED, plane: { planopen: ok({ ok: true }) } });
  fill(n, { "project-plan": "x", "project-plan-about": Q });
  await press(n, "planopen");
  assert.equal(n.location.pathname, at);
});

const people = (list) => ({ projectparticipants: ok({ ok: true, projectId: P, participants: list }) });

test("C90 R75 R29 the sole owner is drawn no Stand down (a vote that could never carry) and is told to add another owner first; with two owners it is offered (control); a member's row offers owner acts as before", async () => {
  const sole = await open(at, { plane: people([{ handle: "mai", state: "joined", owner: 1 }, { handle: "dev", state: "joined", owner: 0 }]) });
  assert.ok(!actsIn(main(sole)).includes("projectownerremove"), "no stand-down act for the only owner");
  const row = section(sole, "screen.project.members.head").querySelector('[data-standdown="sole"]');
  assert.ok(row, "the row says why");
  assert.ok(says(row, "refusal.LAST_OWNER"), "by the held sentence that says add another owner first");
  assert.ok(actsIn(main(sole)).includes("projectowneradd"), "the owner can still make another an owner");
  const two = await open(at, { plane: people([{ handle: "mai", state: "joined", owner: 1 }, { handle: "dev", state: "joined", owner: 1 }]) });
  assert.ok(actsIn(main(two)).includes("projectownerremove"), "two owners: the stand-down is offered");
  assert.equal(section(two, "screen.project.members.head").querySelector('[data-standdown="sole"]'), null);
  /* control: a member who is not an owner is drawn neither */
  const mem = await open(at, { plane: { ...people([{ handle: "mai", state: "joined", owner: 0 }, { handle: "dev", state: "joined", owner: 1 }]) } });
  assert.ok(!actsIn(main(mem)).includes("projectownerremove"));
  assert.equal(section(mem, "screen.project.members.head").querySelector('[data-standdown="sole"]'), null);
});
