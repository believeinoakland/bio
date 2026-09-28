/* basis-versions: the grammar (R1–R5), the machine and the rows it carries (R35), and no place in its text (R36). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { basisVersionFindings, versionsIn, VERSION_MACHINE, versionNeedsReason, VERSION_NAME_RE, VERSION_STATES,
         BASIS_VERSION_CHECKS, VERSION_ACT_CHECKS, NARROW_CHECKS, SUGGEST_KINDS, compositionDiff, sameComposition,
         versionAsWritten } from "../../../src/basis-versions/index.mjs";
import { ACT_SHAPE_CHECKS, MACHINE_FENCE_CHECKS, SUGGEST_CHECKS, SUFFICIENCY_UNCLAIMED } from "../../../checks/bio-checks.mjs";

const T = "2026-09-27T00:00:00Z";
const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-r";

/* A frontmatter object with one well-formed version, overridable per field. */
function fm({ v = {}, legs = null, grounds = null, more = [] } = {}) {
  const base = { name: "first", description: "a reading of the evidence", relationship: "and", state: "suggested",
                 hidden: false, derived_from: null, ...v };
  return {
    id: Q,
    basis_versions: [base, ...more],
    basis_version_grounds: grounds ?? [{ version: base.name, ground: "main", asserted_by: "member:alice", at: T }],
    basis_version_legs: legs ?? [{ version: base.name, target: DOC, role: "supports", ground: "main" }],
  };
}
const codes = (x) => { const f = []; basisVersionFindings(x, f); return f.filter((y) => y.severity === "error").map((y) => y.code); };

test("R1: a version carries a description, a unique permitted name, a known state, a boolean hidden, a known kind when present, and once moved a named member and an ISO instant", () => {
  assert.deepEqual(codes(fm()), [], "a well-formed version passes");
  assert.deepEqual(codes(fm({ v: { description: "" } })), ["VERSION_NO_DESCRIPTION"]);
  assert.deepEqual(codes(fm({ v: { description: "too short" } })), ["VERSION_NO_DESCRIPTION"]);
  for (const bad of ["", "x".repeat(65), "no/slash", "-dash-first"])
    assert.ok(codes(fm({ v: { name: bad }, legs: [], grounds: [] })).includes("VERSION_NAME_NOT_UNIQUE"), `name '${bad}' is refused`);
  assert.ok(VERSION_NAME_RE.test("a".repeat(64)) && !VERSION_NAME_RE.test("a".repeat(65)), "1–64 characters");
  const dup = fm({ more: [{ name: "first", description: "another reading entirely", relationship: "and", state: "suggested" }] });
  assert.ok(codes(dup).includes("VERSION_NAME_NOT_UNIQUE"), "a name is unique within its inquiry");
  assert.deepEqual(codes(fm({ v: { state: "published" } })), ["VERSION_STATE_UNKNOWN"]);
  assert.deepEqual(codes(fm({ v: { hidden: "yes" } })), ["VERSION_HIDDEN_NOT_BOOLEAN"]);
  assert.deepEqual(codes(fm({ v: { kind: "hunch" } })), ["VERSION_KIND_UNKNOWN"]);
  for (const k of Object.keys(SUGGEST_KINDS)) assert.deepEqual(codes(fm({ v: { kind: k } })), [], `kind ${k} is known`);
  assert.equal(SUGGEST_CHECKS.VERSION_KIND_UNKNOWN.check, "C-27.15");
  /* moved into a state that needs a reason: a named member, a reason and an ISO instant */
  assert.deepEqual(codes(fm({ v: { state: "rejected", state_by: "member:bo", state_at: T, state_reason: "does not hold up" } })), []);
  assert.ok(codes(fm({ v: { state: "rejected", state_by: "class:ai", state_at: T, state_reason: "does not hold up" } }))
    .includes("VERSION_DISPOSITION_UNATTRIBUTED"), "a machine never settles one");
  assert.ok(codes(fm({ v: { state: "considering", state_by: "member:bo", state_at: "yesterday", state_reason: "need more" } }))
    .includes("VERSION_DISPOSITION_UNATTRIBUTED"), "the instant is ISO");
  assert.equal(BASIS_VERSION_CHECKS.VERSION_DISPOSITION_UNATTRIBUTED.check, "C-25.19");
});

