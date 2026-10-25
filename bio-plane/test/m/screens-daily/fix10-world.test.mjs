/* Fix round 10 (final pass): causes of the final walk that are this module's, over the REAL store (store-request's `storeWorld()`, op-tables
   §5.3: every state is made by the real acts, the page's answers are the real queue's). Every sentence is asserted as `word(key, vars)` (R34). */
import "../../sandbox.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "../store-request/fixtures.mjs";
import { open as openRaw, text, main, press, last, word, withScreens, settle } from "./page.mjs";
import { httpError } from "../interface-shell/harness.mjs";

const open = (w, as, path) => openRaw(path, {}, { ...w.boot(as), screens: withScreens("project", "document", "question") });
const rowOf = (p, who) => main(p).querySelectorAll(".cs-row").find((r) => text(p, r).includes(who));
const UNTITLED = word("queue.source.untitled", { date: "" }).trim();

/** A team with rosa (administrator, owner of "Pothole repairs"), a participant ola who asked to leave it with a word, and two
 *  members (dev, mai) who asked to join it, by the real acts. */
async function team() {
  const w = await storeWorld({ group: null });
  const rosa = await w.signIn("rosa", { admin: true });
  const [ola, dev, mai] = [await w.signIn("ola"), await w.signIn("dev"), await w.signIn("mai")];
  const project = await w.recipes.project(rosa, "Pothole repairs");
  await rosa.act("projectinvite", { query: { projectId: project, handle: "ola" } });
  await ola.act("projectjoin", { query: { projectId: project } });
  await ola.act("projectleave", { query: { projectId: project, comment: "Moving away" } });
  await dev.act("projectrequest", { query: { projectId: project, comment: "I live next door" } });
  await mai.act("projectrequest", { query: { projectId: project } });
  return { w, rosa, ola, dev, mai, project };
}

for (const [where, path] of [["the queue", "/app/queue"], ["Home", "/app"]]) {
  test(`R3, R28, R105 (03b §6, item 78 (1); ${where}): a participant's request to leave is drawn with her name, the project and her word, and leads to the project, where an owner removes her; \`projectremove\` is no act of Home or the queue in the registry`, { timeout: 120000 }, async () => {
    const { w, rosa, ola, project } = await team();
    const p = await open(w, rosa, path);
    await settle();
    const row = rowOf(p, "ola");
    assert.ok(row, "the item is drawn");
    const t = text(p, row);
    assert.ok(t.includes("ola asks to leave Pothole repairs"), "names her and the project, in the item's own words: " + t);
    assert.ok(t.includes("Moving away"), "carries her own word");
    assert.ok(!t.includes(UNTITLED), "the project is never drawn as untitled: " + t);
    assert.ok(!/OBLIGATION::/.test(t) && !t.includes(project), "no id drawn as words: " + t);
    // the way on is the project (R75's pattern: the registry lists no `projectremove` for Home or the queue)
    assert.ok(row.querySelectorAll("a").some((a) => a.getAttribute("href") === "/app/project/" + project), "leads to the project");
    assert.equal(row.querySelectorAll("button[data-act]").length, 0, "no act of this screen is offered on it");
    // the owner removes her where the project's page offers it (the real act), and the item leaves with the next read
    await rosa.act("projectremove", { query: { projectId: project, handle: "ola" } });
    const q = await rosa.read("queue");
    assert.ok(!q.items.some((i) => i.kind === "project-leave"), "the real queue no longer holds it");
    // Control: the participant's own queue holds nothing of it (the item is the owners').
    const own = await open(w, ola, "/app/queue");
    await settle();
    assert.ok(!text(own).includes("Moving away"));
  });
}

test("R59, R95, R105 (03b §5; item 78 (1)): \"What you answered\" lists each join request the member answered, with the requester, the project, the answer and the day; the asker's own list holds none", { timeout: 120000 }, async () => {
  const { w, rosa, dev, mai, project } = await team();
  await rosa.act("projectrequestanswer", { query: { projectId: project, handle: "dev", answer: "decline", comment: "Not now" } });
  await rosa.act("projectrequestanswer", { query: { projectId: project, handle: "mai", answer: "grant" } });
  const p = await open(w, rosa, "/app/queue/answered");
  await settle();
  const devRow = rowOf(p, "dev"), maiRow = rowOf(p, "mai");
  assert.ok(devRow && maiRow, "a row for each answer");
  for (const [row, who] of [[devRow, "dev"], [maiRow, "mai"]]) {
    const t = text(p, row);
    assert.ok(t.includes(word("queue.project-request.summary", { who, project: "Pothole repairs" })), "the requester and the project: " + t);
    assert.ok(t.includes(word("queue.answered.byyou", { when: "" }).split("{")[0].trim()), "answered by you, with the moment");
    assert.ok(!t.includes(UNTITLED) && !/PROJ-\d/.test(t), "named by title, never an id: " + t);
  }
  assert.ok(text(p, devRow).includes(word("screen.home.request.decline")) && !text(p, devRow).includes(word("screen.home.request.grant")), "the declined one says so");
  assert.ok(text(p, maiRow).includes(word("screen.home.request.grant")) && !text(p, maiRow).includes(word("screen.home.request.decline")), "the granted one says so");
  assert.ok(main(p).querySelectorAll('a[href^="/app/project/"]').length >= 2, "the project is a reference");
  // Control: a member who answered none sees no join row; the requester's own list holds none of the owner's answers.
  const own = await open(w, dev, "/app/queue/answered");
  await settle();
  assert.ok(!text(own).includes(word("queue.project-request.summary", { who: "dev", project: "Pothole repairs" })));
});

