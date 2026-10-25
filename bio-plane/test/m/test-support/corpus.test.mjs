/* test-support R19, R24, R25, R28 and R9 as amended (fix round 9, G123d; S9): the corpus library's contract, tested
 * at its interface. Each test names the requirement it checks in its title. */
import { SANDBOX } from "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync, statSync } from "node:fs";
import net from "node:net";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { gunzipSync } from "node:zlib";
import { buildFixture, generate, truthOf, loopbackOrigin, fixtureDir, pdfjsText, pillowPixels, soffice, unzipTest, pyZipfile } from "../../corpus.mjs";
import { rfc4180 } from "../../sheetgen.mjs";

const ROOT = new URL("../../../../", import.meta.url).pathname;
const sha = (b) => createHash("sha256").update(b).digest("hex");
const has = (cmd, args = ["--version"]) => { const r = spawnSync(cmd, args, { encoding: "utf8" }); return !r.error && r.status === 0; };
const NO_PYTHON = !has("python3", ["-I", "-c", "import zipfile, csv"]) && "python3 is absent on this host";
const NO_PILLOW = !has("python3", ["-I", "-c", "import PIL"]) && "Pillow is absent on this host";
const NO_SOFFICE = !has("soffice") && "LibreOffice is absent on this host";
const childEnv = (extra) => { const env = { ...process.env, ...extra }; delete env.NODE_EXTRA_CA_CERTS; return env; };

/** The truth without its functions, for comparing two truths. */
function plain(t) {
  const out = JSON.parse(JSON.stringify(t, (k, v) => (typeof v === "function" ? undefined : v)));
  if (t.page) out.pageTexts = Array.from({ length: t.pages }, (_, i) => t.page(i + 1).text);
  if (t.cell) out.rowTexts = Array.from({ length: t.rows }, (_, i) => t.row(i + 1));
  if (t.unit) out.unitTexts = [...t.all()].map((u) => u.text);
  if (Array.isArray(t.pages)) out.pixels = t.pages.map((p) => p.sha256());
  return out;
}

/* One small recipe of every kind. */
const EVERY_KIND = [
  { kind: "pdf", seed: "K-pdf", fonts: ["winansi", "type0"], size: { pages: 2, lines: 3 } },
  { kind: "png", seed: "K-png" }, { kind: "bmp", seed: "K-bmp" }, { kind: "gif", seed: "K-gif", size: { pages: 2, lines: 2 } }, { kind: "tiff", seed: "K-tiff", compression: "lzw" },
  { kind: "csv", seed: "K-csv" }, { kind: "tsv", seed: "K-tsv" }, { kind: "xlsx", seed: "K-xlsx", strings: "shared" }, { kind: "ods", seed: "K-ods" },
  { kind: "docx", seed: "K-docx", parts: ["footnote"] }, { kind: "pptx", seed: "K-pptx", parts: ["notes"] }, { kind: "odt", seed: "K-odt" }, { kind: "odp", seed: "K-odp" },
  { kind: "html", seed: "K-html" }, { kind: "text", seed: "K-text" }, { kind: "json", seed: "K-json" }, { kind: "xml", seed: "K-xml" },
];

/* ---------------------------------------------------------------- R19 */

test("R19 every generator answers the same bytes and the same truth for the same recipe, with no clock and no unseeded randomness (Date.now and Math.random throw while it runs)", async () => {
  const first = [];
  for (const r of EVERY_KIND) { const f = generate(r); first.push([sha(await f.bytes()), JSON.stringify(plain(f.truth))]); }
  const { now } = Date, { random } = Math;
  Date.now = () => { throw new Error("a clock was read"); };
  Math.random = () => { throw new Error("unseeded randomness"); };
  try {
    for (const [i, r] of EVERY_KIND.entries()) {
      const f = generate(r);
      assert.deepEqual([sha(await f.bytes()), JSON.stringify(plain(f.truth))], first[i], r.kind);
    }
  } finally { Date.now = now; Math.random = random; }
});

