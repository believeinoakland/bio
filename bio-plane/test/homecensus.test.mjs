/* NEGATIVE CONTROL: RUN 2026-09-24 (REC-190) with `node test/homecensus.control.mjs [arm]` from `bio-plane/`, every arm ALONE against a patched COPY of src/ (each anchor asserted to occur exactly once; the real sources are never edited, so nothing is restored), the real sources hashed before and after (store.mjs 2,955,140 B sha256 2ce4bd18d501…, bio-checks.mjs 858,511 B sha256 bbcc8d62df7f…; untouched: YES). Declared before arming, and the result: (a) baseline — MUST be green: 21/0. (b) nopred — THE ROW'S CONTROL, the different-bundle predicate removed: 15/6, "the displaced row is found" FAILS BY NAME (the home's own rows are listed beside it), and first by name "a clean store lists NONE". (c) liar — THE ROW'S LIAR, the register's homes PLUS every sha carried by more than one bundle: 15/6, first by name "a clean store lists NONE" — the clean-store arm is what reads it. (d) noexists — the holder-exists check dropped: 19/2, "it is counted apart" and "limit=0 lists no sha". (e) overpath — OVER-STRICTNESS, a displaced row counted only at the register's path: 15/6, first by name "the displaced row is found". EVERY ARM AS DECLARED on the second run. RECORDED, NOT SMOOTHED: on the first run (c) and (d) came back NOT AS DECLARED, both declarations wrong and both arms right — (c) named the two first-entry arms as failing on the belief that `files` scans in primary-key order, and it scans in insertion order, so X is still listed first; (d) said only §4 fails, and the orphan it seeds is still there in §5. Both corrected in the driver with the reason, re-run. */
/* REC-190 — THE CENSUS OF DISPLACED HOMES (`BIO_Intake_Doctrine_v1_1.md` §8, ONE CAPTURE, ONE HOME — the ORIGINAL's;
 * D-179's residue; BOB #31, 2026-09-23 22:03Z: the census's report STANDS ALONE, which bundle held a capture first is
 * UNDETERMINED and the report says so, the digest-level duplicate is out of reach).
 *
 * Before D-179's fence, `op=promote` UPSERTed `register.bundle_id` on the `capture_sha` key, so a second bundle
 * registering held bytes MOVED the first bundle's register row, and the first bundle's own `files` / `history` rows
 * kept carrying bytes the register now said lived elsewhere. The fence stops a NEW move; nothing said whether a store
 * already holds one. This suite drives `op=homecensus` THROUGH THE OP (miniflare, the control plane in front of the
 * Durable Object), with the fixture built through `op=promote` and the pre-fence move SEEDED AT THE STORE with the
 * instance DOWN (the one write promote can no longer make):
 *   1. a CLEAN store — a registered capture carried by its own bundle across two revisions, and an identical ordinary
 *      file carried by three bundles (a LEGITIMATE multi-bundle sha the register assigns to nobody) — lists NONE
 *      (the liar clause: a census listing every multi-bundle sha would list the shared file here);
 *   2. the record's counters (`op=stats`) and every register row read BEFORE and AFTER the call are unchanged;
 *   3. a store seeded with ONE moved row lists that sha under BOTH bundles — the register's current holder as `home`,
 *      and the displaced bundle's live row and its history row as `held_by` — and says the first holder is
 *      UNDETERMINED and that it rewrote nothing;
 *   4. a register row whose bundle no longer exists names no home: counted apart (`home_absent`), never listed;
 *   5. the class fence: probe may read it, a member may not; `limit` bounds the listing and never the counts.
 *
 * WHAT THIS CANNOT SEE: which bundle held a capture first (not recorded anywhere — the answer says so); a row a bundle
 * carried WITHOUT ever registering it, whose sha another bundle registered, reads exactly like a moved row and is
 * listed the same (the census names what the register says, never how it came to say it); the digest-level duplicate
 * (same content, different bytes); a deployed instance's figure (the op is the method; running it there is DIST's).
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, mkdtempSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

/* The control driver (`homecensus.control.mjs`) points this at an armed COPY of the sources. */
const SRC = process.env.REC190_SRC ? join(process.env.REC190_SRC, "index.mjs")
  : fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const PERSIST = mkdtempSync(join(tmpdir(), "rec190-persist-"));
