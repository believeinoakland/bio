/* monitoring R36–R43: the invariants, each driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, serve, sha, DAEMON, NOW_MS, infoMd } from "./fixture.mjs";
import { monitoringOps, MONITORING_TABLES } from "../../../src/monitoring/index.mjs";
import { MECHANICAL_FIELD_SETS, DRIVE_CAPTURE_CHECKS, parseFrontmatter } from "../../../checks/bio-checks.mjs";

const LOC = "https://records.example.org/inv.txt";
const tick = (w, id) => w.m.monitor({ bundleId: id, viewer: DAEMON, actorClass: "machine", actor: DAEMON });

test("R36 the daemon fetches only what store state authorizes: op=monitor takes a bundle id, never a caller's address; the fallback names only the document address", async () => {
  const w = world();
  const id = "INFO-2026-0800-auth";
  w.monitored(id, LOC, "auth-v1");
  w.net.routes[LOC] = serve("auth-v1");
  w.net.routes["https://attacker.example.org/x"] = serve("nope");
  const r = await monitoringOps(w.m, new URL(`http://do/monitor?viewer=${DAEMON}`),
    { bundleId: id, locator: "https://attacker.example.org/x", address: "https://attacker.example.org/x", tickAddress: "https://attacker.example.org/x" }).monitor();
  assert.equal(r.status, 200);
  assert.deepEqual(w.net.seen, [LOC], "only the document's own locator was fetched");
  /* the archive fire's body names only the document address (R20's test drives the whole tick) */
  const calls = [];
  w.m.env.SELF = { fetch: async (req) => { calls.push(await req.json()); return new Response(JSON.stringify({ ok: false, reason: "NOT_ELIGIBLE" })); } };
  w.m.env.DAEMON_TOKEN = "a-live-token-for-r36-000000000001";
  for (let i = 0; i < 3; i++) await w.capture.recordSourceOutcome({ addressNorm: "https://gone.example.org/p", outcome: "fetch_failed", at: "2026-09-20T00:00:00Z" });
  await w.m.archiveTick(NOW_MS);
  assert.deepEqual(calls, [{ via: "archive.org", address: "https://gone.example.org/p" }]);
});

test("R37 detecting change is mechanical: a tick writes only monitor-tick's field set, never the document's hash as current, and a change raises a flag for a member", async () => {
  const w = world();
  const id = "INFO-2026-0810-mech";
  const b = w.monitored(id, LOC, "mech-v1");
  const before = w.text(id);
  w.net.routes[LOC] = serve("mech-v2");
  const r = await tick(w, id);
  assert.equal(r.body.status, "modified");
  const fb = parseFrontmatter(before).data, fa = parseFrontmatter(w.text(id)).data;
  const allowed = MECHANICAL_FIELD_SETS["monitor-tick"];
  const moved = [];
  const walk = (a, z, p) => {
    for (const k of new Set([...Object.keys(a || {}), ...Object.keys(z || {})])) {
      const path = p ? `${p}.${k}` : k;
      const x = a ? a[k] : undefined, y = z ? z[k] : undefined;
      if (x && y && typeof x === "object" && typeof y === "object" && !Array.isArray(x)) walk(x, y, path);
      else if (JSON.stringify(x) !== JSON.stringify(y)) moved.push(path);
    }
  };
  walk(fb, fa, "");
  assert.ok(moved.length > 0);
  for (const m of moved) assert.ok(allowed.includes(m), `${m} is not in monitor-tick's field set (${allowed.join(", ")})`);
  /* the register still names the baseline as the document's capture: the new bytes are a snapshot, not the current hash */
  const reg = JSON.parse(w.record.readFile(id, "data/provenance.json").text);
  assert.deepEqual(reg.documents.map((d) => d.capture.sha256), [b.cap]);
  assert.equal(fa.reeval_pending.flag, true, "a change raises a flag for a member");
  assert.equal(w.manifest(id).at(-1).writer, "mechanical");
});

