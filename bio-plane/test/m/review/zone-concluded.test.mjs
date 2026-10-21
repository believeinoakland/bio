/* review: the copy's grant part carries the instance's time zone (R35, N1081), and `draft` and `list` take and answer a
   project's first case's concluded questions (R36, DEC-310 (2)). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { standard, P, Q, V, SECRET } from "./fixture.mjs";
import { noReviewCopy } from "../../../src/review/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const DEAD = JSON.stringify(noReviewCopy());
const END = "2026-09-29T07:59:59.000Z";

/* R35's sources: local-facts' governing value (its R2) per profile, and the profiles' own combined view (R41). */
const lfOf = (zones) => ({ factStatus: ({ path }) => {
  const z = zones[path.split("/")[0]];
  return z === undefined ? { ok: true } : { ok: true, governs: { value: z } };
} });
const zoneWorld = ({ profiles = ["p1"], zones = {}, profileZone = null } = {}) => {
  const w = standard({ localFacts: lfOf(zones), combine: () => (profileZone ? { ok: true, view: { time_zone: { value: profileZone } } } : { ok: false }) });
  if (profiles) w.record.setSetting("jurisdiction_profiles", profiles, "member:ann");
  return w;
};
const withGrant = (w, until) => {
  const d = w.r.act({ act: "draft", author: "ann", project: P, statement: "S" });
  const g = w.r.act({ act: "grant", author: "ann", draft: d.draftId, recipient: "R1", secretSha: SECRET(1), ...(until ? { until } : {}) });
  return { d, g };
};
const zones = (w, d) => [w.r.copy({ secretSha: SECRET(1), bySecret: true }).grant, ...w.r.copy({ draft: d.draftId, viewer: V("ann") }).grants]
  .map((g) => [g.until, g.zone]);

test("R35: a grant ending at the end of a day answers until and the governing zone at the recipient's door and in the roster", () => {
  const w = zoneWorld({ zones: { p1: "America/Los_Angeles" }, profileZone: "UTC" });
  const { d } = withGrant(w, END);
  assert.deepEqual(zones(w, d), [[END, "America/Los_Angeles"], [END, "America/Los_Angeles"]]);
  /* the zone is read, nothing is written */
  const before = w.snapshot();
  w.r.copy({ secretSha: SECRET(1), bySecret: true });
  assert.deepEqual(w.snapshot(), before);
});

test("R35: with no zone held zone is null, never UTC; a grant with no until answers until null and the same zone", () => {
  for (const w of [zoneWorld({ profiles: null }), zoneWorld({ zones: {} }), zoneWorld({ profiles: [] , profileZone: "UTC" })]) {
    const { d } = withGrant(w);
    assert.deepEqual(zones(w, d), [[null, null], [null, null]]);
  }
  const w = zoneWorld({ zones: { p1: "America/Chicago" } });
  const { d } = withGrant(w);
  assert.deepEqual(zones(w, d), [[null, "America/Chicago"], [null, "America/Chicago"]]);
});

test("R35: the profiles' own zone is the fallback, and two profiles of different zones govern none", () => {
  const fb = zoneWorld({ profileZone: "Europe/Paris" });
  assert.deepEqual(zones(fb, withGrant(fb, END).d), [[END, "Europe/Paris"], [END, "Europe/Paris"]]);
  const two = zoneWorld({ profiles: ["p1", "p2"], zones: { p1: "America/Denver", p2: "Asia/Tokyo" }, profileZone: "UTC" });
  assert.deepEqual(zones(two, withGrant(two, END).d), [[END, null], [END, null]]);
  const same = zoneWorld({ profiles: ["p1", "p2"], zones: { p1: "Asia/Tokyo", p2: "Asia/Tokyo" } });
  assert.deepEqual(zones(same, withGrant(same, END).d), [[END, "Asia/Tokyo"], [END, "Asia/Tokyo"]]);
  /* a source that throws governs none and never fails the copy */
  const boom = standard({ localFacts: { factStatus() { throw new Error("down"); } }, combine: () => { throw new Error("down"); } });
  boom.record.setSetting("jurisdiction_profiles", ["p1"], "member:ann");
  const { d } = withGrant(boom, END);
  const bc = boom.r.copy({ draft: d.draftId, viewer: V("ann") });
  assert.deepEqual([bc.ok, bc.grants[0].zone], [true, null]);
});

test("R35: a member's copy of a draft with no grant answers the governing zone at its top level, whether or not it has a grant", () => {
  const w = zoneWorld({ zones: { p1: "America/Los_Angeles" }, profileZone: "UTC" });
  const d = w.r.act({ act: "draft", author: "ann", project: P, statement: "S" });
  const c = w.r.copy({ draft: d.draftId, viewer: V("ann") });
  assert.deepEqual([c.ok, c.reader, c.zone, c.grants], [true, "member", "America/Los_Angeles", []]);
  /* the profiles' own zone is the fallback here too */
  const fb = zoneWorld({ profileZone: "Europe/Paris" });
  const fd = fb.r.act({ act: "draft", author: "ann", project: P, statement: "S" });
  assert.equal(fb.r.copy({ draft: fd.draftId, viewer: V("ann") }).zone, "Europe/Paris");
  const before = w.snapshot();
  w.r.copy({ draft: d.draftId, viewer: V("ann") });
  assert.deepEqual(w.snapshot(), before);
});

