/* NEGATIVE CONTROL: (a) delete the #claimFire guard in store.mjs #monitorTick -> a retry re-fires a succeeded address and observations goes 1->2 (risk 2 reproduced), 5 assertions fail; (b) in #monitorCadencePlan use `Store.MONITOR_CADENCE_MS.daily` instead of `Store.monitorIntervalMs(r.monitor_frequency)` -> every document is checked at one global interval and per_meeting gets an interval nobody derived, 6 assertions fail. Both RUN 2026-08-04, restored 59/59 green. */
/* REC-26: the two live M1 gaps — env.SELF bound nowhere, op=monitor with no caller.
 *
 * MILESTONES.md's corrected M1 note names exactly two things that did not close
 * when the scheduler hole did:
 *
 *   (a) env.SELF is bound in no wrangler.jsonc and by no installer, so CAP-3's
 *       archive-monitor consumer is INERT on every deployed instance — "built,
 *       tested, and wired to nothing in production" (MACHINE-PROCESSES.md §0);
 *   (b) op=monitor has no caller anywhere, so M1's clause "a changed source
 *       produces a monitor-tick" has no producer at all.
 *
 * This suite is the accepts-when for both. It drives the whole loop through the
 * real ops: a monitored document is promoted, its source changes, the ONE
 * reconciling DO alarm fires, the monitor-cadence consumer reads that document's
 * OWN cadence out of bundles.monitor_frequency (the column P-84 measures as
 * existing with nothing reading it) and fires op=monitor over the SELF binding.
 * The suite never calls op=monitor: that is the point of the clause.
 *
 * AND it holds the idempotence key MACHINE-PROCESSES.md risk 2 requires. An alarm
 * retry re-runs a tick from the top; a successful archive fallback calls
 * recordCapturedLocator, which does observations = observations + 1; and a run of
 * observations across an interval is the PRIMARY route by which the record says a
 * link was contemporaneous. So without a key a retry MANUFACTURES CORROBORATION —
 * three retries of one observation produce three observations. CLAUDE.md: "an
 * equality or an outcome that costs nothing to produce is not evidence."
 *
 * TIME-PINNED. onAlarm takes an explicit virtual `now` (scheduler.test.mjs's own
 * seam) and every later instant in the cadence blocks is computed FROM the
 * monitor_last_checked op=monitor actually wrote, so the chain is deterministic
 * without pinning the clock the record is stamped with.
 *
 * NEGATIVE CONTROLS, both RUN 2026-08-04 and restored after each (59/59 green
 * before and after both):
 *
 *  (a) REMOVE THE IDEMPOTENCE KEY — in src/store.mjs #monitorTick, delete the line
 *      `if (!this.#claimFire("archive-monitor", address_norm, epoch)) { skipped.push(address_norm); continue; }`
 *      RUN: the retry re-fires the address that already succeeded and
 *      captured_locators.observations goes 1 -> 2, which is risk 2 reproduced
 *      exactly. The suite FAILS 5 assertions naming it — "the retry does NOT
 *      re-fire the address that already succeeded" (want true got false), "the
 *      retry fired nothing new" (want [] got ["https://www.oaklandca.gov/agenda.pdf"]),
 *      "and observations is NOT inflated by the retry" (want 1 got 2), "and the
 *      address that failed is not re-attempted inside the same tick either" (want
 *      true got false), "so the second genuine check is a second genuine
 *      observation" (want 2 got 3 — the inflation compounds). 54 pass, 5 fail.
 *
 *  (b) REMOVE THE CADENCE READ — in src/store.mjs #monitorCadencePlan, replace
 *      `const iv = Store.monitorIntervalMs(r.monitor_frequency);`
 *      with `const iv = Store.MONITOR_CADENCE_MS.daily;` — one global interval for
 *      every document, which is what this consumer would be if it did not read the
 *      column. RUN: the hourly document stops being due at its own hour, the
 *      per_meeting document is handed an interval nobody derived and is CHECKED.
 *      The suite FAILS 6 assertions naming both — "the next check is the HOURLY
 *      document's own interval, not a global one" (want 3600000 got 86400000),
 *      "only the HOURLY document is due one hour on" (want ["INFO-2026-0801-hourly"]
 *      got []), "the weekly document is not due at one hour" (want 1 got 0), "it is
 *      NOT given an interval and NOT checked" (want false got true), "it is reported
 *      UNSCHEDULED by name" (want ["INFO-2026-0803-meeting"] got []) and "with the
 *      reason stated rather than a guessed interval". 53 pass, 6 fail.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { MONITOR_FREQ } from "../checks/bio-checks.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const SOURCE = readFileSync(SRC, "utf8");
const STORE_SRC = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
const WRANGLER = readFileSync(fileURLToPath(new URL("../wrangler.jsonc", import.meta.url)), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* ------------------------------------------------------------------ *
 * BLOCK 1 — gap (a): the plane's own config carries the SELF binding.
 *
 * Asserted against the CONFIG FILE because that is what a deploy uploads.
 * The live half of the item's acceptance (`npx wrangler deployments list`
 * showing the binding on the deployed Worker) is a DEPLOY-time check and is
 * gated to Bob; it is not attempted here and this assertion does not stand
 * in for it.
 * ------------------------------------------------------------------ */
{
  console.log("\n--- gap (a): env.SELF is bound in the plane's wrangler.jsonc ---");
  /* jsonc: strip line comments, then parse. Nothing here needs a real parser. */
  const cfg = JSON.parse(WRANGLER.split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n"));
  const services = cfg.services || [];
  const self = services.find((s) => s.binding === "SELF");
  t("wrangler.jsonc declares a SELF service binding", !!self, true);
  t("and it targets this Worker itself, which is what makes it a loopback",
    self && self.service, cfg.name);
  /* The standing trap: the account pin is what stops a deploy landing in
     whatever account the machine's OAuth session happens to hold. */
  t("account_id is still pinned (this change must not touch it)",
    cfg.account_id, "20b533579290b9b93168345edd3b7f72");
  t("and the PDF_WORKER binding is still there beside it",
    services.some((s) => s.binding === "PDF_WORKER"), true);
}

/* ------------------------------------------------------------------ *
 * BLOCK 2 — every frequency the CATALOG knows has an interval decision.
 *
 * The MAP RULE applied to a vocabulary: the cadence table is keyed off
 * MONITOR_FREQ, so a frequency word the catalog gains must be given an
 * interval HERE or be explicitly unscheduled. It can never quietly inherit a
 * default, which is the whole failure mode the consumer exists to avoid.
 * ------------------------------------------------------------------ */
{
  console.log("\n--- the cadence table is held against the CATALOG's vocabulary ---");
  const lit = /static MONITOR_CADENCE_MS = \{([\s\S]*?)\n  \};/.exec(STORE_SRC);
  t("the cadence table is locatable in store.mjs", !!lit, true);
  const keys = [...lit[1].matchAll(/^\s{4}(\w+):/gm)].map((m) => m[1]);
  t("every frequency the catalog knows has an explicit entry",
    MONITOR_FREQ.filter((f) => !keys.includes(f)), []);
  t("and the table invents no frequency the catalog does not know",
    keys.filter((k) => !MONITOR_FREQ.includes(k)), []);
  t("the two that are not clocks are explicitly null, never approximated",
    /per_meeting:\s*null/.test(lit[1]) && /none:\s*null/.test(lit[1]), true);
}

/* ------------------------------------------------------------------ *
 * The fixture: a monitored Information bundle and the source behind it.
 * ------------------------------------------------------------------ */
const V1 = "the report as first captured\n";
const V2 = "the report AFTER the source changed it\n";
const LOCATOR = (n) => `https://www.oaklandca.gov/report-${n}.pdf`;

const md = (id, n, frequency) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Monitored source ${n}"`, "current_state: collected", "prior_state: null",
  "created: 2026-07-24T00:00:00Z", "last_updated: 2026-07-24T01:00:00Z",
  "produced_by:", "  mode: mechanical", "  capability_tier: daemon",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false",
  "  since: null", "  source: null",
  "visuals: []", "criticality: supporting",
  "source_status: unchanged", "source:",
  `  locator: ${LOCATOR(n)}`, "  authority: City Auditor",
  "  retrieved: 2026-07-24T00:00:00Z",
  "monitoring:", "  enabled: true", `  frequency: ${frequency}`,
  "  last_checked: null", "---", "",
  "## Summary", "", "What the report shows.", "",
  "## Provenance Notes", "", "## Session Log", "",
  "### Session 1", "", "Entry 1.", "", "## Review Notes", "",
].join("\n");

