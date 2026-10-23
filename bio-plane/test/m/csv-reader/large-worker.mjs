/* A worker thread for large-text.test.mjs: reads a body under the old-space limit its parent sets and
   answers only sizes, so the parent never holds the text a second time. Not a test. */
import { parentPort, workerData } from "node:worker_threads";
import { csvEntry } from "../../../src/csv-reader/index.mjs";

const { bytes } = workerData;
const t = await csvEntry.text(new Uint8Array(bytes));
parentPort.postMessage({ ok: t.ok, documentLength: t.document == null ? null : t.document.length,
  sheetCells: t.sheets?.[0]?.cells ?? null, undetermined: t.undetermined.length });
