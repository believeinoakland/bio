/* file-safety's test fixture: the module over the modules it uses, each the real one (record-core, membership,
   credentials with a seal secret, promotion, provenance, acquisition), on node:sqlite standing in for a Durable Object's
   storage (provenance's own fixture's `storage`); an evidence bucket that is both record-core's evidence store
   (`bio/captures/<sha>`) and the Worker's `CAPTURES` binding (where the derived files go); and a scripted
   `FILE_SCANNER` binding that answers as `file-scanner`'s Provides state (R1–R8, R19–R31), recording every request so a
   test reads exactly what this module sent it (R23). Members are written as membership's tables hold them; a capture
   arrives as acquisition does it, through provenance's real `recordReceipt` (R1's listener). */
import { createHash } from "node:crypto";
import { storage, infoMd, provDoc } from "../provenance/fixture.mjs";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { acquisitionOf } from "../../../src/acquisition/index.mjs";
import { fileSafetyOf } from "../../../src/file-safety/index.mjs";

export { infoMd, provDoc };
export const sha = (b) => createHash("sha256").update(typeof b === "string" ? Buffer.from(b, "utf8") : Buffer.from(b)).digest("hex");
export const enc = (s) => new TextEncoder().encode(s);
export const T0 = Date.parse("2026-10-08T12:00:00.000Z");
export const DAY = 86_400_000;

/* An R2 bucket stand-in: `head`, `get`, `put` by key, every call recorded. */
export function bucket() {
  const held = new Map(), calls = [];
  return {
    held, calls,
    async head(k) { calls.push(["head", k]); return held.has(k) ? { key: k, size: held.get(k).length } : null; },
    async get(k) {
      calls.push(["get", k]);
      if (!held.has(k)) return null;
      const b = held.get(k);
      return { key: k, size: b.length, body: new Response(b).body, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.length) };
    },
    async put(k, bytes, opts) { calls.push(["put", k, opts]); held.set(k, new Uint8Array(bytes)); return { key: k }; },
  };
}

const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const verdict = (capture_sha, tool, engine, fields) => ({ capture_sha, tool, engine, engine_version: fields.engine_version ?? "1.0",
  signatures: tool === "clamav" ? { main: 62, daily: 27000, bytecode: 335, published: "2026-10-08T00:00:00Z" } : null,
  scanned_at: fields.scanned_at ?? new Date(fields.now).toISOString(), result: fields.result,
  findings: fields.findings ?? [], ...(fields.reason ? { reason: fields.reason } : {}), ...(fields.detail ? { detail: fields.detail } : {}), latency_ms: 1 });

/* The scripted scanner. `script` decides each answer, by capture digest and tool:
     clamav(sha)          → {result, findings?, reason?} | "hang" (never answers) | "fail" (the request refused)
     provider[id](sha)    → [{engine, result, findings?}] | {code} (a refusal, e.g. PRIVATE_MODE_NOT_HONOURED)
     sandbox[id](sha)     → {result, findings?} once polled `polls` times | {code}
     cdr(sha)             → {bytes, removed} | {code}
     copyScan(sha)        → the verdict for a safe copy's scan (default: today's member, NOT_FOUND)
     test[id]             → {passed, detail}
     render(sha, route)   → bytes | {code, detail}
   Every request is recorded as `{path, body}`. */
