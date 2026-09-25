/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/d628-promoted-fields.control.mjs` — deliberately NOT a `.test.mjs`, because it patches COPIES of the sources and the battery must not discover it. Re-run from `bio-plane/`: `node test/d628-promoted-fields.control.mjs [arm]`. RESULTS, RUN 2026-09-25 by D-628's worker on land/worker/D-628 over land/worker/D-615 8b3ab6ae (real `src/store.mjs` 3,502,466 B sha256 a2195523..., `checks/bio-checks.mjs` 1,013,356 B sha256 2ad9570d..., hashed before and after every arm and UNCHANGED): 6/6 AS DECLARED, exit 0. (a) baseline 35/0 · (b) no-creation-refusal — THE ROW'S CONTROL, the pre-write check removed -> 26/9: every creation arm reads the raw NOT NULL stack, failing BY NAME at the three `a CREATION stating no <field> is REFUSED by name`, the all-three, blank-envelope and string-meta creation arms and `NO op=promote answer carries a raw error with a stack`, while every revision and over-strictness arm and `nothing is held` stay green (REC-180's rollback) · (c) no-state-carry -> 30/5, the three current_state revision arms, the string-meta revision and the stack arm · (d) silent-carry — carried, the answer silent -> 31/4, only the arms reading `fields_carried` · (e) raw-fallback — D-563's raw `meta.current_state` fallback restored -> 34/1, the blank-envelope creation (a state of '  ' taken as stated) · (f) spelling — OVER-STRICTNESS, `== null` / a `typeof` filter -> 35/0. UNFIXED TREE (the suite pointed at land/worker/D-615 8b3ab6ae's own sources): 15 pass / 20 fail. */
/* D-628 — WHERE A THING STANDS AND WHEN IT WAS MADE AND LAST CHANGED ARE NEVER LOST BY A REVISION, AND NEVER INVENTED
 * FOR A CREATION. `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §3.1 (the core fields) and §4 (per-type
 * state machines), with D-578's carry-or-refuse shape (C-86.5); DEC-49 (C-86.8).
 *
 * THE DEFECT, measured through op=promote on land/worker/D-615 8b3ab6ae before this item: a promotion whose document
 * and envelope both state no `current_state`, no `created` or no `last_updated` left the derived value undefined, and
 * the `bundles` INSERT threw "NOT NULL constraint failed: bundles.<field>". The caller's answer was `{ ok: false,
 * error: "Error: NOT NULL ... at act (file:///.../src/store.mjs:18863:16) ..." }` — a raw stack — for a CREATION and a
 * REVISION of each of the three, and for a `meta` sent as a STRING over a document missing one (a string `meta` over a
 * complete document LANDED: it states nothing, and the document decided).
 *
 * THE FIX: the envelope's fallback for each field asks `textStated`, as the document's side does (a blank or non-string
 * value is no statement); a REVISION stating one nowhere takes the head's value and the answer says so in
 * `fields_carried`; a CREATION stating one nowhere is refused PROMOTED_FIELD_UNSTATED (C-86.8) before the first write.
 * A string `meta` is READ as stating nothing (D-563's `envelopeMeta`), so the carry-or-refuse above answers it.
 * NOT here: D-692 (a revision restating a DIFFERENT `created`), the next row on this function.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.D628_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const { PROMOTED_TYPE_CHECKS } = await import(join(SRC_DIR, "..", "checks", "bio-checks.mjs"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const sha = (v) => createHash("sha256").update(v).digest("hex");
const NL = "\n", MADE = "2026-07-24T00:00:00Z", CHANGED = "2026-07-25T00:00:00Z";
const FIELDS = ["current_state", "created", "last_updated"];

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: "adm-d628", MEMBER_TOKEN: "mem-d628", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const get = async (qs) => rP(await (await mf.dispatchFetch(`http://x/api/?token=adm-d628&${qs}`)).json());
/* Every op=promote answer this suite receives, so §5 can ask the whole corpus whether any carried a stack. */
const ANSWERS = [];
const promoteRaw = async (body) => {
  const a = rP(await (await mf.dispatchFetch(`http://x/api/?op=promote&token=mem-d628`,
    { method: "POST", body: JSON.stringify(body) })).json());
  ANSWERS.push(a);
  return a;
};

