/* monitoring R75, R76, R77 (T51; K4189; UC-034, UC-035): a member's door to a bundle's named requests (`namedRequestSet`,
   `op=namedrequestset`), their read (`namedRequests`, `op=namedrequests`), and the one writer of `data/gathering.json`
   (`sweepHost().write`), driven at their interface over the real record, membership, promotion and capture (fixture.mjs),
   a request gathered by the cadence tick (R28) over capture's real `acquire` with the network scripted. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, serve, sweepShare, TERM_ROW, DAEMON, V, NOW_MS, infoMd } from "./fixture.mjs";
import { projectActNotParticipant } from "../promotion/fixtures.mjs";
import { monitoringOps, NAMED_REQUEST_CHECKS, GATHERING_CHECKS, MONITORING_CHECKS } from "../../../src/monitoring/index.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";

const DAY = 86400000;
const ALICE = V("alice"), CAROL = V("carol"), ZED = V("zed");
const PUB = "https://publisher.example.org/minutes.txt", MIRROR = "https://mirror.example.org/minutes.txt";
const ADDRESS = "https://records.example.org/named";
const GB = "INFO-2026-0700-named";
const GATH = "data/gathering.json";
const ask = (w, o = {}) => w.m.namedRequestSet({ bundle: GB, target: { text: "the council minutes" }, locators: [PUB],
  authority: "Town Clerk", criticality: "crucial", author: ALICE, viewer: ALICE, ...o });
const held = (w, id = GB) => { const f = w.record.readFile(id, GATH); return f ? JSON.parse(typeof f === "string" ? f : f.text) : null; };
const heldText = (w, id = GB) => { const f = w.record.readFile(id, GATH); return f ? (typeof f === "string" ? f : f.text) : null; };
/* what a refusal must leave untouched: the bundle's manifest, its document and its gathering file */
const untouched = (w, id = GB) => JSON.stringify([w.manifest(id).length, w.text(id), heldText(w, id)]);
const gatheringWorld = (o = {}, files = []) => {
  const w = world(o);
  const r = w.promote(GB, infoMd(GB, ADDRESS, { enabled: false }), { files });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  return w;
};
const gj = (g) => { const t = typeof g === "string" ? g : JSON.stringify(g); return { path: GATH, text: t, bytes: Buffer.byteLength(t), sha256: sha(t) }; };
/* the scripted network as the global fetch capture's acquire reads */
async function online(w, fn) {
  const was = globalThis.fetch;
  globalThis.fetch = w.net.fetch;
  try { return await fn(); } finally { globalThis.fetch = was; }
}
const door = (w, op, stamps, body = {}) => monitoringOps(w.m, new URL(`http://do/${op}?${new URLSearchParams(stamps)}`), body)[op]();

