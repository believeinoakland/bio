/* proto-mem/1f (THROWAWAY): which fixture file goes to which reader-container route, kind and bounds. Shared by local/run-local.mjs and probe/run-remote.mjs.
   Bounds are the ACTIVE figures of bio-plane/src/read-bounds.mjs on origin/lane/platform (boundOf: beta rows read `standard`): document.bytes 100 MB (104,857,600), spreadsheet.bytes 50 MB (52,428,800),
   image.bytes 50 MB, image.pixels 120,000,000, image.edge 65,535, document.pages 5,000, archive.uploaded_bytes 524,288,000, archive.unpacked_bytes 2 GiB, ratio 1,100, members 10,000, name 4,096,
   member_bytes 2 GiB, scan.time_ms 900,000 (the container request time row, src/limits.mjs TIME_ROW). */
const MiB = 1048576, GiB = 1073741824;
export const boundsFor = (route, kind, timeMs = 900000) => route === "convert" ? { bytes: kind === "xls" || kind === "xlsm" ? 50 * MiB : 100 * MiB, timeMs }
  : route === "frames" ? { bytes: 50 * MiB, pixels: 120000000, edge: 65535, pages: 5000, timeMs }
  : { bytes: 524288000, unpacked: 2 * GiB, ratio: 1100, members: 10000, member: 2 * GiB, name: 4096, timeMs };
/* -> { set: 'l3'|'l4'|'l5', route, kind, to? } or null (the file is not a reader-container input) */
export function specOf(f) {
  if (/^(jpeg|png|avif|heic|tiff)-/.test(f)) return { set: "l3", route: "frames", kind: f.split("-")[0] };
  if (/\.rtf$/.test(f)) return { set: "l4", route: "convert", kind: "rtf", to: "docx" };
  if (/\.doc$/.test(f)) return { set: "l4", route: "convert", kind: "doc", to: "docx" };
  if (/\.xls$/.test(f)) return { set: "l4", route: "convert", kind: "xls", to: "xlsx" };
  if (/\.ppt$/.test(f)) return { set: "l4", route: "convert", kind: "ppt", to: "pptx" };
  if (/^blob-/.test(f)) return { set: "l5", route: "archive", kind: "zip" };
  if (/\.zip$/.test(f)) return { set: "l5", route: "archive", kind: "zip" };
  if (/\.7z$/.test(f)) return { set: "l5", route: "archive", kind: "7z" };
  if (/\.tar\.gz$/.test(f)) return { set: "l5", route: "archive", kind: "gz" };
  if (/\.tar\.bz2$/.test(f) || /\.bz2$/.test(f)) return { set: "l5", route: "archive", kind: "bz2" };
  if (/\.tar\.xz$/.test(f)) return { set: "l5", route: "archive", kind: "xz" };
  return null;
}
