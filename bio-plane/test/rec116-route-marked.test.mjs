/* NEGATIVE CONTROL: ALL SIX ARMS RUN 2026-09-17 by `test/nc-rec116.mjs` against the FINAL files — 40 assertions in the driver, 0 failing, exit 0, read UNPIPED. Each arm armed ALONE with the others held open; each asserted it ARMED by matching its patch anchor EXACTLY ONCE and by the source really changing; each restored from a PRISTINE copy named uniquely for that arm and verified by sha256 AND by `cmp`, floored at 100,000 bytes (store.mjs restored byte-identically at sha `94693822ae99` / 2,323,431 bytes after every one of the five that patch it); the harness lives INSIDE this worktree and never in a shared scratchpad. BASELINE ROW FIRST, because without one six-arms-broken and six-arms-working are indistinguishable: this suite 65 passing / 0 failing with its FOOT line printed. CLOSING BASELINE re-measured EQUAL to the opening one, and store.mjs pinned byte-identical to the driver's opening sha, so no arm leaked into another.
   (a) THE OP NEUTERED — `provenanceRoutesMarked`'s page loop iterates an empty array after the SELECT, so the read still runs and the failure is about the ANSWER rather than an exception. DECLARED MUST-FAIL: every section-B arm. ACTUAL 51/14, failing by name across B, plus E, F and G, which all read through a returned page ✓.
   (b) THE ARM THAT MATTERS MOST — THE TWO ABSENCES COLLAPSED. The cause ladder is switched off so an empty answer cannot say WHY it is empty. DECLARED MUST-FAIL: every section-C arm. ACTUAL 52/13, failing C1, C2 and C3 by name ✓. *The op returned nothing* and *no document carries a marker* are the two facts this construct exists to separate; a consumer would read `never_assessed` (NOBODY LOOKED) as `none_standing` (WE LOOKED AND EVERY ROUTE CAN BE SHOWN), the overclaim DEC-56/57/58 were ruled against.
   (c) THE LIAR THE ROW NAMES — the `m.seq = (SELECT MAX(...))` clause dropped, so the op returns every document that EVER carried the marker instead of every document carrying one NOW. DECLARED MUST-FAIL: section D1. ACTUAL 58/7, failing D1 by name ✓. The answer stays non-empty and plausible and is not the question: it publishes a standing doubt over a document whose route the record can now show.
   (d) THE SECOND LIAR — the finding predicate widened to `OR 1 = 1`, i.e. every document with any route row at all. DECLARED MUST-FAIL: section B's over-strictness arm and section D2. ACTUAL 51/14, failing both by name ✓, and failing DIFFERENT assertions from (c): (c) returns a CORRECTED document, (d) returns one assessed PRESENT and never doubted.
   (e) THE FENCE — the gate resolution made unconditional. DECLARED MUST-FAIL: section E's deny arm. ACTUAL 63/2 ✓ — **BUT ONLY AFTER THE ARM'S FIRST RUN CAME BACK GREEN AT 63/0, AND THAT SURPRISING GREEN IS THIS ITEM'S BEST FINDING ABOUT ITS OWN INSTRUMENT.** The arm was right and the FIXTURE was empty: section E's deny call ran against a FRESH store with nothing in it, so it answered empty for every viewer and passed for free. An equality that costs nothing to produce is not evidence. Section E now SEEDS a marked document into that store and proves a recognised viewer IS answered with it before the deny arm runs.
   (f) THE OVER-STRICTNESS ARM, and it is the one that decides this item is safe to ship — THIS ROW ADDS A READER AND MUST CHANGE NOTHING ALREADY ANSWERED. The PRE-ITEM build is extracted from the merge-base and the SAME probe bytes are run against both worker scripts. DECLARED MUST-NOT-FAIL: anything. ACTUAL: all nine answers BYTE-IDENTICAL ✓ — `op=provenanceroute` (the act, the good register, a repeat that appends nothing, a missing bundle), `op=list` (both arms), `op=audit`, `op=provenancechain`, and `op=stats`' `routeMarks`. Driven against a DIFFERENT build rather than self-pinned, because a build compared to itself agrees at zero cost. The mixed-build hazard is GUARDED rather than assumed: the arm asserts nothing outside `src/`, `test/` and the `dist/` BUILD OUTPUT has moved since the merge-base, so the `checks/` and `docprofile/` the pre-item `src/` resolves against really are the pre-item ones. `dist/` is excluded NARROWLY and with its reason — it is regenerated from `src/` by `npm run build`, this item necessarily moves it, and `grep` over `src/` returns ZERO imports from it — and the exclusion carries its OWN polarity arm proving a moved `checks/` or `docprofile/` is still seen.
   AND ONE MORE INSTRUMENT CAUGHT THIS ITEM RATHER THAN CONFIRMING IT, which is recorded here because it changed the op's published shape: `meaning-bounds.test.mjs` classified this op **BARE** — *a collection off an unbounded row source with no bound published* — on its first run. It was RIGHT by its own vocabulary. The op's first draft published `more` and `nextAfter`; `MORE_KEY` knows `truncated`, `cursor`, `hasMore` and five more, and knew neither invented spelling. **The ratchet was NOT widened and the bare-collection ceiling was NOT moved.** The keys were renamed to the plane's own `limit` / `truncated` / `cursor`, after which the op classifies BOUNDED and that ceiling does not move at all — which is what a correctly-bounded new read should do. REC-57's point is that every capped op settles its two questions in ONE shape, so a new read inventing a second spelling is the hand-copy defect arriving in a key name.
   THE QUERY PLAN IS MEASURED SEPARATELY by `test/nc-rec116-plan.mjs` (10/10, recorded as M-49), which EXTRACTS `Store.ROUTE_MARKED_PAGE_SQL` from `store.mjs` and plans those exact bytes rather than a retyped stand-in: `SEARCH m USING INDEX provenance_route_marks_finding (finding=? AND bundle_id>?)` — BOTH COLUMNS — on the first page and on a paged call alike.
*/

