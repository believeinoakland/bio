/* control-plane R17, R29 (fix round 10, B12; K5138; WALK-FINAL-07 overlay 2/21, diag2-07.md §13; money R12): the walker's case through the real door. The project's owner starts a money trail on her
   project (`moneysetcreate`, concerns the project); `max`, a plain member who cannot see the project, opens the trail as `/app/money/<trail>` reads it (`op=moneyset&id=<trail>`) and is answered as
   absent: the same answer, key for key, as for a trail that does not exist, with no label, no project and no author. Control: the owner reads the same trail (found, with its label and its project).
   Module cause: money (build/jobs/T51/money.md, J14 COMPLETE: `readSet` fenced). Run against the Miniflare plane (the seam kit); the member and the project are made by the acts that make them. */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { makeKit } from "./r8-kit.mjs";

const kit = makeKit({ tag: "r8moneytrail" });
after(() => kit.mf.dispose());
const R = kit.R;
const LABEL = "Where the paving money went, r8moneytrail";

test("R17, R29 (money R12): `max`, who cannot see a project, opens the money trail of it and is answered as absent, the same as for a trail that does not exist; the owner reads it", { timeout: 600000 }, async () => {
  const own = await kit.ownerOf("r8moneytrail-ann");
  const max = await kit.person("r8moneytrail-max");
  const project = await kit.projectOf(own.auth, "A fenced project with a money trail");
  const made = await kit.post(own.auth, "moneysetcreate", { purpose: "trail", label: LABEL, concerns: project });
  assert.equal(R(made.body).ok, true, kit.gateLine(made));
  const trail = R(made.body).set_id;
  assert.ok(trail, "a trail: " + kit.gateLine(made));
  const owner = R(await kit.get(own.auth, { op: "moneyset", id: trail }));
  assert.equal(owner.found, true, "the owner reads her trail: " + JSON.stringify(owner).slice(0, 300));
  assert.equal(owner.set.concerns, project);
  assert.equal(owner.set.label, LABEL);
  /* max is not a member of the owner's hidden project, so he cannot see it */
  const seen = R(await kit.get(max, { op: "moneyset", id: trail }));
  const absent = R(await kit.get(max, { op: "moneyset", id: "MSR-2026-9999" }));
  assert.equal(seen.found, false, "max is answered as absent: " + JSON.stringify(seen).slice(0, 300));
  assert.equal(seen.ok, true);
  assert.deepEqual(Object.keys(seen).sort(), Object.keys(absent).sort(), `the same shape as a trail that does not exist: ${JSON.stringify(seen)} / ${JSON.stringify(absent)}`);
  const text = JSON.stringify(seen);
  assert.ok(!text.includes(project) && !text.includes(LABEL), "neither the project nor the label reaches him: " + text.slice(0, 300));
});
