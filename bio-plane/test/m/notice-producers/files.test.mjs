/* R14 and R15 (T36; N707, N710, DEC-169 (4), K1892, K1913, K1929): a file held after a scan, and a security tool switched
   off, over the real `file-safety` (its R15 `scanFindings`, R16 holds, R27 `securityTools`, R29 tests, R31 events,
   R38 `findingKind`), the real `provenance` (`homeOf`, R14's home) and the real `membership`, on file-safety's own test
   world: members `m1`, `m2` and the administrator `boss`, a scripted scanner, the modules' clock moved by the test. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, pdf, sha } from "../file-safety/fixture.mjs";
import { findingKind } from "../../../src/file-safety/index.mjs";
import { fresh, reader, ofKind, sentences, texts, notHintFailures, JUDGMENT } from "./fixture.mjs";
import { HINT_MARK, NOTICE_KINDS, SCAN_FINDINGS_MAX, TOOL_EVENTS_MAX } from "../../../src/notice-producers/index.mjs";

const FOUND = "found", OFF = "security-tool-off", KIND = "scan-found";
const NAMES = { bad: "Xls.Downloader.Agent-917", other: "Pdf.Unheard.Variant-1" };

/* A world whose ClamAV finds `NAMES.bad` in the file tagged "bad", and two names in the one tagged "two". */
async function files() {
  const w = world({ scan: { clamav: (s) => (s === sha(pdf(false, "bad")) ? { result: FOUND, findings: [NAMES.bad] }
    : s === sha(pdf(false, "two")) ? { result: FOUND, findings: [NAMES.bad, NAMES.other] } : { result: "clean" }) } });
  const bad = await w.capture(pdf(false, "bad"));
  const ok = await w.capture(pdf(false, "ok"));
  await w.fs.scanBatch({});
  w.exec(`CREATE TABLE IF NOT EXISTS duties (duty_id TEXT, obligor TEXT)`);   /* duties' table, empty (R5) */
  const n = fresh(w.host, { membership: w.membership, fileSafety: w.fs, provenance: w.prov });
  const { read } = reader(n);
  const items = (member, kind = KIND) => ofKind(read(member, { now: w.clock.now }), kind);
  return { w, n, bad, ok, read, items };
}

test("R14: one FINDING scan-found per found note scanFindings answers, keyed by capture and note, to each active member who may see the capture and to nobody else", async () => {
  const { w, bad, items } = await files();
  const note = w.fs.scanFindings({ viewer: "member:m1" }).findings[0];
  assert.equal(note.captureSha, bad);
  for (const m of ["m1", "m2", "boss"]) {
    const got = items(m);
    assert.deepEqual(got.map((i) => i.id), [`FINDING::${KIND}::${bad}::${note.note_id}`], m);
    assert.equal(got[0].class, "FINDING");
    assert.equal(NOTICE_KINDS[KIND], "FINDING");
    assert.deepEqual(got[0].recipients, [m]);
  }
  /* a member no longer active, nobody, and a machine receive none */
  w.exec(`UPDATE members SET status='revoked' WHERE member_id='m2'`);
  assert.deepEqual(items("m2"), []);
  for (const m of [null, "nobody"]) assert.deepEqual(items(m), [], String(m));
  assert.deepEqual(ofKind(reader(fresh(w.host, { membership: w.membership, fileSafety: w.fs, provenance: w.prov }))
    .read("class:daemon", { viewer: "class:daemon", now: w.clock.now }), KIND), []);
  /* raised once per note: a later read answers the same key; a second note on another file is a second item */
  assert.deepEqual(items("m1").map((i) => i.id), items("m1").map((i) => i.id));
  const two = await w.capture(pdf(false, "two"));
  await w.fs.scanBatch({});
  assert.deepEqual(items("m1").map((i) => i.subject.capture), [bad, two]);
});

test("R14 R7: a finding on a capture the viewer may not see is no item and is not counted; its subject is the capture's home (provenance.homeOf)", async () => {
  const { w, bad, items, read } = await files();
  w.project("PROJ-1", "m1");
  w.home(bad, "INFO-P", { project: "PROJ-1" });
  assert.equal(w.prov.homeOf(bad).bundleId, "INFO-P");
  const mine = items("m1");
  assert.equal(mine.length, 1);
  assert.deepEqual(mine[0].subject, { kind: "capture_home", id: "INFO-P", capture: bad, note: mine[0].subject.note });
  assert.deepEqual(mine[0].basis.home, "INFO-P");
  const theirs = read("m2", { now: w.clock.now });
  assert.deepEqual(ofKind(theirs, KIND), []);
  assert.deepEqual(theirs.facts.scan_found, { bound: SCAN_FINDINGS_MAX, truncated: false }, "a bound and a flag, never a count");
  assert.ok(!texts(theirs).some((t) => t.includes(bad) || t.includes("INFO-P") || t.includes("PROJ-1")));
});

