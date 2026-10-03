/* affordances, T31's entries: R36 (every decorated act's advisory `phone` flag, DEC-122 (1)), R37 (`wizard-scripts`' ops
   graded, DEC-120, DEC-121) and R38 (`case-import`'s watch acts graded, DEC-101 (3)), each at the module's exports, and
   R38's `reversible` backed at case-import's own interface over its fixture. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as A from "../../../src/affordances.mjs";
import { caseImportOps } from "../../../src/case-import/index.mjs";
import * as ci from "../case-import/fixture.mjs";

const { ACTS, CAPTURE_ACTS, PER_ITEM_ACTS, NON_ACTS, RUNGS, RUNG_ABSENT, VOCABULARIES, MACHINE_REFUSALS,
        JUSTIFICATION_REFUSALS, LARGER_SCREEN_ACTS, decorate, unaccounted } = A;
const gradeOf = (op) => Object.hasOwn(RUNGS, op) ? ["rung", RUNGS[op]]
  : Object.hasOwn(RUNG_ABSENT, op) ? ["absent", RUNG_ABSENT[op].ground] : null;
const published = () => [...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS];

/* ============================================================ R36: the phone flag */
/* The oracle, from R36's text alone. */
const phoneWant = (op) => {
  const g = gradeOf(op);
  if (g && g[0] === "rung" && ["terminal", "attested", "irreversible"].includes(g[1])) return false;
  if (g && g[0] === "absent" && g[1] === "credential") return false;
  return !LARGER_SCREEN_ACTS.includes(op);
};

test("R36: every op the catalogue grades or names, decorated, carries `phone` exactly as R36 says — false at terminal, "
   + "attested and irreversible, for a credential absence and for LARGER_SCREEN_ACTS, true otherwise — and the table is "
   + "not uniform", () => {
  const ops = [...new Set([...Object.keys(RUNGS), ...Object.keys(RUNG_ABSENT), ...Object.keys(NON_ACTS),
                           ...published().map((a) => a.id)])];
  const wrong = ops.filter((op) => decorate({ id: op, label: "x" }, null).phone !== phoneWant(op));
  assert.deepEqual(wrong, []);
  const seen = new Set(ops.map((op) => decorate({ id: op, label: "x" }, null).phone));
  assert.deepEqual([...seen].sort(), [false, true]);
  /* each arm reached: a heavy rung, a credential absence, the frozen set, and a read, a capture act and an everyday act */
  assert.deepEqual(["publish", "attest", "retire", "memberadd", "filingsent"].map((op) => decorate({ id: op, label: "x" }, null).phone),
    [false, false, false, false, false]);
  assert.deepEqual(["docket", "monitor", "cite", "inboxpull", "queuemute", "filingprepare"].map((op) => decorate({ id: op, label: "x" }, null).phone),
    [true, true, true, true, true, true]);
  /* an op named nowhere is no heavy act: true */
  assert.equal(decorate({ id: "no-such-op", label: "x" }, null).phone, true);
  assert.equal(A.phoneOf("filingsent"), false);
});

test("R36: filingsent is in LARGER_SCREEN_ACTS though its rung is `reasoned`; the set is frozen and holds exactly it, "
   + "published as VOCABULARIES.larger_screen_acts by reference", () => {
  assert.deepEqual([...LARGER_SCREEN_ACTS], ["filingsent"]);
  assert.equal(RUNGS.filingsent, "reasoned");
  assert.ok(Object.isFrozen(LARGER_SCREEN_ACTS));
  assert.equal(VOCABULARIES.larger_screen_acts, LARGER_SCREEN_ACTS);
  assert.equal(A.vocabulariesFor(["x"]).larger_screen_acts, LARGER_SCREEN_ACTS);
  /* a change of the phone set is a change here only: with the set emptied, filingsent's flag would be its rung's (true) */
  assert.equal(phoneWant("filingsent"), false);
  assert.equal(["reasoned"].includes(RUNGS.filingsent) && !["terminal", "attested", "irreversible"].includes(RUNGS.filingsent), true);
});

test("R36 R11 R17: every decorated act, capture act and set act op=affordances composes carries `phone`, a boolean "
   + "equal to R36's rule, catalogue and targeted alike — one shape", () => {
  const gate = { needs: () => "contribute", mode: () => "session" };
  const r = A.affordancesAnswer({ kinds: null, gate });
  for (const a of [...r.catalog, ...r.capture_acts, ...r.set_acts]) {
    assert.equal(typeof a.phone, "boolean", a.id);
    assert.equal(a.phone, phoneWant(a.id), a.id);
  }
  const facts = { ok: true, target: "INQ-1", object_type: "inquiry", declared_type: "inquiry", current_state: "concluded",
    case_member: false, project_owner: true, basis_legs: 1, basis_version_states: ["accepted"], basis_versions: 1,
    actor_is_machine: false, contradiction_inquiry: false };
  const t = A.affordancesAnswer({ target: "INQ-1", facts, kinds: null, gate });
  assert.ok(t.acts.some((a) => a.id === "publish"), "publish is offered, so an irreversible act is measured");
  for (const a of t.acts) assert.equal(a.phone, phoneWant(a.id), a.id);
  assert.equal(t.acts.find((a) => a.id === "publish").phone, false);
  assert.equal(t.acts.find((a) => a.id === "cite").phone, true);
});

