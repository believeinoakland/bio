/* mail-reader: an Outlook message (MSG, MS-OXMSG) read from its compound file: the same fields an EML answers
 * (R2), its transport headers where the message kept them (R7, R8), its attachments listed in their stored order
 * (R9) and embedded messages followed for the nesting count (R10). Pure; never throws (R11, R15). */
import { readCfb, hasCfbMagic } from "../ooxml.mjs";
import { parseHeaders, charsetText, htmlText } from "./mime.mjs";

const u16 = (b, o) => b[o] | (b[o + 1] << 8);
const u32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;
const UTF16 = new TextDecoder("utf-16le");

const PROPS = "__properties_version1.0";
const ATTACH = /^__attach_version1\.0_#([0-9A-Fa-f]{8})$/;
const RECIP = /^__recip_version1\.0_#([0-9A-Fa-f]{8})$/;
const SUBSTG = /^__substg1\.0_([0-9A-Fa-f]{4})([0-9A-Fa-f]{4})$/;

/* True when the bytes are a compound file holding a message's property streams. */
export function isMsg(bytes) {
  if (!hasCfbMagic(bytes)) return false;
  const cfb = readCfb(bytes);
  if (!cfb) return false;
  const names = cfb.children(cfb.root).map((e) => e.name);
  return names.includes(PROPS) && names.some((n) => SUBSTG.test(n));
}

/* One storage's properties: the `__substg1.0_` streams by id and type, and the fixed-size values of its
 * properties stream (`headerBytes` 32 for a top-level message, 24 for an embedded one, 8 for a recipient or an
 * attachment). */
function propsOf(cfb, storage, headerBytes, codepage) {
  const kids = cfb.children(storage);
  const strings = new Map(), binaries = new Map(), objects = new Map(), fixed = new Map();
  for (const e of kids) {
    const m = SUBSTG.exec(e.name);
    if (!m) continue;
    const id = parseInt(m[1], 16), type = parseInt(m[2], 16);
    if (e.type === 1 && type === 0x000d) { objects.set(id, e); continue; }
    const bytes = cfb.stream(e);
    if (!bytes) continue;
    if (type === 0x001f) strings.set(id, UTF16.decode(bytes).replace(/\0+$/, ""));
    else if (type === 0x001e) strings.set(id, { raw: bytes });
    else if (type === 0x0102) binaries.set(id, bytes);
  }
  const ps = kids.find((e) => e.name === PROPS && e.type === 2);
  const pb = ps ? cfb.stream(ps) : null;
  if (pb) {
    for (let at = headerBytes; at + 16 <= pb.length; at += 16) {
      const tag = u32(pb, at), type = tag & 0xffff, id = tag >>> 16;
      if (type === 0x0003) fixed.set(id, u32(pb, at + 8) | 0);
      else if (type === 0x000b) fixed.set(id, u16(pb, at + 8) !== 0);
      else if (type === 0x0040) fixed.set(id, { lo: u32(pb, at + 8), hi: u32(pb, at + 12) });
    }
  }
  const cp = codepage ?? fixed.get(0x3fde) ?? fixed.get(0x3ffd) ?? null;
  const label = cp === 65001 ? "utf-8" : cp === 20127 ? "us-ascii" : cp === 28591 ? "iso-8859-1" : Number.isInteger(cp) && cp > 0 ? `windows-${cp}` : "windows-1252";
  const str = (id) => {
    const v = strings.get(id);
    if (v == null) return null;
    if (typeof v === "string") return v;
    return charsetText(v.raw, label).text.replace(/\0+$/, "");
  };
  return { kids, str, bin: (id) => binaries.get(id) ?? null, obj: (id) => objects.get(id) ?? null, fixed: (id) => fixed.get(id), codepage: cp };
}

/* A FILETIME (100 ns since 1601-01-01 UTC) as an ISO instant; null for zero or out of range. */
function filetime(v) {
  if (!v || (v.lo === 0 && v.hi === 0)) return null;
  const ms = (v.hi * 4294967296 + v.lo) / 10000 - 11644473600000;
  const d = new Date(ms);
  return Number.isFinite(ms) && !Number.isNaN(d.getTime()) ? d.toISOString() : null;
}

const person = (name, address) => {
  const n = name && name.trim(), a = address && address.trim();
  if (n && a && n !== a) return `${n} <${a}>`;
  return n || a || null;
};

