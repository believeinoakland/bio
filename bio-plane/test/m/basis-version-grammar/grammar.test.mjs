/* basis-version-grammar: the grammar (R1–R5, R7), the rows it carries (R8) and no place in its text (R9). Each test drives
   the module at its interface over frontmatter objects; a sentence people read is compared with `localize` by equality,
   never held (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { basisVersionFindings, versionsIn, VERSION_MACHINE, versionNeedsReason, VERSION_REASON_REQUIRED, VERSION_NAME_RE,
         VERSION_STATES, VERSION_RELATIONSHIPS, BASIS_VERSION_GRAMMAR_CHECKS, SUGGEST_KINDS, compositionDiff, sameComposition,
         versionAsWritten, fmSafe, VERSION_KIND_CHECKS, SUFFICIENCY_UNCLAIMED, SUFFICIENCY_CLAIM_STATES }
  from "../../../src/basis-version-grammar/index.mjs";
import { localize, word } from "../../../src/setup-words/index.mjs";
import { T, DOC, DOC2, Q, Q2, fm, codes, findingsOf } from "./helper.mjs";

test("R1, R7: a version carries a description, a unique permitted name (a name outside the form is VERSION_NAME_MALFORMED, a repeated one VERSION_NAME_NOT_UNIQUE), a known state, a boolean hidden, a known kind when present, and once moved a named member and an ISO instant", () => {
  assert.deepEqual(codes(fm()), [], "a well-formed version passes");
  assert.deepEqual(codes(fm({ v: { description: "" } })), ["VERSION_NO_DESCRIPTION"]);
  assert.deepEqual(codes(fm({ v: { description: "too short" } })), ["VERSION_NO_DESCRIPTION"]);
  assert.deepEqual(codes(fm({ v: { description: "  twelve char  " } })), ["VERSION_NO_DESCRIPTION"], "trimmed first: eleven characters");
  assert.deepEqual(codes(fm({ v: { description: "exactly twelv" } })), [], "twelve characters pass");
  for (const bad of ["", "x".repeat(65), "no/slash", "-dash-first"])
    assert.deepEqual(codes(fm({ v: { name: bad }, legs: [], grounds: [] })).filter((c) => c.startsWith("VERSION_NAME")),
      ["VERSION_NAME_MALFORMED"], `name '${bad}' is refused as malformed, never as a duplicate`);
  for (const bad of [undefined, null, 7, ["a"]])
    assert.deepEqual(codes(fm({ v: { name: bad }, legs: [], grounds: [] })).filter((c) => c.startsWith("VERSION_NAME")),
      ["VERSION_NAME_MALFORMED"], `a name of ${JSON.stringify(bad)} is outside the form`);
  assert.deepEqual(codes(fm({ v: { name: "a".repeat(64) } })), [], "a valid unique name raises neither");
  assert.deepEqual(codes(fm({ v: { name: "  padded  " }, legs: [], grounds: [] })), [], "the name is trimmed first");
  assert.ok(VERSION_NAME_RE.test("a".repeat(64)) && !VERSION_NAME_RE.test("a".repeat(65)), "1–64 characters");
  const dup = fm({ more: [{ name: "first", description: "another reading entirely", relationship: "and", state: "suggested" }] });
  assert.deepEqual(codes(dup).filter((c) => c.startsWith("VERSION_NAME")), ["VERSION_NAME_NOT_UNIQUE"],
    "a name is unique within its inquiry, and a duplicate is not malformed");
  assert.deepEqual(codes(fm({ v: { state: "published" } })), ["VERSION_STATE_UNKNOWN"]);
  assert.deepEqual(codes(fm({ v: { hidden: "yes" } })), ["VERSION_HIDDEN_NOT_BOOLEAN"]);
  for (const ok of [true, false, null, undefined]) assert.deepEqual(codes(fm({ v: { hidden: ok } })), [], `hidden ${ok} is legal`);
  assert.deepEqual(codes(fm({ v: { kind: "hunch" } })), ["VERSION_KIND_UNKNOWN"]);
  for (const k of [...Object.keys(SUGGEST_KINDS), undefined, null, ""]) assert.deepEqual(codes(fm({ v: { kind: k } })), [], `kind ${k} is legal`);
  assert.equal(VERSION_KIND_CHECKS.VERSION_KIND_UNKNOWN.check, "C-27.15");
  assert.equal(findingsOf(fm({ v: { kind: "hunch" } }))[0].check, "C-27.15");
  /* moved into a state that needs a reason: a named member, a reason and an ISO instant */
  assert.deepEqual(codes(fm({ v: { state: "rejected", state_by: "member:bo", state_at: T, state_reason: "does not hold up" } })), []);
  assert.ok(codes(fm({ v: { state: "rejected", state_by: "class:ai", state_at: T, state_reason: "does not hold up" } }))
    .includes("VERSION_DISPOSITION_UNATTRIBUTED"), "a machine never settles one");
  assert.ok(codes(fm({ v: { state: "rejected", state_by: "member:bo", state_at: T, state_reason: "short" } }))
    .includes("VERSION_DISPOSITION_UNATTRIBUTED"), "the reason is at least 8 characters");
  assert.ok(codes(fm({ v: { state: "considering", state_by: "member:bo", state_at: "yesterday", state_reason: "need more" } }))
    .includes("VERSION_DISPOSITION_UNATTRIBUTED"), "the instant is ISO");
  assert.deepEqual(codes(fm({ v: { state: "accepted" } })), [], "a state that needs no reason needs none");
  assert.equal(BASIS_VERSION_GRAMMAR_CHECKS.VERSION_DISPOSITION_UNATTRIBUTED.check, "C-25.19");
  /* absent or non-array blocks, and the shape of a pushed finding */
  assert.deepEqual(findingsOf(null), [], "a missing fm adds nothing");
  assert.deepEqual(findingsOf("text"), [], "a non-object fm adds nothing");
  assert.deepEqual(codes({ id: Q, basis_versions: "x" }), ["VERSION_ORPHAN_ROW"]);
  const f = findingsOf(fm({ v: { description: "" } }))[0];
  assert.deepEqual([f.check, f.severity, f.code], ["C-25.1", "error", "VERSION_NO_DESCRIPTION"]);
  assert.equal(f.repairable, true);
  assert.ok(Array.isArray(f.repairs) && f.repairs.length > 0);
  const m = findingsOf(fm({ v: { name: "x".repeat(65) } }))[0];
  assert.equal(m.check, BASIS_VERSION_GRAMMAR_CHECKS.VERSION_NAME_MALFORMED.check);
  assert.equal(m.message, localize("basis-versions.grammar.basis_versions_i_name_string",
    "basis_versions[{i}].name '{String}' is not a version name: 1 to 64 characters of letters, digits, spaces, '-', '_' and '.', naming this account of the evidence so a member can ask for it by name",
    { i: "0", String: "x".repeat(60) }), "the message is localised, not held");
});

