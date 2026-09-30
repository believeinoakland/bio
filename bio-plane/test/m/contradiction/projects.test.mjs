/* contradiction R49–R55, R19 (DEC-85 as K456 clarified it): a conflict between projects whose other side a member may
   not see — the notice, the opt-in, the reveal, responses and their relay — over the fixture DEC-85 names: two
   projects, each hidden from the other, drawing on the two sides of one duty. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, sha, MACHINE } from "./fixture.mjs";
import { refusedWith } from "./seed.mjs";
import { CONTRADICTION_CANDIDATE_CHECKS, NOTICE_SENTENCE, NOTICE_RESPONSES_MAX, EMAIL_MAX } from "../../../src/contradiction/index.mjs";
import { MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";

const ROWS = CONTRADICTION_CANDIDATE_CHECKS;
const refused = (r, code) => refusedWith(assert, ROWS, r, code);
const RUN = "RUN-2026-0001";
const PA = "PROJ-2026-0001-alpha", PB = "PROJ-2026-0002-beta";
const HA = sha("passage held by alpha"), HB = sha("passage held by beta");
const IX = "INQ-2026-0001-x", IY = "INQ-2026-0002-y";
const M1 = "member:m1", M2 = "member:m2", M3 = "member:m3", OUT = "member:outsider";

/* m2 takes part in alpha only, m3 in beta only; m1 in both (sees the conflict whole). Alpha's passage is filed in
   alpha, beta's in beta; each project draws on the question resting on its own passage. */
function twoHidden({ label = "record", extraParties = [] } = {}) {
  const w = world();
  w.runs.set(RUN, { status: "running", principal: M1 });
  w.project(PA, [{ id: "m2", owner: 1 }, "m1"]);
  w.project(PB, [{ id: "m3", owner: 1 }, "m1"]);
  w.content(HA, "capHA", PA, { ref: "p. 3 of alpha's minutes" });
  w.content(HB, "capHB", PB, { ref: "p. 9 of beta's report" });
  w.inquiry(IX); w.leg(IX, 0, "supports", { content: HA, target: PA });
  w.inquiry(IY); w.leg(IY, 0, "supports", { content: HB, target: PB });
  w.resolution("capHA", PA, "E1"); w.resolution("capHB", PB, "E1");
  w.reading("capHA", PA, { contentType: "minutes", date: "2026-01-01" });
  w.reading("capHB", PB, { contentType: "report", date: "2026-02-01" });
  w.draws(IX, PA); w.draws(IY, PB);
  for (const p of extraParties) { w.project(p, [{ id: "m3", owner: 1 }]); w.draws(IY, p); }
  const pair = w.c.pairs({ key: "K4", viewer: MACHINE }).pairs[0];
  const r = w.c.propose({ run: RUN, proposedBy: "class:ai/t", viewer: MACHINE, caller: M1,
                          proposals: [{ key: "K4", a: pair.a, b: pair.b, label, reason: "alpha's minutes and beta's report disagree" }] });
  w.id = r.candidates[0].candidate;
  return w;
}
const notices = (w, project, viewer) => w.c.conflictNotices({ project, viewer });

test("R49: parties are the projects reached through each side; a conflict between projects is a standing duty or plurality; a viewer sees it half when they may see exactly one side", () => {
  const w = twoHidden();
  assert.equal(notices(w, PA, M2).notices.length, 1);
  assert.equal(notices(w, PB, M3).notices.length, 1);
  assert.equal(notices(w, PA, M1).notices.length, 0);           /* m1 sees it whole: not a notice */
  /* a lead is not a conflict between projects: no notice */
  const lead = twoHidden({ label: "world" });
  assert.deepEqual(notices(lead, PA, M2).notices, []);
  /* resolved is no longer standing */
  w.c.clarify({ candidate: w.id, choice: "one_wrong", wrongSide: "a", reason: "r", viewer: M1, author: M1 });
  assert.deepEqual(notices(w, PA, M2).notices, []);
});

