/* action-records' members' side records at its interface (R4–R6, R14; was `actions` R80, R87, R88, R99's share): copied
   from `actions`' `t45.test.mjs` (R80, R87, R88 arms) and `t46.test.mjs` (R99), over a fixture without actions. What
   `actions` answers from them (its read, R66) stays `actions`' test. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { world, V, M, MACHINE, A, B, HIDDEN, INFO, ledger } from "./fixture.mjs";
import * as records from "../../../src/action-records/index.mjs";
import * as grammar from "../../../src/action-grammar/index.mjs";

const reasons = (list) => list.map((r) => r.reason);

test("R4 actionReceipt: refusals in order; a receipt or a service recorded on a sent entry, appended; receiptsOf answers them oldest first (K2845); the entry is never rewritten", () => {
  const w = world();
  const s = w.doc(INFO);
  w.action(A, ledger("sent", "received"));
  w.hidden(HIDDEN, ledger("sent"));
  const R = (x) => w.r.actionReceipt({ target: A, ord: 0, at: "2026-09-03", how: "stamped by the clerk", account: "I saw the stamp",
    viewer: M, author: M, ...x });
  assert.deepEqual(reasons([R({ author: MACHINE }), R({ target: "" }), R({ at: "2026-02-30" }), R({ artifactSha: s }),
    R({ account: "" }), R({ target: "ACTN-2026-0404-x" }), R({ target: HIDDEN }), R({ target: INFO }), R({ ord: 1 }),
    R({ account: "", artifactSha: "d".repeat(64) })]),
    ["MACHINE_CANNOT_CORRESPOND", "NO_TARGET", "BAD_DATE", "CAPTURE_AND_TESTIMONY", "NEITHER_CAPTURE_NOR_TESTIMONY",
     "NO_SUCH_BUNDLE", "NO_SUCH_BUNDLE", "NOT_AN_ACTION", "RECEIPT_NOT_ON_SENT", "UNREGISTERED_ARTIFACT"]);
  for (const r of [R({ author: MACHINE }), R({ at: "x" }), R({ artifactSha: s }), R({ account: "" }), R({ ord: 1 }),
                   R({ account: "", artifactSha: "d".repeat(64) })])
    assert.ok(r.check && r.translation && r.code === r.reason, `${r.reason} carries its row`);
  /* the dates R4 admits: a real date, or a real date with a local time 00:00–23:59 */
  for (const at of ["2026-09-03T24:00", "2026-13-01", "2026-09-03T10:15:00", "03/09/2026"]) assert.equal(R({ at }).reason, "BAD_DATE", at);
  /* a kind neither receipt nor service; a service names its party (1 to 200); how is 1 to 200; ord not a sent entry */
  assert.deepEqual(reasons([R({ kind: "delivered" }), R({ kind: "service" }), R({ kind: "service", party: "p".repeat(201) }),
    R({ how: "" }), R({ how: "h".repeat(201) }), R({ ord: 9 }), R({ ord: "x" })]),
    ["RECEIPT_NOT_ON_SENT", "BAD_PARTY", "BAD_PARTY", "BAD_HOW", "BAD_HOW", "RECEIPT_NOT_ON_SENT", "RECEIPT_NOT_ON_SENT"]);
  const rn = R({ ord: 1 });
  assert.deepEqual([rn.check, rn.legal], [grammar.ACTION_CATALOGUE_CHECKS.RECEIPT_NOT_ON_SENT.check, [...records.RECEIPT_KINDS]]);
  assert.deepEqual([...records.RECEIPT_KINDS], ["receipt", "service"]);
  assert.equal(records.RECEIPT_TEXT_MAX, 200);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM action_receipts`).n, 0, "no refusal writes");
  const text = w.text(A);
  const one = R({ at: "2026-09-03T10:15", how: "h".repeat(200) });
  assert.deepEqual([one.ok, one.kind, one.at, one.held_as, one.seq, one.ord, one.account, one.author, one.weight],
    [true, "receipt", "2026-09-03T10:15", "testimony", 1, 0, "I saw the stamp", M, "single"]);
  w.clock.ms += 60000;
  const two = R({ kind: "service", party: "the Town Clerk", account: "", artifactSha: `sha256:${s.toUpperCase()}` });
  assert.deepEqual([two.ok, two.seq, two.held_as, two.artifact_sha, two.party], [true, 2, "capture", s, "the Town Clerk"]);
  assert.deepEqual(w.r.receiptsOf(A).map((x) => [x.ord, x.seq, x.kind, x.held_as, x.by]),
    [[0, 1, "receipt", "testimony", M], [0, 2, "service", "capture", M]], "oldest first, the latest last");
  assert.equal(w.r.receiptsOf(A)[1].party, "the Town Clerk");
  assert.equal("party" in w.r.receiptsOf(A)[0], false);
  assert.equal(w.text(A), text, "the entry is never rewritten");
  assert.deepEqual(w.r.receiptsOf(B), [], "an action with none answers none");
  /* control: the hidden action's receipt is recorded by a viewer who sees it */
  assert.equal(R({ target: HIDDEN, viewer: MACHINE }).ok, true);
  const op = records.actionRecordsOps(w.r, new URL(`https://x/?target=${A}&ord=0&at=2026-09-05&how=post&account=x&viewer=${M}&author=${M}`), null).actionreceipt();
  assert.deepEqual([op.ok, op.seq], [true, 3]);
});