test("R2: derived_from names a version of the same inquiry and derivations form a tree; every leg and ground row names a version that exists", () => {
  assert.deepEqual(codes(fm({ v: { derived_from: "nowhere" } })), ["VERSION_DERIVED_FROM_UNKNOWN"]);
  const cyc = { id: Q, basis_versions: [
    { name: "a", description: "reading number a", relationship: "and", state: "suggested", derived_from: "b" },
    { name: "b", description: "reading number b", relationship: "and", state: "suggested", derived_from: "a" }] };
  assert.ok(codes(cyc).includes("VERSION_DERIVATION_CYCLE"));
  const orphanLeg = fm({ legs: [{ version: "first", target: DOC, role: "supports", ground: "main" },
                                { version: "ghost", target: DOC, role: "supports", ground: "main" }] });
  assert.ok(codes(orphanLeg).includes("VERSION_ORPHAN_ROW"));
  const orphanGround = fm({ grounds: [{ version: "first", ground: "main", asserted_by: "member:alice", at: T },
                                      { version: "ghost", ground: "main", asserted_by: "member:alice", at: T }] });
  assert.ok(codes(orphanGround).includes("VERSION_ORPHAN_ROW"));
  assert.ok(codes({ basis_version_legs: [{ version: "x", target: DOC, role: "supports" }] }).includes("VERSION_ORPHAN_ROW"),
    "legs with no version block at all are orphans");
  const tree = { id: Q, basis_versions: [
    { name: "a", description: "reading number a", relationship: "and", state: "suggested" },
    { name: "b", description: "reading number b", relationship: "and", state: "suggested", derived_from: "a" }] };
  assert.deepEqual(codes(tree), [], "a derivation onto a held version is legal");
});

test("R3: each version's legs obey the leg grammar (lead and theme first), the target and vocabularies, and its grounds and relationship obey DEC-32 per version", () => {
  assert.deepEqual(codes(fm({ legs: [{ version: "first", target: Q, role: "supports", ground: "main" }] })), ["VERSION_LEG_SELF"],
    "a leg naming this inquiry");
  assert.ok(codes(fm({ legs: [{ version: "first", target: "PROJ-2026-0001-p", role: "supports", ground: "main" }] }))
    .includes("VERSION_LEG_NOT_CITABLE"), "a project is not citable");
  assert.deepEqual(codes(fm({ legs: [{ version: "first", target: Q2, role: "supports", ground: "main" }] })), [],
    "another inquiry is");
  for (const [k, bad] of [["role", "maybe"], ["grade", "E"], ["grade_axis", "vibes"], ["grade_source", "rumour"]])
    assert.ok(codes(fm({ legs: [{ version: "first", target: DOC, role: "supports", ground: "main", [k]: bad }] }))
      .includes("VERSION_LEG_NOT_CITABLE"), `${k} vocabulary`);
  assert.ok(codes(fm({ legs: [{ version: "first", target: DOC, role: "supports", ground: "main", extent_kind: "dom" }] }))
    .includes("CONTENT_EXTENT_NO_PRODUCER"), "the extent grammar at the version's grain (C-25.10)");
  const lead = codes(fm({ legs: [{ version: "first", target: "LEAD-2026-0001-x", role: "supports", ground: "main" }] }));
  const theme = codes(fm({ legs: [{ version: "first", target: DOC, role: "supports", ground: "main", theme: "THEME-2026-0101-ab" }] }));
  assert.equal(lead[0], "LEAD_NOT_EVIDENCE", "a lead is refused by name first (C-54.1)");
  assert.equal(theme[0], "THEME_NOT_EVIDENCE", "a theme is refused by name first");
  /* grounds */
  assert.ok(codes(fm({ legs: [{ version: "first", target: DOC, role: "supports", ground: "main" },
                              { version: "first", target: DOC2, role: "supports" }] })).includes("VERSION_PARTITION_INCOMPLETE"));
  assert.ok(codes(fm({ grounds: [{ version: "first", ground: "main", asserted_by: "member:alice", at: T },
                                 { version: "first", ground: "main", asserted_by: "member:alice", at: T }] }))
    .includes("VERSION_GROUND_UNASSERTED"), "declared once");
  assert.ok(codes(fm({ grounds: [{ version: "first", ground: "main", asserted_by: "class:ai", at: T }] }))
    .includes("VERSION_GROUND_UNASSERTED"), "a named asserter, never a machine");
  assert.ok(codes(fm({ grounds: [{ version: "first", ground: "main", asserted_by: "member:alice", at: "then" }] }))
    .includes("VERSION_GROUND_UNASSERTED"), "and a date");
  assert.deepEqual(codes(fm({ grounds: [{ version: "first", ground: "main", asserted_by: SUFFICIENCY_UNCLAIMED, at: T }] })), [],
    "a one-part version may state that nobody claimed it (DEC-65)");
  assert.ok(codes(fm({ grounds: [{ version: "first", ground: "main", asserted_by: "member:alice", at: T },
                                 { version: "first", ground: "spare", asserted_by: "member:alice", at: T }] }))
    .includes("VERSION_ORPHAN_ROW"), "no empty ground");
  assert.deepEqual(codes(fm({ v: { relationship: "xor" } })), ["VERSION_NO_RELATIONSHIP"]);
  assert.deepEqual(codes(fm({ v: { relationship: "or" } })), ["VERSION_RELATIONSHIP_DISAGREES"], "one ground composes as and");
  const two = fm({ v: { relationship: "or" },
    grounds: [{ version: "first", ground: "a", asserted_by: "member:alice", at: T }, { version: "first", ground: "b", asserted_by: "member:alice", at: T }],
    legs: [{ version: "first", target: DOC, role: "supports", ground: "a" }, { version: "first", target: DOC2, role: "supports", ground: "b" }] });
  assert.deepEqual(codes(two), []);
  /* a derived version regrouping its parent's partition carries an attributed regroup */
  const parent = two.basis_versions[0];
  const regroup = { id: Q, basis_versions: [parent, { name: "second", description: "one part now, not two", relationship: "and",
    state: "suggested", derived_from: "first" }],
    basis_version_grounds: [...two.basis_version_grounds, { version: "second", ground: "all", asserted_by: "member:alice", at: T }],
    basis_version_legs: [...two.basis_version_legs, { version: "second", target: DOC, role: "supports", ground: "all" }] };
  assert.ok(codes(regroup).includes("VERSION_REGROUP_UNATTRIBUTED"));
  regroup.basis_versions[1] = { ...regroup.basis_versions[1], regroup_by: "member:bo", regroup_at: T, regroup_note: "merged the two parts" };
  assert.deepEqual(codes(regroup), []);
});

