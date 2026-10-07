/* duties, T35 (T35-34): the occurrence key's import-free file (R24), a policy's own review date (R28) and an
   organisation's own policy (R29), over the real modules. */
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { world, E, BOB, CAROL, MACHINE, ZONE, SHA } from "./fixture.mjs";
import * as index from "../../../src/duties/index.mjs";
import * as vocab from "../../../src/duties/vocab.mjs";

const { DUTIES_CHECKS, NEVER_SAID, NOTICED } = index;
const VOCAB = fileURLToPath(new URL("../../../src/duties/vocab.mjs", import.meta.url));
const AS_OF = "2026-03-02T12:00:00Z";
const day = (value) => ({ value, precision: "day", zone: ZONE });
const row = (r, code) => {
  assert.equal(r.ok, false, `${code}: ${JSON.stringify(r).slice(0, 300)}`);
  assert.equal(r.reason, code);
  if (DUTIES_CHECKS[code]) assert.deepEqual([r.check, r.translation], [DUTIES_CHECKS[code].check, DUTIES_CHECKS[code].translation]);
};
const STAYS = /stays held as a standard and may be compared with what the organisation does \(calculations\); it is not tracked here as an obligation/;
const written = (w) => ["duties", "duty_proposals", "duty_versions"].map((t) => w.sqlRows(`SELECT COUNT(*) AS n FROM ${t}`)[0].n).join();

