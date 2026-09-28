/* review: the authoring acts, draft, grant and revoke (R1–R7), at `act`, and the op map's stamps (R22). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { standard, P, Q, V, SECRET, NOW } from "./fixture.mjs";
import { REVIEW_COPY_CHECKS, REVIEW_DRAFT_FIELDS, REVIEW_RECIPIENT_MAX, REVIEW_DRAFT_MAX, reviewOps,
         caseIdentitySentence } from "../../../src/review/index.mjs";
import { PROJECT_VISIBILITY_CHECKS } from "../../../checks/bio-checks.mjs";

const row = (code) => REVIEW_COPY_CHECKS[code];
const refused = (r, code) => {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 300));
  assert.deepEqual([r.reason, r.code, r.check, r.translation], [code, code, row(code).check, row(code).translation]);
  assert.equal(typeof r.detail, "string");
};
const draft = (w, author = "ann", extra = {}) => w.r.act({ act: "draft", author, project: P, statement: "S", ...extra });

test("R1: an empty or machine author is MACHINE_CANNOT_REVIEW (C-32.16) before any act is chosen; any other act is REVIEW_UNKNOWN_ACT (C-87.2)", () => {
  const w = standard();
  const before = w.snapshot();
  for (const author of [null, undefined, "", "   ", "class:admin", "class:member", "class:daemon", "class:ai", "token:admin"])
    for (const act of ["draft", "grant", "revoke", "nonsense", ""]) {
      const r = w.r.act({ act, author, project: P, draft: "DRAFT-2026-0001", grant: "RVG-2026-0001",
                          recipient: "x", secretSha: SECRET(1) });
      refused(r, "MACHINE_CANNOT_REVIEW");
      assert.equal(r.check, "C-32.16");
    }
  for (const act of ["nonsense", "", "publish", "DRAFT", undefined]) {
    const r = w.r.act({ act, author: "ann" });
    refused(r, "REVIEW_UNKNOWN_ACT");
    assert.equal(r.act, act ?? "");
  }
  assert.deepEqual(w.snapshot(), before, "a refused act writes nothing");
});

test("R2: draft needs edit permission; grant and revoke need ownership, no administrator arm; not permitted and not there are one answer, varying only with the act", () => {
  const w = standard();
  /* draft: an owner or a joined participant; never invited, leaving, an administrator or an outsider */
  for (const m of ["ann", "bea", "ed"]) assert.equal(draft(w, m).ok, true, m);
  const deniedDraft = [];
  for (const m of ["ivy", "lee", "adm", "out", "quinn"]) {
    const r = draft(w, m);
    refused(r, "REVIEW_NOT_PROJECT_OWNER");
    deniedDraft.push(JSON.stringify(r));
  }
  /* a project that does not exist, and a draft that does not exist, answer exactly as not permitted */
  deniedDraft.push(JSON.stringify(w.r.act({ act: "draft", author: "ann", project: "PROJ-2026-9999-none" })));
  deniedDraft.push(JSON.stringify(w.r.act({ act: "draft", author: "ann", draft: "DRAFT-2026-9999" })));
  assert.equal(new Set(deniedDraft).size, 1, "one answer for every caller without the draft's authority");
  const d = draft(w, "ed");
  /* grant: owners only */
  let n = 0;
  for (const m of ["ann", "bea"])
    assert.equal(w.r.act({ act: "grant", author: m, draft: d.draftId, recipient: "R", secretSha: SECRET(++n) }).ok, true);
  const deniedGrant = ["ed", "ivy", "lee", "adm", "out", "quinn"].map((m) =>
    w.r.act({ act: "grant", author: m, draft: d.draftId, recipient: "R", secretSha: SECRET(90) }));
  deniedGrant.push(w.r.act({ act: "grant", author: "ann", draft: "DRAFT-2026-9999", recipient: "R", secretSha: SECRET(90) }));
  for (const r of deniedGrant) refused(r, "REVIEW_NOT_PROJECT_OWNER");
  assert.equal(new Set(deniedGrant.map((r) => JSON.stringify(r))).size, 1);
  /* revoke: owners only */
  const g = w.r.act({ act: "grant", author: "ann", draft: d.draftId, recipient: "R", secretSha: SECRET(50) });
  const deniedRevoke = ["ed", "ivy", "lee", "adm", "out", "quinn"].map((m) => w.r.act({ act: "revoke", author: m, grant: g.grantId }));
  deniedRevoke.push(w.r.act({ act: "revoke", author: "ann", grant: "RVG-2026-9999" }));
  for (const r of deniedRevoke) refused(r, "REVIEW_NOT_PROJECT_OWNER");
  assert.equal(new Set(deniedRevoke.map((r) => JSON.stringify(r))).size, 1);
  assert.equal(w.row(`SELECT revoked_at FROM review_grants WHERE grant_id=?`, g.grantId).revoked_at, null);
  assert.equal(w.r.act({ act: "revoke", author: "bea", grant: g.grantId }).ok, true, "any owner revokes");
  /* the detail varies with the act, and with nothing else */
  const details = [deniedDraft[0], JSON.stringify(deniedGrant[0]), JSON.stringify(deniedRevoke[0])].map((s) => JSON.parse(s).detail);
  assert.equal(new Set(details).size, 3);
});

