/* reading-pipeline G48 (fix round 6; K4679): the control cases shared by `fixtures/make-g48-answers.mjs` (which recorded their
   answers on the tip before the change) and `g48-first-tick.test.mjs` (which checks the first tick, every later piece and a
   cursor from the old code against the record). A case is a document held in a bucket and the pieces ask it is read with. */
import { createHash } from "node:crypto";
import { read } from "../../../src/reading-pipeline/index.mjs";
import { bucket, evidenceStore, hold, doc, withEntry } from "./fixture.mjs";
import { synthPdf } from "./bigpdf.mjs";

export const WHOLE_BOUND = 2 * 1024 * 1024;   /* docprofile's candidate `CLASSIFY_WHOLE_MAX_CHARS` when the case record was made */
export const BUDGET = 512 * 1024;

/* A budget table of about `chars` characters, exactly `chars` long when `exact`: a header, then rows, the last row padded. */
export function csvText(chars, { exact = true, header = "id,department,amount,note" } = {}) {
  const rows = [header];
  let n = rows[0].length + 1, i = 0;
  while (n < chars - 120) {
    const r = `${i},Dept ${i % 17},${(i * 37) % 9973}.${String(i % 100).padStart(2, "0")},note ${i} on the council item`;
    rows.push(r); n += r.length + 1; i++;
  }
  let text = rows.join("\n") + "\n";
  if (exact && text.length < chars) text += "x".repeat(chars - text.length - 1) + "\n";
  return text;
}
const textBody = () => Array.from({ length: 400 }, (_, i) => `Paragraph ${i}: the council received the staff report on item ${i}.`).join("\n\n");

const wbLines = (n, tag) => Array.from({ length: n }, (_, i) => (i === 0 ? `${tag}\tAmount\tNote` : `${tag} ${i}\t${i * 100}\tnote about line ${i}`));
const WB_A = wbLines(9000, "Fund");
const WB_B = wbLines(30, "Grant");
const wbRow = (i) => (i === 0 ? 1 : i + 1 + Math.floor(i / 50));
export const workbookEntry = { format: "g48wb", text: async () => ({ ok: true, document: `${WB_A.join("\n")}\n${WB_B.join("\n")}`,
  sheets: [
    { name: "Fund", rows: null, cols: null, usedRows: wbRow(8999), usedCols: 3, range: { kind: "sheet-range", sheet: "Fund", range: `A1:C${wbRow(8999)}` },
      text: WB_A.join("\n"), cells: null, undetermined: [], lineRows: WB_A.map((_, i) => wbRow(i)) },
    { name: "Grant", rows: null, cols: null, usedRows: 30, usedCols: 3, range: { kind: "sheet-range", sheet: "Grant", range: "A1:C30" },
      text: WB_B.join("\n"), cells: null, undetermined: [] }],
  counts: { chars: 1, undetermined: 0 }, undetermined: [], container: "xlsx" }) };

/* name, how the document is built, the asks. */
export const CASES = [
  { name: "csv-100k", chars: 100_000, budget: BUDGET,
    make: async (b) => { const t = csvText(100_000); return doc({ digest: await hold(b, t), bytes: t.length, ct: "text/csv", format: "csv", fromText: true }); } },
  { name: "csv-under-bound", chars: WHOLE_BOUND - 1, budget: BUDGET,   /* the csv reader drops the final newline: the sheet's text is one character under */
    make: async (b) => { const t = csvText(WHOLE_BOUND); return doc({ digest: await hold(b, t), bytes: t.length, ct: "text/csv", format: "csv", fromText: true }); } },
  { name: "csv-3m", chars: 3_000_000, budget: BUDGET,
    make: async (b) => { const t = csvText(3_000_000); return doc({ digest: await hold(b, t), bytes: t.length, ct: "text/csv", format: "csv", fromText: true }); } },
  { name: "csv-3m-small-budget", chars: 3_000_000, budget: 150 * 1024, maxUnits: 2,
    make: async (b) => { const t = csvText(3_000_000); return doc({ digest: await hold(b, t), bytes: t.length, ct: "text/csv", format: "csv", fromText: true }); } },
  { name: "workbook-two-sheets", chars: 0, budget: BUDGET, entry: workbookEntry,
    make: async (b) => doc({ digest: await hold(b, "workbook bytes"), bytes: 14, ct: "application/x-g48wb", format: "g48wb" }) },
  { name: "pdf", chars: 0, budget: BUDGET,
    make: async (b) => { const bytes = synthPdf({ pages: 6, linesPerPage: 40, targetBytes: 0 });
      return doc({ digest: await hold(b, bytes), bytes: bytes.length, ct: "application/pdf", format: "pdf" }); } },
  { name: "text-capture", chars: 0, budget: BUDGET,
    make: async (b) => { const t = textBody(); return doc({ digest: await hold(b, t), bytes: t.length, ct: "text/plain", format: "text", fromText: true }); } },
];


/* Edge sheets (recorded on the tip with the rest): a row over the cap with an astral pair at the cut, blank lines and a
   trailing newline, a header the cut leaves little room beside, with and without `lineRows`. */
