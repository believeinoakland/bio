/* review: the grant and the sight (R8, R9), the copy's two doors and the one dead answer (R10), and the list of a
   project's drafts (R19). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { standard, P, Q, V, SECRET } from "./fixture.mjs";
import { REVIEW_COPY_CHECKS, REVIEW_LIST_MAX, noReviewCopy } from "../../../src/review/index.mjs";

const DEAD = JSON.stringify(noReviewCopy());
const draft = (w, extra = {}, author = "ann") => w.r.act({ act: "draft", author, project: P, statement: "S", ...extra });
const grant = (w, d, n, author = "ann") => w.r.act({ act: "grant", author, draft: d.draftId, recipient: `R${n}`, secretSha: SECRET(n) });

test("R8: a grant is live only while it exists with that fingerprint, is unrevoked, its draft exists and still stands at the bound identity", () => {
  const w = standard();
  w.publishedCase("CASE-2026-0001", P, 1);
  const named = draft(w, { caseId: "CASE-2026-0001" });
  const loose = draft(w);
  const gn = grant(w, named, 1), gl = grant(w, loose, 2), gr = grant(w, loose, 3);
  const live = w.r.liveGrant(SECRET(1));
  assert.deepEqual([live.grant.grant_id, live.draft.draft_id], [gn.grantId, named.draftId]);
  assert.equal(w.r.liveGrant(SECRET(2)).grant.grant_id, gl.grantId);
  /* malformed and never-issued fingerprints are never live */
  for (const s of [null, "", SECRET(1).toUpperCase(), SECRET(1).slice(1), `${SECRET(1)} `, SECRET(99)])
    assert.equal(w.r.liveGrant(s), null, String(s));
  /* revoked */
  w.r.act({ act: "revoke", author: "ann", grant: gr.grantId });
  assert.equal(w.r.liveGrant(SECRET(3)), null);
  /* the draft moves to another case identity: dead, and alive again when it stands there once more */
  w.r.act({ act: "draft", author: "ann", draft: loose.draftId, caseId: "CASE-2026-0001" });
  assert.equal(w.r.liveGrant(SECRET(2)), null);
  w.r.act({ act: "draft", author: "ann", draft: loose.draftId });
  assert.equal(w.r.liveGrant(SECRET(2)).grant.grant_id, gl.grantId);
  /* the bound edition is published and signed: dead exactly as a revoked one */
  assert.equal(w.r.grantAdmitsCaseEdition(SECRET(1), "CASE-2026-0001", 2), true);
  w.publishedCase("CASE-2026-0001", P, 2);
  assert.equal(w.r.liveGrant(SECRET(1)), null);
  assert.equal(w.r.grantAdmitsCaseEdition(SECRET(1), "CASE-2026-0001", 2), false);
  /* its draft no longer exists */
  w.st.sql.exec(`DELETE FROM case_drafts WHERE draft_id=?`, loose.draftId);
  assert.equal(w.r.liveGrant(SECRET(2)), null);
  /* grantAdmitsCaseEdition: exactly the named case and edition a live grant is bound to; a no-case grant admits none */
  const n2 = draft(w, { caseId: "CASE-2026-0001" });
  grant(w, n2, 4);
  const f = draft(w, { newCase: true });
  grant(w, f, 5);
  assert.deepEqual([["CASE-2026-0001", 3], ["CASE-2026-0001", "3"], ["CASE-2026-0001", 2], ["CASE-2026-0002", 3]]
    .map(([c, e]) => w.r.grantAdmitsCaseEdition(SECRET(4), c, e)), [true, true, false, false]);
  assert.equal(w.r.grantAdmitsCaseEdition(SECRET(5), null, 1), false);
  assert.equal(w.r.grantAdmitsCaseEdition(null, "CASE-2026-0001", 3), false);
});

test("R9: standing in a project's drafts is the sight predicate over the producing project: a participant (invited or joined) or an active administrator", () => {
  const w = standard();
  w.member("gone", "admin", "revoked");
  const d = draft(w);
  const sees = { ann: true, bea: true, ed: true, ivy: true, lee: true, adm: true, out: false, quinn: false, gone: false };
  for (const [m, want] of Object.entries(sees)) {
    assert.equal(w.r.seesProjectDrafts(P, V(m)), want, m);
    assert.equal(!!w.r.draftForMember(d.draftId, V(m)), want, m);
  }
  for (const viewer of [null, undefined, "", "ann", "member:", "member:ann extra", "guest:ann", "class:nobody"]) {
    assert.equal(w.r.seesProjectDrafts(P, viewer), false, String(viewer));
    assert.equal(w.r.draftForMember(d.draftId, viewer), null, String(viewer));
  }
  assert.equal(w.r.draftForMember("DRAFT-2026-9999", V("ann")), null);
  assert.equal(w.r.draftForMember(` ${d.draftId} `, V("ann")).draft_id, d.draftId);
  /* the predicate is over the PROJECT bundle: another project's participants have no standing here */
  assert.equal(w.r.seesProjectDrafts(Q, V("ann")), false);
  assert.equal(w.r.seesProjectDrafts(Q, V("quinn")), true);
});