test("R50: refusals in order — the existence answer, no such project, a viewer who is not a joined participant", () => {
  const w = twoHidden();
  w.project("PROJ-2026-0003-open", ["m3"], { visibility: "discoverable" });
  const ex = notices(w, "PROJ-2026-0003-open", M2);
  assert.equal(ex.code, "PROJECT_SEEN_NOT_A_PARTICIPANT");
  for (const [project, viewer] of [["PROJ-2026-0404-none", M2], [PB, M2], [null, M2], [IX, M2]]) {
    const r = notices(w, project, viewer);
    assert.equal(r.code, "NO_SUCH_PROJECT", JSON.stringify([project, viewer]));
  }
  w.participant(PA, "outsider", { state: "invited" });
  const np = notices(w, PA, OUT);
  assert.equal(np.code, "NOT_A_PARTICIPANT");
  assert.equal(np.check, MEMBERSHIP_CHECKS.NOT_A_PARTICIPANT.check);
});

test("R50, R55: a notice carries the seen side verbatim and the fixed sentence, and withholds the other side, the key, the machine's reason and the party count", () => {
  const w = twoHidden();
  const n = notices(w, PA, M2).notices[0];
  assert.deepEqual([n.candidate, n.project, n.weight, n.state], [w.id, PA, "duty", "open"]);
  assert.deepEqual([n.side.content_id, n.side.capture_sha, n.side.ref, n.side.doctype, n.side.date, n.side.source.bundle],
                   [HA, "capHA", "p. 3 of alpha's minutes", "minutes", "2026-01-01", PA]);
  assert.equal(n.says, NOTICE_SENTENCE);
  assert.equal(NOTICE_SENTENCE, "Something this project rests on is in conflict with a record you cannot see. Neither that record nor who holds it is shown. Your project can ask to resolve it. If every project holding a side asks, the projects are named to each other's members, and you can respond.");
  assert.deepEqual([n.opted_in, n.asked_by_another, n.revealed, n.parties, n.responses], [null, false, false, undefined, []]);
  const bytes = JSON.stringify(notices(w, PA, M2));
  for (const leak of [HB, "capHB", PB, "beta", IY, "report", "K4", "disagree", "why", "explanation"]) assert.ok(!bytes.includes(leak), leak);
  /* the same bytes with one hidden party and with three */
  const three = twoHidden({ extraParties: ["PROJ-2026-0005-gamma", "PROJ-2026-0006-delta"] });
  assert.equal(JSON.stringify(notices(three, PA, M2)).replaceAll(three.id, "ID"), bytes.replaceAll(w.id, "ID"));
  /* the page */
  assert.deepEqual([notices(w, PA, M2).limit, notices(w, PA, M2).truncated, notices(w, PA, M2).cursor], [50, false, w.id]);
  assert.deepEqual(w.c.conflictNotices({ project: PA, after: w.id, viewer: M2 }).notices, []);
});

test("R27, R19: the seen side reads unseen_conflict for a joined participant of a party reached through it, and nothing else of the other side; nobody else is told", () => {
  const w = twoHidden();
  const ref = [{ ref: HA, version: "capHA" }];
  assert.deepEqual(w.c.tensionsOn({ referents: ref, viewer: M2 }).referents[0].marks,
                   [{ mark: "unseen_conflict", candidate: w.id, weight: "duty", project: PA }]);
  assert.deepEqual(w.c.tensionsOn({ referents: ref, viewer: M1 }).referents[0].marks, [{ mark: "in_tension", candidate: w.id }]);
  assert.deepEqual(w.c.tensionsOn({ referents: ref, viewer: OUT }).referents[0].marks, []);
  /* a member of alpha who has not joined is told nothing */
  w.participant(PA, "outsider", { state: "invited" });
  assert.deepEqual(w.c.tensionsOn({ referents: ref, viewer: OUT }).referents[0].marks, []);
  /* the half-seen conflict is not answered as a candidate */
  assert.deepEqual(w.c.candidatesFor({ on: { candidate: w.id }, viewer: M2 }).candidates, []);
  refused(w.c.contextFacts({ candidate: w.id, viewer: M2 }), "NO_SUCH_CANDIDATE");
});

