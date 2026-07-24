# Believe in Oakland: BIO

The civic accountability record, as software a community group runs for
itself. A group's copy lives in its own Cloudflare account; Believe in
Oakland holds no key to it.

- `bio-plane/`: the data plane. A Worker control plane, a Durable Object
  holding the record's database, and object storage for captured evidence.
  The record is append-only and every write passes an integrity gate.
- `newgroup/`: the installer. A guided page that installs, claims, and
  updates a group's copy with no technical steps.
- `release/`: the current release the installer fetches and verifies:
  `RELEASE.json` (version and SHA-256) and the built worker module.

Install by invitation at the Believe in Oakland installer page.