test("R2: derived_from names a version of the same inquiry and derivations form a tree; every leg and ground row names a version that exists", () => {
  assert.deepEqual(codes(fm({ v: { derived_from: "nowhere" } })), ["VERSION_DERIVED_FROM_UNKNOWN"]);
  for (const root of [undefined, null, "", "null"]) assert.deepEqual(codes(fm({ v: { derived_from: root } })), [], `${root} is a root`);
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
  assert.deepEqual(codes({ basis_version_legs: [{ version: "x", target: DOC, role: "supports" }] }), ["VERSION_ORPHAN_ROW"],
    "legs with no version block at all are orphans");
  assert.deepEqual(codes({ basis_version_grounds: [{ version: "x", ground: "g" }] }), ["VERSION_ORPHAN_ROW"],
    "so are grounds with no version block");
  assert.deepEqual(codes({ id: Q, basis_versions: ["not an object", ["array"]] }), ["VERSION_ORPHAN_ROW", "VERSION_ORPHAN_ROW"],
    "a row that is not an object");
  const tree = { id: Q, basis_versions: [
    { name: "a", description: "reading number a", relationship: "and", state: "suggested" },
    { name: "b", description: "reading number b", relationship: "and", state: "suggested", derived_from: "a" }] };
  assert.deepEqual(codes(tree), [], "a derivation onto a held version is legal");
  assert.deepEqual(codes({ id: Q }), [], "no version block at all is legal");
});

