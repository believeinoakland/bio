/* THE GOOGLE DRIVE HOST STACK — CAP-8, enacting Bob's ruling of 2026-09-14:
 * *"A link to a Google Drive file should keep the link and export an OpenDocument
 * version that the content is extracted from."*
 * (`BIO_Content_Framework_v0_10.md` Part II §16, the Google Drive paragraphs.)
 *
 * WHAT THIS MODULE IS, AND WHAT IT DELIBERATELY IS NOT.
 *
 * It is a PURE recogniser: an address in, a shape and — for the three editor
 * kinds — a composed export address out. It performs no fetch, reads no store,
 * imports nothing from the format registry, and asserts nothing about meaning.
 * That is what lets `test/drive.test.mjs` and `src/index.mjs` read ONE definition
 * of what a Drive address is, rather than the suite re-deriving a copy that
 * agrees with the plane today at zero cost (WORKER.md: an equality that costs
 * nothing to produce is not evidence).
 *
 * It is NOT a format. A Google Doc is not a file format — a shared Drive link
 * serves a client-rendered application shell whose bytes carry no document
 * (framework Part I §6's UNWATCHABLE case, D-64/D-55). Supporting Drive is a
 * CAPTURE-side act of RECOGNITION, and the bytes it yields are ordinary
 * OpenDocument that COFF-9's flavour row and COFF-10's three registry entries
 * already read. Nothing in `formats.mjs`, `odf.mjs` or `ooxml.mjs` moves for
 * this file.
 *
 * WHY THE EXPORT AND NOT THE PAGE. Google's export endpoint is the honest route
 * to bytes, and it offers the OPEN formats without a credential when the file is
 * shared with anyone who has the link: OpenDocument (`.odt`, `.ods`, `.odp`), CSV,
 * TSV, PDF, HTML, plain text. Bob ruled OpenDocument, and the framework's reason
 * is recorded there: OpenDocument and OOXML are both open ISO standards preserving
 * the same evidence (formulas beside values, hidden sheets, comments, tracked
 * changes, notes), and the axis reads OpenDocument as of COFF-9/COFF-10.
 *
 * EVERY EXPORT IS GOOGLE'S CONVERSION AT FETCH TIME AND NONE IS THE ORIGINAL.
 * That is why the hop records the export format and GOOGLE AS THE PRODUCER
 * (D-251's sense) rather than presenting the bytes as the publisher's own, and
 * why `driveHop` below is `bound: false` with the reason stated rather than
 * implied by omission.
 *
 * D-112 IS THE SPINE. The three facts this hop carries — the export address, the
 * export format, the producer — are DERIVED HERE, from the file id and kind the
 * ADDRESS carries, and are never accepted from a caller. A provenance hop a
 * caller can hand us is one a caller can invent. `index.mjs`'s
 * `is-drive-capture` region refuses a body carrying any of them BY NAME rather
 * than dropping them quietly: a caller told nothing learns nothing.
 */

/** The four hosts the item names. An EXACT set, and that is the whole of the
 *  over-strictness fence: `www.google.com/maps`, `fonts.googleapis.com`,
 *  `google.com/search` and every other Google property is not a Drive address
 *  and takes the ordinary capture path byte-for-byte. A leading `www.` is
 *  stripped before the comparison because it costs nothing and a source page
 *  may well carry one; nothing else is normalised away. */
export const DRIVE_HOSTS = ["docs.google.com", "drive.google.com",
                            "sheets.google.com", "slides.google.com"];

/** The editor kinds, and the ONE place the path segment, the export format and
 *  the OpenDocument media type are joined. A fourth kind (`drawings` → `.odg`)
 *  becomes one row here and nothing else — the same parameter-table discipline
 *  COFF-9 used for `ODF_FLAVOURS`, and for the same reason: a list of spellings
 *  goes stale the moment a fourth is written.
 *
 *  `mimetype` is stated here rather than imported from `odf.mjs` ON PURPOSE and
 *  it is NOT a second copy of the registry's truth: this module must stay pure
 *  (it is read by a suite that also reads the registry, and an import would make
 *  the two agree for free). `test/drive.test.mjs` asserts these three strings
 *  EQUAL `ODT_CONTENT_TYPE` / `ODS_CONTENT_TYPE` / `ODP_CONTENT_TYPE` exported by
 *  `odf.mjs`, so a drift between the two is a named failure rather than a silence. */
