/* NEGATIVE CONTROL: (pending — the D-717 worker fills this line from the run.) */
/* D-717: FIVE OF C-2.10's / C-11.1's ACTION ARMS RUN AT THE ACT (`docs/architecture/BIO_Case_Making_v0_1.md` §2, the
 * action object: `action_kind`, `risk_tier`, `counterparty`, its states ending `resolved | abandoned`; C-11.1's clock
 * discipline; D-130's counterparty; DEC-49 as `BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it).
 *
 * D-695's worker measured it: `checkActionExtension` holds five arms that `checkBundle` — the audit sweep — reaches
 * and `op=promote` never did, so a member's write SAVED what each forbids and the record held it until a sweep said
 * so after the fact. D-695 moved the `law` arm to the act; this row moves the other five, the same way:
 *   1. an `action_kind` outside ACTION_KINDS            -> ACTION_KIND_REFUSED        C-101.1
 *   2. a `risk_tier` outside RISK_TIERS / undetermined  -> RISK_TIER_REFUSED          C-101.2
 *   3. a counterparty that is the placeholder, a bare string, or incoherent (state vs content)
 *                                                       -> COUNTERPARTY_REFUSED       C-101.3
 *   4. `current_state: resolved` with no resolution in RESOLUTIONS
 *                                                       -> ACTION_RESOLUTION_REFUSED  C-101.4
 *   5. a clock entry malformed or with no basis         -> CLOCK_REFUSED              C-101.5
 * each refused BY NAME, its translation on the wire, `findings[]` carrying the catalogue's own sentence, and NOTHING
 * LANDED. All through the op with a MEMBER's session: none of this is a machine fence.
 *
 * LEFT TO THE AUDIT BY DESIGN (the row's scope), and pinned here in the direction that would fail if the act took
 * them: a MISSING counterparty lands and op=audit still names it; a clock entry that is silently past-due lands (it
 * is a fact about TODAY, not about the bytes — a write made yesterday was not wrong yesterday).
 *
 * OVER-STRICTNESS: each arm's admitted spellings land — every action kind, tiers 1-3 and `undetermined` and absent,
 * a named counterparty and an undetermined one with a basis, `resolved` with each resolution, a well-formed clock.
 *
 * WHAT IT CANNOT SEE: whether a stated counterparty is the RIGHT addressee, or a clock's basis the right statute —
 * a member's judgement, by design. And the non-action families: whether other catalogue arms run only at the sweep
 * is STATED in the D-717 report, not classified here.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import * as CATALOGUE from "../checks/bio-checks.mjs";
/* A namespace import, so the suite RUNS before the fix and measures the reproduction rather than failing to link. */
const { ACTION_KINDS, RESOLUTIONS, ACTION_CATALOGUE_CHECKS } = CATALOGUE;

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
  bindings: { ADMIN_TOKEN: "adm-d717", MEMBER_TOKEN: "mem-d717", PROBE_TOKEN: "prb-d717",
              VERSION: "test", BIO_NOW_MS: String(PINNED_MS) },
});
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();

const NAMED = ["counterparty:", "  state: named", "  name: City Clerk"];
const GOOD_CLOCK = { text: "Response due", description: "Ten days from receipt.", date: "2026-09-30",
                     basis: "Cal. Gov. Code 7922.535", status: "pending" };
