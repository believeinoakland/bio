/* docket: the member's read (R3), the required core (R9), reevaluation's registration (R13), the public reads (R5's
   signers, R14, R15) and the invariants (R16, R17, R19–R22), at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, world, file, prepare, post, fileAndPlace, V, MACHINE, CASE, SUBJECT, NOW, DAY, keyFor, sha } from "./fixture.mjs";
import { DOCKET_CHECKS, DOCKET_TABLES, DOCKET_UNREADABLE, OUTWARD_ACT_WARNING, RESEND_INVITATION, CHECKPOINT_OFFER, RECEIPT_REASON,
         RECORD_STATES, CORE_KINDS, DOCKET_VOCABULARIES, SHELVES, ENTRY_KINDS, PROPOSALS, PRESSURE_KINDS, ATOM_MEDIA_TYPE, docketOps }
  from "../../../src/docket/index.mjs";
import { renderFeed } from "../../../src/docket/feed.mjs";

const A = V("alice");

test("R3 docketOf: every entry on all three shelves, oldest first, each record entry's state, the core and a contesting entry's prompts", async () => {
  const w = seeded();
  const placed = await fileAndPlace(w);
  w.clock.now = NOW + 1000;
  const declined = file(w).entry;
  w.docket.docketDecline({ entry: declined, reason: "It contains redactions.", by: A, viewer: A });
  w.clock.now = NOW + 2000;
  const receipted = file(w).entry;
  await post(w, { kind: "receipt", entry: receipted, reason: "names a neighbour" });
  w.clock.now = NOW + 3000;
  const back = file(w).entry;
  w.docket.docketFile({ case: CASE, takesBack: back, reason: "wrong case", author: V("bob"), viewer: V("bob") });
  w.clock.now = NOW + 4000;
  const contesting = file(w, { contests: true });
  w.docket.docketPressure({ entry: contesting.entry, pressure: { kind: "legal", note: "A letter." }, author: V("bob"), viewer: V("bob") });
  const before = w.snapshot();
  const d = w.docket.docketOf({ case: CASE, viewer: V("bob") });
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  assert.equal(d.ok, true);
  const ats = d.entries.map((e) => e.at);
  assert.deepEqual(ats, [...ats].sort(), "oldest first");
  assert.deepEqual(new Set(d.entries.map((e) => e.shelf)), new Set(["record", "listed"]));
  const rec = (id) => d.entries.find((e) => e.shelf === "record" && e.entry === id);
  assert.equal(rec(placed.filed.entry).state, "placed");
  assert.deepEqual(rec(placed.filed.entry).public, { seq: 1, entry: `${CASE}#1` });
  assert.deepEqual(rec(declined).declined, { reason: "It contains redactions.", at: "2026-10-01T12:00:01Z" });
  assert.equal(rec(receipted).state, "receipted");
  assert.equal(rec(back).state, "taken-back");
  assert.equal(rec(contesting.entry).state, "pending");
  for (const e of d.entries.filter((x) => x.shelf === "record")) {
    assert.ok(RECORD_STATES.includes(e.state));
    for (const k of ["proposed", "reason", "found_by", "contests", "pressure"]) assert.ok(k in e, `${k} answered`);
  }
  assert.deepEqual(rec(contesting.entry).pressure, { kind: "legal", note: "A letter.", at: "2026-10-01T12:00:04Z" });
  assert.deepEqual(rec(contesting.entry).prompts, {
    reevaluation: { cause: "contested", case: CASE, edition: 1, entry: contesting.entry, since: "2026-10-01T12:00:04Z",
                    findings: [{ bundle_id: w.F1, sha: sha(w.F1) }, { bundle_id: w.F2, sha: sha(w.F2) }] },
    checkpoint: CHECKPOINT_OFFER });
  assert.equal(rec(placed.filed.entry).prompts, undefined, "a non-contesting entry carries no prompts");
  const pub = d.entries.filter((e) => e.shelf !== "record");
  const pr = await w.docket.docketPublic({ case: CASE });
  assert.deepEqual(pub.map(({ shelf: _s, at: _a, ...x }) => x), pr.entries, "each public entry as R14 answers it");
  assert.deepEqual(d.core_due, w.docket.coreDue({ case: CASE, viewer: A }).items, "the core still due (R9)");
  assert.ok(d.core_due.some((i) => i.ref === contesting.entry));
  /* a viewer who does not see the project in full is answered as an absent case is */
  const strip = ({ case: _c, ...x }) => x;
  assert.deepEqual(strip(w.docket.docketOf({ case: CASE, viewer: V("dave") })), strip(w.docket.docketOf({ case: "CASE-2026-9999", viewer: V("bob") })));
  assert.equal(w.docket.docketOf({ case: CASE, viewer: V("dave") }).reason, "NO_SUCH_CASE");
});