test("R19 a different process builds the same bytes: a child with another clock and time zone gives every kind's file the same digest", () => {
  const code = `const m = await import(${JSON.stringify(new URL("../../corpus.mjs", import.meta.url).href)});
    const { createHash } = await import("node:crypto");
    const out = [];
    for (const r of ${JSON.stringify(EVERY_KIND)}) out.push(createHash("sha256").update(await m.generate(r).bytes()).digest("hex"));
    console.log(JSON.stringify(out));`;
  const r = spawnSync(process.execPath, ["--input-type=module", "-e", code], { encoding: "utf8", env: childEnv({ TZ: "Pacific/Kiritimati", FAKE: String(Date.now()) }), maxBuffer: 1 << 26 });
  assert.equal(r.status, 0, r.stderr);
  const theirs = JSON.parse(r.stdout);
  return Promise.all(EVERY_KIND.map(async (rec, i) => assert.equal(sha(await generate(rec).bytes()), theirs[i], rec.kind)));
});

test("R19 a file is built on demand into BIO_FIXTURE_CACHE, keyed by its recipe, found there by a later call, and never written elsewhere", async () => {
  const dir = mkdtempSync(join(tmpdir(), "cache-"));
  const saved = process.env.BIO_FIXTURE_CACHE;
  process.env.BIO_FIXTURE_CACHE = dir;
  try {
    assert.equal(fixtureDir(), dir);
    const a = await buildFixture({ kind: "csv", seed: 1, size: { rows: 5 } });
    const again = await buildFixture({ kind: "csv", seed: 1, size: { rows: 5 } });
    const other = await buildFixture({ kind: "csv", seed: 2, size: { rows: 5 } });
    assert.deepEqual([a.built, again.built, other.built], [true, false, true]);
    assert.equal(again.path, a.path);
    assert.notEqual(other.path, a.path);
    assert.deepEqual(readdirSync(dir).sort(), [a.path, other.path].map((p) => p.slice(dir.length + 1)).sort());
    assert.match(a.path, /\/csv-[0-9a-f]{24}\.csv$/);
    assert.equal(readFileSync(a.path).length, a.size);
    assert.ok(relative(ROOT, dir).startsWith(".."), "the cache is outside the repository: nothing is committed");
  } finally { if (saved === undefined) delete process.env.BIO_FIXTURE_CACHE; else process.env.BIO_FIXTURE_CACHE = saved; }
});

test("R19 a recipe that names a boundary builds exactly that size: a bound minus 2, the bound and the bound plus 1, for every generator", async () => {
  const bound = 2 ** 20;
  for (const r of EVERY_KIND) {
    for (const bytes of [bound - 2, bound, bound + 1]) {
      const rec = { ...r, size: { ...r.size, bytes }, bound };
      if (["png", "bmp", "gif", "tiff"].includes(rec.kind)) { delete rec.size.pages; rec.frame = [600, 400]; }
      if ((rec.kind === "tsv" || rec.kind === "csv") && rec.encoding?.startsWith("utf-16") && bytes % 2) continue;
      const f = await buildFixture(rec);
      assert.equal(statSync(f.path).size, bytes, `${r.kind} at ${bytes}`);
      assert.deepEqual(f.truth.refusal, bytes > bound ? { code: "TOO_LARGE", size: bytes, bound } : null, `${r.kind} at ${bytes}: the statement its truth names`);
    }
  }
});

/* ---------------------------------------------------------------- R24 */

test("R24 truthOf(recipe) answers the truth generate(recipe) carries, for every kind, without building the file", async () => {
  for (const r of EVERY_KIND) assert.deepEqual(plain(truthOf(r)), { ...plain(generate(r).truth), size: plain(truthOf(r)).size }, r.kind);
  const huge = truthOf({ kind: "xlsx", seed: "T", size: { rows: 1048576, cols: 16385 } });
  assert.equal(huge.cell(1048576, 16385).type, huge.cell(1, 16385).type, "a sheet of 17 billion cells is answered, not built");
  const pdf = truthOf({ kind: "pdf", seed: "T", size: { pages: 10000, lines: 40 } });
  assert.equal(pdf.page(10000).lines[39].split(" ")[0], "T-p10000-l40");
});

test("R24 pdfgen's truth agrees with pdf.js on a small file", async () => {
  const f = generate({ kind: "pdf", seed: "R24", fonts: ["macroman", "type0"], structure: "object-streams", size: { pages: 2, lines: 4 } });
  const o = await pdfjsText(await f.bytes());
  if (o.skip) return;
  const n = (t) => t.normalize("NFKC").replace(/\s+/g, " ").trim();
  assert.deepEqual(o.texts.map(n), [1, 2].map((p) => n(f.truth.page(p).lines.join(" "))));
});

