/* NEGATIVE CONTROL: (declared and RUN 2026-09-23, D-390, session WORKER D-390) FOUR arms, each ALONE, each
   anchor matched exactly once, each restore verified by sha256 AND cmp against a per-arm pristine copy
   (2,884,632 bytes; subject sha256 432948a0…); baseline 6/0 at both ends.
   (a) `unchunked` — the row's own: restore the single unchunked `IN` in `#frontierContent`. Declared MUST FAIL
       D390-2/3/4, MUST NOT FAIL D390-1/5. ACTUAL: D390-0, D390-2, D390-3, D390-4 FAILED (2/4) — the
       declaration missed D390-0, which reads -1 when the op refuses; that is D390-0 working, not a miss.
   (b) `firstchunk` — merge only the first chunk. Declared MUST FAIL D390-3/4 only. ACTUAL: exactly those (4/2).
   (c) `registry` — `publishedRegistryFor` back to one variable per id in its `IN`. Declared MUST FAIL D390-5 only. ACTUAL: exactly (5/1).
   (d) `overstrict` — chunk size 1, a correct spelling nobody would choose. Declared GREEN. ACTUAL: 6/0. */
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

  reachedFoot = true;
} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nfrontier-chunk: ${pass} passed, ${fail} failed${reachedFoot ? "" : " (DID NOT REACH ITS FOOT)"}`);
process.exit(fail || !reachedFoot ? 1 : 0);