test("R9 coreDue: the subject's responses and statements and a live holder's responses, newer editions, undisclosed tensions; never outcomes; only to the manager", async () => {
  const w = seeded();
  w.publish(w.P, CASE, 2, [{ id: w.F1, role: "load_bearing" }, { id: w.F2, role: "supporting" }],
            { whatChanged: "Corrected the totals.", at: NOW + 500 });
  w.tensions.edition = 2;
  w.tensions.list = [{ case: CASE, edition: 2, member: w.F1, candidate: "CAND-1", state: "open" },
                     { case: CASE, edition: 2, member: w.F2, candidate: "CAND-2", state: "open" }];   /* F2 is supporting */
  const resp = file(w).entry;
  const stmt = file(w, { kind: "statement", capture: w.swept.sha }).entry;
  const outcome = file(w, { kind: "outcome" }).entry;
  const reaction = file(w, { kind: "reaction", from: { kind: "other", name: "A blog" } }).entry;
  await post(w, { kind: "standing-granted", edition: 1, holder: "The Tenants' Union", reason: "named in the case" });
  const holderResp = file(w, { from: { kind: "holder", grant: 1 } }).entry;
  const holderStmt = file(w, { kind: "statement", from: { kind: "holder", grant: 1 } }).entry;
  const before = w.snapshot();
  const due = w.docket.coreDue({ viewer: A });
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  const refs = due.items.map((i) => `${i.kind}:${i.ref}`).sort();
  assert.deepEqual(refs, [`response:${resp}`, `statement:${stmt}`, `response:${holderResp}`, "edition:2", "tension:CAND-1"].sort());
  assert.ok(!refs.some((r) => r.includes(outcome) || r.includes(reaction) || r.includes(holderStmt)), "never an outcome, a reaction, or a holder's statement");
  for (const i of due.items) { assert.ok(CORE_KINDS.includes(i.kind)); assert.equal(i.case, CASE); assert.ok(i.since); }
  const ed = due.items.find((i) => i.kind === "edition");
  assert.deepEqual([ed.edition, ed.what_changed, ed.since], [2, "Corrected the totals.", "2026-10-01T12:00:00Z"]);
  assert.equal(due.items.find((i) => i.ref === resp).since, "2026-10-01T12:00:00Z");
  /* only the manager: bob, a joined member who does not own the project, and a machine are answered no case */
  assert.deepEqual(w.docket.coreDue({ viewer: V("bob") }).items, []);
  assert.deepEqual(w.docket.coreDue({ case: CASE, viewer: V("dave") }).items, []);
  assert.deepEqual(w.docket.coreDue({ viewer: MACHINE }).items, []);
  assert.deepEqual(w.docket.coreDue({ case: CASE, viewer: A }).items, due.items, "one case when named");
  /* each leaves when done: placed, declined, receipted; the edition entry; the disclosure */
  await post(w, { kind: "response", entry: resp });
  w.docket.docketDecline({ entry: stmt, reason: "It contains redactions.", by: A, viewer: A });
  await post(w, { kind: "receipt", entry: holderResp, reason: "names a neighbour" });
  await post(w, { kind: "edition", edition: 2 });
  await post(w, { kind: "disclosure", edition: 2, candidate: "CAND-1" });
  assert.deepEqual(w.docket.coreDue({ viewer: A }).items, []);
  /* a withdrawal is core by being itself a listed entry (R12): nothing about it is due */
  await post(w, { kind: "withdrawal", edition: 1, reason: "r" });
  assert.deepEqual(w.docket.coreDue({ viewer: A }).items, []);
});

