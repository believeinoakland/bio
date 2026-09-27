/* retrieval: the frontier (R35–R50), at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, V, MACHINE, VOCAB, T0 } from "./fixture.mjs";
import { FRONTIER_LIMIT_DEFAULT, FRONTIER_LIMIT_MAX, FRONTIER_INTERNET_NOTE } from "../../../src/retrieval/index.mjs";

const LATER = "2026-09-26T00:00:00Z";           /* after T0, before the fixture's clock (every capture's registration) */
const digest = (o) => createHash("sha256").update(JSON.stringify(o)).digest("hex");

function link(w, fromCapture, address, { partition = "deferred", firstSeen = "2026-09-27T03:00:00Z", bundle = null } = {}) {
  w.st.sql.exec(`INSERT INTO links (source_bundle, source_capture, link_ref, address, address_norm, citation_norm, fragment, partition,
                 origin, chrome, captured_at, first_seen) VALUES (?,?,?,?,?,?,NULL,?,NULL,0,?,?)`,
    bundle, fromCapture, `l-${address}`, address, address, address, partition, firstSeen, firstSeen);
}
const docRow = (w, subject, state, extra = {}) => w.observe({ level: "document", subject_kind: "address", subject, state,
  authority_kind: "acquire", ...extra });

test("R35: level is document by default; any other level answers found: false, built: false, empty lists, truncated false and a note that it is not an empty frontier; limit 200 by default, clamped 1–2,000, published on every answer; never throws", () => {
  const w = world();
  const d = w.retrieval.frontier({ viewer: V("vera") });
  assert.deepEqual([d.level, d.found, d.built, d.limit], ["document", true, true, FRONTIER_LIMIT_DEFAULT]);
  const x = w.retrieval.frontier({ level: "cosmic", viewer: V("vera"), limit: 7 });
  assert.deepEqual([x.found, x.built, x.looked, x.never_looked, x.tally, x.truncated, x.limit], [false, false, [], [], {}, false, 7]);
  assert.match(x.note, /NOT an empty frontier/);
  for (const level of ["document", "content", "meaning", "internet", "cosmic"]) {
    assert.equal(w.retrieval.frontier({ level, viewer: V("vera"), limit: 0 }).limit, FRONTIER_LIMIT_DEFAULT, level);
    assert.equal(w.retrieval.frontier({ level, viewer: V("vera"), limit: 99999 }).limit, FRONTIER_LIMIT_MAX, level);
    assert.equal(w.retrieval.frontier({ level, viewer: V("vera"), limit: -4 }).limit, 1, level);
    assert.equal(w.retrieval.frontier({ level, viewer: null, limit: "x" }).limit, FRONTIER_LIMIT_DEFAULT, level);
  }
  /* Never throws: a table the reader needs is gone, and the answer says so. */
  w.st.db.exec(`ALTER TABLE links RENAME TO links_gone`);
  const broken = w.retrieval.frontier({ level: "document", viewer: V("vera") });
  assert.deepEqual([broken.failed, broken.truncated], [true, true]);
  assert.match(broken.note, /NOT an empty frontier/);
});

