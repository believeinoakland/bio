/* control-plane: THE RECORD STORE'S DOOR (R25–R27, R46). `dispatch(req, store)` is the one frame every Durable Object
   request passes: the body read, the route looked up in the modules' own maps (the `membershipOps` pattern;
   `store.routes(url, body)`, the union `plane` composes, its R5), the existence answer of a read naming a discoverable
   project (R27), a purge's hold check (R46), the `{ok: true, result}` envelope, and the one catch (R25). Moved from
   legacy-store's `Store.fetch` at control-plane's extraction (built T12, K93; re-applied T13 by N333). The Durable Object
   class whose `fetch` this is is `plane`'s (its R1, was this module's R35, moved at T19), which also spreads
   `controlPlaneRoutes` below into its map. */
import { credentialsOf } from "../credentials/index.mjs";
import { captureOf } from "../capture/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { recordOf } from "../record-core/index.mjs";
import { sourcesOf, sourcesOps } from "../sources/index.mjs";
import { queueOf, queueOps } from "../queue/index.mjs";
import { tasksOf, tasksOps } from "../tasks/index.mjs";
import { affordancesOf, affordancesOps } from "../affordances.mjs";
import { DISPATCH_CHECKS } from "./checks.mjs";
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
 * reason, and R27's tests (`test/m/control-plane/dispatch.test.mjs`, `routes.test.mjs`, `doorbell.test.mjs`) hold each
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
  /* R47 (DEC-113, DEC-36; actions R58): the held-project strip names projects, and answers each one the viewer does not
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
});

/* R27 (REC-196): the answer for a read naming a discoverable project's own id, asked by a caller at EXISTENCE: C-70.1
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

/* D-629 / DEC-49 (C-69.4, R25) — WHAT THE STORE ANSWERS WHEN AN OP THREW, and the ONLY place it is built. The catch
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

/* R46 (DEC-113; K1252, K1253; C-69.5) — A PURGE OF HELD MATERIAL IS REFUSED IN THE STORE'S DOOR. In the real record (any
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

/* R26: the frame. `store.routes(url, body)` answers the route map, `store.membership()` membership for R27;
   `store.namespace()` (the object's own name, plane R2) and `store.purgeHeld({bundleId})` (`actions`' R60 reader, plane
   R14), each a function asked at a purge and never before, for R46. */
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
    const map = store.routes(url, body);
    /* R26: the map's own keys only, so an inherited name (`toString`, `constructor`) is no route. */
    if (!Object.hasOwn(map, op)) return Response.json({ ok: false, error: "unknown op: " + op }, { status: 400 });
    if (op === PURGE_OP) {
      const held = purgeHoldRefusal(store, url);
      if (held) return Response.json(held, { status: 409 });
    }
    const existence = existenceRead(() => store.membership(), op, url, body);
    return Response.json({ ok: true, result: existence ?? await map[op]() });
  } catch (e) {
    return Response.json(storeInternalError(e, op), { status: 500 });
  }
}

/* N364, N13: the routes this module adds to plane's one map (plane R5), each passing R26's frame: queue's, tasks' and
   affordances' maps; `sources`' own map (N379, K566: its acts, its reads and the no-account `knockerconsent`, which no
   other module dispatches); the two own-key acts, credentials' since layer 2 (K757, K784), which credentials keeps out of
   its map (`by` spread, then overridden, as `signeradd`); and R36's pull, a route of its own beside capture's `inboxpull`, which the Worker's
   `op=inboxpull` (and `op=inboxresolve` at `pulled`) addresses. */
export function controlPlaneRoutes(ctx, url, body) {
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
    inboxpullfile: () => pullAndFile({ capture: captureOf(ctx), promotion: promotionOf(ctx), record: recordOf(ctx),
                                       provenance: provenanceOf(ctx) },
                                     { knockId: (typeof b.knockId === "string" && b.knockId) || q("id"),
                                       by: q("by"), identity: q("identity"), viewer: q("viewer"),
                                       /* R36 (capture R32; DEC-88 (2)): the `pulled` resolve, marked by the Worker's
                                          own stamp, carries the body's reason; a direct pull carries none */
                                       ...(q("resolve") === "pulled" ? { resolve: true, reason: b.reason } : {}) }),
  };
}
