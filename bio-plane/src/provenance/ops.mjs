/* provenance's ops (requirements: `build/requirements/provenance.md`). One at the Worker (R8, R9), moved out of
 * `legacy-index`' `src/index.mjs` at T18 (the legacy-index map's §4.4 plain move, K649 (7); PROCESS-MECHANICS §12.2):
 * the control plane routes to it and hands in its envelope helpers (`json`, `doAnswer`, `storeSilent`,
 * `storeRefusal`), the evidence store's key for a digest (`captureKey`) and its stamps; it answers the Response the arm
 * answered before the move, byte for byte. And the store's route arms as one ops map (`provenanceOps`, R53), written
 * at T19 from the legacy store's explicit arms (K671), now spread by the plane store (`src/plane/store.mjs`); the
 * legacy store is retired. `op=attest`'s Worker arm is `attestation`'s, and the three route arms
 * (`provenancechain`, `provenanceroute`, `provenanceroutes`) are `provenance-routes`' `provenanceRouteOps` (N512);
 * the `attestOp` copy held here through T25 was deleted in T26 (N516). */

import { registerAuditReport } from "./index.mjs";
import { localize } from "../setup-words/index.mjs";

/* The body's spellings of an author a caller might send to op=testify, every one collected so that naming the person
   under a synonym is no way round C-53.2's refusal (R28, R53). */
const CLAIMED_AUTHOR_KEYS = ["author", "observer", "authoredBy", "authored_by", "by", "member", "memberId"];

/** R53 (`build/extraction/legacy-store.md` §4.2 (6); the `membershipOps` pattern): the module's eight route arms, keyed
 *  by op name, each a function of no arguments answering what its service answers, its parameters read from `url`'s
 *  query, where the control plane stamps `viewer` and `author` (never from the body), today's behaviour of the legacy
 *  store's explicit arms. `observer` is the module whose receipt listener's outcome `recordcapturedlocator`
 *  reports (the composition root names it; this module names no later module, R47). Which credential reaches each op
 *  is `op-declarations`' and `control-plane`'s, never this map's. */
export function provenanceOps(provenance, url, body, { observer = null } = {}) {
  const q = (k) => url.searchParams.get(k);
  /* a field the arm reads: the body's when it states one, else the query's (R64) */
  const field = (k) => (body && typeof body === "object" && body[k] !== undefined && body[k] !== null ? body[k] : q(k));
  return {
    /* MK-1 / IC-133: TESTIFY. The author is the query's stamp, which the control plane set over anything the caller
       put there; the body's own author fields are read only to be refused (C-53.2). */
    testify: () => provenance.testify({
      words: body ? body.words : null,
      observedAt: body ? body.observedAt : null,
      title: body ? body.title : null,
      author: q("author"),
      claimedAuthor: body ? (CLAIMED_AUTHOR_KEYS.map((k) => body[k]).find((v) => v !== undefined && v !== null) ?? null) : null,
    }),
    /* PL-10 / D-220: the version chain. `address` arrives already normalised by the control plane, with the
       normaliser the capture wrote the row with; an absent viewer fails closed. */
    versionchain: () => provenance.versionChain({ addressNorm: q("address"), at: q("at"), limit: q("limit"),
                                                  offset: q("offset"), viewer: q("viewer") }),
    /* The plane's own acquisition receipt (R13, R14, R47): the listeners' context taken out of the body, the rest the
       receipt; a recorded one reports what the observer's listener did with it. */
    recordcapturedlocator: () => {
      const { authorityKind = null, authority = null, actorClass = "plane", actor = null, observe = true, ...receipt } = body || {};
      const r = provenance.recordReceipt({ ...receipt, context: { authorityKind, authority, actorClass, actor, observe } });
      if (!r.recorded) return r;
      const look = observer ? (r.listeners || []).find((l) => l.module === observer) : null;
      return { recorded: true, address_norm: r.address_norm, via: r.via, observation: r.observation,
               observation_written: !!(look && look.outcome === "ran" && look.answer && look.answer.written === true),
               observation_refused: look && look.outcome === "refused" ? look.answer : null };
    },
    /* R64 (T51; K4166, C23): a member's declared origin for a document. The system is read from the body, else the query;
       the declarer and the viewer are the control plane's stamps, never fields a caller sends. */
    declareorigin: () => provenance.declareOrigin({ bundleId: field("bundleId"), system: field("system"),
                                                    by: q("author"), viewer: q("viewer") }),
    /* R70 (T51; K4259): every declared origin of a document, oldest first; the viewer is the control plane's stamp. */
    origins: () => provenance.originsOf({ bundleId: field("bundleId"), viewer: q("viewer") }),
    /* R80 (T51; K5148): the standing authority of a document's captures, the read a member's screen uses; the viewer is the
       control plane's stamp. */
    authority: () => provenance.authoritiesOf({ bundleId: field("bundleId"), capture: field("capture"), viewer: q("viewer") }),
    /* REC-190: the census of displaced homes, read-only. */
    homecensus: () => provenance.homeCensus({ limit: q("limit") }),
    /* D-476: does the register hold these whole-document bytes, read-only and naming no bundle. */
    registerholds: () => provenance.registerHolds({ sha: q("sha256"), bundle: q("bundle") }),
    /* D-9, D-533: every register row classified; the Worker's op=registeraudit probes the rest (R8, R9). */
    registeraudit: () => provenance.registerRows(),
  };
}

