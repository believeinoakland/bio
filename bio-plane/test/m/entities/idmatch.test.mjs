/* entities' identifier-space judgement at its interface: R20–R25, R29. Run over the test profile (a jurisdiction
   that is not the first profile's, layers.md rule 3), set as the instance's active profile. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, sha, MACHINE } from "./fixture.mjs";
import { IDSPACE_CHECKS } from "../../../src/entities/index.mjs";
import { spaces as idSpaces } from "../../../src/idspaces.mjs";

const PE = ["test-port-ellery"];
const MIN = "https://minutes.port-ellery.example/a/1";
const LEDGER = "https://ledger.port-ellery.example/b/2";
const MIXED = "https://www.port-ellery.example/c/3";
const LANDS = "https://lands.marlow-county.example/lots/1";
const REPUB = "https://open.port-ellery.example/lots/1";

function pair(opts = {}) {
  const w = world({ profiles: PE, ...opts });
  return w;
}

test("R20 the spaces and forms are id-spaces', over the view jurisdictions.combine makes of the instance's active profiles; an unknown space is IDSPACE_UNKNOWN listing them", () => {
  const w = pair();
  const u = w.e.idMatch({ space: "cms", a: "1" });
  assert.equal(u.reason, "IDSPACE_UNKNOWN");
  /* id-spaces' nine (its R1, T33-9; K1515), in its order, read from its own spaces() over the view */
  assert.deepEqual(u.spaces, ["enactment", "project", "fund", "parcel", "account", "object", "vendor", "proceeding", "person"]);
  assert.deepEqual(u.spaces, idSpaces(w.e.view()).map((s) => s.space));
  assert.equal(w.e.idMatch({ space: "apn", a: "1/2" }).reason, "IDSPACE_UNKNOWN", "the old names are gone (N6)");
  assert.equal(w.e.idMatch({}).reason, "IDSPACE_UNKNOWN");
  const r = w.e.idMatch({ space: " Project ", a: "wo 0001" });
  assert.deepEqual([r.ok, r.space, r.label, r.a.form, r.a.normal, r.profiles], [true, "project", "works order number", "WO-####", "WO-0001", PE]);
  /* the active profiles decide: none held, nothing recognised; the first profile's forms are not the test's */
  assert.equal(world().e.idMatch({ space: "project", a: "WO-0001" }).reason, "IDSPACE_VALUE_NOT_IN_SPACE");
  assert.equal(world({ profiles: ["oakland-alameda"] }).e.idMatch({ space: "project", a: "WO-0001" }).reason, "IDSPACE_VALUE_NOT_IN_SPACE");
});

test("R21 a value of no form is IDSPACE_VALUE_NOT_IN_SPACE naming the end and the forms; one value answers its recognition, an enactment's kind and reach, a parcel's standing, evidence:false", () => {
  const w = pair();
  const a = w.e.idMatch({ space: "project", a: "zzz" });
  assert.deepEqual([a.reason, a.space, a.forms], ["IDSPACE_VALUE_NOT_IN_SPACE", "project", ["WO-####", "E#####"]]);
  assert.match(a.detail, /^a has the shape/);
  const held = w.held("INFO-1", sha("x"), [MIN]);
  const b = w.e.idMatch({ space: "project", a: "WO-0001", b: "zzz", aCapture: held, bCapture: held, viewer: MACHINE });
  assert.match(b.detail, /^b has the shape/);
  const en = w.e.idMatch({ space: "enactment", a: "Bylaw No. 1100" });
  assert.deepEqual([en.evidence, en.a.form, en.a.normal, en.a.kind, en.a.reach.reach], [false, "pe", "1100", "bylaw", "OUTSIDE_REACH"]);
  assert.equal("b" in en, false);
  const pa = w.e.idMatch({ space: "parcel", a: "parcel 0012/004a" });
  assert.deepEqual([pa.a.normal, pa.a.standing.standing], ["12/4A", "UNDETERMINED"]);
  assert.ok(!/no such parcel/i.test(pa.a.standing.says));
  assert.equal("standing" in w.e.idMatch({ space: "fund", a: "100-01" }).a, false);
});

