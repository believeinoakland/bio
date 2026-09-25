/* NEGATIVE CONTROL: DECLARED BEFORE ARMING, each arm ALONE on `src/store.mjs`, every restore verified by
   sha256 AND `cmp` against a per-arm pristine copy, the pen in the session scratchpad and never the worktree.

   (0) BASELINE, nothing armed -> every arm green.

   (a) THE ROW'S CONTROL — RESTORE THE STRING COMPARE: `#reviewLastChange` ranks `c.at > last.at` instead of
   `instantOrder(c.at, last.at) > 0`. Declared: MUST FAIL block 2's mixed-precision arm BY NAME (the
   whole-second acknowledgement sorts last and the copy names it). MUST NOT fail block 1, block 3 or block 4.

   (b) OVER-STRICTNESS — the newest act picked by SORTING the candidates with `instantOrder` and taking the
   last, a correct spelling this suite did not anticipate. Declared: everything GREEN.

   (c) THE ACKNOWLEDGEMENT CUT TO THE SECOND AGAIN: `acknowledgeStatement` stamps `stampInstant("second")`.
   Declared: MUST FAIL block 3's acknowledgement-precision arm. MUST NOT fail block 2 (it re-stamps its rows
   and so measures the compare, not the stamp).

   RUN 2026-09-25 by the D-543 worker (branch land/worker/D-543), every anchor matched ONCE (armed), every
   restore sha256 MATCH and `cmp` IDENTICAL (store.mjs 3,329,240 bytes):
     (0) baseline -> 11 pass, 0 fail.
     (a) -> 10/1: the MIXED-PRECISION ARM alone, by name. As declared.
     (b) -> 11/0 GREEN. As declared.
     (c) -> 10/1: block 3's acknowledgement-precision arm alone; block 2 green. As declared.
 */

/* D-543 — THE RECORD STAMPS `at` AT TWO PRECISIONS, SO A STRING COMPARE ACROSS ACT KINDS MISORDERS.
 *
 * `…:00Z` sorts AFTER `…:00.123Z` as a string (`Z` is above `.`), though it names the EARLIER instant. The
 * review copy's last change (BIO_Publication_v0_1.md §6A.3 point 1, REC-200) ranks four act kinds against
 * each other, and an acknowledgement was the one cut to the second. This suite proves, one block each:
 *   1. the stamping helper NAMES its precision, and refuses a precision it does not know; `instantOrder`
 *      compares instants and answers NaN, never zero, for a stamp that is not one;
 *   2. THE ROW'S ACCEPTANCE, through `op=reviewcopy`: an acknowledgement stamped `…:00Z` and a comment
 *      stamped `…:00.123Z` in ONE copy order by instant, and the copy's last change names the comment;
 *   3. every act the review copy carries is now stamped at ONE precision, milliseconds, through its own op;
 *   4. no site in `store.mjs` or `index.mjs` spells a whole-second stamp by hand any longer (comments blanked),
 *      with the helper's call count printed and floored so a sweep over nothing cannot pass.
 * WHAT IT CANNOT SEE is at its foot.
 */

import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { makePublishingProject } from "./publishingproject.mjs";

const SRC = (f) => fileURLToPath(new URL(`../src/${f}`, import.meta.url));
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* The probe: the REAL worker and the REAL Store, with one extra door for what no caller has — re-stamping
   a row's `at` (the only way to put a WHOLE-SECOND acknowledgement beside a millisecond comment inside ONE
   second deterministically, which is what a record written before D-543 holds) and calling the helpers. */
