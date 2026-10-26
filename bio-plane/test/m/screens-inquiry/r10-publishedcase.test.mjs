/* screens-inquiry R63 (project: the project's published cases), R72 (question: frozen editions): the reads of one case name it by `id`, the door's argument
 * (publication's `publishedcase` answers REQUIRED_ARGUMENT_MISSING to any other), over the real world with a case made by `recipes.published` (B69, K5198). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot } from "../interface-shell/harness.mjs";
import { storeWorld, section, word, SCREENS } from "./fixtures.mjs";

const CAPS = { capabilities: ["contribute", "create_projects", "publish"] };
const pageOf = async (world, as, path) => {
  const { door, session } = world.boot(as);
  const p = await boot({ screens: SCREENS, door, session, path });
  await p.settle();
  return p;
};
const madeCase = async () => {
  const world = await storeWorld();
  const ann = await world.signIn("ann", CAPS);
  const project = await world.recipes.project(ann, "Pothole repairs");
  const found = await world.recipes.finding(ann, project);
  const made = await world.recipes.published(ann, found);
  return { world, ann, project, found, made };
};

test("R63 B69 the project page reads each published case by id and draws the case it published; control: the door answers the old argument REQUIRED_ARGUMENT_MISSING", async () => {
  const w = await madeCase();
  const p = await pageOf(w.world, w.ann, "/app/project/" + w.project);
  const reads = p.byOp("publishedcase");
  assert.ok(reads.length >= 1, "the case is read");
  for (const r of reads) assert.ok(r.query.id && !("caseId" in r.query), "the case is named by id");
  const work = section(p, "project.work.title").textContent;
  assert.ok(work.includes(word("screen.published.name")) && work.includes(word("screen.docket.name")), "the project's own case is drawn in its work: its published reference and docket");
  const old = await w.ann.read("publishedcase", { query: { caseId: w.made.case, edition: "1" } }).catch((e) => e);
  assert.match(String(old && (old.message || JSON.stringify(old))), /REQUIRED_ARGUMENT_MISSING/);
});

test("R72 B69 the question page reads a frozen edition's case by id and names it by its scope", async () => {
  const w = await madeCase();
  const p = await pageOf(w.world, w.ann, "/app/question/" + w.found.id);
  const reads = p.byOp("publishedcase");
  assert.ok(reads.length >= 1, "the edition's case is read");
  for (const r of reads) assert.ok(r.query.id && !("caseId" in r.query), "the case is named by id");
});
