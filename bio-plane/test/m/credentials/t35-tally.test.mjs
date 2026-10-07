/* T35 (T35-15; F9, N703; DEC-165, DEC-166; K1874, K1875, K1882; K1881, K1934): the count-only security tally (R44)
   and the administrators' map and level over it (R45), at the interface. The module's clock (`Date.now`) is set by
   the test; counts for earlier hours are laid in the tally's own table, which holds nothing but kind, hour, country
   and count. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, PASSWORD } from "./fixture.mjs";
import { SIGN_IN_CHECKS, SECURITY_KINDS, SECURITY_DAYS, SECURITY_NOTE, SECURITY_THRESHOLD, Credentials }
  from "../../../src/credentials/index.mjs";
import { notAnAdmin } from "../../../src/membership/index.mjs";

const H = 3600e3, D = 24 * H;
const shape = (r) => ({ ok: r.ok, reason: r.reason, code: r.code, check: r.check, translation: r.translation });
const refusal = (code) => ({ ok: false, reason: code, code, check: SIGN_IN_CHECKS[code].check, translation: SIGN_IN_CHECKS[code].translation });
async function at(t, fn) {
  const real = Date.now;
  Date.now = () => t;
  try { return await fn(); } finally { Date.now = real; }
}
/* "Now" for a test: half past an hour, two days on, so every hour named below is whole. */
const NOW = (Math.floor(Date.now() / H) + 48) * H + 30 * 60e3;
const HOUR = Math.floor(NOW / H);
const iso = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, "Z");
const lay = (w, kind, hour, n, country = "") =>
  w.sql.exec(`INSERT INTO security_counts (kind, hour, country, count) VALUES (?,?,?,?)
              ON CONFLICT(kind, hour, country) DO UPDATE SET count=count+excluded.count`, kind, hour, country, n);
const tally = (w) => w.rows(`SELECT kind, hour, country, count FROM security_counts ORDER BY kind, hour, country`);
const map = (w, from, to, by = "admin") => w.c.securityMap({ from: iso(from), to: iso(to), by });

test("R44 securityCount: one count of a known kind for the current UTC hour and Cloudflare's country, placed at once; an unknown kind SECURITY_KIND_UNKNOWN (C-96.42), counting nothing; a count holds its kind, hour and country and nothing else", async () => {
  const w = await world().group();
  assert.deepEqual([...SECURITY_KINDS], ["signin", "credential", "rate", "handover", "through"]);
  await at(NOW, async () => {
    const before = w.snapshot();
    for (const kind of [null, undefined, "", "Signin", "login", "refused", 7]) {
      const r = w.c.securityCount({ kind, country: "US" });
      assert.deepEqual(shape(r), refusal("SECURITY_KIND_UNKNOWN"), String(kind));
      assert.match(r.detail, /Nothing was counted\.$/);
    }
    assert.equal(w.snapshot(), before, "counting nothing");
    for (const kind of SECURITY_KINDS) assert.deepEqual(w.c.securityCount({ kind, country: "us" }), { ok: true, kind, counted: true });
    for (const country of ["T1", " de ", "USA", "U", "", null, undefined, 7, "203.0.113.9"]) w.c.securityCount({ kind: "credential", country });
  });
  assert.deepEqual(tally(w), [
    { kind: "credential", hour: HOUR, country: "", count: 7 }, { kind: "credential", hour: HOUR, country: "DE", count: 1 },
    { kind: "credential", hour: HOUR, country: "T1", count: 1 }, { kind: "credential", hour: HOUR, country: "US", count: 1 },
    { kind: "handover", hour: HOUR, country: "US", count: 1 }, { kind: "rate", hour: HOUR, country: "US", count: 1 },
    { kind: "signin", hour: HOUR, country: "US", count: 1 }, { kind: "through", hour: HOUR, country: "US", count: 1 }]);
  assert.deepEqual(w.rows(`PRAGMA table_info(security_counts)`).map((c) => c.name), ["kind", "hour", "country", "count"],
    "no address, fingerprint, handle, role, op, path, time within the hour or content");
  assert.ok(!JSON.stringify(w.rows(`SELECT * FROM security_counts`)).includes("203.0.113.9"));
  assert.ok(!Object.keys(w.ops()).some((op) => /securitycount|securitylevel/.test(op)), "reached by no route");
});

test("R44 counts older than 90 days are dropped", async () => {
  const w = await world().group();
  assert.equal(SECURITY_DAYS, 90);
  lay(w, "credential", HOUR - 90 * 24 - 1, 4);
  lay(w, "credential", HOUR - 90 * 24, 3);
  lay(w, "credential", HOUR - 24, 2);
  await at(NOW, () => w.c.securityCount({ kind: "rate", country: null }));
  assert.deepEqual(tally(w).map((r) => [r.kind, HOUR - r.hour, r.count]),
    [["credential", 90 * 24, 3], ["credential", 24, 2], ["rate", 0, 1]]);
});

