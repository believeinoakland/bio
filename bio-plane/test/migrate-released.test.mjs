/* NEGATIVE CONTROL: `node test/migrate-released.control.mjs [arm]` from `bio-plane/` re-runs every arm in one step. DECLARED BEFORE ARMING, then MEASURED 2026-09-18 by the REC-143 worker, every restore sha256 MATCH / content IDENTICAL: (a) `baseline` — nothing armed -> green: MEASURED 201 pass, 0 fail. (b) `alterafter` — THIS EXACT BUG: the pre-schema `addColumns()` removed, so the additive list runs only AFTER the schema, as it did in 0.59.0-0.63.0 -> every store 0.58.0 wrote (born on 0.58.0, and each of the five 0.58.0 -> withdrawn -> 0.58.0 paths) FAILS naming `no such column: content_id`; MUST NOT FAIL: section 0, section 1 (the released bytes still match their manifests), and the five stores BORN on 0.59.0-0.63.0, whose tables already carry the column. MEASURED 135 pass, 66 fail, the one engine error in any `got` line `no such column: content_id`, and NO failure outside the six 0.58.0-written stores — as declared. (c) `nosecondpass` — the post-schema `addColumns()` removed -> a FRESH store bricks (the post-schema `bundles_<col>` indexes meet a `bundles` with none of its list-only columns), so section 0's reference FAILS: MEASURED 176 pass, 25 fail, engine error `no such column: schema_id`; the three section-0 assertions, plus two per migrated store (`no table a fresh store lacks`, against the empty reference, and `op=selftest`, whose scratch store is a fresh one). The fix is two passes and each is load-bearing. (d) `percolumn` — OVER-STRICTNESS: a DIFFERENT correct fix, only the three sweep-found columns added before the schema (the per-column special case this item declined) -> MUST PASS, because the suite tests what a store does and not how `#migrate` is spelled: MEASURED 201 pass, 0 fail. FIRST RUN, RECORDED RATHER THAN SMOOTHED: the driver's engine-error scan read the WHOLE output and named `no such column: content_id` on the BASELINE — the suite's own labels on the upgrade-path REPRODUCTION assertions quote the error they reproduce. It now reads `got` lines only. */
/* REC-143 — A STORE WRITTEN BY A RELEASED PLANE BOOTS ON THIS ONE.
 *
 * WHY THIS SUITE EXISTS. Every release from 0.59.0 to 0.63.0 BRICKED an existing
 * store: `#migrate` ran the whole schema before its additive ALTER list, the schema
 * carried an index on a column only that list adds, and on a store created before
 * the column existed the index threw inside `blockConcurrencyWhile`. The Durable
 * Object then answered nothing. **The battery never saw it because every suite
 * builds a FRESH store**, and a fresh store gets every column from CREATE TABLE.
 * DIST found it live on biosmoke7, at 0.62.0.
 *
 * SO THE FIXTURE IS THE RELEASED PLANE ITSELF, NOT A SCHEMA SOMEBODY TYPED. For each
 * release a group may hold, the SIGNED BUNDLE is read out of git at the commit that
 * carries that release's manifest, its sha256 is checked against the manifest's own
 * `sha256`, and THAT plane builds and writes the store. Then the current plane boots
 * on the same storage. A suite that built the old shape by hand could agree with
 * itself for free; the released bytes cannot, because nobody here chose them.
 *
 * WHAT IT ASSERTS, per release: (1) the old plane made a store and wrote rows into
 * it; (2) the current plane ANSWERS on that store — `op=bootstrap`, `op=stats` and
 * `op=audit` all reach the Durable Object, and `op=selftest` answers; (3) the
 * migrated store has EXACTLY THE SHAPE A FRESH ONE HAS — every table, every column
 * (read with `table_xinfo`, so a generated column is seen), every index and trigger
 * a fresh store holds, and no table a fresh store lacks; (4) the rows the old plane
 * wrote survive, value for value; (5) a SECOND boot is clean.
 *
 * Property (3) is the general form of the sweep: it catches an ALTER-added column a
 * schema statement depends on (this defect), AND the reverse — a column the schema
 * assumes that nothing ever adds to an old table — with no list anybody maintains.
 *
 * WHAT IT CANNOT SEE: a store shape no release in RELEASES produced (a store born on
 * a release before 0.58.0 and never upgraded is not driven here — 0.58.0 is the last
 * release known to boot, so it is the floor a group can be standing on), and data
 * semantics beyond the rows seeded below. AND THE REFERENCE IS BUILT BY THE CODE UNDER
 * TEST: a defect that left a fresh store and a migrated one lacking the SAME thing
 * would compare equal here. That half is every other suite's, which all build fresh.
 *
 * TWO PATHS PER STORE A GROUP MAY HOLD. Sections 2-7: a store BORN on each release.
 * Sections 8-12: the path a group actually walked — born on 0.58.0, upgraded to a
 * withdrawn release (whose own bytes must brick it, the reproduction), rolled back to
 * 0.58.0 as DIST rolled biosmoke7 back, then upgraded to this plane.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${String(JSON.stringify(got)).slice(0, 1500)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const NOW = "2026-09-18T00:00:00Z";

/* THE RELEASES A GROUP MAY HOLD. 0.58.0 is the last release that boots an existing
   store and the one DIST rolled back to; 0.59.0-0.63.0 are the five WITHDRAWN from
   `release/` (d86b27ea). Pinned by COMMIT rather than by tag, because a clone need not
   carry tags and a tag can be moved; the commit named is the one whose `release/`
   holds that version's manifest. 0.58.0 is `db7589b8`, the manifest commit the row
   names — its bundle is byte-identical to the one at the `v0.58.0` tag (9ed18019),
   measured 2026-09-18. */
