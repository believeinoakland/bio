/* case-import: watching the publisher's docket (N534; DEC-101 (3), DEC-116 item 8): the watch (R17), the docket read
   and its verification (R18), what a member reads (R19), the watch's items (R20), the publisher moves `accepted-work`
   reads (R16), and the invariants over the new tables (R12–R14), at the module's interface.

   A publisher's public docket answer is built here as `docket` R24 answers it: each entry's canonical JSON, its digest
   and an armored SSHSIG over `signatures.docketStatement(case, seq, digest)` in `NS_DOCKET`, signed with real Ed25519
   keys by the release signer (`signatures` R33). The case file's manifest lists the manager's key, so an entry signed by
   it is `key_listed: true`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { rowOk, refusedThenAccepted, seeded, world, imp, caseFile, V, MACHINE, SOURCE, CASE, F1 } from "./fixture.mjs";
import { CASE_IMPORT_CHECKS, CASE_IMPORT_TABLES, DOCKET_ENTRY_FORMATS, DOCKET_UNREADABLE, NO_MOVE_SEEN, docketAddressOf,
         caseImportOps } from "../../../src/case-import/index.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";
import { NS_DOCKET, NS_RATIFY, docketStatement } from "../../../src/sshsig.mjs";
import { signSshsig, signerPublicLine } from "../../../scripts/sign-sshsig.mjs";

const PUB = "https://source.example.org";
const sha = (s) => createHash("sha256").update(s).digest("hex");

/** A signing key: the signer's envelope, its public line and wire base64, and the manifest's `{key, fingerprint}`. */
function keyFor(label) {
  const seed = createHash("sha256").update(`seed:${label}`).digest();
  const env = `BIOKEY-RAW1.bio-ratify.${seed.toString("base64")}`;
  const line = signerPublicLine(env);
  const b64 = line.split(" ")[1];
  const fingerprint = `SHA256:${createHash("sha256").update(Buffer.from(b64, "base64")).digest("base64").replace(/=+$/, "")}`;
  return { env, b64, manifest: { key: line, fingerprint } };
}
const MANAGER = keyFor("manager"), NEWER = keyFor("newer-manager");

/** One public entry as `docket` R24 answers it. `x` overrides the JSON's fields; `sign` the key, namespace or signature. */
function entry(seq, previous, fields = {}, { key = MANAGER, ns = NS_DOCKET, signature = null, json = null } = {}) {
  const f = { format: DOCKET_ENTRY_FORMATS[0], group: SOURCE, case: CASE, seq, previous, shelf: "listed", kind: "response",
              edition: 1, date: `2026-10-${String(10 + seq).padStart(2, "0")}`, ...fields };
  const text = json ?? canonicalJson(f);
  const digest = sha(text);
  return { seq, entry: `${CASE}#${seq}`, digest, json: text, fields: JSON.parse(text),
           signature: signature ?? signSshsig(key.env, docketStatement(CASE, seq, digest), ns),
           published_at: `${f.date}T10:00:00Z`, taken_back: null };
}
/** A run of entries chained from 1, each `[fields, sign?]`. */
function run(specs) {
  const out = [];
  for (const [fields, sign] of specs) out.push(entry(out.length + 1, out.length ? out[out.length - 1].digest : null, fields, sign));
  return out;
}
const answer = (entries, x = {}) => ({ ok: true, case: CASE, group: SOURCE, entries, captures: {}, captures_omitted: true,
  last_entry: entries.length ? entries[entries.length - 1].fields.date : null, feed: "x", ...x });

/** A world with alice's import of a case file whose manifest lists the manager's key, and a watch she set. */
async function watched({ watch = true, keys = [MANAGER.manifest] } = {}) {
  const w = seeded();
  const a = await imp(w, caseFile({ manifestExtra: { keys } }));
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  const r = watch ? w.ci.watchImport({ import: a.import, publisher: PUB, by: V("alice"), viewer: V("alice") }) : null;
  return { w, a, docket: docketAddressOf(PUB, CASE), watch: r };
}
const read = (w, a, ans, x = {}) => w.ci.recordDocketRead({ import: a.import, docket: docketAddressOf(PUB, CASE),
  at: "2026-10-20T06:00:00Z", outcome: "read", answer: ans, ...x });
const seen = (w, a) => w.ci.importedCase({ import: a.import, viewer: V("bob") }).docket_entries;

/* ================================================================ R17 */

