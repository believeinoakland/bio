/* screens-inquiry fix round 4 (T51), C14 (the Project, Question and Document screens' read sets): each screen asks for each thing once. Performance was
 * counted in reads, not time (class b), so each screen's test asserts its read set: no read twice for the same thing, none per project, the document's own
 * copy by `bundle_id` and never a list of rows, and what the frame reads (`bootstrap`, `queue`) is the frame's own (interface-shell, control-plane R122, queue
 * R93), not this module's. On interface-shell's served page over a scripted plane; no sentence is copied. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, P, Q, D, SHA, storeWorld, PROJECT_MD } from "./fixtures.mjs";

/** the ops asked for the same thing twice, by op, query and body; `groupidentity` is read by the frame and by the project's stake (the frame's reads are
 *  interface-shell's, shared with the screens by cause-shell-4: not this module's to remove) */
const repeats = (p, except = ["groupidentity"]) => {
  const seen = new Map();
  for (const r of p.requests) { if (except.includes(r.op)) continue; const k = r.op + " " + JSON.stringify(r.query || {}) + " " + JSON.stringify(r.body || null); seen.set(k, (seen.get(k) || 0) + 1); }
  return [...seen.entries()].filter(([, n]) => n > 1).map(([k]) => k);
};
const ops = (p, op) => p.byOp(op).map((r) => r.query);

test("R1 R9 C14 the project reads its own questions once, their strength in one read, and no project's questions but its own; nothing is read twice for the same thing", async () => {
  /* the member's team holds twelve projects, started by the real act; she opens the first */
  const world = await storeWorld();
  const ann = await world.signIn("ann", { capabilities: ["contribute", "create_projects"] });
  const mine = await world.recipes.project(ann, "Pothole repairs");
  for (let i = 0; i < 11; i++) await world.recipes.project(ann, "Project " + i);
  const { door, session } = world.boot(ann);
  const p = await open("/app/project/" + mine, { images: { [mine]: { "bundle.md": PROJECT_MD.replace(P, mine) } }, boot: { door, session } });
  assert.deepEqual(ops(p, "projectquestions").map((q) => q.project), [mine], "only this project's questions, once");
  assert.equal(p.byOp("inquirystrength").length, 1, "one strength read for its two questions (G12c: strength's batch)");
  assert.deepEqual(repeats(p), [], "nothing is asked twice");
  assert.equal(p.byOp("bootstrap").length, 1, "the frame's one bootstrap");
});

test("R3 C14 the document reads its own copy by bundle_id alone, its questions once, and nothing twice", async () => {
  const p = await open("/app/document/" + D);
  const held = p.byOp("heldcaptures");
  assert.equal(held.length, 1, "one read of the held copies");
  assert.deepEqual([held[0].query.bundle_id, "limit" in held[0].query, "member" in held[0].query, "project" in held[0].query], [D, false, false, false], "this copy's row alone, no list of rows");
  assert.equal(p.byOp("reading").filter((r) => r.query.sha256 === SHA).length, 1, "its reading once");
  assert.deepEqual(repeats(p), [], "nothing is asked twice");
});

test("R2 C14 the question reads each thing once; a citing project's standing reading is asked once per project; nothing twice", async () => {
  const p = await open("/app/question/" + Q);
  assert.deepEqual(repeats(p), [], "nothing is asked twice");
  assert.equal(p.byOp("inquirystrength").filter((r) => r.query.id === Q).length, 1, "the strength once");
});