const RELEASES = [
  ["0.58.0", "db7589b80c1d126e8d6345033b70319ef9d1e3a2"],
  ["0.59.0", "c53d9d926368ba75275bc2f641a9d337690914bb"],
  ["0.60.0", "76b2a5c64ebd99a944b7a10d28b620390997d95e"],
  ["0.61.0", "b57b8de21382163a2d73ef319ee481ae7418854c"],
  ["0.62.0", "2773ee2751bc0b3a54c755d177d9280e83535760"],
  ["0.63.0", "3d941c08b2aba5bfa9b639575159b59b3d21ec37"],
  /* 0.64.0: the first release that boots every store above, deployed and live-verified
     2026-09-19; the commit is dist/cut-0.64.0's cut, whose release/ holds it (DIST). */
  ["0.64.0", "a8bc9d91eca9f6f30aff2133f608ad423dc5e411"],
  /* 0.65.0: deployed and live-verified 2026-09-19 (REC-145 and D-431 disclosure closings,
     REC-141 + UI-66); the commit is dist/cut-0.65.0's cut, whose release/ holds it (DIST).
     It boots every store above, so it belongs in RELEASES and NOT in WITHDRAWN. */
  ["0.65.0", "22a72fa1454e4f801fd78d486c111a86f69452a9"],
  /* 0.66.0: deployed and live-verified 2026-09-19 (REC-152 and REC-153, two AUTHORITY
     closings, REC-152 also DISCLOSURE); the commit is dist/cut-0.66.0's cut, whose
     release/ holds it (DIST). It boots every store above: RELEASES, NOT WITHDRAWN. */
  ["0.66.0", "75069c8115f09821688722825ebf9fb10029891a"],
  /* 0.67.0: deployed and live-verified 2026-09-19 (REC-151, an AUTHORITY/DISCLOSURE
     closing: op=allocid refuses every gated prefix, ids mint opaque); the commit is
     dist/cut-0.67.0's cut, whose release/ holds it. RELEASES, NOT WITHDRAWN. */
  ["0.67.0", "527257198d5026325bb8653f3b3bd6b7cde80fde"],
  /* 0.68.0: deployed and live-verified 2026-09-20, the first BATCH (IC-55 / D-270+UI-72,
     IC-166 / REC-135, IC-167 / REC-146); the commit is dist/cut-0.68.0's cut, whose
     release/ holds it. It boots every store above: RELEASES, NOT WITHDRAWN. */
  ["0.68.0", "49c4b400ab87bb52821a1eef19d8109a02d2778b"],
];
const gitShow = (commit, path) =>
  execFileSync("git", ["show", `${commit}:${path}`], { cwd: ROOT, maxBuffer: 64 << 20 });

