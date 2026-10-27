/* mail-reader: an internet message (EML) read whole: its header fields as stated, its body as text and its
 * attachments listed in a stable order (R1, R4, R9). Pure; never throws (R11, R15). */
import { splitHead, parseHeaders, firstOf, parseParams, transferDecode, charsetText, splitMultipart, htmlText, decodeWords } from "./mime.mjs";

const isText = (type) => type === "text/plain" || type === "text/html";

/* One part's header facts. */
function partOf(bytes) {
  const { head, body } = splitHead(bytes);
  const { fields } = parseHeaders(bytes.subarray(0, head));
  const ct = parseParams(firstOf(fields, "content-type") ?? "text/plain; charset=us-ascii");
  const disp = parseParams(firstOf(fields, "content-disposition") ?? "");
  const cid = firstOf(fields, "content-id");
  return {
    fields, raw: bytes.subarray(body),
    type: ct.value && ct.value.includes("/") ? ct.value : "text/plain",
    params: ct.params, disposition: disp.value || null,
    filename: disp.params.filename ?? ct.params.name ?? null,
    encoding: firstOf(fields, "content-transfer-encoding"),
    content_id: cid ? cid.replace(/^<|>$/g, "").trim() : null,
  };
}

class Refused extends Error { constructor(reason, extra) { super(reason); this.reason = reason; this.extra = extra; } }

/* The MIME tree, depth first: the body's text pieces (one choice per multipart/alternative, the plain one first)
 * and every attachment, each with its decoded bytes, in the order the message holds them. */
function walk(part, out, top) {
  const p = top ?? partOf(part);
  if (p.type.startsWith("multipart/")) {
    const boundary = p.params.boundary;
    if (!boundary) throw new Refused("MAIL_BOUNDARY_BAD", { type: p.type });
    const split = splitMultipart(p.raw, boundary);
    if (!split) throw new Refused("MAIL_BOUNDARY_BAD", { type: p.type, boundary });
    if (!split.closed) out.notes.push("MAIL_BOUNDARY_UNCLOSED");
    if (p.type === "multipart/alternative") {
      const kids = split.parts.map((b) => partOf(b));
      const choice = kids.find((k) => k.type === "text/plain" && k.disposition !== "attachment")
        ?? kids.find((k) => k.type.startsWith("multipart/"))
        ?? kids.find((k) => k.type === "text/html" && k.disposition !== "attachment")
        ?? kids[0];
      for (const k of kids) {
        if (k === choice) walk(null, out, k);
        else if (!isText(k.type) && !k.type.startsWith("multipart/")) walk(null, out, k);
        else if (k.type.startsWith("multipart/")) walk(null, { ...out, texts: [] }, k);
      }
      return;
    }
    for (const b of split.parts) walk(b, out);
    return;
  }
  const decoded = transferDecode(p.raw, p.encoding);
  if (decoded.unknown) out.notes.push("MAIL_TRANSFER_ENCODING_UNKNOWN");
  const attachment = p.disposition === "attachment" || !isText(p.type) || (p.filename != null && p.disposition !== "inline");
  if (attachment) {
    out.attachments.push({
      index: out.attachments.length,
      name_stated: p.filename == null ? null : decodeWords(p.filename),
      type_stated: p.type,
      size: decoded.bytes.length,
      inline: p.disposition === "inline" || (p.disposition == null && p.content_id != null),
      content_id: p.content_id,
      bytes: decoded.bytes,
    });
    return;
  }
  const t = charsetText(decoded.bytes, p.params.charset);
  out.texts.push({ kind: p.type === "text/html" ? "html" : "plain", text: t.text, encoding: t.encoding, transfer: decoded.encoding });
}

/* An EML's parse: {ok, fields, stray, body, attachments (with bytes), notes}, or {ok:false, reason, ...}. */
export function parseEml(bytes) {
  try {
    if (!(bytes instanceof Uint8Array) || bytes.length === 0) return { ok: false, reason: "MAIL_EMPTY" };
    const top = partOf(bytes);
    if (!top.fields.length) return { ok: false, reason: "MAIL_NOT_A_MESSAGE" };
    const { stray } = parseHeaders(bytes.subarray(0, splitHead(bytes).head));
    const out = { texts: [], attachments: [], notes: [] };
    walk(null, out, top);
    const plain = out.texts.filter((t) => t.kind === "plain");
    const chosen = plain.length ? plain : out.texts;
    let remote = 0;
    const text = chosen.map((t) => {
      if (t.kind !== "html") return t.text;
      const h = htmlText(t.text);
      remote += h.remote;
      return h.text;
    }).join("\n\n");
    for (const t of out.texts) if (t.kind === "html" && !chosen.includes(t)) remote += htmlText(t.text).remote;
    return {
      ok: true, fields: top.fields, stray,
      body: {
        text, from: chosen.length ? chosen[0].kind : "none",
        encoding: chosen.length ? chosen[0].encoding : null,
        transfer: chosen.length ? chosen[0].transfer : null,
        remote_refs: remote,
      },
      attachments: out.attachments,
      notes: [...new Set(out.notes)],
    };
  } catch (e) {
    if (e instanceof Refused) return { ok: false, reason: e.reason, ...e.extra };
    return { ok: false, reason: "MAIL_MALFORMED" };
  }
}
