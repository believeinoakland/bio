/* D-276 — THE PLANE MOCK'S `op=meaningrows` BRANCH, DERIVED FROM THE PLANE.
 *
 * WHY THIS FILE EXISTS, and it is the second half of D-276 rather than tidiness.
 * All three of this member's plane mocks answered `op=meaningrows` with
 * `{ ok: true, rows: [] }` **FOR ANY `rows` ARGUMENT WHATSOEVER**. The member
 * was asking for the arm `"legs"`, which the compiler does not hold, so against
 * a real plane every one of those calls was refused `MEANING_ROWS_UNKNOWN_ARM`
 * (C-23.2) — and 464 assertions across three suites stayed green over a call
 * that could not succeed. **A fixture that says yes to everything is not a test
 * double; it is a guarantee that nothing is tested.** Fixing the argument
 * without fixing the fixture would leave the NEXT wrong argument equally
 * invisible, which is why the item is both halves.
 *
 * IT IS DERIVED, NEVER TYPED, AND THAT IS THE WHOLE DESIGN. The arms come from
 * `MEANING` in the plane's own compiler and the refusal wording comes from
 * `MEANING_READ_CHECKS` in the plane's own catalog. A hand copy would agree with
 * the member for free — this project has now measured that failure at least six
 * times, most sharply as a complete hand copy of 131 op names that passed —
 * whereas a derivation cannot: rename an arm in `query.mjs` and this fixture
 * changes with it, and the member's constant does not.
 *
 * IT ALSO REPRODUCES **WHERE** THE REFUSAL SITS, WHICH IS NOT WHERE A READER
 * EXPECTS. MEASURED 2026-08-09 by driving the real plane in workerd: a refused
 * arm answers **HTTP 200** with a **TOP-LEVEL `ok: true`**, the refusal nested
 * inside `result`. A mock that refused at the envelope would have been a fixture
 * for a plane that does not exist, and would have let a member checking only the
 * envelope's `ok` pass while still being blind on the wire.
 *
 * NOT a `.test.mjs`: the battery discovers suites by that suffix, and this is an
 * instrument the suites share, not a suite.
 */
import { MEANING } from "../../bio-plane/src/query.mjs";
import { MEANING_READ_CHECKS } from "../../bio-plane/checks/bio-checks.mjs";

/** The arms the plane's compiler actually holds, in its order. */
export const MEANING_ARMS = Object.keys(MEANING);

/** The refusal rows, verbatim from the catalog — code, C-number, translation. */
const CHECKS = {
  NO_ARM: MEANING_READ_CHECKS.MEANING_ROWS_NO_ARM,
  UNKNOWN_ARM: MEANING_READ_CHECKS.MEANING_ROWS_UNKNOWN_ARM,
};

/** The `op=meaningrows` branch, as source, for a plane mock running in workerd.
 *
 *  `rowsExpr` is a JavaScript expression the mock evaluates to produce the rows
 *  of a SUCCESSFUL answer, so a suite that wants to stage rows still can — what
 *  it may no longer do is stage a success for an arm the record does not hold.
 *
 *  The branch expects the mock's own `op` and `url` locals, which all three
 *  mocks already have. */
export const meaningRowsBranch = (rowsExpr = "[]") => `
    /* D-276: DERIVED FROM THE PLANE'S OWN REGISTRY by test/plane-meaning.mjs.
       This branch REFUSES an arm the record does not hold, in the plane's own
       words and — measured — in the plane's own PLACE: 200, envelope ok TRUE,
       the refusal inside \`result\`. */
    if (op === "meaningrows") {
      const KNOWN = ${JSON.stringify(MEANING_ARMS)};
      const asked = String(url.searchParams.get("rows") || "").trim().toLowerCase();
      const refuse = (row, detail) => Response.json({ ok: true, result: {
        ok: false, reason: row.reason, check: row.check, translation: row.translation, detail,
      }, store: url.searchParams.get("store") || "", tokenClass: "ai" });
      if (!asked)
        return refuse(${JSON.stringify({ reason: "MEANING_ROWS_NO_ARM", check: CHECKS.NO_ARM.check, translation: CHECKS.NO_ARM.translation })},
          "op=meaningrows answers at MEANING grain and must be told which: rows=" + KNOWN.join("|") + ".");
      if (!KNOWN.includes(asked))
        return refuse(${JSON.stringify({ reason: "MEANING_ROWS_UNKNOWN_ARM", check: CHECKS.UNKNOWN_ARM.check, translation: CHECKS.UNKNOWN_ARM.translation })},
          "no meaning of the kind " + JSON.stringify(asked) + " is held. The kinds that are: " + KNOWN.join("; "));
      const rows = ${rowsExpr};
      return Response.json({ ok: true, result: { ok: true, arm: asked, rows,
        count: rows.length, limit: 50, offset: 0, total: rows.length, truncated: false } });
    }
`;
