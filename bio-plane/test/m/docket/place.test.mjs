/* docket: placing in public, signed (R4–R6), what the group lists and never trims (R7, R8), standing (R10), take-back
   (R11) and withdrawal (R12), at the module's interface. Every refusal is shown with its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, world, file, prepare, sign, post, fileAndPlace, V, MACHINE, CASE, SUBJECT, SUBJECT_NAME, NOW, HOUR, DAY, sha, keyFor }
  from "./fixture.mjs";
import { DOCKET_CHECKS, ENTRY_FORMAT, ENTRY_KINDS, OUTWARD_ACT_WARNING, RECEIPT_REASON, RESEND_INVITATION }
  from "../../../src/docket/index.mjs";
import { docketStatement, NS_RATIFY, verifySshsig, NS_DOCKET } from "../../../src/sshsig.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";

const A = V("alice");
const rowOk = (r, code) => {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 300));
  assert.equal(r.reason, code);
  assert.equal(r.code, code);
  assert.equal(r.check, DOCKET_CHECKS[code].check);
  assert.equal(r.translation, DOCKET_CHECKS[code].translation);
};
function refusedThenAccepted(w, bad, good, code) {
  const before = w.snapshot();
  const r = bad();
  if (code === "NO_SUCH_CASE") assert.equal(r.reason, code); else rowOk(r, code);
  assert.deepEqual(w.snapshot(), before, `${code}: nothing written`);
  const ok = good();
  assert.equal(ok.ok, true, `${code}'s control: ${JSON.stringify(ok).slice(0, 300)}`);
  return r;
}
const fields = (p) => JSON.parse(p.entry);

test("R4 R18 the caller's refusals in order: machine, NO_SUCH_CASE, not the manager, no group slug; each writes nothing", () => {
  const w = seeded();
  const e = file(w).entry;
  const ok = () => prepare(w, { kind: "response", entry: e });
  for (const who of [MACHINE, "token:operator", "class:admin", null])
    refusedThenAccepted(w, () => prepare(w, { kind: "response", entry: e, by: who, viewer: who }), ok, "MACHINE_CANNOT_PLACE_DOCKET");
  assert.equal(prepare(w, { kind: "response", entry: e }, "dave").reason, "NO_SUCH_CASE");
  assert.equal(prepare(w, { kind: "response", entry: e, case: "CASE-2026-9999" }).reason, "NO_SUCH_CASE");
  refusedThenAccepted(w, () => prepare(w, { kind: "response", entry: e }, "bob"), ok, "DOCKET_NOT_THE_MANAGER");
  const bare = world({ slug: null });
  bare.member("alice");
  bare.P = bare.project("budget", "alice");
  bare.publish(bare.P, CASE, 1, [{ id: "INQ-2026-0001-x", role: "load_bearing" }]);
  rowOk(prepare(bare, { kind: "edition", edition: 1 }), "DOCKET_NO_GROUP_SLUG");
  /* order: a machine on an absent case is the machine refusal; bob on an absent case is NO_SUCH_CASE */
  rowOk(prepare(w, { kind: "response", entry: e, case: "CASE-2026-9999", by: MACHINE, viewer: MACHINE }), "MACHINE_CANNOT_PLACE_DOCKET");
  assert.equal(prepare(w, { kind: "response", entry: e, case: "CASE-2026-9999" }, "bob").reason, "NO_SUCH_CASE");
});

