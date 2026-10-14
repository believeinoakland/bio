/* sources: the instants at which what R8 answers for a source could have changed (R20; N947, K2949), and the route
   to R8 asking at this module's own instant (R8's T47 clause; N983, K3045). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, SECRET, OTHER_SECRET } from "./fixture.mjs";
import { SOURCES_CHECKS, sourcesOps, CHANGES_LIMIT_DEFAULT, CHANGES_LIMIT_MAX } from "../../../src/sources/index.mjs";

const VALUE = "Unmistakable Value 9043";
const EVIDENCE = "a signed note kept by carol";
const iso = (ms) => new Date(ms).toISOString();
const codeOf = (r) => (r && r.ok === false ? r.reason : "ok");

/** Every change, paged through `next` until not `truncated`. */
function allChanges(w, source, since, limit) {
  const out = [];
  let after;
  for (let i = 0; i < 100; i++) {
    const r = w.s.sourceChangesSince({ source, since, limit, after });
    assert.equal(r.ok, true, JSON.stringify(r));
    out.push(...r.changes);
    if (!r.truncated) return out;
    after = r.next;
  }
  assert.fail("paging never ended");
}

test("R20 sourceChangesSince answers each disclosure, consent and withdrawal of the source after `since` and at or before the read, in recorded order, each {at, act, entry} and nothing else; writes nothing and logs no read", async () => {
  const w = seeded();
  const { sourceId } = await w.pulled({ secret: SECRET });
  const other = (await w.pulled({ secret: OTHER_SECRET })).sourceId;
  const before = w.disclose(sourceId, { revealed: { kind: "name", value: VALUE } });
  w.tick();
  const since = iso(w.clock.now);
  /* inside the interval: a disclosure, a consent, a withdrawal, a consent by the knocker's secret (R11), a link */
  const e = w.disclose(sourceId, { revealed: { kind: "attribute", attribute: "role", value: VALUE }, evidence: EVIDENCE, sight: ["carol"] });
  w.tick();
  const c1 = w.s.recordConsent({ source: sourceId, entry: before.entry, audience: "group", evidence: EVIDENCE, by: "carol" });
  w.tick();
  const wd = w.s.withdrawConsent({ source: sourceId, entry: before.entry, audience: "group", by: "carol" });
  w.tick();
  const c2 = await w.s.consentBySecret({ knockerSecret: SECRET, entry: before.entry, audience: "group", sourceAddress: "198.51.100.9" });
  assert.equal(c2.ok, true);
  w.tick();
  const link = await w.s.linkClaim({ source: sourceId, to: other, evidence: EVIDENCE, by: "carol" });
  /* the other source's own acts, and a link naming this source from the other, are the other source's */
  w.tick();
  const oe = w.disclose(other);
  const back = await w.s.linkClaim({ source: other, to: sourceId, evidence: EVIDENCE, by: "carol" });
  w.tick();
  const snap = w.snapshot();
  const reads = w.count("source_reads");
  const r = w.s.sourceChangesSince({ source: sourceId, since });
  assert.deepEqual(Object.keys(r).sort(), ["at", "changes", "limit", "next", "ok", "since", "source", "truncated"]);
  assert.deepEqual(r, {
    ok: true, source: sourceId, since, at: iso(w.clock.now),
    changes: [
      { at: e.at, act: "disclosure", entry: e.entry },
      { at: c1.at, act: "consent", entry: before.entry },
      { at: wd.at, act: "withdrawal", entry: before.entry },
      { at: c2.at, act: "consent", entry: before.entry },
      { at: link.at, act: "disclosure", entry: link.entry },
    ],
    limit: CHANGES_LIMIT_DEFAULT, truncated: false, next: null,
  }, "every change of this source in the interval, in recorded order; the earlier disclosure and the other source's acts are not among them");
  assert.ok(!JSON.stringify(r).includes(back.entry) && !JSON.stringify(r).includes(oe.entry), "a link from another source is that source's disclosure");
  /* no value, audience, evidence, member or sight */
  const text = JSON.stringify(r);
  for (const s of [VALUE, EVIDENCE, "carol", "bob", "member", "public", "secret", "198.51.100.9"])
    assert.ok(!text.includes(s), `the answer carries no ${s}`);
  assert.ok(!/"group"/.test(text), "nor an audience");
  for (const c of r.changes) assert.deepEqual(Object.keys(c).sort(), ["act", "at", "entry"]);
  /* writes nothing, logs no read, mints and binds nothing */
  assert.deepEqual(w.snapshot(), snap, "it writes nothing");
  assert.equal(w.count("source_reads"), reads, "it logs no read");
  /* the other source answers its own */
  assert.deepEqual(w.s.sourceChangesSince({ source: other, since }).changes.map((c) => [c.act, c.entry]),
                   [["disclosure", oe.entry], ["disclosure", back.entry]]);
});

