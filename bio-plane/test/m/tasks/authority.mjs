/* The authority-task fixture (T51; K4169, UC-046): membership real, provenance a fake in the shape its R65 and R66
   publish (a decision is dated, appended, the latest standing; a refusal carries code, check and translation and writes
   nothing), keeping its decisions in a table of the tasks storage, so a rollback takes a decision back. */
import { world } from "./world.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";
export const PRJ = "PROJ-2026-0001-team", DOC = "INFO-2026-0001-doc", HID = "PROJ-2026-0002-hidden";
export const SHA = "a".repeat(64);
export const MACHINE = `${MACHINE_CLASS_PREFIX}probe`;

/* provenance R65, R66 as published: a decision is dated, appended, the latest standing; a refusal carries code, check and
   translation and writes nothing. The table is in the tasks storage, so a rollback takes a decision back. */
function provenanceFake(ref) {
  const refuse = (code) => ({ ok: false, reason: code, code, check: `P-${code}`, translation: `tr ${code}`, detail: code });
  return {
    homeOf: () => null,
    declareAuthority(a) {
      ref.calls.push(a);
      if (typeof a.by !== "string" || !a.by) return refuse("AUTHORITY_NOT_A_MEMBER");
      if (a.capture !== SHA) return refuse("AUTHORITY_NOT_A_DOCUMENT");
      if (a.outcome !== "determined" && a.outcome !== "undetermined_after_review") return refuse("AUTHORITY_OUTCOME_UNKNOWN");
      if (typeof a.basis !== "string" || !a.basis.trim()) return refuse("AUTHORITY_NO_BASIS");
      if (a.outcome === "determined" && !(typeof a.authority === "string" && a.authority.trim())) return refuse("AUTHORITY_NO_ISSUER");
      ref.db.prepare(`INSERT INTO authority_decisions VALUES (?,?,?,?,?,?)`).run(a.bundle, a.capture, a.outcome, a.authority ?? null, a.basis, a.by);
      return { ok: true, bundle: a.bundle, capture: a.capture, outcome: a.outcome };
    },
    authorityOf(bundle, capture) {
      const rows = ref.db.prepare(`SELECT * FROM authority_decisions WHERE bundle=? AND capture=? ORDER BY rowid`).all(bundle, capture);
      const last = rows[rows.length - 1];
      return last ? { authority_state: last.outcome === "determined" ? "determined" : "undetermined", authority: last.authority, basis: last.basis, by: last.by } : null;
    },
  };
}

/* ann owns PRJ and holds the authority task about it; bea is joined to it; cy is a member who is not; ada administers and
   sees PRJ (joined) but not HID. */
export function seeded() {
  const ref = { calls: [] };
  const w = world({ provenance: provenanceFake(ref) });
  ref.db = w.db;
  w.db.exec(`CREATE TABLE authority_decisions (bundle TEXT, capture TEXT, outcome TEXT, authority TEXT, basis TEXT, by TEXT)`);
  for (const m of ["ann", "bea", "cy"]) w.member(m);
  w.member("ada", { role: "admin" });
  w.bundle(PRJ, "project"); w.bundle(DOC); w.bundle(HID, "project");
  w.join(PRJ, "ann", { owner: true }); w.join(PRJ, "bea"); w.join(PRJ, "ada");
  w.task("TASK-2026-0001-doc", PRJ, { assignee: "ann", role: "project-manager", capture: SHA });
  w.calls = ref.calls;
  w.decisions = () => w.all(`SELECT * FROM authority_decisions`);
  w.row = (id = "TASK-2026-0001-doc") => w.all(`SELECT * FROM tasks WHERE id=?`, id)[0];
  w.events = (id) => JSON.parse(w.row(id).history).map((h) => h.event);
  return w;
}