/* ============================================================ R37: wizard-scripts' ops */
const R37_GRADES = {
  wizardretire: ["rung", "reasoned"],
  wizarddraft: ["absent", "undetermined"], wizardrevise: ["absent", "undetermined"], wizardpropose: ["absent", "undetermined"],
  wizardsubmit: ["absent", "undetermined"], wizardapprove: ["absent", "undetermined"],
  wizardeditorgrant: ["absent", "credential"], wizardeditorrevoke: ["absent", "credential"],
  wizardprogress: ["absent", "observational"],
};
const R37_READS = ["wizards", "wizardread", "wizardsat", "wizarduse", "wizardcandidates", "wizardcheck"];
const WIZARD_DIRECTED = "wizard-directed: keyed by a script or one of its versions, reached from the library or a screen's "
  + "mark; writes this module's rows and moves no bundle";

test("R37 R2 R3 R7 R12 R19 R27: wizard-scripts' ops — wizardretire `reasoned` with WIZARD_REASON_REFUSED in the family, "
   + "the five drafting acts `undetermined` as the template acts, the editor pair `credential`, wizardprogress "
   + "`observational`, each with R37's NON_ACTS reason, the six reads `read:`, none in MACHINE_REFUSALS — and with the "
   + "control plane's rows nothing is unaccounted; a misgraded op or one left out is seen", () => {
  const grades = Object.fromEntries(Object.keys(R37_GRADES).map((op) => [op, gradeOf(op)]));
  assert.deepEqual(grades, R37_GRADES);
  assert.notDeepEqual({ ...grades, wizardretire: ["absent", "undetermined"] }, R37_GRADES);
  assert.notDeepEqual({ ...grades, wizardprogress: ["absent", "undetermined"] }, R37_GRADES);
  for (const op of ["wizarddraft", "wizardrevise", "wizardpropose", "wizardsubmit", "wizardapprove"])
    assert.equal(RUNG_ABSENT[op].ground, RUNG_ABSENT.templatedraft.ground, op);
  assert.equal(RUNGS.wizardretire, RUNGS.templateretire);
  for (const op of Object.keys(R37_GRADES)) {
    if (Object.hasOwn(RUNG_ABSENT, op)) assert.ok(RUNG_ABSENT[op].is.length > 40, op);
    const d = decorate({ id: op, label: "x" }, null);
    assert.equal((d.rung === null) !== (d.rung_absence === null), true, `R24: ${op}`);
  }
  assert.ok(JUSTIFICATION_REFUSALS.includes("WIZARD_REASON_REFUSED"));
  /* the template library's refusals that ask an object, a choice or a form stay out, and so do the wizard's */
  for (const c of ["WIZARD_NAME_REFUSED", "WIZARD_STEP_REFUSED", "WIZARD_WHY_REFUSED", "WIZARD_SCOPE_REFUSED", "NOT_A_DRAFT",
    "MACHINE_CANNOT_APPROVE_WIZARD", "WIZARD_ALREADY_ENDED"]) assert.ok(!JUSTIFICATION_REFUSALS.includes(c), c);
  /* NON_ACTS: the acts wizard-directed, the tally its own sentence, the reads `read:` writing nothing */
  for (const op of Object.keys(R37_GRADES).filter((op) => op !== "wizardprogress")) assert.equal(NON_ACTS[op], WIZARD_DIRECTED, op);
  assert.equal(NON_ACTS.wizardprogress, "tally: unattributed, keyed by a script's version; names no member");
  for (const op of R37_READS) {
    assert.ok(NON_ACTS[op]?.startsWith("read: ") && NON_ACTS[op].length > 40, op);
    assert.match(NON_ACTS[op], /writes nothing$/, op);
    assert.ok(!Object.hasOwn(RUNGS, op) && !Object.hasOwn(RUNG_ABSENT, op), op);
  }
  const ALL = [...Object.keys(R37_GRADES), ...R37_READS];
  assert.ok(!published().some((a) => ALL.includes(a.id)));
  assert.deepEqual(ALL.filter((op) => Object.hasOwn(MACHINE_REFUSALS, op)), [], "MACHINE_REFUSALS holds only ACTS (R7, R20)");
  for (const op of ALL) assert.ok(!NON_ACTS[op].startsWith("capture-directed:"), op);
  /* the control plane's rows (op-declarations R15): the nine writes mutating, every op gated (the reads with a NEEDS
     row of no capability) */
  const table = [...Object.keys(R37_GRADES).map((op) => ({ op, mutating: true, gated: true })),
    ...R37_READS.map((op) => ({ op, mutating: false, gated: true }))];
  const r = unaccounted(table);
  assert.deepEqual([r.unpublished, r.unranked], [[], []]);
  assert.deepEqual(r.stale.filter((op) => ALL.includes(op)), []);
  assert.deepEqual(ALL.filter((op) => !unaccounted([]).stale.includes(op)), []);
  for (const op of R37_READS) assert.ok(unaccounted([{ op, mutating: false, gated: false }]).stale.includes(op), op);
  const left = unaccounted([...table, { op: "wizardunnamed", mutating: true, gated: true }]);
  assert.deepEqual([left.unpublished, left.unranked], [["wizardunnamed"], ["wizardunnamed"]]);
});

