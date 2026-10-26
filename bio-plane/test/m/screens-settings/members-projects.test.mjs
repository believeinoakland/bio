/* R80, R47 (Membership v2 §7.8; membership R18; member-roster R71): the administrator's roster lists, for each member, the projects that member
   participates in which the administrator sees in full. Over the world (store-request): the projects are made by the real acts
   (start, invite, join, hide) and the expectations are read back from what the owners answer, never copied from a literal. */
import test from "node:test";
import assert from "node:assert/strict";
import { all, open, rowOf, said, squash, textOf, storeWorld } from "./kit.mjs";

/** A team with the founder (its one active administrator), dev (who may start projects), and ana (a member with no project). */
async function team() {
  const w = await storeWorld();
  const founder = await w.signIn("founder");
  const dev = await w.signIn("dev", { capabilities: ["contribute", "create_projects"] });
  const ana = await w.signIn("ana");
  const trees = await w.recipes.project(founder, "Street trees");
  await founder.act("projectinvite", { query: { projectId: trees, handle: "dev" } });
  await dev.act("projectjoin", { query: { projectId: trees } });
  const quiet = await w.recipes.project(dev, "Quiet matter");
  await dev.act("projectvisibilityset", { query: { projectId: quiet, setting: "hidden", reason: "keep it between us" } });
  await founder.act("projectinvite", { query: { projectId: trees, handle: "ana" } });   // invited, not joined
  return { w, founder, dev, ana, trees, quiet };
}
const cellsOf = (o, m) => all(rowOf(o.tree, m.member_id, m.handle), (e) => e.tag === "td").map((c) => squash(textOf(c)));
const projectsColumn = (o) => all(o.tree, (e) => e.tag === "th").map((th) => squash(textOf(th))).indexOf(said("screen.projects.name"));

test("R80 R47 an administrator's roster has a Projects column: each member's joined projects by name, owner of or works on; a project known only by its existence, and one only invited to, are not listed", async () => {
  const { w, founder: admin } = await team();
  const roster = (await admin.read("memberlist")).members, named = new Map((await admin.read("projectlist")).projects.map((p) => [p.id, p.name]));
  const o = await open("members", { world: w, as: admin });
  const col = projectsColumn(o);
  assert.ok(col >= 0, "the roster names a Projects column");
  let drawn = 0;
  for (const m of roster) {
    const want = m.projects.filter((p) => p.state === "joined" && named.has(p.project))
      .map((p) => said(p.owner ? "screen.members.tip.owner" : "screen.members.tip.workson", { project: named.get(p.project) })).join(" · ");
    assert.equal(cellsOf(o, m)[col], want, `${m.handle}'s projects`);
    if (want) drawn++;
  }
  assert.equal(drawn, 2, "the founder's project and dev's joined one are listed");
  // what the owners answered, so that the control cases below mean something: dev also owns a hidden project and ana was only invited to one
  const devRow = roster.find((m) => m.handle === "dev"), anaRow = roster.find((m) => m.handle === "ana");
  assert.ok(devRow.projects.some((p) => p.existence === true && p.owner === true), "dev owns a project admin sees only at its existence");
  assert.ok(anaRow.projects.some((p) => p.state === "invited"), "ana is invited to a project");
  assert.equal(cellsOf(o, anaRow)[col], "", "an invitation is not a participation");
  assert.ok(!o.text.includes(devRow.projects.find((p) => p.existence).project), "a project's id is never drawn in its place");
  assert.ok(!o.text.includes(said("screen.members.tip.owner", { project: "Quiet matter" })), "its name is not read, so it is not drawn");
  assert.deepEqual(o.p.requests.filter((r) => r.op === "projectlist").length, 1, "the names are read once");
});

test("R80 R47 control: a member who does not administer reads the table of members with no Projects column and sends no projectlist", async () => {
  const { w, dev } = await team();
  const o = await open("members", { world: w, as: dev });
  assert.equal(projectsColumn(o), -1);
  assert.equal(o.p.requests.filter((r) => r.op === "projectlist").length, 0);
  assert.ok(!o.text.includes(said("screen.members.tip.workson", { project: "Street trees" })));
});

test("R80 R47 control: a projectlist that cannot be read is drawn failed for a member who has projects, never as none, and says nothing for one who has none", async () => {
  const { w, founder: admin } = await team();
  const o = await open("members", { world: w, as: admin, table: { projectlist: "none" } });
  const col = projectsColumn(o), roster = (await admin.read("memberlist")).members;
  for (const m of roster) {
    const joined = m.projects.some((p) => p.state === "joined");
    const cell = all(rowOf(o.tree, m.member_id, m.handle), (e) => e.tag === "td")[col];
    assert.equal(all(cell, (e) => e.attrs["data-state"] === "failed").length, joined ? 1 : 0, `${m.handle}: drawn failed only where there are projects to name`);
    if (!joined) assert.equal(squash(textOf(cell)), "", `${m.handle}: nothing`);
  }
});