test("R17 watchImport refuses, in order: R1's two, an import absent as IMPORT_NO_SUCH_EDITION, a bad address as IMPORT_WATCH_BAD_ADDRESS; each writes nothing", async () => {
  const { w, a } = await watched({ watch: false });
  const go = (x = {}, who = "alice") => w.ci.watchImport({ import: a.import, publisher: PUB, by: V(who), viewer: V(who), ...x });
  let n = 0;
  const control = () => go({ publisher: `${PUB}/copy${n++}` });
  for (const who of [MACHINE, "token:operator", null])
    await refusedThenAccepted(w, () => go({ by: who }), control, "MACHINE_CANNOT_IMPORT");
  for (const who of ["carol", "dave"]) await refusedThenAccepted(w, () => go({}, who), control, "IMPORT_NOT_A_MEMBER");
  for (const imp of ["f".repeat(64), null, ""]) await refusedThenAccepted(w, () => go({ import: imp }), control, "IMPORT_NO_SUCH_EDITION");
  for (const publisher of [null, 7, "", "http://source.example.org", "https://localhost", "https://10.0.0.1", "https://user@source.example.org",
                           `${PUB}/?op=x`, `${PUB}/?`, `${PUB}/#top`, "https://source", "ftp://source.example.org", `${PUB}/a b`])
    await refusedThenAccepted(w, () => go({ publisher }), control, "IMPORT_WATCH_BAD_ADDRESS");
  /* the order: a machine before the import, the import before the address */
  rowOk(go({ by: MACHINE, import: "f".repeat(64), publisher: "http://x" }), "MACHINE_CANNOT_IMPORT");
  rowOk(go({ import: "f".repeat(64), publisher: "http://x" }), "IMPORT_NO_SUCH_EDITION");
});

test("R17 a watch records by, the instant, the publisher and the docket address; the same address answers existed: true; another replaces it; every watch and end stays", async () => {
  const { w, a } = await watched({ watch: false });
  assert.deepEqual(w.ci.watchedImports({}).watches, [], "a watch is never a default: an imported case is not watched");
  w.clock.now = Date.parse("2026-10-05T05:05:05Z");
  const r = w.ci.watchImport({ import: a.import, publisher: `${PUB}/`, by: V("alice"), viewer: V("alice") });
  const docket = `${PUB}/?op=docketpublic&case=${encodeURIComponent(CASE)}&captures=omit`;
  assert.deepEqual(r, { ok: true, existed: false, import: a.import, group: SOURCE, case: CASE, publisher: `${PUB}/`, docket,
                        set_by: "alice", set_at: "2026-10-05T05:05:05Z", replaced: null });
  /* a case id that needs encoding is percent-encoded in the address */
  assert.equal(docketAddressOf(PUB, "CASE 1/2"), `${PUB}?op=docketpublic&case=CASE%201%2F2&captures=omit`);
  const before = w.snapshot();
  const again = w.ci.watchImport({ import: a.import, publisher: `${PUB}/`, by: V("bob"), viewer: V("bob") });
  assert.equal(again.existed, true);
  assert.equal(again.set_by, "alice");
  assert.deepEqual(w.snapshot(), before, "the same address writes nothing");
  w.clock.now = Date.parse("2026-10-06T06:06:06Z");
  const moved = w.ci.watchImport({ import: a.import, publisher: "https://moved.example.org/copy", by: V("bob"), viewer: V("bob") });
  assert.equal(moved.replaced, docket);
  assert.deepEqual(w.ci.watchedImports({}).watches.map((x) => [x.docket, x.set_by]),
                   [[docketAddressOf("https://moved.example.org/copy", CASE), "bob"]], "the new address is in force");
  const end = w.ci.unwatchImport({ import: a.import, by: V("alice"), viewer: V("alice") });
  assert.deepEqual({ ended_by: end.ended_by, ended_at: end.ended_at }, { ended_by: "alice", ended_at: "2026-10-06T06:06:06Z" });
  assert.deepEqual(w.ci.watchedImports({}).watches, []);
  assert.equal(w.count("case_import_watches"), 2, "every watch stays in the history");
  assert.equal(w.count("case_import_watch_ends"), 1);
});

test("R17 unwatchImport refuses R1's two, an absent import, and IMPORT_NOT_WATCHED when no watch is in force; each writes nothing", async () => {
  const { w, a } = await watched();
  const go = (x = {}, who = "alice") => w.ci.unwatchImport({ import: a.import, by: V(who), viewer: V(who), ...x });
  const rewatch = () => w.ci.watchImport({ import: a.import, publisher: PUB, by: V("alice"), viewer: V("alice") });
  await refusedThenAccepted(w, () => go({ by: MACHINE }), () => go(), "MACHINE_CANNOT_IMPORT");
  rewatch();
  await refusedThenAccepted(w, () => go({}, "carol"), () => go(), "IMPORT_NOT_A_MEMBER");
  rewatch();
  await refusedThenAccepted(w, () => go({ import: "e".repeat(64) }), () => go(), "IMPORT_NO_SUCH_EDITION");
  await refusedThenAccepted(w, () => go(), () => rewatch(), "IMPORT_NOT_WATCHED");
});

/* ================================================================ R18 */

