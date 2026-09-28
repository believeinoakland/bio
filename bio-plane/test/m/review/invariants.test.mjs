/* review: the invariants (R20, R21, R23, R24, R25). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { standard, P, V, SECRET } from "./fixture.mjs";
import { REVIEW_COPY_CHECKS, REVIEW_MARKING, REVIEW_TABLES, noReviewCopy, caseIdentitySentence,
         reviewOwns } from "../../../src/review/index.mjs";
import * as catalogue from "../../../checks/bio-checks.mjs";

/** Every act and read, over two drafts (one naming a case), a grant, a revocation, comments and the list. */
function battery(w) {
  const out = [];
  const keep = (r) => { out.push(r); return r; };
  w.publishedCase("CASE-2026-0001", P, 1);
  const a = keep(w.r.act({ act: "draft", author: "ed", project: P, statement: "S", caseId: "CASE-2026-0001", targets: ["INQ-1"] }));
  const b = keep(w.r.act({ act: "draft", author: "ann", project: P, statement: "T", newCase: true }));
  keep(w.r.act({ act: "draft", author: "ann", draft: a.draftId, statement: "S2", caseId: "CASE-2026-0001" }));
  const g = keep(w.r.act({ act: "grant", author: "ann", draft: a.draftId, recipient: "Reporter", secretSha: SECRET(1) }));
  keep(w.r.act({ act: "grant", author: "ann", draft: b.draftId, recipient: "Editor", secretSha: SECRET(2) }));
  keep(w.r.comment({ secretSha: SECRET(1), bySecret: true, text: "a question" }));
  keep(w.r.comment({ draft: b.draftId, viewer: V("ivy"), text: "a note" }));
  keep(w.r.copy({ secretSha: SECRET(1), bySecret: true }));
  keep(w.r.copy({ draft: a.draftId, viewer: V("ann") }));
  keep(w.r.copy({ draft: b.draftId, viewer: V("ann") }));
  keep(w.r.list({ project: P, viewer: V("ann") }));
  keep(w.r.act({ act: "revoke", author: "ann", grant: g.grantId }));
  keep(w.r.copy({ secretSha: SECRET(1), bySecret: true }));
  for (const code of Object.keys(REVIEW_COPY_CHECKS)) keep(drive(w, code, a.draftId));
  return out;
}

/** One refusal per row, driven at the interface. */
function drive(w, code, draftId) {
  switch (code) {
    case "MACHINE_CANNOT_REVIEW": return w.r.act({ act: "draft", author: "class:ai", project: P });
    case "NO_REVIEW_COPY": return w.r.copy({ draft: draftId, viewer: V("out") });
    case "REVIEW_UNKNOWN_ACT": return w.r.act({ act: "publish", author: "ann" });
    case "REVIEW_NOT_PROJECT_OWNER": return w.r.act({ act: "grant", author: "ed", draft: draftId, recipient: "R", secretSha: SECRET(5) });
    case "REVIEW_NO_PROJECT": return w.r.act({ act: "draft", author: "ann" });
    case "REVIEW_DRAFT_CHANGES_PROJECT": return w.r.act({ act: "draft", author: "ann", draft: draftId, project: "PROJ-2026-0002-q" });
    case "REVIEW_NO_SUCH_CASE": return w.r.act({ act: "draft", author: "ann", project: P, caseId: "CASE-2026-0404" });
    case "REVIEW_DRAFT_TOO_LARGE": return w.r.act({ act: "draft", author: "ann", project: P, scope: "x".repeat(70000) });
    case "REVIEW_NO_RECIPIENT": return w.r.act({ act: "grant", author: "ann", draft: draftId, recipient: "" });
    case "REVIEW_NO_SECRET": return w.r.act({ act: "grant", author: "ann", draft: draftId, recipient: "R", secretSha: "x" });
    case "REVIEW_NO_GRANT": return w.r.act({ act: "revoke", author: "ann" });
    case "REVIEW_NO_COMMENT_TEXT": return w.r.comment({ draft: draftId, viewer: V("ann"), text: "" });
    default: throw new Error(`no driver for ${code}`);
  }
}

/* this module's tables, the minter's ledger, and SQLite's own autoincrement counter for review_comments */
const OWN = new Set(["case_drafts", "review_grants", "review_comments", "minted_ids", "sqlite_sequence"]);

test("R20: nothing here writes the published projection, a case document or a signature; a copy never leaves the instance", () => {
  const w = standard();
  const others = () => Object.fromEntries(Object.entries(w.snapshot()).filter(([t]) => !OWN.has(t) && t !== "cases" && t !== "published_cases"));
  w.publishedCase("CASE-2026-0001", P, 1);
  const before = others();
  const pub = () => [w.rows(`SELECT * FROM cases`), w.rows(`SELECT * FROM published_cases`)];
  const pubBefore = JSON.stringify(pub());
  const answers = battery(w);
  assert.deepEqual(others(), before, "no table outside this module's own was written, the dry run's case document included");
  assert.equal(JSON.stringify(pub()), pubBefore);
  assert.ok(w.calls.publish.length >= 3, "the gates were run");
  for (const c of answers.filter((x) => x && x.kind === "review-copy"))
    assert.deepEqual([c.published, c.signature.signed, c.marking], [false, false, REVIEW_MARKING]);
});

