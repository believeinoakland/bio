import { test } from "node:test";
import assert from "node:assert/strict";
import * as pack from "../../../src/skillpack.mjs";
import * as doctrine from "../../../src/skilldoctrine.mjs";
import { OBSERVATION_LEVELS, OBSERVATION_STATES, DEFINITIVE_STATES } from "../../../src/observation-log/index.mjs";
import { RUN_BOUNDS, RUN_ENDINGS, AI_RUN_CHECKS } from "../../../src/airun.mjs";
import { ROOT, SRC, catalogue, read, norm, foundIn, section, canonDocuments, published, stringLiterals }
  from "./fixture.mjs";

const { DEFERRED_ROWS, JUDGED_ROWS, TABLE_SOURCE, CLAUSES, controlFlowAuthority, CONTROL_FLOW_AUTHORITY,
        PROHIBITIONS, PERMITTED_AUTO_COMPOSITION, SURVEY_SOURCE, DESIGN_SOURCE, DEPLOYMENT_SEQUENCE, GATE_ADDRESS,
        absenceByLevel, reportsAs, LICENSES_A_CONCLUSION, LICENSES_NOTHING, FACTS_SOURCE, SEQUENCING_SOURCE,
        judgementLayers, JUDGEMENT_VERSION, JUDGEMENT_ID, JUDGEMENT_EDITION } = doctrine;
const IS = "docs/development/INVESTIGATIVE-SESSION.md";
const FRAMEWORK = "docs/architecture/BIO_Content_Framework_v0_10.md";

