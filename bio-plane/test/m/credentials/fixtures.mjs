/* The answers this module publishes for its users' tests (K4990, K4993, K4995, K5044): each is made by this module's real
   code when the test runs, never stored. A user's test takes its value from here instead of building the answer by hand. */
import { world, PASSWORD } from "./fixture.mjs";
import { credentialsOps } from "../../../src/credentials/index.mjs";

const ISO = (ms) => new Date(ms).toISOString();

/* R2, R82: the real `bootstrap` answer of a store (the module's own ops arm, as the door calls it) for the stamp state
   asked. `storeVersion` is the build the store's environment names: a string, or `null` when it names none (the arm
   answers `null`, never a default). The remaining fields are the public door's own (`instance-setup`'s `bootstrapReport`
   spreads this answer beside its `ok`, `version` and, with `members=1`, `memberVersions`): `version` and
   `memberVersions` are passed through as the door would put them, `memberVersions` omitted when not given (a door asked
   without `members=1`). A claimed store is the real result of `claim`, never a flag set by hand. */
export async function bootstrapVersions({ storeVersion = "test-build", version = storeVersion, memberVersions, claimed = true, fp = "fp-1" } = {}) {
  const w = world();
  if (claimed) await w.claim();
  const env = storeVersion === null ? {} : { VERSION: storeVersion };
  const arm = credentialsOps(w.c, new URL(`http://x/?fp=${fp}`), null, env).bootstrap();
  return { ok: true, version, ...arm, ...(memberVersions ? { memberVersions } : {}) };
}

/* R45: the real refusals of `securityMap`: a caller who is not an administrator (NOT_AN_ADMIN, through membership), and an
   instant pair outside the period R45 states (SECURITY_PERIOD_INVALID). */
export async function securityMapRefusal() {
  const w = await world().group("ann");
  const now = Date.now();
  return {
    notAnAdmin: w.c.securityMap({ from: ISO(now - 3600e3), to: ISO(now), by: "ann" }),
    invalidPeriod: w.c.securityMap({ from: ISO(now), to: ISO(now - 3600e3), by: "admin" }),
  };
}

/* The signing key the member's own registration names in these answers: a public half in the shape R6 accepts. */
export const SIGNER_KEY = "AAAAsignerregisterownkey01";

/* R9 (signerregister, served as `signerregisterown`): a member's own signing key registered by the member's own act. The
   world is a team in which `ann` is an active member; the answer is the real result of `signerRegisterOwn` for `ann`, with
   the world it wrote into. Answers `{ w, answer }`. */
export async function signerregisterown({ keyB64 = SIGNER_KEY, by = "ann" } = {}) {
  const w = await world().group("ann");
  return { w, answer: w.c.signerRegisterOwn({ keyB64, by }) };
}

/* R9 (the refusal of a key already registered): `bob` registers the key first, then `ann` asks for the same key. The
   answer is the real refusal (SIGNER_KEY_HELD_BY_ANOTHER, which names no one). Answers `{ w, first, answer }`. */
export async function signerregisterownHeld() {
  const w = await world().group("ann", "bob");
  const first = w.c.signerRegisterOwn({ keyB64: SIGNER_KEY, by: "bob" });
  return { w, first, answer: w.c.signerRegisterOwn({ keyB64: SIGNER_KEY, by: "ann" }) };
}

/* R39 (`op=signout`, which interface-shell's frame reads): a member's live session ended by the real `signout` arm of the
   door, over a world each call builds. `ann` signs in through `login`, and the answer is the arm's result for that token
   (`{ ok: true, ended: 1 }`); the session is then gone from the store. Answers `{ w, token, answer }`. */
export async function signout() {
  const w = await world().group("ann");
  const { token } = await w.c.login({ handle: "ann", password: PASSWORD("ann") });
  return { w, token, answer: w.ops(`session=${encodeURIComponent(token)}`).signout() };
}
