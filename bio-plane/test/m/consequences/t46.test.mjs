/* consequences R24, R25 (T46). R24 (N911): every success record is a `success_record` record object (`SUC-`, record-grammar
   R59), promoted through `promotion` with history and export as a part is (R14), and one held in this module's rows
   before T46 is promoted with its id, fields, author and time unchanged, read as before. R25 (DEC-194, N913): seventeen
   refusal rows read their translations from `words.json`'s `refusal.<CODE>` by key, and R19's two sentences are answered
   with their keys and words.json's words; C-114.29, .34 and .37 keep their own; codes, numbers, `where`s and behaviour
   unmoved. At the interface: the rows as exported, each refusal as the acts answer it beside its control, the reads, and
   the record objects as record-core holds them. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { world, V, MACHINE } from "./fixture.mjs";
import { groupUndetermined } from "../promotion/fixtures.mjs";
import { CONSEQUENCES_CHECKS, CONSEQUENCES_WORDS, SEQUENCE_NOT_CAUSE, CAUSE_NOT_STATED, consequencesModule }
  from "../../../src/consequences/index.mjs";
import { canonicalJson, sha256HexSync, checkBundle } from "../../../src/record-grammar/index.mjs";

const WORDS = JSON.parse(await readFile(new URL("../../../../docs/development/ux-substrate/screens/words.json",
  import.meta.url), "utf8")).words;
const en = (key) => {
  const w = WORDS.find((x) => x.key === key);
  assert.ok(w, `words.json holds ${key}`);
  return w.en;
};

/* The seventeen rows R25 reads by key, with the numbers and `where`s it does not move. */
const AT = (fn) => `src/consequences/index.mjs ${fn}`;
const TAKEN = {
  ADDRESSED_WORD_REFUSED: ["C-114.23", AT("addressedRecord")], ADDRESSED_NO_PERCENTAGE: ["C-114.24", AT("addressedRecord")],
  ADDRESSED_NO_REASON: ["C-114.25", AT("addressedRecord")], ADDRESSED_BAD_REASON: ["C-114.26", AT("addressedRecord")],
  MACHINE_CANNOT_RECORD_SUCCESS: ["C-114.27", AT("#successRefusal")], SUCCESS_NOT_A_PARTICIPANT: ["C-114.28", AT("#successRefusal")],
  SUCCESS_BAD_DATE: ["C-114.30", AT("#successRefusal")], SUCCESS_NO_EVIDENCE: ["C-114.31", AT("#successRefusal")],
  SUCCESS_TOO_LARGE: ["C-114.32", AT("#successRefusal")], SUCCESS_FIGURE_NOT_COMPUTED: ["C-114.33", AT("#successFigures")],
  SUCCESS_CAUSE_NOT_EVIDENCED: ["C-114.35", AT("#causeRefusal")], SUCCESS_CAUSE_OWN_ACT_ONLY: ["C-114.36", AT("#causeRefusal")],
  NO_SUCH_SUCCESS_RECORD: ["C-114.38", AT("noSuchSuccessRecord")], SUCCESS_NO_REASON: ["C-114.39", AT("successRevise")],
  SUCCESS_BAD_REASON: ["C-114.40", AT("successRevise")], SUCCESS_SUPERSEDED: ["C-114.41", AT("successSuperseded")],
  MACHINE_CANNOT_CARRY: ["C-114.42", AT("outcomeCarry")],
};
/* Their words as T45 left them: none is answered any longer. */
const T45 = {
  ADDRESSED_WORD_REFUSED: "The plain words a statement may carry are remedied, mitigated, compensated, acknowledged and cannot be undone, each once, and only on a part recorded addressed. Nothing was written.",
  ADDRESSED_NO_PERCENTAGE: "Whether harm is addressed is said in words with evidence, never as a percentage, share, ratio or score. Nothing was written.",
  ADDRESSED_NO_REASON: "Whether a part is addressed or not is a reasoned statement: say why. Nothing was written.",
  ADDRESSED_BAD_REASON: "A reason is at most 2,000 characters. Nothing was written.",
  MACHINE_CANNOT_RECORD_SUCCESS: "A success record is a member's statement. A machine may compute a figure for a member to adopt; it never records a success. Nothing was written.",
  SUCCESS_NOT_A_PARTICIPANT: "Recording a success is work inside the project, done by a member who has joined it. Nothing was written.",
  SUCCESS_BAD_DATE: "When the change took place is a real date, such as 2026-05-14, or a band of dates. Nothing was written.",
  SUCCESS_NO_EVIDENCE: "A success rests on evidence: content or findings this record holds and you may see. Nothing was written.",
  SUCCESS_TOO_LARGE: "A success record holds at most 50 items of evidence, 20 figures and a sequence of 1,000 characters. Nothing was written.",
  SUCCESS_FIGURE_NOT_COMPUTED: "A figure on a success record is computed from cited sources, never stated: give its computation and its operands. Nothing was written.",
  SUCCESS_CAUSE_NOT_EVIDENCED: "Saying the team's action caused the change rests on evidence: between 1 and 50 items this record holds and you may see. Nothing was written.",
  SUCCESS_CAUSE_OWN_ACT_ONLY: "The team's own act is never evidence that it caused the change: cite evidence other than the group's own actions and what it sent. You may state the sequence of events instead. Nothing was written.",
  NO_SUCH_SUCCESS_RECORD: "No success record answers to that id. One you may not see is answered exactly as one that does not exist.",
  SUCCESS_NO_REASON: "A revision of a success record says why. Nothing was written.",
  SUCCESS_BAD_REASON: "A reason is at most 2,000 characters. Nothing was written.",
  SUCCESS_SUPERSEDED: "This success record has been revised: its successor carries the record forward. Nothing was written.",
  MACHINE_CANNOT_CARRY: "Carrying an outcome into the case's next edition is a member's act. A machine never carries one. Nothing was written.",
};
/* The three rows R25 keeps in T46, with their present words. */
/* Each kept row's present words, by their sha256: the test holds no sentence a member reads. */
const KEPT_ROWS = {
  SUCCESS_NO_STATEMENT: ["C-114.29", "3ba606da829c85ea3462f85dd4ab628404034fa9711af52d33d890cfdfec9e45"],
  SUCCESS_CAUSE_UNSTATED: ["C-114.34", "02021bc9c9f4e4cabeefeb4bd2b1c85a33510c0c2c1942b68be164468abef7cb"],
  SUCCESS_CAUSE_UNCHECKABLE: ["C-114.37", "0d9cab70b60c5bcc2870f3809f03d02fe921d118d333d8c975bcd8ab74bb61b5"],
};
const sha = (text) => createHash("sha256").update(text).digest("hex");
/* Every row R25 does not take (25, the three kept among them), as T45 left them: their canonical JSON's sha256. */
const KEPT = { count: 25, sha256: "1818d9398681db2ab5af86a9f9f62cef84ba3d4e92b0d4fc397907721be86223" };
const SENTENCES = [SEQUENCE_NOT_CAUSE, CAUSE_NOT_STATED];

