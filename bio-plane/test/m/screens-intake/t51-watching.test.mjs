/* screens-intake R46 (T51 fix round; DEC-375 C56): the `watching` screen on the real served page: every watched address, pausing and
 * resuming (state read back), what is due, and the sweeps. Each act sends the fields its owner declares. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { openWorld, members, text, main, btn, fill, press, ok, refused, word, says, saysIn, rawKeys, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

/* The scene is the real store's. An address is watched as a member watches it: it is captured on the Add screen (the world's network answers the address, an
   environment double) and watched there at a frequency (`monitorset`), and checked now (`monitor`) where it should have been checked. The sweeps are written by the
   project owner's own `sweepset` and ratified by her `sweepratify`. */
const ADDRESSES = { due: "https://oaklandca.gov/resources/street-maintenance-report-2026.html", scheduled: "https://oaklandca.gov/government/monthly-budget.html",
  unscheduled: "https://alamedacounty.org/assessor/parcel-roll.html" };
const CAN = ["contribute", "create_projects"];
async function team() {
  const t = await members({ mai: CAN, dev: ["contribute"] });
  t.world.script("https://", (req) => new Response(`<html><head><title>${new URL(req.url).pathname}</title></head><body><p>The report.</p></body></html>`,
    { status: 200, headers: { "content-type": "text/html" } }));
  return t;
}
/* captures an address on the Add screen and watches it at `freq` (when given); answers the document's bundle id */
async function watch(t, address, freq = null, as = t.mai) {
  const p = await openWorld("/app/capture/address", { world: t.world, as, screens: [...SCREENS, DOCUMENT_STUB] });
  fill(p, { "ci-address": address });
  await press(p, "acquire");
  if (freq) { fill(p, { "ci-freq": freq }); await press(p, "monitorset"); }
  return p.byOp("promote")[0].body.bundleId;
}
/* the three states a watch is in while the list is read: due (watched weekly, never checked), scheduled (watched monthly, checked now) and unscheduled (a cadence it cannot keep) */
async function watched(t) {
  const due = await watch(t, ADDRESSES.due, "weekly");
  const scheduled = await watch(t, ADDRESSES.scheduled, "monthly");
  await t.mai.act("monitor", { body: { bundleId: scheduled } });
  const unscheduled = await watch(t, ADDRESSES.unscheduled, "per_meeting");
  return { due, scheduled, unscheduled };
}
const open = (t, as = t.mai, plane = {}) => openWorld("/app/watching", { world: t.world, as, plane });
/* the sweep a project's owner defines and ratifies, as the screen sends it */
const sweepBody = (bundle, title, more = {}) => ({ bundle, title, sources: ["https://oaklandca.gov/pc"], seeds: ["https://oaklandca.gov/pc"], match: { terms: ["agenda"] },
  cadence: "weekly", budget: { per_run: 100, backlog: 900 }, reason: "The commission's reports.", ...more });

