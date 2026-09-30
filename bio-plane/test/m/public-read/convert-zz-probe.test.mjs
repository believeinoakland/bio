import { world, stubOf, bucket, sha } from "./fixture.mjs";
import { bindPublishedPlane, publishedRoutes } from "../../../src/publication/worker.mjs";
import { publishedGraphEdges } from "../../../src/publication/index.mjs";
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({ json, StoreSilent: Error, STORE_SILENT_REASON: "S", STORE_SILENT_DETAIL: "s", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch {} return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "S", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }) });
const w = world();
w.member("olive");
const proj = w.project("Parks", "olive");
w.doc("INFO-2026-0001-minutes");
const F = "INQ-2026-0001";
w.inquiry(F, { legs: [{ target: "INFO-2026-0001-minutes" }] });

const pin = w.head(F);
w.prepare("CASE-2026-0001", 1, { project: proj, roles: [{ target: F, version_sha: pin }], strength: [{ target: F, axis: "capture", grade: "B" }, { target: F, axis: "connection", grade: "C" }] });
console.log(w.signCase("CASE-2026-0001", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }], bar: { declared: true, capture: "B", connection: "C" } }));
console.log(w.signFinding(F, { edges: publishedGraphEdges({ ...w.fm(F), division_parent: "INQ-2026-2200-mixed", division_siblings: ["INQ-2026-2200-signature"] }) }));
const c = w.read("publishedcase", { id: "CASE-2026-0001" });
console.log(JSON.stringify(c, null, 1).slice(0, 5000));
console.log("EQ", sha(w.text(F)) === w.head(F), sha(w.text("INFO-2026-0001-minutes")) === w.head("INFO-2026-0001-minutes"));
console.log(w.row("SELECT * FROM published_held_references"));
