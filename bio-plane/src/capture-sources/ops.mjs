import { localize } from "../setup-words/index.mjs";
/* capture-sources' credential ops (requirements: `build/requirements/capture-sources.md`, R66, R67; C20). Supplying a source login so
 * that a refused capture can be retried (capture-requests R42) was a library method only; this is its door: the three ops over
 * `credentialsOf` (R55, R57, R58), one ops map for the composition root to spread beside the others (the `membershipOps` pattern). */

/** R66: the module's arms, keyed by op name, each a function of no arguments answering what its service answers. `credentials` is
 *  this module's instance (`credentialsOf`). The supplier and the withdrawer are the control plane's stamp `by` (a member's id for a
 *  session, `class:<cls>` for a machine credential, which names no member and is refused R55's `CAPTURE_CREDENTIAL_NOT_A_MEMBER`),
 *  and the viewer its stamp `viewer`: both come from `url`, never from the body. The secret is read from the body alone, so no
 *  address and no log line of the request can carry it, and no arm answers anything but what R55, R57 and R58 answer (R60). */
export function captureSourcesOps(credentials, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" && !Array.isArray(body) ? body : {};
  return {
    capturecredentialsupply: () => credentials.credentialSupply({ kind: b.kind, host: b.host, secret: b.secret, scope: b.scope,
                                                                   project: b.project, by: q("by") }),
    capturecredentiallist: () => credentials.credentialList({ viewer: q("viewer"), scope: b.scope ?? q("scope"),
                                                              project: b.project ?? q("project"), limit: b.limit ?? q("limit") }),
    capturecredentialwithdraw: () => credentials.credentialWithdraw({ credential: b.credential ?? q("credential"), by: q("by") }),
  };
}

/* R67 (T51; K4168, op-declarations R80, op-grades R49): the ops this module serves, declared by their owner beside the ops map. They
   are new ops, so this is their whole declaration. Session acts: no machine credential reaches one (`machineClasses: []`); the
   credential's scope and who may supply and withdraw at it are R63's, decided in the service. */
export const DECLARED_OPS = Object.freeze({
  capturecredentialsupply: { classes: ["admin","member"], machineClasses: [], mutating: true, stamps: ["viewer","by"], needs: "contribute", weight: "credential",
    description: localize("capture-sources.declared.capturecredentialsupply", "credential-directed: stores a login a member supplies for one source host, sealed, so a refused capture can be retried; the secret is never shown again or exported, and a machine cannot supply one"),
    fields: { accepts: ["kind","host","secret","scope","project"], requires: ["kind","host","secret","scope"] } },
  capturecredentiallist: { classes: ["admin","member"], machineClasses: [], mutating: false, needs: null, weight: "read",
    description: localize("capture-sources.declared.capturecredentiallist", "read: the source logins the viewer may see, who supplied each and when, never a secret, any part of it, its length or a digest"),
    fields: { accepts: ["scope","project","limit"], requires: [] } },
  capturecredentialwithdraw: { classes: ["admin","member"], machineClasses: [], mutating: true, stamps: ["viewer","by"], needs: "contribute", weight: "credential",
    description: localize("capture-sources.declared.capturecredentialwithdraw", "credential-directed: destroys a stored source login, its sealed secret included; the source's requests are turned away again until a new one is supplied"),
    fields: { accepts: ["credential"], requires: ["credential"] } },
});
