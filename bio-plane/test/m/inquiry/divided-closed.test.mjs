/* R64 (T48; N1012; K3092, K3102; K231; amends R11, R27): a divided question's document is closed. Every revision of an
   inquiry whose held state is `divided` is refused by R11's check with `ground`'s `DIVIDED_CANNOT_RESTRUCTURE`, through
   the one helper `dividedCannotRestructure`, and nothing is written; `divide`'s own write, its children's creation and
   every revision of a child land. `citation`'s own `sever-inquiry` test confirms its relay of this answer. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { dividedCannotRestructure } from "../../../src/inquiry/index.mjs";

const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b";
const P = "INQ-2026-0001-p", C1 = "INQ-2026-0002-a", C2 = "INQ-2026-0003-b";
const KIDS = [{ id: C1, question: "First half?", legs: [0] }, { id: C2, question: "Second half?", legs: [1] }];

function setup() {
  const w = world(); w.doc(A); w.doc(B);
  w.inquiry(P, { legs: [{ target: A }, { target: B, role: "cuts_against" }] });
  return w;
}
function divided() {
  const w = setup();
  const d = w.k.divide({ target: P, reason: "two questions", children: KIDS, viewer: "admin", author: V("alice") });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 400));
  return w;
}
/* A revision shaped as `citation`'s sever writes it: the leg's `cites` reference to `target` marked `severed`. */
const severed = (text, target) => {
  const lines = text.split("\n");
  const at = lines.indexOf(`  - target: ${target}`);
  assert.ok(at > 0, `a reference to ${target}`);
  const s = lines.findIndex((l, i) => i > at && /^ {4}status: /.test(l));
  lines[s] = "    status: severed";
  return lines.join("\n");
};
const basisRows = (w, id) => w.rows(`SELECT * FROM inquiry_basis WHERE bundle_id=? ORDER BY ord`, id);
const still = (w, id) => ({ sha: w.record.head(id).bundleSha, text: w.text(id), basis: basisRows(w, id) });

test("R64 a sever-shaped revision of a divided question is refused DIVIDED_CANNOT_RESTRUCTURE, and its document and inquiry_basis are unchanged", () => {
  const w = divided();
  const before = still(w, P);
  assert.equal(before.basis.length, 2, "the parent's legs are projected");
  const r = w.promote(P, severed(w.text(P), A));
  assert.equal(r.ok, false);
  assert.equal(r.reason, "DIVIDED_CANNOT_RESTRUCTURE");
  assert.equal(r.code, "DIVIDED_CANNOT_RESTRUCTURE");
  assert.equal(r.target, P); assert.equal(r.from, "divided");
  assert.deepEqual(r.children, [C1, C2], "the children the held document records, where the work goes on");
  assert.match(r.detail, /child that carries the part you mean/);
  assert.equal(r.check, undefined, "the code has no catalogue row"); assert.equal(r.translation, undefined);
  assert.deepEqual(still(w, P), before, "nothing was written: the head, the bytes and inquiry_basis");
  /* minted by the one helper: the answer is the helper's over its own detail and fields */
  assert.deepEqual(r, dividedCannotRestructure(r.detail, { target: P, children: [C1, C2] }));
});

test("R64 R27 ground on the same divided question answers the same code from the same helper (K231)", () => {
  const w = divided();
  const before = still(w, P);
  const sev = w.promote(P, severed(w.text(P), A));
  const g = w.k.ground({ target: P, grounds: [{ ground: "g1", legs: [0, 1] }], viewer: "admin", author: V("alice") });
  assert.equal(g.ok, false);
  assert.deepEqual([g.reason, g.code, g.target, g.from], [sev.reason, sev.code, sev.target, sev.from]);
  assert.deepEqual(g, dividedCannotRestructure(g.detail, { target: P }), "ground's answer is the helper's");
  assert.deepEqual(still(w, P), before);
});