/* op=monitor compares against the register: the baseline is whatever
   provenance.json says was captured FROM this locator. Without one the tick
   honestly records "no captured baseline", which is not the clause under test. */
const provenance = (n) => JSON.stringify({
  documents: [{ locator: LOCATOR(n), capture: { sha256: sha(V1) } }],
}, null, 2);

const pkg = (id, n, frequency) => {
  const body = md(id, n, frequency), prov = provenance(n);
  return { bundleId: id, base: null, snapKey: `20260724T010000Z_${id.slice(-8)}`,
    author: "bio-daemon",
    meta: { object_type: "information", group: "believe-in-oakland",
            title: `Monitored source ${n}`, current_state: "collected",
            created: "2026-07-24T00:00:00Z", last_updated: "2026-07-24T01:00:00Z" },
    files: [{ path: "bundle.md", text: body, bytes: body.length, sha256: sha(body) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }],
    register: [] };
};

/* ------------------------------------------------------------------ *
 * BLOCK 3 + 4 — gap (b): op=monitor gets its caller, at each document's
 * own cadence, with NO operator action.
 * ------------------------------------------------------------------ */
{
  let MF;
  let served = V1;
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRC, script: SOURCE,
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: {
      ADMIN_TOKEN: "adm-mc", MEMBER_TOKEN: "mem-mc", PROBE_TOKEN: "prb-mc", VERSION: "test",
      GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0",
      /* CAP-3's archive-monitor pinned far out of the test window, so only the
         hand-driven onAlarm exercises anything here. */
      MONITOR_TICK_MS: "3600000",
    },
    serviceBindings: { SELF: async (request) => MF.dispatchFetch(request) },
    outboundService(request) {
      const u = new URL(request.url);
      if (u.hostname === "www.oaklandca.gov") return new Response(served);
      return new Response("unscripted", { status: 500 });
    },
  });
  MF = mf;
  try {
    const ns = await mf.getDurableObjectNamespace("STORE");
    const obj = ns.get(ns.idFromName("bio"));
    const post = async (op, body) => (await mf.dispatchFetch(`http://x/api/?op=${op}&token=adm-mc`,
      { method: "POST", body: JSON.stringify(body) })).json();
    const image = async (id) => (await (await mf.dispatchFetch(
      `http://x/api/?op=image&id=${id}&token=adm-mc`)).json()).result;

    console.log("\n--- an instance with monitoring configured but NOTHING monitored holds no alarm ---");
    /* Asserted BEFORE anything is promoted, so the self-terminating property is
       measured on the state it is claimed for rather than inferred later. */
    const idle = await obj.onAlarm(Date.now());
    t("with no monitored document the cadence consumer is not even DUE, so it does not run",
      idle.monitorcadence, undefined);
    t("the reconcile asks for no wake at all", idle.nextAt, null);
    t("and the alarm is actually cleared, not merely un-followed",
      await obj.schedAlarmAt(), null);

    console.log("\n--- gap (b): a monitored document ARMS the one alarm, with no operator action ---");
    const HOURLY = "INFO-2026-0801-hourly";
    const created = await post("promote", pkg(HOURLY, "a", "hourly"));
    t("the monitored bundle is created", created.result.ok, true);
    t("promoting a monitored document arms the one alarm (an idle instance would never wake to check it)",
      typeof (await obj.schedAlarmAt()) === "number", true);

    console.log("\n--- a CHANGED SOURCE produces a monitor-tick, with no operator action ---");
    /* The source moves under us. Nothing in this suite calls op=monitor: the
       alarm is the only actor from here. */
    served = V2;
    const fired = await obj.onAlarm(Date.now());
    const mc = fired.monitorcadence;
    t("the cadence consumer is configured (SELF binding + daemon token reached the DO)",
      mc.configured, true);
    t("it found the never-checked document due", mc.candidates, 1);
    t("exactly one document was ticked", mc.ticked.length, 1);
    t("the tick names the document", mc.ticked[0] && mc.ticked[0].bundle, HOURLY);
    t("and it read the cadence off THAT document", mc.ticked[0] && mc.ticked[0].frequency, "hourly");
    t("the source is reported MODIFIED — a changed source produced a tick",
      mc.ticked[0] && mc.ticked[0].status, "modified");
    t("and the tick RAISED the re-evaluation flag rather than capturing the new bytes",
      mc.ticked[0] && mc.ticked[0].reeval_raised, true);
    t("nothing failed", mc.failed, []);

    const img = await image(HOURLY);
    t("the record now says the source moved",
      /^source_status: modified$/m.test(img["bundle.md"]), true);
    const hist = Object.keys(img).filter((k) => k.startsWith("_history/promotion_"))
      .map((k) => JSON.parse(img[k]));
    const tickRec = hist.filter((h) => h.operation === "monitor-tick");
    t("a monitor-tick promotion record is in the history, written by nobody's hand",
      tickRec.length, 1);
    t("declared mechanical", tickRec[0] && tickRec[0].writer, "mechanical");
    t("and attributed to the monitor, not to a member", tickRec[0] && tickRec[0].author, "bio-monitor");

    /* Everything after this is computed FROM the instant op=monitor stamped, so
       the chain is deterministic without pinning the record's own clock. */
    const lastChecked = /^\s+last_checked: (\S+)$/m.exec(img["bundle.md"]);
    t("the tick wrote monitoring.last_checked, which is what the next cadence reads",
      !!lastChecked, true);
    const LAST = Date.parse(lastChecked[1]);

    console.log("\n--- PER-DOCUMENT cadence: the interval is the document's own ---");
    const WEEKLY = "INFO-2026-0802-weekly";
    t("a second monitored document is created, declaring a DIFFERENT frequency",
      (await post("promote", pkg(WEEKLY, "b", "weekly"))).result.ok, true);
    /* Bring the weekly document to a checked state so both have a last_checked
       and only their DECLARED interval separates them. */
    const seed = await obj.onAlarm(LAST + 1000);
    t("the never-checked weekly document is checked once", seed.monitorcadence.ticked.map((x) => x.bundle), [WEEKLY]);
    const wImg = await image(WEEKLY);
    const WLAST = Date.parse(/^\s+last_checked: (\S+)$/m.exec(wImg["bundle.md"])[1]);

    const midHour = await obj.onAlarm(LAST + 1800000);          // half an hour on
    t("half an hour on, NEITHER document is due", midHour.monitorcadence, undefined);
    t("and the alarm is re-armed rather than dropped",
      typeof midHour.nextAt === "number", true);
    t("the next check is the HOURLY document's own interval, not a global one",
      midHour.nextAt - LAST, 3600000);

    /* NONE is the honest reading of "the consumer did not run at all", which is
       what negative control (b) produces at this instant; without it the control
       crashes the suite instead of naming what it broke. */
    const NONE = { ticked: [], skipped: [], failed: [], unscheduled: [], candidates: 0, monitored: 0 };
    const atHour = (await obj.onAlarm(LAST + 3600000 + 1)).monitorcadence || NONE;
    t("only the HOURLY document is due one hour on",
      atHour.ticked.map((x) => x.bundle), [HOURLY]);
    t("the weekly document is not due at one hour", atHour.candidates, 1);

    const atWeek = (await obj.onAlarm(WLAST + 604800000 + 1)).monitorcadence || NONE;
    t("at one WEEK on the weekly document is due too",
      atWeek.ticked.map((x) => x.bundle).includes(WEEKLY), true);

    console.log("\n--- a cadence this plane cannot compute is STATED, never approximated ---");
    const MEETING = "INFO-2026-0803-meeting";
    t("a per_meeting document is created", (await post("promote", pkg(MEETING, "c", "per_meeting"))).result.ok, true);
    /* Driven at an instant where the two CLOCKED documents are due, because the
       unscheduled list rides the tick's own account of itself: an instance where
       NOTHING is schedulable holds no alarm and so reports nothing, which is
       stated at the code site as a known limit of this item. */
    const un = (await obj.onAlarm(WLAST + 604800000 * 2)).monitorcadence || NONE;
    t("it is counted among the monitored documents",
      un.monitored >= 3, true);
    t("it is NOT given an interval and NOT checked",
      un.ticked.map((x) => x.bundle).includes(MEETING), false);
    t("it is reported UNSCHEDULED by name, so an operator sees it is not being checked",
      un.unscheduled.map((u) => u.bundle), [MEETING]);
    t("with the reason stated rather than a guessed interval",
      un.unscheduled[0] && un.unscheduled[0].reason,
      "cadence is a meeting schedule this plane does not hold");
  } finally {
    await mf.dispose();
  }
}

