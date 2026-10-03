/* plane R20 (N534; DEC-101 (3)): the docket watch composed. The composition root hands `monitoring` the `case-import`
   instance it reads (`watchedImports`, `recordDocketRead`; monitoring R67), hands `queue` the `case-import` dep
   `queue-producers` R35 reads, and `case-import`'s `accepted-work` registration carries `moves` (accepted-work R8),
   filled before the first request. Driven end to end on the constructed object: a real case file (case-checker's
   fixture, signed with real keys) imported, a watch set through control-plane's door, monitoring's cadence tick reading
   the publisher's docket (a signed run of entries, as `docket` R24 answers) over the network the test stands in for,
   and the move read back through accepted-work. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { store } from "./fixture.mjs";
import { caseFile, keyFor, GROUP, CASE } from "../case-checker/fixture.mjs";
import { caseImportOf, docketAddressOf, DOCKET_ENTRY_FORMATS } from "../../../src/case-import/index.mjs";
import { monitoringOf } from "../../../src/monitoring/index.mjs";
import { acceptedWorkOf } from "../../../src/accepted-work/index.mjs";
import { queueOf } from "../../../src/queue/index.mjs";
import { queueProducersOf } from "../../../src/queue-producers/index.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";
import { NS_DOCKET, docketStatement } from "../../../src/sshsig.mjs";
import { signSshsig } from "../../../scripts/sign-sshsig.mjs";

const PUB = "https://source.example.org";
const NOW = Date.parse("2026-10-20T06:00:00Z");
const sha = (s) => createHash("sha256").update(s).digest("hex");
const ALICE = "member:alice";

/** One public docket entry as `docket` R24 answers it, signed by the publisher's group key (the case file lists it). */
function entry(seq, previous, fields) {
  const json = canonicalJson({ format: DOCKET_ENTRY_FORMATS[0], group: GROUP, case: CASE, seq, previous, shelf: "listed",
                               edition: 1, date: `2026-10-${String(10 + seq).padStart(2, "0")}`, ...fields });
  const digest = sha(json);
  return { seq, entry: `${CASE}#${seq}`, digest, json, fields: JSON.parse(json),
           signature: signSshsig(keyFor("group").env, docketStatement(CASE, seq, digest), NS_DOCKET),
           published_at: `${JSON.parse(json).date}T10:00:00Z`, taken_back: null };
}
const one = entry(1, null, { kind: "response" });
const two = entry(2, one.digest, { kind: "edition", edition: 2, what_changed: "the lease's second year added" });
const DOCKET = { ok: true, result: { ok: true, case: CASE, group: GROUP, entries: [one, two], captures: {}, captures_omitted: true,
                                     last_entry: two.fields.date, feed: "x" } };

