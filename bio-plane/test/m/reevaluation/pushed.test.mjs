/* reevaluation: the pushed notice (R14) and the member's choice (R15), Bob's 2026-09-25 00:40Z version doctrine, rules 2
   and 3: one notice per (holder, reference, newer capture), only when the newer version affects the passage or whether
   it does is undetermined; ADOPT writes a new version pinned to the newer capture and KEEP records staying; either
   closes the notice for good, and a machine may take neither. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, U, MACHINE } from "./fixture.mjs";
import { REEVALUATION_ACT_CHECKS, NOTE_MAX, ADOPT_WHY_MAX, reevaluationOps } from "../../../src/reevaluation/index.mjs";

const OLD = "INFO-2026-0001-old", NEW = "INFO-2026-0002-new", NEWER = "INFO-2026-0003-newer";
const Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q2";
const ADMIN = "class:admin";
const CUT = "the budget was cut";
/* R15 (DEC-88): an adoption's required why. */
const WHY = "the newer version restates the same cut";

/** A question resting (leg 0) on page 2 of an older capture; a newer capture of the same address whose page 2 reads
 *  `newText` (null: the newer capture is unread). */
function setup({ newText = "something else entirely", address = true, grade = null, q2 = false } = {}) {
  const w = world();
  const a = w.cap("a", "old"), b = w.cap("b", "new");
  w.doc(OLD, [a]); w.doc(NEW, [b]);
  w.read(a.sha, [U(0, "alpha"), U(1, CUT)]);
  if (newText !== null) w.read(b.sha, [U(0, "alpha"), U(1, newText)]);
  if (address) { w.at(a.sha, "ex.org/doc", "2026-09-01T00:00:00Z"); w.at(b.sha, "ex.org/doc", "2026-09-20T00:00:00Z"); }
  const cid = w.passage(OLD, a.sha);
  w.inquiry(Q, { legs: [{ target: OLD, content_id: cid, ...(grade ? { grade, grade_axis: "capture", grade_source: "capture" } : {}) },
                        { target: NEW }] });
  if (q2) w.inquiry(Q2, { legs: [{ target: OLD, content_id: cid }] });
  return { w, a, b, cid };
}

test("R14: an affected newer capture raises one notice per (holder, reference, newer capture); never for A or B; a re-sweep raises nothing", () => {
  {
    const { w, a, b, cid } = setup();
    const r = w.r.raiseNotices({});
    assert.deepEqual([r.ok, r.examined, r.count, r.truncated, r.cursor], [true, 2, 1, false, null], "leg 1 rests on the newest capture itself");
    const [n] = r.raised;
    assert.deepEqual([n.holder, n.ord, n.content_id, n.target, n.capture_sha, n.newer_capture, n.grade, n.affects],
      [Q, 0, cid, OLD, a.sha, b.sha, "NOT_FOUND", "affected"]);
    assert.equal(w.r.raiseNotices({}).count, 0, "a notice once raised is never raised again");
    const list = w.r.notices({ viewer: ADMIN });
    assert.deepEqual([list.count, list.notices[0].notice, list.notices[0].state, list.notices[0].newer_bundle],
      [1, n.notice, "open", NEW]);
  }
  {
    const { w } = setup({ newText: `${CUT} today and more` });
    const r = w.r.raiseNotices({});
    assert.deepEqual([r.count, r.raised[0].grade, r.raised[0].affects], [1, "C", "affected"]);
  }
  for (const newText of [CUT]) {
    const { w } = setup({ newText });
    assert.equal(w.r.raiseNotices({}).count, 0, "A: unaffected, no notice");
  }
  {
    const { w, a, b } = setup({ newText: CUT });
    /* B: the same text at another place */
    w.read(b.sha, [U(0, CUT), U(1, "alpha")]);
    assert.equal(w.r.raiseNotices({}).count, 0, "B: unaffected, no notice");
    assert.ok(a && b);
  }
  {
    const { w } = setup({ newText: null });
    const r = w.r.raiseNotices({});
    assert.deepEqual([r.count, r.raised[0].grade, r.raised[0].affects], [1, "UNDETERMINED", "undetermined"],
      "undetermined is notified as undetermined, never passed over");
  }
});

