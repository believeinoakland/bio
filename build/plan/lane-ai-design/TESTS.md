# AI-DESIGN live tests: proposals for Bob's agreement

**Status.** 2026-10-21, AI-DESIGN #2. Proposals only: **none has been run**, and none runs until Bob agrees it (charter). Each test is small, bottom up (K3558, K3574), uses synthetic content only, has a spend cap, and is repeated so that what held on repetition is recorded. Results will be written here, each with date, account, repeats and what held.

## L1 · Gateway-held key: Cloudflare keeps the key, the application never sees it
**Why.** `NOTES.md` §Q-secrets found that Cloudflare AI Gateway can store a provider key and add it to requests itself. Its documentation implies, but does not state outright, that a key stored only for AI Gateway cannot be read by a Worker. Gateway-held keys are now one of the credential means in the requirements (BR13), so this should be proven before anything relies on it.
**Where.** Civicsmith's own Cloudflare account (`20b533579290b9b93168345edd3b7f72`, the only one allowed by CLAUDE.md), through the Cloudflare access already connected to the lane's session. It creates one AI Gateway, one stored key and one small test Worker, all named `aidesign-test-*`, and deletes them afterwards.
**Needs from Bob.** One provider API key with a spend limit of a few dollars, entered by Bob himself in the Cloudflare dashboard (the lane never sees it); the steps will be given in plain words. An OpenRouter key with a $2 limit fits, or any provider on AI Gateway's list.
**Steps and what must hold (each repeated 5 times):**
1. A request through the gateway with no provider key succeeds, and the provider's answer comes back.
2. The test Worker's code tries every documented way to read the stored key (binding it, reading the environment); each attempt fails or returns nothing.
3. Binding the stored key to a Worker is rejected because its scope is AI Gateway only.
4. Deleting the stored key makes the next request fail with an authorisation error, not a fallback.
5. The request appears in the gateway's log with usage figures; whether it appears in the account's audit log is recorded.
**Cost.** A few cents of provider usage; AI Gateway's core features are free.
**Record.** 2026-10-21: **agreed by Bob** ("yes"). Access checked: the Cloudflare credential connected to the lane's session sees only account `20b533579290b9b93168345edd3b7f72` and can deploy Workers, but is refused ("Authentication error") for AI Gateway, Secrets Store and Workers AI. So the gateway and the stored key are created by Bob in the dashboard (which also keeps the key from the lane entirely); the lane deploys and runs the test Worker `aidesign-test-key`. Provider proposed: a Groq free-tier key (no payment, cannot be overspent; synthetic prompts only). Waiting for Bob's dashboard steps.

## L2 · OpenRouter: does a response say who really served it, and does a pinned request refuse to move?
**Why.** The requirements pin each OpenRouter request to one vetted host and refuse a response from any other (AIR18, BR12). OpenRouter's documentation does not show a response field naming the serving host, and does not say whether a pinned request fails or falls through when that host is unavailable (A9). Until both are proven, an OpenRouter entry cannot pass the "no hidden onward passing" check.
**When.** After OpenRouter support is built in the product, so the account is opened through the product's own path, as Bob sequenced (`REQUIREMENTS.md` §10, item 7).
**Needs from Bob.** An OpenRouter account with about $5 of credit.
**Steps and what must hold:**
1. For 3 models, 20 requests each: the Generation record for each finished request names the provider that served it, and it matches the pinned host every time.
2. A request pinned to one host with fallbacks off, where that host is made unavailable (an invalid or delisted host for that model): it fails with an error, 10 of 10 times, and never returns an answer from another host.
3. With zero-retention and no-data-collection routing set, a request to a model whose only hosts do not meet them is refused, 10 of 10 times.
**Cost.** Under $1.

## L3 · First screening run of the Gate 1 suite
**Why.** Gate 1's pass marks are Bob's once there are measurements (SR7). The first measurements come from the cheap screen (tiers T0 and T1, `SUITE-REQUIREMENTS.md` §7).
**When.** After the suite and test container exist (N1220).
**Candidates, cheapest first.** Models on Cloudflare Workers AI in Civicsmith's own account (no new account needed); then a few pinned OpenRouter hosts; then one direct account per provider as Bob's sample accounts arrive. Only models whose answers to the seven checks are recorded; no team content.
**What holds.** Every result names suite, bank, scorer and container versions; the cost estimate is shown before the run and the actual cost after; nothing beyond T1 runs without a further agreement.
**Cost.** Shown by the estimate before the run (SR40); a hard ceiling set by Bob.

## Order
L1 can run as soon as Bob agrees and has entered a capped key. L2 waits on the OpenRouter support being built; L3 waits on the suite.
