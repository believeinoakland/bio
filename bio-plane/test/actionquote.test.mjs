/* NEGATIVE CONTROL: (RUN 2026-09-23 by WORKER D-148, each arm ALONE through a harness that copied a uniquely-named per-arm pristine file, armed it by an anchor asserted to match exactly once, ran this suite, and restored it verified by sha256 AND cmp with a byte count printed — src/store.mjs aa4c3d33… 2,916,408 B, checks/bio-checks.mjs 2bcfa8bd… 853,662 B) (0) baseline, nothing armed -> 53 pass / 0 fail. (a) THE ROW'S OWN — drop "action_quotes" from purge's TABLES list in src/store.mjs, which serves the per-bundle AND the whole-store arm. DECLARED: section 5's purge arms fail by name; sections 1-4 do not move. ACTUAL -> 50/3, exactly "PER-BUNDLE ARM: ACT1's two quotes are gone from the table, the others stay", "WHOLE-STORE ARM: the table is empty" and "the projection is named in purge's TABLES list", and NOTHING in sections 1-4 — including "...and by counterparty only ACT2's quote remains", which stays GREEN because op=actionquotes joins through `bundles` and cannot see a row whose action was purged. That is why the arm is aimed at the stats count and not at a read. (b) OVER-STRICTNESS — narrow QUOTE_NUMBER_RE in checks/bio-checks.mjs to refuse thousands separators. DECLARED: the over-strictness assertion fails. ACTUAL -> 44/9: it fails, and so do the seven assertions downstream of the `1,083.00` quote, which the op then refuses — a fence one character tighter than its rule silently refuses the amount as the body wrote it. (c) THE ANSWERS RULE — let quote_answers name any earlier entry, not only a sent one. DECLARED: the answers-a-received refusal fails at the op, the catalog and promote. ACTUAL -> 46/7: those three, plus four counting assertions that move because the refused entry is now written. */
/* D-148: A FEE QUOTE IS EVIDENCE (Bob, 2026-09-22; `BIO_Case_Making_v0_1.md` §2).
 *
 * A `received` correspondence entry may carry a QUOTE — the amount and currency
 * as quoted, the stated basis verbatim, and the `sent` entry it answers — and a
 * later entry may name the quote it revises (a waiver is a revision to zero, both
 * entries standing). `promote` projects the quotes into `action_quotes`, which
 * `purge` clears in both arms, and op=actionquotes reads them by counterparty and
 * by request. The record states no finding about a quote.
 *
 * WHAT THIS SUITE HOLDS THE ROW TO, its accepts-when in order:
 *   1. a quote projects and reads back BY COUNTERPARTY and BY REQUEST;
 *   2. a revision to zero keeps BOTH entries, linked both ways;
 *   3. a quote answering no `sent` entry, or whose amount is not a number, is
 *      refused BY NAME — at the op, at the catalog (C-2.10 with the C-72 code) and
 *      at promote;
 *   4. an action with no quote reads BYTE-IDENTICAL;
 *   5. the projection is cleared by the per-bundle purge and the whole-store purge,
 *      PROVEN by the stats count rather than by a read (a read joins through
 *      `bundles` and cannot see a leftover row — see section 7).
 * Every op is driven through the CONTROL PLANE, a real caller's only route (D-43).
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkBundle, parseFrontmatter, quoteFindings, QUOTE_CHECKS } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const STORE_SRC = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");

/* The store's ambient clock is PINNED (M0-22's lesson in action-loop.test.mjs):
   nothing in this suite reads the wall. */
const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";
const AS_OF = Date.parse("2026-08-20T00:00:00Z");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d148", MEMBER_TOKEN: "mem-d148", PROBE_TOKEN: "prb-d148",
              VERSION: "test", BIO_NOW_MS: String(AS_OF) },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
const qs = (o) => Object.entries(o).filter(([, v]) => v !== undefined)
  .map(([k, v]) => `&${k}=${encodeURIComponent(v)}`).join("");

