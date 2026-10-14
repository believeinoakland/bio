/* screens-inquiry's tests: the scripted plane behind each screen, over interface-shell's served page (its tests' harness,
 * `harness.mjs`, and document stand-in, `dom.mjs`; B8, K3007). Each fixture answers its screen's reads in their owners'
 * documented shapes; a test overrides any op. R44: no test holds a sentence's English; each expectation is a word read
 * through setup-words' `word(key, vars)` (`says`), so a word changed in `words.json` changes no test. */
import { word } from "../../../src/setup-words/index.mjs";
import { SCREENS } from "../../../src/screens-inquiry/index.mjs";
import { boot, ok, textNodes } from "../interface-shell/harness.mjs";

export { SCREENS, word };
export const P = "PROJ-2026-0007";
export const Q = "INQ-2026-0001-seven-days";
export const Q2 = "INQ-2026-0002-closed";
export const D = "INFO-2026-0004";
export const SHA = "3b9f" + "0".repeat(56) + "c210";
export const NEWER = "9".repeat(64);

const projectMd = (refs) => ["---", `id: ${P}`, "object_type: project", "title: \"Pothole repairs\"",
  "objective: \"Is the city repairing reported potholes as its own policy requires?\"", "references:",
  ...refs.flatMap(([t, rel, st]) => [`  - target: ${t}`, `    rel: ${rel}`, `    status: ${st}`]), "---", "", "## Summary", ""].join("\n");
export const PROJECT_MD = projectMd([[Q, "cites", "active"], [Q2, "cites", "confirmed"], ["INQ-2026-0003-gone", "cites", "severed"], ["INFO-2026-0009", "cites", "active"]]);
export const projectWith = (refs) => projectMd(refs);
/* the inquiry's own references: the policy cited live, the work orders severed with a reason, Mai's observation proposed
   (citation R15: a leg is live or severed as its reference is) */
export const INQUIRY_REFS = [[D, "cites", "confirmed", null], ["INFO-2026-0005", "cites", "severed", "\"Severed 2026-10-07T09:00:00Z: the wrong year's orders\""],
  ["INFO-2026-0006", "cites", "proposed", null]];
/* the inquiry's own legs (R34): two supporting, one cutting against; `ground` per leg when a partition is held */
export const LEGS = [{ target: D, role: "supports", grade: "B" }, { target: "INFO-2026-0005", role: "supports", grade: "B" },
  { target: "INFO-2026-0006", role: "cuts_against", grade: "D", grade_axis: "testimony" }];