/* Each field is written as the restricted grammar carries it; `undefined` omits the line. */
const actionMd = (id, { kind = "records_request", tier = "undetermined", cp = NAMED, state = "planned",
                        resolution, clock = [], plan = "Ask for the transfer ledger." } = {}) => ["---",
  `id: ${id}`, "object_type: action", "schema: action@1",
  `title: "Action ${id}"`, `current_state: ${state}`, "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  `action_kind: ${kind}`,
  ...(tier === undefined ? [] : [`risk_tier: ${tier}`]),
  ...cp,
  ...(resolution === undefined ? [] : [`resolution: ${resolution}`]),
  ...(clock.length ? ["clock:", ...clock.flatMap((c) => Object.entries(c)
        .map(([k, v], i) => `${i === 0 ? "  - " : "    "}${k}: ${v}`))] : []),
  "---", "",
  "## Plan", "", plan, "",
  "## Status", "", "## Correspondence", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");

let snapKeySeq = 0;
const promote = async (tok, id, text, base = null, state = "planned") =>
  rP(await POST(`op=promote&token=${tok}`, {
    bundleId: id, base, snapKey: `${id}-${base ? "rev" : "new"}-${String(++snapKeySeq).padStart(4, "0")}`,
    files: [{ path: "bundle.md", text, bytes: Buffer.byteLength(text), sha256: sha(text) }],
    register: [],
    meta: { object_type: "action", group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: state, created: NOW, last_updated: LATER },
  }));
const view = async (tok, id) => rP(await GET(`op=projection&token=${tok}&id=${encodeURIComponent(id)}`)) ?? null;
const landed = async (tok, id) => !!(await view(tok, id))?.bundle_sha;

const add = rP(await POST("op=memberadd&token=adm-d717",
  { memberId: "ruth", cover: "cover for ruth", role: "admin", capabilities: ["contribute"] }));
const en = rP(await POST("op=enroll", { invite: add?.invite, handle: "ruth", password: "ruth-passphrase-1" }));
if (!en?.ok) throw new Error(`enroll ruth: ${JSON.stringify(en)}`);
const lg = rP(await POST("op=login", { role: "member:ruth", password: "ruth-passphrase-1" }));
if (!lg?.token) throw new Error(`login ruth: ${JSON.stringify(lg)}`);
const RUTH = lg.token;

const refusedBy = (r, family) => [codeOf(r), r?.code, r?.check, typeof r?.translation === "string" && r.translation.length > 40,
  Array.isArray(r?.findings) && r.findings.length > 0
    && r.findings.every((x) => x.check === family && typeof x.detail === "string")];
const ROW = (code) => [code, code, ACTION_CATALOGUE_CHECKS?.[code]?.check ?? "C-101.?", true];

let seq = 0;
const nextId = (slug) => `ACTN-2026-${String(7170 + ++seq).padStart(4, "0")}-${slug}`;
/* One refused case: its code, its row, its finding's words, and NOTHING LANDED. */
const refuses = async (label, code, family, fields, re, state) => {
  const id = nextId(code.toLowerCase().replace(/_/g, "-").slice(0, 20));
  const r = await promote(RUTH, id, actionMd(id, fields), null, state);
  t(`${label} — refused ${code}, ${ACTION_CATALOGUE_CHECKS?.[code]?.check ?? "C-101.?"}, translated, findings[] carrying ${family}`,
    refusedBy(r, family), [...ROW(code), true]);
  t("...its finding is the catalogue's own sentence", re.test(r?.findings?.map((x) => x.detail).join(" | ") ?? ""), true);
  t("...and nothing landed", await landed(RUTH, id), false);
};
const lands = async (label, fields, state) => {
  const id = nextId("admitted");
  const r = await promote(RUTH, id, actionMd(id, fields), null, state);
  t(`${label} lands`, [r?.ok, codeOf(r)], [true, null]);
  return id;
};

/* ===================================================================== */
console.log("\n--- 1. an action_kind outside the suite ---");
await refuses("a MEMBER's action of kind `subpoena`", "ACTION_KIND_REFUSED", "C-2.10", { kind: "subpoena" },
  /action_kind 'subpoena' is not in the suite/);

/* ===================================================================== */
console.log("\n--- 2. a risk_tier outside its vocabulary ---");
await refuses("a MEMBER's action stating risk_tier 7", "RISK_TIER_REFUSED", "C-2.10", { tier: 7 },
  /risk_tier '7' is not one of 1, 2, 3/);
await refuses("a MEMBER's action stating risk_tier `high`", "RISK_TIER_REFUSED", "C-2.10", { tier: "high" },
  /risk_tier 'high' is not one of/);

/* ===================================================================== */
console.log("\n--- 3. a counterparty that is the placeholder, a bare string, or incoherent ---");
await refuses("the flat placeholder `counterparty: to be named`", "COUNTERPARTY_REFUSED", "C-2.10",
  { cp: ["counterparty: to be named"] }, /placeholder 'to be named'/);
await refuses("the placeholder moved into name", "COUNTERPARTY_REFUSED", "C-2.10",
  { cp: ["counterparty:", "  state: named", "  name: to be named"] }, /counterparty\.name is the placeholder/);
await refuses("a bare string that is not the placeholder", "COUNTERPARTY_REFUSED", "C-2.10",
  { cp: ["counterparty: City Clerk"] }, /is a bare string/);
await refuses("undetermined with NO basis", "COUNTERPARTY_REFUSED", "C-2.10",
  { cp: ["counterparty:", "  state: undetermined"] }, /counterparty\.basis is empty/);
await refuses("undetermined carrying a NAME", "COUNTERPARTY_REFUSED", "C-2.10",
  { cp: ["counterparty:", "  state: undetermined", "  name: City Clerk", "  basis: Not yet confirmed."] },
  /asserts a counterparty and denies having one/);
await refuses("named with no name", "COUNTERPARTY_REFUSED", "C-2.10",
  { cp: ["counterparty:", "  state: named"] }, /counterparty\.name is empty/);
await refuses("a state outside {named, undetermined}", "COUNTERPARTY_REFUSED", "C-2.10",
  { cp: ["counterparty:", "  state: pending", "  name: City Clerk"] }, /counterparty\.state 'pending' is not one of/);

/* ===================================================================== */
console.log("\n--- 4. resolved with no resolution ---");
await refuses("a MEMBER's action `resolved` naming no resolution", "ACTION_RESOLUTION_REFUSED", "C-2.10",
  { state: "resolved" }, /resolved state requires resolution in: complied, denied, escalated, withdrawn/, "resolved");
await refuses("a MEMBER's action `resolved` as `granted` (not a resolution)", "ACTION_RESOLUTION_REFUSED", "C-2.10",
  { state: "resolved", resolution: "granted" }, /resolved state requires resolution/, "resolved");

/* ===================================================================== */
console.log("\n--- 5. a clock entry with no basis, or malformed ---");
const { basis: _b, ...NO_BASIS } = GOOD_CLOCK;
await refuses("a clock entry with no basis", "CLOCK_REFUSED", "C-11.1", { clock: [NO_BASIS] }, /has no basis/);
const { description: _d, ...NO_DESC } = GOOD_CLOCK;
await refuses("a clock entry without its dual-audience description", "CLOCK_REFUSED", "C-11.1", { clock: [NO_DESC] },
  /lacks the dual-audience/);
await refuses("a clock entry whose date is not YYYY-MM-DD", "CLOCK_REFUSED", "C-11.1",
  { clock: [{ ...GOOD_CLOCK, date: "next Tuesday" }] }, /is not YYYY-MM-DD/);
await refuses("a clock entry whose status is outside the four", "CLOCK_REFUSED", "C-11.1",
  { clock: [{ ...GOOD_CLOCK, status: "late" }] }, /status 'late' is not one of/);

/* ===================================================================== */
console.log("\n--- 6. left to the audit by design: a missing counterparty, a silently past-due clock ---");
const MISSING = await lands("a MEMBER's action with NO counterparty block (absent stays audit-only)", { cp: [] });
const PASTDUE = await lands("a MEMBER's action whose clock entry is past-due and still pending (a fact about today)",
  { clock: [{ ...GOOD_CLOCK, date: "2026-07-15" }] });
{
  const audit = rP(await GET("op=audit&limit=1000&token=mem-d717"));
  const off = (id) => (audit?.offenders ?? []).find((o) => o.bundleId === id);
  const said = (id) => JSON.stringify(off(id) ?? null);
  t("...and op=audit still names the missing counterparty on that action", /counterparty block is missing/.test(said(MISSING)), true);
  t("...and op=audit still names the silently past-due clock on that action", /silently past-due/.test(said(PASTDUE)), true);
}

/* ===================================================================== */
console.log("\n--- 7. over-strictness: what each arm admits lands ---");
for (const kind of ACTION_KINDS) {
  /* D-689 / D-695: `cpra_request` states its law by its kind — a member may, and no `law` field rides it here.
     `request_for_comment` needs a basis leg (DEC-13) this fixture does not carry, so it is refused — by
     ACTION_BASIS_REFUSED, the arm that owns that condition, and never by the kind arm: that is what this asserts. */
  if (kind === "request_for_comment") {
    const id = nextId("admitted");
    const r = await promote(RUTH, id, actionMd(id, { kind }));
    t(`action_kind ${kind} is admitted by the kind arm (its refusal, if any, is DEC-13's)`, codeOf(r), "ACTION_BASIS_REFUSED");
    continue;
  }
  await lands(`action_kind ${kind}`, { kind });
}
for (const tier of [1, 2, 3, "undetermined", undefined]) await lands(`risk_tier ${tier === undefined ? "(absent)" : tier}`, { tier });
await lands("an undetermined counterparty WITH an authored basis",
  { cp: ["counterparty:", "  state: undetermined", "  basis: Three departments could hold this; the clerk's index will say."] });
await lands("a named counterparty pointing into the subject registry",
  { cp: ["counterparty:", "  state: named", "  name: City Clerk", "  entity_id: ENT-2026-0007"] });
for (const resolution of RESOLUTIONS) await lands(`resolved as ${resolution}`, { state: "resolved", resolution }, "resolved");
await lands("a well-formed clock entry (future, pending, with its basis)", { clock: [GOOD_CLOCK] });
await lands("a met clock entry in the past", { clock: [{ ...GOOD_CLOCK, date: "2026-07-15", status: "met" }] });

/* ===================================================================== */
console.log("\n--- 8. a revision is judged as a creation is ---");
{
  const ID = nextId("revised");
  const a = await promote(RUTH, ID, actionMd(ID, {}));
  const before = (await view(RUTH, ID))?.bundle_sha;
  const r = await promote(RUTH, ID, actionMd(ID, { cp: ["counterparty: to be named"], plan: "Ask again." }), before);
  t("a member's REVISION replacing a named counterparty with the placeholder is refused, and the version did not move",
    [a?.ok, codeOf(r), (await view(RUTH, ID))?.bundle_sha === before], [true, "COUNTERPARTY_REFUSED", true]);
}

/* ===================================================================== */
console.log("\n--- 9. the catalogue rows ---");
t("five rows, C-101.1 to C-101.5, each sited at its own region in promote, each with a canned translation",
  Object.entries(ACTION_CATALOGUE_CHECKS ?? {}).map(([k, v]) => [k, v.check, v.where, typeof v.translation]),
  [["ACTION_KIND_REFUSED", "C-101.1", "src/store.mjs promote > is-promote-action-kind", "string"],
   ["RISK_TIER_REFUSED", "C-101.2", "src/store.mjs promote > is-promote-tier-vocabulary", "string"],
   ["COUNTERPARTY_REFUSED", "C-101.3", "src/store.mjs promote > is-promote-counterparty", "string"],
   ["ACTION_RESOLUTION_REFUSED", "C-101.4", "src/store.mjs promote > is-promote-action-resolution", "string"],
   ["CLOCK_REFUSED", "C-101.5", "src/store.mjs promote > is-promote-clock", "string"]]);

await mf.dispose();
console.log(`\nd717-action-arms-at-promote: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
