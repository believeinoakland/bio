/* plane R25–R29 (T36-49) and the boot's two T36 shares: the archive unpack's drain paged past capture's cursor (R25);
   `file-safety` composed at its place after `capture`, migrated, declared to purge, started, handed the scanner binding,
   the evidence bucket and the object's namespace, its four batch consumers handed to `scheduler` and its ops routed
   (R26); the `FILE_SCANNER` binding (R27, its config test in `worker.test.mjs`); the copy's own hosts read from
   `OWN_HOSTS` (R28); capture handed the binding and the reputation reader (R29); and `citation` made at boot (K2141).
   Driven on the Durable Object class over the fixture's storage, with stand-ins for the scanner member and the network. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { store, storage, Store } from "./fixture.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { captureOf } from "../../../src/capture/index.mjs";
import { schedulerOf } from "../../../src/scheduler/index.mjs";
import { retrievalOf } from "../../../src/retrieval/index.mjs";
import { fileSafetyOf, fileSafetyOps, FILE_SAFETY_TABLES, FILE_SAFETY_MODULE } from "../../../src/file-safety/index.mjs";
import { credentialsOf as captureCredentialsOf } from "../../../src/capture-sources/credentials.mjs";
import { ARCHIVE_UNPACK, UNPACK_RETRY_LIMIT, UNPACK_PAGE } from "../../../src/plane/unpack.mjs";
import { ownHostsOf, bareHost } from "../../../src/plane/wiring.mjs";

const TABLES = FILE_SAFETY_TABLES.map((t) => t.name);
const tableNames = (x) => [...x.ctx.storage.sql.exec(`SELECT name FROM sqlite_master WHERE type='table'`)].map((r) => r.name);
const SHA = "d".repeat(64);

/* The evidence bucket (`CAPTURES`), in memory. */
function bucket() {
  const held = new Map();
  const bytes = async (v) => (v instanceof Uint8Array ? v : typeof v === "string" ? new TextEncoder().encode(v)
    : v instanceof ArrayBuffer ? new Uint8Array(v) : new Uint8Array(await new Response(v).arrayBuffer()));
  const object = (k, b) => ({ key: k, size: b.length, body: new Response(b).body, text: async () => new TextDecoder().decode(b),
                              arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.length) });
  return { async put(k, v) { const b = await bytes(v); held.set(k, b); return { key: k, size: b.length }; },
           async get(k) { return held.has(k) ? object(k, held.get(k)) : null; },
           async head(k) { return held.has(k) ? { key: k, size: held.get(k).length } : null; },
           async delete(k) { held.delete(k); },
           async list() { return { objects: [...held.keys()].map((key) => ({ key })), truncated: false }; } };
}

/* The file-scanner member: records each request, answers `/scan` with one `clean` verdict per target and
   `/provider/reputation` as `listed: false`. */
function scanner() {
  const seen = [];
  return { seen, fetch: async (u, init) => {
    const req = u instanceof Request ? u : new Request(u, init);
    const body = req.method === "GET" ? null : await req.json().catch(() => null);
    seen.push({ path: new URL(req.url).pathname, body });
    const path = new URL(req.url).pathname;
    const out = path === "/scan"
      ? { ok: true, verdicts: (body.targets || []).map(() => ({ tool: "clamav", engine: "clamav", engine_version: "1.4.1",
          signatures: "27000", scanned_at: "2026-10-08T00:00:00Z", result: "clean", findings: [] })) }
      : path === "/provider/reputation" ? { ok: true, listed: false, categories: [] } : { ok: false, code: "NOT_HERE" };
    return new Response(JSON.stringify(out), { headers: { "content-type": "application/json" } });
  } };
}

/* Every module that declared a table to purge, in declaration order (record-core R21), each named once. */
function declarers(x) {
  const rc = recordOf(x.ctx), out = [];
  for (const t of Object.keys(rc.purge().removed)) {
    const m = rc.declarePurge("zz-probe", [t]).declaredBy;
    if (!out.includes(m)) out.push(m);
  }
  return out;
}

