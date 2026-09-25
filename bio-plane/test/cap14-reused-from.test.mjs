/* CAP-14 — a reused part names the capture whose fetch served it.
 *
 * `CAPTURE-SCALING.md` §Job one, RULED 2026-09-21 by BOB #21: the intake contract's
 * provenance names who retrieved a document's bytes (`BIO_Intake_Doctrine_v1_1.md`
 * §2), and a reused part's bytes were retrieved by an EARLIER capture, so that
 * capture is the part's provenance. The build: `site_assets.last_fetched_by`, the
 * primary capture sha whose fetch set `last_fetched`, written on every FETCHED
 * observation and never moved by a reuse; each reused part carries it as
 * `reused_from` in the manifest; the reusing capture's `site_asset_refs` row keeps
 * it, taken from the observation itself; `reusedParts` reads that row, never
 * `site_assets`. A reuse recorded before the build is UNDETERMINED as to its
 * source (`reused_from: null`), never inferred from timestamps.
 *
 * Everything asserted about reuse goes THROUGH THE OPS: `op=acquire` with
 * `subresources: true` makes every capture, and `op=promote` files the reusing
 * capture in a bundle so `reusedParts` (the store read ratification's re-fetch
 * consumes, reached through its store route as reuse-ratify.test.mjs does) can be
 * asked about it. The pre-build fixture (arm C) is seeded through the store route,
 * because no op can manufacture a reuse row older than the column.
 *
 * HOW A LIAR PASSES A WEAKER CHECK, AND WHAT CLOSES IT: `reusedParts` reading
 * `site_assets.last_fetched_by` at report time answers correctly until something
 * fetches the address again. So arm B FETCHES AGAIN after the reuse (a page that
 * embeds the same address as an image, which is always fetched), asserts that
 * `site_assets` moved to the new capture, and only then asserts the earlier reuse
 * still names the OLD one — in the manifest the caller already holds and in the
 * store's read. And a suite asserting only "reused_from is non-null" passes a
 * plane that names the reusing capture itself: A2 asserts it names the FETCHING
 * capture, which is a different sha.
 *
 * NEGATIVE CONTROL: ARM 1, the row's own control — store.mjs `reusedParts` reads `sa.last_fetched_by AS reused_from`
 * (site_assets at report time) in place of `ar.reused_from` -> "B2 the earlier reuse still names the capture whose fetch
 * served IT, not the later fetcher" FAILS by name, with C2 and C3 (20 pass / 3 fail; A6 holds, because until the later
 * fetch site_assets agrees, which is exactly how the liar passes a weaker suite). ARM 2, a reuse moves
 * `last_fetched_by` in `recordSiteAssets` -> A4 and B5 fail (21/2). ARM 3, the two ADDITIVE_COLUMNS entries removed ->
 * D3, D4, D5 fail (20/3); its first run ended the module on a TypeError with no tally, so D4/D5's reads were made to
 * fail by name. OVER-STRICTNESS ARM, `reused_from_state` spelled as a membership test instead of truthiness -> 23/23.
 * BASELINE, the three src files at origin/main 91bcea6b -> 7 pass / 16 fail (A2-A4, A6, B1-B5, C2, C3, D1-D5). Each arm
 * alone, restored by cp from a per-arm pristine copy, verified by sha256 and cmp -> 23/23. RUN 2026-09-23 CAP-14 worker.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { normalizeAddress } from "../src/subresources.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const sha = (s) => createHash("sha256").update(Buffer.from(s)).digest("hex");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};

const HOST = "cap14.oaklandca.gov";
const ORIGIN = `https://${HOST}`;
const PAGES = new Map();
const STYLES = new Map([["/s.css", ".s { color: red }"], ["/old.css", ".old { color: green }"]]);
const FETCHED = [];
const page = (css, body) =>
  `<html><head><link rel="stylesheet" href="${css}"></head><body><p>${body}</p></body></html>`;

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-c14", MEMBER_TOKEN: "mem-c14", PROBE_TOKEN: "prb-c14", VERSION: "test",
              /* D-95: pacing has its own suite. */
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    FETCHED.push(u.pathname);
    if (u.hostname !== HOST) return new Response("off-limits", { status: 500 });
    if (PAGES.has(u.pathname)) return new Response(PAGES.get(u.pathname), { headers: { "content-type": "text/html" } });
    if (STYLES.has(u.pathname)) return new Response(STYLES.get(u.pathname), { headers: { "content-type": "text/css" } });
    return new Response("nope", { status: 404 });
  },
});
const POST = async (q, body) => (await mf.dispatchFetch("http://x/api/?" + q,
  { method: "POST", body: JSON.stringify(body) })).json();
