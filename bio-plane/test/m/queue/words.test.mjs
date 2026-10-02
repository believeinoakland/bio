/* R48 (DEC-107; H15, K1038) at the module's interface: no member-facing sentence this module answers calls a to-do an
   "obligation" or a signal a "condition". Swept whole: the feed over one item of EVERY catalogued kind (each with the
   disposition R12 and R46 give it, homed and unhomed, one partly set aside by a project), a task, the mute, disposed,
   resolved and unattributed blocks; every refusal and answer of queueMute, queueSnooze and proposeDispose; the mint's
   three refusals and R49's; every row's translation, every kind's sentence and the mute's refusal sentence. The
   producers are stubbed with neutral words, so every sentence swept is this module's (queue-producers' own words are
   its R24). And R12's newer-capture door (K1035): adopting takes a why, keeping's is optional, `requires` the notice. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";
import { QUEUE_MINT_CHECKS, QUEUE_ACT_CHECKS, QUEUE_CLASS_LABELS } from "../../../src/queue/index.mjs";
import { QUEUE_OBLIGATION_KINDS, QUEUE_FINDING_KINDS, QUEUE_CONDITION_KINDS, MUTE_REFUSAL_DETAIL } from "../../../src/queuestate.mjs";

const FACTS = { objective_gap: { bound: 50, truncated: false }, unattributed: { count: 1, inquiries: ["INQ-1"] },
                contradiction: { bound: 50, truncated: false }, dispositions: [] };
/* "condition" names a checkpoint's own condition and an objective's satisfaction condition in two kinds' sentences:
   neither calls a signal a condition (R48), so exactly those two phrases are set aside before the sweep. */
const NOT_A_SIGNAL = [/whether its condition was met/g, /satisfaction condition/g];
const BANNED = /\b(obligation|condition)s?\b/i;
const offending = (text) => BANNED.test(NOT_A_SIGNAL.reduce((t, re) => t.replace(re, ""), String(text)));

/** Every sentence in an answer: the strings under the keys a member reads. */
function sentences(v, out = [], key = null) {
  if (typeof v === "string") { if (["detail", "translation", "stated", "label", "summary"].includes(key)) out.push(v); }
  else if (Array.isArray(v)) for (const x of v) sentences(x, out, key);
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) sentences(x, out, k);
  return out;
}

const subjectFor = (kind, n) => {
  if (kind === "missing_predecessor" || kind === "overdue_successor" || kind === "cardinality_exceeded")
    return { kind: "progression_stage", id: `p${n}::s`, progression_key: `p${n}`, stage_key: "s", definition_version: 1 };
  if (kind === "newer-capture-affects-reference") return { kind: "notice", id: `NOTICE-${n}` };
  if (/^contradiction-(duty|lead|plurality)$/.test(kind))
    return { kind: "contradiction_candidate", id: `C${n}`, state: n % 2 ? "taken_up" : "open", inquiry: "INQ-1",
             between_projects: true, parties: [{ project: "PRJ-A", opted_in: n % 3 === 0 }] };
  if (/-unseen$/.test(kind)) return { kind: "contradiction_notice", id: `N${n}`, parties: [{ project: "PRJ-A", opted_in: n % 2 === 0 }] };
  return { kind: "bundle", id: "DOC-1" };
};
const CLASSES = [["OBLIGATION", QUEUE_OBLIGATION_KINDS], ["FINDING", QUEUE_FINDING_KINDS], ["CONDITION", QUEUE_CONDITION_KINDS]];
/* One item of every kind homed under both projects, and one of every kind homed nowhere. */
const EVERY = CLASSES.flatMap(([cls, vocab]) => Object.keys(vocab).flatMap((kind, i) =>
  [["DOC-1"], []].map((subjects, h) => ({ id: `${cls}::${kind}::${h}`, class: cls, kind, subject: subjectFor(kind, i + h), subjects }))));

function everyWorld() {
  const w = world({ producers: { feedItems: (a) => ({ facts: FACTS, items: EVERY.map(({ subjects, ...it }) => ({ ...it,
    summary: "an item", detail: "about it", basis: { source: "stub", detail: "stubbed" },
    age: { state: "determined", since: iso(NOW - 1000), ms: 1000 }, assignee: null, assignee_role: null,
    options: a.optionsOf(subjects), case: a.homesOf(subjects) })) }) } });
  w.member("alice");
  w.bundle("DOC-1"); w.bundle("INF-1"); w.bundle("INQ-1", "inquiry");
  for (const p of ["PRJ-A", "PRJ-B"]) { w.bundle(p, "project"); w.join(p, "alice"); w.cite(p, "DOC-1"); }
  w.task("TASK-2026-0001-a", "INF-1");
  return w;
}

