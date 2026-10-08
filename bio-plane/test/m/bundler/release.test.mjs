/* bundler's release tooling (T19 BOB-5): requirement-named tests at the module's interface,
 * build/requirements/bundler.md R11–R23. R11–R15 are called as functions; R16–R23 are run as the
 * commands an operator runs, against a throwaway fixture repository (`repo.mjs`), with `fetch` stubbed
 * (`stubfetch.mjs`), a fake `wrangler`, and a throwaway release key checked by stock `ssh-keygen`.
 * Nothing here reaches a real account or writes the real repository. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, rmSync, existsSync, mkdtempSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { stripJsonc, parseJsonc } from "../../../scripts/jsonc.mjs";
import { versionSites, resolveVersion } from "../../../scripts/resolve-version.mjs";
import { deriveBindings, serviceTargets, deriveLimits, limitsReadBack } from "../../../scripts/derive-bindings.mjs";
import { planeMember, discoverMembers, buildMember, manifestFrom, verifyStatic } from "../../../scripts/fleet-bundle.mjs";
import { fleetStatement, NS_FLEET, NS_RELEASE, verifySshsig } from "../../../src/sshsig.mjs";
import { signSshsig, signerPublicLine } from "../../../scripts/sign-sshsig.mjs";
import { renderSignpage } from "../../../scripts/embed-signpage.mjs";
import {
  makeRepo, addMember, addContainerMember, addScannerMember, buildAll, run, snapshot, readJson, writeJson, rm, hex, planeConfig,
  VERSION, ACCOUNT, PLANE, DIGEST, CONTAINER_PACKAGES, SCANNER_PACKAGES, DIGEST_A, DIGEST_B, scannerClasses,
} from "./repo.mjs";

const refused = (r, code) => {
  assert.notEqual(r.status, 0, `${code}: exits non-zero\n${r.stdout}\n${r.stderr}`);
  assert.ok(r.stderr.includes(`REFUSED [${code}]`), `${code} on stderr:\n${r.stderr}\n${r.stdout}`);
};
const tryThrow = (fn) => { try { fn(); } catch (e) { return e; } assert.fail("did not throw"); };

/* ------------------------------------------------------------------------ R11 */

test("R11: stripJsonc removes line and block comments, keeps each line comment's newline, and leaves every quoted string whole", () => {
  const src = [
    '{ "$schema": "https://example.test/schema.json", // a comment with "quotes" and \'ticks\'',
    '  /* a block',
    '     over lines with // inside */ "a": "x // not a comment", "b": \'y /* not a block */\',',
    '  "c": "esc \\" // still a string", "d": "back\\\\", // the string closed at the escaped backslash',
    '  "e": 1 /* inline */ }',
  ].join("\n");
  const out = stripJsonc(src);
  assert.equal(out.split("\n").length, src.split("\n").length - 1 /* the block's newline goes with it */);
  assert.ok(out.includes('"https://example.test/schema.json"'));
  assert.ok(out.includes('"x // not a comment"') && out.includes("'y /* not a block */'"));
  assert.ok(out.includes('"esc \\" // still a string"') && out.includes('"back\\\\"'));
  assert.doesNotMatch(out, /a comment with|\/\* a block|over lines|inline|closed at/);
  assert.equal(stripJsonc('"a" // c\n"b"'), '"a" \n"b"', "the line comment's newline is kept");
  assert.equal(stripJsonc("no comments at all"), "no comments at all");
});

test("R11: parseJsonc returns the parsed object, or throws naming what did not parse; one implementation serves every caller", () => {
  assert.deepEqual(parseJsonc('// x\n{ "u": "https://a.test//b", /* y */ "n": [1, 2] }\n'), { u: "https://a.test//b", n: [1, 2] });
  const e = tryThrow(() => parseJsonc("{ broken", "agent-worker/wrangler.jsonc"));
  assert.ok(e instanceof Error);
  assert.match(e.message, /^agent-worker\/wrangler\.jsonc did not parse as JSONC: /);
  assert.match(tryThrow(() => parseJsonc("[")).message, /^config did not parse as JSONC: /);
  /* One implementation: no second copy anywhere in the module's paths, and every reader imports this one. */
  assert.equal(existsSync(join(PLANE, "..", "tools", "jsonc.mjs")), false, "tools/jsonc.mjs is gone");
  for (const f of ["deploy.mjs", "resolve-version.mjs", "deploy-fleet.mjs", "release-assemble.mjs"]) {
    const text = readFileSync(join(PLANE, "scripts", f), "utf8");
    assert.match(text, /from "\.\/jsonc\.mjs"/, `${f} reads JSONC through ./jsonc.mjs`);
    assert.doesNotMatch(text, /function stripJsonc|function parseJsonc/, `${f} has no copy`);
  }
});

/* ------------------------------------------------------------------------ R12 */

test("R12: the version sites are the plane's then each member's package.json version and wrangler vars.VERSION, where present; agreement resolves", async () => {
  const root = await makeRepo({ build: false });
  try {
    addMember(root, "gamma-worker");
    rmSync(join(root, "gamma-worker/package.json"));                 /* a member without one: not a site */
    const sites = versionSites(root).map((s) => [s.file, s.key, s.version]);
    assert.deepEqual(sites, [
      ["bio-plane/package.json", "version", VERSION], ["bio-plane/wrangler.jsonc", "vars.VERSION", VERSION],
      ["alpha-worker/package.json", "version", VERSION], ["alpha-worker/wrangler.jsonc", "vars.VERSION", VERSION],
      ["beta-worker/package.json", "version", VERSION], ["beta-worker/wrangler.jsonc", "vars.VERSION", VERSION],
      ["gamma-worker/wrangler.jsonc", "vars.VERSION", VERSION],
    ]);
    const r = resolveVersion(root);
    assert.equal(r.ok, true);
    assert.equal(r.version, VERSION);
    assert.equal(r.sites.length, 7);
    assert.deepEqual(r.findings, [], "no findings when every site agrees");
  } finally { rm(root); }
});

test("R12: a site behind or ahead of bio-plane/package.json is one finding naming the file, the key and the edit; no authority is one finding; never throws", async () => {
  const root = await makeRepo({ build: false });
  try {
    const pj = join(root, "alpha-worker/package.json");
    writeJson(pj, { ...readJson(pj), version: "1.2.2" });               /* behind */
    const wj = join(root, "beta-worker/wrangler.jsonc");
    writeFileSync(wj, readFileSync(wj, "utf8").replace(`"VERSION": "${VERSION}"`, '"VERSION": "1.3.0"'));   /* ahead */
    const r = resolveVersion(root);
    assert.equal(r.ok, false);
    assert.equal(r.version, VERSION);
    assert.equal(r.findings.length, 2);
    assert.match(r.findings[0], /alpha-worker\/package\.json declares version = "1\.2\.2".*bio-plane\/package\.json declares "1\.2\.3"[\s\S]*EDIT: set version in alpha-worker\/package\.json to "1\.2\.3"/);
    assert.match(r.findings[1], /beta-worker\/wrangler\.jsonc declares vars\.VERSION = "1\.3\.0"[\s\S]*EDIT: set vars\.VERSION in beta-worker\/wrangler\.jsonc to "1\.2\.3"/);

    const ppj = join(root, "bio-plane/package.json");
    const { version: _gone, ...noVersion } = readJson(ppj);
    writeJson(ppj, noVersion);
    const none = resolveVersion(root);
    assert.equal(none.ok, false);
    assert.equal(none.version, null);
    assert.equal(none.findings.length, 1);
    assert.match(none.findings[0], /bio-plane\/package\.json declares no `version`/);
  } finally { rm(root); }
});

test("R12: resolveVersionOrExit returns the version, or prints REFUSED [VERSION_SKEW] with the findings and exits 1", async () => {
  const root = await makeRepo({ build: false });
  try {
    const lib = pathToFileURL(join(root, "bio-plane/scripts/resolve-version.mjs")).href;
    const code = `const m = await import(${JSON.stringify(lib)}); console.log("got " + m.resolveVersionOrExit());`;
    const ok = run(root, ".", ["--input-type=module", "-e", code]);
    assert.equal(ok.status, 0, ok.stderr);
    assert.match(ok.stdout, /^got 1\.2\.3$/m);
    const pj = join(root, "alpha-worker/package.json");
    writeJson(pj, { ...readJson(pj), version: "0.9.0" });
    const bad = run(root, ".", ["--input-type=module", "-e", code]);
    assert.equal(bad.status, 1);
    assert.match(bad.stderr, /REFUSED \[VERSION_SKEW\]/);
    assert.match(bad.stderr, /EDIT: set version in alpha-worker\/package\.json to "1\.2\.3"/);
    assert.doesNotMatch(bad.stdout, /^got/m);
  } finally { rm(root); }
});

/* ------------------------------------------------------------------------ R13 */

test("R13: deriveBindings emits VERSION and INSTANCE_NAME, the vars, buckets, services (bio-plane becomes the slug), browser, and instance tokens only when given; no Durable Object", () => {
  const cfg = planeConfig({ version: "0.0.1", services: [{ binding: "SELF", service: "bio-plane" }, { binding: "PDF", service: "pdf-worker" }] });
  const base = [
    { type: "plain_text", name: "VERSION", text: "9.9.9" },
    { type: "plain_text", name: "INSTANCE_NAME", text: "grp" },
    { type: "plain_text", name: "MODE", text: "fixture" },
    { type: "r2_bucket", name: "CAPTURES", bucket_name: "c" },
    { type: "r2_bucket", name: "PUBLISHED", bucket_name: "p" },
    { type: "service", name: "SELF", service: "grp" },
    { type: "service", name: "PDF", service: "pdf-worker" },
    { type: "browser", name: "BROWSER" },
  ];
  assert.deepEqual(deriveBindings(cfg, { slug: "grp", version: "9.9.9" }), base, "VERSION is the argument's, never vars.VERSION");
  assert.deepEqual(deriveBindings(cfg, { slug: "grp", version: "9.9.9", instanceClaudeToken: "c-tok", instanceAiToken: "a-tok" }), [...base,
    { type: "secret_text", name: "INSTANCE_AI_TOKEN", text: "a-tok" }], "never a Claude credential, even when one is offered (K1502)");
  assert.deepEqual(deriveBindings(cfg, { slug: "grp", version: "9.9.9", instanceAiToken: "a-tok" }).at(-1),
    { type: "secret_text", name: "INSTANCE_AI_TOKEN", text: "a-tok" });
  const all = deriveBindings(cfg, { slug: "grp", version: "9.9.9", instanceClaudeToken: "c", instanceAiToken: "a" });
  assert.ok(!all.some((b) => b.type === "durable_object_namespace"), "no Durable Object binding");
  assert.ok(!all.some((b) => /CLAUDE/i.test(b.name) || b.text === "c"), "no Claude credential under any name");
  const { browser: _b, r2_buckets: _r, services: _s, ...bare } = cfg;
  assert.deepEqual(deriveBindings({ ...bare, vars: {} }, { slug: "s", version: "1" }),
    [{ type: "plain_text", name: "VERSION", text: "1" }, { type: "plain_text", name: "INSTANCE_NAME", text: "s" }]);
});

