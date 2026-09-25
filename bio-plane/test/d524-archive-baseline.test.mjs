/* NEGATIVE CONTROL: (run 2026-09-24, D-524, on land/worker/D-524 over 9f8b69e6, FOUR ARMS PLUS A BASELINE, each armed ALONE by an exactly-once patch, each restored from a uniquely-named per-arm pristine copy in the session scratchpad and verified by sha256 AND cmp: 4 of 4 MATCH/IDENTICAL, cdx.mjs 9433 bytes 4714ec20c2f95d45…, index.mjs 834701 bytes 91cf3a0d03bffda6…). Declared before arming. BASELINE, nothing armed: 19 pass 0 fail. (1) THE ROW'S ARM — drop `document_address` from `archiveHop` -> DECLARED red at the archive-baseline arm; ACTUAL 12/7, "ARCHIVE-BASELINE: op=monitor finds the archive-sourced baseline on both ticks" got [null,null] and ACCEPTS-WHEN got [null,null] — the measured failure itself, "no captured baseline" on every tick. (2) the monitor's hop fallback removed, the key held -> DECLARED red at the same arm; ACTUAL 14/5, the same five tick assertions. (3) the hop match made EXACT rather than in `normalizeAddress` form -> DECLARED only the over-strictness arm fails; ACTUAL 18/1, exactly "OVER-STRICTNESS: an equivalent spelling finds the archive baseline and reads unchanged". (4) the match taking ANY archive row -> DECLARED only the wrong-document arm fails; ACTUAL 18/1, exactly "a hop naming another document is not this bundle's baseline". Restored: 19/0. A FINDING ABOUT THE INSTRUMENT, recorded: the first draft read the Archive's hop by `via` and got OUR hop, which also reads `via: "archive.org"`. */
/* D-524 — AN ARCHIVE-SOURCED BASELINE IS FOUND BY op=monitor.
 *
 * THE DEFECT, IN ONE SENTENCE: `op=acquire` with `via: "archive.org"` sets
 * `body.locator = sel.replay`, so the document it answers — which a caller files
 * as the register row in `data/provenance.json` (C-18.1's shape) — names the
 * WAYBACK REPLAY URL as its `locator`, while the bundle's `source.locator` is the
 * document address. op=monitor's register lookup keyed on `locator` alone, so the
 * tick read "no captured baseline" on every visit, forever. D-472's defect on the
 * archive arm (D-472's worker, F1).
 *
 * THE FIX: `archiveHop` carries `document_address` (the CDX `original`) as a named
 * key, as `driveHop` does, and op=monitor falls back to the register row whose
 * provenance hop names the bundle's locator. The key is built by the plane from
 * the CDX record it fetched, never from the request (D-112).
 *
 * WHAT MAKES THE unchanged ARM EVIDENCE: the replay URL and the document address
 * are asserted DIFFERENT before anything is claimed, and the tick's `baseline` is
 * asserted to be the archive capture's sha — a tick with no baseline answers
 * `status: null`, which a suite reading only "not modified" would call a pass.
 *
 * ACCEPTS-WHEN (the row): an archive-sourced baseline is found by op=monitor and
 * two unchanged ticks read `unchanged`.
 *
 * NEGATIVE CONTROL: drop the hop key and the archive-baseline arm reads no
 * baseline, failing by name.
 */
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { archiveHop, replayLocator } from "../src/cdx.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

const DOCADDR = "https://www.oaklandca.gov/d524/agenda.pdf";
const TS = "20240115120000";
/* THREE documents, each with bytes of its own (D-179: one capture, one home), so
   each arm below holds a capture no other bundle holds. */
const bytesFor = (k) => new Uint8Array(6000).map((_, i) => (i * k + 7) % 256);
const DOCS = {
  [DOCADDR]: bytesFor(31),
  "https://www.oaklandca.gov/d524/minutes.pdf": bytesFor(37),
  "https://www.oaklandca.gov/d524/other.pdf": bytesFor(41),
};
const BODY = DOCS[DOCADDR];
const BODY_SHA = createHash("sha256").update(BODY).digest("hex");
/* MEASURED CDX shape (archive-monitoring.test.mjs): an array of arrays with a
   header row, answered here for whichever document the query names. */
const cdxFor = (addr) => JSON.stringify([
  ["urlkey", "timestamp", "original", "mimetype", "statuscode", "digest", "length"],
  ["gov,oaklandca)/d524", TS, addr, "application/pdf", "200", "MFCJ5MFCJ5MFCJ5MFCJ5MFCJ5MFCJ5MF", "6255"],
]);
const docFromReplay = (path) => Object.keys(DOCS).find((a) => path.endsWith(`id_/${a}`));

