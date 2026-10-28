#!/usr/bin/env node
/* proto-mem/1f (THROWAWAY): deterministic text-family fixture generator for L1 (and the mailbox/calendar kinds).
   No copyrighted content: words are pseudo-words from a seeded xorshift. Same arguments => byte-identical file (stated by the sha256 it prints).
   The LAST line always carries the truth token  TRUTH-<seed>-<kind>-<bytes>  so a reader's search can be checked against it.
   node gen-text.mjs --kind=text|json|json1|ndjson|xml|xmldeep|csv|tsv|html|ics|vcf|srt|vtt|mbox|eml --out=FILE --bytes=N [--seed=1] [--enc=utf8|utf16|cp1252] [--rows=N] [--depth=D] [--count=N]
   Prints one JSON line: {file, bytes, sha256, rows, token, kind, enc}. The file is exactly --bytes long (an ASCII pad inside the final line makes it so), except ics/vcf/mbox/srt/vtt/eml
   which are sized by --count (events, cards, messages, hours, ...) and report their size. */
import { createWriteStream } from "node:fs";
import { createHash } from "node:crypto";
const arg = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, "").split("="); return [k, v.join("=") || "1"]; }));
const kind = arg.kind || "text", out = arg.out, target = Number(arg.bytes || 0), seed = Number(arg.seed || 1), enc = arg.enc || "utf8";
if (!out) { console.error("--out required"); process.exit(2); }
let s = (seed * 2654435761) >>> 0 || 1;
const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
const syl = ["ka", "to", "mi", "ren", "sol", "vi", "dar", "ne", "pho", "lu", "ba", "cri", "tem", "or", "an", "gue", "shi", "ros", "ment", "tion"];
const accented = ["é", "ñ", "ü", "ß", "ç", "å"];   /* U+00A0..U+00FF: the same bytes in latin1 and windows-1252 */
const vocab = Array.from({ length: 6000 }, () => { let w = ""; const n = 2 + Math.floor(rnd() * 2); for (let i = 0; i < n; i++) w += syl[Math.floor(rnd() * syl.length)]; if (enc !== "utf8" || arg.accents) w += accented[Math.floor(rnd() * accented.length)]; return w; });
const words = (n) => Array.from({ length: n }, () => vocab[Math.floor(rnd() * vocab.length)]).join(" ");
const token = `TRUTH-${seed}-${kind}-${target || arg.count}`;
const esc = (x) => x.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const pad = (n) => "x".repeat(Math.max(0, n));
const sep = kind === "tsv" ? "\t" : ",";
const bytesOf = (str) => enc === "utf16" ? str.length * 2 : Buffer.byteLength(str, enc === "cp1252" ? "latin1" : "utf8");
const encode = (str) => Buffer.from(str, enc === "utf16" ? "utf16le" : enc === "cp1252" ? "latin1" : "utf8");