test("R14: deriveBindings refuses NO_SLUG, NO_VERSION, each declared unknown binding class by name, an unnamed browser, and a phantom target; serviceTargets lists targets but the slug", () => {
  const cfg = planeConfig();
  assert.match(tryThrow(() => deriveBindings(cfg, { version: "1" })).message, /^REFUSED \[NO_SLUG\]/);
  assert.match(tryThrow(() => deriveBindings(cfg, { slug: "s" })).message, /^REFUSED \[NO_VERSION\]/);
  const classes = ["kv_namespaces", "d1_databases", "queues", "analytics_engine_datasets", "ai", "vectorize", "hyperdrive",
    "dispatch_namespaces", "mtls_certificates", "send_email", "wasm_modules", "data_blobs", "text_blobs"];
  for (const k of classes) {
    const e = tryThrow(() => deriveBindings({ ...cfg, [k]: k === "ai" ? { binding: "AI" } : [{ binding: "X" }] }, { slug: "s", version: "1" }));
    assert.match(e.message, new RegExp(`^REFUSED \\[UNKNOWN_BINDING_CLASS\\]: wrangler\\.jsonc declares ${k},`), k);
  }
  const two = tryThrow(() => deriveBindings({ ...cfg, queues: [{}], hyperdrive: [{}] }, { slug: "s", version: "1" }));
  assert.match(two.message, /declares queues, hyperdrive,/, "each one named");
  assert.equal(deriveBindings({ ...cfg, kv_namespaces: [] }, { slug: "s", version: "1" }).length > 0, true, "an empty class is not declared");
  for (const browser of [{}, { binding: "" }, null, { binding: 3 }])
    assert.match(tryThrow(() => deriveBindings({ ...cfg, browser }, { slug: "s", version: "1" })).message, /^REFUSED \[BROWSER_BINDING_UNNAMED\]/);
  assert.match(tryThrow(() => deriveBindings(cfg, { slug: "bio-plane", version: "1" })).message, /^REFUSED \[PHANTOM_TARGET\]/);
  const b = deriveBindings(planeConfig({ services: [{ binding: "SELF", service: "bio-plane" }, { binding: "A", service: "agent-worker" },
    { binding: "P", service: "pdf-worker" }] }), { slug: "grp", version: "1" });
  assert.deepEqual(serviceTargets(b, "grp"), ["agent-worker", "pdf-worker"]);
});

/* ------------------------------------------------------------------------ R15 */

test("R15: deriveLimits returns subrequests and cpu_ms, refusing a missing or non-positive-integer subrequests and any other key; limitsReadBack's three verdicts; neither makes a request", async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("R15 made a request"); };
  try {
    assert.deepEqual(deriveLimits({ limits: { subrequests: 500, cpu_ms: 30000 } }), { subrequests: 500, cpu_ms: 30000 });
    assert.deepEqual(deriveLimits({ limits: { subrequests: 50 } }), { subrequests: 50 });
    for (const cfg of [{}, null, { limits: {} }, { limits: { subrequests: 0 } }, { limits: { subrequests: -5 } },
      { limits: { subrequests: 1.5 } }, { limits: { subrequests: "500" } }, { limits: { cpu_ms: 10 } }])
      assert.match(tryThrow(() => deriveLimits(cfg)).message, /^REFUSED \[NO_SUBREQUEST_LIMIT\]/, JSON.stringify(cfg));
    assert.match(tryThrow(() => deriveLimits({ limits: { subrequests: 5, memory: 1, cpu_ms: 2 } })).message,
      /^REFUSED \[UNKNOWN_LIMIT_KEY\]: wrangler\.jsonc's limits declares memory,/);

    const want = { subrequests: 500 };
    for (const s of [null, undefined, "x", {}, { limits: {} }, { limits: { subrequests: null } }])
      assert.equal(limitsReadBack(s, want).verdict, "UNDETERMINED", JSON.stringify(s));
    assert.match(limitsReadBack(null, want).why, /could not be read/);
    assert.match(limitsReadBack({}, want).why, /state no limits\.subrequests/);
    const mis = limitsReadBack({ limits: { subrequests: 50 } }, want);
    assert.equal(mis.verdict, "MISMATCH");
    assert.match(mis.why, /50.*500/);
    assert.deepEqual(limitsReadBack({ limits: { subrequests: 500 } }, want), { verdict: "MATCH", why: "limits.subrequests 500 read back" });
  } finally { globalThis.fetch = realFetch; }
});

/* ------------------------------------------------------------------------ R16 */

test("R16: npm run build renders the signer page, then writes the plane's bundle and manifest by R5 and prints size, SHA-256 and input counts", async () => {
  const root = await makeRepo({ build: false, realPackageJson: true, members: {} });
  try {
    writeFileSync(join(root, "bio-plane/src/plane/index.mjs"),
      'import { tag } from "../tag.mjs";\nimport { SIGN_HTML } from "../signpage.mjs";\n'
      + "export default { fetch() { return new Response(tag + SIGN_HTML.length); } };\n");
    /* The old entry path, left beside the plane's own: the bundle must not start from it (T20, K846). */
    writeFileSync(join(root, "bio-plane/src/index.mjs"), 'export { default } from "./plane/index.mjs";\n');
    const r = spawnSync("npm", ["run", "build"], { cwd: join(root, "bio-plane"), encoding: "utf8" });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const rendered = readFileSync(join(root, "bio-plane/src/signpage.mjs"), "utf8");
    assert.equal(rendered, renderSignpage(readFileSync(join(root, "bio-plane/src/sign-release.html"), "utf8")), "signatures R30's render");

    const plane = planeMember(root);
    const art = readFileSync(join(plane.abs, plane.bundle.outfile));
    const built = await buildMember(plane);
    assert.ok(art.equals(built.bytes), "the written bundle is what the recipe builds from the rendered source");
    const manifest = readJson(join(plane.abs, plane.bundle.manifest));
    assert.deepEqual(manifest, manifestFrom(plane, built));
    assert.ok(manifest.inputs.some((i) => i.path === "src/signpage.mjs" && i.sha256 === hex(rendered)), "rendered before the bundle was cut");
    assert.equal(manifest.recipe.entry, "src/plane/index.mjs", "the plane's own entry (plane R6)");
    assert.ok(manifest.inputs.some((i) => i.path === "src/plane/index.mjs"));
    assert.ok(!manifest.inputs.some((i) => i.path === "src/index.mjs"), "the old entry is not an input");
    assert.match(r.stdout, new RegExp(`bio-plane: built dist/bio-plane\\.bundled\\.mjs — ${art.length} B, sha256 ${hex(art)}`));
    assert.match(r.stdout, new RegExp(`bio-plane: wrote dist/bio-plane\\.bundle\\.json — ${manifest.inputs.length} first-party input\\(s\\), 0 vendored`));
  } finally { rm(root); }
});

test("R16: the plane is built from its own entry, the one its wrangler.jsonc's main names, and that file exists", () => {
  const plane = planeMember();
  assert.equal(plane.bundle.entry, "src/plane/index.mjs");
  assert.equal(plane.entry, plane.bundle.entry);
  assert.ok(existsSync(join(plane.abs, plane.bundle.entry)), "the entry exists in the repository");
  const cfg = parseJsonc(readFileSync(join(plane.abs, "wrangler.jsonc"), "utf8"), "bio-plane/wrangler.jsonc");
  assert.equal(cfg.main, plane.bundle.entry, "the bundle and a wrangler deploy start from one module");
});

/* --------------------------------------------------------------- R17, R18 */

const SLUG = "grp";
const deployRepo = () => makeRepo({ plane: { config: { services: [{ binding: "SELF", service: "bio-plane" }, { binding: "AGENT", service: "alpha-worker" }] } } });
const CF = { CF_TOKEN: "cf-secret-token-value", CF_ACCT: ACCOUNT };
const ASSET = "dist/bio-plane.bundled.mjs";
const deploy = (root, { args = [SLUG, VERSION, ASSET], env = CF, stub } = {}) =>
  run(root, "bio-plane", ["scripts/deploy.mjs", ...args], { env, stub });
const okStub = (extra = {}) => ({ subdomain: "sub", put: "accept", scripts: { "alpha-worker": { settings: {} } }, ...extra });
const puts = (r) => r.calls.filter((c) => c.method === "PUT");

test("R17: missing arguments or credentials exit 2 with the usage line; a skewed tree or a disagreeing version argument refuses; a non-plane slug exits 3; all before any request", async () => {
  const root = await deployRepo();
  try {
    for (const [args, env] of [[[SLUG, VERSION], CF], [[SLUG], CF], [[], CF], [[SLUG, VERSION, ASSET], { CF_ACCT: ACCOUNT }],
      [[SLUG, VERSION, ASSET], { CF_TOKEN: "t" }]]) {
      const r = deploy(root, { args, env, stub: okStub() });
      assert.equal(r.status, 2, JSON.stringify(args));
      assert.match(r.stderr, /usage: CF_TOKEN=\.\.\. CF_ACCT=\.\.\. node scripts\/deploy\.mjs <slug> <version> <asset>/);
      assert.deepEqual(r.calls, []);
    }
    const arg = deploy(root, { args: [SLUG, "1.2.4", ASSET], stub: okStub() });
    refused(arg, "VERSION_ARGUMENT_DISAGREES");
    assert.equal(arg.status, 1);
    assert.deepEqual(arg.calls, []);
    for (const notPlane of ["civicos", "pdf-worker"]) {
      const r = deploy(root, { args: [notPlane, VERSION, ASSET], stub: okStub() });
      assert.equal(r.status, 3, notPlane);
      assert.match(r.stderr, new RegExp(`\`${notPlane}\` is not a plane`));
      assert.deepEqual(r.calls, []);
    }
    const pj = join(root, "beta-worker/package.json");
    writeJson(pj, { ...readJson(pj), version: "1.2.2" });
    const skew = deploy(root, { stub: okStub() });
    refused(skew, "VERSION_SKEW");
    assert.equal(skew.status, 1);
    assert.match(skew.stderr, /beta-worker\/package\.json/);
    assert.deepEqual(skew.calls, []);
  } finally { rm(root); }
});

test("R17: every service target but the slug must be found in the account, or BINDING_TARGET_MISSING / PREFLIGHT_UNREADABLE, before any upload", async () => {
  const root = await deployRepo();
  try {
    const missing = deploy(root, { stub: okStub({ scripts: {} }) });
    refused(missing, "BINDING_TARGET_MISSING");
    assert.match(missing.stderr, /"alpha-worker"/);
    assert.match(missing.stderr, /node scripts\/deploy-fleet\.mjs alpha-worker --instance grp/);
    assert.deepEqual(puts(missing), []);
    assert.ok(!missing.calls.some((c) => c.url.includes(`/scripts/${SLUG}/settings`)), "the slug itself is never pre-flighted");
    const unreadable = deploy(root, { stub: okStub({ scripts: { "alpha-worker": { settingsStatus: 500 } } }) });
    refused(unreadable, "PREFLIGHT_UNREADABLE");
    assert.deepEqual(puts(unreadable), []);
    const unreachable = deploy(root, { stub: okStub({ unreachable: ["/scripts/alpha-worker/settings"] }) });
    refused(unreachable, "PREFLIGHT_UNREADABLE");
    assert.deepEqual(puts(unreachable), []);
  } finally { rm(root); }
});

test("R17: the old release-baton gate is gone: no --thread is asked for and nothing reads BATON.md", async () => {
  const root = await deployRepo();
  try {
    const r = deploy(root, { stub: okStub() });
    assert.equal(r.status, 0, r.stderr);
    assert.ok(r.calls.every((c) => new URL(c.url).host === "api.cloudflare.com" || c.url.includes(".workers.dev")), "no other host");
    assert.doesNotMatch(r.stdout + r.stderr, /baton/i);
  } finally { rm(root); }
});

