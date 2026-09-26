/* The id-spaces module's requirement-named tests (build/requirements/id-spaces.md).
 * Every test calls the module's exported services with views combined from the test profiles in
 * ./fixtures.mjs and checks the result against the requirement its title names. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as M from "../../../src/idspaces.mjs";
import { HARBOR, LAKESHORE, DISSENT, UNMEASURED, combine, viewOf } from "./fixtures.mjs";

const { spaces, recognise, reach, parcelStanding, systemOf, judgePair } = M;
const H = viewOf(HARBOR);
const L = viewOf(LAKESHORE);
const HL = viewOf(HARBOR, LAKESHORE);
const EMPTY = viewOf();
const SPACE_NAMES = ["enactment", "project", "fund", "parcel"];
const JUNK = [undefined, null, 0, 1, "", "x", [], {}, NaN, Symbol("s"), () => 1, new Map(), { spaces: 5, systems: "x" },
  { spaces: { enactment: { forms: [null, 3, { form: "bad", pattern: { re: "(" } }], kinds: [null, { kind: 3 }] } } }];

/* Every end the judge can meet, over the harbor view. */
const A = {
  legis: "https://api.legisvendor.test/v1/harbor/matters/10219",
  legis2: "https://harbor.legisvendor.test/LegislationDetail.aspx?ID=1",
  budget: "https://data.harbor.test/resource/budget-lines.csv?project=C329142",
  budget2: "https://data.harbor.test/api/views/budget-lines/rows.csv",
  portal: "https://data.harbor.test/resource/parcel-layer.json?apn=011-0836-017-00",
  county: "https://gis.county.test/arcgis/rest/services/Parcels/FeatureServer/0",
  www: "https://www.harbor.test/documents/budget-book.pdf",
  otherclient: "https://api.legisvendor.test/v1/elsewhere/matters/1",
  auditor: "https://auditor.harbor.test/reports/1",
};
const end = (view, space, value, address, name) => ({ rec: recognise(view, space, value), system: systemOf(view, [address]), name });

/* ---------------------------------------------------------------- spaces */

test("R1 spaces lists the four spaces, each with the forms the view supplies and its referent", () => {
  for (const view of [H, L, HL, EMPTY]) {
    const s = spaces(view);
    assert.deepEqual(s.map((x) => x.space), SPACE_NAMES);
    for (const x of s) {
      assert.equal(x.referent, x.space === "fund" ? "name" : "reading");
      assert.equal(typeof x.label, "string");
      assert.ok(x.label.length > 0);
      const want = (view.spaces[x.space] && view.spaces[x.space].forms) || [];
      assert.deepEqual(x.forms.map((f) => f.form), want.map((f) => f.form));
    }
  }
  assert.equal(spaces(H).find((x) => x.space === "project").label, "project or capital improvement number");
  assert.equal(spaces(HL).find((x) => x.space === "project").label, "project or capital improvement number; works number");
  assert.deepEqual(spaces(L).find((x) => x.space === "fund").forms, [], "a space with no form in the view is listed with forms: []");
  for (const j of JUNK) assert.deepEqual(spaces(j).map((x) => [x.space, x.forms.length > 0 || x.forms.length === 0]),
    SPACE_NAMES.map((n) => [n, true]), "never throws");
});

test("R2 a space has several forms at once, told apart by the value's shape alone", () => {
  assert.deepEqual(spaces(H).find((x) => x.space === "project").forms.map((f) => f.form),
    ["C#####", "P#####", "100xxxx", "100xxxx+suffix"]);
  const forms = { C329142: "C#####", P12345: "P#####", "1003439": "100xxxx", "1003439A": "100xxxx+suffix" };
  for (const [v, form] of Object.entries(forms)) assert.equal(recognise(H, "project", v).form, form, v);
  /* the same value always takes the same form: nothing about a date enters the result */
  assert.deepEqual(Object.keys(recognise(H, "project", "C329142")).sort(), ["form", "normal", "space", "value"]);
  /* two jurisdictions' forms held together are still told apart by shape */
  assert.equal(recognise(HL, "project", "W-10001").form, "W-#####");
  assert.equal(recognise(HL, "project", "07-001").form, "##-###");
  assert.equal(recognise(HL, "project", "C329142").form, "C#####");
});

/* ---------------------------------------------------------------- recognise */

test("R3 recognise returns null for an unknown space, an empty value, or a value of no form's shape", () => {
  for (const sp of ["zipcode", "cms", "apn", "", null, undefined, 5, "Enactment", "__proto__", "constructor", "toString"])
    assert.equal(recognise(H, sp, "12345"), null, String(sp));
  for (const v of ["", "   ", null, undefined, {}, [], true]) for (const sp of SPACE_NAMES) assert.equal(recognise(H, sp, v), null);
  assert.equal(recognise(H, "fund", "31000"), null);
  assert.equal(recognise(H, "project", "X329142"), null);
  assert.equal(recognise(H, "parcel", "not a parcel"), null);
  assert.equal(recognise(H, "enactment", "Ordinance No."), null);
  assert.equal(recognise(L, "fund", "3100"), null, "a space with no form recognises nothing");
  assert.equal(recognise(EMPTY, "project", "C329142"), null);
  for (const j of JUNK) for (const sp of SPACE_NAMES) assert.equal(recognise(j, sp, "12345 H.C."), null, "never throws");
});