/* ===== R25 ===== */

test("R25 (K2097; capture R45): the drain reads archive-unpack events in pages past the last event's cursor while a page comes back full, so a head of 1,000 events at the retry limit hides none of the 200 newer ones, each read once", async () => {
  const seen = [];
  const env = { DAEMON_TOKEN: "dmn", SELF: { fetch: async (req) => { seen.push((await req.json()).archiveSha);
    return new Response(JSON.stringify({ ok: true, result: { unpacked: 1 } }), { headers: { "content-type": "application/json" } }); } } };
  const x = await store({ env });
  const cap = captureOf(x.ctx);
  const sha = (i) => i.toString(16).padStart(64, "0");
  const T = Date.parse("2026-10-07T00:00:00Z");
  const at = (i) => new Date(T + i * 1000).toISOString().replace(/\.\d+Z$/, "Z");
  /* the oldest 1,000 at the retry limit, as capture holds such events (its R45 row): they stay queued at the head and
     want no wake. Written in one statement for speed; the 200 newer ones through capture's own enqueue. */
  const head = Array.from({ length: 1000 }, (_, i) => i);
  x.ctx.storage.sql.exec(`INSERT INTO task_queue (kind, capture_sha, subject, locator, enqueued, attempts, last_try) VALUES `
    + head.map(() => "(?,?,'s',NULL,?,?,'2026-10-07T23:00:00Z')").join(","),
    ...head.flatMap((i) => [ARCHIVE_UNPACK, sha(i), at(i), UNPACK_RETRY_LIMIT]));
  for (let i = 1000; i < 1200; i++)
    assert.equal((await cap.taskEnqueue({ kind: ARCHIVE_UNPACK, captureSha: sha(i), at: at(i) })).ok, true);
  assert.equal(UNPACK_PAGE, 1000);
  /* every read of the queue, recorded on capture's one instance */
  const reads = [];
  const own = cap.taskEvents.bind(cap);
  cap.taskEvents = (a) => { const r = own(a); reads.push({ after: a.after ?? null, n: r.length, shas: r.map((e) => e.captureSha) }); return r; };
  const c = schedulerOf(x.ctx).registry(null).find((r) => r.name === ARCHIVE_UNPACK);
  const now = Date.parse("2026-10-08T00:00:00Z");
  assert.equal(c.due(now), now, "the newer events are due: a page of 1,000 at the limit does not hide them");
  assert.equal(c.wake(now), now);
  /* one drain: two pages, the second after the first's last cursor, no event read twice */
  reads.length = 0;
  const r = await c.tick(now);
  assert.deepEqual(reads.map((p) => p.n), [1000, 200]);
  assert.equal(reads[0].after, null);
  assert.equal(typeof reads[1].after, "string");
  const all = reads.flatMap((p) => p.shas);
  assert.equal(new Set(all).size, all.length, "no event is read twice in one drain");
  assert.equal(all.length, 1200);
  assert.deepEqual(seen, Array.from({ length: 10 }, (_, i) => sha(1000 + i)), "the oldest newer events are asked, a batch of them");
  assert.equal(r.archiveunpack.asked, 10);
});

test("R25 negative control: a queue shorter than a page is read once, from the head", async () => {
  const x = await store({ env: { DAEMON_TOKEN: "dmn", SELF: { fetch: async () => new Response("{}", { status: 503 }) } } });
  const cap = captureOf(x.ctx);
  await cap.taskEnqueue({ kind: ARCHIVE_UNPACK, captureSha: SHA, at: "2026-10-07T00:00:00Z" });
  const reads = [];
  const own = cap.taskEvents.bind(cap);
  cap.taskEvents = (a) => { reads.push(a.after ?? null); return own(a); };
  const c = schedulerOf(x.ctx).registry(null).find((r) => r.name === ARCHIVE_UNPACK);
  assert.equal(c.due(Date.parse("2026-10-08T00:00:00Z")) !== null, true);
  assert.deepEqual(reads, [null]);
});

