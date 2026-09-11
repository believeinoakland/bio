/* CASE-5b / DEC-72 — THE CASE-LEVEL SIGNING CEREMONY, AS A SHARED TEST FIXTURE.
 *
 * WHY THIS MODULE EXISTS, on `publishingproject.mjs`'s own precedent and for its
 * own reason. CASE-5b makes the case's assertions arrive through a SECOND
 * ratification: `op=publish` authors a case document, a member signs it, and
 * `op=caseratify` commits `cases`, `published_cases` and the roster from those
 * signed bytes. **Nine existing suites drive `op=publish` followed by
 * `op=ratify`** — `publish`, `multifinding`, `publishedcase`, `caseflip`,
 * `casepin`, `caseproduction`, `caselifecycle`, `reevaluation` and `caseobject`
 * (which signs inline, its publish site being a single literal rather than a
 * helper) — and every one of them now has a step in between. Giving each of them
 * its own copy of the signing dance would put nine implementations of one
 * ceremony into the estate — the shape this repository keeps paying for, and the
 * one `publishingproject.mjs` was written to stop.
 *
 * WHAT IT DOES NOT DO, deliberately and in that module's own words: it does not
 * wrap `op=publish` and it does not wrap `op=ratify`. It performs exactly the
 * one act that is new, so what a suite asserts about publication and about
 * ratification is still spelled out in the suite that asserts it.
 *
 * `casesign.test.mjs` — CASE-5b's own suite — deliberately does NOT use this
 * helper and signs inline, for `caseproduction.test.mjs`'s reason one item
 * earlier: the CEREMONY is what that suite tests, and a fixture that performs
 * the ceremony would have the suite asserting against its own helper. It also
 * means the helper and the subject share no code path, so a defect in the helper
 * cannot make CASE-5b's own suite pass.
 *
 * THE STATEMENT IS WRITTEN OUT HERE IN ASCII rather than imported from
 * `src/sshsig.mjs`. That is the D4 discipline this estate already applies to
 * every signature it drives: an expectation taken from the thing under test
 * agrees with it for free. If `caseRatifyStatement` changes shape, every suite
 * using this helper must go red, and importing the builder is exactly what would
 * stop them.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** The bytes a member signs to ratify a case document. ASCII, single line, and
 *  written out rather than imported — see the header. */
export const caseStatementText = (caseId, edition, docSha) =>
  `bio-ratify-case ${caseId} ${edition} ${docSha}\n`;

/** Sign a case document's sha with a stock ssh-keygen key. `dir` is the suite's
 *  own temp directory and `key` the basename of its private key inside it. */
export function signCase(dir, key, caseId, edition, docSha) {
  const f = join(dir, `casestmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, caseStatementText(caseId, edition, docSha));
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, key), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
}

/** Drive the ceremony through the control plane.
 *
 *  `post`  — (query, body) => parsed JSON, the suite's own control-plane POST
 *  `pub`   — the answer `op=publish` returned, whose `caseDocument` carries the
 *            sha to sign. Taken WHOLE rather than as three arguments so a suite
 *            cannot accidentally sign one case's sha under another's number.
 *
 *  THROWS with the plane's own answer on any failure, because a fixture that
 *  fails quietly produces a suite whose assertions all measure the wrong thing —
 *  `publishingproject.mjs`'s rule, kept. */
export async function ratifyCase(post, pub, { dir, key, token }) {
  if (!pub || pub.ok === false)
    throw new Error(`ratifyCase: op=publish did not succeed: ${JSON.stringify(pub)}`);
  const d = pub.caseDocument;
  if (!d || !d.doc_sha)
    throw new Error(`ratifyCase: op=publish returned no caseDocument sha: ${JSON.stringify(pub)}`);
  const r = await post(`op=caseratify&token=${token}`, {
    caseId: d.case_id, edition: d.edition, expectedSha: d.doc_sha,
    sig: signCase(dir, key, d.case_id, d.edition, d.doc_sha),
  });
  if (!r || r.ok === false)
    throw new Error(`ratifyCase ${d.case_id}@${d.edition}: ${JSON.stringify(r)}`);
  return r;
}
