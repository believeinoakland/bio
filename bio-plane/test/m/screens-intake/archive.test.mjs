/* screens-intake R15: the `archive` screen (DEC-167; N688's screen part) on the real served page: its reads, its rows by
 * state, the hold strip's acts, an archive refused whole, and its files opening open-file. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, text, main, btn, fill, press, ok, refused, rawKeys } from "./page.mjs";

const SHA = "9".repeat(64);
const E = (i, state, more = {}) => ({ index: i, name_raw: "", name_encoding: "utf8", name_shared: false, path_unsafe: false, kind: "file",
                                      dos_time_stated: null, uncompressed: 2048, state, ...more });
const ENTRIES = [
  E(1, "filed", { name: "01_Agenda.pdf", sha256: "a".repeat(64), bundle: "INFO-2026-0011-agenda" }),
  E(2, "filed", { name: "02_Staff report.pdf", sha256: "b".repeat(64), bundle: "INFO-2026-0012-staff" }),
  E(3, "already_held", { name: "03_Resolution.pdf", sha256: "c".repeat(64) }),
  E(4, "folder", { name: "04_Attachments/", kind: "folder" }),
  E(5, "filed", { name: "04_Attachments/Exhibit A.pdf", sha256: "d".repeat(64), bundle: "INFO-2026-0013-exhibit" }),
  E(6, "not_filed", { name: "07_Closed session minutes.pdf", code: "ZIP_ENCRYPTED", check: "C-1", translation: "The archive locks this file with a password." }),
  E(7, "filed", { name: "../../etc/passwd", path_unsafe: true, sha256: "e".repeat(64), bundle: null }),
];
const ARCHIVE = { sha256: SHA, bundle: "INFO-2026-0010-packet", grade: { grade: "B", route: "direct", determined: true, basis: null },
                  bytes: 182 * 1048576, entries: 7, declared_total: 7, opened: true, refused: null };
const LIST = ok({ ok: true, archive: ARCHIVE, summary: { filed: 3, already_held: 1, not_filed: 1, folders: 1, waiting: 0 }, entries: ENTRIES, truncated: false });
const NOTE = ok({ ok: true, note: "Fetched by your group's Civicsmith from the city's own site." });
const at = (plane = {}) => open(`/app/archive/${SHA}`, { plane: { archivelist: LIST, gradenote: NOTE, ...plane } });
const pick = async (p, id) => p.click(main(p).querySelector(`#pick-archive-${id}`));

test("R15 reads archivelist and gradenote for the archive; a subject that is no digest reads nothing", async () => {
  const p = await at();
  assert.equal(p.byOp("archivelist")[0].query.archive, SHA);
  assert.equal(p.byOp("gradenote")[0].query.capture, SHA);
  const n = await open("/app/archive/nope");
  assert.equal(n.byOp("archivelist").length, 0);
  assert.doesNotMatch(text(n), /Name an archive/);
  /* control: a refused list is drawn failed, never as an empty archive */
  const f = await at({ archivelist: refused("ARCHIVE_NOT_HELD", "This archive is not held.") });
  assert.doesNotMatch(text(f), /lists no files/);
});

test("R15 an archive that opened: its grade, summary, and each entry by state, every name as the archive states it", async () => {
  const p = await at();
  const t = text(p);
  assert.equal(main(p).querySelectorAll(".cs-grade")[0].textContent.endsWith("B"), true);
  assert.match(t, /3 files filed and held for review beside it, 1 already held, 1 not filed, 1 folders/);
  /* filed rows are picked by their document */
  for (const id of ["INFO-2026-0011-agenda", "INFO-2026-0012-staff", "INFO-2026-0013-exhibit"]) assert.ok(main(p).querySelector(`#pick-archive-${id}`), id);
  assert.match(t, /Filed · held for review beside the archive/);
  /* already held names the capture it repeats, opening open-file */
  assert.match(t, /Already held: the same file the record held before/);
  assert.ok(main(p).querySelector(`a.cs-ref[href="/app/open-file/${"c".repeat(64)}"]`));
  /* not filed: refused, with its reason */
  assert.ok(main(p).querySelector('[data-gap="refused"]'));
  assert.match(t, /The archive locks this file with a password\./);
  /* a folder with its files */
  assert.match(t, /A folder · its 1 files are listed with it/);
  /* a name is drawn as data, never trusted: escaped text, and a filed entry the viewer may not see is not picked */
  assert.match(t, /\.\.\/\.\.\/etc\/passwd/);
  assert.match(t, /Filed, in a place you may not see/);
  assert.equal(main(p).querySelectorAll('input[data-shell="pick"]').length, 3);
  assert.match(t, /Names, folders and dates are as the archive states them/);
  assert.deepEqual(rawKeys(p), []);
});

