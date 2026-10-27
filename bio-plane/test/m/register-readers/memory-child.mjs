/* register-readers R1's memory measure, run under `--max-old-space-size=64`: a delimited stream of the given size, made
 * as it is read (nothing of it is held here), is read by `readRows`; prints `{bytes, rows, expected, undetermined}`. */
import { readRows } from "../../../src/register-readers/index.mjs";
import { CONTRIB, CONTRIB_HEADER, CONTRIB_ROWS, delimited, enc } from "./fixtures.mjs";

const target = Number(process.argv[2]);
const head = enc(delimited([CONTRIB_HEADER]));
const block = enc(delimited(Array.from({ length: 400 }, (_, i) => CONTRIB_ROWS[i % CONTRIB_ROWS.length])));
const perBlock = 400;
let bytes = 0, expected = 0;
async function* source() {
  yield head; bytes += head.length;
  while (bytes < target) { yield block.slice(); bytes += block.length; expected += perBlock; }
}
let rows = 0, undetermined = 0;
for await (const it of readRows(source(), CONTRIB, "y2025")) {
  if (it.cells) rows++;
  else if (it.undetermined) undetermined++;
  else if (it.ok === false) { console.error(JSON.stringify(it)); process.exit(2); }
}
console.log(JSON.stringify({ bytes, rows, expected, undetermined }));
