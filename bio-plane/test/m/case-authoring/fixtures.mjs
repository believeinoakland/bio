/* case-authoring's published fixtures (fix-round 10, Wave A batch 4; K4990, K4993, K4995, K5044): the answers this module
   gives to a caller of `publishPreflight` (R34), made by this module's real code when the function is called, over the test
   world of fixture.mjs, and never stored. A user's test takes the answer from here and does not write it by hand. Each is
   checked by fixtures.test.mjs, which calls it and checks the real answer. */
import { world, V, MACHINE, AUTHORED, WHAT_CHANGED, sha } from "./fixture.mjs";

const DOC = "INFO-2026-0001-a";
const Q = "INQ-2026-0001-q";
const ratified = (real) => new Proxy(real, { get: (t, p) => (p === "caseRatifyPreflight"
  ? () => ({ ok: true, ready: true, refusals: [] }) : typeof t[p] === "function" ? t[p].bind(t) : t[p]) });

/** `caseAuthoring.publishPreflight` (R34), three answers over one project `alice` owns and `bo` has joined, each the real
 *  one: `blocked` for a project whose bar (A on both axes) its load-bearing finding does not reach, so `first` is the
 *  refusal `op=publish` gives (BELOW_PROJECT_STRENGTH) and `blockers` holds the other shortfalls; `machine` for a machine
 *  author, whose `first` is MACHINE_CANNOT_PUBLISH; and `notOwner` for a participant who owns nothing, whose `first` is
 *  NOT_THE_PROJECT_OWNER. Each has `{ok, wrote: false, ready: false, first, blockers, steps}`; `args` are the owner's. */
export function preflightAnswer() {
  const w = world({ ratification: ratified });
  for (const m of ["alice", "bo"]) w.member(m);
  w.doc(DOC);
  w.finding(Q, [{ target: DOC, grade: "C", grade_axis: "capture", grade_source: "capture" }]);
  const P = w.project("Team", "alice", [Q], { extra: ["required_strength:", "  capture: A", "  connection: A"] });
  w.join(P, "bo");
  const args = (author) => ({ ...AUTHORED, project: P, targets: [Q], roles: { [Q]: "load_bearing" }, viewer: V(author), author });
  return {
    world: w, project: P, finding: Q, args: args("alice"),
    blocked: w.ca.publishPreflight(args("alice")),
    machine: w.ca.publishPreflight({ ...args("alice"), author: MACHINE }),
    notOwner: w.ca.publishPreflight(args("bo")),
  };
}

/* The three answers below are screens-publish's (B40, K5207): the pre-flight the ceremony draws, each the real answer
   of `publishPreflight` (R34), over one project with a contradiction candidate that a prepared edition may disclose. */
const RUN = "RUN-2026-0001", ADMIN = "class:admin", F = Q, DOC2 = "INFO-2026-0002-b";
const CA = sha("passage a"), CB = sha("passage b");
const TENSION_WORDS = "we read the later page as the award";

function tensionWorld() {
  const w = world();
  for (const m of ["alice", "bo"]) w.member(m);
  const content = (id, capture, bundle) => w.st.sql.exec(
    `INSERT INTO content (content_id, capture_sha, bundle_id, extent_kind, extent, ref, minted_by, at, stale)
     VALUES (?, ?, ?, 'pdf-page', '{}', ?, 'plane', '2026-01-01', 0)`, id, capture, bundle, `the page of ${bundle}`);
  content(CA, w.doc(DOC), DOC); content(CB, w.doc(DOC2), DOC2);
  w.finding(F, [{ target: DOC, content_id: CA }, { target: DOC2, role: "cuts_against", content_id: CB }]);
  const P = w.project("Team", "alice", [F]);
  w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], V("alice"));
  w.runs.set(RUN, { status: "running", principal: "member:alice" });
  const pair = w.contradiction.pairs({ key: "K1", viewer: ADMIN }).pairs.find((p) => p.inquiry === F);
  const r = w.contradiction.propose({ run: RUN, proposedBy: "class:ai/t", viewer: ADMIN, caller: "member:alice",
    proposals: [{ key: "K1", a: pair.a, b: pair.b, label: "record", reason: "the machine's reason" }] });
  if (r.ok !== true) throw new Error(`fixture candidate refused: ${JSON.stringify(r).slice(0, 300)}`);
  return { w, P, id: r.candidates[0].candidate };
}

/* the act's own arguments as the screen sends them for a reload: the draft holds the statement, the call the rest */
function reloadCall(x, over = {}) {
  const { tieAttested, viewer, author, project, biasAcknowledgement, ...kept } = { ...AUTHORED, whatChanged: WHAT_CHANGED,
    targets: [F], roles: { [F]: "load_bearing" } };
  x.w.draft("DRAFT-2026-0001", x.P, kept, { statementBy: "alice" });
  return { draft: "DRAFT-2026-0001", project: x.P, viewer: V("alice"), author: "alice", ...over };
}

/** `publishPreflight` (R34) with the one refusal the ceremony draws for an undisclosed tension: `first` is
 *  TENSION_NOT_DISCLOSED, and nothing is written. */
export function preflightTensionRefused() {
  const x = tensionWorld();
  const call = reloadCall(x, { tieAttested: true, biasAcknowledgement: AUTHORED.biasAcknowledgement });
  return { world: x.w, call, answer: x.w.ca.publishPreflight(call) };
}

/** `publishPreflight` (R34) for a prepared edition whose disclosure is on record: `first` is null (the pre-flight passes
 *  its refusals; it does not sign, so `ready` stays false until a key is held). */
export function preflightPasses() {
  const x = tensionWorld();
  const typed = { tieAttested: true, biasAcknowledgement: AUTHORED.biasAcknowledgement,
                  tensionsDisclosed: [{ candidate: x.id, words: TENSION_WORDS }] };
  const done = x.w.ca.publishCase({ ...reloadCall(x), ...typed });
  if (done.ok !== true) throw new Error(`fixture preparation refused: ${JSON.stringify(done).slice(0, 300)}`);
  const call = reloadCall(x, typed);
  return { world: x.w, call, answer: x.w.ca.publishPreflight(call) };
}

/** `publishPreflight` (R34) for a call naming no finding: `first` is PUBLISH_NO_FINDING. */
export function preflightNoFinding() {
  const x = tensionWorld();
  const call = { ...AUTHORED, whatChanged: WHAT_CHANGED, project: x.P, targets: [], roles: {}, viewer: V("alice"), author: "alice" };
  return { world: x.w, call, answer: x.w.ca.publishPreflight(call) };
}
