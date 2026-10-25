/* bias' published fixtures (K4990, K4993, K4995, K5044): what bias answers to a caller that promotes a malformed bias set,
   made by bias' own code over its test world when the test runs and never stored. A user's test takes the answer from
   here and does not write it by hand. Each is called by a test of bias' own, `fixtures.test.mjs`, which checks the real answer. */
import { world, FM, S, biasMd } from "./world.mjs";

/* `promotionCheck` for a bias set whose statements break R2–R7 (a verdict, an unregistered subject, no justification):
   the refusal `{ok: false, reason: "BIAS_REFUSED", findings}`, judged before any write (R9). */
export function biasRefusedPromote() {
  const w = world();
  const bad = FM("BIAS-2026-0001-a", { statements: [S("s1", { text: "The spokesman is a liar." }),
    S("s2", { subject: "the mayor" }), S("s3", { justification: "" })] });
  return w.bias.promotionCheck({ promotedType: "bias", files: [{ path: "bundle.md", text: biasMd(bad) }] });
}
