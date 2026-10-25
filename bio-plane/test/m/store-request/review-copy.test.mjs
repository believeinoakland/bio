/* store-request R17, R23 (STORE-REQUEST #6, B16 (1); SCREENS-DAILY #24 J31 (4)): through the world's door a member's session at `reviewcopy`, `reviewcomment` and `statementack` is read as the Worker's door
   reads it (`caseReader`'s viewer is the one stamp), so a project's owner sees a draft's review copy and a member with no standing, or no session, is given the one dead answer. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "./fixtures.mjs";

const caps = { capabilities: ["contribute", "create_projects", "publish"] };
const get = (op, query) => ({ url: `/api/?${new URLSearchParams({ op, ...query })}` });
const post = (op, query, body) => ({ url: `/api/?${new URLSearchParams({ op, ...query })}`, init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } });
const resultOf = (a) => (a.json && a.json.result !== undefined ? a.json.result : a.json);

async function draftOf() {
  const w = await storeWorld();
  const owner = await w.signIn("owner", caps), other = await w.signIn("other", { capabilities: ["contribute"] });
  const projectId = await w.recipes.project(owner, "A shared draft");
  const found = await w.recipes.finding(owner, projectId);
  const made = await owner.act("casedraft", { body: { project: projectId, newCase: true, targets: [found.id] } });
  return { w, owner, other, draft: made.draftId };
}

test("R23 (door): a project's owner reads a draft's review copy through the door; a member with no standing and a caller with no session are given the one dead answer, the same bytes", async () => {
  const { w, owner, other, draft } = await draftOf();
  const mine = await w.door(get("reviewcopy", { draft }), owner);
  assert.equal(resultOf(mine).ok, true, JSON.stringify(mine.json).slice(0, 400));
  assert.notEqual(resultOf(mine).reason, "NO_REVIEW_COPY");
  const stranger = await w.door(get("reviewcopy", { draft }), other);
  const nobody = await w.door(get("reviewcopy", { draft }), null);
  assert.equal(resultOf(stranger).reason, "NO_REVIEW_COPY", JSON.stringify(stranger.json).slice(0, 300));
  assert.deepEqual(nobody.json, stranger.json);
  assert.equal(nobody.status, stranger.status);
  /* control: a forged viewer in the address is not read */
  const forged = await w.door(get("reviewcopy", { draft, viewer: "member:owner" }), other);
  assert.deepEqual(forged.json, stranger.json);
});

test("R23 (door): a member's `reviewcomment` and a list of `drafts` are read as the member's; a grant's secret still opens the one copy for a recipient with no session", async () => {
  const { w, owner, other, draft } = await draftOf();
  const listed = await w.door(post("reviewcopy", {}, { drafts: [draft] }), owner);
  assert.equal(resultOf(listed).ok, true, JSON.stringify(listed.json).slice(0, 400));
  const comment = await w.door(post("reviewcomment", { draft }, { text: "Please check the date." }), owner);
  assert.equal(resultOf(comment).ok, true, JSON.stringify(comment.json).slice(0, 400));
  const refused = await w.door(post("reviewcomment", { draft }, { text: "I am no one here." }), other);
  assert.equal(resultOf(refused).reason, "NO_REVIEW_COPY");
  const grant = await owner.act("reviewgrant", { body: { draft, recipient: "A neighbour", until: new Date(w.now() + 60 * 86_400_000).toISOString().replace(/\.\d{3}Z$/, "Z") } });
  const viaSecret = await w.door({ url: `/api/?${new URLSearchParams({ op: "reviewcopy", draft })}`, init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ secret: grant.secret }) } }, null);
  assert.equal(resultOf(viaSecret).ok, true, JSON.stringify(viaSecret.json).slice(0, 400));
});
