/* sources: the ladder (R9) and the listeners called after every act (R10). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, MACHINE, SECRET } from "./fixture.mjs";
import { RUNGS } from "../../../src/sources/index.mjs";

const codeOf = (r) => (r && r.ok === false ? r.reason : "ok");

test("R9 rungOf answers the ladder: unknown; same_knocker (proved by the secret); partly_known; known_to_group; publicly_known; each with who knows and how, a withheld value staying withheld", async () => {
  const w = seeded();
  assert.deepEqual(RUNGS, ["unknown", "same_knocker", "partly_known", "known_to_group", "publicly_known"]);
  const bare = w.pulled();
  const r0 = w.s.rungOf({ source: bare.sourceId, viewer: V("carol") });
  assert.equal(r0.ok, true);
  assert.equal(r0.rung, "unknown", "a knock without a secret, nothing disclosed");
  assert.deepEqual(r0.ladder, RUNGS);
  assert.deepEqual(r0.basis, []);
  /* same_knocker: proved by the secret (a pseudonym), or a same_secret link */
  const k = w.pulled({ secret: SECRET });
  const r1 = w.s.rungOf({ source: k.sourceId, viewer: V("carol") });
  assert.equal(r1.rung, "same_knocker");
  assert.deepEqual(r1.knocker, { pseudonym: k.row.pseudonym, how: "the same knocker secret was presented" });
  const l = await w.s.linkClaim({ source: k.sourceId, to: bare.sourceId, evidence: "presented", by: "bob", knockerSecret: SECRET });
  const r1b = w.s.rungOf({ source: bare.sourceId, viewer: V("carol") });
  assert.equal(r1b.rung, "same_knocker", "a same_secret link proves the other side too");
  assert.deepEqual(r1b.basis.map((b) => b.entry), [l.entry]);
  assert.equal(r1b.basis[0].basis, "same_secret");
  /* an evidence link alone does not */
  const c = w.pulled(), d = w.pulled();
  await w.s.linkClaim({ source: c.sourceId, to: d.sourceId, evidence: "similar style", by: "bob" });
  assert.equal(w.s.rungOf({ source: d.sourceId, viewer: V("carol") }).rung, "unknown");
  /* partly_known: an attribute */
  const a = w.disclose(k.sourceId, { revealed: { kind: "attribute", attribute: "employer", value: "Acme" }, sight: ["bob"] });
  const r2 = w.s.rungOf({ source: k.sourceId, viewer: V("bob") });
  assert.equal(r2.rung, "partly_known");
  assert.deepEqual(r2.basis.map((b) => [b.entry, b.how, b.knownTo, b.by, b.value]), [[a.entry, "self", "group", "bob", "Acme"]],
                   "who knows and how, from the history");
  const r2c = w.s.rungOf({ source: k.sourceId, viewer: V("carol") });
  assert.equal(r2c.basis[0].withheld, true, "a withheld value stays withheld");
  assert.equal(r2c.basis[0].value, undefined);
  /* a hostile claim never raises the rung: it is answered beside it */
  const h = w.disclose(k.sourceId, { how: "hostile", claimedBy: "a blog", knownTo: "public", evidence: { cite: "url" } });
  const r2h = w.s.rungOf({ source: k.sourceId, viewer: V("carol") });
  assert.equal(r2h.rung, "partly_known");
  assert.deepEqual(r2h.claims.map((x) => [x.entry, x.confirmed]), [[h.entry, false]]);
  /* known_to_group: a name, whether its value is stored or not */
  const n = w.disclose(k.sourceId, { recorded: false, revealed: { kind: "name" }, sight: undefined });
  const r3 = w.s.rungOf({ source: k.sourceId, viewer: V("carol") });
  assert.equal(r3.rung, "known_to_group");
  assert.deepEqual(r3.basis.map((b) => [b.entry, b.note]), [[n.entry, "known to the group, not recorded"]]);
  /* publicly_known: a name known to the public */
  const p = w.disclose(k.sourceId, { knownTo: "public", evidence: { cite: "a filing" }, sight: ["alice"] });
  const r4 = w.s.rungOf({ source: k.sourceId, viewer: V("alice") });
  assert.equal(r4.rung, "publicly_known");
  assert.deepEqual(r4.basis.map((b) => [b.entry, b.knownTo, b.value]), [[p.entry, "public", "Pat Q. Example"]]);
  assert.equal(w.s.rungOf({ source: k.sourceId, viewer: V("bob") }).basis[0].withheld, true);
  /* a superseded entry no longer holds the rung */
  w.disclose(k.sourceId, { knownTo: "group", sight: ["alice"] });
  assert.equal(w.s.rungOf({ source: k.sourceId, viewer: V("alice") }).rung, "known_to_group", "the later name, known to the group, is current");
  /* refusals */
  for (const [source, viewer] of [["SRC-2026-0000", V("bob")], [k.sourceId, MACHINE], [k.sourceId, undefined], [k.sourceId, V("dave")]])
    assert.equal(codeOf(w.s.rungOf({ source, viewer })), "NO_SUCH_SOURCE", `${source} ${viewer}`);
});

