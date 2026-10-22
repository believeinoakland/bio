/* screens-inquiry fix round 4 (T51), the question screen: C36 aside (R24, R34: the lists that say what the answer rests on name each passage by the words it
 * cites), C14 (the screen's read set). On interface-shell's served page over a scripted plane; every expectation is a word read by key (R44), never copied (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../interface-shell/harness.mjs";
import { open, main, says, section, P, Q, D, SHA } from "./fixtures.mjs";

const at = "/app/question/" + Q;
const D2 = "INFO-2026-0005";
const D3 = "INFO-2026-0006";
const SHA2 = "7c1d" + "0".repeat(56) + "e002";
const SHA3 = "8d2e" + "0".repeat(56) + "e003";
const docImage = (id, sha, title) => ({ "bundle.md": ["---", `id: ${id}`, "object_type: information", `title: "${title}"`, `project: ${P}`, "---", ""].join("\n"),
  "data/provenance.json": JSON.stringify({ documents: [{ capture: { sha256: sha } }] }) });
const PDF_WORDS = "The Director shall repair each reported pothole within seven calendar days of the report.";
const WEB_WORDS = "Potholes reported through 311 are repaired within seven days.";
const unit = (seq, extent, text) => ({ seq, extent, reference: "u" + seq, truncated: false, text });
const UNITS = {
  [SHA]: [unit(0, { kind: "pdf-page", page: 0, rect: null }, PDF_WORDS)],
  [SHA2]: [unit(0, { kind: "doc-para", para: 2, run: null }, WEB_WORDS)],
  [SHA3]: [unit(0, { kind: "pdf-page", page: 0, rect: null }, "Page one of the audit.")],
};
const readingOf = (r) => ok({ ok: true, found: true, capture_sha: r.query.sha256, reading: { content_type: "application/pdf", found: true }, text_units: UNITS[r.query.sha256] || [], unread_pages: [] });
/* a partitioned question (state a): the policy and the web page hold each other up; the audit stands alone */
const md = (withExtents = true) => ["---", `id: ${Q}`, "object_type: inquiry", 'title: "Seven days"', "created: 2026-10-03T10:00:00Z", `project: ${P}`, "references:",
  ...[D, D2, D3].flatMap((t) => [`  - target: ${t}`, "    rel: cites", "    status: confirmed"]), "basis:",
  `  - target: ${D}`, "    role: supports", "    grade: B", "    ground: part 1", ...(withExtents ? ["    extent_kind: pdf-page", "    extent_page: 0"] : []),
  `  - target: ${D2}`, "    role: supports", "    grade: B", "    ground: part 1", ...(withExtents ? ["    extent_kind: doc-para", "    extent_para: 2"] : []),
  `  - target: ${D3}`, "    role: supports", "    grade: B", "    ground: part 2", ...(withExtents ? ["    extent_kind: pdf-page", "    extent_page: 0"] : []),
  "grounds:", "  - ground: part 1", "    asserted_by: member:dev", '    at: "2026-10-05T09:00:00Z"', "---", "", "## Question", "", "Is the city repairing reported potholes within seven days?", "", "## Session Log", ""].join("\n");
const plane = (withExtents = true) => ({ images: { [Q]: { "bundle.md": md(withExtents) }, [D]: docImage(D, SHA, "Policy memo 4.12"), [D2]: docImage(D2, SHA2, "A web page from www.oaklandca.gov"), [D3]: docImage(D3, SHA3, "The audit") },
  plane: { reading: readingOf, basisversions: ok({ ok: true, inquiry: Q, versions: [] }),
    partitionindependence: ok({ ok: true, inquiry: Q, independence: { checked: true, parts: 2, shared: [], complete: true } }) } });
const q = (s) => "“" + s + "”";

test("R24 R34 C36-aside 'Your answer fails if any one of these fails' and the part that holds together name each passage by the words it cites, not by its document and place alone; control: a leg that names no part of its document draws its title alone", async () => {
  const p = await open(at, plane());
  const rests = section(p, "question.rests.title");
  assert.ok(rests, "the read-back is drawn");
  assert.ok(rests.textContent.includes(q("Page one of the audit.")), "the single part, by the words of its page: " + rests.textContent);
  assert.ok(rests.textContent.includes("The audit \u00b7 Page 1 \u00b7 " + q("Page one of the audit.")), "and its document and place before them");
  assert.ok(says(rests, "question.rests.all", { passages: "Policy memo 4.12 · Page 1 · " + q(PDF_WORDS.length > 90 ? PDF_WORDS.slice(0, 90).replace(/\s+\S*$/, "") + "…" : PDF_WORDS)
    + ", A web page from www.oaklandca.gov · Paragraph 3 · " + q(WEB_WORDS) }), "the part held up together: both passages, each with its place and its words");
  /* under a passage, the others that hold it up are named by their words too */
  const supports = main(p).textContent;
  assert.ok(supports.includes(q(WEB_WORDS)), "the web passage's words");
  const bare = await open(at, plane(false));
  const r = section(bare, "question.rests.title");
  assert.ok(!r.textContent.includes(WEB_WORDS) && !r.textContent.includes("Page one of the audit."), "control: a leg naming no part draws no words");
  assert.ok(r.textContent.includes("The audit") && r.textContent.includes("A web page from www.oaklandca.gov"), "control: and still its title");
});

/* ---- C14 (R2, R24, R25): the screen's read set ---- */
const VERSION = (name, extra = {}) => ({ name, state: "accepted", author: "member:dev", moved: { by: "dev", at: "2026-10-06T09:00:00Z", reason: null }, grounds: [],
  legs: [{ ord: 1, target: D, role: "supports", grade: "B", target_title: "Policy memo 4.12" }], ...extra });
/** the ops asked for the same thing twice: `op` and its whole query, more than once */
const repeats = (p) => {
  const seen = new Map();
  for (const r of p.requests) { const k = r.op + " " + JSON.stringify(r.query || {}) + " " + JSON.stringify(r.body || null); seen.set(k, (seen.get(k) || 0) + 1); }
  return [...seen.entries()].filter(([, n]) => n > 1).map(([k]) => k);
};

test("R2 R24 R25 C14 the question reads what depends on the reading shown once the reading shown is settled: a project whose standing reading arrives after the first answer does not make the independence of the first reading and then of the second two reads; control: no read is asked twice for the same thing", async () => {
  let release;
  const gate = new Promise((r) => { release = r; });
  const versions = [VERSION("main"), VERSION("alt")];
  const base = plane();
  const p = await open(at, { ...base, plane: { ...base.plane,
    basisversions: async (r) => {
      if (r.query.project) { await gate; return ok({ ok: true, inquiry: Q, versions, current: { project: P, version: "alt", at: "2026-10-06T09:00:00Z", by: "dev" } }); }
      return ok({ ok: true, inquiry: Q, versions });
    } } });
  release();
  await p.settle();
  const ind = p.byOp("partitionindependence");
  assert.equal(ind.length, 1, "the independence is asked once, for the reading the project stands on: " + JSON.stringify(ind.map((r) => r.query)));
  assert.equal(ind[0].query.version, "alt");
  assert.deepEqual(repeats(p), [], "control: no read is made twice for the same thing");
});
