# Diagnosis R9: is the founder's Cloudflare account ready for a copy

Prepared 2026-10-24 for BOB. Research only: no Cloudflare API call was made, no account touched, no secret read. Code read at `origin/tranche/T51` (67eee9c967), `newgroup/src/`. Cloudflare documentation read 2026-10-24 by fetching developers.cloudflare.com pages (quotations are what the fetch returned for that page on that date).

Bob's ruling being served: the founder experience checks that the account is configured to support the copy about to be installed (and handles a copy already there); every unmet condition is handled in the UX, either by walking the founder through the steps or by provisioning on their behalf with their permission.

## 0. Summary

| # | Condition | Detected | Cloudflare lets the installer provision it | Installer today |
|---|---|---|---|---|
| 1 | Workers Paid plan | by provocation (probe upload) | not documented | COVERED |
| 2 | Payment method on the account | only indirectly (R2 refusal) | not documented | PARTIAL |
| 3 | R2 subscription (one-time checkout) | only by creating a bucket | not documented | PARTIAL |
| 4 | Containers available | GET containers/applications | not documented (GA on Paid, no enablement step documented) | PARTIAL |
| 5 | workers.dev subdomain registered | GET workers/subdomain | YES, `PUT /accounts/{id}/workers/subdomain` | PARTIAL |
| 6 | SQLite-backed Durable Objects | implied by 1 | n/a (available on Free and Paid) | COVERED |
| 7 | Account limits (workers, classes, buckets, containers) | list calls, fixed ceilings | no (limit increase form) | PARTIAL |
| 8 | Worker script size | none | n/a | MISSING |
| 9 | Account email verified | no field in `GET /user` | no | MISSING |
| 10 | The OAuth scopes granted | token response `scope` | n/a | PARTIAL |
| 11a | A Civicsmith copy already there (S1) | inventory | n/a | COVERED |
| 11b | Another tool's / unrecognized Workers or containers (F11) | foreign check | n/a | PARTIAL |
| 12 | Right account chosen (added) | `GET /accounts` | n/a | PARTIAL |
| 13 | Other account caps: cron triggers per account, container image storage (added) | none | no | MISSING |

Count: COVERED 3, PARTIAL 8, MISSING 3 (14 rows).

Two findings that change the code's footing, from the documentation read today:
- Containers and Sandbox SDK are now generally available on Workers Paid (changelog 2026-04-13). No page I read documents a "turn Containers on" step. The stop `screen.install.stopped.containers.do` tells the founder to "turn containers on", and the detector `CONTAINERS_OFF` matches a message nobody has shown Cloudflare gives (section 4).
- The limits the installer hard-codes are stale: the R2 bucket ceiling is 1,000,000 now (installer: 1000), and the "10 MB compressed script" limit in the brief no longer appears: the Workers limits page says "There is no compressed size limit. Only the uncompressed bundle size counts." (64 MiB).

## 1. Workers Paid plan

**Needed.** Containers are tied to Paid; CPU limits and the 500-Worker/500-DO-class ceilings are Paid. Docs, https://developers.cloudflare.com/workers/platform/limits/ (2026-10-24): "Workers per account | 100 | 500". Docs, https://developers.cloudflare.com/containers/pricing/ (2026-10-24): included monthly usage "as part of the $5 USD per month" (Free shows N/A). https://developers.cloudflare.com/workers/platform/pricing/ : "a minimum charge of $5 USD per month for an account"; "By default, users have access to the Workers Free plan."

