/* screens-inquiry's tests: the scripted plane behind each screen, over interface-shell's served page (its tests' harness,
 * `harness.mjs`, and document stand-in, `dom.mjs`; B8, K3007). Each fixture answers its screen's reads in their owners'
 * documented shapes; a test overrides any op. */
import { SCREENS } from "../../../src/screens-inquiry/index.mjs";
import { boot, ok, textNodes } from "../interface-shell/harness.mjs";

export { SCREENS };
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
export const inquiryMd = (project = P) => ["---", `id: ${Q}`, "object_type: inquiry", "title: \"Seven days\"", "created: 2026-10-03T10:00:00Z",
  ...(project ? [`project: ${project}`] : []), "---", "", "## Question", "", "Is the city repairing reported potholes within seven days?", "", "## What It Rests On", ""].join("\n");
export const DOCUMENT_MD = ["---", `id: ${D}`, "object_type: information", "title: \"Pothole repair policy, Administrative Instruction 4.12\"",
  `content_hash: sha256:${SHA}`, `project: ${P}`, "source:", "  locator: https://example.org/ai-4-12.pdf", "  authority: Public Works",
  "  retrieved: 2026-10-02T09:00:00Z", "---", "", "## Summary", ""].join("\n");

export const BASIS = (extra = {}) => ({ ok: true, inquiry: Q, current: "main", versions: [{ name: "main", legs: [
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
const QUESTIONS = { bundles: [{ bundle_id: Q, title: "Is the city repairing reported potholes within seven days?" }, { bundle_id: Q2, title: "Does closed mean repaired?" },
                              { bundle_id: "INQ-2026-0003-gone", title: "Severed" }, { bundle_id: "INQ-2026-0099-other", title: "Another project's" }] };

/** The plane every screen reads from, keyed by op; `image` answers by the id asked. */
export function plane(o = {}) {
  const images = { [P]: { "bundle.md": PROJECT_MD }, [Q]: { "bundle.md": inquiryMd(o.inquiryProject === undefined ? P : o.inquiryProject) }, [D]: { "bundle.md": DOCUMENT_MD }, ...(o.images || {}) };
  return {
    image: (r) => (Object.hasOwn(images, r.query.id) ? ok(images[r.query.id]) : ok(null)),
    projectstage: ok({ ok: true, project: P, stage: "investigating", questions: { read: 2, with_legs: 1, concluded: 0 } }),
    projectparticipants: ok({ ok: true, projectId: P, participants: [{ handle: "dev", state: "joined", owner: true }, { handle: "mai", state: "joined", owner: false },
                                                                  { handle: "ana", state: "invited", owner: false }] }),
    strengthbarof: (r) => ok(r.query.project ? { ok: true, project: r.query.project, bar: { declared: true, source: "project", capture: "B", connection: "B" } }
                                             : { ok: true, group: "g", bar: { capture: "C", connection: "C" } }),
    list: ok(QUESTIONS),
    projectaccountstate: ok({ ok: true, on: true, serving: "member" }),
    projectdirectory: ok({ ok: true, projects: [{ id: "PROJ-2026-0042", name: "Elsewhere" }] }),
    inquirystrength: (r) => ok({ ok: true, target: r.query.id, ...(STRENGTH[r.query.id] || {}) }),
    basisversions: ok(BASIS()),
    hypotheses: ok({ ok: true, inquiry: Q, hypotheses: [{ hypothesis_id: "HYP-1", statement: "Crews close reports when they inspect.", held_by: "dev" }] }),
    questionwaits: ok({ ok: true, waits: [{ document: "INFO-2026-0008", title: "2024 budget PDF", setter: "ben", reason: "wrong year", date: "2026-10-06T09:00:00Z" }] }),
    backlinks: ok({ ok: true, target: D, backlinks: [{ from: Q, from_type: "inquiry", from_title: "Seven days?", rel: "cites" },
                                                     { from: P, from_type: "project", from_title: "Pothole repairs", rel: "cites" }], out_of_view: true }),
    reading: ok(READING()),
    gradenote: ok({ captureSha: SHA, note: { grade: "B", says: "Fetched from the city's site over HTTPS; a signed copy would raise it to A." } }),
    versionchain: ok({ ok: true, versions: [{ capture_sha: SHA, at: "2026-10-02T09:00:00Z" }, { capture_sha: NEWER, at: "2026-10-09T09:00:00Z" }], at_index: 0 }),
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