const TOK = { ADMIN_TOKEN: "adm-rec143-migrate-fixture", MEMBER_TOKEN: "mem-rec143-migrate-fixture",
              PROBE_TOKEN: "prb-rec143-migrate-fixture", AI_TOKEN: "ai-rec143-migrate-fixture" };

/* A probe beside the plane, so the store's own SQLite can be read. It subclasses the
   plane's Store and adds ONE route; every other request is the plane's own. The
   class name is the same for the old plane and the new, so both address ONE store. */
const probe = (planeSpec, storeSpec) => `
import worker from ${JSON.stringify(planeSpec)};
import { Store } from ${JSON.stringify(storeSpec)};
export class ProbeStore extends Store {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/rawsql") {
      const { sql, args = [] } = await req.json();
      try { return Response.json({ ok: true, rows: [...this.sql.exec(sql, ...args)] }); }
      catch (e) { return Response.json({ ok: false, error: String(e && e.message || e) }); }
    }
    return super.fetch(req);
  }
}
export default {
  async fetch(req, env, ctx) {
    if (new URL(req.url).pathname === "/rawsql")
      return env.STORE.get(env.STORE.idFromName("bio")).fetch(req);
    return worker.fetch(req, env, ctx);
  },
};
`;
const boot = (scriptPath, script, persist, version) => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath, script,
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "ProbeStore", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ...TOK, VERSION: version },
  defaultPersistRoot: persist,
});
const bootCurrent = (persist) =>
  boot(SRC("rec143-migrate-probe.mjs"), probe("./index.mjs", "./store.mjs"), persist, "current");

/* A RESPONSE THAT IS NOT JSON IS AN ANSWER, NOT A CRASH — `content-chain-kind`'s rule:
   a bricked Durable Object answers with an error page, and `.json()` on it would end
   the module with no tally, which names nothing. */
const asJson = async (res) => { const txt = await res.text();
  try { return JSON.parse(txt); } catch { return { ok: false, status: res.status, error: `non-JSON ${res.status}: ${txt.slice(0, 300)}` }; } };