test("R3: the draft's refusals, in order", () => {
  const w = standard();
  w.discoverable(Q, "quinn");
  /* a new draft under a discoverable project the caller is outside: membership's existence refusal (C-70.1) */
  const ex = w.r.act({ act: "draft", author: "out", project: Q, viewer: V("out") });
  assert.deepEqual([ex.ok, ex.code, ex.check, ex.translation, ex.project],
    [false, "PROJECT_SEEN_NOT_A_PARTICIPANT", "C-70.1", PROJECT_VISIBILITY_CHECKS.PROJECT_SEEN_NOT_A_PARTICIPANT.translation, Q]);
  /* the same outsider on a hidden project: the authority answer, which says nothing of existence */
  refused(w.r.act({ act: "draft", author: "out", project: P, viewer: V("out") }), "REVIEW_NOT_PROJECT_OWNER");
  /* existence is asked before the rest: a named but absent project field for an existing draft is not an existence ask */
  const d = draft(w, "ann");
  /* a named draft not held */
  refused(w.r.act({ act: "draft", author: "ann", draft: "DRAFT-2026-0000", project: P }), "REVIEW_NOT_PROJECT_OWNER");
  /* no project */
  refused(w.r.act({ act: "draft", author: "ann" }), "REVIEW_NO_PROJECT");
  refused(w.r.act({ act: "draft", author: "ann", project: "   " }), "REVIEW_NO_PROJECT");
  /* a named project other than the draft's (asked before edit permission) */
  refused(w.r.act({ act: "draft", author: "quinn", draft: d.draftId, project: Q }), "REVIEW_DRAFT_CHANGES_PROJECT");
  /* no edit permission */
  refused(w.r.act({ act: "draft", author: "quinn", draft: d.draftId }), "REVIEW_NOT_PROJECT_OWNER");
  /* a named case this project has not published, and a case of another project, answer alike */
  w.publishedCase("CASE-2026-0007", Q);
  const none = w.r.act({ act: "draft", author: "ann", project: P, caseId: "CASE-2026-0001" });
  const other = w.r.act({ act: "draft", author: "ann", project: P, caseId: "CASE-2026-0007" });
  refused(none, "REVIEW_NO_SUCH_CASE"); refused(other, "REVIEW_NO_SUCH_CASE");
  assert.deepEqual([none.caseId, other.caseId], ["CASE-2026-0001", "CASE-2026-0007"]);
  assert.equal(none.detail.replace("CASE-2026-0001", "X"), other.detail.replace("CASE-2026-0007", "X"));
  /* arguments over 64 KiB as JSON (the kept fields only), and exactly at the limit accepted */
  const big = "x".repeat(REVIEW_DRAFT_MAX);
  refused(w.r.act({ act: "draft", author: "ann", project: P, scope: big }), "REVIEW_DRAFT_TOO_LARGE");
  const fits = REVIEW_DRAFT_MAX - JSON.stringify({ scope: "" }).length;
  assert.equal(w.r.act({ act: "draft", author: "ann", project: P, scope: "x".repeat(fits) }).ok, true);
  assert.equal(w.r.act({ act: "draft", author: "ann", project: P, notAField: big }).ok, true, "a dropped field is not counted");
  /* the order: no such case before too large */
  refused(w.r.act({ act: "draft", author: "ann", project: P, caseId: "CASE-2026-0001", scope: big }), "REVIEW_NO_SUCH_CASE");
});

