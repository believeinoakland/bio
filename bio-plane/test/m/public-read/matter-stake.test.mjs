/* public-read — R36 (T50; N933; K3230; Action rule 9; v0.2 rule 21; D28 (d); `project-roster` R31, R32): `groupFields({project})`
   also answers `matter_stake`, the team's own stake for one matter beside its team-wide `stake`, which it never replaces.
   `inbandQuartet` answers the group as given and keeps it outside `hash`; `publishedCase` reads it for the project the
   edition states as its publisher. Each claim has its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, publishedSix } from "./fixture.mjs";
import { PublicRead, DECLARED_STAKE_SETTING } from "../../../src/public-read/index.mjs";
import { inbandQuartet } from "../../../src/inband.mjs";

const STAKE = "We maintain the park this matter is about.";
const TEAM = "We report on two parks.";
const setStake = (w, projectId, stake) => {
  w.st.sql.exec(`INSERT INTO project_stakes (project_id, stake, set_by, at) VALUES (?,?,?,?)`, projectId, stake, "olive",
                "2026-10-17T00:00:00Z");
};
const bare = (roster) => new PublicRead({ storage: { sql: { exec() { throw new Error("no SQL on this path"); } } },
                                          publication: {}, docket: {}, record: { getSetting: () => TEAM }, roster });

test("R36 groupFields({project}) answers matter_stake as project-roster's projectStake, beside an unchanged team stake", () => {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  assert.equal(w.record.setSetting(DECLARED_STAKE_SETTING, TEAM, "olive").ok, true);
  setStake(w, proj, STAKE);
  const g = w.pr.groupFields({ project: proj });
  assert.deepEqual(g.matter_stake, { stake: STAKE, set_by: "h_olive", set_at: "2026-10-17T00:00:00Z", source: "project" });
  assert.equal(g.stake, TEAM, "the team-wide stake is unchanged and never replaced");
  assert.equal(typeof g.then, "undefined", "synchronous");
  /* control: the same call with no project answers null */
  assert.equal(w.pr.groupFields().matter_stake, null);
  assert.equal(w.pr.groupFields({ project: null }).matter_stake, null);
  /* control: a project whose latest entry is none answers null, and the history's latest wins */
  setStake(w, proj, null);
  assert.equal(w.pr.groupFields({ project: proj }).matter_stake, null);
  setStake(w, proj, "Second statement.");
  assert.equal(w.pr.groupFields({ project: proj }).matter_stake.stake, "Second statement.");
  /* control: a project with no record, and an id naming nothing, answer null */
  assert.equal(w.pr.groupFields({ project: "BUN-NOTHING" }).matter_stake, null);
  /* a team with no team-wide stake still answers stake: null beside a matter stake */
  const w2 = world();
  w2.member("olive");
  const p2 = w2.project("Parks", "olive");
  setStake(w2, p2, STAKE);
  const g2 = w2.pr.groupFields({ project: p2 });
  assert.deepEqual([g2.stake, g2.matter_stake.stake], [null, STAKE]);
});

test("R36 an unreadable matter stake answers \"undetermined\", never null, and never throws", () => {
  const unread = { stake: "undetermined", set_by: null, set_at: null, source: "project" };
  assert.deepEqual(bare(() => ({ projectStake: () => ({ stake: "undetermined", set_by: null, set_at: null, history: [] }) }))
    .groupFields({ project: "P" }).matter_stake, unread);
  assert.deepEqual(bare(() => ({ projectStake() { throw new Error("storage unreadable"); } }))
    .groupFields({ project: "P" }).matter_stake, unread);
  assert.deepEqual(bare(() => null).groupFields({ project: "P" }).matter_stake, unread, "no roster");
  assert.deepEqual(bare(() => ({ projectStake: () => "garbage" })).groupFields({ project: "P" }).matter_stake, unread);
  /* the table missing, as a store that cannot read the record */
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.st.sql.exec(`DROP TABLE project_stakes`);
  assert.equal(w.pr.groupFields({ project: proj }).matter_stake.stake, "undetermined");
  /* control: with no project asked, an unreadable roster is not consulted and the answer is null */
  assert.equal(bare(() => ({ projectStake() { throw new Error("x"); } })).groupFields().matter_stake, null);
});

test("R36 inbandQuartet answers group as given, matter_stake included, outside hash: two stamps over one subject with and without a matter stake answer one hash", async () => {
  const subject = { text: "the same bytes" };
  const base = { group: "parks", name: "Friends", domain: null, domain_verified_at: null, stake: TEAM, detail: "d" };
  const withMatter = { ...base, matter_stake: { stake: STAKE, set_by: "olive", set_at: "2026-10-17T00:00:00Z", source: "project" } };
  const a = (await inbandQuartet({ subject, over: "x", group: withMatter })).quartet;
  const b = (await inbandQuartet({ subject, over: "x", group: { ...base, matter_stake: null } })).quartet;
  const c = (await inbandQuartet({ subject, over: "x", group: base })).quartet;
  assert.deepEqual(a.group, withMatter, "answered as given");
  assert.equal(a.hash.sha256, b.hash.sha256);
  assert.equal(a.hash.sha256, c.hash.sha256);
  /* control: different bytes give a different hash */
  assert.notEqual((await inbandQuartet({ subject: { text: "other" }, over: "x", group: withMatter })).quartet.hash.sha256, a.hash.sha256);
});

test("R36 publishedCase's group_fields is read for the project the edition states as its publisher, labeled current, never written into the document", () => {
  const { w, CASE } = publishedSix();
  const first = w.read("publishedcase", { id: CASE });
  assert.equal(first.ok, true);
  assert.ok(first.project, "the edition states its publishing project");
  assert.equal(first.group_fields.matter_stake, null, "no matter stake recorded yet");
  setStake(w, first.project, STAKE);
  const later = w.read("publishedcase", { id: CASE });
  assert.deepEqual(later.group_fields.matter_stake, { stake: STAKE, set_by: "h_olive", set_at: "2026-10-17T00:00:00Z", source: "project" });
  assert.equal(later.group_fields.current, true);
  assert.deepEqual(later.group_fields, { ...w.pr.groupFields({ project: first.project }), current: true });
  assert.equal(later.document.text.includes(STAKE), false, "not in the signed document");
  assert.equal(later.document.doc_sha, first.document.doc_sha);
  assert.equal(JSON.stringify(w.read("casefilefacts", { caseId: CASE, edition: 1 })).includes(STAKE), false);
  /* control: another team-wide stake change leaves the matter stake as it was, and a bundle in no case states none */
  assert.equal(w.record.setSetting(DECLARED_STAKE_SETTING, TEAM, "olive").ok, true);
  const again = w.read("publishedcase", { id: CASE });
  assert.equal(again.group_fields.matter_stake.stake, STAKE);
  assert.equal(again.group_fields.stake, TEAM);
});
