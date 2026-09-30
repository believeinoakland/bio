/* control-plane: THE INSTANCE'S DOORS (R1–R33). The Worker's HTTP entry — routing, the namespace gates,
   authentication, admission, the stamps and the envelope — moved from legacy-index (`index.mjs`) at control-plane's
   extraction (T12, K3, K93). An op's own handler is its module's: `makeFetch(hooks)` takes the arms that still live in
   legacy-index (`publicOp` for the unauthenticated ops, `gatedOp` for the admitted ones) and routes to them, so
   routing is one place while the arms still live there (the map's §3). */
import { parseFrontmatter, createSha256, normalizeType, INSTALLATION_CHECKS,
         MACHINE_AUTHOR_PREFIX, MACHINE_CLASS_PREFIX } from "../../checks/bio-checks.mjs";
/* R32: the doors' own rows (`checks.mjs`). */
import { ADMISSION_CHECKS, NAMESPACE_CHECKS, DISPATCH_CHECKS, BOOTSTRAP_CHECKS, AI_SCOPE_CHECKS, OPERATOR_FENCE_CHECKS,
         GROUP_IDENTITY_FENCE_CHECKS, REPLAY_CHECKS } from "./checks.mjs";
import * as M_CONTROL_PLANE from "./checks.mjs";
/* D-262: THE WHOLE CATALOGUE, AS A NAMESPACE AND NOT A LIST. `dec49Attach`
   below resolves a refusal code against every DEC-49 family the catalogue
   exports, and it finds those families BY THE `_CHECKS` SUFFIX — the same rule
   `civicos-ui/check-refusal-codes.mjs` harvests by, so a family minted tomorrow
   is reachable here with no edit. A named-import list would be a hand-kept copy
   of a set that grows every week, which is the staleness this project meets
   most; the named imports above stay named because they are used AS VALUES. */
import * as CHECK_CATALOGUE from "../../checks/bio-checks.mjs";
/* N272 (K351): AND EVERY MODULE'S OWN FAMILIES. A row that left the catalogue for its module's `checks.mjs` (or the
   one file a module keeps its families in) reached the wire with no `code`, `check` or `translation` unless its site
   spread the row itself, because `dec49Row` read the catalogue alone. Each module file is read as a NAMESPACE, so a
   family it mints tomorrow is found by the `_CHECKS` suffix with no edit here; a module that opens a NEW file of
   families is not, and `MODULE_CHECK_FILES` gains it until N245's composed catalogue replaces this list (K351). */
import * as M_ACTIONS from "../actions/checks.mjs";
import * as M_AI_RUNS from "../ai-runs/checks.mjs";
import * as M_BIAS from "../bias/checks.mjs";
import * as M_CALIBRATION from "../calibration/checks.mjs";
import * as M_CAPTURE_REQUESTS from "../capture-requests/checks.mjs";
import * as M_CAPTURE_SOURCES_CREDENTIALS from "../capture-sources/credentials.mjs";
/* N347 (K440): capture's rows (C-118), readable here since capture renamed its generic `NOT_FOUND` to `EVIDENCE_NOT_HELD`. */
import * as M_CAPTURE from "../capture/checks.mjs";
import * as M_CASE_AUTHORING from "../case-authoring/checks.mjs";
import * as M_CITATION from "../citation/checks.mjs";
import * as M_CONFORMANCE from "../conformance/checks.mjs";
import * as M_CONNECTIONS_THEMES from "../connections/themes.mjs";
import * as M_CONSEQUENCES from "../consequences/checks.mjs";
import * as M_CONTENT_EXTENT from "../content/extent.mjs";
import * as M_CONTRADICTION from "../contradiction/checks.mjs";
import * as M_ENTITIES from "../entities/checks.mjs";
import * as M_ESCALATION from "../escalation/checks.mjs";
import * as M_EXTRACTION from "../extraction/checks.mjs";
import * as M_FILINGS from "../filings/checks.mjs";
import * as M_INQUIRY from "../inquiry/index.mjs";
import * as M_INTENT from "../intent/checks.mjs";
import * as M_MEMBERSHIP from "../membership/checks.mjs";
import * as M_OBSERVATION_LOG from "../observation-log/checks.mjs";
import * as M_PROGRESSIONS from "../progressions/checks.mjs";
import * as M_PROMOTION from "../promotion/checks.mjs";
import * as M_PROVENANCE from "../provenance/checks.mjs";
import * as M_PUBLICATION from "../publication/checks.mjs";
import * as M_QUEUE from "../queue/checks.mjs";
import * as M_RATIFICATION from "../ratification/checks.mjs";
import * as M_RECORD_CORE from "../record-core/checks.mjs";
import * as M_REEVALUATION from "../reevaluation/checks.mjs";
import * as M_RETRIEVAL from "../retrieval/checks.mjs";
import * as M_REVIEW from "../review/checks.mjs";
import * as M_RUN_PRODUCTIONS from "../run-productions/checks.mjs";
import * as M_SKILLDOCTRINE from "../skilldoctrine.mjs";
import * as M_STANDARDS from "../standards/checks.mjs";
import * as M_STRENGTH from "../strength/checks.mjs";
import { liveToken } from "../tokens.mjs";
import { SIGN_HTML } from "../signpage.mjs";
import { setupPage } from "../setup.mjs";
import { inbandQuartet } from "../inband.mjs";   /* REC-148: DEC-31's in-band quartet, one function */
import { normalizeAddress } from "../subresources.mjs";
import { Store } from "../store.mjs";
import { OPS, RETRIEVAL_READS, READING_READS, EDGE_ACTIONS, STATE_ACTIONS, ACTION_ACTIONS, DECLARATION_ACTIONS, STRUCTURE_ACTIONS, VERSION_ACTIONS, PROJECT_ACTIONS, GOVERNANCE_ACTIONS, IDENTITY_ACTIONS, CUSTODIAL_ACTIONS, ROSTER_SELF_ACTIONS, PROVENANCE_JUDGEMENT_ACTIONS, CALIBRATION_WRITE_ACTIONS, EXPERTISE_ACTIONS, REGISTRY_ACTIONS, TASK_ACTIONS, QUEUE_ACTIONS, AI_RUN_ACTIONS, RUN_VERB_ACTIONS, RUN_PRODUCTION_ACTIONS, POSITIONAL_ACTS, BIAS_ACTIONS, BIAS_DEBT_ACTIONS, INTENT_ACTIONS, INTENT_READS, REEVALUATION_ACTIONS, STANDARDS_ACTIONS, STANDARDS_READS, CONFORMANCE_ACTIONS, CONFORMANCE_READS, CONSEQUENCES_ACTIONS, CONSEQUENCES_READS, FILINGS_ACTIONS, FILINGS_READS, ESCALATION_ACTIONS, ESCALATION_READS, CONTRADICTION_ACTIONS, CONTRADICTION_READS, QUERY_AUTHOR_ACTIONS, ACTION_LAYER_ACTIONS, ACTION_LAYER_READS, RECOGNISER_ACTIONS, PROGRESSION_ACTIONS, SESSION_OPS, NEEDS, decorateAct, ACT_GATE, UNATTENDED_BY_DECISION } from "./ops.mjs";

const SCRATCH = "scratch";
/* REC-22: the ONE namespace the public read path answers from. An instance has
   one published record, so op=publishedcase and op=publishedbytes are pinned
   here exactly as op=verify and op=publishedmanifest are — and a probe's
   `scratch` rehearsal, which lives in a different Durable Object under a
   different PUBLISHED prefix, is therefore unreachable from the public surface. */
const PUBLISHED_STORE = "bio";

async function fingerprint(v) {
  if (!v) return null;
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return [...new Uint8Array(b)].slice(0, 8).map((x) => x.toString(16).padStart(2, "0")).join("");
}

/* Full 64-hex SHA-256 of a string or a byte view. This is what docprofile's
   `digests()` calls to name each normalised variant (CONSTRUCTS Step 2 / FW-4);
   it hashes the SAME raw bytes for `identity`, which is why identity must equal
   the capture sha and is asserted to. */
