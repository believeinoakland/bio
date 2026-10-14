/* actions' T41 entry at its interface: R70–R72 (H30 (1); K2505, K2552, K2553, K2561), what a records request seeks; R73 moved to `action-records` (its R3, T47; N961).
   (Its R52, R56–R60 hold tests moved to `action-holds` with the code, T45; K2781 (1).) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";

const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b", C = "ACTN-2026-0003-c", I3 = "INFO-2026-0003-p";
const ALICE = V("alice"), BOB = V("bob");
const sorted = (xs) => [...xs].sort();

/* ---------------------------------------------------------------- R70, R71 (H30 (1); K2505, K2552, K2553) */

const E1 = "ENT-2026-0001-council", E2 = "ENT-2026-0002-board";
/* progressions R5's `readProgression`, a stand-in in its shape: `meeting` declares notice, minutes; `budget` adopted.
   Each key read is kept in `asked`; `broken` makes every read throw. */
function progressionsStandIn() {
  const defs = { meeting: ["notice", "minutes"], budget: ["adopted"] };
  const p = { asked: [], broken: false,
    readProgression({ progressionKey }) {
      p.asked.push(progressionKey);
      if (p.broken) throw new Error("progressions unavailable");
      return defs[progressionKey]
        ? { ok: true, progression_key: progressionKey, found: true,
            stages: defs[progressionKey].map((k, i) => ({ stage_key: k, stage_no: i + 1 })) }
        : { ok: true, progression_key: progressionKey, found: false, stages: [] };
    } };
  return p;
}
const seeksLines = (items) => ["seeks:", ...items.flatMap((x) =>
  [`  - progression: ${x.progression}`, `    entity: ${x.entity}`, `    stage: ${x.stage}`])];
const rr = (lines = []) => ["action_kind: records_request", ...lines];
const CPL = ["counterparty:", "  state: named", "  role: Town Clerk", "  body: Town of Port Ellery"];
import { actionMd } from "./fixture.mjs";
import * as grammar from "../../../src/action-grammar/index.mjs";
import * as actions from "../../../src/actions/index.mjs";
const md = (id, lines) => actionMd(id, [...CPL, ...lines]);
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";
const fmOf = (text) => parseFrontmatter(text).data;

