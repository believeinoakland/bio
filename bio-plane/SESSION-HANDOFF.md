# Session handoff: the installer is built

July 23, 2026, installer session. Complete replacement of the prior handoff.
The prior kickoff (`bio-plane/KICKOFF.md`) remains accurate for platform
facts and identifiers; this records what changed on top of it.

## Built this session, all tested

**Part 2, the wizard** (`newgroup/` tree, new). A stateless Worker at
`newgroup.believeinoakland.workers.dev` serving the wizard page, receiving
the OAuth return, and provisioning server-side, which the no-CORS finding
made mandatory. PKCE with the verifier in an HttpOnly cookie, token
exchanged server-side, provisioning streamed to the page step by step as it
happens. Install mode: refuse an existing name, attempt R2 and degrade
cleanly without it, upload the embedded release with the SQLite migration
and three fresh credentials, enable the address (registering an account
prefix if none exists, saying so on the page), verify with a live selftest,
hand over credentials once. Update mode: re-upload the current release with
`keep_bindings` preserving secrets, the Durable Object, and the buckets, no
migrations, verify by version. That closes the "no update path" gap the
kickoff flagged, without a fork or CI/CD. The wizard has zero bindings, so
the never-stored guarantee for the access token is structural. 48/48
assertions, including that the token appears in no byte the wizard emits and
that a state mismatch stops everything before the token endpoint is touched.

**Part 3, the setup page** (`bio-plane/src/setup.mjs`, new). Embedded in the
instance module and served at its root, so the single-module OAuth upload
needs no asset machinery. Claim with the one-time password (delivered from
the wizard in the URL fragment, which never leaves the browser and is
stripped on load), choose a real password, sign in, healthy panel. Recovery
and rearm states explained on the page in the same words as the docs. The
legacy root query API still answers.

**Part 1, the invitation** (`bio-plane/public/newgroup/index.html`,
rewritten). The old file was the dead no-backend design and is gone. The new
page is pure invitation: what a group copy is, prerequisites with the card
removed (see optional R2), what BIO can and cannot see, the manual-path
promise, and one deliberate button that explains the workers.dev address
before sending anyone there.

**Optional R2** (`src/index.mjs`, `src/livefire.mjs`). "Not configured" is a
first-class healthy state in selftest and livefire, distinct from broken;
half a fence fails loudly. This removes the payment method from the
prerequisites entirely, which the invitation page and both manual-path docs
now say.

**Bootstrap hardening** (`src/tokens.mjs`, new). Every token value ever
published in this repository is denylisted by SHA-256. A denylisted or empty
value can never authenticate and can never arm the bootstrap claim, so a
copy that ships with a leaked credential runs closed, not open. Livefire
asserts it on the deployment; the embed script refuses to package a release
containing a published value. The three 0.2.0 values in `dist/SECRETS.txt`
are therefore now dead everywhere.

**Docs.** `INSTALLER.md` rewritten, corrections applied (server-side wizard,
wizard-based updates). `SETUP.md` and `DEPLOY-DASHBOARD.md` updated for
optional R2, 0.3.0, and the published-value refusal. `newgroup/DEPLOY.md` is
the browser-only deployment path for the wizard.

**Version.** bio-plane is 0.3.0 in `wrangler.jsonc`, matching the kickoff's
"0.3.0 in spirit".

## Test state

- bio-plane: five suites, 101 assertions, green. New `test/installer.test.mjs`
  covers the denylist, empty tokens, optional R2 in selftest and livefire,
  and the setup page route. Livefire grew 16 to 18 with the token hygiene
  assertions; the local probe token in the livefire test lengthened past the
  16-character floor.
- newgroup: `test/wizard.test.mjs`, 48 assertions against a scripted
  management API, green. The bundled artifact itself smoke-tested.

## Still unverified, by construction

The token exchange at `dash.cloudflare.com/oauth2/token`, unreachable from
the sandbox. Every other leg of the conversation is tested against a
scripted upstream. The first real run in `newgroup/DEPLOY.md` step 4 answers
it, and names the two suspects if it fails: redirect URL exactness and scope
name strings on the OAuth client.

## Next, in order

1. Deploy the wizard per `newgroup/DEPLOY.md` and run the `bio-smoke`
   install while signed in to the new account. That is the token-exchange
   livefire.
2. Put the invitation page at `believeinoakland.org/newgroup` on the old
   account's hosting.
3. Use the installer to stand up BIO's own instance, the real test.
4. Then decommission the old deployment and continue the data plane
   migration.

Per-member credentials remain deliberately out of scope.
