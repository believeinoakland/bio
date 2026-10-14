/* standards: T45's spoken commitment and the group's own letter (R52, R53; T45-7, N893; Actions D7; v0.2 §3 Standard).
   A member's "as heard" account is `provenance` R28's authored observation (its `testify`, the register entry
   `authored` 1, its R48 read contract); the group's own sending is what the check a later module registers says it is.
   Driven at the module's interface over the test profile (`test-port-ellery`: `MCBC <n>` is a budget commitment). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, MACHINE, REASON } from "./fixture.mjs";
import { STANDARDS_CHECKS } from "../../../src/standards/index.mjs";
import { MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";

const codeOf = (r) => (r && r.ok === false ? r.reason : "ok");
const refusalRow = (r, code) => {
  assert.equal(codeOf(r), code, JSON.stringify(r).slice(0, 300));
  const row = STANDARDS_CHECKS[code] ?? MEMBERSHIP_CHECKS[code];
  assert.deepEqual([r.check, r.translation], [row.check, row.translation], code);
};
const PAGE0 = { kind: "pdf-page", page: 0 };
const LAYER = [{ step: "layer", tier: 1, container: "pdf", cap: null, measured_by: null, calibration: null }];
const commitment = (w, extra = {}) => w.declare({ cite: "MCBC 2024-7", kind: "commitment", issuer: "Marlow County Commission", ...extra });

/* A member's firsthand observation of what was said (provenance R28, `testify`), and a passage of it minted as content. */
function heard(w, words = "The chair said the commission will publish the audit by June.", by = "bob") {
  const t = w.prov.testify({ words, observedAt: "2026-09-01", author: V(by) });
  assert.equal(t.ok, true, JSON.stringify(t).slice(0, 300));
  w.ex.readings[t.capture_sha] = { chain: LAYER, pageCount: 1 };
  const m = w.content.mint({ bundleId: t.bundle_id, captureSha: t.capture_sha, extent: PAGE0, mintedBy: V(by) });
  assert.equal(m.ok, true, JSON.stringify(m).slice(0, 300));
  return { contentId: m.content_id, capSha: t.capture_sha, bundleId: t.bundle_id };
}

test("R52 a commitment held text whose every text content id is an extent of a member's authored observation is refused COMMITMENT_AS_HEARD by R1, naming the content ids, nothing written; the same declaration naming the body's letter lands (the control)", () => {
  const w = seeded();
  const a = heard(w), b = heard(w, "I heard the same at the meeting.", "carol");
  const letter = w.passage("commission-letter");
  const before = w.snapshot();
  const one = commitment(w, { text: [a.contentId] });
  refusalRow(one, "COMMITMENT_AS_HEARD");
  assert.deepEqual(one.content_ids, [a.contentId]);
  const two = commitment(w, { text: [a.contentId, b.contentId] });
  refusalRow(two, "COMMITMENT_AS_HEARD");
  assert.deepEqual(two.content_ids, [a.contentId, b.contentId], "every content id named");
  /* a found extent (R47) of the observation is the same content id: refused alike */
  refusalRow(commitment(w, { text: [{ capture_sha: a.capSha, extent: PAGE0 }] }), "COMMITMENT_AS_HEARD");
  assert.deepEqual(w.snapshot(), before, "nothing is written");
  /* the control: the same declaration naming the body's letter lands; one text row from another capture is enough */
  const ok = commitment(w, { text: [letter.contentId] });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  const mixed = commitment(w, { text: [a.contentId, letter.contentId] });
  assert.equal(mixed.ok, true, "at least one text row from another capture is held as before");
  assert.deepEqual(mixed.text, [a.contentId, letter.contentId]);
  /* only a commitment: another kind resting on an observation is not R52's */
  assert.equal(w.declare({ text: [a.contentId] }).ok, true, "an ordinance is not R52's");
  /* R1's own refusals answer first; R52 asks last, before anything is written */
  assert.equal(codeOf(commitment(w, { text: [a.contentId], reason: " " })), "STANDARD_NO_REASON");
  assert.equal(codeOf(commitment(w, { text: [a.contentId], period: { from: "2020-13-01" } })), "STANDARD_PERIOD_INVALID");
  assert.equal(codeOf(commitment(w, { text: [a.contentId], access: "members_only" })), "ACCESS_UNKNOWN");
});

