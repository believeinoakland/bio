/* screens-inquiry fix round 2 of T51 (SCREENS-INQUIRY #18, package A), the `document` screen: C31 (R125, R3: the cite act sends a body and marks the
 * passage), C33 (R123, R55, R113: retire's refusals in their own sentences; a held copy is set aside, not retired), C40 (R55: one act obtains both
 * confirmations), C42 (R124, R69: a move of citations only where it can be done), C95 (R3: the cite picker), C94 (interface-shell R111: members by
 * handle), C17 (R96: "read N of M words"), DEC-394 (3d, 3e: R126 `resolvetestify`, R127 `contradictionflag`), C41 (R117, R35, R50: the unplaced legs).
 * On interface-shell's served page over a scripted plane; the shell's guard checks every request against its owner's declaration. Every expectation
 * is a word read by key (K3810); no test holds a sentence's English. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { hasWord } from "../../../src/setup-words/index.mjs";
import { ok, refusedIn, boot } from "../interface-shell/harness.mjs";
import { main, actsIn, fill, press, says, section, word, plane, READING, DOCUMENT_MD, provenanceOf, inquiryMd, INQUIRY_REFS, SCREENS, P, Q, Q2, D, SHA, NEWER } from "./fixtures.mjs";

process.env.TZ = "UTC";
const at = "/app/document/" + D;
const text = (el) => String(el && el.textContent || "");
async function openWith(path, o = {}) {
  const p = await boot({ screens: SCREENS, plane: plane(o), path, ...(o.boot || {}) });
  await p.settle();
  return p;
}
/** A choice changed as a member does it: the value set and the change fired (the kit's choice that redraws, interface-shell R90). */
async function choose(p, id, value) {
  const el = p.doc.getElementById(id);
  el.value = value;
  p.fire(el, "change");
  await p.settle();
}

/* ---- C31 / R125 / R3: the cite act sends a body and marks the passage ---- */
const LEG_ON_PAGE_3 = [{ target: D, role: "supports", grade: "B", extent_kind: "pdf-page", extent_page: 2 }];
const REF = `${D}#x`;
/** The plane where the question's bundle gains its leg once `cite` has answered (the page reads the question's image again). */
function citingPlane() {
  const base = plane();
  const state = { cited: false };
  return { state, plane: {
    image: (r) => (r.query.id === Q ? ok({ "bundle.md": inquiryMd(P, INQUIRY_REFS, { legs: state.cited ? LEG_ON_PAGE_3 : [] }) }) : base.image(r)),
    cite: () => { state.cited = true; return ok({ ok: true, inquiry: Q, role: "supports", cited: [REF], alreadyCited: [] }); } } };
}

test("R125 R3 C31 the cite act sends the project, role and passage in the request body and none of them in the address", async () => {
  const { plane: pl } = citingPlane();
  const p = await openWith(at, { plane: pl });
  await choose(p, "document-cite-question", Q);
  fill(p, { "document-cite-role": "cuts_against" });
  await press(p, "cite");
  const r = p.byOp("cite")[0];
  const found = typeof r.body.found === "string" ? JSON.parse(r.body.found) : r.body.found;
  assert.deepEqual([r.body.project, r.body.role, found], [Q, "cuts_against", { capture_sha: SHA, extent: { kind: "pdf-page", page: 2 }, kind: "passage" }], "the body carries the three fields");
  for (const f of ["project", "role", "found"]) assert.ok(!(f in r.query), `control: ${f} is not in the address`);
});