test("R18: uploads with R13's bindings and R15's limits, keeps secret_text, Durable Object and service bindings, states each token without printing it, never sends a Claude credential (R13), and succeeds on bytes and limits read back", async () => {
  const root = await deployRepo();
  try {
    const tokens = { INSTANCE_CLAUDE_TOKEN: "claude-secret-xyz", INSTANCE_AI_TOKEN: "ai-secret-xyz" };
    const r = deploy(root, { env: { ...CF, ...tokens }, stub: okStub() });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const [p] = puts(r);
    assert.equal(puts(r).length, 1);
    const cfg = parseJsonc(readFileSync(join(root, "bio-plane/wrangler.jsonc"), "utf8"));
    assert.deepEqual(p.metadata.bindings, deriveBindings(cfg, { slug: SLUG, version: VERSION,
      instanceAiToken: tokens.INSTANCE_AI_TOKEN }));
    assert.ok(!p.metadata.bindings.some((b) => /CLAUDE/i.test(b.name) || b.text === tokens.INSTANCE_CLAUDE_TOKEN),
      "R13: an INSTANCE_CLAUDE_TOKEN in the environment is never sent");
    assert.deepEqual(p.metadata.keep_bindings, ["secret_text", "durable_object_namespace", "service"]);
    assert.deepEqual(p.metadata.limits, deriveLimits(cfg));
    assert.equal(p.metadata.main_module, "index.mjs");
    assert.equal(p.moduleBytes, readFileSync(join(root, "bio-plane", ASSET)).length);
    assert.ok(p.url.endsWith(`/accounts/${ACCOUNT}/workers/scripts/${SLUG}`) && p.bearer);
    const all = r.stdout + r.stderr;
    for (const v of [...Object.values(tokens), CF.CF_TOKEN]) assert.ok(!all.includes(v), "no secret printed");
    assert.match(r.stdout, /INSTANCE_CLAUDE_TOKEN is set in this environment and IGNORED/);
    assert.match(r.stdout, /INSTANCE_AI_TOKEN present in this environment — it will be SENT/);
    assert.match(r.stdout, /verified: deployed bytes are hash-identical to the signed asset/);
    assert.match(r.stdout, /verified: limits\.subrequests 500 read back/);
    assert.match(r.stdout, /rollout: serving 1\.2\.3 after/);

    const none = deploy(root, { stub: okStub() });
    assert.equal(none.status, 0);
    assert.doesNotMatch(none.stdout, /INSTANCE_CLAUDE_TOKEN/);
    assert.match(none.stdout, /INSTANCE_AI_TOKEN not in this environment — NOT sent/);
    assert.ok(!puts(none)[0].metadata.bindings.some((b) => b.type === "secret_text"));
  } finally { rm(root); }
});

test("R18: bytes that never read back equal exit 1 after four attempts saying nothing was applied; a limits mismatch exits 1; an undetermined limit is not stated as verified", async () => {
  const root = await deployRepo();
  try {
    const never = deploy(root, { stub: okStub({ put: "ignore" }) });
    assert.equal(never.status, 1);
    assert.equal(puts(never).length, 4);
    assert.match(never.stderr, /never matched the signed asset/);
    assert.match(never.stderr, /Nothing was half-applied/);
    assert.doesNotMatch(never.stdout, /verified/);

    const html = deploy(root, { stub: okStub({ put: "ignore", scripts: { "alpha-worker": { settings: {} }, [SLUG]: { scriptStatus: 502 } } }) });
    assert.equal(html.status, 1, "an unreadable read-back is never a match");
    assert.equal(puts(html).length, 4);

    const mis = deploy(root, { stub: okStub({ settingsAfterPut: { limits: { subrequests: 50 } } }) });
    assert.equal(mis.status, 1);
    assert.match(mis.stderr, /\[LIMITS_MISMATCH\]/);
    assert.doesNotMatch(mis.stdout, /rollout:/);

    const und = deploy(root, { stub: okStub({ settingsAfterPut: {} }) });
    assert.equal(und.status, 0);
    assert.match(und.stdout, /limits: UNDETERMINED — the script settings state no limits\.subrequests\. The ceiling sent \(500\) is NOT confirmed/);
    assert.doesNotMatch(und.stdout, /verified: limits/);
    assert.match(und.stdout, /rollout: serving 1\.2\.3 after/, "and it still waits on the rollout");
  } finally { rm(root); }
});

test("R18: already-deployed bytes serving the version with matching limits upload nothing; otherwise a metadata deploy proceeds; the rollout wait never fails the deploy", async () => {
  const root = await deployRepo();
  try {
    const body = readFileSync(join(root, "bio-plane", ASSET), "utf8");
    const done = deploy(root, { stub: okStub({ scripts: { "alpha-worker": { settings: {} }, [SLUG]: { body, settings: { limits: { subrequests: 500 } } } },
      serving: { [SLUG]: VERSION } }) });
    assert.equal(done.status, 0, done.stderr);
    assert.deepEqual(puts(done), []);
    assert.match(done.stdout, /already byte-identical AND serving 1\.2\.3 AND limits\.subrequests 500 read back; nothing to do/);

    for (const [label, scripts, serving] of [
      ["serving an older version", { body, settings: { limits: { subrequests: 500 } } }, "1.2.2"],
      ["limits not ours", { body, settings: { limits: { subrequests: 9 } } }, VERSION],
    ]) {
      const r = deploy(root, { stub: okStub({ scripts: { "alpha-worker": { settings: {} }, [SLUG]: scripts }, serving: { [SLUG]: serving } }) });
      assert.equal(r.status, 0, `${label}: ${r.stderr}`);
      assert.equal(puts(r).length, 1, label);
      assert.match(r.stdout, /a METADATA deploy proceeds/, label);
    }

    const slow = deploy(root, { stub: okStub({ servingAfterPut: "never", serving: { [SLUG]: "1.2.2" } }) });
    assert.equal(slow.status, 0);
    assert.match(slow.stdout, /ROLLOUT NOT CONFIRMED after 60s: \/version still does not answer 1\.2\.3/);
    assert.equal(slow.calls.filter((c) => c.url.endsWith(".workers.dev/version")).length, 15, "fifteen checks four seconds apart: 60 seconds");
    const nosub = deploy(root, { stub: okStub({ subdomain: null }) });
    assert.equal(nosub.status, 0);
    assert.match(nosub.stdout, /could not learn the workers\.dev subdomain, so which build is SERVING is unconfirmed/);
  } finally { rm(root); }
});

/* --------------------------------------------------------------- R19, R20 */

const fleet = (root, args, { env = { CF_TOKEN: "cf-secret-token-value" }, stub = { subdomain: "sub", scripts: { [SLUG]: {} } } } = {}) =>
  run(root, ".", ["bio-plane/scripts/deploy-fleet.mjs", ...args], { env, stub });

test("R19: refuses NO_MEMBER, NO_INSTANCE, NOT_A_FLEET_MEMBER, NO_CONFIG, UNPARSEABLE_CONFIG, ACCOUNT_NOT_PINNED and NO_TOKEN", async () => {
  const root = await makeRepo({ build: false });
  try {
    refused(fleet(root, []), "NO_MEMBER");
    refused(fleet(root, ["alpha-worker"]), "NO_INSTANCE");
    refused(fleet(root, ["alpha-worker", "--instance", ""]), "NO_INSTANCE");
    refused(fleet(root, ["bio-plane", "--instance", SLUG]), "NOT_A_FLEET_MEMBER");
    refused(fleet(root, ["no-such", "--instance", SLUG]), "NOT_A_FLEET_MEMBER");
    addMember(root, "gamma-worker");
    rmSync(join(root, "gamma-worker/wrangler.jsonc"));
    refused(fleet(root, ["gamma-worker", "--instance", SLUG]), "NO_CONFIG");
    writeFileSync(join(root, "gamma-worker/wrangler.jsonc"), "{ not: jsonc");
    refused(fleet(root, ["gamma-worker", "--instance", SLUG]), "UNPARSEABLE_CONFIG");
    addMember(root, "delta-worker", { account: null });
    refused(fleet(root, ["delta-worker", "--instance", SLUG]), "ACCOUNT_NOT_PINNED");
    const nt = fleet(root, ["alpha-worker", "--instance", SLUG], { env: {} });
    refused(nt, "NO_TOKEN");
    assert.deepEqual(nt.calls, []);
    assert.equal(fleet(root, ["alpha-worker", "--instance", SLUG, "--dry-run"], { env: { CLOUDFLARE_API_TOKEN: "t" } }).status, 0,
      "CLOUDFLARE_API_TOKEN serves as the token");
  } finally { rm(root); }
});

test("R19: the bio-plane target becomes the slug and every other is kept; each target must be found in the account; it prints member, instance, account and each binding", async () => {
  const root = await makeRepo({ build: false });
  try {
    addMember(root, "gamma-worker", { services: [{ binding: "PLANE", service: "bio-plane" }, { binding: "PDF", service: "pdf-worker" }] });
    const stub = { subdomain: "sub", scripts: { [SLUG]: {}, "pdf-worker": {} } };
    const r = fleet(root, ["gamma-worker", "--instance", SLUG, "--dry-run"], { stub });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /^member {3}: gamma-worker$/m);
    assert.match(r.stdout, /^instance : grp$/m);
    assert.match(r.stdout, new RegExp(`^account  : ${ACCOUNT}$`, "m"));
    assert.match(r.stdout, /PLANE -> grp {2}\(was the phantom "bio-plane"\)/);
    assert.match(r.stdout, /PDF -> pdf-worker {2}\(left as written\)/);
    const checked = r.calls.filter((c) => /\/workers\/scripts\/[^/]+\/settings$/.test(c.url)).map((c) => c.url.split("/").at(-2));
    assert.deepEqual(checked, [SLUG, "pdf-worker"]);
    assert.ok(r.calls.every((c) => c.url.includes(`/accounts/${ACCOUNT}/`)), "asked of the pinned account");

    const miss = fleet(root, ["gamma-worker", "--instance", SLUG], { stub: { scripts: { [SLUG]: {} } } });
    refused(miss, "BINDING_TARGET_MISSING");
    assert.match(miss.stderr, /"pdf-worker"/);
    assert.deepEqual(miss.wrangler, []);
    refused(fleet(root, ["gamma-worker", "--instance", SLUG], { stub: { scripts: { [SLUG]: {}, "pdf-worker": { settingsStatus: 403 } } } }), "PREFLIGHT_UNREADABLE");
    refused(fleet(root, ["gamma-worker", "--instance", SLUG], { stub: { scripts: { [SLUG]: {} }, unreachable: ["pdf-worker"] } }), "PREFLIGHT_UNREADABLE");
  } finally { rm(root); }
});

test("R20: --dry-run deploys nothing; otherwise wrangler deploys from the member's directory with a generated config removed afterwards, success or failure, the tracked config never written", async () => {
  const root = await makeRepo({ build: false });
  try {
    const tracked = join(root, "alpha-worker/wrangler.jsonc");
    const trackedBefore = readFileSync(tracked);
    const gen = join(root, "alpha-worker/.wrangler.deploy.generated.json");
    const dry = fleet(root, ["alpha-worker", "--instance", SLUG, "--dry-run"]);
    assert.equal(dry.status, 0);
    assert.deepEqual(dry.wrangler, []);
    assert.match(dry.stdout, /--dry-run: nothing was deployed/);

    const stub = { subdomain: "sub", scripts: { [SLUG]: {} }, serving: { "alpha-worker": JSON.stringify({ version: VERSION }) } };
    const ok = fleet(root, ["alpha-worker", "--instance", SLUG], { stub });
    assert.equal(ok.status, 0, ok.stderr);
    assert.equal(ok.wrangler.length, 1);
    const w = ok.wrangler[0];
    assert.deepEqual(w.args.slice(0, 2), ["deploy", "-c"]);
    assert.ok(w.args[2].endsWith("/alpha-worker/.wrangler.deploy.generated.json"), w.args[2]);
    assert.equal(realpathSync(w.cwd), realpathSync(join(root, "alpha-worker")));
    assert.equal(w.token, "present");
    const want = parseJsonc(trackedBefore.toString());
    want.services = [{ binding: "PLANE", service: SLUG }];
    assert.deepEqual(JSON.parse(w.config), want, "the generated config is the tracked one with the slug substituted");
    assert.ok(readFileSync(tracked).equals(trackedBefore), "the tracked config is never written");
    assert.equal(existsSync(gen), false, "removed after success");
    assert.match(ok.stdout, /rollout: alpha-worker serving 1\.2\.3 after/);

    const fail = fleet(root, ["alpha-worker", "--instance", SLUG], { env: { CF_TOKEN: "t", WRANGLER_EXIT: "7" }, stub });
    assert.equal(fail.status, 7, "wrangler's failure is the exit");
    assert.equal(existsSync(gen), false, "removed after failure");
    assert.ok(readFileSync(tracked).equals(trackedBefore));
    assert.doesNotMatch(fail.stdout, /rollout:/);

    const slow = fleet(root, ["alpha-worker", "--instance", SLUG], { stub: { ...stub, serving: { "alpha-worker": JSON.stringify({ version: "1.0.0" }) } } });
    assert.equal(slow.status, 0);
    assert.match(slow.stdout, /ROLLOUT NOT CONFIRMED after 60s/);
    assert.equal(slow.calls.filter((c) => c.url.endsWith(".workers.dev/version")).length, 15);
  } finally { rm(root); }
});

