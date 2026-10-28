/* mail-reader: email read from bytes (N1266; K5435, K5437). An internet message (EML), an Outlook message (MSG)
 * and a mailbox (MBOX): the header fields as the message states them, the body as text decoded from every
 * transfer and character encoding, and each attachment listed in a stable order and cut on request, so that
 * `capture` files each as its own member (R1-R13).
 *
 * Pure (R15): no store, no network, no clock. Nothing a message names is fetched: an HTML body is cleaned to text
 * and its remote references counted, never requested (R5). Every ceiling is a `READ_BOUNDS` row read through
 * `boundOf` (R14). Every call answers `{ok: false, reason, detail, ...}` on a failure and never throws (R11). The
 * same bytes give the same answer whatever route they came by (R6): the answer carries nothing of the route but
 * the bound it was judged against on a refusal. */
import { boundOf, statement } from "../read-bounds.mjs";
import { localize } from "../setup-words/index.mjs";
import { listArchive, streamMember, hasZipMagic, hasCfbMagic } from "../ooxml.mjs";
import { allOf, firstOf, decodeWords, parseDate } from "./mime.mjs";
import { parseEml } from "./eml.mjs";
import { parseMsg, isMsg } from "./msg.mjs";
import { sourceOf, countMessages, readPiece } from "./mbox.mjs";

/* The ceilings, each read when it is needed (R14; `runtime-limits` R37, R46). */
const mailBound = (name) => boundOf("mail", name);
/* a message by its route: received by address `mail.message_bytes`, uploaded `message.upload_bytes` (K5578 (2)) */
const routeRow = (route) => (route === "address" ? ["mail", "message_bytes"] : ["message", "upload_bytes"]);
const routeBound = (route) => boundOf(...routeRow(route));
const uploadBound = () => boundOf("message", "upload_bytes");
/* MBOX is an archive kind (runtime-limits R37): its message count is the archive's row */
const mailboxCap = () => boundOf("archive", "mailbox_messages");

export const MAIL_FORMATS = Object.freeze(["eml", "msg", "mbox"]);

/* ---- refusals: a code, the member's sentence and the facts it states (DEC-83) ---------------------------------- */

function sentence(reason, v) {
  switch (reason) {
    case "MAIL_TOO_LARGE": return localize("mail-reader.refusal.too_large", "This message is {size} bytes, more than the {bound} bytes a message may be. Save its attachments separately and bring them in one by one.", v);
    case "MAIL_TOO_NESTED": return localize("mail-reader.refusal.too_nested", "This message is nested more than {max} levels deep (it reached {depth}); nothing deeper is opened. Open the inner message and bring it in on its own.", v);
    case "MAIL_MAILBOX_TOO_MANY": return localize("mail-reader.refusal.mailbox_too_many", "This mailbox holds more than {bound} messages, so it is not read. Split it into smaller mailboxes and bring each in.", v);
    case "MAIL_MAILBOX_TOO_LARGE": return localize("mail-reader.refusal.mailbox_too_large", "This mailbox is {size} bytes, more than the {bound} bytes a mailbox may be. Split it into smaller mailboxes and bring each in.", v);
    case "MAIL_BOUNDARY_BAD": return localize("mail-reader.refusal.boundary_bad", "This message's parts are not separated the way it declares, so it cannot be read. Ask the sender for a fresh copy.", v);
    case "MAIL_MSG_CONTAINER_BAD": return localize("mail-reader.refusal.msg_container_bad", "This Outlook message is damaged or cut short, so it cannot be read. Save it again from Outlook and bring it in.", v);
    case "MAIL_EMPTY": return localize("mail-reader.refusal.empty", "This file is empty, so there is no message to read.", v);
    case "MAIL_NOT_A_MESSAGE": return localize("mail-reader.refusal.not_a_message", "This file is not an email message, so it is not read as one.", v);
    case "MAIL_IS_MAILBOX": return localize("mail-reader.refusal.is_mailbox", "This file is a mailbox of messages, not one message; it is read as a mailbox.", v);
    case "MAIL_MAILBOX_MALFORMED": return localize("mail-reader.refusal.mailbox_malformed", "This file does not begin like a mailbox, so its messages cannot be found.", v);
    case "MAIL_SOURCE_UNREADABLE": return localize("mail-reader.refusal.source_unreadable", "This message could not be read from storage. Try again in a moment.", v);
    case "MAIL_ATTACHMENT_NO_SUCH": return localize("mail-reader.refusal.attachment_no_such", "This message has no attachment {index}.", v);
    case "MAIL_ATTACHMENT_NOT_CUT": return localize("mail-reader.refusal.attachment_not_cut", "Attachment {index} is a message kept inside this Outlook message; it is read with the message, not on its own.", v);
    default: return localize("mail-reader.refusal.malformed", "This message is damaged in a way that stops it being read. Ask the sender for a fresh copy.", v);
  }
}