export const inquiryMd = (project = P, refs = INQUIRY_REFS, o = {}) => ["---", `id: ${Q}`, "object_type: inquiry", "title: \"Seven days\"", "created: 2026-10-03T10:00:00Z",
  ...(project ? [`project: ${project}`] : []), ...(refs.length ? ["references:"] : ["references: []"]),
  ...refs.flatMap(([t, rel, st, note]) => [`  - target: ${t}`, `    rel: ${rel}`, `    status: ${st}`, ...(note ? [`    note: ${note}`] : [])]),
  ...((o.legs || LEGS).length ? ["basis:", ...(o.legs || LEGS).flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role}`,
    ...(l.grade ? [`    grade: ${l.grade}`] : []), ...(l.grade_axis ? [`    grade_axis: ${l.grade_axis}`] : []), ...(l.ground ? [`    ground: ${l.ground}`] : [])])] : []),
  ...(o.grounds ? ["grounds:", ...o.grounds.flatMap((g) => [`  - ground: ${g.ground}`, `    asserted_by: ${g.asserted_by}`, `    at: "${g.at}"`])] : []),
  "---", "", "## Question", "", "Is the city repairing reported potholes within seven days?", "", "## What It Rests On", "",
  "## Session Log", "", ...(o.log || []), "## Review Notes", ""].join("\n");
export const DOCUMENT_MD = ["---", `id: ${D}`, "object_type: information", "title: \"Pothole repair policy, Administrative Instruction 4.12\"",
  `content_hash: sha256:${SHA}`, `project: ${P}`, "source:", "  locator: https://example.org/ai-4-12.pdf", "  authority: Public Works",
  "  retrieved: 2026-10-02T09:00:00Z", "---", "", "## Summary", ""].join("\n");

export const BASIS = (extra = {}) => ({ ok: true, inquiry: Q, versions: [{ name: "main", state: "accepted", author: "member:dev",
  moved: { by: "dev", at: "2026-10-06T09:00:00Z", reason: null }, grounds: [], legs: [
  { ord: 1, target: D, role: "supports", grade: "B", words: "within seven calendar days of the report", target_title: "Administrative Instruction 4.12" },
  { ord: 2, target: "INFO-2026-0005", role: "supports", grade: "B", status: "severed", target_title: "Work orders" },
  { ord: 3, target: "INFO-2026-0006", role: "cuts_against", grade: "D", scale: "testimony", words: "still open, about 60 cm across", target_title: "Mai's observation" }] }],
  ...extra });
export const READING = (o = {}) => ({ ok: true, found: true, capture_sha: SHA, reading: {
  passages: [{ text: "3. The Director shall repair each reported pothole within seven calendar days of the report.", extent: { kind: "pdf-page", page: 2 } },
             { text: "5. Repairs are recorded as closed when the crew reports the work complete.", extent: { kind: "pdf-page", page: 3 } }],
  people: [{ id: "ENT-17", name: "L. Chen, Director of Public Works" }] },
  unread_pages: [7, 8, 9], ...o });
const STRENGTH = { [Q]: { capture: { state: "graded", grade: "B", weakest: { title: "Administrative Instruction 4.12" } },
                         connection: { state: "graded", grade: "C", detail: "a work-order number on both would raise it to B" }, testimony: { state: "unrated" } },
                   [Q2]: { capture: { state: "unrated" }, connection: { state: "unrated" } } };
/* the project's questions (basis-versions R50), one page; and every question the member may see (`list`) */
export const PROJECT_QUESTIONS = { ok: true, project: P, items: [{ inquiry: Q, title: "Is the city repairing reported potholes within seven days?" },
  { inquiry: Q2, title: "Does closed mean repaired?" }], cursor: null };
const QUESTIONS = { bundles: [{ bundle_id: Q, title: "Is the city repairing reported potholes within seven days?" }, { bundle_id: Q2, title: "Does closed mean repaired?" },
                              { bundle_id: "INQ-2026-0003-gone", title: "Severed" }, { bundle_id: "INQ-2026-0099-other", title: "Another project's" }] };
/* project-roster's participants (owners first, R29), the founder unnamed (R40) */
export const PARTICIPANTS = [{ handle: "dev", state: "joined", owner: 1 }, { handle: "mai", state: "joined", owner: 0 },
  { handle: "ana", state: "invited", owner: 0 }];

/** The plane every screen reads from, keyed by op; `image` answers by the id asked. */
export function plane(o = {}) {
  const images = { [P]: { "bundle.md": PROJECT_MD }, [Q]: { "bundle.md": inquiryMd(o.inquiryProject === undefined ? P : o.inquiryProject) }, [D]: { "bundle.md": DOCUMENT_MD }, ...(o.images || {}) };
  return {
    image: (r) => (Object.hasOwn(images, r.query.id) ? ok(images[r.query.id]) : ok(null)),
    projectstage: ok({ ok: true, project: P, stage: "investigating", questions: { read: 2, with_legs: 1, concluded: 0 } }),
    projectparticipants: ok({ ok: true, projectId: P, participants: PARTICIPANTS }),
    strengthbarof: (r) => ok(r.query.project ? { ok: true, project: r.query.project, bar: { declared: true, source: "project", capture: "B", connection: "B" } }
                                             : { ok: true, group: "g", bar: { capture: "C", connection: "C" } }),
    list: ok(QUESTIONS),
    projectquestions: ok(PROJECT_QUESTIONS),
    projectaccountstate: ok({ ok: true, on: true, serving: "member" }),
    projectdirectory: ok({ ok: true, projects: [{ id: "PROJ-2026-0042", name: "Elsewhere" }] }),
    projectvisibility: ok({ ok: true, projectId: P, setting: "hidden", recorded: true, history: [{ setting: "hidden", set_by: "dev", reason: null, at: "2026-10-01T09:00:00Z" }] }),
    projectownervotes: ok({ ok: true, projectId: P, changes: [] }),
    plans: ok({ ok: true, plans: [] }),
    inquirystrength: (r) => ok({ ok: true, target: r.query.id, ...(STRENGTH[r.query.id] || {}) }),
    basisversions: (r) => ok({ ...BASIS(), ...(r.query.project ? { current: { project: r.query.project, version: "main", at: "2026-10-06T09:00:00Z", by: "dev" } } : {}) }),
    versionstrength: (r) => ok({ ok: true, inquiry: r.query.id, version: r.query.version, pair: { capture: { state: "graded", grade: "B" }, connection: { state: "graded", grade: "C" } } }),
    partitionindependence: ok({ ok: true, inquiry: Q, independence: { checked: true, parts: 2, shared: [], complete: true } }),
    hypotheses: ok({ ok: true, inquiry: Q, hypotheses: [{ hypothesis_id: "HYP-1", statement: "Crews close reports when they inspect.", held_by: "dev" }] }),
    questionwaits: ok({ ok: true, waits: [{ document: "INFO-2026-0008", title: "2024 budget PDF", setter: "ben", reason: "wrong year", date: "2026-10-06T09:00:00Z" }] }),
    backlinks: (r) => ok(r.query.target === D
      ? { ok: true, target: D, backlinks: [{ from: Q, from_type: "inquiry", from_title: "Seven days?", rel: "cites" },
                                           { from: P, from_type: "project", from_title: "Pothole repairs", rel: "cites" }], out_of_view: true }
      : { ok: true, target: r.query.target, backlinks: [] }),
    reading: ok(READING()),
    gradenote: ok({ captureSha: SHA, note: "Fetched from the city's site over HTTPS; a signed copy would raise it to A." }),
    heldcaptures: ok({ ok: true, rows: [{ document: D, capture: { sha256: SHA, grade: { grade: "B", route: "fetched", determined: true } } }] }),
    versionchain: ok({ ok: true, versions: [{ capture_sha: SHA, at: "2026-10-02T09:00:00Z" }, { capture_sha: NEWER, at: "2026-10-09T09:00:00Z" }], at_index: 0 }),
    links: ok({ ok: true, links: [] }),
    connections: ok({ ok: true, connections: [] }),
    reevaluationnotices: ok({ ok: true, notices: [] }),
    ...(o.plane || {}),
  };
}

/** The served page at `path` with this module's screens, over the plane. */
export async function open(path, o = {}) {
  const p = await boot({ screens: SCREENS, plane: plane(o), path, ...(o.boot || {}) });
  await p.settle();
  return p;
}

/** The main area, its acts drawn by op, a button by op, and a field set. */
export const main = (p) => p.doc.getElementById("cs-main");
export const actsIn = (el) => el.querySelectorAll("button[data-act]").map((b) => b.getAttribute("data-act"));
export const button = (p, op, within) => (within || p.root()).querySelector(`button[data-act="${op}"]`);
export function fill(p, values) { for (const [id, v] of Object.entries(values)) { const el = p.doc.getElementById(id); if (!el) throw new Error(`no field ${id}`); el.value = v; } }
/** Press an act; a reasoned act's own reason field (when the shell asks one) answered with `reason`, a dialog confirmed. */
export async function press(p, op, { reason, within } = {}) {
  const b = button(p, op, within);
  if (!b) throw new Error(`no act ${op}`);
  await p.click(b);
  const slot = p.root().querySelector(`[data-slot="${b.getAttribute("data-ai")}"]`);
  const ta = slot && slot.querySelector('textarea[id^="cs-reason-"]');
  if (ta && reason !== undefined) { ta.value = reason; await p.click(slot.querySelector('[data-shell="reason-send"]')); }
  await p.settle();
  return slot;
}
/** Every text node drawn that reads as a word key: a key the page holds no word for is drawn as itself (interface-shell R5). */
export const rawKeys = (root) => textNodes(root).map((t) => String(t.data).trim()).filter((t) => /^[a-z][\w-]*(\.[\w-]+){2,}$/.test(t));
/** R44: whether `el` draws the word `key` filled with `vars`, as setup-words' `word` gives it. */
export const says = (el, key, vars) => String(el && el.textContent || "").includes(word(key, vars || {}));
/** The section whose heading is the word `key`. */
export const section = (p, key, vars) => main(p).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word(key, vars || {}));
/** A word's text up to its first placeholder, for a sentence filled with drawn markup (a date). */
export const lead = (key) => word(key, new Proxy({}, { get: () => "\u0000", has: () => true,
  getOwnPropertyDescriptor: () => ({ value: "\u0000", configurable: true, enumerable: true, writable: true }) })).split("\u0000")[0];
