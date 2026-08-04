/* CAP-3: a periodic MONITORING tick actually INVOKES the archive fallback.
 *
 * The decision half (the eligibility fence, D-104) and the capture half (op=acquire
 * with via:"archive.org", the two-hop grade-C chain, D-112) were both built and
 * live-verified and NOTHING called them: no periodic actor consulted sourcereach
 * and nothing fired the fallback. This suite is the accepts-when for closing that
 * gap. It drives the whole loop end to end through the real ops:
 *
 *   1. three consecutive REAL source failures (recorded exactly as the acquire
 *      path records them) push a document to fallback_eligible;
 *   2. the archive-monitor consumer, registered on REC-1's ONE reconciling DO
 *      alarm, fires on its tick, reaches op=acquire over a SELF service binding
 *      under a daemon credential, and captures the document from the Internet
 *      Archive — producing a grade-C capture with a two-hop provenance chain;
 *   3. that archive success is the RULED "an alternative source counts as a
 *      re-fetch for monitoring", so the failing run resets and the document drops
 *      out of eligibility on the next tick.
 *
 * THE EXCLUSION under test (D-104): our OWN governor declining is not the source
 * failing, so a governed refusal moves no counter and can never make a document
 * eligible. A run of governed refusals must therefore fire NO fallback. That is
 * the load-bearing assertion, and it is exactly what the negative control breaks.
 *
 * web.archive.org is mocked at the egress (outboundService), the SELF binding
 * loops back to this same Worker, and the monitoring interval is pinned far out
 * of the test window so only the hand-driven onAlarm fires — the task-drain
 * suite's trick, so the assertions are deterministic.
 *
 * NEGATIVE CONTROL: in src/store.mjs recordSourceOutcome, make the `governed`
 * branch increment consecutive_failures (drop the D-104 exclusion) — add
 * `consecutive_failures = consecutive_failures + 1, first_failure_since =
 * COALESCE(first_failure_since, ?)` to its UPDATE. RUN 2026-07-31: three governed
 * refusals then reach the threshold, the tick finds the document eligible and
 * fires a SPURIOUS grade-C archive fallback; the suite FAILS 4 assertions naming
 * it — "governed refusals leave the run at zero" (want 0 got 3), "so the document
 * is NOT eligible" (want false got true), "a run of governed refusals fires NO
 * fallback" (want [] got [{address:.../ordinance.pdf,grade:C,hops:2}]), and "the
 * governed document is not even a monitoring candidate". Restored -> 22/22 green.
 */
/* NEGATIVE CONTROL: in src/store.mjs recordSourceOutcome, make the `governed` branch increment consecutive_failures (drop the D-104 exclusion) -> three governed refusals become eligible and the tick fires a SPURIOUS grade-C fallback; suite FAILS 4 assertions naming the address (RUN 2026-07-31, restored 22/22 green). */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

/* The document the source has stopped serving and the Archive still holds. Its
   normalised form is its own canonical https address, so it is both what we
   record failures against and what op=acquire is handed. */
const DOCADDR = "https://www.oaklandca.gov/agenda.pdf";
const ARCHIVED = new Uint8Array(6000).map((_, i) => (i * 17 + 3) % 256);
const ARCHIVED_SHA = createHash("sha256").update(ARCHIVED).digest("hex");
const TS = "20240115120000";
/* MEASURED CDX shape: output=json is an array of arrays with a header row. One
   usable 200 row whose `original` is the document address (so the archive capture
   lands on the SAME reachability row), plus a 301 the selector must reject. */
const CDX = JSON.stringify([
  ["urlkey", "timestamp", "original", "mimetype", "statuscode", "digest", "length"],
  ["gov,oaklandca)/agenda.pdf", "20230101000000", DOCADDR, "application/pdf", "301", "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "512"],
  ["gov,oaklandca)/agenda.pdf", TS, DOCADDR, "application/pdf", "200", "MFCJ5MFCJ5MFCJ5MFCJ5MFCJ5MFCJ5MF", "6255"],
]);

let MF;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: {
    ADMIN_TOKEN: "adm-mon", MEMBER_TOKEN: "mem-mon", PROBE_TOKEN: "prb-mon", VERSION: "test",
    GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0",
    /* Pinned FAR out of the test window: the failure-armed real alarm never fires
       during the run, so only the hand-driven onAlarm exercises the tick. */
    MONITOR_TICK_MS: "3600000",
  },
  /* The self service binding the monitoring tick reaches op=acquire over. In
     production this is provisioned per-instance (the instance name IS the worker
     name); here it loops straight back to this same Worker. */
  serviceBindings: { SELF: async (request) => MF.dispatchFetch(request) },
  outboundService(request) {
    const u = new URL(request.url);
    if (u.hostname === "web.archive.org" && u.pathname === "/cdx/search/cdx")
      return new Response(CDX, { headers: { "content-type": "application/json" } });
    if (u.hostname === "web.archive.org" && u.pathname.includes("id_/"))
      return new Response(ARCHIVED, { headers: { "content-type": "application/pdf" } });
    return new Response("unscripted", { status: 500 });
  },
});
MF = mf;

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

