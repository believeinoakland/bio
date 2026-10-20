/* screens-inquiry R75 (T51-119): `project`, an owner stands down by a vote that shows what it takes and what to check first
 * (state e), and R70 as it binds `project`; on interface-shell's served page over a scripted plane. Every expectation is a word
 * read by key (R44). Dates and counts the page draws are read through the same words and the answer's own numbers. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { hasWord } from "../../../src/setup-words/index.mjs";
import { open, main, actsIn, fill, press, says, word, rawKeys, SCREENS, P } from "./fixtures.mjs";

/* every owner's declarations, registered once before the first read (test-support R17, K4245): the project's acts name ops its owners declare */


const at = "/app/project/" + P;
/* a day as `cs.date` draws it, read through the same words (DEC-333), never copied */
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const day = (iso) => { const [y, m, d] = iso.slice(0, 10).split("-").map(Number); return word("date.daymonthyear", { day: String(d), month: word("date.month." + MONTHS[m - 1]), year: String(y) }); };
/* membership R38's answer: the table for 1 to 9 owners and the live row (a plane fixture of that shape) */
const MATH = (n) => (n <= 1 ? { owners: n, votesNeeded: 0, eligibleVoters: 0, targetMayVote: false, possible: false }
  : n === 2 ? { owners: 2, votesNeeded: 2, eligibleVoters: 2, targetMayVote: true, possible: true }
  : { owners: n, votesNeeded: Math.floor(n / 2) + 1, eligibleVoters: n - 1, targetMayVote: false, possible: Math.floor(n / 2) + 1 <= n - 1 });
const arith = (n) => ok({ ok: true, table: [1, 2, 3, 4, 5, 6, 7, 8, 9].map(MATH), live: MATH(n), projectId: P });
const roster = (...rows) => ok({ ok: true, projectId: P, participants: rows });
const owner = (handle, extra = {}) => ({ handle, state: "joined", owner: 1, ...extra });
/* mai is the harness's member */
const TWO = roster(owner("dev"), owner("mai"));
const THREE = roster(owner("dev"), owner("mai"), owner("rosa"));
const SOLE = roster(owner("mai"));
const stateE = (p) => main(p).querySelector('[data-state-e="votes"]');
const checks = (p) => main(p).querySelectorAll("[data-check]");
const opened = async (plane, who = "mai") => {
  const p = await open(at, { plane });
  const row = main(p).querySelectorAll(".cs-row").find((r) => r.querySelector('button[data-act="projectownerremove"]') && r.textContent.includes(who));
  await press(p, "projectownerremove", { within: row });
  return p;
};
const shortAnswer = (extra) => ({ status: 200, json: { ok: true, result: { ok: false, reason: "VOTES_SHORT", code: "VOTES_SHORT", projectId: P, handle: "mai", ...extra } } });