test("R125 R3 C31 once cited, the passage is marked on the reading as cited by this question; control: a passage not cited, and a reading before any cite, draw no mark", async () => {
  const { plane: pl } = citingPlane();
  const p = await openWith(at, { plane: pl });
  assert.equal(main(p).querySelector("[data-passage-cited]"), null, "control: nothing cited, no mark");
  await choose(p, "document-cite-question", Q);
  assert.equal(main(p).querySelector("[data-passage-cited]"), null, "control: the question chosen, the passage not cited in it, no mark");
  await press(p, "cite");
  const mark = main(p).querySelector("[data-passage-cited]");
  assert.ok(mark, "the passage cited is marked");
  assert.equal(mark.getAttribute("data-passage-cited"), Q, "as cited by this question");
  assert.ok(says(mark, "screen.finder.cite.cited") && mark.querySelector(`a.cs-ref[href="/app/question/${Q}"]`), "by its key, with the question as a reference");
  /* the passage on the next page (page 4) was not cited: control */
  const next = p.doc.getElementById("document-read-page").querySelectorAll("label").find((l) => l.textContent.includes(word("document.read.next"))).querySelector("input");
  next.checked = true; p.fire(next, "change"); await p.settle();
  assert.equal(main(p).querySelector("[data-passage-cited]"), null, "control: the other passage draws none");
  /* a question that holds a leg on this document at that passage is marked without a cite at all (the question the copy was held for) */
  const held = await openWith(at, { images: { [Q]: { "bundle.md": inquiryMd(P, INQUIRY_REFS, { legs: LEG_ON_PAGE_3 }) } },
    plane: { heldcaptures: ok({ ok: true, held: [{ bundle_id: D, capture: { sha256: SHA }, captured_for: { questions: [{ question: Q, title: "Seven days?" }] } }] }) } });
  assert.equal(held.doc.getElementById("document-cite-question").value, Q);
  assert.equal(main(held).querySelector("[data-passage-cited]").getAttribute("data-passage-cited"), Q, "the question already holding a leg there marks the passage");
});

/* ---- C33 / R123 / R55 / R113: retire, and a held copy ---- */
const HELD_ROW = { bundle_id: D, title: "Pothole repair policy", project: P, collected_since: "2026-10-02T09:00:00Z", capture: { sha256: SHA, grade: { grade: "B" } },
  captured_for: { questions: [{ question: Q, title: "Seven days?", asker: "mai" }], withheld: null } };
const HELD = ok({ ok: true, held: [HELD_ROW] });
const dialog = (p) => p.root().querySelector('[role="dialog"]');
const slotOf = (p, op) => p.root().querySelector(`[data-slot="${p.root().querySelector(`button[data-act="${op}"]`).getAttribute("data-ai")}"]`);
/** Retire pressed and confirmed with a reason; the slot beside the act, where the answer is drawn. */
async function retireIt(p) {
  await press(p, "retire");
  const slot = slotOf(p, "retire");
  dialog(p).querySelector("textarea").value = "the scan is of the wrong report";
  await p.click(dialog(p).querySelector('[data-shell="confirm"]'));
  await p.settle();
  return slot;
}
const SELECT = { select: (r) => ok({ ok: true, handle: "SEL-9", items: r.body.ids }) };

test("R123 R55 R113 C33 a held copy offers no retire; control: a vouched copy offers it, as does a copy of no held row", async () => {
  const held = await openWith(at, { plane: { heldcaptures: HELD } });
  assert.ok(main(held).querySelector("[data-held]"), "the copy is held");
  assert.ok(!actsIn(main(held)).includes("retire"), "a held copy offers no retire");
  assert.equal(main(held).querySelector('[data-fold="retire"]'), null, "nor the fold that holds it");
  assert.ok(!actsIn(main(held)).includes("heldsetaside"), "and draws no set-aside act of its own");
  const door = main(held).querySelector("a[data-held-door]");
  assert.ok(door && door.getAttribute("href") === "/app/held" && door.hasAttribute("data-nav") && says(door, "screen.held.name"), "but a door to the Held screen, where it is set aside");
  const vouched = await openWith(at, { plane: { heldcaptures: HELD, ...SELECT, release: ok({ ok: true, released: [D] }) } });
  fill(vouched, { "document-release-ack": "Checked", "document-release-mitigation": "None needed" });
  await press(vouched, "release");
  assert.ok(main(vouched).querySelector("[data-vouched]"), "vouched for");
  assert.ok(actsIn(main(vouched)).includes("retire"), "control: a vouched copy offers retire");
  assert.equal(main(vouched).querySelector("a[data-held-door]"), null, "control: a vouched copy draws no door");
  const plain = await openWith(at);
  assert.ok(actsIn(main(plain)).includes("retire"), "control: a copy that is no held row of hers offers retire");
});