test("R4: the machine's edges, exactly, and which moves need a reason", () => {
  assert.deepEqual(VERSION_STATES, ["suggested", "considering", "accepted", "rejected"]);
  assert.deepEqual(VERSION_MACHINE.edges, {
    suggested: ["considering", "accepted", "rejected"],
    considering: ["suggested", "accepted", "rejected"],
    accepted: ["considering", "rejected"],
    rejected: ["suggested", "considering", "accepted"],
  });
  assert.deepEqual(VERSION_STATES.filter(versionNeedsReason), ["considering", "rejected"]);
  assert.equal(versionNeedsReason(null), false);
});

test("R5: versionsIn answers each version with its legs, grounds and composition, in a fixed order and escaping; the composition compares byte for byte", () => {
  const x = fm({ v: { claim: "the claim\twith a tab", description: "line one\nline two \\ slash" },
                 legs: [{ version: "first", target: DOC, role: "supports", ground: "main", grade: "B", grade_axis: "capture",
                          grade_source: "capture", note: "a note", date: "2026-09-01" },
                        { version: "first", target: DOC2, role: "cuts_against", ground: "main", extent_kind: "pdf-page", extent_page: 2 }] });
  const [v] = versionsIn(x);
  assert.deepEqual(v.composition.split("\n"), [
    "name\tfirst",
    "description\tline one\\nline two \\\\ slash",
    "claim\tthe claim\\twith a tab",
    "relationship\tand",
    "derived_from\t",
    `ground\tmain\tmember:alice\t${T}\t`,
    `leg\t0\t${DOC}\tinformation\tsupports\tB\tcapture\tcapture\ta note\t2026-09-01\tmain`,
    `leg\t1\t${DOC2}\tinformation\tcuts_against\t\t\t\t\t\tmain`,
    `leg_referent\t1\t${v.legs[1].referent}`,
  ], "fixed order; the escape is injective (backslash, tab, newline); a referent only when not the whole document");
  assert.equal(v.legs.length, 2);
  assert.deepEqual(v.grounds, [{ ground: "main", asserted_by: "member:alice", at: T, statement: null }]);
  /* what happened TO a version is outside its composition */
  const moved = versionsIn(fm({ v: { state: "rejected", state_by: "member:bo", state_at: T, state_reason: "no", hidden: true,
                                     author: "member:x", at: T, run: "RUN-1" } }))[0];
  assert.equal(moved.composition, versionsIn(fm())[0].composition);
  assert.deepEqual([moved.state, moved.hidden, moved.state_by, moved.run], ["rejected", 1, "member:bo", "RUN-1"]);
  /* kind is inside, and only when present */
  assert.ok(versionsIn(fm({ v: { kind: "basis-version" } }))[0].composition.includes("\nkind\tbasis-version\n"));
  /* grounds sorted, legs not */
  const g2 = fm({ v: { relationship: "or" },
    grounds: [{ version: "first", ground: "z", asserted_by: "member:a", at: T }, { version: "first", ground: "a", asserted_by: "member:a", at: T }],
    legs: [{ version: "first", target: DOC2, role: "supports", ground: "z" }, { version: "first", target: DOC, role: "supports", ground: "a" }] });
  const comp = versionsIn(g2)[0].composition.split("\n");
  assert.deepEqual(comp.filter((l) => l.startsWith("ground")).map((l) => l.split("\t")[1]), ["a", "z"]);
  assert.deepEqual(comp.filter((l) => l.startsWith("leg\t")).map((l) => l.split("\t")[2]), [DOC2, DOC]);
  /* K182: a pinned capture is inside the composition, after the referents */
  const pinned = versionsIn(fm({ legs: [{ version: "first", target: DOC, role: "supports", ground: "main", extent_capture: "c".repeat(64) }] }))[0];
  assert.equal(pinned.composition.split("\n").at(-1), `leg_capture\t0\t${"c".repeat(64)}`);
  assert.equal(sameComposition(versionsIn(fm())[0].composition, pinned.composition), true,
    "a composition stored before the line existed is compared without it");
  assert.equal(sameComposition(pinned.composition, pinned.composition.replace(/c{64}/, "d".repeat(64))), false,
    "once stored with the line, the pin is frozen");
  assert.equal(compositionDiff("name\ta\nleg\t0", "name\ta\nleg\t1"), "leg changed");
  assert.equal(compositionDiff("name\ta", "name\ta\nkind\tx"), "a kind was added");
  assert.equal(compositionDiff("name\ta", "name\ta"), "nothing changed");
});