test("R75 two owners, one standing down: pressing Stand down opens the vote in place and sends nothing; it draws what it takes (the live row of the table marked), who has voted, the five checks and the reason field", async () => {
  const p = await opened({ projectparticipants: TWO, projectownerarith: arith(2) });
  assert.equal(p.byOp("projectownerremove").length, 0, "nothing is sent by opening it");
  assert.equal(p.byOp("projectownerarith")[0].query.projectId, P);
  const e = stateE(p);
  assert.ok(e, "state e is drawn in place");
  /* what it takes: the whole table, the live row marked, from the answer's own numbers */
  const live = main(p).querySelector('[data-arith="owners"] tr[aria-current="true"]');
  assert.equal(live.getAttribute("data-owners"), "2");
  assert.equal(main(p).querySelectorAll('[data-arith="owners"] tbody tr').length, 9, "the whole table, 1 to 9 owners");
  assert.deepEqual(main(p).querySelectorAll('[data-arith="owners"] th').map((th) => th.textContent),
    ["owners", "takes", "why"].map((k) => word("screen.project.scale.head." + k)), "the table's column headings, by their keys");
  /* the headings of the three sections, by their keys; the live row said as a sentence with the departing owner's own vote at two owners */
  const heads = main(p).querySelectorAll("h2").map((h) => h.textContent);
  for (const k of ["screen.project.standdown.heading", "screen.project.how.it.changes.with.the", "screen.project.standdown.beforevote"]) assert.ok(heads.includes(word(k)), k);
  assert.ok(says(e, "screen.project.this.takes.2.of.2", { n: "2", total: "2", member: "mai" }) && says(e, "screen.project.with.two.owners.standing.down"), "what it takes, at two owners");
  assert.ok(says(e, "screen.project.standdown.notyet", { member: "dev" }) && says(e, "screen.project.standdown.notyet", { member: "mai" }), "each owner who has not voted");
  assert.ok(says(e, "screen.project.the.change.waits.for.ana", { member: "dev" }), "and what the change waits for");
  assert.ok(!says(e, "screen.project.standdown.agreed", { member: "dev" }), "nobody has agreed");
  assert.ok(!says(e, "refusal.VOTES_SHORT"), "control: no short-vote refusal before one is answered");
  assert.ok(says(live, "screen.project.scale.now") && says(e, "screen.project.dev.is.standing.down.as", { member: "mai" }), "R75 the (now) marker and the standing-down subtitle");
  assert.ok(says(live, "screen.project.2.of.2.the.departing") && says(live, "screen.project.both.agree.a.resignation.the"), "the two-owner row in the drawing's words");
  assert.ok(says(main(p), "screen.project.how.it.changes.with.the") && says(main(p), "screen.project.owners.follow.the.same.rule"));
  /* each owner, and whether she has voted (nobody has) */
  const voters = e.querySelectorAll("[data-vote-for]");
  assert.deepEqual(voters.map((v) => [v.getAttribute("data-vote-for"), v.getAttribute("data-voted")]), [["dev", "no"], ["mai", "no"]]);
  assert.ok(!e.querySelector('[data-agreed="so-far"]'), "no count at zero");
  /* the five checks as the design gives them, each with its mark; all hold at two owners and the departing owner's vote counts */
  const c = checks(p);
  assert.deepEqual(c.map((x) => x.getAttribute("data-check")), ["1", "2", "3", "4", "5"]);
  assert.deepEqual(c.slice(0, 4).map((x) => x.getAttribute("data-holds")), ["yes", "yes", "yes", "yes"]);
  assert.ok(says(c[0], "screen.project.ownerstand.you.are.an.owner.of"));
  assert.ok(says(c[1], "screen.project.ownerstand.an.owner.is.named.dev", { member: "dev" }));
  assert.ok(says(c[2], "screen.project.ownerstand.standing.down.is.possible.at") && says(c[2], "screen.project.ownerstand.with.2.owners.an.owner"));
  assert.ok(says(c[3], "screen.project.ownerstand.this.is.a.vote.you") && says(c[3], "screen.project.ownerstand.at.2.owners.the.departing"));
  assert.ok(says(c[4], "screen.project.ownerstand.a.reason.in.your.words") && says(c[4], "screen.project.ownerstand.nothing.is.drafted.or.suggested"));
  assert.ok(says(c[4], "screen.project.ownerstand.required"), "the reason is marked required, by its key");
  assert.ok(p.doc.getElementById("project-ownerstand-reason"), "her reason, written by her");
  assert.ok(!actsIn(main(p)).includes("writinghelp"), "no writing help, no draft");
  assert.ok(says(main(p), "screen.project.ownerstand.a.project.with.no.owner") && says(main(p), "screen.project.ownerstand.check.that.another.owner.remains"));
  assert.deepEqual(rawKeys(p.root()), []);
});

test("R75 sending the vote: no reason sends nothing and says so; with her reason it sends projectownerremove with the target and the reason, and draws the counts the answer gives", async () => {
  const p = await opened({ projectparticipants: TWO, projectownerarith: arith(2), projectownerremove: shortAnswer({ have: 1, need: 2, deciders: ["mai"] }) });
  const cast = () => stateE(p).querySelector('button[data-act="projectownerremove"]');
  assert.ok(cast(), "the act is offered on her own row");
  await p.click(cast());
  await p.settle();
  assert.equal(p.byOp("projectownerremove").length, 0, "with no reason nothing is sent");
  assert.ok(says(p.root(), "shell.reason.needed"), "and the reason is asked for, in words");
  fill(p, { "project-ownerstand-reason": "I am stepping back; dev carries it." });
  await p.click(cast());
  await p.settle();
  const q = p.byOp("projectownerremove")[0].query;
  assert.deepEqual([q.projectId, q.handle, q.reason], [P, "mai", "I am stepping back; dev carries it."]);
  /* the counts redrawn from the answer (VOTES_SHORT: have a count, need the threshold); the vote stays open */
  assert.ok(stateE(p), "still open");
  assert.ok(says(stateE(p), "screen.project.1.of.2.have.agreed", { n: "1", total: "2" }));
  assert.equal(stateE(p).querySelector('[data-vote-for="mai"]').getAttribute("data-voted"), "yes");
  /* a short vote is said by its own words (the vote is recorded, the removal waits) and its row now reads agreed */
  assert.ok(says(stateE(p), "refusal.VOTES_SHORT"), "VOTES_SHORT by its words, in the vote");
  assert.ok(says(stateE(p).querySelector('[data-vote-for="mai"]'), "screen.project.standdown.agreed", { member: "mai" }));
  assert.ok(says(stateE(p).querySelector('[data-vote-for="dev"]'), "screen.project.standdown.notyet", { member: "dev" }), "and dev has not");
  /* CONSENSUS_REQUIRED, as the requirement words it: have and awaiting named */
  const waiting = ok({ ok: true, projectId: P, changes: [{ change: "remove", target: "dev", proposed_by: "rosa", proposed_at: "2026-10-09T09:00:00Z", agreed: ["rosa"], awaiting: ["mai"] }] });
  const k = await open(at, { plane: { projectparticipants: THREE, projectownerarith: arith(3), projectownervotes: waiting,
    projectownerremove: { status: 200, json: { ok: true, result: { ok: false, reason: "CONSENSUS_REQUIRED", code: "CONSENSUS_REQUIRED", projectId: P, handle: "dev", have: ["rosa"], awaiting: ["mai"] } } } } });
  await k.click(main(k).querySelector('[data-pending="remove"] ~ .mk-actwrap button[data-act="projectownerremove"], button[data-act="projectownerremove"][data-handle="dev"]'));
  await k.settle();
  fill(k, { "project-ownerstand-reason": "dev has handed it over" });
  await k.click(stateE(k).querySelector('button[data-act="projectownerremove"]'));
  await k.settle();
  assert.deepEqual([k.byOp("projectownerremove")[0].query.handle, k.byOp("projectownerremove")[0].query.reason], ["dev", "dev has handed it over"]);
  assert.ok(stateE(k), "the vote stays open");
  assert.ok(says(stateE(k), "screen.project.1.of.2.have.agreed", { n: "1", total: "2" }), "counted from have and awaiting");
});

