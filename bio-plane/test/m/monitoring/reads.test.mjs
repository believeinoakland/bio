/* monitoring R26 (driveShells) and R32 (monitoring): the two reads, each through the viewer's sight. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, infoMd, V, NOW_MS, DAEMON } from "./fixture.mjs";
import { monitoringOps, DRIVE_SHELLS_LIMIT_DEFAULT, DRIVE_SHELLS_LIMIT_MAX, DRIVE_SHELLS_RETRIEVALS_MAX, MONITORING_READ_MAX }
  from "../../../src/monitoring/index.mjs";

const HOUR = 3600000, DAY = 24 * HOUR;
const DOC = (n) => `https://docs.google.com/document/d/1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789ab${String(n).padStart(2, "0")}/edit`;
const EXP = (n) => `https://docs.google.com/document/d/1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789ab${String(n).padStart(2, "0")}/export?format=odt`;
const receipt = (w, addr, cap, via = "direct", retrievalLocator = addr) => w.prov.recordReceipt({ address: addr, addressNorm: addr, captureSha: cap,
  retrieved: "2026-09-20T00:00:00Z", via, retrievalLocator, context: { authorityKind: "sweep", authority: "x", actorClass: "plane", actor: null, observe: false } });

test("R26 driveShells: pages Google-addressed bundles through sight; classifies each harvestable Drive baseline; unreadable and not-documents counted; shells name their remedy; nothing re-acquired", () => {
  const w = world();
  /* a shell: the baseline captured at the document address (pre-export) */
  const s = w.monitored("INFO-2026-0500-shell", DOC(1), "<html>app shell 1</html>");
  receipt(w, DOC(1), s.cap);
  /* an export: the baseline captured from the export address */
  const e = w.monitored("INFO-2026-0501-export", DOC(2), "odt bytes 2", { row: { locator: EXP(2) } });
  receipt(w, DOC(2), e.cap, "direct", EXP(2));
  /* no baseline */
  w.monitored("INFO-2026-0502-none", DOC(3), null);
  /* a register that does not parse */
  w.promote("INFO-2026-0503-bad", infoMd("INFO-2026-0503-bad", DOC(4)), { files: [{ path: "data/provenance.json", text: "{x", bytes: 2, sha256: sha("{x") }] });
  /* not documents: a folder and a file */
  w.promote("INFO-2026-0504-folder", infoMd("INFO-2026-0504-folder", "https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz01"));
  w.promote("INFO-2026-0505-file", infoMd("INFO-2026-0505-file", "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz01/view"));
  /* not Google at all */
  w.monitored("INFO-2026-0506-plain", "https://records.example.org/x", "plain 6");
  const calls0 = w.net.seen.length;
  const r = w.m.driveShells({ viewer: DAEMON });
  assert.equal(w.net.seen.length, calls0, "nothing is re-acquired or fetched");
  assert.equal(r.ok, true);
  assert.deepEqual([r.limit, r.truncated, r.cursor, r.swept], [DRIVE_SHELLS_LIMIT_DEFAULT, false, null, 6]);
  assert.deepEqual(r.counts, { drive: 6, shells: r.shells.length, export: r.export.length, undetermined: r.undetermined.length,
                               no_baseline: r.no_baseline.length, unreadable: 1 });
  assert.deepEqual(r.unreadable.map((u) => [u.bundle, u.reason]), [["INFO-2026-0503-bad", "the register is not parsable JSON"]]);
  assert.deepEqual(r.not_documents, { folder: 1, file: 1 });
  const all = [...r.shells, ...r.export, ...r.undetermined, ...r.no_baseline];
  assert.deepEqual(all.map((x) => x.bundle).sort(), ["INFO-2026-0500-shell", "INFO-2026-0501-export", "INFO-2026-0502-none"]);
  assert.ok(r.no_baseline.some((x) => x.bundle === "INFO-2026-0502-none"));
  assert.ok(r.export.some((x) => x.bundle === "INFO-2026-0501-export"));
  for (const sh of r.shells) {
    assert.equal(sh.reacquire.op, "acquire");
    assert.equal(sh.reacquire.locator, sh.locator);
  }
  for (const x of all) assert.equal(x.export_address.endsWith("/export?format=odt"), true);
  /* paging: the bound, the cursor and truncated */
  const p1 = w.m.driveShells({ viewer: DAEMON, limit: 2 });
  assert.deepEqual([p1.limit, p1.truncated, p1.cursor, p1.swept], [2, true, "INFO-2026-0501-export", 2]);
  const p2 = w.m.driveShells({ viewer: DAEMON, limit: 100, after: p1.cursor });
  assert.equal(p2.swept, 4);
  assert.equal(w.m.driveShells({ viewer: DAEMON, limit: 5000 }).limit, DRIVE_SHELLS_LIMIT_MAX);
  /* through the viewer's sight: a viewer who sees nothing gets nothing */
  assert.equal(w.m.driveShells({ viewer: "nobody" }).swept, 0);
  /* a register not held inline (a register spilled to the capture store, as older records hold) is unreadable, named */
  w.monitored("INFO-2026-0507-blob", DOC(7), "blob 7");
  w.st.sql.exec(`UPDATE files SET content=NULL, blob_sha=sha256 WHERE bundle_id='INFO-2026-0507-blob' AND path='data/provenance.json'`);
  assert.ok(w.m.driveShells({ viewer: DAEMON }).unreadable.some((u) => u.bundle === "INFO-2026-0507-blob" && u.reason === "the register is not held inline"));
  /* at most 50 retrievals, and a cut is said */
  for (let i = 0; i < DRIVE_SHELLS_RETRIEVALS_MAX + 2; i++) receipt(w, `https://mirror${i}.example.org/d`, s.cap);
  const cut = w.m.driveShells({ viewer: DAEMON }).shells.concat(w.m.driveShells({ viewer: DAEMON }).undetermined, w.m.driveShells({ viewer: DAEMON }).export)
    .find((x) => x.bundle === "INFO-2026-0500-shell");
  assert.equal(cut.retrievals_truncated, true);
  /* the route stamps the viewer from the query */
  const routed = monitoringOps(w.m, new URL("http://do/driveshells?viewer=nobody&limit=3"), {}).driveshells();
  assert.deepEqual([routed.swept, routed.limit], [0, 3]);
});