test("R51: opt-in refusals in order; an opt-in is the project's act; a repeat answers already with the first; the others learn only asked_by_another", () => {
  const w = twoHidden();
  const opt = (a) => w.c.optIn({ candidate: w.id, project: PA, viewer: M2, author: M2, ...a });
  refused(opt({ author: "class:ai" }), "MACHINE_CANNOT_ACT_ON_CANDIDATE");
  refused(opt({ candidate: "" }), "NO_CANDIDATE");
  assert.equal(opt({ project: PB }).code, "NO_SUCH_PROJECT");
  refused(opt({ candidate: sha("none") }), "NO_SUCH_CANDIDATE");
  /* a project that is a party only through the side the viewer cannot see */
  w.participant(PB, "m2", {}); w.participant(PA, "m3", {});
  w.project("PROJ-2026-0007-zeta", ["m2"]);
  const notParty = w.c.optIn({ candidate: w.id, project: "PROJ-2026-0007-zeta", viewer: M2, author: M2 });
  refused(notParty, "NOT_A_PARTY");
  const lead = twoHidden({ label: "world" });
  refused(lead.c.optIn({ candidate: lead.id, project: PA, viewer: M2, author: M2 }), "NOT_A_PROJECT_CONFLICT");
  const closed = twoHidden();
  closed.c.clarify({ candidate: closed.id, choice: "one_wrong", wrongSide: "a", reason: "r", viewer: M1, author: M1 });
  refused(closed.c.optIn({ candidate: closed.id, project: PA, viewer: M2, author: M2 }), "CANDIDATE_CLOSED");
  const f = twoHidden();
  const r0 = f.c.optIn({ candidate: f.id, project: PA, words: "x".repeat(501), viewer: M2, author: M2 });
  refused(r0, "WORDS_MALFORMED");
  const r = f.c.optIn({ candidate: f.id, project: PA, words: "we would like to settle this", viewer: M2, author: M2 });
  assert.deepEqual([r.ok, r.wrote, r.revealed], [true, true, false]);
  const again = f.c.optIn({ candidate: f.id, project: PA, words: "again", viewer: M2, author: M2 });
  assert.deepEqual([again.already, again.wrote, again.opted_in.words, again.opted_in.member], [true, false, "we would like to settle this", M2]);
  const own = notices(f, PA, M2).notices[0];
  assert.deepEqual([own.opted_in.member, own.asked_by_another], [M2, false]);
  const other = notices(f, PB, M3).notices[0];
  assert.deepEqual([other.opted_in, other.asked_by_another, other.revealed], [null, true, false]);
  assert.ok(!JSON.stringify(other).includes(PA));                 /* never named, nor counted */
});

test("R52: the last opt-in records one reveal naming the parties; they see each other's names; a later party joins when it opts in; a truncated side records none; sight is never widened", () => {
  const w = twoHidden();
  w.c.optIn({ candidate: w.id, project: PA, viewer: M2, author: M2 });
  const last = w.c.optIn({ candidate: w.id, project: PB, viewer: M3, author: M3 });
  assert.deepEqual([last.ok, last.revealed], [true, true]);
  const reveals = w.rows(`SELECT parties FROM contradiction_optins WHERE kind='revealed'`);
  assert.deepEqual(reveals.map((r) => JSON.parse(r.parties)), [[PA, PB]]);
  const a = notices(w, PA, M2).notices[0], b = notices(w, PB, M3).notices[0];
  assert.deepEqual([a.revealed, a.parties], [true, [{ id: PB, name: `title of ${PB}` }]]);
  assert.deepEqual([b.revealed, b.parties], [true, [{ id: PA, name: `title of ${PA}` }]]);
  /* sight is not widened: the other side stays unseen, and no act reaches it */
  assert.ok(!JSON.stringify(a).includes(HB));
  assert.deepEqual(w.c.candidatesFor({ on: { candidate: w.id }, viewer: M2 }).candidates, []);
  refused(w.c.clarify({ candidate: w.id, choice: "one_wrong", wrongSide: "a", reason: "r", viewer: M2, author: M2 }), "NO_SUCH_CANDIDATE");
  /* a party arriving after the reveal gets a notice, and is revealed only when it opts in; no second reveal is recorded */
  const late = "PROJ-2026-0008-late";
  w.project(late, [{ id: "m3", owner: 1 }]); w.draws(IY, late);
  const n = notices(w, late, M3).notices[0];
  assert.deepEqual([n.revealed, n.parties, n.asked_by_another], [false, undefined, true]);
  w.c.optIn({ candidate: w.id, project: late, viewer: M3, author: M3 });
  assert.deepEqual(notices(w, late, M3).notices[0].parties.map((p) => p.id), [PA, PB]);
  assert.equal(w.count("contradiction_optins"), 4);               /* three opt-ins and one reveal */
  /* truncated parties: no reveal, and the notice says so */
  const t = twoHidden();
  for (let i = 0; i < 33; i++) { const p = `PROJ-2026-${String(100 + i).padStart(4, "0")}-p`; t.project(p, ["m3"]); t.draws(IY, p); }
  const tn = notices(t, PA, M2).notices[0];
  assert.equal(tn.reveal_undetermined, true);
  t.c.optIn({ candidate: t.id, project: PA, viewer: M2, author: M2 });
  assert.equal(t.rows(`SELECT 1 FROM contradiction_optins WHERE kind='revealed'`).length, 0);
});