test("R75 a planted request is one promotion authored by the member, written as the bundle's gathering file, fetching nothing; the next cadence tick gathers it (R28); control: a retired one is not due", async () => {
  const w = gatheringWorld();
  w.net.routes[PUB] = serve("the minutes, as published");
  const n = w.manifest(GB).length;
  const before = w.text(GB);
  const r = await ask(w, { cadence: "weekly" });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.match(r.request, /^GATH-2026-\d{4,}-the-council-minutes$/);
  assert.deepEqual([r.bundle, r.status, r.revision], [GB, "open", w.record.head(GB).bundleSha]);
  /* one promotion, authored by the member, never mechanical; the file written canonically, nothing else of it moved */
  const m = w.manifest(GB);
  assert.equal(m.length, n + 1);
  assert.deepEqual([m.at(-1).author, m.at(-1).writer], [ALICE, null]);
  assert.deepEqual(held(w), { requests: [{ id: r.request, target: { text: "the council minutes" }, locators: [PUB],
    authority: "Town Clerk", criticality: "crucial", cadence: "weekly", status: "open", planted: new Date(NOW_MS).toISOString().replace(/\.\d+Z$/, "Z") }] });
  assert.equal(heldText(w), `${JSON.stringify(held(w), null, 2)}\n`);
  /* the document gains one Session Log entry and a new last_updated; every other front-matter line stands */
  const fb = parseFrontmatter(before).data, fa = w.fm(GB);
  assert.notEqual(fa.last_updated, fb.last_updated);
  assert.deepEqual({ ...fa, last_updated: fb.last_updated }, fb);
  const added = w.text(GB).split("\n").filter((l) => !before.split("\n").includes(l));
  assert.ok(added.some((l) => /^### Session /.test(l)) && added.some((l) => /Named request planted by alice: the council minutes/.test(l)), added.join("|"));
  /* it fetches nothing and ticks nothing */
  assert.equal(w.net.seen.length, 0);
  assert.equal(w.looks().length, 0);
  /* planted: due at the next cadence tick, and gathered by it */
  assert.deepEqual(w.m.gathering(NOW_MS).due.map((x) => x.id), [r.request]);
  assert.equal(w.m.cadenceDue(NOW_MS), NOW_MS);
  const t = await online(w, () => w.m.cadenceTick(NOW_MS));
  assert.deepEqual([t.gathered.due, t.gathered.captured.map((x) => x.request), t.gathered.failed], [1, [r.request], []]);
  assert.deepEqual(w.net.seen.filter((u) => u === PUB), [PUB]);
  /* control: retired by the member's revision, it is not due a week on, and nothing is fetched for it */
  const ret = await ask(w, { request: r.request, cadence: "weekly", status: "retired" });
  assert.deepEqual([ret.ok, ret.request, ret.status], [true, r.request, "retired"]);
  assert.deepEqual(w.m.gathering(NOW_MS + 8 * DAY).due, []);
  assert.equal(w.m.cadenceDue(NOW_MS + 8 * DAY), null);
  const seen = w.net.seen.length;
  const t2 = await online(w, () => w.m.cadenceTick(NOW_MS + 8 * DAY));
  assert.deepEqual([t2.gathered.due, w.net.seen.length], [0, seen]);
  /* a request planted retired is never due either */
  const planted = await ask(w, { target: { text: "the agenda" }, status: "retired" });
  assert.deepEqual([planted.ok, planted.status], [true, "retired"]);
  assert.deepEqual(w.m.gathering(NOW_MS + 8 * DAY).due, []);
});

test("R75 a revision keeps what the act does not state (its status and its planted instant); another request, the daemon block and the sweeps are carried unchanged; two requests survive each other's revision byte for byte", async () => {
  const other = { id: "GATH-2026-0001-old", target: { text: "an old one" }, locators: [MIRROR], authority: "Clerk", criticality: "supporting",
                  status: "open", planted: "2026-09-01T00:00:00Z" };
  const w = gatheringWorld({}, [gj({ daemon: { enabled: true, tick_budget: 3 }, requests: [other], sweeps: [{ id: "s1", title: "kept" }] })]);
  const a = await ask(w, { target: { text: "A" } });
  const b = await ask(w, { target: { text: "B" }, cadence: "daily" });
  assert.equal(a.ok && b.ok, true);
  assert.notEqual(a.request, b.request);
  const entry = (id, g = held(w)) => g.requests.find((x) => x.id === id);
  const snap = () => JSON.stringify(held(w).requests.map((x) => [x.id, JSON.stringify(x, null, 2)]));
  let g = held(w);
  assert.deepEqual([g.daemon, g.sweeps], [{ enabled: true, tick_budget: 3 }, [{ id: "s1", title: "kept" }]]);
  assert.deepEqual(g.requests.map((x) => x.id), [other.id, a.request, b.request], "appended in order");
  assert.deepEqual(entry(other.id, g), other, "a request nobody touched stands");
  /* revise A: B and the old one are byte for byte as they were (their block of the file) */
  const bBefore = JSON.stringify(entry(b.request), null, 2), oBefore = JSON.stringify(other, null, 2), textBefore = heldText(w);
  const planted = entry(a.request).planted;
  w.clock.ms += 3600000;
  const ra = await ask(w, { request: a.request, target: { text: "A, revised" }, locators: [PUB, MIRROR] });
  assert.equal(ra.ok, true, JSON.stringify(ra));
  g = held(w);
  assert.deepEqual([entry(a.request).target, entry(a.request).locators, entry(a.request).status, entry(a.request).planted],
    [{ text: "A, revised" }, [PUB, MIRROR], "open", planted], "status and planted are kept");
  assert.equal(JSON.stringify(entry(b.request), null, 2), bBefore);
  assert.equal(JSON.stringify(entry(other.id), null, 2), oBefore);
  assert.ok(heldText(w).includes(bBefore.split("\n").map((l) => `    ${l}`).join("\n").trimStart()), "B's block is in the file verbatim");
  assert.deepEqual([g.daemon, g.sweeps], [{ enabled: true, tick_budget: 3 }, [{ id: "s1", title: "kept" }]]);
  /* then revise B: A's revision stands byte for byte */
  const aText = JSON.stringify(entry(a.request), null, 2);
  const rb = await ask(w, { request: b.request, target: { text: "B" }, cadence: "weekly", status: "retired" });
  assert.deepEqual([rb.ok, rb.status], [true, "retired"]);
  assert.equal(JSON.stringify(entry(a.request), null, 2), aText);
  assert.equal(entry(b.request).status, "retired");
  /* a retired request revised without a status stays retired */
  const rr = await ask(w, { request: b.request, target: { text: "B, again" }, cadence: "weekly" });
  assert.deepEqual([rr.ok, rr.status, entry(b.request, held(w)).status], [true, "retired", "retired"]);
  assert.notEqual(snap(), textBefore);
});

test("R75 a revision that changes nothing answers {ok: true, existed: true} and writes nothing; control: a changed field is written", async () => {
  const w = gatheringWorld();
  const r = await ask(w, { cadence: "weekly", target: { text: "same", description: "every meeting" } });
  assert.equal(r.ok, true, JSON.stringify(r));
  const before = untouched(w);
  w.clock.ms += 5000;
  const same = await ask(w, { request: r.request, cadence: "weekly", target: { text: "same", description: "every meeting" } });
  assert.deepEqual(same, { ok: true, existed: true, bundle: GB, request: r.request, status: "open" });
  assert.equal(untouched(w), before);
  const changed = await ask(w, { request: r.request, cadence: "daily", target: { text: "same", description: "every meeting" } });
  assert.deepEqual([changed.ok, changed.existed, changed.request], [true, undefined, r.request]);
  assert.equal(held(w).requests[0].cadence, "daily");
});

test("R75 a machine credential is refused MACHINE_CANNOT_SET_REQUEST (C-18.22) before every other condition, writing nothing; control: a member's lands", async () => {
  const w = gatheringWorld();
  const before = untouched(w);
  const row = NAMED_REQUEST_CHECKS.MACHINE_CANNOT_SET_REQUEST;
  for (const author of ["", "   ", null, DAEMON, "class:admin", "token:member", "claude", "daemon"]) {
    /* the rest of the request is wrong too: the author is asked first */
    const r = await w.m.namedRequestSet({ bundle: null, locators: "http://x", author, viewer: ALICE });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
      [false, "MACHINE_CANNOT_SET_REQUEST", "MACHINE_CANNOT_SET_REQUEST", "C-18.22", row.translation], String(author));
    assert.match(r.detail, /Nothing was written\.$/);
  }
  assert.equal(untouched(w), before);
  assert.equal((await ask(w)).ok, true, "control: a member");
});

test("R75 refusals, in order, each writing nothing: required bundle, ABSENT for absent and unseen identically, NAMED_REQUEST_REFUSED (C-18.23) naming each field, NO_SUCH_REQUEST, then promotion's relayed; controls land", async () => {
  const w = world();
  w.inProject("PROJ-2026-0701-p", { owner: "carol" });
  w.promote(GB, infoMd(GB, ADDRESS, { enabled: false, lines: ["project: PROJ-2026-0701-p"] }));
  const before = untouched(w);
  /* 2: no bundle, R1's required-argument refusal (the rest wrong too) */
  for (const bundle of [null, "", 7]) {
    const r = await ask(w, { bundle, locators: "x", author: CAROL, viewer: CAROL });
    assert.deepEqual([r.ok, r.reason, r.argument, r.op], [false, "REQUIRED_ARGUMENT_MISSING", "bundle", "namedrequestset"]);
  }
  /* 3: absent and unseen alike, before the request is read */
  const absent = await ask(w, { bundle: "INFO-2026-0799-none", locators: "x", author: CAROL, viewer: CAROL });
  const unseen = await ask(w, { locators: "x", author: ZED, viewer: ZED });
  assert.deepEqual(absent, { ok: false, reason: "ABSENT", bundleId: "INFO-2026-0799-none" });
  assert.deepEqual(unseen, { ok: false, reason: "ABSENT", bundleId: GB });
  /* 4: the grammar C-18.5 judges the request by, each finding naming its field */
  const row = NAMED_REQUEST_CHECKS.NAMED_REQUEST_REFUSED;
  const arms = [
    [{ target: undefined }, "target"], [{ target: "the minutes" }, "target"], [{ target: { text: "" } }, "text"],
    [{ target: { text: "a\nb" } }, "text"], [{ target: { text: "x".repeat(201) } }, "text"],
    [{ target: { text: "t", description: "d".repeat(2001) } }, "description"],
    [{ locators: undefined }, "locators"], [{ locators: [] }, "locators"], [{ locators: "https://publisher.example.org/m" }, "locators"],
    [{ locators: ["http://publisher.example.org/m"] }, "locators"], [{ locators: ["https://127.0.0.1/m"] }, "locators"],
    [{ authority: undefined }, "authority"], [{ authority: "  " }, "authority"],
    [{ criticality: undefined }, "criticality"], [{ criticality: "urgent" }, "criticality"],
    [{ cadence: "fortnightly" }, "cadence"], [{ cadence: null }, "cadence"],
    [{ status: "captured" }, "status"], [{ status: "done" }, "status"], [{ status: null }, "status"],
    [{ request: "GATH-bad" }, "id"],
  ];
  for (const [o, field] of arms) {
    const r = await ask(w, { ...o, author: CAROL, viewer: CAROL });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
      [false, "NAMED_REQUEST_REFUSED", "NAMED_REQUEST_REFUSED", "C-18.23", row.translation], JSON.stringify(o));
    assert.ok(r.findings.length >= 1 && r.findings.every((x) => x.check === "C-18.5" || x.check), JSON.stringify(o));
    assert.match(r.detail, new RegExp(`(^|[^\\w])${field}($|[^\\w])`), `${JSON.stringify(o)}: ${r.detail}`);
    assert.match(r.detail, /Nothing was written\.$/);
  }
  /* several faults are all named */
  const many = await ask(w, { locators: [], authority: "", criticality: "x", author: CAROL, viewer: CAROL });
  assert.equal(many.findings.length, 3);
  for (const f of ["locators", "authority", "criticality"]) assert.match(many.detail, new RegExp(`\\b${f}\\b`));
  /* 5: NO_SUCH_REQUEST comes after the shape: a malformed revision of an absent request is the shape's refusal */
  assert.equal((await ask(w, { request: "GATH-2026-9999-none", criticality: "urgent", author: CAROL, viewer: CAROL })).reason, "NAMED_REQUEST_REFUSED");
  const none = await ask(w, { request: "GATH-2026-9999-none", author: CAROL, viewer: CAROL });
  assert.deepEqual([none.ok, none.reason, none.bundleId, none.request], [false, "NO_SUCH_REQUEST", GB, "GATH-2026-9999-none"]);
  assert.equal(untouched(w), before, "every refusal above wrote nothing");
  assert.equal(w.net.seen.length, 0);
  /* 6: promotion's refusals relayed as it gives them, nothing written; asked last */
  const real = w.promotion.promote;
  const refusal = projectActNotParticipant();
  const seen = [];
  w.promotion.promote = (pkg) => { seen.push(pkg); return refusal; };
  try {
    assert.equal((await ask(w, { locators: [], author: CAROL, viewer: CAROL })).reason, "NAMED_REQUEST_REFUSED");
    assert.equal(seen.length, 0, "promotion not asked before the shape is judged");
    const r = await ask(w, { author: CAROL, viewer: CAROL });
    assert.deepEqual(r, refusal);
    assert.equal(seen.length, 1);
  } finally { w.promotion.promote = real; }
  assert.equal(untouched(w), before);
  /* the member's revision: authored and stamped by the member, never mechanical */
  assert.deepEqual([seen[0].author, seen[0].actorIdentity, seen[0].actorViewer, seen[0].actorMemberId, seen[0].writer],
    [CAROL, CAROL, CAROL, "carol", undefined]);
  /* controls: the same acts, promotion admitting them, land */
  assert.equal((await ask(w, { author: CAROL, viewer: CAROL })).ok, true);
  assert.equal((await ask(w, { status: "retired", author: CAROL, viewer: CAROL })).ok, true);
});

