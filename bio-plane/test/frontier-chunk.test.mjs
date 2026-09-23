/* NEGATIVE CONTROL: (declared and RUN 2026-09-23, D-390, session WORKER D-390) FOUR arms, each ALONE, each
   anchor matched exactly once, each restore verified by sha256 AND cmp against a per-arm pristine copy
   (2,884,632 bytes; subject sha256 432948a0…); baseline 6/0 at both ends.
   (a) `unchunked` — the row's own: restore the single unchunked `IN` in `#frontierContent`. Declared MUST FAIL
       D390-2/3/4, MUST NOT FAIL D390-1/5. ACTUAL: D390-0, D390-2, D390-3, D390-4 FAILED (2/4) — the
       declaration missed D390-0, which reads -1 when the op refuses; that is D390-0 working, not a miss.
   (b) `firstchunk` — merge only the first chunk. Declared MUST FAIL D390-3/4 only. ACTUAL: exactly those (4/2).
   (c) `registry` — `publishedRegistryFor` back to one variable per id in its `IN`. Declared MUST FAIL D390-5 only. ACTUAL: exactly (5/1).
   (d) `overstrict` — chunk size 1, a correct spelling nobody would choose. Declared GREEN. ACTUAL: 6/0.
   NEGATIVE CONTROL (D-443, declared and RUN 2026-09-23, session WORKER D-443): `node test/frontier-chunk.control.mjs`,
   TEN arms, each ALONE, each anchor matched exactly once, each restore verified by sha256 AND byte comparison
   against a per-arm pristine copy (src/store.mjs 2,903,801 bytes, sha256 af5a38a3…). Each arm restores ONE
   spread `IN (${marks})`. ACTUAL, all AS DECLARED (10/10): baseline 14/0 · `standings` fails D443-1 (+0,2,3,4,5,
   the same promotes) · `earned` D443-2 (+0,3,4,5) · `attest` D443-3 (+0,2,5; D443-4 holds, Q_T is one capture)
   · `txrows` D443-4 (+0,2,3,5) · `txatts` D443-4 ALONE · `union` D443-5 (+0,2,3) · `supmax` D443-6 ALONE ·
   `casereg` D443-7 ALONE · `overstrict` (an aliased json_each spelling on the structural pin) 14/0. */
/*
 * D-390 — `#frontierContent`'s index-state read, CHUNKED.
 *
 * `op=frontier&level=content` read every published row's latest `derive` observation in ONE statement
 * whose `IN` list carried one bound variable per subject. D-36 measured workerd refusing a statement
 * binding more than about 100 variables, and the page's default `cap` is 200 — so the read failed
 * outright on the first instance past ~100 content captures. The subject list is now cut at
 * `Store.SELECTION_ID_CHUNK` (64, D-36's own headroom figure) and each chunk's rows merged into the ONE
 * `indexState` map.
 *
 * HOW A LIAR PASSES THIS (the row names it): a fixture under 100 subjects, which never meets the
 * ceiling. So D390-0 asserts the fixture's size ABOVE it, from the frontier's own answer rather than
 * from the count this file intended to write.
 *
 * "EQUAL TO THE SAME ROWS READ ONE CHUNK AT A TIME" is taken at its narrowest honest form: the
 * per-capture read `op=contentaxis`, which reads each capture's `derive` row alone (a chunk of one),
 * against the frontier's merged answer for the same capture.
 *
 * THE SWEEP (the row's scope: every `IN` list built from a `limit`-bounded page, `#frontierMeaning` first).
 * Corpus: every `IN (${` in `bio-plane/src/*.mjs` — 19 sites in `store.mjs`, 2 in `query.mjs`, 0 elsewhere,
 * plus a read of `#frontierMeaning` and `#frontierPage`. What the matcher CANNOT see: a list spelled any other
 * way (string concatenation, a helper building the marks) — none was found by a second grep for `IN (" +`.
 *   store `#frontierMeaning` ............ NO `IN` list: per-row reads through `#frontierVerification` and
 *                                          `#missingMeaningCause`, and NOT EXISTS subqueries. Nothing to chunk.
 *   store `#frontierPage` / `#frontierFetch` .. NO `IN` list (a LIMIT ? scan). Nothing to chunk.
 *   store `#frontierContent` index state . CHUNKED here (the row's subject), at SELECTION_ID_CHUNK.
 *   store `publishedRegistryFor` ......... ONE json_each(?) variable here: `publishedTargets` cuts at 200 (D390-5).
 *   store `#searchedForCase` (4 sites) ... already chunked at 50 (D-225/REC-70).
 *   store proposed-readings scope (2) .... bounded at `LIMIT 64` and says so; under the ceiling.
 *   store `#refTermsSql` ................. capped at 24 terms by `#labelTerms`; under the ceiling.
 *   query `idArm` ........................ its caller chunks at SELECTION_ID_CHUNK. query `meaningSql` binds a
 *                                          subquery, not a list.
 *   store `#contentEarned`, and `#attestationsOver` / `#transcriptionsOver` (3 sites) fed from it .. NOT
 *       CHUNKED: cut at CONTENT_EARNED_MAX = 200, so up to 201 variables by the code (not driven). D-443.
 *   store `#contentStandings`, `earnedBasisRegistry`'s union (binds its list TWICE, so ~50 targets),
 *       `publishedCaseRegistryFor`, the superseded-by MAX ... NOT a limit-bounded page: bounded only by a
 *       basis, a case's claims or a frontmatter list, none capped. Out of this row's scope; D-443 names them.
 *   (2026-09-23, D-443: every site in the last two entries now binds ONE json_each value, and six of the
 *    seven reads are driven past the ceiling by the D-443 block below. The verdicts above are D-390's day.)
 */

