/* review: a grant's end date, `until` (R34; N1038; DEC-100; K3147): refused unless an instant later than the act, recorded
   and answered, dead from it on exactly as a revoked grant, stated in the roster, and nothing written when it lapses. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { standard, P, V, SECRET, NOW } from "./fixture.mjs";
import { REVIEW_COPY_CHECKS, REVIEW_LIST_MAX, reviewOps, noReviewCopy } from "../../../src/review/index.mjs";
import { migrateReview, REVIEW_SCHEMA } from "../../../src/review/schema.mjs";

const DEAD = JSON.stringify(noReviewCopy());
const HOUR = "2026-09-28T02:00:00.000Z", DAY = "2026-09-29T01:00:00.000Z";
const draft = (w, extra = {}) => w.r.act({ act: "draft", author: "ann", project: P, statement: "S", ...extra });
const grant = (w, d, n, until, author = "ann") => w.r.act({ act: "grant", author, draft: d.draftId, recipient: `R${n}`,
                                                             secretSha: SECRET(n), ...(until === undefined ? {} : { until }) });
const refused = (r, code) => {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 300));
  assert.deepEqual([r.reason, r.code, r.check, r.translation],
    [code, code, REVIEW_COPY_CHECKS[code].check, REVIEW_COPY_CHECKS[code].translation]);
  assert.equal(typeof r.detail, "string");
};

test("R34: a grant with until an hour ahead admits now and gives the dead answer after it, byte-identical to a revoked grant's, writing nothing when it lapses", () => {
  const w = standard();
  w.publishedCase("CASE-2026-0001", P, 1);
  const d = draft(w, { caseId: "CASE-2026-0001" });
  const g = grant(w, d, 1, HOUR);
  assert.deepEqual([g.ok, g.until], [true, HOUR]);
  assert.equal(w.row(`SELECT until FROM review_grants WHERE grant_id=?`, g.grantId).until, HOUR);
  /* admits now: the copy, the comment, liveGrant and the case edition it is bound to */
  assert.equal(w.r.copy({ secretSha: SECRET(1), bySecret: true }).reader, "recipient");
  assert.equal(w.r.comment({ secretSha: SECRET(1), bySecret: true, text: "before" }).ok, true);
  assert.equal(w.r.liveGrant(SECRET(1)).grant.grant_id, g.grantId);
  assert.equal(w.r.grantAdmitsCaseEdition(SECRET(1), "CASE-2026-0001", 2), true);
  /* a host clock moved to the instant itself, and past it: dead from `until` on */
  const revoked = grant(w, d, 2);
  w.r.act({ act: "revoke", author: "ann", grant: revoked.grantId });
  const deadRevoked = JSON.stringify(w.r.copy({ secretSha: SECRET(2), bySecret: true }));
  assert.equal(deadRevoked, DEAD);
  const before = w.snapshot();
  for (const now of [HOUR, "2026-09-28T02:00:00.001Z", "2026-10-30T00:00:00.000Z"]) {
    w.clock.now = now;
    assert.equal(JSON.stringify(w.r.copy({ secretSha: SECRET(1), bySecret: true })), deadRevoked, now);
    assert.equal(JSON.stringify(w.r.copy({ draft: d.draftId, secretSha: SECRET(1), bySecret: true })), deadRevoked, now);
    assert.equal(JSON.stringify(w.r.comment({ secretSha: SECRET(1), bySecret: true, text: "after" })), deadRevoked, now);
    assert.equal(w.r.liveGrant(SECRET(1)), null, now);
    assert.equal(w.r.grantAdmitsCaseEdition(SECRET(1), "CASE-2026-0001", 2), false, now);
    assert.equal(w.r.provider().liveGrant(SECRET(1)), null, now);
  }
  assert.deepEqual(w.snapshot(), before, "nothing is written when a grant lapses");
  /* one instant before: still live */
  w.clock.now = "2026-09-28T01:59:59.999Z";
  assert.equal(w.r.copy({ secretSha: SECRET(1), bySecret: true }).reader, "recipient");
  /* the member door is not the grant's: a member still reads the copy after the end date */
  w.clock.now = "2026-10-30T00:00:00.000Z";
  assert.equal(w.r.copy({ draft: d.draftId, viewer: V("ivy") }).reader, "member");
});

