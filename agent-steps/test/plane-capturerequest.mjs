/* FL-12 — THE PLANE MOCK'S `op=capturerequest` BRANCH, DERIVED FROM THE PLANE.
 *
 * WHY THIS FILE EXISTS. `agent-worker` filed every internet-level acquisition request with its locator
 * in a field named `url`. The plane reads ONE field for the locator, `address` (capture-requests'
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
 *   (4) `address` a PUBLIC HTTPS locator — `CAPTURE_REQUEST_NOT_PUBLIC` (C-28.2), by record-grammar's own
 *       `isPublicHttpsLocator` (its R19), the exported function itself carried into the mock rather than re-typed;
 *   (4a) (T35; capture-requests R49, F2, K1880) the address within 2,048 characters — `CAPTURE_REQUEST_ADDRESS_TOO_LONG`
 *       (C-28.23) — and one the record ALREADY HOLDS, equal character for character once its scheme and host are
 *       lower-cased, query and fragment included — `CAPTURE_REQUEST_ADDRESS_NOT_HELD` (C-28.24). The record's holdings
 *       are the mock's `HELD_ADDRESSES` (or the list a suite names), standing for the receipts and links the plane reads;
 *   (5) `target` an inquiry — `CAPTURE_REQUEST_NOT_AN_INQUIRY`.
 * Every code, C-number and translation is read out of capture-requests' `CAPTURE_REQUEST_CHECKS` (C-28, its own
 * since T18) and run-rules' `runPrincipalGate`.
 *
 * WHAT IT DOES NOT HOLD, stated: the viewer gate (a run or question the caller cannot see answering as
 * absent), the lead (PL-15), the queue's pacing, dedup of a repeated request, and whether the target is a
 * question that EXISTS — only that it is spelled as one. `bio-plane/test/` drives those against a real store.
 *
 * NOT a `.test.mjs`: an instrument the suites share, not a suite.
 */
/* T19 (rule 1): each name from its owner, never the check catalogue. */
import { CAPTURE_REQUEST_CHECKS } from "../../bio-plane/src/capture-requests/checks.mjs";
import { isPublicHttpsLocator } from "../../bio-plane/src/record-grammar/locator.mjs";
import { runPrincipalGate } from "../../bio-plane/src/run-rules/index.mjs";
import { INQUIRY_PREFIXES } from "./plane-suggest.mjs";
import { CAPTURE_REQUEST_ADDRESS_MAX as CAPTURE_REQUEST_ADDRESS_MAX_VALUE } from "../../bio-plane/src/capture-requests/index.mjs";

export const CAPTURE_WIRE_CHECKS = {
  CAPTURE_REQUEST_NO_RUN: CAPTURE_REQUEST_CHECKS.CAPTURE_REQUEST_NO_RUN,
  CAPTURE_REQUEST_NOT_PUBLIC: CAPTURE_REQUEST_CHECKS.CAPTURE_REQUEST_NOT_PUBLIC,
  CAPTURE_REQUEST_NOT_AN_INQUIRY: CAPTURE_REQUEST_CHECKS.CAPTURE_REQUEST_NOT_AN_INQUIRY,
  CAPTURE_REQUEST_ADDRESS_TOO_LONG: CAPTURE_REQUEST_CHECKS.CAPTURE_REQUEST_ADDRESS_TOO_LONG,
  CAPTURE_REQUEST_ADDRESS_NOT_HELD: CAPTURE_REQUEST_CHECKS.CAPTURE_REQUEST_ADDRESS_NOT_HELD,
};
/** capture-requests R49: the addresses the mock's record holds (a receipt's address or a held capture's link). The
 *  suites' runs request only these, so a request they file is one the plane would take. */
export const HELD_ADDRESSES = Object.freeze(["https://example.org/a", "https://example.org/b", "https://example.org/cal",
  "https://example.org/minutes", "https://example.org/council/minutes"]);
export { CAPTURE_REQUEST_ADDRESS_MAX } from "../../bio-plane/src/capture-requests/index.mjs";
const row = (code) => ({ code, reason: code, check: CAPTURE_WIRE_CHECKS[code].check,
                         translation: CAPTURE_WIRE_CHECKS[code].translation });
const NOT_PRINCIPAL = runPrincipalGate({ caller: "fl12-caller", principal: "fl12-owner",
                                         act: "requesting a capture under a run" });

/** The branch, as source. Expects the mock's `op`, `body`, `url` and `S` locals; `run.principal` and
 *  `run.status` are expressions over the mock's own state. Accepted requests are kept in `S.requests`. */
export const captureRequestBranch = ({ run, held = HELD_ADDRESSES } = {}) => {
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
      if ((req.headers.get("authorization") || "").replace(/^Bearer /, "") !== (${run.principal}))
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
      /* capture-requests R49 (T35): within the bound, and an address the record already holds. */
      if (address.length > ${CAPTURE_REQUEST_ADDRESS_MAX_VALUE})
        return refused(${JSON.stringify(row("CAPTURE_REQUEST_ADDRESS_TOO_LONG"))},
          { bound: ${CAPTURE_REQUEST_ADDRESS_MAX_VALUE}, length: address.length });
      const schemeHostLower = (x) => { const t = String(x), k = t.indexOf("://");
        if (k < 0) return t;
        const rest = t.slice(k + 3), e = rest.search(/[?#]|[/]/);
        const host = e < 0 ? rest : rest.slice(0, e);
        return t.slice(0, k + 3).toLowerCase() + host.toLowerCase() + rest.slice(host.length); };
      if (!${JSON.stringify(held)}.some((h) => schemeHostLower(h) === schemeHostLower(address)))
        return refused(${JSON.stringify(row("CAPTURE_REQUEST_ADDRESS_NOT_HELD"))},
          { detail: address.slice(0, 120) + " is not an address the record already holds.", address: address.slice(0, 300) });
      const target = String(b.target ?? "").trim();
      if (!target || !${JSON.stringify(INQUIRY_PREFIXES)}.includes(target.split("-")[0]))
        return refused(${JSON.stringify(row("CAPTURE_REQUEST_NOT_AN_INQUIRY"))}, { target: target || null });
      (S.requests = S.requests || []).push({ run: runId, target, address });
      return Response.json({ ok: true, result: { request: "REQ-" + S.requests.length, state: "queued" } });
    }
`;
};