test("R5 actionScope: refusals in order; each statement appended; confidential(id) is the latest statement (false with none, K2850); scopeOf answers every statement; the answer carries actions.scope.published_stays", () => {
  const w = world();
  w.action(B);
  w.doc(INFO);
  w.hidden();
  const S = (x) => w.r.actionScope({ target: B, confidential: true, reason: "a source's safety", viewer: M, author: M, ...x });
  assert.deepEqual(reasons([S({ author: MACHINE }), S({ target: "" }), S({ confidential: "maybe" }), S({ reason: "" }),
    S({ reason: 'a"b' }), S({ reason: "x".repeat(501) }), S({ target: "ACTN-2026-0404-x" }), S({ target: HIDDEN }), S({ target: INFO }),
    S({ confidential: false })]),
    ["MACHINE_CANNOT_SET_SCOPE", "NO_TARGET", "BAD_SCOPE", "SCOPE_NO_REASON", "BAD_REASON", "BAD_REASON", "NO_SUCH_BUNDLE",
     "NO_SUCH_BUNDLE", "NOT_AN_ACTION", "SCOPE_UNCHANGED"]);
  for (const r of [S({ author: MACHINE }), S({ reason: "" }), S({ confidential: false })]) assert.ok(r.check && r.translation, r.reason);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM action_scopes`).n, 0, "no refusal writes");
  assert.equal(w.r.confidential(B), false, "none stated reads not confidential");
  assert.deepEqual(w.r.scopeOf(B), { confidential: false, statements: [] });
  const set = S({});
  assert.deepEqual([set.ok, set.confidential, set.by, set.reason, set.weight], [true, true, M, "a source's safety", "single"]);
  assert.deepEqual(set.published, { key: "actions.scope.published_stays", says: records.ACTION_RECORDS_WORDS["actions.scope.published_stays"] });
  assert.equal(S({}).reason, "SCOPE_UNCHANGED");
  assert.equal(w.r.confidential(B), true);
  w.clock.ms += 1000;
  const off = S({ confidential: "false", reason: "the source has gone public" });
  assert.deepEqual([off.ok, off.confidential, off.published.key], [true, false, "actions.scope.published_stays"]);
  assert.equal(w.r.confidential(B), false, "the latest statement governs");
  assert.deepEqual(w.r.scopeOf(B).statements.map((x) => [x.seq, x.confidential, x.reason, x.by]),
    [[1, true, "a source's safety", M], [2, false, "the source has gone public", M]]);
  assert.deepEqual(off.scope, w.r.scopeOf(B));
  /* the op reads confidential from the query as text */
  const op = records.actionRecordsOps(w.r, new URL(`https://x/?target=${B}&confidential=true&reason=again&viewer=${M}&author=${M}`), null).actionscope();
  assert.deepEqual([op.ok, op.confidential], [true, true]);
});

