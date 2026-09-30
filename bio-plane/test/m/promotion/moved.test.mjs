/* What moved to promotion from the catalogue in T18 (K636; plan layer 2, promotion): the C-86 and C-97 row families,
 * `withProducingGroup`, `projectNameKey` with C-77's `checkProjectNameUniqueness`, and a copy of
 * `MECHANICAL_FIELD_SETS`. Each is tested here at this module's interface, under the requirement it serves. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as P from "../../../src/promotion/index.mjs";
import * as C from "../../../checks/bio-checks.mjs";
import { makePromotion, doc, infoDoc, create, T0 } from "./fixtures.mjs";

const { projectNameKey, checkProjectNameUniqueness, withProducingGroup, MECHANICAL_FIELD_SETS,
        PROMOTED_TYPE_CHECKS, PROJECT_CREATION_VISIBILITY_CHECKS } = P;
const ID = "INFO-2026-0001";
const bundle = (text, folderName) => ({ folderName, files: new Map(text === undefined ? [] : [["bundle.md", text]]) });
const project = (id, title, state = "forming") => bundle(doc({ id, object_type: "project", title, current_state: state,
  created: T0, last_updated: T0 }), id);

test("R9, R10, R19: the C-86 and C-97 families are promotion's own tables, held once: the catalogue no longer holds them, and each refusal carries its row", () => {
  assert.deepEqual(Object.keys(PROMOTED_TYPE_CHECKS),
                   ["ENVELOPE_TYPE_DISAGREES", "REVISION_RETYPES_BUNDLE", "ENVELOPE_TITLE_DISAGREES", "ENVELOPE_STATE_DISAGREES"]);
  assert.deepEqual(Object.values(PROMOTED_TYPE_CHECKS).map((r) => r.check), ["C-86.1", "C-86.2", "C-86.3", "C-86.4"]);
  assert.deepEqual(Object.keys(PROJECT_CREATION_VISIBILITY_CHECKS), ["PROJECT_VISIBILITY_NO_OWNER", "PROJECT_VISIBILITY_NOT_A_CREATION"]);
  assert.deepEqual(Object.values(PROJECT_CREATION_VISIBILITY_CHECKS).map((r) => r.check), ["C-97.1", "C-97.2"]);
  for (const [code, row] of [...Object.entries(PROMOTED_TYPE_CHECKS), ...Object.entries(PROJECT_CREATION_VISIBILITY_CHECKS)]) {
    assert.match(row.where, /^src\/promotion\/index\.mjs #promote > is-[a-z-]+$/, code);
    assert.ok(typeof row.translation === "string" && row.translation.length > 40, code);
  }
  /* Held once: no catalogue export carries either family, or any of their codes. */
  assert.equal("PROMOTED_TYPE_CHECKS" in C, false);
  assert.equal("PROJECT_CREATION_VISIBILITY_CHECKS" in C, false);
  const codes = new Set([...Object.keys(PROMOTED_TYPE_CHECKS), ...Object.keys(PROJECT_CREATION_VISIBILITY_CHECKS)]);
  for (const [family, table] of Object.entries(C))
    if (table && typeof table === "object" && !Array.isArray(table))
      for (const code of Object.keys(table)) assert.equal(codes.has(code), false, `${family}.${code}`);
  /* Each code promote answers carries its row, whole. */
  const { p } = makePromotion();
  const held = p.promote(create(ID, infoDoc(ID)));
  const got = {
    ENVELOPE_TYPE_DISAGREES: p.promote(create("INFO-2026-0002", infoDoc("INFO-2026-0002"), { meta: { object_type: "action" } })),
    REVISION_RETYPES_BUNDLE: p.promote({ ...create(ID, infoDoc(ID, { object_type: "bias" })), base: held.bundleSha, snapKey: "k2" }),
    ENVELOPE_TITLE_DISAGREES: p.promote(create("INFO-2026-0002", infoDoc("INFO-2026-0002"), { meta: { title: "Other" } })),
    ENVELOPE_STATE_DISAGREES: p.promote(create("INFO-2026-0002", infoDoc("INFO-2026-0002"), { meta: { current_state: "verified" } })),
    PROJECT_VISIBILITY_NO_OWNER: p.promote({ base: null, snapKey: "p", author: "token:ai", visibility: "discoverable", meta: {},
      files: [{ path: "bundle.md", text: doc({ object_type: "project", title: "P", current_state: "forming", created: T0, last_updated: T0 }) }] }),
    PROJECT_VISIBILITY_NOT_A_CREATION: p.promote({ ...create("INFO-2026-0002", infoDoc("INFO-2026-0002")), visibility: "hidden" }),
  };
  for (const [code, r] of Object.entries(got)) {
    const row = PROMOTED_TYPE_CHECKS[code] || PROJECT_CREATION_VISIBILITY_CHECKS[code];
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, code, code, row.check, row.translation], code);
  }
});

