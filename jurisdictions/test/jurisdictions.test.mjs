/* jurisdictions: every live requirement id (build/requirements/jurisdictions.md), tested at the module's
 * interface: list, get, validate, combine, and the two held profiles. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { list, get, validate, combine } from "../index.mjs";
import { applyForm, recogniseIn, systemOf, walkFacts, legacy } from "./helpers.mjs";

const FIRST = "oakland-alameda";
const TEST = "test-port-ellery";
const codes = (r) => r.errors.map((e) => e.code);
const hasError = (r, code, path) => r.errors.some((e) => e.code === code && (path == null || e.path === path));
const clone = (o) => JSON.parse(JSON.stringify(o));

/* A small valid profile carrying every section, the base the negative cases break one field of. */
function sample() {
  return {
    id: "sample-town", name: "Sample Town", covers: ["Sample Town"], test: false,
    spaces: {
      enactment: {
        label: "law number",
        forms: [{ form: "n", pattern: { re: "^(\\d{3,5})$" }, normal: [{ group: 1 }], clean: { spaces: "collapse" }, basis: "M-1" }],
        kinds: [{ kind: "law", prefix: { re: "law\\s+", flags: "i" }, floor: { first: 100, system: "town.record", basis: "M-1" }, basis: "M-1" }],
      },
      project: { label: "job", forms: [
        { form: "J", pattern: { re: "^J(\\d{4})$" }, normal: ["J", { group: 1 }], clean: { strip: [{ re: "#" }], spaces: "remove", upper: true }, basis: "M-2" },
        { form: "K", pattern: { re: "^K(\\d{4})$" }, normal: ["K", { group: 1 }], clean: { spaces: "remove", upper: true }, basis: "M-2" }] },
      fund: { label: "fund", forms: [{ form: "f", pattern: { re: "^(\\d{2})$" }, normal: [{ group: 1 }], basis: "M-3" }] },
      parcel: { label: "lot", forms: [{ form: "l", pattern: { re: "^0*(\\d+)-(\\d+)?$" }, normal: [{ group: 1, unpad: true }, "-", { group: 2, default: "0" }], basis: "M-4" }] },
    },
    systems: [
      { origin: "town.record", name: "the town record", hosts: ["record.sample.example"], basis: "M-5" },
      { origin: "town.record", name: "the town record via a shared host", hosts: ["api.shared.example"], path: { re: "^/town/" }, basis: "M-5" },
      { origin: "county.roll", name: "the county roll, republished", hosts: ["open.sample.example"], path: { re: "roll" }, republishes: true, provenance_stated: false, basis: "M-5" },
    ],
    mixed_hosts: [{ host: "www.sample.example", why: "many offices", basis: "M-5" }],
    crosswalks: [{ space: "project", forms: ["J", "K"], pairs: [["J0001", "K0009"]], source: "a".repeat(64), basis: "M-6" }],
    vocabulary: {
      furniture: [{ pattern: { re: "^Sample Town$" }, basis: "M-7" }],
      bodies: [{ pattern: { re: "Council$" }, basis: "M-7" }],
      member_titles: [{ pattern: { re: "^Alder" }, basis: "M-7" }],
      enactment_markers: [{ pattern: { re: "S\\.T\\." }, basis: "M-7" }],
      codes: [{ key: "stc", label: "S.T.C.", pattern: { re: "Sample Town Code" }, basis: "M-7" }],
      file_numbers: [{ pattern: { re: "F\\d+" }, system: "town.record", basis: "M-7" }],
      report_titles: [{ pattern: { re: "^MEMO" }, basis: "M-7" }],
      report_sections: [{ pattern: { re: "^COST" }, basis: "M-7" }],
      recommendation_openers: [{ pattern: { re: "We propose" }, basis: "M-7" }],
      template_blanks: [{ pattern: { re: "\\[BLANK\\]" }, basis: "M-7" }],
    },
    practice: { minutes_due_days: { value: 14, basis: "UNMEASURED" } },
    search_terms: [{ term: "sample", basis: "UNMEASURED" }],
    records_laws: [{ level: "state", name: "Records Law", citation: "RL § 1", basis: "D-1" }],
    standard_sources: [{ source: "Sample Town Code", kind: "ordinance", issuer: "Council", cite: { re: "STC § \\d+" }, code: "stc", basis: "K1" }],
    counterparties: [{ role: "Clerk", body: "Sample Town", level: "city", elected: false, basis: "DEC-1" }],
    action_kinds: [
      { kind: "records_request", label: "records request", tier: 1, laws: ["Records Law"], venue: { name: "clerk", how: "email", basis: "M-8" }, template: "Please send {{records}}.", basis: "M-8" },
      { kind: "code_complaint", label: "complaint", tier: 3, laws: ["Sample Town Code"], venue: { name: "court", how: "court", basis: "M-8" }, basis: "M-8" },
    ],
    deadlines: [{ rule: "answer", applies_to: "records_request", days: 10, count: "calendar", starts: "received",
      extension: { days: 5, count: "business", when: "busy" }, citation: "RL § 2", basis: "M-9" }],
  };
}
const breakIt = (fn) => { const p = sample(); fn(p); return validate(p); };

/* ============================================================================================== */
/* The profile's shape: R1–R7, judged through validate.                                           */

test("R1 identity: id pattern, name, non-empty covers, test flag", () => {
  assert.equal(validate(sample()).ok, true, JSON.stringify(validate(sample()).errors));
  for (const bad of ["", "Sample", "-x", "a b", "a_b", 7, null, undefined])
    assert.ok(hasError(breakIt((p) => { p.id = bad; }), "ID_INVALID", "id"), `id ${String(bad)}`);
  for (const good of ["a", "0", "a-b-9", "oakland-alameda"]) assert.ok(!hasError(breakIt((p) => { p.id = good; }), "ID_INVALID"));
  for (const bad of ["", "  ", 3, null]) assert.ok(hasError(breakIt((p) => { p.name = bad; }), "NAME_MISSING", "name"));
  assert.ok(hasError(breakIt((p) => { delete p.name; }), "NAME_MISSING"));
  for (const bad of [[], "Town", [""], [3], null]) assert.ok(hasError(breakIt((p) => { p.covers = bad; }), "COVERS_MISSING", "covers"));
  assert.ok(hasError(breakIt((p) => { p.test = "yes"; }), "VALUE_INVALID", "test"));
  assert.ok(breakIt((p) => { delete p.test; }).ok, "test is optional");
});

