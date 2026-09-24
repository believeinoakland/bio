#!/usr/bin/env node
/* CAP-11 — DEC-75 ENACTED, ACT 3: THE DRIVE EXPORT STEP'S CALIBRATION MEASUREMENT.
 *
 * What it measures: for each Google Drive target in CAP-7's census (M-13), the
 * TEXT the plane reads out of Google's OpenDocument export, fetched N times
 * through the PLANE'S OWN EGRESS (`op=acquire` into `store=scratch`), compared
 * across fetches. Bytes are D-351's; this instrument records them only to say
 * whether D-351's byte instability reproduced, never to score text stability.
 *
 * The text is read by the plane's OWN readers (`bio-plane/src/odf.mjs`'s three
 * entries), so "stable" means stable as the product reads it — a second
 * extractor here would agree or disagree with the product for free.
 *
 * Modes:
 *   node tools/measure-drive-export.mjs control
 *       offline negative control; every arm declared; exit 0 only if all hold.
 *   node tools/measure-drive-export.mjs run <targets.jsonl> <N> <out.jsonl>
 *       live: N acquires per harvestable target, store=scratch NAMED ON EVERY
 *       CALL (CLAUDE.md §5, D-325), witness counters read before and after.
 *       Needs BIO_INSTANCE and BIO_ADMIN_TOKEN in the environment; never prints
 *       the token.
 *   node tools/measure-drive-export.mjs derive <out.jsonl>
 *       the per-format table from a run's log.
 *
 * A target that answers a SHELL (text/html, anything not an ODF package) is
 * REFUSED BY NAME and never scored as an unstable export — the row's control.
 */
