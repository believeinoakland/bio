/* NEGATIVE CONTROL: (declared before running, 2026-09-23, REC-174, worktree agent-a35832e4029871e04) — driven by
   `node test/rec174-supplyfetch.control.mjs [arm|all]` from `bio-plane/`, each arm armed ALONE by an exactly-once
   anchor, every restore verified by sha256 AND `cmp` against a uniquely named pristine copy, a baseline at both ends.
   THE ROW'S CONTROL, ONE ARM AT A TIME — the full-fetch bit dropped from ONE arm's or ONE list's claim:
   (a) `document`   DECLARED MUST FAIL B1, F1.        (b) `content`    DECLARED MUST FAIL B2, B4, F1.
   (c) `mcapture`   DECLARED MUST FAIL B3, B5, F1.    (d) `mreference` DECLARED MUST FAIL B6, F1.
   (e) `mentity`    DECLARED GREEN — the entity supply is ungated, so a full fetch of `(cap + 1) * 2` split two ways
       by cause always leaves one list over `cap`: the bit is never the only witness while the over-fetch stands.
   (f) `munexplained` — the meaning claim without `unexplained.length > cap`. DECLARED MUST FAIL C5 only.
   (g) `moverfetch` — the meaning capture fetch back to `cap + 1`. DECLARED MUST FAIL C3, C5, E1, S1.
   (h) `overstrict` — every fetch claims FULL. DECLARED MUST FAIL C1..C7, E1, E2, S1; MUST NOT FAIL any B.
   ACTUALS, RUN 2026-09-23 (`all`): baseline 23/0; document 21/2 [B1 F1]; content 20/3 [B2 B4 F1]; mcapture 20/3
   [B3 B5 F1]; mreference 21/2 [B6 F1]; mentity 23/0 (declared green); munexplained 22/1 [C5]; moverfetch 19/4
   [C3 C5 E1 S1]; overstrict 13/10 [C1..C7 E1 E2 S1]; baseline 23/0. ALL NINE AS DECLARED; `store.mjs` restored
   byte-identical after each (2,849,470 bytes, sha256 0bc1afc79602980c…). FAILING BEFORE REC-174 (the unchanged
   tree, e62e08e1): 10 pass / 13 fail — B1..B7, C3, C5, E1, E2, F1, S1.
   WHAT THIS SUITE CANNOT SEE: (e) above; and the internet arm, which is out of the class (it gates INSIDE its
   statement, so its `cap + 1` fetch is exact — D-389's reading, unchanged). */

/* REC-174 — `op=frontier`'s NEVER-LOOKED AND MISSING LISTS read `truncated: true` on a FULL fetch, at every arm.
 * =====================================================================
 *
 * `OBSERVATION-LOG-DESIGN.md` §5 (the frontier is a view over the log; §5.1's never-looked / missing split) and §6
 * (the readers compute `truncated` from what the viewer may read), with D-389's landed exhaustion test as precedent.
 * D-389 made the `looked` page read `truncated: true` when its raw fetch came back FULL. The lists each arm fetches
 * BESIDE that page had the same hole: the document arm's deferred-link partition, the content arm's missing
 * captures, and the meaning arm's three missing supplies (captures, references, entities) are each fetched with a
 * bound, then gated by §6's row-whole fence and split by §5.1's cause, then cut at `cap`. A viewer the fence
 * narrowed — or, at meaning, any viewer whose `cap + 1` rows split across the two causes — read `truncated: false`
 * over a fetch that came back full, i.e. was told a list was complete while rows it may be entitled to were never
 * fetched. CLAUDE.md §2: a coverage claim must never read false where the reader cannot know.
 *
 * THE LIAR THE ROW NAMES fixes one arm, or one list. So EVERY LIST AT EVERY ARM gets its OWN store, in which that
 * list — and only that list — holds a supply beyond its fetch while the `looked` page and every other list are
 * exhausted. A fix that misses any one list leaves that store's narrowed viewer reading `false`, by name:
 *   S-LOG    (log started first, so the missing rows are §5.1 `never_looked`):  document never-looked (deferred
 *            links), content missing, meaning missing CAPTURES.
 *   S-NOLOG  (nothing logged, so every missing row is `purged` — the `missing_unexplained` list): content and
 *            meaning missing captures again, on the OTHER list the cause split feeds.
 *   S-REF    meaning missing REFERENCES (names a reading carries that no resolution has looked for).
 *   S-ENT    meaning missing ENTITIES (ungated — see F2 for what this can and cannot show).
 * In each, the OLDEST-sorting eight subjects belong to a private project an uninvited member was never invited to,
 * and one subject sorting LAST is in the shared evidence corpus (D-15), so the narrowed viewer's entitlement sits
 * BEYOND the fetch. `8`, `1`, `3`, `4`, `9` below are literals, never read off the product.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const STORE_SRC = readFileSync(new URL("../src/store.mjs", import.meta.url), "utf8");

const TOK = "mem-rec174";
const ADM = "adm-rec174";
const NOW = "2026-09-23T09:00:00Z";

let pass = 0, fail = 0, reachedFoot = false;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;

/* ONE MINIFLARE PER STORE, because the control plane addresses exactly two namespaces (`bio`, `scratch`) and each
   list needs a store where it ALONE is over its fetch. */
