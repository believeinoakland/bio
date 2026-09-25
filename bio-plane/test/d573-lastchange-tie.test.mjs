/* NEGATIVE CONTROL: DECLARED BEFORE ARMING, each arm ALONE on `src/store.mjs`, every restore verified by
   sha256 AND `cmp` against a pristine copy in the session scratchpad (never the worktree).

   (0) BASELINE, nothing armed -> 12 pass, 0 fail.

   (a) THE ROW'S CONTROL — DROP THE STATEMENT: `stated` loses `${tieStated}`. Declared: MUST FAIL block 1's
   "THE TIE STATEMENT" arm BY NAME (and its recipient-door twin, and block 4, which reads the same sentence).
   MUST NOT fail the pick, `undetermined_within`, block 2 or block 3.

   (b) DROP THE TIED ACT: `undetermined_within` always `[]`. Declared: MUST FAIL block 1's "THE TIE ARM" and
   block 4. MUST NOT fail the statement arms.

   (c) LOOSEN THE TIE to any two acts in one second (the whole-second condition removed). Declared: MUST FAIL
   block 3 alone.

   (d) OVER-STRICTNESS — the second read as the stamp's first 19 characters rather than by `Date.parse`, a
   correct spelling this suite did not anticipate. Declared: everything GREEN.

   RUN 2026-09-25 by the D-573 worker (branch land/worker/D-573), every anchor matched ONCE (armed), every
   restore `cmp` IDENTICAL and sha256 d06e4fe0…54a2f (store.mjs 3,473,576 bytes):
     (0) baseline -> 12 pass, 0 fail.
     (a) -> 9/3: THE TIE STATEMENT, its recipient-door twin, and block 4. As declared.
     (b) -> 10/2: THE TIE ARM and block 4. As declared.
     (c) -> 11/1: block 3 alone. As declared.
     (d) -> 12/0 GREEN. As declared.
 */

/* D-573 — A REVIEW COPY'S `last_change` STATES A TIE IT CANNOT ORDER, AND PICKS NOTHING SILENTLY.
 *
 * BOB #34 ruled at 2026-09-25 01:05Z (BIO_Publication_v0_1.md §6A.3 point 1): when the newest act and
 * another fall inside ONE second and one of them carries a whole-second stamp (recorded before D-543), the
 * instant-order pick stays the ONE in-band date (DEC-31), and `last_change.stated` says "which of <act A>
 * and <act B> came later is undetermined: <act A> was recorded to the second", with the tied act named in
 * `last_change.undetermined_within`. This suite drives it through `op=reviewcopy`, one block each:
 *   1. THE TIE ARM: a legacy whole-second acknowledgement and a millisecond comment in one second give the
 *      pick PLUS the statement, on the member door and the recipient's, and the in-band date is the pick;
 *   2. acts in DIFFERENT seconds give no statement, in both directions of which spelling is later;
 *   3. two MILLISECOND acts in one second are ordered by the record and give no statement (over-strictness);
 *   4. two WHOLE-SECOND acts in one second: the pick is kept and BOTH are said to be recorded to the second.
 * WHAT IT CANNOT SEE is at its foot.
 */

import { statedJSON } from "./stated.mjs";
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
  modules: true, modulesRoot: "/", scriptPath: SRC("d573-probe.mjs"), script: PROBE_SRC,
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "ProbeStore", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d573", MEMBER_TOKEN: "mem-d573", PROBE_TOKEN: "prb-d573", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const finish = async (aborted = false) => {
  console.log(`\nd573-lastchange-tie: ${pass} pass, ${fail} fail${aborted ? "  [FIXTURE ABORTED]" : ""}`);
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

console.log("\n--- d573-lastchange-tie ---");

