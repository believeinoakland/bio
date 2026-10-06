import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { renderPack, machineFences, memberOnlyActs, packVersion, SKILL_PACK_ID, DOCTRINE_EDITION,
         OBJECTIVE, BOUNDARY, FOUR_LEVEL_RULE, SEARCH_COMPLETENESS, AUTHORED_SOURCES, SOURCING,
         ABSENCE_ANSWER_SHAPE } from "../../../src/skillpack.mjs";
import { judgementLayers } from "../../../src/skilldoctrine.mjs";
import { OBSERVATION_LEVELS, OBSERVATION_STATES } from "../../../src/observation-log/index.mjs";
import { RUN_BOUNDS, RUN_ENDINGS, AI_RUN_CHECKS } from "../../../src/run-rules/index.mjs";
import { RECOMMEND_PROMPT, RECOMMEND_PROMPT_SHA256 } from "../../../src/contradiction.mjs";
import { controlFlowAuthority } from "../../../src/skilldoctrine.mjs";
import { createHash } from "node:crypto";
import { ROOT, owners, published } from "./fixture.mjs";

const SOURCINGS = new Set(["authored", "imported", "driven", "absent"]);
const JUDGEMENT_KEYS = ["composition", "description", "search", "absence", "prohibitions",
                        "deployment_sequence", "judgement_boundary"];

/* The same function over a catalogue made for the case: one family of each shape R7 names. */
const MADE_CATALOGUE = {
  Z_CHECKS: {
    MACHINE_CANNOT_ZED: { check: "C-9.2", translation: "zed words" },
    MACHINE_CANNOT_ALPHA: { translation: "alpha words" },
    MACHINE_CANNOT_EMPTY: { check: "C-9.3", translation: "" },
    MACHINE_CANNOT_NONE: { check: "C-9.4" },
    MACHINE_CANNOT_NULL: null,
    OTHER_CODE: { check: "C-9.5", translation: "not a fence" },
  },
  A_CHECKS: { MACHINE_CANNOT_MID: { check: "C-1.1", translation: "mid words" } },
  NOT_A_FAMILY: { MACHINE_CANNOT_HIDDEN: { check: "C-0.1", translation: "never harvested" } },
  B_CHECKS: "a family of another shape",
  C_CHECKS: null,
};

test("R1 renderPack throws naming the missing source, and renders nothing, for each empty source, published.fences among them", () => {
  const cases = [
    [{ vocabularies: undefined }, /no vocabularies/],
    [{ vocabularies: {} }, /no vocabularies/],
    [{ vocabularies: "x" }, /no vocabularies/],
    [{ catalog: undefined }, /no acts/],
    [{ catalog: [] }, /no acts/],
    [{ catalog: [{ id: "only-machine", mode: "machine" }, { id: "no-mode" }] }, /catalogue published none/],
  ];
  for (const [over, re] of cases) assert.throws(() => renderPack(published(over)), re);
  assert.throws(() => renderPack(null), /no vocabularies/);
  for (const fences of [undefined, null, [], "x", { MACHINE_CANNOT_X: { translation: "t" } }])
    assert.throws(() => renderPack(published({ fences })), /op=affordances published no fences/, JSON.stringify(fences));
  /* The catalogue is no input: a second argument, empty or full, changes nothing (§1a, K585 (1)). */
  assert.throws(() => renderPack(published({ fences: [] }), owners), /published no fences/);
  assert.equal(renderPack(published(), {}).version, renderPack(published()).version);
  assert.ok(renderPack(published()).version, "the full sources render");
});

