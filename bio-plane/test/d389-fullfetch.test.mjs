/* NEGATIVE CONTROL: (declared before running, 2026-09-23, D-389, worktree agent-af15234bde93a3b9f) — driven by
   `node test/d389-fullfetch.control.mjs [arm|all]` from `bio-plane/`, each arm armed ALONE by an exactly-once anchor,
   every restore verified by sha256 AND `cmp` against a uniquely named pristine copy, a baseline row at both ends.
   (a) `baseline` — nothing armed. DECLARED: all green.
   (b) `nodisjunct` — THE ROW'S CONTROL: drop `|| raw.length === limit` from `#frontierPage`, the ONE over-fetch the
       three bundle arms share. DECLARED MUST FAIL B1 (document), B2 (content) and B3 (meaning) BY NAME, B4 (the
       bit then differs by viewer) and S1; MUST NOT FAIL A0, C1..C3 (the exhausted supply reads as before), D1.
   (c) `onearm` — THE LIAR THE ROW NAMES: keep the shared helper undisjuncted and fix ONE arm alone (the helper
       exposes the full-fetch bit and only the content arm ORs it in). DECLARED MUST FAIL B1 and B3 (document and
       meaning), B4 and S1; MUST NOT FAIL B2 — the fixture drives all three levels, so a one-arm fix cannot pass it.
   (d) `overstrict` — make every page claim `truncated: true` (the fail-safe taken too far). DECLARED MUST FAIL
       C1..C3 (an EXHAUSTED supply must still read false for the viewer who has it all) and S1, MUST NOT FAIL B1..B4.
   ACTUALS, RUN 2026-09-23 (`all`, baseline both ends): baseline 10/0; nodisjunct 5/5 red [B1 B2 B3 B4 S1];
   onearm 6/4 red [B1 B3 B4 S1] — B2 GREEN, the liar passing its own arm and caught at the other two; overstrict
   6/4 red [C1 C2 C3 S1]; baseline 10/0. ALL FOUR AS DECLARED; `store.mjs` restored byte-identical after each
   (2,845,011 bytes, sha256 e1b952c145d5410b…). FAILING BEFORE D-389 (the unchanged tree): B1 B2 B3 B4 S1 red,
   the uninvited and unstamped viewers reading `truncated: false` over zero rows at every level.
   WHAT THIS SUITE CANNOT SEE: the never-looked / missing lists each arm fetches BESIDE the `looked` page carry the
   same full-fetch shape and are NOT covered by this row's one disjunct (reported with its named fix) — CLOSED
   2026-09-23 BY REC-174, whose suite `rec174-supplyfetch.test.mjs` drives every such list at every arm; and the
   internet arm is out of the class, because it gates INSIDE the statement and so its `cap + 1` fetch is exact.
   ANCHORS MOVED 2026-09-23 BY REC-174: the page's claim now reads `gated.length > cap || full` (the test itself moved
   into `#frontierFetch`), so the control's HELPER and CONTENT_CLAIM anchors were re-pointed at the same acts. */

/* D-389 — `op=frontier`'s `truncated` ON A FULL RAW FETCH, AT ALL THREE BUNDLE ARMS.
 * =====================================================================
 *
 * `OBSERVATION-LOG-DESIGN.md` §5 (the frontier is a view over the log) and §6 (the readers,
 * which compute `truncated` from what the viewer may read). Each bundle-level arm — document, content, meaning —
 * OVER-FETCHES `R` raw rows (`(cap + 1) * 2`, `* 3` at meaning) because the §6 fence drops rows before the cut.
 * When that raw fetch comes back FULL the supply was NOT exhausted: rows beyond it were never fetched and their
 * visibility is unknown. Before this row, a viewer the fence had narrowed to `cap` or fewer read `truncated: false`
 * there — a coverage claim the reader did not establish, and CLAUDE.md §2's "sparse is normal" says a claim about
 * coverage must never read false where the reader cannot know.
 *
 * THE FIXTURE IS BUILT SO THE LIE IS PROVEN RATHER THAN INFERRED. The OLDEST row at every level is one an uninvited
 * member MAY read (an information bundle, the shared evidence corpus, D-15). The EIGHT newest are in a private
 * project they were never invited to. At `limit=1` the raw fetch is 4 rows (6 at meaning), all eight-project rows,
 * so the gated page is EMPTY and the old flag said FALSE — while the same viewer at `limit=500` is shown the visible
 * row. `false` was a statement that a row the viewer is entitled to did not exist.
 *
 * NOTHING HERE READS A BOUND OFF THE PRODUCT to build its own expectation: `8`, `1`, `4`, `6` are literals.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const STORE_SRC = readFileSync(new URL("../src/store.mjs", import.meta.url), "utf8");

const TOK = "mem-d389";
const ADM = "adm-d389";
const NOW = "2026-09-23T09:00:00Z";

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: TOK, PROBE_TOKEN: "prb-d389",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});

let pass = 0, fail = 0, reachedFoot = false;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

try {

const ns = await mf.getDurableObjectNamespace("STORE");
const obj = ns.get(ns.idFromName("bio"));
/* Driven through the DO where an arm needs a VIEWER the control plane would never stamp (a named uninvited
   member, or none at all); the control plane's own stamp is driven too (D1), because a DO-only arm is not
   evidence a caller can reach the answer. */
