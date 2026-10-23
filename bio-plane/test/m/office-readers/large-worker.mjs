/* A worker thread for large-text.test.mjs: reads a package under the old-space limit its parent sets and
   answers only sizes, so the parent never holds the text a second time. Not a test. */
import { parentPort, workerData } from "node:worker_threads";
import { xlsxEntry } from "../../../src/formats-xlsx.mjs";
import { docxEntry } from "../../../src/docx.mjs";
import { pptxEntry } from "../../../src/pptx.mjs";

const { job, bytes } = workerData;
const entry = { xlsx: xlsxEntry, docx: docxEntry, pptx: pptxEntry }[job];
const t = await entry.text(new Uint8Array(bytes));
parentPort.postMessage({ ok: t.ok, documentLength: t.document == null ? null : t.document.length,
  sheetCells: t.sheets?.[0]?.cells ?? null, undetermined: t.undetermined.length });
