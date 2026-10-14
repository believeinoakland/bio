/* T47's L11 fold (K3100): the installer's pages in the member interface's visual language. R50 the first page and Before
 * Cloudflare, R51 the progress lines, the stops and the finished panel, R52 the update page, R53 interface-assets'
 * stylesheet and faces, carried in the bundle and served by the installer itself. Each test drives the Worker at its
 * interface (its routes, its streamed page read as the browser's script reads it, and the pages' own script run against
 * a stand-in for the elements it touches), against the stateful fake account in fixture.mjs. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { CFG } from "../src/index.mjs";
import { HOSTING_CONTROL } from "../../bio-plane/src/setup-fleet.mjs";
import { ASSET_FILES } from "../../bio-plane/src/interface-assets/index.mjs";
import { PROFILE_CHOICES, ALLOWED, BEFORE_CLOUDFLARE_CONTROL, STYLESHEET, ASSET_PREFIX, UPDATE_KEEPS, LEFT_OUT, PAGE_CSS } from "../src/ui.mjs";
import { RELEASE_VERSION } from "../src/release.mjs";
import { pageWorld, req, run, begin, callback, script, realFetch, release, armWith, restoreSigners, SIGNER, bump, VPC_ID, jres } from "./fixture.mjs";

const text = async (path) => (await req(path)).text();
const NEXT = bump(RELEASE_VERSION);
const UPDATE_PATH = "/update?version=" + NEXT;
const escd = (x) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
/* The markup between an element's opening tag (found by its id) and the matching close of that tag. */
function section(page, id) {
  const open = new RegExp(`<([a-z0-9]+)\\b[^>]*\\bid="${id}"[^>]*>`).exec(page);
  if (!open) return null;
  const tag = open[1];
  let depth = 0;
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, "g");
  re.lastIndex = open.index;
  for (let m; (m = re.exec(page));) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return page.slice(open.index, m.index + m[0].length);
  }
  return null;
}
const controls = (html) => [...html.matchAll(/<(input|select|textarea)\b([^>]*)>/g)]
  .map((m) => `${m[1]}#${m[2].match(/\bid="([^"]+)"/)?.[1] ?? ""}${m[2].match(/\bname="([^"]+)"/) ? "[" + m[2].match(/\bname="([^"]+)"/)[1] + "]" : ""}`);
