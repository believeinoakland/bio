/* T51 fix round 10 (R82; STORE-REQUEST #5 J14; K5132's rule): every instant this module records, and every judgement of one,
   reads the store's clock: a handed `now`, else the store's `env.BIO_NOW_MS` (the environment `membersOps` is given), else
   the wall clock. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { Members, membersOps } from "../../../src/member-roster/index.mjs";
import { world, sqlOver } from "./fixture.mjs";

const PINNED = Date.UTC(2031, 2, 4, 9, 30);   // 2031-03-04T09:30:00.000Z: far from the wall clock of any run
const DAY = 86_400_000;
const pinnedEnv = (ms) => ({ BIO_NOW_MS: String(ms) });
const asAdmin = (query = "by=admin") => new URL(`http://x/?${query}`);

test("R82 an administrator's hosting-access record is stamped on the pinned clock; with none, the wall clock", async () => {
  const w = await world().group();
  const pinned = membersOps(w.m, asAdmin(), { holders: "ann", note: "pinned" }, pinnedEnv(PINNED)).hostingaccessset();
  assert.equal(pinned.ok, true);
  assert.equal(pinned.at, new Date(PINNED).toISOString(), "the record's instant reads BIO_NOW_MS");

  const before = Date.now();
  const wall = membersOps(w.m, asAdmin(), { holders: "bob", note: "wall" }, {}).hostingaccessset();
  assert.equal(wall.ok, true);
  const wallMs = Date.parse(wall.at);
  assert.ok(wallMs >= before - 1000 && wallMs <= Date.now() + 1000, "with no pinned clock the instant is the wall clock");
});

test("R82 an invitation expires on the pinned clock: live within its days, spent-looking after them", async () => {
  const w = await world().group();
  const made = await membersOps(w.m, asAdmin(), { memberId: "ann", cover: "Ann", role: "member", expiresInDays: 1 },
    pinnedEnv(PINNED)).memberadd();
  assert.equal(made.ok, true, "the invitation is made");
  assert.equal(made.expires, new Date(PINNED + DAY).toISOString(), "it expires a day after the pinned instant");

  const within = await membersOps(w.m, new URL("http://x/"), { invite: made.invite }, pinnedEnv(PINNED + DAY / 2)).invitelook();
  assert.equal(within.ok, true, "half a day on, on the pinned clock, the invitation is still live");

  const after = await membersOps(w.m, new URL("http://x/"), { invite: made.invite }, pinnedEnv(PINNED + 2 * DAY)).invitelook();
  assert.equal(after.reason, "NO_SUCH_INVITATION", "two days on, on the pinned clock, the same invitation has expired");
});

test("R82 a status change's instant reads the pinned clock (the store's own clock, not the wall's)", async () => {
  const w = await world().group("ann");
  const revoked = await membersOps(w.m, asAdmin(), { memberId: "ann", status: "revoked" }, pinnedEnv(PINNED)).memberset();
  assert.equal(revoked.ok, true);
  assert.equal(w.m.memberStatusSince("ann"), new Date(PINNED).toISOString(), "the revocation's instant reads BIO_NOW_MS");
});

test("R82 a handed clock answers before the environment's BIO_NOW_MS", async () => {
  const HANDED = Date.UTC(2032, 5, 1, 0, 0);
  const db = new DatabaseSync(":memory:");
  const sql = sqlOver(db);
  const m = new Members({ sql, now: () => HANDED });
  m.migrate();
  m.registerClaimed("credentials", () => true);
  const answer = membersOps(m, asAdmin(), { holders: "ann", note: "handed" }, pinnedEnv(PINNED)).hostingaccessset();
  assert.equal(answer.ok, true);
  assert.equal(answer.at, new Date(HANDED).toISOString(), "the handed `now` is read first, before BIO_NOW_MS");
});