test("R75 a file promotion refuses (R27: a request already in it that C-18.5 finds wrong) is relayed GATHERING_REFUSED with its findings, writing nothing; a mint that is refused spends no id", async () => {
  const bad = { id: "GATH-2026-0001-bad", target: { text: "bad" }, locators: [PUB], authority: "Clerk", criticality: "urgent", status: "open" };
  const w = gatheringWorld();
  const first = await ask(w);
  assert.equal(first.ok, true);
  const next = () => Number(/GATH-2026-(\d+)-/.exec(first.request)[1]) + 1;
  /* a mint refused by the write leaves the counter where it was */
  const real = w.promotion.promote;
  w.promotion.promote = () => ({ ok: false, reason: "SNAP_KEY_TAKEN" });
  try { assert.equal((await ask(w)).reason, "SNAP_KEY_TAKEN"); } finally { w.promotion.promote = real; }
  const second = await ask(w);
  assert.equal(Number(/GATH-2026-(\d+)-/.exec(second.request)[1]), next(), "no id was spent by the refused mint");
  /* a legacy request C-18.5 now finds wrong (it entered by replay) draws R27's refusal on the next write, as given */
  const rid = "INFO-2026-0702-legacy", md = infoMd(rid, ADDRESS, { enabled: false });
  const rep = w.promotion.promote({ bundleId: rid, base: null, snapKey: "20260920T000000Z_rp0007", author: ALICE, replay: true,
    meta: { object_type: "information", group: "test-group", title: `Monitored ${rid}`, current_state: "collected", created: "2026-09-20T00:00:00Z", last_updated: "2026-09-20T00:00:00Z" },
    files: [{ path: "bundle.md", text: md, bytes: Buffer.byteLength(md), sha256: sha(md) }, gj({ requests: [bad] })] });
  assert.equal(rep.ok, true, JSON.stringify(rep).slice(0, 200));
  const b = untouched(w, rid);
  const r = await ask(w, { bundle: rid });
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "GATHERING_REFUSED", "GATHERING_REFUSED", "C-18.10", GATHERING_CHECKS.GATHERING_REFUSED.translation]);
  assert.deepEqual(r.findings, [{ check: "C-18.5", detail: "gathering.json requests[0].criticality must be one of: crucial, supporting" }]);
  assert.equal(untouched(w, rid), b);
});