try {
  const ns = await mf.getDurableObjectNamespace("STORE");
  const obj = ns.get(ns.idFromName("bio"));
  const rec = async (b) => (await (await obj.fetch("http://x/recordsourceoutcome",
    { method: "POST", body: JSON.stringify(b) })).json()).result;
  const read = async (addr, now) => (await (await obj.fetch(
    `http://x/sourcereach?address=${encodeURIComponent(addr)}${now ? `&now=${encodeURIComponent(now)}` : ""}`)).json()).result;
  const tick = async (now) => await obj.onAlarm(now);

  console.log("\n--- the consumer is configured (SELF binding + daemon token reach the DO) ---");
  /* If the service binding and token did not reach the Durable Object's env the
     tick would be inert and everything below would silently pass by doing
     nothing, so this is asserted first and directly. */
  const probe0 = await tick(Date.now());
  t("with no failing source the archive-monitor tick runs and is configured",
    probe0.monitor && probe0.monitor.configured, true);
  t("and finds nothing to do", probe0.monitor.eligible, []);

  console.log("\n--- three consecutive REAL source failures make the document eligible ---");
  await rec({ addressNorm: DOCADDR, outcome: "source_refused", status: 503 });
  await rec({ addressNorm: DOCADDR, outcome: "fetch_failed" });
  const third = await rec({ addressNorm: DOCADDR, outcome: "source_refused", status: 404 });
  t("three real failures are counted", third.consecutive_failures, 3);
  t("and the fence declares the document fallback_eligible", third.fallback_eligible, true);

  console.log("\n--- the monitoring tick FIRES the fallback: a two-hop grade-C capture ---");
  const fired = await tick(Date.now());
  t("the tick checked the failing document", fired.monitor.checked >= 1, true);
  t("and found it eligible", fired.monitor.eligible, [DOCADDR]);
  t("exactly one fallback fired", fired.monitor.fired.length, 1);
  t("for the document address", fired.monitor.fired[0].address, DOCADDR);
  t("GRADE C — an archive capture is two hops, weaker, and says so", fired.monitor.fired[0].grade, "C");
  t("with a TWO-hop provenance chain (us, then the Archive)", fired.monitor.fired[0].hops, 2);
  t("and nothing failed", fired.monitor.failed, []);

  console.log("\n--- the bytes really landed, content-addressed, exactly what the Archive served ---");
  const back = await mf.dispatchFetch(`http://x/api/?op=capture&token=adm-mon&sha256=${ARCHIVED_SHA}`);
  t("the archived capture reads back from the store", back.status, 200);
  t("byte-identical to what web.archive.org served",
    createHash("sha256").update(Buffer.from(await back.arrayBuffer())).digest("hex"), ARCHIVED_SHA);

  console.log("\n--- the archive success is a re-fetch for monitoring: the run resets ---");
  const after = await read(DOCADDR);
  t("consecutive_failures returns to zero", after.consecutive_failures, 0);
  t("the document is no longer eligible", after.fallback_eligible, false);
  t("but the historical failure total is not rewritten", after.failures_total, 3);
  const again = await tick(Date.now());
  t("a second tick finds nothing eligible and fires nothing", again.monitor.fired, []);

  console.log("\n--- THE EXCLUSION (D-104): governed refusals fire NO fallback ---");
  /* This is what the negative control breaks. A run of our own governor
     declining is not the source failing; if it counted, sustained self-throttling
     would fire the fallback hardest exactly when we were being most polite. */
  const G = "https://www.oaklandca.gov/ordinance.pdf";
  for (const s of [1, 2, 3]) await rec({ addressNorm: G, outcome: "governed" });
  const gov = await read(G);
  t("three governed refusals are counted in their own column", gov.governed_refusals, 3);
  t("governed refusals leave the run at zero", gov.consecutive_failures, 0);
  t("so the document is NOT eligible", gov.fallback_eligible, false);
  const govTick = await tick(Date.now());
  t("and a run of governed refusals fires NO fallback",
    govTick.monitor.fired.filter((f) => f.address === G), []);
  t("the governed document is not even a monitoring candidate",
    govTick.monitor.eligible.includes(G), false);
} finally {
  await mf.dispose();
}

console.log(`\narchive-monitoring: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
