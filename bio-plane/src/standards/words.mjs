/* standards — the members' words (requirements: `build/requirements/standards.md`, R45; N659, DEC-145). Every read of
 * a standard carries `says`, composed here from the record and never from a caller: a provision's force beside its own
 * words (DEC-145 (1)), binding or benchmark (2), "Cited, not seen" and "Looked for, not found" (3), "Not public" with
 * whose it is to release (4), access (6), and a policy always with its owner (8). Pure: nothing here reads a store. No
 * sentence here calls a held standard's text a "practice" (DEC-145 (8)), and none speaks of a standard's merit (R12). */

/** R35: the forces a provision may hold, by kind: any kind's three, and a policy's two more. */
export const FORCES = Object.freeze(["requires", "recommends", "allows"]);
export const POLICY_FORCES = Object.freeze(["mandatory", "discretionary"]);
/** R36: the copy a member declares of a captured copy. */
export const COPY_STATES = Object.freeze(["official", "codifier", "in_force", "draft", "superseded", "production",
                                          "vendor_model", "undetermined"]);
/** R34: how much of a standard is held. */
export const HELD_STATES = Object.freeze(["text", "cited", "absent"]);
/** R41: how a standard's text can be read. */
export const ACCESS_STATES = Object.freeze(["free", "reading_room", "paywalled"]);

const FORCE_WORD = Object.freeze({ requires: "Requires", recommends: "Recommends", allows: "Allows",
                                   mandatory: "Required" });
const ACCESS_WORD = Object.freeze({ free: "Free to read", reading_room: "Reading room only", paywalled: "Behind a paywall" });

/** R45 (8): a policy always with its owner, the issuer's label ("Public Works policy"); null for other kinds. */
export function ownerWords(kind, issuerLabel) {
  return kind === "policy" && issuerLabel ? `${issuerLabel} policy` : null;
}

/** R45 (1): a provision's force in the members' words, always beside the provision's own words (`words`, the cited
 *  passage's text, or null when the passage is held in a form not read). */
export function forceWords({ force, holderLabel = null, criteria = null, words = null }) {
  const head = force === "discretionary" ? `At the discretion of ${holderLabel || "an office not named"}` : FORCE_WORD[force];
  const out = { force: head, beside: words };
  if (force === "discretionary") out.criteria = criteria === "none" ? "no criteria stated" : "criteria stated";
  return out;
}

/** R45 (2): binding on a body, or a labelled benchmark; undetermined says so in its own words. */
export function bindingWords(state, bodyLabel) {
  if (state === "binds") return `Standard · binds ${bodyLabel}`;
  if (state === "benchmark") return `Benchmark · not binding on ${bodyLabel}`;
  return `Whether this binds ${bodyLabel} is not recorded`;
}

/** R45 (3): a standard held without its text, in the members' words; null for one held `text`. */
export function heldWords(held, detail) {
  if (held === "cited") return { held: "Cited, not seen", cited_by: detail || null };
  if (held === "absent") return { held: "Looked for, not found", searched: detail || null };
  return null;
}

/** R45 (6): access in the members' words; null when not stated. */
export const accessWords = (access) => ACCESS_WORD[access] ?? null;

/** R45 (4): a policy kept from the public by its source: "Not public", with whose it is to release; never
 *  "confidential". */
export const notPublicWords = (releaseBy) => ({ public: "Not public", release_by: releaseBy });