async function sha256Hex(v) {
  const b = await crypto.subtle.digest("SHA-256", typeof v === "string" ? new TextEncoder().encode(v) : v);
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

/* REC-33 / DEC-37. THE FOURTH CLASS, and what it is a class OF.
 *
 * Bob, 2026-08-04: "Sounds like we need a daemon token" — and the NAME is the
 * ruling, not decoration. The entry that raised this proposed `MONITOR_TOKEN`;
 * it was renamed because this credential drives TWO verbs, op=monitor and the
 * archive arm of op=acquire, and naming it for one of its consumers would have
 * invited the next unattended consumer either to mis-scope itself under a
 * monitor name or to mint a FIFTH class. THE CLASS IS THE UNATTENDED PATH, NOT
 * THE MONITOR. A later unattended consumer belongs here.
 *
 * WHY IT EXISTS AT ALL. Every monitor tick and every archive fallback on every
 * installed instance authenticated as ADMIN_TOKEN — the root of trust §8.1
 * builds every membership rule on — to do two narrow things. That credential is
 * bound into an instance's configuration and sits there unattended
 * indefinitely: the place a credential lives longest and travels furthest.
 * Today a leak there is total instance compromise; scoped, it is a monitoring
 * nuisance.
 *
 * WIDEN BY DECISION, NOT BY DRIFT. It is admitted to EXACTLY the two verbs it
 * needs today (OPS.monitor, and op=acquire's archive arm only — the direct arm
 * refuses it below), and the totality of that reach is asserted structurally
 * over this table in test/daemon-token.test.mjs, so an op that admits `daemon`
 * later fails that suite until somebody answers for it.
 *
 * ADMIN_TOKEN REMAINS THE FALLBACK in Store's `#monitorToken()`, so an instance
 * installed before this class existed keeps monitoring rather than arming an
 * alarm that 401s forever — DIST-1's constraint, and the reason the plane
 * learns the class BEFORE any installer binds it.
 *
 * Ordered after admin deliberately: if an operator ever set both bindings to
 * the same value, the caller gets the WIDER class it already holds rather than
 * a silent, surprising narrowing. */
async function classify(token, env) {
  if (!token) return null;
  if (token === env.ADMIN_TOKEN && (await liveToken(env.ADMIN_TOKEN))) return "admin";
  if (token === env.MEMBER_TOKEN && (await liveToken(env.MEMBER_TOKEN))) return "member";
  if (token === env.PROBE_TOKEN && (await liveToken(env.PROBE_TOKEN))) return "probe";
  if (token === env.DAEMON_TOKEN && (await liveToken(env.DAEMON_TOKEN))) return "daemon";
  return null;
}

/* A probe-class token may mutate, but only inside the scratch namespace. This
   is what lets an automated caller exercise the real write path, including the
   CAS, against the real deployment, without any ability to touch live state. */
/* A probe-class caller is confined to the scratch namespace. Confinement is by
   REFUSAL, not by silent redirection: a caller that believes it addressed the
   live store must be told it did not, rather than quietly succeeding somewhere
   else. Defaulting with no store parameter is scratch. */
/* REC-33: THE DAEMON CLASS IS DELIBERATELY NOT CONFINED HERE, and the absence
   is the decision rather than an omission. Confining it to scratch is precisely
   what makes PROBE_TOKEN the wrong credential for this job: monitoring writes
   the REAL record's reachability and the archive fallback files the REAL
   record's bytes, and a rehearsal of that in a different Durable Object records
   nothing anyone will ever read. So the daemon class falls through to the
   default and addresses `bio` like an operator does. What bounds it is the op
   table — two verbs — and not the namespace. */
/* D-456 (IC-237): THERE IS NO FALL-THROUGH TO `bio` ANY MORE. This function answered `bio` for EVERY `store=` value
   it did not recognise, so `op=stats&store=biosmoke-pdf` answered `store:"bio"` and a brief or a typo naming a
   namespace that does not exist wrote the REAL record while the caller believed it was somewhere else. The named
   refusal is `namespaceGate`'s, at the front door, before any class is resolved, so every caller meets it first; this
   function no longer defaults an unrecognised value to anything, and if one ever reaches it (a caller that skipped
   the gate) it REFUSES, which the admission site answers as SCOPE_REFUSED. ABSENT `store=` IS UNCHANGED: probe reads
   `scratch`, every other class `bio`. */
function scopeFor(cls, url) {
  const named = url.searchParams.has("store");
  const asked = url.searchParams.get("store");
  if (named && !NAMESPACES.includes(asked))
    return { error: `no namespace ${JSON.stringify(asked)} exists on this instance; the namespaces are ${NAMESPACES.join(" and ")}` };
  if (cls === "probe") return named && asked !== SCRATCH ? { error: `probe class is confined to the ${SCRATCH} namespace, refused request for ${JSON.stringify(asked)}` } : { name: SCRATCH };
  return { name: asked === SCRATCH ? SCRATCH : "bio" };
}

/* D-456 (C-78.1, IC-237) — A NAMESPACE THAT DOES NOT EXIST IS REFUSED BY NAME, FOR EVERY CALLER, AT THE FRONT DOOR.
 *
 * WHAT WAS WRONG, MEASURED. `scopeFor` confined only the probe class and answered `bio` for any other `store=` value;
 * the unauthenticated path (the invitation ops, op=instancegroup) did the same with `=== SCRATCH ? SCRATCH : "bio"`.
 * So `store=biosmoke-pdf`, `store=Scratch` and an empty `store=` all ADDRESSED THE REAL RECORD — and a live
 * verification whose whole no-write guarantee is naming its namespace (CLAUDE.md §5, D-325) wrote production while
 * believing it was elsewhere. Found by CPDF-3's worker, whose brief named a namespace that has never existed.
 *
 * WHY HERE AND NOT ONLY IN `scopeFor`: this runs once, before a credential is classified, so the admin, member, probe,
 * daemon and `ai` classes, a signed-in session and the no-credential path meet ONE refusal from ONE governed span
 * (a DEC-49 row holds one `where`). The set is exact and case-sensitive: `Scratch` is not `scratch`, because a Durable
 * Object name is an exact string and folding it here would be this function guessing what the caller meant.
 * `store=` ABSENT is not a refusal — every class keeps its default. Nothing was read or written when this answers. */
const NAMESPACES = Object.freeze(["bio", SCRATCH]);
function namespaceGate(url) {
  if (!url.searchParams.has("store")) return null;
  const asked = url.searchParams.get("store");
  if (NAMESPACES.includes(asked)) return null;
  /* DEC-49 REGION is-namespace-gate */
  return json({ ok: false, reason: "NAMESPACE_UNKNOWN", ...namespaceRow("NAMESPACE_UNKNOWN"),
                error: `no namespace ${JSON.stringify(asked.slice(0, 80))} exists on this instance`,
                asked: asked.slice(0, 80), namespaces: [...NAMESPACES] }, 400);
  /* END DEC-49 REGION is-namespace-gate */
}

/* D-461 (C-78.2, IC-250) — A PUBLIC OP THAT ALWAYS ANSWERS FROM `bio` REFUSES `store=scratch` BY NAME.
 *
 * WHAT WAS WRONG, MEASURED. The unauthenticated block opens ONE stub on `bio` and twelve of its fifteen ops answer
 * through it whatever `store=` says — three of them MUTATING (`knock`, `claim`, `reviewcomment`). So
 * `op=knock&store=scratch` passed D-456's gate (`scratch` is a namespace), filed a knock in the REAL record's inbox,
 * and answered `ok` without saying which store it wrote. A live verification whose no-write guarantee is naming
 * `store=scratch` on every call (CLAUDE.md §5, D-325) wrote production while believing it was in scratch.
 *
 * WHY REFUSE AND NOT REDIRECT. Claiming and logging in are pinned on purpose (an instance has ONE identity), and the
 * published reads are the record's public face; answering them from scratch would change what they MEAN. Refusal is
 * also D-456's rule for a namespace the op cannot serve: the caller is told, never silently answered elsewhere.
 *
 * THE SET IS INVERTED ON PURPOSE. It lists the public ops that DO address scratch — the invitation ops and
 * op=instancegroup, each of which reads `store=` itself — and every other `classes: null` op is pinned. A public op
 * added later is refused `store=scratch` until somebody makes it answer from scratch and lists it here, which is the
 * safe direction: the unlisted default is the refusal, never the real record. Gated ops take their namespace from
 * `scopeFor` and are not this function's. `store=bio` and an absent `store=` are unchanged. Nothing is read or
 * written when this answers.
 *
 * + `groupidentity` (CONDUCT #19, c19-batch11, 2026-09-24): REC-164's op reads `store=` itself, op=instancegroup's way
 * (a credential's store from `scopeFor`, else `store=scratch` honoured), and d456-namespace-scope drives it answering
 * from scratch; it met this list only at the union, where the pin refused it (400) and that suite went red. */
const SCRATCH_ADDRESSING_PUBLIC_OPS = Object.freeze(["invitelook", "enroll", "instancegroup", "groupidentity"]);
function pinnedNamespaceGate(url, op, spec) {
  if (spec.classes !== null || SCRATCH_ADDRESSING_PUBLIC_OPS.includes(op)) return null;
  if (url.searchParams.get("store") !== SCRATCH) return null;
  /* DEC-49 REGION is-pinned-namespace-gate */
  return json({ ok: false, reason: "NAMESPACE_PINNED", ...namespaceRow("NAMESPACE_PINNED"),
                error: `op=${op} always answers from the bio namespace and has no ${SCRATCH} counterpart; nothing was read or written`,
                op, asked: SCRATCH, pinned: "bio" }, 400);
  /* END DEC-49 REGION is-pinned-namespace-gate */
}

/* D-463 (C-78.3) — A CREDENTIAL MINTED CONFINED TO `scratch` ADDRESSES `scratch` ON EVERY CALL IT MAKES.
 *
 * WHAT WAS WRONG, AND IT WAS NAMED IN THE RULES BEFORE IT WAS BUILT. `CLAUDE.md` §5's live-verify rule ends
 * *"RESIDUE: no credential binds to scratch for life"*, and `BIO_Distribution_v0_1.md` §6 rung 6 carried the same
 * sentence as a stated LIMITATION (D-325; BOB #17 ruled the per-call posture SUFFICIENT 2026-09-19, BOB #22 stated the
 * residue 2026-09-21) — so the whole no-write guarantee of a live verification was the DISCIPLINE of naming
 * `store=scratch` on every call, plus the witness afterwards. BOB #22 named the one condition on which a sticky
 * confinement would be raised: *"raised only if a live verification is measured writing the real record despite the
 * naming and the witness."* IT WAS MEASURED TWICE. D-456: `store=biosmoke-pdf` — a brief naming a namespace that has
 * never existed — answered from `bio`. D-461: `op=knock&store=scratch` filed a knock in the REAL record's inbox and
 * answered `ok`. Both were found by workers whose every call was disciplined; the discipline was not the thing that
 * failed. A property that has to be re-asserted on every call is one an instrument omits once, and this is the
 * credential property that makes a forgotten parameter unable to reach the record at all.
 *
 * WHY ONE GATE AT THE FRONT DOOR AND NOT A SECOND ANSWER IN `scopeFor`. `scopeFor` decides a namespace from a CLASS
 * (the probe class's confinement lives there, by class and not by credential); this decides it from the ROW a member
 * authored. Putting it in both places would be two answers to "which store does this call land in" ageing separately,
 * which is REC-46's measured defect and PL-4's duplicated-predicate one at once. So the rule lives here, ONCE, ahead of
 * everything: ahead of the unauthenticated block, ahead of `classify`, ahead of `scopeFor`'s call site — and the
 * SUITE PINS THAT ORDER STRUCTURALLY (`d463-confined-credential.test.mjs` §5), because a gate that can be reached
 * around is a mechanism believed on the strength of its existence.
 *
 * THE TWO ARMS ARE DIFFERENT ACTS AND BOTH ARE THE CONFINEMENT.
 *   - A `store=` NAMED as anything but `scratch` is REFUSED BY NAME, 403 `NAMESPACE_CONFINED`. D-456's rule: a caller
 *     who believes it addressed the record must be TOLD it did not, never quietly answered somewhere else. `bio` is
 *     refused like any other, and the sentence says the credential can go nowhere else.
 *   - A `store=` ABSENT is SET to `scratch` here, and that is a default rather than a redirection: every class already
 *     has one (probe's is `scratch`, everybody else's `bio`), and this credential's is the row's. Setting it on the URL
 *     rather than computing it later is what makes the confinement TOTAL for a caller that names nothing: the twenty-four
 *     sites that address a namespace read it from `scopeFor`'s answer, the invitation ops and `op=instancegroup` /
 *     `op=groupidentity` read `store=` themselves, and every one of them now reads `scratch`. THE ANSWER SAYS SO: the
 *     envelope's `store` is the namespace that answered, so nothing is silent about where the call went.
 *     A DELIBERATE CONSEQUENCE, STATED SO IT IS NOT READ AS AN OVERSIGHT: a confined credential calling one of the
 *     PUBLIC ops D-461 pins to `bio` now meets `NAMESPACE_PINNED` — `op=knock` included, the write that item measured.
 *     That is the right outcome and the reason the two gates are ordered this way: the confined caller cannot file a
 *     knock in the real record's inbox, and it is told which of the two fences stopped it.
 *
 * WHAT THIS DOES NOT CONFINE, MEASURED RATHER THAN ASSUMED. The credential's OWN ROW is read from `bio` (the
 * `ai_credentials` table lives in one store, and `aicredentiallook` has always been asked there): resolving who a
 * caller is is not addressing the record's content, and a confinement that could not look itself up would be one
 * nothing could enforce. Sessions are likewise resolved from `bio`, and a session is not a minted credential. The four
 * BINDING classes cannot be confined at all — they are values an operator sets in the hosting dashboard, with no row to
 * carry the property — so for ADMIN, MEMBER, DAEMON and PROBE the per-call rule and `scopeFor` are unchanged, and the
 * live-verify obligation in `CLAUDE.md` §5 still binds every caller holding one. */
function confinedNamespaceGate(url, cred) {
  if (!cred || cred.confinedTo !== SCRATCH) return null;
  if (url.searchParams.has("store") && url.searchParams.get("store") !== SCRATCH) {
    /* DEC-49 REGION is-confined-namespace-gate */
    return json({ ok: false, reason: "NAMESPACE_CONFINED", ...namespaceRow("NAMESPACE_CONFINED"),
                  error: `credential '${String(cred.tokenId).slice(0, 60)}' is confined to the ${SCRATCH} `
                       + `namespace for its whole life and cannot address `
                       + `${JSON.stringify(String(url.searchParams.get("store")).slice(0, 80))}; nothing was read or written`,
                  tokenId: cred.tokenId, asked: String(url.searchParams.get("store")).slice(0, 80),
                  confinedTo: SCRATCH }, 403);
    /* END DEC-49 REGION is-confined-namespace-gate */
  }
  url.searchParams.set("store", SCRATCH);
  return null;
}

/* D-463 (C-29.10) — WHAT MAY BE WRITTEN AS A CONFINEMENT, judged once when a member AUTHORS it.
 *
 * `aiScopeDeclaration`'s shape and its reason (PL-4: one predicate at two points leaves one of the two codes
 * unreachable, so the DECLARATION and the per-call GATE are different questions with different codes and both are
 * driven). Its own named function and its own region, because a DEC-49 `where` resolves a span BY FUNCTION NAME.
 *
 * `scratch` IS THE ONLY CONFINEMENT THERE IS, AND `bio` IS REFUSED WITH THE UNKNOWN NAMES. That is a decision: `bio` is
 * where every unconfined credential already lands, so a row reading "confined to bio" would look like a fence in the
 * record and hold nothing — the sentence-that-enforces-nothing D-199 (2) moved the scope out of a settings row to
 * avoid. Absent, null and empty are UNCONFINED and are not refusals: a member who says nothing is minting the
 * credential this instance has always minted. */
/* D-463 — THE PRESENTED `ai` CREDENTIAL, RESOLVED ONCE PER REQUEST AND READ IN THREE PLACES.
 *
 * The gate above needs the credential's ROW before anything else happens, and the admission block and `caseReader`
 * needed it already. One resolution, passed along, for two reasons and neither is tidiness: (1) a second
 * `aicredentiallook` would be a second Durable Object round trip on every agent call, which is the cost D-199's own
 * comment accepts ONCE and no more; (2) two lookups can disagree — a credential revoked between them would be live at
 * one gate and withdrawn at the next, and which fence a caller met would depend on the order they ran in.
 *
 * THE SHAPE IS CHECKED BEFORE THE STORE IS ASKED, so a session token (64 hex) never reaches this lookup and an agent
 * credential never falls through into the session one: two different failures deserve two different answers. A STORE
 * SILENCE IS NOT "THIS CREDENTIAL IS UNKNOWN" (REC-52): it is returned as a silence and the caller is told the record
 * could not be consulted, never refused as though something were known about them. */
async function aiCredentialPresented(url, env) {
  const t = url.searchParams.get("token");
  if (!t || !AI_TOKEN_SHAPE.test(t)) return { cred: null };
  const st = env.STORE.get(env.STORE.idFromName("bio"));
  const out = await doAnswer(st.fetch(`http://do/aicredentiallook?sha=${await sha256Hex(t)}`));
  /* N349 (R23, R25): the correlation `doAnswer` read from the store's internal error travels with the silence. */
  if (!out.answered) return { silent: "aicredentiallook", correlation: out.correlation };
  return { cred: out.result?.found ? out.result.credential : null };
}

function aiConfinementDeclaration(confinedTo) {
  const refusal = (code, detail, extra) => {
    const row = AI_SCOPE_CHECKS[code];
    return { error: { reason: code, code, check: row.check, translation: row.translation,
                      detail, ...(extra || {}) } };
  };
  /* THE VALUE IS JUDGED EXACTLY, AND NOTHING IS TRIMMED OR FOLDED — D-456's rule for the namespace set, one layer
     in: a Durable Object name is an exact string, and normalising here would be this function guessing what the
     member meant. So `Scratch`, `SCRATCH`, `"scratch\n"` and a lone space are each refused BY NAME, which is the
     direction that cannot end in a credential believing it is fenced. ABSENT is the only silence: the field omitted,
     `null`, or `undefined`. A PRESENT empty string is a value and is refused with the rest, because an empty
     `store=` is exactly one of the values D-456 measured addressing the real record. */
  if (confinedTo === null || confinedTo === undefined) return { confinedTo: null };
  const asked = String(confinedTo);

  /* DEC-49 REGION is-ai-confinement-declaration
   *
   * THE SPAN `AI_CONFINEMENT_NOT_SCRATCH` names. Helper `refusal`, the code a STRING LITERAL at its site so arm C of
   * the DEC-49 guard COMPARES it rather than reading past a variable. */
  if (asked !== SCRATCH)
    return refusal("AI_CONFINEMENT_NOT_SCRATCH",
      `'${asked.slice(0, 80)}' is not a confinement a credential can carry. The one namespace a credential `
      + `may be bound to for its whole life is ${JSON.stringify(SCRATCH)}; ${JSON.stringify("bio")} is where `
      + `every unconfined credential already lands, so recording it as a confinement would put a fence in the `
      + `record that holds nothing (D-199 (2)). The name is matched exactly, so a capital letter or a stray space `
      + `is a different name. Leave the field out altogether to mint an unconfined credential.`,
      { asked: asked.slice(0, 80), confinements: [SCRATCH] });
  /* END DEC-49 REGION is-ai-confinement-declaration */

  return { confinedTo: SCRATCH };
}

/* =====================================================================
 * PL-11 / IS-5 / D-199 — THE FIFTH CLASS, AND THE FIRST ONE THAT IS NOT A
 * BINDING.
 *
 * WHY `classify()` ABOVE SAYS NOTHING ABOUT IT. The four classes it resolves
 * are ENV BINDINGS: an operator sets a value in the hosting dashboard and the
 * plane compares. D-199 (2) rules that out for this class, transplanting
 * DEC-17's reasoning verbatim — a settings row *"would be a way to change the
 * standard with nothing to read afterwards"*, and what an AI credential may
 * reach is exactly the thing that must be amendable only as an authored, dated,
 * on-the-record act. So an `ai` credential resolves against a ROW that names
 * the member who minted it and the day they did, and the resolution happens in
 * the fetch handler below, one step after `classify()` returns nothing, in the
 * same place and for the same reason a signed-in session resolves there.
 *
 * A DELIBERATE CONSEQUENCE, STATED SO NOBODY LATER READS IT AS AN OVERSIGHT:
 * this class costs a Durable Object round trip on every call, which the four
 * binding classes do not. A cached copy in the Worker would buy the round trip
 * back and would also be a second answer to "what may this credential do",
 * ageing separately from the row a member just amended. REC-46 is an entire
 * item spent removing three unsynchronised answers to a smaller question.
 *
 * D-199 (1) — ONE CLASS CARRYING A DECLARED TASK SCOPE, NOT A CLASS PER TASK.
 * The plane already had the two-dimensional answer and DEC-55 names it: class
 * plus scope, with the scope enforced at the gate BY REFUSING, which is what
 * `scopeFor` does to the probe class one function up. `aiTaskScope` is that
 * shape reused — same return shape, same enforcement point, same refusal
 * posture — and it gives per-function confinement at the cost of one class.
 *
 * THE SCOPE NAME IS FREE TEXT AND THE WRITES ARE THE ENFORCEABLE HALF. A closed
 * vocabulary of scope NAMES was considered and refused: it would grow one entry
 * per task and become D-199 (1)'s class-per-task arriving through a different
 * door, while buying nothing — what confines a credential is the op set, and a
 * name nobody enforces is a label. So `task_scope` records what the authoring
 * member called this piece of work, and `scope_writes` is what the gate reads.
 * ===================================================================== */

/* The presented shape. Deliberately NOT the 64-hex a session token uses: the
   handler must be able to tell "this is an agent credential that did not
   resolve" from "this is a session token that did not resolve", because those
   are different answers and only one of them is worth a member's attention. */
const AI_TOKEN_SHAPE = /^aik-[0-9a-f]{64}$/;

/* THE FLOOR, AND IT IS THE WHOLE FENCE: an `ai` credential may be admitted only
 * where a MEMBER class is admitted. ONE property of the OPS table, read live.
 *
 * THIS IS PL-4'S DELEGATED CONSTRAINT DISCHARGED — *the fence is a SHAPE, not a
 * class list.* op=capturerequestdrain carries no member class BY CONSTRUCTION,
 * because PL-4 ruled that a member reaching for the daemon's verb by hand would
 * be a person doing the daemon's job with the daemon's conduct rules applied to
 * them. It therefore falls outside every scope anybody can author, today and
 * after the next unattended op lands, and NOBODY HAD TO REMEMBER IT.
 *
 * IT HOLDS FROM THE OTHER SIDE TOO. No row of the OPS table names `ai` — that
 * is asserted structurally in test/aicredential.test.mjs — so adding the class
 * to a row would admit nothing, and this function is the only door. Two
 * independent proofs, both driven, because a fence with one proof is a fence
 * with one place to go wrong.
 *
 * `classes: null` ops (the unauthenticated surface) answer FALSE here rather
 * than throwing, and that is the fail-closed direction: they enforce their own
 * gates and an agent credential has no business inside a bootstrap claim. */
function aiReachesAsMember(spec, op) {
  /* D-586 (R19): an act R14 refuses to every bearer (the §4 governance acts, the group-identity acts) is a named
     administrator's own session act, so no agent credential reaches it, at the mint or at the gate. */
  if (GOVERNANCE_ACTIONS.includes(op) || IDENTITY_ACTIONS.includes(op)) return false;
  /* REC-159: a row that bounds machine credentials by `machineClasses` hands an agent nothing —
     no row names `ai` there either — so the four custodial ops stay beyond every scope, as they
     were before `member` joined their `classes` for an enrolled administrator's session. */
  return !!spec && Array.isArray(spec.classes) && spec.classes.includes("member")
    && !Array.isArray(spec.machineClasses);
}

/* THE DECLARATION, judged once when a member AUTHORS it. Separate from the gate
 * below on purpose: this asks whether a sentence may be written into the record
 * at all, and the gate asks whether a call is within a sentence already there.
 * PL-4 measured what happens when one predicate sits at two points — one of the
 * two codes becomes unreachable and can never be driven — so these are
 * different questions with different codes and both are driven.
 *
 * IT IS ITS OWN NAMED FUNCTION rather than an inline block in the handler, and
 * that is REC-71's rule paid at allocation time: a DEC-49 `where` resolves a
 * span BY FUNCTION NAME, and PL-4 shipped one pointing at `acquire`, a name that
 * does not exist because the op lives inside the fetch handler — so nothing was
 * checking that site at all. */
function aiScopeDeclaration(writes) {
  const refusal = (code, detail, extra) => {
    const row = AI_SCOPE_CHECKS[code];
    return { error: { reason: code, code, check: row.check, translation: row.translation,
                      detail, ...(extra || {}) } };
  };
  const asked = Array.isArray(writes) ? writes.map((w) => String(w ?? "").trim()).filter(Boolean) : [];

  /* DEC-49 REGION is-ai-scope-declaration
   *
   * THE SPAN `AI_SCOPE_UNKNOWN_OP` and `AI_SCOPE_BEYOND_MEMBER_REACH` name
   * (REC-71). A REGION and not the whole function, so the normalisation either
   * side of it is not conscripted into this family. Helper `refusal`, and every
   * code a STRING LITERAL at its site so arm C of the DEC-49 guard can COMPARE
   * it rather than read past a variable. */
  for (const op of asked) {
    if (!Object.prototype.hasOwnProperty.call(OPS, op))
      return refusal("AI_SCOPE_UNKNOWN_OP",
        `'${op.slice(0, 60)}' is not an operation this instance performs. A scope naming something `
        + `nothing recognises would sit in the record looking like a permission and meaning nothing, `
        + `which is exactly what declaring the scope on the record rather than in a settings row is `
        + `for (D-199 (2)).`, { op });
    /* SCOPE-ADD to REC-162 (BOB #32, 2026-09-24): since REC-159 the four custodial acts carry
       `member` for an enrolled administrator's OWN session and `machineClasses` for every
       credential, so "not reachable by a member" was loosely false of them. The detail now says
       which of the two properties refused the op, each read off its OPS row. */
    if (!aiReachesAsMember(OPS[op], op))
      return refusal("AI_SCOPE_BEYOND_MEMBER_REACH",
        Array.isArray(OPS[op].machineClasses)
          ? `'${op.slice(0, 60)}' is reached by a member only from that member's own signed-in `
            + `session, and no agent credential is among the credentials it admits, so it cannot be `
            + `handed to an agent. This is a property of the operation and not a list of forbidden `
            + `ones: its OPS row names the credentials that reach it, and an agent's is not one.`
          : `'${op.slice(0, 60)}' is not reachable by a member of this group, so it cannot be handed `
            + `to an agent. This is a property of the operation and not a list of forbidden ones: the `
            + `unattended worker's own verbs carry no member class by construction, so they are `
            + `outside every scope anybody can author.`,
        { op, classes: Array.isArray(OPS[op].classes) ? OPS[op].classes : null });
  }
  /* END DEC-49 REGION is-ai-scope-declaration */

  return { writes: [...new Set(asked)].sort() };
}

/* THE GATE. `scopeFor`'s shape, one class over: `{ error }` or the admission.
 *
 * READS ARE THE FLOOR AND WRITES ARE THE DECLARATION. An `ai` credential reaches
 * every NON-MUTATING op a member reaches — that is IS-5's "reads across the
 * project", and what bounds WHAT it sees is not this function but the STATED
 * VIEWER stamped from the record's principal, so a member-scoped credential
 * sees exactly what that member sees and an organisation-scoped one sees what
 * any instance-level credential sees. A MUTATING op additionally has to be named
 * in the writes the record declares.
 *
 * THE FLOOR IS RE-EVALUATED HERE ON EVERY CALL even though the mint already
 * applied it, and that is not the duplicated-predicate mistake PL-4 measured: it
 * answers with the GATE's code, not the mint's, because a row can outlive the
 * rule that admitted it. An op that loses its member class tomorrow leaves every
 * credential naming it refused today, with nobody having to find the rows.
 *
 * THERE IS NO OP NAME IN THIS FUNCTION. Not one literal, and the suite asserts
 * it over this function's own source — the fence is a shape, and a shape with an
 * exception list in it is a list. */
function aiTaskScope(cred, op, spec) {
  const refusal = (code, detail, extra) => {
    const row = AI_SCOPE_CHECKS[code];
    return { error: { reason: code, code, check: row.check, translation: row.translation,
                      detail, ...(extra || {}) } };
  };

  /* DEC-49 REGION is-ai-task-scope
   *
   * THE SPAN `AI_BEYOND_TASK_SCOPE` and `AI_CREDENTIAL_REVOKED` name (REC-71):
   * a REGION, so the admission returned below is not read as a refusal site.
   * Helper `refusal`, codes as STRING LITERALS. */
  if (cred.revoked)
    return refusal("AI_CREDENTIAL_REVOKED",
      `credential '${String(cred.tokenId).slice(0, 60)}' was withdrawn on ${cred.revokedAt} by `
      + `${cred.revokedBy}. The entry and the date are kept rather than deleted, so what it did while `
      + `it was live stays readable.`,
      { tokenId: cred.tokenId, revokedAt: cred.revokedAt });

  if (!aiReachesAsMember(spec, op))
    return refusal("AI_BEYOND_TASK_SCOPE",
      `no member of this group reaches '${String(op).slice(0, 60)}', so no declared scope reaches it `
      + `either. An agent is confined to what a member could do themselves, which is a property of the `
      + `operation rather than a list kept anywhere.`,
      { op, tokenId: cred.tokenId, taskScope: cred.taskScope, declared: cred.writes });

  if (spec.mutating && !cred.writes.includes(op))
    return refusal("AI_BEYOND_TASK_SCOPE",
      `credential '${String(cred.tokenId).slice(0, 60)}' declares the task scope '${cred.taskScope}', `
      + `whose writes are ${cred.writes.length ? cred.writes.join(", ") : "(none)"}. Widening it is an `
      + `authored, dated act by a member on the record (D-199 (2)/(3)), not something the agent holding `
      + `it can ask for.`,
      { op, tokenId: cred.tokenId, taskScope: cred.taskScope, declared: cred.writes });
  /* END DEC-49 REGION is-ai-task-scope */

  return { ok: true, viewer: cred.principal };
}

/* REC-130 / IC-141 — WHO IS ASKING, FOR AN OP THAT ANSWERS ANYBODY BUT ANSWERS
 * WORKING MATERIAL ONLY TO SOME. `op=casedocument` stays UNGATED because a
 * RATIFIED case document is what a stranger verifies, and an unsigned one answers
 * only to standing in its owning project. So the op cannot demand a credential and
 * cannot ignore one: this resolves the caller the way the gated path does and
 * returns the VIEWER STRING the store's D-15 predicate reads — or "" for nobody.
 *
 * IT NEVER REFUSES. An absent, unknown, expired or out-of-scope credential is
 * resolved to "" and the caller is answered as a stranger, because a refusal
 * here would be a second shape of answer, and the whole property is that a
 * caller without standing cannot tell an unsigned case from no case. The ONLY
 * non-answer is a store silence during the lookup, which is a fact about the
 * instance and is the same whatever case was named.
 *
 * "OUTSIDE SCOPE" FOR A MACHINE CREDENTIAL, decided rather than left open: a
 * binding class stands only if the OPS table admits it to the working-corpus
 * listing (`index`, whose own comment is why a title is working material) AND
 * `scopeFor` addresses it to the store this op reads. So `daemon` (two verbs)
 * and `probe` (confined to scratch) are outside it and read as strangers; the
 * `admin` and `member` bindings are instance-level and read as they read every
 * other piece of working material. An `ai` credential stands as its declared
 * principal, through the same `aiTaskScope` the gated path runs. */
/* REC-132 / D-422 / IC-149 — THIS IS NOW THE ONE RESOLVER OF A SESSION FOR EVERY
 * SESSION-STAMPED READ, and the history below is kept because it is the argument.
 * Membership Architecture v2 §7, *"THE FOUNDER IS AN ADMINISTRATOR HERE TOO"* (BOB
 * #15, 2026-09-18). `resolveSession(sess)` returns TWO things, kept apart:
 *
 *   viewer    WHAT THE SESSION MAY SEE — the D-15 viewer every visibility gate
 *             compiles. The FOUNDER's is the bare `admin`, `viewerPredicate`'s
 *             root-administrator spelling, so it sees every project and every
 *             participant list (§7.3, §7.8); every other session is `member:<id>`,
 *             exactly as before.
 *   identity  WHO THE SESSION IS — `member:<id>`, the founder's being
 *             `member:admin` — for authorship, ownership, votes and D-310's
 *             positional facts. It is stamped beside the viewer as `identity`, and a
 *             store site that asks WHO reads it and never the viewer.
 *   member    the folded id (`admin` for the founder), the string every author, by,
 *             actor and looker stamp in this file has always carried.
 *
 * THE WIDENING STOPS WHERE A RULING NAMES SOMEONE NARROWER THAN AN ADMINISTRATOR.
 * A LEAD is readable by its author and by participants it was shared to, never by
 * administrators (MEMBER-KNOWLEDGE-DESIGN.md §5), so the store's lead predicate
 * (`#leadReach`) asks the identity: the founder sees its own leads by position and
 * nobody else's. REC-132's IC-149 carries the per-site table of which arm governs.
 *
 * THE FOUNDER IS TOLD APART BY THE SESSION'S ROLE, never by the folded name, and the
 * id `admin` is now RESERVED (`memberAdd`, C-55.1), so the two cannot collide going
 * forward; an instance that already holds such a member is REPORTED by op=audit.
 *
 * REC-128 x REC-130 — THE ONE PLACE A SIGNED-IN SESSION BECOMES THE VIEWER AN
 * UNSIGNED CASE DOCUMENT ANSWERS TO. Both readers of one — `op=casedocument`
 * (through `caseReader` below) and `op=caseratify`'s facts read — call THIS,
 * so the two cannot disagree about who a session is.
 *
 * THE DEFECT IT CLOSES, measured on CONDUCT #5's merge of REC-128 onto REC-130:
 * both sites spelled the viewer as `member:` plus the FOLDED session role, and
 * the FOUNDER's session role is the bare `admin` (Store.ROOT_ADMIN), so the
 * founder read as `member:admin` — a member NAMED admin with no participation
 * and no members row — and was answered NO_CASE_DOCUMENT. That refused the
 * founder a case ratification BOB #14 ruled ALLOWED (D-421 as corrected: a
 * HUMAN's own authenticated session, a member's or the founder's), and hid every
 * unsigned case document from the instance's root administrator.
 *
 * THE RULING APPLIED, no new doctrine. IC-141 gives standing to a participant in
 * the owning project, an ACTIVE ADMINISTRATOR (Membership Architecture 7.3), or
 * an instance-level credential; 7.3 says administrators see ALL projects; 4.1
 * makes the solo founder THE administrator, and 4.6 puts the ADMIN_TOKEN holder
 * above every membership rule. The store already counts the founder as an active
 * administrator by that name (`#activeAdmins`, `#isAdminMember`). So the
 * founder has standing, as an administrator, in every project.
 *
 * WHY THE BARE `admin` VIEWER AND NOT `member:admin` OR `class:admin`.
 * `viewerPredicate` compiles bare `admin` UNFILTERED — its root-administrator
 * spelling — which is the founder's standing exactly. `member:admin` cannot
 * carry it: the predicate's administrator arm reads a `members` row the founder
 * never has, and in `store=scratch` (where acts are addressed while sessions
 * live in `bio`) nothing was ever claimed either, so no store-side check could
 * find the founder. `class:admin` would stamp a MACHINE class on a human's
 * session — the inner URL lying about who is asking, which REC-29 closed. And
 * the founder is told apart by the session ROLE, never by the folded name: a
 * member ENROLLED with the id `admin` has role `member:admin` and stays an
 * ordinary member here.
 *
 * SCOPE, AS IT WAS (IC-147) AND AS IT IS (IC-149). IC-147 made this the viewer
 * for the two case-document reads only, and said why the rest waited: several
 * other session-stamped reads also ask POSITIONAL questions of the same id
 * (D-310), which a bare `admin` viewer cannot answer. REC-132 closed D-422 by
 * giving the resolver the SECOND half those questions need (`identity`), and every
 * session-stamped read in this file now takes its viewer from here. */
function resolveSession(sess) {
  const r = sess && typeof sess.role === "string" ? sess.role : "";
  const member = r.startsWith("member:") ? r.slice(7) : r;
  return {
    viewer: r === "admin" ? "admin" : `member:${member}`,   /* the founder — Store.ROOT_ADMIN, an administrator (7.3) */
    identity: `member:${member}`,
    member,
  };
}

/* REC-163 (IC-174): beside the viewer, `cls` — the class this caller would carry through the admission gate: the
   machine class, `ai`, or a session's kind spelled exactly as the gate spells it (`sess.role === "admin"`). The
   public op=instancegroup names it on a credentialed answer, as that answer did when it came through the gate. The
   three callers before it read only `viewer` and `silent`. */
/* REC-126 / REC-198 — THE REVIEW COPY'S ANSWER SHAPE, ONE FUNCTION FOR EVERY READ OF A DRAFT. The store's
   `#noReviewCopy` is carried at 404 with nothing added, so a caller outside the fence reads the same status and the
   same bytes from the single read (`reviewcopy`) and from the list (`casedrafts`); a store that did not answer is a
   silence, stated as one. */
async function reviewAnswer(out, op) {
  if (out.refused) return storeRefusal(out);   /* R23: the store's own refusal, at its status */
  if (!out.answered) return storeSilent(op, out.correlation);
  const r = out.result;
  if (!r?.ok) return json({ ok: false, ...r }, r?.reason === "NO_REVIEW_COPY" ? 404 : 400);
  if (op === "reviewcopy") {
    /* REC-148 / DEC-31's BOUND RULE (`BIO_Publication_v0_1.md` §6A.3 point 1): the answer carries its
       hash, date, author and both floors IN-BAND, by the SAME function the container manifest is
       hashed with. The hash is over every byte of this answer but `inband` itself, in the form it is
       served; the floors are the project's required strength, the quantity `op=publish` freezes into
       the case document and the container carries as `bar`. The store's `required_strength` is read
       into the floors and not served twice. (Moved here from the review door's inline branch by CONDUCT #19
       at c19-batch9, when REC-198 made this function the one answer shape for every read of a draft.) */
    const { required_strength: bar, ...copy } = r;
    const served = { ok: true, ...copy };
    const { quartet } = await inbandQuartet({
      subject: served,
      over: "this answer exactly as served, without its `inband` key: parse it, delete `inband`, and "
          + "hash JSON.stringify(rest, null, 1) as UTF-8",
      /* REC-200 / BOB #32, 2026-09-23 23:08Z: THE DATE IS THE COPY'S LAST CHANGE, not the draft's last
         EDIT — a comment moves these bytes, so it moves the hash, and it must move the date with it. The
         store computes it over the rows it SERVES and says in `last_change.stated` what it cannot see.
         THE AUTHOR DOES NOT MOVE: the ruling is about the date, and a recipient who comments on a copy
         has not authored it; `last_change.by` is who made that change, beside it. */
      date: r.last_change?.at ?? null, author: r.updated_by ?? null, bar: bar ?? null });
    return json({ ...served, inband: quartet }, 200);
  }
  return json({ ok: true, ...r }, 200);
}

async function caseReader(url, env, storeName, presentedAi) {
  const t = url.searchParams.get("token");
  if (!t) return { viewer: "" };
  const cls = await classify(t, env);
  if (cls) {
    const scope = scopeFor(cls, url);
    const inScope = OPS.index.classes.includes(cls) && !scope.error && scope.name === storeName;
    return { viewer: inScope ? `${MACHINE_CLASS_PREFIX}${cls}` : "", cls };
  }
  const st = env.STORE.get(env.STORE.idFromName("bio"));
  if (AI_TOKEN_SHAPE.test(t)) {
    /* D-463: the caller hands us the row the front door already read (`presentedAi`), so an agent calling one of these
       four ops costs the lookup ONCE rather than twice and both fences judge the SAME row. `undefined` means nobody
       resolved it — this function is reachable from paths that do not — and then it is looked up here as before. */
    let cred = presentedAi === undefined ? undefined : presentedAi;
    if (cred === undefined) {
      const aOut = await doAnswer(st.fetch(`http://do/aicredentiallook?sha=${await sha256Hex(t)}`));
      if (!aOut.answered) return { silent: "aicredentiallook", correlation: aOut.correlation };   /* N349 */
      cred = aOut.result?.found ? aOut.result.credential : null;
    }
    const scoped = cred ? aiTaskScope(cred, "index", OPS.index) : null;
    return { viewer: scoped && !scoped.error ? scoped.viewer : "", cls: "ai" };
  }
  if (/^[0-9a-f]{64}$/.test(t)) {
    const sOut = await doAnswer(st.fetch(`http://do/session?t=${t}`));
    if (!sOut.answered) return { silent: "session", correlation: sOut.correlation };   /* N349 */
    const sess = sOut.result?.session;
    if (!sess) return { viewer: "" };
    return { viewer: resolveSession(sess).viewer, cls: sess.role === "admin" ? "admin" : "member" };
  }
  return { viewer: "" };
}


const json = (o, status = 200) =>
  new Response(JSON.stringify(dec49Attach(o), null, 1), {
    status, headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });

/* =========================================================================
 * D-262 — THE CATALOGUE ROW, ATTACHED ON THE WAY OUT. ONE PLACE.
 *
 * WHAT WAS WRONG, MEASURED RATHER THAN SUSPECTED. Twelve `MACHINE_CANNOT_*`
 * fences fire; twelve carry a catalogued C-number and a canned translation
 * (REC-64 wrote eleven of them); **exactly ONE put either on the wire.** That
 * one — `MACHINE_CANNOT_MOVE_VERSION` — is the only site in the family that
 * refuses through a helper that reads the catalogue row. The other eleven build
 * `{ ok: false, reason: "MACHINE_CANNOT_…", detail: … }` by hand, and a hand
 * cannot carry a row it does not read. So a member's agent met the string
 * `MACHINE_CANNOT_RELEASE` and nothing else, which is the exact failure DEC-49
 * exists to prevent, surviving inside the mechanism built to prevent it.
 *
 * WHY A DECORATION AND NOT ELEVEN EDITS — decided by measurement, and the
 * measurement is the reversal cost as much as the write cost. Eleven site edits
 * are eleven places to be right and eleven places to be wrong, and they close
 * ELEVEN sites out of a plane that mints hundreds of refusals in eight
 * separately-written `refuse` closures; the twelfth site proves the per-site fix
 * does not generalise, because it was written and the other eleven still were
 * not. This file already rules on the shape: `doAnswer`'s own header says *"the
 * fix is a CHOKEPOINT, not twenty-four remembered checks, because a rule that
 * must be remembered at every site is a rule that will be forgotten at the
 * twenty-fifth."* `json()` is that chokepoint on the way OUT — **MEASURED
 * 2026-08-09: 118 of this file's 125 response returns go through `json()`, and
 * the other 7 are `new Response(...)` returning a 204, a version string, two
 * HTML pages and three byte bodies — not one of them a refusal carrier.** It
 * covers the generic store forward AND the 36 `doAnswer` handlers that never
 * reach that forward. Eleven site edits would have closed the generic forward's
 * eleven and left every one of the 36 exactly as it was.
 *
 * WHAT IT COSTS TO REVERSE: delete this block and the one call above. Nothing
 * else in the plane depends on it, because nothing in the plane READS these
 * three fields — they exist for the caller. That is the asymmetry that decided
 * it: the decoration's blast radius is one function, and eleven site edits'
 * blast radius is eleven member-facing methods.
 *
 * WHAT IT DELIBERATELY DOES NOT DO, and each is a fence rather than an omission:
 *
 *   - **IT NEVER OVERWRITES.** A field already present is left exactly as the
 *     site wrote it. So a site that says something DIFFERENT from the catalogue
 *     is not silently corrected into agreement — `test/refusal-wire.test.mjs`
 *     compares what the caller RECEIVED against the row and fails on a
 *     divergence. A decoration that overwrote would make that check unable to
 *     fail, which is the "equality that costs nothing" this project refuses.
 *   - **IT NEVER INVENTS.** A code with no catalogue row is left bare and is
 *     reported by the instrument as census. Untranslated codes are REC-64's
 *     remaining sweep; making one up here would hide that work rather than do
 *     it.
 *   - **IT ADDS NO CODE OF ITS OWN**, so it mints nothing DEC-49 must catalogue
 *     and it moves no floor in the guard.
 *   - **IT DOES NOT MAKE A SITE'S CODE INVISIBLE.** Every code stays a STRING
 *     LITERAL at its site; arm C of the DEC-49 guard still COMPARES it. This
 *     decoration is downstream of the guard's whole subject and replaces none
 *     of it.
 *
 * REACH, STATED PLAINLY BECAUSE IT IS NOT TOTAL: this covers what leaves through
 * `json()`. The eight `new Response(...)` returns in this file (bytes, HTML, the
 * setup and signing pages) do not pass through it and are not refusal carriers;
 * a future one that IS would be outside this and is exactly what the
 * instrument's op sweep would find.
 * ========================================================================= */

/* Built ONCE, LAZILY, and never at module load — a Worker pays module
   initialisation on every cold start, and this is only needed by a response that
   actually refuses. Families are found by the `_CHECKS` suffix (a RESERVED
   SUFFIX in this repository: the DEC-49 guard harvests every one of them as a
   refusal family), so this is a PROPERTY and not a list. */
/* N272: the catalogue first, then each module file in path order, so a code the catalogue still holds resolves as it
   always has; a code held in two places is the guard's arm A to refuse, not this reader's to choose. */
const MODULE_CHECK_FILES = [
  M_ACTIONS, M_AI_RUNS, M_BIAS, M_CALIBRATION, M_CAPTURE_REQUESTS, M_CAPTURE_SOURCES_CREDENTIALS, M_CAPTURE, M_CASE_AUTHORING,
  M_CITATION, M_CONFORMANCE, M_CONNECTIONS_THEMES, M_CONSEQUENCES, M_CONTENT_EXTENT, M_CONTRADICTION, M_CONTROL_PLANE, M_ENTITIES,
  M_ESCALATION, M_EXTRACTION, M_FILINGS, M_INQUIRY, M_INTENT, M_MEMBERSHIP, M_OBSERVATION_LOG, M_PROGRESSIONS,
  M_PROMOTION, M_PROVENANCE, M_PUBLICATION, M_QUEUE, M_RATIFICATION, M_RECORD_CORE, M_REEVALUATION, M_RETRIEVAL, M_REVIEW, M_RUN_PRODUCTIONS,
  M_SKILLDOCTRINE, M_STANDARDS, M_STRENGTH];
let DEC49_ROWS = null;
function dec49Row(code) {
  if (DEC49_ROWS === null) {
    DEC49_ROWS = new Map();
    for (const source of [CHECK_CATALOGUE, ...MODULE_CHECK_FILES]) {
      /* Sorted so a duplicated code — which the guard's arm A already refuses —
         resolves the same way on every isolate rather than by module order. */
      for (const family of Object.keys(source).sort()) {
        if (!/_CHECKS$/.test(family)) continue;
        const rows = source[family];
        if (!rows || typeof rows !== "object") continue;
        for (const [key, row] of Object.entries(rows)) {
          if (!row || typeof row !== "object") continue;
          if (typeof row.translation !== "string" || row.translation === "") continue;
          if (!DEC49_ROWS.has(key))
            DEC49_ROWS.set(key, { check: row.check ?? null, translation: row.translation });
        }
      }
    }
  }
  return DEC49_ROWS.get(code) ?? null;
}

/* A REFUSAL is `ok: false` carrying a code — and `ok: false` is required rather
   than inferred from the presence of a `reason`, because an ANSWER may carry a
   `reason` field for something that is not a refusal at all, and decorating one
   of those would put a member-facing sentence on a success. A refusal shape that
   does NOT say `ok: false` is therefore out of reach here, and the instrument
   prints it rather than quietly covering for it. */
function dec49Decorate(r) {
  if (!r || typeof r !== "object" || Array.isArray(r)) return;
  if (r.ok !== false) return;
  const code = typeof r.reason === "string" ? r.reason
             : typeof r.code === "string" ? r.code : null;
  if (!code) return;
  const row = dec49Row(code);
  if (!row) return;
  if (r.code === undefined) r.code = code;
  if (r.check === undefined) r.check = row.check;
  if (r.translation === undefined) r.translation = row.translation;
}

/* TWO LEVELS AND NO MORE. The control plane answers a refusal in exactly two
   shapes: its own, at the top level, and the store's, forwarded UNDER `result`
   by the generic tail (the Durable Object's envelope is `{ok:true, result:…}`
   even when the method inside it refused, which is precisely why `result.ok`
   has to be looked at). A general deep walk would reach into arrays of rows and
   sub-objects that are DATA rather than refusals — `residue` entries, per-part
   verdicts, a run's steps — and put a member-facing sentence on something no
   member is being refused. Bounded on purpose. */
function dec49Attach(o) {
  if (!o || typeof o !== "object" || Array.isArray(o)) return o;
  dec49Decorate(o);
  if (o.result && typeof o.result === "object") dec49Decorate(o.result);
  return o;
}

/* ===============================================================   REC-52: A FAILURE TO ANSWER IS NOT AN ANSWER, AND THE PLANE MUST NOT
   CONVERT ITS OWN INTO A CLAIM ABOUT THE RECORD.
   ===============================================================
   THE DEFECT THIS CLOSES, stated once so the next reader does not have to
   reconstruct it. The Durable Object answers in exactly one envelope:

       { ok: true,  result: <whatever the method returned> }        // it answered
       { ok: false, error: <stack> }                       500      // it threw
       { ok: false, error: "unknown op: <op>" }            400      // no such method
       { ok: false, reason: "BAD_JSON", detail: … }        400      // unreadable body

   Twenty-four handlers in this file used to read `.result` off that envelope
   WITHOUT LOOKING AT `ok`, and JavaScript makes both failure modes silent:

     - `json({ ok: true, ...out.result })` spreads `undefined`, which is a
       no-op, so what leaves the control plane is `{ok:true}` at HTTP 200 —
       a SUCCESSFUL envelope carrying nothing. Section 7a (`op=verify`) was
       the measured instance, and UI-37 could not fix its own defect by making
       the transport throw on `ok:false` BECAUSE THERE WAS NO `ok:false` TO
       THROW ON; the motivating case sailed straight past.

     - `(c || { reason: "NOT_PUBLISHED" })` and `if (!v || !v.published)
       return notFound()` turn an absent answer into a SUBSTANTIVE NEGATIVE:
       the plane telling a stranger that the record does not hold that part,
       when in fact the plane failed to ask. This is the defect this project
       ranks worst — the record asserting something it does not know — and it
       sits at the layer BENEATH every surface, where no surface can correct
       it. A surface that faithfully renders what it received will faithfully
       render a lie.

   THE FIX IS A CHOKEPOINT, not twenty-four remembered checks, because a rule
   that must be remembered at every site is a rule that will be forgotten at
   the twenty-fifth. `doAnswer` is the ONLY place in this file that opens a
   Durable Object envelope, and `test/plane-envelope.test.mjs` asserts that
   structurally over the source rather than by convention.

   `answered` is `ok === true` AND NOTHING ELSE. It is deliberately NOT
   "result is present and non-empty": a store method may legitimately answer
   `null`, `[]` or `{}`, and treating a real empty answer as a non-answer
   would be this same collapse running in the opposite direction — which is
   one character away and is asserted against in its own arm.

   WHAT THE CALLER IS TOLD, and why it says so little. `storeSilent` reports
   the state of the EXCHANGE and makes no statement about the record at all,
   because there is none to make. It does NOT echo the Durable Object's
   `error`: that field is a raw stack trace (`String(e && e.stack || e)`),
   and every op below that can reach this refusal — verify, publishedcase,
   publishedbytes, publishedmanifest, bootstrap — is reachable with NO
   credential of any kind. An anonymous stack trace is a disclosure, and a
   diagnostic a stranger cannot act on is not worth one. */
const STORE_SILENT_REASON = "STORE_DID_NOT_ANSWER";
const STORE_SILENT_DETAIL =
  "this instance could not consult its own record, so nothing here is a statement about the record. "
  + "It is NOT a claim that what you asked for is absent, unpublished, unknown or refused — those are "
  + "answers, and this is the absence of one. The question stands unanswered; ask again.";

/* Takes the Response (or a promise of one) from a Durable Object stub fetch and
   returns `{ answered, result }`. A body that is not JSON at all is not an
   answer either, which is why the parse is guarded rather than allowed to throw
   into whatever catch happens to be nearest.
   R23 (K421): a JSON reply with `ok: false` below 500 is the store's OWN REFUSAL (`BAD_JSON`, `unknown op: <op>`), not
   a silence: it comes back `refused`, and `reply` (its status and envelope) is what a relay answers with. An `ok: false`
   at 500 or above is the store's catch, whose `error` is a stack (R30): a silence, never relayed. An answer carries its
   `reply` too, so a relay keeps the store's status and envelope without opening the reply a second time. */
async function doAnswer(res) {
  let r = null, out = null;
  try { r = await res; out = await r.json(); } catch { out = null; }
  if (!out || typeof out !== "object" || Array.isArray(out)) return { answered: false, result: undefined };
  const reply = { status: typeof r.status === "number" ? r.status : 200, body: out };
  if (out.ok === true) return { answered: true, result: out.result, reply };
  if (out.ok === false && reply.status < 500) return { answered: false, refused: true, result: undefined, reply };
  /* R25 (N333): the store's own internal error carries a correlation id, which the silence carries on (and nothing else
     of the store's envelope), so an operator can find the logged stack. */
  const correlation = out.reason === "STORE_INTERNAL_ERROR" && typeof out.correlation === "string"
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(out.correlation) ? out.correlation : undefined;
  return correlation ? { answered: false, result: undefined, correlation } : { answered: false, result: undefined };
}

/* R23 (K421): the store's own refusal, relayed with its status, code and sentence; `extra` is what the relay adds (R21). */
function storeRefusal(out, extra = {}) {
  return json({ ...out.reply.body, ...extra }, out.reply.status);
}

/* 502 rather than 500: the control plane is intact and reachable — what failed
   is the store BEHIND it, which is precisely the distinction this refusal
   exists to draw. `op` is named so an operator reading a log knows which read
   went silent without the answer implying anything about what it was reading. */
/* D-561 (C-69.2): THE CODE IS NOW A STRING LITERAL AT THIS SITE and carries its canned translation, because every
   public read meets this refusal and its reader is often a member of the public. `STORE_SILENT_REASON` still names
   the same code for the three post-commit sub-reports in `ratify` and `recordcasemanifest` — the SAME condition
   (the store did not answer), stated inside an answer rather than refused; the DEC-49 guard's arm G declares the two
   spellings one condition by name. The wire only GAINS `code`, `check` and `translation`. */
/* R25 (N333): `correlation`, when `doAnswer` read one from the store's own internal error, is carried. */
function storeSilent(op, correlation = undefined) {
  /* DEC-49 REGION is-store-silent */
  return json({ ok: false, reason: "STORE_DID_NOT_ANSWER", ...dispatchRow("STORE_DID_NOT_ANSWER"),
                op, detail: STORE_SILENT_DETAIL, correlation }, 502);
  /* END DEC-49 REGION is-store-silent */
}

/* R23, R24 (D-679): a store answer RELAYED to the caller. `claim`, `login`, `invitelook` and `enroll` answered
   `json(await r.json(), 200)` — the store's envelope at HTTP 200 WITHOUT READING `ok`, so a store that failed told an
   anonymous caller "success" in the status line. An answer (a refusal the store returned inside `ok: true` included)
   is re-wrapped in the envelope the store answers, `{ok: true, result}`, at the store's own status; the store's own
   refusal (R23) is relayed at its status; anything else is `storeSilent`, never 200. */
async function relayAnswer(res, op) {
  /* REC-52: the store's envelope is opened by `doAnswer` and nowhere else. */
  const out = await doAnswer(res);
  if (out.refused) return storeRefusal(out);
  if (!out.answered) return storeSilent(op, out.correlation);
  return json({ ok: true, result: out.result }, out.reply.status);
}

/* D-629 / DEC-49 (C-69.3, R25) — THE WORKER'S OUTERMOST CATCH, which it did not have: a throw anywhere in the door
   reached the Workers runtime as an uncaught exception (the platform's own error page), no BIO answer at all. A throw
   is logged server-side with its stack under a CORRELATION id, and the caller receives the code, the canned
   translation and the id — no stack, no message, no path. A named refusal is RETURNED, never thrown, so none passes
   through here. */
function planeInternalError(e, req) {
  const correlation = crypto.randomUUID();
  let op = "";
  try { const u = new URL(req.url); op = u.searchParams.get("op") || u.pathname; } catch { /* no op to name */ }
  const answer = planeInternalAnswer(correlation);
  /* The log line names the code by READING the answer, never by a second literal. */
  try {
    console.error(JSON.stringify({ event: answer.reason, correlation, op: String(op).slice(0, 200),
                                   stack: String(e && e.stack || e) }));
  } catch { /* a log that cannot be written never changes what the caller is told */ }
  return json(answer, 500);
}
function planeInternalAnswer(correlation) {
  /* DEC-49 REGION is-plane-internal-error */
  return { ok: false, error: "internal error", reason: "PLANE_INTERNAL_ERROR", ...dispatchRow("PLANE_INTERNAL_ERROR"),
           correlation };
  /* END DEC-49 REGION is-plane-internal-error */
}

/* THE ADMISSION GATE'S DEC-49 FIELDS, read from the ONE row (REC-79 / C-38).
 *
 * Spread into the refusal beside a `reason` that is a STRING LITERAL at its
 * site, which is DEC-49's rule and is what lets arm C of the guard COMPARE the
 * code rather than read past a variable.
 *
 * IT THROWS RATHER THAN RETURNING A PARTIAL ROW, and that is the whole reason it
 * is a function. DEC-49 exists because a refusal once shipped
 * `translation: undefined` to a member — a machine word where a sentence was
 * promised — and it shipped that way because the code was in a variable and the
 * lookup silently missed. A throw here is a 500 in a test, which is loud; a
 * missing sentence is silent and reaches a person. `admission-gate.test.mjs`
 * drives this branch. */
/* REC-123: the C-32 row for a machine fence that lives in THIS file (op=ratify,
   op=caseratify). Same shape and same refusal-to-invent as `reextractRow`. */
const machineFenceRow = (code) => {
  const row = OPERATOR_FENCE_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`machineFenceRow: ${code} has no OPERATOR_FENCE_CHECKS row with a canned translation `
                  + `(DEC-49). A code with no sentence behind it must not reach a member.`);
  return { code, check: row.check, translation: row.translation };
};