test("R24 imggen's truth agrees with Pillow (libtiff for TIFF) on a small file of each kind", { skip: NO_PILLOW }, async () => {
  for (const r of EVERY_KIND.filter((x) => ["png", "bmp", "gif", "tiff"].includes(x.kind))) {
    const f = await buildFixture(r), o = pillowPixels(f.path);
    assert.deepEqual(o.frames.map((x) => x.sha256), f.truth.pages.map((p) => p.sha256()), r.kind);
  }
});

test("R24 sheetgen's CSV truth agrees with its RFC 4180 reading and with Python's csv module, which share no code with it", { skip: NO_PYTHON }, async () => {
  const f = await buildFixture({ kind: "csv", seed: "R24", quoting: ["doubled", "newline", "tab"], ragged: true, header: "title" });
  const recs = rfc4180(readFileSync(f.path, "utf8"));
  const py = JSON.parse(spawnSync("python3", ["-I", "-c", "import sys,csv,json;print(json.dumps(list(csv.reader(open(sys.argv[1],newline='',encoding='utf-8')))))", f.path], { encoding: "utf8" }).stdout);
  for (let d = 1; d <= f.truth.rows; d++) {
    assert.deepEqual(recs[f.truth.headerRows + d - 1], f.truth.row(d));
    assert.deepEqual(py[f.truth.headerRows + d - 1], f.truth.row(d));
  }
});

test("R24 sheetgen's XLSX and docgen's DOCX truths agree with LibreOffice headless on a small file", { skip: NO_SOFFICE }, async () => {
  const x = await buildFixture({ kind: "xlsx", seed: "R24", types: ["text", "integer"], size: { rows: 6, cols: 2 } });
  const recs = rfc4180(soffice(x.path, "csv").text);
  for (let d = 1; d <= 6; d++) assert.deepEqual(recs[d], x.truth.row(d));
  const w = await buildFixture({ kind: "docx", seed: "R24", size: { units: 4 } });
  const text = soffice(w.path, "txt").text;
  assert.deepEqual(text.split("\n").map((l) => l.trim()).filter(Boolean), [...w.truth.all()].map((u) => u.text));
});

test("R24 every package (XLSX, ODS, DOCX, PPTX, ODT, ODP) opens in unzip -t and Python's zipfile", { skip: NO_PYTHON }, async () => {
  for (const r of EVERY_KIND.filter((x) => ["xlsx", "ods", "docx", "pptx", "odt", "odp"].includes(x.kind))) {
    const f = await buildFixture(r);
    const u = unzipTest(f.path);
    if (!u.skip) assert.ok(u.ok, `${r.kind}: ${u.output}`);
    assert.ok(pyZipfile(f.path).ok, r.kind);
  }
});

/* ---------------------------------------------------------------- R25 */

test("R25 loopbackOrigin serves generated files on 127.0.0.1 with the given statuses and headers, streamed from the generator", async () => {
  const pdf = { kind: "pdf", seed: "O1", size: { pages: 2, lines: 2 } };
  const o = await loopbackOrigin({
    "/doc.pdf": { body: pdf },
    "/gone": { status: 410, body: "gone", headers: { "content-type": "text/plain", "x-bio": "1" } },
    "/csv": { body: () => ({ kind: "csv", seed: "O2" }), headers: { "content-type": "text/csv; charset=utf-8" } },
  });
  try {
    assert.match(o.origin, /^http:\/\/127\.0\.0\.1:\d+$/);
    const a = await fetch(o.url("/doc.pdf"));
    assert.equal(a.status, 200);
    assert.equal(a.headers.get("content-type"), "application/pdf");
    assert.equal(sha(new Uint8Array(await a.arrayBuffer())), sha(await generate(pdf).bytes()));
    const g = await fetch(o.url("/gone"));
    assert.deepEqual([g.status, g.headers.get("x-bio"), await g.text()], [410, "1", "gone"]);
    const c = await fetch(o.url("/csv"));
    assert.equal(c.headers.get("content-type"), "text/csv; charset=utf-8");
    assert.equal(await c.text(), new TextDecoder().decode(await generate({ kind: "csv", seed: "O2" }).bytes()));
    assert.equal((await fetch(o.url("/none"))).status, 404);
    assert.deepEqual(o.requests.map((r) => r.path), ["/doc.pdf", "/gone", "/csv", "/none"]);
  } finally { await o.close(); }
});

