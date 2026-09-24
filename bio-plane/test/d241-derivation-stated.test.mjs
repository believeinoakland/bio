/* NEGATIVE CONTROL: (declared before running, 2026-09-23, D-241) — driven by `node test/d241-derivation-stated.control.mjs
   [arm|all]` from `bio-plane/`. Each arm edits the REAL `src/store.mjs` ALONE at an anchor asserted to occur EXACTLY
   ONCE, runs this suite, and restores by `cp` from a uniquely named per-arm pristine copy, verified by sha256 AND
   byte compare with the byte count printed and floored; a baseline at both ends.
   (a) `noread` — THE ROW'S CONTROL: the observation read removed (the latest-row SELECT answers nothing). DECLARED MUST
       FAIL A2 (the CUT arm, BY NAME), A3, A4, A5, A6, A7; MUST NOT FAIL F1, F2, A1, A8, A9, P1, P2.
   (b) `readbit` — THE FIRST LIAR: the derivation's `cut` taken from the READ's own `truncated`. DECLARED MUST FAIL
       A2, A3, A5, A7; MUST NOT FAIL A1, A8. (A7 was added to the declaration BEFORE the first run, on re-reading
       the arm: A7 reads a cut derivation through an uncut page, the same shape as A2.)
   (c) `complete` — THE SECOND LIAR: no observation read as a complete, uncut derivation. DECLARED MUST FAIL A1, A8;
       MUST NOT FAIL A2, A3.
   (d) `overstrict` — the same read respelt (the latest row by `MAX(seq)` in a subquery). DECLARED nothing fails.
   ACTUALS, RUN 2026-09-23 (`all`, on the tree committed with this suite): baseline 13/0; noread 7/6 [A2 A3 A4 A5 A6
   A7]; readbit 9/4 [A2 A3 A5 A7]; complete 11/2 [A1 A8]; overstrict 13/0; baseline 13/0. SIX OF SIX AS DECLARED;
   `store.mjs` restored by `cp` after each and verified IDENTICAL (2,904,480 B, sha256 4c0b2f0ec7adf0fa…).
   WHAT THIS SUITE CANNOT SEE: the `pre_log` answer (connection rows older than the log) is driven only through the
   pure `derivationStatement` (P2) — the noread arm reaches it live, but no fixture here can write a pre-log row. */