export const DRIVE_KINDS = [
  { kind: "document",     segment: "document",     format: "odt",
    mimetype: "application/vnd.oasis.opendocument.text" },
  { kind: "spreadsheet",  segment: "spreadsheets",  format: "ods",
    mimetype: "application/vnd.oasis.opendocument.spreadsheet" },
  { kind: "presentation", segment: "presentation", format: "odp",
    mimetype: "application/vnd.oasis.opendocument.presentation" },
];

/** Google's file ids. Base64url-ish and long; the bound is deliberately loose at
 *  both ends because the id space is THEIRS and a tight bound learned from
 *  today's ids would refuse tomorrow's. What it does exclude is the short
 *  path words (`edit`, `view`, `pub`, `u`, `d`, `e`) that would otherwise be
 *  read as an id by a sloppier pattern. */
const FILE_ID = /^[A-Za-z0-9_-]{10,200}$/;

/** The producer, in ONE place. It reaches the record on the hop and it reaches a
 *  refusal's detail; a second spelling is how two statements of one fact drift. */
export const DRIVE_PRODUCER = "Google Drive export";

/** The export endpoint's canonical host. `sheets.google.com` and
 *  `slides.google.com` are aliases that redirect to `docs.google.com`, and
 *  `drive.google.com` does not serve an editor export at all, so the address is
 *  composed on ONE host. That is a deliberate canonicalisation and not an
 *  accident: it gives the per-host governor ONE bucket for every Drive export
 *  this instance makes, whatever host the source page spelled the link with,
 *  and `driveHop` states the composition so a reader can see the host moved. */
const EXPORT_HOST = "docs.google.com";

/** Read the shape of a Drive address.
 *
 *  Returns `null` for anything that is not on a Drive host — the caller then does
 *  exactly what it did before this module existed. For a Drive host it ALWAYS
 *  returns a verdict, never `null`: an unrecognised shape is a NAMED shape
 *  (`unknown`), because the item's rule is that folders and unknown shapes are
 *  named as not harvestable and never silently skipped.
 *
 *  `{ address, host, shape, harvestable, kind?, fileId?, format?, mimetype?,
 *     exportAddress?, why? }`
 *
 *  `shape` is one of:
 *    `document` | `spreadsheet` | `presentation`  — harvestable; an export address is composed
 *    `published`                                  — NOT a Drive harvest: the publish-to-web
 *                                                   static HTML is already an honest document,
 *                                                   so it takes the ORDINARY path
 *    `file`                                       — recognised, NOT harvestable: the address
 *                                                   carries a file id and no KIND
 *    `folder`                                     — recognised, NOT harvestable: a listing,
 *                                                   not a document
 *    `unknown`                                    — a Drive host with a path this recogniser
 *                                                   does not read
 */