test("R4 the entry: NO_SUCH_DOCKET_ENTRY, DOCKET_ENTRY_SETTLED, then R1's form checks again on the entry it would sign", async () => {
  const w = seeded();
  const e = file(w).entry;
  refusedThenAccepted(w, () => prepare(w, { kind: "response", entry: "DKT-2026-9999" }), () => prepare(w, { kind: "response", entry: e }),
                      "NO_SUCH_DOCKET_ENTRY");
  rowOk(prepare(w, { kind: "response" }), "NO_SUCH_DOCKET_ENTRY");
  await post(w, { kind: "response", entry: e });
  rowOk(prepare(w, { kind: "response", entry: e }), "DOCKET_ENTRY_SETTLED");
  /* the form again: a subject no longer named by the edition */
  const g = file(w).entry;
  w.subjects.delete(w.F1);
  rowOk(prepare(w, { kind: "response", entry: g }), "DOCKET_NOT_THE_SUBJECT");
  w.subjects.set(w.F1, SUBJECT);
  /* a capture whose origin the register no longer holds */
  w.st.sql.exec(`DELETE FROM captured_locators WHERE capture_sha=?`, w.cap.sha);
  refusedThenAccepted(w, () => prepare(w, { kind: "response", entry: g }), () => prepare(w, { kind: "response", entry: file(w, { capture: w.swept.sha }).entry }),
                      "DOCKET_NO_CAPTURE");
  /* the kind placed is the entry's own; the edition named, when named, is the entry's */
  const s = file(w, { capture: w.swept.sha }).entry;
  rowOk(prepare(w, { kind: "statement", entry: s }), "DOCKET_KIND_UNKNOWN");
  rowOk(prepare(w, { kind: "response", entry: s, edition: 2 }), "DOCKET_NO_EDITION");
  assert.equal(prepare(w, { kind: "response", entry: s, edition: 1 }).ok, true);
  rowOk(prepare(w, { kind: "pamphlet" }), "DOCKET_KIND_UNKNOWN");
});

test("R4 the shelf, a reaction's summary and its archive copy", () => {
  const w = seeded();
  const react = (x = {}) => file(w, { kind: "reaction", from: { kind: "other", name: "The Daily Example" }, ...x }).entry;
  const r = react();
  const ok = () => prepare(w, { kind: "reaction", entry: r, shelf: "reactions", summary: "A column calling the case unfair." });
  refusedThenAccepted(w, () => prepare(w, { kind: "reaction", entry: r, shelf: "listed", summary: "x" }), ok, "DOCKET_WRONG_SHELF");
  const e = file(w).entry;
  rowOk(prepare(w, { kind: "response", entry: e, shelf: "reactions" }), "DOCKET_WRONG_SHELF");
  rowOk(prepare(w, { kind: "withdrawal", edition: 1, reason: "r", shelf: "record" }), "DOCKET_WRONG_SHELF");
  for (const summary of [null, "", "s".repeat(601), "one\n\ntwo paragraphs"])
    refusedThenAccepted(w, () => prepare(w, { kind: "reaction", entry: r, shelf: "reactions", summary }), ok, "DOCKET_NO_SUMMARY");
  assert.equal(prepare(w, { kind: "reaction", entry: r, shelf: "reactions", summary: "s".repeat(600) }).ok, true);
  const unarchived = react({ capture: w.bare.sha });
  refusedThenAccepted(w, () => prepare(w, { kind: "reaction", entry: unarchived, shelf: "reactions", summary: "A column." }), ok,
                      "DOCKET_NO_ARCHIVE_COPY");
  /* a summary given on the listed shelf is held to the same shape */
  rowOk(prepare(w, { kind: "response", entry: e, summary: "a\n\nb" }), "DOCKET_NO_SUMMARY");
});

test("R4 R6 the answer: the entry as canonical JSON, its digest, the statement, the warning and expires; identical bytes for the same inputs that day", () => {
  const w = seeded();
  const e = file(w).entry;
  const p = prepare(w, { kind: "response", entry: e, summary: "The subject disputes the totals." });
  assert.equal(p.ok, true);
  const j = fields(p);
  assert.equal(p.entry, canonicalJson(j), "the entry is record-grammar's canonical JSON");
  assert.equal(p.digest, sha(p.entry));
  assert.equal(p.statement, new TextDecoder().decode(docketStatement(CASE, 1, p.digest)));
  assert.deepEqual(p.warning, OUTWARD_ACT_WARNING);
  assert.equal(p.expires, "2026-10-01T13:00:00Z", "60 minutes later");
  assert.deepEqual(j, { format: ENTRY_FORMAT, group: "test-group", case: CASE, seq: 1, previous: null, shelf: "listed", kind: "response",
                        edition: 1, date: "2026-10-01", received: "2026-10-01", from: SUBJECT_NAME,
                        capture: { sha256: w.cap.sha, origin: w.cap.origin, archived: w.cap.archived },
                        summary: "The subject disputes the totals." });
  const before = w.snapshot();
  w.clock.now = NOW + 30 * 60e3;
  const again = prepare(w, { kind: "response", entry: e, summary: "The subject disputes the totals." });
  assert.equal(JSON.stringify(again), JSON.stringify(p), "byte for byte");
  assert.deepEqual(w.snapshot(), before, "prepare writes nothing");
});

