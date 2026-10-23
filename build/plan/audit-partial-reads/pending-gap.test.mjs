import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
const R = "/home/user/bio/bio-plane";
const { store } = await import(`${R}/test/m/plane/fixture.mjs`);
const { extractionOf } = await import(`${R}/src/extraction/index.mjs`);
const { pendingOf, PENDING_ATTEMPTS_MAX } = await import(`${R}/src/plane/pending.mjs`);
const { bucketStandIn } = await import(`${R}/test/m/case-carriage/fixture.mjs`);
const sha = (s) => createHash("sha256").update(s).digest("hex");
const rows = (x) => [...x.ctx.storage.sql.exec(`SELECT * FROM keeps_pending`)];

test("G1: deferred reading: member promotes after the 5 attempts -> nothing ever reads it", async () => {
  const x = await store({ env: { CAPTURES: bucketStandIn() } });
  let home = false; const asked = [];
  extractionOf(x.ctx).readHeld = async (a) => { asked.push(a.sha); return home ? { ok: true, read: true } : { ok: true, read: false, why: "NO_HOME" }; };
  const d = sha("big pdf");
  await x.call(`/pendingadd?kind=reading&sha=${d}`);
  let now = Date.now() + 1000;
  for (let n = 0; n < PENDING_ATTEMPTS_MAX + 3; n++) { await x.s.onAlarm(now); now += 600_000; }
  const total = (rows(x)[0] || {}).attempts;
  console.log("attempts made:", asked.length, "row attempts:", total, "wake:", pendingOf(x.ctx).consumer().wake(now));
  home = true; // member files the document 10 minutes later
  await x.s.onAlarm(now + 3_600_000);
  console.log("asked after home appeared:", asked.length, "(still", asked.length, ")");
  assert.equal(asked.length, PENDING_ATTEMPTS_MAX);
  assert.equal(pendingOf(x.ctx).consumer().wake(now), null);
  // second registration (member captures again) does not re-arm
  await x.call(`/pendingadd?kind=reading&sha=${d}`);
  console.log("after re-register attempts:", rows(x)[0].attempts, "wake:", pendingOf(x.ctx).consumer().wake(now));
});