test("R22 each end's capture must be held and visible (an invisible one answers as an absent one); each end's system from every address the record located it at, never the request; at most 32 read, a_truncated and b_truncated published", () => {
  const w = pair();
  const a = w.held("INFO-1", sha("a"), [MIN]);
  const b = w.held("INFO-2", sha("b"), [LEDGER]);
  const q = { space: "project", a: "WO-0001", b: "WO-0001", aCapture: a, bCapture: b, viewer: MACHINE };
  const r = w.e.idMatch({ ...q, aSystem: "ellery.ledger" });
  assert.deepEqual([r.verdict, r.counts, r.a.system.origin, r.b.system.origin, r.a.system.from], ["REFERENT_UNREAD", false, "ellery.minutes", "ellery.ledger", "addresses"]);
  assert.deepEqual([r.limit, r.a_truncated, r.b_truncated, r.a.capture, r.b.capture], [32, false, false, a, b]);
  /* not held, malformed, invisible: one answer */
  w.project("PROJ-2026-0003-z", "insider");
  const hid = w.held("PROJ-2026-0003-z", sha("hid"), [LEDGER]);
  const answers = [
    w.e.idMatch({ ...q, bCapture: sha("never") }),
    w.e.idMatch({ ...q, bCapture: "not-a-sha" }),
    w.e.idMatch({ ...q, bCapture: hid, viewer: "member:outsider" }),
  ];
  for (const x of answers) assert.deepEqual([x.reason, x.detail], ["IDSPACE_CAPTURE_NOT_HELD", "b_capture names no captured document this record holds that you can see"]);
  assert.equal(w.e.idMatch({ ...q, bCapture: hid, viewer: "member:insider" }).ok, true);
  assert.equal(w.e.idMatch({ ...q, viewer: null }).reason, "IDSPACE_CAPTURE_NOT_HELD", "an absent viewer sees no capture");
  assert.equal(w.e.idMatch({ ...q, aCapture: sha("never") }).detail.startsWith("a_capture"), true);
  /* one system at two addresses of it: still that system; one publication and its republication: one system */
  const two = w.held("INFO-3", sha("two"), [MIN, "https://api.records-host.example/ellery/x"]);
  assert.equal(w.e.idMatch({ ...q, aCapture: two }).a.system.origin, "ellery.minutes");
  const lands = w.held("INFO-4", sha("lands"), [LANDS]);
  const repub = w.held("INFO-5", sha("repub"), [REPUB]);
  assert.equal(w.e.idMatch({ ...q, aCapture: lands, bCapture: repub }).verdict, "SAME_SYSTEM");
  /* 33 addresses: undetermined, published */
  const many = w.held("INFO-6", sha("many"), Array.from({ length: 33 }, (_, i) => `https://minutes.port-ellery.example/p/${String(i).padStart(2, "0")}`));
  const m = w.e.idMatch({ ...q, aCapture: many });
  assert.deepEqual([m.a_truncated, m.a.system.origin, m.verdict], [true, null, "SYSTEM_UNDETERMINED"]);
  assert.match(m.a.system.why, /more than 32 addresses/);
  const ok32 = w.held("INFO-7", sha("32"), Array.from({ length: 32 }, (_, i) => `https://minutes.port-ellery.example/q/${String(i).padStart(2, "0")}`));
  assert.deepEqual([w.e.idMatch({ ...q, aCapture: ok32 }).a_truncated, w.e.idMatch({ ...q, aCapture: ok32 }).a.system.origin], [false, "ellery.minutes"]);
  /* a mixed host names no system */
  const mixed = w.held("INFO-8", sha("mixed"), [MIXED]);
  assert.equal(w.e.idMatch({ ...q, aCapture: mixed }).verdict, "SYSTEM_UNDETERMINED");
});

test("R23 a member's declared origin for the document (provenance.originOf) is asked before any address-derived system", () => {
  const w = pair();
  const mixed = w.held("INFO-1", sha("m"), [MIXED]);
  const b = w.held("INFO-2", sha("b"), [LEDGER]);
  const q = { space: "project", a: "WO-0001", b: "WO-0001", aCapture: mixed, bCapture: b, viewer: MACHINE };
  assert.equal(w.e.idMatch(q).verdict, "SYSTEM_UNDETERMINED");
  assert.equal(w.prov.declareOrigin({ bundleId: "INFO-1", system: "ellery.minutes", by: "member:ann", viewer: MACHINE }).ok, true);
  const r = w.e.idMatch(q);
  assert.deepEqual([r.verdict, r.a.system.origin, r.a.system.from, r.a.system.declared.by], ["REFERENT_UNREAD", "ellery.minutes", "declared", "member:ann"]);
  /* before the addresses: a declaration overrides a derivable address */
  const min = w.held("INFO-3", sha("min"), [MIN]);
  w.prov.declareOrigin({ bundleId: "INFO-3", system: "the Port Ellery general ledger", by: "member:ann", viewer: MACHINE });
  const s = w.e.idMatch({ ...q, aCapture: min });
  assert.deepEqual([s.a.system.origin, s.verdict], ["ellery.ledger", "SAME_SYSTEM"], "named by the system's name, mapped to its origin");
  /* a declared system the view does not hold stands as declared */
  w.prov.declareOrigin({ bundleId: "INFO-1", system: "a harbour notice board", by: "member:bo", viewer: MACHINE });
  assert.equal(w.e.idMatch(q).a.system.origin, "a harbour notice board");
});

