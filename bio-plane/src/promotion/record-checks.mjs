/* The catalogue's checks that moved to promotion (K64): C-4.2, C-17.2, C-18.8 and C-20.1, run over one bundle image
 * by the gate after `checkBundle` (R27, R30–R32) and by the store's audit beside it, so neither loses a check. */

import { parseFrontmatter } from "../../checks/bio-checks.mjs";
import { checkStateHistory, checkMechanicalConformance, checkDivergence } from "./history.mjs";
import { checkReleaseSignature } from "./release.mjs";

/** `{folderName, files (path → text), releaseRegistry, sha256}` → the moved checks' findings, `{check, severity,
 *  message, repairs?}`, in the order `checkBundle` ran them. */
export async function recordChecks({ folderName, files, releaseRegistry = null, sha256 }) {
  const findings = [];
  const md = files.get("bundle.md");
  if (md != null) {
    const fm0 = parseFrontmatter(typeof md === "string" ? md : new TextDecoder().decode(md)).data;
    const fm = fm0 && typeof fm0 === "object" ? fm0 : null;
    checkStateHistory({ fm, files }, findings);
    findings.push(...await checkReleaseSignature({ folderName, fm, files, releaseRegistry, sha256 }));
    await checkMechanicalConformance({ files, sha256 }, findings);
  }
  await checkDivergence({ files, sha256 }, findings);
  return findings;
}
