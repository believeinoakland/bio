/* retrieval: the meaning level of the frontier (R36, R39, R45, R46, R50), at the module's interface.
 *
 * Converted from the old battery's `test/observation-meaning.test.mjs` (REC-95, REC-107, REC-110). Its retrieval share is
 * the meaning-level reader: §5.1's causes for a missing subject of each kind (a reference with a resolution reads
 * pre_log, not never_looked; a subject with no registration instant, or one entered before the level's first row, reads
 * purged; an unrecognised kind takes purged), the `not_ruled_out` and `evidence_one_sided` fields on every missing row,
 * the tally counting the whole level whatever the viewer and the bound, and `by_subject_kind` following the reader. The
 * three writers (the reader run, the resolution attempt, the connection derivation), the vocabulary and the pure cause
 * rule are observation-log's, tested there; the old suite's source-text arms are dropped. Rows are written as
 * observation-log's append site writes them, the missing subjects' artifacts as their owners write them. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, VOCAB, T0 } from "./fixture.mjs";
import { causesNotRuledOut } from "../../../src/observation-log/index.mjs";

const FIRST = "2026-09-28T00:00:00Z";     /* the meaning level's first row: after the fixture's registrations (03:00, 09-27) */
const LATE = "2026-09-29T00:00:00Z";      /* a clock after it: what is registered then entered after the first row */
const DENY = [null, undefined, "", "project:NO-SUCH", "somebody"];

const meaningRow = (w, kind, subject, state, extra = {}) =>
  w.observe({ level: "meaning", subject_kind: kind, subject, state, authority_kind: "derive", ...extra });
const ref = (w, capSha, bundleId, name) =>
  w.st.sql.exec(`INSERT INTO reading_refs (capture_sha, bundle_id, ref) VALUES (?,?,?)`, capSha, bundleId, name);
const entity = (w, id, at) => w.st.sql.exec(`INSERT INTO entities (entity_id, kind, label, at) VALUES (?, 'person', ?, ?)`, id, `Label ${id}`, at);
const missing = (f) => [...f.never_looked, ...(f.missing_unexplained || [])];