test("R2 patterns ({re, flags} from i and u) and bases (measurement, dated entry, ruling, UNMEASURED; TEST only in a test profile)", () => {
  for (const b of ["M-157", "2026-07-30", "D-149", "DEC-13", "K4", "UNMEASURED", "M-119, M-132", "M-119 LEG", "M-157 (4)", "2026-08-03, M-24", "M-1; D-2"])
    assert.ok(breakIt((p) => { p.search_terms[0].basis = b; }).ok, b);
  for (const b of ["", "measured", "M-", "m-157", "Roadmap §8", "M-1,", "unmeasured", 5])
    assert.ok(breakIt((p) => { p.search_terms[0].basis = b; }).errors.some((e) => e.path === "search_terms[0].basis" && (e.code === "BASIS_INVALID" || e.code === "BASIS_MISSING")), `basis ${String(b)}`);
  assert.ok(hasError(breakIt((p) => { p.search_terms[0].basis = "TEST"; }), "BASIS_INVALID", "search_terms[0].basis"));
  assert.ok(breakIt((p) => { p.test = true; p.search_terms[0].basis = "TEST"; }).ok);
  /* Every fact carries a basis: remove each one in turn. */
  const paths = [];
  walkFacts(sample(), (fact, path) => paths.push(path));
  assert.ok(paths.length >= 25);
  for (const path of paths) {
    const r = breakIt((p) => { delete walkFacts.at(p, path).basis; });
    assert.ok(hasError(r, "BASIS_MISSING", `${path}.basis`), path);
  }
  /* Patterns: a source that compiles, flags from i and u only, each once. */
  for (const flags of ["", "i", "u", "iu", "ui"]) assert.ok(breakIt((p) => { p.vocabulary.bodies[0].pattern = { re: "x", flags }; }).ok, flags);
  for (const pat of [{ re: "(" }, { re: "x", flags: "g" }, { re: "x", flags: "ii" }, { re: "x", flags: "m" }, { re: 3 }, "x", null, { re: "x", other: 1 }])
    assert.ok(hasError(breakIt((p) => { p.vocabulary.bodies[0].pattern = pat; }), "PATTERN_INVALID", "vocabulary.bodies[0].pattern"), JSON.stringify(pat));
});

test("R3 spaces: forms, clean, normal parts, and enactment kinds with floors", () => {
  const f = get(FIRST);
  /* clean and normal remove formatting and never change a digit */
  const apn = f.spaces.parcel.forms[0];
  assert.equal(applyForm(apn, "APN 008-0649-012-00"), "8-649-12-0");
  assert.equal(applyForm(apn, "8-649-12"), "8-649-12-0");
  assert.equal(applyForm(apn, "048a-7000-001-02"), "48A-7000-1-2");
  assert.equal(applyForm(apn, "008-0649-012-03").replace(/\D/g, ""), "8649123");
  const proj = f.spaces.project.forms.find((x) => x.form === "C#####");
  assert.equal(applyForm(proj, "# c 12345"), "C12345");
  /* strip, spaces and upper are applied as R3 states */
  const t = get(TEST);
  assert.equal(applyForm(t.spaces.parcel.forms[0], "Parcel 0012/007b"), "12/7B");
  assert.equal(applyForm(t.spaces.parcel.forms[0], "12/7"), "12/7");
  /* a normal part naming a group the pattern lacks, or an unknown transform */
  assert.ok(hasError(breakIt((p) => { p.spaces.fund.forms[0].normal = [{ group: 2 }]; }), "NORMAL_INVALID", "spaces.fund.forms[0].normal[0]"));
  assert.ok(hasError(breakIt((p) => { p.spaces.fund.forms[0].normal = [{ group: 1, pad: true }]; }), "NORMAL_INVALID"));
  assert.ok(hasError(breakIt((p) => { p.spaces.fund.forms[0].normal = [{ group: 1, unpad: "yes" }]; }), "NORMAL_INVALID"));
  assert.ok(hasError(breakIt((p) => { p.spaces.fund.forms[0].normal = []; }), "NORMAL_INVALID"));
  assert.ok(hasError(breakIt((p) => { p.spaces.fund.forms[0].clean = { spaces: "squeeze" }; }), "NORMAL_INVALID", "spaces.fund.forms[0].clean"));
  assert.ok(hasError(breakIt((p) => { p.spaces.fund.forms[0].clean = { upper: false }; }), "NORMAL_INVALID"));
  assert.ok(hasError(breakIt((p) => { p.spaces.fund.forms[0].clean = { strip: [{ re: "(" }] }; }), "NORMAL_INVALID"));
  assert.ok(hasError(breakIt((p) => { p.spaces.fund.forms[0].pattern = { re: "(" }; }), "PATTERN_INVALID", "spaces.fund.forms[0].pattern"));
  assert.ok(hasError(breakIt((p) => { p.spaces.project.forms[1].form = "J"; }), "DUPLICATE_FORM", "spaces.project.forms[1].form"));
  assert.ok(hasError(breakIt((p) => { p.spaces.lot = p.spaces.parcel; }), "UNKNOWN_SPACE", "spaces.lot"));
  assert.ok(hasError(breakIt((p) => { p.spaces.fund.kinds = []; }), "UNKNOWN_SECTION", "spaces.fund.kinds"), "kinds are enactment's only");
  assert.ok(hasError(breakIt((p) => { p.spaces.enactment.kinds[0].prefix = { re: "[" }; }), "PATTERN_INVALID", "spaces.enactment.kinds[0].prefix"));
  for (const bad of [0, -1, 1.5, "100", null])
    assert.ok(hasError(breakIt((p) => { p.spaces.enactment.kinds[0].floor.first = bad; }), "VALUE_INVALID", "spaces.enactment.kinds[0].floor.first"), String(bad));
  assert.ok(hasError(breakIt((p) => { p.spaces.enactment.kinds[0].floor.system = "nowhere"; }), "SYSTEM_UNKNOWN", "spaces.enactment.kinds[0].floor.system"));
  assert.ok(breakIt((p) => { delete p.spaces.enactment.kinds[0].floor; }).ok, "a floor is optional");
});

test("R4 systems: origin, name, lower-case hosts, path pattern, republishes, provenance_stated; mixed hosts", () => {
  assert.ok(hasError(breakIt((p) => { p.systems[0].hosts = ["Record.Sample.Example"]; }), "VALUE_INVALID", "systems[0].hosts"));
  assert.ok(hasError(breakIt((p) => { p.systems[0].hosts = []; }), "VALUE_INVALID", "systems[0].hosts"));
  assert.ok(hasError(breakIt((p) => { p.systems[0].origin = ""; }), "VALUE_INVALID", "systems[0].origin"));
  assert.ok(hasError(breakIt((p) => { delete p.systems[0].name; }), "VALUE_INVALID", "systems[0].name"));
  assert.ok(hasError(breakIt((p) => { p.systems[1].path = { re: "(" }; }), "PATTERN_INVALID", "systems[1].path"));
  assert.ok(hasError(breakIt((p) => { p.systems[2].republishes = "yes"; }), "VALUE_INVALID", "systems[2].republishes"));
  assert.ok(hasError(breakIt((p) => { p.systems[2].provenance_stated = 0; }), "VALUE_INVALID", "systems[2].provenance_stated"));
  assert.ok(hasError(breakIt((p) => { p.mixed_hosts[0].host = "WWW.sample.example"; }), "VALUE_INVALID", "mixed_hosts[0].host"));
  assert.ok(hasError(breakIt((p) => { delete p.mixed_hosts[0].why; }), "VALUE_INVALID", "mixed_hosts[0].why"));
  /* A republication names the system it republishes: the first profile's portal layer is the assessor's. */
  const f = get(FIRST);
  const r = systemOf(f, "https://data.oaklandca.gov/resource/c3xp-qcgn.json");
  assert.deepEqual([r.origin, r.republishes, r.provenance_stated], ["alameda.assessor", true, false]);
});

