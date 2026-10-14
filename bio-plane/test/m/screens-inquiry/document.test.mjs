/* screens-inquiry R3, R8, R15, R22, R32, R39: the document screen, on interface-shell's served page over a scripted plane.
 * Every expectation is a word read by key (R44). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, actsIn, fill, press, rawKeys, plane, says, section, lead, word, READING, DOCUMENT_MD, P, Q, D, SHA } from "./fixtures.mjs";

const at = "/app/document/" + D;
const DOCUMENT_MD_NO_HASH = ["---", `id: ${D}`, "object_type: information", "title: \"Policy\"", "source:", "  locator: https://example.org/ai-4-12.pdf",
  "  retrieved: 2026-10-02T09:00:00Z", "---", "", "## Summary", ""].join("\n");
/* a member's firsthand observation (provenance's op=testify) */
const TESTIMONY_MD = ["---", `id: ${D}`, "object_type: information", "title: \"The pothole at 4th and Main\"", `content_hash: sha256:${SHA}`, `project: ${P}`,
  "source:", "  locator: \"a member's firsthand observation, authored in this record\"", "  authority: the observing member", "  retrieved: 2026-10-04T09:00:00Z",
  "---", "", "## Summary", "", "## Provenance Notes", "", "Authored through op=testify. Observed 2026-10-04.", ""].join("\n");
/* the assistant reachable for this member (interface-shell R20) */
const REACH = { assistantstate: ok({ on: true }), accountreference: ok({ held: true }) };

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
  const p = await open(at, { boot: { plane: { ...plane(), ...REACH } } });
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, "Pothole repair policy, Administrative Instruction 4.12");
  const src = m.querySelector('.mk-sub a[data-outward="1"]');
  assert.equal(src.getAttribute("href"), "https://example.org/ai-4-12.pdf");
  assert.equal(src.textContent, "https://example.org/ai-4-12.pdf", "the address unquoted");
  assert.ok(m.querySelector(".mk-sub").textContent.includes("2 October 2026"), "times by cs.date, never ISO");
  assert.ok(!/\d{4}-\d{2}-\d{2}T/.test(m.textContent));
  const g = m.querySelector(".mk-facts .cs-grade");
  assert.deepEqual([g.getAttribute("data-scale"), g.textContent.slice(-1)], ["capture", "B"]);
  assert.equal(m.querySelector(".mk-facts").querySelectorAll('.cs-gap[data-gap="unrated"]').length, 0, "never Unrated beside a B note");
  assert.equal(m.querySelector(`a[href="/app/open-file/${SHA}"]`).textContent, word("screen.document.open"), "R22: the original by its digest");
  const passages = m.querySelectorAll("blockquote");
  assert.equal(passages.length, 2);
  assert.ok(says(passages[0], "screen.document.passage.where", { page: 2 }));
  assert.equal(section(p, "screen.document.passages.head").querySelectorAll('button[data-act="cite"]').length, 2, "each passage citable");
  assert.ok(says(m, "document.unread.pages", { pages: "7–9" }));
  assert.ok(m.querySelector('[data-changed="true"]'), "a newer version marked changed");
  const cites = section(p, "screen.document.backlinks.head");
  assert.ok(cites.querySelector(`a.cs-ref[href="/app/question/${Q}"]`) && cites.querySelector(`a.cs-ref[href="/app/project/${P}"]`));
  assert.ok(says(cites, "screen.document.backlinks.hidden"));
  assert.ok(section(p, "screen.document.people.head").textContent.includes("L. Chen, Director of Public Works"));
  assert.deepEqual(rawKeys(p.root()), []);
});

test("R32 control: a capture graded B draws B; one no read grades draws no grade mark at all, never Unrated", async () => {
  const p = await open(at, { plane: { heldcaptures: ok({ ok: true, rows: [] }) } });
  assert.equal(main(p).querySelector(".mk-facts .cs-grade"), null);
  assert.equal(main(p).querySelector(".mk-facts .cs-gap"), null);
});

test("R32 R39 the title is the document's, never the address's last segment or its id", async () => {
  const slug = DOCUMENT_MD.replace(/^title: .*$/m, "title: \"ai-4-12.pdf\"");
  const p = await open(at, { images: { [D]: { "bundle.md": slug } } });
  assert.ok(main(p).querySelector("h1").textContent.startsWith(lead("state.undetermined")));
  for (const h of main(p).querySelectorAll("h1, h2")) assert.doesNotMatch(h.textContent, /INFO-|ai-4-12/);
});

