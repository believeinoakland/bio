# setup-page (T34)

**Status** · session_01WfW58j4sjUPP7j6BfdTRs3 · depth 2 · WORKING · handled B2

## J1 · QUESTION

Four readings I am building on; each is the page's own detail unless you say otherwise.

1. **R21 voice before sign-in (K1821 (2)).** Strings shown at `/` to a reader with no session (the unread and none group lines, loading, unarmed, claim, sign-in, "not answering", already-claimed, enrolment) say "this group's Civicsmith" or need no name; R1's *recorded* line keeps R1's own words, "your group's Civicsmith". Signed-in strings say "your group's Civicsmith". E.g. "Claim this group's Civicsmith", crumbs "Your group's Civicsmith".
2. **R20, the offices section.** No op lists a group's offices, and `op=profiles` carries no counterparties. Reading: the section treats "no active profile names an office" as `op=profiles` answering no active profile, or an answer whose `offices` field (if a later `instance-setup` adds one) is empty; it names R60's place from `op=placewantedstate`; the offices it lists are the ones added through `op=entitycreate` (kind `office`, label, the administrator's note) in this visit, each marked "added by your group". A read of the group's offices (entities by kind) would be another module's op: I report it, not build it.
3. **R22, "once `enroll` has signed the new member in".** `enroll` answers no session. Reading: on `enroll`'s success the page signs the member in with `op=login` (`member:<handle>`, the password just set; a public op R3 already allows), then sends `op=memberlanguageset {language}` with that session, then shows the panel. The choice is a BCP 47 tag field filled from the device's setting (`navigator.language`). "The account screen" on this page is the healthy panel (every signed-in member); members and keys offers it too.
4. **R23, "Who your group is".** This page has no such section today. Reading: I add it to members and keys (administrators only): focus and purpose read from `op=groupdescription`, kept through `op=groupdescriptionset` carrying the latest record's `kinds`, `otherKind` and `visibility` unchanged (R109 appends a whole record). The "help write" act appears only while `assistantstate` reads on, asks the questions (plain words until the design stream's), and sends `op=groupdescriptiondraft {answers}`.

## Completion (T34-96)

**Entries applied.** T34-96, with the page shares of T34-57, T34-81, T34-90 and its 35 T34-87 rows:
- **The copy.** `bio-plane/src/setup-page/index.mjs` holds `setup.mjs` 1–1636: the header, the three imports it uses (`record-grammar`, `action-grammar`, `jurisdictions`), the injected constants, `escGroup`, `GROUP_LINE_UNREAD` (exported), `verifiedDay`, `groupLine`, `setupPage` as `pageOf`, the template as `PAGE_HTML`, names otherwise unchanged; `${hostingControlBlock("notice")}` is the exported slot `HOSTING_SLOT` (`<!--hosting-control-->`, R14). Before T34's work, `PAGE_HTML` with the slot filled by `hostingControlBlock("notice")` was byte-identical to `SETUP_HTML` less comments. No import of `setup.mjs` or `setup-fleet.mjs`; no table, store, op or registration. My `modules.json` entry's `paths` and `tests` filled (K1043's form).
- **R2** `#join=` (name chosen, `op=joinlinkinvite` with the link in the body only, enrolment for the invitation answered; `NO_SUCH_JOIN_LINK` and `JOIN_LINK_DAILY_CAP` stated, form hidden). **R3** enrolment password asked twice (U77). **R15–R18** after the claim, in the claim section only: hosting access (`op=hostingaccessset`), the second-administrator recommendation and statement of dependence, the court-notice choice (`op=courtnoticeset`), the assistant choice (`op=assistantset`; the group key through `op=groupkeyset` then `op=groupkeyswitch {on: true}`, the field emptied, never shown); members and keys shows each current record and offers the same acts. **R19** "Name a place not yet listed" (`op=placewanted`, `op=placewantedstate`). **R20** the offices section (`op=entitycreate`, kind `office`, each marked "added by your group"). **R22** the language at enrolment (from the device's setting; sent after `enroll` and `op=login`), on the panel and in members and keys. **R23** "Who your group is" in members and keys, the draft act only while the assistant is on (`op=groupdescriptiondraft`; refusals, `ASSISTANT_DRAFT_UNAVAILABLE` included, leave the fields), kept through `op=groupdescriptionset` with the kept kinds and visibility. **R24** the assistant's state to every member, the switch to an administrator saying what it will do.
- **R21 (DEC-149, T34-87):** all 35 rows (:87 … :1590) applied, each named by `words.test.mjs`; voice per J1 (1), accepted by B2 (K1861 (5)).
- Tests: `bio-plane/test/m/setup-page/` (seam read §5): page (less R47), loads, intake, keys, worker-page (Miniflare by path, driving this module's page over the real plane; the served bytes are instance-setup's copy until T34-57, so those arms read only state and slug), the R13 end-to-end arm and the R24 page arm, copies of `pageOver` and `storage`; new claim, settings and words suites. None imports `setup.mjs` or instance-setup's fixture.

**Deferred.** None.

**Found elsewhere (REPORT J2).**
1. No op reads a group's offices (entities by kind `office`), and `op=profiles` carries no counterparties, so R20 lists only the offices added in the visit and reads "no active profile names an office" as no active profile, or an `offices: []` field if `instance-setup` adds one (J1 (2), B2).
2. On `tranche/T34` today the door declares none of `joinlinkinvite` (and it is not among the public ops relayed before sign-in), `courtnotice`, `courtnoticeset`, `groupkeyset`, `groupkeyswitch`, `groupkeystate`, `placewanted`, `placewantedstate`, `memberlanguage`, `memberlanguageset`, `groupdescription`, `groupdescriptionset`, `groupdescriptiondraft` (`op-declarations`, `admission`, `control-plane`). Until their L11 jobs route them, the page states the door's refusal for each act. Informational: their entries (T34-81, T34-83, T34-90, K1755) presumably carry them.
3. No generated artifact made stale: nothing imports this module until instance-setup's T34-57.

**Tests and checks** (on `job/T34/setup-page`, `tranche/T34` merged in):
- `node --test bio-plane/test/m/setup-page/`: tests 53, pass 53, fail 0.
- plane `store.test.mjs`: 10 pass, 1 fail, R2/R10 at :91, accepted red 8 (K1832, K1851), not mine.
- `format`: 129 modules, 128 requirements files; 0 failures.
- `architecture setup-page`: 10 product files, 34 relative imports; 0 failures.
- `coverage setup-page`: 25 of 25 live requirement ids named by a test; 0 failures.
- `ownership setup-page tranche/T34`: 12 files; 1 failure, `build/modules.json` (my own entry's `paths` and `tests` only, K1043's form as directed).

P6: 2,115 lines of source (estimate 2,100–2,450).

Size (session_01WfW58j4sjUPP7j6BfdTRs3): test runs 14, module lines 4041 (src 2115, tests 1926)

## J2 · REPORT

Found outside my module (record, Completion, items 1–2): (1) no op reads a group's offices (entities by kind office) and op=profiles carries no counterparties, so R20 lists only offices added in the visit (J1 (2), B2); a read of the group's offices would let the section list them all. (2) On tranche/T34 the door declares none of joinlinkinvite (also absent from the public ops relayed before sign-in), courtnotice(set), groupkey(set|switch|state), placewanted(state), memberlanguage(set), groupdescription(set|draft): op-declarations, admission, control-plane. Until their L11 jobs route them, the page states the door's refusal for each act. No generated artifact made stale.
