# Diagnosis of walk-T51-final sitting 02 (People): the 17 BROKEN rows and 35 overlay findings

Read: record `build/plan/archive/walk-T51-final/02-people.md` at branch commit `8a584c24bc` (tranche/T51; 191 lines, read whole, every BROKEN row and every overlay line); product read in `/home/user/wt-diag02` at `8a584c24bc` (tranche/T51). The walker's script `build/plan/walk-T51-final/scripts/02-people.test.mjs` (1,223 lines) was read at the rows it cites, and `lib.mjs`; the coverage rows `coverage/02-people.md` and `coverage/overlay.md` for what each row was asked to check. `fix-round-10-T51.md` §3 (items 7 to 74) was read whole and every diagnosis in this folder grepped. Rows are cited as record line numbers (L54 = line 54). I ran no Chromium. Probes I ran: the control-plane `harness.mjs` over the door's stamps (kept at `/tmp/claude-0/-home-user-bio/c2f2fba9-69d1-5e19-bd9f-87220e7b08a5/scratchpad/p02/by-stamp.test.mjs`, not in the tree), `r128-rpc-stub.test.mjs` (green), and an arithmetic check of OV.18's number.

The record's own counts (84 WORKS, 19 BROKEN, 12 NOT REACHED) are not what the table holds: it has 85 WORKS, 17 BROKEN (L54, L55, L64, L65, L66, L69, L95, L99, L104, L109, L117, L119, L126, L129, L139, L143, L150) and 13 NOT REACHED. This file diagnoses the 17 rows, the walker's ten MAJOR findings and the rest of its findings list, and all 35 overlay lines.

**Placement of every BROKEN row** (record line: cause number): L54: 8; L55: 4; L64: 2; L65: 10; L66: 3; L69: 21; L95: 9; L99: 5 and 15; L104: 16; L109: 6; L117: 7 (already placed: item 60); L119: 17; L126: 11; L129: 12; L139: 18; L143: 13; L150: 1. Findings with no BROKEN row: the rate limit (MAJOR 10): 14; R11.d2: 22; overlay 17 (26 lines): 19; overlay 15 (9 lines): 20 and 21; R04.c2: 21.

Only one cause is already placed in the fix round: 7 (item 60). Cause 5 is the same class as diag2-03b #1 and diag2-11 #1 (item 74: a declared `by` stamp is the viewer form `member:<id>` where the owner reads the bare id) on another op; it is listed as new.