test("R52 a commitment held cited whose cited_by is an extent of a member's authored observation is refused COMMITMENT_AS_HEARD, nothing written; cited by the body's letter it lands; held absent it is not R52's", () => {
  const w = seeded();
  const a = heard(w);
  const letter = w.passage("minutes");
  const before = w.snapshot();
  const r = commitment(w, { held: "cited", text: [], cited_by: { captureSha: a.capSha, extent: PAGE0 } });
  refusalRow(r, "COMMITMENT_AS_HEARD");
  assert.deepEqual(r.content_ids, [a.contentId]);
  assert.deepEqual(w.snapshot(), before, "nothing is written");
  const ok = commitment(w, { held: "cited", text: [], cited_by: { captureSha: letter.capSha, extent: PAGE0 } });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  const absent = commitment(w, { held: "absent", text: [], search: { places: ["the commission's website"] } });
  assert.equal(absent.ok, true, "a commitment looked for and not found holds no row to judge");
});

test("R52 R9 R10 a proposal of a commitment resting on an observation is stored, labelled, and cannot be adopted: R10 refuses it COMMITMENT_AS_HEARD and the proposal stays unadopted; adopted naming the body's letter it lands", () => {
  const w = seeded();
  const a = heard(w);
  const letter = w.passage("commission-letter");
  const p = w.s.standardPropose({ cite: "MCBC 2024-7", kind: "commitment", issuer: "Marlow County Commission", text: [a.contentId],
                                  why: "Said at the meeting.", proposer: MACHINE });
  assert.equal(p.ok, true, "a proposal of it may be stored");
  assert.deepEqual([p.proposal.machine_work, p.proposal.text], [true, [a.contentId]], "labelled, its text as proposed");
  const snap = w.snapshot();
  const r = w.s.standardAdopt({ proposal: p.proposal.id, author: V("bob"), viewer: V("bob"), reason: REASON });
  refusalRow(r, "COMMITMENT_AS_HEARD");
  assert.deepEqual(w.snapshot(), snap, "nothing written: no standard, no adoption");
  /* the control: the member names the body's letter as its text */
  const ok = w.s.standardAdopt({ proposal: p.proposal.id, author: V("bob"), viewer: V("bob"), reason: REASON, text: [letter.contentId] });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  assert.equal(ok.proposal, p.proposal.id);
});

test("R53 registerOwnSendingCheck takes one registration whoever makes it, through membership.listenerRefusal: a malformed one LISTENER_MALFORMED, a second LISTENER_DECLARED naming the holder; the check is asked fn({captureSha}) for a commitment's text rows only", () => {
  const w = seeded();
  refusalRow(w.s.registerOwnSendingCheck("", () => false), "LISTENER_MALFORMED");
  refusalRow(w.s.registerOwnSendingCheck("actions", "not a function"), "LISTENER_MALFORMED");
  const asked = [];
  assert.deepEqual(w.s.registerOwnSendingCheck("actions", (a) => { asked.push(a); return false; }), { ok: true, module: "actions" });
  const second = w.s.registerOwnSendingCheck("other", () => true);
  refusalRow(second, "LISTENER_DECLARED");
  assert.equal(second.module, "actions", "names the holder");
  refusalRow(w.s.registerOwnSendingCheck("actions", () => true), "LISTENER_DECLARED");
  const letter = w.passage("commission-letter");
  assert.equal(commitment(w, { text: [letter.contentId] }).ok, true);
  assert.deepEqual(asked, [{ captureSha: letter.capSha }], "asked with the capture's digest");
  asked.length = 0;
  assert.equal(w.declare({ text: [letter.contentId] }).ok, true);
  assert.deepEqual(asked, [], "another kind is never asked");
});

