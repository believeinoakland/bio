/* The authority-task fixture (T51; K4169, UC-046): membership, promotion and provenance real, on the one storage the tasks
   are in, so a decision and a rollback are provenance's own (its R65, R66). The document is a real information bundle whose
   register holds one captured document. */
import { createHash } from "node:crypto";
import { world, iso, projectOf } from "./world.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
export const PRJ = projectOf("Team").projectId, DOC = "INFO-2026-0001-doc", HID = projectOf("Hidden").projectId;
const BYTES = "the captured letter";
export const SHA = createHash("sha256").update(Buffer.from(BYTES, "utf8")).digest("hex");
export const MACHINE = `${MACHINE_CLASS_PREFIX}probe`;

/* The record's information bundle DOC, promoted with one register document (SHA) stating authority `undetermined`, as the task about it asks. */
function promoteDoc(w, promotion) {
  const md = ["---", `id: ${DOC}`, "object_type: information", "schema: information@1", `title: "Document"`, "current_state: collected",
              "prior_state: null", `created: "2026-08-31T00:00:00Z"`, `last_updated: "2026-08-31T00:00:00Z"`, "references: []",
              "state_history: []", "criticality: supporting", "---", "", "## Summary", "", "A document.", ""].join("\n");
  const doc = { file: "snapshots/letter.txt", locator: "https://example.org/letter.txt", retrieved: "2026-08-31T00:00:00Z",
    authority: null, authority_state: "undetermined", authority_basis: "no issuer is named on the letter",
    capture: { method: "acquire", grade: "B", actor_class: "session", sha256: SHA, encoding: "utf8", bytes: Buffer.byteLength(BYTES) },
    origin: { kind: "named_request" } };
  return promotion.promote({ bundleId: DOC, base: null, snapKey: "k1", author: "member:alice", meta: { object_type: "information" },
    files: [{ path: "bundle.md", text: md }, { path: "snapshots/letter.txt", text: BYTES },
            { path: "data/provenance.json", text: JSON.stringify({ documents: [doc] }, null, 2) }],
    register: [{ sha256: SHA, path: "snapshots/letter.txt", encoding: "utf8", bytes: Buffer.byteLength(BYTES) }] });
}

/* ann owns PRJ; bea is joined to it; cy is a member who is not; ada administers and sees PRJ (joined) but not HID. The
   authority task is about DOC, the document the register holds, and is assigned to ann. */
export function seeded() {
  const ref = { calls: [], prov: null };
  /* the one provider the tasks module reaches, logged so a test sees what was asked of it; the real one is built below, over
     the world's own storage */
  const provenance = { homeOf: (c) => ref.prov.homeOf(c), declareAuthority(a) { ref.calls.push(a); return ref.prov.declareAuthority(a); } };
  const w = world({ provenance });
  const now = () => `${iso(w.now).slice(0, -1)}.000Z`;
  const promotion = promotionOf(w.host, { record: w.record, membership: w.membership, now });
  promotion.registerFact("producingGroup", "instance-setup", () => "test-group");
  promotion.registerFact("citedBy", "connections", () => []);
  promotion.registerFact("caseMember", "publication", () => false);
  const prov = provenanceOf(w.host, { record: w.record, membership: w.membership, promotion, now });
  prov.migrate();
  ref.prov = prov;
  for (const m of ["ann", "bea", "cy"]) w.member(m);
  w.member("ada", { role: "admin" });
  const promoted = promoteDoc(w, promotion);
  if (!promoted.ok) throw new Error(`fixture: ${JSON.stringify(promoted)}`);
  w.bundle(PRJ, "project"); w.bundle(HID, "project");
  w.join(PRJ, "ann", { owner: true }); w.join(PRJ, "bea"); w.join(PRJ, "ada");
  w.task("TASK-2026-0001-doc", DOC, { assignee: "ann", role: "project-manager", capture: SHA });
  w.calls = ref.calls;
  w.authorityOf = (bundle = DOC, capture = SHA) => prov.authorityOf(bundle, capture);
  w.decisions = () => w.all(`SELECT * FROM authority_decisions`);
  w.row = (id = "TASK-2026-0001-doc") => w.all(`SELECT * FROM tasks WHERE id=?`, id)[0];
  w.events = (id) => JSON.parse(w.row(id).history).map((h) => h.event);
  return w;
}
