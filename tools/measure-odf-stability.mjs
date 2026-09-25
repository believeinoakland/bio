#!/usr/bin/env node
/* D-473 — IS AN OPENDOCUMENT EXPORT'S content.xml BYTE-STABLE ONCE NORMALISED?
 *
 * What it measures: for each target, Google's OpenDocument export fetched in
 * TWO ROUNDS apart in time, through the PLANE'S OWN EGRESS (`op=acquire` into
 * `store=scratch`, named on every call — CLAUDE.md §5, D-325), read back by
 * `op=capture` and checked against the sha the acquire returned. Per pair it
 * compares (a) the raw content.xml, (b) the plane's own evidentiary digest
 * (`odfEvidentiaryDigest`, so "stable" means stable as the PRODUCT digests
 * it, never as a second implementation here would), and (c) the DIFF CLASS
 * of content.xml: which element/attribute NAMES carry differing values.
 *
 * WHAT IT NEVER RECORDS: document text or attribute VALUES. The log holds
 * digests, counts and XML names only, so the committed figure carries nothing
 * a document says (D-473's row: the earlier pull of CAP-11's captures was
 * refused for PII, and this instrument is built so its log could not hold any).
 * The fetched packages are kept ONLY in the directory the caller names (the
 * session scratchpad), so `derive` can re-digest them under a control arm.
 *
 * Modes:
 *   node tools/measure-odf-stability.mjs control
 *       offline negative control over synthetic packages; exit 0 only if every arm holds.
 *   node tools/measure-odf-stability.mjs fetch <targets.jsonl> <round> <dir>
 *       live: one acquire per target, bytes saved as <dir>/<fileId>.<round>.<fmt>.
 *       Needs BIO_INSTANCE and BIO_ADMIN_TOKEN; never prints the token.
 *   node tools/measure-odf-stability.mjs derive <targets.jsonl> <dir>
 *       the per-target and per-format table over rounds 1 and 2.
 */
