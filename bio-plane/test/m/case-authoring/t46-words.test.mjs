/* case-authoring R73 (T46-27; DEC-194, N913): wording only. Four of R71's rows (C-136.3, .6, .7, .8) take their
   translations from `words.json`'s `refusal.<CODE>`, and C-136.4 is read by its key, each through `CASE_AUTHORING_WORDS`,
   never a copy; C-136.5 BAD_CARRIED_OUTCOME keeps its own; every other row of the module's three families keeps its check,
   `where` and translation. The sign step's fact lines read `signing.openrequest.line` and `.noreply` with the row's facts;
   `.nowindow` and `.unread` are not taken in T46. At the interface: the rows as exported, each refusal as the acts answer
   it beside its control, and the pre-flight's sign step, over the real modules. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { world, V, AUTHORED, WHAT_CHANGED } from "./fixture.mjs";
import { PUBLISH_ACT_CHECKS, CASE_DERIVATION_CHECKS, STATEMENT_ACK_CHECKS, CASE_AUTHORING_WORDS, OPEN_REQUEST_KEYS,
         OPEN_REQUESTS_UNREAD_SENTENCE } from "../../../src/case-authoring/index.mjs";
import { canonicalJson, sha256HexSync } from "../../../src/record-grammar/index.mjs";

const WORDS = JSON.parse(await readFile(new URL("../../../../docs/development/ux-substrate/screens/words.json",
  import.meta.url), "utf8")).words;
const en = (key) => {
  const w = WORDS.find((x) => x.key === key);
  assert.ok(w, `words.json holds ${key}`);
  return w.en;
};
const fill = (key, f) => en(key).replace(/\{([a-z_]+)\}/g, (m, k) => (k in f ? String(f[k]) : m));

/* The five rows R73 reads by key, with the numbers and `where`s it does not move. */
const AT = (fn, region) => `src/case-authoring/index.mjs ${fn} > ${region}`;
const TAKEN = {
  MACHINE_CANNOT_CARRY_OUTCOME: ["C-136.3", AT("carryOutcome", "is-carry-machine")],
  CARRY_NOT_A_PARTICIPANT: ["C-136.4", AT("carryOutcome", "is-carry-participant")],
  NO_SUCH_CARRIED_OUTCOME: ["C-136.6", AT("withdrawCarriedOutcome", "is-carried-outcome-found")],
  CARRIED_OUTCOME_SETTLED: ["C-136.7", AT("withdrawCarriedOutcome", "is-carried-outcome-pending")],
  CARRY_NO_REASON: ["C-136.8", AT("withdrawCarriedOutcome", "is-carry-reasoned")],
};
/* The four R73 re-words, as T45 worded them: none is answered any longer. (C-136.4's already read as its key.) */
const T45 = {
  MACHINE_CANNOT_CARRY_OUTCOME: "An outcome is carried into a case's next edition by a member, and the credential that asked "
    + "here is an automated one. Sign in to carry it. Nothing was written.",
  NO_SUCH_CARRIED_OUTCOME: "No outcome carried into a case you can see answers to that id. Nothing was written.",
  CARRIED_OUTCOME_SETTLED: "This outcome is no longer waiting for the next edition: a signed edition already carries it, or it "
    + "was withdrawn. A signed edition is corrected only by a later one. Nothing was written.",
  CARRY_NO_REASON: "Withdrawing an outcome from a case's next edition is recorded with your own words on why, and none were "
    + "given, or they are longer than 2,000 characters. Write them. Nothing was written.",
};
/* C-136.5 keeps its present translation in T46 (R73). */
const BAD_CARRIED_OUTCOME = "An outcome carried into a case is its kind (a success, a cure or a harm addressed), your statement "
  + "on one line of at most 2,000 characters with no quote or backslash, what it cites, and the date it happened. One of "
  + "these is missing or malformed, and is named. Nothing was written.";
/* Every other row of the three families (17, C-136.5 among them), as T45 left them: their canonical JSON's sha256, keyed
   `<family>.<code>`, so no check, where or translation of theirs moves. */
