/* reevaluation: the cross-version notice, its subject refusals and its question arm (R10, R11; C-80.1, C-80.2), and the
   "changed from" audit (R12, R13). Both are reads: every table is byte-identical across each. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, U } from "./fixture.mjs";
import { VERSION_NOTICE_SUBJECT_CHECKS, VERSION_NOTICE_LEGS_MAX, CHANGED_FROM_SENTENCE,
         CHANGED_FROM_AUDIT_LIMIT_DEFAULT, CHANGED_FROM_AUDIT_LIMIT_MAX } from "../../../src/reevaluation/index.mjs";
import { VERSION_NOTICE_STATES, VERSION_NOTICE_GRADES } from "../../../src/content/index.mjs";
import { VERSION_NOTICE_CHECKS } from "../../../checks/bio-checks.mjs";

const OLD = "INFO-2026-0001-old", NEW = "INFO-2026-0002-new", Q = "INQ-2026-0001-q", OTHER = "INQ-2026-0002-other";
const ADMIN = "class:admin";

/** A question resting on a passage of an older capture of an address, a newer capture of the same address, a leg on
 *  another question, and a leg on a document with no content row. */
function setup({ newText = "something else entirely" } = {}) {
  const w = world();
  const a = w.cap("a", "old"), b = w.cap("b", "new");
  w.doc(OLD, [a]); w.doc(NEW, [b]);
  w.read(a.sha, [U(0, "alpha"), U(1, "the budget was cut")]);
  w.read(b.sha, [U(0, "alpha"), U(1, newText)]);
  w.at(a.sha, "ex.org/doc", "2026-09-01T00:00:00Z"); w.at(b.sha, "ex.org/doc", "2026-09-20T00:00:00Z");
  const cid = w.passage(OLD, a.sha);
  w.inquiry(OTHER, {});
  w.inquiry(Q, { legs: [{ target: OLD, content_id: cid }, { target: OTHER }] });
  return { w, a, b, cid };
}
const quiet = (w, fn) => { const before = w.snapshot(); const r = fn(); assert.deepEqual(w.snapshot(), before, "a read writes nothing"); return r; };

test("R10: exactly one subject (C-80.1); a target that is not a question the viewer may see (C-80.2); a passage's refusal is content's (C-80.3)", () => {
  const { w, cid } = setup();
  const both = quiet(w, () => w.r.versionNotice({ target: Q, content: cid, viewer: ADMIN }));
  assert.deepEqual([both.ok, both.code, both.check, both.translation], [false, "VERSION_NOTICE_NO_SUBJECT", "C-80.1",
    VERSION_NOTICE_SUBJECT_CHECKS.VERSION_NOTICE_NO_SUBJECT.translation]);
  assert.equal(w.r.versionNotice({ viewer: ADMIN }).code, "VERSION_NOTICE_NO_SUBJECT");
  for (const target of ["INQ-2026-0099-none", OLD]) {
    const r = w.r.versionNotice({ target, viewer: ADMIN });
    assert.deepEqual([r.code, r.check, r.target], ["VERSION_NOTICE_NO_INQUIRY", "C-80.2", target]);
  }
  const unseen = w.r.versionNotice({ target: Q, viewer: "nobody" });
  const absent = w.r.versionNotice({ target: "INQ-2026-0099-none", viewer: "nobody" });
  assert.deepEqual([unseen.code, unseen.detail.replace(Q, "X")], [absent.code, absent.detail.replace("INQ-2026-0099-none", "X")],
    "absent and invisible alike");
  const c = w.r.versionNotice({ content: "9".repeat(64), viewer: ADMIN });
  assert.deepEqual([c.code, c.check, c.translation], ["VERSION_NOTICE_NO_CONTENT", "C-80.3",
    VERSION_NOTICE_CHECKS.VERSION_NOTICE_NO_CONTENT.translation]);
});

test("R11: a question's legs in order, a passage leg carrying content's notice, any other leg not asked; the vocabularies; wrote false", () => {
  const { w, a, b, cid } = setup();
  const r = quiet(w, () => w.r.versionNotice({ target: Q, viewer: ADMIN }));
  assert.deepEqual([r.ok, r.target, r.content, r.count, r.limit, r.truncated, r.wrote, r.proposal_only],
    [true, Q, null, 2, VERSION_NOTICE_LEGS_MAX, false, false, true]);
  assert.deepEqual([r.states, r.grades], [VERSION_NOTICE_STATES, VERSION_NOTICE_GRADES]);
  const [p, o] = r.notices;
  assert.deepEqual([p.ord, p.target, p.content_id, p.capture_sha, p.state, p.newer, p.affects, p.candidates[0].capture_sha],
    [0, OLD, cid, a.sha, "newer_capture_matched", true, "affected", b.sha]);
  assert.deepEqual([o.ord, o.target, o.content_id, o.state, o.newer, o.affects], [1, OTHER, null, "not_asked", null, null]);
  assert.match(o.why, /rests on no cited passage/);
  assert.match(r.visible_to, /visible to you/);
  assert.match(r.says, /nothing was moved/);
  /* the passage arm: content's notice, one subject */
  const one = quiet(w, () => w.r.versionNotice({ content: cid, viewer: ADMIN }));
  assert.deepEqual([one.target, one.content, one.count, one.limit, one.notices[0].content_id], [null, cid, 1, 1, cid]);
  assert.equal(one.notices[0].states, undefined, "the vocabularies ride on the answer once");
  /* limit clamped to 1..200, the applied figure published, truncated measured */
  const l1 = w.r.versionNotice({ target: Q, limit: 1, viewer: ADMIN });
  assert.deepEqual([l1.limit, l1.count, l1.truncated], [1, 1, true]);
  assert.equal(w.r.versionNotice({ target: Q, limit: 9999, viewer: ADMIN }).limit, VERSION_NOTICE_LEGS_MAX);
  assert.equal(w.r.versionNotice({ target: Q, limit: -3, viewer: ADMIN }).limit, 1);
  assert.equal(w.r.versionNotice({ target: Q, limit: "junk", viewer: ADMIN }).limit, VERSION_NOTICE_LEGS_MAX);
  /* a member sees the same answer */
  w.member("ann");
  assert.deepEqual(w.r.versionNotice({ target: Q, viewer: V("ann") }).notices.map((n) => n.state),
    r.notices.map((n) => n.state));
});

