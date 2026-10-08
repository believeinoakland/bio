/* plane: the Worker's entry (R6), driven in the runtime the product deploys to (Miniflare, workerd), the deployment
   config that names it (R7), and the legacy files it replaced, gone (R8). */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { Store as PlaneStore } from "./fixture.mjs";
import { Miniflare } from "miniflare";

const PLANE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SRC = join(PLANE, "src");
const ENTRY = join(SRC, "plane", "index.mjs");
const entry = await import(ENTRY);   /* after the fixture, which answers `cloudflare:workers` */
const { PLANE_LIMITS } = await import(join(SRC, "control-plane", "index.mjs"));

let MF;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-plane", MEMBER_TOKEN: "mem-plane", PROBE_TOKEN: "prb-plane", DAEMON_TOKEN: "dmn-plane",
              VERSION: "9.9.9", INSTANCE_NAME: "plane-test" },
  serviceBindings: { SELF: async (request) => MF.dispatchFetch(request) },
});
MF = mf;
after(() => mf.dispose());
/* admission R20 (F1; K2166): a credential travels in the `Authorization` header, never in the address. */
const get = async (q, token = null) => {
  const r = await mf.dispatchFetch(`http://x/api/?${q}`, token ? { headers: { authorization: `Bearer ${token}` } } : {});
  return { status: r.status, body: await r.json() };
};

test("R6: the Worker's module exports `default { fetch }` and `Store`, and nothing else", () => {
  assert.deepEqual(Object.keys(entry).sort(), ["Store", "default"]);
  assert.equal(entry.Store, PlaneStore, "the class is R1's");
  assert.deepEqual(Object.keys(entry.default), ["fetch"]);
  assert.equal(typeof entry.default.fetch, "function");
  assert.equal(entry.default.fetch.limits, PLANE_LIMITS, "the fetch is control-plane's door (`makeFetch`)");
});

test("R6: in the runtime, the door answers through the hooks: the version, the setup page, a public read bound to the plane, the bootstrap report and an admitted op's handler", async () => {
  const v = await mf.dispatchFetch("http://x/version");
  assert.equal(await v.text(), "9.9.9\n");
  const page = await mf.dispatchFetch("http://x/");
  assert.equal(page.status, 200);
  assert.match(page.headers.get("content-type") || "", /text\/html/);
  await page.arrayBuffer();
  /* public-read's door, over the plane binding R6 hands it: a published case no one published is its own refusal. */
  const published = await get("op=publishedcase&id=CASE-2026-0001-none");
  assert.equal(published.status, 404, JSON.stringify(published.body));
  assert.equal(published.body.code, "NOT_PUBLISHED");
  const boot = await get("op=bootstrap");   /* the public hook's last arm: instance-setup's bootstrap report */
  assert.equal(boot.status, 200);
  assert.equal(boot.body.ok, true);
  assert.equal(boot.body.version ?? boot.body.result?.version, "9.9.9");
  const aff = await get("op=affordances", "adm-plane");   /* the gated hook: affordances' handler */
  assert.equal(aff.status, 200, JSON.stringify(aff.body));
  assert.ok(Array.isArray(aff.body.result.catalog));
  const q = await get("op=queue", "adm-plane");   /* queue's door */
  assert.equal(q.status, 200, JSON.stringify(q.body));
  const stats = await get("op=stats", "adm-plane");   /* the generic forward to the store's frame (R1, R5) */
  assert.equal(stats.status, 200);
  assert.equal(typeof stats.body.result.bundles, "number");
  /* negative control (admission R20, C-38.10; K2166): the same credential in the address admits nothing; the door refuses
     it by name, 400 `CREDENTIAL_IN_ADDRESS`, before any store is asked, and its answer never carries the credential. */
  const inAddress = await get("op=stats&token=adm-plane");
  assert.equal(inAddress.status, 400, JSON.stringify(inAddress.body));
  assert.equal(inAddress.body.ok, false);
  assert.equal(inAddress.body.code, "CREDENTIAL_IN_ADDRESS");
  assert.equal(inAddress.body.reason, "CREDENTIAL_IN_ADDRESS");
  assert.equal(inAddress.body.check, "C-38.10");
  assert.equal(inAddress.body.result, undefined, "no stats answered");
  assert.equal(JSON.stringify(inAddress.body).includes("adm-plane"), false, "the credential is in no answer");
  /* and beside a valid header it is still refused: the address is never read as a credential */
  const both = await mf.dispatchFetch("http://x/api/?op=stats&token=adm-plane", { headers: { authorization: "Bearer adm-plane" } });
  const bothBody = await both.json();
  assert.deepEqual([both.status, bothBody.code, bothBody.check], [400, "CREDENTIAL_IN_ADDRESS", "C-38.10"]);
});