const client = (mf) => ({
  raw: async (sql, ...args) => asJson(await mf.dispatchFetch("http://x/rawsql",
    { method: "POST", body: JSON.stringify({ sql, args }) })),
  get: async (op, qs = "", tok = TOK.MEMBER_TOKEN) =>
    asJson(await mf.dispatchFetch(`http://x/api/?op=${op}&token=${tok}&${qs}`)),
  post: async (op, body, tok = TOK.MEMBER_TOKEN) =>
    asJson(await mf.dispatchFetch(`http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })),
});
const errOf = (r) => r && (r.error || r.reason || r.code) ? String(r.error || r.reason || r.code) : null;

/* The store's SHAPE: every table (with every column, hidden ones included), every
   index and every trigger, by name. SQLite's own and Cloudflare's internal tables
   are not the schema's and are left out. */
const shapeOf = async (c) => {
  const m = await c.raw(`SELECT type, name, tbl_name FROM sqlite_master
                          WHERE name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY type, name`);
  if (!m.ok) return { error: m.error };
  const tables = {}, others = [];
  for (const r of m.rows) {
    if (r.type === "table") {
      const x = await c.raw(`PRAGMA table_xinfo(${r.name})`);
      tables[r.name] = (x.rows || []).map((k) => k.name).sort();
    } else if (r.type === "index" || r.type === "trigger" || r.type === "view") others.push(`${r.type}:${r.name}`);
  }
  return { tables, others: others.sort() };
};

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

/* ==================================================================== 0
 * THE REFERENCE: a store the CURRENT plane builds fresh. The shape every migrated
 * store must equal.
 * ================================================================== */
console.log("\n--- 0. the reference shape: a fresh store on the current plane ---");
const freshMf = bootCurrent(mkdtempSync(join(tmpdir(), "rec143-fresh-")));
const FRESH = await shapeOf(client(freshMf));
await freshMf.dispose();
const freshTables = Object.keys(FRESH.tables || {});
console.log(`    fresh store: ${freshTables.length} tables, ${(FRESH.others || []).length} indexes/triggers/views`);
t("ARMED: the fresh reference store answered its own schema", FRESH.error ?? null, null);
/* Floored, because a shape comparison against an EMPTY reference passes for free. */
t("ARMED: the fresh reference is non-trivial (>= 80 tables, >= 100 indexes and triggers)",
  [freshTables.length >= 80, (FRESH.others || []).length >= 100], [true, true]);
t("ARMED: the fresh reference carries the three indexes the sweep found on list-added columns",
  ["index:inquiry_basis_content", "index:inquiry_basis_version_legs_content", "index:reading_text_source_cal"]
    .map((n) => (FRESH.others || []).includes(n)), [true, true, true]);

/* ==================================================================== 1
 * THE FIXTURES: each release's SIGNED bytes, read from git and checked against the
 * manifest that release shipped with.
 * ================================================================== */
console.log("\n--- 1. the fixtures are the signed releases, read from git ---");
const PLANE = {};
for (const [version, commit] of RELEASES) {
  let bundle, manifest;
  try {
    bundle = gitShow(commit, "release/bio-plane.bundled.mjs");
    manifest = JSON.parse(gitShow(commit, "release/RELEASE.json").toString("utf8"));
  } catch (e) {
    /* NOT A SKIP. A clone without this history cannot run the regression this item
       exists for, and a green run that silently did not drive it is the failure the
       battery's own named-skip rule refuses. */
    t(`${version}: the released bundle and manifest are readable from git at ${commit.slice(0, 8)}`,
      String(e && e.message || e).slice(0, 200), "readable");
    continue;
  }
  t(`${version}: the fixture IS the signed release — the manifest at ${commit.slice(0, 8)} names this version, and the bytes hash to its sha256`,
    [manifest.version, manifest.asset, sha(bundle), bundle.length],
    [version, "bio-plane.bundled.mjs", manifest.sha256, manifest.bytes]);
  const dir = mkdtempSync(join(tmpdir(), `rec143-plane-${version}-`));
  writeFileSync(join(dir, "plane.mjs"), bundle);
  PLANE[version] = dir;
}
t("ARMED: every release in the list is a fixture", Object.keys(PLANE).length, RELEASES.length);
const bootRelease = (version, persist) =>
  boot(join(PLANE[version], "probe.mjs"), probe("./plane.mjs", "./plane.mjs"), persist, version);

/* THE OLD PLANE writes the store: one document promoted THROUGH ITS OWN OP, and a
   basis leg and a version leg written in its own column set — the two tables whose
   `content_id` index bricked 0.59.0-0.63.0. Raw, because an inquiry's leg must exist
   BEFORE the migration runs and the old plane is the only writer that can put one
   there. Returns the rows the migration must preserve, read back from the old plane. */
const ROWS_Q = [
  "SELECT bundle_id, bundle_sha, current_state FROM bundles ORDER BY bundle_id",
  "SELECT bundle_id, ord, target_id, role, grade, grade_axis, grade_source, note, at FROM inquiry_basis ORDER BY bundle_id, ord",
  "SELECT bundle_id, name, ord, target_id, role, note, ground FROM inquiry_basis_version_legs ORDER BY bundle_id, name, ord",
  "SELECT count(*) AS n FROM files",
  "SELECT count(*) AS n FROM manifest",
];
let seq = 0;
const seed = async (label, version, persist) => {
  const mf = bootRelease(version, persist);
  const c = client(mf);
  const DOC = `INFO-2026-9143-${String(++seq).padStart(2, "0")}`;
  const text = infoMd(DOC);
  const pr = await c.post("promote", {
    bundleId: DOC, base: null, snapKey: `20260918T${String(100000 + seq)}Z_${sha(label).slice(0, 8)}`,
    meta: { object_type: "information", group: "believe-in-oakland", title: `Bundle ${DOC}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [] });
  t(`${label}: ARMED — ${version} promoted a document through its own op`, pr.ok ?? pr.result?.ok ?? errOf(pr), true);
  const legs = [
    await c.raw(`INSERT INTO inquiry_basis (bundle_id,ord,target_id,target_type,role,grade,grade_axis,grade_source,note,at,ground)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?)`, "INQ-2026-9143", 0, DOC, "information", "supports",
                "B", "capture", "capture", "rec143 legacy leg", NOW, null),
    await c.raw(`INSERT INTO inquiry_basis_version_legs (bundle_id,name,ord,target_id,target_type,role,grade,grade_axis,grade_source,note,at,ground)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, "INQ-2026-9143", "v1", 0, DOC, "information", "supports",
                null, null, null, "rec143 legacy version leg", NOW, "g1"),
  ];
  t(`${label}: ARMED — ${version}'s store took a basis leg and a version leg`, legs.map((r) => r.ok ? true : r.error), [true, true]);
  const before = await shapeOf(c);
  const rows = [];
  for (const q of ROWS_Q) rows.push((await c.raw(q)).rows ?? null);
  await mf.dispose();
  t(`${label}: ARMED — the rows ${version} wrote are there to survive (a bundle, a leg, a version leg, its files)`,
    [rows[0]?.length, rows[1]?.length, rows[2]?.length, (rows[3]?.[0]?.n ?? 0) > 0], [1, 1, 1, true]);
  /* Printed rather than asserted: what the old shape lacks is the migration's work
     list, and it moves with every release — the point is to SEE it. */
  const missing = [];
  for (const [tb, cols] of Object.entries(FRESH.tables || {})) {
    if (!before.tables?.[tb]) { missing.push(`${tb}(new table)`); continue; }
    for (const col of cols) if (!before.tables[tb].includes(col)) missing.push(`${tb}.${col}`);
  }
  console.log(`    ${version}'s store lacks, against a fresh current store: ${missing.join(", ") || "(nothing)"}`);
  return { DOC, text, rows };
};

/* THE CURRENT PLANE on a store somebody else wrote: it answers, it has a fresh
   store's exact shape, the rows survive, and a second boot is clean. */
const verifyCurrent = async (label, persist, { DOC, text, rows }) => {
  let mf = bootCurrent(persist);
  let c = client(mf);
  const bs = await c.get("bootstrap", "", "");
  t(`${label}: op=bootstrap REACHES THE STORE — never STORE_DID_NOT_ANSWER`,
    [bs.ok !== false || errOf(bs), JSON.stringify(bs).includes("STORE_DID_NOT_ANSWER")], [true, false]);
  const up = await c.raw("SELECT 1 AS up");
  t(`${label}: the Durable Object ANSWERS — its #migrate completed (a thrown migration is named here)`,
    up.ok ? true : up.error, true);
  const st = await c.get("stats");
  t(`${label}: op=stats answers from the store`, st.ok !== false ? true : errOf(st), true);
  const au = await c.get("audit", "", TOK.ADMIN_TOKEN);
  t(`${label}: op=audit answers from the store`, au.ok !== false ? true : errOf(au), true);
  const sf = await c.get("selftest", "", TOK.PROBE_TOKEN);
  t(`${label}: op=selftest answers`, [sf.ok, sf.service], [true, "bio-plane"]);

  const after = await shapeOf(c);
  const lacking = [], extra = [];
  for (const [tb, cols] of Object.entries(FRESH.tables || {})) {
    if (!after.tables?.[tb]) { lacking.push(`${tb}(table)`); continue; }
    for (const col of cols) if (!after.tables[tb].includes(col)) lacking.push(`${tb}.${col}`);
  }
  for (const tb of Object.keys(after.tables || {})) if (!FRESH.tables?.[tb]) extra.push(tb);
  t(`${label}: the migrated store has EVERY table and column a fresh store has (table_xinfo)`, lacking, []);
  t(`${label}: and no table a fresh store lacks — every fold and rename completed`, extra, []);
  t(`${label}: and EVERY index and trigger a fresh store has — none weakened, none skipped`,
    (FRESH.others || []).filter((o) => !(after.others || []).includes(o)), []);
  t(`${label}: in particular inquiry_basis.content_id and its index — the column and index that bricked 0.59.0-0.63.0`,
    [after.tables?.inquiry_basis?.includes("content_id"), (after.others || []).includes("index:inquiry_basis_content")],
    [true, true]);

  const rowsAfter = [];
  for (const q of ROWS_Q) rowsAfter.push((await c.raw(q)).rows ?? null);
  t(`${label}: every row the old plane wrote SURVIVES, value for value`, rowsAfter, rows);
  t(`${label}: and the legacy leg reads NULL for content_id — no backfill invented an extent`,
    (await c.raw("SELECT content_id FROM inquiry_basis WHERE bundle_id='INQ-2026-9143'")).rows, [{ content_id: null }]);
  const got = await c.get("file", `id=${DOC}&path=bundle.md`);
  t(`${label}: THROUGH THE OP — op=file reads the old document's bytes exactly as the old plane stored them`,
    sha((got.result ?? got).text ?? String(errOf(got))), sha(text));
  await mf.dispose();

  mf = bootCurrent(persist);
  c = client(mf);
  const again = await c.raw("SELECT count(*) AS n FROM inquiry_basis");
  t(`${label}: a SECOND boot is clean — the store answers and holds the same rows`,
    again.ok ? again.rows[0].n : again.error, 1);
  await mf.dispose();
};

/* ==================================================================== 2
 * A STORE BORN ON EACH RELEASE boots on the current plane.
 * ================================================================== */
let n = 1;
for (const [version] of RELEASES) {
  if (!PLANE[version]) continue;
  n++;
  const label = `born on ${version}`;
  console.log(`\n--- ${n}. a store ${label} boots on the current plane ---`);
  const persist = mkdtempSync(join(tmpdir(), `rec143-born-${version}-`));
  await verifyCurrent(label, persist, await seed(label, version, persist));
}

/* ==================================================================== 3
 * THE PATH A GROUP ACTUALLY WALKED: a store born on 0.58.0, UPGRADED to a withdrawn
 * release (which bricked it), ROLLED BACK to 0.58.0 (what DIST did to biosmoke7),
 * then upgraded to the current plane. The withdrawn release's boot is the
 * REPRODUCTION, driven with the released bytes: it must throw exactly what DIST saw.
 * ================================================================== */
/* ONLY THE WITHDRAWN RELEASES. This loop read `RELEASES.slice(1)`, which was true while
   every row after 0.58.0 was one of the five that bricked. It stopped being true the day
   a FIXED release joined the table: DIST added 0.64.0 (2026-09-19, as REC-143's worker
   asked for every new release), and this section then asserted that 0.64.0's own bytes
   brick a 0.58.0 store. They do not, which is the point of 0.64.0 (and was measured live
   on biosmoke7). Corrected, not exempted: the withdrawn set is NAMED, and a release that
   boots is covered by section 2 as a store source. */
const WITHDRAWN = new Set(["0.59.0", "0.60.0", "0.61.0", "0.62.0", "0.63.0"]);
for (const [version] of RELEASES.filter(([v]) => WITHDRAWN.has(v))) {
  if (!PLANE[version] || !PLANE["0.58.0"]) continue;
  n++;
  const label = `0.58.0 -> ${version} -> 0.58.0 -> current`;
  console.log(`\n--- ${n}. ${label} ---`);
  const persist = mkdtempSync(join(tmpdir(), `rec143-path-${version}-`));
  const seeded = await seed(label, "0.58.0", persist);

  let mf = bootRelease(version, persist);
  const brick = await client(mf).raw("SELECT 1 AS up");
  const bs = await client(mf).get("bootstrap", "", "");
  await mf.dispose();
  t(`${label}: REPRODUCED — ${version}'s own bytes BRICK the 0.58.0 store: the Durable Object throws \`no such column: content_id\``,
    [brick.ok, /no such column: content_id/.test(brick.error || "")], [false, true]);
  t(`${label}: and ${version}'s op=bootstrap answers STORE_DID_NOT_ANSWER, as DIST measured on biosmoke7`,
    JSON.stringify(bs).includes("STORE_DID_NOT_ANSWER"), true);

  mf = bootRelease("0.58.0", persist);
  const back = await client(mf).raw("SELECT count(*) AS n FROM inquiry_basis");
  await mf.dispose();
  t(`${label}: the ROLLBACK to 0.58.0 answers again — the failed upgrade left nothing 0.58.0 cannot read`,
    back.ok ? back.rows[0].n : back.error, 1);

  await verifyCurrent(label, persist, seeded);
}

for (const d of Object.values(PLANE)) rmSync(d, { recursive: true, force: true });
console.log(`\nmigrate-released: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
