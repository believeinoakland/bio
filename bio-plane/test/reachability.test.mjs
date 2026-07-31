/* Source reachability, and the one outcome that must never count (D-104).
 *
 * The archive fallback fires after three consecutive failures or fourteen days.
 * This suite exists to prove that OUR OWN governor declining to ask is not one
 * of those failures. If it were, sustained self-throttling would trip the
 * fallback and we would fetch from the Internet Archive because we paced
 * ourselves, loading somebody else's infrastructure to solve a problem we made.
 *
 * Bob, 2026-07-31: the governor keeps traffic low enough that being banned is
 * not a concern. That is exactly why governed refusals will be COMMON, and why
 * the exclusion is worth a suite rather than a comment.
 *
 * Driven at the Durable Object, because the counter is store state and the
 * control-plane surface over it is a read.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  bindings: { ADMIN_TOKEN: "adm-reach", MEMBER_TOKEN: "mem-reach", PROBE_TOKEN: "prb-reach", VERSION: "test" },
});

const A = "www.oaklandca.gov/agenda.pdf";
const day = (n) => `2026-07-${String(n).padStart(2, "0")}T00:00:00Z`;

try {
  const ns = await mf.getDurableObjectNamespace("STORE");
  const obj = ns.get(ns.idFromName("bio"));
  const rec = async (b) => (await (await obj.fetch("http://x/recordsourceoutcome",
    { method: "POST", body: JSON.stringify(b) })).json()).result;
  /* Every read pins the instant. A suite whose verdict depends on the day it
     runs is testing the calendar. */
  const read = async (addr, now = day(10)) => (await (await obj.fetch(
    `http://x/sourcereach?address=${encodeURIComponent(addr)}&now=${encodeURIComponent(now)}`)).json()).result;

  console.log("\n--- an address nobody has tried is not failing ---");
  const fresh = await read("www.example.gov/never-asked");
  t("unknown addresses are known:false", fresh.known, false);
  t("and are not fallback eligible", fresh.fallback_eligible, false);

  console.log("\n--- the outcome vocabulary is closed ---");
  t("a missing address is refused", (await rec({ outcome: "success" })).reason, "NO_ADDRESS");
  t("an outcome outside the set is refused",
    (await rec({ addressNorm: A, outcome: "probably-fine" })).reason, "BAD_OUTCOME");
  t("and 'failure' is not a vocabulary word: the kind must be named",
    (await rec({ addressNorm: A, outcome: "failure" })).reason, "BAD_OUTCOME");

  console.log("\n--- THE EXCLUSION: governed refusals never move the threshold ---");
  for (const n of [1, 2, 3, 4, 5]) await rec({ addressNorm: A, outcome: "governed", at: day(n) });
  const gov = await read(A, day(5));
  t("five governed refusals are counted", gov.governed_refusals, 5);
  t("but consecutive_failures is still zero", gov.consecutive_failures, 0);
  t("and the fallback is NOT eligible", gov.fallback_eligible, false);
  t("and the basis says so in words an operator can act on",
    /DELIBERATELY not counted/.test(gov.basis), true);
  t("a governed refusal does not start the staleness clock either", gov.first_failure_since, null);
  t("nor is it counted as an attempt on the source", gov.attempts, 0);

  console.log("\n--- an outcome the SOURCE produced does count ---");
  await rec({ addressNorm: A, outcome: "source_refused", status: 503, at: day(6) });
  let r = await read(A, day(6));
  t("one real refusal counts", r.consecutive_failures, 1);
  t("the origin status is kept", r.last_status, 503);
  t("the staleness clock starts at the first failure of the run", r.first_failure_since, day(6));
  t("one is not yet eligible", r.fallback_eligible, false);

  await rec({ addressNorm: A, outcome: "governed", at: day(7) });
  r = await read(A, day(7));
  t("a governed refusal MID-RUN does not advance the count", r.consecutive_failures, 1);
  t("and does not reset it either: we learned nothing", r.first_failure_since, day(6));

  await rec({ addressNorm: A, outcome: "fetch_failed", at: day(8) });
  await rec({ addressNorm: A, outcome: "source_refused", status: 404, at: day(9) });
  r = await read(A, day(9));
  t("three real failures reach the RULED threshold", r.consecutive_failures, 3);
  t("and the fallback IS eligible", r.fallback_eligible, true);
  t("the basis names the count and the threshold", /3 consecutive failures/.test(r.basis), true);
  t("the excluded governed refusals stay visible beside the verdict", r.governed_refusals, 6);

  console.log("\n--- a success resets the run ---");
  await rec({ addressNorm: A, outcome: "success", status: 200, at: day(10) });
  r = await read(A);
  t("consecutive_failures returns to zero", r.consecutive_failures, 0);
  t("the staleness clock is cleared", r.first_failure_since, null);
  t("the fallback is no longer eligible", r.fallback_eligible, false);
  t("but the historical total is not rewritten", r.failures_total, 3);

  console.log("\n--- the fourteen-day arm, on a source failing only once ---");
  const B = "www.oaklandca.gov/ordinance-2019.pdf";
  await rec({ addressNorm: B, outcome: "source_refused", status: 500, at: day(1) });
  t("a failure one day old is not eligible on either arm",
    (await read(B, day(2))).fallback_eligible, false);
  t("nor at thirteen days", (await read(B, day(14))).fallback_eligible, false);
  /* CORRECTED 2026-07-31, not exempted. This asserted that ONE failure ages into
     eligibility at fourteen days. It does not any more, and the old rule was the
     weaker reading of the project's own principle: a document that failed once
     and was never retried is a gap in OUR attention, and treating that as the
     source being unreachable is D-104's mistake one level up. */
  const at14 = await read(B, day(15));
  t("a SINGLE failure does not age into eligibility, however old", at14.fallback_eligible, false);
  t("and the basis says it is our monitoring gap, not their outage",
    /gap in our monitoring/.test(at14.basis), true);
  t("it still reports how long it has been failing", at14.failing_days, 14);
  await rec({ addressNorm: B, outcome: "fetch_failed", at: day(3) });
  const corroborated = await read(B, day(15));
  t("a SECOND failure corroborates it, and then the age arm fires",
    corroborated.fallback_eligible, true);
  t("and the basis names the age and the corroboration requirement",
    /failing since.*at least 2 failures/.test(corroborated.basis), true);
  t("the thresholds in force are reported so the verdict can be audited",
    corroborated.thresholds, { failures: 3, days: 14, minForAge: 2 });
  /* The arm measures the FAILING RUN, so a governed refusal cannot age a
     document into eligibility on its own. */
  const C = "www.oaklandca.gov/never-actually-asked.pdf";
  for (const n of [1, 2, 3]) await rec({ addressNorm: C, outcome: "governed", at: day(n) });
  t("thirty days of nothing but governed refusals is still not eligible",
    (await read(C, "2026-08-30T00:00:00Z")).fallback_eligible, false);
  t("because the failing clock never started", (await read(C, "2026-08-30T00:00:00Z")).first_failure_since, null);

  console.log("\n--- reachability is per DOCUMENT, not per host ---");
  t("a second address on the same host is untouched",
    (await read("www.oaklandca.gov/somewhere-else")).known, false);
  t("because one page can be gone while the site answers",
    (await read(A)).address_norm, A);
} finally {
  await mf.dispose();
}

console.log(`\nreachability: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