test("R25 redirects within the loopback are followed, a redirect off it is refused when the origin is made, Content-Encoding is real, and a body that never settles is cut only by closing", async () => {
  await assert.rejects(loopbackOrigin({ "/x": { redirect: "https://example.org/" } }), /off the loopback/);
  const body = "z".repeat(100000);
  const o = await loopbackOrigin({ "/a": { redirect: "/b" }, "/b": { redirect: "/c", status: 301 }, "/c": { body: "end" }, "/gz": { body, encoding: "gzip" }, "/hang": { body, hang: true }, "/slow": { body: "s", delayMs: 5 } });
  try {
    const r = await fetch(o.url("/a"));
    assert.deepEqual([r.status, r.redirected, await r.text()], [200, true, "end"]);
    const raw = await new Promise((resolve, reject) => {
      const s = net.connect(Number(new URL(o.origin).port), "127.0.0.1", () => s.write("GET /gz HTTP/1.1\r\nHost: x\r\nConnection: close\r\n\r\n"));
      const parts = []; s.on("data", (d) => parts.push(d)); s.on("end", () => resolve(Buffer.concat(parts))); s.on("error", reject);
    });
    const split = raw.indexOf("\r\n\r\n");
    assert.match(raw.subarray(0, split).toString(), /content-encoding: gzip/i);
    assert.equal(gunzipSync(raw.subarray(split + 4)).toString(), body);
    assert.equal(await (await fetch(o.url("/gz"))).text(), body, "a client that asks for it gets the body decoded");
    assert.equal(await (await fetch(o.url("/slow"))).text(), "s");
    const h = await fetch(o.url("/hang"));
    const reader = h.body.getReader();
    const first = await reader.read();
    assert.ok(first.value.length > 0 && !first.done, "headers and part of the body arrive");
    const rest = (async () => { for (;;) { const x = await reader.read(); if (x.done) return "ended"; } })().catch(() => "cut");
    await o.close();
    assert.equal(await rest, "cut", "the body ends only because the origin closed");
  } finally { await o.close(); }
});

test("R25 the origin makes no request of its own: every connection while it serves goes to the loopback", async () => {
  const targets = [];
  const real = net.Socket.prototype.connect;
  net.Socket.prototype.connect = function (...args) { const a = args[0]; targets.push(typeof a === "object" ? (a.host ?? a.path ?? "localhost") : args[1] ?? "localhost"); return real.apply(this, args); };
  try {
    const o = await loopbackOrigin({ "/f": { body: { kind: "xlsx", seed: "O3" } }, "/r": { redirect: "/f" } });
    await (await fetch(o.url("/r"))).arrayBuffer();
    await o.close();
  } finally { net.Socket.prototype.connect = real; }
  assert.ok(targets.length > 0);
  for (const t of targets) assert.match(String(t), /^(127\.0\.0\.1|localhost|::1)$/);
});

test("R25 an origin left open closes with the process: a child that never closes it still exits by itself, and its sandbox is gone", () => {
  const H = mkdtempSync(join(tmpdir(), "host-"));
  const code = `await import(${JSON.stringify(new URL("../../sandbox.mjs", import.meta.url).href)});
    const m = await import(${JSON.stringify(new URL("../../corpus.mjs", import.meta.url).href)});
    const o = await m.loopbackOrigin({ "/x": { body: "x" } });
    const r = await fetch(o.url("/x")); console.log(await r.text());`;
  const r = spawnSync(process.execPath, ["--input-type=module", "-e", code], { encoding: "utf8", env: childEnv({ TMPDIR: H }), timeout: 30000 });
  assert.equal(r.signal, null, "it ended on its own, not by the timeout");
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout.trim(), "x");
  assert.deepEqual(readdirSync(H), []);
});

/* ---------------------------------------------------------------- R28 */

const NEW_FILES = ["corpus.mjs", "seeded.mjs", "pdfgen.mjs", "imggen.mjs", "sheetgen.mjs", "docgen.mjs", "alarm-double.mjs", "job-registrar-stub.mjs"];