test("R18 watchedImports answers each watch in force in import order, paged, with its last read; it writes nothing", async () => {
  const w = seeded();
  const ids = [];
  for (const c of ["CASE-2026-0201", "CASE-2026-0202", "CASE-2026-0203"]) {
    const a = await imp(w, caseFile({ case: c }));
    ids.push(a.import);
    w.ci.watchImport({ import: a.import, publisher: PUB, by: V("bob"), viewer: V("bob") });
  }
  ids.sort();
  const before = w.snapshot();
  const p1 = w.ci.watchedImports({ limit: 2 });
  assert.deepEqual(p1.watches.map((x) => x.import), ids.slice(0, 2));
  assert.equal(p1.cursor, ids[1]);
  const p2 = w.ci.watchedImports({ after: p1.cursor, limit: 2 });
  assert.deepEqual(p2.watches.map((x) => x.import), ids.slice(2));
  assert.equal(p2.cursor, null);
  assert.deepEqual(Object.keys(p1.watches[0]).sort(), ["case", "docket", "group", "import", "last_read", "set_at", "set_by"]);
  assert.equal(p1.watches[0].last_read, null, "never read");
  assert.deepEqual(w.snapshot(), before);
  const x = p1.watches[0];
  await w.ci.recordDocketRead({ import: x.import, docket: x.docket, at: "2026-10-20T06:00:00Z", outcome: "unreadable", reason: "http_503" });
  assert.deepEqual(w.ci.watchedImports({}).watches.find((y) => y.import === x.import).last_read,
                   { at: "2026-10-20T06:00:00Z", outcome: "unreadable", reason: "http_503" });
  assert.equal(w.ci.watchedImports({ limit: 500 }).watches.length, 3, "the limit is at most 200");
});

test("R18 recordDocketRead refuses an unknown import (IMPORT_NO_SUCH_EDITION) and an import not watched, or watched at another address (IMPORT_NOT_WATCHED); each writes nothing", async () => {
  const { w, a, docket } = await watched({ watch: false });
  const ok = () => w.ci.recordDocketRead({ import: a.import, docket, outcome: "unreadable", reason: "http_500" });
  await refusedThenAccepted(w, () => w.ci.recordDocketRead({ import: "d".repeat(64), docket, outcome: "unreadable" }),
                            () => w.ci.watchImport({ import: a.import, publisher: PUB, by: V("alice"), viewer: V("alice") }),
                            "IMPORT_NO_SUCH_EDITION");
  await refusedThenAccepted(w, () => w.ci.recordDocketRead({ import: a.import, docket: docketAddressOf("https://other.example.org", CASE),
                                                             outcome: "unreadable" }), ok, "IMPORT_NOT_WATCHED");
  w.ci.unwatchImport({ import: a.import, by: V("alice"), viewer: V("alice") });
  await refusedThenAccepted(w, ok, () => w.ci.watchImport({ import: a.import, publisher: PUB, by: V("alice"), viewer: V("alice") }),
                            "IMPORT_NOT_WATCHED");
});

test("R18 a verified run of entries: digest, form, signature against a listed key, and chain each hold", async () => {
  const { w, a } = await watched();
  const entries = run([[{ kind: "response" }], [{ kind: "edition", edition: 2, what_changed: "the payroll figure corrected" }],
                       [{ kind: "statement" }]]);
  const r = await read(w, a, answer(entries));
  assert.deepEqual({ ok: r.ok, outcome: r.outcome, new_entries: r.new_entries, new_moves: r.new_moves, new_refused: r.new_refused },
                   { ok: true, outcome: "read", new_entries: 3, new_moves: 1, new_refused: 0 });
  const got = seen(w, a);
  assert.deepEqual(got.map((e) => [e.seq, e.status, e.kind, e.key_listed, e.chain]),
                   [[1, "verified", "response", true, "checked"], [2, "verified", "edition", true, "checked"],
                    [3, "verified", "statement", true, "checked"]]);
  assert.equal(got[1].what_changed, "the payroll figure corrected");
  assert.equal(got[1].edition, 2);
  /* the read is recorded with what it saw */
  const row = w.rows(`SELECT * FROM case_import_docket_reads`)[0];
  assert.deepEqual({ at: row.at, outcome: row.outcome, entries_seen: row.entries_seen, last_entry: row.last_entry },
                   { at: "2026-10-20T06:00:00Z", outcome: "read", entries_seen: 3, last_entry: entries[2].fields.date });
  /* a later read of the same entries records nothing new */
  const again = await read(w, a, answer(entries));
  assert.deepEqual([again.new_entries, again.new_moves, again.new_refused], [0, 0, 0]);
  assert.equal(seen(w, a).length, 3);
  assert.equal(w.count("case_import_docket_reads"), 2);
});