/* ===== R26 ===== */

test("R26, R3: construction builds file-safety directly after capture: its tables made and declared to purge under its name, after capture's declaration; a second construction on one storage migrates idempotently", async () => {
  const db = new DatabaseSync(":memory:");
  const x = await store({ db });
  const names = tableNames(x);
  for (const t of TABLES) assert.ok(names.includes(t), `table ${t}`);
  const rc = recordOf(x.ctx);
  for (const t of TABLES) assert.equal(rc.declarePurge("zz-probe", [t]).declaredBy, FILE_SAFETY_MODULE, t);
  const order = declarers(x);
  assert.ok(order.indexOf("capture") !== -1 && order.indexOf("capture") < order.indexOf(FILE_SAFETY_MODULE), order.join());
  /* an older store, written before file-safety, opens with its tables */
  for (const t of TABLES) db.exec(`DROP TABLE IF EXISTS ${t}`);
  const old = await store({ db });
  for (const t of TABLES) assert.ok(tableNames(old).includes(t), `table ${t} after reopening`);
  const again = await store({ db });
  assert.deepEqual(tableNames(again).sort(), tableNames(old).sort());
});

test("R26 (its R1): file-safety's receipt listener is registered at construction, before the first request: the first acquisition's receipt puts its capture in the scan queue", async () => {
  const x = await store({ env: { CAPTURES: bucket() } });
  const rows = () => [...x.ctx.storage.sql.exec(`SELECT capture_sha FROM fs_files`)].map((r) => r.capture_sha);
  assert.deepEqual(rows(), []);
  const real = globalThis.fetch;
  const PAGE = "<!doctype html><title>Agenda</title><p>Item 1</p>";
  globalThis.fetch = async () => new Response(PAGE, { headers: { "content-type": "text/html" } });
  let r;
  try { r = await captureOf(x.ctx).acquire({ locator: "https://agendas.example.org/a1" }, { cls: "admin", storeName: "bio", member: false }); }
  finally { globalThis.fetch = real; }
  assert.equal(r.status, 200, JSON.stringify(r.body).slice(0, 300));
  assert.equal(r.body.ok, true, JSON.stringify(r.body).slice(0, 300));
  const sha = createHash("sha256").update(PAGE).digest("hex");
  assert.deepEqual(rows(), [sha], "the receipt queued its scan");
});

test("R26: file-safety is handed the object's FILE_SCANNER binding and namespace: op=scanbatch through the door scans the queued file at the member, store `bio`; with none bound it answers SCANNER_ABSENT", async () => {
  const fs = scanner();
  const x = await store({ env: { FILE_SCANNER: fs } });
  x.ctx.storage.sql.exec(`INSERT INTO fs_files (capture_sha, queued_at, render_state) VALUES (?, '2026-10-08T00:00:00Z', 'queued')`, SHA);
  const res = await (await x.fetch("/scanbatch?viewer=class:daemon", { method: "POST", body: "{}" })).json();
  assert.equal(res.ok, true, JSON.stringify(res));
  assert.deepEqual([res.result.ok, res.result.scanned], [true, 1], JSON.stringify(res.result));
  assert.deepEqual(fs.seen.map((s) => [s.path, s.body.store, s.body.targets.map((t) => t.capture_sha)]), [["/scan", "bio", [SHA]]]);
  assert.equal(fileSafetyOf(x.ctx).env.FILE_SCANNER, fs, "the binding the object was handed");
  const bare = await store();
  const none = await (await bare.fetch("/scanbatch?viewer=class:daemon", { method: "POST", body: "{}" })).json();
  assert.equal(none.result.code, "SCANNER_ABSENT");
});

