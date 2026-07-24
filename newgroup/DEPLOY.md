# Deploying the wizard, dashboard only

The wizard deploys to the NEW account, the one whose workers.dev prefix is
`believeinoakland` (account `20b533579290b9b93168345edd3b7f72`). It has no
bindings, no secrets, no buckets, and no Durable Objects: one module, pasted
once. That absence is deliberate and load-bearing; see wrangler.jsonc.

## 1. Create the Worker

Sign in to the new account. Workers & Pages, Create, Create Worker. The
dashboard then asks you to select a method. Choose the template method, the
hello-world starter. Do NOT choose "Upload and deploy": that is a static
site uploader, it warns about JavaScript files, and it cannot create a
module Worker.

On the naming step, replace the generated name with exactly `newgroup`,
because the name is the first part of the registered OAuth redirect URL and
a different name breaks the sign-in silently, on Cloudflare's side, before
any page of ours can explain it. Deploy the hello-world it offers.

## 2. Paste the module

Open the Worker, Edit code. Select everything in the editor, delete it, and
paste the entire contents of `dist/newgroup.bundled.mjs`. Deploy.

## 3. Verify the page

Open `https://newgroup.believeinoakland.workers.dev/`. You should see "Set
up your group's copy". Press Continue with a made-up name and no sign-in
will start only if the page shows an error; if the button sends you to
`dash.cloudflare.com` with a permission screen, the front half works.

## 4. The first real run

This answers the one question the sandbox could not: whether the token
exchange succeeds. While signed in to the new account (the OAuth client is
private, so only this account's members can authorize it), run a real
install named `bio-smoke`. Approve the permission screen. The progress page
should walk through every step and end with an address, a one-time password,
and two credentials. Open the address, claim it with a real password, and
confirm the setup page reaches its healthy panel.

If the very first step fails with a handshake error, the suspects in order
are: the redirect URL on the OAuth client not being character-identical to
`https://newgroup.believeinoakland.workers.dev/callback`, and the scope
names on the client not matching `workers-scripts.write`, `workers-r2.write`,
`account-settings.read`.

## 5. Clean up the smoke test

Delete the `bio-smoke` Worker in the dashboard, which takes its Durable
Object with it. If R2 buckets were created (only if this account has a card
on file), empty and delete them.

## Rebuilding after a bio-plane change

The wizard carries the release inside itself. In `newgroup/`: `npm run
build` re-bundles bio-plane, refuses to embed if any published token value
appears in the bundle, and produces a fresh `dist/newgroup.bundled.mjs` to
paste. Then paste and deploy as in step 2, and existing groups pick the
release up through the wizard's update option.
