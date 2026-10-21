/* screens-inquiry fix round 3 (T51), the `project` screen: C94 (R29, R40, R54: members named by handle, never by id), DEC-394 (3a) (R128, to be
 * folded: "The project's documents", read by `heldcaptures`) and C79 (R28: a project opened within the minute says it was started). On
 * interface-shell's served page over a scripted plane; every request is compared with its owner's declaration by the harness's guard (R104).
 * Every expectation is a word read by key (R44), never copied (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refused, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, actsIn, press, says, section, word, day, lead, SCREENS, P, Q, D, SHA } from "./fixtures.mjs";

const at = "/app/project/" + P;
const PROJECT = SCREENS.find((s) => s.id === "project");
const ROSTER = ok({ ok: true, members: [{ member_id: "admin", handle: "sparky", founder: true }, { member_id: "u-7", handle: "rosa" }, { member_id: "u-9", handle: null }] });
const QUIET = ok({ ok: true, members: [] });
const NOID = /\bu-7\b|\badmin\b|\bu-99\b/;

/* ------------------------------------------------------------------------------------------------------------------ C94 */

test("R29 R40 R54 C94 the members the project names from the record are drawn by handle, never by id: a participant given by id, the visibility history's setter, the stake's, the owners' vote; an id no roster holds by the plain word; control: the roster silent, the fallback words", async () => {
  const plane = (roster) => ({ memberlist: roster,
    projectparticipants: ok({ ok: true, projectId: P, participants: [{ handle: "mai", state: "joined", owner: 1 }, { member: "u-7", state: "joined", owner: 0 }] }),
    projectvisibility: ok({ ok: true, projectId: P, setting: "hidden", recorded: true, history: [
      { setting: "hidden", set_by: "u-7", reason: null, at: "2026-10-01T09:00:00Z" },
      { setting: "discoverable", set_by: "admin", reason: "ready", at: "2026-10-05T09:00:00Z" },
      { setting: "hidden", set_by: "u-99", reason: "too soon", at: "2026-10-06T09:00:00Z" }] }),
    projectstake: ok({ ok: true, stake: "Two members live nearby.", set_by: "u-7", set_at: "2026-10-09T09:00:00Z", history: [] }),
    projectownervotes: ok({ ok: true, projectId: P, changes: [{ change: "add", target: "ana", proposed_by: "u-7", proposed_at: "2026-10-09T09:00:00Z", agreed: ["admin"], awaiting: ["u-99"] }] }) });
  const p = await open(at, { plane: plane(ROSTER) });
  const members = section(p, "screen.project.members.head");
  assert.ok(members.textContent.includes("rosa"), "a participant row that carries her id only is drawn by her handle");
  assert.ok(says(members, "project.owners.pending", { who: "ana", by: "rosa", date: day("2026-10-09"), agreed: "sparky", awaiting: word("shell.card.member") }),
    "the owners' vote: proposer and agreed by handle, an unknown id by the plain word");
  const vis = main(p).querySelector('details[data-fold="settings"]');
  assert.ok(says(vis, "project.visibility.history", { change: word("project.visibility.discoverable"), who: "sparky", date: day("2026-10-05"), reason: "ready" }), "the founder's id by her handle");
  assert.ok(says(vis, "project.visibility.history", { change: word("project.visibility.hidden"), who: word("shell.card.member"), date: day("2026-10-06"), reason: "too soon" }), "an unknown id by the plain word");
  assert.ok(says(section(p, "stake.project.title"), "stake.set", { who: "rosa", date: day("2026-10-09") }), "the stake's setter");
  assert.doesNotMatch(main(p).textContent, NOID, "never an id");
  /* control: the roster names no handle: the founder is the unnamed founder, any other member the plain word */
  const q = await open(at, { plane: plane(QUIET) });
  const vq = main(q).querySelector('details[data-fold="settings"]');
  assert.ok(says(vq, "project.visibility.history", { change: word("project.visibility.discoverable"), who: word("member.founder.unnamed"), date: day("2026-10-05"), reason: "ready" }), "the founder unnamed");
  assert.ok(says(section(q, "stake.project.title"), "stake.set", { who: word("shell.card.member"), date: day("2026-10-09") }), "a member with no handle known: the fallback word");
  assert.doesNotMatch(main(q).textContent, NOID);
});

