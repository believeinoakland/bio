/* case-disclosures, G47 (T51 fix round 6; K4666, K4669, K4671, K4672): a case document of many materials. The body printed,
   under each material row, every attestation whose `ref` equals the row's, and `materialRows` made one set per material, so
   k captures of one source printed k sets under each row (R17's 501 captures: 15.6 MB of one line) and each capture showed
   the OTHER captures' lines. `materialRows` now sets `sha` on an attestation only where the material's `ref` occurs on two
   or more materials; `carriesBodyLines` joins by `sha` when the attestation has one, else by `ref` (R7, R10).
   Every case here is built by the real `materialRows` (through `disclosureBlocks`) over real captures of one bundle
   (`w.captures`), never a hand-made array. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, sha as sha256 } from "./fixture.mjs";
import { carriesBodyLines, materialRows } from "../../../src/case-disclosures/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const AT = "2026-09-28T01:00:00Z";
const Q = "INQ-2026-0001-q";
const SRC = "INFO-2026-0001-a";

/* One leg per capture, each naming a content row over its own capture (a passage), so the chain reaches that capture only. */
function legsOver(w, shas) {
  return shas.map((sha, i) => { const id = sha256(`g47 passage ${i}`); w.content(id, sha, SRC); return { target: SRC, content_id: id }; });
}
function setup() { const w = world(); for (const m of ["alice", "bo"]) w.member(m); return w; }
/* What `publishCase` asks after its last refusal: R6's judgment, then R7's blocks. */
function blocks(w, members = [Q]) {
  const reached = w.cd.materialsJudged(w.prepared(members), w.roles(members, []), V("alice"));
  assert.equal(reached.refusals.length, 0, JSON.stringify(reached.refusals).slice(0, 400));
  const withheld = w.cd.withheldOf(w.cd.sourcesStated(reached.materials.filter((m) => m.kind === "document").map((m) => m.sha), V("alice")));
  return w.cd.disclosureBlocks({ reached, withheld, attributionOf: new Map(), project: "PROJ-x", author: "alice", at: AT });
}
/* The body's lines under each row, by the row's fingerprint (each row line states its own `sha`). */
function underRows(out) {
  const lines = carriesBodyLines(null, out.materials, out.group);
  const at = out.materials.rows.map((r) => lines.findIndex((l) => l.includes(r.sha)));
  assert.ok(at.every((i, k) => i >= 0 && (k === 0 || i > at[k - 1])), "every row is printed once, in order");
  return out.materials.rows.map((r, k) => ({ row: r, lines: lines.slice(at[k] + 1, k + 1 < at.length ? at[k + 1] : undefined)
    .filter((l) => l.startsWith("  - ")) }));
}
const registeredAt = (w, sha) => w.st.sql.exec(`SELECT registered FROM register WHERE capture_sha=?`, sha)[0].registered;

test("R7, R10 (G47 (4)): 501 captures of one source print under each row only that capture's attestations, the body stays small, and the front matter's rows for that ref carry `sha`", () => {
  const w = setup();
  const shas = w.captures(SRC, 501);
  w.finding(Q, legsOver(w, shas));
  const out = blocks(w);
  assert.equal(out.materials.rows.length, 501);
  assert.deepEqual(out.materials.rows.map((r) => r.sha), shas);
  assert.ok(out.materials.rows.every((r) => r.ref === SRC));
  /* the front matter's rows: every attestation of this ref carries its capture's `sha`, one project row and one group row each */
  assert.ok(out.materials.attestations.every((a) => a.ref === SRC && shas.includes(a.sha)));
  for (const s of shas) assert.deepEqual(out.materials.attestations.filter((a) => a.sha === s).map((a) => a.by_kind), ["project", "group"]);
  /* the body is linear in the rows: n rows cost n times one row (its own row line and its own two attestation lines),
     not n times n (15.6 MB before) */
  const body = Buffer.byteLength(carriesBodyLines(null, out.materials, out.group).join("\n"));
  const first = out.materials.rows[0];
  const one = Buffer.byteLength(carriesBodyLines(null, { rows: [first], attestations: out.materials.attestations.filter((a) => a.sha === first.sha) }, out.group).join("\n"));
  const none = Buffer.byteLength(carriesBodyLines(null, { rows: [], attestations: [] }, out.group).join("\n"));
  assert.ok(body <= none + 501 * (one - none) * 1.01, `the body is ${body} B for 501 rows of ${one - none} B each`);
  assert.ok(body < 300_000, `the body is ${body} B`);
  const under = underRows(out);
  assert.ok(under.every((u) => u.lines.length === 2), "two attestation lines a row");
  /* each row states its own capture's registration time, and no other capture's */
  for (const u of under) {
    const own = registeredAt(w, u.row.sha);
    assert.ok(u.lines.join("\n").includes(own));
    const others = new Set(shas.map((s) => registeredAt(w, s)));
    others.delete(own);
    for (const o of others) assert.ok(!u.lines.join("\n").includes(o), `${u.row.sha} printed another capture's time ${o}`);
  }
});