/* The two ops under test, UNINTERPOLATED so coverage credits them where a caller reaches them. */
const correspond = async (tok, p) => rP(await GET(`op=actioncorrespond&token=${tok}${qs(p)}`));
const quotes = async (tok, p) => rP(await GET(`op=actionquotes&token=${tok}${qs(p)}`));
const projection = async (tok, id) =>
  rP(await GET(`op=projection&token=${tok}&id=${encodeURIComponent(id)}&now=${AS_OF}`));
const stats = async () => rP(await GET(`op=stats&token=adm-d148`));
const bytesOf = async (tok, id) => rP(await GET(`op=file&token=${tok}&id=${encodeURIComponent(id)}&path=bundle.md`));

const actionMd = (id, { counterparty = ["counterparty:", "  state: named", "  name: City Clerk"],
                        correspondence = [] } = {}) => ["---",
  `id: ${id}`, "object_type: action", "schema: action@1",
  `title: "Records request ${id}"`, "current_state: active", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "action_kind: cpra_request", "risk_tier: 1",
  ...counterparty,
  ...(correspondence.length ? ["correspondence:", ...correspondence.flatMap((e) =>
    [`  - direction: ${e.direction}`, ...Object.entries(e).filter(([k]) => k !== "direction")
      .map(([k, v]) => `    ${k}: ${typeof v === "string" && k !== "at" && k !== "author" ? `"${v}"` : v}`)])] : []),
  "---", "",
  "## Plan", "", "Ask for the transfer ledger.", "",
  "## Status", "", "## Correspondence", "",
  "## Session Log", "", `### Session ${LATER} | Formation | nadia`,
  "Trigger: intake", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

/* ------------------------------------------------------------- the roster */
const enrol = async (memberId, password, role) => {
  const add = rP(await POST("op=memberadd&token=adm-d148",
    { memberId, cover: `cover for ${memberId}`, role, capabilities: ["contribute"] }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const NADIA = await enrol("nadia", "nadia-passphrase-1", "admin");
await enrol("omar", "omar-passphrase-1", "admin");        // the 4.2 two-administrator floor

let snapKeySeq = 0;   /* a per-suite COUNTER, never Math.random (M0-132) */
const promote = async (tok, id, text, base = null) =>
  rP(await POST(`op=promote&token=${tok}`, {
    bundleId: id, base, snapKey: `${id}-${base ? "rev" : "new"}-${String(++snapKeySeq).padStart(4, "0")}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    meta: { object_type: "action", group: "believe-in-oakland",
            current_state: "active", created: NOW, last_updated: LATER },
  }));

const ACT1 = "ACTN-2026-1480-clerk-ledger";
const ACT2 = "ACTN-2026-1481-clerk-minutes";
const ACT3 = "ACTN-2026-1482-no-quote";
const ACT4 = "ACTN-2026-1483-undetermined";

/* =====================================================================
   0. THE GROUND: four actions, three naming the same counterparty.
   ===================================================================== */
console.log("--- 0. the ground ---");
{
  for (const id of [ACT1, ACT2, ACT3]) t(`${id} lands`, (await promote(NADIA, id, actionMd(id))).ok, true);
  t(`${ACT4} lands with its counterparty stated undetermined`, (await promote(NADIA, ACT4, actionMd(ACT4, {
    counterparty: ["counterparty:", "  state: undetermined", "  basis: \"The department has not said who answers.\""] }))).ok, true);
  for (const id of [ACT1, ACT2, ACT3, ACT4])
    t(`${id}: the request is recorded as sent`,
      (await correspond(NADIA, { target: id, direction: "sent", at: "2026-07-03",
        account: "Emailed the records request for the transfer ledger." })).ok, true);
}

/* The no-quote action's read and bytes BEFORE any quote exists anywhere — the
   baseline section 4 compares against. ACT3 also gets its reply now, without a quote. */
const r3 = await correspond(NADIA, { target: ACT3, direction: "received", at: "2026-07-10",
  account: "The clerk acknowledged the request by phone." });
t("a received entry with NO quote parameter carries no quote key in its answer", [r3.ok, "quote" in r3], [true, false]);
const ACT3_BEFORE = JSON.stringify(await projection(NADIA, ACT3));
const ACT3_BYTES = await bytesOf(NADIA, ACT3);

/* =====================================================================
   1. A QUOTE PROJECTS AND READS BACK, BY REQUEST AND BY COUNTERPARTY.
   ===================================================================== */
console.log("\n--- 1. a quote projects and reads back ---");
{
  const q1 = await correspond(NADIA, { target: ACT1, direction: "received", at: "2026-07-15",
    account: "The clerk's letter quoted the fee.", quote_amount: "1,083.00", quote_currency: "USD",
    quote_basis: "12 hours of staff time at 90.25 per hour", quote_answers: "0" });
  t("op=actioncorrespond records a quote on a received entry", [q1.ok, q1.ord, q1.quote], [true, 1,
    { quote_amount: "1,083.00", quote_currency: "USD",
      quote_basis: "12 hours of staff time at 90.25 per hour", quote_answers: "0" }]);
  const doc = (await bytesOf(NADIA, ACT1));
  const text = typeof doc === "string" ? doc : (doc?.text ?? doc?.content ?? "");
  const entry = (parseFrontmatter(text).data?.correspondence || [])[1] || {};
  t("the quote is in the SIGNED BYTES, the amount kept as the body wrote it",
    [entry.quote_amount, entry.quote_currency, entry.quote_answers], ["1,083.00", "USD", 0]);
  const q2 = await correspond(NADIA, { target: ACT2, direction: "received", at: "2026-07-16",
    account: "The clerk quoted a per-page fee.", quote_amount: "250", quote_currency: "USD",
    quote_basis: "1,000 pages at 0.25 per page", quote_answers: "0" });
  t("a second action's quote records", q2.ok, true);
  const q4 = await correspond(NADIA, { target: ACT4, direction: "received", at: "2026-07-17",
    account: "Somebody quoted a fee.", quote_amount: "40", quote_currency: "USD", quote_answers: "0" });
  t("a quote with NO stated basis records (absent means none recorded, never none stated)", q4.ok, true);

  const byReq = await quotes(NADIA, { request: ACT1 });
  t("BY REQUEST: the quote reads back with what was quoted, when, for which request",
    [byReq.ok, byReq.by, byReq.count, byReq.quotes?.[0] && [byReq.quotes[0].action, byReq.quotes[0].ord,
      byReq.quotes[0].at, byReq.quotes[0].amount, byReq.quotes[0].value, byReq.quotes[0].currency,
      byReq.quotes[0].basis, byReq.quotes[0].answers, byReq.quotes[0].counterparty,
      byReq.quotes[0].held_as, byReq.quotes[0].author]],
    [true, "request", 1, [ACT1, 1, "2026-07-15", "1,083.00", 1083, "USD",
      "12 hours of staff time at 90.25 per hour", { ord: 0, at: "2026-07-03" }, "City Clerk",
      "testimony", "nadia"]]);
  const byCp = await quotes(NADIA, { counterparty: "City Clerk" });
  t("BY COUNTERPARTY: both actions' quotes, side by side",
    [byCp.ok, byCp.by, (byCp.quotes || []).map((q) => [q.action, q.ord, q.amount])],
    [true, "counterparty", [[ACT1, 1, "1,083.00"], [ACT2, 1, "250"]]]);
  t("an undetermined counterparty's quote is NOT reached by name — and IS by its request",
    [(byCp.quotes || []).some((q) => q.action === ACT4),
     (await quotes(NADIA, { request: ACT4 })).quotes?.map((q) => [q.amount, q.basis, q.counterparty])],
    [false, [["40", null, null]]]);
  t("the answer judges nothing: no field compares one quote to another",
    Object.keys(byCp.quotes?.[0] || {}).filter((k) => /exceed|excess|reasonable|lawful|verdict|finding|compare/i.test(k)),
    []);
  t("...and says so in its own words", /judges none/.test(byCp.says || ""), true);
}

/* =====================================================================
   2. A REVISION TO ZERO KEEPS BOTH ENTRIES.
   ===================================================================== */
console.log("\n--- 2. a waiver is a revision to zero, and both stand ---");
{
  t("the fee-waiver request is recorded as sent",
    (await correspond(NADIA, { target: ACT1, direction: "sent", at: "2026-07-20",
      account: "Asked the clerk to waive the fee." })).ok, true);
  const w = await correspond(NADIA, { target: ACT1, direction: "received", at: "2026-07-28",
    account: "The clerk waived the fee entirely.", quote_amount: "0", quote_currency: "USD",
    quote_basis: "fee waived", quote_answers: "2", quote_revises: "1" });
  t("the waiver records as a quote revising the first", [w.ok, w.ord], [true, 3]);
  const r = await quotes(NADIA, { request: ACT1 });
  t("BOTH entries stand: the charge and its waiver",
    (r.quotes || []).map((q) => [q.ord, q.amount, q.value, q.revises, q.revised_by]),
    [[1, "1,083.00", 1083, null, [3]], [3, "0", 0, 1, []]]);
  t("read by the waiver REQUEST alone (answers=2), only the waiver",
    (await quotes(NADIA, { request: ACT1, answers: "2" })).quotes?.map((q) => q.ord), [3]);
}

/* =====================================================================
   3. REFUSED BY NAME — at the op, at the catalog, and at promote.
   ===================================================================== */
console.log("\n--- 3. refused by name ---");
{
  const base = { target: ACT2, direction: "received", at: "2026-07-30", account: "A reply." };
  const cases = [
    ["an amount that is not a number", { quote_amount: "about a thousand", quote_currency: "USD", quote_answers: "0" },
     "QUOTE_AMOUNT_NOT_A_NUMBER"],
    ["a quote answering a RECEIVED entry, not a sent one", { quote_amount: "10", quote_currency: "USD", quote_answers: "1" },
     "QUOTE_ANSWERS_NO_SENT"],
    ["a quote answering an entry that does not exist", { quote_amount: "10", quote_currency: "USD", quote_answers: "99" },
     "QUOTE_ANSWERS_NO_SENT"],
    ["a quote answering nothing at all", { quote_amount: "10", quote_currency: "USD" }, "QUOTE_ANSWERS_NO_SENT"],
    ["a quote with no currency", { quote_amount: "10", quote_answers: "0" }, "QUOTE_NO_CURRENCY"],
    ["a revision naming an entry that is not a quote", { quote_amount: "0", quote_currency: "USD", quote_answers: "0",
      quote_revises: "0" }, "QUOTE_REVISES_NO_QUOTE"],
    ["a basis the grammar cannot hold", { quote_amount: "10", quote_currency: "USD", quote_answers: "0",
      quote_basis: "the \"standard\" rate" }, "QUOTE_TEXT_UNWRITABLE"],
  ];
  const before = (await quotes(NADIA, { request: ACT2 })).count;
  const refusedChecks = [];
  for (const [label, q, code] of cases) {
    const r = await correspond(NADIA, { ...base, ...q });
    t(`refused BY NAME: ${label}`, [r.ok, r.reason, r.code, r.check, typeof r.translation],
      [false, code, code, QUOTE_CHECKS[code].check, "string"]);
    refusedChecks.push([r.code, r.check]);
  }
  const sentQ = await correspond(NADIA, { target: ACT2, direction: "sent", at: "2026-07-30",
    account: "Our letter.", quote_amount: "10", quote_currency: "USD", quote_answers: "0" });
  t("refused BY NAME: a quote on a SENT entry", [sentQ.ok, sentQ.reason], [false, "QUOTE_NOT_ON_RECEIVED"]);
  refusedChecks.push([sentQ.code, sentQ.check]);
  /* The C-numbers AS LITERALS, each read back off a refusal the op actually returned —
     so a renumbered row fails here by name, not only through the catalog's own table. */
  const seen = Object.fromEntries(refusedChecks);
  t("each op refusal carries its own C-72 number",
    seen, { QUOTE_AMOUNT_NOT_A_NUMBER: "C-72.2", QUOTE_ANSWERS_NO_SENT: "C-72.4", QUOTE_NO_CURRENCY: "C-72.3",
            QUOTE_REVISES_NO_QUOTE: "C-72.5", QUOTE_TEXT_UNWRITABLE: "C-72.6", QUOTE_NOT_ON_RECEIVED: "C-72.1" });
  t("nothing was written by any refusal", (await quotes(NADIA, { request: ACT2 })).count, before);
  t("...and the lease was given back: the next entry records at once",
    (await correspond(NADIA, { target: ACT2, direction: "received", at: "2026-07-31",
      account: "A later acknowledgement." })).ok, true);

  /* THE CATALOG, over bytes: the same rule reports C-2.10 carrying the C-72 code. */
  const bad = actionMd("ACTN-2026-1484-bad-bytes", { correspondence: [
    { direction: "sent", at: "2026-07-03", account: "Our request.", author: "member:nadia" },
    { direction: "received", at: "2026-07-05", account: "Their reply.", author: "member:nadia",
      quote_amount: "a lot", quote_currency: "USD", quote_answers: 0 },
    { direction: "received", at: "2026-07-06", account: "Another reply.", author: "member:nadia",
      quote_amount: "5", quote_currency: "USD", quote_answers: 1 }] });
  const { findings } = await checkBundle({ folderName: "ACTN-2026-1484-bad-bytes",
    files: new Map([["bundle.md", bad]]), sha256: async (v) => sha(v), sha512: async () => new Uint8Array(64),
    nowMs: AS_OF, resolveTarget: () => true });
  t("the CATALOG refuses both at C-2.10, each carrying its C-72 code",
    findings.filter((x) => x.check === "C-2.10" && x.code).map((x) => x.code),
    ["QUOTE_AMOUNT_NOT_A_NUMBER", "QUOTE_ANSWERS_NO_SENT"]);
  const p = await promote(NADIA, "ACTN-2026-1484-bad-bytes", bad);
  t("and PROMOTE refuses the bytes, naming the codes",
    [p.ok, p.reason, (p.findings || []).map((x) => x.check)],
    [false, "CORRESPONDENCE_REFUSED", ["C-2.10", "C-2.10"]]);

  /* OVER-STRICTNESS: correct quotes in spellings the rule must accept. */
  const ok = (e) => quoteFindings([{ direction: "sent" }, { direction: "received", quote_answers: 0, ...e }], 1)
    .map((x) => x.code);
  t("OVER-STRICTNESS: plain, decimal, separated, integer-typed and zero amounts, and a symbol currency, all pass",
    [ok({ quote_amount: "1083", quote_currency: "USD" }), ok({ quote_amount: "1083.5", quote_currency: "USD" }),
     ok({ quote_amount: "1,083,000.00", quote_currency: "USD" }), ok({ quote_amount: 1083, quote_currency: "USD" }),
     ok({ quote_amount: "0", quote_currency: "$" })],
    [[], [], [], [], []]);
  t("...and a malformed separator is still not a number",
    ok({ quote_amount: "10,83", quote_currency: "USD" }), ["QUOTE_AMOUNT_NOT_A_NUMBER"]);
  const unasked = await quotes(NADIA, {});
  const both = await quotes(NADIA, { request: ACT1, counterparty: "City Clerk" });
  t("the read refuses a question with no axis, and with both, BY NAME",
    [unasked.reason, unasked.code, both.reason, both.code],
    ["QUOTE_READ_UNASKED", "QUOTE_READ_UNASKED", "QUOTE_READ_UNASKED", "QUOTE_READ_UNASKED"]);
  const badOrd = await quotes(NADIA, { request: ACT1, answers: "first" });
  t("...and answers= that is not a position, BY NAME", [badOrd.reason, badOrd.check],
    ["QUOTE_ANSWERS_NOT_AN_ORD", "C-72.8"]);
  t("the read's refusals carry their own C-72 numbers", [unasked.check, both.check], ["C-72.7", "C-72.7"]);
}

/* =====================================================================
   4. AN ACTION WITH NO QUOTE READS BYTE-IDENTICAL.
   ===================================================================== */
console.log("\n--- 4. an action with no quote reads byte-identical ---");
{
  t("ACT3's read after every quote above is BYTE-IDENTICAL to its read before any existed",
    JSON.stringify(await projection(NADIA, ACT3)), ACT3_BEFORE);
  t("the baseline is not empty: a read and bytes of real size were captured before any quote (floored)",
    [ACT3_BEFORE.length > 500, JSON.stringify(ACT3_BYTES).length > 500, /correspondence/.test(ACT3_BEFORE)],
    [true, true, true]);
  t("...and so are its bytes", JSON.stringify(await bytesOf(NADIA, ACT3)), JSON.stringify(ACT3_BYTES));
  const led = (JSON.parse(ACT3_BEFORE).action?.correspondence) || [];
  t("its ledger rows carry EXACTLY the pre-D-148 columns (no quote key added to an unquoted read)",
    [led.length, Object.keys(led[0] || {})],
    [2, ["ord", "direction", "at", "medium", "party", "artifact_bundle_id", "artifact_sha", "account",
         "author", "recorded_at"]]);
  const r = await quotes(NADIA, { request: ACT3 });
  t("read by request, it SAYS which level is empty: replies, and no quote on any",
    [r.ok, r.count, r.absence?.level, r.absence?.sent, r.absence?.received], [true, 0, "no_quote", 1, 1]);
  const none = await quotes(NADIA, { counterparty: "Nobody Of That Name" });
  t("read by an unknown counterparty, it says so rather than reading as a clean record",
    [none.ok, none.count, none.absence?.level], [true, 0, "no_quote_by_name"]);
}

/* =====================================================================
   5. PURGE CLEARS THE PROJECTION IN BOTH ARMS — PROVEN BY THE COUNT.
   A read cannot see this: op=actionquotes joins through `bundles`, so a row
   left behind after its action is purged is invisible to it. The stats count
   is the only instrument that can, which is why the control is aimed here.
   ===================================================================== */
console.log("\n--- 5. purge clears action_quotes in both arms ---");
{
  const st = await stats();
  t("the projection is COUNTED in stats", [typeof st.actionQuotes, st.actionQuotes], ["number", 4]);
  const purged = rP(await GET(`op=purge&token=adm-d148&confirm=bio&bundleId=${encodeURIComponent(ACT1)}`));
  t("a per-bundle purge of ACT1 succeeds", purged.ok, true);
  t("PER-BUNDLE ARM: ACT1's two quotes are gone from the table, the others stay",
    (await stats()).actionQuotes, 2);
  t("...and by counterparty only ACT2's quote remains",
    (await quotes(NADIA, { counterparty: "City Clerk" })).quotes?.map((q) => q.action), [ACT2]);
  const all = rP(await GET(`op=purge&token=adm-d148&confirm=bio`));
  t("a whole-store purge succeeds", all.ok, true);
  t("WHOLE-STORE ARM: the table is empty", (await stats()).actionQuotes, 0);
  t("the projection is named in purge's TABLES list",
    /"action_quotes"/.test(STORE_SRC.slice(STORE_SRC.indexOf("const TABLES = ["),
      STORE_SRC.indexOf("];", STORE_SRC.indexOf("const TABLES = [")))), true);
}

console.log(`\nactionquote: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