test("R5 crosswalks: captured pairs with a content hash, never a pattern", () => {
  assert.ok(hasError(breakIt((p) => { delete p.crosswalks[0].source; }), "CROSSWALK_UNSOURCED", "crosswalks[0].source"));
  assert.ok(hasError(breakIt((p) => { p.crosswalks[0].source = "abc"; }), "VALUE_INVALID", "crosswalks[0].source"));
  assert.ok(hasError(breakIt((p) => { p.crosswalks[0].forms = ["J", "Z"]; }), "CROSSWALK_FORM_UNKNOWN", "crosswalks[0].forms[1]"));
  assert.ok(hasError(breakIt((p) => { p.crosswalks[0].pairs = [["J0001", "J0009"]]; }), "CROSSWALK_VALUE_INVALID", "crosswalks[0].pairs[0][1]"));
  assert.ok(hasError(breakIt((p) => { p.crosswalks[0].space = "lots"; }), "UNKNOWN_SPACE", "crosswalks[0].space"));
  assert.ok(hasError(breakIt((p) => { p.crosswalks[0].pairs = [["J0001"]]; }), "VALUE_INVALID", "crosswalks[0].pairs[0]"));
  assert.ok(hasError(breakIt((p) => { p.crosswalks[0].pattern = { re: "x" }; }), "UNKNOWN_SECTION", "crosswalks[0].pattern"), "a crosswalk is never a pattern");
  /* values are judged after the form's own cleaning */
  assert.ok(breakIt((p) => { p.crosswalks[0].pairs = [["# j0001", " K 0009 "]]; }).ok);
});

test("R6 vocabulary: the closed set of keys and each key's entry shape", () => {
  assert.ok(hasError(breakIt((p) => { p.vocabulary.mastheads = []; }), "UNKNOWN_VOCABULARY", "vocabulary.mastheads"));
  assert.ok(hasError(breakIt((p) => { p.vocabulary.codes[0].key = ""; }), "VALUE_INVALID", "vocabulary.codes[0].key"));
  assert.ok(hasError(breakIt((p) => { delete p.vocabulary.codes[0].label; }), "VALUE_INVALID", "vocabulary.codes[0].label"));
  assert.ok(hasError(breakIt((p) => { p.vocabulary.file_numbers[0].system = "nowhere"; }), "SYSTEM_UNKNOWN", "vocabulary.file_numbers[0].system"));
  assert.ok(hasError(breakIt((p) => { p.vocabulary.furniture[0].system = "town.record"; }), "UNKNOWN_SECTION", "vocabulary.furniture[0].system"));
  assert.ok(hasError(breakIt((p) => { p.vocabulary.bodies = "Council"; }), "VALUE_INVALID", "vocabulary.bodies"));
  for (const key of ["furniture", "bodies", "member_titles", "enactment_markers", "codes", "file_numbers", "report_titles", "report_sections", "recommendation_openers", "template_blanks"])
    assert.ok(hasError(breakIt((p) => { p.vocabulary[key][0].pattern = { re: ")" }; }), "PATTERN_INVALID", `vocabulary.${key}[0].pattern`), key);
});

test("R7 practice, search_terms and records_laws", () => {
  for (const bad of [0, -3, 2.5, "21"])
    assert.ok(hasError(breakIt((p) => { p.practice.minutes_due_days.value = bad; }), "VALUE_INVALID", "practice.minutes_due_days.value"), String(bad));
  assert.ok(hasError(breakIt((p) => { p.practice.agenda_due_days = { value: 3, basis: "M-1" }; }), "UNKNOWN_SECTION", "practice.agenda_due_days"));
  assert.ok(hasError(breakIt((p) => { p.search_terms[0].term = ""; }), "VALUE_INVALID", "search_terms[0].term"));
  assert.ok(hasError(breakIt((p) => { p.records_laws[0].level = "federal"; }), "LEVEL_UNKNOWN", "records_laws[0].level"));
  for (const level of ["state", "county", "city"]) assert.ok(breakIt((p) => { p.records_laws[0].level = level; }).ok);
  assert.ok(hasError(breakIt((p) => { delete p.records_laws[0].citation; }), "VALUE_INVALID", "records_laws[0].citation"));
});

/* ============================================================================================== */
/* list, get (R8, R9).                                                                             */

test("R8 list: every profile held, sorted by id, {id, name, covers, test}; never throws", () => {
  const l = list(list, 3, null);
  assert.deepEqual(l.map((p) => p.id), [FIRST, TEST]);
  assert.deepEqual(l.map((p) => p.id), l.map((p) => p.id).slice().sort());
  for (const p of l) {
    assert.deepEqual(Object.keys(p).sort(), ["covers", "id", "name", "test"]);
    const full = get(p.id);
    assert.deepEqual(p, { id: full.id, name: full.name, covers: full.covers, test: full.test === true });
  }
  assert.equal(l.find((p) => p.id === TEST).test, true);
  assert.equal(l.find((p) => p.id === FIRST).test, false);
});

test("R9 get: the held profile, or null for any other input; never throws", () => {
  assert.equal(get(FIRST).id, FIRST);
  assert.equal(get(TEST).id, TEST);
  for (const x of [undefined, null, "", "OAKLAND-ALAMEDA", " oakland-alameda", "nowhere", 1, {}, [], FIRST.split(""), { id: FIRST }, Symbol("x")])
    assert.equal(get(x), null, String(typeof x === "symbol" ? "symbol" : JSON.stringify(x)));
});

/* ============================================================================================== */
/* validate (R10, R11, R28).                                                                       */

test("R10 validate: ok exactly when errors is empty; {path, code, detail}; every error reported; never throws", () => {
  const r = breakIt((p) => { p.id = "Bad Id"; delete p.name; p.search_terms[0].basis = "nope"; p.records_laws[0].level = "planet"; });
  assert.equal(r.ok, false);
  assert.deepEqual(codes(r).sort(), ["BASIS_INVALID", "ID_INVALID", "LEVEL_UNKNOWN", "NAME_MISSING"]);
  for (const e of r.errors) {
    assert.deepEqual(Object.keys(e).sort(), ["code", "detail", "path"]);
    assert.equal(typeof e.path, "string"); assert.equal(typeof e.detail, "string");
  }
  assert.ok(hasError(breakIt((p) => { p.spaces.parcel.forms[0].pattern = { re: "(" }; }), "PATTERN_INVALID", "spaces.parcel.forms[0].pattern"));
  const ok = validate(sample());
  assert.deepEqual(ok, { ok: true, errors: [] });
  /* odd inputs, including ones that throw when read */
  const trap = new Proxy({}, { get() { throw new Error("boom"); }, ownKeys() { throw new Error("boom"); } });
  const cyclic = sample(); cyclic.spaces.enactment.self = cyclic;
  for (const x of [undefined, null, 3, "p", [], trap, cyclic, Object.create(null)]) {
    const v = validate(x);
    assert.equal(v.ok, v.errors.length === 0);
    assert.equal(v.ok, false);
  }
});

