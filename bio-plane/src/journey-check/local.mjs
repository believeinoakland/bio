/* journey-check R1 (a), R11: the local arm's world, with no account. civicsmith.org (`site`) and the installer Worker (`newgroup/src/index.mjs`) runs
   under Miniflare with every outbound request answered by the fake Cloudflare account (account.mjs). When the installer
   uploads the group's plane, the copy is started under Miniflare from the tranche's own plane
   (`bio-plane/src/plane/index.mjs`), with exactly the bindings the upload gave it (secrets, names, its store, its
   buckets, SELF), restarted over the same kept storage at each upload. The walk, as its deployer, also binds what a
   deployer binds and the built-in release does not install (R11; installer R49):
   - `CIVICSMITH_TEST_INSTANCE`, set to its `INSTANCE_NAME` (ai-runs R78);
   - `AGENT_WORKER`, agent-worker run from `agent-worker/src/index.mjs` beside it, its `PLANE` the copy, its `SEGMENTS`
     Durable Object (`SegmentDriver`, R15: as the installed worker has it, installer R59, so a run's segment outlives the
     request that started it) and its `RUNNER` the stand-in for agent-runner (runner.mjs, with the fake model,
     fake-model.mjs; K3351): the plane's sign-in reaches the runner through it (agent-worker R66), and every model turn of
     a run, an ask or a draft (agent-worker R35). R19 (replacing `RUNNER` by `REMOTE`) waits on the remote proof;
   - a stub city site (city.mjs) answering the copy's own outbound requests to its address, for captures by address;
   - the stand-in for Anthropic's sign-in page (runner.mjs `signinPage`) the connect screen opens, showing a code.
   Each is run from its file, never imported. A browser reaches all of it through `route`: the installer's address, the
   consent page, and the copy's address; anything else is refused and named. */
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { fakeAccount, AUTHORIZE } from "./account.mjs";
import { CITY_ORIGIN, cityAnswer } from "./city.mjs";
import { SIGNIN_PAGE, signinPage } from "./signin.mjs";
import { localize } from "../setup-words/index.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const INSTALLER_ENTRY = join(ROOT, "newgroup", "src", "index.mjs");
export const PLANE_ENTRY = join(ROOT, "bio-plane", "src", "plane", "index.mjs");
export const AGENT_WORKER_ENTRY = join(ROOT, "agent-worker", "src", "index.mjs");
export const RUNNER_ENTRY = join(dirname(fileURLToPath(import.meta.url)), "runner.mjs");
/* The names the copy's own workers run under (a service binding names a worker) */
export const AGENT_WORKER = "agent-worker";
export const AGENT_RUNNER = "agent-runner";
export const INSTALLER_ORIGIN = "https://newgroup.believeinoakland.workers.dev";
/* civicsmith.org (`site`, N1011): run from its own file, its "Create your group" pointing at the installer, as its
   deployer sets `INSTALLER_ADDRESS` (site R4). */
export const SITE_ENTRY = join(ROOT, "site", "src", "index.mjs");
export const SITE_ORIGIN = "https://civicsmith.org";