test("R53: respond — R51's first seven, not before opt-in, a text, its cap, a well-formed disclosure of one's own; cover true fills the author's own; an email is stated, not verified", () => {
  const w = twoHidden();
  const say = (a) => w.c.respond({ candidate: w.id, project: PA, text: "our minutes are the adopted text", viewer: M2, author: M2, ...a });
  refused(say({ author: "" }), "MACHINE_CANNOT_ACT_ON_CANDIDATE");
  refused(say({ candidate: null }), "NO_CANDIDATE");
  assert.equal(say({ project: PB }).code, "NO_SUCH_PROJECT");
  refused(say({ candidate: sha("x") }), "NO_SUCH_CANDIDATE");
  refused(say({}), "RESPONSE_BEFORE_OPT_IN");
  w.c.optIn({ candidate: w.id, project: PA, viewer: M2, author: M2 });
  for (const text of [null, "", "   "]) refused(say({ text }), "RESPONSE_NO_TEXT");
  refused(say({ text: "x".repeat(2001) }), "WORDS_MALFORMED");
  for (const [disclose, part] of [["cover", "the disclosure itself"], [{ name: "x" }, "name"], [{ cover: 3 }, "cover"],
                                  [{ email: "a@b" }, "email"], [{ email: "a@b.org, c@d.org" }, "email"],
                                  [{ email: `${"a".repeat(EMAIL_MAX)}@b.org` }, "email"]]) {
    const r = say({ disclose });
    refused(r, "DISCLOSURE_MALFORMED");
    assert.equal(r.part, part);
  }
  refused(say({ disclose: { cover: "Cover m3" } }), "DISCLOSURE_NOT_YOURS");
  assert.equal(w.count("contradiction_responses"), 0);
  const mine = say({ disclose: { cover: true, email: "m2@example.org" } });
  assert.deepEqual([mine.ok, mine.shared, mine.email_says], [true, { cover: true, email: true }, "stated, not verified"]);
  assert.deepEqual(w.one(`SELECT cover, email, author FROM contradiction_responses`), { cover: "Cover m2", email: "m2@example.org", author: M2 });
  /* an email another member already disclosed is not theirs to share */
  w.c.optIn({ candidate: w.id, project: PB, viewer: M3, author: M3 });
  refused(w.c.respond({ candidate: w.id, project: PB, text: "t", disclose: { email: "M2@example.org" }, viewer: M3, author: M3 }), "DISCLOSURE_NOT_YOURS");
  const none = w.c.respond({ candidate: w.id, project: PB, text: "our report is later", viewer: M3, author: M3 });
  assert.deepEqual(none.shared, { cover: false, email: false });
});