/* D-241 — `op=connections` SAYS WHETHER THE DERIVATION BEHIND ITS ROWS WAS CUT.
 * =====================================================================
 *
 * `CONTENT-SEARCH-DESIGN.md` §4.3 (the cap, and truncation stated). REC-95 records each derivation's extent: the
 * meaning-level observation `#observeConnectionDerivation` writes reads `partial` when the pair bound cut it. The READ
 * never consulted it: `connectionsFor`'s `truncated` is whether ITS PAGE was cut at `limit`, so a subject derived
 * over 32 of its 40 documents read back `truncated: false` over 496 connections — part of the set presented as the
 * set. The entity arm now publishes `derivation {state, cut, at, documents, derived, says}` from the LATEST such row,
 * and a subject with no row is never published bare: §5.1's cause decides between NEVER DERIVED, PRE-LOG and
 * UNDETERMINED.
 *
 * HOW A LIAR PASSES, and why each arm exists: (1) reporting the read's own `truncated` as the derivation's state —
 * A2 reads a CUT derivation through an UNCUT page and A3 a WHOLE derivation through a CUT page, so the two bits are
 * driven in opposite directions; (2) reporting "complete" when no observation exists — A1 (never derived) and A8
 * (undetermined) have no row. A2, A3 and A1 must give three distinct answers (A4).
 *
 * Every figure below is a literal: 40 documents cut at the default pair bound of 500 admits 32 (32*31/2 = 496).
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { derivationObservation, derivationDocumentsFrom, derivationStatement } from "../src/airun.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const TOK = "mem-d241";
const NOW = "2026-09-23T09:00:00Z";

let pass = 0, fail = 0, reachedFoot = false;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d241", MEMBER_TOKEN: TOK, PROBE_TOKEN: "prb-d241",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});

try {
  const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
  const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
    { method: "POST", body: JSON.stringify(body ?? {}) })).json());

  const bundleMd = (id) => [
    "---", `id: ${id}`, "object_type: information", "schema: information@1",
    `title: "${id}"`, "current_state: collected", "prior_state: null",
    `created: ${NOW}`, `last_updated: ${NOW}`, "produced_by:", "  mode: assisted",
    "  capability_tier: session", "group: believe-in-oakland", "references: []",
    "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false",
    "  since: null", "  source: null", "visuals: []", "criticality: supporting",
    "source_status: unchanged", "source:", "  locator: in hand",
    "  authority: synthetic", `  retrieved: ${NOW}`, "monitoring:", "  enabled: false",
    "  frequency: none", "---", "", "## Summary", "", "An agenda item.", "",
    "## Provenance Notes", "", "## Session Log", "", "## Review Notes", "",
  ].join("\n");
  /* derivation-bounds.test.mjs's fixture shape (REC-66): one document per capture, each reading naming ONE subject. */
  const promote = async (i, label) => {
    const id = `INFO-2026-${String(i).padStart(4, "0")}-d241`;
    const md = bundleMd(id);
    const capture = sha(`d241-${i}`);
    const prov = JSON.stringify({ documents: [{
      capture: { sha256: capture, encoding: "binary", bytes: 10 },
      reading: { content_type: "meeting_agenda", reader_version: 1, found: true, at: NOW,
                 entities: [{ ref: `legislation:41-${String(i).padStart(4, "0")}`, kind: "legislation",
                              key: String(i), label }] } }] });
    const files = [
      { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
      { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
    ];
    const r = await POST(`op=promote&token=${TOK}`, {
      bundleId: id, base: null, snapKey: `${id}-new`, author: "d241", files,
      register: [{ sha256: capture, path: "captures/doc.pdf", encoding: "binary", bytes: 10 }],
      meta: { object_type: "information", group: "believe-in-oakland", title: id,
              current_state: "collected", created: NOW, last_updated: NOW } });
    if (r?.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 300)}`);
    return capture;
  };

  /* FORTY on the subject that is CUT, THREE on the one derived WHOLE, ONE on the one that forms no pair. */
  const BIG_LABEL = "Harbor Dredging Allocation", SMALL_LABEL = "A Three Document Subject",
        LONE_LABEL = "A Single Document Subject";
  const caps = [];
  let i = 0;
  for (let k = 0; k < 40; k++) caps.push(await promote(++i, BIG_LABEL));
  for (let k = 0; k < 3; k++) caps.push(await promote(++i, SMALL_LABEL));
  caps.push(await promote(++i, LONE_LABEL));
  const mk = async (label) => (await POST(`op=entitycreate&token=${TOK}`, { kind: "contract", label })).entity_id;
  const BIG = await mk(BIG_LABEL), SMALL = await mk(SMALL_LABEL), LONE = await mk(LONE_LABEL);
  if (!BIG || !SMALL || !LONE) throw new Error("entitycreate failed");
  for (const c of caps) {
    const r = await POST(`op=resolve&token=${TOK}`, { captureSha: c, resolvedBy: "d241" });
    if (r?.ok === false) throw new Error(`resolve ${c}: ${JSON.stringify(r).slice(0, 300)}`);
  }
  /* Created AFTER the log carried meaning-level rows (every promote above wrote a reader-run row), and never derived. */
  const NEVER = await mk("A Subject Nobody Derived Over");

  console.log("\n--- the fixture, proved ARMED before anything is asserted ---");
  const bigConcerns = await GET(`op=concerns&token=${TOK}&id=${BIG}&limit=5000`);
  t("F1: FIXTURE ARMED — forty documents concern the big subject and three the small one, measured through "
  + "op=concerns rather than assumed",
    [bigConcerns.count, bigConcerns.truncated,
     (await GET(`op=concerns&token=${TOK}&id=${SMALL}&limit=5000`)).count], [40, false, 3]);
  const cut = await POST(`op=connect&token=${TOK}`, { entityId: BIG, assertedBy: "d241" });
  const whole = await POST(`op=connect&token=${TOK}`, { entityId: SMALL, assertedBy: "d241" });
  const none = await POST(`op=connect&token=${TOK}`, { entityId: LONE, assertedBy: "d241" });
  t("F2: THE DERIVATIONS ARE WHAT THE ARMS NEED — the big one CUT at 32 of 40 (496 pairs), the small one WHOLE "
  + "(3 pairs), the lone one ran and formed NONE",
    [[cut.truncated, cut.documents, cut.count], [whole.truncated, whole.documents, whole.count],
     [none.truncated, none.documents, none.count]],
    [[true, 32, 496], [false, 3, 3], [false, 1, 0]]);

  console.log("\n--- the entity arm states the derivation, independently of its own page ---");
  const d = (r) => r && r.derivation ? [r.derivation.derived, r.derivation.state, r.derivation.cut,
                                        r.derivation.documents] : ["ABSENT"];
  const neverRead = await GET(`op=connections&token=${TOK}&id=${NEVER}`);
  t("A1: NEVER DERIVED IS STATED IN WORDS — the key is present, nothing claims a state, and `says` begins "
  + "`never derived`, so an empty answer is not read as a complete one",
    [...d(neverRead), neverRead.count, /^never derived/.test(neverRead.derivation?.says || "")],
    ["never_derived", null, null, null, 0, true]);
  const cutRead = await GET(`op=connections&token=${TOK}&id=${BIG}&limit=5000`);
  t("A2: THE CUT ARM — op=connect over 40 documents, then op=connections at the ceiling: the PAGE is whole "
  + "(496 of 496, truncated false) and the DERIVATION says it was CUT after 32 documents",
    [cutRead.count, cutRead.truncated, ...d(cutRead), typeof cutRead.derivation?.at === "string",
     /CUT/.test(cutRead.derivation?.says || "")],
    [496, false, "derived", "partial", true, 32, true, true]);
  const wholeRead = await GET(`op=connections&token=${TOK}&id=${SMALL}&limit=1`);
  t("A3: THE WHOLE ARM read through a CUT PAGE — limit 1 over 3 pairs is `truncated: true`, and the derivation "
  + "still says it was NOT cut, over 3 documents",
    [wholeRead.count, wholeRead.truncated, ...d(wholeRead)],
    [1, true, "derived", "PRESENT", false, 3]);
  t("A4: THREE DISTINCT ANSWERS — never derived, cut, and whole do not read alike",
    new Set([JSON.stringify(d(neverRead)), JSON.stringify(d(cutRead)), JSON.stringify(d(wholeRead))]).size, 3);
  const noneRead = await GET(`op=connections&token=${TOK}&id=${LONE}`);
  t("A5: A DERIVATION THAT RAN AND FORMED NOTHING is not one that never ran — `LOOKED_ABSENT` over 1 document, "
  + "not cut, beside an empty page",
    [noneRead.count, ...d(noneRead)], [0, "derived", "LOOKED_ABSENT", false, 1]);

  console.log("\n--- the LATEST derivation answers ---");
  await POST(`op=connect&token=${TOK}`, { entityId: BIG, assertedBy: "d241", limit: 5000 });
  const reWhole = await GET(`op=connections&token=${TOK}&id=${BIG}&limit=5000`);
  t("A6: RE-DERIVED WHOLE at the ceiling, the same subject now reads NOT cut over all 40 documents (780 pairs)",
    [reWhole.count, ...d(reWhole)], [780, "derived", "PRESENT", false, 40]);
  await POST(`op=connect&token=${TOK}`, { entityId: BIG, assertedBy: "d241", limit: 3 });
  const reCut = await GET(`op=connections&token=${TOK}&id=${BIG}&limit=5000`);
  t("A7: AND CUT AGAIN at limit 3, it reads CUT after 3 documents — the latest row, never the first or the "
  + "strongest — while the 780 rows the earlier whole derivation wrote are still served",
    [reCut.count, ...d(reCut)], [780, "derived", "partial", true, 3]);

  console.log("\n--- no row is never read as complete ---");
  const ghost = await GET(`op=connections&token=${TOK}&id=ENT-d241-not-registered`);
  t("A8: AN ID THE REGISTRY DOES NOT HOLD, with no row, is UNDETERMINED rather than never derived — its entry "
  + "into the record cannot be dated against the log",
    [...d(ghost), /^undetermined/.test(ghost.derivation?.says || "")], ["undetermined", null, null, null, true]);
  const byCapture = await GET(`op=connections&token=${TOK}&sha256=${caps[0]}`);
  t("A9: THE CAPTURE ARM SPANS MANY SUBJECTS and publishes no derivation (read it per entity) — pinned so a "
  + "change there is a decision rather than drift",
    [byCapture.ok, "derivation" in byCapture], [true, false]);

  console.log("\n--- the pure halves, beside the writer ---");
  const rows = [
    derivationObservation({ entityId: "ENT-x", count: 496, documents: 32, truncated: true }).row,
    derivationObservation({ entityId: "ENT-x", count: 3, documents: 3 }).row,
    derivationObservation({ entityId: "ENT-x", count: 0, documents: 1, entityKnown: false }).row,
  ];
  t("P1: `documents` IS READ BACK out of every spelling the writer produces, and an unrecorded count reads null",
    [...rows.map((r) => derivationDocumentsFrom(r.detail)),
     derivationDocumentsFrom(derivationObservation({ entityId: "ENT-x", count: 0 }).row.detail),
     derivationDocumentsFrom(null)],
    [32, 3, 1, null, null]);
  t("P2: `derivationStatement` over no row takes the WEAKEST cause when the cause is unknown, never the positive one",
    [derivationStatement(null).derived, derivationStatement(null, "pre_log").derived,
     derivationStatement(null, "never_looked").derived], ["undetermined", "pre_log", "never_derived"]);

  reachedFoot = true;
} catch (e) {
  fail++;
  console.log(`  THREW: ${e && e.stack ? e.stack : e}`);
} finally {
  await mf.dispose();
  console.log(`\nd241-derivation-stated: ${reachedFoot ? pass : -1} pass, ${fail} fail`);
}
process.exit(fail || !reachedFoot ? 1 : 0);
