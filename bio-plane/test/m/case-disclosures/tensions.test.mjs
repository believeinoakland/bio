/* case-disclosures: the tensions a case discloses (R1), sight at the act (R17) and undetermined stated (R18), at this
   module's interface: `tensionsRead`, `tensionsJudged`, `tensionsUndetermined` and the section's renderers. Ported from
   case-authoring's `tensions` arms (N529), called on the services rather than through `op=publish`. Every candidate is
   laid down through the real `contradiction` module's own doors (a pairing forms a pair, a run proposes it, a member
   acts on it); a failed or a scripted read is a stand-in at its R29. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, ADMIN, sha } from "./fixture.mjs";
import { CASE_DISCLOSURE_CHECKS, TENSION_TEMPLATES, HIGHLIGHT_SENTENCE, NOT_SHOWN_WORDS, TENSIONS_DEPTH_STATED,
         tensionSide, tensionTemplate, tensionSentence, tensionsUnreadStated, tensionFrontmatterLines,
         tensionBodyLines } from "../../../src/case-disclosures/index.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", F = "INQ-2026-0001-q", G = "INQ-2026-0002-g";
const RUN = "RUN-2026-0001";
const CA = sha("passage a"), CB = sha("passage b"), CH = sha("the hidden passage");
const AT = "2026-09-28T01:00:00Z";

function propose(w, match, label = "record") {
  const p = w.contradiction.pairs({ key: "K1", viewer: ADMIN }).pairs.find(match);
  if (!p) throw new Error("no K1 pair formed");
  const r = w.contradiction.propose({ run: RUN, proposedBy: "class:ai/t", viewer: ADMIN, caller: "member:alice",
                                      proposals: [{ key: "K1", a: p.a, b: p.b, label, reason: "the machine's reason" }] });
  if (!r.ok) throw new Error(`propose refused: ${JSON.stringify(r).slice(0, 300)}`);
  return r.candidates[0].candidate;
}
/* F rests on two passages, one supporting and one cutting against it: a K1 duty on what F rests on, one level deep. */
function seen(opts) {
  const w = world(opts);
  for (const m of ["alice", "bo"]) w.member(m);
  w.content(CA, w.doc(DOC), DOC); w.content(CB, w.doc(DOC2), DOC2);
  w.finding(F, [{ target: DOC, content_id: CA }, { target: DOC2, role: "cuts_against", content_id: CB }]);
  const P = w.project("Team", "alice", [F]);
  w.runs.set(RUN, { status: "running", principal: "member:alice" });
  return { w, P, id: propose(w, (p) => p.inquiry === F) };
}
/* F rests on passage a; G sets passage a against a passage filed in bo's project H, which alice may not see. */
function hidden() {
  const w = world();
  for (const m of ["alice", "bo"]) w.member(m);
  w.content(CA, w.doc(DOC), DOC);
  w.finding(F, [{ target: DOC, content_id: CA }]);
  w.finding(G, [{ target: DOC, content_id: CA }]);
  const H = w.project("Hidden", "bo", [G]);
  w.content(CH, sha("the hidden capture"), H, "the hidden minutes, page 4");
  w.st.sql.exec(`INSERT INTO inquiry_basis (bundle_id, ord, target_id, target_type, role, note, content_id)
                 VALUES (?, 1, ?, 'information', 'cuts_against', NULL, ?)`, G, DOC, CH);
  const P = w.project("Team", "alice", [F, G]);
  w.runs.set(RUN, { status: "running", principal: "member:alice" });
  return { w, P, H, id: propose(w, (p) => p.a.content_id === CH || p.b.content_id === CH) };
}
const disclose = (id, words) => [{ candidate: id, ...(words === undefined ? {} : { words }) }];
function refused(r, code) {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 400));
  assert.deepEqual([r.reason, r.code, r.check, r.translation],
    [code, code, CASE_DISCLOSURE_CHECKS[code].check, CASE_DISCLOSURE_CHECKS[code].translation]);
}
/* What `publishCase` hands the renderers: each entry with the owner's words and the `author` stamp at the act. */
const acknowledged = (j, by = "alice") => j.entries.map((e) => ({ ...e, words: j.byCandidate.get(e.candidate)?.words ?? null,
                                                                 acknowledged_by: by, acknowledged_at: AT }));

