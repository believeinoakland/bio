/* store-request R19 (STORE-REQUEST #7, B18 START; SCREENS-INQUIRY #31 J44 "States the world cannot make"): recipes of the states a document's screens draw, each real acts through the world's door
   and the owner's own code: a document held at an address, a newer capture of it, two captures naming one entity, a PDF read in part, a name matched to no subject, an attestation with its
   authority and archive, a route that cannot be shown, a copy that cannot be retired. None inserts a row; the world's network is the only double. After a clock move the member's session
   has locked with the idle, so each answers a fresh `as`. */
import { generate } from "../../pdfgen.mjs";
import { fileDocument, hold, instant, hex, signIn, resultOf } from "./door.mjs";
import { question, page, setAside } from "./recipes.mjs";

const pageHtml = (t) => `<html><head><title>Council minutes</title></head><body>\n<h1>Council minutes</h1>\n<p>${t}</p>\n</body></html>`;
const serve = (world, address, html) => world.script(address, async () => new Response(html, { status: 200, headers: { "content-type": "text/html" } }));

/** R19: a document held from an address, as a member's capture of a public page is filed: the world's network serves `html` at `address`, `acquire` captures it and `promote` files it at
 *  `collected` (under `project` when given). Answers `{sha, bundle, address}`. */
export async function holdAt(world, as, name, address, html, project = "") {
  serve(world, address, html);
  const doc = (await as.act("acquire", { body: { locator: address, ...(project ? { project } : {}) } })).document;
  return { ...(await fileDocument(world, as, name, doc, project)), address };
}

/** R19: a newer capture of a cited document, by the real acts: a project, a question drawn into it, the page held at an address and read, a passage of it cited into the question, the
 *  document monitored daily, the source changed and `monitor` run (the changed bytes are a newer capture in the same document), and the clock moved on for the notice sweep. The question's
 *  re-evaluation notice is open and the queue holds the finding `newer-capture-affects-reference`. With `decide: "adopt"` or `"keep"` the notice is answered (`adoptversion`, `keepversion`).
 *  Answers `{as, project, question, document, address, notice, finding, done}`: `as` the member signed in again. */
export async function newerCapture(world, as, { address = "https://records.example.org/minutes-newer.html", decide = null, project = null } = {}) {
  const projectId = project ?? await world.recipes.project(as, `Pothole repairs ${(world.__newer = (world.__newer || 0) + 1)}`);
  const q = await question(world, as, projectId, { title: "Seven days", text: "Is it so?", draw: true });
  const held = await holdAt(world, as, "Council minutes", address, pageHtml(`The vote was five to two (${address}).`), projectId);
  await as.act("readheld", { query: { sha: held.sha } });
  const units = (await as.read("reading", { query: { sha256: held.sha } })).text_units;
  await as.act("cite", { body: { project: q.id, role: "supports", found: { capture_sha: held.sha, extent: units[0].extent, kind: "passage" } } });
  await as.act("monitorset", { body: { bundleId: held.bundle, enabled: true, frequency: "daily" } });
  serve(world, address, pageHtml(`The vote was four to three, and the budget was amended (${address}).`));
  await as.act("monitor", { body: { bundleId: held.bundle } });
  await world.tick(120_000);
  const me = await signIn(world, as.handle);
  const notice = (await me.read("reevaluationnotices", { query: { holder: q.id } })).notices[0];
  if (!notice) throw new Error(`storeWorld: the newer capture of ${address} raised no notice for ${q.id}`);
  const finding = (await me.read("queue")).items.find((i) => i.kind === "newer-capture-affects-reference");
  const done = decide ? await me.act(decide === "adopt" ? "adoptversion" : "keepversion", { body: { notice: notice.notice, why: "the change does or does not touch our passage" } }) : null;
  return { as: me, project: projectId, question: q.id, document: held.bundle, address, notice, finding, done };
}

const minutes = (n) => ["Meeting Minutes - DRAFT", "The Oakland City Council Rules And Legislation Committee Convened At 10:30 A.M.", "3.1", "Subject: Pothole repair ordinance", "From: Public Works", "Recommendation: Adopt.", "26-0910",
  "A motion was made by Rowena Brown, seconded by Janani Ramachandran, that this matter be Accepted. The motion carried by the following vote:", "Aye:", "Rowena Brown", "3 - ", "Meeting Minutes - DRAFT",
  "3.2", "Subject: Other item " + n, "From: Clerk", "26-09" + (20 + n), "This Informational Report be Received and Filed.", "Meeting Minutes - DRAFT",
  "There Being No Further Business, The Committee Adjourned The Meeting At 11.02 A.M.", ""].join("\n").replace("11.02", "11:02");
const pre = (t) => `<html><head><title>Minutes</title></head><body><pre>${t}</pre></body></html>`;