/* The bytes of every stream under a storage, its sub-storages included. */
function storageBytes(cfb, storage) {
  let n = 0;
  const stack = [storage];
  while (stack.length) for (const k of cfb.children(stack.pop())) { if (k.type === 2) n += cfb.stream(k)?.length ?? 0; else if (k.type === 1) stack.push(k); }
  return n;
}

/* One message storage read: {fields, headers (from the properties), body, attachments, nested}. */
function readStorage(cfb, storage, headerBytes, codepage) {
  const P = propsOf(cfb, storage, headerBytes, codepage);
  const transport = P.str(0x007d);
  const fields = transport ? parseHeaders(new TextEncoder().encode(transport)).fields : [];
  const recips = { 1: [], 2: [] };
  const attachStorages = [];
  for (const e of P.kids) {
    if (e.type !== 1) continue;
    if (RECIP.test(e.name)) {
      const R = propsOf(cfb, e, 8, P.codepage);
      const kind = R.fixed(0x0c15) ?? 1;
      const entry = person(R.str(0x3001), R.str(0x39fe) ?? R.str(0x3003));
      if (entry && recips[kind]) recips[kind].push({ n: parseInt(RECIP.exec(e.name)[1], 16), entry });
    } else if (ATTACH.test(e.name)) attachStorages.push({ n: parseInt(ATTACH.exec(e.name)[1], 16), e });
  }
  const list = (kind, fallbackId) => {
    const r = recips[kind].sort((a, b) => a.n - b.n).map((x) => x.entry);
    return r.length ? r.join(", ") : P.str(fallbackId);
  };
  const html = P.bin(0x1013) ?? P.str(0x1013);
  const htmlString = html == null ? null : typeof html === "string" ? html : charsetText(html, P.codepage === 65001 ? "utf-8" : null).text;
  const plain = P.str(0x1000);
  let text = "", from = "none", remote = 0;
  if (plain != null && plain !== "") { text = plain; from = "plain"; }
  if (htmlString != null) {
    const h = htmlText(htmlString);
    remote = h.remote;
    if (from === "none") { text = h.text; from = "html"; }
  }
  const attachments = [];
  const nested = [];
  for (const { e } of attachStorages.sort((a, b) => a.n - b.n)) {
    const A = propsOf(cfb, e, 8, P.codepage);
    const method = A.fixed(0x3705);
    const embedded = A.obj(0x3701);
    const data = A.bin(0x3701);
    const cid = A.str(0x3712);
    const item = {
      index: attachments.length,
      name_stated: A.str(0x3707) ?? A.str(0x3704) ?? A.str(0x3001),
      type_stated: embedded || method === 5 ? "message/rfc822" : (A.str(0x370e) || "application/octet-stream").toLowerCase(),
      size: data ? data.length : 0,
      inline: A.fixed(0x7ffe) === true || (cid != null && cid !== "" && htmlString != null && htmlString.includes(`cid:${cid}`)),
      content_id: cid || null,
      bytes: data,
    };
    if (embedded) {
      const inner = readStorage(cfb, embedded, 24, P.codepage);
      item.size = inner.size;
      item.cut = false;
      item.bytes = null;
      nested.push(inner);
      item.nested = inner;
    }
    attachments.push(item);
  }
  const size = storageBytes(cfb, storage);
  return {
    fields,
    props: {
      from: person(P.str(0x0c1a) ?? P.str(0x0042), P.str(0x5d01) ?? P.str(0x0c1f) ?? P.str(0x0065)),
      to: list(1, 0x0e04), cc: list(2, 0x0e03),
      subject: P.str(0x0037), message_id: P.str(0x1035),
      date_utc: filetime(P.fixed(0x0039)) ?? filetime(P.fixed(0x0e06)),
    },
    body: { text, from, encoding: from === "none" ? null : "utf-16le", transfer: null, remote_refs: remote },
    attachments, size,
  };
}

/* An MSG's parse: {ok, fields, props, body, attachments, nested}, or {ok:false, reason}. */
export function parseMsg(bytes) {
  try {
    if (!(bytes instanceof Uint8Array) || bytes.length === 0) return { ok: false, reason: "MAIL_EMPTY" };
    const cfb = readCfb(bytes);
    if (!cfb) return { ok: false, reason: "MAIL_MSG_CONTAINER_BAD" };
    const names = cfb.children(cfb.root).map((e) => e.name);
    if (!names.includes(PROPS)) return { ok: false, reason: "MAIL_NOT_A_MESSAGE" };
    return { ok: true, ...readStorage(cfb, cfb.root, 32, null) };
  } catch {
    return { ok: false, reason: "MAIL_MALFORMED" };
  }
}
