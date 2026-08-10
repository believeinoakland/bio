/* NEGATIVE CONTROL: FIVE arms, ALL RE-RUN 2026-08-05 against the FINAL files, store.mjs restored byte-identically after every one (sha256 558d2e2d0575276153fb3b232fc71b02b55f7c9a027cc3e41285506f173b6879 before and after each; the restore is ASSERTED by the runner, not eyeballed). (a) DROP THE NORMALISATION - in store.mjs make Store.#labelTerms return the whole raw label as one term (const v = String(s ?? "").trim(); return v ? [v] : [];) -> 19 of 76 fail, every measured variance class going to zero, WHILE the exact-spelling arm, the refusals, the establishes-nothing arm and the whole backfill arm stay green - AND SO DOES EVERY IDENTIFIER ARM, because an A or B tier is a WHOLE-string match that survives an unsplit term. intent-write 6 of 141. (b) NEUTER THE GATE - replace this.#bundleGate("t.bundle_id", viewer) with a literal carrying query.mjs's GATE_MARK and 1=1 -> 7 of 76 fail naming the leak: dave is offered the secret capture at the NAME tier AND the project-filed reference-spelled capture at the IDENTIFIER tier, both counts rise, the forged-viewer probe answers, and the unstamped read stops failing closed. The two NEW failures are the evidence that both tiers are gated by the ONE gate. intent-write 3 of 141. (c) THE ITEM'S OWN - DROP THE REF-TERM SOURCE: in Store.#refTermSources return the label alone (if (label) return [["label", label]]; as the first line after the three consts) -> 10 of 76 fail and every one is an identifier arm, WHILE THE NAME TIER ANSWERS UNTOUCHED (all six measured variance classes, the abbreviation alias arm, the diacritic refusal and the whole-label name correspondence all green). THE GRADE A CANDIDATE VANISHES AND THE NAME TIER STILL ANSWERS - the arm that proves the two tiers are independent rather than one thing renamed. intent-write 6 of 141, two instruments on one subject. (d) DROP src FROM THE GROUP: in Store.#refTermsSql change GROUP BY t.capture_sha, t.ref, t.src to GROUP BY t.capture_sha, t.ref -> 4 of 76 fail, headed by the MIXING control - 'Fremont Estuary', present in the corpus only as one word of a title and one word of a different string of the same reference, matches 1 where it must match 0. A wrong subject on a document assembled out of two strings neither of which carries the name. intent-write 2 of 141. (e) DERIVE THE GRADE FROM THE CORRESPONDENCE instead of from the recogniser: replace const gradeIf = tier.hits.includes(entityId) ? tier.grade : null; with const gradeIf = whole ? (r.src === "ref" ? "A" : r.src === "key" ? "B" : "C") : null; -> 2 of 76 fail, and they are THIS ITEM'S OWN BUG REPRODUCED: a subject whose registered name is a document's whole label is promised a Grade C that op=resolve would never mint, because another subject's identifier already matches the same reference at A and the cascade does not fall through. intent-write stays GREEN, which is why this arm had to be written here. REC-77 ADDS FOUR ARMS, ALL RUN 2026-08-08 by test/refselectivity.control.mjs (node test/refselectivity.control.mjs, exit 0 = every arm behaved), each armed ALONE with the others held open, every restore verified by sha256 AND by cmp against a UNIQUELY-NAMED per-arm pristine copy, and the harness refuses any run whose output does not carry this suite's own FOOT line. Baseline 100 pass 0 fail. (1) NEUTER THE DISCRIMINATOR - Store.#isUninformative returns false && ... -> 95/5, headed by 'THE VACUOUS ALIAS IS NOT OFFERED': the alias 'Legislation' is offered all 41 references of the real document again, and names_uninformative empties. (2) THE ARM THIS ITEM TURNS ON, OVER-STRICTNESS - Store.#isUninformative returns corpus > 1 && reach >= 1, so every partial is withheld -> 69/31, and 'THE GOOD IDENTIFIER IS STILL OFFERED' is among them: the 1-of-41 identifier legislation 26-0844 is LOST, and so is the whole measured label-variance class (City Of Oakland, Alameda County). A fix that does this has traded a false offer for a lost one, which on a record whose product is trustworthiness is the worse trade. (3) PIN THE THRESHOLD - hard-code M-4's 67.5% (reach / corpus >= 0.675) instead of computing reach against the corpus -> 99/1, and the ONE failure is the structural pin 'THE RULE IS CORPUS-RELATIVE'. EVERY BEHAVIOURAL ARM GOES ON PASSING, because on this corpus 41/41 is over any threshold and 1/41 is under one - so behaviour cannot tell a corpus-relative rule from a lucky constant and only the rule's own text can. A copy that agrees today agrees at zero cost, measured here for the sixth time. (4) NEUTER THE SWEEP'S DETECTOR - the indexOf-into-a-constant regex is made to match nothing -> 98/2, headed by 'SWEEP GUARD', with the corpus (67 .sort( sites, 128 SQL ORDER BY clauses, 23,4xx lines) still PRINTED beside a reach of 0, so 'measured and clean' and 'looked at nothing' do not print alike. TWO FINDINGS THE CONTROLS PRODUCED AND THE AUTHOR DID NOT: arm (2) FIRST REPORTED NO TALLY AT ALL - the suite died on a TypeError indexing documents[0].selectivity of an empty list and ended the module while nothing had failed, which is precisely the failure this header records REC-36's arm (a) hitting in this same file; every index into documents and into ordRows is guarded now and the harness's FOOT check is what caught it. And the REC-30 pin 'dave is offered the shared document identically to carol' was SUPERSEDED rather than stale: selectivity is the first published field that is a property of the READER's corpus rather than of the document, so carol's denominator is legitimately larger - corrected one field narrower with the REC-30 claim intact, and a new leak arm added proving dave's reach is 1 where carol's is 2, so neither count crosses the gate. */
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
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
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
/* SUPERSEDED PIN, CORRECTED 2026-08-08 (REC-77) RATHER THAN EXEMPTED, and the
   correction is a finding rather than bookkeeping. This asserted the two rows
   were byte-identical, which was true while every published field was a property
   of the DOCUMENT. `selectivity` is not: it is the alias's reach over the corpus
   THIS READER CAN SEE, so carol — who can see one more capture than dave — takes
   a larger denominator for the same name on the same document. That is the
   correct answer and not a defect, because a corpus-relative figure computed
   over somebody else's corpus would be a number about documents this member is
   not allowed to know exist. The REC-30 claim the old pin was making is
   preserved EXACTLY, one field narrower, and the new arm below states the
   difference and proves it is not a leak. */