/* ------------------------------------------------------------------------ R21 */

const bundles = (root, args = []) => run(root, ".", ["bio-plane/scripts/bundles.mjs", ...args]);

test("R21: --check surveys every guarded bundle by R6, names each finding, writes nothing, and exits 1 when any is stale, 0 when none", async () => {
  const root = await makeRepo();
  try {
    const fresh = bundles(root, ["--check"]);
    assert.equal(fresh.status, 0, fresh.stdout + fresh.stderr);
    assert.match(fresh.stdout, /3 guarded bundle\(s\) — alpha-worker, beta-worker, bio-plane/);
    writeFileSync(join(root, "alpha-worker/src/word.mjs"), 'export const word = "changed";\n');
    writeFileSync(join(root, "bio-plane/src/tag.mjs"), 'export const tag = "changed";\n');
    const before = snapshot(root);
    const stale = bundles(root, ["--check"]);
    assert.equal(stale.status, 1);
    for (const m of discoverMembers(root).concat(planeMember(root)))
      for (const f of verifyStatic(m).findings) assert.ok(stale.stdout.includes(f), `names: ${f}`);
    assert.match(stale.stdout, /2 of 3 bundle\(s\) are STALE — alpha-worker, bio-plane/);
    assert.deepEqual(snapshot(root), before, "--check writes nothing");
    const lib = await import(pathToFileURL(join(root, "bio-plane/scripts/bundles.mjs")).href);
    assert.equal(await lib.run({ repoRoot: root, check: true, log: () => {} }), 1, "run({check}) is the same survey");
  } finally { rm(root); }
});

test("R21: it rebuilds each stale member by its own npm run build, reports rebuilt only when bytes changed and which, surveys again, and exits 0 only when all is fresh", async () => {
  const root = await makeRepo();
  try {
    writeFileSync(join(root, "alpha-worker/src/word.mjs"), 'export const word = "changed";\n');
    writeFileSync(join(root, "beta-worker/src/word.mjs"), 'export const word = "beta-worker";\nexport const unused = 1;\n');
    const r = bundles(root);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /rebuilding alpha-worker \(npm run build in alpha-worker\/\)/);
    assert.match(r.stdout, /alpha-worker — REBUILT dist\/alpha-worker\.bundled\.mjs \d+ B — artifact sha256 [0-9a-f]{64} \(was [0-9a-f]{64}\), manifest moved/);
    assert.match(r.stdout, /beta-worker — REBUILT dist\/beta-worker\.bundled\.mjs \d+ B — artifact BYTE-IDENTICAL, manifest moved/,
      "an unused export is tree-shaken: only the manifest moved, and it says so");
    assert.match(r.stdout, /2 rebuilt \(alpha-worker, beta-worker\), 0 already byte-identical, 1 already fresh, 0 STILL STALE/);
    for (const m of discoverMembers(root).concat(planeMember(root))) assert.deepEqual(verifyStatic(m).findings, [], m.name);

    /* A build that exits 0 having changed nothing, and one that fails: named, and the exit is 1. */
    writeFileSync(join(root, "alpha-worker/src/word.mjs"), 'export const word = "again";\n');
    const pa = join(root, "alpha-worker/package.json");
    writeJson(pa, { ...readJson(pa), scripts: { build: "node -e 0" } });
    writeFileSync(join(root, "bio-plane/src/tag.mjs"), 'export const tag = "moved";\n');
    const pp = join(root, "bio-plane/package.json");
    writeJson(pp, { ...readJson(pp), scripts: { build: "exit 3" } });
    const bad = bundles(root);
    assert.equal(bad.status, 1);
    assert.match(bad.stdout, /alpha-worker — rebuilt, NOTHING MOVED/);
    assert.match(bad.stdout, /! STILL alpha-worker: STALE BUNDLE/);
    assert.match(bad.stdout, /0 rebuilt, 1 already byte-identical, 1 already fresh, 2 STILL STALE \(alpha-worker, bio-plane\), 1 could not be rebuilt \(bio-plane: its build exited 3\)/);
  } finally { rm(root); }
});

/* --------------------------------------------------------------- R22, R23 */

const assemble = (root, args = [], env = {}) => run(root, ".", ["bio-plane/scripts/release-assemble.mjs", ...args], { env });
const envelope = () => `BIOKEY-RAW1.test.${randomBytes(32).toString("base64")}`;
/* R30: `--sign` runs only in the GitHub Actions signing environment; these tests stand in for it, with a throwaway key. */
const SIGNING = { GITHUB_ACTIONS: "true" };

/** The payload R22 must sign, computed here from the fixture's files and configs. */
function expectedPayload(root, version = VERSION) {
  const lib = { plane: planeMember(root), members: discoverMembers(root).filter((m) => m.bundle) };
  const art = (m) => readFileSync(join(m.abs, m.bundle.outfile));
  const members = lib.members.map((m) => {
    const cfg = parseJsonc(readFileSync(join(m.abs, "wrangler.jsonc"), "utf8"));
    const parts = (m.bundle.assets || []).map((p) => {
      const b = readFileSync(join(m.abs, p));
      return { path: p, type: p.endsWith(".bin") ? "Data" : "CompiledWasm", sha256: hex(b), bytes: b.length };
    });
    /* R25: a container member's descriptor, written here from its marker's fields by hand. */
    const mk = readJson(join(m.abs, "fleet-member.json"));
    if (mk.kind === "container" && Array.isArray(mk.containers)) {
      /* R25, R27 (T36-2): one part per class, each with its own image and its statement's packages (SCANNER_PACKAGES). */
      for (const c of mk.containers) {
        const b = Buffer.from(JSON.stringify({ class_name: c.class_name, image: `${c.image.repository}@${c.image.digest}`,
          scheduling_policy: "default", max_instances: c.max_instances ?? mk.max_instances, bind: c.bind ?? mk.bind,
          packages: SCANNER_PACKAGES[c.class_name] }, null, 2) + "\n");
        parts.push({ path: `container/${c.class_name}.json`, type: "Container", sha256: hex(b), bytes: b.length, buf: b });
      }
    } else if (mk.kind === "container") {
      /* R27: the image's packages, as the fixture's lockfile states them (CONTAINER_PACKAGES, by hand), last. */
      const b = Buffer.from(JSON.stringify({ class_name: mk.class_name, image: `${mk.image.repository}@${mk.image.digest}`,
        scheduling_policy: "default", max_instances: mk.max_instances, bind: mk.bind, packages: CONTAINER_PACKAGES }, null, 2) + "\n");
      parts.push({ path: "container.json", type: "Container", sha256: hex(b), bytes: b.length, buf: b });
    }
    /* R25 (N772): the Worker part, written here from the config by hand, each bucket by its role. */
    const ROLE = { "bio-captures": "captures", "bio-published": "published" };
    const r2 = (cfg.r2_buckets || []).map((x) => ({ binding: x.binding, bucket: ROLE[x.bucket_name] }));
    const crons = (cfg.triggers && cfg.triggers.crons) || [];
    if (r2.length || crons.length) {
      const b = Buffer.from(JSON.stringify({ r2_buckets: r2, crons }, null, 2) + "\n");
      parts.push({ path: "worker.json", type: "Worker", sha256: hex(b), bytes: b.length, buf: b });
    }
    return { member: m.name, asset: `${m.name}.bundled.mjs`, sha256: hex(art(m)), bytes: art(m).length,
      compat: { date: cfg.compatibility_date, flags: cfg.compatibility_flags || [] },
      services: (cfg.services || []).map((s) => ({ binding: s.binding, service: s.service })), parts };
  });
  const p = art(lib.plane);
  const bufs = Object.fromEntries(members.flatMap((m) => m.parts.filter((x) => x.buf).map((x) => [`${m.member}/${x.path}`, x.buf])));
  for (const m of members) m.parts = m.parts.map(({ buf: _b, ...x }) => x);
  return { payload: fleetStatement({ version, plane: { sha256: hex(p), bytes: p.length, asset: "bio-plane.bundled.mjs" }, members }),
    members, plane: { sha256: hex(p), bytes: p.length, buf: p }, bufs };
}

test("R22: a fresh fleet assembles; the payload is signatures' fleetStatement over the plane and every member; --emit-payload writes it; --dry-run writes nothing else", async () => {
  const root = await makeRepo({ members: { "alpha-worker": { flags: null }, "beta-worker": { assets: { "assets/model.bin": "MODEL-1", "assets/core.wasm": "\0asm" } } } });
  try {
    const { payload } = expectedPayload(root);
    assert.match(payload, /compat=2026-07-01\+- /, "an absent flags key is the stated empty list");
    const before = snapshot(root);
    const out = join(mkdtempSync(join(tmpdir(), "bundler-emit-")), "payload.txt");
    const r = assemble(root, ["--dry-run", "--emit-payload", out]);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.equal(readFileSync(out, "utf8"), payload);
    assert.ok(r.stdout.includes(payload), "the payload is printed");
    assert.match(r.stdout, /--dry-run: nothing written\. A release cut now would carry 3 assets at 1\.2\.3/);
    assert.deepEqual(snapshot(root), before, "nothing in the repository written");
    rmSync(out);
    const v = assemble(root, ["--dry-run", "--version", VERSION]);
    assert.equal(v.status, 0, "--version equal to the resolved version is accepted");
  } finally { rm(root); }
});

test("R22: refuses NO_ARTIFACT, NO_MANIFEST, GUARD_CANNOT_RUN, STALE_OR_UNINSTALLABLE and MANIFEST_DISAGREES, writing nothing", async () => {
  const root = await makeRepo({ members: { "alpha-worker": {}, "beta-worker": { assets: { "assets/model.bin": "MODEL-1" } }, "gamma-worker": { vendored: true } } });
  const cases = [
    ["NO_ARTIFACT", (r) => rmSync(join(r, "alpha-worker/dist/alpha-worker.bundled.mjs"))],
    ["NO_MANIFEST", (r) => rmSync(join(r, "alpha-worker/dist/alpha-worker.bundle.json"))],
    ["GUARD_CANNOT_RUN", (r) => rmSync(join(r, "gamma-worker/node_modules"), { recursive: true })],
    ["GUARD_CANNOT_RUN", (r) => writeFileSync(join(r, "alpha-worker/src/word.mjs"), 'export { word } from "./missing.mjs";\n')],
    ["STALE_OR_UNINSTALLABLE", (r) => writeFileSync(join(r, "alpha-worker/src/word.mjs"), 'export const word = "drifted";\n')],
    ["MANIFEST_DISAGREES", (r) => { const p = join(r, "alpha-worker/dist/alpha-worker.bundle.json"); writeJson(p, { ...readJson(p), sha256: "0".repeat(64) }); }],
  ];
  try {
    const pristine = snapshot(root);
    for (const [code, arrange] of cases) {
      const save = new Map(Object.keys(pristine).map((k) => [k, readFileSync(join(root, k))]));
      arrange(root);
      const before = snapshot(root);
      const r = assemble(root, ["--dry-run"]);
      refused(r, code);
      assert.deepEqual(snapshot(root), before, `${code}: nothing written`);
      for (const [k, b] of save) writeFileSync(join(root, k), b);
      if (code === "GUARD_CANNOT_RUN" && !existsSync(join(root, "gamma-worker/node_modules"))) addMember(root, "gamma-worker", { vendored: true });
    }
    assert.equal(assemble(root, ["--dry-run"]).status, 0, "restored, it assembles");
  } finally { rm(root); }
});