test("R25 seventeen rows read words.json's refusal.<CODE> by key from CONSEQUENCES_WORDS, never a copy; codes, numbers and wheres unmoved; T45's words answered no longer", () => {
  assert.ok(Object.isFrozen(CONSEQUENCES_WORDS));
  assert.deepEqual(Object.keys(CONSEQUENCES_WORDS).sort(),
    [...Object.keys(TAKEN).map((c) => `refusal.${c}`), ...SENTENCES].sort(), "the table holds exactly R25's keys");
  for (const [key, text] of Object.entries(CONSEQUENCES_WORDS)) assert.equal(text, en(key), `${key} verbatim`);
  for (const [code, [check, where]] of Object.entries(TAKEN)) {
    const row = CONSEQUENCES_CHECKS[code];
    assert.deepEqual([row.check, row.where], [check, where], code);
    assert.deepEqual(Object.keys(row).sort(), ["check", "translation", "where"], code);
    assert.equal(row.translation, CONSEQUENCES_WORDS[`refusal.${code}`], `${code} reads refusal.${code}`);
    assert.equal(row.translation, en(`refusal.${code}`), code);
    assert.notEqual(row.translation, T45[code], `${code}: T45's words no longer`);
  }
});

test("R25 C-114.29 SUCCESS_NO_STATEMENT, C-114.34 SUCCESS_CAUSE_UNSTATED and C-114.37 SUCCESS_CAUSE_UNCHECKABLE keep their present words, not words.json's; every other row keeps its own", () => {
  for (const [code, [check, digest]] of Object.entries(KEPT_ROWS)) {
    assert.deepEqual([CONSEQUENCES_CHECKS[code].check, sha(CONSEQUENCES_CHECKS[code].translation)], [check, digest], code);
    assert.ok(!(`refusal.${code}` in CONSEQUENCES_WORDS), `${code} not taken in T46`);
    assert.notEqual(digest, sha(en(`refusal.${code}`)), `${code}: words.json's sentence and the requirement do not yet agree`);
  }
  const kept = Object.fromEntries(Object.entries(CONSEQUENCES_CHECKS).filter(([c]) => !(c in TAKEN)));
  assert.deepEqual([Object.keys(kept).length, sha256HexSync(canonicalJson(kept))], [KEPT.count, KEPT.sha256],
    "no other row's check, where or translation moved");
  for (const [code, r] of Object.entries(kept)) assert.ok(!Object.values(CONSEQUENCES_WORDS).includes(r.translation), code);
});

