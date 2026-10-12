/* R79 (T46; N897 (2); K2816 (2); `run-rules` R29) — THE TEST-INSTANCE LABEL. On a test instance the plane admits a
 * part whose test bar is not yet held and labels what it answers (`run-rules`' `partAdmitted`, `ai-runs` R78); for
 * `POST /ask` and `POST /draft` the door hands the label in as `untested`, and this member puts it, unchanged, on the
 * ask's last `answer` event and beside a draft. It has no other effect: nothing is gated, read or kept by it.
 *
 * The label is `run-rules`' own object (`untestedLabel(part)`, its R29), so the one check is equality with what that
 * function answers for the part the label names: any other value, or a part it labels nothing for, is not a label. */
import { untestedLabel } from "../../bio-plane/src/run-rules/index.mjs";

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/** `{label}` (null when none was sent: `untested` absent or null) or `{bad: true}`. */
export function untestedOf(body) {
  const v = body?.untested;
  if (v === undefined || v === null) return { label: null };
  if (!isObject(v)) return { bad: true };
  const want = untestedLabel(v.part);
  if (!want) return { bad: true };
  const keys = Object.keys(want);
  if (Object.keys(v).length !== keys.length || !keys.every((k) => Object.hasOwn(v, k) && v[k] === want[k])) return { bad: true };
  return { label: want };
}

/** The words of the refusal of a malformed label. */
export const UNTESTED_BAD = "untested, when present, is the test-instance label exactly as the record's rules answer it for "
  + "one part ({kind: untested, part, set, set_version, words}); what arrived is not one, so nothing was done.";