test("R11 validate codes: each named code is reported for its fault", () => {
  const cases = {
    NOT_A_PROFILE: () => validate([]),
    ID_INVALID: () => breakIt((p) => { p.id = "X"; }),
    NAME_MISSING: () => breakIt((p) => { p.name = ""; }),
    COVERS_MISSING: () => breakIt((p) => { p.covers = []; }),
    UNKNOWN_SECTION: () => breakIt((p) => { p.budget = []; }),
    UNKNOWN_SPACE: () => breakIt((p) => { p.spaces.zone = { label: "z", forms: [] }; }),
    UNKNOWN_VOCABULARY: () => breakIt((p) => { p.vocabulary.slogans = []; }),
    BASIS_MISSING: () => breakIt((p) => { delete p.systems[0].basis; }),
    BASIS_INVALID: () => breakIt((p) => { p.systems[0].basis = "TEST"; }),
    PATTERN_INVALID: () => breakIt((p) => { p.systems[1].path = { re: "a", flags: "x" }; }),
    NORMAL_INVALID: () => breakIt((p) => { p.spaces.project.forms[0].normal = ["J", { group: 9 }]; }),
    DUPLICATE_FORM: () => breakIt((p) => { p.spaces.project.forms.push(clone(p.spaces.project.forms[0])); }),
    SYSTEM_UNKNOWN: () => breakIt((p) => { p.systems = p.systems.filter((s) => s.origin !== "town.record"); }),
    CROSSWALK_UNSOURCED: () => breakIt((p) => { p.crosswalks[0].source = ""; }),
    CROSSWALK_FORM_UNKNOWN: () => breakIt((p) => { p.crosswalks[0].forms = ["Q", "K"]; }),
    CROSSWALK_VALUE_INVALID: () => breakIt((p) => { p.crosswalks[0].pairs.push(["X", "K0001"]); }),
    HOST_CONFLICT: () => breakIt((p) => { p.mixed_hosts.push({ host: "record.sample.example", why: "x", basis: "M-1" }); }),
    VALUE_INVALID: () => breakIt((p) => { p.practice.minutes_due_days.value = 0; }),
  };
  for (const [code, run] of Object.entries(cases)) assert.ok(codes(run()).includes(code), code);
  /* a mixed host that a system names only under a path is not a conflict */
  assert.ok(breakIt((p) => { p.mixed_hosts.push({ host: "api.shared.example", why: "shared", basis: "M-1" }); }).ok);
});

test("R28 validate codes for the action sections", () => {
  const cases = {
    SOURCE_KIND_UNKNOWN: [(p) => { p.standard_sources[0].kind = "custom"; }, "standard_sources[0].kind"],
    LEVEL_UNKNOWN: [(p) => { p.counterparties[0].level = "region"; }, "counterparties[0].level"],
    KIND_INVALID: [(p) => { p.action_kinds[0].kind = "Records-Request"; }, "action_kinds[0].kind"],
    COUNT_UNKNOWN: [(p) => { p.deadlines[0].count = "working"; }, "deadlines[0].count"],
    TIER_INVALID: [(p) => { p.action_kinds[0].tier = 4; }, "action_kinds[0].tier"],
    TEMPLATE_TIER3: [(p) => { p.action_kinds[1].template = "Sue {{them}}."; }, "action_kinds[1].template"],
    CODE_UNKNOWN: [(p) => { p.standard_sources[0].code = "xyz"; }, "standard_sources[0].code"],
    LAW_UNKNOWN: [(p) => { p.action_kinds[0].laws = ["Unknown Act"]; }, "action_kinds[0].laws[0]"],
    DEADLINE_KIND_UNKNOWN: [(p) => { p.deadlines[0].applies_to = "appeal"; }, "deadlines[0].applies_to"],
    DUPLICATE_KIND: [(p) => { p.action_kinds.push(clone(p.action_kinds[0])); }, "action_kinds[2].kind"],
  };
  for (const [code, [fn, path]] of Object.entries(cases)) assert.ok(hasError(breakIt(fn), code, path), code);
  for (const tier of [0, "1", 1.5, null]) assert.ok(hasError(breakIt((p) => { p.action_kinds[0].tier = tier; }), "TIER_INVALID"), String(tier));
  assert.ok(hasError(breakIt((p) => { p.deadlines[0].extension.count = "weeks"; }), "COUNT_UNKNOWN", "deadlines[0].extension.count"));
  assert.ok(hasError(breakIt((p) => { p.action_kinds[0].kind = "1st"; }), "KIND_INVALID"));
  assert.ok(breakIt((p) => { p.deadlines[0].applies_to = "claim"; }).ok, "claim binds a legal claim");
});

/* ============================================================================================== */
/* The action sections (R23–R27).                                                                  */

test("R23 standard_sources: source, kind from the six, issuer, cite pattern, code naming a codes key", () => {
  for (const kind of ["statute", "regulation", "ordinance", "court", "policy", "commitment"])
    assert.ok(breakIt((p) => { p.standard_sources[0].kind = kind; }).ok, kind);
  assert.ok(hasError(breakIt((p) => { p.standard_sources[0].cite = { re: "(" }; }), "PATTERN_INVALID", "standard_sources[0].cite"));
  assert.ok(hasError(breakIt((p) => { delete p.standard_sources[0].issuer; }), "VALUE_INVALID", "standard_sources[0].issuer"));
  assert.ok(breakIt((p) => { delete p.standard_sources[0].code; }).ok, "code is optional");
  assert.ok(hasError(breakIt((p) => { delete p.vocabulary.codes; }), "CODE_UNKNOWN", "standard_sources[0].code"));
});

test("R24 counterparties: role and body, never a person; level; elected", () => {
  for (const level of ["state", "county", "city", "district"]) assert.ok(breakIt((p) => { p.counterparties[0].level = level; }).ok, level);
  assert.ok(hasError(breakIt((p) => { p.counterparties[0].elected = "no"; }), "VALUE_INVALID", "counterparties[0].elected"));
  assert.ok(hasError(breakIt((p) => { delete p.counterparties[0].role; }), "VALUE_INVALID", "counterparties[0].role"));
  assert.ok(hasError(breakIt((p) => { p.counterparties[0].person = "A. Name"; }), "UNKNOWN_SECTION", "counterparties[0].person"));
});

test("R25 action_kinds: kind form, label, tier 1–3, laws, venue {name, how, basis}, template never on Tier 3", () => {
  for (const how of ["portal", "mail", "email", "in_person", "court"])
    assert.ok(breakIt((p) => { p.action_kinds[0].venue.how = how; }).ok, how);
  assert.ok(hasError(breakIt((p) => { p.action_kinds[0].venue.how = "fax"; }), "VALUE_INVALID", "action_kinds[0].venue.how"));
  assert.ok(hasError(breakIt((p) => { delete p.action_kinds[0].venue.basis; }), "BASIS_MISSING", "action_kinds[0].venue.basis"));
  assert.ok(hasError(breakIt((p) => { delete p.action_kinds[0].label; }), "VALUE_INVALID", "action_kinds[0].label"));
  assert.ok(breakIt((p) => { p.action_kinds[1].laws = ["Records Law", "Sample Town Code"]; }).ok, "laws name records_laws or standard_sources");
  /* No kind of either held profile names a place. */
  for (const id of [FIRST, TEST]) {
    const prof = get(id);
    const placeWords = prof.covers.flatMap((c) => c.toLowerCase().split(/\W+/)).filter((w) => w.length > 3 && !["city", "county"].includes(w));
    for (const k of prof.action_kinds) for (const w of placeWords) assert.ok(!k.kind.includes(w), `${k.kind} names ${w}`);
    for (const k of prof.action_kinds) if (k.tier === 3) assert.equal(k.template, undefined);
  }
});