export function scanner(script = {}, { now = () => T0 } = {}) {
  const calls = [];
  const s = { clamav: () => ({ result: "clean" }), provider: {}, sandbox: {}, test: {}, polls: 1, ...script };
  const polled = new Map();
  const binding = {
    calls,
    async fetch(req) {
      const u = new URL(req.url);
      const body = req.method === "POST" ? await req.json() : null;
      calls.push({ path: u.pathname, body, method: req.method });
      const at = now();
      if (u.pathname === "/version") return reply({ ok: true, name: "file-scanner", version: "1.0.0", clamav_version: "1.4.3",
        signatures: { versions: { main: 62 }, published: new Date(at - 3_600_000).toISOString(), mirrored_at: null, last_attempt: null, last_error: null },
        providers: {}, reputation_lists: s.lists ?? [], renderer_version: "libreoffice 7; poppler 24", bounds: {} });
      if (u.pathname === "/scan") {
        const out = [];
        for (const t of body.targets) {
          if (body.area === "derived") { const c = s.copyScan ? s.copyScan(t.capture_sha) : { result: "not_scanned", reason: "NOT_FOUND" };
            out.push(verdict(t.capture_sha, "clamav", "clamav", { ...c, now: at })); continue; }
          const c = s.clamav(t.capture_sha);
          if (c === "hang") return new Promise(() => {});
          if (c === "fail") return reply({ ok: false, code: "R2_NOT_CONFIGURED" }, 503);
          out.push(verdict(t.capture_sha, "clamav", "clamav", { ...c, now: at }));
        }
        return reply({ ok: true, verdicts: out });
      }
      if (u.pathname === "/render") {
        const r = s.render ? s.render(body.target.capture_sha, body.route) : enc(`%PDF-1.4 safe view of ${body.target.capture_sha}`);
        if (!(r instanceof Uint8Array)) return reply({ ok: false, ...r }, 422);
        return new Response(r, { status: 200, headers: { "content-type": "application/pdf", "x-derived-sha256": sha(r),
          "x-pages": "2", "x-source-pages": "3", "x-truncated": "true" } });
      }
      if (u.pathname === "/provider/scan") {
        const id = body.tool.provider_id, sha0 = body.target.capture_sha;
        const r = s.provider[id] ? s.provider[id](sha0) : [{ engine: id, result: "clean" }];
        if (!Array.isArray(r)) return reply({ ok: false, ...r }, 502);
        return reply({ ok: true, verdicts: r.map((v) => verdict(sha0, id, v.engine, { ...v, now: at })) });
      }
      if (u.pathname === "/provider/sandbox") {
        const id = body.tool.provider_id;
        const r = s.sandbox[id] ? s.sandbox[id](body.target.capture_sha) : { result: "clean" };
        if (r.code) return reply({ ok: false, code: r.code }, 502);
        return reply({ ok: true, state: "submitted", vendor_ref: `ref-${body.target.capture_sha.slice(0, 8)}`, poll_after_ms: 60_000 });
      }
      if (u.pathname === "/provider/sandbox/result") {
        const id = body.tool.provider_id, ref = body.vendor_ref;
        const n = (polled.get(ref) || 0) + 1;
        polled.set(ref, n);
        if (n < s.polls) return reply({ ok: true, state: "running", poll_after_ms: 60_000 });
        const target = [...calls].reverse().find((c) => c.path === "/provider/sandbox" && `ref-${c.body.target.capture_sha.slice(0, 8)}` === ref);
        const sha0 = target.body.target.capture_sha;
        const r = s.sandbox[id] ? s.sandbox[id](sha0) : { result: "clean" };
        return reply({ ok: true, state: "done", verdicts: [verdict(sha0, id, s.sandboxEngine?.[id] ?? id, { ...r, now: at })] });
      }
      if (u.pathname === "/provider/cdr") {
        const r = s.cdr ? s.cdr(body.target.capture_sha) : { bytes: enc(`rebuilt ${body.target.capture_sha}`), removed: ["macros"] };
        if (r.code) return reply({ ok: false, code: r.code }, 422);
        return new Response(r.bytes, { status: 200, headers: { "content-type": "application/pdf", "x-derived-sha256": sha(r.bytes),
          "x-of": body.target.capture_sha, "x-output-type": "application/pdf", "x-removed": JSON.stringify(r.removed), "x-tool": body.tool.provider_id } });
      }
      if (u.pathname === "/provider/test") {
        const t = s.test[body.tool.provider_id] ?? { passed: true, detail: "the EICAR test file answered found" };
        return reply({ ok: true, ...t });
      }
      if (u.pathname === "/provider/forward") return reply(s.forward ? s.forward(body) : { ok: true, sent_at: new Date(at).toISOString() });
      return reply({ ok: false, code: "UNKNOWN" }, 404);
    },
  };
  return binding;
}

/* A world: the modules on one storage, a clock the test moves, the bucket and the scanner. `scan` false leaves the
   scanner unbound. Members: `m1`, `m2` (members), `boss` (an active administrator). */
