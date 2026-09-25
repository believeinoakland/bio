/* NEGATIVE CONTROL: RUN 2026-09-23 (REC-175), two arms, each ALONE, each restored from a uniquely-named pristine copy
   verified by sha256 9463cf4c… AND cmp (2855235 bytes); both DROP THE COMPARISON in src/store.mjs `#digestFiles`, the
   line `if (typeof supplied !== "string" || supplied.toLowerCase() !== computed) {`.
   (1) keep-given — the ORIGINAL DEFECT, `if (true) return f; if (false) {`, a supplied digest stored as given -> 15 pass,
       37 FAIL, first by name "the fff… bundle.md creation is refused by name" (got null: the fff… digest LANDED,
       ok: true), and "on the store this suite wrote through the checked door, NO digest disagrees" with the census
       counting 6 false rows it now held. DECLARED MUST FAIL: every refusal arm (fff… bundle.md creation, non-bundle.md
       creation, both revisions, CRLF-folded, Latin-1, blob, D-78 inquiry, the carried-forward planted row) and the clean
       census; MUST NOT MOVE: the matching, absent, upper-case-lands, CRLF-honest and UTF-8 arms — all held, but one NOT
       DECLARED also failed, "and is stored lower-case": the arm keeps the upper-case spelling as given, so it breaks
       that property too; the arm is right and the declaration was short.
   (2) silently-correct — `if (false) {` alone, which falls through to storing the COMPUTED digest, a plane that papers
       over a false digest with ok: true -> 20 pass, 32 FAIL, first by name "the fff… bundle.md creation is refused by
       name"; the census arms stayed GREEN because nothing false was stored, which is why the refusal arms, and not the
       census, are what catch a plane that launders a caller's false claim.
   Restored: suite 52/52 green. */
/* REC-175 — A STORED DIGEST IS OF THE STORED BYTES (BIO_State_Rules_Consistency_v1_5.md §8, the Mechanical
 * Verification Law; CLAUDE.md §5: an equality that costs nothing to produce is not evidence).
 *
 * `op=promote` wrote each file's `sha256` exactly as the caller gave it and took bundle.md's as the bundle's head.
 * REC-173's worker drove a bundle.md sha of `fff…` to `ok: true`. This suite drives, THROUGH THE OP (miniflare, the
 * control plane in front of the Durable Object — never the store alone):
 *   1. a mismatched digest REFUSED BY NAME (FILE_DIGEST_MISMATCH, C-33.38, with its canned translation) on
 *      bundle.md AND on a file that is not bundle.md, on a creation AND on a revision, with the bundle
 *      byte-identical after (the image, the head — proved by a CAS revision against the old head — and the
 *      history row count);
 *   2. a matching digest landing; an ABSENT one stored as the computed one; an upper-case spelling of the right
 *      digest landing (the over-strictness arm) and stored lower-case;
 *   3. the LIAR SHAPES: a digest computed over a CRLF-folded copy of CRLF bytes is refused, and the honest CRLF
 *      digest lands; a UTF-8 text lands under its UTF-8 digest;
 *   4. a blob-backed file whose `sha256` names another digest than its `blobSha` is refused; an equal one lands;
 *   5. the control plane's D-78 restamp (an inquiry creation's `surfaced_by`), which recomputes bundle.md's sha,
 *      does NOT paper over a false supplied digest;
 *   6. THE CENSUS (`op=digestcensus`): on a fixture store whose SQLite is planted, while the instance is DOWN, with
 *      a row the old unchecked promote could have written, the census counts and lists it and REWRITES NOTHING.
 *
 * WHAT THIS CANNOT SEE: whether R2 holds a blob-backed file's bytes (promote does not read R2, D-45; refused at
 * ratify); the `bytes` figure on an inline file (not judged at promote — a separate named finding, counted by the
 * census only); a deployed instance's own census figure (the op is the method; running it there is DIST's).
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, mkdtempSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { ACT_SHAPE_CHECKS } from "../checks/bio-checks.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const PERSIST = mkdtempSync(join(tmpdir(), "rec175-persist-"));
const mk = () => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-175", MEMBER_TOKEN: "mem-175", PROBE_TOKEN: "prb-175", VERSION: "test" },
  defaultPersistRoot: PERSIST,
});
let mf = mk();

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const FFF = "f".repeat(64);
const post = async (op, body, tok = "mem-175") => (await mf.dispatchFetch(
  `http://x/api/?op=${op}&store=scratch&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json();
const get = async (qs, tok = "mem-175") => (await mf.dispatchFetch(`http://x/api/?store=scratch&token=${tok}&${qs}`)).json();
const census = async () => (await get("op=digestcensus", "adm-175")).result;
const image = async (id) => JSON.stringify((await get(`op=image&id=${id}`)).result ?? null);

const NOW = "2026-09-23T00:00:00Z";
const md = (id, rev, extra = "") => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Digest ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: 2026-09-23T0${rev}:00:00Z`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting",
  "source_status: unchanged", "source:",
  "  locator: in hand", "  authority: test", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", `Revision ${rev}.${extra}`, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", "",
].join("\n");
const inline = (path, text, over = {}) => ({ path, text, bytes: Buffer.byteLength(text), sha256: sha(text), ...over });
const pkg = (id, rev, files, base, snapKey) => ({
  bundleId: id, base, snapKey, author: "claude",
  meta: { object_type: "information", group: "believe-in-oakland", title: `Digest ${id}`,
          current_state: "collected", created: NOW, last_updated: `2026-09-23T0${rev}:00:00Z` },
  files, register: [],
});
const ROW = ACT_SHAPE_CHECKS.FILE_DIGEST_MISMATCH;
const refusedByName = (label, r, paths) => {
  t(label, r.result?.reason ?? r.reason ?? null, "FILE_DIGEST_MISMATCH");
  t(`  ${label} — carries C-33.38 and its canned translation`,
    [r.result?.check, r.result?.translation], [ROW.check, ROW.translation]);
  t(`  ${label} — names the file(s)`, r.result?.paths ?? null, paths);
};

console.log("\n--- 1. a mismatched digest is refused by name, and nothing is written ---");
/* Each REFUSED creation names its OWN id, so that under the negative control (where it lands) it cannot collide
   with the honest creation that follows — an arm must break only the thing it tests. */