/* each kind: head (string), row(i) -> string, tail(padChars) -> string, with the row count */
let n = 0, head = "", tailOf, rowOf, widthFix = null;
const rowsGiven = arg.rows ? Number(arg.rows) : null;
switch (kind) {
  case "text": rowOf = () => words(12) + "\n"; tailOf = (p) => `${token}${pad(p)}\n`; break;
  case "html": head = "<!doctype html><html><head><meta charset=\"utf-8\"><title>fixture</title></head><body>\n"; rowOf = () => `<p>${words(14)}</p>\n`; tailOf = (p) => `<p>${token}${pad(p)}</p></body></html>\n`; break;
  case "ndjson": rowOf = (i) => `{"id":${i},"t":"${words(8)}","v":${(rnd() * 1000).toFixed(2)}}\n`; tailOf = (p) => `{"truth":"${token}","pad":"${pad(p)}"}\n`; break;
  case "json": head = "[\n"; rowOf = (i) => `{"id":${i},"t":"${words(8)}","v":${(rnd() * 1000).toFixed(2)}},\n`; tailOf = (p) => `{"truth":"${token}","pad":"${pad(p)}"}]\n`; break;
  case "json1": head = "["; rowOf = (i) => `{"id":${i},"t":"${words(8)}","v":${(rnd() * 1000).toFixed(2)}},`; tailOf = (p) => `{"truth":"${token}","pad":"${pad(p)}"}]`; break;
  case "xml": head = "<?xml version=\"1.0\" encoding=\"" + (enc === "utf16" ? "UTF-16" : enc === "cp1252" ? "windows-1252" : "UTF-8") + "\"?>\n<root>\n"; rowOf = (i) => `<r id="${i}"><t>${esc(words(8))}</t><v>${(rnd() * 1000).toFixed(2)}</v></r>\n`; tailOf = (p) => `<truth>${token}${pad(p)}</truth></root>\n`; break;
  case "xmldeep": { const D = Number(arg.depth || 1000); head = "<?xml version=\"1.0\"?>\n<root>" + "<n>".repeat(D) + "\n"; rowOf = (i) => `<r id="${i}">${esc(words(8))}</r>\n`; tailOf = (p) => `<truth>${token}${pad(p)}</truth>` + "</n>".repeat(D) + "</root>\n"; break; }
  case "csv": case "tsv": {
    head = ["id", "name", "note", "amount", "date"].join(sep) + "\n";
    rowOf = (i) => { const note = words(rowsGiven ? 2 : 6); const r = [i, "n" + (i % 977), note, (rnd() * 10000).toFixed(2), `20${10 + (i % 15)}-0${1 + (i % 9)}-1${i % 9}`].join(sep); return r + "\n"; };
    tailOf = (p) => ["9999999999", token + pad(p), "end", "0.00", "2099-01-01"].join(sep) + "\n";
    if (rowsGiven) widthFix = Math.floor((target - head.length - 80) / rowsGiven);   /* even rows so --rows N lands near --bytes */
    break; }
  default: break;
}
const h = createHash("sha256");
const ws = createWriteStream(out);
let written = 0;
const put = async (str) => { const b = encode(str); h.update(b); written += b.length; if (!ws.write(b)) await new Promise((r) => ws.once("drain", r)); };
if (enc === "utf16") { const bom = Buffer.from([0xff, 0xfe]); h.update(bom); written += 2; ws.write(bom); }
else if (enc === "utf8" && arg.bom) { const bom = Buffer.from([0xef, 0xbb, 0xbf]); h.update(bom); written += 3; ws.write(bom); }

