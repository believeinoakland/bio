/* The to-dos Home and the queue draw as the design draws them (R3, R17; B21, DEC-389): the photos a member captured and has not
   vouched for ("Vouch for N photos you captured on …", the registry's `release`), and a letter drafted for the group awaiting her
   approval ("Read and approve it", `filingapprove`). On the real served page (interface-shell's harness); every request is checked
   by the harness against the owners' declarations. Every sentence is asserted as `word(key, vars)` (R34). */
import test from "node:test";
import assert from "node:assert/strict";
import { open, ok, refused, main, text, ops, button, fill, last, press, beside, word, hasWord, withScreens, MEMBER, settle } from "./page.mjs";

const WHO = { whoami: ok({ ...MEMBER, capabilities: ["contribute"] }) };
const SEEN = { groupidentity: ok({ ok: true, group: "lakeshore", display_name: "Lakeshore Tenants" }), lookedsince: ok({ since: "2026-10-01T00:00:00Z" }),
  projectlist: ok({ ok: true, projects: [{ id: "PROJ-1", name: "Pothole repairs", stage: "forming" }] }), projectquestions: ok({ ok: true, items: [], cursor: null }),
  startfrom: ok({ ok: true, scripts: [], doors: [] }) };
const NONE = { ungrouped: true, ancestors: [] };
const ROW = (id, address) => ({ bundle_id: id, title: "Photo " + id, source: address ? { address, via: "web" } : null, actor: "mai" });
const HELD = (...rows) => ok({ ok: true, held: rows, state: "held", truncated: false, next: null });
const LETTER = { id: "OBLIGATION::letter::ACT-1::mai", class: "OBLIGATION", kind: "filing-draft", case: NONE, assignee: "mai", summary: "A letter to approve",
  subject: { kind: "action", id: "ACT-1", title: "Demand to rescind" }, options: [{ id: "filingapprove" }], disposition: { available: false, instead: "filingapprove" } };
const DRAFT = (o = {}) => ({ filing: "FIL-1", form: "communication", purpose: "request", label: "x", at: "2026-10-09T10:00:00Z", approval: null, second_approval: null,
  second_needed: false, signatories: [], voice: "group", sending: null, ...o });
const FILINGS = (...drafts) => ok({ action: "ACT-1", drafts, drafts_truncated: false, packets: [], packets_truncated: false });
const planeOf = (extra = {}) => ({ ...WHO, ...SEEN, queue: ok({ items: [], item_count: 0 }), ...extra });
const SCR = { screens: withScreens("action", "document", "project", "start-send") };
const screens = [["home", "/app"], ["queue", "/app/queue"]];

test("R17 (words): the words the vouch to-do and the letter's approval read are held by the word list", () => {
  for (const k of ["screen.home.todo.vouch", "screen.home.todo.vouch.noplace", "screen.home.todo.vouch.noplace.one", "screen.dash-project.next.vouch.one",
    "act.release.label.home", "act.release.label.queue", "act.release.does", "act.filingapprove.label.home", "act.filingapprove.label.queue", "act.filingapprove.does",
    "screen.held.ack", "screen.held.ackhelp", "screen.held.mitigation", "screen.held.mitigationhelp", "screen.held.vouchmissing", "screen.held.vouchbad",
    "screen.held.selectfailed"]) assert.ok(hasWord(k), k);
});