export function readDriveAddress(address) {
  if (typeof address !== "string" || !/^https:\/\//.test(address)) return null;
  let u;
  try { u = new URL(address); } catch { return null; }
  if (u.protocol !== "https:") return null;
  const host = u.hostname.toLowerCase().replace(/^www\./, "");
  if (!DRIVE_HOSTS.includes(host)) return null;

  const base = { address, host };
  /* Path segments with the two OPTIONAL prefixes Google interposes stripped:
     `/a/<domain>/…` (a Workspace-hosted document) and `/u/<n>/…` (the signed-in
     account selector). Both appear on links a city actually publishes, and
     failing to strip them would name a perfectly ordinary Doc `unknown` — the
     over-strictness direction, which is the one this project keeps measuring. */
  /* MEASURED RATHER THAN ASSUMED, and the first draft of this got it wrong in
     exactly the direction that matters. Google puts `/u/<n>/` in THREE positions
     — `/u/0/document/d/…`, `/document/u/0/d/…` and `/drive/u/0/folders/…` — so a
     loop that only stripped a LEADING pair named
     `docs.google.com/spreadsheets/u/0/d/<id>/edit` UNKNOWN, which is a perfectly
     ordinary signed-in Sheets link and would have been refused as unharvestable.
     That is the over-strictness direction, caught by driving the recogniser over
     a corpus of real spellings before anything was built on it. So the pairs are
     dropped WHEREVER they appear, which is a property of the pair rather than of
     its position — the inversion WORKER.md asks for instead of a longer list. */
  const raw = u.pathname.split("/").filter(Boolean);
  const seg = [];
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === "u" && /^\d+$/.test(raw[i + 1] || "")) { i++; continue; }
    if (raw[i] === "a" && /\./.test(raw[i + 1] || "")) { i++; continue; }
    seg.push(raw[i]);
  }

  /* A FOLDER, in every spelling Drive serves one under. A folder is a LISTING
     and not a document: there is nothing to export, and there is no honest
     single set of bytes a capture of it could hold. Named, never skipped. */
  if ((seg[0] === "drive" && seg[1] === "folders")
      || (seg[0] === "folderview")
      || (seg[0] === "drive" && seg[1] === "my-drive")
      || (seg[0] === "drive" && seg[1] === "shared-with-me")) {
    return { ...base, shape: "folder", harvestable: false,
      why: "a Drive FOLDER is a listing of files, not a document: there is no export address to "
         + "compose and no single set of bytes a capture of it could honestly hold. The link is "
         + "recorded; harvesting the files it lists is a separate act nobody has asked for." };
  }

  /* THE PUBLISH-TO-WEB SHAPE, and it is recognised so that it can be LEFT ALONE.
     `/<segment>/d/e/<published id>/pub…` is the static HTML Google serves for a
     document published to the web — an honest document with no application
     shell, which this plane already captures correctly and whose `e/2PACX-…` id
     is NOT a file id the export endpoint accepts. Diverting it to an export
     address would BREAK a working path, which is the failure direction this
     item's over-strictness arm exists to catch. */
  const kindRow = DRIVE_KINDS.find((k) => k.segment === seg[0]);
  if (kindRow && seg[1] === "d" && seg[2] === "e") {
    return { ...base, shape: "published", harvestable: false,
      why: "this is Google's PUBLISH-TO-WEB address, which serves static HTML rather than the "
         + "application shell. It is already an honest document and is captured by the ordinary "
         + "path; its `e/…` published id is not a file id the export endpoint accepts." };
  }

  /* THE THREE EDITOR KINDS. `/<segment>/d/<file id>/…` — the trailing segments
     (`edit`, `view`, `preview`, `htmlview`, a `#gid=` fragment the server never
     sees) are immaterial to WHICH document this is and are not read. */
  if (kindRow && seg[1] === "d" && FILE_ID.test(seg[2] || "")) {
    const fileId = seg[2];
    return { ...base, shape: kindRow.kind, harvestable: true,
      kind: kindRow.kind, fileId, format: kindRow.format, mimetype: kindRow.mimetype,
      exportAddress: exportAddressFor(kindRow, fileId) };
  }

  /* A FILE: `/file/d/<id>/view`, `/open?id=…`, `/uc?id=…`. The address carries an
     id and NO KIND, and the kind is what decides the export format — so no
     OpenDocument export address can be composed from it. This is NAMED rather
     than guessed at: asking `export?format=odt` of a file whose kind we do not
     know would either answer the shell or answer a conversion of something we
     could not name, and the record would hold bytes whose format it invented.
     Undetermined is first-class and must be STATED. */
  const idParam = u.searchParams.get("id");
  if ((seg[0] === "file" && seg[1] === "d") || seg[0] === "open" || seg[0] === "uc"
      || (idParam && FILE_ID.test(idParam))) {
    const fileId = (seg[0] === "file" && seg[1] === "d" && FILE_ID.test(seg[2] || "")) ? seg[2]
                 : (idParam && FILE_ID.test(idParam) ? idParam : null);
    return { ...base, shape: "file", harvestable: false, ...(fileId ? { fileId } : {}),
      why: "this Drive address names a FILE ID and no KIND. The kind is what decides the export "
         + "format, so no OpenDocument export address can be composed from it, and asking for one "
         + "kind at a venture would file bytes whose format the record had guessed. If the file is "
         + "an uploaded document, capture its own address; if it is a Doc, Sheet or Slides deck, "
         + "capture the editor address, which carries the kind." };
  }

  return { ...base, shape: "unknown", harvestable: false,
    why: `this is a Drive host (${host}) with a path shape this recogniser does not read, so it is `
       + "named rather than harvested. A Drive address whose shape is unread is not a document "
       + "this instance can promise to have captured." };
}