test("R1 (C-120.1): tensionsJudged names each undisclosed tension the read answers, with both sides when the owner sees both; it writes nothing; listed, nothing refuses and its entries carry the sides and state — disclose, never block (DEC-76 item 4)", () => {
  const { w, id } = seen();
  const prep = w.prepared([F]);
  const before = w.snapshot();
  const j = w.cd.tensionsJudged(prep, V("alice"), null);
  assert.equal(j.refusals.length, 1);
  refused(j.refusals[0], "TENSION_NOT_DISCLOSED");
  assert.deepEqual(j.refusals[0].undisclosed.map((u) => [u.candidate, u.finding, u.state]), [[id, F, "open"]]);
  assert.ok(j.refusals[0].undisclosed[0].a && j.refusals[0].undisclosed[0].b, "seen whole: named with both sides");
  assert.deepEqual(w.snapshot(), before, "nothing written");
  /* an empty list discloses nothing; a list naming it refuses nothing */
  refused(w.cd.tensionsJudged(prep, V("alice"), []).refusals[0], "TENSION_NOT_DISCLOSED");
  const ok = w.cd.tensionsJudged(prep, V("alice"), disclose(id, "we read the later page"));
  assert.deepEqual(ok.refusals, []);
  assert.deepEqual(ok.entries.map((e) => [e.candidate, e.finding, e.state, e.unseen_other_side, e.depth]), [[id, F, "open", false, 1]]);
  assert.deepEqual([ok.entries[0].a.text, ok.entries[0].a.source, ok.entries[0].b.text, ok.entries[0].b.source],
    [`the page of ${DOC}`, DOC, `the page of ${DOC2}`, DOC2]);
  assert.equal(ok.byCandidate.get(id).words, "we read the later page");
  /* the read itself: the same entries, and `unread` empty */
  const read = w.cd.tensionsRead(prep, V("alice"));
  assert.deepEqual([read.ok, read.entries, read.unread], [true, ok.entries, []]);
  /* negative control: a finding with no tension on it needs no list */
  const n = world(); n.member("alice"); n.doc(DOC); n.finding(F, [{ target: DOC }]);
  assert.deepEqual(n.cd.tensionsJudged(n.prepared([F]), V("alice"), null).refusals, []);
});

test("R1 (C-120.2): a listed candidate the read does not answer — one resolved since, or one nothing holds — is DISCLOSURE_NOT_STANDING, after C-120.1 when both hold", () => {
  const { w, id } = seen();
  const prep = w.prepared([F]);
  const other = sha("no such candidate");
  const j = w.cd.tensionsJudged(prep, V("alice"), [...disclose(id), { candidate: other }]);
  assert.deepEqual(j.refusals.map((r) => r.reason), ["DISCLOSURE_NOT_STANDING"]);
  refused(j.refusals[0], "DISCLOSURE_NOT_STANDING");
  assert.deepEqual(j.refusals[0].not_standing, [{ candidate: other, ord: 1 }]);
  /* both: C-120.1 first, then C-120.2 */
  assert.deepEqual(w.cd.tensionsJudged(prep, V("alice"), [{ candidate: other }]).refusals.map((r) => r.reason),
    ["TENSION_NOT_DISCLOSED", "DISCLOSURE_NOT_STANDING"]);
  /* resolved corrected: no longer standing */
  assert.equal(w.contradiction.clarify({ candidate: id, choice: "one_wrong", wrongSide: "b", reason: "a misread page",
                                         viewer: V("alice"), author: V("alice") }).ok, true);
  refused(w.cd.tensionsJudged(prep, V("alice"), disclose(id)).refusals[0], "DISCLOSURE_NOT_STANDING");
  assert.deepEqual(w.cd.tensionsJudged(prep, V("alice"), null), { refusals: [], entries: [], unread: [], byCandidate: new Map() });
});