const TWO_CITERS = { backlinks: ok({ ok: true, target: D, backlinks: [{ from: Q, from_type: "inquiry", from_title: "Seven days?", rel: "cites" },
  { from: Q2, from_type: "inquiry", from_title: "Does closed mean repaired?", rel: "cites" }] }) };
const cited = (extra = {}) => ({ status: 200, json: { ok: true, result: { ok: false, reason: "CITED", code: "CITED", translation: "This copy is cited.", offenders: [{ id: D, citedBy: [Q, Q2] }], ...extra } } });

test("R123 R113 C33 retire answered CITED draws the questions that cite the copy as references and not the release act's sentence", async () => {
  const p = await openWith(at, { plane: { ...SELECT, ...TWO_CITERS, retire: cited() } });
  const slot = await retireIt(p);
  const refs = slot.querySelectorAll("a.cs-ref");
  assert.deepEqual(refs.map((a) => a.getAttribute("href")), ["/app/question/" + Q, "/app/question/" + Q2], "both questions, each a door to its page");
  assert.deepEqual(refs.map(text), ["Seven days?", "Does closed mean repaired?"], "named by their titles");
  assert.ok(!says(slot, "refusal.ILLEGAL_TRANSITION"), "never the release act's sentence");
  assert.ok(text(slot).includes(word("screen.document.retire.refused.cited", { questions: "" }).split("{")[0].trim().slice(0, 20)), "the cited sentence is drawn by its key");
  /* control: without the refusal's own list the page's questions that cite the copy are drawn */
  const q = await openWith(at, { plane: { ...SELECT, ...TWO_CITERS, retire: cited({ offenders: undefined }) } });
  const slot2 = await retireIt(q);
  assert.equal(slot2.querySelectorAll("a.cs-ref").length, 2, "from the page's own backlinks");
});

test("R123 R113 C33 retire answered ILLEGAL_TRANSITION does not draw the release act's sentence", async () => {
  const illegal = { status: 200, json: { ok: true, result: { ok: false, reason: "ILLEGAL_TRANSITION", code: "ILLEGAL_TRANSITION", translation: word("refusal.ILLEGAL_TRANSITION"), to: "retired" } } };
  const p = await openWith(at, { plane: { ...SELECT, retire: illegal } });
  const slot = await retireIt(p);
  assert.ok(!says(slot, "refusal.ILLEGAL_TRANSITION") && !text(slot).includes(word("refusal.ILLEGAL_TRANSITION")), "not the release sentence");
  assert.ok(says(slot, "screen.document.retire.refused.illegal"), "its own sentence, by key");
  assert.equal(p.byOp("retire").length, 1, "the retire was sent");
  /* control: a vouched, uncited copy retires as before */
  const state = { retired: false };
  const base = plane();
  const RETIRED_MD = DOCUMENT_MD.replace("\nsource:", "\ncurrent_state: retired\nsource:");
  const ok2 = await openWith(at, { plane: { ...SELECT, image: (r) => (r.query.id === D && state.retired ? ok({ "bundle.md": RETIRED_MD, "data/provenance.json": provenanceOf(SHA) }) : base.image(r)),
    retire: () => { state.retired = true; return ok({ ok: true, retired: [D] }); } } });
  await retireIt(ok2);
  assert.ok(main(ok2).querySelector("[data-retired]"), "control: retired as before");
});

