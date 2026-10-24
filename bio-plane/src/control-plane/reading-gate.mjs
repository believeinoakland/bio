/* control-plane R131, R132 (fix round 9, G126b, G126d, G124a; K4811 (6), (8), K4831 (3), K4835 (1)): THE INLINE GATE. Whether a reading is made inside a
   member's request or follows by the job table. Pure over a document the door holds (its capture's bytes, or the sum of its parts, its type, its profile) and,
   for a container, over the declared sizes of its central directory (`ooxml.declaredTextBytes`, no inflation). Every ceiling here is a `READ_BOUNDS` row read
   through `boundOf`, with no numeric literal, save the one with no row yet (marked below).

   Three verdicts, by size and kind:
     - `stated`: over the whole-read ceiling of its kind (`pdf.bytes`, `csv.bytes`, `text.bytes`; every other kind the whole-load row `pdf.bytes`, which is
       reading-pipeline's `WHOLE_READ_ROW`). The reader states it at once from the sizes, with the size, the limit and the alpha sentence; nothing is owed
       and it is never deferred (PDF A3).
     - `deferred`: over the inline ceiling for its kind (a PDF `pdf.request_bytes`; every other kind the one below), or a capture held in more than a reading
       assembles from parts, or a container whose declared unpacked text is over the inline ceiling. Not read in the request: its `reading` row is registered
       (R130) and the answer says `reading_pending`.
     - `inline`: read in the request, when R131 (3)'s clock allows (the door's, per request). */
import { boundOf, statement } from "../read-bounds.mjs";
import { readContainer, declaredTextBytes } from "../ooxml.mjs";
import { isOdfTextPart } from "../odf.mjs";

const MiB = 1048576;
/* R131 (1): the most of a PDF one member request reads (runtime-limits' row, K4901) */
export const READING_DEFER_PDF_BYTES = boundOf("pdf", "request_bytes");
/* R131 (1): the most of any other kind one member request reads, stored, and of a container's declared unpacked text (runtime-limits' row `text.request_bytes`, K4919) */
export const READING_DEFER_OTHER_BYTES = boundOf("text", "request_bytes");
/* R131 (1): the most a reading assembles from parts (reading-pipeline's `MULTIPART_READ_MAX`, the office text row), so a capture held in more is never read at the door */
export const READING_PARTS_MAX = boundOf("office", "text_bytes");

const TEXT_TYPE = /^(?:text\/|application\/(?:xhtml\+xml|xml|json)|application\/[a-z0-9.+-]*\+xml)/i;
/* the parts of a container that bear text, for its declared unpacked size: a superset of OOXML's and ODF's text parts (an ODF's `content.xml`, `styles.xml` and
   `meta.xml` among them), so the estimate is never less than what a reader would walk */
export const CONTAINER_TEXT_PART = /\.(?:xml|rels|txt|html?|xhtml|csv|tsv|json|css|svg|opf|ncx|md)$/i;
const lower = (v) => (typeof v === "string" ? v.toLowerCase() : "");

/** The bytes a document holds: its capture's, or the sum of its parts', whichever is more. */
export function sizeOfDocument(document) {
  const c = document && typeof document === "object" ? document.capture : null;
  const parts = document && Array.isArray(document.parts) ? document.parts.reduce((n, p) => n + (Number.isFinite(p?.bytes) ? p.bytes : 0), 0) : 0;
  return Math.max(Number.isFinite(c?.bytes) ? c.bytes : 0, parts);
}

