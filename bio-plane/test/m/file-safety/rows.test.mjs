/* file-safety R22–R26, R38: the invariants (a capture untouched by every act; nothing but the store, a target, a tool spec
   and a counts record reaches the scanner; every refusal and reason in this module's table; its tables declared to
   purge; no place named) and R38's table of finding kinds. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { world, pdf, sha, enc } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import * as FS from "../../../src/file-safety/index.mjs";
import * as CHECKS from "../../../src/file-safety/checks.mjs";

const { FILE_SAFETY_CHECKS, THREAT_REASONS, PROVIDER_REASON_WORDS, FINDING_KINDS, NO_PLAIN_DESCRIPTION, findingKind } = FS;
const SRC = new URL("../../../src/file-safety/", import.meta.url);
const WARNED = { own_device: true, no_macros: true };

test("R22: the capture's bytes, digest, register entry, grade, promotion state and provenance document are byte-identical before and after scan, hold, release, render, safe copy, reputation note and deeper check", async () => {
  const w = world({ scan: { clamav: () => ({ result: "found", findings: ["Pdf.Exploit.I"] }), copyScan: () => ({ result: "clean" }) } });
  const text = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R/OpenAction<</S/JavaScript/JS(1)>>>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF";
  w.promoted("INFO-2026-0002-doc", text);
  const s = await w.capture(text, { reputation: { tool: "rep", listed: true, categories: ["malware"], checked_at: "2026-10-08T11:00:00Z" } });
  const facts = () => JSON.stringify({ bytes: [...w.bucket.held.get(`bio/captures/${s}`)], register: w.rows("SELECT * FROM register"), grade: w.prov.captureGrade(s),
    bundles: w.rows("SELECT * FROM bundles"), files: w.rows("SELECT * FROM files"), history: w.rows("SELECT * FROM history"), manifest: w.rows("SELECT * FROM manifest"),
    receipts: w.rows("SELECT * FROM captured_locators") });
  const before = facts();
  assert.equal(sha(w.bucket.held.get(`bio/captures/${s}`)), s);
  await w.tool("scanii");
  await w.tool("glasswall-halo", { config: { host: "halo.example.org" } });
  await w.fs.scanBatch({});
  await w.fs.renderBatch({});
  w.fs.requestDeeperCheck({ captureSha: s, viewer: "member:m1" });
  await w.fs.deeperBatch({});
  await w.fs.requestSafeCopy({ captureSha: s, viewer: "member:m1" });
  await w.fs.safeView({ captureSha: s, viewer: "member:m1" });
  await w.fs.safeCopy({ captureSha: s, viewer: "member:m1" });
  w.fs.releaseScanHold({ captureSha: s, by: "m1", reason: "a" });
  w.fs.releaseScanHold({ captureSha: s, by: "m2", reason: "b" });
  await w.fs.openOriginal({ captureSha: s, viewer: "member:m1", warned: WARNED });
  assert.ok(w.rows("SELECT * FROM fs_notes").length >= 4 && w.rows("SELECT * FROM fs_holds").length === 1);
  assert.equal(facts(), before);
  assert.equal(sha(w.bucket.held.get(`bio/captures/${s}`)), s);
});

test("R23: no member identity, file name, address or record text reaches file-scanner in any request from this module: only the store, the target, a tool spec and a counts record", async () => {
  const w = world({ scan: { clamav: () => ({ result: "found", findings: ["X.Y.Z"] }), copyScan: () => ({ result: "clean" }) } });
  const address = "https://secret-host.example/minutes-of-the-closed-session.pdf";
  const s = await w.capture(pdf(true, "secret words of the record"), { address });
  const z = makeZip([{ name: "budget-confidential.txt", data: "member names inside" }]);
  const zs = await w.capture(z, { address: "https://secret-host.example/pack.zip" });
  await w.acq.unpack({ core: w.record, provenance: w.prov }, { archiveSha: zs, by: "m1", member: true });
  await w.tool("scanii"); await w.tool("joe-sandbox"); await w.tool("glasswall-halo", { config: { host: "halo.example.org" } });
  await w.tool("splunk-hec", { config: { host: "splunk.example.org" } });
  await w.tool("metadefender-core", { use: "routine", config: { host: "md.example.org" } });
  await w.fs.scanBatch({}); await w.fs.renderBatch({});
  w.fs.requestDeeperCheck({ captureSha: s, viewer: "member:m1" });
  await w.fs.deeperBatch({}); w.tick(61_000); await w.fs.deeperBatch({});
  await w.fs.requestSafeCopy({ captureSha: s, viewer: "member:m2" });
  await w.fs.openOriginal({ captureSha: s, viewer: "member:m1", warned: WARNED });
  await w.fs.scanStatus({ viewer: "member:boss" });
  await w.fs.forwardSecurityCounts({ from: "2026-01-01T00:00:00Z", to: "2027-01-01T00:00:00Z" });
  await w.tool("google-web-risk", { credentials: { api_key: "k" } });
  await w.fs.refreshReputationLists({});
  const calls = w.scanner.calls.filter((c) => c.path !== "/provider/test");
  assert.ok(calls.length >= 10);
  const ALLOWED = { "/scan": ["store", "targets"], "/render": ["store", "target", "route"], "/provider/scan": ["store", "target", "tool"],
                    "/provider/sandbox": ["store", "target", "tool"], "/provider/sandbox/result": ["tool", "vendor_ref", "submitted_at"],
                    "/provider/cdr": ["store", "target", "tool"], "/provider/forward": ["tool", "record"], "/provider/refresh": ["tool"], "/version": null };
  for (const c of calls) {
    assert.ok(c.path in ALLOWED, c.path);
    if (ALLOWED[c.path]) for (const k of Object.keys(c.body)) assert.ok(ALLOWED[c.path].includes(k), `${c.path}: ${k}`);
    if (c.body && c.body.tool) assert.deepEqual(Object.keys(c.body.tool).filter((k) => !["provider_id", "tool_id", "region", "host", "config", "credentials", "handling_confirmed", "monthly_limit_left"].includes(k)), [], "a tool spec only");
    if (c.body && c.body.target) assert.deepEqual(Object.keys(c.body.target).sort(), ["capture_sha", "parts"]);
    /* a safe copy's target names the derived area it is read from (R33, file-scanner R2) */
    if (c.body && c.body.targets) for (const t of c.body.targets) assert.ok(["capture_sha,parts", "area,capture_sha,parts"].includes(Object.keys(t).sort().join()), Object.keys(t).join());
  }
  const all = JSON.stringify(calls);
  for (const leak of ["m1", "m2", "boss", "secret-host", "closed-session", "budget-confidential", "secret words", "member names"])
    assert.doesNotMatch(all, new RegExp(leak), leak);
  /* negative control: the requests are read, and the digest is in them */
  assert.match(all, new RegExp(s));
});

