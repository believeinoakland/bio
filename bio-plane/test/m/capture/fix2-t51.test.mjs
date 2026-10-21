/* capture, T51 fix round 2 (the walk's C5 upload half, C14, C26): at the module's interface, over record-core's evidence
   store, provenance's stand-in and the capture store (fixture.mjs). Each test names the requirement ids it proves. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, sha } from "./fixture.mjs";

const MiB = 1024 * 1024;
const te = new TextEncoder();
const STATEMENT = "a scan the clerk handed me at the counter";
const AT = "2026-10-09T12:00:00Z";
const setup = () => { const b = bucket(); const f = fresh({ evidence: b, env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } }); return { ...f, b }; };
const varied = (n) => { const u = new Uint8Array(n); for (let i = 0; i < n; i++) u[i] = (i * 31 + (i >> 8)) & 255; return u; };

test("R86 (C5; acquisition R10): a file over 16 MiB (three parts) is kept whole under its own digest as well as in its parts, and its document reads back whole; a single part is unchanged; a part gone at read-back is UPLOAD_NOT_STORED and writes nothing", async () => {
  const { c, b, rows } = setup();
  const big = varied(16 * MiB + 5);
  const r = await c.uploadCapture({ bytes: big, statement: STATEMENT, by: "m1", at: AT });
  assert.equal(r.ok, true);
  assert.equal(r.document.parts.length, 3);
  assert.equal(r.document.capture.sha256, sha(big));
  const whole = b.held.get(`bio/captures/${sha(big)}`);
  assert.ok(whole, "an object is held under the document's own fingerprint");
  assert.equal(sha(whole), sha(big));
  for (const p of r.document.parts) assert.ok(b.held.has(`bio/captures/${p.sha256}`), "the parts stay held");
  /* control: one part is one object */
  const one = setup();
  const small = te.encode("the budget memo");
  assert.equal((await one.c.uploadCapture({ bytes: small, statement: STATEMENT, by: "m1", at: AT })).ok, true);
  assert.equal(one.b.calls.filter((x) => x[0] === "put").length, 1);
  /* a part gone at read-back: refused, nothing written */
  const miss = setup();
  const parts = [sha(big.subarray(0, 8 * MiB)), sha(big.subarray(8 * MiB, 16 * MiB)), sha(big.subarray(16 * MiB))];
  const get = miss.b.get.bind(miss.b);
  miss.b.get = async (k) => (k.endsWith(parts[2]) ? null : get(k));
  const before = JSON.stringify(miss.rows("SELECT * FROM captured_locators"));
  const rr = await miss.c.uploadCapture({ bytes: big, statement: STATEMENT, by: "m1", at: AT });
  assert.deepEqual([rr.ok, rr.reason, rr.document], [false, "UPLOAD_NOT_STORED", undefined]);
  assert.equal(JSON.stringify(miss.rows("SELECT * FROM captured_locators")), before, "no receipt");
  assert.equal(miss.rows("SELECT COUNT(*) AS n FROM capture_actors")[0].n, 0, "no actor");
});

