/* NEGATIVE CONTROL: RUN 2026-09-25 (D-718 worker) by `node test/d718-divergence-write-order.control.mjs`, each arm ALONE, restored from a per-arm pristine copy in the item's pen (controlPen, outside the worktree) and verified by sha256 AND byte compare (checks/bio-checks.mjs 1,008,717 B sha256 b8df7cc5f8ad…); baseline 13 pass / 0 fail. REPRODUCED FIRST on land/worker/D-700 50116ded (the defect): 6 pass / 7 fail — §1 both, §2 both, §3's two says-so, §4's sparse.
   (key) THE ROW'S CONTROL: classifyDivergence's walk by `seq` -> sorted by snap key again. DECLARED §1, §2, §4 fail. RESULT 8/5 AS DECLARED — "§1 the catalogue classifies the package ADJUDICATED…", "§2 the catalogue classifies DISJOINT-AUTO anchored before P3…", "§4 seq as sparse integers still orders the walk…".
   (silent) C-17.2's key-order info finding -> never pushed. DECLARED §3. RESULT 11/2 AS DECLARED — "§3 an image without seq is classified in snap-key order and C-17.2 says so (info)".
   (spelling) OVER-STRICTNESS: the says-so condition -> `order !== 'write' && walked >= 2`. DECLARED nothing. RESULT 13/0 AS DECLARED.
   (compare) OVER-STRICTNESS: historyWriteOrder's seq comparator -> a three-way compare. DECLARED nothing. RESULT 13/0 AS DECLARED. */
/* =========================================================================
 * D-718 — C-17.2'S DIVERGENCE LADDER WALKS WRITE ORDER, AS C-20.1 DOES.
 * State Rules & Consistency v1.5 §6, I-20 as D-674 and D-700 amended it:
 * "prior" and "next" in the history are WRITE order, never the caller-chosen
 * snap key, whose lexical order is not a clock.
 *
 * THE DEFECT: `classifyDivergence` (the I-17 ladder's mechanical rung, C-17.2)
 * sorted `_history/manifest.json` by snap key before anchoring a pending
 * package's base in the chain and collecting the INTERVENING promotions — the
 * key-order walk D-700 removed from C-20.1, one check over. With keys chosen
 * against write order it misstated the record both ways:
 *   (hidden)  a promotion written AFTER the package's base, touching the
 *             package's own file, whose key sorts before the base's: it fell
 *             out of the intervening set and the ladder said DISJOINT-AUTO —
 *             "apply in sequence" over an edit it never saw.
 *   (anchor)  a package based on the snapshot written after P2, where P3
 *             (written after P2) carries the earlier key: the key walk put P2
 *             at the tail, found no intervening promotion and said
 *             "unrecorded live edit" — a claim about the record it cannot support.
 * D-718: the walk is `historyWriteOrder(hist.entries)` — `seq`, which the
 * plane's image carries since D-700 — and an image without it is walked in
 * key order, as before, and C-17.2 SAYS SO in an info finding.
 *
 * WHAT THIS SUITE HOLDS THE GATE TO — every snap key is chosen so that key
 * order and write order DIFFER (the FIXTURE assertions say they do). The
 * image is the plane's own (op=image, the image op=audit walks); the verdict
 * is the catalogue's, because op=audit publishes ERRORS only and C-17.2 is
 * info/warn: through op=audit a C-17.2 answer is invisible either way.
 *   §1 the hidden overlap is FOUND: adjudicated, naming the package's file.
 *   §2 the anchor is the write-order one: disjoint-auto before P3, intervening [P3].
 *   §3 an image without seq is classified in key order and C-17.2 says so (info).
 *   §4 OVER-STRICTNESS: seq as sparse integers still orders the walk; a seq'd
 *      image carries no key-order finding.
 *
 * HOW A LIAR PASSES, and which arm catches it:
 *   (1) the classifier sorting by key again — §1, §2 by name (the control).
 *   (2) a silent fallback — §3.
 *   (3) a fixture whose keys run WITH write order — the FIXTURE assertions.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash, webcrypto } from "node:crypto";
import { checkBundle, classifyDivergence } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const ADM = "adm-d718";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-d718", VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const shaHex = async (v) => createHash("sha256")
  .update(typeof v === "string" ? Buffer.from(v, "utf8") : Buffer.from(v)).digest("hex");
const sha512 = async (b) => new Uint8Array(await webcrypto.subtle.digest("SHA-512", b));
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}&token=${ADM}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}&token=${ADM}`)).json());
const E = encodeURIComponent;
const must = (label, r) => { if (!r || r.ok === false) throw new Error(`${label}: ${JSON.stringify(r).slice(0, 900)}`); return r; };

const md = (id, rev) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Diverging source"`, "current_state: collected", "prior_state: null",
  "created: 2026-07-24T00:00:00Z", `last_updated: 2026-07-24T0${rev}:00:00Z`,
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged", "source:",
  "  locator: https://www.oaklandca.gov/report.pdf", "  authority: City Auditor",
  "  retrieved: 2026-07-24T00:00:00Z", "monitoring:", "  enabled: false", "  frequency: none",
  "  last_checked: null", "---", "", "## Summary", "", `Revision ${rev}.`, "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const F = (path, text) => ({ path, text, bytes: Buffer.byteLength(text), sha256: sha(text) });
const shaOf = async (id) => ((await GET(`op=list&limit=1000`)) || {}).bundles?.find((b) => b.bundle_id === id)?.bundle_sha ?? null;
/* Dates run WITH write order (C-12.1 compares them); only the KEYS run against it. */
const promote = async (id, rev, snapKey, extra = [], base) => POST("op=promote", {
  bundleId: id, base: base === undefined ? await shaOf(id) : base, snapKey, author: "ruth",
  meta: { object_type: "information", group: "believe-in-oakland", title: "Diverging source",
          current_state: "collected", created: "2026-07-24T00:00:00Z", last_updated: `2026-07-24T0${rev}:00:00Z` },
  files: [F("bundle.md", md(id, rev)), ...extra], register: [] });