/* §14b.4's table, both columns, as the design document holds it. */
function table() {
  const lines = read(TABLE_SOURCE).split("\n");
  const h = lines.findIndex((l) => /^\| deterministic — code, not skill \| the model's judgement \|$/.test(l));
  assert.ok(h >= 0, "§14b.4's table is where TABLE_SOURCE says");
  const rows = [];
  for (let i = h + 2; i < lines.length && lines[i].startsWith("|"); i++)
    rows.push(lines[i].split("|").slice(1, -1).map((c) => c.trim()));
  return { left: rows.map((r) => r[0]), right: rows.map((r) => r[1]).filter((c) => c !== "—") };
}

/* Every C-number any keyed row of the catalogue carries. */
function keyedNumbers() {
  const out = new Set();
  for (const rows of Object.values(catalogue))
    if (rows && typeof rows === "object" && !Array.isArray(rows))
      for (const row of Object.values(rows)) if (row && typeof row.check === "string") out.add(row.check);
  return out;
}

/* Every string anywhere inside a value. */
const strings = (v) => typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : [];

test("R14 DEFERRED_ROWS and JUDGED_ROWS are §14b.4's two columns, verbatim and in order", () => {
  const t = table();
  assert.deepEqual(DEFERRED_ROWS, t.left);
  assert.deepEqual(JUDGED_ROWS, t.right);
  assert.equal(TABLE_SOURCE, IS);
  const granted = new Set(CLAUSES.flatMap((c) => c.judges));
  for (const g of granted) assert.ok(JUDGED_ROWS.includes(g), `the skill's authority is exactly JUDGED_ROWS: ${g}`);
});

test("R15 every clause judges within JUDGED_ROWS and defers within DEFERRED_ROWS, the defers cover DEFERRED_ROWS, and each is enforced by a keyed C-number or says why not", () => {
  const keyed = keyedNumbers();
  const ids = new Set();
  for (const c of CLAUSES) {
    assert.ok(!ids.has(c.id), `clause ids are distinct: ${c.id}`); ids.add(c.id);
    assert.ok(Array.isArray(c.judges) && c.judges.every((j) => JUDGED_ROWS.includes(j)), `${c.id} judges`);
    assert.ok(Array.isArray(c.defers) && c.defers.every((d) => DEFERRED_ROWS.includes(d)), `${c.id} defers`);
    assert.ok(Array.isArray(c.enforced_by));
    if (c.enforced_by.length === 0)
      assert.ok(typeof c.unenforced_because === "string" && c.unenforced_because.trim(), `${c.id} says why unenforced`);
    for (const n of c.enforced_by) {
      assert.match(n, /^C-\d+\.\d+$/, `${c.id} cites a C-number`);
      if (n === "C-2.8") assert.ok(!keyed.has(n), "C-2.8 is the one number with no keyed row");
      else assert.ok(keyed.has(n), `${c.id}'s ${n} is read from a keyed catalogue row`);
    }
  }
  assert.deepEqual([...new Set(CLAUSES.flatMap((c) => c.defers))].sort(), [...DEFERRED_ROWS].sort());
});

test("R16 controlFlowAuthority finds each control-flow pattern and finds none in the clauses' grants, the prohibitions or the deployment record", () => {
  const trips = {
    "a bound stated as a quantity": "Search at most three passes before reporting.",
    "a bound stated as a numeral": "Run 4 fetches and then compose.",
    "a termination condition": "Stop the search when the record is thin.",
    "the termination decision itself": "Decide for yourself when it is enough and report.",
    "self-assessed recall as a stopping rule": "Report once you are satisfied the record is covered.",
    "a loop written as an instruction": "Keep searching until something turns up.",
  };
  assert.deepEqual(Object.keys(trips).sort(), CONTROL_FLOW_AUTHORITY.map((p) => p.name).sort());
  for (const [name, text] of Object.entries(trips)) assert.ok(controlFlowAuthority(text).includes(name), `${name}: ${text}`);
  for (const text of ["Search two versions deep.", "at most two levels", "Iterate while the queue holds items.",
                      "Decide how many sub-sessions to open.", "Continue until you think you have enough."])
    assert.ok(controlFlowAuthority(text).length > 0, `a pass budget or stopping rule: ${text}`);
  for (const odd of [undefined, null, 3, {}, ["stop the loop"]]) assert.deepEqual(controlFlowAuthority(odd), []);
  assert.deepEqual(controlFlowAuthority("the four levels, and what each level's reports mean"), []);
  for (const c of CLAUSES) assert.deepEqual(controlFlowAuthority(c.decides), [], `clause ${c.id}'s decides`);
  for (const p of PROHIBITIONS)
    for (const s of strings(p)) assert.deepEqual(controlFlowAuthority(s), [], `prohibition ${p.id}: ${s}`);
  for (const s of strings(DEPLOYMENT_SEQUENCE)) assert.deepEqual(controlFlowAuthority(s), [], `deployment record: ${s}`);
});

test("R17 five prohibitions, each text and because verbatim in its source, named again in the design document, with what its fence does not reach; the permitted auto-composition is not a sixth", () => {
  assert.deepEqual(PROHIBITIONS.map((p) => p.id), ["no-generated-justification", "no-single-confidence-score",
    "no-connection-density-ranking", "machine-proposed-is-never-a-connection", "no-boilerplate-to-clear-a-gate"]);
  const is = read(IS);
  for (const p of PROHIBITIONS) {
    const src = read(p.source);
    assert.ok([SURVEY_SOURCE, DESIGN_SOURCE].includes(p.source));
    assert.ok(foundIn(src, p.text), `${p.id} text in ${p.source}`);
    assert.ok(foundIn(src, p.because), `${p.id} because in ${p.source}`);
    assert.ok(foundIn(is, p.also_named_in), `${p.id} also named in ${IS}`);
    assert.ok(typeof p.does_not_reach === "string" && p.does_not_reach.trim(), `${p.id} does_not_reach`);
    if (p.enforced_by.length === 0) assert.ok(p.unenforced_because?.trim(), `${p.id} says why unenforced`);
  }
  assert.equal(PROHIBITIONS[4].source, DESIGN_SOURCE, "the fifth is the design document's own");
  assert.ok(PROHIBITIONS.slice(0, 4).every((p) => p.source === SURVEY_SOURCE));
  assert.ok(!PROHIBITIONS.some((p) => p.id === PERMITTED_AUTO_COMPOSITION.id), "not a sixth prohibition");
  const survey = read(PERMITTED_AUTO_COMPOSITION.source);
  for (const k of ["text", "permitted_because", "the_line", "and_the_other_side"])
    assert.ok(foundIn(survey, PERMITTED_AUTO_COMPOSITION[k]), `permitted ${k} in the survey`);
  assert.ok(foundIn(is, PERMITTED_AUTO_COMPOSITION.also_named_in));
  assert.ok(PERMITTED_AUTO_COMPOSITION.stops_at.startsWith("the first new word"));
  const layer = judgementLayers().prohibitions.body;
  assert.equal(layer.prohibitions, PROHIBITIONS);
  assert.equal(layer.permitted_auto_composition, PERMITTED_AUTO_COMPOSITION);
});

test("R18 the deployment sequence is check, investigate, extract, check first, unverified, and holds no flag, predicate or decision: the gate is agent-worker's", () => {
  assert.deepEqual(DEPLOYMENT_SEQUENCE.order, ["check", "investigate", "extract"]);
  assert.equal(DEPLOYMENT_SEQUENCE.first_deployed_mode, DEPLOYMENT_SEQUENCE.order[0]);
  assert.equal(DEPLOYMENT_SEQUENCE.verification_recorded, null);
  assert.deepEqual(DEPLOYMENT_SEQUENCE.enforced_by, []);
  const walk = (v, path) => {
    assert.notEqual(typeof v, "function", `${path} is a function`);
    assert.notEqual(typeof v, "boolean", `${path} is a flag`);
    if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, `${path}.${k}`);
  };
  walk(DEPLOYMENT_SEQUENCE, "DEPLOYMENT_SEQUENCE");
  walk(GATE_ADDRESS, "GATE_ADDRESS");
  assert.equal(GATE_ADDRESS.file, "agent-worker/src/harness.mjs");
  assert.equal(GATE_ADDRESS.modes_export, "MODES");
  assert.equal(GATE_ADDRESS.table_export, "CONTROL_FLOW");
  assert.equal(GATE_ADDRESS.row, "gate-mode");
  assert.equal(DEPLOYMENT_SEQUENCE.gate, GATE_ADDRESS);
  assert.equal(DEPLOYMENT_SEQUENCE.enforced_by_row, 'agent-worker/src/harness.mjs:CONTROL_FLOW["gate-mode"]');
  assert.ok(foundIn(read(SEQUENCING_SOURCE), DEPLOYMENT_SEQUENCE.text), "§2's ruling, verbatim");
});

