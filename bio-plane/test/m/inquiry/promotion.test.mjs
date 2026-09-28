/* inquiry's share of every promotion (promotion R39): the check that refuses a malformed basis, subject, supersession,
   division disclosure or cycle before the write, and the projection written in the promotion's transaction. Driven
   through the real `promotion.promote`. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { world, inquiryMd, sha } from "./fixture.mjs";
import { INQUIRY_TABLES, inquiryOwns } from "../../../src/inquiry/index.mjs";

const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b";

test("R11 check: the leg grammar at the write (BASIS_REFUSED with each finding, its code and translation), content refusals, SUBJECT_REFUSED", () => {
  const w = world(); w.doc(A); w.doc(B);
  const bad = w.promote("INQ-2026-0001-q", inquiryMd("INQ-2026-0001-q", { legs: [{ target: A, role: "maybe" }] }));
  assert.equal(bad.ok, false); assert.equal(bad.reason, "BASIS_REFUSED");
  assert.ok(bad.findings.every((x) => x.check && x.detail));
  assert.equal(w.record.head("INQ-2026-0001-q"), null, "nothing written");
  const unknownRow = w.promote("INQ-2026-0001-q", inquiryMd("INQ-2026-0001-q", { legs: [{ target: A, content_id: "f".repeat(64) }] }));
  assert.equal(unknownRow.reason, "BASIS_REFUSED");
  assert.ok(unknownRow.findings.some((x) => x.check === "C-45.5" || /CONTENT_ROW_UNKNOWN/.test(JSON.stringify(x))), JSON.stringify(unknownRow));
  const extent = w.promote("INQ-2026-0001-q", inquiryMd("INQ-2026-0001-q", { legs: [{ target: A }],
    extra: [] }).replace("    role: supports", "    role: supports\n    extent_kind: dom"));
  assert.equal(extent.reason, "BASIS_REFUSED");
  assert.ok(extent.findings.some((x) => x.code && x.translation), "a finding with a code carries its translation");
  const subj = w.promote("INQ-2026-0001-q", inquiryMd("INQ-2026-0001-q", { subject: "ENT-2026-0999" }));
  assert.equal(subj.reason, "SUBJECT_REFUSED"); assert.equal(subj.findings[0].check, "C-2.8");
  w.entity("ENT-2026-0999");
  assert.equal(w.promote("INQ-2026-0001-q", inquiryMd("INQ-2026-0001-q", { subject: "ENT-2026-0999" })).ok, true);
  /* a replay is exempt from the shape arms (the record's history is holdable verbatim) */
  const replay = w.promote("INQ-2026-0002-r", inquiryMd("INQ-2026-0002-r", { legs: [{ target: A, role: "maybe" }] }), null, { replay: true });
  assert.equal(replay.ok, true, JSON.stringify(replay));
});

test("R11 check: SUPERSESSION_REFUSED (itself, unknown), NO_SIBLING_DISCLOSURE (parent does not list it, siblings differ)", () => {
  const w = world(); w.doc(A);
  const P = "INQ-2026-0005-p";
  w.inquiry(P, { legs: [{ target: A }] });
  const sup = (id, target, extra = []) => w.promote(id, inquiryMd(id, { refs: [{ target, rel: "supersedes", reason: "split" }],
    extra: [`division_parent: ${target}`, "division_siblings: [INQ-2026-0007-s]", ...extra] }));
  assert.equal(sup("INQ-2026-0006-c", "INQ-2026-0006-c").reason, "SUPERSESSION_REFUSED", "itself");
  assert.equal(sup("INQ-2026-0006-c", "INQ-2026-0099-x").reason, "SUPERSESSION_REFUSED", "unknown");
  const noReason = w.promote("INQ-2026-0006-c", inquiryMd("INQ-2026-0006-c", { refs: [{ target: P, rel: "supersedes" }] }));
  assert.equal(noReason.reason, "SUPERSESSION_REFUSED");
  const orphan = sup("INQ-2026-0006-c", P);
  assert.equal(orphan.reason, "NO_SIBLING_DISCLOSURE", "the parent does not list the child");
  /* a parent that lists its children: the siblings must match */
  w.promote(P, w.text(P).replace("---\n\n## Question", "division:\n  reason: \"split\"\n  apportioned_by: member:alice\n  at: \"2026-09-27T00:00:00Z\"\n  into: [INQ-2026-0006-c, INQ-2026-0007-s, INQ-2026-0008-t]\n---\n\n## Question"));
  const missing = sup("INQ-2026-0006-c", P);
  assert.equal(missing.reason, "NO_SIBLING_DISCLOSURE"); assert.deepEqual(missing.missing, ["INQ-2026-0008-t"]);
  const ok = w.promote("INQ-2026-0006-c", inquiryMd("INQ-2026-0006-c", { refs: [{ target: P, rel: "supersedes", reason: "split" }],
    extra: [`division_parent: ${P}`, "division_siblings: [INQ-2026-0007-s, INQ-2026-0008-t]"] }));
  assert.equal(ok.ok, true, JSON.stringify(ok));
  assert.deepEqual(w.k.supersededBy(P), ["INQ-2026-0006-c"], "R12: the superseded-by index is written in the same promotion");
});

