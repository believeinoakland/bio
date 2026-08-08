/* NEGATIVE CONTROL: (all five arms RUN 2026-08-08 by test/nc-rec63.mjs against the FINAL files, each arm armed ALONE with the others held open, every restore verified by sha256 AND by `cmp` against a pristine per-arm copy named uniquely for that arm; the harness lives INSIDE this worktree and never in a shared scratchpad). Baseline for every arm: this suite green, and the FOOT line printed — a suite that dies before its foot reports a clean tally over assertions that never ran.
   (a) THE MARKER REMOVED — in src/store.mjs make `provenanceRouteAssess` record nothing (skip the INSERT) -> the arms that must fail are the ones showing a `verified` row that says nothing about what could not be shown: op=list still answers `NEVER_LOOKED` for a document that was just assessed as unshowable, op=audit's `route.tally.LOOKED_INDETERMINATE` stays 0 while the document sits at `verified`, and the act itself reports `marked: false`. DECLARED MUST-FAIL. Result recorded in nc-rec63.mjs's output.
   (b) THE ARM THIS ITEM TURNS ON — make the ABSENT case indistinguishable from the NOTHING-TO-REPORT case: in `Store.routeFinding`, return the SAME object for "no assessment ever ran" as for "assessed and the route is showable" (drop the NEVER_LOOKED branch and answer `PRESENT` when there is no mark). DECLARED MUST-FAIL: the arms that tell the two absences apart. A consumer would then read "nobody looked" as "we looked and it is fine", which is the overclaim-through-omission DEC-56/57/58 were ruled against.
   (c) THE OVER-STRICTNESS ARM — a verification whose route CAN be shown must carry NO marker and must NOT be refused. Make `provenanceRouteAssess` mark unconditionally (finding always LOOKED_INDETERMINATE). DECLARED MUST-FAIL: the good-chain arms. DECLARED MUST-NOT-FAIL: everything in section A, which is why this arm is run alone — an item that only ever fails in one direction has not shown its subject is the thing being measured.
   (d) THE PUBLICATION ARM (REC-74's defect, one field over) — keep the marker in the table and stop publishing it: drop `route` from `listBundles`'s rows. DECLARED MUST-FAIL: every op=list arm. The point of the arm is that the store still HOLDS the marker and the record has still gone silent for anybody who was not there.
   (e) THE CLASS SWEEP'S OWN REACH, AS A DELTA — neuter `silentCatches()` so it returns an empty roster. DECLARED MUST-FAIL: the sweep's delta arms, because a walk that finds nothing reports a beautiful roster of zero over an empty corpus. The sweep is ALSO run against a source carrying a PLANTED extra silent catch and required to find it, so its reach is proved against a real defect at a real site rather than against an absolute.
*/

/* REC-63 / DEC-56 / D-204 — THE STANDING MARKER AT `verified`.
 *
 * Bob ruled the principle across DEC-56/57/58 together, 2026-08-06: ACT, AND SAY
 * WHAT YOU COULD NOT ESTABLISH. Applied to a provenance chain that cannot be
 * reconstructed it settles a SHAPE: not a `verified -> collected` retraction
 * edge, and not silence — a standing marker at `verified` saying the route
 * cannot be shown.
 *
 * WHAT THIS SUITE ASSERTS, in the order the questions matter:
 *
 *   A. THE ACT. A document whose route cannot be shown gains a marker, and
 *      NOTHING ELSE MOVES — same state, same bundle_sha, same register bytes.
 *   B. THE PUBLICATION, which is the item's hard half. A marker only the store
 *      can see is not a marker (REC-74's defect one field over: a condition
 *      written by one op and published by none). So the finding is asserted on
 *      the reads a member uses — op=list (both arms), op=audit, op=provenancechain.
 *   C. THE TWO ABSENCES. A consumer must be able to tell "the route cannot be
 *      shown" from "nobody looked". This is the arm the item turns on.
 *   D. THE OTHER DIRECTION. A route that CAN be shown carries no marker and is
 *      not refused, so the two cannot collapse that way either.
 *   E. NO RETRACTION EDGE. The shape Bob's principle rejected is PINNED OUT
 *      rather than merely not built.
 *   F. DEC-49. Four codes, four C-numbers, four canned translations, read from
 *      the family rather than typed here.
 *   G. DEC-19 IN THE MECHANISM. Correction moves FORWARD: a route later shown
 *      APPENDS a row and the marker that stood before it is still readable.
 *   H. D-113, PROVED BY CONSEQUENCE rather than structurally.
 *   I. THE CLASS SWEEP — which other acts complete while something could not be
 *      established, and say nothing.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { STATES, ROUTE_MARK_CHECKS } from "../checks/bio-checks.mjs";
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
/* DEFENSIVE READS, and the reason is recorded rather than assumed: a TypeError
   inside an assertion goes through NO assertion at all — it ends the module
   while the count still reads clean. Every accessor below tolerates a neutered
   subject so an armed control produces a readable FAILING assertion instead of
   a dead run. */
