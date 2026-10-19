/* T51 (N1239, N1238): what `bootstrap` states of the copy to a credentialed caller (R95), at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { boot, providers, stubOver, io, read } from "./fixture.mjs";
import { bootstrapReport, bootstrapOp, instanceSetupOps, BOOTSTRAP_FACT_KEYS, RELEASE_NOTICE_MAX_BYTES, INFO_LEVELS,
         PLACE_NAME_MAX, GROUP_DISPLAY_NAME_MAX, GROUP_LANGUAGES_MAX, GROUP_DRAFT_ANSWERS_MAX,
         GROUP_DRAFT_ANSWER_MAX, UPDATE_SKIP_REASON_MAX } from "../../../src/setup.mjs";
import { CREDENTIALS_SCHEMA } from "../../../src/credentials/schema.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
import { word, localize, hasWord } from "../../../src/setup-words/index.mjs";
import { HOSTING_CONTROL, FORGOT_HELP, HOSTING_RECOVERY_DEPLOYER, HOSTING_RECOVERY_DEPLOYER_KEY } from "../../../src/setup-fleet.mjs";
import { NS_RELEASE_NOTICE, releaseNoticeStatement } from "../../../src/sshsig.mjs";
import { signSshsig, signerPublicLine } from "../../../scripts/sign-sshsig.mjs";

const at = (iso) => () => Date.parse(iso);
const SEVEN = ["team_name", "installed_at", "last_used_at", "count_projects", "count_documents", "count_published", "count_members"];
/* membership R132's pre-auth key set: what a stranger is answered, the seven in none of it */
const R132_KEYS = ["bootstrapConfigured", "claimed", "consumedAt", "ok", "rearmed", "service", "storeVersion", "version",
  "test_instance", "part_signin", "part_scanner", "part_safe_view"];

const applySchema = (st, schema) => {
  const bare = schema.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
};
const addProject = (st, id) => st.db.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, current_state, created, last_updated, bundle_sha)
  VALUES ('${id}', 'project', 'river-town', 'active', '2026-10-01T00:00:00Z', '2026-10-01T00:00:00Z', 'sha-${id}')`);
const addOther = (st, id) => st.db.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, current_state, created, last_updated, bundle_sha)
  VALUES ('${id}', 'information', 'river-town', 'active', '2026-10-01T00:00:00Z', '2026-10-01T00:00:00Z', 'sha-${id}')`);

/* A copy holding two projects, five documents, one published case edition and three active members (one more proposed),
   named, with sessions last active at two instants. The providers are stand-ins coded to the services they answer. */
async function copy({ members = ["admin", "ruth", "ada"], documents = 5, published = 1, projects = 2, named = true, sessions = true } = {}) {
  const prov = providers();
  prov.membership.memberList = () => ({ members: [...members.map((id) => ({ member_id: id, status: "active" })), { member_id: "sam", status: "proposed" }] });
  prov.provenance = { counts: () => ({ register: documents }) };
  prov.publicRead.publishedList = () => ({ published: [], cases: Array.from({ length: published }, (_, i) => ({ case_id: `CASE-${i}`, edition: 1 })) });
  /* `credentials` is the real module over this store (R80's `lastActivity`, the read R95 takes), made once the store exists. */
  const creds = { ctx: null, lastActivity: () => credentialsOf(creds.ctx).lastActivity() };
  const w = await boot({ env: { INSTANCE_NAME: "river-town", VERSION: "1.4.0" }, prov, now: at("2026-10-10T08:00:00Z"), more: { provenance: prov.provenance, credentials: creds } });
  creds.ctx = w.ctx;
  if (sessions) {
    applySchema(w.st, CREDENTIALS_SCHEMA);
    const row = (sha, last) => w.st.db.exec(`INSERT INTO sessions (token_sha, role, expires, created, device, last_active) VALUES ('${sha}', 'admin', 9e15, 'x', 'own', ${last})`);
    row("a", Date.parse("2026-10-12T09:30:00Z")); row("b", Date.parse("2026-10-14T17:45:00Z")); row("c", Date.parse("2026-10-13T01:00:00Z"));
  }
  for (let i = 0; i < projects; i += 1) addProject(w.st, `PROJ-${i}`);
  addOther(w.st, "INFO-1");
  if (named) w.m.groupNameSet({ name: "River Town", by: "admin" });
  return w;
}
const storeAnswer = { claimed: false, rearmed: false, consumedAt: null, storeVersion: "s-1" };
const asked = async (w, caller, { env = { VERSION: "plane-9" }, extra = {}, silent = [] } = {}) =>
  (await read(await bootstrapReport(env, "fp", { stub: stubOver(w.m, { bootstrap: () => ({ ...storeAnswer, ...extra }) }, { silent }), ...io, caller }))).body;
