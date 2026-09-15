/* The content type for a document whose type is not recognised.
 *
 * Reports any substantive difference and declines to describe it. That is the safe
 * direction and it is deliberately unsatisfying: a member sees "this changed" with
 * no account of what, which is annoying, honest, and a standing prompt to measure
 * the type and write it. The alternative, guessing at what a document means, is how
 * a system starts reassuring people about things it has not understood.
 */
import { CONFIDENCE, CONTRACT } from "./index.mjs";

export default {
  key: "generic", label: "a document of no recognised type", version: 1, fallback: true,
  /* Watch its substance: with no reader for its members, the whole document is the
     unit. This is the declared contract (CONSTRUCTS Step 0 #4), not one derived from
     the stack that served it. */
  contract: CONTRACT.SUBSTANCE,
  detect() { return { match: false, confidence: CONFIDENCE.NONE }; },
  /* FW-17 / IC-86 — THIS READER CANNOT SAY WHERE A REFERENCE WAS READ, for the
     one reason that admits no fix: it reads no references. The generic type's
     whole discipline is that it reports a substantive difference without
     describing it, so it emits NO entities, and where a reference was read is
     not a question it can be asked. Declared here rather than left implicit
     because IC-86 obliges a reader that cannot say to say so, and "it has
     nothing to position" is a materially different answer from "it had
     something and could not place it" — which is what the calendar reader's own
     header records. This one closes when a measured type is written for the
     document, not before. */
  parse() { return { entities: [], facts: {} }; },
  /* The one deliberate place `meaningful` is NOT derived from event significance:
     with no type there are no graded events, but a substantive difference in an
     unrecognised document must still be flagged. So it is asserted true, in the safe
     direction, and left undescribed. */
  assess() {
    return { meaningful: true, significance: "notice", events: [], confirmed: null,
             why: "the substance of this document changed; what kind of document it is has not "
                + "been worked out, so what changed is not described" };
  },
};