test("R3: each version's legs obey the leg grammar (lead and theme first), the target and vocabularies, and its grounds and relationship obey DEC-32 per version", () => {
  assert.deepEqual(codes(fm({ legs: [{ version: "first", target: Q, role: "supports", ground: "main" }] })), ["VERSION_LEG_SELF"],
    "a leg naming this inquiry");
  assert.ok(codes(fm({ legs: [{ version: "first", target: "PROJ-2026-0001-p", role: "supports", ground: "main" }] }))
    .includes("VERSION_LEG_NOT_CITABLE"), "a project is not citable");
  /* N458: the finding a member reads says "record", never "bundle" */
  const notId = findingsOf(fm({ legs: [{ version: "first", target: "not-an-id", role: "supports", ground: "main" }] }));
  assert.deepEqual(notId.filter((y) => y.code === "VERSION_LEG_NOT_CITABLE").map((y) => y.message),
    [localize("basis-versions.grammar.basis_version_legs_li_version",
      "basis_version_legs[{li}] (version '{name}').target '{String}' is not a canonical record id",
      { li: "0", name: "first", String: "not-an-id" })]);
  assert.deepEqual(codes(fm({ legs: [{ version: "first", target: Q2, role: "supports", ground: "main" }] })), [],
    "another inquiry is");
  for (const [k, bad] of [["role", "maybe"], ["grade", "E"], ["grade_axis", "vibes"], ["grade_source", "rumour"]])
    assert.ok(codes(fm({ legs: [{ version: "first", target: DOC, role: "supports", ground: "main", [k]: bad }] }))
      .includes("VERSION_LEG_NOT_CITABLE"), `${k} vocabulary`);
  assert.ok(codes(fm({ legs: [{ version: "first", target: DOC, role: "supports", ground: "main", extent_kind: "dom" }] }))
    .includes("CONTENT_EXTENT_NO_PRODUCER"), "the extent grammar at the version's grain (C-25.10)");
  const extent = findingsOf(fm({ legs: [{ version: "first", target: DOC, role: "supports", ground: "main", extent_kind: "dom" }] }))
    .find((y) => y.code === "CONTENT_EXTENT_NO_PRODUCER");
  assert.equal(extent.check, BASIS_VERSION_GRAMMAR_CHECKS.VERSION_LEG_NOT_CITABLE.check, "handed the C-number of VERSION_LEG_NOT_CITABLE");
  const lead = codes(fm({ legs: [{ version: "first", target: "LEAD-2026-0001-x", role: "supports", ground: "main" }] }));
  const theme = codes(fm({ legs: [{ version: "first", target: DOC, role: "supports", ground: "main", theme: "THEME-2026-0101-ab" }] }));
  assert.equal(lead[0], "LEAD_NOT_EVIDENCE", "a lead is refused by name first (C-54.1)");
  assert.equal(theme[0], "THEME_NOT_EVIDENCE", "a theme is refused by name first");
  /* grounds */
  assert.deepEqual(codes(fm({ legs: [] , grounds: [] })), [], "a version with no legs is legal");
  assert.deepEqual(codes(fm({ legs: [{ version: "first", target: DOC, role: "supports", ground: "main" },
                                     { version: "first", target: DOC2, role: "supports" }] })), [],
    "an unlabelled supporting leg beside a labelled ground is a necessary leg (R3, fix round 10, cause 30b)");
  assert.deepEqual(codes(fm({ legs: [{ version: "first", target: DOC, role: "supports" }], grounds: [] })), [],
    "a version with no ground at all is clean");
  assert.ok(codes(fm({ legs: [{ version: "first", target: DOC, role: "supports", ground: "no/good" }] })).includes("VERSION_GROUND_UNASSERTED"),
    "a leg's ground label outside the form");
  assert.ok(codes(fm({ legs: [{ version: "first", target: DOC, role: "supports", ground: "other" }] })).includes("VERSION_GROUND_UNASSERTED"),
    "a leg naming a ground no row declares");
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
  assert.deepEqual(VERSION_RELATIONSHIPS, ["and", "or"]);
  assert.deepEqual(codes(fm({ v: { relationship: "AND" } })), [], "case-folded");
  assert.deepEqual(codes(fm({ v: { relationship: "or" } })), ["VERSION_RELATIONSHIP_DISAGREES"], "one ground composes as and");
  const two = fm({ v: { relationship: "or" },
    grounds: [{ version: "first", ground: "a", asserted_by: "member:alice", at: T }, { version: "first", ground: "b", asserted_by: "member:alice", at: T }],
    legs: [{ version: "first", target: DOC, role: "supports", ground: "a" }, { version: "first", target: DOC2, role: "supports", ground: "b" }] });
  assert.deepEqual(codes(two), []);
  assert.deepEqual(codes({ ...two, basis_versions: [{ ...two.basis_versions[0], relationship: "and" }] }), ["VERSION_RELATIONSHIP_DISAGREES"],
    "two grounds compose as or");
  /* a derived version regrouping its parent's partition carries an attributed regroup */
  const parent = two.basis_versions[0];
  const regroup = { id: Q, basis_versions: [parent, { name: "second", description: "one part now, not two", relationship: "and",
    state: "suggested", derived_from: "first" }],
    basis_version_grounds: [...two.basis_version_grounds, { version: "second", ground: "all", asserted_by: "member:alice", at: T }],
    basis_version_legs: [...two.basis_version_legs, { version: "second", target: DOC, role: "supports", ground: "all" }] };
  assert.ok(codes(regroup).includes("VERSION_REGROUP_UNATTRIBUTED"));
  regroup.basis_versions[1] = { ...regroup.basis_versions[1], regroup_by: "member:bo", regroup_at: T, regroup_note: "merged the two parts" };
  assert.deepEqual(codes(regroup), []);
  regroup.basis_versions[1] = { ...regroup.basis_versions[1], regroup_by: "class:ai" };
  assert.ok(codes(regroup).includes("VERSION_REGROUP_UNATTRIBUTED"), "never a machine's");
});