/* ------------------------------------------------------------------ *
 * BLOCK 5 — an instance with NO SELF binding holds no alarm.
 *
 * The other half of "no monitoring configured": a monitored document exists,
 * but the binding does not, so both firing consumers are inert. This is the
 * state MACHINE-PROCESSES.md §0 measured on every deployed instance, and the
 * property that makes it SAFE to ship the consumers before the installer
 * provisions the binding.
 * ------------------------------------------------------------------ */
{
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRC, script: SOURCE,
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: "adm-nb", MEMBER_TOKEN: "mem-nb", PROBE_TOKEN: "prb-nb", VERSION: "test" },
    /* NO serviceBindings: this is an instance the installer has not wired. */
  });
  try {
    const ns = await mf.getDurableObjectNamespace("STORE");
    const obj = ns.get(ns.idFromName("bio"));
    console.log("\n--- an instance with NO SELF binding holds no alarm, however much it monitors ---");
    const r = await (await mf.dispatchFetch("http://x/api/?op=promote&token=adm-nb",
      { method: "POST", body: JSON.stringify(pkg("INFO-2026-0804-unwired", "a", "hourly")) })).json();
    t("a monitored document is promoted on the unwired instance", r.result.ok, true);
    const a = await obj.onAlarm(Date.now());
    t("the cadence consumer is not DUE and does not run, however many documents ask to be monitored",
      a.monitorcadence, undefined);
    t("the reconcile asks for no wake", a.nextAt, null);
    t("and the alarm is cleared: an unwired instance costs nothing on a Free tier",
      await obj.schedAlarmAt(), null);
  } finally {
    await mf.dispose();
  }
}

