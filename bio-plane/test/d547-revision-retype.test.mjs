/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/d547-revision-retype.control.mjs` — deliberately NOT a `.test.mjs`, because it patches COPIES of the sources and the battery must not discover it. Re-run from `bio-plane/`: `node test/d547-revision-retype.control.mjs [arm]`. RESULTS, RUN 2026-09-25 by D-547's worker on land/worker/D-547 over land/worker/D-526 d1622057 (real `src/store.mjs` 3,333,257 B sha256 7326e8da..., `checks/bio-checks.mjs` 958,774 B sha256 fb3012ba..., hashed before and after every arm and UNCHANGED): 5/5 AS DECLARED, exit 0. (a) baseline 14/0 · (b) no-compare — THE ROW'S CONTROL, the comparison dropped -> 6/8: the retype LANDS and the bundle's type changes in place, failing BY NAME at every §1 refusal arm, `TYPE IS UNCHANGED`, `the same bytes`, and both §2 arms, while the fixture, the catalogue row, the same-type revision, the `focus` spelling, CAS_STALE and replay stay green · (c) spelling — OVER-STRICTNESS, the same rule written with `!=`/`pkg.replay !== true` -> 14/0 · (d) raw-spelling — OVER-STRICTNESS, a fence tighter than its rule (the document's RAW `object_type` against the head) -> 13/1, only §3's `focus` arm · (e) no-replay-exemption -> 13/1, only §5. */
/* D-547 — A REVISION DOES NOT RETYPE THE BUNDLE IT REVISES.
 * `docs/architecture/BIO_Case_Making_v0_1.md` §2 (`action` IS the impact substrate), D-510/D-526's derivation of
 * the promoted type from the DOCUMENT, C-2.5 (a document's type pinned to its id prefix), DEC-49 (C-86.2).
 *
 * THE DEFECT, measured at the code on land/worker/D-526 d1622057 before this item: `promote` writes
 * `bundles.object_type` from `promotedType` (the revision's own document) through `INSERT ... ON CONFLICT DO UPDATE
 * SET object_type=excluded.object_type`, and NOTHING compared it with the head's `cur.object_type`. So a revision
 * whose document names a different type rewrote the column in place — an action became an inquiry — and every
 * type-scoped fence after it asked the wrong machine. C-2.5's id-prefix pin is a CATALOGUE check that promote does
 * not run, so it never answered at the write. §1 below is that measured failure; the control's `no-compare` arm
 * shows it landing.
 *
 * THE FIX: a non-replay revision whose STATED type differs (through `normalizeType`, both sides) from the head's is
 * refused REVISION_RETYPES_BUNDLE (C-86.2) after the compare-and-swap and before the first write.
 * NOT here: a bundle ALREADY retyped is not rewritten — M-156 counted none in either register.
 */
import { statedJSON } from "./stated.mjs";
import { withReplayProof } from "./replay-proof.mjs";    /* D-512: a replay is honoured only over provenance the plane verifies */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.D547_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const { PROMOTED_TYPE_CHECKS } = await import(join(SRC_DIR, "..", "checks", "bio-checks.mjs"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};

const sha = (v) => createHash("sha256").update(v).digest("hex");
const NL = "\n", NOW = "2026-07-24T00:00:00Z";

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: "adm-d547", MEMBER_TOKEN: "mem-d547", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const get = async (qs, token = "adm-d547") =>
  rP(await (await mf.dispatchFetch(`http://x/api/?token=${token}&${qs}`)).json());
const post = async (op, body, token) =>
  rP(await (await mf.dispatchFetch(`http://x/api/?op=${op}&token=${token}`,
    { method: "POST", body: JSON.stringify(body) })).json());

const HEAD = (id, type, schema) => [
  "---", `id: ${id}`, `object_type: ${type}`, `schema: ${schema}`,
  'title: "Records request"', "current_state: planned", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []",
];
/* A conformant action with no projection blocks, so nothing but this item's fence has anything to refuse. */
const actionMd = (id, plan = "Ask for the transfer ledger.") => [
  ...HEAD(id, "action", "action@1"),
  "action_kind: cpra_request", "risk_tier: undetermined",
  "counterparty:", "  state: named", "  name: City Clerk",
  "---", "",
  "## Plan", "", plan, "",
  "## Status", "", "## Correspondence", "", "## Session Log", "", "## Review Notes", "",
].join(NL);
/* A minimal inquiry; `type` lets §3 write the legacy spelling. */
const inquiryMd = (id, type = "inquiry", question = "Where did the sewer transfer go?") => [
  ...HEAD(id, type, "inquiry@1").map((l) => l === "current_state: planned" ? "current_state: open" : l),
  "---", "",
  "## Question", "", question, "",
  "## Session Log", "",
].join(NL);