test("R64 every revision of a divided question is refused, whichever door and whatever it changes: a reinstatement, a leg added, a conclusion, a grouping, the same bytes", () => {
  const w = divided();
  /* a severed reference on the divided parent, held through a migration replay (which is not asked), so that a
     reinstatement through citation has something to reinstate */
  assert.equal(w.promote(P, severed(w.text(P), A), undefined, { replay: true }).ok, true);
  const before = still(w, P);
  const held = w.text(P);
  assert.match(held, /status: severed/);
  const revisions = {
    reinstate: held.replace("status: severed", "status: confirmed"),
    "a leg added": held.replace(/^basis:\n/m, `basis:\n  - target: ${B}\n    role: supports\n`),
    "a conclusion": held.replace(/^current_state: divided$/m, 'current_state: divided\nconclusion: "Answered after all."'),
    "a grouping": held.replace(/^(  - target: INFO-2026-0001-a\n    role: supports)$/m, "$1\n    ground: g1")
      .replace(/^(  - target: INFO-2026-0002-b\n    role: cuts_against)$/m, "$1\n    ground: g1")
      .replace(/^---\n\n## Question/m, `grounds:\n  - ground: g1\n    asserted_by: ${V("alice")}\n    at: "2026-09-28T01:00:00Z"\n---\n\n## Question`),
    "the same bytes": held,
  };
  for (const [what, text] of Object.entries(revisions)) {
    const r = w.promote(P, text);
    assert.equal(r.reason, "DIVIDED_CANNOT_RESTRUCTURE", `${what}: ${JSON.stringify(r).slice(0, 300)}`);
    assert.equal(r.from, "divided", what);
  }
  /* a revision that moves the state is refused before any step by promotion's own state machine (divided is terminal) */
  assert.equal(w.promote(P, held.replace(/^current_state: divided$/m, "current_state: open")).ok, false);
  assert.deepEqual(still(w, P), before, "nothing was written by any of them");
});

test("R64 controls: the same sever lands on an open question; a child's revision lands; divide's own write and its children's creation land", () => {
  /* an open question: the same sever-shaped revision lands */
  const w0 = setup();
  const open = w0.promote(P, severed(w0.text(P), A));
  assert.equal(open.ok, true, JSON.stringify(open).slice(0, 300));
  assert.match(w0.text(P), /status: severed/);
  /* divide writes the parent from a state that is not divided, and creates its children */
  const w = divided();
  assert.equal(w.fm(P).current_state, "divided");
  assert.equal(w.fm(C1).current_state, "open"); assert.equal(w.fm(C2).current_state, "open");
  /* a child's revision lands: a sever-shaped one, then a conclusion-free edit of its question */
  const c = w.promote(C1, severed(w.text(C1), A));
  assert.equal(c.ok, true, JSON.stringify(c).slice(0, 300));
  assert.match(w.text(C1), new RegExp(`target: ${A}\\n    rel: cites\\n    status: severed`));
  const c2 = w.promote(C2, w.text(C2).replace("Second half?", "Second half, restated?"));
  assert.equal(c2.ok, true, JSON.stringify(c2).slice(0, 300));
});

test("R64 a migration replay of a divided question's document is not asked, as R11's other judging arms are not", () => {
  const w = divided();
  const r = w.promote(P, severed(w.text(P), A), undefined, { replay: true });
  assert.notEqual(r.reason, "DIVIDED_CANNOT_RESTRUCTURE", JSON.stringify(r).slice(0, 300));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
});

test("R64 dividedCannotRestructure is pure: target and from carried, extra never replaces its fields, a default detail, never throws", () => {
  const a = dividedCannotRestructure("work on the child", { target: P, extra: 1, ok: true, reason: "X", code: "Y", from: "open" });
  assert.deepEqual(a, { target: P, extra: 1, ok: false, reason: "DIVIDED_CANNOT_RESTRUCTURE", code: "DIVIDED_CANNOT_RESTRUCTURE",
                        from: "divided", detail: "work on the child" });
  const d = dividedCannotRestructure();
  assert.equal(d.target, null); assert.equal(d.from, "divided"); assert.match(d.detail, /child that carries the part you mean/);
  for (const bad of [null, 7, "x", [1], { target: 9 }])
    assert.equal(dividedCannotRestructure(42, bad).reason, "DIVIDED_CANNOT_RESTRUCTURE");
  assert.equal(dividedCannotRestructure("d", { target: 9 }).target, null);
  assert.deepEqual(dividedCannotRestructure("d", { target: P }), dividedCannotRestructure("d", { target: P }), "the same answer twice");
});
