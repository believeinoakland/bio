/* screens-inquiry R3, R8, R15, R22, R32, R39: the document screen, on interface-shell's served page over a scripted plane.
 * Every expectation is a word read by key (R44). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, actsIn, fill, press, rawKeys, plane, says, section, lead, word, day, READING, DOCUMENT_MD, DATASET, provenanceOf, P, Q, D, SHA } from "./fixtures.mjs";

/** R80: the page bar's Next (a radio of the kit's choice control, no op): checked and changed. */
async function nextPage(p) {
  const box = p.doc.getElementById("document-read-page").querySelectorAll("label").find((l) => l.textContent.includes(word("document.read.next"))).querySelector("input");
  box.checked = true; p.fire(box, "change"); await p.settle();
}
const at = "/app/document/" + D;
/* R78: a page the record counts from zero is drawn from one; read here through the same arithmetic, never copied */
const one = (p) => p + 1;
/* what the plane answers `resolutions` for the document's one named person (entities R58) */
const NAMES = ok({ ok: true, names: [{ entity_id: "ENT-17", label: "L. Chen, Director of Public Works", kind: "person", grade: "A", established: true,
  needs_confirmation: false, matched_by: "identifier", mentions: 4 }] });
const DOCUMENT_MD_NO_HASH = ["---", `id: ${D}`, "object_type: information", "title: \"Policy\"", "source:", "  locator: https://example.org/ai-4-12.pdf",
  "  retrieved: 2026-10-02T09:00:00Z", "---", "", "## Summary", ""].join("\n");
/* a member's firsthand observation (provenance's op=testify) */
const TESTIMONY_MD = ["---", `id: ${D}`, "object_type: information", "title: \"The pothole at 4th and Main\"", `project: ${P}`,
  "source:", "  locator: \"a member's firsthand observation, authored in this record\"", "  authority: the observing member", "  retrieved: 2026-10-04T09:00:00Z",
  "---", "", "## Summary", "", "## Provenance Notes", "", "Authored through op=testify. Observed 2026-10-04.", ""].join("\n");
/* the assistant reachable for this member (interface-shell R20) */
const REACH = { assistantstate: ok({ on: true }), accountreference: ok({ held: true }) };
/* R111: `heldcaptures` as the plane answers it, `{held: rows}` (capture R77): this copy, the viewer's own, not yet vouched for */
const HELD = ok({ ok: true, held: [{ bundle_id: D, capture: { sha256: SHA } }] });
/* a document that is watched (R118): its `monitoring.enabled` */
const WATCHED_MD = DOCUMENT_MD.replace("\nsource:", "\nmonitoring:\n  enabled: true\n  frequency: weekly\nsource:");

test("R3 reads: the capture and what cites it at once; its reading, grade note, held row and versions once its digest and address are read", async () => {
  const p = await open(at);
  assert.ok(p.byOp("image").some((r) => r.query.id === D));
  assert.equal(p.byOp("backlinks")[0].query.target, D);
  assert.equal(p.byOp("reading")[0].query.sha256, SHA);
  assert.equal(p.byOp("gradenote")[0].query.capture, SHA);
  assert.equal(p.byOp("heldcaptures")[0].query.project, P);
  assert.deepEqual([p.byOp("versionchain")[0].query.address, p.byOp("versionchain")[0].query.at], ["https://example.org/ai-4-12.pdf", SHA]);
  assert.equal(p.byOp("links")[0].query.capture, SHA);
  assert.equal(p.byOp("connections")[0].query.sha256, SHA);
});

