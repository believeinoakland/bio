/* screens-inquiry R3, R8, R15: the document screen, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, actsIn, fill, press, rawKeys, plane, READING, P, Q, D, SHA } from "./fixtures.mjs";

const at = "/app/document/" + D;
const section = (p, head) => main(p).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === head);
/* the assistant reachable for this member (interface-shell R20) */
const REACH = { assistantstate: ok({ on: true }), accountreference: ok({ held: true }) };

test("R3 reads: the capture and what cites it at once; its reading, grade note and versions once its digest and address are read", async () => {
  const p = await open(at);
  assert.ok(p.byOp("image").some((r) => r.query.id === D));
  assert.equal(p.byOp("backlinks")[0].query.target, D);
  assert.equal(p.byOp("reading")[0].query.sha256, SHA);
  assert.equal(p.byOp("gradenote")[0].query.capture, SHA);
  assert.deepEqual([p.byOp("versionchain")[0].query.address, p.byOp("versionchain")[0].query.at], ["https://example.org/ai-4-12.pdf", SHA]);
  assert.match(p.root().querySelector(".cs-crumbs").textContent, /Projects.*Document/);
});

test("R3 the document drawn: title, source, its grade as one mark, passages with their pages, unread pages, versions, what cites it", async () => {
  const p = await open(at, { boot: { plane: { ...plane(), ...REACH } } });
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, "Pothole repair policy, Administrative Instruction 4.12");
  assert.match(m.textContent, /Captured 2 October 2026 · https:\/\/example\.org\/ai-4-12\.pdf/);
  const g = m.querySelector(".mk-facts .cs-grade");
  assert.deepEqual([g.getAttribute("data-scale"), g.textContent.slice(-1)], ["capture", "B"]);
  assert.match(m.textContent, /3b9f…c210/);
  assert.equal(m.querySelector(`a[href="/app/open-file/${SHA}"]`).textContent, "Open the original", "R22: the original opens through open-file by its digest");
  assert.ok(!m.querySelector(`a[href="/app/open-file/${D}"]`), "R22: never by the bundle id");
  const passages = m.querySelectorAll("blockquote");
  assert.equal(passages.length, 2);
  assert.match(passages[0].textContent, /within seven calendar days of the report\.”Page 2/);
  assert.equal(section(p, "Passages").querySelectorAll('button[data-act="cite"]').length, 2, "each passage citable");
  assert.match(m.textContent, /Pages 7–9 are pictures of text/);
  assert.ok(m.querySelector('[data-changed="true"]'), "a newer version marked changed");
  const cites = section(p, "What cites it");
  assert.ok(cites.querySelector(`a.cs-ref[href="/app/question/${Q}"]`) && cites.querySelector(`a.cs-ref[href="/app/project/${P}"]`));
  assert.match(cites.textContent, /in projects you can't see/);
  assert.match(section(p, "People it names").textContent, /L\. Chen, Director of Public Works/);
  assert.deepEqual([...new Set(actsIn(m))].sort(), ["attest", "cite", "findin", "gradenote", "identityclaim", "monitor", "monitorset", "pagetranscribe", "release", "retire", "transcribe"]);
  assert.deepEqual(rawKeys(p.root()), []);
});

test("R3 pagetranscribe only while the assistant is reachable (DEC-190); transcribe wherever pages are unread", async () => {
  const p = await open(at);
  assert.ok(!actsIn(main(p)).includes("pagetranscribe"));
  assert.ok(actsIn(main(p)).includes("transcribe"));
  const none = await open(at, { boot: { plane: { ...plane({ plane: { reading: ok(READING({ unread_pages: [] })) } }), ...REACH } } });
  assert.ok(!actsIn(main(none)).includes("transcribe") && !actsIn(main(none)).includes("pagetranscribe"));
  assert.ok(!section(none, "Pages your group's Civicsmith couldn't read"));
});

test("R3 an unchanged version chain marks nothing changed; the grade note answers \"Why B?\"", async () => {
  const p = await open(at, { plane: { versionchain: ok({ ok: true, versions: [{ capture_sha: SHA }] }) } });
  assert.ok(!main(p).querySelector("[data-changed]"));
  assert.ok(!section(p, "Its versions"), "R20: a chain of one version draws no versions section");
  await press(p, "gradenote", { reason: "to see why" });
  assert.equal(p.byOp("gradenote").at(-1).query.capture, SHA);
  assert.match(section(p, "Why B?").textContent, /a signed copy would raise it to A/);
});

