/* case-checker at its interface: the case document's check reads each member's `{basis, references}` from the member's own
   bytes (R28), so a leg its references sever is not counted, as `strength` and the store's gate count it. Real case files
   (`./fixture.mjs`); the member's finding is rewritten in place, and only the publication checks' answer is read. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as CC from "../../../src/case-checker/index.mjs";
import * as CG from "../../../src/case-grammar/index.mjs";
import { caseFile, rows, A, MINUTES, MEMO } from "./fixture.mjs";

const leg = (target, ground) => ({ target, role: "supports", grade: "B", grade_axis: "capture", ground });
const cite = (target, status) => ({ target, rel: "cites", status });
/* A's bytes: its first leg ungrounded, its second leg grounded as "part 2" */
const memberText = (refs) => ["---", `id: ${A}`, "object_type: inquiry", `title: "${A}"`,
  ...rows("basis", [leg(MINUTES, null), leg(MEMO, "part 2")]), ...rows("references", refs), "---", "", `What ${A} found.`, ""].join("\n");
const publicationC28 = async (refs) => {
  const parts = caseFile({ mutate: (t) => t.set(CG.caseFilePath("finding", A), memberText(refs)) }).parts;
  const r = await CC.checkCaseFile({ parts });
  return r.publication_checks.findings.filter((x) => x.check === "C-2.8");
};

test("R28: the case document's check reads each member's basis with its references from the member's bytes: a grounded leg its references sever asks for no ground row", async () => {
  assert.deepEqual(await publicationC28([cite(MINUTES, "confirmed"), cite(MEMO, "severed")]), [],
    "MEMO's grounded leg is severed in A's bytes: no published ground row is asked for it");
});