test("R5 docketPost: refusals in order, each writing nothing; then the entry stored with its signature and first-published instant", async () => {
  const w = seeded();
  const e = file(w).entry;
  const p = prepare(w, { kind: "response", entry: e });
  const go = (x = {}) => w.docket.docketPost({ digest: p.digest, signature: sign(p), acknowledged: true, by: A, viewer: A, ...x });
  const before = w.snapshot();
  for (const who of [MACHINE, "token:operator", null]) rowOk(await go({ by: who, viewer: who }), "MACHINE_CANNOT_PLACE_DOCKET");
  rowOk(await go({ by: V("bob"), viewer: V("bob") }), "DOCKET_STALE");          /* nothing prepared by bob */
  for (const acknowledged of [false, "true", 1, null]) rowOk(await go({ acknowledged }), "DOCKET_WARNING_NOT_ACKNOWLEDGED");
  rowOk(await go({ digest: "0".repeat(64) }), "DOCKET_STALE");
  for (const signature of ["", "garbage", sign(p, "alice", NS_RATIFY), sign(p, "bob")]) {
    const r = await go({ signature });
    rowOk(r, "DOCKET_SIGNATURE_REFUSED");
    assert.ok(r.verifier);
  }
  assert.deepEqual(w.snapshot(), before, "nothing written by any refusal");
  /* alice demoted from owner between prepare and post: R4's caller refusals again at this instant */
  w.join(w.P, "alice", "joined", false);
  rowOk(await go(), "DOCKET_NOT_THE_MANAGER");
  w.join(w.P, "alice", "joined", true);
  const ok = await go();
  assert.deepEqual(ok, { ok: true, case: CASE, seq: 1, entry: `${CASE}#1`, published_at: "2026-10-01T12:00:00Z" });
  const pub = await w.docket.docketPublic({ case: CASE });
  assert.equal(pub.entries[0].json, p.entry);
  assert.equal(pub.entries[0].signature, sign(p));
  assert.equal((await verifySshsig(pub.entries[0].signature, docketStatement(CASE, 1, pub.entries[0].digest), NS_DOCKET, [keyFor("alice").b64])).ok, true);
  assert.equal(w.docket.docketOf({ case: CASE, viewer: A }).entries.find((x) => x.entry === e).state, "placed");
  rowOk(await go(), "DOCKET_STALE");     /* posted once; the held answer is spent */
});

test("R5 DOCKET_STALE: past expires, or the docket moved since (another entry took the seq, the record entry settled)", async () => {
  const w = seeded();
  const e1 = file(w).entry, e2 = file(w).entry;
  const p = prepare(w, { kind: "response", entry: e1 });
  w.clock.now = NOW + HOUR + 1000;
  rowOk(await w.docket.docketPost({ digest: p.digest, signature: sign(p), acknowledged: true, by: A, viewer: A }), "DOCKET_STALE");
  w.clock.now = NOW;
  const q1 = prepare(w, { kind: "response", entry: e1 });
  const q2 = prepare(w, { kind: "response", entry: e2 });
  assert.equal(fields(q1).seq, 1);
  assert.equal(fields(q2).seq, 1);
  /* e1 and e2 sign to the same bytes: the later prepare (e2's) holds the digest, so the post places e2, never e1 */
  assert.equal(q2.digest, q1.digest);
  assert.equal((await w.docket.docketPost({ digest: q2.digest, signature: sign(q2), acknowledged: true, by: A, viewer: A })).ok, true);
  const states = w.docket.docketOf({ case: CASE, viewer: A }).entries.filter((x) => x.shelf === "record");
  assert.deepEqual(states.map((x) => [x.entry, x.state]), [[e1, "pending"], [e2, "placed"]]);
  rowOk(await w.docket.docketPost({ digest: q1.digest, signature: sign(q1), acknowledged: true, by: A, viewer: A }), "DOCKET_STALE");
  const r = prepare(w, { kind: "response", entry: e1 });
  assert.equal(fields(r).seq, 2);
  assert.equal(fields(r).previous, (await w.docket.docketPublic({ case: CASE })).entries[0].digest, "previous is the prior entry's digest");
  w.docket.docketDecline({ entry: e1, reason: "It contains redactions.", by: A, viewer: A });
  rowOk(await w.docket.docketPost({ digest: r.digest, signature: sign(r), acknowledged: true, by: A, viewer: A }), "DOCKET_STALE");
});

