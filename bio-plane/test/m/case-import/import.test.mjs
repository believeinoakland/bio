/* case-import: the import (R1), read-only by construction (R2), recreation recorded per finding (R3), append-only
   (R12), the purge (R13) and no place named (R15), at the module's interface. Every refusal is shown with its negative
   control: the same call with only that condition put right is accepted. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { rowOk, refusedThenAccepted, seeded, imp, caseFile, V, MACHINE, SOURCE, CASE, LENS, OTHER_LENS, F1, F2, F3, sha, bytes, zip, world }
  from "./fixture.mjs";
import { CASE_IMPORT_CHECKS, CASE_IMPORT_TABLES, PART_MAX, importIdOf, caseImportOps, caseImportOwns }
  from "../../../src/case-import/index.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";

const as = (w, file, by, viewer = by) => w.ci.importCaseFile({ parts: file.parts, by, viewer });

test("R1 a machine, an AI credential, an operator token or nobody is MACHINE_CANNOT_IMPORT, first", () => {
  const w = seeded();
  for (const who of [MACHINE, "class:daemon", "token:operator", "class:admin", "", "  ", null])
    refusedThenAccepted(w, () => as(w, caseFile(), who, V("alice")), () => imp(w, caseFile({ edition: 1 })), "MACHINE_CANNOT_IMPORT");
  /* first: before the membership and the file are asked */
  rowOk(as(w, { parts: ["not bytes"] }, MACHINE, V("carol")), "MACHINE_CANNOT_IMPORT");
});

test("R1 a viewer who is not an active member of this group is IMPORT_NOT_A_MEMBER, before the file is asked", () => {
  const w = seeded();
  for (const who of ["carol", "dave", "nobody"])
    refusedThenAccepted(w, () => as(w, caseFile(), V(who)), () => as(w, caseFile({ edition: 2 }), V("bob")), "IMPORT_NOT_A_MEMBER");
  rowOk(as(w, caseFile(), V("alice"), V("carol")), "IMPORT_NOT_A_MEMBER");
  rowOk(as(w, { parts: ["not bytes"] }, V("carol")), "IMPORT_NOT_A_MEMBER");
  /* an administrator is an active member */
  w.member("ann", { role: "admin" });
  assert.equal(as(w, caseFile({ edition: 3 }), V("ann")).ok, true);
});

test("R1 parts that are not a case file, or whose manifest fails the manifest check, are IMPORT_NOT_A_CASE_FILE, naming each departure", () => {
  const w = seeded();
  const good = () => imp(w, caseFile({ edition: 9 }));
  for (const parts of [null, [], ["@@not base64@@"], [{}], [bytes("plain text, not a zip")]]) {
    const r = refusedThenAccepted(w, () => w.ci.importCaseFile({ parts, by: V("alice"), viewer: V("alice") }), good, "IMPORT_NOT_A_CASE_FILE");
    assert.ok(Array.isArray(r.departures) && r.departures.length, "each departure is named");
  }
  /* no manifest at a part's root */
  const bare = zip([{ name: "case.md", bytes: bytes("x") }]);
  const r1 = refusedThenAccepted(w, () => w.ci.importCaseFile({ parts: [bare], by: V("alice"), viewer: V("alice") }),
                                 () => imp(w, caseFile({ edition: 10 })), "IMPORT_NOT_A_CASE_FILE");
  assert.match(r1.departures.join(" "), /manifest/);
  /* the manifest check's departures, each named */
  const r2 = refusedThenAccepted(w, () => imp(w, caseFile({ manifestExtra: { format: "bio-case-file/0", group: "" } })),
                                 () => imp(w, caseFile({ edition: 11 })), "IMPORT_NOT_A_CASE_FILE");
  assert.equal(r2.departures.length, 2);
  assert.ok(r2.departures.some((d) => /format/.test(d)) && r2.departures.some((d) => /group/.test(d)));
  /* a manifest that is not JSON */
  rowOk(w.ci.importCaseFile({ parts: [zip([{ name: "manifest.json", bytes: bytes("{not json") }])], by: V("alice"), viewer: V("alice") }),
        "IMPORT_NOT_A_CASE_FILE");
  /* a compressed entry is not a stored part */
  const z = zip([{ name: "manifest.json", bytes: bytes("{}") }]);
  const dv = new DataView(z.buffer); dv.setUint16(8, 8, true);
  const cd = z.length - 22 - 46 - "manifest.json".length; new DataView(z.buffer).setUint16(cd + 10, 8, true);
  rowOk(w.ci.importCaseFile({ parts: [z], by: V("alice"), viewer: V("alice") }), "IMPORT_NOT_A_CASE_FILE");
  /* the manifest check runs before the part bound */
  const big = new Uint8Array(PART_MAX + 1);
  rowOk(w.ci.importCaseFile({ parts: [big], by: V("alice"), viewer: V("alice") }), "IMPORT_NOT_A_CASE_FILE");
});