test("R22: refuses a declared part missing, unhashed, untyped or disagreeing, an unstated compatibility date, version skew, a disagreeing --version and a version already released with another plane", async () => {
  const root = await makeRepo();
  const beta = (p) => join(root, "beta-worker", p);
  const cases = [
    ["MEMBER_PART_MISSING", () => rmSync(beta("assets/model.bin"))],
    ["MEMBER_PART_UNHASHED", () => { const m = readJson(beta("dist/beta-worker.bundle.json")); delete m.assets; writeJson(beta("dist/beta-worker.bundle.json"), m); }],
    ["MEMBER_PART_DISAGREES", () => writeFileSync(beta("assets/model.bin"), "MODEL-2")],
    ["MEMBER_PART_UNTYPED", () => { const c = parseJsonc(readFileSync(beta("wrangler.jsonc"), "utf8")); delete c.rules; writeJson(beta("wrangler.jsonc"), c); }],
    ["MEMBER_COMPAT_UNSTATED", () => { const c = parseJsonc(readFileSync(beta("wrangler.jsonc"), "utf8")); delete c.compatibility_date; writeJson(beta("wrangler.jsonc"), c); }],
    ["VERSION_SKEW", () => writeJson(beta("package.json"), { ...readJson(beta("package.json")), version: "1.2.4" })],
    ["VERSION_DISAGREES", () => {}, ["--version", "9.9.9"]],
    ["VERSION_ALREADY_RELEASED", () => writeJson(join(root, "release/RELEASE.json"), { version: VERSION, sha256: "f".repeat(64) })],
  ];
  try {
    const pristine = new Map(Object.keys(snapshot(root)).map((k) => [k, readFileSync(join(root, k))]));
    for (const [code, arrange, args = []] of cases) {
      arrange();
      const before = snapshot(root);
      refused(assemble(root, ["--dry-run", ...args]), code);
      assert.deepEqual(snapshot(root), before, `${code}: nothing written`);
      for (const k of Object.keys(snapshot(root))) if (!pristine.has(k)) rmSync(join(root, k));
      for (const [k, b] of pristine) writeFileSync(join(root, k), b);
    }
    const { plane } = expectedPayload(root);
    writeJson(join(root, "release/RELEASE.json"), { version: VERSION, sha256: plane.sha256 });
    assert.equal(assemble(root, ["--dry-run"]).status, 0, "the same version with the same plane is not a second release");
  } finally { rm(root); }
});

const sshVerify = (signerLine, sig, bytes, ns) => {
  const dir = mkdtempSync(join(tmpdir(), "bundler-ver-"));
  try {
    writeFileSync(join(dir, "allowed"), `p ${signerLine.split(" ").slice(0, 2).join(" ")}\n`);
    writeFileSync(join(dir, "s.sig"), sig);
    execFileSync("ssh-keygen", ["-Y", "verify", "-f", join(dir, "allowed"), "-I", "p", "-n", ns, "-s", join(dir, "s.sig")], { input: bytes, stdio: "pipe" });
    return true;
  } catch { return false; } finally { rmSync(dir, { recursive: true, force: true }); }
};

test("R23: --sign signs the plane in bio-release and the payload in bio-release-fleet, verified by stock ssh-keygen, then copies every asset and part and writes RELEASE.json", async () => {
  const root = await makeRepo();
  try {
    const seed = envelope(), signer = signerPublicLine(seed);
    writeJson(join(root, "release/RELEASE.json"), { version: "1.2.2", signer });
    const r = assemble(root, ["--sign"], { BIO_RELEASE_SEED: seed, ...SIGNING });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.ok(!(r.stdout + r.stderr).includes(seed.split(".")[2]), "the seed is never printed");
    const { payload, members, plane } = expectedPayload(root);
    const rel = readJson(join(root, "release/RELEASE.json"));
    assert.deepEqual(Object.keys(rel), ["version", "sha256", "bytes", "asset", "sig", "signer", "fleet", "fleetSig"]);
    assert.deepEqual({ ...rel, sig: null, fleetSig: null }, { version: VERSION, sha256: plane.sha256, bytes: plane.bytes,
      asset: "bio-plane.bundled.mjs", sig: null, signer, fleet: members, fleetSig: null });
    assert.ok(sshVerify(signer, rel.sig, plane.buf, NS_RELEASE), "stock ssh-keygen accepts sig over the plane");
    assert.ok(sshVerify(signer, rel.fleetSig, Buffer.from(payload), NS_FLEET), "stock ssh-keygen accepts fleetSig over the payload");
    assert.equal((await verifySshsig(rel.fleetSig, new TextEncoder().encode(payload), NS_FLEET, [signer])).ok, true);
    for (const m of [planeMember(root), ...discoverMembers(root)])
      assert.ok(readFileSync(join(root, "release", `${m.name}.bundled.mjs`)).equals(readFileSync(join(m.abs, m.bundle.outfile))), m.name);
    assert.equal(readFileSync(join(root, "release/beta-worker/assets/model.bin"), "utf8"), "MODEL-1", "a part under <member>/<path>");
  } finally { rm(root); }
});

test("R23: without --sign the fleet signature comes from --fleet-sig and the plane's from RELEASE.json; each must verify for the release's signer or it refuses, writing nothing", async () => {
  const root = await makeRepo();
  try {
    const seed = envelope(), signer = signerPublicLine(seed);
    const { payload, plane } = expectedPayload(root);
    const relPath = join(root, "release/RELEASE.json");
    const sigFile = join(mkdtempSync(join(tmpdir(), "bundler-sig-")), "fleet.sig");
    const goodPlane = signSshsig(seed, plane.buf, NS_RELEASE);
    const attempt = (rel, args, env = {}) => {
      writeJson(relPath, rel);
      const before = snapshot(root);
      const r = assemble(root, args, env);
      return { r, unchanged: JSON.stringify(snapshot(root)) === JSON.stringify(before) };
    };
    const expectRefused = (code, rel, args, env) => { const { r, unchanged } = attempt(rel, args, env); refused(r, code); assert.ok(unchanged, `${code}: nothing written`); };

    expectRefused("NO_SEED", { signer }, ["--sign"], SIGNING);
    expectRefused("SIGNING_FAILED", { signer }, ["--sign"], { BIO_RELEASE_SEED: "not-an-envelope", ...SIGNING });
    expectRefused("NO_PLANE_SIG", { signer }, []);
    expectRefused("PLANE_SIG_DOES_NOT_COVER_ASSET", { signer, sig: signSshsig(seed, Buffer.from("older plane"), NS_RELEASE) }, []);
    expectRefused("PLANE_SIG_DOES_NOT_COVER_ASSET", { signer: signerPublicLine(envelope()) }, ["--sign"], { BIO_RELEASE_SEED: seed, ...SIGNING });
    expectRefused("PLANE_SIG_DOES_NOT_COVER_ASSET", {}, ["--sign"], { BIO_RELEASE_SEED: seed, ...SIGNING });
    expectRefused("NO_FLEET_SIG", { signer, sig: goodPlane }, []);
    writeFileSync(sigFile, signSshsig(seed, payload + "member dropped\n", NS_FLEET));
    expectRefused("FLEET_SIG_REJECTED", { signer, sig: goodPlane }, ["--fleet-sig", sigFile]);
    writeFileSync(sigFile, signSshsig(seed, payload, NS_RELEASE));
    expectRefused("FLEET_SIG_REJECTED", { signer, sig: goodPlane }, ["--fleet-sig", sigFile]);

    const fleetSig = signSshsig(seed, payload, NS_FLEET);
    writeFileSync(sigFile, fleetSig);
    const { r } = attempt({ version: "1.2.2", signer, sig: goodPlane }, ["--fleet-sig", sigFile]);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const rel = readJson(relPath);
    assert.equal(rel.sig, goodPlane);
    assert.equal(rel.fleetSig, fleetSig);
    assert.equal(rel.version, VERSION);
    assert.ok(existsSync(join(root, "release/alpha-worker.bundled.mjs")));
    rmSync(sigFile);
  } finally { rm(root); }
});

/* --------------------------------------------------------- R24, R25, R26 */

test("R24: bundles.mjs surveys a container member with no Worker bundle as listed, not guarded, never stale; one with a bundle is surveyed like any member", async () => {
  const root = await makeRepo({ build: false });
  try {
    addContainerMember(root, "runner", { bundle: false });
    addContainerMember(root, "hosted");
    await buildAll(root);
    const r = bundles(root, ["--check"]);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /4 guarded bundle\(s\) — alpha-worker, beta-worker, bio-plane, hosted/);
    assert.match(r.stdout, /1 container member\(s\) listed, not bundle-guarded \(no Worker bundle\) — runner/);
    assert.doesNotMatch(r.stdout, /runner: declares no/);
    const full = bundles(root);
    assert.equal(full.status, 0, "and a rebuild run has nothing to rebuild and nothing it could not");
    writeFileSync(join(root, "hosted/src/word.mjs"), 'export const word = "moved";\n');
    const stale = bundles(root, ["--check"]);
    assert.equal(stale.status, 1);
    assert.match(stale.stdout, /1 of 4 bundle\(s\) are STALE — hosted/);
  } finally { rm(root); }
});

test("R22: a worker member that declares no bundle block refuses NO_ARTIFACT, never drops out of the release", async () => {
  const root = await makeRepo();
  try {
    const p = join(root, "alpha-worker/fleet-member.json");
    const { bundle: _b, ...rest } = readJson(p);
    writeJson(p, rest);
    const before = snapshot(root);
    const r = assemble(root, ["--dry-run"]);
    refused(r, "NO_ARTIFACT");
    assert.match(r.stderr, /alpha-worker is a fleet member and declares no `bundle` block/);
    assert.deepEqual(snapshot(root), before);
  } finally { rm(root); }
});

test("R25: a container member's container.json part (type Container, its marker's descriptor) is in the signed payload, written under <member>/container.json, and listed in RELEASE.json", async () => {
  const root = await makeRepo({ build: false });
  try {
    addContainerMember(root, "runner");
    await buildAll(root);
    const { payload, members, bufs } = expectedPayload(root);
    const runner = members.find((m) => m.member === "runner");
    const part = runner.parts.find((x) => x.path === "container.json");
    assert.equal(part.type, "Container");
    assert.match(payload, new RegExp(`^member runner .* parts=container\\.json:Container:${part.sha256}:${part.bytes}$`, "m"));
    assert.equal(JSON.parse(bufs["runner/container.json"]).image, `docker.io/civicos/runner@${DIGEST}`);

    const dry = assemble(root, ["--dry-run"]);
    assert.equal(dry.status, 0, dry.stdout + dry.stderr);
    assert.ok(dry.stdout.includes(payload), "the payload the fleet signature covers carries the descriptor's hash");
    assert.equal(existsSync(join(root, "release/runner")), false, "--dry-run writes nothing");

    const seed = envelope(), signer = signerPublicLine(seed);
    writeJson(join(root, "release/RELEASE.json"), { version: "1.2.2", signer });
    const r = assemble(root, ["--sign"], { BIO_RELEASE_SEED: seed, ...SIGNING });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const rel = readJson(join(root, "release/RELEASE.json"));
    assert.deepEqual(rel.fleet, members);
    assert.ok(readFileSync(join(root, "release/runner/container.json")).equals(bufs["runner/container.json"]), "the exact bytes hashed");
    assert.ok(readFileSync(join(root, "release/runner.bundled.mjs")).equals(readFileSync(join(root, "runner/dist/runner.bundled.mjs"))),
      "its asset is its Worker bundle, like any member's");
    assert.ok(sshVerify(signer, rel.fleetSig, Buffer.from(payload), NS_FLEET));
    assert.equal(existsSync(join(root, "runner/container.json")), false, "never written into the member's tree");
  } finally { rm(root); }
});