test("R13 at start the docket fills reevaluation's registration once, and both functions page as R30 reads them", async () => {
  const w = seeded();
  assert.equal(w.reeval.registrations.length, 1);
  assert.equal(w.reeval.registrations[0].module, "docket");
  assert.deepEqual(w.docket.start(), { ok: true, module: "docket" }, "the answer is kept");
  assert.equal(w.reeval.registrations.length, 1, "once");
  const { withdrawals, contested } = w.reeval.registrations[0].fns;
  assert.deepEqual(withdrawals({}), { withdrawals: [], cursor: null });
  w.publish(w.P, CASE, 2, [{ id: w.F1, role: "load_bearing", sha: "a".repeat(64) }]);
  const c1 = file(w, { contests: true }).entry;
  const c2 = file(w, { contests: true, edition: 2 }).entry;
  file(w);
  await post(w, { kind: "withdrawal", edition: 1, reason: "Edition 1 overstated." });
  w.clock.now = NOW + DAY;
  await post(w, { kind: "withdrawal", edition: "all", reason: "None of it stands." });
  const all = withdrawals({});
  assert.deepEqual(all.withdrawals, [
    { case: CASE, project: w.P, editions: [1], findings: [{ bundle_id: w.F1, sha: sha(w.F1), edition: 1 }, { bundle_id: w.F2, sha: sha(w.F2), edition: 1 }],
      at: "2026-10-01T12:00:00Z", seq: 1, entry: `${CASE}#1` },
    { case: CASE, project: w.P, editions: [2], findings: [{ bundle_id: w.F1, sha: "a".repeat(64), edition: 2 }],
      at: "2026-10-02T12:00:00Z", seq: 2, entry: `${CASE}#2` }]);
  assert.equal(all.cursor, null);
  const p1 = withdrawals({ limit: 1 });
  assert.deepEqual([p1.withdrawals.length, p1.cursor], [1, `${CASE}#1`]);
  assert.deepEqual(withdrawals({ after: p1.cursor, limit: 1 }).withdrawals.map((x) => x.seq), [2]);
  const con = contested({});
  assert.deepEqual(con.contested.map((x) => x.entry), [c1, c2].sort());
  const one = con.contested.find((x) => x.entry === c2);
  assert.deepEqual(one, { case: CASE, edition: 2, findings: [{ bundle_id: w.F1, sha: "a".repeat(64) }], at: "2026-10-01T12:00:00Z", entry: c2 });
  const q = contested({ limit: 1 });
  assert.equal(q.contested.length, 1);
  assert.deepEqual(contested({ after: q.cursor }).contested.map((x) => x.entry), [[c1, c2].sort()[1]]);
  assert.equal(contested({ after: q.cursor }).cursor, null);
  /* the post's telling, after the commit */
  w.reeval.throws = true;
  w.publish(w.P, CASE, 3, [{ id: w.F1, role: "load_bearing" }]);
  const r = await post(w, { kind: "withdrawal", edition: 3, reason: "r" });
  assert.equal(r.ok, true, "a throw in reevaluation never undoes the withdrawal");
  assert.equal(w.docket.withdrawalOf({ case: CASE, edition: 3 }).seq, r.seq);
});

test("R5 docketSigners: each key that signed a public entry, with the instant it first did, naming no member", async () => {
  const w = seeded();
  assert.deepEqual(w.docket.docketSigners(), []);
  w.join(w.P, "bob", "joined", true);
  await post(w, { kind: "standing-granted", edition: 1, holder: "Union A", reason: "x" });
  w.clock.now = NOW + DAY;
  await post(w, { kind: "standing-granted", edition: 1, holder: "Union B", reason: "y" }, "bob");
  await post(w, { kind: "standing-granted", edition: 1, holder: "Union C", reason: "z" });
  const before = w.snapshot();
  assert.deepEqual(w.docket.docketSigners(), [{ keyB64: keyFor("alice").b64, first_signed: "2026-10-01T12:00:00Z" },
                                              { keyB64: keyFor("bob").b64, first_signed: "2026-10-02T12:00:00Z" }]);
  assert.deepEqual(w.snapshot(), before);
});