test("R48: no member-facing sentence of the feed, over one item of every catalogued kind, calls a to-do an obligation or a signal a condition", () => {
  const w = everyWorld();
  // one project's set-aside of a project-scoped item, so a home's `disposed_by` sentence is in the answer too
  w.run(`INSERT INTO finding_dispositions VALUES ('PRJ-A', 'FINDING::source-modified::0', 'source-modified', 'deferred', 'later', 'alice', ?)`, iso(NOW));
  w.run(`INSERT INTO queue_state (member_id, case_id, muted_kinds) VALUES ('alice','PRJ-B','render-deferred')`);
  const f = w.feed("alice");
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  const items = byId(f);
  // the sweep reaches what it claims to: every kind, both homings, the task, the set-aside, every block's detail
  for (const it of EVERY) assert.ok(items[it.id] || f.mute.suppressed.some((s) => s.id === it.id), it.id);
  assert.ok(items["TASK-2026-0001-a"]);
  assert.ok(items["FINDING::source-modified::0"].case.disposed_by.length === 1);
  for (const b of [f.mute, f.disposed, f.resolved, f.resolved.bias_debts, f.unattributed_readings]) assert.equal(typeof b.detail, "string");
  const found = sentences(f);
  assert.ok(found.length > 2 * EVERY.length, `${found.length} sentences`);
  assert.deepEqual(found.filter(offending), []);
  assert.deepEqual(Object.values(f.class_labels).filter(offending), []);
});