/* A pending package (PENDING_PROMOTION.json plus its .pending file), the subject C-17 reads from the live files. */
const pendingFiles = (id, base, name, text) => [
  F("PENDING_PROMOTION.json", JSON.stringify({ target: id, base, files: [{ name, sha256: sha(text) }],
    created: "2026-07-24T05:00:00Z", author: "sam", skill_version: "1.7.0" })),
  F(`${name}.pending`, text)];
const X = F("data/x.json", '{"x":1}');

const image = async (id) => GET(`op=image&id=${E(id)}`);
const filesOf = (img) => {
  const files = new Map();
  for (const [p, v] of Object.entries(img || {})) if (typeof v === "string") files.set(p, v);
  return files;
};
const judge = async (id, img) => (await checkBundle({ folderName: id, files: filesOf(img), sha256: shaHex, sha512,
  resolveTarget: () => true })).findings;
const c172 = (fs, sev) => fs.filter((x) => x.check === "C-17.2" && (!sev || x.severity === sev));
const classify = (img) => {
  const files = filesOf(img);
  const c = classifyDivergence(JSON.parse(files.get("PENDING_PROMOTION.json")), files);
  return { rung: c.rung, baseKey: c.baseKey ?? null, intervening: c.intervening ?? null, reason: c.reason ?? null, order: c.order };
};
const manifestOf = (img) => JSON.parse(img?.["_history/manifest.json"] ?? '{"entries":[]}').entries ?? [];
const strip = (img, f) => ({ ...img, "_history/manifest.json": JSON.stringify({ entries: manifestOf(img).map(f) }, null, 2) });
const KEY_ORDER_SAID = /snap-key order/;