test("R46 the list: every watched address with how often, when last checked and when next due; the unscheduled and the ended stated, the counts line", async () => {
  const t = await team();
  await watched(t);
  /* the end of a watch is set by `following`'s answer to a duty's question, an act this world's door does not carry to the list; the owner's list is read as it stands and
     one ended address, as monitoring states it (R71, R32), is added to it: the one hand-written row */
  const ENDED = { state: "ended", bundle: "INFO-ended", address: "https://oaklandca.gov/old-garage-rules.html", frequency: "monthly", until: "2026-10-01", until_set: { by: "member:dev", at: "2026-09-20T10:00:00Z" } };
  const real = await t.mai.read("monitoring");
  const p = await open(t, t.mai, { monitoring: async () => ok({ ...real, items: [...real.items, ENDED], counts: { ...real.counts, ended: 1 } }) });
  const tx = text(p);
  for (const a of real.items) assert.ok(tx.includes(a.address.replace(/^https?:\/\//, "")) || tx.includes(a.address), a.address);
  assert.ok(tx.includes(ENDED.address.replace(/^https?:\/\//, "")));
  assert.deepEqual(real.counts, { due: 1, scheduled: 1, unscheduled: 1, ended: 0 }, "the owner's count of the three");
  assert.ok(says(p, "screen.watching.counts", { due: 1, scheduled: 1, unscheduled: 1, ended: 1 }));
  /* the owner makes a per-meeting watch "not scheduled" (it holds no meeting schedule), which the screen states; the words of the frequencies it can keep are drawn */
  assert.ok(tx.includes(word("monitor.freq.weekly")) && tx.includes(word("monitor.freq.monthly")));
  assert.ok(tx.includes(word("screen.watching.nr.due")));
  assert.ok(says(p, "screen.watching.unscheduled"));
  assert.ok(tx.includes("dev"), "who set the end date");
  assert.deepEqual(rawKeys(p), []);
});

test("R46 an empty list is not drawn (no zero counts, no empty section); the list act asks the record again", async () => {
  const t = await team();
  const p = await open(t);
  assert.ok(!says(p, "screen.watching.list.head") && !says(p, "screen.watching.counts", { due: 0, scheduled: 0, unscheduled: 0, ended: 0 }));
  const u = await team();
  await watched(u);
  const q = await open(u);
  const before = q.byOp("monitoring").length;
  await press(q, "monitoring");
  assert.ok(q.byOp("monitoring").length > before);
});

test("R46 pausing and resuming: the act sends paused true or false, and the state is read back; the watching runs, then is paused by whom and when", async () => {
  const t = await team();
  const admin = await t.world.signIn("admin");
  const founder = (await admin.read("memberlist")).members.find((m) => m.member_id === admin.member).handle;
  const p = await open(t, admin);
  assert.ok(says(p, "screen.watching.running"));
  assert.equal(btn(p, "monitorpause").textContent.includes(word("screen.watching.pause")), true);
  await press(p, "monitorpause", { reason: "Maintenance." });
  assert.equal(p.byOp("monitorpause")[0].body.paused, true);
  assert.equal((await admin.read("monitoring")).paused.paused, true, "the owner holds the pause");
  assert.ok(says(p, "screen.watching.paused"), "the pause read back");
  assert.ok(text(p).includes(founder) && says(p, "screen.watching.paused.effect"));
  assert.equal(btn(p, "monitorpause").textContent.includes(word("screen.watching.resume")), true);
  await press(p, "monitorpause", { reason: "Done." });
  assert.equal(p.byOp("monitorpause")[1].body.paused, false);
  assert.ok(says(p, "screen.watching.running"), "resumed, read back");
});

test("R46 a pause the plane refuses (the viewer is no longer an administrator) is refused in the owner's words and nothing changes", async () => {
  const t = await team();
  const admin = await t.world.signIn("admin");
  /* the page shows the pause to an administrator; that she has since stopped being one is no state a page opened as one can be put in, so the owner's refusal is the one scripted fault */
  const p = await open(t, admin, { monitorpause: refused("NOT_AN_ADMIN", "builder detail", 403) });
  const r = await press(p, "monitorpause", { reason: "x" });
  assert.ok(saysIn(r.slot(), "refusal.NOT_AN_ADMIN"));
  assert.ok(says(p, "screen.watching.running"));
  assert.equal((await admin.read("monitoring")).paused.paused, false, "nothing changed");
});

test("R46 what is due: monitorslate's prompt is drawn as quoted data, nothing before it is asked", async () => {
  const t = await team();
  await watched(t);
  const p = await open(t);
  assert.ok(!text(p).includes("monitored-address"));
  await press(p, "monitorslate");
  assert.ok(text(p).includes('"kind":"monitored-address"'));
  assert.ok(text(p).includes(ADDRESSES.due.replace(/^https?:\/\//, "")) || text(p).includes(ADDRESSES.due), "the due address is in the prompt the owner wrote");
  assert.ok(says(p, "screen.watching.slate.intro1") && says(p, "screen.watching.slate.intro2"));
});

test("R46 the sweeps: each by name, ratified by whom with its next run, or not ratified and so never run; none are drawn when there are none", async () => {
  const t = await team();
  const project = await t.world.recipes.project(t.mai, "The Coliseum lease");
  await t.mai.act("projectinvite", { query: { projectId: project, handle: "dev" } });
  await t.dev.act("projectjoin", { query: { projectId: project } });
  await t.mai.act("sweepset", { body: sweepBody(project, "Council agenda packets") });
  await t.mai.act("sweepset", { body: sweepBody(project, "Planning commission staff reports") });
  const sweeps = (await t.mai.read("sweeps")).sweeps;
  const council = sweeps.find((x) => x.definition.includes("Council agenda packets"));
  await t.mai.act("sweepratify", { body: { sweep: council.sweep, ratified: true, reason: "Ready." } });
  const p = await open(t);
  const tx = text(p);
  assert.ok(tx.includes("Council agenda packets") && tx.includes("Planning commission staff reports"));
  assert.ok(says(p, "screen.watching.sweep.unratified"));
  assert.ok(tx.includes("mai"), "who ratified it");
  assert.ok(says(p, "screen.watching.sweep.note1"));
  const u = await team();
  const q = await open(u);
  assert.ok(!says(q, "screen.watching.sweeps.head"));
});