import { readFileSync, appendFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { odtEntry, odsEntry, odpEntry } from "../bio-plane/src/odf.mjs";
import { readDriveAddress } from "../bio-plane/src/drive.mjs";

const ENTRY = { odt: odtEntry, ods: odsEntry, odp: odpEntry };
const sha = (b) => createHash("sha256").update(b).digest("hex");

/* ---------------------------------------------------------------- *
 * THE COMPARISON INSTRUMENT — pure, and the thing the control drives.
 * ---------------------------------------------------------------- */

/** Read one take's bytes. Refuses (never scores) anything that is not the
 *  asked-for ODF package. Returns { ok, refused?, bytesSha, contentXmlSha, text }. */
export async function readTake(format, bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const head = Buffer.from(b.subarray(0, 512)).toString("latin1");
  if (!(b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04)) {
    const html = /<!doctype html|<html[\s>]/i.test(head);
    return { ok: false, refused: html ? "SHELL_TEXT_HTML" : "NOT_AN_ODF_PACKAGE",
      detail: html ? "the body is text/html (an application shell or a sign-in page), not an export"
                   : "the body does not begin with a ZIP local-file header",
      bytes: b.length, bytesSha: sha(b) };
  }
  const entry = ENTRY[format];
  const det = entry.detect(b, "");
  if (!det || det.format !== format || det.confidence !== "certain")
    return { ok: false, refused: "NOT_THE_ASKED_FORMAT",
      detail: `asked ${format}; bytes detect as ${det ? `${det.format} (${det.confidence})` : "nothing"}`,
      bytes: b.length, bytesSha: sha(b) };
  const parts = await entry.parts(b);
  const cx = partBytes(parts, "content.xml");
  const t = await entry.text(parts);
  if (!t || !t.ok || typeof t.document !== "string")
    return { ok: false, refused: "TEXT_UNREADABLE", detail: JSON.stringify(t?.undetermined ?? t).slice(0, 300),
      bytes: b.length, bytesSha: sha(b) };
  return { ok: true, bytes: b.length, bytesSha: sha(b), contentXmlSha: cx ? sha(cx) : null,
    text: t.document, textSha: sha(Buffer.from(t.document, "utf8")), chars: t.document.length };
}

/* The content.xml odfParts() already decoded — the SAME string the plane's text
 * reader walks, so its digest is D-351's `content.xml` digest and not a copy. */
function partBytes(parts, name) {
  if (name !== "content.xml" || !parts || typeof parts.contentXml !== "string") return null;
  return Buffer.from(parts.contentXml, "utf8");
}

/** Compare the takes of ONE target. Refused takes are excluded and COUNTED;
 *  a target with fewer than 2 readable takes is UNDETERMINED, never stable. */
export function compareTakes(takes) {
  const read = takes.filter((t) => t.ok);
  const refused = takes.filter((t) => !t.ok).map((t) => t.refused);
  if (read.length < 2)
    return { verdict: "UNDETERMINED", why: `${read.length} readable take(s); stability needs at least 2`,
      readable: read.length, refused };
  const distinct = (k) => new Set(read.map((t) => t[k])).size;
  const out = { readable: read.length, refused,
    distinctBytes: distinct("bytesSha"), distinctContentXml: distinct("contentXmlSha"),
    distinctText: distinct("textSha") };
  out.verdict = out.distinctText === 1 ? "TEXT_STABLE" : "TEXT_UNSTABLE";
  out.d351 = out.distinctBytes === 1
    ? "D-351's byte instability DID NOT REPRODUCE for this target: every take byte-identical"
    : `D-351 reproduced: ${out.distinctBytes} distinct byte digests over ${read.length} takes`;
  if (out.verdict === "TEXT_UNSTABLE") out.diff = diffClass(read.map((t) => t.text));
  return out;
}

/** Name the diff class between the first take and every other that differs:
 *  lengths, first differing offset, and the differing window on each side. */
export function diffClass(texts) {
  const a = texts[0], out = [];
  for (let i = 1; i < texts.length; i++) {
    const b = texts[i];
    if (a === b) continue;
    let p = 0; while (p < a.length && p < b.length && a[p] === b[p]) p++;
    let s = 0; while (s < a.length - p && s < b.length - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
    out.push({ take: i, lenA: a.length, lenB: b.length, firstDiff: p,
      a: a.slice(p, a.length - s).slice(0, 120), b: b.slice(p, b.length - s).slice(0, 120),
      whitespaceOnly: a.replace(/\s+/g, "") === b.replace(/\s+/g, "") });
  }
  return out;
}

/* ---------------------------------------------------------------- *
 * A minimal ODF package builder for the control (stored members).
 * ---------------------------------------------------------------- */
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (b) => { let c = 0xffffffff; for (const x of b) c = CRC[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
export function zipStored(members, mtime = 0) {
  const locals = [], centrals = []; let off = 0;
  for (const [name, data] of members) {
    const n = Buffer.from(name), d = Buffer.from(data), c = crc32(d);
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(mtime & 0xffff, 10); lh.writeUInt32LE(c, 14); lh.writeUInt32LE(d.length, 18);
    lh.writeUInt32LE(d.length, 22); lh.writeUInt16LE(n.length, 26);
    const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(mtime & 0xffff, 12); ch.writeUInt32LE(c, 16); ch.writeUInt32LE(d.length, 20);
    ch.writeUInt32LE(d.length, 24); ch.writeUInt16LE(n.length, 28); ch.writeUInt32LE(off, 42);
    locals.push(lh, n, d); centrals.push(ch, n); off += 30 + n.length + d.length;
  }
  const cd = Buffer.concat(centrals), e = Buffer.alloc(22);
  e.writeUInt32LE(0x06054b50, 0); e.writeUInt16LE(members.length, 8); e.writeUInt16LE(members.length, 10);
  e.writeUInt32LE(cd.length, 12); e.writeUInt32LE(off, 16);
  return new Uint8Array(Buffer.concat([...locals, cd, e]));
}
const odt = (para, mtime = 0) => zipStored([
  ["mimetype", "application/vnd.oasis.opendocument.text"],
  ["META-INF/manifest.xml", `<?xml version="1.0" encoding="UTF-8"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3"><manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>`],
  ["content.xml", `<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" office:version="1.3"><office:body><office:text><text:p>${para}</text:p></office:text></office:body></office:document-content>`],
], mtime);

async function cmdControl() {
  let fail = 0, n = 0;
  const check = (name, cond, got) => { n++; if (!cond) fail++;
    console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}${got !== undefined ? ` — got ${JSON.stringify(got)}` : ""}`); };
  const P = "The Bicycle and Pedestrian Advisory Commission meets monthly.";
  const Q = "The Bicycle and Pedestrian Advisory Commission meets monthlz.";   /* ONE byte planted */
  console.log("DECLARED: arms 1,3,4 MUST read as named; arm 2 MUST read TEXT_UNSTABLE; arm 5 MUST refuse.");

  console.log("arm 0 — the fixture is non-empty and readable by the plane's own reader");
  const base = await readTake("odt", odt(P));
  check("fixture text read", base.ok && base.text.includes("Bicycle"), base.ok ? base.text : base);
  check("fixture corpus non-empty", base.ok && base.chars > 20, base.chars);

  console.log("arm 1 — two IDENTICAL exports read TEXT_STABLE and D-351 did not reproduce");
  const same = compareTakes([await readTake("odt", odt(P)), await readTake("odt", odt(P))]);
  check("verdict TEXT_STABLE", same.verdict === "TEXT_STABLE", same.verdict);
  check("says D-351 did not reproduce", /DID NOT REPRODUCE/.test(same.d351), same.d351);

  console.log("arm 2 — a planted ONE-BYTE text difference is DETECTED");
  const planted = compareTakes([await readTake("odt", odt(P)), await readTake("odt", odt(Q))]);
  check("verdict TEXT_UNSTABLE", planted.verdict === "TEXT_UNSTABLE", planted.verdict);
  check("diff names the offset", planted.diff?.[0]?.firstDiff === P.length - 2, planted.diff?.[0]?.firstDiff);

  console.log("arm 3 — OVER-STRICTNESS: envelope differs (timestamp), text identical → TEXT_STABLE, D-351 reproduced");
  const env = compareTakes([await readTake("odt", odt(P, 1)), await readTake("odt", odt(P, 2))]);
  check("verdict TEXT_STABLE", env.verdict === "TEXT_STABLE", env.verdict);
  check("bytes differ (2 digests)", env.distinctBytes === 2, env.distinctBytes);
  check("content.xml identical", env.distinctContentXml === 1, env.distinctContentXml);

  console.log("arm 4 — a SHELL (text/html) is REFUSED BY NAME, never scored");
  const shell = new TextEncoder().encode("<!DOCTYPE html><html><head><title>Google Docs</title></head><body>Sign in</body></html>");
  const s1 = await readTake("odt", shell);
  check("refused SHELL_TEXT_HTML", !s1.ok && s1.refused === "SHELL_TEXT_HTML", s1.refused);
  const mixed = compareTakes([s1, base, await readTake("odt", shell)]);
  check("one readable take → UNDETERMINED, never unstable", mixed.verdict === "UNDETERMINED", mixed.verdict);
  check("refusals counted by name", mixed.refused.join() === "SHELL_TEXT_HTML,SHELL_TEXT_HTML", mixed.refused);

  console.log("arm 5 — an ODF of the WRONG kind is refused, not scored");
  const wrong = await readTake("ods", odt(P));
  check("refused NOT_THE_ASKED_FORMAT", !wrong.ok && wrong.refused === "NOT_THE_ASKED_FORMAT", wrong.refused);

  console.log(`\n${n - fail}/${n} assertions passing${fail ? ` · ${fail} FAILED` : ""}`);
  process.exit(fail ? 1 : 0);
}

/* ---------------------------------------------------------------- *
 * LIVE.
 * ---------------------------------------------------------------- */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function plane() {
  const inst = process.env.BIO_INSTANCE, tok = process.env.BIO_ADMIN_TOKEN;
  if (!inst || !tok) { console.error("BIO_INSTANCE and BIO_ADMIN_TOKEN are required"); process.exit(2); }
  return { base: `https://${inst}.believeinoakland.workers.dev/api/`, tok };
}
async function call(P, op, qs, init) {
  const u = `${P.base}?op=${op}&store=scratch&token=${encodeURIComponent(P.tok)}${qs ? "&" + qs : ""}`;
  return fetch(u, init);
}
function findSha(o) {
  let hit = null;
  (function walk(x, k) { if (hit) return;
    if (typeof x === "string" && /^[0-9a-f]{64}$/.test(x) && /sha/i.test(k || "")) { hit = x; return; }
    if (x && typeof x === "object") for (const [kk, v] of Object.entries(x)) walk(v, kk); })(o, "");
  return hit;
}

async function cmdRun(targetsPath, N, outPath) {
  const P = plane();
  const targets = readFileSync(targetsPath, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  if (!targets.length) { console.error("EMPTY TARGET LIST — refusing to report over nothing"); process.exit(3); }
  writeFileSync(outPath, "");
  const log = (o) => appendFileSync(outPath, JSON.stringify(o) + "\n");
  log({ kind: "meta", started: new Date().toISOString(), N, targets: targets.length, instance: process.env.BIO_INSTANCE,
    version: await (await fetch(P.base.replace(/api\/$/, "version"))).text() });
  for (const t of targets) {
    const d = readDriveAddress(t.url);
    if (!d || !d.harvestable) {
      log({ kind: "target", url: t.url, shape: d?.shape ?? "not-drive", harvestable: false, why: d?.why });
      console.log(`- ${d?.shape ?? "not-drive"}  ${t.url}`); continue;
    }
    const takes = [];
    for (let i = 0; i < N; i++) {
      const at = new Date().toISOString();
      const r = await call(P, "acquire", "", { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ locator: t.url }) });
      const j = await r.json().catch(() => ({ ok: false, reason: "NON_JSON_ANSWER" }));
      if (!j.ok) { takes.push({ ok: false, at, refused: `PLANE:${j.reason ?? r.status}`, status: j.status ?? r.status,
        detail: (j.detail ?? j.error ?? "").toString().slice(0, 200) }); await sleep(6000); continue; }
      const s = findSha(j.document ?? j);
      const b = s ? new Uint8Array(await (await call(P, "capture", `sha256=${s}`)).arrayBuffer()) : null;
      const take = b ? await readTake(d.format, b) : { ok: false, refused: "NO_SHA_IN_ANSWER" };
      if (b && take.bytesSha !== s) { take.ok = false; take.refused = "READBACK_DIGEST_MISMATCH"; }
      takes.push({ at, captureSha: s, existed: j.existed, ...take });
      await sleep(6000);
    }
    const cmp = compareTakes(takes);
    log({ kind: "target", url: t.url, shape: d.shape, format: d.format, fileId: d.fileId, harvestable: true,
      takes: takes.map(({ text, ...rest }) => rest), compare: cmp,
      sample: takes.find((x) => x.ok)?.text?.slice(0, 200) ?? null });
    console.log(`- ${d.format}  ${cmp.verdict}  bytes=${cmp.distinctBytes ?? "-"} cx=${cmp.distinctContentXml ?? "-"} text=${cmp.distinctText ?? "-"} refused=${cmp.refused.join("|") || "none"}  ${d.fileId}`);
  }
  log({ kind: "meta", finished: new Date().toISOString() });
}

function cmdDerive(outPath) {
  const rows = readFileSync(outPath, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const tg = rows.filter((r) => r.kind === "target");
  const by = {};
  for (const r of tg) {
    const k = r.harvestable ? r.format : `not harvestable: ${r.shape}`;
    const b = (by[k] ??= { targets: 0, takes: 0, readable: 0, stable: 0, unstable: 0, undetermined: 0, bytesStable: 0, cxStable: 0, refusals: {} });
    b.targets++;
    if (!r.harvestable) continue;
    b.takes += r.takes.length; b.readable += r.compare.readable;
    b[{ TEXT_STABLE: "stable", TEXT_UNSTABLE: "unstable", UNDETERMINED: "undetermined" }[r.compare.verdict]]++;
    if (r.compare.distinctBytes === 1) b.bytesStable++;
    if (r.compare.distinctContentXml === 1) b.cxStable++;
    for (const x of r.compare.refused) b.refusals[x] = (b.refusals[x] ?? 0) + 1;
  }
  console.log(JSON.stringify(by, null, 1));
}

const [mode, ...a] = process.argv.slice(2);
if (mode === "control") await cmdControl();
else if (mode === "run") await cmdRun(a[0], Number(a[1] ?? 3), a[2] ?? "drive-export-run.jsonl");
else if (mode === "derive") cmdDerive(a[0]);
else { console.error("usage: control | run <targets.jsonl> <N> <out.jsonl> | derive <out.jsonl>"); process.exit(2); }