function refused(reason, facts = {}) {
  const v = { size: "", bound: "", max: "", depth: "", index: "" };
  for (const [k, x] of Object.entries(facts)) if (x != null) v[k] = x;
  return { ok: false, reason, detail: sentence(reason, v), ...facts };
}

/* ---- detection by content (R13; `format-registry` R34, R35) ------------------------------------------------------ */

const MAIL_HEADERS = new Set(["from", "to", "cc", "date", "subject", "message-id", "received", "mime-version", "return-path", "delivered-to", "reply-to", "sender", "in-reply-to", "references", "content-type", "x-mailer", "authentication-results", "dkim-signature"]);
const HEAD_PROBE = 64 * 1024;
const LATIN1 = new TextDecoder("latin1");

/* A head that is a message's header block: its first line a header field, every line to the blank line a field or a
 * continuation, and at least two of them fields a message carries (From and one more). */
function looksLikeEml(b) {
  const head = b.subarray(0, Math.min(b.length, HEAD_PROBE));
  if (head.includes(0)) return false;
  const text = LATIN1.decode(head);
  if (text.startsWith("From ")) return false;
  const end = text.search(/\r?\n\r?\n/);
  /* a header block longer than the probe is judged on the probe's whole lines */
  const block = end >= 0 ? text.slice(0, end) : head.length < b.length ? text.slice(0, Math.max(0, text.lastIndexOf("\n"))) : text;
  const lines = block.split(/\r?\n/).filter((l, i, all) => l !== "" || i < all.length - 1);
  if (!lines.length) return false;
  if (!/^[\x21-\x39\x3b-\x7e]+:/.test(lines[0])) return false;
  const names = new Set();
  for (const l of lines) {
    if (/^[ \t]/.test(l)) continue;
    const m = /^([\x21-\x39\x3b-\x7e]+):/.exec(l);
    if (!m) return false;
    names.add(m[1].toLowerCase());
  }
  const known = [...names].filter((n) => MAIL_HEADERS.has(n));
  return known.length >= 2 && (names.has("from") || names.has("received") || names.has("message-id"));
}

/* A mailbox: a `From ` separator line first, then a message's header block. */
function looksLikeMbox(b) {
  const head = b.subarray(0, Math.min(b.length, HEAD_PROBE));
  if (head.includes(0)) return false;
  const text = LATIN1.decode(head);
  const m = /^From [^\s]+[^\r\n]*\r?\n/.exec(text);
  if (!m) return false;
  return looksLikeEml(head.subarray(m[0].length));
}

/** The format of a message's bytes by content alone: "eml", "msg", "mbox" or null. Never throws. */
export function detectMail(bytes) {
  try {
    if (!(bytes instanceof Uint8Array) || !bytes.length) return null;
    if (hasCfbMagic(bytes)) return isMsg(bytes) ? "msg" : null;
    if (looksLikeMbox(bytes)) return "mbox";
    if (looksLikeEml(bytes)) return "eml";
    return null;
  } catch { return null; }
}

/* ---- the answer -------------------------------------------------------------------------------------------------- */

function headersOf(fields, props = {}) {
  const one = (n) => { const v = firstOf(fields, n); return v == null ? null : decodeWords(v); };
  const many = (n) => { const v = allOf(fields, n).map(decodeWords); return v.length ? v : null; };
  const unreadable = {};
  const stated = one("date");
  let date = stated, date_utc = parseDate(stated);
  if (stated != null && date_utc == null) { unreadable.date = "MAIL_DATE_UNREADABLE"; date = null; }
  if (stated == null && props.date_utc) { date = props.date_utc; date_utc = props.date_utc; }
  const rp = allOf(fields, "return-path");
  const return_path = rp.length ? (/^<\s*>$/.test(rp[0].trim()) || rp[0].trim() === "" ? "<>" : rp[0].trim()) : null;
  return {
    headers: {
      from: one("from") ?? props.from ?? null,
      to: one("to") ?? props.to ?? null,
      cc: one("cc") ?? props.cc ?? null,
      date, date_utc,
      subject: one("subject") ?? props.subject ?? null,
      message_id: one("message-id") ?? props.message_id ?? null,
      received: many("received"),
      authentication_results: many("authentication-results"),
      auto_submitted: one("auto-submitted"),
      precedence: one("precedence"),
      list_id: one("list-id"),
      return_path,
    },
    unreadable,
  };
}

