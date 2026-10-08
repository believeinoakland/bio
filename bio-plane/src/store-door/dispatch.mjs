/* store-door: THE RECORD STORE'S DOOR (R1–R4, R6, R8–R11, R13). `dispatch(req, store)` is the one frame every Durable Object
   request passes: the body read, the route looked up in the modules' own maps (the `membershipOps` pattern;
   `store.routes(url, body)`, the union `plane` composes, its R5), the existence answer of a read naming a discoverable
   project (R2), a purge's hold check (R4), the `{ok: true, result}` envelope, and the one catch (R6). Moved from
   legacy-store's `Store.fetch` at control-plane's extraction (built T12, K93; re-applied T13 by N333), and copied whole
   from `control-plane/dispatch.mjs` at this module's split (T35-81; K617, K1907, K1974), control-plane R26, R27, R46,
   R47 and the store's halves of its R25, R36, R50, R53, R57 and R59 becoming this module's R1–R11. The Durable Object
   class whose `fetch` this is is `plane`'s (its R1, was control-plane's R35, moved at T19), which also spreads
   `controlPlaneRoutes` below into its map (the name kept, so plane's composition is unchanged). */
import { credentialsOf } from "../credentials/index.mjs";
import { captureOf } from "../capture/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { recordOf } from "../record-core/index.mjs";
import { sourcesOf, sourcesOps } from "../sources/index.mjs";
import { queueOf, queueOps } from "../queue/index.mjs";
import { tasksOf, tasksOps } from "../tasks/index.mjs";
import { affordancesOf, affordancesOps } from "../affordances.mjs";
import { wizardScriptsOf } from "../wizard-scripts/index.mjs";
import { askAdmits } from "../answers/scope.mjs";
import { answersOf } from "../answers/index.mjs";
import { aiRunsOf } from "../ai-runs/index.mjs";
import { membershipOf, notAnAdmin } from "../membership/index.mjs";
import { instanceSetupOf } from "../setup.mjs";
import { DISPATCH_CHECKS } from "../answer-envelope/checks.mjs";
import { pullAndFile } from "./pull.mjs";

/* ===== REC-196 — A READ NAMING A DISCOVERABLE PROJECT'S OWN ID IS ANSWERED POSITIONALLY (Membership v2 §7, item
 * 7.14, RULED 2026-09-23 by BOB #32, (a)).
 *
 * THE DEFECT. REC-149 refused every ACT at EXISTENCE positionally, and left every READ that names a project by id
 * answering as for a project that does not exist ("Record reads do not widen"). So a member the directory had just
 * shown a project to was told by `op=projectparticipants`, `op=image`, `op=projectvisibility` … that it does not
 * exist — the record calling a project the record itself had just shown nonexistent. The ruling: a read naming the
 * PROJECT'S OWN id answers exactly as an act does, C-70.1 through `#existenceAct` (the id and the name, nothing
 * else); a read naming anything INSIDE the project answers exactly as today; `viewerPredicate` is unchanged.
 *
 * ONE DOOR, ONE TABLE. The check sits in `dispatch`, before the route runs, rather than in thirty read methods: every
 * read below is reached by exactly that door, so no read can answer a second thing. The table names, per read, the
 * parameters that carry a BUNDLE id — the only parameters that can name a project. `#existenceAct` answers only
 * when that id is a PROJECT the caller sees at EXISTENCE, so an id of anything inside a project (a bundle, a run, a
 * draft), an absent id, a hidden project and every caller with full sight all fall through to the read unchanged.
 * `PROJECT_NAMING_READS_NOT` names each read whose parameters name something that is never a bundle, with the
 * reason, and R2's tests (`test/m/store-door/dispatch.test.mjs`) hold each
 * read in at most one of the two tables and drive each classified read's answer. (Ported from the old
 * `project-sight.test.mjs` §11's sweep.)
 *
 * COST, STATED: one indexed lookup on `project_sight` per named parameter of a stamped read, and `#sight` only for
 * an id that row calls discoverable. A viewer never sent (an internal call) is not asked. */
