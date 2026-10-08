/* The installer's world, for the requirement-named suite (`requirements.test.mjs`): the Worker driven through its own
 * routes, and everything it reaches over the network answered here. One STATEFUL fake Cloudflare account keeps every
 * script uploaded with its bindings (applying `keep_bindings` by type, refusing a service binding to a worker it does
 * not hold with code 10143), the buckets, the workers.dev prefix and each script's address; the public release
 * repository serves a manifest and assets, or is unreachable; and the copy's address answers `op=selftest` and
 * `op=bootstrap` the way a plane does, derived from what was uploaded. A streamed progress page is parsed back into
 * the steps, the refusal and the final panel it emits.
 */
import worker, { CFG, ARMED_SIGNERS, planeLimits } from "../src/index.mjs";
import { RELEASE_VERSION, RELEASE_SOURCE } from "../src/release.mjs";
/* The member binding names are instance-setup's (installer R30); the installer holds no table of its own. */
import { FLEET_BINDINGS } from "../../bio-plane/src/setup-fleet.mjs";
import { fleetStatement, NS_FLEET, NS_RELEASE } from "../../bio-plane/src/sshsig.mjs";

export const TOK = "TOKEN-THAT-MUST-NEVER-APPEAR-IN-OUTPUT";
export const ORIGIN = "https://newgroup.believeinoakland.workers.dev";
export const realFetch = globalThis.fetch;
export const jres = (o, status = 200) => new Response(JSON.stringify(o), { status });
export const cfok = (result) => jres({ success: true, result });
export const cferr = (message, status = 400, code = 0) => jres({ success: false, errors: [{ message, code }] }, status);

export const req = (path, init) => worker.fetch(new Request(ORIGIN + path, init));
export const b64url = (s) => Buffer.from(s).toString("base64url");
export const cookieOf = (r) => (r.headers.get("set-cookie") || "").split(";")[0];
export const cookieValue = (cookie) => JSON.parse(Buffer.from(cookie.split("=")[1], "base64url").toString());

export async function begin(slug, mode = "install", extra = {}) {
  const r = await req("/begin", { method: "POST", body: JSON.stringify({ slug, mode, ...extra }) });
  const j = await r.json();
  const cookie = cookieOf(r);
  return { r, j, cookie, state: j.ok ? new URL(j.authorize).searchParams.get("state") : null };
}

/* A scripted network: rules matched in order, every call recorded. */
export function script(rules) {
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const u = typeof input === "string" ? input : input.url;
    const method = (init.method || "GET").toUpperCase();
    calls.push({ u, method, init });
    for (const r of rules) if (r.m(u, method)) return r.f(u, init);
    throw new Error(`unscripted fetch: ${method} ${u}`);
  };
  return calls;
}

/* The streamed page, read back. Everything after the shell's own script is a series of calls to its functions; they
   are run here against recorders, so a label is read exactly as the page's script receives it. */
