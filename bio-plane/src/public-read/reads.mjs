/* public-read — the registered public reads' shared terms (requirements: `build/requirements/public-read.md` R18, R10),
 * read by both halves: the store side's registry (`./index.mjs`) and the door's relay (`./door.mjs`).
 *
 * A later module registers once at start a set of named, credential-free reads (K31's pattern, as R8's evidence block
 * is filled). Each read declares the query parameters it takes, and only those reach it; a parameter that carries a
 * credential, or a stamp the door sets from one (`control-plane` R17), can never be declared, so no registered read can
 * be handed one (R10: no credential). The names are an op's spelling, so the door can route one as `op=<name>`. */

/* A registered read's name: lowercase letters and digits, as an op is spelled. */
export const PUBLIC_READ_NAME = /^[a-z][a-z0-9]{0,63}$/;

/* A parameter a read declares: a query key's spelling. */
export const PUBLIC_READ_PARAM = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;

/* The ops this module answers itself, store side and door side; no registered read may take one of their names. */
export const PUBLIC_READ_OWN_OPS = Object.freeze(["verify", "publishedmanifest", "publishedcase", "publishedbytes",
                                                  "publishedlist", "publishededitions", "publicread"]);

/* R10's terms: what no registered read may declare and the door never forwards. The credentials and the door's routing
   keys (`token`, `op`, `store`, `secret`, `secretSha`, `bySecret`), every stamp the door sets from a caller (`control-plane`
   R17's query stamps, and those it sets on a forward: `principal`, `proposedBy`), and `name`, which names the read. */
export const PUBLIC_READ_RESERVED_PARAMS = Object.freeze(["name", "token", "op", "store", "secret", "secretSha", "bySecret",
  "viewer", "identity", "author", "by", "actor", "who", "origin", "administer", "aiCred", "principal", "proposedBy",
  "session", "credential", "authorization", "cookie"]);

/* The refusal an unregistered name answers, at the store and through the door. */
export const PUBLIC_READ_NOT_REGISTERED = "PUBLIC_READ_NOT_REGISTERED";