test("R1 a part over the part bound (64 MiB) is IMPORT_PART_TOO_LARGE, naming the part", () => {
  const w = seeded();
  const f = caseFile();
  /* the same ZIP, padded past the bound before its first entry: still a readable case file */
  const pad = PART_MAX + 1 - f.parts[0].length;
  const big = new Uint8Array(PART_MAX + 1);
  big.set(f.parts[0], pad);
  const v = new DataView(big.buffer);
  const end = big.length - 22;
  v.setUint32(end + 16, v.getUint32(end + 16, true) + pad, true);
  let p = v.getUint32(end + 16, true);
  for (let k = 0; k < v.getUint16(end + 10, true); k++) {
    v.setUint32(p + 42, v.getUint32(p + 42, true) + pad, true);
    p += 46 + v.getUint16(p + 28, true) + v.getUint16(p + 30, true) + v.getUint16(p + 32, true);
  }
  const r = refusedThenAccepted(w, () => w.ci.importCaseFile({ parts: [big], by: V("alice"), viewer: V("alice") }),
                                () => imp(w, f), "IMPORT_PART_TOO_LARGE");
  assert.equal(r.part, 0);
  assert.equal(r.bytes, PART_MAX + 1);
  assert.equal(r.bound, PART_MAX);
});

test("R1 the same edition with the same bytes answers existed: true and writes nothing; other bytes are IMPORT_EDITION_DIFFERS naming both hashes", () => {
  const w = seeded();
  const f = caseFile();
  const first = imp(w, f);
  assert.equal(first.ok, true);
  assert.equal(first.existed, false);
  const before = w.snapshot();
  const again = imp(w, f, "bob");
  assert.equal(again.ok, true);
  assert.equal(again.existed, true);
  assert.equal(again.import, first.import);
  assert.deepEqual(w.snapshot(), before, "a re-import writes nothing");
  /* a tampered edition: the same group, case, lens and edition, other bytes */
  const tampered = caseFile({ note: "a changed sentence" });
  const r = refusedThenAccepted(w, () => imp(w, tampered), () => imp(w, caseFile({ note: "a changed sentence", edition: 2 })),
                                "IMPORT_EDITION_DIFFERS");
  assert.equal(r.held, f.manifestSha);
  assert.equal(r.given, tampered.manifestSha);
  assert.notEqual(r.held, r.given);
  assert.equal(r.import, first.import);
  assert.equal(r.edition, 1);
});

test("R1 an import is one per source group, case and lens; its id is the SHA-256 of canonical {group, case, lens}; editions sit side by side", () => {
  const w = seeded();
  const a = imp(w, caseFile({ edition: 1 }));
  const b = imp(w, caseFile({ edition: 2 }));
  const c = imp(w, caseFile({ lens: OTHER_LENS }));
  const d = imp(w, caseFile({ group: "third-group" }));
  const e = imp(w, caseFile({ case: "CASE-2026-0202" }));
  const n = imp(w, caseFile({ lens: null, case: "CASE-2026-0303" }));
  assert.equal(a.import, b.import, "a later edition lands in the same import");
  assert.equal(a.import, importIdOf({ group: SOURCE, case: CASE, lens: LENS }));
  assert.equal(a.import, sha(canonicalJson({ group: SOURCE, case: CASE, lens: LENS })));
  assert.equal(c.import, sha(canonicalJson({ group: SOURCE, case: CASE, lens: OTHER_LENS })));
  assert.equal(n.import, sha(canonicalJson({ group: SOURCE, case: "CASE-2026-0303", lens: null })));
  assert.equal(new Set([a.import, c.import, d.import, e.import, n.import]).size, 5);
  assert.equal(w.count("case_imports"), 5);
  const list = w.ci.importedCases({ viewer: V("bob") });
  assert.deepEqual(list.imports.find((i) => i.import === a.import).editions.map((x) => x.edition), [1, 2], "side by side");
});

