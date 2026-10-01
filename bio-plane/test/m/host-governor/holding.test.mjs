/* host-governor: the cool-off facts a CONDITION item reads (converted from the old suite `test/queue-conditions.test.mjs`,
   host-governor's share, T18). `queue-producers`' `governor-holding-host` reads `governorHolding({now})` at the feed's
   as-of instant, through `governorOf(ctx)` with no options, and builds its item from the row: the host, the cool-off's
   end, the consecutive refusals, the last refusal's status and instant, the appetite, the grants and refusals. The old
   suite drove those facts through the whole plane; here they are held at this module's interface, with the reader as
   queue-producers reaches it. The whole plane's route to them is `ops.test.mjs`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { governorOf } from "../../../src/host-governor/index.mjs";

const T0 = 1_000_000_000;
const HOST = "docs.city.example";

test("R14, R9, R26: a counterparty's 429 is held, and a reader through governorOf(ctx) with no options reads every fact of the hold", () => {
  const w = world();
  const held = w.g.governorReport({ host: HOST, status: 429 });
  assert.deepEqual(held, { recorded: true, refusals: 1, cooloff_until: T0 + 60_000, cooloff_ms: 60_000 });
  const reader = governorOf(w.ctx);                                   // as queue-producers reaches it
  assert.equal(reader, w.g);
  const rows = reader.governorHolding({ now: T0 + 1_000 });
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0], w.row(HOST));                             // R13's row, whole
  const r = rows[0];
  assert.deepEqual([r.host, r.cooloff_until, r.cooloff_until - (T0 + 1_000), r.refusals, r.last_refusal_status,
                    r.last_refusal_at, r.appetite_per_min, r.granted, r.refused_total],
                   [HOST, held.cooloff_until, 59_000, 1, 429, T0, null, 0, 0]);
  // what admission did during the hold is in the row the reader reads: refused, no token spent
  w.step(5_000);
  assert.equal(w.g.governorAdmit({ host: HOST }).reason, "cooling_off");
  w.g.governorConfig({ host: HOST, appetite_per_min: 24 });
  const after = reader.governorHolding({ now: T0 + 5_000 })[0];
  assert.deepEqual([after.refused_total, after.granted, after.appetite_per_min, after.tokens], [1, 0, 24, 3]);
});

test("R14, R9: 403 and 503 hold as 429 does, and every held host is answered, ordered by host", () => {
  const w = world();
  w.g.governorReport({ host: "z.example", status: 503 });
  w.g.governorReport({ host: HOST, status: 429 });
  w.g.governorReport({ host: "a.example", status: 403 });
  w.g.governorAdmit({ host: "free.example" });
  const rows = w.g.governorHolding({ now: T0 });
  assert.deepEqual(rows.map((r) => [r.host, r.last_refusal_status, r.cooloff_until]),
    [["a.example", 403, T0 + 30_000], [HOST, 429, T0 + 60_000], ["z.example", 503, T0 + 30_000]]);
});

test("R14: the hold resolves by its own end at the reader's instant, for every reader at once, and nothing is written to clear it", () => {
  const w = world();
  const { cooloff_until: until } = w.g.governorReport({ host: HOST, status: 429 });
  const before = w.g.governorState({}).hosts;
  // the reader's as-of instant decides, not the governor's clock (the feed reads at `&now=`)
  w.at(T0);
  assert.deepEqual(w.g.governorHolding({ now: until - 1 }).map((r) => r.host), [HOST]);
  assert.deepEqual(w.g.governorHolding({ now: until }), []);         // `cooloff_until > now`, R4's own test
  assert.deepEqual(w.g.governorHolding({ now: until + 60_000 }), []);
  // two readers of the one storage agree: the fact is the instance's, not a reader's
  assert.deepEqual(governorOf(w.ctx).governorHolding({ now: until + 60_000 }), []);
  assert.deepEqual(governorOf({ storage: w.ctx.storage }).governorHolding({ now: until - 1 }).map((r) => r.host), [HOST]);
  // an expired hold is still a row: the resolution is derived, and no read wrote anything
  assert.deepEqual(w.g.governorState({}).hosts, before);
  assert.equal(w.row(HOST).cooloff_until, until);
});

test("R14, R9, R8: a refusal after the hold lapsed holds again, escalated; a success between resets the count and not the hold", () => {
  const w = world();
  const first = w.g.governorReport({ host: HOST, status: 429 });
  w.at(first.cooloff_until + 60_000);
  assert.deepEqual(w.g.governorHolding({}), []);
  const second = w.g.governorReport({ host: HOST, status: 429 });   // no success between: the second consecutive
  assert.equal(second.refusals, 2);
  assert.equal(second.cooloff_ms, 120_000);
  const row = w.g.governorHolding({})[0];
  assert.deepEqual([row.refusals, row.last_refusal_at, row.cooloff_until], [2, first.cooloff_until + 60_000, second.cooloff_until]);
  w.g.governorReport({ host: HOST, status: 200 });
  const relented = w.g.governorHolding({})[0];
  assert.deepEqual([relented.refusals, relented.cooloff_until, relented.last_refusal_status], [0, second.cooloff_until, 429]);
});
