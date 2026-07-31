/* The gate: the check catalog, run rather than reimplemented.
 *
 * plane-gate/0.1 hand-wrote four checks because the catalog was unreachable,
 * embedded in an Apps Script runtime being decommissioned. That gate could not
 * see illegal states, missing core fields, wrong headings, broken append-only
 * surfaces, or a mechanical writer exceeding its envelope, which is how two
 * defects shipped in the intake path without anything noticing.
 *
 * This runs the catalog itself. Not a port of it: BIO's conformance doctrine
 * requires three implementations agreeing, and a plane-native rewrite of the
 * checks would be a fourth implementation pretending to be that agreement. The
 * catalog is a pure function over an injected filesystem, so the plane supplies
 * the five seams and nothing else.
 *
 * Two deliberate choices about bytes:
 *
 *   Blob-backed files are declared ELIDED rather than fetched. The catalog's
 *   three-tier read model exists for exactly this: existence assertions consult
 *   files union elided, byte checks read files only. Fetching would mean pulling
 *   a 39.6MB capture and its history copies into a Worker's memory to gate one
 *   bundle.
 *
 *   Capture integrity is not re-proven here because it was proven earlier and
 *   harder. The capture op hashes the body server-side on write and refuses a
 *   mismatch, so a registered capture's bytes were verified when they landed. A
 *   gate that re-hashes them on every ratification pays for the same assurance
 *   twice.
 *
 * What the plane still checks itself: that every registered capture is PRESENT
 * in the working bucket. That is an R2 head, not a fetch, and it catches the one
 * thing content addressing cannot, which is bytes that were never stored or were
 * removed out of band.
 */

import { checkBundle } from "../checks/bio-checks.mjs";

export const CATALOG_VERSION = "1.17.0";
export const GATE_VERSION = `plane-gate/1.0 (bio-checks ${CATALOG_VERSION})`;

const hex = (buf) => [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, "0")).join("");
const te = new TextEncoder();

export async function runGate({ bundleId, image, knownIds, hasCapture, registers, releaseRegistry }) {
  const files = new Map(), elided = new Set();
  for (const [path, v] of Object.entries(image || {})) {
    if (typeof v === "string") files.set(path, v);
    else elided.add(path);
  }

  const { findings } = await checkBundle({
    folderName: bundleId,
    files,
    elidedPaths: elided,
    sha256: async (v) => hex(await crypto.subtle.digest("SHA-256", typeof v === "string" ? te.encode(v) : v)),
    sha512: async (b) => new Uint8Array(await crypto.subtle.digest("SHA-512", b)),
    resolveTarget: (id) => knownIds.has(id),
    releaseRegistry: releaseRegistry || null,
  });

  const errors = findings
    .filter((f) => f.severity === "error")
    .map((f) => ({ check: f.check, detail: f.message, ...(f.repairs ? { repairs: f.repairs } : {}) }));

  /* The plane's own remaining duty: bytes the register claims must exist. */
  for (const r of registers || []) {
    const probe = await hasCapture(r.capture_sha);
    if (!probe.present)
      errors.push({ check: "PLANE_MISSING_BYTES", detail: `registered capture is absent from the working bucket`,
                    where: { path: r.path, sha256: r.capture_sha } });
    else if (typeof r.bytes === "number" && probe.bytes !== r.bytes)
      errors.push({ check: "PLANE_SIZE", detail: `capture bytes differ from the register`,
                    where: { path: r.path, want: r.bytes, got: probe.bytes } });
  }

  return {
    gateVersion: GATE_VERSION,
    ok: errors.length === 0,
    findings: errors,
    warnings: findings.filter((f) => f.severity !== "error").length,
  };
}
