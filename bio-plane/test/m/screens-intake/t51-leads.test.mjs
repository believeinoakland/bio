/* screens-intake R44 (T51 fix round; DEC-375 C18): the `leads` screen on the real served page. Each act sends the fields its owner
 * declares; a lead not shared stays the member's (control). A sentence is asserted by its key. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, text, main, btn, fill, press, ok, refused, word, says, saysIn, rawKeys } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const PROJECTS = ok({ projects: [{ id: "PROJ-1", name: "The Coliseum lease" }, { id: "PROJ-2", name: "Pothole repairs" }] });
const MEMBERS = ok({ members: [{ member_id: "rosa", handle: "Rosa-h" }] });
const WORDS = "The city inspected the Coliseum garage in 2019.";
const LEAD = (more = {}) => ({ ok: true, lead_id: "LEAD-2026-1008-aaaaaaaaaaaa", author: "member:mai", words: WORDS, locator: null, at: "2026-10-08T10:00:00Z", evidence: false, shared_to: [], looks: [], state: "NEVER_LOOKED", ...more });
/* `leadlist` (observation-log R20) answers the leads the viewer may read: the plane's record, kept here by `held`; a written lead enters it
   only as the plane would put it there */
const listed = (held) => (req) => ({ status: 200, json: { ok: true, result: { ok: true, limit: 50, truncated: false, leads: held.map((l) => ({ lead_id: l.lead_id, author: l.author, words: l.words, locator: l.locator, at: l.at, state: l.state, looked_at: null, looks: 0, evidence: false })), empty: held.length ? null : { cause: "no_leads_visible" } } } });
const open = (o = {}, path = "/app/leads") => openPage(path, { reachable: true, plane: { projectlist: PROJECTS, memberlist: MEMBERS, leadlist: listed(o.held || []), ...(o.plane || {}) } });
const written = async (more = {}, plane = {}) => {
  const held = [];
  const lead = (req) => { held.push(LEAD({ words: req.body.words, locator: req.body.locator || null, ...more })); return ok({ ok: true, lead_id: LEAD().lead_id, state: "NEVER_LOOKED", looks: 0, evidence: false }); };
  const p = await open({ held, plane: { lead, leadread: ok(LEAD(more)), ...plane } });
  fill(p, { "ld-words": WORDS, "ld-where": "Oakland Public Works, inspection records, 2019" });
  await press(p, "lead", { reason: WORDS });
  return p;
};

test("R44 R52 writing a lead sends its words and where it might be found; it is then listed, unlooked-at, as the member's own", async () => {
  const p = await written();
  assert.deepEqual(p.byOp("lead").map((r) => ({ words: r.body.words, locator: r.body.locator })), [{ words: WORDS, locator: "Oakland Public Works, inspection records, 2019" }]);
  assert.ok(says(p, "screen.leads.mine.head"));
  assert.ok(text(p).includes(WORDS));
  assert.ok(says(p, "screen.leads.state.never"));
  assert.ok(p.byOp("leadlist").length >= 2, "R52 a lead written in the visit appears by the list being read again");
  assert.ok(says(p, "screen.leads.write.note1") && says(p, "screen.leads.write.note2"), "only you can read it until you share it");
  assert.deepEqual(rawKeys(p), []);
  /* control: where is optional */
  const q = await open({ plane: { lead: ok({ ok: true, lead_id: LEAD().lead_id }) } });
  fill(q, { "ld-words": "w" });
  await press(q, "lead", { reason: "w" });
  assert.deepEqual(q.byOp("lead").map((r) => Object.keys(r.body).sort()), [["words"]]);
});

test("R44 an empty lead is refused in the owner's words and nothing is listed; no list is drawn before anything is written", async () => {
  const p = await open({ plane: { lead: refused("LEAD_NO_WORDS", "builder detail") } });
  assert.ok(!says(p, "screen.leads.mine.head"));
  fill(p, { "ld-words": "x" });
  const r = await press(p, "lead", { reason: "x" });
  assert.ok(saysIn(r.slot(), "refusal.LEAD_NO_WORDS"));
  assert.ok(!r.slot().textContent.includes("builder detail"));
  assert.ok(!says(p, "screen.leads.mine.head"));
});

test("R44 reading it back: Open it draws the lead, its looks by who looked and what they found, and where it was shared", async () => {
  const p = await written({ looks: [{ seq: 1, at: "2026-10-09T10:00:00Z", looked_by: "member:rosa", state: "LOOKED_INDETERMINATE", detail: "Searched the portal; nothing under that name.", result_kind: null, result_ref: null }],
    shared_to: [{ project: "PROJ-1", shared_by: "member:mai", at: "2026-10-09T11:00:00Z", reason: "The project needs this report." }], state: "LOOKED_INDETERMINATE" });
  await press(p, "leadread");
  assert.deepEqual(p.byOp("leadread").map((r) => r.query.id), [LEAD().lead_id]);
  assert.ok(says(p, "screen.leads.one.head"));
  const t = text(p);
  assert.ok(t.includes("Rosa-h") && t.includes("Searched the portal; nothing under that name."));
  assert.ok(t.includes("The Coliseum lease") && t.includes("The project needs this report."));
  assert.ok(says(p, "screen.leads.state.unclear"));
});