test("R6 every kind carries only R6's fields, and no member's name, handle or id", async () => {
  const w = seeded();
  w.publish(w.P, CASE, 2, [{ id: w.F1, role: "load_bearing" }], { whatChanged: "Corrected the totals in the second table." });
  const grant = await post(w, { kind: "standing-granted", edition: 1, holder: "The Tenants' Union", reason: "They are named in the case." });
  const seen = [];
  const add = (p) => { seen.push(fields(p.prepared)); return p; };
  add(grant);
  add((await fileAndPlace(w)).posted);
  add((await fileAndPlace(w, { kind: "statement", capture: w.swept.sha })).posted);
  add((await fileAndPlace(w, { kind: "reaction", from: { kind: "other", name: "The Daily Example" } }, { summary: "A column." })).posted);
  add((await fileAndPlace(w, { kind: "outcome", from: { kind: "other", name: "The council" } })).posted);
  add(await post(w, { kind: "edition", edition: 2 }));
  add(await post(w, { kind: "disclosure", edition: 2, candidate: "CAND-1", summary: "An open conflict on F1." }));
  const rec = file(w).entry;
  add(await post(w, { kind: "receipt", entry: rec, reason: "Its second page names a neighbour." }));
  add(await post(w, { kind: "take-back", edition: 2, takesBack: 6, reason: "Placed twice." }));
  add(await post(w, { kind: "standing-withdrawn", edition: 1, grant: 1, reason: "The union asked to stop." }));
  add(await post(w, { kind: "withdrawal", edition: 1, reason: "Edition 1 overstated the totals." }));
  const ALLOWED = new Set(["format", "group", "case", "seq", "previous", "shelf", "kind", "edition", "date", "received", "from", "capture",
                           "summary", "what_changed", "reason", "holder", "answers", "takes_back"]);
  assert.deepEqual(seen.map((j) => j.kind).sort(), [...ENTRY_KINDS].sort(), "every kind was published");
  for (const j of seen) {
    for (const k of Object.keys(j)) assert.ok(ALLOWED.has(k), `${j.kind} carries ${k}`);
    assert.equal(j.format, ENTRY_FORMAT);
    assert.equal(j.group, "test-group");
    assert.equal(j.case, CASE);
    assert.ok(["listed", "reactions"].includes(j.shelf));
    assert.ok(j.edition === "all" || Number.isInteger(j.edition));
    assert.match(j.date, /^\d{4}-\d{2}-\d{2}$/);
    if (j.capture) assert.deepEqual(Object.keys(j.capture).sort(), ["archived", "origin", "sha256"]);
    const text = JSON.stringify(j);
    for (const m of ["alice", "bob", "carol", "dave"]) assert.ok(!text.includes(m), `${j.kind} names no member (${m})`);
  }
  const by = (k) => seen.find((j) => j.kind === k);
  assert.equal(by("edition").what_changed, "Corrected the totals in the second table.", "quotes the edition's What changed (case-grammar R8)");
  assert.equal(by("disclosure").answers, "CAND-1");
  assert.equal(by("standing-granted").holder, "The Tenants' Union");
  assert.deepEqual([by("standing-withdrawn").holder, by("standing-withdrawn").answers], ["The Tenants' Union", 1]);
  assert.equal(by("take-back").takes_back, 6);
  assert.equal(by("reaction").from, "The Daily Example");
  assert.equal(by("response").from, SUBJECT_NAME, "the subject's canonical name as the registry holds it");
  seen.forEach((j, i) => assert.equal(j.seq, i + 1, "seq 1, 2, … per case"));
  for (let i = 1; i < seen.length; i++)
    assert.equal(seen[i].previous, sha(canonicalJson(seen[i - 1])), "previous is the prior entry's digest");
});