const KEPT = { count: 17, sha256: "61c72226677f2c6cf6ba1b846b2fbcfea037966d3fa9af6855ad46dc8d9b8f53" };
const FAMILIES = { PUBLISH_ACT_CHECKS, CASE_DERIVATION_CHECKS, STATEMENT_ACK_CHECKS };
const SENTENCES = ["signing.openrequest.line", "signing.openrequest.noreply"];

test("R73 C-136.3, .4, .6, .7 and .8 read words.json's refusal.<CODE> by key from CASE_AUTHORING_WORDS, never a copy; codes, numbers and wheres unmoved; T45's words answered no longer", () => {
  assert.ok(Object.isFrozen(CASE_AUTHORING_WORDS));
  assert.deepEqual(Object.keys(CASE_AUTHORING_WORDS).sort(),
    [...Object.keys(TAKEN).map((c) => `refusal.${c}`), ...SENTENCES].sort(), "the table holds exactly R73's keys");
  for (const [key, text] of Object.entries(CASE_AUTHORING_WORDS)) assert.equal(text, en(key), `${key} verbatim`);
  for (const [code, [check, where]] of Object.entries(TAKEN)) {
    const row = PUBLISH_ACT_CHECKS[code];
    assert.deepEqual([row.check, row.where], [check, where], code);
    assert.deepEqual(Object.keys(row).sort(), ["check", "translation", "where"], code);
    assert.equal(row.translation, CASE_AUTHORING_WORDS[`refusal.${code}`], `${code} reads refusal.${code}`);
    assert.equal(row.translation, en(`refusal.${code}`), code);
    if (T45[code]) assert.notEqual(row.translation, T45[code], `${code}: T45's words no longer`);
  }
});

test("R73 C-136.5 BAD_CARRIED_OUTCOME keeps its present translation, not words.json's (which says only that a field is lacking, while R71 also refuses one present and malformed); the not-taken keys are absent; every other row of the three families keeps its own", () => {
  const row = PUBLISH_ACT_CHECKS.BAD_CARRIED_OUTCOME;
  assert.deepEqual([row.check, row.where, row.translation], ["C-136.5", AT("carryOutcome", "is-carry-shaped"), BAD_CARRIED_OUTCOME]);
  for (const key of ["refusal.BAD_CARRIED_OUTCOME", "signing.openrequest.nowindow", "signing.openrequest.unread"])
    assert.ok(!(key in CASE_AUTHORING_WORDS), `${key} not taken in T46`);
  assert.notEqual(row.translation, en("refusal.BAD_CARRIED_OUTCOME"), "words.json's sentence and R71 do not yet agree");
  const kept = {};
  for (const [fam, rows] of Object.entries(FAMILIES))
    for (const [code, r] of Object.entries(rows)) if (!(code in TAKEN)) kept[`${fam}.${code}`] = r;
  assert.deepEqual([Object.keys(kept).length, sha256HexSync(canonicalJson(kept))], [KEPT.count, KEPT.sha256],
    "no other row's check, where or translation moved");
  for (const [code, r] of Object.entries(kept)) assert.ok(!Object.values(CASE_AUTHORING_WORDS).includes(r.translation), code);
});

/* R71's world (outcomes.test.mjs): a ratified case of alice's project, bo joined, cy invited, di outside. */
const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q";
const OUTCOME = { kind: "success", text: "The council published the amended minutes.", cites: [{ kind: "finding", ref: Q }],
                  on: "2026-09-20" };
function carried() {
  const w = world();
  for (const m of ["alice", "bo", "cy", "di"]) w.member(m);
  w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q]);
  w.join(P, "bo");
  w.join(P, "cy", "invited");
  const e1 = w.publish(P, "alice", [Q]);
  assert.equal(e1.ok, true, JSON.stringify(e1).slice(0, 300));
  w.ratify(e1);
  return { w, P, caseId: e1.caseId };
}
const answers = (r, code) => {
  assert.equal(r.ok, false, `${code}: ${JSON.stringify(r).slice(0, 300)}`);
  assert.deepEqual([r.reason, r.code, r.check, r.translation],
    [code, code, PUBLISH_ACT_CHECKS[code].check, en(`refusal.${code}`)], code);
};

