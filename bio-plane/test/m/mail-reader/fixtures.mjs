/* mail-reader tests' inputs: messages, Outlook messages and mailboxes generated when the test runs. Each is an
 * input this module reads, never another module's answer. ZIP, PDF and XLSX members come from test-support. */

const enc = new TextEncoder();
export const bytes = (s) => (typeof s === "string" ? enc.encode(s) : s);

export function concat(...parts) {
  const bs = parts.map(bytes);
  const out = new Uint8Array(bs.reduce((n, b) => n + b.length, 0));
  let at = 0;
  for (const b of bs) { out.set(b, at); at += b.length; }
  return out;
}

/* base64 wrapped at 76 characters */
export function b64(data) {
  const s = Buffer.from(bytes(data)).toString("base64");
  return s.replace(/.{76}/g, "$&\r\n");
}

/* quoted-printable of UTF-8 text, soft breaks every 70 characters */
export function qp(text) {
  let out = "", line = "";
  for (const b of enc.encode(text)) {
    const ch = b === 0x0a ? "\r\n" : (b >= 33 && b <= 126 && b !== 61) || b === 32 ? String.fromCharCode(b) : `=${b.toString(16).toUpperCase().padStart(2, "0")}`;
    if (ch === "\r\n") { out += line + ch; line = ""; continue; }
    if (line.length + ch.length > 70) { out += `${line}=\r\n`; line = ""; }
    line += ch;
  }
  return out + line;
}

/* A message: header lines then the body, CRLF line ends. */
export function eml(headers, body = "") {
  return concat(`${headers.join("\r\n")}\r\n\r\n`, body);
}

export const STANDARD = [
  "From: Ada Lane <ada@example.org>",
  "To: Clerk <clerk@example.gov>",
  "Cc: Ben <ben@example.org>",
  "Date: Tue, 6 Oct 2026 09:30:00 -0700",
  "Subject: Records request",
  "Message-ID: <m1@example.org>",
  "MIME-Version: 1.0",
];

/* A multipart body: each part `{headers, body}`. */
export function multipart(boundary, parts, { close = true } = {}) {
  const pieces = [];
  for (const p of parts) pieces.push(`--${boundary}\r\n`, `${p.headers.join("\r\n")}\r\n\r\n`, bytes(p.body), "\r\n");
  if (close) pieces.push(`--${boundary}--\r\n`);
  return concat(...pieces);
}

export const attachmentPart = (name, type, data, { inline = false, cid = null } = {}) => ({
  headers: [`Content-Type: ${type}; name="${name}"`, `Content-Disposition: ${inline ? "inline" : "attachment"}; filename="${name}"`, "Content-Transfer-Encoding: base64", ...(cid ? [`Content-ID: <${cid}>`] : [])],
  body: b64(data),
});

export const rfc822Part = (inner, name = "inner.eml") => ({
  headers: ["Content-Type: message/rfc822", `Content-Disposition: attachment; filename="${name}"`],
  body: inner,
});

/* A message holding `attachments` (parts) beside a plain body. */
export function withAttachments(attachments, text = "See attached.", headers = STANDARD, boundary = "b-mix") {
  return eml([...headers, `Content-Type: multipart/mixed; boundary="${boundary}"`], multipart(boundary, [
    { headers: ["Content-Type: text/plain; charset=utf-8"], body: text },
    ...attachments,
  ]));
}

/* ---- a compound file (MS-CFB, version 3) and an Outlook message in it --------------------------------------------- */

const u16le = (v) => [v & 255, (v >> 8) & 255];
const u32le = (v) => [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255];
const utf16 = (s) => { const out = new Uint8Array(s.length * 2); for (let i = 0; i < s.length; i++) { out[2 * i] = s.charCodeAt(i) & 255; out[2 * i + 1] = s.charCodeAt(i) >> 8; } return out; };

/* A compound file of `tree`: `{name: Uint8Array | {…storage}}` under the root. Streams under 4096 bytes are in the
 * mini stream; children are linked as a right-leaning chain, a valid (unbalanced) tree. */