test("R68 (C12; acquisition R20): an attestation that ended after its capture was answered is recorded against the capture when it ends, as a late attestation, in the order appended; a bad digest records nothing", async () => {
  const { c, rows } = setup();
  const SHA = sha("a captured page");
  const timestamp = { service: "http://timestamp.digicert.com", attempted: true, ok: true, kind: "rfc3161", token_sha256: "ab".repeat(32), token_bytes: 6628, at: "2026-10-21T08:06:46Z" };
  const failed = { service: "web.archive.org/save (anonymous)", attempted: true, ok: false, note: "fetch failed", at: "2026-10-21T08:06:47Z" };
  const r = await c.recordLateAttestations({ captureSha: SHA, attempts: [timestamp, failed], by: "m1" });
  assert.deepEqual([r.ok, r.recorded], [true, 2]);
  const got = c.lateAttestationsOf(SHA).late_attestations;
  assert.deepEqual(got.map((x) => [x.seq, x.kind, x.service, x.ok, x.by, x.late]), [[1, "timestamp", timestamp.service, true, "m1", true], [2, "co_archive", failed.service, false, "m1", true]]);
  assert.equal(got[0].token_sha256, timestamp.token_sha256);
  assert.match(got[0].proves, /existed by 2026-10-21T08:06:46Z/);
  assert.equal(got[1].note, "fetch failed");
  /* appended after what is there */
  await c.recordLateAttestations({ captureSha: SHA, attempts: [timestamp], by: null });
  assert.deepEqual(c.lateAttestationsOf(SHA).late_attestations.map((x) => x.seq), [1, 2, 3]);
  /* controls: a bad digest, no attempts, and attempts that are not attempts record nothing, and never throw */
  const before = JSON.stringify(rows("SELECT * FROM late_attestations"));
  for (const a of [{ captureSha: "nope", attempts: [timestamp] }, { captureSha: SHA, attempts: [] }, { captureSha: SHA, attempts: [null, 5, "x"] }, { captureSha: SHA }, undefined]) {
    const x = await c.recordLateAttestations(a);
    assert.equal(x.recorded, 0);
  }
  assert.equal(JSON.stringify(rows("SELECT * FROM late_attestations")), before);
});

/* ---------- C14: heldCaptures in a bounded number of store reads, and a picker read ---------- */
import { readFileSync, writeFileSync } from "node:fs";
import { receipt, register, H } from "./fixture.mjs";

const NOW = "2026-03-11T00:00:00Z";
/* n held documents of every shape the list answers: projects, actors, sources, two captures under one document, vouched ones
   (with their release in the document's own state history), set-aside ones, and questions asked of the registered readers. */
