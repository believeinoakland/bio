/* A child process for g44-large.test.mjs: holds one file as a capture in file-safety's own world and asks for its safe view under
   the old-space limit its parent sets. Answers the idle heap, and the answer (when under 300 KB, else its size). Not a test.
     node --expose-gc --max-old-space-size=N g44-child.mjs <file> <idle|view> */
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { filedWorld } from "./fixture.mjs";
import { fileSafetyOps } from "../../../src/file-safety/index.mjs";

const [file, job] = process.argv.slice(2);
const w = filedWorld();
/* R70: the file's name is what the record holds for it, so a `.csv` is a table and nothing else is */
const sha = await w.capture(new Uint8Array(readFileSync(file)), { name: basename(file) });
gc(); gc();
const idleMB = process.memoryUsage().heapUsed / 1e6;
let answer = null, peakMB = idleMB;
if (job === "view") {
  const timer = setInterval(() => { peakMB = Math.max(peakMB, process.memoryUsage().heapUsed / 1e6); }, 2);
  const r = await fileSafetyOps(w.fs, new URL(`http://x/safeview?capture=${sha}&viewer=member:m1`), {}, w.env).safeview();
  clearInterval(timer);
  const text = r instanceof Response ? JSON.stringify({ response: r.status }) : JSON.stringify(r);
  answer = text.length < 300_000 ? JSON.parse(text) : { bytes: text.length };
}
process.stdout.write(JSON.stringify({ idleMB, peakMB, answer }));
