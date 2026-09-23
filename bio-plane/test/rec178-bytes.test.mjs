/* NEGATIVE CONTROL: RUN 2026-09-23 (REC-178) by `node test/rec178-bytes.control.mjs`, three arms, each ALONE, each
   restored from a uniquely-named pristine copy verified by sha256 d592ffc1… AND a byte comparison (2865674 bytes).
   (0) baseline — no edit -> 23 pass, 0 fail.
   (1) textlength — OVERSIZE_INLINE judges `f.text.length` again (the original defect's measure) -> 16 pass, 7 FAIL,
       first by name "the non-ASCII arm: a REVISION adding a file 1,200,000 UTF-8 bytes long (600,000 units) is
       refused OVERSIZE_INLINE" (the file LANDED), then its image/history/head arms and the creation arm. DECLARED
       MUST NOT MOVE: both over-strictness arms and section 3's stored figures — all held.
   (2) keepgiven — the override dropped, `bytes` stored as supplied (the original defect's store) -> 13 pass, 10 FAIL,
       first "a creation supplying text.length, a false figure, and none lands": NOT DECLARED, and a finding about the
       old plane rather than the arm — a file sent with NO `bytes` fails the `files.bytes` NOT NULL column, so before
       REC-178 a writer could not send "none"; the override is what makes the writers' "or none" true. Then by name
       "the stored bytes of every file is its UTF-8 length" and the census arms. Section 1 and the over-strictness
       arms held, as declared.
   Restored: suite 23/23 green. */
