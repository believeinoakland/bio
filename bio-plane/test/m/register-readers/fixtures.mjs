/* register-readers' test definitions and files. The definitions are in `jurisdictions` R127's register shape, with made-up
 * places and publishers (none is Oakland's: a "Riverbend" county clerk, a "Sawtooth" state commission). They are
 * inputs to the functions under test, as a profile hands them to a caller (`layers.md` rule 1). */

export const enc = (s) => new TextEncoder().encode(s);

/* The street types a caller passes from its active layers (K5577): a test list in two of the shapes a layer may hold. */
export const STREET_TYPES = ["Avenue", "Ave", "Street", "St", "Boulevard", "Blvd", { suffix: "Road", abbreviations: ["Rd"] }, "Lane", "Ln", "Way", "Court", "Ct"];

/** A comma file with a header row: Riverbend's campaign contributions (made up). */
export const CONTRIB = {
  key: "riverbend_contributions", label: "Riverbend contributions", publisher: "Riverbend County Clerk (test)",
  pieces: [{ key: "y2025", label: "2025", locator: "https://data.riverbend.test/contrib-2025.csv" }],
  delimiter: "comma",
  columns: [
    { name: "Tran_ID", role: "other", keep: true },
    { name: "Filer_ID", role: "filer_id", keep: true },
    { name: "Contributor", role: "name", keep: true },
    { name: "Employer", role: "organization", keep: true },
    { name: "Street", role: "home_address", keep: false },
    { name: "City", role: "city", keep: true },
    { name: "State", role: "state", keep: true },
    { name: "Zip", role: "zip5", keep: true },
    { name: "Phone", role: "phone", keep: false },
    { name: "Amount", role: "amount", keep: true, currency: "USD" },
    { name: "Date", role: "date", keep: true, date_format: "MM/DD/YYYY" },
    { name: "Memo", role: "other", keep: true },
    { name: "Form", role: "form", keep: true },
  ],
  row_key: ["Tran_ID"], row_key_basis: "source", schemes: ["filer"],
};

export const CONTRIB_HEADER = ["Tran_ID", "Filer_ID", "Contributor", "Employer", "Street", "City", "State", "Zip", "Phone", "Amount", "Date", "Memo", "Form", "Lat"];

/* Sentinels: a value of a column that must never be kept, found anywhere in an output, is a leak. */
export const SENTINEL = { street: "SENTINEL-STREET-7731", phone: "SENTINEL-PHONE-0107", lat: "SENTINEL-LAT-37.8" };

export const CONTRIB_ROWS = [
  ["T1", "FILER0000001", "MARTINEZ, ROSA M", "Harbor Bakery", SENTINEL.street, "Riverbend", "XS", "946121234", SENTINEL.phone, "1,000.00", "01/15/2025", "Measure 5500", "460", SENTINEL.lat],
  ["T2", "FILER0000001", "Chen, Wei", "Self-employed", SENTINEL.street, "Riverbend", "XS", "94610", SENTINEL.phone, "(250.00)", "02/01/2025", "call me at (555) 010-7731", "460", SENTINEL.lat],
  ["T3", "FILER0000002", "Okafor, Ada", "Ridge Co, Inc.", SENTINEL.street, "Lowfield", "XS", "94701", SENTINEL.phone, "75", "13/45/2025", "drop off at 4012 Sentinel Ave, Apt 6", "497", SENTINEL.lat],
  ["T4", "FILER0000002", "Robert Smith Jr", "", SENTINEL.street, "Lowfield", "XS", "94702", SENTINEL.phone, "500.5", "03/03/2025", "line one\nline \"two\"", "497", SENTINEL.lat],
  ["T5", "FILER0000003", "Martin, Rosa", "Harbor Bakery", SENTINEL.street, "Riverbend", "XS", "94612", SENTINEL.phone, "$20", "04/30/2025", "", "460", SENTINEL.lat],
];

const field = (v, d) => (/["\r\n]/.test(v) || v.includes(d) ? `"${v.replace(/"/g, '""')}"` : v);
export const delimited = (rows, d = ",", eol = "\n", last = true) => rows.map((r) => r.map((v) => field(v, d)).join(d)).join(eol) + (last ? eol : "");

export const CONTRIB_CSV = delimited([CONTRIB_HEADER, ...CONTRIB_ROWS]);

/** The same register as a tab file in a zip, and as a pipe file with a separate header file (Sawtooth's, made up). */
export const withPiece = (def, piece, extra = {}) => ({ ...def, ...extra, pieces: [piece] });
export const TAB = withPiece(CONTRIB, { key: "t", label: "tab", locator: "https://data.sawtooth.test/raw.zip", member: "RCPT_CD.TSV", delimiter: "tab" });
export const PIPE = withPiece(CONTRIB, { key: "p", label: "pipe", locator: "https://data.sawtooth.test/indiv26.zip", member: "itcont.txt", delimiter: "pipe", header_from: "hdr" });

/** A register with no source key (`row_key_basis: content`). */
export const CONTENT = { ...CONTRIB, key: "sawtooth_lobbyists", row_key: ["Contributor"], row_key_basis: "content" };

/** A register with no amount, date or name role: a licence list (made up). */
export const LICENCES = {
  key: "sawtooth_licences", label: "Sawtooth licences", publisher: "Sawtooth Licensing Board (test)",
  pieces: [{ key: "all", label: "all", locator: "https://data.sawtooth.test/licences.csv" }],
  columns: [
    { name: "Licence", role: "licence_no", keep: true },
    { name: "Business", role: "organization", keep: true },
    { name: "Docket", role: "docket_no", keep: true },
    { name: "Notes", role: "other", keep: true },
  ],
  row_key: ["Licence"], row_key_basis: "source", schemes: ["licence", "docket"],
};

/** Async chunks of `bytes`, cut at the given sizes in turn. */
export async function* chunked(bytes, sizes = [bytes.length || 1]) {
  for (let at = 0, i = 0; at < bytes.length; i++) {
    const n = Math.max(1, sizes[i % sizes.length]);
    yield bytes.subarray(at, at + n);
    at += n;
  }
}

/** Every item of an async iterable. */
export async function all(it) {
  const out = [];
  for await (const x of it) out.push(x);
  return out;
}

export const concat = (parts) => {
  const n = parts.reduce((s, p) => s + p.length, 0), out = new Uint8Array(n);
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
};

/** A range over bytes held in memory, recording every read as `[offset, end)`. */
export function memoryRange(bytes) {
  const reads = [];
  return { size: bytes.length, reads, read: async (offset, length) => { reads.push([offset, offset + length]); return bytes.slice(offset, offset + length); } };
}