test("R13: withProducingGroup is the one writing of the producing group: a creation's bytes are exactly its output", () => {
  const cases = [
    ["replaces the top-level group line", doc({ id: ID, title: "T", group: "someone-else" }), "harbor-group",
     doc({ id: ID, title: "T", group: "harbor-group" })],
    ["opens one before the closing fence", doc({ id: ID, title: "T" }), "harbor-group", doc({ id: ID, title: "T", group: "harbor-group" })],
    ["leaves a document naming the slug, in any spelling the parser reads as it, unchanged",
     '---\nid: x\ngroup: "harbor-group"\n---\n', "harbor-group", '---\nid: x\ngroup: "harbor-group"\n---\n'],
    ["leaves text with no front matter unchanged", "no front matter", "harbor-group", "no front matter"],
    ["leaves an unclosed block unchanged", "---\nid: x\n", "harbor-group", "---\nid: x\n"],
  ];
  for (const [what, text, slug, want] of cases) assert.equal(withProducingGroup(text, slug), want, what);
  /* A nested `group:` is not the top-level one: the top-level line is opened, the nested one kept. */
  const nested = "---\nid: x\nmeta:\n  group: inner\n---\nbody";
  assert.equal(withProducingGroup(nested, "g"), "---\nid: x\nmeta:\n  group: inner\ngroup: g\n---\nbody");
  /* No slug, or a non-string: nothing to write. */
  for (const slug of ["", null, undefined, 7]) assert.equal(withProducingGroup(doc({ id: ID }), slug), doc({ id: ID }));
  assert.equal(withProducingGroup(null, "g"), null);
  /* The write path writes exactly this: the held bytes are the function's output over the sent document. */
  const env = makePromotion({ group: "harbor-group" });
  const sent = infoDoc(ID, { group: "someone-else" });
  assert.equal(env.p.promote(create(ID, sent)).ok, true);
  assert.equal(env.record.readFile(ID, "bundle.md").text, withProducingGroup(sent, "harbor-group"));
  /* The catalogue no longer holds a second writing. */
  assert.equal("withProducingGroup" in C, false);
});

test("R19, R38: projectNameKey is the one name key, for promote's and forkProject's NAME_TAKEN alike", () => {
  const pairs = [["Sewer Fund", "  sewer   FUND "], ["Sewer Fund", "SEWER\tfund"], ["A  B", "a b"]];
  for (const [a, b] of pairs) assert.equal(projectNameKey(a), projectNameKey(b));
  assert.equal(projectNameKey("  Sewer   Fund "), "sewer fund");
  for (const v of [null, undefined, "", "   "]) assert.equal(projectNameKey(v), "");
  assert.notEqual(projectNameKey("Sewer-Fund"), projectNameKey("Sewer Fund"));
  /* The door asks this key: a title colliding by it is NAME_TAKEN, one differing by it is not. */
  const { p, membership } = makePromotion();
  const mk = (title, snapKey) => ({ base: null, snapKey, author: "member:ann", ownerMemberId: "ann", meta: {},
    files: [{ path: "bundle.md", text: doc({ object_type: "project", title, current_state: "forming", created: T0, last_updated: T0 }) }] });
  const first = p.promote(mk("Sewer Fund", "a"));
  assert.equal(first.ok, true);
  for (const [t, taken] of [["sewer  fund", true], [" SEWER FUND ", true], ["Sewer-Fund", false], ["Sewer Funds", false]])
    assert.equal(p.promote(mk(t, t)).reason === "NAME_TAKEN", taken, t);
  membership.joined.set(first.bundleId, ["bob"]);
  assert.equal(p.forkProject({ projectId: first.bundleId, title: "SEWER   fund", by: "bob" }).reason, "NAME_TAKEN");
  assert.equal("projectNameKey" in C, false);
});

