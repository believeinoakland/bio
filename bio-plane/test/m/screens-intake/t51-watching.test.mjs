/* screens-intake R46 (T51 fix round; DEC-375 C56): the `watching` screen on the real served page: every watched address, pausing and
 * resuming (state read back), what is due, and the sweeps. Each act sends the fields its owner declares. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, text, main, btn, press, ok, refused, word, says, saysIn, rawKeys } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const MEMBERS = ok({ members: [{ member_id: "rosa", handle: "Rosa-h" }, { member_id: "dev", handle: "Dev-h" }] });
const ITEMS = [
  { state: "due", bundle: "INFO-1", address: "oaklandca.gov/resources/street-maintenance-report-2026", frequency: "weekly", last_checked: "2026-10-07T10:00:00Z", due_at: "2026-10-14T10:00:00Z" },
  { state: "scheduled", bundle: "INFO-2", address: "oaklandca.gov/government/city-council-agendas", frequency: "per_meeting", last_checked: "2026-10-08T10:00:00Z", next_at: "2026-10-15T10:00:00Z" },
  { state: "unscheduled", bundle: "INFO-3", address: "alamedacounty.org/assessor/parcel-roll", frequency: null, reason: "a reason of the plane" },
  { state: "ended", bundle: "INFO-4", address: "oaklandca.gov/old-garage-rules", frequency: "monthly", until: "2026-10-01", until_set: { by: "member:dev", at: "2026-09-20T10:00:00Z" } }];
const LIST = (paused = { paused: false }, items = ITEMS) => ok({ ok: true, as_of: "2026-10-14T00:00:00Z", configured: true, paused, items,
  counts: { due: 1, scheduled: 1, unscheduled: 1, ended: 1 }, limit: 200, truncated: false });
const SWEEPS = ok({ ok: true, as_of: "2026-10-14T00:00:00Z", paused: { paused: false }, formats: [], sweeps: [
  { sweep: "INFO-5#council", bundle: "INFO-5", id: "council", definition: JSON.stringify({ id: "council", title: "Council agenda packets" }), ratified: true, ratified_by: "member:dev", ratified_at: "2026-10-02T10:00:00Z", due: false, next: "2026-10-15T10:00:00Z", runs: [] },
  { sweep: "INFO-5#planning", bundle: "INFO-5", id: "planning", definition: JSON.stringify({ id: "planning", title: "Planning commission staff reports" }), ratified: false, ratified_by: null, ratified_at: null, due: false, next: null, runs: [] }] });
const open = (plane = {}, o = {}) => openPage("/app/watching", { ...o, plane: { monitoring: LIST(), sweeps: SWEEPS, memberlist: MEMBERS, ...plane } });

test("R46 the list: every watched address with how often, when last checked and when next due; the unscheduled and the ended stated, the counts line", async () => {
  const p = await open();
  const t = text(p);
  for (const a of ITEMS) assert.ok(t.includes(a.address), a.address);
  assert.ok(says(p, "screen.watching.counts", { due: 1, scheduled: 1, unscheduled: 1, ended: 1 }));
  assert.ok(t.includes(word("monitor.freq.weekly")) && t.includes(word("monitor.freq.per_meeting")));
  assert.ok(t.includes(word("screen.watching.nr.due")));
  assert.ok(says(p, "screen.watching.unscheduled"));
  assert.ok(t.includes("Dev-h"), "who set the end date");
  assert.deepEqual(rawKeys(p), []);
});

test("R46 an empty list is not drawn (no zero counts, no empty section); the list act asks the record again", async () => {
  const p = await open({ monitoring: LIST({ paused: false }, []) });
  assert.ok(!says(p, "screen.watching.list.head") && !says(p, "screen.watching.counts", { due: 0, scheduled: 0, unscheduled: 0, ended: 0 }));
  const q = await open();
  const before = q.byOp("monitoring").length;
  await press(q, "monitoring");
  assert.ok(q.byOp("monitoring").length > before);
});

test("R46 pausing and resuming: the act sends paused true or false, and the state is read back; the watching runs, then is paused by whom and when", async () => {
  let paused = { paused: false };
  const p = await open({ monitoring: () => LIST(paused), monitorpause: (req) => { paused = req.body.paused ? { paused: true, by: "member:rosa", at: "2026-10-08T14:05:00Z" } : { paused: false }; return ok({ ok: true, ...paused }); } });
  assert.ok(says(p, "screen.watching.running"));
  assert.equal(btn(p, "monitorpause").textContent.includes(word("screen.watching.pause")), true);
  await press(p, "monitorpause", { reason: "Maintenance." });
  assert.equal(p.byOp("monitorpause")[0].body.paused, true);
  assert.ok(says(p, "screen.watching.paused"), "the pause read back");
  assert.ok(text(p).includes("Rosa-h") && says(p, "screen.watching.paused.effect"));
  assert.equal(btn(p, "monitorpause").textContent.includes(word("screen.watching.resume")), true);
  await press(p, "monitorpause", { reason: "Done." });
  assert.equal(p.byOp("monitorpause")[1].body.paused, false);
  assert.ok(says(p, "screen.watching.running"), "resumed, read back");
});

test("R46 a member who is not an administrator is refused in the owner's words and nothing changes", async () => {
  const p = await open({ monitorpause: refused("NOT_AN_ADMIN", "builder detail", 403) });
  const r = await press(p, "monitorpause", { reason: "x" });
  assert.ok(saysIn(r.slot(), "refusal.NOT_AN_ADMIN"));
  assert.ok(says(p, "screen.watching.running"));
});

test("R46 what is due: monitorslate's prompt is drawn as quoted data, nothing before it is asked", async () => {
  const PROMPT = 'Run these by hand.\n{"kind":"monitored-address","address":"oaklandca.gov/x"}';
  const p = await open({ monitorslate: ok({ ok: true, items: [], prompt: PROMPT }) });
  assert.ok(!text(p).includes("monitored-address"));
  await press(p, "monitorslate");
  assert.ok(text(p).includes('"kind":"monitored-address"'));
  assert.ok(says(p, "screen.watching.slate.intro1") && says(p, "screen.watching.slate.intro2"));
});

test("R46 the sweeps: each by name, ratified by whom with its next run, or not ratified and so never run; none are drawn when there are none", async () => {
  const p = await open();
  const t = text(p);
  assert.ok(t.includes("Council agenda packets") && t.includes("Planning commission staff reports"));
  assert.ok(says(p, "screen.watching.sweep.unratified"));
  assert.ok(t.includes("Dev-h"));
  assert.ok(says(p, "screen.watching.sweep.note1"));
  const q = await open({ sweeps: ok({ ok: true, sweeps: [], formats: [] }) });
  assert.ok(!says(q, "screen.watching.sweeps.head"));
});
