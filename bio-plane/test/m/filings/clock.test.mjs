/* filings' clock (T51 fix round 10, K5202; K5132's rule, as credentials' and membership's `#nowMs`): every instant this module
   records reads a handed `now`, else the store's environment (`env.BIO_NOW_MS`), else the wall clock. Failing-first: before
   the fix, an approval recorded under a pinned `BIO_NOW_MS` stamped the wall clock. Driven through the ops map, as the store's
   door drives it; each case has a negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, NOW, WORDS, LAW } from "./fixture.mjs";
import { filingsOps } from "../../../src/filings/index.mjs";

const PINNED_ISO = "2026-10-20T10:15:30Z";
const PINNED = String(Date.parse(PINNED_ISO));

/* the door's call: the op named `name`, its query and body, as the store's route hands them over */
const op = (f, name, query, body) => {
  const url = new URL(`http://do/${name}`);
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, String(v));
  return filingsOps(f, url, body)[name]();
};

/* a Tier 1 draft prepared by a machine, its one blank the approving member writes in (approve-send's R6 fixture) */
function drafted(x) {
  const A = x.action({});
  const d = x.f.filingPrepare({ action: A, text: WORDS, preparer: MACHINE, viewer: MACHINE });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  return { d, text: d.text.replace("[UNFILLED: law]", LAW) };
}
const approveBy = (f, d, text) => op(f, "filingapprove", { author: V("bo"), viewer: V("bo") }, { filing: d.id, text });

test("R70 (K5202, K5132) an approval recorded under a pinned BIO_NOW_MS, with no clock handed in, stamps the pinned instant", async () => {
  const x = world();
  const { d, text } = drafted(x);
  /* the store's environment reaches filings at its constructor (filingsOf's `env`); no `now` is handed */
  const pinned = x.filingsWith({ now: null, env: { BIO_NOW_MS: PINNED } });
  const ap = await approveBy(pinned, d, text);
  assert.equal(ap.ok, true, JSON.stringify(ap).slice(0, 300));
  assert.equal(ap.at, PINNED_ISO, "the approval's instant reads the pinned clock");
});

test("R70 (K5202, K5132) control: a clock handed in answers before the store's BIO_NOW_MS", async () => {
  const x = world();
  const { d, text } = drafted(x);
  const handed = x.filingsWith({ env: { BIO_NOW_MS: PINNED } });   /* the fixture hands its own `now` */
  const ap = await approveBy(handed, d, text);
  assert.equal(ap.ok, true, JSON.stringify(ap).slice(0, 300));
  assert.equal(ap.at, NOW, "the handed clock beats the environment");
});

test("R70 (K5202, K5132) control: with neither a handed clock nor an environment, the approval stamps the wall clock", async () => {
  const x = world();
  const { d, text } = drafted(x);
  const bare = x.filingsWith({ now: null, env: null });
  const before = Math.floor(Date.now() / 1000) * 1000;
  const ap = await approveBy(bare, d, text);
  const after = Date.now();
  assert.equal(ap.ok, true, JSON.stringify(ap).slice(0, 300));
  const ms = Date.parse(ap.at);
  assert.ok(ms >= before && ms <= after, `wall clock, got ${ap.at}`);
  assert.notEqual(ap.at, PINNED_ISO, "the pinned clock is not used without an environment");
});