try {

/* ======================= §1 HIDDEN: P1 create, P2 edits x, P3 edits y AND holds a package based on P1's bytes touching y.
   P3's key sorts BEFORE P2's, so a key walk anchors the package before P2 and never sees P3's edit of y. */
const HID = "INFO-2026-7180-hidden";
const H = { p1: "20260724T010000Z_d7180001", p2: "20260724T030000Z_d7180002", p3: "20260724T020000Z_d7180003" };
must("P1 create", await promote(HID, 1, H.p1, [], null));
const h1 = sha(md(HID, 1));
must("P2 edits data/x.json", await promote(HID, 2, H.p2, [X]));
must("P3 edits data/y.json and parks a package on P1's bytes touching data/y.json", await promote(HID, 3, H.p3,
  [X, F("data/y.json", '{"y":1}'), ...pendingFiles(HID, h1, "data/y.json", '{"y":2}')]));
const hidImg = await image(HID);
const WRITTEN_H = [H.p1, H.p2, H.p3];
console.log(`  corpus: ${HID}, written ${WRITTEN_H.join(" -> ")}; file order ${manifestOf(hidImg).map((e) => e.key).join(" , ")}`);
t("FIXTURE: three promotions, every one carrying seq, and snap-key order is NOT write order (P3 sorts before P2)",
  [manifestOf(hidImg).length, manifestOf(hidImg).every((e) => Number.isSafeInteger(e.seq)), [...WRITTEN_H].sort().join() !== WRITTEN_H.join()],
  [3, true, true]);
const hidF = await judge(HID, hidImg);
t("FIXTURE: the catalogue sees a divergence (C-17.1 warn), so C-17.2 is asked",
  hidF.some((x) => x.check === "C-17.1" && x.severity === "warn"), true);
t("§1 the catalogue classifies the package ADJUDICATED on the overlap P3 wrote, never disjoint-auto",
  c172(hidF).filter((x) => x.severity !== "info").map((x) => [x.severity, /overlapping substantive divergence on \{data\/y\.json\}/.test(x.message)]),
  [["warn", true]]);
t("§1 classifyDivergence over the plane's image walks write order and names the overlap",
  classify(hidImg), { rung: "adjudicated", baseKey: null, intervening: null,
    reason: "overlapping substantive divergence on {data/y.json}", order: "write" });
const aud = await GET("op=audit&limit=500");
console.log(`  (op=audit reaches the bundle — checked ${aud?.checked}; it publishes errors only, so C-17.2's info/warn is not in its answer either way: tally ${JSON.stringify(aud?.tally)})`);

/* ======================= §2 ANCHOR: P1 create, P2 edits x, P3 holds a package based on P2's bytes touching z.
   P3's key sorts before P2's, so a key walk puts P2 at the tail and reads "unrecorded live edit". */
const ANC = "INFO-2026-7181-anchor";
const A = { p1: "20260724T010000Z_d7181001", p2: "20260724T030000Z_d7181002", p3: "20260724T020000Z_d7181003" };
must("P1 create", await promote(ANC, 1, A.p1, [], null));
must("P2 edits data/x.json", await promote(ANC, 2, A.p2, [X]));
const h2 = sha(md(ANC, 2));
must("P3 edits bundle.md and parks a package on P2's bytes touching data/z.json", await promote(ANC, 3, A.p3,
  [X, ...pendingFiles(ANC, h2, "data/z.json", '{"z":1}')]));
const ancImg = await image(ANC);
t("FIXTURE: P3, written after P2, sorts before it by key",
  [manifestOf(ancImg).length, [...Object.values(A)].sort().indexOf(A.p3) < [...Object.values(A)].sort().indexOf(A.p2)], [3, true]);
const ancF = await judge(ANC, ancImg);
t("§2 the catalogue classifies DISJOINT-AUTO anchored before P3, the one promotion written since the package's base",
  c172(ancF).filter((x) => x.severity !== "info" || !KEY_ORDER_SAID.test(x.message))
    .map((x) => [x.severity, x.message.includes(`base found in history at before ${A.p3}`), x.message.includes(`intervening promotion(s) [${A.p3}]`)]),
  [["info", true, true]]);
t("§2 classifyDivergence names the write-order anchor and intervening set",
  classify(ancImg), { rung: "disjoint-auto", baseKey: `before ${A.p3}`, intervening: [A.p3], reason: null, order: "write" });

/* ======================= §3 an image WITHOUT write order is classified in key order, and SAYS so */
const oldHid = strip(hidImg, ({ seq, ...e }) => e);
const oldF = await judge(HID, oldHid);
t("FIXTURE: the old-shaped image carries no seq", manifestOf(oldHid).some((e) => "seq" in e), false);
t("§3 an image without seq is classified in snap-key order and C-17.2 says so (info)",
  c172(oldF, "info").some((x) => KEY_ORDER_SAID.test(x.message)), true);
t("§3 and its key-order walk is what it was before D-718 (disjoint-auto over P3's edit: the reason seq is walked)",
  classify(oldHid).rung, "disjoint-auto");
const partial = strip(ancImg, (e) => (e.key === A.p3 ? (({ seq, ...r }) => r)(e) : e));
t("§3 an image where only SOME entries carry seq is classified in key order and says so",
  c172(await judge(ANC, partial), "info").some((x) => KEY_ORDER_SAID.test(x.message)), true);

/* ======================= §4 OVER-STRICTNESS */
const sparse = strip(ancImg, (e) => ({ ...e, seq: e.seq * 1000 + 7 }));
t("§4 seq as sparse integers still orders the walk: the anchor is still before P3",
  classify(sparse), { rung: "disjoint-auto", baseKey: `before ${A.p3}`, intervening: [A.p3], reason: null, order: "write" });
t("§4 a seq'd image carries no key-order finding", [...hidF, ...ancF].filter((x) => KEY_ORDER_SAID.test(x.message)).length, 0);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack : e}`);
  fail++;
}
await mf.dispose();
console.log(`\nd718-divergence-write-order: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