test("R1: tensionsDisclosed is a list of {candidate, words?}: a malformed one is BAD_COMPLETENESS naming the field, alone; absent is none; a candidate listed twice is disclosed once, its first words kept", () => {
  const { w, id } = seen();
  const prep = w.prepared([F]);
  const long = "x".repeat(2001);
  for (const [list, field] of [["x", "tensionsDisclosed"], [{}, "tensionsDisclosed"], [[null], "tensionsDisclosed[0]"],
                               [[{}], "tensionsDisclosed[0]"], [[{ candidate: "  " }], "tensionsDisclosed[0]"],
                               [[{ candidate: id }, ["x"]], "tensionsDisclosed[1]"],
                               [[{ candidate: id, words: 7 }], "tensionsDisclosed[0].words"],
                               [[{ candidate: id, words: 'a "q"' }], "tensionsDisclosed[0].words"],
                               [[{ candidate: id, words: "a\\b" }], "tensionsDisclosed[0].words"],
                               [[{ candidate: id, words: "a\nb" }], "tensionsDisclosed[0].words"],
                               [[{ candidate: id, words: long }], "tensionsDisclosed[0].words"]]) {
    const j = w.cd.tensionsJudged(prep, V("alice"), list);
    assert.equal(j.refusals.length, 1, field);
    assert.deepEqual([j.refusals[0].ok, j.refusals[0].reason, j.refusals[0].field], [false, "BAD_COMPLETENESS", field]);
    assert.deepEqual(j.entries, []);
  }
  /* at the bound, an apostrophe, and blank words are legal; blank is none */
  for (const words of ["x".repeat(2000), "the owner's words", "   "])
    assert.deepEqual(w.cd.tensionsJudged(prep, V("alice"), disclose(id, words)).refusals, [], words.slice(0, 20));
  assert.equal(w.cd.tensionsJudged(prep, V("alice"), disclose(id, "   ")).byCandidate.get(id).words, null);
  const twice = w.cd.tensionsJudged(prep, V("alice"), [{ candidate: ` ${id} `, words: "first" }, { candidate: id, words: "second" }]);
  assert.deepEqual([twice.refusals, [...twice.byCandidate.values()]], [[], [{ candidate: id, ord: 0, words: "first" }]]);
});

