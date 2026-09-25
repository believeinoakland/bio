/* GATE: reads tools/urlpreflight-entry.mjs bio-plane/test/tier1-coverage-probe.mjs
 *
 * DIST-12 — the release live verification's URL preflight entry (`tools/urlpreflight-entry.mjs`).
 *
 * What is asserted: (A) THE ROW'S OWN CONTROL, run as a positive arm on every battery: the REAL preflight is run as a
 * child with its egress pointed at a dead proxy (127.0.0.1:9), so no request reaches any origin — a refused host for
 * every URL — and the entry must record every URL REFUSED, by name, and NONE as NOT_FOUND (a refused host is never
 * "rotted"). Offline and deterministic. (B) the reader agrees with the preflight's own summary or refuses
 * FORMAT_DRIFT, and each of the four verdicts renders on its own line with its meaning.
 *
 * NEGATIVE CONTROL: RUN 2026-09-24 (DIST #6), declared before arming, `tools/urlpreflight-entry.mjs` restored from a
 * pristine copy after each and verified by sha256 AND cmp. (N1) THE CONFUSION THE ROW EXISTS AGAINST — `parsePreflight`
 * rewrites a REFUSED row whose detail is "no response" to NOT_FOUND -> the three (A) arms fail by name ("every URL is
 * REFUSED", "NONE is NOT_FOUND", "and none is owed as rotted"), and (B)'s four-verdict arm fails on its REFUSED line.
 * (N2) the summary cross-check removed -> the FORMAT_DRIFT arm fails by name. MEASURED, baseline 12/0: N1 -> 6 passed,
 * 6 failed, WIDER THAN DECLARED by two, both by name and both the same confusion: (A)'s "one table line per URL, each
 * REFUSED" and (B)'s "four rows, one per verdict" also fell, since the rewritten verdict is read everywhere downstream.
 * N2 -> 11/1, exactly the FORMAT_DRIFT arm, as declared. Restored byte-identically (sha256 0d7f41c1…); RE-RUN after the
 * spawn's timeout was removed (budget-sweep) and stdio imported, sha256 87175f0a…: identical figures. The (A) arm
 * DISCRIMINATES: in the same hour the same 14 URLs read 14/14 LIVE through the session's real egress (M-136), so
 * the arm's REFUSED comes from the dead proxy and not from the origins.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import { parsePreflight, renderEntry, runPreflight } from "../../tools/urlpreflight-entry.mjs";

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  ok ? pass++ : fail++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  want ${statedJSON(want)} got ${statedJSON(got)}`}`);
};

console.log("\n--- (A) a refused host is recorded REFUSED, never NOT_FOUND (the row's control, through the REAL preflight) ---");
{
  const env = { ...process.env, NODE_USE_ENV_PROXY: "1", HTTPS_PROXY: "http://127.0.0.1:9", HTTP_PROXY: "http://127.0.0.1:9",
                https_proxy: "http://127.0.0.1:9", http_proxy: "http://127.0.0.1:9", NO_PROXY: "", no_proxy: "" };
  const run = runPreflight(env);
  let p = null, err = null;
  try { p = parsePreflight(run.stdout); } catch (e) { err = e.message; }
  t("the preflight ran and its output was read (no FORMAT_DRIFT)", err, null);
  const rows = p?.rows || [];
  t("the preflight read at least one URL (else this arm tests nothing)", rows.length > 0, true);
  t("every URL is REFUSED when no request can reach its origin", rows.filter((r) => r.verdict !== "REFUSED").map((r) => r.id), []);
  t("NONE is NOT_FOUND — a refused host is never recorded as rotted", rows.filter((r) => r.verdict === "NOT_FOUND").length, 0);
  t("the preflight exits non-zero on it (it is a gate on the corpus)", run.exit, 1);
  const entry = p ? renderEntry(p, { release: "9.9.9", id: "M-TEST", exit: run.exit }) : "";
  t("the entry has one table line per URL, each REFUSED", (entry.match(/\| \*\*REFUSED\*\* \|/g) || []).length, rows.length);
  t("and none is owed as rotted", entry.includes("Nothing rotted: no NOT_FOUND"), true);
}

console.log("\n--- (B) the reader agrees with the preflight's own summary, and each verdict keeps its meaning ---");
{
  const canned = (summary) => [
    "=== D-166 · URL preflight for the CPDF-5 corpus ===",
    "date: 2026-09-24T05:00:00.000Z · node v26 · instrument: this file",
    "",
    "doc-live                       LIVE       http 206 application/pdf 25 50 44 46",
    "                                          https://example.org/a.pdf",
    "doc-html                       NOT_PDF    http 200 text/html begins <html>",
    "                                          https://example.org/b.pdf",
    "doc-gone                       NOT_FOUND  http 404 text/html",
    "                                          https://example.org/c.pdf",
    "doc-refused                    REFUSED    no response: fetch failed",
    "                                          https://example.org/d.pdf",
    "",
    summary,
  ].join("\n");
  const p = parsePreflight(canned("  1/4 LIVE (bytes begin %PDF) at 2026-09-24T05:00:00.000Z"));
  t("four rows, one per verdict, each with its URL", p.rows.map((r) => [r.id, r.verdict, r.src.slice(-5)]),
    [["doc-live", "LIVE", "a.pdf"], ["doc-html", "NOT_PDF", "b.pdf"], ["doc-gone", "NOT_FOUND", "c.pdf"], ["doc-refused", "REFUSED", "d.pdf"]]);
  const e = renderEntry(p, { release: "1.2.3", id: "M-TEST" });
  t("the entry is dated and names the release", e.startsWith("## M-TEST · 2026-09-24 · DIST-12") && e.includes("release 1.2.3"), true);
  t("each verdict renders on its own line with its meaning (REFUSED is 'at this hour', NOT_FOUND is 'ROTTED')",
    [/doc-refused \| \*\*REFUSED\*\* \|.*AT THIS HOUR/.test(e), /doc-gone \| \*\*NOT_FOUND\*\* \|.*ROTTED/.test(e),
     /doc-html \| \*\*NOT_PDF\*\* \|/.test(e), /doc-live \| \*\*LIVE\*\* \|/.test(e)], [true, true, true, true]);
  t("the NOT_FOUND fixture is named as owing a plan row", e.includes("**Owed:**") && e.includes("doc-gone"), true);
  let drift = null;
  try { parsePreflight(canned("  1/5 LIVE (bytes begin %PDF) at 2026-09-24T05:00:00.000Z")); } catch (x) { drift = x.message.split(":")[0]; }
  t("rows that disagree with the preflight's own summary are REFUSED as FORMAT_DRIFT, never a short entry", drift, "FORMAT_DRIFT");
}

console.log(`\ndist12-urlpreflight: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
