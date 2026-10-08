/* standards: T36's reads by capture and extent and the version known in force through a date (R38 amended, R49–R51;
   T36-15, N715, N725, N736; K1941, K1973, K2021, K2063, K2092). Driven at the module's interface over the test profile
   (`test-port-ellery`, whose zone is America/Halifax: a receipt at 18:00Z falls on the same local day). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, MACHINE, REASON, sha } from "./fixture.mjs";
import { STANDARDS_CHECKS, STANDARDS_TABLES, standardsOps } from "../../../src/standards/index.mjs";
import { EXTRACTION_CHECKS } from "../../../src/extraction/index.mjs";
import { canonicalExtent } from "../../../src/content/index.mjs";

const codeOf = (r) => (r && r.ok === false ? r.reason : "ok");
const refusalRow = (r, code) => {
  assert.equal(codeOf(r), code, JSON.stringify(r).slice(0, 300));
  const row = STANDARDS_CHECKS[code];
  assert.deepEqual([r.check, r.translation], [row.check, row.translation], code);
};
const PAGE0 = { kind: "pdf-page", page: 0 };
const HSO = "HSO 4/21 para 3";
const policy = (w, extra = {}) => w.declare({ cite: HSO, kind: "policy", issuer: "Harbour Master", ...extra });
/* a source checked on 2026-09-01 (18:00Z, 15:00 in the profile's zone), with a receipt */
const checkedSource = (w, name = "portal") => w.passage(name, { address: `https://ex.org/${name}`, retrieved: "2026-09-01T18:00:00Z" });
const through = (w, standard, day, src, extra = {}) =>
  w.s.inForceThroughRecord({ standard, through: day, source: { captureSha: src.capSha, extent: PAGE0 }, reason: REASON,
                             author: V("bob"), viewer: V("bob"), ...extra });

test("R38 version_basis reads each named capture's receipts through provenance.receiptsOfCapture (R60) and never every receipt, answering exactly as before", () => {
  const asked = [];
  let everyRead = 0;
  const w = seeded({ provenance: (prov) => ({
    receipts: (a) => { everyRead++; return prov.receipts(a); },
    receiptsOfCapture: (a) => { asked.push(a.captureSha); return prov.receiptsOfCapture(a); },
  }) });
  const v1 = w.passage("p-v1", { address: "https://ex.org/policy", retrieved: "2025-01-10T12:00:00Z" });
  const v2 = w.passage("p-v2", { address: "https://ex.org/policy", retrieved: "2025-03-20T12:00:00Z" });
  const elsewhere = w.passage("p-x", { address: "https://ex.org/other", retrieved: "2025-02-01T12:00:00Z" });
  w.passage("p-y", { address: "https://ex.org/unrelated", retrieved: "2025-02-02T12:00:00Z" });
  const old = policy(w, { text: [v1.contentId], period: { from: "2020-01-01", to: null } }).id;
  for (const captures of [[v1.capSha, elsewhere.capSha], [v2.capSha, v1.capSha]])
    refusalRow(policy(w, { text: [v2.contentId], supersedes: old, version_basis: { captures } }), "VERSION_BASIS_INVALID");
  asked.length = 0;
  const neu = policy(w, { text: [v2.contentId], supersedes: old, period: { from: null, to: null },
                          version_basis: { captures: [v1.capSha, v2.capSha] } });
  assert.equal(neu.ok, true, JSON.stringify(neu).slice(0, 300));
  assert.deepEqual(asked.sort(), [v1.capSha, v2.capSha].sort(), "only the two named captures' receipts are read");
  assert.equal(everyRead, 0, "every receipt is never read");
  assert.deepEqual([neu.version_basis.address, neu.version_basis.after, neu.version_basis.through],
                   ["ex.org/policy", "2025-01-10T12:00:00Z", "2025-03-20T12:00:00Z"]);
  assert.equal(w.s.inForceAt({ standard: neu.id, date: "2025-01-01" }).state, "not_in_force");
  assert.match(w.s.inForceAt({ standard: neu.id, date: "2025-02-15" }).why, /changed between the captures of 2025-01-10 and 2025-03-20/);
});