function bigWorld(n) {
  const f = fresh();
  const s = f.s;
  for (const m of ["m1", "m2"]) s.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES (?, 'c', 'member', 'active', '2026-01-01', '2026-01-01')`, m);
  s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version) VALUES ('PROJ-1', 'project', 'g', 'p', 'active', '2026-01-01', '2026-01-01', 'x', 1)`);
  s.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, created, updated) VALUES ('PROJ-1', 'm1', 'active', '2026-01-01', '2026-01-01')`);
  const day = (i) => `2026-01-${String(1 + (i % 28)).padStart(2, "0")}T00:00:00Z`;
  const aside = [];
  for (let i = 0; i < n; i++) {
    const id = `INFO-${String(i).padStart(3, "0")}`, vouched = i % 6 === 5;
    s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, prior_state, created, last_updated, bundle_sha, row_version, project)
                VALUES (?, 'information', 'g', ?, ?, ?, ?, ?, 'x', 1, ?)`, id, i % 9 === 0 ? null : `title ${id}`, vouched ? "verified" : "collected",
               i % 4 === 3 ? "verified" : null, day(i), i % 4 === 3 ? day(i + 3) : day(i), i % 3 === 0 ? "PROJ-1" : null);
    const first = H(`a${String(i).padStart(4, "0")}`);
    s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, registered, bytes) VALUES (?, ?, 'x', ?, ?)`, first, id, `2026-01-01T00:00:${String(i % 60).padStart(2, "0")}.000Z`, 1000 + i);
    if (i % 5 === 0) s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, registered, bytes) VALUES (?, ?, 'y', '2026-01-02T00:00:00.000Z', 7)`, H(`b${String(i).padStart(4, "0")}`), id);
    if (i % 7 !== 0) receipt(s, { address: `https://h${i % 4}.example/doc-${i}`, capture: first, first: day(i) });
    if (i % 8 === 0) receipt(s, { address: `https://h${i % 4}.example/other-${i}`, capture: first, first: day(i + 1), via: "archive.org" });
    /* the document's own register document, which names how each capture was profiled (acquisition R17) */
    s.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?, 'data/provenance.json', ?, NULL, 1, 'x')`, id,
               JSON.stringify({ documents: [{ capture: { sha256: first }, profile: { format: { format: i % 13 === 0 ? "zip" : "pdf" } } }] }));
    if (i % 3 !== 2) f.c.recordCaptureActor({ captureSha: first, actor: i % 2 ? "m1" : "member:m2", at: day(i) });
    if (i % 4 === 0) f.c.recordCapturedFor({ captureSha: first, question: `INQ-${i % 5}`, by: "m1", at: day(i) });
    if (vouched)
      s.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?, 'bundle.md', ?, NULL, 1, 'x')`, id,
                 `---\nstate_history:\n  - to_state: verified\n    author: m2\n    timestamp: 2026-02-0${1 + (i % 9)}T00:00:00Z\n---\nbody\n`);
    if (i % 11 === 4 && !vouched) aside.push(id);
  }
  /* R78's examination and R83's reader, as later modules register them */
  const asked = { examined: 0, read: 0 };
  f.c.registerReader("batch-examination", "ratification", (b) => { asked.examined++; return Number(b.slice(5)) % 2 ? { eligible: false, class: "crucial", reason: "r" } : { eligible: true }; });
  f.c.registerReader("captured-for", "capture-requests", ({ document, asks }) => { asked.read++;
    return { questions: asks.map((a, k) => ({ question: a.question, asker: a.asker, title: `Question ${a.question}`, visible: (Number(document.slice(5)) + k) % 3 !== 0, waiting: k % 2 === 0 })) }; });
  if (aside.length) assert.equal(f.c.setAside({ ids: aside, reason: "wrong page", author: "m1", viewer: "class:admin" }).ok, true);
  s.sql.exec(`UPDATE held_acts SET at = '2026-02-20T00:00:00Z'`);   // the act's instant is the wall clock's: pinned, so the list compares exactly
  return { ...f, asked };
}
const lists = async (c, extra = {}) => ({
  held: await c.heldCaptures({ viewer: "class:admin", now: NOW, limit: 1000, ...extra }),
  vouched: await c.heldCaptures({ viewer: "class:admin", now: NOW, limit: 1000, state: "held_and_vouched", ...extra }),
  aside: await c.heldCaptures({ viewer: "class:admin", now: NOW, limit: 1000, state: "set_aside", ...extra }),
  mine: await c.heldCaptures({ viewer: "member:m1", member: "m1", project: "PROJ-1", now: NOW, limit: 7, sort: "source", ...extra }),
});
const GOLDEN = new URL("./held-golden.json", import.meta.url);
const counting = (s) => { const k = { n: 0 }; const exec = s.sql.exec.bind(s.sql); s.sql.exec = (...a) => { k.n++; return exec(...a); }; return k; };

test("R77 R88 (C14) control: the full list is unchanged in content (every state, filter and sort, against the list as it was answered before the reads were batched)", async () => {
  const { c } = bigWorld(40);
  const got = JSON.parse(JSON.stringify(await lists(c)));
  if (process.env.WRITE_GOLDEN === "1") writeFileSync(GOLDEN, JSON.stringify(got, null, 1));
  const want = JSON.parse(readFileSync(GOLDEN, "utf8"));
  for (const k of Object.keys(want)) for (let i = 0; i < want[k].held.length; i++) assert.deepEqual(got[k].held[i], want[k].held[i], `${k}[${i}]`);
  assert.deepEqual(got, want);
  assert.ok(got.held.held.length > 20 && got.vouched.held.some((r) => r.standing === "verified") && got.aside.held.length >= 3, "the world holds every shape");
});

