/* screens-daily, T51 fix round 2 (wave 2): C21 (Find's hits name their document and draw the plane's excerpt), C72 ("What you answered"
   draws every answered obligation), C94 (a member is named by handle, never by id) and C14 (the held captures are read once, as the
   cheap picker where only documents are chosen). Requirement lines proposed in the job record: R83 (C21), R84 (C72), R85 (C94), R86 (C14).
   Every sentence is asserted as `word(key, vars)` (R34). */
import test from "node:test";
import assert from "node:assert/strict";
import { open as openRaw, ok, text, main, word, withScreens } from "./page.mjs";

const open = (path, plane, o = {}) => openRaw(path, plane, { screens: withScreens("document", "question", "person", "action", "plan", "project"), ...o });
const links = (p) => main(p).querySelectorAll("a[href]").map((a) => [a.getAttribute("href"), a.textContent]);
const SCOPES = ok({ ok: true, scopes: [{ key: "everything", kinds: [], only: null }] });
const NONE = { searchfields: SCOPES, subjectsnamed: ok({ ok: true, subjects: [], count: 0 }), meaningrows: ok({ ok: true, rows: [], total: 0 }) };

test("R83: every passage row names its document by the title the plane gives it and links it; a document with no title is named by the untitled word, never left out or by its id", async () => {
  const rows = [
    { bundle_id: "INFO-PKT", snippet: "quorum absent and [hydrostatic] pressure rising", extent: { kind: "pdf-page", page: 0 }, document: { bundle_id: "INFO-PKT", title: "Water board packet" } },
    { bundle_id: "INFO-NIL", snippet: "a second [hydrostatic] test", extent: { kind: "pdf-page", page: 1 }, document: { bundle_id: "INFO-NIL", title: null } },
  ];
  const p = await open("/app/finder/hydrostatic", { ...NONE, search: ok({ ok: true, total: 0, hits: [] }), meaningrows: ok({ ok: true, rows, total: 2 }) });
  assert.ok(links(p).some(([href, t]) => href === "/app/document/INFO-PKT" && t === "Water board packet"), "the titled document is a link");
  assert.ok(links(p).some(([href, t]) => href === "/app/document/INFO-NIL" && t === word("shell.card.document")), "the untitled one is named by the kit's plain word");
  assert.ok(!text(p).includes("INFO-NIL") && !text(p).includes("INFO-PKT"), "no document id is drawn");
});