test("R4: a draft is created under an opaque DRAFT id or edited in place, keeps only publish's fields, and stamps statement_by", () => {
  const w = standard();
  const seqBefore = w.rows(`SELECT * FROM seq`);
  const all = Object.fromEntries(REVIEW_DRAFT_FIELDS.map((k) => [k, k === "newCase" ? false : `v-${k}`]));
  const d = w.r.act({ act: "draft", author: "ed", project: P, ...all, caseId: "", author_kind: "x", draft_id: "y",
                     statement_by: "forged", updated_by: "forged", extra: 1 });
  assert.equal(d.ok, true);
  assert.match(d.draftId, /^DRAFT-\d{4}-\d{4}$/);
  assert.deepEqual(w.rows(`SELECT * FROM seq`), seqBefore, "never the DRAFT counter");
  assert.ok(w.row(`SELECT 1 AS m FROM minted_ids WHERE id=?`, d.draftId), "recorded by record-core's opaque minter");
  const stored = w.row(`SELECT * FROM case_drafts WHERE draft_id=?`, d.draftId);
  assert.deepEqual(Object.keys(JSON.parse(stored.params)).sort(), [...REVIEW_DRAFT_FIELDS].sort());
  assert.deepEqual([stored.project_id, stored.created_by, stored.updated_by, stored.statement_by, stored.created_at],
    [P, "ed", "ed", "ed", NOW]);
  assert.deepEqual(Object.keys(d).sort(), ["caseId", "caseIdentity", "draftId", "edited", "edition", "ok", "project", "read"]);
  assert.deepEqual([d.project, d.edited, d.read], [P, false, `op=reviewcopy&draft=${d.draftId}`]);
  /* two drafts: two ids */
  assert.notEqual(draft(w, "ed").draftId, d.draftId);
  /* edit in place: another editor rewriting another field leaves the statement's writer */
  w.clock.now = "2026-09-28T02:00:00.000Z";
  const e = w.r.act({ act: "draft", author: "ann", draft: d.draftId, statement: "v-statement", scope: "new scope" });
  assert.deepEqual([e.ok, e.draftId, e.edited], [true, d.draftId, true]);
  let s = w.row(`SELECT * FROM case_drafts WHERE draft_id=?`, d.draftId);
  assert.deepEqual([s.updated_by, s.updated_at, s.statement_by, s.created_by], ["ann", "2026-09-28T02:00:00.000Z", "ed", "ed"]);
  assert.deepEqual(JSON.parse(s.params), { statement: "v-statement", scope: "new scope" }, "an edit replaces the arguments");
  /* the text as a case document would print it: a spelling the record cannot tell apart does not move the writer */
  w.r.act({ act: "draft", author: "bea", draft: d.draftId, statement: '  v-statement\n' });
  assert.equal(w.row(`SELECT statement_by FROM case_drafts WHERE draft_id=?`, d.draftId).statement_by, "ed");
  w.r.act({ act: "draft", author: "bea", draft: d.draftId, statement: 'a "new" one' });
  assert.equal(w.row(`SELECT statement_by FROM case_drafts WHERE draft_id=?`, d.draftId).statement_by, "bea");
  w.r.act({ act: "draft", author: "ann", draft: d.draftId, statement: "a 'new' one" });
  assert.equal(w.row(`SELECT statement_by FROM case_drafts WHERE draft_id=?`, d.draftId).statement_by, "bea",
    "a quote printed as the case document prints it is the same statement");
  /* an emptied statement has no writer; a statement written again is its writer's */
  w.r.act({ act: "draft", author: "ann", draft: d.draftId, statement: "  " });
  assert.equal(w.row(`SELECT statement_by FROM case_drafts WHERE draft_id=?`, d.draftId).statement_by, null);
  w.r.act({ act: "draft", author: "ed", draft: d.draftId, statement: "a 'new' one" });
  assert.equal(w.row(`SELECT statement_by FROM case_drafts WHERE draft_id=?`, d.draftId).statement_by, "ed");
  /* a draft whose writer was never recorded is stamped by a write that supplies its statement, even unchanged */
  w.st.sql.exec(`UPDATE case_drafts SET statement_by=NULL WHERE draft_id=?`, d.draftId);
  w.r.act({ act: "draft", author: "bea", draft: d.draftId, statement: "a 'new' one" });
  assert.equal(w.row(`SELECT statement_by FROM case_drafts WHERE draft_id=?`, d.draftId).statement_by, "bea");
});