test("R14: chain_unread raises no pushed notice; a yet newer capture raises a new one; each holder is told; the sweep pages; listeners hear it", () => {
  {
    const { w } = setup({ address: false });
    const r = w.r.raiseNotices({});
    assert.deepEqual([r.count, r.chain_unread], [0, 2], "no newer capture can be known: the pull read answers it by name");
  }
  {
    const { w, cid } = setup({ q2: true });
    const heard = [];
    w.r.onBasisChanged("conformance", (e) => heard.push(e));
    const first = w.r.raiseNotices({ limit: 1 });
    assert.deepEqual([first.count, first.truncated, first.cursor], [1, true, `${Q}#0`]);
    const holders = [];
    for (let cur = first.cursor; cur;) {
      const page = w.r.raiseNotices({ limit: 1, after: cur });
      holders.push(...page.raised.map((n) => n.holder));
      cur = page.cursor;
    }
    assert.deepEqual(holders, [Q2], "one notice to each holder, the rest of the legs read page by page");
    assert.deepEqual(heard.map((e) => [e.kind, e.subject, e.source, e.dependents[0].bundle_id, e.affects]),
      [["passage", cid, "newer_capture", Q, "affected"], ["passage", cid, "newer_capture", Q2, "affected"]]);
    /* a yet newer capture */
    const c = w.cap("c", "newest");
    w.doc(NEWER, [c]);
    w.read(c.sha, [U(0, "alpha"), U(1, "rewritten again")]);
    w.at(c.sha, "ex.org/doc", "2026-09-25T00:00:00Z");
    const again = w.r.raiseNotices({});
    assert.deepEqual(again.raised.map((n) => [n.holder, n.ord, n.newer_capture]), [[Q, 0, c.sha], [Q, 1, c.sha], [Q2, 0, c.sha]],
      "every reference whose capture has a yet newer version, the whole-document leg on the newer capture included");
    assert.equal(w.r.notices({ viewer: ADMIN }).count, 5);
    assert.equal(w.r.notices({ holder: Q2, viewer: ADMIN }).count, 2);
    assert.equal(w.r.notices({ viewer: "nobody" }).count, 0, "a holder the viewer may not see is withheld");
  }
});

test("R15: a machine may take neither act (C-110.1, C-110.2); an unknown or closed notice is refused; each refusal writes nothing", () => {
  const { w } = setup();
  const [n] = w.r.raiseNotices({}).raised;
  const before = w.snapshot();
  for (const [act, code, check] of [["adoptVersion", "MACHINE_CANNOT_ADOPT_VERSION", "C-110.1"],
                                    ["keepVersion", "MACHINE_CANNOT_KEEP_VERSION", "C-110.2"]]) {
    for (const author of [MACHINE, "", null]) {
      const r = w.r[act]({ notice: n.notice, author, viewer: ADMIN });
      assert.deepEqual([r.ok, r.code, r.check, r.translation], [false, code, check, REEVALUATION_ACT_CHECKS[code].translation]);
    }
    const nf = w.r[act]({ notice: "RN-nope", why: WHY, author: "alice", viewer: ADMIN });
    assert.deepEqual([nf.code, nf.check], ["VERSION_NOTICE_NOT_FOUND", "C-110.3"]);
    assert.equal(w.r[act]({ notice: n.notice, why: WHY, author: "alice", viewer: "nobody" }).code, "VERSION_NOTICE_NOT_FOUND",
      "a notice on a question the viewer may not see answers as absent");
  }
  const bad = w.r.keepVersion({ notice: n.notice, why: "x".repeat(NOTE_MAX + 1), author: "alice", viewer: ADMIN });
  assert.deepEqual([bad.code, bad.check], ["VERSION_CHOICE_WHY_MALFORMED", "C-110.5"]);
  assert.equal(w.r.keepVersion({ notice: n.notice, why: "a\nb", author: "alice", viewer: ADMIN }).code, "VERSION_CHOICE_WHY_MALFORMED");
  assert.deepEqual(w.snapshot(), before);
  assert.equal(w.r.keepVersion({ notice: n.notice, author: "alice", viewer: ADMIN }).ok, true);
  const closed = w.r.adoptVersion({ notice: n.notice, why: WHY, author: "bo", viewer: ADMIN });
  assert.deepEqual([closed.code, closed.check, closed.state], ["VERSION_NOTICE_CLOSED", "C-110.4", "kept"]);
});

test("R15: KEEP records staying on the earlier version with who, when, why and both captures, and closes the notice for that capture", () => {
  const { w, a, b } = setup();
  const [n] = w.r.raiseNotices({}).raised;
  const k = w.r.keepVersion({ notice: n.notice, why: "the earlier wording is what we quoted", author: "alice", viewer: ADMIN });
  assert.deepEqual([k.ok, k.act, k.author, k.at, k.why, k.capture_sha, k.newer_capture], [true, "kept", "alice",
    "2026-09-28T01:00:00Z", "the earlier wording is what we quoted", a.sha, b.sha]);
  const [row] = w.r.notices({ state: "kept", viewer: ADMIN }).notices;
  assert.deepEqual([row.state, row.closed_by, row.why], ["kept", "alice", "the earlier wording is what we quoted"]);
  assert.equal(w.r.notices({ viewer: ADMIN }).count, 0, "no longer open");
  assert.equal(w.r.raiseNotices({}).count, 0, "a later sweep does not raise it again for the same capture");
  const text = w.text(Q);
  assert.equal(w.text(Q), text, "the reference is not moved");
});