/* D-512: C-66.6's row — a replay the plane could not verify — on `identityFenceRow`'s shape and its refusal to invent. */
const replayRow = (code) => {
  const row = REPLAY_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`replayRow: ${code} has no REPLAY_CHECKS row with a canned translation `
                  + `(DEC-49). A code with no sentence behind it must not reach a member.`);
  return { code, check: row.check, translation: row.translation };
};

/* REC-164: C-64.4's row, the fence's canned sentence taken from the one catalogue family that holds it. */
const identityFenceRow = (code) => {
  const row = GROUP_IDENTITY_FENCE_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`identityFenceRow: ${code} has no GROUP_IDENTITY_FENCE_CHECKS row with a canned translation `
                  + `(DEC-49). A code with no sentence behind it must not reach a member.`);
  return { code, check: row.check, translation: row.translation };
};

const admissionRow = (code) => {
  const row = ADMISSION_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`admissionRow: ${code} has no ADMISSION_CHECKS row with a canned translation `
                  + `(DEC-49). A code with no sentence behind it must not reach a member.`);
  return { code, check: row.check, translation: row.translation };
};


/* D-456 / C-78: the namespace refusal's row reader, the same shape and the same refusal to invent. */
const namespaceRow = (code) => {
  const row = NAMESPACE_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`namespaceRow: ${code} has no NAMESPACE_CHECKS row with a canned translation `
                  + `(DEC-49). A code with no sentence behind it must not reach a member.`);
  return { code, check: row.check, translation: row.translation };
};

/* D-278 / C-68 and C-69: the same reader again, one per family, and the same
   refusal to invent. */
/* C-68.2–.4 are this module's (R15); C-68.1, `storageAbsent`'s, is still read from the catalogue for legacy-index's
   raiser until capture holds it (the map's §2). */
const installationRow = (code) => {
  const row = BOOTSTRAP_CHECKS[code] ?? INSTALLATION_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`installationRow: ${code} has no INSTALLATION_CHECKS row with a canned translation `
                  + `(DEC-49). A code with no sentence behind it must not reach a member.`);
  return { code, check: row.check, translation: row.translation };
};
const dispatchRow = (code) => {
  const row = DISPATCH_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`dispatchRow: ${code} has no DISPATCH_CHECKS row with a canned translation `
                  + `(DEC-49). A code with no sentence behind it must not reach a member.`);
  return { code, check: row.check, translation: row.translation };
};

/* =========================================================================
 * D-270 — THE SESSION GATE ANSWERED THREE DIFFERENT FACTS WITH ONE SENTENCE,
 * AND THE SENTENCE WAS FALSE FOR TWO OF THEM.
 *
 * THE RULE IS BOB'S, 2026-09-19, and its home is CITED rather than restated
 * here: `docs/architecture/BIO_Membership_Architecture_v2.md` §4, the §4.7
 * block. The generating rule is one line — A REFUSAL MAY STATE ONLY WHAT THE
 * SYSTEM CAN SUPPORT — and it yields three sentences where this gate had one:
 *
 *   (a) "this verb is not for a person"  — a DESIGN CLAIM. Sayable ONLY where
 *       such a decision is RECORDED. `MACHINE_CREDENTIAL_REQUIRED`.
 *   (b) "your credential does not reach this verb" — ALWAYS sayable, because it
 *       is about the caller rather than about the design.
 *       `SESSION_ROLE_CANNOT_REACH_OP`.
 *   (c) for an OMISSION — NEITHER. State the fact and invent no rationale.
 *       `SESSION_ROUTE_NOT_RECORDED`.
 *
 * **WHY (c) HAD TO EXIST, AND IT IS THE ARGUMENT RATHER THAN A FOOTNOTE.** A
 * false rationale SUPPRESSES ITS OWN BUG REPORT. A member told that an absence
 * is a DECISION will not report it as a gap, so the sentence recruits the one
 * person who could have caught it into believing there is nothing to catch. The
 * measured case is D-136's: `adminendorse`, `adminremove` and `membercaps` WERE
 * reachable by NO session, and §4.7 assigns that very vote to a person. A
 * TWO-way split — which is what IC-55 proposed in 2026-08 — would have written
 * "this verb is not for a person" onto the three ops whose bug report it then
 * suppresses.
 *
 * **THAT CASE IS NOW DISCHARGED, AND THE TENSE IS THE POINT (D-136, 2026-09-19).**
 * The three ops hold reach in BOTH session sets and a server-stamped `by`, so no
 * session is refused at this gate and the ROSTER answers a non-administrator
 * `NOT_AN_ADMIN`. (CORRECTED 2026-09-25 by REC-162: this read "`SESSION_OPS.admin`
 * reach … a member's session gets (b), which names the administrator as the
 * route" — false of D-136's landing, which put them in both sets; and (b) now
 * names the SESSION that reaches the op, the founder's where the admin set alone
 * holds it, because an enrolled administrator holds a member's session.)
 * They are no longer examples of (c) and `d270-refusal-truth.test.mjs`' arm was
 * CORRECTED rather than exempted. **THE PARAGRAPH IS KEPT IN THE PAST TENSE
 * BECAUSE IT IS THE ARGUMENT FOR (c), NOT A LIST OF ITS MEMBERS**: the reason (c)
 * had to exist is that this absence WAS an omission and a false rationale would
 * have suppressed the report that fixed it. Rewriting the receipt out once the
 * bug is closed is how a rule loses the evidence that earned it — and (c)'s live
 * members are read from the gate rather than from this prose, so nothing here
 * decides who gets which sentence.
 *
 * **AND (a) IS NARROWER THAN IT LOOKS.** `op=provenancechain` and
 * `op=provenanceroute` were inside the old sentence's reach, and their own OPS
 * rows say the opposite of it in as many words: *"NOT open to `daemon`: deciding
 * that the evidence supports a route is a named member's judgement."* The plane
 * was telling a member that an op reserved to a named member's judgement is
 * performed by an unattended writer. Under (c) they got the fact and no
 * invented reason, which was the honest answer until somebody ruled — and BOB
 * #19 did (§4.10, 2026-09-21): REC-155 gave both SESSION reach, so a signed-in
 * member now performs them under their own name, as their OPS rows say.
 *
 * **WHAT THIS DOES NOT CHANGE, AND IT IS THE WHOLE SAFETY ARGUMENT: WHO REACHES
 * WHAT.** Not one op moves between `SESSION_OPS`' sets and no class list moves.
 * Exactly the same callers are refused exactly the same verbs; what changes is
 * what they are TOLD. A fix here that widened reach would be a different item
 * wearing this one's costume.
 * ======================================================================= */


/* THE SESSION GATE. A browser signed in with a password holds a session token,
 * not a machine credential; `SESSION_OPS` is what says which MUTATING ops that
 * session may drive, per role.
 *
 * IT IS ITS OWN NAMED FUNCTION rather than a block inside `fetch`, and that is
 * REC-71's rule paid at allocation time: a DEC-49 `where` resolves a span BY
 * FUNCTION NAME, and PL-4 shipped one pointing at `acquire` — a name that does
 * not exist, because the op lives inside `fetch` — so nothing was checking that
 * site at all. A gate left inline in `fetch` is a gate no `where` can name.
 *
 * `error` IS KEPT BESIDE THE CODE, and that is deliberate rather than timidity:
 * every consumer of this refusal reads `reason || error` or `error || reason`,
 * so ADDING a code moves nobody while REMOVING the string would. For the
 * by-decision arm the sentence is the byte-identical legacy one. For the other
 * two it is NEW, because the legacy sentence was not merely coarse there — it
 * was WRONG, and a consumer switching on it was switching on a false statement.
 * IC-55 carries that half. */
function sessionOpGate(kind, op, spec, method) {
  /* **THIS GATE RETURNS THE RESPONSE ITSELF, NOT A REFUSAL OBJECT FOR `fetch` TO
     SPREAD, AND THAT IS A MEASURED CHOICE RATHER THAN A STYLE.** The obvious
     shape — return `{ error: {...} }` and write `return json({ ok: false,
     ...gated.error }, 403)` at the call site — was built first and the DEC-49
     guard REFUSED it: that call site is a return-position outcome whose CODE
     comes from a spread, which the walk cannot resolve until run time, and
     `inheritedVerdicts` is a CEILING THAT MAY ONLY FALL. It sat at 4 and the
     shape would have made it 5 — a new place a refusal can pass through
     ungraded, bought for nothing. Returning the Response keeps every code a
     STRING LITERAL inside the governed region where the walk compares it against
     the catalogue, and leaves `fetch` with no outcome literal to misread. */
  const refusal = (code, error, detail, extra) =>
    json({ ok: false, reason: code, ...admissionRow(code), error, detail, op, ...(extra || {}) }, 403);
  /* `capture` is nominally mutating because of its PUT path; its GET is a read
     and is treated as one. Computed and returned OUTSIDE the region on purpose,
     so the admission is not conscripted into this family as a refusal site. */
  if (!spec.mutating || (op === "capture" && method === "GET") || SESSION_OPS[kind].has(op))
    return null;

  /* DEC-49 REGION is-session-op-gate
   *
   * THE SPAN the three session codes name (REC-71). A REGION and not the whole
   * function, so the admission above is not read as part of the family. Helper
   * `refusal`, and every code a STRING LITERAL at its site so arm C of the
   * DEC-49 guard can COMPARE it rather than read past a variable — one code in
   * a variable shipped `translation: undefined` to a member.
   *
   * THE ORDER IS THE HONESTY, and it runs from what the system can support MOST
   * to what it can support LEAST. Ask the session lists FIRST: if any role
   * reaches this verb then the refusal is about THIS caller's role, and it is
   * true without consulting any record. Only then ask whether a decision is
   * recorded. And if none is, say so — do not fall back on the design claim,
   * because the fallback IS the defect. */
  /* REC-162 (Membership v2 §4.9, BOB #23): THE SENTENCE SAYS WHICH SESSION REACHES THE OP, DERIVED
     FROM THE SET THAT HOLDS IT. Reaching here means exactly ONE set holds `op` and it is not this
     session's. `SESSION_OPS.admin` is the FOUNDER'S password session and nothing else — an enrolled
     administrator signs in as `member:<id>` — so an op the admin set alone holds is *reserved to the
     founder's session*, and the old sentence (*"reserved to an administrator of this group"*, with
     `role: 'member'`) was FALSE of every enrolled administrator it refused. `role` is gone for that
     reason: `session` names the session's kind, which is true of anybody who holds it. */
  if (SESSION_OPS.admin.has(op))
    return refusal("SESSION_ROLE_CANNOT_REACH_OP",
      "this operation is reserved to the founder's session",
      `'${String(op).slice(0, 60)}' is reachable from a signed-in session, but only the founder's: `
      + `the password session made when this instance was claimed with its root credential. This is `
      + `a member's session, which is what every enrolled member signs in with, an administrator of `
      + `this group included — so an administrator's session is refused this exactly as this one is, `
      + `and nothing here says whether you are one. There is no machine credential to go and find: `
      + `the founder performs this from their own browser.`,
      { session: kind, reachedBy: "founder" });
  if (SESSION_OPS.member.has(op))
    return refusal("SESSION_ROLE_CANNOT_REACH_OP",
      "this operation is reserved to a member's own session",
      `'${String(op).slice(0, 60)}' is reachable from a signed-in session, but only a member's `
      + `own, and this is the founder's session. There is no machine credential to go and find: `
      + `a member performs this from their own browser.`,
      { session: kind, reachedBy: "member" });
  const recorded = UNATTENDED_BY_DECISION[op];
  if (recorded)
    return refusal("MACHINE_CREDENTIAL_REQUIRED",
      /* THE LEGACY SENTENCE, BYTE-IDENTICAL. It is TRUE of these, and keeping
         it is what makes the code purely additive for them. */
      "this operation requires a machine credential, not a signed-in session",
      `'${String(op).slice(0, 60)}' is on the unattended path. No signed-in session of any role `
      + `reaches it, the founder's included; it answers to a credential held in the hosting `
      + `account. This instance holds a decision on record saying so, cited in 'recorded' so you `
      + `can check it. Nothing here says a machine is trusted more than a person (DEC-52 rules the `
      + `opposite): it says which credential this verb is addressed to.`,
      { recorded });
  return refusal("SESSION_ROUTE_NOT_RECORDED",
    "no signed-in session reaches this operation, and no decision on record says why",
    `'${String(op).slice(0, 60)}' is reachable by no session of any role, and this instance holds `
    + `no recorded decision that it is not meant for a person. The plane will not invent one: a `
    + `member told an absence is a decision stops reporting it as the gap it may well be. If you `
    + `expected to perform this, that expectation is worth filing rather than working around.`);
  /* END DEC-49 REGION is-session-op-gate */
}


/* Some of these reads happen INSIDE a per-item renderer that returns a rendered
   object rather than a Response, so it has no way to refuse on its own behalf.
   Rather than let it fabricate a rendering from an answer it never got, it
   throws this and the handler that owns the Response turns it into the same
   refusal. A sentinel class and not a bare string, so a genuine crash on the
   same path is re-thrown instead of being reported as a polite silence. */
class StoreSilent extends Error {
  constructor(op) { super(`the store did not answer ${op}`); this.op = op; }
}

/* The R2 key for a capture's bytes (I1 §2): content-addressed under the store
   prefix. The ONE place this shape is written, so op=capture and op=pdfstructure
   read the identical object rather than two copies of the key drifting apart. */
const captureKey = (storeName, sha) => `${storeName}/captures/${sha}`;


/* REC-173 (INVESTIGATIVE-SESSION.md §11 item 5, "A MIGRATION IS A REPLAY, NOT A SURFACING", BOB #30): IS THIS
   CREATION A MIGRATION REPLAY? — and since D-512 (BOB #33's step (2)) IS THIS PROMOTION, of ANY type and ANY revision,
   A REPLAY THE SERVER CAN VERIFY? The same test answers both: nothing below is particular to an inquiry or to a
   creation (`b.bundleId` is the bundle a revision revises too). Condition (2) of the ruling, asked of what the SERVER
   holds and never of what the caller says: the promotion names a capture (`provenanceCapture`, a sha256) that is
     - REGISTERED as the Drive era's provenance — at `DRIVE_PROVENANCE_PATH` — by this creation's own `register`
       list, the one writer of the register (`promote`) and so the earliest act that can register anything against
       a bundle that does not exist yet (the builder's DESIGN GAP, stated in the IC);
     - HELD: its bytes are read back from R2 under the one capture key and must hash to the sha named, so the
       provenance is the bytes already in the record, not a copy the request carries;
     - and its PRESERVED PROMOTION RECORDS name THIS bundle id (`record.target`) and, in THE SAME record, list THIS
       revision's `bundle.md` SHA-256 — computed here from the text being promoted, and the `sha256` the caller
       sent must BE that value, because the store keeps the caller's figure as the bundle's head.
   Null when any of it fails: a promotion that ASSERTED `replay` is then refused REPLAY_UNVERIFIED (C-66.6, D-512), and
   an inquiry creation that asserted nothing is an ORDINARY creation and rule 2 and D-78 apply unchanged, so this
   door cannot be used to skip a run. Condition (1), the ADMIN class, is the caller's to ask before calling this.
   WHAT THIS CANNOT CHECK, stated rather than hidden: the provenance capture is uploaded by the root of trust, whose
   honesty the record does not model (Membership §DEC-2, deferred). */
const DRIVE_PROVENANCE_PATH = "migration/drive-provenance.json";
async function migrationReplayOf(env, storeName, b) {
  const cap = typeof b.provenanceCapture === "string" ? b.provenanceCapture.trim() : "";
  if (!/^[0-9a-f]{64}$/.test(cap)) return null;
  const registered = Array.isArray(b.register)
    && b.register.some((r) => r && r.sha256 === cap && r.path === DRIVE_PROVENANCE_PATH);
  if (!registered) return null;
  const bm = Array.isArray(b.files) ? b.files.find((f) => f && f.path === "bundle.md" && typeof f.text === "string") : null;
  if (!bm) return null;
  const mdSha = createSha256().update(new TextEncoder().encode(bm.text)).hex();
  if (bm.sha256 !== mdSha) return null;
  let held;
  try { held = await env.CAPTURES.get(captureKey(storeName, cap)); } catch { return null; }
  if (!held) return null;
  const bytes = new Uint8Array(await held.arrayBuffer());
  if (createSha256().update(bytes).hex() !== cap) return null;
  let prov;
  try { prov = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); } catch { return null; }
  const records = Array.isArray(prov?.promotions) ? prov.promotions : [];
  const match = records.find((p) => p && p.record && typeof p.record === "object"
    && p.record.target === b.bundleId
    && Array.isArray(p.record.files)
    && p.record.files.some((f) => f && f.name === "bundle.md" && f.sha256 === mdSha));
  if (!match) return null;
  return { capture: cap, promotion: typeof match.key === "string" ? match.key : null, bundleMdSha: mdSha };
}

/* D-526 (`BIO_Case_Making_v0_1.md` §2; D-510, C-86.1): WHAT A PROMOTION IS, derived ONCE from the bytes the caller sent —
   the document's own `object_type` through the catalogue's `normalizeType`, the envelope's only where the document
   states none — exactly as `promote` derives it in the store. The gates that ask it (the migration-replay admission,
   `create_projects`, D-78's `surfaced_by` restamp) asked the ENVELOPE, and an envelope is legal with no type at all:
   measured on 8bdf20e6, a member without `create_projects` created a project by leaving the type out. A contradicting
   envelope is still refused, by the store (ENVELOPE_TYPE_DISAGREES); here it only decides which gate a caller meets. */
function promotedTypeOf(b) {
  const md = Array.isArray(b.files) ? b.files.find((f) => f && f.path === "bundle.md") : null;
  const fm = md && typeof md.text === "string" ? parseFrontmatter(md.text).data : null;
  const said = fm && typeof fm === "object" ? fm.object_type : undefined;
  if (typeof said === "string" && said.trim() !== "") return normalizeType(said);
  return b.meta && typeof b.meta === "object" ? normalizeType(b.meta.object_type) : undefined;
}

/* R16 (D-511, D-512): A PROMOTION'S REPLAY, judged from the body as sent. Only the ADMIN class with no session may
   assert one (D-511: every other caller's flag is deleted by the promote block, and it is judged by the fences it tried
   to skip); an admin's assertion, or an admin's inquiry creation, is checked by `migrationReplayOf`. `asserted` with no
   `proven` is refused REPLAY_UNVERIFIED before any handler runs (R28). A body that is not a JSON object asserts nothing:
   the store refuses it in its own words. */