test("R28 every generator and double imports with no side effect: nothing created, no listener added, the environment unchanged", () => {
  for (const file of NEW_FILES) {
    const H = mkdtempSync(join(tmpdir(), "host-")), C = join(mkdtempSync(join(tmpdir(), "c-")), "cache");
    const code = `const env = JSON.stringify(process.env), ev = ["exit", "SIGINT", "SIGTERM"].map((e) => process.listenerCount(e));
      await import(${JSON.stringify(new URL(`../../${file}`, import.meta.url).href)});
      console.log(JSON.stringify({ env: env === JSON.stringify(process.env), ev: JSON.stringify(ev) === JSON.stringify(["exit", "SIGINT", "SIGTERM"].map((e) => process.listenerCount(e))) }));`;
    const r = spawnSync(process.execPath, ["--input-type=module", "-e", code], { encoding: "utf8", env: childEnv({ TMPDIR: H, BIO_FIXTURE_CACHE: C }), cwd: H });
    assert.equal(r.status, 0, `${file}: ${r.stderr}`);
    assert.deepEqual(JSON.parse(r.stdout), { env: true, ev: true }, file);
    assert.deepEqual(readdirSync(H), [], `${file}: nothing created`);
    assert.equal(existsSync(C), false, `${file}: no cache directory made on import`);
  }
});

test("R28 no product code imports a generator or a double: no module's paths (other than test-support's) name one", () => {
  const { modules } = JSON.parse(readFileSync(join(ROOT, "build/modules.json"), "utf8"));
  const tracked = spawnSync("git", ["-C", ROOT, "ls-files"], { encoding: "utf8", maxBuffer: 1 << 26 }).stdout.split("\n");
  const offenders = [];
  for (const m of modules) {
    if (m.id === "test-support") continue;
    for (const p of m.paths) for (const f of tracked) {
      if (!(p.endsWith("/") ? f.startsWith(p) : f === p) || !/\.(mjs|js|cjs|ts)$/.test(f)) continue;
      /* a module whose paths hold its own tests (pdf-worker, ocr-worker) is product code only outside them (K4997) */
      if ((m.tests || []).some((t) => (t.endsWith("/") ? f.startsWith(t) : f === t))) continue;
      const text = readFileSync(join(ROOT, f), "utf8");
      for (const n of NEW_FILES) if (new RegExp(`["'][^"']*/${n.replace(".", "\\.")}["']`).test(text)) offenders.push(`${m.id} ${f} ${n}`);
    }
  }
  assert.deepEqual(offenders, []);
});

/* ---------------------------------------------------------------- R9 (amended) */

test("R9 the generators create nothing outside the sandbox but their files in BIO_FIXTURE_CACHE, which outlive the process and are never removed; with no BIO_FIXTURE_CACHE they stay inside the sandbox", () => {
  const P = mkdtempSync(join(tmpdir(), "outer-")), H = join(P, "tmp"), C = join(P, "cache");
  spawnSync("mkdir", [H]);
  const build = `await import(${JSON.stringify(new URL("../../sandbox.mjs", import.meta.url).href)});
    const m = await import(${JSON.stringify(new URL("../../corpus.mjs", import.meta.url).href)});
    for (const r of [{ kind: "pdf", seed: 1 }, { kind: "png", seed: 1 }, { kind: "xlsx", seed: 1 }, { kind: "docx", seed: 1 }]) await m.buildFixture(r);`;
  const run = (env) => spawnSync(process.execPath, ["--input-type=module", "-e", build], { encoding: "utf8", env: childEnv({ TMPDIR: H, ...env }), cwd: P });
  let r = run({ BIO_FIXTURE_CACHE: C });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(readdirSync(P).sort(), ["cache", "tmp"]);
  assert.deepEqual(readdirSync(H), [], "the sandbox is gone");
  const files = readdirSync(C).sort();
  assert.deepEqual(files.map((f) => f.split("-")[0]), ["docx", "pdf", "png", "xlsx"], "the four files, and nothing else");
  r = run({ BIO_FIXTURE_CACHE: C });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(readdirSync(C).sort(), files, "a second run finds them and removes nothing");
  r = run({ BIO_FIXTURE_CACHE: "" });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(readdirSync(P).sort(), ["cache", "tmp"], "without BIO_FIXTURE_CACHE nothing is created beside the sandbox");
  assert.deepEqual(readdirSync(H), []);
  assert.ok(SANDBOX);
});