test("R36, R40: a built level answers found, built, level, limit, truncated, looked, never_looked, never_looked_count, tally and note; looked is the latest row per address, newest first, with state, authority, actor class, referent, detail, at, governed, last_verified and unreachable_since, and result_purged; NEVER_LOOKED is never a tally state", () => {
  const w = world();
  const c = w.cap("a", "a");
  w.doc("INFO-1", {}, { captures: [c] });
  docRow(w, "https://example.org/x", "PRESENT", { authority: "INFO-1", result_kind: "capture", result_ref: c.sha, at: "2026-09-01T00:00:00Z" });
  docRow(w, "https://example.org/x", "LOOKED_INDETERMINATE", { authority: "INFO-1", at: "2026-09-02T00:00:00Z", condition: "timeout" });
  docRow(w, "https://example.org/y", "PRESENT", { authority: "INFO-1", result_kind: "capture", result_ref: "e".repeat(64) });
  docRow(w, "https://example.org/z", "LOOKED_ABSENT", { authority: "INFO-1", governed: true, detail: "404" });
  const f = w.retrieval.frontier({ level: "document", viewer: MACHINE });
  for (const k of ["found", "built", "level", "limit", "truncated", "looked", "never_looked", "never_looked_count", "tally", "note"])
    assert.ok(Object.prototype.hasOwnProperty.call(f, k), k);
  assert.deepEqual(f.looked.map((r) => r.subject), ["https://example.org/z", "https://example.org/y", "https://example.org/x"]);
  const x = f.looked[2];
  assert.deepEqual([x.state, x.condition, x.authority_kind, x.authority, x.actor_class, x.governed, x.at],
    ["LOOKED_INDETERMINATE", "timeout", "acquire", "INFO-1", "plane", false, "2026-09-02T00:00:00Z"]);
  assert.deepEqual([x.last_verified, x.unreachable_since], ["2026-09-01T00:00:00Z", "2026-09-02T00:00:00Z"]);
  assert.equal(f.looked[0].governed, true);
  assert.deepEqual(f.looked.map((r) => r.result_purged), [null, true, null], "held, not held, no capture referent");
  assert.deepEqual(f.tally, { PRESENT: 2, LOOKED_INDETERMINATE: 1, LOOKED_ABSENT: 1 });
  assert.equal("NEVER_LOOKED" in f.tally, false);
  /* R40's held arm: a referent the record holds reads result_purged false. */
  docRow(w, "https://example.org/w", "PRESENT", { authority: "INFO-1", result_kind: "capture", result_ref: c.sha });
  assert.equal(w.retrieval.frontier({ level: "document", viewer: MACHINE }).looked[0].result_purged, false);
  assert.equal(w.retrieval.frontier({ level: "document", viewer: MACHINE, limit: 2 }).looked.length, 2);
});

test("R40, R41: never_looked is each address in the deferred partition with no document row, with from_document, in address order — read through §5.1's causes: an address held in captured_locators is pre_log in missing_unexplained, one first seen before the level's first row is undetermined; every such row carries not_ruled_out and evidence_one_sided", () => {
  const w = world();
  const c = w.cap("a", "a");
  w.doc("INFO-1", {}, { captures: [c] });
  docRow(w, "https://example.org/seen", "PRESENT", { authority: "INFO-1", at: LATER });
  link(w, c.sha, "https://example.org/b-new");                                        /* after the first row: never_looked */
  link(w, c.sha, "https://example.org/a-new");
  link(w, c.sha, "https://example.org/old", { firstSeen: "2026-09-01T00:00:00Z" });  /* before it: undetermined */
  link(w, c.sha, "https://example.org/held");                                         /* fetched before the log: pre_log */
  link(w, c.sha, "https://example.org/anchor", { partition: "anchor" });
  link(w, c.sha, "https://example.org/seen");
  w.st.sql.exec(`INSERT INTO captured_locators (address_norm, address, capture_sha, via, first_retrieved, last_retrieved, observations)
                 VALUES ('https://example.org/held', 'https://example.org/held', ?, 'direct', ?, ?, 1)`, c.sha, T0, T0);
  const f = w.retrieval.frontier({ level: "document", viewer: V("vera") });
  assert.deepEqual(f.never_looked.map((r) => [r.subject, r.from_document, r.missing_cause, r.not_ruled_out]),
    [["https://example.org/a-new", c.sha, "never_looked", ["never_looked"]],
     ["https://example.org/b-new", c.sha, "never_looked", ["never_looked"]]]);
  assert.equal(f.never_looked_count, 2);
  assert.deepEqual(f.missing_unexplained.map((r) => [r.subject, r.missing_cause, r.not_ruled_out, r.evidence_one_sided]),
    [["https://example.org/held", "pre_log", ["pre_log"], true],
     ["https://example.org/old", "purged", ["pre_log", "purged", "never_looked"], true]]);
  assert.ok(f.never_looked.every((r) => r.evidence_one_sided === true));
  assert.equal(f.missing_unexplained_count, 2);
});