test("R25: a container member with a Worker bundle whose marker lacks a field of the part, or states no digest in the pinned form, is refused CONTAINER_UNDESCRIBED naming the field, before anything is written", async () => {
  const root = await makeRepo({ build: false });
  try {
    addContainerMember(root, "runner");
    await buildAll(root);
    const marker = join(root, "runner/fleet-member.json");
    const good = readFileSync(marker);
    const seed = envelope();
    writeJson(join(root, "release/RELEASE.json"), { version: "1.2.2", signer: signerPublicLine(seed) });
    const cases = [
      ["image.digest", (m) => { m.image.digest = null; }],
      ["image.digest", (m) => { m.image.digest = "sha256:" + "ab".repeat(31); }],
      ["image.repository", (m) => { delete m.image.repository; }],
      ["image.schedulingPolicy", (m) => { m.image.schedulingPolicy = "regional"; }],
      ["class_name", (m) => { delete m.class_name; }],
      ["max_instances", (m) => { m.max_instances = 0; }],
      ["bind", (m) => { m.bind = [{ member: "no-such-worker", binding: "RUNNER" }]; }],
      ["class_name, max_instances", (m) => { delete m.class_name; delete m.max_instances; }],
    ];
    for (const [field, mutate] of cases) {
      const m = JSON.parse(good);
      mutate(m);
      writeJson(marker, m);
      const before = snapshot(root);
      const r = assemble(root, ["--sign"], { BIO_RELEASE_SEED: seed, ...SIGNING });
      refused(r, "CONTAINER_UNDESCRIBED");
      assert.ok(r.stderr.includes(`runner is a container member and its fleet-member.json does not state ${field}.`), `${field}:\n${r.stderr}`);
      assert.doesNotMatch(r.stdout, /guard: /, `${field}: refused before any build ran`);
      assert.deepEqual(snapshot(root), before, `${field}: nothing written`);
    }
    writeFileSync(marker, good);
    assert.equal(assemble(root, ["--dry-run"]).status, 0, "restored, it assembles");
  } finally { rm(root); }
});

test("R25: a container member that declares no Worker bundle is left out of the release by name (K1730), and the fleet signature covers only what ships", async () => {
  const root = await makeRepo({ build: false });
  try {
    addContainerMember(root, "runner", { bundle: false, marker: { image: { repository: "docker.io/civicos/runner", digest: null } } });
    await buildAll(root);
    const { payload, members } = expectedPayload(root);
    assert.deepEqual(members.map((m) => m.member), ["alpha-worker", "beta-worker"]);
    const dry = assemble(root, ["--dry-run"]);
    assert.equal(dry.status, 0, dry.stdout + dry.stderr);
    assert.match(dry.stdout, /left out: runner — a container member with no Worker bundle to host its class/);
    assert.ok(dry.stdout.includes(payload), "the payload names no runner");
    assert.doesNotMatch(payload, /runner/);
    assert.match(dry.stdout, /would carry 3 assets/);

    const seed = envelope(), signer = signerPublicLine(seed);
    writeJson(join(root, "release/RELEASE.json"), { version: "1.2.2", signer });
    const r = assemble(root, ["--sign"], { BIO_RELEASE_SEED: seed, ...SIGNING });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.deepEqual(readJson(join(root, "release/RELEASE.json")).fleet.map((e) => e.member), ["alpha-worker", "beta-worker"]);
    assert.equal(existsSync(join(root, "release/runner")), false);

    /* A hosted container member may not bind a member the release leaves out. */
    addContainerMember(root, "hosted", { marker: { bind: [{ member: "runner", binding: "X" }] } });
    await buildAll(root);
    const bad = assemble(root, ["--dry-run"]);
    refused(bad, "CONTAINER_UNDESCRIBED");
    assert.match(bad.stderr, /hosted is a container member and its fleet-member\.json does not state bind\./);
  } finally { rm(root); }
});

const containerStub = (extra = {}) => ({ subdomain: "sub", containers: 200, scripts: { [SLUG]: {} },
  serving: { runner: JSON.stringify({ version: VERSION }) }, ...extra });

test("R26: deploy-fleet pushes a container member's image to Cloudflare's registry with the account's token, by digest, then deploys its Worker and container from its own config with the pushed image", async () => {
  const root = await makeRepo({ build: false });
  try {
    addContainerMember(root, "runner");
    const tracked = join(root, "runner/wrangler.jsonc");
    const trackedBefore = readFileSync(tracked);
    const r = fleet(root, ["runner", "--instance", SLUG], { stub: containerStub() });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const ref = `docker.io/civicos/runner@${DIGEST}`, tag = `runner:${"ab".repeat(6)}`;
    assert.deepEqual(r.docker.map((d) => d.args), [["pull", ref], ["tag", ref, tag]], "pulled by digest, tagged by digest");
    assert.equal(r.wrangler.length, 2);
    assert.deepEqual(r.wrangler[0].args, ["containers", "push", tag]);
    assert.equal(r.wrangler[0].token, "present", "pushed with the account's token");
    assert.deepEqual(r.wrangler[1].args.slice(0, 2), ["deploy", "-c"]);
    const want = parseJsonc(trackedBefore.toString());
    want.containers = want.containers.map((c) => ({ ...c, image: `registry.cloudflare.com/${ACCOUNT}/${tag}` }));
    assert.deepEqual(JSON.parse(r.wrangler[1].config), want, "its own config, the container naming the project's pushed copy");
    for (const w of r.wrangler) assert.equal(realpathSync(w.cwd), realpathSync(join(root, "runner")));
    assert.ok(readFileSync(tracked).equals(trackedBefore), "the tracked config is never written");
    assert.equal(existsSync(join(root, "runner/.wrangler.deploy.generated.json")), false);
    assert.ok(r.calls.some((c) => c.url.endsWith(`/accounts/${ACCOUNT}/containers/applications`) && c.bearer));
    assert.match(r.stdout, /preflight: Containers reachable/);
    assert.match(r.stdout, /rollout: runner serving 1\.2\.3 after/);
    assert.ok(!(r.stdout + r.stderr).includes("cf-secret-token-value"), "the token is never printed");
  } finally { rm(root); }
});

test("R26: a token that cannot reach Containers is refused CONTAINERS_UNREACHABLE, naming what the account lacks, before anything is pushed or deployed; --dry-run pushes and deploys nothing", async () => {
  const root = await makeRepo({ build: false });
  try {
    addContainerMember(root, "runner");
    for (const stub of [containerStub({ containers: 403 }), containerStub({ containers: 401 }), containerStub({ containers: 500 }),
      containerStub({ unreachable: ["/containers/"] })]) {
      for (const args of [["runner", "--instance", SLUG], ["runner", "--instance", SLUG, "--dry-run"]]) {
        const r = fleet(root, args, { stub });
        refused(r, "CONTAINERS_UNREACHABLE");
        assert.match(r.stderr, new RegExp(`cannot reach Containers in account ${ACCOUNT}`));
        assert.match(r.stderr, /needs the Containers edit permission/);
        assert.deepEqual([r.docker, r.wrangler], [[], []], "nothing pulled, pushed or deployed");
      }
    }
    const dry = fleet(root, ["runner", "--instance", SLUG, "--dry-run"], { stub: containerStub() });
    assert.equal(dry.status, 0, dry.stderr);
    assert.match(dry.stdout, /--dry-run: nothing was pushed or deployed/);
    assert.deepEqual([dry.docker, dry.wrangler], [[], []]);
    /* A worker member never asks for Containers. */
    const w = fleet(root, ["alpha-worker", "--instance", SLUG, "--dry-run"], { stub: containerStub({ containers: 403 }) });
    assert.equal(w.status, 0, w.stderr);
    assert.ok(!w.calls.some((c) => c.url.includes("/containers/")));
  } finally { rm(root); }
});

test("R26: a container member with no pinned digest, or whose config declares no container, is refused CONTAINER_UNDESCRIBED before any request; a failed pull or push exits with its status and deploys nothing", async () => {
  const root = await makeRepo({ build: false });
  try {
    addContainerMember(root, "runner", { marker: { image: { repository: "docker.io/civicos/runner", digest: null } } });
    const nodigest = fleet(root, ["runner", "--instance", SLUG, "--dry-run"], { stub: containerStub() });
    refused(nodigest, "CONTAINER_UNDESCRIBED");
    assert.match(nodigest.stderr, /does not state image\.digest/);
    assert.deepEqual([nodigest.calls, nodigest.docker, nodigest.wrangler], [[], [], []]);

    addContainerMember(root, "plain", { containers: false });
    const noconf = fleet(root, ["plain", "--instance", SLUG], { stub: containerStub() });
    refused(noconf, "CONTAINER_UNDESCRIBED");
    assert.match(noconf.stderr, /plain is a container member and its wrangler\.jsonc declares no `containers`/);
    assert.deepEqual([noconf.calls, noconf.docker, noconf.wrangler], [[], [], []]);

    addContainerMember(root, "runner");
    const gen = join(root, "runner/.wrangler.deploy.generated.json");
    const pull = fleet(root, ["runner", "--instance", SLUG], { env: { CF_TOKEN: "t", DOCKER_EXIT: "4" }, stub: containerStub() });
    assert.equal(pull.status, 4, "the pull's failure is the exit");
    assert.match(pull.stderr, /Nothing was deployed/);
    assert.equal(pull.docker.length, 1);
    assert.deepEqual(pull.wrangler, []);
    const push = fleet(root, ["runner", "--instance", SLUG], { env: { CF_TOKEN: "t", WRANGLER_EXIT: "6" }, stub: containerStub() });
    assert.equal(push.status, 6, "the push's failure is the exit");
    assert.deepEqual(push.wrangler.map((w) => w.args[0]), ["containers"], "no deploy after a failed push");
    assert.equal(existsSync(gen), false);
  } finally { rm(root); }
});

/* ------------------------------------------- R25, R26: a member with two classes (T36-2) */

test("R25: a container member with two classes carries one Container part per class, container/<class>.json, each its own image, covered by the fleet signature and written under <member>/", async () => {
  const root = await makeRepo({ build: false });
  try {
    addScannerMember(root, "scanner");
    await buildAll(root);
    const { payload, members, bufs } = expectedPayload(root);
    const scanner = members.find((m) => m.member === "scanner");
    assert.deepEqual(scanner.parts.map((p) => [p.path, p.type]),
      [["container/FileScanner.json", "Container"], ["container/SafeViewRenderer.json", "Container"]]);
    assert.equal(JSON.parse(bufs["scanner/container/FileScanner.json"]).image, `docker.io/civicos/file-scanner@${DIGEST_A}`);
    assert.equal(JSON.parse(bufs["scanner/container/SafeViewRenderer.json"]).image, `docker.io/civicos/safe-view@${DIGEST_B}`);
    for (const p of scanner.parts) assert.ok(payload.includes(`${p.path}:Container:${p.sha256}:${p.bytes}`), p.path);

    const dry = assemble(root, ["--dry-run"]);
    assert.equal(dry.status, 0, dry.stdout + dry.stderr);
    assert.ok(dry.stdout.includes(payload), "the payload the fleet signature covers carries both descriptors' hashes");

    const seed = envelope(), signer = signerPublicLine(seed);
    writeJson(join(root, "release/RELEASE.json"), { version: "1.2.2", signer });
    const r = assemble(root, ["--sign"], { BIO_RELEASE_SEED: seed, ...SIGNING });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const rel = readJson(join(root, "release/RELEASE.json"));
    assert.deepEqual(rel.fleet, members);
    for (const c of ["FileScanner", "SafeViewRenderer"])
      assert.ok(readFileSync(join(root, `release/scanner/container/${c}.json`)).equals(bufs[`scanner/container/${c}.json`]), c);
    assert.equal(existsSync(join(root, "release/scanner/container.json")), false, "no one-class part beside them");
    assert.ok(sshVerify(signer, rel.fleetSig, Buffer.from(payload), NS_FLEET));
  } finally { rm(root); }
});