const DO = async (op, q = "") => rP(await (await obj.fetch(`http://x/${op}?${q}`)).json());

let snapSeq = 0;
const readingOf = () => ({ content_type: "meeting_calendar", reader_version: 1, read_from_text: true,
                           found: false, entities: [], facts: {}, at: NOW, text_container: "pdf",
                           text_source: [{ step: "layer", tier: 1, container: "pdf" }], text_tier: 1 });
/* One promote carrying a reading per capture: that writes a CONTENT-level row (REC-94) and a MEANING-level
   reader-run row (REC-95) per capture, through the op. A project's id is MINTED (REC-141, IC-158). */
const promote = async (id, type, shas) => {
  const text = `---\nobject_type: ${type}\ngroup: believe-in-oakland\ntitle: ${id}\ncurrent_state: collected\n---\n\n# ${id}\n`;
  const prov = JSON.stringify({ documents: shas.map((s) => ({
    capture: { sha256: s, encoding: "binary", bytes: 10 }, reading: readingOf() })) });
  const r = await POST(`op=promote&token=${ADM}`, {
    ...(type === "project" ? {} : { bundleId: id }), base: null,
    snapKey: `20260923T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: id,
            current_state: type === "project" ? "forming" : "collected", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }],
    register: shas.map((s, i) => ({ sha256: s, path: `data/${i}-${s.slice(0, 4)}.pdf`, encoding: "binary", bytes: 10 })) });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 600)}`);
  return r;
};

/* ---- THE FIXTURE, OLDEST FIRST ----------------------------------------------------------------------- */
const SHA_OPEN = "a".repeat(64);
const SECRET = Array.from({ length: 8 }, (_, i) => (i + 1).toString(16).repeat(64).slice(0, 64));
const N_SECRET = 8;
await promote("INF-2026-0923-d389-open", "information", [SHA_OPEN]);
await obj.recordCapturedLocator({ address: "https://example.gov/d389-open", addressNorm: "https://example.gov/d389-open",
                                  captureSha: SHA_OPEN, retrieved: "2026-09-23T09:00:01Z" });
await promote("PRJ-2026-0923-d389-secret", "project", SECRET);
for (let i = 0; i < SECRET.length; i++)
  await obj.recordCapturedLocator({ address: `https://example.gov/d389-secret-${i}`,
                                    addressNorm: `https://example.gov/d389-secret-${i}`,
                                    captureSha: SECRET[i], retrieved: `2026-09-23T09:00:${String(10 + i)}Z` });

const LEVELS = ["document", "content", "meaning"];
const VIEWERS = ["class:member", "member:not-invited", null];
const ask = (level, limit, viewer) =>
  DO("frontier", `level=${level}&limit=${limit}${viewer ? `&viewer=${encodeURIComponent(viewer)}` : ""}`);

/* ---- A · THE CORPUS, ASSERTED BEFORE ANYTHING RESTS ON IT -------------------------------------------- */
console.log("\n--- A · the corpus at every level ---");
{
  const got = [];
  for (const level of LEVELS) {
    const all = await ask(level, 500, "class:member");
    const mine = await ask(level, 500, "member:not-invited");
    got.push([level, all.looked.length, mine.looked.length,
              mine.looked.map((r) => r.subject).some((s) => SECRET.includes(s) || /d389-secret/.test(s))]);
  }
  t("A0: THE CORPUS — at EACH of the three levels an entitled viewer sees the 8 project rows and the 1 open row, "
  + "an uninvited member sees exactly the 1 open row and none of the project's. Every arm below rests on this, "
  + "and a headline arm passing over an empty corpus is on record in this project three times",
    got, LEVELS.map((l) => [l, N_SECRET + 1, 1, false]));
}

/* ---- B · THE FULL FETCH: `true` AT EVERY ARM FOR EVERY VIEWER ---------------------------------------- */
console.log("\n--- B · a raw supply that exceeds the over-fetch reads truncated at every arm ---");
const B = {};
for (const level of LEVELS) {
  B[level] = [];
  for (const v of VIEWERS) {
    const f = await ask(level, 1, v);
    B[level].push([v || "(none)", f.looked.length, f.truncated]);
  }
}
/* The uninvited member and the unstamped reader receive ZERO rows at limit=1, because the raw fetch (4, or 6 at
   meaning) is all project rows; the open row sits BEYOND it. Before D-389 both read `truncated: false` — told the
   list was complete while A0 shows them entitled to a row. */
t("B1: DOCUMENT — at limit=1 the raw fetch of 4 comes back FULL over a supply of 9; every viewer reads "
+ "`truncated: true`, including the two the fence narrowed to NOTHING (who read false before this row)",
  B.document, [["class:member", 1, true], ["member:not-invited", 0, true], ["(none)", 0, true]]);
t("B2: CONTENT — the same, at the content arm's own over-fetch of 4",
  B.content, [["class:member", 1, true], ["member:not-invited", 0, true], ["(none)", 0, true]]);
t("B3: MEANING — the same, at the meaning arm's over-fetch of 6 (three subject kinds, `* 3`)",
  B.meaning, [["class:member", 1, true], ["member:not-invited", 0, true], ["(none)", 0, true]]);

t("B4: …AND THE `true` IS NOT A LEAK, BY CONSTRUCTION — it is identical for the entitled viewer, the fenced one "
+ "and the unstamped one at every level, so it does not distinguish who is being withheld from",
  LEVELS.map((l) => new Set(B[l].map((r) => r[2])).size), [1, 1, 1]);

/* ---- C · THE EXHAUSTED SUPPLY READS AS BEFORE -------------------------------------------------------- */
console.log("\n--- C · an exhausted supply reads as before ---");
{
  const C = {};
  for (const level of LEVELS) {
    C[level] = [];
    for (const v of VIEWERS) {
      const wide = await ask(level, 500, v);
      const five = await ask(level, 5, v);
      C[level].push([v || "(none)", wide.truncated, five.looked.length, five.truncated]);
    }
  }
  /* At limit=500 every fetch is exhausted: `false` for everyone. At limit=5 the raw fetch (12, or 18) is NOT full
     over a supply of 9, so the old rule stands untouched: the entitled viewer really is cut (9 > 5) and reads
     true; the uninvited member holds their whole entitlement of 1 and reads false; the unstamped reader holds 0
     of 0 and reads false. This is the over-strictness pair: the fail-safe must not reach past the full fetch. */
  const want = [["class:member", false, 5, true], ["member:not-invited", false, 1, false], ["(none)", false, 0, false]];
  t("C1: DOCUMENT — exhausted supply, answered as before", C.document, want);
  t("C2: CONTENT — exhausted supply, answered as before", C.content, want);
  t("C3: MEANING — exhausted supply, answered as before", C.meaning, want);
}

/* ---- D · THROUGH THE CONTROL PLANE'S OWN STAMP ------------------------------------------------------- */
console.log("\n--- D · through op=frontier on the control plane ---");
{
  const got = [];
  for (const level of LEVELS) {
    const f = await GET(`op=frontier&token=${TOK}&level=${level}&limit=1`);
    got.push([level, f.limit, f.truncated]);
  }
  t("D1: THROUGH THE OP — the member token at limit=1 reads `truncated: true` at every level",
    got, LEVELS.map((l) => [l, 1, true]));
}

/* ---- S · THE ONE DISJUNCT LIVES IN ONE PLACE --------------------------------------------------------- */
console.log("\n--- S · one disjunct, in the one over-fetch the three arms share ---");
{
  /* The DISJUNCT as code (`|| raw.length === …`), anywhere in the store: a second arm writing its own full-fetch
     test in any spelling of the bound is a second copy, and this counts it. */
  /* CORRECTED 2026-09-23 BY REC-174, NEVER EXEMPTED. This counted the spelling `|| raw.length ===`, which was the
     disjunct's whole text while `#frontierPage` held the test inline. REC-174 routed the never-looked / missing
     supplies through the SAME test, so the test moved into `#frontierFetch` (`full: raw.length === limit`, written
     once) and the page's disjunct now reads `gated.length > cap || full`. The old count read 0 over a disjunct that
     is present, i.e. it pinned a spelling rather than the rule; the rule — ONE full-fetch test, the page's claim
     OR-ing it, three arms taking their page from the helper — is what is counted now. */
  const fullTest = (STORE_SRC.match(/full:\s*raw\.length\s*===/g) || []).length;
  const disjunct = (STORE_SRC.match(/truncated:\s*gated\.length\s*>\s*cap\s*\|\|\s*full\b/g) || []).length;
  const callers = (STORE_SRC.match(/this\.#frontierPage\("(document|content|meaning)"/g) || []).map((s) => s.match(/"(\w+)"/)[1]).sort();
  t("S1: THE DISJUNCT IS WRITTEN ONCE, in `#frontierPage`, and the three bundle arms each take their `looked` page "
  + "from it — a per-arm copy is the mirror-and-drift class this row was raised to avoid",
    [fullTest, disjunct, callers], [1, 1, ["content", "document", "meaning"]]);
}

reachedFoot = true;

} catch (e) {
  console.log(`  THREW: ${e && e.stack ? e.stack : e}`);
} finally {
  await mf.dispose();
  console.log(`\nd389-fullfetch: ${reachedFoot ? pass : -1} pass, ${fail} fail`);
}
process.exit(fail || !reachedFoot ? 1 : 0);
