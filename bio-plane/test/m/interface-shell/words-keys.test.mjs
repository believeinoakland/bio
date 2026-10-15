/* interface-shell R70 (T49; K3366; DEC-257, DEC-258): words by key. The module holds no member-facing English: every key it
   reads is a word of `setup-words`, and what it draws for a key is that word filled (`word(key, vars)`). This file holds
   keys only, never a sentence. */
import test from "node:test";
import assert from "node:assert/strict";
import * as shellModule from "../../../src/interface-shell/index.mjs";
import { wordsOf } from "../../../src/interface-shell/index.mjs";
import { WORD_ROWS, word, hasWord } from "../../../src/setup-words/index.mjs";
import { boot, ok, refused, textNodes } from "./harness.mjs";
import { ALL, FIXTURE_WORDS } from "./screens.fixture.mjs";

/* the keys the module reads (words-reads.json's list for it at fa3c8b7e8e, with R65–R69's: refusal.reference for shell.trace,
   instance.test.band, screen.more.sub, rail.<k>.line, shell.card.<kind>), and the families it builds a key from */
const KEYS = [
  "date.daymonth", "date.daymonthyear", "instance.test.band", "instance.test.notice",
  "level.pause.name", "level.prompt.name", "mark.band.means", "mark.due.means",
  "mark.grade.reading", "mark.hint.label", "mark.hint.means", "mark.outward.means",
  "mark.path.working.means", "mark.path.working.name", "rail.people.line", "rail.projects.line",
  "rail.settings.line", "refusal.reference", "screen.account.name", "screen.action.name",
  "screen.answers.name", "screen.archive.name", "screen.calculation.name", "screen.case-editor.name",
  "screen.connect.name", "screen.docket.name", "screen.document.name", "screen.elsewhere.name",
  "screen.explore.name", "screen.find-in.name", "screen.group-identity.name", "screen.group.name",
  "screen.held.name", "screen.imported.name", "screen.inbox.name", "screen.matter.name",
  "screen.members.name", "screen.money.name", "screen.more.name", "screen.more.sub",
  "screen.notes.name", "screen.open-file.name", "screen.person.name", "screen.places.name",
  "screen.plan.name", "screen.proceeding.name", "screen.project.name", "screen.projectai.name",
  "screen.question.name", "screen.recovery.name", "screen.request.name", "screen.review-copy.name",
  "screen.security.name", "screen.standard.name", "screen.start-send.name", "screen.ties.name",
  "screen.timeline.name", "screen.translations.name", "screen.unavailable.name", "screen.unavailable.purpose",
  "screen.updates.name", "screen.wizards.name", "session.locked", "session.reauth",
  "shell.appearance", "shell.appearance.dark", "shell.appearance.device", "shell.appearance.holds",
  "shell.appearance.light", "shell.areas", "shell.areas.add", "shell.areas.clear",
  "shell.areas.help", "shell.areas.one", "shell.assistant", "shell.assistant.close",
  "shell.assistant.holds", "shell.band.working", "shell.cancel", "shell.card.calculation",
  "shell.card.capture", "shell.card.case-editor", "shell.card.ceremony", "shell.card.docket",
  "shell.card.document", "shell.card.knock", "shell.card.member", "shell.card.money",
  "shell.card.open", "shell.card.passage", "shell.card.person", "shell.card.plan",
  "shell.card.proceeding", "shell.card.project", "shell.card.question", "shell.card.review-copy",
  "shell.card.standard", "shell.card.timeline", "shell.confirm", "shell.copy",
  "shell.dialog.signed", "shell.dialog.signs", "shell.glance.busy", "shell.glance.more",
  "shell.glance.people", "shell.glance.quiet", "shell.glance.steady", "shell.glance.strip",
  "shell.glance.strip.sum", "shell.glance.timeline", "shell.glance.weeks", "shell.group.unnamed",
  "shell.guide", "shell.later", "shell.level.ask", "shell.level.holds",
  "shell.level.keep", "shell.level.switch", "shell.lock.other", "shell.lock.title",
  "shell.lock.unlock", "shell.mark", "shell.mark.means", "shell.more",
  "shell.noanswer", "shell.password", "shell.path", "shell.phone.larger",
  "shell.pick", "shell.picked", "shell.reason", "shell.reason.help",
  "shell.reason.needed", "shell.reason.send", "shell.reauth.send", "shell.reauth.title",
  "shell.ring.here", "shell.ring.ready", "shell.row.acts", "shell.row.open",
  "shell.row.open.holds", "shell.save", "shell.search", "shell.search.holds",
  "shell.sections", "shell.settings.title", "shell.signer.decline", "shell.signer.exactly",
  "shell.signer.load", "shell.signer.loadfile", "shell.signer.loadpass", "shell.signer.makefile",
  "shell.signer.nokey", "shell.signer.notkey", "shell.signer.passphrase", "shell.signer.passphrase.again",
  "shell.signer.passphrase.differ", "shell.signer.passphrase.help", "shell.signer.sign", "shell.signout",
  "shell.signout.does", "shell.sort", "shell.sort.holds", "shell.step.ceremony",
  "shell.step.due-date", "shell.step.imported", "shell.todo", "shell.todo.means",
  "shell.unavailable.home", "shell.unavailable.nothing", "shell.unavailable.nothing.says", "shell.unavailable.nothing.title",
  "shell.unavailable.notyours", "shell.unavailable.notyours.says", "shell.unavailable.notyours.title", "shell.unavailable.unreachable",
  "shell.unavailable.unreachable.says", "shell.unavailable.unreachable.title", "shell.unpick", "shell.unread",
  "shell.width", "shell.width.holds", "shell.you", "shell.you.holds",
  "signing.ceremony.device", "state.empty", "state.loading", "tab.more.holds",
  "tab.more.name"
];
const RAIL = ["home", "queue", "find", "add", "projects", "people", "settings"];
const WEIGHTS = ["reversible", "reasoned", "terminal", "signed", "irreversible"];
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const FAMILIES = [...RAIL.flatMap((k) => ["rail." + k + ".name", "rail." + k + ".holds"]), ...WEIGHTS.flatMap((w) => ["weight." + w + ".name", "weight." + w + ".means"]),
  ...MONTHS.map((m) => "date.month." + m), "state.failed", "tab.more.holds", "tab.more.name", "screen.more.name", "shell.more", "session.ended", "session.signedout"];

