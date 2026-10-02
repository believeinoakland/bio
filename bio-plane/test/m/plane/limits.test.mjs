/* plane R13 (N482, K1020; D-54): the plane's subrequest ceiling is a property of the parsed deployment config, read with
   bundler's one JSONC reader (its R11) and carried by its `deriveLimits` (its R15), sized against the widest invocation
   the plane is sized for, a capture (`subresources.SUBRESOURCE_CAP`, its R35). Checked from the parsed config and the
   imported constant, never from a comment's text. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseJsonc } from "../../../scripts/jsonc.mjs";
import { deriveLimits } from "../../../scripts/derive-bindings.mjs";
import { SUBRESOURCE_CAP } from "../../../src/subresources.mjs";

const PLANE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const config = () => parseJsonc(readFileSync(join(PLANE, "wrangler.jsonc"), "utf8"), "wrangler.jsonc");

/* The ceiling R13 states: the declared subrequest limit, once deriveLimits carries it. */
const DECLARED = 10000;
/* A capture's widest invocation: one primary fetch and up to `cap` subresource fetches, each with its write. */
const captureWidth = (cap) => 2 * (1 + cap);
/* R13's margin: the ceiling is at least ten captures wide. */
const covers = (ceiling, cap) => ceiling >= 10 * captureWidth(cap);

test("R13: wrangler.jsonc, parsed as JSONC, sets `limits.subrequests` to 10000, a whole number deriveLimits carries unchanged", () => {
  const cfg = config();
  assert.equal(cfg.limits.subrequests, DECLARED);
  assert.ok(Number.isInteger(cfg.limits.subrequests));
  const derived = deriveLimits(cfg);
  assert.equal(derived.subrequests, DECLARED, "carried unchanged into the upload's metadata");
  assert.deepEqual(Object.keys(cfg.limits).filter((k) => !Object.hasOwn(derived, k)), [], "no declared limit dropped");
});

test("R13: the ceiling covers ten captures at today's SUBRESOURCE_CAP, read from the constant's export", () => {
  const ceiling = deriveLimits(config()).subrequests;
  assert.ok(Number.isInteger(SUBRESOURCE_CAP) && SUBRESOURCE_CAP > 0);
  assert.ok(covers(ceiling, SUBRESOURCE_CAP),
    `${ceiling} subrequests must be at least ten times 2 × (1 + ${SUBRESOURCE_CAP}) = ${10 * captureWidth(SUBRESOURCE_CAP)}`);
});

test("R13 negative controls: a cap raised past the ceiling's margin fails the check; a config with no limit, or a limit that is not a positive whole number, is refused by deriveLimits as NO_SUBREQUEST_LIMIT", () => {
  const ceiling = deriveLimits(config()).subrequests;
  /* the largest cap the ceiling covers, and the first it does not */
  const most = Math.floor(ceiling / 20) - 1;
  assert.equal(covers(ceiling, most), true);
  assert.equal(covers(ceiling, most + 1), false, "a cap raised past the margin fails");
  const { limits, ...rest } = config();
  for (const cfg of [rest, { ...rest, limits: {} }, { ...rest, limits: { subrequests: 0 } },
                     { ...rest, limits: { subrequests: 2.5 } }, { ...rest, limits: { subrequests: "10000" } }])
    assert.throws(() => deriveLimits(cfg), /NO_SUBREQUEST_LIMIT/, JSON.stringify(cfg.limits ?? null));
  /* and the config's own text, a comment changed, parses to the same figure: no comment binds it */
  const text = readFileSync(join(PLANE, "wrangler.jsonc"), "utf8").replace(/\/\/[^\n]*subrequest[^\n]*/gi, "// (comment changed)");
  assert.equal(parseJsonc(text).limits.subrequests, limits.subrequests);
});
