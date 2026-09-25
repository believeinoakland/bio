/* NEGATIVE CONTROL: RUN 2026-09-25 (D-700 worker) by `node test/d700-audit-write-order.control.mjs`, each arm ALONE, restored from a per-arm pristine copy in the item's pen (controlPen, outside the worktree) and verified by sha256 AND byte compare (src/store.mjs 3,472,328 B sha256 42648025fa25…, checks/bio-checks.mjs 1,007,663 B sha256 88961a078371…); baseline 15 pass / 0 fail. REPRODUCED FIRST on land/worker/D-674 96a7802f (the defect): 7 pass / 8 fail — §1 both, §2 both, §3's seq, §4's two says-so, §5's sparse.
   (key) THE ROW'S CONTROL: C-20.1's walk by `seq` -> sorted by snap key again. DECLARED §1, §2, §5 fail. RESULT 10/5 AS DECLARED — "§1 the catalogue finds the overreaching tick…", "§2 the catalogue does not blame…", "§5 seq as sparse integers…".
   (image) readImage's `seq: ++seq` -> dropped. DECLARED §1, §2, §3, §5. RESULT 8/7 AS DECLARED.
   (silent) the key-order fallback's info finding -> never pushed. DECLARED §4. RESULT 13/2 AS DECLARED — "§4 an image without seq is audited in snap-key order and C-20.1 says so (info)".
   (spelling) OVER-STRICTNESS: readImage's `ORDER BY rowid` -> `ORDER BY _rowid_`. DECLARED nothing. RESULT 15/0 AS DECLARED.
   (compare) OVER-STRICTNESS: the seq comparator `a.seq - b.seq` -> a three-way compare. DECLARED nothing. RESULT 15/0 AS DECLARED. */
/* =========================================================================
 * D-700 — THE GATE'S C-20.1 AUDIT WALKS WRITE ORDER, AS THE PLANE DOES.
 * State Rules & Consistency v1.5 §6, I-20 as D-674 amended it: "the
 * immediately prior recorded snapshot" is the one WRITTEN before — the
 * store's write order, never the writer's date and never the caller-chosen
 * snap key, whose lexical order is not a clock.
 *
 * THE DEFECT: D-674 put every PLANE reader of the manifest on `rowid`, but the
 * image the gate audits (`readImage`, served by op=image and walked by
 * op=audit) carried no write order at all, and `checkMechanicalConformance`
 * (C-20.1) sorted `_history/manifest.json` by snap key. A snapshot's post
 * state is read from the NEXT entry, so with keys chosen against write order
 * the gate and the plane disagreed on "prior" — both ways:
 *   (hidden)  a mechanical tick that overreached its field set, whose key
 *             sorts LAST, read as the tail; live had moved past it, so the
 *             audit skipped it and the overreach passed.
 *   (blamed)  a conformant tick whose key sorts BEFORE an earlier-written
 *             person's edit was diffed against that OLDER snapshot and blamed
 *             for the person's prose.
 * D-700: the image carries `seq` — each entry's write-order rank (1..n, by
 * rowid) — and C-20.1 walks it. An image without it (an old image, a foreign
 * one) is walked in key order, as before, and C-20.1 SAYS SO in an info finding.
 * The array itself stays in key order: C-12.1 requires the file sorted by key.
 *
 * WHAT THIS SUITE HOLDS THE GATE TO — every snap key below is chosen so that
 * key order and write order DIFFER (the FIXTURE assertions say they do):
 *   §1 the hidden overreach is FOUND, through op=image + the catalogue AND op=audit.
 *   §2 the conformant tick is NOT blamed, through both.
 *   §3 the image carries seq 1..n in write order, and the file stays in key order.
 *   §4 an image without seq is audited in key order and C-20.1 says so (info).
 *   §5 OVER-STRICTNESS: seq as sparse raw integers still orders the walk; a
 *      whole seq'd image carries no "key order" finding.
 *
 * HOW A LIAR PASSES, and which arm catches it:
 *   (1) the checker sorting by key again — §1, §2 by name (the control).
 *   (2) the image dropping seq — §1..§3.
 *   (3) a silent fallback — §4.
 *   (4) a fixture whose keys run WITH write order — the FIXTURE assertions.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash, webcrypto } from "node:crypto";
import { checkBundle } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const ADM = "adm-d700";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-d700", VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
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

/* A monitored Information bundle (mechanical.test.mjs's shape): what a monitor tick acts on. */
const md = (id, o0) => {
  const o = { updated: "2026-07-24T01:00:00Z", sessions: 1, sourceStatus: "unchanged", lastChecked: null,
              summary: "What the report shows.", criticality: "supporting", ...o0 };
  return ["---", `id: ${id}`, "object_type: information", "schema: information@1",
    `title: "Monitored source"`, "current_state: collected", "prior_state: null",
    "created: 2026-07-24T00:00:00Z", `last_updated: ${o.updated}`,
    "produced_by:", "  mode: mechanical", "  capability_tier: daemon",
    "group: believe-in-oakland", "references: []", "state_history: []",
    "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
    "visuals: []", `criticality: ${o.criticality}`,
    `source_status: ${o.sourceStatus}`, "source:",
    "  locator: https://www.oaklandca.gov/report.pdf", "  authority: City Auditor",
    "  retrieved: 2026-07-24T00:00:00Z",
    "monitoring:", "  enabled: true", "  frequency: daily",
    `  last_checked: ${o.lastChecked ?? "null"}`, "---", "",
    "## Summary", "", o.summary, "", "## Provenance Notes", "",
    "## Session Log", "",
    ...Array.from({ length: o.sessions }, (_, i) => [`### Session ${i + 1}`, "", `Entry ${i + 1}.`, ""]).flat(),
    "## Review Notes", ""].join("\n");
};
const shaOf = async (id) => ((await GET(`op=list&limit=1000`)) || {}).bundles?.find((b) => b.bundle_id === id)?.bundle_sha ?? null;
/* Dates run WITH write order (C-12.1 compares them); only the KEYS run against it. */
const promote = async (id, body, { snapKey, updated, mechanical = false, base }) => POST("op=promote", {
  bundleId: id, base: base === undefined ? await shaOf(id) : base, snapKey, author: mechanical ? "bio-daemon" : "ruth",
  meta: { object_type: "information", group: "believe-in-oakland", title: "Monitored source",
          current_state: "collected", created: "2026-07-24T00:00:00Z", last_updated: updated },
  files: [{ path: "bundle.md", text: body, bytes: Buffer.byteLength(body), sha256: sha(body) }], register: [],
  ...(mechanical ? { writer: "mechanical", operation: "monitor-tick" } : {}) });
