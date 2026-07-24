# Deploying bio-plane

Four commands. No secret is ever typed on a command line, stored in shell
history, or pasted into a conversation.

## Why the last attempt failed

`npx wrangler deploy` was run in the probe folder, which is a local test
harness with no `wrangler.jsonc`. With no config, wrangler falls back to
autoconfig, guesses the project is a static site, and errors looking for HTML.
That was a missing file on my side, not anything you did wrong. This directory
has the config.

## 1. Create the two capture buckets

```bash
npx wrangler r2 bucket create bio-captures
npx wrangler r2 bucket create bio-published
```

`bio-captures` is the working corpus and stays private. `bio-published` holds
ratified material only and is what the public and the published-scope search
instance can see. The fence is the boundary between them.

Nothing signs an R2 request from outside Cloudflare. The Worker holds the
bucket as a binding, so there is no access key for this bucket at all, nothing
to rotate, and nothing that can leak.

## 2. Deploy

```bash
npx wrangler deploy
```

First run opens a browser to authenticate. That is the only login, and it
issues no credential you have to handle.

## 3. Generate and set the three tokens

Generate them locally, one at a time, and paste each into the prompt. `wrangler
secret put` reads from stdin, so nothing lands in `history`.

```bash
openssl rand -hex 32          # copy the output, then:
npx wrangler secret put ADMIN_TOKEN

openssl rand -hex 32
npx wrangler secret put MEMBER_TOKEN

openssl rand -hex 32
npx wrangler secret put PROBE_TOKEN
```

**Only the probe token is shared with me.** Keep admin and member. A probe token
can read, and it can write only inside the `scratch` namespace, enforced in
`src/index.mjs` before the request reaches the store. It cannot touch live
state, so a leak costs a scratch namespace and nothing else. Rotate it by
rerunning the one command.

## 4. Confirm it worked, by clicking a link

```
https://bio-plane.<your-subdomain>.workers.dev/?op=selftest&token=<probe token>
```

`wrangler deploy` prints the exact URL. The response is JSON reporting every
binding, the store's row counts, and a read-write check against R2. It returns
no secret. If `ok` is true and `bindingsAllPresent` is true, the deploy is good.

## 5. For me to test the live deployment

The Worker's hostname has to be reachable from my container's network
allowlist. `*.workers.dev` is not on it. Two options:

- Add `*.workers.dev` to the allowlist, or
- Route the Worker at a custom hostname under `believeinoakland.org` and
  allowlist that. This matches the existing pattern, where the accelerator is
  already fronted by a Cloudflare Worker on a domain you control.

Either way, the only credential I hold is the probe token.

## Local testing needs none of this

```bash
npm install && npm test
```

24 assertions against the real workerd runtime with local SQLite and local R2.
Zero credentials, by construction: no module reads a secret at import time, so
the whole tree loads and the whole battery runs with nothing configured. That
property is load-bearing and should be treated as a rule rather than a
convenience. If a future test appears to need a credential, that is a design
defect to fix rather than a token to issue.
