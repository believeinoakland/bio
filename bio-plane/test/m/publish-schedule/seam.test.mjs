/* publish-schedule — T41-37: the seam with `publication` (R5, R8; K31's pattern, `publication` R77; K2438, K2483), the
   table's declaration (R10), no place named (R11), and the factory (K61). R8 is driven against a stand-in publication
   offering R77's shape, since the real one offers it only from T41-36's merge; the test against the real publication is
   red by name until then (K2483), as is R10's owner arm while `publication` still declares `scheduled_editions` (plan
   rule 4 (13)). Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, SIG, KEY, NOW, MACHINE } from "./fixture.mjs";
import { storage } from "../publication/fixture.mjs";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { publishScheduleOf, PUBLISH_SCHEDULE_DECLARATIONS, SCHEDULED_CHECK_UNAVAILABLE } from "../../../src/publish-schedule/index.mjs";

const CASE = "CASE-2026-0001", CASE2 = "CASE-2026-0002";
const AT = { date: "2026-10-01", time: "09:00" }, AT_UTC = "2026-10-01T12:00:00Z";
const docOf = (w, c = CASE) => w.row(`SELECT doc_sha FROM case_documents WHERE case_id=? AND edition=1`, c);

function base() {
  const w = world();
  w.member("olive"); w.member("zed");
  const proj = w.project("Parks", "olive");
  w.inquiry("INQ-2026-0001");
  const roles = [{ target: "INQ-2026-0001", version_sha: w.head("INQ-2026-0001") }];
  for (const c of [CASE, CASE2]) w.prepare(c, 1, { project: proj, roles });
  assert.equal(w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "admin").ok, true);
  const sched = (ps = w.ps, c = CASE) => w.record.transact(() => ps.scheduleEdition({ case: c, edition: 1,
    docSha: docOf(w, c).doc_sha, signature: SIG(1), signer: "olive", deliveredBy: V("olive"), at: AT, checked: {}, by: V("olive") }));
  const publisher = { publishScheduled(entry, now) {
    const r = w.record.transact(() => w.p.commitCaseEdition({ case: entry.case, edition: entry.edition, project: proj,
      scope: "The question.", roster: roles.map((x) => ({ bundle_id: x.target, version_sha: x.version_sha })),
      sigArmored: entry.signature, attestorKey: KEY, attestorMember: entry.signer, gateVersion: "plane-gate/test",
      deliveredBy: entry.delivered_by, at: now }));
    return r.ok ? { published: true, published_at: now } : { stopped: [{ code: r.reason, translation: "no" }] };
  } };
  return { w, proj, roles, sched, publisher };
}

/* A stand-in publication offering exactly R77's shape (and R1's standing test, the real one's), keeping each
   registration; `r77: false` offers no R77, as today's publication. */
function standIn(w, { r77 = true } = {}) {
  const got = [];
  return { got, hasCaseStanding: (doc, viewer) => w.p.hasCaseStanding(doc, viewer),
           ...(r77 ? { registerWaitingEditions(src) {
             if (got.length) return { ok: false, reason: "PROVIDER_DECLARED" };
             got.push(src);
             return { ok: true, module: src.module };
           } } : {}) };
}
const onHost = (w, publication, host = { storage: w.st }) => publishScheduleOf(host, { storage: w.st, record: w.record,
  membership: w.membership, publication, now: () => w.clock.now });

/* ---------------------------------------------------------------- R5 */

test("R5 a waiting edition was signed when R1 recorded it: signedAtOf answers the ceremony's instant while it waits and null for a case edition that does not wait (none set, cancelled, published, stopped); publication's commit then holds it as signed_at beside its own published_at; it writes nothing and never throws", async () => {
  const { w, sched, publisher } = base();
  assert.equal(w.ps.signedAtOf(CASE, 1), null, "none set: the commit's own instant stands");
  sched();
  w.clock.now = "2026-09-29T00:00:00Z";
  const before = w.snapshot();
  assert.equal(w.ps.signedAtOf(CASE, 1), NOW, "the ceremony's instant, not now");
  assert.equal(w.ps.signedAtOf(` ${CASE} `, "1"), NOW, "the id trimmed, the edition a number");
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  assert.equal(w.ps.signedAtOf(CASE2, 1), null, "another case edition does not wait");
  assert.equal(w.ps.signedAtOf(CASE, 2), null, "another edition of the case does not wait");
  for (const bad of [null, undefined, "", 7, {}, []]) assert.equal(w.ps.signedAtOf(bad, 1), null, JSON.stringify(bad));
  /* published at its time: publication's commit holds the ceremony's instant as signed_at */
  w.ps.registerScheduledPublisher("ratification", publisher);
  await w.ps.publishDue("2026-10-01T12:00:05Z");
  assert.deepEqual(w.row(`SELECT signed_at, published_at FROM published_cases WHERE case_id=?`, CASE),
                   { signed_at: NOW, published_at: "2026-10-01T12:00:05Z" });
  assert.equal(w.ps.signedAtOf(CASE, 1), null, "published: it no longer waits");
  /* cancelled and stopped */
  sched(w.ps, CASE2);
  assert.equal(w.ps.signedAtOf(CASE2, 1), "2026-09-29T00:00:00Z", "its own ceremony's instant");
  assert.equal(w.ps.publishAtCancel({ case: CASE2, edition: 1, by: V("olive") }).ok, true);
  assert.equal(w.ps.signedAtOf(CASE2, 1), null, "cancelled");
  w.st.db.exec(`DROP TABLE scheduled_editions`);
  assert.doesNotThrow(() => w.ps.signedAtOf(CASE, 1));
  assert.equal(w.ps.signedAtOf(CASE, 1), null, "never throws");
});