const S = "STD-2026-0001-law";
function setup(opts) {
  const w = world(opts);
  w.D = w.determination("CONF-2026-0001-act", w.P, { [S]: "noncompliant" });
  w.cid = w.figure("INFO-2026-0001-report", "The City published both reports; restored 1,000");
  w.ours = w.figure("INFO-2026-0050-our-letter", "Our demand of 6 Nov");
  w.c.registerOwnActReader(({ ids }) => ids.filter((x) => x === w.ours));
  w.base = { project: w.P, statement: "The City published both reports", changed_on: "2026-05-14", evidence: [w.cid],
             author: V("alice") };
  w.rec = (over = {}) => w.c.successRecord({ ...w.base, ...over });
  return w;
}
const answers = (r, code) => {
  assert.equal(r.ok, false, `${code}: ${JSON.stringify(r).slice(0, 300)}`);
  assert.deepEqual([r.reason, r.code, r.check, r.translation],
    [code, code, TAKEN[code][0], en(`refusal.${code}`)], code);
};

test("R25 each re-worded refusal is answered by the acts with words.json's sentence, behaviour unmoved: refused, nothing written, beside its control", () => {
  const w = setup();
  const part = w.c.consequenceRecord({ determination: w.D, standard: S, affected: { kind: "fund", description: "f" },
    period: { from: "2026-01-01", to: "2026-06-30" }, measure: { unit: "money", value: 10 }, basis: { rationale: "r" }, author: V("alice") });
  assert.equal(part.ok, true);
  const good = { id: part.id, state: "addressed", evidence: [w.cid], reason: "restored", author: V("alice") };
  const first = w.rec();
  assert.equal(first.ok, true, JSON.stringify(first));
  w.invite("carol");
  const fig = { label: "restored", basis: { op: "sum", operands: [{ content: w.cid, figure: "1,000" }] } };
  const before = w.snapshot();
  const cases = [
    ["ADDRESSED_WORD_REFUSED", () => w.c.addressedRecord({ ...good, words: ["fixed"] })],
    ["ADDRESSED_NO_PERCENTAGE", () => w.c.addressedRecord({ ...good, percent: 60 })],
    ["ADDRESSED_NO_REASON", () => w.c.addressedRecord({ ...good, reason: " " })],
    ["ADDRESSED_BAD_REASON", () => w.c.addressedRecord({ ...good, reason: "x".repeat(2001) })],
    ["MACHINE_CANNOT_RECORD_SUCCESS", () => w.rec({ author: MACHINE })],
    ["SUCCESS_NOT_A_PARTICIPANT", () => w.rec({ author: V("carol") })],
    ["SUCCESS_BAD_DATE", () => w.rec({ changed_on: "2026-02-31" })],
    ["SUCCESS_NO_EVIDENCE", () => w.rec({ evidence: [] })],
    ["SUCCESS_TOO_LARGE", () => w.rec({ figures: Array(21).fill(fig) })],
    ["SUCCESS_FIGURE_NOT_COMPUTED", () => w.rec({ figures: [{ label: "said", value: "1000" }] })],
    ["SUCCESS_CAUSE_NOT_EVIDENCED", () => w.rec({ cause: { statement: "our demand did it", evidence: [] } })],
    ["SUCCESS_CAUSE_OWN_ACT_ONLY", () => w.rec({ cause: { statement: "our demand did it", evidence: [w.ours] } })],
    ["NO_SUCH_SUCCESS_RECORD", () => w.c.successRecordRead({ id: "SUC-2026-9999", viewer: V("alice") })],
    ["SUCCESS_NO_REASON", () => w.c.successRevise({ id: first.id, reason: " ", author: V("alice") })],
    ["SUCCESS_BAD_REASON", () => w.c.successRevise({ id: first.id, reason: "x".repeat(2001), author: V("alice") })],
    ["MACHINE_CANNOT_CARRY", () => w.c.outcomeCarry({ carry: { success: first.id }, case: "CASE-2026-0001", author: MACHINE })],
  ];
  for (const [code, act] of cases) answers(act(), code);
  assert.deepEqual(w.snapshot(), before, "nothing written");
  /* Controls: the same acts, each with the one thing put right, land. */
  assert.equal(w.c.addressedRecord({ ...good, words: ["mitigated"] }).ok, true);
  assert.equal(w.rec({ author: V("pat"), figures: [fig], cause: { statement: "our demand did it", evidence: [w.ours, w.cid] } }).ok, true);
  const rev = w.c.successRevise({ id: first.id, reason: "worded better", statement: "restated", author: V("alice") });
  assert.equal(rev.ok, true);
  /* C-114.41, once revised; the successor carries. */
  answers(w.c.successRevise({ id: first.id, reason: "again", author: V("alice") }), "SUCCESS_SUPERSEDED");
  answers(w.c.outcomeCarry({ carry: { success: first.id }, case: "CASE-2026-0001", author: V("alice") }), "SUCCESS_SUPERSEDED");
  assert.equal(w.c.outcomeCarry({ carry: { success: rev.id }, case: "CASE-2026-0001", author: V("alice") }).ok, true);
  /* No answer carries T45's words. */
  const text = JSON.stringify(CONSEQUENCES_CHECKS);
  for (const old of Object.values(T45).filter((t) => !Object.values(CONSEQUENCES_WORDS).includes(t))) assert.ok(!text.includes(old), old);
});