test("R5: a draft's case identity is read from the published record every time; the stated edition and the four sentences", () => {
  const w = standard();
  w.publishedCase("CASE-2026-0001", P, 2);
  const named = w.r.act({ act: "draft", author: "ann", project: P, caseId: " CASE-2026-0001 " });
  assert.deepEqual([named.caseId, named.edition, named.caseIdentity],
    ["CASE-2026-0001", 3, "the next edition (3) of CASE-2026-0001"]);
  assert.equal(w.row(`SELECT case_id FROM case_drafts WHERE draft_id=?`, named.draftId).case_id, "CASE-2026-0001");
  assert.equal(JSON.parse(w.row(`SELECT params FROM case_drafts WHERE draft_id=?`, named.draftId).params).caseId, "CASE-2026-0001");
  assert.equal(w.r.draftIdentity(w.row(`SELECT * FROM case_drafts WHERE draft_id=?`, named.draftId)).edition, 3);
  w.publishedCase("CASE-2026-0001", P, 3);
  assert.deepEqual(w.r.draftIdentity(w.row(`SELECT * FROM case_drafts WHERE draft_id=?`, named.draftId)),
    { caseId: "CASE-2026-0001", edition: 4 }, "never stored: the next read reads the record again");
  const both = w.r.act({ act: "draft", author: "ann", project: P, caseId: "CASE-2026-0001", newCase: true });
  assert.deepEqual([both.edition, both.caseIdentity], [4, caseIdentitySentence("CASE-2026-0001", 4, true)]);
  assert.match(both.caseIdentity, /UNDETERMINED/);
  const fresh = w.r.act({ act: "draft", author: "ann", project: P, newCase: "yes" });
  assert.deepEqual([fresh.caseId, fresh.edition], [null, 1]);
  assert.match(fresh.caseIdentity, /^a new case/);
  const derived = w.r.act({ act: "draft", author: "ann", project: P });
  assert.deepEqual([derived.caseId, derived.edition], [null, null], "derived: the edition is not stated");
  assert.match(derived.caseIdentity, /DERIVES/);
  assert.deepEqual(w.r.draftIdentity({ case_id: null }), { caseId: null, edition: 1 }, "internally edition 1");
  assert.equal(new Set([named.caseIdentity, both.caseIdentity, fresh.caseIdentity, derived.caseIdentity]).size, 4);
});

test("R6: grant's refusals in order, and a grant bound to the draft's case identity at issue", () => {
  const w = standard();
  const d = draft(w, "ed");
  refused(w.r.act({ act: "grant", author: "ann", draft: d.draftId, recipient: "", secretSha: "bad" }), "REVIEW_NO_RECIPIENT");
  for (const recipient of ["", "   ", "a\nb", "a\rb", "x".repeat(REVIEW_RECIPIENT_MAX + 1), null])
    refused(w.r.act({ act: "grant", author: "ann", draft: d.draftId, recipient, secretSha: SECRET(1) }), "REVIEW_NO_RECIPIENT");
  for (const secretSha of [null, "", "A".repeat(64), "a".repeat(63), "g".repeat(64), SECRET(1) + "0"])
    refused(w.r.act({ act: "grant", author: "ann", draft: d.draftId, recipient: "R", secretSha }), "REVIEW_NO_SECRET");
  assert.equal(w.count("review_grants"), 0);
  const g = w.r.act({ act: "grant", author: "ann", draft: d.draftId, recipient: ` ${"x".repeat(REVIEW_RECIPIENT_MAX)} `,
                      secretSha: SECRET(1) });
  assert.equal(g.ok, true);
  assert.match(g.grantId, /^RVG-\d{4}-\d{4}$/);
  assert.deepEqual([g.draftId, g.caseId, g.edition, g.recipient, g.issuedBy, g.issuedAt],
    [d.draftId, null, null, "x".repeat(REVIEW_RECIPIENT_MAX), "ann", NOW]);
  assert.match(g.boundTo, /DERIVES.*It ends when it is revoked, and when that edition is published and signed\.$/s);
  const stored = w.row(`SELECT * FROM review_grants WHERE grant_id=?`, g.grantId);
  assert.deepEqual([stored.case_id, stored.edition, stored.secret_sha, stored.issued_by, stored.revoked_at],
    [null, 1, SECRET(1), "ann", null]);
  /* bound to a named case's next edition, and to a new case's edition 1, stated */
  w.publishedCase("CASE-2026-0001", P, 1);
  const n = w.r.act({ act: "draft", author: "ann", project: P, caseId: "CASE-2026-0001" });
  const gn = w.r.act({ act: "grant", author: "ann", draft: n.draftId, recipient: "R", secretSha: SECRET(2) });
  assert.deepEqual([gn.caseId, gn.edition], ["CASE-2026-0001", 2]);
  assert.match(gn.boundTo, /^this grant reads the next edition \(2\) of CASE-2026-0001 and nothing else/);
  const f = w.r.act({ act: "draft", author: "ann", project: P, newCase: true });
  assert.equal(w.r.act({ act: "grant", author: "ann", draft: f.draftId, recipient: "R", secretSha: SECRET(3) }).edition, 1);
});

