/* control-plane: THE RECORD STORE'S DOOR (R25–R27). `dispatch(req, store)` is the one frame every Durable Object request
   passes: the body read, the route looked up in the modules' own maps (the `membershipOps` pattern; `store.routes(url,
   body)`, legacy-store's method until each module takes its own), the existence answer of a read naming a
   discoverable project (R27), the `{ok: true, result}` envelope, and the one catch (R25). Moved from legacy-store's
   `Store.fetch` at control-plane's extraction (built T12, K93; held by K412, re-applied T13 by N333); `Store` here is the Durable Object class, legacy-store's
   wrapped, so the frame is this module's and the routes stay where they are. */
import { Store as LegacyStore } from "../store.mjs";
import { membershipOf } from "../membership/index.mjs";
import { instanceSetupOf, instanceSetupOps } from "../setup.mjs";
import { DISPATCH_CHECKS } from "./checks.mjs";

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
 * reason, and `project-sight.test.mjs` §11 sweeps every id-carrying read op into exactly one of the two tables, so a
 * new read cannot join the plane unclassified.
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
  /* c22-batch29 (REC-196 x REC-150): REC-150's requests read names the project by its own id, so the door answers
     C-70.1 at EXISTENCE before the route, as for every read above; without `projectId` it lists the caller's own. */
  projectrequests: ["projectId"],
  /* N193: a document's bundle id. N216's layer-9 reads naming a record object's bundle, or (`determinations`) a project. */
  connectionsasserted: ["bundle"],
  standard: ["id"], standardinforce: ["id"], determination: ["id"], determinations: ["project"], consequence: ["id"],
  escalation: ["id"],
  /* N321 (publication R44): the stage read names the project by its own id; publication answers the same C-70.1 through
     the same `existenceAct`, so the door's answer and the route's agree. */
  projectstage: ["project"],
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
  /* c22-batch29: `biasdebt` (REC-207, on main) reached REC-196's sweep only at this union. */
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

/* R26: the frame. `store.routes(url, body)` answers the route map, `store.membership()` membership for R27. */
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
    const existence = existenceRead(() => store.membership(), op, url, body);
    return Response.json({ ok: true, result: existence ?? await map[op]() });
  } catch (e) {
    return Response.json(storeInternalError(e, op), { status: 500 });
  }
}

/* K93: the Durable Object class is this module's. Legacy-store's class keeps its construction and its routes; its
   `fetch` is this module's `dispatch`. The two tables are carried as statics too, where their readers find them.
   R35 (N348): this module is the composition root. At construction it starts `instance-setup` once per object (its
   `start` is idempotent on one storage, so a second construction, or a wrapper that also starts it, starts nothing),
   and instance-setup's routes join the one route map beside legacy-store's, so they pass R26's body read and envelope,
   R27's existence read and R25's catch like every other route. */
export class Store extends LegacyStore {
  static PROJECT_NAMING_READS = PROJECT_NAMING_READS;
  static PROJECT_NAMING_READS_NOT = PROJECT_NAMING_READS_NOT;
  constructor(ctx, env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => instanceSetupOf(ctx, env).start());
  }
  async fetch(req) {
    return dispatch(req, {
      routes: (url, body) => ({ ...this.routes(url, body), ...instanceSetupOps(instanceSetupOf(this.ctx, this.env), url, body) }),
      membership: () => membershipOf(this.ctx),
    });
  }
}

/* legacy-store's own default export, carried with the class: a bare forwarder to `bio`, so a harness that runs the record
   store alone as a Worker names this file where it named `store.mjs`. The instance's Worker is legacy-index's. */
export default {
  fetch(req, env) {
    return env.STORE.get(env.STORE.idFromName("bio")).fetch(req);
  },
};