test("R44 DEC-166: a refused sign-in is counted at once without a place; its country is added only once an hour has passed with no success under the role, and while it waits nothing names the role but a keyed digest", async () => {
  const w = await world().group("ann", "bob");
  await at(NOW - 2 * 60e3, () => w.c.login({ role: "member:ann", password: "wrong-passphrase", source: "s1", country: "de" }));
  assert.deepEqual(tally(w), [{ kind: "signin", hour: HOUR, country: "", count: 1 }], "held without a place");
  const waiting = w.rows(`SELECT * FROM security_pending`);
  assert.equal(waiting.length, 1);
  assert.equal(waiting[0].country, "DE");
  assert.match(waiting[0].role, /^[0-9a-f]{64}$/);
  assert.ok(!JSON.stringify(waiting).includes("ann"), "the role only as a keyed digest");
  const { createHash } = await import("node:crypto");
  for (const t of ["member:ann", "role\u0000member:ann"]) assert.notEqual(waiting[0].role, createHash("sha256").update(t).digest("hex"), "keyed, not a plain hash");
  /* within the hour: unplaced */
  const m1 = await at(NOW + 30 * 60e3, () => map(w, NOW - 3 * H, NOW + 30 * 60e3));
  assert.deepEqual([m1.countries, m1.unplaced], [[], 1]);
  /* an hour on, with no success under the role: placed, as the map reads it, and writing nothing */
  const before = w.snapshot();
  const m2 = await at(NOW + 61 * 60e3, () => map(w, NOW - 3 * H, NOW + 61 * 60e3));
  assert.deepEqual([m2.countries, m2.unplaced], [[{ country: "DE", count: 1 }], 0]);
  assert.equal(w.snapshot(), before, "the map writes nothing");
  /* a success under another role in between changed nothing; the next write places it and drops the digest */
  await at(NOW + 10 * 60e3, () => w.c.login({ role: "member:bob", password: PASSWORD("bob"), source: "s2" }));
  assert.equal(w.rows(`SELECT * FROM security_pending`).length, 1);
  await at(NOW + 61 * 60e3, () => w.c.securityCount({ kind: "handover", country: null }));
  assert.deepEqual(w.rows(`SELECT * FROM security_pending`), [], "the digest dropped when its hour ended");
  assert.deepEqual(tally(w).filter((r) => r.kind === "signin"), [{ kind: "signin", hour: HOUR, country: "DE", count: 1 }]);
  /* a session read drops a waiting place that is due, as any write does */
  await at(NOW, () => w.c.login({ role: "member:bob", password: "wrong-passphrase", source: "s3", country: "FR" }));
  await at(NOW + 2 * H, () => w.c.session("no-such-token"));
  assert.deepEqual(w.rows(`SELECT * FROM security_pending`), []);
});

test("R44 DEC-166: a success under the same role within the hour means the counts are never placed; a member's own refused attempts before their sign-in are never given a country", async () => {
  const w = await world().group("ann");
  await at(NOW - 20 * 60e3, async () => {
    await w.c.login({ role: "member:ann", password: "wrong-passphrase", source: "home", country: "FR" });
    await w.c.login({ role: "member:ann", password: "wrong-passphrase-2", source: "home", country: "FR" });
  });
  await at(NOW + 30 * 60e3, () => w.c.login({ role: "member:ann", password: PASSWORD("ann"), source: "home", country: "FR" }));
  assert.deepEqual(w.rows(`SELECT * FROM security_pending`), []);
  await at(NOW + 5 * H, () => w.c.securityCount({ kind: "credential", country: null }));
  const m = await at(NOW + 5 * H, () => map(w, NOW - 3 * H, NOW + 5 * H));
  assert.deepEqual([m.countries, m.unplaced, m.totals.count.signin], [[], 3, 2], "the credential count and the two sign-ins, unplaced");
  assert.deepEqual(tally(w).filter((r) => r.kind === "signin"), [{ kind: "signin", hour: HOUR, country: "", count: 2 }]);
  assert.ok(!tally(w).some((r) => r.country === "FR"));
  /* a successful sign-in is never counted */
  assert.equal(w.rows(`SELECT * FROM security_counts WHERE kind NOT IN ('signin', 'credential')`).length, 0);
});