test("R3 R32 the document drawn: title, source as an outside link, its grade as one mark, passages with their pages, unread pages, versions, what cites it", async () => {
  const p = await open(at, { boot: { plane: { ...plane(), ...REACH, resolutions: NAMES } } });
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, "Pothole repair policy, Administrative Instruction 4.12");
  const src = m.querySelector('.mk-sub a[data-outward="1"]');
  assert.equal(src.getAttribute("href"), "https://example.org/ai-4-12.pdf");
  assert.equal(src.textContent, "https://example.org/ai-4-12.pdf", "the address unquoted");
  assert.ok(m.querySelector(".mk-sub").textContent.includes(day("2026-10-02T09:00:00Z")), "times by cs.date, never ISO");
  assert.ok(!/\d{4}-\d{2}-\d{2}T/.test(m.textContent));
  const g = m.querySelector(".mk-facts .cs-grade");
  assert.deepEqual([g.getAttribute("data-scale"), g.textContent.slice(-1)], ["capture", "B"]);
  assert.equal(m.querySelector(".mk-facts").querySelectorAll('.cs-gap[data-gap="unrated"]').length, 0, "never Unrated beside a B note");
  assert.equal(m.querySelector(`a[href="/app/open-file/${SHA}"]`).textContent, word("screen.document.open"), "R22: the original by its digest");
  /* R80: the reading is drawn a page at a time, the first page holding words first; the other page one choice away */
  const passages = m.querySelectorAll("blockquote");
  assert.equal(passages.length, 1);
  assert.ok(says(passages[0], "screen.document.passage.where", { page: one(2) }), "R78: the record's page 2 is drawn from one");
  assert.equal(section(p, "document.read.title").querySelectorAll('button[data-act="cite"]').length, 1, "each passage citable");
  await nextPage(p);
  assert.ok(says(main(p).querySelectorAll("blockquote")[0], "screen.document.passage.where", { page: one(3) }), "the record's page 3 is drawn from one");
  assert.equal(section(p, "document.read.title").querySelectorAll('button[data-act="cite"]').length, 1, "each passage citable");
  assert.ok(says(section(p, "document.read.title"), "document.read.select") && says(section(p, "document.read.title"), "document.read.cite.help"), "the Read it section's own words");
  assert.ok(says(m, "document.unread.pages", { pages: `${one(7)}–${one(9)}` }));
  assert.ok(m.querySelector('[data-changed="true"]'), "a newer version marked changed");
  const cites = section(p, "screen.document.backlinks.head");
  assert.ok(cites.querySelector(`a.cs-ref[href="/app/question/${Q}"]`) && cites.querySelector(`a.cs-ref[href="/app/project/${P}"]`));
  assert.ok(says(cites, "screen.document.backlinks.hidden"));
  assert.ok(section(p, "document.names.title").textContent.includes("L. Chen, Director of Public Works"));
  assert.deepEqual(rawKeys(p.root()), []);
});

test("R32 control: a capture graded B draws B; one no read grades draws no grade mark at all, never Unrated", async () => {
  /* R54: the grade is `capturegrade`'s own answer for the digest; none answered draws no mark */
  const p = await open(at, { plane: { capturegrade: ok({ ok: true, captureSha: SHA, grade: null }) } });
  assert.equal(p.byOp("capturegrade")[0].query.capture, SHA);
  assert.equal(main(p).querySelector(".mk-facts .cs-grade"), null);
  assert.equal(main(p).querySelector(".mk-facts .cs-gap"), null);
});

test("R32 R39 the title is the document's, never the address's last segment or its id", async () => {
  const slug = DOCUMENT_MD.replace(/^title: .*$/m, "title: \"ai-4-12.pdf\"");
  const p = await open(at, { images: { [D]: { "bundle.md": slug, "data/provenance.json": provenanceOf(SHA) } } });
  /* R55: a held page with no title of its own is headed by its site and capture day, never the address */
  assert.equal(main(p).querySelector("h1").textContent, word("document.untitled.web", { site: "example.org", date: day("2026-10-02T09:00:00Z") }));
  for (const h of main(p).querySelectorAll("h1, h2")) assert.doesNotMatch(h.textContent, /INFO-|ai-4-12/);
});

