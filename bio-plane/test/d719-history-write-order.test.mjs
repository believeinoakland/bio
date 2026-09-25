/* NEGATIVE CONTROL: RUN 2026-09-25 (D-719 worker) by `node test/d719-history-write-order.control.mjs`, each arm ALONE, restored from a per-arm pristine copy in the item's pen (controlPen, outside the worktree) and verified by sha256 AND byte compare (src/setup.mjs 84,241 B sha256 80f41e0d3af0…); baseline 8 pass / 0 fail. REPRODUCED FIRST on land/worker/D-700 50116ded (the defect): 2 pass / 6 fail — §1, §2 both, §3's two "said", §4.
   (key) THE ROW'S CONTROL: historyOrder's write branch -> sorted by snap key again. DECLARED §1, §4 fail. RESULT 6/2 AS DECLARED — "§1 a bundle whose keys run against write order lists its history in write order", "§4 seq as sparse integers…".
   (silent) the list's statement of order -> dropped. DECLARED §2 says, §3 said ×2, §4. RESULT 4/4 AS DECLARED.
   (caption) the fixed caption -> "oldest first" again. DECLARED §2 caption. RESULT 7/1 AS DECLARED.
   (compare) OVER-STRICTNESS: the seq comparator `a.seq-b.seq` -> a three-way compare. DECLARED nothing. RESULT 8/0 AS DECLARED. */
