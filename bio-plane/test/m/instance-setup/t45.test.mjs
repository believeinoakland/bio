/* T45 (T45-44): the group's declared stake (R77, R11), the records laws' stages checked when the profiles load (R76), and
   the group-identity source registered with public-read at start (R78), at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, providers, stubOver, doAnswer } from "./fixture.mjs";
import { INSTANCE_SETUP_CHECKS, INSTANCE_SETUP_TABLES, INSTANCE_SETUP_TABLE_DECLARATIONS, DECLARED_STAKE_SETTING,
         DECLARED_STAKE_MAX } from "../../../src/setup.mjs";
import { combine as realCombine, get as realGet, list as realList } from "../../../../jurisdictions/index.mjs";
import { PublicRead, DECLARED_STAKE_SETTING as PR_SETTING, STAKE_NONE_SENTENCE } from "../../../src/public-read/index.mjs";
import { notAnAdmin } from "../../../src/membership/index.mjs";

const post = async (m, path, body) => doAnswer(stubOver(m).fetch(new Request(`http://do/${path}`,
  { method: "POST", body: JSON.stringify(body) })));
const historyRows = (w) => w.st.db.prepare(`SELECT * FROM declared_stake_history`).all();
const settingRows = (w) => w.st.db.prepare(`SELECT * FROM settings WHERE name = 'declared_stake'`).all();

/* ---- R77, R11: the group's declared stake ---- */

test("R77 R11 an administrator's set is recorded through record-core's setSetting under declared_stake with by, read back by getSetting and by R11 as {stake, set_by, set_at} with its history oldest first", async () => {
  const w = await boot({ env: { INSTANCE_NAME: "river-town" } });
  assert.equal(DECLARED_STAKE_SETTING, PR_SETTING);
  assert.equal(DECLARED_STAKE_SETTING, "declared_stake");
  const r = w.m.declaredStakeSet({ stake: "  We are tenants of the buildings we write about.  ", by: "admin" });
  assert.equal(r.ok, true);
  assert.deepEqual([r.stake, r.set_by], ["We are tenants of the buildings we write about.", "admin"]);
  assert.match(r.set_at, /^\d{4}-\d\d-\d\dT/);
  /* the value public-read reads: the trimmed text, through getSetting */
  assert.equal(w.record.getSetting("declared_stake"), "We are tenants of the buildings we write about.");
  /* recorded with by, so the change is dated and attributed in record-core's own record */
  const rows = settingRows(w);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].set_by, "admin");
  const id = w.m.groupIdentity();
  assert.deepEqual(id.declared_stake, { stake: "We are tenants of the buildings we write about.", set_by: "admin", set_at: r.set_at });
  assert.deepEqual(id.declared_stake_history, [{ stake: "We are tenants of the buildings we write about.", set_by: "admin", set_at: r.set_at }]);
  /* a second set: the latest is read, and every earlier value stays readable, oldest first */
  const r2 = w.m.declaredStakeSet({ stake: "None of us is paid by any party.", by: "member:ada" });
  assert.equal(r2.ok, true);
  assert.equal(w.record.getSetting("declared_stake"), "None of us is paid by any party.");
  const id2 = w.m.groupIdentity();
  assert.deepEqual(id2.declared_stake, { stake: "None of us is paid by any party.", set_by: "member:ada", set_at: r2.set_at });
  assert.deepEqual(id2.declared_stake_history.map((h) => [h.stake, h.set_by]),
    [["We are tenants of the buildings we write about.", "admin"], ["None of us is paid by any party.", "member:ada"]]);
  assert.deepEqual(r2.history, id2.declared_stake_history);
  /* exactly 1,000 characters is a stake (the bound's control) */
  const full = "s".repeat(DECLARED_STAKE_MAX);
  assert.equal(DECLARED_STAKE_MAX, 1000);
  assert.equal(w.m.declaredStakeSet({ stake: full, by: "admin" }).ok, true);
  assert.equal(w.record.getSetting("declared_stake"), full);
  /* R11 keeps everything it answered before beside the stake */
  for (const k of ["group", "display_name", "domain", "domain_verified_at", "display_name_history", "domain_claim",
                   "domain_history", "domain_checks", "domain_checks_limit", "domain_checks_truncated"])
    assert.ok(k in id2, k);
});

