/* D-512 — A REPLAY THE PLANE CAN VERIFY, for the suites that drive one.
 *
 * `INVESTIGATIVE-SESSION.md` §11 item 5, "`replay` IS THE SERVER'S WORD, NEVER THE CALLER'S" (BOB #33, 2026-09-24),
 * STEP (2): `op=promote` honours `replay` on a promotion of ANY type and ANY revision only when the promotion names a
 * drive-provenance capture that it registers at `migration/drive-provenance.json`, whose bytes the record HOLDS, and
 * whose preserved promotion records name this bundle and list this revision's `bundle.md` SHA-256. Anything else that
 * asserts a replay is refused REPLAY_UNVERIFIED (C-66.6). Before D-512 a suite could drive a replay by putting
 * `replay: true` in the body under the admin token; that is exactly the caller's word step (2) removes, so every such
 * suite was CORRECTED to carry the proof `migrate.mjs` carries, and none was exempted.
 *
 * `withReplayProof(mf, query, pkg)` uploads, through `op=capture` under the SAME credential and store as the promotion
 * (`query` is e.g. `token=adm&store=bio`), a provenance capture in `migrate.mjs`'s shape whose one record names
 * `pkg.bundleId` and lists the SHA-256 of `pkg`'s inline `bundle.md`, and returns `pkg` naming and registering it,
 * with `bundle.md`'s `sha256` set to the figure the plane computes. It does not set `replay`: the caller still asserts
 * it, so a suite reads as the act it drives.
 *
 * Deliberately NOT a `.test.mjs`: the battery must not discover it. */
import { createHash } from "node:crypto";

export const DRIVE_PROVENANCE_PATH = "migration/drive-provenance.json";
const sha = (v) => createHash("sha256").update(v).digest("hex");

export async function withReplayProof(mf, query, pkg, { url = "http://x/api/" } = {}) {
  const files = Array.isArray(pkg?.files) ? pkg.files : [];
  const bm = files.find((f) => f && f.path === "bundle.md" && typeof f.text === "string");
  if (!bm) throw new Error(`withReplayProof: ${pkg?.bundleId} carries no inline bundle.md, so no replay of it can be verified`);
  const mdSha = sha(bm.text);
  const cap = Buffer.from(JSON.stringify({
    bundleId: pkg.bundleId, source: "test fixture (D-512 replay proof)",
    promotions: [{ key: typeof pkg.snapKey === "string" ? pkg.snapKey : "fixture",
                   record: { target: pkg.bundleId, files: [{ name: "bundle.md", sha256: mdSha }] } }],
  }), "utf8");
  const capSha = sha(cap);
  const res = await mf.dispatchFetch(`${url}?op=capture&${query}&sha256=${capSha}`, { method: "PUT", body: cap });
  const j = await res.json().catch(() => null);
  if (!(j?.ok === true || j?.result?.ok === true))
    throw new Error(`withReplayProof: the provenance capture for ${pkg.bundleId} was not held: ${JSON.stringify(j)}`);
  return {
    ...pkg,
    files: files.map((f) => (f === bm ? { ...f, sha256: mdSha } : f)),
    register: [...(Array.isArray(pkg.register) ? pkg.register : []),
               { path: DRIVE_PROVENANCE_PATH, sha256: capSha, bytes: cap.length, encoding: "utf8" }],
    provenanceCapture: capSha,
  };
}
