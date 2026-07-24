# Starting a BIO session

Claude reads everything it needs from this public repository at the start
of a session, with no credentials: the full source tree and the documents
in docs/. Attach nothing.

Say what to work on. If the session will do any of the following, grant
the matching permission when asked, or up front:

1. SHIP A RELEASE (push code, release files, or docs to this repo):
   paste a fresh GitHub token. Recipe lives in the password manager:
   GitHub, profile picture, Settings, Developer settings, Fine-grained
   tokens: 7-day expiry, only believeinoakland/bio, Contents read and
   write. Delete the token when the session is done.

2. TOUCH AN INSTANCE'S DATA (migrate, load, inspect the record from the
   session): in the Cloudflare dashboard, open that instance's Worker,
   Settings, set MEMBER_TOKEN to a throwaway value, paste it in chat.
   Set it back to the password-manager value after.

3. INSTALL OR UPDATE AN INSTANCE: no grant needed. The installer at
   newgroup.believeinoakland.workers.dev authenticates through
   Cloudflare's own sign-in with a click.

Release signing (planned with the write arc) will verify releases
against the member key registry, after which a long-lived GitHub token
in the password manager becomes acceptable convenience.

The state of the work lives in docs/BIO_DATAPLANE_STATE.md in this
repository. Claude keeps it current with every release.
