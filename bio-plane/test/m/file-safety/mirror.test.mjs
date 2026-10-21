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
  /* the scanner leaves its run's start in its state (file-scanner R6, fix round 4): a second press reads that, not a note of ours */
  const w = world({ scan: { signatures: NO_SET(), runTrace: true } });
  const sig = NO_SET();
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
  const w = world({ scan: { signatures: NO_SET(), runTrace: true, clamav: () => ({ result: "not_scanned", reason: "SIGNATURES_ABSENT" }) } });
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
  const w2 = world({ scan: { signatures: NO_SET(), runTrace: true } });
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

/* ---- fix round 4, C84 (K4429; file-scanner R6; R46, R50 amended): the guard and the words read the scanner's run, not this module's note ---- */
import { fileSafetyOps } from "../../../src/file-safety/index.mjs";

const MIN = 60_000;
/* the walker's row (A S-01, 2026-10-21): the stored state from the 04:17 cron, a refusal 15 hours old, then the administrator's press */
const STALE = () => ({ versions: null, published: null, mirrored_at: null, last_attempt: at(T0 - 15 * HOUR), last_error: "REFUSED:main.cvd:403" });
/* the acts as the member makes them: through the route map, never by calling the service */
const press = (w, name, search = "") => fileSafetyOps(w.fs, new URL(`http://x/${name}?viewer=member%3Aboss${search}`), {}, w.env)[name]();

test("R46, R50 (C84, the walker's row): Settings > Security's button, pressed; the scanner's run is cancelled after the response; `scanstatus` words an unfinished run, a second press 5 minutes later is refused as under way (never as 'checked a few minutes ago'), and a press after the run stopped (16 minutes with no later stage) starts the next", async () => {
  const w = world({ scan: { signatures: STALE(), runTrace: true } });
  const before = await press(w, "scanstatus");
  assert.equal(before.no_signatures.reason_key, "file-safety.index.signatures_refused", "the stale refusal is what is stored before the press");

  const first = await press(w, "scanmirror");
  assert.deepEqual([first.ok, first.state], [true, "started"]);
  assert.equal(started(w).length, 1);

  /* the invocation was cancelled after the response: the scanner's state holds the start and its stage, nothing else follows */
  const under = (await press(w, "scanstatus")).no_signatures;
  assert.equal(under.reason, "RUN_STARTED");
  assert.equal(under.reason_key, "file-safety.index.signatures_run_seed", "an unfinished run, at its stage, not a refusal");
  assert.ok(!/403|refused/i.test(under.reason_words), "the stale refusal is not drawn as this run's outcome");

  w.tick(5 * MIN);
  const again = await press(w, "scanmirror");
  assert.equal(again.ok, false);
  assert.equal(again.code, "SIGNATURES_RUN_UNDER_WAY", "refused in words that say a check is under way");
  assert.notEqual(again.code, "SIGNATURES_RUN_RECENT");
  assert.ok(again.translation && again.check, "a row of this module's own table (R24)");
  assert.equal(again.stage, "seed");
  assert.equal(started(w).length, 1, "the scanner is not asked again");

  /* a later stage keeps the run alive: 14 minutes after the start but 4 after its stage, still under way, with the stage worded */
  w.tick(9 * MIN);
  w.scanner.stage("download");
  w.tick(4 * MIN);
  assert.equal((await press(w, "scanmirror")).code, "SIGNATURES_RUN_UNDER_WAY");
  assert.equal((await press(w, "scanstatus")).no_signatures.reason_key, "file-safety.index.signatures_run_download");
  assert.equal(started(w).length, 1);

  /* 16 minutes after the latest stage, no later one: the run stopped; it is worded so, and does not block the next press */
  w.tick(12 * MIN);
  const stopped = (await press(w, "scanstatus")).no_signatures;
  assert.equal(stopped.reason_key, "file-safety.index.signatures_run_stopped");
  assert.ok(!/403|refused/i.test(stopped.reason_words));
  const next = await press(w, "scanmirror");
  assert.deepEqual([next.ok, next.state], [true, "started"], "a dead run does not block the next press");
  assert.equal(started(w).length, 2);
});

