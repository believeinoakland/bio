/* image-cover tests: a child process that redraws one photograph and prints how far its peak resident set grew (R12). */
import { readFileSync } from "node:fs";
import { redrawPicture } from "../../../src/image-cover/index.mjs";

const d = new Uint8Array(readFileSync(process.argv[2]));
const before = process.resourceUsage().maxRSS;
const r = await redrawPicture(d);
console.log(JSON.stringify({ ok: r.ok, code: r.code, width: r.width, height: r.height, out: r.bytes?.length, growth_kb: process.resourceUsage().maxRSS - before }));
