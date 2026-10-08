/* file-safety R13, R14, R36: the deeper check a member asks for, what it runs and how it ends, and the wake that drives
   it. At the module's interface, over the scripted scanner and tools (fixture.mjs). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, pdf, sha } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { FILE_SAFETY_CHECKS } from "../../../src/file-safety/index.mjs";

const row = (code) => ({ check: FILE_SAFETY_CHECKS[code].check, translation: FILE_SAFETY_CHECKS[code].translation });
const CT = `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;
const docx = (extra) => makeZip([{ name: "[Content_Types].xml", data: CT }, { name: "word/document.xml", data: `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>hi</w:t></w:r></w:p></w:body></w:document>` }, ...extra]);
const deeperNote = (w, s) => w.fs.verdictNotes({ captureSha: s }).notes.filter((n) => n.kind === "deeper").at(-1);

test("R13: `requestDeeperCheck` (any member who may see the file) answers {ok, state, check_id}: queued, running, or done with its note; the sight refusal (FILE_NOT_HELD, K2098); NO_OUTSIDE_TOOL when no scan or sandbox tool is on; DEEPER_CHECK_BUDGET_SPENT when every such tool has spent its monthly limit this calendar month (UTC); a check already queued or running answers it; who asked is not kept", async () => {
  const w = world({ scan: { polls: 3 } });
  const s = await w.capture(pdf(true, "d"));
  const ask = (v = "member:m1") => w.fs.requestDeeperCheck({ captureSha: s, viewer: v });
  const none = ask();
  assert.deepEqual({ code: none.code, ...{ check: none.check, translation: none.translation } }, { code: "NO_OUTSIDE_TOOL", ...row("NO_OUTSIDE_TOOL") });
  await w.tool("glasswall-halo", { config: { host: "halo.example.org" } });
  assert.equal(ask().code, "NO_OUTSIDE_TOOL", "a CDR tool is not a deeper check's");
  const sb = await w.tool("joe-sandbox", { monthlyLimit: 1 });
  const q = ask();
  assert.deepEqual([q.ok, q.state, q.captureSha], [true, "queued", s]);
  assert.match(q.check_id, /^FSD-[0-9a-f]{16}$/);
  assert.deepEqual(ask("member:m2"), q, "already queued: the same check");
  await w.fs.deeperBatch({});
  const running = ask();
  assert.deepEqual([running.state, running.check_id], ["running", q.check_id]);
  /* the sandbox answers on its third poll, each no sooner than its poll_after_ms */
  for (let i = 0; i < 3; i++) { w.tick(61_000); await w.fs.deeperBatch({}); }
  const done = ask();
  assert.deepEqual([done.state, done.check_id, done.note.kind, done.note.result], ["done", q.check_id, "deeper", "clean"]);
  /* the sandbox's one use spent its monthly limit: no check can run until the month turns */
  w.tick(1);
  const t = await w.capture(pdf(true, "e"));
  const spent = w.fs.requestDeeperCheck({ captureSha: t, viewer: "member:m1" });
  assert.deepEqual({ code: spent.code, check: spent.check }, { code: "DEEPER_CHECK_BUDGET_SPENT", check: row("DEEPER_CHECK_BUDGET_SPENT").check });
  w.clock.now = Date.parse("2026-11-01T00:00:01Z");
  assert.equal(w.fs.requestDeeperCheck({ captureSha: t, viewer: "member:m1" }).state, "queued", "a new calendar month");
  /* sight */
  w.project("PROJ-1", "m1"); w.home(s, "INFO-P", { project: "PROJ-1" });
  assert.equal(ask("member:m2").code, "FILE_NOT_HELD");
  assert.equal(w.fs.requestDeeperCheck({ captureSha: sha("none"), viewer: "member:m1" }).code, "FILE_NOT_HELD");
  /* who asked is not kept */
  assert.doesNotMatch(JSON.stringify(w.rows("SELECT * FROM fs_deeper")), /m1|m2/);
  assert.ok(sb);
});