test("R14 docketPublic: public entries oldest first, each with its JSON, signature and instant, taken-back marked, listed bytes by hash, last_entry; null for no ratified edition; never the record shelf", async () => {
  const w = seeded();
  assert.equal(await w.docket.docketPublic({ case: "CASE-2026-9999" }), null);
  w.st.sql.exec(`INSERT INTO cases (case_id, project_id, opened) VALUES ('CASE-2026-0202', ?, 't')`, w.P);
  assert.equal(await w.docket.docketPublic({ case: "CASE-2026-0202" }), null, "no ratified edition answers as absent");
  const empty = await w.docket.docketPublic({ case: CASE });
  assert.deepEqual([empty.entries, empty.captures, empty.last_entry], [[], {}, null]);
  const listed = await fileAndPlace(w);
  w.clock.now = NOW + DAY;
  await fileAndPlace(w, { kind: "reaction", from: { kind: "other", name: "The Daily Example" }, capture: w.swept.sha }, { summary: "A column." });
  const rec = file(w, { proposed: "record", reason: "for us only" });
  await post(w, { kind: "receipt", entry: file(w, { capture: w.bare.sha }).entry, reason: "names a neighbour" });
  w.clock.now = NOW + 2 * DAY;
  await post(w, { kind: "take-back", edition: 1, takesBack: 1, reason: "placed twice" });
  const before = w.snapshot();
  const pub = await w.docket.docketPublic({ case: CASE });
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  assert.deepEqual(pub.entries.map((e) => e.seq), [1, 2, 3, 4]);
  for (const e of pub.entries) {
    assert.equal(sha(e.json), e.digest);
    assert.deepEqual(JSON.parse(e.json), e.fields);
    assert.match(e.signature, /^-----BEGIN SSH SIGNATURE-----/);
    assert.ok(e.published_at);
  }
  assert.deepEqual(pub.entries[0].taken_back, { seq: 4, date: "2026-10-03" });
  assert.deepEqual(Object.keys(pub.captures), [w.cap.sha], "bytes only for a listed entry's capture: never a reaction's or a receipt's");
  assert.deepEqual(Buffer.from(pub.captures[w.cap.sha], "base64"), w.cap.bytes);
  assert.equal(pub.last_entry, "2026-10-03");
  const text = JSON.stringify(pub);
  assert.ok(!text.includes(rec.entry) && !text.includes("for us only") && !text.includes('"record"'), "the record shelf never appears");
  /* bytes the evidence store cannot answer are named, never invented */
  w.evidence.m.clear();
  const unread = await w.docket.docketPublic({ case: CASE });
  assert.deepEqual([unread.captures[w.cap.sha], unread.captures_unread], [null, [w.cap.sha]]);
  assert.ok(listed.posted.ok);
});

