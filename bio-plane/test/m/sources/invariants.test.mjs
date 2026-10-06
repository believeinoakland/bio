/* sources: its tables exempt from purge and no value in a log, an error or a listener payload (R13); no place named,
   and its rows its own (R14); the ops it answers; every table declared with its classes (R19). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, SECRET } from "./fixture.mjs";
import { SOURCES_CHECKS, SOURCES_TABLES, SOURCES_TABLE_CLASSES, CONSENT_STATEMENT, WITHDRAWAL_STATEMENT, NOT_RECORDED, claimSentence,
         sourcesOps } from "../../../src/sources/index.mjs";
import { captureOwns } from "../../../src/capture/index.mjs";

const VALUE = "Unmistakable Value 7731";

test("R13 every table here is exempt from purge: a whole-store and a one-bundle purge leave every row, and no other module may declare one", async () => {
  const w = seeded();
  const { sourceId } = await w.pulled({ secret: SECRET });
  const e = w.disclose(sourceId);
  w.s.rungOf({ source: sourceId, viewer: V("bob") });
  w.tick();
  w.s.recordConsent({ source: sourceId, entry: e.entry, audience: "group", evidence: "e", by: "bob" });
  assert.equal(w.s.markKeyedResult({ captureSha: w.captured().sha, service: "PeopleFinder", by: "bob" }).ok, true);
  assert.deepEqual([...SOURCES_TABLES].sort(), w.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'source%'`)
                     .map((r) => r.name).filter((t) => !captureOwns(t)).sort(),
                   "the declared list is every table this module holds");
  for (const t of SOURCES_TABLES) assert.ok(w.count(t) > 0, `${t} holds a row`);
  const before = w.snapshot();
  const all = w.record.purge();
  for (const t of SOURCES_TABLES) assert.equal(Object.hasOwn(all.removed || {}, t) ? all.removed[t] : 0, 0, `${t}: nothing removed`);
  w.record.purge({ bundleId: sourceId });
  const after = w.snapshot();
  for (const t of SOURCES_TABLES) assert.deepEqual(after[t], before[t], `${t} is unchanged by purge`);
  for (const t of SOURCES_TABLES) {
    const r = w.record.declarePurge("someone-else", [t]);
    assert.equal(r.reason, "TABLE_DECLARED", `${t} is declared`);
    assert.equal(r.declaredBy, "sources");
  }
});

test("R13 a value is never written to a log, an error or a listener payload", async () => {
  const w = seeded();
  const { sourceId, row } = await w.pulled({ secret: SECRET });
  const logged = [];
  const orig = {};
  for (const k of ["log", "info", "warn", "error", "debug"]) { orig[k] = console[k]; console[k] = (...a) => logged.push(a); }
  const payloads = [];
  try {
    w.s.onDisclosure("reevaluation", (p) => { payloads.push(p); throw new Error(`boom ${JSON.stringify(p)}`); });
    const e = w.disclose(sourceId, { revealed: { kind: "name", value: VALUE } });
    const refusals = [
      w.s.recordDisclosure({ source: sourceId, revealed: { kind: "name", value: VALUE }, how: "rumour", knownTo: "group", evidence: "e", sight: ["bob"], by: "bob" }),
      w.s.recordDisclosure({ source: sourceId, revealed: { kind: "name", value: VALUE }, how: "self", knownTo: "group", evidence: "", sight: ["bob"], by: "bob" }),
      w.s.recordDisclosure({ source: sourceId, revealed: { kind: "name", value: VALUE }, how: "self", knownTo: "group", evidence: "e", sight: [], by: "bob" }),
      w.s.recordDisclosure({ source: sourceId, revealed: { kind: "name", value: VALUE }, recorded: false, how: "self", knownTo: "group", evidence: "e", by: "bob" }),
      w.s.recordDisclosure({ source: "nope", revealed: { kind: "name", value: VALUE }, how: "self", knownTo: "group", evidence: "e", sight: ["bob"], by: "bob" }),
    ];
    for (const r of refusals) { assert.equal(r.ok, false); assert.ok(!JSON.stringify(r).includes(VALUE), `${r.reason} carries no value`); }
    assert.ok(!JSON.stringify(e).includes(VALUE), "the write's answer carries no value");
    w.tick();
    w.s.recordConsent({ source: sourceId, entry: e.entry, audience: "public", evidence: "e", by: "bob" });
    await w.s.consentBySecret({ knockerSecret: SECRET, entry: e.entry, audience: "public", withdraw: true, sourceAddress: "q" });
    w.s.sourceOf({ captureSha: row.sha256, viewer: V("bob") });
    assert.ok(!JSON.stringify(w.s.readLog({ source: sourceId, viewer: V("alice") })).includes(VALUE), "the read log carries no value");
    assert.ok(!JSON.stringify(w.s.publishableAt({ source: sourceId, audience: "public" })).includes(VALUE));
  } finally { for (const k of Object.keys(orig)) console[k] = orig[k]; }
  assert.ok(payloads.length >= 3);
  assert.ok(!JSON.stringify(payloads).includes(VALUE), "no listener payload carries a value");
  assert.ok(!JSON.stringify(logged).includes(VALUE), "nothing logged carries a value");
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM source_reads WHERE reader LIKE '%Value%' OR entry_id LIKE '%Value%'`)[0].n, 0);
});

test("R14 C-121.1–C-121.10 are held in this module's own table with their requirement's codes and translations (R16's four with them), and no place is named in its behaviour or outward text", async () => {
  const rows = {
    NO_SUCH_SOURCE: ["C-121.1", "No source you can see answers to that id. Nothing was written."],
    BAD_DISCLOSURE: ["C-121.2", "A disclosure names what was revealed (a pseudonym link, an attribute or a name), how it became known, and to whom it is known, each from the listed choices. The field that is not one of them is named. Nothing was written."],
    NO_EVIDENCE: ["C-121.3", "What is recorded about a source is recorded with its evidence. Name the evidence. Nothing was written."],
    NO_SIGHT_LIST: ["C-121.4", "A detail about a source that is stored can be read only by the members listed for it, and none is listed. List at least one member, or record that the detail is known without storing it. Nothing was written."],
    CONSENT_NOT_STANDING: ["C-121.5", "That consent cannot be recorded: the detail it names is not in this source's history, or consent to a wider audience already stands. Nothing was written."],
    SECRET_NOT_RECOGNISED: ["C-121.6", "That secret was not recognised, so nothing was recorded. Check it and try again."],
    MACHINE_CANNOT_MARK: ["C-121.7", "Only a member, acting for themselves, can mark a result from a paid or account-gated service; no machine, scheduled task or unattended process can. Nothing was written."],
    NOT_YOUR_CAPTURE: ["C-121.8", "Only the member who captured a result can mark it as from their own account on a paid service. Nothing was written."],
    NO_SUCH_CAPTURE: ["C-121.9", "No capture the record holds answers to that digest. Nothing was written."],
    NO_SERVICE: ["C-121.10", "A result from a paid or account-gated service names the service it came from. Name it. Nothing was written."],
  };
  assert.deepEqual(Object.keys(SOURCES_CHECKS).sort(), Object.keys(rows).sort(), "exactly the ten rows");
  for (const [code, [check, translation]] of Object.entries(rows)) {
    assert.equal(SOURCES_CHECKS[code].check, check, code);
    assert.equal(SOURCES_CHECKS[code].translation, translation, code);
    assert.match(SOURCES_CHECKS[code].where, /^src\/sources\/checks\.mjs \S+ > is-[a-z-]+$/, `${code}: its one site`);
    assert.ok(Object.isFrozen(SOURCES_CHECKS[code]));
  }
  /* no place: every outward sentence this module writes */
  const PLACES = /oakland|alameda|california|\bcounty\b|\bcity of\b/i;
  const outward = [...Object.values(SOURCES_CHECKS).map((r) => r.translation), CONSENT_STATEMENT, WITHDRAWAL_STATEMENT, NOT_RECORDED,
                   claimSentence("x", "2026-01-01")];
  for (const s of outward) assert.ok(!PLACES.test(s), s);
});