export const PROJECT_NAMING_READS = Object.freeze({
  image: ["id"], file: ["id"], projection: ["id"], excludedby: ["id"], backlinks: ["target"],
  reevaluations: ["target"], inquirystrength: ["id"], earnedbasis: ["id"], partitionindependence: ["id"],
  narrowcandidates: ["target"], versionnotice: ["target"], basisversions: ["id", "project"],
  versionstrength: ["id", "project"], strengthbarof: ["project", "target"], extractproposals: ["bundle"],
  capturerequests: ["target"], tasks: ["refers"], biasmanifest: ["scopeId"], airuns: ["contextId"],
  casedrafts: ["project"], gatefacts: ["id"], affordancefacts: ["target"],
  projectownerarith: ["projectId"], projectvisibility: ["projectId"], projectparticipants: ["projectId"],
  /* REC-196 x REC-150: REC-150's requests read names the project by its own id, so the door answers
     C-70.1 at EXISTENCE before the route, as for every read above; without `projectId` it lists the caller's own. */
  projectrequests: ["projectId"],
  /* N193: a document's bundle id. N216's layer-9 reads naming a record object's bundle, or (`determinations`) a project. */
  connectionsasserted: ["bundle"],
  standard: ["id"], standardinforce: ["id"], determination: ["id"], determinations: ["project"], consequence: ["id"],
  escalation: ["id"],
  /* N321 (publication R44): the stage read names the project by its own id; publication answers the same C-70.1 through
     the same `existenceAct`, so the door's answer and the route's agree. */
  projectstage: ["project"],
  /* N345: contradiction's notices and responses name the project a member reads on its own side, and contradiction's first
     refusal for it is the same `existenceAct` (its R50), so the door's answer and the route's agree; the candidates read
     may name a project, or a bundle, as its subject (its R25) — the body's `on: {project}` form is not read here, only a
     top-level field; case-authoring's ceremony read names the publishing project, whose R2 answers the same existence
     first. */
  contradictionnotices: ["project"], contradictionresponses: ["project"], contradictioncandidates: ["project", "bundle"],
  publishtensions: ["project"],
  /* N364: case-authoring's pre-flight names the publishing project, as its ceremony read does, and its first refusal is
     op=publish's own existence answer (its R34 runs op=publish). */
  publishpreflight: ["project"],
  /* R45 (network-notices R22): a project's notices name the project by its own id and answer by the caller's sight. */
  notices: ["project"],
});
export const PROJECT_NAMING_READS_NOT = Object.freeze({
  content: "`id` is a content row's fixed key, hash(capture, extent, chain) — never a bundle id",
  concerns: "`id` is an ENTITY id", connections: "`id` is an ENTITY id", instance: "`id` is an ENTITY id",
  exceptions: "`id` is an ENTITY id", transcription: "`id` is a transcription's content id",
  themeread: "`id` is a THEME id", leadread: "`id` is a LEAD id",
  versionchain: "`address` is a normalised source address, never a bundle id",
  airun: "`run` is a RUN id — a thing inside a project, whose existence is contents",
  airunlog: "`run` is a RUN id — a thing inside a project, whose existence is contents",
  airunspawn: "`run` is a RUN id — a thing inside a project, whose existence is contents",
  /* `biasdebt` (REC-207) reached REC-196's sweep only when the two met. */
  biasdebt: "`run` is a RUN id — a thing inside a project, whose existence is contents",
  reviewcopy: "`draft` is a DRAFT id — a thing inside a project, whose existence is contents",
  casedocument: "`case` is a CASE id, answered by the case door's own fence",
  reading: "`sha256` is a CAPTURE's digest", resolutions: "`sha256` is a CAPTURE's digest",
  textattest: "`sha256` is a CAPTURE's digest", readingname: "`entity` is an ENTITY id",
  entity: "`id` is an ENTITY id", relation: "`id` is a RELATION id", inboxget: "`id` is an INBOX item's id",
  sourcereach: "`address` is a source address", captureprogressions: "`sha256` is a CAPTURE's digest",
  verify: "`sha256` is a published artifact's digest",
  publishedcase: "`id` is a PUBLISHED case — the published record, served to anybody",
  publishededitions: "`id` is a PUBLISHED case — the published record, served to anybody",
  caseflags: "`case` and `target` name a case and its member finding, every field already published",
  /* N89, N193 (N112, K210): `pdfstructure` beside `reading`. */
  archivelookup: "`address` is a source address", pdfstructure: "`sha256` is a CAPTURE's digest",
  contentcrop: "`id` is a content row's fixed key, hash(capture, extent, chain) — never a bundle id",
  filemembership: "`sha256` is a CAPTURE's digest",
  /* N216's layer-9 reads whose id names a row inside a project, never a bundle. */
  comparison: "`id` is a comparison PROPOSAL id — a thing inside a project, whose existence is contents",
  counselpacketread: "`id` is a COUNSEL PACKET id — a thing inside a project, whose existence is contents",
  /* N345's reads whose parameters name a candidate or a referent, never a project's own id. */
  contradictionfacts: "`candidate` is a contradiction CANDIDATE id — a thing inside the record, never a bundle id",
  contradictiontensions: "`referents` (in the body) are a case's claims, legs and extents at their versions, never a project's own id",
  comparisonfacts: "`contradiction` is a contradiction CANDIDATE id and `standardSide` names its side, never a bundle id",
  /* N364's reads: a knock's pseudonym or a capture's digest, never a bundle id. */
  knocksof: "`pseudonym` is a KNOCKER's pseudonym, never a bundle id",
  pulledknocks: "`capture` is a CAPTURE's digest", lateattestations: "`capture` is a CAPTURE's digest",
  captureaccounts: "`capture` is a CAPTURE's digest",
  /* N379: sources' reads, store routes of this door since it dispatches `sourcesOps`: a capture's digest or a source's
     own id, never a bundle id. */
  sourceof: "`capture` is a CAPTURE's digest",
  sourcerung: "`source_id` is a SOURCE id, never a bundle id",
  sourcereadlog: "`source_id` is a SOURCE id, never a bundle id",
  sourcepublishable: "`source_id` is a SOURCE id, never a bundle id",
  /* K921's reads: a filing template's or a local fact's own key, never a bundle id. */
  templateread: "`template` is a TEMPLATE id (`TPL-`) and `version` one of its versions, never a bundle id",
  templatecomments: "`template` is a TEMPLATE id (`TPL-`) and `version` one of its versions, never a bundle id",
  factstatus: "`path` is a local FACT's path in a profile, never a bundle id",
  factsdue: "`paths` are local FACTs' paths in a profile, never a bundle id",
  /* R45's reads naming a published case (case-authoring R39, network-notices R23), never a bundle id. */
  whatchangeddrafts: "`case` is a CASE id, answered by the case's own fence",
  directorysubmission: "`case` is a CASE id and `edition` one of its editions, never a bundle id",
  /* R3 (DEC-113, DEC-36; actions R58): the held-project strip names projects, and answers each one the viewer does not
     see at FULL as `held: null`, never refused, so the existence answer is not run for it. */
  projectholds: "`projects` lists PROJECT ids, and each one the viewer does not see at FULL is answered `held: null` "
    + "(actions R58, DEC-36), never refused, so no existence answer is given for it",
  /* R48's reads (docket R3, R4, R8): a published case, or a docket entry, never a bundle id. */
  docket: "`case` is a published CASE id, answered by the docket's own sight of the case's project (docket R3)",
  docketprepare: "`case` is a published CASE id and `entry` a DOCKET ENTRY id, never a bundle id (docket R4)",
  docketinvitation: "`entry` is a DOCKET ENTRY id, never a bundle id (docket R8)",
  /* R49's reads (case-import R4): an import is its own id, never a bundle id, and case-import answers a viewer who is no
     active member as if no import exists, byte-identically. */
  importedcases: "names nothing: it lists the imports, each a read-only project held apart from the record's bundles, "
    + "and case-import answers a non-member as if none exists (its R4)",
  importedcase: "`import` is an IMPORT's id (the SHA-256 of its source group, case and lens), never a bundle id, and "
    + "case-import answers a non-member with the same bytes as an absent import (its R4)",
  /* T36-48 (K2063): file-safety's reads that take a parameter: a capture's digest, a cursor over its own rows or a
     scanner's finding name, never a bundle id. */
  verdictnotes: "`captureSha` is a CAPTURE's digest", threatof: "`captureSha` is a CAPTURE's digest",
  originalstate: "`captureSha` is a CAPTURE's digest", safeview: "`captureSha` is a CAPTURE's digest",
  safecopy: "`captureSha` is a CAPTURE's digest",
  scanfindings: "`after` is a cursor over file-safety's FINDING notes and `limit` a count, never a bundle id (file-safety R15)",
  findingkind: "`name` is a scanner's FINDING name, explained from the name alone, never a bundle id (file-safety R38)",
  securitytoolevents: "`after` is a cursor over the security tools' EVENTS and `limit` a count, never a bundle id (file-safety R31)",
});

