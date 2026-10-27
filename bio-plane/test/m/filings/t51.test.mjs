/* filings at T51 (T51-154; N880 (U4), N858 D8; DEC-340, U366; K3935, K4036): R64 the group's public comment and the minutes'
   account of it, registered with case-inputs for the signing view; R65 the templates for an action that are not offered,
   with what each lacks, and a court-filed kind; the undetermined reasons other modules answer as `{key, vars}` said in
   words where this module builds a sentence. Driven at the module's interface over the real modules; `actions`' R108 (the
   minutes on a received entry), `content`'s row of the minutes' passage and `filing-templates`' R35 are stand-ins
   answering as their requirements state until those jobs merge (K248). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, STRANGER, PROFILE, DOC, actionsWith, templatesOver, sha } from "./fixture.mjs";
import { said } from "../../../src/filings/words.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { caseInputsOf } from "../../../src/case-inputs/index.mjs";
import { validate } from "../../../../jurisdictions/index.mjs";

const COMMENT = "The Selectboard met on 2 March to consider the works order.";
const MEETING = "Selectboard, regular meeting of 6 April";

/* the world with the kind R64 reads: a public comment, which the Oakland profile names (the test profile does not) */
function commentWorld() {
  const x = world();
  const set = x.record.setSetting("jurisdiction_profiles", [PROFILE, "oakland-alameda"], V("olive"));
  assert.equal(set === undefined || set.ok !== false, true, JSON.stringify(set));
  return x;
}

/* a public comment sent (approved and recorded) with `text`, resting on the world's determination */
async function sentComment(x, text = COMMENT, over = {}) {
  const A = x.action({ kind: "public_comment", ...over });
  const d = x.f.communicationPrepare({ action: A, text, purpose: "public comment", preparer: V("bo"), viewer: V("bo"), language: "en" });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  const ap = await x.f.filingApprove({ filing: d.id, author: V("bo"), viewer: V("bo") });
  assert.equal(ap.ok, true, JSON.stringify(ap).slice(0, 300));
  const s = x.f.filingRecordSent({ filing: d.id, at: "2026-04-01", account: "read aloud at the meeting", author: V("bo"), viewer: V("bo") });
  assert.equal(s.ok, true, JSON.stringify(s).slice(0, 300));
  return { A, filing: d.id };
}

/* actions' read answering a received entry with the minutes' passage on the actions named (the entry R108 holds), and
   content answering that passage's row and text */
function withMinutes(x, spec) {
  const extra = {}, texts = {};
  for (const [A, { text, meeting = MEETING, date = "2026-04-06" }] of Object.entries(spec)) {
    const real = x.read(A);
    const cid = `CNT-minutes-${A}`;
    texts[cid] = text;
    extra[A] = { correspondence: [...real.correspondence, { ord: real.correspondence.length, direction: "received", at: "2026-04-10",
      account: "the minutes", minutes: { meeting, date, passage: { captureSha: sha(`minutes of ${A}`), extent: { kind: "document" }, content_id: cid } } }] };
  }
  const content = new Proxy(x.content, { get: (t, k) => (k === "contentRow" ? (id) => (id in texts ? { content_id: id, bundle_id: "INFO-minutes" } : t.contentRow(id))
    : k === "sees" ? (id, viewer) => (id === "INFO-minutes" ? viewer !== STRANGER : t.sees(id, viewer))
    : k === "passageText" ? (id) => (id in texts ? texts[id] : t.passageText(id))
    : typeof t[k] === "function" ? t[k].bind(t) : t[k]) });
  return x.filingsWith({ actions: actionsWith(x, extra), content });
}
const members = (x) => [{ bundle_id: x.D, version_sha: x.pin }];
const on = (g, x, over = {}) => g.minutesComparisonsOn({ case: "CASE-2026-0001", members: members(x), viewer: V("bo"), ...over });

test("R64 a public comment sent, with a received entry holding the minutes' passage that differs, answers one row {meeting, date, minutes, filed, same: false}; whitespace folded, the same text answers same: true; the row names the filed text approved and sent", async () => {
  const x = commentWorld();
  const a = await sentComment(x);
  const b = await sentComment(x, "A second word to the board.");
  const g = withMinutes(x, { [a.A]: { text: "The minutes record a different account of the comment." },
                             [b.A]: { text: "A  second\nword to the   board." } });
  const rows = on(g, x);
  assert.deepEqual(rows.map((r) => [r.meeting, r.date, r.minutes, r.filed, r.same]),
                   [[MEETING, "2026-04-06", "The minutes record a different account of the comment.", COMMENT, false],
                    [MEETING, "2026-04-06", "A  second\nword to the   board.", "A second word to the board.", true]]);
  /* a later sending is the one compared: the action's latest communication recorded sent */
  const d2 = x.f.communicationPrepare({ action: a.A, text: "Our later word.", purpose: "public comment", preparer: V("bo"), viewer: V("bo"), language: "en" });
  assert.equal((await x.f.filingApprove({ filing: d2.id, author: V("bo"), viewer: V("bo") })).ok, true);
  assert.equal(x.f.filingRecordSent({ filing: d2.id, at: "2026-04-02", account: "emailed", author: V("bo"), viewer: V("bo") }).ok, true);
  assert.equal(on(g, x)[0].filed, "Our later word.");
});

