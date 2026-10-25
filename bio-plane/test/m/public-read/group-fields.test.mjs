/* public-read — R34 (T45; N883, N892 (d); Actions D16, D28d; v0.2 rules 14, 21) and R10's amendment: the group's
   per-group fields. `registerGroupIdentity` takes the one identity source once; `groupFields()` answers the source's
   identity and `record-core`'s setting `declared_stake`, stated where undetermined or absent, synchronously, reading
   nothing else and never throwing; `inbandQuartet` carries them beside `hash`, never inside it; `publishedCase` answers
   them as current, outside the signed document and the case file. Each claim has its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, publishedSix } from "./fixture.mjs";
import { PublicRead, DECLARED_STAKE_SETTING, GROUP_FIELDS_SENTENCE, GROUP_IDENTITY_UNDETERMINED_SENTENCE,
         STAKE_NONE_SENTENCE, STAKE_UNDETERMINED_SENTENCE, GROUP_FIELDS_CURRENT_SENTENCE } from "../../../src/public-read/index.mjs";
import { inbandQuartet, canonicalBytes } from "../../../src/inband.mjs";
import { SETTING_UNREADABLE } from "../../../src/record-core/index.mjs";

const KEYS = ["group", "name", "domain", "domain_verified_at", "stake", "detail", "matter_stake"];
/* instance-setup R10's public answer, as its `groupIdentityPublic` spells it */
const IDENTITY = { ok: true, group: "parks-group", display_name: "Friends of the Parks", domain: "parks.example",
                   domain_verified_at: "2026-10-01T00:00:00Z" };
// fixtures-contract: instance-setup group-identity-public
const NO_SLUG = { ok: true, group: null, display_name: null, domain: null, domain_verified_at: null,
                  detail: "no group is recorded for this instance" };
/* A record-core stand-in answering `getSetting` from `settings`, logging every name asked; `fail` makes it throw. */
const recordOn = (settings = {}, { fail = false } = {}) => {
  const asked = [];
  return { asked, getSetting(name) { asked.push(name); if (fail) throw new Error("storage unreadable");
                                     return Object.hasOwn(settings, name) ? settings[name] : null; } };
};
const bare = (record) => new PublicRead({ storage: { sql: { exec() { throw new Error("no SQL on this path"); } } },
                                          publication: {}, docket: {}, record });

test("R34 registerGroupIdentity takes the one identity source once: a second is PROVIDER_DECLARED, one without the door PROVIDER_MALFORMED, each registering nothing", () => {
  const r = bare(recordOn());
  for (const bad of [undefined, {}, { identity: "groupIdentityPublic" }, { identity: { group: "x" } }]) {
    const out = r.registerGroupIdentity(bad);
    assert.deepEqual([out.ok, out.reason], [false, "PROVIDER_MALFORMED"]);
    assert.equal(typeof out.detail, "string");
  }
  assert.equal(r.groupFields().group, null, "a malformed registration registered nothing");
  assert.deepEqual(r.registerGroupIdentity({ identity: () => IDENTITY }), { ok: true });
  const second = r.registerGroupIdentity({ identity: () => ({ ...IDENTITY, group: "squatter" }) });
  assert.deepEqual([second.ok, second.reason], [false, "PROVIDER_DECLARED"]);
  assert.equal(r.groupFields().group, "parks-group", "the first registration stands");
  /* negative control: a fresh instance takes a source a first time */
  assert.equal(bare(recordOn()).registerGroupIdentity({ identity: () => IDENTITY }).ok, true);
});

