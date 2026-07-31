/* pdf-worker (I6) — the fleet member's OWN test estate, driven THROUGH workerd.
 *
 * It runs the COMMITTED bundle under miniflare (workerd), because that is the
 * runtime the Worker actually serves in — and it is where `unpdf`/pdf.js's
 * Math.sumPrecise resolves natively (node v26.5.0 lacks it; the guarded polyfill
 * covers node). Running the raw source would not resolve `unpdf`'s bare
 * specifier — the exact breakage the fleet split exists to avoid — so the bundle
 * is the subject, exactly as the plane's op suites drive src through miniflare.
 *
 * The unpdf version is PINNED (package.json: unpdf 1.8.0) and VERIFIED here on
 * workerd: the tier-2 assertion below is a live extraction on workerd, so a
 * version that regressed on the Workers runtime would fail this suite, not ship.
 *
 * RUN 2026-07-31: added `await env.CAPTURES.put(store+"/x", bytes)` in
 * handleStructure, rebuilt, the unchanged-key-set assertion went 1 fail; removed
 * and rebuilt, back to 0. (Recorded in the report.)
 */
/* NEGATIVE CONTROL: have the worker call env.CAPTURES.put()/.delete() -> the "R2 is byte-for-byte unchanged after a call" assertion fails. */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const BUNDLE = fileURLToPath(new URL("../dist/pdf-worker.bundled.mjs", import.meta.url));
const WORKER_SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const hex = (b) => createHash("sha256").update(b).digest("hex");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* A VALID PDF (proper xref + trailer, so pdf.js accepts it) whose one font is
   base-14 Helvetica, WinAnsiEncoding, NO /ToUnicode — the `no_tounicode` residue
   class (CPDF-5's largest Tier-2-recoverable class). Tier 1 marks it undetermined
   naming the font; pdf.js decodes it via the standard encoding. */
function buildPdf(bodies) {
  let pdf = "%PDF-1.7\n%\xe2\xe3\xcf\xd3\n";
  const offsets = [];
  bodies.forEach((body, i) => { offsets[i] = pdf.length; pdf += `${i + 1} 0 obj\n${body}\nendobj\n`; });
  const xrefStart = pdf.length;
  const n = bodies.length + 1;
  let xref = `xref\n0 ${n}\n0000000000 65535 f \n`;
  for (let i = 0; i < bodies.length; i++) xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  pdf += xref + `trailer\n<< /Size ${n} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return new Uint8Array(Buffer.from(pdf, "latin1"));
}
const STREAM = "BT /F1 24 Tf 72 700 Td (Hello Oakland 2026) Tj ET";
const CID_BYTES = buildPdf([
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
  `<< /Length ${STREAM.length} >>\nstream\n${STREAM}\nendstream`,
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
]);
const CID_SHA = hex(CID_BYTES);
const STORE = "scratch";
const KEY = `${STORE}/captures/${CID_SHA}`;

const newMf = (vars = {}) => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: BUNDLE, script: readFileSync(BUNDLE, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  r2Buckets: ["CAPTURES"],
  bindings: { VERSION: "test", ...vars },
});
const call = (mf, body) => mf.dispatchFetch("http://pdf-worker/structure", { method: "POST", body: JSON.stringify(body) });

/* ---- Tier 2 recovers text Tier 1 could not decode (the reason this exists) ---- */
console.log("\n--- Tier 2: a no-/ToUnicode font PDF, decoded on workerd through unpdf ---");
{
  const mf = newMf();
  const bucket = await mf.getR2Bucket("CAPTURES");
  await bucket.put(KEY, CID_BYTES);
  const before = (await bucket.list()).objects.map((o) => o.key).sort();

  const res = await call(mf, { capture_sha: CID_SHA, store: STORE });
  t("200", res.status, 200);
  const out = await res.json();
  t("ok", out.ok, true);
  t("container pdf", out.container, "pdf");
  t("tier 2 produced the text", out.tier, 2);
  t("recovered the real text Tier 1 marked undetermined", out.text.document, "Hello Oakland 2026");
  t("per-page text present", out.text.pages[0].text, "Hello Oakland 2026");
  t("chars counted", out.text.counts.chars, "Hello Oakland 2026".length);

  console.log("\n--- WRITES NOTHING: R2 is byte-for-byte unchanged after a call ---");
  const after = (await bucket.list()).objects.map((o) => o.key).sort();
  t("the CAPTURES key set is unchanged (no put)", after, before);
  t("only the seeded object exists", after, [KEY]);
  const still = await bucket.get(KEY);
  t("the seeded bytes are untouched", hex(new Uint8Array(await still.arrayBuffer())), CID_SHA);
  await mf.dispose();
}

/* ---- The write-nothing property, structurally, from the source ---- */
console.log("\n--- WRITES NOTHING: no put/delete anywhere in the Worker source, no STORE/PUBLISHED binding ---");
{
  const src = readFileSync(WORKER_SRC, "utf8");
  const codeOnly = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  t("no .put( call in source", /\.put\s*\(/.test(codeOnly), false);
  t("no .delete( call in source", /\.delete\s*\(/.test(codeOnly), false);
  const wr = readFileSync(fileURLToPath(new URL("../wrangler.jsonc", import.meta.url)), "utf8");
  const cfg = wr.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  t("no PUBLISHED binding declared", /PUBLISHED/.test(cfg), false);
  t("no durable_objects (STORE) binding declared", /durable_objects/.test(cfg), false);
  t("holds the CAPTURES read binding", /CAPTURES/.test(cfg), true);
}

/* ---- Over the envelope: text-UNDETERMINED, never truncated (I6) ---- */
console.log("\n--- ENVELOPE: a document over MAX_PDF_BYTES returns text-undetermined, not truncated text ---");
{
  const mf = newMf({ MAX_PDF_BYTES: "100" }); // the fixture is ~400 bytes, over the cap
  const bucket = await mf.getR2Bucket("CAPTURES");
  await bucket.put(KEY, CID_BYTES);
  const out = await (await call(mf, { capture_sha: CID_SHA, store: STORE })).json();
  t("ok structure still returned", out.ok, true);
  t("tier 2 was NOT attempted (declined)", out.tier, 1);
  t("text.document is empty, not truncated", out.text.document, "");
  t("one undetermined marker", out.text.undetermined.length, 1);
  t("the marker names the cause: over_envelope", out.text.undetermined[0].reason, "over_envelope");
  t("the marker states the size and the limit", [out.text.undetermined[0].bytes > 100, out.text.undetermined[0].limit], [true, 100]);
  t("a declined-over-envelope note is recorded", out.notes.includes("tier2_declined_over_envelope"), true);
  await mf.dispose();
}

/* ---- Refusals are stated, not faked ---- */
console.log("\n--- refusals: absence, bad input ---");
{
  const mf = newMf();
  const miss = await call(mf, { capture_sha: "f".repeat(64), store: STORE });
  t("unknown sha is 404", miss.status, 404);
  t("reason NOT_FOUND", (await miss.json()).reason, "NOT_FOUND");
  const bad = await call(mf, { capture_sha: "zz", store: STORE });
  t("malformed sha is 400", bad.status, 400);
  t("reason BAD_SHA", (await bad.json()).reason, "BAD_SHA");
  const badStore = await call(mf, { capture_sha: CID_SHA, store: "" });
  t("missing store is 400", badStore.status, 400);
  const notFound = await mf.dispatchFetch("http://pdf-worker/nope", { method: "GET" });
  t("a non-structure path is 404", notFound.status, 404);
  await mf.dispose();
}

console.log(`\npdf-worker: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
