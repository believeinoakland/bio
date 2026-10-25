/* screens-intake R15: the `archive` screen (DEC-167; N688's screen part) on the real served page: its reads, its rows by
 * state, the hold strip's acts, an archive refused whole, and its files opening open-file. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, text, main, btn, fill, press, ok, refused, rawKeys, word, hasWord, says, saysIn } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const SHA = "9".repeat(64);
const E = (i, state, more = {}) => ({ index: i, name_raw: "", name_encoding: "utf8", name_shared: false, path_unsafe: false, kind: "file",
                                      dos_time_stated: null, uncompressed: 2048, state, ...more });
const ENTRIES = [
  E(1, "filed", { name: "01_Agenda.pdf", sha256: "a".repeat(64), bundle: "INFO-2026-0011-agenda" }),
  E(2, "filed", { name: "02_Staff report.pdf", sha256: "b".repeat(64), bundle: "INFO-2026-0012-staff" }),
  E(3, "already_held", { name: "03_Resolution.pdf", sha256: "c".repeat(64) }),
  E(4, "folder", { name: "04_Attachments/", kind: "folder" }),
  E(5, "filed", { name: "04_Attachments/Exhibit A.pdf", sha256: "d".repeat(64), bundle: "INFO-2026-0013-exhibit" }),
  E(6, "not_filed", { name: "07_Closed session minutes.pdf", code: "MEMBER_ENCRYPTED", check: "C-139.5", translation: word("refusal.MEMBER_ENCRYPTED") }),
  E(7, "filed", { name: "../../etc/passwd", path_unsafe: true, sha256: "e".repeat(64), bundle: null }),
];
const ARCHIVE = { sha256: SHA, bundle: "INFO-2026-0010-packet", grade: { grade: "B", route: "direct", determined: true, basis: null },
                  bytes: 182 * 1048576, entries: 7, declared_total: 7, opened: true, refused: null };
const LIST = ok({ ok: true, archive: ARCHIVE, summary: { filed: 3, already_held: 1, not_filed: 1, folders: 1, waiting: 0 }, entries: ENTRIES, truncated: false });
const NOTE = ok({ ok: true, note: "Fetched by your team's Civicsmith from the city's own site." });
const at = (plane = {}) => open(`/app/archive/${SHA}`, { plane: { archivelist: LIST, gradenote: NOTE, ...plane } });
const pick = async (p, id) => p.click(main(p).querySelector(`#pick-archive-${id}`));

test("R15 reads archivelist and gradenote for the archive; a subject that is no digest reads nothing", async () => {
  const p = await at();
  assert.equal(p.byOp("archivelist")[0].query.archive, SHA);
  assert.equal(p.byOp("gradenote")[0].query.capture, SHA);
  const n = await open("/app/archive/nope");
  assert.equal(n.byOp("archivelist").length, 0);
  assert.ok(says(n, "shell.unavailable.nothing.title"), "R20: nothing is here");
  /* control: a refused list is drawn failed, never as an empty archive */
  const f = await at({ archivelist: refused("ARCHIVE_NOT_HELD", "This archive is not held.") });
  assert.ok(!says(f, "screen.archive.empty"));
});

test("R15 an archive that opened: its grade, summary, and each entry by state, every name as the archive states it", async () => {
  const p = await at();
  const t = text(p);
  assert.equal(main(p).querySelectorAll(".cs-grade")[0].textContent.endsWith("B"), true);
  assert.ok(t.includes([word("screen.archive.sum.filed", { count: 3 }), word("screen.archive.sum.held", { count: 1 }), word("screen.archive.sum.notfiled", { count: 1 }),
                          word("screen.archive.sum.folders", { count: 1 })].join(", ")), "each count as its own phrase (R17)");
  /* filed rows are picked by their document */
  for (const id of ["INFO-2026-0011-agenda", "INFO-2026-0012-staff", "INFO-2026-0013-exhibit"]) assert.ok(main(p).querySelector(`#pick-archive-${id}`), id);
  assert.ok(t.includes(word("screen.archive.filed")));
  /* already held names the capture it repeats, opening open-file */
  assert.ok(t.includes(word("screen.archive.sum.held", { count: 1 })));
  assert.ok(main(p).querySelector(`a.cs-ref[href="/app/open-file/${"c".repeat(64)}"]`));
  /* not filed: refused, with its reason */
  assert.ok(main(p).querySelector('[data-gap="refused"]'));
  assert.ok(t.includes(word("refusal.MEMBER_ENCRYPTED")), "the entry's reason, the owner's own words");
  /* a folder with its files */
  assert.ok(t.includes(word("screen.archive.folder", { count: 1 })));
  /* a name is drawn as data, never trusted: escaped text, and a filed entry the viewer may not see is not picked */
  assert.match(t, /\.\.\/\.\.\/etc\/passwd/);
  assert.ok(t.includes(word("screen.archive.filedunseen")));
  assert.equal(main(p).querySelectorAll('input[data-shell="pick"]').length, 3);
  assert.ok(t.includes(word("screen.archive.names")));
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
  assert.match(text(p), /Fetched by your team's Civicsmith from the city's own site\./);
  /* control: no note held is said */
  const q = await at({ gradenote: ok({ ok: true, note: null }) });
  await press(q, "gradenote");
  assert.ok(says(q, "screen.archive.nonote"));
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
  assert.ok(strip.querySelector('button[data-act="archivelist"]').textContent.includes(word("screen.archive.onlynotfiledact")));
  await press(p, "heldsetaside", { reason: "Not about the transfers." });
  assert.deepEqual(p.byOp("heldsetaside")[0].body, { ids: ["INFO-2026-0011-agenda", "INFO-2026-0013-exhibit"], reason: "Not about the transfers." });
  assert.ok(says(p, "screen.archive.setaside", { count: 2 }));
  await pick(p, "INFO-2026-0012-staff");
  await press(p, "archivelist");
  assert.equal(p.byOp("archivelist").find((r) => r.query.state).query.state, "not_filed");
  assert.ok(says(p, "screen.archive.onlynotfiled"));
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
  assert.ok(says(p, "screen.held.released", { count: 1 }));
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
  assert.ok(says(p, "screen.archive.refused.none"));
  assert.equal(main(p).querySelector('input[data-shell="pick"]'), null, "nothing to pick");
  assert.doesNotMatch(text(p), /a\.pdf/);
  assert.ok(btn(p, "archivelist").textContent.includes(word("screen.archive.see")));
  await press(p, "archivelist");
  assert.equal(p.byOp("archivelist").at(-1).query.state, undefined, "the whole listing, every entry with the refusal");
  assert.match(text(p), /a\.pdf/);
});

