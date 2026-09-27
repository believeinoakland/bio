/* observation-log: the member's lead (R14–R21, R25) and its ops. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, sha } from "./fixture.mjs";
import { observationLogOps, LEAD_VOCABULARY, OBSERVATION_STATE_WORDS, LEAD_LOOK_OUTCOMES, LEAD_READ_LIMIT_MAX,
         LEAD_LIST_LIMIT_MAX } from "../../../src/observation-log/index.mjs";
import { CAPTURE_TEXT_UNIT_CAP } from "../../../src/extraction/index.mjs";
import { BUNDLE_ID_RE, LEAD_ID_RE, leadLegFindings } from "../../../checks/bio-checks.mjs";

const code = (r) => r && (r.code || r.reason);
const check = (r) => r && r.check;

/* A group: `alice` writes leads; PROJ-A is joined by bob and carol (leaving) and has dan invited; `admin-ann` is an
   active administrator; `eve` is a member with no part in anything. */
function group() {
  const w = world();
  w.project("PROJ-A");
  w.participant("PROJ-A", "alice"); w.participant("PROJ-A", "bob"); w.participant("PROJ-A", "carol", "leaving");
  w.participant("PROJ-A", "dan", "invited");
  w.project("PROJ-B"); w.participant("PROJ-B", "bob");
  w.st.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES ('admin-ann', 'Ann', 'admin', 'active', 't', 't')`);
  return w;
}

test("R14 lead: C-54.2 no author or a machine; C-54.3 no words; C-54.4 over 131,072 bytes, never cut; success records LEAD-YYYY-MMDD-<12 hex>, writes no observation, answers NEVER_LOOKED, looks 0, evidence false", () => {
  const w = world({ now: "2026-09-27T03:04:05Z" });
  for (const a of [null, "", "  ", MACHINE, "class:ai/tok-1", "token:x"])
    assert.deepEqual([code(w.obs.lead({ words: "w", author: a })), check(w.obs.lead({ words: "w", author: a }))],
      ["LEAD_NOT_A_MEMBER", "C-54.2"], String(a));
  for (const words of [null, "", "   \n"]) assert.equal(check(w.obs.lead({ words, author: "alice" })), "C-54.3");
  const big = "x".repeat(CAPTURE_TEXT_UNIT_CAP + 1);
  assert.equal(CAPTURE_TEXT_UNIT_CAP, 131072);
  assert.equal(check(w.obs.lead({ words: big, author: "alice" })), "C-54.4");
  assert.equal(check(w.obs.lead({ words: "w", locator: big, author: "alice" })), "C-54.4");
  assert.equal(w.obs.lead({ words: "w", locator: big, author: "alice" }).limit, 131072);
  assert.equal(w.count("leads"), 0);
  const edge = w.obs.lead({ words: "é".repeat(65536), author: "alice" });
  assert.equal(edge.ok, true, "exactly the cap in bytes is accepted");
  const r = w.obs.lead({ words: "I was told the contract was amended", locator: "the March agenda", author: "alice" });
  assert.match(r.lead_id, /^LEAD-2026-0927-[0-9a-f]{12}$/);
  assert.deepEqual([r.ok, r.author, r.words, r.locator, r.at, r.state, r.looks, r.evidence],
    [true, "alice", "I was told the contract was amended", "the March agenda", "2026-09-27T03:04:05Z", "NEVER_LOOKED", 0, false]);
  assert.equal(w.count("observation_log"), 0, "authoring a lead is not a look");
  assert.deepEqual(w.row(`SELECT author, words, locator, at FROM leads WHERE lead_id = ?`, r.lead_id),
    { author: "alice", words: "I was told the contract was amended", locator: "the March agenda", at: "2026-09-27T03:04:05Z" });
  assert.equal(edge.words.length, 65536, "stored as written, never cut");
});

test("R15 R19 a lead is readable by its author and by a joined or leaving participant of a project it was shared to; not an invited one, an administrator, a machine, or anyone else — each answered C-54.5 as for a lead that does not exist", () => {
  const w = group();
  const L = w.obs.lead({ words: "w", author: "alice" }).lead_id;
  const reads = (viewer, identity = null) => w.obs.leadRead({ id: L, viewer, identity });
  assert.equal(reads(V("alice")).ok, true);
  const absent = w.obs.leadRead({ id: "LEAD-2026-0101-000000000000", viewer: V("bob") });
  for (const v of [V("bob"), V("carol"), V("dan"), V("eve"), V("admin-ann"), "admin", MACHINE, null]) {
    const r = reads(v);
    assert.deepEqual([code(r), check(r)], ["LEAD_NOT_FOUND", "C-54.5"], String(v));
    assert.equal(r.translation, absent.translation);
  }
  assert.equal(w.obs.leadShare({ lead: L, project: "PROJ-A", sharer: "alice", viewer: V("alice") }).ok, true);
  assert.equal(reads(V("bob")).ok, true, "joined");
  assert.equal(reads(V("carol")).ok, true, "leaving");
  for (const v of [V("dan"), V("eve"), V("admin-ann"), "admin", MACHINE, "class:ai"]) assert.equal(code(reads(v)), "LEAD_NOT_FOUND", String(v));
  // the member asked is the caller's positional identity
  assert.equal(reads("admin", V("alice")).ok, true, "the founder's session, stamped as its author");
  assert.equal(code(reads(V("alice"), MACHINE)), "LEAD_NOT_FOUND", "an identity naming no member reaches none");
  // R19 the same rule as one predicate over leads
  const reach = w.obs.leadReach(V("bob"));
  assert.ok(reach && typeof reach.sql === "string" && Array.isArray(reach.args));
  const visible = (v) => { const r = w.obs.leadReach(v); return r ? w.rows(`SELECT l.lead_id FROM leads l WHERE ${r.sql}`, ...r.args).map((x) => x.lead_id) : null; };
  assert.deepEqual(visible(V("bob")), [L]);
  assert.deepEqual(visible(V("dan")), []);
  assert.equal(w.obs.leadReach(MACHINE), null);
  assert.equal(w.obs.leadReach("admin"), null);
  assert.equal(w.obs.leadReach(null), null);
});

test("R16 leadShare: C-54.5; C-54.10 the sharer is not the author; C-54.9 one answer for a project absent, invisible or not joined; recorded once, a repeat answers already with the first sharer and instant", () => {
  const w = group();
  const L = w.obs.lead({ words: "w", author: "alice" }).lead_id;
  const share = (o) => w.obs.leadShare({ lead: L, project: "PROJ-A", sharer: "alice", viewer: V("alice"), ...o });
  assert.equal(check(share({ lead: "LEAD-2026-0101-000000000000" })), "C-54.5");
  assert.equal(check(share({ viewer: V("eve") })), "C-54.5", "the lead is asked through the viewer's reach");
  assert.equal(check(share({ sharer: "bob" })), "C-54.10");
  assert.equal(check(share({ sharer: MACHINE })), "C-54.10");
  const nots = [share({ project: "PROJ-NONE" }), share({ project: "PROJ-B" }), share({ project: "" }), share({ project: "INFO-2026-0001" })];
  for (const r of nots) assert.equal(check(r), "C-54.9");
  assert.equal(nots[0].translation, nots[1].translation);
  w.participant("PROJ-B", "alice", "invited");
  assert.equal(check(share({ project: "PROJ-B" })), "C-54.9", "invited is not joined");
  assert.equal(w.count("lead_shares"), 0);
  w.clock.now = "2026-09-27T05:00:00Z";
  const first = share();
  assert.deepEqual([first.ok, first.already, first.shared_by, first.at, first.evidence], [true, false, "alice", "2026-09-27T05:00:00Z", false]);
  const again = share();
  assert.deepEqual([again.ok, again.already, again.shared_by, again.at], [true, true, "alice", "2026-09-27T05:00:00Z"], "same second");
  w.clock.now = "2026-09-28T00:00:00Z";
  assert.deepEqual([share().already, share().at], [true, "2026-09-27T05:00:00Z"]);
  assert.equal(w.count("lead_shares"), 1);
  w.st.sql.exec(`UPDATE project_participants SET state='leaving' WHERE project_id='PROJ-B' AND member_id='alice'`);
  assert.equal(share({ project: "PROJ-B" }).ok, true, "a leaving participant may share");
});

test("R17 leadLook: C-54.8; C-54.5; C-54.6 (NEVER_LOOKED answered with why); C-54.7 in each of its arms; C-54.4; then R2's refusals; success appends §4.5's row and answers its seq, at and a sentence", () => {
  const w = group();
  const [open] = w.doc("INFO-2026-0001", ["open"]);
  const hidden = w.projectDoc("PROJ-H", "hidden");
  const openContent = w.contentRow("c".repeat(64), open, "INFO-2026-0001");
  const hiddenContent = w.contentRow("d".repeat(64), hidden, "PROJ-H");
  const L = w.obs.lead({ words: "the words", author: "alice" }).lead_id;
  const look = (o) => w.obs.leadLook({ lead: L, state: "LOOKED_ABSENT", looker: "alice", viewer: V("alice"), ...o });
  for (const l of [null, "", MACHINE]) assert.equal(check(look({ looker: l, lead: "nope" })), "C-54.8", "asked before the lead");
  assert.equal(check(look({ lead: "nope" })), "C-54.5");
  assert.equal(check(look({ viewer: V("eve") })), "C-54.5");
  const nl = look({ state: "NEVER_LOOKED" });
  assert.equal(check(nl), "C-54.6"); assert.match(nl.detail, /never stored/);
  for (const s of [null, "", "MAYBE", "present"]) assert.equal(check(look({ state: s })), "C-54.6", String(s));
  assert.equal(check(look({ state: "PRESENT", resultKind: "capture" })), "C-54.7", "a kind without a ref");
  assert.equal(check(look({ state: "PRESENT", resultRef: open })), "C-54.7", "a ref without a kind");
  assert.equal(check(look({ state: "LOOKED_ABSENT", resultKind: "capture", resultRef: open })), "C-54.7", "a referent on a state that found nothing");
  assert.equal(check(look({ state: "LOOKED_INDETERMINATE", resultKind: "capture", resultRef: open })), "C-54.7");
  assert.equal(check(look({ state: "PRESENT", resultKind: "observation", resultRef: "1" })), "C-54.7", "a rollup's kind");
  assert.equal(check(look({ state: "PRESENT", resultKind: "entity", resultRef: "ENT-1" })), "C-54.7");
  assert.equal(check(look({ state: "PRESENT", resultKind: "capture", resultRef: hidden })), "C-54.7", "not held where the viewer can read it");
  assert.equal(check(look({ state: "PRESENT", resultKind: "content", resultRef: hiddenContent })), "C-54.7");
  assert.equal(check(look({ state: "PRESENT", resultKind: "capture", resultRef: "e".repeat(64) })), "C-54.7");
  assert.equal(check(look({ detail: "x".repeat(CAPTURE_TEXT_UNIT_CAP + 1) })), "C-54.4");
  // then R2's refusals: a PRESENT naming nothing is C-22.10, a condition outside the vocabulary C-22.4
  assert.equal(check(look({ state: "PRESENT" })), "C-22.10");
  assert.equal(check(look({ state: "LOOKED_INDETERMINATE", condition: "nope" })), "C-22.4");
  assert.equal(w.count("observation_log"), 0, "every refusal writes nothing");
  w.clock.now = "2026-09-27T06:00:00Z";
  const ok = look({ state: "PRESENT", resultKind: "capture", resultRef: open, detail: "found it" });
  assert.deepEqual([ok.ok, ok.seq, ok.at, ok.state, ok.looked_by, ok.result_kind, ok.result_ref, ok.evidence, typeof ok.says],
    [true, 1, "2026-09-27T06:00:00Z", "PRESENT", "alice", "capture", open, false, "string"]);
  const row = w.log()[0];
  assert.deepEqual([row.actor_class, row.actor, row.authority_kind, row.authority, row.level, row.subject_kind, row.subject, row.state, row.detail],
    ["member", "alice", "lead", L, "internet", "description", "the words", "PRESENT", "found it"]);
  assert.equal(look({ state: "partial", resultKind: "content", resultRef: openContent }).ok, true);
  assert.equal(look({ state: "LOOKED_INDETERMINATE", condition: "governor-holding-host" }).ok, true);
  const absent = look();
  assert.equal(absent.ok, true); assert.match(absent.says, /not there/);
  // a joined participant of a project it was shared to may look too
  w.obs.leadShare({ lead: L, project: "PROJ-A", sharer: "alice", viewer: V("alice") });
  assert.equal(look({ looker: "bob", viewer: V("bob") }).ok, true);
});

test("R18 R21 leadRead: C-54.5; the looks in seq order bounded (200 by default, at most 2,000, truncated) with their coverage, a referent the viewer can no longer read as null; shared_to per viewer, bounded; the state; the vocabulary", () => {
  const w = group();
  const [open] = w.doc("INFO-2026-0001", ["open"]);
  const L = w.obs.lead({ words: "w", author: "alice" }).lead_id;
  const read = (o = {}) => w.obs.leadRead({ id: L, viewer: V("alice"), ...o });
  assert.equal(check(w.obs.leadRead({ id: null, viewer: V("alice") })), "C-54.5");
  let r = read();
  assert.deepEqual([r.state, r.looks, r.limit, r.truncated, r.shared_to, r.shared_to_truncated, r.evidence], ["NEVER_LOOKED", [], 200, false, [], false, false]);
  assert.deepEqual(r.vocabulary, LEAD_VOCABULARY);
  assert.deepEqual(Object.keys(r.vocabulary.states).sort(), ["LOOKED_ABSENT", "LOOKED_INDETERMINATE", "NEVER_LOOKED", "PRESENT", "partial"]);
  assert.equal(r.vocabulary.states.partial, "we looked and got part of it", "a member's words, the maintainers' note cut");
  assert.deepEqual([...r.vocabulary.outcomes], ["LOOKED_ABSENT", "LOOKED_INDETERMINATE", "partial", "PRESENT"]);
  for (const s of Object.values(OBSERVATION_STATE_WORDS)) assert.doesNotMatch(s, /\(/);
  // a capture look whose document later becomes hidden
  w.obs.leadLook({ lead: L, state: "PRESENT", resultKind: "capture", resultRef: open, looker: "alice", viewer: V("alice") });
  w.obs.leadLook({ lead: L, state: "LOOKED_ABSENT", looker: "alice", viewer: V("alice") });
  w.st.sql.exec(`UPDATE bundles SET object_type = 'project' WHERE bundle_id = 'INFO-2026-0001'`);
  w.membership.reindexProjectSight("INFO-2026-0001");
  r = read();
  assert.deepEqual(r.looks.map((l) => [l.seq, l.state, l.result_kind, l.result_ref, l.coverage, l.looked_by, l.level, l.subject_kind]),
    [[1, "PRESENT", null, null, "backed", "alice", "internet", "description"], [2, "LOOKED_ABSENT", null, null, "none_owed", "alice", "internet", "description"]]);
  assert.equal(r.state, "LOOKED_ABSENT", "the latest look's state");
  // the bound
  for (let i = 0; i < 3; i++) w.obs.leadLook({ lead: L, state: "LOOKED_INDETERMINATE", looker: "alice", viewer: V("alice") });
  r = read({ limit: 2 });
  assert.deepEqual([r.limit, r.truncated, r.looks.map((l) => l.seq)], [2, true, [1, 2]]);
  assert.equal(read({ limit: 5 }).truncated, false);
  assert.equal(read({ limit: 999999 }).limit, LEAD_READ_LIMIT_MAX);
  assert.equal(LEAD_READ_LIMIT_MAX, 2000);
  assert.equal(read({ limit: "x" }).limit, 200);
  // shared_to: the author sees every share, a participant only the projects they have joined
  w.participant("PROJ-B", "alice");
  w.project("PROJ-C"); w.participant("PROJ-C", "alice");
  for (const p of ["PROJ-A", "PROJ-B", "PROJ-C"]) w.obs.leadShare({ lead: L, project: p, sharer: "alice", viewer: V("alice") });
  assert.deepEqual(read().shared_to.map((s) => s.project), ["PROJ-A", "PROJ-B", "PROJ-C"]);
  assert.deepEqual(w.obs.leadRead({ id: L, viewer: V("bob") }).shared_to.map((s) => s.project), ["PROJ-A", "PROJ-B"]);
  assert.deepEqual(w.obs.leadRead({ id: L, viewer: V("carol") }).shared_to.map((s) => s.project), ["PROJ-A"]);
  const cut = read({ limit: 2 });
  assert.deepEqual([cut.shared_to.length, cut.shared_to_truncated], [2, true]);
  assert.deepEqual(Object.keys(read().shared_to[0]).sort(), ["at", "project", "shared_by"]);
});

test("R20 R21 leadList: every lead this viewer may read, each once with its own latest state, newest first, bounded and saying so, with the vocabulary; a viewer who reaches none is answered as one whose reach holds none", () => {
  const w = group();
  w.clock.now = "2026-09-27T01:00:00Z";
  const a1 = w.obs.lead({ words: "same words", author: "alice" }).lead_id;
  const a2 = w.obs.lead({ words: "same words", author: "alice" }).lead_id;   // same second, same words
  w.clock.now = "2026-09-27T02:00:00Z";
  const b1 = w.obs.lead({ words: "bob's", author: "bob" }).lead_id;
  const e1 = w.obs.lead({ words: "eve's", author: "eve" }).lead_id;
  w.obs.leadLook({ lead: a2, state: "LOOKED_ABSENT", looker: "alice", viewer: V("alice") });
  w.obs.leadLook({ lead: a2, state: "partial", looker: "alice", viewer: V("alice") });
  w.obs.leadShare({ lead: b1, project: "PROJ-A", sharer: "bob", viewer: V("bob") });
  const list = w.obs.leadList({ viewer: V("alice") });
  assert.deepEqual(list.leads.map((l) => [l.lead_id, l.state, l.looks]), [[b1, "NEVER_LOOKED", 0], [a2, "partial", 2], [a1, "NEVER_LOOKED", 0]],
    "two leads with the same words are two leads; within one second, the order received");
  assert.deepEqual([list.ok, list.limit, list.truncated, list.empty, list.vocabulary], [true, 200, false, null, LEAD_VOCABULARY]);
  assert.deepEqual(Object.keys(list.leads[0]).sort(), ["at", "author", "evidence", "locator", "looked_at", "looks", "lead_id", "state", "words"].sort());
  assert.equal(list.leads[1].state, w.obs.leadRead({ id: a2, viewer: V("alice") }).state, "the list and the read agree about one lead");
  assert.ok(!list.leads.some((l) => l.lead_id === e1));
  const cut = w.obs.leadList({ viewer: V("alice"), limit: 2 });
  assert.deepEqual([cut.leads.length, cut.truncated], [2, true]);
  assert.equal(w.obs.leadList({ viewer: V("alice"), limit: 1e9 }).limit, LEAD_LIST_LIMIT_MAX);
  assert.deepEqual(w.obs.leadList({ viewer: V("bob") }).leads.map((l) => l.lead_id), [b1]);
  const none = w.obs.leadList({ viewer: V("dan") });
  const noReach = w.obs.leadList({ viewer: MACHINE });
  assert.deepEqual([none.leads, none.empty.cause], [[], "no_leads_visible"]);
  assert.deepEqual(noReach, none, "no reach and an empty reach answer identically");
  assert.equal(w.count("observation_log"), 2, "a list writes nothing");
});

test("R25 a lead is never evidence: its id has no bundle shape, the leg grammar refuses it by name (C-54.1), and nothing here mints a bundle or a content row", () => {
  const w = group();
  const bundles = w.count("bundles"), content = w.count("content");
  const L = w.obs.lead({ words: "w", author: "alice" }).lead_id;
  w.obs.leadShare({ lead: L, project: "PROJ-A", sharer: "alice", viewer: V("alice") });
  const [open] = w.doc("INFO-2026-0001", ["open"]);
  const afterDoc = [w.count("bundles"), w.count("content")];
  w.obs.leadLook({ lead: L, state: "PRESENT", resultKind: "capture", resultRef: open, looker: "alice", viewer: V("alice") });
  w.obs.leadRead({ id: L, viewer: V("alice") }); w.obs.leadList({ viewer: V("alice") });
  assert.deepEqual([w.count("bundles"), w.count("content")], afterDoc);
  assert.equal(afterDoc[1], content);
  assert.equal(afterDoc[0], bundles + 1, "only the fixture's own document");
  assert.equal(BUNDLE_ID_RE.test(L), false);
  assert.equal(LEAD_ID_RE.test(L), true);
  const findings = [];
  assert.equal(leadLegFindings("basis[0]", { target: L }, findings), true);
  assert.equal(findings[0].check, "C-54.1");
  for (const r of [w.obs.lead({ words: "x", author: "alice" }), w.obs.leadRead({ id: L, viewer: V("alice") }),
                   w.obs.leadLook({ lead: L, state: "LOOKED_ABSENT", looker: "alice", viewer: V("alice") })])
    assert.equal(r.evidence, false);
});

test("R14 R16 R17 R18 R20 the lead's ops read the control plane's stamps from the query and never from the body", () => {
  const w = group();
  const run = (op, q, body = null) => observationLogOps(w.obs, new URL(`http://x/?${q}`), body)[op]();
  const made = run("lead", "author=alice", { words: "w", author: "mallory" });
  assert.deepEqual([made.ok, made.author], [true, "alice"]);
  assert.equal(check(run("lead", "", { words: "w", author: "alice" })), "C-54.2", "a body author is never read");
  const L = made.lead_id;
  assert.equal(run("leadshare", `sharer=alice&viewer=${V("alice")}`, { lead: L, project: "PROJ-A", sharer: "bob" }).ok, true);
  const look = run("leadlook", `looker=bob&viewer=${V("bob")}`, { lead: L, state: "LOOKED_ABSENT", looker: "alice" });
  assert.deepEqual([look.ok, look.looked_by], [true, "bob"]);
  assert.equal(run("leadread", `id=${L}&viewer=${V("bob")}&limit=5`).limit, 5);
  assert.equal(run("leadread", `id=${L}&viewer=admin&identity=${V("alice")}`).ok, true);
  assert.deepEqual(run("leadlist", `viewer=${V("bob")}`).leads.map((l) => l.lead_id), [L]);
  assert.deepEqual(Object.keys(observationLogOps(w.obs, new URL("http://x/"), null)).sort(), ["lead", "leadlist", "leadlook", "leadread", "leadshare"]);
});
