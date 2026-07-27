# Apps Script promotion service, retired runtime

**REMOVED July 27, 2026, per its own expiry condition.** The deployment was
deleted by Bob the same day, retiring its four bearer tokens by removing what
they opened; the workers and R2 storage tokens in the original Cloudflare
account were deleted; and the CivicOS and CivicOS-keys Drive folders were
deleted. The source had already given up the one thing it carried that
mattered, the embedded check catalog, extracted hash-verified into
`bio-plane/checks/bio-checks.mjs`. What it teaches lives in the plan's S-1
through S-9 narratives; the bytes themselves are recoverable from git history
if ever wanted, which is what made deleting them safe and keeping them noise.


`promotion-service.gs`, 3,832 lines, the accelerator that ran the record on
Google Apps Script and Drive before the Cloudflare plane replaced it.

**NOT OF RECORD.** This is source kept for what it teaches, not a system with
any standing. The store of reference is biosmoke6; the Drive store this code
wrote to is a frozen snapshot.

**Why it survived one more commit.** It carried the only copy of the check
catalog, embedded as the string constant `BIO_CHECKS_SOURCE` with its SHA-256
pinned beside it. That catalog is now extracted, hash-verified, and living at
`bio-plane/checks/bio-checks.mjs`. A scan for other embedded payloads over
2,000 characters found exactly one: the catalog. Nothing else is buried here.

**Its expiry condition.** This file goes overboard when the catalog port lands
in the plane and passes against the live record. At that point everything of
demonstrated value has been extracted and proven, and what remains is runtime
logic for a substrate we no longer use: `promoteBundleCore_`, `doGet`,
`monitorTickCore_`, `sweepDaemonCore_`, `leaseCore_`, `attestScanCore_`. The
design reasoning behind all of it is already written up in
`docs/architecture/BIO_Bundle_Skill_Composite_Design_v1_7.md`, which is doctrine
and stays.

**Credentials it referenced.** The code reads fourteen Script Properties. Eight
are secrets and NONE of their values are in this repository. Four of the eight
survive decommissioning because they are credentials in other systems:
`R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` (Cloudflare R2 object access) and
`SPN2_ACCESS` and `SPN2_SECRET` (Internet Archive Save Page Now, usable to
archive under the account holder's identity). Revoke those in their own systems.
The four `TOKEN_*` bearer tokens guard only this web endpoint and retire when
the deployment is deleted, not when it merely goes idle.