/** R19: two captures naming one entity: `admin` makes the team's profile active (`profilesset`, the file-number shape), `as` holds two sets of minutes naming one ordinance (read), makes the
 *  entity, `resolve`s both, and the connection sweep finds it; with `choose` (default) she picks the connection (`connectionchoose`); a progression of the entity is defined and both
 *  captures threaded through it. Answers `{as, entity, documents: [a, b], connection, chose, instances}`. */
export async function connection(world, admin, as, { project = "", choose = true } = {}) {
  await world.recipes.profiles(admin, ["oakland-alameda"]);
  const a = await hold(world, as, "Minutes one", pre(minutes(1)), project, { type: "text/html", read: true });
  const b = await hold(world, as, "Minutes two", pre(minutes(2)), project, { type: "text/html", read: true });
  const entity = (await as.act("entitycreate", { body: { kind: "ordinance", label: "Pothole repair ordinance", note: "The council's pothole repair ordinance, file 26-0910." } })).entity_id;
  for (const x of [a, b]) await as.act("resolve", { body: { captureSha: x.sha } });
  await world.tick(120_000);
  const me = await signIn(world, as.handle);
  const found = (await me.read("connections", { query: { sha256: a.sha } })).connections[0];
  if (!found || found.entity_id !== entity) throw new Error(`storeWorld: no connection of ${entity} was found over ${a.sha}`);
  const chose = choose ? await me.act("connectionchoose", { body: { capture: a.sha, other: b.sha, entity, ref: found.mentions[0].ref, occurrence: null } }) : null;
  const stage = (key, label) => ({ key, label, cardinality: "1", required: "always" });
  await me.act("progressiondefine", { body: { progressionKey: "PRG-minutes", label: "Minutes flow", basis: "the clerk's practice", stages: [stage("agenda", "Agenda"), stage("minutes", "Minutes")] } });
  await me.act("thread", { body: { progressionKey: "PRG-minutes", entityId: entity, placements: [{ stage: "agenda", captureSha: b.sha }, { stage: "minutes", captureSha: a.sha }] } });
  const instances = (await me.read("captureprogressions", { query: { sha256: a.sha } })).instances.length;
  return { as: me, entity, documents: [a.bundle, b.bundle], shas: [a.sha, b.sha], connection: found, chose, instances };
}

/** R19: a PDF held and read in part: three pages of which the second is set in a font with no map to text, so the reading holds the first and third and `unread_pages` is `[1]`; with
 *  `transcribe` (default) the member transcribes page 1 by the real act. Answers `{sha, bundle, read, unread, transcribed}`. */
export async function partialPdf(world, as, name, { project = "", transcribe = true } = {}) {
  const bytes = await generate({ kind: "pdf", seed: "partial", size: { pages: 3, lines: 4 }, fonts: ["type0", "type0-nounicode", "type0"], kinds: ["text"] }).bytes();
  const held = await hold(world, as, name, bytes, project, { type: "application/pdf", read: true });
  const reading = await as.read("reading", { query: { sha256: held.sha } });
  const t = transcribe ? await as.act("transcribe", { body: { bundleId: held.bundle, extent: { kind: "pdf-page", page: 1 }, text: "Repairs are inspected." } }) : null;
  return { ...held, unread: reading.unread_pages, transcribed: t && t.minted };
}

/** R19: names a reading found and no subject matched: a staff directory of six people held and read, one person entity whose alias is the first row (`resolve` matches that row; five stay
 *  unresolved), a second entity, and with `testify` (default) the member's testimony that an unresolved name is the second entity (`resolvetestify`) and the claim that the two entities are one
 *  person (`identityclaim`). Answers `{sha, bundle, unresolved, people: [a, b], claim}`. */
export async function unmatchedPerson(world, as, { project = "", testify = true } = {}) {
  const rows = ["Dana Whitfield", "Luis Ortega", "Priya Nair", "Tom Becker", "Mei Chen", "Omar Haddad"].map((n, i) => `${n}  ${n.split(" ")[0].toLowerCase()}@oaklandca.gov  510-238-45${10 + i}`);
  const html = `<html><head><title>Staff Directory</title></head><body><pre>Neighborhood Services Staff Directory\n${rows.join("\n")}\n</pre></body></html>`;
  const d = await hold(world, as, "Staff directory", html, project, { type: "text/html", read: true });
  const p1 = (await as.act("entitycreate", { body: { kind: "person", label: "Dana Whitfield", note: "coordinator", aliases: [rows[0].replace(/\s+/g, " ")] } })).entity_id;
  const p2 = (await as.act("entitycreate", { body: { kind: "person", label: "Dana L. Whitfield", note: "maybe the same coordinator" } })).entity_id;
  await as.act("resolve", { body: { captureSha: d.sha } });
  const rs = await as.read("resolutions", { query: { sha256: d.sha } });
  let claim = null;
  if (testify) {
    await as.act("resolvetestify", { body: { captureSha: d.sha, ref: rs.unresolved[0].ref, entityId: p2, basis: "named in the footer" } });
    claim = (await as.act("identityclaim", { body: { a: p1, b: p2, kind: "same_as", basis: "testimony", note: "Same title and department" } })).claim_id;
  }
  return { sha: d.sha, bundle: d.bundle, unresolved: rs.unresolved.length, people: [p1, p2], claim };
}

