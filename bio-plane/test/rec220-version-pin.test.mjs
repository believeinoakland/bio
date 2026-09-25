/* NEGATIVE CONTROL: `node test/nc-rec220.mjs [arm]` from `bio-plane/` re-runs every arm in one step; each EDITS `src/store.mjs` ALONE (one patch, match count exactly 1, reported), restored from a uniquely-named per-arm pristine copy in the gitignored pen `.rec220-control-pristine/`, verified by sha256 AND cmp with the byte count floored. Declared before arming and ALL FIVE CAME BACK AS DECLARED on 2026-09-25: (a) `baseline` - nothing armed -> 22 pass, 0 fail. (b) `newest` - THE ROW'S OWN CONTROL: `#captureForContent`'s authored branch ignores the pin and answers the capture the bundle resolves to NOW (the later capture B) -> 18 pass, 4 fail, led by "PIN: the pinned bytes, projected fresh after the later capture, still resolve to the capture they were made against"; section 1 stayed green. THIS ARM CORRECTED ITSELF: first armed as `ORDER BY at DESC` over the resolver's own column, it picked A (that column mixes the SERVER's registration instant with a READING's own date, and B's reading is dated 2020), armed nothing the row names, and the driver printed NOT AS DECLARED. (c) `nostamp` - `op=cite` writes no `extent_capture` -> 15 pass, 7 fail, including every PIN arm: without the pin the fresh projection resolves to B. (d) `carry` - the carry-forward key ignores an authored capture (the pre-item key) -> 21 pass, 1 fail, "AUTHORED: a leg its author re-points to B rests on B". (e) `collapse` - the read says `only_capture` for several captures -> 21 pass, 1 fail, "VERSION: now that two captures are held, the unpinned leg reads `undetermined`". The fixture's own arming assertion ("a leg naming only the bundle, projected now, resolves to the LATER capture B") stayed green in every arm, so no PIN pass is free. */
/* REC-220 — A REFERENCE IS PINNED TO THE VERSION IT WAS MADE AGAINST, AND THE RECORD SAYS WHICH.
 *
 * Bob, 2026-09-25 00:40Z, rule 1 of the version doctrine: *"that reference continues to refer to that
 * version of the content/document."* BOB #34 measured that a basis leg, a cite onto a case or question,
 * and a claim with no `content_id` named only a BUNDLE, so the capture it rested on was a RESOLVER'S
 * answer re-derived at every promotion rather than a fact the record held.
 *
 * WHAT THIS SUITE HOLDS, THROUGH THE OP:
 *   1. A new whole-document citation (`op=cite` onto a question, no part named) STORES its capture sha
 *      in the leg's own bytes (`extent_capture`), says so in the receipt, and the leg's content row is
 *      about that capture.
 *   2. PIN: a LATER capture on the SAME bundle — one whose reading is dated earlier than the first
 *      capture's registration, which MOVES the resolver's earliest-first answer (this suite measures
 *      that it does) — and a re-promotion of the question, does NOT change what the leg resolves to.
 *   3. THE CONTRAST, measured: a leg written WITHOUT a pin (as every leg before this item was) rests on
 *      whatever the resolver answered when its question was FIRST projected, held since by REC-82's
 *      carry-forward in a DERIVED table; the same bytes projected after a later capture rest on
 *      different bytes. That is the existing-legs exposure this item MEASURES and does not back-fill (a
 *      guessed back-fill would be the record inventing which bytes a member read).
 *   4. The act pins nothing it cannot: no pin on a question target, none where a content id is named,
 *      none on a case's citation edge (the case arm has no slot, stated in section 5).
 */
import { withSurfacingRun } from "./surfacing-run.mjs";
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { parseFrontmatter } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r220", MEMBER_TOKEN: "mem-r220", PROBE_TOKEN: "prb-r220", VERSION: "test" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const ok_ = (label, cond, note = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${label}${cond ? "" : `\n         ${note}`}`);
  cond ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r220") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-r220") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";