test("R1 the act records the edition with its source group, case, edition, lens, by and instant, and stores every file by its SHA-256", () => {
  const w = seeded();
  const doc = { name: "letter.pdf", bytes: bytes("%PDF the letter") };
  const f = caseFile({ documents: [doc], split: true });
  w.clock.now = Date.parse("2026-10-03T13:14:15Z");
  const r = imp(w, f, "bob");
  assert.equal(r.ok, true);
  assert.deepEqual({ group: r.group, case: r.case, edition: r.edition, lens: r.lens, by: r.imported_by, at: r.imported_at },
                   { group: SOURCE, case: CASE, edition: 1, lens: LENS, by: "bob", at: "2026-10-03T13:14:15Z" });
  for (const file of f.files) {
    const held = w.ci.fileOf({ import: r.import, edition: 1, path: file.path });
    assert.ok(held, `${file.path} is held`);
    assert.equal(held.sha, sha(file.bytes));
    assert.deepEqual([...held.bytes], [...file.bytes]);
    assert.equal(held.kind, file.kind);
  }
  /* held by SHA-256: each file's row names its digest */
  const shas = new Set(w.rows(`SELECT sha FROM case_import_files`).map((x) => x.sha));
  for (const file of f.files) assert.ok(shas.has(sha(file.bytes)));
  assert.equal(w.ci.fileOf({ import: r.import, edition: 1, path: "nowhere" }), null);
});

test("R1 R3 the act runs checkCaseFile and records each finding's result: what is missing, what differs, the recomputed pair, the checker's versions", () => {
  const w = seeded();
  const fp = "c3".repeat(32);
  w.script.set(F1, { role: "load_bearing", result: "recreated", pair: { capture: "B", connection: "C" } });
  w.script.set(F2, { role: "supporting", result: "recreated_in_part", missing: [{ sha: fp, words: "fetch the letter" }],
                     pair: { capture: { state: "undetermined" }, connection: "D" } });
  w.script.set(F3, { role: "load_bearing", result: "did_not_recreate", differs: [{ axis: "capture", recorded: "A", recomputed: "C" }],
                     pair: { capture: "C", connection: "C" } });
  const r = imp(w);
  assert.equal(w.checker.calls.length, 1);
  assert.deepEqual(r.recreation.checker, { grading_versions: ["g1"], checks_version: "1.55.0" });
  const byId = Object.fromEntries(r.recreation.findings.map((x) => [x.finding, x]));
  assert.deepEqual(byId[F1], { finding: F1, role: "load_bearing", result: "recreated", missing: [], differs: [],
                               pair: { capture: "B", connection: "C" } });
  assert.deepEqual(byId[F2], { finding: F2, role: "supporting", result: "recreated_in_part", missing: [{ sha: fp, words: "fetch the letter" }],
                               differs: [], pair: { capture: { state: "undetermined" }, connection: "D" } });
  assert.deepEqual(byId[F3].differs, [{ axis: "capture", recorded: "A", recomputed: "C" }]);
  assert.equal(byId[F3].result, "did_not_recreate");
  /* recorded: the read answers the same, without running the checker again */
  const read = w.ci.importedCase({ import: r.import, viewer: V("bob") });
  assert.equal(w.checker.calls.length, 1, "a read never recomputes (R3: only R5 does)");
  assert.deepEqual(read.edition.checker, r.recreation.checker);
  assert.deepEqual(read.edition.findings.map(({ finding, result, missing, differs, pair }) => ({ finding, result, missing, differs, pair })),
                   r.recreation.findings.map(({ finding, result, missing, differs, pair }) => ({ finding, result, missing, differs, pair })));
});

