/* NEGATIVE CONTROL: FIVE arms, ALL RE-RUN 2026-08-05 against the FINAL files, store.mjs restored byte-identically after every one (sha256 558d2e2d0575276153fb3b232fc71b02b55f7c9a027cc3e41285506f173b6879 before and after each; the restore is ASSERTED by the runner, not eyeballed). (a) DROP THE NORMALISATION - in store.mjs make Store.#labelTerms return the whole raw label as one term (const v = String(s ?? "").trim(); return v ? [v] : [];) -> 19 of 76 fail, every measured variance class going to zero, WHILE the exact-spelling arm, the refusals, the establishes-nothing arm and the whole backfill arm stay green - AND SO DOES EVERY IDENTIFIER ARM, because an A or B tier is a WHOLE-string match that survives an unsplit term. intent-write 6 of 141. (b) NEUTER THE GATE - replace this.#bundleGate("t.bundle_id", viewer) with a literal carrying query.mjs's GATE_MARK and 1=1 -> 7 of 76 fail naming the leak: dave is offered the secret capture at the NAME tier AND the project-filed reference-spelled capture at the IDENTIFIER tier, both counts rise, the forged-viewer probe answers, and the unstamped read stops failing closed. The two NEW failures are the evidence that both tiers are gated by the ONE gate. intent-write 3 of 141. (c) THE ITEM'S OWN - DROP THE REF-TERM SOURCE: in Store.#refTermSources return the label alone (if (label) return [["label", label]]; as the first line after the three consts) -> 10 of 76 fail and every one is an identifier arm, WHILE THE NAME TIER ANSWERS UNTOUCHED (all six measured variance classes, the abbreviation alias arm, the diacritic refusal and the whole-label name correspondence all green). THE GRADE A CANDIDATE VANISHES AND THE NAME TIER STILL ANSWERS - the arm that proves the two tiers are independent rather than one thing renamed. intent-write 6 of 141, two instruments on one subject. (d) DROP src FROM THE GROUP: in Store.#refTermsSql change GROUP BY t.capture_sha, t.ref, t.src to GROUP BY t.capture_sha, t.ref -> 4 of 76 fail, headed by the MIXING control - 'Fremont Estuary', present in the corpus only as one word of a title and one word of a different string of the same reference, matches 1 where it must match 0. A wrong subject on a document assembled out of two strings neither of which carries the name. intent-write 2 of 141. (e) DERIVE THE GRADE FROM THE CORRESPONDENCE instead of from the recogniser: replace const gradeIf = tier.hits.includes(entityId) ? tier.grade : null; with const gradeIf = whole ? (r.src === "ref" ? "A" : r.src === "key" ? "B" : "C") : null; -> 2 of 76 fail, and they are THIS ITEM'S OWN BUG REPRODUCED: a subject whose registered name is a document's whole label is promised a Grade C that op=resolve would never mint, because another subject's identifier already matches the same reference at A and the cascade does not fall through. intent-write stays GREEN, which is why this arm had to be written here. */
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
 * nothing. No resolution is written and no grade is minted by asking.
 *
 * REC-40, 2026-08-05: THE SAME ONE CALL NOW ANSWERS EVERY TIER, and this header
 * is corrected rather than appended to, because the sentence it replaced said
 * the read answers on the recorded NAME and that stopped being the whole truth.
 * `#recognise` grades on THREE strings — the reference the source assigned (A),
 * that reference's key (B), the recorded label (C) — and REC-36 indexed the
 * third alone, so the first two were proposable only by a caller who already
 * knew the exact string, and after UI-26 traded the per-name loop away they were
 * proposable from nowhere. The term index carries all three now, each under its
 * own `src`, and a candidate says which string carried the name in five values:
 * `reference` / `reference_key` / `name` are whole-string matches the recogniser
 * would grade A / B / C, and `name_in_reference` / `name_in_label` are the name
 * sitting INSIDE a longer string, which it would not match at all. That is what
 * `grade_if_resolved` says — a conditional about a run that has not happened.
 * op=resolve remains the only thing that grades, and a C is still
 * `needs_confirmation`.
 *
 * THE PREMISE NAMED TWO TIERS AND THERE WERE THREE. `op=readingref` matches
 * `reading_refs.ref` and nothing else, so the B tier — a document whose
 * reference KEY is spelled like a registered name — was never reachable from any
 * surface even before UI-26, and restoring the loop would not have restored it.
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
 * NEGATIVE CONTROL: FIVE arms. (a) and (b) are REC-36's, RE-RUN 2026-08-05
 * against this item's FINAL files and reproduced at new counts; (c), (d) and (e)
 * are REC-40's. Every arm restored byte-identically, store.mjs sha256
 * 558d2e2d0575276153fb3b232fc71b02b55f7c9a027cc3e41285506f173b6879 before and
 * after each, and the restore is ASSERTED by the runner rather than eyeballed.
 * The one-line header at the top of this file carries all five in full for a
 * reader who wants to re-run one in a single step; what follows is why each
 * exists.
 *   (a) DROP THE NORMALISATION -> **19 of 76 failed** (18 of 42 at REC-36).
 *       Every measured variance class goes to zero WHILE the exact tier stays
 *       green -- and REC-40 gave this arm a second reading it did not have
 *       before: every identifier arm ALSO stays green, because an A or B tier is
 *       a WHOLE-string match and an unsplit term still matches a whole alias. The
 *       arm now says which tier depends on the normalisation and which does not,
 *       rather than only that something breaks.
 *   (b) NEUTER THE GATE -> **7 of 76 failed** (5 of 42 at REC-36), and the two
 *       NEW failures are the point: dave is offered the project-filed capture at
 *       the IDENTIFIER tier as well as at the name tier. One gate, one piece of
 *       SQL, both tiers -- which is REC-40's "gated identically" measured instead
 *       of asserted from the source text.
 *   (c) REC-40'S OWN, AND THE ITEM'S -- DROP THE REF-TERM SOURCE, so the index
 *       carries labels again exactly as REC-36 shipped it -> **10 of 76 failed,
 *       every one an identifier arm**, while all six measured variance classes,
 *       the abbreviation alias arm, the diacritic refusal and the whole-label
 *       `name` correspondence stayed green. THE GRADE A CANDIDATE VANISHES AND
 *       THE NAME TIER STILL ANSWERS, which is the arm that proves the two tiers
 *       are independent rather than one thing renamed -- had the name tier gone
 *       with it, the widening would have been a rename and this suite could not
 *       have told the difference. intent-write fails with it at 6 of 141, two
 *       instruments on one subject.
 *       ONE READING WORTH KEEPING: the B-tier GRADE assertion stays GREEN under
 *       this arm, and that is correct rather than a hole. `#recogniseTier` reads
 *       `reading_refs` directly and never the term index, so dropping a term
 *       source changes what is OFFERED and not what would be GRADED. The tier
 *       assertion beside it is the one that fires.
 *   (d) DROP `src` FROM THE GROUP -> **4 of 76 failed**, headed by the MIXING
 *       control: a subject whose two words live one in a title and one in a
 *       different string of the same reference matches 1 where it must match 0.
 *       That is a wrong subject on a document assembled out of two strings
 *       NEITHER of which carries the name, and it is the whole reason `src` is in
 *       the PRIMARY KEY rather than merely on the row. This arm is why the
 *       decision is a correctness requirement and not a way of labelling rows.
 *   (e) DERIVE THE GRADE FROM THE CORRESPONDENCE -> **2 of 76 failed**, AND THIS
 *       ARM IS THIS ITEM'S OWN BUG, WRITTEN DOWN. The first version of REC-40
 *       computed `grade_if_resolved` from how the alias corresponded, which is
 *       wrong because `#recognise` NEVER FALLS THROUGH: if any subject's
 *       identifier matches a reference at A, nothing is recorded at B or C for
 *       it, including for a different subject whose registered name the label
 *       happens to be. That version offered a Grade C the record would never
 *       mint -- an overclaim, which this project holds to be worse than a missing
 *       feature. Both callers now use ONE function, so the prediction is made by
 *       the code that does the minting. **intent-write stays GREEN under this
 *       arm**, which is exactly why the assertion had to be written on the plane
 *       side: the surface renders whatever letter it is handed and cannot tell a
 *       true conditional from a false one.
 * ONE FINDING FROM RUNNING (a) AT REC-36, kept because the instrument was wrong first: the suite originally THREW on `alameda.documents[0].label` the moment the list emptied, so arm (a) reported 5 failures and hid the 13 after it — including the exact-tier arm that is the whole point of the control. Every index into `documents` is guarded now. This is D-93's lesson (a chain that stops at the first failure hides everything after it) turning up inside a negative control.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
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
/* REC-40: `ref` is now an OVERRIDE rather than always `legislation:<key>`,
   because this item's whole subject is the string the SOURCE assigned. A
   document whose reference is spelled like a registered name is the A tier and a
   document whose reference KEY is is the B tier, and neither can be arranged
   while every fixture reference is composed from one literal. */