test("R46: a missing subject's cause is §5.1's, in order, at each kind — pre_log when the kind's artifact exists (a reading, a resolution, a connection) whenever it entered; else purged when it has no registration instant or entered before the level's first row, never_looked when after; a reference enters at the earliest registration of a capture carrying it; a kind with no artifact rule reads purged; each row carries not_ruled_out and evidence_one_sided (one-sided at a reference and an entity), each unexplained row its why", () => {
  const w = world();
  /* Registered before the level's first row. */
  const early = w.cap("early", "e"), earlyRead = w.cap("early-read", "er");
  w.doc("INFO-1", {}, { captures: [early, earlyRead] });
  w.reading(earlyRead.sha, "INFO-1");
  const hid = w.cap("hidden", "h");
  const proj = w.project("Hidden", "ann", { captures: [hid] });
  meaningRow(w, "entity", "ENT-SEEN", "PRESENT", { at: FIRST });
  /* Registered after it. */
  w.clock.now = Date.parse(LATE);
  const late = w.cap("late", "l"), lateRead = w.cap("late-read", "lr");
  w.doc("INFO-2", {}, { captures: [late, lateRead] });
  w.reading(lateRead.sha, "INFO-2");
  assert.deepEqual(w.rows(`SELECT capture_sha, registered FROM register WHERE capture_sha IN (?,?)`, early.sha, late.sha)
    .map((r) => r.registered).sort(), ["2026-09-27T03:00:00Z", LATE], "the fixture straddles the first row");
  ref(w, early.sha, "INFO-1", "ref early");
  ref(w, late.sha, "INFO-2", "ref late");
  ref(w, late.sha, "INFO-2", "ref resolved");
  w.st.sql.exec(`INSERT INTO resolutions (capture_sha, bundle_id, ref, entity_id, grade, method, at) VALUES (?, 'INFO-2', 'ref resolved', 'ENT-SEEN', 'D', 'testimony', ?)`,
    late.sha, LATE);
  ref(w, "9".repeat(64), "INFO-1", "ref unregistered");            /* its capture is in no register: no instant */
  ref(w, late.sha, "INFO-2", "ref both"); ref(w, early.sha, "INFO-1", "ref both");
  ref(w, hid.sha, proj, "ref hidden");
  entity(w, "ENT-OLD", T0);
  entity(w, "ENT-NEW", LATE);
  entity(w, "ENT-CONN", LATE);
  w.st.sql.exec(`INSERT INTO connections (a_bundle_id, b_bundle_id, entity_id) VALUES ('INFO-1', 'INFO-2', 'ENT-CONN')`);

  const f = w.retrieval.frontier({ level: "meaning", viewer: V("vera") });
  const want = [
    ["capture", early.sha, "purged"], ["capture", earlyRead.sha, "pre_log"],
    ["capture", late.sha, "never_looked"], ["capture", lateRead.sha, "pre_log"],
    ["reference", "ref early", "purged"], ["reference", "ref late", "never_looked"], ["reference", "ref resolved", "pre_log"],
    ["reference", "ref unregistered", "purged"], ["reference", "ref both", "purged"],
    ["entity", "ENT-OLD", "purged"], ["entity", "ENT-NEW", "never_looked"], ["entity", "ENT-CONN", "pre_log"],
  ];
  const key = (r) => `${r[0]} ${r[1]}`;
  assert.deepEqual(missing(f).map((r) => [r.subject_kind, r.subject, r.missing_cause]).sort((a, b) => key(a).localeCompare(key(b))),
    want.sort((a, b) => key(a).localeCompare(key(b))));
  /* Split: never_looked holds its own cause only; every other is unexplained, with the level's why. */
  assert.ok(f.never_looked.every((r) => r.missing_cause === "never_looked"));
  assert.ok(f.missing_unexplained.every((r) => r.missing_cause !== "never_looked" && r.why === VOCAB.MEANING_MISSING_ROW_CAUSES[r.missing_cause]));
  assert.deepEqual([f.never_looked_count, f.missing_unexplained_count], [3, 9]);
  /* The G2 case by name: a reference the record matched is never offered as a name nobody tried. */
  assert.equal(f.never_looked.some((r) => r.subject === "ref resolved"), false);
  /* The sidedness, and the causes not ruled out, on every row of both lists. */
  assert.deepEqual([VOCAB.MEANING_EVIDENCE_IS_ONE_SIDED.capture, VOCAB.MEANING_EVIDENCE_IS_ONE_SIDED.reference,
                    VOCAB.MEANING_EVIDENCE_IS_ONE_SIDED.entity], [false, true, true]);
  for (const r of missing(f)) {
    const sided = VOCAB.MEANING_EVIDENCE_IS_ONE_SIDED[r.subject_kind];
    assert.equal(r.evidence_one_sided, sided, r.subject);
    assert.deepEqual(r.not_ruled_out, causesNotRuledOut(r.missing_cause, { evidenceOneSided: sided }), r.subject);
  }
  const at = (s) => missing(f).find((r) => r.subject === s);
  assert.deepEqual(at("ref unregistered").not_ruled_out, ["pre_log", "purged", "never_looked"], "a purged reference names all three");
  assert.deepEqual(at(early.sha).not_ruled_out, ["purged", "never_looked"], "a purged capture: its reading would have shown a look");
  assert.deepEqual([at("ref resolved").not_ruled_out, at("ENT-CONN").not_ruled_out], [["pre_log"], ["pre_log"]]);
  assert.deepEqual([f.missing_causes, f.evidence_one_sided], [VOCAB.MEANING_MISSING_ROW_CAUSES, VOCAB.MEANING_EVIDENCE_IS_ONE_SIDED]);
  /* The missing capture and reference of a hidden bundle are absent for vera, present for ann. */
  assert.equal(JSON.stringify(missing(f)).includes(hid.sha) || JSON.stringify(missing(f)).includes("ref hidden"), false);
  const a = missing(w.retrieval.frontier({ level: "meaning", viewer: V("ann") }));
  assert.ok(a.some((r) => r.subject === hid.sha) && a.some((r) => r.subject === "ref hidden"));
  /* A kind with no artifact rule reads purged, never never_looked, at an instant the other kinds read never_looked. */
  for (const kind of ["unstated", "address", "description", "nonsense"])
    assert.equal(w.observation.missingMeaningCause(kind, "x", LATE), "purged", kind);
  assert.equal(w.observation.missingMeaningCause("entity", "ENT-NOTHING", LATE), "never_looked");
});