/* REC-116 / IC-120 — THE READ THE MARKER NEVER HAD.
 *
 * REC-69's DELEGATION of 2026-08-09 named one question verbatim — *which
 * documents in this instance carry a standing `LOOKED_INDETERMINATE` marker* —
 * and the INDEX for it landed 2026-08-08, one day before the sweep that catches
 * an index with no reader. The reader never did. REC-112 measured the ground and
 * its answer is inherited here rather than re-derived (M-41): the index is not
 * dead weight and not mis-phrased, it was specified FOR this reader, and
 * `bundle_id` — its second column — is this plane's after-cursor paging key.
 *
 * WHAT THIS SUITE ASSERTS, in the order the questions matter:
 *
 *   A. THE OP IS REACHABLE AT ALL, through the CONTROL PLANE. `op=invitelook`
 *      shipped with a ReferenceError while 1,276 assertions passed, so every
 *      assertion in this file goes through `dispatchFetch` and none touches the
 *      store directly.
 *   B. THE ANSWER. A document carrying a standing marker is RETURNED, named,
 *      and carries the finding's own vocabulary rather than a private spelling.
 *   C. THE TWO ABSENCES — the arm this item turns on. An empty answer says WHY,
 *      and the four causes are DIFFERENT STATEMENTS about the world. Driven in
 *      the order a real instance passes through them.
 *   D. THE LIARS, PINNED OUT rather than merely not built. A document CORRECTED
 *      forward is absent; a document assessed PRESENT was never present.
 *   E. THE FENCE. An unrecognised stamp answers empty, and the census is
 *      computed through the same gate so no ungated total sits beside it.
 *   F. THE BOUND, applied AND published (REC-57's defect), and the cursor.
 *   G. NEVER_ASSESSED IS PUBLISHED EVEN WHEN THE PAGE IS FULL — completeness.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { OBSERVATION_STATES } from "../src/airun.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const STORE_SRC = fileURLToPath(new URL("../src/store.mjs", import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* DEFENSIVE READS. A TypeError inside an assertion goes through NO assertion at
   all — it ends the module while the tally still reads clean. Every accessor
   below tolerates a neutered subject so an armed control produces a readable
   FAILING assertion instead of a dead run. */
const o = (v) => (v && typeof v === "object" ? v : {});
const arr = (v) => (Array.isArray(v) ? v : []);
const ids = (v) => arr(o(v).documents).map((d) => o(d).bundleId).sort();

const NOW = "2026-09-17T00:00:00Z";