test("R26, R2: file-safety is handed the evidence bucket (the object's CAPTURES, where its derived files go, outside captures/) and the object's namespace, and reads the originals through record-core's evidence store with R2's prefix", async () => {
  const CAPTURES = bucket();
  const x = await store({ env: { CAPTURES } });
  assert.equal(fileSafetyOf(x.ctx).env.CAPTURES, CAPTURES);
  assert.equal(fileSafetyOf(x.ctx).store, "bio", "an object with no known name is the real record's (R2)");
  assert.equal(recordOf(x.ctx).evidenceStore() !== null, true, "the evidence store record-core holds, which file-safety reads the originals through");
});

test("R26 (K2153, K2236; scheduler R24, file-safety R39): file-safety is handed to the scheduler before its start: its five batch consumers are registered, and each firing runs exactly the batches file-safety's own wakes say are due, scan against the bound scanner", async () => {
  const fs = scanner();
  const x = await store({ env: { FILE_SCANNER: fs } });
  const names = schedulerOf(x.ctx).consumers();
  const FIVE = ["file-scan", "file-render", "file-deeper", "file-forward", "file-reputation"];
  assert.deepEqual(names.filter((c) => c.startsWith("file-")), FIVE, names.join());
  x.ctx.storage.sql.exec(`INSERT INTO fs_files (capture_sha, queued_at, render_state) VALUES (?, '2026-10-08T00:00:00Z', 'queued')`, SHA);
  const now = Date.parse("2026-10-08T01:00:00Z");
  const fsafe = fileSafetyOf(x.ctx);
  const wakes = { filescan: fsafe.scanWake(now), filerender: fsafe.renderWake(now), filedeeper: fsafe.deeperWake(now),
                  fileforward: fsafe.forwardWake(now), filereputation: fsafe.reputationWake(now) };
  /* a file held and queued to render, no deeper check queued, no log sink and no reputation tool on */
  assert.deepEqual(wakes, { filescan: now, filerender: now, filedeeper: null, fileforward: null, filereputation: null });
  const r = await x.s.onAlarm(now);
  assert.equal(r.filescan && r.filescan.ok, true, JSON.stringify(r.filescan));
  assert.equal(r.filescan.scanned, 1);
  assert.ok(fs.seen.some((s) => s.path === "/scan"), "the scan reached the member");
  for (const [key, at] of Object.entries(wakes))
    assert.equal(key in r, at !== null && at <= now, `${key}: run exactly when file-safety's wake is due (${Object.keys(r).join()})`);
  /* negative control: with no scanner bound, file-safety's scan wants no wake, so no firing runs the scan */
  const bare = await store();
  bare.ctx.storage.sql.exec(`INSERT INTO fs_files (capture_sha, queued_at, render_state) VALUES (?, '2026-10-08T00:00:00Z', 'queued')`, SHA);
  assert.equal(fileSafetyOf(bare.ctx).scanWake(now), null);
  assert.equal("filescan" in (await bare.s.onAlarm(now)), false);
});

test("R26, R5: every op of fileSafetyOps is in the route map, directly after capture's, and answers through the door what its own map answers called directly", async () => {
  const u = new URL("http://do/");
  const ops = Object.keys(fileSafetyOps(null, u, null, {}));
  assert.equal(ops.length, 23, ops.join());
  const x = await store(), twin = await store();
  const map = Object.keys(x.s.routes(u, null));
  for (const op of ops) assert.ok(map.includes(op), `the route map lacks ${op}`);
  const capLast = map.indexOf("captureaccounts"), first = map.indexOf(ops[0]);
  assert.ok(capLast !== -1 && capLast < first, "after capture's map");
  const mask = (t) => t.replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z/g, "<instant>");
  for (const op of ops) {
    const path = `${op}?viewer=member:nobody&by=member:nobody&capture=${SHA}`;
    const res = await x.fetch(`/${path}`, { method: "POST", body: "{}" });
    const direct = await fileSafetyOps(fileSafetyOf(twin.ctx), new URL(`http://do/${path}`), {}, twin.env)[op]();
    if (direct instanceof Response) {
      assert.equal(res.status, direct.status, op);
      assert.deepEqual(JSON.parse(mask(await res.text())), JSON.parse(mask(await direct.text())), op);
    } else {
      assert.equal(res.status, 200, op);
      assert.deepEqual(JSON.parse(mask(await res.text())), JSON.parse(mask(JSON.stringify({ ok: true, result: direct }))), op);
    }
  }
});

