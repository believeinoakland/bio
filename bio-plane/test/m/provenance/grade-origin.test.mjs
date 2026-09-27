/* provenance: the capture axis for one capture, from its route (R24–R27), and a member's declared origin (R29, R30). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, V, infoMd } from "./fixture.mjs";
import { ARCHIVE_CAPTURE_GRADE, ARCHIVE_VIA } from "../../../src/provenance/index.mjs";
import { EARNED_CAPTURE_CEILING, BASIS_GRADES, TESTIMONY_GRADE } from "../../../checks/bio-checks.mjs";

const T = "2026-09-27T01:00:00Z";
const rank = (g) => BASIS_GRADES.indexOf(g);

test("R24: a capture this instance fetched directly earns the ceiling, measured", () => {
  const w = world();
  const s = sha("direct");
  w.prov.recordReceipt({ addressNorm: "e.org/d", captureSha: s, retrieved: T });
  assert.deepEqual({ ...w.prov.captureGrade(s), why: undefined },
                   { grade: EARNED_CAPTURE_CEILING, route: "direct", determined: true, basis: "measured", why: undefined });
  /* A direct receipt is the strongest route, whatever else served the bytes. */
  w.prov.recordReceipt({ addressNorm: "e.org/d", captureSha: s, retrieved: T, via: ARCHIVE_VIA });
  assert.equal(w.prov.captureGrade(`sha256:${s.toUpperCase()}`).grade, EARNED_CAPTURE_CEILING);
});

test("R25: an archive-only capture earns the letter one rank below the ceiling, from its one definition", () => {
  assert.equal(rank(ARCHIVE_CAPTURE_GRADE), rank(EARNED_CAPTURE_CEILING) + 1);
  assert.equal(ARCHIVE_CAPTURE_GRADE, "C", "the ruled letter (BOB #35, D-693)");
  const w = world();
  const s = sha("archived");
  w.prov.recordReceipt({ addressNorm: "e.org/a", captureSha: s, retrieved: T, via: ARCHIVE_VIA });
  const g = w.prov.captureGrade(s);
  assert.deepEqual([g.grade, g.route, g.determined, g.basis], [ARCHIVE_CAPTURE_GRADE, "archive", true, "measured"]);
});

test("R26: no recorded route is stated as unrecorded, and a via no ruling names is undetermined", () => {
  const w = world();
  const a = w.cap("a");
  w.promoteInfo("INFO-2026-0001-a", { captures: [a] });
  const u = w.prov.captureGrade(a.sha);
  assert.deepEqual([u.grade, u.route, u.determined, u.basis, u.ceiling],
                   [null, "unrecorded", false, "CAPTURE_ROUTE_UNRECORDED", EARNED_CAPTURE_CEILING]);
  assert.match(u.why, /authored/);
  assert.equal(w.prov.captureGrade(sha("never seen")).route, "unrecorded");
  const s = sha("odd route");
  w.prov.recordReceipt({ addressNorm: "e.org/o", captureSha: s, retrieved: T, via: "some-mirror" });
  const o = w.prov.captureGrade(s);
  assert.deepEqual([o.grade, o.route, o.determined, o.basis], [null, "some-mirror", false, "CAPTURE_GRADE_VIA_UNRULED"]);
});

test("R27: an authored observation earns no capture letter; its grade is testimony, and none is above the ceiling", () => {
  const w = world();
  const t = w.prov.testify({ words: "I was there.", observedAt: "2026-09-20", author: V("ruth") });
  /* Even a receipt naming its bytes does not earn it a capture letter. */
  w.prov.recordReceipt({ addressNorm: "e.org/t", captureSha: t.capture_sha, retrieved: T });
  const g = w.prov.captureGrade(t.capture_sha);
  assert.deepEqual([g.grade, g.determined, g.basis, g.testimony], [null, false, "CAPTURE_AXIS_AUTHORED", TESTIMONY_GRADE]);
  for (const via of ["direct", ARCHIVE_VIA, "x"]) {
    const s = sha(via);
    w.prov.recordReceipt({ addressNorm: `e.org/${via}`, captureSha: s, retrieved: T, via });
    const got = w.prov.captureGrade(s).grade;
    if (got !== null) assert.ok(rank(got) >= rank(EARNED_CAPTURE_CEILING), `${via}: ${got}`);
  }
});

