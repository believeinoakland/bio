/* promotion's `forkProject` (entry N16, Membership v2 §7.12). Its own requirement is pending (job record Q5); these
 * tests hold it to R19 (a fork is a project's creation: minted id, unique name, the forker its sole owner) and R12
 * (the document states when the fork was created). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { makePromotion, doc, T0 } from "./fixtures.mjs";
import { parseFrontmatter } from "../../../checks/bio-checks.mjs";

function origin() {
  const env = makePromotion({ now: () => "2026-09-26T08:00:00.000Z" });
  const r = env.p.promote({ base: null, snapKey: "o", author: "member:ann", ownerMemberId: "ann",
    files: [{ path: "bundle.md", text: doc({ object_type: "project", title: "Sewer Fund", current_state: "investigating",
      created: T0, last_updated: T0, references: "[]" }) }, { path: "notes.md", text: "kept" }], meta: {} });
  assert.equal(r.ok, true, JSON.stringify(r));
  return { ...env, id: r.bundleId };
}

test("R19: a fork is a project's creation — minted id (a named one refused), unique name, the forker its sole owner, participants not copied", () => {
  const { p, record, membership, id } = origin();
  membership.joined.set(id, ["bob"]);
  membership.invited.set(id, ["cid"]);
  assert.equal(p.forkProject({ projectId: id, newId: "PROJ-2026-0001-x", title: "Fork", by: "bob" }).reason, "PROJECT_FORK_ID_SUPPLIED");
  assert.equal(p.forkProject({ projectId: "PROJ-2026-9999-none", title: "Fork", by: "bob" }).reason, "NO_SUCH_PROJECT");
  assert.equal(p.forkProject({ projectId: id, title: "Fork", by: "dee" }).reason, "NOT_A_PARTICIPANT");
  assert.equal(p.forkProject({ projectId: id, title: "Fork", by: "cid" }).reason, "NOT_JOINED");
  assert.equal(p.forkProject({ projectId: id, title: " sewer  FUND", by: "bob" }).reason, "NAME_TAKEN");
  assert.equal(p.forkProject({ projectId: id, title: "  ", by: "bob" }).reason, "NO_TITLE");
  const f = p.forkProject({ projectId: id, title: "Sewer Fund, again", by: "bob", visibility: "discoverable" });
  assert.equal(f.ok, true, JSON.stringify(f));
  assert.notEqual(f.newId, id);
  assert.match(f.newId, /^PROJ-2026-\d{4}-sewer-fund-again$/);
  assert.deepEqual([f.owner, f.participantsCopied, f.visibility, f.rel, f.origin], ["bob", 0, "discoverable", "derived_from", id]);
  const fm = parseFrontmatter(record.readFile(f.newId, "bundle.md").text).data;
  assert.deepEqual([fm.id, fm.title, fm.current_state], [f.newId, "Sewer Fund, again", "forming"]);
  assert.deepEqual(fm.references.map((r) => [r.rel, r.target]), [["derived_from", id]]);
  assert.equal(record.readFile(f.newId, "notes.md").text, "kept");
  assert.deepEqual(membership.created.at(-1), { projectId: f.newId, ownerId: "bob", visibility: "discoverable", by: "bob" });
  membership.hidden.add(id);
  assert.equal(p.forkProject({ projectId: id, title: "Other", by: "bob", viewer: "member:eve" }).reason, "NO_SUCH_PROJECT");
  membership.discoverable.add(id);
  assert.equal(p.forkProject({ projectId: id, title: "Other", by: "bob", viewer: "member:eve" }).reason, "PROJECT_SEEN_NOT_A_PARTICIPANT");
});

test("R12: the fork's document states that it was created now, so its row, its bytes and its manifest agree", () => {
  const { p, record, membership, id } = origin();
  membership.joined.set(id, ["bob"]);
  const f = p.forkProject({ projectId: id, title: "Branch", by: "bob" });
  assert.equal(f.ok, true, JSON.stringify(f));
  const fm = parseFrontmatter(record.readFile(f.newId, "bundle.md").text).data;
  const h = record.head(f.newId);
  assert.deepEqual([fm.created, fm.last_updated, h.created, h.lastUpdated],
                   ["2026-09-26T08:00:00.000Z", "2026-09-26T08:00:00.000Z", "2026-09-26T08:00:00.000Z", "2026-09-26T08:00:00.000Z"]);
});