test("R48: no refusal or answer of the acts, the mint or the sort says obligation or condition, nor any row, kind sentence or mute sentence", () => {
  const w = everyWorld();
  const asAlice = { member: "alice", viewer: "member:alice" };
  const pd = (a) => w.q.proposeDispose({ decidedBy: "alice", viewer: "member:alice", identity: "member:alice", to: "deferred", reason: "r", ...a });
  const answers = [
    // queueMute: every refusal in R19's order, the item form's three classes, and both forms' answers
    w.q.queueMute({ case: "INQ-1", kinds: ["render-deferred"], viewer: "member:alice" }),
    w.q.queueMute({ ...asAlice, item: "FINDING::x", kinds: ["render-deferred"] }),
    w.q.queueMute({ ...asAlice, kinds: ["render-deferred"] }),
    w.q.queueMute({ ...asAlice, case: "NOPE", kinds: ["render-deferred"] }),
    w.q.queueMute({ ...asAlice, case: "DOC-1", kinds: ["render-deferred"] }),
    w.q.queueMute({ ...asAlice, case: "INQ-1", kinds: [] }),
    w.q.queueMute({ ...asAlice, case: "INQ-1", kinds: ["a,b"] }),
    w.q.queueMute({ ...asAlice, case: "INQ-1", kinds: ["no-such-kind"] }),
    w.q.queueMute({ ...asAlice, item: "no-such-item" }),
    w.q.queueMute({ ...asAlice, case: "INQ-1", kinds: ["authority-undetermined"] }),
    w.q.queueMute({ ...asAlice, item: "TASK-2026-0001-a" }),
    w.q.queueMute({ ...asAlice, item: "OBLIGATION::bias-debt::r1" }),
    w.q.queueMute({ ...asAlice, case: "INQ-1", kinds: ["render-deferred"] }),
    w.q.queueMute({ ...asAlice, item: "CONDITION::render-deferred::0" }),
    // queueSnooze: its refusals and both answers
    w.q.queueSnooze({ case: "INQ-1", until: iso(NOW + 5000), viewer: "member:alice" }),
    w.q.queueSnooze({ ...asAlice, case: "INQ-1" }),
    w.q.queueSnooze({ ...asAlice, case: "INQ-1", until: "soon" }),
    w.q.queueSnooze({ ...asAlice, case: "INQ-1", until: iso(NOW - 5000) }),
    w.q.queueSnooze({ ...asAlice, case: "INQ-1", until: iso(NOW + 5000) }),
    w.q.queueSnooze({ ...asAlice, case: "INQ-1", clear: true }),
    // proposeDispose: the bridge for each class, the project arm's refusals and its answer
    pd({ key: "CONDITION::render-deferred::0" }), pd({ key: "OBLIGATION::bias-debt::r1" }), pd({ key: "authority-undetermined::T" }),
    pd({ key: "FINDING::source-modified::0" }), pd({ finding: "FINDING::source-modified::0" }), pd({ project: "PRJ-A" }),
    pd({ project: "PRJ-A", finding: "FINDING::source-modified::0", reason: " " }),
    pd({ project: "PRJ-A", finding: "FINDING::source-modified::0", reason: "x".repeat(161) }),
    pd({ project: "PRJ-A", finding: "FINDING::source-modified::0", decidedBy: "" }),
    pd({ project: "PRJ-NONE", finding: "FINDING::source-modified::0" }),
    pd({ project: "PRJ-A", finding: "FINDING::source-modified::0" }),
    // the sort's refusal
    w.q.queueFeed({ viewer: "class:admin", sort: "newest" }),
  ];
  const reasons = answers.map((a) => a.reason ?? (a.ok ? "ok" : "?"));
  for (const r of ["NO_MEMBER", "BAD_KIND", "NO_CASE", "NO_SUCH_CASE", "NOT_A_CASE", "NO_KINDS", "UNKNOWN_KIND", "KIND_NOT_PERSONAL",
                   "NO_UNTIL", "BAD_UNTIL", "UNTIL_IN_PAST", "CLASS_NOT_DISPOSED", "NO_PROJECT_SCOPE", "NO_FINDING", "NO_REASON",
                   "BAD_REASON", "NO_DECIDER", "NO_SUCH_PROJECT", "QUEUE_SORT_UNKNOWN", "ok"])
    assert.ok(reasons.includes(r), `the sweep reaches ${r}`);
  // the mint's three refusals, each minted by a producer at fault
  const mint = (it) => world({ producers: { feedItems: (a) => ({ facts: FACTS, items: [{ case: a.homesOf([]), subject: { kind: "bundle", id: null },
    basis: { source: "x", detail: "x" }, age: { state: "undetermined" }, assignee: null, assignee_role: null, options: [], ...it }] }) } })
    .feed(null, "class:admin");
  const minted = [mint({ id: "X::1", class: "NOTICED", kind: "objective-gap" }), mint({ id: "FINDING::x", class: "FINDING", kind: "no-such" }),
                  mint({ id: "FINDING::y", class: "FINDING", kind: "action-clock-overdue" }),
                  mint({ id: "CONDITION::z", class: "CONDITION", kind: "bias-debt" })];
  assert.deepEqual(minted.map((m) => m.reason), ["NO_CLASS", "NO_SUCH_KIND", "KIND_MISCLASSED", "KIND_MISCLASSED"]);
  const statics = [...Object.values(QUEUE_MINT_CHECKS), ...Object.values(QUEUE_ACT_CHECKS)].map((r) => r.translation);
  const vocab = CLASSES.flatMap(([, v]) => Object.values(v));
  const all = [...sentences([...answers, ...minted]), ...statics, ...vocab, ...Object.values(MUTE_REFUSAL_DETAIL), ...Object.values(QUEUE_CLASS_LABELS)];
  assert.ok(all.length > 80, `${all.length} sentences`);
  assert.deepEqual(all.filter(offending), []);
  // negative control: the sweep sees the words it bans, and its two set-asides are exactly the two phrases
  assert.equal(offending("an obligation is owed"), true);
  assert.equal(offending("a CONDITION about the machinery"), true);
  assert.equal(offending("whether its condition was met"), false);
  assert.deepEqual(vocab.filter((s) => BANNED.test(s)).length, 2, "only the checkpoint's and the objective's own condition");
});

test("R12 (K1035): the newer-capture door says adopting takes a why and keeping's is optional; it requires the notice and names both acts", () => {
  const w = everyWorld();
  const id = "FINDING::newer-capture-affects-reference::0", notice = EVERY.find((it) => it.id === id).subject.id;
  const d = byId(w.feed(null, "class:admin"))[id].disposition;
  assert.deepEqual([d.available, d.scope, d.key, d.notice, d.acts, d.requires],
    [true, "notice", notice, notice, ["versionadopt", "versionkeep"], ["notice"]]);
  assert.match(d.detail, /adopt the newer version \(op=versionadopt, [^)]*takes a why of up to 2,000 characters\)/);
  assert.match(d.detail, /keep the earlier one \(op=versionkeep, where a why is optional\)/);
  // negative control: the sentence no longer says only the keep takes a why
  assert.doesNotMatch(d.detail, /with an optional why\)/);
});