test("R75 op=namedrequestset: the author and viewer are the control plane's stamps from the query, never the body's; the machine class is refused whatever the body says", async () => {
  const w = gatheringWorld();
  const body = { bundle: GB, target: { text: "by the door" }, locators: [PUB], authority: "Clerk", criticality: "supporting", author: ALICE, viewer: ALICE };
  const before = untouched(w);
  const forged = await door(w, "namedrequestset", { author: DAEMON, viewer: DAEMON }, body);
  assert.equal(forged.reason, "MACHINE_CANNOT_SET_REQUEST");
  assert.equal(untouched(w), before);
  const ok = await door(w, "namedrequestset", { author: ALICE, viewer: ALICE }, { ...body, author: DAEMON, request: undefined });
  assert.deepEqual([ok.ok, ok.status], [true, "open"]);
  assert.equal(w.manifest(GB).at(-1).author, ALICE);
  /* a body carries nothing into the file but the request's own fields */
  const sneaky = await door(w, "namedrequestset", { author: ALICE, viewer: ALICE },
    { ...body, target: { text: "t", injected: "x" }, extra: "y", daemon: { enabled: false } });
  assert.equal(sneaky.ok, true);
  const g = held(w);
  assert.equal(g.daemon, undefined);
  assert.deepEqual(g.requests.at(-1).target, { text: "t" });
  assert.equal("extra" in g.requests.at(-1), false);
});