export function world({ scan = {}, bound = true, now = T0, scanWaitMs = 50 } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const clock = { now };
  const b = bucket();
  const record = recordOf(host, { evidence: b, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const credentials = credentialsOf(host, { record, membership, sealSecret: "a test seal secret of good length" });
  credentials.migrate();
  const promotion = promotionOf(host, { record, membership, now: () => new Date(clock.now).toISOString() });
  promotion.registerFact("producingGroup", "instance-setup", () => "test-group");
  promotion.registerFact("citedBy", "connections", () => []);
  promotion.registerFact("caseMember", "publication", () => false);
  const prov = provenanceOf(host, { record, membership, promotion, now: () => new Date(clock.now).toISOString() });
  prov.migrate();
  const acq = acquisitionOf(host, { record, provenance: prov, membership });
  const fsScanner = bound ? scanner(scan, { now: () => clock.now }) : null;
  const env = { CAPTURES: b, ...(fsScanner ? { FILE_SCANNER: fsScanner } : {}) };
  const fs = fileSafetyOf(host, { record, membership, credentials, provenance: prov, acquisition: acq, env, now: () => clock.now, scanWaitMs });
  fs.migrate();
  const exec = (q, ...a) => [...st.sql.exec(q, ...a)];
  for (const [m, role] of [["m1", "member"], ["m2", "member"], ["boss", "admin"]])
    exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES (?, ?, ?, 'active', '2026-01-01', '2026-01-01')`, m, `cover ${m}`, role);
  const w = {
    st, host, record, membership, credentials, promotion, prov, acq, fs, env, bucket: b, scanner: fsScanner, clock, exec,
    rows: exec, row: (q, ...a) => exec(q, ...a)[0] ?? null,
    tick(ms) { clock.now += ms; },
    /** Bytes held as a capture: stored, then a receipt as acquisition writes one (R1). */
    async capture(bytes, { address = null, via = "direct", locator = null, reputation = undefined } = {}) {
      const data = typeof bytes === "string" ? enc(bytes) : bytes;
      const s = sha(data);
      await b.put(`bio/captures/${s}`, data);
      const a = address || `https://files.example/${s.slice(0, 12)}`;
      prov.recordReceipt({ address: a, addressNorm: a, captureSha: s, retrieved: new Date(clock.now).toISOString().replace(/\.\d+Z$/, "Z"),
                           via, retrievalLocator: locator ?? a, ...(reputation !== undefined ? { reputation } : {}) });
      return s;
    },
    /** Register a capture under a bundle (its home), as a promotion would: the bundle row and the register row. */
    home(captureSha, bundleId, { project = null } = {}) {
      exec(`INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version, project)
            VALUES (?, 'information', 'g', 't', 'collected', '2026-01-01', '2026-01-01', 'x', 1, ?)`, bundleId, project);
      exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered, authored) VALUES (?, ?, 'snapshots/x', 'binary', 1, '2026-01-01T00:00:00Z', 0)`,
           captureSha, bundleId);
    },
    /** A project only `m1` takes part in. */
    project(id = "PROJ-1", member = "m1") {
      exec(`INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version)
            VALUES (?, 'project', 'g', 'p', 'active', '2026-01-01', '2026-01-01', 'x', 1)`, id);
      exec(`INSERT INTO project_participants (project_id, member_id, state, created, updated) VALUES (?, ?, 'active', '2026-01-01', '2026-01-01')`, id, member);
    },
    calls: (path) => (fsScanner ? fsScanner.calls.filter((c) => c.path === path) : []),
    /** Add a tool and test it on, as an administrator does (R28, R29). */
    async tool(providerId, { use = "on_request", monthlyLimit, config = {}, credentials = null, template = null, confirmRetention = false } = {}) {
      const cat = fs.securityToolCatalogue({ viewer: "member:boss" });
      const entry = cat.offered.find((d) => d.provider_id === providerId);
      const creds = credentials ?? Object.fromEntries((entry.credentials.length ? entry.credentials : ["api_key"]).map((n) => [n, `secret-${n}`]));
      let digest = entry.handling_digest;
      if (template) {
        const { resolveDescriptor, providerById } = await import("../../../../file-scanner/src/providers/catalogue.mjs");
        const { canonicalJson, sha256HexSync } = await import("../../../src/record-grammar/index.mjs");
        const r = resolveDescriptor(providerById(providerId), { host: template.host, config });
        digest = sha256HexSync(canonicalJson(r.descriptor.handling));
      }
      const added = await fs.securityToolAdd({ providerId, template, config, credentials: creds, handlingDigest: digest, confirmRetention,
                                               use, monthlyLimit, by: "boss" });
      if (!added.ok) throw new Error(`tool not added: ${added.code}`);
      const t = await fs.securityToolTest({ toolId: added.tool_id, by: "boss" });
      if (t.state !== "on") throw new Error(`tool not on: ${t.detail}`);
      return added.tool_id;
    },
    /** Every row this module's tables hold, as text. */
    tables() {
      return Object.fromEntries(["fs_files", "fs_notes", "fs_holds", "fs_deeper", "fs_copies", "fs_tools", "fs_tool_usage", "fs_tool_events", "fs_counts"]
        .map((t) => [t, JSON.stringify(exec(`SELECT * FROM ${t}`))]));
    },
  };
  return w;
}

/* A minimal PDF: plain, or with an OpenAction script. */
export const pdf = (active = false, tag = "") => enc(`%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R${active ? "/OpenAction<</S/JavaScript/JS(app.alert(1))>>" : ""}>>endobj\n`
  + `2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%${tag}\n%%EOF`);
