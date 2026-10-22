/* R39 at the door (E14, T51 fix round 5): the events' five vocabularies are in the answer `op=affordances` gives when the
   door composes it in a Worker isolate where `events` has not started. `events` registers itself as a connection owner at
   `start()`, which runs in the Durable Object only (events/index.mjs `start`); a Worker isolate that never hosted the
   Durable Object has no `events` in `connection-grammar`'s registry. The Miniflare plane runs both in one isolate, so it
   cannot show that; this test composes the door's answer in this Node process (events imported, never started, as in a
   Worker) over the real store, the Durable Object in Miniflare, asked as the door asks it. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { owners } from "../../../src/connection-grammar/index.mjs";
import { DATED_KINDS, EVENT_KINDS, STATUSES, ROLES, RELATION_KINDS } from "../../../src/events/index.mjs";
import { affordancesOp, vocabulariesFor } from "../../../src/affordances.mjs";
import { json, doAnswer, storeSilent, storeRefusal } from "../../../src/answer-envelope/index.mjs";

const ENTRY = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "src", "plane", "index.mjs");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: ENTRY,
  script: readFileSync(ENTRY, "utf8"), modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "evv-plane", ADMIN_TOKEN: "adm-evv", MEMBER_TOKEN: "mem-evv", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000" },
});
after(() => mf.dispose());

const FIVE = { event_kinds: EVENT_KINDS, dated_fact_kinds: DATED_KINDS, event_statuses: STATUSES,
  participant_roles: ROLES, event_relation_kinds: RELATION_KINDS };

/* the door's arm, over the real store, in an isolate where events never started */
async function door(query = "") {
  const ns = await mf.getDurableObjectNamespace("STORE");
  const stub = ns.get(ns.idFromName("bio"));
  const gate = { needs: () => null, mode: () => "session" };
  const res = await affordancesOp(new URL(`http://x/api/?op=affordances${query}`), stub,
    { json, doAnswer, storeSilent, storeRefusal, gate, viewer: null, identity: null, author: null, by: null,
      storeName: "t", cls: "admin" });
  return { status: res.status, result: (await res.json()).result };
}

test("R39: this isolate has not started events (the Worker's case)", () => {
  assert.equal(owners().some((o) => o.owner === "events"), false);
});

test("R39: the door's op=affordances answer holds the events' five vocabularies, the owner's values, a word each", async () => {
  const { status, result } = await door();
  assert.equal(status, 200);
  const v = result.vocabularies;
  for (const [key, values] of Object.entries(FIVE)) {
    assert.ok(v[key], `${key} is in the door's answer`);
    assert.deepEqual(v[key].values, [...values], key);
    for (const val of values) assert.equal(typeof v[key].words[val].word, "string", `${key}.${val} has a word`);
  }
});

test("R39: a role's word at the door is the one the Durable Object composes (the owner's registered word), not a provisional one", async () => {
  const { result } = await door();
  const ns = await mf.getDurableObjectNamespace("STORE");
  const fromStore = (await (await ns.get(ns.idFromName("bio")).fetch("http://do/affordancevocab")).json());
  const stored = (fromStore.result ?? fromStore).events_vocabularies;
  assert.deepEqual(result.vocabularies.participant_roles, stored.participant_roles);
  for (const r of ROLES) assert.notEqual(result.vocabularies.participant_roles.words[r].provisional, true, r);
});

test("R39: vocabulariesFor, which both arms of the door use, fills only the five, only from a well-formed store answer, and leaves the rest", () => {
  const good = { values: ["x"], words: { x: { word: "x" } } };
  const withStore = vocabulariesFor(null, { events_vocabularies: { event_kinds: good, line_kinds: good, participant_roles: { values: "no" } } });
  assert.deepEqual(withStore.event_kinds, good);
  assert.equal(Object.hasOwn(withStore, "participant_roles"), false, "a malformed vocabulary is left out");
  assert.notDeepEqual(withStore.line_kinds, good, "only the events' five are carried");
  assert.equal(Object.hasOwn(vocabulariesFor(null, {}), "event_kinds"), false, "a store that carries none leaves them out, never empty");
  assert.equal(Object.hasOwn(vocabulariesFor(null), "event_kinds"), false);
});