test("R18 a tampered json is refused at the digest; a json of another case, group, seq or format label is refused at the form; each is never a move", async () => {
  const { w, a } = await watched();
  const good = entry(1, null, { kind: "withdrawal", edition: 1, reason: "a source recanted" });
  const tampered = { ...good, json: good.json.replace("recanted", "relented") };
  let r = await read(w, a, answer([tampered]));
  assert.deepEqual([r.new_entries, r.new_moves, r.new_refused], [1, 0, 1]);
  assert.deepEqual(seen(w, a).map((e) => [e.status, e.failed]), [["refused", "digest"]]);
  for (const fields of [{ case: "CASE-2026-0999" }, { group: "another-group" }, { seq: 9 }, { format: "docket-entry/9" }]) {
    const e = entry(2, null, { kind: "edition", edition: 2, ...fields });
    r = await read(w, a, answer([e]));
    assert.equal(r.new_refused, 1, JSON.stringify(fields));
    assert.equal(seen(w, a).at(-1).failed, "form");
  }
  assert.equal(w.reeval.moved.length, 0, "a refused entry is never a move");
  /* the control: the untampered entry, served after a tampered copy with its digest, still verifies */
  r = await read(w, a, answer([good]));
  assert.deepEqual([r.new_moves, r.new_refused], [1, 0]);
});

test("R18 a signature in another namespace, or over other bytes, is refused at the signature", async () => {
  const { w, a } = await watched();
  const other = entry(1, null, {}, { ns: NS_RATIFY });
  let r = await read(w, a, answer([other]));
  assert.equal(r.new_refused, 1);
  assert.equal(seen(w, a)[0].failed, "signature");
  assert.match(seen(w, a)[0].detail, /NAMESPACE/);
  const wrong = { ...entry(2, null, {}), signature: entry(3, null, {}).signature };
  r = await read(w, a, answer([wrong]));
  assert.equal(seen(w, a).at(-1).failed, "signature");
  const garbage = { ...entry(4, null, {}), signature: "not a signature" };
  r = await read(w, a, answer([garbage]));
  assert.equal(seen(w, a).at(-1).failed, "signature");
});

test("R18 an entry signed by a key no held manifest lists is verified and labelled key_listed: false, never refused for it", async () => {
  const { w, a } = await watched();
  const e = entry(1, null, { kind: "withdrawal", edition: "all", reason: "the group stands behind none of it" }, { key: NEWER });
  const r = await read(w, a, answer([e]));
  assert.deepEqual([r.new_moves, r.new_refused], [1, 0]);
  assert.deepEqual([seen(w, a)[0].status, seen(w, a)[0].key_listed], ["verified", false]);
  assert.equal(w.reeval.moved[0].move.key_listed, false);
  assert.equal(w.reeval.moved[0].move.edition, "all");
  /* once an edition listing the newer key is held, its entries are listed */
  await imp(w, caseFile({ edition: 2, manifestExtra: { keys: [MANAGER.manifest, NEWER.manifest] } }));
  await read(w, a, answer([e, entry(2, e.digest, {}, { key: NEWER })]));
  assert.equal(seen(w, a)[1].key_listed, true);
});

test("R18 the chain: entry 1 names no previous; a broken previous is refused; with seq − 1 not held the chain is unchecked and not refused", async () => {
  const { w, a } = await watched();
  const e1 = entry(1, null);
  const bad1 = entry(1, "a".repeat(64), { date: "2026-10-01" });
  let r = await read(w, a, answer([bad1]));
  assert.equal(seen(w, a)[0].failed, "chain");
  r = await read(w, a, answer([e1]));
  assert.equal(r.new_refused, 0);
  const broken = entry(2, "b".repeat(64));
  r = await read(w, a, answer([e1, broken]));
  assert.equal(seen(w, a).at(-1).failed, "chain");
  const lone = entry(5, "c".repeat(64), { kind: "edition", edition: 3 });
  r = await read(w, a, answer([lone]));
  assert.deepEqual([seen(w, a).at(-1).status, seen(w, a).at(-1).chain], ["verified", "unchecked"]);
  /* the right previous is checked */
  const e2 = entry(2, e1.digest);
  await read(w, a, answer([e1, e2]));
  assert.deepEqual([seen(w, a).at(-1).status, seen(w, a).at(-1).chain], ["verified", "checked"]);
});

test("R18 a re-served seq with another digest is refused with differs: true and both digests; the held entry stands", async () => {
  const { w, a } = await watched();
  const held = entry(1, null, { kind: "edition", edition: 2, what_changed: "first words" });
  await read(w, a, answer([held]));
  const other = entry(1, null, { kind: "edition", edition: 2, what_changed: "rewritten words" });
  const r = await read(w, a, answer([other]));
  assert.deepEqual([r.new_entries, r.new_moves, r.new_refused], [1, 0, 1]);
  const got = seen(w, a);
  assert.deepEqual(got[1], { ...got[1], status: "refused", failed: "seq", differs: true, held_digest: held.digest, digest: other.digest });
  assert.deepEqual(got.filter((e) => e.status === "verified").map((e) => e.digest), [held.digest], "the held entry stands");
  assert.equal(w.reeval.moved.length, 1);
});