import { readFileSync, writeFileSync, existsSync, appendFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { odtEntry, odsEntry, odpEntry, odfEvidentiaryDigest, odtNormalisedContentXml } from "../bio-plane/src/odf.mjs";
import { readDriveAddress } from "../bio-plane/src/drive.mjs";

const ENTRY = { odt: odtEntry, ods: odsEntry, odp: odpEntry };
const sha = (b) => createHash("sha256").update(b).digest("hex");
const sha256Hex = async (b) => sha(b);

/* ---------------------------------------------------------------- *
 * THE COMPARISON — pure, and the thing the control drives.
 * ---------------------------------------------------------------- */

/** One take: refuses (never scores) anything that is not the asked-for package. */
export async function readTake(format, bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (!(b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04)) {
    const html = /<!doctype html|<html[\s>]/i.test(Buffer.from(b.subarray(0, 512)).toString("latin1"));
    return { ok: false, refused: html ? "SHELL_TEXT_HTML" : "NOT_AN_ODF_PACKAGE", bytesSha: sha(b) };
  }
  const entry = ENTRY[format];
  const det = entry.detect(b, "");
  if (!det || det.format !== format || det.confidence !== "certain")
    return { ok: false, refused: "NOT_THE_ASKED_FORMAT", bytesSha: sha(b) };
  const parts = await entry.parts(b);
  const cx = parts && typeof parts.contentXml === "string" ? parts.contentXml : null;
  const ev = await odfEvidentiaryDigest(b, sha256Hex);
  /* The CANDIDATE: content.xml through the plane's own `.odt` normaliser,
     taken whether or not the plane yet claims .odt as measured — this is the
     figure that decides the claim. .odp is digested raw: no normalisation is
     proposed for it, so its candidate IS its raw content.xml. */
  const cxBytes = cx === null ? null : new Uint8Array(Buffer.from(cx, "utf8"));
  const cand = cxBytes === null ? null : format === "odt" ? odtNormalisedContentXml(cxBytes) : cxBytes;
  return { ok: true, bytes: b.length, bytesSha: sha(b), contentXml: cx,
    contentXmlSha: cx === null ? null : sha(cxBytes),
    candidate: cand ? sha(cand) : null,
    evidentiary: ev.determined ? ev.evidentiary : null,
    evidentiaryWhy: ev.determined ? null : ev.basis };
}

/** The differing (element, attribute) NAMES between two content.xml strings,
 *  with counts; never a value. Text runs that differ are COUNTED, not shown.
 *  A differing tag COUNT is itself the class ("structure"), and nothing finer is claimed. */
export function diffClass(a, b) {
  const tok = (s) => s.split(/(<[^>]+>)/).filter(Boolean);
  const A = tok(a), B = tok(b);
  if (A.length !== B.length) return { structure: true, tokensA: A.length, tokensB: B.length, attrs: {}, textRuns: 0 };
  const attrs = {}; let textRuns = 0;
  const parse = (t) => { const m = /^<\/?([\w.:-]+)/.exec(t); const at = {};
    for (const x of t.matchAll(/([\w.-]+(?::[\w.-]+)?)\s*=\s*("([^"]*)"|'([^']*)')/g)) at[x[1]] = x[3] ?? x[4];
    return { name: m ? m[1] : "?", at }; };
  for (let i = 0; i < A.length; i++) {
    if (A[i] === B[i]) continue;
    if (A[i][0] !== "<" || B[i][0] !== "<") { textRuns++; continue; }
    const p = parse(A[i]), q = parse(B[i]);
    if (p.name !== q.name) { const k = `${p.name}|${q.name} (element name)`; attrs[k] = (attrs[k] ?? 0) + 1; continue; }
    for (const k of new Set([...Object.keys(p.at), ...Object.keys(q.at)]))
      if (p.at[k] !== q.at[k]) { const key = `${p.name}@${k}`; attrs[key] = (attrs[key] ?? 0) + 1; }
  }
  return { structure: false, tokens: A.length, attrs, textRuns };
}

/** A pair's verdict. Raw content.xml and the evidentiary digest are judged
 *  separately; a pair with a refused or undigested side is UNDETERMINED. */
export function comparePair(t1, t2) {
  if (!t1?.ok || !t2?.ok)
    return { verdict: "UNDETERMINED", why: `refused: ${[t1, t2].filter((t) => !t?.ok).map((t) => t?.refused ?? "ABSENT").join("|")}` };
  const out = { envelopeEqual: t1.bytesSha === t2.bytesSha, rawContentXmlEqual: t1.contentXmlSha === t2.contentXmlSha };
  if (!out.rawContentXmlEqual) out.diff = diffClass(t1.contentXml, t2.contentXml);
  if (t1.evidentiary === null || t2.evidentiary === null)
    return { ...out, verdict: "UNDETERMINED", why: `no evidentiary digest: ${t1.evidentiaryWhy ?? t2.evidentiaryWhy}` };
  out.verdict = t1.evidentiary === t2.evidentiary ? "EVIDENTIARY_STABLE" : "EVIDENTIARY_UNSTABLE";
  return out;
}
/** The pair judged on the CANDIDATE normalisation alone (the plane's normaliser
 *  over content.xml), ignoring the member-reference refusal the product digest
 *  also applies: the question here is whether the normalised BYTES are stable. */
export function compareCandidate(t1, t2) {
  if (!t1?.ok || !t2?.ok || !t1.candidate || !t2.candidate) return "UNDETERMINED";
  return t1.candidate === t2.candidate ? "NORMALISED_STABLE" : "NORMALISED_UNSTABLE";
}

/* A minimal stored-member ZIP writer for the control (a copy of the one in
 * measure-drive-export.mjs, whose module runs its own CLI on import). */
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (b) => { let c = 0xffffffff; for (const x of b) c = CRC[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function zipStored(members, mtime = 0) {
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

/* ---------------------------------------------------------------- *
 * CONTROL — synthetic packages only; no network.
 * ---------------------------------------------------------------- */
const MANIFEST = (mt) => `<?xml version="1.0" encoding="UTF-8"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3"><manifest:file-entry manifest:full-path="/" manifest:media-type="${mt}"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>`;
export const odtWithLists = (ids, para = "Agenda item one.", continueTo = null, mtime = 0) => zipStored([
  ["mimetype", "application/vnd.oasis.opendocument.text"],
  ["META-INF/manifest.xml", MANIFEST("application/vnd.oasis.opendocument.text")],
  ["content.xml", `<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:xml="http://www.w3.org/XML/1998/namespace" office:version="1.3"><office:body><office:text><text:p>${para}</text:p>`
    + ids.map((id, i) => `<text:list xml:id="${id}"${continueTo !== null && i === ids.length - 1 ? ` text:continue-list="${ids[continueTo]}"` : ""}><text:list-item><text:p>item ${i}</text:p></text:list-item></text:list>`).join("")
    + `</office:text></office:body></office:document-content>`],
], mtime);

async function cmdControl() {
  let fail = 0, n = 0;
  const check = (name, cond, got) => { n++; if (!cond) fail++;
    console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}${got !== undefined ? ` — got ${JSON.stringify(got)}` : ""}`); };
  console.log("DECLARED: arm 1 MUST read EVIDENTIARY_STABLE with raw content.xml DIFFERING by text:list@xml:id only;");
  console.log("          arm 2 MUST read EVIDENTIARY_UNSTABLE; arm 3 MUST read EVIDENTIARY_STABLE; arm 4 MUST read UNDETERMINED.");
  const a = await readTake("odt", odtWithLists(["list888038964", "list123"], undefined, null, 1));
  console.log("arm 0 — the fixture is a real package the plane's reader and digest accept");
  check("fixture read, content.xml non-empty", a.ok && (a.contentXml ?? "").length > 200, a.ok ? a.contentXml.length : a);
  check("fixture carries an evidentiary digest", a.ok && typeof a.evidentiary === "string", a.evidentiaryWhy);
  console.log("arm 1 — two exports differing ONLY by M-123's random xml:id on text:list (and the envelope)");
  const b = await readTake("odt", odtWithLists(["list3685929024", "list987"], undefined, null, 2));
  const p1 = comparePair(a, b);
  check("candidate NORMALISED_STABLE", compareCandidate(a, b) === "NORMALISED_STABLE", compareCandidate(a, b));
  check("verdict EVIDENTIARY_STABLE", p1.verdict === "EVIDENTIARY_STABLE", p1.verdict);
  check("raw content.xml DIFFERS (the class is present, not assumed)", p1.rawContentXmlEqual === false, p1.rawContentXmlEqual);
  check("diff class is exactly text:list@xml:id ×2", JSON.stringify(p1.diff?.attrs) === JSON.stringify({ "text:list@xml:id": 2 }), p1.diff?.attrs);
  console.log("arm 2 — a ONE-BYTE text change under fresh ids is DETECTED");
  const c = await readTake("odt", odtWithLists(["list5", "list6"], "Agenda item onf."));
  const p2 = comparePair(a, c);
  check("candidate NORMALISED_UNSTABLE", compareCandidate(a, c) === "NORMALISED_UNSTABLE", compareCandidate(a, c));
  check("verdict EVIDENTIARY_UNSTABLE", p2.verdict === "EVIDENTIARY_UNSTABLE", p2.verdict);
  check("diff counts one text run", p2.diff?.textRuns === 1, p2.diff?.textRuns);
  console.log("arm 3 — OVER-STRICTNESS: a text:continue-list that references a random id, relabelled consistently");
  const d = await readTake("odt", odtWithLists(["list11", "list12"], undefined, 0));
  const e = await readTake("odt", odtWithLists(["list91", "list92"], undefined, 0));
  const p3 = comparePair(d, e);
  check("candidate NORMALISED_STABLE", compareCandidate(d, e) === "NORMALISED_STABLE", compareCandidate(d, e));
  check("verdict EVIDENTIARY_STABLE", p3.verdict === "EVIDENTIARY_STABLE", p3.verdict);
  console.log("arm 3b — a list that continues a DIFFERENT list is a real change and must move the digest");
  const f = await readTake("odt", odtWithLists(["list91", "list92", "list93"], undefined, 1));
  const g = await readTake("odt", odtWithLists(["list11", "list12", "list13"], undefined, 0));
  check("candidate NORMALISED_UNSTABLE", compareCandidate(f, g) === "NORMALISED_UNSTABLE", compareCandidate(f, g));
  check("verdict EVIDENTIARY_UNSTABLE", comparePair(f, g).verdict === "EVIDENTIARY_UNSTABLE", comparePair(f, g).verdict);
  console.log("arm 4 — a SHELL is refused by name and the pair is UNDETERMINED, never unstable");
  const s = await readTake("odt", new TextEncoder().encode("<!DOCTYPE html><html><body>Sign in</body></html>"));
  check("refused SHELL_TEXT_HTML", s.refused === "SHELL_TEXT_HTML", s.refused);
  check("pair UNDETERMINED", comparePair(a, s).verdict === "UNDETERMINED", comparePair(a, s).verdict);
  console.log(`\n${n - fail}/${n} assertions passing${fail ? ` · ${fail} FAILED` : ""}`);
  process.exit(fail ? 1 : 0);
}

/* ---------------------------------------------------------------- *
 * LIVE.
 * ---------------------------------------------------------------- */
const readTargets = (p) => {
  const t = readFileSync(p, "utf8").split("\n").filter((l) => l.trim() && !l.startsWith("#")).map((l) => JSON.parse(l));
  if (!t.length) { console.error("EMPTY TARGET LIST — refusing to report over nothing"); process.exit(3); }
  return t;
};
function plane() {
  const inst = process.env.BIO_INSTANCE, tok = process.env.BIO_ADMIN_TOKEN;
  if (!inst || !tok) { console.error("BIO_INSTANCE and BIO_ADMIN_TOKEN are required"); process.exit(2); }
  return { base: `https://${inst}.believeinoakland.workers.dev/api/`, tok };
}
const call = (P, op, qs, init) => fetch(`${P.base}?op=${op}&store=scratch&token=${encodeURIComponent(P.tok)}${qs ? "&" + qs : ""}`, init);
function findSha(o) {
  let hit = null;
  (function walk(x, k) { if (hit) return;
    if (typeof x === "string" && /^[0-9a-f]{64}$/.test(x) && /sha/i.test(k || "")) { hit = x; return; }
    if (x && typeof x === "object") for (const [kk, v] of Object.entries(x)) walk(v, kk); })(o, "");
  return hit;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cmdFetch(targetsPath, round, dir) {
  const P = plane(); mkdirSync(dir, { recursive: true });
  const log = `${dir}/fetch.jsonl`;
  const version = await (await fetch(P.base.replace(/api\/$/, "version"))).text();
  for (const t of readTargets(targetsPath)) {
    const d = readDriveAddress(t.url);
    const at = new Date().toISOString();
    if (!d?.harvestable) { appendFileSync(log, JSON.stringify({ round, at, url: t.url, harvestable: false, shape: d?.shape }) + "\n"); continue; }
    const r = await call(P, "acquire", "", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ locator: t.url }) });
    const j = await r.json().catch(() => ({ ok: false, reason: "NON_JSON_ANSWER" }));
    let row = { round, at, version, fileId: d.fileId, format: d.format };
    if (!j.ok) row = { ...row, refused: `PLANE:${j.reason ?? r.status}`, status: j.status ?? r.status };
    else {
      /* The whole-body sha is `document.capture.sha256`; a capture over the 8 MiB
         part bound is stored as `document.parts[]` and read back part by part,
         each part checked, then the whole checked against the capture sha. */
      const s = j.document?.capture?.sha256 ?? findSha(j.document ?? j);
      const get = async (h) => { const x = new Uint8Array(await (await call(P, "capture", `sha256=${h}`)).arrayBuffer());
        return sha(x) === h ? x : null; };
      let b = null;
      if (s && Array.isArray(j.document?.parts) && j.document.parts.length > 1) {
        const ps = []; for (const p of j.document.parts) ps.push(await get(p.sha256));
        b = ps.every(Boolean) ? new Uint8Array(Buffer.concat(ps)) : new Uint8Array(0);
        row.parts = ps.length;
      } else if (s) b = new Uint8Array(await (await call(P, "capture", `sha256=${s}`)).arrayBuffer());
      if (!b) row.refused = "NO_SHA_IN_ANSWER";
      else if (sha(b) !== s) row.refused = "READBACK_DIGEST_MISMATCH";
      else { writeFileSync(`${dir}/${d.fileId}.${round}.${d.format}`, b); row.captureSha = s; row.bytes = b.length; }
    }
    appendFileSync(log, JSON.stringify(row) + "\n");
    console.log(`- r${round} ${d.format} ${row.refused ?? "ok " + row.bytes + " B"}  ${d.fileId}`);
    await sleep(6000);
  }
}

async function cmdDerive(targetsPath, dir) {
  const by = {}; let floor = 0;
  for (const t of readTargets(targetsPath)) {
    const d = readDriveAddress(t.url);
    if (!d?.harvestable) continue;
    /* The pair is the two EARLIEST rounds held for this target (normally 1 and
       2; a take refused in round 1 is paired from rounds 2 and 3), and the
       rounds used are printed, so no pair is silently re-chosen. */
    const held = [1, 2, 3, 4].filter((r) => existsSync(`${dir}/${d.fileId}.${r}.${d.format}`));
    const rounds = held.length >= 2 ? held.slice(0, 2) : [1, 2];
    const take = async (r) => { const p = `${dir}/${d.fileId}.${r}.${d.format}`;
      return existsSync(p) ? readTake(d.format, readFileSync(p)) : { ok: false, refused: "NOT_FETCHED" }; };
    const t1 = await take(rounds[0]), t2 = await take(rounds[1]);
    const c = comparePair(t1, t2);
    c.candidate = compareCandidate(t1, t2);
    if (t1.ok && t2.ok) floor++;
    const b = (by[d.format] ??= { targets: 0, pairs: 0, envelopeEqual: 0, rawCxEqual: 0, normalisedStable: 0, normalisedUnstable: 0,
      stable: 0, unstable: 0, undetermined: 0, undeterminedWhy: {}, diffClass: {} });
    if (c.candidate === "NORMALISED_STABLE") b.normalisedStable++;
    if (c.candidate === "NORMALISED_UNSTABLE") b.normalisedUnstable++;
    if (c.verdict === "UNDETERMINED") { const w = String(c.why).slice(0, 60); b.undeterminedWhy[w] = (b.undeterminedWhy[w] ?? 0) + 1; }
    b.targets++; if (t1.ok && t2.ok) b.pairs++;
    if (c.envelopeEqual) b.envelopeEqual++; if (c.rawContentXmlEqual) b.rawCxEqual++;
    b[{ EVIDENTIARY_STABLE: "stable", EVIDENTIARY_UNSTABLE: "unstable", UNDETERMINED: "undetermined" }[c.verdict]]++;
    for (const [k, v] of Object.entries(c.diff?.attrs ?? {})) b.diffClass[k] = (b.diffClass[k] ?? 0) + v;
    if (c.diff?.structure) b.diffClass["(tag count differs)"] = (b.diffClass["(tag count differs)"] ?? 0) + 1;
    if (c.diff?.textRuns) b.diffClass["(text runs)"] = (b.diffClass["(text runs)"] ?? 0) + c.diff.textRuns;
    console.log(`${d.format}  ${c.candidate.padEnd(19)} ${c.verdict.padEnd(20)} r${rounds.join("/")} env=${c.envelopeEqual ? "=" : "≠"} rawcx=${c.rawContentXmlEqual ? "=" : "≠"} ${d.fileId}  ${c.why ?? JSON.stringify(c.diff?.attrs ?? {})}${c.diff?.textRuns ? ` textRuns=${c.diff.textRuns}` : ""}${c.diff?.structure ? " STRUCTURE" : ""}`);
  }
  console.log(JSON.stringify(by, null, 1));
  console.log(`pairs readable on both rounds: ${floor}`);
  if (!floor) { console.error("NO READABLE PAIR — refusing to report a figure over nothing"); process.exit(3); }
}

const [mode, ...a] = process.argv.slice(2);
if (mode === "control") await cmdControl();
else if (mode === "fetch") await cmdFetch(a[0], Number(a[1]), a[2]);
else if (mode === "derive") await cmdDerive(a[0], a[1]);
else { console.error("usage: control | fetch <targets.jsonl> <round> <dir> | derive <targets.jsonl> <dir>"); process.exit(2); }
