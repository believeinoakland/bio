/* CAP-13 — the reuse floor counts PAGES, not primary captures.
 *
 * `CAPTURE-SCALING.md` §Job one, reuse condition 3: stored bytes stand in for a
 * fetch only when at least two DOCUMENTS on the host have referenced the asset,
 * "because an asset only one page references is that page's own". The plane
 * counted `COUNT(DISTINCT primary_sha)` over `site_asset_refs` (`siteAssets`,
 * `siteChrome` in `store.mjs`), and `primary_sha` is the content hash of the
 * captured primary. So one page whose bytes changed between two captures was
 * two "documents": it met the floor ALONE, and every re-capture of a changed page
 * wrote an inflated "across N documents on this host" into the capture manifest
 * (content-addressed bytes nothing corrects).
 *
 * THE PAGE IDENTITY CHOSEN: the primary's DOCUMENT ADDRESS, i.e.
 * `captured_locators.address_norm` for `capture_sha = primary_sha`. It is the
 * identity the record already keys a document on (D-96/D-99: an archive capture
 * and a direct one of the same document land on the SAME locator row; a Drive
 * export files under the Drive link), and D-58 writes it for every capture. A
 * primary with NO locator row (a capture from before D-58, or one whose locator
 * write failed inside its swallowing `try`) cannot say which page it was, so it
 * is counted apart as `documents_undetermined` and never guessed into either
 * bucket: the floor is met only by determined pages, and a floor that the
 * undetermined remainder COULD meet is refused by its own name
 * (`shared_across_documents_undetermined`) rather than as "not yet shared".
 *
 * Everything asserted about reuse goes THROUGH THE OP (`op=acquire` with
 * `subresources: true`), reading the response the caller gets: which parts were
 * reused, the manifest's `not_reused` reasons, and `reused_seen_in_documents`.
 * The legacy fixture (arm C) seeds a ref row with no locator through the store
 * route, because no op can manufacture the pre-D-58 state; `siteChrome` (arm D)
 * is read through its store route because no op exposes it (`sitechrome` occurs
 * in no OPS row).
 *
 * HOW A LIAR PASSES A WEAKER CHECK, AND WHAT CLOSES IT: a BYTE-IDENTICAL
 * re-capture never moved the count (same primary sha, one ref row), so a suite
 * re-capturing unchanged bytes passes on the defect. Every re-capture here
 * CHANGES the page's bytes, and arm A asserts the primary shas differ before it
 * believes anything about the count. And a suite that only asserts "not reused"
 * passes if reuse is simply broken: arm B asserts two DIFFERENT pages DO reach
 * reuse, with N equal to the page count.
 *
 * NEGATIVE CONTROL: ARM 1, store.mjs `siteAssets` counts `COUNT(DISTINCT r.primary_sha)` again in place of
 * `COUNT(DISTINCT cl.address_norm)` -> "A3 one page captured twice with changed bytes is NOT reused on its third
 * capture" FAILS by name, with A4, B5 and C1-C7 (12 pass / 10 fail; A0-A2 and B1-B4 hold, as declared). ARM 2,
 * `siteChrome`'s host total counts primary shas again -> D1 and D5 fail (20/2). ARM 3, `reuseDecision` names the
 * undetermined remainder `not_yet_shared_across_documents` -> C5 alone fails (21/1). Each arm alone, restored by cp
 * from a per-arm pristine copy, verified by sha256 and cmp -> 22/22 pass. RUN 2026-09-23 CAP-13 worker.
 */
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
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const HOST = "cap13.oaklandca.gov";
const ORIGIN = `https://${HOST}`;
/* What the source serves. Pages are mutable so a re-capture can CHANGE them. */
const PAGES = new Map();
const STYLES = new Map([
  ["/one.css", ".one { color: red }"],
  ["/shared.css", ".shared { color: blue }"],
  ["/legacy.css", ".legacy { color: green }"],
]);
const FETCHED = [];
const page = (css, body) =>
  `<html><head><link rel="stylesheet" href="${css}"></head><body><p>${body}</p></body></html>`;

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-c13", MEMBER_TOKEN: "mem-c13", PROBE_TOKEN: "prb-c13", VERSION: "test",
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
const acquire = async (path) =>
  (await mf.dispatchFetch("http://x/api/?op=acquire&token=mem-c13",
    { method: "POST", body: JSON.stringify({ locator: ORIGIN + path, authority: "City of Oakland", subresources: true }) })).json();