const o = (v) => (v && typeof v === "object" ? v : {});
const arr = (v) => (Array.isArray(v) ? v : []);
const routeOf = (v) => o(o(v).route);

const NOW = "2026-08-08T00:00:00Z";

/* The evidence shape a real capture carries — a locator, an instant, a method,
   an actor class and a sha. This one's route CAN be derived, so it is the
   over-strictness fixture as well as the control on section A. */
const DERIVABLE = {
  file: "snapshots/capture-2026-07-19-doc.pdf",
  locator: "https://www.example.gov/reports/acfr.pdf",
  authority: "Example Finance Department",
  retrieved: "2026-07-19T19:15:50Z",
  capture: { method: "daemon-fetch", grade: "B", actor_class: "daemon", sha256: "a".repeat(64) },
};

/* A document with NO route recorded at all. This is the one DEC-56 is about:
   the bytes may be exactly what was captured, and what cannot be shown is the
   ROUTE — a statement about our evidence rather than about the document. */
const NO_ROUTE = {
  file: "snapshots/mystery.pdf",
  locator: "",
  capture: { grade: "C" },
};

const bundleMd = (id, type, state) =>
  `---\nid: ${id}\nobject_type: ${type}\ncurrent_state: ${state}\n---\n\n# ${id}\n`;

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  bindings: { ADMIN_TOKEN: "adm-p", MEMBER_TOKEN: "mem-p", PROBE_TOKEN: "prb-p",
              VERSION: "test", INSTANCE_NAME: "testinstance" },
});
const post = async (op, body, qs = "") => (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=mem-p${qs}`, { method: "POST", body: JSON.stringify(body || {}) })).json();
const get = async (op, qs = "") => (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=mem-p${qs}`)).json();