/* R2 (REC-196): the answer for a read naming a discoverable project's own id, asked by a caller at EXISTENCE: C-70.1
   through membership's `existenceAct`, before the route runs. `visibilityOf(id)` is the sight index's setting, so
   `existenceAct` is asked only of an id the index calls discoverable (the cost stated above). */
export function existenceRead(membershipOf, op, url, body) {
  const params = Object.hasOwn(PROJECT_NAMING_READS, op) ? PROJECT_NAMING_READS[op] : null;
  const viewer = url.searchParams.get("viewer");
  if (!params || viewer === null) return null;
  const membership = membershipOf();
  for (const p of params) {
    const fromBody = body && typeof body === "object" && typeof body[p] === "string" ? body[p] : null;
    for (const id of [url.searchParams.get(p), fromBody]) {
      if (typeof id !== "string" || id === "") continue;
      if (membership.visibilityOf(id) !== "discoverable") continue;
      const existence = membership.existenceAct(id, viewer);
      if (existence) return existence;
    }
  }
  return null;
}

/* D-629 / DEC-49 (C-69.4, R6) — WHAT THE STORE ANSWERS WHEN AN OP THREW, and the ONLY place it is built. The catch
   answered `String(e && e.stack || e)` as `error`, so every unhandled throw on every op handed the caller a file's
   path, its line numbers and SQLite's constraint text, and the control plane relayed it. The stack is a diagnostic for
   the operator, so it goes to the operator: logged server-side (`console.error`, the Worker's log stream) under a
   CORRELATION id, the one thing the caller and the log share. The caller receives the code, the canned translation
   and the id — no stack, no message (a thrown message is written for a developer and routinely carries the same
   material), no path. `ok` stays false and the status 500, so every reader of the envelope treats it as no answer. */
