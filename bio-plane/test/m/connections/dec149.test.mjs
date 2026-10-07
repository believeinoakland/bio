/* connections: DEC-149's sweep rows for this module (T35-29; `plan/draft-T35-dec149-l1-l7.md`, rows `index.mjs`:1198
   and :1296). Two sentences a member reads about an agenda item's membership in a file named the deployment ("the
   plane's inference"); where the name added nothing it is dropped: each now says "an inference from position". Each
   test pins its whole sentence, at the module's interface, and that the text says neither "the plane" nor "instance".
   Each test names the requirement ids it checks in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, MACHINE } from "./fixture.mjs";
import { membershipBeside } from "../../../src/extraction/filemembership.mjs";

const OLD_NAMES = /\bthe plane\b|\binstance\b/i;
const ITEM = "https://agendas.example.org/item/1", FILE = "https://agendas.example.org/file/1";
const SAYS = "an agenda item's membership in a file, derived from where the file is printed; the publisher linked "
           + "neither end to the other, so this is an inference from position, to be confirmed, never the publisher's own link";
const basisOf = (agenda) => `the file ${FILE} is printed under the agenda item ${ITEM} in the agenda ${agenda.slice(0, 12)}: `
                          + "containment, an inference from position, never the publisher's own link";

/* An agenda whose one item has one file printed under it (asserted.test's shape), both documents held. */
const VIEW = { systems: [{ origin: "sys", hosts: ["agendas.example.org"], links: { item: { re: "^/item/" }, file: { re: "^/file/" } } }] };
const at = (url, top) => ({ target: { url }, source: { page: 0, rect: [0, top - 10, 100, top] } });
async function stored(w) {
  const [ag] = w.doc("INFO-2026-0010-agenda", ["the agenda"]);
  const structure = { ok: true, links: [at(ITEM, 800), at(FILE, 700)] };
  w.structures[ag] = { ...structure, ...membershipBeside(structure, VIEW) };
  for (const [id, address] of [["INFO-2026-0011-item1", ITEM], ["INFO-2026-0012-file1", FILE]]) {
    const [c] = w.doc(id, [`bytes of ${id}`]);
    w.receipt(address, c);
  }
  assert.equal((await w.k.storeFileMembership({ captureSha: ag, viewer: MACHINE })).stored, 1);
  return ag;
}

test("R49 R55 R54 (DEC-149, index.mjs:1198): a stored containment's basis is exactly \"the file … is printed under the agenda item … in the agenda …: containment, an inference from position, never the publisher's own link\", never \"the plane's inference\"", async () => {
  const w = world();
  const ag = await stored(w);
  const [row] = w.k.fileMembership({ captureSha: ag, viewer: MACHINE }).stored;
  assert.equal(row.basis, basisOf(ag));
  assert.equal(w.k.asserted({ bundleId: "INFO-2026-0011-item1", viewer: MACHINE }).containment[0].basis, basisOf(ag),
               "the same sentence on the other read of it");
  assert.doesNotMatch(row.basis, OLD_NAMES);
});

test("R30 R56 (DEC-149, index.mjs:1296): fileMembership's says is exactly \"… so this is an inference from position, to be confirmed, never the publisher's own link\", stored or pending, never \"the plane's inference\"", async () => {
  const w = world();
  const ag = await stored(w);
  const m = w.k.fileMembership({ captureSha: ag, viewer: MACHINE });
  assert.equal(m.says, SAYS);
  assert.doesNotMatch(m.says, OLD_NAMES);
  /* A pair whose documents are not held: the same sentence. */
  const w2 = world();
  const [ag2] = w2.doc("INFO-2026-0010-agenda", ["the agenda"]);
  const structure = { ok: true, links: [at(ITEM, 800), at(FILE, 700)] };
  w2.structures[ag2] = { ...structure, ...membershipBeside(structure, VIEW) };
  assert.equal((await w2.k.storeFileMembership({ captureSha: ag2, viewer: MACHINE })).pending, 1);
  assert.equal(w2.k.fileMembership({ captureSha: ag2, viewer: MACHINE }).says, SAYS);
});