/** `pdf`, `csv`, `text` or `other`, from what the document states of itself (the capture's type, the declared type, the profile's format, the address's name). */
export function kindOf(document) {
  const c = document && typeof document === "object" ? document.capture : null;
  const type = lower(c?.content_type);
  const declared = lower(document?.profile?.source_content_type);
  const format = lower(document?.profile?.format?.format);
  const locator = typeof document?.locator === "string" ? document.locator : "";
  const named = (re) => re.test(locator);
  if (type.startsWith("application/pdf") || declared.startsWith("application/pdf") || format === "pdf" || (type === "" && declared === "" && named(/\.pdf(?:[?#]|$)/i))) return "pdf";
  if (type.startsWith("text/csv") || declared.startsWith("text/csv") || format === "csv" || (type === "" && declared === "" && named(/\.csv(?:[?#]|$)/i))) return "csv";
  if (TEXT_TYPE.test(type) || TEXT_TYPE.test(declared) || ["text", "tsv", "json", "xml", "html"].includes(format)) return "text";
  return "other";
}

/** The `READ_BOUNDS` row that is the whole-read ceiling of a kind. */
export const wholeRowOf = (kind) => (kind === "csv" ? ["csv", "bytes"] : kind === "text" ? ["text", "bytes"] : ["pdf", "bytes"]);

/** R131 (1), R132: `{verdict: "stated"|"deferred"|"inline", kind, size, ...}` by size and kind alone (synchronous). `stated` carries `statement`'s `{size, bound, key}`;
 *  `deferred` the inline `limit` it was over. */
export function inlineVerdict(document) {
  const size = sizeOfDocument(document);
  const kind = kindOf(document);
  const row = wholeRowOf(kind);
  if (size > boundOf(...row)) return { verdict: "stated", kind, size, ...statement(...row, size) };
  const limit = kind === "pdf" ? READING_DEFER_PDF_BYTES : READING_DEFER_OTHER_BYTES;
  if (size > limit || size > READING_PARTS_MAX) return { verdict: "deferred", why: "size", kind, size, limit };
  return { verdict: "inline", kind, size };
}

/** R131 (2): the unpacked text a stored container declares, from its central directory alone (no inflation). `env.CAPTURES` is the evidence bucket; the object is
 *  read whole only when it is a ZIP by its first bytes (its stored size is the caller's, within the inline ceiling). Answers `{container: false}` for a file that is
 *  not a ZIP, `{container: true, unpacked: <bytes>}`, and `{container: true, unpacked: Infinity, lying: true}` for a directory that cannot be read, a count, a
 *  directory or a name over its limit: a corrupt or lying directory counts as large. `null` when the bucket cannot be asked (the gate then judges by size alone). */
export async function containerUnpacked(env, storeName, sha) {
  try {
    const bucket = env?.CAPTURES;
    if (!bucket || typeof bucket.get !== "function" || typeof sha !== "string" || !/^[0-9a-f]{64}$/.test(sha)) return null;
    const key = `${storeName}/captures/${sha}`;
    const head = await bucket.get(key, { range: { offset: 0, length: 4 } });
    if (!head) return null;
    const m = new Uint8Array(await head.arrayBuffer());
    if (!(m.length >= 4 && m[0] === 0x50 && m[1] === 0x4b && m[2] === 0x03 && m[3] === 0x04)) return { container: false };
    const whole = await bucket.get(key);
    if (!whole) return null;
    const listed = readContainer(new Uint8Array(await whole.arrayBuffer()));
    if (!listed || listed.ok !== true || !Array.isArray(listed.entries)) return { container: true, unpacked: Infinity, lying: true };
    /* an ODF container (its `mimetype` and manifest parts) is summed by odf-reader's own predicate (BOB B70 (4)); any other by the local superset */
    const names = new Set(listed.entries.map((e) => e.name));
    const odf = names.has("mimetype") && names.has("META-INF/manifest.xml");
    const { total } = declaredTextBytes(listed, odf ? isOdfTextPart : (name) => CONTAINER_TEXT_PART.test(name));
    return Number.isFinite(total) && total >= 0 ? { container: true, unpacked: total } : { container: true, unpacked: Infinity, lying: true };
  } catch { return null; }
}

/** R131: the whole verdict, size and kind first, then (for a document the size admits) the declared unpacked text of a container. Never throws.
 *  `{verdict, kind, size, ...}` as `inlineVerdict`, with `container` and `unpacked_estimate` (a number or null) for a document it looked into. */
export async function readingVerdict(document, { env = null, storeName = "bio" } = {}) {
  const v = inlineVerdict(document);
  if (v.verdict !== "inline" || v.kind === "pdf" || v.kind === "csv") return v;
  const sha = document?.capture?.sha256;
  const looked = await containerUnpacked(env, storeName, sha);
  if (!looked || looked.container !== true) return v;
  if (looked.unpacked > READING_DEFER_OTHER_BYTES)
    return { ...v, verdict: "deferred", why: "unpacked", container: true, unpacked_estimate: looked.unpacked === Infinity ? null : looked.unpacked, limit: READING_DEFER_OTHER_BYTES,
             ...(looked.lying ? { lying: true } : {}) };
  return { ...v, container: true, unpacked_estimate: looked.unpacked };
}