const dRow = dCity.documents[0] || null;
const SEL = (r) => (r && r.selectivity) || {};   /* D-93 inside a control: an index into an EMPTY list must FAIL an assertion, never THROW and end the module while the tally reads clean. REC-36's arm (a) hit this here once; REC-77's arm (b) hit it again. */
const cRow = (cCity.documents || []).find((d) => d.capture_sha === D_CASE.capture) || null;
const withoutSel = (r) => { if (!r) return null; const { selectivity, detail, ...rest } = r; return rest; };
t("dave is offered the shared document identically to carol in every field that is about the DOCUMENT",
  JSON.stringify(withoutSel(dRow)), JSON.stringify(withoutSel(cRow)));
console.log(`  [corpus] dave ${JSON.stringify(SEL(dRow))} · carol ${JSON.stringify(SEL(cRow))}`);
t("and the one field that differs is the corpus-relative one: BOTH its numerator and its denominator are this viewer's own",
  [SEL(dRow).source, SEL(cRow).source,
   SEL(dRow).reaches < SEL(cRow).reaches,
   SEL(dRow).corpus < SEL(cRow).corpus],
  ["label", "label", true, true]);
/* THE LEAK ARM, AND IT IS THE ONE THIS FIELD HAD TO EARN. REC-57's finding was
   that a COUNT of what the gate withheld IS the leak. `selectivity` publishes two
   counts, so it had to be established that neither one crosses the gate: dave's
   numerator is 1 where carol's is 2, because the secret capture's reading ALSO
   carries this name — and dave's number does not know it. A reach or a corpus
   taken over the whole store would have published, as an integer, the size of a
   corpus the gate exists to hide. */
t("neither count crosses the gate: dave's reach EXCLUDES the capture he cannot see, so the figure discloses no withheld row",
  [SEL(dRow).reaches, SEL(cRow).reaches,
   SEL(cRow).reaches - SEL(dRow).reaches], [1, 2, 1]);
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

