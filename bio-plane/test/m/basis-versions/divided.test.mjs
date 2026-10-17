/* basis-versions R52 (T50; N1070; K3264; `inquiry` R64): a divided question is not revised through a reading act. Every act
   of this module that writes the question's document answers `inquiry`'s refusal `DIVIDED_CANNOT_RESTRUCTURE` relayed
   unchanged and writes nothing; a project's own acts are unchanged. Each test drives the acts at the interface, over the
   real record, promotion and content, and compares the refusal with the one `inquiry` gives the same revision. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, version, merge, V, MACHINE, inqMd } from "./fixture.mjs";
import { inquiryOf, dividedCannotRestructure } from "../../../src/inquiry/index.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-r";
const T = "2026-09-27T00:00:00Z", ALICE = "member:alice";
const ACCEPTED = { state: "accepted", claim: "the council approved it", state_by: ALICE, state_at: T, state_reason: "" };

/* A question holding a suggested version "sug" (legs on a document and on another question), a considering one "con"
   and an accepted one "acc" with a claim; `divided` flips its held state the way inquiry's own tests do. */
function setup({ divided = false } = {}) {
  const w = world();
  w.doc(DOC); w.member("alice");
  assert.equal(w.inquiry(Q2, block({})).ok, true);
  const r = w.inquiry(Q, block(merge(version("sug", [DOC, Q2], { claim: "the claim" }),
    version("con", [DOC], { state: "considering", state_by: ALICE, state_at: T, state_reason: "needs more work" }),
    version("acc", [DOC], ACCEPTED), { basis: [{ target: DOC, role: "supports" }], refs: [DOC] })));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  if (divided) w.st.sql.exec(`UPDATE bundles SET current_state='divided' WHERE bundle_id=?`, Q);
  return w;
}
const who = { author: ALICE, viewer: V("alice") };
const ACTS = {
  versionAccept: (w) => w.bv.versionAccept({ target: Q, version: "sug", ...who }),
  versionReject: (w) => w.bv.versionReject({ target: Q, version: "sug", reason: "not enough evidence", ...who }),
  versionConsider: (w) => w.bv.versionConsider({ target: Q, version: "sug", reason: "weighing it more", ...who }),
  versionRevert: (w) => w.bv.versionRevert({ target: Q, version: "con", ...who }),
  versionHide: (w) => w.bv.versionHide({ target: Q, version: "sug", ...who }),
  narrow: (w) => w.bv.narrow({ target: Q, version: "sug", ord: 0, name: "sug narrowed", ...who,
    description: "points at page three, where the vote is recorded", extent: { extent_kind: "pdf-page", extent_page: "2" } }),
  appendVersion: (w) => w.bv.appendVersion({ target: Q, author: MACHINE, at: T,
    version: { name: "proposed", description: "a proposed reading of the evidence", relationship: "and", author: MACHINE },
    grounds: [{ ground: "main", asserted_by: "none:independent-sufficiency", at: T }],
    legs: [{ target: DOC, role: "supports", ground: "main" }] }),
  "conclude (a named reading, no project)": (w) => w.bv.conclude({ target: Q, conclusion: "it was approved", falsifier: "f",
    version: "acc", ...who, identity: ALICE }),
  "conclude (own reading, no project)": (w) => w.bv.conclude({ target: Q, reading: "The council approved it", falsifier: "f",
    ...who, identity: ALICE }),
};

test("R52: each act that writes the question's document answers DIVIDED_CANNOT_RESTRUCTURE on a divided question — its code and from, not re-coded, wrapped or reworded — and bundle_sha is unchanged", () => {
  for (const [label, act] of Object.entries(ACTS)) {
    const w = setup({ divided: true });
    const sha = w.sha(Q), text = w.text(Q), versions = w.count("inquiry_basis_versions");
    const r = act(w);
    assert.deepEqual([r.ok, r.reason, r.code, r.from, r.target], [false, "DIVIDED_CANNOT_RESTRUCTURE", "DIVIDED_CANNOT_RESTRUCTURE", "divided", Q], label);
    assert.equal(r.check, undefined, `${label}: the code has no catalogue row`);
    assert.equal(r.translation, undefined, `${label}: no translation travels with it`);
    assert.equal(w.sha(Q), sha, `${label}: bundle_sha unchanged`);
    assert.equal(w.text(Q), text, `${label}: the bytes unchanged`);
    assert.equal(w.count("inquiry_basis_versions"), versions, `${label}: no version row`);
  }
});

test("R52 control: the same act on an open question lands", () => {
  for (const [label, act] of Object.entries(ACTS)) {
    const w = setup();
    const sha = w.sha(Q);
    const r = act(w);
    assert.equal(r.ok, true, `${label}: ${JSON.stringify(r).slice(0, 300)}`);
    assert.notEqual(w.sha(Q), sha, `${label}: the question's document was revised`);
  }
});

test("R52: a preview of a version act on a divided question answers the same refusal (R14), and a project's own acts are unchanged — versionCurrent lands", () => {
  const w = setup({ divided: true });
  for (const act of ["versionAccept", "versionReject", "versionConsider", "versionHide"]) {
    const r = w.bv[act]({ target: Q, version: "sug", reason: "a reason that lands", preview: "1", ...who });
    assert.deepEqual([r.ok, r.reason, r.wrote], [false, "DIVIDED_CANNOT_RESTRUCTURE", undefined], act);
  }
  const p = w.project("Team", "alice", [Q]);
  const sha = w.sha(Q);
  const cur = w.bv.versionCurrent({ target: Q, version: "acc", project: p, ...who, identity: ALICE });
  assert.equal(cur.ok, true, JSON.stringify(cur).slice(0, 300));
  assert.equal(w.sha(Q), sha, "it writes the project only (R15)");
  assert.match(w.text(p), /current_versions:\n  - inquiry: "INQ-2026-0001-q"\n    version: "acc"/);
  /* a project's conclusion is the project's write (R31) and is not refused by this rule: the question's own state
     machine still decides whether the question can be concluded on (R16) */
  const c = w.bv.conclude({ target: Q, project: p, falsifier: "f", ...who, identity: ALICE });
  assert.notEqual(c.reason, "DIVIDED_CANNOT_RESTRUCTURE");
});

test("R52: the refusal is inquiry's own — the answer equals what inquiry gives a revision of the same divided question (its code, from, target and children), through its one helper", () => {
  const w = setup();
  /* inquiry's real instance on the same host, for its own refusal of the revision; its tables replace the fixture's stand-in */
  w.st.db.exec("DROP TABLE inquiry_basis");
  const inq = inquiryOf(w.host, { record: w.record, membership: w.membership, promotion: w.promotion, content: w.content });
  inq.migrate();
  w.st.sql.exec(`UPDATE bundles SET current_state='divided' WHERE bundle_id=?`, Q);
  const viaPromote = w.revise(Q, w.text(Q).replace("current_state: open", "current_state: divided").replace("What happened?", "What exactly happened?"));
  assert.equal(viaPromote.reason, "DIVIDED_CANNOT_RESTRUCTURE", JSON.stringify(viaPromote).slice(0, 300));
  const mine = ACTS.versionAccept(w);
  assert.deepEqual(mine, { ...dividedCannotRestructure(mine.detail, { target: Q }), act: "accept", version: "sug" },
    "minted by the one helper over its own detail");
  assert.equal(mine.detail, viaPromote.detail, "inquiry's text, word for word");
  for (const k of ["reason", "code", "from", "target"]) assert.equal(mine[k], viaPromote[k], k);
});
