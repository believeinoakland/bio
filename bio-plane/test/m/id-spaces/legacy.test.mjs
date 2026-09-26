/* R26, the legacy adapter (ruling K35; temporary, retired with entry N6). Each old name must answer exactly
 * as its view-first service answers over the view `jurisdictions.combine` makes of every non-test profile
 * `jurisdictions` holds, with the old space names mapped (cms ↔ enactment, apn ↔ parcel) in and out. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as M from "../../../src/idspaces.mjs";
import { list, combine } from "../../../../jurisdictions/index.mjs";

const { spaces, recognise, reach, parcelStanding, systemOf, judgePair, ID_SPACES, CMS_FLOOR, apnStanding, systemOfAddresses } = M;
const c = combine(list().filter((p) => !p.test).map((p) => p.id));
assert.ok(c.ok);
const V = { ...c.view, conflicts: c.conflicts };
const MAP = { cms: "enactment", project: "project", fund: "fund", apn: "parcel" };
const OLD = Object.fromEntries(Object.entries(MAP).map(([o, n]) => [n, o]));

/* Values of every shape the held profiles recognise, and some they do not. */
const forms = spaces(V).flatMap((s) => s.forms.map((f) => [s.space, f.form]));
const VALUES = ["87551", "C.M.S. 87551", "87551 CMS", "Resolution No. 59916 C.M.S.", "Ordinance No. 12273", "13035", "09917",
  "C329142", "#c329142", "P12345", "1003439", "1003439A", "3100", "31000", "011-0836-017-00", "11-836-17", "APN 11-836-17-0",
  "", "zzz", null, "LS-42", "W-10001"];
const ADDRS = [...new Set((V.systems || []).flatMap((s) => s.hosts.map((h) => `https://${h}/`)))
  .values(), ...(V.mixed_hosts || []).map((m) => `https://${m.host}/x`), "https://nowhere.test/", "not a url"];

test("R26 ID_SPACES is the legacy view's spaces under the old names", () => {
  assert.ok(forms.length > 0, "a non-test profile is held and supplies forms");
  assert.deepEqual(Object.keys(ID_SPACES), ["cms", "project", "fund", "apn"]);
  for (const s of spaces(V)) {
    const o = ID_SPACES[OLD[s.space]];
    assert.deepEqual({ label: o.label, forms: o.forms, referent: o.referent }, { label: s.label, forms: s.forms, referent: s.referent });
  }
  assert.ok(!("enactment" in ID_SPACES) && !("parcel" in ID_SPACES));
});

test("R26 recognise(space, raw) answers as recognise(view, space, raw), the space mapped in and out", () => {
  for (const [old, space] of Object.entries(MAP)) for (const v of VALUES) {
    const want = recognise(V, space, v);
    assert.deepEqual(recognise(old, v), want ? { ...want, space: old } : null, `${old} ${v}`);
  }
  for (const sp of ["enactment", "parcel", "zipcode", ""]) for (const v of VALUES) assert.equal(recognise(sp, v), null, "only the old names are mapped");
});

test("R26 apnStanding and systemOfAddresses answer as parcelStanding and systemOf over the view", () => {
  const ev = { current: new Set(["a"]), lineage: new Map([["b", [{ roll_year: 2014, children: ["c"] }]]]), vintages: ["v1"] };
  for (const k of ["a", "b", "x"]) for (const e of [ev, undefined]) assert.deepEqual(apnStanding(k, e), parcelStanding(k, e));
  for (const a of ADDRS) assert.deepEqual(systemOfAddresses([a]), systemOf(V, [a]), a);
  for (const set of [[], ADDRS.slice(0, 2), ADDRS, undefined]) assert.deepEqual(systemOfAddresses(set), systemOf(V, set));
});

test("R26 judgePair(space, a, b, reading) answers as judgePair(view, space, …), old space names mapped in", () => {
  let n = 0;
  for (const [old, space] of Object.entries(MAP)) {
    const recs = VALUES.map((v) => recognise(old, v)).filter(Boolean);
    for (const ra of recs) for (const rb of recs) for (const [x, y] of [[ADDRS[0], ADDRS[1]], [ADDRS[0], ADDRS[0]], [ADDRS.at(-2), ADDRS[0]]])
      for (const reading of ["agrees", "disagrees", null]) for (const [na, nb] of [["Sewer Fund", "sewer"], [null, "x"]]) {
        const a = { rec: ra, system: systemOfAddresses([x]), name: na }, b = { rec: rb, system: systemOfAddresses([y]), name: nb };
        const want = judgePair(V, space, { ...a, rec: { ...ra, space } }, { ...b, rec: { ...rb, space } }, reading);
        assert.deepEqual(judgePair(old, a, b, reading), want);
        n++;
      }
  }
  assert.ok(n > 100);
  assert.throws(() => judgePair("project", { rec: null }, { rec: null }), TypeError, "the same errors as the view-first service");
});

test("R26 CMS_FLOOR, the old battery's import, is each kind's floor in the view", () => {
  const kinds = (V.spaces.enactment && V.spaces.enactment.kinds) || [];
  assert.deepEqual(CMS_FLOOR, Object.fromEntries(kinds.filter((k) => k.floor).map((k) => [k.kind, k.floor.first])));
  for (const [kind, first] of Object.entries(CMS_FLOOR)) {
    assert.equal(reach(V, first, kind).reach, "INSIDE");
    assert.equal(reach(V, first - 1, kind).reach, "OUTSIDE_REACH");
  }
});

test("R26 R24 the adapter names no place: with the held profiles changed, it follows them (its answers are the view's)", () => {
  /* the adapter's facts are exactly the view's: no space, system or floor answers that the view does not */
  for (const a of ["https://unlisted.example/", "https://example.org/v1/x"]) assert.equal(systemOfAddresses([a]).origin, null);
  const heldIds = list().filter((p) => !p.test).map((p) => p.id);
  assert.deepEqual(V.profiles, heldIds, "the view combines every non-test profile held, and only those");
  assert.ok(!list().filter((p) => p.test).some((p) => V.profiles.includes(p.id)), "no test profile enters the legacy view");
});