test("R4: the machine's edges, exactly, and which moves need a reason", () => {
  assert.deepEqual(VERSION_STATES, ["suggested", "considering", "accepted", "rejected"]);
  assert.deepEqual(VERSION_MACHINE.legal, VERSION_STATES);
  assert.deepEqual(VERSION_MACHINE.edges, {
    suggested: ["considering", "accepted", "rejected"],
    considering: ["suggested", "accepted", "rejected"],
    accepted: ["considering", "rejected"],
    rejected: ["suggested", "considering", "accepted"],
  });
  assert.deepEqual(VERSION_REASON_REQUIRED, ["considering", "rejected"]);
  assert.deepEqual(VERSION_STATES.filter(versionNeedsReason), ["considering", "rejected"]);
  for (const x of [null, undefined, "", "published", 7]) assert.equal(versionNeedsReason(x), false, String(x));
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
  assert.deepEqual(v.legs.map((l) => l.src_ord), [0, 1], "each leg answers its index in the document's basis_version_legs[]");
  assert.deepEqual(v.grounds, [{ ground: "main", asserted_by: "member:alice", at: T, statement: null }]);
  /* what happened TO a version is outside its composition */
  const moved = versionsIn(fm({ v: { state: "rejected", state_by: "member:bo", state_at: T, state_reason: "no", hidden: true,
                                     author: "member:x", at: T, run: "RUN-1" } }))[0];
  assert.equal(moved.composition, versionsIn(fm())[0].composition);
  assert.deepEqual([moved.state, moved.hidden, moved.state_by, moved.run], ["rejected", 1, "member:bo", "RUN-1"]);
  /* kind is inside, and only when present */
  assert.ok(versionsIn(fm({ v: { kind: "basis-version" } }))[0].composition.includes("\nkind\tbasis-version\n"));
  assert.ok(!versionsIn(fm())[0].composition.includes("kind\t"));
  /* grounds sorted, legs not */
  const g2 = fm({ v: { relationship: "or" },
    grounds: [{ version: "first", ground: "z", asserted_by: "member:a", at: T }, { version: "first", ground: "a", asserted_by: "member:a", at: T }],
    legs: [{ version: "first", target: DOC2, role: "supports", ground: "z" }, { version: "first", target: DOC, role: "supports", ground: "a" }] });
  const comp = versionsIn(g2)[0].composition.split("\n");
  assert.deepEqual(comp.filter((l) => l.startsWith("ground")).map((l) => l.split("\t")[1]), ["a", "z"]);
  assert.deepEqual(comp.filter((l) => l.startsWith("leg\t")).map((l) => l.split("\t")[2]), [DOC2, DOC]);
  /* a row that is not an object, or has no name, is skipped; two versions answer in document order */
  assert.deepEqual(versionsIn({ basis_versions: ["x", { description: "no name" }, { name: "b" }, { name: "a" }] }).map((y) => y.name), ["b", "a"]);
  assert.deepEqual(versionsIn(null), []);
  /* K182: a pinned capture is inside the composition, after the referents */
  const pinned = versionsIn(fm({ legs: [{ version: "first", target: DOC, role: "supports", ground: "main", extent_capture: "c".repeat(64) }] }))[0];
  assert.equal(pinned.composition.split("\n").at(-1), `leg_capture\t0\t${"c".repeat(64)}`);
  assert.equal(sameComposition(versionsIn(fm())[0].composition, pinned.composition), true,
    "a composition stored before the line existed is compared without it");
  assert.equal(sameComposition(pinned.composition, pinned.composition.replace(/c{64}/, "d".repeat(64))), false,
    "once stored with the line, the pin is frozen");
  assert.equal(sameComposition("a\nb", "a\nb"), true);
  assert.equal(sameComposition("a\nb", "a\nc"), false);
  assert.equal(compositionDiff("name\ta\nleg\t0", "name\ta\nleg\t1"), "leg changed");
  assert.equal(compositionDiff("name\ta", "name\ta\nkind\tx"), word("basis-versions.text.added", { field: "kind" }));
  assert.equal(compositionDiff("name\ta\nkind\tx", "name\ta"), word("basis-versions.text.removed", { field: "kind" }));
  assert.equal(compositionDiff("name\ta", "name\ta"), "nothing changed");
  assert.equal(fmSafe('a "q" \\ b\r\nc  '), "a 'q' ' b c");
  assert.equal(fmSafe(fmSafe('a "q"\n')), fmSafe('a "q"\n'), "idempotent");
  assert.equal(fmSafe(null), "");
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
  assert.deepEqual(versionAsWritten({ ...w.version, grounds: [], legs: [] }).version, w.version,
    "idempotent: the written form writes as itself");
  const member = versionAsWritten({ name: "m", author: "member:alice", at: T, grounds: [{ ground: "g" }] });
  assert.equal(member.grounds[0].asserted_by, "member:alice", "a member's own ground is asserted by them");
  assert.deepEqual(versionAsWritten().legs, [], "no submission is an empty one");
  assert.throws(() => versionAsWritten(null), TypeError, "the stated precondition: a null submission throws");
  assert.throws(() => versionAsWritten({ grounds: "x" }), "a non-array grounds throws");
});