test("R42, R44: content entries are each capture's latest extract row (read by authority), with indexed, indexed_determined and indexed_why, tier3_candidate, calibration_drifted and calibration_id, recandidate; recandidates are exactly those entries; the note contradicts nothing", () => {
  const w = world();
  const a = w.cap("a", "a"), b = w.cap("b", "b"), c = w.cap("c", "c");
  w.doc("INFO-1", {}, { captures: [a, b, c] });
  const ex = (cap, state, extra = {}) => w.observe({ level: "content", subject_kind: "capture", subject: cap.sha, authority_kind: "extract", authority: "INFO-1", state, ...extra });
  const ix = (cap, state) => w.observe({ level: "content", subject_kind: "capture", subject: cap.sha, authority_kind: "derive", authority: "INFO-1", state });
  ex(a, "PRESENT"); ix(a, "PRESENT");
  ex(b, "LOOKED_INDETERMINATE", { condition: "no engine bound" });
  ex(c, "PRESENT");                       /* no index observation */
  ix(b, "LOOKED_ABSENT");                 /* a derive row written LAST must not become b's entry */
  w.drift = Object.assign([{ capture_sha: c.sha, superseded_calibration: "cal-7" }], { truncated: true });
  const f = w.retrieval.frontier({ level: "content", viewer: V("vera") });
  const by = Object.fromEntries(f.looked.map((r) => [r.subject, r]));
  assert.deepEqual(Object.keys(by).length, 3);
  assert.ok(f.looked.every((r) => r.authority_kind === "extract"), "each entry is the extract row");
  assert.deepEqual([by[a.sha].state, by[a.sha].indexed, by[a.sha].indexed_determined, by[a.sha].tier3_candidate, by[a.sha].recandidate],
    ["PRESENT", "indexed_full", true, false, false]);
  assert.deepEqual([by[b.sha].state, by[b.sha].condition, by[b.sha].indexed, by[b.sha].tier3_candidate, by[b.sha].recandidate],
    ["LOOKED_INDETERMINATE", "no engine bound", "indexed_none", true, true]);
  assert.deepEqual([by[c.sha].indexed, by[c.sha].indexed_determined, by[c.sha].calibration_drifted, by[c.sha].calibration_id, by[c.sha].recandidate],
    ["undetermined", false, true, "cal-7", true]);
  assert.equal(typeof by[c.sha].indexed_why, "string");
  assert.deepEqual(f.recandidates.map((r) => r.subject).sort(), [b.sha, c.sha].sort());
  assert.equal(f.recandidate_count, 2);
  assert.equal(f.calibration_drift_truncated, true);
  for (const k of ["last_verified", "unreachable_since", "governed", "actor_class", "detail", "at"]) assert.ok(k in by[a.sha], k);
  /* R44: the note does not say the per-unit index is absent, and says where `indexed` reads undetermined. */
  assert.doesNotMatch(f.note, /does not exist in this build/);
  assert.match(f.note, /reads UNDETERMINED where the record holds none/);
});

test("R43: captures held with no content row are split by the missing-row cause — never_looked only for its own cause, every other in missing_unexplained with missing_cause and why — each cut at limit with its count, every row carrying not_ruled_out and evidence_one_sided; the answer carries missing_causes, evidence_one_sided, the vocabulary and undetermined_value", () => {
  const w = world();
  w.observe({ level: "content", subject_kind: "capture", subject: "0".repeat(64), authority_kind: "extract", state: "PRESENT", at: LATER });
  const n1 = w.cap("n1", "1"), n2 = w.cap("n2", "2"), pre = w.cap("pre", "3");
  w.doc("INFO-1", {}, { captures: [n1, n2, pre] });
  w.reading(pre.sha, "INFO-1");
  const f = w.retrieval.frontier({ level: "content", viewer: V("vera") });
  assert.deepEqual(f.never_looked.map((r) => r.subject).sort(), [n1.sha, n2.sha].sort());
  assert.ok(f.never_looked.every((r) => r.missing_cause === "never_looked" && r.evidence_one_sided === false
    && JSON.stringify(r.not_ruled_out) === '["never_looked"]'));
  assert.deepEqual(f.missing_unexplained.map((r) => [r.subject, r.missing_cause, r.why, r.not_ruled_out, r.evidence_one_sided]),
    [[pre.sha, "pre_log", VOCAB.MISSING_ROW_CAUSES.pre_log, ["pre_log"], false]]);
  assert.deepEqual([f.never_looked_count, f.missing_unexplained_count], [2, 1]);
  assert.deepEqual([f.missing_causes, f.evidence_one_sided, f.vocabulary, f.undetermined_value],
    [VOCAB.MISSING_ROW_CAUSES, VOCAB.CONTENT_EVIDENCE_IS_ONE_SIDED, VOCAB.CONTENT_AXIS_STATES, "undetermined"]);
  const cut = w.retrieval.frontier({ level: "content", viewer: V("vera"), limit: 1 });
  assert.deepEqual([cut.never_looked.length, cut.never_looked_count, cut.truncated], [1, 1, true]);
});