export function storeInternalError(e, op) {
  const correlation = crypto.randomUUID();
  const answer = internalAnswer(correlation);
  /* The log line names the code by READING the answer, never by a second literal: one code, one mint site. */
  console.error(JSON.stringify({ event: answer.reason, correlation, op: String(op || "").slice(0, 200),
                                 stack: String(e && e.stack || e) }));
  return answer;
}
function internalAnswer(correlation) {
  const row = DISPATCH_CHECKS.STORE_INTERNAL_ERROR;
  /* DEC-49 REGION is-store-internal-error */
  return { ok: false, error: "internal error", reason: "STORE_INTERNAL_ERROR", code: "STORE_INTERNAL_ERROR",
           check: row.check, translation: row.translation, correlation };
  /* END DEC-49 REGION is-store-internal-error */
}

/* R4 (DEC-113; K1252, K1253; C-69.5) — A PURGE OF HELD MATERIAL IS REFUSED IN THE STORE'S DOOR. In the real record (any
   namespace but `scratch`, the test store), `op=purge` runs only when `actions.purgeHeld({bundleId})` (its R60) answers
   exactly `false`: `true` (a hold stands over what the purge would reach), a throw, a reader never handed and any other
   answer refuse, so a failure to ask is never read as clearance. Asked before record-core's `purge` arm, so nothing is
   cleared, read for proof or written. The refusal names nothing but the `bundleId` asked (null for the whole store): no
   action, project or member. `bundleId` is read as record-core's arm reads it (its R72). */