const inquiryMd = (id, basis = []) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  ...(basis.length ? ["references:", ...basis.flatMap((b) => [`  - rel: cites`, `    target: ${b}`, `    status: confirmed`]),
                      "basis:", ...basis.flatMap((b) => [`  - target: ${b}`, `    role: supports`])]
                   : ["references: []"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "---", "", "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");

const infoMd = (id, rev = 1) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id} r${rev}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", `A captured document, revision ${rev}.`, "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const live = {};
/* CORRECTED at c22-batch30 (CONDUCT #22), never exempted: this item was cut before D-615, whose C-86.7 refuses an
   envelope `created`/`last_updated` the held document contradicts; a fixed NOW/LATER label over bytes the plane had
   re-stamped said dates the document does not state. `datesOf` is D-615's own fixture helper (publish.test.mjs):
   each label names the document's own dates, the old value only where the bytes state none. */
const datesOf = (md, created, lastUpdated) => {
  const fm = /^---\n([\s\S]*?)\n---/.exec(String(md ?? "")), get = (k) => fm && (new RegExp(`^${k}:[ \t]*"?([^"\n]*?)"?[ \t]*$`, "m").exec(fm[1]) || [])[1];
  return { created: get("created") || created, last_updated: get("last_updated") || lastUpdated };
};
const promote = async (id, text, type, register = [], reading = null) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  const r = await post("promote", {
    bundleId: id, base: live[id] ?? null,
    snapKey: `20260925T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    /* CORRECTED at the c22-batch29 union (CONDUCT #22), never exempted: this item was cut before D-563, whose C-86.3 refuses an envelope title the held document contradicts; the envelope title `Bundle <id>` is dropped as D-563 dropped it in its own fixtures, and promote derives it from the document. */
    meta: { object_type: type, group: "believe-in-oakland",
            current_state: type === "inquiry" ? "open" : "collected", ...datesOf(text, NOW, LATER) },
    files, register });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
  live[id] = r.bundleSha ?? r.sha ?? live[id];
  return r;
};
const imageOf = async (id) => (await get("image", `id=${id}`))["bundle.md"];
const refreshLive = async (id) => { const md = await imageOf(id); live[id] = sha(md); return md; };
const cite = async (project, ids, extra = "") => {
  const s = await post("select", { ids });
  if (!s.handle) throw new Error(`select: ${JSON.stringify(s)}`);
  const r = await get("cite", `project=${project}&handle=${s.handle}${extra}`);
  await refreshLive(project);
  return r;
};
const legsOf = async (id) => parseFrontmatter(await imageOf(id)).data.basis ?? [];
/* THE READ A SURFACE REACHES: op=earnedbasis names each leg's content row, and op=content answers
   which capture that row is about. Both are asked; neither is inferred from the act's echo. */
const legCapture = async (inq, target) => {
  const eb = await get("earnedbasis", `id=${inq}`);
  const leg = (eb.legs || []).find((l) => l.target === target);
  if (!leg || !leg.content_id) return { cid: null, capture: null, version: leg?.version ?? null };
  const c = await get("content", `id=${leg.content_id}`);
  return { cid: leg.content_id, capture: c.capture_sha ?? c.row?.capture_sha ?? c.content?.capture_sha ?? null,
           version: leg.version ?? null };
};

/* ===================== 0. THE GROUND ==================================== */
console.log("--- 0. the ground: one document, one capture; three questions ---");
const DOC = "INFO-2026-9220-doc";
const OTHER = "INFO-2026-9220-other";
const A = sha("rec220-capture-A"), B = sha("rec220-capture-B"), O = sha("rec220-capture-O");
const reg = (s, path) => ({ sha256: s, path, encoding: "binary", bytes: 10 });
await promote(DOC, infoMd(DOC, 1), "information", [reg(A, "captures/doc.pdf")]);
await promote(OTHER, infoMd(OTHER, 1), "information", [reg(O, "captures/other.pdf")]);
await refreshLive(DOC); await refreshLive(OTHER);
const Q1 = "INQ-2026-9220-pinned", Q2 = "INQ-2026-9220-unpinned", Q3 = "INQ-2026-9220-question";
await promote(Q1, inquiryMd(Q1), "inquiry"); await refreshLive(Q1);
await promote(Q3, inquiryMd(Q3), "inquiry"); await refreshLive(Q3);
/* Q2 is the PRE-ITEM SHAPE: a leg authored in the bytes and promoted, naming only the bundle. */
await promote(Q2, inquiryMd(Q2, [DOC]), "inquiry"); await refreshLive(Q2);
console.log(`  corpus: 2 documents (captures A=${A.slice(0, 8)} O=${O.slice(0, 8)}), 3 questions`);
ok_("the ground is non-empty", !!live[DOC] && !!live[Q1] && !!live[Q2], JSON.stringify(live));

/* ===================== 1. THE ACT RECORDS THE CAPTURE ==================== */
console.log("\n--- 1. a whole-document citation STORES the capture it was made against ---");
const r1 = await cite(Q1, [DOC], "&role=supports&note=pinned at the act");
t("the act is accepted and cites the document", [r1.ok, r1.cited], [true, [DOC]]);
const l1 = await legsOf(Q1);
t("the leg's own bytes name the capture it was made against",
  l1.map((l) => [l.target, l.extent_capture ?? null]), [[DOC, A]]);
t("the receipt states the capture the act PINNED, per leg",
  (r1.legs || []).map((l) => [l.target, l.pinned_capture]), [[DOC, A]]);
const c1 = await legCapture(Q1, DOC);
t("and the leg's content row is about that capture (op=earnedbasis -> op=content)", c1.capture, A);
const c2a = await legCapture(Q2, DOC);
t("the unpinned pre-item leg resolves to the same capture while it is the only one", c2a.capture, A);
t("VERSION: the pinned leg reads `pinned` by its extent_capture, naming A",
  c1.version, { state: "pinned", by: "extent_capture", capture: A });
t("VERSION: the unpinned leg reads `only_capture` while the record holds one capture",
  c2a.version, { state: "only_capture", capture: A });

/* ===================== 2. PIN: A LATER CAPTURE DOES NOT MOVE IT ========== */
console.log("\n--- 2. a later capture on the SAME bundle, dated earlier by its own reading ---");
/* Revision 2 carries a NEW capture B, held through a provenance document whose reading is dated by the
   DOCUMENT'S OWN instant — here earlier than when the record registered A. The resolver's "earliest"
   order compares `register.registered` (the SERVER's instant) with `readings.at` (the READING's own,
   from the provenance bytes) in one column, so a later capture of an older-dated document sorts FIRST.
   First drafted as a RE-REGISTRATION of A instead; that did NOT move the resolver (measured, the arm
   below failed for it), so the hypothesis was dropped rather than kept. */
await promote(DOC, infoMd(DOC, 2), "information", [], {
  capture: { sha256: B, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: false, at: "2020-01-01T00:00:00Z",
             entities: [], facts: {} } });
await refreshLive(DOC);
/* THE RESOLVER'S ANSWER HAS MOVED: a leg naming only the bundle, projected FRESH now, rests on B. */
const Q4 = "INQ-2026-9220-freshunpinned";
await promote(Q4, inquiryMd(Q4, [DOC]), "inquiry"); await refreshLive(Q4);
const c4 = await legCapture(Q4, DOC);
/* THE FIXTURE ARMS THE PIN, asserted rather than assumed: if the resolver still answered A here, every
   PIN assertion below would pass for free (an equality that costs nothing to produce). First drafted
   with a RE-REGISTRATION of A as the move; that did not move the resolver (measured), so it was dropped. */
ok_("the fixture ARMS the pin: a leg naming only the bundle, projected now, resolves to the LATER capture B",
  c4.capture === B, `resolved ${c4.capture}`);

/* THE PIN IN THE BYTES, with no projection to lean on. REC-82's carry-forward keeps an EXISTING row's
   referent across re-promotions of the SAME question — a pin held in a DERIVED table. This copies Q1's
   bytes into a NEW question, so there is no prior row to carry and only what the bytes say decides. */
const Q5 = "INQ-2026-9220-pinnedcopy";
const q1md = await imageOf(Q1);
await promote(Q5, q1md.replace(new RegExp(Q1, "g"), Q5), "inquiry"); await refreshLive(Q5);
const c5p = await legCapture(Q5, DOC);
t("PIN: the pinned bytes, projected fresh after the later capture, still resolve to the capture they were made against",
  c5p.capture, A);
t("PIN: to the very same content row", c5p.cid, c1.cid);
/* And in place: the question re-promoted through the act. */
await cite(Q1, [OTHER], "&role=supports&note=a second leg");
const c1b = await legCapture(Q1, DOC);
t("PIN: re-promoted in place through the act, the leg still resolves to A", [c1b.capture, c1b.cid], [A, c1.cid]);
t("the second leg, cited after the later capture, pins ITS document's capture",
  (await legsOf(Q1)).map((l) => [l.target, l.extent_capture ?? null]), [[DOC, A], [OTHER, O]]);

/* AN AUTHORED CAPTURE WINS OVER A CARRIED REFERENT. Q5's bytes, edited by their author to name B (a
   member's own act of re-pointing, which 5.8 reserves to them), must rest on B at the next promotion.
   Before this item the carry-forward was keyed on (target, extent) alone and checked FIRST, so the prior
   row about A would have been carried over the member's stated B. */
const q5md = await imageOf(Q5);
await promote(Q5, q5md.replace(`extent_capture: "${A}"`, `extent_capture: "${B}"`), "inquiry");
await refreshLive(Q5);
const c5b = await legCapture(Q5, DOC);
t("AUTHORED: a leg its author re-points to B rests on B, not on the row carried from A", c5b.capture, B);

/* ===================== 3. THE CONTRAST — MEASURED, NOT ENDORSED =========== */
console.log("\n--- 3. the pre-item shape: the same bytes rest on different captures depending on WHEN projected ---");
await promote(Q2, await imageOf(Q2), "inquiry"); await refreshLive(Q2);
const c2b = await legCapture(Q2, DOC);
console.log(`  MEASURED: Q2 (unpinned, first projected before B) rests on ${c2b.capture?.slice(0, 8)} `
          + `(carried forward by the projection); Q4 (the SAME leg bytes, projected after B) rests on `
          + `${c4.capture?.slice(0, 8)}. What an unpinned leg rests on is a fact about the PROJECTION's history, `
          + `not about the bytes — a rebuild from the bytes would re-derive it.`);
t("the pre-item leg re-promoted in place keeps A — held by the projection's carry-forward, not by its bytes",
  [c2b.capture, (await legsOf(Q2)).map((l) => l.extent_capture ?? null)], [A, [null]]);
/* THE ROW'S OWN WORDS: a leg whose capture cannot be known reads "version undetermined" — and names the
   capture the projection holds without calling it the one the member read. */
t("VERSION: now that two captures are held, the unpinned leg reads `undetermined`, naming what it resolved to",
  [c2b.version?.state, c2b.version?.resolved_capture, c2b.version?.captures_held, "capture" in (c2b.version || {})],
  ["undetermined", A, 2, false]);
t("VERSION: and the pinned leg still reads `pinned` at A with two captures held",
  (await legCapture(Q1, DOC)).version, { state: "pinned", by: "extent_capture", capture: A });

/* ===================== 4. WHAT THE ACT DOES NOT PIN ====================== */
console.log("\n--- 4. nothing is pinned that has no bytes, or is already pinned ---");
const r4 = await cite(Q3, [Q1], "&role=supports");
t("a question cited as a leg carries no capture (it has no bytes, DEC-21)",
  [(r4.legs || []).map((l) => l.pinned_capture), (await legsOf(Q3)).map((l) => l.extent_capture ?? null)],
  [[null], [null]]);
const r5 = await cite(Q3, [DOC], `&role=cuts_against&content_id=${c1.cid}`);
t("a leg naming a content id is not pinned a second time (the id hashes its capture)",
  [r5.ok, (await legsOf(Q3)).filter((l) => l.target === DOC).map((l) => [l.content_id, l.extent_capture ?? null])],
  [true, [[c1.cid, null]]]);
const c6 = await legCapture(Q3, DOC);
t("and it resolves to the capture its id names", c6.capture, A);
t("VERSION: a leg naming a content id reads `pinned` by content_id", c6.version,
  { state: "pinned", by: "content_id", capture: A });
t("VERSION: a leg onto a question carries no version (it has no bytes; null_case says so)",
  ((await get("earnedbasis", `id=${Q3}`)).legs || []).filter((l) => l.target === Q1).map((l) => l.version ?? null),
  [null]);

/* ===================== 5. WHAT THIS SUITE CANNOT SEE ====================== */
console.log("\n--- 5. stated, not implied ---");
console.log("  A CASE's citation edge (references[] rel: cites) and an ACTION's basis leg name only a BUNDLE");
console.log("  and have no slot for a capture; this item does not add one (routed as its own defect).");
console.log("  Existing legs are NOT back-filled: which capture a member read before this item is not known.");

const FLOOR = 14;
if (pass + fail < FLOOR) { console.log(`\n  FAIL  the suite reached only ${pass + fail} assertions, floor ${FLOOR}`); fail++; }
console.log(`\nrec220-version-pin: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