test("R38 an equality that costs nothing is not evidence: a shell's match never reads unchanged; a rendered capture's content is undetermined on every tick; a plain document still reads unchanged", async () => {
  const w = world();
  const loc = "https://spa.example.org/a";
  const shell = `<!DOCTYPE html><html><head><title>A</title><script src="/static/js/main.1.js"></script></head><body><div id="root"></div><noscript>You need to enable JavaScript to run this app.</noscript></body></html>`;
  w.monitored("INFO-2026-0820-shell", loc, shell);
  w.net.routes[loc] = serve(shell, "text/html");
  const s = await tick(w, "INFO-2026-0820-shell");
  assert.notEqual(s.body.status, "unchanged", "the same shell bytes never read unchanged");
  assert.equal(w.looks().at(-1).state, "LOOKED_INDETERMINATE");
  const rl = "https://app.example.org/r";
  w.monitored("INFO-2026-0821-rendered", rl, "rendered-doc", { row: { pair: { primary: "rendered", shell: { sha256: sha("<html>s</html>") } } } });
  w.net.routes[rl] = serve("<html>s</html>", "text/html");
  const rr = await tick(w, "INFO-2026-0821-rendered");
  assert.deepEqual([rr.body.status, rr.body.content, rr.body.frame], [null, "undetermined", "unchanged"]);
  /* over-strictness arm */
  w.monitored("INFO-2026-0822-plain", LOC, "plain words");
  w.net.routes[LOC] = serve("plain words");
  assert.equal((await tick(w, "INFO-2026-0822-plain")).body.status, "unchanged");
});

test("R39 a governed refusal is a fact about the instance: its look is marked governed and it never counts as the source failing", async () => {
  const w = world({ refuse: ["records.example.org"] });
  w.monitored("INFO-2026-0830-gov", LOC, "gov-v1");
  for (let i = 0; i < 4; i++) await tick(w, "INFO-2026-0830-gov");
  assert.ok(w.looks().every((l) => l.governed === 1 && l.condition === "source-unreachable-governed"));
  const reach = w.capture.sourceReachability({ addressNorm: LOC });
  assert.equal(reach.consecutive_failures ?? 0, 0);
  assert.equal(reach.fallback_eligible, false);
});

test("R40 bias never shapes what is monitored: no service takes a lens, and a lens passed changes no plan", () => {
  const w = world();
  w.monitored("INFO-2026-0840-a", "https://records.example.org/l1", "lens a", { freq: "daily" });
  w.monitored("INFO-2026-0841-b", "https://records.example.org/l2", "lens b", { freq: "per_meeting" });
  const plain = JSON.stringify(w.m.schedule(NOW_MS));
  assert.equal(JSON.stringify(w.m.schedule(NOW_MS, { lens: "LENS-1" })), plain);
  const a = JSON.stringify(w.m.monitoring({ viewer: DAEMON, now: NOW_MS }));
  assert.equal(JSON.stringify(w.m.monitoring({ viewer: DAEMON, now: NOW_MS, lens: "LENS-1" })), a);
  const routed = monitoringOps(w.m, new URL(`http://do/monitoring?viewer=${DAEMON}&now=${NOW_MS}&lens=LENS-1`), { lens: "x" }).monitoring();
  assert.equal(JSON.stringify(routed), a);
});