test("R75 a three-owner project: 2 of 3 on the live row; the owner standing down casts none (check 4 does not hold, nothing offered); another owner's agree opens the same vote", async () => {
  const votes = ok({ ok: true, projectId: P, changes: [{ change: "remove", target: "rosa", proposed_by: "dev", proposed_at: "2026-10-09T09:00:00Z", agreed: ["dev"], awaiting: ["mai"] }] });
  const p = await open(at, { plane: { projectparticipants: THREE, projectownerarith: arith(3), projectownervotes: votes, projectownerremove: shortAnswer({ have: 2, need: 2 }) } });
  /* mai has not agreed to rosa standing down: the pending line offers her the act, which opens the vote */
  const agree = main(p).querySelector('[data-pending="remove"] button[data-act="projectownerremove"], section button[data-act="projectownerremove"][data-handle="rosa"]');
  assert.ok(agree, "she agrees by the same act");
  await p.click(agree);
  await p.settle();
  assert.equal(p.byOp("projectownerremove").length, 0, "opening it sends nothing");
  const e = stateE(p);
  const live = main(p).querySelector('[data-arith="owners"] tr[aria-current="true"]');
  const row = MATH(3);
  assert.deepEqual([...live.querySelectorAll("td")].map((td) => td.textContent).slice(1), [word("screen.project.scale.takes", { votes: String(row.votesNeeded), owners: String(row.owners) }), word("screen.project.scale.who", { voters: String(row.eligibleVoters), owners: String(row.owners) })], "the live row is the answer's: 2 of 3, 2 may vote, by their keys");
  assert.ok(live.querySelector("td").textContent.includes(word("screen.project.scale.now")), "the live row carries the (now) marker");
  assert.ok(says(e, "screen.project.dev.is.standing.down.as", { member: "rosa" }), "the state-e subtitle names who is standing down");
  assert.ok(says(e, "project.owners.pending.remove", { who: "rosa", by: "dev", date: day("2026-10-09"), agreed: "dev", awaiting: "mai" }));
  assert.ok(says(e, "screen.project.1.of.2.have.agreed", { n: "1", total: String(row.votesNeeded) }), "k of m have agreed so far");
  assert.ok(says(e, "screen.project.standdown.takes", { n: String(row.votesNeeded), total: String(row.owners) }), "what it takes, from the live row");
  assert.ok(says(e, "screen.project.standdown.agreed", { member: "dev" }) && says(e, "screen.project.by.standing.down.17.october", { date: day("2026-10-09") }) === false, "dev agreed (he proposed it, and is not the one standing down)");
  assert.ok(says(e, "screen.project.standdown.notyet", { member: "mai" }) && says(e, "screen.project.the.change.waits.for.ana", { member: "mai" }), "mai has not, and the change waits for her");
  assert.ok(says(e.querySelector('[data-vote-for="mai"]'), "screen.project.agree.dev.stands.down.as", { member: "rosa" }), "her act reads Agree: rosa stands down as owner");
  assert.deepEqual(checks(p).slice(0, 4).map((x) => x.getAttribute("data-holds")), ["yes", "yes", "yes", "yes"]);
  /* control: her own row at three owners: she casts none */
  const own = await opened({ projectparticipants: THREE, projectownerarith: arith(3) });
  const c = checks(own);
  assert.equal(c[3].getAttribute("data-holds"), "no", "check 4 does not hold at three owners for the one standing down");
  assert.ok(says(c[3], "refusal.TARGET_CANNOT_VOTE"), "with its reason");
  assert.equal(stateE(own).querySelectorAll('button[data-act="projectownerremove"]').length, 0, "the act is not offered");
  assert.equal(own.byOp("projectownerremove").length, 0);
});

