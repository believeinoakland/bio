/* screens-investigate R52 (T51; K4194 L2): every "Which document" picker lists the documents a member has vouched for as well as
 * those still held, by asking `heldcaptures` for `held_and_vouched` (capture R88); the answer is the owner's, honouring `state`.
 * Over `store-request`'s world: the documents are held by the member's own acts, one vouched for (`select`, `release`) and one set aside (`heldsetaside`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { inWorld, openAs, readHeld, declareStandard } from "./world.mjs";

const hex = (v) => createHash("sha256").update(v).digest("hex");
const DOC = { kind: "document" };
const LEASE = "Section 8.22.050 No landlord shall increase the rent above the limit the board sets.";

/** A project (as `recipes.project` starts one) whose document cites `targets`, as a project's document cites the people it follows. */
async function projectCiting(world, me, title, targets) {
  const now = new Date(world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
  const refs = ["references:", ...targets.flatMap((t) => [`  - target: ${t}`, "    rel: cites", "    status: active"])];
  const text = ["---", "object_type: project", "title: " + JSON.stringify(title), "objective: " + JSON.stringify(title), "current_state: forming", `created: "${now}"`, `last_updated: "${now}"`,
    ...refs, "---", "", "## Session Log", "", `### Session ${now} | Formation | interactive`, "Trigger: test", "Changes: created.", ""].join("\n");
  const made = await me.act("promote", { body: { base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(title).slice(0, 8),
    meta: { object_type: "project", title, current_state: "forming", created: now, last_updated: now }, files: [{ path: "bundle.md", text }], register: [], visibility: "discoverable" } });
  return made.bundleId;
}

const resultOf = (a) => (a && a.json && a.json.result !== undefined ? a.json.result : a && a.json);
/** A file the member holds, as `recipes.hold` holds it, with the reading the document carries: the references (`entities`) its reading names, so the record can resolve it
 *  to an entity (`resolve`), as a recognised document is. Answers `{sha, bundle}`. */
async function holdRead(world, me, name, text, project, entities) {
  const up = await world.door({ url: `/api/?${new URLSearchParams({ op: "captureupload", statement: name, name })}`,
    init: { method: "POST", headers: { "content-type": "text/plain" }, body: new TextEncoder().encode(text) } }, me);
  const doc = resultOf(up).document;
  const now = new Date(world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
  const id = (await me.read("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } })).id + "-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const sha = doc.capture.sha256;
  const front = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(name), "current_state: collected", "prior_state: null",
    "created: " + now, "last_updated: " + now, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + hex(sha),
    "source:", "  locator: " + JSON.stringify(doc.locator || "upload"), "  authority: member-entered", "  retrieved: " + now, "monitoring:", "  enabled: false", "  frequency: none",
    "project: " + project, "---", "", "## Summary", "", name, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const prov = JSON.stringify({ documents: [{ ...doc, reading: { content_type: "text/plain", found: entities.length > 0, entities, at: now } }] }, null, 1);
  const dataset = JSON.stringify({ documents: [{ bytes: doc.capture.bytes, locator: doc.locator || "upload", sha256: sha }] });
  const len = (v) => new TextEncoder().encode(v).length;
  const files = [{ path: "bundle.md", text: front, bytes: len(front), sha256: hex(front) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: hex(prov) },
    { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: hex(dataset) }, { path: doc.file, blobSha: sha, sha256: sha, bytes: doc.capture.bytes }];
  const register = [{ sha256: sha, path: doc.file, encoding: doc.capture.encoding, bytes: doc.capture.bytes }];
  const made = await me.act("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(id).slice(0, 8),
    meta: { object_type: "information", title: name, current_state: "collected", created: now, last_updated: now }, files, register } });
  return { sha, bundle: made.bundleId || id };
}

/** A world with a project that follows an office and holds four documents: a lease, a rent schedule (a table the member declares), minutes she vouches for, and a draft
 *  she sets aside; a standard over the lease, a person, a court case, a trail with one figure, a calculation over the table, and a matter in a progression.
 *  Answers the screens' paths as the world gave their ids. */
async function scene() {
  /* the founder holds the ordinance and declares the standard over it; the documents the pickers list are a member's own (rosa's): setting aside is a member's own act, and the
     founder's session names no member */
  const { world, me: founder } = await inWorld();
  const me = await world.signIn("rosa", { admin: true });
  await world.recipes.profiles(founder, ["oakland-alameda"]);
  const ent = async (kind, label, note, more = {}) => (await me.act("entitycreate", { body: { kind, label, note, ...more } })).entity_id;
  const org = await ent("office", "Public Works Director", "The city's office for repairs.");
  const project = await projectCiting(world, me, "Pothole repairs", [org]);
  const lease = await holdRead(world, me, "Lease amendment 1", LEASE, project, [{ kind: "office", key: "public-works", label: "Public Works Director" }]);
  await me.act("resolve", { body: { captureSha: lease.sha } });
  const ordinance = await world.recipes.hold(founder, "Ordinance.txt", "Section 8.22.020 No landlord shall retaliate against a tenant who complains.");
  const rent = await world.recipes.hold(me, "Rent schedule", "month,rent\njan,5\nfeb,7\n", project);
  const minutes = await world.recipes.hold(me, "Vouched minutes", "The council adopted the amendment.", project);
  const draft = await world.recipes.hold(me, "Withdrawn draft", "A draft nobody keeps.", project);
  const selected = await me.act("select", { body: { ids: [minutes.bundle] } });
  await me.act("release", { query: { handle: selected.handle }, body: { handle: selected.handle, acknowledgment: "They are what they say.", mitigation: "I read them." } });
  await me.act("heldsetaside", { body: { ids: [draft.bundle], reason: "Not the one we hold." } });
  const units = await readHeld(world, founder, ordinance.sha);
  const std = await declareStandard(founder, { cite: "Ordinance 8.22", kind: "ordinance", sha: ordinance.sha, extent: units[0].extent });
  const chen = await ent("person", "Lin Chen", "Council member who moved the vote.");
  const court = await ent("body", "Alameda Housing Tribunal", "A court.", { forum_kind: "court" });
  const proc = await ent("proceeding", "Lease rent case", "From the caption.", { proceeding: { forum: court, kind: "civil", number: "24CV123456" } });
  const trail = await world.recipes.trail(me, project, "Stormwater fund transfers, FY2023");
  const fact = (await me.act("recordfact", { body: { currency: "USD", sign: "+", precision: "exact", period: { from: "2021-07-01", to: "2022-06-30" }, source: { capture_sha: lease.sha, extent: DOC },
    amount: "4200000.00", as_read: "4,200,000", kind: "transfer", phase: "adopted", basis: "budgetary", from: { as_written: "Sewer Fund" }, to: { as_written: "General Fund" } } })).fact_id;
  await me.act("moneysetpropose", { body: { setId: trail, factId: fact, method: "member:recordfact" } });
  await me.act("include", { body: { setId: trail, factId: fact, reason: "the transfer we ask about" } });
  const table = (await me.act("tabledeclare", { body: { source: { capture_sha: rent.sha, extent: DOC }, header: ["month", "rent"],
    schema: { fields: [{ name: "month", type: "string" }, { name: "rent", type: "number" }] } } })).sha;
  const calc = (await me.act("calculationcreate", { body: { question: "How many months?", period: { from: "2025-07-01", to: "2026-06-30" }, kind: "count", project, inputs: [{ name: "input", table }] } })).calc_id;
  const day = (await me.act("recorddatedfact", { body: { captureSha: lease.sha, extent: DOC, kind: "received", value: "2026-09-01", method: "stated in the document" } })).dated_fact.dated_fact_id;
  const stages = (loose) => [{ key: "sent", label: "Request sent", after: null, within: null, required: "always", cardinality: "1" },
    { key: "determination", label: "Determination", after: "sent", within: "10 days", required: "unless_exception", cardinality: loose ? "0..n" : "0..1" }];
  await me.act("progressiondefine", { body: { progressionKey: "pra", label: "A public records request", basis: "first", citation: "Gov. Code 7922.535", stages: stages(true) } });
  await me.act("thread", { body: { progressionKey: "pra", entityId: org, placements: [{ stage: "sent", captureSha: lease.sha, datedFact: day }] } });
  const PATHS = { standard: "/app/standard/" + std, person: "/app/person/" + chen, proceeding: "/app/proceeding/" + proc, timeline: "/app/timeline/" + project,
    calculation: "/app/calculation/" + calc, money: "/app/money/" + trail, matter: `/app/timeline/${project}/matter/pra/${org}` };
  return { world, me, project, PATHS, titles: { lease: "Lease amendment 1", rent: "Rent schedule", minutes: "Vouched minutes", draft: "Withdrawn draft" } };
}

const SCREENS_WITH_A_PICKER = [
  ["standard", "st-doc"],
  ["person", "person-fact-doc"],
  ["proceeding", "pr-doc"],
  ["timeline", "tl-doc"],
  ["calculation", "calc-content"],
  ["money", "mf-doc"],
];
/** The picker's choices by title (a choice reads the title and the day the record has held it since). */
const titles = (p, id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => o.textContent.split(" · ")[0]).filter((t) => t);
let shared = null;
const theScene = () => (shared ||= scene());

for (const [name, field] of SCREENS_WITH_A_PICKER) {
  test(`R52 ${name}: the document picker offers a vouched document beside a held one, asking heldcaptures for held_and_vouched; control: a document in neither state is not offered`, async () => {
    const S = await theScene();
    const p = await openAs(S.world, S.me, S.PATHS[name]);
    const q = p.byOp("heldcaptures");
    assert.ok(q.length >= 1, "the documents are read");
    for (const r of q) assert.equal(r.query.state, "held_and_vouched", "every read of the documents asks for held and vouched");
    /* the timeline's picker is the project's own list (every read of it names the project) */
    const list = (await S.me.read("heldcaptures", { query: { state: "held_and_vouched", fields: "picker", limit: "200", ...(name === "timeline" ? { project: S.project } : {}) } })).held;
    assert.deepEqual(titles(p, field).sort(), list.map((h) => h.title).sort(), "the owner's list, as the store answers it");
    assert.ok(titles(p, field).includes(S.titles.minutes) && titles(p, field).includes(S.titles.lease) && titles(p, field).includes(S.titles.rent), "the vouched document beside the held ones");
    /* the default list (what the screens asked before) holds no vouched document: the cause of the fix */
    const before = (await S.me.read("heldcaptures", { query: { fields: "picker", limit: "200" } })).held.map((h) => h.title);
    assert.ok(!before.includes(S.titles.minutes), "the default list holds no vouched document");
    /* a document in neither state is in neither list, so it is not offered */
    assert.ok(!before.includes(S.titles.draft) && !titles(p, field).includes(S.titles.draft));
  });
}

test("R52 the one time the picker is drawn from a matter (the thread and discharge folds) it offers the vouched document too", async () => {
  const S = await theScene();
  const p = await openAs(S.world, S.me, S.PATHS.matter);
  const list = (await S.me.read("heldcaptures", { query: { state: "held_and_vouched", fields: "picker", limit: "200", project: S.project } })).held;
  assert.deepEqual(titles(p, "pm-thread-doc").sort(), list.map((h) => h.title).sort());
  assert.ok(titles(p, "pm-thread-doc").includes(S.titles.minutes));
});