test("R14 the ops: sourcedisclose, sourcelink, sourceconsent, sourceconsentwithdraw, knockerconsent and sourcekeyed reach their services with the control plane's stamps, never a body's", async () => {
  const w = seeded();
  const { sourceId, row } = await w.pulled({ secret: SECRET });
  const url = (q) => new URL(`http://do/x?${new URLSearchParams(q)}`);
  const ops = (q, body) => sourcesOps(w.s, url(q), body);
  assert.deepEqual(Object.keys(ops({}, {})).sort(), ["knockerconsent", "sourceconsent", "sourceconsentwithdraw", "sourcedisclose",
    "sourcekeyed", "sourcelink", "sourceof", "sourcepublishable", "sourcereadlog", "sourcerung"]);
  const d = ops({ by: "carol" }, { source: sourceId, revealed: { kind: "name", value: "Pat" }, how: "self", knownTo: "group",
                                   evidence: "e", sight: ["carol"], by: "bob" }).sourcedisclose();
  assert.equal(d.by, "carol", "the stamp wins over the body's by");
  assert.equal(ops({ by: "mallory" }, { source: sourceId, revealed: { kind: "name", value: "P" }, how: "self", knownTo: "group", evidence: "e", sight: ["bob"], by: "bob" })
    .sourcedisclose().reason, "NO_SUCH_SOURCE", "a body's by never stands in for a missing stamp");
  assert.equal(ops({ capture: row.sha256, viewer: V("carol") }, null).sourceof().history[0].value, "Pat");
  assert.equal(ops({ source_id: sourceId, viewer: V("carol") }, null).sourcerung().rung, "known_to_group");
  assert.equal(ops({ source_id: sourceId, viewer: V("alice") }, null).sourcereadlog().ok, true);
  w.tick();
  assert.equal(ops({ by: "bob" }, { source: sourceId, entry: d.entry, audience: "group", evidence: "e" }).sourceconsent().ok, true);
  assert.equal(ops({ source_id: sourceId, audience: "group" }, null).sourcepublishable().entries.length, 1);
  w.tick();
  assert.equal(ops({ by: "bob" }, { source: sourceId, entry: d.entry, audience: "group" }).sourceconsentwithdraw().act, "withdraw");
  const other = (await w.pulled()).sourceId;
  assert.equal((await ops({ by: "bob" }, { source: sourceId, to: other, evidence: "e" }).sourcelink()).ok, true);
  w.tick();
  const n = w.spy.attempts.length;
  assert.equal((await ops({ source: "192.0.2.44", now: String(w.clock.now) }, { knockerSecret: SECRET, entry: d.entry, audience: "group",
                                                                              sourceAddress: "forged" }).knockerconsent()).ok, true);
  assert.equal(w.spy.attempts[n].sourceAddress, "192.0.2.44", "the connecting address is the control plane's, never the body's");
});