async function replayVerdict(env, storeName, text, viaSession, cls) {
  let b;
  try { b = JSON.parse(text); } catch { return null; }
  if (!b || typeof b !== "object" || Array.isArray(b)) return null;
  const admin = !viaSession && cls === "admin";
  const asserted = admin && !!b.replay;
  const creatingInquiry = b.base === null && !!b.meta && promotedTypeOf(b) === "inquiry";
  const proven = admin && (asserted || creatingInquiry) ? await migrationReplayOf(env, storeName, b) : null;
  return { asserted, proven,
           bundleId: typeof b.bundleId === "string" ? b.bundleId.slice(0, 200) : null,
           provenanceCapture: typeof b.provenanceCapture === "string" ? b.provenanceCapture.slice(0, 64) : null };
}

/* R1–R25: the Worker entry. `hooks.publicOp(ctx)` answers a public op whose handler still lives in legacy-index;
   `hooks.gatedOp(ctx)` an admitted op's handler there, or undefined for the generic forward below. */
/* R17: the stamps a caller may never supply, in the query and in a body. */
const QUERY_STAMPS = Object.freeze(["viewer", "identity", "author", "by", "actor", "who", "origin", "administer"]);
const BODY_STAMPS = Object.freeze(["actorIdentity", "actorViewer", "actorMemberId", "ownerMemberId", "assistantPrincipal",
                                   "migrationReplay"]);