test("R26 deadlines: rule, applies_to, days, count, starts, extension, citation", () => {
  for (const starts of ["received", "filed", "act", "known"]) assert.ok(breakIt((p) => { p.deadlines[0].starts = starts; }).ok);
  assert.ok(hasError(breakIt((p) => { p.deadlines[0].starts = "noticed"; }), "VALUE_INVALID", "deadlines[0].starts"));
  for (const days of [0, -1, 2.5, "10"]) assert.ok(hasError(breakIt((p) => { p.deadlines[0].days = days; }), "VALUE_INVALID", "deadlines[0].days"));
  assert.ok(hasError(breakIt((p) => { delete p.deadlines[0].citation; }), "VALUE_INVALID", "deadlines[0].citation"));
  assert.ok(hasError(breakIt((p) => { p.deadlines[0].extension.days = 0; }), "VALUE_INVALID", "deadlines[0].extension.days"));
  assert.ok(breakIt((p) => { delete p.deadlines[0].extension; }).ok, "extension is optional");
});

test("R27 an absent action section supplies nothing: the view has none, never a default", () => {
  const p = sample();
  for (const s of ["standard_sources", "counterparties", "action_kinds", "deadlines"]) delete p[s];
  assert.equal(validate(p).ok, true);
  const c = combine([p]);
  for (const s of ["standard_sources", "counterparties", "action_kinds", "deadlines"]) assert.equal(c.view[s], undefined, s);
  /* a kind with no tier or venue gives none in the view */
  const q = sample(); delete q.action_kinds[0].tier; delete q.action_kinds[0].venue;
  const k = combine([q]).view.action_kinds.find((x) => x.kind === "records_request");
  assert.equal(k.tier, undefined); assert.equal(k.venue, undefined);
});

/* ============================================================================================== */
/* combine (R12–R16, R29).                                                                         */

test("R12 combine: UNKNOWN_PROFILE, INVALID_PROFILE with its errors, a profile given twice combined once; never throws", () => {
  const u = combine([FIRST, "nowhere"]);
  assert.equal(u.ok, false);
  assert.deepEqual(u.errors.map((e) => [e.at, e.code]), [[1, "UNKNOWN_PROFILE"]]);
  const bad = sample(); bad.id = "Bad";
  const i = combine([bad, 7, "also-missing"]);
  assert.deepEqual(i.errors.map((e) => [e.at, e.code]), [[0, "INVALID_PROFILE"], [1, "INVALID_PROFILE"], [2, "UNKNOWN_PROFILE"]]);
  assert.deepEqual(i.errors[0].errors.map((e) => e.code), ["ID_INVALID"]);
  const twice = combine([FIRST, FIRST, get(FIRST)]);
  assert.equal(twice.ok, true);
  assert.deepEqual(twice.view.profiles, [FIRST]);
  assert.deepEqual(twice.view, combine([FIRST]).view);
  const other = get(TEST); other.id = FIRST;
  assert.equal(combine([FIRST, other]).ok, false);
  for (const x of [undefined, null, "oakland-alameda", {}, 3]) assert.equal(combine(x).ok, false);
  const trap = new Proxy([], { get() { throw new Error("boom"); } });
  assert.equal(combine(trap).ok, false);
});

test("R13 the view has the profile shape, with profiles, covers (union), test, and every fact tagged with its profile", () => {
  const c = combine([FIRST, TEST]);
  assert.equal(c.ok, true);
  const v = c.view;
  assert.deepEqual(v.profiles, [FIRST, TEST]);
  assert.deepEqual(v.covers, [...get(FIRST).covers, ...get(TEST).covers]);
  assert.equal(v.test, true);
  assert.equal(combine([FIRST]).view.test, false);
  /* every fact carries profile beside its basis, and the view reads as a profile */
  let facts = 0;
  walkFacts(v, (fact, path) => {
    facts++;
    assert.ok([FIRST, TEST].includes(fact.profile), `${path} profile`);
    assert.equal(typeof fact.basis, "string", `${path} basis`);
    assert.ok(Array.isArray(fact.bases) && fact.bases.every((b) => b.profile && b.basis), `${path} bases`);
  });
  assert.ok(facts > 60);
  const single = combine([FIRST]).view;
  for (const k of ["spaces", "systems", "mixed_hosts", "vocabulary", "practice", "search_terms", "records_laws", "standard_sources", "counterparties", "action_kinds", "deadlines"])
    assert.ok(k in single, k);
  /* a single profile's view recognises what the profile does */
  assert.equal(recogniseIn(single, "parcel", "APN 008-0649-012-00").normal, "8-649-12-0");
  assert.equal(systemOf(single, "https://oakland.legistar.com/x").origin, "oakland.legistar");
});

test("R14 lists are unioned in order; equal entries kept once carrying both bases; labels joined", () => {
  const a = sample();
  const b = sample(); b.id = "sample-two"; b.name = "Two"; b.covers = ["Two"];
  b.search_terms = [{ term: "second", basis: "M-10" }, { term: "sample", basis: "M-11" }];
  b.spaces.fund.label = "ledger fund";
  b.spaces.fund.forms[0].basis = "M-12";
  b.vocabulary.bodies = [{ pattern: { re: "Board$" }, basis: "M-13" }, { pattern: { re: "Council$" }, basis: "M-7" }];
  const c = combine([a, b]);
  assert.equal(c.ok, true, JSON.stringify(c.errors));
  assert.deepEqual(c.view.search_terms.map((t) => t.term), ["sample", "second"]);
  const s = c.view.search_terms[0];
  assert.deepEqual(s.bases, [{ profile: "sample-town", basis: "UNMEASURED" }, { profile: "sample-two", basis: "M-11" }]);
  assert.equal(s.profile, "sample-town");
  assert.deepEqual(c.view.vocabulary.bodies.map((x) => x.pattern.re), ["Council$", "Board$"]);
  assert.equal(c.view.vocabulary.bodies[0].bases.length, 2);
  assert.equal(c.view.spaces.fund.label, "fund; ledger fund");
  assert.equal(c.view.spaces.fund.forms.length, 1);
  assert.equal(c.view.spaces.fund.forms[0].bases.length, 2);
  /* order is the order given */
  const r = combine([b, a]);
  assert.deepEqual(r.view.search_terms.map((t) => t.term), ["second", "sample"]);
  assert.equal(r.view.spaces.fund.label, "ledger fund; fund");
  /* the two held profiles share no fact, so nothing merges between them */
  const both = combine([FIRST, TEST]).view;
  assert.equal(both.search_terms.length, get(FIRST).search_terms.length + get(TEST).search_terms.length);
  assert.equal(both.systems.length, get(FIRST).systems.length + get(TEST).systems.length);
});