/* ------------------------------------------------------------------------------------------------------------------ DEC-394 (3a) */

const SHA2 = "7c1d" + "0".repeat(56) + "e002";
const row = (id, title, extra = {}) => ({ bundle_id: id, title, project: P, source: { address: "https://example.org/" + id, via: "fetch", retrieved: "2026-09-01T09:00:00Z" },
  collected_since: "2026-09-01T09:00:00Z", capture: { sha256: SHA, grade: { grade: "B" } }, actor: "dev", retrieved: "2026-09-14T09:00:00Z", bytes: 1200, standing: "collected", ...extra });
const DOCS = [row("INFO-2026-0021", "Street maintenance report 2026", { format: "html" }),
  row("INFO-2026-0022", "Pothole work orders, 2025", { format: "xlsx", retrieved: "2026-10-02T09:00:00Z" }),
  row("INFO-2026-0023", "Seminary Ave at 60th.jpg", { content_type: "image/jpeg", retrieved: "2026-10-04T09:00:00Z", standing: "verified" }),
  row("INFO-2026-0024", "A letter from the city", { retrieved: "2026-10-05T09:00:00Z" })];
const held = (rows, extra = {}) => ({ heldcaptures: ok({ ok: true, held: rows, state: "held_and_vouched", limit: 200, truncated: false, next: null, ...extra }) });

test("R128 'The project's documents': every document filed under the project, each its title as a reference opening the document, its kind where the row states one and its capture date; read by heldcaptures for the project's held and vouched documents", async () => {
  const p = await open(at, { plane: held(DOCS) });
  const s = section(p, "screen.project.docs.head");
  assert.ok(s, "the section is drawn");
  assert.ok(says(s, "screen.project.docs.about1") && says(s, "screen.project.docs.about2"), "what it lists");
  const rows = s.querySelectorAll(".cs-row");
  assert.equal(rows.length, 4);
  for (const [i, d] of DOCS.entries()) {
    const ref = rows[i].querySelector(`a.cs-ref[href="/app/document/${d.bundle_id}"]`);
    assert.ok(ref && ref.textContent === d.title, d.title + ": its title, opening the document");
  }
  const captured = (iso) => word("screen.project.docs.captured") + " " + day(iso);
  assert.ok(rows[0].textContent.includes(word("screen.project.docs.kind.web") + " · " + captured("2026-09-14")), "a web page");
  assert.ok(rows[1].textContent.includes(word("screen.project.docs.kind.sheet") + " · " + captured("2026-10-02")), "a spreadsheet");
  assert.ok(rows[2].textContent.includes(word("screen.project.docs.kind.photo") + " · " + captured("2026-10-04")), "a photo");
  /* a row that states no format or content type draws no kind, never a guess */
  assert.ok(rows[3].textContent.includes(captured("2026-10-05")) && ["web", "sheet", "photo"].every((k) => !rows[3].textContent.includes(word("screen.project.docs.kind." + k))), "no kind stated, none drawn");
  assert.ok(!says(s, "screen.project.docs.none1"), "control: with documents, no 'nothing filed'");
  /* the read: the project's held and vouched documents, bounded */
  const q = p.byOp("heldcaptures").map((r) => r.query).find((x) => x.project === P && x.state === "held_and_vouched");
  assert.ok(q && Number(q.limit) > 0 && Number(q.limit) <= 1000 && q.fields === undefined, "state held_and_vouched, bounded, full rows");
  assert.ok(actsIn(s).includes("heldcaptures"), "and its act");
});

