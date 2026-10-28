#!/usr/bin/env node
/* proto-mem/1f (THROWAWAY): the fixture list and its generation. Writes OUT/MANIFEST.jsonl (one JSON line per file: bytes, sha256) and logs to stderr.
   node gen-all.mjs --out=/home/user/fix1f --set=l3,l4,l5,l1,l2 [--tier=local|full] [--dry]
   tier=local: the sizes this session could generate and run on a shared 4-core box with ~13 GB free disk.  tier=full: the sizes the specs name (L1 up to 500 MB mailbox, 1M-row workbooks...).
   --dry prints the commands without running them. Large files are never committed; the generators are, and the sha256 of each file is in the results JSON beside it. */
import { execFileSync } from "node:child_process";
import { appendFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const arg = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, "").split("="); return [k, v.join("=") || "1"]; }));
const out = arg.out || "/home/user/fix1f", full = arg.tier === "full", sets = (arg.set || "l3,l4,l5").split(",");
mkdirSync(out, { recursive: true });
const T = (kind, name, bytes, extra = []) => ["node", join(here, "gen-text.mjs"), `--kind=${kind}`, `--out=${out}/${name}`, `--bytes=${bytes}`, ...extra];
const S = (name, rows, cols, extra = []) => ["python3", "-I", join(here, "gen-sheet.py"), `--out=${out}/${name}`, `--rows=${rows}`, `--cols=${cols}`, ...extra];
const M = (what, extra = []) => ["node", join(here, "gen-media.mjs"), what, `--dir=${out}`, ...extra];
const MB = 1000000, MiB = 1048576;
const plan = {
  l1: (() => {
    const o = [];
    const sizes = full ? [10 * MiB, 50 * MiB, 100 * MiB, 100 * MiB + 1] : [10 * MiB, 50 * MiB];
    for (const k of ["text", "json", "ndjson", "xml", "html"]) for (const b of sizes) o.push(T(k, `${k}-${b}.dat`, b));
    for (const k of ["csv", "tsv"]) { o.push(T(k, `${k}-50mb-1mrows.dat`, 50 * MiB, ["--rows=1000000"])); o.push(T(k, `${k}-10mib.dat`, 10 * MiB)); }
    o.push(T("json1", "json-single-line-100mib.dat", full ? 100 * MiB : 50 * MiB));
    o.push(T("xmldeep", "xml-depth1000-10mib.dat", 10 * MiB, ["--depth=1000"])); o.push(T("xmldeep", "xml-depth10000-1mib.dat", MiB, ["--depth=10000"]));
    for (const e of ["utf8", "utf16", "cp1252"]) o.push(T("text", `text-${e}-50mib.dat`, 50 * MiB, [`--enc=${e}`]));
    o.push(["node", join(here, "gen-text.mjs"), "--kind=ics", `--out=${out}/ics-100000.ics`, "--count=100000"], ["node", join(here, "gen-text.mjs"), "--kind=ics", `--out=${out}/ics-100001.ics`, "--count=100001"]);
    o.push(["node", join(here, "gen-text.mjs"), "--kind=vcf", `--out=${out}/vcf-50000.vcf`, "--count=50000"], ["node", join(here, "gen-text.mjs"), "--kind=srt", `--out=${out}/srt-3h.srt`, "--hours=3"], ["node", join(here, "gen-text.mjs"), "--kind=vtt", `--out=${out}/vtt-3h.vtt`, "--hours=3"]);
    o.push(["node", join(here, "gen-text.mjs"), "--kind=eml", `--out=${out}/eml-3att.eml`, "--attbytes=3000000"]);
    for (const c of full ? [10000, 100000, 100001] : [10000]) o.push(["node", join(here, "gen-text.mjs"), "--kind=mbox", `--out=${out}/mbox-${c}.mbox`, `--count=${c}`, `--bytes=${full ? 500 * MiB : 50 * MiB}`]);
    return o;
  })(),
  l2: (() => {
    const o = [S("xlsx-10mb.xlsx", 200000, 7), S("xlsx-250k-cells.xlsx", 62500, 4), S("xlsx-1m-cells.xlsx", 100000, 10), S("xlsx-wide-16384.xlsx", 20, 16384), S("xlsx-1000-sheets.xlsx", 10, 5, ["--sheets=1000"]),
      S("ods-10mb.ods", 100000, 10, ["--fmt=ods"]), S("ods-ratio-bomb.ods", 20000, 50, ["--fmt=ods", "--ratio-bomb=1"])];
    o.push(S("xlsx-50mb-1m-rows.xlsx", 1000000, 7), S("xlsx-max-rows.xlsx", 1048576, 1), S("xlsx-over-max-rows.xlsx", 1048577, 1), S("ods-50mb.ods", 400000, 10, ["--fmt=ods"]), S("ods-20mb.ods", 150000, 10, ["--fmt=ods"]));
    return o;
  })(),
  l3: [M("jpeg", ["--mp=12"]), M("jpeg", ["--mp=24"]), M("jpeg", ["--mp=48"]), M("heic", ["--mp=12"]), M("heic", ["--mp=24"]), M("heic", ["--mp=48"]), M("png", ["--mp=12"]), M("avif", ["--mp=12"]), M("tiff", ["--pages=40"]), M("jpeg-solid", ["--w=12000", "--h=10000"]), M("jpeg-solid", ["--w=12001", "--h=10000"])],
  l4: [M("rtf", ["--mib=10"]), M("rtf", ["--mib=50"]), M("rtf", ["--mib=100"]), M("doc", ["--mib=25"]), M("xls", ["--rows=65535", "--cols=20"]), M("xls", ["--rows=65535", "--cols=100"]), ...(full ? [M("doc", ["--mib=50"]), M("ppt", ["--mib=100"])] : [M("ppt", ["--mib=25"])])],
  l5: [M("zip-random", ["--mib=480", "--members=20"]), M("zip-random", ["--mib=400", "--members=1"]), M("zip-many", ["--members=10000", "--mib-total=1900"]), M("blob", ["--bytes=524288000"]), M("blob", ["--bytes=524288001"]), M("zip-nest", ["--depth=3"]), M("zip-nest", ["--depth=4"]),
    M("zip-bomb-zeros", ["--mib=1900"]), M("bz2-bomb", ["--gib=3"]), M("targz", ["--mib=200", "--members=50"]), M("tarbz2", ["--mib=200", "--members=50"]), M("tarxz", ["--mib=200", "--members=50"]), M("7z", ["--mib=200", "--members=50"]), M("targz", ["--mib=200", "--members=50", "--content=words"]), M("tarbz2", ["--mib=200", "--members=50", "--content=words"]), M("tarxz", ["--mib=200", "--members=50", "--content=words"]), M("7z", ["--mib=200", "--members=50", "--content=words"])],
};
for (const s of sets) for (const cmd of plan[s] || []) {
  if (arg.dry) { console.log(cmd.join(" ")); continue; }
  const t0 = Date.now();
  try { const o = execFileSync(cmd[0], cmd.slice(1), { stdio: ["ignore", "pipe", "inherit"], maxBuffer: 1 << 26 }).toString().trim(); appendFileSync(join(out, "MANIFEST.jsonl"), o.split("\n").filter((l) => l.startsWith("{")).join("\n") + "\n"); console.error(`ok ${s} ${(Date.now() - t0) / 1000}s ${cmd.slice(2).join(" ")}`); }
  catch (e) { console.error(`FAILED ${s}: ${cmd.slice(1).join(" ")} :: ${String(e.message).slice(0, 200)}`); }
}