test("R76 a planted request lists due; after a gather it lists its attempt and next; control: an unseen bundle's request is absent and uncounted", async () => {
  const w = world();
  w.inProject("PROJ-2026-0710-p", { owner: "carol" });
  const seenB = "INFO-2026-0710-seen", hiddenB = "INFO-2026-0711-hidden";
  w.promote(seenB, infoMd(seenB, ADDRESS, { enabled: false }));
  w.promote(hiddenB, infoMd(hiddenB, ADDRESS, { enabled: false, lines: ["project: PROJ-2026-0710-p"] }));
  w.net.routes[PUB] = serve("minutes");
  const a = await ask(w, { bundle: seenB, cadence: "weekly" });
  const hidden = await ask(w, { bundle: hiddenB, target: { text: "private" }, author: CAROL, viewer: CAROL });
  assert.equal(a.ok && hidden.ok, true);
  const planted = new Date(NOW_MS).toISOString().replace(/\.\d+Z$/, "Z");
  const read = () => w.m.namedRequests({ viewer: ALICE });
  let r = read();
  assert.equal(r.ok, true);
  assert.deepEqual(r.items.map((x) => x.request), [a.request], "the unseen bundle's request is neither answered ...");
  assert.deepEqual(r.counts, { due: 1 }, "... nor counted");
  assert.deepEqual(r.items[0], { bundle: seenB, request: a.request, target: { text: "the council minutes" }, locators: [PUB],
    authority: "Town Clerk", criticality: "crucial", cadence: "weekly", status: "open", planted, last_attempt: null, daemon: null,
    due: true, next: null, state: "due" });
  assert.deepEqual(r.paused, { paused: false });
  /* control: its own project's member sees both */
  assert.deepEqual(w.m.namedRequests({ viewer: CAROL }).items.map((x) => x.request).sort(), [a.request, hidden.request].sort());
  assert.deepEqual(w.m.namedRequests({ viewer: ZED }).items.map((x) => x.request), [a.request], "a stranger sees the open bundle's only");
  /* after a gather: its attempt, and next by R14's weekly interval */
  const t = await online(w, () => w.m.cadenceTick(NOW_MS));
  assert.deepEqual(t.gathered.captured.map((x) => x.request).sort(), [a.request, hidden.request].sort(), "the daemon gathers both");
  r = read();
  assert.deepEqual([r.items[0].due, r.items[0].next, r.items[0].state], [false, new Date(NOW_MS + 7 * DAY).toISOString().replace(/\.\d+Z$/, "Z"), "scheduled"]);
  assert.deepEqual(r.items[0].last_attempt, { at: planted, outcome: "captured", locator: PUB });
  /* due again a week on */
  w.clock.ms = NOW_MS + 7 * DAY;
  assert.deepEqual([read().items[0].due, read().items[0].next], [true, null]);
});

