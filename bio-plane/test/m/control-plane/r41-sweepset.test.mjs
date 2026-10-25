/* control-plane R17, R29 (fix round 10; K5138, K5148; WALK-FINAL-04B R41, diag2-04 §3; link-sweep R13-R15): the walker's case through the real door. A project's owner defines a sweep from the
   watching screen (`sweepset`, the body that screen sends) and ratifies it (`sweepratify`): each is stamped `author` and `viewer` by the door from her session, so link-sweep's gate sees a named member, not
   "an automated credential". Before link-sweep's rows declared their stamps the door stamped nothing and every member was refused MACHINE_CANNOT_SET_SWEEP. Control: the same call under the
   administrator's binding credential is a machine and is refused at the door. Run against the Miniflare plane (the seam kit). */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { makeKit } from "./r8-kit.mjs";

const kit = makeKit({ tag: "r41sweep" });
after(() => kit.mf.dispose());
const R = kit.R;

const SWEEP = (project) => ({ bundle: project, title: "Council agendas", sources: ["https://www.example.org/agendas"], seeds: ["https://www.example.org/agendas/index"],
                              match: { terms: ["contract"] }, cadence: "weekly", budget: { per_run: 5, backlog: 50 } });

test("R17, R29 (link-sweep R13, R15): the owner's `sweepset` through the door is admitted and stamped: a sweep is minted and listed unratified; the instance's binding credential is a machine, refused at the door (CLASS_FORBIDDEN: the row admits a member's or the founder's session only), so nothing is stamped for it", { timeout: 300000 }, async () => {
  const own = await kit.ownerOf("r41sweep-owner");
  const project = await kit.projectOf(own.auth, "Sweep walk, WALK-FINAL-04B R41");
  const set = await kit.post(own.auth, "sweepset", SWEEP(project));
  assert.equal(R(set.body).ok, true, kit.gateLine(set));
  const sweep = R(set.body).sweep;
  assert.equal(typeof sweep, "string", "a minted sweep id: " + kit.gateLine(set));
  const listed = R(await kit.get(own.auth, { op: "sweeps" }));
  const row = (listed.sweeps || []).find((s) => s.sweep === sweep);
  assert.ok(row, "the sweep is listed: " + JSON.stringify(listed).slice(0, 400));
  assert.equal(row.ratified, false);
  const refused = await kit.post({ authorization: `Bearer ${kit.ADM}` }, "sweepset", SWEEP(project));
  assert.equal(R(refused.body).ok, false, kit.gateLine(refused));
  assert.equal(refused.body.reason ?? R(refused.body).reason, "CLASS_FORBIDDEN", kit.gateLine(refused));
});

/* the screen's "Ratify this sweep" (watching.mjs `sendRatify`) for a sweep the same owner defined on her project (the screen's project choice sends the project's own bundle as `bundle`) */
test("R17, R29 (link-sweep R14): the project's owner's `sweepratify` through the door ratifies the sweep she defined on her project (RED BY NAME: link-sweep's owner test reads `bundleInfo(bundle).project`, which is null for the project's own bundle, so the owner is answered SWEEP_RATIFY_NOT_AN_OWNER 'this list belongs to no project': REPORTed to BOB, link-sweep R14)", { timeout: 300000 }, async () => {
  const own = await kit.ownerOf("r41sweep-owner-b");
  const project = await kit.projectOf(own.auth, "Sweep walk, ratify");
  const set = await kit.post(own.auth, "sweepset", SWEEP(project));
  const sweep = R(set.body).sweep;
  const ratified = await kit.post(own.auth, "sweepratify", { sweep, ratified: true });
  assert.equal(R(ratified.body).ok, true, kit.gateLine(ratified));
  assert.equal(R(ratified.body).ratified, true, kit.gateLine(ratified));
  assert.equal(((R(await kit.get(own.auth, { op: "sweeps" })).sweeps) || []).find((x) => x.sweep === sweep)?.ratified, true);
});