test("R18 an entry with the old label civicos-docket-entry/1 verifies as one with civicsmith-docket-entry/1, and a chain may hold both", async () => {
  const { w, a } = await watched();
  assert.deepEqual(DOCKET_ENTRY_FORMATS, ["civicsmith-docket-entry/1", "civicos-docket-entry/1"]);
  const old = entry(1, null, { format: "civicos-docket-entry/1", kind: "edition", edition: 2 });
  const neu = entry(2, old.digest, { format: "civicsmith-docket-entry/1", kind: "withdrawal", edition: 1, reason: "r" });
  const r = await read(w, a, answer([old, neu]));
  assert.deepEqual([r.new_moves, r.new_refused], [2, 0]);
  assert.deepEqual(seen(w, a).map((e) => [e.status, e.chain]), [["verified", "checked"], ["verified", "checked"]]);
});

test("R18 an answer of another group or case is recorded unreadable, not_this_case; an unreadable read keeps monitoring's reason; a read with no entries list is not_a_docket", async () => {
  const { w, a } = await watched();
  const entries = run([[{ kind: "edition", edition: 2 }]]);
  for (const x of [{ group: "another-group" }, { case: "CASE-2026-0999" }]) {
    const r = await read(w, a, answer(entries, x));
    assert.deepEqual([r.outcome, r.reason, r.new_entries], ["unreadable", "not_this_case", 0]);
  }
  let r = await read(w, a, null, { outcome: "unreadable", reason: "http_404" });
  assert.deepEqual([r.outcome, r.reason], ["unreadable", "http_404"]);
  r = await read(w, a, { ok: true, case: CASE, group: SOURCE });
  assert.deepEqual([r.outcome, r.reason], ["unreadable", "not_a_docket"]);
  r = await read(w, a, answer(entries), { outcome: "maybe" });
  assert.deepEqual([r.outcome, r.reason], ["unreadable", "outcome_unknown"]);
  assert.equal(seen(w, a).length, 0, "no entry of an unreadable read is recorded");
  assert.equal(w.count("case_import_docket_reads"), 5, "each read is recorded");
  /* the control */
  r = await read(w, a, answer(entries));
  assert.deepEqual([r.outcome, r.new_moves], ["read", 1]);
});

test("R18 after the read commits, reevaluation.citedCaseMoved is told once per new move, and never of another entry; a throw there undoes nothing and is named", async () => {
  const { w, a } = await watched();
  const entries = run([[{ kind: "response" }], [{ kind: "edition", edition: 2, what_changed: "w" }],
                       [{ kind: "withdrawal", edition: 1, reason: "a source recanted" }], [{ kind: "disclosure" }]]);
  const r = await read(w, a, answer(entries));
  assert.equal(r.new_moves, 2);
  assert.deepEqual(w.reeval.moved.map((q) => [q.move.kind, q.move.seq]), [["edition", 2], ["withdrawal", 3]]);
  const m = w.reeval.moved[0].move;
  assert.deepEqual(Object.keys(m).sort(), ["at", "case", "date", "edition", "group", "import", "key_listed", "kind", "move", "reason",
                                           "seq", "taken_back", "what_changed"]);
  /* after the commit: the move is readable through accepted-work when it is told */
  assert.ok(w.acceptedWork.publisherMoves({ after: "", limit: 10 }).moves.some((x) => x.move === m.move));
  assert.deepEqual(r.reevaluation.map((x) => x.kind), ["cited_case_moved", "cited_case_moved"]);
  w.reeval.movedThrows = true;
  const more = await read(w, a, answer([...entries, entry(5, entries[3].digest, { kind: "edition", edition: 3 })]));
  assert.equal(more.ok, true);
  assert.equal(more.new_moves, 1);
  assert.deepEqual(more.listeners_failed, [{ module: "reevaluation", move: more.listeners_failed[0].move, error: "moves listeners down" }]);
  assert.equal(seen(w, a).length, 5, "the read stands");
});

test("R18 a verified take-back naming a move's seq is stated beside that move as taken_back", async () => {
  const { w, a } = await watched();
  const entries = run([[{ kind: "edition", edition: 2, what_changed: "w" }], [{ kind: "take-back", takes_back: 1, reason: "posted in error" }]]);
  await read(w, a, answer(entries));
  const moves = w.acceptedWork.publisherMoves({ after: "", limit: 10 }).moves;
  assert.deepEqual(moves.map((x) => x.taken_back), [{ seq: 2, date: entries[1].fields.date }]);
  assert.deepEqual(seen(w, a)[0].taken_back, { seq: 2, date: entries[1].fields.date });
  assert.equal(seen(w, a)[1].takes_back, 1);
});

/* ================================================================ R16 */

