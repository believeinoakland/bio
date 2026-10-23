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
export function csvText(chars, { exact = true } = {}) {
  const rows = ["id,department,amount,note"];
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

const sha = (s) => createHash("sha256").update(s).digest("hex");

/* One answer as the record keeps it: everything but the units, which are kept as a count and a digest of their JSON. */
export function recordOf(out, first) {
  const { text_units, reading, ...rest } = out;
  const r = reading ? (({ provenance, at, ...more }) => more)(reading) : undefined;
  return { ...(first ? { reading: r } : {}), ...rest,
           units: { n: text_units ? text_units.length : 0, sha: sha(JSON.stringify(text_units || [])) } };
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