export function parsePage(raw) {
  const events = [];
  let failed = null, done = null;
  const scripts = [...raw.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const rec = {
    step: (id, label) => events.push({ k: "step", id, label }),
    ok: (id, label) => events.push({ k: "ok", id, label: label ?? null }),
    no: (id, label) => { if (id !== undefined) events.push({ k: "no", id, label: label ?? null }); },
    fail: (h, p, d) => { failed = { h, p, d }; },
    done: (html) => { done = html; },
  };
  for (const s of scripts.slice(1)) new Function(...Object.keys(rec), s)(...Object.values(rec));
  const status = (id) => { let st = null; for (const e of events) if (e.id === id) st = e.k; return st; };
  const label = (id) => events.filter((e) => e.id === id).map((e) => e.label).filter(Boolean).at(-1) ?? null;
  const steps = [...new Set(events.filter((e) => e.k === "step").map((e) => e.id))];
  /* All the page's words: the shell, every label, the refusal and the panel. */
  const words = [raw.replace(/<script>[\s\S]*?<\/script>/g, ""), ...events.map((e) => e.label || ""),
    failed ? `${failed.h} ${failed.p} ${failed.d}` : "", done || ""].join("\n");
  return { raw, events, steps, status, label, failed, done, words };
}

export async function callback(qs, cookie) {
  const r = await req("/callback?" + qs, { headers: cookie ? { cookie } : {} });
  const raw = await r.text();
  return { r, raw, page: parsePage(raw) };
}

/* ---- signing: a real Ed25519 SSHSIG signer, built as the offline signer page builds one ---- */
const wireU32 = (n) => new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
const cat = (...ps) => { let n = 0; for (const p of ps) n += p.length; const o = new Uint8Array(n); let i = 0;
  for (const p of ps) { o.set(p, i); i += p.length; } return o; };
const wstr = (v) => { const b = typeof v === "string" ? new TextEncoder().encode(v) : v; return cat(wireU32(b.length), b); };
const toB64 = (b) => Buffer.from(b).toString("base64");
export async function signer(comment = "release-test") {
  const key = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
  const pub = new Uint8Array(await crypto.subtle.exportKey("raw", key.publicKey));
  const line = "ssh-ed25519 " + toB64(cat(wstr("ssh-ed25519"), wstr(pub))) + " " + comment;
  const sign = async (bytes, ns = NS_RELEASE) => {
    const b = typeof bytes === "string" ? new TextEncoder().encode(bytes) : bytes;
    const h = new Uint8Array(await crypto.subtle.digest("SHA-512", b));
    const signed = cat(new TextEncoder().encode("SSHSIG"), wstr(ns), wstr(""), wstr("sha512"), wstr(h));
    const sig = new Uint8Array(await crypto.subtle.sign("Ed25519", key.privateKey, signed));
    const blob = cat(new TextEncoder().encode("SSHSIG"), wireU32(1), wstr(cat(wstr("ssh-ed25519"), wstr(pub))), wstr(ns),
      wstr(""), wstr("sha512"), wstr(cat(wstr("ssh-ed25519"), wstr(sig))));
    return "-----BEGIN SSH SIGNATURE-----\n" + toB64(blob).replace(/(.{70})/g, "$1\n") + "\n-----END SSH SIGNATURE-----\n";
  };
  return { line, sign };
}
export const SIGNER = await signer();
export const STRANGER = await signer("stranger");
const SHIPPED = [...ARMED_SIGNERS];
export const armWith = (...lines) => { ARMED_SIGNERS.length = 0; ARMED_SIGNERS.push(...lines); };
export const disarm = () => { ARMED_SIGNERS.length = 0; };
export const restoreSigners = () => armWith(...SHIPPED);

export const sha = async (x) => Buffer.from(await crypto.subtle.digest("SHA-256",
  typeof x === "string" ? new TextEncoder().encode(x) : x)).toString("hex");
export const bump = (v) => { const p = v.split(".").map(Number); p[2] += 1; return p.join("."); };
/* The release the world serves when a test names none: newer than the built-in, signed by SIGNER, stating its limits,
   naming no fleet. `run` arms SIGNER for that act only. `rel: null` is a repository that does not answer. */
export const DEFAULT_VERSION = bump(RELEASE_VERSION);

/* ---- a release the repository serves ---- */
/* A plane that can report builds (its source carries both fields, so the installer reads it as capable) and one that
   cannot (the releases before D-116). */
/* Each states its limits as the plane does (R20): one string `bio-plane-limits/1 key=n …`, which survives bundling. */
export const LIMITS = Object.freeze({ subrequests: 10000 });
export const LIMITS_STATEMENT = "bio-plane-limits/1 subrequests=10000";
export const CAPABLE_SRC = "export default { fetch(){ return Response.json({ storeVersion: 'x', memberVersions: {} }); } }; export class Store {}; export const PLANE_LIMITS_STATEMENT = \"" + LIMITS_STATEMENT + "\";";
export const PRE116_SRC = "export default { fetch(){ return new Response('pre-D-116 plane'); } }; export class Store {}; export const PLANE_LIMITS_STATEMENT = '" + LIMITS_STATEMENT + "';";
/* A plane from before R20: verified, and stating no limits. */
export const UNSTATED_SRC = "export default { fetch(){ return Response.json({ storeVersion: 'x', memberVersions: {} }); } }; export class Store {};";
/* Whether this tree's built-in release states its limits (R20). Until a release cut after control-plane's statement is
   embedded it does not, and an act that falls back to it is refused; the arms that read the built-in assert whichever
   holds, so they survive the cut. */
export const BUILTIN_LIMITS = planeLimits(RELEASE_SOURCE);
export const MEMBER_SRC = "export default { fetch(){ return new Response('member'); } };";
export const WASM = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);