test("R25 R19's two sentences are answered with their keys and words.json's words, by every read", () => {
  const w = setup();
  const seq = w.rec({ sequence: "After our demand of 6 Nov, the City published both reports on 14 May" });
  const caused = w.rec({ cause: { statement: "our demand did it", evidence: [w.ours, w.cid] } });
  for (const s of [seq.success, w.c.successRecordRead({ id: seq.id, viewer: V("alice") }).success,
                   w.c.successRecordsFor({ project: w.P, viewer: V("alice") }).records.find((x) => x.id === seq.id)]) {
    assert.deepEqual(s.sequence, { text: "After our demand of 6 Nov, the City published both reports on 14 May",
      key: "consequences.success.sequence_not_cause", says: en("consequences.success.sequence_not_cause") });
    assert.deepEqual([s.cause, s.cause_key, s.cause_says],
      [null, "consequences.success.cause_not_stated", en("consequences.success.cause_not_stated")]);
  }
  /* Controls: no sequence answers none; a stated cause answers no sentence of its absence. */
  const c = w.c.successRecordRead({ id: caused.id, viewer: V("alice") }).success;
  assert.deepEqual([c.sequence, "cause_key" in c, "cause_says" in c, c.cause.statement], [null, false, false, "our demand did it"]);
});

test("R24 a success record is a success_record record object, promoted in the act that records it, with history and export, fenced by its project; a revision is a second object", () => {
  const w = setup();
  const r = w.rec({ sequence: "s" });
  assert.match(r.id, /^SUC-2026-\d{4,}$/);
  const head = w.record.head(r.id);
  assert.deepEqual([head.type, head.currentState, head.priorState], ["success_record", "recorded", null]);
  const md = w.record.readFile(r.id, "bundle.md").text;
  assert.match(md, new RegExp(`^id: ${r.id}$`, "m"));
  assert.match(md, /^object_type: success_record$/m);
  assert.match(md, new RegExp(`^created: "${r.success.at}"$`, "m"));
  assert.deepEqual(bodyOf(w, r.id), { project: w.P, matter: null, statement: w.base.statement, changed_on: "2026-05-14",
    evidence: [w.cid], figures: [], sequence: "s", cause: null, author: V("alice"), at: r.success.at, supersedes: null, reason: null });
  /* History and export: the image, with its promotion in the manifest. */
  const image = w.record.readImage(r.id);
  assert.ok(image && Object.keys(image).some((k) => /promotion_/.test(k)), "its promotion is in its history");
  assert.match(JSON.stringify(Object.entries(image).find(([k]) => /manifest/.test(k))[1]), /promotion/);
  /* Fenced by its project (promotion R53), as the reads are (R13). */
  assert.equal(w.record.bundleInfo(r.id).project, w.P);
  assert.deepEqual([V("alice"), V("pat"), V("bob"), V("carol")].map((v) => w.membership.inSight(r.id, v)), [true, true, false, false]);
  /* A revision is a successor, a second object; the first is not rewritten. */
  const rev = w.c.successRevise({ id: r.id, reason: "worded better", statement: "restated", author: V("alice") });
  assert.equal(rev.ok, true);
  assert.notEqual(rev.id, r.id);
  assert.deepEqual([w.record.head(rev.id).type, bodyOf(w, rev.id).supersedes, bodyOf(w, rev.id).reason], ["success_record", r.id, "worded better"]);
  assert.equal(w.record.head(r.id).bundleSha, head.bundleSha, "the earlier object is not rewritten");
  /* Its type's machine has one state: a promotion moving it is refused by promotion. */
  const moved = w.promotion.promote({ bundleId: r.id, base: head.bundleSha, snapKey: "move1", author: V("alice"),
    files: [{ path: "bundle.md", text: md.replace("current_state: recorded", "current_state: retired") }], meta: {} });
  assert.equal(moved.ok, false);
  /* Ids follow ID_TABLE's sequential form for SUC (record-grammar R59). */
  assert.deepEqual([r.id, rev.id], ["SUC-2026-0001", "SUC-2026-0002"]);
  /* A purge of the record's id clears its object and its row alike. */
  w.record.purge({ bundleId: rev.id });
  assert.deepEqual([w.record.head(rev.id), w.rows(`SELECT 1 FROM success_records WHERE id=?`, rev.id).length], [null, 0]);
});