/* ---------------------------------------------------------------- R8 */

test("R8 at its creation this module registers once with publication.registerWaitingEditions (publication R77) the source {isWaiting, signedAtOf}: isWaiting true exactly while the case edition waits, signedAtOf R5's instant while it waits else null; both synchronous, reading only this module's table, writing nothing and never throwing (over a stand-in publication offering R77's shape)", async () => {
  const { w, sched } = base();
  const pub = standIn(w);
  const host = { storage: w.st };
  const ps = onHost(w, pub, host);
  assert.equal(pub.got.length, 1, "registered once, at creation");
  assert.deepEqual(ps.waitingSource, { ok: true, module: "publish-schedule" }, "R77's answer kept");
  const src = pub.got[0];
  assert.equal(src.module, "publish-schedule");
  assert.deepEqual(Object.keys(src).filter((k) => typeof src[k] === "function").sort(), ["isWaiting", "signedAtOf"]);
  assert.equal(onHost(w, pub, host), ps, "one instance per host: never registered twice");
  assert.equal(pub.got.length, 1);
  /* none waits */
  assert.deepEqual([src.isWaiting(CASE, 1), src.signedAtOf(CASE, 1)], [false, null]);
  sched(ps);
  const before = w.snapshot();
  const answers = [src.isWaiting(CASE, 1), src.signedAtOf(CASE, 1)];
  assert.deepEqual(answers, [true, NOW], "while it waits");
  assert.equal(answers.some((a) => a instanceof Promise), false, "synchronous");
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  /* the negative controls: another case edition, another edition, a malformed id */
  assert.deepEqual([src.isWaiting(CASE2, 1), src.signedAtOf(CASE2, 1)], [false, null]);
  assert.deepEqual([src.isWaiting(CASE, 2), src.signedAtOf(CASE, 2)], [false, null]);
  for (const bad of [null, undefined, "", 7, {}]) assert.deepEqual([src.isWaiting(bad, 1), src.signedAtOf(bad, 1)], [false, null]);
  /* inside the caller's transaction, as publication R21 asks it */
  w.record.transact(() => assert.equal(src.isWaiting(CASE, 1), true));
  /* cancelled: no longer waits */
  assert.equal(ps.publishAtCancel({ case: CASE, edition: 1, by: V("olive") }).ok, true);
  assert.deepEqual([src.isWaiting(CASE, 1), src.signedAtOf(CASE, 1)], [false, null]);
  sched(ps);
  w.st.db.exec(`DROP TABLE scheduled_editions`);
  assert.deepEqual([src.isWaiting(CASE, 1), src.signedAtOf(CASE, 1)], [false, null], "never throws");
});

test("R8 with a publication that offers no registerWaitingEditions (publication before T41-36), nothing is registered and this module is created all the same (the negative control)", () => {
  const { w } = base();
  const pub = standIn(w, { r77: false });
  const ps = onHost(w, pub);
  assert.equal(ps.waitingSource, null, "nothing registered");
  assert.equal(pub.got.length, 0);
  assert.equal(ps.publishWake(), null, "created and serving");
});

test("R8 (against the real publication; red by name from T41-37's merge until T41-36's, K2483) this module registers its source with publication R77 at creation, and publication's answer is ok", () => {
  const { w } = base();
  assert.equal(typeof w.p.registerWaitingEditions, "function", "publication offers R77 (T41-36)");
  assert.deepEqual(w.ps.waitingSource, { ok: true, module: "publish-schedule" });
});

/* ---------------------------------------------------------------- R10 */

/* A store where no other module declares `scheduled_editions`: record-core and membership on their own storage, and a
   stand-in publication. */
function freshStore() {
  const host = { storage: storage({ workerd: true }) };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) host.storage.db.exec(t);
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  return { host, record, membership };
}