const ADMIN = { cls: "admin" };

test("R95 asked with an administrator's credential, op=bootstrap states the team's name, the release date, the last use and the four counts, each the copy's own figure taken whole, as flat scalars; the counts are projects, documents, published editions and active members", async () => {
  const w = await copy();
  for (const caller of [ADMIN, { administrator: true }, { cls: "member", administrator: true }]) {
    const b = await asked(w, caller);
    assert.deepEqual(SEVEN.map((k) => b[k]), ["River Town", "2026-10-10T08:00:00.000Z", "2026-10-14T17:45:00.000Z", 2, 5, 1, 3], JSON.stringify(caller));
    for (const [k, v] of Object.entries(b)) assert.ok(v === null || typeof v !== "object", `${k} is not nested`);
    /* the answer beside them is R17's, R80's and R82's, unchanged */
    assert.deepEqual(Object.keys(b).filter((k) => !SEVEN.includes(k)).sort(), [...R132_KEYS].sort());
  }
  /* the seven are the wire names the installer reads */
  assert.deepEqual([...BOOTSTRAP_FACT_KEYS].sort(), [...SEVEN].sort());
});

test("R95 a fresh store asked with a credential answers null for the name and the last use, the instant its running release was first seen, and 0 for each count it can read", async () => {
  const w = await copy({ members: [], documents: 0, published: 0, projects: 0, named: false });
  w.st.db.exec(`DELETE FROM bundles`);
  w.st.db.exec(`DELETE FROM sessions`);
  const b = await asked(w, ADMIN);
  assert.deepEqual(SEVEN.map((k) => b[k]), [null, "2026-10-10T08:00:00.000Z", null, 0, 0, 0, 0]);
  /* no release recorded as running: the date is not known, never guessed */
  w.st.db.exec(`DELETE FROM running_releases`);
  assert.equal((await asked(w, ADMIN)).installed_at, null);
});

test("R95 control: the same store asked with no credential (or one of another class) answers none of the seven keys and exactly membership R132's key set, so a stranger learns nothing of the team's name, size or last use", async () => {
  const w = await copy();
  for (const caller of [undefined, null, {}, { cls: "member" }, { cls: "probe" }, { cls: "ai" }, { cls: "admin-ish" }, { administrator: "yes" }, { cls: "Admin" }]) {
    const b = await asked(w, caller);
    assert.deepEqual(Object.keys(b).sort(), [...R132_KEYS].sort(), JSON.stringify(caller));
    for (const k of SEVEN) assert.equal(k in b, false, k);
    for (const v of Object.values(b)) assert.ok(v === null || typeof v !== "object");
  }
  /* nothing the store's own bootstrap route answers sets one of them, for either kind of caller */
  const lying = { team_name: "Hers", count_members: 99, last_used_at: "2026-01-01T00:00:00.000Z" };
  const stranger = await asked(w, null, { extra: lying });
  for (const k of SEVEN) assert.equal(k in stranger, false, k);
  const admin = await asked(w, ADMIN, { extra: lying });
  assert.deepEqual([admin.team_name, admin.count_members, admin.last_used_at], ["River Town", 3, "2026-10-14T17:45:00.000Z"]);
  /* through the door's own entry point as well */
  const viaOp = await read(await bootstrapOp(new URL("http://plane/api/?op=bootstrap"), { VERSION: "plane-9" }, "fp",
    { stub: stubOver(w.m, { bootstrap: () => storeAnswer }), ...io, caller: ADMIN }));
  assert.equal(viaOp.body.count_members, 3);
  const viaOpNone = await read(await bootstrapOp(new URL("http://plane/api/?op=bootstrap"), { VERSION: "plane-9" }, "fp",
    { stub: stubOver(w.m, { bootstrap: () => storeAnswer }), ...io }));
  assert.equal("count_members" in viaOpNone.body, false);
});