test("R77 refusals: a by that is not an administrator, a machine credential included, is refused NOT_AN_ADMIN (membership.notAnAdmin) before the stake is read, and nothing is written (control: an administrator's set is recorded)", async () => {
  const prov = providers({ admins: ["admin", "class:admin"] });
  const w = await boot({ env: { INSTANCE_NAME: "river-town" }, prov });
  const expected = notAnAdmin("member:bo", "declaring what your group has at stake");
  for (const by of ["member:bo", "class:admin", "class:ai", null, "", undefined, 7]) {
    /* a malformed stake from a non-administrator is still NOT_AN_ADMIN: the first refusal is who asks */
    for (const stake of ["Our stake.", "x".repeat(DECLARED_STAKE_MAX + 1)]) {
      const r = w.m.declaredStakeSet({ stake, by });
      assert.equal(r.ok, false, JSON.stringify(by));
      assert.equal(r.reason, "NOT_AN_ADMIN", JSON.stringify(by));
      assert.deepEqual([r.code, r.check, r.translation], [expected.code, expected.check, expected.translation]);
    }
  }
  assert.equal(w.record.getSetting("declared_stake"), null);
  assert.deepEqual(settingRows(w), []);
  assert.deepEqual(historyRows(w), []);
  assert.deepEqual(w.m.groupIdentity().declared_stake, { stake: null, set_by: null, set_at: null });
  /* control */
  assert.equal(w.m.declaredStakeSet({ stake: "Our stake.", by: "admin" }).ok, true);
  assert.equal(w.record.getSetting("declared_stake"), "Our stake.");
});

test("R77 STAKE_MALFORMED (C-64.27): a stake of 1,001 characters, with a line break or a control character, empty, blank, or not text, is refused with its row and nothing is written; a stake already set stays", async () => {
  const w = await boot({ env: { INSTANCE_NAME: "river-town" } });
  assert.equal(w.m.declaredStakeSet({ stake: "Held before.", by: "admin" }).ok, true);
  const before = [settingRows(w).length, historyRows(w).length];
  const row = INSTANCE_SETUP_CHECKS.STAKE_MALFORMED;
  assert.equal(row.check, "C-64.27");
  for (const bad of ["x".repeat(DECLARED_STAKE_MAX + 1), "two\nlines", "carriage\rreturn", "a b", "tab\there", "\u0007bell",
                     "", "   ", 42, true, {}, ["a"], undefined]) {
    const r = w.m.declaredStakeSet({ stake: bad, by: "admin" });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "STAKE_MALFORMED", "STAKE_MALFORMED", "C-64.27", row.translation],
      JSON.stringify(bad));
    assert.match(r.detail, /Nothing was changed/);
  }
  /* the bound counts characters, not UTF-16 units: 1,000 astral characters are a stake */
  assert.equal(w.m.declaredStakeSet({ stake: "😀".repeat(DECLARED_STAKE_MAX), by: "admin" }).ok, true);
  assert.equal(w.m.declaredStakeSet({ stake: "Held before.", by: "admin" }).ok, true);
  assert.deepEqual([settingRows(w).length, historyRows(w).length], [before[0] + 2, before[1] + 2]);
  assert.equal(w.record.getSetting("declared_stake"), "Held before.");
  /* R63: the row's words name the group's own Civicsmith as "your group's", never "copy", "instance", "plane" or "server" */
  assert.match(row.translation, /your group/i);
  assert.doesNotMatch(row.translation, /\b(copy|instance|plane|server)\b/i);
  assert.match(row.where, /^src\/setup\.mjs declaredStakeSet > is-declared-stake$/);
});

