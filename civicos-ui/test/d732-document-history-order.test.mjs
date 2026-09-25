/* NEGATIVE CONTROL: RUN 2026-09-25 (D-732 worker) by `node civicos-ui/test/d732-document-history-order.control.mjs`, each arm ALONE, restored from a per-arm pristine copy in the item's pen (controlPen, outside the worktree) and verified by sha256 AND byte compare (civicos-ui/app.html 1,634,539 B sha256 ea95888def39…); baseline 8 pass / 0 fail. REPRODUCED FIRST on land/worker/D-719 8ab99e48 (the defect): 2 pass / 6 fail — §1 both, §2, §3's two "said", §4.
   (key) THE ROW'S CONTROL: writeOrdered's write branch -> sorted by snap key again. DECLARED §1 both, §4 fail. RESULT 5/3 AS DECLARED — "§1 the promotions are listed in write order", "§1 the earlier revisions, kept, are listed in write order", "§4 seq as sparse integers…".
   (logkey) the promotions alone re-sorted by path. DECLARED §1 promotions, §4. RESULT 6/2 AS DECLARED.
   (revkey) the kept revisions alone re-sorted by key. DECLARED §1 revisions, §4. RESULT 6/2 AS DECLARED.
   (silent) the stratum's statement of order -> dropped. DECLARED §2, §3 said ×2, §4. RESULT 4/4 AS DECLARED.
   (compare) OVER-STRICTNESS: the rank comparator -> a three-way compare. DECLARED nothing. RESULT 8/0 AS DECLARED. */
/* =========================================================================
 * D-732 — THE DOCUMENT PAGE'S RECORD STRATUM READS IN WRITE ORDER, AND SAYS
 * WHICH ORDER IT SHOWS.
 * State Rules & Consistency v1.5 §6, I-20 as D-674 and D-700 amended it: the
 * record's order is WRITE order, never the caller-chosen snap key, whose
 * lexical order is not a clock. D-700 put each entry's write-order rank on the
 * image as `seq` in `_history/manifest.json`; D-719 made the setup page's
 * bundle view follow it. This is the same class on the member surface.
 *
 * THE DEFECT: civicos-ui/app.html's document page, stratum 4 ("Everything that
 * has ever happened to this …"), listed the promotions (parseLog, over
 * `_history/promotion_<key>.json`) by path and "Earlier revisions, kept"
 * (`_history/bundle_<key>.md`) by key — an order the record does not hold,
 * under a heading that claims the whole history.
 *
 * D-732: both lists follow `seq` when EVERY manifest entry carries a distinct
 * integer one (historyOrder, the gate's historyWriteOrder predicate) AND every
 * listed item's key is a manifest entry; else they are listed by key as before.
 * Either way the stratum states which order it shows.
 *
 * DRIVEN THROUGH THE OP: the fixture is written by op=promote on the real plane
 * (bio-plane/src/index.mjs under miniflare), and the page's own openBundle reads
 * it back through op=image over a fetch bridged to that plane. A doctored image
 * (§3, §4) is served by intercepting op=image only.
 *   §1 a bundle whose keys run against write order lists its promotions AND its
 *      kept revisions in write order.
 *   §2 the page says it shows the order written.
 *   §3 an image without seq (or with seq on only some entries) lists by key,
 *      as before, and SAYS that is not the order written.
 *   §4 OVER-STRICTNESS: sparse integer seq still orders by write.
 *
 * HOW A LIAR PASSES, and which arm catches it:
 *   (1) either list sorted by key again — §1 by name (the row's control).
 *   (2) no statement of order — §2, §3.
 *   (3) a fixture whose keys run WITH write order — the FIXTURE assertion.
 *
 * WHAT THIS SUITE CANNOT SEE: that a browser paints what the stub's innerHTML
 * holds (the reach of every civicos-ui suite).
 *
 * NEGATIVE CONTROL: the line at the head of this file.
 * ========================================================================= */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: shared, for its side effect. */
