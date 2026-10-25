/* monitoring R4, R8, R32 (K5148; WALK-FINAL-04B R136, R137): a removal is confirmed by a second look at least 24 hours
   after the first, a redirect that ends elsewhere is `moved`, any other non-success is `refused`, and the list row
   states the last look's outcome with the watch still due. Driven at the interface (`monitor`, `monitoring`) over the
   real record, promotion and observation log (fixture.mjs). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, serve, NOW_MS, DAEMON } from "./fixture.mjs";

const HOUR = 3600e3;
const tick = (w, id) => w.m.monitor({ bundleId: id, viewer: DAEMON, actorClass: "machine", actor: DAEMON });
const rowOf = (w, id) => w.m.monitoring({ viewer: DAEMON, now: w.clock.ms }).items.find((r) => r.bundle === id);
/* what a redirect leaves on the answer: the final address in `url`, and `redirected` */
const redirectedTo = (body, finalUrl, type = "text/plain") => () => {
  const r = new Response(body, { status: 200, headers: { "content-type": type } });
  Object.defineProperty(r, "url", { value: finalUrl });
  Object.defineProperty(r, "redirected", { value: true });
  return r;
};

test("R4 R8 an unconfirmed removal: the first 404 or 410 is stated and not flagged, removed only by a look 24 hours or more after it", async () => {
  const w = world();
  for (const [n, st] of [[1, 404], [2, 410]]) {
    const id = `INFO-2026-004${n}-gone`;
    const loc = `https://records.example.org/outcomes-gone${n}`;
    w.monitored(id, loc, `v1-gone-${n}`, { freq: "daily" });
    w.net.routes[loc] = serve("gone", "text/plain", st);
    const first = await tick(w, id);
    assert.equal(first.body.status, null, "no removal is concluded from one look");
    assert.equal(first.body.look.outcome, "unconfirmed_removal");
    assert.equal(first.body.reeval_raised, false);
    assert.equal(w.fm(id).reeval_pending.flag, false);
    assert.equal(w.fm(id).source_status, "unchanged", "the document's source_status is left as it was");
    assert.equal(w.looks().at(-1).state, "LOOKED_INDETERMINATE");
    const since = first.body.look.since;
    assert.equal(since, first.body.checked);
    /* a look inside the window stays unconfirmed, and keeps the first look's instant */
    w.clock.ms += 23 * HOUR;
    const inside = await tick(w, id);
    assert.deepEqual([inside.body.status, inside.body.look.outcome, inside.body.look.since], [null, "unconfirmed_removal", since]);
    assert.equal(inside.body.reeval_raised, false);
    /* at 24 hours from the first look it is confirmed, flagged, and read as a possible concealment */
    w.clock.ms += 1 * HOUR;
    const second = await tick(w, id);
    assert.equal(second.body.status, "removed");
    assert.equal(second.body.look.outcome, "removed");
    assert.equal(second.body.look.since, since);
    assert.equal(second.body.reeval_raised, true);
    assert.equal(w.fm(id).source_status, "removed");
    assert.equal(w.fm(id).reeval_pending.flag, true);
    assert.equal(w.looks().at(-1).state, "LOOKED_ABSENT");
    w.clock.ms += 25 * HOUR;
    const later = await tick(w, id);
    assert.equal(later.body.status, "removed", "a removal once confirmed stays confirmed while it still answers 404 or 410");
  }
});

test("R4 R8 control: a 200 after an unconfirmed 404 clears it, so a later 404 starts the window again", async () => {
  const w = world();
  const id = "INFO-2026-0043-back";
  const loc = "https://records.example.org/outcomes-back";
  w.monitored(id, loc, "v1-back", { freq: "daily" });
  w.net.routes[loc] = serve("gone", "text/plain", 404);
  assert.equal((await tick(w, id)).body.look.outcome, "unconfirmed_removal");
  w.clock.ms += 2 * HOUR;
  w.net.routes[loc] = serve("v1-back", "text/plain", 200);
  const back = await tick(w, id);
  assert.equal(back.body.status, "unchanged");
  assert.equal(back.body.look, null, "the source answered: nothing is pending");
  assert.equal(rowOf(w, id).last_look, undefined);
  w.clock.ms += 25 * HOUR;
  w.net.routes[loc] = serve("gone", "text/plain", 404);
  const again = await tick(w, id);
  assert.deepEqual([again.body.status, again.body.look.outcome, again.body.reeval_raised], [null, "unconfirmed_removal", false],
    "28 hours after the first 404, but a 200 came between: the window starts again");
});