test("R77 R88 (C14): 60 held rows are answered in a bounded number of store reads, not a number that grows with the rows; the registered examination is still asked once for each document", async () => {
  const small = bigWorld(6), big = bigWorld(60);
  const a = counting(small.s), b = counting(big.s);
  const r1 = await small.c.heldCaptures({ viewer: "class:admin", now: NOW, limit: 1000 });
  const r2 = await big.c.heldCaptures({ viewer: "class:admin", now: NOW, limit: 1000 });
  assert.ok(r1.held.length >= 4 && r2.held.length >= 40, `rows: ${r1.held.length}, ${r2.held.length}`);
  assert.ok(b.n - a.n <= 12, `reads grew with the rows: ${a.n} for ${r1.held.length} rows, ${b.n} for ${r2.held.length}`);
  assert.ok(b.n <= 40, `${b.n} reads for ${r2.held.length} rows`);
  assert.equal(big.asked.examined, r2.held.length, "the examination is asked once for each shown document (R91)");
  /* the vouched list too */
  const c = counting(big.s);
  const r3 = await big.c.heldCaptures({ viewer: "class:admin", now: NOW, limit: 1000, state: "held_and_vouched" });
  assert.ok(r3.held.length > r2.held.length);
  assert.ok(c.n <= 40, `${c.n} reads for the vouched list of ${r3.held.length} rows`);
});

test("R77 R88 (C14): the picker read returns the same rows with fewer fields (the document, its title, its source, when collected, its capture's digest and actor, its standing) and asks nothing of the examination, the questions or the archives", async () => {
  const w = bigWorld(60);
  const full = await w.c.heldCaptures({ viewer: "class:admin", now: NOW, limit: 1000, state: "held_and_vouched" });
  w.asked.examined = 0; w.asked.read = 0;
  const k = counting(w.s);
  const pick = await w.c.heldCaptures({ viewer: "class:admin", now: NOW, limit: 1000, state: "held_and_vouched", fields: "picker" });
  assert.deepEqual(pick.held.map((r) => r.bundle_id), full.held.map((r) => r.bundle_id), "the same rows in the same order");
  assert.deepEqual(pick.held.map((r) => [r.title, r.capture ? r.capture.sha256 : null, r.standing]),
                   full.held.map((r) => [r.title, r.capture ? r.capture.sha256 : null, r.standing]));
  assert.deepEqual(Object.keys(pick.held[0]).sort(), ["actor", "bundle_id", "capture", "collected_since", "project", "source", "standing", "title"], "fewer fields");
  assert.deepEqual([w.asked.examined, w.asked.read], [0, 0], "the examination and the questions are not asked");
  assert.ok(k.n <= 6, `${k.n} reads`);
  assert.deepEqual([pick.state, pick.limit, pick.truncated, pick.next], [full.state, full.limit, full.truncated, full.next], "the page is the same");
  /* a state, a filter and a bound apply to it as to the list */
  const mine = await w.c.heldCaptures({ viewer: "member:m1", member: "m1", project: "PROJ-1", now: NOW, limit: 4, sort: "project", fields: "picker" });
  const mineFull = await w.c.heldCaptures({ viewer: "member:m1", member: "m1", project: "PROJ-1", now: NOW, limit: 4, sort: "project" });
  assert.deepEqual(mine.held.map((r) => r.bundle_id), mineFull.held.map((r) => r.bundle_id));
  assert.deepEqual([mine.truncated, mine.next], [mineFull.truncated, mineFull.next]);
  /* control: no `fields`, or `full`, is the list; anything else is refused as an unknown `sort` is */
  assert.deepEqual((await w.c.heldCaptures({ viewer: "class:admin", now: NOW, limit: 1000, state: "held_and_vouched", fields: "full" })).held, full.held);
  const bad = await w.c.heldCaptures({ viewer: "class:admin", fields: "thumbnails" });
  assert.deepEqual([bad.ok, bad.reason, bad.argument], [false, "REQUIRED_ARGUMENT_MISSING", "fields"]);
});

/* ---------- C26: change is judged on the determined (substance) digest ---------- */
import { governor, network, provenance as captureProvenance } from "./fixture.mjs";