const seed = async (id, docs, { state = "verified", type = "information" } = {}) => {
  const body = bundleMd(id, type, state);
  const files = [{ path: "bundle.md", text: body, bytes: body.length, sha256: sha(body) }];
  if (docs !== null) {
    const prov = JSON.stringify({ documents: docs }, null, 2);
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  return post("promote", {
    bundleId: id, base: null, snapKey: "20260808T000000Z_aaaa1111", author: "m-riley",
    meta: { object_type: type, group: "believe-in-oakland", title: id,
            current_state: state, created: NOW, last_updated: NOW },
    files, register: [],
  });
};
const listRow = async (id) => {
  const rows = arr((await get("list")).result);
  return rows.find((r) => r && r.bundle_id === id) || null;
};
const imageOf = async (id) => o((await get("image", `&id=${encodeURIComponent(id)}`)).result);

/* =====================================================================
   A. THE ACT — the marker lands and NOTHING ELSE MOVES
   ===================================================================== */
console.log("\n--- A. a document whose route cannot be shown gains a marker, and stays exactly where it is ---");

await seed("INFO-2026-0101-noroute", [{ ...NO_ROUTE }]);

const beforeRow = await listRow("INFO-2026-0101-noroute");
/* ASSERT THE FIXTURE IS NON-EMPTY BEFORE ASSERTING ANYTHING ABOUT IT. A
   headline assertion that passed over an empty corpus is a measured failure in
   this repository, and every arm below reads through this row. */
t("the fixture is really in the store before anything is asserted about it", !!beforeRow, true);
t("and it is at verified", o(beforeRow).current_state, "verified");
t("before any assessment, the read says NOBODY LOOKED", routeOf(beforeRow).finding, "NEVER_LOOKED");
t("which is not a marker", routeOf(beforeRow).marked, false);
t("and says in words that the question was never asked",
  /has ever been recorded/.test(String(routeOf(beforeRow).note)), true);

const beforeImage = await imageOf("INFO-2026-0101-noroute");
const beforeAudit = o((await get("audit")).result);
t("the audit is reachable before the marker exists", beforeAudit.ok, true);
t("and reports nothing marked yet", o(o(beforeAudit.route).tally).LOOKED_INDETERMINATE, 0);

const act = o((await post("provenanceroute", {}, "&bundleId=INFO-2026-0101-noroute")).result);
t("the act succeeds — it does not refuse the member's work", act.ok, true);
t("and it appended a marker", act.appended, true);
t("the finding is D-129's we-looked-and-could-not-tell", routeOf(act).finding, "LOOKED_INDETERMINATE");
t("and its meaning is the vocabulary's own sentence, not a fifth private spelling",
  routeOf(act).means, OBSERVATION_STATES.LOOKED_INDETERMINATE);
t("it is a MARKER", routeOf(act).marked, true);
t("naming which document could not be shown", o(arr(act.documents)[0]).outcome, "undetermined");
t("and what was missing rather than guessing", arr(o(arr(act.documents)[0]).missing).length > 0, true);

const afterRow = await listRow("INFO-2026-0101-noroute");
/* THE WHOLE OF DEC-56(b): the document stays where the group put it. */
t("the state did NOT move", o(afterRow).current_state, "verified");
t("no byte of the document changed — same bundle_sha", o(afterRow).bundle_sha, o(beforeRow).bundle_sha);
t("and the register is byte-identical: no chain was invented into it",
  (await imageOf("INFO-2026-0101-noroute"))["data/provenance.json"], beforeImage["data/provenance.json"]);
t("the marker records the state it was made at, so the disagreement is readable later",
  routeOf(afterRow).stateAt, "verified");
t("and carries the standing sentence that says the two disagree ON PURPOSE",
  /disagree deliberately/.test(String(routeOf(afterRow).note)), true);
t("which also says the record corrects FORWARD rather than un-saying the verification",
  /corrects FORWARD/.test(String(routeOf(afterRow).note)), true);

/* =====================================================================
   B. THE PUBLICATION — which reads publish it
   =====================================================================
   REC-74 is running on exactly this failure one field over: a run condition
   WRITTEN by one op and PUBLISHED by none. A marker nobody can see is not a
   marker, so each read a member actually uses is asserted here by name. */
console.log("\n--- B. the marker is published by the reads a member uses, not only stored ---");

t("op=list — the roster read, and the most-called bundle read in app.html",
  routeOf(afterRow).marked, true);
t("it names WHO made the assessment", typeof routeOf(afterRow).by === "string" && routeOf(afterRow).by.length > 0, true);
t("and WHEN", typeof routeOf(afterRow).at === "string" && routeOf(afterRow).at.length > 0, true);

const paged = o((await get("list", "&limit=50")).result);
const pagedRow = arr(paged.bundles).find((r) => o(r).bundle_id === "INFO-2026-0101-noroute");
t("op=list's PAGED arm publishes it too — the two arms of one op cannot disagree",
  routeOf(pagedRow).marked, true);
t("and the paged arm's finding is the same one", routeOf(pagedRow).finding, routeOf(afterRow).finding);

const audit = o((await get("audit")).result);
t("op=audit reports the marker", o(o(audit.route).tally).LOOKED_INDETERMINATE, 1);
t("naming the bundle", o(arr(o(audit.route).marked)[0]).bundleId, "INFO-2026-0101-noroute");
t("with its STATE beside the finding, which is what makes the disagreement legible",
  o(arr(o(audit.route).marked)[0]).state, "verified");
t("and a sentence saying these are stated doubts and not conformance errors",
  /STATED DOUBTS, not conformance errors/.test(String(o(audit.route).note)), true);
/* A MARKER IS NOT AN ERROR, and this is the arm that keeps `op=audit` clean
   reachable for an honest store. If a recorded doubt made the audit dirty, the
   honest act would break CLAUDE.md's own last gate. */
t("the audit's own verdict does not move", audit.ok, beforeAudit.ok);
t("nor its error tally", JSON.stringify(audit.tally), JSON.stringify(beforeAudit.tally));
t("nor its count of bundles with errors", audit.withErrors, beforeAudit.withErrors);
t("the bound it applied is still published beside the marker (REC-57)", typeof audit.limit, "number");
t("and the marked list publishes its own bound rather than applying one silently",
  typeof o(audit.route).markedTotal === "number" && typeof o(audit.route).markedShown === "number", true);

const chain = o((await post("provenancechain", {}, "&bundleId=INFO-2026-0101-noroute")).result);
t("op=provenancechain REFUSES to invent a chain, exactly as before", chain.reason, "EVIDENCE_INSUFFICIENT");
t("and now names the honest route D-204 said did not exist",
  /op=provenanceroute/.test(String(chain.detail)), true);
t("saying the document stays where it is", /leaving the document where it is/.test(String(chain.detail)), true);
t("while still refusing to state a route it cannot show",
  /would be an invention/.test(String(chain.detail)), true);
t("and the refusal carries the marker itself, so the two ops cannot disagree",
  routeOf(chain).marked, true);

/* =====================================================================
   C. THE TWO ABSENCES — the arm this item turns on
   ===================================================================== */
console.log("\n--- C. a consumer can tell THE ROUTE CANNOT BE SHOWN from NOBODY LOOKED ---");

await seed("INFO-2026-0102-unlooked", [{ ...NO_ROUTE }]);
const unlooked = await listRow("INFO-2026-0102-unlooked");
t("the second fixture is really in the store", !!unlooked, true);
/* The two documents are IDENTICAL in every respect a reader can see except
   that one has been assessed. That is the whole point of the pair: if the
   finding were absent-when-unmarked, these two would read alike. */
t("nobody looked at this one", routeOf(unlooked).finding, "NEVER_LOOKED");
t("the other one was looked at and could not be shown", routeOf(afterRow).finding, "LOOKED_INDETERMINATE");
t("SO THE TWO ABSENCES ARE DISTINGUISHABLE ON THE READ",
  routeOf(unlooked).finding === routeOf(afterRow).finding, false);
t("and neither is published as an absent field, which is how they would collapse",
  "route" in o(unlooked) && "route" in o(afterRow), true);
t("the unassessed one says plainly it is NOT a finding that the route cannot be shown",
  /NOT a finding that the route cannot be shown/.test(String(routeOf(unlooked).note)), true);
t("`assessed` says which of the two it is on its own", [routeOf(unlooked).assessed, routeOf(afterRow).assessed], [false, true]);
t("`marked` is false for both, so `marked` ALONE cannot tell them apart — the finding is what does",
  [routeOf(unlooked).marked, routeOf(afterRow).marked], [false, true]);

const auditC = o((await get("audit")).result);
t("and the audit distinguishes them in aggregate: one marked",
  o(o(auditC.route).tally).LOOKED_INDETERMINATE, 1);
t("one nobody looked at", o(o(auditC.route).tally).NEVER_LOOKED >= 1, true);
t("with the vocabulary's meanings travelling with the tally so a surface need not invent them",
  o(o(auditC.route).means).NEVER_LOOKED, OBSERVATION_STATES.NEVER_LOOKED);

/* =====================================================================
   D. THE OTHER DIRECTION — a route that CAN be shown carries no marker
   ===================================================================== */
console.log("\n--- D. a verification whose route CAN be shown is neither marked nor refused ---");

await seed("INFO-2026-0103-derivable", [{ ...DERIVABLE }]);
const good = o((await post("provenanceroute", {}, "&bundleId=INFO-2026-0103-derivable")).result);
t("the act is NOT REFUSED for a good document", good.ok, true);
t("and it records that the route can be shown", routeOf(good).finding, "PRESENT");
t("carrying NO marker", routeOf(good).marked, false);
t("the per-document outcome says the route is derivable from what the register holds",
  o(arr(good.documents)[0]).outcome, "derivable");
const goodRow = await listRow("INFO-2026-0103-derivable");
t("and the roster read agrees", routeOf(goodRow).marked, false);
t("while still saying it was ASSESSED — which is the third state, not the absence of one",
  [routeOf(goodRow).assessed, routeOf(goodRow).finding], [true, "PRESENT"]);

/* A document that already RECORDS a witnessed chain is showable without any
   derivation at all, and must read the same way. */
await seed("INFO-2026-0104-recorded", [{ ...NO_ROUTE, provenance_chain: [
  { who: "Internet Archive Wayback Machine", asserts: "served the replay",
    evidence: "CDX record", bound: false, via: "archive.org" }] }]);
const recorded = o((await post("provenanceroute", {}, "&bundleId=INFO-2026-0104-recorded")).result);
t("a document whose chain is already RECORDED shows its route", routeOf(recorded).finding, "PRESENT");
t("and the outcome says it was recorded rather than derived",
  o(arr(recorded.documents)[0]).outcome, "recorded");

const auditD = o((await get("audit")).result);
t("the audit still names exactly ONE marked document out of four",
  o(auditD.route).markedTotal, 1);
t("and counts the showable ones as showable rather than as doubts",
  o(o(auditD.route).tally).PRESENT, 2);

/* =====================================================================
   E. NO RETRACTION EDGE — the shape Bob's principle rejected, PINNED OUT
   ===================================================================== */
console.log("\n--- E. no `verified -> collected` retraction edge was added (DEC-19: correction moves forward) ---");
{
  const storeSrc = readFileSync(STORE_SRC, "utf8");
  const idxSrc = readFileSync(IDX, "utf8");
  /* The shape READ OFF THE TABLE at the time of writing, corrected from the
     first draft's guess: `retired: []` is there too, and it is the terminal
     rung saying so explicitly rather than by omission. Pinning the guess would
     have made this arm fail for a reason that has nothing to do with DEC-56. */
  t("the Information state machine still has exactly the edges it had",
    JSON.stringify(STATES.information.edges),
    JSON.stringify({ collected: ["verified"], verified: ["retired"], retired: [] }));
  t("verified still leads only to retired", arr(o(STATES.information.edges).verified), ["retired"]);
  t("and nothing added a way back to collected",
    arr(o(STATES.information.edges).verified).includes("collected"), false);
  /* The op table is where a retraction would have to surface to be usable, so
     it is asserted there too rather than only in the state table. */
  t("no un-verify or retract op appeared in the control plane",
    /\b(unverify|retract|unrelease|deverify)\s*:/.test(idxSrc), false);
  t("and the marker path writes no state at all — it names no current_state assignment",
    /provenanceRouteAssess[\s\S]{0,6000}?UPDATE bundles SET current_state/.test(storeSrc), false);
}

/* =====================================================================
   F. DEC-49 — every refusable condition carries a code with a translation
   ===================================================================== */
console.log("\n--- F. the four door refusals, each with its C-number and canned translation ---");
{
  const rows = ROUTE_MARK_CHECKS;
  t("the family is non-empty before anything is asserted about it", Object.keys(rows).length, 4);

  /* THE C-NUMBER IS PINNED AGAINST WHAT THE PLANE SENT OVER THE WIRE, as a
     LITERAL, and separately against the registry the refusal was built from.
     PL-1's discipline: a pin that only compares the answer to the table it came
     out of agrees with itself at zero cost. */
  const noBundle = o((await post("provenanceroute", {})).result);
  t("no target is refused by code", noBundle.reason, "ROUTE_MARK_NO_BUNDLE");
  t("naming C-34.2 on the wire", noBundle.check, "C-34.2");
  t("and the same check the family holds", noBundle.check, rows.ROUTE_MARK_NO_BUNDLE.check);
  t("and carrying the canned translation from the family rather than a sentence written here",
    noBundle.translation, rows.ROUTE_MARK_NO_BUNDLE.translation);

  const absent = o((await post("provenanceroute", {}, "&bundleId=INFO-2026-9999-nope")).result);
  t("a document nobody can see refuses exactly as an absent one", absent.reason, "ROUTE_MARK_NO_SUCH_BUNDLE");
  t("naming C-34.3 on the wire", absent.check, "C-34.3");
  t("and the same check the family holds", absent.check, rows.ROUTE_MARK_NO_SUCH_BUNDLE.check);
  t("with its translation", absent.translation, rows.ROUTE_MARK_NO_SUCH_BUNDLE.translation);

  await seed("INQ-2026-0105-question", null, { state: "open", type: "inquiry" });
  const notDoc = o((await post("provenanceroute", {}, "&bundleId=INQ-2026-0105-question")).result);
  t("a question is refused: it never travelled a route to get here", notDoc.reason, "ROUTE_MARK_NOT_A_DOCUMENT");
  t("naming C-34.4 on the wire", notDoc.check, "C-34.4");
  t("and the same check the family holds", notDoc.check, rows.ROUTE_MARK_NOT_A_DOCUMENT.check);
  t("with its translation", notDoc.translation, rows.ROUTE_MARK_NOT_A_DOCUMENT.translation);
  /* AND THE OVER-STRICTNESS HALF OF THAT: it must not read as a doubt either. */
  const inqRow = await listRow("INQ-2026-0105-question");
  t("and the roster read says the question is NOT the kind of thing a route applies to",
    routeOf(inqRow).applies, false);
  t("rather than reporting a doubt about it", routeOf(inqRow).marked, false);
  t("or claiming nobody looked at something there was nothing to look for",
    routeOf(inqRow).finding, null);

  /* C-34.1 cannot be reached through the control plane — index.mjs stamps the
     author on every call, which is the point of that stamp. It is asserted at
     the layer where it fires (VERIFICATION.md 3a). */
  const mfStore = new Miniflare({
    modules: true, script: readFileSync(STORE_SRC, "utf8"),
    modulesRoot: "/", scriptPath: STORE_SRC,
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
  });
  const noAuthor = o((await (await mfStore.dispatchFetch(
    "http://x/provenanceroute?bundleId=X", { method: "POST", body: "{}" })).json()).result);
  t("an act with no principal at all is refused at the store", noAuthor.reason, "ROUTE_MARK_NO_AUTHOR");
  t("naming C-34.1 on the wire", noAuthor.check, "C-34.1");
  t("and the same check the family holds", noAuthor.check, rows.ROUTE_MARK_NO_AUTHOR.check);
  t("with its translation", noAuthor.translation, rows.ROUTE_MARK_NO_AUTHOR.translation);
  t("and it says plainly that it is NOT a machine fence, so nobody reads one that is not there",
    /deliberately not a machine one/.test(String(noAuthor.detail)), true);
  await mfStore.dispose();

  /* Every row is reachable and every row is translated — asserted over the
     family rather than over the four the arms above happened to hit. */
  const codes = Object.keys(rows).sort();
  t("every code in the family carries a C-number", codes.every((c) => /^C-34\.\d+$/.test(rows[c].check)), true);
  t("every code carries a canned translation of real length",
    codes.every((c) => typeof rows[c].translation === "string" && rows[c].translation.split(/\s+/).length >= 8), true);
  t("no translation restates the machine code back at the member",
    codes.some((c) => rows[c].translation.includes(c)), false);
  t("and every row's `where` names the REGION rather than the whole function",
    codes.every((c) => / > is-route-mark$/.test(rows[c].where)), true);
}

/* =====================================================================
   G. DEC-19 IN THE MECHANISM — correction moves FORWARD
   ===================================================================== */
console.log("\n--- G. a route later shown APPENDS; the marker that stood is not deleted ---");
{
  const before = o((await get("stats")).result).routeMarks;
  t("the marker table is counted in op=stats at all", typeof before, "number");

  const again = o((await post("provenanceroute", {}, "&bundleId=INFO-2026-0101-noroute")).result);
  t("re-assessing and finding the same thing appends NOTHING", again.appended, false);
  t("and says why rather than looking like a failure", /nothing was appended/.test(String(again.detail)), true);
  t("the count did not move", o((await get("stats")).result).routeMarks, before);

  /* Now the route BECOMES showable — a member records the custody the register
     was missing — and the record must ADD rather than un-say. */
  const prov = JSON.stringify({ documents: [{ ...NO_ROUTE, ...DERIVABLE }] }, null, 2);
  const md = bundleMd("INFO-2026-0101-noroute", "information", "verified");
  const cur = await listRow("INFO-2026-0101-noroute");
  await post("promote", {
    bundleId: "INFO-2026-0101-noroute", base: o(cur).bundle_sha, snapKey: "20260808T000001Z_bbbb2222",
    author: "m-riley",
    meta: { object_type: "information", group: "believe-in-oakland", title: "INFO-2026-0101-noroute",
            current_state: "verified", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }],
  });
  const shown = o((await post("provenanceroute", {}, "&bundleId=INFO-2026-0101-noroute")).result);
  t("the new assessment finds the route showable", routeOf(shown).finding, "PRESENT");
  t("it APPENDED rather than edited", shown.appended, true);
  t("the record now holds MORE rows, not fewer — nothing was un-said",
    o((await get("stats")).result).routeMarks > before, true);
  t("and the current finding is the newest one", routeOf(await listRow("INFO-2026-0101-noroute")).seq, 2);
  t("the roster read no longer shows a marker", routeOf(await listRow("INFO-2026-0101-noroute")).marked, false);
}

