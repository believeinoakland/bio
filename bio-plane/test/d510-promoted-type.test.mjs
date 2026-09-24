/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/d510-promoted-type.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS COPIES OF THE SOURCES while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/d510-promoted-type.control.mjs [arm]`. Each arm patches a COPY of `src/` (its anchor asserted to occur EXACTLY ONCE), the real sources are hashed before and after, and what each arm MUST fail and MUST NOT fail is declared in the driver before it arms. RESULTS, RUN 2026-09-24 by D-510's worker on base `origin/main` e9b21be6 + D-510 (real `src/store.mjs` 3,242,874 B sha256 93648670..., `checks/bio-checks.mjs` 932,598 B sha256 a434db89..., both hashed before and after every arm and UNCHANGED — the arms patch copies, so the restore is the copy's removal and the real files' digests): 5/5 AS DECLARED, exit 0. (a) baseline 19/0 · (b) envelope-type — THE ROW'S CONTROL, HALF ONE, the projected type gated on `meta.object_type` again -> 12/7, failing BY NAME at the five §3 derivation arms, the envelope-states-none arm and §5's replayed inquiry, while every refusal arm and every other over-strictness arm stays green · (c) no-refusal — HALF TWO, the refusal never fires -> 11/8, the four §1 refusal assertions, both "nothing landed" arms, §2 and §5's refusal arms, with §3 and §4 untouched · (d) spelling — OVER-STRICTNESS, the same rule written `!Object.is(...)` over `!= null` -> 19/0, all green: the suite is coupled to behaviour and not to an expression · (e) refuse-always — OVER-STRICTNESS, a fence tighter than its rule (refuse whenever the document states a type) -> 16/3, the three non-replay LANDING arms, while every refusal arm goes green for free, which is the direction that would otherwise hide it. RECORDED, NOT SMOOTHED — TWO DEFECTS THIS DRIVER FOUND IN THE SUITE ITSELF, both corrected in the SUITE and never in the declaration. (1) Arm (c) first came back NOT AS DECLARED at 13/6: both "nothing landed" arms stayed GREEN with the refusal removed, because the divergent document's `action_basis` leg named an inquiry the store does not hold, so D-505's union reached the action shape checks and refused it ACTION_BASIS_REFUSED anyway — the arms were asserting an absence ANOTHER fence was producing, which is exactly the row's own §5 rule (an outcome that costs nothing to produce is not evidence). The fixture now creates a REAL question and satisfies capture-or-testify by account, so the divergent package is one that WOULD land. (2) Arm (e) then came back NOT AS DECLARED at 0 pass / 1 fail: the over-strict fence refused the suite's own FIXTURE question and the suite THREW BEFORE ITS FOOT, so the tally read -1 rather than measuring anything. The fixture is now created under `replay` — exempt from the refusal in every arm — because a fixture the arm under test can kill turns an over-strictness measurement into a suite that never ran. RE-RUN 2026-09-24 BY D-512, which CORRECTED this suite (every replay now carries the drive-provenance capture the plane verifies, and the run's fixture project states no type in its bytes instead of riding a bare `replay`): 5/5 AS DECLARED, exit 0 — baseline 19/0, envelope-type 12/7, no-refusal 11/8, spelling 19/0, refuse-always 16/3 — on origin/main 9f8b69e6 + D-512, real sources UNCHANGED. */
/* D-510 — THE PROMOTED DOCUMENT DECLARES ITS OWN TYPE, AND AN ENVELOPE THAT DISAGREES IS REFUSED.
 * `docs/architecture/BIO_Case_Making_v0_1.md` §2 (`action` IS the impact substrate), with C-2.5 (a document's
 * type is pinned to its id prefix). CLAUDE.md §2: a defect that makes the record claim more than it can
 * support is worse than a missing feature.
 *
 * THE DEFECT, found by D-505's worker (finding 3) and measured here at the code before this item:
 * `promote` wrote `bundles.object_type` from `normalizeType(meta.object_type)` — THE CALLER'S ENVELOPE — and
 * gated the `action_basis` / `correspondence` / `action_quotes` projections on the same envelope, while
 * `Store#projectRow`'s action COLUMNS (`action_kind`, `action_risk_tier`, `action_counterparty_state`,
 * `action_resolution`, the clock) come from the promoted DOCUMENT'S OWN front matter. So a member could
 * promote an ACTION under an envelope saying `information`: it landed TYPED INFORMATION, with
 * `action_risk_tier` set from its bytes and its basis and correspondence NEVER PROJECTED — a record holding
 * an action it does not index as one. D-505 measured exactly that disagreement from the other side and
 * pinned it (`risk-tier.test.mjs` §7 arm (vii), corrected by this item because the disagreement is now
 * unreachable).
 *
 * THE FIX, in two halves and both driven here:
 *   (1) DERIVATION. The promoted type is the DOCUMENT's own `object_type`, normalised through the
 *       catalogue's `normalizeType`, and the envelope's only where the document states none. Every site in
 *       `promote` that decides WHAT THE RECORD SAYS ABOUT THESE BYTES — `bundles.object_type` itself, the
 *       inquiry_basis and basis-version projections, the bias projection, and the action_basis /
 *       correspondence / action_quotes projections — reads that one value.
 *   (2) REFUSAL. A non-replay promotion whose envelope STATES a type that disagrees with the document's is
 *       refused ENVELOPE_TYPE_DISAGREES (C-86.1, DEC-49) before anything is written.
 *
 * REPLAY IS EXEMPT FROM (2) AND NOT FROM (1), which is the split this suite drives: the record's own history
 * may contain a package whose envelope and document disagree, and it must stay holdable verbatim — but what
 * the record SAYS about those bytes is the bytes' own word, so a replayed action lands TYPED ACTION with its
 * basis and correspondence projected rather than as mislabelled information. That exemption is
 * CALLER-ASSERTED, which is D-505's reported residue and D-511's subject; §3 here is the arm that shows what
 * (1) is worth, and it is not a claim that a caller-asserted `replay` is safe.
 *
 * WHAT THIS SUITE CANNOT SEE, stated rather than left to be found: the fences ABOVE the refusal in `promote`
 * — the project-name scan, the `CITED` retirement arm and D-149's `LAWS_ACT` carry-forward — still read the
 * envelope, because they run before `bundle.md` is parsed. Nothing they let through can LAND (the refusal is
 * still ahead of the first write, and REC-180 rolls back), so a divergent envelope is refused either way;
 * what this suite does not drive is WHICH of the two refusals a caller meets when both apply.
 */