test("R14: its detail states the file is held: the finding names with engine, tool and date in findingKind's words, the safe view open, the release rule; it names no member and is no hint", async () => {
  const { w, items } = await files();
  const two = await w.capture(pdf(false, "two"));
  await w.fs.scanBatch({});
  const it = items("m1").find((i) => i.subject.capture === two);
  const day = new Date(w.clock.now).toISOString().slice(0, 10);
  assert.match(it.detail, /^This file is held: /);
  assert.ok(it.detail.includes(`on ${day} clamav, the tool clamav found ${NAMES.bad}, ${NAMES.other} in it.`), it.detail);
  for (const n of [NAMES.bad, NAMES.other]) assert.ok(it.detail.includes(`${n}: ${findingKind(n).words}`), n);
  assert.ok(it.detail.includes("Civicsmith has no plain description of this name"), "a name no row explains says so");
  assert.match(it.detail, /Its safe view stays open\./);
  assert.match(it.detail, /The original opens again only when two members each release the hold with a reason, or when a second, different engine's clean check releases a hold the built-in scanner alone placed; the machine never can\./);
  assert.deepEqual(it.basis.findings.map((k) => [k.name, k.threat_kind]), [[NAMES.bad, "Downloader"], [NAMES.other, "Unheard"]]);
  for (const s of [...sentences(it), ...texts(it.basis)]) for (const m of ["m1", "m2", "boss", "member:"]) assert.ok(!s.includes(m), `${m} in ${s}`);
  assert.deepEqual(notHintFailures(it, HINT_MARK), []);
  assert.equal("label" in it, false, "a scanner's verdict, not the machine's noticing");
  for (const s of sentences(it)) assert.doesNotMatch(s, JUDGMENT, s);
});

test("R14: scanFindings is followed by its cursor to at most 1,000 findings, pages of at most 200, as the viewer, facts naming the bound and truncated", async () => {
  const { w } = await files();
  const over = (total) => {
    const asked = [];
    const fileSafety = { ...w.fs, securityToolEvents: () => ({ ok: true, events: [], cursor: null, truncated: false }),
      scanFindings: ({ after, limit, viewer }) => {
        asked.push({ after, limit, viewer });
        const from = after === null ? 0 : Number(after);
        const page = Array.from({ length: Math.max(0, Math.min(limit, total - from)) }, (_, k) => ({ captureSha: "a".repeat(64),
          note_id: `FSN-${from + k}`, tool: "clamav", engine: "clamav", findings: [NAMES.bad], at: "2026-10-08T12:00:00Z" }));
        return { ok: true, findings: page, cursor: String(from + page.length), truncated: from + page.length < total };
      } };
    const r = reader(fresh(w.host, { membership: w.membership, fileSafety, provenance: w.prov })).read("m1", { now: w.clock.now });
    return { r, asked };
  };
  const at = over(SCAN_FINDINGS_MAX);
  assert.equal(ofKind(at.r, KIND).length, SCAN_FINDINGS_MAX);
  assert.deepEqual(at.r.facts.scan_found, { bound: SCAN_FINDINGS_MAX, truncated: false });
  const past = over(SCAN_FINDINGS_MAX + 1);
  assert.equal(ofKind(past.r, KIND).length, SCAN_FINDINGS_MAX);
  assert.deepEqual(past.r.facts.scan_found, { bound: SCAN_FINDINGS_MAX, truncated: true });
  assert.ok(past.asked.every((a) => a.limit <= 200 && a.viewer === "member:m1"));
  assert.equal(past.asked.reduce((n, a) => n + a.limit, 0), SCAN_FINDINGS_MAX);
});

test("R14 R1: a scanFindings or homeOf that throws or refuses contributes no item and is named in facts.failed; the read writes nothing", async () => {
  const { w } = await files();
  const boom = () => { throw new Error("down"); };
  const run = (deps) => reader(fresh(w.host, { membership: w.membership, fileSafety: w.fs, provenance: w.prov, ...deps })).read("m1", { now: w.clock.now });
  for (const [deps, name] of [[{ fileSafety: { ...w.fs, scanFindings: boom, securityToolEvents: w.fs.securityToolEvents.bind(w.fs) } }, "file-safety"],
                              [{ fileSafety: { scanFindings: () => ({ ok: false, code: "X" }), securityToolEvents: () => ({ ok: true, events: [], truncated: false }) } }, "file-safety"],
                              [{ provenance: { homeOf: boom } }, "provenance"]]) {
    const r = run(deps);
    assert.deepEqual(ofKind(r, KIND), [], name);
    assert.ok(r.facts.failed.includes(name), name);
  }
  const before = w.tables(), rows = w.exec(`SELECT * FROM members`);
  assert.equal(ofKind(run({}), KIND).length, 1);
  assert.deepEqual(w.tables(), before);
  assert.deepEqual(w.exec(`SELECT * FROM members`), rows);
});

/* ------------------------------------------------------------------ R15 */

/* A tool on routine use that answers PRIVATE_MODE_NOT_HONOURED on the next scan (switched off, file-safety R31). */
async function tools() {
  let honour = false;
  const w = world({ scan: { provider: { "metadefender-core": () => (honour ? [{ engine: "avira", result: "clean" }] : { code: "PRIVATE_MODE_NOT_HONOURED" }) } } });
  const id = await w.tool("metadefender-core", { use: "routine", config: { host: "md.example.org" } });
  const file = await w.capture(pdf(false, "pm"));
  w.tick(1000);
  await w.fs.scanBatch({});
  w.exec(`CREATE TABLE IF NOT EXISTS duties (duty_id TEXT, obligor TEXT)`);   /* duties' table, empty (R5) */
  const n = fresh(w.host, { membership: w.membership, fileSafety: w.fs, provenance: w.prov });
  const { read } = reader(n);
  const items = (member) => ofKind(read(member, { now: w.clock.now }), OFF);
  return { w, id, file, read, items, honour: (v) => { honour = v; } };
}

test("R15: one FINDING security-tool-off per event that switched a tool off, keyed by tool and instant, to each active administrator and to nobody else", async () => {
  const { w, id, items } = await tools();
  const ev = w.fs.securityToolEvents({ viewer: "member:boss" }).events.find((e) => e.event === "switched_off");
  const got = items("boss");
  assert.deepEqual(got.map((i) => i.id), [`FINDING::${OFF}::${id}::${ev.at}`]);
  assert.equal(got[0].class, "FINDING");
  assert.equal(NOTICE_KINDS[OFF], "FINDING");
  assert.deepEqual(got[0].recipients, ["boss"]);
  assert.deepEqual(got[0].subject, { kind: "civicsmith", id: null, tool: id, provider: "metadefender-core" });
  assert.deepEqual(got[0].case.ancestors, [], "the group's Civicsmith, no bundle");
  for (const m of ["m1", "m2", null]) assert.deepEqual(items(m), [], String(m));
  w.exec(`UPDATE members SET status='revoked' WHERE member_id='boss'`);
  assert.deepEqual(items("boss"), [], "an administrator no longer active");
});

test("R15: its detail names the tool, that it was switched off for not confirming its private mode, and that it stays off until an administrator tests it again; no file and no member", async () => {
  const { w, id, file, items } = await tools();
  const [it] = items("boss");
  const day = new Date(w.clock.now).toISOString().slice(0, 10);
  assert.equal(it.detail, `The security tool metadefender-core (${id}) was switched off on ${day} because it did not confirm the private mode its handling requires. It stays off until an administrator tests it again.`);
  for (const t of [...sentences(it), ...texts(it.subject), ...texts(it.basis)]) {
    assert.ok(!t.includes(file.slice(0, 12)), `a file in ${t}`);
    for (const m of ["m1", "m2", "boss", "member:"]) assert.ok(!t.includes(m), `${m} in ${t}`);
  }
  assert.deepEqual(notHintFailures(it, HINT_MARK), []);
});

test("R15: raised once per event; it leaves when the tool is on again, and a later switch raises a fresh one", async () => {
  const { w, id, items, honour } = await tools();
  const first = items("boss").map((i) => i.id);
  assert.deepEqual(items("boss").map((i) => i.id), first, "the same key on every read");
  w.tick(60_000);
  assert.equal((await w.fs.securityToolTest({ toolId: id, by: "boss" })).state, "on");
  assert.deepEqual(items("boss"), [], "on again: it leaves");
  /* off once more: the earlier event stays covered by the test that passed after it; the new one is a fresh item */
  w.tick(60_000);
  await w.capture(pdf(false, "pm2"));
  await w.fs.scanBatch({});
  const again = items("boss");
  assert.equal(again.length, 1);
  assert.notDeepEqual(again.map((i) => i.id), first);
  /* a tool tested on whose events the read did not reach is on in securityTools: no item */
  honour(true);
  const n = fresh(w.host, { membership: w.membership, provenance: w.prov, fileSafety: { scanFindings: w.fs.scanFindings.bind(w.fs),
    securityToolEvents: (a) => w.fs.securityToolEvents(a),
    securityTools: (a) => { const t = w.fs.securityTools(a); return { ...t, tools: t.tools.map((x) => ({ ...x, state: "on" })) }; } } });
  assert.deepEqual(ofKind(reader(n).read("boss", { now: w.clock.now }), OFF), []);
});

test("R15: securityToolEvents is followed by its cursor to at most 1,000 events under the administrator's own viewer, facts naming the bound and truncated", async () => {
  const { w, id } = await tools();
  const over = (total) => {
    const asked = [];
    const fileSafety = { scanFindings: () => ({ ok: true, findings: [], cursor: null, truncated: false }),
      securityTools: (a) => w.fs.securityTools(a),
      securityToolEvents: ({ after, limit, viewer }) => {
        asked.push({ after, limit, viewer });
        const from = after === null ? 0 : Number(after);
        const page = Array.from({ length: Math.max(0, Math.min(limit, total - from)) }, (_, k) => ({ tool_id: id, event: "switched_off",
          at: new Date(Date.parse("2026-10-08T00:00:00Z") + (from + k) * 1000).toISOString() }));
        return { ok: true, events: page, cursor: String(from + page.length), truncated: from + page.length < total };
      } };
    const r = reader(fresh(w.host, { membership: w.membership, fileSafety, provenance: w.prov })).read("boss", { now: w.clock.now });
    return { r, asked };
  };
  const at = over(TOOL_EVENTS_MAX);
  assert.equal(ofKind(at.r, OFF).length, TOOL_EVENTS_MAX);
  assert.deepEqual(at.r.facts.security_tool_off, { bound: TOOL_EVENTS_MAX, truncated: false });
  const past = over(TOOL_EVENTS_MAX + 1);
  assert.equal(ofKind(past.r, OFF).length, TOOL_EVENTS_MAX);
  assert.deepEqual(past.r.facts.security_tool_off, { bound: TOOL_EVENTS_MAX, truncated: true });
  assert.ok(past.asked.every((a) => a.limit <= 200 && a.viewer === "member:boss"));
});

test("R15 R1: a read that refuses or throws contributes no item and is named in facts.failed; a member who is no administrator never asks; the read writes nothing", async () => {
  const { w, read } = await tools();
  const boom = () => { throw new Error("down"); };
  const scan = { scanFindings: () => ({ ok: true, findings: [], cursor: null, truncated: false }) };
  for (const fileSafety of [{ ...scan, securityToolEvents: boom }, { ...scan, securityToolEvents: () => ({ ok: false, code: "NOT_AN_ADMIN" }) },
                            { ...scan, securityToolEvents: (a) => w.fs.securityToolEvents(a), securityTools: boom }]) {
    const r = reader(fresh(w.host, { membership: w.membership, fileSafety, provenance: w.prov })).read("boss", { now: w.clock.now });
    assert.deepEqual(ofKind(r, OFF), []);
    assert.deepEqual(r.facts.failed, ["file-safety"]);
  }
  const quiet = reader(fresh(w.host, { membership: w.membership, provenance: w.prov, fileSafety: { ...scan, securityToolEvents: boom, securityTools: boom } }))
    .read("m1", { now: w.clock.now });
  assert.deepEqual(quiet.facts.failed, []);
  const before = w.tables();
  assert.equal(ofKind(read("boss", { now: w.clock.now }), OFF).length, 1);
  assert.deepEqual(w.tables(), before);
});

test("R14 (T36): it leaves when its recipient disposes of it: the read answers it, keyed per note, whatever becomes of the hold, so queue's disposal (its key) is what removes it", async () => {
  const { w, bad, items } = await files();
  const before = items("m1").map((i) => i.id);
  assert.equal(before.length, 1);
  assert.equal(w.fs.releaseScanHold({ captureSha: bad, by: "m1", reason: "read it" }).state, "pending_second");
  assert.equal(w.fs.releaseScanHold({ captureSha: bad, by: "member:m2", reason: "a false match" }).state, "released");
  assert.deepEqual(items("m1").map((i) => i.id), before, "the same key: queue holds its recipient's disposal of it");
});

test.todo("R14 (T37, N771, K2155): it leaves when file-safety answers that no open hold covers that finding any longer (scanFindings' synchronous `held`): file-safety's threatOf is async and noticeItems, read synchronously by queue, cannot await it");