import fs from "fs";
import vm from "vm";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { webcrypto, createHash } from "crypto";
import { appScript } from "./extract.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try { ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch (e) {
  console.error("d732-document-history-order: miniflare is not installed — run `npm ci` in bio-plane/.");
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const ADM = "adm-d732";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname, script: fs.readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-d732", VERSION: "test", TASK_DRAIN_DELAY_MS: "600000",
              INSTANCE_NAME: "fixture-group" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}&token=${ADM}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}&token=${ADM}`)).json());
const must = (label, r) => { if (!r || r.ok === false) throw new Error(`${label}: ${JSON.stringify(r).slice(0, 900)}`); return r; };

const md = (id, updated, summary) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "A source"`, "current_state: collected", "prior_state: null",
  "created: 2026-07-24T00:00:00Z", `last_updated: ${updated}`,
  "produced_by:", "  mode: human", "group: fixture-group", "references: []", "state_history: []",
  "annotations_open: 0", "visuals: []", "criticality: supporting", "---", "",
  "## Summary", "", summary, ""].join("\n");
const shaOf = async (id) => ((await GET(`op=list&limit=1000`)) || {}).bundles?.find((b) => b.bundle_id === id)?.bundle_sha ?? null;
const promote = async (id, body, { snapKey, updated, author, base }) => POST("op=promote", {
  bundleId: id, base: base === undefined ? await shaOf(id) : base, snapKey, author,
  meta: { object_type: "information", group: "fixture-group", title: "A source",
          current_state: "collected", created: "2026-07-24T00:00:00Z", last_updated: updated },
  files: [{ path: "bundle.md", text: body, bytes: Buffer.byteLength(body), sha256: sha(body) }], register: [] });
const manifestOf = (img) => JSON.parse(img?.["_history/manifest.json"] ?? '{"entries":[]}').entries ?? [];
const strip = (img, f) => ({ ...img, "_history/manifest.json": JSON.stringify({ entries: manifestOf(img).map(f) }, null, 2) });

/* THE SURFACE, its fetch bridged to the plane; op=image may be answered with a doctored image. */
const els = new Map();
function el(){
  const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
    value:"", _html:"", textContent:"", scrollTop:0, disabled:false, offsetHeight:120, addEventListener(){},
    querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(p,h){ e._html += h; }, focus(){}, click(){},
    remove(){}, setAttribute(){}, getAttribute(){ return null; } };
  Object.defineProperty(e, "innerHTML", { get(){ return e._html; }, set(v){ e._html = v; } });
  return e;
}
const $$ = (s) => { if (!els.has(s)) els.set(s, el()); return els.get(s); };
let IMAGE_OVERRIDE = null;
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto: webcrypto, Blob: class{}, IntersectionObserver: undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1;}, requestAnimationFrame:fn=>fn(),
  matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){},
    documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
    createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){}, replaceState(){} },
  localStorage:{ getItem:()=>null, setItem(){}, removeItem(){} },
  sessionStorage:{ getItem:()=>null, setItem(){}, removeItem(){} },
  window:{ addEventListener(){}, open:()=>null },
  fetch: async (u, opts) => {
    const url = new URL(u, "http://x");
    if (IMAGE_OVERRIDE && url.searchParams.get("op") === "image")
      return new Response(JSON.stringify({ ok: true, result: IMAGE_OVERRIDE }), { status: 200 });
    return mf.dispatchFetch(url.toString(), opts);
  } };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() + ";globalThis.__U = { PLANE, openBundle };", ctx);
const U = ctx.__U;
U.PLANE.token = ADM;

/* Stratum 4 as rendered, its promotions in the order shown (each by the sha256 of the bundle.md it wrote, which its
   raw entry carries — the plane stamps the author itself, so the author cannot tell them apart), its kept revisions in
   the order shown (by key), and the statement of order. */
const s4Of = (html) => (/id="s4"[\s\S]*$/.exec(html) || [""])[0];
const shown = (html, needles) => needles.map((n) => [n, html.indexOf(n)]).filter(([, i]) => i >= 0)
  .sort((a, b) => a[1] - b[1]).map(([n]) => n);
const unent = (x) => x.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
/* Each log entry's raw record, parsed, and the sha of the bundle.md IT wrote — never a substring search, because an
   entry's `base` can equal the previous promotion's bundle.md sha. An entry that does not parse reads as null. */
const promotionsShown = (s4) => [...(s4.split("Earlier revisions, kept")[0] || "").matchAll(/<div class="log-entry">[\s\S]*?<pre>([\s\S]*?)<\/pre>/g)]
  .map((m) => { try { return (JSON.parse(unent(m[1])).files || []).find((f) => f.name === "bundle.md")?.sha256 ?? null; } catch { return null; } });
