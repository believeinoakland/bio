/* REC-148 / DEC-31's BOUND RULE — THE IN-BAND QUARTET, COMPUTED ONCE.
 *
 * `BIO_Publication_v0_1.md` §6A.3 point 1: any rendering that leaves the instance addressed to someone
 * carries its HASH, its DATE, its AUTHOR and BOTH THRESHOLD FLOORS in-band (H4's rule, extended by DEC-31
 * on 2026-08-03). The published case container has carried them since REC-44; the review copy did not
 * (measured by BOB #16, 2026-09-19), so no surface may yet offer to export one.
 *
 * ONE FUNCTION, AND THAT IS THE WHOLE POINT OF THIS FILE. The rule's words are "proved to be the same
 * quantity the published container renders". Two hashers — one over the manifest, one over the review
 * copy — can agree on every fixture and drift the day one of them canonicalises differently (a changed
 * indent, a sorted key), and the record would then carry two "hashes" that mean different things under
 * one name. So the container assembly (`assembleCaseContainer`) and the review copy (`op=reviewcopy`)
 * both call `inbandQuartet`, and `test/reviewcopy-inband.test.mjs` asserts there is no second site.
 *
 * THE CANONICAL FORM IS THE WIRE FORM: `JSON.stringify(value, null, 1)`, UTF-8 — the bytes the container
 * manifest has always been hashed over, and the bytes `json()` in `index.mjs` serves an answer as. So a
 * reader holding the answer can re-hash it: parse it, remove `inband`, serialise it the same way.
 */

export const INBAND_FORMAT = "bio-inband/1";

/* THE CANONICAL BYTES of a JSON value. */
export function canonicalBytes(value) {
  return new TextEncoder().encode(JSON.stringify(value, null, 1));
}

async function sha256HexOf(bytes) {
  const d = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

/* THE TWO FLOORS, read off a bar in the shape `#projectBar` returns and the case document freezes
   (`required_strength`: declared, capture, connection). Undetermined is first-class: an absent bar is
   NOT a bar of zero, so an axis nobody declared reads null and `declared` says false in words. */
export function floorsOf(bar) {
  /* A frozen case document writes an unset axis as the YAML word `null`; it is an absent floor either way. */
  const grade = (g) => (typeof g === "string" && g.trim() && g.trim() !== "null" ? g.trim() : null);
  const capture = bar && typeof bar === "object" ? grade(bar.capture) : null;
  const connection = bar && typeof bar === "object" ? grade(bar.connection) : null;
  const declared = !!(bar && typeof bar === "object" && (bar.declared === true || bar.declared === "true")
                      && (capture || connection));
  return {
    capture, connection, declared,
    detail: declared
      ? "the floors on the two strength axes this case is held to: its publishing project's required "
        + "strength (DEC-72). They are independent, and neither is a default for the other."
      : "NO FLOOR IS DECLARED, and that is not a floor of zero: the publishing project states no required "
        + "strength, so nothing here claims to have cleared a standard.",
  };
}

/* THE QUARTET. `subject` is the JSON value whose canonical bytes are hashed; `over` names it in words, so
   a reader knows what to re-hash. Returns the bytes too, for the caller that must store or serve them. */
export async function inbandQuartet({ subject, over, date = null, author = null, bar = null }) {
  const bytes = canonicalBytes(subject);
  const sha256 = await sha256HexOf(bytes);
  return {
    bytes,
    quartet: {
      format: INBAND_FORMAT,
      hash: { algorithm: "sha256", sha256, over, bytes: bytes.length,
              canonical: "JSON.stringify(value, null, 1), UTF-8" },
      date: date ?? null,
      author: author ?? null,
      floors: floorsOf(bar),
    },
  };
}