test("R45, R46: meaning entries span capture, reference and entity kinds, each with ran_and_found_nothing, and by_subject_kind counts over looked; the missing subjects of each kind are entered at their registration, the reference's earliest capture, the entity's creation, and split by §5.1's causes (one-sided at a reference and an entity)", () => {
  const w = world();
  const c = w.cap("a", "a"), d = w.cap("b", "b");
  w.doc("INFO-1", {}, { captures: [c, d] });
  const m = (kind, subject, state, extra = {}) => w.observe({ level: "meaning", subject_kind: kind, subject, state, authority_kind: "derive", ...extra });
  m("capture", c.sha, "PRESENT", { at: LATER, authority: "INFO-1" });
  m("reference", "the treasurer", "LOOKED_ABSENT", { authority: c.sha });
  w.st.sql.exec(`INSERT INTO entities (entity_id, kind, label, at) VALUES ('ENT-1','person','A. Person', ?), ('ENT-2','body','A Board', ?)`, T0, "2026-09-27T03:00:00Z");
  m("entity", "ENT-1", "LOOKED_ABSENT", { authority: null });
  /* Missing: capture d (registered after the first row: never_looked); a reference carried by d's reading; ENT-2 (made after
     the first row, but an entity's evidence is one-sided: its connections). */
  w.st.sql.exec(`INSERT INTO reading_refs (capture_sha, bundle_id, ref) VALUES (?, 'INFO-1', 'the auditor')`, d.sha);
  const f = w.retrieval.frontier({ level: "meaning", viewer: V("vera") });
  assert.deepEqual(f.looked.map((r) => [r.subject_kind, r.ran_and_found_nothing]).sort(),
    [["capture", false], ["entity", true], ["reference", true]]);
  assert.deepEqual(f.by_subject_kind, { entity: { looked: 1, ran_and_found_nothing: 1 }, reference: { looked: 1, ran_and_found_nothing: 1 },
                                        capture: { looked: 1, ran_and_found_nothing: 0 } });
  const all = [...f.never_looked, ...f.missing_unexplained].map((r) => [r.subject_kind, r.subject, r.missing_cause]);
  assert.deepEqual(all.sort(), [["capture", d.sha, "never_looked"], ["entity", "ENT-2", "never_looked"], ["reference", "the auditor", "never_looked"]].sort());
  const byKind = Object.fromEntries(f.never_looked.map((r) => [r.subject_kind, r]));
  assert.deepEqual([byKind.capture.evidence_one_sided, byKind.reference.evidence_one_sided, byKind.entity.evidence_one_sided], [false, true, true]);
  assert.deepEqual([f.missing_causes, f.evidence_one_sided], [VOCAB.MEANING_MISSING_ROW_CAUSES, VOCAB.MEANING_EVIDENCE_IS_ONE_SIDED]);
  /* A reading of the capture makes its missing row pre_log. */
  w.reading(d.sha, "INFO-1");
  const g = w.retrieval.frontier({ level: "meaning", viewer: V("vera") });
  assert.deepEqual(g.missing_unexplained.filter((r) => r.subject_kind === "capture").map((r) => [r.missing_cause, r.why]),
    [["pre_log", VOCAB.MEANING_MISSING_ROW_CAUSES.pre_log]]);
});

test("R37: truncated is true when a list the answer cuts held more than limit visible rows, or when a supply behind it came back full — so a viewer the gate narrows reads the same bit as an entitled one, and no answer states how much was withheld", () => {
  const w = world();
  const pub = w.cap("pub", "p");
  w.doc("INFO-1", {}, { captures: [pub] });
  const hid = Array.from({ length: 6 }, (_, i) => w.cap(`h${i}`, `h${i}`));
  w.project("Hidden", "ann", { captures: hid });
  for (const c of [pub, ...hid])
    w.observe({ level: "content", subject_kind: "capture", subject: c.sha, authority_kind: "extract", state: "PRESENT", authority: "INFO-1" });
  /* limit 1: the supply of (1+1)*2 = 4 newest rows comes back full and holds only hidden captures. vera's page is empty
     and still reads truncated — the rows beyond the supply were never fetched — exactly as ann's does. */
  const vera = w.retrieval.frontier({ level: "content", viewer: V("vera"), limit: 1 });
  const ann = w.retrieval.frontier({ level: "content", viewer: V("ann"), limit: 1 });
  assert.deepEqual([vera.looked.length, vera.truncated, ann.looked.length, ann.truncated], [0, true, 1, true]);
  assert.equal(Object.keys(vera).some((k) => /withheld|hidden/.test(k)), false);
  /* An exhausted supply: the bit reads false when nothing is cut. */
  const wide = w.retrieval.frontier({ level: "content", viewer: V("vera"), limit: 50 });
  assert.deepEqual([wide.looked.length, wide.truncated], [1, false]);
  /* The same at the document level's never-looked supply. */
  for (let i = 0; i < 5; i++) link(w, hid[i].sha, `https://example.org/h${i}`);
  const dv = w.retrieval.frontier({ level: "document", viewer: V("vera"), limit: 1 });
  const da = w.retrieval.frontier({ level: "document", viewer: V("ann"), limit: 1 });
  assert.deepEqual([dv.never_looked.length, dv.truncated, da.truncated], [0, true, true]);
});

