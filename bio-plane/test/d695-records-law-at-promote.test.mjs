/* NEGATIVE CONTROL: (RUN 2026-09-25 by the D-695 worker on land/worker/D-695 over D-689 @ 4ef3d303, each arm ALONE on
   src/store.mjs, restored by cp from a uniquely-named per-arm pristine copy in the session scratchpad and verified by
   sha256 fb38648c2440… AND cmp at 3,479,773 B. BASELINE 16 pass / 0 fail. REPRODUCTION, before the fix: 5/11 — the
   250-character law, the law on `other` (a machine's too), on cpra_request, and a numeric law all LANDED.)
   (A) THE ROW'S CONTROL — remove the call, `recordsLawFindings(docFmW, lawF);` -> a comment. DECLARED: §1, §2, §3 and
   §5 fail (10); the fixture, §4's four over-strictness arms and §6's row hold (6). ACTUAL 6/10, AS DECLARED, the first
   failure BY NAME "a MEMBER's records_request stating a 250-character law is refused RECORDS_LAW_REFUSED…" — the
   over-long law lands.
   (B) OVER-STRICTNESS — refuse any `law` present, `if (lawErrs.length || docFmW.law !== undefined)`. DECLARED: exactly
   §4's two law-carrying arms fail (the CITATION_MAX-long citation, and `law: ""` on another kind). ACTUAL 14/2, AS
   DECLARED. */
