/* NEGATIVE CONTROL: RUN 2026-09-23 (REC-182 worker) by `node test/rec-182-created-tie.control.mjs`, each arm ALONE, restored from a per-arm pristine copy and verified by sha256 AND byte compare (src/store.mjs 2,903,292 B sha256 aabc6f1a0980…); baseline 7 pass / 0 fail.
   (export) `exportManifest`'s promotions `ORDER BY created, rowid` -> `ORDER BY created`. DECLARED: §1 fails; §2, §3 hold. RESULT 6/1, AS DECLARED — "§1 op=export returns the promotions tied on created in WRITE order, on every one of five reads".
   (gate) `gateFacts`' manifest `ORDER BY created, rowid` -> `ORDER BY created`. DECLARED: §2 fails; §1, §3 hold. RESULT 6/1, AS DECLARED — "§2 the gate's facts return the manifest tied on created in WRITE order, on every one of five reads".
   RE-RUN 2026-09-25 (D-674 worker) after D-674 moved both sites to `ORDER BY rowid` and the control's anchors with them (its CORRECTED note): baseline 7/0; (export) 6/1 and (gate) 6/1, both AS DECLARED, the same assertions by name. */
/* =========================================================================
 * REC-182 — ON A `created` TIE, A MANIFEST READ RETURNS WRITE ORDER.
 * State Rules & Consistency v1.5 §6, I-20 (*relative to the immediately prior
 * recorded snapshot*), with D-171's `created DESC, rowid DESC` as the precedent.
 *
 * THE DEFECT: `exportManifest`'s `promotions` and `gateFacts`' `manifest`
 * ordered by `created` alone. `created` is the DOCUMENT's time (promote stores
 * meta.last_updated), so two promotions can tie on it, and a tie then came back
 * in whatever order the scan produced — through the (bundle_id, snap_key)
 * primary key, that is the caller-chosen snap key's lexical order, which is not
 * a clock. "Prior" was undefined on a tie.
 *
 * WHAT THIS SUITE HOLDS THE PLANE TO:
 *   §1 three promotions of ONE bundle at ONE last_updated, their snap keys
 *      chosen to run AGAINST write order, come back from `op=export` in WRITE
 *      order, on every one of five reads.
 *   §2 the same from the gate's facts. No op serves `gateFacts`' manifest (op=ratify
 *      reads the facts and uses none of the manifest), so it is read at the hop
 *      op=ratify itself makes, `do/gatefacts`, and this is the one arm not
 *      driven through an op.
 *   §3 I-20's text names the tie rule (the design document is the expectation).
 *
 * HOW A LIAR PASSES, and which arm catches it:
 *   (1) an order untied on `created` (the defect) — §1/§2, because the keys run
 *       against write order, so key order and write order differ.
 *   (2) keys that happen to run WITH write order — the FIXTURE assertion that
 *       they do not.
 * ========================================================================= */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const DESIGN = fileURLToPath(new URL("../../docs/architecture/BIO_State_Rules_Consistency_v1_5.md", import.meta.url));
const ADM = "adm-r182", MTOK = "mem-r182";
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MTOK, VERSION: "test" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const DOGET = async (path) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  return rP(await (await ns.get(ns.idFromName("bio")).fetch(`http://do/${path}`)).json());
};
const E = encodeURIComponent;
const must = (label, r) => { if (!r || r.ok === false) throw new Error(`${label}: ${JSON.stringify(r).slice(0, 900)}`); return r; };
const NOW = "2026-07-01T00:00:00Z", TIE = "2026-07-02T00:00:00Z";

try {

/* ============================================================== FIXTURE */
const ID = "INFO-2026-1820-tie";
const infoMd = (summary) => ["---",
  `id: ${ID}`, "object_type: information", "schema: information@1",
  `title: "Info ${ID}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${TIE}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "source_status: unchanged",
  "---", "", "## Summary", "", summary, "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const promote = async (text, base, snapKey) => POST(`op=promote&token=${ADM}`, {
  bundleId: ID, base, snapKey,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: base === null
    ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${ID}`), encoding: "binary", bytes: 10 }] : [],
  meta: { object_type: "information", group: "believe-in-oakland", title: `Info ${ID}`,
          current_state: "collected", created: NOW, last_updated: TIE } });
const shaOf = async () => ((await GET(`op=list&token=${ADM}&limit=1000`)) || {}).bundles
  ?.find((b) => b.bundle_id === ID)?.bundle_sha ?? null;

/* WRITE ORDER m, z, a; KEY ORDER a, m, z. Every promotion carries the SAME last_updated, so `created` ties. */
const WRITTEN = ["r182-m", "r182-z", "r182-a"];
t("FIXTURE: the keys run AGAINST write order (key order differs from write order)",
  JSON.stringify([...WRITTEN].sort()) !== JSON.stringify(WRITTEN), true);
must("create", await promote(infoMd("A captured document."), null, WRITTEN[0]));
must("revise 1", await promote(infoMd("A captured document, revised once."), await shaOf(), WRITTEN[1]));
must("revise 2", await promote(infoMd("A captured document, revised twice."), await shaOf(), WRITTEN[2]));

/* ============================================ §1 op=export returns the promotions in write order */
const exported = [];
for (let i = 0; i < 5; i++) {
  const ex = await POST(`op=export&token=${ADM}`);
  exported.push(ex?.bundles?.find((b) => b.bundle_id === ID)?.promotions ?? null);
}
t("FIXTURE: op=export answers three promotions, every one at the SAME created",
  [exported[0]?.length, [...new Set((exported[0] ?? []).map((p) => p.created))].length], [3, 1]);
console.log(`  corpus: 1 information bundle, 3 promotions at created ${exported[0]?.[0]?.created}, written ${WRITTEN.join(" -> ")}`);
t("§1 op=export returns the promotions tied on created in WRITE order, on every one of five reads",
  exported.map((ps) => (ps ?? []).map((p) => p.snap_key)), exported.map(() => WRITTEN));

/* ================================= §2 the gate's facts return the manifest in write order */
const gated = [];
for (let i = 0; i < 5; i++) gated.push((await DOGET(`gatefacts?id=${E(ID)}`))?.manifest ?? null);
t("FIXTURE: the gate's facts answer three manifest rows", gated[0]?.length, 3);
t("§2 the gate's facts return the manifest tied on created in WRITE order, on every one of five reads",
  gated.map((ms) => (ms ?? []).map((m) => m.snap_key)), gated.map(() => WRITTEN));

/* ============================================================ §3 I-20 names the tie rule */
const doc = readFileSync(DESIGN, "utf8");
const i20 = /\*\*I-20 [^*]+\*\*([\s\S]*?)(?=\n\n## |\n\n\*\*I-\d)/.exec(doc)?.[1] ?? "";
t("FIXTURE: I-20's paragraph is found in §6", i20.length > 200, true);
t("§3 I-20 says that on a created tie the prior snapshot is the one written first",
  /on a `created` tie/i.test(i20) && /write order/i.test(i20), true);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack : e}`);
  fail++;
}
await mf.dispose();
console.log(`\nrec-182-created-tie: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