const acquire = (path) => POST("op=acquire&token=mem-c14",
  { locator: ORIGIN + path, authority: "City of Oakland", subresources: true });
const capOf = (res) => res.document && res.document.capture && res.document.capture.sha256;
const partFor = (res, p) => (res.subresources || []).find((r) => new URL(r.url).pathname === p) || null;
const cssCount = (p) => FETCHED.filter((x) => x === p).length;

const ns = await mf.getDurableObjectNamespace("STORE");
const stub = ns.get(ns.idFromName("bio"));
const store = async (path, body) => (await stub.fetch("http://x" + path, body
  ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : {})).json();
const S = normalizeAddress(ORIGIN + "/s.css");
const asset = async (norm) => (await store("/siteassets", { host: HOST, addresses: [norm] })).result.assets[norm];

/* File a capture in a bundle through op=promote, so reusedParts can be asked
   which of ITS parts were reused. The register is the trust root reusedParts
   joins on, keyed on the capture's sha. */
const NOW = "2026-09-23T00:00:00Z";
const mkMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "CAP-14 reuse"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting",
  "source_status: unchanged", "source:",
  "  locator: in hand", "  authority: test", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", `${id}`, "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
const fileBundle = async (id, capSha, bytes) => {
  const md = mkMd(id);
  const c = await POST("op=promote&token=mem-c14", {
    bundleId: id, base: null, snapKey: `20260923T100000Z_${id.slice(-8)}`, author: "claude",
    meta: { object_type: "information", group: "believe-in-oakland", title: "CAP-14 reuse",
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
            { path: "snapshots/page.html", blobSha: capSha, bytes, sha256: capSha }],
    register: [{ sha256: capSha, path: "snapshots/page.html", encoding: "binary", bytes }],
  });
  return c;
};
const partsOf = async (id) => (await store(`/reusedparts?id=${id}`)).result.parts;

let P2 = null, P3 = null, p3res = null, B1 = null;
console.log("\n--- A: a reused part names the capture whose FETCH served it ---");
{
  PAGES.set("/p1.html", page("/s.css", "one"));
  PAGES.set("/p2.html", page("/s.css", "two"));
  PAGES.set("/p3.html", page("/s.css", "three"));
  const r1 = await acquire("/p1.html");
  const r2 = await acquire("/p2.html");
  const before = cssCount("/s.css");
  p3res = await acquire("/p3.html");
  P2 = capOf(r2); P3 = capOf(p3res);
  const p = partFor(p3res, "/s.css");
  t("A0 three captures, three distinct primary shas", new Set([capOf(r1), P2, P3].filter(Boolean)).size, 3);
  t("A1 the third page REUSED the stylesheet (no request made)", [p?.fetched_this_capture, cssCount("/s.css")], [false, before]);
  t("A2 its manifest part names the capture whose fetch served it: the SECOND page's capture, not its own",
    [p?.reused_from, p?.reused_from === P3], [P2, false]);
  t("A3 the detail sentence names that capture", (p?.detail || "").includes(`by capture ${P2}`), true);
  t("A4 site_assets records the fetching capture beside last_fetched", (await asset(S))?.last_fetched_by, P2);
  const bytes = PAGES.get("/p3.html").length;
  B1 = "INF-2026-09-23-C14A";
  const c = await fileBundle(B1, P3, bytes);
  t("A5 the reusing capture is filed in a bundle", c.result && c.result.ok, true);
  const parts = await partsOf(B1);
  t("A6 reusedParts names the same fetching capture the manifest does, and calls it recorded",
    parts.map((x) => [x.address_norm, x.primary_sha, x.reused_from, x.reused_from_state]),
    [[S, P3, P2, "recorded"]]);
}