test("R20 bounds: only changes strictly after `since` and at or before the read's own instant (this module's clock); `since` read as an instant in any ISO 8601 spelling", async () => {
  const w = seeded();
  const { sourceId } = await w.pulled();
  const a = w.disclose(sourceId);
  const b = w.disclose(sourceId);
  const c = w.disclose(sourceId);
  const ids = (since) => w.s.sourceChangesSince({ source: sourceId, since }).changes.map((x) => x.entry);
  assert.deepEqual(ids(a.at), [b.entry, c.entry], "a change at `since` itself is not after it");
  assert.deepEqual(ids(iso(Date.parse(a.at) - 1)), [a.entry, b.entry, c.entry], "one millisecond earlier, it is");
  assert.deepEqual(ids(c.at), [], "nothing after the last change");
  /* the same instant spelled with an offset, without seconds, or with a fraction finer than a millisecond */
  const bMs = Date.parse(b.at);
  const offset = new Date(bMs + 90 * 60000).toISOString().replace(/\.(\d{3})Z$/, ".$1+01:30");
  assert.equal(Date.parse(offset), bMs);
  assert.deepEqual(ids(offset), [c.entry], "an offset spelling of b's instant");
  assert.deepEqual(ids(b.at.replace("Z", "999Z")), [c.entry], "a fraction past the millisecond: b's own instant is not after it");
  assert.deepEqual(ids(iso(Date.parse(a.at) - 60000).slice(0, 16) + "Z"), [a.entry, b.entry, c.entry], "minutes, no seconds");
  assert.deepEqual(ids("9999-12-31T23:30:00-01:00"), [], "an instant past year 9999 is after every change");
  assert.deepEqual(ids("0000-01-01T00:30:00+01:00"), [a.entry, b.entry, c.entry], "one before year 0 is before every change");
  /* at or before the read: the module's clock set back before c, so c is not answered, and `at` is that instant */
  w.clock.now = Date.parse(c.at) - 1;
  const r = w.s.sourceChangesSince({ source: sourceId, since: iso(Date.parse(a.at) - 1) });
  assert.equal(r.at, iso(w.clock.now), "`at` is the read's instant, this module's clock");
  assert.deepEqual(r.changes.map((x) => x.entry), [a.entry, b.entry]);
  w.clock.now = Date.parse(c.at);
  assert.deepEqual(w.s.sourceChangesSince({ source: sourceId, since: a.at }).changes.map((x) => x.entry), [b.entry, c.entry],
                   "a change at the read's own instant is answered");
});