for (const [where, path] of [["the queue", "/app/queue"], ["Home", "/app"]]) {
  test(`R42, R104 (03b §4; ${where}): Grant and Decline offer a place for a word; the word goes with the real answer and the requester is answered; an empty place sends none`, { timeout: 120000 }, async () => {
    const { w, rosa, dev, mai, project } = await team();
    const p = await open(w, rosa, path);
    await settle();
    const row = rowOf(p, "dev");
    const field = row.querySelectorAll("input, textarea").filter((e) => /-comment$/.test(e.getAttribute("id") || ""))[0];
    assert.ok(field, "a place to add a word beside the answers");
    await press(p, "projectrequestanswer", { nth: 1, values: { [field.getAttribute("id")]: "Not now" } });
    await settle();
    const declined = last(p, "projectrequestanswer");
    assert.deepEqual([declined.query.handle, declined.query.answer, declined.query.comment], ["dev", "decline", "Not now"]);
    const mine = await dev.read("projectrequests");
    assert.ok(mine.requests.some((r) => r.project === project && r.state !== "open"), "the real request is answered: " + JSON.stringify(mine.requests));
    // Control: mai's, left empty and granted, sends no word.
    await settle();
    const maiRow = rowOf(p, "mai");
    assert.ok(maiRow, "mai's request is still waiting");
    await press(p, "projectrequestanswer", { nth: 0 });
    await settle();
    const granted = p.byOp("projectrequestanswer").at(-1);
    assert.deepEqual([granted.query.handle, granted.query.answer], ["mai", "grant"]);
    assert.ok(!("comment" in granted.query), "an empty place sends no comment");
    assert.ok(mai);
  });
}

/* R43, R26 (03b §17): Find's Theme filter over a real theme: documents the member held, one placed, one proposed (a hunch). */
test("R43, R26, R106 (03b §17): Find's Theme filter lists what was placed in the chosen theme, then its hunches apart, each document by its title, never its id; with no title read the plain word stands", { timeout: 120000 }, async () => {
  const w = await storeWorld({ group: null });
  const rosa = await w.signIn("rosa", { admin: true });
  const project = await w.recipes.project(rosa, "Pothole repairs");
  const orders = await w.recipes.hold(rosa, "Work orders", "Work orders for the potholes on Main Street.", project);
  const memo = await w.recipes.hold(rosa, "Budget memo", "The public works budget memo.", project);
  const theme = await rosa.act("themedeclare", { body: { name: "Deferred maintenance", test: "a repair put off" } });
  await rosa.act("themeplace", { body: { theme: theme.theme_id, target: orders.bundle } });
  await rosa.act("themepropose", { body: { theme: theme.theme_id, target: memo.bundle } });
  const pick = async (p, id) => { const el = p.doc.getElementById("finder-theme"); el.value = id; p.fire(el, "change"); await settle(); await settle(); };
  const p = await open(w, rosa, "/app/finder");
  await settle();
  assert.deepEqual(p.doc.getElementById("finder-theme").querySelectorAll("option").map((o) => o.textContent), [word("theme.filter.any"), "Deferred maintenance"]);
  await pick(p, theme.theme_id);
  const heads = main(p).querySelectorAll("section h2").map((h) => h.textContent);
  assert.deepEqual(heads, [word("theme.placed"), word("theme.hunches")], "what was placed, then its hunches apart");
  const [placed, hunches] = main(p).querySelectorAll("section");
  assert.ok(text(p, placed).includes("Work orders") && !text(p, placed).includes("Budget memo"), "the placed one by its title");
  assert.ok(text(p, hunches).includes("Budget memo") && text(p, hunches).includes(word("theme.hunch.note")), "the hunch by its title, apart");
  assert.doesNotMatch(text(p, main(p)), /INFO-\d/, "no document named by its id");
  assert.equal(p.byOp("search").filter((r) => /\bid:/.test(String(r.query.q))).length, 1, "the titles were asked for once, for both documents");
  assert.ok(main(p).querySelectorAll("a").some((a) => a.getAttribute("href") === "/app/document/" + orders.bundle), "each a reference to its document");
  // Control: with no title read (the search down) every row is the plain word, never the id.
  const down = await openRaw("/app/finder", { search: httpError(500) }, { ...w.boot(rosa), screens: withScreens("project", "document", "question") });
  await settle();
  await pick(down, theme.theme_id);
  assert.doesNotMatch(text(down, main(down)), /INFO-\d/, "no id when no title is read");
  assert.ok(text(down).includes(word("shell.card.document")));
  // Control: back to "Any theme" lists the browse again.
  await pick(p, "");
  assert.ok(!text(p).includes(word("theme.placed")));
});