/* D-695: C-2.10's `law` ARM RUNS AT THE ACT (`docs/architecture/BIO_Case_Making_v0_1.md` §2, *A RECORDS REQUEST NAMES
 * EVERY LAW THAT GOVERNS IT*: "C-2.10 refuses a `law` on any other kind (it would state a law no read shows) and one
 * longer than a citation"; DEC-49 as `BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it).
 *
 * REC-201 built the arm as `recordsLawFindings` and called it only from `checkActionExtension`, which is reached from
 * `checkBundle` — the audit sweep, never the write. So `op=promote` LANDED a 250-character `law` and a `law` on a kind
 * that is not a records_request: the refusal the design declares existed only in the catalogue, and the record held
 * what its rules forbid until a sweep said so after the fact.
 *
 * WHAT THIS SUITE HOLDS THE ROW TO, each in the direction that fails, all THROUGH THE OP with a MEMBER's session (the
 * machine fence, C-32.20, is not what refuses here — a member may state a law):
 *   1. A `law` longer than CITATION_MAX on a records_request is refused RECORDS_LAW_REFUSED, C-73.6, its translation
 *      on the wire, and findings[].detail carrying the catalogue's own C-2.10 sentence; nothing lands.
 *   2. A `law` on a kind that is not a records_request (`other`, and `cpra_request`, whose kind already names its law)
 *      is refused by the same name; nothing lands. A MACHINE writing `law` on an `other` is refused too — C-32.20 does
 *      not see that write (the key states nothing for `other`), so without this arm a machine could land it.
 *   3. A `law` that is not text is refused by the same name.
 *   4. OVER-STRICTNESS: a records_request stating a citation of exactly CITATION_MAX characters lands; one stating
 *      no law lands; a `law: ""` on another kind lands (absent, null or empty is the honest undetermined, REC-201).
 *   5. A REVISION is judged as a creation is: a member's revision lengthening a law past a citation is refused, and
 *      the version did not move.
 *   6. The catalogue row: C-73.6, sited at its one region, with a canned translation.
 *
 * WHAT IT CANNOT SEE: whether a citation is the RIGHT law — nobody but a member can say, by design. Nor any other
 * catalogue arm that runs only at the sweep: that census is the D-695 report's, by name.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { CITATION_MAX, GOVERNING_LAW_CHECKS } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";
const PINNED_MS = Date.parse("2026-08-20T00:00:00Z");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const codeOf = (r) => (r && typeof r.reason === "string") ? r.reason : (r && typeof r.code === "string") ? r.code : null;

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d695", MEMBER_TOKEN: "mem-d695", PROBE_TOKEN: "prb-d695",
              VERSION: "test", BIO_NOW_MS: String(PINNED_MS) },
});
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();

/* `law` is written as a YAML scalar: a string is double-quoted, anything else (a number) as it stands. */
const actionMd = (id, { kind = "records_request", law, plan = "Ask for the transfer ledger." } = {}) => ["---",
  `id: ${id}`, "object_type: action", "schema: action@1",
  `title: "Records request ${id}"`, "current_state: planned", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  `action_kind: ${kind}`, "risk_tier: undetermined",
  ...(law === undefined ? [] : [`law: ${typeof law === "string" ? `"${law}"` : law}`]),
  "counterparty:", "  state: named", "  name: City Clerk",
  "---", "",
  "## Plan", "", plan, "",
  "## Status", "", "## Correspondence", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");

let snapKeySeq = 0;
const promote = async (tok, id, text, base = null) =>
  rP(await POST(`op=promote&token=${tok}`, {
    bundleId: id, base, snapKey: `${id}-${base ? "rev" : "new"}-${String(++snapKeySeq).padStart(4, "0")}`,
    files: [{ path: "bundle.md", text, bytes: Buffer.byteLength(text), sha256: sha(text) }],
    register: [],
    meta: { object_type: "action", group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: "planned", created: NOW, last_updated: LATER },
  }));
const view = async (tok, id) => rP(await GET(`op=projection&token=${tok}&id=${encodeURIComponent(id)}`)) ?? null;
const landed = async (tok, id) => !!(await view(tok, id))?.bundle_sha;

const add = rP(await POST("op=memberadd&token=adm-d695",
  { memberId: "ruth", cover: "cover for ruth", role: "admin", capabilities: ["contribute"] }));
const en = rP(await POST("op=enroll", { invite: add?.invite, handle: "ruth", password: "ruth-passphrase-1" }));
if (!en?.ok) throw new Error(`enroll ruth: ${JSON.stringify(en)}`);
const lg = rP(await POST("op=login", { role: "member:ruth", password: "ruth-passphrase-1" }));
if (!lg?.token) throw new Error(`login ruth: ${JSON.stringify(lg)}`);
const RUTH = lg.token;
const minted = rP(await POST(`op=aicredentialmint&token=${RUTH}`, {
  tokenId: "d695-machine", principalKind: "member", principalMember: "ruth",
  taskScope: "D-695's own: create and revise actions",
  writes: ["promote"],
  note: "D-695. A member authored this scope so the credential layer is held open and the law arm answers." }));
if (!minted?.ok) throw new Error(`mint: ${JSON.stringify(minted).slice(0, 400)}`);
const AI = minted.token;

const LONG = "Cal. Gov. Code § 7920.000 et seq. ".repeat(8).trim().padEnd(250, "x").slice(0, 250);
const EXACT = "Cal. Gov. Code § 7920.000 ".padEnd(CITATION_MAX, "y").slice(0, CITATION_MAX);
t("(the fixture: the over-long law is 250 characters, past CITATION_MAX; the exact one is CITATION_MAX)",
  [LONG.length, LONG.length > CITATION_MAX, EXACT.length], [250, true, CITATION_MAX]);

const refusedBy = (r) => [codeOf(r), r?.code, r?.check, typeof r?.translation === "string" && r.translation.length > 40,
  Array.isArray(r?.findings) && r.findings.length > 0 && r.findings.every((x) => x.check === "C-2.10" && typeof x.detail === "string")];
const REFUSED = ["RECORDS_LAW_REFUSED", "RECORDS_LAW_REFUSED", "C-73.6", true, true];

/* ===================================================================== */
console.log("\n--- 1. a law longer than a citation is refused at the act ---");
{
  const ID = "ACTN-2026-6950-long-law";
  const r = await promote(RUTH, ID, actionMd(ID, { law: LONG }));
  t("a MEMBER's records_request stating a 250-character law is refused RECORDS_LAW_REFUSED, C-73.6, translated, "
  + "findings[] carrying C-2.10", refusedBy(r), REFUSED);
  t("...its finding is the catalogue's own sentence, naming the bound", /longer than 200 characters/.test(r?.findings?.[0]?.detail ?? ""), true);
  t("...and nothing landed", await landed(RUTH, ID), false);
}

/* ===================================================================== */
console.log("\n--- 2. a law on a kind that is not a records_request is refused at the act ---");
{
  const ID = "ACTN-2026-6951-other-law";
  const r = await promote(RUTH, ID, actionMd(ID, { kind: "other", law: "5 U.S.C. § 552" }));
  t("a MEMBER's `other` action carrying a law is refused by the same name", refusedBy(r), REFUSED);
  t("...its finding names the kind", /on a other it states a law no read shows/.test(r?.findings?.[0]?.detail ?? ""), true);
  t("...and nothing landed", await landed(RUTH, ID), false);
  const C = "ACTN-2026-6952-cpra-law";
  const c = await promote(RUTH, C, actionMd(C, { kind: "cpra_request", law: "5 U.S.C. § 552" }));
  t("a MEMBER's cpra_request carrying a second law in `law` is refused by the same name, and nothing landed",
    [codeOf(c), await landed(RUTH, C)], ["RECORDS_LAW_REFUSED", false]);
  const M = "ACTN-2026-6953-machine-other-law";
  const m = await promote(AI, M, actionMd(M, { kind: "other", law: "5 U.S.C. § 552" }));
  t("a MACHINE's `other` carrying a law — which C-32.20's key does not see — is refused by this name, nothing landed",
    [codeOf(m), await landed(RUTH, M)], ["RECORDS_LAW_REFUSED", false]);
}

/* ===================================================================== */
console.log("\n--- 3. a law that is not text ---");
{
  const ID = "ACTN-2026-6954-number-law";
  const r = await promote(RUTH, ID, actionMd(ID, { law: 552 }));
  t("a records_request whose law is a number is refused by the same name, and nothing landed",
    [codeOf(r), /not a citation/.test(r?.findings?.[0]?.detail ?? ""), await landed(RUTH, ID)],
    ["RECORDS_LAW_REFUSED", true, false]);
}

/* ===================================================================== */
console.log("\n--- 4. over-strictness: what the rule admits lands ---");
{
  const A = "ACTN-2026-6955-exact-law";
  const a = await promote(RUTH, A, actionMd(A, { law: EXACT }));
  t("a records_request stating a law of EXACTLY CITATION_MAX characters lands, and reads it verbatim",
    [a?.ok, (await view(RUTH, A))?.action?.law?.law], [true, EXACT]);
  const B = "ACTN-2026-6956-no-law";
  const b = await promote(RUTH, B, actionMd(B, {}));
  t("a records_request stating NO law lands, and reads undetermined", [b?.ok, (await view(RUTH, B))?.action?.law?.state], [true, "undetermined"]);
  const C = "ACTN-2026-6957-other-empty-law";
  const c = await promote(RUTH, C, actionMd(C, { kind: "other", law: "" }));
  t("an `other` action with `law: \"\"` lands (empty is the honest undetermined, REC-201)", c?.ok, true);
  const D = "ACTN-2026-6958-machine-no-law";
  const d = await promote(AI, D, actionMd(D, {}));
  t("a MACHINE's records_request naming no law lands (D-689: it may)", d?.ok, true);
}

/* ===================================================================== */
console.log("\n--- 5. a revision is judged as a creation is ---");
{
  const ID = "ACTN-2026-6955-exact-law";
  const before = (await view(RUTH, ID))?.bundle_sha;
  const r = await promote(RUTH, ID, actionMd(ID, { law: LONG, plan: "Ask for the ledger and the memo." }), before);
  t("a member's REVISION lengthening the law past a citation is refused by the same name, and the version did not move",
    [codeOf(r), (await view(RUTH, ID))?.bundle_sha === before], ["RECORDS_LAW_REFUSED", true]);
}

/* ===================================================================== */
console.log("\n--- 6. the catalogue row ---");
t("the catalogue row: C-73.6, sited at its one region, with a canned translation",
  [GOVERNING_LAW_CHECKS.RECORDS_LAW_REFUSED?.check, GOVERNING_LAW_CHECKS.RECORDS_LAW_REFUSED?.where,
   typeof GOVERNING_LAW_CHECKS.RECORDS_LAW_REFUSED?.translation],
  ["C-73.6", "src/store.mjs promote > is-promote-records-law", "string"]);

await mf.dispose();
console.log(`\nd695-records-law-at-promote: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
