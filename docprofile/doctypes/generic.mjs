/* The content type for a document whose type is not recognised.
 *
 * Reports any substantive difference and declines to describe it. That is the safe
 * direction and it is deliberately unsatisfying: a member sees "this changed" with
 * no account of what, which is annoying, honest, and a standing prompt to measure
 * the type and write it. The alternative, guessing at what a document means, is how
 * a system starts reassuring people about things it has not understood.
 */
import { TYPE_CONFIDENCE } from "./index.mjs";

export default {
  key: "generic", label: "a document of no recognised type", version: 1, fallback: true,
  detect() { return { match: false, confidence: TYPE_CONFIDENCE.NONE }; },
  parse() { return { entities: [], facts: {} }; },
  assess() {
    return { meaningful: true, significance: "notice", events: [], confirmed: null,
             why: "the substance of this document changed; what kind of document it is has not "
                + "been worked out, so what changed is not described" };
  },
};
