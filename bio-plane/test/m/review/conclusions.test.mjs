/* review T51 (fix round 4): a question concluded by a project, or by the question's own `conclude`, reads as concluded in
   its own words at both doors and in `list`, never "Not concluded yet" (C46, R41, R12). The questions are concluded by the
   real `conclude` through the real basis-versions and ratification (case-authoring's fixture builds them), not by a
   string put into a front matter: the walker's question carried the conclusion as the project's record, with no
   `conclusion` in its own bytes. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, readingLines, currentLines } from "../case-authoring/fixture.mjs";
import { reviewOf } from "../../../src/review/index.mjs";
import { sha as shaOf } from "./fixture.mjs";

const DOC = "INFO-2026-0001-a";
const Q = "INQ-2026-0001-q", OWN = "INQ-2026-0002-o", NONE = "INQ-2026-0003-n";
const CLAIM = "Federal agencies must disclose requested records unless one of nine exemptions applies.";
const OWN_WORDS = "The agency answered inside the statutory twenty days.";
const SECRET = shaOf("secret-c46");

function setup() {
  const w = world({ provider: false });
  for (const m of ["alice", "bo"]) w.member(m);
  w.doc(DOC);
  /* open questions with an accepted reading and no conclusion in their own bytes: what a project's adoption leaves */
  for (const q of [Q, OWN, NONE])
    w.finding(q, [{ target: DOC }], { state: "open", lines: readingLines("first", [DOC], q === OWN ? OWN_WORDS : CLAIM) });
  const P = w.project("Team", "alice", [Q, OWN, NONE], { extra: [...currentLines(Q), ...currentLines(OWN).slice(1), ...currentLines(NONE).slice(1)] });
  const r = reviewOf(w.host, { record: w.record, membership: w.membership, strength: w.strength,
    basisVersions: w.basisVersions, publication: w.publication, caseAuthoring: w.ca, caseInputs: w.ci,
    caseAccount: w.cacc, ratification: w.ratification, now: () => w.clock.ms });
  return { w, P, r };
}
const conclude = (w, o) => w.basisVersions.conclude({ author: "alice", viewer: V("alice"), identity: V("alice"), ...o });
const doors = (w, r, P, targets) => {
  const d = r.act({ act: "draft", author: "alice", project: P, targets });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  assert.equal(r.act({ act: "grant", author: "alice", draft: d.draftId, recipient: "Reader", secretSha: SECRET }).ok, true);
  return { member: r.copy({ draft: d.draftId, viewer: V("alice") }), outside: r.copy({ secretSha: SECRET, bySecret: true }) };
};
const plain = (s) => assert.ok(!/(^|\n)## |Not concluded yet/.test(String(s ?? "")), String(s));

test("R41, R12: a question the project concluded by adopting a reading reads as concluded in the claim's words at the member door, the outside reader's door and in the concluded list; its own bytes hold no conclusion (C46)", () => {
  const { w, P, r } = setup();
  assert.ok(!/^conclusion:/m.test(w.text(Q)), "the fixture is the walker's: the question's own bytes hold no conclusion");
  const c = conclude(w, { target: Q, project: P, falsifier: "A court order holding an exemption applies to every record." });
  assert.equal(c.ok, true, JSON.stringify(c).slice(0, 300));
  assert.equal(c.inquiry_moved, false);
  assert.ok(!/^conclusion:/m.test(w.text(Q)), "the project's conclusion is its own record, not the question's bytes");
  const { member, outside } = doors(w, r, P, [Q]);
  for (const [door, copy] of [["member", member], ["recipient", outside]]) {
    const f = copy.findings[0];
    assert.deepEqual([f.present, f.concluded, f.not_concluded], [true, true, null], door);
    assert.equal(f.statement, CLAIM, door);
    assert.equal(f.falsifier, "A court order holding an exemption applies to every record.", door);
    plain(f.statement); plain(f.falsifier);
  }
  const listed = r.list({ project: P, viewer: V("alice") }).concluded;
  assert.deepEqual(listed.map((x) => x.inquiry), [Q]);
  assert.deepEqual([listed[0].findings[0].statement, listed[0].findings[0].concluded, listed[0].findings[0].not_concluded], [CLAIM, true, null]);
});

test("R41, R12: a question concluded by `conclude` with no project reads as concluded in its conclusion's words at both doors (the other conclusion of C46, control)", () => {
  const { w, P, r } = setup();
  const c = conclude(w, { target: OWN, conclusion: OWN_WORDS, falsifier: "A clerk's log dating the answer later.", version: "first" });
  assert.equal(c.ok, true, JSON.stringify(c).slice(0, 300));
  const { member, outside } = doors(w, r, P, [OWN]);
  for (const [door, copy] of [["member", member], ["recipient", outside]]) {
    const f = copy.findings[0];
    assert.deepEqual([f.concluded, f.not_concluded, f.statement, f.falsifier],
      [true, null, OWN_WORDS, "A clerk's log dating the answer later."], door);
  }
});

test("R41: control: a question nobody concluded, and one the project concluded then withdrew, read as not concluded yet with no heading and no claim; another project's conclusion is not this project's", () => {
  const { w, P, r } = setup();
  const other = w.project("Other", "bo", [Q], { extra: currentLines(Q) });
  assert.equal(conclude(w, { target: Q, project: other, falsifier: "f", author: "bo", viewer: V("bo"), identity: V("bo") }).ok, true);
  assert.equal(conclude(w, { target: OWN, project: P, falsifier: "f" }).ok, true);
  assert.equal(w.basisVersions.withdrawConclusion({ target: OWN, project: P, reason: "restated", who: V("alice"),
    viewer: V("alice"), identity: V("alice") }).ok, true);
  const { member, outside } = doors(w, r, P, [NONE, OWN, Q]);
  for (const [door, copy] of [["member", member], ["recipient", outside]]) {
    for (const f of copy.findings) {
      assert.deepEqual([f.concluded, f.statement, f.falsifier], [false, null, null], `${door}: ${f.target}`);
      assert.equal(typeof f.not_concluded, "string", door);
      assert.ok(!/^#|\n## /.test(f.not_concluded), door);
    }
  }
});