test("R50 inForceThroughRecord: refusals in order (MACHINE_CANNOT_DECLARE_STANDARD, NO_SUCH_STANDARD, FORCE_TEXT_NOT_HELD, THROUGH_INVALID, THROUGH_NO_SOURCE, THROUGH_AFTER_CHECK, STANDARD_NO_REASON), each writing nothing; checked retrieved against the receipt's last day, an upload kept as stated; append-only with who, when and why; withdraw (NO_SUCH_RECORD, STANDARD_NO_REASON, a repeat already) and inForceThroughOf; R5 answers the standing ones", () => {
  const w = seeded();
  const src = checkedSource(w);
  const upload = w.passage("upload");
  const s = w.declare({ period: { from: "2020-01-01", to: null } }).id;
  const cited = w.declare({ held: "cited", text: undefined, cited_by: { captureSha: src.capSha, extent: PAGE0 } });
  assert.equal(cited.ok, true, JSON.stringify(cited).slice(0, 300));
  const P = w.project("Private", "carol");
  const hidden = w.passage("hidden");
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, P, hidden.bundleId);
  w.st.sql.exec(`UPDATE content SET bundle_id=? WHERE content_id=?`, P, hidden.contentId);
  const before = w.snapshot();
  const cases = [
    [{ author: MACHINE }, "MACHINE_CANNOT_DECLARE_STANDARD"],
    [{ author: "" }, "MACHINE_CANNOT_DECLARE_STANDARD"],
    [{ merit: "high" }, "STANDARD_FIELD_UNKNOWN"],
    [{ standard: "STD-2026-9999-ordinance" }, "NO_SUCH_STANDARD"],
    [{ standard: s, viewer: "nobody" }, "NO_SUCH_STANDARD"],
    [{ standard: cited.id }, "FORCE_TEXT_NOT_HELD"],
    [{ through: "2026-02-30" }, "THROUGH_INVALID"],
    [{ through: "1 Sept 2026" }, "THROUGH_INVALID"],
    [{ through: "2019-12-31" }, "THROUGH_INVALID"],
    [{ source: null }, "THROUGH_NO_SOURCE"],
    [{ source: { captureSha: sha("never captured"), extent: PAGE0 } }, "THROUGH_NO_SOURCE"],
    [{ source: { captureSha: hidden.capSha, extent: PAGE0 } }, "THROUGH_NO_SOURCE"],
    [{ source: { captureSha: src.capSha, extent: PAGE0, note: "x" } }, "THROUGH_NO_SOURCE"],
    [{ through: "2026-09-02" }, "THROUGH_AFTER_CHECK"],
    [{ reason: "  " }, "STANDARD_NO_REASON"],
    [{ reason: undefined }, "STANDARD_NO_REASON"],
  ];
  for (const [over, code] of cases) {
    const r = through(w, s, "2026-09-01", src, over);
    assert.equal(codeOf(r), code, JSON.stringify(over));
    if (code !== "NO_SUCH_STANDARD" && code !== "STANDARD_FIELD_UNKNOWN") refusalRow(r, code);
  }
  /* order: an earlier refusal answers before a later one */
  assert.equal(codeOf(through(w, cited.id, "2019-01-01", src, { reason: "" })), "FORCE_TEXT_NOT_HELD");
  assert.equal(codeOf(through(w, s, "2019-01-01", src, { source: null })), "THROUGH_INVALID");
  assert.equal(codeOf(through(w, s, "2026-09-02", src, { reason: "" })), "THROUGH_AFTER_CHECK");
  assert.equal(codeOf(through(w, s, "2026-09-01", src, { source: null, reason: "" })), "THROUGH_NO_SOURCE");
  /* the hidden capture and one never held are answered alike */
  const notHeld = through(w, s, "2026-09-01", src, { source: { captureSha: sha("never captured"), extent: PAGE0 } });
  const unseen = through(w, s, "2026-09-01", src, { source: { captureSha: hidden.capSha, extent: PAGE0 } });
  assert.deepEqual(notHeld, unseen);
  assert.deepEqual(w.snapshot(), before, "each refusal wrote nothing");
  /* negative controls: the day of the check, and an upload stated by the member, are recorded */
  w.clock.now = "2026-09-05T10:00:00.000Z";
  const ok = through(w, s, "2026-09-01", src);
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  assert.deepEqual([ok.record.standard, ok.record.through, ok.record.checked, ok.record.checked_day, ok.record.by, ok.record.reason,
                    ok.record.at, ok.record.withdrawn, ok.record.source.captureSha],
                   [s, "2026-09-01", "retrieved", "2026-09-01", V("bob"), REASON, "2026-09-05T10:00:00Z", null, src.capSha]);
  const stated = through(w, s, "2027-03-01", upload);
  assert.equal(stated.ok, true, JSON.stringify(stated).slice(0, 300));
  assert.equal(stated.record.checked, "stated", "a source with no receipt keeps through as the member states it");
  assert.equal(stated.record.checked_day, undefined);
  /* append-only: the rows written stay as written */
  const rows = w.rows(`SELECT * FROM standard_in_force_through ORDER BY record_id`);
  assert.equal(rows.length, 2);
  /* withdraw */
  refusalRow(w.s.inForceThroughWithdraw({ record: "through-nope", reason: REASON, author: V("bob") }), "NO_SUCH_RECORD");
  refusalRow(w.s.inForceThroughWithdraw({ record: stated.record.id, reason: "", author: V("bob") }), "STANDARD_NO_REASON");
  assert.equal(codeOf(w.s.inForceThroughWithdraw({ record: stated.record.id, reason: REASON, author: MACHINE })),
               "MACHINE_CANNOT_DECLARE_STANDARD");
  const wd = w.s.inForceThroughWithdraw({ record: stated.record.id, reason: "The portal page was the draft.", author: V("carol") });
  assert.deepEqual([wd.ok, wd.withdrawn.by, wd.withdrawn.reason], [true, V("carol"), "The portal page was the draft."]);
  const again = w.s.inForceThroughWithdraw({ record: stated.record.id, reason: REASON, author: V("bob") });
  assert.deepEqual([again.ok, again.already], [true, true]);
  assert.deepEqual(w.rows(`SELECT * FROM standard_in_force_through ORDER BY record_id`), rows, "withdrawn, never edited");
  /* the reads */
  const of = w.s.inForceThroughOf({ standard: s, viewer: V("carol") });
  assert.deepEqual([of.records.map((r) => r.id), of.withdrawn.map((r) => r.id)], [[ok.record.id], [stated.record.id]]);
  assert.equal(of.withdrawn[0].withdrawn.by, V("carol"));
  assert.equal(codeOf(w.s.inForceThroughOf({ standard: s, viewer: "nobody" })), "NO_SUCH_STANDARD");
  assert.equal(codeOf(w.s.inForceThroughOf({ standard: "", viewer: V("carol") })), "STANDARD_NO_ID");
  assert.deepEqual(w.s.standardRead({ id: s, viewer: V("carol") }).in_force_through.map((r) => r.id), [ok.record.id],
                   "R5 answers the standing records only");
  /* the ops route to the acts and the read */
  const ops = (q, body) => standardsOps(w.s, new URL(`https://x/?${q}`), body);
  assert.equal(ops(`viewer=${V("bob")}`, { standard: s, through: "2026-08-01", source: { captureSha: src.capSha, extent: PAGE0 },
                                            reason: REASON, author: V("bob") }).standardinforcethrough().ok, true);
  assert.equal(ops(`id=${s}&viewer=${V("bob")}`).inforcethroughof().records.length, 2);
  assert.equal(ops(`viewer=${V("bob")}`, { record: ok.record.id, reason: REASON, author: V("bob") }).standardinforcethroughwithdraw().ok, true);
  /* the tables are declared append-only and group-sighted, as R14 declares every table */
  for (const name of ["standard_in_force_through", "standard_in_force_through_withdrawals"]) {
    const t = STANDARDS_TABLES.find((x) => x.name === name);
    assert.deepEqual([t.version_chain, t.sight, t.keys], [true, "group", ["standard_id"]], name);
  }
});