/** The export address, composed BY THE PLANE from the file id and the kind — the
 *  form the item and the framework both name (`export?format=odt|ods|odp`).
 *  Exported so the suite composes it the same way the plane does. */
export function exportAddressFor(kindRow, fileId) {
  return `https://${EXPORT_HOST}/${kindRow.segment}/d/${fileId}/export?format=${kindRow.format}`;
}

/** THE HOP. Built here, from what the recogniser derived and what the fetch
 *  actually returned, and never from anything a caller sent — `archiveHop`'s
 *  discipline one host-stack over (D-112).
 *
 *  It is the SECOND hop of the chain and it is deliberately weaker than the
 *  first, for a different reason than the archive's. The Internet Archive's hop
 *  is weak because it is a third party's dated claim. Google's is weak because
 *  the bytes ARE NOT THE ORIGINAL FILE: they are a conversion Google performed
 *  at fetch time, of a document whose stored form nobody outside Google has ever
 *  seen. Nothing is signed, so `bound` is false, and the honest word for what
 *  this is appears in the text rather than being left to inference.
 *
 *  `via` is `"direct"` because the FETCH was direct — we asked Google for the
 *  export and Google answered us, with no party in between. Grade tracks
 *  DIRECTNESS, never technique, and the conversion is technique.
 */
export function driveHop(drive, { retrieved, resolved = null, detected = null } = {}) {
  const confirmed = detected && detected.format === drive.format;
  return {
    who: `Google Drive (${DRIVE_PRODUCER})`,
    asserts: `these bytes are Google's ${drive.format.toUpperCase()} conversion, made at export time, `
           + `of the Drive ${drive.kind} ${drive.fileId}, served for ${drive.exportAddress} at ${retrieved}. `
           + `The document itself lives at ${drive.address}, which is the address the record keeps.`,
    evidence: [
      `export address ${drive.exportAddress}`,
      `export format ${drive.format} (${drive.mimetype})`,
      `producer ${DRIVE_PRODUCER}`,
      `the export address was COMPOSED BY THIS INSTANCE from the file id and the kind carried in `
        + `${drive.address}, and no part of it was read from the request (D-112)`,
      `the export endpoint is canonicalised to ${EXPORT_HOST}${drive.host === EXPORT_HOST ? "" : `, though the link named ${drive.host}`}`,
      resolved && resolved !== drive.exportAddress ? `redirected to ${resolved}` : null,
      /* BYTES-FIRST, and stated either way. COFF-9's discriminator reads the
         first-and-stored `mimetype` entry, so the flavour is CERTAIN from the
         bytes and Google's declared content type need not be trusted. A
         MISMATCH is recorded, NOT refused: the rule is that the application
         shell is never filed as the document, not that only a perfectly
         detecting export may be filed, and a fence tighter than its rule is an
         undeclared interface change wearing the costume of caution. */
      detected
        ? (confirmed
            ? `confirmed from the bytes: ${detected.format} (${detected.confidence}) — ${detected.signals.join("; ")}`
            : `NOT confirmed from the bytes: ${drive.format} was asked for and the bytes detect as `
              + `${detected.format} (${detected.confidence}) — ${detected.signals.join("; ")}. The capture is `
              + `filed with the disagreement stated rather than refused; what is refused by name is the `
              + `application shell, and these bytes are not it.`)
        : "the bytes were not sniffed, so the export format is what was ASKED FOR and not what was confirmed",
    ].filter(Boolean).join("; "),
    bound: false,
    unsigned_reason: "no attestation exists over a Google Drive export, and the bytes are not the "
      + "original file: they are Google's conversion performed at fetch time. What this hop discloses "
      + "is the FACT that Google served a conversion of the named file, never the fidelity of the "
      + "conversion and never the credibility of the content.",
    via: "direct",
    /* THE THREE FACTS, AS NAMED KEYS. They are in `asserts` and `evidence` as
       prose because a hop is read by people; they are here as fields because a
       consumer must not have to parse prose to answer "what format is this, and
       who produced it". The archive hop's own `unsigned_reason` is the precedent
       for a hop carrying keys beyond I1 §4b's five. */
    export_address: drive.exportAddress,
    export_format: drive.format,
    producer: DRIVE_PRODUCER,
    /* Beside them, the two facts that make the three re-derivable by anyone
       holding the chain: which file, of which kind, at which address. */
    drive_file_id: drive.fileId,
    drive_kind: drive.kind,
    document_address: drive.address,
    export_format_confirmed: detected ? !!confirmed : null,
  };
}