test("R10 each registration goes through membership.listenerRefusal; each listener is called after every R2, R6, R7 (and R11) commit with {source, entry, rung_before, rung_after}; a listener's failure never undoes the act", async () => {
  const w = seeded();
  const { sourceId } = w.pulled({ secret: SECRET });
  const other = w.pulled().sourceId;
  /* registration: malformed and second registrations refused by listenerRefusal's rows (C-102.11, C-102.12) */
  const m = w.s.onDisclosure("reevaluation", 7);
  assert.equal(m.reason, "LISTENER_MALFORMED"); assert.equal(m.check, "C-102.11");
  assert.equal(w.s.onDisclosure("", () => {}).reason, "LISTENER_MALFORMED");
  const seen = [];
  assert.equal(w.s.onDisclosure("reevaluation", (p) => { seen.push(p); return "ok"; }).ok, true);
  const dup = w.s.onDisclosure("reevaluation", () => {});
  assert.equal(dup.reason, "LISTENER_DECLARED"); assert.equal(dup.check, "C-102.12"); assert.equal(dup.module, "reevaluation");
  let throws = 0;
  assert.equal(w.s.onDisclosure("publication", () => { throws++; throw new Error("listener broke"); }).ok, true);
  /* R2 */
  const e = w.disclose(sourceId, { revealed: { kind: "attribute", attribute: "role", value: "clerk" } });
  assert.equal(e.ok, true, "a listener that throws does not undo the act");
  assert.deepEqual(seen.at(-1), { source: sourceId, entry: e.entry, rung_before: "same_knocker", rung_after: "partly_known" });
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM source_entries WHERE entry_id = ?`, e.entry)[0].n, 1, "the entry stands");
  /* R6 */
  const l = await w.s.linkClaim({ source: sourceId, to: other, evidence: "e", by: "bob" });
  assert.deepEqual(seen.at(-1), { source: sourceId, entry: l.entry, rung_before: "partly_known", rung_after: "partly_known" });
  /* R7, both arms */
  w.tick();
  w.s.recordConsent({ source: sourceId, entry: e.entry, audience: "public", evidence: "e", by: "bob" });
  assert.deepEqual(seen.at(-1), { source: sourceId, entry: e.entry, rung_before: "partly_known", rung_after: "partly_known" });
  w.tick();
  w.s.withdrawConsent({ source: sourceId, entry: e.entry, audience: "public", by: "bob" });
  assert.equal(seen.at(-1).entry, e.entry);
  /* R11 */
  w.tick();
  const before = seen.length;
  assert.equal((await w.s.consentBySecret({ knockerSecret: SECRET, entry: e.entry, audience: "public", sourceAddress: "a" })).ok, true);
  assert.equal(seen.length, before + 1);
  assert.equal(seen.at(-1).entry, e.entry);
  /* a refused act calls no listener; no payload carries a value (R13) */
  const n = seen.length;
  w.s.recordDisclosure({ source: sourceId, how: "rumour", by: "bob" });
  w.s.recordConsent({ source: sourceId, entry: "SRCE-none", audience: "group", evidence: "e", by: "bob" });
  await w.s.consentBySecret({ knockerSecret: "wrong secret, long enough to try", entry: e.entry, audience: "public", sourceAddress: "a" });
  assert.equal(seen.length, n);
  assert.ok(!JSON.stringify(seen).includes("clerk"));
  assert.ok(seen.every((p) => Object.keys(p).sort().join() === "entry,rung_after,rung_before,source"));
  assert.equal(throws, 5, "the failing listener was called at every commit");
});
