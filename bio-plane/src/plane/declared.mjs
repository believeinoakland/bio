/* plane R72 (T51 fix round; K4168, K4202): THE OPS THE PLANE ANSWERS ITSELF, declared as every owner declares its own
   (op-declarations R80, op-grades R49). `ask` is the door's arm in `ask.mjs` (`askOp`), `readtranslate` the draft path's
   (`draftOnObject`, kind `reading`); neither has an ops map, so neither is in R5's route map. Each row is copied from the
   op's existing rows in `op-declarations` and `op-grades`, never chosen; the fields are what the arm reads. */
import { localize } from "../setup-words/index.mjs";

export const DECLARED_OPS = Object.freeze({
  ask: { classes: ["admin", "member"], machineClasses: [], mutating: true, weight: "caller-owned",
    description: localize("plane.declared.ask", "member-directed: a member's own question to the assistant under their own account; no object is before them"),
    stamps: ["viewer", "member"],
    fields: { accepts: ["question", "conversation", "project", "store", "token"], requires: [] } },
  readtranslate: { classes: ["admin", "member"], machineClasses: [], mutating: false, weight: "read",
    description: localize("plane.declared.readtranslate", "draft: a machine translation of one passage of the group's own writing (a note, question, finding or notice) into the member's language, labeled machine work, the original one tap away; held nowhere and writes nothing (plane R50)"),
    stamps: ["viewer", "by"],
    fields: { accepts: ["subject", "language"], requires: ["subject"] } },
  owedwork: { classes: ["admin", "member"], machineClasses: [], mutating: false, weight: "read",
    description: localize("plane.declared.owedwork", "what the object still owes one document, or the counts of what it owes: the keeps, readings, scan pages, supporting files and archive entries left for its alarm, each owed or ended for a stated reason; writes nothing"),
    stamps: ["viewer"],
    fields: { accepts: ["sha"], requires: [] } },
});