/* ================================================================== *
 * CAP-10 / DEC-75 / IC-122 — THE CONVERSION, ON THE TEXT CHAIN
 * ================================================================== *
 *
 * The hop above says Google SERVED a conversion. This says the TEXT the record
 * then read passed through that conversion first — which is DEC-75's ruling:
 * capture grade is about the fetch path (the hop stays `direct`, grade B), and
 * a conversion is a derivation step in the chain, where every derivation
 * weakens and an unmeasured one is UNDETERMINED, stated, never a letter.
 *
 * DERIVED HERE, from the recognised address, and never from a request — the
 * same D-112 discipline as the hop, and the same source for the format, so the
 * chain and the hop cannot disagree about what the fetch produced.
 *
 * `engine` carries the producer (`textchain.mjs`'s `STEP_KINDS.convert` says
 * why: it is the one field a calibration joins on). The name is a machine
 * identifier distinct from `DRIVE_PRODUCER`'s prose, because it is what a
 * CAP-11 calibration row will be OF and must not change when prose is edited. */
export const DRIVE_CONVERT_ENGINE = "google-export";
/* NULL — UNDETERMINED, STATED. Not "not yet filled in": the step is raised by a
   calibration row naming a measurement (C-35.13 refuses a letter without one),
   and CAP-11 is the measurement. A letter typed here is the move Bob's 5.8
   forbids — a letter now, lowered later under authored legs. */
const DRIVE_CONVERT_CAP = null;
const DRIVE_CONVERT_SOURCE = "unmeasured: Google's export is a conversion made at fetch time of a "
  + "stored original nobody outside Google has seen, and its text stability and fidelity across "
  + "fetches have not been measured (DEC-75; CAP-11 measures, a calibration row raises it; the "
  + "byte instability is D-351's)";

/** The `convert(google-export, <format>)` step for a recognised, harvestable
 *  Drive address. Pure, like everything in this module. */
export function driveConvertStep(drive) {
  return { step: "convert", engine: DRIVE_CONVERT_ENGINE, format: drive.format,
           cap: DRIVE_CONVERT_CAP, measured_by: DRIVE_CONVERT_SOURCE, calibration: null };
}

/** The keys a caller may NOT put on an `op=acquire` body, and the ONE place they
 *  are named. D-112: a hop a caller can hand us is a hop a caller can invent, so
 *  a body carrying one is refused BY NAME rather than having the field quietly
 *  dropped — a caller told nothing learns nothing (C-28.4's rule, one op over).
 *
 *  WHAT THIS MATCHER CAN AND CANNOT SEE, stated because the sentence is
 *  load-bearing: it sees a TOP-LEVEL key on the request body with one of these
 *  names. It does not see a hop smuggled inside another field's value, and it
 *  does not need to — nothing in the acquire path READS a provenance field off a
 *  request body at all, and `hygiene.test.mjs` asserts that at SOURCE. This
 *  refusal is the loud half of a fence whose silent half already holds. */
export const DRIVE_HOP_FACT_KEYS = ["export_address", "export_format", "producer",
  "drive_file_id", "drive_kind", "drive", "document_address", "provenance_hop"];

/** Which of those a body carries, in body order. Empty means none. */
export function callerSuppliedHopFacts(body) {
  if (!body || typeof body !== "object") return [];
  return DRIVE_HOP_FACT_KEYS.filter((k) => Object.prototype.hasOwnProperty.call(body, k));
}