test("R24 OCCURRENCE_KEY_RE is stated in vocab.mjs, which loads no other module, and index.mjs re-exports the same object", () => {
  assert.equal(index.OCCURRENCE_KEY_RE, vocab.OCCURRENCE_KEY_RE, "one object (===)");
  assert.ok(Object.isFrozen(vocab.OCCURRENCE_KEY_RE));
  assert.equal(vocab.OCCURRENCE_KEY_RE.source, "^OCC-[0-9a-f]{32}$");
  /* a fresh process importing vocab.mjs loads that one file and nothing else: no index, no store, no table */
  const probe = `
    import { registerHooks } from "node:module";
    const loaded = [];
    registerHooks({ resolve(spec, ctx, next) { const r = next(spec, ctx); loaded.push(r.url); return r; } });
    const m = await import(${JSON.stringify(new URL(`file://${VOCAB}`).href)});
    console.log(JSON.stringify({ loaded, key: m.OCCURRENCE_KEY_RE.source }));`;
  const r = spawnSync(process.execPath, ["--input-type=module", "-e", probe], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  const out = JSON.parse(r.stdout.trim().split("\n").at(-1));
  assert.deepEqual(out.loaded.map((u) => u.replace(/^.*\/src\//, "src/")), ["src/duties/vocab.mjs"]);
  assert.equal(out.key, "^OCC-[0-9a-f]{32}$");
});

/* A policy of the council's with a review date and a cycle, each its own passage. */
function policyWorld(words = ["The Town Clerk owns this policy.", "Next review: February 15, 2026.", "This policy is reviewed annually."], issuer = null) {
  const w = world();
  const p = w.policy({ issuer: issuer ?? E.council, words });
  return { w, p, review: (over = {}) => w.duties.proposeReview({ standard: p.id, reviewDue: p.cites[1], owner: E.clerk, by: MACHINE, ...over }) };
}

test("R28 proposeReview refuses, writing nothing: no stamp, an unheld standard, a passage not of its text, words that are not one whole date, an unread cycle, an unregistered owner", () => {
  const { w, p, review } = policyWorld();
  const other = w.policy({ words: ["Next review: March 1, 2026."] });
  const before = written(w);
  row(review({ by: "" }), "DUTY_MEMBER_ACT_ONLY");
  assert.equal(review({ standard: "STD-2026-0099-none" }).reason, "NO_SUCH_STANDARD");
  row(review({ reviewDue: other.cites[0] }), "REVIEW_EXTENT_NOT_HELD");
  /* content's extent refusals, in order */
  assert.equal(review({ reviewDue: undefined }).reason, "NO_SHA");
  assert.equal(review({ reviewDue: { captureSha: "", extent: p.cites[1].extent } }).reason, "NO_SHA");
  assert.equal(review({ reviewDue: { captureSha: SHA("never captured"), extent: p.cites[1].extent } }).reason, "CAPTURE_NOT_HELD");
  assert.equal(review({ reviewDue: { captureSha: p.cites[1].captureSha } }).reason, "NO_EXTENT");
  const outside = review({ reviewDue: { captureSha: p.cites[1].captureSha, extent: { kind: "pdf-page", page: 9 } } });
  assert.deepEqual([outside.reason, outside.extent_refusal.code], ["EXTENT_NOT_IN_CAPTURE", "CONTENT_EXTENT_OUT_OF_RANGE"]);
  /* an extent of the policy's capture whose words are not held as read text */
  const unread = review({ reviewDue: { captureSha: p.cites[1].captureSha, extent: { kind: "pdf-page", page: 1 } } });
  row(unread, "REVIEW_DATE_UNREAD");
  assert.equal(unread.words, null);
  row(review({ cycle: other.cites[0] }), "REVIEW_EXTENT_NOT_HELD");
  /* a placeholder, a month alone and two dates are kept as written and never completed */
  for (const words of ["Next review: [DATE]", "Next review: June 2026", "Review by 2026-06-30, or by 2026-12-31", "Review date: 2026-02-30"]) {
    const x = policyWorld(["Owner: the clerk.", words]);
    const r = x.review();
    row(r, "REVIEW_DATE_UNREAD");
    assert.equal(r.words, words, "the words as written");
    assert.ok(r.detail.includes(words));
  }
  /* a cycle the words do not state in whole years, months or weeks */
  for (const words of ["Reviewed every 10 days.", "Reviewed from time to time.", "Reviewed annually and every 3 years."]) {
    const x = policyWorld(["Owner.", "Next review: February 15, 2026.", words]);
    row(x.review({ cycle: x.p.cites[2] }), "BAD_RECURRENCE");
  }
  assert.equal(review({ owner: "ENT-2026-0099" }).reason, "NO_SUCH_ENTITY");
  row(review({ owner: null }), "NO_OBLIGOR");
  assert.equal(written(w), before, "nothing written");
});

test("R28 a review is a proposal of one duty of the owner: performance, the policy as its source, a commitment basis, its date the passage's; tracked only once adopted", () => {
  const { w, p, review } = policyWorld();
  const r = review();
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual([r.tracked, r.label.machine_work], [false, true]);
  assert.equal(w.duties.recordTransitions({ asOf: AS_OF }).duties_read, 0, "a proposal is never tracked");
  const a = w.duties.adopt({ proposalId: r.proposal_id, clause: "the policy's header: next review February 15, 2026", by: BOB });
  assert.equal(a.ok, true);
  const d = w.duties.readDuty({ dutyId: a.duty_id, viewer: BOB }).duty;
  assert.deepEqual([d.modality, d.obligor, d.performance, d.source, d.trigger, d.time],
    ["duty", E.clerk, { act: "review the policy" }, { kind: "standard", standard: p.id }, { kind: "date", date: "2026-02-15" },
     { basis: "commitment", citation: p.passages[1] }]);
  assert.deepEqual(d.review, { standard: p.id, review_due: { capture_sha: p.cites[1].captureSha, extent: p.cites[1].extent, content_id: p.passages[1] }, cycle: null });
  /* a found match (retrieval R73's shape) passes as it is */
  const found = { kind: "match", words: "Next review: February 15, 2026.", capture_sha: p.cites[1].captureSha, extent: p.cites[1].extent };
  const fm = review({ reviewDue: found });
  assert.equal(fm.ok, true, JSON.stringify(fm));
  /* a member's own call is a proposal too, labelled the member's */
  const m = review({ by: CAROL });
  assert.deepEqual([m.ok, m.tracked, m.label.state], [true, false, "member_proposed"]);
  /* a review is a commitment over its own policy: a declared one naming another standard or a rule basis is refused */
  assert.equal(w.declare({ review: { standard: "STD-x" }, source: { kind: "standard", standard: p.id }, time: { basis: "commitment" } }).reason, "BAD_TIME");
  assert.equal(w.declare({ review: { standard: p.id }, source: { kind: "standard", standard: p.id } }).reason, "BAD_TIME");
});

test("R28 once adopted, a review date passed with no review matched is answered 'Noticed' with its why, never overdue against the law; pending before; met when a member matches the review", () => {
  const { w, review } = policyWorld();
  const id = w.duties.adopt({ proposalId: review().proposal_id, clause: "the header", by: BOB }).duty_id;
  const occ = (asOf) => w.duties.occurrencesOf({ dutyId: id, asOf, from: "2026-01-01", to: "2026-03-31", viewer: BOB }).occurrences;
  const early = occ("2026-02-10T12:00:00Z")[0];
  assert.deepEqual([early.state, early.label], ["pending", undefined]);
  const late = occ(AS_OF)[0];
  assert.equal(late.label, NOTICED);
  assert.equal(late.label, "Noticed");
  assert.equal(late.why, "the body's own review date, a commitment it stated, has passed and no review is recorded");
  assert.deepEqual(late.due.date, day("2026-02-15"));
  assert.deepEqual([late.due.basis_kind, late.due.law_set, late.derivation.law_set], ["commitment", false, false]);
  assert.match(late.question, /not a deadline the law sets/);
  const text = JSON.stringify(late).toLowerCase();
  for (const word of NEVER_SAID) assert.ok(!text.includes(word), word);
  assert.ok(!/deadline the law sets has passed|is overdue/.test(text));
  /* the scheduler's consumer records it; the record keeps it beside a later match (R14) */
  assert.equal(w.duties.recordTransitions({ asOf: AS_OF }).recorded, 1);
  const issued = w.event({ kind: "issuance", value: day("2026-02-20"), concerns: [E.clerk] });
  w.at("2026-03-03T12:00:00.000Z");
  assert.equal(w.duties.matchEvent({ dutyId: id, occurrenceKey: late.key, eventId: issued, reason: "the revised policy was issued", by: BOB }).ok, true);
  const met = occ("2026-03-04T12:00:00Z")[0];
  assert.deepEqual([met.state, met.label], ["met_late", undefined]);
  /* an obligation that is not a review is never labelled so */
  const plain = w.declare({ time: { basis: "commitment", date: "2026-02-15" } });
  const o = w.duties.occurrencesOf({ dutyId: plain.duty_id, asOf: AS_OF, viewer: BOB }).occurrences[0];
  assert.deepEqual([o.state, o.label], ["overdue", undefined]);
});

test("R28 a cited revision cycle recurs from the review date, each passed review 'Noticed'", () => {
  const { w, p, review } = policyWorld(["Owner: the clerk.", "Next review: January 31, 2025.", "This policy is reviewed annually."]);
  const r = review({ cycle: p.cites[2] });
  assert.equal(r.ok, true, JSON.stringify(r));
  const id = w.duties.adopt({ proposalId: r.proposal_id, clause: "header", by: BOB }).duty_id;
  assert.deepEqual(w.duties.readDuty({ dutyId: id, viewer: BOB }).duty.trigger,
    { kind: "recurrence", rrule: "FREQ=YEARLY;INTERVAL=1", dtstart: "2025-01-31" });
  const o = w.duties.occurrencesOf({ dutyId: id, asOf: AS_OF, from: "2025-01-01", to: "2026-03-01", viewer: BOB }).occurrences;
  assert.deepEqual(o.map((x) => [x.trigger.ref, x.state, x.label]), [["2025-01-31", "overdue", "Noticed"], ["2026-01-31", "overdue", "Noticed"]]);
  /* every N years, months or weeks */
  for (const [words, rrule] of [["Reviewed every 2 years.", "FREQ=YEARLY;INTERVAL=2"], ["Reviewed every six months.", "FREQ=MONTHLY;INTERVAL=6"],
                                ["Reviewed every 14 days.", "FREQ=WEEKLY;INTERVAL=2"], ["A three-year review cycle applies.", "FREQ=YEARLY;INTERVAL=3"]]) {
    const x = policyWorld(["Owner.", "Next review: January 31, 2025.", words]);
    const y = x.review({ cycle: x.p.cites[2] });
    assert.equal(y.ok, true, words);
    const id2 = x.w.duties.adopt({ proposalId: y.proposal_id, clause: "c", by: BOB }).duty_id;
    assert.equal(x.w.duties.readDuty({ dutyId: id2, viewer: BOB }).duty.trigger.rrule, rrule, words);
  }
});

test("R28, R29 a review of an organisation's own policy is refused under R29 as any duty is", () => {
  const { w, review } = policyWorld(undefined, null);
  const co = w.policy({ issuer: E.private, words: ["Owner: Private Co.", "Next review: February 15, 2026."] });
  const before = written(w);
  const r = w.duties.proposeReview({ standard: co.id, reviewDue: co.cites[1], owner: E.private, by: MACHINE });
  row(r, "NOT_ACTING_FOR_PUBLIC");
  assert.match(r.detail, STAYS);
  assert.equal(written(w), before);
  assert.equal(review().ok, true, "the council's own policy is reviewed");
});

test("R29 an organisation's own policy becomes a duty only where its obligor acts for a public body and an enforcer is named; every other duty on it is refused, saying it stays a standard", () => {
  const w = world();
  const own = w.policy({ issuer: E.private, cite: "Private Co. Customer Policy" });
  const src = { kind: "standard", standard: own.id };
  const d = (over) => w.declare({ source: src, time: { basis: "commitment", date: "2026-04-01" }, ...over });
  const before = written(w);
  /* the company itself, with no line to a public body */
  const r1 = d({ obligor: E.private, enforcer: E.auditor });
  row(r1, "NOT_ACTING_FOR_PUBLIC");
  assert.match(r1.detail, STAYS);
  /* a government body or office, and a person: the company's policy binds none of them here */
  for (const obligor of [E.council, E.clerk]) {
    const r = d({ obligor });
    row(r, "NOT_ACTING_FOR_PUBLIC");
    assert.match(r.detail, STAYS);
  }
  row(d({ obligor: E.filer, source: { ...src, binds: "every customer" } }), "NOT_ACTING_FOR_PUBLIC");
  /* the proposal path is refused alike */
  row(w.duties.propose({ ...w.fields({ obligor: E.private, enforcer: E.auditor, source: src }), by: MACHINE }), "NOT_ACTING_FOR_PUBLIC");
  assert.equal(written(w), before, "nothing written");
  /* a franchisee acting for the council under a held line: its own policy is a duty once an enforcer is named */
  w.line({ kind: "contracts_with", from: E.council, to: E.contractor });
  const fr = w.policy({ issuer: E.contractor, cite: "Harbour Waste Co. Collection Policy" });
  const f = (over) => w.declare({ obligor: E.contractor, source: { kind: "standard", standard: fr.id }, time: { basis: "commitment", date: "2026-04-01" }, ...over });
  const ne = f({});
  row(ne, "NO_ENFORCER");
  assert.match(ne.detail, STAYS);
  const ok = f({ enforcer: E.auditor });
  assert.equal(ok.ok, true, JSON.stringify(ok));
  /* an organisation acting for a body the source names (a standard the council issued), with an enforcer (R1) */
  const franchise = w.policy({ issuer: E.council, cite: "Franchise Agreement" });
  const g = (over) => w.declare({ obligor: E.private, source: { kind: "standard", standard: franchise.id }, time: { basis: "commitment", date: "2026-04-01" }, ...over });
  row(g({}), "NO_ENFORCER");
  assert.equal(g({ enforcer: E.auditor }).ok, true);
  /* a government obligor rests on a company's policy only where standards answers that an adoption binds it */
  let sw = null;
  sw = world({ deps: { standards: () => new Proxy(sw.standards, { get: (o, k) => (k === "bindsAt"
    ? ({ standard, body }) => ({ ok: true, standard, body, binds: body === E.council }) : typeof o[k] === "function" ? o[k].bind(o) : o[k]) }) } });
  const adopted = sw.policy({ issuer: E.private, cite: "Industry Code" });
  const asked = (obligor) => sw.declare({ obligor, source: { kind: "standard", standard: adopted.id }, time: { basis: "commitment", date: "2026-04-01" } });
  assert.equal(asked(E.council).ok, true, "the council adopted it");
  row(asked(E.clerk), "NOT_ACTING_FOR_PUBLIC");
  /* a policy whose issuer is no registered entity is read as before (R1 alone) */
  assert.equal(w.declare({ obligor: E.clerk, source: { kind: "standard", standard: w.policy({ issuer: "Some Board" }).id }, time: { basis: "window" } }).ok, true);
});