const A = "INFO-2026-0175-digest-a", A0 = "INFO-2026-0175-digest-a0", A1 = "INFO-2026-0175-digest-a1";
const c0 = await census();
t("the census answers through the op before anything is written", [c0?.ok, c0?.files?.rows, c0?.history?.rows], [true, 0, 0]);
const aMd = md(A, 1);
refusedByName("the fff… bundle.md creation is refused by name",
  await post("promote", pkg(A0, 1, [inline("bundle.md", md(A0, 1), { sha256: FFF })], null, "20260923T010000Z_aaaa0001")),
  ["bundle.md"]);
t("  and the bundle does not exist after", await image(A0), await image("INFO-2026-0175-never"));
t("  and no files row and no history row was written", [(await census()).files.rows, (await census()).history.rows], [0, 0]);

const notes = "Notes.\n";
refusedByName("a mismatched non-bundle.md file is refused by name, bundle.md's own digest honest",
  await post("promote", pkg(A1, 1, [inline("bundle.md", md(A1, 1)), inline("data/notes.md", notes, { sha256: sha("Notes.") })],
    null, "20260923T010000Z_aaaa0002")),
  ["data/notes.md"]);
t("  and still nothing was written", (await census()).files.rows, 0);

console.log("\n--- 2. a matching digest lands; an absent one is computed; an upper-case one lands lower-case ---");
const land = await post("promote", pkg(A, 1, [inline("bundle.md", aMd), inline("data/notes.md", notes)], null, "20260923T010000Z_aaaa0003"));
t("the matching creation lands", land.result?.ok, true);
t("  its head is the SHA-256 of the bytes sent", land.result?.bundleSha, sha(aMd));

const before = await image(A);
const histBefore = (await census()).history.rows;
const aMd2 = md(A, 2);
refusedByName("a REVISION with a mismatched non-bundle.md digest is refused by name",
  await post("promote", pkg(A, 2, [inline("bundle.md", aMd2), inline("data/notes.md", "Notes, revised.\n", { sha256: sha(notes) })],
    sha(aMd), "20260923T020000Z_aaaa0004")),
  ["data/notes.md"]);
t("  the image is byte-identical after", await image(A), before);
t("  no history snapshot was taken", (await census()).history.rows, histBefore);
refusedByName("a REVISION whose bundle.md digest is fff… is refused by name",
  await post("promote", pkg(A, 2, [inline("bundle.md", aMd2, { sha256: FFF }), inline("data/notes.md", notes)],
    sha(aMd), "20260923T020000Z_aaaa0005")),
  ["bundle.md"]);