test("R64 control: no row for a request for comment with a reply, a public comment never sent, one with no minutes entry, one resting on no member, or a passage the viewer may not see; it writes nothing; it throws when the passage cannot be read", async () => {
  const x = commentWorld();
  const sent = await sentComment(x);
  const unsent = x.action({ kind: "public_comment" });
  const bare = await sentComment(x, "A word with no minutes.");
  const elsewhere = await sentComment(x, "A word elsewhere.", { legs: [] });
  const Q = "INQ-2026-0002-quay";
  x.inquiry(Q, { legs: [{ target: DOC }] });
  const rfc = x.action({ kind: "request_for_comment", legs: [{ target: x.D, kind: "rests_on" }, { target: Q, kind: "advances" }] });
  assert.equal(x.f.communicationPrepare({ action: rfc, text: "May we have your comment?", purpose: "request", preparer: V("bo"), viewer: V("bo"), language: "en" }).ok, true);
  const g = withMinutes(x, { [sent.A]: { text: "Their account." }, [unsent]: { text: "No sending." }, [elsewhere.A]: { text: "No member." },
                             [rfc]: { text: "A reply." } });
  const before = x.snapshot(["filing_drafts", "filing_approvals", "filing_sendings", "communication_drafts"]);
  assert.deepEqual(on(g, x).map((r) => r.minutes), ["Their account."], "only the public comment sent, with minutes, resting on a member");
  assert.deepEqual(x.snapshot(["filing_drafts", "filing_approvals", "filing_sendings", "communication_drafts"]), before, "writes nothing");
  assert.deepEqual(on(g, x, { members: [] }), [], "no members, no rows");
  assert.deepEqual(on(g, x, { viewer: STRANGER }), [], "an action or passage the viewer may not see gives no row");
  /* a passage whose text is not held throws, so case-inputs answers undetermined */
  const unread = withMinutes(x, { [sent.A]: { text: null } });
  assert.throws(() => on(unread, x));
});

test("R64 at start filings registers the minutes source once with case-inputs (R19) in its name, on the host's one instance; a second registration is refused; case-inputs answers the rows, and undetermined when the source cannot read; with none given, nothing is registered", async () => {
  const x = world({ signing: true });
  assert.equal(x.ci, caseInputsOf(x.host), "the host's one case-inputs");
  assert.deepEqual(x.ci.minutesComparisonsSource(), { registered: true, module: "filings" });
  assert.equal(x.ci.registerMinutesComparisons("filings", { minutesComparisonsOn: () => [] }).reason, "PROVIDER_DECLARED");
  assert.deepEqual(x.ci.minutesComparisonsOn({ case: "CASE-2026-0001", members: members(x), viewer: V("bo") }), { ok: true, rows: [] });
  assert.equal(x.ci.minutesComparisonsOn({ case: "CASE-2026-0001", members: members(x), viewer: V("bo") }).ok, true);
  const bare = world();
  assert.deepEqual(caseInputsOf(bare.host).minutesComparisonsSource(), { registered: false, module: null }, "control: none handed in, none registered");
});

test("R65 templatesForAction also answers not_offered, each template the kind holds that filing-templates R35 lists as not offered {handle, name, lacks}, and court_petition false; a call with no action is refused (R41)", async () => {
  const x = world();
  const A = x.action();
  const lacking = [{ handle: "@records-request", name: "Records request", lacks: ["writer", "professional_review"] }];
  const un = (list) => new Proxy(x.f.filingTemplates, { get: (t, k) => (k === "unofferedFor" ? ({ kind }) => (kind === "bylaw_complaint" ? list : []) : typeof t[k] === "function" ? t[k].bind(t) : t[k]) });
  const r = x.filingsWith({ filingTemplates: un(lacking) }).templatesForAction({ action: A, viewer: V("bo") });
  assert.equal(r.ok, true);
  assert.deepEqual(r.not_offered, lacking);
  assert.equal(r.court_petition, false);
  assert.equal(r.versions.some((v) => v.template === "TPL-test-bylaw-complaint"), true, "the offered ones are listed as before");
  assert.equal(r.not_offered_read, undefined);
  /* control: a template that is offered is not listed as not offered */
  assert.deepEqual(x.filingsWith({ filingTemplates: un([]) }).templatesForAction({ action: A, viewer: V("bo") }).not_offered, []);
  /* a provider that cannot answer is said so, never read as none */
  const mute = x.filingsWith({ filingTemplates: new Proxy(x.f.filingTemplates, { get: (t, k) => (k === "unofferedFor" ? () => { throw new Error("down"); }
    : typeof t[k] === "function" ? t[k].bind(t) : t[k]) }) }).templatesForAction({ action: A, viewer: V("bo") });
  assert.deepEqual([mute.ok, mute.not_offered, mute.not_offered_read], [true, [], false]);
  assert.equal(x.f.templatesForAction({ viewer: V("bo") }).reason, "NO_SUCH_ACTION", "no action");
  assert.equal(x.f.templatesForAction({ action: "bylaw_complaint", viewer: V("bo") }).reason, "NO_SUCH_ACTION", "a kind is no action");
});