const words = (html) => html.replace(/<[^>]+>/g, " ").replace(/&#39;/g, "'").replace(/&ldquo;|&rdquo;/g, "\"").replace(/\s+/g, " ")
  .replace(/ ([.,])/g, "$1");

/* ---------------------------------------------------------------------------------------------------- R50 the first page */

test("R50 GET / asks only the permanent short name (R41's dialog) and the places (R21), with what is needed in one block (R23); then Before Cloudflare: what will be allowed in plain words, and R34's words; Continue to Cloudflare sends POST /begin", async () => {
  const home = await text("/");
  const choose = section(home, "stage-choose"), before = section(home, "stage-before");
  assert.ok(choose && before, "two stages");
  /* The first stage's asks: the short name and the places, nothing else. */
  assert.deepEqual(controls(choose), ["input#slug", ...PROFILE_CHOICES.map(() => "input#[profile]")]);
  assert.match(choose, /<h2>Your group's short name<\/h2>/);
  assert.match(choose, /<h2>Your group's places<\/h2>/);
  /* What is needed, in one block, before the asks: R23's prerequisites and (T46) the parts the carried release cannot install. */
  assert.equal([...home.matchAll(/<h2>What you need<\/h2>/g)].length, 1, "one block");
  const need = section(home, "need");
  assert.ok(choose.indexOf(need) >= 0 && choose.indexOf(need) < choose.indexOf('id="slug"'), "the block comes before the asks");
  for (const said of [/Workers Paid plan/, /\$5 a month/, /payment method on the account/, /Workers Containers permission/,
      /built-in file scanner and safe view/, /files are kept and shown but not scanned, and a high-risk file opens only in its safe view once one can be made/,
      /member's own Claude subscription/, /used only with an API key: a member's own, or your group's/])
    assert.match(words(need), said);
  if (LEFT_OUT) assert.ok(need.includes(LEFT_OUT), "the parts left out, in the same block");
  /* Before Cloudflare: hidden until the dialog's confirming act; what will be allowed, one plain line per scope R2 asks; R34's words. */
  assert.match(before, /^<div class="ng-stage" id="stage-before" hidden>/);
  assert.match(before, /<h1>Let this installer into your Cloudflare account<\/h1>/);
  assert.equal(ALLOWED.length, CFG.SCOPES.length, "one line for each scope asked");
  const allowed = section(before, "allowed");
  assert.deepEqual([...allowed.matchAll(/<li>([^<]*)<\/li>/g)].map((m) => m[1]), [...ALLOWED]);
  assert.ok(!/[a-z]+(?:-[a-z]+)*\.(write|read|bind)\b/.test(words(allowed)), "plain words, never a scope's code");
  const control = section(before, "control-before");
  assert.ok(control.includes(`<h2>${BEFORE_CLOUDFLARE_CONTROL}</h2>`));
  for (const s of HOSTING_CONTROL.sentences) assert.ok(control.includes(`<p>${escd(s)}</p>`), s);
  assert.match(before, /<button id="cloudflare" class="cs-btn" data-tone="primary">Continue to Cloudflare<\/button>/);
  /* The assistant's words (R37) and the optional Workers VPC field (R45) are on the page, folded and closed, never one of the first page's asks. */
  for (const id of ["about-assistant", "security-fold"]) {
    const fold = section(before, id);
    assert.ok(fold && /^<details class="ng-fold" id="[^"]+"><summary>/.test(fold) && !/^<details[^>]*\bopen\b/.test(fold), id);
  }
  assert.deepEqual(controls(before), ["input#vpc"]);
  assert.ok(section(before, "security-fold").includes('<input id="vpc"'));

  /* The behaviour: the short name's act opens the dialog; its confirming act draws Before Cloudflare; Continue to Cloudflare sends /begin, with the places in the order chosen and the VPC service named. */
  const w = pageWorld(home);
  w.el("slug").value = "river-keepers";
  await w.el("go").click();
  assert.equal(w.el("confirm").open, true);
  assert.deepEqual(w.sent, []);
  await w.el("confirm-yes").click();
  assert.deepEqual([w.sent, w.el("stage-before").hidden, w.el("stage-choose").hidden], [[], false, true]);
  await w.el("cloudflare").click();
  assert.deepEqual(w.sent.map((s) => [s.url, s.body.mode, s.body.slug]), [["/begin", "install", "river-keepers"]], "Continue to Cloudflare sends /begin");
  assert.deepEqual(w.sent[0].body.profiles, [], "no place chosen for the founder");
  assert.equal(w.location.href, "https://dash.cloudflare.com/oauth2/auth?x=1");
  /* Control: closing the dialog, or Back from Before Cloudflare, sends nothing, and Continue to Cloudflare before a confirmation sends nothing. */
  const c = pageWorld(home);
  c.el("slug").value = "river-keepers";
  await c.el("cloudflare").click();
  await c.el("go").click(); await c.el("confirm-no").click();
  await c.el("go").click(); await c.el("confirm-yes").click(); await c.el("back").click();
  await c.el("cloudflare").click();
  assert.deepEqual(c.sent, [], "nothing is sent without the confirming act and Continue to Cloudflare in that order");
  /* And what /begin answers is the permission R2 states: the page's act reaches Cloudflare with exactly R2's scopes. */
  const calls = script([]);
  const { j } = await begin("river-keepers", "install", { profiles: [], securityVpc: VPC_ID });
  globalThis.fetch = realFetch;
  assert.deepEqual(calls, []);
  assert.deepEqual(new URL(j.authorize).searchParams.get("scope").split(" "), CFG.SCOPES);
});

/* ------------------------------------------------------------------------------------------- R51 the progress page */

test("R51 the progress page draws one plain line per step as it starts and ends; a stop names the step, what to do, and \"nothing was created\" where R4 holds; the finished panel shows the checks, the one-time password and address once, the probe key behind \"most groups never need it\", and hands over to <address>/app/setup#boot=<password>", async () => {
  /* One line per step, drawn as it starts and redrawn as it ends: every step started ends, ok or not, and no step is drawn twice. */
  armWith(SIGNER.line);
  const fine = await run({ slug: "lines-ok", rel: await release({ version: NEXT }) });
  restoreSigners();
  for (const w of [fine]) {
    const started = w.page.events.filter((e) => e.k === "step").map((e) => e.id);
    assert.deepEqual(started, [...new Set(started)], "one line per step");
    for (const id of started) {
      const at = w.page.events.findIndex((e) => e.k === "step" && e.id === id);
      assert.ok(w.page.events.slice(at + 1).some((e) => e.id === id && (e.k === "ok" || e.k === "no")), `${id} ends`);
    }
  }
  /* The shell draws each line with its state in a word beside it, and the stop's box names the step. */
  assert.match(fine.raw, /<div id="log" class="cs-sheet ng-log"><\/div>/);
  assert.match(fine.raw, /const W=\{"go":"Now","ok":"Done","no":"Not done"\}/);
  assert.match(fine.raw, /\$\("#fail-s"\)\.textContent=s\?"Stopped at the step: "\+s:""/);

  /* The stops before `install` (R4): each names the step it stopped at (the line in progress), says nothing was created,
     and says what to do. */
  const stops = [["auth", { tokenFail: true }], ["acct", { accountsFail: true }], ["fresh", { settingsFail: true }],
    ["fresh", { pre: { "stop-fresh-taken": [] } }, "stop-fresh-taken"], ["fresh", { preBuckets: ["bio-captures"] }],
    ["plan", { plan: "free" }], ["plan", { plan: "unknown" }], ["r2", { r2: "refused" }]];
  for (const [step, opts, slug] of stops) {
    const w = await run({ slug: slug || `stop-${step}`, ...opts });
    const label = w.page.events.find((e) => e.k === "step" && e.id === step).label;
    assert.equal(w.page.failed.s, label, `${step}: the stop names its step`);
    assert.match(w.page.failed.p, /[Nn]othing was created/, `${step}: what happened`);
    assert.match(w.page.failed.d, /^To continue: \S/, `${step}: what to do`);
    assert.equal(w.page.done, null);
  }
  /* Control: a stop after the install (no address) names its step and what to do, and never says nothing was created. */
  const late = await run({ slug: "stop-late", enableFail: true });
  assert.equal(late.page.failed.s, late.page.events.find((e) => e.k === "step" && e.id === "addr").label);
  assert.doesNotMatch(`${late.page.failed.p} ${late.page.failed.d}`, /[Nn]othing was created/);
  assert.match(late.page.failed.d, /^To continue: /);

  /* The finished panel. */
  const done = fine.page.done;
  const boot = done.match(/id="out-boot">([^<]+)</)[1], url = done.match(/id="out-url">([^<]+)</)[1];
  assert.equal(url, "https://lines-ok.grp.workers.dev");
  assert.equal(fine.raw.split(boot).length - 1, 1, "the one-time password, once");
  assert.equal([...done.matchAll(/id="out-url"/g)].length, 1, "the address, once");
  assert.match(done, /<h2>Your one-time password: save it now<\/h2>/);
  /* The checks: each a line with its outcome in a word; all passed on a confirmed install. */
  const checks = section(done, "checks");
  const rows = [...checks.matchAll(/<div class="cs-row" data-r="([a-z]+)"><span class="mk">([^<]+)<\/span><span>([^<]+)<\/span>/g)];
  assert.equal(rows.length, 4);
  assert.deepEqual(rows.map((r) => r[2]), ["Passed", "Passed", "Passed", "Passed"]);
  assert.match(rows[0][3], /answers at its address/);
  assert.match(rows[1][3], new RegExp(`Every part runs release ${NEXT.replace(/\./g, "\\.")}`));
  assert.match(rows[2][3], /reads back as release/);
  assert.match(rows[3][3], /No log on your Cloudflare account records who opens which file/);
  assert.ok(done.indexOf('id="checks"') < done.indexOf('id="out-boot"'), "the checks, then the password");
  /* The probe key, folded behind "most groups never need it", closed. */
  const probe = section(done, "probe-fold");
  assert.match(probe, /^<details class="ng-fold" id="probe-fold"><summary>A probe key, for a monitoring service \(most groups never need it\)<\/summary>/);
  assert.match(probe, /id="out-probe">[^<]+</);
  assert.ok(!/id="out-probe"/.test(done.replace(probe, "")), "the probe key is nowhere else");
  /* The hand-over: to the setup screen, the password in the fragment, read from the panel at the click. */
  assert.ok(done.includes(`data-url="https://lines-ok.grp.workers.dev/app/setup"`));
  assert.ok(fine.raw.includes(`location.href=h.dataset.url+"#boot="+encodeURIComponent(document.getElementById("out-boot").textContent)`));
  assert.ok(!done.includes("#boot="), "the password rides in no address on the page");
  /* Controls: a check that did not pass says so in its own word. */
  const unread = await run({ slug: "checks-und", logpush: "refused" });
  const r2 = [...section(unread.page.done, "checks").matchAll(/<span class="mk">([^<]+)<\/span><span>([^<]+)<\/span>/g)];
  assert.equal(r2[3][1], "Undetermined");
  armWith(SIGNER.line);
  const lag = await run({ slug: "checks-lag", rel: await release({ version: NEXT }), copy: { storeVersion: "0.1.0" } });
  restoreSigners();
  const r3 = [...section(lag.page.done, "checks").matchAll(/<span class="mk">([^<]+)<\/span><span>([^<]+)<\/span>/g)];
  assert.equal(r3[1][1], "Not yet");
  const asleep = await run({ slug: "checks-asleep", copy: { selftest: () => jres({ ok: false }) } });
  const r4 = [...section(asleep.page.done, "checks").matchAll(/<span class="mk">([^<]+)<\/span>/g)].map((m) => m[1]);
  assert.deepEqual(r4.slice(0, 2), ["Not yet", "Not yet"]);
});

/* -------------------------------------------------------------------------------------------- R52 the update page */

test("R52 GET /update draws the version before and after and \"Continue to Cloudflare to update\"; a stop says your group's Civicsmith keeps running as it was", async () => {
  const upd = await text(UPDATE_PATH);
  const versions = section(upd, "versions");
  assert.match(words(section(versions, "version-before")), /Your group's Civicsmith: the release it runs now is read once Cloudflare lets this installer find it/);
  assert.ok(section(versions, "version-after").includes(`release ${NEXT}, the release chosen in your group&#39;s Settings › Updates`));
  assert.match(upd, /<button id="go" class="cs-btn" data-tone="primary">Continue to Cloudflare to update<\/button>/);
  assert.ok(upd.includes(UPDATE_KEEPS));
  assert.equal(UPDATE_KEEPS, "If a step stops, your group's Civicsmith keeps running as it was.");
  /* Once read, the version before and after are drawn: on the progress line and the last screen. */
  const planeBase = (slug, v) => [{ type: "durable_object_namespace", name: "STORE", class_name: "Store" },
    { type: "plain_text", name: "VERSION", text: v }, { type: "secret_text", name: "ADMIN_TOKEN", text: "admin-kept" },
    { type: "secret_text", name: "PROBE_TOKEN", text: "probe-kept" }, { type: "service", name: "SELF", service: slug }];
  armWith(SIGNER.line);
  const w = await run({ slug: "upd-ver", mode: "update", pre: { "upd-ver": planeBase("upd-ver", "0.70.0") }, rel: await release({ version: NEXT }) });
  restoreSigners();
  assert.equal(w.page.label("up"), `Putting release ${NEXT} in place…`);
  const v = section(w.page.done, "versions");
  assert.match(words(v), /Before Your group's Civicsmith ran release 0\.70\.0\./);
  assert.match(words(v), new RegExp(`After This update: release ${NEXT.replace(/\./g, "\\.")}, signed by Civicsmith\\.`));
  assert.match(w.page.done, /it ran 0\.70\.0\./);
  /* Control: a version before that could not be read is said so, never guessed. */
  const blind = await run({ slug: "upd-blind", mode: "update", pre: { "upd-blind": planeBase("upd-blind", "0.70.0") }, subdomain: null });
  assert.match(words(section(blind.page.done, "versions")), /The release your group's Civicsmith ran before could not be read\./);
  /* Every stop of an update says it keeps running as it was; the install's stops never say so. */
  for (const opts of [{ tokenFail: true }, { accountsFail: true }, {}, { refuseUpdate: true }]) {
    const slug = "upd-stop-" + (Object.keys(opts).join("").toLowerCase() || "none");
    const pre = opts.refuseUpdate ? { [slug]: planeBase(slug, "0.70.0") } : {};
    const s = await run({ slug, mode: "update", pre, ...opts });
    assert.ok(s.page.failed, JSON.stringify(opts));
    if (opts.refuseUpdate) {
      /* R55's stop: what stopped it, that it runs as before, and what to do (installer.update.stopped). */
      assert.match(s.page.failed.p, /runs release 0\.70\.0 as before; nothing changed\.$/);
      assert.match(s.page.failed.d, /^Try again; /);
      continue;
    }
    assert.ok(s.page.failed.p.endsWith(UPDATE_KEEPS), `${JSON.stringify(opts)}: ${s.page.failed.p}`);
    assert.match(s.page.failed.d, /^To continue: /);
  }
  const installStop = await run({ slug: "inst-stop", plan: "free" });
  assert.ok(!installStop.page.failed.p.includes(UPDATE_KEEPS));
});

/* -------------------------------------------------------------------------- R53 interface-assets' stylesheet and faces */

test("R53 the pages use interface-assets' stylesheet and faces, carried in the installer's bundle and served by it; no other origin (R35)", async () => {
  armWith(SIGNER.line);
  const streamed = await run({ slug: "styled", rel: await release({ version: NEXT }) });
  restoreSigners();
  const { cookie } = await begin("styled");
  const denied = await callback("error=access_denied", cookie);
  const pages = { "/": await text("/"), "/update": await text(UPDATE_PATH), "404": await text("/nowhere"), progress: streamed.raw, refusal: denied.raw };
  const sheet = ASSET_FILES["civicsmith.css"].body;
  const defined = new Set([...sheet.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
  const classes = new Set([...sheet.matchAll(/\.(cs-[a-z0-9-]+)/g)].map((m) => m[1]));
  for (const [where, page] of Object.entries(pages)) {
    /* Each page links interface-assets' stylesheet, on its own origin, and no other; its own layout is in the stylesheet's tokens. */
    assert.deepEqual([...page.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)].map((m) => m[0]), [`<link rel="stylesheet" href="${STYLESHEET}">`], where);
    assert.ok(page.includes('<link rel="icon" href="data:,">'), `${where}: its icon loads nothing`);
    assert.match(page, /<html lang="en" class="cs">/, where);
    /* Every cs- component it uses is the stylesheet's. */
    for (const [, cls] of page.matchAll(/class="([^"]*)"/g))
      for (const c of cls.split(/\s+/).filter((x) => x.startsWith("cs-"))) assert.ok(classes.has(c), `${where}: ${c}`);
  }
  for (const [, name] of PAGE_CSS.matchAll(/var\((--[a-z0-9-]+)\)/g)) assert.ok(defined.has(name), `PAGE_CSS's ${name} is the stylesheet's`);
  assert.equal(/#[0-9a-f]{3,8}\b/i.test(PAGE_CSS), false, "no colour of its own");
  /* The stylesheet draws a .cs-dialog as a grid, which would show R41's dialog before it is opened: the layout hides it while closed. */
  assert.match(sheet, /\.cs-dialog \{[^}]*display: grid/);
  assert.ok(PAGE_CSS.includes("dialog.cs-dialog:not([open]){display:none}"));
  /* The installer serves every file of interface-assets, byte for byte, with its type; the stylesheet's faces resolve to them. */
  for (const [name, f] of Object.entries(ASSET_FILES)) {
    const r = await req(ASSET_PREFIX + name);
    assert.equal(r.status, 200, name);
    assert.equal(r.headers.get("content-type").split(";")[0], f.type, name);
    const got = Buffer.from(await r.arrayBuffer());
    assert.ok(got.equals(f.encoding === "base64" ? Buffer.from(f.body, "base64") : Buffer.from(f.body, "utf8")), name);
    assert.equal(r.headers.get("set-cookie"), null);
  }
  const faces = [...sheet.matchAll(/url\("([^"]+)"\)/g)].map((m) => m[1]);
  assert.equal(faces.length, 15);
  for (const u of faces) assert.ok(u.startsWith(ASSET_PREFIX) && Object.hasOwn(ASSET_FILES, u.slice(ASSET_PREFIX.length)), u);
  /* Controls: a name the assets do not hold, and any method but GET, are R1's 404. */
  for (const [path, init] of [[ASSET_PREFIX + "fonts/other.woff2", {}], [ASSET_PREFIX + "../index.mjs", {}], [ASSET_PREFIX + "civicsmith.css", { method: "POST" }]]) {
    const r = await req(path, init);
    assert.equal(r.status, 404, path);
  }
  /* Carried in the bundle: the committed bundle holds the stylesheet's own text and every face. */
  const { readFileSync } = await import("node:fs");
  const bundle = readFileSync(new URL("../dist/newgroup.bundled.mjs", import.meta.url), "utf8");
  for (const [name, f] of Object.entries(ASSET_FILES)) {
    /* A face is its base64 as written; a text file, its lines as written that need no escaping in a string. */
    const lines = f.encoding === "base64" ? [f.body] : f.body.split("\n").filter((l) => l.length > 40 && !/["'`\\$]|[^\x20-\x7e]/.test(l));
    assert.ok(lines.length > 0 && lines.every((l) => bundle.includes(l)), name);
  }
});

/* ------------------------------------------------------------------------------- R54 the amendments of R1 and R41 (K3144) */

test("R54 R1's 404 excepts GET /app/assets/<name> for exactly ASSET_FILES' names, byte for byte with their type and an immutable cache header, storing nothing; nothing sends /begin before R41's confirming act, and R50's Continue to Cloudflare sends it; GET /update draws the release it installs, the version before and after drawn on the progress page and the finished panel; the finished panel draws no \"Run the checks again\"", async () => {
  /* R1's exception: exactly the names of ASSET_FILES, nothing else under the prefix, GET only. */
  const calls = script([]);
  for (const name of Object.keys(ASSET_FILES)) {
    const r = await req(ASSET_PREFIX + name);
    assert.equal(r.status, 200, name);
    assert.equal(r.headers.get("cache-control"), "public, max-age=31536000, immutable", name);
    assert.equal(r.headers.get("set-cookie"), null, name);
  }
  for (const [path, init] of [[ASSET_PREFIX + "Civicsmith.css", {}], [ASSET_PREFIX + "fonts/", {}], [ASSET_PREFIX + "icons.svg/x", {}],
      [ASSET_PREFIX + "icons.svg", { method: "HEAD" }], [ASSET_PREFIX + "icons.svg", { method: "PUT", body: "x" }], ["/assets/civicsmith.css", {}]]) {
    const r = await req(path, init);
    assert.equal(r.status, 404, `${init.method || "GET"} ${path}`);
  }
  globalThis.fetch = realFetch;
  assert.deepEqual(calls, [], "the files are the bundle's: nothing fetched, nothing stored");
  /* R41 as amended: the confirming act sends nothing; Continue to Cloudflare, after it, sends /begin. */
  const home = await text("/");
  const w = pageWorld(home);
  w.el("slug").value = "amended";
  await w.el("go").click();
  await w.el("confirm-yes").click();
  assert.deepEqual(w.sent, [], "the confirming act sends nothing");
  await w.el("cloudflare").click();
  assert.deepEqual(w.sent.map((s) => s.body.slug), ["amended"]);
  /* GET /update draws the release it installs and says the version before is read later; the progress line and the last screen draw both. */
  const upd = await text(UPDATE_PATH);
  assert.ok(section(upd, "version-after").includes(NEXT));
  assert.doesNotMatch(section(upd, "version-before"), /\d+\.\d+\.\d+/, "no version before is claimed before it is read");
  const planeBase = (slug, v) => [{ type: "durable_object_namespace", name: "STORE", class_name: "Store" },
    { type: "plain_text", name: "VERSION", text: v }, { type: "secret_text", name: "ADMIN_TOKEN", text: "admin-kept" },
    { type: "secret_text", name: "PROBE_TOKEN", text: "probe-kept" }, { type: "service", name: "SELF", service: slug }];
  const u = await run({ slug: "amend-up", mode: "update", pre: { "amend-up": planeBase("amend-up", "0.70.0") } });
  assert.match(u.page.label("up"), /^Putting release .* in place/);
  assert.ok(section(u.page.done, "versions").includes("0.70.0"));
  /* No "Run the checks again" on the finished panel, nor anywhere on the progress page. */
  const i = await run({ slug: "amend-in" });
  assert.ok(i.page.done && !/Run the checks again/i.test(i.raw), "drawn nowhere");
  assert.ok(!/Run the checks again/i.test(home + upd));
});