const listing = (a) => ({
  index: a.index, name_stated: a.name_stated, type_stated: a.type_stated, size: a.size, inline: a.inline,
  content_id: a.content_id, cut: a.cut !== false,
});

/* ---- the nesting count, archives and messages together (R10) ----------------------------------------------------- */

async function memberBytes(zip, row) {
  const { chunks, done } = streamMember(zip, row);
  const parts = [];
  let n = 0, kept = true;
  for await (const c of chunks) {
    if (!parts.length && !(hasZipMagic(c) || hasCfbMagic(c) || detectMail(c) === "eml")) { kept = false; break; }
    parts.push(c); n += c.length;
  }
  const end = await done;
  if (!kept || !end || end.ok === false) return null;
  const out = new Uint8Array(n);
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}

/* The items one level below an item: a message's attachments that are messages or archives, an archive's members
 * that are. */
async function childrenOf(item) {
  if (item.kind === "zip") {
    const list = await listArchive(item.bytes);
    if (!list.ok) return [];
    const out = [];
    for (const row of list.entries) {
      if (row.verdict !== "ok") continue;
      const b = await memberBytes(item.bytes, row);
      if (b) out.push(classify(b, null));
    }
    return out.filter(Boolean);
  }
  return (item.parsed?.attachments ?? []).map((a) => (a.nested ? { kind: "parsed", parsed: a.nested } : a.bytes ? classify(a.bytes, a.type_stated) : null)).filter(Boolean);
}

function classify(bytes, type) {
  if (hasZipMagic(bytes)) return { kind: "zip", bytes };
  const f = detectMail(bytes);
  if (f === "msg") { const p = parseMsg(bytes); return p.ok ? { kind: "parsed", parsed: p } : null; }
  if (f === "eml" || type === "message/rfc822") { const p = parseEml(bytes); return p.ok ? { kind: "parsed", parsed: p } : null; }
  return null;
}

/* The deepest level reached below `item` at `level`, opened no further than `stop`. */
async function deepest(item, level, stop) {
  if (level >= stop) return level;
  let max = level;
  for (const c of await childrenOf(item)) {
    max = Math.max(max, await deepest(c, level + 1, stop));
    if (max >= stop) break;
  }
  return max;
}

/** The nesting depth of a chain of archives and messages from its outermost item, which counts 1 (R10): a ZIP
 *  holding an EML holding a ZIP holding an EML is 4. Opened to `nest_read_max`, refused above `nest_max`. Answers
 *  `{ok: true, nesting_depth}` or the refusal. `within` counts containers enclosing the bytes, held by the caller. */
export async function nestingOf(bytes, { within = 0 } = {}) {
  try {
    const item = classify(bytes, null);
    const stop = mailBound("nest_read_max");
    const depth = item ? await deepest(item, within + 1, stop) : within + 1;
    if (depth > mailBound("nest_max")) return refused("MAIL_TOO_NESTED", { depth, max: mailBound("nest_max") });
    return { ok: true, nesting_depth: depth };
  } catch {
    return refused("MAIL_MALFORMED");
  }
}

/* ---- one message ------------------------------------------------------------------------------------------------- */

async function bytesOf(input, route) {
  const [kind, name] = routeRow(route);
  if (input instanceof Uint8Array) {
    if (input.length > routeBound(route)) return refused("MAIL_TOO_LARGE", statement(kind, name, input.length));
    return { ok: true, bytes: input };
  }
  const src = sourceOf(input);
  if (!src) return refused("MAIL_SOURCE_UNREADABLE");
  if (src.size > routeBound(route)) return refused("MAIL_TOO_LARGE", statement(kind, name, src.size));
  try { return { ok: true, bytes: await src.read(0, src.size) }; } catch { return refused("MAIL_SOURCE_UNREADABLE"); }
}

function parseAny(bytes) {
  const format = detectMail(bytes);
  if (format === "mbox") return { format, parsed: { ok: false, reason: "MAIL_IS_MAILBOX" } };
  if (format === "msg" || (format == null && hasCfbMagic(bytes))) return { format: "msg", parsed: parseMsg(bytes) };
  return { format: "eml", parsed: parseEml(bytes) };
}