test("R6 actionPromise: refusals in order; a promise recorded and ended by a later one, appended; promisesOf answers every promise, standing apart from ended", () => {
  const w = world();
  w.action(A);
  w.doc(INFO);
  w.hidden();
  const P = (x) => w.r.actionPromise({ target: A, kind: "anonymity", text: "we will not name the source", viewer: M, author: M, ...x });
  assert.deepEqual(reasons([P({ author: MACHINE }), P({ target: "" }), P({ kind: "secrecy" }), P({ text: "" }),
    P({ text: "x".repeat(501) }), P({ ends: "one" }), P({ target: "ACTN-2026-0404-x" }), P({ target: HIDDEN }), P({ target: INFO }), P({ ends: 9 })]),
    ["MACHINE_CANNOT_RECORD_PROMISE", "NO_TARGET", "PROMISE_REFUSED", "PROMISE_REFUSED", "PROMISE_REFUSED", "PROMISE_REFUSED",
     "NO_SUCH_BUNDLE", "NO_SUCH_BUNDLE", "NOT_AN_ACTION", "PROMISE_REFUSED"]);
  const pr = P({ kind: "secrecy" });
  assert.deepEqual([pr.legal, pr.max, !!pr.check], [[...grammar.PROMISE_KINDS], records.PROMISE_TEXT_MAX, true]);
  assert.equal(records.PROMISE_TEXT_MAX, 500);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM action_promises`).n, 0, "no refusal writes");
  for (const kind of grammar.PROMISE_KINDS) assert.equal(P({ kind, text: "t".repeat(500) }).ok, true, kind);
  const w2 = world(); w2.action(A);
  const P2 = (x) => w2.r.actionPromise({ target: A, kind: "anonymity", text: "we will not name the source", viewer: M, author: M, ...x });
  const one = P2({});
  assert.deepEqual([one.ok, one.seq, one.kind, one.by, one.weight], [true, 1, "anonymity", M, "single"]);
  P2({ kind: "embargo", text: "nothing before the 9th" });
  const end = P2({ kind: "anonymity", text: "the source asked to be named", ends: "1" });
  assert.deepEqual([end.ok, end.ends], [true, 1]);
  const r = w2.r.promisesOf(A);
  assert.deepEqual(r.standing.map((p) => p.seq), [2]);
  assert.deepEqual(r.ended.map((p) => [p.seq, p.ended_by.seq, p.ended_by.text]), [[1, 3, "the source asked to be named"]]);
  assert.deepEqual(end.promises, r);
  assert.equal(P2({ ends: 1 }).reason, "PROMISE_REFUSED", "an ended promise is not standing");
  assert.equal(P2({ ends: 3 }).reason, "PROMISE_REFUSED", "an ending statement is not a standing promise");
  assert.deepEqual(w2.r.promisesOf("ACTN-2026-0009-none"), { standing: [], ended: [] });
  const op = records.actionRecordsOps(w2.r, new URL(`https://x/?target=${A}&kind=other&text=t&viewer=${V("bob")}&author=${V("bob")}`), null).actionpromise();
  assert.deepEqual([op.ok, op.by], [true, V("bob")]);
});

