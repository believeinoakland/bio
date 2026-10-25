/* docket's published fixtures (fix round 10, Wave A batch 4; K4990, K4993, K4995, K5044): what a user module's test takes in
   place of docket's answers. Each is made by this module's real code, over the real modules it uses, each time a test calls
   one, and is never stored. A user's test names no id of its own: the ids the real code minted come back with the answers. */
import { seeded, file, V, MACHINE, CASE } from "./fixture.mjs";

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