test("R16 `moves` answers the publisher moves through accepted-work in the order recorded, paged, as accepted-work R8 states them", async () => {
  const { w, a } = await watched();
  w.clock.now = Date.parse("2026-10-21T00:00:00Z");
  const entries = run([[{ kind: "edition", edition: 2, what_changed: "two" }], [{ kind: "response" }],
                       [{ kind: "withdrawal", edition: 2, reason: "withdrawn" }], [{ kind: "edition", edition: 3, what_changed: "three" }]]);
  await read(w, a, answer(entries));
  const page = (after, limit) => w.acceptedWork.publisherMoves({ after, limit });
  const p1 = page("", 2);
  assert.equal(p1.moves.length, 2);
  assert.deepEqual(p1.moves[0], { move: p1.moves[0].move, import: a.import, group: SOURCE, case: CASE, kind: "edition", edition: 2, seq: 1,
                                  date: entries[0].fields.date, at: "2026-10-21T00:00:00Z", what_changed: "two", reason: null,
                                  key_listed: true, taken_back: null });
  assert.deepEqual([p1.moves[1].kind, p1.moves[1].reason, p1.moves[1].what_changed], ["withdrawal", "withdrawn", null]);
  const p2 = page(p1.cursor, 2);
  assert.deepEqual(p2.moves.map((x) => x.seq), [4]);
  assert.equal(p2.cursor, null);
  assert.deepEqual(page(null, null).moves.map((x) => x.seq), [1, 3, 4]);
  assert.equal(w.ci.registration.ok, true);
});

/* ================================================================ R19 */

test("R19 importedCases and importedCase answer the watch, the docket unreadable with its sentence, each edition's publisher moves and every entry seen", async () => {
  const { w, a } = await watched();
  await imp(w, caseFile({ edition: 2, manifestExtra: { keys: [MANAGER.manifest] } }));
  /* never read: the watch, no move seen, and the answer says only that */
  let c = w.ci.importedCase({ import: a.import, edition: 1, viewer: V("bob") });
  assert.deepEqual(c.watch, { docket: docketAddressOf(PUB, CASE), publisher: PUB, set_by: "alice", set_at: c.watch.set_at, last_read: null });
  assert.deepEqual([c.edition.publisher, c.edition.publisher_note, c.edition.last_read], [null, NO_MOVE_SEEN, null]);
  assert.equal(c.docket_unreadable, undefined);
  /* unreadable: the sentence, the reason and the instant, never that nothing changed */
  await read(w, a, null, { outcome: "unreadable", reason: "fetch_failed", at: "2026-10-22T01:00:00Z" });
  c = w.ci.importedCase({ import: a.import, viewer: V("bob") });
  assert.deepEqual(c.docket_unreadable, { sentence: DOCKET_UNREADABLE, reason: "fetch_failed", at: "2026-10-22T01:00:00Z" });
  assert.equal(DOCKET_UNREADABLE, "Could not read the publisher's docket");
  assert.deepEqual(c.edition.last_read, { at: "2026-10-22T01:00:00Z", outcome: "unreadable", reason: "fetch_failed" });
  /* moves: a new edition 3 and a withdrawal of every edition; edition 2 published again after it */
  const entries = run([[{ kind: "edition", edition: 3, what_changed: "three" }], [{ kind: "withdrawal", edition: "all", reason: "all of it" }],
                       [{ kind: "edition", edition: 2, what_changed: "two again" }], [{ kind: "take-back", takes_back: 1, reason: "early" }],
                       [{ kind: "response" }]]);
  const bad = { ...entry(6, entries[4].digest), json: "{}" };
  await read(w, a, answer([...entries, bad]), { at: "2026-10-23T01:00:00Z" });
  const byEd = (n) => w.ci.importedCase({ import: a.import, edition: n, viewer: V("bob") });
  c = byEd(1);
  assert.equal(c.docket_unreadable, undefined, "a successful read clears it");
  /* edition 1: the newest edition move naming a later edition (2, published again), and the withdrawal of all */
  assert.deepEqual(c.edition.publisher, {
    edition: { seq: 3, edition: 2, date: entries[2].fields.date, what_changed: "two again", key_listed: true, taken_back: null },
    withdrawal: { seq: 2, edition: "all", date: entries[1].fields.date, reason: "all of it", key_listed: true, taken_back: null } });
  /* edition 2: edition 3 (taken back, still stated), and no withdrawal, since edition 2 was published again after it */
  assert.deepEqual(byEd(2).edition.publisher, {
    edition: { seq: 1, edition: 3, date: entries[0].fields.date, what_changed: "three", key_listed: true,
               taken_back: { seq: 4, date: entries[3].fields.date } },
    withdrawal: null });
  assert.deepEqual(c.editions.map((e) => e.publisher.edition.edition), [2, 3], "each edition in the list carries its publisher");
  assert.deepEqual(c.docket_entries.map((e) => [e.seq, e.status]),
                   [[1, "verified"], [2, "verified"], [3, "verified"], [4, "verified"], [5, "verified"], [6, "refused"]]);
  /* importedCases answers the same */
  const listed = w.ci.importedCases({ viewer: V("alice") }).imports.find((i) => i.import === a.import);
  assert.deepEqual(listed.watch, c.watch);
  assert.deepEqual(listed.docket_entries, c.docket_entries);
  assert.deepEqual(listed.editions, c.editions);
  /* a non-member reads absence, as R4 */
  const none = seeded();
  assert.equal(JSON.stringify(w.ci.importedCases({ viewer: V("carol") })), JSON.stringify(none.ci.importedCases({ viewer: V("alice") })));
  assert.equal(JSON.stringify(w.ci.importedCase({ import: a.import, viewer: V("dave") })),
               JSON.stringify(none.ci.importedCase({ import: a.import, viewer: V("alice") })));
});