test("R15 an already held file names the file and the date of the earlier capture when the entry states it", async () => {
  const held = ENTRIES.map((e) => (e.state === "already_held" ? { ...e, held_at: "2026-09-30T12:00:00Z" } : e));
  const p = await at({ archivelist: ok({ ok: true, archive: ARCHIVE, summary: { filed: 3, already_held: 1, not_filed: 1, folders: 1, waiting: 0 }, entries: held }) });
  assert.ok(says(p, "screen.archive.alreadyheld", { name: "03_Resolution.pdf", date: word("date.daymonthyear", { day: "30", month: word("date.month.september"), year: "2026" }) }));
});

test("R17 R15 a zero count is not drawn: an archive that opened with only filed files draws only that count", async () => {
  const p = await at({ archivelist: ok({ ok: true, archive: ARCHIVE, summary: { filed: 3, already_held: 0, not_filed: 0, folders: 0, waiting: 0 }, entries: [ENTRIES[0]] }) });
  assert.ok(text(p).includes(`${word("screen.archive.sum.filed", { count: 3 })}.`));
  assert.ok(!text(p).includes(word("screen.archive.sum.held", { count: 0 })) && !text(p).includes(word("screen.archive.sum.folders", { count: 0 })));
});

test("R26 every key the archive screen reads is a word of the list, and its states draw word(key, vars)", async () => {
  for (const k of SCREENS.find((x) => x.id === "archive").words) assert.ok(hasWord(k), k);
  const p = await at();
  for (const [k, v] of [["screen.archive.files"], ["screen.archive.gradeabout", { grade: "B" }], ["screen.archive.facts", { short: "9999…9999" }]]) assert.ok(says(p, k, v), k);
});

/* ---- T50 (T50-30): R30 ---- */
const dayWord = (d, m, y) => word("date.daymonthyear", { day: String(d), month: word(`date.month.${m}`), year: String(y) });
const withHeld = (extra) => at({ archivelist: ok({ ok: true, archive: ARCHIVE, summary: { filed: 3, already_held: 1, not_filed: 1, folders: 1, waiting: 0 },
  entries: ENTRIES.map((e) => (e.state === "already_held" ? { ...e, ...extra } : e)) }) });

test("R30 an already held entry is drawn whole: the earlier capture's name and when it was captured, with both fills", async () => {
  const p = await withHeld({ held_at: "2026-09-30T12:00:00Z", held_name: "Resolution 2026-41 (earlier capture)" });
  assert.ok(says(p, "screen.archive.alreadyheld", { name: "Resolution 2026-41 (earlier capture)", date: dayWord(30, "september", 2026) }), "the earlier capture's own name");
  /* the entry's own name when no earlier name is stated */
  const q = await withHeld({ held_at: "2026-09-30T12:00:00Z" });
  assert.ok(says(q, "screen.archive.alreadyheld", { name: "03_Resolution.pdf", date: dayWord(30, "september", 2026) }));
});

test("R30 control: an entry stating neither draws no sentence with a blank, only the row's name and its state; one stating only a date draws none either", async () => {
  for (const extra of [{}, { held_at: null, held_name: null }, { held_at: "2026-09-30T12:00:00Z", name: "" }]) {
    const p = await withHeld(extra);
    const t = text(p);
    assert.ok(!t.includes(word("screen.archive.alreadyheld", { name: "x", date: "y" }).split("x")[0].trim()), JSON.stringify(extra));
    assert.ok(!/captured on\s*[;.]|the same file\s+captured/.test(t), `no blank fill: ${JSON.stringify(extra)}`);
    assert.ok(t.includes(word("screen.archive.sum.held", { count: 1 })), `its state is said: ${JSON.stringify(extra)}`);
    assert.ok(!t.includes("Captured directly"));
  }
  const p = await withHeld({});
  assert.ok(text(p).includes("03_Resolution.pdf"), "the row's name");
});
