/* T46 (T46-4; N934, N654; DEC-196, DEC-197; K2903, K1752): a handle chosen at joining and never changed (R129 the
   refusal, R125's guard no longer called, R126's T46 rows, R16 a departed member's handle still taken, R17 without
   `formerly`) and the doors' settings and history for administrators (R130). Each id is tested here explicitly, with a
   negative control (K874: older tests name some of these ids already). Every test drives the module at its interface. */
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { world, V, realWorld } from "./fixture.mjs";
import { localize } from "../../../src/setup-words/index.mjs";
import { Membership, MEMBERSHIP_CHECKS, notAnAdmin, MEMBERSHIP_EXEMPT_TABLES, MEMBERSHIP_PROJECT_TABLES }
  from "../../../src/membership/index.mjs";
import { MACHINE_CLASS_PREFIX, sha256HexSync } from "../../../src/record-grammar/index.mjs";

const snapshot = (w) => JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
  .map(({ name }) => [name, w.rows(`SELECT * FROM "${name}"`)]));

/* T49 (N1075, K3269): the sentence is `words.json`'s `refusal.HANDLE_FIXED`, read by key. */
const FIXED = (await readFile(new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url), "utf8")
  .then((t) => JSON.parse(t).words)).find((x) => x.key === "refusal.HANDLE_FIXED").en;

/* The founder, `second` (an administrator), ann and bob active, cal invited. */
async function group() {
  const w = await world().group("ann", "bob");
  w.inv = (await w.m.memberAdd({ memberId: "cal", cover: "cover of cal", by: "admin" })).invite;
  return w;
}

/* ---------------------------------------------------------------- R129, R125 --------------------------------------- */

/* ---------------------------------------------------------------- R126 --------------------------------------------- */

/* ---------------------------------------------------------------- R16, R17 ----------------------------------------- */

/* ---------------------------------------------------------------- R130 --------------------------------------------- */

const ACT = localize("member-roster.index.reading_the_teams_website_key_and", "reading the team's website key and join link");
const NONE = { live: false, current: null, history: [], limit: 200, truncated: false };

/* ---------------------------------------------------------------- R131 --------------------------------------------- */

test("R131 join_doors is declared through record-core's declareTable with export never, its other classes the default form's; so no export carries a door's hash, and R130's read still answers", async () => {
  const w = await realWorld();
  await w.claim();
  const k = w.m.websiteKeyCreate({ dailyCap: 3, by: "admin" });
  const l = w.m.joinLinkEnable({ dailyCap: 3, by: "admin" });
  const mine = w.rc.declaredTables().filter((d) => d.module === "membership");
  const doors = mine.filter((d) => d.name === "join_doors");
  assert.equal(doors.length, 1, "declared once");
  const { module, name, ...classes } = doors[0];
  assert.deepEqual(classes, { purge: "exempt", expunge: "none", export: "never", sight: "group", derive: "stored",
                              version_chain: false });
  /* what an export reads (record-core R21's classes, corpus-export's input): no membership table that holds a door's
     hash is exportable; the hashes are held in join_doors alone */
  const exportable = mine.filter((d) => d.export !== "never").map((d) => d.name);
  assert.ok(!exportable.includes("join_doors"));
  for (const t of exportable) {
    const dump = JSON.stringify(w.db.prepare(`SELECT * FROM "${t}"`).all());
    for (const secret of [k.key, l.link]) assert.equal(dump.includes(sha256HexSync(secret)), false, `${t} holds no door hash`);
  }
  assert.ok(JSON.stringify(w.db.prepare(`SELECT * FROM join_doors`).all()).includes(sha256HexSync(k.key)), "join_doors does");
  /* exempt from purge, as R111 states: a whole-store purge keeps every record */
  const before = w.db.prepare(`SELECT COUNT(*) AS n FROM join_doors`).get().n;
  w.rc.purge({});
  assert.equal(w.db.prepare(`SELECT COUNT(*) AS n FROM join_doors`).get().n, before);
  /* negative controls: every other membership table keeps the default form (export admin-only), each declared once; and
     R130's read still answers the doors' settings and history */
  const names = mine.map((d) => d.name);
  assert.deepEqual(new Set(names), new Set([...MEMBERSHIP_PROJECT_TABLES, ...MEMBERSHIP_EXEMPT_TABLES]));
  assert.equal(names.length, new Set(names).size);
  /* R143 (T48): home_looks, the members' Home marks, is declared apart too, export never (its own test, t48) */
  for (const d of mine.filter((x) => !["join_doors", "home_looks"].includes(x.name))) assert.equal(d.export, "admin-only", d.name);
  const r = w.m.joinDoors({ by: "admin" });
  assert.deepEqual([r.ok, r.websiteKey.live, r.websiteKey.current.id, r.joinLink.live, r.joinLink.history.length],
    [true, true, k.keyId, true, 1]);
});

test("R131 R115 a host whose record-core offers no declareTable (a test's stand-in) declares join_doors in the default form, exempt from purge, as before", async () => {
  const { DatabaseSync } = await import("node:sqlite");
  const { sqlOver } = await import("./fixture.mjs");
  const purged = [];
  const m = new Membership({ sql: sqlOver(new DatabaseSync(":memory:")),
                             core: { declarePurge: (module, tables, opts) => { purged.push(opts.exempt); return { ok: true }; } } });
  assert.doesNotThrow(() => m.migrate());
  assert.deepEqual(new Set(purged[0]), new Set(MEMBERSHIP_EXEMPT_TABLES), "join_doors among the exempt");
  /* negative control: with declareTable offered, join_doors leaves the default form for its own declaration */
  const w = world();
  assert.equal(w.declared[0].opts.exempt.includes("join_doors"), false);
  assert.deepEqual(w.tablesDeclared[0].entries.map((e) => [e.name, e.export]), [["join_doors", "never"], ["home_looks", "never"]]);
});