test("R32 a testimony offers Find in as a link and its words, and neither Watch for changes nor Check for a new version", async () => {
  const p = await open(at, { images: { [D]: { "bundle.md": TESTIMONY_MD, "data/provenance.json": provenanceOf(SHA) } } });
  const m = main(p);
  const link = m.querySelector('[data-findin="link"]');
  assert.equal(link.getAttribute("href"), "/app/find-in/" + SHA);
  assert.ok(says(link, "act.findin.label.document"));
  assert.ok(m.querySelectorAll("blockquote").length > 0, "its words");
  assert.ok(!actsIn(m).includes("monitorset") && !actsIn(m).includes("monitor"));
  assert.equal(m.querySelector('a[data-outward="1"]'), null, "its source is not an address");
});

test("R32 \"Its versions\" draws its refusal by its words", async () => {
  const p = await open(at, { plane: { versionchain: refusedIn("VERSIONS_UNREADABLE", "The versions of this address could not be read just now.") } });
  assert.ok(section(p, "screen.document.versions.head").textContent.includes("The versions of this address could not be read just now."));
});

test("R32 a newer version's notice is adopted with her reason, or kept (on the question's row, R69)", async () => {
  const p = await open(at, { plane: { reevaluationnotices: (r) => ok({ ok: true, notices: r.query.holder === Q ? [{ id: "REN-1", state: "open", capture_sha: SHA, newer_capture: "9".repeat(64) }] : [] }),
    adoptversion: ok({ ok: true }), keepversion: ok({ ok: true }) } });
  const s = section(p, "screen.document.a34.your_citations_leg_by_leg");
  assert.deepEqual(actsIn(s).sort(), ["adoptversion", "keepversion"]);
  fill(p, { "document-version-why-REN-1": "the newer one adds the supervisor" });
  await press(p, "adoptversion");
  assert.deepEqual(p.byOp("adoptversion")[0].body, { notice: "REN-1", why: "the newer one adds the supervisor" });
  await press(p, "keepversion");
  assert.equal(p.byOp("keepversion")[0].body.notice, "REN-1");
});

test("R32 R67 R68 the links this page carries, held ones a reference; the names it holds with the mention that counts; explore", async () => {
  const links = ok({ ok: true, links: [{ address: "https://example.org/311", partition: "deferred", resolution: "offsite", verdict: null },
    { address: "https://example.org/report.pdf", partition: "deferred", resolution: "linked", verdict: "contemporaneous", target_bundle: "INFO-2026-0011", target_retrieved: "2026-10-02T09:00:00Z" }] });
  const conns = ok({ ok: true, connections: [{ a_capture_sha: SHA, b_capture_sha: "8".repeat(64), entity_id: "ENT-17", entity_name: "L. Chen",
    on_point: { a: { ref: "c1", occurrence: { page: 1 }, chosen_by: "record" }, b: null }, occurrences: 4,
    mentions: [{ ref: "c1", occurrence: "o1", grade: "A", position: null }, { ref: "c2", occurrence: "o2", grade: "B", position: null }] }] });
  const p = await open(at, { plane: { links, connections: conns, resolutions: NAMES, connectionchoose: ok({ ok: true }) } });
  const l = section(p, "document.links.title");
  assert.ok(says(l, "screen.document.links.group.outside", { n: "1" }) && says(l, "screen.document.links.group.held", { n: "1" }));
  assert.ok(l.querySelector('a.cs-ref[href="/app/document/INFO-2026-0011"]'));
  assert.equal(l.querySelector('a[href="https://example.org/311"]'), null, "R67: an outside address is not a bare anchor");
  const n = section(p, "document.names.title");
  assert.ok(says(n, "document.names.row", { n: "4", page: String(one(1)), chosen: word("document.names.chosen.record") }));
  fill(p, { "document-mention-ENT-17": "1" });
  await press(p, "connectionchoose");
  assert.deepEqual(p.byOp("connectionchoose")[0].body, { capture: SHA, other: "8".repeat(64), entity: "ENT-17", ref: "c2", occurrence: "o2" }, "R85: the mention chosen, not the one on point");
  await press(p, "explore");
  assert.equal(p.location.pathname, "/app/explore/" + D);
  /* control: no links and no names, no section */
  const none = await open(at);
  assert.equal(section(none, "document.links.title"), undefined);
  assert.equal(section(none, "document.names.title"), undefined);
});

