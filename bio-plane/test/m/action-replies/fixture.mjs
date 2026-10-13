/* action-replies over the modules it uses, each the real one where it writes or reads the record (record-core,
   membership, actions, through `actions`' own test world: promotion, provenance and the projection table under it), on
   a real SQLite database (node:sqlite) standing in for a Durable Object's storage. A request for comment is promoted as
   `actions` holds one (an `advances` leg on an inquiry, a dated window; its R1, DEC-13), its correspondence recorded
   through `actionCorrespond` (its R15). Projects and plans are rows of record-core's `bundles` as membership's own
   fixture writes them, with participants as membership's gate reads them. Every test drives `action-replies` at its
   interface. */
import assert from "node:assert/strict";
import { world as actionsWorld, V, actionMd, CP, MACHINE, NOW_MS } from "../actions/fixture.mjs";
import { actionRepliesOf } from "../../../src/action-replies/index.mjs";
import { caseAuthoringOf } from "../../../src/case-authoring/index.mjs";
import { caseInputsOf } from "../../../src/case-inputs/index.mjs";

export { V, MACHINE, NOW_MS };
export const M = V("alice"), BOB = V("bob");
export const INQ = "INQ-2026-0001-transfer", INQ2 = "INQ-2026-0002-zoning", INQ3 = "INQ-2026-0003-other";
export const INFO = "INFO-2026-0001-memo";
export const RFC = "ACTN-2026-0001-rfc", RFC2 = "ACTN-2026-0002-rfc", REQ = "ACTN-2026-0003-req";
export const PROJ = "PROJ-2026-0001-roads", PROJ2 = "PROJ-2026-0002-hidden";
export const PLAN = "PLN-2026-0001-roads", PLAN2 = "PLN-2026-0002-hidden";

export const leg = (target, kind) => [`  - target: ${target}`, `    kind: ${kind}`];
export const WINDOW = (date = "2026-10-15", status = "pending") => ["clock:", '  - text: "Response due"',
  '    description: "The window the group gave for a reply."', `    date: ${date}`, '    basis: "The group\'s own decision"',
  `    status: ${status}`];
export const rfcMd = (id, { legs = [leg(INQ, "advances")], clock = WINDOW(), cp = CP, kind = "request_for_comment", state } = {}) =>
  actionMd(id, [...cp, `action_kind: ${kind}`, "action_basis:", ...legs.flat(), ...clock], state ? { state } : {});

const inquiryMd = (id) => ["---", `id: ${id}`, "object_type: inquiry", `title: ${id}`, "current_state: concluded",
  'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "A finding.", ""].join("\n");

/** The world: `actions`' own, three inquiries and a document held, and this module over them. With `signing`, the real
 *  `case-authoring` on the same host (`w.ca`, whose sign step reads the open requests) is built first, and the
 *  `case-inputs` instance it creates there (`w.ci`) is handed to `actionRepliesOf`, which registers with it (R3; T47,
 *  N908); without, none is, and nothing is registered. With `root`, it is started as the composition root starts it,
 *  with its environment and no `case-inputs` given, and reaches the host's own. */
export function world({ signing = false, root = false } = {}) {
  const w = actionsWorld({ conformance: {} });
  for (const id of [INQ, INQ2, INQ3]) assert.equal(w.promote(id, inquiryMd(id), { extra: { replay: true } }).ok, true);
  w.doc(INFO);
  w.ca = signing ? caseAuthoringOf(w.host, { record: w.record, membership: w.membership }) : null;
  w.ci = signing ? caseInputsOf(w.host) : null;
  w.r = actionRepliesOf(w.host, { record: w.record, membership: w.membership, actions: w.a, now: () => w.clock.ms,
                                  ...(root ? { env: {} } : { caseInputs: w.ci }) });
  /** A request for comment (or another kind) created by a member; throws when refused. */
  w.rfc = (id, opts = {}) => {
    const p = w.promote(id, rfcMd(id, opts));
    if (!p.ok) throw new Error(`fixture rfc refused: ${JSON.stringify(p).slice(0, 400)}`);
    return p;
  };
  /** A correspondence entry recorded by a member as testimony; answers its position. */
  w.say = (id, direction, at = "2026-09-20") => {
    const r = w.a.actionCorrespond({ target: id, direction, at, account: "as the member recalls it", viewer: M, author: M });
    if (!r.ok) throw new Error(`fixture correspond refused: ${JSON.stringify(r).slice(0, 400)}`);
    return r.ord;
  };
  /** A project (or plan) bundle row; `member` a participant of the project. */
  w.bundle = (id, type, project = null) => w.st.db.prepare(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state,
      created, last_updated, bundle_sha, project) VALUES (?,?,'g',?,'forming','t','t','sha',?)`).run(id, type, id, project);
  w.participant = (project, member) => w.st.db.prepare(`INSERT INTO project_participants (project_id, member_id, state, created, updated) VALUES (?,?,'joined','2026-09-01T00:00:00Z','2026-09-01T00:00:00Z')`)
    .run(project, member);
  /** Row counts of this module's tables and the record's. */
  w.counts = () => ["action_reply_bearings", "action_bearing_proposals", "action_arose_from", "manifest", "files"]
    .map((t) => w.rows(`SELECT COUNT(*) AS n FROM ${t}`)[0].n);
  return w;
}