/* A register whose route CAN be derived — the over-strictness fixture. */
const DERIVABLE = {
  file: "snapshots/capture-2026-07-19-doc.pdf",
  locator: "https://www.example.gov/reports/acfr.pdf",
  authority: "Example Finance Department",
  retrieved: "2026-07-19T19:15:50Z",
  capture: { method: "daemon-fetch", grade: "B", actor_class: "daemon", sha256: "a".repeat(64) },
};
/* A register with no route recorded at all — the marker's own subject. */
const NO_ROUTE = { file: "snapshots/mystery.pdf", locator: "", capture: { grade: "C" } };

const bundleMd = (id, type, state) =>
  `---\nid: ${id}\nobject_type: ${type}\ncurrent_state: ${state}\n---\n\n# ${id}\n`;

const mkStore = () => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  bindings: { ADMIN_TOKEN: "adm-p", MEMBER_TOKEN: "mem-p", PROBE_TOKEN: "prb-p",
              VERSION: "test", INSTANCE_NAME: "testinstance" },
});

/* EVERY CALL GOES THROUGH THE CONTROL PLANE. There is no store-level path in
   this file, deliberately — a store-level test and a passing battery are not
   evidence that a caller can reach the feature. */
const api = (mf) => ({
  post: async (op, body, qs = "") => (await mf.dispatchFetch(
    `http://x/api/?op=${op}&token=mem-p${qs}`, { method: "POST", body: JSON.stringify(body || {}) })).json(),
  get: async (op, qs = "") => (await mf.dispatchFetch(
    `http://x/api/?op=${op}&token=mem-p${qs}`)).json(),
});

const listRow = async (id) => {
  const rows = arr((await api(mf).get("list")).result);
  return rows.find((r) => r && r.bundle_id === id) || null;
};

