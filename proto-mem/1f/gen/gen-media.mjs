#!/usr/bin/env node
/* proto-mem/1f (THROWAWAY): deterministic fixture generator for L3 (pictures), L4 (legacy Office, RTF) and L5 (archives).
   Tools used (checked present by `node gen-media.mjs tools`): ImageMagick `convert` (Q16, -seed fixed), exiftool, heif-enc (libheif-examples), ffmpeg (AVIF), soffice (.doc/.xls/.ppt are
   written by LibreOffice from a generated RTF/CSV/PPTX), zip, tar, gzip -n, bzip2, xz, 7z. Incompressible bytes come from AES-128-CTR over zeros with a fixed key (node:crypto), not from files.
   No copyrighted content. Same arguments => same bytes, except where noted (soffice-written .doc/.xls/.ppt and 7z carry the tool's own metadata; their sha256 is reported, not promised).
   node gen-media.mjs <what> --dir=OUT [--mp=48] [--mib=N] ...
     jpeg --mp=12|24|48   noise JPEG Q85 with EXIF (time, GPS, orientation 6)   png --mp=12      heic --mp=12|24|48 (heif-enc from the JPEG)
     avif --mp=12 (ffmpeg libsvtav1)   tiff --pages=40 (text pages, LZW)   rtf --mib=N   doc --mib=N (RTF -> .doc by soffice)   xls --rows=65535 --cols=N   ppt --mib=N
     zip-random --mib=N --members=K   zip-many --members=10000 --mib-total=1900   blob --bytes=N   zip-nest --depth=3|4   zip-bomb-zeros --mib=1900   bz2-bomb --gib=3   targz|tarbz2|tarxz|7z --mib=N --members=K [--content=words]
   Every command prints one JSON line {file, bytes, sha256, ...}. */