/* What the source itself serves when the tick visits: the same bytes the
   Archive held, so an honest tick reads `unchanged`. */
let liveBody = BODY, liveDown = true;
const LIVE = { "/d524/minutes.pdf": DOCS["https://www.oaklandca.gov/d524/minutes.pdf"],
               "/d524/elsewhere.pdf": bytesFor(43) };
const liveAsked = [];
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-524", MEMBER_TOKEN: "mem-524", PROBE_TOKEN: "prb-524", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    if (u.hostname === "web.archive.org" && u.pathname === "/cdx/search/cdx") {
      const addr = `https://${u.searchParams.get("url")}`;
      return DOCS[addr] ? new Response(cdxFor(addr), { headers: { "content-type": "application/json" } })
                        : new Response("[]", { headers: { "content-type": "application/json" } });
    }
    if (u.hostname === "web.archive.org" && u.pathname.includes("id_/")) {
      const addr = docFromReplay(u.pathname);
      return addr ? new Response(DOCS[addr], { headers: { "content-type": "application/pdf" } })
                  : new Response("not archived", { status: 404 });
    }
    if (u.hostname === "www.oaklandca.gov" && u.pathname === "/d524/agenda.pdf") {
      if (liveDown) return new Response("unavailable", { status: 503 });
      liveAsked.push(u.href);
      return new Response(liveBody, { headers: { "content-type": "application/pdf" } });
    }
    if (u.hostname === "www.oaklandca.gov" && u.pathname in LIVE)
      return new Response(LIVE[u.pathname], { headers: { "content-type": "application/pdf" } });
    return new Response("unscripted", { status: 500 });
  },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* store=scratch on every call (CLAUDE.md §5). The archive arm is admin/probe/daemon only. */
const P = async (op, b) => (await mf.dispatchFetch(`http://x/api/?op=${op}&token=adm-524&store=scratch`,
  { method: "POST", body: JSON.stringify(b) })).json();