test("R15 docketFeed: an Atom 1.0 feed of the same entries, newest first, updated at the last entry; null for no ratified edition; reading it writes nothing", async () => {
  const w = seeded();
  assert.equal(await w.docket.docketFeed({ case: "CASE-2026-9999" }), null);
  const emptyFeed = await w.docket.docketFeed({ case: CASE });
  assert.match(emptyFeed, /<updated>2026-10-01T12:00:00Z<\/updated>/, "with no entry, the latest edition's ratification");
  assert.equal((emptyFeed.match(/<entry>/g) || []).length, 0);
  await fileAndPlace(w);
  w.clock.now = NOW + DAY;
  await post(w, { kind: "take-back", edition: 1, takesBack: 1, reason: "placed twice" });
  const before = w.snapshot();
  const gets = w.evidence.gets.length;
  const feed = await w.docket.docketFeed({ case: CASE });
  assert.deepEqual(w.snapshot(), before, "every table byte-identical");
  assert.equal(w.evidence.gets.length, gets, "and nothing fetched");
  assert.ok(feed.startsWith(`<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">`));
  for (const tag of ["id", "title", "updated", "author"]) assert.match(feed, new RegExp(`^  <${tag}>`, "m"), `feed has ${tag} (RFC 4287 §4.1.1)`);
  assert.match(feed, /^  <updated>2026-10-02T12:00:00Z<\/updated>$/m, "updated is the last entry's");
  const ids = [...feed.matchAll(/<id>urn:civicos:docket:test-group:CASE-2026-0101:(\d+)<\/id>/g)].map((m) => Number(m[1]));
  assert.deepEqual(ids, [2, 1], "newest first");
  assert.equal((feed.match(/<link rel="alternate" type="application\/json" href="\?op=docketpublic&amp;case=CASE-2026-0101"\/>/g) || []).length, 3,
               "the feed and each entry link to the case's docket");
  assert.match(feed, /#1 response, edition 1, taken back/);
  const pub = await w.docket.docketPublic({ case: CASE });
  for (const e of pub.entries) assert.ok(feed.includes(e.json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;")), "each entry carries its signed JSON");
  assert.equal(ATOM_MEDIA_TYPE, "application/atom+xml");
  assert.equal(DOCKET_UNREADABLE, "Could not read the publisher's docket");
  /* pure: the same entries render the same bytes */
  assert.equal(renderFeed({ case: CASE, group: "test-group", entries: pub.entries }, null), feed);
});

test("R16 one way: a public entry is never altered or deleted; a bundle purge leaves the docket standing; only the whole-store purge clears it", async () => {
  const w = seeded();
  await fileAndPlace(w);
  file(w);
  w.docket.docketPressure({ entry: file(w).entry, pressure: { kind: "other" }, author: V("bob"), viewer: V("bob") });
  const snap = () => w.snapshot("docket_");
  const before = snap();
  /* later acts append; none rewrites */
  await post(w, { kind: "take-back", edition: 1, takesBack: 1, reason: "placed twice" });
  const after = snap();
  assert.ok(after.docket_entries.startsWith(before.docket_entries.slice(0, -1)), "the first entry's row is unchanged");
  assert.deepEqual(DOCKET_TABLES, ["docket_record", "docket_marks", "docket_entries"]);
  const purge = (opts) => {
    for (let i = 0; i < 80; i++) {
      try { return w.record.purge(opts); }
      catch (e) {
        const m = /no such table: (\w+)/.exec(String(e && e.message));
        if (!m) throw e;
        w.st.db.exec(`CREATE TABLE ${m[1]} (bundle_id TEXT, project_id TEXT, project TEXT, case_id TEXT)`);
      }
    }
    throw new Error("purge: too many missing tables");
  };
  purge({ bundleId: w.P });
  purge({ bundleId: w.F1 });
  assert.deepEqual(snap(), after, "a bundle purge leaves every docket row");
  purge({});
  for (const t of DOCKET_TABLES) assert.equal(w.count(t), 0, `${t} cleared by the whole-store purge`);
});

test("R17 no docket act writes a bundle, a basis leg, an edge, a state, a strength or a grade", async () => {
  const w = seeded();
  const others = () => { const s = w.snapshot(); for (const k of Object.keys(s)) if (k.startsWith("docket_") || k === "minted_ids") delete s[k]; return s; };
  const before = others();
  const f = file(w, { contests: true });
  w.docket.docketPressure({ entry: f.entry, pressure: { kind: "legal" }, author: V("bob"), viewer: V("bob") });
  await post(w, { kind: "response", entry: f.entry });
  w.docket.docketDecline({ entry: file(w).entry, reason: "redactions", by: A, viewer: A });
  await post(w, { kind: "standing-granted", edition: 1, holder: "A union", reason: "named" });
  await post(w, { kind: "withdrawal", edition: "all", reason: "None of it stands." });
  w.docket.docketOf({ case: CASE, viewer: A });
  w.docket.coreDue({ viewer: A });
  await w.docket.docketPublic({ case: CASE });
  await w.docket.docketFeed({ case: CASE });
  assert.deepEqual(others(), before, "every other module's table (bundles, files, history, manifest, published rows) byte-identical");
});

test("R19 no sealed, confidential or redacted public entry exists: every public entry is whole, its shelf public, its kind one of R6's", async () => {
  const w = seeded();
  await fileAndPlace(w);
  await post(w, { kind: "receipt", entry: file(w).entry, reason: "names a neighbour" });
  const pub = await w.docket.docketPublic({ case: CASE });
  for (const e of pub.entries) {
    assert.ok(["listed", "reactions"].includes(e.fields.shelf));
    assert.ok(ENTRY_KINDS.includes(e.fields.kind));
    for (const k of Object.keys(e.fields)) assert.ok(!/seal|confidential|redact|private_text/.test(k), `no ${k}`);
  }
  assert.equal(pub.entries[1].fields.reason.startsWith(RECEIPT_REASON), true, "a receipt says why it carries no text");
  assert.equal(pub.entries[1].fields.capture, undefined);
});

test("R20 no outbound call and nothing pushed; no public answer names a member", async () => {
  const w = seeded();
  const calls = [];
  const real = globalThis.fetch;
  globalThis.fetch = async (...a) => { calls.push(a); throw new Error("no network here"); };
  try {
    w.join(w.P, "bob", "joined", true);
    const f = file(w, { contests: true });
    w.docket.docketPressure({ entry: f.entry, pressure: { kind: "legal" }, author: V("bob"), viewer: V("bob") });
    await post(w, { kind: "response", entry: f.entry });
    await post(w, { kind: "standing-granted", edition: 1, holder: "A union", reason: "named" }, "bob");
    await post(w, { kind: "receipt", entry: file(w).entry, reason: "names a neighbour" });
    await post(w, { kind: "withdrawal", edition: 1, reason: "r" });
    w.docket.docketInvitation({ entry: f.entry, viewer: A });
    const answers = [await w.docket.docketPublic({ case: CASE }), await w.docket.docketFeed({ case: CASE }), w.docket.docketSigners(),
                     w.docket.withdrawalOf({ case: CASE, edition: 1 }), w.reeval.registrations[0].fns.withdrawals({}),
                     w.reeval.registrations[0].fns.contested({})];
    const text = JSON.stringify(answers.slice(0, 4));
    for (const m of ["alice", "bob", "carol", "dave", "member:", "h_alice", "Cover "]) assert.ok(!text.includes(m), `no public answer names ${m}`);
  } finally { globalThis.fetch = real; }
  assert.deepEqual(calls, [], "no outbound call");
});

test("R21 no place is named in the module's outward text", () => {
  const outward = [OUTWARD_ACT_WARNING.meaning, RESEND_INVITATION.meaning, DOCKET_UNREADABLE, RECEIPT_REASON,
                   ...Object.values(DOCKET_CHECKS).map((r) => r.translation), ...Object.values(DOCKET_VOCABULARIES).flat(),
                   renderFeed({ case: CASE, group: "g", entries: [] }, "2026-10-01T00:00:00Z")];
  for (const t of outward)
    assert.doesNotMatch(t, /oakland|alameda|california|\bcity of\b|county of|san francisco/i, `no place in: ${t.slice(0, 60)}`);
});

test("R22 each refusal code is a row of this module's own table, one new family; NO_SUCH_CASE is the shared answer, with none", () => {
  const codes = Object.keys(DOCKET_CHECKS);
  assert.deepEqual(codes.sort(), ["DOCKET_ALREADY_WITHDRAWN", "DOCKET_ENTRY_SETTLED", "DOCKET_KIND_UNKNOWN", "DOCKET_NOT_ATTRIBUTED",
    "DOCKET_NOT_A_PARTICIPANT", "DOCKET_NOT_THE_MANAGER", "DOCKET_NOT_THE_SUBJECT", "DOCKET_NO_ARCHIVE_COPY", "DOCKET_NO_CAPTURE",
    "DOCKET_NO_EDITION", "DOCKET_NO_GROUP_SLUG", "DOCKET_NO_REASON", "DOCKET_NO_STANDING", "DOCKET_NO_SUMMARY", "DOCKET_SIGNATURE_REFUSED",
    "DOCKET_STALE", "DOCKET_TAKE_BACK_FINAL", "DOCKET_WARNING_NOT_ACKNOWLEDGED", "DOCKET_WITHDRAWAL_FINAL", "DOCKET_WRONG_SHELF",
    "MACHINE_CANNOT_FILE_DOCKET", "MACHINE_CANNOT_MARK_PRESSURE", "MACHINE_CANNOT_PLACE_DOCKET", "NO_SUCH_DOCKET_ENTRY",
    "PRESSURE_MARKED", "PRESSURE_REFUSED"].sort());
  const checks = Object.values(DOCKET_CHECKS).map((r) => r.check);
  assert.equal(new Set(checks).size, checks.length, "one row per code");
  for (const c of checks) assert.match(c, /^C-129\.\d+$/, "one family");
  assert.deepEqual(checks.map((c) => Number(c.split(".")[1])).sort((a, b) => a - b), codes.map((_, i) => i + 1));
  for (const r of Object.values(DOCKET_CHECKS)) {
    assert.match(r.where, /^src\/docket\/index\.mjs [#\w]+ > is-docket-[a-z]+$/);
    assert.ok(r.translation.length > 20);
  }
  assert.equal("NO_SUCH_CASE" in DOCKET_CHECKS, false);
});

test("R6 R1 R2 R4 the vocabularies and the ops map pass a call's fields through, the stamps from the query only", async () => {
  assert.deepEqual(DOCKET_VOCABULARIES, { docket_shelves: SHELVES, docket_entry_kinds: ENTRY_KINDS, docket_proposals: PROPOSALS,
                                          docket_pressure_kinds: PRESSURE_KINDS });
  const w = seeded();
  const url = (q) => new URL(`https://x/?${new URLSearchParams(q)}`);
  const ops = (q, body) => docketOps(w.docket, url(q), body);
  const f = ops({ author: "member:bob", viewer: "member:bob" },
                { case: CASE, edition: 1, kind: "response", from: { kind: "subject", entity: SUBJECT }, capture: w.cap.sha, proposed: "both",
                  reason: "r", author: "member:alice" }).docketfile();
  assert.equal(f.ok, true);
  assert.equal(w.docket.docketOf({ case: CASE, viewer: A }).entries.find((e) => e.entry === f.entry).author, "bob", "the stamp, never the body");
  const fromQuery = ops({ author: "member:bob", viewer: "member:bob", case: CASE, edition: "1", kind: "response",
                          from: JSON.stringify({ kind: "subject", entity: SUBJECT }), capture: w.cap.sha, proposed: "record", reason: "r" }).docketfile();
  assert.equal(fromQuery.ok, true);
  const p = ops({ by: A, viewer: A }, { case: CASE, kind: "response", entry: f.entry, shelf: "listed" }).docketprepare();
  assert.equal(p.ok, true);
  assert.equal(ops({ viewer: A, case: CASE }).docket().ok, true);
  assert.equal(ops({ by: A, viewer: A }, { digest: p.digest, signature: "x", acknowledged: true }).docketpost instanceof Function, true);
  assert.equal((await ops({ by: A, viewer: A }, { digest: p.digest, signature: "x", acknowledged: true }).docketpost()).reason, "DOCKET_SIGNATURE_REFUSED");
  assert.equal(ops({ author: "member:bob", viewer: "member:bob" }, { entry: fromQuery.entry, pressure: { kind: "other" } }).docketpressure().ok, true);
  assert.equal(ops({ by: A, viewer: A }, { entry: fromQuery.entry, reason: "redactions" }).docketdecline().ok, true);
  assert.equal(ops({ viewer: A, entry: fromQuery.entry }).docketinvitation().reason, "NO_SUCH_DOCKET_ENTRY");
  assert.deepEqual(Object.keys(ops({})).sort(), ["docket", "docketdecline", "docketfile", "docketinvitation", "docketpost", "docketprepare", "docketpressure"]);
});
