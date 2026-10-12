/* screens-inquiry R3: the document screen, through the test stand-in kit over a stub plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SCREENS } from "../../../src/screens-inquiry/index.mjs";
import { harness, okd, answer, refusal } from "./kit.mjs";

const DOCUMENT = SCREENS.find((s) => s.id === "document");
const D = "INFO-2026-0004";
const SHA = "3b9f" + "0".repeat(56) + "c210";
const NEWER = "9".repeat(64);
const md = ["---", `id: ${D}`, "object_type: information", "title: \"Pothole repair policy, Administrative Instruction 4.12\"",
  `content_hash: sha256:${SHA}`, "project: PROJ-2026-0007", "source:", "  locator: https://example.org/ai-4-12.pdf", "  authority: Public Works",
  "  retrieved: 2026-10-02T09:00:00Z", "---", "", "## Summary", ""].join("\n");
const READING = (o = {}) => ({ ok: true, found: true, capture_sha: SHA, reading: {
  passages: [{ text: "3. The Director shall repair each reported pothole within seven calendar days of the report.", extent: { kind: "pdf-page", page: 2 } },
             { text: "5. Repairs are recorded as closed when the crew reports the work complete.", extent: { kind: "pdf-page", page: 3 } }],
  people: [{ id: "ENT-17", name: "L. Chen, Director of Public Works" }] },
  unread_pages: [7, 8, 9], ...o });
const plane = (o = {}) => ({
  reading: () => answer(o.reading || READING()),
  gradenote: () => answer({ captureSha: SHA, note: { grade: "B", says: "Fetched from the city's site over HTTPS; a signed copy would raise it to A." } }),
  versionchain: () => answer({ ok: true, versions: [{ capture_sha: SHA, at: "2026-10-02T09:00:00Z" }, { capture_sha: NEWER, at: "2026-10-09T09:00:00Z" }], at_index: 0 }),
  ...o.plane,
});
const DATA = () => ({
  capture: okd({ "bundle.md": md }),
  backlinks: okd({ ok: true, target: D, backlinks: [{ from: "INQ-2026-0001-seven-days", from_type: "inquiry", from_title: "Seven days?", rel: "cites" },
                                                   { from: "PROJ-2026-0007", from_type: "project", from_title: "Pothole repairs", rel: "cites" }], out_of_view: true }),
  questions: okd({ bundles: [{ bundle_id: "INQ-2026-0001-seven-days", title: "Seven days?" }] }),
});

test("R3 reads: the capture and what cites it at once; its reading, grade note and versions once its digest and address are read", async () => {
  const r = DOCUMENT.reads({ subject: D, ui: {} });
  assert.deepEqual([r.capture.op, r.capture.query, r.backlinks.op, r.backlinks.query], ["image", { id: D }, "backlinks", { target: D }]);
  const h = harness(DOCUMENT, { subject: D, data: DATA(), plane: plane() });
  h.render();
  await h.settle();
  const q = Object.fromEntries(h.requests.map((x) => [x.op, x.query]));
  assert.deepEqual(q.reading, { sha256: SHA });
  assert.deepEqual(q.gradenote, { capture: SHA });
  assert.deepEqual(q.versionchain, { address: "https://example.org/ai-4-12.pdf", at: SHA });
  assert.deepEqual(DOCUMENT.place({ data: DATA() }), { project: { id: "PROJ-2026-0007", title: "PROJ-2026-0007" } });
});

test("R3 the document drawn: title, source, its grade as one mark, passages with their pages, unread pages, versions, what cites it", async () => {
  const h = harness(DOCUMENT, { subject: D, data: DATA(), plane: plane() });
  h.render();
  const html = await h.settle();
  assert.match(html, /<h1><span class="cs-rec">Pothole repair policy, Administrative Instruction 4\.12<\/span><\/h1>/);
  assert.match(html, /Captured 2 October 2026 · https:\/\/example\.org\/ai-4-12\.pdf/);
  assert.match(html, /data-grade="capture" data-letter="B"/);
  assert.match(html, /3b9f…c210/);
  assert.match(html, /href="\/app\/open-file\/INFO-2026-0004"/, "the original opens through open-file");
  assert.match(html, /within seven calendar days of the report\.”<span class="cs-meta"><span data-key="screen.document.passage.where">Page 2/);
  assert.equal([...html.matchAll(/data-act="cite"/g)].length, 2, "each passage citable");
  assert.match(html, /Pages 7–9 are pictures of text/);
  assert.match(html, /data-changed="true"/, "a newer version marked changed");
  assert.match(html, /data-ref="question" data-id="INQ-2026-0001-seven-days"/);
  assert.match(html, /data-ref="project" data-id="PROJ-2026-0007"/);
  assert.match(html, /screen.document.backlinks.hidden/);
  assert.match(html, /L\. Chen, Director of Public Works.*data-act="identityclaim" data-entity="ENT-17"/s);
  assert.deepEqual([...new Set(h.drawn())].sort(), ["attest", "cite", "findin", "gradenote", "identityclaim", "monitor", "pagetranscribe",
                                                     "release", "retire", "transcribe"].sort());
});

test("R3 pagetranscribe only while the assistant is reachable (DEC-190); transcribe always where pages are unread", async () => {
  const h = harness(DOCUMENT, { subject: D, data: DATA(), plane: plane(), reachable: false });
  h.render();
  await h.settle();
  assert.ok(!h.drawn().includes("pagetranscribe"));
  assert.ok(h.drawn().includes("transcribe"));
  const none = harness(DOCUMENT, { subject: D, data: DATA(), plane: plane({ reading: READING({ unread_pages: [] }) }) });
  none.render();
  await none.settle();
  assert.ok(!none.drawn().includes("transcribe") && !none.drawn().includes("pagetranscribe"));
  assert.ok(!/screen.document.unread.head/.test(none.html));
});

test("R3 an unchanged version chain marks nothing changed; a grade note answers \"Why B?\"", async () => {
  const h = harness(DOCUMENT, { subject: D, data: DATA(), plane: plane({ plane: { versionchain: () => answer({ ok: true, versions: [{ capture_sha: SHA }] }) } }) });
  h.render();
  await h.settle();
  assert.ok(!/data-changed/.test(h.html));
  await h.press("gradenote", { data: { capture: SHA } });
  assert.match(h.html, /Why \{letter\}\?|screen.document.gradenote.head/);
  assert.match(h.html, /a signed copy would raise it to A/);
});

test("R3 acts send what their owners take", async () => {
  const h = harness(DOCUMENT, { subject: D, data: DATA(), plane: plane({ plane: {
    attest: () => answer({ ok: true }), monitor: () => answer({ ok: true }), transcribe: () => answer({ ok: true }), cite: () => answer({ ok: true }),
    identityclaim: () => answer({ ok: true }), pagetranscribe: () => ({ ok: true, transcription: { performed: true, pages: [7, 8], untested: { kind: "untested" } } }) } }),
    fields: { "document-cite-question": "INQ-2026-0001-seven-days", "document-cite-role": "cuts_against", "document-unread-page": "8",
              "document-unread-words": "Repairs are inspected.", "document-claim-person": "ENT-3", "document-claim-basis": "corroborated_name",
              "document-claim-note": "Same title and department" } });
  h.render();
  await h.settle();
  const found = JSON.stringify({ capture_sha: SHA, extent: { kind: "pdf-page", page: 3 }, kind: "passage" });
  assert.deepEqual((await h.press("cite", { data: { found } })).sent, { query: { project: "INQ-2026-0001-seven-days", role: "cuts_against", found } });
  assert.deepEqual((await h.press("attest", { data: { sha: SHA } })).sent, { body: { sha256: SHA } });
  assert.deepEqual((await h.press("monitor")).sent, { body: { bundleId: D } });
  assert.deepEqual((await h.press("transcribe")).sent, { body: { bundleId: D, extent: { kind: "pdf-page", page: 8 }, text: "Repairs are inspected." } });
  assert.deepEqual((await h.press("identityclaim", { data: { entity: "ENT-17" } })).sent,
    { body: { a: "ENT-17", b: "ENT-3", kind: "same_as", basis: "corroborated_name", evidence: { a: { captureSha: SHA } }, note: "Same title and department" } });
  assert.deepEqual((await h.press("pagetranscribe", { data: { sha: SHA } })).sent, { query: { sha256: SHA, project: "PROJ-2026-0007" } });
  assert.match(h.html, /The assistant read 7, 8\..*data-key="ai.label.untested"/s);
  assert.equal((await h.press("findin")).sent, null);
  assert.deepEqual(h.went.at(-1), ["find-in", "capture:" + D]);
});

test("R3 release and retire act on a selection of this document, made first, and draw a refusal beside the act", async () => {
  const h = harness(DOCUMENT, { subject: D, data: DATA(), plane: plane({ plane: {
    select: (r) => answer({ ok: true, handle: "SEL-9", items: r.body.ids }), release: () => answer({ ok: true, released: [D] }),
    retire: () => refusal("CITED", { translation: "This copy is cited by a question, so it can't be retired yet." }) } }) });
  h.render();
  await h.settle();
  assert.equal((await h.press("release", { dialog: { acknowledgment: "Checked against the site", mitigation: "None needed" } })).sent, null);
  const sel = h.requests.filter((r) => r.op === "select");
  assert.deepEqual(sel[0].body, { ids: [D] });
  assert.deepEqual(h.requests.find((r) => r.op === "release").query, { handle: "SEL-9", acknowledgment: "Checked against the site", mitigation: "None needed" });
  assert.ok(!/data-outcome="release"[^>]*>[^<]/.test(h.html.replace(/data-outcome="release"><\/p>/, "")));
  await h.press("retire", { dialog: { reason: "superseded" } });
  assert.deepEqual(h.requests.find((r) => r.op === "retire").query, { handle: "SEL-9", reason: "superseded" });
  assert.match(h.html, /data-outcome="retire">This copy is cited by a question/);
});

test("R3 controls: a cite with no question, a transcription with no words, a claim with no reason: refused by their words", async () => {
  const h = harness(DOCUMENT, { subject: D, data: DATA(), plane: plane(), fields: {} });
  h.render();
  await h.settle();
  assert.deepEqual((await h.press("cite", { data: { found: "{}" } })).sent, { refuse: "screen.document.cite.noquestion" });
  assert.deepEqual((await h.press("transcribe")).sent, { refuse: "screen.document.unread.empty" });
  assert.deepEqual((await h.press("identityclaim", { data: { entity: "ENT-17" } })).sent, { refuse: "screen.document.claim.empty" });
  const noq = harness(DOCUMENT, { subject: D, data: { ...DATA(), questions: okd({ bundles: [] }) }, plane: plane() });
  noq.render();
  await noq.settle();
  assert.ok(!noq.drawn().includes("cite"), "no question to cite in: no cite act, the sentence instead");
  assert.match(noq.html, /screen.document.cite.noquestion/);
});
