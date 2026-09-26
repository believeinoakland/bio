/* pdf-worker's HTTP surface: R1–R12 and R35–R38 of build/requirements/pdf-worker.md.
 *
 * The subject is the COMMITTED BUNDLE (`dist/pdf-worker.bundled.mjs`), the file
 * that deploys. It is driven two ways: under miniflare (workerd, the runtime it
 * serves in) for the behaviour of each route, and imported into node with a
 * recording `env` where the question is what the Worker touches (R1, R37). */
import "../../bio-plane/test/sandbox.mjs";

import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { extractPdfStructure } from "../../bio-plane/src/pdfstructure.mjs";
import { REFUSALS } from "../src/pagepixels.mjs";
import { CROP_REFUSALS } from "../src/imagecrop.mjs";
import { makePdf, content, hex, runner } from "./make-pdf.mjs";

const { Miniflare } = await (async () => {
  try { return await import("miniflare"); } catch { /* fall through */ }
  const planePkg = fileURLToPath(new URL("../../bio-plane/package.json", import.meta.url));
  return await import(pathToFileURL(createRequire(planePkg).resolve("miniflare")).href);
})();

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const BUNDLE = here("../dist/pdf-worker.bundled.mjs");
const bundle = await import(pathToFileURL(BUNDLE).href);
const worker = bundle.default;
const { t, finish } = runner("structure");

/* A three-page document: text, a page with no text, text. Base-14 Helvetica,
   WinAnsiEncoding and no /ToUnicode — the residue tier 2 exists for. */
const pageObj = (c) => `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${c} 0 R >>`;
const DOC = makePdf([
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [4 0 R 5 0 R 6 0 R] /Count 3 >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  pageObj(7), pageObj(8), pageObj(9),
  content("BT /F1 24 Tf 72 700 Td (First page words) Tj ET"),
  content("0 0 1 rg 10 10 50 50 re f"),
  content("BT /F1 24 Tf 72 700 Td (Third page words) Tj ET"),
]);
const SHA = hex(DOC);
const NOT_PDF = new TextEncoder().encode("this is not a pdf at all");
const NOT_PDF_SHA = hex(NOT_PDF);

const newMf = (bindings = {}) => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: BUNDLE, script: readFileSync(BUNDLE, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  r2Buckets: ["CAPTURES"], bindings: { VERSION: "1.2.3-test", ...bindings },
});
const post = (mf, body, path = "structure") =>
  mf.dispatchFetch(`http://pdf-worker/${path}`, { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) });
const answer = async (res) => [res.status, await res.json()];

/* A recording env for the node-imported bundle: every env key read and every
   CAPTURES property touched is logged. */
function spyEnv(objects, extra = {}) {
  const log = { env: new Set(), captures: [] };
  const CAPTURES = new Proxy({
    get: async (key) => {
      const bytes = objects[key];
      return bytes ? { arrayBuffer: async () => bytes.slice().buffer } : null;
    },
  }, { get(target, prop) { if (typeof prop === "string") log.captures.push(prop); return target[prop]; } });
  const env = new Proxy({ CAPTURES, ...extra }, {
    get(target, prop) { if (typeof prop === "string") log.env.add(prop); return target[prop]; },
  });
  return { env, log };
}
const nodeCall = (env, body, { path = "structure", method = "POST" } = {}) =>
  worker.fetch(new Request(`http://pdf-worker/${path}`, { method, ...(method === "POST" ? { body: JSON.stringify(body) } : {}) }), env);

const mf = newMf();
const bucket = await mf.getR2Bucket("CAPTURES");
for (const store of ["bio", "scratch"]) {
  await bucket.put(`${store}/captures/${SHA}`, DOC);
  await bucket.put(`${store}/captures/${NOT_PDF_SHA}`, NOT_PDF);
}
await bucket.put(`biosmoke/captures/${SHA}`, DOC);