const SITE = "https://city.example/Calendar.aspx";
const ASPNET = { "x-powered-by": "ASP.NET", server: "Microsoft-IIS/10.0" };
/* an ASP.NET page: __VIEWSTATE (mechanical) and furniture around the substance, which is inside <main role="main"> */
const calendar = (viewstate, furniture, body) => [
  "<!DOCTYPE html><html><head><title>City Council Calendar</title></head><body>", `<div id="hdr">${furniture}</div>`,
  '<form id="aspnetForm" method="post">', `<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="${viewstate}" />`,
  `<main id="mainContent" role="main"><table><tr><th>Name</th><th>Date</th></tr>${body}</table></main></form></body></html>`].join("");
const ROW = (name, date) => `<tr><td>${name}</td><td>${date}</td></tr>`;
const ORIGINAL = calendar("STATE_ONE_" + "x".repeat(300), "nav one", ROW("City Council", "7/15/2026"));
const RESTATED = calendar("STATE_TWO_" + "y".repeat(800), "nav two, a longer footer rail", ROW("City Council", "7/15/2026"));
const REVISED = calendar("STATE_ONE_" + "x".repeat(300), "nav one", ROW("Rules Committee", "7/22/2026"));
const served = (body) => () => new Response(body, { headers: { "content-type": "text/html; charset=utf-8", ...ASPNET } });

/* a held copy captured through the act, filed as a document whose register document is the act's own */
async function heldCopy(body, { mutate = (d) => d } = {}) {
  const b = bucket();
  const f = fresh({ evidence: b, gov: governor(), env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
  member(f.s, "m1"); project(f.s, "PROJ-1", "m1");
  const net = network({ [SITE]: served(body) });
  let acquired;
  try { acquired = await f.c.acquire({ locator: SITE, authority: "City Clerk" }, { cls: "member", member: true, sessMember: "m1" }); }
  finally { net.restore(); }
  const d = mutate(acquired.body.document);
  doc(f, "INFO-1", { created: "2026-02-01T00:00:00Z", captures: [{ sha: d.capture.sha256, address: SITE, first: "2026-02-01T10:00:00Z" }] });
  provDoc(f, "INFO-1", [d]);
  return { f, d };
}
const checkAt = async (f, body, { status = 200 } = {}) => {
  const net = network({ [SITE]: () => new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8", ...ASPNET } }) });
  try { return await f.c.heldAt({ address: SITE, check: true, viewer: ADMIN2, member: "member:m1" }); } finally { net.restore(); }
};
const ADMIN2 = "class:admin";
function member(s, id) { s.sql.exec(`INSERT OR IGNORE INTO members (member_id, cover, role, status, created, updated) VALUES (?, 'c', 'member', 'active', '2026-01-01', '2026-01-01')`, id); }
function project(s, id, ...participants) {
  s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version) VALUES (?, 'project', 'g', 'p', 'active', '2026-01-01', '2026-01-01', 'x', 1)`, id);
  for (const m of participants) s.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, created, updated) VALUES (?, ?, 'active', '2026-01-01', '2026-01-01')`, id, m);
}
function doc(f, id, { created, captures }) {
  f.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version) VALUES (?, 'information', 'g', ?, 'collected', ?, ?, 'x', 1)`, id, `title ${id}`, created, created);
  for (const c of captures) { f.s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path) VALUES (?, ?, 'x')`, c.sha, id); }   // the act wrote its receipt
}
const provDoc = (f, bundleId, documents) =>
  f.s.sql.exec(`INSERT INTO files (bundle_id, path, content, bytes, sha256) VALUES (?, 'data/provenance.json', ?, 1, 'x')`, bundleId, JSON.stringify({ documents }));