/* =====================================================================
   H. D-113, PROVED BY CONSEQUENCE
   =====================================================================
   Hygiene's structural check compares TABLE LISTS and therefore cannot see half
   of the defect it exists for. The consequence a leftover marker would have is
   the sharpest form of it: a doubt recorded about one document attaching itself
   to whatever bundle is next allocated that id. */
console.log("\n--- H. a purged document takes its markers with it, proved by consequence ---");
{
  const before = o((await get("stats")).result).routeMarks;
  t("there are markers to lose before the purge is asserted to take any", before > 0, true);
  /* Through the ADMIN token and with the confirm the op requires: `purge` is
     admin/probe only, and a member call is refused by the control plane —
     which the first draft of this arm discovered by asserting over a purge
     that never happened. Recorded rather than smoothed: an arm that never
     armed is this repository's most-repeated control defect. */
  const purged = o((await (await mf.dispatchFetch(
    "http://x/api/?op=purge&token=adm-p&confirm=bio&bundleId=INFO-2026-0101-noroute",
    { method: "POST", body: "{}" })).json()).result);
  t("the purge actually ran rather than being refused at the door", purged.ok, true);
  t("and it names this document as its scope", purged.scope, "INFO-2026-0101-noroute");
  const after = o((await get("stats")).result).routeMarks;
  t("purging one document removed ITS markers", after < before, true);

  /* THE CONSEQUENCE. A new document allocated the same id must start from
     NOBODY LOOKED, never inherit somebody else's doubt. */
  await seed("INFO-2026-0101-noroute", [{ ...DERIVABLE }]);
  const reborn = await listRow("INFO-2026-0101-noroute");
  t("a document later allocated that id inherits NO doubt", routeOf(reborn).marked, false);
  t("and starts from nobody-looked rather than from a stranger's finding",
    routeOf(reborn).finding, "NEVER_LOOKED");
}