const image = async (id) => GET(`op=image&id=${E(id)}`);
const judge = async (id, img0 = null) => {
  const img = img0 ?? await image(id);
  const files = new Map();
  for (const [p, v] of Object.entries(img || {})) if (typeof v === "string") files.set(p, v);
  const { findings } = await checkBundle({ folderName: id, files, sha256: shaHex, sha512, resolveTarget: () => true });
  return findings;
};
const c201 = (fs, sev) => fs.filter((x) => x.check === "C-20.1" && x.severity === sev);
const auditOf = async (id) => {
  const a = await GET("op=audit&limit=500");
  return (a?.offenders ?? []).find((o) => o.bundleId === id)?.errors?.map((e) => e.check) ?? [];
};
const manifestOf = (img) => JSON.parse(img?.["_history/manifest.json"] ?? '{"entries":[]}').entries ?? [];
const KEY_ORDER_SAID = /snap-key order/;

try {

/* ======================= §1 HIDDEN: create, an overreaching tick, a person's edit — the tick's key sorts LAST */
const HID = "INFO-2026-7000-hidden";
const H = { create: "20260724T010000Z_d7000001", tick: "20260724T030000Z_d7000002", edit: "20260724T020000Z_d7000003" };
must("create", await promote(HID, md(HID), { snapKey: H.create, updated: "2026-07-24T01:00:00Z", base: null }));
must("tick (overreach: criticality)", await promote(HID, md(HID, { updated: "2026-07-24T02:00:00Z", sessions: 2,
  lastChecked: "2026-07-24T02:00:00Z", criticality: "crucial" }), { snapKey: H.tick, updated: "2026-07-24T02:00:00Z", mechanical: true }));
must("a person edits", await promote(HID, md(HID, { updated: "2026-07-24T03:00:00Z", sessions: 2,
  lastChecked: "2026-07-24T02:00:00Z", criticality: "crucial", summary: "What the report shows, read by Ruth." }),
  { snapKey: H.edit, updated: "2026-07-24T03:00:00Z" }));
const hidImg = await image(HID);
const hidMan = manifestOf(hidImg);
const WRITTEN_H = [H.create, H.tick, H.edit];
console.log(`  corpus: ${HID}, written ${WRITTEN_H.join(" -> ")}; file order ${hidMan.map((e) => e.key).join(" , ")}`);
t("FIXTURE: three promotions, and snap-key order is NOT write order (the tick's key sorts last)",
  [hidMan.length, [...WRITTEN_H].sort().join() !== WRITTEN_H.join(), [...WRITTEN_H].sort().at(-1)], [3, true, H.tick]);
const hidF = await judge(HID, hidImg);
t("§1 the catalogue finds the overreaching tick, audited against the snapshot WRITTEN after it",
  c201(hidF, "error").map((x) => [x.check, /criticality/.test(x.message), x.message.includes(H.tick)]), [["C-20.1", true, true]]);
t("§1 op=audit, the plane's own sweep over the same image, reports it too", (await auditOf(HID)).includes("C-20.1"), true);

/* ======================= §2 BLAMED: create, a person's edit, a conformant tick, a person — the tick's key sorts BEFORE the first edit */
const BLM = "INFO-2026-7001-blamed";
const B = { create: "20260724T010000Z_d7010001", edit: "20260724T030000Z_d7010002", tick: "20260724T020000Z_d7010003", last: "20260724T040000Z_d7010004" };
const edited = { summary: "What the report shows, as Ruth rewrote it." };
must("create", await promote(BLM, md(BLM), { snapKey: B.create, updated: "2026-07-24T01:00:00Z", base: null }));
must("a person rewrites the summary", await promote(BLM, md(BLM, { ...edited, updated: "2026-07-24T02:00:00Z" }),
  { snapKey: B.edit, updated: "2026-07-24T02:00:00Z" }));
must("a conformant tick", await promote(BLM, md(BLM, { ...edited, updated: "2026-07-24T03:00:00Z", sessions: 2,
  lastChecked: "2026-07-24T03:00:00Z", sourceStatus: "modified" }), { snapKey: B.tick, updated: "2026-07-24T03:00:00Z", mechanical: true }));
must("a person again", await promote(BLM, md(BLM, { summary: "What the report shows; Ruth again.", updated: "2026-07-24T04:00:00Z",
  sessions: 2, lastChecked: "2026-07-24T03:00:00Z", sourceStatus: "modified" }), { snapKey: B.last, updated: "2026-07-24T04:00:00Z" }));
const blmImg = await image(BLM);
const WRITTEN_B = [B.create, B.edit, B.tick, B.last];
t("FIXTURE: four promotions, and by snap key the tick would read BEFORE the edit written ahead of it",
  [manifestOf(blmImg).length, [...WRITTEN_B].sort().indexOf(B.tick) < [...WRITTEN_B].sort().indexOf(B.edit)], [4, true]);
const blmF = await judge(BLM, blmImg);
t("§2 the catalogue does not blame the conformant tick for the person's prose", c201(blmF, "error").map((x) => x.message), []);
t("§2 op=audit does not report it", (await auditOf(BLM)).includes("C-20.1"), false);

/* ======================= §3 the image carries write order, and the file stays in key order */
t("§3 every entry carries seq, its write-order rank: written create, tick, edit read 1, 2, 3",
  WRITTEN_H.map((k) => hidMan.find((e) => e.key === k)?.seq ?? null), [1, 2, 3]);
t("§3 the file itself stays in snap-key order (C-12.1 requires it)", hidMan.map((e) => e.key), [...WRITTEN_H].sort());
t("§3 the catalogue raises no C-12 finding over it", hidF.filter((x) => /^C-12\./.test(x.check) && x.severity === "error").map((x) => x.message), []);

/* ======================= §4 an image WITHOUT write order is walked in key order, and SAYS so */
const strip = (img, f) => ({ ...img, "_history/manifest.json": JSON.stringify({ entries: manifestOf(img).map(f) }, null, 2) });
const oldBlm = strip(blmImg, ({ seq, ...e }) => e);
const oldF = await judge(BLM, oldBlm);
t("FIXTURE: the old-shaped image carries no seq", manifestOf(oldBlm).some((e) => "seq" in e), false);
t("§4 an image without seq is audited in snap-key order and C-20.1 says so (info)",
  c201(oldF, "info").some((x) => KEY_ORDER_SAID.test(x.message)), true);
t("§4 and its key-order walk is what it was before D-700 (it blames the tick: the reason seq exists)",
  c201(oldF, "error").length > 0, true);
const partial = strip(blmImg, (e) => (e.key === B.last ? (({ seq, ...r }) => r)(e) : e));
t("§4 an image where only SOME entries carry seq is walked in key order and says so",
  c201(await judge(BLM, partial), "info").some((x) => KEY_ORDER_SAID.test(x.message)), true);

/* ======================= §5 OVER-STRICTNESS */
const sparse = strip(hidImg, (e) => ({ ...e, seq: e.seq * 1000 + 7 }));
t("§5 seq as sparse integers still orders the walk: the overreach is found",
  c201(await judge(HID, sparse), "error").map((x) => x.check), ["C-20.1"]);
t("§5 a seq'd image carries no key-order finding", [...hidF, ...blmF].filter((x) => KEY_ORDER_SAID.test(x.message)).length, 0);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack : e}`);
  fail++;
}
await mf.dispose();
console.log(`\nd700-audit-write-order: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