test("R7 R19 a response or statement placed on listed is listed whole: R14 answers its capture's bytes exactly as captured", async () => {
  const w = seeded();
  await fileAndPlace(w);
  await fileAndPlace(w, { kind: "statement", capture: w.swept.sha });
  const pub = await w.docket.docketPublic({ case: CASE });
  assert.equal(Buffer.from(pub.captures[w.cap.sha], "base64").toString("utf8"), w.cap.bytes.toString("utf8"));
  assert.deepEqual(Buffer.from(pub.captures[w.swept.sha], "base64"), w.swept.bytes);
  assert.ok(!("redact" in w.docket) && !("docketRedact" in w.docket), "no act here alters, trims or redacts a submission");
});

test("R7 docketDecline: refusals in order, each writing nothing; a decline for redactions publishes nothing", async () => {
  const w = seeded();
  const e = file(w).entry;
  const decline = (x = {}, who = "alice") => w.docket.docketDecline({ entry: e, reason: "It contains redactions.", by: V(who), viewer: V(who), ...x });
  refusedThenAccepted(w, () => decline({ by: MACHINE, viewer: MACHINE }), () => ({ ok: true }), "MACHINE_CANNOT_PLACE_DOCKET");
  refusedThenAccepted(w, () => decline({ entry: "DKT-2026-9999" }), () => ({ ok: true }), "NO_SUCH_DOCKET_ENTRY");
  refusedThenAccepted(w, () => decline({}, "dave"), () => ({ ok: true }), "NO_SUCH_DOCKET_ENTRY");
  refusedThenAccepted(w, () => decline({}, "bob"), () => ({ ok: true }), "DOCKET_NOT_THE_MANAGER");
  for (const reason of ["", null, "r".repeat(2001)]) refusedThenAccepted(w, () => decline({ reason }), () => ({ ok: true }), "DOCKET_NO_REASON");
  const ok = decline();
  assert.equal(ok.ok, true);
  assert.equal(ok.state, "declined");
  assert.equal(ok.published, false);
  assert.equal(w.count("docket_entries"), 0, "nothing is published");
  rowOk(decline(), "DOCKET_ENTRY_SETTLED");
  rowOk(prepare(w, { kind: "response", entry: e }), "DOCKET_ENTRY_SETTLED");
  const x = w.docket.docketOf({ case: CASE, viewer: A }).entries.find((y) => y.entry === e);
  assert.deepEqual([x.state, x.declined.reason], ["declined", "It contains redactions."]);
  /* a reaction, or a submission from anyone without standing, is listed only by the group's choice */
  const r = file(w, { kind: "reaction", from: { kind: "other", name: "A blog" } }).entry;
  assert.equal(w.docket.coreDue({ viewer: A }).items.some((i) => i.ref === r), false, "never core (R9)");
});