test("R73 each re-worded refusal is answered by carryOutcome and withdrawCarriedOutcome with words.json's sentence, behaviour unmoved: refused, nothing written, beside its control", () => {
  const { w, caseId } = carried();
  const before = w.snapshot();
  /* C-136.3, on both acts, and its control */
  answers(w.ca.carryOutcome({ case: caseId, ...OUTCOME, by: "class:daemon" }), "MACHINE_CANNOT_CARRY_OUTCOME");
  answers(w.ca.carryOutcome({ case: caseId, ...OUTCOME, by: null }), "MACHINE_CANNOT_CARRY_OUTCOME");
  /* C-136.4: seen, not joined */
  answers(w.ca.carryOutcome({ case: caseId, ...OUTCOME, by: "cy" }), "CARRY_NOT_A_PARTICIPANT");
  assert.deepEqual(w.snapshot(), before, "nothing written");
  const o = w.ca.carryOutcome({ case: caseId, ...OUTCOME, by: "alice" });
  assert.equal(o.ok, true, "the control: a joined member carries it");
  const mid = w.snapshot();
  answers(w.ca.withdrawCarriedOutcome({ outcome: o.outcome, reason: "wrong", by: "class:daemon" }), "MACHINE_CANNOT_CARRY_OUTCOME");
  /* C-136.6: absent, and unseen alike */
  answers(w.ca.withdrawCarriedOutcome({ outcome: "OUTC-2026-0000", reason: "wrong", by: "alice" }), "NO_SUCH_CARRIED_OUTCOME");
  answers(w.ca.withdrawCarriedOutcome({ outcome: o.outcome, reason: "wrong", by: "di" }), "NO_SUCH_CARRIED_OUTCOME");
  /* C-136.8 */
  for (const reason of [undefined, "  ", "x".repeat(2001)])
    answers(w.ca.withdrawCarriedOutcome({ outcome: o.outcome, reason, by: "alice" }), "CARRY_NO_REASON");
  assert.deepEqual(w.snapshot(), mid, "nothing written");
  /* the control: withdrawn with a reason; C-136.7 once withdrawn */
  assert.equal(w.ca.withdrawCarriedOutcome({ outcome: o.outcome, reason: "the wrong case", by: "alice" }).ok, true);
  const after = w.snapshot();
  const settled = w.ca.withdrawCarriedOutcome({ outcome: o.outcome, reason: "again", by: "alice" });
  answers(settled, "CARRIED_OUTCOME_SETTLED");
  assert.equal(settled.state, "withdrawn");
  assert.deepEqual(w.snapshot(), after, "nothing written");
  /* C-136.5 unchanged */
  const bad = w.ca.carryOutcome({ case: caseId, ...OUTCOME, on: "2026-02-30", by: "alice" });
  assert.deepEqual([bad.reason, bad.field, bad.translation], ["BAD_CARRIED_OUTCOME", "on", BAD_CARRIED_OUTCOME]);
  /* no answer carries T45's words */
  const text = JSON.stringify(Object.keys(TAKEN).map((c) => PUBLISH_ACT_CHECKS[c]));
  for (const old of Object.values(T45)) assert.ok(!text.includes(old));
});

/* The sign step's lines (R34, R70), over a pre-flight that would publish. */
const OQ = "INQ-2026-0002-q", ODOC = "INFO-2026-0002-a";
function preflight(rows) {
  const w = world();
  w.member("alice");
  w.doc(ODOC);
  w.finding(OQ, [{ target: ODOC }]);
  const P = w.project("Team", "alice", [OQ]);
  if (rows) w.ca.registerOpenRequests("action-replies", { openRequestsOn: () => (rows instanceof Error ? (() => { throw rows; })() : rows) });
  const pre = w.ca.publishPreflight({ ...AUTHORED, whatChanged: WHAT_CHANGED, project: P, targets: [OQ], roles: { [OQ]: "load_bearing" },
                                      viewer: V("alice"), author: "alice" });
  assert.equal(pre.first, null, JSON.stringify(pre.first).slice(0, 300));
  return pre.steps.find((s) => s.name === "sign").open_requests;
}
const CLERK = "the City Clerk, City of Example";