test("R53 a commitment whose every text row is of a capture the registered check answers is the group's own sending is refused COMMITMENT_OWN_LETTER, nothing written; one answered false lands (the control); a check that throws or answers anything but true or false is read as true (fail closed)", () => {
  const answers = { true: () => true, throws: () => { throw new Error("unreadable"); }, "a string": () => "yes",
                    null: () => null, undefined: () => undefined, "a promise": () => Promise.resolve(false), "a number": () => 1 };
  for (const [what, answer] of Object.entries(answers)) {
    const w = seeded();
    const ours = w.passage("our-confirming-letter");
    assert.equal(w.s.registerOwnSendingCheck("actions", (a) => (a.captureSha === ours.capSha ? answer() : false)).ok, true);
    const before = w.snapshot();
    const r = commitment(w, { text: [ours.contentId] });
    refusalRow(r, "COMMITMENT_OWN_LETTER");
    assert.deepEqual([r.content_ids, r.own_sending, r.as_heard], [[ours.contentId], [ours.contentId], []], what);
    assert.deepEqual(w.snapshot(), before, `${what}: nothing is written`);
  }
  /* the control: the same capture answered false is held */
  const w = seeded();
  const letter = w.passage("commission-letter");
  w.s.registerOwnSendingCheck("actions", () => false);
  assert.equal(commitment(w, { text: [letter.contentId] }).ok, true);
});

test("R53 R52 rows of the group's own sending and members' accounts together are refused COMMITMENT_OWN_LETTER naming each; one row of the body's letter beside them lands; held cited by the group's own letter is refused; with no check registered only R52's authored test applies", () => {
  const w = seeded();
  const a = heard(w);
  const ours = w.passage("our-confirming-letter"), theirs = w.passage("commission-reply");
  /* none registered: the group's own letter is not known as such, and only the authored test applies */
  assert.equal(commitment(w, { text: [ours.contentId] }).ok, true, "with none registered the own letter lands");
  refusalRow(commitment(w, { text: [a.contentId] }), "COMMITMENT_AS_HEARD");
  w.s.registerOwnSendingCheck("actions", ({ captureSha }) => captureSha === ours.capSha);
  const before = w.snapshot();
  const both = commitment(w, { text: [a.contentId, ours.contentId] });
  refusalRow(both, "COMMITMENT_OWN_LETTER");
  assert.deepEqual([both.content_ids, both.own_sending, both.as_heard], [[a.contentId, ours.contentId], [ours.contentId], [a.contentId]]);
  refusalRow(commitment(w, { text: [a.contentId] }), "COMMITMENT_AS_HEARD");   // every row heard: still R52's code
  const cited = commitment(w, { held: "cited", text: [], cited_by: { captureSha: ours.capSha, extent: PAGE0 } });
  refusalRow(cited, "COMMITMENT_OWN_LETTER");
  assert.deepEqual(w.snapshot(), before, "nothing is written");
  /* the controls: the body's reply beside them, or cited by it */
  assert.equal(commitment(w, { text: [a.contentId, ours.contentId, theirs.contentId] }).ok, true);
  assert.equal(commitment(w, { held: "cited", text: [], cited_by: { captureSha: theirs.capSha, extent: PAGE0 } }).ok, true);
  /* R10 refuses an adoption so too */
  const p = w.s.standardPropose({ cite: "MCBC 2024-7", kind: "commitment", issuer: "Marlow County Commission", text: [ours.contentId],
                                  why: "Our letter confirms it.", proposer: V("carol") }).proposal;
  refusalRow(w.s.standardAdopt({ proposal: p.id, author: V("bob"), reason: REASON }), "COMMITMENT_OWN_LETTER");
  assert.equal(w.s.standardAdopt({ proposal: p.id, author: V("bob"), reason: REASON, text: [theirs.contentId] }).ok, true);
});

