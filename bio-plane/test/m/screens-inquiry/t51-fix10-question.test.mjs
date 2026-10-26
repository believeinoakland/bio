/* screens-inquiry T51 fix round 10 (the alpha walk, causes D-M1 part 3 and D-M6 "reading-1"), the question screen: R5 and R120 (a leg's title is drawn once,
 * as the words it is: an ampersand in it is escaped once, not twice), R25 (the reading chooser names each reading by its description; the name is its value).
 * On interface-shell's served page: the strength over the real world (real acts, K5054); the readings over a scripted basisversions answer. Every expectation
 * is a word or a drawn string the test reads, never copied from the code (R44). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot, ok } from "../interface-shell/harness.mjs";
import { open, storeWorld, main, SCREENS, P, Q, POLICY, BASIS } from "./fixtures.mjs";

const at = "/app/question/" + Q;
const OWN = { capabilities: ["contribute", "create_projects"] };

/** A project of `ann`'s with a held page for each of `docs` (`{title}`) and a question of hers resting on them, drawn by real acts. */
const worldOf = async (docs) => {
  const world = await storeWorld();
  const ann = await world.signIn("ann", OWN);
  const project = await world.recipes.project(ann, "Pothole repairs");
  const targets = [];
  for (const d of docs) targets.push((await world.recipes.page(ann, d.title, { paragraphs: ["The Director shall repair each reported pothole within seven calendar days of the report."], project })).bundle);
  const id = (await world.recipes.question(ann, project, { title: "Seven days", text: "Is the city repairing reported potholes within seven days?",
    legs: targets.map((target) => ({ target, role: "supports" })), draw: true })).id;
  const page = async () => {
    const { door, session } = world.boot(ann);
    const p = await boot({ screens: SCREENS, door, session, path: "/app/question/" + id });
    await p.settle();
    return p;
  };
  return { world, ann, id, page };
};
/** the partition held, by the act the page's "Save the answers" makes: the legs as one ground, so each leg is one the answer can do without or not */
const ground = (w, grounds, reason = "my reading") => w.ann.act("inquiryground", { body: { target: w.id, grounds, reason } });

test("R5 R120 the strength sentence that names a leg by its title draws the title once, with its ampersand as one ampersand; control: a plain title reads the same way", async () => {
  const drawn = async (title) => {
    const w = await worldOf([{ title: POLICY }, { title }]);
    await ground(w, [{ ground: "part 1", legs: [0, 1] }]);
    const p = await w.page();
    return main(p).querySelector(".mk-strengthbox").textContent;
  };
  const amp = await drawn("Permits & Fees");
  assert.ok(amp.includes("Permits & Fees"), "the title is drawn as the record holds it");
  assert.ok(!amp.includes("&amp;"), "the ampersand is not escaped a second time");
  const plain = await drawn("Work orders");
  assert.ok(plain.includes("Work orders") && !plain.includes("&amp;"), "control: a plain title is drawn the same way");
});

test("R25 the reading chooser names each reading by its description and keeps the name as its value; control: a reading with no description is named by its name", async () => {
  const first = BASIS().versions[0];
  const versions = [first,
    { ...first, name: "reading-1", state: "suggested", description: "Seven-day standard, the city's own count", legs: [] },
    { ...first, name: "reading-2", state: "suggested", description: "", legs: [] }];
  const p = await open(at, { plane: { basisversions: ok(BASIS({ versions })) } });
  const option = (value) => [...p.doc.getElementById("question-reading").querySelectorAll("option")].find((o) => o.getAttribute("value") === value);
  assert.equal(option("reading-1").textContent.trim(), "Seven-day standard, the city's own count", "the description is the option's text");
  assert.equal(option("reading-1").getAttribute("value"), "reading-1", "the name is the value the chooser sends");
  assert.equal(option("reading-2").textContent.trim(), "reading-2", "control: with no description the name is the text");
});