/* =========================================================================
 * D-719 — THE BUNDLE VIEW'S HISTORY LIST READS IN WRITE ORDER, AND SAYS WHICH
 * ORDER IT SHOWS.
 * State Rules & Consistency v1.5 §6, I-20 as D-674 and D-700 amended it: the
 * record's order is WRITE order, never the caller-chosen snap key, whose
 * lexical order is not a clock. D-700 put each entry's write-order rank on the
 * image as `seq`.
 *
 * THE DEFECT: the setup page's bundle view (src/setup.mjs, renderBundle,
 * #b-history) sorted `_history/manifest.json` by snap key, under a caption
 * saying "oldest first", so a member read a bundle's history in an order the
 * record does not hold — and was told it was the order it happened in.
 *
 * D-719: the list is sorted by `seq` when EVERY entry carries a distinct
 * integer one (the same predicate as the gate's historyWriteOrder, D-700), else
 * by snap key as before; either way the list's first line states which order it
 * shows, and the key-order line says that order is not the order written.
 *
 * DRIVEN THROUGH THE OP AND THE SERVED PAGE: the fixture is written by
 * op=promote, read back by op=image, and rendered by the page script served at
 * `/` (not the source file), run under a stub document whose elements are kept
 * by selector so #b-history's rendered HTML can be read.
 *   §1 a bundle whose keys run against write order lists in WRITE order.
 *   §2 the page says it shows the order written, and the fixed caption above
 *      the list no longer claims an order ("oldest first") of its own.
 *   §3 an image without seq (or with seq on only some entries) lists in key
 *      order, as before, and SAYS that is not the order written.
 *   §4 OVER-STRICTNESS: sparse integer seq still orders by seq.
 *
 * HOW A LIAR PASSES, and which arm catches it:
 *   (1) the list sorted by key again — §1 by name (the row's control).
 *   (2) no statement of order — §2, §3.
 *   (3) a fixture whose keys run WITH write order — the FIXTURE assertion.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const ADM = "adm-d719";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-d719", VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}&token=${ADM}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}&token=${ADM}`)).json());
const must = (label, r) => { if (!r || r.ok === false) throw new Error(`${label}: ${JSON.stringify(r).slice(0, 900)}`); return r; };

const md = (id, updated, summary) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "A source"`, "current_state: collected", "prior_state: null",
  "created: 2026-07-24T00:00:00Z", `last_updated: ${updated}`,
  "produced_by:", "  mode: human", "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "visuals: []", "criticality: supporting", "---", "",
  "## Summary", "", summary, ""].join("\n");
const shaOf = async (id) => ((await GET(`op=list&limit=1000`)) || {}).bundles?.find((b) => b.bundle_id === id)?.bundle_sha ?? null;
const promote = async (id, body, { snapKey, updated, base }) => POST("op=promote", {
  bundleId: id, base: base === undefined ? await shaOf(id) : base, snapKey, author: "ruth",
  meta: { object_type: "information", group: "believe-in-oakland", title: "A source",
          current_state: "collected", created: "2026-07-24T00:00:00Z", last_updated: updated },
  files: [{ path: "bundle.md", text: body, bytes: Buffer.byteLength(body), sha256: sha(body) }], register: [] });
const manifestOf = (img) => JSON.parse(img?.["_history/manifest.json"] ?? '{"entries":[]}').entries ?? [];
const strip = (img, f) => ({ ...img, "_history/manifest.json": JSON.stringify({ entries: manifestOf(img).map(f) }, null, 2) });

/* The page script as SERVED, run under a stub document that keeps each element by selector. */
const loadPage = async () => {
  const page = await (await mf.dispatchFetch("http://x/")).text();
  const scriptSrc = /<script>([\s\S]*)<\/script>/.exec(page)[1];
  const els = new Map();
  const el = () => ({ addEventListener() {}, classList: { add() {}, remove() {} },
    textContent: "", innerHTML: "", value: "", style: {}, hidden: false, dataset: {} });
  const get = (s) => { if (!els.has(s)) els.set(s, el()); return els.get(s); };
  const sandbox = {
    document: { querySelector: get, querySelectorAll: () => [], getElementById: (i) => get("#" + i) },
    window: {}, location: { hash: "", pathname: "/" }, history: { replaceState() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    fetch: async () => ({ ok: true, status: 200, json: async () => ({ ok: true, claimed: false, bootstrapConfigured: true }) }),
    URLSearchParams, console, JSON, Date, RegExp, String, Number, Object, Array,
  };
  sandbox.window = sandbox;
  const fn = new Function(...Object.keys(sandbox), scriptSrc + "\n;return { renderBundle };");
  const hooks = fn(...Object.values(sandbox));
  await new Promise((r) => setTimeout(r, 10));
  return (id, img) => { hooks.renderBundle(id, img, null); return get("#b-history").innerHTML; };
};
/* The keys in the order the rendered list shows them, and the list's statement of order. */
const keysShown = (html, keys) => keys.map((k) => [k, html.indexOf(k)]).filter(([, i]) => i >= 0).sort((a, b) => a[1] - b[1]).map(([k]) => k);
const WRITE_SAID = /in the order (they were )?written/i;
const KEY_SAID = /not (necessarily )?the order (they were )?written/i;

try {
const render = await loadPage();

/* ======================= §1 keys chosen against write order */
const ID = "INFO-2026-7190-order";
const K = { create: "20260724T010000Z_d7190001", second: "20260724T030000Z_d7190002", third: "20260724T020000Z_d7190003" };
const WRITTEN = [K.create, K.second, K.third];
must("create", await promote(ID, md(ID, "2026-07-24T01:00:00Z", "First."), { snapKey: K.create, updated: "2026-07-24T01:00:00Z", base: null }));
must("second", await promote(ID, md(ID, "2026-07-24T02:00:00Z", "Second."), { snapKey: K.second, updated: "2026-07-24T02:00:00Z" }));
must("third", await promote(ID, md(ID, "2026-07-24T03:00:00Z", "Third."), { snapKey: K.third, updated: "2026-07-24T03:00:00Z" }));
const img = await GET(`op=image&id=${encodeURIComponent(ID)}`);
const man = manifestOf(img);
console.log(`  corpus: ${ID}, written ${WRITTEN.join(" -> ")}; file order ${man.map((e) => e.key).join(" , ")}`);
t("FIXTURE: three promotions carrying seq, and snap-key order is NOT write order",
  [man.length, man.every((e) => Number.isSafeInteger(e.seq)), [...WRITTEN].sort().join() !== WRITTEN.join()], [3, true, true]);
const html = render(ID, img);
t("§1 a bundle whose keys run against write order lists its history in write order", keysShown(html, WRITTEN), WRITTEN);

/* ======================= §2 the page states the order it shows */
t("§2 the page says the list is in the order written", [WRITE_SAID.test(html), KEY_SAID.test(html)], [true, false]);
const caption = /<h2>History<\/h2>\s*<p class="small">([\s\S]*?)<\/p>/.exec(await (await mf.dispatchFetch("http://x/")).text())?.[1] ?? null;
t("§2 the fixed caption claims no order of its own (\"oldest first\" sat over a key-order list)",
  [caption !== null, /first|order/i.test(caption ?? "")], [true, false]);

/* ======================= §3 an image without write order: key order, said */
const old = render(ID, strip(img, ({ seq, ...e }) => e));
t("§3 an image without seq lists by snap key, as before", keysShown(old, WRITTEN), [...WRITTEN].sort());
t("§3 and says that is not the order written", KEY_SAID.test(old), true);
const partial = render(ID, strip(img, (e) => (e.key === K.third ? (({ seq, ...r }) => r)(e) : e)));
t("§3 seq on only some entries is not a write order: key order, said",
  [keysShown(partial, WRITTEN), KEY_SAID.test(partial)], [[...WRITTEN].sort(), true]);

/* ======================= §4 OVER-STRICTNESS */
const sparse = render(ID, strip(img, (e) => ({ ...e, seq: e.seq * 1000 + 7 })));
t("§4 seq as sparse integers still orders the list by write", [keysShown(sparse, WRITTEN), WRITE_SAID.test(sparse)], [WRITTEN, true]);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack : e}`);
  fail++;
}
await mf.dispose();
console.log(`\nd719-history-write-order: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