async function answerOf(bytes, within) {
  const { format, parsed } = parseAny(bytes);
  if (!parsed.ok) return refused(parsed.reason);
  const { headers, unreadable } = headersOf(parsed.fields, parsed.props);
  const stop = mailBound("nest_read_max");
  const nesting_depth = await deepest({ kind: "parsed", parsed }, within + 1, stop);
  if (nesting_depth > mailBound("nest_max")) return refused("MAIL_TOO_NESTED", { depth: nesting_depth, max: mailBound("nest_max") });
  return {
    ok: true, format, headers, unreadable,
    header_fields: parsed.fields.map((f) => ({ name: f.name, value: decodeWords(f.value) })),
    body: parsed.body,
    attachments: parsed.attachments.map(listing),
    nesting_depth,
    notes: parsed.notes ?? [],
  };
}

/** Read one message, EML or MSG, from bytes or a range source `{size, readRange(offset, length)}` (R1, R2, R4, R5,
 *  R7-R12). `route` is "address" for a message received by address (25 MiB) or "upload" (the default, 100 MB);
 *  `within` counts the containers already enclosing it. Never throws. */
export async function readMessage(input, { route = "upload", within = 0 } = {}) {
  try {
    const got = await bytesOf(input, route);
    if (!got.ok) return got;
    return await answerOf(got.bytes, within);
  } catch {
    return refused("MAIL_MALFORMED");
  }
}

/** Cut attachment `index` of a message: `{ok: true, index, name_stated, type_stated, size, bytes}` (R4, R9). An
 *  embedded Outlook message is read with its message and not cut (`MAIL_ATTACHMENT_NOT_CUT`). Never throws. */
export async function attachmentBytes(input, index, { route = "upload" } = {}) {
  try {
    const got = await bytesOf(input, route);
    if (!got.ok) return got;
    const { parsed } = parseAny(got.bytes);
    if (!parsed.ok) return refused(parsed.reason);
    const a = Number.isSafeInteger(index) ? parsed.attachments[index] : undefined;
    if (!a) return refused("MAIL_ATTACHMENT_NO_SUCH", { index: Number.isSafeInteger(index) ? index : String(index) });
    if (!a.bytes) return refused("MAIL_ATTACHMENT_NOT_CUT", { index });
    return { ok: true, index: a.index, name_stated: a.name_stated, type_stated: a.type_stated, size: a.size, bytes: a.bytes };
  } catch {
    return refused("MAIL_MALFORMED");
  }
}

/* ---- a mailbox (R3) ---------------------------------------------------------------------------------------------- */

/** A mailbox's plan: its size against the archive bound and its messages counted by streaming against the mailbox
 *  bound, a mailbox over either refused whole (R3, R12). `{ok, kind: "mbox", messages, verdict, mode: "messages"}`. */
export async function planMailbox(input) {
  try {
    const src = sourceOf(input);
    if (!src) return refused("MAIL_SOURCE_UNREADABLE");
    if (src.size > boundOf("archive", "uploaded_bytes")) return refused("MAIL_MAILBOX_TOO_LARGE", statement("archive", "uploaded_bytes", src.size));
    const cap = mailboxCap();
    const c = await countMessages(src, cap);
    if (c.stopped) return refused("MAIL_MAILBOX_TOO_MANY", { bound: cap, counted: c.count });
    return { ok: true, kind: "mbox", messages: c.count, verdict: { ok: true, size: src.size, limit: boundOf("archive", "uploaded_bytes"), bound_key: statement("archive", "uploaded_bytes", src.size).key }, mode: "messages" };
  } catch {
    return refused("MAIL_SOURCE_UNREADABLE");
  }
}

/** Read a mailbox one piece at a time (`reading-pipeline` R45): `cursor` null first, then the answer's `next`;
 *  `budget.bytes` the bytes of messages a piece reads. Each unit is one message read as an EML, with its `index`
 *  and its place (`offset`, `length`). The first piece plans the mailbox and refuses it whole when over a bound.
 *  Never throws. */