const cssCount = (p) => FETCHED.filter((x) => x === p).length;
const partFor = (res, p) => (res.subresources || []).find((r) => new URL(r.url).pathname === p) || null;
const whyNot = (res, p) => ((res.snapshot && res.snapshot.reuse && res.snapshot.reuse.not_reused) || [])
  .filter((n) => new URL(n.url).pathname === p).map((n) => n.why);

const ns = await mf.getDurableObjectNamespace("STORE");
const stub = ns.get(ns.idFromName("bio"));
const store = async (path, body) => (await stub.fetch("http://x" + path, body
  ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : {})).json();

console.log("\n--- A: one page captured three times, its bytes changing each time ---");
{
  PAGES.set("/a.html", page("/one.css", "version one"));
  const c1 = await acquire("/a.html");
  PAGES.set("/a.html", page("/one.css", "version two"));
  const c2 = await acquire("/a.html");
  PAGES.set("/a.html", page("/one.css", "version three"));
  const before = cssCount("/one.css");
  const c3 = await acquire("/a.html");
  t("A0 every capture succeeded", [c1.ok, c2.ok, c3.ok], [true, true, true]);
  /* The liar's path closed: a byte-identical re-capture never moved the count. */
  t("A1 the three captures are three DIFFERENT primary shas (the bytes changed)",
    new Set([c1, c2, c3].map((c) => c.document.capture.sha256)).size, 3);
  t("A2 the second capture's stylesheet was fetched, not reused", partFor(c2, "/one.css")?.fetched_this_capture !== false, true);
  t("A3 one page captured twice with changed bytes is NOT reused on its third capture",
    partFor(c3, "/one.css")?.fetched_this_capture !== false && cssCount("/one.css") === before + 1, true);
  t("A4 and the manifest says why: the asset is not yet shared across documents",
    whyNot(c3, "/one.css"), ["not_yet_shared_across_documents"]);
}

console.log("\n--- B: two pages sharing a stylesheet, then a changed re-capture of one of them ---");
{
  PAGES.set("/b1.html", page("/shared.css", "b one"));
  PAGES.set("/b2.html", page("/shared.css", "b two"));
  PAGES.set("/b3.html", page("/shared.css", "b three"));
  await acquire("/b1.html");
  await acquire("/b2.html");
  const before = cssCount("/shared.css");
  const b3 = await acquire("/b3.html");
  const p3 = partFor(b3, "/shared.css");
  t("B1 two different pages make the stylesheet the SITE's: the third page reuses it",
    [p3?.fetched_this_capture, cssCount("/shared.css")], [false, before]);
  t("B2 and the manifest's N is the number of PAGES that referenced it", p3?.reused_seen_in_documents, 2);
  t("B3 the detail sentence says the same N", /across 2 documents on this host/.test(p3?.detail || ""), true);
  /* b1 changes twice. Counting captures, the fourth and fifth captures would
     read 4 and then 5; counting pages, both read 3 (b1, b2, b3). */
  PAGES.set("/b1.html", page("/shared.css", "b one, edited"));
  const b1v2 = await acquire("/b1.html");
  PAGES.set("/b1.html", page("/shared.css", "b one, edited again"));
  const b1v3 = await acquire("/b1.html");
  t("B4 a changed re-capture of a page still reuses the shared stylesheet",
    [partFor(b1v2, "/shared.css")?.fetched_this_capture, partFor(b1v3, "/shared.css")?.fetched_this_capture], [false, false]);
  t("B5 and N stays the PAGE count however often one page is re-captured with new bytes",
    [partFor(b1v2, "/shared.css")?.reused_seen_in_documents, partFor(b1v3, "/shared.css")?.reused_seen_in_documents], [3, 3]);
}

