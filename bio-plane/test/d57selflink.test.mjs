/* D-57 — resolveLinks must not tell a member that a SELF-LINKED page's target CHANGED.
 *
 * A page that links to itself (every paginated Legistar calendar does) finds its
 * OWN capture among the captures of its link's target, retrieved at exactly the
 * source's retrieval instant. That one capture is both the last at-or-before the
 * retrieval and the first at-or-after it, so the two-sided arm of `resolveLinks`
 * read it as a BRACKET and said "the target changed somewhere between the
 * captures bracketing this document's retrieval", naming ONE hash twice. The UI
 * renders the plane's basis and detail verbatim (`civicos-ui/app.html` linkRow),
 * so that sentence reached a member as a fact about the source.
 *
 * What this suite holds, THROUGH THE OP (`op=acquire` files the page and its
 * links exactly as a real capture does; `op=links&capture=` is what the UI reads):
 *
 *   1. the self-link reads a SELF-REFERENCE basis — no "changed" sentence, no
 *      doubled hash — and its VERDICT is still one of the three (a fourth
 *      basis, never a fourth verdict);
 *   2. HOW A LIAR PASSES: drop the self-link from the answer. So the self-link
 *      is asserted still LISTED and still COUNTED in the tally and the verdicts;
 *   3. one step wider: a NON-self target with ONE capture made at the source's
 *      retrieval instant is one capture on both sides, and never reads "changed";
 *   4. the over-strictness arm: a GENUINE two-capture bracket (different bytes
 *      before and after) still reads "changed", naming two different hashes.
 *
 * NEGATIVE CONTROL: (run 2026-09-23, D-57 worker) two arms on bio-plane/src/store.mjs resolveLinks, each ALONE,
 * restored by cp from a pristine copy and verified by sha256 (6d932ec1...) AND cmp, 2,858,269 bytes. (a) the
 * self-reference TEST removed (`selfCap` forced null, so the self-link falls through to the one-capture arm) ->
 * 22 pass 2 fail, by name: "the self-link states a SELF-REFERENCE basis" and "and its detail names the
 * self-reference"; the "changed" assertions stay green because the one-capture guard still stands, which is why
 * arm (b) exists. (b) the whole D-57 test removed (`selfCap` null AND `oneCapture` false, i.e. the pre-fix
 * resolveLinks) -> 17 pass 7 fail: the self-link arm FAILS BY NAME AT THE "changed" SENTENCE ("the self-link does
 * NOT say the target changed"), with "no hash is printed twice" and both self-reference assertions, and the
 * one-capture arm's own "it does NOT say the target changed", "it says it holds one capture" and "and names that
 * hash once". The listed-and-counted assertions and the genuine-bracket (over-strictness) assertions stayed GREEN
 * in both arms, as declared.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { normalizeAddress } from "../src/subresources.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const HOST = "www.oaklandca.gov";
const CAL = `https://${HOST}/calendar.html`;
const B_URL = `https://${HOST}/churned.html`;
const C_URL = `https://${HOST}/sameinstant.html`;
const PAGE = `<!doctype html><html><head><title>Calendar</title></head><body>
<h1>Meetings</h1>
<a href="/calendar.html">This month</a>
<a href="/churned.html">A page that changed</a>
<a href="/sameinstant.html">A page captured at the same instant</a>
</body></html>`;

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d57", MEMBER_TOKEN: "mem-d57", PROBE_TOKEN: "prb-d57", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    if (u.hostname !== HOST) return new Response("off-limits", { status: 500 });
    if (u.pathname === "/calendar.html") return new Response(PAGE, { headers: { "content-type": "text/html" } });
    return new Response("nope", { status: 404 });
  },
});

console.log("\n--- a self-linking page, captured through op=acquire ---");
const acq = await (await mf.dispatchFetch("http://x/api/?op=acquire&token=mem-d57",
  { method: "POST", body: JSON.stringify({ locator: CAL, authority: "City of Oakland", subresources: true }) })).json();
t("the page is acquired", acq.ok, true);
const SHA = acq.document && acq.document.capture && acq.document.capture.sha256;
t("and names its capture", /^[0-9a-f]{64}$/.test(SHA || ""), true);

/* The same store the op wrote, reached directly only to SEED the two other
   targets' captures at dates relative to the page's own retrieval instant. */