test("R20 recorded order at one instant: a disclosure before a consent, each table in the order it was written", async () => {
  const w = seeded();
  const { sourceId } = await w.pulled();
  const since = iso(w.clock.now);
  const e1 = w.disclose(sourceId);   // ticks, then everything below at one instant
  const c1 = w.s.recordConsent({ source: sourceId, entry: e1.entry, audience: "member", evidence: "e", by: "bob" });
  const e2 = w.s.recordDisclosure({ source: sourceId, revealed: { kind: "attribute", attribute: "role", value: "clerk" }, how: "self",
                                    knownTo: "group", evidence: "e", sight: ["bob"], by: "bob" });
  const c2 = w.s.recordConsent({ source: sourceId, entry: e1.entry, audience: "group", evidence: "e", by: "bob" });
  assert.ok([c1.at, e2.at, c2.at].every((t) => t === e1.at), "one instant");
  assert.deepEqual(w.s.sourceChangesSince({ source: sourceId, since }).changes.map((x) => [x.act, x.entry]),
                   [["disclosure", e1.entry], ["disclosure", e2.entry], ["consent", e1.entry], ["consent", e1.entry]]);
});

test("R20 asking R8 at each instant it names (and at `since`) finds a state that held only inside the interval: a consent withdrawn and given again", async () => {
  const w = seeded();
  const { sourceId } = await w.pulled();
  const e = w.disclose(sourceId);
  w.tick();
  w.s.recordConsent({ source: sourceId, entry: e.entry, audience: "public", evidence: "a signed note", by: "bob" });
  w.tick();
  const since = iso(w.clock.now);
  w.tick();
  const wd = w.s.withdrawConsent({ source: sourceId, entry: e.entry, audience: "public", by: "bob" });
  w.tick();
  w.s.recordConsent({ source: sourceId, entry: e.entry, audience: "public", evidence: "consent given again", by: "bob" });
  w.tick();
  const holds = (at) => w.s.publishableAt({ source: sourceId, audience: "public", at }).entries.some((x) => x.entry === e.entry);
  const r = w.s.sourceChangesSince({ source: sourceId, since });
  assert.equal(holds(since), true, "it held at `since`");
  assert.equal(holds(r.at), true, "and at the read");
  assert.deepEqual(r.changes.map((x) => x.act), ["withdrawal", "consent"]);
  assert.deepEqual(r.changes.map((x) => holds(x.at)), [false, true], "R8 at the withdrawal's instant finds it did not hold");
  assert.equal(r.changes[0].at, wd.at);
  /* the control: with no change in the interval, the answer is empty, and R8 answers the same at `since` and at the read */
  const quiet = w.s.sourceChangesSince({ source: sourceId, since: r.at });
  assert.deepEqual(quiet.changes, []);
  assert.equal(holds(r.at), holds(quiet.at));
});

test("R20 refusals: NO_SUCH_SOURCE (C-121.1) as R8 answers it; a `since` that is not an ISO 8601 instant answers changes: null with since_invalid, never an empty list; it never throws", async () => {
  const w = seeded();
  const { sourceId } = await w.pulled();
  w.disclose(sourceId);
  const snap = w.snapshot();
  for (const source of ["SRC-2026-0000", undefined, null, 7, "", {}]) {
    const r = w.s.sourceChangesSince({ source, since: "2026-01-01T00:00:00Z" });
    assert.equal(codeOf(r), "NO_SUCH_SOURCE", JSON.stringify(source));
    assert.equal(r.check, SOURCES_CHECKS.NO_SUCH_SOURCE.check);
    assert.equal(r.check, "C-121.1");
    assert.equal(r.translation, SOURCES_CHECKS.NO_SUCH_SOURCE.translation);
    assert.deepEqual(r, w.s.publishableAt({ source, audience: "public" }), "answered as R8 answers it");
  }
  assert.equal(codeOf(w.s.sourceChangesSince({ source: "SRC-2026-0000", since: "yesterday" })), "NO_SUCH_SOURCE", "the source is asked first");
  for (const since of [undefined, null, "", "yesterday", "2026", "Sep 30 2026", "2026-09-30", "2026-09-30T10:00:00",
                       "2026-02-30T00:00:00Z", "2026-09-30T25:00:00Z", "2026-09-30T10:60:00Z", "2026-09-30T10:00:00+24:00",
                       "2026-09-30 10:00:00Z", " 2026-09-30T10:00:00Z", Date.parse("2026-09-30T10:00:00Z"), {}, ["2026-09-30T10:00:00Z"]])
    assert.deepEqual(w.s.sourceChangesSince({ source: sourceId, since }), { ok: true, source: sourceId, changes: null, since_invalid: true },
                     JSON.stringify(since));
  /* the controls: instants in each spelling are read */
  for (const since of ["2026-09-30T10:00:00Z", "2026-09-30T10:00Z", "2026-09-30T10:00:00.123456Z", "2026-09-30T10:00:00+05:30",
                       "2026-09-30T10:00:00-08:00", "2024-02-29T00:00:00Z"])
    assert.ok(Array.isArray(w.s.sourceChangesSince({ source: sourceId, since }).changes), since);
  for (const args of [undefined, null, "text", 5, [], {}, { source: sourceId }, { source: sourceId, since: "2026-01-01T00:00:00Z", limit: {}, after: 9 }])
    assert.doesNotThrow(() => w.s.sourceChangesSince(args), JSON.stringify(args));
  assert.deepEqual(w.snapshot(), snap, "nothing is written by any of them");
});