let seq = 0;
/* CORRECTED at c21-batch28 (CONDUCT #21), where D-547 first met D-512: a REPLAYED promotion is now honoured only
   over a drive-provenance capture the plane verifies (C-66.6 REPLAY_UNVERIFIED), so §5's bare admin `replay: true`
   was refused before it could reach D-547's exemption. Its replays now carry the proof D-512's own suites use
   (`withReplayProof`), so §5 still asks the question it was written for — does a VERIFIED replay that retypes
   pass this fence — rather than D-512's. */
const promote = async (id, text, { type, state, token, base = null, extra = {} }) => {
  const pkg = {
    bundleId: id, base, snapKey: `20260724T0400${String(++seq).padStart(2, "0")}Z_d547`,
    author: "member-ruth",
    meta: { group: "believe-in-oakland", title: "Records request", object_type: type,
            current_state: state, created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [], ...extra,
  };
  return post("promote", extra.replay ? await withReplayProof(mf, `token=${token}`, pkg) : pkg, token);
};
const head = async (id) => {
  const r = await get(`op=list&limit=500`);
  const row = (r?.bundles || []).find((b) => b.bundle_id === id);
  return row ? { type: row.object_type, sha: row.bundle_sha } : null;
};

try {

/* A SIGNED-IN MEMBER: the rule is about the REQUEST, and a session is the credential no machine-only fence asks. */
const MEMBER = await (async () => {
  const add = await post("memberadd", { memberId: "ruth", cover: "cover for ruth", role: "admin",
                                        capabilities: ["contribute"] }, "adm-d547");
  const en = rP(await (await mf.dispatchFetch("http://x/api/?op=enroll",
    { method: "POST", body: JSON.stringify({ invite: add && add.invite, handle: "ruth", password: "ruth-passphrase-547" }) })).json());
  if (!en || en.ok !== true) throw new Error(`enroll ruth: ${JSON.stringify(en)}`);
  const lg = rP(await (await mf.dispatchFetch("http://x/api/?op=login",
    { method: "POST", body: JSON.stringify({ role: "member:ruth", password: "ruth-passphrase-547" }) })).json());
  if (!lg || !lg.token) throw new Error(`login ruth: ${JSON.stringify(lg)}`);
  return lg.token;
})();

/* ================================================== 1. THE ROW'S ARM */
console.log("\n--- 1. a revision that retypes an ACTION as an INQUIRY is refused BY NAME, and the type is unchanged ---");
const A = "ACTN-2026-0547-retyped-action";
const made = await promote(A, actionMd(A), { type: "action", state: "planned", token: MEMBER });
if (made?.ok !== true) throw new Error(`fixture action: ${JSON.stringify(made).slice(0, 400)}`);
const before = await head(A);
t("FIXTURE: the action is held, typed action (the corpus this section measures is non-empty)",
  before?.type, "action");
/* The envelope AGREES with the document here, so D-510's C-86.1 has nothing to say: only this item's fence can. */
const re = await promote(A, inquiryMd(A), { type: "inquiry", state: "open", token: MEMBER, base: before?.sha });
t("a revision whose document and envelope both say `inquiry`, over a head that is an `action`, is REFUSED",
  [re?.ok, re?.reason], [false, "REVISION_RETYPES_BUNDLE"]);
t("…and the refusal names the check the catalogue holds, with its canned translation (DEC-49)",
  [re?.code, re?.check, re?.translation],
  ["REVISION_RETYPES_BUNDLE", PROMOTED_TYPE_CHECKS.REVISION_RETYPES_BUNDLE?.check,
   PROMOTED_TYPE_CHECKS.REVISION_RETYPES_BUNDLE?.translation]);
t("…and the catalogue row is C-86.2, in the family D-510 opened",
  PROMOTED_TYPE_CHECKS.REVISION_RETYPES_BUNDLE?.check, "C-86.2");
t("…and it SAYS BOTH TYPES, the head's and the revision's",
  [re?.head_type, re?.revision_type], ["action", "inquiry"]);
t("…and its detail says nothing was written", /Nothing was written\./.test(re?.detail ?? ""), true);
const after = await head(A);
t("the bundle's TYPE IS UNCHANGED after the refused retype — still `action`", after?.type, "action");
t("…and its head is the same bytes (nothing of the revision landed)", after?.sha, before?.sha);

/* OVER-STRICTNESS: the fence is about the TYPE, never about revising. Based on the head AS IT NOW READS, so that in
   the control's `no-compare` arm (where the retype above lands) this arm measures the same thing and not CAS_STALE. */
const same = await promote(A, actionMd(A, "Ask for the transfer ledger, and the 2019 audit."),
                           { type: "action", state: "planned", token: MEMBER, base: after?.sha });
t("OVER-STRICTNESS: a revision of the same action that keeps its type LANDS",
  [same?.ok, same?.reason ?? null, (await head(A))?.type], [true, null, "action"]);

/* ================================================== 2. THE OTHER DIRECTION, AND A MACHINE CREDENTIAL */
console.log("\n--- 2. the class: an INQUIRY revised as an ACTION, by a machine credential, is refused by the same name ---");
const Q = "INQ-2026-0547-retyped-inquiry";
const qm = await promote(Q, inquiryMd(Q), { type: "inquiry", state: "open", token: MEMBER });
if (qm?.ok !== true) throw new Error(`fixture inquiry: ${JSON.stringify(qm).slice(0, 400)}`);
const qBefore = await head(Q);
const qre = await promote(Q, actionMd(Q), { type: "action", state: "planned", token: "mem-d547", base: qBefore?.sha });
t("an inquiry revised as an action is REFUSED REVISION_RETYPES_BUNDLE",
  [qre?.ok, qre?.reason, qre?.head_type, qre?.revision_type], [false, "REVISION_RETYPES_BUNDLE", "inquiry", "action"]);
t("…and the inquiry is still an inquiry, at the same head",
  [(await head(Q))?.type, (await head(Q))?.sha], ["inquiry", qBefore?.sha]);

/* ================================================== 3. OVER-STRICTNESS: THE LEGACY SPELLING */
console.log("\n--- 3. over-strictness: `focus` is a spelling of `inquiry`, not a retype ---");
const F = "INQ-2026-0548-legacy-spelling";
const fm = await promote(F, inquiryMd(F), { type: "inquiry", state: "open", token: MEMBER });
if (fm?.ok !== true) throw new Error(`fixture inquiry F: ${JSON.stringify(fm).slice(0, 400)}`);
const fBefore = await head(F);
const fre = await promote(F, inquiryMd(F, "focus", "Where did the sewer transfer go, and when?"),
                         { type: "focus", state: "open", token: MEMBER, base: fBefore?.sha });
t("OVER-STRICTNESS: a revision stating `focus` over an `inquiry` head is NOT a retype, and LANDS typed inquiry",
  [fre?.ok, fre?.reason ?? null, (await head(F))?.type], [true, null, "inquiry"]);

/* ================================================== 4. ORDER: A STALE BASE ANSWERS FIRST */
console.log("\n--- 4. a retype at a STALE base answers CAS_STALE: the head it would be compared with is not the one the caller saw ---");
const stale = await promote(A, inquiryMd(A), { type: "inquiry", state: "open", token: MEMBER, base: before?.sha });
t("a retype sent against the superseded head is refused CAS_STALE, not REVISION_RETYPES_BUNDLE",
  [stale?.ok, stale?.reason], [false, "CAS_STALE"]);

/* ================================================== 5. REPLAY IS EXEMPT */
console.log("\n--- 5. replay: the record's own history stays holdable verbatim (D-510's exemption; D-511 fences who may assert it) ---");
const R = "ACTN-2026-0549-replayed-retype";
const rm = await promote(R, actionMd(R), { type: "action", state: "planned", token: "adm-d547", extra: { replay: true } });
if (rm?.ok !== true) throw new Error(`fixture replay action: ${JSON.stringify(rm).slice(0, 400)}`);
const rBefore = await head(R);
const rre = await promote(R, actionMd(R, "Carried from the old record.").replace("object_type: action", "object_type: information")
                                .replace("schema: action@1", "schema: information@1"),
                         { type: "information", state: "planned", token: "adm-d547", base: rBefore?.sha, extra: { replay: true } });
t("a REPLAYED revision that retypes is not refused by this fence (the history it replays is the record's own)",
  [rre?.reason === "REVISION_RETYPES_BUNDLE", rre?.ok], [false, true]);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nd547-revision-retype: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