test("R29: a member's attributed, dated, append-only declaration of a document's system", () => {
  const w = world({ now: "2026-09-27T02:00:00.000Z" });
  const a = w.cap("a");
  w.promoteInfo("INFO-2026-0001-a", { captures: [a] });
  const d1 = w.prov.declareOrigin({ bundleId: "INFO-2026-0001-a", system: "  The  clerk's agenda system ", by: V("ruth"), viewer: V("ruth") });
  assert.deepEqual(d1, { ok: true, bundleId: "INFO-2026-0001-a", system: "The clerk's agenda system", by: V("ruth"),
                         at: "2026-09-27T02:00:00Z", seq: 1 });
  w.clock.now = "2026-09-27T03:00:00.000Z";
  const d2 = w.prov.declareOrigin({ bundleId: "INFO-2026-0001-a", system: "The records portal", by: V("sam"), viewer: V("sam") });
  assert.equal(d2.seq, 2);
  assert.equal(w.count("origin_declarations"), 2, "append-only: the first stays");
  for (const who of ["token:member", "class:admin", "", null]) {
    const r = w.prov.declareOrigin({ bundleId: "INFO-2026-0001-a", system: "x", by: who, viewer: V("x") });
    assert.equal(r.reason, "ORIGIN_NOT_A_MEMBER", String(who));
  }
  assert.equal(w.prov.declareOrigin({ bundleId: "INFO-2026-0001-a", system: "x", by: V("r"), viewer: "stranger" }).reason, "NO_SUCH_BUNDLE",
               "a bundle the viewer may not see answers as absent");
  assert.equal(w.prov.declareOrigin({ bundleId: "INFO-2026-0404-x", system: "x", by: V("r"), viewer: V("r") }).reason, "NO_SUCH_BUNDLE");
  assert.equal(w.prov.declareOrigin({ bundleId: "", system: "x", by: V("r"), viewer: V("r") }).reason, "NO_BUNDLE");
  assert.equal(w.prov.declareOrigin({ bundleId: "INFO-2026-0001-a", system: " ", by: V("r"), viewer: V("r") }).reason, "ORIGIN_NO_SYSTEM");
  w.record.transact(() => w.record.commit({ bundleId: "INQ-2026-0001-q", type: "inquiry", title: "Q", project: null, snapKey: "q",
    kind: "promotion", base: "", author: V("r"), writer: null, operation: null,
    files: [{ path: "bundle.md", text: infoMd("INQ-2026-0001-q"), sha256: sha(infoMd("INQ-2026-0001-q")), bytes: 1 }],
    state: "open", priorState: null, group: "g", created: T, lastUpdated: T, criticality: null, at: T }));
  assert.equal(w.prov.declareOrigin({ bundleId: "INQ-2026-0001-q", system: "x", by: V("r"), viewer: V("r") }).reason, "ORIGIN_NOT_A_DOCUMENT");
});

test("R30: originOf answers the standing (latest) declaration, or null", () => {
  const w = world();
  const a = w.cap("a");
  w.promoteInfo("INFO-2026-0001-a", { captures: [a] });
  assert.equal(w.prov.originOf("INFO-2026-0001-a"), null);
  w.prov.declareOrigin({ bundleId: "INFO-2026-0001-a", system: "First", by: V("ruth"), viewer: V("ruth") });
  w.clock.now = "2026-09-28T00:00:00.000Z";
  w.prov.declareOrigin({ bundleId: "INFO-2026-0001-a", system: "Second", by: V("sam"), viewer: V("sam") });
  assert.deepEqual(w.prov.originOf("INFO-2026-0001-a"), { system: "Second", by: V("sam"), at: "2026-09-28T00:00:00Z" });
  assert.equal(w.prov.originOf("INFO-2026-0404-x"), null);
});