test("R34: a grant without until stays live, answers until null, and a grant made before T48 (no column value) is live until revoked", () => {
  const w = standard();
  const d = draft(w);
  for (const [n, until] of [[1, undefined], [2, null]]) {
    const g = grant(w, d, n, until);
    assert.deepEqual([g.ok, g.until], [true, null]);
    assert.equal(w.row(`SELECT until FROM review_grants WHERE grant_id=?`, g.grantId).until, null);
  }
  w.clock.now = "2099-01-01T00:00:00.000Z";
  assert.equal(w.r.copy({ secretSha: SECRET(1), bySecret: true }).ok, true);
  assert.equal(w.r.copy({ secretSha: SECRET(2), bySecret: true }).ok, true);
  assert.doesNotMatch(grant(w, d, 3).boundTo, /also ends at/);
  /* a store made before the column: it is added, never back-filled, and its grants stay live */
  const old = standard();
  const od = draft(old);
  const og = grant(old, od, 1);
  old.st.db.exec(`ALTER TABLE review_grants DROP COLUMN until`);
  assert.equal(old.rows(`PRAGMA table_info(review_grants)`).some((c) => c.name === "until"), false);
  migrateReview(old.st.sql);
  assert.equal(old.row(`SELECT until FROM review_grants WHERE grant_id=?`, og.grantId).until, null);
  old.clock.now = "2099-01-01T00:00:00.000Z";
  assert.equal(old.r.copy({ secretSha: SECRET(1), bySecret: true }).ok, true);
  assert.match(REVIEW_SCHEMA, /\buntil\s+TEXT\b/);
});

test("R34: until in the past, equal to the act's instant, or not an instant in the record's form is REVIEW_BAD_UNTIL (C-87.17), writing nothing", () => {
  const w = standard();
  const d = draft(w);
  const before = w.snapshot();
  const bad = ["tomorrow", "", "   ", "2026-09-27T00:00:00.000Z", "2026-09-28T00:59:59Z", NOW, "2026-09-28T01:00:00Z",
               "2026-09-29", "2026-09-29T01:00:00", "2026-09-29T01:00:00+00:00", "2026-09-29T01:00:00.5Z", "2026-09-29t01:00:00z",
               "2026-02-30T00:00:00Z", "2026-09-29T25:00:00Z", 1790000000000, true, {}, ["2026-09-29T01:00:00Z"], NaN];
  for (const until of bad) {
    const r = grant(w, d, 1, until);
    refused(r, "REVIEW_BAD_UNTIL");
    assert.equal(r.check, "C-87.17", String(until));
    assert.deepEqual(w.snapshot(), before, `${String(until)}: nothing written`);
  }
  assert.equal(REVIEW_COPY_CHECKS.REVIEW_BAD_UNTIL.translation,
    "Choose an end date after today for this reader's link. Nothing was shared.");
  assert.equal(w.count("review_grants"), 0);
  /* both of the record's spellings, one instant after the act, are accepted and recorded as given */
  const a = grant(w, d, 1, "2026-09-28T01:00:01Z"), b = grant(w, d, 2, "2026-09-28T01:00:00.001Z");
  assert.deepEqual([a.ok, a.until, b.ok, b.until], [true, "2026-09-28T01:00:01Z", true, "2026-09-28T01:00:00.001Z"]);
  assert.match(a.boundTo, /It ends when it is revoked, and when that edition is published and signed\. It also ends at 2026-09-28T01:00:01Z\.$/);
});

test("R34: REVIEW_BAD_UNTIL comes after R6's refusals and before the mint, and a caller without authority learns nothing of it", () => {
  const w = standard();
  const d = draft(w);
  refused(grant(w, d, 1, "tomorrow", "ed"), "REVIEW_NOT_PROJECT_OWNER");
  refused(w.r.act({ act: "grant", author: "ann", draft: "DRAFT-2026-9999", recipient: "R", secretSha: SECRET(1), until: "x" }),
          "REVIEW_NOT_PROJECT_OWNER");
  refused(w.r.act({ act: "grant", author: "ann", draft: d.draftId, recipient: "", secretSha: SECRET(1), until: "x" }), "REVIEW_NO_RECIPIENT");
  refused(w.r.act({ act: "grant", author: "ann", draft: d.draftId, recipient: "R", secretSha: "bad", until: "x" }), "REVIEW_NO_SECRET");
  refused(grant(w, d, 1, "x"), "REVIEW_BAD_UNTIL");
  /* a minter with no free id is asked only by a grant whose end date passed the check */
  const asked = [];
  const mint = w.record.mintOpaqueId;
  w.record.mintOpaqueId = (...a) => { asked.push(a[0]); return null; };
  refused(grant(w, d, 1, "x"), "REVIEW_BAD_UNTIL");
  assert.deepEqual(asked, []);
  assert.equal(grant(w, d, 1, DAY).code, "MINT_EXHAUSTED");
  assert.deepEqual(asked, ["RVG"]);
  w.record.mintOpaqueId = mint;
  assert.equal(w.count("review_grants"), 0);
});