import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const TOK = "mem-d390";
const ADM = "adm-d390";
const NOW = "2026-09-23T09:00:00Z";
const N = 210;   /* above 3 × 64, so the read crosses the chunk boundary three times */

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: TOK, PROBE_TOKEN: "prb-d390",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});

let pass = 0, fail = 0, reachedFoot = false;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got).slice(0, 600)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

/* ====================================================================================================
 * D-443 — THE SEVEN `IN` LISTS D-390's SWEEP LEFT, each now bound as ONE value
 * (`IN (SELECT value FROM json_each(?))`), and each read driven THROUGH ITS OP past D-36's ceiling.
 *
 * The fixture is M = 120 of everything (above ~100, below `CONTENT_EARNED_MAX` = 200 so no cap hides a
 * row), built through `op=promote` and `op=transcribe` only:
 *   DOC_T  one information document at one capture, TYPED M times by a member (M transcription rows);
 *   DOC_C  one information document holding M captures, one reading each;
 *   Q_T    an inquiry with M legs on DOC_T, each naming one transcription row by `content_id`;
 *   Q_C    an inquiry with M legs on DOC_C, each naming one capture by `extent_capture` (M document rows);
 *   SUP    an inquiry, and M inquiries each `supersedes` it.
 * Which op reaches which read (the arm names it too):
 *   D443-1 `#contentStandings` ........ op=promote of Q_T and Q_C (M ids each)
 *   D443-2 `#contentEarned` ........... op=earnedbasis on Q_C (M content ids)
 *   D443-3 `#attestationsOver` ........ op=earnedbasis on Q_C (M distinct captures)
 *   D443-4 `#transcriptionsOver` ...... op=earnedbasis on Q_T (M ids, then M transcription rows — both lists)
 *   D443-5 `earnedBasisRegistry` union  op=earnedbasis on Q_C with `targets=` the M superseders (2M bound)
 *   D443-6 superseded-by MAX .......... op=reevaluations&target=SUP (M superseding ids)
 *   D443-7 `publishedCaseRegistryFor` . NOT DRIVEN PAST THE CEILING, and stated rather than rounded off. Its
 *       one caller feeds it `#caseClaimsOf`: the cases whose roster PINS this finding's CURRENT sha, or else
 *       the one case its bytes claim. Past 100 would take 101 signed case ratifications all pinning ONE
 *       byte-identical version of one finding, and no route hands the function a list of its own. So D443-7
 *       pins it STRUCTURALLY: the statement binds one json_each value and no spread marks. What this cannot
 *       see: that read answering a list past 100, live.
 * D443-0 is the liar's clause for all of them: the fixture's sizes, counted from the plane's own answers.
 * ==================================================================================================== */