/* ===== R28 ===== */

test("R28 (N745; installer R47): ownHostsOf reads OWN_HOSTS' comma-separated hosts, each workers.dev host with its account's suffix, joined with the claim's; malformed entries skipped and logged by a correlation id only; the claimed domain never added; nothing from neither", () => {
  const logged = [];
  const opts = { log: (c) => logged.push(c), correlation: () => `corr-${logged.length + 1}` };
  assert.deepEqual(ownHostsOf(null, "bio-oak.acct.workers.dev, Civic.Example.NET.", opts),
    ["bio-oak.acct.workers.dev", ".acct.workers.dev", "civic.example.net"]);
  assert.deepEqual(logged, []);
  const claim = { domain_claim: { domain: "oakwatch.example.org", instance_address: "https://bio-oak.acct.workers.dev" } };
  assert.deepEqual(ownHostsOf(claim, "bio-oak.acct.workers.dev,other.example.net", opts),
    ["bio-oak.acct.workers.dev", ".acct.workers.dev", "other.example.net"], "joined, each once; the claimed domain is not one");
  const bad = ["https://x.example.org", "x.example.org/path", "x.example.org:8443", "10.0.0.1", "localhost", "-x.example.org", "a..b"];
  assert.deepEqual(ownHostsOf(null, bad.join(",") + ",ok.example.org", opts), ["ok.example.org"]);
  assert.deepEqual(logged, bad.map((_, i) => `corr-${i + 1}`), "one log per skipped entry, by correlation id only");
  for (const b of bad) assert.equal(bareHost(b), null, b);
  assert.deepEqual(ownHostsOf(null, null, opts), []);
  assert.deepEqual(ownHostsOf(null, "  ", opts), []);
  assert.deepEqual(ownHostsOf({ domain_claim: { domain: "oakwatch.example.org", instance_address: null } }, undefined, opts), []);
});

test("R28: a skipped OWN_HOSTS entry's own text never reaches the log", () => {
  const lines = [];
  const real = console.warn;
  console.warn = (...a) => lines.push(a.join(" "));
  try { assert.deepEqual(ownHostsOf(null, "secret-looking entry!,ok.example.org"), ["ok.example.org"]); }
  finally { console.warn = real; }
  assert.equal(lines.length, 1);
  assert.ok(!lines[0].includes("secret-looking"), lines[0]);
  assert.match(lines[0], /"correlation":"[0-9a-f-]{36}"/);
});

