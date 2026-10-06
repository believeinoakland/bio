/* following R1–R3, R18: following a body through its Legistar records. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { world, body, testView, meetingRow, itemRow, voteRow, matterRow, MEMBER, OUTSIDER, MACHINE, CLIENT, BODY_ID, T0, DAY } from "./fixture.mjs";
import { eventsAddress, itemsAddress, votesAddress, mattersAddress, matterAddress } from "../../../src/following/legistar.mjs";

const follow = (w, b, x = {}) => w.f.followBody({ body: b, from: "2026-09-01", author: MEMBER, viewer: MEMBER, ...x });

/* A body's Legistar records for 2026-09-01 to today: one meeting with one item and its votes, and one matter. */
function serveBody(w, { matter = matterRow(900), status = null } = {}) {
  w.serve(eventsAddress(CLIENT, BODY_ID, "2026-09-01"), [meetingRow(7001, "2026-09-08", "7:00 PM", status ? { EventBodyName: status } : {})]);
  w.serve(itemsAddress(CLIENT, 7001), [itemRow(8001, 7001, { EventItemMoverId: 501 })]);
  w.serve(votesAddress(CLIENT, 8001), [voteRow(9001, 8001, 501, "Content"), voteRow(9002, 8001, 502, "Not content")]);
  w.serve(mattersAddress(CLIENT, BODY_ID, "2026-09-01"), [matter]);
  w.serve(matterAddress(CLIENT, matter.MatterId), matter);
}

test("R1 followBody refuses, in order and writing nothing, a machine author, a body absent or unseen, a body with no Legistar identifier, and a bad period; unfollow ends it at its author's act", () => {
  const w = world();
  const b = body(w);
  const plain = w.entity("Port Ellery Library Board");
  const refused = [
    [{ author: MACHINE }, "MACHINE_CANNOT_FOLLOW"],
    [{ author: "" }, "MACHINE_CANNOT_FOLLOW"],
    [{ body: "ENT-2026-0999" }, "NO_SUCH_BODY"],
    [{ body: b, viewer: "nobody" }, "NO_SUCH_BODY"],
    [{ body: plain }, "NO_LEGISTAR_ID"],
    [{ from: null }, "BAD_PERIOD"],
    [{ from: "2026-02-31" }, "BAD_PERIOD"],
    [{ until: "2026-08-01" }, "BAD_PERIOD"],
    [{ cadence: "hourly" }, "BAD_FOLLOW_CADENCE"],
  ];
  for (const [x, reason] of refused) assert.equal(follow(w, x.body === undefined ? b : x.body, x).reason, reason, JSON.stringify(x));
  /* the order: a machine author is refused before an absent body, an absent body before a missing id */
  assert.equal(follow(w, "ENT-2026-0999", { author: MACHINE }).reason, "MACHINE_CANNOT_FOLLOW");
  assert.equal(follow(w, plain, { from: null }).reason, "NO_LEGISTAR_ID");
  assert.equal(w.rows(`SELECT * FROM follows`).length, 0);
  const r = follow(w, b, { until: "2026-12-31" });
  assert.equal(r.ok, true);
  assert.equal(w.f.unfollow({ follow: r.follow, author: OUTSIDER }).reason, "NOT_THE_AUTHOR");
  assert.equal(w.f.unfollow({ follow: 99, author: MEMBER }).reason, "NO_SUCH_FOLLOW");
  const u = w.f.unfollow({ follow: r.follow, author: MEMBER });
  assert.equal(u.ok, true);
  assert.equal(w.f.unfollow({ follow: r.follow, author: MEMBER }).already, true);
  assert.equal(w.f.followDue(T0), false, "an ended follow is never read");
});