test("R65 over filing-templates R35: a profile template with no professional review answers not_offered with professional_review in lacks and is absent from the offered list; control: reviewed, it is offered and not listed", async () => {
  const x = world();
  const A = x.action();
  const bare = x.filingsWith({ filingTemplates: templatesOver(x.w, undefined, { reviewed: false }) }).templatesForAction({ action: A, viewer: V("bo") });
  assert.equal(bare.ok, true);
  const lacking = bare.not_offered.find((t) => t.lacks.includes("professional_review"));
  assert.ok(lacking, JSON.stringify(bare.not_offered));
  assert.deepEqual(Object.keys(lacking).sort(), ["handle", "lacks", "name"]);
  assert.equal(bare.versions.some((v) => v.name === lacking.name), false, "not offered, so not among the offered versions");
  const reviewed = x.f.templatesForAction({ action: A, viewer: V("bo") });
  assert.deepEqual(reviewed.not_offered, [], "control: the reviewed template is offered, never listed as not offered");
  assert.equal(reviewed.versions.some((v) => v.name === lacking.name), true);
  assert.equal(reviewed.not_offered_read, undefined);
});

test("R65 a kind whose venue is filed with a court answers court_petition: true and no template, offered or listed; a kind filed otherwise does not", async () => {
  const x0 = world();
  const p = x0.profile(PROFILE);
  const court = { ...p, id: "test-filings-court", action_kinds: p.action_kinds.map((k) => (k.kind === "bylaw_complaint"
    ? Object.fromEntries(Object.entries({ ...k, venue: { name: "the Borough Court", how: "court", basis: "TEST" }, template: undefined }).filter(([, v]) => v !== undefined)) : k)) };
  assert.equal(validate(court).ok, true, JSON.stringify(validate(court).errors));
  const x = world({ profiles: [court] });
  const lacking = [{ handle: "@x", name: "X", lacks: ["writer"] }];
  const f = x.filingsWith({ profiles: () => [court], filingTemplates: new Proxy(x.f.filingTemplates, { get: (t, k) => (k === "unofferedFor" ? () => lacking : typeof t[k] === "function" ? t[k].bind(t) : t[k]) }) });
  const r = f.templatesForAction({ action: x.action(), viewer: V("bo") });
  assert.deepEqual([r.ok, r.court_petition, r.versions, r.not_offered], [true, true, [], []]);
  const other = x0.f.templatesForAction({ action: x0.action(), viewer: V("bo") });
  assert.equal(other.court_petition, false, "control: not a court-filed kind");
});

test("R9 R30 (K3997) an undetermined reason answered as {key, vars}, itself carrying a reason, is said in words through its key, never through String(); a string already said and a number are answered as they came", () => {
  assert.equal(said({ key: "civil-time.end_stated", vars: {} }), word("civil-time.end_stated"));
  assert.equal(said({ key: "filings.why.withholds_active_profiles", vars: { why: { key: "civil-time.end_stated", vars: {} } } }),
               word("filings.why.withholds_active_profiles", { why: word("civil-time.end_stated") }));
  assert.deepEqual([said("already said"), said(7), said(null)], ["already said", 7, null]);
  assert.equal(said({ key: "civil-time.end_stated", vars: {} }).includes("[object Object]"), false);
});

test("R59 R25 filingRead answers the exhibits and the venue standard as filingPrepare stored them, in the same order and shape, through the module and the op; a draft stored before they existed answers exhibits [] and venue_standard null, and a communication answers the same empty pair", () => {
  const x = world();
  const f = x.f;
  const A = x.action();
  const d = f.filingPrepare({ action: A, text: "To the {{counterparty_role}}: a letter.", preparer: V("bo"), viewer: V("bo"), language: "en" });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  assert.ok(d.exhibits.length >= 2, "the draft rests on captures");
  assert.equal(d.venue_standard.state, "undetermined");
  const r = f.filingRead({ filing: d.id, viewer: V("bo") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(r.exhibits, d.exhibits);
  assert.deepEqual(r.venue_standard, d.venue_standard);
  assert.deepEqual(x.op("filingread", { filing: d.id, viewer: V("bo") }).exhibits, d.exhibits, "the op answers the same");
  /* control: an older row with neither */
  x.w.st.sql.exec(`UPDATE filing_drafts SET exhibits=NULL, venue_standard=NULL WHERE filing_id=?`, d.id);
  const old = f.filingRead({ filing: d.id, viewer: V("bo") });
  assert.equal(old.ok, true);
  assert.deepEqual([old.exhibits, old.venue_standard], [[], null]);
  assert.equal(old.text, d.text, "the rest is as stored");
  const c = f.communicationPrepare({ action: A, text: "A word to the board.", purpose: "a letter", preparer: V("bo"), viewer: V("bo"), language: "en" });
  const rc = f.filingRead({ filing: c.id, viewer: V("bo") });
  assert.deepEqual([rc.exhibits, rc.venue_standard], [[], null]);
});
