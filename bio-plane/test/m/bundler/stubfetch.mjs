/* Preloaded (`node --import`) into a bundler command under test: a stand-in for the Cloudflare API and a
 * workers.dev host, so no test reaches a real account. The scenario is the JSON file `$BUNDLER_STUB`;
 * every request is appended to `$BUNDLER_STUB_LOG` as one JSON line (the bearer token is recorded only
 * as present or absent). Timers are cut to a millisecond so the commands' retry and rollout waits run fast.
 *
 * Scenario: { subdomain, scripts: { <name>: { body?, settings?, settingsStatus?, scriptStatus? } },
 *             put: "accept" | "ignore", settingsAfterPut?: object, serving: { <name>: string },
 *             servingAfterPut?: "version" | "never", unreachable?: [<substring>], containers?: <status> }
 * A script with no entry does not exist (404). A PUT the scenario accepts stores the uploaded module as
 * the script's body, the metadata's limits as its settings (unless `settingsAfterPut` says otherwise),
 * and, unless `servingAfterPut` is "never", the metadata's VERSION as what the instance serves. The account's
 * Containers applications (R26) answer `containers` (403 when the scenario names none: a token without the scope). */
import { readFileSync, appendFileSync } from "node:fs";

const file = process.env.BUNDLER_STUB;
const logFile = process.env.BUNDLER_STUB_LOG;
const S = file ? JSON.parse(readFileSync(file, "utf8")) : {};
S.scripts ||= {};
S.serving ||= {};
const log = (entry) => { if (logFile) appendFileSync(logFile, JSON.stringify(entry) + "\n"); };
const json = (status, obj) => new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });

const realSetTimeout = globalThis.setTimeout;
globalThis.setTimeout = (fn, _ms, ...args) => realSetTimeout(fn, 1, ...args);

globalThis.fetch = async (input, init = {}) => {
  const url = String(input instanceof Request ? input.url : input);
  const method = (init.method || "GET").toUpperCase();
  const auth = init.headers && (init.headers.authorization || init.headers.Authorization);
  const entry = { method, url, bearer: typeof auth === "string" && auth.startsWith("Bearer ") };
  if ((S.unreachable || []).some((s) => url.includes(s))) { log({ ...entry, threw: true }); throw new TypeError("fetch failed"); }

  const host = new URL(url).host;
  if (host.endsWith(".workers.dev")) {
    const name = host.split(".")[0];
    log(entry);
    const v = S.serving[name];
    return v === undefined ? new Response("no such worker", { status: 404 }) : new Response(v, { status: 200 });
  }
  if (host !== "api.cloudflare.com") { log({ ...entry, foreign: true }); throw new TypeError(`stubfetch: no route to ${url}`); }

  const path = new URL(url).pathname;
  let m;
  if (/\/workers\/subdomain$/.test(path)) {
    log(entry);
    return S.subdomain ? json(200, { success: true, result: { subdomain: S.subdomain } }) : json(500, { success: false });
  }
  if (/\/containers\/applications$/.test(path)) {
    log(entry);
    const st = S.containers ?? 403;
    return st === 200 ? json(200, { success: true, result: [] }) : json(st, { success: false, errors: [{ code: 10000, message: "Authentication error" }] });
  }
  if ((m = path.match(/\/workers\/scripts\/([^/]+)\/settings$/))) {
    log(entry);
    const s = S.scripts[m[1]];
    if (s && s.settingsStatus) return json(s.settingsStatus, { success: false });
    if (!s) return json(404, { success: false });
    return json(200, { success: true, result: s.settings ?? {} });
  }
  if ((m = path.match(/\/workers\/scripts\/([^/]+)$/))) {
    const name = m[1];
    if (method === "PUT") {
      const fd = init.body;
      const metadata = JSON.parse(await fd.get("metadata").text());
      const module = await fd.get("index.mjs").text();
      log({ ...entry, metadata, moduleBytes: Buffer.byteLength(module) });
      if (S.put === "accept") {
        const s = (S.scripts[name] ||= {});
        s.body = module;
        s.settings = S.settingsAfterPut ?? { limits: metadata.limits };
        const v = metadata.bindings.find((b) => b.name === "VERSION");
        if (S.servingAfterPut !== "never" && v) S.serving[name] = v.text;
      }
      return json(200, { success: true });
    }
    log(entry);
    const s = S.scripts[name];
    if (s && s.scriptStatus) return new Response("<html>gateway</html>", { status: s.scriptStatus, headers: { "content-type": "text/html" } });
    if (!s || s.body == null) return json(404, { success: false });
    return new Response(s.body, { status: 200, headers: { "content-type": "application/javascript+module" } });
  }
  log({ ...entry, unrouted: true });
  return json(404, { success: false });
};
