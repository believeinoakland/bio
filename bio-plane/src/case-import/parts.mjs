/* case-import — reading a case file's parts (requirements: `build/requirements/case-import.md` R1; `case-grammar` R13;
 * `public-read` R6: each part is a stored, uncompressed ZIP with the manifest at its root).
 *
 * A STAND-IN (J2). The one reading of the format is `case-checker`'s, which opens the parts for its own integrity check
 * (its R2). Until it exports that reader, this module opens the parts itself, only as far as R1 needs: the manifest, to
 * hand to `case-grammar.caseFileManifestCheck`, and where each file lies, to hold it by its SHA-256. Pure: it reads only
 * its arguments and never throws; every way the bytes depart from a stored ZIP is answered as a departure, named. */

/** The manifest's path at a part's root. */
export const MANIFEST_NAMES = Object.freeze(["manifest.json", "MANIFEST.json"]);

const SIG_LOCAL = 0x04034b50, SIG_CENTRAL = 0x02014b50, SIG_END = 0x06054b50;
const td = new TextDecoder("utf-8", { fatal: false });

/* One part: its entries `{name, at, bytes}` (`at` the byte where the entry's data begins), or departures. */
export function readPart(bytes, index) {
  const out = { entries: [], departures: [] };
  const no = (why) => { out.departures.push(`part ${index}: ${why}`); return out; };
  try {
    if (!(bytes instanceof Uint8Array)) return no("is not bytes");
    const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let end = -1;
    for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 65535); i--)
      if (v.getUint32(i, true) === SIG_END) { end = i; break; }
    if (end < 0) return no("is not a ZIP archive (no end of central directory)");
    const count = v.getUint16(end + 10, true);
    let p = v.getUint32(end + 16, true);
    for (let k = 0; k < count; k++) {
      if (p + 46 > bytes.length || v.getUint32(p, true) !== SIG_CENTRAL) return no("its central directory is broken");
      const method = v.getUint16(p + 10, true);
      const size = v.getUint32(p + 20, true), usize = v.getUint32(p + 24, true);
      const nlen = v.getUint16(p + 28, true), xlen = v.getUint16(p + 30, true), clen = v.getUint16(p + 32, true);
      const local = v.getUint32(p + 42, true);
      const name = td.decode(bytes.subarray(p + 46, p + 46 + nlen));
      p += 46 + nlen + xlen + clen;
      if (method !== 0 || size !== usize) return no(`${name} is compressed, and a case file's parts are stored`);
      if (local + 30 > bytes.length || v.getUint32(local, true) !== SIG_LOCAL) return no(`${name}'s local header is broken`);
      const at = local + 30 + v.getUint16(local + 26, true) + v.getUint16(local + 28, true);
      if (at + size > bytes.length) return no(`${name} runs past the end of the part`);
      if (name.endsWith("/")) continue;
      out.entries.push({ name, at, bytes: bytes.subarray(at, at + size) });
    }
    return out;
  } catch (e) {
    return no(`could not be read (${String(e && e.message ? e.message : e).slice(0, 120)})`);
  }
}

/** Every part: the manifest (parsed, and its bytes as the first part holds them), every entry of every part by name with
 *  the part it lies in, and the departures. Parts whose manifests differ depart. */
export function readCaseFile(parts) {
  const departures = [];
  const files = new Map();
  let manifest = null, manifestBytes = null;
  const list = Array.isArray(parts) ? parts : [];
  if (!list.length) return { manifest, manifestBytes, files, departures: ["no part was given"] };
  list.forEach((bytes, index) => {
    const p = readPart(bytes, index);
    departures.push(...p.departures);
    if (p.departures.length) return;
    const m = p.entries.find((e) => MANIFEST_NAMES.includes(e.name));
    if (!m) { departures.push(`part ${index}: carries no manifest at its root`); return; }
    if (manifestBytes === null) manifestBytes = m.bytes;
    else if (!sameBytes(manifestBytes, m.bytes)) departures.push(`part ${index}: its manifest differs from part 0's`);
    for (const e of p.entries) if (!MANIFEST_NAMES.includes(e.name) && !files.has(e.name)) files.set(e.name, { ...e, part: index });
  });
  if (manifestBytes !== null) {
    try {
      manifest = JSON.parse(td.decode(manifestBytes));
      if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
        departures.push("the manifest is not a JSON object");
        manifest = null;
      }
    } catch {
      departures.push("the manifest is not JSON");
    }
  }
  return { manifest, manifestBytes, files, departures };
}

function sameBytes(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