test("R7: revoke's refusals; a revocation is recorded once and a repeat answers the first, unchanged", () => {
  const w = standard();
  const d = draft(w, "ann");
  const g = w.r.act({ act: "grant", author: "ann", draft: d.draftId, recipient: "R", secretSha: SECRET(1) });
  for (const grant of [null, "", "  "]) refused(w.r.act({ act: "revoke", author: "out", grant }), "REVIEW_NO_GRANT");
  refused(w.r.act({ act: "revoke", author: "ann", grant: "RVG-2026-0000" }), "REVIEW_NOT_PROJECT_OWNER");
  w.clock.now = "2026-09-28T03:00:00.000Z";
  const first = w.r.act({ act: "revoke", author: "bea", grant: ` ${g.grantId} ` });
  assert.deepEqual(first, { ok: true, existed: false, grantId: g.grantId, revokedBy: "bea", revokedAt: "2026-09-28T03:00:00.000Z" });
  w.clock.now = "2026-09-28T04:00:00.000Z";
  const again = w.r.act({ act: "revoke", author: "ann", grant: g.grantId });
  assert.deepEqual(again, { ok: true, existed: true, grantId: g.grantId, revokedBy: "bea", revokedAt: "2026-09-28T03:00:00.000Z" });
  const s = w.row(`SELECT revoked_by, revoked_at FROM review_grants WHERE grant_id=?`, g.grantId);
  assert.deepEqual([s.revoked_by, s.revoked_at], ["bea", "2026-09-28T03:00:00.000Z"]);
});

test("R22: every authorship field is the control plane's stamp, never a body's", () => {
  const w = standard();
  const url = (q) => new URL(`https://x/?${new URLSearchParams(q)}`);
  const ops = (q, body) => reviewOps(w.r, url(q), body);
  const d = ops({ author: "ed", viewer: V("ed") }, { project: P, statement: "S", author: "ann", act: "grant",
                                                     viewer: V("quinn") }).casedraft();
  assert.equal(d.ok, true);
  let s = w.row(`SELECT * FROM case_drafts WHERE draft_id=?`, d.draftId);
  assert.deepEqual([s.created_by, s.updated_by, s.statement_by], ["ed", "ed", "ed"]);
  refused(ops({}, { project: P, author: "ann" }).casedraft(), "MACHINE_CANNOT_REVIEW");
  const g = ops({ author: "ann", secretSha: SECRET(1) }, { draft: d.draftId, recipient: "R", author: "ed",
                                                          secretSha: SECRET(9) }).reviewgrant();
  assert.deepEqual([g.ok, g.issuedBy], [true, "ann"]);
  assert.equal(w.row(`SELECT secret_sha FROM review_grants WHERE grant_id=?`, g.grantId).secret_sha, SECRET(1));
  refused(ops({}, { draft: d.draftId, recipient: "R", author: "ann", secretSha: SECRET(2) }).reviewgrant(), "MACHINE_CANNOT_REVIEW");
  refused(ops({ author: "ed" }, { grant: g.grantId, author: "ann" }).reviewrevoke(), "REVIEW_NOT_PROJECT_OWNER");
  /* a comment's author is the stamped viewer or the stamped secret's grant */
  const c = ops({ draft: d.draftId, viewer: V("ed") }, { text: "hi", author: "ann", viewer: V("ann") }).reviewcomment();
  assert.deepEqual([c.comment.author_kind, c.comment.author], ["member", "ed"]);
  const rc = ops({ secretSha: SECRET(1), bySecret: "1" }, { text: "hi", author: "ann" }).reviewcomment();
  assert.deepEqual([rc.comment.author_kind, rc.comment.author, rc.comment.grant_id], ["recipient", g.grantId, g.grantId]);
  assert.equal(ops({ secretSha: SECRET(1) }, { text: "hi" }).reviewcomment().code, "NO_REVIEW_COPY",
    "bySecret is a stamp too: without it the secret is not a door");
  /* the read and the list take their viewer from the stamp */
  assert.equal(ops({ draft: d.draftId, viewer: V("out") }, { viewer: V("ann") }).reviewcopy().code, "NO_REVIEW_COPY");
  assert.equal(ops({ project: P, viewer: V("out") }, { viewer: V("ann") }).casedrafts().code, "NO_REVIEW_COPY");
  assert.equal(ops({ project: P, viewer: V("ivy") }, {}).casedrafts().ok, true);
});
