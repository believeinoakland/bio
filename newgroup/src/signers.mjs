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
 * deliberate act by the maintainer, not a default. */
export const ARMED_SIGNERS = [
  "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGfzETopBeZe5mbD7ukYwaZczyBPjJ4S3sX+Ly3rN3Vl bio-release",
];
