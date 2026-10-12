/* action-holds over the modules it uses, on `actions`' own test world (the real record-core, membership, promotion,
   provenance and actions, on a real SQLite database standing in for a Durable Object's storage, answering as workerd's
   does), with this module started on the same host. The actions a test marks and holds are real actions written through
   `actions`' own promotion step; `docket` is the real module on the host unless a test passes its own; ratification's
   hold-reader registration (R10) is a stand-in the test reads; doorbell is the real module on the host. `actions`
   registers neither since its job (T45-27). Every test drives `action-holds` at its interface. */
import assert from "node:assert/strict";
import { world as actionsWorld, V, MACHINE, actionMd, CP, NOW_MS, sha } from "../actions/fixture.mjs";
import { actionHoldsOf } from "../../../src/action-holds/index.mjs";

export { V, MACHINE, actionMd, CP, NOW_MS, sha };
export const ALICE = V("alice");

/** A received entry list of `n` entries held as accounts, for an action's front matter. */
export const received = (n) => ["correspondence:", ...Array.from({ length: n }, (_, i) =>
  ["  - direction: received", "    at: 2026-09-03", `    account: "reply ${i}"`, "    author: member:alice"]).flat()];

export function world({ holds = {}, ...opts } = {}) {
  const w = actionsWorld(opts);
  const holdReaders = [];
  const ratification = { registerHoldReader: (r) => (holdReaders.push(r), { ok: true }) };
  w.holdReaders = holdReaders;
  w.h = actionHoldsOf(w.host, { record: w.record, membership: w.membership, now: () => w.clock.ms,
                                ratification, ...holds });
  /** A project owned by `owner`, hidden unless `visibility` says otherwise; answers its id. */
  let k = 0;
  w.project = (owner, visibility = null) => {
    const r = w.promotion.promote({ base: null, snapKey: `p${++k}`, author: V(owner), ownerMemberId: owner,
      ...(visibility ? { visibility } : {}),
      files: [{ path: "bundle.md", text: ["---", "object_type: project", "schema: project@1", `title: "Project ${k}"`,
        "current_state: forming", "prior_state: null", 'created: "2026-09-27T00:00:00Z"', 'last_updated: "2026-09-27T00:00:00Z"',
        "references: []", "state_history: []", "---", "", "## Objective", "", "Find out.", ""].join("\n") }],
      meta: { object_type: "project" } });
    assert.equal(r.ok, true, JSON.stringify(r));
    return r.bundleId;
  };
  /** An information bundle in `project`, by `author`. */
  w.docIn = (id, project, author = ALICE) => {
    const r = w.promote(id, ["---", `id: ${id}`, "object_type: information", `title: ${id}`, "current_state: collected",
      `project: ${project}`, 'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "d", ""].join("\n"),
      { author });
    assert.equal(r.ok, true, JSON.stringify(r));
  };
  /** A pressure mark through this module's act; asserts it lands. */
  w.mark = (target, ord, kind = "legal", who = ALICE, note = `${kind} ${ord}`) =>
    assert.equal(w.h.actionPressure({ target, ord, pressure: { kind, note }, viewer: who, author: who }).ok, true);
  return w;
}
