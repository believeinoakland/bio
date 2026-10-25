/* store-request R19 (STORE-REQUEST #3, B6 START; K5148; SCREENS-INQUIRY #29 J42, `op-tables.md` §5.3): the recipes the screens' jobs need, each a
   sequence of real acts through the world's door that answers what its acts answered and inserts no row. A refused act throws, naming the op.
   The platform enters only as the world's doubles: the network (`world.script`, a daemon's fetch of a public address) and the environment. */
import { generateKeyPairSync } from "node:crypto";
import { generate } from "../../pdfgen.mjs";
import { hold, project, resultOf, refusedAct, instant, hex } from "./door.mjs";

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "x";
const counter = (world, key) => (world[key] = (world[key] || 0) + 1);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** A web page held and read: its paragraphs and footnotes are text units of the reading, so a leg can address a paragraph (`doc-para`) or a
 *  footnote (`doc-part`). Answers `{sha, bundle, read}` as `hold` does. */
export async function page(world, as, name, { paragraphs = ["The council met on Tuesday and voted on the budget.", "The vote was five to two."], footnotes = [], project: filed = "" } = {}) {
  const html = `<html><head><title>${esc(name)}</title></head><body>\n<h1>${esc(name)}</h1>\n${paragraphs.map((p) => `<p>${esc(p)}</p>`).join("\n")}\n`
    + (footnotes.length ? `<ol>${footnotes.map((f, i) => `<li id="fn${i + 1}">${esc(f)}</li>`).join("")}</ol>\n` : "") + "</body></html>";
  return hold(world, as, name, html, filed, { type: "text/html", read: true });
}

/** A PDF held and read: `pages` pages of `lines` text lines (pdfgen's seeded generator), so a leg can address a page (`pdf-page`). Answers `{sha, bundle, read, pages}`. */
export async function pdf(world, as, name, { pages = 3, lines = 4, seed = slug(name), project: filed = "" } = {}) {
  const bytes = await generate({ kind: "pdf", seed, size: { pages, lines }, kinds: ["text"] }).bytes();
  return { ...(await hold(world, as, name, bytes, filed, { type: "application/pdf", read: true })), pages };
}

const LEG_KEYS = ["grade", "grade_axis", "grade_source", "ground", "note", "extent_kind", "extent_page", "extent_para", "extent_part", "extent_ref"];

/** A question promoted into `projectId`, as the question wizard promotes it (`promote` of an inquiry with no base): `legs` are `{target, role?, ...}` with
 *  the extent and grade keys the leg grammar reads; `draw: true` draws it into the project too (`drawquestion`). Answers the promotion's answer with `id`. */