/* ======================================================================= fixture */
const enrol = async (memberId, role, capabilities) => {
  const add = await POST("op=memberadd&token=adm-d573", { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add?.invite, handle: memberId, password: `${memberId}-passphrase-573` });
  if (!en?.ok) await bail(`enroll ${memberId}`, en);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-573` });
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
  mf, sha, machineToken: "adm-d573", owner: "iris",
  name: "PROJ-2026-5730-tie", created: NOW, updated: LATER });
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


const put = async (kind, at) => (await PROBE("restamp", { kind, draft: DRAFT, at }))?.rows;
const copies = async () => [await GET(`op=reviewcopy&draft=${DRAFT}&token=${IRIS}`),
                            await GET(`op=reviewcopy&secret=${SEC}`)];
const TIE = /which of (.+?) \((\S+)\) and (.+?) \((\S+)\) came later is undetermined: (.+?) was recorded to the second/i;
const BOTH = /came later is undetermined: both were recorded to the second/i;
const NONE = /came later is undetermined/i;
const brief = (u) => Array.isArray(u) ? u.map((x) => [x.kind, x.at, x.by_kind]) : u;
/* The edit and the grant are put an hour earlier throughout, so neither can be the pick or a tied act. */
const early = [await put("draft", "2026-08-01T11:00:00.000Z"), await put("grant", "2026-08-01T11:00:00.500Z")];

/* ======================================================================= 1. the tie arm */
console.log("\n--- 1. D-573's acceptance: a legacy whole-second acknowledgement and a millisecond comment in ONE second ---");
{
  const rows = [...early, await put("ack", "2026-08-01T12:00:00Z"), await put("comment", "2026-08-01T12:00:00.123Z")];
  t("the fixture: each of the four acts holds exactly the stamp this block put there (a re-stamp that matched "
  + "no row would make every arm below vacuous)", rows, [1, 1, 1, 1]);
  const [rc, rr] = await copies();
  t("THE PICK IS KEPT: the comment at `…:00.123Z` is the last change and the ONE in-band date, on both doors",
    [rc?.last_change?.kind, rc?.last_change?.at, rc?.inband?.date, rr?.last_change?.kind, rr?.inband?.date],
    ["comment", "2026-08-01T12:00:00.123Z", "2026-08-01T12:00:00.123Z", "comment", "2026-08-01T12:00:00.123Z"]);
  t("THE TIE ARM: `undetermined_within` names the whole-second acknowledgement as the tied act, on both doors",
    [brief(rc?.last_change?.undetermined_within), brief(rr?.last_change?.undetermined_within)],
    [[["statement acknowledgement", "2026-08-01T12:00:00Z", "recipient"]],
     [["statement acknowledgement", "2026-08-01T12:00:00Z", "recipient"]]]);
  const m = TIE.exec(rc?.last_change?.stated ?? "");
  t("THE TIE STATEMENT: `stated` says which of the acknowledgement and the comment came later is undetermined, "
  + "and that the ACKNOWLEDGEMENT (act A) was recorded to the second",
    m ? [/^a statement acknowledgement by /.test(m[1]), m[2], /^a comment by /.test(m[3]), m[4], m[5] === m[1]] : null,
    [true, "2026-08-01T12:00:00Z", true, "2026-08-01T12:00:00.123Z", true]);
  t("and the recipient's door says the same sentence", TIE.test(rr?.last_change?.stated ?? ""), true);
}

/* ======================================================================= 2. different seconds */
console.log("\n--- 2. acts in DIFFERENT seconds are ordered by the record, and carry no statement ---");
{
  const r1 = [await put("ack", "2026-08-01T12:00:00Z"), await put("comment", "2026-08-01T12:00:01.123Z")];
  const [a] = await copies();
  const r2 = [await put("comment", "2026-08-01T12:00:00.900Z"), await put("ack", "2026-08-01T12:00:01Z")];
  const [b] = await copies();
  t("the fixture re-stamped one row each time", [...r1, ...r2], [1, 1, 1, 1]);
  t("a whole-second acknowledgement a second BEFORE a millisecond comment: the comment, and NO statement",
    [a?.last_change?.kind, a?.last_change?.undetermined_within, NONE.test(a?.last_change?.stated ?? "x came later is undetermined")],
    ["comment", [], false]);
  t("a whole-second acknowledgement in the second AFTER a millisecond comment: the acknowledgement (its second "
  + "begins after the comment), and NO statement",
    [b?.last_change?.kind, b?.last_change?.at, b?.last_change?.undetermined_within,
     NONE.test(b?.last_change?.stated ?? "x came later is undetermined")],
    ["statement acknowledgement", "2026-08-01T12:00:01Z", [], false]);
}

/* ======================================================================= 3. over-strictness */
console.log("\n--- 3. two MILLISECOND acts inside one second are ordered by the record: no statement ---");
{
  const r = [await put("comment", "2026-08-01T12:00:00.123Z"), await put("ack", "2026-08-01T12:00:00.456Z")];
  const [c] = await copies();
  t("the fixture re-stamped one row each", r, [1, 1]);
  t("the acknowledgement at `.456` is the pick, and ONE SECOND SHARED IS NOT A TIE when both are at milliseconds",
    [c?.last_change?.kind, c?.last_change?.undetermined_within, NONE.test(c?.last_change?.stated ?? "x came later is undetermined")],
    ["statement acknowledgement", [], false]);
}

/* ======================================================================= 4. both whole */
console.log("\n--- 4. two WHOLE-SECOND acts in one second: the pick is kept, and both are said to be to the second ---");
{
  const r = [await put("comment", "2026-08-01T12:00:00Z"), await put("ack", "2026-08-01T12:00:00Z")];
  const [d] = await copies();
  t("the fixture re-stamped one row each", r, [1, 1]);
  t("equal instants keep the FIRST candidate in the answer's own order (the comment), the acknowledgement is "
  + "the tied act, and `stated` says both were recorded to the second",
    [d?.last_change?.kind, d?.inband?.date, brief(d?.last_change?.undetermined_within), BOTH.test(d?.last_change?.stated ?? "")],
    ["comment", "2026-08-01T12:00:00Z", [["statement acknowledgement", "2026-08-01T12:00:00Z", "recipient"]], true]);
}

/* WHAT THIS SUITE CANNOT SEE, NAMED RATHER THAN SCORED ZERO:
   - a tie between a whole-second act and a millisecond act that is NOT the pick's: two acts older than the
     pick may be mutually unordered, but neither is the date, so the copy says nothing of them — by scope.
   - the exported page: no surface exports a review copy on this tree; UI-69's export carries the in-band
     quartet, whose `date` is the pick, and the statement lives in `last_change`, not in the quartet.
   - the edit and the grant are not driven as tied acts; they share the one candidate path the comment and
     the acknowledgement take (`add`), which the ranking and the tie filter read without regard to kind.
   - other readers that rank two-precision stamps (`#caseEditionState`'s `ratified_at` reducer, D-543's
     residue) are outside §6A.3 point 1 and are not swept here. */

console.log(`\nd573-lastchange-tie: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