test("R14: the check runs on the same bytes: the structure check (the reader reads it whole), ClamAV on demand, and every on scan or sandbox tool with budget left, a tool past its limit skipped and named; its note kind deeper lists checks [{check, tool, engine, result, detail}] and its result: clean only when every check that ran is clean and an engine of another family than ClamAV's answered clean; flagged when any found or was suspicious or the structure check flags; incomplete otherwise, which never opens an original; PRIVATE_MODE_NOT_HONOURED switches that tool off and counts as a check that could not run", async () => {
  const verdicts = new Map();
  const w = world({ scan: { provider: { scanii: (s) => verdicts.get(s) || [{ engine: "scanii", result: "clean" }],
                                        "metadefender-core": () => [{ engine: "clamav", result: "clean" }] },
                            sandbox: { "joe-sandbox": (s) => (s === sha(pdf(true, "sus")) ? { result: "suspicious", findings: ["Behaviour.Network"] } : { result: "clean" }) } } });
  const run = async (s) => { w.fs.requestDeeperCheck({ captureSha: s, viewer: "member:m1" }); await w.fs.deeperBatch({}); w.tick(61_000); await w.fs.deeperBatch({}); return deeperNote(w, s); };
  await w.tool("scanii");
  /* clean: structure passes, ClamAV clean, scanii (another family) clean */
  const a = await w.capture(pdf(true, "clean"));
  const na = await run(a);
  assert.equal(na.result, "clean");
  assert.deepEqual(na.checks.map((c) => [c.check, c.tool, c.engine, c.result]), [["structure", "file-safety", "structure", "clean"], ["clamav", "clamav", "clamav", "clean"], ["scan", "scanii", "scanii", "clean"]]);
  for (const c of na.checks) assert.deepEqual(Object.keys(c).filter((k) => k !== "tool_id").sort(), ["check", "detail", "engine", "result", "tool"]);
  assert.ok(w.calls("/scan").some((c) => c.body.targets[0].capture_sha === a), "ClamAV on demand, on the same bytes");
  assert.ok(w.calls("/provider/scan").every((c) => c.body.target.capture_sha === a));
  /* flagged by the structure check (an OLE object), the safe view staying */
  const o = await w.capture(docx([{ name: "word/embeddings/oleObject1.bin", data: "x" }, { name: "word/activeX/activeX1.xml", data: "<x/>" }]));
  const no = await run(o);
  assert.equal(no.result, "flagged");
  assert.deepEqual(no.checks[0], { check: "structure", tool: "file-safety", engine: "structure", result: "flagged", detail: "ole-object, activex" });
  /* flagged by an outside finding */
  const f = await w.capture(pdf(true, "found"));
  verdicts.set(f, [{ engine: "scanii", result: "found", findings: ["Pdf.Exploit.F"] }]);
  const nf = await run(f);
  assert.deepEqual([nf.result, nf.findings], ["flagged", ["Pdf.Exploit.F"]]);
  /* incomplete: the only other engine is ClamAV's own family (a multi-engine tool's ClamAV) */
  const v = world({ scan: { provider: { "metadefender-core": () => [{ engine: "clamav", result: "clean" }] } } });
  await v.tool("metadefender-core", { config: { host: "md.example.org" } });
  const m = await v.capture(pdf(true, "same family"));
  v.fs.requestDeeperCheck({ captureSha: m, viewer: "member:m1" });
  await v.fs.deeperBatch({});
  assert.equal(deeperNote(v, m).result, "incomplete");
  assert.equal((await v.fs.openOriginal({ captureSha: m, viewer: "member:m1", override: true })).code, "SAFE_VIEW_ONLY", "incomplete never opens an original");
  /* a sandbox's suspicious verdict flags */
  await w.tool("joe-sandbox");
  const su = await w.capture(pdf(true, "sus"));
  const ns = await run(su);
  assert.equal(ns.result, "flagged");
  assert.ok(ns.checks.some((c) => c.check === "sandbox" && c.result === "suspicious"));
  /* a tool past its limit is skipped and named */
  w.exec("UPDATE fs_tools SET monthly_limit = 0 WHERE provider_id = 'joe-sandbox'");
  const sk = await w.capture(pdf(true, "skip"));
  const nk = await run(sk);
  assert.ok(nk.checks.some((c) => c.check === "sandbox" && c.result === "skipped" && c.detail === "MONTHLY_LIMIT_REACHED"));
  assert.equal(nk.result, "clean", "a skipped tool is named, not a check that could not run");
  /* PRIVATE_MODE_NOT_HONOURED: the tool is switched off, and the check could not run */
  const p = world({ scan: { provider: { scanii: () => ({ code: "PRIVATE_MODE_NOT_HONOURED" }), "metadefender-core": () => [{ engine: "avira", result: "clean" }] } } });
  const pt = await p.tool("scanii");
  await p.tool("metadefender-core", { config: { host: "md.example.org" } });
  const ps = await p.capture(pdf(true, "pm"));
  p.fs.requestDeeperCheck({ captureSha: ps, viewer: "member:m1" });
  await p.fs.deeperBatch({});
  const pn = deeperNote(p, ps);
  assert.equal(pn.result, "incomplete");
  assert.ok(pn.checks.some((c) => c.tool === "scanii" && c.result === "not_scanned" && c.detail === "PRIVATE_MODE_NOT_HONOURED"));
  assert.equal(p.fs.securityTools({ viewer: "member:boss" }).tools.find((t) => t.tool_id === pt).state, "off");
  /* a check that could not run: no scanner bound for ClamAV */
  const n = world({ bound: false });
  n.exec(`INSERT INTO fs_tools (tool_id, provider_id, kinds, use, state, handling, handling_digest, monthly_limit, added_by, added_at, config, seq)
          VALUES ('t', 'scanii', '["scan"]', 'on_request', 'on', '{}', 'x', 5, 'boss', 'T', '{}', 1)`);
  const nn = await n.capture(pdf(true, "nb"));
  n.fs.requestDeeperCheck({ captureSha: nn, viewer: "member:m1" });
  await n.fs.deeperBatch({});
  const nnn = deeperNote(n, nn);
  assert.equal(nnn.result, "incomplete");
  assert.deepEqual(nnn.checks.find((c) => c.check === "clamav"), { check: "clamav", tool: "clamav", engine: "clamav", result: "not_scanned", detail: "SCANNER_ABSENT" });
});