test("R1 (C-120.3): a read that fails, throws, answers nothing or is truncated is TENSIONS_UNDETERMINED, naming each finding and why, alone and before any other refusal; each member is read at its pin, as the viewer; tensionsUndetermined is the same refusal for a caller's own failed read", () => {
  for (const [answer, why] of [[{ ok: true, candidates: [], undetermined: true, why: "the read failed" }, /the read failed/],
                               [{ ok: false, reason: "X" }, /the read failed/],
                               [{ ok: true, candidates: [], truncated: true, bound: 200 }, /more than 200/],
                               [{ ok: true }, /the read failed/],
                               [null, /no answer/], ["throws", /boom/]]) {
    const calls = [];
    const stub = { unresolvedRecordOn(a) { calls.push(a); if (answer === "throws") throw new Error("boom"); return answer; } };
    const w = world({ deps: { contradiction: stub } });
    w.member("alice"); w.doc(DOC); w.finding(F, [{ target: DOC }]);
    const prep = w.prepared([F]);
    const read = w.cd.tensionsRead(prep, V("alice"));
    refused(read, "TENSIONS_UNDETERMINED");
    assert.deepEqual(read.undetermined.map((u) => [u.finding, u.sha]), [[F, w.head(F)]]);
    assert.match(read.undetermined[0].why, why);
    assert.deepEqual(calls[0], { finding: F, sha: w.head(F), viewer: V("alice") }, "at the pin, as the viewer");
    const j = w.cd.tensionsJudged(prep, V("alice"), [{ candidate: "c" }]);
    assert.deepEqual(j.refusals.map((r) => r.reason), ["TENSIONS_UNDETERMINED"], "alone");
  }
  const w = world({ deps: { contradiction: { unresolvedRecordOn: () => ({ ok: true, candidates: [], truncated: false }) } } });
  const u = w.cd.tensionsUndetermined([{ finding: null, why: "my own read threw" }]);
  refused(u, "TENSIONS_UNDETERMINED");
  assert.deepEqual(u.undetermined, [{ finding: null, why: "my own read threw" }]);
  assert.match(u.detail, /this case's findings \(my own read threw\)/);
  w.member("alice"); w.doc(DOC); w.finding(F, [{ target: DOC }]);
  assert.deepEqual(w.cd.tensionsJudged(w.prepared([F]), V("alice"), null).refusals, [], "negative control: a whole read");
});

test("R1, R18: a leg the read could name no referent for is answered per member in `unread` and stated in the section, never read as no conflict", () => {
  const w = world({ deps: { contradiction: { unresolvedRecordOn: () => ({ ok: true, candidates: [], truncated: false,
                                                                          undetermined_legs: 2 }) } } });
  w.member("alice"); w.doc(DOC); w.finding(F, [{ target: DOC }]);
  const j = w.cd.tensionsJudged(w.prepared([F]), V("alice"), null);
  assert.deepEqual([j.refusals, j.unread], [[], [{ finding: F, legs: 2 }]]);
  const fm = parseFrontmatter(["---", ...tensionFrontmatterLines([], j.unread), "---", ""].join("\n")).data;
  assert.deepEqual(fm.case_tensions_unread.map((u) => [u.target, u.legs]), [[F, 2]]);
  const body = tensionBodyLines([], j.unread).join("\n");
  assert.ok(body.includes(tensionsUnreadStated(j.unread)));
  assert.match(body, /2 leg\(s\) of INQ-2026-0001-q name no passage the record holds, so a conflict on them could not be looked for; that is stated, not read as none\./);
  assert.equal(tensionBodyLines([], []).join("\n").includes("name no passage"), false, "negative control");
});

test("R1: the section lists each entry — the finding, both sides verbatim with source, date, doctype and capture, its state, kind and explanation, the owner's words, acknowledged_by and the instant, the one-level sentence — and each member's sentence comes from its template", () => {
  const { w, id } = seen();
  assert.equal(w.contradiction.clarify({ candidate: id, choice: "differs", coordinates: ["scope"],
    explanation: "the two pages speak of different years", viewer: V("alice"), author: V("alice") }).ok, true);
  const j = w.cd.tensionsJudged(w.prepared([F]), V("alice"), disclose(id, "we read the later page as the award"));
  assert.deepEqual(j.refusals, []);
  const t = acknowledged(j);
  const fm = parseFrontmatter(["---", ...tensionFrontmatterLines(t, j.unread), "---", ""].join("\n")).data;
  assert.deepEqual([fm.tensions_disclosed, fm.tensions_highlighted, fm.tensions_depth_stated], [1, 0, TENSIONS_DEPTH_STATED]);
  const e = fm.case_tensions[0];
  assert.deepEqual([e.candidate, e.finding, e.state, e.kind, e.unseen_other_side, e.depth, e.acknowledged_by, e.acknowledged_at,
                    e.words, e.explanation],
    [id, F, "explained_not_shown", null, false, 1, "alice", AT, "we read the later page as the award",
     "the two pages speak of different years"]);
  assert.deepEqual([e.a_kind, e.a_text, e.a_source, e.b_kind, e.b_text, e.b_source],
    ["leg", `the page of ${DOC}`, DOC, "leg", `the page of ${DOC2}`, DOC2]);
  assert.equal(e.a_capture, w.row(`SELECT capture_sha FROM content WHERE content_id=?`, CA).capture_sha);
  assert.ok(["a_date", "a_doctype", "b_date", "b_doctype", "b_capture"].every((k) => k in e));
  assert.deepEqual(fm.case_tension_sentences.map((x) => [x.target, x.candidate, x.template, x.sentence]),
    [[F, id, "explained", tensionSentence(t[0])]]);
  assert.ok(tensionSentence(t[0]).startsWith(TENSION_TEMPLATES.explained + "the two pages speak of different years — "));
  assert.match(tensionSentence(t[0]), new RegExp(`\\(conflict ${id}\\)\\. Disclosed by alice on ${AT}\\.$`));
  const body = tensionBodyLines(t, j.unread).join("\n");
  for (const s of ["## Tensions Disclosed", `- **${F}**, conflict ${id}: explained, not yet shown.`,
                   `  - one side: the page of ${DOC} — source ${DOC}`, `  - the other side: the page of ${DOC2} — source ${DOC2}`,
                   "  - The explanation recorded: the two pages speak of different years",
                   "  - In the owner's words: we read the later page as the award", `  - Acknowledged by alice on ${AT}.`,
                   TENSIONS_DEPTH_STATED])
    assert.ok(body.includes(s), s);
  /* none: the section still says so, with the one-level sentence */
  assert.ok(tensionBodyLines([], []).join("\n").includes("The record held no unresolved conflict"));
  assert.deepEqual(tensionFrontmatterLines([], []).slice(0, 2), ["tensions_disclosed: 0", "tensions_highlighted: 0"]);
});

test("R1: the four templates, by the candidate's standing — open or taken up is in tension, explained-not-shown is explained, resolved irreconcilable is held irreconcilable, and a highlighted one the last, not its state's own", () => {
  assert.deepEqual(TENSION_TEMPLATES, { in_tension: "In tension, not yet resolved: ", explained: "Explained, not yet shown: ",
    irreconcilable: "Held irreconcilable by the group: ", unseen: "Rests on a side in conflict with a record not shown: " });
  const side = (text) => tensionSide({ kind: "leg", text, source: { bundle: DOC } });
  const base = { candidate: "c1", finding: F, a: side("one"), b: side("two"), acknowledged_by: "alice", acknowledged_at: AT };
  for (const [over, k] of [[{ state: "open" }, "in_tension"], [{ state: "taken_up" }, "in_tension"],
                           [{ state: "explained_not_shown", explanation: "e" }, "explained"],
                           [{ state: "resolved", kind: "irreconcilable" }, "irreconcilable"],
                           [{ state: "explained_not_shown", unseen_other_side: true, side: side("seen") }, "unseen"],
                           [{ state: "resolved", kind: "irreconcilable", unseen_other_side: true, side: side("seen") }, "unseen"]]) {
    const t = { ...base, ...over };
    assert.equal(tensionTemplate(t), k, JSON.stringify(over));
    assert.ok(tensionSentence(t).startsWith(TENSION_TEMPLATES[k]), k);
  }
  assert.equal(tensionSentence({ ...base, state: "open" }),
    `In tension, not yet resolved: 'one' (${DOC}) against 'two' (${DOC}) (conflict c1). Disclosed by alice on ${AT}.`);
  /* tensionSide states each field the record states, null where none */
  assert.deepEqual(tensionSide(null), { kind: null, text: null, source: null, date: null, doctype: null, capture: null });
  assert.deepEqual(tensionSide({ kind: "claim", claim: "c", inquiry: "INQ-x", date: "d", doctype: "t", capture_sha: "s" }),
    { kind: "claim", text: "c", source: "INQ-x", date: "d", doctype: "t", capture: "s" });
});

test("R1, R17 (DEC-85): a tension with a side the owner may not see is named in C-120.1 by its candidate and finding only, with the words; listed, its entry carries the seen side only and the highlight, and no answer, row or sentence holds anything of the other side", () => {
  const { w, H, id } = hidden();
  assert.equal(w.contradiction.clarify({ candidate: id, choice: "differs", coordinates: ["scope"],
    explanation: "the hidden minutes say otherwise", viewer: V("bo"), author: V("bo") }).ok, true);
  const prep = w.prepared([F]);
  const j = w.cd.tensionsJudged(prep, V("alice"), null);
  refused(j.refusals[0], "TENSION_NOT_DISCLOSED");
  assert.deepEqual(j.refusals[0].undisclosed, [{ candidate: id, finding: F, unseen_other_side: true, says: NOT_SHOWN_WORDS }]);
  assert.match(j.refusals[0].detail, new RegExp(`${id} on ${F}, ${NOT_SHOWN_WORDS}`));
  assert.equal(NOT_SHOWN_WORDS, "in conflict with a record not shown");
  const ok = w.cd.tensionsJudged(prep, V("alice"), disclose(id, "we rest on the page we hold"));
  assert.deepEqual(ok.refusals, []);
  const [e] = ok.entries;
  assert.deepEqual(Object.keys(e).sort(), ["candidate", "depth", "finding", "kind", "side", "state", "unseen_other_side"]);
  assert.deepEqual([e.unseen_other_side, e.side.text, e.side.source], [true, `the page of ${DOC}`, DOC]);
  const t = acknowledged(ok);
  const fmLines = tensionFrontmatterLines(t, ok.unread), bodyLines = tensionBodyLines(t, ok.unread);
  const fm = parseFrontmatter(["---", ...fmLines, "---", ""].join("\n")).data;
  assert.deepEqual([fm.case_tensions[0].highlight, fm.tensions_highlighted, fm.case_tension_sentences[0].template],
    [HIGHLIGHT_SENTENCE, 1, "unseen"]);
  for (const k of Object.keys(fm.case_tensions[0])) assert.ok(!/^(a|b)_|^explanation$/.test(k), `no field ${k}`);
  assert.ok(bodyLines.join("\n").includes(`  - ${HIGHLIGHT_SENTENCE}`));
  assert.ok(bodyLines.join("\n").includes(" — HIGHLIGHTED."));
  assert.equal(HIGHLIGHT_SENTENCE, "This finding rests on a side in conflict with a record not shown here. The record and who holds it are not named.");
  for (const said of [JSON.stringify(j.refusals), JSON.stringify(ok.entries), fmLines.join("\n"), bodyLines.join("\n"),
                      tensionSentence(t[0])])
    for (const leak of [CH, sha("the hidden capture"), "hidden minutes", "page 4", H, "Hidden", "member:bo", "say otherwise"])
      assert.equal(said.includes(leak), false, `names ${leak}`);
  /* negative control: bo, who sees both, is answered both sides */
  const bo = w.cd.tensionsRead(prep, V("bo"));
  assert.equal(bo.entries.some((x) => x.unseen_other_side === false && JSON.stringify(x).includes("hidden minutes")), true);
});

test("R17 (DEC-85): sight at the act governs — a reveal to the hidden party (contradiction R52) never widens what the publisher's read holds", () => {
  const { w, P, H, id } = hidden();
  assert.equal(w.contradiction.optIn({ candidate: id, project: P, viewer: V("alice"), author: "alice" }).ok, true);
  const rev = w.contradiction.optIn({ candidate: id, project: H, viewer: V("bo"), author: "bo" });
  assert.equal(rev.revealed, true, JSON.stringify(rev).slice(0, 300));
  const j = w.cd.tensionsJudged(w.prepared([F]), V("alice"), disclose(id));
  assert.deepEqual([j.refusals, j.entries[0].unseen_other_side], [[], true]);
  const text = [JSON.stringify(j.entries), ...tensionFrontmatterLines(acknowledged(j), []), ...tensionBodyLines(acknowledged(j), [])].join("\n");
  for (const leak of [CH, "hidden minutes", H, "Hidden"]) assert.equal(text.includes(leak), false, `names ${leak}`);
});