test("R4 normal removes formatting only (spacing, case, a prefix, zero-padding) and never changes a digit", () => {
  const same = [
    ["enactment", ["H.C. 87551", "87551 HC", "87551", " 87551 h.c. "], "87551"],
    ["project", ["#c329142", " C329142 ", "c 329 142", "# C329142"], "C329142"],
    ["parcel", ["011-0836-017-00", "11-836-17", "APN 11-836-17-0", "apn 011 - 0836 - 017"], "11-836-17-0"],
  ];
  for (const [sp, vs, normal] of same) for (const v of vs) assert.equal(recognise(H, sp, v).normal, normal, `${sp} ${v}`);
  assert.equal(recognise(L, "enactment", "ls-0042").normal, "LS-42");
  assert.equal(recognise(L, "parcel", "123  456 789").normal, "123456789");
  assert.equal(recognise(H, "project", "1003439A").normal, "1003439A", "a suffix is part of the value");
  /* No digit is ever changed: the value's digit runs, zero-padding removed, lead the normal's. */
  const runs = (s) => (String(s).match(/\d+/g) || []).map((d) => d.replace(/^0+(?=.)/, ""));
  const samples = ["0001-02-003-04", "9-9-9", "A-0000-0", "12274", "009917", "C000001", "P999999", "1000000", "0000"];
  for (const view of [H, L, HL]) for (const sp of SPACE_NAMES) for (const v of [...samples, ...same.flatMap((x) => x[1])]) {
    const r = recognise(view, sp, v);
    if (!r) continue;
    assert.ok(runs(r.normal).join("").startsWith(runs(v).join("")), `${sp} ${v} → ${r.normal}`);
  }
  assert.notEqual(recognise(H, "enactment", "9917").normal, recognise(H, "enactment", "99170").normal);
  assert.equal(recognise(H, "enactment", "09917").normal, "09917", "a padded enactment is kept as written unless the form unpads it");
});

test("R5 an enactment gives its kind (as the profile names it, or null) and its reach", () => {
  const r = recognise(H, "enactment", "Resolution No. 59916 H.C.");
  assert.equal(r.kind, "resolution");
  assert.deepEqual(r.reach, reach(H, 59916, "resolution"));
  assert.equal(r.reach.reach, "OUTSIDE_REACH");
  assert.equal(recognise(H, "enactment", "ordinance number 12274").kind, "ordinance");
  const bare = recognise(H, "enactment", "13035 H.C.");
  assert.equal(bare.kind, null);
  assert.deepEqual(bare.reach, reach(H, 13035));
  const lake = recognise(L, "enactment", "Bylaw No. LS-0042");
  assert.deepEqual([lake.kind, lake.normal, lake.reach.reach], ["bylaw", "LS-42", "UNDETERMINED"],
    "a normal that is not a bare number is never compared with a floor");
  assert.equal(recognise(L, "enactment", "Ordinance No. LS-42"), null, "a kind the view does not name is no prefix");
  for (const sp of ["project", "fund", "parcel"]) {
    const x = recognise(H, sp, sp === "parcel" ? "11-836-17" : sp === "fund" ? "3100" : "C329142");
    assert.ok(!("kind" in x) && !("reach" in x), sp);
  }
});

/* ---------------------------------------------------------------- reach */

test("R6 with a kind, reach is INSIDE at or above that kind's floor and OUTSIDE_REACH below it", () => {
  for (const [kind, first] of [["ordinance", 12274], ["resolution", 75950]]) {
    for (const n of [first, first + 1, first * 10]) {
      const r = reach(H, n, kind);
      assert.deepEqual([r.reach, r.floor], ["INSIDE", first]);
    }
    for (const n of [first - 1, 1, 0]) assert.deepEqual([reach(H, n, kind).reach, reach(H, n, kind).floor], ["OUTSIDE_REACH", first]);
    assert.equal(reach(H, String(first), kind).reach, "INSIDE", "a numeric string is a number");
  }
  assert.equal(reach(L, 99, "bylaw").reach, "OUTSIDE_REACH");
  assert.equal(reach(L, 100, "bylaw").reach, "INSIDE");
  assert.match(reach(H, 12274, "ordinance").says, /12274/);
});

