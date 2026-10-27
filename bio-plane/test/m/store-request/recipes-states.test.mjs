/* store-request R19 (STORE-REQUEST #7, B18 START): the recipes `readings`, `machineReading`, `graded`, `sharedOrigin` and the `subject`, `extent_rect` and `fonts` options of `question` and `pdf`,
   each over the real store: the state is what the owner answers, each with a control. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "./fixtures.mjs";

const caps = { capabilities: ["contribute", "create_projects"] };

test("R19 recipes.readings: a question holds one reading in each of the states accepted, considering, rejected and suggested; control: a question with none holds none", async () => {
  const w = await storeWorld();
  const ann = await w.signIn("ann", caps);
  const P = await w.recipes.project(ann, "Readings");
  const made = await w.recipes.readings(ann, P);
  const bv = await ann.read("basisversions", { query: { id: made.question, project: P } });
  const state = (n) => bv.versions.find((v) => v.name === n).state;
  assert.deepEqual(Object.entries(made.versions).map(([k, n]) => [k, state(n)]), [["accepted", "accepted"], ["considering", "considering"], ["rejected", "rejected"], ["suggested", "suggested"]]);
  const bare = await w.recipes.question(ann, P, { title: "No readings" });
  assert.deepEqual((await ann.read("basisversions", { query: { id: bare.id, project: P } })).versions, []);
});

test("R19 recipes.machineReading: the reading is suggested by the credential of a run, not by a member; the member may reject it; control: a member's own suggest names the member; a world without the test instance refuses", async () => {
  const w = await storeWorld({ ai: true });
  const adm = await w.signIn("admin"), ann = await w.signIn("ann", caps);
  const P = await w.recipes.project(ann, "Machine");
  const made = await w.recipes.machineReading(adm, ann, P);
  const v = (await ann.read("basisversions", { query: { id: made.question, project: P } })).versions.find((x) => x.name === made.version);
  assert.deepEqual([v.state, v.author, v.run], ["suggested", "token:ai", made.run]);
  await ann.act("versionreject", { query: { target: made.question, version: made.version, reason: "it overreaches" } });
  assert.equal((await ann.read("basisversions", { query: { id: made.question, project: P } })).versions[0].state, "rejected");
  const bare = await storeWorld();
  await assert.rejects(() => bare.recipes.machineReading(null, null, "P"), /ai: true/);
});

test("R19 recipes.graded: the question's connection axis is graded B by resolution and the capture axis is not; control: an ungraded leg leaves the connection unrated", async () => {
  const w = await storeWorld();
  const ann = await w.signIn("ann", caps);
  const P = await w.recipes.project(ann, "Graded");
  const made = await w.recipes.graded(ann, P);
  assert.deepEqual(made.resolved.resolved.map((r) => [r.entity_id, r.grade]), [[made.subject, "B"]]);
  assert.deepEqual([made.strength.connection.state, made.strength.connection.grade], ["graded", "B"]);
  assert.notEqual(made.strength.capture.state, "graded");
  const plain = await w.recipes.question(ann, P, { title: "Ungraded", legs: [{ target: made.document, role: "supports" }], subject: made.subject, draw: true });
  assert.notEqual((await ann.read("inquirystrength", { query: { id: plain.id, project: P } })).connection.state, "graded");
});

test("R19 recipes.sharedOrigin: the two parts of the partition share their issuer; control: two pages with no issuer share nothing", async () => {
  const w = await storeWorld();
  const ann = await w.signIn("ann", caps);
  const P = await w.recipes.project(ann, "Origin");
  const made = await w.recipes.sharedOrigin(ann, P);
  assert.deepEqual(made.independence.shared, [{ a: "part 1", b: "part 2", through: [`issuer:${made.office}`] }]);
  const a = await w.recipes.page(ann, "Plain one", { project: P }), b = await w.recipes.page(ann, "Plain two", { paragraphs: ["Other."], project: P });
  const q = await w.recipes.question(ann, P, { title: "Plain", legs: [{ target: a.bundle }, { target: b.bundle }], draw: true });
  assert.deepEqual((await ann.read("partitionindependence", { query: { id: q.id, partition: "[[0],[1]]" } })).independence.shared, []);
});

test("R19 question `extent_rect` and pdf `fonts`: a decoded PDF (type0 with a ToUnicode map) reads as page units and a leg carries its rect into the record; the default font decodes none", async () => {
  const w = await storeWorld();
  const ann = await w.signIn("ann", caps);
  const P = await w.recipes.project(ann, "Rect");
  const decoded = await w.recipes.pdf(ann, "Decoded", { pages: 2, project: P, fonts: ["type0"] });
  assert.equal(decoded.read.units ?? (await ann.read("reading", { query: { sha256: decoded.sha } })).text_units.length, 2);
  const q = await w.recipes.question(ann, P, { title: "Rect", draw: true, legs: [{ target: decoded.bundle, role: "supports", extent_kind: "pdf-page", extent_page: 0, extent_rect: [10, 10, 300, 100] }] });
  const image = await ann.read("image", { query: { id: q.id } });
  assert.match((image.image ?? image)["bundle.md"], /extent_rect: \[10, 10, 300, 100\]/);
  const plain = await w.recipes.pdf(ann, "Plain", { pages: 2, project: P });
  assert.equal((await ann.read("reading", { query: { sha256: plain.sha } })).text_units.length, 0, "control: the default font decodes nothing");
});
