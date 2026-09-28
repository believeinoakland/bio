/* The installer's world, for the requirement-named suite (`requirements.test.mjs`): the Worker driven through its own
 * routes, and everything it reaches over the network answered here. One STATEFUL fake Cloudflare account keeps every
 * script uploaded with its bindings (applying `keep_bindings` by type, refusing a service binding to a worker it does
 * not hold with code 10143), the buckets, the workers.dev prefix and each script's address; the public release
 * repository serves a manifest and assets, or is unreachable; and the copy's address answers `op=selftest` and
 * `op=bootstrap` the way a plane does, derived from what was uploaded. A streamed progress page is parsed back into
 * the steps, the refusal and the final panel it emits.
 */
import worker, { CFG, ARMED_SIGNERS, MEMBER_BINDINGS } from "../src/index.mjs";
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

/* ---- a release the repository serves ---- */
/* A plane that can report builds (its source carries both fields, so the installer reads it as capable) and one that
   cannot (the releases before D-116). */
export const CAPABLE_SRC = "export default { fetch(){ return Response.json({ storeVersion: 'x', memberVersions: {} }); } }; export class Store {};";
export const PRE116_SRC = "export default { fetch(){ return new Response('pre-D-116 plane'); } }; export class Store {};";
export const MEMBER_SRC = "export default { fetch(){ return new Response('member'); } };";
export const WASM = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);

/* `members`: the fleet's member names (default: the three the plane binds). Options drop the fleet signature, sign it
   over another set, tamper with a member's bytes, name an unknown part type, or leave the fleet out. */
export async function release({ version, src = CAPABLE_SRC, members = Object.keys(MEMBER_BINDINGS), sig = "good",
  fleet = true, fleetSig = "good", tamper = null, badType = null, missing = null, signedMembers = null } = {}) {
  const planeSha = await sha(src);
  const entry = async (member) => ({ member, asset: `${member}.bundled.mjs`, sha256: await sha(MEMBER_SRC),
    bytes: MEMBER_SRC.length, compat: { date: "2026-07-01", flags: [] },
    services: member === "agent-worker" ? [{ binding: "PLANE", service: "bio-plane" }] : [],
    parts: member === "ocr-worker" ? [{ path: "assets/x.wasm", type: badType === member ? "Mystery" : "CompiledWasm",
      sha256: await sha(WASM), bytes: WASM.length }] : [] });
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
    assets[m.asset] = m.member === tamper ? "tampered" : MEMBER_SRC;
    if (m.member === missing) delete assets[m.asset];
    for (const p of m.parts) assets[`${m.member}/${p.path}`] = WASM;
  }
  return { manifest, assets, version, src };
}

/* ---- the world: one install or update, end to end ---- */
export async function run({ slug, mode = "install", ai, cookie: givenCookie, state: givenState,
  accounts = [{ id: "A1", name: "Group Account" }], tokenFail = false, accountsFail = false, settingsFail = false,
  plan = "paid", probeDelete = "ok", r2 = "ok", pre = {}, subdomain = "grp", taken = [], subdomainPut = "ok",
  enableFail = false, refuseSelf = false, refuseAllPlane = false, refuseRePut = false, refuseUpdate = false,
  rel = null, copy = {} } = {}) {
  const realTimeout = globalThis.setTimeout;
  globalThis.setTimeout = (fn) => realTimeout(fn, 0);
  const acct = new Map(Object.entries(pre));
  const buckets = new Set(r2 === "exists" ? ["bio-captures"] : []);
  const refused = [], planePuts = [], enabled = new Set();
  let prefix = subdomain;
  const verOf = (b) => (b || []).find((x) => x.name === "VERSION")?.text || null;
  const membersOf = () => {
    const pb = acct.get(slug) || [];
    return Object.fromEntries(Object.entries(MEMBER_BINDINGS).map(([member, binding]) => {
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
    for (const b of explicit) if (b.type === "service" && b.service !== name && !acct.has(b.service)) {
      refused.push(`${name}:${b.name}->${b.service}`);
      return cferr(`Service binding '${b.name}' references Worker '${b.service}' which was not found`, 400, 10143);
    }
    const kept = (acct.get(name) || []).filter((b) => (meta.keep_bindings || []).includes(b.type)
      && !explicit.some((x) => x.name === b.name));
    acct.set(name, [...explicit, ...kept]);
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
      : jres({ access_token: TOK }) },
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
      if (settingsFail) return cferr("upstream trouble", 500);
      return acct.has(u.split("/workers/scripts/")[1].split("/")[0]) ? cfok({}) : cferr("not found", 404);
    } },
    { m: (u, mth) => /\/workers\/scripts\/[^/]+$/.test(u) && mth === "PUT", f: putScript },
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
  if (!ck) ({ cookie: ck, state: st } = await begin(slug, mode, ai === undefined ? {} : { instanceAi: ai }));
  let out;
  try { out = await callback(`code=GOODCODE&state=${st}`, ck); }
  finally { globalThis.setTimeout = realTimeout; globalThis.fetch = realFetch; }
  return { ...out, calls, acct, buckets, refused, planePuts, enabled, prefix: () => prefix, membersOf };
}

/* The binding a plane PUT carried, by name. */
export const bindingOf = (put, name) => (put?.meta?.bindings || []).find((b) => b.name === name) ?? null;