test("R34: until is answered wherever the grant is: the roster states each grant's until and reads live false from it on, and the recipient's own grant part states its own; a recipient sees only its own grant", () => {
  const w = standard();
  w.publishedCase("CASE-2026-0001", P, 1);
  const d = draft(w, { caseId: "CASE-2026-0001" });
  const timed = grant(w, d, 1, HOUR), open = grant(w, d, 2), revoked = grant(w, d, 3, DAY);
  w.r.act({ act: "revoke", author: "ann", grant: revoked.grantId });
  /* the roster is ordered by issue instant then id; these grants share one instant, so it is read by id */
  const roster = (c) => c.grants.map((g) => [g.grant_id, g.live, g.until, g.edition]).sort((x, y) => (x[0] < y[0] ? -1 : 1));
  const rows = (...r) => r.sort((x, y) => (x[0] < y[0] ? -1 : 1));
  assert.deepEqual(roster(w.r.copy({ draft: d.draftId, viewer: V("ann") })),
    rows([timed.grantId, true, HOUR, 2], [open.grantId, true, null, 2], [revoked.grantId, false, DAY, 2]));
  w.clock.now = HOUR;
  assert.deepEqual(roster(w.r.copy({ draft: d.draftId, viewer: V("ann") })),
    rows([timed.grantId, false, HOUR, 2], [open.grantId, true, null, 2], [revoked.grantId, false, DAY, 2]));
  /* the roster is still the roster for the cap */
  assert.equal(w.r.copy({ draft: d.draftId, viewer: V("ann") }).list_limit, REVIEW_LIST_MAX);
  /* a no-case grant states its edition only while live: lapsed, none */
  const f = draft(w, { newCase: true });
  const nc = grant(w, f, 4, "2026-09-28T03:00:00.000Z");
  w.clock.now = "2026-09-28T02:30:00.000Z";
  assert.deepEqual(roster(w.r.copy({ draft: f.draftId, viewer: V("ann") })), [[nc.grantId, true, "2026-09-28T03:00:00.000Z", 1]]);
  w.clock.now = "2026-09-28T03:00:00.000Z";
  assert.deepEqual(roster(w.r.copy({ draft: f.draftId, viewer: V("ann") })), [[nc.grantId, false, "2026-09-28T03:00:00.000Z", null]]);
  /* the recipient's own copy: its grant, and no other grant named */
  w.clock.now = NOW;
  const rc = w.r.copy({ secretSha: SECRET(1), bySecret: true });
  assert.equal(rc.grant.grant_id, timed.grantId);
  assert.equal(rc.grant.until, HOUR, "R34: the recipient's own grant part states its end date");
  assert.equal(w.r.copy({ secretSha: SECRET(2), bySecret: true }).grant.until, null, "null where the grant has none");
  assert.equal(JSON.stringify(rc).includes(open.grantId), false);
});

test("R34: revoke of a lapsed grant still records the revocation, and a repeat answers the first", () => {
  const w = standard();
  const d = draft(w);
  const g = grant(w, d, 1, HOUR);
  w.clock.now = "2026-09-28T05:00:00.000Z";
  assert.equal(w.r.liveGrant(SECRET(1)), null);
  const first = w.r.act({ act: "revoke", author: "bea", grant: g.grantId });
  assert.deepEqual(first, { ok: true, existed: false, grantId: g.grantId, revokedBy: "bea", revokedAt: "2026-09-28T05:00:00.000Z" });
  assert.deepEqual(w.row(`SELECT revoked_by, revoked_at, until FROM review_grants WHERE grant_id=?`, g.grantId),
    { revoked_by: "bea", revoked_at: "2026-09-28T05:00:00.000Z", until: HOUR });
  w.clock.now = "2026-09-28T06:00:00.000Z";
  assert.deepEqual(w.r.act({ act: "revoke", author: "ann", grant: g.grantId }),
    { ok: true, existed: true, grantId: g.grantId, revokedBy: "bea", revokedAt: "2026-09-28T05:00:00.000Z" });
});

test("R34: reviewgrant takes until from the body or the query beside recipient, and a body's until is not a stamp", () => {
  const w = standard();
  const d = draft(w);
  const url = (q) => new URL(`https://x/?${new URLSearchParams(q)}`);
  const ops = (q, body) => reviewOps(w.r, url(q), body);
  const a = ops({ author: "ann" }, { draft: d.draftId, recipient: "R", secretSha: SECRET(1), until: HOUR }).reviewgrant();
  assert.deepEqual([a.ok, a.until], [true, HOUR]);
  const b = ops({ author: "ann", until: DAY }, { draft: d.draftId, recipient: "R", secretSha: SECRET(2) }).reviewgrant();
  assert.deepEqual([b.ok, b.until], [true, DAY]);
  const c = ops({ author: "ann" }, { draft: d.draftId, recipient: "R", secretSha: SECRET(3) }).reviewgrant();
  assert.deepEqual([c.ok, c.until], [true, null]);
  refused(ops({ author: "ann" }, { draft: d.draftId, recipient: "R", secretSha: SECRET(4), until: "tomorrow" }).reviewgrant(),
          "REVIEW_BAD_UNTIL");
  assert.equal(w.count("review_grants"), 3);
  /* lapsed through the ops: the dead answer */
  w.clock.now = HOUR;
  assert.equal(JSON.stringify(ops({ bySecret: "1" }, { secretSha: SECRET(1) }).reviewcopy()), DEAD);
  assert.equal(ops({ bySecret: "1" }, { secretSha: SECRET(2) }).reviewcopy().ok, true);
});