console.log("\n--- R1: no CAPTURES binding ---");
{
  for (const [label, env] of [["no CAPTURES", {}], ["CAPTURES without get", { CAPTURES: {} }], ["get not a function", { CAPTURES: { get: 1 } }]]) {
    let pulled = false;
    const body = new ReadableStream({ pull(c) { pulled = true; c.enqueue(new TextEncoder().encode("{not json")); c.close(); } }, { highWaterMark: 0 });
    const req = new Request("http://pdf-worker/structure", { method: "POST", body, duplex: "half" });
    const [status, out] = await answer(await worker.fetch(req, env));
    t(`R1 ${label}: 503 R2_NOT_CONFIGURED`, [status, out.ok, out.reason], [503, false, "R2_NOT_CONFIGURED"]);
    t(`R1 ${label}: the body was not read`, [pulled, req.bodyUsed], [false, false]);
  }
}

console.log("\n--- R2: capture_sha ---");
{
  const [s, o] = await answer(await post(mf, { capture_sha: SHA.toUpperCase(), store: "bio" }));
  t("R2 an upper-case sha is lower-cased and read", [s, o.ok, o.tier], [200, true, 2]);
  for (const [label, body] of [
    ["missing", { store: "bio" }],
    ["a number", { capture_sha: 12, store: "bio" }],
    ["null", { capture_sha: null, store: "bio" }],
    ["63 hex chars", { capture_sha: SHA.slice(1), store: "bio" }],
    ["65 hex chars", { capture_sha: SHA + "a", store: "bio" }],
    ["non-hex", { capture_sha: "g" + SHA.slice(1), store: "bio" }],
    ["empty", { capture_sha: "", store: "bio" }],
  ]) {
    const [st, out] = await answer(await post(mf, body));
    t(`R2 capture_sha ${label}: 400 BAD_SHA`, [st, out.ok, out.reason], [400, false, "BAD_SHA"]);
  }
  for (const [label, raw] of [["unparsable JSON", "{capture_sha:"], ["an empty body", ""], ["a JSON array", "[1,2]"]]) {
    const [st, out] = await answer(await post(mf, raw));
    t(`R2 ${label}: 400 BAD_SHA`, [st, out.reason], [400, "BAD_SHA"]);
  }
}

console.log("\n--- R3: store must be a string ---");
{
  for (const [label, body] of [
    ["absent", { capture_sha: SHA }],
    ["a number", { capture_sha: SHA, store: 7 }],
    ["null", { capture_sha: SHA, store: null }],
    ["an array", { capture_sha: SHA, store: ["bio"] }],
    ["an object", { capture_sha: SHA, store: { name: "bio" } }],
    ["a boolean", { capture_sha: SHA, store: true }],
  ]) {
    const [st, out] = await answer(await post(mf, body));
    t(`R3 store ${label}: 400 BAD_STORE, not NAMESPACE_UNKNOWN`, [st, out.reason], [400, "BAD_STORE"]);
  }
}

console.log("\n--- R4: store is exactly bio or scratch ---");
{
  const long = "x".repeat(100);
  for (const [label, name] of [
    ["biosmoke (its bytes are seeded under that prefix)", "biosmoke"],
    ["Scratch", "Scratch"], ["BIO", "BIO"], ["bio_smoke", "bio_smoke"], ["the empty string", ""],
    ["a trailing space", "scratch "], ["a name with a space", "a b"], ["100 chars", long],
  ]) {
    const [st, out] = await answer(await post(mf, { capture_sha: SHA, store: name }));
    t(`R4 store ${label}: 400 NAMESPACE_UNKNOWN with asked and namespaces`,
      [st, out.reason, out.asked, out.namespaces], [400, "NAMESPACE_UNKNOWN", name.slice(0, 80), ["bio", "scratch"]]);
  }
  for (const name of ["bio", "scratch"]) {
    const [st, out] = await answer(await post(mf, { capture_sha: SHA, store: name }));
    t(`R4 store ${name} is accepted`, [st, out.ok], [200, true]);
  }
  /* R4: the set equals the plane's own. The plane is a later module and cannot be
     imported here, so its declaration is read from its source. */
  const plane = readFileSync(here("../../bio-plane/src/index.mjs"), "utf8");
  const scratch = (plane.match(/^const SCRATCH = "([^"]+)";$/m) || [])[1];
  const planeSet = ((plane.match(/^const NAMESPACES = Object\.freeze\(\[([^\]]*)\]\);$/m) || [])[1] || "")
    .split(",").map((x) => x.trim()).filter(Boolean).map((x) => (x === "SCRATCH" ? scratch : JSON.parse(x)));
  t("R4 the namespaces this member answers with equal the plane's own set", planeSet, ["bio", "scratch"]);
  /* ...and R2 is never read for an unknown name (R4 is checked before R5). */
  const { env, log } = spyEnv({ [`biosmoke/captures/${SHA}`]: DOC });
  await nodeCall(env, { capture_sha: SHA, store: "biosmoke" });
  t("R4 an unknown namespace never reaches CAPTURES.get", log.captures.filter((p) => p === "get").length, 1);
  t("R4 (the one access is R1's type check, before the body)", log.captures, ["get"]);
}