const PROBE_SRC = `
import worker from "./index.mjs";
import { Store, stampInstant, instantOrder } from "./store.mjs";
export class ProbeStore extends Store {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/restamp") {
      const b = await req.json();
      const table = { comment: "review_comments", ack: "statement_acknowledgements",
                      draft: "case_drafts", grant: "review_grants" }[b.kind];
      const col = { comment: "at", ack: "at", draft: "updated_at", grant: "issued_at" }[b.kind];
      const key = { comment: "draft_id", ack: "draft_id", draft: "draft_id", grant: "draft_id" }[b.kind];
      this.sql.exec("UPDATE " + table + " SET " + col + "=? WHERE " + key + "=?", b.at, b.draft);
      const n = [...this.sql.exec("SELECT count(*) c FROM " + table + " WHERE " + key + "=? AND " + col + "=?",
                                  b.draft, b.at)][0].c;
      return Response.json({ result: { ok: true, rows: n } });
    }
    if (url.pathname === "/helper") {
      const out = {};
      out.second = stampInstant("second", Date.UTC(2026, 6, 1, 0, 0, 0, 123));
      out.milli = stampInstant("millisecond", Date.UTC(2026, 6, 1, 0, 0, 0, 123));
      try { stampInstant("minute"); out.unnamed = "no throw"; } catch (e) { out.unnamed = String(e.message); }
      try { stampInstant(undefined); out.absent = "no throw"; } catch (e) { out.absent = String(e.message); }
      out.order = instantOrder("2026-07-01T00:00:00Z", "2026-07-01T00:00:00.123Z");
      out.same = instantOrder("2026-07-01T00:00:00Z", "2026-07-01T00:00:00.000Z");
      out.bad = String(instantOrder("not an instant", "2026-07-01T00:00:00Z"));
      out.nul = String(instantOrder(null, "2026-07-01T00:00:00Z"));
      return Response.json({ result: out });
    }
    return super.fetch(req);
  }
}
export default {
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    if (u.pathname.startsWith("/probe/"))
      return env.STORE.get(env.STORE.idFromName("bio"))
        .fetch(new Request("http://do/" + u.pathname.slice(7) + u.search, req));
    return worker.fetch(req, env, ctx);
  },
};
`;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("d543-probe.mjs"), script: PROBE_SRC,
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "ProbeStore", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d543", MEMBER_TOKEN: "mem-d543", PROBE_TOKEN: "prb-d543", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const finish = async (aborted = false) => {
  console.log(`\nd543-instant-precision: ${pass} pass, ${fail} fail${aborted ? "  [FIXTURE ABORTED]" : ""}`);
  await mf.dispose();
  process.exit(fail || aborted ? 1 : 0);
};
const bail = async (what, r) => {
  console.log(`  FAIL  (fixture) ${what}: ${JSON.stringify(r).slice(0, 600)}`);
  fail++;
  await finish(true);
};
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const PROBE = async (p, body) => rP(await (await mf.dispatchFetch(`http://x/probe/${p}`,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json());

console.log("\n--- d543-instant-precision ---");

/* ======================================================================= 1. the helper */
console.log("\n--- 1. the stamping helper names its precision; instantOrder compares instants ---");
{
  const h = await PROBE("helper");
  t("`stampInstant` spells ONE instant at the precision it is NAMED: whole seconds cut the milliseconds, "
  + "milliseconds keep them",
    [h?.second, h?.milli], ["2026-07-01T00:00:00Z", "2026-07-01T00:00:00.123Z"]);
  t("a precision it does not know — a word it was never given, or none — THROWS rather than picking one",
    [/precision is "second" or "millisecond"/.test(h?.unnamed ?? ""), /precision is/.test(h?.absent ?? "")],
    [true, true]);
  t("`instantOrder` ranks `…:00Z` BEFORE `…:00.123Z` (a string compare ranks it after), the same instant "
  + "in two spellings as EQUAL, and a stamp that is not an instant as NaN — never as zero",
    [h?.order < 0, h?.same, h?.bad, h?.nul], [true, 0, "NaN", "NaN"]);
}

/* ======================================================================= fixture */
const enrol = async (memberId, role, capabilities) => {
  const add = await POST("op=memberadd&token=adm-d543", { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add?.invite, handle: memberId, password: `${memberId}-passphrase-543` });
  if (!en?.ok) await bail(`enroll ${memberId}`, en);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-543` });
  if (!lg?.token) await bail(`login ${memberId}`, lg);
  return lg.token;
};
await enrol("nadia", "admin", ["contribute", "publish", "create_projects"]);
await enrol("omar", "admin", ["contribute", "publish"]);   /* ADMINS_FIRST: two before a member */
const IRIS = await enrol("iris", "member", ["contribute", "publish"]);
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const PROJ = await makePublishingProject({
  post: async (q, b) => await mf.dispatchFetch(`http://x/api/?${q}`,
    { method: "POST", body: JSON.stringify(b ?? {}) }).then((r) => r.json()),
  mf, sha, machineToken: "adm-d543", owner: "iris",
  name: "PROJ-2026-5430-precision", created: NOW, updated: LATER });