test("R8 R19 a receipt lists a reply naming a private person by date, from and reason, with no text and no bytes; the resent reply is listed whole", async () => {
  const w = seeded();
  const e = file(w).entry;
  rowOk(prepare(w, { kind: "receipt", entry: e }), "DOCKET_NO_REASON");
  const other = file(w, { kind: "outcome", from: { kind: "other", name: "The council" } }).entry;
  rowOk(prepare(w, { kind: "receipt", entry: other, reason: "names a neighbour" }), "DOCKET_NO_STANDING");
  const r = await post(w, { kind: "receipt", entry: e, reason: "Its second page names a neighbour." });
  const j = fields(r.prepared);
  assert.deepEqual(j, { format: ENTRY_FORMAT, group: "test-group", case: CASE, seq: 1, previous: null, shelf: "listed", kind: "receipt",
                        edition: 1, date: "2026-10-01", received: "2026-10-01", from: SUBJECT_NAME,
                        reason: `${RECEIPT_REASON}: Its second page names a neighbour.` });
  const pub = await w.docket.docketPublic({ case: CASE });
  assert.deepEqual(pub.captures, {}, "no bytes for a receipt");
  assert.ok(!JSON.stringify(pub).includes(w.cap.sha), "nor its capture's hash or text");
  assert.equal(w.docket.docketOf({ case: CASE, viewer: A }).entries.find((x) => x.entry === e).state, "receipted");
  /* the invitation: a read, prefilled, sending nothing */
  const before = w.snapshot();
  const inv = w.docket.docketInvitation({ entry: e, viewer: V("bob") });
  assert.equal(inv.ok, true);
  assert.equal(inv.invitation.code, RESEND_INVITATION.code);
  assert.deepEqual([inv.from, inv.received, inv.receipt.seq, inv.invitation.answers], [SUBJECT_NAME, "2026-10-01", 1, e]);
  assert.match(inv.sends, /^nothing/);
  assert.deepEqual(w.snapshot(), before, "the invitation writes nothing");
  for (const [entry, who] of [[e, "dave"], [other, "bob"], ["DKT-2026-9999", "bob"]])
    rowOk(w.docket.docketInvitation({ entry, viewer: V(who) }), "NO_SUCH_DOCKET_ENTRY");
  /* the resent reply, filed naming the receipt it answers, placed whole */
  const resent = w.capture("resent");
  rowOk(file(w, { capture: resent.sha, answers: other }), "NO_SUCH_DOCKET_ENTRY");
  const f = file(w, { capture: resent.sha, answers: e });
  const placed = await post(w, { kind: "response", entry: f.entry });
  assert.equal(fields(placed.prepared).answers, 1, "it answers the receipt's public entry");
  assert.deepEqual(Buffer.from((await w.docket.docketPublic({ case: CASE })).captures[resent.sha], "base64"), resent.bytes);
});

test("R10 standing: a holder's response filed while the grant is live has the subject's rights; one filed after its withdrawal does not", async () => {
  const w = seeded();
  rowOk(prepare(w, { kind: "standing-granted", edition: 1, reason: "named in the case" }), "DOCKET_NOT_ATTRIBUTED");
  rowOk(prepare(w, { kind: "standing-granted", edition: 1, holder: "The Tenants' Union" }), "DOCKET_NO_REASON");
  rowOk(prepare(w, { kind: "standing-granted", edition: 3, holder: "The Tenants' Union", reason: "r" }), "DOCKET_NO_EDITION");
  rowOk(file(w, { from: { kind: "holder", grant: 1 } }), "DOCKET_NO_STANDING");
  await post(w, { kind: "standing-granted", edition: 1, holder: "The Tenants' Union", reason: "They are named in the case." });
  w.clock.now = NOW + DAY;
  const before = file(w, { from: { kind: "holder", grant: 1 } });
  assert.equal(before.ok, true);
  rowOk(prepare(w, { kind: "standing-withdrawn", edition: 1, grant: 9, reason: "r" }), "NO_SUCH_DOCKET_ENTRY");
  rowOk(prepare(w, { kind: "standing-withdrawn", edition: 1, grant: 1 }), "DOCKET_NO_REASON");
  w.clock.now = NOW + 2 * DAY;
  await post(w, { kind: "standing-withdrawn", edition: 1, grant: 1, reason: "The union asked to stop." });
  rowOk(prepare(w, { kind: "standing-withdrawn", edition: 1, grant: 1, reason: "again" }), "DOCKET_NO_STANDING");
  w.clock.now = NOW + 3 * DAY;
  refusedThenAccepted(w, () => file(w, { from: { kind: "holder", grant: 1 } }), () => file(w), "DOCKET_NO_STANDING");
  const core = w.docket.coreDue({ viewer: A }).items;
  assert.ok(core.some((i) => i.ref === before.entry), "filed before the withdrawal: still core (R9 (a))");
  /* listed whole, as the subject's: placed on listed with its bytes; and declinable only as the subject's is */
  const placed = await post(w, { kind: "response", entry: before.entry });
  assert.equal(fields(placed.prepared).from, "The Tenants' Union");
  assert.equal(w.count("docket_entries"), 3, "a grant is never deleted");
});

