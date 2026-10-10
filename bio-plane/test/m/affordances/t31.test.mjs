/* affordances, T31's entries: R36 (every decorated act's advisory `phone` flag, DEC-122 (1)), R37 (`wizard-scripts`' ops
   graded, DEC-120, DEC-121) and R38 (`case-import`'s watch acts graded, DEC-101 (3)), each at the module's exports, and
   R38's `reversible` backed at case-import's own interface over its fixture. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as A from "../../../src/affordances.mjs";
import * as G from "../../../src/op-grades/index.mjs";
import { caseImportOps } from "../../../src/case-import/index.mjs";
import * as ci from "../case-import/fixture.mjs";

const { ACTS, CAPTURE_ACTS, PER_ITEM_ACTS, VOCABULARIES, decorate, unaccounted } = A;
const { NON_ACTS, RUNGS, RUNG_ABSENT, MACHINE_REFUSALS, JUSTIFICATION_REFUSALS, LARGER_SCREEN_ACTS, IRREVERSIBLE_WEIGHT } = G;
const gradeOf = (op) => Object.hasOwn(RUNGS, op) ? ["rung", RUNGS[op]]
  : Object.hasOwn(RUNG_ABSENT, op) ? ["absent", RUNG_ABSENT[op].ground] : null;
const published = () => [...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS];

/* ============================================================ R36: the phone flag */
/* The oracle, from R36's text alone, an alias answering as its op (`op-grades` R17, R18: `LARGER_SCREEN_ACTS` names ops);
   (T37; op-grades R18 as amended, DEC-181) every op in `IRREVERSIBLE_WEIGHT` answers false too, read from that set.
   `irreversibleArm: false` is the negative control: the rule before T37, which the plane must no longer agree with. */
const phoneWant = (alias, { irreversibleArm = true } = {}) => {
  const op = Object.hasOwn(G.OP_ALIASES, alias) ? G.OP_ALIASES[alias] : alias;
  const g = gradeOf(op);
  if (g && g[0] === "rung" && ["terminal", "attested", "irreversible"].includes(g[1])) return false;
  if (g && g[0] === "absent" && g[1] === "credential") return false;
  if (irreversibleArm && IRREVERSIBLE_WEIGHT.includes(op)) return false;
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
  /* (T37) the IRREVERSIBLE_WEIGHT arm: standardrelease (its rung `reasoned`) and personexpunge answer false through it;
     the negative control, the oracle without that arm, disagrees with the plane exactly on the set's members whose
     other arms answer true */
  assert.deepEqual(["standardrelease", "personexpunge"].map((op) => decorate({ id: op, label: "x" }, null).phone), [false, false]);
  const missed = ops.filter((op) => decorate({ id: op, label: "x" }, null).phone !== phoneWant(op, { irreversibleArm: false }));
  assert.deepEqual(missed.sort(), IRREVERSIBLE_WEIGHT.filter((op) => phoneWant(op, { irreversibleArm: false })).sort());
  assert.ok(missed.includes("standardrelease"), "the control sees standardrelease");
  /* an op named nowhere is no heavy act: true */
  assert.equal(decorate({ id: "no-such-op", label: "x" }, null).phone, true);
  assert.equal(G.phoneOf("filingsent"), false);
  /* an alias decorated as its op: `filingrecordsent` is kept for a larger screen as `filingsent` is */
  assert.equal(G.OP_ALIASES.filingrecordsent, "filingsent");
  assert.equal(decorate({ id: "filingrecordsent", label: "x" }, null).phone, false);
});

