/* FL-12 — THE PLANE MOCK'S `op=capturerequest` BRANCH, DERIVED FROM THE PLANE.
 *
 * WHY THIS FILE EXISTS. `agent-worker` filed every internet-level acquisition request with its locator
 * in a field named `url`. The plane reads ONE field for the locator, `address` (`store.mjs`
 * `captureRequest`: `String(args.address ?? "")`, then `isPublicHttpsLocator`), so every request a run
 * filed was refused `CAPTURE_REQUEST_NOT_PUBLIC` (C-28.2) naming "(none)" — measured by REC-168 at the
 * code. No fleet suite saw it, because both of this member's mocks answered
 * `{ request: "REQ-…", state: "queued" }` to ANY body. **A mock that accepts anything is the liar**
 * (`plane-suggest.mjs`'s header, D-276's sentence): it guarantees the field name is never tested.
 *
 * SO THIS BRANCH REFUSES BY NAME, THE WAY THE PLANE DOES, IN THE PLANE'S ORDER (`captureRequest`'s
 * `is-capture-request` region, REC-168):
 *   (1) the run NAMED — `CAPTURE_REQUEST_NO_RUN` (C-28.1);
 *   (2) its PRINCIPAL the caller — `runPrincipalGate` (C-22.12), relayed field by field;
 *   (3) the run RUNNING — `CAPTURE_REQUEST_NO_RUN` again, as the plane answers it;
 *   (4) `address` a PUBLIC HTTPS locator — `CAPTURE_REQUEST_NOT_PUBLIC` (C-28.2), by the plane's own
 *       `isPublicHttpsLocator`, interpolated from its SOURCE TEXT rather than re-typed;
 *   (5) `target` an inquiry — `CAPTURE_REQUEST_NOT_AN_INQUIRY`.
 * Every code, C-number and translation is read out of `CAPTURE_REQUEST_CHECKS` / `runPrincipalGate`.
 *
 * WHAT IT DOES NOT HOLD, stated: the viewer gate (a run or question the caller cannot see answering as
 * absent), the lead (PL-15), the queue's pacing, dedup of a repeated request, and whether the target is a
 * question that EXISTS — only that it is spelled as one. `bio-plane/test/` drives those against a real store.
 *
 * NOT a `.test.mjs`: an instrument the suites share, not a suite.
 */
import { CAPTURE_REQUEST_CHECKS, isPublicHttpsLocator } from "../../bio-plane/checks/bio-checks.mjs";
import { runPrincipalGate } from "../../bio-plane/src/airun.mjs";
import { INQUIRY_PREFIXES } from "./plane-suggest.mjs";

export const CAPTURE_WIRE_CHECKS = {
  CAPTURE_REQUEST_NO_RUN: CAPTURE_REQUEST_CHECKS.CAPTURE_REQUEST_NO_RUN,
  CAPTURE_REQUEST_NOT_PUBLIC: CAPTURE_REQUEST_CHECKS.CAPTURE_REQUEST_NOT_PUBLIC,
  CAPTURE_REQUEST_NOT_AN_INQUIRY: CAPTURE_REQUEST_CHECKS.CAPTURE_REQUEST_NOT_AN_INQUIRY,
};
const row = (code) => ({ code, reason: code, check: CAPTURE_WIRE_CHECKS[code].check,
                         translation: CAPTURE_WIRE_CHECKS[code].translation });
const NOT_PRINCIPAL = runPrincipalGate({ caller: "fl12-caller", principal: "fl12-owner",
                                         act: "requesting a capture under a run" });

/** The branch, as source. Expects the mock's `op`, `body`, `url` and `S` locals; `run.principal` and
 *  `run.status` are expressions over the mock's own state. Accepted requests are kept in `S.requests`. */
export const captureRequestBranch = ({ run } = {}) => {
  if (!run || !run.principal || !run.status)
    throw new Error("plane-capturerequest.mjs: captureRequestBranch needs { run: { principal, status } }. "
      + "A capture-request mock with no run answers a question the plane refuses.");
  return `
    /* FL-12: DERIVED FROM THE PLANE by test/plane-capturerequest.mjs — it reads \`address\`, as the
       plane does, and refuses by the plane's codes in the plane's order. Its header lists what it
       does not hold. */
    if (op === "capturerequest") {
      const isPublicHttpsLocator = ${isPublicHttpsLocator.toString()};
      const refused = (r, extra) => Response.json({ ok: true, result: {
        ok: false, code: r.code, reason: r.reason, check: r.check, translation: r.translation, ...extra } });
      const b = body || {};
      const runId = String(b.run ?? "").trim();
      if (!runId)
        return refused(${JSON.stringify(row("CAPTURE_REQUEST_NO_RUN"))}, { run: null });
      if (url.searchParams.get("token") !== (${run.principal}))
        return Response.json({ ok: true, result: { ok: false,
          reason: ${JSON.stringify(NOT_PRINCIPAL.code)}, code: ${JSON.stringify(NOT_PRINCIPAL.code)},
          check: ${JSON.stringify(NOT_PRINCIPAL.check)}, translation: ${JSON.stringify(NOT_PRINCIPAL.translation)},
          detail: ${JSON.stringify(NOT_PRINCIPAL.detail)}, run: runId,
          note: "a capture request names a run its caller holds. Nothing was requested or written" } });
      if ((${run.status}) !== "running")
        return refused(${JSON.stringify(row("CAPTURE_REQUEST_NO_RUN"))}, { run: runId });
      const address = String(b.address ?? "").trim();
      if (!isPublicHttpsLocator(address))
        return refused(${JSON.stringify(row("CAPTURE_REQUEST_NOT_PUBLIC"))},
          { detail: "'" + (address.slice(0, 80) || "(none)") + "' is not a public https locator.",
            address: address || null });
      const target = String(b.target ?? "").trim();
      if (!target || !${JSON.stringify(INQUIRY_PREFIXES)}.includes(target.split("-")[0]))
        return refused(${JSON.stringify(row("CAPTURE_REQUEST_NOT_AN_INQUIRY"))}, { target: target || null });
      (S.requests = S.requests || []).push({ run: runId, target, address });
      return Response.json({ ok: true, result: { request: "REQ-" + S.requests.length, state: "queued" } });
    }
`;
};