test("R14 the scope sentence is actions.scope.published_stays, answered with that key and words.json's words read by key; this module's refusal rows are action-grammar's, each moved row's region and function held in src/action-records/index.mjs", async () => {
  const words = JSON.parse(await readFile(new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url), "utf8"));
  const held = words.words.find((x) => x && x.key === "actions.scope.published_stays");
  assert.ok(held && typeof held.en === "string", "words.json holds the key");
  const en = held.en;
  assert.ok(Object.isFrozen(records.ACTION_RECORDS_WORDS));
  assert.deepEqual(Object.keys(records.ACTION_RECORDS_WORDS), ["actions.scope.published_stays"], "one key, no other sentence");
  assert.equal(records.ACTION_RECORDS_WORDS["actions.scope.published_stays"], en, "words.json's en verbatim");
  assert.deepEqual(records.SCOPE_PUBLISHED_STAYS, { key: "actions.scope.published_stays", says: en });
  const w = world(); w.action(A);
  assert.deepEqual(w.r.actionScope({ target: A, confidential: true, reason: "r", viewer: M, author: M }).published,
    { key: "actions.scope.published_stays", says: en });
  /* the rows R14 names: action-grammar's, each with its code and number (its R9, R28) */
  const src = await readFile(new URL("../../../src/action-records/index.mjs", import.meta.url), "utf8");
  const families = { ...grammar.GOVERNING_LAW_CHECKS, ...grammar.RISK_TIER_REVISION_CHECKS, ...grammar.ACTION_CATALOGUE_CHECKS };
  const MOVED = { NO_LAWS: "C-73.2", BAD_LAW_LEVEL: "C-73.3", BAD_CITATION: "C-73.4", TOO_MANY_LAWS: "C-73.5",
    BAD_RISK_TIER: "C-90.2", RISK_PROPOSAL_BASIS_REFUSED: "C-90.6", RECEIPT_NOT_ON_SENT: "C-117.39",
    MACHINE_CANNOT_SET_SCOPE: "C-117.48", SCOPE_NO_REASON: "C-117.49", SCOPE_UNCHANGED: "C-117.50",
    MACHINE_CANNOT_RECORD_PROMISE: "C-117.51", PROMISE_REFUSED: "C-117.52" };
  for (const [code, check] of Object.entries(MOVED)) {
    const row = families[code];
    assert.ok(row, `${code} is a row of action-grammar's`);
    assert.equal(row.check, check, code);
    /* the `where` names a function and a region; both are held here, whichever file the string names until T47-36 */
    const [fn, region] = row.where.slice(row.where.indexOf(" ") + 1).split(" > ");
    assert.ok(src.includes(`DEC-49 REGION ${region}`) && src.includes(`END DEC-49 REGION ${region}`), `${code}: region ${region} held`);
    assert.ok(new RegExp(`^\\s+${fn.replace(/^#/, "")}\\(`, "m").test(src), `${code}: function ${fn.replace(/^#/, "")} held`);
  }
  /* every refusal this module mints with a row carries that row's check and translation (withRow) */
  const r = w.r;
  const minted = [r.lawEntries([]), r.lawEntries([{ level: "x", citation: "a" }]), r.lawEntries([{ level: "state", citation: "" }]),
    r.lawEntries(Array(13).fill({ level: "state", citation: "a" })), r.badRiskTier(A, 9, "the act"),
    r.actionRiskPropose({ target: A, tier: 1, basis: "", proposer: M, viewer: M }),
    r.actionReceipt({ target: A, ord: 0, at: "2026-09-03", how: "h", account: "a", viewer: M, author: M }),
    r.actionScope({ target: A, confidential: true, reason: "r", viewer: MACHINE, author: MACHINE }),
    r.actionScope({ target: A, confidential: true, reason: "", viewer: M, author: M }),
    r.actionScope({ target: A, confidential: true, reason: "r", viewer: M, author: M }),
    r.actionPromise({ target: A, kind: "other", text: "t", viewer: MACHINE, author: MACHINE }),
    r.actionPromise({ target: A, kind: "x", text: "t", viewer: M, author: M })];
  assert.deepEqual(minted.map((x) => x.reason), Object.keys(MOVED));
  for (const x of minted) assert.deepEqual([x.code, x.check, x.translation], [x.reason, families[x.reason].check, families[x.reason].translation], x.reason);
});
