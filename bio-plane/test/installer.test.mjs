/* NEGATIVE CONTROL: (run 2026-07-31) disable the published-token denylist in tokens.mjs liveToken (return true for any non-empty value instead of checking PUBLISHED_TOKEN_HASHES) so a leaked repo token authenticates -> 4 assertions fail (published value authenticates as admin, selftest calls the poisoned binding live, bootstrap reports a usable credential, claim accepts the published bootstrap token); restored, 30 pass. */
/* Installer-readiness guarantees:
 *  1. A published repository token value can never authenticate and can never
 *     arm the bootstrap claim, even if an operator sets it.
 *  2. R2 absence is a first-class healthy state; half a fence is a defect.
 *  3. The instance serves its own setup page at /, while the /api surface and
 *     the legacy root query API keep answering JSON.
 *
 * Negative-control detail: disable the published-token denylist in tokens.mjs liveToken (return true for any non-empty value instead of checking PUBLISHED_TOKEN_HASHES) so a leaked repo token authenticates -> 4 assertions fail (published value authenticates as admin, selftest calls the poisoned binding live, bootstrap reports a usable credential, claim accepts the published bootstrap token); restored, 30 pass.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
/* A value that IS published in this repository: dist/SECRETS.txt, 0.2.0. */
const PUBLISHED = "df362a63adbe5d1d96a2942e39fd60e3fbb412eaadf7317266c19a4efea658ba";

const mk = (bindings, { r2 = true } = {}) => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  ...(r2 ? { r2Buckets: ["CAPTURES", "PUBLISHED"] } : {}),
  bindings: { VERSION: "test", ...bindings },
});

let pass = 0, fail = 0;
const t = (l, g, w) => { const ok = JSON.stringify(g) === JSON.stringify(w);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${l}${ok ? "" : `  want ${JSON.stringify(w)} got ${JSON.stringify(g)}`}`);
  ok ? pass++ : fail++; };

/* ---- 1. published values are dead on arrival ---- */
console.log("\n--- a published token value is treated as not set ---");
{
  const mf = mk({ ADMIN_TOKEN: PUBLISHED, PROBE_TOKEN: "probe-local-battery" });
  const j = async (p, init) => (await (await mf.dispatchFetch("http://x" + p, init)).json());
  t("published value cannot authenticate as admin",
    (await j(`/api/?op=stats&token=${PUBLISHED}`)).error, "unauthenticated");
  t("a live probe token still works alongside it",
    (await j("/api/?op=selftest&token=probe-local-battery")).service, "bio-plane");
  t("selftest reports the poisoned binding as not live",
    (await j("/api/?op=selftest&token=probe-local-battery")).bindings.ADMIN_TOKEN, false);
  t("bootstrap reports no usable credential",
    (await j("/api/?op=bootstrap")).bootstrapConfigured, false);
  const c = await j("/api/?op=claim", { method: "POST",
    body: JSON.stringify({ bootstrapToken: PUBLISHED, password: "long-enough-password" }) });
  t("claim refuses the published bootstrap credential",
    String(c.error).includes("published repository value"), true);
  await mf.dispose();
}

console.log("\n--- an empty token authenticates nothing ---");
{
  const mf = mk({ ADMIN_TOKEN: "", PROBE_TOKEN: "probe-local-battery" });
  const j = async (p) => (await (await mf.dispatchFetch("http://x" + p)).json());
  t("empty string presented as token is unauthenticated",
    (await j("/api/?op=stats&token=")).error, "unauthenticated");
  t("bootstrap reports no usable credential", (await j("/api/?op=bootstrap")).bootstrapConfigured, false);
  await mf.dispose();
}

/* ---- 2. optional R2 ---- */
console.log("\n--- no R2 is healthy and declared; livefire agrees ---");
{
  const mf = mk({ ADMIN_TOKEN: "an-admin-token-16ch", MEMBER_TOKEN: "a-member-token-16ch",
                  PROBE_TOKEN: "probe-local-battery" }, { r2: false });
  const j = async (p) => (await (await mf.dispatchFetch("http://x" + p)).json());
  const st = await j("/api/?op=selftest&token=probe-local-battery");
  t("selftest ok with no R2", st.ok, true);
  t("r2Configured false", st.r2Configured, false);
  t("captures declared not configured", st.captures, "not configured");
  t("bindings report absence, not failure", st.bindings.CAPTURES, "not configured");
  t("required bindings all present", st.bindingsAllPresent, true);
  const lf = await j("/api/?op=livefire&token=probe-local-battery");
  t("livefire ok with no R2", lf.ok, true);
  t("livefire declares R2 not configured", lf.r2.configured, false);
  t("declared-absence assertion present",
    lf.assertions.some((a) => a.name === "R2 not configured is declared, not silent" && a.ok), true);
  t("token hygiene assertions pass",
    lf.assertions.filter((a) => a.name.startsWith("no configured token")).every((a) => a.ok), true);
  await mf.dispose();
}

console.log("\n--- livefire fails a configured token that is a published value ---");
{
  const mf = mk({ ADMIN_TOKEN: PUBLISHED, PROBE_TOKEN: "probe-local-battery" });
  const j = async (p) => (await (await mf.dispatchFetch("http://x" + p)).json());
  const lf = await j("/api/?op=livefire&token=probe-local-battery");
  t("battery goes red", lf.ok, false);
  const a = lf.assertions.find((x) => x.name === "no configured token is a published repository value");
  t("the published-value assertion is the one that failed", a.ok, false);
  t("it names the binding, not the value", JSON.stringify(a.got), JSON.stringify(["ADMIN_TOKEN"]));
  t("the response never contains the value itself", JSON.stringify(lf).includes(PUBLISHED), false);
  await mf.dispose();
}

/* ---- 3. the setup page ---- */
console.log("\n--- the root serves the setup page; both APIs keep answering ---");
{
  const mf = mk({ ADMIN_TOKEN: "an-admin-token-16ch", PROBE_TOKEN: "probe-local-battery" });
  const raw = async (p) => mf.dispatchFetch("http://x" + p);
  const j = async (p) => (await (await mf.dispatchFetch("http://x" + p)).json());
  const home = await raw("/");
  t("GET / is HTML", (home.headers.get("content-type") || "").startsWith("text/html"), true);
  const body = await home.text();
  t("it is the setup page", body.includes("Claim your copy"), true);
  t("it strips the handover fragment", body.includes("history.replaceState"), true);
  t("legacy root query API still answers JSON",
    (await j("/?op=selftest&token=probe-local-battery")).service, "bio-plane");
  t("/api selftest answers", (await j("/api/?op=selftest&token=probe-local-battery")).service, "bio-plane");
  t("/api bootstrap answers", (await j("/api/?op=bootstrap")).bootstrapConfigured, true);
  t("unknown op still 400s, not the page", (await j("/?op=nonsense")).error, "unknown op");
  await mf.dispose();
}

console.log("\n--- the version is one plain GET ---");
{
  const v = mk({ ADMIN_TOKEN: "a-ver", MEMBER_TOKEN: "m-ver", PROBE_TOKEN: "p-ver" });
  const r = await v.dispatchFetch("http://x/version");
  t("GET /version answers 200 with no credential", r.status, 200);
  t("as plain text, not JSON", (r.headers.get("content-type") || "").startsWith("text/plain"), true);
  t("carrying just the version", (await r.text()).trim(), "test");
  await v.dispose();
}

console.log(`\ninstaller: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