test("R36: `deeperBatch` starts queued checks and asks each running sandbox for its result no sooner than its poll_after_ms, a sandbox note per verdict; a check is done when every check in it has a result", async () => {
  const w = world({ scan: { polls: 2, sandbox: { "joe-sandbox": () => ({ result: "clean" }) }, sandboxEngine: { "joe-sandbox": "joe-sandbox" } } });
  await w.tool("joe-sandbox");
  const s = await w.capture(pdf(true, "sb"));
  w.fs.requestDeeperCheck({ captureSha: s, viewer: "member:m1" });
  const b1 = await w.fs.deeperBatch({});
  assert.deepEqual([b1.started, b1.polled, b1.done, b1.running, b1.queued], [1, 0, [], 1, 0]);
  assert.equal(w.calls("/provider/sandbox").length, 1);
  /* not yet: poll_after_ms has not passed */
  w.tick(30_000);
  assert.equal((await w.fs.deeperBatch({})).polled, 0);
  assert.equal(w.calls("/provider/sandbox/result").length, 0);
  /* the first poll answers running; the second, a minute later, done */
  w.tick(31_000);
  const b2 = await w.fs.deeperBatch({});
  assert.deepEqual([b2.polled, b2.done.length, b2.running], [1, 0, 1]);
  w.tick(61_000);
  const b3 = await w.fs.deeperBatch({});
  assert.deepEqual([b3.polled, b3.done.length, b3.running], [1, 1, 0]);
  assert.deepEqual(w.calls("/provider/sandbox/result").map((c) => Object.keys(c.body).sort()), [["submitted_at", "tool", "vendor_ref"], ["submitted_at", "tool", "vendor_ref"]]);
  const notes = w.fs.verdictNotes({ captureSha: s }).notes;
  assert.deepEqual(notes.filter((n) => n.kind === "sandbox").map((n) => [n.tool, n.result, n.vendor_ref]), [["joe-sandbox", "clean", `ref-${s.slice(0, 8)}`]]);
  assert.equal(notes.at(-1).kind, "deeper");
  assert.equal(b3.done[0].check_id, w.row("SELECT check_id FROM fs_deeper").check_id);
  assert.equal(w.row("SELECT state FROM fs_deeper").state, "done");
});
