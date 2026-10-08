/* The interface's word list (R68; DEC-179; K2200 (4)) at the module's interface: `INTERFACE_WORDS` read against
   `docs/development/ux-substrate/screens/words.json` as PR #14 merged it (e08cd35ecb), word by word. The file is read
   from git at that commit, so a later edit of the working copy does not move the list (a later list is carried only by
   a later requirement); when git cannot read it the working copy is read, and the commit's own counts still bind. */
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { INTERFACE_WORDS, INTERFACE_WORDS_COMMIT } from "../../../src/setup.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const PATH = "docs/development/ux-substrate/screens/words.json";
function theFile() {
  try { return JSON.parse(execFileSync("git", ["show", `e08cd35ecb:${PATH}`], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 24 })); }
  catch { return JSON.parse(readFileSync(join(ROOT, PATH), "utf8")); }
}

/* The sibling a word's meaning is read from, stated independently of the module: the nearest dotted prefix (at least
   two segments) holding a `.means` or `.does` entry other than the word itself; none for a `.means`/`.does` entry. */
function siblingOf(key, byKey) {
  const s = key.split(".");
  if (s.at(-1) === "means" || s.at(-1) === "does") return null;
  for (let n = s.length - 1; n >= 2; n--)
    for (const end of ["means", "does"]) {
      const k = `${s.slice(0, n).join(".")}.${end}`;
      if (k !== key && byKey.has(k)) return byKey.get(k).en;
    }
  return null;
}

test("R68 INTERFACE_WORDS equals words.json at e08cd35ecb word by word: 921 words, 345 protected, in the file's order, each {key, en, note, means, protected} with key, en, protected and note (or null) as the file gives them and means the en of its sibling .means or .does entry, or null", () => {
  const file = theFile();
  const byKey = new Map(file.words.map((w) => [w.key, w]));
  assert.equal(INTERFACE_WORDS_COMMIT, "e08cd35ecb");
  assert.equal(INTERFACE_WORDS.length, 921);
  assert.equal(INTERFACE_WORDS.filter((w) => w.protected).length, 345);
  assert.equal(file.counts.total, 921);
  assert.equal(file.counts.protected, 345);
  assert.equal(INTERFACE_WORDS.length, file.words.length);
  file.words.forEach((f, i) => {
    const w = INTERFACE_WORDS[i];
    assert.deepEqual(w, { key: f.key, en: f.en, note: f.note ?? null, means: siblingOf(f.key, byKey), protected: f.protected === true }, f.key);
  });
  /* the readings the sibling rule gives, by example */
  const at = (k) => INTERFACE_WORDS.find((w) => w.key === k);
  assert.equal(at("weight.reversible.name").means, byKey.get("weight.reversible.means").en);
  assert.equal(at("act.publish.label.ceremony").means, byKey.get("act.publish.does").en);
  assert.equal(at("weight.reversible.means").means, null);
  assert.equal(at("state.undetermined").note, "the reason always follows");
  /* frozen data */
  assert.ok(Object.isFrozen(INTERFACE_WORDS) && Object.isFrozen(INTERFACE_WORDS[0]));
  assert.equal(new Set(INTERFACE_WORDS.map((w) => w.key)).size, 921);
});
