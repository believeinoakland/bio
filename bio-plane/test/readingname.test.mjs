/* NEGATIVE CONTROL: (a) drop the normalisation — in store.mjs make `Store.#labelTerms` return the whole raw label as one term (`const v = String(s ?? "").trim(); return v ? [v] : [];`) -> 18 of 42 fail, every measured variance class going to zero, WHILE the exact-spelling arm ("Coliseum Payment Allocation", correspondence `name`), the refusals, the establishes-nothing arm, the index-plan arm and the backfill arm all stay green. (b) neuter the gate — replace `this.#bundleGate("t.bundle_id", viewer)` with a literal carrying query.mjs's GATE_MARK and 1=1 -> 5 of 42 fail naming the leak: dave is offered the secret capture, his count rises to 2, the forged-viewer probe answers with it, and the unstamped direct read stops failing closed. RUN 2026-08-04, both restored byte-identically (store.mjs sha256 a421850cb2becbee5b2fddaf0869707b0195b5ac4b337165148ca68874fd953b before and after). */
/* REC-36: THE REVERSE READ FOR A NAME-ONLY MENTION — framework §8.1's grade-C
 * tier, made reachable from a member surface.
 *
 * WHAT WAS BROKEN. `reading_refs` had an index on `ref` and none on `label`, so
 * the plane could answer "which documents carry the reference `contract:C-88`"
 * and could not answer "which documents mention this subject BY NAME". §8.1's
 * grade-C tier — correspondence by a name — was therefore unreachable from every
 * surface: UI-13's resolve control said so on the page in so many words, and
 * REC-18's earned grades were bounded by it. A document that mentions a subject
 * only by name earned nothing, not because it concerned the subject any less but
 * because the plane could not be asked.
 *
 * THE SHAPE IS THE MEASUREMENT'S, and the measurement came first (MEASUREMENTS.md
 * 2026-08-04, REC-36; instrument `test/label-variance-probe.mjs`, re-runnable).
 * Over the ONE real captured document this repository holds — a 33-page Oakland
 * Legistar agenda read by the plane's own Tier-1 extraction and the real
 * `meeting_agenda` doctype — against 33 subject names taken FROM that document:
 *
 *   a subject name was the WHOLE label in  0 of 41 labels
 *   the name was EMBEDDED in a longer title    15 (substring)
 *   every term of the name present in it       15 (indexable, and identical)
 *   abbreviations (OPD/HUD/REAP/CSBG/MOU)       7 hits, 0 by full name
 *   `City of Oakland` / `City Of Oakland`      36 / 14, in ONE document
 *   labels truncated at the source's line wrap  3 of 41
 *   a diacritic (`Mentor-Protégé`)              1 of 41
 *
 * So: NOT a normalised whole-label index, which measured zero. NOT a bare
 * normalisation either, which reaches `OPD` from nothing. An INDEX on the
 * label's normalised TERMS, read through an ALIAS JOIN — the registry's own
 * names walked into that index, because the abbreviation class lives only there.
 * The corpus is one document, one doctype, one institution and is TOO THIN for a
 * distribution; what n=41 settles is the shape, because "0 of 41" is a fact about
 * what a label IS here and not a sampling artefact.
 *
 * EVERY LABEL BELOW IS A REAL ONE from that document, so this suite exercises the
 * measured variance classes and not invented ones. The two exceptions are named
 * where they appear.
 *
 * WHAT THIS READ DOES NOT DO, asserted rather than promised: it establishes
 * nothing. No resolution is written, no grade is minted, and each candidate says
 * HOW it corresponded — `name` (the label IS this subject's name, what the
 * recogniser already reached) or `name_in_label` (the name sits inside a longer
 * title, the tier this adds and the weaker of the two). op=resolve remains the
 * only thing that grades, and a C there is still `needs_confirmation`.
 *
 * GATED PER REC-30, in the STRONGER of the gate's two postures: the ROW is
 * withheld, not the bundle reference redacted. A candidate a member cannot open
 * is not a candidate, and offering a nameless one still discloses that a document
 * naming their subject sits in a project they were not invited to. No count of
 * what was withheld is reported, because that count is the leak.
 *
 * Everything is driven THROUGH the control plane (op=…, a real caller's only
 * route), so coverage credits the control-plane surface and not only the store
 * (the D-43 class). The plan assertion and the fail-closed arm run against the
 * Durable Object directly, on `projection.test.mjs`'s precedent, because neither
 * is reachable through a control plane that always stamps a viewer.
 *
 * NEGATIVE CONTROL: two arms, both RUN 2026-08-04, each restored byte-identically (store.mjs sha256 a421850cb2becbee5b2fddaf0869707b0195b5ac4b337165148ca68874fd953b before and after both) — (a) drop the normalisation, and the near-name documents vanish while the exact-spelling match still answers; (b) neuter the gate, and dave is offered the secret capture. In full:
 *   (a) DROP THE NORMALISATION — in store.mjs make `Store.#labelTerms` return the whole raw label as one term (`const v = String(s ?? "").trim(); return v ? [v] : [];`) -> **18 of 42 failed**: every measured variance class went to zero (case 2->0 for carol and 1->0 for dave, embedded/Alameda 1->0, abbreviation/OPD 1->0 in both its arms, punctuation/Weaver 1->0, truncation 1->0, diacritic/CRC 1->0, the two unusable-alias arms, and the three gate arms that count what dave and carol are offered) — WHILE THE EXACT TIER STAYED GREEN: "Coliseum Payment Allocation" still answered 1 candidate at correspondence `name`, and the refusals, the establishes-nothing arm, the index-plan arm and the whole backfill arm passed untouched. That is the shape the control had to have: only the tier this item adds disappears.
 *   (b) NEUTER THE GATE — replace `this.#bundleGate("t.bundle_id", viewer)` with a literal object carrying query.mjs's GATE_MARK string followed by `1=1` and no args (written out rather than pasted here, because the mark's closing characters would end this comment) -> **5 of 42 failed**, naming the leak: dave is offered the secret capture, his count rises to 2, the forged-viewer probe answers with it, and the unstamped direct read stops failing closed. Every other assertion passed, which is why arm (a) alone was not enough — the whole read can be correct and still leak, and the two failures look nothing alike.
 * ONE FINDING FROM RUNNING (a), kept because the instrument was wrong first: the suite originally THREW on `alameda.documents[0].label` the moment the list emptied, so arm (a) reported 5 failures and hid the 13 after it — including the exact-tier arm that is the whole point of the control. Every index into `documents` is guarded now. This is D-93's lesson (a chain that stops at the first failure hides everything after it) turning up inside a negative control.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const STORE = fileURLToPath(new URL("../src/store.mjs", import.meta.url));

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r36", MEMBER_TOKEN: "mem-r36", PROBE_TOKEN: "prb-r36", VERSION: "test" },
});
/* The Durable Object on its own, for the two things a control plane that ALWAYS
   stamps a viewer cannot show: the query plan, and what the store does when no
   stamp arrives at all (projection.test.mjs's precedent). */