test("R7, R10 (G47 (4)): two captures of one source print each its own lines, never the other's; the project row of each names its own registration", () => {
  const w = setup();
  const [a, b] = w.captures(SRC, 2, { at: (i) => (i ? "2026-09-27T19:42:00Z" : "2026-09-27T07:05:00Z") });
  w.finding(Q, legsOver(w, [a, b]));
  const out = blocks(w);
  assert.deepEqual(out.materials.attestations.map((x) => [x.sha, x.by_kind, x.at]), [
    [a, "project", "2026-09-27T07:05:00Z"], [a, "group", AT], [b, "project", "2026-09-27T19:42:00Z"], [b, "group", AT]]);
  const [ua, ub] = underRows(out);
  assert.equal(ua.row.sha, a);
  assert.equal(ub.row.sha, b);
  assert.equal(ua.lines.length, 2);
  assert.equal(ub.lines.length, 2);
  assert.ok(ua.lines[0].includes("2026-09-27T07:05:00Z") && !ua.lines.join("").includes("19:42"));
  assert.ok(ub.lines[0].includes("2026-09-27T19:42:00Z") && !ub.lines.join("").includes("07:05"));
});

test("R7, R10 (G47 control, K4671, K4672): materials of three sources carry no `sha` on any attestation, and print each its own lines as before", () => {
  const w = setup();
  const ids = ["INFO-2026-0001-a", "INFO-2026-0002-b", "INFO-2026-0003-c"];
  const shas = ids.map((id) => w.doc(id));
  w.finding(Q, ids.map((target) => ({ target })));
  const out = blocks(w);
  assert.deepEqual(out.materials.rows.map((r) => [r.ref, r.sha]), ids.map((id, i) => [id, shas[i]]));
  assert.ok(out.materials.attestations.every((a) => !("sha" in a)), "no attestation states a sha");
  const under = underRows(out);
  /* the old rule, by `ref`: a row's lines are those of the attestations of its ref, in the order they were made */
  assert.deepEqual(under.map((u) => u.lines.length), out.materials.rows.map((r) => out.materials.attestations.filter((a) => a.ref === r.ref).length));
  assert.ok(under.every((u) => u.lines.at(-1).includes(word("case-disclosures.vouches_signing_case", { group: "test-group" }))));
});

test("R7 (G47 (4), K4672): `materialRows` sets `sha` only on the refs that occur on two or more materials, counted over all the materials of the call", () => {
  const w = setup();
  const [a, b] = w.captures(SRC, 2);
  const other = w.doc("INFO-2026-0002-b");
  w.finding(Q, [...legsOver(w, [a, b]), { target: "INFO-2026-0002-b" }]);
  const out = blocks(w);
  assert.deepEqual(out.materials.rows.map((r) => r.sha), [a, b, other]);
  assert.deepEqual(out.materials.attestations.map((x) => [x.ref, "sha" in x ? x.sha : undefined, x.by_kind]), [
    [SRC, a, "project"], [SRC, a, "group"], [SRC, b, "project"], [SRC, b, "group"],
    ["INFO-2026-0002-b", undefined, "project"], ["INFO-2026-0002-b", undefined, "group"]]);
  /* the same on a bare call: two materials of one ref, one of another */
  const rows = materialRows(
    [["r", "s1"], ["r", "s2"], ["q", "s3"]].map(([ref, sha]) => ({ ref, kind: "observation", sha, held: { text_sha: null }, included: true, rests_under: "supporting" })),
    { project: "p", group: "g", at: "t", facts: () => null, origin: () => null, registered: () => null, member: () => [] });
  assert.deepEqual(rows.attestations.map((x) => [x.ref, x.sha ?? null]), [["r", "s1"], ["r", "s2"], ["q", null]]);
});