test("R95 a read that fails answers that key null and every other key unchanged, never omitted and never 0; the answer to a caller whose facts do not come at all states all seven null", async () => {
  const good = await asked(await copy(), ADMIN);
  const one = async (mutate, key) => {
    const w = await copy();
    mutate(w);
    const b = await asked(w, ADMIN);
    assert.equal(b[key], null, key);
    assert.deepEqual(Object.fromEntries(SEVEN.filter((k) => k !== key).map((k) => [k, b[k]])),
                     Object.fromEntries(SEVEN.filter((k) => k !== key).map((k) => [k, good[k]])), `${key}: the others are unchanged`);
  };
  await one((w) => { w.prov.membership.memberList = () => { throw new Error("no answer"); }; }, "count_members");
  await one((w) => { w.prov.membership.memberList = () => ({ members: "none" }); }, "count_members");
  await one((w) => { w.prov.provenance.counts = () => { throw new Error("no answer"); }; }, "count_documents");
  await one((w) => { w.prov.provenance.counts = () => ({ register: -1 }); }, "count_documents");
  await one((w) => { w.prov.publicRead.publishedList = () => { throw new Error("no answer"); }; }, "count_published");
  await one((w) => { w.prov.publicRead.publishedList = () => ({ cases: null }); }, "count_published");
  await one((w) => { w.st.db.exec(`DROP TABLE sessions`); }, "last_used_at");
  await one((w) => { w.st.db.exec(`DROP TABLE bundles`); }, "count_projects");
  await one((w) => { w.st.db.exec(`DROP TABLE running_releases`); }, "installed_at");
  /* the store's route for them does not answer: all seven null, the rest of the answer as it was */
  const w = await copy();
  const dumb = await asked(w, ADMIN, { silent: ["bootstrapfacts"] });
  assert.deepEqual(SEVEN.map((k) => dumb[k]), SEVEN.map(() => null));
  assert.deepEqual(Object.keys(dumb).sort(), [...R132_KEYS, ...SEVEN].sort());
  assert.equal(dumb.service, "bio-plane");
});

test("R95 the store's route states the seven by the module's own read, as flat scalars naming no member, handle or role, and writes nothing", async () => {
  const w = await copy();
  const before = JSON.stringify([...w.st.db.prepare(`SELECT name FROM sqlite_master`).all()]);
  const ops = instanceSetupOps(w.m, new URL("http://do/bootstrapfacts"), null);
  assert.deepEqual(Object.keys(ops.bootstrapfacts()).sort(), [...SEVEN].sort());
  const text = JSON.stringify(ops.bootstrapfacts());
  for (const who of ["ruth", "ada", "sam", "admin"]) assert.equal(text.includes(who), false, who);
  assert.equal(JSON.stringify([...w.st.db.prepare(`SELECT name FROM sqlite_master`).all()]), before);
  assert.equal(typeof w.m.bootstrapFacts, "function");
});

/* ---- R96: the detail, note and why strings of the parts below are read by key ---- */

const R96_KEYS = [
  ...["verified", "mismatch", "not_json", "no_file", "redirected", "other_answer", "not_finished", "held", "no_team_name", "no_address", "both_paths"]
    .map((k) => `instance-setup.domain.detail.${k}`),
  "instance-setup.offices.detail.no_profile", "instance-setup.bodies.detail.no_profile",
  "instance-setup.profiles.detail.none_active", "instance-setup.profiles.detail.stages_unchecked",
  "instance-setup.assistant.detail.keep_away_unread",
  "instance-setup.disclosure.detail.not_shown", "instance-setup.disclosure.detail.no_member",
  ...["not_fetched", "held", "redirected", "answered", "too_big", "not_object", "no_signature", "malformed", "older_than_running",
      "older_than_held", "already_held", "up_to_date"].map((k) => `instance-setup.updates.detail.${k}`),
];

