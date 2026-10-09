import { test } from "node:test";
import assert from "node:assert/strict";
import { world, everyStatement } from "./fixture.mjs";
import { compile, viewerPredicate, GATE_MARK } from "../../../src/query.mjs";

const V = "class:member";
/* A relation of the caller's own naming, its key not `bundle_id`: nothing here may assume retrieval's names. */
const REL = { table: "proj_rel", key: "bid" };

/* One corpus, written into a world with the projection on `bundles` and into one with it in REL. */
function both() {
  const ws = [world(), world({ projection: REL })];
  for (const w of ws) {
    w.member("ann");
    w.bundle("A", { title: "water main", body: "the water main broke", current_state: "open", created: "2026-01-05",
      annotations_open: 3, schema_id: "s1", source_status: "live", locator: "https://x.example/a", authority: "Clerk",
      fm: { a: { b: "c" } }, criticality: "high", inquiry_capture_strength: "B" });
    w.bundle("B", { type: "inquiry", title: "budget", body: "water budget shortfall", current_state: "closed",
      annotations_open: 0, schema_id: "s2", reeval_flag: 1, action_kind: "letter", action_risk_tier: 2,
      inquiry_capture_strength: "A", inquiry_connection_strength: "C" });
    w.bundle("C", { title: "sewer", body: "sewer fund watering", annotations_open: 7, source_status: "gone",
      monitor_enabled: 1, action_clock_overdue: 1 });
    w.bundle("PR", { type: "project", title: "hidden", body: "water water water", schema_id: "s1" });
    w.bundle("D", { title: "streets", body: "nothing of note" });
    /* D54 (membership R43): PR is hidden (the index holds no setting for it), PD discoverable; erin is an
       administrator. */
    w.member("erin", "admin");
    w.bundle("PD", { type: "project", title: "open", body: "water", schema_id: "s1" });
    w.sight("PD", "discoverable");
    w.insert("inquiry_basis", { bundle_id: "B", ord: 0, target_id: "A", grade_source: "hunch", grade: "B" });
    w.insert("inquiry_basis", { bundle_id: "B", ord: 1, target_id: "PR", grade_source: "documented" });
    w.insert("resolutions", { bundle_id: "A", capture_sha: "s", ref: "r", entity_id: "ENT-1", grade: "C" });
    w.insert("content", { content_id: "c1", capture_sha: "s", bundle_id: "A", extent_kind: "pdf-page", extent: "{}",
      chain_kind: "ocr", derivation_cap: "B", minted_by: "plane", stale: 0 });
    w.insert("capture_text", { capture_sha: "s", bundle_id: "A", extent_kind: "pdf-page", extent: "{}", ref: "p1",
      seq: 0, text: "the culvert failed", chain_kind: "ocr" });
    w.insert("register", { capture_sha: "s", bundle_id: "A", registered: "t" });
    w.insert("observation_log", { seq: 1, level: "content", subject_kind: "capture", authority_kind: "extract",
      subject: "s", state: "PRESENT" });
  }
  return ws;
}

const QUERIES = ["", "water", "water -main state:open", "water main", "leg:hunch", "resolves:>=B", "concerns:ENT-1",
  "content:ocr content:cap<C", "passage:culvert", "NEAR(water main, 3) OR created:>2026-01-01", "has:capture fm:a.b=c",
  "fm:a", "(title:water OR locator:example) -authority:clerk", "schema:s1", "status:LIVE OR annotations:>2",
  "annotations:1..9 -reeval:true", "actionkind:letter risk:>=2", "overdue:true", "has:monitored", "id:A OR id:C",
  "capture:<=B connection:C", "-schema:s2", Array.from({ length: 9 }, (_, i) => `schema:x${i}`).join(" OR ") + " OR water"];
const ROWS = [null, "leg", "resolves", "content", "passage"];
const OPTS = [{}, { ids: ["A", "B", "PR"] }, { sort: "schema", dir: "asc" }, { sort: "annotations" }, { sort: "retrieved" },
  { facets: ["status", "schema", "risk", "capture", "type", "tier"] }];

test("R25 the projection is read through the relation the caller names, keyed by its key and its fts_id; with none, from bundles", () => {
  const [flat, split] = both();
  let compared = 0;
  for (const viewer of [V, "member:ann", "admin", "member:erin", null])
    for (const q of QUERIES)
      for (const rows of ROWS)
        for (const o of OPTS) {
          const opts = { q, viewer, rows, ...o };
          const plain = compile(opts), named = compile(opts, { projection: REL });
          const a = everyStatement(plain), b = everyStatement(named);
          assert.deepEqual(b.map(([k]) => k), a.map(([k]) => k));
          const gate = viewerPredicate(viewer);
          b.forEach(([shape, s], i) => {
            /* The same answer, row for row, though `bundles` in `split` holds none of the projection's columns. */
            assert.deepEqual(split.all(s), flat.all(a[i][1]), `${shape} ${JSON.stringify(opts)}`);
            assert.ok(s.sql.includes(REL.table), `${shape} reads the named relation`);
            assert.ok(!a[i][1].sql.includes(REL.table), `${shape} names the relation only when given`);
            /* R8 holds through the relation: every gate mark is the one gate's. */
            assert.equal(s.sql.split(GATE_MARK).length - 1, s.sql.split(gate.sql).length - 1, shape);
            compared++;
          });
        }
  assert.ok(compared > 3000, `${compared} statements compared`);
  /* D54 through the relation: the hidden PR is withheld from the founder and an administrator as from ann, on the
     page, the count and a relevance order; the discoverable PD is theirs, and not ann's. */
  for (const [viewer, want] of [[V, ["PD", "PR"]], ["member:ann", []], ["admin", ["PD"]], ["member:erin", ["PD"]]]) {
    const named = compile({ q: "water type:project", viewer }, { projection: REL });
    assert.deepEqual(split.all(named.statements.page()).map((r) => r.bundle_id).sort(), want, viewer);
    assert.deepEqual(split.all(named.statements.count()), [{ n: want.length }], viewer);
  }
  /* This module names no later module's table: the relation's name is only ever the caller's. */
  for (const [, s] of everyStatement(compile({ q: "water schema:s1", viewer: V, rows: "leg" }, { projection: { table: "t9", key: "k9" } })))
    assert.ok(!/bundle_projection/.test(s.sql) && /\bt9\b/.test(s.sql));
  /* R7 through the relation: member input still moves only args. */
  const sqlOf = (q) => everyStatement(compile({ q, viewer: V, rows: "leg" }, { projection: REL })).map(([, s]) => s.sql);
  assert.deepEqual(sqlOf(`schema:"x'); DROP TABLE bundles; --" fm:a="' OR 1=1 --"`), sqlOf(`schema:"y" fm:a="z"`));
  /* Not a relation: said, and the projection read from bundles; never interpolated, never a throw. */
  for (const bad of [{ table: "x; DROP TABLE bundles", key: "k" }, { table: "t" }, { table: "t", key: "k k" }, "t", 7, true]) {
    const p = compile({ q: "schema:s1", viewer: V }, { projection: bad });
    assert.ok(p.warnings.includes("projection: not a table and a key; the projection is read from bundles"), JSON.stringify(bad));
    assert.deepEqual(everyStatement(p), everyStatement(compile({ q: "schema:s1", viewer: V })));
  }
  for (const none of [undefined, null, {}, { projection: null }, 7])
    assert.deepEqual(compile({ q: "water", viewer: V }, none).warnings, [], JSON.stringify(none));
});