test("R44 R38 `through`: a sign-in or recovery that succeeds under a role paused in the hour before it, never placed; none without a pause, or after a pause over an hour old", async () => {
  const w = await world().group("ann", "bob");
  const codes = w.c.recoveryCodesIssue({ by: "second" }).codes;
  const pause = async (role) => {
    for (let i = 0; i < 10; i++) await w.c.login({ role, password: "wrong-passphrase", source: `${role}-${i}`, country: "RU" });
    assert.equal((await w.c.login({ role, password: "x", source: "again", country: "RU" })).reason, "SIGN_IN_PAUSED");
  };
  await at(NOW - 40 * 60e3, () => pause("member:ann"));
  await at(NOW - 40 * 60e3, () => pause("member:second"));
  await at(NOW - 3 * H, () => pause("member:bob"));
  await at(NOW, async () => {
    assert.equal((await w.c.login({ role: "member:ann", password: PASSWORD("ann"), source: "home", country: "RU" })).ok, true);
    assert.equal((await w.c.recover({ role: "member:second", code: codes[0], password: "new-passphrase-1" })).ok, true);
    assert.equal((await w.c.login({ role: "member:bob", password: PASSWORD("bob"), source: "home" })).ok, true);
  });
  assert.deepEqual(tally(w).filter((r) => r.kind === "through"), [{ kind: "through", hour: HOUR, country: "", count: 2 }]);
  assert.equal((await at(NOW, () => map(w, NOW - 4 * H, NOW))).level, "High");
});

test("R44 a count that cannot be written is dropped and never changes the answer of the act that refused", async () => {
  const w = await world().group("ann");
  w.sql.exec(`DROP TABLE security_counts`);
  w.sql.exec(`DROP TABLE security_pending`);
  assert.deepEqual(await w.c.login({ role: "member:ann", password: "wrong-passphrase", source: "s", country: "US" }),
    { ok: false, reason: "SIGN_IN_REFUSED", detail: Credentials.LOGIN_REFUSAL_DETAIL.SIGN_IN_REFUSED });
  assert.deepEqual(await w.c.claim({ password: "another-passphrase", tokenFp: "fp-1", source: "s" }),
    { ok: false, reason: "ALREADY_CLAIMED", consumedAt: w.c.bootstrapState("fp-1").consumedAt });
  assert.deepEqual(w.c.securityCount({ kind: "credential", country: "US" }), { ok: true, kind: "credential", counted: false });
  assert.equal((await w.c.login({ role: "member:ann", password: PASSWORD("ann"), source: "s" })).ok, true);
  assert.equal(w.c.session("x"), null);
});

test("R45 securityMap answers administrators only (NOT_AN_ADMIN through membership, a machine refused the same); it writes nothing", async () => {
  const w = await world().group("ann", "dee");
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  await at(NOW, async () => {
    const before = w.snapshot();
    for (const by of ["ann", "dee", "nobody", "class:admin", "class:ai", "token:ai", null])
      assert.deepEqual(map(w, NOW - H, NOW, by), notAnAdmin(by, "reading the security map"), String(by));
    for (const by of ["admin", "second", "member:second"]) assert.equal(map(w, NOW - H, NOW, by).ok, true, by);
    assert.equal(w.snapshot(), before);
  });
});

test("R45 the period: from before to, at most 90 days, inside the counts kept; anything else SECURITY_PERIOD_INVALID (C-96.43) naming what, reading nothing", async () => {
  const w = await world().group();
  await at(NOW, async () => {
    const bad = [
      [null, NOW, "from is not an instant"], ["yesterday", NOW, "from is not an instant"], [NOW - H, undefined, "to is not an instant"],
      [NOW, NOW, "from is not before to"], [NOW, NOW - H, "from is not before to"],
      [NOW - 90 * D - H, NOW, "the period is longer than 90 days"],
      [NOW - 90 * D - 2 * H, NOW - 80 * D, "from is before the counts kept, which go back 90 days"],
      [NOW - H, NOW + 2 * H, "to is after the present hour"]];
    for (const [from, to, what] of bad) {
      const r = w.c.securityMap({ from: typeof from === "number" ? iso(from) : from, to: typeof to === "number" ? iso(to) : to, by: "admin" });
      assert.deepEqual([shape(r), r.what], [refusal("SECURITY_PERIOD_INVALID"), what], what);
      assert.match(r.detail, new RegExp(`^${what}\\.`));
    }
    /* instants as ISO strings or milliseconds; exactly 90 days, from the oldest hour kept, is a period */
    assert.equal(w.c.securityMap({ from: NOW - 90 * D, to: NOW, by: "admin" }).ok, true);
    assert.equal(w.c.securityMap({ from: String(NOW - H), to: iso(NOW), by: "admin" }).ok, true);
    assert.equal(w.c.securityMap({ from: iso(NOW - H), to: iso(Math.ceil(NOW / H) * H), by: "admin" }).ok, true, "to the end of this hour");
  });
});