test("R1 only a body and period a member follows is read: no follow, no read; the period bounds every Legistar query", async () => {
  const w = world();
  const b = body(w);
  serveBody(w);
  let t = await w.f.followTick(T0);
  assert.equal(w.fetches.length, 0);
  follow(w, b, { until: "2026-09-30" });
  w.serve(eventsAddress(CLIENT, BODY_ID, "2026-09-01", "2026-09-30"), [meetingRow(7001, "2026-09-08", "7:00 PM")]);
  w.serve(mattersAddress(CLIENT, BODY_ID, "2026-09-01", "2026-09-30"), [matterRow(900)]);
  t = await w.f.followTick(T0);
  assert.equal(t.failed.length, 0, JSON.stringify(t.failed));
  const lists = w.fetches.map((o) => decodeURIComponent(o.captureRequest.locator)).filter((l) => /\?\$filter=/.test(l));
  assert.equal(lists.length, 2);
  for (const l of lists) assert.match(l, new RegExp(`BodyId eq ${BODY_ID} and \\w+ ge datetime'2026-09-01' and \\w+ le datetime'2026-09-30'`));
  /* an open follow asks from its first day with no upper bound */
  const harbour = w.entity("Port Ellery Harbour District");
  w.identify(harbour, "legistar_body", 42);
  follow(w, harbour);
  await w.f.followTick(T0 + 1);
  assert.ok(w.fetches.some((o) => /ge datetime'2026-09-01'$/.test(decodeURIComponent(o.captureRequest.locator))));
});

test("R2 a followed body's tick reads its events, items, votes and matters, each a capture through acquire attributed to the follow, handed to legistar-reader and events.followedImport; the same bytes land nothing new", async () => {
  const w = world();
  const b = body(w);
  const p501 = w.entity("Member 501", "person");
  w.view.identifier_schemes.push({ scheme: "legistar_person", label: "PersonId", entity_kinds: ["person"], space: "person", form: "legistar-person", basis: "TEST" });
  w.view.spaces.person.forms.push({ form: "legistar-person", pattern: { re: "^(\\d+)$" }, normal: [{ group: 1 }], basis: "TEST" });
  w.identify(p501, "legistar_person", 501);
  follow(w, b);
  serveBody(w);
  const t = await w.f.followTick(T0);
  assert.equal(t.failed.length, 0, JSON.stringify(t.failed));
  /* every read is acquire's capture-request arm, by the daemon, for the follow, never with a credential (R15) */
  assert.ok(w.fetches.length >= 5);
  for (const o of w.fetches) {
    assert.equal(o.cls, "daemon");
    assert.equal(o.captureRequest.purpose, "following");
    assert.equal(o.captureRequest.credential, undefined);
  }
  for (const l of w.landed) assert.match(l.say.notes, /follow 1 \(body\)/);
  /* each Legistar list landed with its reading, and events wrote the meeting, the item within it, and the votes (the
     source's label matched to the profile's vote value, events R11) */
  const reading = w.x.readingOf(w.landed[0].filed.doc.capture.sha256).reading;
  assert.equal(reading.content_type, "legistar_api");
  assert.equal(reading.facts.endpoint, "events");
  const src = (k) => w.one(`SELECT target_id FROM event_sources WHERE source_key=?`, k)?.target_id ?? null;
  const meeting = src("legistar:event:7001"), item = src("legistar:event_item:8001");
  assert.ok(meeting && item);
  const iv = w.ev.readEvent({ eventId: item, viewer: MEMBER }).event;
  assert.deepEqual(iv.within, [meeting]);
  assert.deepEqual(iv.participants.filter((p) => p.role === "voted").map((p) => [p.entity_id, p.vote_value]), [[p501, "content"]]);
  assert.equal(w.ev.readEvent({ eventId: meeting, viewer: MEMBER }).event.by, "class:daemon");
  /* the next day: the same bytes are answered unchanged and land nothing new */
  const landed = w.landed.length;
  const t2 = await w.f.followTick(T0 + DAY);
  assert.equal(t2.captured.length, 0);
  assert.equal(t2.read[0].outcome, "unchanged");
  assert.equal(w.landed.length, landed);
  assert.ok(w.fetches.slice(-2).every((o) => /^[0-9a-f]{64}$/.test(o.captureRequest.heldSha)), "each re-read names the bytes held");
  /* a moved meeting is read, landed and imported anew */
  w.serve(eventsAddress(CLIENT, BODY_ID, "2026-09-01"), [meetingRow(7001, "2026-09-09", "7:00 PM")]);
  w.serve(mattersAddress(CLIENT, BODY_ID, "2026-09-01"), [matterRow(900)]);
  const t3 = await w.f.followTick(T0 + 2 * DAY);
  assert.ok(t3.captured.some((c) => /events\?/.test(c.address)));
  assert.equal(w.ev.readEvent({ eventId: meeting, viewer: MEMBER }).event.when.value, "2026-09-09T19:00");
});