/* ---- C40 / R55: one act obtains both confirmations ---- */
const TOKEN = { file: "snapshots/timestamp-abc.tsr", kind: "rfc3161", service: "tsa", sha256: "a".repeat(64), bytes: 10, over: SHA };
const attestAnswer = (o) => ({ status: 200, json: { ok: true, result: { attempts: [], ...o } } });
async function attestIt(p) {
  await press(p, "attest");
  const slot = slotOf(p, "attest");
  await p.click(p.root().querySelector('[data-shell="confirm"]'));
  await p.settle();
  return slot;
}
const WEB = DOCUMENT_MD;
const HTTP_MD = DOCUMENT_MD.replace("https://example.org/ai-4-12.pdf", "http://example.org/ai-4-12.pdf");
const TESTIMONY_MD = ["---", `id: ${D}`, "object_type: information", "title: \"The pothole at 4th and Main\"", `project: ${P}`, "source:", "  locator: \"a member's firsthand observation, authored in this record\"",
  "  retrieved: 2026-10-04T09:00:00Z", "---", "", "## Provenance Notes", "", "Authored through op=testify.", ""].join("\n");
const withMd = (md) => ({ images: { [D]: { "bundle.md": md, "data/provenance.json": provenanceOf(SHA) } } });

test("R55 C40 attest sends the digest, the archive request and the document's public https address; a testimony, an http address and a local host send neither", async () => {
  const p = await openWith(at, { plane: { attest: attestAnswer({ ok: true, attestation: TOKEN, archive: { service: "a", locator: "https://archive.example/1" } }) } });
  await attestIt(p);
  assert.deepEqual(p.byOp("attest")[0].body, { sha256: SHA, archive: true, locator: "https://example.org/ai-4-12.pdf" });
  for (const md of [HTTP_MD, TESTIMONY_MD, WEB.replace("https://example.org/", "https://localhost/"), WEB.replace("https://example.org/", "https://10.0.0.5/")]) {
    const q = await openWith(at, { ...withMd(md), plane: { attest: attestAnswer({ ok: true, attestation: TOKEN }) } });
    await attestIt(q);
    assert.deepEqual(q.byOp("attest")[0].body, { sha256: SHA }, "control: no archive asked for an address that is not public https");
  }
});

test("R55 C40 attest says which of the two is still missing, in words that exist; both obtained says done only; neither is refused as before", async () => {
  const both = await openWith(at, { plane: { attest: attestAnswer({ ok: true, attestation: TOKEN, archive: { service: "a", locator: "https://archive.example/1" } }) } });
  const s1 = await attestIt(both);
  const outcome = (p) => text(main(p).querySelector('[data-outcome="attest"]'));
  assert.ok(says(main(both), "screen.document.attest.done") && !outcome(both).includes(word("filings.trusted_timestamp_archive")), "both: done only");
  const noArchive = await openWith(at, { plane: { attest: attestAnswer({ ok: true, attestation: TOKEN }) } });
  await attestIt(noArchive);
  assert.ok(says(main(noArchive).querySelector('[data-outcome="attest"]'), "filings.trusted_timestamp_archive"), "a timestamp and no co-archive");
  assert.ok(!says(main(noArchive).querySelector('[data-outcome="attest"]'), "screen.document.attest.done"));
  const noStamp = await openWith(at, { plane: { attest: { status: 200, json: { ok: true, result: { ok: false, reason: "NO_ATTESTATION", code: "NO_ATTESTATION", attempts: [], archive: { service: "a", locator: "https://archive.example/1" } } } } } });
  const s3 = await attestIt(noStamp);
  assert.ok(says(slotOf(noStamp, "attest"), "filings.archive_trusted_timestamp"), "a co-archive and no trusted timestamp");
  const neither = await openWith(at, { plane: { attest: { status: 200, json: { ok: true, result: { ok: false, reason: "NO_ATTESTATION", code: "NO_ATTESTATION", translation: "No authority answered.", attempts: [] } } } } });
  const s4 = await attestIt(neither);
  assert.ok(!says(s4, "filings.archive_trusted_timestamp") && !says(s4, "filings.trusted_timestamp_archive") && !says(main(neither), "screen.document.attest.done"), "neither: the refusal as before");
  assert.ok(text(s4).includes("No authority answered.") || says(s4, "refusal.NO_ATTESTATION"));
  void s1; void s3;
});