test("R11 a take-back names an earlier public entry with a reason; both stay answered; a withdrawal or a take-back is final", async () => {
  const w = seeded();
  const { posted } = await fileAndPlace(w);
  rowOk(prepare(w, { kind: "take-back", edition: 1, takesBack: 1 }), "DOCKET_NO_REASON");
  rowOk(prepare(w, { kind: "take-back", edition: 1, takesBack: 9, reason: "r" }), "NO_SUCH_DOCKET_ENTRY");
  const t = await post(w, { kind: "take-back", edition: 1, takesBack: 1, reason: "Placed against the wrong edition." });
  const pub = await w.docket.docketPublic({ case: CASE });
  assert.equal(pub.entries.length, 2, "both stay answered");
  assert.deepEqual(pub.entries[0].taken_back, { seq: 2, date: "2026-10-01" });
  assert.equal(pub.entries[1].taken_back, null);
  assert.equal(pub.entries[0].json, posted.prepared.entry, "the earlier entry is unchanged");
  refusedThenAccepted(w, () => prepare(w, { kind: "take-back", edition: 1, takesBack: 1, reason: "again" }), () => ({ ok: true }), "DOCKET_ENTRY_SETTLED");
  refusedThenAccepted(w, () => prepare(w, { kind: "take-back", edition: 1, takesBack: t.seq, reason: "undo" }), () => ({ ok: true }), "DOCKET_TAKE_BACK_FINAL");
  const wd = await post(w, { kind: "withdrawal", edition: 1, reason: "Edition 1 overstated the totals." });
  refusedThenAccepted(w, () => prepare(w, { kind: "take-back", edition: 1, takesBack: wd.seq, reason: "undo" }), () => ({ ok: true }), "DOCKET_WITHDRAWAL_FINAL");
});

test("R12 a withdrawal names one edition or all (those ratified at its post), with a reason; never repeated or lifted; withdrawalOf answers it", async () => {
  const w = seeded();
  w.publish(w.P, CASE, 2, [{ id: w.F1, role: "load_bearing" }]);
  rowOk(prepare(w, { kind: "withdrawal", edition: 1 }), "DOCKET_NO_REASON");
  rowOk(prepare(w, { kind: "withdrawal", edition: 7, reason: "r" }), "DOCKET_NO_EDITION");
  rowOk(prepare(w, { kind: "edition", edition: "all" }), "DOCKET_NO_EDITION");
  assert.equal(w.docket.withdrawalOf({ case: CASE, edition: 1 }), null);
  const one = await post(w, { kind: "withdrawal", edition: 1, reason: "Edition 1 overstated the totals." });
  assert.deepEqual(w.docket.withdrawalOf({ case: CASE, edition: 1 }),
                   { seq: 1, entry: `${CASE}#1`, date: "2026-10-01", reason: "Edition 1 overstated the totals.", digest: one.prepared.digest });
  assert.equal(w.docket.withdrawalOf({ case: CASE, edition: 2 }), null);
  refusedThenAccepted(w, () => prepare(w, { kind: "withdrawal", edition: 1, reason: "again" }),
                      () => prepare(w, { kind: "withdrawal", edition: "all", reason: "all of it" }), "DOCKET_ALREADY_WITHDRAWN");
  const all = await post(w, { kind: "withdrawal", edition: "all", reason: "We no longer stand behind the case." });
  assert.equal(fields(all.prepared).edition, "all");
  assert.equal(w.docket.withdrawalOf({ case: CASE, edition: 2 }).seq, all.seq);
  assert.equal(w.docket.withdrawalOf({ case: CASE, edition: 1 }).seq, one.seq, "the first withdrawal naming it");
  rowOk(prepare(w, { kind: "withdrawal", edition: "all", reason: "again" }), "DOCKET_ALREADY_WITHDRAWN");
  /* a later edition is not withdrawn: standing behind the case again is a new edition */
  w.publish(w.P, CASE, 3, [{ id: w.F1, role: "load_bearing" }]);
  assert.equal(w.docket.withdrawalOf({ case: CASE, edition: 3 }), null);
  assert.equal(prepare(w, { kind: "withdrawal", edition: "all", reason: "and the new one" }).ok, true);
  /* the edition itself is untouched */
  assert.equal(w.count("published_cases"), 3);
  /* R13: the withdrawal is told to reevaluation after it commits */
  assert.deepEqual(w.reeval.acted.filter((a) => a.kind === "withdrawal").map((a) => a.entry), [`${CASE}#1`, `${CASE}#2`]);
});
