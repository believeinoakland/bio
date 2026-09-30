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
import { ROOT, catalogue, published } from "./fixture.mjs";

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
  assert.throws(() => renderPack(published({ fences: [] }), catalogue), /published no fences/);
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
    const { renderPack, machineFences } = await import(${JSON.stringify("file://" + join(ROOT, "bio-plane/src/skillpack.mjs"))});
    const cat = await import(${JSON.stringify("file://" + join(ROOT, "bio-plane/checks/bio-checks.mjs"))});
    const pub = { vocabularies: { v: ["x"] }, catalog: [{ id: "a", mode: "session" }], fences: machineFences(cat) };
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
    const { renderPack, machineFences } = await import(${JSON.stringify("file://" + join(ROOT, "bio-plane/src/skillpack.mjs"))});
    const cat = await import(${JSON.stringify("file://" + join(ROOT, "bio-plane/checks/bio-checks.mjs"))});
    const pub = { vocabularies: { v: ["x"] }, catalog: [{ id: "a", mode: "session" }], fences: machineFences(cat) };
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
  assert.deepEqual(boundary.fences, machineFences(catalogue));
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
    assert.equal(f.says, catalogue[f.family][f.code].translation, `${f.code} is the translation verbatim`);
});

test("R4 disclosable lists every disclosed key with its load_when, and nothing of any body", () => {
  const { resident, disclosed } = renderPack(published());
  assert.deepEqual(resident.disclosable,
    Object.keys(disclosed).map((k) => ({ layer: k, load_when: disclosed[k].load_when })));
  for (const d of resident.disclosable) assert.deepEqual(Object.keys(d).sort(), ["layer", "load_when"]);
});

test("R5 disclosed holds the judgement layers, then vocabularies, acts, bounds, refusals, contradiction, action_planning, recipes, each with load_when and sourcing", () => {
  const pub = published();
  const { disclosed } = renderPack(pub);
  assert.deepEqual(Object.keys(disclosed),
    [...JUDGEMENT_KEYS, "vocabularies", "acts", "bounds", "refusals", "contradiction", "action_planning", "recipes"]);
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
  /* Over the real catalogue, against an independent walk of it. */
  const expected = [];
  for (const [family, rows] of Object.entries(catalogue)) {
    if (!family.endsWith("_CHECKS") || !rows || typeof rows !== "object") continue;
    for (const [code, row] of Object.entries(rows))
      if (code.startsWith("MACHINE_CANNOT_") && row && typeof row.translation === "string" && row.translation)
        expected.push({ code, family, check: row.check ?? null, says: row.translation });
  }
  expected.sort((a, b) => (a.code < b.code ? -1 : 1));
  assert.ok(expected.length > 0);
  assert.deepEqual(machineFences(catalogue), expected);
});

test("R8 memberOnlyActs: every act whose mode is a string other than machine, sorted by id, label and prompt null when absent; a non-list gives []", () => {
  assert.deepEqual(memberOnlyActs(published().catalog), [
    { id: "act-a", label: null, mode: "admin-session", prompt: null },
    { id: "act-b", label: "Adopt a version", mode: "session", prompt: "adopt it?" },
  ]);
  assert.deepEqual(memberOnlyActs([null, 3, { id: "x", mode: 7 }, { id: "y", mode: "machine" }, { id: "z" }]), []);
  for (const odd of [undefined, null, "x", { id: "a", mode: "session" }]) assert.deepEqual(memberOnlyActs(odd), []);
});

test("R9 with no recipes published, recipes loads never, is absent, has an empty body and states why", () => {
  for (const recipes of [undefined, null, "x", { a: 1 }]) {
    const { disclosed: { recipes: layer } } = renderPack(published({ recipes }));
    assert.equal(layer.load_when, "never, in this edition");
    assert.equal(layer.sourcing, "absent");
    assert.deepEqual(layer.body, []);
    assert.equal(typeof layer.absent_because, "string");
    assert.ok(layer.absent_because.trim().length > 0);
  }
});

test("R10 published recipes are carried as data, each step a published surface and act; a step naming anything else fails the render", () => {
  const surfaces = [{ id: "s-home" }, { id: "s-queue" }];
  const recipes = [{ id: "r1", steps: [{ surface: "s-home", act: "act-b" }, { surface: "s-queue", act: "act-m" }] }];
  const { disclosed: { recipes: layer } } = renderPack(published({ surfaces, recipes }));
  assert.equal(layer.body, recipes, "the published recipes, unchanged");
  assert.equal(layer.sourcing, "driven");
  assert.ok(layer.load_when.trim() && layer.load_when !== "never, in this edition");
  const bad = [
    [[{ id: "r2", steps: [] }], /recipe r2 has no steps/],
    [[{ id: "r3" }], /recipe r3 has no steps/],
    [[{ id: "r4", steps: [{ surface: "s-nowhere", act: "act-b" }] }], /recipe r4 step 1 names the surface "s-nowhere"/],
    [[{ id: "r5", steps: [{ surface: "s-home", act: "act-b" }, { surface: "s-home", act: "act-gone" }] }],
      /recipe r5 step 2 names the act "act-gone"/],
    [[{ id: "r6", steps: [{ act: "act-b" }] }], /recipe r6 step 1 names the surface undefined/],
  ];
  for (const [rs, re] of bad) assert.throws(() => renderPack(published({ surfaces, recipes: rs })), re);
  assert.throws(() => renderPack(published({ recipes })), /names the surface "s-home"/,
    "no published surfaces: every surface is unknown");
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