test("R10 scheduled_editions is declared to record-core's purge with the classes publication declared it with: cleared by the whole-store form where state <> 'published', no expunge, export to administrators, stored, seen as the group; where no other module declares it, the declaration is this module's; while one does, the refusal TABLE_DECLARED is kept and never thrown", () => {
  const want = { name: "scheduled_editions", keys: [], whole: "state <> 'published'", purge: "clear", expunge: "none",
                 export: "admin-only", derive: "stored", version_chain: false, sight: "group" };
  assert.deepEqual(PUBLISH_SCHEDULE_DECLARATIONS.map((d) => ({ ...d })), [want]);
  /* the purge-class arm, in the store as it stands: the declared classes are these, whoever declared them */
  const { w } = base();
  const held = w.record.declaredTables().find((t) => t.name === "scheduled_editions");
  const { module: _m, ...classes } = held;
  assert.deepEqual(classes, want);
  assert.ok(w.ps.purgeDeclaration && typeof w.ps.purgeDeclaration === "object", "the answer kept");
  assert.ok(w.ps.purgeDeclaration.ok === true || w.ps.purgeDeclaration.reason === "TABLE_DECLARED", JSON.stringify(w.ps.purgeDeclaration));
  /* where no other module declares it: this module's declaration, the table created */
  const f = freshStore();
  const ps = publishScheduleOf(f.host, { storage: f.host.storage, record: f.record, membership: f.membership,
                                         publication: { hasCaseStanding: () => false } });
  assert.deepEqual(ps.purgeDeclaration, { ok: true });
  const mine = f.record.declaredTables().find((t) => t.name === "scheduled_editions");
  assert.deepEqual(mine, { module: "publish-schedule", ...want });
  /* the negative control: a second declaration of the table is refused TABLE_DECLARED, nothing declared */
  const again = f.record.declareTable("other", PUBLISH_SCHEDULE_DECLARATIONS.map((t) => ({ ...t })));
  assert.equal(again.reason, "TABLE_DECLARED");
  assert.equal(f.record.declaredTables().filter((t) => t.name === "scheduled_editions").length, 1);
  /* the whole-store purge clears a waiting row and keeps a published one */
  for (const state of ["waiting", "published", "stopped", "cancelled"])
    f.host.storage.sql.exec(`INSERT INTO scheduled_editions (case_id,edition,doc_sha,sig_armored,signed_at,at_date,at_time,zone,
      publish_at,state) VALUES (?,1,'s','g',?,'2026-10-01','09:00','America/Halifax',?,?)`, `CASE-${state}`, NOW, AT_UTC, state);
  f.record.purge({});
  assert.deepEqual([...f.host.storage.sql.exec(`SELECT state FROM scheduled_editions`)].map((r) => r.state), ["published"]);
});

test("R10 (the owner arm; red by name from T41-37's merge until T41-36's, plan rule 4 (13)) in the store the plane builds, scheduled_editions is declared by this module, publication no longer declaring it", () => {
  const { w } = base();
  assert.deepEqual(w.ps.purgeDeclaration, { ok: true });
  assert.equal(w.record.declaredTables().find((t) => t.name === "scheduled_editions").module, "publish-schedule");
});

/* ---------------------------------------------------------------- R11 */

test("R11 no place is named in this module's behaviour or outward text", async () => {
  const { w, sched } = base();
  const out = [sched(), sched(w.ps, CASE2), w.ps.scheduledEditions({}), w.ps.waitingEditionOf(CASE),
    w.ps.publishAtMove({ case: CASE, edition: 1, at: { date: "2026-09-01", time: "09:00" }, by: V("olive") }),
    w.ps.publishAtMove({ case: CASE, edition: 1, at: { date: "bad" }, by: V("olive") }),
    w.ps.publishAtCancel({ case: CASE, edition: 1, by: MACHINE }), w.ps.publishAtCancel({ case: CASE, edition: 1, by: V("zed") }),
    w.op("publishschedule", { viewer: V("olive") }), w.op("publishatcancel", { by: V("olive") }, { case: CASE2, edition: 1 }),
    w.ps.registerScheduledPublisher("x", {}), SCHEDULED_CHECK_UNAVAILABLE, await w.ps.publishDue("2026-10-02T00:00:00Z")];
  const outward = JSON.stringify(out);
  assert.ok(outward.includes("SCHEDULED_CHECK_UNAVAILABLE") && outward.includes("NOT_WAITING"), "the control: the text was read");
  for (const place of ["Oakland", "California", "Alameda", "Berkeley", "San Francisco", "Sacramento", "Brown Act", "CPRA",
                       "United States", "County", "City of"])
    assert.equal(outward.includes(place), false, `names ${place}`);
});

/* ---------------------------------------------------------------- the factory (K61) */

test("R1 R10 the factory: one instance per host; it creates scheduled_editions with publication's DDL, so a running store's rows are kept, with no data move", () => {
  const { w, sched } = base();
  sched();
  const rows = w.rows(`SELECT * FROM scheduled_editions`);
  assert.equal(publishScheduleOf(w.host), w.ps, "one instance per host");
  w.ps.migrate();
  assert.deepEqual(w.rows(`SELECT * FROM scheduled_editions`), rows, "every boot keeps the rows");
  const cols = (t) => w.rows(`PRAGMA table_info(${t})`).map((c) => [c.name, c.type, c.notnull, c.dflt_value]);
  assert.equal(cols("scheduled_editions").length, 19);
  const idx = w.rows(`SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='scheduled_editions' AND name NOT LIKE 'sqlite_%' ORDER BY name`);
  assert.deepEqual(idx.map((r) => r.name), ["scheduled_editions_case", "scheduled_editions_due"]);
});