/* the documents that raise each code the grammar mints, one each */
const RAISING = {
  VERSION_NO_DESCRIPTION: fm({ v: { description: "" } }),
  VERSION_NAME_NOT_UNIQUE: fm({ more: [{ name: "first", description: "another reading entirely", relationship: "and", state: "suggested" }] }),
  VERSION_NAME_MALFORMED: fm({ v: { name: "x".repeat(65) }, legs: [], grounds: [] }),
  VERSION_NO_RELATIONSHIP: fm({ v: { relationship: "xor" } }),
  VERSION_RELATIONSHIP_DISAGREES: fm({ v: { relationship: "or" } }),
  VERSION_GROUND_UNASSERTED: fm({ grounds: [{ version: "first", ground: "main", asserted_by: "class:ai", at: T }] }),
  VERSION_DERIVED_FROM_UNKNOWN: fm({ v: { derived_from: "nowhere" } }),
  VERSION_DERIVATION_CYCLE: { id: Q, basis_versions: [
    { name: "a", description: "reading number a", relationship: "and", state: "suggested", derived_from: "b" },
    { name: "b", description: "reading number b", relationship: "and", state: "suggested", derived_from: "a" }] },
  VERSION_REGROUP_UNATTRIBUTED: { id: Q, basis_versions: [
    { name: "p", description: "the parent reading", relationship: "and", state: "suggested" },
    { name: "c", description: "the derived reading", relationship: "and", state: "suggested", derived_from: "p" }],
    basis_version_grounds: [{ version: "c", ground: "g", asserted_by: "member:alice", at: T }],
    basis_version_legs: [{ version: "c", target: DOC, role: "supports", ground: "g" }] },
  VERSION_LEG_NOT_CITABLE: fm({ legs: [{ version: "first", target: "PROJ-2026-0001-p", role: "supports", ground: "main" }] }),
  VERSION_STATE_UNKNOWN: fm({ v: { state: "published" } }),
  VERSION_HIDDEN_NOT_BOOLEAN: fm({ v: { hidden: "yes" } }),
  VERSION_LEG_SELF: fm({ legs: [{ version: "first", target: Q, role: "supports", ground: "main" }] }),
  VERSION_ORPHAN_ROW: fm({ legs: [{ version: "ghost", target: DOC, role: "supports", ground: "main" }] }),
  VERSION_DISPOSITION_UNATTRIBUTED: fm({ v: { state: "rejected" } }),
};
const RETIRED = "VERSION_PARTITION_INCOMPLETE";
const WANT_CHECKS = {
  VERSION_NO_DESCRIPTION: "C-25.1", VERSION_NAME_NOT_UNIQUE: "C-25.2", VERSION_NAME_MALFORMED: "C-25.36",
  VERSION_NO_RELATIONSHIP: "C-25.3", VERSION_RELATIONSHIP_DISAGREES: "C-25.4", VERSION_PARTITION_INCOMPLETE: "C-25.5",
  VERSION_GROUND_UNASSERTED: "C-25.6", VERSION_DERIVED_FROM_UNKNOWN: "C-25.7", VERSION_DERIVATION_CYCLE: "C-25.8",
  VERSION_REGROUP_UNATTRIBUTED: "C-25.9", VERSION_LEG_NOT_CITABLE: "C-25.10", VERSION_STATE_UNKNOWN: "C-25.12",
  VERSION_HIDDEN_NOT_BOOLEAN: "C-25.13", VERSION_LEG_SELF: "C-25.14", VERSION_ORPHAN_ROW: "C-25.15",
  VERSION_DISPOSITION_UNATTRIBUTED: "C-25.19",
};