test("R15 one-value facts are kept only when every giver agrees; otherwise withheld and reported; combine never chooses", () => {
  const a = sample();
  const b = sample(); b.id = "sample-two"; b.name = "Two"; b.covers = ["Two"];
  b.spaces.enactment.kinds[0].floor.first = 200;                          /* floor */
  b.spaces.project.forms[1].pattern = { re: "^K(\\d{5})$" };               /* a form's definition under its name */
  delete b.crosswalks;                                                     /* its pairs are no longer in form K */
  b.practice.minutes_due_days.value = 30;                                  /* practice */
  b.systems[0].origin = "other.record";                                    /* host, no path, another origin */
  b.systems.push({ origin: "town.record", name: "x", hosts: ["www.sample.example"], basis: "M-1" }); /* mixed in a, system in b */
  b.mixed_hosts = [];
  b.vocabulary.file_numbers[0].system = "other.record";
  b.spaces.enactment.kinds[0].floor.system = "other.record";
  const c = combine([a, b]);
  assert.equal(c.ok, true, JSON.stringify(c.errors));
  const at = c.conflicts.map((x) => x.at).sort();
  assert.deepEqual(at, ["mixed_hosts[www.sample.example]", "practice.minutes_due_days", "spaces.enactment.kinds[law].floor",
    "spaces.project.forms[K]", "systems[host=record.sample.example]"]);
  for (const x of c.conflicts) {
    assert.ok(x.values.length >= 2 && x.values.every((v) => v.profile && "value" in v && v.basis), x.at);
    assert.ok(typeof x.says === "string" && x.says.length > 20);
    assert.ok(new Set(x.values.map((v) => v.profile)).size >= 2);
  }
  const v = c.view;
  assert.equal(v.spaces.enactment.kinds.find((k) => k.kind === "law").floor, undefined);
  assert.equal(v.spaces.project.forms.some((f) => f.form === "K"), false);
  assert.equal(v.spaces.project.forms.some((f) => f.form === "J"), true);
  assert.equal(v.practice.minutes_due_days, undefined);
  assert.equal(systemOf(v, "https://record.sample.example/doc").origin, null);
  assert.equal(systemOf(v, "https://www.sample.example/doc").origin, null);
  assert.equal(v.mixed_hosts.some((m) => m.host === "www.sample.example"), false);
  /* a path system on a host the other profile marks mixed still names its system */
  assert.equal(systemOf(v, "https://api.shared.example/town/1").origin, "town.record");
  /* agreement keeps the fact */
  const d = sample(); d.id = "sample-three"; d.name = "Three"; d.covers = ["Three"];
  d.spaces.enactment.kinds[0].floor.basis = "M-99";
  const e = combine([a, d]);
  assert.deepEqual(e.conflicts, []);
  assert.equal(e.view.spaces.enactment.kinds[0].floor.first, 100);
  assert.equal(e.view.spaces.enactment.kinds[0].floor.bases.length, 2);
  /* different paths on one host do not conflict */
  const f = sample(); f.id = "sample-four"; f.name = "Four"; f.covers = ["Four"];
  f.systems = [{ origin: "four.record", name: "x", hosts: ["api.shared.example"], path: { re: "^/four/" }, basis: "M-1" }];
  f.vocabulary.file_numbers = []; delete f.spaces.enactment.kinds;
  assert.deepEqual(combine([a, f]).conflicts, []);
});

test("R16 an empty list gives ok and a view with no facts", () => {
  const c = combine([]);
  assert.equal(c.ok, true);
  assert.deepEqual(c.conflicts, []);
  assert.deepEqual(c.view.profiles, []);
  assert.deepEqual(c.view.covers, []);
  assert.equal(c.view.test, false);
  let facts = 0; walkFacts(c.view, () => facts++);
  assert.equal(facts, 0);
  for (const k of ["spaces", "systems", "mixed_hosts", "crosswalks", "vocabulary", "practice", "search_terms", "records_laws", "standard_sources", "counterparties", "action_kinds", "deadlines"])
    assert.equal(c.view[k], undefined, k);
});

test("R29 action facts with one value per key: a kind's tier, venue, template; a deadline's days, count, starts", () => {
  const a = sample();
  const b = sample(); b.id = "sample-two"; b.name = "Two"; b.covers = ["Two"];
  b.action_kinds[0].tier = 2;
  b.action_kinds[0].venue.how = "portal";
  b.action_kinds[0].template = "Kindly send {{records}}.";
  b.deadlines[0].days = 20; b.deadlines[0].count = "business"; b.deadlines[0].starts = "filed";
  const c = combine([a, b]);
  assert.deepEqual(c.conflicts.map((x) => x.at).sort(), ["action_kinds[records_request].template", "action_kinds[records_request].tier",
    "action_kinds[records_request].venue", "deadlines[answer/records_request].count", "deadlines[answer/records_request].days",
    "deadlines[answer/records_request].starts"]);
  const k = c.view.action_kinds.find((x) => x.kind === "records_request");
  for (const f of ["tier", "venue", "template"]) assert.equal(k[f], undefined, f);
  const d = c.view.deadlines.find((x) => x.rule === "answer");
  for (const f of ["days", "count", "starts"]) assert.equal(d[f], undefined, f);
  /* the other kind agrees and keeps its facts */
  const other = c.view.action_kinds.find((x) => x.kind === "code_complaint");
  assert.equal(other.tier, 3); assert.equal(other.venue.how, "court");
  /* agreeing profiles keep every value */
  const same = sample(); same.id = "sample-three"; same.name = "Three"; same.covers = ["Three"];
  const e = combine([a, same]);
  assert.deepEqual(e.conflicts, []);
  const kk = e.view.action_kinds.find((x) => x.kind === "records_request");
  assert.equal(kk.tier, 1); assert.equal(kk.venue.how, "email"); assert.equal(kk.template, "Please send {{records}}.");
  assert.equal(e.view.deadlines[0].days, 10);
});

/* ============================================================================================== */
/* Invariants (R17–R22, R30).                                                                      */

test("R17 pure: no store, no network, no clock; the same inputs give the same answer", async () => {
  const saved = { fetch: globalThis.fetch, now: Date.now, random: Math.random };
  const calls = [];
  globalThis.fetch = () => { calls.push("fetch"); throw new Error("network"); };
  Date.now = () => { calls.push("clock"); throw new Error("clock"); };
  Math.random = () => { calls.push("random"); throw new Error("random"); };
  try {
    const mod = await import(`../index.mjs?fresh=${1}`);
    const runs = () => JSON.stringify([mod.list(), mod.get(FIRST), mod.get(TEST), mod.validate(sample()),
      mod.combine([FIRST, TEST]), mod.combine([sample(), TEST])]);
    const one = runs();
    assert.equal(runs(), one);
    assert.equal(JSON.stringify([list(), get(FIRST), get(TEST), validate(sample()), combine([FIRST, TEST]), combine([sample(), TEST])]), one);
  } finally {
    globalThis.fetch = saved.fetch; Date.now = saved.now; Math.random = saved.random;
  }
  assert.deepEqual(calls, []);
});

test("R18 what get and combine return is the caller's own copy", () => {
  const before = JSON.stringify([get(FIRST), combine([FIRST, TEST]), list()]);
  const g = get(FIRST);
  g.spaces.enactment.kinds[0].floor.first = 1; g.systems.length = 0; g.covers.push("X"); g.id = "changed";
  const c = combine([FIRST, TEST]);
  c.view.spaces.parcel.forms.length = 0; c.view.covers.length = 0; c.view.vocabulary.codes[0].bases.push({}); c.conflicts.push({});
  const l = list(); l[0].covers.push("Y"); l.pop();
  const obj = sample();
  const v = combine([obj]).view; v.search_terms[0].term = "mutated";
  assert.equal(obj.search_terms[0].term, "sample");
  obj.search_terms[0].term = "changed-after";
  assert.equal(v.search_terms[0].term, "mutated");
  assert.equal(JSON.stringify([get(FIRST), combine([FIRST, TEST]), list()]), before);
});

