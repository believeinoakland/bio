/* journey-check R1 (a), R11: the local arm's world, with no account. civicsmith.org (`site`) and the installer Worker (`newgroup/src/index.mjs`) runs
   under Miniflare with every outbound request answered by the fake Cloudflare account (account.mjs). When the installer
   uploads the group's plane, the copy is started under Miniflare from the tranche's own plane
   (`bio-plane/src/plane/index.mjs`), with exactly the bindings the upload gave it (secrets, names, its store, its
   buckets, SELF), restarted over the same kept storage at each upload. The walk, as its deployer, also binds what a
   deployer binds and the built-in release does not install (R11; installer R49):
   - `CIVICSMITH_TEST_INSTANCE`, set to its `INSTANCE_NAME` (ai-runs R78);
   - `AGENT_WORKER`, agent-worker run from `agent-worker/src/index.mjs` beside it, its `PLANE` the copy and its `RUNNER`
     the stand-in for agent-runner (runner.mjs, with the fake model, fake-model.mjs; K3351): the plane's sign-in reaches
     the runner through it (agent-worker R66), and every model turn of a run, an ask or a draft (agent-worker R35);
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

/* The copy's Miniflare options from the bindings a script upload holds: the plane under its own name, with agent-worker
   and the runner beside it (R11). `model: false` binds the runner with no fake model (R11's control). */
export function planeOptions(bindings, { dir, name, outbound, model = true }) {
  const vars = {}, buckets = [], durable = {};
  const skipped = [];
  for (const b of bindings) {
    if (b.type === "plain_text" || b.type === "secret_text") vars[b.name] = b.text;
    else if (b.type === "r2_bucket") buckets.push(b.name);
    else if (b.type === "durable_object_namespace") durable[b.name] = { className: b.class_name, useSQLite: true };
    else if (b.type === "service" && b.name === "SELF") ;
    else skipped.push(`${b.type}:${b.name}`);
  }
  if (vars.INSTANCE_NAME) vars.CIVICSMITH_TEST_INSTANCE = vars.INSTANCE_NAME;
  const plane = { name, scriptPath: PLANE_ENTRY, script: readFileSync(PLANE_ENTRY, "utf8"), compatibilityFlags: ["nodejs_compat"],
    compatibilityDate: BASE.compatibilityDate, modules: true, modulesRoot: "/", modulesRules: BASE.modulesRules, bindings: vars, r2Buckets: buckets, durableObjects: durable,
    serviceBindings: { ...(bindings.some((b) => b.type === "service" && b.name === "SELF") ? { SELF: name } : {}), AGENT_WORKER },
    outboundService: outbound };
  const agent = { name: AGENT_WORKER, scriptPath: AGENT_WORKER_ENTRY, script: readFileSync(AGENT_WORKER_ENTRY, "utf8"),
    compatibilityFlags: ["nodejs_compat"], compatibilityDate: BASE.compatibilityDate, modules: true, modulesRoot: "/", modulesRules: BASE.modulesRules,
    bindings: { VERSION: vars.VERSION || "0.0.0" }, serviceBindings: { PLANE: name },
    durableObjects: { RUNNER: { className: "AgentRunner", scriptName: AGENT_RUNNER } }, outboundService: outbound };
  const runner = { name: AGENT_RUNNER, scriptPath: RUNNER_ENTRY, script: readFileSync(RUNNER_ENTRY, "utf8"),
    compatibilityDate: BASE.compatibilityDate, modules: true, modulesRoot: "/", modulesRules: BASE.modulesRules, bindings: { FAKE_MODEL: model ? "on" : "off", VERSION: vars.VERSION || "0.0.0" },
    durableObjects: { AGENT_RUNNER_SELF: { className: "AgentRunner" } } };
  const opts = { workers: [plane, agent, runner],
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
export async function localWorld({ model = true } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "journey-check-"));
  const unanswered = [];
  let plane = null, planeReady = null, skipped = [];
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
      const built = planeOptions(bindings, { dir, name, outbound: planeOutbound, model });
      skipped = built.skipped;
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
      script: `import worker from ${JSON.stringify(INSTALLER_ENTRY)};\nexport default worker;\n`,
      outboundService: async (req) => account.handle(req) });
    await installer.ready;
    /* site's module exports its helpers beside its handler, so it too is run through an entry exporting the handler */
    site = new Miniflare({ ...BASE, scriptPath: join(dirname(SITE_ENTRY), "journey-entry.mjs"),
      script: `import site from ${JSON.stringify(SITE_ENTRY)};\nexport default site;\n`,
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
      const init = { method: req.method(), headers: req.headers() };
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
    fetchCopy: (req) => planeFetch(req),
    unansweredAll: () => [...account.unanswered.map((x) => `installer: ${x}`), ...unanswered],
    close,
  };
}