/* R24's audit clause (K2980; T47, N958, record-grammar R62): a success record, recorded before or after the promotion,
   audits clean as a consequence part does: record-core's audit (`auditPass`) and record-grammar's `checkBundle` over its
   stored image, as the audit hands it. */
const hexOf = (b) => Buffer.from(b).toString("hex");
async function judged(w, id, rewrite = null) {
  const files = new Map(), elided = new Set();
  for (const [p, v] of Object.entries(w.record.readImage(id))) typeof v === "string" ? files.set(p, v) : elided.add(p);
  const folderName = rewrite ? rewrite.id : id;
  if (rewrite) files.set("bundle.md", files.get("bundle.md").replace(new RegExp(`^id: ${id}$`, "m"), `id: ${rewrite.id}`));
  const { findings } = await checkBundle({ folderName, files, elidedPaths: elided,
    sha256: async (v) => hexOf(createHash("sha256").update(typeof v === "string" ? v : Buffer.from(v)).digest()),
    sha512: async (b) => new Uint8Array(createHash("sha512").update(Buffer.from(b)).digest()),
    resolveTarget: (t) => !!w.record.bundleInfo(t) }, { grammars: w.record.grammars() });
  return findings;
}

test("R24 (T47, N958) a success record, recorded before or after the promotion, audits with no finding through checkBundle, as a consequence part does; control: one with a slug after its id audits with C-1.2", async () => {
  const w = setup();
  const held = heldRow(w, "SUC-2026-4821");
  assert.deepEqual(w.c.promoteHeldSuccessRecords(), { ok: true, promoted: [held.id], left: [] });
  const after = w.rec({ sequence: "s", figures: [{ label: "restored", basis: { op: "sum", operands: [{ content: w.cid, figure: "1,000" }] } }] });
  const rev = w.c.successRevise({ id: after.id, reason: "worded better", statement: "restated", author: V("alice") });
  const part = w.c.consequenceRecord({ determination: w.D, standard: S, affected: { kind: "fund", description: "f" },
    period: { from: "2026-01-01", to: "2026-06-30" }, measure: { unit: "money", value: 10 }, basis: { rationale: "r" }, author: V("alice") });
  assert.deepEqual([after.ok, rev.ok, part.ok], [true, true, true]);
  const ids = [held.id, after.id, rev.id, part.id];
  /* The audit: every one clean. */
  const pass = await w.record.auditPass({ visible: (id) => ids.includes(id) });
  assert.deepEqual([pass.checked, pass.clean, pass.withErrors, pass.tally, pass.offenders], [4, 4, 0, {}, []]);
  /* checkBundle over each image: no finding at all, the success records as the part. */
  for (const id of ids) assert.deepEqual(await judged(w, id), [], id);
  /* Control: the same object with a slug after its SUC- id audits with its finding. */
  for (const id of [held.id, after.id]) {
    const f = await judged(w, id, { id: `${id}-slug` });
    assert.ok(f.some((x) => x.check === "C-1.2" && x.severity === "error"), `${id}-slug: ${JSON.stringify(f).slice(0, 400)}`);
  }
});