test("R25: a class of a two-class member lacking a field is refused CONTAINER_UNDESCRIBED naming the class and the field, before anything is built or written", async () => {
  const root = await makeRepo({ build: false });
  try {
    addScannerMember(root, "scanner");
    await buildAll(root);
    const marker = join(root, "scanner/fleet-member.json");
    const good = readFileSync(marker);
    const cases = [
      ["for its class SafeViewRenderer, image.digest", (m) => { m.containers[1].image.digest = null; }],
      ["for its class FileScanner, max_instances", (m) => { m.containers[0].max_instances = 0; }],
      ["for its class FileScanner, bind", (m) => { delete m.bind; }],
      ["for its class FileScanner, class_name", (m) => { m.containers[1].class_name = "FileScanner"; }],
    ];
    for (const [named, mutate] of cases) {
      const m = JSON.parse(good);
      mutate(m);
      writeJson(marker, m);
      const before = snapshot(root);
      const r = assemble(root, ["--dry-run"]);
      refused(r, "CONTAINER_UNDESCRIBED");
      assert.ok(r.stderr.includes(`scanner is a container member and its fleet-member.json does not state, ${named}.`), `${named}:\n${r.stderr}`);
      assert.doesNotMatch(r.stdout, /guard: /, `${named}: refused before any build ran`);
      assert.deepEqual(snapshot(root), before, `${named}: nothing written`);
    }
    writeFileSync(marker, good);
    assert.equal(assemble(root, ["--dry-run"]).status, 0, "restored, it assembles");
  } finally { rm(root); }
});

test("R26: deploy-fleet pushes each class's image of a two-class member by digest and points each of its config's containers at its own class's pushed copy", async () => {
  const root = await makeRepo({ build: false });
  try {
    addScannerMember(root, "scanner");
    const tracked = join(root, "scanner/wrangler.jsonc");
    const trackedBefore = readFileSync(tracked);
    const r = fleet(root, ["scanner", "--instance", SLUG], { stub: containerStub({ serving: { scanner: JSON.stringify({ version: VERSION }) } }) });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const refA = `docker.io/civicos/file-scanner@${DIGEST_A}`, refB = `docker.io/civicos/safe-view@${DIGEST_B}`;
    const tagA = `scanner-filescanner:${"c3".repeat(6)}`, tagB = `scanner-safeviewrenderer:${"d4".repeat(6)}`;
    assert.deepEqual(r.docker.map((d) => d.args), [["pull", refA], ["tag", refA, tagA], ["pull", refB], ["tag", refB, tagB]]);
    assert.deepEqual(r.wrangler.map((w) => w.args.slice(0, 3)), [["containers", "push", tagA], ["containers", "push", tagB], ["deploy", "-c", r.wrangler[2].args[2]]]);
    const want = parseJsonc(trackedBefore.toString());
    want.containers = want.containers.map((c) => ({ ...c, image: `registry.cloudflare.com/${ACCOUNT}/${c.class_name === "FileScanner" ? tagA : tagB}` }));
    assert.deepEqual(JSON.parse(r.wrangler[2].config), want, "each class's container names its own pushed copy");
    assert.ok(readFileSync(tracked).equals(trackedBefore), "the tracked config is never written");
  } finally { rm(root); }
});