for (const [where, path] of screens) {
  test(`R17 (${where}): photos the member captured and has not vouched for are one to-do for each place, "Vouch for N photos you captured on …", with the registry's act release`, async () => {
    const p = await open(path, planeOf({ heldcaptures: HELD(ROW("INF-H1", "https://city.example/gate"), ROW("INF-H2", "https://city.example/gate"), ROW("INF-H3", "https://city.example/lot")) }), SCR);
    assert.equal(p.byOp("heldcaptures").length, 1, "the held captures are read once, as the doors read them; her own are the rows whose actor is she (C14, P2.3)");
    const t = text(p);
    assert.ok(t.includes(word("screen.home.todo.vouch", { count: "2", place: "https://city.example/gate" })), "two photos at one place");
    assert.ok(t.includes("Photo INF-H3") && !t.includes(word("screen.dash-project.next.vouch.one", { place: "https://city.example/lot" })), "C25: one capture at another place is the document, named by its title");
    const titleless = await open(path, planeOf({ heldcaptures: HELD({ ...ROW("INF-H3", "https://city.example/lot"), title: null }) }), SCR);
    assert.ok(text(titleless).includes(word("screen.dash-project.next.vouch.one", { place: "https://city.example/lot" })), "control: one with no title keeps the sentence about its place");
    assert.deepEqual(ops(p).filter((o) => o === "release"), ["release", "release"], "each to-do carries the act");
    assert.ok(button(p, "release").textContent.includes(word(`act.release.label.${where}`)));
  });

  test(`R17 (${where}): a capture with no place is vouched for in a to-do of its own, by the keys that say no place; one photo reads in the singular`, async () => {
    const p = await open(path, planeOf({ heldcaptures: HELD(ROW("INF-H1", null), ROW("INF-H2", null), ROW("INF-H3", "https://city.example/lot")) }), SCR);
    assert.ok(text(p).includes(word("screen.home.todo.vouch.noplace", { count: "2" })));
    const q = await open(path, planeOf({ heldcaptures: HELD(ROW("INF-H1", null)) }), SCR);
    assert.ok(text(q).includes("Photo INF-H1") && !text(q).includes(word("screen.home.todo.vouch.noplace.one")), "C25: one capture is the document, named by its title");
    const bare = await open(path, planeOf({ heldcaptures: HELD({ ...ROW("INF-H1", null), title: null }) }), SCR);
    assert.ok(text(bare).includes(word("screen.home.todo.vouch.noplace.one")), "control: with no title, one photo reads in the singular");
  });

  test(`R17 (${where}): vouching asks her two statements; with one missing nothing is sent; with both it selects the group's captures, then releases them over the handle`, async () => {
    const p = await open(path, planeOf({ heldcaptures: HELD(ROW("INF-H1", "https://city.example/gate"), ROW("INF-H2", "https://city.example/gate")),
      select: ok({ ok: true, handle: "SEL-1" }), release: ok({ ok: true, released: ["INF-H1", "INF-H2"] }) }), SCR);
    const b = button(p, "release");
    const f = b.dataset.f;
    assert.ok(main(p).querySelector(`#${f}-ack`) && main(p).querySelector(`#${f}-mitigation`), "both statements are fields beside the act");
    await press(p, "release");
    assert.equal(p.byOp("select").length + p.byOp("release").length, 0, "no statement, nothing sent");
    fill(p, { [`${f}-ack`]: "They are what the gate cameras gave" });
    const half = await press(p, "release");
    assert.equal(p.byOp("release").length, 0, "one statement missing, nothing sent");
    assert.ok(beside(p, half).includes(word("screen.held.vouchmissing", { fields: word("screen.held.mitigation") })), "the missing one is named");
    await press(p, "release", { values: { [`${f}-mitigation`]: "I compared each with the original" } });
    assert.deepEqual(last(p, "select").body.ids, ["INF-H1", "INF-H2"]);
    const rel = last(p, "release");
    assert.deepEqual([rel.query.handle, rel.query.acknowledgment, rel.query.mitigation], ["SEL-1", "They are what the gate cameras gave", "I compared each with the original"]);
  });

  test(`R17 (${where}): control: with no photo held there is no vouch to-do and no release act; a failed read of her captures adds no second failed mark`, async () => {
    const none = await open(path, planeOf({ heldcaptures: HELD() }), SCR);
    assert.ok(!ops(none).includes("release"));
    assert.ok(!text(none).includes(word("screen.home.todo.vouch.noplace", { count: "0" })));
    const failed = await open(path, planeOf({ heldcaptures: refused("NOT_YET", "No.", 500) }), SCR);
    assert.ok(!ops(failed).includes("release"));
    assert.equal(main(failed).querySelectorAll('[data-state="failed"]').length, 1, "the door's failed mark, and no other");
  });

  test(`R3 (${where}): a letter drafted for the group awaiting her approval draws "Read and approve it" as the act filingapprove; pressing it approves the newest draft not yet sent`, async () => {
    const p = await open(path, planeOf({ queue: ok({ items: [LETTER], item_count: 1 }), filingsfor: FILINGS(DRAFT({ filing: "FIL-0", at: "2026-10-01T10:00:00Z" }), DRAFT({ filing: "FIL-1" })),
      filingapprove: ok({ ok: true }) }), SCR);
    const b = button(p, "filingapprove");
    assert.ok(b, "the act is drawn on the letter's item");
    assert.ok(b.textContent.includes(word(`act.filingapprove.label.${where}`)));
    assert.equal(button(p, "filingapprove", 1), null, "once");
    await press(p, "filingapprove", { confirm: true });
    assert.equal(last(p, "filingsfor").query.action, "ACT-1");
    assert.deepEqual(last(p, "filingapprove").body, { filing: "FIL-1" });
  });

  test(`R3 (${where}): control: with no draft awaiting approval nothing is approved and the member is taken to the action; an item with another option draws no filingapprove`, async () => {
    const p = await open(path, planeOf({ queue: ok({ items: [LETTER], item_count: 1 }), filingsfor: FILINGS(DRAFT({ approval: { by: "dev", at: "2026-10-09T11:00:00Z" } })),
      filingapprove: ok({ ok: true }) }), SCR);
    await press(p, "filingapprove", { confirm: true });
    assert.equal(p.byOp("filingapprove").length, 0);
    assert.equal(p.location.pathname, "/app/action/ACT-1", "taken to the action, where its state is");
    const other = await open(path, planeOf({ queue: ok({ items: [{ ...LETTER, options: [{ id: "taskresolve" }], disposition: { available: true, op: "taskresolve" } }], item_count: 1 }) }), SCR);
    assert.ok(!ops(other).includes("filingapprove"));
  });
}