test("R10: two doors, and every other caller receives the dead answer, byte-identical", () => {
  const w = standard();
  w.publishedCase("CASE-2026-0001", P, 1);
  const a = draft(w, { caseId: "CASE-2026-0001" }), b = draft(w);
  grant(w, a, 1); const g2 = grant(w, b, 2); grant(w, b, 3); grant(w, b, 4);
  w.r.act({ act: "revoke", author: "ann", grant: g2.grantId });
  w.r.act({ act: "draft", author: "ann", draft: b.draftId, newCase: true }); // b still at (NULL, 1): grants 3, 4 live
  /* the recipient door: a live grant, and a named draft must be the grant's own */
  const rc = w.r.copy({ secretSha: SECRET(1), bySecret: true });
  assert.deepEqual([rc.ok, rc.reader, rc.draft], [true, "recipient", a.draftId]);
  assert.equal(w.r.copy({ draft: a.draftId, secretSha: SECRET(1), bySecret: true }).draft, a.draftId);
  /* the member door */
  const mc = w.r.copy({ draft: a.draftId, viewer: V("ivy") });
  assert.deepEqual([mc.ok, mc.reader], [true, "member"]);
  assert.equal(w.r.copy({ draft: a.draftId, viewer: "class:admin" }).reader, "member");
  /* everybody else */
  w.publishedCase("CASE-2026-0001", P, 2);           // a's bound edition is published: grant 1 is dead
  const others = [
    w.r.copy({ secretSha: SECRET(1), bySecret: true }),                       // moved (edition published)
    w.r.copy({ secretSha: SECRET(2), bySecret: true }),                       // revoked
    w.r.copy({ secretSha: SECRET(99), bySecret: true }),                      // never issued
    w.r.copy({ secretSha: "not-a-sha", bySecret: true }),                     // malformed
    w.r.copy({ secretSha: null, bySecret: true }),
    w.r.copy({ draft: a.draftId, secretSha: SECRET(3), bySecret: true }),     // a live grant, another draft
    w.r.copy({ draft: b.draftId, secretSha: SECRET(3), viewer: V("out") }),  // a secret without bySecret is no door
    w.r.copy({ draft: a.draftId, viewer: V("out") }),                         // no standing
    w.r.copy({ draft: a.draftId, viewer: V("quinn") }),
    w.r.copy({ draft: a.draftId, viewer: null }),
    w.r.copy({ draft: "DRAFT-2026-9999", viewer: V("ann") }),                // no such draft
    w.r.copy({ viewer: V("ann") }),
    w.r.copy(),
  ];
  const copy3 = w.r.copy({ secretSha: SECRET(3), bySecret: true });
  assert.equal(copy3.ok, true, "a live grant of b still reads");
  for (const r of others) assert.equal(JSON.stringify(r), DEAD);
  const dead = noReviewCopy();
  assert.deepEqual([dead.ok, dead.reason, dead.code, dead.check, dead.translation],
    [false, "NO_REVIEW_COPY", "NO_REVIEW_COPY", "C-87.1", REVIEW_COPY_CHECKS.NO_REVIEW_COPY.translation]);
  assert.equal(JSON.stringify(noReviewCopy()), DEAD, "built from no argument");
});