test("R26: a two-class member whose class states no digest, or whose config's containers and marker's classes disagree, is refused CONTAINER_UNDESCRIBED before any request", async () => {
  const root = await makeRepo({ build: false });
  try {
    const cls = scannerClasses();
    cls[1].image.digest = null;
    addScannerMember(root, "scanner", { classes: cls });
    const nod = fleet(root, ["scanner", "--instance", SLUG, "--dry-run"], { stub: containerStub() });
    refused(nod, "CONTAINER_UNDESCRIBED");
    assert.match(nod.stderr, /does not state, for its class SafeViewRenderer, image\.digest/);
    assert.deepEqual([nod.calls, nod.docker, nod.wrangler], [[], [], []]);

    addScannerMember(root, "scanner");
    const cfgPath = join(root, "scanner/wrangler.jsonc");
    const cfg = parseJsonc(readFileSync(cfgPath, "utf8"));
    writeJson(cfgPath, { ...cfg, containers: [cfg.containers[0], { ...cfg.containers[1], class_name: "Renderer" }] });
    const dis = fleet(root, ["scanner", "--instance", SLUG], { stub: containerStub() });
    refused(dis, "CONTAINER_UNDESCRIBED");
    assert.match(dis.stderr, /the config names Renderer, which the marker states no image for; the marker's SafeViewRenderer has no container in the config/);
    assert.deepEqual([dis.calls, dis.docker, dis.wrangler], [[], [], []]);
  } finally { rm(root); }
});

/* ------------------------------------------------------- R25: a member's Worker part (N772, K2155) */

/** Rewrites a fixture member's wrangler.jsonc with `change` applied to its parsed config. */
const editConfig = (root, member, change) => {
  const p = join(root, member, "wrangler.jsonc");
  const c = parseJsonc(readFileSync(p, "utf8"));
  change(c);
  writeJson(p, c);
};

test("R25: a member whose wrangler.jsonc binds R2 buckets or states crons carries one Worker part, worker.json, each bucket by its role and the crons as stated, covered by the fleet signature, written under <member>/ and listed; a member with neither carries none", async () => {
  const root = await makeRepo({ build: false, members: { "alpha-worker": {}, "beta-worker": { assets: { "assets/model.bin": "MODEL-1" } },
    "gamma-worker": {}, "delta-worker": {} } });
  try {
    editConfig(root, "alpha-worker", (c) => { c.r2_buckets = [{ binding: "CAPTURES", bucket_name: "bio-captures" },
      { binding: "PUBLISHED", bucket_name: "bio-published" }]; c.triggers = { crons: ["17 4 * * *", "0 */6 * * *"] }; });
    editConfig(root, "beta-worker", (c) => { c.r2_buckets = [{ binding: "CAPTURES", bucket_name: "bio-captures" }]; });
    editConfig(root, "gamma-worker", (c) => { c.triggers = { crons: ["5 1 * * 1"] }; });
    editConfig(root, "delta-worker", (c) => { c.r2_buckets = []; c.triggers = { crons: [] }; });
    addScannerMember(root, "scanner");
    editConfig(root, "scanner", (c) => { c.r2_buckets = [{ binding: "CAPTURES", bucket_name: "bio-captures" }]; c.triggers = { crons: ["17 4 * * *"] }; });
    await buildAll(root);
    const { payload, members, bufs } = expectedPayload(root);
    const part = (m) => JSON.parse(bufs[`${m}/worker.json`]);
    assert.deepEqual(part("alpha-worker"), { r2_buckets: [{ binding: "CAPTURES", bucket: "captures" }, { binding: "PUBLISHED", bucket: "published" }],
      crons: ["17 4 * * *", "0 */6 * * *"] });
    assert.deepEqual(part("beta-worker"), { r2_buckets: [{ binding: "CAPTURES", bucket: "captures" }], crons: [] }, "buckets alone");
    assert.deepEqual(part("gamma-worker"), { r2_buckets: [], crons: ["5 1 * * 1"] }, "crons alone");
    assert.deepEqual(Object.keys(part("alpha-worker")), ["r2_buckets", "crons"]);
    assert.equal(bufs["delta-worker/worker.json"], undefined, "empty lists: no part");
    assert.ok(!JSON.stringify(Object.keys(bufs).filter((k) => k.endsWith("worker.json")).map((k) => bufs[k].toString())).includes("bio-captures"),
      "never the account's bucket name");
    assert.deepEqual(members.find((m) => m.member === "scanner").parts.map((p) => [p.path, p.type]),
      [["container/FileScanner.json", "Container"], ["container/SafeViewRenderer.json", "Container"], ["worker.json", "Worker"]],
      "a container member carries both");
    assert.deepEqual(members.find((m) => m.member === "beta-worker").parts.map((p) => p.path), ["assets/model.bin", "worker.json"]);
    assert.match(payload, /^bio-release-fleet\/2\n/, "the statement's format is unchanged");
    for (const m of ["alpha-worker", "beta-worker", "gamma-worker", "scanner"]) {
      const p = members.find((x) => x.member === m).parts.find((x) => x.path === "worker.json");
      assert.match(payload, new RegExp(`^member ${m} .*worker\\.json:Worker:${p.sha256}:${p.bytes}`, "m"), `${m}: in the signed payload`);
    }
    assert.doesNotMatch(payload, /^member delta-worker .*worker\.json/m);

    const dry = assemble(root, ["--dry-run"]);
    assert.equal(dry.status, 0, dry.stdout + dry.stderr);
    assert.ok(dry.stdout.includes(payload), "the payload the fleet signature covers carries each Worker part's hash");

    const seed = envelope(), signer = signerPublicLine(seed);
    writeJson(join(root, "release/RELEASE.json"), { version: "1.2.2", signer });
    const r = assemble(root, ["--sign"], { BIO_RELEASE_SEED: seed, ...SIGNING });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const rel = readJson(join(root, "release/RELEASE.json"));
    assert.deepEqual(rel.fleet, members);
    assert.ok(sshVerify(signer, rel.fleetSig, Buffer.from(payload), NS_FLEET));
    for (const m of ["alpha-worker", "beta-worker", "gamma-worker", "scanner"])
      assert.ok(readFileSync(join(root, `release/${m}/worker.json`)).equals(bufs[`${m}/worker.json`]), `${m}: the exact bytes hashed`);
    assert.equal(existsSync(join(root, "release/delta-worker/worker.json")), false);
    for (const m of ["alpha-worker", "scanner"]) assert.equal(existsSync(join(root, m, "worker.json")), false, "never written into the member's tree");

    /* The installer's own reading of the part (newgroup's workerDescriptor, its R44) takes it as written. */
    const ng = await import(pathToFileURL(join(PLANE, "..", "newgroup/src/index.mjs")).href);
    assert.deepEqual(ng.workerDescriptor(readFileSync(join(root, "release/alpha-worker/worker.json"))), { ok: true, d: part("alpha-worker") });
    assert.deepEqual(ng.workerDescriptor(readFileSync(join(root, "release/scanner/worker.json"))), { ok: true, d: part("scanner") });
  } finally { rm(root); }
});

test("R25: a bucket whose role is neither captures nor published is refused WORKER_UNDESCRIBED naming the binding, as is a list that is not one, before anything is built or written; a declared part at worker.json is refused", async () => {
  const root = await makeRepo();
  try {
    const cfgPath = join(root, "alpha-worker/wrangler.jsonc");
    const good = readFileSync(cfgPath);
    const cases = [
      ["ARCHIVE", (c) => { c.r2_buckets = [{ binding: "CAPTURES", bucket_name: "bio-captures" }, { binding: "ARCHIVE", bucket_name: "my-archive" }]; }],
      ["CAPTURES, PUBLISHED", (c) => { c.r2_buckets = [{ binding: "CAPTURES", bucket_name: "acct-captures" }, { binding: "PUBLISHED" }]; }],
      ["(an R2 bucket binding with no name)", (c) => { c.r2_buckets = [{ bucket_name: "bio-captures" }]; }],
      ["r2_buckets", (c) => { c.r2_buckets = { binding: "CAPTURES", bucket_name: "bio-captures" }; }],
      ["triggers.crons", (c) => { c.triggers = { crons: "17 4 * * *" }; }],
      ["triggers.crons", (c) => { c.triggers = { crons: ["17 4 * * *", ""] }; }],
      ["triggers.crons", (c) => { c.triggers = ["17 4 * * *"]; }],
    ];
    for (const [named, change] of cases) {
      editConfig(root, "alpha-worker", change);
      const before = snapshot(root);
      const r = assemble(root, ["--dry-run"]);
      refused(r, "WORKER_UNDESCRIBED");
      assert.ok(r.stderr.includes(`alpha-worker's wrangler.jsonc does not state, as the release's Worker part needs, ${named}.`), `${named}:\n${r.stderr}`);
      assert.doesNotMatch(r.stdout, /guard: /, `${named}: refused before any build ran`);
      assert.deepEqual(snapshot(root), before, `${named}: nothing written`);
      writeFileSync(cfgPath, good);
    }
    assert.equal(assemble(root, ["--dry-run"]).status, 0, "restored, it assembles");

    /* A member's own upload part may not take the Worker part's path. */
    editConfig(root, "beta-worker", (c) => { c.r2_buckets = [{ binding: "CAPTURES", bucket_name: "bio-captures" }];
      c.rules.push({ type: "Data", globs: ["worker.json"] }); });
    const mk = join(root, "beta-worker/fleet-member.json");
    const marker = readJson(mk);
    marker.bundle.assets.push("worker.json");
    writeJson(mk, marker);
    writeFileSync(join(root, "beta-worker/worker.json"), "{}");
    await buildAll(root);
    const before = snapshot(root);
    const clash = assemble(root, ["--dry-run"]);
    refused(clash, "WORKER_UNDESCRIBED");
    assert.match(clash.stderr, /beta-worker declares an upload part named worker\.json, which is the Worker part's own path\./);
    assert.deepEqual(snapshot(root), before, "nothing written");
  } finally { rm(root); }
});

/* ------------------------------------------------------------------------ R30 */

const ENVSPY = join(import.meta.dirname, "envspy.mjs");

test("R30: --sign outside the GitHub Actions signing environment is refused NOT_SIGNING_ENVIRONMENT before the seed is read, before any build, writing nothing", async () => {
  const root = await makeRepo();
  try {
    const seed = envelope();
    writeJson(join(root, "release/RELEASE.json"), { version: "1.2.2", signer: signerPublicLine(seed) });
    const before = snapshot(root);
    for (const env of [{ BIO_RELEASE_SEED: seed }, { BIO_RELEASE_SEED: "not-an-envelope" }, {}, { BIO_RELEASE_SEED: seed, GITHUB_ACTIONS: "false" }]) {
      const r = assemble(root, ["--sign"], env);
      refused(r, "NOT_SIGNING_ENVIRONMENT");
      assert.equal(r.status, 1);
      assert.doesNotMatch(r.stderr, /NO_SEED|SIGNING_FAILED/, "refused before the seed is looked at: neither its absence nor its shape is reached");
      assert.doesNotMatch(r.stdout, /guard: |signed:/, "before any build, and nothing signed");
      assert.ok(!(r.stdout + r.stderr).includes(seed.split(".")[2]), "the seed is never printed");
      assert.deepEqual(snapshot(root), before, "nothing written");
    }
  } finally { rm(root); }
});

test("R30: no command a session runs reads BIO_RELEASE_SEED or writes a signature: assembly, the payload and plane asset it writes, completion from signatures made elsewhere, the refused --sign, the bundle survey and the advisory report", async () => {
  const root = await makeRepo();
  const work = mkdtempSync(join(tmpdir(), "bundler-r30-"));
  try {
    const seed = envelope(), signer = signerPublicLine(seed);
    const { payload, plane } = expectedPayload(root);
    writeJson(join(root, "release/RELEASE.json"), { version: "1.2.2", signer });
    /* The signatures, made "in the signing environment": here, by the test with a throwaway key. */
    writeFileSync(join(work, "fleet.sig"), signSshsig(seed, payload, NS_FLEET));
    writeFileSync(join(work, "plane.sig"), signSshsig(seed, plane.buf, NS_RELEASE));
    writeJson(join(work, "osv.json"), {});
    const spy = join(work, "spy.log");
    const session = [
      ["bio-plane/scripts/release-assemble.mjs", "--dry-run"],
      ["bio-plane/scripts/release-assemble.mjs", "--version", VERSION, "--emit-payload", join(work, "p.txt"), "--emit-plane", join(work, "plane.mjs")],
      ["bio-plane/scripts/release-assemble.mjs", "--sign"],
      ["bio-plane/scripts/release-assemble.mjs", "--version", VERSION, "--fleet-sig", join(work, "fleet.sig"), "--plane-sig", join(work, "plane.sig")],
      ["bio-plane/scripts/bundles.mjs", "--check"],
      ["bio-plane/scripts/bundles.mjs", "--install-dirs"],
      ["--import", join(import.meta.dirname, "osvstub.mjs"), "bio-plane/scripts/release-advisories.mjs"],
    ];
    for (const args of session) {
      const r = run(root, ".", ["--import", ENVSPY, ...args], { env: { BIO_RELEASE_SEED: seed, ENV_SPY_LOG: spy, OSV_STUB: join(work, "osv.json") } });
      const asked = existsSync(spy) ? readFileSync(spy, "utf8") : "";
      assert.equal(asked, "", `${args.join(" ")} asked for BIO_RELEASE_SEED:\n${asked}`);
      assert.ok(!(r.stdout + r.stderr).includes("BEGIN SSH SIGNATURE"), `${args.join(" ")} printed no signature`);
      assert.ok(!(r.stdout + r.stderr).includes(seed.split(".")[2]), "the seed is never printed");
    }
    /* The completion wrote the release from the signatures it was given, never from ones it made. */
    const rel = readJson(join(root, "release/RELEASE.json"));
    assert.equal(rel.sig, readFileSync(join(work, "plane.sig"), "utf8"));
    assert.equal(rel.fleetSig, readFileSync(join(work, "fleet.sig"), "utf8"));
  } finally { rm(root); rmSync(work, { recursive: true, force: true }); }
});

test("R30: assembly writes what is to be signed — the fleet payload and the plane asset, exactly — without the seed, and nothing in the repository", async () => {
  const root = await makeRepo();
  const work = mkdtempSync(join(tmpdir(), "bundler-r30w-"));
  try {
    const { payload, plane } = expectedPayload(root);
    const before = snapshot(root);
    const r = assemble(root, ["--version", VERSION, "--dry-run", "--emit-payload", join(work, "p.txt"), "--emit-plane", join(work, "plane.mjs")]);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.equal(readFileSync(join(work, "p.txt"), "utf8"), payload, "the payload signed in bio-release-fleet");
    assert.ok(readFileSync(join(work, "plane.mjs")).equals(plane.buf), "the plane asset signed in bio-release, byte for byte");
    assert.match(r.stdout, new RegExp(`plane asset written to ${join(work, "plane.mjs").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
    assert.deepEqual(snapshot(root), before, "nothing in the repository written");
  } finally { rm(root); rmSync(work, { recursive: true, force: true }); }
});

test("R30: a release is completed from signatures made elsewhere only when R23's checks accept them: --plane-sig and --fleet-sig, each verified by stock ssh-keygen for the release's signer", async () => {
  const root = await makeRepo();
  const work = mkdtempSync(join(tmpdir(), "bundler-r30c-"));
  try {
    const seed = envelope(), signer = signerPublicLine(seed), other = envelope();
    const { payload, plane } = expectedPayload(root);
    const relPath = join(root, "release/RELEASE.json");
    const fsig = join(work, "fleet.sig"), psig = join(work, "plane.sig");
    writeFileSync(fsig, signSshsig(seed, payload, NS_FLEET));
    const attempt = (planeSig, extra = []) => {
      writeJson(relPath, { version: "1.2.2", signer, sig: signSshsig(seed, Buffer.from("an older plane"), NS_RELEASE) });
      writeFileSync(psig, planeSig);
      const before = snapshot(root);
      const r = assemble(root, ["--version", VERSION, "--fleet-sig", fsig, "--plane-sig", psig, ...extra]);
      return { r, unchanged: JSON.stringify(snapshot(root)) === JSON.stringify(before) };
    };
    for (const [why, sig] of [["another key", signSshsig(other, plane.buf, NS_RELEASE)], ["another namespace", signSshsig(seed, plane.buf, NS_FLEET)],
      ["other bytes", signSshsig(seed, Buffer.from("not the plane"), NS_RELEASE)]]) {
      const { r, unchanged } = attempt(sig);
      refused(r, "PLANE_SIG_DOES_NOT_COVER_ASSET");
      assert.ok(unchanged, `${why}: nothing written`);
    }
    writeFileSync(fsig, signSshsig(other, payload, NS_FLEET));
    const badFleet = attempt(signSshsig(seed, plane.buf, NS_RELEASE));
    refused(badFleet.r, "FLEET_SIG_REJECTED");
    assert.ok(badFleet.unchanged);
    writeFileSync(fsig, signSshsig(seed, payload, NS_FLEET));
    const good = signSshsig(seed, plane.buf, NS_RELEASE);
    const { r } = attempt(good);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const rel = readJson(relPath);
    assert.equal(rel.sig, good, "--plane-sig, not RELEASE.json's older sig");
    assert.ok(sshVerify(signer, rel.sig, plane.buf, NS_RELEASE) && sshVerify(signer, rel.fleetSig, Buffer.from(payload), NS_FLEET));
  } finally { rm(root); rmSync(work, { recursive: true, force: true }); }
});

test("R30: the commands the signing workflow calls, in order, by their usage lines: the installs listed, the dry run, then --sign in the signing environment completes the release", async () => {
  const root = await makeRepo({ members: { "alpha-worker": {}, "beta-worker": { assets: { "assets/model.bin": "MODEL-1" } }, "gamma-worker": { vendored: true } } });
  try {
    /* 1–2: the plane's install, then the directories the byte guard needs, derived from discovery. */
    const inst = run(root, ".", ["bio-plane/scripts/bundles.mjs", "--install-dirs"]);
    assert.equal(inst.status, 0, inst.stderr);
    assert.deepEqual(inst.stdout.trim().split("\n"), ["bio-plane", "gamma-worker"], "the plane first, then each guarded member with a lockfile");
    /* 3: every R22 check, nothing written. */
    const before = snapshot(root);
    const dry = assemble(root, ["--version", VERSION, "--dry-run"]);
    assert.equal(dry.status, 0, dry.stdout + dry.stderr);
    assert.deepEqual(snapshot(root), before);
    /* 4: in the signing environment, signed, verified, written. */
    const seed = envelope(), signer = signerPublicLine(seed);
    writeJson(join(root, "release/RELEASE.json"), { version: "1.2.2", signer });
    const r = assemble(root, ["--version", VERSION, "--sign"], { BIO_RELEASE_SEED: seed, ...SIGNING });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const { payload, plane } = expectedPayload(root);
    const rel = readJson(join(root, "release/RELEASE.json"));
    assert.ok(sshVerify(signer, rel.sig, plane.buf, NS_RELEASE) && sshVerify(signer, rel.fleetSig, Buffer.from(payload), NS_FLEET));
  } finally { rm(root); }
});