/* ------------------------------------------------------------------ *
 * BLOCK 6 — the IDEMPOTENCE KEY: a retry does not manufacture corroboration.
 *
 * MACHINE-PROCESSES.md risk 2, reproduced and closed. Two failing documents are
 * eligible for the archive fallback. The first fires and succeeds; the second's
 * CDX lookup fails, so the tick did NOT finish — which is precisely the state an
 * alarm retry arrives in. The retry must re-attempt the failure and must NOT
 * re-fire the success, because that success incremented observations.
 *
 * ONE FIXTURE DETAIL IS LOAD-BEARING, and it is real rather than contrived: the
 * archived record's `original` carries a query parameter, so the archive success
 * is recorded against a DIFFERENT normalised address than the failing one and the
 * failing run is NOT reset. Without that, the succeeded address drops out of
 * eligibility on its own and the retry would fire nothing WHETHER OR NOT the key
 * existed — an outcome that costs nothing to produce, and a control that would
 * pass while proving nothing. The suite asserts the address is still eligible at
 * retry time so the skip is doing real work.
 * ------------------------------------------------------------------ */
{
  const A = "https://www.oaklandca.gov/agenda.pdf";
  const A_ARCHIVED = "https://www.oaklandca.gov/agenda.pdf?ver=2";
  const B = "https://www.oaklandca.gov/budget.pdf";
  const ARCHIVED = new Uint8Array(4096).map((_, i) => (i * 31 + 7) % 256);
  const CDX_A = JSON.stringify([
    ["urlkey", "timestamp", "original", "mimetype", "statuscode", "digest", "length"],
    ["gov,oaklandca)/agenda.pdf", "20240115120000", A_ARCHIVED, "application/pdf", "200", "MFCJ5MFCJ5MFCJ5MFCJ5MFCJ5MFCJ5MF", "4096"],
  ]);
  let MF;
  let bServes500 = true;
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRC, script: SOURCE,
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: {
      ADMIN_TOKEN: "adm-idem", MEMBER_TOKEN: "mem-idem", PROBE_TOKEN: "prb-idem", VERSION: "test",
      GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0",
      MONITOR_TICK_MS: "3600000",
    },
    serviceBindings: { SELF: async (request) => MF.dispatchFetch(request) },
    outboundService(request) {
      const u = new URL(request.url);
      if (u.hostname === "web.archive.org" && u.pathname === "/cdx/search/cdx") {
        const target = u.searchParams.get("url") || "";
        if (target.includes("budget.pdf") && bServes500)
          return new Response("archive is having a day", { status: 500 });
        if (target.includes("budget.pdf"))
          return new Response(JSON.stringify([["urlkey", "timestamp", "original", "mimetype", "statuscode", "digest", "length"]]),
            { headers: { "content-type": "application/json" } });
        return new Response(CDX_A, { headers: { "content-type": "application/json" } });
      }
      if (u.hostname === "web.archive.org" && u.pathname.includes("id_/"))
        return new Response(ARCHIVED, { headers: { "content-type": "application/pdf" } });
      return new Response("unscripted", { status: 500 });
    },
  });
  MF = mf;
  try {
    const ns = await mf.getDurableObjectNamespace("STORE");
    const obj = ns.get(ns.idFromName("bio"));
    const rec = async (b) => (await (await obj.fetch("http://x/recordsourceoutcome",
      { method: "POST", body: JSON.stringify(b) })).json()).result;
    const reach = async (addr) => (await (await obj.fetch(
      `http://x/sourcereach?address=${encodeURIComponent(addr)}`)).json()).result;
    const obs = async (addr) => (await obj.capturedLocators({ addressNorm: addr })).observations;

    console.log("\n--- two documents reach the archive-fallback threshold ---");
    for (const addr of [A, B])
      for (const o of ["source_refused", "fetch_failed", "source_refused"])
        await rec({ addressNorm: addr, outcome: o });
    t("both are fallback_eligible", [(await reach(A)).fallback_eligible, (await reach(B)).fallback_eligible],
      [true, true]);

    console.log("\n--- tick 1: one fires and succeeds, one FAILS, so the tick did not finish ---");
    const T1 = Date.now();
    const first = (await obj.onAlarm(T1)).monitor;
    t("both were found eligible", first.eligible.sort(), [A, B].sort());
    t("one fallback fired and landed", first.fired.map((f) => f.address), [A]);
    t("grade C, the two-hop archive chain", [first.fired[0].grade, first.fired[0].hops], ["C", 2]);
    t("and one failed", first.failed.map((f) => f.address), [B]);
    t("the archive success recorded ONE observation", await obs(A_ARCHIVED), 1);
    t("the failed tick keeps its epoch OPEN, so the next fire is its retry",
      typeof first.epoch === "number", true);
    /* The guard against a control that costs nothing: if the succeeded address
       had dropped out of eligibility the retry would fire nothing anyway. */
    t("and the address that succeeded is STILL eligible, so a retry really would re-fire it",
      (await reach(A)).fallback_eligible, true);

    console.log("\n--- the retry: it fires NOTHING again, and manufactures no corroboration ---");
    bServes500 = false;                       // the Archive is answering again
    const retry = (await obj.onAlarm(T1 + 90000)).monitor;   // a retry arrives with a LATER now
    t("the retry reuses the SAME tick epoch (a retry is not a new tick)", retry.epoch, first.epoch);
    t("the retry does NOT re-fire the address that already succeeded",
      retry.skipped.includes(A), true);
    t("the retry fired nothing new", retry.fired.map((f) => f.address), []);
    t("and observations is NOT inflated by the retry", await obs(A_ARCHIVED), 1);
    /* The address whose fire FAILED is claimed too, and deliberately: a fire that
       reported a failure may still have got far enough to record an observation
       (op=acquire files the locator before it answers), so releasing the claim
       would re-open the very hazard the key closes. Its next attempt is its next
       SCHEDULED tick, which is what an hourly cadence is for. */
    t("and the address that failed is not re-attempted inside the same tick either",
      retry.skipped.includes(B), true);

    console.log("\n--- the key is idempotence, not amnesia: the next CADENCE really re-checks ---");
    /* One whole MONITOR_TICK_MS on, the open epoch is spent. Without this the key
       would mute a document for good the first time a tick failed beside it. */
    const later = (await obj.onAlarm(T1 + 3600000 + 1)).monitor;
    t("a tick one whole cadence later mints a NEW epoch", later.epoch !== first.epoch, true);
    t("and re-checks the address, which is what a monitor is for",
      later.fired.map((f) => f.address), [A]);
    t("so the second genuine check is a second genuine observation",
      await obs(A_ARCHIVED), 2);
  } finally {
    await mf.dispose();
  }
}

console.log(`\nmonitor-cadence: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