/* A public capture and one in ann's project, a reference through each, and two entities (one with a history). */
function seed(w) {
  const pub = w.cap("pub", "p"), hid = w.cap("hid", "h");
  w.doc("INFO-1", {}, { captures: [pub] });
  const proj = w.project("Hidden", "ann", { captures: [hid] });
  meaningRow(w, "capture", pub.sha, "PRESENT", { authority: "INFO-1", at: "2026-09-28T01:00:00Z" });
  meaningRow(w, "capture", hid.sha, "LOOKED_ABSENT", { authority: proj, at: "2026-09-28T02:00:00Z" });
  meaningRow(w, "reference", "pub name", "LOOKED_ABSENT", { authority: pub.sha, at: "2026-09-28T03:00:00Z" });
  meaningRow(w, "reference", "hid name", "PRESENT", { authority: hid.sha, at: "2026-09-28T04:00:00Z" });
  meaningRow(w, "entity", "ENT-1", "LOOKED_ABSENT", { at: "2026-09-28T05:00:00Z" });
  meaningRow(w, "entity", "ENT-1", "PRESENT", { at: "2026-09-28T06:00:00Z" });
  meaningRow(w, "entity", "ENT-2", "LOOKED_ABSENT", { at: "2026-09-28T07:00:00Z" });
  entity(w, "ENT-3", LATE);                                      /* a missing subject, so the lists are not empty */
  return { pub, hid, proj };
}
const WHOLE = { PRESENT: 3, LOOKED_ABSENT: 4 };

test("R39, R36: the meaning tally counts rows per state over the whole level — the same for every viewer (one the gate narrows, one it denies, an entitled one, a machine credential) and at every bound, while looked really differs and the page is really cut; NEVER_LOOKED is never a state in it; a run's rows in a project the viewer cannot see are the one thing left out", () => {
  const w = world();
  const { hid } = seed(w);
  assert.deepEqual(Object.fromEntries(w.rows(`SELECT state, COUNT(*) n FROM observation_log WHERE level='meaning' GROUP BY state`)
    .map((r) => [r.state, r.n])), WHOLE, "the level's rows");
  for (const viewer of [V("vera"), V("ann"), MACHINE, ...DENY])
    for (const limit of [1, 3, 500]) {
      const f = w.retrieval.frontier({ level: "meaning", viewer, limit });
      assert.deepEqual(f.tally, WHOLE, `${viewer} ${limit}`);
      assert.equal("NEVER_LOOKED" in f.tally, false);
    }
  /* Armed: the lists behind the tally do differ by viewer and by bound. */
  const vera = w.retrieval.frontier({ level: "meaning", viewer: V("vera"), limit: 500 });
  const ann = w.retrieval.frontier({ level: "meaning", viewer: V("ann"), limit: 500 });
  const cut = w.retrieval.frontier({ level: "meaning", viewer: V("ann"), limit: 1 });
  assert.deepEqual([vera.looked.length, ann.looked.length, cut.looked.length, cut.truncated], [4, 6, 1, true]);
  assert.equal(JSON.stringify(vera.looked).includes(hid.sha), false);
  assert.equal(w.retrieval.frontier({ level: "meaning", viewer: null }).looked.length, 0);
  assert.ok(ann.never_looked.some((r) => r.subject === "ENT-3"), "a missing subject stands apart from the tally");
  assert.equal(JSON.stringify(vera.tally).includes(hid.sha), false, "the tally names nothing");
  /* A run's row: with no tail registered, left out for every viewer but a machine credential. */
  meaningRow(w, "entity", "ENT-R", "PRESENT", { authority_kind: "run", authority: "RUN-H", at: "2026-09-28T08:00:00Z" });
  w.runs["RUN-H"] = [V("ann")];
  const withRun = { PRESENT: 4, LOOKED_ABSENT: 4 };
  for (const viewer of [V("vera"), V("ann"), ...DENY])
    assert.deepEqual(w.retrieval.frontier({ level: "meaning", viewer }).tally, WHOLE, `fail closed ${viewer}`);
  assert.deepEqual(w.retrieval.frontier({ level: "meaning", viewer: MACHINE }).tally, withRun);
  /* The registered tail: ann may see RUN-H's project, vera may not — and neither answer moves with the bound. */
  w.retrieval.registerHiddenRunTail("ai-runs", (viewer) => (viewer === V("ann") || viewer === MACHINE ? { sql: "", args: [] }
    : { sql: ` AND NOT (authority_kind = 'run' AND COALESCE(authority, '') IN (?))`, args: ["RUN-H"] }));
  for (const limit of [1, 500]) {
    assert.deepEqual(w.retrieval.frontier({ level: "meaning", viewer: V("ann"), limit }).tally, withRun, `ann ${limit}`);
    assert.deepEqual(w.retrieval.frontier({ level: "meaning", viewer: V("vera"), limit }).tally, WHOLE, `vera ${limit}`);
  }
});