test("R19 every table is declared explicitly through record-core's declareTable with its classes, exempt from purge (R13); the disclosures, stored values, read log and keyed marks are never exported", async () => {
  const w = seeded();
  const mine = w.record.declaredTables().filter((d) => d.module === "sources");
  assert.deepEqual(mine.map((d) => d.name), [...SOURCES_TABLES], "each table, once, in the module's order");
  assert.deepEqual([...SOURCES_TABLES].sort(), w.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'source%'`)
                     .map((r) => r.name).filter((t) => !captureOwns(t)).sort(), "and every table the module holds is declared");
  const CLASS_NAMES = ["purge", "expunge", "export", "sight", "derive", "version_chain"];
  for (const d of mine) {
    const own = SOURCES_TABLE_CLASSES.find((e) => e.name === d.name);
    for (const c of CLASS_NAMES) assert.equal(d[c], own[c], `${d.name}: ${c} is declared explicitly, as written`);
    assert.equal(d.purge, "exempt", `${d.name}: exempt from purge (R13)`);
    assert.equal(d.expunge, "none", `${d.name}: never expunged`);
  }
  const byName = Object.fromEntries(mine.map((d) => [d.name, d]));
  for (const t of ["source_entries", "source_sight", "source_reads", "source_keyed_marks"])
    assert.equal(byName[t].export, "never", `${t}: a source's disclosures, stored values (and who may read them), its read log and R16's marks are never exported`);
  /* the explicit form, not the default one: the default would export these admin-only */
  assert.ok(mine.every((d) => d.export !== "admin-only" || d.name === "source_knocks"), "only R15's receipts, which hold no value, go to administrators");
});