/* =====================================================================
   I. THE CLASS SWEEP — acts that complete while something could not be
      established, and say nothing
   =====================================================================
   Bob's principle is general: ACT, AND SAY WHAT YOU COULD NOT ESTABLISH. The
   mechanical shape of the failure in this plane is a SWALLOWED READ — a `catch`
   that turns a thing the plane could not establish into a normal-looking answer.
   Some of them SAY so; most do not.

   The roster is a RATCHET rather than a verdict: this sweep does not claim to
   judge which swallows are honest (that is a reading, not a measurement), it
   claims that the number cannot GROW without somebody looking at the new one.
   The reach is asserted as a DELTA against a source carrying a planted swallow,
   because a walk that finds nothing reports a beautiful roster of zero. */
console.log("\n--- I. the class: reads whose failure is swallowed, pinned as a ratchet with its reach ---");
{
  /* Comment-stripped, because this file's own prose is full of the word. */
  const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const silentCatches = (src) => [...strip(src).matchAll(/\bcatch\s*(?:\([^)]*\))?\s*\{/g)].map((m) => m.index);

  const real = readFileSync(STORE_SRC, "utf8");
  const found = silentCatches(real);
  /* NON-EMPTY FIRST. A sweep asserting a ceiling over an empty corpus passes
     everything, which is a measured failure in this repository. */
  t("the sweep's corpus is non-empty", found.length > 0, true);
  /* THE RATCHET, and the figure is the one this walk PRINTED rather than one
     anybody added up: 23 on this tree, of which ONE is this item's own — and
     that one is the class's remedy demonstrated rather than described, because
     `register_state` publishes exactly which failure the swallowed read met.
     A hand count of `catch {` answers 18 and is FIVE SHORT: it cannot see
     `catch (e) {`, which is the same one-vocabulary trap REC-70 measured at the
     root of its own classifier. The number may FALL freely; it may not RISE
     without somebody looking at the new one. */
  /* MOVED 23 -> 24 by CPDF-10 (2026-08-08), from the figure THIS WALK PRINTED,
     and the rule this ratchet states is that a rise needs somebody to have
     LOOKED AT THE NEW ONE. Looked at, and it is one site: `safeJson` at the top
     of `store.mjs` -- a column this store itself WROTE as JSON, read back.
     WHY IT IS THE CLASS'S REMEDY AND NOT A NEW INSTANCE OF IT. The defect this
     sweep is pointed at is a catch that turns something the plane could not
     establish into a NORMAL-LOOKING ANSWER. `safeJson` returns null, and every
     one of its callers SURFACES that null as a stated absence rather than
     smoothing it: `readingFor` publishes `{recorded:false, why:"...nobody
     recorded how it was produced"}` -- which it distinguishes, deliberately,
     from "this text was not transcribed" -- and `attestationsFor` publishes a
     null chain and reports `stale:false` rather than inventing a comparison
     nobody made. It also REPLACED two ad-hoc `try { JSON.parse } catch {}`
     blocks written earlier in the same item, so the item's own net contribution
     to this roster is one site instead of three.
     WHY IT IS A CATCH AT ALL: there is no non-throwing JSON parse, and the
     alternative -- letting it throw -- ends a projection with no answer at all,
     which is a worse finding than a null a caller can see and publish. */
  const CEILING = 24;
  t(`swallowed reads in store.mjs are at or below the ratchet (${found.length} of ${CEILING})`,
    found.length <= CEILING, true);

  /* THE REACH, AS A DELTA. A planted swallow at a real site must be found. */
  const planted = real.replace("const documents = [];",
    "let __x = null; try { __x = JSON.parse('{'); } catch { __x = null; }\n    const documents = [];");
  t("the planted swallow really changed the source", planted !== real, true);
  t("and the sweep FINDS it — its reach is a delta, never an absolute",
    silentCatches(planted).length - found.length, 1);
  /* And the stripper is guarded BOTH ways: a stripper that removes everything
     would make every delta read zero. */
  t("the stripper leaves the source substantially intact", strip(real).length > real.length / 3, true);

  /* WHAT THIS ITEM PUBLISHES OF ITS OWN SWALLOW, which is the class's own
     remedy demonstrated once rather than described: the marker names WHICH
     failure the register read met. */
  await seed("INFO-2026-0106-unparsable", null);
  const noReg = o((await post("provenanceroute", {}, "&bundleId=INFO-2026-0106-unparsable")).result);
  t("a document with no register at all is MARKED rather than refused", noReg.ok, true);
  t("because a register we cannot read is precisely a route we cannot show",
    routeOf(noReg).finding, "LOOKED_INDETERMINATE");
  t("and the marker NAMES which failure it met rather than swallowing it",
    routeOf(noReg).register, "absent");
}

await mf.dispose();

/* THE FOOT. A suite that dies before here reports a clean tally over assertions
   that never ran — a TypeError inside an assertion goes through NO assertion at
   all. The line below is the evidence the run reached its own end. */
console.log(`\nFOOT REACHED — provenance-marker.test.mjs ran to its end`);
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
