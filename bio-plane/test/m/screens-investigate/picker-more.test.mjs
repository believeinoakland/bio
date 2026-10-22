/* screens-investigate R52 (T51 fix round 6; G20, K4571): a document picker never stops silently at the page it first reads. `heldcaptures`
 * answers `truncated` and `next` when more documents are held than the page; each "Which document" picker continues by that cursor until
 * every document is offered, and past the bound it keeps (three reads) it says how many are shown, never a picker that looks whole. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../interface-shell/harness.mjs";
import { open, PATHS, STD, word } from "./fixtures.mjs";

const SCREENS_WITH_A_PICKER = [
  ["standard", "/app/standard/" + STD, "st-doc"],
  ["person", PATHS.person, "person-fact-doc"],
  ["proceeding", PATHS.proceeding, "pr-doc"],
  ["timeline", PATHS.timeline, "tl-doc"],
  ["calculation", PATHS.calculation, "calc-set"],
  ["money", PATHS.money, "mf-doc"],
];
const titles = (p, id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => o.textContent);
const sha = (i) => i.toString(16).padStart(64, "0");
/* the owner's paging, as capture R77 answers it: `limit` rows from the cursor `after`, `truncated` and `next` while more remain */
const held = (total) => (r) => {
  const q = r.query || {};
  const from = q.after ? Number(q.after) : 0;
  const n = Math.min(Number(q.limit) || 200, 1000);
  const rows = [];
  for (let i = from; i < Math.min(total, from + n); i++) rows.push({ bundle_id: "INFO-2026-" + String(i + 1).padStart(4, "0"), title: "Document " + (i + 1), capture: { sha256: sha(i + 1) } });
  const more = from + n < total;
  return ok({ ok: true, held: rows, state: q.state, limit: n, truncated: more, next: more ? String(from + n) : null });
};

for (const [name, path, field] of SCREENS_WITH_A_PICKER) {
  test(`R52 G20 ${name}: with 250 documents held the picker reaches the 250th, reading on by the cursor; control: 150 documents are read once`, async () => {
    const p = await open(path, { plane: { heldcaptures: held(250) } });
    const t = titles(p, field);
    assert.equal(t.length, 250, "every document is offered, not the first 200");
    assert.ok(t.some((x) => x.startsWith("Document 250")), "the 250th is offered");
    assert.ok(!p.doc.body.textContent.includes(word("screen.people.more", { n: "200" })), "nothing is left unsaid when nothing is left out");
    for (const r of p.byOp("heldcaptures")) assert.equal(r.query.state, "held_and_vouched");
    const few = await open(path, { plane: { heldcaptures: held(150) } });
    assert.equal(titles(few, field).length, 150);
    assert.equal(few.byOp("heldcaptures").length, 1, "a picker that fits its page reads once");
  });

  test(`R52 G20 ${name}: past the bound it keeps (three reads) the picker says how many documents it shows`, async () => {
    const p = await open(path, { plane: { heldcaptures: held(5000) } });
    const shown = titles(p, field).length;
    assert.ok(shown < 5000 && shown >= 1000, "the picker holds the bound it keeps");
    assert.ok(p.byOp("heldcaptures").length <= 3, "the bound is three reads");
    assert.ok(p.doc.body.textContent.includes(word("screen.people.more", { n: String(shown) })), "the number shown is said");
  });
}

test("R52 G20 timeline: the following pages are asked with the project's own filter, so the cursor continues the project's list", async () => {
  const p = await open(PATHS.timeline, { plane: { heldcaptures: held(250) } });
  const reads = p.byOp("heldcaptures");
  assert.ok(reads.length >= 2);
  for (const r of reads) assert.equal(r.query.project, reads[0].query.project, "every page asks for the same project");
  assert.ok(reads[0].query.project, "the project is asked for");
});
