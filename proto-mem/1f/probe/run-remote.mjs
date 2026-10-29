#!/usr/bin/env node
/* proto-mem/1f (THROWAWAY): the run script for BOB's deploy. It talks ONLY to the probe Worker at $PROBE_BASE_URL with the bearer token $PROBE_TOKEN (both from the environment; the token is put in one
   request header and is never printed, logged or written to a result file). It refuses a base URL whose host does not start with plat-s1 (set PROBE_ALLOW_LOCAL=1 to allow 127.0.0.1 for the local self-test).
   Results: one JSON line per measurement appended to --out (default ../results/remote-<scenario>-<UTC timestamp>.jsonl). Wall times are CLIENT-side (the spec asks for client wall time).
   node run-remote.mjs --scenario=health
   node run-remote.mjs --scenario=state --inst=NAME [--which=reader]                             one read of an instance's state and start/stop events (does not touch the container)
   node run-remote.mjs --scenario=wipe                                                          deletes every object in the probe's bucket (before teardown.mjs)
   node run-remote.mjs --scenario=seed [--sizes=10,50,100] [--upload=DIR --only=REGEX]         R2 objects r<N>mib (made in the Worker) and/or generated fixtures put through /put (<= the zone's body cap)
   node run-remote.mjs --scenario=coldstart [--which=min,reader] [--n=5]                        first request to NEW container instances (never run) then warm repeats
   node run-remote.mjs --scenario=fromsleep --which=min --wait-s=360                             ping, wait past sleepAfter (class default 5m; PROBE_SLEEP_AFTER on the Worker overrides), ping again
   node run-remote.mjs --scenario=transfer [--which=min] [--keys=r10mib,r50mib,r100mib] [--n=3]  R2 -> container: push (stream, 8 MiB windows) and pull (outbound handler) with the container's own timings
   node run-remote.mjs --scenario=output [--sizes=10,50,100]                                    container -> Worker stream of N MiB (the stream analogue of exec().output())
   node run-remote.mjs --scenario=bytepass --manifest=/home/user/fix1f/MANIFEST.jsonl [--only=REGEX] [--mode=windows|stream]     L1 floor on a live Worker (objects must be in R2 under their file names)
   node run-remote.mjs --scenario=reader --manifest=... --set=l3|l4|l5 [--only=REGEX] [--which-inst=r0]  L3-L5: the reader image through the product's own caller side
   node run-remote.mjs --scenario=hold --seconds=900 [--which=min]                               a streamed heartbeat; run `wrangler deploy` in another terminal to see what a rollout does to it
   node run-remote.mjs --scenario=sigterm [--which=min]                                          start a hold, call /stop (SIGTERM), report seconds from the SIGTERM line to the last heartbeat
   node run-remote.mjs --scenario=idle --hours=24 [--every-min=10] [--which=min]                 ping once, then poll /state (does not touch the container) and log state + events
   node run-remote.mjs --scenario=printwrangler --manifest=... [--bucket=plat-s1-probe-files] [--min-mib=90]   prints the `wrangler r2 object put` commands for fixtures too large for /put */