/* A conformant action with no projection blocks; each field named in `omit` has NO line at all. */
const actionMd = (id, { plan = "Ask for the transfer ledger.", omit = [], state = "planned" } = {}) => [
  "---", `id: ${id}`, "object_type: action", "schema: action@1", 'title: "Records request"',
  ...(omit.includes("current_state") ? [] : [`current_state: ${state}`]), "prior_state: null",
  ...(omit.includes("created") ? [] : [`created: "${MADE}"`]),
  ...(omit.includes("last_updated") ? [] : [`last_updated: "${CHANGED}"`]),
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []",
  /* CORRECTED 2026-09-25 at the c23-batch30 union (CONDUCT #23), never exempted, as D-689 corrected six suites of the
     same shape: this fixture (D-628 (cut over D-615, before D-689)) created a `cpra_request` through an operator bearer token — a machine
     identity — and C-32.20 (D-689, merged beside it) now refuses a machine stating the law a records request is made
     under (BOB #35: only a member's act states it). The kind is not this suite's subject, so the fixture is the
     law-neutral `records_request` stating no law, which a machine may create. */
  "action_kind: records_request", "risk_tier: undetermined",
  "counterparty:", "  state: named", "  name: City Clerk",
  "---", "",
  "## Plan", "", plan, "",
  "## Status", "", "## Correspondence", "", "## Session Log", "", "## Review Notes", "",
].join(NL);

let seq = 0;
/* `meta` is sent AS GIVEN — an object, a string, anything; `undefined` fields are dropped by JSON. */
const promote = (id, text, meta, base = null) => promoteRaw({
  bundleId: id, base, snapKey: `20260724T0600${String(++seq).padStart(2, "0")}Z_d628`, author: "member-ruth", meta,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [] });
const silent = { group: "believe-in-oakland", object_type: "action" };   /* an envelope stating none of the three */
const held = async (id) => {
  const r = await get(`op=projection&id=${encodeURIComponent(id)}`);
  return r && r.bundle_sha ? { state: r.current_state ?? null, created: r.created ?? null, last_updated: r.last_updated ?? null, sha: r.bundle_sha } : null;
};
const exists = async (id) => ((await get(`op=list&limit=1000`))?.bundles || []).some((b) => b.bundle_id === id);
/* A raw error from the store is `error: "Error: ... at act (file:///.../store.mjs:NNN:NN)"`. */
const carriesStack = (a) => typeof a?.error === "string" && /\n\s+at |store\.mjs:\d+/.test(a.error);