console.log("\n--- C: a legacy primary with no page on record is UNDETERMINED, never guessed ---");
{
  const L = ORIGIN + "/legacy.css";
  const LN = normalizeAddress(L);
  /* The pre-D-58 shape: a ref row whose primary has no captured_locators row.
     Seeded through the store because no op can manufacture it. Same bytes as
     the source serves, so nothing here reads as a change. */
  const orphan = "0c13".padEnd(64, "0");
  await store("/recordsiteassets", { host: HOST, primarySha: orphan, at: new Date().toISOString().split(".")[0] + "Z",
    observations: [{ address: L, address_norm: LN, sha256: sha(STYLES.get("/legacy.css")),
                     content_type: "text/css", bytes: STYLES.get("/legacy.css").length, kind: "stylesheet" }] });
  let k = (await store("/siteassets", { host: HOST, addresses: [LN] })).result.assets[LN];
  t("C1 a primary with no locator counts as NO page and ONE undetermined capture",
    [k.documents, k.documents_undetermined], [0, 1]);

  PAGES.set("/c1.html", page("/legacy.css", "c one"));
  const c1 = await acquire("/c1.html");
  t("C2 one located page plus nothing else: not yet shared", whyNot(c1, "/legacy.css"), ["not_yet_shared_across_documents"]);
  k = (await store("/siteassets", { host: HOST, addresses: [LN] })).result.assets[LN];
  t("C3 the located page counts, the orphan stays undetermined", [k.documents, k.documents_undetermined], [1, 1]);

  PAGES.set("/c2.html", page("/legacy.css", "c two"));
  const before = cssCount("/legacy.css");
  const c2 = await acquire("/c2.html");
  t("C4 one page and one undetermined capture do NOT meet the two-document floor: fetched",
    [partFor(c2, "/legacy.css")?.fetched_this_capture !== false, cssCount("/legacy.css")], [true, before + 1]);
  t("C5 and the refusal NAMES the undetermined remainder rather than calling it unshared",
    whyNot(c2, "/legacy.css"), ["shared_across_documents_undetermined"]);

  PAGES.set("/c3.html", page("/legacy.css", "c three"));
  const c3 = await acquire("/c3.html");
  const p = partFor(c3, "/legacy.css");
  t("C6 two DETERMINED pages meet the floor, and N counts only them",
    [p?.fetched_this_capture, p?.reused_seen_in_documents], [false, 2]);
  t("C7 the detail sentence states the undetermined capture instead of folding it in",
    /across 2 documents on this host/.test(p?.detail || "") && /1 earlier capture whose page the record does not name/.test(p?.detail || ""), true);
}

console.log("\n--- D: chrome by recurrence counts pages too (store route: no op exposes it) ---");
{
  const cr = (await store("/sitechrome?host=" + HOST)).result;
  /* Pages on record for this host: a, b1, b2, b3, c1, c2, c3 = 7, over 11
     primary captures (a x3, b1 x3, b2, b3, c1, c2, c3) and one orphan. */
  t("D1 the host's document count is its PAGES, not its captures", cr.documents, 7);
  t("D2 and the capture with no page on record is reported apart", cr.documents_undetermined, 1);
  const one = cr.assets.find((a) => a.address_norm === normalizeAddress(ORIGIN + "/one.css"));
  t("D3 one page's own stylesheet, captured three times, is ONE document", one?.documents, 1);
  t("D4 and is not the site's chrome", one?.chrome, false);
  const shared = cr.assets.find((a) => a.address_norm === normalizeAddress(ORIGIN + "/shared.css"));
  t("D5 the shared stylesheet is in three of seven pages", [shared?.documents, shared?.share], [3, 3 / 7]);
}

await mf.dispose();
console.log(`\n${pass} pass, ${fail} fail`);
if (pass === 0) { console.log("no assertion ran: the suite did not reach its body"); process.exit(1); }
process.exit(fail ? 1 : 0);
