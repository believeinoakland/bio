/* pdf-reader tests: a digest of a whole answer that is the same for equal answers and holds nothing of it, so the
 * answer for a 16 MB file (150 MB as JSON) can be compared without being written out. Objects by key in order,
 * arrays by element, strings by their characters (in chunks), numbers and booleans by value. */
import { createHash } from "node:crypto";

export function digestOf(value) {
  const h = createHash("sha256");
  const text = (s) => { for (let i = 0; i < s.length; i += 65536) h.update(s.slice(i, i + 65536), "utf8"); };
  const walk = (v) => {
    if (v === null) h.update("n;");
    else if (typeof v === "string") { h.update(`s${v.length}:`); text(v); h.update(";"); }
    else if (typeof v !== "object") h.update(`${typeof v}:${String(v)};`);
    else if (Array.isArray(v)) { h.update(`[${v.length}:`); for (const x of v) walk(x); h.update("];"); }
    else if (v instanceof Uint8Array) h.update(`b${v.length}:${Buffer.from(v).toString("hex")};`);
    else { const keys = Object.keys(v); h.update(`{${keys.length}:`); for (const k of keys) { h.update(`k${k.length}:${k};`); walk(v[k]); } h.update("};"); }
  };
  walk(value);
  return h.digest("hex");
}
