/* store-request R19 (STORE-REQUEST #6, B16 (2); SCREENS-DAILY #24 J31 (6), SCREENS-INVESTIGATE #17 J31 (3)): the recipes `projects`, `draftOnly` and `register`, each over the real store. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "./fixtures.mjs";

const caps = { capabilities: ["contribute", "create_projects", "publish"] };

test("R19 recipes.projects: a team of 201 projects made by the real promotions: the store answers the first 200 and says it is cut, and the cursor reaches the last", async () => {
  const w = await storeWorld();
  const rosa = await w.signIn("rosa", caps);
  const ids = await w.recipes.projects(rosa, 201);
  assert.equal(ids.length, 201); assert.equal(new Set(ids).size, 201);
  const first = await rosa.read("projectlist");
  assert.equal(first.truncated, true, "the store cuts the list at its limit");
  assert.equal(first.projects.length, 200);
  const seen = new Set(first.projects.map((p) => p.id));
  let page = first, pages = 1;
  while (page.truncated === true && page.next && pages < 20) { page = await rosa.read("projectlist", { query: { after: page.next } }); page.projects.forEach((p) => seen.add(p.id)); pages++; }
  assert.equal(seen.size, 201, "every project is reached by the cursor");
  assert.ok(first.projects.every((p) => p.stage === "forming"), "each is recorded forming");
});

test("R19 recipes.draftOnly: a draft shared on a case with no edition: the published list holds none of it, the draft is listed, the reader's comment is the reader's own; control: a published case has an edition", async () => {
  const w = await storeWorld();
  const rosa = await w.signIn("rosa", caps);
  const made = await w.recipes.draftOnly(rosa, { comment: "Please check the date." });
  assert.ok(made.draft && made.grant && made.secret);
  assert.equal(made.comment.ok, true, JSON.stringify(made.comment));
  assert.deepEqual((await rosa.read("publishedlist")).cases, [], "no edition of it is published");
  const drafts = await rosa.read("casedrafts", { query: { projects: made.project } });
  assert.ok(JSON.stringify(drafts).includes(made.draft), "the draft is listed for its project");
  const copy = await rosa.read("reviewcopy", { query: { draft: made.draft } });
  assert.equal(copy.ok, true, JSON.stringify(copy).slice(0, 300));
  assert.ok(copy.comments.length === 1 && copy.grants.some((g) => g.live), "one comment and a live link");
  const found = await w.recipes.finding(rosa, made.project, { title: "Published here" });
  await w.recipes.published(rosa, found);
  assert.equal((await rosa.read("publishedlist")).cases.length, 1, "control: a published finding is an edition");
});

test("R19 recipes.register: a followed register is read by the real consumer; `follows` carries its last_read and `captured`; a source that answers nothing throws", async () => {
  const w = await storeWorld();
  const ann = await w.signIn("ann", caps);
  const before = await w.recipes.register(ann);
  const item = (await before.as.read("follows")).items.find((i) => i.follow === before.follow);
  assert.equal(item.last_outcome, "captured");
  assert.ok(item.last_read, "the read is stamped");
  assert.equal(before.read.outcome, "captured");
  assert.equal(item.subject.address, before.address);
  const down = await storeWorld();
  const bo = await down.signIn("bo", { capabilities: ["contribute"] });
  await assert.rejects(() => down.recipes.register(bo, { status: 500 }), /was not read/);
});