test("R4 R8 a redirect that ends at another address is `moved`, naming the final address, its bytes compared there", async () => {
  const w = world();
  const id = "INFO-2026-0044-moved";
  const loc = "https://records.example.org/outcomes-old";
  const to = "https://records.example.org/outcomes-new";
  w.monitored(id, loc, "v1-moved");
  w.net.routes[loc] = redirectedTo("v1-moved", to);
  const same = await tick(w, id);
  assert.equal(same.body.status, "unchanged", "the bytes at the final address are those captured");
  assert.deepEqual(same.body.look, { outcome: "moved", address: to });
  assert.equal(same.body.reeval_raised, false, "a move is stated and never flagged");
  assert.equal(w.fm(id).reeval_pending.flag, false);
  assert.equal(rowOf(w, id).last_look.outcome, "moved");
  assert.equal(rowOf(w, id).last_look.address, to);
  /* the bytes are compared where the redirect ends: other bytes there are `modified`, flagged as modified is */
  w.net.routes[loc] = redirectedTo("v2-moved, other bytes", to);
  const other = await tick(w, id);
  assert.deepEqual([other.body.status, other.body.look.outcome, other.body.look.address], ["modified", "moved", to]);
  assert.equal(other.body.reeval_raised, true);
});

test("R4 R8 control: a redirect that ends at the same address is not `moved`, and a move that stops clears the row", async () => {
  const w = world();
  const id = "INFO-2026-0045-samehop";
  const loc = "https://records.example.org/outcomes-same";
  w.monitored(id, loc, "v1-same");
  w.net.routes[loc] = redirectedTo("v1-same", loc);
  const same = await tick(w, id);
  assert.equal(same.body.status, "unchanged");
  assert.equal(same.body.look, null);
  w.net.routes[loc] = redirectedTo("v1-same", "https://records.example.org/outcomes-elsewhere");
  assert.equal((await tick(w, id)).body.look.outcome, "moved");
  w.net.routes[loc] = serve("v1-same");
  assert.equal((await tick(w, id)).body.look, null, "the address answers directly again");
  assert.equal(rowOf(w, id).last_look, undefined);
});

test("R4 R8 R32 another non-success is `refused` with its reason; the list row states it and the watch is still due", async () => {
  const w = world();
  const id = "INFO-2026-0046-refused";
  const loc = "https://records.example.org/outcomes-refused";
  w.monitored(id, loc, "v1-refused", { freq: "weekly" });
  w.net.routes[loc] = serve("v1-refused");
  assert.equal((await tick(w, id)).body.status, "unchanged");
  assert.equal(rowOf(w, id).state, "scheduled", "control: a watch that was answered waits for its interval");
  assert.equal(rowOf(w, id).last_look, undefined);
  w.clock.ms += HOUR;
  w.net.routes[loc] = serve("no", "text/plain", 403);
  const r = await tick(w, id);
  assert.equal(r.body.status, null);
  assert.equal(r.body.look.outcome, "refused");
  assert.equal(r.body.look.reason, r.body.note);
  assert.equal(r.body.reeval_raised, false);
  assert.equal(w.fm(id).reeval_pending.flag, false);
  assert.equal(w.looks().at(-1).state, "LOOKED_INDETERMINATE");
  const row = rowOf(w, id);
  assert.equal(row.state, "due", "a refused watch is not pushed a week away");
  assert.deepEqual([row.last_look.outcome, row.last_look.reason], ["refused", r.body.look.reason]);
  /* the same for an unconfirmed removal */
  const gone = "INFO-2026-0047-unconfirmed";
  const gloc = "https://records.example.org/outcomes-unconfirmed";
  w.monitored(gone, gloc, "v1-unc", { freq: "weekly" });
  w.net.routes[gloc] = serve("gone", "text/plain", 404);
  await tick(w, gone);
  const grow = rowOf(w, gone);
  assert.deepEqual([grow.state, grow.last_look.outcome], ["due", "unconfirmed_removal"]);
  /* once answered, the row returns to its interval */
  w.net.routes[loc] = serve("v1-refused");
  await tick(w, id);
  const ok = rowOf(w, id);
  assert.deepEqual([ok.state, ok.last_look], ["scheduled", undefined]);
});