/* R38: the container member's descriptor, the `Container` part the signed fleet statement covers by its hash. */
export const IMAGE = "docker.io/civicos/agent-runner@sha256:" + "a".repeat(64);
export const DESCRIPTOR = Object.freeze({ class_name: "AgentRunner", image: IMAGE, scheduling_policy: "default", max_instances: 5,
  bind: [{ member: "agent-worker", binding: "RUNNER" }] });
export const RUNNER = "agent-runner";
/* R38, R44 (T36): the two-class container member file-scanner: one `Container` part per class
   (`container/<class_name>.json`), each class bound into the member itself, and its `Worker` part naming its bucket by
   role, its schedule and its optional private-network binding. */
export const SCANNER = "file-scanner";
export const SCAN_IMAGE = "docker.io/civicos/file-scanner-scanner@sha256:" + "d".repeat(64);
export const RENDER_IMAGE = "docker.io/civicos/file-scanner-renderer@sha256:" + "e".repeat(64);
export const SCANNER_CLASSES = Object.freeze([
  Object.freeze({ class_name: "FileScanner", image: SCAN_IMAGE, scheduling_policy: "default", max_instances: 3, bind: [{ member: SCANNER, binding: "SCANNER" }] }),
  Object.freeze({ class_name: "SafeViewRenderer", image: RENDER_IMAGE, scheduling_policy: "default", max_instances: 3, bind: [{ member: SCANNER, binding: "RENDERER" }] }),
]);
export const SCANNER_WORKER = Object.freeze({ r2_buckets: [{ binding: "CAPTURES", bucket: "captures" }], crons: ["17 4 * * *"],
  vpc_services: [{ binding: "SECURITY_VPC" }] });
export const VPC_ID = "0123456789abcdef0123456789abcdef";

/* `members`: the fleet's member names (default: the three the plane binds). Options drop the fleet signature, sign it
   over another set, tamper with a member's bytes, name an unknown part type, or leave the fleet out. `container` adds
   the container member agent-runner with `descriptor` (an object, or raw text) as its `Container` part. `memberSrc`
   gives a member its own bundle text (R39: one stating its limits), hashed into the signed statement like any. */
export async function release({ version, src = CAPABLE_SRC, members = FLEET_BINDINGS.map(([m]) => m), sig = "good",
  fleet = true, fleetSig = "good", tamper = null, badType = null, missing = null, signedMembers = null,
  container = false, descriptor = DESCRIPTOR, memberSrc = {},
  /* `scanner`: adds file-scanner; `scannerParts` replaces its parts' texts by path (a value null drops that part);
     `scannerWorker` its `Worker` part (an object, raw text, or null for none). */
  scanner = false, scannerParts = {}, scannerWorker = SCANNER_WORKER } = {}) {
  const planeSha = await sha(src);
  const boxText = typeof descriptor === "string" ? descriptor : JSON.stringify(descriptor);
  const text = (x) => typeof x === "string" ? x : JSON.stringify(x);
  const scannerTexts = {};
  for (const c of SCANNER_CLASSES) scannerTexts[`container/${c.class_name}.json`] = text(c);
  if (scannerWorker !== null) scannerTexts["worker.json"] = text(scannerWorker);
  for (const [path, t] of Object.entries(scannerParts)) { if (t === null) delete scannerTexts[path]; else scannerTexts[path] = text(t); }
  const partTexts = {};
  const srcOf = (member) => memberSrc[member] ?? MEMBER_SRC;
  const entry = async (member) => ({ member, asset: `${member}.bundled.mjs`, sha256: await sha(srcOf(member)),
    bytes: srcOf(member).length, compat: { date: "2026-07-01", flags: [] },
    services: member === "agent-worker" ? [{ binding: "PLANE", service: "bio-plane" }] : [],
    parts: member === "ocr-worker" ? [{ path: "assets/x.wasm", type: badType === member ? "Mystery" : "CompiledWasm",
      sha256: await sha(WASM), bytes: WASM.length }]
      : member === RUNNER && container ? [{ path: "container.json", type: "Container", sha256: await sha(boxText), bytes: boxText.length }]
      : member === SCANNER && scanner ? await Promise.all(Object.entries(scannerTexts).map(async ([path, t]) => {
        partTexts[`${member}/${path}`] = t;
        return { path, type: path === "worker.json" ? "Worker" : "Container", sha256: await sha(t), bytes: t.length }; }))
      : [] });
  if (container && !members.includes(RUNNER)) members = [...members, RUNNER];
  if (scanner && !members.includes(SCANNER)) members = [...members, SCANNER];
  const list = await Promise.all(members.map(entry));
  const plane = { sha256: planeSha, bytes: src.length, asset: "bio-plane.bundled.mjs" };
  const signedList = signedMembers ? await Promise.all(signedMembers.map(entry)) : list;
  const manifest = { version, sha256: planeSha, bytes: src.length, asset: "bio-plane.bundled.mjs",
    ...(sig === "good" ? { sig: await SIGNER.sign(src) } : sig === "stranger" ? { sig: await STRANGER.sign(src) }
      : sig === "wrong-ns" ? { sig: await SIGNER.sign(src, "bio-ratify") } : {}),
    ...(fleet ? { fleet: list } : {}),
    ...(fleet && fleetSig === "good" ? { fleetSig: await SIGNER.sign(fleetStatement({ version, plane, members: signedList }), NS_FLEET) } : {}) };
  const assets = { "bio-plane.bundled.mjs": src };
  for (const m of list) {
    assets[m.asset] = m.member === tamper ? "tampered" : srcOf(m.member);
    if (m.member === missing) delete assets[m.asset];
    for (const p of m.parts) assets[`${m.member}/${p.path}`] = partTexts[`${m.member}/${p.path}`] ?? (p.type === "Container" ? boxText : WASM);
  }
  return { manifest, assets, version, src };
}