console.log("\n--- R5: the R2 key, by .get only; NOT_FOUND ---");
{
  const reads = [];
  const env = { CAPTURES: { get: async (k) => { reads.push(k); return null; } } };
  const [st, out] = await answer(await nodeCall(env, { capture_sha: "F".repeat(64), store: "scratch" }));
  t("R5 reads the key <store>/captures/<sha>", reads, [`scratch/captures/${"f".repeat(64)}`]);
  t("R5 a missing object: 404 NOT_FOUND with capture_sha and store",
    [st, out], [404, { ok: false, reason: "NOT_FOUND", capture_sha: "f".repeat(64), store: "scratch" }]);
  const [st2, out2] = await answer(await post(mf, { capture_sha: "e".repeat(64), store: "bio" }));
  t("R5 under workerd too", [st2, out2.reason], [404, "NOT_FOUND"]);
}

console.log("\n--- R6: extractPdfStructure's refusal, verbatim, at 422 ---");
{
  const [st, out] = await answer(await post(mf, { capture_sha: NOT_PDF_SHA, store: "bio" }));
  const want = await extractPdfStructure(NOT_PDF);
  t("R6 not a PDF: 422 and exactly extractPdfStructure's answer", [st, out], [422, JSON.parse(JSON.stringify(want))]);
  t("R6 no tier-2 pass ran (no tier, no text)", [out.tier, out.text], [undefined, undefined]);
}

console.log("\n--- R7 and R9: tier 2 replaces .text, everything else passes through ---");
{
  const [st, out] = await answer(await post(mf, { capture_sha: SHA, store: "bio" }));
  const base = JSON.parse(JSON.stringify(await extractPdfStructure(DOC)));
  t("R7 200 and tier 2", [st, out.ok, out.tier], [200, true, 2]);
  const { text: _a, tier: _b, ...rest } = out;
  const { text: _c, ...baseRest } = base;
  t("R7 every other field is extractPdfStructure's own, unchanged", rest, baseRest);
  t("R9 one entry per page, pages kept separate", out.text.pages.map((p) => [p.page, p.text.trim()]),
    [[0, "First page words"], [1, ""], [2, "Third page words"]]);
  const marker = { page: 1, reason: "no_text_layer", font: null, codes: "", count: 0 };
  t("R9 the empty page carries one no_text_layer marker", out.text.pages[1].undetermined, [marker]);
  t("R9 the text pages carry none", [out.text.pages[0].undetermined, out.text.pages[2].undetermined], [[], []]);
  t("R9 the document-level list holds the marker", out.text.undetermined, [marker]);
  t("R9 document joins the non-empty pages with a newline",
    out.text.document, [out.text.pages[0].text, out.text.pages[2].text].join("\n"));
  t("R9 counts", out.text.counts, { chars: out.text.document.length, undetermined: 1 });
}