test("R83: a question hit draws the plane's excerpt (its title and conclusion, the match emphasised) and opens the question; a passage hit names its document; control: a document hit is unchanged", async () => {
  const hits = [
    { bundle_id: "INQ-SEWER", object_type: "inquiry", title: "Who pays for the sewer repair?", snippet_from: "text", snippet: "Who pays for the [sewer] repair? The city pays …", document: { bundle_id: "INQ-SEWER", title: "Who pays for the sewer repair?" } },
    { bundle_id: "INFO-PKT", object_type: "information", title: null, snippet_from: "passage", snippet: "quorum absent and [hydrostatic] pressure", document: { bundle_id: "INFO-PKT", title: "Water board packet" } },
    { bundle_id: "INFO-NOTE", object_type: "information", title: "Note", snippet_from: "text", snippet: "the [sewer] fund holds nothing", document: { bundle_id: "INFO-NOTE", title: "Note" } },
  ];
  const p = await open("/app/finder/sewer", { ...NONE, search: ok({ ok: true, total: 3, hits }) });
  assert.ok(links(p).some(([href, t]) => href === "/app/question/INQ-SEWER" && t === "Who pays for the sewer repair?"), "the question opens question");
  assert.deepEqual(main(p).querySelectorAll("em").map((e) => e.textContent), ["sewer", "hydrostatic", "sewer"], "the matches are emphasised, the brackets are not drawn");
  assert.ok(!/\[|\]|##|INQ-|sha256/.test(text(p).replace(/INQ-SEWER/g, "")), "no markdown heading, brackets or hash");
  assert.ok(links(p).some(([href, t]) => href === "/app/document/INFO-PKT" && t === "Water board packet"), "a passage hit with no title of its own is named by its document's title");
  assert.ok(links(p).some(([href, t]) => href === "/app/document/INFO-NOTE" && t === "Note"), "control: the document hit is as before");
});

/* ---------- C94 · R85: a member is named by handle, never by id ---------- */

const ROSTER = ok({ members: [{ member_id: "admin", handle: "sparky", founder: true, status: "active" }, { member_id: "u-2", handle: "rosa", status: "active" }, { member_id: "u-3", handle: null, status: "active" }] });
const FALLBACK = (cs) => cs;
const unknownWord = () => word("shell.card.member");
const clockOf = (iso) => { const d = new Date(iso); return word("time.clock", { hour: String(d.getHours() % 12 === 0 ? 12 : d.getHours() % 12), minute: String(d.getMinutes()).padStart(2, "0"), ampm: word(d.getHours() < 12 ? "time.am" : "time.pm") }); };

test("R85 (C94): What you answered names the member who answered, and the one a to-do was forwarded to, by handle: the founder by hers, an unknown id by a word, never the id", async () => {
  const answered = ok({ ok: true, count: 4, window_days: 30, bound: 200, truncated: false, answered: [
    { act: "resolved", id: "T1", class: "OBLIGATION", kind: "update-ready", title: "First", by: "admin", by_you: false, at: "2026-10-09T11:02:00Z" },
    { act: "resolved", id: "T2", class: "OBLIGATION", kind: "update-ready", title: "Second", by: "u-9", by_you: false, at: "2026-10-08T11:02:00Z" },
    { act: "forwarded", id: "T3", kind: "check-requested", title: "Third", to: "u-2", at: "2026-10-07T09:40:00Z" },
    { act: "resolved", id: "T4", class: "OBLIGATION", kind: "update-ready", title: "Fourth", by: "u-3", by_you: false, at: "2026-10-06T11:02:00Z" },
  ] });
  const plane = { memberlist: ROSTER, queue: (req) => (req.query.answered ? answered : ok({ ok: true, aside: [] })) };
  const p = await open("/app/queue/answered", plane);
  const t = text(p);
  const when = (iso) => word("time.at", { date: word("date.daymonthyear", { day: String(Number(iso.slice(8, 10))), month: word("date.month.october"), year: "2026" }), time: clockOf(iso) });
  assert.ok(t.includes(word("queue.answered.bymember", { member: "sparky", when: when("2026-10-09T11:02:00Z") })), "the founder by her handle");
  assert.ok(t.includes(word("queue.answered.bymember", { member: unknownWord(), when: when("2026-10-08T11:02:00Z") })), "an id nobody knows by a word");
  assert.ok(t.includes(word("queue.answered.forwarded", { item: "Third", member: "rosa" })), "the member it went to by handle");
  assert.ok(t.includes(word("queue.answered.bymember", { member: unknownWord(), when: when("2026-10-06T11:02:00Z") })), "a member with no handle by the fallback word");
  assert.ok(!/\b(admin|u-9|u-2|u-3)\b/.test(t), "no member id is drawn");
});

test("R85 (C94): a set-aside finding another member decided names her by handle, never her id", async () => {
  const aside = ok({ ok: true, aside: [{ act: "set_aside", scope: "project", project: "PROJ-1", finding: "F-1", title: "A finding", state: "dismissed", decided_by: "admin", by_you: false, at: "2026-10-09T11:02:00Z", definition_version: null, reason: "" }] });
  const p = await open("/app/queue/answered", { memberlist: ROSTER, queue: (req) => (req.query.aside ? aside : ok({ ok: true, answered: [], count: 0 })) });
  assert.ok(text(p).includes(word("queue.aside.dismissed.bymember", { member: "sparky", date: word("date.daymonthyear", { day: "9", month: word("date.month.october"), year: "2026" }) })), "by her handle");
  assert.ok(!/\badmin\b/.test(text(p)), "no member id is drawn");
});

test("R85 (C94): Projects names an owner and members answered with no handle by the roster's handle, an unknown member by a word, never by her member id", async () => {
  const projects = [{ id: "PROJ-1", name: "Library hours", stage: "forming", owner: { member: "u-2", handle: null }, members: [{ member: "u-2", handle: null }, { member: "u-9", handle: null }, { member: "admin", handle: null }], activity: [0, 0, 0, 0, 0, 0, 0, 1], lastChange: "2026-10-12T15:00:00Z" },
    { id: "PROJ-2", name: "Sewer fund", stage: "forming", owner: { member: "u-9", handle: null } }];
  const p = await open("/app/projects", { memberlist: ROSTER, projectlist: ok({ ok: true, projects }), projectquestions: ok({ ok: true, items: [], cursor: null }) });
  const t = text(p);
  const refs = main(p).querySelectorAll(".cs-card, a.cs-ref").map((e) => e.textContent);
  assert.ok(refs.includes("rosa"), "the owner is a reference to the member by her handle");
  assert.ok(!refs.includes(unknownWord()), "an unknown owner is told by a word, not as a reference");
  assert.ok(t.includes(unknownWord()), "an unknown owner is told by a word");
  assert.ok(!/\b(u-2|u-9)\b/.test(t) && !links(p).some(([href]) => /u-2|u-9/.test(href)), "no member id is drawn or linked");
});

test("R85 (C94): Find in names who recorded a result by handle, never by id", async () => {
  const SHA = "9f2c0d1e".padEnd(64, "a");
  const found = ok({ ok: true, scope: { form: "project", project: "PROJ-1", captures: 1 }, kinds: [{ kind: "requirements", items: [{ kind: "requirements", words: "shall repair", capture_sha: SHA, title: "Housing code", extent: { passage: 3 }, content_id: "CNT-1", recorded: [{ by: "admin", at: "2026-10-03" }] }], count: 1, nothing: false, not_read: [] }] });
  const p = await open("/app/find-in/PROJ-1", { memberlist: ROSTER, findin: found, search: ok({ hits: [] }), projectquestions: ok({ ok: true, project: "PROJ-1", items: [], cursor: null }), image: ok({ "bundle.md": '---\nobject_type: project\ntitle: "T"\ncurrent_state: forming\n---\n' }) });
  const { press } = await import("./page.mjs");
  await press(p, "findin", { values: { "findin-kind-requirements": true }, reason: "looking" });
  assert.ok(text(p).includes(word("screen.find-in.recorded", { who: "sparky" })), "by her handle");
  assert.ok(!/\badmin\b/.test(text(p)), "no member id");
});

for (const [where, path] of [["queue", "/app/queue"], ["home", "/app"]]) {
  test(`R85 (C94, ${where}): who has agreed and who is still awaited on an endorsement are named by handle (the founder by hers), never by member id; control: a handle is drawn as itself`, async () => {
    const NONE = { ungrouped: true, ancestors: [] };
    const ENDORSE = { id: "OBLIGATION::endorsement-owed::admin::M-9::mai", class: "OBLIGATION", kind: "endorsement-owed", case: NONE, assignee: "mai",
      subject: { kind: "member", id: "M-9" }, fills: { who: "ana" }, basis: { have: ["admin"], awaiting: ["u-2", "rosa"] }, summary: "x", options: [{ id: "adminendorse" }], door: "adminendorse", disposition: { available: false, instead: "adminendorse" } };
    const { ADMIN } = await import("../interface-shell/harness.mjs");
    const plane = { memberlist: ROSTER, whoami: ok({ ...ADMIN, capabilities: ["contribute"] }), lookedsince: ok({ since: "2026-10-01T00:00:00Z" }),
      projectlist: ok({ ok: true, projects: [] }), queue: ok({ items: [ENDORSE], item_count: 1 }) };
    const p = await open(path, plane);
    const t = text(p);
    assert.ok(t.includes("sparky"), "the founder who has endorsed, by her handle");
    assert.ok(t.includes("rosa"), "control: a handle is drawn as itself, and an id by the handle it names");
    assert.ok(!/\b(admin|u-2)\b/.test(t), "no member id is drawn");
  });
}

/* ---------- C14 · R86: the held captures are read as cheaply as the screen's use allows ---------- */

const PICKER = (n) => ok({ ok: true, held: Array.from({ length: n }, (_, i) => ({ bundle_id: "INF-H" + i, title: "Photo " + i, project: null, capture: { sha256: "a".repeat(64) }, standing: "collected" })), state: "held", truncated: false, next: null });
for (const [screen, path] of [["home", "/app"], ["queue", "/app/queue"]]) {
  test(`R86 (C14, ${screen}): the door's count of held captures is the cheap picker read, and (fix round 3, R88) the one read: her to-dos are its rows whose actor is she; control: the door still counts the rows`, async () => {
    const { ADMIN } = await import("../interface-shell/harness.mjs");
    const plane = { whoami: ok({ ...ADMIN, capabilities: ["contribute"] }), lookedsince: ok({ since: "2026-10-01T00:00:00Z" }), projectlist: ok({ ok: true, projects: [{ id: "PROJ-1", name: "The Coliseum lease", stage: "investigating" }] }),
      queue: ok({ items: [], item_count: 0 }), inbox: ok({ ok: true, inbox: [] }), heldcaptures: PICKER(3) };
    const p = await open(path, plane);
    const reads = p.byOp("heldcaptures");
    assert.equal(reads.length, 1, "the held captures are read once");
    assert.equal(reads[0].query.fields, "picker", "and the read is the cheap picker read");
    const door = main(p).querySelector('a[href="/app/held"]');
    assert.ok(door, "the door is drawn from the picker rows");
    assert.ok(main(p).querySelectorAll(".cs-row").find((r) => r.querySelector('a[href="/app/held"]')).textContent.includes("3"));
  });
}
