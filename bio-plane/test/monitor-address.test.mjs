/* NEGATIVE CONTROL: (REC-191, RUN 2026-09-25 over origin/main 8bdf20e6 plus this item, FOUR ARMS, AN OVER-STRICTNESS ARM AND A BASELINE, each armed ALONE in src/store.mjs, each restored from a UNIQUELY-NAMED per-arm pristine copy and verified by sha256 AND cmp (6 of 6 MATCH/IDENTICAL, 3344749 bytes, pristine 334bdb9edd19e075…), declared before arming.) BASELINE: 33 pass 0 fail. (a) RESTORE THE PER-BUNDLE SELECT — `const subjects = this.#monitorSubjects();` replaced by the pre-REC-191 `SELECT bundle_id, monitor_frequency, monitor_last_checked FROM bundles WHERE monitor_enabled = 1`: DECLARED the one-address arm fails by name; ACTUAL 13/20, among them "THREE CAPTURES OF ONE ADDRESS GIVE ONE ENTRY", "the address was FETCHED once for the calendar, not three times" and every calendar arm (the documents that author nothing read unscheduled again). RECORDED, NOT SMOOTHED: under this arm "TWO ADDRESSES SHARING A TITLE GIVE TWO ENTRIES" also fails, because per-bundle entries carry no `address` field — it is NOT evidence that anything merged the twins; the twin arm is the fixture against a TITLE-grouping liar and no arm here builds that liar. (b) DROP THE FALLBACK — the CONTRACT_FREQUENCY lookup in #monitorSubjects' `cadence` replaced by `const f = undefined;`: DECLARED the calendar arm fails and the one-address arm does not; ACTUAL 30/3, exactly "A DAY AFTER ONE TICK THE CALENDAR IS DUE", "…at DAILY, set by its CONTRACT" and "…names the reading it scheduled by". (c) THE OLDEST VERSION GOVERNS — `cadence(current.monitor_frequency, …)` given `members[0].monitor_frequency`: DECLARED the disagreement arms fail; ACTUAL 31/2, "the CURRENT version's authored weekly governs, not the older hourly" and "…NOT due at its older version's HOURLY (never the shortest)". (d) DROP THE PERSIST — the `#recordMonitorAddressType` call in recordMonitorLook removed: DECLARED the calendar arm and the purge count fail; ACTUAL 29/4, the three calendar-by-contract arms and "five addresses were read, so five readings are held". (e) OVER-STRICTNESS — the current version found by `versions.findLastIndex(…)` in place of the recorded `currentAt`: MUST PASS; ACTUAL 33/0. */
/* REC-191 — MONITORING SCHEDULES AN ADDRESS, NOT A BUNDLE, AND A DOCUMENT WITH NO
 * AUTHORED FREQUENCY IS SCHEDULED BY ITS CONTRACT.
 *
 * Bob, 2026-08-06 (D-220): "Monitoring an ADDRESS is what a member means." Until
 * this item `Store#monitorCadencePlan` selected `bundles WHERE monitor_enabled=1`,
 * so three captures of one calendar were three schedules fetching one address three
 * times, and a document that authored no frequency read `unscheduled` although
 * op=monitor answered it by its content type's contract (D-65's worker finding (a)).
 *
 * BOB #31's 22:03Z ruling (quoted on REC-191's row): "the ADDRESS's own setting
 * governs; where none is set, the CURRENT version's; never the shortest; a
 * disagreement is STATED."
 *
 * ACCEPTS-WHEN (the row): three captures of one address give ONE due entry; two
 * addresses sharing a title give TWO; a calendar with no authored frequency is due a
 * day after one tick.
 *
 * DRIVEN THROUGH THE REAL CONSUMER: the one reconciling DO alarm (`onAlarm` at an
 * injected virtual `now`, scheduler.test.mjs's seam) fires op=monitor over the SELF
 * binding. The suite never calls op=monitor. Every fetch the tick makes is answered
 * by this suite's own `outboundService` stub — no real network, so the verdict does
 * not depend on the load the suite runs under (D-571's finding).
 *
 * The version chain is laid down the way versionchain.test.mjs lays it: each bundle
 * registers its own capture sha (one capture, one home: C-53.13), and the address
 * index row is written through the DO's `recordcapturedlocator` with an explicit
 * `retrieved`, so the chain's ORDER is fixed by the fixture and not by the second
 * the suite happened to run in. Promotion order is the REVERSE of chain order, so
 * insertion order cannot be mistaken for the current version.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const SOURCE = readFileSync(SRC, "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* A Legistar-shaped calendar (monitor-assess.test.mjs's fixture, meeting-calendar.mjs's
   measured shape): the __VIEWSTATE makes the aspnet stack CERTAIN, so the fetched
   document reads as `meeting_calendar`, contract `membership`. */