const PURGE_OP = "purge";
const SCRATCH_NAMESPACE = "scratch";
function purgeHoldRefusal(store, url) {
  /* the object's own name, asked at the purge (plane R2, R14); a name it cannot give reads as the real record's */
  let namespace = null;
  try { namespace = typeof store.namespace === "function" ? store.namespace() : null; } catch { namespace = null; }
  if (namespace === SCRATCH_NAMESPACE) return null;
  const bundleId = url.searchParams.get("bundleId") || null;
  let clear = false;
  try { clear = typeof store.purgeHeld === "function" && store.purgeHeld({ bundleId }) === false; } catch { clear = false; }
  if (clear) return null;
  const row = DISPATCH_CHECKS.PURGE_HOLD_IN_PLACE;
  /* DEC-49 REGION is-purge-hold-in-place */
  return { ok: false, error: "purge refused: a litigation hold is in place", reason: "PURGE_HOLD_IN_PLACE",
           code: "PURGE_HOLD_IN_PLACE", check: row.check, translation: row.translation, bundleId,
           detail: bundleId === null
             ? "a litigation hold is in place, so the whole record cannot be cleared. Nothing was removed."
             : "this bundle is, or may be, material a litigation hold preserves. Nothing was removed." };
  /* END DEC-49 REGION is-purge-hold-in-place */
}

/* R11 (K1674; answers R1, R2): a read served under an ask's grant (the Worker's `grant` stamp) is recorded in the grant's
   read log through `store.logRead` (answers' `logRead`, handed by plane), its answer scrubbed there and answered as
   recorded; `rule` records its own (answers R7). A read that cannot be recorded throws to R6's catch, so it is never
   answered unrecorded.
   R9 (F1; K1874, K1943, K2038, K2041): a credential reaches this door in a header of the request, never in its address:
   `x-bio-session` (a stamped session, and the token admission asks `session` to resolve), `x-bio-grant` (an ask's grant)
   and `x-bio-credential-sha` (the digest admission asks `aicredentiallook` to resolve). A `grant` in the query is not the
   one read here, and it is not logged among the read's arguments either. */
export const SESSION_HEADER = "x-bio-session";
export const GRANT_HEADER = "x-bio-grant";
export const CREDENTIAL_SHA_HEADER = "x-bio-credential-sha";
const headerOf = (req, name) => {
  const v = req.headers.get(name);
  return typeof v === "string" && v !== "" ? v : null;
};
export function grantOf(req) { return headerOf(req, GRANT_HEADER); }
/* R9: each header's value handed to its owner's map on the in-process URL object `store.routes(url, body)` receives (no
   request's address): the session as `session` (credentials' sign-out routes) and `t` (credentials' `session`), the
   grant as `grant` (answers' `rule` and `answercheck`), the digest as `sha` (credentials' `aicredentiallook`). A header
   absent leaves the parameter as the Worker sent it, so the owners' maps are unchanged. */
const HANDED = Object.freeze([[SESSION_HEADER, ["session", "t"]], [GRANT_HEADER, ["grant"]], [CREDENTIAL_SHA_HEADER, ["sha"]]]);
function handOn(req, url) {
  for (const [name, keys] of HANDED) {
    const v = headerOf(req, name);
    if (v !== null) for (const k of keys) url.searchParams.set(k, v);
  }
}
function underGrant(store, grant, asked, op, body, answer) {
  if (!grant || op === "rule" || !askAdmits(op)) return answer;
  const { grant: _g, viewer, ...args } = asked;
  return store.logRead({ grant, op, args: { ...args, ...(body && typeof body === "object" ? body : {}) }, answer, viewer });
}

/* R10 (DEC-152, DEC-153; K1755, K1837): THE ASSISTANT, RESOLVED PER ACT BEFORE A DRAFT'S HANDLER. For the stamped member
   `by`, in this order: an administrator's own act (`groupdescriptiondraft`) refuses anyone else membership's
   `NOT_AN_ADMIN` (its R84); instance-setup's switch, `ASSISTANT_OFF` (its R55); ai-runs' check before any model call,
   `AI_NO_ACCOUNT` and the two ceilings (its R50, R52); then the account credentials answers for the member's act (its
   R35), any other refusal of it relayed as given. Admitted, the handler receives `{on, account: {kind, level}}`: which
   account serves, never the key, which stays in credentials. */