test("R38, R29: the gate is row-whole at each level — a document row naming a hidden bundle, a capture in a hidden bundle, a reference through such a capture, and a run the viewer cannot read are absent from every list; an entity is not gated for a recognised viewer", () => {
  const w = world();
  const hid = w.cap("hid", "h");
  const proj = w.project("Hidden", "ann", { captures: [hid] });
  docRow(w, "https://example.org/secret", "PRESENT", { authority: proj });
  w.observe({ level: "content", subject_kind: "capture", subject: hid.sha, authority_kind: "extract", state: "PRESENT", authority: proj });
  w.observe({ level: "meaning", subject_kind: "capture", subject: hid.sha, authority_kind: "derive", state: "PRESENT", authority: proj });
  w.observe({ level: "meaning", subject_kind: "reference", subject: "a name", authority_kind: "derive", state: "PRESENT", authority: hid.sha });
  w.observe({ level: "meaning", subject_kind: "entity", subject: "ENT-9", authority_kind: "run", state: "PRESENT", authority: "RUN-1" });
  w.observe({ level: "meaning", subject_kind: "entity", subject: "ENT-8", authority_kind: "derive", state: "PRESENT", authority: null });
  w.runs["RUN-1"] = [V("ann")];
  link(w, hid.sha, "https://example.org/from-hidden");
  const subjects = (f) => JSON.stringify([f.looked, f.never_looked, f.missing_unexplained || []]);
  for (const level of ["document", "content", "meaning"]) {
    const v = w.retrieval.frontier({ level, viewer: V("vera") });
    const a = w.retrieval.frontier({ level, viewer: V("ann") });
    assert.doesNotMatch(subjects(v), new RegExp(`${hid.sha}|secret|a name|ENT-9|from-hidden|${proj}`), level);
    assert.ok(subjects(a).length > subjects(v).length, level);
  }
  const vm = w.retrieval.frontier({ level: "meaning", viewer: V("vera") });
  assert.deepEqual(vm.looked.map((r) => r.subject), ["ENT-8"], "the entity row with no run authority passes");
  const am = w.retrieval.frontier({ level: "meaning", viewer: V("ann") });
  assert.ok(am.looked.some((r) => r.subject === "ENT-9") && am.looked.some((r) => r.subject === "a name"));
});

test("R39: tally counts rows per state over the whole level, never the page, names nothing, and is not narrowed by the gate at document, content and meaning — but leaves out a run's rows in a project the viewer cannot see (the registered tail); at the internet level it counts only the looks the viewer may read", () => {
  const w = world();
  const hid = w.cap("hid", "h");
  const proj = w.project("Hidden", "ann", { captures: [hid] });
  w.observe({ level: "content", subject_kind: "capture", subject: hid.sha, authority_kind: "extract", state: "PRESENT", authority: proj });
  w.observe({ level: "content", subject_kind: "capture", subject: "1".repeat(64), authority_kind: "extract", state: "partial", authority: "x" });
  w.observe({ level: "content", subject_kind: "unstated", subject: "q", authority_kind: "run", state: "LOOKED_ABSENT", authority: "RUN-H" });
  const v = w.retrieval.frontier({ level: "content", viewer: V("vera"), limit: 1 });
  const a = w.retrieval.frontier({ level: "content", viewer: V("ann"), limit: 1 });
  /* No registration: a run row is left out for every viewer but a machine credential. */
  assert.deepEqual(v.tally, { PRESENT: 1, partial: 1 });
  assert.deepEqual(a.tally, v.tally, "not narrowed by the gate, not the page");
  assert.deepEqual(w.retrieval.frontier({ level: "content", viewer: MACHINE }).tally, { PRESENT: 1, partial: 1, LOOKED_ABSENT: 1 });
  assert.equal(JSON.stringify(v.tally).includes(hid.sha), false);
  /* The registered tail: ann may see RUN-H's project, vera may not. */
  w.retrieval.registerHiddenRunTail("ai-runs", (viewer) => (viewer === V("ann") ? { sql: "", args: [] }
    : { sql: ` AND NOT (authority_kind = 'run' AND COALESCE(authority, '') IN (?))`, args: ["RUN-H"] }));
  assert.deepEqual(w.retrieval.frontier({ level: "content", viewer: V("ann") }).tally, { PRESENT: 1, partial: 1, LOOKED_ABSENT: 1 });
  assert.deepEqual(w.retrieval.frontier({ level: "content", viewer: V("vera") }).tally, { PRESENT: 1, partial: 1 });
  for (const level of ["document", "meaning"]) assert.deepEqual(w.retrieval.frontier({ level, viewer: V("vera") }).tally, {}, level);
});