test("R19 every held profile passes validate, and no two share an id", () => {
  const ids = list().map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.deepEqual(validate(get(id)), { ok: true, errors: [] }, id);
});

test("R20 no service treats a profile by its identity", () => {
  for (const id of [FIRST, TEST]) {
    const orig = get(id);
    const renamed = { ...get(id), id: "renamed-x", name: "Renamed", covers: ["Somewhere Else"] };
    assert.deepEqual(validate(renamed), validate(orig));
    const scrub = (view) => JSON.parse(JSON.stringify(view, (k, val) =>
      (["id", "name", "covers", "profile", "profiles"].includes(k) ? undefined : val)));
    assert.deepEqual(scrub(combine([renamed]).view), scrub(combine([orig]).view));
    assert.deepEqual(scrub(combine([renamed, TEST === id ? FIRST : TEST])), scrub(combine([orig, TEST === id ? FIRST : TEST])));
  }
});

test("R21 the first profile holds every local fact of the snapshot's code, and matches every string that code matched", () => {
  const f = get(FIRST);
  assert.deepEqual(f.covers, ["City of Oakland", "Alameda County"]);
  assert.equal(f.test, false);
  /* spaces: labels, forms, kinds, floors with their system */
  assert.deepEqual(Object.keys(f.spaces).sort(), ["enactment", "fund", "parcel", "project"]);
  for (const [sp, old] of [["enactment", "cms"], ["project", "project"], ["fund", "fund"], ["parcel", "apn"]]) {
    assert.equal(f.spaces[sp].label, legacy.ID_SPACES[old].label, sp);
    assert.deepEqual(f.spaces[sp].forms.map((x) => x.form), legacy.ID_SPACES[old].forms.map((x) => x.form), sp);
  }
  assert.deepEqual(Object.fromEntries(f.spaces.enactment.kinds.map((k) => [k.kind, k.floor.first])), legacy.CMS_FLOOR);
  for (const k of f.spaces.enactment.kinds) assert.equal(k.floor.system, "oakland.legistar");
  assert.equal(f.crosswalks, undefined, "M-157: none captured");
  /* recognition: every string the legacy recogniser matched, the profile matches with the same form,
     normal and kind, over a generated corpus and the measured values */
  const corpus = legacy.corpus();
  assert.ok(corpus.length > 2000);
  const view = combine([FIRST]).view;
  let matched = 0;
  for (const [space, old] of [["enactment", "cms"], ["project", "project"], ["fund", "fund"], ["parcel", "apn"]])
    for (const value of corpus) {
      const was = legacy.recognise(old, value);
      const now = recogniseIn(view, space, value);
      if (!was) { assert.equal(now, null, `${space} ${JSON.stringify(value)} newly matched`); continue; }
      matched++;
      assert.ok(now, `${space} ${JSON.stringify(value)} no longer matched`);
      assert.deepEqual([now.form, now.normal], [was.form, was.normal], `${space} ${JSON.stringify(value)}`);
      if (space === "enactment") assert.equal(now.kind, was.kind, value);
    }
  assert.ok(matched > 500, `${matched}`);
  /* systems: every legacy entry, in order, with the same answers for their addresses */
  assert.equal(f.systems.length, legacy.ID_SYSTEMS.length);
  for (const address of legacy.addresses()) {
    const was = legacy.systemOfAddress(address);
    const now = systemOf(view, address);
    assert.deepEqual([now.origin, now.republishes === true, now.provenance_stated !== false, !!now.mixed],
      [was.origin, !!was.republication, was.origin ? was.provenance_stated : true, !!was.mixed], address);
  }
  assert.deepEqual(f.mixed_hosts.map((m) => m.host).sort(), Object.keys(legacy.MIXED_HOSTS).sort());
  /* vocabulary: each recogniser's local pattern has an entry matching the same lines */
  for (const [key, samples] of Object.entries(legacy.vocabularySamples())) {
    const entries = f.vocabulary[key];
    assert.ok(entries && entries.length, key);
    for (const [line, expect] of samples) {
      const hit = entries.some((e) => new RegExp(e.pattern.re, e.pattern.flags || "").test(line));
      assert.equal(hit, expect, `${key}: ${JSON.stringify(line)}`);
    }
  }
  assert.deepEqual(f.vocabulary.codes.map((c) => [c.key, c.label]), [["omc", "O.M.C."]]);
  assert.deepEqual(f.vocabulary.file_numbers.map((x) => x.system), ["oakland.legistar"]);
  /* practice, search terms, records law */
  assert.deepEqual(f.practice.minutes_due_days, { value: legacy.MINUTES_DUE_DAYS, basis: "UNMEASURED" });
  assert.deepEqual(f.search_terms.map((t) => t.term), legacy.SEARCH_TERMS);
  assert.deepEqual(f.records_laws.map((l) => [l.level, l.name]), [["state", "California Public Records Act"]]);
  assert.equal(f.records_laws[0].basis, "D-149");
  /* every basis names a measurement or ruling, or says UNMEASURED */
  walkFacts(f, (fact, path) => assert.match(fact.basis, /^(UNMEASURED|(M-\d+|\d{4}-\d{2}-\d{2}|D-\d+|DEC-\d+|K\d+)( [^\s,;]+)?([,;] (M-\d+|\d{4}-\d{2}-\d{2}|D-\d+|DEC-\d+|K\d+)( [^\s,;]+)?)*)$/, path));
});

test("R22 the test profile: test true, every basis TEST, every section and vocabulary key of the first with different values, no shared host", () => {
  const t = get(TEST), f = get(FIRST);
  assert.equal(t.test, true);
  let n = 0;
  walkFacts(t, (fact, path) => { n++; assert.equal(fact.basis, "TEST", path); });
  assert.ok(n > 30);
  for (const sec of Object.keys(f)) {
    if (["id", "name", "covers", "test"].includes(sec)) continue;
    assert.ok(sec in t, `section ${sec}`);
    assert.notDeepEqual(t[sec], f[sec], sec);
  }
  for (const sp of Object.keys(f.spaces)) {
    assert.ok(t.spaces[sp], sp);
    assert.notEqual(t.spaces[sp].label, f.spaces[sp].label);
    for (const form of t.spaces[sp].forms) assert.ok(!f.spaces[sp].forms.some((x) => x.form === form.form || x.pattern.re === form.pattern.re), `${sp} ${form.form}`);
  }
  assert.ok(t.spaces.enactment.kinds.length);
  for (const key of Object.keys(f.vocabulary)) {
    assert.ok(t.vocabulary[key] && t.vocabulary[key].length, key);
    const fr = new Set(f.vocabulary[key].map((e) => e.pattern.re));
    for (const e of t.vocabulary[key]) assert.ok(!fr.has(e.pattern.re), `${key} ${e.pattern.re}`);
  }
  assert.notEqual(t.practice.minutes_due_days.value, f.practice.minutes_due_days.value);
  const hosts = (p) => new Set([...p.systems.flatMap((s) => s.hosts), ...p.mixed_hosts.map((m) => m.host)]);
  const fh = hosts(f);
  for (const h of hosts(t)) assert.ok(!fh.has(h), h);
  for (const c of t.covers) assert.ok(!f.covers.includes(c));
  /* combining the two gives no conflict: they share nothing */
  assert.deepEqual(combine([FIRST, TEST]).conflicts.filter((c) => !c.at.startsWith("practice") && !c.at.startsWith("action_kinds[records_request]")), []);
});