test("R96 (C26): change is judged on the determined (substance) digest: the same page re-fetched with unchanged substance reads unchanged, changed substance reads changed with the served digest", async () => {
  const { f, d } = await heldCopy(ORIGINAL);
  assert.equal(d.profile.digests.determined, true, "the baseline earned a determined digest");
  /* the very bytes */
  const same = await checkAt(f, ORIGINAL);
  assert.deepEqual([same.changed.state, "served_sha256" in same.changed], ["unchanged", false]);
  /* viewstate and furniture rebuilt on every visit: not a change */
  const restated = await checkAt(f, RESTATED);
  assert.notEqual(sha(RESTATED), d.capture.sha256);
  assert.deepEqual([restated.changed.state, "served_sha256" in restated.changed, typeof restated.changed.looked_at], ["unchanged", false, "string"]);
  assert.match(restated.changed.basis, /substance/i);
  /* control: different substance is a change, with the served bytes' digest */
  const revised = await checkAt(f, REVISED);
  assert.deepEqual([revised.changed.state, revised.changed.served_sha256, typeof revised.changed.looked_at], ["changed", sha(REVISED), "string"]);
  assert.equal(revised.copy.sha256, d.capture.sha256);
});

test("R96 (C26): a baseline with no determined digest cannot tell whether the site changed: other bytes read undetermined, never changed; identical bytes still read unchanged", async () => {
  /* a copy whose register document recorded no determined digest */
  const none = await heldCopy(ORIGINAL, { mutate: (d) => ({ ...d, profile: { ...d.profile, digests: { determined: false, rendition: null, evidentiary: null, basis: "not read as text" } } }) });
  const other = await checkAt(none.f, RESTATED);
  assert.equal(other.changed.state, "undetermined");
  assert.equal("served_sha256" in other.changed, false);
  assert.match(other.changed.basis, /determined/i);
  assert.equal(typeof other.changed.looked_at, "string", "the site was looked at");
  assert.equal((await checkAt(none.f, ORIGINAL)).changed.state, "unchanged", "the very bytes are unchanged whatever the digests");
  /* a copy whose register document names no profile at all reads the same */
  const bare = await heldCopy(ORIGINAL, { mutate: (d) => { const { profile, ...rest } = d; return rest; } });
  assert.equal((await checkAt(bare.f, REVISED)).changed.state, "undetermined");
  /* served bytes that earn no determined digest are undetermined too, not changed */
  const plain = await checkAt((await heldCopy(ORIGINAL)).f, "not a page at all, just words");
  assert.equal(plain.changed.state, "undetermined");
  /* a conditional 304 is unchanged as before; a look that fails is undetermined as before */
  assert.equal((await checkAt((await heldCopy(ORIGINAL)).f, "gone", { status: 410 })).changed.state, "undetermined");
});

/* ---------- fix round 2, cause 1 (K4326): the held read grades a page in one batch ---------- */

/* provenance with the batch (its R71) and the single grade, each counted */
const batchWorld = (n) => {
  const w = bigWorld(n);
  const calls = { batch: [], single: [] };
  const grade = (d) => ({ grade: "B", route: "direct", determined: true, basis: "measured", why: `fetched ${d.slice(0, 6)}` });
  w.c.provenance = Object.assign(w.c.provenance, {
    captureGrade(d) { calls.single.push(d); return grade(d); },
    captureGrades(ds) { calls.batch.push([...ds]); return ds.map(grade); },
  });
  return { ...w, calls, grade };
};

test("R77 (K4326; provenance R71): a page of held captures is graded in one captureGrades call, each distinct digest once, and the answers equal the per-capture ones; captureGrade is not asked", async () => {
  const w = batchWorld(40);
  const r = await w.c.heldCaptures({ viewer: "class:admin", now: NOW, limit: 1000, state: "held_and_vouched" });
  const withCapture = r.held.filter((x) => x.capture);
  assert.ok(withCapture.length > 20);
  assert.equal(w.calls.batch.length, 1, "one batch for the page");
  assert.deepEqual(w.calls.single, [], "no capture is graded on its own");
  assert.deepEqual([...w.calls.batch[0]].sort(), [...new Set(withCapture.map((x) => x.capture.sha256))].sort(), "each distinct digest asked once");
  for (const x of withCapture) assert.deepEqual(x.capture.grade, w.grade(x.capture.sha256), x.bundle_id);
  /* each page is its own batch */
  const two = await w.c.heldCaptures({ viewer: "class:admin", now: NOW, limit: 5 });
  assert.equal(w.calls.batch.length, 2);
  assert.equal(w.calls.batch[1].length, two.held.filter((x) => x.capture).length);
});