test("R45, R50: by_subject_kind is counted over looked itself, so it follows the reader and the bound where the tally does not — a viewer denied sees no kind at all (entities included), a narrowed viewer only the kinds and rows she may see, and a cut page only its own rows", () => {
  const w = world();
  seed(w);
  const byKind = (viewer, limit = 500) => w.retrieval.frontier({ level: "meaning", viewer, limit });
  for (const viewer of DENY) {
    const f = byKind(viewer);
    assert.deepEqual([f.looked, f.by_subject_kind, f.never_looked, f.missing_unexplained], [[], {}, [], []], String(viewer));
    assert.deepEqual(f.tally, WHOLE, "while the tally stands");
  }
  assert.deepEqual(byKind(V("vera")).by_subject_kind, { capture: { looked: 1, ran_and_found_nothing: 0 },
    reference: { looked: 1, ran_and_found_nothing: 1 }, entity: { looked: 2, ran_and_found_nothing: 1 } });
  assert.deepEqual(byKind(V("ann")).by_subject_kind, { capture: { looked: 2, ran_and_found_nothing: 1 },
    reference: { looked: 2, ran_and_found_nothing: 1 }, entity: { looked: 2, ran_and_found_nothing: 1 } });
  assert.deepEqual(byKind(V("ann"), 1).by_subject_kind, { entity: { looked: 1, ran_and_found_nothing: 1 } });
  /* For every reader and bound it is exactly the projection of looked. */
  for (const viewer of [V("vera"), V("ann"), MACHINE, ...DENY])
    for (const limit of [1, 2, 3, 500]) {
      const f = byKind(viewer, limit);
      const proj = {};
      for (const r of f.looked) {
        proj[r.subject_kind] = proj[r.subject_kind] || { looked: 0, ran_and_found_nothing: 0 };
        proj[r.subject_kind].looked += 1;
        if (r.state === "LOOKED_ABSENT") proj[r.subject_kind].ran_and_found_nothing += 1;
      }
      assert.deepEqual(f.by_subject_kind, proj, `${viewer} ${limit}`);
      assert.ok(f.looked.every((r) => r.ran_and_found_nothing === (r.state === "LOOKED_ABSENT")));
    }
});

test("R36, R45: a meaning entry is the subject's latest row, newest first, one per subject, with its state, authority, actor class, referent, detail, condition, at, governed as a boolean, last_verified and unreachable_since; the earlier rows stay in the tally", () => {
  const w = world();
  const c = w.cap("a", "a");
  w.doc("INFO-1", {}, { captures: [c] });
  meaningRow(w, "capture", c.sha, "PRESENT", { authority: "INFO-1", actor_class: "machine", actor: "class:member",
    result_kind: "reading", result_ref: c.sha, detail: "found 2 entities", at: "2026-09-28T01:00:00Z" });
  meaningRow(w, "reference", "person:12", "LOOKED_ABSENT", { authority: c.sha, detail: "no registry entry", at: "2026-09-28T02:00:00Z" });
  meaningRow(w, "entity", "ENT-1", "LOOKED_ABSENT", { detail: "no pair to form", at: "2026-09-28T03:00:00Z" });
  meaningRow(w, "entity", "ENT-1", "PRESENT", { result_kind: "entity", result_ref: "ENT-1", at: "2026-09-28T04:00:00Z" });
  meaningRow(w, "entity", "ENT-1", "LOOKED_INDETERMINATE", { condition: "timeout", governed: true, at: "2026-09-28T05:00:00Z" });
  const f = w.retrieval.frontier({ level: "meaning", viewer: V("vera") });
  assert.deepEqual(f.looked.map((r) => [r.subject_kind, r.subject]), [["entity", "ENT-1"], ["reference", "person:12"], ["capture", c.sha]]);
  const [e, r, k] = f.looked;
  assert.deepEqual([e.state, e.condition, e.governed, e.at, e.last_verified, e.unreachable_since, e.ran_and_found_nothing],
    ["LOOKED_INDETERMINATE", "timeout", true, "2026-09-28T05:00:00Z", "2026-09-28T04:00:00Z", "2026-09-28T05:00:00Z", false]);
  assert.deepEqual([r.state, r.authority_kind, r.authority, r.result_kind, r.result_ref, r.detail, r.governed, r.ran_and_found_nothing],
    ["LOOKED_ABSENT", "derive", c.sha, null, null, "no registry entry", false, true]);
  assert.deepEqual([k.state, k.authority, k.actor_class, k.result_kind, k.result_ref, k.detail, k.last_verified, k.unreachable_since],
    ["PRESENT", "INFO-1", "machine", "reading", c.sha, "found 2 entities", "2026-09-28T01:00:00Z", null]);
  assert.deepEqual(f.tally, { PRESENT: 2, LOOKED_ABSENT: 2, LOOKED_INDETERMINATE: 1 });
});
