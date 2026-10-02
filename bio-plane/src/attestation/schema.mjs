/* attestation's tables (requirements: `build/requirements/attestation.md`, R4, R5, R10). Moved from
 * `provenance/schema.mjs` with N512 (K1193; T25), comments and all (layers.md ruling 3, "each module owns its tables"):
 * the instance's signed receipts and the public keys that signed them. Every write to them is this module's (R10).
 * `CREATE TABLE IF NOT EXISTS` under the same names, so a deployed instance keeps its rows with no data migration. */

export const ATTESTATION_SCHEMA = `
-- K59 (R4): THE INSTANCE'S OWN SIGNED RECEIPTS FOR ARCHIVE-SOURCED CAPTURES, and the public keys that
-- signed them. One signing key per instance, held as a secret and replaceable by the operator; each
-- public key the instance ever signed with is kept here, so a receipt signed before a replacement
-- stays verifiable against the key it was signed with. key_id is the SHA-256 of the raw public key.
CREATE TABLE IF NOT EXISTS receipt_keys (
  key_id     TEXT PRIMARY KEY,
  public_key TEXT NOT NULL, -- the raw Ed25519 public key, base64
  first_used TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS signed_receipts (
  capture_sha       TEXT NOT NULL,
  retrieval_locator TEXT NOT NULL,
  retrieved         TEXT NOT NULL,
  statement         TEXT NOT NULL, -- the exact bytes signed (UTF-8)
  signature         TEXT NOT NULL, -- Ed25519 over the statement, base64
  key_id            TEXT NOT NULL,
  signed_at         TEXT NOT NULL,
  PRIMARY KEY (capture_sha, retrieval_locator, retrieved)
);
`;

/** The tables this module owns (R10), as record-core's purge takes them (its R21, R46): `signed_receipts` keyed to no
 *  bundle, so only the whole-store purge clears it; `receipt_keys` exempt, so a purge never makes a kept receipt
 *  unverifiable by deleting the public key it was signed with. */
export const ATTESTATION_TABLES = [{ name: "signed_receipts", keys: [] }];
export const ATTESTATION_EXEMPT = ["receipt_keys"];

/* Creates this module's tables on `sql` (the Durable Object's storage). Idempotent, run at every boot. */
export function migrateAttestation(sql) {
  const bare = ATTESTATION_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";")) { const t = s.trim(); if (t) sql.exec(t); }
}