test("R1 the imported levels or absence states empty: renderPack throws and renders nothing", () => {
  /* observation-log's vocabulary cannot be emptied from inside this process, so a child replaces its public
     entry with its own exports but the levels (then states) empty, and drives the same renderPack. */
  const script = (which) => `
    import { mock } from "node:test";
    const real = { ...(await import(${JSON.stringify(join(ROOT, "bio-plane/src/observation-log/index.mjs") + "?real")})) };
    mock.module(${JSON.stringify("file://" + join(ROOT, "bio-plane/src/observation-log/index.mjs"))}, {
      namedExports: { ...real, ${which}: {} } });
    const { renderPack } = await import(${JSON.stringify("file://" + join(ROOT, "bio-plane/src/skillpack.mjs"))});
    const { published } = await import(${JSON.stringify("file://" + join(ROOT, "bio-plane/test/m/skills/fixture.mjs"))});
    const pub = published({ vocabularies: { v: ["x"] }, catalog: [{ id: "a", mode: "session" }] });
    try { renderPack(pub); console.log("RENDERED"); } catch (e) { console.log("THREW " + e.message); }`;
  for (const which of ["OBSERVATION_LEVELS", "OBSERVATION_STATES"]) {
    const out = execFileSync(process.execPath, ["--experimental-test-module-mocks", "--no-warnings",
      "--input-type=module", "-e", script(which)], { encoding: "utf8" });
    assert.match(out, /^THREW .*imported from observation-log.*empty/m, `${which} emptied: ${out}`);
  }
});

/* contradiction's prompt and digest cannot be changed from inside this process, so a child replaces its public entry
   with its own exports but those named, and drives the same renderPack (the pattern R1's arm above uses for
   observation-log). It prints the rendered contradiction layer, or what was thrown. */
function renderWithContradiction(over) {
  const file = join(ROOT, "bio-plane/src/contradiction.mjs");
  const script = `
    import { mock } from "node:test";
    const real = { ...(await import(${JSON.stringify(file + "?real")})) };
    mock.module(${JSON.stringify("file://" + file)}, { namedExports: { ...real, ...${JSON.stringify(over)} } });
    const { renderPack } = await import(${JSON.stringify("file://" + join(ROOT, "bio-plane/src/skillpack.mjs"))});
    const { published } = await import(${JSON.stringify("file://" + join(ROOT, "bio-plane/test/m/skills/fixture.mjs"))});
    const pub = published({ vocabularies: { v: ["x"] }, catalog: [{ id: "a", mode: "session" }] });
    try { const p = renderPack(pub); console.log("RENDERED " + JSON.stringify({ layer: p.disclosed.contradiction, version: p.version })); }
    catch (e) { console.log("THREW " + e.message); }`;
  const out = execFileSync(process.execPath, ["--experimental-test-module-mocks", "--no-warnings",
    "--input-type=module", "-e", script], { encoding: "utf8" });
  const m = /^RENDERED (.*)$/m.exec(out);
  return m ? { rendered: JSON.parse(m[1]), out } : { rendered: null, out };
}
const sha256 = (s) => createHash("sha256").update(s, "utf8").digest("hex");
/* The digest contradiction would set once the recommender is measured over the prompt it holds (its R41). */
const MEASURED = sha256(RECOMMEND_PROMPT);

