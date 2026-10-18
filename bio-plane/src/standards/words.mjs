/* standards — the members' words (requirements: `build/requirements/standards.md`, R45, R59; N659, DEC-145, DEC-253).
 * Every read of a standard carries `says`, composed here from the record and never from a caller: a provision's force
 * beside its own words (DEC-145 (1)), binding or benchmark (2), "Cited, not seen" and "Looked for, not found" (3), "Not
 * public" with whose it is to release (4), access (6), the copy's state, and a policy always with its owner (8). Since
 * T50 (R59) this module holds only keys: every sentence is read through `setup-words`' `word(key, vars)` by DEC-253's
 * keys, so a word changed in `words.json` changes no code here. Pure: nothing here reads a store. No sentence names a
 * held standard's text a "practice" (DEC-145 (8)), and none speaks of a standard's merit (R12). */

import { word, hasWord } from "../setup-words/index.mjs";

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


/** R59: the words of the keys this module reads, as `words-reads.json` lists them for it (and the dynamic ones below). */
const keyed = (key, vars) => (hasWord(key) ? word(key, vars) : null);

/** R45 (8), R59: a policy always with its owner, the issuer's label ("Public Works policy"); null for other kinds. */
export function ownerWords(kind, issuerLabel) {
  return kind === "policy" && issuerLabel ? word("standard.policy.owner", { issuer: issuerLabel }) : null;
}

/** R45 (1), R59: a provision's force in the members' words, always beside the provision's own words (`words`, the
 *  cited passage's text, or null when the passage is held in a form not read). A discretion with no holder label names
 *  `standard.discretion.holder.none`. */
export function forceWords({ force, holderLabel = null, criteria = null, words = null }) {
  const head = force === "discretionary"
    ? word("label.standardforce.discretionary", { holder: holderLabel || word("standard.discretion.holder.none") })
    : keyed(`label.standardforce.${force}`);
  const out = { force: head, beside: words };
  if (force === "discretionary")
    out.criteria = word(criteria === "none" ? "label.standardcriteria.none" : "label.standardcriteria.stated");
  return out;
}

/** R45 (2), R59: binding on a body, or a labelled benchmark; undetermined says so in its own words. The body is named by
 *  its label, or by `standard.binding.body.none` when the record names none. */
export function bindingWords(state, bodyLabel) {
  const body = bodyLabel || word("standard.binding.body.none");
  if (state === "binds") return word("standard.binding.binds", { body });
  if (state === "benchmark") return word("standard.binding.benchmark", { body });
  return word("standard.binding.unknown", { body });
}

/** R59: a capture named in words, `capture <twelve digits>` and, when an extent is named, `, <the extent in words>`. */
export function captureWords(captureSha, where) {
  const capture = String(captureSha).slice(0, 12);
  return where ? word("standard.source.capture", { capture, extent: where }) : word("standard.source.capture.whole", { capture });
}

/** R45 (3), R59: a standard held without its text, in the members' words; null for one held `text`. `sourceOf` names a
 *  capture extent in words (`captureWords` over its extent's human form). */
export function heldWords(held, detail, sourceOf = (sha) => captureWords(sha, "")) {
  if (held === "cited") {
    const by = detail && typeof detail.captureSha === "string" ? word("standard.held.cited.by", { source: sourceOf(detail.captureSha, detail.extent) }) : null;
    return { held: word("label.standardheld.cited"), cited_by: detail || null, ...(by ? { cited_by_words: by } : {}) };
  }
  if (held === "absent") {
    const places = detail && Array.isArray(detail.places)
      ? detail.places.map((p) => (typeof p === "string" ? p : sourceOf(p.captureSha, p.extent))).join(", ") : "";
    return { held: word("label.standardheld.absent"), searched: detail || null,
             ...(places ? { searched_words: word("standard.held.absent.searched", { where: places }) } : {}) };
  }
  return null;
}

/** R45 (6), R59: access in the members' words; null when not stated. */
export const accessWords = (access) => keyed(`label.standardaccess.${access}`);

/** R59: the copy a member declares of a captured copy, in words; null when the copy is not one the list names. */
export const copyWords = (copy) => keyed(`label.standardcopy.${copy}`);

/** R45 (4), R59: a policy kept from the public by its source: "Not public", with whose it is to release (`releaseBy` is
 *  each project with its owners); never "confidential". The sentence naming who can release it is given only when the
 *  record names an owner. */
export function notPublicWords(releaseBy) {
  const who = [...new Set((Array.isArray(releaseBy) ? releaseBy : []).flatMap((p) => (p && Array.isArray(p.owners) ? p.owners : [])))];
  return { public: word("standard.notpublic"), release_by: releaseBy,
           ...(who.length ? { release_by_words: word("standard.notpublic.releaseby", { who: who.join(", ") }) } : {}) };
}

/** R59: the words in place of a reading-room or paywalled standard's text, for a reader who is not a member. */
export const textWithheldWords = () => word("standard.text.withheld");

/** R59: the note a read of a standard carries. */
export const noteWords = () => word("standard.note");

/** R59, R51: a version known in force through a date, from a source named in words, recorded by an author. */
export const inForceKnownWords = ({ through, source, author }) => word("standard.inforce.known", { through, source, author });