test("R76 the request's clock by R28's rule: no cadence runs once and is done; none is unscheduled with its reason; a retired one is closed; the bundle's daemon block and a pause are stated", async () => {
  const w = gatheringWorld();
  w.net.routes[PUB] = serve("minutes");
  const once = await ask(w, { target: { text: "once" } });
  const none = await ask(w, { target: { text: "never" }, cadence: "none" });
  const ret = await ask(w, { target: { text: "retired" }, status: "retired" });
  const by = (id) => w.m.namedRequests({ viewer: ALICE }).items.find((x) => x.request === id);
  assert.deepEqual([by(once.request).state, by(once.request).due, by(none.request).state, by(none.request).due, by(ret.request).state, by(ret.request).due],
    ["due", true, "unscheduled", false, "closed", false]);
  assert.match(by(none.request).unscheduled, /cadence is none/);
  assert.match(by(ret.request).unscheduled, /retired/);
  await online(w, () => w.m.cadenceTick(NOW_MS));
  assert.deepEqual([by(once.request).state, by(once.request).due, by(once.request).next], ["done", false, null], "run once, and it has run");
  assert.equal(by(once.request).last_attempt.outcome, "captured");
  assert.equal(by(none.request).last_attempt, null, "a request the daemon does not run has no attempt");
  /* the pause is stated */
  assert.equal(w.m.pause({ paused: true, by: "class:admin" }).ok, true);
  const paused = w.m.namedRequests({ viewer: ALICE });
  assert.deepEqual([paused.paused.paused, paused.paused.by], [true, "class:admin"]);
  assert.equal(w.m.pause({ paused: false, by: "class:admin" }).ok, true);
  assert.equal(w.m.namedRequests({ viewer: ALICE }).paused.paused, false, "control: resumed");
  /* the bundle's daemon block: enabled false is stated on each of its requests, and the block rides on them */
  const off = await w.m.sweepHost().write({ bundle: GB, author: ALICE, viewer: ALICE, log: "daemon block set for the test.",
    mutate: (g) => { g.daemon = { enabled: false, tick_budget: 2 }; return g; } });
  assert.equal(off.ok, true, JSON.stringify(off));
  const off1 = by(once.request);
  assert.deepEqual([off1.state, off1.daemon], ["disabled", { enabled: false, tick_budget: 2 }]);
  assert.match(off1.disabled, /enabled: false/);
  assert.equal(by(once.request).due, false);
  assert.deepEqual(by(none.request).daemon, { enabled: false, tick_budget: 2 });
});

test("R76 never throws and writes nothing: a read that cannot be made answers ok: false in words; a gathering file the viewer sees that is not JSON is skipped", async () => {
  const w = gatheringWorld();
  const a = await ask(w);
  const before = untouched(w);
  assert.equal(w.m.namedRequests({ viewer: ALICE }).ok, true);
  assert.equal(untouched(w), before, "a read writes nothing");
  /* a bundle whose gathering file is unparsable (it entered by replay) is skipped, not fatal */
  const rid = "INFO-2026-0720-junk", md = infoMd(rid, ADDRESS, { enabled: false });
  const rep = w.promotion.promote({ bundleId: rid, base: null, snapKey: "20260920T000000Z_rp0008", author: ALICE, replay: true,
    meta: { object_type: "information", group: "test-group", title: `Monitored ${rid}`, current_state: "collected", created: "2026-09-20T00:00:00Z", last_updated: "2026-09-20T00:00:00Z" },
    files: [{ path: "bundle.md", text: md, bytes: Buffer.byteLength(md), sha256: sha(md) }, gj("{not json")] });
  assert.equal(rep.ok, true, JSON.stringify(rep).slice(0, 200));
  assert.deepEqual(w.m.namedRequests({ viewer: ALICE }).items.map((x) => x.request), [a.request]);
  /* a store that cannot be read: the read answers in words and does not throw */
  const sql = w.m.sql;
  w.m.sql = { exec() { throw new Error("storage went away"); } };
  try {
    const r = w.m.namedRequests({ viewer: ALICE });
    assert.deepEqual([r.ok, r.items, r.truncated], [false, [], false]);
    assert.match(r.detail, /could not be read: storage went away/);
  } finally { w.m.sql = sql; }
  assert.equal(w.m.namedRequests({ viewer: ALICE }).ok, true, "control");
});

test("R76 op=namedrequests reads through the viewer stamp, never the body's", async () => {
  const w = gatheringWorld();
  const a = await ask(w);
  const r = await door(w, "namedrequests", { viewer: ALICE }, { viewer: ZED });
  assert.deepEqual([r.ok, r.items.map((x) => x.request)], [true, [a.request]]);
});