test("R52 R53 the two rows are standards' own family, after C-112.62, each where naming its region in #commitmentRefusal; no translation names a merit or a place", () => {
  assert.deepEqual([STANDARDS_CHECKS.COMMITMENT_AS_HEARD.check, STANDARDS_CHECKS.COMMITMENT_OWN_LETTER.check], ["C-112.63", "C-112.64"]);
  assert.equal(STANDARDS_CHECKS.NO_SUCH_RECORD.check, "C-112.62");
  assert.equal(STANDARDS_CHECKS.COMMITMENT_AS_HEARD.where, "src/standards/index.mjs #commitmentRefusal > is-commitment-confirmed");
  assert.equal(STANDARDS_CHECKS.COMMITMENT_OWN_LETTER.where, "src/standards/index.mjs #commitmentRefusal > is-commitment-not-own-letter");
  for (const code of ["COMMITMENT_AS_HEARD", "COMMITMENT_OWN_LETTER"]) {
    const t = STANDARDS_CHECKS[code].translation;
    assert.match(t, /Nothing was written\.$/);
    assert.ok(!/merit|desirab|practice|confidential|Oakland|Alameda/i.test(t), t);
  }
  const checks = Object.values(STANDARDS_CHECKS).map((c) => c.check);
  assert.equal(new Set(checks).size, checks.length, "no check id twice");
});

test("R54 standardProposalRead answers one proposal the viewer may see, {ok, proposal: {id, kind, project, adoption}} (project null for a proposal made for none, R56): adoption null until a member adopts it, then {standard, by, at}; an absent id, a viewer the record admits to nothing, and a proposal adopted as a standard the viewer may not read are answered alike (STANDARD_NO_SUCH_PROPOSAL); it writes nothing and never throws", () => {
  const w = seeded();
  const letter = w.passage("commission-letter");
  const p = w.s.standardPropose({ cite: "MCBC 2024-7", kind: "commitment", issuer: "Marlow County Commission", text: [letter.contentId],
                                  why: "Their letter.", proposer: MACHINE }).proposal;
  const before = w.snapshot();
  /* the control: unadopted, adoption null */
  assert.deepEqual(w.s.standardProposalRead({ proposal: p.id, viewer: V("carol") }), { ok: true, proposal: { id: p.id, kind: "commitment", project: null, adoption: null } });
  const absent = w.s.standardProposalRead({ proposal: "STDP-2026-9999", viewer: V("carol") });
  refusalRow(absent, "STANDARD_NO_SUCH_PROPOSAL");
  const strip = (x) => ({ ...x, proposal: null });
  for (const viewer of [null, undefined, "", "nobody", "member:"])
    assert.deepEqual(strip(w.s.standardProposalRead({ proposal: p.id, viewer })), strip(absent), String(viewer));
  for (const proposal of [null, "", 7, {}]) refusalRow(w.s.standardProposalRead({ proposal, viewer: V("carol") }), "STANDARD_NO_SUCH_PROPOSAL");
  assert.deepEqual(w.snapshot(), before, "the read writes nothing");
  for (const a of [undefined, null, { proposal: { toString() { throw new Error("x"); } } }]) assert.doesNotThrow(() => w.s.standardProposalRead(a ?? undefined));
  /* adopted: names the standard, who and when */
  w.clock.now = "2026-10-01T10:00:00.000Z";
  const a = w.s.standardAdopt({ proposal: p.id, author: V("bob"), viewer: V("bob"), reason: REASON });
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  assert.deepEqual(w.s.standardProposalRead({ proposal: p.id, viewer: V("carol") }).proposal,
                   { id: p.id, kind: "commitment", project: null, adoption: { standard: a.id, by: V("bob"), at: "2026-10-01T10:00:00Z" } });
  /* adopted as a policy held at a hidden project's sight (R37): answered only to who may read that standard */
  const P = w.project("Source material", "alice");
  const hidden = w.passage("leaked");
  w.st.sql.exec(`UPDATE content SET bundle_id=? WHERE content_id=?`, P, hidden.contentId);
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, P, hidden.bundleId);
  const q = w.s.standardPropose({ cite: "HSO 4/21 para 3", kind: "policy", issuer: "Harbour Master", why: "w", proposer: V("alice") }).proposal;
  const b = w.s.standardAdopt({ proposal: q.id, author: V("alice"), viewer: V("alice"), reason: REASON, text: [hidden.contentId] });
  assert.equal(b.ok, true, JSON.stringify(b).slice(0, 300));
  assert.equal(w.s.standardProposalRead({ proposal: q.id, viewer: V("alice") }).proposal.adoption.standard, b.id);
  refusalRow(w.s.standardProposalRead({ proposal: q.id, viewer: V("carol") }), "STANDARD_NO_SUCH_PROPOSAL");
});