test("R20 N90's bound: at most `limit` changes (default 200, clamped 1…1000), with `truncated` and `next`, the cursor passed back as `after`", async () => {
  const w = seeded();
  const { sourceId } = await w.pulled();
  const since = iso(w.clock.now);
  const e = w.disclose(sourceId);
  for (const audience of ["member", "group", "public"]) { w.tick(); w.s.recordConsent({ source: sourceId, entry: e.entry, audience, evidence: "e", by: "bob" }); }
  w.tick(); w.s.withdrawConsent({ source: sourceId, entry: e.entry, audience: "public", by: "bob" });
  w.disclose(sourceId); w.disclose(sourceId);
  const whole = w.s.sourceChangesSince({ source: sourceId, since });
  assert.equal(whole.changes.length, 7);
  /* pages of 3: 3, 3, 1, chained by `next`, together the whole list */
  const p1 = w.s.sourceChangesSince({ source: sourceId, since, limit: 3 });
  assert.deepEqual([p1.changes.length, p1.limit, p1.truncated], [3, 3, true]);
  assert.equal(typeof p1.next, "string");
  const p2 = w.s.sourceChangesSince({ source: sourceId, since, limit: 3, after: p1.next });
  assert.deepEqual([p2.changes.length, p2.truncated], [3, true]);
  const p3 = w.s.sourceChangesSince({ source: sourceId, since, limit: 3, after: p2.next });
  assert.deepEqual([p3.changes.length, p3.truncated, p3.next], [1, false, null]);
  assert.deepEqual([...p1.changes, ...p2.changes, ...p3.changes], whole.changes);
  assert.deepEqual(allChanges(w, sourceId, since, 1), whole.changes, "one at a time, the same list");
  /* a page exactly the size of what remains is not truncated */
  assert.deepEqual([w.s.sourceChangesSince({ source: sourceId, since, limit: 7 }).truncated, w.s.sourceChangesSince({ source: sourceId, since, limit: 7 }).next], [false, null]);
  /* the clamp */
  for (const [limit, want] of [[0, 1], [-5, 1], [1, 1], [2, 2], ["2", 2], [2.9, 2], [5000, CHANGES_LIMIT_MAX], [1000, 1000],
                               [undefined, CHANGES_LIMIT_DEFAULT], [null, CHANGES_LIMIT_DEFAULT], ["x", CHANGES_LIMIT_DEFAULT], ["", CHANGES_LIMIT_DEFAULT]])
    assert.equal(w.s.sourceChangesSince({ source: sourceId, since, limit }).limit, want, JSON.stringify(limit));
  assert.deepEqual([CHANGES_LIMIT_DEFAULT, CHANGES_LIMIT_MAX], [200, 1000]);
  /* an `after` naming no change of this source (malformed, unknown, or another source's cursor) reads as absent */
  const other = (await w.pulled()).sourceId;
  w.disclose(other); w.disclose(other);
  const oc = w.s.sourceChangesSince({ source: other, since, limit: 1 });
  assert.equal(oc.truncated, true);
  for (const after of ["garbage", "d", "x12", "d99999", "c99999", 12, null, oc.next])
    assert.deepEqual(w.s.sourceChangesSince({ source: sourceId, since, limit: 3, after }).changes, p1.changes, String(after));
});