/* ================================================================ R20 */

test("R20 watchItems answers each verified entry with the instant this copy read it (seen_at), each refused entry and each unreadable watch, naming the import, group, case and set_by; empty to a non-member", async () => {
  const { w, a } = await watched();
  /* the clock this copy records by differs from the read's instant, so seen_at is shown to be the read's */
  w.clock.now = Date.parse("2026-10-30T12:00:00Z");
  const entries = run([[{ kind: "edition", edition: 2, what_changed: "w" }], [{ kind: "response" }]]);
  const bad = { ...entry(3, entries[1].digest), json: "{}" };
  await read(w, a, answer([...entries, bad]));
  const before = w.snapshot();
  let items = w.ci.watchItems({ viewer: V("bob") });
  const head = { import: a.import, group: SOURCE, case: CASE, set_by: "alice" };
  const READ1 = "2026-10-20T06:00:00Z";
  assert.deepEqual(items.entries, [
    { ...head, seq: 1, kind: "edition", edition: 2, date: entries[0].fields.date, key_listed: true, seen_at: READ1, move: true,
      what_changed: "w", taken_back: null },
    { ...head, seq: 2, kind: "response", edition: 1, date: entries[1].fields.date, key_listed: true, seen_at: READ1, move: false,
      taken_back: null }]);
  assert.deepEqual(w.snapshot(), before, "it writes nothing");
  /* an entry first seen by a later read is seen at that read's instant; one read again keeps the instant it was first seen */
  const third = entry(3, entries[1].digest, { kind: "withdrawal", edition: 1, reason: "r" });
  await read(w, a, answer([...entries, third]), { at: "2026-10-21T07:30:00Z" });
  items = w.ci.watchItems({ viewer: V("bob") });
  assert.deepEqual(items.entries.map((e) => [e.seq, e.seen_at, e.reason ?? null]),
                   [[1, READ1, null], [2, READ1, null], [3, "2026-10-21T07:30:00Z", "r"]]);
  /* a read whose instant is missing is seen at this copy's instant */
  await read(w, a, answer([...entries, third, entry(4, third.digest, { kind: "response" })]), { at: null });
  assert.equal(w.ci.watchItems({}).entries.at(-1).seen_at, "2026-10-30T12:00:00Z");
  /* every verified entry names its seen_at, an instant to the second */
  assert.ok(w.ci.watchItems({}).entries.every((e) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(e.seen_at)));
  items = w.ci.watchItems({ viewer: V("bob") });
  assert.deepEqual(items.refused, [{ ...head, seq: 3, failed: "digest", detail: items.refused[0].detail }]);
  assert.deepEqual(items.unreadable, []);
  await read(w, a, null, { outcome: "unreadable", reason: "too_large", at: "2026-10-24T00:00:00Z" });
  items = w.ci.watchItems({});
  assert.deepEqual(items.unreadable, [{ ...head, docket: docketAddressOf(PUB, CASE), sentence: DOCKET_UNREADABLE, reason: "too_large",
                                        at: "2026-10-24T00:00:00Z" }]);
  for (const v of [V("carol"), V("dave"), "class:ai"]) assert.deepEqual(w.ci.watchItems({ viewer: v }), { entries: [], refused: [], unreadable: [] });
  /* a watch ended: its entries stay, its unreadable state leaves */
  w.ci.unwatchImport({ import: a.import, by: V("bob"), viewer: V("bob") });
  items = w.ci.watchItems({});
  assert.equal(items.entries.length, 4);
  assert.equal(items.entries[0].seen_at, READ1, "an ended watch's entries keep their seen_at");
  assert.deepEqual(items.unreadable, []);
});

/* ================================================================ R12, R13, R14 */