/* ================================================================== REC-77 ==
 * SELECTIVITY, COMPUTED OVER THE CORPUS IN FRONT OF THE READER.
 *
 * M-4 measured that `Store.#CORRESPONDENCE_RANK` offers the LEAST selective
 * evidence FIRST: a term of a reference reaches 67.5% of the reference corpus
 * against 8.3% of labels, 8.1x less selective, and `name_in_reference` is ranked
 * ABOVE `name_in_label`. M-4 also refused to ship the rank swap, because the
 * class is BIMODAL and one rank cannot represent it — `"legislation 26-0844"`
 * (the source's own identifier respelled around a punctuation mark `#normAlias`
 * does not fold) reaches 1 of 41, `"legislation"` reaches 41 of 41, and BOTH are
 * `name_in_reference`.
 *
 * BLOCK A drives that exact pair over ONE corpus — and the corpus is the REAL
 * document, read through the plane's own Tier-1 extraction and the real
 * `meeting_agenda` reader, so these are the strings `#writeReadings` persists
 * and not a fixture written to agree. It is the same population M-4 measured,
 * re-derived here rather than transcribed.
 *
 * NOTHING BELOW PINS A PERCENTAGE. Every expected figure is computed from the
 * promoted corpus in this file, so a corpus with different numbers moves the
 * assertions with it. A threshold taken from M-4's document would be the
 * hand-carried figure this project has been bitten by most.
 */
console.log("\n=== REC-77 · the bimodal pair, over the REAL 41-reference corpus ===");
const { extractPdfStructure } = await import("../src/pdfstructure.mjs");
const { readText } = await import("../../docprofile/registry.mjs");
const FIXTURE = fileURLToPath(new URL("./fixtures/legistar-agenda-1425405.pdf", import.meta.url));
const stx = await extractPdfStructure(new Uint8Array(readFileSync(FIXTURE)));
const rdx = readText(stx.text, { at: "2026-08-04" });
if (!rdx.determined || !rdx.parsed) throw new Error("REC-77: the fixture did not read; every arm below would be over an empty corpus");
const ENTS = rdx.parsed.entities.map((e) => ({ kind: e.kind, key: e.key, label: e.label }));

/* THE CORPUS IS PRINTED AND ITS SIZE IS GUARDED, because this project has
   already shipped a headline assertion that PASSED OVER AN EMPTY CORPUS: a
   restore check whose manifest came out empty compared two empty files and
   reported them byte-identical. A block that measures selectivity over one
   reference would "pass" every arm below and mean nothing. */
console.log(`  [corpus] ${ENTS.length} reading references from 1 real captured document · reader ${rdx.doctype.type.key} @ ${rdx.doctype.confidence}`);
t("REC-77 GUARD: the corpus is large enough for selectivity to be a question at all",
  ENTS.length >= 10, true);
t("REC-77 GUARD: and it is the population M-4 measured, re-derived rather than transcribed",
  [ENTS.length, [...new Set(ENTS.map((e) => e.kind))]], [41, ["legislation"]]);