test("R19 absenceByLevel: one entry per level in order, the level's fact, the next level, both spellings, and the states split by the definitive set", () => {
  const facts = { meaning: "nothing derived", content: "nothing extracted", document: "no document", internet: "nobody looked" };
  const levels = Object.keys(OBSERVATION_LEVELS);
  const out = absenceByLevel();
  assert.deepEqual(Object.keys(out), levels);
  const states = Object.keys(OBSERVATION_STATES);
  const yes = states.filter((s) => DEFINITIVE_STATES.has(s)), no = states.filter((s) => !DEFINITIVE_STATES.has(s));
  levels.forEach((level, i) => {
    const e = out[level];
    assert.equal(e.states_when_absent, Object.hasOwn(facts, level) ? facts[level] : null, level);
    assert.equal(e.ask_next, i + 1 < levels.length ? levels[i + 1] : null);
    assert.equal(e.logged_as, level);
    assert.equal(e.reported_as, reportsAs(level));
    assert.deepEqual(e.states, states);
    assert.deepEqual(e.licenses_a_conclusion, yes);
    assert.deepEqual(e.licenses_nothing, no);
  });
  const stated = levels.map((l) => out[l].states_when_absent).filter((x) => x !== null);
  assert.equal(new Set(stated).size, stated.length, "the four facts are pairwise distinct");
  assert.deepEqual(LICENSES_A_CONCLUSION, yes);
  assert.deepEqual(LICENSES_NOTHING, no);
  assert.equal(out[levels.at(-1)].ask_next, null);
});

test("R20 reportsAs is the SUGGEST_LEVELS member equal to the level or the level plus s, else null; never throws", () => {
  for (const level of Object.keys(OBSERVATION_LEVELS)) {
    const r = reportsAs(level);
    assert.ok(catalogue.SUGGEST_LEVELS.includes(r), `${level} reports as ${r}`);
    assert.ok(r === level || r === level + "s");
  }
  for (const s of catalogue.SUGGEST_LEVELS) assert.equal(reportsAs(s), s);
  for (const odd of ["nowhere", "", undefined, null, 3, {}]) assert.equal(reportsAs(odd), null);
});

test("R21 every authored sentence is found in the canon document its source names; the four-level sentences and the four facts are §14.3's own, in its order", () => {
  const canon = canonDocuments();
  const sources = [...Object.values(pack.AUTHORED_SOURCES), TABLE_SOURCE, FACTS_SOURCE, SEQUENCING_SOURCE];
  for (const s of sources) assert.ok(canon.has(s), `${s} is canon`);
  for (const [k, src] of Object.entries(pack.AUTHORED_SOURCES))
    assert.ok(foundIn(read(src), pack[k]), `${k} is in ${src}`);
  assert.equal(pack.AUTHORED_SOURCES.FOUR_LEVEL_RULE, FRAMEWORK);
  assert.equal(pack.AUTHORED_SOURCES.SEARCH_COMPLETENESS, FRAMEWORK);
  assert.equal(FACTS_SOURCE, FRAMEWORK);
  const s143 = section(read(FRAMEWORK), "14.3 ");
  assert.ok(s143.length > 0, "Part II §14.3 is where it was");
  assert.ok(foundIn(s143, pack.FOUR_LEVEL_RULE), "the four-level rule is §14.3's sentence");
  assert.ok(foundIn(s143, pack.SEARCH_COMPLETENESS), "the search-completeness rule is §14.3's sentence");
  const resident = pack.renderPack(published(), catalogue).resident;
  assert.equal(resident.four_level.section, "Part II §14.3");
  const levels = Object.keys(OBSERVATION_LEVELS);
  const facts = levels.map((l) => absenceByLevel()[l].states_when_absent);
  const text = norm(s143).toLowerCase();
  let at = -1;
  for (const f of facts) {
    const i = text.indexOf(f.toLowerCase(), at + 1);
    assert.ok(i > at, `"${f}" is in §14.3, after the fact before it`);
    at = i;
  }
  const t = table();
  assert.ok(t.left.length === DEFERRED_ROWS.length, "§14b.4's table is canon's own");
});