test("R3 acts send what their owners take", async () => {
  const p = await open(at, { boot: { plane: { ...plane({ plane: {
    attest: ok({ ok: true }), monitor: ok({ ok: true }), transcribe: ok({ ok: true }), cite: ok({ ok: true }), identityclaim: ok({ ok: true }),
    pagetranscribe: { status: 200, json: { ok: true, transcription: { performed: true, pages: [7, 8], untested: { kind: "untested" } } } } } }), ...REACH } } });
  fill(p, { "document-cite-question": Q, "document-cite-role": "cuts_against" });
  await press(p, "cite", { within: main(p).querySelectorAll("blockquote")[1].nextElementSibling });
  const cite = p.byOp("cite")[0].query;
  assert.deepEqual([cite.project, cite.role, JSON.parse(cite.found)], [Q, "cuts_against", { capture_sha: SHA, extent: { kind: "pdf-page", page: 3 }, kind: "passage" }]);
  await press(p, "attest");
  await p.click(p.root().querySelector('[data-shell="confirm"]'));
  assert.deepEqual(p.byOp("attest")[0].body, { sha256: SHA });
  await press(p, "monitor");
  assert.deepEqual(p.byOp("monitor")[0].body, { bundleId: D });
  fill(p, { "document-unread-page": "8", "document-unread-words": "Repairs are inspected." });
  await press(p, "transcribe");
  assert.deepEqual(p.byOp("transcribe")[0].body, { bundleId: D, extent: { kind: "pdf-page", page: 8 }, text: "Repairs are inspected." });
  fill(p, { "document-claim-person": "ENT-3", "document-claim-basis": "corroborated_name", "document-claim-note": "Same title and department" });
  await press(p, "identityclaim");
  assert.deepEqual(p.byOp("identityclaim")[0].body,
    { a: "ENT-17", b: "ENT-3", kind: "same_as", basis: "corroborated_name", evidence: { a: { captureSha: SHA } }, note: "Same title and department" });
  await press(p, "pagetranscribe", { reason: "the pages hold the dates" });
  assert.deepEqual([p.byOp("pagetranscribe")[0].query.sha256, p.byOp("pagetranscribe")[0].query.project], [SHA, P]);
  assert.match(main(p).textContent, /The assistant read 7, 8\..*Not yet tested/s);
  await press(p, "findin", { reason: "to find the dates" });
  assert.equal(p.location.pathname, "/app/find-in/" + SHA, "find-in's scope: the capture's digest (screens-daily)");
});

test("R3 release and retire act on a selection of this document, made first, and draw a refusal beside the act", async () => {
  const p = await open(at, { plane: { select: (r) => ok({ ok: true, handle: "SEL-9", items: r.body.ids }), release: ok({ ok: true, released: [D] }),
    retire: refusedIn("CITED", "This copy is cited by a question, so it can't be retired yet.") } });
  fill(p, { "document-release-ack": "Checked against the site", "document-release-mitigation": "None needed" });
  await press(p, "release");
  assert.deepEqual(p.byOp("select")[0].body, { ids: [D] });
  const rel = p.byOp("release")[0].query;
  assert.deepEqual([rel.handle, rel.acknowledgment, rel.mitigation], ["SEL-9", "Checked against the site", "None needed"]);
  assert.equal(main(p).querySelector('[data-outcome="release"]').textContent, "");
  await press(p, "retire");
  const dlg = p.root().querySelector('[role="dialog"]');
  dlg.querySelector("textarea").value = "superseded";
  await p.click(dlg.querySelector('[data-shell="confirm"]'));
  await p.settle();
  assert.deepEqual([p.byOp("retire")[0].query.handle, p.byOp("retire")[0].query.reason], ["SEL-9", "superseded"]);
  assert.match(main(p).querySelector('[data-outcome="retire"]').textContent, /This copy is cited by a question/);
});

test("R3 controls: a release, a transcription and a claim with nothing written are refused by their words; no question to cite in, no cite", async () => {
  const p = await open(at);
  assert.match((await press(p, "release")).textContent, /Say what you checked/);
  assert.match((await press(p, "transcribe")).textContent, /Type the page's words first/);
  assert.match((await press(p, "identityclaim")).textContent, /Choose the person and say why/);
  assert.equal(p.byOp("select").length + p.byOp("transcribe").length + p.byOp("identityclaim").length, 0);
  const noq = await open(at, { plane: { list: ok({ bundles: [] }) } });
  assert.ok(!actsIn(main(noq)).includes("cite"));
  assert.match(main(noq).textContent, /Open a question first/);
});

test("R15 Watch for changes sends monitorset and Check for a new version now sends monitor: two acts, each alone", async () => {
  const p = await open(at, { plane: { monitorset: ok({ ok: true, bundleId: D, enabled: true }), monitor: ok({ ok: true }) } });
  const b = (op) => main(p).querySelector(`button[data-act="${op}"]`);
  assert.match(b("monitorset").textContent, /Watch for changes/);
  assert.match(b("monitor").textContent, /Check for a new version now/);
  await press(p, "monitorset", { reason: "the policy changes yearly" });
  assert.deepEqual(p.byOp("monitorset").map((r) => [r.body.bundleId, r.body.enabled]), [[D, true]]);
  assert.equal(p.byOp("monitor").length, 0, "watching checks nothing now");
  assert.match(main(p).querySelector('[data-outcome="monitorset"]').textContent, /Watching this document's address/);
  await press(p, "monitor");
  assert.deepEqual(p.byOp("monitor").map((r) => r.body), [{ bundleId: D }]);
  assert.equal(p.byOp("monitorset").length, 1, "checking now asks no watching");
  /* control: a refused watch is drawn beside its act, and nothing else is sent */
  const r = await open(at, { plane: { monitorset: refusedIn("NO_LOCATOR", "This document has no public address to watch.") } });
  const slot = await press(r, "monitorset", { reason: "why" });
  assert.match(slot.textContent, /no public address to watch/);
  assert.equal(r.byOp("monitor").length, 0);
});

test("R8 the question a passage is cited in, and an unread page, are choices among record data", async () => {
  const p = await open(at, { plane: { list: ok({ bundles: [{ bundle_id: Q, title: "screen.document.copy" }] }) } });
  const opts = (id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => [o.getAttribute("value"), o.textContent]);
  assert.deepEqual(opts("document-cite-question"), [[Q, "screen.document.copy"]], "a title is drawn as data, never read as a key");
  assert.deepEqual(opts("document-unread-page"), [["7", "7"], ["8", "8"], ["9", "9"]]);
});