test("R70 each key the module reads is a word of setup-words (hasWord); control: a key no word holds is not", () => {
  for (const k of [...KEYS, ...FAMILIES]) assert.ok(hasWord(k), k);
  assert.equal(hasWord("shell.no.such.word"), false);
  assert.throws(() => word("shell.no.such.word"), /UNKNOWN_WORD/);
});

test("R70 the module holds no English of its own: it exports no word rows, and the words its page carries are setup-words' rows, word for word", () => {
  assert.equal(shellModule.SHELL_WORDS, undefined);
  const rows = new Map(WORD_ROWS.map((r) => [r[0], r[1]]));
  const page = new Map(wordsOf([]));
  assert.equal(page.size, rows.size);
  for (const k of [...KEYS, ...FAMILIES]) assert.equal(page.get(k), rows.get(k), k);
});

/* every text, label and explanation a fixture page draws */
function drawn(p) {
  const out = new Set();
  for (const n of textNodes(p.root())) { const t = n.data.trim(); if (t) out.add(t); }
  for (const el of p.root().querySelectorAll("[aria-label], [data-tip]")) {
    if (el.getAttribute("aria-label")) out.add(el.getAttribute("aria-label"));
    if (el.getAttribute("data-tip")) { const d = p.doc.createElement("div"); d.innerHTML = el.getAttribute("data-tip"); for (const n of textNodes(d)) { const t = n.data.trim(); if (t) out.add(t); } }
  }
  return out;
}
const HELD = ok({ items: [{ id: "h1", title: "Minutes", at: "2026-10-01" }] });

test("R70 over fixtures, what the page draws for a sample of its keys equals word(key, vars): the frame, the masthead, the rail, the tabs and the band", async () => {
  const p = await boot({ screens: ALL, plane: { projectdirectory: ok({ projects: [] }), groupidentity: ok({ ok: true, group: "g", display_name: null }), queue: ok({ items: [{ id: "q1", class: "OBLIGATION" }, { id: "q2", class: "OBLIGATION" }] }) } });
  const seen = drawn(p);
  const has = (key, vars) => assert.ok(seen.has(word(key, vars)), key);
  for (const k of ["shell.sections", "shell.path", "shell.search", "shell.signout", "shell.appearance", "shell.appearance.device", "shell.appearance.light", "shell.appearance.dark",
    "shell.width", "level.prompt.name", "tab.more.name", "mark.path.working.name", "shell.band.working", "shell.mark"]) has(k);
  for (const k of RAIL) has("rail." + k + ".name");
  has("shell.todo", { n: 2 });
  has("shell.you", { handle: "mai" });
  assert.equal(p.root().querySelector(".cs-mast .mk-grp").textContent, word("shell.group.unnamed"));
});

test("R70 over fixtures: a list's picks, sort and row controls, the lock and the unavailable states draw word(key, vars)", async () => {
  const p = await boot({ screens: ALL, path: "/app/held", plane: { heldcaptures: HELD } });
  await p.click('[data-shell="pick"]');
  const seen = drawn(p);
  const has = (key, vars) => assert.ok(seen.has(word(key, vars)), key);
  has("shell.picked", { n: 1 });
  has("shell.unpick");
  has("shell.pick", { name: "Minutes" });
  has("shell.row.open", { name: "Minutes" });
  const column = FIXTURE_WORDS.find((r) => r[0] === "screen.held.t.col.name")[1];
  has("shell.sort", { column });
  /* the unavailable states */
  const gone = await boot({ screens: ALL, path: "/app/document/c9", plane: { image: refused("NO_SUCH_CAPTURE", null, 404) } });
  const nothing = drawn(gone);
  for (const k of ["shell.unavailable.nothing.title", "shell.unavailable.nothing.says"]) assert.ok(nothing.has(word(k)), k);
  const down = await boot({ screens: ALL, path: "/app/document/c9", plane: { image: refused("BOOM", null, 503) } });
  for (const k of ["shell.unavailable.unreachable.title", "shell.unavailable.unreachable.says"]) assert.ok(drawn(down).has(word(k)), k);
  const notYours = await boot({ screens: ALL, path: "/app/document/c9", plane: { image: refused("NOT_VISIBLE", null, 403) } });
  for (const k of ["shell.unavailable.notyours.title", "shell.unavailable.notyours.says"]) assert.ok(drawn(notYours).has(word(k)), k);
});

test("R70 a refusal's reference and a failure without words are drawn by their keys (refusal.reference with the trace's first 8 characters, shell.unread)", async () => {
  const p = await boot({ screens: ALL, path: "/app/held", plane: { heldcaptures: refused("ZZ_NO_WORDS", null, 400, { trace: "0123456789abcdef" }) } });
  const text = p.root().querySelector('#cs-main [data-state="failed"]').textContent;
  assert.equal(text, word("shell.unread") + " " + word("refusal.reference", { ref: "01234567" }));
});