test("R77 R11 null clears the stake: getSetting answers null, R11 answers stake: null with who cleared it and when, and the history keeps the earlier value; with none ever set every reader answers null, never a default or an empty text", async () => {
  const w = await boot({ env: { INSTANCE_NAME: "river-town" } });
  const never = w.m.groupIdentity();
  assert.deepEqual(never.declared_stake, { stake: null, set_by: null, set_at: null });
  assert.deepEqual(never.declared_stake_history, []);
  assert.equal(w.record.getSetting("declared_stake"), null);
  w.m.declaredStakeSet({ stake: "Our stake.", by: "admin" });
  const c = w.m.declaredStakeSet({ stake: null, by: "member:ada" });
  assert.deepEqual([c.ok, c.stake, c.set_by], [true, null, "member:ada"]);
  assert.equal(w.record.getSetting("declared_stake"), null);
  const id = w.m.groupIdentity();
  assert.deepEqual(id.declared_stake, { stake: null, set_by: "member:ada", set_at: c.set_at });
  assert.deepEqual(id.declared_stake_history.map((h) => [h.stake, h.set_by]), [["Our stake.", "admin"], [null, "member:ada"]]);
  /* an absent stake is no clear: it is malformed, and nothing is written */
  assert.equal(w.m.declaredStakeSet({ by: "admin" }).reason, "STAKE_MALFORMED");
  assert.equal(historyRows(w).length, 2);
  /* public-read's reader, the real one, reads the latest through getSetting: a set, then a clear (its "none declared") */
  const pr = new PublicRead({ storage: w.st, publication: {}, docket: {}, record: () => w.record });
  assert.equal(pr.groupFields().stake, null);
  assert.match(pr.groupFields().detail, new RegExp(STAKE_NONE_SENTENCE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  w.m.declaredStakeSet({ stake: "Read by the fields.", by: "admin" });
  assert.equal(pr.groupFields().stake, "Read by the fields.");
});

test("R77 R29 op=declaredstakeset: by is the control plane's stamp, read from the query after the body, so a body naming its own by is overwritten", async () => {
  const w = await boot({ env: { INSTANCE_NAME: "river-town" } });
  const refused = await post(w.m, "declaredstakeset?by=member:mallory", { stake: "Ours.", by: "admin" });
  assert.equal(refused.result.reason, "NOT_AN_ADMIN");
  assert.equal(w.record.getSetting("declared_stake"), null);
  const set = await post(w.m, "declaredstakeset?by=admin", { stake: "Ours.", by: "member:mallory" });
  assert.deepEqual([set.result.ok, set.result.set_by], [true, "admin"]);
  assert.equal(w.m.groupIdentity().declared_stake.set_by, "admin");
  const cleared = await post(w.m, "declaredstakeset?by=admin", { stake: null });
  assert.equal(cleared.result.stake, null);
  /* the credentialed read over the routes carries it */
  const id = await doAnswer(stubOver(w.m).fetch("http://do/groupidentity"));
  assert.deepEqual(id.result.declared_stake_history.map((h) => h.stake), ["Ours.", null]);
  /* the public projection (R10) does not: who set the stake is the administrators' */
  const pub = await doAnswer(stubOver(w.m).fetch("http://do/groupidentitypublic"));
  assert.equal("declared_stake" in pub.result, false);
  assert.equal("declared_stake_history" in pub.result, false);
});

test("R77 R28 the stake's history is this module's own table, append-only (no statement updates or deletes a row), declared to record-core exempt from purge, and a purge in either form leaves it and the setting", async () => {
  const w = await boot({ env: { INSTANCE_NAME: "river-town" } });
  assert.ok(INSTANCE_SETUP_TABLES.includes("declared_stake_history"));
  const d = INSTANCE_SETUP_TABLE_DECLARATIONS.find((t) => t.name === "declared_stake_history");
  assert.deepEqual([d.purge, d.version_chain, d.export], ["exempt", true, "admin-only"]);
  w.m.declaredStakeSet({ stake: "Ours.", by: "admin" });
  w.m.declaredStakeSet({ stake: null, by: "admin" });
  w.m.declaredStakeSet({ stake: "Ours again.", by: "admin" });
  const writes = w.st.statements.filter((q) => /declared_stake_history/.test(q) && /^\s*(INSERT|UPDATE|DELETE|REPLACE)/i.test(q));
  assert.ok(writes.length >= 3);
  for (const q of writes) assert.match(q, /^\s*INSERT INTO declared_stake_history/);
  assert.equal(w.record.purge({}).ok, true);
  assert.equal(historyRows(w).length, 3);
  assert.equal(w.record.getSetting("declared_stake"), "Ours again.");
});

/* ---- R76: the records laws' stages, checked when the profiles load ---- */

/* A held, non-test profile whose combined view is real jurisdictions' `combine` over the test profile, its records laws
   replaced by `laws` (each as a profile states it: `stages` optional). The profile id is held and not a test, so
   `profilesSet` records it. */
function jurisdictionsWith(laws, { combineThrows = false } = {}) {
  const base = realGet("test-port-ellery");
  const p = { ...base, id: "loaded-place", test: false };
  return {
    list: () => [...realList(), { id: p.id, name: p.name, covers: p.covers, test: false }],
    get: (id) => (id === p.id ? p : realGet(id)),
    combine: (ids) => {
      if (combineThrows) throw new Error("no combine");
      const c = realCombine(["test-port-ellery"]);
      return ids.includes(p.id) ? { ...c, view: { ...c.view, records_laws: laws } } : realCombine(ids);
    },
  };
}
const KNOWN = [{ stage: "request", label: "application", citation: "Test § 1" }, { stage: "appeal", label: "review", citation: "Test § 2" }];

test("R76 profiles() and profilesSet answer stage_findings: a law whose stages list {stage: 'mediation'} answers one finding naming the law and the stage (control: the same law with known stages answers []); a law with no stages adds nothing", async () => {
  for (const [laws, want] of [
    [[{ level: "state", name: "Records Act", citation: "T § 1", stages: [...KNOWN, { stage: "mediation", label: "mediation", citation: "T § 3" }] },
      { level: "city", name: "City Bylaw", citation: "T § 4" }],
     [{ law: "Records Act", check: "LAW_STAGE_UNKNOWN", stage: "mediation" }]],
    [[{ level: "state", name: "Records Act", citation: "T § 1", stages: KNOWN }, { level: "city", name: "City Bylaw", citation: "T § 4" }], []],
    [[{ level: "city", name: "City Bylaw", citation: "T § 4" }], []],
    [[], []],
  ]) {
    const w = await boot({ env: { INSTANCE_NAME: "river-town" }, more: { jurisdictions: jurisdictionsWith(laws) } });
    const set = w.m.profilesSet({ profiles: ["loaded-place"], by: "admin" });
    assert.equal(set.ok, true);
    assert.deepEqual(set.stage_findings, want, JSON.stringify(laws));
    /* it reports and refuses nothing: the list is recorded and the profile stays active */
    assert.deepEqual(w.record.getSetting("jurisdiction_profiles"), ["loaded-place"]);
    const p = w.m.profiles();
    assert.equal(p.ok, true);
    assert.deepEqual(p.profiles.map((x) => x.id), ["loaded-place"]);
    assert.deepEqual(p.stage_findings, want);
  }
});

test("R76 each unknown stage of each law is one finding, in the laws' and the stages' order, naming the law; every stage of either direction of a records request is known; an item that is no stage is reported as it is", async () => {
  const { CORRESPONDENCE_STAGES } = await import("../../../src/action-grammar/index.mjs");
  const all = [...CORRESPONDENCE_STAGES.sent, ...CORRESPONDENCE_STAGES.received].map((stage) => ({ stage, label: stage, citation: "T" }));
  const laws = [
    { level: "state", name: "Act A", citation: "A", stages: [{ stage: "mediation" }, ...all, { stage: "arbitration" }] },
    { level: "federal", name: "Act B", citation: "B", stages: all },
    { level: "county", name: "Act C", citation: "C", stages: [{ stage: "Request" }, { label: "no stage" }] },
  ];
  const w = await boot({ env: { INSTANCE_NAME: "river-town" }, more: { jurisdictions: jurisdictionsWith(laws) } });
  w.record.setSetting("jurisdiction_profiles", ["loaded-place"], "admin");
  assert.deepEqual(w.m.profiles().stage_findings, [
    { law: "Act A", check: "LAW_STAGE_UNKNOWN", stage: "mediation" },
    { law: "Act A", check: "LAW_STAGE_UNKNOWN", stage: "arbitration" },
    { law: "Act C", check: "LAW_STAGE_UNKNOWN", stage: "Request" },
    { law: "Act C", check: "LAW_STAGE_UNKNOWN", stage: null },
  ]);
});

test("R76 over the real test profile and with no active profile: the held laws' stages are all known, so stage_findings is []; it writes nothing", async () => {
  const w = await boot({ env: { INSTANCE_NAME: "river-town" } });
  assert.deepEqual(w.m.profiles().stage_findings, []);
  w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "admin");
  const before = w.st.statements.length;
  const p = w.m.profiles();
  assert.deepEqual(p.stage_findings, []);
  const writes = w.st.statements.slice(before).filter((q) => /^\s*(INSERT|UPDATE|DELETE|REPLACE)/i.test(q));
  assert.deepEqual(writes, []);
});

test("R76 a lawStagesFindings that throws is answered stage_findings: null with why, never [], and never throws; the profiles stay active and profilesSet still records the list", async () => {
  const laws = [{ level: "state", name: "Records Act", citation: "T", stages: KNOWN }];
  const w = await boot({ env: { INSTANCE_NAME: "river-town" },
                         more: { jurisdictions: jurisdictionsWith(laws), lawStagesFindings: () => { throw new Error("broken check"); } } });
  const set = w.m.profilesSet({ profiles: ["loaded-place"], by: "admin" });
  assert.equal(set.ok, true);
  assert.equal(set.stage_findings, null);
  assert.match(set.stage_findings_detail, /could not be checked/);
  assert.deepEqual(w.record.getSetting("jurisdiction_profiles"), ["loaded-place"]);
  const p = w.m.profiles();
  assert.deepEqual([p.ok, p.stage_findings], [true, null]);
  /* a check that answers no list is the same */
  const w2 = await boot({ env: { INSTANCE_NAME: "river-town" },
                          more: { jurisdictions: jurisdictionsWith(laws), lawStagesFindings: () => "nonsense" } });
  w2.record.setSetting("jurisdiction_profiles", ["loaded-place"], "admin");
  assert.equal(w2.m.profiles().stage_findings, null);
  /* control: a law with no stages is never handed to the check, so a broken check with none to check answers [] */
  const w3 = await boot({ env: { INSTANCE_NAME: "river-town" },
                          more: { jurisdictions: jurisdictionsWith([{ level: "city", name: "Bylaw", citation: "T" }]),
                                  lawStagesFindings: () => { throw new Error("broken check"); } } });
  w3.record.setSetting("jurisdiction_profiles", ["loaded-place"], "admin");
  assert.deepEqual(w3.m.profiles().stage_findings, []);
});

/* ---- R78: the group-identity source ---- */

test("R78 at start this module registers once as public-read's group-identity source, its identity answering R10's groupIdentityPublic; a second start registers nothing", async () => {
  const w = await boot({ env: { INSTANCE_NAME: "river-town" } });
  assert.deepEqual(w.started.identity, { ok: true });
  assert.equal(w.prov.identities.length, 1);
  const identity = w.prov.identities[0];
  assert.deepEqual(identity(), w.m.groupIdentityPublic());
  /* it answers R10 as it stands at each read, never a value read once */
  w.m.groupNameSet({ name: "River Town Tenants", by: "admin" });
  assert.equal(identity().display_name, "River Town Tenants");
  assert.deepEqual(identity(), w.m.groupIdentityPublic());
  const again = await w.m.start();
  assert.equal(again.started, false);
  assert.equal(w.prov.identities.length, 1);
});

test("R78 through the real public-read: groupFields answers the group, its display name and domain exactly as R10 does; a refused or absent registration is reported in the start and never throws", async () => {
  const prov = providers();
  const st0 = await boot({ env: { INSTANCE_NAME: "river-town" }, prov, more: { publicRead: null } });
  /* a real PublicRead over the same storage and record, registered by a second boot of the same database */
  const pr = new PublicRead({ storage: st0.st, publication: {}, docket: {}, record: () => st0.record });
  const w = await boot({ st: st0.st, prov, more: { publicRead: pr } });
  assert.deepEqual(w.started.identity, { ok: true });
  w.m.groupNameSet({ name: "River Town Tenants", by: "admin" });
  const f = pr.groupFields();
  const pub = w.m.groupIdentityPublic();
  assert.deepEqual([f.group, f.name, f.domain, f.domain_verified_at], [pub.group, pub.display_name, pub.domain, pub.domain_verified_at]);
  assert.equal(f.group, "river-town");
  /* a second registration is refused by public-read; the start says so and stands */
  const w2 = await boot({ st: st0.st, prov, more: { publicRead: pr } });
  assert.deepEqual([w2.started.ok, w2.started.identity.ok, w2.started.identity.reason], [true, false, "PROVIDER_DECLARED"]);
  /* none to register with, or one that throws */
  const none = await boot({ more: { publicRead: null } });
  assert.deepEqual([none.started.ok, none.started.identity.ok], [true, false]);
  const throws = await boot({ more: { publicRead: { registerGroupIdentity: () => { throw new Error("boom"); } } } });
  assert.deepEqual([throws.started.ok, throws.started.identity.ok], [true, false]);
});