console.log("\n--- B: a LATER fetch moves site_assets, and the earlier reuse still names the OLD capture ---");
{
  /* The address fetched again: embedded as an image, a kind that is ALWAYS
     fetched (REUSABLE_KINDS), so this capture's observation is a FETCH of the
     same address and moves last_fetched_by. */
  PAGES.set("/p4.html", `<html><body><img src="/s.css"><p>four</p></body></html>`);
  const before = cssCount("/s.css");
  const r4 = await acquire("/p4.html");
  const P4 = capOf(r4);
  t("B0 the fourth capture FETCHED the address", cssCount("/s.css"), before + 1);
  t("B1 site_assets now names the fourth capture as the last fetcher (the liar's source moved)",
    (await asset(S))?.last_fetched_by, P4);
  const parts = await partsOf(B1);
  t("B2 the earlier reuse still names the capture whose fetch served IT, not the later fetcher",
    parts.map((x) => x.reused_from), [P2]);
  t("B3 and the manifest the caller already holds says the same", partFor(p3res, "/s.css")?.reused_from, P2);
  /* A reuse after the new fetch names the new fetcher: the value tracks the
     fetch, and a reuse never moves it. */
  PAGES.set("/p5.html", page("/s.css", "five"));
  const r5 = await acquire("/p5.html");
  t("B4 a reuse AFTER the new fetch names the new fetcher", partFor(r5, "/s.css")?.reused_from, P4);
  t("B5 and that reuse did not move site_assets' fetcher", (await asset(S))?.last_fetched_by, P4);
}

console.log("\n--- C: a reuse recorded before the build is UNDETERMINED as to its source ---");
{
  const O = ORIGIN + "/old.css";
  const ON = normalizeAddress(O);
  const osha = sha(STYLES.get("/old.css"));
  /* The pre-build shape: a fetch and a reuse whose observations carry no
     reused_from, the way every observation was written before CAP-14. Seeded
     through the store because no op can manufacture a row older than the
     column. The reuse's `at` equals the fetch's second EXACTLY — the coincidence
     a timestamp match would read as attribution. */
  const fetcher = "c14f".padEnd(64, "0");
  const at = "2026-09-01T00:00:00Z";
  await store("/recordsiteassets", { host: HOST, primarySha: fetcher, at,
    observations: [{ address: O, address_norm: ON, sha256: osha, content_type: "text/css", bytes: 20, kind: "stylesheet" }] });
  const capBytes = "<html><body>legacy</body></html>";
  const legacy = sha(capBytes);
  const put = await (await mf.dispatchFetch(`http://x/api/?op=capture&token=mem-c14&sha256=${legacy}`,
    { method: "PUT", body: capBytes })).json();
  t("C0 the legacy capture's bytes land", put.ok, true);
  await store("/recordsiteassets", { host: HOST, primarySha: legacy, at,
    observations: [{ address: O, address_norm: ON, sha256: osha, reused: true }] });
  const B2 = "INF-2026-09-23-C14B";
  const c = await fileBundle(B2, legacy, capBytes.length);
  t("C1 the legacy capture is filed in a bundle", c.result && c.result.ok, true);
  const parts = await partsOf(B2);
  t("C2 a reuse whose observation named no source reads NULL and UNDETERMINED, never matched by timestamp",
    parts.map((x) => [x.address_norm, x.reused_from, x.reused_from_state]), [[ON, null, "undetermined"]]);
  /* An observation's reused_from that is not a capture sha is not kept. */
  await store("/recordsiteassets", { host: HOST, primarySha: legacy, at,
    observations: [{ address: O, address_norm: ON, sha256: osha, reused: true, reused_from: "the day before" }] });
  t("C3 a reused_from that is not a capture sha is refused into NULL, not stored",
    (await partsOf(B2)).map((x) => x.reused_from_state), ["undetermined"]);
}

await mf.dispose();