test("R15 a file of the archive opens open-file for its capture", async () => {
  const p = await at();
  for (const [name, sha] of [["01_Agenda.pdf", "a"], ["04_Attachments/Exhibit A.pdf", "d"]]) {
    const a = main(p).querySelector(`a.cs-ref[href="/app/open-file/${sha.repeat(64)}"]`);
    assert.equal(a.textContent, name);
  }
});

test("R15 gradenote draws the grade note beside the grade", async () => {
  const p = await at();
  assert.doesNotMatch(text(p), /from the city's own site/);
  await press(p, "gradenote");
  assert.match(text(p), /Fetched by your group's Civicsmith from the city's own site\./);
  /* control: no note held is said */
  const q = await at({ gradenote: ok({ ok: true, note: null }) });
  await press(q, "gradenote");
  assert.match(text(q), /No grade note is held/);
});

test("R15 the hold strip offers release, heldsetaside (one reason for all picked) and archivelist \"Show only those not filed\"", async () => {
  const p = await at({ heldsetaside: (req) => ok({ ok: true, ids: req.body.ids }),
    archivelist: (req) => (req.query.state === "not_filed"
      ? ok({ ok: true, archive: ARCHIVE, summary: {}, entries: [ENTRIES[5]], truncated: false }) : LIST) });
  assert.equal(btn(p, "release"), null, "no strip before a pick");
  await pick(p, "INFO-2026-0011-agenda");
  await pick(p, "INFO-2026-0013-exhibit");
  const strip = main(p).querySelector(".cs-hold");
  for (const op of ["release", "heldsetaside", "archivelist"]) assert.ok(strip.querySelector(`button[data-act="${op}"]`), op);
  assert.match(strip.querySelector('button[data-act="archivelist"]').textContent, /Show only those not filed/);
  await press(p, "heldsetaside", { reason: "Not about the transfers." });
  assert.deepEqual(p.byOp("heldsetaside")[0].body, { ids: ["INFO-2026-0011-agenda", "INFO-2026-0013-exhibit"], reason: "Not about the transfers." });
  assert.match(text(p), /Set aside: 2\./);
  await pick(p, "INFO-2026-0012-staff");
  await press(p, "archivelist");
  assert.equal(p.byOp("archivelist").find((r) => r.query.state).query.state, "not_filed");
  assert.match(text(p), /Showing only the files not filed\./);
  assert.doesNotMatch(text(p), /01_Agenda\.pdf/);
  assert.match(text(p), /07_Closed session minutes\.pdf/);
});

test("R15 release over the picked files: an enumerated selection, then the release with the member's acknowledgment and mitigation", async () => {
  const p = await at({ select: ok({ ok: true, handle: "SEL-9" }), release: ok({ ok: true, released: ["INFO-2026-0011-agenda"] }) });
  await pick(p, "INFO-2026-0011-agenda");
  fill(p, { "ch-ack": "Each copy is what the archive held.", "ch-mitigation": "Cut out with ordinary tools; same fingerprint." });
  await press(p, "release");
  assert.deepEqual(p.byOp("select")[0].body, { ids: ["INFO-2026-0011-agenda"] });
  assert.equal(p.byOp("release")[0].body.handle, "SEL-9");
  assert.match(text(p), /Vouched for: 1\./);
  /* control: nothing sent with the acknowledgment missing */
  const q = await at({ select: ok({ ok: true, handle: "SEL-9" }) });
  await pick(q, "INFO-2026-0011-agenda");
  fill(q, { "ch-ack": "", "ch-mitigation": "m" });
  await press(q, "release");
  assert.equal(q.byOp("select").length + q.byOp("release").length, 0);
});

test("R15 an archive refused whole: its refusal by its row's words, nothing filed, and archivelist to see what it lists", async () => {
  const REFUSED = { ...ARCHIVE, opened: false, refused: { code: "ARCHIVE_AMBIGUOUS", check: "C-2", translation: "Two of its entries claim the same bytes." } };
  const listed = [E(1, "not_filed", { name: "a.pdf", code: "ARCHIVE_AMBIGUOUS", translation: "Two of its entries claim the same bytes." })];
  const p = await at({ archivelist: ok({ ok: true, archive: REFUSED, summary: { filed: 0, already_held: 0, not_filed: 1, folders: 0, waiting: 0 }, entries: listed }) });
  assert.ok(main(p).querySelector('[data-gap="refused"]'));
  assert.match(text(p), /Two of its entries claim the same bytes\./);
  assert.match(text(p), /Nothing in it is filed\./);
  assert.equal(main(p).querySelector('input[data-shell="pick"]'), null, "nothing to pick");
  assert.doesNotMatch(text(p), /a\.pdf/);
  assert.match(btn(p, "archivelist").textContent, /See what it lists/);
  await press(p, "archivelist");
  assert.equal(p.byOp("archivelist").at(-1).query.state, undefined, "the whole listing, every entry with the refusal");
  assert.match(text(p), /a\.pdf/);
});
