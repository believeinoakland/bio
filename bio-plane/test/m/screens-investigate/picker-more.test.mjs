/* screens-investigate R52 (T51 fix round 6; G20, K4571): a document picker never stops silently at the page it first reads. `heldcaptures`
 * answers `truncated` and `next` when more documents are held than the page; each "Which document" picker continues by that cursor until
 * every document is offered, and past the bound it keeps (three reads) it says how many are shown, never a picker that looks whole.
 * Over `store-request`'s world: the documents are held by the member's own acts, the world's store pages them (capture R77). The one thing the world is not made to
 * hold is the 5000 documents past the bound (a document is a promoted bundle each): there the owner's paging is the one scripted answer (`held`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../interface-shell/harness.mjs";
import { inWorld, openAs, readHeld, declareStandard } from "./world.mjs";
import { word } from "./fixtures.mjs";

const DOC = { kind: "document" };
const SCREENS_WITH_A_PICKER = [
  ["standard", "st-doc"],
  ["person", "person-fact-doc"],
  ["proceeding", "pr-doc"],
  ["timeline", "tl-doc"],
  ["calculation", "calc-content"],
  ["money", "mf-doc"],
];
const titles = (p, id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => o.textContent.split(" · ")[0]).filter((t) => t);

/** A world with a project that holds documents "Document 1.txt" ... "Document N.txt" (the first three are read for a standard, a table and a figure), the screens' subjects made
 *  over them, and `grow(n)` holding more until `n` are held. Answers the screens' paths as the world gave their ids. */
async function scene() {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Pothole repairs");
  let held = 0;
  const grow = async (n) => { while (held < n) { held++; await world.recipes.hold(me, "Document " + held + ".txt", held === 2 ? "month,rent\njan,5\nfeb,7\n" : `Section ${held}.01 No landlord shall retaliate against a tenant who complains about the condition of the unit (copy ${held}).`, project); } };
  await grow(3);
  const rows = (await me.read("heldcaptures", { query: { project, state: "held_and_vouched", fields: "picker", limit: "200" } })).held;
  const shaOf = (title) => rows.find((r) => r.title === title).capture.sha256;
  const units = await readHeld(world, me, shaOf("Document 1.txt"));
  const std = await declareStandard(me, { cite: "Ordinance 8.22", kind: "ordinance", sha: shaOf("Document 1.txt"), extent: units[0].extent });
  const ent = async (kind, label, note, more = {}) => (await me.act("entitycreate", { body: { kind, label, note, ...more } })).entity_id;
  const chen = await ent("person", "Lin Chen", "Council member who moved the vote.");
  const court = await ent("body", "Alameda Housing Tribunal", "A court.", { forum_kind: "court" });
  const proc = await ent("proceeding", "Lease rent case", "From the caption.", { proceeding: { forum: court, kind: "civil", number: "24CV123456" } });
  const trail = await world.recipes.trail(me, project, "Stormwater fund transfers, FY2023");
  const fact = (await me.act("recordfact", { body: { currency: "USD", sign: "+", precision: "exact", period: { from: "2021-07-01", to: "2022-06-30" }, source: { capture_sha: shaOf("Document 3.txt"), extent: DOC },
    amount: "4200000.00", as_read: "4,200,000", kind: "transfer", phase: "adopted", basis: "budgetary", from: { as_written: "Sewer Fund" }, to: { as_written: "General Fund" } } })).fact_id;
  await me.act("moneysetpropose", { body: { setId: trail, factId: fact, method: "member:recordfact" } });
  await me.act("include", { body: { setId: trail, factId: fact, reason: "the transfer we ask about" } });
  const table = (await me.act("tabledeclare", { body: { source: { capture_sha: shaOf("Document 2.txt"), extent: DOC }, header: ["month", "rent"],
    schema: { fields: [{ name: "month", type: "string" }, { name: "rent", type: "number" }] } } })).sha;
  const calc = (await me.act("calculationcreate", { body: { question: "How many months?", period: { from: "2025-07-01", to: "2026-06-30" }, kind: "count", project, inputs: [{ name: "input", table }] } })).calc_id;
  const PATHS = { standard: "/app/standard/" + std, person: "/app/person/" + chen, proceeding: "/app/proceeding/" + proc, timeline: "/app/timeline/" + project,
    calculation: "/app/calculation/" + calc, money: "/app/money/" + trail };
  return { world, me, project, PATHS, grow };
}
let shared = null;
const theScene = () => (shared ||= scene());