test("R11 R29 check: SELF_BASIS and BASIS_CYCLE (naming the whole path) keep the basis a DAG, even on replay; C-33.22, C-33.23", () => {
  const w = world(); w.doc(A);
  const self = w.promote("INQ-2026-0001-q", inquiryMd("INQ-2026-0001-q", { legs: [{ target: "INQ-2026-0001-q" }] }));
  assert.equal(self.reason, "SELF_BASIS"); assert.equal(self.check, "C-33.22"); assert.ok(self.translation);
  w.inquiry("INQ-2026-0001-q", { legs: [{ target: A }] });
  w.inquiry("INQ-2026-0002-r", { legs: [{ target: "INQ-2026-0001-q" }] });
  w.inquiry("INQ-2026-0003-s", { legs: [{ target: "INQ-2026-0002-r" }] });
  const cyc = w.promote("INQ-2026-0001-q", inquiryMd("INQ-2026-0001-q", { legs: [{ target: A }, { target: "INQ-2026-0003-s" }] }), undefined, { replay: true });
  assert.equal(cyc.reason, "BASIS_CYCLE"); assert.equal(cyc.check, "C-33.23");
  assert.deepEqual(cyc.path, ["INQ-2026-0001-q", "INQ-2026-0003-s", "INQ-2026-0002-r", "INQ-2026-0001-q"]);
  assert.deepEqual(w.k.cyclePath("INQ-2026-0001-q", ["INQ-2026-0003-s"]), cyc.path);
  assert.equal(w.k.cyclePath("INQ-2026-0003-s", [A]), null);
});

test("R12 projection: inquiry_basis re-derived whole from basis[]; each leg's content row named, carried or minted; exclusions; count and subject", () => {
  const w = world(); const [capA] = w.doc(A); w.doc(B); w.entity("ENT-2026-0001");
  const first = w.inquiry("INQ-2026-0001-q", { subject: "ENT-2026-0001",
    legs: [{ target: A }, { target: B, role: "cuts_against", note: "against" }],
    extra: ["completeness:", '  statement: "what we covered"', "  author: member:alice", '  at: "2026-09-27T00:00:00Z"',
            "completeness_excluded:", `  - target: ${B}`, '    description: "the other memo"', '    reason: "out of scope"',
            '  - description: "a records request"', '    reason: "outstanding"'] });
  assert.deepEqual(first.content.map((c) => [c.ord, c.minted, c.carried]), [[0, true, false], [1, true, false]]);
  const legs = w.rows(`SELECT ord, target_id, target_type, role, note, content_id FROM inquiry_basis WHERE bundle_id=? ORDER BY ord`, "INQ-2026-0001-q");
  assert.deepEqual(legs.map((l) => [l.ord, l.target_id, l.target_type, l.role, l.note]),
    [[0, A, "information", "supports", null], [1, B, "information", "cuts_against", "against"]]);
  assert.equal(w.row(`SELECT capture_sha FROM content WHERE content_id=?`, legs[0].content_id).capture_sha, capA);
  const x = w.rows(`SELECT ord, target_id, description, reason, author FROM inquiry_exclusions WHERE bundle_id=? ORDER BY ord`, "INQ-2026-0001-q");
  assert.deepEqual(x.map((r) => [r.target_id, r.description, r.reason, r.author]),
    [[B, "the other memo", "out of scope", "member:alice"], [null, "a records request", "outstanding", "member:alice"]]);
  const b = w.row(`SELECT inquiry_basis_count, inquiry_subject_entity FROM bundles WHERE bundle_id=?`, "INQ-2026-0001-q");
  assert.deepEqual([b.inquiry_basis_count, b.inquiry_subject_entity], [2, "ENT-2026-0001"]);
  /* a re-promotion that REORDERS the legs keeps each leg's content row (carried, keyed by target and extent, not ord) */
  const again = w.promote("INQ-2026-0001-q", inquiryMd("INQ-2026-0001-q", { subject: "ENT-2026-0001",
    legs: [{ target: B, role: "cuts_against" }, { target: A }] }));
  assert.equal(again.ok, true, JSON.stringify(again));
  assert.deepEqual(again.content.map((c) => [c.target, c.carried, c.minted]), [[B, true, false], [A, true, false]]);
  const after = w.rows(`SELECT target_id, content_id FROM inquiry_basis WHERE bundle_id=? ORDER BY ord`, "INQ-2026-0001-q");
  assert.equal(after[1].content_id, legs[0].content_id, "byte for byte the same row");
  assert.equal(w.count("inquiry_exclusions"), 0, "exclusions re-derived whole: the revision names none");
  /* a named content id is taken at its word */
  const named = w.promote("INQ-2026-0001-q", inquiryMd("INQ-2026-0001-q", { subject: "ENT-2026-0001",
    legs: [{ target: A, content_id: legs[0].content_id }] }));
  assert.deepEqual(named.content.map((c) => [c.content_id, c.minted, c.carried]), [[legs[0].content_id, false, false]]);
});