test("R34 groupFields answers {group, name, domain, domain_verified_at, stake, detail} synchronously, the identity exactly as the registered source answers it", () => {
  const r = bare(recordOn({ [DECLARED_STAKE_SETTING]: "We maintain two of the parks we report on." }));
  r.registerGroupIdentity({ identity: () => IDENTITY });
  const g = r.groupFields();
  assert.equal(typeof g.then, "undefined", "not a promise");
  assert.deepEqual(Object.keys(g), KEYS);
  assert.deepEqual(g, { group: "parks-group", name: "Friends of the Parks", domain: "parks.example",
                        domain_verified_at: "2026-10-01T00:00:00Z", stake: "We maintain two of the parks we report on.",
                        detail: GROUP_FIELDS_SENTENCE, matter_stake: null });
  /* a source with an unverified domain answers its nulls, and they are served as answered, never filled */
  const u = bare(recordOn());
  u.registerGroupIdentity({ identity: () => ({ ...IDENTITY, domain: null, domain_verified_at: null }) });
  assert.deepEqual([u.groupFields().domain, u.groupFields().domain_verified_at, u.groupFields().name],
                   [null, null, "Friends of the Parks"]);
  /* a source recording no slug: its nulls, and its own stated absence carried */
  const n = bare(recordOn());
  n.registerGroupIdentity({ identity: () => NO_SLUG });
  assert.deepEqual([n.groupFields().group, n.groupFields().name], [null, null]);
  assert.match(n.groupFields().detail, /no group is recorded/);
  assert.doesNotMatch(n.groupFields().detail, /undetermined/, "an answered absence is not an undetermined identity");
  /* negative control: the answer moves with the source */
  let name = "Friends of the Parks";
  const m = bare(recordOn());
  m.registerGroupIdentity({ identity: () => ({ ...IDENTITY, display_name: name }) });
  name = "Parks Watch";
  assert.equal(m.groupFields().name, "Parks Watch");
});

test("R34 R13 with no source registered, or one that throws or answers no object, the identity reads null with its detail, never a guess", () => {
  const cases = [["none", null], ["throws", () => { throw new Error("setup down"); }], ["null", () => null],
                 ["a string", () => "parks-group"], ["a list", () => [IDENTITY]], ["a promise", async () => IDENTITY],
                 ["an answer that throws when read", () => ({ ...IDENTITY, get group() { throw new Error("unreadable"); } })]];
  for (const [what, identity] of cases) {
    const r = bare(recordOn());
    if (identity) assert.equal(r.registerGroupIdentity({ identity }).ok, true);
    const g = r.groupFields();
    assert.deepEqual([g.group, g.name, g.domain, g.domain_verified_at], [null, null, null, null], what);
    assert.ok(g.detail.includes(GROUP_IDENTITY_UNDETERMINED_SENTENCE), `${what}: the detail names the identity undetermined`);
  }
  /* negative control: a source answering an object is not undetermined */
  const ok = bare(recordOn());
  ok.registerGroupIdentity({ identity: () => IDENTITY });
  assert.equal(ok.groupFields().detail.includes(GROUP_IDENTITY_UNDETERMINED_SENTENCE), false);
});

test("R34 stake is record-core's setting declared_stake as held: never set null with its detail; unreadable \"undetermined\", never null", () => {
  /* the real record-core under the world (its R25) */
  const w = world();
  w.member("olive");
  assert.equal(w.pr.groupFields().stake, null, "never set");
  assert.ok(w.pr.groupFields().detail.includes(STAKE_NONE_SENTENCE));
  assert.equal(w.record.setSetting(DECLARED_STAKE_SETTING, "We run the park we report on.", "olive").ok, true);
  assert.equal(w.pr.groupFields().stake, "We run the park we report on.", "answered as held");
  assert.equal(w.pr.groupFields().detail.includes(STAKE_NONE_SENTENCE), false);
  assert.equal(w.record.setSetting(DECLARED_STAKE_SETTING, "We run two parks.", "olive").ok, true);
  assert.equal(w.pr.groupFields().stake, "We run two parks.", "the value last set");
  assert.equal(w.record.setSetting(DECLARED_STAKE_SETTING, null, "olive").ok, true);
  assert.equal(w.pr.groupFields().stake, null, "a cleared stake is none declared");
  /* unreadable: the setting throws, or no record-core can be reached */
  for (const record of [recordOn({}, { fail: true }), null, () => { throw new Error("no record-core"); }]) {
    const g = bare(record).groupFields();
    assert.equal(g.stake, "undetermined");
    assert.ok(g.detail.includes(STAKE_UNDETERMINED_SENTENCE));
    assert.equal(g.detail.includes(STAKE_NONE_SENTENCE), false, "an unread stake is never read as none");
  }
  /* negative control: the same stand-in, readable, answers null for an unset stake */
  assert.equal(bare(recordOn()).groupFields().stake, null);
});