test("R24 the verdict is id-spaces.judgePair's; referent is read only as agrees or disagrees and the answer says the reading is the caller's; the fund name is compared here; it writes nothing", () => {
  const w = pair();
  const a = w.held("INFO-1", sha("a"), [MIN]);
  const b = w.held("INFO-2", sha("b"), [LEDGER]);
  const q = { space: "project", a: "WO-0001", b: "wo0001", aCapture: a, bCapture: b, viewer: MACHINE };
  const before = JSON.stringify(w.rows(`SELECT * FROM sqlite_master`)) + w.rows(`SELECT COUNT(*) AS n FROM captured_locators`)[0].n;
  const agree = w.e.idMatch({ ...q, referent: "agrees" });
  assert.deepEqual([agree.verdict, agree.counts, agree.referent.by], ["SHARED", true, "the caller's reading"]);
  assert.match(agree.referent_reading, /caller's/);
  const dis = w.e.idMatch({ ...q, referent: "disagrees" });
  assert.deepEqual([dis.verdict, dis.counts], ["REFERENT_DISAGREES", false]);
  for (const other of ["yes", "", null, "AGREES"]) {
    const x = w.e.idMatch({ ...q, referent: other });
    assert.deepEqual([x.verdict, x.referent_reading], ["REFERENT_UNREAD", null]);
  }
  assert.equal(w.e.idMatch({ ...q, b: "E10001" }).verdict, "REFERENT_UNREAD");
  assert.equal(w.e.idMatch({ ...q, b: "E10001", referent: "agrees" }).verdict, "SHARED", "joined through the view's crosswalk");
  assert.equal(w.e.idMatch({ ...q, b: "WO-0002" }).verdict, "VALUES_DIFFER");
  const f = { ...q, space: "fund", a: "100-01", b: "100-01" };
  assert.equal(w.e.idMatch({ ...f, aName: "Harbour Fund", bName: "harbour" }).verdict, "SHARED");
  assert.equal(w.e.idMatch({ ...f, aName: "Harbour Fund" }).verdict, "FUND_NAME_ABSENT");
  assert.deepEqual([w.e.idMatch({ ...f, aName: "x", bName: "y" }).a.name], ["x"]);
  const after = JSON.stringify(w.rows(`SELECT * FROM sqlite_master`)) + w.rows(`SELECT COUNT(*) AS n FROM captured_locators`)[0].n;
  assert.equal(after, before);
});

test("R25 the C-91 translations and every sentence of the answer name no local system, office or example value", () => {
  const LOCAL = /oakland|alameda|legistar|\bcms\b|\bapn\b|c\.m\.s|C329142|1000858|011-0836|city clerk|council/i;
  for (const row of Object.values(IDSPACE_CHECKS)) assert.ok(!LOCAL.test(row.translation), row.translation);
  for (const profiles of [PE, ["oakland-alameda"], null]) {
    const w = world({ profiles });
    const a = w.held("INFO-1", sha("a"), [MIN]);
    const b = w.held("INFO-2", sha("b"), [LEDGER]);
    const answers = [
      w.e.idMatch({ space: "x" }), w.e.idMatch({ space: "project", a: "?" }),
      w.e.idMatch({ space: "project", a: "WO-0001", b: "WO-0001", aCapture: a, bCapture: sha("no"), viewer: MACHINE }),
      w.e.idMatch({ space: "project", a: "WO-0001", b: "WO-0001", aCapture: a, bCapture: b, viewer: MACHINE, referent: "agrees" }),
    ];
    for (const x of answers) {
      /* the module's own sentences: everything but the values the view supplied (labels, forms, system names) */
      const own = [x.detail, x.translation, x.referent_reading].filter(Boolean).join(" ");
      assert.ok(!LOCAL.test(own), own);
    }
  }
});

test("R29 C-91.1–C-91.3 are this module's invariants: each refusal carries its check id, its code and its canned translation", () => {
  const w = pair();
  const a = w.held("INFO-1", sha("a"), [MIN]);
  const cases = [
    ["IDSPACE_UNKNOWN", "C-91.1", w.e.idMatch({ space: "nope" })],
    ["IDSPACE_VALUE_NOT_IN_SPACE", "C-91.2", w.e.idMatch({ space: "fund", a: "abc" })],
    ["IDSPACE_CAPTURE_NOT_HELD", "C-91.3", w.e.idMatch({ space: "fund", a: "100-01", b: "100-01", aCapture: a, viewer: MACHINE })],
  ];
  for (const [code, check, r] of cases) {
    assert.deepEqual([r.ok, r.reason, r.code, r.check], [false, code, code, check]);
    assert.equal(r.translation, IDSPACE_CHECKS[code].translation);
    assert.match(IDSPACE_CHECKS[code].where, /^src\/entities\/index\.mjs idMatch > is-idspace-/);
  }
  /* negative control: a request that is well formed is judged, never refused */
  const ok = w.e.idMatch({ space: "fund", a: "100-01", b: "100-01", aCapture: a, bCapture: a, viewer: MACHINE, aName: "F", bName: "F" });
  assert.deepEqual([ok.ok, ok.verdict], [true, "SAME_SYSTEM"]);
});