test("R45 the answer's shape; the step (an hour to 48 hours, six hours to 14 days, else a day); buckets cover the period, each {start, counts, usual} keyed by the kinds and total", async () => {
  const w = await world().group();
  await at(NOW, async () => {
    const m = map(w, NOW - 6 * H, NOW);
    assert.deepEqual(Object.keys(m).sort(), ["buckets", "countries", "from", "level", "levelAt", "note", "ok", "step", "to", "totals", "unplaced"]);
    assert.deepEqual([m.from, m.to, m.note], [iso(NOW - 6 * H), iso(NOW), SECURITY_NOTE]);
    assert.equal(SECURITY_NOTE, "A country is not proof of who is behind an attempt.");
    assert.deepEqual(m.buckets.map((b) => b.start), [6, 5, 4, 3, 2, 1, 0].map((k) => iso((HOUR - k) * H)), "whole hours from the one `from` falls in");
    for (const b of m.buckets) {
      assert.deepEqual(Object.keys(b).sort(), ["counts", "start", "usual"]);
      assert.deepEqual(Object.keys(b.counts), [...SECURITY_KINDS, "total"]);
      assert.deepEqual(Object.keys(b.usual), [...SECURITY_KINDS, "total"]);
    }
    for (const [span, step] of [[48 * H, "hour"], [48 * H + 1, "six-hours"], [14 * D, "six-hours"], [14 * D + 1, "day"], [90 * D, "day"]])
      assert.equal(map(w, NOW - span, NOW).step, step, String(span));
    const six = map(w, NOW - 3 * D, NOW);
    for (const b of six.buckets) assert.equal(new Date(b.start).getUTCHours() % 6, 0, "six-hour steps from 00, 06, 12, 18 UTC");
    assert.equal(six.buckets.length, 13);
    const days = map(w, NOW - 20 * D, NOW);
    for (const b of days.buckets) assert.match(b.start, /T00:00:00Z$/);
    assert.equal(days.buckets.length, 21);
  });
});

test("R45 the usual of an hour is the median of the same hour of the day on each of the 28 days before it, a day with none counting 0; a bucket's usual is the sum of its hours'; totals {count, usual, busiest}", async () => {
  const w = await world().group();
  assert.equal(SECURITY_THRESHOLD.usualDays, 28);
  const h = HOUR - 1;
  /* the hour before now: 14 days with 2 refused sign-ins and 14 with 6 at that hour of the day: median 4 */
  for (let d = 1; d <= 28; d++) lay(w, "signin", h - d * 24, d <= 14 ? 2 : 6);
  /* credential: on 10 of the 28 days only, so 18 count 0 and the median is 0 */
  for (let d = 1; d <= 10; d++) lay(w, "credential", h - d * 24, 5);
  /* the 29th day back is not one of the 28 */
  lay(w, "rate", h - 29 * 24, 100);
  /* the period's own counts */
  lay(w, "signin", h, 3);
  lay(w, "credential", HOUR, 3);
  await at(NOW, async () => {
    const m = map(w, NOW - 2 * H, NOW);
    const b = Object.fromEntries(m.buckets.map((x) => [x.start, x]));
    const prev = b[iso(h * H)];
    assert.deepEqual(prev.usual, { signin: 4, credential: 0, rate: 0, handover: 0, through: 0, total: 6 },
      "total's usual is the median of the totals: 14 of 2 and 10 of 7 and 4 of 6, so 6");
    assert.deepEqual(prev.counts, { signin: 3, credential: 0, rate: 0, handover: 0, through: 0, total: 3 });
    /* six-hour buckets sum their hours' usuals */
    const six = map(w, NOW - 3 * D, NOW);
    const holding = six.buckets.find((x) => Date.parse(x.start) <= h * H && h * H < Date.parse(x.start) + 6 * H);
    assert.equal(holding.usual.signin, 4);
    assert.deepEqual([m.totals.count.total, m.totals.count.signin, m.totals.count.credential], [6, 3, 3]);
    assert.equal(m.totals.usual.signin, m.buckets.reduce((s, x) => s + x.usual.signin, 0));
    assert.equal(m.totals.busiest, iso(h * H), "a tie goes to the earliest bucket");
  });
});