test("R19: the list of a project's drafts, fenced exactly as R9, bounded, writing nothing", () => {
  const w = standard();
  w.publishedCase("CASE-2026-0001", P, 1);
  const ids = [];
  for (let i = 0; i < 5; i++) {
    w.clock.now = `2026-09-28T0${i}:00:00.000Z`;
    ids.push(draft(w, i === 1 ? { caseId: "CASE-2026-0001" } : i === 2 ? { newCase: true } : {}, i === 3 ? "ed" : "ann").draftId);
  }
  w.r.act({ act: "draft", author: "bea", draft: ids[0], statement: "S" });            // an edit leaves the writer
  w.st.sql.exec(`UPDATE case_drafts SET statement_by=NULL WHERE draft_id=?`, ids[4]); // predates the stamp
  w.r.act({ act: "draft", author: "quinn", project: Q, statement: "T" });
  const before = w.snapshot();
  const l = w.r.list({ project: ` ${P} `, viewer: V("ivy") });
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  assert.deepEqual([l.ok, l.kind, l.project, l.count, l.total, l.limit, l.truncated], [true, "review-drafts", P, 5, 5, REVIEW_LIST_MAX, false]);
  assert.deepEqual(l.drafts.map((d) => d.draft_id), ids, "in creation order");
  const [d0, d1, d2, d3, d4] = l.drafts;
  assert.deepEqual(Object.keys(d0).sort(), ["case", "created_at", "created_by", "draft_id", "read", "statement_by", "updated_at", "updated_by"]);
  assert.deepEqual([d0.created_by, d0.updated_by, d0.statement_by, d0.read], ["ann", "bea", "ann", `op=reviewcopy&draft=${ids[0]}`]);
  assert.deepEqual([d0.case.case_id, d0.case.edition], [null, null]);
  assert.match(d0.case.identity, /DERIVES/);
  assert.deepEqual(d1.case, { case_id: "CASE-2026-0001", edition: 2, identity: "the next edition (2) of CASE-2026-0001" });
  assert.deepEqual([d2.case.case_id, d2.case.edition], [null, 1]);
  assert.deepEqual([d3.created_by, d3.statement_by, d4.statement_by], ["ed", "ed", null]);
  /* the limit: clamped to [1, 500], 500 when absent or unreadable */
  const cut = w.r.list({ project: P, viewer: V("ann"), limit: "2" });
  assert.deepEqual([cut.count, cut.total, cut.limit, cut.truncated, cut.drafts.map((d) => d.draft_id)], [2, 5, 2, true, ids.slice(0, 2)]);
  for (const [limit, want] of [[0, REVIEW_LIST_MAX], [-3, REVIEW_LIST_MAX], ["x", REVIEW_LIST_MAX], [null, REVIEW_LIST_MAX],
                               [9999, REVIEW_LIST_MAX], [1, 1], ["5", 5], [2.7, 2]])
    assert.equal(w.r.list({ project: P, viewer: V("ann"), limit }).limit, want, String(limit));
  /* the fence: no such project, not a project, and no standing are the dead answer, byte-identical */
  w.bundle("INQ-2026-0001-x", "inquiry");
  for (const r of [w.r.list({ project: P, viewer: V("out") }), w.r.list({ project: P, viewer: V("quinn") }),
                   w.r.list({ project: P, viewer: null }), w.r.list({ project: P, viewer: "junk" }),
                   w.r.list({ project: "PROJ-2026-9999-none", viewer: V("ann") }),
                   w.r.list({ project: "INQ-2026-0001-x", viewer: V("ann") }), w.r.list({ project: "", viewer: V("ann") }),
                   w.r.list({ viewer: V("ann") })])
    assert.equal(JSON.stringify(r), DEAD);
  assert.equal(w.r.list({ project: Q, viewer: V("quinn") }).total, 1);
  assert.equal(w.r.list({ project: P, viewer: V("adm") }).total, 5);
});

test("R8, R9, R10: the one place each is judged is the provider this module fills in publication (its R23), once", () => {
  const w = standard();
  assert.equal(w.providers.length, 1);
  const [{ module, provider: p }] = w.providers;
  assert.equal(module, "review");
  assert.deepEqual(Object.keys(p).sort(), ["caseIdentitySentence", "deadAnswer", "draftForMember", "draftIdentity",
    "grantAdmitsCaseEdition", "liveGrant", "statedEdition"]);
  w.publishedCase("CASE-2026-0001", P, 1);
  const d = draft(w, { caseId: "CASE-2026-0001" });
  grant(w, d, 1);
  const row = w.row(`SELECT * FROM case_drafts WHERE draft_id=?`, d.draftId);
  assert.deepEqual(p.draftForMember(d.draftId, V("ivy")), w.r.draftForMember(d.draftId, V("ivy")));
  assert.equal(p.draftForMember(d.draftId, V("out")), null);
  assert.deepEqual(p.draftIdentity(row), { caseId: "CASE-2026-0001", edition: 2 });
  assert.deepEqual(p.liveGrant(SECRET(1)), w.r.liveGrant(SECRET(1)));
  assert.equal(p.grantAdmitsCaseEdition(SECRET(1), "CASE-2026-0001", 2), true);
  assert.equal(p.grantAdmitsCaseEdition(SECRET(1), "CASE-2026-0001", 1), false);
  assert.equal(p.statedEdition({ caseId: null, edition: 1 }, false), null);
  assert.equal(p.caseIdentitySentence("CASE-2026-0001", 2, false), "the next edition (2) of CASE-2026-0001");
  assert.equal(JSON.stringify(p.deadAnswer()), DEAD);
});