t("  the image is byte-identical after", await image(A), before);
const rev2 = await post("promote", pkg(A, 2, [inline("bundle.md", aMd2), inline("data/notes.md", notes)], sha(aMd), "20260923T020000Z_aaaa0006"));
t("  and the head did not move: a revision against the OLD head lands", [rev2.result?.ok, rev2.result?.bundleSha], [true, sha(aMd2)]);

const B = "INFO-2026-0175-digest-b";
const bMd = md(B, 1);
const absent = await post("promote", pkg(B, 1, [{ path: "bundle.md", text: bMd, bytes: Buffer.byteLength(bMd) },
  { path: "data/notes.md", text: notes, bytes: Buffer.byteLength(notes) }], null, "20260923T010000Z_bbbb0001"));
t("a creation that supplies NO digest lands", absent.result?.ok, true);
t("  and its head is the computed digest", absent.result?.bundleSha, sha(bMd));

const C = "INFO-2026-0175-digest-c";
const cMd = md(C, 1);
const upper = await post("promote", pkg(C, 1, [inline("bundle.md", cMd, { sha256: sha(cMd).toUpperCase() })], null, "20260923T010000Z_cccc0001"));
t("OVER-STRICTNESS: the right digest spelled upper-case lands", upper.result?.ok, true);
t("  and is stored lower-case, one spelling of one digest", upper.result?.bundleSha, sha(cMd));

console.log("\n--- 3. the liar shapes: a normalised copy is not the bytes ---");
const D = "INFO-2026-0175-digest-d", D0 = "INFO-2026-0175-digest-d0";
const dMd = md(D, 1).replace(/\n/g, "\r\n");
const d0Md = md(D0, 1).replace(/\n/g, "\r\n");
refusedByName("a CRLF document sent with the digest of its LF-folded copy is refused",
  await post("promote", pkg(D0, 1, [inline("bundle.md", d0Md, { sha256: sha(d0Md.replace(/\r\n/g, "\n")) })], null, "20260923T010000Z_dddd0001")),
  ["bundle.md"]);
const crlf = await post("promote", pkg(D, 1, [inline("bundle.md", dMd)], null, "20260923T010000Z_dddd0002"));
t("the same CRLF bytes under their OWN digest are not refused for their digest",
  crlf.result?.reason === "FILE_DIGEST_MISMATCH", false);
const E = "INFO-2026-0175-digest-e";
const eMd = md(E, 1, " Café — Ōakland ✓");
const utf = await post("promote", pkg(E, 1, [inline("bundle.md", eMd)], null, "20260923T010000Z_eeee0001"));
t("a UTF-8 text lands under its UTF-8 digest", [utf.result?.ok, utf.result?.bundleSha], [true, sha(Buffer.from(eMd, "utf8"))]);
const F = "INFO-2026-0175-digest-f";
const fMd = md(F, 1, " Café");
refusedByName("a UTF-8 text sent with the digest of its Latin-1 encoding is refused",
  await post("promote", pkg(F, 1, [inline("bundle.md", fMd, { sha256: sha(Buffer.from(fMd, "latin1")) })], null, "20260923T010000Z_ffff0001")),
  ["bundle.md"]);

console.log("\n--- 4. a blob-backed file: its digest is its content address ---");
const G = "INFO-2026-0175-digest-g", G0 = "INFO-2026-0175-digest-g0";
const gMd = md(G, 1);
const blob = sha("the captured bytes");
refusedByName("a blob whose sha256 names another digest than its blobSha is refused",
  await post("promote", pkg(G0, 1, [inline("bundle.md", md(G0, 1)), { path: "snapshots/a.pdf", blobSha: blob, bytes: 18, sha256: FFF }],
    null, "20260923T010000Z_gggg0001")),
  ["snapshots/a.pdf"]);
const gLand = await post("promote", pkg(G, 1, [inline("bundle.md", gMd), { path: "snapshots/a.pdf", blobSha: blob, bytes: 18 }],
  null, "20260923T010000Z_gggg0002"));
t("a blob with no sha256 lands (promote does not read R2 — D-45)", gLand.result?.ok, true);