const doc = async (type, tok, key, label, ref = null) => {
  const id = `${type === "project" ? "PROJ" : "INFO"}-2026-${String(++bseq).padStart(4, "0")}-r36`;
  const md = bundleMd(id, type);
  const capture = sha(`r36-${key}`);
  const prov = JSON.stringify({ documents: [{
    capture: { sha256: capture, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_agenda", reader_version: 1, found: true, at: NOW,
               entities: [{ ref: ref || `legislation:${key}`, kind: "legislation", key, label }] } }] });
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

/* REC-40's four, and the REFERENCE is what matters about each of them. The
   documents above deliberately carry Legistar file numbers that match no
   registered subject, so nothing in REC-36's arms can pass through the
   identifier path by accident; these four exist to make that path real. */
const D_REF = await doc("information", "mem-r36", "26-0955",
  "Fifth Amendment To Lease Agreement", "contract:26-0955");        // ref IS a registered name -> A
const D_SECRET_REF = await doc("project", carol, "26-0955s",
  "Ninth Amendment To Lease Agreement", "contract:26-0955");        // the SAME ref, filed where dave cannot look
const D_KEY = await doc("information", "mem-r36", "26-0977",
  "Annual Report Of The Public Ethics Commission");                 // ref KEY is a registered name -> B
const D_MIX = await doc("information", "mem-r36", "26-0999",
  "Fremont Shoreline Improvements", "estuary:26-0999");             // one word in the title, one in the reference

t("ten captured documents promoted with readings", bseq, 10);
/* CORRECTED 2026-08-05 (REC-40), never exempted: this asserted SIX, which was
   the whole fixture while the index carried labels alone. Four documents whose
   REFERENCE carries the name were added because the identifier tiers cannot be
   exercised without them, and a count assertion that is not updated with the
   fixture is a number nobody is checking. */
t("the secret document's capture is filed on a project", D_SECRET.id.startsWith("PROJ-"), true);
t("and so is the one whose REFERENCE is a registered name, so the gate can be shown at that tier too",
  D_SECRET_REF.id.startsWith("PROJ-"), true);

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
/* REC-40's three. E_LEASE is registered under the source's own COMPOSITE key,
   which is what framework 8.1 calls the A tier and what `#recognise` grades A;
   E_ETHICS under the bare KEY, which is the B tier. Neither canonical label
   appears in any document's title as a whole, so nothing here can reach a
   document except through the reference. E_FREMONT is the MIXING control and is
   registered under two words that exist in the corpus in two different strings
   of the same reference and in neither one alone. */
const E_LEASE = await ent("contract", "Broadway Parcel Lease", ["contract:26-0955"]);
const E_ETHICS = await ent("institution", "Public Ethics Commission", ["26-0977"]);
const E_FREMONT = await ent("institution", "Fremont Estuary");
t("eleven subjects registered", new Set([E_CITY, E_OPD, E_WEAVER, E_CRC, E_ALAMEDA, E_COLISEUM, E_PROTEGE,
  E_NOBODY, E_LEASE, E_ETHICS, E_FREMONT]).size, 11);
/* CORRECTED 2026-08-05 (REC-40): eight was the registry this suite needed while
   only the label tier existed. */

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

/* ============================================================================
   REC-40: THE IDENTIFIER TIERS, THROUGH THE SAME ONE CALL.
   ============================================================================
   UI-26 replaced a per-name `op=readingref` loop with one `op=readingname` call
   and MEASURED what that cost: `readingname` answered on the NAME a reading
   recorded and `readingref` on the REFERENCE STRING, so a document whose
   reference is spelled like a registered name stopped being proposable from any
   surface. This is the reversal, and it is one call, not two.

   THE PREMISE NAMED TWO TIERS AND THERE ARE THREE. `#recognise` reads the whole
   reference (grade A), the reference KEY (grade B) and the label (grade C).
   `op=readingref` matches `reading_refs.ref` and nothing else, so the B tier was
   never reachable from ANY surface even before UI-26 — the loop could not have
   restored it either. All three are indexed now, each under its own source. */
console.log("\n--- REC-40 TIER A: a document whose REFERENCE is spelled like a registered name ---");
const lease = await cands(E_LEASE, carol);
t("the document is offered, from the SAME call that answers the name tier", shasOf(lease).includes(D_REF.capture), true);
const leaseA = (lease.documents || []).find((d) => d.capture_sha === D_REF.capture) || {};
t("and it says the SOURCE'S OWN REFERENCE is what carried the name, not the recorded title",
  [leaseA.correspondence, leaseA.matched_on], ["reference", "ref"]);
t("its label carries none of the subject's words, so nothing here came through the label tier",
  leaseA.label, "Fifth Amendment To Lease Agreement");

console.log("\n--- REC-40 TIER B: a document whose reference KEY is a registered name ---");
const ethics = await cands(E_ETHICS);
t("the document is offered", shasOf(ethics), [D_KEY.capture]);
const ethicsB = ethics.documents[0] || {};
t("at the KEY, which op=readingref cannot ask about at all — it matches only the whole reference",
  [ethicsB.correspondence, ethicsB.matched_on], ["reference_key", "key"]);
/* THIS SUBJECT CORRESPONDS THREE WAYS AT ONCE — whole key (B), its name inside
   the whole reference, and its name inside the recorded title — and is ONE
   candidate reported at the STRONGEST. A read that returned three rows for one
   document would be offering a member the same document three times and calling
   it three pieces of evidence. */
t("and three simultaneous correspondences make ONE candidate, at the strongest of them", ethics.count, 1);

console.log("\n--- THE GRADE IS THE RECOGNISER'S, and this read only says what it WOULD mint ---");
t("the A-tier candidate says op=resolve would grade it A", leaseA.grade_if_resolved, "A");
t("the B-tier candidate says B", ethicsB.grade_if_resolved, "B");
t("a whole-label candidate says C", ((await cands(E_COLISEUM)).documents[0] || {}).grade_if_resolved, "C");
t("and a name merely sitting INSIDE a longer string carries NO grade, because #recognise would mint none",
  [...new Set(((await cands(E_ALAMEDA)).documents || []).map((d) => d.grade_if_resolved))], [null]);
/* AND IT IS NOT A LABEL THIS SUITE CHECKS AGAINST ITSELF: the recogniser is RUN
   and its answer compared. An assertion that the string "A" appears where this
   file put the string "A" would cost nothing to produce and be no evidence. */
const resA = await post("resolve", { captureSha: D_REF.capture }, carol);
t("RUNNING op=resolve on the A-tier candidate mints exactly the grade the read predicted",
  [(resA.resolved[0] || {}).entity_id, (resA.resolved[0] || {}).grade], [E_LEASE, "A"]);
const resB = await post("resolve", { captureSha: D_KEY.capture });
t("and on the B-tier candidate, B", [(resB.resolved[0] || {}).entity_id, (resB.resolved[0] || {}).grade], [E_ETHICS, "B"]);

console.log("\n--- THE CASCADE DOES NOT FALL THROUGH, so a candidate may NOT promise a grade ---");
/* FOUND BY REASONING THROUGH `#recognise` AFTER THE FIRST VERSION OF THIS ITEM
   SHIPPED THE BUG, and it is the kind this project calls worse than a missing
   feature: the record claiming more than it can support. `#recognise` records at
   the STRONGEST tier that matched ANYTHING and never falls through — so if some
   subject's identifier matches a reference at A, op=resolve records nothing at C
   for that reference, INCLUDING for a different subject whose registered name
   the label happens to be. A candidate read deriving its letter from how its own
   alias corresponded would offer that second subject a Grade C the record would
   never mint. The fix is that both callers use ONE function, `#recogniseTier`,
   so the prediction is made by the code that does the minting.
   D_REF is the case: its reference is E_LEASE's registered identifier (A) and
   its label is, verbatim, this new subject's registered name (a whole-label C). */
const E_FIFTH = await ent("contract", "Fifth Amendment To Lease Agreement");
const fifth = await cands(E_FIFTH, carol);
const fifthC = (fifth.documents || []).find((d) => d.capture_sha === D_REF.capture) || {};
t("the document IS offered, and the correspondence is honestly reported as a whole-name match",
  [fifth.count, fifthC.correspondence], [1, "name"]);
t("BUT IT PROMISES NO GRADE, because a stronger identifier on the same reference resolves first",
  fifthC.grade_if_resolved, null);
t("and the candidate SAYS why, rather than leaving a member to wonder where the grade went",
  /stronger identifier on this same reference resolves first/.test(fifthC.detail || ""), true);
/* DRIVEN, not asserted: op=resolve is run and this subject gets nothing at all. */
const resFifth = await post("resolve", { captureSha: D_REF.capture }, carol);
t("RUNNING op=resolve records nothing for this subject — which is exactly what the null predicted",
  (resFifth.resolved || []).some((m) => m.entity_id === E_FIFTH), false);
t("while the subject whose IDENTIFIER matched still resolves at A, so the reference did resolve",
  (resFifth.resolved || []).some((m) => m.entity_id === E_LEASE && m.grade === "A"), true);

console.log("\n--- THE KEY DECISION: a name may NEVER be assembled from two different strings ---");
/* The lookup is a SUBSET test over a group, so if the label's terms and the
   reference's terms shared one group a registered name could be satisfied by one
   word taken from the title and another from the reference — a correspondence
   NEITHER string made, and a wrong subject on a document. `src` is in the
   PRIMARY KEY and in the GROUP BY so that is structurally impossible; this is
   the assertion that holds it, and negative control (d) is what proves it bites. */
t("'Fremont Estuary' is in the corpus only as one word of a title and one of a reference — and matches NOTHING",
  (await cands(E_FREMONT)).count, 0);
t("both words really are there, so the zero above is the KEY and not an absent corpus",
  [/Fremont/.test(D_MIX.id) || true,
   ((await get("reading", `sha256=${D_MIX.capture}`)).reading.entities[0] || {}).label,
   ((await get("reading", `sha256=${D_MIX.capture}`)).reading.entities[0] || {}).ref],
  [true, "Fremont Shoreline Improvements", "estuary:26-0999"]);

console.log("\n--- GATED IDENTICALLY AT THE NEW TIER: same gate, same SQL, same withheld ROW ---");
const dLease = await cands(E_LEASE, dave);
t("carol, who owns the project, is offered BOTH documents whose reference is this name", lease.count, 2);
t("dave, never invited, is offered only the shared one", shasOf(dLease), [D_REF.capture]);
t("the project-filed one is absent from dave's list entirely — the ROW, not the bundle id",
  (dLease.documents || []).every((d) => typeof d.bundle_id === "string" && d.bundle_id), true);
t("dave's count does not betray what was withheld at this tier either", dLease.count, 1);

console.log("\n--- op=readingref is UNCHANGED and answers a DIFFERENT question — not collapsed into this one ---");
/* Held open as a RELATION rather than ruled on. `readingref` takes a raw
   reference string FROM THE CALLER and knows nothing about the registry;
   `readingname` takes a SUBJECT and walks its own aliases. A caller holding a
   string and no entity still has only the first. These assert no value about
   which is right — only that the same document is reachable by both routes and
   that neither has become the other. */
const byRef = await get("readingref", `ref=${encodeURIComponent("contract:26-0955")}`, carol);
t("the same document answers to its raw reference string, exactly as it always did",
  (byRef.documents || []).map((d) => d.capture_sha).sort(),
  [D_REF.capture, D_SECRET_REF.capture].sort());
t("and op=readingref still answers on the REFERENCE and takes no entity: a registered subject is not a reference",
  (await get("readingref", `ref=${E_LEASE}`, carol)).count, 0);
t("while op=readingname takes the subject and no reference: the two routes reach one document by different questions",
  shasOf(await cands(E_LEASE, carol)).includes(D_REF.capture), true);

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
const planned = plan.result || plan;
const detail = planned.plan.join(" | ");
t("the term lookup uses the term index", /USING (COVERING )?INDEX reading_ref_terms_term/.test(detail), true);
t("and nothing in the plan scans reading_ref_terms", /SCAN reading_ref_terms\b/.test(detail), false);
/* REC-40: AND IT IS THE STATEMENT THE READ RUNS, not a hand-written twin of it.
   The plan used to explain a bare subquery over `reading_ref_terms` carrying
   neither the join nor the group the read actually groups by — a copy, and one
   that would have gone on passing while the real query started scanning. Both
   now come from `Store.#refTermsSql`. These three assertions are what make that
   structural rather than a claim in a comment. */
t("the plan is OF the joined statement, so the join is measured and not assumed",
  /reading_refs/.test(detail) && /reading_ref_terms/.test(detail), true);
t("and nothing in the plan scans reading_refs either — the join rides its primary key",
  /SCAN reading_refs\b/.test(detail), false);
t("the explained SQL carries the source group, which is the shape the correctness rule lives in",
  /GROUP BY t\.capture_sha, t\.ref, t\.src/.test(planned.sql || ""), true);
/* THE DRIFT LEVER, asserted STRUCTURALLY: a second builder anywhere in store.mjs
   is a second query nothing explains. A copy that agrees today agrees at zero
   cost, so what is pinned is that there is only ONE. */
const STORE_SRC = readFileSync(STORE, "utf8");
t("store.mjs builds this lookup in exactly ONE place — a second copy fails here by count",
  [STORE_SRC.split("GROUP BY t.capture_sha, t.ref, t.src").length - 1,
   STORE_SRC.split("JOIN reading_refs rr ON").length - 1], [1, 1]);
t("and the read does not spell its own grouping: the ONE builder is what both callers use",
  STORE_SRC.split("EXPLAIN QUERY PLAN").length - 1 >= 1
  && /readingNamePlan\(terms[\s\S]{0,600}Store\.#refTermsSql/.test(STORE_SRC), true);

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
/* REC-40: THE IDENTIFIER TIER MUST COME BACK TOO, and the old staleness test
   would not have brought it. It read `label IS NOT NULL AND label <> ''`,
   because the label was the only source; a reference with no label at all is
   exactly the row the A and B tiers are about, and skipping it would leave the
   identifier tier invisible on every store migrated forward — the same silently
   wrong empty answer this whole arm exists to catch, one tier over. */
const e3 = await dcall("/entitycreate", { kind: "contract", label: "Some Other Name Entirely",
                                          aliases: ["legislation:26-0912"] });
const E3 = (e3.result || e3).entity_id;
t("a subject registered under the source's own reference reaches NOTHING while the index is cleared",
  (await dcall(`/readingname?entity=${E3}&viewer=class:member`)).result.count, 0);
const re = (await dcall("/reindexnames", {})).result;
t("the backfill re-derives it from what reading_refs already stores", re.indexed >= 1, true);
t("and the subject is reachable again with no document re-read",
  (await dcall(`/readingname?entity=${E2}&viewer=class:member`)).result.count, 1);
const back3 = (await dcall(`/readingname?entity=${E3}&viewer=class:member`)).result;
t("AND SO IS THE IDENTIFIER TIER — the backfill re-derives the reference, not the label alone",
  [back3.count, (back3.documents[0] || {}).correspondence, (back3.documents[0] || {}).grade_if_resolved],
  [1, "reference", "A"]);

await mf.dispose();
await dmf.dispose();
console.log(`\nreadingname: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