const BASE = { modules: true, modulesRoot: "/", compatibilityDate: "2026-07-01",
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs", "**/*.js"] }, { type: "Text", include: ["**/*.txt"] }] };

/* A request as Miniflare's dispatch takes it (its own fetch types are not the runtime's). */
async function initOf(req) {
  const init = { method: req.method, headers: Object.fromEntries(req.headers), redirect: "manual" };
  if (!["GET", "HEAD"].includes(req.method)) init.body = Buffer.from(await req.arrayBuffer());
  return init;
}

/* R1 (a): the capability members the install uploads, and the plane's binding to each. They are stood in for by a worker
   that answers `GET /version` as every member does (`setup.mjs`: its own `name` and `version`) and nothing else: the members
   that need a container or a wasm module the upload does not carry cannot run here, and their work is not walked in the
   local arm (the live arm and BOB's release walk reach them). */
export const MEMBERS = Object.freeze({ PDF_WORKER: "pdf-worker", OCR_WORKER: "ocr-worker", SHEET_WORKER: "sheet-worker", FILE_SCANNER: "file-scanner" });
const memberStub = (member, version) => `export default { fetch(req) { return new URL(req.url).pathname === "/version"
  ? new Response(JSON.stringify({ ok: true, name: ${JSON.stringify(member)}, version: ${JSON.stringify(version)} }), { headers: { "content-type": "application/json" } })
  : new Response("not found", { status: 404 }); } };`;

/* The copy's Miniflare options from the bindings a script upload holds: the plane under its own name, with agent-worker
   and the runner beside it (R11). `model: false` binds the runner with no fake model (R11's control); `segments: false`
   leaves agent-worker without its `SEGMENTS` binding (R15's control). */
export function planeOptions(bindings, { dir, name, outbound, model = true, segments = true }) {
  const vars = {}, buckets = [], durable = {};
  const skipped = [], stubs = [];
  for (const b of bindings) {
    if (b.type === "plain_text" || b.type === "secret_text") vars[b.name] = b.text;
    else if (b.type === "r2_bucket") buckets.push(b.name);
    else if (b.type === "durable_object_namespace") durable[b.name] = { className: b.class_name, useSQLite: true };
    else if (b.type === "service" && b.name === "SELF") ;
    else if (b.type === "service" && MEMBERS[b.name]) stubs.push({ binding: b.name, service: b.service, member: MEMBERS[b.name] });
    else skipped.push(`${b.type}:${b.name}`);
  }
  if (vars.INSTANCE_NAME) vars.CIVICSMITH_TEST_INSTANCE = vars.INSTANCE_NAME;
  const plane = { name, scriptPath: PLANE_ENTRY, script: readFileSync(PLANE_ENTRY, "utf8"), compatibilityFlags: ["nodejs_compat"],
    compatibilityDate: BASE.compatibilityDate, modules: true, modulesRoot: "/", modulesRules: BASE.modulesRules, bindings: vars, r2Buckets: buckets, durableObjects: durable,
    serviceBindings: { ...(bindings.some((b) => b.type === "service" && b.name === "SELF") ? { SELF: name } : {}), AGENT_WORKER,
      ...Object.fromEntries(stubs.map((x) => [x.binding, x.service])) },
    outboundService: outbound };
  const agent = { name: AGENT_WORKER, scriptPath: AGENT_WORKER_ENTRY, script: readFileSync(AGENT_WORKER_ENTRY, "utf8"),
    compatibilityFlags: ["nodejs_compat"], compatibilityDate: BASE.compatibilityDate, modules: true, modulesRoot: "/", modulesRules: BASE.modulesRules,
    bindings: { VERSION: vars.VERSION || "0.0.0" }, serviceBindings: { PLANE: name },
    durableObjects: { RUNNER: { className: "AgentRunner", scriptName: AGENT_RUNNER },
      /* the remote side of agent-runner, answering its version as the installer's verification asks (R1 (a)); R19 */
      REMOTE: { className: "RemoteSession", scriptName: AGENT_RUNNER },
      /* R15: its own class, with the migration that makes it a SQLite one (wrangler's `v1`) */
      ...(segments ? { SEGMENTS: { className: "SegmentDriver", useSQLite: true } } : {}) }, outboundService: outbound };
  const runner = { name: AGENT_RUNNER, scriptPath: RUNNER_ENTRY, script: readFileSync(RUNNER_ENTRY, "utf8"),
    compatibilityDate: BASE.compatibilityDate, modules: true, modulesRoot: "/", modulesRules: BASE.modulesRules, bindings: { FAKE_MODEL: model ? "on" : "off", VERSION: vars.VERSION || "0.0.0",
      ...(process.env.JOURNEY_DEBUG ? { JOURNEY_DEBUG: process.env.JOURNEY_DEBUG } : {}) },
    durableObjects: { AGENT_RUNNER_SELF: { className: "AgentRunner" }, REMOTE_SELF: { className: "RemoteSession" } } };
  const members = stubs.map((x) => ({ name: x.service, script: memberStub(x.member, vars.VERSION || "0.0.0"), modules: true,
    compatibilityDate: BASE.compatibilityDate }));
  const opts = { workers: [plane, agent, runner, ...members],
    durableObjectsPersist: join(dir, "do"), r2Persist: join(dir, "r2") };
  return { opts, skipped };
}

/* The public services a capture asks to co-attest it (timestamp authorities, the web archive's save), which the local arm
   does not stand in for: answered 503, as a service that cannot be reached is, so the capture records each attempt as
   failed; the live arm reaches them. The journey's capture step expects exactly those attempts failed (R9 step 5). */
export const OUTSIDE = Object.freeze(["http://timestamp.digicert.com/", "http://timestamp.sectigo.com/", "http://rfc3161.ai.moda/",
  "https://web.archive.org/save/"]);

/* Starts the world; `world.close()` ends it: both Miniflare instances and their storage. `unanswered` lists every
   outbound request nothing in the walk answered. */
export async function localWorld({ model = true, segments = true } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "journey-check-"));
  const unanswered = [];
  let plane = null, planeReady = null, skipped = [], agentBound = {};
  const planeFetch = async (req) => { await planeReady; return plane.dispatchFetch(req.url, await initOf(req)); };
  /* The copy's own outbound requests reach the stub city site and nothing else in the local arm. */
  const planeOutbound = async (req) => {
    if (new URL(req.url).origin === CITY_ORIGIN) return cityAnswer(req);
    if (OUTSIDE.some((o) => req.url.startsWith(o))) return new Response("not reachable from the local arm", { status: 503 });
    unanswered.push(`copy: ${req.method} ${req.url}`);
    return new Response("no network in the local arm", { status: 599 });
  };
  const account = fakeAccount({
    copyFetch: (req) => planeFetch(req),
    onScript: async (name, { bindings }) => {
      if (name === "bio-plan-probe" || !bindings.some((b) => b.name === "STORE")) return;
      const built = planeOptions(bindings, { dir, name, outbound: planeOutbound, model, segments });
      skipped = built.skipped;
      agentBound = built.opts.workers.find((w) => w.name === AGENT_WORKER).durableObjects;
      if (!plane) { plane = new Miniflare(built.opts); planeReady = plane.ready; }
      else planeReady = plane.setOptions(built.opts);
      await planeReady;
    },
  });
  /* The installer's module exports constants beside its handler; workerd takes every export as an entry point, so it
     is run through an entry, held in memory beside it, that exports its handler alone. */
  let installer = null, site = null;
  const close = async () => {
    if (site) await site.dispose().catch(() => {});
    if (installer) await installer.dispose().catch(() => {});
    if (plane) await plane.dispose().catch(() => {});
    rmSync(dir, { recursive: true, force: true });
  };
  /* A world that cannot start closes what it started before it says so. */
  try {
    installer = new Miniflare({ ...BASE, scriptPath: join(dirname(INSTALLER_ENTRY), "journey-entry.mjs"),
      script: localize("journey-check.local.import_worker_from_stringify_export", "import worker from {stringify};\nexport default worker;\n", { stringify: String(JSON.stringify(INSTALLER_ENTRY)) }),
      outboundService: async (req) => account.handle(req) });
    await installer.ready;
    /* site's module exports its helpers beside its handler, so it too is run through an entry exporting the handler */
    site = new Miniflare({ ...BASE, scriptPath: join(dirname(SITE_ENTRY), "journey-entry.mjs"),
      script: localize("journey-check.local.import_site_from_stringify_export", "import site from {stringify};\nexport default site;\n", { stringify: String(JSON.stringify(SITE_ENTRY)) }),
      bindings: { INSTALLER_ADDRESS: INSTALLER_ORIGIN + "/" } });
    await site.ready;
  } catch (e) { await close(); throw e; }

  /* What a request to `url` reaches: the installer, the consent page, the copy, or nothing. */
  async function answer(url, init) {
    const u = new URL(url);
    if (u.origin === INSTALLER_ORIGIN) return installer.dispatchFetch(url, { ...init, redirect: "manual" });
    if (u.origin === SITE_ORIGIN) return site.dispatchFetch(url, { ...init, redirect: "manual" });
    if (url.startsWith(AUTHORIZE)) return account.handle(new Request(url, init));
    if (url.startsWith(SIGNIN_PAGE)) return signinPage();
    const copy = copyBase();
    if (copy && u.origin === copy) return planeFetch(new Request(url, init));
    return null;
  }
  const copyBase = () => {
    for (const [name, s] of account.scripts) if (s.bindings.some((b) => b.name === "STORE")) return account.addressOf(name);
    return null;
  };

  /* Routes every request of a browser context through `answer`; `onForeign(url)` hears each one refused. */
  async function route(context, onForeign) {
    await context.route("**/*", async (r) => {
      const req = r.request();
      /* no compression is asked: workerd compresses when asked and hands the bytes back as they are, which the browser and the walker cannot read */
      const { "accept-encoding": _ignored, ...asked } = req.headers();
      const init = { method: req.method(), headers: asked };
      const body = req.postDataBuffer();
      if (body && !["GET", "HEAD"].includes(req.method())) init.body = body;
      let res;
      try { res = await answer(req.url(), init); } catch (e) { res = new Response(String(e && e.message), { status: 502 }); }
      if (!res) { onForeign(req.url()); return r.abort("blockedbyclient"); }
      const headers = {};
      res.headers.forEach((v, k) => { if (k !== "set-cookie" && k !== "content-encoding") headers[k] = v; });
      const cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
      if (cookies.length) headers["set-cookie"] = cookies.join("\n");
      await r.fulfill({ status: res.status, headers, body: Buffer.from(await res.arrayBuffer()) });
    });
  }

  return {
    account, installer, route, copyBase, unanswered, skipped: () => skipped,
    /* R15: the Durable Object bindings agent-worker runs with here, by name */
    agentBindings: () => Object.keys(agentBound),
    fetchCopy: (req) => planeFetch(req),
    unansweredAll: () => [...account.unanswered.map((x) => `installer: ${x}`), ...unanswered],
    close,
  };
}