test("R20 is reached by no route and answered to no viewer: no op of this module calls it", async () => {
  const w = seeded();
  const { sourceId } = await w.pulled();
  w.disclose(sourceId);
  let called = 0;
  const orig = w.s.sourceChangesSince.bind(w.s);
  w.s.sourceChangesSince = (...a) => { called++; return orig(...a); };
  const ops = sourcesOps(w.s, new URL(`http://do/x?${new URLSearchParams({ source_id: sourceId, since: "2026-01-01T00:00:00Z", viewer: V("bob"), by: "bob", audience: "public" })}`),
                         { source: sourceId, since: "2026-01-01T00:00:00Z" });
  assert.ok(Object.keys(ops).every((k) => !/change|since/i.test(k)), "no op names it");
  for (const [name, op] of Object.entries(ops)) if (name !== "knockerconsent" && name !== "sourcelink") op();
  assert.equal(called, 0, "no op reaches it");
  /* it takes no viewer: a viewer named or not, the answer is the same */
  const since = "2026-01-01T00:00:00Z";
  const plain = orig({ source: sourceId, since });
  assert.deepEqual(orig({ source: sourceId, since, viewer: V("dave") }), plain);
  assert.deepEqual(orig({ source: sourceId, since, viewer: "class:ai" }), plain);
});

test("R8 (T47) op=sourcepublishable evaluates at this module's own instant: a query `now` or `at` (or a body's) is ignored; the in-process publishableAt keeps its stated `at`", async () => {
  const w = seeded();
  const { sourceId } = await w.pulled();
  const e = w.disclose(sourceId);
  w.tick();
  const early = iso(w.clock.now);
  w.tick();
  w.s.recordConsent({ source: sourceId, entry: e.entry, audience: "public", evidence: "a signed note", by: "bob" });
  w.tick();
  const op = (q, body = null) => sourcesOps(w.s, new URL(`http://do/x?${new URLSearchParams({ source_id: sourceId, audience: "public", ...q })}`), body).sourcepublishable();
  const plain = op({});
  assert.equal(plain.ok, true);
  assert.equal(plain.at, iso(w.clock.now), "the module's own instant");
  assert.deepEqual(plain.entries.map((x) => [x.entry, x.basis]), [[e.entry, "consent"]]);
  for (const [q, body] of [[{ at: early }, null], [{ now: early }, null], [{ at: early, now: early }, null], [{}, { at: early }],
                           [{}, { now: early }], [{ at: "yesterday" }, null], [{ at: "2099-01-01T00:00:00Z" }, { at: early }]])
    assert.deepEqual(op(q, body), plain, `${JSON.stringify(q)} ${JSON.stringify(body)}: answered exactly as without it`);
  /* the control: in process, a stated `at` is the instant asked about */
  const then = w.s.publishableAt({ source: sourceId, audience: "public", at: early });
  assert.equal(then.at, early);
  assert.deepEqual(then.entries, [], "before the consent, nothing was publishable");
  assert.equal(codeOf(w.s.publishableAt({ source: sourceId, audience: "public", at: "yesterday" })), "BAD_DISCLOSURE", "and a bad one refused");
  /* the route follows the clock */
  w.tick(60000);
  assert.equal(op({ at: early }).at, iso(w.clock.now));
});