/* ---- C42 / R124 / R69: a move of citations only where it can be done ---- */
const NOTICE = (newer = NEWER) => (r) => ok({ ok: true, notices: r.query.holder === Q ? [{ notice: "REN-1", id: "REN-1", holder: Q, target: D, state: "open", capture_sha: SHA, newer_capture: newer, affects: "unaffected" }] : [] });
const CHAIN = (shas) => ok({ ok: true, at_index: 0, versions: shas.map((s, i) => ({ capture_sha: s, first_retrieved: `2026-10-0${i + 2}T09:00:00Z` })) });
const legRow = (p) => main(p).querySelector(`[data-leg-row="${Q}"]`);

test("R124 R69 C42 a newer copy with a chain offers Move my citations; one nothing was captured for, or one with no text, offers none and says what is missing", async () => {
  const withChain = await openWith(at, { plane: { reevaluationnotices: NOTICE(), versionchain: CHAIN([SHA, NEWER]) } });
  assert.deepEqual(actsIn(legRow(withChain)).sort(), ["adoptversion", "keepversion"], "captured, with a reading chain: both acts");
  assert.equal(withChain.byOp("reading").filter((r) => r.query.sha256 === NEWER).length, 1, "the newer copy's reading is read");
  const observed = await openWith(at, { plane: { reevaluationnotices: NOTICE(), versionchain: CHAIN([SHA]) } });
  assert.deepEqual(actsIn(legRow(observed)), ["keepversion"], "a change observed, nothing captured: no move");
  assert.ok(!says(legRow(observed), "refusal.CONTENT_EXTENT_NO_CHAIN"), "and no chain is claimed missing for a copy that was never captured");
  const noText = await openWith(at, { plane: { reevaluationnotices: NOTICE(), versionchain: CHAIN([SHA, NEWER]),
    reading: (r) => ok(r.query.sha256 === NEWER ? READING({ text_units: [], unread_pages: [] }) : READING()) } });
  assert.deepEqual(actsIn(legRow(noText)), ["keepversion"], "captured but no text: no move");
  assert.ok(says(legRow(noText), "refusal.CONTENT_EXTENT_NO_CHAIN"), "and it says what is missing");
  const none = await openWith(at, { plane: { reevaluationnotices: ok({ ok: true, notices: [] }), versionchain: CHAIN([SHA, NEWER]) } });
  assert.deepEqual(actsIn(legRow(none)), ["versionnotice"], "control: no newer copy offers neither act");
});

/* ---- C95 / R3: the cite picker: this project first, a search box, title and date ---- */
const MANY = Array.from({ length: 30 }, (_, i) => ({ bundle_id: `INQ-2026-01${String(i).padStart(2, "0")}-x`, title: `${i % 3 === 0 ? "Budget" : "Lease"} question ${i}`, created: "2026-09-15T10:00:00Z" }));
const MANY_LIST = ok({ bundles: [...MANY, { bundle_id: Q, title: "Is the city repairing reported potholes within seven days?", created: "2026-10-03T10:00:00Z" }, { bundle_id: Q2, title: "Does closed mean repaired?" }] });
const pickerValues = (p) => p.doc.getElementById("document-cite-question").querySelectorAll("option").map((o) => o.getAttribute("value"));
async function typeSearch(p, value) {
  const el = p.doc.getElementById("document-cite-search");
  el.value = value;
  p.fire(el, "input");
  await p.clock.tick(600);
  await p.settle();
}