test("R3 pagetranscribe only while the assistant is reachable (DEC-190); transcribe wherever pages are unread", async () => {
  const p = await open(at);
  assert.ok(!actsIn(main(p)).includes("pagetranscribe"));
  assert.ok(actsIn(main(p)).includes("transcribe"));
  const none = await open(at, { boot: { plane: { ...plane({ plane: { reading: ok(READING({ unread_pages: [] })) } }), ...REACH } } });
  assert.ok(!actsIn(main(none)).includes("transcribe") && !actsIn(main(none)).includes("pagetranscribe"));
  assert.equal(section(none, "screen.document.unread.head"), undefined);
});

test("R3 an unchanged version chain marks nothing changed; the grade note answers \"Why B?\"", async () => {
  const p = await open(at, { plane: { versionchain: ok({ ok: true, versions: [{ capture_sha: SHA }] }) } });
  assert.ok(!main(p).querySelector("[data-changed]"));
  assert.equal(section(p, "screen.document.versions.head"), undefined, "R20: a chain of one version draws no versions section");
  await press(p, "gradenote", { reason: "to see why" });
  assert.equal(p.byOp("gradenote").at(-1).query.capture, SHA);
  assert.ok(section(p, "screen.document.gradenote.head", { letter: "B" }).textContent.includes("a signed copy would raise it to A"));
});

test("R3 acts send what their owners take", async () => {
  const p = await open(at, { images: { [D]: { "bundle.md": WATCHED_MD, "data/provenance.json": provenanceOf(SHA) } }, boot: { plane: { ...plane({ images: { [D]: { "bundle.md": WATCHED_MD, "data/provenance.json": provenanceOf(SHA) } }, plane: {
    attest: ok({ ok: true }), monitor: ok({ ok: true }), transcribe: ok({ ok: true }), cite: ok({ ok: true }), identityclaim: ok({ ok: true }),
    pagetranscribe: { status: 200, json: { ok: true, transcription: { performed: true, pages: [7, 8], untested: { kind: "untested" } } } }, resolutions: NAMES } }), ...REACH } } });
  await nextPage(p);
  fill(p, { "document-cite-question": Q, "document-cite-role": "cuts_against" });
  await press(p, "cite", { within: main(p).querySelectorAll("blockquote")[0].nextElementSibling });
  /* R125 (C31): the fields are in the body, not the address */
  const cite = p.byOp("cite")[0].body;
  assert.deepEqual([cite.project, cite.role, typeof cite.found === "string" ? JSON.parse(cite.found) : cite.found], [Q, "cuts_against", { capture_sha: SHA, extent: { kind: "pdf-page", page: 3 }, kind: "passage" }]);
  await press(p, "attest");
  await p.click(p.root().querySelector('[data-shell="confirm"]'));
  assert.deepEqual(p.byOp("attest")[0].body, { sha256: SHA });
  await press(p, "monitor");
  assert.deepEqual(p.byOp("monitor")[0].body, { bundleId: D });
  /* R78: the picker draws the record's page 8 as its own 9; the extent sent is the record's number */
  fill(p, { "document-unread-page": String(one(8)), "document-unread-words": "Repairs are inspected." });
  await press(p, "transcribe");
  assert.deepEqual(p.byOp("transcribe")[0].body, { bundleId: D, extent: { kind: "pdf-page", page: 8 }, text: "Repairs are inspected." });
  fill(p, { "document-claim-person": "ENT-3", "document-claim-basis": "corroborated_name", "document-claim-note": "Same title and department" });
  await press(p, "identityclaim");
  assert.deepEqual(p.byOp("identityclaim")[0].body,
    { a: "ENT-17", b: "ENT-3", kind: "same_as", basis: "corroborated_name", evidence: { a: { captureSha: SHA } }, note: "Same title and department" });
  await press(p, "pagetranscribe", { reason: "the pages hold the dates" });
  assert.deepEqual([p.byOp("pagetranscribe")[0].query.sha256, p.byOp("pagetranscribe")[0].query.project], [SHA, P]);
  assert.ok(says(main(p), "screen.document.pagetranscribe.done", { pages: `${one(7)}, ${one(8)}` }) && says(main(p), "ai.label.untested"));
  await press(p, "findin", { reason: "to find the dates" });
  assert.equal(p.location.pathname, "/app/find-in/" + SHA, "find-in's scope: the capture's digest (screens-daily)");
});