test("R32 a testimony offers Find in as a link and its words, and neither Watch for changes nor Check for a new version", async () => {
  const p = await open(at, { images: { [D]: { "bundle.md": TESTIMONY_MD } } });
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

test("R32 a newer version's notice is adopted with her reason, or kept", async () => {
  const p = await open(at, { plane: { reevaluationnotices: (r) => ok({ ok: true, notices: r.query.holder === Q ? [{ id: "REN-1", capture_sha: SHA, newer_capture: "9".repeat(64) }] : [] }),
    adoptversion: ok({ ok: true }), keepversion: ok({ ok: true }) } });
  const s = section(p, "screen.document.versions.head");
  assert.deepEqual(actsIn(s).sort(), ["adoptversion", "keepversion"]);
  fill(p, { "document-version-why-REN-1": "the newer one adds the supervisor" });
  await press(p, "adoptversion");
  assert.deepEqual(p.byOp("adoptversion")[0].body, { notice: "REN-1", why: "the newer one adds the supervisor" });
  await press(p, "keepversion");
  assert.equal(p.byOp("keepversion")[0].body.notice, "REN-1");
});

test("R32 the links this page carries, held ones a reference, outward ones a link; the names it holds with the mention that counts; explore", async () => {
  const links = ok({ ok: true, links: [{ address: "https://example.org/311", chrome: false }, { address: "https://example.org/report.pdf", target_bundle: "INFO-2026-0011", target_retrieved: "2026-10-02T09:00:00Z" }] });
  const conns = ok({ ok: true, connections: [{ a_capture_sha: SHA, b_capture_sha: "8".repeat(64), entity_id: "ENT-17", entity_name: "L. Chen",
    on_point: { a: { ref: "c1", occurrence: { page: 1 }, chosen_by: "record" }, b: null }, occurrences: 4 }] });
  const p = await open(at, { plane: { links, connections: conns, connectionchoose: ok({ ok: true }) } });
  const l = section(p, "document.links.title");
  assert.ok(says(l, "document.links.says", { n: "2", held: "1" }));
  assert.equal(l.querySelector('a[data-outward="1"]').getAttribute("href"), "https://example.org/311");
  assert.ok(l.querySelector('a.cs-ref[href="/app/document/INFO-2026-0011"]'));
  const n = section(p, "document.names.title");
  assert.ok(says(n, "document.names.row", { n: "4", page: "1", chosen: word("document.names.chosen.record") }));
  await press(p, "connectionchoose");
  assert.deepEqual(p.byOp("connectionchoose")[0].body, { capture: SHA, other: "8".repeat(64), entity: "ENT-17", ref: "c1" });
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
  assert.ok(says(main(p), "screen.document.pagetranscribe.done", { pages: "7, 8" }) && says(main(p), "ai.label.untested"));
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
  await press(p, "retire");
  const dlg = p.root().querySelector('[role="dialog"]');
  dlg.querySelector("textarea").value = "superseded";
  await p.click(dlg.querySelector('[data-shell="confirm"]'));
  await p.settle();
  assert.deepEqual([p.byOp("retire")[0].query.handle, p.byOp("retire")[0].query.reason], ["SEL-9", "superseded"]);
  assert.ok(main(p).querySelector('[data-outcome="retire"]').textContent.includes("This copy is cited by a question"));
});

test("R3 controls: a release, a transcription and a claim with nothing written are refused by their words; no question to cite in, no cite", async () => {
  const p = await open(at);
  assert.ok(says(await press(p, "release"), "screen.document.release.empty"));
  assert.ok(says(await press(p, "transcribe"), "screen.document.unread.empty"));
  assert.ok(says(await press(p, "identityclaim"), "screen.document.claim.empty"));
  assert.equal(p.byOp("select").length + p.byOp("transcribe").length + p.byOp("identityclaim").length, 0);
  const noq = await open(at, { plane: { list: ok({ bundles: [] }) } });
  assert.ok(!actsIn(main(noq)).includes("cite"));
  assert.ok(says(main(noq), "screen.document.cite.noquestion"));
});

test("R15 Watch for changes sends monitorset and Check for a new version now sends monitor: two acts, each alone", async () => {
  const p = await open(at, { plane: { monitorset: ok({ ok: true, bundleId: D, enabled: true }), monitor: ok({ ok: true }) } });
  const b = (op) => main(p).querySelector(`button[data-act="${op}"]`);
  assert.ok(says(b("monitorset"), "act.monitorset.label.document") && says(b("monitor"), "act.monitor.label.document"));
  await press(p, "monitorset", { reason: "the policy changes yearly" });
  assert.deepEqual(p.byOp("monitorset").map((r) => [r.body.bundleId, r.body.enabled]), [[D, true]]);
  assert.equal(p.byOp("monitor").length, 0, "watching checks nothing now");
  assert.ok(says(main(p).querySelector('[data-outcome="monitorset"]'), "screen.document.monitorset.done"));
  await press(p, "monitor");
  assert.deepEqual(p.byOp("monitor").map((r) => r.body), [{ bundleId: D }]);
  assert.equal(p.byOp("monitorset").length, 1, "checking now asks no watching");
});

test("R8 the question a passage is cited in, and an unread page, are choices among record data", async () => {
  const p = await open(at, { plane: { list: ok({ bundles: [{ bundle_id: Q, title: "screen.document.copy" }] }) } });
  const opts = (id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => [o.getAttribute("value"), o.textContent]);
  assert.deepEqual(opts("document-cite-question"), [[Q, "screen.document.copy"]], "a title is drawn as data, never read as a key");
  assert.deepEqual(opts("document-unread-page"), [["7", "7"], ["8", "8"], ["9", "9"]]);
});

test("R22 control: a document with no capture digest draws no Open the original link, and none opens by its bundle id", async () => {
  const p = await open(at, { plane: { image: (r) => ok(r.query.id === D ? { "bundle.md": DOCUMENT_MD_NO_HASH } : null) } });
  assert.equal(main(p).querySelectorAll('a[href^="/app/open-file/"]').length, 0);
  assert.ok(!says(main(p), "screen.document.open"));
});
