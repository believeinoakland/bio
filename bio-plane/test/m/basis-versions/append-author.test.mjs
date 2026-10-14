/* basis-versions R28 (T48-27; N1013, K3099) at the module's interface: `appendVersion`'s documented `version.author`,
   the version's author as the record holds it, is written on the version row, and it is the field R49's accept arm
   reads to tell a machine-authored version. A version appended with a machine `version.author` is asked at
   `versionAccept`, once, over its legs; one appended with a member's is not. The call's outer `author` (who promotes)
   is the same machine in both arms, so the only difference is `version.author`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, V, MACHINE } from "./fixture.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", Q = "INQ-2026-0001-q";
const T = "2026-09-27T00:00:00Z", ALICE = "member:alice";

function setup() {
  const w = world();
  w.doc(DOC); w.doc(DOC2);
  const calls = [];
  w.bv.onMachinePassage("run-productions", (a) => { calls.push(JSON.parse(JSON.stringify(a))); return null; });
  assert.equal(w.inquiry(Q, block({})).ok, true);
  return { w, calls };
}

/* One appended version, its outer author a machine (as run-productions' op=suggest calls it), `version.author` given. */
function append(w, versionAuthor) {
  const r = w.bv.appendVersion({ target: Q, author: MACHINE, at: T,
    version: { name: "proposed", description: "a proposed reading of the evidence", relationship: "and",
               author: versionAuthor },
    grounds: [{ ground: "main", asserted_by: "none:independent-sufficiency", at: T }],
    legs: [{ target: DOC, role: "supports", ground: "main" }, { target: DOC2, role: "supports", ground: "main" }] });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  return r;
}

test("R28: appendVersion writes the documented version.author on the version row as the record holds it, in the caller's order after the version's own fields", () => {
  for (const who of [MACHINE, ALICE]) {
    const { w } = setup();
    append(w, who);
    assert.equal(w.row(`SELECT author FROM inquiry_basis_versions WHERE bundle_id=? AND name='proposed'`, Q).author, who);
    assert.match(w.text(Q), new RegExp(`\\n  - name: "proposed"\\n    description: "a proposed reading of the evidence"\\n`
      + `    relationship: "and"\\n    state: "suggested"\\n    hidden: false\\n    author: "${who}"\\n`));
  }
});

test("R28: a version appended with a machine version.author, then accepted by a member, calls the registered onMachinePassage read once with its legs, the accepting member as author", () => {
  const { w, calls } = setup();
  append(w, MACHINE);
  assert.deepEqual(calls, [], "the machine's own append is never asked (R49)");
  const r = w.bv.versionAccept({ target: Q, version: "proposed", author: ALICE, viewer: V("alice") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(calls, [{ legs: [{ version: "proposed", ord: 0, target: DOC }, { version: "proposed", ord: 1, target: DOC2 }],
                             author: ALICE, viewer: ALICE }], "asked exactly once, over the version's legs");
  assert.equal(w.row(`SELECT state FROM inquiry_basis_versions WHERE name='proposed'`).state, "accepted");
});

test("R28 (control): the same version appended with a member's version.author and accepted by a member is not asked", () => {
  const { w, calls } = setup();
  append(w, ALICE);
  const r = w.bv.versionAccept({ target: Q, version: "proposed", author: ALICE, viewer: V("alice") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(calls, [], "not asked: the record does not hold it as machine-authored");
  assert.equal(w.row(`SELECT state FROM inquiry_basis_versions WHERE name='proposed'`).state, "accepted");
});
