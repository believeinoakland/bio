/* monitoring R14–R18: the cadence (which frequency governs, the subject of a schedule, the plan). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, serve, DAEMON, NOW_MS } from "./fixture.mjs";
import { cadenceFor, monitorIntervalMs, CONTRACT_FREQUENCY, MONITOR_CADENCE_MS } from "../../../src/monitoring/index.mjs";
import { MONITOR_FREQ } from "../../../checks/bio-checks.mjs";

const HOUR = 3600000, DAY = 24 * HOUR;
/* A receipt at an address, through provenance's one writer (the version chain R15 groups by). */
const receipt = (w, addr, cap, at) => w.prov.recordReceipt({ address: addr, addressNorm: addr, captureSha: cap, retrieved: at,
  via: "direct", retrievalLocator: addr, context: { authorityKind: "sweep", authority: "x", actorClass: "plane", actor: null, observe: false } });
const iso = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, "Z");

test("R14 which frequency governs: an authored word the catalogue knows; an unknown authored word is undetermined; else the contract read; else undetermined; the intervals", () => {
  for (const f of MONITOR_FREQ) assert.deepEqual(cadenceFor(f, null).frequency, f);
  assert.equal(cadenceFor("daily", { contract: "substance" }).source, "authored", "authored governs over the contract");
  const u = cadenceFor("fortnightly", { contract: "substance" });
  assert.deepEqual([u.frequency, u.source], [null, "undetermined"]);
  assert.match(u.why, /the frequency 'fortnightly', which is not one the catalog knows/);
  assert.deepEqual([cadenceFor(null, { contract: "membership", content_type: "roster" }).frequency, cadenceFor(null, { contract: "membership" }).source],
                   ["daily", "contract"]);
  assert.equal(cadenceFor("", { contract: "substance" }).frequency, "weekly");
  const shell = cadenceFor(null, { contract: "unmonitorable" });
  assert.deepEqual([shell.frequency, shell.source], [null, "contract"]);
  assert.match(shell.why, /no check clock/);
  const none = cadenceFor(null, null);
  assert.deepEqual([none.frequency, none.source], [null, "undetermined"]);
  assert.ok(none.why);
  const odd = cadenceFor(null, { contract: "whenever" });
  assert.deepEqual([odd.frequency, odd.source], [null, "undetermined"]);
  assert.deepEqual(CONTRACT_FREQUENCY, { membership: "daily", substance: "weekly", unmonitorable: null });
  assert.deepEqual([monitorIntervalMs("hourly"), monitorIntervalMs("daily"), monitorIntervalMs("weekly"), monitorIntervalMs("monthly")],
                   [HOUR, DAY, 7 * DAY, 30 * DAY]);
  assert.deepEqual([monitorIntervalMs("per_meeting"), monitorIntervalMs("none"), monitorIntervalMs("fortnightly"), monitorIntervalMs("toString")],
                   [null, null, null, null]);
  assert.equal(MONITOR_CADENCE_MS.monthly, 30 * DAY);
});

test("R14 the tick answers the same rule the plan schedules by", async () => {
  const w = world();
  const id = "INFO-2026-0200-rule";
  const loc = "https://records.example.org/rule.txt";
  w.monitored(id, loc, "rule-v1");
  w.net.routes[loc] = serve("rule-v1");
  const r = await w.m.monitor({ bundleId: id, viewer: DAEMON, actor: DAEMON });
  const row = w.m.schedule(NOW_MS + 30 * DAY).due.find((d) => d.bundle === id) || w.m.schedule(NOW_MS + 30 * DAY).scheduled.find((d) => d.bundle === id);
  assert.equal(r.body.cadence.source, "contract");
  assert.equal(row.frequency, r.body.cadence.frequency);
  assert.equal(row.frequency_source, "contract");
  assert.equal(row.contract, r.body.cadence.contract);
});