const boot = async () => {
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: TOK, PROBE_TOKEN: "prb-rec174",
                VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
  });
  const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
  const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
    { method: "POST", body: JSON.stringify(body ?? {}) })).json());
  const ns = await mf.getDurableObjectNamespace("STORE");
  const obj = ns.get(ns.idFromName("bio"));
  /* Driven through the DO where an arm needs a VIEWER the control plane would never stamp (a named uninvited
     member, or none at all); the control plane's own stamp is driven too (section D). */
  const DO = async (op, q = "") => rP(await (await obj.fetch(`http://x/${op}?${q}`)).json());
  let snapSeq = 0;
  const readingOf = (entities = []) => ({ content_type: "meeting_calendar", reader_version: 1, read_from_text: true,
    found: entities.length > 0, entities, facts: {}, at: NOW, text_container: "pdf",
    text_source: [{ step: "layer", tier: 1, container: "pdf" }], text_tier: 1 });
  /* `readings` maps a capture sha to the entity list its reading carries; a sha absent from it is promoted with NO
     reading, so no content- or meaning-level row is written for it — the subject the missing lists supply. */
  const promote = async (id, type, shas, readings = {}) => {
    /* CORRECTED 2026-09-25 (D-563, C-86.4), never exempted: a project's bytes said `collected` (information's word) under a
       `forming` label, and the projection took the label; the record now takes the bytes, so they state `forming`. */
    const text = `---\nobject_type: ${type}\ngroup: believe-in-oakland\ntitle: ${id}\ncurrent_state: ${type === "project" ? "forming" : "collected"}\n---\n\n# ${id}\n`;
    const docs = shas.filter((s) => s in readings).map((s) => ({
      capture: { sha256: s, encoding: "binary", bytes: 10 }, reading: readingOf(readings[s]) }));
    const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
    if (docs.length) {
      const prov = JSON.stringify({ documents: docs });
      files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
    }
    const r = await POST(`op=promote&token=${ADM}`, {
      ...(type === "project" ? {} : { bundleId: id }), base: null,
      snapKey: `20260923T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
      meta: { object_type: type, group: "believe-in-oakland", title: id,
              current_state: type === "project" ? "forming" : "collected", created: NOW, last_updated: NOW },
      files,
      register: shas.map((s, i) => ({ sha256: s, path: `data/${i}-${s.slice(0, 4)}.pdf`, encoding: "binary", bytes: 10 })) });
    if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 600)}`);
    return r;
  };
  return { mf, GET, POST, obj, DO, promote };
};

