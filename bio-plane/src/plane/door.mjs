/* plane R6: the hooks `control-plane`'s `makeFetch` takes, composed from the arms' owners' handlers. Moved from
   `src/index.mjs` (legacy-index map §1a, "composition root"; K846) once each arm's owner had taken its handler: what is
   left is which handler answers which op, and the stamps and helpers each is handed. Every stamp is control-plane's,
   set from the authenticated caller; every answer is the handler's (R9). */
import { bootstrapOp, INSTANCE_SETUP_OPS, instanceSetupOp } from "../setup.mjs";
import { caseRatifyStatement, NS_RATIFY } from "../sshsig.mjs";
import { MACHINE_AUTHOR_PREFIX, MACHINE_CLASS_PREFIX } from "../record-grammar/actors.mjs";
import { publicReadDoorOp } from "../public-read/door.mjs";
import { publicationDoorOp } from "../publication/door.mjs";
import { affordancesOp } from "../affordances.mjs";
import { QUEUE_DOOR_OPS, queueOp } from "../queue/door.mjs";
import { registerAuditOp } from "../provenance/ops.mjs";
import { attestOp } from "../attestation/index.mjs";
import { withBiasChecks } from "../bias/index.mjs";
import { GOVERNOR_OPS, governorOpResponse } from "../host-governor/index.mjs";
import { capturePublicOp } from "../capture/doorbell.mjs";
import { captureOp } from "../capture/ops.mjs";
import { monitorOp } from "../monitoring/index.mjs";
import { EXTRACTION_OPS, extractionOp, acquireReadingOp } from "../extraction/ops.mjs";
import { CONNECTIONS_OPS, connectionsOp } from "../connections/ops.mjs";
import { ratificationOp } from "../ratification/ops.mjs";
import { ACT_GATE } from "../op-declarations/index.mjs";
import { json, doAnswer, storeSilent, storeRefusal, STORE_SILENT_REASON, STORE_SILENT_DETAIL, SCRATCH, sha256Hex,
         caseReader, captureKey, requiredArgument, storageAbsent } from "../control-plane/index.mjs";

/* The public ops: each owner's handler asked in turn; the bootstrap report answers any other. */
export async function publicOp({ req, url, env, op, stub, fp, presentedAi }) {
  { const pr = await publicReadDoorOp(op, url, env, stub, { json, requiredArgument, storeSilent, storeRefusal, doAnswer }); if (pr) return pr; }
  { const pd = await publicationDoorOp(op, url, stub, { json, storeSilent, storeRefusal, doAnswer, sha256Hex, NS_RATIFY,
      caseRatifyStatement, readerOf: () => caseReader(url, env, "bio", presentedAi.cred) }); if (pd) return pd; }
  /* Anyone, no token, no session: capture's doorbell, confined to the inbox namespace. */
  { const knocked = await capturePublicOp(op, req, env, stub, { json, requiredArgument, storeSilent, storeRefusal, doAnswer }); if (knocked) return knocked; }
  return bootstrapOp(url, env, fp, { stub, json, storeSilent, storeRefusal, doAnswer });
}

/* The admitted ops whose handler is a module's door; undefined for control-plane's generic forward. */
export async function gatedOp({ req, url, env, op, cls, viaSession, sessMember, sessViewer, sessIdentity, sessRights,
                                sessCaps, aiCred, storeName, stub }) {
  const store = () => env.STORE.get(env.STORE.idFromName(storeName));
  /* The stamps, from the authenticated caller: a session's member, viewer and identity; an `ai` credential's principal
     where the act reads its member (REC-134); a binding class as `class:<cls>`, or `token:<cls>` as an author (D-311). */
  const viewer = viaSession ? sessViewer : `${MACHINE_CLASS_PREFIX}${cls}`;
  const principalViewer = viaSession ? sessViewer : cls === "ai" ? aiCred.principal : `${MACHINE_CLASS_PREFIX}${cls}`;
  const identity = viaSession ? sessIdentity : cls === "ai" ? aiCred.principal : `${MACHINE_CLASS_PREFIX}${cls}`;
  const author = viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`;
  const by = viaSession ? sessMember : `${MACHINE_CLASS_PREFIX}${cls}`;

  if (op === "affordances")
    return affordancesOp(url, store(), { json, doAnswer, storeSilent, storeRefusal, gate: ACT_GATE, viewer, identity, author,
      by, storeName, cls });
  if (QUEUE_DOOR_OPS.includes(op)) return queueOp(op, url, store, { json, doAnswer, storeRefusal, storeSilent, gate: ACT_GATE,
    storeName, cls, viewer, member: viaSession ? sessMember : "" });
  if (op === "registeraudit") return registerAuditOp(env, store(), { json, doAnswer, storeSilent, storeRefusal, captureKey,
    storeName, cls });
  if (INSTANCE_SETUP_OPS.includes(op)) return instanceSetupOp(op, url, env, storeName, { cls, scratch: SCRATCH, json, doAnswer,
    storeSilent, storeRefusal, viewer: principalViewer });
  if (CONNECTIONS_OPS.includes(op)) return connectionsOp(op, url, store, { json, doAnswer, storeRefusal, storeSilent,
    viewer: principalViewer, identity });
  if (GOVERNOR_OPS.includes(op)) return governorOpResponse(op, url, store, { json, doAnswer, storeRefusal, storeSilent });
  {
    const c = await captureOp(op, req, url, env, store, { json, storeSilent, storeRefusal, doAnswer, storageAbsent,
      requiredArgument, cls, member: viaSession, sessMember, storeName, key: (s) => captureKey(storeName, s), viewer,
      readAcquired: (answer, st) => acquireReadingOp(answer, st, { json, storeSilent, storeRefusal, doAnswer, storeName }) });
    if (c) return c;
  }
  if (EXTRACTION_OPS.includes(op)) return extractionOp(op, url, env, store, { json, storeSilent, storeRefusal, doAnswer,
    storageAbsent, requiredArgument, cls, session: viaSession, caps: sessCaps, viewer, author, storeName });
  if (op === "attest") return attestOp(req, env, store(), { json, doAnswer, storageAbsent, captureKey, storeName, cls });
  if (op === "monitor") return monitorOp(req, store(), { json, storeSilent, storeRefusal, requiredArgument, doAnswer,
    viaSession, sessViewer, storeName, cls });
  return ratificationOp(op, req, stub, { env, json, doAnswer, storeSilent, storeRefusal, storeName, cls, aiCred, viaSession,
    sessViewer, sessRights, withBiasChecks, STORE_SILENT_REASON, STORE_SILENT_DETAIL });
}
