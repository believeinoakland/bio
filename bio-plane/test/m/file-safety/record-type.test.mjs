/* file-safety R68, R69, R70 (T53; N1266, K5436; JOURNEYS R-28, R-64; K5471 (6)) and the partial scan's reason in plain words (DEC-454):
   a file the registry holds and names but does not list is safe-graded like any other; "Open the original" saves under the document's recorded
   name; a text note is drawn as text, whatever it holds, and a table only when its recorded type is CSV. At the module's interface, over the
   real record (provenance, acquisition's unpack) and the scripted scanner of `fixture.mjs`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { filedWorld as world, pdf, sha, enc } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const V = { viewer: "member:m1" };
const codes = (g) => g.reasons.map((r) => r.code);
const MAILBOX = new Uint8Array([0x21, 0x42, 0x44, 0x4e, 0, 0, 0, 0, 0x53, 0x4d, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

test("R68: a file the registry holds and names but does not list (a generated Outlook mailbox, a binary workbook) is filed whole, scanned, noted, held and graded like any other: high with format_unchecked, never low for want of a check; a hold on it gates its original; its safe view is NO_SAFE_VIEW", async () => {
  const w = world({ scan: { clamav: (s) => (s === sha(MAILBOX) ? { result: "found", findings: ["Test.Mailbox"] } : { result: "clean" }) } });
  const mail = await w.capture(MAILBOX);
  const xlsb = await w.capture(makeZip([{ name: "[Content_Types].xml", data: "<Types/>" }, { name: "xl/workbook.bin", data: "x" }]));
  const out = await w.fs.scanBatch({});
  assert.equal(out.scanned, 2, "both are scanned like a file of a listed type");
  for (const s of [mail, xlsb]) assert.ok(w.fs.verdictNotes({ captureSha: s }).notes.some((n) => n.kind === "scan"), "and noted");
  const g = await w.fs.threatOf({ captureSha: mail });
  assert.deepEqual([g.threat, codes(g).includes("format_unchecked")], ["high", true]);
  assert.deepEqual(g.registry, { format: "unlisted", named: "pst" });
  const x = await w.fs.threatOf({ captureSha: xlsb });
  assert.deepEqual([x.threat, codes(x)], ["high", ["source_not_fetched", "format_unchecked"].filter((c) => codes(x).includes(c))]);
  assert.ok(codes(x).includes("format_unchecked") && !codes(x).some((c) => c.startsWith("archive_")), "not read as an archive its container suggests");
  assert.deepEqual(x.registry, { format: "unlisted", named: "xlsb" });
  /* held like any other, and the hold gates the original */
  assert.ok(g.scan_hold, "a found note holds it");
  assert.equal((await w.fs.openOriginal({ captureSha: mail, ...V })).code, "SCAN_HOLD");
  assert.equal((await w.fs.safeView({ captureSha: mail, ...V })).code, "NO_SAFE_VIEW");
  /* fetched by this copy, it is still not low: there is no structure check to make it so */
  assert.equal(g.source.fetched, true);
  assert.ok(codes(g).includes("format_unchecked"));
  /* control: a listed type is graded as before: a plain archive by its members, a document by its structure */
  const zip = await w.capture(makeZip([{ name: "a.txt", data: "hello" }]));
  const gz = await w.fs.threatOf({ captureSha: zip });
  assert.equal(gz.registry, undefined);
  assert.ok(codes(gz).some((c) => c.startsWith("archive_")), "an archive is graded by the archive rule");
  const p = await w.capture(pdf(false, "listed"));
  const gp = await w.fs.threatOf({ captureSha: p });
  assert.deepEqual([gp.threat, gp.registry], ["low", undefined]);
});

test("R69: \"Open the original\" saves the file under the document's recorded name, sanitised as capture's get sanitises one; a document with no recorded name falls back to its digest with the right extension", async () => {
  const w = world();
  const memo = await w.capture(enc("the S2 crosswalk memo\n"), { name: "s2-crosswalk-memo.txt", type: "text/plain" });
  const r = await w.fs.openOriginal({ captureSha: memo, ...V });
  assert.ok(r instanceof Response, JSON.stringify(r));
  assert.equal(r.headers.get("content-disposition"), 'attachment; filename="s2-crosswalk-memo.txt"');
  assert.equal(r.headers.get("x-capture-sha256"), memo);
  assert.deepEqual(new Uint8Array(await r.arrayBuffer()), enc("the S2 crosswalk memo\n"), "the bytes are the original's");
  /* sanitised: a path and characters a download name does not keep */
  const odd = await w.capture(enc("odd name\n"), { name: "C:\\reports\\Q3 budget (final)?.txt" });
  assert.equal((await w.fs.openOriginal({ captureSha: odd, ...V })).headers.get("content-disposition"), 'attachment; filename="Q3 budget final.txt"');
  /* control: no recorded name: the digest with the extension the bytes call for */
  const bare = pdf(false, "nameless");
  const p = await w.capture(bare);
  assert.equal((await w.fs.openOriginal({ captureSha: p, ...V })).headers.get("content-disposition"), `attachment; filename="${p}.pdf"`);
  const t = await w.capture(enc("plain words with no recorded name\n"));
  assert.equal((await w.fs.openOriginal({ captureSha: t, ...V })).headers.get("content-disposition"), `attachment; filename="${t}.txt"`);
  const u = await w.capture(new Uint8Array([0, 1, 2, 3, 250, 251, 252, 0, 7, 8]));
  const bin = await w.fs.originalState({ captureSha: u, ...V });
  assert.ok(bin.ok);
  /* a name that sanitises to nothing is no name */
  const empty = await w.capture(enc("only symbols in the name\n"), { name: "???" });
  assert.equal((await w.fs.openOriginal({ captureSha: empty, ...V })).headers.get("content-disposition"), `attachment; filename="${empty}.txt"`);
});