/** op=registeraudit (R8, R9): the store's classification of every register row, finished here by probing each
 *  unresolved row in the working bucket (D-533's parts included). */
export async function registerAuditOp(env, store, { json, doAnswer, storeSilent, storeRefusal, captureKey, storeName, cls }) {
  /* REC-52: this one CRASHED rather than lied — `r.unresolved` on an absent
     result throws a TypeError and the caller gets a platform 500 — so it is
     the less dangerous half of the class. It is converted anyway, because
     the answer below is a SOUNDNESS VERDICT about the register ("sound:
     true") and an audit that reports on a register it could not read is the
     worst possible place to be one line away from a false clean bill. */
  const aOut = await doAnswer(store.fetch("http://do/registeraudit"));
  if (aOut.refused) return storeRefusal(aOut);
  if (!aOut.answered) return storeSilent("registeraudit", aOut.correlation);
  if (!aOut.result) return storeSilent("registeraudit");
  /* R8, R9: provenance's report, each unresolved row probed in the working bucket (D-533's parts included). */
  return json({ ok: true, result: await registerAuditReport(aOut.result, typeof env.CAPTURES?.head === "function"
    ? { head: (sha) => env.CAPTURES.head(captureKey(storeName, sha)), get: (sha) => env.CAPTURES.get(captureKey(storeName, sha)) }
    : null), store: storeName, tokenClass: cls }, 200);
}

/* R68, R69, R70 (T51; K4168, K4202, K4259; op-declarations R80, op-grades R49): the ops this module serves that the screens send or that this
   tranche adds, declared by their owner beside the ops map. `testify`'s class, weight and description are the op's existing rows'
   (`op-declarations`, `op-grades`) and its fields what its arm reads: the body's `words`, `observedAt` and `title`; a body field
   naming an author is no field but a claim the arm refuses (C-53.2). `declareorigin` is new, so this is its whole declaration:
   a session act whose declarer is the plane's `author` stamp, refused a machine by name (R29). */
export const DECLARED_OPS = Object.freeze({
  testify: { classes: ["admin","member"], mutating: true, weight: "reasoned", description: localize("provenance.declared.testify", "creation: a member records a firsthand observation, which becomes a NEW authored document; acts on no existing bundle"),
    fields: { accepts: ["words","observedAt","title"], requires: ["words","observedAt"] } },
  declareorigin: { classes: ["admin","member"], mutating: true, stamps: ["viewer","author"], needs: "contribute", weight: "reversible",
    description: localize("provenance.declared.declareorigin", "document-directed: a member states, with their name and the date, the system a document came from, keyed by bundleId; a second declaration is added beside the first and never replaces it, and the document itself does not change"),
    fields: { accepts: ["bundleId","system"], requires: ["bundleId","system"] } },
  authority: { classes: ["admin","member"], mutating: false, stamps: ["viewer"], needs: null, weight: "read",
    description: localize("provenance.declared.authority", "document-directed: states, for each captured file of a document, who issued it as the record now stands, with the dated basis and whether a member reviewed it and could not tell; a decision made by a member is stated here and nothing is changed"),
    fields: { accepts: ["bundleId","capture"], requires: ["bundleId"] } },
  origins: { classes: ["admin","member"], mutating: false, stamps: ["viewer"], needs: null, weight: "read",
    description: localize("provenance.declared.origins", "document-directed: lists, oldest first, every system members have declared a document came from, with who declared it and when; the latest is the standing one, and nothing is changed"),
    fields: { accepts: ["bundleId"], requires: ["bundleId"] } },
});