const NOW = "2026-09-24T00:00:00Z";
const bundleMd = (id, locator) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@2",
  `title: "Monitored ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", `  locator: ${locator}`, "  authority: City Clerk", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: true", "  frequency: weekly", "  last_checked: null", "---", "",
  "## Summary", "", "An archive-sourced monitored document.", "", "## Provenance Notes", "",
  "## Session Log", "", "### Session 1", "", "Captured.", "", "## Review Notes", "",
].join("\n");

let seq = 0;
const promoted = async (locator, docs, capDoc) => {
  const id = `INFO-2026-${String(9500 + ++seq)}-d524-archive`;
  const md = bundleMd(id, locator);
  const prov = JSON.stringify({ documents: docs });
  const r = await P("promote", {
    bundleId: id, base: null, snapKey: `20260924T000000Z_d524${String(seq).padStart(4, "0")}`, author: "suite",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Monitored ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
            { path: capDoc.file, blobSha: capDoc.capture.sha256, sha256: capDoc.capture.sha256, bytes: capDoc.capture.bytes }],
    register: [{ sha256: capDoc.capture.sha256, path: capDoc.file, encoding: "binary", bytes: capDoc.capture.bytes }],
  });
  return { id, promoted: r.ok !== false && (r.result ? r.result.ok !== false : true), r };
};

try {
  console.log("\n--- D-524: the hop carries the document address, built from the CDX record ---");
  {
    const chosen = { original: DOCADDR, timestamp: TS, archived_at: "2024-01-15T12:00:00Z",
                     statuscode: "200", digest: "X", mimetype: "application/pdf" };
    const replay = replayLocator(chosen);
    const hop = archiveHop(chosen, replay);
    t("archiveHop names the document address as a KEY, not only in prose", hop.document_address, DOCADDR);
    t("…and it is the CDX original, not the replay URL", hop.document_address === replay, false);
  }

  console.log("\n--- D-524: the source fails three times, and the Archive becomes eligible ---");
  /* Recorded exactly as the acquire path records them, on the scratch store's
     own reachability row — archive-monitoring.test.mjs's method. Driving three
     direct acquires instead is refused by the host governor's cooling-off after
     the first, which is D-104's exclusion working, not the source failing. */
  const ns = await mf.getDurableObjectNamespace("STORE");
  const obj = ns.get(ns.idFromName("scratch"));
  const eligible = async (addr) => {
    let reach = null;
    for (const o of [{ outcome: "source_refused", status: 503 }, { outcome: "fetch_failed" }, { outcome: "source_refused", status: 503 }])
      reach = (await (await obj.fetch("http://x/recordsourceoutcome",
        { method: "POST", body: JSON.stringify({ addressNorm: addr, ...o }) })).json()).result;
    return reach?.fallback_eligible;
  };
  t("three real failures make the document fallback_eligible", await eligible(DOCADDR), true);
  liveDown = false;

  console.log("\n--- D-524: an archive-sourced capture, filed as the caller files it ---");
  const acq = await P("acquire", { via: "archive.org", address: DOCADDR, authority: "City Clerk" });
  const doc = acq.document || null;
  if (!doc) console.log(`    ACQUIRE ANSWERED NO DOCUMENT: ${JSON.stringify(acq).slice(0, 400)}`);
  t("acquire captured the Archive's bytes", doc?.capture?.sha256, BODY_SHA);
  t("THE PRECONDITION: the register row's locator is the REPLAY URL, not the document address",
    [typeof doc?.locator === "string" && doc.locator.startsWith("https://web.archive.org/web/"),
     doc?.locator === DOCADDR], [true, false]);
  /* BY WHO, not by `via`: OUR hop also reads `via: "archive.org"` (we fetched the
     replay), so a `via` find takes the first hop and reads undefined — measured,
     this suite's first draft. */
  const hop = (doc?.provenance_chain || []).find((h) => h && h.who === "Internet Archive Wayback Machine");
  t("…and OUR hop does not carry it: it asserts what we fetched, the replay",
    (doc?.provenance_chain || [])[0]?.document_address, undefined);
  t("the recorded archive hop names the document address", hop?.document_address, DOCADDR);

  const A = await promoted(DOCADDR, [doc], doc);
  if (!A.promoted) console.log(`    PROMOTE: ${JSON.stringify(A.r).slice(0, 400)}`);
  t("the archive-sourced bundle promoted", A.promoted, true);

  console.log("\n--- D-524: TWO TICKS on an unchanged document — the archive baseline is FOUND ---");
  const m1 = await P("monitor", { bundleId: A.id });
  const m2 = await P("monitor", { bundleId: A.id });
  t("ARCHIVE-BASELINE: op=monitor finds the archive-sourced baseline on both ticks",
    [m1.baseline, m2.baseline], [BODY_SHA, BODY_SHA]);
  t("ACCEPTS-WHEN: two unchanged ticks read `unchanged`", [m1.status, m2.status], ["unchanged", "unchanged"]);
  t("…and neither says there is no captured baseline",
    [String(m1.note || "").includes("no captured baseline"), String(m2.note || "").includes("no captured baseline")],
    [false, false]);
  t("the tick fetched the DOCUMENT address, never the replay", liveAsked, [DOCADDR, DOCADDR]);

  console.log("\n--- D-524: a CHANGED source reads modified against the archive baseline ---");
  liveBody = new Uint8Array(6000).map((_, i) => (i * 13 + 1) % 256);
  const m3 = await P("monitor", { bundleId: A.id });
  t("a changed source reads `modified`, compared against the archive capture",
    [m3.status, m3.baseline], ["modified", BODY_SHA]);
  liveBody = BODY;

  console.log("\n--- D-524 OVER-STRICTNESS: the bundle spells the address differently, and it is the same document ---");
  {
    /* A locator written with a capitalised host, the default port and a fragment
       names the SAME document the CDX original does; the match is in
       `normalizeAddress`'s form, so the baseline must be found. */
    const M = "https://www.oaklandca.gov/d524/minutes.pdf";
    t("the second document is eligible", await eligible(M), true);
    const am = await P("acquire", { via: "archive.org", address: M, authority: "City Clerk" });
    const B = await promoted("https://WWW.OaklandCA.gov:443/d524/minutes.pdf#page=2", [am.document], am.document);
    t("the differently-spelled bundle promoted", B.promoted, true);
    const mb = await P("monitor", { bundleId: B.id });
    t("OVER-STRICTNESS: an equivalent spelling finds the archive baseline and reads unchanged",
      [mb.baseline, mb.status], [am.document?.capture?.sha256, "unchanged"]);
  }

  console.log("\n--- D-524: an archive row for ANOTHER document is never taken ---");
  {
    /* The fallback is "the hop names THIS document", not "any archive row": a
       bundle whose register holds only an archive capture of a different
       document keeps no baseline, and says so. */
    const O = "https://www.oaklandca.gov/d524/other.pdf";
    t("the third document is eligible", await eligible(O), true);
    const ao = await P("acquire", { via: "archive.org", address: O, authority: "City Clerk" });
    const C = await promoted("https://www.oaklandca.gov/d524/elsewhere.pdf", [ao.document], ao.document);
    t("the mismatched bundle promoted", C.promoted, true);
    const mc = await P("monitor", { bundleId: C.id });
    t("a hop naming another document is not this bundle's baseline",
      [mc.baseline ?? null, String(mc.note || "").includes("no captured baseline")], [null, true]);
  }
} finally {
  await mf.dispose();
}

console.log(`\nd524-archive-baseline: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