| # | Record | Rows | Verdict | Owning module | One-line cause |
|---|---|---|---|---|---|
| 1 | R04.q | L150 | DEFECT (MAJOR) | interface-shell | `send` ends the session on any 401 (`browser.mjs:161`) before it reads the `SESSION_LOCKED` the plane answers with a 401, so a locked own-device session opened again draws the sign-in screen |
| 2 | R06.a | L64 | DEFECT (MAJOR) | screens-entry | the join screen draws `v.cover` only (`join.mjs:66`); role and capabilities, which `inviteLook` answers, are never drawn (an administrator invitation looks like any other) |
| 3 | R06.c | L66 | DEFECT (MINOR) | screens-entry | the handle watcher is started only by the first press of "See whether a handle is free" (`join.mjs:119-134`), though R7 says "checked as typed" |
| 4 | R10.d | L55 | DEFECT (MINOR) | member-roster | `memberAdd` filters unknown capabilities away and reads any role but `admin` as `member` (`index.mjs:946`, `:952`); R9 lists no refusal for either, and R6 and R35 refuse the same input |
| 5 | R11.e (part) | L99 | DEFECT (MAJOR) | control-plane | `adminremovalsopen` is stamped `by` = `member:<id>` (the declared stamp) and the roster wants the bare id, so every enrolled administrator is answered NOT_AN_ADMIN and the Members page draws no "Agree" |
| 6 | R15.a | L109 | DEFECT (MAJOR) | screens-settings | the bias form's `promote` carries no `bundleId` (`bias.mjs:264`); R65 lists the body without one and promotion R7 requires it |
| 7 | R17.e | L117 | already placed: item 60 (fixed at `017148fef2`, after the walker's base) | control-plane | the phase clock called stub methods through `.apply`, which fails on a workerd RPC stub |
| 8 | R10.c | L54 | SPECIFIED (member-roster R9) | member-roster | `memberAdd` refuses any `expertise` by design; the coverage row asks for what R9 forbids |
| 9 | R11.a2 | L95 | SPECIFIED (member-roster R8) | member-roster | no hosting-access question rides on adding an administrator (DEC-134 (3)); it is asked at setup and in the group's settings |
| 10 | R06.b | L65 | SPECIFIED (screens-entry R7, R31) | screens-entry | no language is offered, so no choice is drawn (R31's control); the walk's team had offered none |
| 11 | R122.c | L126 | SPECIFIED (interface-shell R93) | screens-settings | only reads marked `refresh: true` re-read; the roster's `memberlist` is not one (a UX choice for BOB) |
| 12 | R123.b | L129 | SPECIFIED (hypotheses R11, R19; DEC-408) | hypotheses | `noteWrite` warns of nothing; the person warning rides `noteShare`; DEC-408 lets a note hold an address or phone number |
| 13 | OV.7 | L143 | SPECIFIED (design + member-roster R9) | screens-settings | the invite form ticks "contribute" as the design draws it and R9 defaults it |
| 14 | R04.g2 (finding 10) | none | SPECIFIED (admission R21) | admission | public ops are counted at 300 per source per 10 minutes by requirement |
| 15 | R11.e (part) | L99 | WALKER ERROR | none | the "raw code as words" is the door answer read by the script's `words()`; the screen draws `refusal.VOTES_SHORT` |
| 16 | R13.c | L104 | WALKER ERROR | none | the Miniflare room binds no `ACCOUNT_SEAL_SECRET`; the "vendor list 0 entries" is a regexp for text no screen holds |
| 17 | R121.a | L119 | WALKER ERROR | none | the script reads a path only if it holds "›"; Settings' own path is the one step "Settings" (the design's) |
| 18 | OV.18 | L139 | WALKER ERROR | none | `lum()` reads Chromium's `color(srgb 0.8 0.84 0.86)` as 0-255 channels; the true ratio is 10.97, the mis-read one is 1.29 |
| 19 | Overlay 17 | 26 lines | WALKER ERROR (part) / UNKNOWN (rest) | none | the script counts 24 px radios and checkboxes (their label is the 44 px target) and every `a[data-nav]` link; the rest names no control |
| 20 | Overlay 15 "copy" | 8 lines | WALKER ERROR | none | `/\bcopy\b/` matches the verb on a button ("Copy them") and "a safe copy" of a document; the rule bars "copy" for the installation |
| 21 | R06.f2, R04.c2, overlay 15 "confidential" | L69; 1 line | WORDS/LAYOUT ONLY | UX design stream | the shared key `screen.entry.codes.what` says "claimed" to a joiner; the hover card covers a refusal; a place profile's text says "confidential" |
| 22 | R11.d2 | none | UNKNOWN | member-roster | the code answers NOT_PROPOSED for an existing member; the walker saw NO_SUCH_MEMBER; one reproduction is owed |

Policy flags for BOB (whether Bob's): cause 11 (should the roster be a live list; the coverage row's source is not a requirement), cause 12 (should a note that names a private person warn at the write, as a share does), cause 14 (is 300 per 10 minutes per address the number for a team behind one office address), cause 2 (what an invitation shows: the design's sentence needs the inviter and the expiry that `inviteLook` does not answer).

---

## 1. 02 L150 R04.q "a locked own-device session opened again draws the sign-in screen, not Welcome back / Unlock" -- DEFECT (MAJOR), interface-shell

### 1. Root cause with evidence
- The page asks `whoami` on load: `interface-shell/browser.mjs:1636` `const who = await call("whoami", { background, noLock: true });`. The plane answers a locked session HTTP **401** with the code in the body: `admission/index.mjs:695` `return { refusal: { status: 401, body: Credentials.sessionLockedRefusal() } };` (the walker's own R04.n row: "whoami answers HTTP 401 ... SESSION_LOCKED").
- `send` tests the status before it reads the body: `browser.mjs:161` `if (r.status === 401 && !own && !pub) { if (S && S === held) over("ended"); return { kind: "silent" }; }`. The lock branches that follow are unreachable for a 401: `:169` `if (a.code === "SESSION_LOCKED" && !own && !pub && !req.noLock && S === held) lock(false);` and `:1654` `if (who.kind === "refused" && who.code === "SESSION_LOCKED") return "locked";`.
- Chain: `over("ended")` (`:89`) runs `clearRecord` (`:83`, `local.del(D.storeKey)`), so `S` is null; `whoami()` returns `"none"` at `:1637` `if (!S) return "none";`; `route()` takes `:1600` `if (got === "none") { keepReturn(); ENTRY = { state: null, handle: null }; return showFront(); }`, the signed-out `front` (the walker's A and B text, "Your team HAVE SOMETHING FOR US?"), with the record gone: nothing of the place is kept. The `got === "locked"` arm (`:1594-1598`, which draws `front` locked) can never run against the real plane.
- Requirements disagree on the word "401": interface-shell R3 "A `401` answer to any request clears the record and goes to `/`" and R32 "A 401 clears the record and draws `front`'s ended state", against R33 "the plane's `SESSION_LOCKED` or 401 governs over the page's clock" and credentials R65. The plane's lock answer is a 401 (admission R24: "401: the session authenticates nobody for it until it is unlocked").

### 2. Why the tests missed it
`interface-shell/idle.test.mjs:63-66` scripts the lock as `refused("SESSION_LOCKED", "Locked.", 403)` and the only 401 case is `refused("SESSION_ENDED", null, 401)`; `idle.test.mjs:98` (`whoami: ... refused("SESSION_LOCKED", null, 403)`) and `sweep.test.mjs:40` (same, 403) are the front-locked cases. All three use a status the plane never gives a locked session. `admission/t47.test.mjs` pins the 401 but no test joins the two.

### 3. Failing-first test
`bio-plane/test/m/interface-shell/idle.test.mjs`: the same as `:96-104` with `whoami: refused("SESSION_LOCKED", null, 401)` carrying the plane's body (`{ok:false, reason:"SESSION_LOCKED", code:"SESSION_LOCKED", translation}`): boot `/app/held`; assert the screen is `front`, its state text reads `locked`, the handle field holds the record's handle, and the record key is still in `localStorage`; then `unlock` returns to `/app/held`. A second case: a held screen open, a read answers 401 `SESSION_LOCKED`: the lock overlay is drawn (`lockOf(p)` non-null), the record kept; control: a 401 `NOT_AUTHENTICATED` still ends the session (today's `:66` case). The walker's case through the real entry: a Miniflare room (`r8-kit.mjs`), own-device login, the plane clock moved 31 minutes (credentials `3227a15ed9`: the instance clock reads `env.BIO_NOW_MS`; no real-time wait), `whoami` answers 401 `SESSION_LOCKED` (R04.n), then Chromium opens a deep link with the record in `localStorage` (A: token only; B: with the tab's idle mark): "Welcome back" and Unlock draw, the password returns to the place.

### 4. Platform
None for the logic (browser JavaScript over a `Response`; the jsdom harness holds it). The check at its real shape is the walker's A and B re-walk in Chromium; the wait is no longer real time with `BIO_NOW_MS`.

### Requirement
interface-shell R3, R32 and R33. Wording: add to R3 and R32 "except a 401 whose answer names `SESSION_LOCKED`, which draws the lock (R33) and keeps the record".

---

## 2. 02 L64 R06.a "the invitation screen draws the cover only, not role, capabilities or expertise" -- DEFECT (MAJOR), screens-entry

### 1. Root cause with evidence
- The plane gives all four: `member-roster/index.mjs:1040-1041` `return { ok: true, cover: m.cover, role: m.role, capabilities: this.#capsOf(m), expertise: ... }`, with the comment above it "The cover and capabilities are shown because the invitee is entitled to see what they are being asked to join as" (`:1034-1036`); member-roster R12 "returns `{cover, role, capabilities, expertise}`".
- The screen draws one of them: `screens-entry/join.mjs:66` `return \`<h1 class="t-title">${W(S + "invited", { group })}</h1>\` + (v.cover ? \`<p class="mk-sub">${W(S + "invited.as", { cover: v.cover })}</p>\` : "")` ("You were invited as Rosa from the library."). `v.role`, `v.capabilities`, `v.expertise` are read nowhere in `join.mjs` (grep). An invitation to be an administrator reads like any other.
- The design draws a sentence that names the capability: `docs/development/ux-substrate/screens/mock-screens.js:585` `h1('You\'re invited to Lakeshore Tenants', 'Rosa invited you to contribute. This link works once and expires on October 13, 2026.')`, its key `screen.join.invited.by` ("{name} invited you to contribute. This link works once and expires on {date}.", `setup-words/rows.mjs:4727`), which no code reads (grep). That sentence needs the inviter and the expiry, neither of which R12's answer holds.
- screens-entry R7 says only "`#invite=` reads `invitelook`", so no requirement states what is drawn of the answer.

### 2. Why the tests missed it
`screens-entry/join.test.mjs:15` scripts `invitelook` with `role: "member", capabilities: ["contribute"]` and `:29` asserts only `has(o, "screen.join.invited", ...)` and `has(o, "screen.join.invited.as", { cover: "Mai K." })`: the role and capabilities are in the scripted answer and nothing asserts they are drawn.

### 3. Failing-first test
`bio-plane/test/m/screens-entry/join.test.mjs`: script `invitelook` `{cover: "Mai K.", role: "admin", capabilities: ["contribute", "publish"], expertise: []}`; open `join` with the invite; assert the drawn tree holds the words BOB names for the role (administrator) and for each capability (the `screen.members.cap.*` words), and none for an ordinary `member` with `["contribute"]` beyond the capability words; control: the member id never appears. Through the entry: `r8-kit.mjs`, founder `memberadd` with `role: admin` and `capabilities: ["publish"]`, then the page's `join` read: the invitee's screen says she is invited as an administrator.

### 4. Platform
None.

### Requirement
screens-entry R7 must state what is drawn of the look. Current text: "`#invite=` reads `invitelook`". Options for BOB (UX, P17): (a) draw the role and the capabilities from R12's four fields, in words, and leave the design's "{name} invited you" sentence; (b) extend member-roster R12 to answer `invited_by` and `expires` so the design's sentence draws as designed. Recommendation: (a) now, because it needs no new data; (b) is a design question (does an invitee see who invited her before she has a handle).

---

## 3. 02 L66 R06.c "the handle answers only on pressing the button, not as typed" -- DEFECT (MINOR), screens-entry

### 1. Root cause with evidence
`screens-entry/join.mjs:119-120` `if (!view.ui.watching) { view.ui.watching = true;` and `:134` `cs.later(600, watch);` are inside the `handlecheck` act's `send` (`:111-136`): the timer that re-checks the field "every 600 ms" is first started by pressing "See whether a handle is free". Before the first press nothing watches; the walker typed `dev`, waited 1.2 s and saw nothing, then pressed and got "dev is already taken in Your team". screens-entry R7: "the handle checked as typed (`handlecheck`; fixed for good, DEC-197)"; the design's field carries the act (`mock-screens.js:588` `field('mk-handle', 'Your handle', 'mai-k', { act: 'handlecheck', ...})` and the three states drawn under it).

### 2. Why the tests missed it
`join.test.mjs:101-116` presses `handlecheck` first (`:103` `await o.press("handlecheck", { values: { "jn-handle": "Mai" } })`) and only then types on (`:107` "typed on: the field is watched"): it proves the watcher after the press, never before.

### 3. Failing-first test
`bio-plane/test/m/screens-entry/join.test.mjs`: open `join`; set `o.fields["jn-handle"] = "taken"` and advance the page clock past 600 ms with no press; assert one `handlecheck` `{invite, handle: "taken"}` was sent and `handle.taken` (with the suggestion) is drawn; an unchanged field is not checked again; control: an empty field sends nothing. Walker's case in Chromium: type `dev` without pressing, wait 1.2 s, the taken sentence shows.

### 4. Platform
None (the timer is `cs.later`).

### Requirement
screens-entry R7 states the right behaviour ("checked as typed"); only code changes.

---

## 4. 02 L55 R10.d "memberadd silently drops an unknown capability and an unknown role" -- DEFECT (MINOR), member-roster

### 1. Root cause with evidence
- `member-roster/index.mjs:952-953` `const caps = Array.isArray(capabilities) ? capabilities.filter((c) => Members.CAPABILITIES.includes(c)) : ["contribute"];`: "fly" is filtered out, and a non-array (a string `"publish"`) silently becomes `["contribute"]`. `:946` `const wantAdmin = role === "admin";` and `:992` `wantAdmin ? "admin" : "member"`: any other role ("wizard", "Admin") is an ordinary member. The answer carries the result (`capabilities: caps`, `role`), so the caller is told nothing is wrong.
- The same module refuses the same input elsewhere: `memberCaps` `:776` and `:781` (`BAD_CAPABILITY` naming `got` and `known`), `websiteKeyCreate`/`joinLinkEnable` `:1458-1460`; requirement R6 "`BAD_CAPABILITY` for a non-array or an unknown word" and R35, R38 "as R6". R9's text lists `memberAdd`'s refusals in order and has neither `BAD_CAPABILITY` nor any role refusal: "`BAD_MEMBER_ID` ... `MEMBER_ID_RESERVED` ... `NO_COVER`; `EXISTS`; `EXPERTISE_IS_NOT_ASSIGNED` for any `expertise`; `BAD_EXPIRY` (R33)". The module's own comment at `:929-935` says why a silent drop is wrong ("silently dropping a caller's argument is how the two copies drifted apart").
- The invite form cannot send either (checkboxes), so only a door caller (an agent, a probe) can; the walker says so.

### 2. Why the tests missed it
They pin the drop: `member-roster/roster.test.mjs:52-53` `memberAdd({ memberId: "bob", cover: "c", capabilities: ["publish", "fly"], by: "second" })` then `assert.deepEqual(b.capabilities, ["publish"])`, and `t34-joining.test.mjs:75-76` the same (`["publish", "fly"]` expects `["publish"]`).

### 3. Failing-first test
`bio-plane/test/m/member-roster/roster.test.mjs`: replace `:52-53`: `memberAdd` with `capabilities: ["publish", "fly"]` answers `ok: false`, `reason: "BAD_CAPABILITY"`, `got: ["fly"]`, and `members` holds no row `bob`; `capabilities: "publish"` (a string) the same; `role: "wizard"` refused (the code BOB names) with no row written; `role: "admin"` and no `role` unchanged. Same change in `t34-joining.test.mjs:75-76`. Through the door: control-plane `r8-kit.mjs`, founder `memberadd` with `capabilities: ["fly"]` answers `BAD_CAPABILITY`, not an invitation.

### 4. Platform
None.

### Requirement
member-roster R9, to be worded; its current text lists the refusals above without these. Wording: "`BAD_CAPABILITY` for a non-array or an unknown word, as R6, and a role that is neither `member` nor `admin` is refused, each before anything is written and before `BAD_EXPIRY`". `BAD_CAPABILITY` has its words (`refusal.BAD_CAPABILITY`, `setup-words/rows.mjs:7648`); the role code is new and BOB names it.

---

## 5. 02 L99 R11.e (part) "the Members page has no Agree control; `adminremovalsopen` answers NOT_AN_ADMIN to an administrator" -- DEFECT (MAJOR), control-plane

### 1. Root cause with evidence
- `op-declarations` declares the stamp `by` for the op (`op-declarations/t51.mjs:48-49` `membership: ... extra: { adminremovalsopen: Object.freeze(["by"]) }`). The door sets a declared `by` as the viewer's form: `control-plane/index.mjs:1409-1410` `const actor = viaSession ? sessViewer : ...; const stampOf = { viewer: ..., by: actor, ...` and `admission/index.mjs:374` gives a member session `viewer: \`member:${member}\``. The ops that read `by` as a member id get a second statement that overwrites it with the bare id: `index.mjs:3017-3018` `if (MEMBERSHIP_ADMIN_ACTS.includes(op)) inner.searchParams.set("by", viaSession ? sessMember : ...)`, with the list at `:138-141` (`"invitewithdraw", ... "groupdescriptionset", /* (T46; N654; membership R130) the administrator's read of the two doors' settings and history, \`by\` the same */ "joindoors"`). `adminremovalsopen` (R75, T51) is in no such list.
- The roster reads the bare id: `member-roster/index.mjs:1783` `if (!this.isAdministrator(by)) return notAnAdmin(...)`. Probe I ran (harness `world()`, inner request of each op through the door): founder `by` = `admin` for `adminremovalsopen`, `joindoors`, `memberadd`; member session `ann`: `adminremovalsopen` `by` = `member:ann`, `joindoors` `ann`, `memberadd` `ann`, `hostingaccessset` `ann`. So only the founder can read the open removals; nova (an enrolled administrator) is refused, as the walker's `open` read shows.
- Effect on the screen: `screens-settings/members.mjs:39` reads `removals`; `:268` draws "Agree: remove {member}" only where `awaiting.indexOf(me.member) >= 0`; with the read refused there is no entry, so no control, and the section shows only the "WHAT REMOVING AN ADMINISTRATOR TAKES" text the walker found (`removalsOf` at `:259` over a failed state).
- The first vote's refusal being `VOTES_SHORT` is specified (R4 and cause 15).
- The store-request module holds the same two lists (`store-request/index.mjs:47-48`, `:249` `if (MEMBERSHIP_ADMIN_ACTS.includes(op)) put("by", M);`); it is not the live path yet (follow-up 8), so the fix goes in both copies.

### 2. Why the tests missed it
`membership/t51-delegation.test.mjs` and `member-roster/split.test.mjs` call `adminRemovalsOpen({ by: "<bare id>" })` at the module; `op-declarations/t51.test.mjs:235` pins the stamp's key (`adminremovalsopen: ["by"]`), not its value; `screens-settings/members.test.mjs` answers the read from a scripted plane. No control-plane test names `adminremovalsopen` (grep of `test/m/control-plane`).

### 3. Failing-first test
`bio-plane/test/m/control-plane` (a new `stamps-members-admin.test.mjs`, with `harness.mjs`): for the founder and an enrolled administrator session, assert the inner `by` of `adminremovalsopen` equals that of `joindoors` (the bare id; today `member:ann`); control: a bearer stamps `class:<cls>` and is refused `NOT_AN_ADMIN`. The walker's case through the door: `r8-kit.mjs`, three administrators, the founder's `adminremove` of orin answers `VOTES_SHORT`, then nova's `adminremovalsopen` answers `{ok: true, removals: [{target: "orin", awaiting: ["nova"], have: 1, need: 2}]}`; the Members page for nova draws "Agree: remove ..." (screens-settings `members.test.mjs` with that answer already asserts the draw at `:268`'s shape).

### 4. Platform
None (the probe is the door function over the stamps).

### Requirement
member-roster R75 states the right behaviour ("An administrator is answered ..., a non-administrator `NOT_AN_ADMIN` (R28)"); store-request R24 lists `MEMBERSHIP_ADMIN_ACTS`: add `adminremovalsopen` to that list in R24 and to control-plane's copy. Same class as diag2-03b #1 and diag2-11 #1; BOB may take all three together as one reading of "`by` is the bare id for every op whose owner asks `isAdministrator`".

---

## 6. 02 L109 R15.a "the Declared bias form's save sends `promote` with no `bundleId`" -- DEFECT (MAJOR), screens-settings

### 1. Root cause with evidence
- `screens-settings/bias.mjs:264` `return { body: { base: null, snapKey: iso.replace(/[-:]/g, "") + "_" + nonce, meta: { object_type: "bias", ... }, files: [{ path: "bundle.md", text }], register: [] } };`: no `bundleId`. The same body serves both `from: write` and `from: inhale` ("Start a set from these"); `done` (`:269`) reads `a.bundleId` from the answer.
- The owner refuses it: `promotion/index.mjs:481` `const idSupplied = bundleId !== undefined && ...` and `:505-506` `if ((!idSupplied && !creatingProject) || !Array.isArray(files) || !envelope) return { ok: false, reason: "MALFORMED", detail: "bundleId, files and meta are required" };`; promotion R7: "A package with no `bundleId` (other than a project's creation, R19) ... is refused `MALFORMED`". The screen draws MALFORMED as "Something in this isn't in the form Civicsmith expects", the walker's text; three saves, three MALFORMED.
- Every other screen that promotes asks `allocid` first: `screens-inquiry/project.mjs:784` `cs.call("allocid", { query: { prefix: "INQ", year } })` and adds a slug, `screens-intake/capture.mjs:141`. `BIAS` is an id prefix (`record-grammar/ids.mjs:42`) and not a gated one (`record-core/index.mjs:334` `GATED_ID_PREFIXES = ["PROJ", "CASE", "DRAFT", "RVG", "TASK"]`).
- screens-settings R65 lists the body without it: "(`promote` of a bias bundle: `base: null`, a `snapKey`, `meta`, `files: [{path: "bundle.md", text}]` whose frontmatter is `object_type: bias` ...)".

### 2. Why the tests missed it
`screens-settings/bias.test.mjs:70-77` presses `promote` and asserts `sent.body.base === null`, the `snapKey` shape, `meta` and `files` (and `:123-125` takes `saved.bundleId` from a scripted answer): it pins the body R65 lists, so the missing member of it is never asserted; the scripted plane answers `promote` whatever it is sent, so promotion's R7 never ran.

### 3. Failing-first test
`bio-plane/test/m/screens-settings/bias.test.mjs`: `press("promote", { data: { from: "write" }, values })`: assert an `allocid` call `{ prefix: "BIAS", year }` precedes `promote` and the `promote` body carries `bundleId` equal to the id it answered (with the slug, as the project page builds it); the same for `from: "inhale"`. Walker's case through the entry: `bio-plane/test/m/control-plane/` with `r8-kit.mjs`: build the body with the page's own act (import `bias` from `screens-settings/bias.mjs`), post `promote` as the founder: `ok: true` and a `bundleId`; then `biasadopt` for the instance lands and `biasmanifest` answers `in_force: true`; red today with MALFORMED.

### 4. Platform
None (the id is minted in-process by record-core).

### Requirement
screens-settings R65, current text above, is worded without the id; promotion R7 requires it: R65 needs "`bundleId` minted by `allocid` (prefix `BIAS`, the year), as the project page does". This unblocks R15.d (adopt, amend, illegal move), R15.e and R125 (project lens), which the walker could not reach.

---

## 7. 02 L117 R17.e "op=ask answers HTTP 500 PLANE_INTERNAL_ERROR" -- already placed: item 60 (control-plane)

### 1. Root cause with evidence
The walker's stack, `DataCloneError: Proxy could not be serialized because it is not a valid RPC receiver type` at `control-plane/phase-clock.mjs:173` from `plane/ask.mjs:71` (`return storeStub(env, "bio").ask(args);`) and `control-plane/index.mjs:2675`, is the line item 60 names: the phase clock called RPC methods through `.apply`. On the tranche it is fixed: commit `017148fef2` "control-plane R128: phase clock calls stub methods on the stub, never through .apply (K5131)", which is after the walker's base (`8efbe1c055` is not a descendant of it), now `phase-clock.mjs:173` `return typeof v === "function" ? (...a) => target[key](...a) : v;`. `ask` is a method on the same clocked stub.

### 2. Why the tests missed it
Before item 60: no test called an RPC method through the clocked environment. Now `control-plane/r128-rpc-stub.test.mjs` does, at the platform's real shape (a Miniflare Durable Object with RPC methods); I ran it: 2 of 2 pass, including `op=readtranslate` through the door.

### 3. Failing-first test
Item 60's is written and green. Not yet covered: the walker's `op=ask` itself, a member and the founder with no assistant connected, answering the not-connected sentence (`NO_INSTANCE_AI_CREDENTIAL` or `AGENT_WORKER_UNBOUND`) and not 500: a door case for control-plane's Wave B (items 8, 42) in `r8-kit.mjs`; and the R17.e row re-walked.

### 4. Platform
Yes: workerd's RPC stub. The check at its real shape is `r128-rpc-stub.test.mjs` (Miniflare) plus the re-walk.

### Requirement
control-plane R128 (amended by item 60).

---

## 8. 02 L54 R10.c "declared expertise can be given with the invitation" -- SPECIFIED (member-roster R9)

The behaviour is the requirement. member-roster R9: "`EXPERTISE_IS_NOT_ASSIGNED` for any `expertise`"; code `member-roster/index.mjs:929-942` (the comment: "v1.4 let an administrator ASSIGN expertise when creating the invitation, and v2 1.3 forbids exactly that"); `inviteLook` answers `expertise` as the invitee's own record, empty (`:1037-1041`). The member declares on Your account and an administrator confirms (R12.a, R10.h both WORKS). The coverage row's wording ("Invite with a cover ..., capabilities ... and declared expertise") is the retired v1.4 shape; the walker's own note says so. Tests assert the refusal (`roster.test.mjs:25`, `declared-ops.test.mjs:71`). The row is corrected in the coverage map, not in the product; no job.

---

## 9. 02 L95 R11.a2 "when a second administrator is added the group is asked who holds hosting access" -- SPECIFIED (member-roster R8)

member-roster R8: "(DEC-134 (3)) The record of who holds hosting access is this module's and is asked at setup (the setup screen's act, `screens-entry` R6, and the group's settings, `screens-settings` R18) ... never on adding an administrator: `memberAdd`'s answer carries no hosting-access question." Code comment `member-roster/index.mjs:995` "R11 (DEC-134 (3)): no hosting-access question rides on it". The design agrees: the question is the "Who holds the hosting account" section (`mock-screens.js:312`) and part 8's "Invite a second administrator" carries a host field on the setup page, not on Members, Home or Queue. The walker's `hostingaccessset` NO_HOLDERS read is the empty-holders refusal (R8). The coverage row (R11: "when a second administrator is added the group is asked who holds hosting access") is the pre-DEC-134 v2 §4.8 wording. No job.

---

## 10. 02 L65 R06.b "no language choice on the join screen" -- SPECIFIED (screens-entry R7, R31)

`screens-entry/join.mjs:59-60` `const tags = langs && Array.isArray(langs.languages) ? ...`, `:69` `(tags.length ? \`<div data-act="memberlanguageset">${cs.choice("jn-lang", ...)}...\` : "")`; screens-entry R31: "No languages offered draws neither the field nor the mark" and R7: "the language among the group's (`grouplanguages`, `instance-setup` R85)". The walker's team had offered none ("this team offers none yet ... not forced", its row). With languages offered the choice is drawn before the handle and tested: `join.test.mjs:26-29` (options `en`, `es`, `vi`). Re-walk after `grouplanguagesset` (an administrator's act on Your team) offers a language. No job.

---

## 11. 02 L126 R122.c "an open roster does not show a member invited from another session within 75 s" -- SPECIFIED (interface-shell R93)

interface-shell R93: "A read a screen's `reads` marks `refresh: true` is read again by the shell every 45 seconds ... Control: a screen with no `refresh` is never re-read". The roster read is `screens-settings/members.mjs:30` `roster: { op: "memberlist", empty: ... }`, not marked; the reads that are marked are screens-daily's (`queue.mjs:37-44`, `finder.mjs:48`; screens-daily R55, R60). screens-settings R1 (Reads) names no refresh. The coverage row's fourth check ("a list open on one account updates when another adds or removes an item") has no requirement behind it that I found; I did not find the canon sentence it cites.
Decision for BOB (UX; P17): should the Members roster be a re-reading list. Option A: no (today). Option B: mark `memberlist` `refresh: true` with `list.fresh` in screens-settings R1; one line in code, R93's rules already hold focus and open panels. Recommendation: B for the roster and the administrators' removal section (a vote waiting on a colleague is the case that matters), nothing else.

---

## 12. 02 L129 R123.b "a note holding a phone number and an address, or naming a private person, is kept with no warning" -- SPECIFIED (hypotheses R11, R19; DEC-408)

- `hypotheses/index.mjs:550` `noteWrite({ text, by })` calls no warning; hypotheses R11 lists its refusals (`MACHINE_CANNOT_NOTE`, `NOTE_NO_TEXT`, `NOTE_TOO_LONG`) and its answer. The person warning rides the share: R19 "`noteShare` ... A note naming a person in no public role carries `inquiry` R59's warning at the act, through `inquiry.personWarning`"; inquiry R59 is "a warning, never an error".
- DEC-408 (`docs/development/DECISIONS.md:6297`, Bob): "a home address or phone number can be kept by a member in their notes - but is never published"; it asks no warning at the write. Notes are never cited, published or counted (R14), so nothing of a note reaches a surface.
- The coverage row ("put a home address or phone number in it: neither can be cited, exported or published [DEC-408]; name a person in no public role: warned at the act") reads R19's "act" (the share) as the write.
Policy flag for BOB (whether Bob's): should `noteWrite` also carry `personWarning` for a note naming a private person. Recommendation: no; the note is private to its author and never leaves, the warning is for what is shared. No job.

---

## 13. 02 L143 OV.7 "the invite form ticks 'add and revise work' before the administrator chooses" -- SPECIFIED (design; member-roster R9)

`screens-settings/members.mjs:169` `let picked = Array.isArray(ui.inviteCaps) ? ui.inviteCaps : ["contribute"];`. The design draws it ticked: `mock-screens.js:717` `checks('What they may do', [['Contribute', true], ['Administer', false]], { act: 'membercaps' })`; member-roster R9 and code default `["contribute"]` (`index.mjs:952-953`), and `screen.members.tip.contribute_why`: "Every member here holds it; it is what an invitation grants by default." The overlay rule the walker applied (check 7 "No preselected choice") has as its source `ux-experience.json` `surfaceRules[1]`: "Never land an act on rows the member did not see; nothing preselected; visibility may only shrink a selection" (Interaction Constructs section S), which is about selected rows, not a capability default. If BOB reads check 7 more widely than its source, that is a CONFLICT between the overlay and the design (`mock-screens.js:717`), for the UX design stream; recommendation: leave the design, narrow the check's wording. No job.

---

## 14. 02 findings MAJOR 10 "a walk of many pages from one address reached DOOR_RATE_LIMITED" -- SPECIFIED (admission R21)

admission R21: "Every request to a public op (`classes: null` ...) is counted against one window per source: at most 300 such requests per source in any 10 minutes ... refused at `>= 300` with 429 `DOOR_RATE_LIMITED`"; code `admission/index.mjs:919` `DOOR_WINDOW = { limit: 300, windowMs: 10 * 60 * 1000 }`. 41 ops are public (probe of `OPS`), among them `groupidentity`, which every signed-in page load asks for the masthead (interface-shell R7); R124 asks it again once per load. So one address needs about 150 page loads in 10 minutes to meet the limit: a scripted walk, not a person. The walker's "a team behind one office address could meet it in ordinary use" is an estimate, not shown. Policy flag: whether the number suits an office behind one address. No job.

---

## 15. 02 L99 R11.e (part) "the first vote answers the raw code VOTES_SHORT as its words" -- WALKER ERROR

The script's `words` is `r.translation || r.detail || r.reason` (`02-people.test.mjs:120`). The first vote's answer carries a code and `have`, `need`, `deciders` and neither a `translation` nor a `detail` (`member-roster/index.mjs:879` `return { ok: false, reason: "VOTES_SHORT", memberId, have, need, ...math, deciders }`; R4 lists `VOTES_SHORT (with have, need, deciders)`), so `words()` falls back to the reason. The screen does not draw the code: `interface-shell/browser.mjs:346-347` `const key = ... "refusal." + a.code; if (has(key)) return { words: w(key, a.fields || {}) ...}` and the row exists, `setup-words/rows.mjs:8188` `["refusal.VOTES_SHORT","There are not enough votes yet to carry this removal. Your vote is recorded, and the removal waits for the rest.", ...]`. The walker did not press the screen's act. Re-walk by the screen after cause 5.

---

## 16. 02 L104 R13.c "adding a checker answers ACCOUNT_SEAL_UNAVAILABLE; the vendor list shows 0 entries" -- WALKER ERROR

- The refusal is the plane saying the room has no sealing secret: `plane/store.mjs:185` `credentialsOf(ctx, { sealSecret: env.ACCOUNT_SEAL_SECRET ?? null });` with its comment "Unbound, setting a member's reference is refused ACCOUNT_SEAL_UNAVAILABLE"; `ai-accounts/index.mjs:367` mints it. No file of the walk binds `ACCOUNT_SEAL_SECRET` (grep of `walk-T51-final/scripts`: none), while the store-assembly tests that need it do (`store-assembly/t33.test.mjs`, `ask.test.mjs`). The record's own NOT REACHED list says "no sealing secret in a Miniflare room". Script `:878` `add.ok !== false` is the pass condition, so the row could not pass in that room. `CONFIG_MISSING` (no handling digest) is file-safety R28 as specified.
- "the vendor list on the page shows 0 entries" is the script's regexp `/Acts for [^\n]*/g` (`:885`); "Acts for {name}" is the shell's open-button explanation (`setup-words/rows.mjs:1405` `shell.row.open`), not a vendor line. The catalogue draws `E(t.vendor + " · " + t.product)` (`screens-settings/security.mjs:145`).
Re-walk with `ACCOUNT_SEAL_SECRET` set in the Miniflare room; read the vendor cells, not "Acts for". The "test with the harmless file" part stays NOT REACHED (the room's outbound answers only scripted names), as the walker says.

---

## 17. 02 L119 R121.a "Settings has no path line" -- WALKER ERROR

The script finds a path as the first text line holding "›" (`02-people.test.mjs:1004-1005` `const crumb = (t.match(/[^\n]*›[^\n]*/) || [""])[0].trim(); const endsWith = crumb && ...`). The path of `settings` is one step: `interface-shell/index.mjs:60` `settings: ["settings"]` and the design's `mock-shell.js:67` `settings: ['Settings']`; the shell draws it (`browser.mjs:1263` `(frameOf(MAIN.spec.id) === "working" ? pathNav(route, MAIN) : "")`, `crumbs()` `:1165` a `<b aria-current="page">` last step), a line with no "›". interface-shell R8: "from its rail place to the screen's own name, last", which for the place's own screen is the one name. The 11 other screens end in their own name (the row). Fix the script: read `nav.cs-crumbs`.

---

## 18. 02 L139 OV.18 "the state chip 'Forming' is 1.29:1 in the light theme" -- WALKER ERROR

The script's `lum()` (`02-people.test.mjs:1165`) takes `getComputedStyle(n).backgroundColor` and reads the first three numbers as 0-255 channels. The stage ladder's current step has `background: color-mix(in srgb, var(--c-stage) 22%, var(--c-surface))` (`civicsmith.css`, `.cs-ladder[data-ladder="stage"] > .on`; drawn by `screens-daily/project-rows.mjs:32-36`), which Chromium reports as `color(srgb 0.81 0.84 0.86)`: the script reads it as channels 0.81, 0.84, 0.86 of 255, near black. Arithmetic I ran with the design's light tokens (`--c-ink #15222C`, `--c-stage #3A587F`, `--c-surface #F8F9F5`): true contrast of the text on the mix 10.97; as the script reads it 1.29, the walker's figure to the hundredth. Dark passes because its text is light. No product defect; re-measure with a canvas-resolved colour.

---

## 19. Overlay 17 (26 lines: "N controls under 44 px at 390 px") -- WALKER ERROR (part), UNKNOWN (rest)

The detector is `02-people.test.mjs:94-95`: `querySelectorAll("button, a[data-nav], input:not([type=hidden]), select, summary")` filtered to `height < 44 || width < 44`, and its message says "links in running text exempt", which the selector does not do. It counts (a) every radio and checkbox input, which the phone block keeps at 24 px on purpose with the 44 px label as the target (`interface-shell/index.mjs:361`, `:364`; the same walker error as diag2-07 #11 and diag2-06 §19 (b)); (b) every `a[data-nav]` link, in running text or not; (c) every `summary`. The sign-in screen draws two radios (`front.mjs:81` `cs.checks("fs-device", ..., { radio: true })`) and the invite form draws three capability checkboxes (`members.mjs:169`), which is consistent with the counts of 3 on the sign-in screens and 5 on the Members-page screens, but the record names no control, so I cannot say the rest is nothing. Known real defects of the same message are placed: `.cs-wizmark` (diag2-07 #10, item 70) and `a.cs-ref` (diag2-06 §19 (c), item 74). UNKNOWN for the remainder; reproduction owed: rerun the script's `look()` with the filter excluding inputs whose enclosing label measures 44 px and printing `tagName`, `className`, `data-act`, text and rect for each remaining control (the shots folder holds no images at this commit).

---

## 20. Overlay 15 "words a member would not expect: \bcopy\b" (8 lines) -- WALKER ERROR

The script's list (`02-people.test.mjs:84` `BADWORDS`) matches `\bcopy\b` anywhere. The overlay rule (`coverage/overlay.md:47`) is "your team's Civicsmith (never "copy", except a review copy or a document's copy)": the installation is not called a copy. The matches are the verb on a button and a document's copy: `screen.entry.codes.copy` "Copy them" (`setup-words/rows.mjs:1992`, drawn by `join.mjs:43` and the recovery screens), `screen.recovery.spends` "copy them or write them down" (`:3755`), the invite link's "Copy" control and the design's own "Copy the link" (`mock-screens.js:717`), and the Security page's "makes a safe copy" (`screen.security.does.cdr`, `:3827`: a safe copy of a file). No noun use for the installation was among them that I could find. No job.

---

## 21. WORDS/LAYOUT ONLY (UX design stream, no job)

- **R06.f2, L69**: the codes block after joining reads "Once you have claimed, you get ten one-time codes ..." because `screens-entry/join.mjs:43` draws `screen.entry.codes.what` (`setup-words/rows.mjs:1988`), the key the setup screen's claim also uses; a joiner has claimed nothing. The join screen's own sentence, before joining, is `screen.join.codes.after` ("When you join, you get ten recovery codes ..."). A rewording of the shared key to be true of both ("You now have ten one-time codes"), or a join key, is the stream's.
- **R04.c2** (findings list, MINOR): the Sign in button's explanation card covers the refusal sentence until the pointer moves. A layout point for the explanation layer (interface-shell R14-R17); not diagnosed against code (no screenshot at this commit).
- **Overlay 15 "confidential" (`r124-elsewhere`)**: the word is in the place profile's own descriptions of third parties, drawn as written ("From {source}"): `jurisdictions/profiles/oakland-alameda.mjs:868` "A confidential hotline, open to residents ...", `:881` "... through confidential channels", and `:715` a statement of California law. It is data from a source, not the product's voice; diag2-04 §9 is the separate design-row case. BOB decides whether the check applies to profile data.

---

## 22. R11.d2 (findings list, MINOR) "adminendorse of an existing member nobody proposed answers NO_SUCH_MEMBER" -- UNKNOWN

The code answers `NOT_PROPOSED` for an existing member whose status is not `proposed`: `member-roster/index.mjs:800-806` (`if (!m) return noSuchMember(memberId);` then `if (m.status !== "proposed") { ... reason: "NOT_PROPOSED" ...`), asserted by `member-roster/administrators.test.mjs:25` and `:203`; requirement R3 "`NO_SUCH_MEMBER`; `NOT_PROPOSED` (C-96.14) unless the target's status is `proposed`". The door passes `memberId` through (the same stamp path carried `adminremove` of orin). So the walker's NO_SUCH_MEMBER for `dev` can come only from no row `dev` existing at that moment; I cannot show it either way. In the script the row is made lazily by `kit.person` the first time `dev()` runs (`:110-117`), and `noProp` (`:808`) is sent before this step's first `dev()` call. Reproduction needed: run the step with `SEC=R11` alone and print `memberlist` ids immediately before the `adminendorse`; if `dev` is absent, this is a script ordering error (WALKER ERROR); if `dev` is present and the answer is still NO_SUCH_MEMBER, it is a defect to diagnose from that print.
