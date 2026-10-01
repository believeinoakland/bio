/* legacy-store: the owners' ops maps its dispatch spreads in place of its own explicit arms (T19 L10; K671, K783, K798,
   K801, K834): content (R50), provenance (R53), record-core (R72), promotion (R54) and escalation (R25). Each op of each
   map is a route of the store, answering exactly what the module's own map answers for the same request on a store in
   the same state; the testimony path's later work runs through provenance's slot (R52) inside `op=testify`'s
   promotion; the store's figures report each registered figure once, as its module counts it; and a second
   construction on one storage migrates idempotently and seeds the PROJ ledger from the live bundles. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { store, Store } from "./fixture.mjs";
import { contentOf, contentOps } from "../../../src/content/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { provenanceOps } from "../../../src/provenance/ops.mjs";
import { recordOf, recordCoreOps } from "../../../src/record-core/index.mjs";
import { promotionOf, promotionOps } from "../../../src/promotion/index.mjs";
import { escalationOf, escalationOps } from "../../../src/escalation/index.mjs";
import { viewerPredicate } from "../../../src/membership/index.mjs";
import { OBSERVATION_LOG_MODULE } from "../../../src/observation-log/index.mjs";

/* Each owner's map, built on a host as the store builds it. */
const MODULES = {
  content: (ctx, url, body) => contentOps(contentOf(ctx), url, body),
  provenance: (ctx, url, body) => provenanceOps(provenanceOf(ctx), url, body, { observer: OBSERVATION_LOG_MODULE }),
  "record-core": (ctx, url, body) => recordCoreOps(recordOf(ctx), url, body, { sight: viewerPredicate }),
  promotion: (ctx, url, body) => promotionOps(promotionOf(ctx), url, body),
  escalation: (ctx, url, body) => escalationOps(escalationOf(ctx), url, body),
};
const COUNT = { content: 8, provenance: 9, "record-core": 7, promotion: 3, escalation: 10 };
const QUERY = "?viewer=member:nobody&author=member:nobody&attestor=member:nobody&transcriber=member:nobody"
  + "&mintedBy=member:nobody&id=X-none&bundleId=X-none&target=X-none&prefix=T&year=2026&sha256=" + "0".repeat(64);
/* What two stores built a moment apart may differ in: the wall clock. */
const strip = (v) => JSON.parse(JSON.stringify(v ?? null)
  .replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z/g, "<T>").replace(/\d{8}T\d{6}Z/g, "<T>"));
/* The same object, in any key order. */
const sorted = (v) => Array.isArray(v) ? v.map(sorted)
  : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sorted(v[k])])) : v;

test("every op of content (R50), provenance (R53), record-core (R72), promotion (R54) and escalation (R25) is a route of the store, answering as the module's own map does", async () => {
  const url = new URL("http://do/x" + QUERY);
  for (const [mod, ops] of Object.entries(MODULES)) {
    const probe = await store();
    const keys = Object.keys(ops(probe.ctx, url, {}));
    assert.equal(keys.length, COUNT[mod], `${mod} publishes its ops`);
    for (const op of keys) {
      const viaStore = await store(), direct = await store();
      const map = viaStore.s.routes(url, {});
      assert.ok(Object.hasOwn(map, op), `${mod}'s op=${op} is a route of the store`);
      const a = strip(await map[op]()), b = strip(await ops(direct.ctx, url, {})[op]());
      assert.deepEqual(sorted(a), sorted(b), `${mod}'s op=${op} answers through the store as through its own map`);
    }
  }
});

test("op=testify runs the testimony path's later work through provenance's slot (R52), inside its promotion: the words indexed, the content row minted and the look logged", async () => {
  const x = await store();
  const r = await x.call("/testify?author=member:m-riley", { words: "The gate on the north side was chained shut.",
                                                               observedAt: "2026-09-01" });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.match(String(r.content_id), /^[0-9a-f]{64}$/, "the answer names the content row the slot minted");
  const sql = x.ctx.storage.sql;
  const row = [...sql.exec(`SELECT bundle_id, capture_sha FROM content WHERE content_id = ?`, r.content_id)];
  assert.deepEqual(row.map((o) => ({ ...o })), [{ bundle_id: r.bundle_id, capture_sha: r.capture_sha }]);
  const look = [...sql.exec(`SELECT authority_kind, state, result_ref FROM observation_log WHERE subject = ? AND authority_kind = 'extract'`,
                            r.capture_sha)].map((o) => ({ ...o }));
  assert.deepEqual(look, [{ authority_kind: "extract", state: "PRESENT", result_ref: r.content_id }], "the extraction look");
  const axis = [...sql.exec(`SELECT count(*) AS n FROM observation_log WHERE subject = ?`, r.capture_sha)][0].n;
  assert.ok(axis >= 1);
  /* A refused testimony (no words) writes nothing at all. */
  const before = [...sql.exec(`SELECT count(*) AS n FROM content`)][0].n;
  const bad = await x.call("/testify?author=member:m-riley", { words: "", observedAt: "2026-09-01" });
  assert.equal(bad.ok, false);
  assert.equal([...sql.exec(`SELECT count(*) AS n FROM content`)][0].n, before);
});

test("op=stats and purge's proof answer each figure a module registers (record-core R63) as that module counts it", async () => {
  const x = await store();
  const registered = recordOf(x.ctx).counts(null);
  assert.ok(Object.keys(registered).length > 0);
  const stats = await x.call("/stats", null);
  const proof = recordOf(x.ctx).proofCounts();
  const WIRE_HIDDEN = new Set(["themes", "themePlacements", "leads", "observations"]);
  for (const [k, v] of Object.entries(registered)) {
    if (!WIRE_HIDDEN.has(k)) assert.equal(stats[k], v, `stats ${k}`);
    assert.equal(proof[k], v, `proof ${k}`);
  }
  for (const k of ["bundles", "files", "history", "refs", "textIndexOk", "projectParticipants", "basisVersions"])
    assert.ok(Object.hasOwn(stats, k), `the store's own figure ${k}`);
});

test("a second construction on one storage migrates idempotently, and the PROJ ledger is seeded from the live bundles", async () => {
  const x = await store();
  const sql = x.ctx.storage.sql;
  const cols = [...sql.exec(`PRAGMA table_info(bundles)`)].filter((c) => c.pk || (c.notnull && c.dflt_value === null));
  const id = "PROJ-2026-zz-seed";
  sql.exec(`INSERT INTO bundles (${cols.map((c) => c.name).join(",")}) VALUES (${cols.map(() => "?").join(",")})`,
           ...cols.map((c) => (c.name === "bundle_id" ? id : /INT/i.test(c.type) ? 0 : "x")));
  const schema = () => [...sql.exec(`SELECT type, name, sql FROM sqlite_master ORDER BY type, name`)].map((r) => ({ ...r }));
  const was = schema();
  new Store(x.ctx, x.env);
  await new Promise((r) => setImmediate(r));
  assert.deepEqual(schema(), was, "the second migration changes no table");
  const m = [...sql.exec(`SELECT source FROM minted_ids WHERE id = ?`, id)].map((r) => r.source);
  assert.deepEqual(m, ["live"]);
});
