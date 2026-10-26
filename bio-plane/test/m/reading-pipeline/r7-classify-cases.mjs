/* reading-pipeline G88 (fix round 7): the cases `r7-classify-yield.test.mjs` reads and `make-r7-classify-answers.mjs` records. The real
   content types are registered as the contention entry registers them, with a stub registered first that wins CERTAIN on a marker, so a text
   carrying the marker has types registered after its winner (the `also` pass asks them). `firstTick` is this module's `read` over a text
   held whole in a bucket, as the first tick of a piece read (`cursor: null`). */
import { read } from "../../../src/reading-pipeline/index.mjs";
import { registerDoctype } from "../../../../docprofile/registry.mjs";
import { registerDoctypes } from "../../../../doctypes/index.mjs";
import { bucket, evidenceStore, hold, doc } from "./fixture.mjs";
import { plainText, minutesText } from "./r7-texts.mjs";

export const WINNER_MARK = "R7-CLASSIFY-WINNER-MARK";
registerDoctype({
  key: "r7-winner", label: "winner", version: 1,
  detect: (ctx) => (typeof ctx.text === "string" && ctx.text.includes(WINNER_MARK) ? { match: true, confidence: "certain", signals: ["mark"] } : { match: false, confidence: "none", signals: [] }),
});
registerDoctypes(registerDoctype);

export const CASES = {
  plain: () => plainText(),                                   /* no type matches: the walk goes through every detect */
  winner: () => WINNER_MARK + "\n" + plainText(),             /* a CERTAIN winner first, the `also` pass asks the rest */
  minutes: () => minutesText(),                               /* matched by a real type, its parse included */
};

export async function firstTick(text) {
  const b = bucket();
  const bytes = Buffer.from(text);
  const document = doc({ digest: await hold(b, bytes), bytes: bytes.length, ct: "text/plain", format: "undetermined", fromText: true });
  return read(document, { evidence: evidenceStore(b), env: {}, storeName: "bio", cursor: null, unitsBudget: 512 * 1024 });
}
