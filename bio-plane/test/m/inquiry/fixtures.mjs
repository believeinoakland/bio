/* inquiry's published fixtures (fix round 10; K4990, K4993, K4995, K5044): what the module answers, made by its real code
   over the real record, promotion, retrieval and membership each time a test calls one, never stored. A module that reads
   inquiry takes its answer from here and never builds one by hand. Each export returns the real answers together with the
   ids the real code was given. */
import { world, inquiryMd, V } from "./fixture.mjs";

const A = "INFO-2026-9001-a", B = "INFO-2026-9002-b";
const Q = "INQ-2026-9001-q", R = "INQ-2026-9002-r", S = "INQ-2026-9003-s", MIGRATED = "INQ-2026-9004-m";
const must = (r, what) => {
  if (!r || r.ok !== true) throw new Error(`fixture ${what} refused: ${JSON.stringify(r).slice(0, 300)}`);
  return r;
};

/** R16 (leg-earning R4): `basisFor` asked for no question at all, which it cannot read (`NO_ID`), and for one the record
 *  does not hold, which it reads as a question resting on nothing. */
export function basisForUnread() {
  const w = world();
  return { inquiry: w.k, noId: w.k.basisFor(""), unheld: w.k.basisFor("INQ-2026-9099-x"), unheldId: "INQ-2026-9099-x" };
}

/** R11, R62: the refusals a promotion of an inquiry's basis is answered with, each from a real promote of a bad basis:
 *  `basisRefused` (a leg whose role is no role, with its `findings`), `selfBasis` (a leg resting on the
 *  question itself), `basisCycle` (a leg closing a cycle, with the whole `path`) and `machinePassageUnchecked` (the read
 *  that says whether a member may cite a machine's passage fails). `question` is the id the first, second and fourth name,
 *  `cycleQuestion` the one the third does. Nothing is written by any of them. */
export function basisRefusals() {
  const w = world(); w.member("alice"); w.doc(A); w.doc(B);
  const basisRefused = w.promote(Q, inquiryMd(Q, { legs: [{ target: A, role: "maybe" }] }), null, { author: V("alice") });
  const selfBasis = w.promote(Q, inquiryMd(Q, { legs: [{ target: Q }] }), null, { author: V("alice") });
  must(w.promote(R, inquiryMd(R, { legs: [{ target: A }] }), null, { author: V("alice") }), "question R");
  must(w.promote(S, inquiryMd(S, { legs: [{ target: R }] }), null, { author: V("alice") }), "question S");
  const basisCycle = w.promote(R, inquiryMd(R, { legs: [{ target: A }, { target: S }] }), undefined, { author: V("alice") });
  const m = world(); m.member("alice"); m.doc(A);
  m.k.onMachinePassage("run-productions", () => { throw new Error("the read is down"); });
  const machinePassageUnchecked = m.promote(Q, inquiryMd(Q, { legs: [{ target: A }] }), null, { author: V("alice") });
  return { world: w, machineWorld: m, question: Q, cycleQuestion: R, basisRefused, selfBasis, basisCycle, machinePassageUnchecked };
}

/** R20–R22 (`dispose`): the real act over a real selection and the real promotion. `done` is the answer of deferring two
 *  questions at once; `unknownSelection` and `notYours` the answers for a handle nothing holds and for a selection another
 *  owner made; `dispose(args)` makes the same act again over `handle` with the viewer, owner and author given. */
export function disposeAct({ to = "deferred", reason = "later", author = V("alice") } = {}) {
  const w = world(); w.member("alice");
  w.inquiry(Q); w.inquiry(R);
  w.select("pair", [Q, R]);
  const act = (args = {}) => w.k.dispose({ handle: "pair", to, reason, viewer: "admin", owner: "o", author, ...args });
  const notYours = act({ owner: "someone-else" });
  const unknownSelection = act({ handle: "sel-none" });
  const done = act();
  return { world: w, inquiry: w.k, ids: [Q, R], handle: "pair", to, reason, author, done, unknownSelection, notYours,
           dispose: act };
}

/** R55 (the dated waits notice-producers reads, K2480): one dated wait, `viewer`'s own, stated on a question by that viewer's
 *  promotion, and the real `datedWaits` answer to that viewer at `asOf` (its local midnight of `date`, 07:00Z in October,
 *  Los Angeles time: `due`), and at one second before it (`before`, `waiting`). `viewer` is a member stamp (`member:<id>`),
 *  `date` a day (`YYYY-MM-DD`). `answer` is the real answer as `datedWaits` gives it: its zone, its waits, each with its
 *  text, description, date, state and `set_by`. `admin` reads none of it. */
export function datedWaitOf({ viewer = V("alice"), date = "2026-10-10", asOf = `${date}T07:00:00Z` } = {}) {
  const w = world({ view: () => ({ time_zone: { value: "America/Los_Angeles" } }) });
  const member = viewer.slice("member:".length);
  w.member(member);
  const question = "INQ-2026-9005-w";
  must(w.promote(question, inquiryMd(question, { extra: ["recheck_triggers:", `  - text: "the auditor's reply"`,
    `    description: "from the City"`, `    date: "${date}"`] }), null, { author: viewer }), "dated-wait question");
  return { inquiry: w.k, question, viewer, date, asOf,
           answer: w.k.datedWaits({ member: viewer, asOf, viewer }),
           before: w.k.datedWaits({ member: viewer, asOf: `${date}T06:59:59Z`, viewer }),
           none: w.k.datedWaits({ member: viewer, asOf, viewer: "admin" }) };
}

/** R49 (`migratedSurfacing`): the surfacing a migration replay recorded for `migrated`, and null for `plain`, a question
 *  made on this plane. */
export function migratedSurfacing() {
  const w = world();
  must(w.promote(MIGRATED, inquiryMd(MIGRATED), null, { migrationReplay: { capture: "c".repeat(64), promotion: "P-1" } }), "migrated question");
  w.inquiry(Q);
  return { inquiry: w.k, migrated: MIGRATED, plain: Q, migratedAnswer: w.k.migratedSurfacing(MIGRATED),
           plainAnswer: w.k.migratedSurfacing(Q) };
}

/** R33, R65: the real refusals of a read of a question (`partitionOf`, `op=inquirypartition`): `NOT_AN_INQUIRY` for a
 *  bundle that is no question, and `NO_SUCH_BUNDLE`, one answer, for an id the record does not hold and for a question the
 *  viewer may not see (`hidden`, read by `outsider`, who is not in the project that holds it). */
export function readRefusals() {
  const w = world(); w.member("alice"); w.member("bob");
  w.doc(A); w.inquiry(Q); w.inquiry(R);
  const hidden = w.project("Bob's own", "bob");
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, hidden, Q);
  return { inquiry: w.k, question: Q, visibleQuestion: R, document: A, absentId: "INQ-2026-9099-x", outsider: V("alice"),
           notAnInquiry: w.k.partitionOf({ id: A, viewer: "admin" }),
           absent: w.k.partitionOf({ id: "INQ-2026-9099-x", viewer: "admin" }),
           hiddenFromViewer: w.k.partitionOf({ id: Q, viewer: V("alice") }),
           visible: w.k.partitionOf({ id: R, viewer: V("alice") }) };
}