test("R73 a row with a window and a reply laid out reads signing.openrequest.line, and one stating no reply is recorded signing.openrequest.noreply, each with the row's whom, asked_at, window_closes, answered and claims filled", () => {
  const rows = [
    { whom: CLERK, asked_at: "2026-09-01", window_closes: "2026-09-30", answers: { answered: 2, claims: 3 } },
    { whom: "the Planning Director", asked_at: "2026-09-05", window_closes: "2026-10-05", answers: null, replied: false },
    { whom: "the Auditor", asked_at: "2026-09-06", window_closes: "2026-10-06", answers: { answered: 0, claims: 4 }, replied: true },
  ];
  const o = preflight(rows);
  assert.equal(o.read, true);
  assert.deepEqual(o.lines.map((l) => [l.key, l.says]), [
    [OPEN_REQUEST_KEYS.line, fill("signing.openrequest.line", { whom: CLERK, asked_at: "2026-09-01", window_closes: "2026-09-30",
                                                                answered: 2, claims: 3 })],
    [OPEN_REQUEST_KEYS.noreply, fill("signing.openrequest.noreply", { whom: "the Planning Director", asked_at: "2026-09-05",
                                                                     window_closes: "2026-10-05" })],
    [OPEN_REQUEST_KEYS.line, fill("signing.openrequest.line", { whom: "the Auditor", asked_at: "2026-09-06", window_closes: "2026-10-06",
                                                                answered: 0, claims: 4 })]]);
  assert.deepEqual(OPEN_REQUEST_KEYS, { line: "signing.openrequest.line", noreply: "signing.openrequest.noreply" });
  for (const l of o.lines) assert.ok(!/\{[a-z_]+\}/.test(l.says), "every placeholder filled");
});

test("R73 (P8) a reply recorded never reads \"no reply is recorded\": answers null with replied true, or with replied unstated (R70's null for a reply whose claims are not laid out), reads a plain sentence true of it, keyed null", () => {
  const rows = [
    { whom: CLERK, asked_at: "2026-09-01", window_closes: "2026-09-30", answers: null, replied: true },
    { whom: CLERK, asked_at: "2026-09-02", window_closes: "2026-09-30", answers: null },
    { whom: CLERK, asked_at: "2026-09-03", window_closes: "2026-09-30", answers: null, replied: null },
  ];
  const o = preflight(rows);
  assert.deepEqual(o.lines.map((l) => [l.key, l.replied]), [[null, true], [null, null], [null, null]]);
  for (const l of o.lines) assert.ok(!l.says.includes("no reply is recorded"), l.says);
  assert.equal(o.lines[0].says, `${CLERK} was asked for comment on 2026-09-01; the window for a reply closes on 2026-09-30; `
    + "a reply is recorded, and its claims are not yet laid out.");
  assert.equal(o.lines[1].says, `${CLERK} was asked for comment on 2026-09-02; the window for a reply closes on 2026-09-30; `
    + "no reply laid out claim by claim is recorded.");
  /* control: stated absent, it reads the noreply word */
  const n = preflight([{ ...rows[0], replied: false }]).lines[0];
  assert.deepEqual([n.key, n.says.endsWith("no reply is recorded.")], [OPEN_REQUEST_KEYS.noreply, true]);
});

test("R73 not taken in T46: a row with no window keeps its plain sentence (signing.openrequest.nowindow is not a sentence in place), and an unread source keeps its one plain sentence (signing.openrequest.unread is not read), each keyed null", () => {
  const o = preflight([{ whom: CLERK, asked_at: "2026-09-01", window_closes: null, answers: { answered: 1, claims: 2 } },
                       { whom: CLERK, asked_at: "2026-09-02", window_closes: null, answers: null, replied: false }]);
  assert.deepEqual(o.lines.map((l) => [l.key, l.says]), [
    [null, `${CLERK} was asked for comment on 2026-09-01; no date is stated for the window to close; the reply answers 1 of the 2 `
      + "claims the request laid out."],
    [null, `${CLERK} was asked for comment on 2026-09-02; no date is stated for the window to close; no reply is recorded.`]]);
  for (const l of o.lines) assert.ok(!l.says.includes(en("signing.openrequest.nowindow")));
  const u = preflight(new Error("down"));
  assert.deepEqual(u, { read: false, undetermined: true, key: null, says: OPEN_REQUESTS_UNREAD_SENTENCE });
  assert.notEqual(u.says, en("signing.openrequest.unread"));
});
