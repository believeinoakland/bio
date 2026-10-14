/* journey-check R1 (a): the local arm's world, with no account. The installer Worker (`newgroup/src/index.mjs`) runs under
   Miniflare with every outbound request answered by the fake Cloudflare account (account.mjs). When the installer uploads
   the group's plane, the copy is started under Miniflare from the tranche's own plane (`bio-plane/src/plane/index.mjs`),
   with exactly the bindings the upload gave it (secrets, names, its store, its buckets, SELF), restarted over the same
   kept storage at each upload; the walk, as its deployer, also sets `CIVICSMITH_TEST_INSTANCE` to its `INSTANCE_NAME`
   (installer R49: no installer ever sets it; ai-runs R78). Both are run from their files, never imported. A browser
   reaches all of it through `route`: the installer's address, the consent page, and the copy's address; anything else is
   refused and named. */
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { fakeAccount, AUTHORIZE } from "./account.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const INSTALLER_ENTRY = join(ROOT, "newgroup", "src", "index.mjs");
export const PLANE_ENTRY = join(ROOT, "bio-plane", "src", "plane", "index.mjs");
export const INSTALLER_ORIGIN = "https://newgroup.believeinoakland.workers.dev";

const BASE = { modules: true, modulesRoot: "/", compatibilityDate: "2026-07-01",
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs", "**/*.js"] }, { type: "Text", include: ["**/*.txt"] }] };

/* A request as Miniflare's dispatch takes it (its own fetch types are not the runtime's). */
async function initOf(req) {
  const init = { method: req.method, headers: Object.fromEntries(req.headers), redirect: "manual" };
  if (!["GET", "HEAD"].includes(req.method)) init.body = Buffer.from(await req.arrayBuffer());
  return init;
}

/* The plane's Miniflare options from the bindings a script upload holds. */
export function planeOptions(bindings, { dir, self, outbound }) {
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
  const opts = { ...BASE, scriptPath: PLANE_ENTRY, script: readFileSync(PLANE_ENTRY, "utf8"), compatibilityFlags: ["nodejs_compat"],
    bindings: vars, r2Buckets: buckets, durableObjects: durable, durableObjectsPersist: join(dir, "do"), r2Persist: join(dir, "r2"),
    serviceBindings: bindings.some((b) => b.type === "service" && b.name === "SELF") ? { SELF: self } : {}, outboundService: outbound };
  return { opts, skipped };
}

/* Starts the world; `world.close()` ends it. `unanswered` lists every outbound request nothing in the walk answered. */
export async function localWorld() {
  const dir = mkdtempSync(join(tmpdir(), "journey-check-"));
  const unanswered = [];
  let plane = null, planeReady = null, skipped = [];
  const planeFetch = async (req) => { await planeReady; return plane.dispatchFetch(req.url, await initOf(req)); };
  /* The copy's own outbound requests reach nothing in the local arm. */
  const planeOutbound = async (req) => { unanswered.push(`copy: ${req.method} ${req.url}`); return new Response("no network in the local arm", { status: 599 }); };
  const account = fakeAccount({
    copyFetch: (req) => planeFetch(req),
    onScript: async (name, { bindings }) => {
      if (name === "bio-plan-probe" || !bindings.some((b) => b.name === "STORE")) return;
      const built = planeOptions(bindings, { dir, self: async (r) => plane.dispatchFetch(r.url, await initOf(r)), outbound: planeOutbound });
      skipped = built.skipped;
      if (!plane) { plane = new Miniflare(built.opts); planeReady = plane.ready; }
      else planeReady = plane.setOptions(built.opts);
      await planeReady;
    },
  });
  /* The installer's module exports constants beside its handler; workerd takes every export as an entry point, so it
     is run through an entry, held in memory beside it, that exports its handler alone. */
  const installer = new Miniflare({ ...BASE, scriptPath: join(dirname(INSTALLER_ENTRY), "journey-entry.mjs"),
    script: `import worker from ${JSON.stringify(INSTALLER_ENTRY)};\nexport default worker;\n`,
    outboundService: async (req) => account.handle(req) });
  await installer.ready;

  /* What a request to `url` reaches: the installer, the consent page, the copy, or nothing. */
  async function answer(url, init) {
    const u = new URL(url);
    if (u.origin === INSTALLER_ORIGIN) return installer.dispatchFetch(url, { ...init, redirect: "manual" });
    if (url.startsWith(AUTHORIZE)) return account.handle(new Request(url, init));
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
    async close() {
      await installer.dispose().catch(() => {});
      if (plane) await plane.dispose().catch(() => {});
      rmSync(dir, { recursive: true, force: true });
    },
  };
}