export async function question(world, as, projectId, { title = "A question", text = "Is it so?", legs = [], id = null, draw = false } = {}) {
  const now = instant(world);
  const qid = id ?? (await as.read("allocid", { query: { prefix: "INQ", year: now.slice(0, 4) } })).id;
  const targets = [...new Set(legs.map((l) => l.target))];
  const front = ["---", `id: ${qid}`, "object_type: inquiry", `title: ${JSON.stringify(title)}`, `created: "${now}"`, "surfaced_by: human",
    ...(projectId ? [`project: ${projectId}`] : []),
    ...(targets.length ? ["references:", ...targets.flatMap((t) => [`  - target: ${t}`, "    rel: cites", "    status: confirmed"])] : ["references: []"]),
    ...(legs.length ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role ?? "supports"}`,
      ...LEG_KEYS.filter((k) => l[k] !== undefined).map((k) => `    ${k}: ${l[k]}`)])] : []),
    "---", "", "## Question", "", text, "", "## Session Log", ""].join("\n");
  const made = await as.act("promote", { body: { bundleId: qid, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(qid).slice(0, 8),
    meta: { object_type: "inquiry", title, current_state: "open", created: now, last_updated: now }, files: [{ path: "bundle.md", text: front }], register: [] } });
  if (draw) await as.act("drawquestion", { query: { project: projectId, inquiry: qid, note: "" } });
  return { ...made, id: qid };
}

/** `n` questions drawn into `projectId` (a promotion and a `drawquestion` each); answers their ids in order. */
export async function questions(world, as, projectId, n, { legsOf = null } = {}) {
  const ids = [];
  for (let i = 0; i < n; i++)
    ids.push((await question(world, as, projectId, { title: `Question ${i + 1}`, text: `Is ${i + 1} so?`, legs: legsOf ? legsOf(i) : [], draw: true })).id);
  return ids;
}

/** The team's Claude account, by an administrator's real acts: her password again (`reauth`), the team's key set and switched on
 *  (`groupkeyset`, `groupkeyswitch`) and its notice read by her (`groupkeynoticeseen`). The key is a stand-in no call ever sends. */
async function aiAccount(world, as) {
  if (world.__aiAccount) return;
  await as.act("reauth", { body: { password: as.password } });
  await as.act("groupkeyset", { body: { key: "sk-ant-api03-" + "w".repeat(40) } });
  await as.act("groupkeyswitch", { body: { on: true } });
  await as.act("groupkeynoticeseen", { body: {} });
  world.__aiAccount = true;
}

/** A run opened by `as` over a project (`airunopen`), under the account `aiAccount` set. Answers the run's id. */
async function openRun(world, as, projectId) {
  const run = `RUN-${instant(world).slice(0, 4)}-${String(counter(world, "__runs")).padStart(4, "0")}-world`;
  const opened = await as.act("airunopen", { body: { run, contextType: "project", contextId: projectId, skillVersion: "contradiction@1",
    principalClaude: `member:${as.member}`, mode: "check" } });
  if (!opened || opened.started !== true) throw new Error(`storeWorld: airunopen was refused: ${JSON.stringify(opened).slice(0, 400)}`);
  return run;
}

/** R19: a contradiction candidate by real acts (`storeWorld({ ai: true })`, an administrator `as`): the team's Claude account and an open run;
 *  two projects, a document held in each; one question resting on both, one supporting and one cutting against it; the pair the pairing forms
 *  (key K1, `contradictionpairs`); and the run's proposal over it (`contradictionpropose`) with `label`. Answers
 *  `{candidate, inquiry, run, projects: [a, b], documents: [a, b], proposal}`; `contradictioncandidates` reads it by the inquiry or a document. */
export async function contradiction(world, as, { label = "record", reason = "one document says the fee rose, the other that it fell" } = {}) {
  if (!world.env.CIVICSMITH_TEST_INSTANCE)
    throw new Error("storeWorld: recipes.contradiction needs a run, and a run opens only on a test instance: make the world with storeWorld({ ai: true })");
  const n = counter(world, "__contradictions");
  await aiAccount(world, as);
  const pa = await project(world, as, `Contradiction ${n} alpha`), pb = await project(world, as, `Contradiction ${n} beta`);
  const run = await openRun(world, as, pa);
  const a = await hold(world, as, `Rule ${n}`, "The fee rose in 2026.\n", pa), b = await hold(world, as, `Act ${n}`, "The fee fell in 2026.\n", pb);
  const q = await question(world, as, pa, { title: `Did the fee rise ${n}`, text: "Did the fee rise?", legs: [{ target: a.bundle, role: "supports" }, { target: b.bundle, role: "cuts_against" }] });
  const formed = (await as.read("contradictionpairs", { query: { key: "K1" } })).pairs.find((p) => p.inquiry === q.id);
  if (!formed) throw new Error(`storeWorld: the pairing formed no K1 pair over ${q.id}`);
  const proposal = await as.act("contradictionpropose", { body: { run, proposals: [{ key: "K1", a: formed.a, b: formed.b, label, reason }] } });
  return { candidate: proposal.candidates[0].candidate, inquiry: q.id, run, projects: [pa, pb], documents: [a.bundle, b.bundle], proposal };
}

/** R19: a document set aside that a question waits on, by real acts: a project and a question in it; a member's request to capture a public address
 *  for the question (`capturerequest`), drained by the daemon (`capturerequestdrain` with the daemon credential; the address answered by the world's
 *  network, scripted); the request `captured` and its document promoted at `collected`; and the member's `heldsetaside`. Answers
 *  `{project, question, request, sha, document, aside}`; `heldrestore` is the act that undoes it. */
export async function setAside(world, as, { project: filed = null, reason = "it is the wrong year", text = "<html><head><title>Council minutes</title></head><body><p>The council met.</p></body></html>" } = {}) {
  const n = counter(world, "__setasides");
  const projectId = filed ?? await project(world, as, `Set aside ${n}`);
  const q = await question(world, as, projectId, { title: `What was asked ${n}`, text: "What did the council decide?" });
  const address = `https://records.example.org/minutes-${n}.html`;
  world.script(address, async () => new Response(text, { status: 200, headers: { "content-type": "text/html" } }));
  const asked = await as.act("capturerequest", { body: { address, target: q.id } });
  const drained = await world.door({ url: "/api/?op=capturerequestdrain", init: { method: "POST", headers: { "content-type": "application/json" }, body: "{}" } },
                                    { token: world.env.DAEMON_TOKEN });
  const done = (resultOf(drained).captured || []).find((c) => c.request === asked.request);
  if (!done || !done.promoted || !done.promoted.bundle_id) throw refusedAct("capturerequestdrain", drained);
  const aside = await as.act("heldsetaside", { body: { ids: [done.promoted.bundle_id], reason } });
  return { project: projectId, question: q.id, request: asked.request, sha: done.sha, document: done.promoted.bundle_id, aside };
}

/** A signing key of the member's own, registered by her real act (`signerregisterown`: every administrator is told); a case is signed, and checked, with one. Once a member. */
export async function signer(world, as) {
  const held = world.__signers || (world.__signers = new Set());
  if (held.has(as.member)) return;
  const raw = generateKeyPairSync("ed25519").publicKey.export({ format: "der", type: "spki" }).subarray(-32);
  const part = (b) => Buffer.concat([Buffer.from([0, 0, 0, b.length]), b]);
  await as.act("signerregisterown", { body: { keyB64: Buffer.concat([part(Buffer.from("ssh-ed25519")), part(raw)]).toString("base64"), comment: "the world's key" } });
  held.add(as.member);
}

/** R19: a concluded finding a case can be checked on, by real acts: a web page held and read (its text is what travels with the case), a question in the project resting on it
 *  (one supporting leg), the member's own reading concluded (`conclude`), her signing key (`signer`) and the two minutes the scheduler needs to make the document's publication
 *  copy (`world.tick`: the clock moves on). `as` holds `publish` for the check to be asked. Answers `{id, document, project, concluded, publish}`; `publish` is the `{query, body}` of
 *  `publishpreflight` and `publishcheck` over it, each authored field stated, so `as.act("publishcheck", finding.publish)` is held. */
export async function finding(world, as, projectId, { title = "Seven days", text = "Is the city repairing reported potholes within seven days?",
                                                      reading = "Reported potholes are repaired within seven days.", falsifier = "The work orders show otherwise." } = {}) {
  const doc = await page(world, as, `${title} source`, { paragraphs: [reading], project: projectId });
  const q = await question(world, as, projectId, { title, text, legs: [{ target: doc.bundle, role: "supports" }], draw: true });
  const concluded = await as.act("conclude", { query: { target: q.id, reading, falsifier } });
  await signer(world, as);
  await world.tick(120_000);
  return { id: q.id, document: doc.bundle, project: projectId, concluded, publish: { query: { project: projectId }, body: {
    targets: [q.id], roles: { [doc.bundle]: "supporting", [q.id]: "load_bearing" }, statement: "This case does not cover repairs made after the reports were closed.",
    scope: "Potholes reported in 2026.", subjectPosition: "not_sought", subjectJustification: "The question concerns the city's own repair policy.",
    biasAcknowledgement: "We favour prompt repairs.", excluded: [], tieAttested: true } } };
}