const revisionsShown = (s4, keys) => shown((s4.split("Earlier revisions, kept")[1] || ""), keys.map((k) => `>${k}<`))
  .map((n) => n.slice(1, -1));
const WRITE_SAID = /in the order (they were )?written/i;
const KEY_SAID = /not (necessarily )?the order (they were )?written/i;
const render = async (id, img) => { IMAGE_OVERRIDE = img; els.delete("#content"); await U.openBundle(id); IMAGE_OVERRIDE = null;
  return s4Of($$("#content")._html); };

try {
/* ======================= the ground: keys chosen against write order */
const ID = "INFO-2026-7320-order";
const W = ["20260724T010000Z_d7320001", "20260724T040000Z_d7320002", "20260724T030000Z_d7320003", "20260724T020000Z_d7320004"]
  .map((key, i) => ({ key, body: md(ID, `2026-07-24T0${i + 1}:00:00Z`, `Revision ${i + 1}.`) }));
for (const w of W) w.sha = sha(w.body);
for (const [i, w] of W.entries()) {
  const up = `2026-07-24T0${i + 1}:00:00Z`;
  must(`promotion ${i + 1}`, await promote(ID, w.body,
    { snapKey: w.key, updated: up, author: "ruth", ...(i === 0 ? { base: null } : {}) }));
}
const img = await GET(`op=image&id=${encodeURIComponent(ID)}`);
const man = manifestOf(img);
const WRITTEN_KEYS = W.map((w) => w.key), SHAS = W.map((w) => w.sha);
const REV_KEYS = Object.keys(img).filter((k) => /^_history\/bundle_.*\.md$/.test(k)).map((k) => k.slice(16, -3));
const REV_WRITTEN = WRITTEN_KEYS.filter((k) => REV_KEYS.includes(k));
console.log(`  corpus: ${ID}, written ${WRITTEN_KEYS.join(" -> ")}; revisions kept ${REV_WRITTEN.join(" , ")}`);
t("FIXTURE: four promotions carrying seq, snap-key order is NOT write order, and ≥3 kept revisions out of key order",
  [man.length, man.every((e) => Number.isSafeInteger(e.seq)), [...WRITTEN_KEYS].sort().join() !== WRITTEN_KEYS.join(),
   REV_WRITTEN.length >= 3, [...REV_WRITTEN].sort().join() !== REV_WRITTEN.join()], [4, true, true, true, true]);

/* ======================= §1 write order, both lists */
const s4 = await render(ID, null);
t("§1 the promotions are listed in write order", promotionsShown(s4), SHAS);
t("§1 the earlier revisions, kept, are listed in write order", revisionsShown(s4, REV_WRITTEN), REV_WRITTEN);

/* ======================= §2 the page states the order it shows */
t("§2 the record stratum says it lists in the order written", [WRITE_SAID.test(s4), KEY_SAID.test(s4)], [true, false]);

/* ======================= §3 no write order on the image: key order, said */
const bySortedKey = [...WRITTEN_KEYS].sort(), shasByKey = bySortedKey.map((k) => W.find((w) => w.key === k).sha);
const old = await render(ID, strip(img, ({ seq, ...e }) => e));
t("§3 an image without seq lists both by snap key, as before",
  [promotionsShown(old), revisionsShown(old, REV_WRITTEN)], [shasByKey, [...REV_WRITTEN].sort()]);
t("§3 and says that is not the order written", KEY_SAID.test(old), true);
const partial = await render(ID, strip(img, (e) => (e.key === W[2].key ? (({ seq, ...r }) => r)(e) : e)));
t("§3 seq on only some entries is not a write order: key order, said",
  [promotionsShown(partial), revisionsShown(partial, REV_WRITTEN), KEY_SAID.test(partial)],
  [shasByKey, [...REV_WRITTEN].sort(), true]);

/* ======================= §4 OVER-STRICTNESS */
const sparse = await render(ID, strip(img, (e) => ({ ...e, seq: e.seq * 1000 + 7 })));
t("§4 seq as sparse integers still orders both lists by write",
  [promotionsShown(sparse), revisionsShown(sparse, REV_WRITTEN), WRITE_SAID.test(sparse)], [SHAS, REV_WRITTEN, true]);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack : e}`);
  fail++;
}
await mf.dispose();
console.log(`\nd732-document-history-order: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