test("R15 the subject is an address: versions group by address, the current version's frequency governs, never the shortest; newer unmonitored and disagreements stated", () => {
  const w = world();
  const addr = "https://records.example.org/calendar";
  const a = w.monitored("INFO-2026-0210-v1", addr, "cal-v1", { freq: "hourly" });
  const b = w.monitored("INFO-2026-0211-v2", addr, "cal-v2", { freq: "weekly" });
  const c = w.monitored("INFO-2026-0212-v3", addr, "cal-v3", { enabled: false });
  receipt(w, addr, a.cap, "2026-09-01T00:00:00Z");
  receipt(w, addr, b.cap, "2026-09-02T00:00:00Z");
  receipt(w, addr, c.cap, "2026-09-03T00:00:00Z");
  const s = w.m.subjects();
  const row = s.rows.find((r) => r.address === addr);
  assert.equal(s.rows.filter((r) => r.address === addr).length, 1, "one row per address");
  assert.equal(row.bundle_id, "INFO-2026-0211-v2", "the newest version that asks to be monitored is checked");
  assert.equal(row.monitor_frequency, "weekly", "the current version's frequency governs, never the shortest");
  assert.deepEqual(row.versions, ["INFO-2026-0210-v1", "INFO-2026-0211-v2", "INFO-2026-0212-v3"]);
  assert.deepEqual(row.newer_unmonitored, ["INFO-2026-0212-v3"]);
  assert.equal(row.disagreement.governs, "weekly");
  assert.deepEqual(row.disagreement.authored.map((x) => x.frequency).sort(), ["hourly", "weekly"]);
  /* last checked when any version was */
  w.st.sql.exec(`UPDATE bundles SET monitor_last_checked='2026-09-10T00:00:00Z' WHERE bundle_id='INFO-2026-0210-v1'`);
  assert.equal(w.m.subjects().rows.find((r) => r.address === addr).monitor_last_checked, "2026-09-10T00:00:00Z");
  /* a bundle with no captured address is its own subject; so is one captured at several addresses none singly its locator */
  const lone = w.monitored("INFO-2026-0213-lone", "https://records.example.org/lone", "lone-v1", { freq: "daily" });
  const multi = w.monitored("INFO-2026-0214-multi", "https://records.example.org/declared", "multi-v1", { freq: "daily" });
  receipt(w, "https://mirror-a.example.org/x", multi.cap, "2026-09-01T00:00:00Z");
  receipt(w, "https://mirror-b.example.org/x", multi.cap, "2026-09-01T00:00:00Z");
  const rows = w.m.subjects().rows;
  const l = rows.find((r) => r.bundle_id === "INFO-2026-0213-lone");
  assert.deepEqual([l.address, l.versions], [null, ["INFO-2026-0213-lone"]]);
  const m = rows.find((r) => r.bundle_id === "INFO-2026-0214-multi");
  assert.equal(m.address, null);
  assert.match(m.address_basis, /captured at 2 addresses, none of them singly its source.locator/);
  assert.ok(lone.cap);
});

test("R16 the plan: never checked is due; nothing authored and nothing read is due (unread); no interval is unscheduled with its reason; else due or next; longest-overdue first, then by id", () => {
  const w = world();
  const mk = (n, freq, lastMs) => {
    const id = `INFO-2026-02${n}-plan`;
    w.monitored(id, `https://records.example.org/p${n}`, `plan-${n}`, { freq });
    if (lastMs != null) w.st.sql.exec(`UPDATE bundles SET monitor_last_checked=? WHERE bundle_id=?`, iso(lastMs), id);
    return id;
  };
  const never = mk(20, "daily", null);
  const unread = mk(21, null, null);
  const meeting = mk(22, "per_meeting", null);
  const none = mk(23, "none", null);
  const unknown = mk(24, "fortnightly", null);
  const overdue2 = mk(25, "daily", NOW_MS - 3 * DAY);
  const overdue1 = mk(26, "hourly", NOW_MS - 2 * HOUR);
  const later = mk(27, "weekly", NOW_MS - DAY);
  const checkedUnread = mk(28, null, NOW_MS - DAY);
  const p = w.m.schedule(NOW_MS);
  const due = p.due.map((d) => d.bundle);
  assert.ok(due.includes(never));
  const u = p.due.find((d) => d.bundle === unread);
  assert.equal(u.frequency_source, "unread");
  assert.deepEqual(due.slice(0, 2).sort(), [never, unread].sort(), "never checked (due_at 0) first, then by id");
  assert.deepEqual(due.slice(0, 2), [never, unread].sort());
  assert.deepEqual(due.slice(2), [overdue2, overdue1], "then longest-overdue first");
  const un = Object.fromEntries(p.unscheduled.map((x) => [x.bundle, x.reason]));
  assert.equal(un[meeting], "cadence is a meeting schedule this plane does not hold");
  assert.equal(un[none], "no frequency declared");
  assert.match(un[unknown], /which is not one the catalog knows/);
  assert.match(un[checkedUnread], /no check has read a document at this address/);
  assert.equal(p.next, NOW_MS - DAY + 7 * DAY);
  assert.ok(!due.includes(later));
  assert.equal(p.scheduled.find((s) => s.bundle === later).next_at, p.next);
});

test.todo("R17 an address's own frequency, when set, governs over its versions' (not yet met: REC-191's stated design gap; no setting or act exists to hold an address's own frequency)");
test.todo("R18 a document whose substance has not moved across repeated checks earns a longer interval, a contract default only, stated on the plan row (not yet met: K102; no volatility measure is built)");
