/* screens-inquiry fix round 4 (T51), the question screen: C36 aside (R24, R34: the lists that say what the answer rests on name each passage by the words it
 * cites), C14 (the screen's read set). On interface-shell's served page over the real world (the state made by real acts, K5054); every expectation is a word read by key (R44), never copied (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot } from "../interface-shell/harness.mjs";
import { storeWorld, main, says, section, SCREENS } from "./fixtures.mjs";

const PDF_WORDS = "The Director shall repair each reported pothole within seven calendar days of the report.";
const WEB_WORDS = "Potholes reported through 311 are repaired within seven days.";
const AUDIT_WORDS = "Page one of the audit.";
const OWN = { capabilities: ["contribute", "create_projects"] };
/** A partitioned question (state a), by real acts: the policy and the web page hold each other up (part 1); the audit stands alone (part 2). Each is a held web page and its leg
 *  names the paragraph with the words (`withExtents`), or no part of it. (The world holds no pdf-worker member, so a held PDF has no words to cite: the policy is a web page here too.) */
const worldOf = async (withExtents = true) => {
  const world = await storeWorld();
  const ann = await world.signIn("ann", OWN);
  const project = await world.recipes.project(ann, "Pothole repairs");
  const page = async (name, words) => (await world.recipes.page(ann, name, { paragraphs: [words], project })).bundle;
  const docs = [await page("Policy memo 4.12", PDF_WORDS), await page("A web page from www.oaklandca.gov", WEB_WORDS), await page("The audit", AUDIT_WORDS)];
  const id = (await world.recipes.question(ann, project, { title: "Seven days", text: "Is the city repairing reported potholes within seven days?",
    legs: docs.map((target) => ({ target, role: "supports", ...(withExtents ? { extent_kind: "doc-para", extent_para: 1 } : {}) })), draw: true })).id;
  await ann.act("inquiryground", { body: { target: id, grounds: [{ ground: "part 1", legs: [0, 1] }, { ground: "part 2", legs: [2] }], reason: "my reading" } });
  const page_ = async (o = {}) => {
    const { door, session } = world.boot(ann);
    const p = await boot({ screens: SCREENS, door, session, path: "/app/question/" + id, ...o });
    await p.settle();
    return p;
  };
  return { world, ann, project, docs, id, page: page_ };
};
const q = (s) => "\u201c" + s + "\u201d";

test("R24 R34 C36-aside 'Your answer fails if any one of these fails' and the part that holds together name each passage by the words it cites, not by its document and place alone; control: a leg that names no part of its document draws its title alone", async () => {
  const w = await worldOf();
  const p = await w.page();
  const rests = section(p, "question.rests.title");
  assert.ok(rests, "the read-back is drawn");
  assert.ok(rests.textContent.includes(q(AUDIT_WORDS)), "the single part, by the words of its paragraph: " + rests.textContent);
  assert.ok(rests.textContent.includes("The audit \u00b7 Paragraph 2 \u00b7 " + q(AUDIT_WORDS)), "and its document and place before them");
  assert.ok(says(rests, "question.rests.all", { passages: "Policy memo 4.12 \u00b7 Paragraph 2 \u00b7 " + q(PDF_WORDS.length > 90 ? PDF_WORDS.slice(0, 90).replace(/\s+\S*$/, "") + "\u2026" : PDF_WORDS)
    + ", A web page from www.oaklandca.gov \u00b7 Paragraph 2 \u00b7 " + q(WEB_WORDS) }), "the part held up together: both passages, each with its place and its words");
  /* under a passage, the others that hold it up are named by their words too */
  const supports = main(p).textContent;
  assert.ok(supports.includes(q(WEB_WORDS)), "the web passage's words");
  const bare = await (await worldOf(false)).page();
  const r = section(bare, "question.rests.title");
  assert.ok(!r.textContent.includes(WEB_WORDS) && !r.textContent.includes(AUDIT_WORDS), "control: a leg naming no part draws no words");
  assert.ok(r.textContent.includes("The audit") && r.textContent.includes("A web page from www.oaklandca.gov"), "control: and still its title");
});

/* ---- C14 (R2, R24, R25): the screen's read set ---- */
/** the ops asked for the same thing twice: `op` and its whole query, more than once */
const repeats = (p) => {
  const seen = new Map();
  for (const r of p.requests) { const k = r.op + " " + JSON.stringify(r.query || {}) + " " + JSON.stringify(r.body || null); seen.set(k, (seen.get(k) || 0) + 1); }
  return [...seen.entries()].filter(([, n]) => n > 1).map(([k]) => k);
};

test("R2 R24 R25 C14 the question reads what depends on the reading shown once the reading shown is settled: a project whose standing reading arrives after the first answer does not make the independence of the first reading and then of the second two reads; control: no read is asked twice for the same thing", async () => {
  /* two readings of the question, the project standing on the second: the owner's own acts (a conclusion on her reading, a narrowing of its first citation into a new reading, accepted, and made the project's CURRENT) */
  const w = await worldOf();
  const both = { affirmed: ["part 1", "part 2"] };
  await w.ann.act("conclude", { query: { target: w.id, project: w.project, reading: "Repairs are made within seven days.", falsifier: "Work orders show otherwise." }, body: both });
  const description = "Points the first citation at the first run of the paragraph alone, because the rest of the paragraph does not matter.";
  await w.ann.act("narrow", { query: { target: w.id, version: "reading-1", ord: 0, name: "alt", description }, body: { target: w.id, version: "reading-1", ord: 0, name: "alt", description, extent: { extent_kind: "doc-para", extent_para: 1, extent_run: 0 } } });
  await w.ann.act("versionaccept", { query: { target: w.id, version: "alt", project: w.project }, body: both });
  await w.ann.act("versioncurrent", { query: { target: w.id, version: "alt", project: w.project }, body: {} });
  /* the world's door, holding back the one read that names the project until the first read has been answered (each answer is the world's own) */
  let release;
  const gate = new Promise((r) => { release = r; });
  const { door, session } = w.world.boot(w.ann);
  const slow = async (req) => {
    if (req.op !== "basisversions") return door(req);
    if (req.query.project) await gate;
    const answer = await door(req);
    if (!req.query.project) release();
    return answer;
  };
  const p = await boot({ screens: SCREENS, door: slow, session, path: "/app/question/" + w.id });
  await p.settle();
  const ind = p.byOp("partitionindependence");
  assert.equal(ind.length, 1, "the independence is asked once, for the reading the project stands on: " + JSON.stringify(ind.map((r) => r.query)));
  assert.equal(ind[0].query.version, "alt");
  assert.deepEqual(repeats(p), [], "control: no read is made twice for the same thing");
});