test("R15 R19: ADOPT writes a new basis version with the leg pinned to the newer capture; the live basis and the old reference stay readable", () => {
  const { w, a, b, cid } = setup({ grade: "B" });
  const [n] = w.r.raiseNotices({}).raised;
  const liveBefore = JSON.stringify(w.fm(Q).basis);
  const legsBefore = JSON.stringify(w.rows(`SELECT * FROM inquiry_basis ORDER BY bundle_id, ord`));
  const r = w.r.adoptVersion({ notice: n.notice, why: WHY, author: "alice", viewer: ADMIN });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 600));
  assert.deepEqual([r.act, r.version, r.state, r.capture_sha, r.newer_capture], ["adopted", `adopt-${b.sha.slice(0, 8)}-0`,
    "suggested", a.sha, b.sha]);
  assert.deepEqual(r.grade_not_carried.grade, "B");
  const fm = w.fm(Q);
  assert.equal(JSON.stringify(fm.basis), liveBefore, "the live basis is untouched");
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM inquiry_basis ORDER BY bundle_id, ord`)), legsBefore);
  const v = fm.basis_versions.find((x) => x.name === r.version);
  assert.deepEqual([v.state, v.relationship], ["suggested", "and"]);
  const vlegs = fm.basis_version_legs.filter((l) => l.version === r.version);
  assert.deepEqual(vlegs.map((l) => l.target), [NEW, NEW], "the adopted leg names the document the newer capture is held in");
  assert.deepEqual([vlegs[0].extent_kind, vlegs[0].extent_page, vlegs[0].extent_capture, vlegs[0].content_id, vlegs[0].grade],
    ["pdf-page", 1, b.sha, undefined, undefined]);
  /* the old reference: its content row and the live leg on it are still read */
  assert.equal(w.content.contentRow(cid).capture_sha, a.sha);
  assert.equal(w.rows(`SELECT content_id FROM inquiry_basis WHERE bundle_id=? AND ord=0`, Q)[0].content_id, cid);
  /* the version's own legs name the newer capture's passage (basis-versions' projection) */
  const pinned = w.rows(`SELECT content_id FROM inquiry_basis_version_legs WHERE bundle_id=? AND name=? AND ord=0`, Q, r.version)[0];
  assert.equal(w.content.contentRow(pinned.content_id).capture_sha, b.sha);
  const [row] = w.r.notices({ state: "adopted", viewer: ADMIN }).notices;
  assert.deepEqual([row.closed_by, row.adopted_version], ["alice", r.version]);
  assert.equal(w.r.raiseNotices({}).count, 0, "closed for that capture");
});

test("R15: ADOPT names the newer capture's held row at the same extent; a leg no longer as the notice read it is refused (C-110.9), nothing written", () => {
  const { w, b } = setup();
  const there = w.passage(NEW, b.sha);
  const [n] = w.r.raiseNotices({}).raised;
  const r = w.r.adoptVersion({ notice: n.notice, why: WHY, author: "alice", viewer: ADMIN });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  const [leg] = w.fm(Q).basis_version_legs.filter((l) => l.version === r.version);
  assert.deepEqual([leg.content_id, leg.extent_capture, leg.extent_kind], [there, undefined, undefined]);
  /* a second notice whose leg has since changed */
  const s2 = setup();
  const [n2] = s2.w.r.raiseNotices({}).raised;
  s2.w.promote(Q, s2.w.text(Q).replace(/  - target: INFO-2026-0001-old\n    role: supports\n    content_id: [0-9a-f]+\n/, ""));
  const before = s2.w.snapshot();
  const gone = s2.w.r.adoptVersion({ notice: n2.notice, why: WHY, author: "alice", viewer: ADMIN });
  assert.deepEqual([gone.ok, gone.code, gone.check], [false, "VERSION_ADOPT_UNWRITABLE", "C-110.9"]);
  assert.deepEqual(s2.w.snapshot(), before);
  assert.equal(s2.w.r.notices({ viewer: ADMIN }).count, 1, "the notice stays open");
});

test("R15 (DEC-88): ADOPT requires the member's why (C-110.29): absent, not a string, blank or over 2,000 characters is refused after the machine refusal with nothing written; a reasoned adoption records it with the version and on the notice; KEEP still takes none", () => {
  const { w, b } = setup();
  const [n] = w.r.raiseNotices({}).raised;
  const before = w.snapshot();
  const fmBefore = JSON.stringify(w.fm(Q));
  const row = REEVALUATION_ACT_CHECKS.VERSION_ADOPT_NO_REASON;
  for (const why of [undefined, null, 42, ["a reason"], { why: "a reason" }, "", "   \n ", "x".repeat(ADOPT_WHY_MAX + 1)]) {
    const r = w.r.adoptVersion({ notice: n.notice, ...(why === undefined ? {} : { why }), author: "alice", viewer: ADMIN });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.notice, r.limit],
      [false, "VERSION_ADOPT_NO_REASON", "VERSION_ADOPT_NO_REASON", "C-110.29", row.translation, n.notice, ADOPT_WHY_MAX],
      `refused: ${JSON.stringify(why)?.slice(0, 40)}`);
  }
  /* the machine refusal is asked first, reason or none */
  for (const why of [undefined, "a reason"])
    assert.equal(w.r.adoptVersion({ notice: n.notice, why, author: MACHINE, viewer: ADMIN }).code, "MACHINE_CANNOT_ADOPT_VERSION");
  assert.deepEqual(w.snapshot(), before, "nothing written by any refusal");
  assert.equal(JSON.stringify(w.fm(Q)), fmBefore, "no new version");
  assert.deepEqual(w.r.notices({ viewer: ADMIN }).notices.map((x) => [x.notice, x.state]), [[n.notice, "open"]], "the notice still open");
  /* exactly 2,000 characters, padded with blanks, is a why */
  const long = `  ${"y".repeat(ADOPT_WHY_MAX)}  `;
  const ok = w.r.adoptVersion({ notice: n.notice, why: long, author: "alice", viewer: ADMIN });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 400));
  assert.equal(ok.why, long.trim());
  const fm = w.fm(Q);
  const v = fm.basis_versions.find((x) => x.name === ok.version);
  assert.ok(v.description.endsWith(`Why: ${long.trim()}`), "the why is recorded with the new version");
  assert.ok(w.text(Q).includes(`Trigger: adoptVersion on ${n.notice}`) && w.text(Q).includes(`Why: ${long.trim()}\n`),
    "and in its Session Log entry");
  const [closed] = w.r.notices({ state: "adopted", viewer: ADMIN }).notices;
  assert.deepEqual([closed.notice, closed.state, closed.closed_by, closed.why, closed.adopted_version, closed.newer_capture],
    [n.notice, "adopted", "alice", long.trim(), ok.version, b.sha], "and on the notice's closure");
  /* a why on several lines keeps its words: the closure holds it as given, the log on one line */
  const s2 = setup();
  const [n2] = s2.w.r.raiseNotices({}).raised;
  const multi = "the newer version is the adopted budget;\nthe earlier one was a draft \"as circulated\"";
  const ok2 = s2.w.r.adoptVersion({ notice: n2.notice, why: multi, author: "alice", viewer: ADMIN });
  assert.equal(ok2.ok, true, JSON.stringify(ok2).slice(0, 400));
  assert.equal(s2.w.r.notices({ state: "adopted", viewer: ADMIN }).notices[0].why, multi);
  assert.ok(s2.w.text(Q).includes(`Why: the newer version is the adopted budget; the earlier one was a draft "as circulated"\n`));
  assert.equal(s2.w.fm(Q).basis_versions.filter((x) => x.name === ok2.version).length, 1, "one version, the document intact");
  /* KEEP is unchanged: its why stays optional */
  const s3 = setup();
  const [n3] = s3.w.r.raiseNotices({}).raised;
  const k = s3.w.r.keepVersion({ notice: n3.notice, author: "alice", viewer: ADMIN });
  assert.deepEqual([k.ok, k.act, k.why], [true, "kept", null]);
});

test("R15 (DEC-88): the versionadopt op carries why from the body, as versionkeep does", () => {
  const { w } = setup();
  const [n] = w.r.raiseNotices({}).raised;
  const op = (body, qs = "") => reevaluationOps(w.r, new URL(`https://plane/x?author=alice&viewer=${ADMIN}${qs}`), body).versionadopt();
  assert.equal(op({ notice: n.notice }).code, "VERSION_ADOPT_NO_REASON");
  const r = op({ notice: n.notice, why: "the newer text is the one in force" });
  assert.deepEqual([r.ok, r.why], [true, "the newer text is the one in force"]);
});