if (["ics", "vcf", "srt", "vtt", "mbox", "eml"].includes(kind)) {
  const count = Number(arg.count || 1000);
  const ts = (sec) => { const hh = String(Math.floor(sec / 3600)).padStart(2, "0"), mm = String(Math.floor(sec / 60) % 60).padStart(2, "0"), ss = String(sec % 60).padStart(2, "0"); return `${hh}:${mm}:${ss}`; };
  if (kind === "ics") { await put("BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//fixture//EN\r\n"); for (let i = 0; i < count; i++) { await put(`BEGIN:VEVENT\r\nUID:ev-${i}@fixture\r\nDTSTAMP:20260101T000000Z\r\nDTSTART:2026${String(1 + (i % 12)).padStart(2, "0")}${String(1 + (i % 28)).padStart(2, "0")}T090000Z\r\nSUMMARY:${words(5)}\r\nDESCRIPTION:${words(20)}\r\nEND:VEVENT\r\n`); n++; } await put(`BEGIN:VEVENT\r\nUID:truth@fixture\r\nSUMMARY:${token}\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`); n++; }
  else if (kind === "vcf") { for (let i = 0; i < count; i++) { await put(`BEGIN:VCARD\r\nVERSION:3.0\r\nFN:${words(2)}\r\nN:${words(1)};${words(1)};;;\r\nTEL:+1555${String(1000000 + i).slice(-7)}\r\nNOTE:${words(10)}\r\nEND:VCARD\r\n`); n++; } await put(`BEGIN:VCARD\r\nVERSION:3.0\r\nFN:${token}\r\nEND:VCARD\r\n`); n++; }
  else if (kind === "srt" || kind === "vtt") { const hours = Number(arg.hours || 3), cues = Math.floor(hours * 3600 / 3); if (kind === "vtt") await put("WEBVTT\n\n"); for (let i = 0; i < cues; i++) { const a = ts(i * 3), b = ts(i * 3 + 2); await put(kind === "srt" ? `${i + 1}\n${a},000 --> ${b},500\n${words(7)}\n\n` : `${a}.000 --> ${b}.500\n${words(7)}\n\n`); n++; } await put(kind === "srt" ? `${cues + 1}\n${ts(cues * 3)},000 --> ${ts(cues * 3 + 2)},500\n${token}\n` : `${ts(cues * 3)}.000 --> ${ts(cues * 3 + 2)}.500\n${token}\n`); n++; }
  else if (kind === "mbox") { const per = target ? Math.max(200, Math.floor(target / count) - 250) : 400; for (let i = 0; i < count; i++) { let body = ""; while (body.length < per) body += words(12) + "\n"; await put(`From fixture${i}@example.test Mon Jan  1 00:00:00 2026\nFrom: a${i % 97}@example.test\nTo: b@example.test\nSubject: ${words(4)}\nMessage-ID: <m${i}@fixture>\nDate: Mon, 01 Jan 2026 00:00:00 +0000\n\n${body}\n`); n++; } await put(`From fixture-truth@example.test Mon Jan  1 00:00:00 2026\nFrom: t@example.test\nSubject: ${token}\nMessage-ID: <truth@fixture>\n\n${token}\n\n`); n++; }
  else { /* eml: 3 attachments of random-looking base64 (arg.attbytes each, default 1 MiB) */
    const att = Number(arg.attbytes || 1048576); const bnd = "=_fixture_boundary_";
    await put(`From: a@example.test\r\nTo: b@example.test\r\nSubject: ${token}\r\nMIME-Version: 1.0\r\nContent-Type: multipart/mixed; boundary="${bnd}"\r\n\r\n--${bnd}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${words(40)}\r\n${token}\r\n`);
    for (let k = 0; k < 3; k++) { await put(`--${bnd}\r\nContent-Type: application/octet-stream; name="att${k}.bin"\r\nContent-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename="att${k}.bin"\r\n\r\n`); const raw = Buffer.alloc(att); for (let i = 0; i < att; i++) raw[i] = Math.floor(rnd() * 256); const b64 = raw.toString("base64"); for (let i = 0; i < b64.length; i += 76) await put(b64.slice(i, i + 76) + "\r\n"); n++; }
    await put(`--${bnd}--\r\n`); }
} else {
  if (!target) { console.error("--bytes required"); process.exit(2); }
  if (head) await put(head);
  const rest = () => target - written;
  const tailBytes0 = bytesOf(tailOf(0));
  let batch = "";
  while (rest() - tailBytes0 > 70000 + (widthFix || 0)) {
    batch = "";
    for (let k = 0; k < 400 && rest() - tailBytes0 - bytesOf(batch) > 70000 + (widthFix || 0); k++) {
      let r = rowOf(n++);
      if (widthFix && bytesOf(r) < widthFix) r = r.slice(0, r.length - 1) + pad(widthFix - bytesOf(r)) + "\n";
      batch += r;
    }
    await put(batch);
  }
  /* fill the remaining space with short rows, then the exact-length last line */
  while (rest() - tailBytes0 > 200) { let r = rowOf(n++); if (bytesOf(r) > rest() - tailBytes0 - 100) break; if (widthFix && bytesOf(r) < widthFix) r = r.slice(0, r.length - 1) + pad(widthFix - bytesOf(r)) + "\n"; await put(r); }
  const last = rest() - tailBytes0;
  if (last < 0) { console.error("target too small for this kind"); process.exit(3); }
  await put(tailOf(enc === "utf16" ? last / 2 : last)); n++;
}
await new Promise((r) => ws.end(r));
console.log(JSON.stringify({ file: out, kind, enc, bytes: written, sha256: h.digest("hex"), rows: n, token, requested: target || null }));