test("R3 recreation is recomputed only by completion (R5): accepting, withdrawing, flagging, clearing and reading run no check", () => {
  const w = seeded();
  const r = imp(w);
  const n = w.checker.calls.length;
  const acc = w.ci.acceptImported({ import: r.import, edition: 1, findings: [F1], checked: "the chain", reason: "it holds", by: V("alice"), viewer: V("alice") });
  assert.equal(acc.ok, true);
  assert.equal(w.ci.withdrawAcceptance({ import: r.import, edition: 1, reason: "second thoughts", by: V("alice"), viewer: V("alice") }).ok, true);
  const fl = w.ci.flagImported({ import: r.import, edition: 1, issue: "a date looks wrong", by: V("bob"), viewer: V("bob") });
  assert.equal(w.ci.clearFlag({ flag: fl.flag, reason: "checked: it is right", by: V("bob"), viewer: V("bob") }).ok, true);
  w.ci.importedCases({ viewer: V("bob") });
  w.ci.importedCase({ import: r.import, viewer: V("bob") });
  w.ci.acceptanceOf({ import: r.import, edition: 1, finding: F1 });
  w.ci.openFlagsOn({ import: r.import, edition: 1 });
  assert.equal(w.checker.calls.length, n);
  assert.equal(w.count("case_import_checks"), 1);
});

test("R3 a checker that throws or is absent records each finding as unknown, never as recreated", () => {
  const w = seeded();
  w.checker.throws = true;
  const r = imp(w);
  assert.equal(r.ok, true);
  assert.deepEqual(r.recreation.findings, []);
  assert.match(r.recreation.unread, /failed/);
});

test("R2 nothing an import holds is a record bundle, and this module offers no act that changes an imported file", () => {
  const w = seeded();
  const bundles = w.count("bundles"), manifest = w.count("manifest");
  const f = caseFile({ documents: [{ name: "a.pdf", bytes: bytes("%PDF a") }] });
  const r = imp(w, f);
  assert.equal(w.count("bundles"), bundles, "no bundle");
  assert.equal(w.count("manifest"), manifest, "no promotion");
  /* the ops: the import, two reads, the completion, and R6–R8's four acts; none edits, promotes, ratifies or publishes */
  const ops = Object.keys(caseImportOps(w.ci, new URL("https://x/"), {})).sort();
  assert.deepEqual(ops, ["caseimport", "caseimportdocument", "importaccept", "importacceptwithdraw", "importedcase",
                         "importedcases", "importflag", "importflagclear"]);
  /* every later act leaves the imported files and the edition as they were */
  const filesBefore = JSON.stringify(w.rows(`SELECT * FROM case_import_files ORDER BY path`));
  const editionBefore = JSON.stringify(w.rows(`SELECT * FROM case_import_editions`));
  w.ci.acceptImported({ import: r.import, edition: 1, findings: [F1], checked: "c", reason: "r", by: V("alice"), viewer: V("alice") });
  w.ci.flagImported({ import: r.import, edition: 1, issue: "i", by: V("alice"), viewer: V("alice") });
  w.ci.withdrawAcceptance({ import: r.import, edition: 1, reason: "r", by: V("alice"), viewer: V("alice") });
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM case_import_files ORDER BY path`)), filesBefore);
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM case_import_editions`)), editionBefore);
  for (const file of f.files) assert.deepEqual([...w.ci.fileOf({ import: r.import, edition: 1, path: file.path }).bytes], [...file.bytes]);
});

