/* docket's published fixtures (fix round 10, Wave A batch 4; K4990, K4993, K4995, K5044): what a user module's test takes in
   place of docket's answers. Each is made by this module's real code, over the real modules it uses, each time a test calls
   one, and is never stored. A user's test names no id of its own: the ids the real code minted come back with the answers. */
import { seeded, file, V, MACHINE, CASE, NOW, OTHER_SUBJECT } from "./fixture.mjs";

const A = V("alice"), B = V("bob");

/** R9: `coreDue` as the module answers it. `due` is the manager's read of a case with a response still owed (`entry` the
 *  response, `items` the real items); `unread` is the read that names no member as viewer, `notManager` the read by a joined
 *  member who does not manage the project and `machine` the read by a machine: each `{ok: true, items: [], count: 0, wrote:
 *  false}`, the answer of a viewer who is shown no case. `read({case, viewer})` is the real call. */
export function coreDue() {
  const w = seeded();
  const entry = file(w).entry;
  const read = (q = {}) => w.docket.coreDue(q);
  return {
    world: w, case: CASE, manager: A, entry, read,
    due: read({ viewer: A }),
    unread: read({}),
    notManager: read({ viewer: B }),
    machine: read({ viewer: MACHINE }),
  };
}

/** R27: `docketPressureOf`, the docket's read of one record entry. `marked` is an entry with a legal mark, `plain` one with
 *  none; `absent` names an entry that does not exist and `unseen` the marked entry asked by a member who sees nothing of its
 *  project: both `NO_SUCH_DOCKET_ENTRY`, byte-identical but for the id. `read({entry, viewer})` is the real call. */
export function docketEntryRead() {
  const w = seeded();
  const marked = file(w).entry, plain = file(w).entry;
  w.docket.docketPressure({ entry: marked, pressure: { kind: "legal", note: "Counsel wrote." }, author: B, viewer: B });
  const absentId = "DKT-2026-9999";
  const read = (q) => w.docket.docketPressureOf(q);
  return {
    world: w, case: CASE, manager: A, marked, plain, absentId, read,
    markedRead: read({ entry: marked, viewer: A }),
    plainRead: read({ entry: plain, viewer: B }),
    absent: read({ entry: absentId, viewer: A }),
    unseen: read({ entry: marked, viewer: V("dave") }),
  };
}

/** R27: `docketPressureMarks`, the plane's read of every mark. `empty` is the answer over a docket with no mark
 *  (`marks: []`); `marked` the answer once one is made; `refused` the ask for a kind it does not know
 *  (`DOCKET_PRESSURE_REFUSED`, no marks read); `unreadable` the answer when the marks table cannot be read
 *  (`DOCKET_UNREADABLE`, never a short list), made on a world of its own. */
export function pressureMarks() {
  const w = seeded();
  const read = (q = {}) => w.docket.docketPressureMarks(q);
  const empty = read({});
  const entry = file(w).entry;
  w.docket.docketPressure({ entry, pressure: { kind: "legal" }, author: B, viewer: B });
  const marked = read({});
  const refused = read({ kind: "rude" });
  const x = seeded();
  const e = file(x).entry;
  x.docket.docketPressure({ entry: e, pressure: { kind: "legal" }, author: B, viewer: B });
  x.st.db.exec(`ALTER TABLE docket_marks RENAME TO docket_marks_gone`);
  const unreadable = x.docket.docketPressureMarks({});
  return { world: w, entry, read, empty, marked, refused, unreadable };
}

/** R9, every core kind: `coreDueKinds` is the real answer to `coreDue` over real acts in two cases of two projects. Case
 *  CASE (project P, managed by alice) has a subject's response and a subject's statement, edition 2 ratified with its "What
 *  changed" statement, and a tension on its load-bearing finding F1. Case `caseQ` (project Q, managed by dave) has a
 *  subject's statement, edition 2 ratified with its "What changed" statement, and a tension on its load-bearing finding F3.
 *  Every statement is filed with its edition. `due` is alice's read and `otherDue` dave's, each the real `coreDue({viewer})`;
 *  `response`, `statementP`, `statementQ` are the record entries the acts minted.
 *  Case `caseR` (project R, managed by hank, who is no member of P or Q) has edition 2 ratified with its "What changed"
 *  statement and a tension on its load-bearing finding F4. A case of a project alice cannot see is answered to her by no
 *  item: `unseenDue` is her read of `caseR` alone, `hankDue` the manager's own, `due` and `otherDue` unchanged. A case with
 *  no project cannot be made: publication's `cases.project_id` is NOT NULL (publication schema.mjs), so none is here. */
export function coreDueKinds() {
  const w = seeded();
  const F3 = "INQ-2026-0003-permits", caseQ = "CASE-2026-0202", F4 = "INQ-2026-0004-hall", caseR = "CASE-2026-0303";
  w.subjects.set(F3, OTHER_SUBJECT);
  w.member("hank");
  const R = w.project("ridge", "hank");
  w.publish(w.P, CASE, 2, [{ id: w.F1, role: "load_bearing" }, { id: w.F2, role: "supporting" }],
            { whatChanged: "Corrected the totals.", at: NOW + 500 });
  w.publish(w.Q, caseQ, 1, [{ id: F3, role: "load_bearing" }]);
  w.publish(w.Q, caseQ, 2, [{ id: F3, role: "load_bearing" }], { whatChanged: "Added a permit.", at: NOW + 500 });
  w.publish(R, caseR, 1, [{ id: F4, role: "load_bearing" }]);
  w.publish(R, caseR, 2, [{ id: F4, role: "load_bearing" }], { whatChanged: "Dropped a date.", at: NOW + 500 });
  w.tensions.list = [{ member: w.F1, candidate: "CAND-1", state: "open" }, { member: F3, candidate: "CAND-3", state: "open" },
                     { member: F4, candidate: "CAND-4", state: "open" }];
  const response = file(w).entry;
  const statementP = file(w, { kind: "statement", capture: w.swept.sha }).entry;
  const statementQ = file(w, { case: caseQ, edition: 1, kind: "statement", capture: w.swept.sha,
                               from: { kind: "subject", entity: OTHER_SUBJECT } }, "dave").entry;
  return { world: w, case: CASE, caseQ, caseR, manager: A, other: V("dave"), hank: V("hank"), response, statementP, statementQ,
           due: w.docket.coreDue({ viewer: A }), otherDue: w.docket.coreDue({ viewer: V("dave") }),
           hankDue: w.docket.coreDue({ viewer: V("hank") }), unseenDue: w.docket.coreDue({ case: caseR, viewer: A }) };
}