test("R35: control: with no zone held the top-level zone is null, not UTC; a draft with a grant answers the same zone as its roster rows; the recipient door has none at its top level", () => {
  for (const w of [zoneWorld({ profiles: null }), zoneWorld({ zones: {} }), zoneWorld({ profiles: [], profileZone: "UTC" })]) {
    const d = w.r.act({ act: "draft", author: "ann", project: P, statement: "S" });
    const c = w.r.copy({ draft: d.draftId, viewer: V("ann") });
    assert.equal("zone" in c, true);
    assert.equal(c.zone, null);
  }
  const w = zoneWorld({ zones: { p1: "America/Chicago" } });
  const { d } = withGrant(w, END);
  const m = w.r.copy({ draft: d.draftId, viewer: V("ann") });
  assert.deepEqual([m.zone, ...m.grants.map((g) => g.zone)], ["America/Chicago", "America/Chicago"]);
  const rc = w.r.copy({ secretSha: SECRET(1), bySecret: true });
  assert.equal("zone" in rc, false);
  assert.equal(rc.grant.zone, "America/Chicago");
});

/* R36 */
const INQ = ["INQ-1", "INQ-2", "INQ-3"];
const conclusionDoc = (w, rows) => {
  w.st.sql.exec(`DELETE FROM files WHERE bundle_id=? AND path='bundle.md'`, P);
  const md = ["---", "object_type: project", `title: "${P}"`, "conclusions:",
    ...rows.flatMap(([i, at]) => [`  - inquiry: ${i}`, `    at: "${at}"`, "    by: ann"]), "---", "", "## Objective", ""].join("\n");
  w.st.sql.exec(`INSERT INTO files (bundle_id,path,content,sha256,bytes) VALUES (?,?,?,?,?)`, P, "bundle.md", md, "x", md.length);
};
const concluded = () => {
  const w = standard();
  INQ.forEach((i) => w.bundle(i, "inquiry", `finding of ${i}`, "concluded"));
  conclusionDoc(w, [["INQ-2", "2026-09-27T00:00:00Z"], ["INQ-1", "2026-09-26T00:00:00Z"], ["INQ-3", "2026-09-28T00:00:00Z"]]);
  w.concluded.set(`${P}|INQ-1`, { at: "2026-09-26T00:00:00Z", by: "ann" });
  w.concluded.set(`${P}|INQ-2`, { at: "2026-09-27T00:00:00Z", by: "bea" });
  /* INQ-3 has a row but the project has withdrawn it: ratification does not answer concluded */
  return w;
};

test("R36: draft takes the chosen concluded questions as targets, a first case names no case, and list answers them before and after", () => {
  const w = concluded();
  const before = w.r.list({ project: P, viewer: V("ann") });
  assert.deepEqual(before.concluded.map((c) => [c.inquiry, c.title, c.concluded_at, c.concluded_by]),
    [["INQ-1", "INQ-1", "2026-09-26T00:00:00Z", "ann"], ["INQ-2", "INQ-2", "2026-09-27T00:00:00Z", "bea"]]);
  assert.deepEqual(before.concluded[0].findings, [{ target: "INQ-1", present: true, object_type: "inquiry", state: "concluded",
                                                    role: null, text: "finding of INQ-1", statement: "finding of INQ-1", falsifier: null }]);
  assert.equal(before.concluded_truncated, false);
  const d = w.r.act({ act: "draft", author: "ed", project: P, targets: ["INQ-1", "INQ-2"] });
  assert.deepEqual([d.ok, d.caseId, d.edition], [true, null, null]);
  assert.equal(d.caseIdentity, word("review.index.derived_case_identity"));
  const c = w.r.copy({ draft: d.draftId, viewer: V("ann") });
  assert.deepEqual(c.findings.map((f) => [f.target, f.present, f.text]), [["INQ-1", true, "finding of INQ-1"], ["INQ-2", true, "finding of INQ-2"]]);
  assert.deepEqual(w.r.list({ project: P, viewer: V("ann") }).concluded.map((x) => x.inquiry), ["INQ-1", "INQ-2"]);
  /* editing to one target leaves one */
  const e = w.r.act({ act: "draft", author: "ed", draft: d.draftId, targets: ["INQ-2"] });
  assert.equal(e.edited, true);
  assert.deepEqual(w.r.copy({ draft: d.draftId, viewer: V("ann") }).findings.map((f) => f.target), ["INQ-2"]);
});

test("R36: a target the project has not concluded is kept and missing names what the publish gate says; the list is fenced, bounded and writes nothing", () => {
  const w = concluded();
  w.ca.gate = (a) => (a.targets.includes("INQ-3") ? { ok: false, reason: "NOT_CONCLUDED", target: "INQ-3" } : { ok: true });
  const d = w.r.act({ act: "draft", author: "ed", project: P, targets: ["INQ-1", "INQ-3"] });
  assert.equal(d.ok, true);
  const c = w.r.copy({ draft: d.draftId, viewer: V("ann") });
  assert.deepEqual(c.findings.map((f) => f.target), ["INQ-1", "INQ-3"]);
  assert.equal(c.missing[0].reason, "NOT_CONCLUDED");
  /* the list: a viewer without standing learns nothing, byte-identical; a project that concluded none answers [] */
  assert.equal(JSON.stringify(w.r.list({ project: P, viewer: V("out") })), DEAD);
  assert.equal(JSON.stringify(w.r.list({ project: P, viewer: V("quinn") })), DEAD);
  assert.deepEqual(w.r.list({ project: Q, viewer: V("quinn") }).concluded, []);
  const snap = w.snapshot();
  const l = w.r.list({ project: P, viewer: V("ann"), limit: 1 });
  assert.deepEqual([l.concluded.length, l.concluded[0].inquiry, l.concluded_truncated], [1, "INQ-1", true]);
  assert.deepEqual(w.snapshot(), snap);
});