test("R36: (op-grades R18, R26 as T37 amends them; DEC-181) LARGER_SCREEN_ACTS holds filingsent alone, its rung "
   + "`reasoned`; personexpunge left it and answers false through IRREVERSIBLE_WEIGHT; no op is in both sets; the set is "
   + "frozen and published as VOCABULARIES.larger_screen_acts by reference", () => {
  assert.deepEqual([...LARGER_SCREEN_ACTS], ["filingsent"]);
  assert.equal(RUNGS.filingsent, "reasoned");
  assert.equal(RUNGS.personexpunge, "reasoned");
  assert.ok(IRREVERSIBLE_WEIGHT.includes("personexpunge"));
  assert.deepEqual(LARGER_SCREEN_ACTS.filter((op) => IRREVERSIBLE_WEIGHT.includes(op)), []);
  assert.equal(phoneWant("personexpunge"), false);
  assert.equal(decorate({ id: "personexpunge", label: "x" }, null).phone, false);
  assert.equal(G.phoneOf("personexpunge"), false);
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
const R37_READS = ["wizards", "wizardread", "wizardsat", "wizarduse", "wizardcandidates", "wizardcheck",
  "baseupdates" /* R37 (DEC-158 (4)) */, "startfrom" /* R45 (op-declarations R28) */];
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
  /* the two by name: T41's `projectwatch` (op-grades R30) is another module's op, outside this table */
  assert.deepEqual(r.stale.filter((op) => ["importwatch", "importunwatch"].includes(op)), []);
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

/* ============================================================ R37: the no-target answer, and wizardretire's backing */
import * as wz from "../wizard-scripts/fixture.mjs";
import { wizardScriptsOps } from "../../../src/wizard-scripts/index.mjs";

test("R37 R12: wizard-scripts' op map holds exactly the ops R37 grades and names", () => {
  const ops = Object.keys(wizardScriptsOps({}, new URL("http://x/"), {})).sort();
  assert.deepEqual(ops, [...Object.keys(R37_GRADES), ...R37_READS].sort());
});

/* A wizard world: frank's script in P approved by alice (starting on case-home), a second draft of frank's still a
   draft (case-home too), and dave's script in Q approved by dave's co-owner — beside the test Civicsmith library. */
const wizardWorld = (opts) => {
  const w = wz.seeded(opts);
  const a = A.affordancesOf(w.host, { record: w.record, membership: w.membership, sql: w.st.sql, wizardScripts: w.wz });
  return { w, screens: (viewer) => A.affordancesOps(a, new URL(`http://do/affordancescreens?viewer=${encodeURIComponent(viewer ?? "")}`)).affordancescreens() };
};

test("R37 R17: the no-target answer's screens are the registry as wizard-scripts registered it, and wizard_scripts, for "
   + "each registered screen in registry order, wizard-scripts' own R11 answer for the viewer passed in unchanged, the "
   + "caller's drafts left out — so what a member sees differs by viewer, and asking writes nothing", () => {
  const { w, screens } = wizardWorld();
  const app = wz.approved(w);
  const drafted = wz.draft(w, { name: "A second script" });
  w.join(w.Q, "erin", "joined", true);
  const q = wz.approved(w, { who: "dave", by: "erin", project: w.Q, name: "Harbour" });
  const want = (viewer) => wz.SCREENS.flatMap(({ id }) => w.wz.wizardsAt({ screen: id, viewer }).scripts.filter((s) => s.draft !== true));
  const before = w.snapshot();
  for (const m of ["alice", "frank", "dave", "nobody"]) {
    const r = screens(wz.V(m));
    assert.equal(r.ok, true);
    assert.deepEqual(r.screens, w.wz.registeredScreens());
    assert.deepEqual(r.screens.map((s) => s.id), wz.SCREENS.map((s) => s.id));
    assert.deepEqual(r.wizard_scripts, want(wz.V(m)), m);
    assert.deepEqual(r.wizard_scripts.filter((s) => s.draft === true), [], `${m}: no draft`);
  }
  const ids = (m) => screens(wz.V(m)).wizard_scripts.map((s) => s.id);
  assert.ok(ids("alice").includes(app.script) && !ids("alice").includes(q.script), "alice sees P's script, not Q's");
  assert.ok(ids("dave").includes(q.script) && !ids("dave").includes(app.script), "dave sees Q's, not P's");
  assert.ok(ids("alice").includes("WIZ-2026-9001"), "the Civicsmith library is offered");
  /* frank's own draft is in wizard-scripts' answer to him, marked, and left out of the published list */
  assert.ok(w.wz.wizardsAt({ screen: "case-home", viewer: wz.V("frank") }).scripts.some((s) => s.draft === true && s.id === drafted.script));
  assert.equal(screens(wz.V("frank")).wizard_scripts.filter((s) => s.version === drafted.version).length, 0);
  assert.deepEqual(w.snapshot(), before, "nothing written");
});

test("R37: before wizard-scripts is registered, the screens and the offered scripts are two empty lists", () => {
  const { screens } = wizardWorld({ register: false });
  const r = screens(wz.V("alice"));
  assert.deepEqual([r.ok, r.screens, r.wizard_scripts], [true, [], []]);
});

test("R19 R37: wizardretire, graded `reasoned`, is refused without its reason with WIZARD_REASON_REFUSED (in the family) "
   + "and writes nothing — retiring a whole script by an owner, and withdrawing a draft by its author — and is accepted "
   + "with one", () => {
  assert.equal(RUNGS.wizardretire, "reasoned");
  const bad = [];
  for (const reason of [undefined, null, "", "   ", "x".repeat(501)]) {
    const w = wz.seeded();
    const a = wz.approved(w);
    const d = wz.draft(w, { name: "Another" });
    for (const [label, act] of [
      ["retire", () => w.wz.wizardRetire({ script: a.script, reason, by: wz.V("alice"), viewer: wz.V("alice") })],
      ["withdraw", () => w.wz.wizardRetire({ script: d.script, version: d.version, reason, by: wz.V("frank"), viewer: wz.V("frank") })]]) {
      const before = JSON.stringify(w.snapshot());
      const r = act();
      if (!(r && r.ok !== true && r.reason === "WIZARD_REASON_REFUSED" && JUSTIFICATION_REFUSALS.includes(r.reason)))
        bad.push(`${label} ${JSON.stringify(reason)?.slice(0, 12)}: ${JSON.stringify(r).slice(0, 200)}`);
      else if (JSON.stringify(w.snapshot()) !== before) bad.push(`${label}: refused, but wrote`);
    }
  }
  assert.deepEqual(bad, []);
  const w = wz.seeded();
  const a = wz.approved(w);
  const d = wz.draft(w, { name: "Another" });
  const ok = w.wz.wizardRetire({ script: a.script, reason: "the screen it walks was redesigned", by: wz.V("alice"), viewer: wz.V("alice") });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  const wd = w.wz.wizardRetire({ script: d.script, version: d.version, reason: "drafted in error", by: wz.V("frank"), viewer: wz.V("frank") });
  assert.equal(wd.ok, true, JSON.stringify(wd).slice(0, 300));
});

/* R44 (K1861 (1), K1869 (4)): the screens route carries wizard-scripts' own writing-help list, the real module's answer. */
import { WRITING_HELP_NAMED } from "../../../src/wizard-scripts/index.mjs";
test("R44 R17 R21: the screens route answers writing_help_refused as wizard-scripts R24 holds and registers it — its "
   + "named list the very frozen array, the registered sets as registered — and before registration the empty sets", () => {
  const { w, screens } = wizardWorld();
  const r = screens(wz.V("alice")).writing_help_refused;
  assert.deepEqual(r, w.wz.writingHelpRefused());
  assert.equal(r.named, WRITING_HELP_NAMED, "the very array, never a copy");
  for (const op of ["release", "caseratify", "publishat", "publishatcancel", "bootstrap"]) assert.ok(r.named.includes(op), op);
  const none = wizardWorld({ register: false }).screens(wz.V("alice")).writing_help_refused;
  assert.deepEqual([none.named, none.machine_refused, none.irreversible], [WRITING_HELP_NAMED, [], []]);
});