const ns = await mf.getDurableObjectNamespace("STORE");
const st = ns.get(ns.idFromName("bio"));
const call = async (path, body) => (await st.fetch("http://x" + path, body
  ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : {})).json();

const first = await (await mf.dispatchFetch(`http://x/api/?op=links&token=mem-d57&capture=${SHA}`)).json();
t("op=links answers for the capture", first.ok, true);
const T = first.at;
t("and states the retrieval instant the verdicts are judged against", typeof T === "string" && !!Date.parse(T), true);

/* A GENUINE bracket: different bytes captured before and after the page's retrieval. */
const B1 = "b1".repeat(32), B2 = "b2".repeat(32), C1 = "c1".repeat(32);
await call("/recordcapturedlocator", { address: B_URL, addressNorm: normalizeAddress(B_URL), captureSha: B1,
  retrieved: "2020-01-01T00:00:00Z" });
await call("/recordcapturedlocator", { address: B_URL, addressNorm: normalizeAddress(B_URL), captureSha: B2,
  retrieved: "2099-01-01T00:00:00Z" });
/* One step wider: a DIFFERENT page captured once, at exactly the page's retrieval instant. */
await call("/recordcapturedlocator", { address: C_URL, addressNorm: normalizeAddress(C_URL), captureSha: C1,
  retrieved: T });

const res = await (await mf.dispatchFetch(`http://x/api/?op=links&token=mem-d57&capture=${SHA}`)).json();
t("op=links resolves through the surface the UI reads", res.ok, true);
const deferred = (res.links || []).filter((l) => l.resolution !== "anchor" && l.resolution !== "intra");
const by = Object.fromEntries(deferred.map((l) => [l.address_norm, l]));
const self = by[normalizeAddress(CAL)], churned = by[normalizeAddress(B_URL)], same = by[normalizeAddress(C_URL)];
console.log(`  (corpus: ${(res.links || []).length} links; tally ${JSON.stringify(res.tally)}; verdicts ${JSON.stringify(res.verdicts)})`);

console.log("\n--- the self-link is still LISTED and COUNTED (how a liar passes) ---");
t("the self-link is in the answer", !!self, true);
t("resolved against the record, not dropped as offsite", self && self.resolution, "linked");
t("its target is this very capture", self && self.target_capture, SHA);
t("the tally counts all three held targets, the self-link among them", res.tally && res.tally.linked, 3);
t("and the verdicts account for every one of them",
  res.verdicts && (res.verdicts.contemporaneous + res.verdicts.superseded + res.verdicts.undetermined), 3);

console.log("\n--- the self-link's basis is a SELF-REFERENCE, never a change ---");
const selfText = self ? `${self.basis || ""} ${self.detail || ""}` : "";
t("the self-link does NOT say the target changed", /\bchanged\b/.test(selfText), false);
t("the self-link states a SELF-REFERENCE basis", /points at the document itself/.test(self && self.basis || ""), true);
t("and its detail names the self-reference", /^self-reference: /.test(self && self.detail || ""), true);
t("no hash is printed twice", (selfText.match(new RegExp(SHA.slice(0, 12), "g")) || []).length <= 1, true);
t("the verdict is one of the three, never a fourth",
  ["contemporaneous", "superseded", "undetermined"].includes(self && self.verdict), true);
t("and on one observation it is the resting state, undetermined", self && self.verdict, "undetermined");

console.log("\n--- one step wider: ONE capture at the retrieval instant is not a bracket ---");
const sameText = same ? `${same.basis || ""} ${same.detail || ""}` : "";
t("the same-instant target is listed and linked", same && same.resolution, "linked");
t("it does NOT say the target changed", /\bchanged\b/.test(sameText), false);
t("it says it holds one capture", /one capture/.test(same && same.basis || ""), true);
t("and names that hash once", (sameText.match(/c1c1c1c1c1c1/g) || []).length, 1);
t("undetermined, not assumed either way", same && same.verdict, "undetermined");

console.log("\n--- over-strictness: a GENUINE two-capture bracket still reads CHANGED ---");
t("the churned target is undetermined", churned && churned.verdict, "undetermined");
t("and says the target changed between the bracketing captures",
  /the target changed somewhere between the captures bracketing/.test(churned && churned.basis || ""), true);
t("naming two DIFFERENT hashes",
  [/b1b1b1b1b1b1/.test(churned && churned.detail || ""), /b2b2b2b2b2b2/.test(churned && churned.detail || "")], [true, true]);

console.log(`\nd57selflink: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