const bmf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: STORE, script: readFileSync(STORE, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
});
const bcall = async (p, body) => (await (await bmf.dispatchFetch("http://x" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json());
{
  const id = "INFO-2026-0777-rec77";
  const md = bundleMd(id, "information");
  const capture = sha("rec77-legistar-1425405");
  const prov = JSON.stringify({ documents: [{
    capture: { sha256: capture, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_agenda", reader_version: 1, found: true, at: NOW, entities: ENTS } }] });
  const r = await bcall("/promote", {
    bundleId: id, base: null, snapKey: `${id}-new`, author: "rec77",
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }],
    register: [{ sha256: capture, path: "captures/doc.pdf", encoding: "binary", bytes: 10 }],
    meta: { object_type: "information", group: "believe-in-oakland", title: id,
            current_state: "collected", created: NOW, last_updated: NOW } });
  if ((r.result || r)?.ok === false) throw new Error(`REC-77 promote: ${JSON.stringify(r)}`);
}
const bEntity = async (label, aliases) => {
  const e = await bcall("/entitycreate", { kind: "contract", label, aliases });
  return (e.result || e).entity_id;
};
const bLook = async (id) => (await bcall(`/readingname?entity=${id}&viewer=class:member`)).result;

/* THE VACUOUS HALF. A member who registers `Legislation` as an alias of the
   committee: it is one word of the closed kind vocabulary every reference in
   this document is composed from. */
const E_VACUOUS = await bEntity("Rules and Legislation Committee", ["Legislation"]);
const vac = await bLook(E_VACUOUS);
/* THE GOOD HALF. The source's own file number, respelled with a space where the
   composed reference carries a colon — `#normAlias` does not fold punctuation,
   so this can only ever reach the PARTIAL tier, and it is the single best
   correspondence in the corpus in substance. */
const E_GOOD = await bEntity("Oakland file 26-0844", ["legislation 26-0844"]);
const good = await bLook(E_GOOD);

console.log(`  [vacuous] ${JSON.stringify(vac.names_uninformative)} · count ${vac.count}`);
const G = () => good.documents[0] || {};
console.log(`  [good]    ${JSON.stringify(G().selectivity)} · count ${good.count}`);

/* (2) THE ARM THIS ITEM TURNS ON, AND IT IS FIRST BECAUSE IT IS THE ONE THAT
   MATTERS MOST. A fix that suppresses the 1-of-41 identifier has traded a false
   offer for a LOST one, and on a record whose product is trustworthiness that is
   the worse trade: a member who is never shown a real correspondence cannot know
   they were not shown it. */
t("THE GOOD IDENTIFIER IS STILL OFFERED — 1 of the corpus, at the partial-reference tier, exactly as before",
  [good.count, G().correspondence, G().matched_on, G().ref],
  [1, "name_in_reference", "ref", "legislation:26-0844"]);
t("and it carries NO grade, which REC-40's third tier settled and M-4 strengthened — this item does not disturb it",
  G().grade_if_resolved, null);
t("its selectivity is COMPUTED, not pinned: reach 1 against the corpus this reader can see",
  [SEL(G()).reaches, SEL(G()).corpus],
  [1, ENTS.length]);
t("and the published value is the arithmetic of those two numbers and nothing else",
  SEL(G()).value, Number((1 - 1 / ENTS.length).toFixed(4)));

/* (1) THE VACUOUS HALF IS NOT OFFERED — and is SAID, never silently dropped. */
t("THE VACUOUS ALIAS IS NOT OFFERED: every reference in the corpus, offered as a correspondence, is now none of them",
  vac.count, 0);
t("and it is STATED rather than silently dropped — the member is told the name reached everything, not nothing",
  (vac.names_uninformative || []).map((u) => [u.alias, u.source]), [["Legislation", "ref"]]);
t("the statement carries the arithmetic that decided it, so the rule is checkable FROM THE ANSWER",
  [(vac.names_uninformative[0] || {}).reaches, (vac.names_uninformative[0] || {}).corpus],
  [ENTS.length, ENTS.length]);
t("the two names are the SAME correspondence and the SAME source — a rank swap could not have separated them",
  [G().correspondence, G().matched_on,
   (vac.names_uninformative[0] || {}).source], ["name_in_reference", "ref", "ref"]);
/* THE DISCRIMINATOR IS CORPUS-RELATIVE, ASSERTED AS SUCH. The rule that fired is
   `reach === corpus`, both read off the answer, and NOT a percentage. */
t("the discriminator is reach-against-corpus and not a threshold: the withheld name reached ALL of it, the offered one reached one",
  [(vac.names_uninformative[0] || {}).reaches === (vac.names_uninformative[0] || {}).corpus,
   SEL(G()).reaches < SEL(G()).corpus], [true, true]);
/* AND THE 8.1x FIGURE IS NOT IN THE CODE. Nothing the plane ships names 67.5,
   8.3, 8.1 or 41 — a pin on M-4's document would be exactly the hand-carried
   number this project has been bitten by four times on one line count. */
const STORE_TEXT = readFileSync(STORE, "utf8");
t("NOTHING IN store.mjs PINS M-4's PERCENTAGES — the discriminator is arithmetic over the corpus in front of it",
  /67\.5|8\.3%|8\.1x|SELECTIVITY_(FLOOR|THRESHOLD|MIN)/.test(STORE_TEXT), false);
/* THE STRUCTURAL PIN ON THE RULE ITSELF, and it is the arm the "pin it to a
   literal" control fires. A threshold taken from M-4's document would go on
   passing every behavioural arm above ON THIS CORPUS — 41/41 is over any
   threshold and 1/41 is under one — so the behaviour cannot tell a corpus-
   relative rule from a lucky constant, and only the rule's own TEXT can. That
   is the same reason REC-43's fence needed a structural pin: an identical copy
   agrees at zero cost. */
const RULE = (STORE_TEXT.match(/static #isUninformative\(reach, corpus\) \{ return ([^;]+); \}/) || [])[1];
t("THE RULE IS CORPUS-RELATIVE, PINNED ON ITS OWN TEXT: its whole body names the corpus and carries no threshold literal",
  [RULE, /[0-9]*\.[0-9]+|\b[2-9][0-9]*\b/.test(RULE || "x")],
  ["corpus > 1 && reach >= corpus", false]);

/* ---------------------------------------------------------------- BLOCK B
 * THE ORDERING INVERSION — the defect the item is named for, driven directly.
 * `#CORRESPONDENCE_RANK` puts `name_in_reference` above `name_in_label`, so
 * before this item a reference partial reaching THREE documents was offered
 * ahead of a label partial reaching ONE. Both are ungraded partial tiers; what
 * separates them is selectivity, and it is measured here rather than assumed.
 * This runs over the synthetic corpus because the real one cannot produce a
 * middling reference partial: its 41 keys are distinct, so at `src=ref` an alias
 * reaches either 1 or all 41 and nothing in between. Saying so is part of the
 * measurement — see the report's "what the matcher cannot see". */
console.log("\n=== REC-77 · the ordering: the MORE SELECTIVE partial is offered first, whichever tier it came from ===");
await doc("information", "mem-r36", "rules-a", "Zephyr Point Lease Renewal", "committee:rules-a");
await doc("information", "mem-r36", "rules-b", "Quarterly Budget Transfer", "committee:rules-b");
await doc("information", "mem-r36", "rules-c", "Annual Audit Acceptance", "committee:rules-c");
const E_ORDER = (await post("entitycreate", { kind: "contract", label: "Zephyr Point",
  aliases: ["Zephyr Point", "committee rules"] })).entity_id;
const ord = await cands(E_ORDER);
const ordRows = (ord.documents || []).map((d) => [d.correspondence, d.matched_alias,
  d.selectivity && d.selectivity.reaches, d.selectivity && d.selectivity.corpus]);
const OR = (i) => ordRows[i] || [null, null, null, null];   /* same guard: an empty list must fail arms, not end the file */
console.log(`  [order] ${JSON.stringify(ordRows)}`);
/* THE COUNT IS 3 AND NOT 4, AND THE SUITE FOUND THAT BEFORE THE AUTHOR DID.
   Three documents carry the reference partial and ONE of them also carries the
   label partial; a candidate is per (capture, reference), so that document is
   ONE row carrying the strongest correspondence its subject's names made with
   it. Under the fixed rank "strongest" meant `name_in_reference` by position;
   it now means the MORE SELECTIVE of the two, measured — which is the same
   comparison the final sort uses, deliberately, because two orderings for one
   question is how a list comes back sorted differently from the way it was
   deduplicated. */
t("BOTH partial tiers answer for one subject, so there is an ordering to get wrong",
  [ordRows.length, [...new Set(ordRows.map((r) => r[0]))].sort()],
  [3, ["name_in_label", "name_in_reference"]]);
t("and where ONE reference is reached by both names, the surviving row is the MORE SELECTIVE one — the merge and the sort agree",
  [OR(0)[1], OR(0)[2], OR(0)[3]], ["Zephyr Point", 1, 13]);
t("THE MORE SELECTIVE ONE IS OFFERED FIRST, and it is the LABEL partial — the ordering the fixed rank could never produce",
  [OR(0)[0], OR(0)[1]], ["name_in_label", "Zephyr Point"]);
t("and it is first BECAUSE it reaches fewer of the corpus, measured — not because its tier was promoted",
  OR(0)[2] < OR(1)[2], true);
t("the less selective reference partials FOLLOW it and are still OFFERED — nothing was suppressed for being merely broad",
  [ordRows.slice(1).map((r) => r[0]), ordRows.length > 1 && ordRows.slice(1).every((r) => r[2] > OR(0)[2])],
  [["name_in_reference", "name_in_reference"], true]);
/* THE WHOLE TIERS ARE UNTOUCHED, which is the over-strictness guard made
   structural: no corpus statistic can demote or withhold a string `#recognise`
   would grade. */
const wholeStill = await cands(E_LEASE);
t("a WHOLE correspondence still outranks every partial and is never gated on reach",
  [(wholeStill.documents[0] || {}).correspondence, (wholeStill.documents[0] || {}).selectivity],
  ["reference", null]);

/* ---------------------------------------------------------------- THE SWEEP
 * WHERE ELSE DOES THIS PLANE ORDER WHAT A MEMBER IS OFFERED BY A FIXED POSITION
 * RATHER THAN BY A MEASUREMENT? The item's shape is not "this rank is wrong"; it
 * is "an ordering that asserts one piece of evidence is better than another must
 * be able to say WHY", and that question is larger than one constant.
 *
 * THE CORPUS AND THE REACH ARE PRINTED, because a walk that reports a clean
 * verdict without saying what it looked at has reported nothing — three walks in
 * this repository did exactly that in one week.
 *
 * WHAT THIS MATCHER CAN SEE: `store.mjs`'s source text, and within it every site
 * that ranks by POSITION IN A NAMED CONSTANT (`SOME_CONSTANT.indexOf(x)`), which
 * is the shape of an order fixed in advance. WHAT IT CANNOT SEE, said plainly
 * rather than left to be assumed: an ordering expressed as a SQL `ORDER BY`
 * (there are 128 in this file and it reads none of them), an ordering expressed
 * as a hand-written comparator with no constant to index into, an ordering a
 * SURFACE applies after the plane answers, and any ordering in another module.
 * It is a shape detector over one file, not a census of every order in BIO. */
console.log("\n=== REC-77 · THE SWEEP: orderings fixed in advance, over bio-plane/src/store.mjs ===");
const RANKED = [...STORE_TEXT.matchAll(/(?:^|[^\w.])((?:Store\.)?#?[A-Z][A-Z_]{2,})\.indexOf\(/gm)]
  .map((m) => m[1]);
const ORDER_BY = (STORE_TEXT.match(/ORDER BY/g) || []).length;
const SORTS = (STORE_TEXT.match(/\.sort\(/g) || []).length;
console.log(`  [corpus] store.mjs · ${STORE_TEXT.split("\n").length} lines · ${SORTS} .sort( sites · ${ORDER_BY} SQL ORDER BY clauses`);
console.log(`  [reach]  ${RANKED.length} site(s) rank by position in a named constant: ${JSON.stringify(RANKED)}`);
t("SWEEP GUARD: the detector found something, so a clean verdict below is a reading and not an empty corpus",
  [RANKED.length > 0, SORTS > 0, ORDER_BY > 0], [true, true, true]);
/* PINNED BY NAME, so a FOURTH fixed-position ordering fails here and has to be
   argued rather than added. The three that exist are each answerable:
     BASIS_GRADES        — framework §8.1's grade order. A RULING, and it orders
                           GRADES the record already minted, not candidates. It
                           is also a MIN over a vocabulary, not a presentation.
     Store.QUEUE_CLASSES — the member's queue: an obligation a named person must
                           do outranks something the record merely noticed. Also
                           a RULING, and it orders WORK rather than evidence: it
                           makes no claim about how well anything corresponds to
                           anything, and there is nothing to confirm.
     #CORRESPONDENCE_RANK — THIS ITEM'S. It orders CANDIDATE EVIDENCE, it does
                           assert one correspondence is better than another, and
                           it is the only one of the three that had no ground for
                           the claim. It keeps its fixed positions for the WHOLE
                           tiers, which `#recognise` grades, and defers to a
                           measurement inside the partial band. */
t("the fixed-position orderings in store.mjs are exactly the three that can each answer for themselves",
  [...new Set(RANKED)].sort(), ["BASIS_GRADES", "Store.#CORRESPONDENCE_RANK", "Store.QUEUE_CLASSES"]);
/* AND THE SWEEP MUST NOT PASS BY CITING ITSELF. The arm above would go on
   passing if this item were reverted, because the constant would still be there
   with the same name. What makes it a finding is that the ONE ordering of
   candidate evidence now consults a measured quantity: revert `#candOrderCmp` to
   position alone and this fails, naming the field it stopped reading. */
t("and the one that orders EVIDENCE no longer decides on position alone — its comparator reads the measured selectivity",
  /#candOrderCmp\(x, y\)[\s\S]{0,700}?selectivity/.test(STORE_TEXT)
  && /#PARTIAL_BAND[\s\S]{0,400}?selectivity\.value/.test(STORE_TEXT), true);

await bmf.dispose();
await mf.dispose();
await dmf.dispose();
console.log(`\nreadingname: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