test("R1 R27 contradiction's recommender prompt absent or blank, or not the prompt its non-null digest measured: renderPack throws naming it and renders nothing", () => {
  const cases = [
    [{ RECOMMEND_PROMPT: null }, /exported no RECOMMEND_PROMPT/],
    [{ RECOMMEND_PROMPT: "" }, /exported no RECOMMEND_PROMPT/],
    [{ RECOMMEND_PROMPT: " \n\t" }, /exported no RECOMMEND_PROMPT/],
    [{ RECOMMEND_PROMPT: " ", RECOMMEND_PROMPT_SHA256: sha256(" ") }, /exported no RECOMMEND_PROMPT/],
    [{ RECOMMEND_PROMPT: RECOMMEND_PROMPT + " ", RECOMMEND_PROMPT_SHA256: MEASURED }, /is not contradiction's RECOMMEND_PROMPT_SHA256/],
    [{ RECOMMEND_PROMPT_SHA256: "0".repeat(64) }, /is not contradiction's RECOMMEND_PROMPT_SHA256/],
    [{ RECOMMEND_PROMPT_SHA256: MEASURED.toUpperCase() }, /is not contradiction's RECOMMEND_PROMPT_SHA256/],
  ];
  for (const [over, re] of cases) {
    const { rendered, out } = renderWithContradiction(over);
    assert.equal(rendered, null, `${JSON.stringify(over).slice(0, 80)} rendered: ${out}`);
    assert.match(out, /^THREW /m);
    assert.match(out, re);
  }
  /* The controls: the measured prompt renders, and so does today's unmeasured one (its layer absent, R27). */
  assert.ok(renderWithContradiction({ RECOMMEND_PROMPT_SHA256: MEASURED }).rendered);
  assert.ok(renderWithContradiction({}).rendered);
});

test("R2 resident holds exactly objective, boundary, four_level, absence, disclosable, each with its source and sourcing", () => {
  const { resident } = renderPack(published());
  assert.deepEqual(Object.keys(resident).sort(), ["absence", "boundary", "disclosable", "four_level", "objective"]);
  assert.deepEqual(resident.objective, { text: OBJECTIVE, source: AUTHORED_SOURCES.OBJECTIVE, sourcing: "authored" });
  assert.equal(resident.boundary.rule, BOUNDARY);
  assert.equal(resident.boundary.source, AUTHORED_SOURCES.BOUNDARY);
  assert.equal(resident.boundary.sourcing, "authored");
  assert.equal(resident.four_level.rule, FOUR_LEVEL_RULE);
  assert.equal(resident.four_level.completeness, SEARCH_COMPLETENESS);
  assert.equal(resident.four_level.source, AUTHORED_SOURCES.FOUR_LEVEL_RULE);
  assert.equal(resident.four_level.sourcing, "authored");
  assert.equal(resident.four_level.levels, OBSERVATION_LEVELS, "the levels are observation-log's own object");
  assert.equal(resident.four_level.levels_sourcing, "imported");
  assert.deepEqual(resident.four_level.answer_shape, ["level", "state", "searched", "not_searched"]);
  assert.deepEqual(ABSENCE_ANSWER_SHAPE, ["level", "state", "searched", "not_searched"]);
  assert.deepEqual(resident.absence, { states: OBSERVATION_STATES, sourcing: "imported" });
  assert.equal(resident.absence.states, OBSERVATION_STATES);
  for (const k of ["objective", "boundary", "four_level", "absence"])
    assert.ok(SOURCINGS.has(resident[k].sourcing), `${k} carries a sourcing label`);
  for (const k of ["objective", "boundary", "four_level"])
    assert.ok(resident[k].source, `${k} carries its source`);
});

test("R3 boundary.fences is published.fences unchanged, member_only_acts is memberOnlyActs(catalog), and fences_note states the subset", () => {
  const pub = published();
  const { resident: { boundary } } = renderPack(pub);
  assert.equal(boundary.fences, pub.fences, "the published fences, unchanged");
  assert.deepEqual(boundary.fences, machineFences(owners));
  assert.ok(boundary.fences.length > 0);
  /* Whatever the plane publishes is what is carried: a fence from a module's own family arrives as published. */
  const moved = [...pub.fences, { code: "MACHINE_CANNOT_MOVED", family: "MODULE_CHECKS", check: "C-9.9", says: "moved words" }];
  assert.equal(renderPack(published({ fences: moved })).resident.boundary.fences, moved);
  assert.deepEqual(boundary.member_only_acts, memberOnlyActs(pub.catalog));
  assert.equal(boundary.fences_sourcing, "driven");
  assert.equal(boundary.member_only_sourcing, "driven");
  assert.match(boundary.fences_note, /canned translation/);
  assert.match(boundary.fences_note, /paraphrases none/);
  for (const f of boundary.fences)
    assert.equal(f.says, owners[f.family][f.code].translation, `${f.code} is the owner's translation verbatim`);
});

test("R4 disclosable lists every disclosed key with its load_when, and nothing of any body", () => {
  const { resident, disclosed } = renderPack(published());
  assert.deepEqual(resident.disclosable,
    Object.keys(disclosed).map((k) => ({ layer: k, load_when: disclosed[k].load_when })));
  for (const d of resident.disclosable) assert.deepEqual(Object.keys(d).sort(), ["layer", "load_when"]);
});

test("R5 disclosed holds the judgement layers, then vocabularies, acts, bounds, refusals, contradiction, action_planning, filing_drafting, edition_statement, wizard_authoring, legal_lookup, ask, suggestions, wizard_scripts (no recipes layer), each with load_when and sourcing", () => {
  const pub = published();
  const { disclosed } = renderPack(pub);
  assert.deepEqual(Object.keys(disclosed), [...JUDGEMENT_KEYS, "vocabularies", "acts", "bounds", "refusals",
    "contradiction", "action_planning", "filing_drafting", "edition_statement", "wizard_authoring", "legal_lookup",
    "ask", "suggestions", "wizard_scripts"]);
  assert.ok(!("recipes" in disclosed), "DEC-120 retires the recipe: no layer carries the word");
  assert.deepEqual(JUDGEMENT_KEYS.map((k) => disclosed[k]), JUDGEMENT_KEYS.map((k) => judgementLayers()[k]));
  assert.equal(disclosed.vocabularies.body, pub.vocabularies, "the published vocabularies, unchanged");
  assert.equal(disclosed.vocabularies.sourcing, "driven");
  assert.deepEqual(disclosed.acts.body, { catalog: pub.catalog, capture_acts: pub.capture_acts });
  assert.equal(disclosed.acts.body.catalog, pub.catalog);
  for (const notList of [undefined, null, "x", { a: 1 }]) {
    const r = renderPack(published({ capture_acts: notList }));
    assert.deepEqual(r.disclosed.acts.body.capture_acts, [], `capture_acts ${JSON.stringify(notList)} is []`);
  }
  assert.deepEqual(disclosed.bounds.body, { bounds: RUN_BOUNDS, endings: RUN_ENDINGS });
  assert.deepEqual(disclosed.refusals.body, Object.fromEntries(Object.entries(AI_RUN_CHECKS)
    .map(([code, row]) => [code, { check: row.check, says: row.translation }])));
  assert.deepEqual(Object.keys(disclosed.refusals.body), Object.keys(AI_RUN_CHECKS), "every AI_RUN_CHECKS code");
  for (const [k, layer] of Object.entries(disclosed)) {
    assert.equal(typeof layer.load_when, "string", `${k}.load_when`);
    assert.ok(layer.load_when.trim().length > 0, `${k}.load_when is non-empty`);
    assert.ok(SOURCINGS.has(layer.sourcing), `${k}.sourcing is one of the four`);
  }
});

test("R27 measured, the contradiction layer carries contradiction's RECOMMEND_PROMPT and its digest unchanged, imported; unmeasured, it states its absence and carries no prompt; the version moves with the prompt", () => {
  /* Measured: the digest contradiction sets once its blind fixture has run under the prompt (its R41). */
  const measured = renderWithContradiction({ RECOMMEND_PROMPT_SHA256: MEASURED }).rendered.layer;
  assert.deepEqual(measured, {
    load_when: "the run judges or recommends on a contradiction candidate's two sides",
    sourcing: "imported",
    body: { recommend_prompt: RECOMMEND_PROMPT, recommend_prompt_sha256: MEASURED },
  });
  assert.equal(SOURCING.contradiction, "imported");
  assert.equal(sha256(measured.body.recommend_prompt), measured.body.recommend_prompt_sha256,
    "the carried words are the ones measured under the digest");
  /* Unmeasured, as contradiction holds it today (RECOMMEND_PROMPT_SHA256 null): the absence stated, R9's form. */
  const { disclosed, resident } = renderPack(published());
  const layer = disclosed.contradiction;
  if (RECOMMEND_PROMPT_SHA256 === null) {
    assert.deepEqual(Object.keys(layer).sort(), ["absent_because", "body", "load_when", "sourcing"]);
    assert.equal(layer.load_when, "never, in this edition");
    assert.equal(layer.sourcing, "absent");
    assert.deepEqual(layer.body, {});
    assert.match(layer.absent_because, /no measurement/);
    assert.ok(!JSON.stringify(disclosed).includes(RECOMMEND_PROMPT.split("\n")[0]), "no unmeasured prompt is carried");
  } else assert.deepEqual(layer, measured, "contradiction's digest is set: the measured form");
  assert.ok(resident.disclosable.some((d) => d.layer === "contradiction" && d.load_when === layer.load_when));
  assert.ok(!JSON.stringify(resident).includes(RECOMMEND_PROMPT.split("\n")[0]), "the body is disclosed, never resident");
  /* The version is an identity over what was rendered: measured and unmeasured are two packs, and other words another. */
  const measuredVersion = renderWithContradiction({ RECOMMEND_PROMPT_SHA256: MEASURED }).rendered.version;
  const edited = RECOMMEND_PROMPT + ".";
  const editedVersion = renderWithContradiction({ RECOMMEND_PROMPT: edited, RECOMMEND_PROMPT_SHA256: sha256(edited) }).rendered.version;
  const unmeasuredVersion = renderWithContradiction({ RECOMMEND_PROMPT_SHA256: null }).rendered.version;
  assert.equal(new Set([measuredVersion, editedVersion, unmeasuredVersion]).size, 3);
  /* The skill holds no gate (R24), and the words it may render carry no control-flow authority (R16). */
  assert.deepEqual(controlFlowAuthority(RECOMMEND_PROMPT), [], "contradiction's recommender prompt");
});

test("R6 version is packVersion(pack), id is investigative-session, edition the authored edition", () => {
  const pack = renderPack(published());
  assert.equal(pack.version, packVersion(pack));
  assert.equal(pack.id, "investigative-session");
  assert.equal(pack.id, SKILL_PACK_ID);
  assert.equal(pack.edition, DOCTRINE_EDITION);
  assert.equal(typeof DOCTRINE_EDITION, "string");
  assert.deepEqual(Object.keys(pack).sort(), ["disclosed", "edition", "id", "resident", "sourcing", "version"]);
  assert.equal(pack.sourcing, SOURCING);
});

test("R7 machineFences: every MACHINE_CANNOT_ row with a translation of every _CHECKS family, verbatim, sorted; other shapes skipped; never throws", () => {
  assert.deepEqual(machineFences(MADE_CATALOGUE), [
    { code: "MACHINE_CANNOT_ALPHA", family: "Z_CHECKS", check: null, says: "alpha words" },
    { code: "MACHINE_CANNOT_MID", family: "A_CHECKS", check: "C-1.1", says: "mid words" },
    { code: "MACHINE_CANNOT_ZED", family: "Z_CHECKS", check: "C-9.2", says: "zed words" },
  ]);
  for (const odd of [undefined, null, 3, "x", [], {}]) assert.deepEqual(machineFences(odd), []);
  /* Over the owners' families, against an independent walk of them (the whole catalogue's walk is dropped: each
     fence's row is tested by its holder, K787). */
  const expected = [];
  for (const [family, rows] of Object.entries(owners))
    for (const [code, row] of Object.entries(rows))
      if (code.startsWith("MACHINE_CANNOT_") && row && typeof row.translation === "string" && row.translation)
        expected.push({ code, family, check: row.check ?? null, says: row.translation });
  expected.sort((a, b) => (a.code < b.code ? -1 : 1));
  assert.ok(expected.length > 0);
  assert.deepEqual(machineFences(owners), expected);
});

test("R8 memberOnlyActs: every act whose mode is a string other than machine, sorted by id, label and prompt null when absent; a non-list gives []", () => {
  assert.deepEqual(memberOnlyActs(published().catalog), [
    { id: "act-a", label: null, mode: "admin-session", prompt: null },
    { id: "act-b", label: "Adopt a version", mode: "session", prompt: "adopt it?" },
  ]);
  assert.deepEqual(memberOnlyActs([null, 3, { id: "x", mode: 7 }, { id: "y", mode: "machine" }, { id: "z" }]), []);
  for (const odd of [undefined, null, "x", { id: "a", mode: "session" }]) assert.deepEqual(memberOnlyActs(odd), []);
});

/* A published screen registry in the plane's shape (`affordances` R37, `wizard-scripts` R13): each screen with the ops
   a step on it may name. */
const SCREENS = [{ id: "s-home", acts: ["act-b", "act-a"] }, { id: "s-queue", acts: ["act-m"] }, { id: "s-empty", acts: [] }];
const step = (screen, act, more = {}) => ({ screen, act, what: "Open it.", why: "It is next.", ...more });

test("R9 with no wizard scripts published, wizard_scripts loads never, is absent, has an empty body and states why", () => {
  for (const wizard_scripts of [undefined, null, "x", { a: 1 }]) {
    for (const pub of [published({ wizard_scripts }), published({ wizard_scripts, screens: SCREENS })]) {
      const { disclosed: { wizard_scripts: layer }, resident } = renderPack(pub);
      assert.deepEqual(Object.keys(layer).sort(), ["absent_because", "body", "load_when", "sourcing"]);
      assert.equal(layer.load_when, "never, in this edition");
      assert.equal(layer.sourcing, "absent");
      assert.equal(SOURCING.wizard_scripts, "absent");
      assert.deepEqual(layer.body, []);
      assert.equal(typeof layer.absent_because, "string");
      assert.match(layer.absent_because, /wizard script/);
      assert.ok(!/recipe/i.test(layer.absent_because), "the retired word is not used");
      assert.ok(resident.disclosable.some((d) => d.layer === "wizard_scripts" && d.load_when === "never, in this edition"));
    }
  }
  /* The old key carries nothing: a published `recipes` list is neither carried nor validated. */
  const old = renderPack(published({ recipes: [{ id: "r", steps: [] }], surfaces: [] }));
  assert.equal(old.disclosed.wizard_scripts.sourcing, "absent");
});

test("R10 published wizard scripts are carried unchanged, driven, each step a published screen and an op of that screen; any other step, or a script with no steps, fails the render naming the script, the step and the name", () => {
  const scripts = [
    { id: "WIZ-1", version: 1, origin: "civicsmith", required: true,
      steps: [step("s-home", "act-b"), step("s-queue", "act-m"), step("s-home", null, { draft: { text: "words" } })] },
    { id: "WIZ-2", version: 3, origin: "group", required: false, steps: [step("s-empty", null)] },
  ];
  const pub = published({ screens: SCREENS, wizard_scripts: scripts });
  const { disclosed: { wizard_scripts: layer }, resident } = renderPack(pub);
  assert.equal(layer.body, scripts, "the published scripts, unchanged");
  assert.equal(layer.sourcing, "driven");
  assert.equal(SOURCING.wizard_scripts_published, "driven");
  assert.ok(layer.load_when.trim() && layer.load_when !== "never, in this edition");
  assert.ok(resident.disclosable.some((d) => d.layer === "wizard_scripts" && d.load_when === layer.load_when));
  assert.deepEqual(renderPack(published({ screens: SCREENS, wizard_scripts: [] })).disclosed.wizard_scripts.body, [],
    "a published empty list is carried as published");
  /* Steps name ops of their screen, read from published.screens, never from the catalogue (K262 (4)): an act the
     catalogue publishes but the screen does not list is refused, and an op the screen lists but the catalogue does
     not is carried. */
  const viaScreen = [{ id: "WIZ-3", steps: [step("s-queue", "op-only-on-screen")] }];
  const screens2 = [...SCREENS, { id: "s-q2" }].map((s) => (s.id === "s-queue" ? { ...s, acts: ["op-only-on-screen"] } : s));
  assert.equal(renderPack(published({ screens: screens2, wizard_scripts: viaScreen })).disclosed.wizard_scripts.body, viaScreen);
  const bad = [
    [[{ id: "WIZ-4", steps: [] }], /wizard script WIZ-4 has no steps/],
    [[{ id: "WIZ-5" }], /wizard script WIZ-5 has no steps/],
    [[{ id: "WIZ-6", steps: "x" }], /wizard script WIZ-6 has no steps/],
    [[{ steps: [] }], /wizard script #0 has no steps/],
    [[{ id: "WIZ-7", steps: [step("s-nowhere", "act-b")] }], /wizard script WIZ-7 step 1 names the screen "s-nowhere", which the plane does not publish/],
    [[{ id: "WIZ-8", steps: [step("s-home", "act-b"), step("s-home", "act-gone")] }],
      /wizard script WIZ-8 step 2 names the act "act-gone", which is not an op of the screen "s-home"/],
    [[{ id: "WIZ-9", steps: [step("s-home", "act-m")] }], /wizard script WIZ-9 step 1 names the act "act-m", which is not an op of the screen "s-home"/],
    [[{ id: "WIZ-10", steps: [step("s-empty", "act-b")] }], /WIZ-10 step 1 names the act "act-b"/],
    [[{ id: "WIZ-11", steps: [{ act: "act-b" }] }], /WIZ-11 step 1 names the screen undefined/],
    [[{ id: "WIZ-12", steps: [{ screen: "s-home" }] }], /WIZ-12 step 1 names the act undefined/],
    [[{ id: "WIZ-13", steps: [null] }], /WIZ-13 step 1 names the screen null/],
    [[scripts[0], { id: "WIZ-14", steps: [step("s-queue", "act-b")] }], /WIZ-14 step 1 names the act "act-b"/],
  ];
  for (const [ws, re] of bad) {
    assert.throws(() => renderPack(published({ screens: SCREENS, wizard_scripts: ws })), re, String(re));
    assert.throws(() => renderPack(published({ screens: SCREENS, wizard_scripts: ws })), (e) => e instanceof Error);
  }
  for (const screens of [undefined, null, "x", [], [{ acts: ["act-b"] }, "s-home"]])
    assert.throws(() => renderPack(published({ screens, wizard_scripts: scripts })), /WIZ-1 step 1 names the screen "s-home"/,
      `no published screen ${JSON.stringify(screens)}: every screen is unknown`);
  /* The version moves with a script (R11). */
  const moved = [{ ...scripts[0], steps: [...scripts[0].steps, step("s-queue", "act-m")] }, scripts[1]];
  assert.notEqual(renderPack(pub).version, renderPack(published({ screens: SCREENS, wizard_scripts: moved })).version);
});

test("R11 packVersion is investigative-session@<edition>+<16 hex>, over the pack without its version, in canonical form; any rendered word moves it", () => {
  const pack = renderPack(published());
  const re = new RegExp(`^investigative-session@${DOCTRINE_EDITION}\\+[0-9a-f]{16}$`);
  assert.match(pack.version, re);
  assert.equal(packVersion({ ...pack, version: "anything" }), pack.version, "the version field is excluded");
  const { version, ...rest } = pack;
  const reordered = Object.fromEntries(Object.entries(rest).reverse());
  reordered.resident = Object.fromEntries(Object.entries(rest.resident).reverse());
  assert.equal(packVersion(reordered), pack.version, "key order at any depth does not move it");
  assert.equal(renderPack(published()).version, pack.version, "the same pack gives the same string");
  const moved = [
    published({ vocabularies: { colours: ["red", "greén"], shapes: { round: "a circle" } } }),
    published({ vocabularies: { colours: ["red", "green"], shapes: { round: "a circle." } } }),
    published({ capture_acts: [{ id: "cap-2" }] }),
    published({ catalog: [...published().catalog, { id: "act-o", mode: "session" }] }),
  ];
  const seen = new Set([pack.version]);
  for (const p of moved) {
    const v = renderPack(p).version;
    assert.match(v, re);
    assert.ok(!seen.has(v), `a changed word gives a different digest: ${v}`);
    seen.add(v);
  }
  assert.notEqual(packVersion({ a: [1, 2] }), packVersion({ a: [2, 1] }), "array order is content");
  assert.match(packVersion(null), re, "an identity digest over anything; nothing gates on it");
});

test("R22 pure: no clock, randomness, network or storage is touched, and the same inputs render the same pack byte for byte", () => {
  const saved = { now: Date.now, random: Math.random, fetch: globalThis.fetch, Date: globalThis.Date };
  const trap = (name) => () => { throw new Error(`renderPack touched ${name}`); };
  let a, b;
  try {
    Date.now = trap("Date.now"); Math.random = trap("Math.random"); globalThis.fetch = trap("fetch");
    globalThis.Date = new Proxy(saved.Date, { construct: trap("new Date"), apply: trap("Date()") });
    a = JSON.stringify(renderPack(published()));
    b = JSON.stringify(renderPack(published()));
  } finally {
    Date.now = saved.now; Math.random = saved.random; globalThis.fetch = saved.fetch; globalThis.Date = saved.Date;
  }
  assert.equal(a, b);
  assert.equal(JSON.stringify(renderPack(published())), a);
});

test("R26 no place is named in the rendered pack", () => {
  const text = JSON.stringify(renderPack(published()));
  for (const place of ["Oakland", "Alameda", "California", "Berkeley", "San Francisco"])
    assert.ok(!text.includes(place), `the pack names ${place}`);
});