const dmf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: STORE, script: readFileSync(STORE, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r36") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const get = async (op, qs = "", tok = "mem-r36") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}${qs ? "&" + qs : ""}`)).json());
const dcall = async (p, body) => (await (await dmf.dispatchFetch("http://x" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json());

const NOW = "2026-07-16T00:00:00Z";

/* ------------------------------------------------------------------ members */
const member = async (id, caps, role = "member") => {
  const add = await post("memberadd", { memberId: id, cover: `cover for ${id}`, role, capabilities: caps }, "adm-r36");
  if (!add?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await post("enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await post("login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* 4.2/4.3: the first two roster members must be administrators. carol OWNS the
   project (her session creates it, so the plane stamps her as owner); dave is the
   uninvited member the gate arm is about. */
await member("ruth", ["contribute"], "admin");
await member("gus", ["contribute"], "admin");
const carol = await member("carol", ["contribute", "create_projects"]);
const dave = await member("dave", ["contribute"]);

/* ------------------------------------------------- captured documents + readings */
const bundleMd = (id, type) => [
  "---", `id: ${id}`, `object_type: ${type}`, `schema: ${type}@1`,
  `title: "${id}"`, `current_state: ${type === "project" ? "forming" : "collected"}`,
  "prior_state: null", `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "An agenda item.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");

let bseq = 0;
/* Promote a bundle carrying ONE captured document whose reading names ONE piece
   of legislation. The ref/key are the source's own Legistar file number (the A/B
   tier, deliberately matching NO registered entity here so nothing in this suite
   can pass through the reference path by accident); the LABEL is the item title,
   which is what this item indexes. */
const doc = async (type, tok, key, label) => {
  const id = `${type === "project" ? "PROJ" : "INFO"}-2026-${String(++bseq).padStart(4, "0")}-r36`;
  const md = bundleMd(id, type);
  const capture = sha(`r36-${key}`);
  const prov = JSON.stringify({ documents: [{
    capture: { sha256: capture, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_agenda", reader_version: 1, found: true, at: NOW,
               entities: [{ ref: `legislation:${key}`, kind: "legislation", key, label }] } }] });
  const files = [
    { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
    { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
  ];
  const r = await post("promote", {
    bundleId: id, base: null, snapKey: `${id}-new`, author: "r36", files,
    register: [{ sha256: capture, path: "captures/doc.pdf", encoding: "binary", bytes: 10 }],
    meta: { object_type: type, group: "believe-in-oakland", title: id,
            current_state: type === "project" ? "forming" : "collected",
            created: NOW, last_updated: NOW } }, tok);
  if (r?.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
  return { id, capture };
};

console.log("\n--- promote captured documents carrying the MEASURED label classes ---");
/* Every label here is verbatim from the measured document (MEASUREMENTS.md
   2026-08-04) unless marked. */
const D_CASE = await doc("information", "mem-r36", "26-0867",
  "Operational Agreement Between City Of Oakland And Alameda County For");   // case variant + embedded + truncated
const D_EXACT = await doc("information", "mem-r36", "26-0912",
  "Coliseum Payment Allocation");                                            // the whole label IS a name
const D_ABBR = await doc("information", "mem-r36", "26-0857",
  "OPD RSI Helicopter Maintenance Contract");                                // the abbreviation class
const D_PUNCT = await doc("information", "mem-r36", "26-0880",
  "Professional Services Agreement With Weaver And Tidwell, LLP For Forensic"); // punctuation + case + truncated
const D_DIA = await doc("information", "mem-r36", "26-0817",
  "Construction Resource Center Grant Agreement For Mentor-Protégé Program");  // the one diacritic
/* The SECRET document: the same subject, filed inside a project CAROL creates and
   DAVE is never invited to. Its label is the OTHER measured case form of the same
   institution name, which is the point — dave's list must omit the document, not
   merely lose its id. */
const D_SECRET = await doc("project", carol, "26-0871",
  "MOU Between The City of Oakland And The California Highway Patrol");

t("six captured documents promoted with readings", bseq, 6);
t("the secret document's capture is filed on a project", D_SECRET.id.startsWith("PROJ-"), true);

/* --------------------------------------------------------- the subject registry */
console.log("\n--- register subjects, whose ALIASES are what the read joins through ---");
const ent = async (kind, label, aliases = []) => {
  const r = await post("entitycreate", { kind, label, aliases });
  if (!r?.ok) throw new Error(`entitycreate ${label}: ${JSON.stringify(r)}`);
  return r.entity_id;
};
const E_CITY = await ent("institution", "City of Oakland");
const E_OPD = await ent("body", "Oakland Police Department", ["OPD"]);
const E_WEAVER = await ent("institution", "Weaver and Tidwell, LLP");
const E_CRC = await ent("institution", "Construction Resource Center");
const E_ALAMEDA = await ent("institution", "Alameda County");
const E_COLISEUM = await ent("contract", "Coliseum Payment Allocation");
/* Unaccented, DELIBERATELY: #labelTerms does not fold diacritics, and this entity
   is what holds that decision to an assertion rather than a comment. */
const E_PROTEGE = await ent("contract", "Mentor-Protege Program");
const E_NOBODY = await ent("person", "Nobody At All");
t("eight subjects registered", new Set([E_CITY, E_OPD, E_WEAVER, E_CRC, E_ALAMEDA, E_COLISEUM, E_PROTEGE, E_NOBODY]).size, 8);

const cands = async (entity, tok = "mem-r36") => await get("readingname", `entity=${entity}`, tok);
const shasOf = (r) => (r.documents || []).map((d) => d.capture_sha).sort();

/* ------------------------------------------ the measured variance classes, one by one */
console.log("\n--- CLASS 1: case varies for one name (measured 36 vs 14 in ONE document) ---");
const city = await cands(E_CITY, carol);
t("a label spelling the name 'City Of Oakland' is offered for the subject 'City of Oakland'",
  shasOf(city).includes(D_CASE.capture), true);
t("so is the OTHER measured case form, 'City of Oakland'",
  shasOf(city).includes(D_SECRET.capture), true);
t("both are offered as the WEAKER correspondence, the name inside a longer title",
  [...new Set((city.documents || []).map((d) => d.correspondence))], ["name_in_label"]);
t("and the answer names WHICH of the subject's names matched",
  [...new Set((city.documents || []).map((d) => d.matched_alias))], ["City of Oakland"]);

console.log("\n--- CLASS 2: a name EMBEDDED in a longer title (measured 15 of 15) ---");
const alameda = await cands(E_ALAMEDA);
t("'Alameda County' finds the document whose title merely mentions it", shasOf(alameda), [D_CASE.capture]);
t("the label offered is the document's own, verbatim",
  (alameda.documents[0]||{}).label, "Operational Agreement Between City Of Oakland And Alameda County For");

console.log("\n--- CLASS 3: ABBREVIATION — reachable by NO normalisation, only by a registered alias ---");
const opd = await cands(E_OPD);
t("'Oakland Police Department' finds the document that says only 'OPD'", shasOf(opd), [D_ABBR.capture]);
t("and it says the match came through the ALIAS, not the canonical name",
  [(opd.documents[0]||{}).matched_alias, (opd.documents[0]||{}).canonical_name], ["OPD", false]);
/* The alias is LOAD-BEARING and this proves it rather than asserting it: the same
   full name registered with NO alias reaches nothing at all. An assertion that
   only re-read the literal above would cost nothing to produce and would be no
   evidence (CLAUDE.md), which is the trap this arm exists to avoid. */
const E_OPD_BARE = await ent("body", "Oakland Police Dept of Nowhere");
t("the same subject WITHOUT the abbreviation registered reaches nothing",
  (await cands(E_OPD_BARE)).count, 0);
await post("entityalias", { entityId: E_OPD_BARE, alias: "OPD" });
t("and reaches the document the moment the abbreviation is registered as a name",
  shasOf(await cands(E_OPD_BARE)), [D_ABBR.capture]);

console.log("\n--- CLASS 4: punctuation and case together (comma 7/41, hyphen 7/41 measured) ---");
t("'Weaver and Tidwell, LLP' matches 'Weaver And Tidwell, LLP' inside a truncated title",
  shasOf(await cands(E_WEAVER)), [D_PUNCT.capture]);

console.log("\n--- CLASS 5: TRUNCATION — a label cut at the source's line wrap still answers ---");
t("a label ending mid-phrase ('… And Alameda County For') is still a candidate",
  (await cands(E_ALAMEDA)).count, 1);

console.log("\n--- CLASS 6: the DIACRITIC, and the decision not to fold it, held to an assertion ---");
t("'Construction Resource Center' finds the accented document (its own words match)",
  shasOf(await cands(E_CRC)), [D_DIA.capture]);
t("'Mentor-Protege' does NOT reach 'Mentor-Protégé' — deliberate, and the conservative direction",
  (await cands(E_PROTEGE)).count, 0);

console.log("\n--- the EXACT tier is SUBSUMED, not replaced: a whole-label name still answers ---");
const col = await cands(E_COLISEUM);
t("a document whose label IS the subject's name is offered", shasOf(col), [D_EXACT.capture]);
t("and is reported as the STRONGER correspondence", (col.documents[0]||{}).correspondence, "name");

console.log("\n--- a subject nothing mentions gets an honest empty answer, with its caveat ---");
const none = await cands(E_NOBODY);
t("no candidates", [none.ok, none.count, none.documents], [true, 0, []]);
t("and the answer still says what an absence does and does not mean",
  /says nothing about whether it exists/.test(none.detail), true);

console.log("\n--- refusals: the read is over a REGISTERED subject ---");
t("no entity refuses by name", (await get("readingname")).reason, "NO_ENTITY");
t("an unregistered entity refuses by name",
  (await get("readingname", "entity=ENT-2026-9999")).reason, "NO_SUCH_ENTITY");

console.log("\n--- a name that normalises to nothing is STATED, never silently dropped ---");
await post("entityalias", { entityId: E_NOBODY, alias: "---" });
const punct = await cands(E_NOBODY);
t("the unusable alias is named on the answer", punct.names_unusable, ["---"]);
t("and the usable count excludes it", punct.names_used, 1);

console.log("\n--- IT ESTABLISHES NOTHING: no resolution is written by asking ---");
t("the subject has no resolutions after the candidate read", (await get("concerns", `id=${E_CITY}`, carol)).count, 0);
t("nor does the document", (await get("resolutions", `sha256=${D_CASE.capture}`)).count, 0);

/* ---------------------------------------------------------------- the gate */
console.log("\n--- GATED (REC-30): an uninvited member's candidate list OMITS the invisible document ---");
const dCity = await cands(E_CITY, dave);
const cCity = await cands(E_CITY, carol);
t("carol, who owns the project, is offered BOTH documents", cCity.count, 2);
t("dave, never invited, is offered only the shared one", shasOf(dCity), [D_CASE.capture]);
t("the secret capture is absent from dave's list entirely — not a nameless row",
  shasOf(dCity).includes(D_SECRET.capture), false);
t("and no row of dave's carries a null bundle: the ROW is withheld, not redacted",
  (dCity.documents || []).every((d) => typeof d.bundle_id === "string" && d.bundle_id), true);
t("dave's count does not betray what was withheld", dCity.count, 1);
t("dave is offered the shared document identically to carol",
  JSON.stringify(dCity.documents[0] || null),
  JSON.stringify((cCity.documents || []).find((d) => d.capture_sha === D_CASE.capture) || null));
/* The gate-like parameter is SERVER-STAMPED: a caller cannot hand the plane a
   viewer and be believed (REC-30's own assertion class). */
const forged = await get("readingname", `entity=${E_CITY}&viewer=class:member`, dave);
t("a caller-supplied viewer is ignored — the session's identity is stamped", shasOf(forged), [D_CASE.capture]);

/* -------------------------------------------- indexed, not a scan; and fail-closed */
console.log("\n--- the lookup is INDEXED, not a scan (the projectionPlan precedent) ---");
const plan = await dcall("/readingnameplan?terms=oakland,police");
const detail = (plan.result || plan).plan.join(" | ");
t("the term lookup uses the term index", /USING (COVERING )?INDEX reading_ref_terms_term/.test(detail), true);
t("and nothing in the plan scans reading_ref_terms", /SCAN reading_ref_terms\b/.test(detail), false);

console.log("\n--- fail-closed: no viewer stamp reaches the store = no candidates, never all of them ---");
await dcall("/promote", {
  bundleId: "INFO-2026-0099-direct", base: null, snapKey: "direct-1", author: "r36",
  meta: { object_type: "information", group: "believe-in-oakland", title: "direct",
          current_state: "collected", created: NOW, last_updated: NOW },
  files: [{ path: "bundle.md", text: bundleMd("INFO-2026-0099-direct", "information"),
            bytes: 1, sha256: sha("x") },
          { path: "data/provenance.json", bytes: 1, sha256: sha("y"),
            text: JSON.stringify({ documents: [{ capture: { sha256: sha("direct"), encoding: "binary", bytes: 10 },
              reading: { content_type: "meeting_agenda", reader_version: 1, found: true, at: NOW,
                entities: [{ ref: "legislation:26-0912", kind: "legislation", key: "26-0912",
                             label: "Coliseum Payment Allocation" }] } }] }) }],
  register: [],
});
const e2 = await dcall("/entitycreate", { kind: "contract", label: "Coliseum Payment Allocation" });
const direct = await dcall(`/readingname?entity=${(e2.result || e2).entity_id}`);
t("an unstamped read answers as an empty corpus does, not as an unfiltered one",
  (direct.result || direct).count, 0);
const E2 = (e2.result || e2).entity_id;
t("the same read WITH a machine stamp finds the document, so the empty answer above was the GATE and not an empty store",
  (await dcall(`/readingname?entity=${E2}&viewer=class:member`)).result.count, 1);

console.log("\n--- the BACKFILL: a store holding readings written before the index existed ---");
/* An EMPTY name index is indistinguishable from "no document mentions this
   subject" — the answer that would be silently wrong on every instance promoted
   before this table existed. The index is therefore re-derived from the labels
   already persisted on reading_refs (no document is re-read), and this arm
   exercises that path on `projectionclear`/`reproject`'s precedent, because a
   repair path nothing can run is a repair path nobody has ever run. */
const cleared = (await dcall("/readingtermsclear", {})).result;
t("the index clears, so the store looks like one that predates it", cleared.remaining, 0);
t("and the subject then reaches NOTHING, which is the silently-wrong answer",
  (await dcall(`/readingname?entity=${E2}&viewer=class:member`)).result.count, 0);
const re = (await dcall("/reindexnames", {})).result;
t("the backfill re-derives it from the labels already stored", re.indexed >= 1, true);
t("and the subject is reachable again with no document re-read",
  (await dcall(`/readingname?entity=${E2}&viewer=class:member`)).result.count, 1);

await mf.dispose();
await dmf.dispose();
console.log(`\nreadingname: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