const sheetEntry = (format, name, text, { lineRows = false } = {}) => ({ format, text: async () => {
  const lines = text.split("\n");
  return { ok: true, document: text,
    sheets: [{ name, rows: null, cols: null, usedRows: lines.length, usedCols: 3, range: { kind: "sheet-range", sheet: name, range: `A1:C${lines.length}` },
              text, cells: null, undetermined: [], ...(lineRows ? { lineRows: lines.map((_, i) => i + 1 + Math.floor(i / 7)) } : {}) }],
    counts: { chars: text.length, undetermined: 0 }, undetermined: [], container: "xlsx" }; } });
const CAP = 128 * 1024;
const longRowText = () => {
  const head = "Fund\tAmount\tNote";
  const limit = CAP - head.length - 1;
  const rows = [head];
  for (let i = 1; i < 2500; i++) rows.push(`Fund ${i}\t${i * 100}\tnote ${i} \u{1F3DB} civic`);
  rows.push("A".repeat(limit - 1) + "\u{1F600}" + "tail of the long row");      /* the pair straddles the cut */
  for (let i = 0; i < 40; i++) rows.push(`Fund b${i}\t${i}\tnote`);
  rows.push("B".repeat(limit + 5000));
  rows.push("end\t1\tdone");
  return rows.join("\n");
};
const blankText = () => {
  const rows = ["Name\tTotal"];
  for (let i = 0; i < 12_000; i++) rows.push(i % 9 === 0 ? "" : `Row ${i}\t${i}\t\u00e9\u4e2d ${i}`);
  return rows.join("\n") + "\n";
};
const bigHeadText = () => {
  const head = Array.from({ length: 70_000 }, (_, i) => `h${i}`.slice(0, 1)).join("") + "\tAmount";   /* a header of 70,000 characters */
  const rows = [head];
  for (let i = 1; i < 3000; i++) rows.push(`Row ${i}\t${i}\tnote about the line ${i}`);
  return rows.join("\n");
};
const hugeHeadText = () => ["H".repeat(130_000) + "\tAmount", ...Array.from({ length: 1500 }, (_, i) => `Row ${i + 1}\t${i}\tnote about the line ${i}`)].join("\n");
const edge = (name, format, text, opts) => ({ name, chars: 0, budget: 150 * 1024, entry: sheetEntry(format, "Edge", text, opts),
  make: async (b) => doc({ digest: await hold(b, `${name} bytes`), bytes: 10, ct: `application/x-${format}`, format }) });
CASES.push(edge("sheet-long-rows", "g48long", longRowText()),
           edge("sheet-long-rows-lineRows", "g48longr", longRowText(), { lineRows: true }),
           edge("sheet-blank-lines", "g48blank", blankText(), { lineRows: true }),
           edge("sheet-big-header", "g48bighead", bigHeadText()),
           edge("sheet-huge-header", "g48hugehead", hugeHeadText()));

const sha = (s) => createHash("sha256").update(s).digest("hex");

/* Fix round 9 (K4837) adds to every answer what the record, made before it, cannot hold: the reader contract's `counters`, `next`
   and `final` (R45), a unit's `kind` (`body` for every unit here) and a sheet block's `lineRows` (R47, R41), and the decode's
   `encoding` facts (R49). They are taken off before an answer is compared with the record, and nothing else is: a unit of any other
   kind, or any other key, still differs. Each is tested where it is made (`r9-reader.test.mjs`). */
const ROUND9_ANSWER = ["counters", "next", "final"];
const ROUND9_READING = ["encoding", "encoding_assumed", "encoding_disagree", "encoding_replaced"];
const withoutRound9Unit = (u) => { if (u.kind !== "body") return u; const { kind, lineRows, ...rest } = u; return rest; };
/* One answer as the record keeps it: everything but the units, which are kept as a count and a digest of their JSON. */
export function recordOf(out, first) {
  const { text_units, reading, ...rest0 } = out;
  const rest = Object.fromEntries(Object.entries(rest0).filter(([k]) => !ROUND9_ANSWER.includes(k)));
  const r = reading ? (({ provenance, at, ...more }) => Object.fromEntries(Object.entries(more).filter(([k]) => !ROUND9_READING.includes(k))))(reading) : undefined;
  return { ...(first ? { reading: r } : {}), ...rest,
           units: { n: text_units ? text_units.length : 0, sha: sha(JSON.stringify((text_units || []).map(withoutRound9Unit))) } };
}

/* A case read to the end: the first tick, then every later piece by the cursor of the one before. */
export async function readCase(c) {
  const b = bucket();
  const document = await c.make(b);
  const asks = [];
  const run = async () => {
    let cursor = null;
    for (let g = 0; g < 500; g++) {
      const out = await read(document, { evidence: evidenceStore(b), env: {}, storeName: "bio", unitsBudget: c.budget,
                                         cursor, ...(c.maxUnits ? { maxUnits: c.maxUnits } : {}) });
      asks.push({ ask: cursor, record: recordOf(out, g === 0), out });
      if (out.more !== true) break;
      cursor = out.cursor;
    }
  };
  if (c.entry) await withEntry(c.entry, run); else await run();
  return { b, document, asks };
}

/* The same ask of one piece, by a cursor given (a cursor the old code made). */
export async function readAsk(c, cursor) {
  const b = bucket();
  const document = await c.make(b);
  const go = () => read(document, { evidence: evidenceStore(b), env: {}, storeName: "bio", unitsBudget: c.budget,
                                    cursor, ...(c.maxUnits ? { maxUnits: c.maxUnits } : {}) });
  return c.entry ? withEntry(c.entry, go) : go();
}