export function makeFetch(hooks = {}) {
  /* R25: the door's one outermost catch. */
  return async function planeDoor(req, env) {
    try { return await fetch(req, env); } catch (e) { return planeInternalError(e, req); }
  };
  async function fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS")
      return new Response(null, { status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-allow-headers": "content-type" } });

    /* The API lives under /api so the instance can serve its own setup UI at
       the root. A bare GET of / with no op parameter is a person in a browser
       and gets the page. The legacy root query API (/?op=...) still answers,
       for the one deployment that predates this, and should be dropped once
       that instance is gone. */
    /* The signing page, served by the group's own instance. It is the same
       self-contained file that ships in tools/, with no network calls, and
       it holds no secret: keys are made and used in the visitor's browser.
       Serving it means the instance can LINK to it, which is the difference
       between a step an ordinary person can follow and one they cannot. */
    /* Which version is this? A plain GET, no token, no op parameter, no JSON
       field to know the name of. `op=bootstrap` has always carried the version
       and always will, but "call bootstrap and read the version field" is not
       something anyone should have to be told, and the question gets asked
       after every update. */
    if (req.method === "GET" && (url.pathname === "/version" || url.pathname === "/version/"))
      return new Response((env.VERSION || "0.0.0") + "\n",
        { headers: { "content-type": "text/plain; charset=utf-8",
                     "access-control-allow-origin": "*" } });
    if (req.method === "GET" && (url.pathname === "/sign" || url.pathname === "/sign/"))
      return new Response(SIGN_HTML, { headers: { "content-type": "text/html; charset=utf-8" } });
    /* REC-163 / IC-174: the page names whose record this is — the group ITS record records, read when the page is
       SERVED, through the one public read (`publicInstanceGroup`). `setupPage` puts the slug in the served bytes,
       or says in words that none is recorded, or — when the record did not answer — says THAT, never "none" and
       never a name. `no-store`, because the bytes now carry a fact the record can change: a page kept from before a
       seed would go on saying none is recorded. D-596: the read is op=groupidentity's PUBLIC projection, so the line
       carries the display name beside the slug and a verified domain with its date (`setup.mjs` `groupLine`).

       D-475 — AND THE NAMESPACE IS THE CALLER'S TO NAME HERE, because NOTHING BELOW CAN REACH THIS ROUTE. This is an
       HTML route: it answers before `path` and `op` exist, so D-456's `namespaceGate` and D-461's
       `pinnedNamespaceGate`, both of which run at the op front door a few lines down, never see it. MEASURED: the
       read was written `publicInstanceGroup(env, "bio")`, so `/?store=scratch` served `bio`'s slug as this copy's
       own — a live verification whose whole no-write guarantee is naming its namespace (CLAUDE.md §5, D-325) read
       production while believing it was in scratch — and `/?store=nonsense` did the same, which is D-456's own
       defect surviving at the one route D-456 did not reach. Found by D-461's worker.

       THE RULE IS op=instancegroup's, NOT A NEW ONE, and that is the decision rather than a convenience: this page
       and that op are ONE READER (`publicInstanceGroup` — its own header says so) shown to a stranger, so a
       namespace that does not exist is refused BY NAME through the very gate every other caller meets,
       `store=scratch` reads scratch, and everything else reads `bio`. The page is deliberately NOT added to
       D-461's pinned set: pinning one of two surfaces over one reader would make `store=scratch` mean two things on
       the same copy — refused on the page, honoured on the op — and the op is exempt because it reads `store=`
       itself, which is now exactly what the page does. `/version` and `/sign` are left alone on purpose: they
       address no namespace, and a gate on a route that reads no record would be a fence tighter than its rule. */
    if (req.method === "GET" && !url.pathname.startsWith("/api")
        && (url.pathname === "/" || url.pathname === "") && !url.searchParams.get("op")) {
      const pageNamespace = namespaceGate(url);
      if (pageNamespace) return pageNamespace;
      const pageStore = url.searchParams.get("store") === SCRATCH ? SCRATCH : "bio";
      return new Response(setupPage(await hooks.publicInstanceGroup(env, pageStore, "groupidentitypublic")),
        { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    }

    const path = url.pathname.replace(/^\/api\/?/, "/");
    const op = url.searchParams.get("op") || path.slice(1) || "selftest";
    const spec = Object.hasOwn(OPS, op) ? OPS[op] : undefined;   /* R2: the table's own keys only */
    /* DEC-49 REGION is-unknown-op
       D-278 (C-69.1). `error` stays "unknown op" BYTE-IDENTICAL and stays the
       FIRST key after `ok`: civicos-ui's `queueAbsent` reads the sentence to tell
       an older plane from a refusal (I3), and `preauth-vocabulary.test.mjs` reads
       it out of this line textually. */
    if (!spec) return json({ ok: false, error: "unknown op", reason: "UNKNOWN_OP", ...dispatchRow("UNKNOWN_OP"),
                             op }, 400);
    /* END DEC-49 REGION is-unknown-op */

    /* D-456: a `store=` naming no namespace is refused here, before any credential is read (`namespaceGate`). */
    const unknownNamespace = namespaceGate(url);
    if (unknownNamespace) return unknownNamespace;
    /* D-463: the presented `ai` credential's ROW, read ONCE here and reused by the admission block and `caseReader`
       below, because the confinement is a property of the row and the gate needs it before anything else runs. A
       request presenting no credential, or one that is not an agent credential, asks the store nothing. */
    const presentedAi = await aiCredentialPresented(url, env);
    if (presentedAi.silent) return storeSilent(presentedAi.silent, presentedAi.correlation);
    /* D-463: a credential MINTED CONFINED to `scratch` is held to it here — a named `store=` refused by name, an absent
       one set to `scratch` — BEFORE D-461's gate, so a confined caller reaching a bio-pinned public op is told which
       fence stopped it and files nothing in the real record (`confinedNamespaceGate`). */
    const confinedNamespace = confinedNamespaceGate(url, presentedAi.cred);
    if (confinedNamespace) return confinedNamespace;
    /* D-461: `store=scratch` on a public op that always answers from `bio` is refused here (`pinnedNamespaceGate`). */
    const pinnedNamespace = pinnedNamespaceGate(url, op, spec);
    if (pinnedNamespace) return pinnedNamespace;

    /* Unauthenticated by design. Each one gates itself. */
    if (spec.classes === null) {
      const fp = await fingerprint(env.ADMIN_TOKEN);
      const stub = env.STORE.get(env.STORE.idFromName("bio"));
      /* Claiming and logging in are pinned to `bio` above, because an instance
         has ONE identity and there is nothing to claim in a scratch namespace.
         The INVITATION ops are different: the token IS the authority and it
         exists in exactly one store, so an unauthenticated caller naming a
         store gains nothing they do not already have, and pinning them to `bio`
         made an invitation created in `scratch` unredeemable. `memberadd` in
         `scratch` answered ok and handed over a token that could never work,
         which is a silent dead end and made the scratch namespace useless for
         rehearsing the member surface. Found against the deployed plane while
         closing D-41, not by the suite. */
      const invStub = url.searchParams.get("store") === SCRATCH
        ? env.STORE.get(env.STORE.idFromName(SCRATCH)) : stub;
      if (op === "claim") {
        const body = await req.json().catch(() => ({}));
        /* DEC-49 REGION is-bootstrap-claim
           D-278 (C-68.2–.4): installation facts, each `error` byte-identical, and
           no row says more than its sentence did. */
        if (!env.ADMIN_TOKEN) return json({ ok: false, reason: "BOOTSTRAP_CREDENTIAL_UNSET",
          ...installationRow("BOOTSTRAP_CREDENTIAL_UNSET"), error: "instance has no bootstrap credential set" }, 409);
        if (!(await liveToken(env.ADMIN_TOKEN)))
          return json({ ok: false, reason: "BOOTSTRAP_CREDENTIAL_PUBLISHED", ...installationRow("BOOTSTRAP_CREDENTIAL_PUBLISHED"),
            error: "bootstrap credential is a published repository value and can never arm a claim; set a fresh ADMIN_TOKEN in the Cloudflare dashboard" }, 409);
        if (body.bootstrapToken !== env.ADMIN_TOKEN)
          return json({ ok: false, reason: "BOOTSTRAP_CREDENTIAL_MISMATCH", ...installationRow("BOOTSTRAP_CREDENTIAL_MISMATCH"),
            error: "bootstrap credential does not match" }, 403);
        /* END DEC-49 REGION is-bootstrap-claim */
        return relayAnswer(stub.fetch(new Request(`http://do/claim?fp=${fp}`, {
          method: "POST", body: JSON.stringify({ role: "admin", password: body.password }) })), "claim");
      }
      /* ===== REC-126 / DEC-31 / IC-145: THE REVIEW COPY'S READ AND COMMENT (R20) ====== */
      /* ===== REC-126 / DEC-31 / IC-145: THE REVIEW COPY'S READ AND COMMENT ======

         UNGATED, because the reader it exists for holds no credential of this
         instance. Two doors and nothing else:
           - `secret=` — a RECIPIENT. The value is HASHED HERE and only the
             fingerprint crosses to the store (`aicredentialmint`'s rule: nothing
             past this line has ever held the value). ANY presented value takes
             this door, including an empty or malformed one, so a malformed secret
             travels the same path as a revoked one and meets the same bytes.
           - otherwise the caller's session or credential, resolved by
             `caseReader` exactly as the unsigned case document resolves it, and
             the store asks standing in the producing project.
         Every caller who is neither a live grant's holder nor a member with
         standing receives ONE answer — the store's `#noReviewCopy`, built from no
         argument — at ONE status, so revoked, never-issued, malformed, a draft
         that does not exist and a draft the caller cannot see are the same bytes.
         The inner URL is built from nothing of the caller's but `draft`. */
      /* D-150: `statementack` takes these two doors, and a member may name an unsigned case
         document (`case` + `edition`) in place of a draft. */
      if (op === "reviewcopy" || op === "reviewcomment" || op === "statementack") {
        const bySecret = url.searchParams.has("secret");
        const q = new URLSearchParams();
        const draftParam = (url.searchParams.get("draft") || "").trim();
        if (draftParam) q.set("draft", draftParam);
        if (op === "statementack" && !bySecret)
          for (const k of ["case", "edition"])
            if (url.searchParams.get(k)) q.set(k, (url.searchParams.get(k) || "").trim());
        if (op === "reviewcopy" && url.searchParams.get("limit")) q.set("limit", url.searchParams.get("limit"));
        if (bySecret) {
          q.set("bySecret", "1");
          q.set("secretSha", await sha256Hex(url.searchParams.get("secret") || ""));
        } else {
          const reader = await caseReader(url, env, "bio", presentedAi.cred);
          if (reader.silent) return storeSilent(reader.silent, reader.correlation);
          q.set("viewer", reader.viewer);
        }
        let commentBody = null;
        if (op === "reviewcomment") {
          let b = {};
          try { b = req.method === "POST" ? JSON.parse((await req.text()) || "{}") : {}; } catch { b = {}; }
          commentBody = JSON.stringify({ text: typeof b?.text === "string" ? b.text : "" });
        }
        const out = await doAnswer(stub.fetch(`http://do/${op}?${q}`,
          commentBody === null ? undefined : { method: "POST", body: commentBody }));
        return reviewAnswer(out, op);
      }
      /* The public ops whose handlers are their modules' (membership, publication, instance-setup, capture). */
      return hooks.publicOp({ req, url, env, op, stub, invStub, fp, presentedAi });
    }

    let cls = await classify(url.searchParams.get("token"), env);
    let viaSession = false;
    let sessMember = null, sessRights = null, sessCaps = null;
    /* REC-132: the two halves of `resolveSession`, set with `sessMember` and never
       apart from it. `sessViewer` goes wherever a VISIBILITY gate is stamped;
       `sessIdentity` wherever the question is WHO. */
    let sessViewer = null, sessIdentity = null;
    let aiCred = null;
    /* PL-11 / IS-5 / D-199 (2) — THE `ai` CLASS RESOLVES AGAINST THE RECORD,
       AND THAT IS THE DETERMINATION RATHER THAN AN IMPLEMENTATION DETAIL.
       `classify()` above compared four env bindings and found nothing; this
       block asks the store. A settings row "would be a way to change the
       standard with nothing to read afterwards" (DEC-17, transplanted by
       D-199 (2)), so what an agent may reach is a row a member wrote, with
       their name and the date on it.

       THE SHAPE IS CHECKED FIRST so a session token never reaches this lookup
       and an agent credential never falls through into the session one. Two
       different failures deserve two different answers.

       REC-52: a store silence is NOT "this credential is unknown". Answering
       401 on a store we could not consult would be the plane converting its own
       failure into a statement about who somebody is — the exact class REC-52
       closed, and the session block below already refuses to make it. */
    /* D-463: THE LOOKUP THIS BLOCK USED TO MAKE HAS MOVED TO THE FRONT DOOR and its answer arrives here as
       `presentedAi`. Nothing about the resolution changed — the shape is still checked before the store is asked, a
       silence is still a silence and is converted there (REC-52), and a credential the store does not know still leaves
       `cls` null so the session block below gets its turn. What changed is that the confinement gate needs the row
       BEFORE the unauthenticated block runs, and resolving it twice would let a revocation land between the two. */
    if (!cls && presentedAi.cred) { cls = "ai"; aiCred = presentedAi.cred; }
    /* A browser signed in with a password holds a session token, not a
       machine credential. The write arc opens INTAKE to sessions: promote,
       lease, allocid, capture, ratify, and inbox review run through the
       same gated paths as machine callers, with authorship stamped
       server-side from the session identity so a browser can never claim
       to be someone else. Everything outside SESSION_OPS, purge above all,
       still requires a machine credential. capture is nominally mutating
       because of its PUT path; its GET is a read and is treated as one. */

    /* DEC-49 REGION is-admission
     *
     * THE ADMISSION GATE (REC-79 / C-38) — every refusal a caller meets BEFORE
     * their op runs, and the first thing anybody, signed in or not, ever meets.
     *
     * FOUR OF THE SIX REFUSALS IN HERE CARRIED NO CODE AT ALL until this region
     * was drawn. They answered with a bare `error:` sentence and nothing a
     * surface could key on, which made them invisible to DEC-49's guard and
     * absent from its 427-code census — a census of CODES cannot count a refusal
     * that has none. They were found by GOVERNING the site rather than reading
     * it: the guard's outcome reader could not see `return json({ … }, 403)` at
     * all, so this region reported nothing to judge until that was widened.
     *
     * **CORRECTED 2026-09-19 BY D-270: THE SESSION GATE HAS LEFT THIS REGION.**
     * The count above is the count as REC-79 drew it and is kept as the record
     * of why the region exists; what this span holds TODAY is five refusals, not
     * six. The sixth — `MACHINE_CREDENTIAL_REQUIRED` — moved out to its own
     * named function `sessionOpGate` and its own region `is-session-op-gate`,
     * because it turned out to be answering THREE different facts with one
     * sentence and to be false for two of them. Its `where` moved with it. This
     * paragraph is corrected rather than deleted for the reason the project
     * keeps meeting from the other side: a comment describing a mechanism the
     * tree does not carry is its most-repeated defect.
     *
     * Every code below is a STRING LITERAL at its site, and `admissionRow` reads
     * the C-number and the canned translation from the ONE row, so the
     * `translation: undefined` DEC-49 was written to prevent cannot be spelled
     * here — the helper throws instead.
     *
     * THE SPAN, and why it starts where it does. It opens at the session-token
     * lookup and closes after the scope refusal, because that is the whole of
     * "may this caller act at all"; the op's own work begins below. Both markers
     * sit at the SAME brace depth on purpose (REC-71's wrong-span failure).
     *
     * WHAT IS IN THE SPAN AND DELIBERATELY NOT GOVERNED, stated rather than left
     * for the next reader to wonder about: `return storeSilent("session")`. It
     * is not an admission refusal — it is the plane declining to make ANY claim
     * about who somebody is when the store could not be reached (REC-52), which
     * is a fact about the instance and not about the caller. It carries its own
     * code, `STORE_DID_NOT_ANSWER`, held in a CONSTANT rather than written as a
     * literal — so no source-text matcher sees it and it is not in the census at
     * all. REC-79 names that rather than fixing it; it is D-236's class, one
     * layer out, and it belongs to the partition arm's own residue. */
    if (!cls) {
      const t = url.searchParams.get("token");
      if (t && /^[0-9a-f]{64}$/.test(t)) {
        const st = env.STORE.get(env.STORE.idFromName("bio"));
        /* REC-52, and this is the class arriving at the AUTHENTICATION path,
           which is why it is converted rather than left as an internal read.
           `r?.result?.session` swallowed a store silence into `undefined`, and
           the code below then refuses the caller BY NAME — "this operation
           requires a machine credential", or the generic session refusal. So a
           store that could not be reached was reported to a signed-in member as
           a fact about their credential. The record makes no claim about who
           somebody is when it could not look. */
        const sOut = await doAnswer(st.fetch(`http://do/session?t=${t}`));
        if (!sOut.answered) return storeSilent("session", sOut.correlation);
        const sess = sOut.result?.session;
        if (sess) {
          const kind = sess.role === "admin" ? "admin" : "member";
          /* Section 8.1, checked BEFORE the generic session refusal so the
             answer says the right thing. The generic message is "this operation
             requires a machine credential", which is true and misleading: a
             MEMBER_TOKEN machine credential cannot export either. What is
             required is the ADMIN_TOKEN-class credential specifically, and for a
             security-critical op the caller deserves the actual rule. */
          if (op === "export")
            return json({ ok: false, reason: "ROOT_OF_TRUST_REQUIRED", ...admissionRow("ROOT_OF_TRUST_REQUIRED"), op,
              detail: "a full working-corpus export needs the ADMIN_TOKEN-class credential itself, not a "
                    + "signed-in session, and not in-app administrator status. A session is derived from a "
                    + "password; the root of trust is the token held in the hosting account. This refuses "
                    + "the founder's own browser too, which is the one place in this system where being "
                    + "the founder is not enough. The published record needs no credential at all: see "
                    + "op=publishedmanifest." }, 403);
          /* `error` IS KEPT BYTE-IDENTICAL and the code is added beside it
             (REC-79). 28 suites assert on these sentences; a rule this project
             adopted late has to be arrivable at without breaking what already
             reads the old shape, so C-38 is ADDITIVE on the wire. IC-REC-79. */
          /* D-270: the gate is a NAMED FUNCTION now, so a DEC-49 `where` can
             point at it, and it answers THREE different conditions where this
             line answered one — of which the one it answered was false for two.
             It returns the REFUSAL RESPONSE or null, rather than an object for
             this line to spread — see its own header: spreading it here would
             add a fifth INHERITED VERDICT to a DEC-49 ceiling that may only
             fall, and it buys nothing, because the codes are literals inside the
             gate's own governed region where the walk can compare them. */
          const gated = sessionOpGate(kind, op, spec, req.method);
          if (gated) return gated;
          cls = kind;
          ({ member: sessMember, viewer: sessViewer, identity: sessIdentity } = resolveSession(sess));
          sessRights = sess;
          viaSession = true;
        }
      }
    }
    if (!cls) return json({ ok: false, reason: "NOT_AUTHENTICATED", ...admissionRow("NOT_AUTHENTICATED"),
      error: "unauthenticated" }, 401);
    /* PL-11 / D-199 (1): CLASS PLUS SCOPE, and for THIS class the scope is the
       whole of it. The `ai` class is admitted by `aiTaskScope` and never by
       appearing in a row of the OPS table — no row names it, which is asserted
       structurally — so this branch is not an exemption from the class ACL. It
       is the class ACL, in the shape `scopeFor` already uses one function over,
       reading a declaration a member authored instead of a literal in a table.
       Refusals here carry their C-number and canned translation like every other
       refusal a member can receive (DEC-49). */
    if (cls === "ai") {
      const scoped = aiTaskScope(aiCred, op, spec);
      if (scoped.error) return json({ ok: false, ...scoped.error, op, cls }, 403);
    } else if (!(viaSession || !Array.isArray(spec.machineClasses) ? spec.classes : spec.machineClasses).includes(cls)) {
      /* REC-159: a row carrying `machineClasses` judges a caller that did NOT arrive by a session
         against THAT list, so granting `member` to an enrolled administrator's session admits no
         MEMBER_TOKEN bearer (the four custodial ops' rows). One refusal, the same code and sentence. */
      return json({ ok: false, reason: "CLASS_FORBIDDEN", ...admissionRow("CLASS_FORBIDDEN"),
        error: "forbidden for token class", op, cls }, 403);
    }

    /* Section 8.1: the ROOT OF TRUST, and not in-app administrator status.
     *
     * A full working-corpus export is the group's entire unpublished position.
     * If any administrator could take it, one captured administrator
     * exfiltrates everything and the export becomes the most efficient attack
     * in the system, which section 8 names as the whole difficulty.
     *
     * So the ADMIN_TOKEN-class credential itself, and NOT a session belonging to
     * an administrator. A session is derived from a password; the root of trust
     * is the token set in the hosting dashboard. This refuses a stolen admin
     * password, and it refuses the founder's own signed-in browser, which is the
     * one place in this system where being the founder is not enough. */
    if (op === "export" && viaSession)
      return json({ ok: false, reason: "ROOT_OF_TRUST_REQUIRED", ...admissionRow("ROOT_OF_TRUST_REQUIRED"), op,
        detail: "a full working-corpus export needs the ADMIN_TOKEN-class credential itself, not a "
              + "signed-in session, and not in-app administrator status. A session is derived from a "
              + "password; the root of trust is the token held in the hosting account. The published "
              + "record needs no credential at all and is available at op=publishedmanifest." }, 403);

    /* Section 5 enforcement. Only a SESSION carries capabilities; a machine
       credential has no member behind it and stays bounded by the class ACL
       above. capture's GET is a read and is treated as one here for the same
       reason the session ACL treats it as one directly above. */
    if (viaSession) {
      sessCaps = new Set(sessRights.capabilities || []);
      const needs = NEEDS[op];
      if (needs && !(op === "capture" && req.method === "GET") && !sessCaps.has(needs))
        return json({ ok: false, reason: "NOT_CAPABLE", ...admissionRow("NOT_CAPABLE"),
          op, needs, held: [...sessCaps].sort(),
          detail: `this account does not hold the ${needs} capability. Capabilities are set by an `
                + `administrator, so ask one to grant it rather than looking for another route.` }, 403);
    }

    const scope = scopeFor(cls, url);
    if (scope.error) return json({ ok: false, reason: "SCOPE_REFUSED", ...admissionRow("SCOPE_REFUSED"),
      error: scope.error, tokenClass: cls }, 403);
    /* END DEC-49 REGION is-admission */
    const storeName = scope.name;

    /* D-9. The register audit finishes HERE and not in the Durable Object,
       because classifying a register row needs R2, and the DO neither holds the
       store name nor should guess it: capture keys are `<store>/captures/<sha>`.
       This is the SAME probe the gate already uses on the ratify path, where
       runGate enforces "bytes the register claims must exist" and refuses with
       PLANE_MISSING_BYTES. Making the diagnostic ask the same question as the
       enforcer, rather than inventing a second answer, is the whole point: the
       first version of this audit looked only in `files` and `history`, called
       everything else "dropped", and produced a confident wrong finding that
       the Apps Script migration was unauditable. The bytes were in R2. */
    /* op=whoami. What the caller is and what they may DO, so an interface can
       satisfy section 5's "absent from their interface" without keeping its own
       copy of the capability rules and letting it drift.

       A machine credential holds NO capabilities and the honest answer is null
       rather than an empty list or a full one: there is no member behind a token
       class, so there is nothing to hold them. What bounds a machine caller is
       the op table and the scratch confinement, and reporting it as though
       section 5 applied would be inventing a member who does not exist.

       `vocabulary` is the full set, so an interface can tell "not held" from
       "not a capability at all" without hardcoding the list. */
    if (op === "whoami") {
      return json({ ok: true, result: {
        tokenClass: cls,
        session: viaSession,
        member: viaSession ? sessMember : null,
        handle: viaSession ? (sessRights.handle ?? null) : null,
        administer: viaSession ? !!sessRights.administer : cls === "admin",   /* R18: the root of trust administers */
        rootOfTrust: viaSession ? !!sessRights.rootOfTrust : false,
        capabilities: viaSession ? [...sessCaps].sort() : null,
        vocabulary: Store.CAPABILITIES,
        /* D-463: WHETHER THIS CREDENTIAL CAN EVER REACH THE RECORD, answered as a value rather than left for a
           caller to infer from the `store` beside it. The two are different facts and an instrument needs both:
           `store` is where THIS call landed, `confinedTo` is where every call it will ever make lands. `null` is
           "not confined", which is the honest answer for a session (a member is not a confined credential) and
           for the four binding classes (an operator sets them in the hosting dashboard, and there is no row to
           carry the property — the probe class's confinement is its CLASS's, read out of `scopeFor`, and is
           reported as `store` on every one of its answers). */
        confinedTo: cls === "ai" && aiCred ? (aiCred.confinedTo ?? null) : null,
        detail: viaSession
          ? "capabilities are set by an administrator and gate what this account may DO, not what it may see"
          : "a machine credential has no member behind it and therefore holds no capabilities; it is bounded "
          + "by the operation table and by namespace confinement instead",
      }, store: storeName, tokenClass: cls }, 200);
    }

    const stub = env.STORE.get(env.STORE.idFromName(storeName));

    /* A few ops read better at the edge than they do inside the store, so
       the public name and the internal name differ. The map is the only
       place that difference lives. */
    /* REC-14: op=publish is the STATE ACT; the store's own /publish is the
       ratify committer that writes the published_bundles row. Two different
       things with one obvious name, so the public name and the internal name
       differ here exactly as they do for op=inbox. */
    const DO_PATH = { inbox: "inboxlist", memberlist: "memberlist", signerlist: "signerlist",
                      publish: "publishcase" };
    const inner = new URL("http://x/" + (DO_PATH[op] || op));
    for (const [k, v] of url.searchParams) if (k !== "token" && k !== "op") inner.searchParams.set(k, v);
    /* REC-132 / D-422: `identity` — WHO is asking, beside `viewer`'s what they may see —
       is the SERVER's stamp and nothing else. Deleted for every op before anything is
       stamped, so a caller naming a member here reads as nobody rather than as them. */
    inner.searchParams.delete("identity");
    /* R17, R29: EVERY stamp the caller sent is deleted, whether this op declares it or not; the op's own are set below. */
    for (const k of QUERY_STAMPS) inner.searchParams.delete(k);
    /* Who holds a lease is stamped by the server, never taken from the request,
       for BOTH a session and a machine credential — the same impostor rule
       `author`, `by` and `viewer` follow below. A session stamps the member; a
       machine credential stamps `token:<class>`, a NAMED machine identity, so an
       unattended writer can take the lock (D-61) without borrowing a person's
       name and without being anonymous. The caller's own `actor` was copied in
       the loop above, so it is DELETED first and set second: a lease whose actor
       the caller may choose names nobody. This does not weaken integrity — the
       lease is a courtesy lock and promote's CAS on `base` is what prevents a
       lost update — it makes the courtesy lock reachable by a named daemon.
       The store additionally refuses a null/blank actor by name, so a bypass of
       this stamp fails closed rather than tripping the NOT NULL constraint. */
    if (op === "lease") inner.searchParams.set("actor", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
    /* K372 (monitoring R30): WHO PAUSED OR RESUMED THE DAEMON, the server's stamp by the roster acts' `by` expression and
       set after the caller's parameters were copied, so a caller's `actor` is overwritten; monitoring records it with
       the pause and states it on every tick's answer. */
    if (op === "monitorpause") inner.searchParams.set("actor", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* D-15: whose view a query compiles for is decided by the SERVER, from the
       credential that authenticated, and set AFTER the caller's parameters were
       copied so a caller-supplied `viewer` is overwritten rather than honoured.
       The gate is flat member scope today and returns true for a member; when
       projects and positions land it returns a real predicate and this is still
       the only place the identity comes from. A viewer the compiler does not
       recognise compiles to a deny predicate, so the failure mode of a missing
       stamp is an empty result rather than an unfiltered one. */
    /* REC-25 / F-8: the stamp covers EVERY read that could name a bundle, not
       only the compiled-query paths. op=list, op=index, op=projection,
       op=image and op=file bypassed it — an uninvited member read every
       project's id, title and state, and op=image handed over the document
       body itself — and op=backlinks is born stamped. The store fails closed
       on an absent viewer, so removing an op from this list yields an empty
       answer rather than an unfiltered one. (op=affordances takes the same
       stamp in its own handler above; op=search and the edge/state actions
       were stamped from the first commit.) */
    /* REC-30: the sweep of what REC-25 left. REC-25 stamped the reads ADDRESSED
       to a bundle; these are the reads addressed to something else that NAME a
       bundle on the way past — op=dangling (measured: a project citing a
       nonexistent target handed an uninvited member its own id), the task inbox
       and its refers_to filter, the recogniser and progression reads and the
       two write-echoes that read an instance back, and the two paging integrity
       sweeps whose findings name bundles. Every one fails closed in the store on
       an absent stamp, so removing an op from this list withholds an answer and
       never widens one. `op=queue` and `op=affordances` take the same stamp in
       their own handlers above. */
    /* REC-36: `readingname` joins them, and its posture is the STRONGER of the
       two the gate's header describes. The other reading reads keep the row and
       withhold the bundle back-reference; a CANDIDATE list withholds the ROW,
       because a document a member cannot open is not a candidate and offering a
       nameless one still discloses that something mentioning their subject sits
       in a project they were not invited to. Fails closed in the store on an
       absent stamp, like every op in this list. */
    /* CPDF-10: both transcription reads name the bundle a capture is filed in,
       so both take the same stamp for REC-30's reason exactly — the answer
       would otherwise disclose that a document sits in a project the caller was
       never invited to, by telling them what produced its text. `attesttext`
       is NOT here: it is a WRITE and takes its own member route. */
    /* REC-132 / D-422: the ops whose store method reads the POSITIONAL `identity` stamp
       (`#positionalMember`). `affordances` and `queue` build their own inner requests
       above and stamp it there. A new reader of `identity` joins this list. */
    /* D-681 (T5-11): `leadlist` joins, `leadread`'s reach asked of the same positional stamp. */
    const IDENTITY_READS = ["leadlook", "leadread", "leadshare", "leadlist", "frontier"];
    const REC30_VIEWER_READS = ["dangling", "tasks", "reading", "readingref", "readingname",
                                "textprovenance", "textattest",
                                /* CPDF-13: the drift obligation's rows NAME the bundle each
                                   affected capture is filed in, so it takes the same stamp
                                   for REC-30's reason exactly — otherwise "which of your
                                   documents rest on a superseded measurement" would disclose
                                   that a document sits in a project the caller was never
                                   invited to. `calibrations` is NOT here: it answers about
                                   ENGINES and names no bundle at all. */
                                "calibrationdrift", "resolutions",
                                "concerns", "connections", "instance", "exceptions", "thread",
                                "discharge", "audit", "searchindexcheck", "projectownerarith",
                                /* REC-14's read, swept at the merge: its bar report NAMES the
                                   projects that declared the bar, which is §7.9's reverse-edge
                                   walk arriving by a new door. The VALUE stays whole for every
                                   reader (DEC-17) — only the names are withheld. */
                                "strengthbarof",
                                /* REC-149: the setting's read and the directory decide by the caller's SIGHT
                                   (Membership v2 §7.14), so both take the stamp; each fails closed without it. */
                                "projectvisibility", "projectdirectory",
                                /* REC-196: the roster read names a project by its own id, so the store needs the
                                   caller's SIGHT to answer C-70.1 at EXISTENCE (BOB #32's ruling (a)). Its own
                                   answer still reads the `by` stamp below; the viewer is read only by that check. */
                                "projectparticipants",
                                /* REC-150: the requests read decides by the caller's SIGHT of the project it
                                   names (C-70.1 at EXISTENCE, the absent answer at NONE), so it takes the stamp. */
                                "projectrequests",
                                /* N321 (publication R44): the stage read names a project by its own id and answers by
                                   the caller's SIGHT (the absent answer at NONE, the id and name at EXISTENCE), so it
                                   takes the stamp and fails closed without it. */
                                "projectstage"];
    /* PL-9: op=meaningrows is the SAME compiler read at meaning grain, so it
       takes op=search's stamp beside op=search rather than joining a list of
       reads that merely name a bundle. Its answer is a CANDIDATE LIST in §14c's
       sense and takes REC-36's stronger posture in the store — the whole ROW is
       withheld, never a redacted reference — and, like every op here, it fails
       closed on an absent stamp: the deny predicate answers zero rows AND a zero
       total, so hidden and absent are the same answer. */
    if (op === "search" || op === "meaningrows" || op === "select" || op === "selection" || EDGE_ACTIONS.includes(op)
        || STATE_ACTIONS.includes(op)
        /* REC-24: both action acts read the bundle behind the fail-closed gate
           before they write it, so an action the caller may not see refuses
           NO_SUCH_BUNDLE identically to an absent one. */
        || ACTION_ACTIONS.includes(op)
        /* REC-45: it reads the inquiry behind the fail-closed gate before it
           rewrites it, so a question the caller may not see refuses
           NO_SUCH_BUNDLE identically to an absent one. */
        || STRUCTURE_ACTIONS.includes(op)
        || op === "list" || op === "index" || op === "projection" || op === "image"
        || op === "file" || op === "backlinks" || op === "excludedby" || op === "reevaluations"
        /* REC-34: the gated read of the derived pair. Its subject is a bundle
           and its answer NAMES bundles in fields AND in prose, so it is stamped
           with every other retrieval read; the store fails closed on an absent
           stamp and withholds the answer as an absent bundle's. */
        || op === "inquirystrength"
        /* REC-18: its subject is an inquiry and its answer names the bundles a
           basis rests on, so it is stamped with every other retrieval read. The
           store fails closed on an absent stamp, withholds an invisible inquiry
           as an absent one, and drops an invisible target with no id and no
           count. */
        || op === "earnedbasis"
        /* REC-83 / IC-84 (4): the fixed-key content read. Its subject is a
           content ROW and its answer names the BUNDLE the row's capture is
           filed in, so it takes the same stamp for REC-30's reason exactly. It
           matters more here than on most of this list: the id is
           hash(capture, extent, chain), so a caller who can guess an address
           must not be able to learn from the answer whether the passage exists
           in a project they were never invited to. The store fails closed on an
           absent stamp and answers an invisible row EXACTLY as an absent one. */
        || op === "content"
        /* D-419 (T5-11): the crop resolves ONE content row by id, so it takes op=content's stamp for op=content's
           reason, and the store answers an invisible row exactly as an absent one (NO_SUCH_CONTENT). */
        || op === "contentcrop"
        /* REC-54: its subject is a bundle and it reads that bundle's register
           before it rewrites it, so a document the caller may not see refuses
           NO_SUCH_BUNDLE identically to an absent one. The store fails closed on
           an absent stamp, like every op in this list. */
        || op === "provenancechain"
        /* REC-63: its subject is a bundle and its answer names it, so it is
           stamped with every other retrieval read — and the store's own refusal
           makes an invisible document answer EXACTLY as an absent one
           (ROUTE_MARK_NO_SUCH_BUNDLE), which is the whole reason the stamp
           matters here: a marker on a document the caller may not see must not
           be establishable by asking to make one. */
        || op === "provenanceroute"
        /* REC-116: the COLLECTION read over the same marks, and it is the shape
           that LEAKS if the stamp is missing rather than the shape that merely
           refuses — a marker names a document the group holds, so a row the
           caller may not see must be ABSENT from the roster byte-identically to
           one that does not exist (op=airuns' rule, REC-30/REC-25's leak). The
           store fails closed on an absent stamp, like every op in this list. */
        || op === "provenanceroutes"
        || QUEUE_ACTIONS.includes(op)
        /* IS-6: a run names an inquiry or a project bundle, so a run over a
           project the caller was never invited to must answer exactly as a
           nonexistent run does — REC-25/REC-30's leak, one object over. The
           store fails closed on an absent stamp, like every op in this list. */
        || op === "airun" || op === "airunlog" || op === "airunspawn"
        /* REC-139 / D-428: the three RUN VERBS state how many projects draw on the run's question
           (`projectGate.projects`), and that count may include only projects the caller can SEE
           (Membership v2 §7, BOB #15). The stamp is what the store counts in; DEC-63's verdict is
           not read from it. Fails closed on an absent stamp: no project is stated, never every one. */
        || RUN_VERB_ACTIONS.includes(op)
        /* REC-93: the frontier's subjects are addresses a project went looking
           for, which is the same disclosure a run is — §6 says REC-36's
           withholding applies row-whole across the fence. Stamped here so the
           store fails closed on an absent stamp, like every op in this list. */
        || op === "frontier" || op === "contentaxis"
        /* REC-69: the same gate, keyed the other way round. Its three siblings
           take a RUN ID and answer about the context that run names; this one
           takes the CONTEXT and answers about the runs in it — so it is the
           shape that leaks if the stamp is missing, rather than the shape that
           merely refuses. A run in a project the caller was never invited to is
           ABSENT from the list, byte-identically to one that does not exist, and
           the store fails closed on an absent stamp like every op in this list. */
        || op === "airuns"
        /* PL-10 / D-220: a version chain names a BUNDLE per version, so a
           document captured inside a project the caller was never invited to
           must be absent from the chain exactly as it is absent from op=list.
           The store gates at `register.bundle_id` through the same
           `#bundleGate` every read here compiles and counts `total` through the
           same predicate, so hidden and absent are one answer; and it fails
           closed on an absent stamp, like every op in this list. */
        || op === "versionchain"
        /* D-394: the notice names the question or passage asked about AND the
           newer version it found, so both are gated: the subject through
           `#viewerSees` and the chain through `versionChain`'s own gate. Fails
           closed on an absent stamp, like the chain it reads. */
        || op === "versionnotice"
        /* PL-1 / IS-1: a version set names its INQUIRY and every bundle its legs
           rest on, so an inquiry the caller was never invited to must answer
           exactly as one with no versions and as one that does not exist. The
           store applies `#bundleGate` to the inquiry ONCE and counts `total`
           behind the same gate, so hidden and absent are one answer; and it
           fails closed on an absent stamp, like every op in this list. */
        || op === "basisversions"
        /* PL-14 / IS-7: a strength names the QUESTION and every document its
           reading rests on, so a question the caller was never invited to must
           answer exactly as one that does not exist. The store applies
           `#bundleGate` to the inquiry ONCE, before any leg is read, and fails
           closed on an absent stamp, like every op in this list. */
        || op === "versionstrength"
        /* REC-161: the proposed-partition independence read names the same
           QUESTION and the documents its reasons rest on, so it takes the same
           stamp; the store gates the inquiry ONCE, before any leg is read, and
           fails closed on an absent stamp. */
        || op === "partitionindependence"

        /* PL-12 / D-84: a project-scoped manifest names a PROJECT bundle, and
           the adopted bias bundles are bundles too, so a caller who may not see
           the project must be answered exactly as they are for a project that
           does not exist — REC-25/REC-30's leak arriving at the lens. The store
           gates through the same `#bundleGate` every read here compiles and
           fails closed on an absent stamp, like every op in this list. */
        || op === "biasmanifest"
        /* REC-207: the bias-debt READ names a RUN and its answer names the run's context, so it takes the
           same fail-closed stamp its three run-read siblings do — a debt on a run the caller was never
           invited to must be absent byte-identically to a run that never carried one. And the RESOLVE
           takes it too, because its refusal is asked through the SAME `#bundleGate`: an unseen debt and an
           absent one are deliberately one answer, which they cannot be if the gate is not stamped. Fails
           closed on an absent stamp, like every op in this list. */
        || op === "biasdebt" || op === "biasdebtresolve"
        /* REC-149 (Membership v2 §7.14): the two acts that name a project and took no viewer — a bias set adopted
           into a project's scope, and a review copy's draft under a project. Each asks the stamp ONLY for
           EXISTENCE (a discoverable project, a member outside it: C-70.1); every other caller's answer is
           unchanged, because each act's own fence already answers without it. */
        || op === "biasadopt" || op === "casedraft"
        /* PL-2 / IS-2: the six acts name an inquiry, and make-current also names
           a project. A question the caller was never invited to must refuse
           exactly as an absent one does, so the store gates both through the same
           predicate and fails closed on an absent stamp, like every op here. */
        || VERSION_ACTIONS.includes(op)
        /* PL-3 / IS-4: the suggest endpoint names an inquiry AND resolves every
           leg against the corpus, so it takes the same fail-closed viewer stamp
           for BOTH — a question the caller was never invited to must refuse
           exactly as an absent one does, and a leg the caller cannot see must
           be unreachable rather than silently accepted. */
        || op === "suggest"
        /* PL-4 / IS-4: the capture-request door names the inquiry the request is
           accountable to, so a question the caller was never invited to must
           refuse exactly as an absent one does — otherwise the door would be a
           way to learn that a question exists by asking to fetch under it. */
        || op === "capturerequest"
        /* PL-4: and the queue READ, for the same reason one line up — a request
           names the question it was asked under, so the queue under an inquiry
           the caller was never invited to must be absent exactly as one that was
           never made. */
        || op === "capturerequests"
        /* T6-13 (capture-requests R42): the retry names a request and the question it was asked under, so the store
           asks this viewer's sight of it and answers an unseen request as an absent one. Fails closed on an absent
           stamp. */
        || op === "capturerequestretry"
        /* T6-13 (intent R23): every one of intent's reads and acts names a project, a goal or an aspiration, and each
           answers one the viewer may not see exactly as an absent one, so all seventeen take the stamp. */
        || INTENT_ACTIONS.includes(op) || INTENT_READS.includes(op)
        /* T6-13 (reevaluation R9, R14–R16, R20): the notices and the pull read name findings and passages, and the three
           acts name a notice or a dependent, each seen through its holder; an unseen one answers as absent. */
        || op === "reevaluationnotices" || op === "reevaluationchanges" || REEVALUATION_ACTIONS.includes(op)
        /* D-266 / IC-60: the disposition act's SECOND key shape names a PROJECT — the team
           whose feed the decision governs — so it takes the same fail-closed stamp for the
           same reason every op above does. A project the caller was never invited to must
           refuse EXACTLY as one that does not exist, or the act becomes a way to learn that
           a project exists by trying to record a judgment under it (REC-25/REC-30's leak
           arriving at a WRITE rather than a read). The instance-wide shape names no project
           and is unaffected: it reaches the same store method and never consults the stamp. */
        || op === "proposedispose"
        /* SK-7: marking a passage citable NAMES A DOCUMENT, so it takes the same
           fail-closed stamp every op above does and for the same reason arriving
           at a new door. A content id is `hash(capture, extent, chain)` and the
           act answers whether the row was NEWLY minted, so without the gate a
           caller could learn that a document exists in a project they were never
           invited to by trying to mark a page of it — REC-25/REC-30's leak,
           arriving at a WRITE. The store fails closed on an absent stamp and
           answers an invisible bundle EXACTLY as an absent one. */
        || op === "contentmint"
        /* SK-8: both EXTRACT ops, for `contentmint`'s reason exactly. The WRITE
           mints through that same door, so it carries the same oracle; and the
           READ answers about documents, so an ungated listing would be the
           identical leak one op over. Fails closed on an absent stamp. */
        || op === "extractpropose" || op === "extractproposals"
        /* REC-147: the candidate write re-forms the pairs AS THIS VIEWER (§6) and pairs only what the viewer may
           see, so it needs the viewer exactly as `contradictionpairs` does. Fails closed on an absent stamp. */
        || op === "contradictionpropose"
        /* REC-86: NARROW and its candidate read both NAME A QUESTION and read
           its readings, so a question the caller was never invited to must
           answer exactly as one that does not exist — the version acts' reason
           one screen up. Fails closed on an absent stamp. */
        || op === "narrow" || op === "narrowcandidates"
        /* REC-122: choosing a connection's on-point mention NAMES A DOCUMENT (the end
           chosen on), so a document the caller was never invited to must answer exactly
           as a connection that does not exist (C-74.2). Fails closed on an absent stamp. */
        || op === "connectionchoose"
        /* T5-11 (K145, connections R53–R57): each names a document or a capture — the two ends asserted, a
           document's asserted connections, an agenda capture, a stored containment's two ends — so a document the
           caller was never invited to answers exactly as one that does not exist. Fails closed on an absent stamp. */
        || op === "connectionassert" || op === "connectionsasserted" || op === "filemembershipstore"
        || op === "filemembership" || op === "filemembershipjudge"
        /* REC-146: THE PAIRING READ names no single object and is gated for a wider
           reason than the two above — it ENUMERATES, across every question and every
           cited document, and section 6 of its design requires it to pair only what
           the viewer may see and never to enter a project's contents uninvited. An
           absent stamp therefore fails CLOSED to `scope: DENY`, and the answer SAYS
           it compared nothing rather than reading as a record with no conflicts. */
        || op === "contradictionpairs"
        /* D-148: the quote read ENUMERATES across actions by counterparty, so it
           reads only what the viewer may see and fails CLOSED on an absent stamp. */
        || op === "actionquotes"
        /* REC-198: the LIST of a project's drafts NAMES A PROJECT and enumerates its working material, so a
           project the caller cannot see must answer exactly as one that does not exist — and the single read of
           a draft answers such a caller `#noReviewCopy`, so the list does too (BOB #32: fenced exactly like it).
           Fails closed on an absent stamp. */
        || op === "casedrafts"
        /* REC-87: all three TRANSCRIBE ops name a DOCUMENT (the act) or a content
           row filed in one (the attestation and the read), so a document the
           caller was never invited to must answer exactly as one that does not
           exist — `contentmint`'s and `content`'s reason. Fails closed on an
           absent stamp. */
        || op === "transcribe" || op === "transcriptionattest" || op === "transcription"
        /* T5-11 (content R43, K134): attesting a capture's text names the bundle the capture is filed in, so the
           store asks the viewer before it records anything and answers a capture filed where the caller cannot see
           exactly as one this record has not read (NO_READING); it fails closed on an absent stamp. The attestor
           is stamped below, by its own rule. */
        || op === "attesttext"
        /* MK-4: the look and the read name a LEAD, readable by its author only,
           and the look names what it found (a capture or a content row), which is
           gated like every other reference to a document. Fails closed on an
           absent stamp. */
        || op === "leadlook" || op === "leadread" || op === "leadshare" || op === "leadlist"
        /* D-162: a THEME's placement acts and its read NAME A DOCUMENT (or a passage
           of one), so a document the caller was never invited to must answer exactly
           as one that does not exist — `contentmint`'s reason. Fails closed on an
           absent stamp. */
        || op === "themeplace" || op === "themepropose" || op === "themeread" || op === "themewithdraw"
        /* REC-203: a PAIR judgement names two CAPTURES and reads where the record retrieved each, so a
           document the caller was never invited to must answer exactly as one the record does not hold
           (C-91.3) — `contentmint`'s reason. Fails closed on an absent stamp. */
        || op === "idmatch"
        /* REC-195: the governing-law proposal NAMES AN ACTION and reads it behind the fail-closed gate before
           it writes anything, so an action the caller may not see refuses NO_SUCH_BUNDLE identically to an
           absent one — `ACTION_ACTIONS`' own reason, arriving at an op that is not one of them. */
        || op === "actionlawspropose"
        /* D-464: the COUNTS. Every counter `op=stats` serves names rows, and a row naming a project the caller
           cannot see is that project's existence (§7.9) — so the counts are taken through the caller's own
           sight, and fail closed on an absent stamp. `op=selftest` relays the same answer and stamps the same
           viewer at its own fetch. */
        || op === "stats"
        /* D-464: `op=selectionlist`'s `bytes` sums every owner's selection rows, so it takes the same stamp. */
        || op === "selectionlist"
        /* D-525: the Drive shell sweep walks `bundles` and names bundle ids, so it takes
           op=index's stamp for op=index's reason (REC-25): an invisible bundle is not walked. */
        || op === "driveshells"
        /* REC-138 / D-426: the ROSTER acts name a project, so one the caller cannot see must
           answer exactly as one that does not exist — asked of SIGHT before any positional test
           (`Store#inSight`). `by` (below) stays the positional half; this is the visibility half.
           ONE DIFFERENCE from the rest of this list, stated at `Store#rosterInSight`: the store
           treats a viewer that was never SENT as a direct internal call and does not ask, on
           `#projectAuthority`'s absent-identity precedent — so this stamp is load-bearing, and the
           `roster-stamp-dropped` control arm measures what removing it discloses. */
        || PROJECT_ACTIONS.includes(op)
        /* N85's other half (membership R19, K124): which pairings a caller may see is asked of its viewer — a
           member sees its own unpublished pairing — beside the administer stamp below. Without either the store
           answers the published pairings alone (fails closed). */
        || op === "memberpairings"
        /* T8 (layer 9): every act and read of the action layer names a determination, a standard, an act, an
           action, a filing, a packet or an escalation, each seen through the project it belongs to, so each module
           answers one the viewer may not see exactly as an absent one. Fails closed on an absent stamp. */
        || ACTION_LAYER_ACTIONS.includes(op) || ACTION_LAYER_READS.includes(op)
        /* T8 (actions R28): the risk-tier proposal names an action and reads it behind the fail-closed gate before it
           writes, `actionlawspropose`'s reason. */
        || op === "actionriskpropose"
        /* T8 (monitoring R32): the monitored sources name bundles, `driveshells`' reason (REC-25). */
        || op === "monitoring"
        /* K372 (monitoring R30): the due slate names bundles too, and answers only what the viewer may see. */
        || op === "monitorslate"
        /* N345 (contradiction R10, R25–R55): every read and act names a candidate, an inquiry, a referent or a project
           and answers only what the viewer may see of each side; the run's recommendation is re-formed as this viewer,
           as its candidate write is. Fails closed on an absent stamp. */
        || CONTRADICTION_ACTIONS.includes(op) || CONTRADICTION_READS.includes(op) || op === "contradictionrecommend"
        /* N345 (entities R38, R32): the two registry reads now answer each resolution's defect reports, whose `by` is
           withheld from a viewer who may not see the document, so they take the stamp. */
        || op === "entity" || op === "entitybyalias"
        /* N345 (case-authoring R32): the ceremony's read names a project and its members, read exactly as op=publish
           reads them, so it takes publish's stamp. */
        || op === "publishtensions"
        || REC30_VIEWER_READS.includes(op)) {
      /* PL-11 / IS-5 / D-199 (4) — THE STATED VIEWER, AND IT IS THE RECORD'S
         ANSWER RATHER THAN THE CLASS'S.
         An `ai` credential does NOT stamp `class:ai`. It stamps the PRINCIPAL
         the minting member wrote down, which is `member:<id>` for a
         member-scoped key and `class:ai` for an organisation-scoped one. That
         makes D-199 (4)'s distinction operational instead of decorative: a
         member-scoped credential compiles under `viewerPredicate`'s
         PARTICIPATION FILTER and sees exactly what that member sees, so an
         agent cannot read a project its principal was never invited to — while
         an organisation key acts for the group and is unfiltered like every
         other instance-level credential. The two are measurably different reads
         and both arms are driven.
         IS-5's "member-scoped default" lives at the MINT, where a principal must
         be stated (C-29.2) and the member-scoped form is the documented one; it
         is not defaulted here, because a viewer this function guessed would be a
         viewer the record cannot account for. */
      inner.searchParams.set("viewer",
        viaSession ? sessViewer
        : cls === "ai" ? aiCred.principal
        : `${MACHINE_CLASS_PREFIX}${cls}`);
      /* REC-132 / D-422: THE POSITIONAL HALF, stamped beside the viewer for the ops whose
         store method READS it. It differs from the viewer for exactly ONE principal — the
         founder's session, whose viewer is the administrator's and whose identity is
         `member:admin` — and the store reads it only where a ruling names a person: the
         lead reads (`#leadReach`: author, or a participant it was shared to) and the
         internet frontier built on them.
         NAMED OPS, NOT EVERY OP IN THIS LIST, and that is measured rather than tidy: the
         first build stamped it on every op here and `op=content` — a FIXED-KEY read that
         refuses any parameter it does not name (D-222) — refused every call, which six
         content suites caught. A param a route does not read is not free. */
      if (IDENTITY_READS.includes(op)) inner.searchParams.set("identity",
        viaSession ? sessIdentity
        : cls === "ai" ? aiCred.principal
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    }
    /* D-157: WHETHER THIS CALLER ADMINISTERS, decided by the SERVER from the
       credential that authenticated, and set AFTER the caller's parameters were
       copied above so a caller-supplied `administer` is overwritten rather than
       honoured. It drives ONE thing: whether op=memberlist's rows carry `cover`
       beside `handle`. Section 3 gives members and the public the handle roster
       and gives only administrators the PAIRING, so the rule is a projection in
       the store (Store.memberList) rather than a class ACL here — the op is
       legitimately reachable by a member, and what a member must not receive is
       a FIELD, not the answer.

       Who administers: a SESSION reports its own `administer` right, which is
       true for the root-admin session and for a member whose role is admin —
       the same field op=whoami publishes, so an interface cannot be told one
       thing and served another. A MACHINE credential administers only when it is
       the ADMIN_TOKEN class, the root of trust every membership rule sits
       beneath (4.6). MEMBER_TOKEN does not, which is half of what D-157
       measured. PROBE_TOKEN does not either, and that is deliberate rather than
       incidental: scopeFor confines probe to the scratch namespace — a different
       Durable Object with its own member table — so it never reached the live
       roster, and it now also cannot use scratch to rehearse a read of a pairing
       no non-administrator is entitled to.

       The store fails closed on an absent or unrecognised stamp (handles, no
       cover), so deleting this line loses the pairing rather than leaking it. */
    /* PL-10 / D-220. THE ADDRESS IS NORMALISED BY THE SAME FUNCTION THAT WROTE
       THE ROW, and that is not a convenience — it is the whole reason the chain
       can be trusted. `recordCapturedLocator` stores `address_norm` as
       `normalizeAddress` produced it at capture time; a chain that normalised
       differently, or not at all, would answer "no versions" for a document the
       record plainly holds, and `subresources.mjs` says exactly why that is the
       failure hardest to notice: *a normalisation MISS looks exactly like "not
       captured"*. The store cannot do this itself — the normaliser lives in
       subresources.mjs and store.mjs does not import it — so it happens here,
       at the same seam op=links has used since REC-52. The caller's raw
       `address` was copied in the loop above and is overwritten. */
    if (op === "versionchain")
      inner.searchParams.set("address", normalizeAddress(url.searchParams.get("address") || ""));
    /* PL-12 / D-84 / DEC-46: WHOSE NAME IS ON THE ADOPTION, decided by the
       SERVER from the credential that authenticated and set after the caller's
       parameters were copied, so a caller-supplied `author` is overwritten
       rather than honoured. This is the strictest reading of DEC-54 (c): the
       whole hazard the ruling names is a group appearing to follow an
       organisation's standards "with nobody in the group having authored
       anything", and an author a caller can name is an author nobody authored.
       A machine credential stamps `token:<class>` and the store refuses it BY
       NAME (C-26.9) rather than recording a machine as the adopter — the same
       fence op=publishedcase already draws for the bias acknowledgement. */
    if (op === "biasadopt")
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
    /* REC-131 / IC-148: THERE IS NO `operator` STAMP ON op=stats ANY MORE — every COUNT is the same for
       every class (`MEMBER-KNOWLEDGE-DESIGN.md` §5, BOB #15), and a caller's `operator=` is not read.
       What remains is `capacity`, which governs `dbBytes` ONLY (the admin class's: capacity is an
       operator need, and the figure moves in whole pages on every write, a lead's included). Set by
       the SERVER from the class that authenticated, AFTER the caller's parameters were copied, so a
       caller's `capacity=1` is overwritten. `admin` is the ADMIN_TOKEN class and the ROOT-admin
       session; an admin-ROLE member signs in as class `member` and does not receive it. */
    if (op === "stats") inner.searchParams.set("capacity", cls === "admin" ? "1" : "0");
    if (op === "memberlist")
      inner.searchParams.set("administer",
        (viaSession ? !!sessRights.administer : cls === "admin") ? "1" : "0");
    /* N85's other half (membership R19): an administrator sees every pairing, published or not — memberlist's stamp,
       by memberlist's expression. */
    if (op === "memberpairings")
      inner.searchParams.set("administer",
        (viaSession ? !!sessRights.administer : cls === "admin") ? "1" : "0");
    /* BOB #32 (2026-09-24), D-162's theme readings: THE SAME STAMP, on the same rule and for the same
       reason. Every theme act and read names a declarer, a placer or a proposer; a reader who does not
       administer is shown the HANDLE alone, and the member id and cover go to administrators only
       (Membership v2 §3; MK-6's precedent). The store fails closed on an absent stamp. */
    if (op === "themedeclare" || op === "themeplace" || op === "themepropose" || op === "themeread"
        || op === "themewithdraw")
      inner.searchParams.set("administer",
        (viaSession ? !!sessRights.administer : cls === "admin") ? "1" : "0");
    /* REC-21. WHOSE attention this is, stamped by the server and never taken
       from the request — the strictest instance of the impostor rule in this
       file, because the thing being written is not a claim about the record but
       a claim about a PERSON: a caller who could name the member could decide
       what somebody else is told about, and could do it leaving nothing in the
       record for that person to find. The caller's own `member` was copied in the
       loop above, so it is overwritten here rather than honoured. A machine
       credential stamps EMPTY rather than `class:<cls>` — unlike a lease actor,
       there is no named machine identity that makes sense here, because a
       preference belongs to somebody's attention and a token has none — and the
       store refuses NO_MEMBER, so a bypass fails closed instead of writing a row
       nobody owns. The viewer stamp above covers the case-visibility gate, so
       muting cannot be used to probe for a project you were never invited to. */
    if (QUEUE_ACTIONS.includes(op))
      inner.searchParams.set("member", viaSession ? sessMember : "");
    /* CPDF-10 / SK-7 — WHO ATTESTED, STAMPED BY THE SERVER, AND THIS IS A
       CORRECTION OF A FENCE THAT DID NOT HOLD.
       *
       * THE MEASUREMENT, taken through a REAL minted `ai` credential rather
       * than reasoned about: `op=attesttext` read its `member` from the request
       * BODY. C-35.10 refuses a MACHINE IDENTITY, so it fired only when the
       * caller volunteered one — and a caller who wants to attest does not
       * volunteer one. An `ai` credential whose member had named `attesttext`
       * in its declared `writes` posted `member: "ruth"` and THE ATTESTATION
       * LANDED, attributed to ruth, who had said nothing. `member: "member:ruth"`
       * landed too, at an attestor string no member has. The MEMBER_TOKEN
       * machine credential did the same. Only `class:ai` was refused, which is
       * the one spelling every suite drove.
       *
       * `content-extent.test.mjs` recorded the belief that an op-level arm was
       * impossible here — *"driving it through op=attesttext with a machine
       * token answers NOT_AUTHENTICATED before checkAttestation is ever
       * reached"*. That was measured with a token that was not a credential at
       * all. With a real one the op IS reached, and the fence was not there.
       * The assertion is corrected at its site rather than exempted.
       *
       * SO IT IS STAMPED, exactly as the queue's `member` above is, and for the
       * identical reason written there: the thing being written is not a claim
       * about the record but a claim about a PERSON. The caller's own `member`
       * was copied in the loop above and is overwritten here rather than
       * honoured. A machine credential of ANY class stamps `class:<cls>`, which
       * `isMachineIdentity` answers TRUE for, so C-35.10 refuses BY NAME at the
       * store instead of being handed a name it cannot question — the second of
       * CPDF-10's *two fences on purpose*, now actually load-bearing rather than
       * reachable only by a caller who incriminates itself.
       *
       * THE `ai` CLASS STAMPS ITS CLASS AND NEVER ITS PRINCIPAL. A member-scoped
       * credential's principal is `member:<id>`, which is NOT a machine identity
       * by this record's own predicate — stamping it would walk the hole
       * straight back in wearing a server-side stamp. The principal answers what
       * a credential may SEE (D-199 (4)); it is not who acted. */
    if (op === "attesttext")
      inner.searchParams.set("attestor", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* REC-87 / IC-128 — WHO TYPED, AND WHO ATTESTED THE TYPING, stamped by the
       server on `attesttext`'s rule one stamp up and for its measured reason: a
       body field is a name a machine can post. Typing a page's text is a
       member's own act in their own name, and so is attesting another member's
       typing. The caller's own `transcriber`/`attestor` was copied in the loop
       above and is overwritten here rather than honoured. A machine credential
       of ANY class stamps `class:<cls>`, which `isMachineIdentity` answers TRUE
       for, so the store refuses it BY NAME — C-52.1 at `transcribe`, C-35.10
       (`checkAttestation`, unchanged) at `transcriptionAttest`. NEVER the
       principal: `member:<id>` is not a machine identity by this record's own
       predicate, and stamping it would let an `ai` credential type in a
       member's name. */
    if (op === "transcribe")
      inner.searchParams.set("transcriber", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* The ATTESTOR of a typing, stamped on `attesttext`'s rule exactly and in its
       shape. Its machine fence is C-35.10 inside `checkAttestation` — the SAME
       function `attesttext` reaches, imported from textchain.mjs, which
       `scripts/identity-claims.mjs` states it cannot follow (it reads the store
       method and one private helper). Driven, not assumed: transcribe.test.mjs
       section 3 refuses the MEMBER_TOKEN machine credential here as
       TEXT_ATTEST_MACHINE, including when its body names a person. */
    if (op === "transcriptionattest")
      inner.searchParams.set("attestor", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* MK-1 / D-184 / IC-133 — WHO OBSERVED IT, stamped by the server on the rule
       of every authorship field in this block, and OVERWRITING any `author` the
       caller put in the query string (the loop above copied it). The design's
       words: the author is server-stamped from the session, as every authorship
       in this plane is. A machine credential of any class stamps `class:<cls>`,
       which the store refuses BY NAME (C-53.1). NEVER the principal of an `ai`
       credential: `member:<id>` is not a machine identity by this record's own
       predicate, and stamping it would let an assistant testify in a member's
       name. */
    if (op === "testify")
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* MK-4 / IC-136 — WHO WROTE THE LEAD, AND WHO FOLLOWED IT, stamped on
       `transcribe`'s rule one stamp up and for its measured reason (§7: an author
       field supplied by the caller rather than stamped is refused). A machine
       credential of any class stamps `class:<cls>`, and the store refuses it BY
       NAME (C-54.2 at the act, C-54.8 at the look). Never the principal. */
    if (op === "lead")
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    if (op === "leadlook")
      inner.searchParams.set("looker", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    if (op === "leadshare")
      inner.searchParams.set("sharer", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* MK-7 — WHO CHOSE THE ATTRIBUTION, stamped on `testify`'s rule: the store compares it with the
       observation's registered author, so a caller-supplied chooser would be a way to choose for somebody
       else. A machine credential stamps `class:<cls>`, refused BY NAME (C-92.1). Never the principal. */
    if (op === "attribute")
      inner.searchParams.set("by", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* D-162 / IC-241 — WHO DECLARED THE THEME, WHO PLACED IN IT, WHO PROPOSED, stamped on
       `lead`'s rule one stamp up (§8.4 fence 1: declared under the member's own name, never a
       caller's field). A machine credential stamps `class:<cls>`, which the store refuses BY NAME
       for a declaration (C-81.2) and a placement (C-81.7) and RECORDS for a proposal — the hunch
       is attributed to the credential that proposed it. */
    if (op === "themedeclare")
      inner.searchParams.set("declarer", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    if (op === "themeplace")
      inner.searchParams.set("placer", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* T5-11 (connections R43): WHO WITHDREW OR REJECTED, stamped on `themeplace`'s rule; the store compares it with
       the placer (or the administer stamp) and refuses a machine stamp BY NAME (C-81.11). */
    if (op === "themewithdraw")
      inner.searchParams.set("actor", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* D-162: WHO PROPOSED A PLACEMENT. Any credential may propose (the result is a hunch, graded C,
       never membership), so the only obligation here is NAMING: a session stamps its signed-in id, a
       machine stamps `class:<cls>`, and the `ai` class stamps its tokenId beside its class —
       `extractpropose`'s form — so a hunch stays attributable to the exact key that proposed it.
       Never the principal a key was minted for, which would put an assistant's hunch under a
       person's id. */
    if (op === "themepropose")
      inner.searchParams.set("proposer",
        viaSession ? sessMember
        : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* REC-195 / D-149: WHO PROPOSED AN ACTION'S GOVERNING LAWS, stamped on the line above for its reason
       exactly. Any credential may propose — the plane LABELS a proposal rather than fencing it — so the only
       obligation here is NAMING: a session stamps its signed-in id, a machine stamps `class:<cls>`, and the
       `ai` class stamps its tokenId beside its class, so a proposal stays attributable to the exact key that
       proposed it. Never the principal a key was minted for, which would put a machine's citations under
       somebody else's id. A caller-supplied `proposer` is overwritten rather than honoured: the label is the
       whole product and a label a caller can write is not one.
       THE PROSE HERE DELIBERATELY CLAIMS NO PERSON-ONLY CONSTRAINT, and that is not style:
       `identity-claims.mjs` reads a stamp site's own comment for a claim that only a signed-in person may
       write the field, and grades it a DEFECT where nothing refuses a machine identity. Nothing refuses one
       here BY DESIGN — D-149 says the machine MAY propose — so a comment claiming otherwise would be the
       instrument reading this site correctly. The fence is one op up, at the act that SETS the list. */
    if (op === "actionlawspropose")
      inner.searchParams.set("proposer",
        viaSession ? sessMember
        : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* T8 (actions R28, ACTIONS #1 J2.5): WHO PROPOSED A RISK TIER, by the line above's expression and for its reason —
       the label is the whole product, and a caller-supplied `proposer` is overwritten. */
    if (op === "actionriskpropose")
      inner.searchParams.set("proposer",
        viaSession ? sessMember
        : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* T8 (layer 9): WHO DETERMINED, COMPARED, RECORDED A CONSEQUENCE OR ITS ADDRESSING, PREPARED, APPROVED OR SENT A
       FILING, NAMED COUNSEL, EXPORTED A PACKET, PROPOSED A THEORY, OR MOVED AN ESCALATION — conformance, consequences,
       filings and escalation read `author` from the QUERY after the body, so it is set here, after the caller's
       parameters were copied, and a caller's is overwritten. It is the POSITIONAL identity (`member:<id>`, the
       founder's `member:admin`), intent's expression, because each module asks membership's `projectAuthority` of it and
       a bare id would read as nobody there; a machine credential stamps `class:<cls>` and an `ai` credential
       `class:ai/<tokenId>`, each a machine identity every act refuses BY NAME and every proposal labels as machine work —
       NEVER a key's principal, which would put an assistant's act under a person's name. */
    if (QUERY_AUTHOR_ACTIONS.includes(op))
      inner.searchParams.set("author",
        viaSession ? sessIdentity
        : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* N345 (contradiction R30–R36, R51, R53): WHO DISMISSED, CLARIFIED, TOOK UP, RESOLVED, OPTED IN OR RESPONDED —
       contradiction reads `author` from the query after the body, so it is set here and a caller's is overwritten. The
       action layer's expression one statement up, for its reason: contradiction hands the author to promotion as
       `actorIdentity` on a take-up and asks membership's facts of it, so it is the POSITIONAL identity; a machine
       credential stamps `class:<cls>` and an `ai` credential `class:ai/<tokenId>`, each a machine identity every act
       refuses BY NAME (C-93.10) — never a key's principal, which would put an assistant's act under a person's name. */
    if (CONTRADICTION_ACTIONS.includes(op))
      inner.searchParams.set("author",
        viaSession ? sessIdentity
        : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* SK-7 / framework Part II §14.4 (Bob's 5.7) — WHO MARKED THIS PASSAGE AS
       CITABLE, stamped by the server on the same rule as every authorship field
       in this block. The body's own `mintedBy` is not read at the store at all
       (the DO route takes it from the query string), so there is no second door.
       A MACHINE CREDENTIAL STAMPS `class:<cls>` AND THAT IS THE LABEL'S WHOLE
       SOURCE OF TRUTH: `contentMintState` reads the stamp through
       `isMachineIdentity`, so the sentence a member is shown about a
       machine-minted row is derived from the credential that authenticated and
       from nothing a caller could write. The `ai` class stamps its CLASS and its
       tokenId — `class:ai/<tokenId>` — for `op=airunopen`'s reason (an act
       stays attributable to the named credential a member chose) while keeping
       the `class:` prefix that makes it a machine identity. NEVER the principal:
       `member:<id>` is not a machine identity, and stamping it would label the
       assistant's own row as a member's.

       IDENTITY-CLAIM: RULED DEC-24 — a machine credential MAY perform this act
       and the ruling is framework Part II §14.4's EXTRACT role under DEC-24
       (*the machine may do the looking, the member does the concluding*), folded
       there as Bob's 5.7. So the member-actor words above describe WHO IS SHOWN
       the label, never who may write the field, and there is deliberately no
       fence on this op: what the machine may not do is ATTEST, which is
       C-35.10's and sits at `op=attesttext` one stamp above. The naming half the
       ruling rests on is the `class:<cls>` stamp this line writes — permission
       is granted against a NAMED actor, and a row whose minter were anonymous
       would be a row the label could say nothing about. */
    if (op === "contentmint")
      inner.searchParams.set("mintedBy",
        viaSession ? sessMember
        : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* SK-8 — WHO PROPOSED THIS READING, stamped on the identical rule and in the
       identical shape, because it is the identical question about the identical
       kind of act: a claim about a PERSON (or about a machine) rather than about
       the record. The two lines are kept apart rather than folded into one
       condition so each op's own reasoning stays readable at its own site; what
       must never drift is the VALUE, and it cannot, because both read the same
       three cases off the same `viaSession` / `cls` / `aiCred` state. A machine
       class stamps `class:<cls>`; the `ai` class stamps its tokenId beside it so
       the act stays attributable to the named credential a member chose; and
       NEITHER ever stamps the PRINCIPAL — `member:<id>` is not a machine
       identity by this record's own predicate, and stamping it would label the
       assistant's own proposal as a member's.

       IDENTITY-CLAIM: RULED DEC-24 — a machine credential MAY perform this act,
       and the ruling is the EXTRACT role under DEC-24 (*the machine may do the
       looking, the member does the concluding*), placed at
       `BIO_Assistant_and_AI_Roles_v0_1.md` §7.3 and folded into framework Part II
       §14.4 as Bob's 5.7. So the member-actor words in this block describe WHO IS
       SHOWN the label, never who may write the field, and there is deliberately
       no fence on this op. What the machine may not do is ATTEST — C-35.10's, at
       `op=attesttext` a few stamps above — and PRODUCE WITHOUT A BOUND, refused
       at the store by name when the run declares no `mints` allowance (§7.3 (5)).
       The naming half the ruling rests on is the `class:<cls>` stamp this line
       writes: permission is granted against a NAMED actor, and a proposal whose
       proposer were anonymous would be one the record could say nothing about,
       which is exactly what `NO_PROPOSER` refuses at the store. */
    /* REC-147: the contradiction candidate's proposer is the same server-side stamp, for the same reason; N345's
       recommendation (contradiction R37) is the run's other production and takes it too. */
    if (op === "extractpropose" || op === "contradictionpropose" || op === "contradictionrecommend")
      inner.searchParams.set("proposedBy",
        viaSession ? sessMember
        : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* Ownership of a selection is the same server-side stamp. A selection is
       readable only by the credential that made it, and "only by the credential"
       is worth nothing if the caller names the credential. */
    if (op === "select" || op === "selection" || op === "selectionlist" ||
        op === "selectionrelease" || EDGE_ACTIONS.includes(op) || STATE_ACTIONS.includes(op))
      inner.searchParams.set("owner", viaSession ? sessIdentity : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* Who cited is part of the record, and citing writes a Session Log entry
       carrying the name. Stamped like every other authorship in this file: a
       browser cannot write history as someone else, and a machine credential
       says plainly that it was a machine rather than borrowing a person's name.
       A caller-supplied `author` is overwritten, not honoured. */
    /* REC-24 adds the two action acts to the author stamp, and the correspondence
       arm is the strictest instance of the impostor rule in this file: on the
       testimony half, the author IS the evidence — "who says this exchange
       happened" is the whole of what the record holds when there are no bytes —
       so a caller naming it would be a caller signing somebody else's name to a
       claim about a real party outside this system. */
    /* REC-45 joins them, and the reasoning is on STRUCTURE_ACTIONS above: the
       name this stamps is the name that goes against "these reasons were enough
       on their own", which is the one authored judgement in the record that
       makes a finding stronger. */
    /* REC-54 joins them. Reconstructing a provenance chain is a named member's
       judgement that the capture record supports the route being written — the
       act D-200 exists to keep honest — so the name against it is stamped by the
       server like every other authorship here, and a caller-supplied `author` is
       overwritten rather than honoured. It is NOT added to STATE_ACTIONS: it
       moves no state and applies to no selection, so it would inherit an `owner`
       stamp and a set-application shape it does not have.
       IDENTITY-CLAIM: OPEN — DEC-52 rules on three verbs and reconstructing a provenance
       chain is not one of them. Routed to CONDUCT, pinned by name, not decided.
       OPEN AND NAMED, REC-65: the sentence above says "a named member's judgement"
       and **NOTHING IN THE PLANE REFUSES A MACHINE FROM MAKING IT** —
       `provenanceChainRebuild` carries no identity fence of any kind. DEC-52 ruled on
       three verbs and this is not one of them, so REC-65 neither fenced it nor extended
       the ruling to cover it; a worker doing either would be deciding doctrine nobody
       asked for. It is ROUTED to CONDUCT and PINNED as a known-open finding in
       `test/identity-claims.test.mjs`, which fails if a fence appears OR if this
       sentence stops making the claim — so the gap cannot close silently in either
       direction. What is NOT open: the stamp itself. A machine arrives named
       `token:<class>`, so whatever is ruled later can be enforced on an honest
       identity rather than a guessed one. */
    /* PL-2 / IS-2 joins them, and this is FENCE LAYER 1 (see VERSION_ACTIONS
       above). The name this stamps is the name that goes against "this is the
       reading this record stands on" and against the reason a member gave for
       turning one down — the two facts D-214 says the whole rejection record
       exists to hold. A caller-supplied `author` is OVERWRITTEN rather than
       honoured, which is what makes the store's MACHINE_CANNOT_MOVE_VERSION
       refusal possible at all: a machine arrives honestly named `token:<class>`
       instead of borrowing a person's. It is NOT added to STATE_ACTIONS: these
       move no bundle state and apply to no selection, so they would inherit an
       `owner` stamp and a set-application shape they do not have. */
    if (EDGE_ACTIONS.includes(op) || STATE_ACTIONS.includes(op) || ACTION_ACTIONS.includes(op)
        || DECLARATION_ACTIONS.includes(op) || STRUCTURE_ACTIONS.includes(op)
        /* REC-122: the name that goes against "this mention is the one on point for this
           connection". Overwritten rather than honoured, so the store refuses a machine BY
           SHAPE (C-74.1). Placed ABOVE `VERSION_ACTIONS` and not beside `narrow` below: the
           versionstate suite pins FENCE LAYER 1 by the span from `VERSION_ACTIONS` to this
           stamp, and a new op is not a reason to lengthen that span. */
        || op === "connectionchoose"
        || VERSION_ACTIONS.includes(op)
        /* PL-3 / IS-4: and the suggest endpoint, for the reason one paragraph
           up. `author` here is the name that goes against a STRUCTURAL claim —
           "this part of the argument would carry the answer on its own" — which
           C-25.15 says only a named member may make. A caller-supplied `author`
           is OVERWRITTEN rather than honoured, which is what lets the store
           refuse a machine BY SHAPE through REC-46's one predicate instead of
           trusting what the caller wrote. */
        || op === "suggest"
        || op === "provenancechain"
        /* REC-63: `author` here is the name that goes against a STANDING
           STATEMENT that a document's route cannot be shown, which C-34.1 says
           only a named member may make. Overwritten rather than honoured, for
           the reason one paragraph up: a principal a caller can name is not one. */
        || op === "provenanceroute"
        /* REC-86: the name that goes against "this passage is the one on point"
           and against the new reading's partition. Overwritten rather than
           honoured, so the store refuses a machine BY SHAPE (C-50.5). */
        || op === "narrow")
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
    /* T5-11 (K145, connections R53, R57): the member who asserts a connection, and the member who confirms or rejects
       a stored containment, stamped on `connectionchoose`'s rule by its expression and in a statement of its own so
       the span pinned above is not lengthened. A caller's `author` is overwritten; a machine arrives honestly named
       and the store refuses it BY SHAPE (CONNECTION_ASSERT_NOT_A_MEMBER, FILE_MEMBERSHIP_NOT_A_MEMBER). */
    if (op === "connectionassert" || op === "filemembershipjudge")
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
    /* N345 (case-authoring R32): the ceremony's read asks the owner test op=publish asks, of the same `author`, so it
       takes publish's stamp by publish's expression (`STATE_ACTIONS`' author above), in a statement of its own so the
       span pinned above is not lengthened; a caller's `author` is overwritten. */
    if (op === "publishtensions")
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
    /* T6-13 (reevaluation R15, R16): the member who adopts a newer version, keeps the earlier one, or records a
       re-evaluation, stamped by the version acts' expression (`VERSION_ACTIONS`' author above), which reevaluation reads
       from the query after the body; a caller's `author` is overwritten, and a machine arrives honestly named, refused
       BY NAME at the store (MACHINE_CANNOT_ADOPT_VERSION, MACHINE_CANNOT_KEEP_VERSION, MACHINE_CANNOT_RECORD_REEVALUATION). */
    if (REEVALUATION_ACTIONS.includes(op))
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
    /* REC-134 / C-56 — SIGHT IS NOT AUTHORITY (Membership v2 §7, BOB #15): the acts that change
       a project and took the VISIBILITY gate as their only barrier (or none) now ask the actor's
       OWN POSITION in that project, and the store reads that position from THIS stamp — the
       POSITIONAL identity, never the viewer. A session stamps `resolveSession`'s identity
       (`member:<id>`, the founder's `member:admin`); a member-scoped `ai` credential stamps its
       PRINCIPAL, so an agent is refused exactly where its member would be (D-199 (4)'s rule for
       sight, applied to acts); every instance credential stamps `class:<cls>`, which holds no
       roster position and is not asked — machine fences are their own and unchanged. The caller's
       `identity` was DELETED for every op above, so nothing here can be named by a caller.
       A new act on a project joins POSITIONAL_ACTS; the suite's arms read it through the ops. */
    if (POSITIONAL_ACTS.includes(op))
      inner.searchParams.set("identity",
        viaSession ? sessIdentity
        : cls === "ai" ? aiCred.principal
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* D-587 (T5-11, calibration R5, K136): WHO MEASURED is the control plane's stamp and never the body's — a session
       its member, a machine credential `class:<cls>`, an `ai` credential its principal — by the identity stamp's own
       expression. The store records it as `measured_by` and refuses an empty one CAL_UNATTRIBUTED (C-42.8). */
    if (op === "calibrate")
      inner.searchParams.set("identity",
        viaSession ? sessIdentity
        : cls === "ai" ? aiCred.principal
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* DEC-49 REGION is-operator-governance-act — D-136, applying D-421's ruling
       (BOB #14, C-32.14 / C-32.15) to the acts §4.7 and §4.9 assign to a named
       administrator. *The signature proves who AUTHORISED; the credential that
       delivers it decides WHEN the record changes, and the record names the
       actor.* A §4.7 vote is the same shape with the signature replaced by a
       roster position: a bearer token held in the hosting account is not the
       administrator it would name.
       WHY A FENCE AND NOT ONLY THE STAMP BELOW. The stamp alone already refuses
       a bearer caller — its `by` becomes `class:<cls>`, which matches no roster
       row, and the store answers NOT_AN_ADMIN. That refusal is CORRECT and its
       SENTENCE IS FALSE: it tells the operator that some member is not an
       administrator when the fact is that a token is not a person, and
       `NOT_AN_ADMIN` carries no canned translation to say otherwise. DEC-49's
       rule is that a refusable condition says what is true, so the honest answer
       gets its own code and its own sentence here, in front.
       THE TWO LAYERS ARE BOTH LOAD-BEARING AND THE CONTROL BREAKS EACH WITH THE
       OTHER HELD OPEN (`adminvote.control.mjs` arms `fence-dropped` and
       `stamp-dropped`): with the fence gone the stamp still refuses, with the
       stamp gone the fence still refuses, and only removing BOTH lets a caller
       name the voter. A single layer would be a fence nobody could prove was
       doing anything.
       THE PREDICATE IS HOW THE CALLER ARRIVED, NOT WHICH TOKEN IT HELD —
       C-32.14's own shape. `viaSession` is set only by the session lookup in the
       admission block, so this covers ADMIN, MEMBER and PROBE today and any
       binding added tomorrow, and no token string or class list appears here to
       go stale. The refusal NAMES the class, so an operator learns which of its
       credentials was refused.
       THE PRECONDITION WAS MEASURED BEFORE THIS LINE WAS WRITTEN: no surface,
       script, tool, installer or DIST procedure submits any of the three with a
       bearer token — `civicos-ui` sends no act op from the members screen at all
       (D-134's surface is deliberately not built yet), and the only bearer
       drives in the tree were two suites asserting the pre-item behaviour, both
       corrected here with their reasons at the site. Capabilities are still set
       at INVITATION time through `op=memberadd`, which is untouched, so nothing
       in the bootstrap path depends on a bearer capability edit. */
    if (GOVERNANCE_ACTIONS.includes(op) && !viaSession)
      return json({ ok: false, reason: "OPERATOR_TOKEN_CANNOT_GOVERN",
        ...machineFenceRow("OPERATOR_TOKEN_CANNOT_GOVERN"), op, tokenClass: cls,
        detail: `section 4 governance is a named administrator's own act, delivered through that `
              + `administrator's own signed-in session. The credential that asked is the operator's `
              + `\`${cls}\`-class bearer token, which holds no position on the roster: it cannot be `
              + `one of the administrators whose consensus §4.7 requires, and a vote it delivered `
              + `would be attributed to whoever the caller named. Sign in as the administrator and `
              + `do it there (D-136, applying D-421).` }, 403);
    /* END DEC-49 REGION is-operator-governance-act */
    /* REC-164 — THE SAME FENCE FOR THE GROUP'S PUBLIC IDENTITY (Publication §7 points 2 and 3), with its OWN code
       and sentence, because C-32.17's names the §4 votes. The predicate is how the caller ARRIVED, never which token
       it held, so every bearer class is refused and one added tomorrow is too. */
    /* DEC-49 REGION is-group-identity-session */
    if (IDENTITY_ACTIONS.includes(op) && !viaSession)
      return json({ ok: false, reason: "GROUP_IDENTITY_NEEDS_SESSION",
        ...identityFenceRow("GROUP_IDENTITY_NEEDS_SESSION"), op, tokenClass: cls,
        detail: `the group's display name and its domain claim are set by a named administrator's own signed-in `
              + `session, and the record names who set each one (Publication §7). The credential that asked is the `
              + `operator's \`${cls}\`-class bearer token, which holds no place on the roster. Nothing was changed.` }, 403);
    /* END DEC-49 REGION is-group-identity-session */
    /* R16, R28: a promotion's replay is judged here, after the R14 fences and before any handler, from a copy of the
       body (the request's own body stays whole for whoever serves the op). The verdict is the promote block's below. */
    const replay = op === "promote" && req.method === "POST"
      ? await replayVerdict(env, storeName, await req.clone().text(), viaSession, cls) : null;
    /* DEC-49 REGION is-promote-replay-verified */
    if (replay?.asserted && !replay.proven)
      return json({ ok: false, reason: "REPLAY_UNVERIFIED", ...replayRow("REPLAY_UNVERIFIED"), op,
        bundleId: replay.bundleId, provenanceCapture: replay.provenanceCapture,
        detail: `this promotion says it is a replay of the record's own past, and a replay is honoured only when the `
              + `plane can check it: it must name a drive-provenance capture (\`provenanceCapture\`) that this `
              + `promotion registers at ${DRIVE_PROVENANCE_PATH}, whose bytes the record holds, and whose preserved `
              + `promotion records name this bundle and list this revision's bundle.md SHA-256. One of those did not `
              + `hold. Nothing was written.` }, 403);
    /* END DEC-49 REGION is-promote-replay-verified */
    /* R28: an op whose handler still lives in legacy-index answers here, after the R14 fences and R16; undefined falls
       through to the forward. */
    const armed = hooks.gatedOp ? await hooks.gatedOp({ req, url, env, op, cls, viaSession, sessMember, sessViewer,
      sessIdentity, sessRights, sessCaps, aiCred, storeName, stub }) : undefined;
    if (armed) return armed;
    /* Who is acting on a project's roster is decided by the SERVER. Set after
       the caller's parameters were copied, so a caller-supplied `by` is
       overwritten rather than honoured: "only an owner may remove" is worth
       nothing if the caller names who they are. A machine credential says
       plainly that it was a machine, which matches no participation row and no
       administrator, so it is refused by the store rather than let through. */
    /* D-136 adds `GOVERNANCE_ACTIONS`, and it is THE SAME SENTENCE one section
       out: the comment above says *"only an owner may remove" is worth nothing
       if the caller names who they are*, and §4.7 read against it says **"every
       subsequent addition requires the consensus of all existing
       administrators" is worth nothing if the caller names who consented.**
       The store already ASKED for `by` on `adminEndorse` and `adminRemove` and
       checked it against the live administrator roster — the check was whole and
       the INPUT was the caller's, which is the shape a fence acquires when
       nobody supplies its subject. `memberCaps` gains the same argument and the
       same check in this landing, so the stamp is READ on all three rather than
       being recorded and trusted. */
    /* REC-156 adds `memberadd` — D-136's sentence in the one op that ruling did
       not name. `Store#memberAdd` WRITES the proposer's `admin_votes` ('add') row
       when an addition needs §4.7's consensus, and the voter it wrote was whoever
       the caller put in `by`, so a proposal could carry one endorsement in another
       administrator's name. Now the SERVER names the proposer, and the store's
       relay reads it from the query, never the body: a proposal records its
       proposer's own endorsement and nobody else's.
       ITS OWN DISJUNCT, NOT `GOVERNANCE_ACTIONS`: that array also spreads
       MEMBER-set reach and the operator fence, and REC-156 moves neither.
       A SESSION stamps its member — the FOUNDER'S (`admin`), because
       `SESSION_OPS.admin` is the only set holding this op, and the store counts
       the founder an administrator only where a claim was spent. A BEARER stamps
       `class:<cls>`, which is on no roster: it opens a proposal and endorses nothing.
       **PROVISIONAL, AND BOB'S TO RULE: a bearer reaching `memberadd` is NOT
       refused** the way C-32.17 refuses one at the three ops above. MEASURED
       before choosing (MEASUREMENTS M-84): 99 battery suites, five probes and
       FLEET's live VF-4 run create their members through a bearer `memberadd`;
       `setup.mjs`, the one non-test caller, posts with the founder's SESSION.
       With this stamp a bearer's `by` names nobody, and what the op still does for
       one — an invitation, §4.2's second administrator, a proposal awaiting every
       administrator — attributes no act to any administrator and is the
       ADMIN_TOKEN holder's by §4.6. C-32.17's sentence (*"a vote it delivered
       would be attributed to whoever the caller named"*) would be FALSE here,
       which is D-270's class. REVERSING IT costs one disjunct on the fence above
       and a founder-session fixture for every caller named in M-84. */
    /* REC-159 widens REC-156's disjunct from `op === "memberadd"` to the four §4.9 custodial acts,
       one expression still: a session stamps its member — now an ENROLLED administrator's too — and
       a bearer `class:<cls>`, which the store records as the operator's credential and never as a
       person. `memberset`, `signeradd` and `signerset` write the stamp into the row they change
       (`status_by`); the store refuses a member-named `by` that is not an active administrator. */
    if (PROJECT_ACTIONS.includes(op) || GOVERNANCE_ACTIONS.includes(op)
        || op === "projectparticipants" || op === "projectownerarith"
        || CUSTODIAL_ACTIONS.includes(op))
      inner.searchParams.set("by", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* REC-150: whose requests to join a caller reads — its own, or a project's as its owner or an administrator — is
       a POSITIONAL question, so `op=projectrequests` takes the server's `by` exactly as projectparticipants does, by
       the SAME expression. A statement of its own rather than a disjunct above, `IDENTITY_ACTIONS`' precedent below:
       that condition is pinned as one expression by adminvote.test and anchored by adminvote.control, and it sits at
       its pin's bound. */
    if (op === "projectrequests")
      inner.searchParams.set("by", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* N43: membership's R10, R11 and R19 acts take the server's `by` by the same expression, in a statement of their
       own for the reason just given; the store's relays read it from the query after the body, so a caller's `by`
       names nobody. */
    /* K407: who set the instance's profiles, the session's member; instance-setup refuses a `by` that is no administrator. */
    if (op === "profilesset")
      inner.searchParams.set("by", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    if (ROSTER_SELF_ACTIONS.includes(op))
      inner.searchParams.set("by", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* REC-164: the setter of the group's display name or domain is the SERVER's stamp — set after the caller's
       parameters were copied, so a caller's `by` is overwritten rather than honoured, and the store asks the roster
       for an active administrator (C-64.5). `origin` is stamped the same way: the address the administrator's
       session reached is the instance address the domain's well-known file must name, never one the caller types. */
    if (IDENTITY_ACTIONS.includes(op)) {
      inner.searchParams.set("by", viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`);
      inner.searchParams.set("origin", url.origin);
    }
    /* IS-6 / §14a, DEC-27(b), DEC-55.4: THE PLANE-CREDENTIAL PRINCIPAL on a run,
       decided by the SERVER from the credential that authenticated and set after
       the caller's parameters were copied, so a caller-supplied `principal` is
       overwritten rather than honoured. A principal a caller can name is not a
       principal.

       This is only HALF of what the run must name. The other half — WHICH LEVEL
       of the Claude-account cascade pays (member, then project, then instance)
       — is NOT stamped here and cannot be: it is resolved where the token
       actually resolves, in the fleet member, and the plane learns it by being
       told. So the store REFUSES to open a run that does not carry it, which is
       the fail-closed direction: a run with no payer named is a run nobody can
       be billed for and nobody can audit. Never a token value, on either half. */
    /* PL-11 / D-199 (4): AN `ai` CREDENTIAL NAMES BOTH — THE PRINCIPAL BEHIND
       IT AND THE TOKEN IDENTITY — IN ONE STRING, and the composite is why a
       requested capture stays attributable. PL-4 copies `principal_plane` off
       the run into every `capture_requests` row and the drain composes the
       capture's attribution from it, so an identity dropped here would be an
       identity missing from the provenance of a document. NEVER THE TOKEN'S
       VALUE — the identity is a public name a member chose, which is exactly
       what D-199 (4) distinguishes it from.
       IT IS DELIBERATELY NOT THE VIEWER STRING. The viewer is the bare
       principal, because `viewerPredicate` decides what a caller may SEE and
       that is a question about the person or the group, not about which of
       their credentials asked. Two fields, two questions, and collapsing them
       would silently widen or narrow one of the two. */
    /* REC-152 (Membership v2 §7, "WHO MAY TICK AND CLOSE A RUN", BOB #16): THE SAME STAMP ON THE TICK AND
       THE CLOSE, because they are the run's PRINCIPAL's acts and the store compares the caller with the
       principal the OPEN stamped — so both sides of that comparison must be composed by ONE expression, or
       a member and her own credential could stop being recognised as one principal by a spelling drift.
       SET, never appended: a `principal` the caller put in its own query is overwritten here, and the
       store reads it as `caller` only from this stamp (a principal a caller can name is not one).
       REC-165 (§11 item 5 rule 1, BOB #25): THE SAME EXPRESSION FOR THE RUN'S TWO PRODUCTIONS, so a suggestion
       and a proposed reading are compared with the run's principal in the one form the open stamped. */
    if (RUN_VERB_ACTIONS.includes(op) || RUN_PRODUCTION_ACTIONS.includes(op))
      inner.searchParams.set("principal",
        viaSession ? sessIdentity
        : cls === "ai" ? `${aiCred.principal}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* T6-13 (capture-requests R42, K181 (6)): the retry's caller, by the same expression, in a statement of its own —
       a retry is not a production of a run, so it does not join RUN_PRODUCTION_ACTIONS. */
    if (op === "capturerequestretry")
      inner.searchParams.set("principal",
        viaSession ? sessIdentity
        : cls === "ai" ? `${aiCred.principal}/${aiCred.tokenId}`
        : `${MACHINE_CLASS_PREFIX}${cls}`);
    /* PL-18 / DEC-63 — WHICH MEMBER IS ASKING, for the project-participation
       gate on the three run verbs. Bob ruled 2026-08-09 that an investigation
       can be started by ANY MEMBER OF THE PROJECT: the gate is participation in
       the project the inquiry belongs to, with `contribute` (in NEEDS above)
       kept as the FLOOR beneath it.
       DELETED FIRST AND SET SECOND, the `ownerMemberId` discipline: a
       caller-supplied `actor` would be a caller deciding whose membership is
       checked, which is the whole gate handed to the person it gates.
       A MACHINE CREDENTIAL STAMPS EMPTY rather than `class:<cls>` — the
       QUEUE_ACTIONS precedent one stamp above — because participation is a
       relationship between a PERSON and a project and a token class is not a
       person. The store reads empty as *no participation to check* and does not
       apply the gate, which keeps its population identical to the capability
       floor's: `NEEDS` is enforced only `if (viaSession)` too. A fence wider
       than the floor beneath it would refuse the daemon outright, and DEC-63
       names the lever for the machine half explicitly and it is a different
       one — *"any narrowing happens at the credential layer"*, IS-5's `ai`
       credential scope.

       ***** THE `delete` IS SCOPED TO THE THREE VERBS, AND IT IS SCOPED
       BECAUSE AN UNSCOPED ONE BROKE `op=lease` — MEASURED, NOT REASONED. *****
       `actor` IS NOT THIS ITEM'S PARAMETER NAME: `op=lease` has stamped its own
       `actor` since REC-21's neighbourhood, forty lines above this. PL-18's
       first draft deleted the key UNCONDITIONALLY, on the `ownerMemberId`
       precedent — and `ownerMemberId` is a name only `promote` uses, which is
       what makes that precedent safe and this copy of it wrong. The battery
       caught it: `members.test.mjs`, *"session lease is stamped with the
       member, not the claimed actor"*, one assertion, a lease arriving at the
       store with its actor wiped. **A server-side stamp that clears a key it
       does not own reaches every op that shares the name**, and the blast
       radius of this class is the whole parameter namespace, not the op being
       edited. Both halves now sit inside the guard, so nothing outside these
       three verbs is touched. */
    if (RUN_VERB_ACTIONS.includes(op)) {
      inner.searchParams.delete("actor");
      inner.searchParams.set("actor", viaSession ? sessMember : "");
    }
    let passBody = req.method === "POST" ? await req.text() : undefined;
    /* R17, R29: and every body stamp, for every op; the ops that declare one set it below. */
    if (passBody) {
      try {
        const b0 = JSON.parse(passBody);
        if (b0 && typeof b0 === "object" && !Array.isArray(b0) && BODY_STAMPS.some((k) => k in b0)) {
          for (const k of BODY_STAMPS) delete b0[k];
          passBody = JSON.stringify(b0);
        }
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* create_projects (section 5) and the 7.1 owner claim, in one place.
     *
     * There is no op that creates a project: a project is created by promoting a
     * bundle with no base whose object_type is `project`. So the capability
     * gates that SHAPE, here, rather than appearing in NEEDS as an op name that
     * does not exist.
     *
     * `ownerMemberId` is deleted UNCONDITIONALLY before anything else and is
     * then set only for an identified session creating a project. It is the
     * field the store uses to decide who owns a new project, so a caller
     * supplying it would be a caller granting ownership to whomever they liked.
     * Deleting first and stamping second is the same discipline `author`,
     * `viewer`, `owner` and `by` follow in this file. */
    if (op === "promote" && passBody) {
      try {
        const b = JSON.parse(passBody);
        /* D-526: what this promotion is, derived once (`promotedTypeOf`). */
        const promotedType = promotedTypeOf(b);
        delete b.ownerMemberId;
        /* Who is ACTING, for the 7.11 owner check on deactivation and
           reactivation. Deleted first and stamped only for a session, like every
           other identity field here: a machine credential carries none and so
           cannot deactivate a project, which is deliberate. */
        delete b.actorMemberId;
        /* Authorship on the manifest is the server's stamp, never the caller's,
           for a machine credential as much as a session — the same rule `author`
           already follows for cite/sever and `by` for the roster. A session
           stamps the member; a machine credential stamps `token:<class>`, so an
           unattended writer that completes a capture a member walked away from
           (D-61) is NAMED on the manifest rather than anonymous, and cannot
           borrow a person's name. Deleted first so a caller-supplied `author` is
           overwritten, not honoured. `actorMemberId` stays session-only: a
           machine credential holds no member and so cannot deactivate a
           project. */
        delete b.author;
        if (viaSession) { b.author = sessMember; b.actorMemberId = sessMember; }
        else b.author = `${MACHINE_AUTHOR_PREFIX}${cls}`;
        /* REC-134 / C-56: the POSITIONAL identity a revision of a PROJECT's document is checked
           against (the actor must have joined it, §7.5) — `POSITIONAL_ACTS`' stamp, in the body
           because promote's payload is a body. Deleted first and set second, every credential:
           a session its identity, an `ai` key its principal, an instance credential its class
           (no roster position, not asked). */
        delete b.actorIdentity;
        b.actorIdentity = viaSession ? sessIdentity
          : cls === "ai" ? aiCred.principal
          : `${MACHINE_CLASS_PREFIX}${cls}`;
        /* REC-138 / D-426: and the VISIBILITY half beside it, so a revision of a project the actor
           cannot see answers exactly as a revision of one that does not exist (ABSENT), asked
           BEFORE the positional check. The same three arms as the viewer stamp on every gated op:
           the founder's is the administrator viewer, an `ai` key its principal. Deleted first. */
        delete b.actorViewer;
        b.actorViewer = viaSession ? sessViewer
          : cls === "ai" ? aiCred.principal
          : `${MACHINE_CLASS_PREFIX}${cls}`;
        /* D-85 (INVESTIGATIVE-SESSION.md §11 item 5, rule 2, BOB #25): AN ASSISTANT OPENS A QUESTION ONLY INSIDE A
           RUN IT HOLDS. The store asks that of a creation carrying THIS stamp, and only an `ai` credential carries
           it: a member's creation is untouched. It is the run's principal stamp in the ONE form `RUN_PRODUCTION_ACTIONS`
           uses (`<principal>/<tokenId>`), so `runPrincipalGate` recognises a member and the credential she minted as
           one principal by the same expression the run verbs are compared with. Deleted FIRST for every caller, so a
           session that sends one is not taken for an assistant and an assistant cannot name someone else.
           REC-171 (§11 item 5, "Rule 2's reach", BOB #30): THE RULE BINDS THE SURFACING ACT, NOT THE `ai` CLASS. Every
           creation that did not arrive through a member's session is the one D-78 stamps `surfaced_by: agent` below —
           an admin, member or probe DEPLOY TOKEN's included, which has no member behind it — so every such caller
           carries the stamp, composed by the run verbs' OWN expression (`class:<cls>` for a deploy token, the same
           string `op=airunopen` stamped as the run's principal), and `runPrincipalGate` compares it unchanged. The
           condition is `!viaSession` and never a list of classes: a class added later is asked, not exempted. The
           alternative — restamping a deploy token's creation `human` — would invent a person, and is not done. */
        /* REC-173 (§11 item 5, "A MIGRATION IS A REPLAY, NOT A SURFACING", BOB #30): A THIRD CASE, ADMITTED BY WHAT THE
           SERVER CAN CHECK. A creation of an inquiry is a MIGRATION REPLAY when (1) it arrives under the ADMIN class —
           the root of trust, a deploy token and never a session — and (2) `migrationReplayOf` finds the registered,
           held drive-provenance capture it names listing this bundle id and this `bundle.md` SHA-256. A replay is
           (a) exempt from rule 2 — no surfacing happens on this plane, so no `assistantPrincipal` is stamped; (b) NOT
           restamped by D-78 below — its Drive-era `surfaced_by` is kept, because a server-verified replay of recorded
           bytes is not a caller's assertion; and (c) recorded by the store as migrated, so its read states `not
           recorded (migrated from the Drive era)`. `migrationReplay` is the SERVER's stamp: deleted first for every
           caller, set only here. A verified replay is a replay: `replay` is set with it, so no creation-time stamp
           (D-436's group) rewrites the bytes the provenance lists. Anything failing (1) or (2) falls through to the
           ordinary creation unchanged. */
        /* D-511 (§11 item 5, "`replay` IS THE SERVER'S WORD, NEVER THE CALLER'S", RULED 2026-09-24 by BOB #33 on
           D-505's finding), STEP (1), THE FENCE. `replay` exempts a promotion from every SHAPE fence `promote` has —
           the gathering grammar, the inquiry and action basis arms, the correspondence arms, the bias arm, the
           creation-time group stamp, and C-32.19's rule that no machine writes a member's `risk_tier`. The exemption
           is right for what it is FOR: a replay re-states the record's own past verbatim, and that past predates the
           fences. But the flag ARRIVED IN THE REQUEST BODY and nothing removed it, so any caller could hand itself
           the exemption. MEASURED by D-505 through op=promote (`risk-tier.test.mjs` §7 arm (ix), now INVERTED): a
           MEMBER-class deploy token sending `replay: true` landed `risk_tier: 1` — "file freely" — on an action
           nobody assessed, and `op=projection` published it. A provenance hop a caller can hand us is one a caller
           can invent (`CLAUDE.md` §5), which is the reasoning `migrationReplay` below already answers one field over.
           THE CONDITION IS THE ADMIN CLASS WITH NO SESSION, AND BOTH HALVES ARE LOAD-BEARING. Admin is the only class
           `migrate.mjs` uses (it narrowed to admin at REC-173, and refuses to run under any other), so the migration
           is untouched. `!viaSession` is there because the session block above sets `cls = kind` from
           `sess.role === "admin"`, and the FOUNDER'S OWN SESSION — the one whose stored role is the literal `admin`
           (`Store.ROOT_ADMIN`, `rootOfTrust: true`), minted by `op=claim` and `op=login` — therefore arrives as
           `cls === "admin"` exactly as the deploy token does. A person signed in at a browser is not the root of
           trust, which is the distinction `op=export` draws in this file in the same words. MEASURED, because the
           first draft of this comment said an ADMIN-ROLE MEMBER's session arrives that way too and that is FALSE:
           a member login stores `member:<id>`, so her class is `member` and `m.role === "admin"` decides only her
           capabilities (`Store#sessionRights`). `risk-tier.test.mjs` §8's REACH arm asks `op=whoami` for all four
           callers rather than asserting any of it, and this section's control caught the error. Everything else
           — a member session, a member, probe or `ai` token, and any class added later — has the flag removed BEFORE
           the store sees it, so every fence applies to it. It is a DELETE and not a refusal: the caller asked for an
           exemption it may not have, and the honest answer is the promotion judged as what it IS, which then refuses
           by the fence's own name (C-32.19 for the measured case) rather than by a name about the flag.
           DELETED BEFORE the `migrationReplay` block below, which sets `b.replay` as the SERVER's word on a verified
           migration replay — the only writer of it that remains.
           THE RESIDUE STEP (1) LEFT — an ADMIN-class caller could still ASSERT a replay it cannot show — IS CLOSED BY
           STEP (2) (D-512, the block below): every replayed promotion, of any type and any revision, now names a
           drive-provenance capture the plane verifies, and this class test stays as its second condition. */
        if (viaSession || cls !== "admin") delete b.replay;
        delete b.migrationReplay;
        /* D-512 (§11 item 5, "`replay` IS THE SERVER'S WORD, NEVER THE CALLER'S", BOB #33), STEP (2), THE END STATE.
           `replay` is honoured only where the SERVER VERIFIES it: a replayed promotion of ANY type and ANY revision
           names its drive-provenance capture, and `migrationReplayOf` — REC-173's check, which asked this of an
           inquiry's creation alone — finds the capture registered by this promotion, its bytes HELD and hashing to
           the sha named, and one preserved promotion record naming THIS bundle and listing THIS revision's
           `bundle.md` SHA-256, computed here from the text being promoted. The caller's flag is read once and
           DELETED; the only writer of `b.replay` after this line is the verification. Step (1)'s class test above
           is KEPT as the SECOND condition, as BOB #33 ruled: a non-admin caller's flag was already removed, so it is
           judged by the fences it tried to skip exactly as D-511 made it (no new refusal reaches that class).
           AN ADMIN THAT ASSERTS A REPLAY IT CANNOT SHOW IS REFUSED BY NAME (C-66.6), NOT DOWNGRADED. Deleting the
           flag and letting the promotion land as an ordinary one would be D-511's answer, and it is wrong for the
           one caller that sends the flag honestly: `migrate.mjs` carries the Drive era VERBATIM, and an ordinary
           creation is rewritten on the way in (D-436's group stamp; D-78's restamp) — the migration would report
           success over bytes the Drive record does not list. So the root of trust hears which claim failed and
           nothing is written. An inquiry CREATION that asserts nothing is still asked, as REC-173 built it: verified,
           it is a migration replay; unverified, it is an ordinary creation and rule 2 and D-78 apply unchanged.
           RESIDUE, STATED: the provenance capture is itself uploaded by the root of trust, whose honesty the record
           does not model (Membership §DEC-2, deferred). After this step no caller can ASSERT a replay the held
           bytes do not list; an admin can still FABRICATE the bytes. */
        delete b.replay;
        const creatingInquiry = b.base === null && !!b.meta && promotedType === "inquiry";   /* D-526's one derivation (c21-batch28) */
        /* R16: the verdict reached before the handler (above); an unverified assertion never reaches this line. */
        const proven = replay?.proven ?? null;
        if (proven) b.replay = true;
        /* REC-173's migration-replay stamp stays an INQUIRY CREATION's: it is what `op=projection`'s `surfaced_in`
           reads, and no other promotion has a surfacing act to account for. */
        const replayed = creatingInquiry ? proven : null;
        if (replayed) b.migrationReplay = replayed;
        /* N290 (K334; inquiry R44, SOURCE-ACCESS): THE MEMBER'S BROWSER AGENT IS THE SERVER'S STAMP, as `migrationReplay`
           is one field over: a promotion never rewrites the caller's bytes, and a line the caller writes is one it can
           invent. Deleted first for every caller; set only on a CREATION through a member's session, from that
           request's own `User-Agent` header, trimmed, at most 512 characters. A deploy token or an `ai` key has no
           member's browser behind it, so it carries none. The store records it at the creation (inquiry R44). */
        delete b.memberUserAgent;
        if (viaSession && b.base === null) {
          const agent = (req.headers.get("User-Agent") || "").trim().slice(0, 512).trimEnd();
          if (agent) b.memberUserAgent = agent;
        }
        delete b.assistantPrincipal;
        if (!viaSession)
          b.assistantPrincipal = cls === "ai" ? `${aiCred.principal}/${aiCred.tokenId}` : `${MACHINE_CLASS_PREFIX}${cls}`;
        /* REC-173 (a): a verified migration replay is exempt from rule 2 — no surfacing happens on this plane — so it
           carries no stamp for `#surfacingGate` to ask. Written as its own line after REC-171's stamp, which stands
           byte-for-byte for every other caller. */
        if (replayed) delete b.assistantPrincipal;
        if (b.base === null && b.meta && promotedType === "project" && viaSession) {
          /* **THE SECOND SITE OF `NOT_CAPABLE`, AND REC-79 IS SAYING SO RATHER
             THAN HIDING IT.** C-38.5's `where` names the admission region above;
             this condition is the same refusal minted a second time, here,
             because it depends on the PAYLOAD (is this bundle a project?) and
             not on the op, so the op-level `NEEDS` table cannot express it.
             A DEC-49 row holds ONE `where` and one code may not hold two rows,
             so this `where` cannot name both spans — which is exactly the
             MULTI-SITE class REC-79's partition arm measures at 96 codes and
             deliberately does NOT close, because the fix is a set-valued `where`
             or a consolidating helper and neither is a translation.
             WHAT IS CLOSED HERE: the member gets the sentence either way. The
             canned translation is read from the same one row, so the two sites
             cannot drift into two wordings for one condition — and
             `admission-gate.test.mjs` drives BOTH through the op and asserts
             they carry the SAME translation, so this comment is not the only
             thing holding it. */
          if (!sessCaps.has("create_projects"))
            return json({ ok: false, reason: "NOT_CAPABLE", ...admissionRow("NOT_CAPABLE"),
              op, needs: "create_projects",
              held: [...sessCaps].sort(),
              detail: "creating a project needs the create-projects capability. This account may still "
                    + "contribute to projects it has been invited to, if it holds contribute." }, 403);
          b.ownerMemberId = sessMember;
        }
        /* D-78: surfaced_by is the ACTOR CLASS, decided by the SERVER and never
           taken from the caller's assertion. A focus opened by an assistant (a
           machine credential) honestly records `agent`; one opened by a member
           records `human`. Both bundle writers (setup.mjs, civicos-ui) emit a
           literal `human`, and the store byte-trusts bundle.md, so the honest
           place to decide it is HERE, at the trust boundary, beside author,
           owner and by — the same delete-and-restamp discipline, and the reason
           it fixes BOTH writers at once. C-2.8 already permits either value.
           Stamped on the CREATION (the surfacing act itself); a revision carries
           the document's value forward, so the origin fact is not rewritten by
           whoever later edits it. Only a focus/problem carries the field, and
           the store recomputes nothing — the recomputed bundle.md sha below is
           what becomes the bundle_sha, so overwriting a caller's `agent` claim
           on a session write cannot smuggle a false attribution past the gate. */
        if (b.base === null && b.meta && !replayed   /* REC-173 (b): a verified migration replay keeps its Drive-era bytes */
            /* Through the catalog's normalizeType (REC-10), so the canonical
               `inquiry` spelling and both legacy spellings all get the D-78
               restamp — hand-listed spellings here is how the last rename
               made a check silently stop firing. */
            && promotedType === "inquiry"
            && Array.isArray(b.files)) {
          const bm = b.files.find((f) => f && f.path === "bundle.md" && typeof f.text === "string");
          if (bm) {
            const want = viaSession ? "human" : "agent";
            const lines = bm.text.split("\n");
            const end = lines.indexOf("---", 1);
            let changed = false;
            for (let i = 1; i < (end === -1 ? lines.length : end); i++) {
              if (lines[i].startsWith("surfaced_by:")) { lines[i] = "surfaced_by: " + want; changed = true; break; }
            }
            /* REC-175: A SUPPLIED DIGEST THAT IS NOT OF THE BYTES SENT IS NOT PAPERED OVER HERE. This restamp
               recomputes the sha of what it writes, which would silently REPLACE a caller's false `sha256` with a
               true one and answer `ok: true` over it. So the restamp runs only when the caller sent no digest or
               the digest OF THE TEXT IT SENT; otherwise the bytes and the digest go to the store as sent, and
               `promote` refuses them FILE_DIGEST_MISMATCH by name. Compared by the store's own rule (UTF-8, hex
               case-insensitive). */
            const sentSha = createSha256().update(new TextEncoder().encode(bm.text)).hex();
            const sentOk = bm.sha256 === undefined || bm.sha256 === null
              || (typeof bm.sha256 === "string" && bm.sha256.toLowerCase() === sentSha);
            if (changed && sentOk) {
              bm.text = lines.join("\n");
              const bytes = new TextEncoder().encode(bm.text);
              bm.bytes = bytes.length;
              bm.sha256 = createSha256().update(bytes).hex();
            }
          }
        }
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* Who dispositioned a knock is part of the record. A session signs its
       own name; a machine credential says so plainly rather than borrowing
       a person's. */
    /* A member declares their OWN expertise and an administrator confirms as
       THEMSELVES. Both stamped from the session and overwritten if supplied, on
       the same reasoning as author and by: a declaration a caller can address to
       someone else is not a declaration. Without a session there is no member to
       be, so the store refuses on the identity it is handed.

       IDENTITY-CLAIM: ENFORCED-ELSEWHERE NO_SUCH_MEMBER NOT_AN_ADMIN — the machine is
       refused here, but NOT as a machine, and the difference is the finding.

       CORRECTED BY DEC-52 (REC-65), AND THIS PAIR IS THE ONE WHERE THE RULING AND THE
       BEHAVIOUR COME APART — which is why it gets its own paragraph instead of a
       pointer to FW-6. DEC-52 permits a machine credential to perform the constitutive
       acts, so the last sentence above must NOT be read as a machine fence. It is not
       one, and it never was. What actually refuses is MEASURED rather than inferred
       (REC-65, driven through the control plane under a machine credential with a
       payload a member then completes successfully with the same body):
         - op=expertisedeclare answers **NO_SUCH_MEMBER** — `class:member` is not a
           member id, so there is no row to hang a licence on;
         - op=expertiseconfirm answers **NOT_AN_ADMIN** — `#isAdminMember("class:admin")`
           is false, so a machine ADMIN credential is not an administrator MEMBER.
       NEITHER IS A MACHINE REFUSAL, and saying so is the point: this is D-229's exact
       shape — a fence believed to be doing work that an ordinary identity guard is
       doing instead. The distinction is load-bearing here, because a later author who
       thought a machine fence stood here might delete the membership guard as
       redundant and open BOTH doors at once.
       WHY THE OUTCOME IS NEVERTHELESS RIGHT AND IS NOT A GAP TO CLOSE: expertise (§1.3)
       is a claim about a PERSON'S standing, and confirmation is one person VOUCHING FOR
       another. DEC-52 licenses a machine to declare things about the RECORD; it says
       nothing about a machine acquiring a licence of its own, and there is nowhere in
       the members table to put one. The act is permitted by doctrine and impossible by
       construction, which is a better outcome than a fence and is left exactly as it
       is. */
    if ((op === "expertisedeclare" || op === "expertiseconfirm") && passBody) {
      try {
        const b = JSON.parse(passBody);
        if (op === "expertisedeclare") b.memberId = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        else b.by = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* FW-6: the SUBJECT REGISTRY writes carry WHO declared the entry or the
       relation, stamped from the session and overwritten if the caller supplied it,
       on the same reasoning as author, by and memberId above: a declared relation is
       a member's constitutive statement, so an entry a caller could attribute to
       someone else is not that member's declaration. A machine credential says what
       it is (class:<cls>) rather than borrowing a person's name.

       IDENTITY-CLAIM: RULED DEC-52 — a machine credential may declare a relation, and
       the record names it.

       CORRECTED 2026-08-07 BY DEC-52 (enacted as REC-65), AND THE CORRECTION RUNS THE
       OPPOSITE WAY FROM THE ONE THE SENTENCE ABOVE INVITES. Bob ruled: *"allowing the
       machine to rule doesn't go against doctrine. So it can rule."* A MACHINE
       CREDENTIAL MAY DECLARE A RELATION DIRECTLY INTO THE RECORD — the act is
       permitted, not tolerated. The paragraph above read for months as though only a
       member could, and NOTHING HAS EVER ENFORCED THAT: REC-46 measured the gap,
       deliberately changed no site here, and every one stayed green, which WAS the
       measurement. **The comment was the wrong half, not the code. No fence is to be
       added at `declareRelation`, `createEntity` or `addEntityAlias` to make the older
       wording true**, and the absence of one is now a DECISION a later author may rely
       on rather than an oversight to tidy up. This block is the long form; the FW-7,
       FW-8, FW-9 and expertise sites below point back here rather than restating it,
       because five copies of a ruling drift and this project has measured that five
       times.

       WHY A FALSE COMMENT WAS WORTH AN ITEM: a comment describing a constraint that
       does not exist is a FENCE THAT READS AS PRESENT TO EVERY SUBSEQUENT AUTHOR —
       the class D-229, REC-73, D-228 and IC-33 each cost a whole item, in its cheapest
       and most durable form.

       WHAT THE RULING CARRIES WITH IT, and a later author must not drop any of it:
         - THE RECORD NAMES THE MACHINE PRINCIPAL on every such act — `class:<cls>`,
           never a person's name (DEC-55 det 4 / D-199.4). That is what the stamp on
           the next line is FOR, and it is now load-bearing rather than merely honest:
           permission to act is granted against a named actor.
         - A machine-declared statement is therefore VISIBLY MACHINE-ATTRIBUTED
           (D-82's look-derived rule) — a reader can tell a machine's declaration from
           a member's, which is the whole reason the two may sit in one table.
         - GRADES STAY EARNED (framework §8.1). The ruling decides WHO may declare and
           says nothing about what a declaration is worth; a declared relation still
           carries no connection grade at all (D-83).
         - DEC-15 stands: a hunch is a member act.
         - The earlier provisional — sidebar approval as the act of record — is
           SUPERSEDED AS A GATE. The sidebar (INVESTIGATIVE-SESSION.md §14a) remains a
           visibility and bulk-review surface, and reviewing is not the same as
           permitting. */
    if ((op === "entitycreate" || op === "entityalias" || op === "relationdeclare") && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.declaredBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* T5-11 (entities R8, R4, R28): WHO WITHDREW an alias or a relation, stamped on the FW-6 rule above and overwriting
       any `withdrawnBy` the caller put in the body, so a correction is never attributed to someone who did not make it.

       IDENTITY-CLAIM: RULED DEC-52 — a machine credential may correct the registry it may build, and the record names it (class:<cls>).

       The FW-6 block above carries the ruling in full; nothing refuses a machine here BY DESIGN. */
    if ((op === "aliaswithdraw" || op === "relationwithdraw") && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.withdrawnBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* N345 (entities R38): WHO REPORTED that a resolution matched the wrong subject, stamped on the FW-6 rule above into
       the body `reportResolutionDefect` reads, overwriting any `by` the caller put there; a repeat is judged per reporter,
       so a caller who could name one could report twice or as someone else. An empty POST body is stamped too, so the
       report's refusal is the module's own and never an unattributed row.

       IDENTITY-CLAIM: RULED DEC-52 — a machine credential may report a defect in the registry it may build, and the record names it (class:<cls>).

       The FW-6 block above carries the ruling in full; nothing refuses a machine here BY DESIGN. */
    if (op === "resolutiondefect" && req.method === "POST") {
      try {
        const b = passBody ? JSON.parse(passBody) : {};
        if (b && typeof b === "object" && !Array.isArray(b)) {
          b.by = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
          passBody = JSON.stringify(b);
        }
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* FW-7: WHO resolved a reference or TESTIFIED a grade-D connection is part of the
       record, stamped from the session and overwritten if supplied, on the same
       reasoning as the registry writes above: a resolution a caller could attribute to
       someone else is not that member's act, and a grade-D testimony without a named
       author is not testimony at all (framework 8.1). A machine credential says what it
       is (class:<cls>) rather than borrowing a person's name.

       IDENTITY-CLAIM: RULED DEC-52 — a machine credential may resolve a reference and
       may testify, and the record names it (class:<cls>).

       CORRECTED BY DEC-52 (REC-65) — SEE THE FW-6 BLOCK ABOVE FOR THE RULING IN FULL.
       A MACHINE CREDENTIAL MAY RESOLVE A REFERENCE, and nothing here refuses one BY
       DESIGN rather than by omission. Two things this site adds to the ruling and they
       are not decoration. (1) DEC-52's own reasoning records that `resolve` is DERIVED
       — `#recogniseTier` is a deterministic cascade over aliases a member ALREADY
       registered, and it never mints the weakest grade — so it asserts nothing the
       member's alias declaration did not already imply. Fencing it would have cost the
       automated-recognition capability and bought no honesty; that is why the derived
       act was the easiest of the three to rule on. (2) `resolvetestify` is the opposite
       case — PURE TESTIMONY, and the sentence above about a grade-D testimony needing a
       named author STANDS UNCHANGED under the ruling, because `class:<cls>` IS a name.
       What §8.1 refuses is anonymity, not machinery: the act is permitted and the
       ANONYMITY is not, which is the distinction the whole stamp exists to draw. */
    if ((op === "resolve" || op === "resolvetestify") && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.resolvedBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* FW-8: a PROGRESSION DEFINITION is a member's constitutive claim about how an
       institution ought to behave (framework §8.1 note 3), so who declared it is stamped
       from the session and overwritten if the caller supplied it, exactly as the registry
       writes are. And a DERIVED connection is asserted by the SYSTEM in slice A: asserted_by
       is FORCED to "system" server-side so a caller cannot pass it off as source- or
       member-asserted (a member-asserted connection is a distinct, slice-B fact — an
       equality a caller can hand us is one a caller can invent).

       IDENTITY-CLAIM: RULED DEC-52 — a machine credential may define a progression, and
       the record names it (class:<cls>).

       CORRECTED BY DEC-52 (REC-65) — SEE THE FW-6 BLOCK ABOVE FOR THE RULING IN FULL.
       A MACHINE CREDENTIAL MAY DEFINE A PROGRESSION and is refused by nothing here, BY
       DECISION. The §8.1 note-3 sentence above still describes what the claim IS — a
       constitutive claim about how an institution ought to behave — and the ruling
       changes only who may make it, on Bob's reasoning that letting the machine rule
       does not go against doctrine. The record says which: `class:<cls>` on the row, so
       a definition proposed by an agent and one authored by a member are DISTINGUISHABLE
       facts rather than one indistinguishable one.
       THE `assertedBy: "system"` FORCE ON op=connect IS A DIFFERENT RULE AND IS
       UNTOUCHED. It is not an identity fence at all: it stops a caller passing a DERIVED
       connection off as source- or member-asserted, which is a claim about HOW the
       connection was reached, not about who reached it. DEC-52 does not reach it. */
    if (op === "progressiondefine" && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.declaredBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    if (op === "connect" && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.assertedBy = "system";
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* FW-9: WHICH stage a document fills in a progression instance is the threading member's
       authored judgment, so who threaded it is stamped from the session and overwritten if the
       caller supplied it, on the same reasoning as the registry, recogniser and progression
       writes above. The GRADE of each placement is the record's (a document's resolution to the
       entity), never the caller's, so only the authorship is stamped here. A machine credential
       says what it is (class:<cls>) rather than borrowing a person's name.

       IDENTITY-CLAIM: RULED DEC-52 — a machine credential may thread a progression, and
       the record names it (class:<cls>).

       CORRECTED BY DEC-52 (REC-65) — SEE THE FW-6 BLOCK ABOVE FOR THE RULING IN FULL. A
       MACHINE CREDENTIAL MAY THREAD A PROGRESSION, and the absence of a fence here is a
       decision rather than an omission. The sentence above about an authored judgment
       stands as a description of the JUDGMENT; what it no longer implies is that only a
       member may make it.
       AND THE SECOND SENTENCE IS WHY THIS ACT WAS THE SAFEST OF THE THREE TO RULE ON,
       which is worth having at the site: the GRADE of each placement is EARNED from the
       document's resolution to the entity and is never taken from the caller, so a
       machine that threads a progression cannot thereby make the record claim anything
       stronger than the evidence already supports (framework §8.1). Grades stay earned
       is not a promise made elsewhere about this act — it is a property of this act. */
    if (op === "thread" && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.threadedBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* FW-10: an exception document DISCHARGES a lawful skip, and WHO declared the skip lawful is
       part of the record — the author of a justification, exactly as a progression definition or a
       declared relation carries its author. Stamped from the session and overwritten if the caller
       supplied it; a machine credential says what it is (class:<cls>) rather than borrowing a
       person's name. The GRADE-like earning (the document must resolve to the entity) is the
       record's, checked in the store, never the caller's.
       REC-65 / DEC-52: this site states its rule BY REFERENCE — "exactly as a progression
       definition or a declared relation carries its author" — so the reference now points at
       corrected prose, and that is deliberate rather than incidental. A machine credential may
       discharge a lawful skip, for the same reason and with the same naming (`class:<cls>`).
       A comment that inherits its rule inherits its corrections too, which is the argument for
       writing it by reference in the first place. */
    if (op === "discharge" && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.declaredBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* REC-7: WHO deferred or dismissed a proposal is the whole of the disposition — declining is
       not authoring, so the disposition record IS the act, and it must carry the deciding member.
       Stamped from the session and overwritten if the caller supplied it, exactly as the other
       progression writes are: a member's decision to set aside the record's question, addressed to
       nobody but themselves. A machine credential says what it is (class:<cls>) rather than
       borrowing a person's name; the store refuses a blank decider (NO_DECIDER), so a bypass fails
       closed.

       IDENTITY-CLAIM: OPEN — DEC-52 rules on three verbs and setting aside the record's
       own question is not one of them. Routed to CONDUCT, pinned by name, not decided.

       OPEN, NAMED, AND DELIBERATELY NOT CLOSED BY REC-65 — read this before adding a
       fence OR relying on its absence. **DEC-52 DOES NOT REACH THIS ACT.** Bob ruled on
       three verbs — declare a relation, resolve a reference, thread a progression — and
       setting aside the record's own question is none of them. But the sentence above
       describes it as a member's decision and NOTHING REFUSES A MACHINE, which REC-65
       MEASURED rather than inferred: driven through the control plane under a machine
       credential, `op=proposedispose` SUCCEEDS and the row reads
       `decided_by: "class:member"`. So an agent can defer the record's own question to
       nobody but itself, and the record will say so honestly and permit it.
       WHY IT IS LEFT AS IT IS RATHER THAN FENCED OR BLESSED: fencing it would be a
       worker deciding a doctrine question Bob has not been asked, and blessing it would
       be worse — it would extend a ruling by analogy, which is exactly how a ruling
       drifts. It is ROUTED to CONDUCT (REC-65's report) as the question DEC-52's
       reasoning raises without answering, and it is PINNED as a known-open finding in
       `test/identity-claims.test.mjs` so it cannot quietly become normal. **The pin
       fails when either half moves** — when a fence appears, or when this comment stops
       claiming it is a member's decision — which is the mechanical expiry M0-12's ledger
       technique exists for. */
    if (op === "proposedispose" && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.decidedBy = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* T6-13 (intent R2, R8–R11, R16, R18, R20; INTENT #1 REPORT J4.2): WHO SET THE CONDITION, DECLARED, LINKED, CLOSED,
       DEPARTED, RECORDED, RETIRED, TRIAGED OR SET AN ASSISTANT TO WORK — intent reads `author` from the BODY, so it is
       stamped into the body here and a caller's is overwritten. It is the POSITIONAL identity (`member:<id>`, the
       founder's `member:admin`), the form intent asks membership's `projectAuthority` of; a machine credential stamps
       `class:<cls>` and an `ai` credential `class:ai/<tokenId>` (`contentmint`'s form), each a machine identity intent
       refuses BY NAME at every act but `triage`'s `question` — NEVER a key's principal, which would put an assistant's
       act under a person's name.
       `triage` also carries `assistantPrincipal`, op=promote's stamp by op=promote's expression: `question` opens an
       inquiry through promotion, and ai-runs' surfacing step (its R25) asks that stamp for the run the caller holds. It
       is deleted first for every caller and set only for one that did not arrive by a session, so a session is never
       taken for an assistant and an assistant cannot name another. `run` stays the caller's word: the step asks every
       question of it (sight, position, status, bound). An empty POST body is stamped too, so a signed-in session's
       act never reads as a machine's for want of a body. */
    if (INTENT_ACTIONS.includes(op) && req.method === "POST") {
      try {
        const b = passBody ? JSON.parse(passBody) : {};
        if (b && typeof b === "object" && !Array.isArray(b)) {
          b.author = viaSession ? sessIdentity
            : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
            : `${MACHINE_CLASS_PREFIX}${cls}`;
          if (op === "triage") {
            delete b.assistantPrincipal;
            if (!viaSession)
              b.assistantPrincipal = cls === "ai" ? `${aiCred.principal}/${aiCred.tokenId}` : `${MACHINE_CLASS_PREFIX}${cls}`;
          }
          passBody = JSON.stringify(b);
        }
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* T8 (standards R1, R9, R10): WHO RECORDED OR ADOPTED A STANDARD, AND WHO PROPOSED ONE — standards reads `author` and
       `proposer` from the BODY (its `viewer` from the query, after the body), so each is stamped into the body here and a
       caller's is overwritten; the proposal takes `proposer` and the other two `author`, the one key each accepts. The
       layer's expression (`QUERY_AUTHOR_ACTIONS` above): the positional identity for a session, `class:<cls>` or
       `class:ai/<tokenId>` for a machine, which standards refuses BY NAME at a declaration or an adoption
       (MACHINE_CANNOT_DECLARE_STANDARD) and labels as machine work on a proposal. An empty POST body is stamped too. */
    if (STANDARDS_ACTIONS.includes(op) && req.method === "POST") {
      try {
        const b = passBody ? JSON.parse(passBody) : {};
        if (b && typeof b === "object" && !Array.isArray(b)) {
          const who = viaSession ? sessIdentity
            : cls === "ai" ? `${MACHINE_CLASS_PREFIX}${cls}/${aiCred.tokenId}`
            : `${MACHINE_CLASS_PREFIX}${cls}`;
          delete b.author;
          delete b.proposer;
          if (op === "standardpropose") b.proposer = who; else b.author = who;
          passBody = JSON.stringify(b);
        }
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    if (op === "inboxresolve" && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.by = viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* D-98. Who forwarded a task and who resolved it are the two facts its
       history exists to hold, so neither is taken from the caller. A machine
       credential says what it is rather than borrowing a person's name.
       CORRECTED 2026-08-04 (REC-28, D-151): this comment used to finish "and the
       store refuses a forward or a resolution that names no member, so a daemon
       cannot close somebody's work" — true of the NO_ACTOR refusal it described
       and NOT the guarantee it sounded like, because an UNASSIGNED task is
       nobody's work and the store closed it happily for `token:probe`. The stamp
       is what MAKES the store's act refusals possible and is unchanged: it is
       precisely because a machine is honestly named `token:<class>` here that
       taskForward/taskResolve can refuse it BY SHAPE (MACHINE_CANNOT_FORWARD /
       MACHINE_CANNOT_RESOLVE). `taskdrain` keeps the stamp and no such refusal:
       routing an event into a task is the daemon's job. */
    /* REC-207: `op=biasdebtresolve` takes the SAME body stamp and for the same reason. WHO settled the
       obligation is the whole of what the act records beside the reason, so it is the server's word and
       never the caller's; and a machine credential arriving honestly named `token:<class>` is precisely
       what lets the store refuse it BY SHAPE rather than by guessing from an absence. */
    if ((op === "taskforward" || op === "taskresolve" || op === "taskdrain"
         || op === "biasdebtresolve") && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.actor = viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* PL-11 / IS-5 / D-199 (3): WHO WITHDREW AN AGENT CREDENTIAL is the whole
       content of `revoked_by`, so it is stamped from the session and the
       caller's own copy is overwritten rather than honoured — the same rule
       every identity field in this file follows. A machine credential arrives
       honestly named `token:<class>` and the store refuses it BY SHAPE
       (C-29.4), which is only possible because the stamp is the server's. */
    if (op === "aicredentialrevoke")
      inner.searchParams.set("who", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
    /* D-436 / IC-172: WHO RECORDED THE INSTANCE'S PRODUCING GROUP is the whole of `recorded_by`, so it is the
       SERVER's stamp, set after the caller's parameters were copied — a caller-supplied `author` is overwritten.
       Only the root of trust reaches the op (its OPS row), so this reads `token:admin` in practice. */
    if (op === "instancegroupseed")
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
    /* REC-126 / DEC-31: WHO AUTHORED THE DRAFT, WHO ISSUED THE GRANT, WHO WITHDREW
       IT — the three facts §6A.2's "attributed" row demands, so all three are
       stamped by the server and a caller-supplied `author` is overwritten rather
       than honoured. A machine arrives honestly named `token:<class>` and the store
       refuses it BY NAME (MACHINE_CANNOT_REVIEW). `secretSha` is DELETED for the
       same reason: only the mint below may set it. */
    if (op === "casedraft" || op === "reviewgrant" || op === "reviewrevoke") {
      inner.searchParams.set("author", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
      inner.searchParams.delete("secretSha");
    }

    /* PL-11 / IS-5 / D-199 — THE MINT, AND IT IS NOT A PLAIN FORWARD FOR ONE
     * REASON: THE VALUE IS GENERATED HERE AND IS RETURNED EXACTLY ONCE.
     *
     * The Durable Object receives the SHA and never the value, so no method in
     * `store.mjs` can print a credential because none has ever held one — a
     * stronger statement than a rule about not logging it, and asserted over
     * that file's source in test/aicredential.test.mjs. What is stored is an
     * identity a member chose and a hash that verifies a presentation, and
     * D-199 (4) is explicit that the record names the identity and the
     * principal, NEVER the token's value.
     *
     * THE DECLARATION IS JUDGED BEFORE ANYTHING IS WRITTEN, because a scope the
     * gate would refuse is a sentence that must not enter the record at all
     * (C-29.8 / C-29.9). `who` and `secretSha` are SET rather than merged: a
     * caller who could name either could mint themselves a credential in
     * somebody else's name, or bind a secret they chose. */
    if (op === "aicredentialmint") {
      let asked = {};
      try { asked = passBody ? JSON.parse(passBody) : {}; } catch { asked = {}; }
      const declared = aiScopeDeclaration(asked.writes);
      if (declared.error) return json({ ok: false, ...declared.error, op, cls }, 403);
      /* D-463: THE CONFINEMENT IS JUDGED HERE TOO, and before anything is written, for the declaration's own
         reason one line up (C-29.8 / C-29.9): a confinement the gate could never honour is a sentence that must
         not enter the record at all. It is judged in THIS file because this is where `NAMESPACES` lives, exactly
         as `writes` is judged here because this is where the OPS table lives; the store records what it is told
         and keeps no second copy of either vocabulary. The NORMALISED value crosses to the store below — never
         the caller's own spelling, which is the same rule `who` and `secretSha` follow in this block. */
      const confinement = aiConfinementDeclaration(asked.confinedTo);
      if (confinement.error) return json({ ok: false, ...confinement.error, op, cls }, 403);
      const raw = new Uint8Array(32);
      crypto.getRandomValues(raw);
      const secret = "aik-" + [...raw].map((x) => x.toString(16).padStart(2, "0")).join("");
      inner.searchParams.set("who", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`);
      inner.searchParams.set("secretSha", await sha256Hex(secret));
      const minted = await doAnswer(stub.fetch(new Request(inner,
        { method: req.method, body: JSON.stringify({ ...asked, writes: declared.writes,
                                                     confinedTo: confinement.confinedTo }) })));
      if (minted.refused) return storeRefusal(minted, { op, store: storeName, tokenClass: cls });
      if (!minted.answered) return storeSilent("aicredentialmint", minted.correlation);
      if (!minted.result || minted.result.ok !== true)
        return json({ ok: false, ...(minted.result || {}), op, store: storeName, tokenClass: cls }, 403);
      return json({ ok: true, result: {
        ...minted.result,
        /* THE ONE TIME THIS VALUE EXISTS ANYWHERE A CALLER CAN READ IT. It is
           not recoverable afterwards from this instance by any route, because
           nothing here kept it — losing it means minting another and revoking
           this one, which leaves both acts on the record where they belong. */
        token: secret,
        tokenIsShownOnce: "This is the only time this instance will show this value. It is not stored "
          + "and cannot be recovered — the record holds the credential's NAME and who created it, "
          + "never the value. If it is lost, withdraw this credential and create another.",
      }, store: storeName, tokenClass: cls }, 200);
    }

    /* REC-126 / DEC-31 / IC-145 — THE GRANT'S READ SECRET, GENERATED HERE AND
     * SHOWN EXACTLY ONCE, on `aicredentialmint`'s pattern one block up and for its
     * reason: the Durable Object receives the SHA-256 and never the value, so no
     * method in `store.mjs` can print it because none has ever held it. The value is
     * a READ credential only (§6A.2): it is not a token, `classify` never admits it,
     * and the only ops that read it are `reviewcopy`, `reviewcomment` and the
     * unsigned half of `casedocument`. 32 random bytes, base64url, behind a version
     * prefix — not an id, and not derivable from one. */
    if (op === "reviewgrant") {
      const raw = new Uint8Array(32);
      crypto.getRandomValues(raw);
      const secret = "rv1_" + btoa(String.fromCharCode(...raw)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      inner.searchParams.set("secretSha", await sha256Hex(secret));
      const issued = await doAnswer(stub.fetch(new Request(inner, { method: req.method, body: passBody })));
      if (issued.refused) return storeRefusal(issued, { op, store: storeName, tokenClass: cls });
      if (!issued.answered) return storeSilent("reviewgrant", issued.correlation);
      if (!issued.result || issued.result.ok !== true)
        return json({ ok: false, ...(issued.result || {}), op, store: storeName, tokenClass: cls }, 403);
      return json({ ok: true, result: {
        ...issued.result,
        secret,
        secretIsShownOnce: "This is the only time this instance will show this value. It is stored only as a "
          + "fingerprint and cannot be recovered. Give it to the recipient: it lets them READ this one draft and "
          + "COMMENT on it, and nothing else. If it is lost, withdraw this grant and issue another.",
        read: "op=reviewcopy&secret=<the value above>",
      }, store: storeName, tokenClass: cls }, 200);
    }

    /* REC-198: the list of a project's drafts answers in the review copy's OWN shape — through `reviewAnswer`,
       the function `reviewcopy` answers through — so the dead answer a caller outside the fence receives is the
       single read's, status and bytes, and not this handler's generic envelope. */
    if (op === "casedrafts")
      return reviewAnswer(await doAnswer(stub.fetch(new Request(inner, { method: "GET" }))), op);

    /* R23 (K421), R30, REC-52: the reply is read through `doAnswer`. The store's own refusal (`BAD_JSON`, an unknown
       route) is relayed at its status; anything that is not JSON carrying a boolean `ok`, or the store's catch, is a
       silence, never relayed (a store's stack included). */
    const out = await doAnswer(stub.fetch(new Request(inner, { method: req.method, body: passBody })));
    if (out.refused) return storeRefusal(out, { store: storeName, tokenClass: cls });
    if (!out.answered) return storeSilent(op, out.correlation);
    const { body, status } = out.reply;
    /* K383 (capture's C-118.2): an inbox read or disposition naming no knock answers 404, as NO_SUCH_BUNDLE does. */
    if ((op === "inboxget" || op === "inboxresolve") && body.result?.ok === false && body.result.reason === "NO_SUCH_KNOCK")
      return json({ ...body, store: storeName, tokenClass: cls }, 404);
    return json({ ...body, store: storeName, tokenClass: cls }, status);
  }
}
export { json, doAnswer, storeSilent, storeRefusal, relayAnswer, StoreSilent, STORE_SILENT_REASON, STORE_SILENT_DETAIL, PUBLISHED_STORE, SCRATCH,
         NAMESPACES, sha256Hex, fingerprint, classify, scopeFor, caseReader, resolveSession, reviewAnswer, captureKey,
         installationRow, admissionRow, dispatchRow, namespaceRow, machineFenceRow, replayRow, identityFenceRow,
         dec49Row, dec49Attach, MODULE_CHECK_FILES, sessionOpGate, migrationReplayOf, DRIVE_PROVENANCE_PATH,
         namespaceGate, pinnedNamespaceGate, confinedNamespaceGate, aiReachesAsMember, aiScopeDeclaration,
         aiConfinementDeclaration, aiTaskScope, AI_TOKEN_SHAPE, SCRATCH_ADDRESSING_PUBLIC_OPS };