test("R45 countries rank the period's placed counts, most first; unplaced counts the rest; outside the period nothing", async () => {
  const w = await world().group();
  lay(w, "credential", HOUR - 1, 4, "US");
  lay(w, "rate", HOUR - 1, 2, "US");
  lay(w, "handover", HOUR, 5, "BR");
  lay(w, "credential", HOUR, 1, "AR");
  lay(w, "credential", HOUR, 1, "AT");
  lay(w, "signin", HOUR, 7, "");
  lay(w, "credential", HOUR - 10, 50, "CN");
  await at(NOW, async () => {
    const m = map(w, NOW - 2 * H, NOW);
    assert.deepEqual(m.countries, [{ country: "US", count: 6 }, { country: "BR", count: 5 },
      { country: "AR", count: 1 }, { country: "AT", count: 1 }]);
    assert.equal(m.unplaced, 7);
  });
});

test("R45 the level: an hour is unusual at 10 or more and more than five times its usual (more than five when its usual is 0); High with any `through` or a still-unusual last whole hour, Raised with any unusual hour, else Ordinary; levelAt the first unusual hour or the first `through`", async () => {
  assert.deepEqual({ ...SECURITY_THRESHOLD }, { atLeast: 10, times: 5, usualDays: 28 });
  const level = async (setup, from, to) => {
    const w = await world().group();
    setup(w);
    return at(NOW, () => { const m = map(w, from, to); return [m.level, m.levelAt]; });
  };
  const usualTwo = (w, hour) => { for (let d = 1; d <= 28; d++) lay(w, "credential", hour - d * 24, 2); };
  assert.deepEqual(await level(() => {}, NOW - 6 * H, NOW), ["Ordinary", null]);
  assert.deepEqual(await level((w) => lay(w, "credential", HOUR - 4, 9), NOW - 6 * H, NOW), ["Ordinary", null], "under 10");
  assert.deepEqual(await level((w) => { usualTwo(w, HOUR - 4); lay(w, "credential", HOUR - 4, 10); }, NOW - 6 * H, NOW),
    ["Ordinary", null], "10 is not more than five times 2");
  assert.deepEqual(await level((w) => { usualTwo(w, HOUR - 4); lay(w, "credential", HOUR - 4, 11); }, NOW - 6 * H, NOW),
    ["Raised", iso((HOUR - 4) * H)]);
  assert.deepEqual(await level((w) => lay(w, "rate", HOUR - 4, 10), NOW - 6 * H, NOW), ["Raised", iso((HOUR - 4) * H)], "usual 0");
  /* the last whole hour unusual and `to` within the hour before the call: still going on */
  assert.deepEqual(await level((w) => { lay(w, "rate", HOUR - 4, 10); lay(w, "signin", HOUR - 1, 12); }, NOW - 6 * H, NOW),
    ["High", iso((HOUR - 4) * H)]);
  assert.deepEqual(await level((w) => lay(w, "signin", HOUR - 3, 12), NOW - 8 * H, (HOUR - 2) * H),
    ["Raised", iso((HOUR - 3) * H)], "the same hour, but the period ended two hours ago");
  /* any through */
  assert.deepEqual(await level((w) => { lay(w, "through", HOUR - 5, 1); lay(w, "rate", HOUR - 2, 10); }, NOW - 6 * H, NOW),
    ["High", iso((HOUR - 5) * H)], "the through came first");
  assert.deepEqual(await level((w) => { lay(w, "rate", HOUR - 5, 10); lay(w, "through", HOUR - 2, 1); }, NOW - 6 * H, NOW),
    ["High", iso((HOUR - 5) * H)], "the unusual hour came first");
});

test("R45 securityLevel answers {level, levelAt} over the 24 hours ending at the call; reached by no route; writes nothing; never throws", async () => {
  const w = await world().group();
  lay(w, "rate", HOUR - 30, 40);
  await at(NOW, () => assert.deepEqual(w.c.securityLevel(), { level: "Ordinary", levelAt: null }, "30 hours ago is outside it"));
  lay(w, "rate", HOUR - 20, 40);
  const before = w.snapshot();
  await at(NOW, () => assert.deepEqual(w.c.securityLevel(), { level: "Raised", levelAt: iso((HOUR - 20) * H) }));
  lay(w, "through", HOUR, 1);
  await at(NOW, () => assert.deepEqual(w.c.securityLevel(), { level: "High", levelAt: iso((HOUR - 20) * H) }));
  assert.equal(w.c.securityLevel.length, 0);
  w.sql.exec(`DELETE FROM security_counts WHERE kind='through'`);
  assert.equal(w.snapshot(), before, "it writes nothing");
  const broken = Object.create(Object.getPrototypeOf(w.c));
  assert.deepEqual(w.c.securityLevel.call(broken), { level: "Ordinary", levelAt: null });
});