async function assistantFor(ctx, by, adminOnly) {
  const member = typeof by === "string" && by ? by : null;
  if (adminOnly && !membershipOf(ctx).isAdministrator(member && member.startsWith("member:") ? member.slice(7) : member))
    return { refusal: notAnAdmin(member, "asking the assistant to draft the group's description") };
  const off = instanceSetupOf(ctx).assistantGate();
  if (off) return { refusal: off };
  const use = aiRunsOf(ctx).aiUseCheck({ member });
  if (use) return { refusal: use };
  const account = await credentialsOf(ctx).accountFor({ member, act: { kind: "ask", member } });
  if (!account || account.ok !== true) return { refusal: account || { ok: false, reason: "NO_ACCOUNT" } };
  return { assistant: { on: true, account: { kind: account.kind, level: account.level } } };
}

/* R1: the frame. `store.routes(url, body)` answers the route map, `store.membership()` membership for R2;
   `store.namespace()` (the object's own name, plane R2) and `store.purgeHeld({bundleId})` (`actions`' R60 reader, plane
   R14), each a function asked at a purge and never before, for R4. The headers' credentials (R9) are set on the URL the
   map receives, and the grant is also handed as its third argument, which this module's `askcheck` (R11) reads. */
export async function dispatch(req, store) {
  const url = new URL(req.url);
  const op = url.pathname.slice(1);
  /* D-39. An empty POST body used to throw here, BEFORE any op was dispatched, so the caller saw a Cloudflare worker
     exception (error 1101) rather than a BIO refusal. An absent body is null, which is what a GET already passes; a
     body that is present but not JSON is refused by name. */
  let body = null;
  if (req.method === "POST") {
    const raw = await req.text();
    if (raw.trim() !== "") {
      try { body = JSON.parse(raw); }
      catch {
        return Response.json({ ok: false, reason: "BAD_JSON",
          detail: "the request body is not valid JSON" }, { status: 400 });
      }
    }
  }
  /* REC-30: the envelope carries no wall-clock field; a timing a caller did not ask for is a signal about work and a
     hazard for the byte comparisons the D-15 posture rests on. */
  try {
    const grant = grantOf(req);
    /* the read's own parameters, taken before the headers' credentials are handed on, so none is logged (R11) */
    const asked = Object.fromEntries(url.searchParams);
    handOn(req, url);
    const map = store.routes(url, body, grant);
    /* R1: the map's own keys only, so an inherited name (`toString`, `constructor`) is no route. */
    if (!Object.hasOwn(map, op)) return Response.json({ ok: false, error: "unknown op: " + op }, { status: 400 });
    if (op === PURGE_OP) {
      const held = purgeHoldRefusal(store, url);
      if (held) return Response.json(held, { status: 409 });
    }
    const existence = existenceRead(() => store.membership(), op, url, body);
    if (existence) return Response.json({ ok: true, result: existence });
    const answer = await map[op]();
    /* R13 (K2157; control-plane R61): a byte answer (file-safety's `openoriginal`, `openwithwarning`, `safeview`,
       `safecopy`) is a Response, returned as its owner made it: never wrapped, so its status, headers and bytes reach the
       Worker unchanged. No ask's grant admits these ops (answers' scope), so none is a read R11 logs. */
    if (answer instanceof Response) return answer;
    return Response.json({ ok: true, result: underGrant(store, grant, asked, op, body, answer) });
  } catch (e) {
    return Response.json(storeInternalError(e, op), { status: 500 });
  }
}

/* N364, N13: the routes this module adds to plane's one map (plane R5), each passing R1's frame: queue's, tasks' and
   affordances' maps; `sources`' own map (N379, K566: its acts, its reads and the no-account `knockerconsent`, which no
   other module dispatches); the two own-key acts, credentials' since layer 2 (K757, K784), which credentials keeps out of
   its map (`by` spread, then overridden, as `signeradd`); R8's unattributed refusal count (`wizardrefusaltally`, the
   Worker's tally of a refusal it answered to a member's session, handed to `wizard-scripts.tallyRefusal` with the op and
   the code alone; store-internal, op-declarations R6, so no caller reaches it, as capture's `doorbellrefused`); R7's
   pull, a route of its own beside capture's `inboxpull`, which the Worker's `op=inboxpull` (and `op=inboxresolve` at
   `pulled`) addresses; R11's ask routes; and R10's two drafts. The map keeps control-plane's name for it, so plane's
   composition is unchanged. */