/** R19: a copy attested with the authority and archive the world's network stands up: a document set aside and restored (`setAside`, `heldrestore`), the time-stamping authority and the archive
 *  scripted to answer as `tsa` and `archive` say (both default true; one world, many asks: `ask(tsa, archive)` asks again with the network changed), and the member's `attest` of it. Answers
 *  `{sha, document, address, ask, answer}`: `answer` is the owner's answer for the first ask (`{ok, attestation?, archive?, reason?}`). */
export async function attested(world, as, { tsa = true, archive = true } = {}) {
  const made = await setAside(world, as);
  await as.act("heldrestore", { body: { ids: [made.document], reason: "brought back" } });
  const address = (await as.read("heldcaptures", { query: { bundle_id: made.document } })).held[0].source.address;
  const net = { tsa, archive };
  world.script((r) => /^https?:\/\/(timestamp\.(digicert|sectigo)\.com|rfc3161\.ai\.moda)/.test(r.url), async (req) => {
    if (!net.tsa) return new Response("no", { status: 503 });
    const body = new Uint8Array(await req.arrayBuffer());
    let at = -1;
    for (let i = 0; i + 34 <= body.length; i++) if (body[i] === 4 && body[i + 1] === 32) { at = i + 2; break; }
    return new Response(new Uint8Array([0x30, 41, 0x30, 3, 2, 1, 0, 0x30, 34, 4, 32, ...body.subarray(at, at + 32)]), { status: 200 });
  });
  world.script((r) => r.url.startsWith("https://web.archive.org/save/"), async (req) => net.archive
    ? new Response("saved", { status: 200, headers: { "content-location": "/web/20261001120000/" + req.url.slice(29) } }) : new Response("down", { status: 502 }));
  const ask = async (t = net.tsa, a = net.archive) => {
    net.tsa = t; net.archive = a;
    return resultOf(await world.door({ url: "/api/?op=attest", init: { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ sha256: made.sha, archive: true, locator: address }) } }, as));
  };
  return { sha: made.sha, document: made.document, address, ask, answer: await ask() };
}

/** R19: a document whose route cannot be shown: a clerk's paper file promoted as an information bundle with no provenance file, so `provenanceroute` finds it `LOOKED_INDETERMINATE`, marked, its
 *  register `absent`. Answers `{bundle, route}`. */
export async function paperFile(world, as, projectId) {
  const now = instant(world), id = (await as.read("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } })).id + "-paper-file";
  const front = ["---", "id: " + id, "object_type: information", "schema: information@2", 'title: "A clerk\'s paper file"', "current_state: collected", "prior_state: null", "created: " + now, "last_updated: " + now,
    "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
    "criticality: supporting", "source_status: unchanged", "source:", '  locator: "a clerk\'s paper file"', "  authority: member-entered", "  retrieved: " + now, "monitoring:", "  enabled: false", "  frequency: none",
    ...(projectId ? ["project: " + projectId] : []), "---", "", "## Summary", "", "paper", "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const made = await as.act("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(id).slice(0, 8),
    meta: { object_type: "information", title: "A clerk's paper file", current_state: "collected", created: now, last_updated: now },
    files: [{ path: "bundle.md", text: front, bytes: new TextEncoder().encode(front).length, sha256: hex(front) }], register: [] } });
  const bundle = made.bundleId || id;
  return { bundle, route: (await as.act("provenanceroute", { query: { bundleId: bundle } })).route };
}

/** R19: a copy the store refuses to retire: a page held, selected, and `retire` asked while it was never vouched for (`ILLEGAL_TRANSITION`, the offenders naming the copy and its state). The
 *  recipe answers the refusal, not a throw: it is the state. Answers `{bundle, refused}`. */
export async function unretirable(world, as, projectId) {
  const doc = await page(world, as, "Memo", { project: projectId });
  const sel = await as.act("select", { body: { ids: [doc.bundle] } });
  const refused = resultOf(await world.door({ url: `/api/?${new URLSearchParams({ op: "retire", handle: sel.handle, reason: "no longer used" })}`,
    init: { method: "POST", headers: { "content-type": "application/json" }, body: "{}" } }, as));
  return { bundle: doc.bundle, refused };
}