test("R3 a matter whose enactment record differs from its last capture is captured as a new version of its Legistar address; no notice is raised here and no codifier page is read", async () => {
  const w = world();
  const b = body(w);
  follow(w, b);
  serveBody(w);
  await w.f.followTick(T0);
  const at900 = matterAddress(CLIENT, 900);
  const first = w.landed.filter((l) => l.request.locators[0] === at900);
  assert.equal(first.length, 1, "the matter's own address is captured once when first seen");
  /* nothing moved: the matter's address is not read again */
  await w.f.followTick(T0 + DAY);
  assert.equal(w.fetches.filter((o) => o.captureRequest.locator === at900).length, 1);
  /* enacted: the record moved, so a new version is captured at its address */
  const enacted = matterRow(900, { MatterStatusName: "Adopted", MatterEnactmentNumber: "O-2026-14", MatterEnactmentDate: "2026-10-07T00:00:00" });
  w.serve(mattersAddress(CLIENT, BODY_ID, "2026-09-01"), [enacted]);
  w.serve(at900, enacted);
  const t = await w.f.followTick(T0 + 2 * DAY);
  const v = t.captured.find((c) => c.address === at900);
  assert.deepEqual(v.enactment, { enactment_number: "O-2026-14", enactment_date: "2026-10-07", status: "Adopted" });
  assert.equal(w.landed.filter((l) => l.request.locators[0] === at900).length, 2);
  assert.equal(w.landed.at(-1).filed.locator, at900);
  /* every fetch is a Legistar Web API address: no rendered codifier page; the answer raises no notice */
  assert.ok(w.fetches.every((o) => o.captureRequest.locator.startsWith("https://webapi.legistar.com/")));
  assert.equal(JSON.stringify(t).includes("notice"), false);
});

test("R18 no place is named in the module's behaviour or outward text: the Legistar client, schemes, bodies and notice periods come from the view", () => {
  const dir = new URL("../../../src/following/", import.meta.url);
  for (const f of readdirSync(dir)) {
    const src = readFileSync(new URL(f, dir), "utf8");
    assert.doesNotMatch(src, /oakland|alameda|california|port ellery|ellery/i, f);
  }
  /* with no Legistar system in the view, no body is followable */
  const w = world({ view: testView({ legistar: false }) });
  const b = w.entity("Port Ellery Selectboard");
  assert.equal(follow(w, b).reason, "NO_LEGISTAR_ID");
  /* the client is read from the view: renamed there, the queries follow it */
  const v = testView();
  v.systems = v.systems.map((s) => (s.origin === "ellery.legistar" ? { ...s, hosts: s.hosts.map((h) => h.replace("ellery", "harbourtown")), ...(s.path ? { path: { re: "^/v1/harbourtown(/|$)" } } : {}) } : s));
  const w2 = world({ view: v });
  const b2 = body(w2);
  const r = follow(w2, b2);
  assert.equal(r.ok, true);
  assert.equal(w2.f.follows({ viewer: MEMBER }).items[0].subject.legistar.client, "harbourtown");
});