test("R75 a vote she already cast draws as cast and offers no second; the plane's ALREADY_VOTED and NO_REASON are drawn by their words", async () => {
  const votes = ok({ ok: true, projectId: P, changes: [{ change: "remove", target: "mai", proposed_by: "mai", proposed_at: "2026-10-09T09:00:00Z", agreed: ["mai"], awaiting: ["dev"] }] });
  /* R122: with her removal already waiting, her row says the vote is open and offers no second stand-down */
  const p = await open(at, { plane: { projectparticipants: TWO, projectownerarith: arith(2), projectownervotes: votes } });
  const mine = main(p).querySelectorAll(".cs-row").find((r) => r.textContent.includes("mai"));
  assert.ok(says(mine, "project.owners.standdown.opened", { awaiting: "dev" }));
  assert.equal(mine.querySelectorAll('button[data-act="projectownerremove"]').length, 0, "and no second is offered");
  for (const code of ["ALREADY_VOTED", "NO_REASON", "LAST_OWNER", "NOT_AN_OWNER"]) assert.ok(hasWord("refusal." + code), code);
  const refused = await opened({ projectparticipants: TWO, projectownerarith: arith(2), projectownerremove: refusedIn("ALREADY_VOTED") });
  fill(refused, { "project-ownerstand-reason": "again" });
  await refused.click(stateE(refused).querySelector('button[data-act="projectownerremove"]'));
  await refused.settle();
  assert.ok(says(refused.root(), "refusal.ALREADY_VOTED"), "by its words");
});

test("R75 controls: a member who is not an owner is drawn no stand-down and no checks; a removal that would leave no owner is not offered (check 3)", async () => {
  /* ana is a member, not an owner (the harness's mai is not in this roster as an owner) */
  const m = await open(at, { plane: { projectparticipants: roster(owner("dev"), { handle: "mai", state: "joined", owner: 0 }), projectownerarith: arith(1) } });
  assert.ok(!actsIn(main(m)).includes("projectownerremove"), "no owner act");
  assert.equal(checks(m).length, 0);
  assert.equal(m.byOp("projectownerarith").length, 0, "and the table is not read for her");
  /* the last owner: standing down is not possible at this size; the act is not offered, and the reason is her refusal's words */
  const p = await opened({ projectparticipants: SOLE, projectownerarith: arith(1) });
  const c = checks(p);
  assert.equal(c[2].getAttribute("data-holds"), "no");
  assert.ok(says(c[2], "refusal.LAST_OWNER"));
  assert.equal(c[1].getAttribute("data-holds"), "no", "and no other owner is named");
  assert.equal(stateE(p).querySelectorAll('button[data-act="projectownerremove"]').length, 0);
  assert.equal(p.byOp("projectownerremove").length, 0);
  /* a table that cannot be read is drawn failed, never as a table of zeros */
  const f = await opened({ projectparticipants: TWO, projectownerarith: refusedIn("SOME_REFUSAL", "Could not read it.") });
  assert.ok(main(f).querySelector('[data-state-e="failed"] [data-state="failed"], [data-state="failed"]'));
  assert.equal(main(f).querySelectorAll('[data-arith="owners"]').length, 0);
});

test("R70 as it binds project: no state chip is drawn where the drawing draws none, and no state word of an item stands in the words of this screen", async () => {
  const p = await open(at);
  for (const kind of ["review", "reviewed", "retired", "open", "concluded", "deferred", "dismissed", "divided", "published", "waiting", "planned", "active", "resolved", "abandoned", "flagged", "watched"])
    assert.ok(!main(p).querySelectorAll("*").some((el) => el.children.length === 0 && el.textContent.trim() === word("state.item." + kind + ".name")), `no ${kind} chip`);
  assert.equal(main(p).querySelectorAll(".cs-chip, [data-chip]").length, 0);
  const project = SCREENS.find((s) => s.id === "project");
  assert.ok(project.words.every((k) => hasWord(k)), "every key the screen holds is a word of the list");
});