import { withReplayProof } from "./replay-proof.mjs";    /* D-512: a replay is honoured only over provenance the plane verifies */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.D510_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const { PROMOTED_TYPE_CHECKS } = await import(join(SRC_DIR, "..", "checks", "bio-checks.mjs"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const sha = (v) => createHash("sha256").update(v).digest("hex");
const NL = "\n", NOW = "2026-07-24T00:00:00Z";

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: "adm-d510", MEMBER_TOKEN: "mem-d510", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const get = async (qs, token = "mem-d510") =>
  rP(await (await mf.dispatchFetch(`http://x/api/?token=${token}&${qs}`)).json());
const post = async (op, body, token = "mem-d510") =>
  rP(await (await mf.dispatchFetch(`http://x/api/?op=${op}&token=${token}`,
    { method: "POST", body: JSON.stringify(body) })).json());

/* A conformant action in every respect, carrying ONE basis leg and ONE correspondence entry — the two
   projections this row is about. The arms that need a document stating no type strip the line. */
const INQ_FIXTURE = "INQ-2026-0500-fixture-question";
const actionMd = (id) => [
  "---", `id: ${id}`, "object_type: action", "schema: action@1",
  'title: "Records request"', "current_state: planned", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []",
  "action_kind: cpra_request", "risk_tier: undetermined",
  "action_basis:", `  - target: ${INQ_FIXTURE}`, "    kind: advances",
  "    note: the question this request serves", "    date: 2026-07-24",
  /* An entry that satisfies capture-or-testify (DEC-13) by ACCOUNT, so the action block's own shape checks
     pass and this document would LAND if nothing stopped it. That is load-bearing for §1: an arm asserting
     "nothing landed" over a document some OTHER fence would have refused anyway proves nothing about this
     one — measured, see the control's `no-refusal` arm. */
  "correspondence:", "  - direction: sent", `    at: ${NOW}`, "    medium: email",
  "    party: City Clerk", "    account: asked the clerk for the transfer ledger",
  "    author: ruth",
  "counterparty:", "  state: named", "  name: City Clerk",
  "---", "",
  "## Plan", "", "Ask for the transfer ledger.", "",
  "## Status", "", "## Correspondence", "", "## Session Log", "", "## Review Notes", "",
].join(NL);

/* The same action with NEITHER projection block — the shape a NON-replay arm can land without a fixture
   inquiry to resolve its basis leg against (the store refuses a leg naming a bundle it does not hold). */
const plainActionMd = (id) => actionMd(id)
  .replace(/^action_basis:\n(?:  .*\n)+/m, "")
  .replace(/^correspondence:\n(?:  .*\n)+/m, "");

/* A minimal inquiry, for the arms that show the rule is not the action's alone. */
const inquiryMd = (id) => [
  "---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  'title: "Where did it go"', "current_state: open", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []",
  "---", "",
  "## Question", "", "Where did the sewer transfer go?", "",
  "## Session Log", "",
].join(NL);

let seq = 0;
/* `proof: true` (D-512): the package names a held drive-provenance capture listing it, so a `replay` it asserts is
   one the plane VERIFIES (`replay-proof.mjs`) — since BOB #33's step (2) the only replay the plane honours. */
const promote = async (id, text, { metaType = "action", state = "planned", token = "mem-d510",
                                   base = null, extra = {}, noMetaType = false, proof = false } = {}) => {
  const meta = { group: "believe-in-oakland", title: "Records request",
                 current_state: state, created: NOW, last_updated: NOW };
  if (!noMetaType) meta.object_type = metaType;
  const pkg = {
    bundleId: id, base, snapKey: `20260724T0300${String(++seq).padStart(2, "0")}Z_d510`,
    author: "member-ruth", meta,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [], ...extra,
  };
  return post("promote", proof ? await withReplayProof(mf, `token=${token}`, pkg) : pkg, token);
};

try {

/* A SIGNED-IN MEMBER, so §2 can show the rule is about the REQUEST and not about the credential. The
   MEMBER_TOKEN bearer above is a MACHINE identity by REC-46's one predicate; this one is not. */
const MEMBER = await (async () => {
  const add = await post("memberadd", { memberId: "ruth", cover: "cover for ruth", role: "admin",
                                        capabilities: ["contribute"] }, "adm-d510");
  const en = rP(await (await mf.dispatchFetch("http://x/api/?op=enroll",
    { method: "POST", body: JSON.stringify({ invite: add && add.invite, handle: "ruth", password: "ruth-passphrase-510" }) })).json());
  if (!en || en.ok !== true) throw new Error(`enroll ruth: ${JSON.stringify(en)}`);
  const lg = rP(await (await mf.dispatchFetch("http://x/api/?op=login",
    { method: "POST", body: JSON.stringify({ role: "member:ruth", password: "ruth-passphrase-510" }) })).json());
  if (!lg || !lg.token) throw new Error(`login ruth: ${JSON.stringify(lg)}`);
  return lg.token;
})();

/* CONDUCT #20 at c20-batch25: THE ADMIN'S SURFACING RUN, opened HERE rather than by `surfacing-run.mjs`'s wrapper.
   D-511 (IC-278, same batch) honours `replay` only from the ADMIN class with no session, so this suite's replay arms
   run under "adm-d510" — and an admin-class CREATION of an inquiry is asked for its surfacing run (REC-171, C-66.1).
   The shared wrapper opens that run by promoting a TYPED fixture project WITHOUT `replay`, which this suite's own
   over-strict control arm (`refuse-always`) refuses — so the fixture died before the arm could be measured. The
   project here is promoted UNDER `replay`, which every arm exempts, and the run is passed explicitly.
   CORRECTED 2026-09-24 by D-512, never exempted: that `replay` was the root of trust's bare word, which BOB #33's
   step (2) no longer honours (REPLAY_UNVERIFIED, C-66.6) — and a project's id is MINTED by the plane, so no
   provenance could name it in advance. The fixture's need was only to survive `refuse-always`, which refuses a
   document that STATES a type; so the project's bytes now state none (its envelope still says `project`), and it
   is an ordinary creation that no arm of this suite's control can refuse. */
const ADMIN_RUN = await (async () => {
  const pmd = ["---", "current_state: forming", `created: "${NOW}"`, `last_updated: "${NOW}"`,
               "references: []", "---", "", "## Summary", "", "The D-510 suite's surfacing-run project.", "", "## Session Log", ""].join(NL);
  const pr = await post("promote", { base: null, snapKey: "20260724T025900Z_d510run",
    meta: { object_type: "project", title: "D-510 run project", current_state: "forming", group: "believe-in-oakland", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text: pmd, bytes: pmd.length, sha256: sha(pmd) }], register: [] }, "adm-d510");
  const project = pr && pr.bundleId;
  if (!project) throw new Error(`d510 run project: ${JSON.stringify(pr).slice(0, 400)}`);
  const run = "RUN-2026-0724-d510-admin-surfacing";
  const ro = await post("airunopen", { run, contextType: "project", contextId: project, label: "D-510 admin surfacing run",
    mode: "check", principalClaude: "instance", principalClaudeRef: "fixture/claude", skillVersion: "investigative-session@1",
    bounds: [{ bound: "surfaces", allowed: 1000, unit: "questions" }], leaseMs: 86_400_000 }, "adm-d510");
  if (!ro || ro.started !== true) throw new Error(`d510 run open: ${JSON.stringify(ro).slice(0, 400)}`);
  return run;
})();

/* THE QUESTION EVERY ACTION BELOW RESTS ON. Real, because the store refuses an `action_basis` leg naming a
   bundle it does not hold — so without it the divergent action would be refused ACTION_BASIS_REFUSED and §1's
   "nothing landed" arm would be carried by that fence rather than by this item's. */
{
  /* Created under `replay`, which is exempt from the refusal, so the FIXTURE survives every control arm —
     including the over-strict one that refuses whenever a document states a type at all. A fixture that the
     arm under test can kill turns an over-strictness measurement into a suite that never reached its foot,
     and a tally that never printed reads -1 (WORKER.md), not zero. Nothing here is about how it was made.
     D-512: the replay carries the provenance the plane verifies (`proof`), since a bare flag is refused C-66.6. */
  const made = await promote(INQ_FIXTURE, inquiryMd(INQ_FIXTURE),
                             { metaType: "inquiry", state: "open", token: "adm-d510", proof: true, extra: { replay: true, run: ADMIN_RUN } });
  if (made?.ok !== true) throw new Error(`fixture inquiry: ${JSON.stringify(made).slice(0, 400)}`);
}

/* ================================================== 1. THE ROW'S ARM */
console.log("\n--- 1. an ACTION promoted under an INFORMATION envelope is refused BY NAME ---");
const DIVERGENT = "ACTN-2026-0510-divergent-envelope";
const refused = await promote(DIVERGENT, actionMd(DIVERGENT), { metaType: "information" });
t("a promote whose document says `action` and whose envelope says `information` is REFUSED",
  [refused?.ok, refused?.reason], [false, "ENVELOPE_TYPE_DISAGREES"]);
t("…and the refusal names the check the catalogue holds, and carries its canned translation (DEC-49)",
  [refused?.code, refused?.check, refused?.translation],
  ["ENVELOPE_TYPE_DISAGREES", PROMOTED_TYPE_CHECKS.ENVELOPE_TYPE_DISAGREES.check,
   PROMOTED_TYPE_CHECKS.ENVELOPE_TYPE_DISAGREES.translation]);
t("…and it SAYS BOTH ANSWERS, so the caller is not left to guess which end is wrong",
  [refused?.document_type, refused?.envelope_type], ["action", "information"]);
t("…and its detail says nothing was written",
  /Nothing was written\./.test(refused?.detail ?? ""), true);
/* NOTHING LANDED. The refusal is worth nothing if the bytes arrived anyway — and this is the arm that would
   have caught the defect from the READ side, which is where a reader meets it. It asks for the one field a
   landed bundle certainly has (D-505's own correction: op=projection's answer carries no `ok` key at all,
   so an `ok === false` assertion here is VACUOUS IN BOTH DIRECTIONS). */
t("…and NOTHING landed: no bundle of that id exists to project",
  (await get(`op=projection&id=${encodeURIComponent(DIVERGENT)}`))?.bundle_id ?? null, null);

/* ================================================== 2. IT IS ABOUT THE REQUEST, NOT THE CREDENTIAL */
console.log("\n--- 2. a signed-in MEMBER's divergent envelope is refused by the same name ---");
const MDIV = "ACTN-2026-0511-member-divergent";
const mrefused = await promote(MDIV, actionMd(MDIV), { metaType: "information", token: MEMBER });
t("a MEMBER's promote under the same divergent envelope is refused ENVELOPE_TYPE_DISAGREES too",
  [mrefused?.ok, mrefused?.reason], [false, "ENVELOPE_TYPE_DISAGREES"]);
t("…and nothing of the member's landed either",
  (await get(`op=projection&id=${encodeURIComponent(MDIV)}`))?.bundle_id ?? null, null);

/* ================================================== 3. THE DERIVATION, DRIVEN WHERE IT CAN BE SEEN */
console.log("\n--- 3. a REPLAYED divergent package lands TYPED ACTION, with its basis and correspondence projected ---");
/* Replay is exempt from the refusal (the record's history must be holdable verbatim) and NOT from the
   derivation, so this is the one package that both diverges and lands — and the only place the derivation
   half is observable end to end. BEFORE D-510 this landed typed `information` with NO action block at all,
   which is the row's headline defect; the control arm drives that. */
/* CORRECTED at c20-batch25 (CONDUCT #20), not exempted: D-511 (IC-278, same batch) made `replay` the SERVER's word —
   honoured only from the ADMIN class with no session. This suite's three replay arms asserted it under the member
   credentials, which now have it stripped, so they measured D-511's fence instead of this item's derivation. The
   CREDENTIAL moves to the admin token; what a replay does, which is this suite's subject, is unchanged. */
const REPLAYED = "ACTN-2026-0512-replayed-divergent";
/* D-512: and the replay is VERIFIED (`proof`) — BOB #33's step (2) honours no other; a bare flag is refused C-66.6. */
const landed = await promote(REPLAYED, actionMd(REPLAYED), { metaType: "information", token: "adm-d510", proof: true, extra: { replay: true } });
t("the replayed divergent package LANDS (replay is exempt from the refusal, not from the derivation)",
  landed?.ok, true);
const p = await get(`op=projection&id=${encodeURIComponent(REPLAYED)}`);
t("…and the record types it by the DOCUMENT: object_type reads `action`, not the envelope's `information`",
  p?.object_type, "action");
t("…so the action block is there at all — before this item it was not, and no reader could see the action",
  typeof p?.action, "object");
t("…its BASIS is projected, from the document's own action_basis[]",
  (p?.action?.basis ?? []).map((l) => [l.target_id, l.target_type, l.kind]),
  [[INQ_FIXTURE, "inquiry", "advances"]]);
t("…and its CORRESPONDENCE ledger too, from the document's own correspondence[]",
  (p?.action?.correspondence ?? []).map((e) => [e.direction, e.party]),
  [["sent", "City Clerk"]]);
t("…and the action's kind reads from the same bytes, so column and type no longer disagree",
  [p?.action_kind, p?.action?.kind], ["cpra_request", "cpra_request"]);

/* ================================================== 4. OVER-STRICTNESS */
console.log("\n--- 4. over-strictness: what agreed before still lands, and an alias is not a disagreement ---");
const AGREE = "ACTN-2026-0513-agreeing-envelope";
const agreed = await promote(AGREE, plainActionMd(AGREE), { metaType: "action" });
t("OVER-STRICTNESS: the ordinary shape — envelope and document both saying `action`, no replay — still LANDS",
  [agreed?.ok, (await get(`op=projection&id=${encodeURIComponent(AGREE)}`))?.object_type], [true, "action"]);
/* A LEGACY SPELLING IS NOT A DISAGREEMENT. `focus` and `problem` are legal legacy aliases of `inquiry`
   (REC-10), and the comparison goes through the catalogue's own `normalizeType` on BOTH sides — a fence
   tighter than its rule is not a safer fence, it is an undeclared interface change (WORKER.md). */
const ALIAS = "INQ-2026-0514-legacy-alias";
/* A SESSION and not the MEMBER_TOKEN bearer, because a machine credential creating an INQUIRY is refused
   SURFACE_NO_RUN (D-85: an assistant opens a question only inside a run it holds) — a refusal that has
   nothing to do with this item and would make the arm green for the wrong reason. */
const alias = await promote(ALIAS, inquiryMd(ALIAS), { metaType: "focus", state: "open", token: MEMBER });
t("OVER-STRICTNESS: an envelope spelling the type `focus` over an `inquiry` document is NOT a disagreement",
  [alias?.ok, alias?.reason ?? null, (await get(`op=projection&id=${encodeURIComponent(ALIAS)}`))?.object_type], [true, null, "inquiry"]);
/* THE MIRROR, and it is what keeps D-505's union honest: a document carrying NO `object_type` is not a
   disagreement either — the envelope is all there is, and it is what the record writes. */
const NOTYPE = "ACTN-2026-0515-document-states-none";
const noType = await promote(NOTYPE, plainActionMd(NOTYPE).replace(/^object_type: action\n/m, ""), { metaType: "action" });
t("OVER-STRICTNESS: a document stating NO type is not a disagreement; the envelope's type is written",
  [noType?.ok, noType?.reason ?? null, (await get(`op=projection&id=${encodeURIComponent(NOTYPE)}`))?.object_type], [true, null, "action"]);
/* THE NORMALISATION HALF, new here: an envelope stating no type at all takes the DOCUMENT's. Before this
   item `bundles.object_type` took `undefined` and the insert failed on a NOT NULL column. */
const ENVNONE = "INQ-2026-0516-envelope-states-none";
const envNone = await promote(ENVNONE, inquiryMd(ENVNONE), { noMetaType: true, state: "open", token: MEMBER });
t("an envelope stating NO type takes the DOCUMENT's own, rather than failing on a NOT NULL column",
  [envNone?.ok, (await get(`op=projection&id=${encodeURIComponent(ENVNONE)}`))?.object_type], [true, "inquiry"]);

/* ================================================== 5. THE RULE IS NOT THE ACTION'S ALONE */
console.log("\n--- 5. the class: the refusal and the derivation are about the TYPE, not about actions ---");
const IDIV = "INQ-2026-0517-divergent-inquiry";
const idiv = await promote(IDIV, inquiryMd(IDIV), { metaType: "information", state: "open" });
t("an INQUIRY document under an information envelope is refused by the same name",
  [idiv?.ok, idiv?.reason], [false, "ENVELOPE_TYPE_DISAGREES"]);
const IREP = "INQ-2026-0518-replayed-divergent-inquiry";
const irep = await promote(IREP, inquiryMd(IREP), { metaType: "information", state: "open", token: "adm-d510", proof: true, extra: { replay: true, run: ADMIN_RUN } });
t("…and replayed, it lands TYPED INQUIRY — the derivation is not the action projection's alone",
  [irep?.ok, (await get(`op=projection&id=${encodeURIComponent(IREP)}`))?.object_type], [true, "inquiry"]);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nd510-promoted-type: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