test("R70: a text note is drawn as text whatever it holds, a member of an archive included, and as cells only when its recorded type is CSV: note.txt holding a,b,c inside a zip is kind text with a,b,c on one line, data.csv with the same bytes is cells; a CSV recorded as such is still data and a PDF is still rendered", async () => {
  const body = "a,b,c\n1,2,3\n";
  /* the archive's member, cut by acquisition's real unpack, is named by the archive's listing */
  for (const [name, kind] of [["note.txt", "text"], ["data.csv", "data"]]) {
    const w = world();
    const z = await w.capture(makeZip([{ name, data: body }]));
    w.home(z, "INFO-ZIP");
    const u = await w.acq.unpack({ core: w.record, provenance: w.prov }, { archiveSha: z, by: "m1", member: true });
    assert.equal(u.ok, true, JSON.stringify(u).slice(0, 200));
    w.homeAll();
    const a = await w.fs.safeView({ captureSha: sha(body), ...V });
    assert.equal(a.kind, kind, name);
    if (kind === "text") assert.deepEqual([a.text.split("\n")[0], a.text], ["a,b,c", body], "the note's own characters, a,b,c on one line");
    else assert.deepEqual(a.sheets[0].cells.slice(0, 3).map((c) => [c.ref, c.value]), [["A1", "a"], ["B1", "b"], ["C1", "c"]], "cells");
  }
  const w = world();
  /* a standalone note, by its recorded name or its recorded type */
  const note = await w.capture(enc("x,y,z\n4,5,6\n"), { name: "field-notes.txt", type: "text/plain" });
  assert.equal((await w.fs.safeView({ captureSha: note, ...V })).kind, "text");
  const bytes = enc("year,amount\n2025,310000\n");
  const typed = await w.capture(bytes, { type: "text/csv; charset=utf-8" });
  assert.equal((await w.fs.safeView({ captureSha: typed, ...V })).kind, "data", "recorded as CSV by type");
  const named = await w.capture(enc("year,amount\n2026,410000\n"), { name: "Budget.CSV" });
  assert.equal((await w.fs.safeView({ captureSha: named, ...V })).kind, "data", "recorded as CSV by name");
  /* a file with no record is a note: the commas in its bytes make it no table */
  const none = await w.capture(enc("year,amount\n2027,510000\n"));
  assert.equal((await w.fs.safeView({ captureSha: none, ...V })).kind, "text");
  /* a single-column CSV is a table when it says so */
  const one = await w.capture(enc("only\none\ntwo\n"), { name: "single.csv" });
  assert.equal((await w.fs.safeView({ captureSha: one, ...V })).kind, "data");
  /* the grade is the bytes' and does not read the record */
  assert.deepEqual((await w.fs.threatOf({ captureSha: none })).format, "csv", "the grade reads the bytes, whatever the record says");
  /* control: a PDF still renders */
  const p = await w.capture(pdf(false, "control-70"));
  assert.equal((await w.fs.safeView({ captureSha: p, ...V })).code, "SAFE_VIEW_PENDING");
  await w.fs.renderBatch({});
  assert.equal((await w.fs.safeView({ captureSha: p, ...V })).status, 200);
});

test("T53-111 (DEC-454; R54): the partial scan's reason is in plain words beside its code: a limit the scanner reached, or a kind of file it cannot open, each by key; a limit it does not know the general words; the code stays", async () => {
  const verdicts = new Map();
  const w = world({ scan: { clamav: (s) => verdicts.get(s) ?? { result: "clean" } } });
  const cases = [["LIMIT:MaxFileSize", "file-safety.index.unscannable_limit_filesize"], ["LIMIT:MaxScanSize", "file-safety.index.unscannable_limit_scansize"],
    ["LIMIT:MaxFiles", "file-safety.index.unscannable_limit_files"], ["LIMIT:MaxRecursion", "file-safety.index.unscannable_limit_recursion"],
    ["LIMIT:ScanTime", "file-safety.index.unscannable_limit_time"], ["LIMIT:ZipDirectory", "file-safety.index.unscannable_limit_directory"],
    ["LIMIT:Unspecified", "file-safety.index.unscannable_limit_other"], ["LIMIT:MaxEmbeddedPE", "file-safety.index.unscannable_limit_other"],
    ["UNOPENABLE:rar", "file-safety.index.unscannable_unopenable"]];
  const made = [];
  for (const [i, [detail]] of cases.entries()) {
    const s = await w.capture(pdf(false, `partial ${i}`));
    verdicts.set(s, { result: "unknown", detail });
    made.push(s);
  }
  await w.fs.scanBatch({});
  for (const [i, [detail, key]] of cases.entries()) {
    const g = await w.fs.threatOf({ captureSha: made[i] });
    const r = g.reasons.find((x) => x.code === "unscannable");
    assert.ok(r, detail);
    assert.deepEqual([r.limit, r.reason_key], [detail, key], detail);
    assert.equal(typeof r.reason_words, "string");
    assert.ok(r.reason_words.length > 20, detail);
    assert.ok(detail.startsWith("UNOPENABLE") || !r.reason_words.includes(detail.split(":")[1]), "a limit is named in words, not by its code");
    assert.equal(r.translation, word("file-safety.checks.the_file_scanner_could_not_read"), "the sentence the design wrote");
  }
  const rar = (await w.fs.threatOf({ captureSha: made.at(-1) })).reasons.find((x) => x.code === "unscannable");
  assert.ok(rar.reason_words.includes("RAR"), "the kind of file is named");
});
