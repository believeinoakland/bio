/* skills' test fixture: the repository's documents, one normaliser for "found verbatim", a published answer
 * shaped as the plane's `op=affordances` with no target (`{catalog, vocabularies, capture_acts}`), and the
 * check catalogue's namespace, which `renderPack` takes as its `catalogue`. Nothing here reads a module later
 * than skills in the order (P4). */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import * as catalogueNs from "../../../checks/bio-checks.mjs";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
export const SRC = ["bio-plane/src/skillpack.mjs", "bio-plane/src/skilldoctrine.mjs"];
export const catalogue = catalogueNs;

export const read = (rel) => readFileSync(join(ROOT, rel), "utf8");

/* Markdown emphasis, code and blockquote marks removed, whitespace collapsed: a sentence wrapped across lines,
   quoted or set in bold is still the same sentence. Nothing else is folded, so a changed word is not found. */
export const norm = (s) => String(s).replace(/^[ \t]*>[ \t]?/gm, "").replace(/[*`]/g, "").replace(/\s+/g, " ").trim();

/* Whether `sentence` is in `text`, verbatim but for the normaliser; a quoted sentence may start with a
   letter the document capitalises at a sentence start, and only that first letter is compared either way. */
export function foundIn(text, sentence) {
  const t = norm(text), s = norm(sentence);
  if (!s) return false;
  const flip = s[0] === s[0].toUpperCase() ? s[0].toLowerCase() + s.slice(1) : s[0].toUpperCase() + s.slice(1);
  return t.includes(s) || t.includes(flip);
}

/* The span of a Markdown section: from its heading to the next heading of the same or a higher level. */
export function section(text, headingStart) {
  const lines = text.split("\n");
  const i = lines.findIndex((l) => /^#+ /.test(l) && l.replace(/^#+ /, "").startsWith(headingStart));
  if (i < 0) return "";
  const depth = lines[i].match(/^#+/)[0].length;
  let j = i + 1;
  while (j < lines.length && !(/^#+ /.test(lines[j]) && lines[j].match(/^#+/)[0].length <= depth)) j++;
  return lines.slice(i, j).join("\n");
}

/* The canon: every document the requirements canon's "Canon" section lists (`requirements/README.md`). */
export function canonDocuments() {
  const text = read("requirements/README.md");
  const canon = text.slice(text.indexOf("## Canon"), text.indexOf("## Reference, not canon"));
  return new Set([...canon.matchAll(/^\| `([^`]+)` \|/gm)].map((m) => m[1]));
}

/* A published answer in the plane's shape. Acts at each published mode, one vocabulary per kind of value. */
export function published(over = {}) {
  return {
    catalog: [
      { id: "act-b", label: "Adopt a version", mode: "session", prompt: "adopt it?" },
      { id: "act-a", mode: "admin-session" },
      { id: "act-m", label: "Read", mode: "machine" },
      { id: "act-n" },
    ],
    vocabularies: { colours: ["red", "green"], shapes: { round: "a circle" } },
    capture_acts: [{ id: "cap-1" }],
    ...over,
  };
}

/* JavaScript string literals of a source file, outside comments, as their text. */
export function stringLiterals(src) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (c === "/" && d === "*") { const e = src.indexOf("*/", i + 2); i = e < 0 ? src.length : e + 2; continue; }
    if (c === "/" && d === "/") { const e = src.indexOf("\n", i); i = e < 0 ? src.length : e; continue; }
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1, s = "";
      while (j < src.length && src[j] !== c) { if (src[j] === "\\") { s += src[j + 1]; j += 2; } else s += src[j++]; }
      out.push(s); i = j + 1; continue;
    }
    if (c === "/" && /[(,=:[!&|?{};\n]\s*$/.test(src.slice(Math.max(0, i - 8), i))) {
      let j = i + 1, cls = false;
      while (j < src.length && (cls || src[j] !== "/")) {
        if (src[j] === "\\") j++; else if (src[j] === "[") cls = true; else if (src[j] === "]") cls = false;
        j++;
      }
      i = j + 1; continue;
    }
    i++;
  }
  return out;
}
