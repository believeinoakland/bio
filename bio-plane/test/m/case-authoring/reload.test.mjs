/* case-authoring R83 (T51 fix round 4; C48 / N6): the ceremony's reload, on the composed plane through its real ops. A second
   object over the same storage stands for the reload; the finding is concluded and the draft made as the member's own acts
   make them. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { store, Store, storage } from "../plane/fixture.mjs";
import { DatabaseSync } from "node:sqlite";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { instanceSetupOf } from "../../../src/setup.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const GROUP = "reload-watch", DOC = "INFO-2026-1301-doc", Q = "INQ-2026-1301-q";
const head = ["---", `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`];
const projMd = (title) => [...head, "object_type: project", "schema: project@1", `title: "${title}"`,
  "current_state: forming", "prior_state: null", `objective: "Find out what happened."`, "references: []", "state_history: []",
  "---", "", "## Objective", "", "Find out.", ""].join("\n");
const infoMd = (id) => [...head, `id: ${id}`, "object_type: information", "schema: information@1", `title: "Document ${id}"`,
  "current_state: collected", "prior_state: null", "references: []", "state_history: []", "criticality: supporting", "---",
  "", "## Summary", "", "A document.", ""].join("\n");
const inquiryMd = (id, P) => [...head, `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Was the transfer made (${id})?"`, "current_state: concluded", "prior_state: open", `group: ${GROUP}`, "references:",
  `  - target: ${DOC}`, "    rel: cites", "    status: confirmed", "state_history: []", "surfaced_by: human", `disposition_reason: ""`,
  "basis:", `  - target: ${DOC}`, "    role: supports", `project: ${P}`,
  'conclusion: "the transfer was made"', 'falsifier: "a ledger showing no transfer"',
  "---", "", "## Question", "", "Was the transfer made?", "", word("conformance.rests"), "", "## Conclusion", "",
  word("conformance.falsify"), "", "## Session Log", "", "## Review Notes", ""].join("\n");

/* workerd's `transactionSync` rolls back when its callback throws; the fixture's does not, so the pre-flight's rolled-back run
   would persist. A savepoint stands in for it. */
function rollingBack(db) {
  let depth = 0;
  return (ctx) => {
    ctx.storage.transactionSync = (fn) => {
      const sp = `sp${++depth}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    };
  };
}


/** The plane with member ruth, her project and one concluded finding; `asked(body)` the pre-flight as the ceremony sends it, on
 *  the object it was given. */
async function setup() {
  const db = new DatabaseSync(":memory:");
  const x = await store({ db, before: rollingBack(db) });
  const promotion = promotionOf(x.ctx);
  let n = 0;
  const promote = (bundleId, text, object_type, extra = {}) => {
    const r = promotion.promote({ bundleId, base: null, snapKey: `k${++n}`, author: "member:ruth",
      files: [{ path: "bundle.md", text }], meta: { object_type }, ...extra });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 600));
    return r;
  };
  assert.equal(instanceSetupOf(x.ctx).instanceGroupSeed({ slug: GROUP, author: "admin" }).ok, true);
  x.ctx.storage.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                          VALUES ('ruth', 'Cover ruth', 'h_ruth', 'member', 'active', '["contribute","publish"]', 't', 't')`);
  const made = promotion.promote({ base: null, snapKey: `k${++n}`, author: "member:ruth", ownerMemberId: "ruth",
    files: [{ path: "bundle.md", text: projMd("Sewer fund") }], meta: { object_type: "project" } });
  assert.equal(made.ok, true);
  const P = made.bundleId;
  promote(DOC, infoMd(DOC), "information");
  promote(Q, inquiryMd(Q, P), "inquiry");
  const who = "viewer=member:ruth&author=ruth";
  const draftOf = async (extra = {}) => {
    const d = await x.call(`/casedraft?${who}`, { project: P, targets: [Q], roles: { [Q]: "load_bearing" },
      scope: "Whether the transfer was made.", statement: "It does not cover later amendments.", subjectPosition: "not_sought",
      subjectJustification: "The transfer is public record.", biasAcknowledgement: "We read the ledger as authoritative.",
      excluded: [], ...extra });
    assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
    return d.draftId;
  };
  /* the reload: a second object over the same storage, asked as the ceremony asks, the draft and the project only */
  const reloaded = async (draft) => (await store({ db, before: rollingBack(db) }))
    .call(`/publishpreflight?${who}`, { draft, project: P });
  const prepare = (draft) => x.call(`/publishcase?${who}`, { draft, project: P, tieAttested: true });
  return { x, P, draftOf, reloaded, prepare };
}
const NONE = { prepared: null, published: null };

test("R83 (C48 / N6): a draft that names no case, prepared on the plane, states prepared 1 on a reload in a fresh object; before it is prepared it states neither (control)", async () => {
  const { draftOf, reloaded, prepare } = await setup();
  const draft = await draftOf();
  assert.deepEqual((await reloaded(draft)).editions, NONE, "control: before it is prepared");
  const done = await prepare(draft);
  assert.equal(done.ok, true, JSON.stringify(done).slice(0, 300));
  assert.equal(done.minted, true, "the pre-flight's rolled-back run left no case behind");
  assert.deepEqual((await reloaded(draft)).editions, { prepared: 1, published: null });
});

test("R83 (C48 / N6): a draft that asks for a new case (newCase), prepared on the plane, states prepared 1 on a reload in a fresh object, found by the draft that made the document", async () => {
  const { draftOf, reloaded, prepare } = await setup();
  const draft = await draftOf({ newCase: true });
  const done = await prepare(draft);
  assert.equal(done.ok, true, JSON.stringify(done).slice(0, 300));
  assert.deepEqual((await reloaded(draft)).editions, { prepared: 1, published: null });
  const idle = await draftOf({ newCase: true });
  assert.deepEqual((await reloaded(idle)).editions, NONE, "control: a second newCase draft, never prepared");
});