test("R77 sweepHost().write({bundle, mutate, author, viewer, log}): a request write and a sweep write, in either order, leave the other's array byte for byte as it was; the Session Log carries log", async () => {
  const share = sweepShare();
  for (const requestFirst of [true, false]) {
    const w = gatheringWorld();
    assert.deepEqual(w.m.registerSweep("link-sweep", share), { ok: true, module: "link-sweep" });
    const host = w.m.sweepHost();
    assert.equal(typeof host.write, "function");
    const sweep = (id, title) => host.write({ bundle: GB, author: ALICE, viewer: ALICE, log: `Sweep ${id} set for the test.`,
      mutate: (g) => { g.sweeps = [...(Array.isArray(g.sweeps) ? g.sweeps : []), { id, title }]; return g; } });
    const steps = requestFirst ? [() => ask(w, { target: { text: "first" } }), () => sweep("s1", "one")]
                               : [() => sweep("s1", "one"), () => ask(w, { target: { text: "first" } })];
    for (const step of steps) { const r = await step(); assert.equal(r.ok, true, JSON.stringify(r)); }
    const arrays = () => { const g = held(w); return [JSON.stringify(g.requests, null, 2), JSON.stringify(g.sweeps, null, 2)]; };
    const [reqBefore, swBefore] = arrays();
    /* now each writes again: the other's array is byte for byte as it was */
    const r2 = await ask(w, { target: { text: "second" } });
    assert.equal(r2.ok, true);
    assert.equal(arrays()[1], swBefore, "a request write leaves the sweeps as they were");
    const reqMid = arrays()[0];
    assert.ok(reqMid.startsWith(reqBefore.slice(0, -2)), "and the first request as it was");
    const s2 = await sweep("s2", "two");
    assert.equal(s2.ok, true, JSON.stringify(s2));
    assert.equal(arrays()[0], reqMid, "a sweep write leaves the requests as they were");
    assert.deepEqual(held(w).sweeps.map((x) => x.id), ["s1", "s2"]);
    assert.equal(heldText(w), `${JSON.stringify(held(w), null, 2)}\n`, "canonical");
    /* one promotion each, authored by the member; the Session Log carries the sentence; the fence ran at the write */
    assert.equal(w.manifest(GB).slice(1).every((m) => m.author === ALICE && m.writer === null), true);
    assert.match(w.text(GB), /Sweep s2 set for the test\./);
    assert.ok(share.calls.some((c) => c[0] === "fence" && c[1] === GB), "the sweep fence ran in the promotion");
  }
});

test("R77 the write relays the sweep fence's and promotion's refusals unchanged, writing nothing; a refusal from mutate is relayed and takes its minted id back; a mutate that changes nothing writes nothing", async () => {
  const w = gatheringWorld();
  w.m.registerSweep("link-sweep", sweepShare());
  const host = w.m.sweepHost();
  const call = (mutate, o = {}) => host.write({ bundle: GB, author: ALICE, viewer: ALICE, log: "Changed for the test.", mutate, ...o });
  const before = untouched(w);
  /* the registered fence: a refusal of the sweep's, as it gives it */
  const fenced = await call((g) => { g.sweeps = [{ id: "f1", title: "fenced" }]; return g; });
  assert.deepEqual([fenced.ok, fenced.reason, fenced.code, fenced.detail], [false, "SWEEP_NOT_A_MEMBER", "SWEEP_NOT_A_MEMBER", "fenced by the stand-in"]);
  /* the registered grammar's refused term, with its row as it gives it (R66) */
  const term = await call((g) => { g.sweeps = [{ id: "t1", terms: ["/(?=x)/"] }]; return g; });
  assert.deepEqual([term.ok, term.reason, term.check, term.translation], [false, "SWEEP_TERM_REFUSED", TERM_ROW.check, TERM_ROW.translation]);
  /* R27: a request C-18.5 finds wrong */
  const gr = await call((g) => { g.requests = [{ id: "GATH-bad" }]; return g; });
  assert.deepEqual([gr.ok, gr.reason, gr.code, gr.check], [false, "GATHERING_REFUSED", "GATHERING_REFUSED", "C-18.10"]);
  /* a refusal of mutate's own is relayed as it gives it */
  const mine = { ok: false, reason: "NO_SUCH_SWEEP", detail: "no such sweep" };
  assert.deepEqual(await call(() => mine), mine);
  assert.equal(untouched(w), before);
  /* an id mutate minted comes back with a refusal */
  const minted = [];
  await call((g) => { minted.push(w.record.allocId("GATH", "2026").id); return { ok: false, reason: "NO_SUCH_SWEEP" }; });
  await call((g) => { minted.push(w.record.allocId("GATH", "2026").id); return { ok: false, reason: "NO_SUCH_SWEEP" }; });
  assert.equal(minted[0], minted[1], "the refused mutate's id was taken back");
  /* a mutate that leaves the object as it found it writes nothing */
  const same = await call((g) => g);
  assert.deepEqual([same.ok, same.existed, same.bundle], [true, true, GB]);
  assert.equal(untouched(w), before);
  /* a mutate that throws, or answers no object, is a refusal and writes nothing */
  assert.equal((await call(() => { throw new Error("boom"); })).ok, false);
  assert.equal((await call(() => null)).ok, false);
  assert.equal(untouched(w), before);
  /* control: a sweep the fence admits lands, and then the same call again is a no-op */
  const ok = await call((g) => { g.sweeps = [{ id: "ok1", title: "fine" }]; return g; });
  assert.deepEqual([ok.ok, ok.bundle, typeof ok.revision], [true, GB, "string"]);
  assert.equal(ok.revision, w.record.head(GB).bundleSha);
  const again = await call((g) => { g.sweeps = [{ id: "ok1", title: "fine" }]; return g; });
  assert.deepEqual([again.ok, again.existed], [true, true]);
});

