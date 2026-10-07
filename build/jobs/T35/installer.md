# installer (T35)

**Status** · session_01QqohgZCP4a7QUZydHh4NT7 · depth 2 · COMPLETE · handled B1

## Completion (T35-75)

**Entries applied**
- (K1905) `requirements.test.mjs` R11's "foreign-plane" and "not-newer" cases read R40's wording ("signed against a different release of Civicsmith than the one just installed"). Red 12 is cleared.
- (F1, K1874; R15) The verify step (`verifyInstall`) sends the probe credential only as `Authorization: Bearer <credential>` (admission R20's first form); the address is the bare `/api/?op=selftest`. R15's test checks every verify request's address and header, and a whole install with sentinel credentials: no generated credential and no Cloudflare token appears in the address of any request; the probe credential travels only in the verify step's header. A negative control (the query form restored) failed R14 and R15 by name. The file was restored and checked with `cmp`.
- (N657, DEC-143; R41) The install page's button that chooses the short name ("Continue with this short name") shows the Irreversible weight: five pips with the word beside them. Pressing it sends nothing. It opens a `<dialog>` whose heading names the short name typed ("“<slug>” is permanent"). The dialog text says the name is in every address and beside every signature, becomes the worker's name, and can never be changed, by you or anyone, without installing a new Civicsmith and starting again. The words are the design stream's install screen (`layouts.html`, `SCR.install`), with the worker's name added as R41 states it. Only "Install with this short name" (which also carries the weight) sends `/begin`. "Choose another name", or Esc, sends nothing. The update page shows no weight and no dialog. The slug hint now says the name can never be changed. R41's test runs the page's own script against a small DOM stand-in. It checks that pressing the button sends nothing and opens the dialog naming the slug, that closing it sends nothing, that only confirming sends `/begin` with that slug, and that the update page sends at once.
- (N660, DEC-146; R42) `ui.mjs` holds `DESCRIPTION` and `WHO` once. The install page shows them under its heading and uses `DESCRIPTION` as its meta description. The invitation page carries the same two lines as static text, and its heading is now "Start your group's own Civicsmith". The superseded one-liners are gone: "the accountability record" and "Civicsmith is a public, tamper-evident record". R42's test checks both lines byte for byte against R42's text on both pages. Over every page the suite renders, it finds no "civic groups" and no "and other organisations".

**Also fixed in this module (F1's doctrine, every credential out of addresses):** R18's notice told the operator to send the seed act with `&token=…` in the address. It now says to send the ADMIN_TOKEN in the `Authorization: Bearer` header, never in the address. R18's test checks this, and that the notice contains no `token=`.

**Deferred:** none. R13 and R24 stay carried (plan rule 2, F11; MULTI-INSTANCE-ISOLATION).

**Found in other modules and process (REPORT J2)**
1. `newgroup/dist/newgroup.bundled.mjs` (generated, `build/manifest.md` §14) is stale from this change. `newgroup-bundle-fresh` (C) fails, (A) and (B) pass. Not edited by hand. BOB regenerates it at L11's close (`cd newgroup && npm run build`).
2. Deploy order: the verify step now sends the probe credential only in the header. The plane reads it there only from admission T35-71 (R20); today's `bio-plane/src/admission/index.mjs` reads only `?token=` (:180, :431, :440, :552). The installer must not be deployed until `newgroup/src/release.mjs` embeds a release carrying admission R20 (0.81.0 or later, held by K1922). Deployed over an older embed, the verify step would read every new install as "not woken up yet". Nothing is deployed in T35, so this is a note for the cut.
3. The requirements markers `*(not yet met: T35)*` on installer R15, R41 and R42 can be cleared at the merge (BOB's file).
4. Optional: the Suggestion's byte-for-byte test against `public-read` R30's exports needs a `uses` edge from installer to public-read (test-only). I left it out and test against R42's literal lines. BOB adds the edge if wanted.

**Tests and checks** (on `job/T35/installer` @ 17c2e4363e)
- `node --test newgroup/test/requirements.test.mjs`: tests 43, pass 41, fail 0, todo 2 (R13, R24).
- `node newgroup/test/wizard.test.mjs`: wizard: 208 passed, 0 failed.
- `node newgroup/test/embed.test.mjs`: embed: 23 passed, 0 failed.
- `node bio-plane/test/system/newgroup-bundle-fresh.test.mjs`: 3 passed, 1 failed, (C), the stale generated bundle (report item 1).
- Layer tests: none named in `build/manifest.md`. No service I provide changed.
- `checks/format.mjs`: 133 modules, 132 requirements files; 0 failures. `checks/architecture.mjs installer`: 17 product files, 33 relative imports; 0 failures. `checks/coverage.mjs installer`: 42 of 42 live requirement ids named by a test; 0 failures. `checks/ownership.mjs installer tranche/T35`: 5 files changed; 0 failures.

Size (session_01QqohgZCP4a7QUZydHh4NT7): test runs 7, module lines 2380

## J1 · REPORT

Findings outside installer from T35-75 (also in my record):
1. Generated artifact stale: `newgroup/dist/newgroup.bundled.mjs`. `newgroup-bundle-fresh` (C) fails, (A) and (B) pass. Not edited by hand; please regenerate it at L11's close (`cd newgroup && npm run build`).
2. Deploy order: the verify step now sends the probe credential only as `Authorization: Bearer` (R15, F1). Today's admission (`bio-plane/src/admission/index.mjs` :180, :431, :440, :552) reads only `?token=`; it reads the header from T35-71 (R20). The installer must not be deployed until `newgroup/src/release.mjs` embeds a release carrying admission R20 (0.81.0 or later, held by K1922). Over an older embed, every new install would read as "not woken up yet". Nothing is deployed in T35; a note for the cut.
3. installer R15, R41 and R42's `*(not yet met: T35)*` markers can be cleared at the merge.
4. Optional: the Suggestion's byte-for-byte test against public-read R30's exports needs a test-only `uses` edge, installer to public-read. I tested against R42's literal lines instead. Add the edge if you want it.

## J2 · COMPLETE

T35-75 complete on `job/T35/installer`. Done: K1905's R11 wording (red 12 cleared). R15 (F1): the probe credential travels in the header only, with a sentinel test and a negative control. R41: the Irreversible weight, and a permanence dialog naming the short name; only the confirming act sends /begin. R42: DEC-146's two lines on the install and invitation pages. Also fixed: R18's seed instruction now tells the operator to put the credential in the header, not the address.
Tests: requirements 41 pass / 0 fail / 2 todo (R13, R24); wizard 208/0; embed 23/0; newgroup-bundle-fresh 3/1 (C: the stale generated bundle, REPORT item 1). Checks: format, architecture, coverage (42/42), ownership, 0 failures each. Deferred: none. Details in the record.
