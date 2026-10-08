/* The keys this installer will trust to have signed a release.
 *
 * A hash in RELEASE.json proves the bytes were not corrupted in transit.
 * It proves nothing about who put them there: whoever can write the
 * repository can write both the asset and the hash of the asset. A
 * signature is the part that names a person, and the only copy of the
 * public key that matters is this one, compiled into the installer the
 * group is already trusting to touch their account.
 *
 * Empty means unarmed: the installer verifies hashes, notes plainly that
 * releases are not yet signed, and installs. Once a key is listed, an
 * unsigned or wrongly signed repository release is refused outright and
 * the built-in copy installs instead. Adding the first key is a
 * deliberate act by the maintainer, not a default.
 *
 * R43 (T36; N712, K1936 Q4 step 1; Distribution §10): this list holds exactly two lines, the fresh release key and the
 * offline recovery key, each generated on the signer page with a passphrase, and never the development key the page
 * minted without one. Until Bob's signer-page sitting makes the two and the release is signed with the fresh key, the
 * line below is still the development key that signed the release this installer embeds: removing it first would
 * leave the installer refusing its own built-in release (R26). At the sitting both lines replace it, in one change,
 * with the release re-signed and the installer rebuilt (`npm run build`). */
export const ARMED_SIGNERS = [
  "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGfzETopBeZe5mbD7ukYwaZczyBPjJ4S3sX+Ly3rN3Vl bio-release",
];