test("R5 (K182): versionAsWritten is the written form of a submission, which versionsIn composes identically to the document the write holds", () => {
  const w = versionAsWritten({ kind: "basis-version", name: " n1 ", description: 'says "so"\nand more ', claim: "  ",
    relationship: "AND", derived_from: "", run: "RUN-1", author: "class:ai", at: T,
    grounds: [{ ground: "main", statement: "x" }, { ground: "  " }],
    legs: [{ target: DOC, ground: "main", note: "n\\b", extent_capture: "e".repeat(64) }, { target: DOC2 }] });
  assert.deepEqual(w.version, { name: "n1", kind: "basis-version", description: "says 'so' and more", claim: null,
    relationship: "and", derived_from: null, run: "RUN-1", author: "class:ai", at: T, level: null, observed_at: null });
  assert.deepEqual(w.grounds, [{ ground: "main", asserted_by: SUFFICIENCY_UNCLAIMED, at: T, statement: "x" }],
    "a machine's stamp never stands as the asserter; a blank ground is dropped");
  assert.deepEqual(w.legs, [
    { target: DOC, role: "supports", ground: "main", grade: null, grade_axis: null, grade_source: null, note: "n'b", date: null,
      extent_kind: "document", extent_capture: "e".repeat(64) },
    { target: DOC2, role: "supports", ground: null, grade: null, grade_axis: null, grade_source: null, note: null, date: null,
      extent_kind: "document" }]);
  assert.deepEqual(versionAsWritten(w.version.name ? { ...w.version, grounds: [], legs: [] } : {}).version, w.version,
    "idempotent: the written form writes as itself");
});

test("R35: every check this module mints is a catalogue row with its C-number and a translation — C-25.1–C-25.34, C-27.15, C-50.1–C-50.11, C-33.1, C-33.2, C-33.33–C-33.37, C-32.2", () => {
  const nums = (m) => Object.values(m).map((r) => r.check);
  const want25 = Array.from({ length: 34 }, (_, i) => `C-25.${i + 1}`);
  assert.deepEqual([...new Set([...nums(BASIS_VERSION_CHECKS), ...nums(VERSION_ACT_CHECKS)])].sort(), [...want25].sort());
  assert.deepEqual(nums(NARROW_CHECKS).sort(), Array.from({ length: 11 }, (_, i) => `C-50.${i + 1}`).sort());
  const act = Object.values(ACT_SHAPE_CHECKS).map((r) => r.check);
  for (const c of ["C-33.1", "C-33.2", "C-33.33", "C-33.34", "C-33.35", "C-33.36", "C-33.37"]) assert.ok(act.includes(c), c);
  assert.equal(MACHINE_FENCE_CHECKS.MACHINE_CANNOT_CONCLUDE.check, "C-32.2");
  for (const m of [BASIS_VERSION_CHECKS, VERSION_ACT_CHECKS, NARROW_CHECKS])
    for (const [k, r] of Object.entries(m)) assert.ok(typeof r.translation === "string" && r.translation.length > 20, k);
});

test("R36: no place is named in the translations this module's refusals carry", () => {
  const rows = JSON.stringify([BASIS_VERSION_CHECKS, VERSION_ACT_CHECKS, NARROW_CHECKS]);
  for (const place of ["Oakland", "Alameda", "California"]) assert.equal(rows.includes(place), false, place);
});