test("R41 the three tables are this module's, derived and declared to purge: monitor_fired by subject; monitor_address_type and monitor_tick_epoch only by a whole-store purge", async () => {
  const w = world();
  assert.deepEqual(MONITORING_TABLES.map((t) => [t.name, t.keys]),
    [["monitor_fired", ["subject"]], ["monitor_tick_epoch", []], ["monitor_address_type", []]]);
  const id = "INFO-2026-0850-purge";
  w.monitored(id, LOC, "purge-v1", { freq: "hourly" });
  w.net.routes[LOC] = serve("purge-v1");
  w.m.env.SELF = { fetch: async () => { throw new Error("down"); } };
  w.m.env.DAEMON_TOKEN = "a-live-token-for-r41-000000000001";
  await w.m.cadenceTick(NOW_MS);   /* fails: its claim and epoch stay */
  await tick(w, id);                /* reads the address's type */
  const count = (t) => w.rows(`SELECT count(*) c FROM ${t}`)[0].c;
  assert.deepEqual([count("monitor_fired"), count("monitor_tick_epoch"), count("monitor_address_type")], [1, 1, 1]);
  w.record.purge({ bundleId: id });
  assert.deepEqual([count("monitor_fired"), count("monitor_tick_epoch"), count("monitor_address_type")], [0, 1, 1],
    "the bundle's claims go; the epoch and the address's reading outlive it");
  w.record.purge({});
  assert.deepEqual([count("monitor_fired"), count("monitor_tick_epoch"), count("monitor_address_type")], [0, 0, 0]);
});

test("R42 each check moved here holds as an invariant: C-18.5 (gathering.test), C-48.8 and C-48.9 answered with their catalogue rows", async () => {
  const w = world();
  const DOC = "https://docs.google.com/document/d/1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789abcd/edit";
  const EXPORT = "https://docs.google.com/document/d/1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789abcd/export?format=odt";
  w.monitored("INFO-2026-0860-drive", DOC, "odt-42", { row: { locator: EXPORT } });
  w.net.routes[EXPORT] = serve("<html></html>", "application/xhtml+xml");
  const a = await tick(w, "INFO-2026-0860-drive");
  assert.deepEqual([a.body.reason, a.body.check, a.body.translation],
    ["DRIVE_TICK_EXPORT_IS_THE_SHELL", "C-48.8", DRIVE_CAPTURE_CHECKS.DRIVE_TICK_EXPORT_IS_THE_SHELL.translation]);
  w.net.routes[EXPORT] = serve("<html><body>app</body></html>", "application/octet-stream");
  const b = await tick(w, "INFO-2026-0860-drive");
  assert.deepEqual([b.body.reason, b.body.check, b.body.translation],
    ["DRIVE_TICK_EXPORT_BYTES_ARE_THE_SHELL", "C-48.9", DRIVE_CAPTURE_CHECKS.DRIVE_TICK_EXPORT_BYTES_ARE_THE_SHELL.translation]);
  /* negative control: the real export is compared, not refused */
  w.net.routes[EXPORT] = serve("odt-42", "application/vnd.oasis.opendocument.text");
  assert.equal((await tick(w, "INFO-2026-0860-drive")).body.ok, true);
});

test("R43 no place is named in this module's behaviour or outward text", async () => {
  const w = world();
  const outward = [];
  const keep = (r) => outward.push(JSON.stringify(r));
  w.monitored("INFO-2026-0870-a", LOC, "place-v1", { freq: "daily" });
  for (const [route, status] of [[serve("place-v1"), 200], [serve("place-v2"), 200], [serve("x", "text/plain", 404), 404],
                                 [serve("x", "text/plain", 503), 503]]) {
    w.net.routes[LOC] = route;
    keep((await tick(w, "INFO-2026-0870-a")).body);
    assert.ok(status);
  }
  w.promote("INFO-2026-0871-http", infoMd("INFO-2026-0871-http", "http://x.example.org/"));
  keep(await tick(w, "INFO-2026-0871-http"));
  keep(w.m.schedule(NOW_MS));
  keep(w.m.monitoring({ viewer: DAEMON, now: NOW_MS }));
  keep(w.m.driveShells({ viewer: DAEMON }));
  keep(await w.m.cadenceTick(NOW_MS));
  keep(w.text("INFO-2026-0870-a"));
  keep(w.looks());
  const text = outward.join("\n");
  for (const place of ["Oakland", "Alameda", "California", "Port Ellery", "Believe in Oakland"])
    assert.equal(text.includes(place), false, place);
});