test("R50 (C84): a press 14 minutes into a run that shows RUN_STARTED and no later stage is still refused as under way (alive under 15 minutes); one 16 minutes into it is allowed (stopped)", async () => {
  const w = world({ scan: { signatures: NO_SET(), runTrace: true } });
  await press(w, "scanmirror");
  w.tick(14 * MIN);
  assert.equal((await press(w, "scanmirror")).code, "SIGNATURES_RUN_UNDER_WAY");
  w.tick(2 * MIN);
  assert.equal((await press(w, "scanmirror")).state, "started");
  assert.equal(started(w).length, 2);
});

test("R46, R50 (C84, controls): a run that ended is as before: a refusal is worded by its text (`REFUSED:main.cvd:403`, `MIRROR_REFUSED:exit 1: … 403`), a press 14 minutes after it ended is refused as R49 says and one 16 minutes after starts a run; the scanner's own note, when it shows nothing, blocks nothing", async () => {
  for (const [error, key] of [["REFUSED:main.cvd:403", "file-safety.index.signatures_refused"], ["MIRROR_REFUSED:exit 1: Downloading failed: status 403", "file-safety.index.signatures_refused"]]) {
    const w = world({ scan: { signatures: NO_SET({ last_attempt: at(T0 - 14 * MIN), last_error: error }) } });
    const s = (await press(w, "scanstatus")).no_signatures;
    assert.deepEqual([s.reason_key, s.reason_words.includes("403")], [key, true], error);
    const no = await press(w, "scanmirror");
    assert.deepEqual([no.code, no.attempted_at], ["SIGNATURES_RUN_RECENT", at(T0 - 14 * MIN)], "refused as R49 says");
    assert.equal(started(w).length, 0);
    w.tick(2 * MIN);
    assert.equal((await press(w, "scanmirror")).state, "started");
  }
  /* a run the scanner's own end cleared: its outcome is read as before */
  const w = world({ scan: { signatures: NO_SET(), runTrace: true } });
  await press(w, "scanmirror");
  w.scanner.end("MIRROR_REFUSED:exit 1: status 403");
  assert.equal((await press(w, "scanstatus")).no_signatures.reason_key, "file-safety.index.signatures_refused");
  /* this module keeps no note of when it asked: a scanner that shows nothing blocks nothing, however recently it was asked */
  const quiet = world({ scan: { signatures: NO_SET() } });
  await press(quiet, "scanmirror");
  quiet.tick(MIN);
  assert.equal((await press(quiet, "scanmirror")).state, "started");
  assert.equal(started(quiet).length, 2);
});

test("R50 (C84): the six-hour self-start leaves a run alive, and an open request, to the cron: a batch starts nothing while the scanner shows either; a stopped run with no attempt for 7 hours and no request is started again", async () => {
  const alive = world({ scan: { signatures: NO_SET({ last_attempt: at(T0 - 7 * HOUR), last_error: "RUN_STARTED", stage: "download", stage_at: at(T0 - 5 * MIN) }) } });
  await alive.capture(pdf(false, "a"));
  await alive.fs.scanBatch({});
  assert.equal(started(alive).length, 0, "a run alive");
  const open = world({ scan: { signatures: NO_SET({ last_attempt: at(T0 - 7 * HOUR), request: { at: at(T0 - 3 * MIN) } }) } });
  await open.capture(pdf(false, "b"));
  await open.fs.scanBatch({});
  assert.equal(started(open).length, 0, "a request open");
  const dead = world({ scan: { signatures: NO_SET({ last_attempt: at(T0 - 7 * HOUR), last_error: "RUN_STARTED", stage: "seed", stage_at: at(T0 - 7 * HOUR) }) } });
  await dead.capture(pdf(false, "c"));
  await dead.fs.scanBatch({});
  assert.equal(started(dead).length, 1, "control: a stopped run, nothing for 7 hours");
});