test("R12 projection: a creation admitted as a migration replay records its capture and promotion key", () => {
  const w = world();
  const r = w.promote("INQ-2026-0001-q", inquiryMd("INQ-2026-0001-q"), null, { migrationReplay: { capture: "c".repeat(64), promotion: "P-1" } });
  assert.equal(r.ok, true); assert.deepEqual([r.migration_replay.capture, r.migration_replay.promotion], ["c".repeat(64), "P-1"]);
  assert.equal(w.row(`SELECT promotion_key FROM inquiry_migration_replays WHERE bundle_id=?`, "INQ-2026-0001-q").promotion_key, "P-1");
});

test("R34 a leg that cuts against travels the projection like a supporting one", () => {
  const w = world(); w.doc(A);
  w.inquiry("INQ-2026-0001-q", { legs: [{ target: A, role: "cuts_against" }] });
  assert.equal(w.k.basisFor("INQ-2026-0001-q").legs[0].role, "cuts_against");
  assert.equal(w.k.restingOn(A).dependents[0].role, "cuts_against");
});

test("R36 the three tables carry bundle_id and are declared to record-core's purge, which clears them per bundle", () => {
  const w = world(); w.doc(A);
  w.inquiry("INQ-2026-0001-q", { legs: [{ target: A }] });
  assert.deepEqual(INQUIRY_TABLES, ["inquiry_basis", "inquiry_exclusions", "inquiry_migration_replays"]);
  for (const t of INQUIRY_TABLES) {
    assert.ok(w.rows(`PRAGMA table_info(${t})`).some((c) => c.name === "bundle_id"), t);
    assert.ok(inquiryOwns(t) && inquiryOwns({ name: t }));
  }
  const r = w.record.purge({ bundleId: "INQ-2026-0001-q" });
  assert.equal(w.count("inquiry_basis"), 0);
  assert.ok(JSON.stringify(r).includes("inquiry_basis"), JSON.stringify(r).slice(0, 300));
});

test("R37 no place is named in this module's behaviour or outward text", () => {
  const dir = new URL("../../../src/inquiry/", import.meta.url);
  for (const f of readdirSync(dir)) {
    const text = readFileSync(new URL(f, dir), "utf8");
    assert.ok(!/oakland|alameda/i.test(text), `${f} names a place`);
  }
});

test("R40 the read contract: inquiry_basis's columns and bundles.inquiry_subject_entity, as R12 records them", () => {
  const w = world(); w.doc(A); w.entity("ENT-2026-0001");
  w.inquiry("INQ-2026-0001-q", { subject: "ENT-2026-0001", legs: [{ target: A, note: "n" }] });
  const cols = w.rows(`PRAGMA table_info(inquiry_basis)`).map((c) => c.name);
  for (const c of ["bundle_id", "ord", "role", "target_id", "content_id", "note"]) assert.ok(cols.includes(c), c);
  const joined = w.row(`SELECT ib.bundle_id, ib.ord, ib.role, ib.target_id, ib.content_id, ib.note, b.inquiry_subject_entity
                          FROM inquiry_basis ib JOIN bundles b ON b.bundle_id = ib.bundle_id`);
  assert.deepEqual([joined.bundle_id, joined.ord, joined.role, joined.target_id, joined.note, joined.inquiry_subject_entity],
    ["INQ-2026-0001-q", 0, "supports", A, "n", "ENT-2026-0001"]);
  assert.match(joined.content_id, /^[0-9a-f]{64}$/);
  w.promote("INQ-2026-0001-q", inquiryMd("INQ-2026-0001-q", { legs: [{ target: A }] }));
  assert.equal(w.row(`SELECT inquiry_subject_entity FROM bundles WHERE bundle_id=?`, "INQ-2026-0001-q").inquiry_subject_entity, null,
               "null for none");
});