export function controlPlaneRoutes(ctx, url, body, grant = null) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" && !Array.isArray(body) ? body : {};
  /* sources' instance is made only when one of its routes runs (its map's closures read it at the call), so no other
     route builds it. */
  const sourceRoutes = Object.fromEntries(Object.keys(sourcesOps(null, url, body))
    .map((op) => [op, () => sourcesOps(sourcesOf(ctx), url, body)[op]()]));
  /* N13: queue's, tasks' and affordances' own maps (the `membershipOps` pattern), dispatched here (once legacy-store's,
     deleted at T20), made the same way: an instance is reached only when one of its routes runs. */
  const lazily = (ops, of) => Object.fromEntries(Object.keys(ops(null, url, body)).map((op) => [op, () => ops(of(ctx), url, body)[op]()]));
  return {
    ...lazily(queueOps, queueOf),
    ...lazily(tasksOps, tasksOf),
    /* N13 (K723 A): affordances' facts route (its R13–R16), the facts `op=affordances` derives an object's acts from. */
    ...lazily(affordancesOps, affordancesOf),
    ...sourceRoutes,
    signerregister: () => credentialsOf(ctx).signerRegisterOwn({ ...b, by: q("by") }),
    signerrevoke: () => credentialsOf(ctx).signerRevokeOwn({ ...b, by: q("by") }),
    wizardrefusaltally: () => wizardScriptsOf(ctx).tallyRefusal(b.op, b.code),
    /* R11 (K1674): the Worker's question whether a token is a live ask grant admitting the op (credentials R28),
       store-internal as `wizardrefusaltally`. */
    aigrantadmit: () => credentialsOf(ctx).aiGrantAdmit({ token: b.token, op: b.op, write: b.write }),
    /* R11 (K1685; agent-worker R54): the ask's own calls, each its owner's, the member the stamped viewer: the ceiling
       before any model call (ai-runs R50's `aiUseCheck`; `{ok: true}` when under it), each call's use counted as an
       ask's (its R48), and the answer checked over the grant's read log (answers R4), the grant the header's (R9). */
    askceiling: () => aiRunsOf(ctx).aiUseCheck({ member: q("viewer") }) ?? { ok: true },
    /* K1798 (ai-runs R48): `calls`, the model calls the usage covers, so an ask of N calls counts N (absent, one). */
    /* K1986: the mode it is given (an ask's `ask`, a draft's `draft`, control-plane R57), `ask` when none is sent; ai-runs
       refuses any other (its R48). */
    askusage: () => aiRunsOf(ctx).countAskUsage({ member: q("viewer"), mode: b.mode ?? "ask", usage: b.usage ?? null, calls: b.calls }),
    askcheck: () => answersOf(ctx).check({ answer: b.answer ?? null, grant, viewer: q("viewer"), mode: "ask" }),
    /* R10: the two drafts, routed here over their owners' map entries (plane spreads this map last), the assistant
       resolved first (`assistantFor`); the handler's own arguments from the body, the stamps from the query, and a
       caller's `assistant` never read. */
    groupdescriptiondraft: async () => {
      const a = await assistantFor(ctx, q("by"), true);
      return a.refusal ?? instanceSetupOf(ctx).groupDescriptionDraft({ answers: b.answers, assistant: a.assistant,
                                                                       viewer: q("viewer"), by: q("by") });
    },
    writinghelp: async () => {
      const a = await assistantFor(ctx, q("by"), false);
      return a.refusal ?? wizardScriptsOf(ctx).writingHelp({ op: b.op, field: b.field, told: b.told, draftHeld: b.draftHeld,
                                                             assistant: a.assistant, by: q("by"), viewer: q("viewer") });
    },
    inboxpullfile: () => pullAndFile({ capture: captureOf(ctx), promotion: promotionOf(ctx), record: recordOf(ctx),
                                       provenance: provenanceOf(ctx) },
                                     { knockId: (typeof b.knockId === "string" && b.knockId) || q("id"),
                                       by: q("by"), identity: q("identity"), viewer: q("viewer"),
                                       /* R7 (capture R32; DEC-88 (2)): the `pulled` resolve, marked by the Worker's
                                          own stamp, carries the body's reason; a direct pull carries none */
                                       ...(q("resolve") === "pulled" ? { resolve: true, reason: b.reason } : {}) }),
  };
}