test("R28 (capture R73, capture-sources R65): a store with OWN_HOSTS bound and no domain claimed hands capture and capture-sources those hosts, so a fleet member's host is refused as a credential host; without it, none", async () => {
  const x = await store({ env: { OWN_HOSTS: "bio-oak.acct.workers.dev", CAPTURE_CREDENTIALS_KEY: "k".repeat(64) } });
  assert.deepEqual([...captureOf(x.ctx).ownHosts], ["bio-oak.acct.workers.dev", ".acct.workers.dev"]);
  x.ctx.storage.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                          VALUES ('ann', 'Cover ann', 'h_ann', 'member', 'active', '["contribute"]', 't', 't')`);
  const own = await captureCredentialsOf(x.ctx).credentialSupply({ kind: "other", host: "pdf-worker.acct.workers.dev", secret: "s", scope: "member", by: "ann" });
  assert.equal(own.reason ?? own.code, "CAPTURE_CREDENTIAL_OWN_HOST", JSON.stringify(own).slice(0, 300));
  const bare = await store();
  assert.deepEqual([...captureOf(bare.ctx).ownHosts], []);
});

/* ===== R29 ===== */

test("R29 (K2087, K2155; acquisition R44): capture is handed the object's FILE_SCANNER binding, which acquisition reaches beside file-safety's (its `env`, and the binding handed)", async () => {
  const fs = scanner();
  const x = await store({ env: { FILE_SCANNER: fs } });
  const cap = captureOf(x.ctx);
  assert.equal(cap.env.FILE_SCANNER, fs, "acquisition's binding (`cap.env.FILE_SCANNER`, acquisition R44) is the object's");
  assert.equal(fileSafetyOf(x.ctx).env.FILE_SCANNER, fs, "the same binding as file-safety's");
});

test("R29 (K2087, K2155; N774; capture R73, acquisition R44): the reputation reader the plane hands capture, file-safety's `reputationTool()`, is asked afresh at each acquisition, and the tool it answers then is the one acquisition asks the bound scanner with", async () => {
  const fs = scanner();
  const x = await store({ env: { FILE_SCANNER: fs, CAPTURES: bucket() } });
  const safety = fileSafetyOf(x.ctx);
  let asked = 0;
  const own = safety.reputationTool;
  safety.reputationTool = async () => { asked += 1; return { tool_id: `rep-${asked}`, kind: "url_reputation" }; };
  const real = globalThis.fetch;
  const pages = [];
  globalThis.fetch = async (u) => { const page = `<!doctype html><title>Agenda</title><p>${u}</p>`; pages.push(page);
    return new Response(page, { headers: { "content-type": "text/html" } }); };
  const answers = [];
  try {
    for (const n of [1, 2]) {
      const r = await captureOf(x.ctx).acquire({ locator: `https://agendas.example.org/a${n}` }, { cls: "admin", storeName: "bio", member: false });
      assert.equal(r.body.ok, true, JSON.stringify(r.body).slice(0, 300));
      answers.push(r.body.reputation);
    }
  } finally { globalThis.fetch = real; safety.reputationTool = own; }
  assert.equal(asked, 2, "the reader is asked at each acquisition, never once at start");
  const lookups = fs.seen.filter((q) => q.path === "/provider/reputation");
  assert.deepEqual(lookups.map((q) => [q.body.address, q.body.tool.tool_id]),
    [["https://agendas.example.org/a1", "rep-1"], ["https://agendas.example.org/a2", "rep-2"]]);
  assert.deepEqual(answers.map((a) => [a.tool, a.listed]), [["rep-1", false], ["rep-2", false]], "stated in each answer");
  /* negative control: with no reputation tool on (file-safety's own reader, unstubbed), nothing is asked of the scanner */
  const bare = await store({ env: { FILE_SCANNER: scanner(), CAPTURES: bucket() } });
  globalThis.fetch = async () => new Response("<!doctype html><p>x</p>", { headers: { "content-type": "text/html" } });
  let none;
  try { none = await captureOf(bare.ctx).acquire({ locator: "https://agendas.example.org/b" }, { cls: "admin", storeName: "bio", member: false }); }
  finally { globalThis.fetch = real; }
  assert.equal(none.body.reputation.unanswered, "NO_TOOL");
  assert.equal(bare.env.FILE_SCANNER.seen.some((q) => q.path === "/provider/reputation"), false);
});

/* ===== K2141 ===== */

test("K2141 (citation R13, retrieval R76): the boot makes citation before the first request, so its recordedBy read is registered with retrieval at construction", async () => {
  const st = storage();
  new Store(st.ctx, { STORE: { idFromName: (n) => n } });
  for (const p of st.blocked) await p;
  const r = retrievalOf(st.ctx).registerRecordedBy("citation", () => ({ ok: true, items: [] }));
  assert.equal(r.ok, false, "the registration is held already, by citation");
});