test("R54: the relay — nothing before the reveal, then every response of the other parties with only its text, chosen disclosures, project and instant; the notice carries those after the project's own latest, at most 20", () => {
  const w = twoHidden();
  w.c.optIn({ candidate: w.id, project: PA, viewer: M2, author: M2 });
  w.clock.now = "2026-09-28T01:00:00Z";
  w.c.respond({ candidate: w.id, project: PA, text: "alpha speaks first", disclose: { cover: true }, viewer: M2, author: M2 });
  /* before the reveal beta hears nothing: it has not opted in, and nothing is relayed yet */
  assert.deepEqual(notices(w, PB, M3).notices[0].responses, []);
  w.c.optIn({ candidate: w.id, project: PB, viewer: M3, author: M3 });
  const toB = notices(w, PB, M3).notices[0];
  assert.equal(toB.responses.length, 1);
  const relayed = toB.responses[0];
  assert.deepEqual(Object.keys(relayed).sort(), ["at", "cover", "project", "response", "text"]);
  assert.deepEqual([relayed.text, relayed.cover, relayed.project, relayed.at],
                   ["alpha speaks first", "Cover m2", { id: PA, name: `title of ${PA}` }, "2026-09-28T01:00:00Z"]);
  const bytes = JSON.stringify(toB);
  for (const leak of [M2, "h_m2"]) assert.ok(!bytes.includes(leak), leak);
  /* beta answers; its notice then carries only alpha's responses after beta's own latest */
  w.clock.now = "2026-09-28T02:00:00Z";
  w.c.respond({ candidate: w.id, project: PB, text: "beta replies", disclose: { email: "beta@example.org" }, viewer: M3, author: M3 });
  assert.deepEqual(notices(w, PB, M3).notices[0].responses, []);
  const toA = notices(w, PA, M2).notices[0].responses;
  assert.deepEqual(toA.map((r) => [r.text, r.email, r.email_says]), [["beta replies", "beta@example.org", "stated, not verified"]]);
  for (let i = 0; i < 21; i++) w.c.respond({ candidate: w.id, project: PB, text: `more ${i}`, viewer: M3, author: M3 });
  const many = notices(w, PA, M2).notices[0];
  assert.equal(NOTICE_RESPONSES_MAX, 20);
  assert.deepEqual([many.responses.length, many.responses_truncated, many.responses[0].text], [20, true, "more 20"]);
});

test("R54: the read — this project's own responses attributed, the others' as relayed once revealed, in the order written, a page of 50; refusals", () => {
  const w = twoHidden();
  const read = (a) => w.c.conflictResponses({ candidate: w.id, project: PA, viewer: M2, ...a });
  assert.equal(read({ project: PB }).code, "NO_SUCH_PROJECT");
  refused(read({ candidate: "" }), "NO_CANDIDATE");
  refused(read({ candidate: sha("x") }), "NO_SUCH_CANDIDATE");
  w.project("PROJ-2026-0007-zeta", ["m2"]);
  refused(read({ project: "PROJ-2026-0007-zeta" }), "NO_SUCH_CANDIDATE");      /* not a party */
  w.c.optIn({ candidate: w.id, project: PA, viewer: M2, author: M2 });
  w.c.respond({ candidate: w.id, project: PA, text: "first", viewer: M2, author: M2 });
  w.c.optIn({ candidate: w.id, project: PB, viewer: M3, author: M3 });
  w.c.respond({ candidate: w.id, project: PB, text: "second", viewer: M3, author: M3 });
  const r = read({});
  assert.deepEqual(r.responses.map((x) => [x.own, x.text, x.author]), [[true, "first", M2], [false, "second", undefined]]);
  assert.deepEqual([r.revealed, r.limit, r.truncated], [true, 50, false]);
  const p1 = read({ limit: 1 });
  assert.deepEqual([p1.responses.length, p1.truncated], [1, true]);
  assert.deepEqual(read({ after: p1.cursor }).responses.map((x) => x.text), ["second"]);
  assert.ok(!JSON.stringify(r).includes(M3));
});

test("R55: nothing answered to a viewer who sees the conflict half names or counts its other side, its kind, bundle, source, project or members, but the revealed projects and what a responder chose", () => {
  const w = twoHidden();
  w.c.clarify({ candidate: w.id, choice: "differs", coordinates: ["time_or_occasion"], explanation: "beta's report is later", viewer: M1, author: M1 });
  const all = [notices(w, PA, M2), w.c.tensionsOn({ referents: [{ ref: HA, version: "capHA" }], viewer: M2 }),
               w.c.candidatesFor({ on: { content: HA }, viewer: M2 }), w.c.candidatesFor({ on: { project: PA }, viewer: M2 })];
  const bytes = JSON.stringify(all);
  for (const leak of [HB, "capHB", PB, IY, "report", "beta", "m3", "disagree", "later"]) assert.ok(!bytes.includes(leak), leak);
});