test("R3 C95 the cite picker has a search box: typing a word narrows the questions to the titles holding it, this project's first; the question chosen is kept; each carries its date", async () => {
  const p = await openWith(at, { plane: { list: MANY_LIST } });
  const all = pickerValues(p);
  assert.equal(all.length, 1 + 32, "control: nothing typed lists every question after the choose option");
  assert.deepEqual(all.slice(1, 3), [Q, Q2], "control: this project's own questions first");
  await typeSearch(p, "BUDGET");
  const some = pickerValues(p);
  assert.equal(some.filter((v) => v && v !== Q && v !== Q2).length, 10, "the ten Budget titles, whatever the case typed");
  assert.ok(!some.includes(Q) && !some.includes(Q2), "this project's questions that do not match are gone");
  assert.ok(some.slice(1).every((v) => MANY.find((m) => m.bundle_id === v).title.startsWith("Budget")));
  /* a question chosen stays whatever is typed */
  await typeSearch(p, "");
  await choose(p, "document-cite-question", Q);
  await typeSearch(p, "lease");
  assert.ok(pickerValues(p).includes(Q), "the chosen question is kept though the search hides it");
  assert.equal(p.doc.getElementById("document-cite-question").value, Q);
  /* title and date */
  const opt = p.doc.getElementById("document-cite-question").querySelectorAll("option").find((o) => o.getAttribute("value") === Q);
  assert.ok(text(opt).includes("Is the city repairing") && text(opt).includes(word("date.daymonthyear", { day: "3", month: word("date.month.october"), year: "2026" })), "title and date in the option");
});

/* ---- C94 / interface-shell R111: members named by handle ---- */
const ROSTER = ok({ ok: true, members: [{ member_id: "admin", handle: "sparky" }, { member_id: "m-77", handle: "rosa" }] });
const ORIGINS = ok({ ok: true, bundleId: D, origins: [
  { seq: 1, system: "Portal", by: "admin", at: "2026-10-01T09:00:00Z" }, { seq: 2, system: "Email", by: "member:m-77", at: "2026-10-02T09:00:00Z" }, { seq: 3, system: "Paper", by: "m-99", at: "2026-10-03T09:00:00Z" }] });

test("C94 R111 a member the record names is drawn by her handle, the founder's id included, never by the id; an id with no handle known draws the plain word", async () => {
  const p = await openWith(at, { plane: { memberlist: ROSTER, origins: ORIGINS } });
  const rows = section(p, "screen.document.origin.head").querySelectorAll("[data-origin]");
  assert.ok(text(rows[0]).includes("sparky") && text(rows[1]).includes("rosa"), "each one's handle");
  assert.ok(text(rows[2]).includes(word("shell.card.member")), "an unknown id draws the plain word");
  const all = text(main(p));
  for (const id of ["admin", "m-77", "m-99"]) assert.ok(!all.includes(id), `never the id ${id}`);
  /* control: no roster answers; the founder is the unnamed founder and the others the plain word */
  const none = await openWith(at, { plane: { memberlist: ok({ ok: true, members: [] }), origins: ORIGINS } });
  const r2 = section(none, "screen.document.origin.head").querySelectorAll("[data-origin]");
  assert.ok(text(r2[0]).includes(word("member.founder.unnamed")) && text(r2[1]).includes(word("shell.card.member")), "control: no handle known draws the fallback word");
});

/* ---- C17 / R96: "read N of M words" ---- */
test("R96 R3 C17 a reading that counts its words draws Read N of M words beside the text state; one that does not draws none", async () => {
  const p = await openWith(at, { plane: { reading: ok(READING({ words_read: 80, words_total: 100, unread_pages: [] })) } });
  const facts = main(p).querySelector(".mk-facts");
  assert.ok(says(facts, "screen.document.text.read", { read: "80", total: "100" }), "beside the text state, in the facts row");
  assert.ok(facts.querySelector("[data-text-state]"), "the state itself is still drawn");
  const none = await openWith(at);
  assert.equal(main(none).querySelector("[data-words-read]"), null);
});

/* ---- C41 / R117 / R35 / R50: the unplaced legs ---- */
const LEG_A = "INFO-2026-0005", LEG_B = "INFO-2026-0006", LEG_C = "INFO-2026-0007";
const docMd = (id, title) => ["---", `id: ${id}`, "object_type: information", `title: ${JSON.stringify(title)}`, "---", "", "## Summary", ""].join("\n");
const adoptRefused = (legs) => ({ status: 200, json: { ok: true, result: { ok: false, reason: "BASIS_VERSION_REFUSED", code: "BASIS_VERSION_REFUSED",
  findings: [{ check: "C-2.8", code: "VERSION_PARTITION_INCOMPLETE", detail: "a supporting leg has no ground", ...(legs ? { legs } : {}) }, { check: "C-9.9", detail: "second finding" }] } } });