test("R128 with nothing filed the section says so, in the designed two sentences; the act lists the documents again (the read repeated); control: a read that fails is drawn failed, never as none", async () => {
  const p = await open(at, { plane: held([]) });
  const s = section(p, "screen.project.docs.head");
  assert.ok(says(s, "screen.project.docs.none1") && says(s, "screen.project.docs.none2"), "nothing is filed");
  assert.equal(s.querySelectorAll(".cs-row").length, 0);
  const before = p.byOp("heldcaptures").length;
  const b = s.querySelector('button[data-act="heldcaptures"]');
  assert.ok(b && says(b, "act.heldcaptures.label.project"), "the act, by its label for this screen");
  await press(p, "heldcaptures", { within: s });
  assert.ok(p.byOp("heldcaptures").length > before, "pressing it reads the list again");
  const f = await open(at, { plane: { heldcaptures: refusedIn("NOT_PERMITTED", "no") } });
  const fs = section(f, "screen.project.docs.head");
  assert.ok(fs.querySelector('[data-state="failed"]') && !says(fs, "screen.project.docs.none1"), "control: failed is not none");
});

test("R128 a list the plane cuts (`truncated`, `next`) is read to its end, page by page", async () => {
  const first = held([row("INFO-2026-0031", "First page")], { truncated: true, next: "CUR1" });
  const p = await open(at, { plane: { heldcaptures: (r) => (r.query.after === "CUR1" ? ok({ ok: true, held: [row("INFO-2026-0032", "Second page")], truncated: false, next: null }) : first.heldcaptures) } });
  const s = section(p, "screen.project.docs.head");
  assert.deepEqual(s.querySelectorAll("a.cs-ref").map((a) => a.textContent), ["First page", "Second page"]);
  /* control: a list that is not cut asks once */
  const one = await open(at, { plane: held(DOCS) });
  assert.ok(one.byOp("heldcaptures").every((r) => r.query.after === undefined));
});

/* ------------------------------------------------------------------------------------------------------------------ C79 */

const startedMd = (iso) => ["---", `id: ${P}`, "object_type: project", 'title: "Pothole repairs"', `created: "${iso}"`, "references: []", "---", "", "## Summary", ""].join("\n");
const NOHISTORY = ok({ ok: true, projectId: P, setting: "hidden", recorded: false, history: [], note: "no record" });
const startedAgo = (ms) => new Date(Date.now() - ms).toISOString();

test("R28 C79 a project opened within the minute it was started says it was started: `project.visibility.started` with its setting and the day; control: one started a day ago, with no history, does not", async () => {
  const iso = startedAgo(20000);
  const p = await open(at, { images: { [P]: { "bundle.md": startedMd(iso) } }, plane: { projectvisibility: NOHISTORY } });
  const line = main(p).querySelector('[data-visibility="started"]');
  assert.ok(line, "the sentence is drawn");
  assert.ok(says(line, "project.visibility.started", { setting: word("project.visibility.setting.hidden"), date: day(iso) }), "started hidden, on the day");
  const old = await open(at, { images: { [P]: { "bundle.md": startedMd(startedAgo(86400000)) } }, plane: { projectvisibility: NOHISTORY } });
  assert.equal(main(old).querySelector('[data-visibility="started"]'), null, "a day later, none");
  /* control: the history's own end (R28) is drawn once and never doubled by the new sentence */
  const hist = ok({ ok: true, projectId: P, setting: "hidden", recorded: true, history: [{ setting: "hidden", set_by: "dev", reason: null, at: iso }] });
  const h = await open(at, { images: { [P]: { "bundle.md": startedMd(iso) } }, plane: { projectvisibility: hist } });
  assert.equal(main(h).querySelectorAll('[data-visibility="started"]').length, 1, "once");
  assert.ok(says(main(h).querySelector('[data-visibility="started"]'), "project.visibility.started", { setting: word("project.visibility.hidden"), date: day(iso) }), "the history's end as before");
  /* control: a project whose record states no start says nothing of one */
  const none = await open(at, { plane: { projectvisibility: NOHISTORY } });
  assert.equal(main(none).querySelector('[data-visibility="started"]'), null);
});