test("R30 the first profile's action sections: the snapshot's action kinds renamed, §8 tiers, the records law's period and citation, the offices", () => {
  const f = get(FIRST);
  const renamed = legacy.ACTION_KINDS.map((k) => (k === "cpra_request" ? "records_request" : k));
  assert.deepEqual(f.action_kinds.map((k) => k.kind), renamed);
  for (const k of f.action_kinds) assert.match(k.kind, /^[a-z][a-z0-9_]*$/);
  /* Roadmap v5 §8 names Tier 1 for records requests, grand jury complaints, State Controller referrals and
     media outreach, and no tier for the others; D-182 adopted §8's words. */
  const tiers = Object.fromEntries(f.action_kinds.map((k) => [k.kind, k.tier]));
  assert.deepEqual(tiers, { records_request: 1, grand_jury: 1, controller_referral: 1, public_comment: undefined,
    media: 1, litigation_support: undefined, request_for_comment: undefined, other: undefined });
  for (const k of f.action_kinds) if (k.tier !== undefined) assert.equal(k.basis, "D-182", k.kind);
  const rr = f.action_kinds.find((k) => k.kind === "records_request");
  assert.deepEqual(rr.laws, ["California Public Records Act"]);
  const d = f.deadlines.find((x) => x.applies_to === "records_request");
  assert.deepEqual([d.days, d.count, d.starts, d.citation], [10, "calendar", "received", "Cal. Gov. Code § 7922.535"]);
  assert.equal(d.basis, "UNMEASURED");
  assert.ok(f.counterparties.length >= 3);
  for (const c of f.counterparties) assert.ok(!/\b[A-Z][a-z]+ [A-Z][a-z]+\b/.test(c.role) || /Controller|Council|Grand Jury/.test(c.role), `role names an office: ${c.role}`);
  const bodies = f.counterparties.map((c) => c.body).join(" | ");
  for (const office of ["Grand Jury", "State Controller", "City Council", "Finance"]) assert.ok(bodies.includes(office), office);
  /* the test profile supplies every action section too */
  const t = get(TEST);
  for (const s of ["standard_sources", "counterparties", "action_kinds", "deadlines"]) assert.ok(t[s] && t[s].length, s);
  assert.ok(t.deadlines.some((x) => x.applies_to === "claim"));
  assert.ok(t.action_kinds.some((x) => x.tier === 3 && x.template === undefined));
});

/* ============================================================================================== */
/* K44 (Q1): the sentences added to R2, R12, R13, R14, R25 and R29.                                */

test("R2 K44 basis grammar: tokens, a qualifying word, joined by ', ' or '; '", () => {
  for (const b of ["M-1 LEG", "K12; DEC-3", "2026-08-03, M-24", "D-149 (4)"]) assert.ok(breakIt((p) => { p.systems[0].basis = b; }).ok, b);
  for (const b of ["LEG M-1", "M-1 and M-2", "X-1", "M-1,,M-2", "2026-8-3"])
    assert.ok(hasError(breakIt((p) => { p.systems[0].basis = b; }), "BASIS_INVALID", "systems[0].basis"), b);
});

test("R12 K44 combine errors: two profiles under one id, a list that is not an array, an unknown entry field", () => {
  const other = get(TEST); other.id = FIRST;
  const two = combine([FIRST, other]);
  assert.deepEqual(two.errors.map((e) => [e.at, e.code]), [[1, "INVALID_PROFILE"]]);
  for (const x of [undefined, null, FIRST, { 0: FIRST, length: 1 }, 3])
    assert.deepEqual(combine(x).errors.map((e) => e.code), ["NOT_A_LIST"], String(x));
  const extra = sample(); extra.search_terms[0].weight = 2;
  const c = combine([extra]);
  assert.equal(c.ok, false);
  assert.equal(c.errors[0].code, "INVALID_PROFILE");
  assert.deepEqual(c.errors[0].errors.map((e) => [e.path, e.code]), [["search_terms[0].weight", "UNKNOWN_SECTION"]]);
});

test("R13 K44 the view's id is the combined ids joined by '+', and it has a name", () => {
  const v = combine([FIRST, TEST]).view;
  assert.equal(v.id, `${FIRST}+${TEST}`);
  assert.equal(combine([TEST, FIRST]).view.id, `${TEST}+${FIRST}`);
  assert.equal(combine([FIRST]).view.id, FIRST);
  assert.ok(typeof v.name === "string" && v.name.includes(get(FIRST).name) && v.name.includes(get(TEST).name));
});

test("R25 K44 tier and venue are optional; absent, they are undetermined", () => {
  assert.ok(breakIt((p) => { delete p.action_kinds[0].tier; delete p.action_kinds[0].venue; }).ok);
  assert.ok(breakIt((p) => { delete p.action_kinds[0].tier; delete p.action_kinds[0].venue; delete p.action_kinds[0].template; delete p.action_kinds[0].laws; }).ok);
  assert.ok(hasError(breakIt((p) => { p.action_kinds[0].venue = null; }), "VALUE_INVALID", "action_kinds[0].venue"));
  const f = get(FIRST);
  for (const k of f.action_kinds.filter((x) => x.tier === undefined)) assert.equal(k.venue, undefined, k.kind);
});

test("R29 K44 labels and citations joined with '; ', laws unioned, an extension one value per key", () => {
  const a = sample();
  const b = sample(); b.id = "sample-two"; b.name = "Two"; b.covers = ["Two"];
  b.records_laws.push({ level: "city", name: "Open Town Bylaw", citation: "OTB § 1", basis: "M-1" });
  b.action_kinds[0].label = "request for records";
  b.action_kinds[0].laws = ["Open Town Bylaw", "Records Law"];
  b.deadlines[0].citation = "RL § 2(a)";
  b.deadlines[0].extension = { days: 7, count: "business", when: "busy" };
  const c = combine([a, b]);
  const k = c.view.action_kinds.find((x) => x.kind === "records_request");
  assert.equal(k.label, "records request; request for records");
  assert.deepEqual(k.laws, ["Records Law", "Open Town Bylaw"]);
  const d = c.view.deadlines.find((x) => x.rule === "answer");
  assert.equal(d.citation, "RL § 2; RL § 2(a)");
  assert.equal(d.extension, undefined);
  assert.deepEqual(c.conflicts.map((x) => x.at), ["deadlines[answer/records_request].extension"]);
  const same = sample(); same.id = "sample-three"; same.name = "Three"; same.covers = ["Three"];
  const e = combine([a, same]);
  assert.equal(e.view.action_kinds[0].label, "records request");
  assert.deepEqual(e.view.deadlines[0].extension, { days: 5, count: "business", when: "busy" });
  assert.equal(e.view.deadlines[0].citation, "RL § 2");
});