const row = (id, body, date) =>
  `<tr><td><a href="MeetingDetail.aspx?ID=${id}&GUID=x">${body}</a></td><td>${date}</td>`
  + `<td><a href="View.ashx?M=A&ID=${id}0">Agenda</a></td></tr>`;
const CALENDAR = [
  '<!DOCTYPE html><html><head><title>Calendar</title></head><body>',
  '<div id="ctl00_divHeader">nav</div>',
  '<form id="aspnetForm" method="post">',
  `<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="S1_${"x".repeat(300)}" />`,
  `<input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="ev-S1" />`,
  '<main id="mainContent" role="main">',
  '<input id="ctl00_lstYears_Input" name="ctl00$lstYears" value="This Month" />',
  '<table><tr><th>Name</th><th>Date</th><th>Agenda</th></tr>',
  row(101, "City Council", "9/2/2026"), row(102, "Rules Committee", "9/9/2026"),
  row(103, "Finance Committee", "9/16/2026"), row(104, "City Council", "9/23/2026"),
  '</table></main></form></body></html>',
].join("");
const PAGE = "<!DOCTYPE html><html><head><title>The Budget</title></head><body><main><p>The budget.</p></main></body></html>";

const CAL = "https://oakland.legistar.com/Calendar.aspx";
const TWIN_A = "https://www.oaklandca.gov/budget-a.html";
const TWIN_B = "https://www.oaklandca.gov/budget-b.html";
const DIS = "https://www.oaklandca.gov/policy.html";
const NEWER = "https://www.oaklandca.gov/notice.html";