**Detect.** The installer does not read a plan field; it PUTs a throwaway script `bio-plan-probe` with `limits.cpu_ms` and reads the refusal (`PUT /accounts/{id}/workers/scripts/bio-plan-probe`, error code 100328 means Free). Cloudflare's docs I read do not document code 100328 or that refusal: "not documented"; it is a measurement made by the 2026-07-31 BOB session (`probes.mjs:12-20`). What would settle it: Cloudflare's error-code page for Workers, or a re-run of `free-tier-fleet-probe.mjs` against a fresh Free account (a founder-side act, not done here). A documented alternative read exists but is not used: `GET /accounts/{id}/subscriptions` (https://developers.cloudflare.com/api/resources/accounts/subresources/subscriptions/ lists it; the page names no `rate_plan` ids and no read permission, so which id means Workers Paid is "not documented").

**Provision.** Not documented. The subscription endpoints exist (`POST /{accounts_or_zones}/{account_or_zone_id}/subscriptions`, page https://developers.cloudflare.com/api/resources/accounts/subresources/subscriptions/methods/create/ : "Creates an account or zone subscription.", Accepted Permissions "Billing Write"), but no page I read says a Workers Paid purchase is done this way, none gives the rate-plan id, and "Billing Write" is not among the six scopes on the installer's OAuth client (`index.mjs:67`). What would settle it: `GET https://api.cloudflare.com/client/v4/oauth/scopes` (the list the installer already cites, `index.mjs:60-62`) for a billing scope, and Cloudflare's confirmation that a Workers Paid purchase through the API is supported. Until then: walk-through.

**Founder steps (dashboard).** Docs give no steps ("The page doesn't include dashboard steps for upgrading to Workers Paid"). The only pointer found: the Browser Run docs say to "upgrade to a Workers Paid plan in the Workers plans page of the Cloudflare dashboard". Plain steps, to be checked against the live dashboard before wording is fixed: Cloudflare dashboard, Workers & Pages, Plans, choose Workers Paid, enter a payment method if asked, pay $5. The label wording is not documented.

**Today.** COVERED. Probe `probes.mjs:22-38`; install stop at `index.mjs:703-722` (words `screen.install.stopped.plan`, `.do`, `.done` button "Check again", `emit.retry`); unknown answer stops (`installer.install.stopped.planunknown`, no retry button). Requirements: installer R6, R70 (F2); installer-steps R7 (establishPlan). The update path re-establishes the plan only for containers (`containers.mjs:137-143`).

## 2. A payment method

**Needed.** Workers Paid is a subscription; R2 asks one in many accounts. The R2 pricing and get-started pages do not say a card is required (https://developers.cloudflare.com/r2/pricing/ : "The page doesn't say whether a payment method is required"; https://developers.cloudflare.com/r2/get-started/ : the payment requirement is not stated). The installer's words say it is ("Cloudflare requires a payment method on the account before that storage can be turned on", `installer.install.stopped.storage`): this is the 2026-09 field observation, not a documented fact. Mark "not documented".

**Detect.** No endpoint documented for "has a payment method". Billing profile endpoints exist in the API (not read, and not within the scopes held). Indirect only: the R2 bucket create refusing (section 3), or the plan upgrade failing in the dashboard.

**Provision.** No (a card is entered by the founder at Cloudflare; never by the installer).

**Founder steps.** Dashboard, Manage Account, Billing, Payment Methods, add a card (menu names not verified; "not documented" in the pages read).

**Today.** PARTIAL. Only through R2's refusal (`index.mjs:776-783`, stop `installer.install.stopped.storage` naming the payment method). Missing: a stop with a next step that re-checks (that stop uses `emit.fail`, no `emit.retry`, unlike plan and containers `index.mjs:707-711`, `725-728`): the founder must start again from the beginning. Requirements: installer R7, R70. Situation: none names it (F2 covers plan/containers only).

## 3. R2 enabled (the one-time subscription)

**Needed.** Docs, https://developers.cloudflare.com/r2/get-started/ (2026-10-24): "You need a Cloudflare account with an R2 subscription." "If you do not have one: Go to the Cloudflare Dashboard. Select Storage & databases > R2 > Overview. Complete the checkout flow to add an R2 subscription to your account." Verified: yes, a dashboard checkout exists.

**Detect.** Documented shape: R2 error table, https://developers.cloudflare.com/r2/api/error-codes/ : "10042 NotEntitled (403): Account not entitled to this feature." Fix: "Ensure your account has an R2 subscription". That table is the S3/R2 data-plane table; the same page "has no code that explicitly says R2 is 'not enabled'". The REST `POST /accounts/{id}/r2/buckets` page (https://developers.cloudflare.com/api/resources/r2/subresources/buckets/methods/create/) documents no error for R2 not being enabled. A read that does not create anything (`GET /accounts/{id}/r2/buckets`) would tell the same; whether its refusal is the same code is "not documented"; settled by one request to a fresh no-R2 account.

**Provision.** Not documented. "The page does not describe any API method for enabling R2." The subscription create endpoint (section 1) has no documented R2 rate-plan id.

**Founder steps.** The three quoted above, then return and choose "Check again".

**Today.** PARTIAL. Detection is by a write: `ensureBuckets` POSTs the two buckets (`probes.mjs:44-51`) at `index.mjs:776-783`, after the plan and room steps and after the release is chosen and the fleet fetched (`index.mjs:757-770`). Any error (not only not-entitled) becomes `installer.install.stopped.storage` with the founder's text claiming a payment method; no re-check button; "already exists" is read by message regex (`probes.mjs:48`; code 10073 BucketConflict is the documented one). Update path swallows the failure (`index.mjs:1205`). The test fixture's refusal text (`fixture.mjs:505`, `world.mjs:351`: "Please enable R2 by adding a payment method", 403) is invented, not Cloudflare's. Requirements: installer R7, R70. 

## 4. Containers available

**Needed.** Docs: https://developers.cloudflare.com/changelog/post/2026-04-13-containers-sandbox-ga/ : "Containers and Sandbox SDK are now generally available on the Workers Paid plan." https://developers.cloudflare.com/containers/get-started/ states no plan requirement and "doesn't describe" a dashboard enabling step; the only navigation: "Workers & Pages > Containers". Whether a separate switch exists on some accounts: not documented.

**Detect.** `GET /accounts/{id}/containers/applications` (https://developers.cloudflare.com/api/resources/containers/subresources/applications/methods/list/ : "Lists all the applications that are associated with your account."; no permission name or error text on the page). A 200 shows it reachable. The refusal text for an account without Containers: "not documented". What would settle it: one request from a Free account and from a Paid account with no application.

**Provision.** Not documented (no enable endpoint on the pages read). Where the cause is the plan, section 1 applies.

**Founder steps.** If Containers are off because of the plan: section 1. Otherwise: not documented; the installer's current text "open Compute (Workers), then Containers, and turn containers on" (`screen.install.stopped.containers.do`, rows.mjs:5855) is unsupported by the pages read.

**Today.** PARTIAL. `containersState` (`index.mjs:543-552`) sorts the answer by the regex `CONTAINERS_OFF` (`index.mjs:541`) which matches a message copied from the test fixture (`fixture.mjs:408`: "Containers are not enabled on this account. Enable Containers in the dashboard.", code 10000), not a measured Cloudflare answer. The stop with button `screen.install.stopped.containers.done` exists (`index.mjs:723-730`). Gaps: `state: "permission"` (token lacks the scope) is not stopped: the code at `index.mjs:723-740` handles only "off" and "unknown", so a missing scope passes the room step and the container members are later left out (`containers.mjs:129-135`); any real "off" message not matching the regex becomes "unknown" and stops with the lookup sentence plus containers advice. Requirements: installer R70, R38; installer-steps R20; situation F2.

## 5. A workers.dev subdomain registered

**Needed.** Yes: copies are reached at `<slug>.<sub>.workers.dev`. A brand-new account has none: https://developers.cloudflare.com/workers/configuration/routing/workers-dev/ "Cloudflare Workers accounts come with a `workers.dev` subdomain that is configurable in the Cloudflare dashboard" (it describes only changing, "doesn't describe a first-time registration flow"); the quickstart says "Once deployed, preview your Worker at its provided `workers.dev` subdomain" without saying how a first one is made.

**Detect.** `GET /accounts/{id}/workers/subdomain` ("Returns a Workers subdomain for an account."; permissions "Workers Scripts Write" or "Workers Scripts Read"). Answer when none is registered: "not documented" ("The page doesn't say which status code, `success` value, or error code is returned when no subdomain exists."). The installer assumes HTTP 404 (`probes.mjs:59`) or an empty `subdomain`. Settled by one read on a fresh account.

**Provision.** YES, with a permission it already holds. https://developers.cloudflare.com/api/resources/workers/subresources/subdomains/methods/update/ (2026-10-24): "Creates a Workers subdomain for an account." `PUT /accounts/{account_id}/workers/subdomain`, body `{"subdomain": string}`, "Accepted Permissions: Workers Scripts Write", example response `{"result": {"subdomain": "my-subdomain"}, "success": true}`. Availability check endpoint: none documented (the installer's own comment, `probes.mjs:53-55`). Taken-name error text: "not documented" (the installer matches /taken|exists|unavailable/, `probes.mjs:80`). Account subdomain rules: not documented on the page read (only the Worker-name rules: 63 or fewer characters, alphanumeric and dashes, not starting or ending with a dash).

**Founder steps (if not done by the installer).** Dashboard, Workers & Pages, "Your subdomain": Change (documented for changing; first registration wording not documented).

**Today.** PARTIAL. Detected and offered up front (`offerSubdomain`, `probes.mjs:56-62`, called at `index.mjs:740-742`, words `installer.address.offer`). Missing: (a) consent: it is a said sentence, no button; registration is permanent in practice (`probes.mjs:70-73`) and happens silently inside `ensureSubdomain` (`probes.mjs:64-87`, called `index.mjs:857`); (b) timing: registration happens at step `addr`, AFTER the plane and fleet are created, so a failure (both names taken) leaves a copy with no address (`index.mjs:873-875`, `installer.install.stopped.noaddress`), against R70's "before anything is created"; (c) only two candidate names; both taken has no "choose another" path; (d) the per-script enable `POST /workers/scripts/{slug}/subdomain` (`probes.mjs:84`) failing is the same stop. Requirements: installer R14, R70, R47; installer-steps R9; situation F7 (names that are taken; the subdomain case).

## 6. Durable Objects with SQLite storage

**Needed.** Docs, https://developers.cloudflare.com/durable-objects/platform/pricing/ (2026-10-24): Free: "Only Durable Objects with SQLite storage backend are available." Paid: "Durable Objects with the SQLite storage backend are available." So the condition holds for any account; the install uses `new_sqlite_classes` (`install.mjs:111`).

**Detect / provision.** Nothing to detect beyond the plan; creation is by the migration in the upload.

**Today.** COVERED (by the plan check, row 1; a refusal on upload is named per member, `install.mjs:122-125`). Requirements: installer R37 (migrations), R6.

## 7. Account limits

**Documented values (2026-10-24).**
- Workers per account: "Workers per account | 100 | 500"; "If you need a higher Worker limit, use Workers for Platforms." (https://developers.cloudflare.com/workers/platform/limits/)
- Durable Object classes: "Maximum Durable Object classes (per account): 500 (Workers Paid) / 100 (Free)" (https://developers.cloudflare.com/durable-objects/platform/limits/)
- R2 buckets: "Maximum number of buckets per account | 1,000,000" (https://developers.cloudflare.com/r2/platform/limits/); error "10009 TooManyBuckets (400): Account bucket limit exceeded (default: 1,000,000 buckets)."
- Containers: account limits "Concurrent memory 6 TiB; Concurrent vCPU 1,500; Concurrent disk 30 TB; Total image storage per account 50 GB"; "All instance size maximums and account limits on this page are defaults and can be increased." No count limit for applications is given (https://developers.cloudflare.com/containers/platform-details/limits/).
- Raise: "To request an adjustment to a limit, complete the Limit Increase Request Form." "If the limit can be increased, Cloudflare will contact you with next steps."

**Detect.** Counts only, by list calls (`GET /workers/scripts`, `/workers/durable_objects/namespaces?per_page=1000`, `/r2/buckets`, `/containers/applications`). No endpoint that states an account's own raised limit is documented ("not documented"; the installer's own comment says the same, `index.mjs:529-530`).

**Provision.** No. The founder either removes things or files Cloudflare's form.

**Founder steps.** Dashboard, remove an unused Worker/bucket/container application; or the Limit Increase Request Form (link on the pages above).

**Today.** PARTIAL. `ACCOUNT_LIMITS` (`index.mjs:511-516`) and `limitReached` (`index.mjs:518-527`) run in the room step before anything is created, with a stop naming the limit and the way out (`screen.install.stopped.limit`, `.do`, `index.mjs:734-737`). Missing: the buckets ceiling is 1000 against Cloudflare's 1,000,000; containers ceiling 100 has no documented source; classes use 500 even on a Free-plan account that was refused earlier (fine); no button to re-check after the founder clears space (the stop is `emit.fail`, not `emit.retry`); `listApps` errors are swallowed to an empty list (`index.mjs:519`), so the container count is unknown but read as zero. Requirements: installer R70; situation F3.

## 8. Worker script size

**Documented (2026-10-24).** https://developers.cloudflare.com/workers/platform/limits/ : "Worker size (uncompressed) | 64 MiB | 64 MiB"; "There is no compressed size limit. Only the uncompressed bundle size counts." The brief's "10 MB compressed on Paid" was not found on this page ("No '3 MB' or '10 MB' figures appear"); the page may have changed. What would settle it: a deploy of the largest member to a Paid account. The installer's comment records the plane as 29 MB and its gzip as 10 MB (`index.mjs:136`); whether 29 MB is uncompressed is not stated there.

**Detect.** The size of each member's bundle is known to the installer before upload; compare to 64 MiB. Not an account condition otherwise.

**Today.** MISSING. No size comparison anywhere in `newgroup/src` (grep for MiB, 10 MB, bundle size: only the comment at `index.mjs:136`); an over-size upload is a Cloudflare refusal reported per member or as the plane's failure. Requirements: none names it. Situation: none.

## 9. The account's email is verified

**Documented.** https://developers.cloudflare.com/fundamentals/user-profiles/verify-email-address/ : "You cannot perform certain tasks within the Cloudflare dashboard" (examples: adding a new member, changing the email address, updating communication preferences). Whether Workers, R2, or the OAuth consent require it: not documented on the pages read. A changelog line on temporary accounts says a new account "will need to verify your email address before continuing" (search result, not fetched in full).

**Detect.** `GET /user` ("Retrieves detailed information about the currently authenticated user", https://developers.cloudflare.com/api/resources/user/methods/get/): permissions "User Details Write" / "User Details Read"; the response has "no email_verified or similar flag", only an email and two-factor fields. So there is no documented read; and the installer holds no User scope. Not documented; what would settle it: the OAuth scope list for a user-read scope and a live `GET /user` on an unverified account.

**Provision.** No.

**Founder steps (documented).** "Find the verification message from Cloudflare (check your Spam folder if needed), open the link, and log in." Or "Log in to the dashboard, open My Profile, and choose the option to send a new verification email under Email Address. If that option isn't available, your email is already verified." "In My Profile, a verified address displays '(verified)' after it."

**Today.** MISSING. No code mentions verification. An unverified account that Cloudflare refuses would reach the generic lookup stop (`installer.install.stopped.lookup`, `index.mjs:793`) or the storage stop with a wrong cause. Requirements and situations: none.

## 10. The OAuth scopes the installer asks

**Asked** (`index.mjs:67`): `workers-scripts.write`, `workers-r2.write`, `account-settings.read`, `containers.write`, `connectivity-directory.bind`, `account-logs.read` (six; installer R2). Scope names come from `GET /client/v4/oauth/scopes` as read by an earlier session, 2026-10-06 and 2026-10-08 (`index.mjs:60-66`). Cloudflare's developer pages for OAuth for third parties: a fetch of `/fundamentals/api/get-started/oauth/` returned 404; the scope list itself is "not documented" on a page I could reach.

**Detect.** The token response's `scope` string (`index.mjs:298`) is read; only `containers.write` is tested (`containers.mjs:131`). Whether Cloudflare's consent screen lets a founder untick a scope: not documented; what would settle it: one real consent.

**Provision.** n/a. A missing scope means asking the founder to approve again (F6 `screen.install.approveagain` covers an expired or revoked grant, `installer` R71).

**Today.** PARTIAL. Missing: nothing checks that `workers-scripts.write`, `workers-r2.write`, `account-settings.read` are in the granted scope before step one; a refusal arrives as `NO_PERMISSION`-matched text or the lookup stop; `connectivity-directory.bind` refusal is handled (`install.mjs:60-72`); `account-logs.read` is handled in R46's own step. Requirements: installer R2, R71; situation F6.

## 11a. A Civicsmith copy already in the account (S1)

**Detect.** Inventory from the account's own lists: Workers that hold the Durable Object class `Store`, buckets, fleet workers (`inventory`, `account.mjs:76-109`).

**Today.** COVERED. `index.mjs:671-690`: finished copy, unfinished copy (resumed, R69), fixed-name leftovers, stray slugged buckets; stops with nothing created and draws `existsPanel` with update / install alongside / remove (R62, R64, R65); a taken name offers a free one (`nametaken`, F7). Requirements: installer R62, R63, R64, R65, R69; installer-steps R3; situation S1.

## 11b. Something else already there (another tool; a retired part) (F11)

**Today.** PARTIAL. The foreign check `foreignContainers` (`index.mjs:573+`) stops on a container application with a name that is not the copy's, but runs only for an update (R74) and for an install that resumes an unfinished copy (`index.mjs:758-766`). A first install into an account with other tools' Workers, Durable Objects or container applications is not looked at beyond name collision and the limits count (`index.mjs:671-690`, `734`); nothing is said to the founder about what is already there. Whether that matters (it consumes limits, and a wildcard-free naming means no collision) is BOB's call. Requirements: installer R74, R70; situation F11.

## 12. The right account (added)

A sign-in can list several accounts (`GET /accounts`). The installer takes the first and names it (`index.mjs:648-650`, R4: "The first account the permission lists is used, and it is named on the page"). A founder with several accounts (personal and an organization's) gets no choice, and the account may be a member-role account that cannot buy Workers Paid or R2. Whether the OAuth consent itself lets the founder pick an account: not documented; what would settle it: one real consent with two accounts.

**Today.** PARTIAL: named, not chosen. Requirement: installer R4.

## 13. Other account caps (added)

Documented: "Number of Cron Triggers per account | 5 | 250" (Workers limits page); "Total image storage per account | 50 GB" (Containers limits page). The copy sets up to three cron triggers per member (`containers.mjs:98`) and two container images. Neither is counted.

**Today.** MISSING (low risk: a fresh Paid account is far from either). Requirements and situations: none.

## 14. GAPS

Each gap: condition; code site; what the installer should do; the test that shows it (a fixture with Cloudflare's real answer shape; where the real shape is "not documented" the fixture must first be captured by one measured request by BOB's leave, and the fixture records where it came from).

1. **Payment method / R2 subscription are one opaque stop with no re-check.** `index.mjs:776-783`; `installer.install.stopped.storage`. Do: a pre-check in the room step that does not write (a read of `/r2/buckets` and its refusal, once measured); on refusal, walk-through (the three documented R2 checkout steps, then a "Check again" button via `emit.retry`, as plan and containers do); never provision (a card is the founder's). Test: fixture answering 403 with R2's documented `code: 10042` ("Account not entitled to this feature.") to `GET /r2/buckets`: the run stops before any write, names the checkout, offers the button; after the button the fixture answers 200 and the run completes. Control: a clean account passes. A second fixture: a refusal of another kind (500) is not told as "payment method".
2. **Containers "off" is a guess.** `index.mjs:541-552`, `723-740`; `screen.install.stopped.containers.do`. Do: measure the real refusal of `GET /containers/applications` on a Free account and on a Paid account with none; match on the code, not words; where the cause is the plan, send to the plan stop; drop "turn containers on" unless Cloudflare documents a switch; treat `state: "permission"` as a stop that asks for the grant again. Test: fixtures with the measured shapes (Free, Paid-empty, scope missing); the scope-missing fixture stops before any write.
3. **workers.dev subdomain is registered late and without consent.** `probes.mjs:64-87`, `index.mjs:740-742`, `857-875`. Do: in the room step, when `GET workers/subdomain` shows none, ask the founder (a button: "Use <name>.workers.dev"; editable name; the permanence stated) and register with `PUT /workers/subdomain` BEFORE the plane is created; on "taken", offer another name; drop the silent two-name try. Test: a fresh-account fixture (the 404/empty shape, once measured) with the first name taken: the page asks, registers the founder's choice before the first upload; no script is created when the founder declines.
4. **Stale account ceilings.** `index.mjs:511-516`. Do: set buckets to 1,000,000; delete the container count ceiling (none documented) or source it; use the Free numbers only when the plan is Free (100 Workers, 100 DO classes); add a re-check button to the limit stop. Test: an account holding 999 buckets passes; one at 500 Workers stops with the limit sentence and the button; control: 499 plus the fleet at the limit stops.
5. **Containers `listApps` failure read as zero.** `index.mjs:519`. Do: an unreadable count is "could not tell" and is said, never zero. Test: a fixture whose containers list answers 403 does not pass silently.
6. **Script size.** `index.mjs` (no site). Do: compare each bundle (uncompressed) with 64 MiB before upload and stop that member by name; and settle the "10 MB compressed" claim by one deploy. Test: a member bundle of 65 MiB is refused before any write, naming the member.
7. **Email not verified.** New step, before `fresh`. Do: if a read exists (not documented), check; else map Cloudflare's refusal (once measured) to the documented walk-through (My Profile, resend, "(verified)") with a re-check button. Test: a fixture with the measured unverified-account refusal on the first write-class call stops with the My Profile steps and a button.
8. **First install beside other tools.** `index.mjs:671-690`, `758-766`. Do: when the inventory finds Workers, Durable Object classes or container applications not the copy's, say what is there in plain words before creating, and count them against the limits (BOB decides whether to stop; today it does not). Test: an account holding two unrelated Workers and a container application on an unrelated class installs and the page names them; control: with limits at ceiling it stops by F3.
9. **OAuth scopes granted.** `index.mjs:642`, `containers.mjs:131`. Do: compare the token response's `scope` with the five that every install needs and, when one is missing, ask to approve again (R71's page) before the first call. Test: a token response lacking `workers-r2.write` stops with the approve-again page and no call made.
10. **More than one account.** `index.mjs:648-650`. Do: when `GET /accounts` returns more than one, ask the founder which (names only), keep the choice in the cookie as the other choices are. Test: a two-account fixture draws the choice; the install uses the chosen id.
11. **Cron triggers and image storage caps.** `containers.mjs:98`, `index.mjs:511`. Do: count the account's existing cron triggers (read) and add to the limits table (250); skip image storage (50 GB) unless the images' sizes are known. Test: an account at 249 triggers stops by F3.
12. **Provisioning with permission, where Cloudflare allows it (only the subdomain today).** Plan, R2 and containers cannot be provisioned by the installer on the evidence of Cloudflare's current documentation: the subscription create endpoint exists but its rate-plan ids and a billing scope on the OAuth client are not documented as usable. Do: have Bob's Cloudflare contact (or one `GET /client/v4/oauth/scopes` read) settle whether a billing scope exists and a Workers Paid / R2 rate-plan id can be sent; if yes it is a new scope on the client (Bob's act, K3815-style) and a new requirement; if no, the walk-throughs of 1 to 3 stand. Test (if yes): a fixture whose `POST /subscriptions` is called only after the founder's click and never otherwise.

Common to all: the stops use `emit.fail` (a dead end) where plan and containers use `emit.retry` (a button). Every account-readiness stop should end with the re-check button and say nothing was created (R4, R75).

## 15. Sources (all fetched 2026-10-24)

- https://developers.cloudflare.com/api/resources/workers/subresources/subdomains/methods/update/ and `.../methods/get/`
- https://developers.cloudflare.com/workers/configuration/routing/workers-dev/
- https://developers.cloudflare.com/workers/platform/limits/ ; https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/r2/get-started/ ; https://developers.cloudflare.com/r2/pricing/ ; https://developers.cloudflare.com/r2/platform/limits/ ; https://developers.cloudflare.com/r2/api/error-codes/ ; https://developers.cloudflare.com/api/resources/r2/subresources/buckets/methods/create/
- https://developers.cloudflare.com/containers/pricing/ ; https://developers.cloudflare.com/containers/get-started/ ; https://developers.cloudflare.com/containers/platform-details/limits/ ; https://developers.cloudflare.com/changelog/post/2026-04-13-containers-sandbox-ga/ ; https://developers.cloudflare.com/api/resources/containers/subresources/applications/methods/list/
- https://developers.cloudflare.com/durable-objects/platform/pricing/ ; https://developers.cloudflare.com/durable-objects/platform/limits/
- https://developers.cloudflare.com/api/resources/accounts/subresources/subscriptions/ and `.../methods/create/`
- https://developers.cloudflare.com/fundamentals/user-profiles/verify-email-address/ ; https://developers.cloudflare.com/api/resources/user/methods/get/

Caveat: the fetch tool answers through a small summarizing model; the quoted sentences should be re-checked against the live page before they are put in a requirement or a user-facing word.