test("R70 a records_request stating seeks is checked at the write through progressions.readProgression: a progression not held or a stage not declared is refused SEEKS_REFUSED (C-117.29) with every finding, before any write", () => {
  const progressions = progressionsStandIn();
  const w = world({ deps: { progressions } });
  const ok = [{ progression: "meeting", entity: E1, stage: "minutes" }, { progression: "budget", entity: E2, stage: "adopted" }];
  /* negative control: every item held and declared lands, the facts read once per distinct progression */
  assert.equal(w.promote(A, md(A, rr(seeksLines(ok)))).ok, true);
  assert.deepEqual(sorted(progressions.asked), ["budget", "meeting"]);
  assert.deepEqual(grammar.seeksOf(w.fm(A)), ok, "the document holds what was stated");
  /* a progression not held, and a stage the progression does not declare: one finding each, all carried */
  const bad = w.promote(B, md(B, rr(seeksLines([{ progression: "zoning", entity: E1, stage: "notice" },
    { progression: "meeting", entity: E1, stage: "vote" }, { progression: "meeting", entity: E2, stage: "notice" }]))));
  const row = grammar.ACTION_CATALOGUE_CHECKS.SEEKS_REFUSED;
  assert.deepEqual([bad.ok, bad.reason, bad.code, bad.check, bad.translation], [false, "SEEKS_REFUSED", "SEEKS_REFUSED", "C-117.29", row.translation]);
  assert.equal(bad.findings.length, 2);
  assert.ok(bad.findings.every((f) => f.check === "C-117.29" && f.code === "SEEKS_REFUSED"));
  assert.match(bad.findings[0].detail, /zoning' is not a progression this record holds/);
  assert.match(bad.findings[1].detail, /'vote' is not a stage progression 'meeting' declares/);
  assert.equal(w.record.head(B), null, "nothing written");
  /* the grammar's shape arms reach the write too: on another kind, over 12, malformed, repeated */
  const thirteen = Array.from({ length: 13 }, (_, i) => ({ progression: "meeting", entity: `ENT-2026-${1000 + i}-x`, stage: "notice" }));
  for (const lines of [["action_kind: other", ...seeksLines(ok)], rr(seeksLines(thirteen)), rr(["seeks: []"]),
                       rr(seeksLines([ok[0], ok[0]])), rr(["seeks:", "  - progression: meeting", "    entity: E"])])
    assert.equal(w.promote(C, md(C, lines)).reason, "SEEKS_REFUSED", JSON.stringify(lines).slice(0, 80));
  assert.equal(w.record.head(C), null);
  /* a revision that changes seeks is judged; one that carries it forward is not re-read */
  const before = progressions.asked.length;
  assert.equal(w.promote(A, md(A, rr([...seeksLines(ok), 'note: "a revision"']))).ok, true);
  assert.equal(progressions.asked.length, before, "carried forward unchanged: not asked again");
  assert.equal(w.promote(A, md(A, rr(seeksLines([{ progression: "budget", entity: E2, stage: "notice" }])))).reason, "SEEKS_REFUSED");
  /* progressions unreadable: refused, never passed, and said so */
  progressions.broken = true;
  const un = w.promote(C, md(C, rr(seeksLines(ok))));
  assert.deepEqual([un.reason, un.cause], ["SEEKS_REFUSED", "PROGRESSIONS_UNREADABLE"]);
  /* absent seeks asks nothing of progressions */
  progressions.asked.length = 0;
  assert.equal(w.promote(C, md(C, rr())).ok, true);
  assert.deepEqual(progressions.asked, []);
});

test("R72 R70 any member who may write the action may state seeks; a machine or unstamped author that states, changes or removes it is refused MACHINE_CANNOT_STATE_SEEKS (C-32.21) before any write; a machine carrying it forward unchanged lands", () => {
  const w = world({ deps: { progressions: progressionsStandIn() } });
  const ok = [{ progression: "meeting", entity: E1, stage: "minutes" }];
  for (const author of ["class:daemon", ""]) {
    const r = w.promote(A, md(A, rr(seeksLines(ok))), { author });
    assert.deepEqual([r.reason, r.code, r.check], ["MACHINE_CANNOT_STATE_SEEKS", "MACHINE_CANNOT_STATE_SEEKS", "C-32.21"], author || "unstamped");
    assert.equal(r.translation, grammar.RECORDS_LAW_FENCE_CHECKS.MACHINE_CANNOT_STATE_SEEKS.translation);
  }
  assert.equal(w.record.head(A), null);
  assert.equal(w.promote(A, md(A, rr(seeksLines(ok))), { author: BOB }).ok, true, "a member states it");
  /* a machine revision carrying seeks unchanged lands; changing or removing it is refused */
  assert.equal(w.promote(A, md(A, rr([...seeksLines(ok), 'note: "touched"'])), { author: "class:daemon" }).ok, true);
  assert.equal(w.promote(A, md(A, rr(seeksLines([{ progression: "budget", entity: E1, stage: "adopted" }]))),
    { author: "class:daemon" }).reason, "MACHINE_CANNOT_STATE_SEEKS");
  assert.equal(w.promote(A, md(A, rr()), { author: "class:daemon" }).reason, "MACHINE_CANNOT_STATE_SEEKS", "nor remove it");
  assert.deepEqual(grammar.seeksOf(w.fm(A)), ok, "every refused machine write left it as the member stated it");
  /* a replay is never asked (the record's own history is holdable verbatim) */
  assert.equal(w.promote(B, md(B, rr(seeksLines([{ progression: "zoning", entity: E1, stage: "x" }]))),
    { author: "class:daemon", extra: { replay: true } }).ok, true);
});

test("R71 at start actions registers once with intent.registerNoneExistsReader; noneExistsFor answers the records requests the viewer may see that seek that stage and hold a received none_exists decision, {action, ord, at}, oldest first, at most 50; writes nothing, never throws", () => {
  const registered = [];
  const intent = { registerNoneExistsReader: (fn) => (registered.push(fn), { ok: true }) };
  const w = world({ deps: { progressions: progressionsStandIn(), intent } });
  assert.equal(registered.length, 1, "registered once");
  const reader = registered[0];
  const seek = { progression: "meeting", entity: E1, stage: "minutes" };
  const ask = (viewer = ALICE, s = seek) => reader({ ...s, viewer });
  /* A seeks it, answered none exists twice; B seeks it and was denied; C seeks another stage, answered none exists;
     D sits in alice's hidden project, seeking it, answered none exists. Each request is sent first (ord 0). */
  const P = w.promotion.promote({ base: null, snapKey: "p1", author: ALICE, ownerMemberId: "alice",
    files: [{ path: "bundle.md", text: ["---", "object_type: project", "schema: project@1", 'title: "P"', "current_state: forming",
      "prior_state: null", 'created: "2026-09-27T00:00:00Z"', 'last_updated: "2026-09-27T00:00:00Z"', "references: []",
      "state_history: []", "---", "", "## Objective", "", "x", ""].join("\n") }], meta: { object_type: "project" } }).bundleId;
  const D = "ACTN-2026-0004-d";
  for (const [id, lines] of [[A, seeksLines([seek])], [B, seeksLines([seek])],
                             [C, seeksLines([{ ...seek, stage: "notice" }])], [D, [`project: ${P}`, ...seeksLines([seek])]]]) {
    assert.equal(w.promote(id, md(id, rr(lines))).ok, true, id);
    assert.equal(w.a.actionCorrespond({ target: id, direction: "sent", at: "2026-09-01", account: "asked", stage: "request",
      viewer: ALICE, author: ALICE }).ok, true, id);
  }
  const say = (id, at, outcome) => assert.equal(w.a.actionCorrespond({ target: id, direction: "received", at,
    account: "the clerk wrote back", stage: "denial", follows: "0", outcome, viewer: ALICE, author: ALICE }).ok, true, `${id} ${at}`);
  say(A, "2026-09-20", "none_exists");
  say(B, "2026-09-10", "denied");
  say(C, "2026-09-05", "none_exists");
  say(D, "2026-09-03", "none_exists");
  say(A, "2026-09-02", "none_exists");
  assert.deepEqual(ask(), [{ action: A, ord: 2, at: "2026-09-02" }, { action: D, ord: 1, at: "2026-09-03" },
                           { action: A, ord: 1, at: "2026-09-20" }], "oldest first; the denied one and another stage left out");
  /* negative controls: a viewer who may not see D; another stage; another entity; no viewer; a malformed ask */
  assert.deepEqual(ask(BOB), [{ action: A, ord: 2, at: "2026-09-02" }, { action: A, ord: 1, at: "2026-09-20" }]);
  assert.deepEqual(ask(ALICE, { ...seek, stage: "notice" }), [{ action: C, ord: 1, at: "2026-09-05" }]);
  assert.deepEqual(ask(ALICE, { ...seek, entity: E2 }), []);
  for (const v of [null, undefined, ""]) assert.deepEqual(reader({ ...seek, viewer: v }), []);
  for (const bad of [{}, { progression: "meeting" }, { ...seek, stage: 7 }]) assert.deepEqual(reader({ ...bad, viewer: ALICE }), []);
  assert.deepEqual(reader(), []);
  /* a records request that does not seek it, answered none exists, is not answered */
  const E = "ACTN-2026-0005-e";
  assert.equal(w.promote(E, md(E, rr())).ok, true);
  assert.equal(w.a.actionCorrespond({ target: E, direction: "sent", at: "2026-08-01", account: "asked", stage: "request",
    viewer: ALICE, author: ALICE }).ok, true);
  say(E, "2026-08-02", "none_exists");
  assert.equal(ask().length, 3);
  /* at most 50 */
  for (let i = 0; i < 52; i++) say(B, `2026-10-${String(1 + (i % 28)).padStart(2, "0")}`, "none_exists");
  const many = ask();
  assert.equal(many.length, 50);
  assert.deepEqual(many.slice(0, 3).map((x) => x.at), ["2026-09-02", "2026-09-03", "2026-09-20"]);
  /* writes nothing; a read that fails answers [] and never throws */
  const st = JSON.stringify(["bundles", "files", "manifest"].map((t) => w.rows(`SELECT * FROM ${t} ORDER BY rowid`)));
  ask(); ask(BOB);
  assert.equal(JSON.stringify(["bundles", "files", "manifest"].map((t) => w.rows(`SELECT * FROM ${t} ORDER BY rowid`))), st);
  w.st.db.exec(`ALTER TABLE files RENAME TO away`);
  assert.doesNotThrow(() => ask());
  assert.deepEqual(ask(), []);
  w.st.db.exec(`ALTER TABLE away RENAME TO files`);
});

test("R71 a host given no intent registers none and starts; a reader already held stands", () => {
  assert.doesNotThrow(() => world({ deps: { intent: null } }));
  const held = { registerNoneExistsReader: () => ({ ok: false, reason: "NONE_EXISTS_READER_DECLARED" }) };
  assert.doesNotThrow(() => world({ deps: { intent: held } }));
});

test("R70 (T47) the seeks judgment is action-records.seeksRefusal (its R10), asked by this write's fence after R72's machine arm; the fence is this module's", () => {
  const progressions = progressionsStandIn();
  const w = world({ deps: { progressions } });
  const ok = [{ progression: "meeting", entity: E1, stage: "minutes" }];
  const cases = [rr(seeksLines([{ progression: "zoning", entity: E1, stage: "notice" }, { progression: "meeting", entity: E1, stage: "vote" }])),
    ["action_kind: other", ...seeksLines(ok)], rr(["seeks: []"]), rr(seeksLines([ok[0], ok[0]]))];
  for (const lines of cases) {
    const text = md(C, lines);
    const judged = w.a.records.seeksRefusal(fmOf(text));
    const r = w.promote(C, text);
    assert.deepEqual([r.reason, r.check, r.findings, r.cause], [judged.reason, judged.check, judged.findings, judged.cause],
      JSON.stringify(lines).slice(0, 60));
    assert.equal(w.record.head(C), null, "nothing written");
  }
  /* unreadable progressions: the judgment's own cause, relayed */
  progressions.broken = true;
  const un = w.promote(C, md(C, rr(seeksLines(ok))));
  assert.deepEqual([un.reason, un.cause], ["SEEKS_REFUSED", "PROGRESSIONS_UNREADABLE"]);
  progressions.broken = false;
  /* R72's machine arm is asked first, before the judgment */
  progressions.asked.length = 0;
  assert.equal(w.promote(C, md(C, rr(seeksLines(cases[0].slice(1)))), { author: "class:daemon" }).reason, "MACHINE_CANNOT_STATE_SEEKS");
  assert.deepEqual(progressions.asked, [], "the judgment was not asked");
  /* the control: seeks the judgment passes lands */
  assert.equal(w.a.records.seeksRefusal(fmOf(md(C, rr(seeksLines(ok))))), null);
  assert.equal(w.promote(C, md(C, rr(seeksLines(ok)))).ok, true);
});

test("R25 the read lists the proposals of what a request seeks that action-records holds (its R3), beside seeks as a member stated it; its op is still served through actions' map", () => {
  const w = world({ deps: { progressions: progressionsStandIn() } });
  const stated = [{ progression: "budget", entity: E2, stage: "adopted" }];
  assert.equal(w.promote(A, md(A, rr(seeksLines(stated)))).ok, true);
  const one = [{ progression: "meeting", entity: E1, stage: "minutes" }];
  assert.equal(w.a.records.actionSeeksPropose({ target: A, seeks: one, proposer: "class:daemon", viewer: "class:daemon" }).ok, true);
  /* the op (action-records R15) reaches the same act through actions' map until the plane spreads action-records' own */
  const two = [{ progression: "meeting", entity: E1, stage: "notice" }];
  w.clock.ms += 60000;
  const b = actions.actionsOps(w.a, new URL(`https://x/?target=${A}&viewer=${BOB}&proposer=${BOB}`), { seeks: JSON.stringify(two) })
    .actionseekspropose();
  assert.deepEqual([b.ok, b.proposal.state, b.proposal.seeks], [true, "member_proposed", two]);
  const read = w.a.actionRead({ id: A, viewer: ALICE });
  assert.deepEqual(read.seeks, stated, "seeks as a member stated it");
  assert.deepEqual(read.seeks_proposals, w.a.records.seeksProposalsFor(A), "read through action-records, unchanged");
  assert.deepEqual(read.seeks_proposals.proposals.map((p) => [p.by, p.seeks]), [[BOB, two], ["class:daemon", one]], "newest first");
  /* the control: an action with none answers an empty list and a sentence */
  assert.equal(w.promote(B, md(B, rr())).ok, true);
  const none = w.a.actionRead({ id: B, viewer: ALICE });
  assert.deepEqual([none.seeks, none.seeks_proposals.proposals], [[], []]);
  assert.match(none.seeks_proposals.says, /no proposal of what this request seeks/);
});