test("R50 R37 a record takes its standard's sight: a policy held at a hidden project's sight is recorded and read only by who may see it", () => {
  const w = seeded();
  const P = w.project("Source material", "alice");
  const leaked = w.passage("leaked");
  w.st.sql.exec(`UPDATE content SET bundle_id=? WHERE content_id=?`, P, leaked.contentId);
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, P, leaked.bundleId);
  const pol = policy(w, { text: [leaked.contentId], period: { from: "2020-01-01", to: null }, author: V("alice"), viewer: V("alice") });
  assert.equal(pol.sight.class, "bundle");
  const src = checkedSource(w);
  assert.equal(codeOf(through(w, pol.id, "2026-09-01", src, { author: V("carol"), viewer: V("carol") })), "NO_SUCH_STANDARD");
  const r = through(w, pol.id, "2026-09-01", src, { author: V("alice"), viewer: V("alice") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(codeOf(w.s.inForceThroughOf({ standard: pol.id, viewer: V("carol") })), "NO_SUCH_STANDARD");
  assert.equal(w.s.inForceThroughOf({ standard: pol.id, viewer: V("alice") }).records.length, 1);
  assert.deepEqual(w.s.recordedBy({ captureSha: src.capSha, viewer: V("carol") }).items, [], "counted nowhere");
  assert.deepEqual(w.s.recordedBy({ captureSha: src.capSha, viewer: V("alice") }).items.map((i) => i.kind), ["in_force_through"]);
  assert.equal(codeOf(w.s.inForceThroughWithdraw({ record: r.record.id, reason: REASON, author: V("carol"), viewer: V("carol") })),
               "NO_SUCH_RECORD");
});

test("R51 R7 R43 a version with no stated end, known in force through a date, answers in_force through it naming the record and undetermined the day after; a stated end, an override, codifier lag and two versions covering a date still decide first; the latest standing record counts and a withdrawn one none", () => {
  const w = seeded();
  const body = w.entity("Port Ellery Selectboard");
  const src = checkedSource(w);
  const s = w.declare({ issuer: body, period: { from: "2020-01-01", to: null } }).id;
  const at = (d, id = s) => w.s.inForceAt({ standard: id, date: d, viewer: V("carol") });
  assert.equal(at("2026-09-01").state, "undetermined", "before any record: a null end is not stated");
  const early = through(w, s, "2026-06-01", src);
  const rec = through(w, s, "2026-09-01", src);
  assert.equal(rec.ok, true, JSON.stringify(rec).slice(0, 300));
  const on = at("2026-09-01");
  assert.equal(on.state, "in_force");
  assert.equal(on.why, `known in force through 2026-09-01, from capture ${src.capSha.slice(0, 12)}, page 1, recorded by ${V("bob")}`);
  assert.equal(on.in_force_through.record, rec.record.id);
  assert.equal(at("2026-08-01").why, on.why, "the latest through among the standing records names the record");
  assert.equal(at("2020-01-01").state, "in_force");
  const after = at("2026-09-02");
  assert.equal(after.state, "undetermined", "the day after through");
  assert.match(after.why, /does not state when it ceased to be in force/);
  assert.equal(at("2019-12-31").state, "not_in_force");
  /* R7, the alias, answers exactly R20's state and why */
  const alias = w.s.inForce(s, "2026-09-01");
  assert.deepEqual([alias.state, alias.why], [on.state, on.why]);
  /* R43: binds up to through where the answer rests on R20 */
  const b = (d) => w.s.bindsAt({ standard: s, body, date: d, viewer: V("carol") });
  assert.equal(b("2026-09-01").state, "binds");
  assert.equal(b("2026-09-02").state, "undetermined");
  /* a withdrawn record counts for nothing: the earlier standing one decides */
  w.s.inForceThroughWithdraw({ record: rec.record.id, reason: REASON, author: V("bob") });
  assert.equal(at("2026-09-01").state, "undetermined");
  assert.equal(at("2026-06-01").state, "in_force");
  w.s.inForceThroughWithdraw({ record: early.record.id, reason: REASON, author: V("bob") });
  assert.equal(at("2026-06-01").state, "undetermined");
  assert.equal(at("2026-06-01").in_force_through, undefined);
  /* a stated end decides as before, the record answered beside it */
  const ended = w.declare({ period: { from: "2020-01-01", to: "2025-12-31" } }).id;
  through(w, ended, "2025-06-01", src);
  assert.equal(at("2026-01-01", ended).state, "not_in_force");
  assert.equal(at("2026-01-01", ended).in_force_through.through, "2025-06-01");
  /* an end event with no when is an end not stated: the record decides up to through */
  const nowhen = w.event();
  const evEnd = w.declare({ period: { from: "2020-01-01", to: null }, period_basis: { to: { event: nowhen, edge: "start" } } }).id;
  assert.equal(at("2026-01-01", evEnd).state, "undetermined");
  through(w, evEnd, "2026-09-01", src);
  assert.equal(at("2026-01-01", evEnd).state, "in_force");
  assert.equal(at("2026-09-02", evEnd).state, "undetermined");
  /* an override in force answers overridden */
  const bt = w.passage("base-text");
  const base2 = policy(w, { text: [bt.contentId], portion: { path: "12(a)", content_id: bt.contentId }, period: { from: "2020-01-01", to: null } }).id;
  through(w, base2, "2026-09-01", src);
  const ot = w.passage("override-text");
  const ov = policy(w, { cite: "HSO 9/25 para 1", text: [ot.contentId], portion: { path: "3", content_id: ot.contentId },
                         period: { from: "2026-01-01", to: "2026-12-31" }, overrides: [{ target: base2, portion: "12(a)", until: "revision" }] });
  assert.equal(ov.ok, true, JSON.stringify(ov).slice(0, 300));
  assert.equal(at("2026-06-01", base2).state, "overridden");
  assert.equal(at("2025-06-01", base2).state, "in_force");
  /* codifier lag: a codifier's copy current through an earlier day, no later version held */
  const banner = w.passage("banner").contentId;
  const cod = w.declare({ period: { from: "2020-01-01", to: null }, copy: "codifier", text: [banner],
                          current_through: { date: "2026-03-01", basis: banner } }).id;
  through(w, cod, "2026-09-01", src);
  assert.equal(at("2026-02-01", cod).state, "in_force");
  assert.match(at("2026-06-01", cod).why, /versions after 2026-03-01 not held/);
  /* two versions of one key both covering the date: undetermined, naming them */
  const v1 = policy(w, { cite: "HSO 7/22 para 2", period: { from: "2020-01-01", to: null } });
  const key = v1.instrument.key;
  assert.ok(key, JSON.stringify(v1.instrument));
  const v2 = policy(w, { cite: "HSO 7/22 para 2", period: { from: "2026-01-01", to: "2030-12-31" } });
  assert.equal(w.s.inForceAt({ key, date: "2025-06-01", viewer: V("carol") }).state, "undetermined", "v1 open-ended, v2 not yet");
  through(w, v1.id, "2026-09-01", src);
  const one = w.s.inForceAt({ key, date: "2025-06-01", viewer: V("carol") });
  assert.deepEqual([one.state, one.standard], ["in_force", v1.id]);
  const both = w.s.inForceAt({ key, date: "2026-06-01", viewer: V("carol") });
  assert.equal(both.state, "undetermined");
  assert.deepEqual(both.versions.sort(), [v1.id, v2.id].sort());
});

test("R49 recordedBy answers, in events R49's shape, every row of this module citing the capture, a content id read as its row's capture and extent: a standard's text, portion, requires, cited_by, search, copy_claimed, version_basis, force_source, target (metric, definition, recurrence), current_through basis and period_basis passages (K2116), a force's citation and criteria, an adoption's, an imposition's and an in-force-through record's source; by the act's author, at its instant, withdrawn for a superseded standard and a withdrawn force or record; never a proposal and never text; each extent content's canonical string parsed back to an object and ordered by that string (K2114); clamped and truncated; a capture not held or not visible, or a viewer membership refuses, answers none; VIEWER_MISSING, NO_SHA, EXTENT_MALFORMED", () => {
  const w = seeded();
  const body = w.entity("Harbour Master");
  const p = w.passage("cited-doc", { text: "The harbour master shall answer within 5 days." });
  const c = p.contentId;
  const X = p.capSha;
  const other = w.passage("other-doc");
  w.clock.now = "2026-09-10T00:00:00.000Z";
  const A = policy(w, { issuer: body, text: [c], portion: { path: "1", content_id: c }, requires: [c],
                        copy_claimed: { says: "draft", extent: c }, force_source: { kind: "resolution", citation: c },
                        target: { metric: { words: "days to answer", content_id: c }, threshold: { comparator: "at_most", value: "5", unit: "days" },
                                  period: { recurrence: "each quarter", content_id: c }, definition: c },
                        current_through: { date: "2026-08-01", basis: c }, period: { from: "2020-01-01", to: null },
                        period_basis: { from: { passage: c } } });
  assert.equal(A.ok, true, JSON.stringify(A).slice(0, 400));
  w.clock.now = "2026-09-11T00:00:00.000Z";
  const B = w.declare({ text: [c], author: V("carol"), viewer: V("carol") });
  const C = w.declare({ held: "cited", text: undefined, cited_by: { captureSha: X, extent: PAGE0 } });
  const D = w.declare({ held: "absent", text: undefined, search: { places: ["the city portal", { captureSha: X, extent: PAGE0 }], answer: { captureSha: X, extent: PAGE0 } } });
  assert.deepEqual([B.ok, C.ok, D.ok], [true, true, true], JSON.stringify([B, C, D]).slice(0, 400));
  const f = w.s.forceDeclare({ standard: A.id, portion: "1", force: "discretionary", holder: body, criteria: c, citation: c, reason: REASON,
                               author: V("bob"), viewer: V("bob") });
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  const ad = w.s.adoptionRecord({ standard: A.id, act: B.id, edition: "2024", from: "2024-01-01", mode: "by_reference", citation: c,
                                  reason: REASON, author: V("carol"), viewer: V("carol") });
  assert.equal(ad.ok, true, JSON.stringify(ad).slice(0, 300));
  const im = w.s.impositionRecord({ standard: A.id, body, law: B.id, citation: c, reason: REASON, author: V("bob"), viewer: V("bob") });
  assert.equal(im.ok, true, JSON.stringify(im).slice(0, 300));
  const rec = through(w, A.id, "2026-01-01", p);
  assert.equal(rec.ok, true, JSON.stringify(rec).slice(0, 300));
  w.s.standardPropose({ cite: HSO, text: [c], why: "it reads like a rule", proposer: MACHINE });
  const unrelated = w.declare({ text: [other.contentId] });
  assert.equal(unrelated.ok, true);
  /* A superseded; the force withdrawn */
  const E = policy(w, { text: [other.contentId], supersedes: A.id });
  assert.equal(E.ok, true);
  w.s.forceWithdraw({ force: f.force.id, reason: REASON, author: V("bob") });

  const r = w.s.recordedBy({ captureSha: X, viewer: V("carol") });
  assert.deepEqual(Object.keys(r).sort(), ["capture_sha", "items", "module", "ok", "truncated"]);
  assert.deepEqual([r.ok, r.module, r.capture_sha, r.truncated], [true, "standards", X, false]);
  const page = JSON.parse(canonicalExtent(PAGE0));
  const got = r.items.map((i) => `${i.record}|${i.kind}|${i.field}`).sort();
  const want = [
    ...["text", "portion", "requires", "copy_claimed", "force_source", "target.metric", "target.definition", "target.period",
        "current_through.basis", "period_basis.from"].map((x) => `${A.id}|standard|${x}`),
    `${B.id}|standard|text`, `${C.id}|standard|cited_by`, `${D.id}|standard|search`,
    `${f.force.id}|force|citation`, `${f.force.id}|force|criteria`, `${ad.adoption.id}|adoption|citation`,
    `${im.imposition.id}|imposition|citation`, `${rec.record.id}|in_force_through|source`,
  ].sort();
  assert.deepEqual(got, want);
  for (const i of r.items) {
    assert.deepEqual(Object.keys(i).sort(), ["at", "by", "extent", "field", "kind", "module", "record", "relation", "withdrawn"],
                     "no item carries a standard's text");
    assert.deepEqual([i.module, i.extent, i.relation], ["standards", page, null]);
  }
  const item = (record, field) => r.items.find((i) => i.record === record && i.field === field);
  assert.deepEqual([item(A.id, "text").by, item(A.id, "text").at, item(A.id, "text").withdrawn], [V("bob"), "2026-09-10T00:00:00Z", true],
                   "a superseded standard is marked withdrawn");
  assert.deepEqual([item(B.id, "text").by, item(B.id, "text").withdrawn], [V("carol"), false]);
  assert.deepEqual([item(f.force.id, "citation").withdrawn, item(ad.adoption.id, "citation").by], [true, V("carol")]);
  assert.equal(item(rec.record.id, "source").withdrawn, false);
  /* the order: canonical extent, then record, then field */
  const order = r.items.map((i) => [canonicalExtent(i.extent), i.record, i.field]);
  assert.deepEqual(order, [...order].sort((a, b) => (a.join("\u0000") < b.join("\u0000") ? -1 : 1)));
  /* a withdrawn record is marked */
  w.s.inForceThroughWithdraw({ record: rec.record.id, reason: REASON, author: V("bob") });
  assert.equal(w.s.recordedBy({ captureSha: X, viewer: V("carol") }).items.find((i) => i.record === rec.record.id).withdrawn, true);
  /* with an extent: same, narrower and wider only, each with its relation */
  assert.deepEqual([...new Set(w.s.recordedBy({ captureSha: X, extent: PAGE0, viewer: V("carol") }).items.map((i) => i.relation))], ["same"]);
  const whole = w.s.recordedBy({ captureSha: X, extent: { kind: "document" }, viewer: V("carol") });
  assert.equal(whole.items.length, r.items.length);
  assert.deepEqual([...new Set(whole.items.map((i) => i.relation))], ["narrower"]);
  assert.deepEqual(w.s.recordedBy({ captureSha: X, extent: { kind: "pdf-page", page: 2 }, viewer: V("carol") }).items, [], "disjoint");
  /* the limit, clamped to 1–500, truncated by reading one past */
  const two = w.s.recordedBy({ captureSha: X, limit: 2, viewer: V("carol") });
  assert.deepEqual([two.items.length, two.truncated, two.items], [2, true, r.items.slice(0, 2)]);
  assert.equal(w.s.recordedBy({ captureSha: X, limit: 0, viewer: V("carol") }).items.length, 1);
  assert.equal(w.s.recordedBy({ captureSha: X, limit: 9999, viewer: V("carol") }).items.length, r.items.length);
  /* `sha256:` and case are ignored */
  assert.equal(w.s.recordedBy({ captureSha: `sha256:${X.toUpperCase()}`, viewer: V("carol") }).items.length, r.items.length);
  /* a capture not held, or not visible, answers none, alike */
  assert.deepEqual(w.s.recordedBy({ captureSha: sha("never"), viewer: V("carol") }).items, []);
  assert.deepEqual(w.s.recordedBy({ captureSha: "abc", viewer: V("carol") }).items, []);
  assert.deepEqual(w.s.recordedBy({ captureSha: X, viewer: "nobody" }).items, []);
  /* refusals, each writing nothing */
  const before = w.snapshot();
  for (const v of [null, undefined, "", "  "]) assert.equal(w.s.recordedBy({ captureSha: X, viewer: v }).refused, "VIEWER_MISSING");
  for (const v of [7, "nobody", "member:"]) assert.deepEqual(w.s.recordedBy({ captureSha: X, viewer: v }).items, [], "a viewer membership refuses sees nothing");
  for (const s of [null, "", 7]) {
    const n = w.s.recordedBy({ captureSha: s, viewer: V("carol") });
    assert.deepEqual([n.reason, n.check], ["NO_SHA", EXTRACTION_CHECKS.NO_SHA.check]);
  }
  for (const e of ["page 1", [PAGE0], {}, { kind: "nonsense" }]) {
    const m = w.s.recordedBy({ captureSha: X, extent: e, viewer: V("carol") });
    assert.deepEqual([m.ok, m.refused, m.code, m.reason, typeof m.why], [false, "EXTENT_MALFORMED", "EXTENT_MALFORMED", "EXTENT_MALFORMED", "string"]);
  }
  assert.equal(w.s.recordedBy({ captureSha: X, extent: { kind: "pdf-page" }, viewer: V("carol") }).ok, true, "a content kind is not malformed");
  assert.doesNotThrow(() => w.s.recordedBy());
  assert.deepEqual(w.snapshot(), before);
});

test("R49 version_basis cites each capture whole, as document, and a hidden capture's rows are answered to no one who may not see it", () => {
  const w = seeded();
  const v1 = w.passage("p-v1", { address: "https://ex.org/policy", retrieved: "2025-01-10T12:00:00Z" });
  const v2 = w.passage("p-v2", { address: "https://ex.org/policy", retrieved: "2025-03-20T12:00:00Z" });
  const old = policy(w, { text: [v1.contentId], period: { from: "2020-01-01", to: null } }).id;
  const neu = policy(w, { text: [v2.contentId], supersedes: old, period: { from: null, to: null },
                          version_basis: { captures: [v1.capSha, v2.capSha] } });
  const of1 = w.s.recordedBy({ captureSha: v1.capSha, viewer: V("carol") }).items;
  assert.deepEqual(of1.map((i) => [i.record, i.field, i.extent, i.withdrawn]),
                   [[neu.id, "version_basis", { kind: "document" }, false],
                    [old, "text", JSON.parse(canonicalExtent(PAGE0)), true]]);
  assert.deepEqual(w.s.recordedBy({ captureSha: v1.capSha, extent: PAGE0, viewer: V("carol") }).items.map((i) => [i.field, i.relation]),
                   [["version_basis", "wider"], ["text", "same"]]);
  /* a capture filed only in a hidden project: its rows are answered to its owner and to no one else */
  const P = w.project("Private", "alice");
  const h = w.passage("hidden-doc");
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, P, h.bundleId);
  w.st.sql.exec(`UPDATE content SET bundle_id=? WHERE content_id=?`, P, h.contentId);
  const hs = w.declare({ text: [h.contentId], author: V("alice"), viewer: V("alice") });
  assert.equal(hs.ok, true, JSON.stringify(hs).slice(0, 300));
  assert.equal(w.s.recordedBy({ captureSha: h.capSha, viewer: V("alice") }).items.length, 1);
  assert.deepEqual(w.s.recordedBy({ captureSha: h.capSha, viewer: V("carol") }).items, []);
});