console.log("\n--- R8: over the envelope ---");
{
  const mfSmall = newMf({ MAX_PDF_BYTES: String(DOC.length - 1) });
  const b = await mfSmall.getR2Bucket("CAPTURES");
  await b.put(`bio/captures/${SHA}`, DOC);
  const [st, out] = await answer(await post(mfSmall, { capture_sha: SHA, store: "bio" }));
  const base = JSON.parse(JSON.stringify(await extractPdfStructure(DOC)));
  t("R8 over the env limit: 200, tier 1", [st, out.tier], [200, 1]);
  t("R8 the text is the over_envelope shape", out.text, {
    document: "", pages: [],
    undetermined: [{ page: null, reason: "over_envelope", font: null, codes: "", count: 0, bytes: DOC.length, limit: DOC.length - 1 }],
    counts: { chars: 0, undetermined: 1 } });
  t("R8 the note is appended", out.notes, [...base.notes, "tier2_declined_over_envelope"]);
  await mfSmall.dispose();

  const mfExact = newMf({ MAX_PDF_BYTES: String(DOC.length) });
  const b2 = await mfExact.getR2Bucket("CAPTURES");
  await b2.put(`bio/captures/${SHA}`, DOC);
  t("R8 exactly at the limit is not over it", (await (await post(mfExact, { capture_sha: SHA, store: "bio" })).json()).tier, 2);
  await mfExact.dispose();

  /* The default, 16,777,216 bytes: the same document padded with a comment to one
     byte over, and to exactly the limit. */
  const pad = (n) => { const u = new Uint8Array(n); u.set(DOC); u.fill(0x20, DOC.length); u[DOC.length] = 0x25; return u; };
  for (const [label, n, tier] of [["one byte over the default", 16777217, 1], ["exactly the default", 16777216, 2]]) {
    const bytes = pad(n);
    const sha = hex(bytes);
    const { env } = spyEnv({ [`bio/captures/${sha}`]: bytes });
    const o = await (await nodeCall(env, { capture_sha: sha, store: "bio" })).json();
    t(`R8 ${label} (${n} B): tier ${tier}`, [o.tier, o.text.undetermined[0]?.limit ?? null],
      [tier, tier === 1 ? 16777216 : null]);
  }
}

console.log("\n--- R10: the tier-2 pass throws ---");
{
  const BROKEN = new TextEncoder().encode("%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n");
  const sha = hex(BROKEN);
  await bucket.put(`bio/captures/${sha}`, BROKEN);
  const [st, out] = await answer(await post(mf, { capture_sha: sha, store: "bio" }));
  const base = JSON.parse(JSON.stringify(await extractPdfStructure(BROKEN)));
  t("R10 200, tier 1", [st, out.ok, out.tier], [200, true, 1]);
  t("R10 the tier2_extraction_error text", out.text, {
    document: "", pages: [],
    undetermined: [{ page: null, reason: "tier2_extraction_error", font: null, codes: "", count: 0 }],
    counts: { chars: 0, undetermined: 1 } });
  const note = out.notes[out.notes.length - 1] || "";
  t("R10 one tier2_error note appended, message at most 80 chars",
    [out.notes.length, /^tier2_error:.{1,80}$/s.test(note)], [base.notes.length + 1, true]);
  const { text: _a, tier: _b, notes: _n, ...rest } = out;
  const { text: _c, notes: _d, ...baseRest } = base;
  t("R10 the structure fields are kept", rest, baseRest);
}

console.log("\n--- R11: GET /version ---");
{
  const [st, out] = await answer(await mf.dispatchFetch("http://pdf-worker/version"));
  t("R11 the bound VERSION", [st, out], [200, { ok: true, name: "pdf-worker", version: "1.2.3-test" }]);
  const [st2, out2] = await answer(await worker.fetch(new Request("http://pdf-worker/version"), {}));
  t("R11 no VERSION bound: 0.0.0", [st2, out2], [200, { ok: true, name: "pdf-worker", version: "0.0.0" }]);
  const [st3, out3] = await answer(await worker.fetch(new Request("http://pdf-worker//version"), { VERSION: "7.0.0" }));
  t("R11 leading slashes are one path", [st3, out3.version], [200, "7.0.0"]);
}

console.log("\n--- R12: anything else ---");
{
  const want = { ok: false, reason: "UNKNOWN", detail: "POST /structure or GET /version only" };
  for (const [label, path, method] of [
    ["POST /version", "version", "POST"], ["GET /structure", "structure", "GET"], ["PUT /structure", "structure", "PUT"],
    ["GET /", "", "GET"], ["POST /other", "other", "POST"], ["GET /structure/x", "structure/x", "GET"],
  ]) {
    const res = await mf.dispatchFetch(`http://pdf-worker/${path}`, { method, ...(method === "GET" ? {} : { body: "{}" }) });
    t(`R12 ${label}: 404 UNKNOWN`, await answer(res), [404, want]);
  }
  const [st] = await answer(await post(mf, { capture_sha: SHA, store: "bio" }, ""));
  t("R12 (and the empty path is /structure)", st, 200);
}