test("R12 every act is append-only: no row an act wrote is later edited or deleted", () => {
  const w = seeded();
  const fp = sha(bytes("%PDF the fetched letter"));
  w.script.set(F2, { role: "supporting", result: "recreated_in_part", missing: [{ sha: fp }], pair: null });
  const r = imp(w);
  const seen = [];
  const check = () => {
    const now = w.snapshot("case_import");
    for (const s of seen) for (const [t, rows] of Object.entries(s)) {
      const after = JSON.parse(now[t]);
      for (const row of JSON.parse(rows)) assert.ok(after.some((x) => JSON.stringify(x) === JSON.stringify(row)), `${t}: a row stayed`);
    }
    seen.push(now);
  };
  check();
  const a = w.ci.acceptImported({ import: r.import, edition: 1, findings: [F1], checked: "c", reason: "r", by: V("alice"), viewer: V("alice") });
  assert.equal(a.ok, true); check();
  assert.equal(w.ci.withdrawAcceptance({ import: r.import, edition: 1, reason: "r", by: V("alice"), viewer: V("alice") }).ok, true); check();
  const fl = w.ci.flagImported({ import: r.import, edition: 1, finding: F1, issue: "i", by: V("alice"), viewer: V("alice") });
  assert.equal(fl.ok, true); check();
  assert.equal(w.ci.clearFlag({ flag: fl.flag, reason: "r", by: V("alice"), viewer: V("alice") }).ok, true); check();
  assert.equal(w.ci.completeImportedDocument({ import: r.import, edition: 1, bytes: bytes("%PDF the fetched letter"), by: V("bob"), viewer: V("bob") }).ok, true);
  check();
  assert.equal(imp(w, caseFile({ edition: 2 })).ok, true); check();
  assert.equal(w.count("case_import_acceptances"), 1);
  assert.equal(w.count("case_import_withdrawals"), 1);
  assert.equal(w.count("case_import_flags"), 1);
  assert.equal(w.count("case_import_clears"), 1);
  assert.equal(w.count("case_import_checks"), 3);
});

test("R13 the tables are declared to record-core's purge as the import's own record; the whole-store purge clears them and the bytes", () => {
  const w = seeded({ minimal: true });
  for (const t of CASE_IMPORT_TABLES) assert.ok(caseImportOwns(t), t);
  assert.equal(caseImportOwns("bundles"), false);
  const r = imp(w, caseFile({ documents: [{ name: "a.pdf", bytes: bytes("%PDF a") }] }));
  w.ci.flagImported({ import: r.import, edition: 1, issue: "i", by: V("alice"), viewer: V("alice") });
  /* a bundle's purge leaves an import standing: it is no bundle */
  const before = w.snapshot("case_import");
  w.record.purge({ bundleId: "INQ-2026-0001-transfers" });
  assert.deepEqual(w.snapshot("case_import"), before);
  const report = w.record.purge({});
  for (const t of CASE_IMPORT_TABLES) {
    assert.equal(w.count(t), 0, `${t} cleared`);
    assert.ok(t in report.removed, `${t} named in the purge's report`);
  }
  assert.equal(w.ci.fileOf({ import: r.import, edition: 1, path: "case.md" }), null, "the stored bytes are purged with the import");
  assert.equal(w.ci.importedCases({ viewer: V("alice") }).count, 0);
});

test("R15 no place is named in this module's behaviour or outward text", () => {
  const dir = fileURLToPath(new URL("../../../src/case-import/", import.meta.url));
  const places = /\b(oakland|alameda|california|berkeley|san francisco|sacramento|bay area)\b/i;
  for (const f of readdirSync(dir)) assert.doesNotMatch(readFileSync(dir + f, "utf8"), places, f);
  for (const row of Object.values(CASE_IMPORT_CHECKS)) assert.doesNotMatch(row.translation, places);
  const w = seeded();
  const r = imp(w);
  assert.doesNotMatch(JSON.stringify(w.ci.importedCase({ import: r.import, viewer: V("alice") })), places);
});

test("R1 bytes arrive as base64 text through the op, with by and viewer the control plane's stamps, never the body's", () => {
  const w = seeded();
  const f = caseFile();
  const b64 = f.parts.map((p) => Buffer.from(p).toString("base64"));
  const url = new URL("https://x/?op=caseimport&by=member:alice&viewer=member:alice");
  const r = caseImportOps(w.ci, url, { parts: b64, by: "member:carol", viewer: "member:carol" }).caseimport();
  assert.equal(r.ok, true);
  assert.equal(r.imported_by, "alice");
  const machine = caseImportOps(w.ci, new URL("https://x/?by=class:ai&viewer=class:ai"), { parts: b64, by: "member:alice" }).caseimport();
  rowOk(machine, "MACHINE_CANNOT_IMPORT");
});

test("R1 an empty world: the module creates its tables and registers with accepted-work at start", () => {
  const w = world();
  for (const t of CASE_IMPORT_TABLES) assert.equal(w.count(t), 0);
  assert.equal(w.ci.registration.ok, true);
});