async function d443() {
  console.log("\n--- D-443 · the seven remaining `IN` lists, each driven past D-36's ceiling ---");
  const M = 120;
  const W = "2026-09-23T10:00:00Z";
  const enrol = async (m) => {
    const add = await POST(`op=memberadd&token=${ADM}`, { memberId: m, cover: "d443",
      role: "admin", capabilities: ["contribute", "publish"] });
    const en = await POST(`op=enroll`, { invite: add && add.invite, handle: m, password: `${m}-passphrase-1` });
    const lg = await POST(`op=login`, { role: `member:${m}`, password: `${m}-passphrase-1` });
    if (!en || en.ok === false || !lg || !lg.token) throw new Error(`d443 session ${m}: ${JSON.stringify([en, lg]).slice(0, 400)}`);
    return lg.token;
  };
  const RUTH = await enrol("ruth443");
  const SAM = await enrol("sam443");

  const head = (id, type, extra = []) => ["---", `id: ${id}`, `object_type: ${type}`, `schema: ${type}@1`,
    `title: "D-443 ${id}"`, `current_state: ${type === "inquiry" ? "open" : "collected"}`, "prior_state: null",
    `created: "${W}"`, `last_updated: "${W}"`, "produced_by:", "  mode: assisted", "  capability_tier: session",
    "group: believe-in-oakland", ...extra, "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []"];
  const infoMd = (id) => [...head(id, "information", ["references: []"]), "criticality: supporting",
    "source_status: unchanged", "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${W}`,
    "monitoring:", "  enabled: false", "  frequency: none", "---", "", "## Summary", "", "A captured document.", "",
    "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  /* A superseder discloses its division (C-6.1, R4): its parent, and EVERY other child as a sibling —
     the parent's `division.into` names all M, and the store refuses a child that leaves one out. */
  let children = [];
  const division = (id, refs) => refs.filter((r) => r.rel === "supersedes").slice(0, 1).flatMap((r) =>
    [`division_parent: ${r.target}`, `division_siblings: [${children.filter((c) => c !== id).join(", ")}]`]);
  const inquiryMd = (id, refs, legs, into = null) => [...head(id, "inquiry", [...division(id, refs),
      ...(into ? ["division:", `  into: [${into.join(", ")}]`] : []),
      ...(refs.length ? ["references:", ...refs.flatMap((r) => [`  - target: ${r.target}`, `    rel: ${r.rel}`,
                                                          "    status: confirmed",
          ...(r.rel === "supersedes" ? ["    reason: D-443 fixture, the question was restated"] : [])])] : ["references: []"])]),
    "surfaced_by: human", 'disposition_reason: ""',
    "recheck_triggers:", "  - text: Revisit after the next budget cycle",
    "    description: The adopted budget may restate the transfer basis.",
    ...(legs.length ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    role: supports",
      ...(l.cid ? [`    content_id: "${l.cid}"`] : []), ...(l.cap ? [`    extent_capture: "${l.cap}"`] : [])])] : []),
    "---", "", "## Question", "", `What does ${id} rest on?`, "", "## What It Rests On", "", "## Conclusion", "",
    "## What Would Falsify This", "", "## Session Log", "", `### Session ${W} | Formation | agent`,
    "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
  let seq = 0;
  const promote = async (id, type, text, readings = []) => {
    const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
    if (readings.length) {
      const prov = JSON.stringify({ documents: readings });
      files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
    }
    return POST(`op=promote&token=${RUTH}`, { bundleId: id, base: null,
      snapKey: `20260923T${String(400000 + (++seq)).slice(-6)}Z_${sha(`d443-${seq}`).slice(0, 8)}`,
      meta: { object_type: type, group: "believe-in-oakland", title: `D-443 ${id}`,
              current_state: type === "inquiry" ? "open" : "collected", created: W, last_updated: W },
      files });
  };
  const mustPromote = async (...a) => {
    const r = await promote(...a);
    if (!r || r.ok === false) throw new Error(`d443 promote ${a[0]}: ${JSON.stringify(r).slice(0, 600)}`);
    return r;
  };
  const chain = [{ step: "pixels", extent: { kind: "pages", pages: [0, 1, 2] } },
    { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", confidence: { basis: "none" },
      extent: { kind: "pages", pages: [0, 1, 2] } }];
  const readingOf = (s) => ({ capture: { sha256: s, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_calendar", reader_version: 1, found: false, at: W,
               entities: [], facts: {}, text_source: chain } });

  const DOC_T = "INFO-2026-0923-d443t", DOC_C = "INFO-2026-0923-d443c";
  const Q_T = "INQ-2026-0923-d443t", Q_C = "INQ-2026-0923-d443c", SUP = "INQ-2026-0923-d443";
  const caps = Array.from({ length: M }, (_, i) => sha(`d443-capture-${i}`));
  await mustPromote(DOC_T, "information", infoMd(DOC_T), [readingOf(sha("d443-typed-capture"))]);
  await mustPromote(DOC_C, "information", infoMd(DOC_C), caps.map(readingOf));
  const cids = [];
  for (let i = 0; i < M; i++) {
    const tr = await POST(`op=transcribe&token=${RUTH}`, { bundleId: DOC_T, at: W,
      extent: { kind: "pdf-page", page: 1, rect: [10, 10, 200 + i, 100] }, text: `D-443 typed passage number ${i}.` });
    if (tr && tr.ok && tr.content_id) cids.push(tr.content_id);
  }
  /* A SECOND member attests the LAST typing (the 120th), so D443-4 asks for a fact only BOTH of
     `#transcriptionsOver`'s lists can carry: the row found as a typing, then its attestation found. */
  const LAST_TX = cids[cids.length - 1];
  const ta = await POST(`op=transcriptionattest&token=${SAM}`, { contentId: LAST_TX, at: W });
  const superseders = Array.from({ length: M }, (_, i) => `${SUP}s${String(i).padStart(3, "0")}`);
  children = superseders;
  await mustPromote(SUP, "inquiry", inquiryMd(SUP, [], [], superseders));
  for (const s of superseders) await mustPromote(s, "inquiry", inquiryMd(s, [{ target: SUP, rel: "supersedes" }], []));
  /* A question resting on SUP, so op=reevaluations has a dependent leg to report the supersession against. */
  const Q_S = "INQ-2026-0923-d443q";
  await mustPromote(Q_S, "inquiry", inquiryMd(Q_S, [{ target: SUP, rel: "cites" }], [{ target: SUP }]));
  /* One attestation over the LAST capture (the 120th), so D443-3 asks for a fact the read must have
     reached past the ceiling, not only for an answer that came back. */
  const LAST = caps[M - 1];
  const at = await POST(`op=attesttext&token=${RUTH}`, { captureSha: LAST, at: W, extent: { kind: "document" },
                                                        note: "D-443: checked the whole of the last capture" });

  /* D443-1: `#contentStandings`, through op=promote — it resolves every leg's row in ONE read at the write. */
  const pT = await promote(Q_T, "inquiry", inquiryMd(Q_T, [{ target: DOC_T, rel: "cites" }],
    cids.map((cid) => ({ target: DOC_T, cid }))));
  const pC = await promote(Q_C, "inquiry", inquiryMd(Q_C, [{ target: DOC_C, rel: "cites" }],
    caps.map((cap) => ({ target: DOC_C, cap }))));
  t("D443-1: `#contentStandings` — op=promote of an inquiry with M legs naming M content rows LANDS, "
  + "both spellings (M named transcription rows; M captures named by extent_capture)",
    [pT && pT.ok !== false, pC && pC.ok !== false], [true, true]);

  const eC = await GET(`op=earnedbasis&token=${TOK}&id=${Q_C}&targets=${encodeURIComponent(superseders.join(","))}`);
  const eT = await GET(`op=earnedbasis&token=${TOK}&id=${Q_T}`);
  const cC = (eC && eC.earned && eC.earned.content) || {};
  const cT = (eT && eT.earned && eT.earned.content) || {};
  const legC = Array.isArray(eC && eC.legs) ? eC.legs.map((l) => l.content_id).filter(Boolean) : [];

  /* D443-0: THE LIAR'S CLAUSE, from the plane's own answers. */
  t("D443-0: the fixture is ABOVE D-36's ~100-variable ceiling on every list — counted from what the plane "
  + "answered (transcription rows minted, Q_C's leg rows, Q_C's distinct captures, superseders asked)",
    [cids.length > 100 ? "T" : cids.length, legC.length > 100 ? "C" : legC.length,
     new Set(legC).size > 100 ? "D" : new Set(legC).size,
     Array.isArray(eC && eC.asked) && eC.asked.length > 100 ? "A" : (eC && eC.asked || []).length],
    ["T", "C", "D", "A"]);

  t("D443-2: `#contentEarned` — op=earnedbasis on Q_C answers, and EVERY one of its M leg rows has an "
  + "earned.content entry (none fell out of the read)",
    [eC && eC.ok, legC.length > 100 ? legC.filter((c) => !cC[c]).length : `only ${legC.length} legs`], [true, 0]);

  const capsSeen = new Set(Object.values(cC).map((x) => x && x.capture_sha).filter(Boolean));
  const lastRow = Object.values(cC).find((x) => x && x.capture_sha === LAST);
  t("D443-3: `#attestationsOver` — the same answer's rows stand on M DISTINCT captures, every row carries its "
  + "attestation standing, and the one attestation (over the 120th capture) is SEEN on its row",
    [at && at.ok, capsSeen.size > 100 || `${capsSeen.size} captures`,
     Object.values(cC).filter((x) => !(x && x.transcription && Array.isArray(x.transcription.by))).length,
     JSON.stringify(lastRow && lastRow.transcription && lastRow.transcription.by || null).includes("ruth443")],
    [true, true, 0, true]);

  t("D443-4: `#transcriptionsOver` — op=earnedbasis on Q_T answers for all M typed rows, and the second "
  + "member's attestation of the 120th typing is SEEN on it (found as a typing, then its attestation found)",
    [ta && ta.ok, eT && eT.ok,
     cids.length > 100 ? cids.filter((c) => !(cT[c] && cT[c].transcription)).length : `only ${cids.length} rows`,
     JSON.stringify(cT[LAST_TX] && cT[LAST_TX].transcription && cT[LAST_TX].transcription.by || null).includes("sam443")],
    [true, true, 0, true]);

  t("D443-5: `earnedBasisRegistry`'s register/readings union — op=earnedbasis with M targets (bound twice) "
  + "answers a registry naming every one of them",
    [eC && eC.ok, eC && eC.asked && eC.asked.length, superseders.filter((s) => !(eC && eC.asked || []).includes(s)).length],
    [true, M, 0]);

  const rv = await GET(`op=reevaluations&token=${TOK}&target=${SUP}`);
  t("D443-6: the superseded-by `MAX(last_updated)` read — op=reevaluations on an inquiry superseded by M "
  + "others answers, with the supersession cause and all M successors named",
    [rv && rv.ok === true && rv.count > 0, JSON.stringify(rv || {}).includes('"supersession"'),
     superseders.filter((s) => !JSON.stringify(rv || {}).includes(s)).length], [true, true, 0]);

  /* D443-7: STRUCTURAL, for the reason the header gives. Read off the source: the function's statement binds
     ONE json_each value and carries no spread marks. */
  const src = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
  const body = (name) => { const i = src.indexOf(`\n  ${name}(`); return i < 0 ? "" : src.slice(i, src.indexOf("\n  }\n", i)); };
  const pcr = body("publishedCaseRegistryFor");
  t("D443-7: `publishedCaseRegistryFor` binds its case list as ONE json_each value (STRUCTURAL — not "
  + "drivable past 100 through its op; see the header)",
    /* Any spelling that binds the list through json_each passes (the control's `overstrict` arm drives an
       aliased one); a spread `IN (${…})` fails. */
    [pcr.length > 0, /IN\s*\(\s*SELECT\s+\w*\.?value\s+FROM\s+json_each\(\?\)/i.test(pcr), /IN \(\$\{/.test(pcr)],
    [true, true, false]);
}

try {
  console.log("\n--- D-390 · a content frontier page past D-36's bound-variable ceiling ---");

  /* THE FIXTURE, THROUGH `op=promote`: ONE bundle whose provenance carries N documents, each with a
     reading, so each capture gets its content-level `extract` row and its `derive` (index) row from the
     promote-time writers rather than from anything this file inserts. */
  const whole1 = [{ step: "layer", tier: 1, container: "pdf" }];
  const shas = Array.from({ length: N }, (_, i) => sha(`d390-capture-${i}`));
  const reading = { content_type: "meeting_calendar", reader_version: 1, read_from_text: true,
                    found: false, entities: [], facts: {}, at: NOW, text_container: "pdf",
                    text_source: whole1, text_tier: 1 };
  const prov = JSON.stringify({ documents: shas.map((s) => ({
    capture: { sha256: s, encoding: "binary", bytes: 10 }, reading })) });
  const text = "---\nobject_type: information\ngroup: believe-in-oakland\ntitle: D-390 fixture\n"
             + "current_state: collected\n---\n\n# D-390 fixture\n";
  const r = await POST(`op=promote&token=${ADM}`, {
    bundleId: "INF-2026-0923-d390", base: null, snapKey: "20260923T090000Z_d3900000",
    meta: { object_type: "information", group: "believe-in-oakland", title: "D-390 fixture",
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }],
    register: shas.map((s) => ({ sha256: s, path: `data/${s.slice(0, 12)}.pdf`, encoding: "binary", bytes: 10 })) });
  if (!r || r.ok === false) throw new Error(`promote: ${JSON.stringify(r).slice(0, 600)}`);

  /* D390-1: the per-capture read, one capture at a time — the "one chunk at a time" side. */
  const axis = new Map();
  for (const s of shas) axis.set(s, await GET(`op=contentaxis&token=${TOK}&captureSha=${s}`));
  const perCapture = shas.map((s) => { const a = axis.get(s);
    return [s, a && a.indexed, a && a.determined]; });
  t("D390-1: every capture's per-capture read answers an index state it DETERMINED — the fixture reaches "
  + "the `derive` writer for all N, so the frontier below has a real index state to agree with",
    perCapture.filter(([, i, d]) => typeof i !== "string" || d !== true).length, 0);

  const f = await GET(`op=frontier&token=${TOK}&level=content&limit=500`);
  const rows = Array.isArray(f && f.looked) ? f.looked : null;
  const ours = rows ? rows.filter((x) => shas.includes(x.subject)) : [];

  /* D390-0: THE LIAR'S CLAUSE. The count comes from the frontier's own answer, and must be above the
     ceiling it exists to cross. Reported -1 if the op answered no rows at all. */
  t("D390-0: the fixture is ABOVE D-36's ~100-variable ceiling and above 3 × 64 — counted from what "
  + "the frontier returned, not from what this file meant to write",
    rows ? ours.length >= 200 : -1, true);

  t("D390-2: `op=frontier&level=content` over a 200+ subject page ANSWERS (found, built, a looked "
  + "array) rather than refusing at the index-state read",
    [f && f.found, f && f.built, Array.isArray(rows)], [true, true, true]);

  t("D390-3: EVERY row on the page carries a DETERMINED index state — none fell out of the merged map, "
  + "which is what a dropped or mis-merged chunk would read as",
    ours.length >= 200 ? ours.filter((x) => x.indexed_determined !== true).map((x) => x.subject.slice(0, 12))
                       : `only ${ours.length} rows — an empty page passes a filter for free`, []);

  t("D390-4: and each row's index state EQUALS the same capture's read alone (op=contentaxis) — "
  + "the merged chunks agree with a chunk of one, row by row",
    ours.filter((x) => { const a = axis.get(x.subject);
                         return !a || a.indexed !== x.indexed || a.determined !== x.indexed_determined; })
        .map((x) => x.subject.slice(0, 12)).concat(ours.length >= 200 ? [] : [`only ${ours.length} rows`]), []);

  /* D390-5: THE SWEEP'S SECOND LIMIT-BOUNDED SITE. `publishedTargets` cuts its list at 200 and hands it to
     `publishedRegistryFor`'s `IN`. Driven at the DO route the public read path calls. What this arm can and
     cannot see: the fixture publishes nothing, so it proves the read ANSWERS past the ceiling and not that a
     published edition in the third chunk is found — that equality is the registry's keying, per id. */
  {
    const ns = await mf.getDurableObjectNamespace("STORE");
    const obj = ns.get(ns.idFromName("bio"));
    const ids = Array.from({ length: 200 }, (_, i) => `INF-2026-0923-d390-${String(i).padStart(3, "0")}`);
    const pt = rP(await (await obj.fetch(`http://x/publishedtargets?ids=${encodeURIComponent(ids.join(","))}`)).json());
    t("D390-5: `/publishedtargets` over 200 ids ANSWERS a registry rather than refusing at the `IN` list",
      [pt && pt.ok, typeof (pt && pt.registry)], [true, "object"]);
  }

  await d443();
  reachedFoot = true;
} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nfrontier-chunk: ${pass} passed, ${fail} failed${reachedFoot ? "" : " (DID NOT REACH ITS FOOT)"}`);
process.exit(fail || !reachedFoot ? 1 : 0);