/** A document whose body carries the old writer's sentence naming `named`, holding `captures` at `address`. */
function sentence(named) { return `${CHANGED_FROM_SENTENCE}${named}). Kept for the record.`; }

test("R12: one verdict per live bundle.md holding the literal: right or wrong by the chain's predecessor; undetermined with its reason", () => {
  const w = world();
  const c0 = w.cap("c0", "v0"), c1 = w.cap("c1", "v1"), c2 = w.cap("c2", "v2"), c3 = w.cap("c3", "v3"), c4 = w.cap("c4", "v4");
  w.doc("INFO-2026-0001-first", [c0]);
  w.at(c0.sha, "ex.org/a", "2026-09-01T00:00:00Z");
  w.doc("INFO-2026-0002-right", [c1], { body: sentence("INFO-2026-0001-first") });
  w.at(c1.sha, "ex.org/a", "2026-09-02T00:00:00Z");
  w.doc("INFO-2026-0003-wrong", [c2], { body: sentence("INFO-2026-0009-other") });
  w.at(c2.sha, "ex.org/a", "2026-09-03T00:00:00Z");
  w.doc("INFO-2026-0004-several", [c3], { body: `${sentence("INFO-2026-0001-first")} ${sentence("INFO-2026-0002-right")}` });
  w.doc("INFO-2026-0005-none", [], { body: `${CHANGED_FROM_SENTENCE} nothing named here.` });
  w.doc("INFO-2026-0006-unheld", [c4], { body: sentence("INFO-2026-0001-first") });
  const c5 = w.cap("c5", "v5"), c6 = w.cap("c6", "v6");
  w.doc("INFO-2026-0007-oldest", [c5], { body: sentence("INFO-2026-0001-first") });
  w.at(c5.sha, "ex.org/b", "2026-08-01T00:00:00Z");
  w.doc("INFO-2026-0008-two", [c6, w.cap("c7", "v7")], { body: sentence("INFO-2026-0001-first") });
  w.at(c6.sha, "ex.org/c", "2026-09-01T00:00:00Z"); w.at(w.cap("c7", "v7").sha, "ex.org/d", "2026-09-01T00:00:00Z");
  const r = quiet(w, () => w.r.changedFromAudit({}));
  const by = Object.fromEntries(r.bundles.map((x) => [x.bundle_id, x]));
  assert.deepEqual([by["INFO-2026-0002-right"].verdict, by["INFO-2026-0002-right"].sole_prior,
                    by["INFO-2026-0002-right"].predecessor.bundle_id], ["right", true, "INFO-2026-0001-first"]);
  assert.deepEqual([by["INFO-2026-0003-wrong"].verdict, by["INFO-2026-0003-wrong"].sole_prior,
                    by["INFO-2026-0003-wrong"].predecessor.bundle_id], ["wrong", false, "INFO-2026-0002-right"]);
  const why = (id) => [by[id].verdict, by[id].why];
  assert.deepEqual(why("INFO-2026-0004-several"), ["undetermined", "several_named"]);
  assert.deepEqual(by["INFO-2026-0004-several"].named_all.sort(), ["INFO-2026-0001-first", "INFO-2026-0002-right"]);
  assert.deepEqual(why("INFO-2026-0005-none"), ["undetermined", "no_named_id"]);
  assert.deepEqual(why("INFO-2026-0006-unheld"), ["undetermined", "no_version_held"]);
  assert.deepEqual(why("INFO-2026-0007-oldest"), ["undetermined", "no_prior_version"]);
  assert.deepEqual([...why("INFO-2026-0008-two"), by["INFO-2026-0008-two"].versions_held], ["undetermined", "several_versions_held", 2]);
  assert.equal(by["INFO-2026-0001-first"], undefined, "a bundle without the literal is not affected");
});

test("R13: the three totals count every affected bundle; the listing clamped to 200 by default and 1,000 at most, with offset and truncated; it writes nothing", () => {
  const w = world();
  for (let i = 0; i < 5; i++) w.doc(`INFO-2026-000${i}-x`, [], { body: sentence("INFO-2026-0099-y") });
  const before = w.snapshot();
  const all = w.r.changedFromAudit({});
  assert.deepEqual([all.affected, all.undetermined, all.right, all.wrong, all.total, all.count, all.limit, all.offset, all.truncated, all.wrote],
    [5, 5, 0, 0, 5, 5, CHANGED_FROM_AUDIT_LIMIT_DEFAULT, 0, false, false]);
  const page = w.r.changedFromAudit({ limit: 2, offset: 1 });
  assert.deepEqual([page.affected, page.undetermined, page.count, page.offset, page.truncated, page.bundles.map((b) => b.bundle_id)],
    [5, 5, 2, 1, true, ["INFO-2026-0001-x", "INFO-2026-0002-x"]], "totals are whole; only the listing is bounded");
  assert.equal(w.r.changedFromAudit({ limit: 50000 }).limit, CHANGED_FROM_AUDIT_LIMIT_MAX);
  assert.match(all.note, /never evidence it was right/);
  assert.deepEqual(w.snapshot(), before, "every body stays byte-identical");
});
