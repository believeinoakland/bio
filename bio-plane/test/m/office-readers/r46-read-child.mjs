/* A child process for r46-memory.test.mjs: reads an xlsx from a file with xlsxEntry.text() and answers the most memory the read
   held above its start (heap used plus external memory, the array buffers and large strings included), sampled every few
   milliseconds and after a collection at each yield. "Start" is the memory with the file's bytes in hand. With `--idle` it answers
   only that heap figure, so the parent can set the old space to the idle heap plus `capFor(128)`. Not a test. Run with --expose-gc.
     node --expose-gc [--max-old-space-size=N] r46-read-child.mjs <file> [--idle|--read]  */
import { readFileSync } from "node:fs";
import { xlsxEntry } from "../../../src/formats-xlsx.mjs";

const used = () => { const m = process.memoryUsage(); return m.heapUsed + m.external; };
const bytes = new Uint8Array(readFileSync(process.argv[2]));
gc(); gc();
const idle = used();
if (process.argv[3] === "--idle") { process.stdout.write(JSON.stringify({ idleHeapMB: process.memoryUsage().heapUsed / 1048576 })); process.exit(0); }
let peak = idle;
const sample = () => { const u = used(); if (u > peak) peak = u; };
const timer = setInterval(sample, 2);
const yieldNow = async () => { sample(); await new Promise((r) => setImmediate(r)); };
const t = await xlsxEntry.text(bytes, { yieldNow });
clearInterval(timer);
sample();
process.stdout.write(JSON.stringify({ aboveStartMB: (peak - idle) / 1048576, ok: t.ok, documentLength: t.document == null ? null : t.document.length }));