export async function readMailbox(input, cursor = null, budget = {}) {
  try {
    const src = sourceOf(input);
    if (!src) return refused("MAIL_SOURCE_UNREADABLE");
    if (!cursor) { const p = await planMailbox(input); if (!p.ok) return p; }
    const cap = mailboxCap();
    if ((cursor?.index ?? 0) >= cap) return refused("MAIL_MAILBOX_TOO_MANY", { bound: cap });
    const piece = await readPiece(src, cursor, budget, {
      maxBytes: uploadBound(),
      readOne: async (bytes) => {
        const p = parseEml(bytes);
        if (!p.ok) return refused(p.reason);
        const { headers, unreadable } = headersOf(p.fields);
        return { ok: true, format: "eml", headers, unreadable, body: p.body, attachments: p.attachments.map(listing) };
      },
      tooLarge: (size) => refused("MAIL_TOO_LARGE", statement("message", "upload_bytes", size)),
    });
    if (!piece.ok) return refused(piece.reason);
    const over = piece.units.find((u) => u.index >= cap);
    if (over) return refused("MAIL_MAILBOX_TOO_MANY", { bound: cap });
    return piece;
  } catch {
    return refused("MAIL_SOURCE_UNREADABLE");
  }
}

/* ---- the registry entries (R13; `format-registry` R1-R5, R33) ---------------------------------------------------- */

/* A message's text units: each header field as stated, cited as a header by its name and occurrence (R5), then the
 * body. */
function unitsOf(answer) {
  const seen = new Map();
  const units = answer.header_fields.map((f) => {
    const n = f.name.toLowerCase();
    const occurrence = (seen.get(n) ?? 0) + 1;
    seen.set(n, occurrence);
    return { kind: "mail-header", name: f.name, occurrence, text: f.value, extent: { kind: "mail-header", name: n, occurrence } };
  });
  units.push({ kind: "mail-body", text: answer.body.text, extent: { kind: "mail-body", from: answer.body.from } });
  return units;
}

function textOf(answer) {
  if (!answer || !answer.ok) return answer ?? refused("MAIL_MALFORMED");
  return {
    ok: true, container: answer.format, document: answer.body.text, units: unitsOf(answer),
    metadata: answer.headers, images: [], active: [],
    attachments: answer.attachments, nesting_depth: answer.nesting_depth,
  };
}

const asAnswer = async (partsOrInput) => (partsOrInput && typeof partsOrInput === "object" && "ok" in partsOrInput && !(partsOrInput instanceof Uint8Array) ? partsOrInput : readMessage(partsOrInput));

function messageEntry(format, contentTypes) {
  return Object.freeze({
    format,
    detect(bytes, contentType) {
      if (bytes != null) {
        if (!(bytes instanceof Uint8Array) || detectMail(bytes) !== format) return null;
        return { format, confidence: "certain", signals: [format === "msg" ? "compound file message" : "message header block"] };
      }
      if (typeof contentType === "string" && contentTypes.includes(contentType.split(";")[0].trim().toLowerCase())) return { format, confidence: "likely", signals: [`content type ${contentType}`] };
      return null;
    },
    parts: (input) => readMessage(input),
    structure: async (partsOrInput) => asAnswer(partsOrInput),
    text: async (partsOrInput) => textOf(await asAnswer(partsOrInput)),
    plan: async (source) => {
      const src = sourceOf(source);
      if (!src) return refused("MAIL_SOURCE_UNREADABLE");
      const ok = src.size <= uploadBound();
      return { ok: true, kind: format, verdict: { ok, size: src.size, limit: uploadBound(), bound_key: statement("message", "upload_bytes", src.size).key }, mode: "whole" };
    },
    read: async (source) => {
      const t = textOf(await readMessage(source));
      if (!t.ok) return t;
      return { units: t.units, next: null, more: false, final: true, counters: { written: t.units.length, skipped: 0, owed: 0, failed: 0 }, answer: t };
    },
  });
}

export const emlEntry = messageEntry("eml", ["message/rfc822"]);
export const msgEntry = messageEntry("msg", ["application/vnd.ms-outlook"]);

export const mboxEntry = Object.freeze({
  format: "mbox",
  detect(bytes, contentType) {
    if (bytes != null) return bytes instanceof Uint8Array && detectMail(bytes) === "mbox" ? { format: "mbox", confidence: "certain", signals: ["mailbox separator line"] } : null;
    if (typeof contentType === "string" && contentType.split(";")[0].trim().toLowerCase() === "application/mbox") return { format: "mbox", confidence: "likely", signals: [`content type ${contentType}`] };
    return null;
  },
  parts: null,
  structure: async (input) => planMailbox(input),
  text: null,
  plan: (source) => planMailbox(source),
  read: (source, cursor, budget) => readMailbox(source, cursor, budget),
});

export const MAIL_ENTRIES = Object.freeze([emlEntry, msgEntry, mboxEntry]);