export function cfb(tree) {
  const entries = [{ name: "Root Entry", type: 5, kids: [] }];
  const add = (obj, parent) => {
    for (const [name, v] of Object.entries(obj)) {
      const e = v instanceof Uint8Array ? { name, type: 2, data: v, kids: [] } : { name, type: 1, kids: [] };
      entries.push(e);
      parent.kids.push(entries.length - 1);
      if (e.type === 1) add(v, e);
    }
  };
  add(tree, entries[0]);
  const SS = 512, MINI = 64, CUT = 4096;
  const mini = [], big = [];
  for (const e of entries) if (e.type === 2) (e.data.length < CUT ? mini : big).push(e);
  let miniBytes = 0;
  for (const e of mini) { e.start = e.data.length ? miniBytes / MINI : 0xfffffffe; miniBytes += Math.ceil(e.data.length / MINI) * MINI; if (!e.data.length) e.start = 0xfffffffe; }
  const miniSectors = miniBytes / MINI;
  const nMiniFat = Math.ceil((miniSectors * 4) / SS);
  const nMiniStream = Math.ceil(miniBytes / SS);
  const nDir = Math.ceil((entries.length * 128) / SS);
  const bigCounts = big.map((e) => Math.ceil(e.data.length / SS));
  const content = nDir + nMiniFat + nMiniStream + bigCounts.reduce((a, b) => a + b, 0);
  let nFat = 1;
  while (nFat * 128 < content + nFat) nFat++;
  if (nFat > 109) throw new Error("cfb fixture: too large");
  const fat = new Array(nFat * 128).fill(0xffffffff);
  let next = 0;
  const run = (count) => { const start = next; for (let i = 0; i < count; i++) fat[next + i] = i + 1 < count ? next + i + 1 : 0xfffffffe; next += count; return count ? start : 0xfffffffe; };
  for (let i = 0; i < nFat; i++) fat[next++] = 0xfffffffd;
  const dirStart = run(nDir), miniFatStart = run(nMiniFat), miniStreamStart = run(nMiniStream);
  for (let i = 0; i < big.length; i++) big[i].start = run(bigCounts[i]);
  const total = next;
  const out = new Uint8Array(SS * (total + 1));
  out.set([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], 0);
  out.set([...u16le(0x3e), ...u16le(3), ...u16le(0xfffe), ...u16le(9), ...u16le(6)], 0x18);
  out.set(u32le(nFat), 0x2c); out.set(u32le(dirStart), 0x30); out.set(u32le(4096), 0x38);
  out.set(u32le(nMiniFat ? miniFatStart : 0xfffffffe), 0x3c); out.set(u32le(nMiniFat), 0x40);
  out.set(u32le(0xfffffffe), 0x44); out.set(u32le(0), 0x48);
  for (let i = 0; i < 109; i++) out.set(u32le(i < nFat ? i : 0xffffffff), 0x4c + 4 * i);
  const sec = (n) => SS * (n + 1);
  fat.forEach((v, i) => out.set(u32le(v), sec(Math.floor(i / 128)) + 4 * (i % 128)));
  /* directory */
  entries.forEach((e, i) => {
    const at = sec(dirStart) + 128 * i;
    const nm = utf16(e.name);
    out.set(nm.subarray(0, 62), at);
    out.set(u16le(Math.min(nm.length, 62) + 2), at + 0x40);
    out[at + 0x42] = e.type; out[at + 0x43] = 1;
    e.right = 0xffffffff; e.left = 0xffffffff;
  });
  for (const e of entries) e.kids.forEach((k, j) => { entries[k].right = j + 1 < e.kids.length ? e.kids[j + 1] : 0xffffffff; });
  entries.forEach((e, i) => {
    const at = sec(dirStart) + 128 * i;
    out.set(u32le(e.left), at + 0x44); out.set(u32le(e.right), at + 0x48); out.set(u32le(e.kids.length ? e.kids[0] : 0xffffffff), at + 0x4c);
    if (e.type === 5) { out.set(u32le(nMiniStream ? miniStreamStart : 0xfffffffe), at + 0x74); out.set(u32le(miniBytes), at + 0x78); }
    if (e.type === 2) { out.set(u32le(e.data.length ? e.start : 0xfffffffe), at + 0x74); out.set(u32le(e.data.length), at + 0x78); }
  });
  for (let i = entries.length; i < nDir * 4; i++) { const at = sec(dirStart) + 128 * i; out.set(u32le(0xffffffff), at + 0x44); out.set(u32le(0xffffffff), at + 0x48); out.set(u32le(0xffffffff), at + 0x4c); }
  /* mini FAT and mini stream */
  let m = 0;
  for (const e of mini) {
    const n = Math.ceil(e.data.length / MINI);
    for (let i = 0; i < n; i++) out.set(u32le(i + 1 < n ? m + i + 1 : 0xfffffffe), sec(miniFatStart) + 4 * (m + i));
    out.set(e.data, sec(miniStreamStart) + m * MINI);
    m += n;
  }
  for (let i = m; i < nMiniFat * 128; i++) out.set(u32le(0xffffffff), sec(miniFatStart) + 4 * i);
  for (const e of big) out.set(e.data, sec(e.start));
  return out;
}

const tagName = (id, type) => `__substg1.0_${id.toString(16).toUpperCase().padStart(4, "0")}${type.toString(16).toUpperCase().padStart(4, "0")}`;
const str = (id, s) => [tagName(id, 0x001f), utf16(`${s}\0`).subarray(0, s.length * 2)];
const props = (header, fixed) => {
  const out = [...new Array(header).fill(0)];
  for (const [id, type, value] of fixed) {
    out.push(...u32le(((id << 16) | type) >>> 0), ...u32le(6));
    if (type === 0x0040) out.push(...u32le(value.lo), ...u32le(value.hi));
    else out.push(...u32le(value), 0, 0, 0, 0);
  }
  return Uint8Array.from(out);
};