/* ============================================================ R38: case-import's watch acts */
const IMPORT_DIRECTED = "import-directed: keyed by an imported case (an import, an edition, a finding or a flag), reached "
  + "from the imported cases; writes this module's rows and moves no bundle";

test("R38 R2 R7 R12 R27: importwatch and importunwatch are `reversible`, each with R35's import-directed reason, neither "
   + "in MACHINE_REFUSALS, no vocabulary added — case-import's op map holds both — and with the control plane's rows "
   + "nothing is unaccounted; a misgraded one is seen", () => {
  const ops = Object.keys(caseImportOps({}, new URL("http://x/"), {}));
  for (const op of ["importwatch", "importunwatch"]) assert.ok(ops.includes(op), `case-import's op map holds ${op}`);
  const grades = { importwatch: gradeOf("importwatch"), importunwatch: gradeOf("importunwatch") };
  assert.deepEqual(grades, { importwatch: ["rung", "reversible"], importunwatch: ["rung", "reversible"] });
  assert.notDeepEqual({ ...grades, importwatch: ["rung", "reasoned"] }, grades);
  for (const op of ["importwatch", "importunwatch"]) {
    assert.equal(NON_ACTS[op], IMPORT_DIRECTED, op);
    assert.equal(NON_ACTS[op], NON_ACTS.importaccept, "R35's sentence");
    assert.ok(!Object.hasOwn(MACHINE_REFUSALS, op), op);
    assert.ok(!Object.hasOwn(RUNG_ABSENT, op), op);
    assert.ok(!published().some((a) => a.id === op), op);
  }
  assert.deepEqual(Object.keys(VOCABULARIES).filter((k) => /watch|import/.test(k)), []);
  /* op-declarations R16: both mutating and gated */
  const table = ["importwatch", "importunwatch"].map((op) => ({ op, mutating: true, gated: true }));
  const r = unaccounted(table);
  assert.deepEqual([r.unpublished, r.unranked], [[], []]);
  assert.deepEqual(r.stale.filter((op) => op.endsWith("watch")), []);
  assert.deepEqual(["importwatch", "importunwatch"].filter((op) => !unaccounted([]).stale.includes(op)), []);
});

test("R38 R2: importwatch and importunwatch ask no reason — each is accepted with none — and each takes the other back: "
   + "an end leaves no watch in force, a further watch puts one back, and every watch and end stays in the record", async () => {
  const w = ci.seeded();
  const a = await ci.imp(w);
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  const who = { by: ci.V("alice"), viewer: ci.V("alice") };
  const inForce = () => w.ci.watchedImports({}).watches.some((x) => x.import === a.import);
  assert.equal(inForce(), false, "an import is not watched until a member asks");
  const on = w.ci.watchImport({ import: a.import, publisher: "https://source.example.org", ...who });
  assert.deepEqual([on.ok, on.existed], [true, false], JSON.stringify(on).slice(0, 300));
  assert.equal(inForce(), true);
  const off = w.ci.unwatchImport({ import: a.import, ...who });
  assert.equal(off.ok, true, JSON.stringify(off).slice(0, 300));
  assert.equal(inForce(), false, "unwatch takes the watch back");
  assert.equal(w.ci.unwatchImport({ import: a.import, ...who }).reason, "IMPORT_NOT_WATCHED", "nothing left to end");
  const again = w.ci.watchImport({ import: a.import, publisher: "https://source.example.org", ...who });
  assert.deepEqual([again.ok, again.existed], [true, false], JSON.stringify(again).slice(0, 300));
  assert.equal(inForce(), true, "a further watch takes the end back");
  assert.equal(w.count("case_import_watches"), 2, "every watch stays in the history");
  assert.equal(w.count("case_import_watch_ends"), 1, "and every end");
});