/* REC-178 — A STORED SIZE IS OF THE STORED BYTES (BIO_State_Rules_Consistency_v1_5.md §8, the Mechanical
 * Verification Law; REC-175's rule one field over, at the same `promote` site).
 *
 * `op=promote` stored each inline file's `bytes` exactly as the caller gave it, and the writers (setup.mjs,
 * civicos-ui/app.html, livefire.mjs, the monitor tick, fw21-onpoint-probe.mjs) sent `text.length` — UTF-16 code
 * units, not UTF-8 bytes. `OVERSIZE_INLINE` judged `text.length` against INLINE_MAX, a BYTE limit, so a non-ASCII
 * file over the limit in bytes passed. This suite drives, THROUGH THE OP (miniflare, the control plane in front of
 * the Durable Object):
 *   1. a non-ASCII file over INLINE_MAX in UTF-8 but UNDER it in text.length is refused OVERSIZE_INLINE, on a
 *      revision and on a creation, with the bundle byte-identical after (image, head — proved by a CAS revision
 *      against the old head — and history row count); the refusal reports the UTF-8 figure;
 *   2. OVER-STRICTNESS: an ASCII file of exactly INLINE_MAX bytes lands, and a non-ASCII file under the limit in
 *      bytes lands — the fence is the byte limit and nothing tighter;
 *   3. the stored `bytes` IS the UTF-8 length whatever was supplied (text.length, a lie, or none): a differing
 *      supplied value is OVERRIDDEN, not refused (the reason is stated at the site in store.mjs);
 *   4. THE CENSUS (`op=digestcensus`'s `bytes_disagree`): a row the old promote could have written, planted with
 *      the instance DOWN, is counted and listed and never rewritten by the read; a revision carrying it forward
 *      lands and stores the true figure.
 *
 * WHAT THIS CANNOT SEE: a blob-backed file's `bytes` (its bytes are in R2, which promote does not read — D-45; judged
 * at ratify, PLANE_SIZE); `history`, which holds no bytes column; a deployed instance's own census figure.
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

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const PERSIST = mkdtempSync(join(tmpdir(), "rec178-persist-"));
const mk = () => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-178", MEMBER_TOKEN: "mem-178", PROBE_TOKEN: "prb-178", VERSION: "test" },
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
const utf8 = (v) => Buffer.byteLength(v, "utf8");
const INLINE_MAX = 1024 * 1024;       /* store.mjs's constant, stated in BYTES */
const post = async (op, body, tok = "mem-178") => (await mf.dispatchFetch(
  `http://x/api/?op=${op}&store=scratch&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json();
const get = async (qs, tok = "mem-178") => (await mf.dispatchFetch(`http://x/api/?store=scratch&token=${tok}&${qs}`)).json();
const census = async () => (await get("op=digestcensus", "adm-178")).result;
const image = async (id) => JSON.stringify((await get(`op=image&id=${id}`)).result ?? null);

const NOW = "2026-09-23T00:00:00Z";
const md = (id, rev) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Bytes ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: 2026-09-23T0${rev}:00:00Z`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting",
  "source_status: unchanged", "source:",
  "  locator: in hand", "  authority: test", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", `Revision ${rev}. Café — Ōakland ✓`, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", "",
].join("\n");
/* THE OLD WRITER'S SHAPE: `bytes: text.length`, exactly what the five writers sent. The digest is honest (REC-175). */
const utf16 = (path, text) => ({ path, text, bytes: text.length, sha256: sha(text) });
const pkg = (id, rev, files, base, snapKey) => ({
  bundleId: id, base, snapKey, author: "claude",
  meta: { object_type: "information", group: "believe-in-oakland", title: `Bytes ${id}`,
          current_state: "collected", created: NOW, last_updated: `2026-09-23T0${rev}:00:00Z` },
  files, register: [],
});

/* The fixtures, measured and floored before anything is asserted on them. */
const BIG = "é".repeat(600000);                        /* 600,000 UTF-16 units, 1,200,000 UTF-8 bytes */
const EDGE = "a".repeat(INLINE_MAX);                   /* exactly the limit, ASCII */
const UNDER = "é".repeat(500000);                      /* 500,000 units, 1,000,000 bytes: under in both */
t("FIXTURE: the non-ASCII file is UNDER INLINE_MAX in text.length and OVER it in UTF-8",
  [BIG.length < INLINE_MAX, utf8(BIG) > INLINE_MAX], [true, true]);
t("FIXTURE: the edge file is exactly INLINE_MAX bytes; the under file is under in both",
  [utf8(EDGE), UNDER.length < INLINE_MAX && utf8(UNDER) <= INLINE_MAX], [INLINE_MAX, true]);

console.log("\n--- 1. a non-ASCII file over INLINE_MAX in UTF-8 is refused OVERSIZE_INLINE, and nothing is written ---");
const A = "INFO-2026-0178-bytes-a", A0 = "INFO-2026-0178-bytes-a0";
const aMd = md(A, 1);
const land = await post("promote", pkg(A, 1, [utf16("bundle.md", aMd)], null, "20260923T010000Z_aaaa0001"));
t("the creation lands", [land.result?.ok, land.result?.bundleSha], [true, sha(aMd)]);
const before = await image(A);
const histBefore = (await census()).history.rows;
const aMd2 = md(A, 2);
const over = await post("promote", pkg(A, 2, [utf16("bundle.md", aMd2), utf16("data/big.md", BIG)], sha(aMd), "20260923T020000Z_aaaa0002"));
t("the non-ASCII arm: a REVISION adding a file 1,200,000 UTF-8 bytes long (600,000 units) is refused OVERSIZE_INLINE",
  [over.result?.ok ?? null, over.result?.reason ?? null, over.result?.path ?? null], [false, "OVERSIZE_INLINE", "data/big.md"]);
t("  and the refusal reports the UTF-8 figure, not the units sent", over.result?.bytes ?? null, utf8(BIG));
t("  the image is byte-identical after", await image(A), before);
t("  no history snapshot was taken", (await census()).history.rows, histBefore);
const rev2 = await post("promote", pkg(A, 2, [utf16("bundle.md", aMd2)], sha(aMd), "20260923T020000Z_aaaa0003"));
t("  and the head did not move: a revision against the OLD head lands", [rev2.result?.ok, rev2.result?.bundleSha], [true, sha(aMd2)]);

const c0 = await post("promote", pkg(A0, 1, [utf16("bundle.md", md(A0, 1)), utf16("data/big.md", BIG)], null, "20260923T010000Z_aaaa0004"));
t("the non-ASCII arm on a CREATION is refused OVERSIZE_INLINE", c0.result?.reason ?? null, "OVERSIZE_INLINE");
t("  and the bundle does not exist after", await image(A0), await image("INFO-2026-0178-never"));

console.log("\n--- 2. OVER-STRICTNESS: the fence is the byte limit and nothing tighter ---");
const B = "INFO-2026-0178-bytes-b";
const bMd = md(B, 1);
const edge = await post("promote", pkg(B, 1, [utf16("bundle.md", bMd), utf16("data/edge.md", EDGE)], null, "20260923T010000Z_bbbb0001"));
t("an ASCII file of EXACTLY INLINE_MAX bytes lands", edge.result?.ok, true);
const C = "INFO-2026-0178-bytes-c";
const under = await post("promote", pkg(C, 1, [utf16("bundle.md", md(C, 1)), utf16("data/under.md", UNDER)], null, "20260923T010000Z_cccc0001"));
t("a non-ASCII file UNDER the limit in bytes (1,000,000) lands", under.result?.ok, true);

console.log("\n--- 3. the stored `bytes` is the UTF-8 length, whatever was supplied ---");
const D = "INFO-2026-0178-bytes-d";
const dMd = md(D, 1);
const notes = "Naïve résumé — ✓\n";
const lie = await post("promote", pkg(D, 1, [
  utf16("bundle.md", dMd),                                                        /* text.length */
  { path: "data/notes.md", text: notes, bytes: 7, sha256: sha(notes) },            /* a plain lie */
  { path: "data/none.md", text: notes, sha256: sha(notes) },                      /* none supplied */
], null, "20260923T010000Z_dddd0001"));
t("a creation supplying text.length, a false figure, and none lands (the figure is OVERRIDDEN, not refused)", lie.result?.ok, true);
t("  and the fixture's supplied figures really were wrong", [dMd.length !== utf8(dMd), notes.length !== utf8(notes)], [true, true]);
const clean = await census();
t("the census finds NO stored bytes disagreeing with its content, on the store written through the door",
  clean.files.bytes_disagree, 0);
t("  over a non-empty corpus holding non-ASCII rows", clean.files.inline >= 8, true);
console.log(`  census (clean): files ${JSON.stringify({ ...clean.files, listed: clean.files.listed.length })}`);

console.log("\n--- 4. THE CENSUS — a row the old promote could have written, counted and never rewritten ---");
await mf.dispose();
const dbs = [];
const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : /\.sqlite$/.test(n) && dbs.push(p); } };
walk(PERSIST);
/* Read the stored figures straight off SQLite (the instance is down): the exact values, not only "no disagreement". */
const stored = {};
let planted = 0;
for (const p of dbs) {
  const db = new DatabaseSync(p);
  if (db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='files'").get()) {
    for (const r of db.prepare("SELECT bundle_id, path, bytes FROM files WHERE bundle_id=?").all(D)) stored[r.path] = Number(r.bytes);
    planted += Number(db.prepare("UPDATE files SET bytes=? WHERE bundle_id=? AND path='data/notes.md'").run(notes.length, D).changes);
  }
  db.close();
}
t("the stored bytes of every file is its UTF-8 length (text.length sent, a lie sent, none sent)",
  stored, { "bundle.md": utf8(dMd), "data/none.md": utf8(notes), "data/notes.md": utf8(notes) });
t("the fixture planted one row carrying the old writer's text.length (found the store's SQLite)", planted, 1);
mf = mk();
const dirty = await census();
t("the census counts the planted row", dirty.files.bytes_disagree, 1);
t("  and lists it by bundle, path and the figure stored", dirty.files.listed.map((r) => [r.bundle_id, r.path, r.bytes_stored]),
  [[D, "data/notes.md", notes.length]]);
t("  and says it rewrote nothing, and a second read finds it still", [dirty.rewritten, (await census()).files.bytes_disagree], [0, 1]);
const dMd2 = md(D, 2);
const carried = await post("promote", pkg(D, 2, [utf16("bundle.md", dMd2),
  { path: "data/notes.md", text: notes, bytes: notes.length, sha256: sha(notes) },
  { path: "data/none.md", text: notes, bytes: utf8(notes), sha256: sha(notes) }], sha(dMd), "20260923T020000Z_dddd0002"));
t("a revision CARRYING the planted figure forward lands (a stored row stays writable)", carried.result?.ok, true);
t("  and stores the true figure: the census reads zero again", (await census()).files.bytes_disagree, 0);

await mf.dispose();
console.log(`\nrec178-bytes: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