console.log("\n--- D: THE MIGRATION — a store whose tables predate the columns boots, gains them, and reads UNDETERMINED ---");
{
  /* A store built before CAP-14 is simulated by DROPPING the two columns from a
     live store (the rows keep everything else, exactly as an old row did) and
     re-booting on the same storage: #migrate's additive pass must put both back,
     NULL, without bricking the Durable Object, and the old reuse must read
     UNDETERMINED. The probe subclass adds one raw-SQL route; nothing else moves. */
  const PROBE = `
import worker from "./index.mjs";
import { Store } from "./store.mjs";
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
export default worker;
`;
  const opts = (version) => ({
    modules: true, script: PROBE, modulesRoot: "/",
    scriptPath: fileURLToPath(new URL("../src/cap14-migrate-probe.mjs", import.meta.url)),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "ProbeStore", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: "adm-c14", MEMBER_TOKEN: "mem-c14", PROBE_TOKEN: "prb-c14", VERSION: version,
                GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  });
  const mf2 = new Miniflare(opts("test"));
  const asJson = async (res) => { const txt = await res.text();
    try { return JSON.parse(txt); } catch { return { ok: false, error: `non-JSON ${res.status}: ${txt.slice(0, 160)}` }; } };
  const st = async (path, body) => {
    const ns2 = await mf2.getDurableObjectNamespace("STORE");
    return asJson(await ns2.get(ns2.idFromName("bio")).fetch("http://x" + path, body
      ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : {}));
  };
  const cols = async (table) => ((await st("/rawsql", { sql: `PRAGMA table_info(${table})` })).rows || []).map((r) => r.name);
  const M = ORIGIN + "/mig.css", MN = normalizeAddress(M), msha = sha(".mig{}");
  const F = "c14d".padEnd(64, "1");
  await st("/recordsiteassets", { host: HOST, primarySha: F, at: "2026-09-02T00:00:00Z",
    observations: [{ address: M, address_norm: MN, sha256: msha, content_type: "text/css", bytes: 6, kind: "stylesheet" }] });
  const capBytes = "<html><body>migrated</body></html>";
  const R = sha(capBytes);
  await (await mf2.dispatchFetch(`http://x/api/?op=capture&token=mem-c14&sha256=${R}`, { method: "PUT", body: capBytes })).json();
  await st("/recordsiteassets", { host: HOST, primarySha: R, at: "2026-09-02T00:00:01Z",
    observations: [{ address: M, address_norm: MN, sha256: msha, reused: true, reused_from: F }] });
  const md = mkMd("INF-2026-09-23-C14D");
  const prom = await asJson(await mf2.dispatchFetch("http://x/api/?op=promote&token=mem-c14", { method: "POST", body: JSON.stringify({
    bundleId: "INF-2026-09-23-C14D", base: null, snapKey: "20260923T110000Z_c14dmig0", author: "claude",
    meta: { object_type: "information", group: "believe-in-oakland", title: "CAP-14 reuse",
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
            { path: "snapshots/page.html", blobSha: R, bytes: capBytes.length, sha256: R }],
    register: [{ sha256: R, path: "snapshots/page.html", encoding: "binary", bytes: capBytes.length }] }) }));
  t("D0 the reusing capture is filed in a bundle", prom.result && prom.result.ok, true);
  t("D1 on the current shape the reuse is recorded against its fetcher",
    (((await st("/reusedparts?id=INF-2026-09-23-C14D")).result || {}).parts || []).map((x) => [x.reused_from, x.reused_from_state]),
    [[F, "recorded"]]);
  const d1 = await st("/rawsql", { sql: "ALTER TABLE site_asset_refs DROP COLUMN reused_from" });
  const d2 = await st("/rawsql", { sql: "ALTER TABLE site_assets DROP COLUMN last_fetched_by" });
  t("D2 ARMED: the pre-build shape is made — both columns dropped, rows kept",
    [d1.ok, d2.ok, (await cols("site_asset_refs")).includes("reused_from"), (await cols("site_assets")).includes("last_fetched_by")],
    [true, true, false, false]);
  await mf2.setOptions(opts("test-reboot"));   /* same storage, a fresh boot through #migrate */
  t("D3 after the boot both columns exist again (the additive pass ran, the object answers)",
    [(await cols("site_asset_refs")).includes("reused_from"), (await cols("site_assets")).includes("last_fetched_by")],
    [true, true]);
  t("D4 the pre-build reuse reads NULL and UNDETERMINED — never back-filled from site_assets or a timestamp",
    (((await st("/reusedparts?id=INF-2026-09-23-C14D")).result || {}).parts || []).map((x) => [x.address_norm, x.reused_from, x.reused_from_state]),
    [[MN, null, "undetermined"]]);
  t("D5 and site_assets' fetcher is NULL too, not guessed",
    await (async () => { const k = (((await st("/siteassets", { host: HOST, addresses: [MN] })).result || {}).assets || {})[MN];
      return k ? k.last_fetched_by : "no answer"; })(), null);
  await mf2.dispose();
}

console.log(`\n${pass} pass, ${fail} fail`);
if (pass === 0) { console.log("no assertion ran: the suite did not reach its body"); process.exit(1); }
process.exit(fail ? 1 : 0);