const noticeOpen = (r) => ok({ ok: true, notices: r.query.holder === Q ? [{ id: "REN-1", state: "open", capture_sha: SHA, newer_capture: NEWER }] : [] });
async function adoptWith(legs) {
  const base = plane();
  const p = await openWith(at, { plane: { reevaluationnotices: noticeOpen, adoptversion: adoptRefused(legs),
    image: (r) => (r.query.id === LEG_A ? ok({ "bundle.md": docMd(LEG_A, "Work orders 2025") }) : r.query.id === LEG_B ? ok({ "bundle.md": docMd(LEG_B, "Crew log") }) : r.query.id === LEG_C ? ok(null) : base.image(r)) } });
  fill(p, { "document-version-why-REN-1": "the newer one adds the supervisor" });
  return text(await press(p, "adoptversion"));
}

test("R117 R35 R50 C41 a basis version refused for unplaced legs names each leg by its document's title, after the finding; a leg with no title draws the plain word once; control: a finding with no legs draws as before", async () => {
  const said = await adoptWith([LEG_A, LEG_B, LEG_C]);
  assert.ok(said.includes("a supporting leg has no ground") || said.includes(word("refusal.VERSION_PARTITION_INCOMPLETE")), "the first finding as before");
  assert.ok(said.includes("Work orders 2025") && said.includes("Crew log"), "both legs named by title");
  assert.equal(said.split(word("shell.card.document")).length - 1, 1, "the untitled leg draws the plain word once");
  assert.ok(!said.includes(LEG_A) && !said.includes(LEG_B) && !said.includes("second finding"), "never an id; the first finding only");
  const bare = await adoptWith(null);
  assert.ok(!bare.includes("Work orders 2025") && !bare.includes(word("shell.card.document")), "control: no legs, nothing added");
});

/* ---- DEC-394 (3d) R126: resolvetestify ---- */
const UNMATCHED = [{ ref: "name:director-chen", label: "Director Chen", page: 3 }, { ref: "name:the-department", label: "the Department", page: 5 }];
const NAMES_FOR_TESTIFY = (extra = {}) => ok({ ok: true, names: [{ entity_id: "ENT-17", label: "L. Chen, Director of Public Works", kind: "person", grade: "A", matched_by: "identifier", mentions: 1 }], resolutions: [], ...extra });
const testifyFold = (p) => main(p).querySelector('[data-fold="testify"]');

test("R126 DEC-394 resolvetestify: a name the record matched to no subject is listed with a field for who it is and how she knows; it sends the declared fields; no how, nothing is sent; control: no unmatched name, no fold", async () => {
  const p = await openWith(at, { plane: { resolutions: NAMES_FOR_TESTIFY({ unresolved: UNMATCHED }), resolvetestify: ok({ ok: true }) } });
  const fold = testifyFold(p);
  assert.ok(fold && says(fold, "screen.document.testify.head") && says(fold, "screen.document.testify.note3"), "the fold and its notes by key");
  const which = p.doc.getElementById("document-testify-which").querySelectorAll("option");
  assert.deepEqual(which.map((o) => o.getAttribute("value")), ["0", "1"], "each name the read gives, none preselected over the first");
  fill(p, { "document-testify-which": "1", "document-testify-who": "ENT-17" });
  assert.ok(says(await press(p, "resolvetestify"), "screen.document.testify.refused"), "no how: refused in place");
  assert.equal(p.byOp("resolvetestify").length, 0, "nothing sent");
  fill(p, { "document-testify-how": "I was at the meeting." });
  await press(p, "resolvetestify");
  assert.deepEqual(p.byOp("resolvetestify")[0].body, { captureSha: SHA, ref: "name:the-department", entityId: "ENT-17", basis: "I was at the meeting." });
  const none = await openWith(at, { plane: { resolutions: NAMES_FOR_TESTIFY() } });
  assert.equal(testifyFold(none), null, "control: the read gives no unmatched name, so no form");
  assert.ok(!actsIn(main(none)).includes("resolvetestify"));
});