test("R77 (K4326) control: an empty page reads no grade; a provenance with no batch is asked per capture as before; a batch that throws, or answers no list or non-objects, reads each grade null with the digest still named", async () => {
  const w = batchWorld(6);
  const none = await w.c.heldCaptures({ viewer: "junk", now: NOW, limit: 10 });
  assert.deepEqual(none.held, []);
  assert.deepEqual([w.calls.batch.length, w.calls.single.length], [0, 0], "an empty page reads nothing");
  /* no batch served */
  const old = batchWorld(6);
  old.c.provenance.captureGrades = undefined;
  const o = await old.c.heldCaptures({ viewer: "class:admin", now: NOW, limit: 1000 });
  assert.equal(old.calls.single.length, new Set(o.held.filter((x) => x.capture).map((x) => x.capture.sha256)).size);
  assert.ok(o.held.filter((x) => x.capture).every((x) => x.capture.grade?.grade === "B"));
  for (const captureGrades of [() => { throw new Error("down"); }, () => "x", () => null, (ds) => ds.map(() => "B"), async (ds) => ds.map(() => ({ grade: "B" }))]) {
    const b = batchWorld(6);
    b.c.provenance.captureGrades = captureGrades;
    const x = await b.c.heldCaptures({ viewer: "class:admin", now: NOW, limit: 1000 });
    const held = x.held.filter((r) => r.capture);
    assert.ok(held.length >= 3 && held.every((r) => r.capture.grade === null && /^[0-9a-f]{64}$/.test(r.capture.sha256)), String(captureGrades));
  }
});

/* ---------- fix round 2, cause 2 (K4326): the picker row's source, collected_since and actor ---------- */

test("R77 (K4326): the picker row carries source, collected_since and actor exactly as the full row gives them, nothing heavier (no grade, no questions, no eligibility, no bytes); the full read is unchanged", async () => {
  const w = batchWorld(60);
  const full = await w.c.heldCaptures({ viewer: "class:admin", now: NOW, limit: 1000, state: "held_and_vouched" });
  const batches = w.calls.batch.length;
  const k = counting(w.s);
  const pick = await w.c.heldCaptures({ viewer: "class:admin", now: NOW, limit: 1000, state: "held_and_vouched", fields: "picker" });
  assert.ok(k.n <= 8, `${k.n} reads`);
  assert.equal(w.calls.batch.length, batches, "the picker asks no grade");
  assert.deepEqual(pick.held.map((r) => [r.bundle_id, r.source, r.collected_since, r.actor]), full.held.map((r) => [r.bundle_id, r.source, r.collected_since, r.actor]));
  assert.ok(pick.held.some((r) => r.source) && pick.held.some((r) => r.actor) && pick.held.some((r) => !r.actor) && pick.held.some((r) => !r.source), "the world holds every shape");
  for (const r of pick.held) for (const heavy of ["grade", "captured_for", "eligible", "bytes", "retrieved", "age_days", "archive", "files"]) assert.equal(heavy in r, false, heavy);
  /* control: the full read is as it was */
  const again = await w.c.heldCaptures({ viewer: "class:admin", now: NOW, limit: 1000, state: "held_and_vouched" });
  assert.deepEqual(again, full);
  /* control: a viewer's sight limits the picker as it limits the list */
  const m2 = await w.c.heldCaptures({ viewer: "member:m2", now: NOW, limit: 1000, fields: "picker" });
  const m2full = await w.c.heldCaptures({ viewer: "member:m2", now: NOW, limit: 1000 });
  assert.deepEqual(m2.held.map((r) => r.bundle_id), m2full.held.map((r) => r.bundle_id));
});