/* the owner's paging, as capture R77 answers it: `limit` rows from the cursor `after`, `truncated` and `next` while more remain */
const sha = (i) => i.toString(16).padStart(64, "0");
const held = (total) => (r) => {
  const q = r.query || {};
  const from = q.after ? Number(q.after) : 0;
  const n = Math.min(Number(q.limit) || 200, 1000);
  const rows = [];
  for (let i = from; i < Math.min(total, from + n); i++) rows.push({ bundle_id: "INFO-2026-" + String(i + 1).padStart(4, "0"), title: "Document " + (i + 1) + ".txt", capture: { sha256: sha(i + 1) } });
  const more = from + n < total;
  return ok({ ok: true, held: rows, state: q.state, limit: n, truncated: more, next: more ? String(from + n) : null });
};

/* a picker that fits its page: 150 documents are held, so the first read holds them all */
for (const [name, field] of SCREENS_WITH_A_PICKER) {
  test(`R52 G20 ${name}: control: 150 documents are read once`, async () => {
    const S = await theScene();
    await S.grow(150);
    const few = await openAs(S.world, S.me, S.PATHS[name]);
    const t = titles(few, field);
    assert.equal(t.length, 150, "every document is offered");
    assert.equal(few.byOp("heldcaptures").length, 1, "a picker that fits its page reads once");
  });
}

for (const [name, field] of SCREENS_WITH_A_PICKER) {
  test(`R52 G20 ${name}: with 250 documents held the picker reaches the 250th, reading on by the cursor`, async () => {
    const S = await theScene();
    await S.grow(250);
    const p = await openAs(S.world, S.me, S.PATHS[name]);
    const t = titles(p, field);
    assert.equal(t.length, 250, "every document is offered, not the first 200");
    assert.ok(t.some((x) => x.startsWith("Document 250")), "the 250th is offered");
    assert.ok(!p.doc.body.textContent.includes(word("screen.people.more", { n: "200" })), "nothing is left unsaid when nothing is left out");
    for (const r of p.byOp("heldcaptures")) assert.equal(r.query.state, "held_and_vouched");
    assert.ok(p.byOp("heldcaptures").length >= 2, "read on by the cursor the store answered");
  });

  test(`R52 G20 ${name}: past the bound it keeps (three reads) the picker says how many documents it shows`, async () => {
    const S = await theScene();
    const p = await openAs(S.world, S.me, S.PATHS[name], { plane: { heldcaptures: held(5000) } });
    const shown = titles(p, field).length;
    assert.ok(shown < 5000 && shown >= 1000, "the picker holds the bound it keeps");
    assert.ok(p.byOp("heldcaptures").length <= 3, "the bound is three reads");
    assert.ok(p.doc.body.textContent.includes(word("screen.people.more", { n: String(shown) })), "the number shown is said");
  });
}

test("R52 G20 timeline: the following pages are asked with the project's own filter, so the cursor continues the project's list", async () => {
  const S = await theScene();
  await S.grow(250);
  const p = await openAs(S.world, S.me, S.PATHS.timeline);
  const reads = p.byOp("heldcaptures");
  assert.ok(reads.length >= 2);
  for (const r of reads) assert.equal(r.query.project, reads[0].query.project, "every page asks for the same project");
  assert.equal(reads[0].query.project, S.project, "the project is asked for");
});