test("R21: no secret's value is received or stored, only its fingerprint", () => {
  const w = standard();
  const VALUE = "the-read-secret-value-itself";
  const d = w.r.act({ act: "draft", author: "ann", project: P, statement: "S", secret: VALUE, secretValue: VALUE });
  const g = w.r.act({ act: "grant", author: "ann", draft: d.draftId, recipient: "R", secretSha: SECRET(1), secret: VALUE });
  assert.equal(g.ok, true);
  /* a grant's secret field is the 64-hex fingerprint the control plane took, never a value */
  assert.equal(w.r.act({ act: "grant", author: "ann", draft: d.draftId, recipient: "R", secretSha: VALUE }).code, "REVIEW_NO_SECRET");
  w.r.comment({ secretSha: SECRET(1), bySecret: true, text: "hello", secret: VALUE });
  const everything = JSON.stringify(w.snapshot());
  assert.equal(everything.includes(VALUE), false, "the value is stored nowhere");
  assert.equal(w.row(`SELECT secret_sha FROM review_grants WHERE grant_id=?`, g.grantId).secret_sha, SECRET(1));
  assert.deepEqual(w.rows(`PRAGMA table_info(review_grants)`).map((c) => c.name).filter((n) => /secret/.test(n)), ["secret_sha"]);
  for (const r of [g, w.r.copy({ secretSha: SECRET(1), bySecret: true }), w.r.copy({ draft: d.draftId, viewer: V("ann") })])
    assert.equal(JSON.stringify(r).includes(VALUE), false);
});

test("R23: C-87.1–C-87.11 and C-32.16 moved here with their ids and translations, each refused at its interface", () => {
  const want = { MACHINE_CANNOT_REVIEW: "C-32.16", NO_REVIEW_COPY: "C-87.1", REVIEW_UNKNOWN_ACT: "C-87.2",
    REVIEW_NOT_PROJECT_OWNER: "C-87.3", REVIEW_NO_PROJECT: "C-87.4", REVIEW_DRAFT_CHANGES_PROJECT: "C-87.5",
    REVIEW_NO_SUCH_CASE: "C-87.6", REVIEW_DRAFT_TOO_LARGE: "C-87.7", REVIEW_NO_RECIPIENT: "C-87.8", REVIEW_NO_SECRET: "C-87.9",
    REVIEW_NO_GRANT: "C-87.10", REVIEW_NO_COMMENT_TEXT: "C-87.11" };
  assert.deepEqual(Object.fromEntries(Object.entries(REVIEW_COPY_CHECKS).map(([k, v]) => [k, v.check])), want);
  assert.ok(Object.isFrozen(REVIEW_COPY_CHECKS));
  /* moved, never copied: the catalogue holds neither the family nor the machine row */
  assert.equal(catalogue.REVIEW_COPY_CHECKS, undefined);
  assert.equal(catalogue.MACHINE_FENCE_CHECKS.MACHINE_CANNOT_REVIEW, undefined);
  for (const fam of Object.values(catalogue).filter((v) => v && typeof v === "object"))
    for (const row of Object.values(fam))
      assert.ok(!(row && typeof row === "object" && Object.values(want).includes(row.check)), `catalogue still holds ${row && row.check}`);
  const w = standard();
  const d = w.r.act({ act: "draft", author: "ann", project: P, statement: "S" });
  for (const [code, check] of Object.entries(want)) {
    const row = REVIEW_COPY_CHECKS[code];
    assert.match(row.where, /^src\/review\/index\.mjs \S+ > is-[a-z-]+$/, code);
    assert.ok(typeof row.translation === "string" && row.translation.length > 40, code);
    const r = drive(w, code, d.draftId);
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, code, code, check, row.translation], code);
    assert.equal(typeof r.detail, "string");
  }
});

test("R24: case_drafts, review_grants and review_comments are declared to record-core's purge as whole-store tables", () => {
  const w = standard();
  battery(w);
  assert.deepEqual(REVIEW_TABLES.map((t) => [t.name, t.keys]).sort(),
    [["case_drafts", []], ["review_comments", []], ["review_grants", []]]);
  for (const t of REVIEW_TABLES) assert.equal(reviewOwns(t.name) && reviewOwns(t), true);
  assert.equal(reviewOwns("statement_acknowledgements"), false);
  const counts = () => ["case_drafts", "review_grants", "review_comments"].map((t) => w.count(t));
  const before = counts();
  assert.ok(before.every((n) => n > 0));
  const one = w.record.purge({ bundleId: P });
  assert.deepEqual(counts(), before, "a single-bundle purge leaves them");
  for (const t of ["case_drafts", "review_grants", "review_comments"]) assert.equal(one.removed?.[t] ?? one.tables?.[t] ?? 0, 0);
  w.record.purge({});
  assert.deepEqual(counts(), [0, 0, 0], "the whole-store purge clears them");
  assert.ok(w.count("minted_ids") > 0, "the minted ids are never reissued");
});

test("R25: no place is named in this module's behaviour or outward text", () => {
  const w = standard();
  const text = JSON.stringify([battery(w), REVIEW_COPY_CHECKS, REVIEW_MARKING, noReviewCopy(),
    [null, "CASE-2026-0001"].flatMap((c) => [true, false].map((n) => caseIdentitySentence(c, 2, n)))]);
  for (const place of ["Oakland", "Alameda", "California", "Berkeley", "San Francisco", "County of", "City of"])
    assert.equal(text.toLowerCase().includes(place.toLowerCase()), false, place);
});