try {

/* ================================================== 1. A CREATION HAS NO HEAD: REFUSED BY NAME */
console.log("\n--- 1. a CREATION stating a field nowhere is refused PROMOTED_FIELD_UNSTATED, naming it, and nothing lands ---");
for (const f of FIELDS) {
  const id = `ACTN-2026-0628-create-no-${f.replace("_", "-")}`;
  const text = actionMd(id, { omit: [f] });
  t(`FIXTURE: the creation's document carries no ${f} line`, new RegExp(`^${f}:`, "m").test(text), false);
  const r = await promote(id, text, silent);
  t(`a CREATION stating no ${f} is REFUSED by name, not by a raw error`,
    [r?.ok, r?.reason, r?.code, r?.fields, carriesStack(r)], [false, "PROMOTED_FIELD_UNSTATED", "PROMOTED_FIELD_UNSTATED", [f], false]);
  t(`…(${f}) and nothing is held under that id`, await exists(id), false);
}
const cAll = "ACTN-2026-0628-create-none";
const rAll = await promote(cAll, actionMd(cAll, { omit: FIELDS }), silent);
t("a creation stating NONE of the three is refused once, naming all three in order", [rAll?.reason, rAll?.fields],
  ["PROMOTED_FIELD_UNSTATED", FIELDS]);
t("…and the refusal names the catalogue's check and its canned translation (DEC-49)",
  [rAll?.check, typeof rAll?.translation === "string" && rAll.translation === PROMOTED_TYPE_CHECKS.PROMOTED_FIELD_UNSTATED?.translation],
  ["C-86.8", true]);
t("…and the catalogue row is C-86.8, in the family D-510 opened", PROMOTED_TYPE_CHECKS.PROMOTED_FIELD_UNSTATED?.check, "C-86.8");
t("…and its detail says nothing was written", /Nothing was written\./.test(rAll?.detail ?? ""), true);
const cBlank = "ACTN-2026-0628-create-blank";
const rBlank = await promote(cBlank, actionMd(cBlank, { omit: FIELDS }),
  { ...silent, current_state: "  ", created: "", last_updated: 7 });
t("a creation whose envelope gives BLANK or NON-STRING values is refused the same way (a blank is no statement), and nothing is held",
  [rBlank?.reason, rBlank?.fields, await exists(cBlank)], ["PROMOTED_FIELD_UNSTATED", FIELDS, false]);

/* ================================================== 2. A REVISION CARRIES THE HEAD'S VALUE, AND SAYS SO */
console.log("\n--- 2. a REVISION stating a field nowhere lands, carrying the head's value, and SAYS so ---");
for (const f of FIELDS) {
  const id = `ACTN-2026-0628-revise-no-${f.replace("_", "-")}`;
  const made = await promote(id, actionMd(id), silent);
  if (made?.ok !== true) throw new Error(`fixture ${id}: ${JSON.stringify(made).slice(0, 400)}`);
  const before = await held(id);
  t(`FIXTURE (${f}): the action is held planned, with the document's dates`,
    [before?.state, before?.created, before?.last_updated], ["planned", MADE, CHANGED]);
  const text = actionMd(id, { plan: `Ask again, without ${f}.`, omit: [f] });
  const r = await promote(id, text, silent, before?.sha);
  t(`a REVISION stating no ${f} LANDS — no raw NOT NULL error`, [r?.ok, r?.reason ?? null, carriesStack(r)], [true, null, false]);
  t(`…(${f}) and the answer SAYS it was carried from the head, naming the value`,
    [r?.fields_carried?.fields, r?.fields_carried?.from, typeof r?.fields_carried?.says],
    [{ [f]: before?.[f === "current_state" ? "state" : f] }, "head", "string"]);
  const after = await held(id);
  t(`…(${f}) and the row still holds the head's values, at the NEW bytes`,
    [after?.state, after?.created, after?.last_updated, after?.sha], ["planned", MADE, CHANGED, sha(text)]);
}

/* ================================================== 3. A STRING META IS READ AS STATING NOTHING */
console.log("\n--- 3. a `meta` sent as a STRING states nothing: the document decides, and the carry-or-refuse answers the rest ---");
const S1 = "ACTN-2026-0628-string-complete";
const s1 = await promote(S1, actionMd(S1), "planned, made yesterday");
t("a creation under a STRING meta over a COMPLETE document lands, with the document's values",
  [s1?.ok, (await held(S1))?.state, (await held(S1))?.created], [true, "planned", MADE]);
const S2 = "ACTN-2026-0628-string-missing";
const s2 = await promote(S2, actionMd(S2, { omit: ["created"] }), "made yesterday");
t("a creation under a STRING meta over a document with no created is REFUSED by name, never thrown",
  [s2?.ok, s2?.reason, s2?.fields, carriesStack(s2), await exists(S2)], [false, "PROMOTED_FIELD_UNSTATED", ["created"], false, false]);
const s1Head = await held(S1);
const s3text = actionMd(S1, { plan: "Ask once more.", omit: ["current_state", "last_updated"] });
const s3 = await promote(S1, s3text, "a string", s1Head?.sha);
t("a revision under a STRING meta over a document with no state or last_updated CARRIES both, and says so",
  [s3?.ok, s3?.fields_carried?.fields, (await held(S1))?.sha], [true, { current_state: "planned", last_updated: CHANGED }, sha(s3text)]);

/* ================================================== 4. OVER-STRICTNESS */
console.log("\n--- 4. over-strictness: a promotion that STATES each field, in the document or the envelope, gains no key ---");
const O = "ACTN-2026-0628-stated";
const o1 = await promote(O, actionMd(O), silent);
t("OVER-STRICTNESS: a creation whose DOCUMENT states all three lands with NO fields_carried",
  [o1?.ok, "fields_carried" in (o1 ?? {})], [true, false]);
const o2Head = await held(O);
const o2 = await promote(O, actionMd(O, { plan: "Ask for the ledger only." }), silent, o2Head?.sha);
t("OVER-STRICTNESS: a revision whose DOCUMENT states all three lands with NO fields_carried",
  [o2?.ok, "fields_carried" in (o2 ?? {})], [true, false]);
const E = "ACTN-2026-0628-envelope-only";
const e1 = await promote(E, actionMd(E, { omit: FIELDS }),
  { ...silent, current_state: "planned", created: MADE, last_updated: CHANGED });
t("OVER-STRICTNESS: a creation whose ENVELOPE alone states all three still lands, with the envelope's values (D-563/D-615's fallback)",
  [e1?.ok, "fields_carried" in (e1 ?? {}), await held(E).then((h) => h && [h.state, h.created, h.last_updated])],
  [true, false, ["planned", MADE, CHANGED]]);
const eHead = await held(E);
const e2 = await promote(E, actionMd(E, { plan: "Ask again.", omit: FIELDS }),
  { ...silent, current_state: "planned", created: MADE, last_updated: "2026-07-26T00:00:00Z" }, eHead?.sha);
t("OVER-STRICTNESS: a revision whose ENVELOPE alone states all three lands with NO fields_carried, taking the envelope's last_updated",
  [e2?.ok, "fields_carried" in (e2 ?? {}), (await held(E))?.last_updated], [true, false, "2026-07-26T00:00:00Z"]);

/* ================================================== 5. NO ANSWER CARRIES A STACK */
console.log("\n--- 5. no op=promote answer this suite received carries a stack ---");
t("FIXTURE: the corpus of op=promote answers is non-empty (floor 15)", ANSWERS.length >= 15, true);
t("NO op=promote answer carries a raw error with a stack", ANSWERS.filter(carriesStack).map((a) => String(a.error).slice(0, 120)), []);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nd628-promoted-fields: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