test("R32 monitoring({viewer}): every monitored address the viewer may see, with its plan row, the unscheduled among them", () => {
  const w = world();
  const iso = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, "Z");
  w.monitored("INFO-2026-0510-due", "https://records.example.org/a", "r32 a", { freq: "daily" });
  w.monitored("INFO-2026-0511-meeting", "https://records.example.org/b", "r32 b", { freq: "per_meeting" });
  w.monitored("INFO-2026-0512-later", "https://records.example.org/c", "r32 c", { freq: "weekly" });
  w.st.sql.exec(`UPDATE bundles SET monitor_last_checked=? WHERE bundle_id='INFO-2026-0512-later'`, iso(NOW_MS - DAY));
  w.monitored("INFO-2026-0513-off", "https://records.example.org/d", "r32 d", { enabled: false });
  const r = w.m.monitoring({ viewer: DAEMON, now: NOW_MS });
  assert.equal(r.ok, true);
  assert.equal(r.configured, false, "visible without waiting for a tick, and without the daemon being configured");
  const by = Object.fromEntries(r.items.map((i) => [i.bundle, i]));
  assert.deepEqual(Object.keys(by).sort(), ["INFO-2026-0510-due", "INFO-2026-0511-meeting", "INFO-2026-0512-later"]);
  assert.equal(by["INFO-2026-0510-due"].state, "due");
  assert.equal(by["INFO-2026-0511-meeting"].state, "unscheduled");
  assert.equal(by["INFO-2026-0511-meeting"].reason, "cadence is a meeting schedule this plane does not hold");
  assert.equal(by["INFO-2026-0512-later"].state, "scheduled");
  assert.equal(by["INFO-2026-0512-later"].next_at, iso(NOW_MS - DAY + 7 * DAY));
  assert.deepEqual(r.counts, { due: 1, scheduled: 1, unscheduled: 1 });
  assert.equal(w.m.monitoring({ viewer: "nobody", now: NOW_MS }).items.length, 0, "only what the viewer may see");
  const one = w.m.monitoring({ viewer: DAEMON, now: NOW_MS, limit: 1 });
  assert.deepEqual([one.items.length, one.truncated, one.limit], [1, true, 1]);
  assert.equal(w.m.monitoring({ viewer: DAEMON }).limit, MONITORING_READ_MAX);
  const routed = monitoringOps(w.m, new URL(`http://do/monitoring?viewer=${encodeURIComponent(DAEMON)}&now=${NOW_MS}`), {}).monitoring();
  assert.equal(routed.items.length, 3);
  assert.ok(V);
});