function leads(w) {
  const proj = w.project("Shared", "ann");
  w.st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated) VALUES (?, 'vera', 'joined', 0, ?, ?)`, proj, T0, T0);
  const lead = (id, author, words, at = T0) => w.st.sql.exec(`INSERT INTO leads (lead_id, author, words, at) VALUES (?,?,?,?)`, id, author, words, at);
  lead("LEAD-1", "vera", "the pool closed");
  lead("LEAD-2", "ann", "the pool closed", "2026-09-01T00:00:00Z");
  lead("LEAD-3", "vera", "a new tender", "2026-09-02T00:00:00Z");
  const look = (leadId, words, state, extra = {}) => w.observe({ level: "internet", subject_kind: "description", subject: words, state,
    authority_kind: "lead", authority: leadId, actor_class: "member", ...extra });
  return { proj, lead, look };
}

test("R47: the internet level reads the caller's positional member; with none the answer is empty with no_member; only the looks at leads the viewer may read, gated before the grouping, so a lead outside the viewer's reach changes no byte of the answer; entries carry lead, coverage and found_nothing, and an unreadable referent as null", () => {
  const w = world();
  const { look, lead } = leads(w);
  const hidCap = w.cap("hid", "h");
  w.project("Private", "ann", { captures: [hidCap] });
  look("LEAD-1", "the pool closed", "LOOKED_ABSENT", { at: "2026-09-05T00:00:00Z" });
  look("LEAD-1", "the pool closed", "PRESENT", { at: "2026-09-06T00:00:00Z", result_kind: "capture", result_ref: hidCap.sha });
  const none = w.retrieval.frontier({ level: "internet", viewer: MACHINE });
  assert.deepEqual([none.looked, none.never_looked, none.tally, none.truncated, none.empty.cause], [[], [], {}, false, "no_member"]);
  const before = w.retrieval.frontier({ level: "internet", viewer: V("vera") });
  assert.equal(before.looked.length, 1);
  const e = before.looked[0];
  assert.deepEqual([e.lead, e.state, e.coverage, e.found_nothing, e.result_kind, e.result_ref, e.last_verified],
    ["LEAD-1", "PRESENT", "backed", false, null, null, "2026-09-06T00:00:00Z"], "the referent vera cannot read is null");
  assert.deepEqual(before.tally, { LOOKED_ABSENT: 1, PRESENT: 1 });
  /* A lead outside vera's reach, with the SAME words, looked at later: no byte of vera's answer moves. */
  lead("LEAD-9", "ann", "the pool closed", "2026-09-03T00:00:00Z");
  look("LEAD-9", "the pool closed", "LOOKED_INDETERMINATE", { at: "2026-09-09T00:00:00Z" });
  assert.equal(digest(w.retrieval.frontier({ level: "internet", viewer: V("vera") })), digest(before));
  const ann = w.retrieval.frontier({ level: "internet", viewer: V("ann") });
  assert.ok(ann.looked.some((r) => r.lead === "LEAD-9"));
  /* The positional identity: the founder's admin viewer with an identity reads as that member. */
  assert.equal(w.retrieval.frontier({ level: "internet", viewer: "admin", identity: V("vera") }).looked.length, 1);
});

test("R48, R49: never_looked is each visible lead with no look, oldest first, with never_looked and its two fields; empty is null with an entry, never_followed with a visible lead standing, else no_leads_visible; every answer carries reads, not_read, tally_scope, evidence_one_sided, empty_causes, an empty missing_unexplained, and the member-facing vocabulary", () => {
  const w = world();
  const { look } = leads(w);
  const f = w.retrieval.frontier({ level: "internet", viewer: V("vera") });
  /* vera's own two leads, oldest first; ann's unshared LEAD-2 is outside her reach. */
  assert.deepEqual(f.never_looked.map((r) => [r.lead, r.at]), [["LEAD-3", "2026-09-02T00:00:00Z"], ["LEAD-1", T0]]);
  assert.deepEqual(w.retrieval.frontier({ level: "internet", viewer: V("ann") }).never_looked.map((r) => r.lead), ["LEAD-2"]);
  assert.ok(f.never_looked.every((r) => r.missing_cause === "never_looked" && r.subject_kind === "description"
    && JSON.stringify(r.not_ruled_out) === '["never_looked"]' && r.evidence_one_sided === false));
  assert.equal(f.empty.cause, "never_followed");
  for (const [k, v] of Object.entries({ reads: { authority_kind: "lead", subject_kind: "description" }, tally_scope: "visible_to_viewer",
                                        evidence_one_sided: VOCAB.INTERNET_EVIDENCE_IS_ONE_SIDED, empty_causes: VOCAB.INTERNET_FRONTIER_EMPTY_CAUSES,
                                        missing_unexplained: [], note: FRONTIER_INTERNET_NOTE }))
    assert.deepEqual(f[k], v, k);
  assert.deepEqual(f.not_read.map((r) => r.authority_kind), ["run", "acquire"]);
  assert.ok(f.not_read.every((r) => r.why.length > 20));
  /* R49: the vocabulary, on every answer, the empty one included. */
  assert.deepEqual(f.vocabulary, VOCAB.LEAD_VOCABULARY);
  assert.deepEqual(w.retrieval.frontier({ level: "internet", viewer: MACHINE }).vocabulary, VOCAB.LEAD_VOCABULARY);
  assert.deepEqual(Object.keys(f.vocabulary.states).sort(), Object.keys(VOCAB.OBSERVATION_STATES).sort());
  const cut = w.retrieval.frontier({ level: "internet", viewer: V("vera"), limit: 1 });
  assert.deepEqual([cut.never_looked.length, cut.truncated], [1, true]);
  look("LEAD-3", "a new tender", "LOOKED_ABSENT");
  assert.equal(w.retrieval.frontier({ level: "internet", viewer: V("vera") }).empty, null);
  /* A member with no lead in reach. */
  const w2 = world({ members: ["ann", "vera", "cid"] });
  leads(w2);
  assert.equal(w2.retrieval.frontier({ level: "internet", viewer: V("cid") }).empty.cause, "no_leads_visible");
});

test("R50: an absent or unrecognised viewer sees no entry and no never-looked or missing subject at any level, entities included", () => {
  const w = world();
  const c = w.cap("a", "a");
  w.doc("INFO-1", {}, { captures: [c] });
  docRow(w, "https://example.org/x", "PRESENT", { authority: "INFO-1" });
  link(w, c.sha, "https://example.org/y");
  w.observe({ level: "content", subject_kind: "capture", subject: c.sha, authority_kind: "extract", state: "PRESENT", authority: "INFO-1" });
  w.observe({ level: "meaning", subject_kind: "entity", subject: "ENT-1", authority_kind: "derive", state: "PRESENT" });
  w.st.sql.exec(`INSERT INTO entities (entity_id, kind, label, at) VALUES ('ENT-2','body','B', ?)`, T0);
  leads(w);
  for (const viewer of [null, undefined, "", "project:NO-SUCH", "somebody"]) {
    for (const level of ["document", "content", "meaning", "internet"]) {
      const f = w.retrieval.frontier({ level, viewer });
      assert.deepEqual([f.looked, f.never_looked, f.missing_unexplained || []], [[], [], []], `${level} ${viewer}`);
    }
  }
  /* The entitled viewer sees them, so the arm is armed against real rows. */
  assert.ok(w.retrieval.frontier({ level: "meaning", viewer: V("vera") }).looked.length > 0);
  assert.ok(w.retrieval.frontier({ level: "document", viewer: V("vera") }).looked.length > 0);
});
