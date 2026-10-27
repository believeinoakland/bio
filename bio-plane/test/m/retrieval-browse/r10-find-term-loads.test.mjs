/* retrieval-browse, fix round 10 (T51; cause 26; K5057): R20. A `term` find takes its hits from the index and reads the stored text of
 * the units holding a hit, not of every unit of the capture. The `capture_text` text read is counted by wrapping `sql.exec`, so the
 * test sees what the find loads, which a count of matches never shows. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";

const MIB = 1024 * 1024;
const textBytes = (rows) => rows.reduce((n, r) => n + (typeof r.text === "string" ? Buffer.byteLength(r.text) : 0), 0);

/** A capture of twelve units of 2 MiB, the term `quokkamark` in unit 1 alone; `loaded()` is the text bytes the finds since the last
 *  reset read out of `capture_text`. */
function twelve() {
  const w = world();
  const c = w.cap("big.pdf", "big bytes");
  w.doc("INFO-BIG", {}, { captures: [c] });
  w.reading(c.sha, "INFO-BIG");
  for (let i = 0; i < 12; i++) {
    const filler = `page ${i} council budget line `.repeat(Math.ceil(2 * MIB / 28)).slice(0, 2 * MIB - 40);
    w.unit(c.sha, "INFO-BIG", i, i === 1 ? `${filler} quokkamark ended` : filler);
  }
  let bytes = 0;
  const exec = w.st.sql.exec.bind(w.st.sql);
  w.st.sql.exec = (q, ...a) => {
    const out = exec(q, ...a);
    if (!/FROM capture_text\b/i.test(q) || !/\btext\b/i.test(q.split(/FROM/i)[0])) return out;
    const rows = [...out];
    bytes += textBytes(rows);
    return rows[Symbol.iterator] ? Object.assign(rows, { toArray: () => rows, one: () => rows[0] }) : rows;
  };
  return { w, c, loaded: () => bytes, reset: () => { bytes = 0; } };
}

const find = (w, c, kinds, term = "quokkamark") => w.rb.findIn({ viewer: V("vera"), scope: { capture: c.sha }, kinds, term });

test("R20 a term find over twelve units of 2 MiB with the term in one returns that item and reads at most 4 MiB of stored text", () => {
  const { w, c, loaded, reset } = twelve();
  reset();
  const ans = find(w, c, ["term"]);
  assert.equal(ans.ok, true);
  const term = ans.kinds.find((k) => k.kind === "term");
  assert.equal(term.items.length, 1);
  assert.deepEqual(term.items[0].extent, { kind: "pdf-page", page: 1 });
  assert.ok(loaded() <= 4 * MIB, `a term find read ${(loaded() / MIB).toFixed(1)} MiB of stored text`);
});

test("R20 control: the other kinds read the units they need, and a term asked beside them finds the same item", () => {
  const { w, c, loaded, reset } = twelve();
  reset();
  const alone = find(w, c, ["term"]).kinds[0].items;
  reset();
  const ans = find(w, c, ["money", "term"]);
  assert.ok(loaded() >= 12 * 2 * MIB * 0.9, "money reads the text of every unit it matches over");
  assert.deepEqual(ans.kinds.find((k) => k.kind === "term").items, alone);
});