const SECRET = Array.from({ length: 8 }, (_, i) => (i + 1).toString(16).repeat(64).slice(0, 64));   /* 111…, 222…, … 888… */
const SHA_OPEN = "f".repeat(64);          /* sorts LAST: the narrowed viewer's one entitled subject */
const SHA_LOG = "0".repeat(64);           /* an open capture WITH a reading: starts the content and meaning log */
const VIEWERS = ["class:member", "member:not-invited", null];
const ask = (s, level, limit, viewer) =>
  s.DO("frontier", `level=${level}&limit=${limit}${viewer ? `&viewer=${encodeURIComponent(viewer)}` : ""}`);
const perViewer = async (s, level, limit, pick) => {
  const out = [];
  for (const v of VIEWERS) out.push([v || "(none)", ...pick(await ask(s, level, limit, v))]);
  return out;
};
const listsOf = (f) => [(f.looked || []).length, (f.never_looked || []).length, (f.missing_unexplained || []).length];

const stores = [];
try {

/* ======================================================================================================== *
 *  S-LOG — the log started first; eight private captures and one open capture with no reading, and a deferred
 *  link out of each. Document never-looked, content missing and meaning missing-capture are each 9 over a fetch
 *  of 4 at limit=1.
 * ======================================================================================================== */
console.log("\n--- S-LOG · document never-looked, content missing, meaning missing captures (never_looked) ---");
const LOG = await boot(); stores.push(LOG);
await LOG.promote("INF-2026-0923-rec174-log", "information", [SHA_LOG], { [SHA_LOG]: [] });
const PRJ = (await LOG.promote("PRJ-2026-0923-rec174-secret", "project", SECRET)).bundleId;
await LOG.promote("INF-2026-0923-rec174-open", "information", [SHA_OPEN]);
for (let i = 0; i < SECRET.length; i++)
  await LOG.obj.recordLinks({ sourceCapture: SECRET[i], sourceBundle: PRJ, capturedAt: NOW,
    links: [{ ref: `https://example.gov/rec174-a-secret-${i}`, address: `https://example.gov/rec174-a-secret-${i}`,
              address_norm: `https://example.gov/rec174-a-secret-${i}`, type: "deferred" }] });
await LOG.obj.recordLinks({ sourceCapture: SHA_OPEN, sourceBundle: "INF-2026-0923-rec174-open", capturedAt: NOW,
  links: [{ ref: "https://example.gov/rec174-z-open", address: "https://example.gov/rec174-z-open",
            address_norm: "https://example.gov/rec174-z-open", type: "deferred" }] });

t("A1: THE S-LOG CORPUS — at limit=500 [looked, never_looked, missing_unexplained] per level: the entitled viewer "
+ "holds 9 never-looked subjects at each of the three lists and the uninvited member exactly the 1 open one; the "
+ "looked pages hold 0 (document) and the 1 logged capture (content, meaning), so no page can carry the bit",
  [(await perViewer(LOG, "document", 500, listsOf)).slice(0, 2),
   (await perViewer(LOG, "content", 500, listsOf)).slice(0, 2),
   (await perViewer(LOG, "meaning", 500, listsOf)).slice(0, 2)],
  [[["class:member", 0, 9, 0], ["member:not-invited", 0, 1, 0]],
   [["class:member", 1, 9, 0], ["member:not-invited", 1, 1, 0]],
   [["class:member", 1, 9, 0], ["member:not-invited", 1, 1, 0]]]);

const bitOf = (f) => [(f.never_looked || []).length + (f.missing_unexplained || []).length, f.truncated];
const FULL = [["class:member", 1, true], ["member:not-invited", 0, true], ["(none)", 0, true]];
t("B1: DOCUMENT NEVER-LOOKED — at limit=1 the deferred-link fetch of 4 comes back FULL over a supply of 9; every "
+ "viewer reads `truncated: true`, including the two the fence narrowed to NOTHING",
  await perViewer(LOG, "document", 1, bitOf), FULL);
t("B2: CONTENT MISSING (never_looked) — the same, at the content arm's missing fetch of 4",
  await perViewer(LOG, "content", 1, bitOf), FULL);
t("B3: MEANING MISSING CAPTURES (never_looked) — the same, at the meaning arm's capture fetch",
  await perViewer(LOG, "meaning", 1, bitOf), FULL);

/* At limit=5 each fetch is 12 over a supply of 9 — EXHAUSTED — so the rule D-389 left stands untouched: the entitled
   viewer really is cut (9 > 5) and reads true; the uninvited member holds its whole entitlement of 1 and reads false;
   the unstamped reader holds 0 of 0 and reads false. At limit=500 every viewer reads false. The over-strictness pair. */
const EXH = [["class:member", 5, true], ["member:not-invited", 1, false], ["(none)", 0, false]];
const wide = async (s, level) => (await perViewer(s, level, 500, (f) => [f.truncated])).map((r) => r[1]);
t("C1: DOCUMENT — an exhausted never-looked supply reads as before (limit=5, then limit=500)",
  [await perViewer(LOG, "document", 5, bitOf), await wide(LOG, "document")], [EXH, [false, false, false]]);
t("C2: CONTENT — an exhausted missing supply reads as before",
  [await perViewer(LOG, "content", 5, bitOf), await wide(LOG, "content")], [EXH, [false, false, false]]);
t("C3: MEANING — an exhausted missing-capture supply reads as before",
  [await perViewer(LOG, "meaning", 5, bitOf), await wide(LOG, "meaning")], [EXH, [false, false, false]]);

t("E1: THE MEANING ARM'S OVER-FETCH — at limit=4 its capture fetch is (4 + 1) * 2 = 10 and EXHAUSTS the supply of "
+ "9, so the uninvited member receives the open capture it is entitled to and reads `false` honestly. At the old "
+ "`cap + 1` = 5 it would read 0 rows (and, with the full-fetch bit, `true`)",
  (await perViewer(LOG, "meaning", 4, (f) => [(f.never_looked || []).map((r) => r.subject), f.truncated]))[1],
  ["member:not-invited", [SHA_OPEN], false]);

t("D1: THROUGH THE OP — the member token at limit=1 reads `truncated: true` at every level of S-LOG",
  await (async () => { const out = [];
    for (const level of ["document", "content", "meaning"]) {
      const f = await LOG.GET(`op=frontier&token=${TOK}&level=${level}&limit=1`);
      out.push([level, f.limit, f.truncated]); }
    return out; })(),
  [["document", 1, true], ["content", 1, true], ["meaning", 1, true]]);

/* ======================================================================================================== *
 *  S-NOLOG — the same captures, no reading anywhere: every missing row is §5.1 `purged`, so the supply feeds the
 *  `missing_unexplained` list, the OTHER half of the cause split.
 * ======================================================================================================== */
console.log("\n--- S-NOLOG · content and meaning missing captures on the missing_unexplained list ---");
const NOLOG = await boot(); stores.push(NOLOG);
await NOLOG.promote("PRJ-2026-0923-rec174-secret", "project", SECRET);
await NOLOG.promote("INF-2026-0923-rec174-open", "information", [SHA_OPEN]);

t("A2: THE S-NOLOG CORPUS — [looked, never_looked, missing_unexplained] at limit=500: nothing was logged, so all 9 "
+ "(entitled) and the 1 (uninvited) sit on missing_unexplained at BOTH levels",
  [(await perViewer(NOLOG, "content", 500, listsOf)).slice(0, 2),
   (await perViewer(NOLOG, "meaning", 500, listsOf)).slice(0, 2)],
  [[["class:member", 0, 0, 9], ["member:not-invited", 0, 0, 1]],
   [["class:member", 0, 0, 9], ["member:not-invited", 0, 0, 1]]]);
t("B4: CONTENT MISSING (unexplained) — full fetch, `true` for every viewer",
  await perViewer(NOLOG, "content", 1, bitOf), FULL);
t("B5: MEANING MISSING CAPTURES (unexplained) — full fetch, `true` for every viewer",
  await perViewer(NOLOG, "meaning", 1, bitOf), FULL);
t("C4: CONTENT — the exhausted unexplained supply reads as before (limit=5, then 500)",
  [await perViewer(NOLOG, "content", 5, bitOf), await wide(NOLOG, "content")], [EXH, [false, false, false]]);
/* THE SECOND DEFECT, found reading the row's site: the meaning arm cut `missing_unexplained` at `cap` and its claim
   never compared it — at limit=5 the entitled viewer received 5 of 9 over an EXHAUSTED fetch and read `false`. */
t("C5: MEANING — the exhausted unexplained supply: the entitled viewer is CUT (9 > 5) and must read `true`; the "
+ "claim now compares `unexplained` as the content arm's has since REC-109",
  [await perViewer(NOLOG, "meaning", 5, bitOf), await wide(NOLOG, "meaning")], [EXH, [false, false, false]]);

/* ======================================================================================================== *
 *  S-REF — one private capture whose reading names eight people, one open capture naming one who sorts last. Every
 *  capture HAS a reading (so the capture list is empty) and no `op=resolve` has run (so every name is a missing
 *  REFERENCE). At limit=3 the reference fetch is 8 over a supply of 9; the looked page holds 2 of a fetch of 12.
 * ======================================================================================================== */
console.log("\n--- S-REF · meaning missing references ---");
const REF = await boot(); stores.push(REF);
const ENT = (k) => ({ ref: `person:${k}`, kind: "person", key: String(k), label: `Person ${k}` });
await REF.promote("PRJ-2026-0923-rec174-secret", "project", [SECRET[0]],
  { [SECRET[0]]: Array.from({ length: 8 }, (_, i) => ENT(`a${i}`)) });
await REF.promote("INF-2026-0923-rec174-open", "information", [SHA_OPEN], { [SHA_OPEN]: [ENT("z9")] });
const refsOf = (f) => [(f.looked || []).length,
  [...(f.never_looked || []), ...(f.missing_unexplained || [])].filter((r) => r.subject_kind === "reference").length,
  [...(f.never_looked || []), ...(f.missing_unexplained || [])].filter((r) => r.subject_kind !== "reference").length];
t("A3: THE S-REF CORPUS — [looked, missing references, missing other] at limit=500: 9 references for the entitled "
+ "viewer, the 1 open name for the uninvited member, and NO other missing subject (no capture list, no entity list)",
  (await perViewer(REF, "meaning", 500, refsOf)).slice(0, 2),
  [["class:member", 2, 9, 0], ["member:not-invited", 1, 1, 0]]);
t("B6: MEANING MISSING REFERENCES — at limit=3 the reference fetch of 8 comes back FULL; every viewer reads `true`",
  (await perViewer(REF, "meaning", 3, (f) => [refsOf(f)[1], f.truncated])).map((r) => [r[0], r[2]]),
  [["class:member", true], ["member:not-invited", true], ["(none)", true]]);
t("C6: MEANING — the exhausted reference supply reads as before (limit=500)", await wide(REF, "meaning"),
  [false, false, false]);
t("E2: THE REFERENCE FETCH'S OVER-FETCH — at limit=4 it is 10 and exhausts the 9, so the uninvited member receives "
+ "the one name it is entitled to and reads `false`",
  (await perViewer(REF, "meaning", 4, (f) => [(f.never_looked || []).concat(f.missing_unexplained || [])
    .filter((r) => r.subject_kind === "reference").map((r) => r.subject), f.truncated]))[1],
  ["member:not-invited", ["person:z9"], false]);

/* ======================================================================================================== *
 *  S-ENT — six registry entities nobody has derived over. An entity is NOT gated (the arm's header says why), so
 *  every viewer holds the same supply.
 * ======================================================================================================== */
console.log("\n--- S-ENT · meaning missing entities ---");
const ENTS = await boot(); stores.push(ENTS);
for (let i = 0; i < 6; i++)
  await ENTS.POST(`op=entitycreate&token=${ADM}`, { kind: "person", label: `Person rec174-${i}` });
t("A4: THE S-ENT CORPUS — 6 missing entities at limit=500 for EVERY viewer, nothing else",
  (await perViewer(ENTS, "meaning", 500, listsOf)).map((r) => [r[0], r[1], r[2] + r[3]]),
  [["class:member", 0, 6], ["member:not-invited", 0, 6], ["(none)", 0, 6]]);
t("B7: MEANING MISSING ENTITIES — at limit=1 the entity fetch of 4 comes back FULL over 6; every viewer reads `true`",
  (await perViewer(ENTS, "meaning", 1, (f) => [f.truncated])).map((r) => r[1]), [true, true, true]);
t("C7: MEANING — the exhausted entity supply reads as before (limit=500)", await wide(ENTS, "meaning"),
  [false, false, false]);

/* ---- F · NOT A LEAK, BY CONSTRUCTION ----------------------------------------------------------------------- */
t("F1: THE `true` DISTINGUISHES NOBODY — on every full fetch above, the entitled, the fenced and the unstamped viewer "
+ "read the SAME bit, so it says nothing about who is being withheld from; and no answer carries a withheld count",
  await (async () => { const out = [];
    for (const [s, level, limit] of [[LOG, "document", 1], [LOG, "content", 1], [LOG, "meaning", 1],
                                     [NOLOG, "content", 1], [NOLOG, "meaning", 1], [REF, "meaning", 3], [ENTS, "meaning", 1]]) {
      const fs = []; for (const v of VIEWERS) fs.push(await ask(s, level, limit, v));
      out.push([new Set(fs.map((f) => f.truncated)).size,
                fs.some((f) => Object.keys(f).some((k) => /withheld|hidden_count|redacted_count/.test(k)))]); }
    return out; })(),
  Array.from({ length: 7 }, () => [1, false]));

/* ---- S · THE ONE EXHAUSTION TEST, AND EVERY SUPPLY ROUTED THROUGH IT ----------------------------------------- */
{
  /* CODE, not prose: the test as an expression (`full: raw.length === …`), anywhere in the store. */
  const fullTest = (STORE_SRC.match(/full:\s*raw\.length\s*===/g) || []).length;
  const fetches = (STORE_SRC.match(/this\.#frontierFetch\(\(cap \+ 1\) \* 2,/g) || []).length;
  /* Inside the three arm methods, every bounded statement binds `n` — the limit `#frontierFetch` handed it — and
     the never-looked partition is called with `n`. A statement bound to its own `cap + 1` is a supply fetched
     BESIDE the one test, which is the shape this row closed. */
  const bound = [];
  for (const head of ["  #frontierContent(cap", "  #frontierMeaning(cap", "  frontier({ level"]) {
    const i = STORE_SRC.indexOf(head), j = STORE_SRC.indexOf("\n  }\n", i);
    const body = i < 0 || j < 0 ? "" : STORE_SRC.slice(i, j);
    for (const m of body.matchAll(/LIMIT \?`,\s*([^)\n]*)/g)) bound.push(m[1].trim());
    for (const m of body.matchAll(/#frontierNeverLooked\(([^)]*)\)/g)) bound.push(m[1].trim());
  }
  t("S1: THE FULL-FETCH TEST IS WRITTEN ONCE (`#frontierFetch`), and the five never-looked / missing supplies — "
  + "document, content, and meaning's capture, reference and entity — each fetch through it at `(cap + 1) * 2`, "
  + "every one bound to the limit the test is taken at",
    [fullTest, fetches, bound], [1, 5, ["n", "n", "n", "n", "n"]]);
}

reachedFoot = true;

} catch (e) {
  console.log(`  THREW: ${e && e.stack ? e.stack : e}`);
} finally {
  for (const s of stores) await s.mf.dispose();
  console.log(`\nrec174-supplyfetch: ${reachedFoot ? pass : -1} pass, ${fail} fail`);
}
process.exit(fail || !reachedFoot ? 1 : 0);