const ARGS = {
  project: PROJ, targets: [],
  scope: "Whether the record orders its acts by instant.",
  statement: "This case covers the ordering of one copy's acts only.",
  excluded: [], subjectPosition: "sought_and_answered",
  subjectJustification: "We asked.", biasAcknowledgement: "This group holds that order is a fact.",
};
const dr = await POST(`op=casedraft&token=${IRIS}`, ARGS);
if (!dr?.ok) await bail("casedraft", dr);
const DRAFT = dr.draftId;
const c1 = await POST(`op=reviewcomment&draft=${DRAFT}&token=${IRIS}`, { text: "a member's note" });
if (!c1?.ok) await bail("reviewcomment", c1);
const g1 = await POST(`op=reviewgrant&token=${IRIS}`, { draft: DRAFT, recipient: "Dana Ruiz, City Auditor's office" });
if (!g1?.ok || !g1.secret) await bail("reviewgrant", g1);
const SEC = encodeURIComponent(g1.secret);
const a1 = await POST(`op=statementack&draft=${DRAFT}&secret=${SEC}`, {});
if (!a1?.ok) await bail("statementack", a1);

/* ======================================================================= 3. one precision on the copy */
/* Before block 2 re-stamps anything: what each OP stamped, read off its own answer and off the copy. */
console.log("\n--- 3. every act the review copy carries is stamped at ONE precision, through its own op ---");
{
  const MS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  const rc = await GET(`op=reviewcopy&draft=${DRAFT}&token=${IRIS}`);
  t("the ACKNOWLEDGEMENT is stamped with milliseconds — it was the one act cut to the second, which dated an "
  + "acknowledgement made in the same second as the act before it EARLIER than that act",
    [MS.test(a1.acknowledgement?.at ?? ""), MS.test(rc?.statement_acknowledgements?.acknowledgements?.[0]?.at ?? "")],
    [true, true]);
  t("and the draft's edit, the comment and the grant are stamped at that SAME precision, as the copy serves them",
    [MS.test(rc?.updated_at ?? ""), MS.test(rc?.comments?.[0]?.at ?? ""), MS.test(rc?.grants?.[0]?.issued_at ?? "")],
    [true, true, true]);
}

/* ======================================================================= 2. the row's acceptance */
console.log("\n--- 2. D-543's acceptance: a whole-second acknowledgement and a millisecond comment order by INSTANT ---");
{
  /* ONE SECOND, TWO SPELLINGS, as a record written before D-543 holds them: the acknowledgement at `…:00Z`
     (the instant `.000`) and the comment 123 ms LATER at `…:00.123Z`. The edit and the grant are put an hour
     earlier so neither can be the answer. As STRINGS the acknowledgement sorts last; as INSTANTS the comment
     is the later act. */
  const put = async (kind, at) => (await PROBE("restamp", { kind, draft: DRAFT, at }))?.rows;
  const rows = [await put("draft", "2026-08-01T11:00:00.000Z"), await put("grant", "2026-08-01T11:00:00.500Z"),
                await put("ack", "2026-08-01T12:00:00Z"), await put("comment", "2026-08-01T12:00:00.123Z")];
  t("the fixture: each of the four acts holds exactly the stamp this block put there (a re-stamp that matched "
  + "no row would make every arm below vacuous)", rows, [1, 1, 1, 1]);
  const rc = await GET(`op=reviewcopy&draft=${DRAFT}&token=${IRIS}`);
  const rr = await GET(`op=reviewcopy&secret=${SEC}`);
  t("THE MIXED-PRECISION ARM: the copy's LAST CHANGE is the comment at `…:00.123Z`, not the acknowledgement at "
  + "`…:00Z` that a string compare ranks last — on the member door and on the recipient's",
    [rc?.last_change?.kind, rc?.last_change?.at, rc?.inband?.date, rr?.last_change?.kind, rr?.inband?.date],
    ["comment", "2026-08-01T12:00:00.123Z", "2026-08-01T12:00:00.123Z", "comment", "2026-08-01T12:00:00.123Z"]);
  /* And the arm is not vacuous in the other direction: move the acknowledgement one second later and it IS
     the last change — the compare picks the later instant, not a fixed kind. */
  await put("ack", "2026-08-01T12:00:01Z");
  const rc2 = await GET(`op=reviewcopy&draft=${DRAFT}&token=${IRIS}`);
  t("and it is the INSTANT that decides, not the kind: the acknowledgement stamped one second later is the "
  + "last change", [rc2?.last_change?.kind, rc2?.last_change?.at],
    ["statement acknowledgement", "2026-08-01T12:00:01Z"]);
}