import { readFileSync, appendFileSync, mkdirSync, readdirSync, statSync, createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { specOf } from "../cases.mjs";
const here = dirname(fileURLToPath(import.meta.url));
const a = Object.fromEntries(process.argv.slice(2).map((x) => { const [k, ...v] = x.replace(/^--/, "").split("="); return [k, v.join("=") || "1"]; }));
const BASE = (process.env.PROBE_BASE_URL || "").replace(/\/$/, ""), TOKEN = process.env.PROBE_TOKEN || "";
const refuse = (m) => { console.error("REFUSED: " + m); process.exit(3); };
if (!BASE) refuse("PROBE_BASE_URL is not set."); if (!TOKEN) refuse("PROBE_TOKEN is not set.");
const url = new URL(BASE);
if (process.env.PROBE_ALLOW_LOCAL === "1" && url.hostname === "127.0.0.1") { /* local self-test */ }
else if (url.protocol !== "https:" || !/^plat-s1(-[a-z0-9]+)*\./.test(url.hostname)) refuse(`the base URL host must start with plat-s1 (got ${url.hostname}). Only the scratch copy plat-s1 is measured.`);
const scenario = a.scenario || "health", stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outFile = a.out || join(here, "..", "results", `remote-${scenario}-${stamp}.jsonl`); mkdirSync(dirname(outFile), { recursive: true });
const log = (o) => { const line = JSON.stringify({ ts: new Date().toISOString(), scenario, ...o }); appendFileSync(outFile, line + "\n"); console.log(line.length > 600 ? line.slice(0, 600) + "…" : line); };
const H = { authorization: `Bearer ${TOKEN}` };
async function call(path, init = {}) { const t0 = performance.now(); let res, text, err = null; try { res = await fetch(BASE + path, { ...init, headers: { ...H, ...(init.headers || {}) } }); text = await res.text(); } catch (e) { err = String(e.message || e).slice(0, 200); } let body = null; try { body = JSON.parse(text); } catch { body = text ? text.slice(0, 300) : null; } return { status: res ? res.status : null, client_wall_ms: Math.round(performance.now() - t0), body, error: err }; }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const manifest = () => (a.manifest ? readFileSync(a.manifest, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []);
const base = (f) => f.split("/").pop(); const only = a.only ? new RegExp(a.only) : null;

const S = {
  async state() { if (!a.inst) refuse("--inst=NAME is required"); const s = await call(`/state?which=${a.which || "min"}&inst=${a.inst}`); log({ phase: "state", inst: a.inst, state: s.body && s.body.state, events: s.body && s.body.events, status: s.status }); },
  async wipe() { log({ what: "wipe the probe bucket", ...(await call("/wipe", { method: "POST" })) }); },
  async health() { log({ ...(await call("/health")) }); },
  async seed() {
    for (const mib of String(a.sizes || "10,50,100").split(",").map(Number)) log({ what: `gen r${mib}mib`, ...(await call(`/gen?key=r${mib}mib&bytes=${mib * 1048576}&kind=random&salt=${mib}`)) });
    if (a.upload) for (const f of readdirSync(a.upload).sort()) { if (f.startsWith("MANIFEST") || (only && !only.test(f))) continue; const p = join(a.upload, f), size = statSync(p).size;
      if (size > 95 * 1048576) { log({ what: `skip ${f}`, reason: "over 95 MiB: use printwrangler", size }); continue; }
      log({ what: `put ${f}`, size, ...(await call(`/put?key=${encodeURIComponent(f)}`, { method: "PUT", body: Readable.toWeb(createReadStream(p)), duplex: "half", headers: { "content-length": String(size), "content-type": "application/octet-stream" } })) }); }
  },
  async coldstart() {
    for (const which of String(a.which || "min,reader").split(",")) for (let i = 0; i < Number(a.n || 5); i++) {
      const inst = `cs-${stamp.slice(11, 19).replace(/-/g, "")}-${i}`, path = which === "reader" ? "/version" : "/ping";
      const first = await call(`/ping?which=${which}&inst=${inst}&path=${path}`); log({ phase: "first-request-new-instance", which, inst, i, ...first });
      for (let k = 0; k < 3; k++) log({ phase: "warm", which, inst, k, ...(await call(`/ping?which=${which}&inst=${inst}&path=${path}`)) });
      log({ phase: "state", which, inst, ...(await call(`/state?which=${which}&inst=${inst}`)) });
    }
  },
  async fromsleep() {
    const which = a.which || "min", inst = `fs-${stamp.slice(11, 19).replace(/-/g, "")}`, path = which === "reader" ? "/version" : "/ping";
    log({ phase: "first", which, inst, ...(await call(`/ping?which=${which}&inst=${inst}&path=${path}`)) });
    log({ phase: "waiting", seconds: Number(a["wait-s"] || 360) }); await sleep(Number(a["wait-s"] || 360) * 1000);
    log({ phase: "state-before-second", ...(await call(`/state?which=${which}&inst=${inst}`)) });
    log({ phase: "second-after-sleep", which, inst, ...(await call(`/ping?which=${which}&inst=${inst}&path=${path}`)) });
    log({ phase: "state-after", ...(await call(`/state?which=${which}&inst=${inst}`)) });
  },
  async transfer() {
    const which = a.which || "min", keys = String(a.keys || "r10mib,r50mib,r100mib").split(","), n = Number(a.n || 3), inst = `tr-${which}-${stamp.slice(11, 19).replace(/-/g, "")}`, path = which === "reader" ? "/version" : "/ping";
    log({ phase: "warm-up", ...(await call(`/ping?which=${which}&inst=${inst}&path=${path}`)) });
    for (const key of keys) for (const route of [`push&mode=stream`, `push&mode=windows`, `pull`]) for (let i = 0; i < n; i++) {
      const [r, extra] = route.split("&"); const res = await call(`/${r}?which=${which}&inst=${inst}&key=${encodeURIComponent(key)}${extra ? "&" + extra : ""}`);
      const c = res.body && res.body.container; const bytes = c && c.bytes; log({ key, route, i, which, mb_per_s_client: bytes ? Math.round(bytes / 1048576 / (res.client_wall_ms / 1000) * 10) / 10 : null, ...res });
    }
  },
  async output() {
    const which = a.which || "min", inst = `out-${stamp.slice(11, 19).replace(/-/g, "")}`; log({ phase: "warm-up", ...(await call(`/ping?which=${which}&inst=${inst}&path=/ping`)) });
    for (const mib of String(a.sizes || "10,50,100").split(",").map(Number)) for (let i = 0; i < Number(a.n || 3); i++) log({ mib, i, ...(await call(`/fetchsource?which=${which}&inst=${inst}&bytes=${mib * 1048576}`)) });
  },
  async bytepass() {
    for (const m of manifest()) { const key = base(m.file); if (only && !only.test(key)) continue; const modes = a.mode ? [a.mode] : ["windows"];
      for (const mode of modes) { const res = await call(`/bytepass?key=${encodeURIComponent(key)}&mode=${mode}&token=${encodeURIComponent(m.token || "")}`); const b = res.body || {}; log({ key, mode, expect_bytes: m.bytes, expect_sha256: m.sha256, expect_rows: m.rows ?? null, sha_match: b.sha256 === m.sha256, newlines: b.newlines, token_found: b.token_found_at != null, ...res }); } }
  },
  async reader() {
    const inst = a["which-inst"] || "r0";
    log({ phase: "warm-up", ...(await call(`/ping?which=reader&inst=${inst}&path=/version`)) });
    for (const m of manifest()) { const key = base(m.file), s = specOf(key); if (!s || (a.set && s.set !== a.set) || (only && !only.test(key))) continue;
      const q = new URLSearchParams({ key, kind: s.kind, inst, ...(s.to ? { to: s.to } : {}), ...(s.route === "archive" ? { name: key } : {}) });
      log({ key, set: s.set, route: s.route, kind: s.kind, file_bytes: m.bytes, ...(await call(`/reader/${s.route}?${q}`, { method: "POST" })) }); }
  },
  async hold() {
    const which = a.which || "min", inst = `hd-${stamp.slice(11, 19).replace(/-/g, "")}`, secs = Number(a.seconds || 900), t0 = Date.now(); let last = t0, beats = 0, end = null;
    log({ phase: "start", which, inst, seconds: secs, note: "run `npx wrangler deploy --config wrangler.generated.json` in another terminal now (and note the time) to see what a rollout does to this stream" });
    const res = await fetch(`${BASE}/hold?which=${which}&inst=${inst}&seconds=${secs}&beat=5`, { headers: H }); const rd = res.body.getReader(), dec = new TextDecoder(); let buf = "";
    try { for (;;) { const { done, value } = await rd.read(); if (done) { end = "stream ended"; break; } buf += dec.decode(value, { stream: true }); let i; while ((i = buf.indexOf("\n")) >= 0) { const l = buf.slice(0, i); buf = buf.slice(i + 1); last = Date.now(); beats++; if (/sigterm|hold":"end/.test(l)) log({ line: l }); } } } catch (e) { end = "error: " + String(e.message).slice(0, 100); }
    log({ phase: "ended", end, beats, seconds_alive: Math.round((last - t0) / 1000), seconds_since_last_line: Math.round((Date.now() - last) / 1000) });
  },
  async sigterm() {
    const which = a.which || "min", inst = `sg-${stamp.slice(11, 19).replace(/-/g, "")}`; let sig = null, last = Date.now(); const lines = [];
    const res = await fetch(`${BASE}/hold?which=${which}&inst=${inst}&seconds=3600&beat=5`, { headers: H }); const rd = res.body.getReader(), dec = new TextDecoder();
    setTimeout(async () => { log({ phase: "calling stop", ...(await call(`/stop?which=${which}&inst=${inst}&signal=SIGTERM`)) }); }, 20000);
    let buf = ""; try { for (;;) { const { done, value } = await rd.read(); if (done) break; buf += dec.decode(value, { stream: true }); let i; while ((i = buf.indexOf("\n")) >= 0) { const l = buf.slice(0, i); buf = buf.slice(i + 1); last = Date.now(); try { const j = JSON.parse(l); if (j.sigterm) sig = j.sigterm; } catch { /* */ } lines.push(l.length); } } } catch (e) { log({ error: String(e.message).slice(0, 100) }); }
    log({ phase: "ended", sigterm_seen_at: sig, last_line_at: last, seconds_from_sigterm_to_last_line: sig ? Math.round((last - sig) / 1000) : null, lines: lines.length, state: await call(`/state?which=${which}&inst=${inst}`) });
  },
  async idle() {
    /* --hours=0 pings once and returns (a session's background command ends within 2 h); read the object's start/stop events later with --scenario=state --inst=<the inst logged here> */
    const which = a.which || "min", inst = a.inst || `id-${stamp.slice(11, 19).replace(/-/g, "")}`, until = Date.now() + Number(a.hours ?? 24) * 3600000, every = Number(a["every-min"] || 10) * 60000;
    log({ phase: "first-ping", which, inst, note: "record the wall-clock time; read the account's Containers usage/billing for this period afterwards", ...(await call(`/ping?which=${which}&inst=${inst}&path=${which === "reader" ? "/version" : "/ping"}`)) });
    while (Date.now() < until) { await sleep(every); const s = await call(`/state?which=${which}&inst=${inst}`); log({ phase: "state", inst, state: s.body && s.body.state, events: s.body && s.body.events, status: s.status }); }
  },
  async printwrangler() {
    const bucket = a.bucket || "plat-s1-probe-files", min = Number(a["min-mib"] || 90) * 1048576;
    for (const m of manifest()) if (m.bytes > min) console.log(`npx wrangler r2 object put ${bucket}/${base(m.file)} --file=${m.file} --remote   # ${m.bytes} bytes; wrangler 4 needs --remote for the real bucket; if wrangler refuses this size use an S3-compatible multipart tool with an R2 token (BOB's)`);
  },
};
if (!S[scenario]) refuse(`unknown scenario ${scenario}`);
/* the published reader image serves only POST /convert, /frames, /archive and GET /version (its container/server.mjs:81 answers 404 otherwise); these scenarios need MinProbe's /sink, /pull, /source, /hold */
if (a.which === "reader" && ["transfer", "output", "hold", "sigterm"].includes(scenario)) refuse(`scenario ${scenario} needs MinProbe's routes; with --which=reader run health, seed, coldstart, fromsleep, bytepass, reader, idle.`);
log({ phase: "begin", base_host: url.hostname, out: outFile });
await S[scenario]();
