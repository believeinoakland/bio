/* screens-inquiry R52, R53, R63 (T50-32): the project page's work, its bar and settings, what the team has at stake here, and
 * its published cases and docket; on interface-shell's served page over a scripted plane. Every expectation is a word read
 * by key (R44). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot, ok, refusedIn } from "../interface-shell/harness.mjs";
import { REF_SCREENS } from "../../../src/interface-shell/index.mjs";
import { open, main, actsIn, fill, press, says, section, word, P, SCREENS, storeWorld } from "./fixtures.mjs";

/* every owner's declarations, registered once before the first read (test-support R17, K4245): the project's acts name ops its owners declare */


const at = "/app/project/" + P;
/* a day as `cs.date` draws it, read through the same words (DEC-333), never copied */
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const day = (iso) => { const [y, m, d] = iso.slice(0, 10).split("-").map(Number); return word("date.daymonthyear", { day: String(d), month: word("date.month." + MONTHS[m - 1]), year: String(y) }); };
const KINDS = ["plan", "timeline", "money", "calculation", "proceeding", "standard", "request", "matter", "action", "case-editor", "review-copy", "ceremony"];

test("R52 (1) This project's work lists every screen that works within a project, each with its card, a kind with none still listed; a screen the shell cannot reach is no link", async () => {
  const p = await open(at);
  const s = section(p, "project.work.title");
  for (const kind of KINDS) {
    assert.ok(s.textContent.includes(word("screen." + kind + ".name")), `${kind} listed with no item of its own`);
    /* this page serves only this module's screens, so none of these is reachable: each is a card, never a link that refuses */
    assert.ok(!s.querySelector(`a[href*="/app/${REF_SCREENS[kind] || kind}/"]`), `${kind}: no link to a screen the page does not serve`);
  }
  assert.equal(s.querySelectorAll("a[href^='/app/published'], a[href^='/app/docket']").length, 0, "no published case: neither link (R63)");
});

test("R52 (2) The foot folds the project's settings (its bar's setting and who can find it); the bar's reading stays beside the stage", async () => {
  const p = await open(at);
  const fold = main(p).querySelector('details[data-fold="settings"]');
  assert.ok(says(fold.querySelector("summary"), "project.settings.fold"));
  assert.deepEqual(actsIn(fold).sort(), ["projectbarset"], "the bar's setting is inside the fold");
  assert.ok(fold.querySelector(`#project-bar-capture`) && says(fold, "project.visibility.title"), "and who can find it");
  assert.equal(section(p, "screen.project.bar.head").closest("details"), null, "the reading is not folded");
  assert.ok(says(section(p, "screen.project.questions.head"), "act.promote.here.project"), "R52 (4): Open a question is explained in its place");
});

/** A world with a project `Stormwater` its owner `ann` started: the page as a member of that world sees it (the real store, a real sign-in, the page's own door). */
async function stormwater() {
  const world = await storeWorld();
  const ann = await world.signIn("ann", { capabilities: ["contribute", "create_projects"] });
  const project = await world.recipes.project(ann, "Stormwater");
  return { world, ann, project };
}
async function pageAs(world, me, path) {
  const { door, session } = world.boot(me);
  const p = await boot({ screens: SCREENS, door, session, path });
  await p.settle();
  return p;
}