/* ======================================================================= 4. the sweep */
console.log("\n--- 4. no hand-spelled whole-second stamp is left in store.mjs or index.mjs ---");
{
  /* CODE ONLY: block and line comments blanked, so a comment QUOTING the old spelling (this landing's own
     does) is not counted as a site. */
  const codeOf = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const store = codeOf(readFileSync(SRC("store.mjs"), "latin1"));
  const index = codeOf(readFileSync(SRC("index.mjs"), "utf8"));
  const HAND = /toISOString\(\)\s*\.\s*(?:replace\(\/\\\.\\d\+Z\$\/|split\(\s*["']\.["']\s*\)\s*\[\s*0\s*\]\s*\+\s*["']Z["'])/g;
  const calls = (store.match(/stampInstant\("(?:second|millisecond)"/g) || []).length
              + (index.match(/stampInstant\("(?:second|millisecond)"/g) || []).length;
  console.log(`  corpus: store.mjs ${store.length} code chars, index.mjs ${index.length}; stampInstant calls ${calls}`);
  t("the corpus is the real source (a sweep over an empty read passes over nothing)",
    [store.length > 1_000_000, index.length > 100_000], [true, true]);
  t("NO site spells a whole-second stamp by hand — `.replace(/\\.\\d+Z$/, \"Z\")` or `.split(\".\")[0] + \"Z\"` "
  + "after `toISOString()` — in either file", [(store.match(HAND) || []).length, (index.match(HAND) || []).length],
    [0, 0]);
  /* FLOORED AT THE FIGURE D-543 PRINTED, 70: store.mjs's 61 hand-spelled whole-second sites (26 `.replace`,
     35 `.split`), less the acknowledgement's, which moved to milliseconds, are 60 "second" calls; the review
     copy's five acts are 5 "millisecond" calls; index.mjs's five `.split` sites are 5 "second" calls. A
     ratchet, so a landing that goes back to spelling a stamp by hand fails here. */
  t("and the helper is what stamps them: its named calls are at or above D-543's printed figure", calls >= 70, true);
}

/* WHAT THIS SUITE CANNOT SEE, NAMED RATHER THAN SCORED ZERO:
   - the ~150 other `toISOString()` stamps in store.mjs, which stamp milliseconds WITHOUT naming it (the
     platform's own spelling). They are one precision among themselves; the sweep found no string compare
     that crosses them with a whole-second column, but its matcher reads relational operators, `.sort`
     and `localeCompare` comparators, `reduce` accumulators, `MAX`/`MIN` and SQL `<`/`>` on at-named
     columns — a compare spelled any other way (a Set of strings, a template the SQL is built from) it
     does not see.
   - `setup.mjs` (two sites, inside the page it serves to a browser) and `subresources.mjs` (one, bundled
     into the PDF and OCR workers), which cannot import the Store's helper and keep their own spelling.
   - `published_cases.ratified_at`'s reducer (store.mjs, `#caseEditionState`) now ranks by
     instant; it is not driven here, because its members are stamped by one writer at one precision and
     only a legacy row could put two spellings under it. */

/* The suite ends on its own explicit exit (hygiene's rule), after the tally it printed. */
console.log(`\nd543-instant-precision: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
