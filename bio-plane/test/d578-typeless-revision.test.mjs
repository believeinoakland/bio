/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/d578-typeless-revision.control.mjs` — deliberately NOT a `.test.mjs`, because it patches COPIES of the sources and the battery must not discover it. Re-run from `bio-plane/`: `node test/d578-typeless-revision.control.mjs [arm]`. RESULTS, RUN 2026-09-25 by D-578's worker on land/worker/D-578 over land/worker/D-563 30cac9a6 (real `src/store.mjs` 3,483,555 B sha256 3ba539ba..., `checks/bio-checks.mjs` 1,008,693 B sha256 92b5f28a..., hashed before and after every arm and UNCHANGED): 6/6 AS DECLARED, exit 0. (a) baseline 18/0 · (b) no-carry — THE ROW'S CONTROL, the carry-forward dropped -> 13/5: the typeless revision reads the raw NOT NULL error, failing BY NAME at `a TYPELESS REVISION LANDS`, `SAYS the type was carried`, `still typed action, at the NEW bytes`, the inquiry arm and `NO op=promote answer carries a raw error with a stack`, while every creation and over-strictness arm stays green · (c) no-creation-refusal -> 13/5, the four creation arms and the stack arm · (d) silent-carry — the type carried, the answer silent -> 16/2, only the two arms reading `type_carried` · (e) raw-fallback — D-526's `normalizeType(meta.object_type)` fallback restored -> 16/2, the blank-envelope revision (meets C-86.2) and creation (LANDS typed '  ') · (f) spelling — OVER-STRICTNESS, the same rule written `== null`/`typeof !== "string"` -> 18/0. UNFIXED TREE (the suite pointed at land/worker/D-563 30cac9a6's own sources): 8 pass / 10 fail. */
/* D-578 — A TYPE IS NEVER LOST BY A REVISION, AND NEVER INVENTED FOR A CREATION.
 * `docs/architecture/BIO_Case_Making_v0_1.md` §2, C-2.5, D-510/D-526's derivation of the promoted type from the
 * DOCUMENT, D-547's retype fence (C-86.2), DEC-49 (C-86.5).
 *
 * THE DEFECT, measured through op=promote on land/worker/D-563 30cac9a6 before this item: a promotion whose document
 * and envelope both state no `object_type` left `promotedType` undefined, and the `bundles` INSERT threw "NOT NULL
 * constraint failed: bundles.object_type". The caller's answer was `{ ok: false, error: "Error: NOT NULL ... at act
 * (file:///.../src/store.mjs:18748:16) ..." }` — a raw stack, no code, no translation — for a REVISION and for a
 * CREATION alike (the transaction rolled back; nothing landed). The same run measured a blank `meta.object_type`
 * ('') over a typeless document: `normalizeType('')` is '' and the fallback took it as a type.
 *
 * THE FIX: `promotedType`'s envelope fallback asks the same `typeStated` question the document's does; a REVISION
 * stating no type takes the head's (`cur.object_type`, the only type C-86.2 admits) and the answer says so in
 * `type_carried`; a CREATION stating none is refused PROMOTED_TYPE_UNSTATED (C-86.5) before the first write.
 * NOT here (named in the item's report, not fixed): the same NOT NULL class on `current_state`, `created` and
 * `last_updated` (D-628), and the Durable Object's catch that serialises any throw's stack onto the wire (D-629). M-177.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.D578_SRC || fileURLToPath(new URL("../src", import.meta.url));
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
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: "adm-d578", MEMBER_TOKEN: "mem-d578", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const get = async (qs, token = "adm-d578") =>
  rP(await (await mf.dispatchFetch(`http://x/api/?token=${token}&${qs}`)).json());
/* Every op=promote answer this suite receives, so §5 can ask the whole corpus whether any carried a stack. */
const ANSWERS = [];
const post = async (op, body, token) => {
  const a = rP(await (await mf.dispatchFetch(`http://x/api/?op=${op}&token=${token}`,
    { method: "POST", body: JSON.stringify(body) })).json());
  if (op === "promote") ANSWERS.push(a);
  return a;
};

const HEAD = (id, type, schema, state = "planned") => [
  "---", `id: ${id}`, ...(type === null ? [] : [`object_type: ${type}`]), `schema: ${schema}`,
  'title: "Records request"', `current_state: ${state}`, "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []",
];
/* A conformant action with no projection blocks; `type: null` writes NO object_type line at all. */
const actionMd = (id, plan = "Ask for the transfer ledger.", type = "action") => [
  ...HEAD(id, type, "action@1"),
  "action_kind: cpra_request", "risk_tier: undetermined",
  "counterparty:", "  state: named", "  name: City Clerk",
  "---", "",
  "## Plan", "", plan, "",
  "## Status", "", "## Correspondence", "", "## Session Log", "", "## Review Notes", "",
].join(NL);
const inquiryMd = (id, question = "Where did the sewer transfer go?", type = "inquiry") => [
  ...HEAD(id, type, "inquiry@1", "open"),
  "---", "",
  "## Question", "", question, "",
  "## Session Log", "",
].join(NL);

let seq = 0;
/* `type` is the ENVELOPE's object_type; `undefined` sends the key not at all. */
const promote = async (id, text, { type, state, token = "mem-d578", base = null }) => {
  const meta = { group: "believe-in-oakland", title: "Records request", current_state: state,
                 created: NOW, last_updated: NOW };
  if (type !== undefined) meta.object_type = type;
  return post("promote", {
    bundleId: id, base, snapKey: `20260724T0500${String(++seq).padStart(2, "0")}Z_d578`,
    author: "member-ruth", meta,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
  }, token);
};
const head = async (id) => {
  const r = await get(`op=list&limit=500`);
  const row = (r?.bundles || []).find((b) => b.bundle_id === id);
  return row ? { type: row.object_type, sha: row.bundle_sha } : null;
};
/* A raw error from the store is `error: "Error: ... at act (file:///.../store.mjs:NNN:NN)"`. */
const carriesStack = (a) => typeof a?.error === "string" && /\n\s+at |store\.mjs:\d+/.test(a.error);

try {

/* A SIGNED-IN MEMBER (D-547's fixture): an inquiry created by a bare member token is an assistant's surfacing, which
   D-85 fences behind a run; a session is the credential that fence does not ask. */
const MEMBER = await (async () => {
  const add = await post("memberadd", { memberId: "ruth", cover: "cover for ruth", role: "admin",
                                        capabilities: ["contribute"] }, "adm-d578");
  const en = rP(await (await mf.dispatchFetch("http://x/api/?op=enroll",
    { method: "POST", body: JSON.stringify({ invite: add && add.invite, handle: "ruth", password: "ruth-passphrase-578" }) })).json());
  if (!en || en.ok !== true) throw new Error(`enroll ruth: ${JSON.stringify(en)}`);
  const lg = rP(await (await mf.dispatchFetch("http://x/api/?op=login",
    { method: "POST", body: JSON.stringify({ role: "member:ruth", password: "ruth-passphrase-578" }) })).json());
  if (!lg || !lg.token) throw new Error(`login ruth: ${JSON.stringify(lg)}`);
  return lg.token;
})();

/* ================================================== 1. THE ROW'S ARM */
console.log("\n--- 1. a revision whose document AND envelope state no type lands, carrying the head's type, and SAYS so ---");
const A = "ACTN-2026-0578-typeless-revision";
const made = await promote(A, actionMd(A), { type: "action", state: "planned" });
if (made?.ok !== true) throw new Error(`fixture action: ${JSON.stringify(made).slice(0, 400)}`);
const before = await head(A);
t("FIXTURE: the action is held, typed action (the corpus this section measures is non-empty)", before?.type, "action");
const typelessText = actionMd(A, "Ask for the transfer ledger, and the 2019 audit.", null);
t("FIXTURE: the revision's document carries no object_type line", /^object_type:/m.test(typelessText), false);
const re = await promote(A, typelessText, { type: undefined, state: "planned", base: before?.sha });
t("a TYPELESS REVISION LANDS — no raw NOT NULL error", [re?.ok, re?.reason ?? null, carriesStack(re)], [true, null, false]);
t("…and the answer SAYS the type was carried from the head, naming it",
  [re?.type_carried?.object_type, re?.type_carried?.from, typeof re?.type_carried?.says], ["action", "head", "string"]);
const after = await head(A);
t("…and the bundle is still typed `action`, at the NEW bytes", [after?.type, after?.sha], ["action", sha(typelessText)]);

/* ================================================== 2. THE CLASS, AND 'STATES NO TYPE' SPELLED OTHERWISE */
console.log("\n--- 2. the class: an inquiry, and a BLANK envelope type, carry the same way ---");
const Q = "INQ-2026-0578-typeless-inquiry";
const qm = await promote(Q, inquiryMd(Q), { type: "inquiry", state: "open", token: MEMBER });
if (qm?.ok !== true) throw new Error(`fixture inquiry: ${JSON.stringify(qm).slice(0, 400)}`);
const qBefore = await head(Q);
const qText = inquiryMd(Q, "Where did the sewer transfer go, and when?", null);
const qre = await promote(Q, qText, { type: "", state: "open", token: MEMBER, base: qBefore?.sha });
t("a typeless inquiry revision whose envelope says object_type '' LANDS carrying `inquiry` (a blank is no statement)",
  [qre?.ok, qre?.reason ?? null, qre?.type_carried?.object_type, (await head(Q))?.type], [true, null, "inquiry", "inquiry"]);

/* ================================================== 3. OVER-STRICTNESS: A STATED TYPE GAINS NO KEY */
console.log("\n--- 3. over-strictness: a revision that STATES its type is untouched, and gains no key ---");
const aNow = await head(A);
const stated = await promote(A, actionMd(A, "Ask for the ledger, the audit and the minutes."),
                             { type: undefined, state: "planned", base: aNow?.sha });
t("OVER-STRICTNESS: a revision whose DOCUMENT states `action` (envelope silent) lands with NO type_carried",
  [stated?.ok, "type_carried" in (stated ?? {})], [true, false]);
const aNow2 = await head(A);
const both = await promote(A, actionMd(A, "Ask for the ledger only."), { type: "action", state: "planned", base: aNow2?.sha });
t("OVER-STRICTNESS: a revision stating `action` in both lands with NO type_carried",
  [both?.ok, "type_carried" in (both ?? {})], [true, false]);
const aNow3 = await head(A);
const envOnly = await promote(A, actionMd(A, "Ask for the ledger, again.", null), { type: "action", state: "planned", base: aNow3?.sha });
t("OVER-STRICTNESS: a typeless document under an envelope stating `action` lands with NO type_carried (the envelope stated it)",
  [envOnly?.ok, "type_carried" in (envOnly ?? {}), (await head(A))?.type], [true, false, "action"]);

/* ================================================== 4. A CREATION HAS NO HEAD: REFUSED BY NAME */
console.log("\n--- 4. a CREATION that states no type is refused PROMOTED_TYPE_UNSTATED, and nothing lands ---");
const C = "ACTN-2026-0579-typeless-creation";
const cr = await promote(C, actionMd(C, "Ask for the transfer ledger.", null), { type: undefined, state: "planned" });
t("a typeless CREATION is REFUSED by name, not by a raw error",
  [cr?.ok, cr?.reason, cr?.code, carriesStack(cr)], [false, "PROMOTED_TYPE_UNSTATED", "PROMOTED_TYPE_UNSTATED", false]);
t("…and the refusal names the catalogue's check and its canned translation (DEC-49)",
  [cr?.check, typeof cr?.translation === "string" && cr.translation === PROMOTED_TYPE_CHECKS.PROMOTED_TYPE_UNSTATED?.translation],
  ["C-86.5", true]);   /* literal and typed, so two absent values cannot agree (the base's run passed an `undefined` pair) */
t("…and the catalogue row is C-86.5, in the family D-510 opened", PROMOTED_TYPE_CHECKS.PROMOTED_TYPE_UNSTATED?.check, "C-86.5");
t("…and its detail says nothing was written", /Nothing was written\./.test(cr?.detail ?? ""), true);
t("…and NOTHING is held under that id", await head(C), null);
const C2 = "ACTN-2026-0580-blank-type-creation";
const cr2 = await promote(C2, actionMd(C2, "Ask for the transfer ledger.", null), { type: "  ", state: "planned" });
t("a typeless creation whose envelope type is BLANK is refused the same way, and nothing is held (never typed '')",
  [cr2?.ok, cr2?.reason, await head(C2)], [false, "PROMOTED_TYPE_UNSTATED", null]);
const C3 = "ACTN-2026-0581-typed-creation";
const cr3 = await promote(C3, actionMd(C3, "Ask for the transfer ledger.", null), { type: "action", state: "planned" });
t("OVER-STRICTNESS: a creation whose ENVELOPE alone states the type still lands (D-510's fallback)",
  [cr3?.ok, (await head(C3))?.type], [true, "action"]);

/* ================================================== 5. NO ANSWER CARRIES A STACK */
console.log("\n--- 5. no op=promote answer this suite received carries a stack ---");
t("FIXTURE: the corpus of op=promote answers is non-empty (floor 10)", ANSWERS.length >= 10, true);
t("NO op=promote answer carries a raw error with a stack", ANSWERS.filter(carriesStack).map((a) => String(a.error).slice(0, 120)), []);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nd578-typeless-revision: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