test("R3 release and retire act on a selection of this document, made first, and draw a refusal beside the act", async () => {
  const p = await open(at, { plane: { heldcaptures: HELD, select: (r) => ok({ ok: true, handle: "SEL-9", items: r.body.ids }), release: ok({ ok: true, released: [D] }),
    retire: refusedIn("CITED", "This copy is cited by a question, so it can't be retired yet.") } });
  fill(p, { "document-release-ack": "Checked against the site", "document-release-mitigation": "None needed" });
  await press(p, "release");
  assert.deepEqual(p.byOp("select")[0].body, { ids: [D] });
  const rel = p.byOp("release")[0].query;
  assert.deepEqual([rel.handle, rel.acknowledgment, rel.mitigation], ["SEL-9", "Checked against the site", "None needed"]);
  await press(p, "retire");
  const dlg = p.root().querySelector('[role="dialog"]');
  dlg.querySelector("textarea").value = "superseded";
  await p.click(dlg.querySelector('[data-shell="confirm"]'));
  await p.settle();
  assert.deepEqual([p.byOp("retire")[0].query.handle, p.byOp("retire")[0].query.reason], ["SEL-9", "superseded"]);
  assert.ok(p.root().textContent.includes("This copy is cited by a question"), "the shell draws the plane's refusal beside the act");
});

test("R3 controls: a release, a transcription and a claim with nothing written are refused by their words; no question to cite in, no cite", async () => {
  const p = await open(at, { plane: { resolutions: NAMES, heldcaptures: HELD } });
  assert.ok(says(await press(p, "release"), "screen.document.release.empty"));
  assert.ok(says(await press(p, "transcribe"), "screen.document.unread.empty"));
  assert.ok(says(await press(p, "identityclaim"), "screen.document.claim.empty"));
  assert.equal(p.byOp("select").length + p.byOp("transcribe").length + p.byOp("identityclaim").length, 0);
  const noq = await open(at, { plane: { list: ok({ bundles: [] }) } });
  assert.ok(!actsIn(main(noq)).includes("cite"));
  assert.ok(says(main(noq), "screen.document.cite.noquestion"));
});