test("R38 (C-77): checkProjectNameUniqueness judges a handed corpus by the same key: every colliding pair, every state, projects only, and what it could not judge", () => {
  const corpus = [
    project("PROJ-2026-0001-a", "Sewer Fund"),
    project("PROJ-2026-0002-b", "  sewer   FUND ", "closed"),        // deactivated: still collides
    project("PROJ-2026-0003-c", "SEWER FUND", "investigating"),
    project("PROJ-2026-0004-d", "Other"),
    bundle(infoDoc(ID, { title: "Sewer Fund" }), ID),                    // not a project: never compared
    bundle(undefined, "NOBUNDLE"),                                       // no bundle.md: undetermined
    bundle("no front matter", "UNREADABLE"),                             // unreadable: undetermined
    bundle(doc({ id: "PROJ-2026-0005-e", object_type: "project", current_state: "forming" }), "PROJ-2026-0005-e"),
  ];
  const r = checkProjectNameUniqueness(corpus);
  assert.equal(r.pass, false);
  assert.deepEqual([r.projects, r.judged], [5, 4]);
  const errors = r.findings.filter((x) => x.severity === "error");
  assert.deepEqual(errors.map((x) => x.check), ["C-77.1", "C-77.1", "C-77.1"], "three projects on one key are three pairs");
  const pairs = errors.map((x) => (x.message.match(/PROJ-2026-000\d-[a-z]/g) || []).join(" "));
  assert.deepEqual(pairs, ["PROJ-2026-0001-a PROJ-2026-0002-b", "PROJ-2026-0001-a PROJ-2026-0003-c", "PROJ-2026-0002-b PROJ-2026-0003-c"]);
  assert.match(errors[0].message, /\[closed\]/);
  for (const e of errors) assert.ok(Array.isArray(e.repairs) && e.repairs.length && e.repairable === true);
  const warnings = r.findings.filter((x) => x.severity === "warning");
  assert.deepEqual(warnings.map((x) => x.check), ["C-77.2", "C-77.2", "C-77.2"]);
  assert.match(warnings[0].message, /^NOBUNDLE: bundle\.md is absent/);
  assert.match(warnings[1].message, /^UNREADABLE: bundle\.md is unreadable/);
  assert.match(warnings[2].message, /^PROJ-2026-0005-e: a project with no title/);
  assert.equal(r.findings.some((x) => x.message.includes(ID)), false, "a non-project is never compared");
  /* A corpus with no collision passes, with its undetermined bundles still said. */
  const clean = checkProjectNameUniqueness([project("PROJ-2026-0001-a", "A"), project("PROJ-2026-0002-b", "B"), bundle(undefined, "X")]);
  assert.deepEqual([clean.pass, clean.projects, clean.judged, clean.findings.map((x) => x.check)], [true, 2, 2, ["C-77.2"]]);
  for (const none of [[], null, undefined]) assert.deepEqual(checkProjectNameUniqueness(none), { pass: true, findings: [], projects: 0, judged: 0 });
  /* Bytes are read as UTF-8 when a file is held as bytes. */
  const bytes = { folderName: "PROJ-2026-0009-z", files: new Map([["bundle.md", new TextEncoder().encode(project("PROJ-2026-0009-z", "Sewer Fund").files.get("bundle.md"))]]) };
  assert.equal(checkProjectNameUniqueness([project("PROJ-2026-0001-a", "sewer fund"), bytes]).pass, false);
  /* The corpus check and the door share the one key: a pair collides in the corpus exactly when the door refuses it. */
  for (const [a, b] of [["Sewer Fund", "sewer  fund"], ["Sewer Fund", "Sewer-Fund"]]) {
    const corpusSays = !checkProjectNameUniqueness([project("PROJ-2026-0001-a", a), project("PROJ-2026-0002-b", b)]).pass;
    assert.equal(corpusSays, projectNameKey(a) === projectNameKey(b), `${a} / ${b}`);
  }
  assert.equal("checkProjectNameUniqueness" in C, false);
});

test("R8: MECHANICAL_FIELD_SETS is promotion's frozen registry of declared operations; UNDECLARED_OPERATION names exactly its operations", () => {
  assert.deepEqual(Object.keys(MECHANICAL_FIELD_SETS), ["monitor-tick", "sweep", "deadline-recheck", "member-attest"]);
  assert.ok(Object.isFrozen(MECHANICAL_FIELD_SETS));
  for (const set of Object.values(MECHANICAL_FIELD_SETS)) assert.ok(Object.isFrozen(set));
  /* Every mutating set carries last_updated (write-completeness); sweep changes nothing. */
  for (const [op, set] of Object.entries(MECHANICAL_FIELD_SETS))
    assert.equal(set.includes("last_updated"), op !== "sweep", op);
  /* The catalogue's copy, held until T19 deletes it, is equal field for field (K636). */
  assert.deepEqual(JSON.parse(JSON.stringify(MECHANICAL_FIELD_SETS)), C.MECHANICAL_FIELD_SETS);
  const { p } = makePromotion();
  for (const op of Object.keys(MECHANICAL_FIELD_SETS)) {
    const id = `INFO-2026-00${Object.keys(MECHANICAL_FIELD_SETS).indexOf(op) + 10}`;
    assert.equal(p.promote({ ...create(id, infoDoc(id)), writer: "mechanical", operation: op }).ok, true, op);
  }
  for (const op of ["invent", "toString", "__proto__", "", null]) {
    const r = p.promote({ ...create("INFO-2026-0099", infoDoc("INFO-2026-0099")), writer: "mechanical", operation: op });
    assert.equal(r.reason, "UNDECLARED_OPERATION", String(op));
    assert.equal(r.detail, `a mechanical promotion names one of: ${Object.keys(MECHANICAL_FIELD_SETS).join(", ")}`);
  }
});
