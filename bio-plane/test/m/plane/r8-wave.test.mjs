/* plane R105 G123g (fix round 9; plan section 3, job 20; diagnosis-R8-speed.md B and C; K4811 (7)), the platform check L: WITH READING TICKS RUNNING HOME TAKES 7.7 s AND QUEUE 8.3 s AGAINST 2.2-3.9 s IDLE (G117).
   On workerd under Miniflare with the REAL alarm (`r8-wave-kit.mjs`: the plane's own Store behind the counting door `wrap-entry.mjs`, a member made by the founder's acts with two to-dos of her own), a 12 MiB CSV and a
   12 MB text are uploaded and filed by her; while the object's alarm reads them tick by tick, the Queue screen's real read set (`queue`, `queue&muted=true`, `queue&count=true&background=1`, `whoami`, `bootstrap`,
   `projectlist`, as the shell issues them) is asked SIX AT A TIME through the real door, wave after wave. Asserted, counts only (R-CLOCK): a wave makes at most one derivation of the feed for the viewer (the
   clock bucket of 5 s allowed for), each read's calls to the object are within the hop table (`r8-hops.test.mjs`' ceilings: whoami 1, queue 2, bootstrap 4, projectlist 2) AND each route's `Server-Timing` states
   that count (R105's object-call counts, the red of this file: the derivations and the hops were brought to the table by round 8, G116 and G119, and hold). REPORTED, never
   asserted: each wave's p95 and longest, taken by this test's clock outside the object (the time bar of 2 s is for the control wave with no tick, when B's fix is in: five alone-runs).
   HEAVY: run alone, five runs, and on one core (R-NOLOAD). RED BY NAME until queue's single derivation (G116) and plane-2's instruments (job 37) have merged. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { startWorld, textBytes, csvBytes, MIB } from "./r8-wave-kit.mjs";
import { readCalls, doCalls } from "../control-plane/wrap-entry.mjs";

const BUCKET_MS = 5_000;
const HOPS = { queue: 2, "queue-muted": 2, "queue-count": 2, whoami: 1, bootstrap: 4, projectlist: 2 };   /* the plan's table (r8-hops.test.mjs) */
const READS = [
  ["queue", { op: "queue" }], ["queue-muted", { op: "queue", muted: "true" }], ["queue-count", { op: "queue", count: "true", background: "1" }],
  ["whoami", { op: "whoami" }], ["bootstrap", { op: "bootstrap" }], ["projectlist", { op: "projectlist" }],
];
const timing = (res) => res.headers.get("server-timing") || "";
/* R105: "in each route's Server-Timing, the object-call counts": the proposed entry `object-calls;dur=<n>` (the count, in the `dur` slot as `bytes;dur=` states bytes), the calls the request made to the object, equal to
   the counting door's own (QUESTION J-plane-1 asks BOB to name the entry; this is the best reading) */
const callsOf = (res) => { const m = /(?:^|,)\s*object-calls\s*;\s*dur\s*=\s*(\d+)/.exec(timing(res)); return m ? Number(m[1]) : null; };
const markOf = (res) => { const m = /(?:^|,)\s*queue-count\s*;\s*desc\s*=\s*"?(hit|miss)"?/i.exec(timing(res)); return m ? m[1].toLowerCase() : null; };
const hasRows = (res) => /(?:^|,)\s*rows-queue\s*(;|,|$)/.test(timing(res));
const pct = (a, q) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };

const world = await startWorld({ tag: "r8wave", handle: "wave-bea" });
const { kit, auth } = world;
after(() => kit.mf.dispose());
{   /* her two to-dos, by her own acts: a project and two check requests of herself (the seam's viewerWith) */
  const project = await kit.projectOf(auth, "Wave project");
  for (let i = 0; i < 2; i++) { const r = await kit.post(auth, "checkrequest", { target: project, member: "wave-bea", note: `check ${i}` }); assert.equal(world.R(r.body).ok, true, JSON.stringify(r.body).slice(0, 300)); }
}