const seedInto = async (mf, id, docs, { state = "verified", type = "information" } = {}) => {
  const body = bundleMd(id, type, state);
  const files = [{ path: "bundle.md", text: body, bytes: body.length, sha256: sha(body) }];
  if (docs !== null) {
    const prov = JSON.stringify({ documents: docs }, null, 2);
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  return api(mf).post("promote", {
    bundleId: id, base: null, snapKey: "20260917T000000Z_aaaa1111", author: "m-riley",
    meta: { object_type: type, group: "believe-in-oakland", title: id,
            current_state: state, created: NOW, last_updated: NOW },
    files, register: [],
  });
};

/* =====================================================================
   C. THE TWO ABSENCES — DRIVEN FIRST, because the three empty causes are
   states a real instance passes THROUGH in order, and each needs a store
   that has not yet reached the next one. This is the arm the item turns on.
   ===================================================================== */
console.log("\n--- C. an empty answer SAYS WHY, and the causes are different statements about the world ---");

/* C1. An EMPTY STORE. Nothing to see, and the answer must not read as a
   finding about routes — it is a fact about what this viewer can reach. */
const mfEmpty = mkStore();
const emptyStore = o((await api(mfEmpty).get("provenanceroutes")).result);
t("C1: the op is reachable against an empty store rather than throwing", emptyStore.ok, true);
t("C1: and returns nothing", emptyStore.returned, 0);
t("C1: the cause is NO DOCUMENTS VISIBLE, not a claim about routes",
  emptyStore.cause, "no_documents_visible");
t("C1: and it says in words that this is NOT a statement about markers",
  /says NOTHING about whether any document carries a marker/.test(String(emptyStore.says)), true);

/* C2. DOCUMENTS EXIST, NOBODY HAS EVER ASSESSED ONE. This is NEVER_LOOKED at
   the level of the whole instance and it is the cause that is NOT "no document
   carries a marker". */
const mf = mkStore();
const { get, post } = api(mf);
await seedInto(mf, "INFO-2026-0101-noroute", [{ ...NO_ROUTE }]);
await seedInto(mf, "INFO-2026-0202-good", [{ ...DERIVABLE }]);

const neverAsked = o((await get("provenanceroutes")).result);
t("C2: the fixture is really in the store before anything is asserted about it — a headline "
+ "assertion that passed over an empty corpus is a measured failure in this repository",
  neverAsked.census && o(neverAsked.census).documents_visible, 2);
t("C2: nothing is returned", neverAsked.returned, 0);
t("C2: the cause is NEVER_ASSESSED — nobody looked", neverAsked.cause, "never_assessed");
t("C2: and it says so in D-129's own terms rather than reporting a clean corpus",
  /absence of the question having been asked/.test(String(neverAsked.says)), true);
t("C2: it explicitly REFUSES the reading that every route can be shown",
  /NOT a finding that every route can be shown/.test(String(neverAsked.says)), true);
t("C2: the census counts two documents and ZERO assessments — the two numbers that make the "
+ "distinction checkable rather than a sentence a consumer must trust",
  [o(neverAsked.census).documents_visible, o(neverAsked.census).assessed,
   o(neverAsked.census).never_assessed], [2, 0, 2]);
t("C2: and the answer states it is NOT complete over the corpus", neverAsked.complete, false);

/* C3. ASSESSED, AND EVERY STANDING FINDING IS PRESENT. This — and only this —
   is the EARNED statement that no document carries a marker. */
await post("provenanceroute", {}, "&bundleId=INFO-2026-0202-good");
const allPresent = o((await get("provenanceroutes")).result);
t("C3: still nothing returned", allPresent.returned, 0);
t("C3: but the cause has CHANGED — somebody looked, so this is NONE STANDING and not NEVER_ASSESSED",
  allPresent.cause, "none_standing");
t("C3: and the sentence earns the claim by naming the looking",
  /somebody looked/.test(String(allPresent.says)), true);
t("C3: the census shows one assessment, none of them marked",
  [o(allPresent.census).assessed, o(allPresent.census).marked], [1, 0]);
t("C3: THE ARM THIS ITEM TURNS ON — C2 and C3 both returned ZERO DOCUMENTS and the two answers "
+ "are DISTINGUISHABLE. *The op returned nothing* and *no document carries a marker* are different "
+ "facts and this op says which one it is holding",
  [neverAsked.returned, allPresent.returned, neverAsked.cause === allPresent.cause],
  [0, 0, false]);
t("C3: and their SENTENCES differ too, so a consumer reading prose rather than codes is not "
+ "misled either", String(neverAsked.says) === String(allPresent.says), false);

/* =====================================================================
   B. THE ANSWER — a standing marker is RETURNED and named
   ===================================================================== */
console.log("\n--- B. a document carrying a standing marker is returned, named, in the vocabulary ---");

const act = o((await post("provenanceroute", {}, "&bundleId=INFO-2026-0101-noroute")).result);
t("B: the fixture was really marked before the read is asserted about it",
  [act.ok, o(act.route).marked], [true, true]);

const marked = o((await get("provenanceroutes")).result);
t("B: the marked document is RETURNED", ids(marked), ["INFO-2026-0101-noroute"]);
t("B: and the document whose route CAN be shown is NOT — the over-strictness direction, so the "
+ "op is not simply returning everything it can reach",
  ids(marked).includes("INFO-2026-0202-good"), false);
t("B: the op names the finding it was asked about", marked.finding, "LOOKED_INDETERMINATE");
t("B: and its meaning is D-129's own sentence, not a sixth private spelling",
  marked.means, OBSERVATION_STATES.LOOKED_INDETERMINATE);
t("B: the returned row carries the marker", o(arr(marked.documents)[0]).marked, true);
t("B: it names WHO assessed it", typeof o(arr(marked.documents)[0]).by === "string"
  && o(arr(marked.documents)[0]).by.length > 0, true);
t("B: and WHEN", typeof o(arr(marked.documents)[0]).at === "string"
  && o(arr(marked.documents)[0]).at.length > 0, true);
t("B: and the STATE the document sits in, so the deliberate disagreement is readable from the "
+ "roster and not only from the bundle", o(arr(marked.documents)[0]).state, "verified");
t("B: the row carries the standing sentence saying the two disagree ON PURPOSE",
  /disagree deliberately/.test(String(o(arr(marked.documents)[0]).note)), true);
t("B: the cause is null when the answer is non-empty — a cause beside a full page would be a "
+ "sentence about nothing", marked.cause, null);
t("B: and the census agrees with the page rather than being computed a second way",
  [o(marked.census).marked, marked.returned], [1, 1]);

/* =====================================================================
   D. THE LIARS — pinned OUT rather than merely not built
   ===================================================================== */
console.log("\n--- D. the two cheap wrong answers are pinned out ---");

/* D1. CORRECTION MOVES FORWARD (DEC-19). A member records the custody the
   register was missing, and the record ADDS rather than un-says: a NEW row says
   the route is showable, the old row stays readable, and the document must
   LEAVE this roster.

   THE CORRECTING PROMOTE TAKES THE CURRENT `bundle_sha` AS ITS BASE AND A FRESH
   SNAPSHOT KEY, and that is not incidental — a promote with `base: null` over an
   existing bundle is a NO-OP here. Measured rather than assumed: the first draft
   of this fixture re-promoted with `base: null` and the same snapKey, the
   register never moved, and the re-assessment correctly answered
   `appended: false` with the SAME finding. The suite then read as though the op
   were returning a corrected document, when in fact nothing had been
   corrected — an arm that did not arm, wearing the costume of a real failure. */
const cur = o(await listRow("INFO-2026-0101-noroute"));
const fixedProv = JSON.stringify({ documents: [{ ...NO_ROUTE, ...DERIVABLE }] }, null, 2);
const fixedMd = bundleMd("INFO-2026-0101-noroute", "information", "verified");
await post("promote", {
  bundleId: "INFO-2026-0101-noroute", base: cur.bundle_sha, snapKey: "20260917T000001Z_bbbb2222",
  author: "m-riley",
  meta: { object_type: "information", group: "believe-in-oakland", title: "INFO-2026-0101-noroute",
          current_state: "verified", created: NOW, last_updated: NOW },
  files: [{ path: "bundle.md", text: fixedMd, bytes: fixedMd.length, sha256: sha(fixedMd) },
          { path: "data/provenance.json", text: fixedProv, bytes: fixedProv.length, sha256: sha(fixedProv) }],
});
const fixed = o((await post("provenanceroute", {}, "&bundleId=INFO-2026-0101-noroute")).result);
t("D1: THE ARM ARMED — the correcting promote really moved the register, so what follows is a "
+ "measurement and not a fixture that quietly did nothing", fixed.appended, true);
t("D1: and the new assessment finds the route showable", o(fixed.route).finding, "PRESENT");

const afterFix = o((await get("provenanceroutes")).result);
t("D1: THE LIAR THE ROW NAMES — a document whose marker was CORRECTED FORWARD is NOT on the "
+ "roster. A bare `WHERE finding = ?` would still return it, publishing a standing doubt over a "
+ "document whose route the record can now show",
  ids(afterFix).includes("INFO-2026-0101-noroute"), false);
t("D1: so the roster is empty again, and says the EARNED thing rather than NEVER_ASSESSED",
  [afterFix.returned, afterFix.cause], [0, "none_standing"]);
t("D1: and the history is still there — this op filters, it does not delete. Both documents are "
+ "counted as assessed", o(afterFix.census).assessed, 2);
t("D1: with both standing at PRESENT", o(o(afterFix.census).standing).PRESENT, 2);
t("D1: and none standing at the marker", o(o(afterFix.census).standing).LOOKED_INDETERMINATE, undefined);

/* D2. THE SECOND LIAR — a document assessed PRESENT and never doubted at all
   must never appear. `INFO-2026-0202-good` has exactly one row, PRESENT. */
t("D2: a document assessed PRESENT and NEVER doubted is absent from the roster — the row's own "
+ "cheapest green is an op that returns every document with any route row at all, which is "
+ "non-empty, plausible, and not the question",
  ids(afterFix), []);

/* =====================================================================
   E. THE FENCE
   ===================================================================== */
console.log("\n--- E. an unrecognised stamp answers empty, and the census is gated with it ---");

await seedInto(mf, "INFO-2026-0303-doubt", [{ ...NO_ROUTE }]);
await post("provenanceroute", {}, "&bundleId=INFO-2026-0303-doubt");
const visible = o((await get("provenanceroutes")).result);
t("E: with a recognised member stamp the marked document IS returned — the positive direction "
+ "first, so the deny arm below is a measurement and not a fence that refuses everything",
  ids(visible), ["INFO-2026-0303-doubt"]);

/* The control plane stamps `viewer` SERVER-SIDE, which is the point of that
   stamp: a token it does not recognise never reaches the store at all. So the
   deny path fires at the layer it lives on (VERIFICATION.md 3a) — a direct
   Durable Object call carrying a viewer string `viewerPredicate` does not
   recognise, which is exactly the absent-stamp case index.mjs' list exists to
   prevent from ever arriving. */
const mfStore = new Miniflare({
  modules: true, script: readFileSync(STORE_SRC, "utf8"),
  modulesRoot: "/", scriptPath: STORE_SRC,
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
});
const storeCall = async (path) => o((await (await mfStore.dispatchFetch(`http://x/${path}`)).json()).result);
const storePost = async (path, body) => o((await (await mfStore.dispatchFetch(
  `http://x/${path}`, { method: "POST", body: JSON.stringify(body || {}) })).json()).result);

/* THE FIXTURE IS SEEDED INTO THIS STORE AND ITS NON-EMPTINESS IS PROVED BEFORE
   THE DENY ARM RUNS, AND THAT IS NOT CEREMONY — IT IS THE WHOLE ARM.
   MEASURED BY THIS ITEM'S OWN NEGATIVE CONTROL, which is why the sentence is
   here rather than in a report: the first draft of this section ran the deny arm
   against a FRESH, EMPTY store, so it answered empty for every viewer and PASSED
   FOR FREE. Arm (e) of nc-rec116.mjs — the gate resolution made unconditional —
   came back GREEN at 63/0 having been DECLARED must-fail. The arm was not wrong
   about the fence; the FIXTURE was empty, and an equality that costs nothing to
   produce is not evidence. A surprising green is a finding about your arm. */
const storeMd = bundleMd("INFO-2026-0808-storefence", "information", "verified");
const storeProv = JSON.stringify({ documents: [{ ...NO_ROUTE }] }, null, 2);
await storePost("promote", {
  bundleId: "INFO-2026-0808-storefence", base: null, snapKey: "20260917T000002Z_cccc3333",
  author: "m-riley",
  meta: { object_type: "information", group: "believe-in-oakland", title: "INFO-2026-0808-storefence",
          current_state: "verified", created: NOW, last_updated: NOW },
  files: [{ path: "bundle.md", text: storeMd, bytes: storeMd.length, sha256: sha(storeMd) },
          { path: "data/provenance.json", text: storeProv, bytes: storeProv.length, sha256: sha(storeProv) }],
  register: [],
});
const storeAct = await storePost(
  "provenanceroute?bundleId=INFO-2026-0808-storefence&author=m-riley&viewer=member%3Am-riley", {});
t("E: THE DENY ARM'S FIXTURE IS NON-EMPTY — a document really was marked in THIS store, so an "
+ "empty answer below is a WITHHOLDING and not an empty table",
  [storeAct.ok, o(storeAct.route).marked], [true, true]);

const allowed = await storeCall("provenanceroutes?viewer=member%3Am-riley");
t("E: and a RECOGNISED viewer IS answered with it — the positive direction at this same layer, "
+ "which is what makes the deny arm below a measurement rather than a fence refusing everything",
  ids(allowed), ["INFO-2026-0808-storefence"]);

const denied = await storeCall("provenanceroutes?viewer=not-a-recognised-viewer");
t("E: the deny arm really reached the op rather than a 404 — an arm that did not arm is a finding",
  denied.ok, true);
t("E: an unrecognised viewer is answered EMPTY rather than answered at all",
  arr(denied.documents).length, 0);
t("E: and the census is computed THROUGH THE SAME GATE — it does not report a total the caller "
+ "may not see, which would leak exactly what the withholding exists to withhold",
  [o(denied.census).documents_visible, o(denied.census).assessed], [0, 0]);
t("E: so the cause it gives is the viewer one, not a claim about the record's routes",
  denied.cause, "no_documents_visible");
await mfStore.dispose();

/* =====================================================================
   F. THE BOUND, APPLIED AND PUBLISHED, AND THE CURSOR
   ===================================================================== */
console.log("\n--- F. the bound is applied AND published, and the cursor advances ---");

for (const n of ["0404", "0505", "0606"]) {
  await seedInto(mf, `INFO-2026-${n}-doubt`, [{ ...NO_ROUTE }]);
  await post("provenanceroute", {}, `&bundleId=INFO-2026-${n}-doubt`);
}
const all = o((await get("provenanceroutes")).result);
t("F: four documents now carry a standing marker", all.returned, 4);

const page1 = o((await get("provenanceroutes", "&limit=2")).result);
t("F: the bound is APPLIED", page1.returned, 2);
t("F: and PUBLISHED beside the page — a bound applied and not published is REC-57's defect",
  page1.limit, 2);
t("F: `truncated` is MEASURED by reading one row past the bound, not inferred from a full page — "
+ "and the KEY is the plane's own (`limit`/`truncated`/`cursor`), not a spelling this op invented. "
+ "`meaning-bounds` judged an earlier draft BARE for publishing `more`/`nextAfter`, and it was right",
  page1.truncated, true);
t("F: and the TOTAL standing at this finding is published beside a page that does not hold them "
+ "all, so a caller cannot mistake the page for the answer", o(page1.census).marked, 4);

const page2 = o((await get("provenanceroutes",
  `&limit=2&after=${encodeURIComponent(String(page1.cursor))}`)).result);
t("F: the cursor pages forward", page2.returned, 2);
t("F: with no row repeated across the two pages",
  ids(page1).filter((i) => ids(page2).includes(i)), []);
t("F: and the two pages together are the whole roster",
  [...ids(page1), ...ids(page2)].sort(), ids(all));
t("F: the last page says the bound did NOT bite", page2.truncated, false);

const pastEnd = o((await get("provenanceroutes",
  "&limit=2&after=INFO-2026-9999-zzzz")).result);
t("F: a cursor past the last marked document is EMPTY and says the emptiness is an artefact of "
+ "the cursor rather than a fact about the record — the fourth cause",
  [pastEnd.returned, pastEnd.cause], [0, "page_exhausted"]);
t("F: and it says so in words, naming that documents DO carry markers here",
  /Documents DO carry standing markers/.test(String(pastEnd.says)), true);

const overMax = o((await get("provenanceroutes", "&limit=99999")).result);
t("F: a caller cannot ask past the ceiling", overMax.limit, 200);

/* =====================================================================
   G. COMPLETENESS — never_assessed is published EVEN WHEN THE PAGE IS FULL
   ===================================================================== */
console.log("\n--- G. a roster over a half-assessed corpus says its completeness is undetermined ---");

await seedInto(mf, "INFO-2026-0707-unlooked", [{ ...NO_ROUTE }]);
const partial = o((await get("provenanceroutes")).result);
t("G: the page is NOT empty, so this is not the empty-cause machinery answering",
  partial.returned > 0, true);
t("G: and the answer still reports that one document has NEVER been assessed",
  o(partial.census).never_assessed, 1);
t("G: and states plainly that the roster is not complete over the corpus", partial.complete, false);
t("G: naming NEVER_LOOKED as the absence of the question rather than a finding about the route",
  /NEVER_LOOKED/.test(String(partial.completeness))
  && /says\s+nothing about the rest/.test(String(partial.completeness)), true);
t("G: sparse is the normal condition — absence at one level is not evidence of absence at the "
+ "next, so the two numbers are published side by side rather than collapsed into one",
  [o(partial.census).documents_visible > o(partial.census).assessed,
   typeof partial.completeness === "string"], [true, true]);

/* =====================================================================
   A. THE CONTROL PLANE — asserted LAST, over calls already made
   ===================================================================== */
console.log("\n--- A. the op is reachable through the control plane, and is a READ ---");

const registry = readFileSync(fileURLToPath(new URL("../src/index.mjs", import.meta.url)), "utf8");
t("A: the op is REGISTERED in the control plane's own table", /\bprovenanceroutes:\s*\{/.test(registry), true);
t("A: as a READ — `mutating: false`. For 39 days the only op over this table was the WRITE",
  /provenanceroutes:\s*\{[^}]*mutating:\s*false/.test(registry), true);
t("A: and it is in the viewer-stamp list, so the store fails closed on an absent stamp",
  /\|\|\s*op === "provenanceroutes"/.test(registry), true);
const probe = await mf.dispatchFetch("http://x/api/?op=provenanceroutes&token=prb-p");
t("A: it answers 200 through the worker entry for a probe credential too — every assertion in "
+ "this file went through dispatchFetch and none touched the store directly, because op=invitelook "
+ "shipped with a ReferenceError while 1,276 assertions passed", probe.status, 200);

/* EVERY Miniflare INSTANCE IS DISPOSED. Without this the suite prints its foot
   and then never exits, and the battery hangs on it — a green tally in front of
   a run that never finishes. Found by this suite doing exactly that. */
await mf.dispose();
await mfEmpty.dispose();

console.log(`\nREC-116 route-marked roster: ${pass} passing, ${fail} failing`);
process.exit(fail ? 1 : 0);