test("R7, R21, R27 (N625, K1683; rev. 2 §4): `wrangler.jsonc`'s `main` names the Worker's entry, its bindings as the deployment has them, `SHEET_WORKER` and `FILE_SCANNER` (the fleet member `file-scanner`) among its services", () => {
  const cfg = jsonc(readFileSync(join(PLANE, "wrangler.jsonc"), "utf8"));
  assert.equal(cfg.main, "src/plane/index.mjs");
  assert.ok(existsSync(join(PLANE, cfg.main)));
  assert.deepEqual(cfg.durable_objects, { bindings: [{ name: "STORE", class_name: "Store" }] });
  assert.equal(typeof entry[cfg.durable_objects.bindings[0].class_name], "function", "the class the binding names is exported");
  assert.deepEqual(cfg.migrations, [{ tag: "v1", new_sqlite_classes: ["Store"] }]);
  assert.deepEqual(cfg.r2_buckets, [{ binding: "CAPTURES", bucket_name: "bio-captures" }, { binding: "PUBLISHED", bucket_name: "bio-published" }]);
  assert.deepEqual(cfg.services, [{ binding: "PDF_WORKER", service: "pdf-worker" }, { binding: "AGENT_WORKER", service: "agent-worker" },
                                  { binding: "OCR_WORKER", service: "ocr-worker" }, { binding: "SHEET_WORKER", service: "sheet-worker" },
                                  { binding: "FILE_SCANNER", service: "file-scanner" }, { binding: "SELF", service: "bio-plane" }]);
  assert.deepEqual(cfg.browser, { binding: "BROWSER" });
  assert.equal(cfg.account_id, "20b533579290b9b93168345edd3b7f72");
  assert.deepEqual(cfg.compatibility_flags, ["nodejs_compat"]);
});

test("R7: `package.json`'s `test` runs the module tests and `test:system` the old system suites; no other `test:*` entry", () => {
  const pkg = JSON.parse(readFileSync(join(PLANE, "package.json"), "utf8"));
  assert.equal(pkg.scripts.test, 'node --test "test/m/**/*.test.mjs"');
  assert.equal(pkg.scripts["test:system"], 'node --test "test/system/**/*.test.mjs"');
  assert.deepEqual(Object.keys(pkg.scripts).filter((k) => k.startsWith("test")), ["test", "test:system"]);
  for (const k of ["build", "deploy", "dev", "embed:sign"]) assert.equal(typeof pkg.scripts[k], "string", `${k} kept`);
});

test("R8: `store.mjs`, `schema.mjs` and `src/index.mjs` do not exist (bundler's `planeMember` re-pointed, K846; N463), and no file imports the three", async () => {
  for (const f of ["store.mjs", "schema.mjs", "index.mjs"]) assert.equal(existsSync(join(SRC, f)), false, `src/${f}`);
  /* No module, no test (the module tests and the old suites kept for the release, K619) and no script imports them. */
  const offenders = [];
  for (const root of [SRC, join(PLANE, "test"), join(PLANE, "scripts")])
    for (const f of files(root)) offenders.push(...legacyImports(f, readFileSync(f, "utf8")));
  assert.deepEqual(offenders, []);
  /* Negative control: the scan names each of the three when a file imports it, statically or dynamically. */
  const probe = join(PLANE, "test", "probe.mjs");
  assert.deepEqual(legacyImports(probe, `import { Store } from "../src/store.mjs";\nconst s = await import("../src/schema.mjs");\nexport { default } from '../src/index.mjs';`),
    ["test/probe.mjs → src/store.mjs", "test/probe.mjs → src/schema.mjs", "test/probe.mjs → src/index.mjs"]);
});

/* The relative imports in `text` (file `f`) of the three legacy files, the plane's own, relative to `bio-plane/`. */
function legacyImports(f, text) {
  const out = [];
  for (const m of text.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*)["']([^"']+\.mjs)["']/g)) {
    if (!m[1].startsWith(".")) continue;
    const target = relative(PLANE, join(dirname(f), m[1]));
    if (/^src\/(?:store|schema|index)\.mjs$/.test(target)) out.push(`${relative(PLANE, f)} → ${target}`);
  }
  return out;
}

function files(dir) {
  const out = [];
  for (const n of readdirSync(dir)) {
    if (n === "node_modules") continue;
    const p = join(dir, n);
    if (statSync(p).isDirectory()) out.push(...files(p));
    else if (/\.m?js$/.test(n)) out.push(p);
  }
  return out;
}

/* JSON with `//` comments, outside strings. */
function jsonc(text) {
  let out = "", inStr = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inStr) { out += c; if (c === "\\") out += text[++i]; else if (c === '"') inStr = false; continue; }
    if (c === '"') { inStr = true; out += c; continue; }
    if (c === "/" && text[i + 1] === "/") { while (i < text.length && text[i] !== "\n") i++; out += "\n"; continue; }
    out += c;
  }
  return JSON.parse(out);
}