/* ---- DEC-394 (3e) R127: contradictionflag ---- */
const OTHER = "INFO-2026-0011", OTHER_SHA = "5".repeat(64);
const FLAG_PLANE = (extra = {}) => {
  const base = plane();
  return { list: (r) => (r.query.type === "information" ? ok({ bundles: [{ bundle_id: D, object_type: "information", title: "This one" }, { bundle_id: OTHER, object_type: "information", title: "Rent notice, October 2026" }] }) : ok({ bundles: [] })),
    image: (r) => (r.query.id === OTHER ? ok({ "bundle.md": ["---", `id: ${OTHER}`, "object_type: information", "title: \"Rent notice, October 2026\"", "---", "", ""].join("\n"), "data/provenance.json": provenanceOf(OTHER_SHA) }) : base.image(r)),
    reading: (r) => ok(r.query.sha256 === OTHER_SHA ? READING({ capture_sha: OTHER_SHA, text_units: [{ seq: 1, extent: { kind: "pdf-page", page: 0 }, text: "The rent rises on November 1." }], unread_pages: [] }) : READING()),
    contradictionflag: ok({ ok: true, wrote: true, candidate: "c1" }), ...extra };
};
const flagFold = (p) => main(p).querySelector('[data-fold="contradict"]');

test("R127 DEC-394 contradictionflag: a passage here and a passage in another document are chosen with how they disagree; it sends the declared fields; refusals by key; control: no other document, no fold", async () => {
  const p = await openWith(at, { plane: FLAG_PLANE() });
  const fold = flagFold(p);
  assert.ok(fold && says(fold, "screen.document.contradict.head") && says(fold, "screen.document.contradict.note1"), "the fold and its note by key");
  assert.ok(says(await press(p, "contradictionflag"), "refusal.FLAG_NO_PASSAGE"), "no passage chosen: refused by its key, nothing sent");
  await choose(p, "document-flag-other", OTHER);
  assert.equal(p.byOp("reading").filter((r) => r.query.sha256 === OTHER_SHA).length, 1, "the other document's passages are read");
  fill(p, { "document-flag-here": "0", "document-flag-there": "0" });
  assert.ok(says(await press(p, "contradictionflag"), "refusal.FLAG_NO_REASON"), "no reason: refused by its key");
  assert.equal(p.byOp("contradictionflag").length, 0);
  fill(p, { "document-flag-why": "One says November, the other December." });
  await press(p, "contradictionflag");
  assert.deepEqual(p.byOp("contradictionflag")[0].body, { here: { capture: SHA, extent: { kind: "pdf-page", page: 2 } }, other: { capture: OTHER_SHA, extent: { kind: "pdf-page", page: 0 } }, reason: "One says November, the other December." });
  for (const code of ["FLAG_SAME_DOCUMENT", "FLAG_NO_PASSAGE"]) {
    const q = await openWith(at, { plane: FLAG_PLANE({ contradictionflag: refusedIn(code, "x") }) });
    await choose(q, "document-flag-other", OTHER);
    fill(q, { "document-flag-here": "0", "document-flag-there": "0", "document-flag-why": "x" });
    assert.ok(says(await press(q, "contradictionflag"), "refusal." + code), code);
  }
  const alone = await openWith(at);
  assert.equal(flagFold(alone), null, "control: no other document to set it beside, no fold");
});

test("R55 R123 capture R77 a held row that is not whole (whole: false) withholds the vouch box and the OCR re-read; whole: true and whole: null draw them", async () => {
  const row = (whole) => ok({ ok: true, held: [{ ...HELD_ROW, whole }] });
  const no = await openWith(at, { plane: { heldcaptures: row(false) } });
  assert.equal(main(no).querySelector("[data-held]"), null, "no vouch box on a copy that is not whole");
  for (const w of [true, null]) {
    const yes = await openWith(at, { plane: { heldcaptures: row(w) } });
    assert.ok(main(yes).querySelector("[data-held]"), "whole " + w + " draws the vouch box");
  }
});