test("R34 R10 groupFields reads only the identity source and the one setting declared_stake, takes no credential or viewer, writes nothing and never throws", () => {
  const rec = recordOn({ [DECLARED_STAKE_SETTING]: "x", jurisdiction_profiles: ["p"] });
  const r = bare(rec);
  let calls = 0;
  r.registerGroupIdentity({ identity: (...args) => { calls++; assert.equal(args.length, 0, "the source is handed nothing"); return IDENTITY; } });
  r.groupFields({ viewer: "olive", token: "t" });
  assert.deepEqual(rec.asked, [DECLARED_STAKE_SETTING], "no other setting is read");
  assert.equal(calls, 1);
  assert.equal(r.groupFields.length, 0, "it takes no argument");
  /* no SQL at all on this path: the stand-in storage throws on any */
  const worst = bare(recordOn({}, { fail: true }));
  worst.registerGroupIdentity({ identity: () => { throw new Error("down"); } });
  assert.doesNotThrow(() => worst.groupFields());
  /* writes nothing, in the real world */
  const w = world();
  w.member("olive");
  w.record.setSetting(DECLARED_STAKE_SETTING, "stake", "olive");
  const before = JSON.stringify(w.snapshot());
  w.pr.groupFields();
  assert.equal(JSON.stringify(w.snapshot()), before);
  /* negative control: the snapshot sees a write */
  w.record.setSetting(DECLARED_STAKE_SETTING, "another", "olive");
  assert.notEqual(JSON.stringify(w.snapshot()), before);
});

test("R34 R7 inbandQuartet carries group unchanged beside hash, never inside it: two groups' stamps over the same bytes carry the same hash; none given is null; the format stays bio-inband/1", async () => {
  const subject = { text: "We ask the office to post its agendas 72 hours ahead." };
  const a = bare(recordOn({ [DECLARED_STAKE_SETTING]: "none of our own" }));
  a.registerGroupIdentity({ identity: () => IDENTITY });
  const b = bare(recordOn({ [DECLARED_STAKE_SETTING]: "we run a park" }));
  b.registerGroupIdentity({ identity: () => ({ ...IDENTITY, group: "harbour-group", display_name: "Harbour Watch" }) });
  const ga = a.groupFields(), gb = b.groupFields();
  assert.notDeepEqual(ga, gb);
  const qa = (await inbandQuartet({ subject, over: "the joint text", group: ga })).quartet;
  const qb = (await inbandQuartet({ subject, over: "the joint text", group: gb })).quartet;
  const q0 = await inbandQuartet({ subject, over: "the joint text" });
  assert.equal(qa.hash.sha256, qb.hash.sha256, "the body fingerprint is computed without the fields");
  assert.equal(qa.hash.sha256, q0.quartet.hash.sha256);
  assert.deepEqual(q0.bytes, canonicalBytes(subject), "the hash covers the subject's bytes only");
  assert.deepEqual([qa.group, qb.group, q0.quartet.group], [ga, gb, null], "answered unchanged; none given is null");
  assert.equal(qa.format, "bio-inband/1");
  assert.ok(Object.keys(qa).indexOf("group") > Object.keys(qa).indexOf("hash") && !Object.hasOwn(qa.hash, "group"),
            "beside hash, not in it");
  /* a reader ignoring the field still verifies the hash */
  const { group: _g, ...ignoring } = qa;
  assert.equal(ignoring.hash.sha256, q0.quartet.hash.sha256);
  /* negative control: different bytes give a different hash, whatever the group */
  const qc = (await inbandQuartet({ subject: { text: "another" }, over: "x", group: ga })).quartet;
  assert.notEqual(qc.hash.sha256, qa.hash.sha256);
});

test("R34 R3 R23 publishedCase answers group_fields, the group's current identity and stake labeled current, never read from or written into the signed document or the case file", () => {
  const { w, CASE } = publishedSix();
  w.pr.registerGroupIdentity({ identity: () => IDENTITY });
  const first = w.read("publishedcase", { id: CASE });
  assert.equal(first.ok, true);
  assert.deepEqual(first.group_fields, { ...w.pr.groupFields(), current: true });
  assert.equal(first.group_fields.stake, null);
  assert.equal(first.group_fields_detail, GROUP_FIELDS_CURRENT_SENTENCE);
  /* a later declaration changes the answer at the read and no published byte */
  const STAKE = "We maintain the park this case is about.";
  assert.equal(w.record.setSetting(DECLARED_STAKE_SETTING, STAKE, "olive").ok, true);
  const later = w.read("publishedcase", { id: CASE });
  assert.equal(later.group_fields.stake, STAKE);
  assert.equal(later.group_fields.current, true);
  assert.deepEqual([later.document.doc_sha, later.document.text, later.manifest_sha, JSON.stringify(later.manifest)],
                   [first.document.doc_sha, first.document.text, first.manifest_sha, JSON.stringify(first.manifest)]);
  assert.equal(later.document.text.includes(STAKE), false, "not in the signed document");
  assert.equal(later.document.text.includes("Friends of the Parks"), false);
  const facts = w.read("casefilefacts", { caseId: CASE, edition: 1 });
  assert.equal(JSON.stringify(facts).includes(STAKE), false, "nothing the case file is built from carries them");
  /* negative control: with nothing registered, the answer carries the undetermined identity, not the earlier one */
  const { w: w2, CASE: C2 } = publishedSix();
  const none = w2.read("publishedcase", { id: C2 });
  assert.deepEqual([none.group_fields.group, none.group_fields.current], [null, true]);
  assert.ok(none.group_fields.detail.includes(GROUP_IDENTITY_UNDETERMINED_SENTENCE));
});