test("R53 what the team has at stake here: the team's statement read-only, the project's stake with who and when and its history, edited by a participant", async () => {
  const { world, ann, project } = await stormwater();
  const admin = await world.signIn("admin");
  const teamStake = "The team is funded by a union of city workers.";
  assert.equal((await admin.act("declaredstakeset", { body: { stake: teamStake } })).ok, true);
  assert.equal((await ann.act("projectstakeset", { query: { projectId: project, stake: "No stake yet." } })).ok, true);
  const first = await ann.act("projectstakeset", { query: { projectId: project, stake: "We rent from the contractor." } });
  assert.equal(first.ok, true);
  const held = await ann.read("projectstake", { query: { projectId: project } });
  assert.equal(held.history.length, 2, "the earlier statement is kept");
  const p = await pageAs(world, ann, "/app/project/" + project);
  const s = section(p, "stake.project.title");
  assert.ok(says(s, "stake.project.group", { stake: teamStake }));
  assert.ok(s.textContent.includes(held.stake));
  assert.ok(says(s, "stake.set", { who: held.set_by, date: day(held.set_at) }) && says(s, "stake.history", { n: String(held.history.length - 1) }), "who, when, and the earlier statements");
  const heads = main(p).querySelectorAll("section h2").map((h) => h.textContent);
  assert.ok(heads.indexOf(word("stake.project.title")) < heads.indexOf(word("screen.project.members.head")), "above Members");
  fill(p, { "project-stake": "We rent from the contractor, and from the city." });
  await press(p, "projectstakeset", { reason: "we say so" });
  assert.deepEqual([p.byOp("projectstakeset")[0].query.projectId, p.byOp("projectstakeset")[0].query.stake], [project, "We rent from the contractor, and from the city."]);
  assert.equal((await ann.read("projectstake", { query: { projectId: project } })).stake, "We rent from the contractor, and from the city.", "the act reached the store");
  /* clearing: an emptied field sends the exact word `null` (project-roster R31) */
  fill(p, { "project-stake": "" });
  await press(p, "projectstakeset", { reason: "we say so" });
  assert.equal(p.byOp("projectstakeset")[1].query.stake, "null");
  assert.equal((await ann.read("projectstake", { query: { projectId: project } })).stake, null, "cleared in the store");
  /* none, and an unreadable stake is said (in its fold), never none */
  const none = await pageAs(world, ann, "/app/project/" + project);
  assert.ok(says(section(none, "stake.project.title"), "stake.none"));
  const { world: w2, ann: a2, project: p2 } = await stormwater();
  await a2.act("projectstakeset", { query: { projectId: p2, stake: "undetermined" } });
  const bad = await pageAs(w2, a2, "/app/project/" + p2);
  const u = section(bad, "stake.project.title");
  assert.ok(says(u.querySelector("details summary"), "stake.unreadable.summary") && says(u, "stake.unreadable"));
  assert.ok(!says(u, "stake.none"));
  /* the refusal by its words: a stake too long for the store is refused by the store */
  fill(none, { "project-stake": "x".repeat(6000) });
  assert.ok((await press(none, "projectstakeset", { reason: "we say so" })).textContent.length > 0);
});

test("R53 control: a member who is not in the project reads its stake and is drawn no field", async () => {
  const { world, ann, project } = await stormwater();
  await ann.act("projectvisibilityset", { query: { projectId: project, setting: "discoverable", reason: "let the neighbours find it" } });
  const cal = await world.signIn("cal", { capabilities: ["contribute"] });
  const p = await pageAs(world, cal, "/app/project/" + project);
  assert.equal(p.doc.getElementById("project-stake"), null);
  assert.ok(!actsIn(main(p)).includes("projectstakeset"));
});

test("R63 the project's published cases and docket: each case it published a published reference and its docket, once however many editions; a read that fails is failed, never none", async () => {
  const list = ok({ bundles: [], cases: [{ case_id: "CASE-1", edition: 1 }, { case_id: "CASE-1", edition: 2 }, { case_id: "CASE-2", edition: 1 }] });
  const pc = (r) => ok({ ok: true, case_id: r.query.caseId, edition: Number(r.query.edition), project: r.query.caseId === "CASE-1" ? P : "PROJ-2026-0042" });
  const p = await open(at, { plane: { publishedlist: list, publishedcase: pc } });
  assert.deepEqual(p.byOp("publishedcase").map((r) => [r.query.caseId, r.query.edition]).sort(), [["CASE-1", "2"], ["CASE-2", "1"]], "the latest edition of each case, once");
  const s = section(p, "project.work.title");
  assert.ok(s.textContent.includes(word("screen.published.name")) && s.textContent.includes(word("screen.docket.name")));
  assert.ok(!s.textContent.includes("CASE-2"), "another project's case is not listed");
  assert.equal(s.querySelectorAll(".cs-card").filter((c) => [word("screen.published.name"), word("screen.docket.name")].includes(c.textContent)).length, 0, "(the cards are the rows' text)");
  /* control: none published lists neither; a failed read is drawn failed */
  const bad = await open(at, { plane: { publishedlist: refusedIn("SOME_REFUSAL") } });
  assert.ok(section(bad, "project.work.title").querySelector('[data-state="failed"]'));
});