/** one wave: the six reads at once; what each cost (calls to the object) and what the feed derived */
async function wave() {
  const t0 = Date.now();
  const got = await Promise.all(READS.map(async ([name, query]) => {
    const t = Date.now();
    const res = await kit.plane(`/api/?${new URLSearchParams(query)}`, { headers: auth });
    const body = await res.json();
    return { name, status: res.status, body, ms: Date.now() - t, calls: doCalls(readCalls(res)), stated: callsOf(res), mark: markOf(res), rows: hasRows(res) };
  }));
  const t1 = Date.now();
  const misses = got.filter((g) => g.name === "queue-count" && g.mark === "miss").length;
  const list = got.find((g) => g.name === "queue");
  const derivations = (list.rows ? 1 : 0) + misses;
  const crossed = Math.floor((t1 + 100) / BUCKET_MS) - Math.floor((t0 - 100) / BUCKET_MS);
  return { got, derivations, allowed: 1 + crossed, p95: pct(got.map((g) => g.ms), 0.95), longest: Math.max(...got.map((g) => g.ms)) };
}
const sayWave = (label, w) => console.log(`# R105 G123g L ${label}: derivations ${w.derivations} (at most ${w.allowed}); p95 ${w.p95} ms, longest ${w.longest} ms; calls ${w.got.map((g) => `${g.name} ${g.calls}`).join(", ")}`);
function holds(label, w) {
  for (const g of w.got) assert.equal(g.status, 200, `${label}: ${g.name}: ${JSON.stringify(g.body).slice(0, 200)}`);
  const over = w.got.filter((g) => g.calls > HOPS[g.name]).map((g) => `${g.name}: ${g.calls} calls to the object, the table allows ${HOPS[g.name]}`);
  assert.deepEqual(over, [], `${label}: calls above the hop table`);

  assert.ok(w.derivations <= w.allowed, `${label}: the wave derived the feed ${w.derivations} times for one viewer; at most ${w.allowed} (1 + the 5 s buckets crossed)`);
}

test("R105 G123g L control: a wave of the Queue screen's six reads with no tick running derives the feed once for its viewer and stays within the hop table", { timeout: 600_000 }, async () => {
  const w = await wave();
  sayWave("control (no tick)", w);
  holds("control", w);
});

test("R105 G123g L: six at a time beside a 12 MiB CSV and a 12 MB text read by the object's alarm, each wave derives the feed at most once for its viewer and every read is within the hop table ; the p95 and the longest are reported", { timeout: 1_800_000 }, async () => {
  const csv = await world.file(await world.upload(csvBytes(12 * MIB), "table.csv", "text/csv"));
  const text = await world.file(await world.upload(textBytes(12_000_060), "minutes.txt", "text/plain"));
  const waves = [];
  for (let i = 0; i < 40; i++) {
    const owed = (await world.owes(csv.sha)) + (await world.owes(text.sha));
    if (!owed && waves.length) break;
    waves.push(await wave());
    sayWave(`wave ${waves.length} (ticks owed: ${owed})`, waves[waves.length - 1]);
    await kit.later(250);
  }
  assert.ok(waves.length >= 2, `at least two waves were made while the ticks ran (${waves.length})`);
  waves.forEach((w, i) => holds(`wave ${i + 1}`, w));
  console.log(`# R105 G123g L: ${waves.length} waves; worst p95 ${Math.max(...waves.map((w) => w.p95))} ms, worst longest ${Math.max(...waves.map((w) => w.longest))} ms (reported, not asserted)`);
});

test("R105 G123g L: each route of the wave states its object-call count in Server-Timing, equal to the calls the counting door made (red until plane-2 merges the instrument); a route that cannot measure it states none, never 0", { timeout: 600_000 }, async () => {
  const w = await wave();
  const wrong = w.got.filter((g) => g.stated !== g.calls).map((g) => `${g.name}: Server-Timing states ${g.stated}, the door counted ${g.calls}`);
  assert.deepEqual(wrong, [], "the object-call count of each route (R105)");
  assert.ok(w.got.every((g) => g.stated === null || g.stated >= 1), "a stated count is never 0 (R105: NULL when unmeasured)");
});