test("R15 R92 R118 Watch for changes sends monitorset with its frequency and Check for a new version now sends monitor: two acts, each alone, the check only for a watched address", async () => {
  const un = await open(at, { plane: { monitorset: ok({ ok: true, bundleId: D, enabled: true }) } });
  assert.ok(says(un.root().querySelector('button[data-act="monitorset"]'), "act.monitorset.label.document") && !actsIn(main(un)).includes("monitor"), "unwatched: no check");
  fill(un, { "document-watch-freq": "daily" });
  await press(un, "monitorset", { reason: "the policy changes yearly" });
  assert.deepEqual(un.byOp("monitorset").map((r) => [r.body.bundleId, r.body.enabled, r.body.frequency]), [[D, true, "daily"]]);
  assert.equal(un.byOp("monitor").length, 0, "watching checks nothing now");
  assert.ok(says(main(un).querySelector('[data-outcome="monitorset"]'), "screen.document.monitorset.done"));
  const p = await open(at, { images: { [D]: { "bundle.md": WATCHED_MD, "data/provenance.json": provenanceOf(SHA) } }, plane: { monitor: ok({ ok: true, status: "unchanged" }) } });
  assert.ok(says(p.root().querySelector('button[data-act="monitor"]'), "act.monitor.label.document"));
  await press(p, "monitor");
  assert.deepEqual(p.byOp("monitor").map((r) => r.body), [{ bundleId: D }]);
  assert.equal(p.byOp("monitorset").length, 0, "checking now asks no watching");
});

test("R8 the question a passage is cited in, and an unread page, are choices among record data", async () => {
  const p = await open(at, { plane: { list: ok({ bundles: [{ bundle_id: Q, title: "screen.document.copy" }] }) } });
  const opts = (id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => [o.getAttribute("value"), o.textContent]);
  assert.deepEqual(opts("document-cite-question"), [["", word("screen.document.cite.choose")], [Q, word("screen.document.cite.option", { question: "screen.document.copy", project: "Pothole repairs" })]],
    "R49 R118: none preselected, the choose option first; a title is drawn as data, never read as a key, with its project");
  assert.deepEqual(opts("document-unread-page"), [7, 8, 9].map((r) => [String(one(r)), String(one(r))]), "R78: the picker draws each unread page from one");
});

test("R22 control: a document whose provenance names no capture digest draws no Open the original link, and none opens by its bundle id", async () => {
  const p = await open(at, { plane: { image: (r) => ok(r.query.id === D ? { "bundle.md": DOCUMENT_MD_NO_HASH } : null) } });
  assert.equal(main(p).querySelectorAll('a[href^="/app/open-file/"]').length, 0);
  assert.ok(!says(main(p), "screen.document.open"));
});

test("R3 R32 (K3387) every capture read is keyed on the capture's sha from its provenance document, never content_hash (the dataset digest)", async () => {
  const p = await open(at);
  assert.notEqual(DATASET, SHA);
  assert.ok(DOCUMENT_MD.includes(DATASET), "the bundle's content_hash is the dataset digest");
  for (const [op, key] of [["reading", "sha256"], ["gradenote", "capture"], ["versionchain", "at"], ["links", "capture"], ["connections", "sha256"]]) {
    assert.equal(p.byOp(op)[0].query[key], SHA, `${op} at the capture's sha`);
    assert.ok(!p.byOp(op).some((r) => JSON.stringify(r.query).includes(DATASET)), `${op} never at content_hash`);
  }
  await press(p, "findin");
  assert.equal(p.location.pathname, "/app/find-in/" + SHA);
  /* the versions' dates are provenance's first_retrieved */
  const d = await open(at);
  assert.ok(section(d, "screen.document.versions.head").textContent.includes(day("2026-10-09T09:00:00Z")));
});

test("R3 (K3387) the document's words are the reading's text_units; a reading with none says so, and no invented field is read", async () => {
  const p = await open(at);
  const q = main(p).querySelectorAll("blockquote");
  assert.equal(q.length, 1, "R80: one page at a time");
  assert.ok(q[0].textContent.includes("within seven calendar days"));
  await nextPage(p);
  assert.ok(main(p).querySelectorAll("blockquote")[0].textContent.includes("Repairs are recorded as closed"));
  const none = await open(at, { plane: { reading: ok(READING({ text_units: [], reading: { passages: [{ text: "invented" }], units: [{ text: "invented" }], text: "invented" } })) } });
  const s = section(none, "document.read.title");
  assert.ok(says(s, "state.empty"));
  assert.ok(!main(none).textContent.includes("invented"), "passages, units and text are never read");
});
