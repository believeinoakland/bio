/* file-safety R49, R50 (fix round 3, C84; K4356; file-scanner R6): the door and the self-start of a signature run. At the module's
   interface, over the scripted scanner binding (fixture.mjs), which records every request so a test reads whether, and how often,
   the scanner was asked to start a run. The scanner's half (`POST /mirror?async=1` answers 202) is file-scanner's own test; here
   it is a scripted double of that interface. The refusal's words are read from its row, never copied (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, pdf, DAY, T0 } from "./fixture.mjs";

const HOUR = 3_600_000;
const boss = "member:boss";
const at = (ms) => new Date(ms).toISOString();
const NO_SET = (extra = {}) => ({ versions: null, published: null, mirrored_at: null, last_attempt: null, last_error: null, ...extra });
const started = (w) => w.scanner.calls.filter((c) => c.path === "/mirror");

test("R49: `scanMirror` (an administrator's act) asks the scanner to start a run once, with ?async=1, and answers started at once; it refuses a member, no scanner bound, and an attempt under 15 minutes old, saying when it was made", async () => {
  const sig = NO_SET();
  const w = world({ scan: { signatures: sig } });
  const r = await w.fs.scanMirror({ viewer: boss });
  assert.deepEqual([r.ok, r.state], [true, "started"]);
  assert.equal(started(w).length, 1, "the scanner is asked once");
  assert.deepEqual([started(w)[0].method, started(w)[0].search], ["POST", "?async=1"], "the run is started without waiting for it");

  /* the scanner's own last attempt: 14 minutes ago is refused and the scanner is not asked; the refusal is a row of this module's table */
  sig.last_attempt = at(T0 - 14 * 60_000);
  const w2 = world({ scan: { signatures: sig } });
  const no = await w2.fs.scanMirror({ viewer: boss });
  assert.equal(no.ok, false);
  assert.ok(no.code && no.check && no.translation, "a refusal of this module's own table (R24)");
  assert.equal(no.attempted_at, sig.last_attempt, "it says when the attempt was made");
  assert.equal(started(w2).length, 0, "the scanner is not asked");

  /* control: 16 minutes after an attempt, a run starts */
  sig.last_attempt = at(T0 - 16 * 60_000);
  const w3 = world({ scan: { signatures: sig } });
  assert.equal((await w3.fs.scanMirror({ viewer: boss })).state, "started");
  assert.equal(started(w3).length, 1);

  /* a second press right after the first is an attempt like any other: refused inside 15 minutes, a run again after them */
  const again = await w.fs.scanMirror({ viewer: boss });
  assert.equal(again.ok, false);
  assert.equal(started(w).length, 1, "the double press asks the scanner no second time");
  w.tick(16 * 60_000);
  assert.equal((await w.fs.scanMirror({ viewer: boss })).state, "started");
  assert.equal(started(w).length, 2);

  /* a member, a machine and no viewer are refused and ask nothing */
  const w4 = world({ scan: { signatures: NO_SET() } });
  for (const viewer of ["member:m1", "__daemon__", undefined]) {
    const x = await w4.fs.scanMirror({ viewer });
    assert.equal(x.ok, false);
    assert.equal(x.code, "NOT_AN_ADMIN");
  }
  assert.equal(started(w4).length, 0);
  /* no scanner bound: SCANNER_ABSENT, asks nothing */
  const unbound = world({ bound: false });
  assert.equal((await unbound.fs.scanMirror({ viewer: boss })).code, "SCANNER_ABSENT");
  /* a scanner that did not accept the start is not claimed to have started one */
  const down = world({ scan: { signatures: NO_SET(), mirror: () => new Response("{}", { status: 503, headers: { "content-type": "application/json" } }) } });
  const failed = await down.fs.scanMirror({ viewer: boss });
  assert.equal(failed.ok, false);
  assert.equal(failed.code, "SCANNER_UNREACHABLE");
});

test("R50: a scan batch that finds no signatures and no attempt in six hours starts one run, with no administrator's act; a second batch an hour later starts none; one seven hours after starts one; the files stay not_scanned and due", async () => {
  const sig = NO_SET();
  const w = world({ scan: { signatures: sig, clamav: () => ({ result: "not_scanned", reason: "SIGNATURES_ABSENT" }) } });
  for (let i = 0; i < 3; i++) await w.capture(pdf(false, `f${i}`));
  const r = await w.fs.scanBatch({});
  assert.deepEqual([r.ok, r.scanned, r.not_scanned], [true, 0, 3], "answers as R4 does: the files stay not_scanned");
  assert.equal(started(w).length, 1, "one run is started");
  assert.equal(started(w)[0].search, "?async=1");
  assert.equal((await w.fs.scanStatus({ viewer: boss })).queued, 3, "and due");

  w.tick(HOUR);
  await w.fs.scanBatch({});
  assert.equal(started(w).length, 1, "a second batch an hour later starts none: the attempt is the one made");

  w.tick(7 * HOUR);
  await w.fs.scanBatch({});
  assert.equal(started(w).length, 2, "a batch seven hours after the attempt starts one");

  /* an administrator's run (R49) is an attempt like any other: a batch right after it starts none */
  const w2 = world({ scan: { signatures: NO_SET() } });
  await w2.capture(pdf(false, "g"));
  assert.equal((await w2.fs.scanMirror({ viewer: boss })).state, "started");
  await w2.fs.scanBatch({});
  assert.equal(started(w2).length, 1);

  /* the scanner's own last attempt counts too: one under six hours old starts none, one older (or none) starts one */
  const recent = world({ scan: { signatures: NO_SET({ last_attempt: at(T0 - 5 * HOUR) }) } });
  await recent.capture(pdf(false, "h"));
  await recent.fs.scanBatch({});
  assert.equal(started(recent).length, 0, "control: an attempt under 6 hours old");
  const old = world({ scan: { signatures: NO_SET({ last_attempt: at(T0 - 7 * HOUR), last_error: "MIRROR_REFUSED:exit 1: x" }) } });
  await old.capture(pdf(false, "i"));
  await old.fs.scanBatch({});
  assert.equal(started(old).length, 1);
});

test("R50 (controls): with a published set, with no scanner bound, with no file due and when the scanner's state cannot be read, a scan batch starts nothing; `scanStatus` is a read and starts nothing (R5)", async () => {
  const set = world();   /* the default scripted scanner holds a set published an hour ago */
  await set.capture(pdf(false, "a"));
  await set.fs.scanBatch({});
  assert.equal(started(set).length, 0, "a published set");

  const unbound = world({ bound: false });
  assert.equal((await unbound.fs.scanBatch({})).code, "SCANNER_ABSENT");

  const status = world({ scan: { signatures: NO_SET() } });
  await status.capture(pdf(false, "b"));
  for (let i = 0; i < 3; i++) { assert.equal((await status.fs.scanStatus({ viewer: boss })).ok, true); status.tick(DAY); }
  assert.equal(started(status).length, 0, "scanStatus starts nothing");

  const blind = world({ scan: { signatures: NO_SET() } });
  await blind.capture(pdf(false, "c"));
  const real = blind.scanner.fetch.bind(blind.scanner);
  blind.env.FILE_SCANNER.fetch = async (req) => {
    if (new URL(req.url).pathname === "/version") throw new Error("down");
    return real(req);
  };
  await blind.fs.scanBatch({});
  assert.equal(started(blind).length, 0, "a state that cannot be read is not claimed to hold no signatures");
});