test("R96 each of the thirty instance-setup.* keys the parts name is a row of the word list, and the module's source names no key the design's reads list for it lacks (control: the same reading finds an unlisted key)", () => {
  assert.equal(R96_KEYS.length, 30);
  for (const k of R96_KEYS) assert.equal(hasWord(k), true, k);
  const reads = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words-reads.json", import.meta.url), "utf8")).modules["instance-setup"].reads;
  const named = (text) => [...text.matchAll(/\bword\(\s*["']([^"']+)["']/g)].map((m) => m[1]);
  const mine = ["setup.mjs", "setup-fleet.mjs", "livefire.mjs"].flatMap((f) => named(readFileSync(new URL(`../../../src/${f}`, import.meta.url), "utf8")));
  assert.ok(mine.length > 60, "the reading is not vacuous");
  assert.deepEqual([...new Set(mine)].filter((k) => !reads.includes(k)), []);
  for (const k of R96_KEYS) assert.ok(reads.includes(k), `${k} is on the reads list`);
  assert.deepEqual(named(`x = word("no.such.key")`).filter((k) => !reads.includes(k)), ["no.such.key"]);
});

test("R96 the disclosure's and the assistant's states answer their sentences by key: the disclosure not shown to a member, and with no member named; whether the group keeps its material away, unread", async () => {
  const w = await boot({ env: { INSTANCE_NAME: "river-town" } });
  assert.equal(w.m.disclosureOf({ member: "ruth" }).detail, word("instance-setup.disclosure.detail.not_shown"));
  assert.equal(w.m.disclosureOf({}).detail, word("instance-setup.disclosure.detail.no_member"));
  w.prov.keepAway = { on: null, reason: null, set_by: null, set_at: null };
  assert.equal(w.m.assistantState().detail, word("instance-setup.assistant.detail.keep_away_unread"));
  assert.equal(w.m.disclosureShown({ by: "ruth" }).detail, localize("instance-setup.setup.disclosure_no_member", "The request names no member. Nothing was recorded."));
  assert.equal(w.m.disclosureShown({ member: "ruth", by: "ruth" }).detail, localize("instance-setup.setup.disclosure_no_version", "The request names no version of the disclosure's words. Nothing was recorded."));
});

/* The release check's details, each reached by what the address answers (R88), each the key's words filled. */
const b64 = (bytes) => Buffer.from(bytes).toString("base64");
const ENV_KEY = `BIOKEY-RAW1.bio-release.${b64(new Uint8Array(32).map((_, i) => (i * 41 + 9) % 256))}`;
const KEYS = [signerPublicLine(ENV_KEY)];
const MANIFEST = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
const notice = (version) => ({ version, date: "2026-10-14", manifest: MANIFEST, security: false,
  notes: { members: "Searching is faster.", administrators: "You decide when to update.", must_do: "" } });
const feed = (n) => ({ ...n, sig: signSshsig(ENV_KEY, releaseNoticeStatement(n), NS_RELEASE_NOTICE), signer: KEYS[0] });
async function checker() {
  const w = await boot({ env: { VERSION: "0.84.0", INSTANCE_NAME: "river-town" }, more: { releaseKeys: KEYS, drawMinute: () => 615 } });
  w.serve = (obj, status = 200) => { w.prov.answer = () => new Response(typeof obj === "string" ? obj : JSON.stringify(obj), { status }); };
  w.detail = async () => (await w.m.updateCheckTick()).updatecheck.detail;
  return w;
}

test("R96 the release check's details are the updates keys, filled: the notice not fetched, the host held, redirected and answered, over the cap, not an object, no signature, malformed, older than the running release, older than the one held, held already, and the release that runs", async () => {
  const w = await checker();
  const key = (k, vars) => word(`instance-setup.updates.detail.${k}`, vars);
  w.prov.answer = () => { throw new Error("connection refused"); };
  assert.equal(await w.detail(), key("not_fetched"));
  w.prov.governorHold = "too many asks";
  assert.equal(await w.detail(), key("held", { host: "raw.githubusercontent.com", reason: "too many asks" }));
  w.prov.governorHold = null;
  w.prov.answer = () => new Response(null, { status: 302, headers: { location: "https://elsewhere.example/NOTICE.json" } });
  assert.equal(await w.detail(), key("redirected", { status: 302 }));
  w.serve("", 404);
  assert.equal(await w.detail(), key("answered", { status: 404 }));
  w.serve("x".repeat(RELEASE_NOTICE_MAX_BYTES + 10));
  assert.equal(await w.detail(), key("too_big", { bytes: RELEASE_NOTICE_MAX_BYTES }));
  w.serve("[1,2]");
  assert.equal(await w.detail(), key("not_object"));
  w.serve(notice("0.85.0"));
  assert.equal(await w.detail(), key("no_signature"));
  w.serve({ ...feed(notice("0.85.0")), manifest: undefined });
  assert.equal(await w.detail(), key("malformed", { field: "manifest" }));
  w.serve(feed(notice("0.83.0")));
  assert.equal(await w.detail(), key("older_than_running", { running: "0.84.0" }));
  w.serve(feed(notice("0.84.0")));
  assert.equal(await w.detail(), key("up_to_date"));
  w.serve(feed(notice("0.86.0")));
  assert.equal(await w.detail(), undefined, "a found notice carries no detail");
  w.serve(feed(notice("0.86.0")));
  assert.equal(await w.detail(), key("already_held"));
  w.serve(feed(notice("0.85.0")));
  assert.equal(await w.detail(), key("older_than_held", { held: "0.86.0" }));
});

/* Each refusal that names what was wrong is one whole sentence for each thing wrong, never a fragment stitched into another
   (R96): the branch each is in, and the sentence it answers, read by key and filled. */
test("R96 every refusal's detail is a whole sentence of its own for each thing wrong with the request, read by key and filled", async () => {
  const w = await boot({ env: { INSTANCE_NAME: "river-town" } });
  w.prov.admins = new Set(["admin"]);
  const fresh = await boot({ env: {} });
  assert.equal(fresh.m.instanceGroupSeed({ slug: "No" }).detail, localize("instance-setup.setup.slug_not_in_grammar", "'{slug}' is not a slug in the installer's grammar (3 to 40 of a-z, 0-9 and '-', beginning and ending with a letter or digit). Nothing was recorded.", { slug: "No" }));
  assert.equal(fresh.m.instanceGroupSeed({ slug: "" }).detail, localize("instance-setup.setup.slug_none_given", "The request names no slug. A team is recorded under a slug in the installer's grammar (3 to 40 of a-z, 0-9 and '-', beginning and ending with a letter or digit). Nothing was recorded."));
  assert.equal(w.m.groupNameSet({ name: "", by: "admin" }).detail, localize("instance-setup.setup.name_none_given", "The request names no display name. A display name is one line of 1 to {max} characters with no control characters. Nothing was set.", { max: GROUP_DISPLAY_NAME_MAX }));
  assert.equal(w.m.groupNameSet({ name: "x".repeat(GROUP_DISPLAY_NAME_MAX + 1), by: "admin" }).detail, localize("instance-setup.setup.name_not_one_line", "A name of {chars} characters is not one line of 1 to {max} characters with no control characters. Nothing was set.", { chars: GROUP_DISPLAY_NAME_MAX + 1, max: GROUP_DISPLAY_NAME_MAX }));
  assert.equal((await w.m.groupDomainSet({ domain: "", by: "admin" })).detail, localize("instance-setup.setup.domain_none_given", "The request names no domain. A domain is claimed as a bare host name (letters, digits, hyphens and dots, with no scheme, path, port or IP address). Nothing was recorded."));
  assert.equal((await w.m.groupDomainSet({ domain: "https://x.example/p", by: "admin" })).detail, localize("instance-setup.setup.domain_not_bare_host", "'{domain}' is not a bare host name (letters, digits, hyphens and dots, with no scheme, path, port or IP address). Nothing was recorded.", { domain: "https://x.example/p" }));
  assert.equal(w.m.groupLanguagesSet({ languages: "es", by: "admin" }).detail, localize("instance-setup.setup.languages_not_a_list", "The languages are sent as a list of 1 to {max} well-formed BCP 47 language tags (en, es, zh-Hant). Nothing was changed.", { max: GROUP_LANGUAGES_MAX }));
  assert.equal(w.m.groupLanguagesSet({ languages: [], by: "admin" }).detail, localize("instance-setup.setup.languages_empty_list", "An empty list names no language. The languages are 1 to {max} well-formed BCP 47 language tags (en, es, zh-Hant). Nothing was changed.", { max: GROUP_LANGUAGES_MAX }));
  assert.equal(w.m.groupLanguagesSet({ languages: Array(GROUP_LANGUAGES_MAX + 1).fill("es"), by: "admin" }).detail, localize("instance-setup.setup.languages_too_many", "A list of {count} names is too many. The languages are 1 to {max} well-formed BCP 47 language tags (en, es, zh-Hant). Nothing was changed.", { count: GROUP_LANGUAGES_MAX + 1, max: GROUP_LANGUAGES_MAX }));
  assert.equal(w.m.groupLanguagesSet({ languages: ["es", "not a tag"], by: "admin" }).detail, localize("instance-setup.setup.languages_bad_tag", "'{tag}' is not a well-formed BCP 47 language tag (en, es, zh-Hant). The languages are 1 to {max} of them. Nothing was changed.", { tag: "not a tag", max: GROUP_LANGUAGES_MAX }));
  assert.equal(w.m.placeWantedSet({ name: "", by: "admin" }).detail, localize("instance-setup.setup.place_none_given", "The request names no place. A place is named in one line of 1 to {max} characters with no control characters; null clears it. Nothing was changed.", { max: PLACE_NAME_MAX }));
  assert.equal(w.m.placeWantedSet({ name: "x".repeat(PLACE_NAME_MAX + 1), by: "admin" }).detail, localize("instance-setup.setup.place_not_one_line", "A name of {chars} characters is not one line of 1 to {max} characters with no control characters; null clears it. Nothing was changed.", { chars: PLACE_NAME_MAX + 1, max: PLACE_NAME_MAX }));
  assert.equal(w.m.memberLanguageSet({ language: "", by: "ruth" }).detail, localize("instance-setup.setup.language_none_given", "The request names no language. A language is chosen as one well-formed BCP 47 language tag (en, es, zh-Hant); null clears the choice. Nothing was changed."));
  assert.equal(w.m.memberLanguageSet({ language: "not a tag", by: "ruth" }).detail, localize("instance-setup.setup.language_not_a_tag", "'{tag}' is not a well-formed BCP 47 language tag (en, es, zh-Hant); null clears the choice. Nothing was changed.", { tag: "not a tag" }));
  assert.equal(w.m.infoLevelSet({ level: "", by: "ruth" }).detail, localize("instance-setup.setup.level_none_given", "The request names no level. A level is chosen as one of {levels}. Nothing was changed.", { levels: INFO_LEVELS.join(" or ") }));
  assert.equal(w.m.infoLevelSet({ level: "loud", by: "ruth" }).detail, localize("instance-setup.setup.level_not_one_of", "'{level}' is not one of {levels}. Nothing was changed.", { level: "loud", levels: INFO_LEVELS.join(" or ") }));
  assert.equal((await w.m.groupDescriptionDraft({ answers: "x", by: "admin" })).detail, localize("instance-setup.setup.draft_answers_malformed", "The answers are a list of at most {max_answers} {question, text}, each text at most {max_text} characters. Nothing was saved.", { max_answers: GROUP_DRAFT_ANSWERS_MAX, max_text: GROUP_DRAFT_ANSWER_MAX }));
  const TEST = (await import("../../../../jurisdictions/index.mjs")).list().filter((p) => p.test === true).map((p) => p.id);
  assert.equal(w.m.profilesSet({ profiles: [TEST[0]], by: "admin" }).detail, localize("instance-setup.setup.profile_made_up_for_testing", "{tests} is a profile made up for testing. Nothing was changed.", { tests: TEST[0] }));
  if (TEST.length > 1) assert.equal(w.m.profilesSet({ profiles: TEST.slice(0, 2), by: "admin" }).detail, localize("instance-setup.setup.profiles_made_up_for_testing", "{tests} are profiles made up for testing. Nothing was changed.", { tests: TEST.slice(0, 2).join(", ") }));
  /* the update acts: nothing ready, not the one ready, no version named; a skip with no reason, one too long, one over lines */
  const c = await checker();
  assert.equal(c.m.updateStart({ version: "0.85.0", by: "admin" }).detail, localize("instance-setup.setup.update_none_ready", "No release is ready to install. Nothing was recorded."));
  c.serve(feed(notice("0.85.0")));
  await c.m.updateCheckTick();
  assert.equal(c.m.updateStart({ version: "0.84.1", by: "admin" }).detail, localize("instance-setup.setup.update_not_the_ready_one", "'{version}' is not the release ready to install, which is {ready}. Nothing was recorded.", { version: "0.84.1", ready: "0.85.0" }));
  assert.equal(c.m.updateLater({ by: "admin" }).detail, localize("instance-setup.setup.update_no_version", "The request names no version, and a release is decided by its version. The release ready to install is {ready}. Nothing was recorded.", { ready: "0.85.0" }));
  const max = UPDATE_SKIP_REASON_MAX;
  assert.equal(c.m.updateSkip({ version: "0.85.0", reason: "  ", by: "admin" }).detail, localize("instance-setup.setup.skip_no_reason", "No reason was given. A release is skipped with a reason of one line of 1 to {max} characters. Nothing was recorded.", { max }));
  assert.equal(c.m.updateSkip({ version: "0.85.0", reason: "x".repeat(max + 1), by: "admin" }).detail, localize("instance-setup.setup.skip_reason_too_long", "A reason of {chars} characters is not one line of 1 to {max} characters, and a release is skipped with one. Nothing was recorded.", { chars: max + 1, max }));
  assert.equal(c.m.updateSkip({ version: "0.85.0", reason: "two\nlines", by: "admin" }).detail, localize("instance-setup.setup.skip_reason_many_lines", "A reason of {chars} characters over more than one line is not one line of 1 to {max} characters, and a release is skipped with one. Nothing was recorded.", { chars: 9, max }));
});

/* ---- R97: the leaf carries its three texts with their keys ---- */

test("R97 each text of the leaf equals its key's English in the word list, byte for byte: the block's heading, five sentences and guide with the guide's name, the forgotten-password help's heading and two sentences, and the deployer's steps", () => {
  const twins = [
    [HOSTING_CONTROL.heading, HOSTING_CONTROL.keys.heading],
    ...HOSTING_CONTROL.sentences.map((t, i) => [t, HOSTING_CONTROL.keys.sentences[i]]),
    [HOSTING_CONTROL.guide.sentence, HOSTING_CONTROL.keys.guide.sentence],
    [HOSTING_CONTROL.guide.name, HOSTING_CONTROL.keys.guide.name],
    [FORGOT_HELP.heading, FORGOT_HELP.keys.heading],
    ...FORGOT_HELP.sentences.map((t, i) => [t, FORGOT_HELP.keys.sentences[i]]),
    [HOSTING_RECOVERY_DEPLOYER, HOSTING_RECOVERY_DEPLOYER_KEY],
  ];
  assert.deepEqual([HOSTING_CONTROL.sentences.length, HOSTING_CONTROL.keys.sentences.length, FORGOT_HELP.sentences.length, FORGOT_HELP.keys.sentences.length], [5, 5, 2, 2]);
  assert.deepEqual(twins.map(([, k]) => k), ["screen.hosting.heading", "screen.hosting.s1", "screen.hosting.s2", "screen.hosting.s3", "screen.hosting.s4", "screen.hosting.s5",
    "screen.hosting.guide", "setup-fleet.name.replace_time_password", "screen.forgot.help.heading", "screen.forgot.help.s1", "screen.forgot.help.s2", "setup-fleet.hosting_recovery_deployer"]);
  for (const [text, key] of twins) { assert.equal(hasWord(key), true, key); assert.equal(text, word(key), key); }
  /* the guide's name is the one the guide sentence names */
  assert.ok(HOSTING_CONTROL.guide.sentence.includes(HOSTING_CONTROL.guide.name));
});

test("R97 control: the leaf imports nothing (no import, no dynamic import, no require), so the installer's bundle does not pull setup-words; it carries its keys as data", () => {
  const text = readFileSync(new URL("../../../src/setup-fleet.mjs", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  assert.equal(/\bimport\b|\brequire\s*\(/.test(text), false);
  assert.equal(/setup-words/.test(text), false);
  for (const k of [...HOSTING_CONTROL.keys.sentences, ...FORGOT_HELP.keys.sentences]) assert.equal(typeof k, "string");
});