test("R34 (T46; N904; record-core R83) a stored declared_stake that is not valid JSON answers \"undetermined\" through the strict getSetting, never null; the same setting never set answers null", () => {
  const planted = ["{not json", "", "undefined", "'single'", "[1,", "NaN"];
  for (const value of planted) {
    const w = world();
    w.member("olive");
    /* control: the same setting never set answers null, with the none-declared detail */
    const unset = w.pr.groupFields();
    assert.equal(unset.stake, null, "never set");
    assert.ok(unset.detail.includes(STAKE_NONE_SENTENCE));
    assert.equal(unset.detail.includes(STAKE_UNDETERMINED_SENTENCE), false);
    /* a value held that is not valid JSON, planted as record-core's own table holds a setting */
    w.st.sql.exec(`INSERT INTO settings (name,value,set_by,set_at) VALUES (?,?,?,?)`, DECLARED_STAKE_SETTING, value,
                  "hand", "2026-10-12T00:00:00Z");
    const g = w.pr.groupFields();
    assert.equal(g.stake, "undetermined", `${JSON.stringify(value)} is unreadable, never none`);
    assert.ok(g.detail.includes(STAKE_UNDETERMINED_SENTENCE), "the detail says the declared stake could not be read");
    assert.equal(g.detail.includes(STAKE_NONE_SENTENCE), false);
    /* negative control: a readable value set after it is answered as held */
    assert.equal(w.record.setSetting(DECLARED_STAKE_SETTING, "We run the park.", "olive").ok, true);
    assert.equal(w.pr.groupFields().stake, "We run the park.");
  }
  /* a value held that is not text at all is unreadable too */
  const w = world();
  w.st.sql.exec(`INSERT INTO settings (name,value,set_by,set_at) VALUES (?,?,?,?)`, DECLARED_STAKE_SETTING,
                new Uint8Array([0x22, 0x78, 0x22]), "hand", "2026-10-12T00:00:00Z");
  assert.equal(w.pr.groupFields().stake, "undetermined");
  /* the stake is asked strictly: a stand-in is handed {strict: true}, and its own SETTING_UNREADABLE answer is undetermined */
  const seen = [];
  const strictOn = (answer) => ({ getSetting(name, options) { seen.push([name, options]); return answer; } });
  assert.equal(bare(strictOn(SETTING_UNREADABLE)).groupFields().stake, "undetermined");
  assert.deepEqual(seen[0], [DECLARED_STAKE_SETTING, { strict: true }]);
  /* negative control: a stored object that merely looks like the marker is a value as held, not the marker */
  assert.deepEqual(bare(strictOn({ unreadable: true })).groupFields().stake, { unreadable: true });
  assert.equal(bare(strictOn(null)).groupFields().stake, null);
});

test("R34 (T46) a published case answers group_fields' stake \"undetermined\" when the stored declared_stake is not valid JSON", () => {
  const { w, CASE } = publishedSix();
  assert.equal(w.read("publishedcase", { id: CASE }).group_fields.stake, null, "control: never set");
  w.st.sql.exec(`INSERT INTO settings (name,value,set_by,set_at) VALUES (?,?,?,?)`, DECLARED_STAKE_SETTING, "{oops",
                "hand", "2026-10-12T00:00:00Z");
  const a = w.read("publishedcase", { id: CASE });
  assert.equal(a.group_fields.stake, "undetermined");
  assert.ok(a.group_fields.detail.includes(STAKE_UNDETERMINED_SENTENCE));
});