/* promotion as this module reaches it, refusing every success record's object as the record does with no producing group
   recorded (promotion R13, C-64.1); every other promotion as it is. */
const REFUSED = groupUndetermined();
const refusing = (w) => new Proxy(w.promotion, { get: (t, p) => (p === "promote"
  ? (pkg) => (/^SUC-/.test(String(pkg && pkg.bundleId)) ? REFUSED : t.promote(pkg))
  : typeof t[p] === "function" ? t[p].bind(t) : t[p]) });

test("R24 a success record whose promotion the record refuses is not written", () => {
  const w = setup();
  const c = consequencesModule({ storage: w.st }, { ...w.deps, promotion: refusing(w) });
  c.registerOwnActReader(() => []);
  const before = w.snapshot();
  assert.deepEqual(c.successRecord({ ...w.base }), REFUSED, "the record's refusal, whole");
  assert.deepEqual(w.snapshot(), before, "no row, no object, no id spent");
  assert.equal(w.rec().ok, true, "control: the same record, the record accepting it, lands");
});

/* A success record as T45 held it: a row of this module's own, its id four random digits, with no record object. */
function heldRow(w, id, over = {}) {
  const r = { id, project: w.P, matter: JSON.stringify({ plan: "PLN-2026-0001", matter: "M1" }), statement: "The City restored it",
    changed_on: "2026-04-02", evidence: JSON.stringify([w.cid]), figures: "[]", sequence: "first our letter, then the vote",
    cause: null, author: V("alice"), at: "2026-08-01T09:30:00Z", supersedes: null, reason: null, ...over };
  w.st.sql.exec(`INSERT INTO success_records (id, project, matter, statement, changed_on, evidence, figures, sequence, cause,
    author, at, supersedes, reason) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, ...Object.values(r));
  return r;
}
const bodyOf = (w, id) => JSON.parse(/```json\n([\s\S]*?)\n```/.exec(w.record.readFile(id, "bundle.md").text)[1]);

test("R24 one recorded in the rows before T46 is promoted with its id, fields, author and time unchanged, its successor and carries naming it, read as before; one recorded after reads alike", () => {
  const w = setup();
  const old = heldRow(w, "SUC-2026-4821");
  const next = heldRow(w, "SUC-2026-0001", { statement: "The City restored it in full", supersedes: old.id, reason: "fuller",
                                             at: "2026-08-02T10:00:00Z" });
  w.st.sql.exec(`INSERT INTO consequence_carries (record_id, kind, ref, case_id, outcome, by, at) VALUES (?,?,?,?,?,?,?)`,
                next.id, "success", null, "CASE-2026-0001", "OUT-2026-0001", V("alice"), "2026-08-03T00:00:00Z");
  const read = (id) => w.c.successRecordRead({ id, viewer: V("alice") });
  const beforeReads = [read(old.id), read(next.id), w.c.successRecordsFor({ project: w.P, viewer: V("alice") })];
  assert.deepEqual([w.record.head(old.id), w.record.head(next.id)], [null, null], "held as rows alone");
  const done = w.c.promoteHeldSuccessRecords();
  assert.deepEqual(done, { ok: true, promoted: [next.id, old.id], left: [] });
  for (const row of [old, next]) {
    const h = w.record.head(row.id);
    assert.deepEqual([h.type, h.currentState], ["success_record", "recorded"], row.id);
    const md = w.record.readFile(row.id, "bundle.md").text;
    assert.match(md, new RegExp(`^created: "${row.at}"$`, "m"), "its time unchanged");
    assert.match(md, new RegExp(`^author: "${row.author}"$`, "m"), "its author unchanged");
    assert.deepEqual(bodyOf(w, row.id), { project: row.project, matter: JSON.parse(row.matter), statement: row.statement,
      changed_on: row.changed_on, evidence: JSON.parse(row.evidence), figures: [], sequence: row.sequence, cause: null,
      author: row.author, at: row.at, supersedes: row.supersedes, reason: row.reason }, "its fields unchanged");
    assert.ok(Object.keys(w.record.readImage(row.id)).some((k) => /promotion_/.test(k)), "with its history");
  }
  assert.deepEqual([read(old.id), read(next.id), w.c.successRecordsFor({ project: w.P, viewer: V("alice") })], beforeReads,
                   "every read answers it as before: the successor's link and the carry name it still");
  assert.deepEqual(w.rows(`SELECT id, at FROM success_records ORDER BY id`), [{ id: next.id, at: next.at }, { id: old.id, at: old.at }],
                   "the rows are never rewritten");
  /* Idempotent: nothing is left to promote. */
  assert.deepEqual(w.c.promoteHeldSuccessRecords(), { ok: true, promoted: [], left: [] });
  /* Control: one recorded after the promotion reads alike, each with its history; its id steps past T45's 0001. */
  const now = w.rec();
  assert.equal(now.id, "SUC-2026-0002");
  const a = read(now.id).success, b = read(next.id).success;
  assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort());
  assert.deepEqual([w.record.head(now.id).type, w.record.head(next.id).type], ["success_record", "success_record"]);
});

test("R24 the module's creation promotes the rows held before T46; one the record refuses is left, read as before, and promoted later", () => {
  const w = setup();
  const held = heldRow(w, "SUC-2026-7310");
  /* The module created on a host over this store, the record refusing: the row is left, and read as before. */
  const c = consequencesModule({ storage: w.st }, { ...w.deps, promotion: refusing(w) });
  assert.equal(w.record.head(held.id), null, "the record refuses, and the row is left");
  assert.deepEqual(c.promoteHeldSuccessRecords(), { ok: false, promoted: [], left: [held.id] });
  const r = c.successRecordRead({ id: held.id, viewer: V("alice") });
  assert.deepEqual([r.ok, r.success.statement, r.success.at], [true, held.statement, held.at], "read as before");
  /* Control: the next creation, the record accepting, promotes it. */
  consequencesModule({ storage: w.st }, w.deps);
  assert.deepEqual([w.record.head(held.id).type, w.record.head(held.id).currentState], ["success_record", "recorded"]);
  assert.equal(c.successRecordRead({ id: held.id, viewer: V("alice") }).success.statement, held.statement);
});