test("R24: every refusal and every R6 reason is named in this module's own table with its translation: the rows C-140.1 onward, each frozen with its check, a where naming its site (its region found there) and member words; every code a service of this module answers is one of them or another module's own (membership's, credentials'); file-scanner's descriptor refusals each have a row; every R6 reason and every active kind the readers name has words", () => {
  const rows = Object.entries(FILE_SAFETY_CHECKS);
  assert.ok(Object.isFrozen(FILE_SAFETY_CHECKS));
  assert.deepEqual(rows.map(([, r]) => r.check), rows.map((_, i) => `C-140.${i + 1}`), "consecutive, each once");
  const src = readFileSync(new URL("index.mjs", SRC), "utf8");
  for (const [code, r] of rows) {
    assert.ok(Object.isFrozen(r), code);
    assert.ok(typeof r.translation === "string" && r.translation.length > 30, code);
    assert.doesNotMatch(r.translation, /this instance|this copy|the plane\b|the instance/i, `${code}: DEC-149's voice`);
    const [where, region] = r.where.split(" > ");
    const [file, fn] = where.split(" ");
    assert.equal(file, "src/file-safety/index.mjs", code);
    assert.ok(src.includes(`DEC-49 REGION ${region}`) && src.includes(`END DEC-49 REGION ${region}`), `${code}: ${region}`);
    assert.ok(new RegExp(`\\s(async )?${fn.replace("#", "#")}\\(`).test(src), `${code}: ${fn}`);
  }
  /* every code the source answers by `refusal(` is a row */
  for (const m of src.matchAll(/refusal\("([A-Z_]+)"/g)) assert.ok(FILE_SAFETY_CHECKS[m[1]], m[1]);
  for (const code of ["DESCRIPTOR_MALFORMED", "PROVIDER_SHARES_SAMPLES", "HANDLING_NOT_STATED", "NEVER_SENDS_INCOMPLETE", "ADDRESS_WOULD_LEAVE", "PRIVATE_MODE_UNVERIFIABLE"])
    assert.ok(FILE_SAFETY_CHECKS[code], code);
  /* the reasons */
  for (const code of ["source_not_fetched", "unread", "encrypted", "format_unchecked", "scan_hold", "bad_reputation", "archive_not_opened", "archive_refused",
                      "archive_waiting", "archive_entry_not_filed", "archive_link", "archive_member_high", "archive_cycle"])
    assert.ok(THREAT_REASONS[code] && THREAT_REASONS[code].translation.length > 10, code);
  for (const kind of ["open-action", "additional-actions", "javascript", "xfa", "rich-media", "launch", "embedded-file", "vba-project", "activex", "ole-object",
                      "external-target", "xl4-macrosheet", "odf-basic", "odf-script"])
    assert.ok(THREAT_REASONS[`active:${kind}`], kind);
  for (const r of Object.values(THREAT_REASONS)) assert.doesNotMatch(r.translation, /\d/);
  for (const w of Object.values(PROVIDER_REASON_WORDS)) assert.ok(w.length > 10);
  /* the table is the module's one, the same objects its index answers */
  assert.equal(CHECKS.FILE_SAFETY_CHECKS, FILE_SAFETY_CHECKS);
});

test("R25: its tables are declared to record-core's purge: a bundle's purge removes that bundle's notes, holds, safe views and safe copies (and its deeper checks), and no other's; the tools, their events and the counts are the group's and stay", async () => {
  const w = world({ scan: { clamav: () => ({ result: "found", findings: ["X.Y.Z"] }), copyScan: () => ({ result: "clean" }) } });
  const declared = w.record.declaredTables().filter((d) => d.module === "file-safety");
  assert.deepEqual(declared.map((d) => [d.name, d.purge]), [["fs_files", "clear"], ["fs_notes", "clear"], ["fs_holds", "clear"], ["fs_deeper", "clear"], ["fs_copies", "clear"],
    ["fs_tools", "exempt"], ["fs_tool_usage", "exempt"], ["fs_tool_events", "exempt"], ["fs_counts", "exempt"], ["fs_wakes", "exempt"]]);
  await w.tool("scanii"); await w.tool("glasswall-halo", { config: { host: "halo.example.org" } });
  const a = await w.capture(pdf(true, "a")), b = await w.capture(pdf(true, "b"));
  w.home(a, "INFO-A"); w.home(b, "INFO-B");
  await w.fs.scanBatch({}); await w.fs.renderBatch({});
  for (const s of [a, b]) { w.fs.requestDeeperCheck({ captureSha: s, viewer: "member:m1" }); await w.fs.requestSafeCopy({ captureSha: s, viewer: "member:m1" }); }
  await w.fs.deeperBatch({});
  const count = (t, s) => w.row(`SELECT COUNT(*) AS n FROM ${t} WHERE capture_sha = ?`, s).n;
  for (const t of ["fs_files", "fs_notes", "fs_holds", "fs_deeper", "fs_copies"]) assert.ok(count(t, a) > 0 && count(t, b) > 0, t);
  const kept = JSON.stringify([w.rows("SELECT * FROM fs_tools"), w.rows("SELECT * FROM fs_tool_events"), w.rows("SELECT * FROM fs_counts"), w.rows("SELECT * FROM fs_wakes")]);
  assert.ok(w.rows("SELECT * FROM fs_wakes").length > 0, "the wakes' instants are kept");
  const r = w.record.purge({ bundleId: "INFO-A" });
  assert.equal(r.ok, true);
  for (const t of ["fs_files", "fs_notes", "fs_holds", "fs_deeper", "fs_copies"]) {
    assert.equal(count(t, a), 0, `${t}: A's rows gone`);
    assert.ok(count(t, b) > 0, `${t}: B's kept`);
    assert.ok(r.removed[t] > 0, t);
  }
  assert.equal(JSON.stringify([w.rows("SELECT * FROM fs_tools"), w.rows("SELECT * FROM fs_tool_events"), w.rows("SELECT * FROM fs_counts"), w.rows("SELECT * FROM fs_wakes")]), kept);
  /* the whole store */
  w.record.purge({});
  for (const t of ["fs_files", "fs_notes", "fs_holds", "fs_deeper", "fs_copies"]) assert.equal(w.row(`SELECT COUNT(*) AS n FROM ${t}`).n, 0, t);
  assert.ok(w.rows("SELECT * FROM fs_tools").length === 2);
});

test("R26: no place is named in its behaviour or outward text: its source, every row, reason and finding kind it holds, and the answers its services build", async () => {
  const PLACES = /\b(oakland|alameda|berkeley|california|san francisco|bay area|emeryville|contra costa)\b/i;
  const files = readdirSync(SRC).filter((f) => f.endsWith(".mjs")).sort();
  assert.deepEqual(files, ["checks.mjs", "formats.mjs", "index.mjs", "kinds.mjs", "schema.mjs"]);
  for (const f of files) assert.doesNotMatch(readFileSync(new URL(f, SRC), "utf8"), PLACES, f);
  for (const t of [FILE_SAFETY_CHECKS, THREAT_REASONS, PROVIDER_REASON_WORDS, FINDING_KINDS]) assert.doesNotMatch(JSON.stringify(t), PLACES);
  const w = world();
  const s = await w.capture(pdf(true, "p"));
  const answers = [await w.fs.threatOf({ captureSha: s }), await w.fs.originalState({ captureSha: s }), await w.fs.openOriginal({ captureSha: s }),
                   w.fs.securityToolCatalogue({ viewer: "member:boss" }), await w.fs.scanStatus({ viewer: "member:boss" })];
  for (const a of answers) assert.doesNotMatch(JSON.stringify(a), PLACES);
  assert.match("Oakland", PLACES, "negative control");
});

test("R38: `findingKind(name)` answers {file_kind, threat_kind, variant, words}: the name's parts as the scanner's naming gives them, each null when not given; words from this module's one table of finding kinds, a row for each kind DEC-169 names, each saying what that kind does and that scanners report resemblance, not certainty; exactly \"Civicsmith has no plain description of this name\" when no row matches; it depends on the name alone, matched without regard to case, and never throws", () => {
  assert.deepEqual(findingKind("Xls.Downloader.Agent-917"), { file_kind: "Xls", threat_kind: "Downloader", variant: "Agent-917", words: FINDING_KINDS.find((k) => k.kind === "downloader").words });
  for (const kind of ["downloader", "dropper", "trojan", "macro", "exploit", "phishing", "potentially_unwanted", "heuristic"]) {
    const row = FINDING_KINDS.find((k) => k.kind === kind);
    assert.ok(row, kind);
    assert.match(row.words, /Scanners report what a file resembles, not a certainty\.$/, kind);
  }
  const words = (n) => findingKind(n).words;
  const of = (kind) => FINDING_KINDS.find((k) => k.kind === kind).words;
  assert.equal(words("Doc.Dropper.Agent-1"), of("dropper"));
  assert.equal(words("Win.Trojan.Agent-12345"), of("trojan"));
  assert.equal(words("Doc.Macro.Obfuscated-1"), of("macro"));
  assert.equal(words("Pdf.Exploit.CVE_2010_0188-1"), of("exploit"));
  assert.equal(words("Html.Phishing.Bank-1"), of("phishing"));
  assert.deepEqual(findingKind("PUA.Win.Adware.Agent-1"), { file_kind: "Win", threat_kind: "PUA", variant: "Adware.Agent-1", words: of("potentially_unwanted") });
  assert.deepEqual(findingKind("Heuristics.OLE2.ContainsMacros"), { file_kind: "OLE2", threat_kind: "Heuristics", variant: "ContainsMacros", words: of("heuristic") });
  assert.equal(words("Win.Suspicious.Packed-2"), of("heuristic"), "suspicious is the heuristic row");
  assert.deepEqual(findingKind("Trojan:Win32/Emotet.A!ml"), { file_kind: "Win32", threat_kind: "Trojan", variant: "Emotet.A!ml", words: of("trojan") });
  assert.equal(words("xls.DOWNLOADER.agent"), of("downloader"), "without regard to case");
  /* the list is open: other kinds */
  assert.equal(words("Win.Ransomware.Locky-1"), of("ransomware"));
  assert.equal(words("Win.Worm.Conficker-1"), of("worm"));
  /* no row */
  assert.deepEqual(findingKind("Foo.Unheard.Bar"), { file_kind: "Foo", threat_kind: "Unheard", variant: "Bar", words: NO_PLAIN_DESCRIPTION });
  assert.equal(NO_PLAIN_DESCRIPTION, "Civicsmith has no plain description of this name");
  assert.deepEqual(findingKind("Eicar-Signature"), { file_kind: null, threat_kind: null, variant: "Eicar-Signature", words: NO_PLAIN_DESCRIPTION });
  for (const bad of [null, undefined, "", "   ", 42, {}, [], "x".repeat(100_000), "...", "a/b/c"]) {
    const r = findingKind(bad);
    assert.deepEqual(Object.keys(r).sort(), ["file_kind", "threat_kind", "variant", "words"]);
  }
  for (const k of ["file_kind", "threat_kind", "variant"]) assert.equal(findingKind(null)[k], null);
  assert.deepEqual(findingKind("Xls.Downloader.Agent-917"), findingKind("Xls.Downloader.Agent-917"), "pure");
  assert.ok(Object.isFrozen(FINDING_KINDS) && FINDING_KINDS.every(Object.isFrozen));
  assert.ok(enc && FS.fileSafetyOps);
});

test("R2, R24 (K231, K2103): no refusal code of this module shares a code another module's row holds: every exported family (a `_CHECKS` object of rows) of every other module's files in build/modules.json is read, and none holds a code of FILE_SAFETY_CHECKS", async () => {
  const repo = new URL("../../../../", import.meta.url);
  const modules = JSON.parse(readFileSync(new URL("build/modules.json", repo), "utf8")).modules;
  const own = new Set(Object.keys(FILE_SAFETY_CHECKS));
  const shared = [], readFiles = [], others = new Set();
  for (const m of modules.filter((x) => x.id !== "file-safety")) {
    for (const p of m.paths || []) {
      if (!p.startsWith("bio-plane/src/")) continue;
      const files = p.endsWith("/") ? readdirSync(new URL(p, repo)).filter((f) => f.endsWith(".mjs")).map((f) => p + f) : p.endsWith(".mjs") ? [p] : [];
      for (const f of files) {
        if (!/_CHECKS\b/.test(readFileSync(new URL(f, repo), "utf8"))) continue;
        let ns;
        try { ns = await import(new URL(f, repo).href); } catch { continue; }
        readFiles.push(f);
        for (const [name, table] of Object.entries(ns)) {
          if (!name.endsWith("_CHECKS") || !table || typeof table !== "object") continue;
          for (const [code, r] of Object.entries(table)) {
            if (!r || typeof r.check !== "string") continue;
            others.add(code);
            if (own.has(code)) shared.push(`${code} (${m.id} ${f} ${name})`);
          }
        }
      }
    }
  }
  assert.ok(readFiles.length > 40, `the families were read (${readFiles.length} files)`);
  assert.ok(readFiles.includes("bio-plane/src/credentials/checks.mjs") && readFiles.includes("bio-plane/src/sources/checks.mjs"));
  assert.deepEqual(shared, []);
  /* negative control: the codes this module held before K2103 are seen in their owners' rows */
  for (const code of ["NO_SUCH_CAPTURE", "MACHINE_CANNOT_RELEASE", "NO_REASON"]) assert.ok(others.has(code), code);
});