test("R23 no member of an imported or driven vocabulary appears in the module's source as a string literal; the machine mode is its one published token", () => {
  const corpus = new Map();
  const add = (name, xs) => { for (const x of xs) corpus.set(x, name); };
  add("OBSERVATION_LEVELS", Object.keys(OBSERVATION_LEVELS));
  add("OBSERVATION_STATES", Object.keys(OBSERVATION_STATES));
  add("DEFINITIVE_STATES", [...DEFINITIVE_STATES]);
  add("RUN_BOUNDS", Object.keys(RUN_BOUNDS));
  add("RUN_ENDINGS", Object.keys(RUN_ENDINGS));
  add("SUGGEST_LEVELS", catalogue.SUGGEST_LEVELS);
  add("BASIS_ROLES", catalogue.BASIS_ROLES);
  add("EARNED_GRADE_SOURCES", catalogue.EARNED_GRADE_SOURCES);
  add("VERSION_STRENGTH_INERT_SOURCES", catalogue.VERSION_STRENGTH_INERT_SOURCES);
  add("AI_RUN_CHECKS", Object.keys(AI_RUN_CHECKS).filter((k) => !pack.SKILL_CHECK_KEYS.includes(k)));
  add("the published act modes", ["session", "admin-session"]);
  let machine = 0;
  for (const f of SRC) {
    const lits = stringLiterals(read(f));
    assert.ok(lits.length > 50, `${f} was read`);
    for (const l of lits) {
      assert.ok(!corpus.has(l), `${f} types ${corpus.get(l)}'s member "${l}"`);
      if (l === "machine") machine++;
    }
  }
  assert.equal(machine, 1, "the machine act mode is named once");
  assert.deepEqual(pack.memberOnlyActs([{ id: "m", mode: "machine" }, { id: "s", mode: "session" }]).map((a) => a.id), ["s"],
    "and it is the spelling that excludes a machine act");
  /* The scanner can fail: the same function over a hand copy finds it. */
  assert.ok(stringLiterals('const x = "LOOKED_ABSENT"; /* "PRESENT" */').includes("LOOKED_ABSENT"));
  assert.ok(!stringLiterals('/* "PRESENT" */ // "partial"\n').length);
});

test("R24 it holds no gate: across every export and every input, the only refusal is C-22.7, and the rendered grants carry no control-flow authority", () => {
  const inputs = [undefined, null, "", "3", "pack@1", 0, {}, [], published(), catalogue];
  const refusals = new Set();
  const collect = (v, depth = 0) => {
    if (!v || typeof v !== "object" || depth > 12) return;
    if (v.ok === false) refusals.add(v.code);
    for (const x of Object.values(v)) collect(x, depth + 1);
  };
  for (const mod of [pack, doctrine])
    for (const [name, fn] of Object.entries(mod)) {
      if (typeof fn !== "function") continue;
      for (const a of inputs) for (const b of [undefined, catalogue]) {
        try { collect(fn(a, b)); } catch (e) { assert.ok(e instanceof Error, `${name} throws only Errors`); }
      }
    }
  assert.deepEqual([...refusals], ["AI_RUN_SKILL_VERSION_UNNAMED"]);
  const rendered = pack.renderPack(published(), catalogue);
  const clauses = Object.values(rendered.disclosed).flatMap((l) => (l.body && Array.isArray(l.body.clauses) ? l.body.clauses : []));
  assert.equal(clauses.length, CLAUSES.length, "every clause is rendered");
  for (const c of clauses) assert.deepEqual(controlFlowAuthority(c.decides), [], c.id);
  assert.equal(JUDGEMENT_VERSION, `${JUDGEMENT_ID}@${JUDGEMENT_EDITION}`);
});