test("R77 the write's own refusals: a machine or empty author, a missing bundle, mutate or log are required-argument refusals; an absent or unseen bundle is ABSENT identically; a gathering file it cannot read is refused rather than overwritten", async () => {
  const w = world();
  w.inProject("PROJ-2026-0730-p", { owner: "carol" });
  w.promote(GB, infoMd(GB, ADDRESS, { enabled: false, lines: ["project: PROJ-2026-0730-p"] }));
  const host = w.m.sweepHost();
  const ok = (g) => g;
  const req = { bundle: GB, mutate: ok, author: CAROL, viewer: CAROL, log: "Changed for the test." };
  for (const [o, argument] of [[{ author: "" }, "author"], [{ author: DAEMON }, "author"], [{ author: "class:admin" }, "author"],
                               [{ bundle: "" }, "bundle"], [{ mutate: null }, "mutate"], [{ log: "" }, "log"], [{ log: "  " }, "log"]]) {
    const r = await host.write({ ...req, ...o });
    assert.deepEqual([r.ok, r.reason, r.argument], [false, "REQUIRED_ARGUMENT_MISSING", argument], JSON.stringify(o));
  }
  assert.deepEqual(await host.write({ ...req, bundle: "INFO-2026-0799-none" }), { ok: false, reason: "ABSENT", bundleId: "INFO-2026-0799-none" });
  assert.deepEqual(await host.write({ ...req, author: ZED, viewer: ZED }), { ok: false, reason: "ABSENT", bundleId: GB });
  assert.equal(w.manifest(GB).length, 1);
  /* a file that is not readable as an object is not overwritten */
  for (const [id, text] of [["INFO-2026-0731-junk", "{not json"], ["INFO-2026-0732-list", "[]"]]) {
    const md = infoMd(id, ADDRESS, { enabled: false });
    const rep = w.promotion.promote({ bundleId: id, base: null, snapKey: `20260920T000000Z_rp${id.slice(-4, -3)}${id.slice(-3, -2)}99`, author: ALICE, replay: true,
      meta: { object_type: "information", group: "test-group", title: `Monitored ${id}`, current_state: "collected", created: "2026-09-20T00:00:00Z", last_updated: "2026-09-20T00:00:00Z" },
      files: [{ path: "bundle.md", text: md, bytes: Buffer.byteLength(md), sha256: sha(md) }, gj(text)] });
    assert.equal(rep.ok, true, JSON.stringify(rep).slice(0, 200));
    const before = untouched(w, id);
    const r = await host.write({ ...req, bundle: id, author: ALICE, viewer: ALICE, mutate: (g) => { g.requests = []; return g; } });
    assert.deepEqual([r.ok, r.reason, r.code], [false, "GATHERING_REFUSED", "GATHERING_REFUSED"], id);
    assert.match(r.findings[0].detail, /cannot be revised\. Nothing was written\.$/);
    assert.equal(untouched(w, id), before);
  }
  /* control: the owner of the project sees it and writes; the file is created when the bundle has none */
  const made = await host.write({ ...req, mutate: (g) => { g.requests = []; return g; } });
  assert.equal(made.ok, true, JSON.stringify(made));
  assert.deepEqual(held(w), { requests: [] });
});

test("R42 R75 the new rows join this module's table: C-18.22 MACHINE_CANNOT_SET_REQUEST and C-18.23 NAMED_REQUEST_REFUSED, each with its code, number, canned translation and a where naming this module's site", () => {
  assert.deepEqual(Object.entries(NAMED_REQUEST_CHECKS).map(([k, r]) => [k, r.check, r.where]),
    [["MACHINE_CANNOT_SET_REQUEST", "C-18.22", "src/monitoring/named-requests.mjs namedRequestSet > is-named-request-member"],
     ["NAMED_REQUEST_REFUSED", "C-18.23", "src/monitoring/named-requests.mjs namedRequestSet > is-named-request-shape"]]);
  for (const k of Object.keys(NAMED_REQUEST_CHECKS)) {
    assert.deepEqual(MONITORING_CHECKS[k], NAMED_REQUEST_CHECKS[k]);
    assert.ok(Object.isFrozen(NAMED_REQUEST_CHECKS[k]));
    assert.ok(NAMED_REQUEST_CHECKS[k].translation.length > 40 && /Nothing was changed\.$/.test(NAMED_REQUEST_CHECKS[k].translation), "a canned sentence (DEC-49)");
  }
});
