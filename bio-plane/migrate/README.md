# Migrating the Drive store to a bio-plane instance

The tool replays the Google-side CivicOS store through the plane's public
API. Every migrated write passes the same CAS and append-only history path a
live write does, Drive-side snapshot keys are preserved verbatim, and every
reconstructed revision is cross-checked against the SHA-256s the original
promotion records wrote down at the time. A record that cannot be reproduced
aborts its bundle loudly; nothing partial ever lands.

## What it preserves

- Every revision of every bundle, replayed oldest to newest, base-chained.
- The Drive `_history` snapshot keys, verbatim, as the plane's history keys.
- Captures as content-addressed R2 objects through the capture op,
  server-verified. The `.b64` transport twins do NOT migrate: base64 is a
  deterministic function of the binary, so the bytes the RFC 3161 authority
  stamped can be regenerated on demand. Each twin is verified to decode to
  its binary AND to be byte-exactly reproducible by re-encoding, its hash
  is recorded in the provenance capture as the proof, and it is dropped. A
  twin that is not byte-reproducible is load-bearing for its token and is
  kept, flagged `TWIN_KEPT_UNREPRODUCIBLE`. A twin that lies aborts the
  bundle (`TWIN_MISMATCH`).
- The original promotion records, the `_history` manifest, and the bundle's
  index entry, verbatim, as a registered `migration/drive-provenance.json`
  capture per bundle, so the Drive era stays inspectable without polluting
  the live file image.

## Migration day, in order

1. Disable the accelerator daemon's time trigger in Apps Script. Confirm
   quiet: `index/index.json` and `index/invocations.jsonl` modified times
   stop moving for one full trigger interval.
2. In the Drive web UI, download the whole `CivicOS` folder (Drive zips it).
   Upload that zip to the migration session.
3. Run against the target instance with a member or admin token:

   ```
   node migrate/migrate.mjs --root <unzipped CivicOS dir> \
        --url https://<instance>.workers.dev --token <token> \
        --index <CivicOS dir>/index/index.json
   ```

   `--dry` walks, reconstructs, and cross-checks everything without writing.
   Run it first. `--only <bundleId>` migrates one bundle. `--verify-only`
   re-runs verification without migrating.

4. The run exits 0 only if every bundle migrated AND verified clean:
   live files byte-identical to the mirror, history complete under the
   original keys, live bundle.md hash equal to the index entry both locally
   and on the plane, and every capture answering byte-identical from R2.

A second run against an already-migrated bundle refuses at creation
(`EXISTS` through the CAS), so an accidental double-invocation cannot
double-write history.

## Known Drive-side facts the tool encodes

- Promotion record shape: `{target, base, files:[{name, sha256, encoding?}],
  created, author, skill_version}`; creation base is the empty-string SHA.
- `encoding: "base64"` entries hash the single-line base64 transport text of
  the named file, not its binary. The authoritative binary hash lives in
  `data/provenance.json` as `capture.sha256`.
- `_history` snapshots are named `<stem>_<stamp>_<hash8><ext>` and hold the
  files that promotion replaced; a promotion's snapshot key is
  `<stamp>_<hash8>` from its own record filename.