/* ---- the world: one install or update, end to end ---- */
export async function run({ slug, mode = "install", ai, cookie: givenCookie, state: givenState,
  accounts = [{ id: "A1", name: "Group Account" }], tokenFail = false, accountsFail = false, settingsFail = false,
  plan = "paid", probeDelete = "ok", r2 = "ok", pre = {}, subdomain = "grp", taken = [], subdomainPut = "ok",
  enableFail = false, refuseSelf = false, refuseAllPlane = false, refuseRePut = false, refuseUpdate = false,
  lookupFail = [], readBack = "raw", preBuckets = [], rel, copy = {},
  /* R38: the scopes the token response states (null: it states none), and the Containers API. `containers`: "ok", or
     "read" (every Containers call refused), "create" or "rollout" (that call refused); `preApps` the applications held;
     `preClasses` the Durable Object classes each pre-existing script holds. `settingsBlind`: settings answer no bindings.
     `refuseSecretDelete`: a secret's removal refused. */
  grantedScope = CFG.SCOPES.join(" "), containers = "ok", preApps = [], preClasses = {}, settingsBlind = false,
  refuseSecretDelete = false,
  /* T36: `vpc` the Workers VPC service the operator names (R45), `refuseVpc` an upload naming one refused; `logpush` the
     account's Logpush jobs, or "refused" (R46); `refuseSchedules` a schedule refused (R44). */
  vpc, refuseVpc = false, logpush = [], refuseSchedules = false } = {}) {
  const signersBefore = [...ARMED_SIGNERS];
  if (rel === undefined) { rel = await release({ version: DEFAULT_VERSION, fleet: false }); armWith(SIGNER.line); }
  const realTimeout = globalThis.setTimeout;
  globalThis.setTimeout = (fn) => realTimeout(fn, 0);
  const acct = new Map(Object.entries(pre));
  /* `r2: "exists"` an account already holding a bucket; `"late"` one whose bucket appears between the install's look (R32,
     which reads it absent) and its creation (R7, which meets "already exists"): a race, the only way an install meets one. */
  const buckets = new Set([...(r2 === "exists" || r2 === "late" ? ["bio-captures"] : []), ...preBuckets]);
  /* What each script was last uploaded with, as the account would hand it back (R33's read-back). `readBack`: "raw" (the
     module itself), "multipart" (the module as the `index.mjs` part), "differ" (other bytes, every time), "differ-once"
     (other bytes on the first read only), "fail" (the read refused). */
  const sources = new Map();
  const reads = [];
  const classes = new Map(Object.entries(preClasses));
  const apps = preApps.map((a) => ({ ...a }));
  const rollouts = [], deleted = [], schedules = new Map();
  const refused = [], planePuts = [], enabled = new Set();
  let prefix = subdomain;
  const verOf = (b) => (b || []).find((x) => x.name === "VERSION")?.text || null;
  const membersOf = () => {
    const pb = acct.get(slug) || [];
    return Object.fromEntries(FLEET_BINDINGS.map(([member, binding]) => {
      const b = pb.find((x) => x.type === "service" && x.name === binding);
      if (!b) return [member, { binding, state: "UNBOUND" }];
      if (!acct.has(b.service)) return [member, { binding, state: "SILENT" }];
      if (b.service !== member) return [member, { binding, state: "MISNAMED", name: b.service, version: verOf(acct.get(b.service)) }];
      return [member, { binding, state: "SERVING", version: copy.memberVersion ?? verOf(acct.get(b.service)) }];
    }));
  };
  const putScript = async (u, init) => {
    const name = u.split("/workers/scripts/")[1];
    const meta = JSON.parse(await init.body.get("metadata").text());
    const explicit = meta.bindings || [];
    if (name === slug) {
      const isRePut = planePuts.length > 0 && !("migrations" in meta) && mode === "install";
      if (refuseAllPlane || (refuseUpdate && mode === "update" && planePuts.length === 0) || (refuseRePut && isRePut)
          || (refuseSelf && explicit.some((b) => b.name === "SELF"))) {
        refused.push(`${name}:refused`);
        return cferr("the upload was refused <b>by the fake</b>", 400, 10021);
      }
    }
    if (refuseVpc && explicit.some((b) => b.type === "vpc_service")) {
      refused.push(`${name}:vpc`);
      return cferr("VPC service not found or not permitted <b>by the fake</b>", 403, 10000);
    }
    for (const b of explicit) if (b.type === "service" && b.service !== name && !acct.has(b.service)) {
      refused.push(`${name}:${b.name}->${b.service}`);
      return cferr(`Service binding '${b.name}' references Worker '${b.service}' which was not found`, 400, 10143);
    }
    /* A cross-script Durable Object binding names a class the other script must hold. */
    for (const b of explicit) if (b.type === "durable_object_namespace" && b.script_name && b.script_name !== name
        && !(classes.get(b.script_name) || []).includes(b.class_name)) {
      refused.push(`${name}:${b.name}->${b.script_name}.${b.class_name}`);
      return cferr(`Durable Object binding '${b.name}' references class '${b.class_name}' in '${b.script_name}', which was not found`, 400, 10061);
    }
    if (meta.migrations?.new_sqlite_classes) {
      if ((classes.get(name) || []).some((c) => meta.migrations.new_sqlite_classes.includes(c)))
        return cferr("migration tag precondition failed", 400, 10079);
      classes.set(name, [...(classes.get(name) || []), ...meta.migrations.new_sqlite_classes]);
    }
    const kept = (acct.get(name) || []).filter((b) => (meta.keep_bindings || []).includes(b.type)
      && !explicit.some((x) => x.name === b.name));
    acct.set(name, [...explicit, ...kept]);
    sources.set(name, await init.body.get("index.mjs").text());
    if (name === slug) planePuts.push({ meta, bindings: acct.get(slug), source: await init.body.get("index.mjs").text(), form: init.body });
    return cfok({ id: name });
  };
  const API = CFG.API;
  const rules = [
    { m: (u) => u.startsWith(CFG.RELEASE_LATEST + "/"), f: (u) => {
      if (!rel) return new Response("not found", { status: 404 });
      const p = u.slice(CFG.RELEASE_LATEST.length + 1);
      if (p === "RELEASE.json") return jres(rel.manifest);
      return p in rel.assets ? new Response(rel.assets[p]) : new Response("gone", { status: 404 });
    } },
    { m: (u) => u === CFG.TOKEN, f: () => tokenFail ? jres({ error: "invalid_grant", error_description: "code spent" }, 400)
      : jres({ access_token: TOK, ...(grantedScope === null ? {} : { scope: grantedScope }) }) },
    { m: (u, mth) => /\/workers\/scripts\/[^/]+\/secrets\/[^/]+$/.test(u) && mth === "DELETE", f: (u) => {
      const [name, , secret] = u.split("/workers/scripts/")[1].split("/");
      if (refuseSecretDelete) return cferr("secret removal refused <i>by the fake</i>", 500);
      acct.set(name, (acct.get(name) || []).filter((b) => b.name !== secret));
      deleted.push(`${name}/${secret}`);
      return cfok({});
    } },
    { m: (u) => u.endsWith("/logpush/jobs"), f: () => logpush === "refused" ? cferr("Authentication error", 403, 10000) : cfok(logpush) },
    { m: (u, mth) => /\/workers\/scripts\/[^/]+\/schedules$/.test(u) && mth === "PUT", f: (u, init) => {
      if (refuseSchedules) return cferr("schedules refused <i>by the fake</i>", 500);
      schedules.set(u.split("/workers/scripts/")[1].split("/")[0], JSON.parse(init.body).map((x) => x.cron));
      return cfok({ schedules: JSON.parse(init.body) });
    } },
    { m: (u, mth) => u.includes("/workers/durable_objects/namespaces") && mth === "GET", f: () =>
      cfok([...classes].flatMap(([script, cs]) => cs.map((c) => ({ id: `ns-${script}-${c}`, script, class: c })))) },
    { m: (u) => u.includes("/containers/applications"), f: (u, init) => {
      const mth = (init.method || "GET").toUpperCase();
      if (containers === "read") return cferr("Authentication error", 403, 10000);
      if (mth === "GET") return cfok(apps);
      const body = JSON.parse(init.body);
      if (u.endsWith("/rollouts")) {
        if (containers === "rollout") return cferr("rollout refused", 500);
        const id = u.split("/applications/")[1].split("/")[0];
        rollouts.push({ id, ...body });
        return cfok({ id: "r" + rollouts.length });
      }
      if (containers === "create") return cferr("application refused", 500);
      apps.push({ id: "app" + (apps.length + 1), ...body });
      return cfok(apps.at(-1));
    } },
    { m: (u) => u === `${API}/accounts`, f: () => accountsFail ? cferr("forbidden", 403) : cfok(accounts) },
    { m: (u, mth) => u.includes("/scripts/bio-plan-probe") && mth === "PUT", f: async (u, init) => {
      if (plan === "free") return cferr("CPU limits are not supported for the Free plan.", 400, 100328);
      if (plan === "unknown") return cferr("internal error", 500, 7000);
      acct.set("bio-plan-probe", [{ limits: JSON.parse(await init.body.get("metadata").text()).limits }]);
      return cfok({});
    } },
    { m: (u, mth) => u.includes("/scripts/bio-plan-probe") && mth === "DELETE", f: () => {
      if (probeDelete === "fail") return cferr("busy", 500);
      acct.delete("bio-plan-probe"); return cfok({});
    } },
    { m: (u, mth) => /\/workers\/scripts\/[^/]+\/settings$/.test(u) && mth === "GET", f: (u) => {
      const name = u.split("/workers/scripts/")[1].split("/")[0];
      if (settingsFail || lookupFail.includes(name)) return cferr("upstream trouble", 500);
      /* Settings name each binding, a secret by its name and type only. */
      return acct.has(name) ? cfok(settingsBlind ? {} : { bindings: (acct.get(name) || []).map(({ text, ...b }) => b) })
        : cferr("not found", 404);
    } },
    { m: (u, mth) => /\/workers\/scripts\/[^/]+$/.test(u) && mth === "PUT", f: putScript },
    { m: (u, mth) => /\/workers\/scripts\/[^/]+$/.test(u) && mth === "GET", f: (u) => {
      const name = u.split("/workers/scripts/")[1];
      reads.push(name);
      if (!sources.has(name)) return cferr("not found", 404);
      if (readBack === "fail") return cferr("upstream trouble", 500);
      const body = readBack === "differ" || (readBack === "differ-once" && reads.filter((n) => n === name).length === 1)
        ? sources.get(name) + "\n/* altered */" : sources.get(name);
      if (readBack !== "multipart") return new Response(body, { headers: { "content-type": "application/javascript+module" } });
      const B = "fakeboundary7";
      return new Response(`--${B}\r\ncontent-disposition: form-data; name="metadata"\r\n\r\n{}\r\n`
        + `--${B}\r\ncontent-disposition: form-data; name="index.mjs"; filename="index.mjs"\r\ncontent-type: application/javascript+module\r\n\r\n${body}\r\n--${B}--\r\n`,
        { headers: { "content-type": `multipart/form-data; boundary=${B}` } });
    } },
    { m: (u, mth) => /\/r2\/buckets\/[^/]+$/.test(u) && mth === "GET", f: (u) => {
      const name = u.split("/r2/buckets/")[1];
      if (lookupFail.includes(name)) return cferr("upstream trouble", 500);
      return buckets.has(name) && r2 !== "late" ? cfok({ name }) : cferr("The specified bucket does not exist.", 404, 10006);
    } },
    { m: (u, mth) => u.endsWith("/r2/buckets") && mth === "POST", f: async (u, init) => {
      const { name } = JSON.parse(init.body);
      if (r2 === "refused") return cferr("Please enable R2 by adding a payment method", 403);
      if (buckets.has(name)) return cferr(`The bucket you tried to create already exists`, 409);
      buckets.add(name); return cfok({ name });
    } },
    { m: (u, mth) => u.endsWith("/workers/subdomain") && mth === "GET", f: () => prefix ? cfok({ subdomain: prefix })
      : cferr("no subdomain", 404) },
    { m: (u, mth) => u.endsWith("/workers/subdomain") && mth === "PUT", f: (u, init) => {
      const want = JSON.parse(init.body).subdomain;
      if (subdomainPut === "fail") return cferr("upstream trouble", 500);
      if (taken.includes(want)) return cferr("That subdomain is taken", 409);
      prefix = want; return cfok({ subdomain: want });
    } },
    { m: (u, mth) => /\/workers\/scripts\/[^/]+\/subdomain$/.test(u) && mth === "POST", f: (u) => {
      if (enableFail) return cferr("could not enable", 500);
      enabled.add(u.split("/workers/scripts/")[1].split("/")[0]); return cfok({ enabled: true });
    } },
    { m: (u) => /^https:\/\/[^/]+\.workers\.dev\//.test(u) && !u.startsWith(ORIGIN), f: (u) => {
      const host = new URL(u).host;
      const [name, pre2] = host.split(".");
      if (name !== slug || pre2 !== prefix || !acct.has(slug)) throw new Error("ENOTFOUND " + host);
      if (copy.silent) throw new Error("ENOTFOUND " + host);
      const q = new URL(u).searchParams;
      const v = verOf(acct.get(slug)) || "0.0.0";
      if (q.get("op") === "selftest") return copy.selftest ? copy.selftest(q) : jres({ ok: true, bindings: { STORE: true } });
      if (q.get("op") === "bootstrap") {
        if (copy.bootstrap) return copy.bootstrap(q, { v, members: membersOf() });
        const before = copy.before === undefined ? v : copy.before;
        if (!q.get("members") && copy.seenBefore !== true) { copy.seenBefore = true; return before === null
          ? new Response("unavailable", { status: 503 }) : jres({ ok: true, version: before }); }
        return jres({ ok: true, version: v, storeVersion: copy.storeVersion ?? v, memberVersions: membersOf() });
      }
      return jres({ ok: false });
    } },
  ];
  const calls = script(rules);
  let ck = givenCookie, st = givenState;
  if (!ck) ({ cookie: ck, state: st } = await begin(slug, mode, { ...(ai === undefined ? {} : { instanceAi: ai }),
    ...(vpc === undefined ? {} : { securityVpc: vpc }) }));
  let out;
  try { out = await callback(`code=GOODCODE&state=${st}`, ck); }
  finally { globalThis.setTimeout = realTimeout; globalThis.fetch = realFetch; armWith(...signersBefore); }
  return { ...out, calls, acct, buckets, refused, planePuts, enabled, prefix: () => prefix, membersOf, reads, apps, rollouts,
    classes, deleted, schedules };
}

/* The binding a plane PUT carried, by name. */
export const bindingOf = (put, name) => (put?.meta?.bindings || []).find((b) => b.name === name) ?? null;