console.log("\n--- 5. the D-78 restamp does not paper over a false digest ---");
const inq = (surf) => ["---", "id: INQ-2026-0175-digest", "object_type: inquiry", "schema: inquiry@1",
  "current_state: open", `created: ${NOW}`, `last_updated: ${NOW}`, `surfaced_by: ${surf}`,
  "group: believe-in-oakland", "---", "", "## Question", "", "Is the digest honest?", ""].join("\n");
const inqPkg = (text, sha256) => ({ bundleId: "INQ-2026-0175-digest", base: null, snapKey: "20260923T030000Z_iiii0001",
  author: "claude", meta: { object_type: "inquiry", group: "believe-in-oakland", title: "Is the digest honest?",
    current_state: "open", created: NOW, last_updated: NOW },
  files: [{ path: "bundle.md", text, bytes: Buffer.byteLength(text), sha256 }], register: [] });
const i1 = await post("promote", inqPkg(inq("human"), FFF));
refusedByName("an inquiry creation (the D-78 restamp path) with a fff… digest is refused by name", i1, ["bundle.md"]);
const i2 = await post("promote", inqPkg(inq("human"), sha(inq("human"))));
t("OVER-STRICTNESS: the same creation with its own digest is not refused for its digest (the restamp recomputes)",
  i2.result?.reason === "FILE_DIGEST_MISMATCH", false);

console.log("\n--- 6. THE CENSUS — a row the old unchecked promote could have left, counted and never rewritten ---");
const clean = await census();
t("on the store this suite wrote through the checked door, NO digest disagrees",
  [clean.files.digest_disagrees, clean.history.digest_disagrees], [0, 0]);
t("  over a non-empty corpus (files, history)", [clean.files.rows > 0, clean.history.rows > 0], [true, true]);
console.log(`  census (clean): files ${JSON.stringify({ ...clean.files, listed: clean.files.listed.length })} `
          + `history ${JSON.stringify({ ...clean.history, listed: clean.history.listed.length })}`);
t("probe may read the census; a member may not", [(await get("op=digestcensus", "prb-175")).result?.ok === true,
  (await get("op=digestcensus", "mem-175")).result?.ok === true], [true, false]);

/* PLANT, WITH THE INSTANCE DOWN: the one thing promote can no longer write is exactly what the old one could. */
await mf.dispose();
const dbs = [];
const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : /\.sqlite$/.test(n) && dbs.push(p); } };
walk(PERSIST);
let planted = 0;
for (const p of dbs) {
  const db = new DatabaseSync(p);
  const has = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='files'").get();
  if (has) {
    planted += Number(db.prepare("UPDATE files SET sha256=? WHERE bundle_id=? AND path='data/notes.md'").run(FFF, A).changes);
    planted += Number(db.prepare("UPDATE history SET sha256=? WHERE bundle_id=? AND path='bundle.md'").run(FFF, A).changes);
  }
  db.close();
}
t("the fixture planted one live row and one history row (found the store's SQLite)", planted, 2);
mf = mk();
const dirty = await census();
t("the census counts the planted live row", dirty.files.digest_disagrees, 1);
t("  and the planted history row", dirty.history.digest_disagrees, 1);
t("  and lists them by bundle and path", [dirty.files.listed.map((r) => [r.bundle_id, r.path, r.stored]),
  dirty.history.listed.map((r) => [r.bundle_id, r.path, r.stored])],
  [[[A, "data/notes.md", FFF]], [[A, "bundle.md", FFF]]]);
t("  and says it rewrote nothing", dirty.rewritten, 0);
const again = await census();
t("  and a second read finds the same rows: NEVER silently rewritten", [again.files.digest_disagrees, again.history.digest_disagrees], [1, 1]);
const carried = await post("promote", pkg(A, 3, [inline("bundle.md", md(A, 3)),
  { path: "data/notes.md", text: notes, bytes: Buffer.byteLength(notes), sha256: FFF }], sha(aMd2), "20260923T040000Z_aaaa0007"));
t("a revision that CARRIES the planted false digest forward is refused by name, not laundered",
  carried.result?.reason, "FILE_DIGEST_MISMATCH");
console.log(`  census (planted): files digest_disagrees=${dirty.files.digest_disagrees} bytes_disagree=${dirty.files.bytes_disagree} `
          + `history digest_disagrees=${dirty.history.digest_disagrees}`);

await mf.dispose();
console.log(`\nrec175-digest: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