import { createCipheriv } from "node:crypto";
import { createWriteStream, mkdirSync, statSync, createReadStream, rmSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const what = process.argv[2];
const arg = Object.fromEntries(process.argv.slice(3).map((a) => { const [k, ...v] = a.replace(/^--/, "").split("="); return [k, v.join("=") || "1"]; }));
const dir = arg.dir || "."; mkdirSync(dir, { recursive: true });
const MiB = 1048576;
const sh = (cmd, args, opt = {}) => execFileSync(cmd, args, { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1 << 28, ...opt });
const sha = (f) => new Promise((res) => { const h = createHash("sha256"); createReadStream(f).on("data", (c) => h.update(c)).on("end", () => res(h.digest("hex"))); });
const report = async (f, extra = {}) => console.log(JSON.stringify({ file: f, bytes: statSync(f).size, sha256: await sha(f), ...extra }));
const KEY = Buffer.from("proto-mem-1f-key"), IV0 = Buffer.alloc(16);
/* n bytes of deterministic incompressible data (AES-CTR keystream), written to `path` */
async function randomFile(path, n, salt = 0) {
  const iv = Buffer.from(IV0); iv.writeUInt32BE(salt >>> 0, 0);
  const c = createCipheriv("aes-128-ctr", KEY, iv), ws = createWriteStream(path), blk = Buffer.alloc(1 << 20);
  for (let left = n; left > 0;) { const k = Math.min(left, blk.length); const b = c.update(blk.subarray(0, k)); left -= k; if (!ws.write(b)) await new Promise((r) => ws.once("drain", r)); }
  await new Promise((r) => ws.end(r));
}
/* n bytes of a repeated 80-char line carrying the member index (compressible ~100-300:1) */
async function repeatFile(path, n, tag) {
  const line = Buffer.from(`${String(tag).padStart(8, "0")} the quick pseudo-word line repeats for the ratio fixture ${"abcdefghij".repeat(3)}\n`);
  const ws = createWriteStream(path), blk = Buffer.concat(Array(Math.ceil(65536 / line.length)).fill(line));
  for (let left = n; left > 0;) { const k = Math.min(left, blk.length); if (!ws.write(blk.subarray(0, k))) await new Promise((r) => ws.once("drain", r)); left -= k; }
  await new Promise((r) => ws.end(r));
}
/* n bytes of pseudo-word text (seeded xorshift, 12 words a line, ~3-4:1 under gzip/xz/7z: far below the 1,100:1 ratio bound) */
async function wordsFile(path, n, tag) {
  let st = (Number(tag) * 2654435761 + 12345) >>> 0 || 1; const rnd = () => { st ^= st << 13; st >>>= 0; st ^= st >>> 17; st ^= st << 5; st >>>= 0; return st; };
  const syl = ["ka", "to", "mi", "ren", "sol", "vi", "dar", "ne", "pho", "lu", "ba", "cri", "tem", "or", "an", "gue", "shi", "ros", "ment", "tion"]; const ws = createWriteStream(path);
  for (let left = n; left > 0;) { let blk = ""; while (blk.length < 65536) { let line = ""; for (let i = 0; i < 12; i++) { line += syl[rnd() % 20] + syl[rnd() % 20] + syl[rnd() % 20] + " "; } blk += line + "\n"; } const b = Buffer.from(blk).subarray(0, Math.min(left, blk.length)); left -= b.length; if (!ws.write(b)) await new Promise((r) => ws.once("drain", r)); }
  await new Promise((r) => ws.end(r));
}
const payloadFile = (path, n, tag) => (arg.content === "words" ? wordsFile(path, n, tag) : repeatFile(path, n, tag));
const zeroFile = async (path, n) => { const ws = createWriteStream(path), z = Buffer.alloc(1 << 20); for (let left = n; left > 0;) { const k = Math.min(left, z.length); if (!ws.write(z.subarray(0, k))) await new Promise((r) => ws.once("drain", r)); left -= k; } await new Promise((r) => ws.end(r)); };
const dims = { 12: [4000, 3000], 24: [6000, 4000], 48: [8000, 6000] };
const tag = (f) => f.replace(/[^a-z0-9_.-]/gi, "");
const touchAll = (d) => sh("find", [d, "-exec", "touch", "-h", "-d", "2000-01-01T00:00:00Z", "{}", "+"]);
const exif = (f) => sh("exiftool", ["-overwrite_original", "-q", "-DateTimeOriginal=2026:01:02 03:04:05", "-GPSLatitude=37.8044", "-GPSLatitudeRef=N", "-GPSLongitude=122.2712", "-GPSLongitudeRef=W", "-Orientation#=6", f]);

async function jpeg(mp) {
  const [w, h] = dims[mp]; const f = join(dir, `jpeg-${mp}mp.jpg`);
  sh("convert", ["-seed", "1", "-size", `${w}x${h}`, "xc:gray50", "+noise", "Random", "-colorspace", "sRGB", "-strip", "-quality", "85", f]);
  exif(f); await report(f, { type: "jpeg", mp, width: w, height: h });
  return f;
}
const what0 = {
  async tools() { for (const t of ["convert", "exiftool", "heif-enc", "ffmpeg", "soffice", "zip", "tar", "gzip", "bzip2", "xz", "7z"]) { let ok = true; try { sh("sh", ["-c", `command -v ${t}`]); } catch { ok = false; } console.log(`${t}: ${ok ? "present" : "MISSING"}`); } },
  async jpeg() { await jpeg(Number(arg.mp || 12)); },
  async "jpeg-solid"() { const w = Number(arg.w), h = Number(arg.h); const f = join(dir, `jpeg-solid-${w}x${h}.jpg`); sh("convert", ["-size", `${w}x${h}`, "xc:gray60", "-strip", "-quality", "85", f]); exif(f); await report(f, { type: "jpeg", width: w, height: h, pixels: w * h, note: "solid colour: small file, full-size decode" }); },
  async blob() { const n = Number(arg.bytes); const f = join(dir, `blob-${n}.bin`); await randomFile(f, n, 99); await report(f, { type: "blob", note: "incompressible bytes of an exact length, for an upload-bound check (not a valid archive)" }); },
  async png() { const mp = Number(arg.mp || 12); const [w, h] = dims[mp]; const f = join(dir, `png-${mp}mp.png`); sh("convert", ["-seed", "1", "-size", `${w}x${h}`, "xc:gray50", "+noise", "Random", "-strip", f]); await report(f, { type: "png", mp }); },
  async heic() { const mp = Number(arg.mp || 12); const j = join(dir, `jpeg-${mp}mp.jpg`); if (!existsSync(j)) await jpeg(mp); const f = join(dir, `heic-${mp}mp.heic`); sh("heif-enc", ["-q", "50", j, "-o", f]); await report(f, { type: "heic", mp, encoder: "heif-enc " + (sh("heif-enc", ["--version"]).toString().trim()) }); },
  async avif() { const mp = Number(arg.mp || 12); const j = join(dir, `jpeg-${mp}mp.jpg`); if (!existsSync(j)) await jpeg(mp); const f = join(dir, `avif-${mp}mp.avif`); sh("ffmpeg", ["-y", "-v", "error", "-i", j, "-c:v", "libsvtav1", "-preset", "10", "-crf", "50", "-frames:v", "1", f]); await report(f, { type: "avif", mp }); },
  async tiff() {
    const pages = Number(arg.pages || 40); const tmp = join(dir, "tiff-pages"); mkdirSync(tmp, { recursive: true }); const words = ["alpha", "bravo", "civic", "docket", "ledger", "minute", "notice", "record", "tally", "vote"];
    for (let p = 0; p < pages; p++) { let s = ""; for (let i = 0; i < 40; i++) s += Array.from({ length: 9 }, (_, k) => words[(p * 7 + i * 3 + k * 5) % words.length]).join(" ") + "\\n"; sh("convert", ["-size", "2480x3508", "xc:white", "-fill", "black", "-pointsize", "30", "-annotate", "+120+160", s, "-colorspace", "Gray", "-depth", "8", join(tmp, `p${String(p).padStart(3, "0")}.tif`)]); }
    const f = join(dir, `tiff-${pages}p.tif`); sh("convert", [...readdirSync(tmp).sort().map((x) => join(tmp, x)), "-compress", "LZW", f]); rmSync(tmp, { recursive: true }); await report(f, { type: "tiff", pages });
  },
  async rtf() { const f = join(dir, `rtf-${arg.mib}mib.rtf`); await rtf(f, Number(arg.mib)); await report(f, { type: "rtf", mib: Number(arg.mib) }); },
  async doc() { const r = join(dir, `rtf-${arg.mib}mib.rtf`); if (!existsSync(r)) await rtf(r, Number(arg.mib)); const f = soffice(r, "doc", "doc:MS Word 97"); await report(f, { type: "doc", from_rtf_mib: Number(arg.mib), note: "written by soffice; sha not promised stable" }); },
  async xls() {
    const rows = Number(arg.rows || 65535), cols = Number(arg.cols || 20); const csv = join(dir, `sheet-${rows}x${cols}.csv`);
    const ws = createWriteStream(csv); let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed; };
    for (let r = 0; r < rows; r++) { const row = []; for (let c = 0; c < cols; c++) row.push(c % 3 === 0 ? `w${rnd() % 5000}x${c}` : (rnd() % 100000) / 100); if (!ws.write(row.join(",") + "\n")) await new Promise((x) => ws.once("drain", x)); }
    await new Promise((r) => ws.end(r)); const f = soffice(csv, "xls", "xls:MS Excel 97"); await report(f, { type: "xls", rows, cols, note: "written by soffice from the CSV" });
  },
  async ppt() {
    /* a .pptx with `mib` MiB of noise JPEG pictures on one slide each, then soffice -> .ppt */
    const mib = Number(arg.mib || 100); const tmp = join(dir, "ppt-src"); mkdirSync(tmp, { recursive: true }); const jpgs = [];
    for (let i = 0; mib > 0 && jpgs.length * 23 < mib; i++) { const j = join(tmp, `n${i}.jpg`); sh("convert", ["-seed", String(i + 1), "-size", "8000x6000", "xc:gray50", "+noise", "Random", "-quality", "85", "-strip", j]); jpgs.push(j); }
    writeFileSync(join(tmp, "make.py"), `import sys\nfrom pptx import Presentation\nfrom pptx.util import Inches\np=Presentation()\nfor j in sys.argv[2:]:\n    s=p.slides.add_slide(p.slide_layouts[6]); s.shapes.add_picture(j,0,0,width=Inches(10))\np.save(sys.argv[1])\n`);
    let pptx = join(dir, `ppt-${mib}mib.pptx`);
    try { sh("python3", ["-I", join(tmp, "make.py"), pptx, ...jpgs]); } catch { console.error("python-pptx missing: cannot build the .pptx; install python-pptx on the generating machine"); process.exit(4); }
    const f = soffice(pptx, "ppt", "ppt:MS PowerPoint 97"); rmSync(tmp, { recursive: true }); await report(f, { type: "ppt", pictures: jpgs.length });
  },
  async "zip-random"() {
    const mib = Number(arg.mib || 480), k = Number(arg.members || 20), d = join(dir, "zr-src"); mkdirSync(d, { recursive: true });
    for (let i = 0; i < k; i++) await randomFile(join(d, `m${String(i).padStart(5, "0")}.bin`), Math.floor(mib * MiB / k), i + 1);
    touchAll(d); const f = join(dir, `zip-random-${mib}mib-${k}m.zip`); rmSync(f, { force: true });
    sh("sh", ["-c", `cd ${d} && ls | sort | zip -X -0 -q ${f} -@`]); rmSync(d, { recursive: true }); await report(f, { type: "zip", members: k, stored: true, payload_mib: mib });
  },
  async "zip-many"() {
    const k = Number(arg.members || 10000), total = Number(arg["mib-total"] || 1900), d = join(dir, "zm-src"); mkdirSync(d, { recursive: true });
    const per = Math.floor(total * MiB / k);
    for (let i = 0; i < k; i++) await repeatFile(join(d, `m${String(i).padStart(5, "0")}.txt`), per, i);
    touchAll(d); const f = join(dir, `zip-many-${k}m-${total}mib.zip`); rmSync(f, { force: true });
    sh("sh", ["-c", `cd ${d} && ls | sort | zip -X -q ${f} -@`]); rmSync(d, { recursive: true }); await report(f, { type: "zip", members: k, unpacked_bytes: per * k });
  },
  async "zip-nest"() {
    const depth = Number(arg.depth || 3); const d = join(dir, "nest"); mkdirSync(d, { recursive: true }); writeFileSync(join(d, "leaf.txt"), "TRUTH-nest-leaf\n"); touchAll(d);
    let cur = "leaf.txt";
    for (let lvl = 1; lvl <= depth; lvl++) { const z = `l${lvl}.zip`; rmSync(join(d, z), { force: true }); sh("sh", ["-c", `cd ${d} && zip -X -0 -q ${z} ${cur}`]); cur = z; }
    const f = join(dir, `zip-nest-${depth}.zip`); sh("cp", [join(d, cur), f]); rmSync(d, { recursive: true }); await report(f, { type: "zip", nest_levels: depth });
  },
  async "zip-bomb-zeros"() {
    const mib = Number(arg.mib || 1900), d = join(dir, "zb-src"); mkdirSync(d, { recursive: true }); await zeroFile(join(d, "zeros.bin"), mib * MiB); touchAll(d);
    const f = join(dir, `zip-zeros-${mib}mib.zip`); rmSync(f, { force: true }); sh("sh", ["-c", `cd ${d} && zip -X -9 -q ${f} zeros.bin`]); rmSync(d, { recursive: true }); await report(f, { type: "zip", unpacked_bytes: mib * MiB });
  },
  async "bz2-bomb"() {
    const gib = Number(arg.gib || 3), d = join(dir, "bb-src"); mkdirSync(d, { recursive: true }); await zeroFile(join(d, "zeros.bin"), gib * 1024 * MiB);
    const f = join(dir, `bz2-zeros-${gib}gib.bz2`); sh("sh", ["-c", `bzip2 -9 -c ${join(d, "zeros.bin")} > ${f}`]); rmSync(d, { recursive: true }); await report(f, { type: "bz2", unpacked_bytes: gib * 1024 * MiB });
  },
  async targz() { await tarOf("tar.gz", ["gzip", "-n", "-c"]); }, async tarbz2() { await tarOf("tar.bz2", ["bzip2", "-c"]); }, async tarxz() { await tarOf("tar.xz", ["xz", "-c"]); },
  async "7z"() {
    const mib = Number(arg.mib || 200), k = Number(arg.members || 50), d = join(dir, "sz-src"); mkdirSync(d, { recursive: true });
    for (let i = 0; i < k; i++) await payloadFile(join(d, `m${String(i).padStart(5, "0")}.txt`), Math.floor(mib * MiB / k), i); touchAll(d);
    const f = join(dir, `7z${arg.content === "words" ? "-w" : ""}-${mib}mib-${k}m.7z`); rmSync(f, { force: true }); sh("sh", ["-c", `cd ${d} && 7z a -mx=3 -mtm=off -mtc=off -mta=off -bso0 -bsp0 ${f} .`]); rmSync(d, { recursive: true }); await report(f, { type: "7z", members: k, unpacked_bytes: Math.floor(mib * MiB / k) * k });
  },
};
async function tarOf(ext, compressor) {
  const mib = Number(arg.mib || 200), k = Number(arg.members || 50), d = join(dir, "tr-src"); mkdirSync(d, { recursive: true });
  for (let i = 0; i < k; i++) await payloadFile(join(d, `m${String(i).padStart(5, "0")}.txt`), Math.floor(mib * MiB / k), i); touchAll(d);
  const f = join(dir, `${ext.replace(".", "-")}${arg.content === "words" ? "-w" : ""}-${mib}mib-${k}m.${ext}`);
  sh("sh", ["-c", `cd ${d} && tar --sort=name --mtime=@946684800 --owner=0 --group=0 --numeric-owner -cf - . | ${compressor.join(" ")} > ${f}`]); rmSync(d, { recursive: true }); await report(f, { type: ext, members: k, unpacked_bytes: Math.floor(mib * MiB / k) * k });
}
async function rtf(f, mib) {
  const ws = createWriteStream(f); let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed; };
  const syl = ["ka", "to", "mi", "ren", "sol", "vi", "dar", "ne", "pho", "lu"]; const word = () => syl[rnd() % 10] + syl[rnd() % 10] + syl[rnd() % 10];
  ws.write("{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Liberation Serif;}}\\f0\\fs22\n"); let n = 0;
  while (n < mib * MiB - 200) { let line = "\\pard "; for (let i = 0; i < 14; i++) line += word() + " "; line += "\\par\n"; n += line.length; if (!ws.write(line)) await new Promise((r) => ws.once("drain", r)); }
  ws.write("\\pard TRUTH-1-rtf-" + mib + "\\par}\n"); await new Promise((r) => ws.end(r));
}
/* soffice with a private profile (macros off), writes <src>.<ext> next to it; returns the path */
function soffice(src, ext, filter) {
  const out = join(dir, "soffice-out"); mkdirSync(out, { recursive: true }); const prof = join(dir, "soffice-profile");
  sh("soffice", [`-env:UserInstallation=file://${prof}`, "--headless", "--norestore", "--convert-to", filter, "--outdir", out, src], { timeout: 3600000 });
  const base = src.split("/").pop().replace(/\.[^.]+$/, ""); const dest = join(dir, `${base}.${ext}`); sh("mv", [join(out, `${base}.${ext}`), dest]); rmSync(out, { recursive: true }); rmSync(prof, { recursive: true, force: true }); return dest;
}
if (!what0[what]) { console.error("unknown: " + what); process.exit(2); }
await what0[what]();