test("R12 the watches, their ends, the docket reads and the entries seen are append-only", async () => {
  const { w, a } = await watched();
  const snaps = [];
  const check = () => {
    const now = w.snapshot("case_import");
    for (const s of snaps) for (const [t, rows] of Object.entries(s))
      for (const row of JSON.parse(rows)) assert.ok(JSON.parse(now[t]).some((x) => JSON.stringify(x) === JSON.stringify(row)), `${t}: a row stayed`);
    snaps.push(now);
  };
  check();
  const entries = run([[{ kind: "edition", edition: 2 }]]);
  await read(w, a, answer(entries)); check();
  await read(w, a, answer([entries[0], entry(1, null, { kind: "edition", edition: 9 })])); check();
  w.ci.watchImport({ import: a.import, publisher: "https://moved.example.org", by: V("bob"), viewer: V("bob") }); check();
  w.ci.unwatchImport({ import: a.import, by: V("bob"), viewer: V("bob") }); check();
  w.ci.watchImport({ import: a.import, publisher: PUB, by: V("bob"), viewer: V("bob") }); check();
  assert.deepEqual([w.count("case_import_watches"), w.count("case_import_watch_ends"), w.count("case_import_docket_reads"),
                    w.count("case_import_docket_entries")], [3, 1, 2, 2]);
});

test("R13 the watch, read and entry tables are declared as the import's own record and purged with it", async () => {
  const w = seeded({ minimal: true });
  const a = await imp(w, caseFile({ manifestExtra: { keys: [MANAGER.manifest] } }));
  w.ci.watchImport({ import: a.import, publisher: PUB, by: V("alice"), viewer: V("alice") });
  await read(w, a, answer(run([[{ kind: "edition", edition: 2 }]])));
  w.ci.unwatchImport({ import: a.import, by: V("alice"), viewer: V("alice") });
  const tables = ["case_import_edition_keys", "case_import_watches", "case_import_watch_ends", "case_import_docket_reads", "case_import_docket_entries"];
  for (const t of tables) { assert.ok(CASE_IMPORT_TABLES.includes(t), t); assert.ok(w.count(t) > 0, t); }
  const before = w.snapshot("case_import");
  w.record.purge({ bundleId: F1 });
  assert.deepEqual(w.snapshot("case_import"), before, "a bundle's purge leaves them");
  const report = w.record.purge({});
  for (const t of tables) { assert.equal(w.count(t), 0, t); assert.ok(t in report.removed, t); }
  assert.deepEqual(w.ci.watchedImports({}).watches, []);
});

test("R14 C-130.15 and C-130.16 carry the translations BOB drafted, each refusal its row", async () => {
  assert.deepEqual(CASE_IMPORT_CHECKS.IMPORT_WATCH_BAD_ADDRESS, { check: "C-130.15", where: CASE_IMPORT_CHECKS.IMPORT_WATCH_BAD_ADDRESS.where,
    translation: "That is not the public https address of the publishing group's copy. Give the address of their copy, with no query and no fragment. Nothing was written." });
  assert.deepEqual(CASE_IMPORT_CHECKS.IMPORT_NOT_WATCHED, { check: "C-130.16", where: CASE_IMPORT_CHECKS.IMPORT_NOT_WATCHED.where,
    translation: "This imported case is not being watched, so there is no watch to end. Nothing was written." });
  const { w, a } = await watched({ watch: false });
  rowOk(w.ci.watchImport({ import: a.import, publisher: "http://x.example.org", by: V("alice"), viewer: V("alice") }), "IMPORT_WATCH_BAD_ADDRESS");
  rowOk(w.ci.unwatchImport({ import: a.import, by: V("alice"), viewer: V("alice") }), "IMPORT_NOT_WATCHED");
  rowOk(await w.ci.recordDocketRead({ import: a.import, docket: "x", outcome: "unreadable" }), "IMPORT_NOT_WATCHED");
});

test("R17 the watch ops: importwatch and importunwatch take by and viewer from the control plane's stamps, never the body", async () => {
  const { w, a } = await watched({ watch: false });
  const url = (op, who) => new URL(`https://x/?op=${op}&by=member:${who}&viewer=member:${who}`);
  const r = caseImportOps(w.ci, url("importwatch", "bob"), { import: a.import, publisher: PUB, by: "member:carol" }).importwatch();
  assert.equal(r.ok, true);
  assert.equal(r.set_by, "bob");
  rowOk(caseImportOps(w.ci, url("importunwatch", "carol"), { import: a.import, by: "member:alice", viewer: "member:alice" }).importunwatch(),
        "IMPORT_NOT_A_MEMBER");
  assert.equal(caseImportOps(w.ci, url("importunwatch", "alice"), { import: a.import }).importunwatch().ok, true);
});

test("R18 a read never throws: an answer of any shape is recorded, its malformed entries refused", async () => {
  const w = world();
  w.member("alice");
  const a = await imp(w, caseFile({ manifestExtra: { keys: [MANAGER.manifest] } }));
  w.ci.watchImport({ import: a.import, publisher: PUB, by: V("alice"), viewer: V("alice") });
  for (const ans of [undefined, 42, "x", [], { entries: "no" }, { ...answer([]), entries: [null, 7, "x", {}, { seq: 1 }] }]) {
    const r = await read(w, a, ans);
    assert.equal(r.ok, true, JSON.stringify(r));
  }
  const got = w.ci.importedCase({ import: a.import, viewer: V("alice") }).docket_entries;
  assert.ok(got.length && got.every((e) => e.status === "refused"));
});