/* A FILETIME of an ISO instant. */
export function filetime(iso) {
  const t = (BigInt(Date.parse(iso)) + 11644473600000n) * 10000n;
  return { lo: Number(t & 0xffffffffn), hi: Number(t >> 32n) };
}

/* An Outlook message's storage: subject, sender, recipients, plain or HTML body, transport headers, attachments
 * (`{name, mime, data, cid, hidden}` or `{embedded: spec}`). */
function msgTree(spec, header) {
  const t = {};
  const put = ([k, v]) => { t[k] = v; };
  if (spec.subject != null) put(str(0x0037, spec.subject));
  if (spec.fromName != null) put(str(0x0c1a, spec.fromName));
  if (spec.fromAddress != null) put(str(0x5d01, spec.fromAddress));
  if (spec.messageId != null) put(str(0x1035, spec.messageId));
  if (spec.body != null) put(str(0x1000, spec.body));
  if (spec.html != null) t[tagName(0x1013, 0x0102)] = bytes(spec.html);
  if (spec.transport != null) put(str(0x007d, spec.transport));
  t["__properties_version1.0"] = props(header, spec.date ? [[0x0039, 0x0040, filetime(spec.date)]] : []);
  (spec.recipients ?? []).forEach((r, i) => {
    const s = {};
    [str(0x3001, r.name), str(0x39fe, r.address)].forEach(([k, v]) => { s[k] = v; });
    s["__properties_version1.0"] = props(8, [[0x0c15, 0x0003, r.kind ?? 1]]);
    t[`__recip_version1.0_#${i.toString(16).toUpperCase().padStart(8, "0")}`] = s;
  });
  (spec.attachments ?? []).forEach((a, i) => {
    const s = {};
    if (a.embedded) {
      s[tagName(0x3701, 0x000d)] = msgTree(a.embedded, 24);
      s["__properties_version1.0"] = props(8, [[0x3705, 0x0003, 5]]);
      if (a.name) { const [k, v] = str(0x3707, a.name); s[k] = v; }
    } else {
      s[tagName(0x3701, 0x0102)] = bytes(a.data);
      [str(0x3707, a.name), str(0x370e, a.mime ?? "application/octet-stream"), ...(a.cid ? [str(0x3712, a.cid)] : [])].forEach(([k, v]) => { s[k] = v; });
      s["__properties_version1.0"] = props(8, [[0x3705, 0x0003, 1], ...(a.hidden ? [[0x7ffe, 0x000b, 1]] : [])]);
    }
    t[`__attach_version1.0_#${i.toString(16).toUpperCase().padStart(8, "0")}`] = s;
  });
  return t;
}

export const msg = (spec) => cfb({ "__nameid_version1.0": {}, ...msgTree(spec, 32) });

/* ---- a mailbox generated window by window ---------------------------------------------------------------------------- */

/* A range source of `count` messages, each exactly `size` bytes, message `i`'s body carrying `token-<i>`; nothing
 * is held but one message's template. `reads` counts the bytes asked. */
export function mailboxSource(count, size, { lastToken = null } = {}) {
  const make = (i) => {
    const head = `From sender@example.org Tue Oct  6 09:30:00 2026\nFrom: Sender <sender@example.org>\nTo: clerk@example.gov\nSubject: message ${i}\nDate: Tue, 6 Oct 2026 09:30:00 -0700\nMessage-ID: <m${i}@example.org>\n\ntoken-${i}${i === count - 1 && lastToken ? ` ${lastToken}` : ""}\n`;
    const fill = size - head.length - 2;
    if (fill < 0) throw new Error("mailboxSource: size too small");
    const line = "From the minutes of the meeting, a line of body text.\n";
    let body = "";
    while (body.length + line.length <= fill) body += i === 0 && body.length === 0 ? ">From the escaped line.".padEnd(line.length - 1, ".") + "\n" : line;
    return bytes(`${head}${body}${".".repeat(fill - body.length)}\n\n`);
  };
  const cache = new Map();
  const at = (i) => { if (!cache.has(i)) { if (cache.size > 4) cache.clear(); cache.set(i, make(i)); } return cache.get(i); };
  const source = {
    size: count * size, reads: 0,
    async readRange(offset, length) {
      source.reads += length;
      const out = new Uint8Array(length);
      let o = 0;
      while (o < length) {
        const pos = offset + o, i = Math.floor(pos / size), within = pos % size;
        const m = at(i);
        const n = Math.min(size - within, length - o);
        out.set(m.subarray(within, within + n), o);
        o += n;
      }
      return out;
    },
  };
  return source;
}
