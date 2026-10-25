/* screens-investigate R22, R23, R26: the design walk folded (WALK-084 #2; K3250, K3254), on interface-shell's served page
 * over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import * as shell from "../../../src/interface-shell/index.mjs";
import { SCREENS } from "../../../src/screens-investigate/index.mjs";
import { inWorld, openAs, settled, readHeld, declareStandard } from "./world.mjs";
import { open, main, button, fill, PATHS, ENT, ORG, MSR, CALC, PROC, STD, P, ACT, PERSON, TRAIL, word, drew, notDrew } from "./fixtures.mjs";

const page = readFileSync(new URL("../../../../docs/development/ux-substrate/screens/page.src.html", import.meta.url), "utf8");
const css = page.split("<style>")[1].split("</style>")[0] + readFileSync(new URL("../../../../docs/development/ux-substrate/visual-language/civicsmith.css", import.meta.url), "utf8") + (shell.STYLE || "");
const DEFINED = new Set([...css.matchAll(/\.([a-zA-Z_][\w-]*)/g)].map((m) => m[1]));
/* the classes the shell's own kit draws are the shell's to define (interface-shell R56's HOOK_CLASSES and STYLE) */
for (const f of ["browser.mjs", "index.mjs"]) for (const m of readFileSync(new URL("../../../src/interface-shell/" + f, import.meta.url), "utf8").matchAll(/class=\\?["']([^"'$\\]*)/g)) for (const c of m[1].split(/\s+/).filter(Boolean)) DEFINED.add(c);
const classesOf = (el) => new Set(el.querySelectorAll("*").filter((e) => !e.closest(".cs-crumbs")).flatMap((e) => (e.getAttribute("class") || "").split(/\s+/).filter(Boolean)));
const DESIGN_SPELT = ["cs-frontgrid", "cs-signin", "cs-fronthead", "cs-flogo", "cs-facts", "cs-note", "cs-sub", "cs-small", "cs-steps", "cs-passage", "cs-strengthbox", "cs-gapblock", "cs-pickc", "cs-areas", "cs-table"];
const PAGES = { ...PATHS, standard: "/app/standard/" + P, "standard-law": "/app/standard/" + STD, "explore-walked": PATHS.explore };

test("R22 every element these screens draw uses a class a served stylesheet defines (civicsmith.css, the design page's styles, the shell's own); control: a class the design spells mk-* is not drawn as cs-*", async () => {
  for (const [id, path] of Object.entries(PAGES)) {
    const p = await open(path);
    if (id === "explore-walked") { fill(p, { "explore-at": "2025-06-30" }); await p.click(button(p, "explore")); await p.settle(); }
    const used = classesOf(main(p));
    for (const c of used) assert.ok(DEFINED.has(c), `${id}: class ${c} is defined by no served stylesheet`);
  }
});

test("R22 control: no source of this module writes a class the design spells mk-* as cs-* (the shell's own kit draws its own)", () => {
  const dir = new URL("../../../src/screens-investigate/", import.meta.url);
  for (const f of readdirSync(dir)) {
    const text = readFileSync(new URL(f, dir), "utf8");
    for (const c of DESIGN_SPELT) assert.ok(!new RegExp(`["' ]${c}["' ]`).test(text), `${f} writes ${c}`);
  }
});

test("R22 every labelled field is drawn with cs.field: no screen draws cs-form or a bare label with help beside it", async () => {
  for (const [id, path] of Object.entries(PAGES)) {
    const p = await open(path);
    const m = main(p);
    assert.equal(m.querySelectorAll(".cs-form").length, 0, `${id}: cs-form`);
    for (const l of m.querySelectorAll("label")) {
      const owner = l.parentElement;
      const cls = (owner && owner.getAttribute("class")) || "";
      assert.ok(/cs-field|cs-check|cs-radio/.test(cls) || owner.tagName === "fieldset" || owner.querySelector("input[type=checkbox], input[type=radio]"), `${id}: a bare label (${l.textContent.trim().slice(0, 40)})`);
    }
  }
});

test("R22 a section, list or reading that holds nothing is not drawn, and no count is drawn at zero; a screen over an empty world shows neither", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  /* each state is made by the member's own acts: a person named, a proceeding registered, a standard declared, a project, an action, a money trail, none of them related, followed or dated */
  const person = (await me.act("entitycreate", { body: { kind: "person", label: "L. Chen", note: "Named in the minutes." } })).entity_id;
  const court = (await me.act("entitycreate", { body: { kind: "body", label: "Alameda Housing Tribunal", forum_kind: "court", note: "A court." } })).entity_id;
  const proc = (await me.act("entitycreate", { body: { kind: "proceeding", label: "Lease rent case", note: "From the caption.", proceeding: { forum: court, kind: "civil", number: "24CV123456" } } })).entity_id;
  const project = await world.recipes.project(me, "Empty project");
  const held = await world.recipes.hold(me, "Ordinance.txt", "Section 8.22.050 No landlord shall increase the rent above the limit the board sets.", project);
  const units = await readHeld(world, me, held.sha);
  const std = await declareStandard(me, { cite: "Ordinance 8.22", kind: "ordinance", sha: held.sha, extent: units[0].extent });
  const trail = await world.recipes.trail(me, project);
  const action = (await me.act("actioncreate", { body: { document: ["---", "object_type: action", "title: Records request", "current_state: planned", 'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "counterparty:", "  state: named", "  role: Town Clerk", "  body: Town of Port Ellery", "action_kind: records_request", "---", "", "An action.", ""].join("\n") } })).id;
  const empty = {
    person: "/app/person/" + person, proceeding: "/app/proceeding/" + proc, standard: "/app/standard/" + std, "standard-project": "/app/standard/" + project,
    "due-date": "/app/due-date/" + action, timeline: "/app/timeline/" + project, money: "/app/money/" + trail, ties: "/app/ties",
  };
  /* the world's own answers hold nothing for them */
  assert.deepEqual((await me.read("partiesof", { query: { proceeding: proc } })).parties, [], "no party");
  assert.deepEqual((await me.read("lawrelations", { query: { id: std } })).referential, [], "no relation");
  assert.deepEqual((await me.read("clockproposals", { query: { action } })).proposals, [], "no proposed clock");
  assert.deepEqual((await me.read("memberties")).ties, [], "no tie");
  for (const [id, path] of Object.entries(empty)) {
    const p = await openAs(world, me, path);
    assert.equal(main(p).querySelector('[data-state="failed"]'), null, `${id}: every read answered`);
    for (const s of main(p).querySelectorAll("section")) {
      const h = s.querySelector("h2");
      const body = s.textContent.replace(h ? h.textContent : "", "").trim();
      assert.ok(body.length > 0 || s.querySelector("button, input, select, textarea"), `${id}: an empty section "${h && h.textContent}" is drawn`);
    }
    assert.doesNotMatch(main(p).textContent, /: 0\b|· 0\b/, `${id}: a zero count is drawn`);
    for (const k of ["screen.people.count.documents", "screen.people.count.questions", "screen.people.count.projects", "screen.explore.chains"]) notDrew(main(p), k, { n: "0" }, `${id}: ${k} at zero`);
  }
  const zero = await openAs(world, me, "/app/explore/" + person);
  fill(zero, { "explore-at": "2025-06-30" });
  await zero.click(button(zero, "explore"));
  await zero.settle();
  await settled(zero);
  const asked = zero.byOp("explore")[0];
  const walked = await me.act("explore", { body: asked.body });
  assert.deepEqual(walked.paths, [], "the world's search holds no chain");
  notDrew(main(zero), "screen.explore.chains", { n: "0" });
  /* the world's answer says in its own words that the search looked and found none (absence.meaning): that is what the page draws, in place of its fallback */
  assert.ok(walked.absence && walked.absence.meaning, "the world's answer says what it looked for");
  assert.ok(main(zero).textContent.includes(walked.absence.meaning), "the member's search answered, in the store's words");
});

test("R22 control: a read that failed is still drawn as failed on every screen", async () => {
  for (const [id, path] of Object.entries({ person: PATHS.person, timeline: PATHS.timeline, money: PATHS.money, "due-date": PATHS["due-date"] })) {
    const op = { person: "person", timeline: "timeline", money: "moneyset", "due-date": "action" }[id];
    const p = await open(path, { plane: { [op]: refusedIn("SOME_REFUSAL", "The plane refused this read.") } });
    assert.ok(main(p).querySelector('[data-state="failed"], .cs-gap[data-gap="refused"]'), id);
  }
});

test("R23 no field asks for a record id: ties offers named people from the directory (control: no field's label or help names \"record id\")", async () => {
  const p = await open(PATHS.ties);
  const who = p.doc.getElementById("tie-who");
  assert.deepEqual(who.querySelectorAll("option").map((o) => o.textContent), ["L. Chen", "Public Works Department"]);
  assert.deepEqual(who.querySelectorAll("option").map((o) => o.getAttribute("value")), [ENT, ORG]);
  fill(p, { "tie-who": ORG, "tie-note": "my cousin works there" });
  await p.click(button(p, "declaretie"));
  await p.settle();
  assert.equal(p.byOp("declaretie")[0].body.entity, ORG);
  assert.doesNotMatch(main(p).textContent, /record id|by its id/i, "no label or help names a record id");
});

test("R23 the other people fields are choices too: a claim's other record, a timeline participant, a proceeding party, obligor and court, explore's end, a standard's law, a money trail's question", async () => {
  const names = ["L. Chen", "Public Works Department"];
  const opts = (p, id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => o.textContent).filter((x) => x !== "");
  const { world, me } = await inWorld();
  const chen = (await me.act("entitycreate", { body: { kind: "person", label: "L. Chen", note: "Named in the minutes." } })).entity_id;
  await me.act("entitycreate", { body: { kind: "institution", label: "Public Works Department", note: "The city department." } });
  const person = await openAs(world, me, "/app/person/" + chen);
  assert.deepEqual((await me.read("samepersoncandidates", { query: { id: chen } })).candidates, [], "no candidate for the same person: the world's answer");
  assert.deepEqual(opts(person, "person-claim-other"), ["Public Works Department"], "the person herself is not offered");
  const tl = await open(PATHS.timeline);
  assert.deepEqual(opts(tl, "tl-who"), names);
  const pr = await open(PATHS.proceeding);
  for (const id of ["pr-party", "pr-obligor"]) assert.deepEqual(opts(pr, id), names, id);
  assert.deepEqual(opts(pr, "pr-forum"), ["Alameda Housing Tribunal"], "R36: the court is among the forums");
  assert.deepEqual(opts(pr, "pr-court"), ["Municipal Code §12.04", "Administrative Instruction 9.1, §2"]);
  const ex = await open(PATHS.explore);
  assert.deepEqual(opts(ex, "explore-to"), [word("screen.explore.to.any"), ...names]);
  const st = await open("/app/standard/" + STD);
  assert.deepEqual(opts(st, "st-to"), ["Municipal Code §12.04"], "the standard itself is not offered as its own law");
  const mo = await open(PATHS.money);
  assert.deepEqual(opts(mo, "mf-question"), ["Is the city repairing reported potholes within seven days?"]);
});

test("R26 person, calculation, proceeding and standard mark their subject read subject: true and list NO_ENTITY and NO_CALC in ABSENT_CODES", () => {
  const by = Object.fromEntries(SCREENS.map((s) => [s.id, s]));
  const subject = { person: ["entity"], calculation: ["calc"], proceeding: ["entity"], standard: ["standard"] };
  const subjects = { person: ENT, calculation: CALC, proceeding: PROC, standard: STD };
  for (const [id, reads] of Object.entries(subject)) {
    const r = by[id].reads({ subject: subjects[id], ui: {}, data: {} });
    for (const name of reads) assert.equal(r[name].subject, true, `${id}.${name}`);
    assert.ok(by[id].ABSENT_CODES.includes("NO_ENTITY") && by[id].ABSENT_CODES.includes("NO_CALC"), id);
  }
});

test("R26 a bare calculation (refused NO_CALC) draws \"Nothing is here\" and nothing else of the screen (interface-shell R61); control: a calculation that is there is drawn", async () => {
  const p = await open("/app/calculation/" + CALC, { plane: { calculation: refusedIn("NO_CALC", "No such calculation.") } });
  drew(main(p), "shell.unavailable.nothing.title");
  assert.equal(main(p).querySelectorAll("section").length, 0, "nothing else of the screen is drawn");
  const q = await open("/app/calculation/" + CALC);
  notDrew(main(q), "shell.unavailable.nothing.title");
});