const md = (id, title, locator, freq, enabled = true) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "${title}"`, "current_state: collected", "prior_state: null",
  "created: 2026-09-01T00:00:00Z", "last_updated: 2026-09-01T01:00:00Z",
  "produced_by:", "  mode: mechanical", "  capability_tier: daemon",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false",
  "  since: null", "  source: null",
  "visuals: []", "criticality: supporting",
  "source_status: unchanged", "source:",
  `  locator: ${locator}`, "  authority: City Clerk",
  "  retrieved: 2026-09-01T00:00:00Z",
  "monitoring:", `  enabled: ${enabled}`, ...(freq ? [`  frequency: ${freq}`] : []),
  "  last_checked: null", "---", "",
  "## Summary", "", "A monitored document.", "",
  "## Provenance Notes", "", "## Session Log", "",
  "### Session 1", "", "Entry 1.", "", "## Review Notes", "",
].join("\n");

/* Every version in the fixture: its bundle, the address it was captured at, the day we
   first held it, and its own capture bytes (so its own sha). Chain order is `day`. */
const V = [
  { id: "INFO-2026-0901-cal-v1", title: "Council calendar", addr: CAL, day: "2026-09-01", freq: null },
  { id: "INFO-2026-0902-cal-v2", title: "Council calendar", addr: CAL, day: "2026-09-08", freq: null },
  { id: "INFO-2026-0903-cal-v3", title: "Council calendar", addr: CAL, day: "2026-09-15", freq: null },
  /* Two DIFFERENT documents that share a title — the liar's fixture: grouping by title
     or text would merge them. */
  { id: "INFO-2026-0911-twin-a", title: "The Budget", addr: TWIN_A, day: "2026-09-02", freq: "weekly" },
  { id: "INFO-2026-0912-twin-b", title: "The Budget", addr: TWIN_B, day: "2026-09-02", freq: "weekly" },
  /* Versions that DISAGREE: the older asks hourly, the current weekly. The current
     governs, never the shortest. */
  { id: "INFO-2026-0921-dis-v1", title: "Policy", addr: DIS, day: "2026-09-03", freq: "hourly" },
  { id: "INFO-2026-0922-dis-v2", title: "Policy", addr: DIS, day: "2026-09-10", freq: "weekly" },
  /* A newer version that does NOT ask to be monitored: the monitored one is checked,
     and the newer one is STATED rather than silently passed over. */
  { id: "INFO-2026-0931-new-v1", title: "Notice", addr: NEWER, day: "2026-09-04", freq: "weekly" },
  { id: "INFO-2026-0932-new-v2", title: "Notice", addr: NEWER, day: "2026-09-11", freq: "weekly", enabled: false },
].map((v) => ({ enabled: true, ...v, cap: sha(`capture of ${v.id} at ${v.addr} on ${v.day}\n`) }));
const ids = (addr) => V.filter((v) => v.addr === addr).map((v) => v.id);

t("GROUND TRUTH GUARD: nine versions, nine distinct capture shas, nine distinct bundles",
  [V.length, new Set(V.map((v) => v.cap)).size, new Set(V.map((v) => v.id)).size], [9, 9, 9]);
t("GROUND TRUTH GUARD: two addresses share ONE title (a title-grouping liar would merge them)",
  V.filter((v) => v.title === "The Budget").map((v) => v.addr).length === 2
  && new Set(V.filter((v) => v.title === "The Budget").map((v) => v.addr)).size === 2, true);

let MF;
const fetched = [];
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: SOURCE,
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: {
    ADMIN_TOKEN: "adm-rec191", MEMBER_TOKEN: "mem-rec191", PROBE_TOKEN: "prb-rec191", VERSION: "test",
    GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0",
    /* CAP-3's archive-monitor pinned out of the window: only the cadence consumer acts. */
    MONITOR_TICK_MS: "3600000",
  },
  serviceBindings: { SELF: async (request) => MF.dispatchFetch(request) },
  /* THE SUITE'S OWN STUB: every source this tick reads is answered here. */
  outboundService(request) {
    fetched.push(request.url);
    const u = new URL(request.url);
    const html = { headers: { "content-type": "text/html; charset=utf-8" } };
    if (u.hostname === "oakland.legistar.com" && u.pathname === "/Calendar.aspx") return new Response(CALENDAR, html);
    if (u.hostname === "www.oaklandca.gov") return new Response(PAGE, html);
    return new Response("unscripted", { status: 500 });
  },
});
MF = mf;
try {
  const ns = await mf.getDurableObjectNamespace("STORE");
  const obj = ns.get(ns.idFromName("bio"));
  const post = async (op, body) => (await mf.dispatchFetch(`http://x/api/?op=${op}&token=adm-rec191`,
    { method: "POST", body: JSON.stringify(body) })).json();
  const image = async (id) => (await (await mf.dispatchFetch(
    `http://x/api/?op=image&id=${id}&token=adm-rec191`)).json()).result;
  const lastChecked = async (id) => {
    const m = /^\s+last_checked: (\S+)$/m.exec((await image(id))["bundle.md"]);
    return m && m[1] !== "null" ? m[1] : null;
  };
  const recordLocator = async (b) => (await (await obj.fetch("http://x/recordcapturedlocator",
    { method: "POST", body: JSON.stringify(b) })).json()).result;

  console.log("\n--- the fixture: nine versions at five addresses, promoted in REVERSE chain order ---");
  for (const v of [...V].reverse()) {
    const body = md(v.id, v.title, v.addr, v.freq, v.enabled);
    const r = await post("promote", {
      bundleId: v.id, base: null, snapKey: `20260901T010000Z_${v.id.slice(-10)}`, author: "bio-daemon",
      meta: { object_type: "information", group: "believe-in-oakland", title: v.title,
              current_state: "collected", created: "2026-09-01T00:00:00Z", last_updated: "2026-09-01T01:00:00Z" },
      files: [{ path: "bundle.md", text: body, bytes: body.length, sha256: sha(body) }],
      register: [{ sha256: v.cap, path: "documents/source.html", encoding: "binary", bytes: 4096 }],
    });
    if (!r.result || r.result.ok !== true) throw new Error(`promote ${v.id} refused: ${JSON.stringify(r).slice(0, 600)}`);
    const l = await recordLocator({ address: v.addr, addressNorm: v.addr, captureSha: v.cap,
                                    retrieved: `${v.day}T09:00:00Z` });
    if (!l || l.recorded !== true) throw new Error(`locator for ${v.id} not recorded: ${JSON.stringify(l).slice(0, 300)}`);
  }
  t("every version is promoted and its capture filed at its address (the chain the plan reads)", true, true);

  console.log("\n--- ONE TICK: one entry per ADDRESS, never one per bundle ---");
  const T0 = Date.now();
  fetched.length = 0;
  const first = (await obj.onAlarm(T0)).monitorcadence;
  t("the cadence consumer ran", !!first && first.configured, true);
  t("it counts eight monitored bundles (the unmonitored newer notice is not one)", first && first.monitored, 8);
  t("…standing at FIVE addresses", first && first.addresses, 5);
  t("five due entries, one per address", first && first.candidates, 5);
  const byAddr = (list, a) => (list || []).filter((e) => e.address === a);

  /* ACCEPTS-WHEN 1: three captures of one address give one due entry. */
  const cal = byAddr(first.ticked, CAL);
  t("THREE CAPTURES OF ONE ADDRESS GIVE ONE ENTRY", cal.length, 1);
  t("…which checks the CURRENT version, the newest in chain order (not the first promoted)",
    cal[0] && cal[0].bundle, "INFO-2026-0903-cal-v3");
  t("…and names every version it stands for, in chain order", cal[0] && cal[0].versions, ids(CAL));
  t("…with no authored frequency and no type read yet, it is due NOW so the check can read it",
    cal[0] && [cal[0].frequency, cal[0].frequency_source], [null, "unread"]);
  t("the address was FETCHED once for the calendar, not three times",
    fetched.filter((u) => u === CAL).length, 1);
  t("only the current version's record was ticked; the older versions were not re-checked",
    [await lastChecked("INFO-2026-0901-cal-v1"), await lastChecked("INFO-2026-0902-cal-v2"),
     typeof (await lastChecked("INFO-2026-0903-cal-v3"))], [null, null, "string"]);

  /* ACCEPTS-WHEN 2: two addresses sharing a title give two entries. */
  t("TWO ADDRESSES SHARING A TITLE GIVE TWO ENTRIES",
    [byAddr(first.ticked, TWIN_A).map((e) => e.bundle), byAddr(first.ticked, TWIN_B).map((e) => e.bundle)],
    [["INFO-2026-0911-twin-a"], ["INFO-2026-0912-twin-b"]]);

  console.log("\n--- versions that DISAGREE: the current governs, never the shortest, and it is STATED ---");
  const dis = byAddr(first.ticked, DIS);
  t("one entry for the policy address, checking its current version", dis.map((e) => e.bundle), ["INFO-2026-0922-dis-v2"]);
  t("the CURRENT version's authored weekly governs, not the older hourly",
    dis[0] && [dis[0].frequency, dis[0].frequency_source], ["weekly", "authored"]);
  t("the disagreement is STATED with every version's word",
    dis[0] && dis[0].disagreement && [dis[0].disagreement.governs, dis[0].disagreement.governed_by,
                                      dis[0].disagreement.authored],
    ["weekly", "INFO-2026-0922-dis-v2", [{ bundle: "INFO-2026-0921-dis-v1", frequency: "hourly" },
                                         { bundle: "INFO-2026-0922-dis-v2", frequency: "weekly" }]]);
  t("an address whose versions agree carries no disagreement",
    byAddr(first.ticked, TWIN_A)[0] && byAddr(first.ticked, TWIN_A)[0].disagreement, undefined);

  console.log("\n--- a NEWER version that does not ask to be monitored is STATED, not passed over ---");
  const nwT = byAddr(first.ticked, NEWER);
  t("the monitored version is the one checked (op=monitor refuses a bundle that does not ask)",
    nwT.map((e) => e.bundle), ["INFO-2026-0931-new-v1"]);
  t("…and the newer version that does not ask is NAMED on the entry",
    nwT[0] && nwT[0].newer_unmonitored, ["INFO-2026-0932-new-v2"]);
  t("…while both remain versions of the one address", nwT[0] && nwT[0].versions, ids(NEWER));
  t("nothing failed on the first tick", first.failed, []);

  console.log("\n--- ACCEPTS-WHEN 3: the calendar is due a DAY after its one tick, by its contract ---");
  const stamped = Date.parse(await lastChecked("INFO-2026-0903-cal-v3"));
  t("the tick stamped the current version's last_checked", Number.isFinite(stamped), true);
  /* Where the tick stamped nothing (a plane that never checked the calendar — negative
     control (a) is exactly that), the day is counted from the first tick instead, so the
     arms below still RUN and fail by name rather than the module dying on a NaN clock. */
  const CALLAST = Number.isFinite(stamped) ? stamped : T0;
  const NONE = { ticked: [], skipped: [], failed: [], unscheduled: [], candidates: 0, monitored: 0 };
  const hour = (await obj.onAlarm(CALLAST + 3600000 + 1)).monitorcadence || NONE;
  t("an hour on, the calendar is NOT due (it is not re-checked on every wake)",
    byAddr(hour.ticked, CAL).length, 0);
  t("…and the policy address is NOT due at its older version's HOURLY (never the shortest)",
    byAddr(hour.ticked, DIS).length, 0);
  t("…nor is the calendar reported unscheduled: a tick read its type",
    byAddr(hour.unscheduled, CAL).length, 0);
  const almost = (await obj.onAlarm(CALLAST + 86400000 - 60000)).monitorcadence || NONE;
  t("a minute short of a day, the calendar is still not due", byAddr(almost.ticked, CAL).length, 0);
  const day = (await obj.onAlarm(CALLAST + 86400000 + 1)).monitorcadence || NONE;
  const calDay = byAddr(day.ticked, CAL);
  t("A DAY AFTER ONE TICK THE CALENDAR IS DUE — one entry, its current version",
    calDay.map((e) => e.bundle), ["INFO-2026-0903-cal-v3"]);
  t("…at DAILY, set by its CONTRACT because nothing was authored",
    calDay[0] && [calDay[0].frequency, calDay[0].frequency_source], ["daily", "contract"]);
  t("…and it names the reading it scheduled by: a meeting calendar, contract membership",
    calDay[0] && [calDay[0].content_type, calDay[0].contract], ["meeting_calendar", "membership"]);
  t("the weekly twins are not due at a day", [byAddr(day.ticked, TWIN_A).length, byAddr(day.ticked, TWIN_B).length], [0, 0]);

  console.log("\n--- the address readings are DERIVED: a whole-store purge takes them ---");
  const before = (await obj.stats()).monitorAddressType;
  t("five addresses were read, so five readings are held", before, 5);
  const purged = await (await mf.dispatchFetch("http://x/api/?op=purge&confirm=bio&token=adm-rec191",
    { method: "POST" })).json();
  const after = (await obj.stats()).monitorAddressType;
  t("a whole-store purge clears them (D-113), so a later capture is read afresh",
    [purged.ok !== false, after], [true, 0]);
} finally {
  await mf.dispose();
}

console.log(`\nmonitor-address: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