test("R8: every refusal this module raises is a row with its C-number, a site in this module and a translation by key; every code a document raises has a row and every row a document that raises it", () => {
  assert.deepEqual(Object.fromEntries(Object.entries(BASIS_VERSION_GRAMMAR_CHECKS).map(([k, r]) => [k, r.check])), WANT_CHECKS,
    "the grammar's rows, by code, with their C-numbers (C-25.11, .16–.18, .37–.39 are basis-versions')");
  /* C-25.5 is held but raised by no document since fix round 10, cause 30b (K5077): the partition need not cover the legs */
  assert.deepEqual([...Object.keys(RAISING), RETIRED].sort(), Object.keys(BASIS_VERSION_GRAMMAR_CHECKS).sort(), "a document for every row but the one no document raises");
  assert.deepEqual(Object.fromEntries(Object.entries(VERSION_KIND_CHECKS).map(([k, r]) => [k, r.check])), { VERSION_KIND_UNKNOWN: "C-27.15" });
  for (const [k, r] of [...Object.entries(BASIS_VERSION_GRAMMAR_CHECKS), ...Object.entries(VERSION_KIND_CHECKS)]) {
    assert.deepEqual(Object.keys(r).sort(), ["check", "translation", "where"], k);
    assert.ok(r.where.startsWith("src/basis-version-grammar/grammar.mjs "), `${k}: the site is this module's, not basis-versions'`);
    assert.ok(typeof r.translation === "string" && r.translation.length > 20, k);
  }
  assert.equal(BASIS_VERSION_GRAMMAR_CHECKS.VERSION_NO_DESCRIPTION.translation, word("refusal.VERSION_NO_DESCRIPTION"));
  assert.equal(BASIS_VERSION_GRAMMAR_CHECKS.VERSION_NAME_MALFORMED.translation, word("refusal.VERSION_NAME_MALFORMED"), "R7: by key");
  for (const [code, doc] of Object.entries(RAISING)) {
    const mine = findingsOf(doc).filter((y) => y.code === code);
    assert.ok(mine.length > 0, `${code} is raised by its document`);
    for (const y of mine) assert.deepEqual([y.check, y.severity], [WANT_CHECKS[code], "error"], code);
  }
  const raised = new Set(Object.values(RAISING).flatMap((d) => findingsOf(d).map((y) => y.code).filter((c) => c.startsWith("VERSION_"))));
  for (const c of raised) assert.ok(c in BASIS_VERSION_GRAMMAR_CHECKS || c in VERSION_KIND_CHECKS, `${c} has a row`);
});

test("R9: no place is named in this module's findings, translations, vocabulary sentences or sites", () => {
  const rows = JSON.stringify([BASIS_VERSION_GRAMMAR_CHECKS, VERSION_KIND_CHECKS, SUFFICIENCY_CLAIM_STATES, SUGGEST_KINDS,
    Object.values(RAISING).flatMap((d) => findingsOf(d))]);
  for (const place of ["Oakland", "Alameda", "California"]) assert.equal(rows.includes(place), false, place);
});