test("R44 recording a look sends each outcome the owner declares: not there, could not tell, part, there; a found document is pointed at", async () => {
  const states = { absent: "LOOKED_ABSENT", unclear: "LOOKED_INDETERMINATE", part: "partial", found: "PRESENT" };
  for (const [key, state] of Object.entries(states)) {
    const p = await written({}, { leadlook: ok({ ok: true, seq: 1 }) });
    await press(p, "leadread");
    fill(p, { "ld-lks": state, "ld-lkd": "Looked at the portal.", ...(state === "PRESENT" || state === "partial" ? { "ld-lkk": "capture", "ld-lkr": "a".repeat(64) } : {}) });
    await press(p, "leadlook", { reason: "Looked at the portal." });
    const b = p.byOp("leadlook")[0].body;
    assert.equal(b.state, state, key);
    assert.equal(b.lead, LEAD().lead_id);
    assert.equal(b.detail, "Looked at the portal.");
    if (state === "PRESENT" || state === "partial") assert.deepEqual([b.resultKind, b.resultRef], ["capture", "a".repeat(64)]);
    else assert.ok(!("resultKind" in b) && !("resultRef" in b), "only a look that found something points at anything");
  }
  assert.ok(true);
});

test("R44 sharing it with a project sends the lead, the project and the reason; a lead not shared stays the member's (no share, no project told)", async () => {
  const p = await written({}, { leadshare: ok({ ok: true, lead: LEAD().lead_id, project: "PROJ-2" }) });
  await press(p, "leadread");
  assert.equal(p.byOp("leadshare").length, 0, "control: opening it shares nothing");
  fill(p, { "ld-lsp": "PROJ-2", "ld-lsr": "The project needs this report." });
  await press(p, "leadshare", { reason: "The project needs this report." });
  assert.deepEqual(p.byOp("leadshare").map((r) => ({ lead: r.body.lead, project: r.body.project, reason: r.body.reason })), [{ lead: LEAD().lead_id, project: "PROJ-2", reason: "The project needs this report." }]);
  assert.ok(says(p, "screen.leads.share.note1") && says(p, "screen.leads.share.note2"));
});

test("R44 the share and the look are refused in the owner's words: not a participant, already shared, no reason, no detail", async () => {
  const seen = new Set();
  for (const [op, code, fields] of [["leadshare", "LEAD_SHARE_NOT_A_PARTICIPANT", { "ld-lsr": "r" }], ["leadshare", "LEAD_SHARE_NO_REASON", { "ld-lsr": "r" }], ["leadlook", "LEAD_LOOK_NO_DETAIL", { "ld-lkd": "d" }], ["leadlook", "LEAD_LOOK_REFERENT", { "ld-lkd": "d" }]]) {
    const p = await written({}, { [op]: refused(code, "builder detail") });
    await press(p, "leadread");
    fill(p, fields);
    const r = await press(p, op, { reason: "r" });
    assert.ok(saysIn(r.slot(), `refusal.${code}`), code);
    assert.ok(!r.slot().textContent.includes("builder detail"));
    seen.add(r.slot().textContent);
  }
  assert.equal(seen.size, 4);
});

test("R44 a lead's address opens it: leadread is asked for it; one that cannot be read is Nothing is here", async () => {
  const p = await open({ plane: { leadread: ok(LEAD()) } }, `/app/leads/${LEAD().lead_id}`);
  assert.ok(p.byOp("leadread").every((r) => r.query.id === LEAD().lead_id) && p.byOp("leadread").length >= 1);
  assert.ok(says(p, "screen.leads.one.head"));
  const q = await open({ plane: { leadread: refused("LEAD_NOT_FOUND", "x", 404) } }, `/app/leads/${LEAD().lead_id}`);
  assert.ok(says(q, "shell.unavailable.nothing.says"));
});

test("R52 'Your leads' is what leadlist answers, newest first, one row for each; an empty answer draws no list; the screen keeps no list of its own", async () => {
  const L1 = LEAD({ lead_id: "LEAD-2026-1009-bbbbbbbbbbbb", words: "The owner paid the city a fee in 2021.", state: "LOOKED_INDETERMINATE" });
  const L2 = LEAD();
  const p = await open({ held: [L1, L2] });
  assert.ok(says(p, "screen.leads.mine.head"));
  const t = text(p);
  assert.ok(t.includes(L1.words) && t.includes(L2.words) && t.indexOf(L1.words) < t.indexOf(L2.words), "in the order the plane answers");
  assert.deepEqual(main(p).querySelectorAll('button[data-act="leadread"]').map((b) => b.getAttribute("data-id")), [L1.lead_id, L2.lead_id]);
  assert.ok(says(p, "screen.leads.state.unclear") && says(p, "screen.leads.state.never"));
  assert.ok(p.byOp("leadlist").length >= 1);
  assert.deepEqual(rawKeys(p), []);
  /* the empty answer: the design draws no list */
  const q = await open({});
  assert.ok(!says(q, "screen.leads.mine.head"));
});

test("R52 control: a lead the viewer may not read is not drawn, even one the member has just written; a list that failed draws no list", async () => {
  const hidden = LEAD({ words: "Someone else's note, not shared with this member." });
  const p = await open({ held: [], plane: { lead: ok({ ok: true, lead_id: hidden.lead_id, state: "NEVER_LOOKED", looks: 0, evidence: false }) } });
  fill(p, { "ld-words": hidden.words });
  await press(p, "lead", { reason: hidden.words });
  assert.ok(!says(p, "screen.leads.mine.head"), "the list is what the record shows this viewer");
  const f = await open({ plane: { leadlist: refused("LEAD_LIST_X", "x", 500) } });
  assert.ok(!says(f, "screen.leads.mine.head") && says(f, "screen.leads.write.heading") && f.byOp("leadlist").length >= 1, "the writing form stays; no list is drawn from a list that failed");
  assert.deepEqual(rawKeys(f), []);
});
