/* promotion's `reopen` — requirement-named tests (build/requirements/promotion.md R21–R26). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { makePromotion, doc, create, T0 } from "./fixtures.mjs";
import { parseFrontmatter } from "../../../checks/bio-checks.mjs";
import { EDGE_REASON_MAX, REOPENABLE_FROM } from "../../../src/promotion/index.mjs";

const ID = "INQ-2026-0001";
const inq = (state, extra = {}) => doc({ id: ID, object_type: "inquiry", title: "Where did the fund go?", current_state: state,
  prior_state: "open", created: T0, last_updated: T0, group: "test-group", disposition_reason: "\"set aside\"",
  case_id: "CASE-2026-0001", case_edition: 1, state_history: "[]", ...extra },
  "\n## Question\n\nWhere did the fund go?\n\n## Session Log\n\n### Session x | Formation | agent\n\n## Review Notes\n");

function setup(state = "deferred", opts = {}) {
  const env = makePromotion(opts);
  const r = env.p.promote({ ...create(ID, inq(state)), replay: true,
    files: [{ path: "bundle.md", text: inq(state) }, { path: "data/notes.txt", text: "carried" },
            { path: "data/cap.pdf", blobSha: "a".repeat(64), bytes: 10 }] });
  assert.equal(r.ok, true, JSON.stringify(r));
  return { ...env, first: r };
}
const call = (p, over = {}) => p.reopen({ target: ID, reason: "new evidence arrived", viewer: "member:ann", author: "member:ann", ...over });

test("R21: an empty author or a machine identity is refused MACHINE_CANNOT_REOPEN before anything else", () => {
  const { p } = setup();
  for (const author of [null, "", "  ", "token:ai", "token:mechanical"])
    assert.equal(p.reopen({ target: null, reason: "", author }).reason, "MACHINE_CANNOT_REOPEN");
});

test("R22: the reason is required, bounded and free of quotes, backslashes and newlines", () => {
  const { p } = setup();
  assert.equal(call(p, { reason: "" }).reason, "NO_REASON");
  assert.equal(call(p, { reason: "   " }).reason, "NO_REASON");
  assert.equal(call(p, { reason: "x".repeat(EDGE_REASON_MAX + 1) }).reason, "BAD_REASON");
  for (const bad of ['a "quote"', "back\\slash", "new\nline"]) assert.equal(call(p, { reason: bad }).reason, "BAD_REASON");
  assert.equal(call(p, { reason: "x".repeat(EDGE_REASON_MAX) }).ok, true);
});

test("R23: NO_TARGET; absent and unseen targets answer NO_SUCH_BUNDLE identically; NOT_AN_INQUIRY; NO_DOCUMENT", () => {
  const { p, record, membership } = setup();
  assert.equal(call(p, { target: "" }).reason, "NO_TARGET");
  const absent = call(p, { target: "INQ-2026-0404" });
  membership.hidden.add(ID);
  const unseen = call(p);
  assert.deepEqual({ ...unseen, target: null }, { ...absent, target: null });
  assert.equal(absent.reason, "NO_SUCH_BUNDLE");
  membership.hidden.delete(ID);
  assert.equal(call(p, { viewer: null }).reason, "NO_SUCH_BUNDLE");
  const info = "INFO-2026-0001";
  p.promote(create(info, doc({ id: info, object_type: "information", title: "I", current_state: "collected", created: T0, last_updated: T0 })));
  assert.equal(call(p, { target: info }).reason, "NOT_AN_INQUIRY");
  record.db.prepare("UPDATE files SET content=NULL, blob_sha='b' WHERE bundle_id=? AND path='bundle.md'").run(ID);
  assert.equal(call(p).reason, "NO_DOCUMENT");
});

test("R24: reopenable from a disposition or as a case member; otherwise NOT_SET_DOWN; an undeclared move is ILLEGAL_TRANSITION", () => {
  assert.deepEqual(REOPENABLE_FROM, ["deferred", "dismissed"]);
  for (const s of REOPENABLE_FROM) assert.equal(call(setup(s).p).ok, true);
  const conc = setup("concluded");
  const r = call(conc.p);
  assert.deepEqual([r.reason, r.from, r.reopenable], ["NOT_SET_DOWN", "concluded", REOPENABLE_FROM]);
  const member = setup("concluded", { caseMember: new Set([ID]) });
  assert.equal(call(member.p).ok, true);
  const open = setup("open", { caseMember: new Set([ID]) });
  assert.equal(call(open.p).reason, "ILLEGAL_TRANSITION");
  const divided = setup("divided", { caseMember: new Set([ID]) });
  assert.equal(call(divided.p).reason, "ILLEGAL_TRANSITION");
});

test("R25: reopening is a new promotion over the head: state history, Session Log, prior/current state, cleared disposition and edition, carried files", () => {
  const { p, record, first } = setup("dismissed");
  const r = call(p);
  assert.deepEqual([r.ok, r.from, r.to, r.why, r.author, r.weight], [true, "dismissed", "open", "new evidence arrived", "member:ann", "single"]);
  const text = record.readFile(ID, "bundle.md").text;
  const fm = parseFrontmatter(text).data;
  assert.deepEqual([fm.current_state, fm.prior_state, fm.disposition_reason, fm.case_edition, fm.case_id],
                   ["open", "dismissed", "", null, "CASE-2026-0001"]);
  assert.equal(fm.last_updated, r.at);
  assert.deepEqual(fm.state_history.at(-1), { timestamp: r.at, from_state: "dismissed", to_state: "open",
                                               blurb: "new evidence arrived", author: "member:ann" });
  assert.match(text, new RegExp(`### Session ${r.at} \\| Reopened \\| member:ann\\nTrigger: op=reopen on ${ID}`));
  assert.equal(record.head(ID).currentState, "open");
  assert.equal(record.one("SELECT COUNT(*) AS n FROM manifest WHERE bundle_id=?", ID).n, 2);
  assert.equal(record.readFile(ID, "data/notes.txt").text, "carried");
  assert.equal(record.readFile(ID, "data/cap.pdf").blobSha, "a".repeat(64));
  assert.ok(record.one("SELECT 1 AS x FROM history WHERE bundle_id=? AND sha256=?", ID, first.bundleSha));
  /* Every rule of promote applies: a later module's refusal refuses the reopening, returned with target. */
  const again = setup("deferred");
  again.p.registerStep("later", { check: () => ({ ok: false, reason: "LATER_SAYS_NO" }) });
  assert.deepEqual([call(again.p).reason, call(again.p).target], ["LATER_SAYS_NO", ID]);
  /* A state_history block that cannot be extended is refused. */
  const bad = makePromotion();
  const t = inq("deferred", { state_history: "oops" });
  assert.equal(bad.p.promote({ ...create(ID, t), replay: true }).ok, true);
  assert.equal(call(bad.p).reason, "UNSPLICEABLE_STATE_HISTORY");
});

test("R26: a live edge citing the target does not refuse a reopening", () => {
  const { p } = setup("deferred", { citedBy: { [ID]: ["INQ-2026-0099"] } });
  assert.equal(call(p).ok, true);
});