test("R17 (queue): with nothing else waiting, the photos she has not vouched for are waiting on her: the to-do is drawn and the queue is not told 'Nothing is waiting on you'; control: with no photo it is", async () => {
  const p = await open("/app/queue", planeOf({ heldcaptures: HELD(ROW("INF-H1", "https://city.example/gate")) }), SCR);
  assert.ok(text(p).includes("Photo INF-H1"));
  assert.ok(!text(p).includes(word("screen.queue.empty")));
  const none = await open("/app/queue", planeOf({ heldcaptures: HELD() }), SCR);
  assert.ok(text(none).includes(word("screen.queue.empty")));
});

test("R17 (home): a to-do to vouch counts among the member's own on the strip; a new member's first visit draws no 'Needs you', so none", async () => {
  const p = await open("/app", planeOf({ heldcaptures: HELD(ROW("INF-H1", null)) }), SCR);
  assert.ok(text(p).includes(word("screen.home.needsyou")));
  assert.ok(text(p).includes(word("screen.home.strip.you")), "the strip reads one of hers");
  const quiet = await open("/app", planeOf({ heldcaptures: HELD() }), SCR);
  assert.ok(!text(quiet).includes(word("screen.home.strip.you")), "control: with none, no reading");
  const first = await open("/app", planeOf({ heldcaptures: HELD(ROW("INF-H1", null)), lookedsince: ok({ since: null }) }), SCR);
  assert.ok(!text(first).includes(word("screen.home.needsyou")));
  assert.ok(!ops(first).includes("release"));
});

// C70 (fix round 2): the vouch to-dos are counted and drawn once with the list.
const PROJ = (id, title) => ({ state: "determined", ungrouped: false, ancestors: [{ id, type: "project", title, depth: 1 }] });
const TASKS = [
  { id: "TSK-1", assignee: "mai", class: "OBLIGATION", kind: "check-requested", case: PROJ("PROJ-1", "Pothole repairs"), subject: { kind: "bundle", id: "INF-7", title: "Work orders" }, summary: "Check the first count", options: [], disposition: { available: false, instead: "taskresolve" } },
  { id: "TSK-2", assignee: "mai", class: "OBLIGATION", kind: "check-requested", case: NONE, subject: { kind: "bundle", id: "INF-8", title: "Memo" }, summary: "Check the memo", options: [], disposition: { available: false, instead: "taskresolve" } },
];
const HELDAT = (id, address, since) => ({ ...ROW(id, address), collected_since: since });

test("R17, C70 (queue): the vouch to-dos are counted with the list and grouped in it, with no case; with none held none is added", async () => {
  const held = HELD(HELDAT("INF-H1", "https://city.example/gate", "2026-10-02T10:00:00Z"), HELDAT("INF-H2", "https://city.example/lot", "2026-10-03T10:00:00Z"));
  const p = await open("/app/queue", planeOf({ queue: ok({ items: TASKS, item_count: 2 }), heldcaptures: held }), SCR);
  assert.ok(text(p).includes(word("screen.queue.count.many", { n: "4" })), "two items and two vouch to-dos are four");
  const sections = main(p).querySelectorAll("section.mk-sec");
  const uncased = sections.find((s) => text(p, s.querySelector("h2")) === word("screen.queue.nocase"));
  assert.equal(uncased.querySelectorAll('button[data-act="release"]').length, 2, "the vouch to-dos are in the group of what is in no case");
  assert.equal(main(p).querySelectorAll('button[data-act="release"]').length, 2, "each drawn once");
  const none = await open("/app/queue", planeOf({ queue: ok({ items: TASKS, item_count: 2 }), heldcaptures: HELD() }), SCR);
  assert.ok(text(none).includes(word("screen.queue.count.many", { n: "2" })), "control: none held adds none");
});

for (const [where, path] of screens) {
  test(`R17, C70 (${where}): the list is drawn once, with the vouch to-dos: while her captures are being read it is not drawn without them`, async () => {
    let open1;
    const gate = new Promise((r) => { open1 = r; });
    const p = await open(path, planeOf({ queue: ok({ items: TASKS, item_count: 2 }), heldcaptures: async () => { await gate; return HELD(HELDAT("INF-H1", "https://city.example/gate", "2026-10-02T10:00:00Z")); } }), SCR);
    assert.ok(!text(p).includes("Check the memo"), "not drawn before her captures are read");
    assert.ok(!text(p).includes("Photo INF-H1"));
    assert.ok(main(p).querySelector('[data-state="loading"]'), "it says it is loading");
    if (where === "home") assert.ok(!text(p).includes(word("screen.home.strip.you")), "no strip reading before the count is whole");
    open1();
    await settle();
    assert.ok(text(p).includes("Check the memo") && text(p).includes("Photo INF-H1"), "both at once");
    assert.equal(main(p).querySelectorAll('button[data-act="release"]').length, 1);
    if (where === "home") assert.ok(text(p).includes(word("screen.home.strip.you")));
  });
}