/** The constructed object with alice an active member and her import of the publisher's case file. */
async function imported() {
  const x = await store({ env: { BIO_NOW_MS: String(NOW) } });
  x.ctx.storage.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                          VALUES (?, ?, ?, 'member', 'active', '["contribute"]', 't', 't')`, "alice", "Cover alice", "h_alice");
  const a = await caseImportOf(x.ctx).importCaseFile({ parts: caseFile().parts, by: ALICE, viewer: ALICE });
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  return { x, a };
}

/** Runs `fn` with the network answering the publisher's docket address (and only it), recording each fetch. */
async function withDocket(answer, fn) {
  const was = globalThis.fetch, fetched = [];
  globalThis.fetch = async (u) => {
    fetched.push(String(u));
    return String(u) === docketAddressOf(PUB, CASE)
      ? new Response(JSON.stringify(answer), { status: 200, headers: { "content-type": "application/json" } })
      : new Response("not here", { status: 404 });
  };
  try { return { out: await fn(), fetched }; } finally { globalThis.fetch = was; }
}

test("R20: monitoring is handed the plane's case-import instance: a watch set through the door is due to its cadence, read on its tick and recorded through recordDocketRead", async () => {
  const { x, a } = await imported();
  const mon = monitoringOf(x.ctx), ci = caseImportOf(x.ctx);
  assert.equal(mon.caseImport, ci, "monitoring reads the one case-import instance the plane built");
  /* negative control: an import not watched is nothing to monitoring */
  assert.equal(mon.cadenceDue(NOW), null, "nothing due before a watch");
  const set = await (await x.fetch(`/importwatch?by=${ALICE}&viewer=${ALICE}&import=${a.import}&publisher=${encodeURIComponent(PUB)}`,
                                   { method: "POST", body: "{}" })).json();
  assert.equal(set.ok, true, JSON.stringify(set));
  assert.equal(set.result.ok, true, JSON.stringify(set.result));
  /* monitoring's R67, R68 over the plane's instance: the watch, never read, is due now */
  assert.equal(mon.cadenceDue(NOW), NOW);
  const { out: tick, fetched } = await withDocket(DOCKET, () => mon.cadenceTick(NOW));
  assert.ok(fetched.includes(docketAddressOf(PUB, CASE)), `the docket address was read: ${fetched.join()}`);
  assert.deepEqual(tick.watched.read.map((r) => [r.import, r.outcome, r.new_entries, r.new_moves, r.new_refused]),
                   [[a.import, "read", 2, 1, 0]], JSON.stringify(tick.watched));
  /* the read is case-import's record, on the plane's instance: the watch's last read and every entry seen */
  const w = ci.watchedImports({}).watches;
  assert.deepEqual(w.map((v) => [v.import, v.last_read && v.last_read.outcome]), [[a.import, "read"]]);
  assert.deepEqual(ci.importedCase({ import: a.import, viewer: ALICE }).docket_entries.map((e) => [e.seq, e.status]),
                   [[1, "verified"], [2, "verified"]]);
  /* read today, so not due again until a day after */
  assert.equal(mon.cadenceDue(NOW + 60e3), null);
});

test("R20: case-import's accepted-work registration carries moves, filled before the first request, so accepted-work's publisherMoves reads the moves the watch saw", async () => {
  const { x, a } = await imported();
  const aw = acceptedWorkOf(x.ctx);
  assert.equal(caseImportOf(x.ctx).acceptedWork, aw, "the one accepted-work instance (R16)");
  assert.deepEqual(caseImportOf(x.ctx).registration, { ok: true, module: "case-import" });
  /* filled before the first request: no other module can register, and the read answers an empty page, never absent */
  assert.equal(aw.registerAcceptedWork("zz-probe", { finding: () => null, openFlags: () => null, withdrawals: () => null,
                                                moves: () => ({ moves: [], cursor: null }) }).reason, "LISTENER_DECLARED");
  assert.deepEqual(aw.publisherMoves({}), { moves: [], cursor: null });
  await x.fetch(`/importwatch?by=${ALICE}&viewer=${ALICE}&import=${a.import}&publisher=${encodeURIComponent(PUB)}`,
                { method: "POST", body: "{}" });
  await withDocket(DOCKET, () => monitoringOf(x.ctx).cadenceTick(NOW));
  /* only the edition is a publisher move; the response reaches only the watch's setter (K1366 F1) */
  const moves = aw.publisherMoves({}).moves;
  assert.deepEqual(moves.map((m) => [m.import, m.group, m.case, m.kind, m.edition, m.seq, m.what_changed, m.key_listed]),
                   [[a.import, GROUP, CASE, "edition", 2, 2, "the lease's second year added", true]]);
});

test("R20: queue is handed the plane's case-import, so the producers it reads answer the watch's items to the member who set it and nobody else", async () => {
  const { x, a } = await imported();
  x.ctx.storage.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                          VALUES (?, ?, ?, 'member', 'active', '["contribute"]', 't', 't')`, "bob", "Cover bob", "h_bob");
  /* the queue's producers: one per storage, the instance the plane's queue builds and reads (queue-producers R8) */
  queueOf(x.ctx);
  const items = (who) => queueProducersOf(x.ctx).feedItems({ member: who, viewer: `member:${who}`, now: NOW,
    homesOf: () => new Map(), optionsOf: () => [] }).items.filter((i) => String(i.id).includes(a.import)).map((i) => [i.id, i.kind]).sort();
  /* negative control: before a watch is read, nothing of the import reaches anyone */
  assert.deepEqual(items("alice"), []);
  await x.fetch(`/importwatch?by=${ALICE}&viewer=${ALICE}&import=${a.import}&publisher=${encodeURIComponent(PUB)}`,
                { method: "POST", body: "{}" });
  await withDocket(DOCKET, () => monitoringOf(x.ctx).cadenceTick(NOW));
  assert.deepEqual(items("alice"), [[`FINDING::followed-case-entry::${a.import}#1`, "followed-case-entry"],
                                    [`FINDING::followed-case-entry::${a.import}#2`, "followed-case-entry"]]);
  assert.deepEqual(items("bob"), [], "the watch's items go to its setter only");
  /* and through control-plane's door: the setter's queue carries them, minted with their class */
  const door = async (who) => {
    const r = await (await x.fetch(`/queue?member=${who}&viewer=member:${who}`)).json();
    assert.equal(r.result.ok, true, JSON.stringify(r.result).slice(0, 300));
    return r.result.items.filter((i) => String(i.id).includes(a.import)).map((i) => [i.id, i.class]).sort();
  };
  assert.deepEqual(await door("alice"), [[`FINDING::followed-case-entry::${a.import}#1`, "FINDING"],
                                         [`FINDING::followed-case-entry::${a.import}#2`, "FINDING"]]);
  assert.deepEqual(await door("bob"), []);
});