test("R7 with no kind, reach is OUTSIDE_REACH below every floor, INSIDE at or above every floor, else UNDETERMINED", () => {
  assert.equal(reach(H, 12273).reach, "OUTSIDE_REACH");
  assert.equal(reach(H, 75950).reach, "INSIDE");
  for (const n of [12274, 13035, 75949]) {
    const r = reach(H, n);
    assert.equal(r.reach, "UNDETERMINED");
    assert.match(r.says, /ordinance 12274/);
    assert.match(r.says, /resolution 75950/);
    assert.match(r.says, /inside the reach for some kinds and outside it for others/);
  }
  for (const n of [1, 12273]) assert.match(reach(H, n).says, /below every kind's coverage floor \(ordinance 12274, resolution 75950\)/);
  assert.match(reach(H, 80000).says, /at or above every kind's coverage floor/);
  /* a kind with no floor leaves every bare number undetermined, saying why */
  const U = viewOf(HARBOR, UNMEASURED);
  for (const n of [1, 13035, 99999]) {
    const r = reach(U, n);
    assert.equal(r.reach, "UNDETERMINED");
    assert.match(r.says, /no coverage floor is measured for proclamation/);
  }
  assert.equal(reach(EMPTY, 5).reach, "UNDETERMINED");
});

test("R8 OUTSIDE_REACH is never reported as not found: says states the source holds nothing that old", () => {
  const outs = [reach(H, 59916, "resolution"), reach(H, 1, "ordinance"), reach(H, 100), reach(L, 5, "bylaw"),
    recognise(H, "enactment", "Resolution No. 59916").reach];
  for (const r of outs) {
    assert.equal(r.reach, "OUTSIDE_REACH");
    assert.match(r.says, /OUTSIDE THE RECORD'S REACH/);
    assert.match(r.says, /holds (no \w+|nothing) that old/);
    assert.doesNotMatch(r.says, /not found|does not exist|no such/i);
  }
  assert.match(reach(H, 59916, "resolution").says, /the Harbor legislative record/, "the source is named from the view");
});

test("R9 with no floor for the kind, reach is UNDETERMINED and says why: none measured, or conflicting floors", () => {
  const none = reach(viewOf(HARBOR, UNMEASURED), 5, "proclamation");
  assert.equal(none.reach, "UNDETERMINED");
  assert.match(none.says, /no coverage floor is measured for proclamation/);
  assert.ok(!("floor" in none));
  const unknownKind = reach(H, 5, "bylaw");
  assert.equal(unknownKind.reach, "UNDETERMINED");
  assert.match(unknownKind.says, /no coverage floor is measured/);
  const D = viewOf(HARBOR, DISSENT);
  assert.equal(D.conflicts.length, 1, "the fixture's combine reports the conflict");
  for (const n of [1, 12100, 99999]) {
    const r = reach(D, n, "ordinance");
    assert.equal(r.reach, "UNDETERMINED");
    assert.match(r.says, /conflicting coverage floors for ordinance/);
    assert.match(r.says, /test-harbor gives 12274/);
    assert.match(r.says, /test-dissent gives 12000/);
  }
  assert.equal(reach(D, 80000, "resolution").reach, "INSIDE", "a floor not in conflict still decides");
  assert.match(reach(D, 80000).says, /conflicting coverage floors for ordinance/);
  assert.equal(reach(D, 80000).reach, "UNDETERMINED");
  /* the whole combine result is accepted too, with its conflicts */
  assert.match(reach(combine([HARBOR, DISSENT]), 5, "ordinance").says, /conflicting coverage floors/);
  for (const j of JUNK) for (const n of [5, "x", null, NaN, Infinity]) {
    const r = reach(j, n, "ordinance");
    assert.equal(r.reach, "UNDETERMINED", "never throws");
  }
});

/* ---------------------------------------------------------------- parcelStanding */

const lineage = new Map([["11-836-17-0", [{ roll_year: 2016, children: ["11-836-41-0", "11-836-40-0"] },
                                           { roll_year: 2014, children: ["11-836-40-0", "11-836-39-0"] }]]]);

test("R10 parcelStanding is CURRENT when the key is in the current layer", () => {
  for (const current of [new Set(["10-787-33-0"]), ["10-787-33-0"]]) {
    const r = parcelStanding("10-787-33-0", { current, lineage, vintages: ["current layer"] });
    assert.deepEqual([r.standing, r.vintages_searched], ["CURRENT", ["current layer"]]);
  }
  const both = parcelStanding("11-836-17-0", { current: new Set(["11-836-17-0"]), lineage });
  assert.equal(both.standing, "CURRENT", "the current layer decides before the lineage");
});

test("R11 otherwise RETIRED only when the lineage records the key: earliest roll year, every child deduplicated and sorted", () => {
  for (const lin of [lineage, Object.fromEntries(lineage)]) {
    const r = parcelStanding("11-836-17-0", { current: new Set(), lineage: lin, vintages: ["lineage 2005..2026"] });
    assert.deepEqual([r.standing, r.roll_year, r.children, r.vintages_searched],
      ["RETIRED", 2014, ["11-836-39-0", "11-836-40-0", "11-836-41-0"], ["lineage 2005..2026"]]);
  }
  const one = parcelStanding("k", { lineage: { k: { roll_year: 2001, children: ["b", "a", "b"] } } });
  assert.deepEqual([one.standing, one.roll_year, one.children], ["RETIRED", 2001, ["a", "b"]]);
  assert.notEqual(parcelStanding("k", { lineage: { k: [] } }).standing, "RETIRED", "an empty record records nothing");
  assert.notEqual(parcelStanding("toString", { lineage: {} }).standing, "RETIRED", "an inherited name is not a record");
});

test("R12 otherwise UNDETERMINED, between retired-before-the-lineage and never-a-parcel, naming the vintages searched", () => {
  const none = parcelStanding("33-2130-35-0", { current: new Set(), lineage, vintages: ["current layer", "lineage 2005..2026"] });
  assert.deepEqual([none.standing, none.vintages_searched], ["UNDETERMINED", ["current layer", "lineage 2005..2026"]]);
  assert.match(none.says, /in none of the 2 published vintage\(s\) searched/);
  assert.match(none.says, /retired before the earliest published lineage and never a parcel/);
  const held = parcelStanding("33-2130-35-0");
  assert.equal(held.standing, "UNDETERMINED");
  assert.deepEqual(held.vintages_searched, []);
  assert.match(held.says, /no published vintage .* is held, so none was searched/);
  for (const r of [none, held]) assert.doesNotMatch(r.says, /no such parcel|does not exist|not found/i);
  for (const ev of [undefined, null, 5, "x", [], { current: 3, lineage: "x", vintages: {} }, { lineage: new Map([["k", 3]]) }])
    for (const key of [undefined, null, "k", 3, {}]) assert.equal(parcelStanding(key, ev).standing, "UNDETERMINED", "never throws");
});

/* ---------------------------------------------------------------- systemOf */

test("R13 an address names the first matching system by host and, where given, path; a republication names what it republishes", () => {
  const cases = [
    [A.legis, "harbor.legis", false], [A.legis2, "harbor.legis", false], [A.budget, "harbor.budget", false],
    [A.portal, "county.assessor", true], [A.county, "county.assessor", false], [A.auditor, "harbor.auditor", false],
  ];
  for (const [addr, origin, republication] of cases) {
    const s = systemOf(H, [addr]);
    assert.deepEqual([s.origin, s.republication, s.addresses], [origin, republication, [addr]], addr);
    assert.equal(typeof s.name, "string");
    assert.equal(s.basis, "TEST");
  }
  assert.deepEqual([systemOf(H, [A.portal]).provenance_stated, systemOf(H, [A.county]).provenance_stated], [false, true]);
  assert.equal(systemOf(H, A.legis).origin, "harbor.legis", "one address may be given bare");
  assert.equal(systemOf(H, ["HTTPS://API.LEGISVENDOR.TEST/v1/HARBOR/x"]).origin, "harbor.legis", "host case is ignored");
  assert.equal(systemOf(H, [A.otherclient]).origin, null, "a path that does not match names no system");
  /* first match wins: two entries for one host, told apart by path, in view order */
  const first = viewOf({ ...HARBOR, systems: [{ origin: "one", name: "one", hosts: ["h.test"], basis: "TEST" },
                                             { origin: "two", name: "two", hosts: ["h.test"], basis: "TEST" }] });
  assert.equal(systemOf(first, ["https://h.test/x"]).origin, "one");
  assert.equal(systemOf(L, ["https://clerk.lakeshore.test/b/1"]).origin, "lake.clerk");
  assert.equal(systemOf(L, [A.legis]).origin, null, "another jurisdiction's view does not know these systems");
});

test("R14 a host serving many offices, an unmatched address, and an unparseable one name no system, and why says so", () => {
  const www = systemOf(H, [A.www]);
  assert.equal(www.origin, null);
  assert.match(www.why, /serves many offices' publications/);
  assert.match(www.why, /the city's general website/);
  const unknown = systemOf(H, ["https://nowhere.test/x"]);
  assert.equal(unknown.origin, null);
  assert.match(unknown.why, /no system in the active profiles matches nowhere\.test/);
  const bad = systemOf(H, ["not a url"]);
  assert.equal(bad.origin, null);
  assert.match(bad.why, /not a parseable address/);
  assert.deepEqual(bad.addresses, ["not a url"]);
  assert.equal(systemOf(EMPTY, [A.legis]).origin, null);
});

test("R15 several addresses name a system only when every one names the same; otherwise why says which case", () => {
  const same = systemOf(H, [A.legis, A.legis2, A.legis]);
  assert.deepEqual([same.origin, same.addresses], ["harbor.legis", [A.legis, A.legis2]]);
  assert.deepEqual([systemOf(H, [A.portal, A.county]).origin], ["county.assessor"], "a republication and its source are one system");
  const none = systemOf(H, []);
  assert.deepEqual([none.origin, none.addresses], [null, []]);
  assert.match(none.why, /no addresses/);
  for (const x of [undefined, null, 5, {}]) assert.match(systemOf(H, x).why, /no addresses/, "never throws");
  const differ = systemOf(H, [A.legis, A.budget]);
  assert.equal(differ.origin, null);
  assert.match(differ.why, /different systems \(harbor\.legis, harbor\.budget\)/);
  const partly = systemOf(H, [A.legis, A.www]);
  assert.equal(partly.origin, null);
  assert.match(partly.why, /unknown systems: some of these addresses name no system/);
  const allUnknown = systemOf(H, [A.www, "https://nowhere.test/"]);
  assert.equal(allUnknown.origin, null);
  assert.match(allUnknown.why, /unknown systems: none of these 2 addresses names a system/);
  for (const j of JUNK) assert.equal(systemOf(j, [A.legis, 5, null]).origin, null, "never throws");
});

/* ---------------------------------------------------------------- judgePair */

test("R16 the checks run form, value, independence, fund name, referent: no reading makes one source count", () => {
  /* each check decides before the later ones, whatever the later ones would say */
  const cross = judgePair(H, "project", end(H, "project", "C329142", A.budget), end(H, "project", "1000858", A.budget), "agrees");
  assert.equal(cross.verdict, "FORMS_UNJOINED", "form before value and system");
  const diff = judgePair(H, "project", end(H, "project", "C329142", A.www), end(H, "project", "C329143", A.www), "agrees");
  assert.equal(diff.verdict, "VALUES_DIFFER", "value before system");
  const undet = judgePair(H, "fund", end(H, "fund", "3100", A.www), end(H, "fund", "3100", A.legis), "agrees");
  assert.equal(undet.verdict, "SYSTEM_UNDETERMINED", "system before fund name");
  const one = judgePair(H, "fund", end(H, "fund", "3100", A.budget), end(H, "fund", "3100", A.budget2, "x"), "agrees");
  assert.equal(one.verdict, "SAME_SYSTEM", "independence before fund name and referent");
  for (const reading of ["agrees", "disagrees", null]) {
    const r = judgePair(H, "parcel", end(H, "parcel", "011-0836-017-00", A.portal), end(H, "parcel", "11-836-17", A.county), reading);
    assert.deepEqual([r.verdict, r.counts], ["SAME_SYSTEM", false], `two publications of one source never count (${reading})`);
  }
  const bare = judgePair(H, "fund", end(H, "fund", "3100", A.legis), end(H, "fund", "3100", A.budget, "Sewer Fund"), "agrees");
  assert.equal(bare.verdict, "FUND_NAME_ABSENT", "fund name before referent");
});

test("R17 different forms are FORMS_UNJOINED unless the view supplies a crosswalk between them", () => {
  for (const [a, b] of [["C329142", "1000858"], ["1003439A", "1003439"], ["C329142", "P329142"]]) {
    const r = judgePair(H, "project", end(H, "project", a, A.budget), end(H, "project", b, A.legis), "agrees");
    assert.deepEqual([r.verdict, r.counts], ["FORMS_UNJOINED", false], `${a} ${b}`);
    assert.match(r.says, /unmade join, not a mismatch/);
    assert.match(r.says, /supply none/);
  }
  const la = (v, addr) => end(L, "project", v, addr);
  const C = "https://clerk.lakeshore.test/1", F = "https://finance.lakeshore.test/1";
  const joined = judgePair(L, "project", la("W-10001", C), la("07-001", F), "agrees");
  assert.deepEqual([joined.verdict, joined.counts], ["SHARED", true]);
  assert.match(joined.says, /joined through the crosswalk a{64}/);
  const rev = judgePair(L, "project", la("07-002", C), la("W-10002", F));
  assert.equal(rev.verdict, "REFERENT_UNREAD", "the crosswalk joins in either order; the referent still decides");
  const other = judgePair(L, "project", la("W-10001", C), la("07-002", F), "agrees");
  assert.deepEqual([other.verdict, other.near_miss], ["VALUES_DIFFER", false]);
  const unlisted = judgePair(L, "project", la("W-19999", C), la("07-001", F), "agrees");
  assert.equal(unlisted.verdict, "FORMS_UNJOINED");
  assert.match(unlisted.says, /lists no partner for W-19999/);
  const sameSys = judgePair(L, "project", la("W-10001", C), la("07-001", C), "agrees");
  assert.equal(sameSys.verdict, "SAME_SYSTEM", "a crosswalk joins values, never systems");
});

test("R18 different values are VALUES_DIFFER; a difference only in leading zeros is a near miss, never counted", () => {
  const near = judgePair(H, "enactment", end(H, "enactment", "9917 H.C.", A.www), end(H, "enactment", "09917", A.legis), "agrees");
  assert.deepEqual([near.verdict, near.counts, near.near_miss], ["VALUES_DIFFER", false, true]);
  assert.match(near.says, /near miss/);
  const far = judgePair(H, "enactment", end(H, "enactment", "9917", A.legis), end(H, "enactment", "9918", A.budget), "agrees");
  assert.deepEqual([far.verdict, far.counts, far.near_miss], ["VALUES_DIFFER", false, false]);
  const same = judgePair(H, "enactment", end(H, "enactment", "H.C. 87551", A.budget), end(H, "enactment", "87551 HC", A.legis), "agrees");
  assert.equal(same.verdict, "SHARED", "one value in two spellings is one value");
});

test("R19 an end with no known system is SYSTEM_UNDETERMINED; both ends in one system are SAME_SYSTEM", () => {
  for (const addr of [A.www, A.otherclient, "not a url", "https://nowhere.test/"]) {
    const r = judgePair(H, "project", end(H, "project", "C329142", addr), end(H, "project", "C329142", A.legis), "agrees");
    assert.deepEqual([r.verdict, r.counts], ["SYSTEM_UNDETERMINED", false], addr);
    assert.match(r.says, /first end is undetermined/);
  }
  const second = judgePair(H, "project", end(H, "project", "C329142", A.legis), { rec: recognise(H, "project", "C329142"), system: systemOf(H, [A.legis, A.budget]) });
  assert.match(second.says, /second end is undetermined \(different systems/);
  const noSystem = judgePair(H, "project", { rec: recognise(H, "project", "C329142") }, end(H, "project", "C329142", A.legis));
  assert.equal(noSystem.verdict, "SYSTEM_UNDETERMINED");
  const same = judgePair(H, "project", end(H, "project", "C329142", A.budget), end(H, "project", "C329142", A.budget2), "agrees");
  assert.deepEqual([same.verdict, same.counts], ["SAME_SYSTEM", false]);
  assert.match(same.says, /one system \(harbor\.budget\)/);
});

test("R20 a fund with an end naming no fund is FUND_NAME_ABSENT; names equal after normalising are SHARED by comparison", () => {
  for (const [na, nb] of [[undefined, "Sewer Service Fund"], ["Sewer Service Fund", ""], ["  ", "x"], [null, null], ["Fund", "Sewer"]]) {
    const r = judgePair(H, "fund", end(H, "fund", "3100", A.legis, na), end(H, "fund", "3100", A.budget, nb), "agrees");
    assert.deepEqual([r.verdict, r.counts], ["FUND_NAME_ABSENT", false], `${na} / ${nb}`);
  }
  for (const [na, nb] of [["Sewer Service Fund", "sewer service"], ["SEWER-SERVICE, FUND", "Sewer Service"], ["Fondo Educación", "fondo educación fund"]]) {
    const r = judgePair(H, "fund", end(H, "fund", "3100", A.legis, na), end(H, "fund", "3100", A.budget, nb));
    assert.deepEqual([r.verdict, r.counts, r.referent], ["SHARED", true, { by: "the names, compared normalised", agrees: true }], `${na} / ${nb}`);
  }
  const differ = judgePair(H, "fund", end(H, "fund", "3100", A.legis, "Sewer Service Fund"), end(H, "fund", "3100", A.budget, "Sewer Rate Fund"));
  assert.deepEqual([differ.verdict, differ.counts], ["REFERENT_UNREAD", false]);
  /* a name matters only in the fund space */
  const proj = judgePair(H, "project", end(H, "project", "C329142", A.legis, "a"), end(H, "project", "C329142", A.budget, "a"));
  assert.equal(proj.verdict, "REFERENT_UNREAD");
});

test("R21 otherwise the referent: unread, disagrees, or SHARED on the caller's reading, labelled as theirs", () => {
  const e = () => [end(H, "project", "C329142", A.budget), end(H, "project", "C329142", A.legis)];
  for (const reading of [undefined, null, "yes", "AGREES", true, 1, {}]) {
    const r = judgePair(H, "project", ...e(), reading);
    assert.deepEqual([r.verdict, r.counts, "referent" in r], ["REFERENT_UNREAD", false, false], String(reading));
  }
  const dis = judgePair(H, "project", ...e(), "disagrees");
  assert.deepEqual([dis.verdict, dis.counts, dis.referent.agrees], ["REFERENT_DISAGREES", false, false]);
  const ok = judgePair(H, "project", ...e(), "agrees");
  assert.deepEqual([ok.verdict, ok.counts, ok.referent.agrees], ["SHARED", true, true]);
  assert.match(ok.referent.by, /the caller's reading/);
  assert.match(ok.referent.by, /did not make and cannot check/);
  assert.match(ok.says, /caller's reading — a reading this module did not make and cannot check/);
  const fund = judgePair(H, "fund", end(H, "fund", "3100", A.legis, "Sewer Fund"), end(H, "fund", "3100", A.budget, "Rate Fund"), "agrees");
  assert.deepEqual([fund.verdict, fund.referent.by.startsWith("the caller's reading")], ["SHARED", true]);
});

test("R22 counts is true only for SHARED", () => {
  const seen = new Map();
  const views = [H, L, HL];
  const vals = { enactment: ["87551", "087551", "87552", "Ordinance No. 12274", "LS-42"], project: ["C329142", "1003439", "W-10001", "07-001"],
                 fund: ["3100", "3101"], parcel: ["11-836-17", "011-0836-017-00", "123 456 789"] };
  const addrs = [A.legis, A.budget, A.budget2, A.portal, A.county, A.www, "https://clerk.lakeshore.test/", "https://finance.lakeshore.test/"];
  for (const view of views) for (const sp of SPACE_NAMES) for (const a of vals[sp]) for (const b of vals[sp]) {
    const ra = recognise(view, sp, a), rb = recognise(view, sp, b);
    if (!ra || !rb) continue;
    for (const [i, x] of addrs.entries()) for (const y of addrs.slice(i)) for (const reading of ["agrees", "disagrees", null])
      for (const [na, nb] of [["Sewer Fund", "sewer"], [null, "x"], ["a", "b"]]) {
        const r = judgePair(view, sp, { rec: ra, system: systemOf(view, [x]), name: na }, { rec: rb, system: systemOf(view, [y]), name: nb }, reading);
        assert.equal(r.counts, r.verdict === "SHARED");
        seen.set(r.verdict, (seen.get(r.verdict) || 0) + 1);
      }
  }
  assert.deepEqual([...seen.keys()].sort(), ["FORMS_UNJOINED", "FUND_NAME_ABSENT", "REFERENT_DISAGREES", "REFERENT_UNREAD",
    "SAME_SYSTEM", "SHARED", "SYSTEM_UNDETERMINED", "VALUES_DIFFER"], "every verdict was reached");
});

test("R16 R22 judgePair throws TypeError when an end is unrecognised or not in the space, and only then", () => {
  const ok = end(H, "project", "C329142", A.legis);
  for (const [a, b] of [[{ rec: null }, ok], [ok, { rec: null }], [ok, {}], [null, ok], [ok, undefined], [{ rec: recognise(H, "fund", "3100") }, ok]])
    assert.throws(() => judgePair(H, "project", a, b), TypeError);
  assert.throws(() => judgePair(H, "fund", ok, ok), TypeError);
  assert.throws(() => judgePair(H, "zipcode", ok, ok), TypeError);
  for (const j of JUNK) assert.equal(typeof judgePair(j, "project", ok, ok).verdict, "string", "a bad view is no view, never a throw");
});

/* ---------------------------------------------------------------- invariants */

test("R23 pure: no store, no network, no clock; the same inputs give the same answer and are not changed", () => {
  const deepFreeze = (o) => { if (o && typeof o === "object" && !Object.isFrozen(o)) { Object.freeze(o); Object.values(o).forEach(deepFreeze); } return o; };
  const frozen = deepFreeze(viewOf(HARBOR, LAKESHORE, DISSENT));
  const snapshot = JSON.stringify(frozen);
  const run = (frozen) => JSON.stringify([
    spaces(frozen),
    SPACE_NAMES.map((sp) => ["87551", "Resolution No. 59916", "C329142", "1003439A", "3100", "011-0836-017-00", "W-10001", "LS-9"].map((v) => recognise(frozen, sp, v))),
    [1, 13035, 80000].map((n) => [reach(frozen, n), reach(frozen, n, "ordinance"), reach(frozen, n, "bylaw")]),
    parcelStanding("11-836-17-0", { lineage, vintages: ["v"] }),
    Object.values(A).map((a) => systemOf(frozen, [a])),
    judgePair(frozen, "project", end(frozen, "project", "C329142", A.budget), end(frozen, "project", "C329142", A.legis), "agrees"),
  ]);
  const saved = { fetch: globalThis.fetch, Date: globalThis.Date, random: Math.random, perf: globalThis.performance };
  const boom = (what) => () => { throw new Error(`id-spaces used ${what}`); };
  let first, second;
  try {
    globalThis.fetch = boom("the network");
    globalThis.Date = new Proxy(saved.Date, { construct: boom("the clock"), apply: boom("the clock"), get: (t, k) => (k === "now" ? boom("the clock") : t[k]) });
    Math.random = boom("randomness");
    Object.defineProperty(globalThis, "performance", { value: { now: boom("the clock") }, configurable: true, writable: true });
    first = run(frozen); second = run(frozen);
  } finally {
    globalThis.fetch = saved.fetch; globalThis.Date = saved.Date; Math.random = saved.random;
    Object.defineProperty(globalThis, "performance", { value: saved.perf, configurable: true, writable: true });
  }
  assert.equal(first, second);
  assert.equal(JSON.stringify(frozen), snapshot, "the view is not changed");
  assert.equal(run(viewOf(HARBOR, LAKESHORE, DISSENT)), first, "an equal view built afresh gives the same answer");
});

test("R24 no place is named in the module: every service answers from the view alone, for any jurisdiction", () => {
  /* with no profile, the module knows no space's form, no kind, no floor, no system, no mixed host */
  for (const sp of SPACE_NAMES) for (const v of ["87551", "C.M.S. 87551", "C329142", "1003439", "3100", "011-0836-017-00", "LS-42", "W-10001"])
    assert.equal(recognise(EMPTY, sp, v), null, `${sp} ${v}`);
  assert.deepEqual(spaces(EMPTY).map((s) => s.forms), [[], [], [], []]);
  for (const kind of [undefined, "ordinance", "resolution"]) assert.equal(reach(EMPTY, 50000, kind).reach, "UNDETERMINED");
  const knownElsewhere = ["https://webapi.legistar.com/v1/oakland/matters/1", "https://oakland.legistar.com/x", "https://data.oaklandca.gov/resource/vmzx-e5fe.csv",
    "https://www.oaklandca.gov/documents/x.pdf", ...Object.values(A)];
  for (const a of knownElsewhere) assert.equal(systemOf(EMPTY, [a]).origin, null, a);
  assert.match(systemOf(EMPTY, ["https://www.oaklandca.gov/x"]).why, /no system in the active profiles matches/, "no mixed host is built in");
  /* a second jurisdiction's profile alone gives its own answers, and none of the first's */
  assert.equal(recognise(L, "enactment", "87551"), null);
  assert.equal(recognise(L, "enactment", "LS-42").normal, "LS-42");
  assert.equal(reach(L, 50, "bylaw").reach, "OUTSIDE_REACH");
  assert.equal(reach(L, 50000, "ordinance").reach, "UNDETERMINED");
  assert.equal(systemOf(L, [A.legis]).origin, null);
  const lr = judgePair(L, "parcel", end(L, "parcel", "123 456 789", "https://clerk.lakeshore.test/"), end(L, "parcel", "123456789".replace(/(...)(...)(...)/, "$1 $2 $3"), "https://finance.lakeshore.test/"), "agrees");
  assert.equal(lr.verdict, "SHARED");
  /* the labels are the view's, and every jurisdiction's space names are the same four */
  assert.equal(spaces(L).find((s) => s.space === "enactment").label, "bylaw number");
  assert.deepEqual(spaces(L).map((s) => s.space), spaces(H).map((s) => s.space));
});

test("R25 every no says which kind of no, and absence is never reported as non-existence", () => {
  const nos = [
    judgePair(H, "project", end(H, "project", "C329142", A.budget), end(H, "project", "1003439", A.legis)),
    judgePair(H, "project", end(H, "project", "C329142", A.budget), end(H, "project", "C329143", A.legis)),
    judgePair(H, "project", end(H, "project", "C329142", A.www), end(H, "project", "C329142", A.legis)),
    judgePair(H, "project", end(H, "project", "C329142", A.budget), end(H, "project", "C329142", A.budget2)),
    judgePair(H, "fund", end(H, "fund", "3100", A.budget), end(H, "fund", "3100", A.legis)),
    judgePair(H, "project", end(H, "project", "C329142", A.budget), end(H, "project", "C329142", A.legis)),
    judgePair(H, "project", end(H, "project", "C329142", A.budget), end(H, "project", "C329142", A.legis), "disagrees"),
  ];
  const kinds = { FORMS_UNJOINED: /unjoined|unmade join/, VALUES_DIFFER: /different values|near miss/, SYSTEM_UNDETERMINED: /undetermined/,
                  SAME_SYSTEM: /one system/, FUND_NAME_ABSENT: /names no fund/, REFERENT_UNREAD: /not been read|reading nobody/,
                  REFERENT_DISAGREES: /different things/ };
  assert.deepEqual(nos.map((r) => r.verdict), Object.keys(kinds));
  for (const r of nos) {
    assert.equal(r.counts, false);
    assert.match(r.says, kinds[r.verdict]);
  }
  const reaches = [reach(H, 1, "ordinance"), reach(H, 13035), reach(viewOf(HARBOR, DISSENT), 5, "ordinance"), reach(H, 5, "bylaw")];
  assert.deepEqual(reaches.map((r) => r.reach), ["OUTSIDE_REACH", "UNDETERMINED", "UNDETERMINED", "UNDETERMINED"]);
  const standings = [parcelStanding("x"), parcelStanding("x", { vintages: ["a"] })];
  const systems = [systemOf(H, []), systemOf(H, [A.www]), systemOf(H, ["x"]), systemOf(H, [A.legis, A.budget])];
  for (const r of [...nos, ...reaches, ...standings, ...systems]) {
    const text = r.says || r.why;
    assert.ok(typeof text === "string" && text.length > 20, JSON.stringify(r));
    assert.doesNotMatch(text, /\bnot found\b|\bno such\b|does not exist|never existed/i, text);
  }
});