console.log("\n--- R35, R36: the declared surface ---");
{
  t("R35 SURFACE names exactly structure (POST) and version (GET), neither mutating", bundle.SURFACE,
    { structure: { method: "POST", mutating: false }, version: { method: "GET", mutating: false } });
  const fm = JSON.parse(readFileSync(here("../fleet-member.json"), "utf8"));
  t("R36 fleet-member.json", [fm.entry, fm.surface, fm.testDir, fm.bundle?.entry, fm.bundle?.outfile, fm.bundle?.manifest],
    ["src/index.mjs", "SURFACE", "test", "src/index.mjs", "dist/pdf-worker.bundled.mjs", "dist/pdf-worker.bundle.json"]);
}

console.log("\n--- R37: never writes ---");
{
  const objects = { [`bio/captures/${SHA}`]: DOC, [`bio/captures/${NOT_PDF_SHA}`]: NOT_PDF };
  const { env, log } = spyEnv(objects, { VERSION: "1", MAX_PDF_BYTES: undefined });
  for (const body of [
    { capture_sha: SHA, store: "bio" }, { capture_sha: NOT_PDF_SHA, store: "bio" }, { capture_sha: "a".repeat(64), store: "bio" },
    { capture_sha: SHA, store: "nope" }, { capture_sha: SHA }, { capture_sha: "x", store: "bio" },
  ]) await nodeCall(env, body);
  await nodeCall(env, null, { path: "version", method: "GET" });
  await nodeCall(env, null, { path: "other", method: "GET" });
  t("R37 CAPTURES is only ever .get", [...new Set(log.captures)], ["get"]);
  t("R37 the only env keys read are CAPTURES, MAX_PDF_BYTES and VERSION",
    [...log.env].sort(), ["CAPTURES", "MAX_PDF_BYTES", "VERSION"]);
  const before = (await bucket.list()).objects.map((o) => `${o.key}:${o.etag}`).sort();
  await post(mf, { capture_sha: SHA, store: "bio" });
  await post(mf, { capture_sha: NOT_PDF_SHA, store: "scratch" });
  t("R37 the bucket is unchanged after calls under workerd",
    (await bucket.list()).objects.map((o) => `${o.key}:${o.etag}`).sort(), before);
  /* The deployed bindings: wrangler.jsonc is the member's contract with the
     platform. Its comments are whole lines. */
  const cfg = JSON.parse(readFileSync(here("../wrangler.jsonc"), "utf8").replace(/^\s*\/\/.*$/gm, ""));
  t("R37 the one data binding is the CAPTURES R2 bucket",
    [cfg.r2_buckets?.map((b) => b.binding), cfg.durable_objects, cfg.kv_namespaces, cfg.d1_databases, cfg.services],
    [["CAPTURES"], undefined, undefined, undefined, undefined]);
}

console.log("\n--- R38: no place named ---");
{
  const PLACES = /\b(Oakland|Alameda|California|Berkeley|Legistar)\b/i;
  const texts = [...Object.values(REFUSALS), ...Object.values(CROP_REFUSALS)];
  const { env } = spyEnv({});
  for (const body of [{ capture_sha: SHA }, { capture_sha: "x", store: "bio" }, { capture_sha: SHA, store: "zz" }, { capture_sha: SHA, store: "bio" }]) {
    texts.push(await (await nodeCall(env, body)).text());
  }
  texts.push(await (await worker.fetch(new Request("http://pdf-worker/structure", { method: "POST" }), {})).text());
  texts.push(await (await nodeCall(env, null, { path: "zz", method: "GET" })).text());
  t("R38 no refusal text names a place", texts.filter((s) => PLACES.test(s)), []);
  /* The code itself, comments removed: only a comment may cite where a
     measurement was taken (layers.md, rule 6). */
  const code = (f) => readFileSync(here(`../src/${f}`), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
  const files = readdirSync(here("../src")).filter((f) => f.endsWith(".mjs")).sort();
  t("R38 (every source file is read: the decoders included)", ["jbig2decode.mjs", "jpxdecode.mjs", "mq.mjs"].every((f) => files.includes(f)), true);
  t("R38 no place is named in the module's code", files.filter((f) => PLACES.test(code(f))), []);
}

await mf.dispose();
finish();