const mk = () => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-190", MEMBER_TOKEN: "mem-190", PROBE_TOKEN: "prb-190", VERSION: "test" },
  defaultPersistRoot: PERSIST,
});
let mf = mk();

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* store=scratch NAMED ON EVERY CALL (CLAUDE.md §5, D-325). */
const post = async (op, body, tok = "mem-190") => (await mf.dispatchFetch(
  `http://x/api/?op=${op}&store=scratch&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json();
const get = async (qs, tok = "mem-190") => (await mf.dispatchFetch(`http://x/api/?store=scratch&token=${tok}&${qs}`)).json();
const census = async (qs = "") => (await get(`op=homecensus${qs}`, "adm-190")).result;
const stats = async () => (await get("op=stats", "adm-190")).result;

/* THE STORE'S SQLITE, WITH THE INSTANCE DOWN: `fn(db)` runs against the one database holding a register. */
const atStore = async (fn) => {
  await mf.dispose();
  const dbs = [];
  const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : /\.sqlite$/.test(n) && dbs.push(p); } };
  walk(PERSIST);
  let found = 0, out;
  for (const p of dbs) {
    const db = new DatabaseSync(p);
    if (db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='register'").get()) { found++; out = fn(db); }
    db.close();
  }
  mf = mk();
  if (found !== 1) throw new Error(`expected exactly one store holding a register, found ${found}`);
  return out;
};
const registerRows = () => atStore((db) => db.prepare("SELECT * FROM register ORDER BY capture_sha").all().map((r) => ({ ...r })));

const NOW = "2026-09-24T00:00:00Z";
const md = (id, rev) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Home ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: 2026-09-24T0${rev}:00:00Z`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "---", "",
  "## Summary", "", `Revision ${rev}.`, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", "",
].join("\n");
const inline = (path, text) => ({ path, text, bytes: Buffer.byteLength(text), sha256: sha(text) });
const reg = (path, text) => ({ path, sha256: sha(text), encoding: "utf8", bytes: Buffer.byteLength(text) });
const pkg = (id, rev, files, register, base, snapKey) => ({
  bundleId: id, base, snapKey, author: "claude",
  meta: { object_type: "information", group: "believe-in-oakland", title: `Home ${id}`,
          current_state: "collected", created: NOW, last_updated: `2026-09-24T0${rev}:00:00Z` },
  files, register,
});
const must = (l, r) => { if (!r || !r.result || r.result.ok !== true) throw new Error(`${l}: ${JSON.stringify(r).slice(0, 600)}`); return r.result; };

const A = "INFO-2026-0190-home-a", B = "INFO-2026-0190-home-b", C = "INFO-2026-0190-home-c";
const GONE = "INFO-2026-0190-never-existed";
const docX = "The captured document A registered first.\n";      /* A's capture — the one the seed MOVES to B */
const docY = "The captured document B registered.\n";            /* B's own capture */
const extra = "An ordinary working file A carries, registered to nobody.\n";   /* §4: its sha gets an ORPHAN register row */
const notes = "Shared notes, identical in three bundles.\n";      /* THE LEGITIMATE SHARE: three bundles, no register row */
const X = sha(docX), Y = sha(docY), Z = sha(extra), N = sha(notes);

try {

console.log("\n--- 0. the census answers through the op over an empty store ---");
const c0 = await census();
t("an empty store: ok, nothing listed, the first holder stated UNDETERMINED, nothing rewritten",
  [c0?.ok, c0?.shas, c0?.listed, c0?.first_holder, c0?.rewritten], [true, 0, [], "UNDETERMINED", 0]);

/* ============================================================== FIXTURE, THROUGH op=promote */
const aMd1 = md(A, 1), aMd2 = md(A, 2);
must("A registers X", await post("promote", pkg(A, 1,
  [inline("bundle.md", aMd1), inline("snapshots/doc.txt", docX), inline("data/extra.txt", extra), inline("data/notes.md", notes)],
  [reg("snapshots/doc.txt", docX)], null, "20260924T010000Z_home0001")));
must("A's revision re-registers its own X (the holder's own rows are not displaced)", await post("promote", pkg(A, 2,
  [inline("bundle.md", aMd2), inline("snapshots/doc.txt", docX), inline("data/extra.txt", extra), inline("data/notes.md", notes)],
  [reg("snapshots/doc.txt", docX)], sha(aMd1), "20260924T020000Z_home0002")));
must("B registers Y", await post("promote", pkg(B, 1,
  [inline("bundle.md", md(B, 1)), inline("snapshots/doc.txt", docY), inline("data/notes.md", notes)],
  [reg("snapshots/doc.txt", docY)], null, "20260924T010000Z_home0003")));
must("C carries the shared notes", await post("promote", pkg(C, 1,
  [inline("bundle.md", md(C, 1)), inline("data/notes.md", notes)], [], null, "20260924T010000Z_home0004")));

console.log("\n--- 1. a CLEAN store lists NONE, over a corpus holding a legitimate multi-bundle sha ---");
const clean = await census();
console.log(`  census (clean): ${JSON.stringify({ ...clean, listed: clean?.listed?.length, note: undefined })}`);
t("the corpus is non-empty: files, history and register rows were walked",
  [clean.files.rows > 0, clean.history.rows > 0, clean.register.rows], [true, true, 2]);
t("  and the fixture DOES hold a legitimate share: the notes sha is carried by three bundles and registered to none",
  await atStore((db) => [db.prepare("SELECT count(DISTINCT bundle_id) c FROM files WHERE sha256=?").get(N).c,
                         db.prepare("SELECT count(*) c FROM register WHERE capture_sha=?").get(N).c]), [3, 0]);
/* A creation takes no snapshot; the revision snapshots the OUTGOING live state, once (`promote`'s history write). */
t("  and A holds X in its live row AND its history row (the holder's own rows, more than one)",
  await atStore((db) => [db.prepare("SELECT count(*) c FROM files WHERE bundle_id=? AND sha256=?").get(A, X).c,
                         db.prepare("SELECT count(*) c FROM history WHERE bundle_id=? AND sha256=?").get(A, X).c]), [1, 1]);
t("a clean store lists NONE (the liar clause: a shared sha the register assigns elsewhere to nobody is no displaced home)",
  [clean.shas, clean.listed, clean.files.displaced, clean.history.displaced], [0, [], 0, 0]);

console.log("\n--- 2. the record's counters and the register read before and after the call are unchanged ---");
const s0 = await stats(), r0 = await registerRows();
t("  (the witnesses read something: stats answered and the register holds rows)", [s0?.bundles, r0.length], [3, 2]);
await census();
await census("&limit=0");
const s1 = await stats(), r1 = await registerRows();
t("op=stats reads the same after two census calls", s1, s0);
t("every column of every register row reads the same after", r1, r0);

console.log("\n--- 3. ONE MOVED ROW, seeded at the store as the pre-D-179 UPSERT left it ---");
/* The old promote's move, exactly: B registering X UPSERTed X's register row to (B, B's path). Nothing else moves. */
const moved = await atStore((db) => Number(db.prepare(
  "UPDATE register SET bundle_id=?, path='snapshots/second.txt' WHERE capture_sha=? AND bundle_id=?").run(B, X, A).changes));
t("the seed moved exactly one register row (found the store's SQLite)", moved, 1);
const dirty = await census();
console.log(`  census (seeded): ${JSON.stringify({ ...dirty, note: undefined })}`);
t("the displaced row is found: the moved sha is listed ONCE, under BOTH bundles — B as the register's home, A as holding it",
  dirty.listed.map((e) => [e.capture_sha, e.home.bundle_id, [...new Set(e.held_by.map((h) => h.bundle_id))]]),
  [[X, B, [A]]]);
t("  and every row of A's that carries it, by table and path (the live row and the snapshot)",
  dirty.listed[0]?.held_by.map((h) => [h.table, h.bundle_id, h.path, typeof h.snap_key === "string"]),
  [["files", A, "snapshots/doc.txt", false], ["history", A, "snapshots/doc.txt", true]]);
t("  and the home's register path", dirty.listed[0]?.home, { bundle_id: B, path: "snapshots/second.txt" });
t("  counted whole: one sha, one live row, one history row", [dirty.shas, dirty.files.displaced, dirty.history.displaced], [1, 1, 1]);
t("  and B's own capture Y and the shared notes are still NOT listed",
  dirty.listed.some((e) => e.capture_sha === Y || e.capture_sha === N), false);
t("  and it says the first holder is UNDETERMINED and that it rewrote nothing", [dirty.first_holder, dirty.rewritten], ["UNDETERMINED", 0]);
const sD = await stats(), rD = await registerRows();
await census();
t("  and the call wrote nothing: op=stats and the register read the same after", [await stats(), await registerRows()], [sD, rD]);
t("  and the moved register row was NOT repaired back to A", rD.find((r) => r.capture_sha === X)?.bundle_id, B);

console.log("\n--- 4. a register row whose bundle no longer exists names no home ---");
const orphaned = await atStore((db) => Number(db.prepare(
  "INSERT INTO register (capture_sha,bundle_id,path,encoding,bytes,registered) VALUES (?,?,?,?,?,?)")
  .run(Z, GONE, "data/extra.txt", "utf8", Buffer.byteLength(extra), NOW).changes));
t("the seed wrote one register row naming a bundle that does not exist", orphaned, 1);
const orphan = await census();
t("it is counted apart and never listed: A's extra.txt is no displaced home, because there is no home",
  [orphan.register.home_absent, orphan.listed.some((e) => e.capture_sha === Z), orphan.shas], [1, false, 1]);

console.log("\n--- 5. the class fence and the bound ---");
t("probe may read the census; a member may not",
  [(await get("op=homecensus", "prb-190")).result?.ok === true, (await get("op=homecensus", "mem-190")).result?.ok === true],
  [true, false]);
const zero = await census("&limit=0");
t("limit=0 lists no sha and still counts them all", [zero.listed.length, zero.shas, zero.files.displaced], [0, 1, 1]);

} finally { await mf.dispose(); }
console.log(`\nhomecensus: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
