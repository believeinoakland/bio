# N1000 census: held build work, 2026-10-12

Read whole: `build/plan/next.md` (N751–N1006), `build/plan/current.md` (T47), `build/handoff.md`, `build/rulings-active.md`. Rulings checked by id in `build/rulings.md`: K633, K1849, K2079, K2164, K2171, K2228, K2257, K2425, K2479, K2560, K2591, K2611, K2647, K2688, K2691, K2745, K2749, K2771, K2781, K2799, K2816, K2821, K2837, K2878, K2896, K2943, K3020–K3058. Also: `modules.json` layers, `draft-T47-interface.md` §5–§6, older entries' text in `archive/next-T35.md`, `next-T36.md`, `next-T37.md`, PR #33's tip `4803ca7d00` (DEC-200, registry with 50 screens), and B158/B159 in `mail/BOB.md`.

**State the rows assume:** T47 is paused in L3. L1 and L2 are closed. In L3, host-governor is merged and capture, file-safety and sources are unmerged and not restarted. L4–L11 have not started. Under P10, work joins only a layer that has not started, so an entry for a module in L1, L2 or L3 goes to T48 unless Bob approves an out-of-layer job (K1548). One exception: a small item for capture, file-safety or sources can join that job's restart START (K279), because their jobs are not complete.

Layers of the modules named below: record-grammar, ocr-worker, file-scanner L1 · credentials, membership L2 · capture, acquisition, file-safety, sources L3 · following, monitoring L10 · agent-worker, agent-runner, steps, run-rules L6 · investigation L7 · case-account, docket L8 · actions, filing-templates L9 · instance-setup, control-plane, plane, setup-page, screens-*, interface-shell, legacy-ui (LEGACY), installer, stewards L11 (installer and stewards come after plane).

Category key: **B** = Bob's decision · **D** = design not drawn · **Dep** = dependency not built · **M** = measurement or deployment needed · **A** = Bob's account act (dashboard, deploy approval, resume word) · **S** = module size or split · **N** = no hold stated, or BOB's own act · **O** = order or structure (P10, the stamp)

## Table 1: held entries

| id · module(s) | what it is | stated hold (cat.) | still holds? evidence | the one act that clears it · who | T47 layer if BOB can clear it |
|---|---|---|---|---|---|
| N751 · doctypes | Measure three policy header fields again on fresh policies, to lift their "below target" mark. | No fresh policies beyond the 74 already read (M) | Yes (K2079). Nothing new has been published. | Read fresh issuer policies when they appear · a measurement | — (L1 closed; T48+) |
| N780 · release images | Publish agent-runner's and file-scanner's images where Cloudflare Containers can pull them. | K2816 (4): no public registry; biosmoke7 gets its images by copy (B) | Partly. Copying works for biosmoke7 (K2943, K3048). A founder installing into another Cloudflare account would get no assistant and no scanner. Bob's trial install into account 20b5… can use the images already copied there (BOB, technical). | Bob: whether to publish images publicly before the first public release (Q-E) | — (release work, not a layer) |
| N794 · legacy-ui (test) | The statement-ack test is red. | legacy-ui frozen (K633, K1849) (B) | **No.** K3052 retires legacy-ui as a users' interface. rulings-active §3: legacy-ui is touched only by the job that retires it. | BOB: fold into N1002; the retirement job removes or retires legacy-ui's tests with it | L11 (with N1002) |
| N865 · legacy-ui (test) | Two more legacy-ui tests are red (no live AI run in the fixture). | Same as N794 (B) | **No** (K3052) | BOB: fold into N1002 | L11 |
| N824 · capture | A per-group forwarding address that brings email into the record. | Bob's "D42 email: A", later, once upload is in use; also a deployment (B, M) | Yes (K2425). Upload is built but no group uses it yet. | Upload in real use, then an email-routing deployment · Bob already ruled; nothing to ask | — (L3; T48+) |
| N829 · run-rules | The test set's matters, with answers written by people, so the AI parts can pass Civicsmith's bar. | Matters must be written by people (M) | Yes (K2479; run-rules R29). The test-instance exception covers biosmoke7 only. **A group installed by the installer is never a test instance (K2816 BOB's details), so its assistant is switched off.** | Bob: who writes the matters, and what the trial's installed group does meanwhile (Q-A, Q-B) | — |
| N842 · agent-worker, control-plane, plane, investigation, steps, case-account | The assistant's interactive productions (the `enquire` interview, account drafts) stored at the member's own act. | `enquire` conversation, door and draft task not built; and N829 (Dep) | **Partly.** There is no `/enquire` door in `agent-worker/src` today. Every owning layer (L6, L7, L8, L11) has not started. On the test instance R29 admits the AI parts with a label, so N829 does not block the trial. | BOB: write the requirements for the interactive `enquire` path and place them (K3053's "starting their own work") | L6 (agent-worker, steps), L7 (investigation), L8 (case-account), L11 (control-plane, plane) |
| N847 · instance-setup or jurisdictions, plane | The wizard's "elsewhere" route needs a pointer to where else a member should go. | The pointer's words are the design stream's, and no provider is named (D, Dep) | Partly. Naming the provider is BOB's packaging (K569). The words still are not drawn. | BOB names the provider (instance-setup, L11). UX-DESIGN draws the words (with the B158 front door). | L11 (once the words arrive) |
| N853c · ocr-worker | OCR over photographed pages, with no AI account. | OCR accuracy on members' photos must be measured first (M) | Yes (K2691) | A measurement on real member photos | — (L1 closed) |
| N858 (the `@records-request` template content) · filing-templates | The Tier 1 records-request template text. | No named writer and no professional review (K2781 (6), D8) (B) | Yes. The template's machinery is built; only its content is held. This is legal exposure. | Bob: who writes and who reviews the template (Q-C) | L9 (filing-templates) or L11 (wizard-scripts R22), once named |
| N880 (U4: comparing minutes with the group's comment) · actions, signing view | A shown-once fact comparing meeting minutes with the group's own public comment. | No module holds minutes beside a comment (Dep) | Partly. Where it lives is BOB's (packaging). The words and placement are the design stream's. | BOB places it. UX-DESIGN gives the words. | L9 or L11. Recommend T48: it is not on K3053's journey. |
| N882 ("the proceeding followed with its own dates") · following | Follow a proceeding with its own dates. | COURTS L2 is not yet a requirement and no module is assigned (Dep) | Partly. Writing the requirement from canon and assigning it are BOB's. | BOB writes the requirement and assigns it to `following` | L10. Recommend T48: off the journey. |
| N898 · civicos-process `mail.mjs` | `mail done` refuses a cursor past the job's last entry. | Process repository; between tranches (N) | No real hold. It needs a quiet moment and a certified dry run (P3). | BOB, during the pause or at T47's close | — (process repo) |
| N923 + stewards R7 · installer R48, stewards | Publish the stewards' contact address and guide. | Bob names the address (K2799, K2878) (A/B) | Yes. It is not needed for the trial; it is needed before any public release (K2782, K2799). | Bob: name the address (Q-D) | L11 (installer, stewards), the moment he names it |
| N933 · instance-setup R77 | Should a stake be declared per matter (rule 9), or once for the whole group (D28d)? | Waiting for the actions lane's answer (Dep) | Yes (K2896). No answer in H31. | BOB puts the question to ACTIONS-DESIGN (the lane's call, not Bob's) | L11 if answered before its START |
| N943 · file-safety | A split map (4,671 lines, past ~4,000). | No split map yet (S) | Yes. No `extraction/file-safety-split.md` exists. T47-12 adds only a code, which is allowed (doubt 3). | BOB writes the split map now | — (L3 started: split in T48) |
| N945 · credentials | Bootstrap answered `rearmed: true` on biosmoke7. | BOB's study of the live store (M) | **Partly.** On 0.83.0 `op=bootstrap` answers claimed true, rearmed false: "N945 not reproduced" (K3048). | BOB finishes the read-only study and records the cause, or closes it as a 0.82.0 artifact. A credentials job is needed only if a requirement changes. | — (L2 closed; T48 if a job is needed) |
| N994 · record-grammar | Stale comments. | Next record-grammar job (O) | Yes (L1 closed) | — | T48 |
| N996 · credentials | A split map (4,027 lines). | Size (S) | Yes | BOB writes the split map. This also argues for keeping N1001's logging out of credentials. | — (L2 closed; T48) |
| N997 · screens (help, places, recovery) | Screens for help, places and offices, and recovery codes. | Not drawn (D) | **No.** DEC-200 (8) on PR #33 draws `places` and `recovery`; `help` was already drawn and needs only a module. | BOB folds DEC-200 (handoff A3). Absorbed by N1005. | L11 (screens-settings for places and recovery; help in N1005's module) |
| N998 · acquisition | A comparison test that depends on timing. | Next acquisition job (O) | Yes. L3 has started and acquisition has no T47 job. | — | T48, or Bob's out-of-layer approval (not worth asking) |
| N999 · interface-shell, setup-page, control-plane | The front door at `/`, sign-in kept across tabs, R3 against R12. | Waiting on Bob's D1–D3 (B) | **Bob's part no longer holds.** D1 and D2 are ruled A (K3052); D3 is withdrawn (K3053). Now waiting on the sign-in, sign-out and not-signed-in screens (B158, unanswered) (D). | UX-DESIGN answers B158. BOB writes the requirements. | L11 |
| N1001 · connect path | Diagnostic logging across the Claude sign-in flow, then the assistant's tests. | None (N) | No hold. The trace worker was stopped unfinished (K3054). | BOB: the trace (handoff A2), then requirements. Place the logging in agent-runner and agent-worker (L6) and in control-plane, screens-settings and plane (L11), with the door logging around credentials' calls (credentials is L2, closed, and over its size mark, N996). | L6 + L11 |
| N1002 · setup-page, legacy-ui | Retire every old page for users; take legacy-ui's Worker off biosmoke7. | K3052 (none) | Waiting on N1005's screens and N999. Taking the Worker off biosmoke7 is a deploy act (A). | BOB builds it. Bob approves the retirement deploy in session at the release. | L11 |
| N1003 · installer | The founder's journey from "Create your new Civicsmith group"; the installer deployed. | Bob's dashboard act: the OAuth client lacks `connectivity-directory.bind` (K2164) (A); the screens are B159's (D) | Yes. B159 is unanswered, and the dashboard act is not done. | Bob: the Cloudflare dashboard act (BOB walks him through it). UX-DESIGN answers B159. | L11 |
| N1004 · release check | An automated Playwright test of the whole journey, run before every release. | Its owning module was to be chosen at this census (N) | No hold | BOB names the owner. Recommended: a not_product helper module (for example `journey-check`), placed in L11 last, after stewards, because it drives the installer and the plane. | L11 |
| N1005 · new interface screens | install, setup, join, places, recovery, help, the front door, sign-in, sign-out, expiry, forgotten password. | Waiting on the DEC-200 fold and on the B158/B159 answers (D) | Partly. places, recovery and help are drawn (DEC-200). install, setup and join are in the registry (50 screens). The front door, sign-in, sign-out, expiry and forgotten password are **not drawn** (B158). | BOB folds DEC-200 (A3). UX-DESIGN answers B158 and B159. BOB plans module placement against K617: the new screen modules are estimated at 2,000–3,000 lines, so a new `screens-arrive` module may be needed. | L11 |
| N1006 · Q1–Q4 | The welcome wizard's entry, what People opens, where readers see a published case, signing in the new interface. | Bob's (UX) (B) | Partly. **Q3 is answered by K3052:** readers are users, so the new public page replaces legacy-ui's. Q1, Q2 and Q4 are still open. | Bob answers Q1, Q2 and Q4 (Q-F) | L11 |
| `investigate`, `extract` on the test instance (N647) | The assistant's investigate mode live on biosmoke7. | `op=airunverify` on 0.83.0 first (M) | Yes. It has not run, and connect does not work (K3053), so no member account can run it. | Connect is fixed (N1001), then the live verification runs · a deployment and measurement | L6 if verified by L6's START. The connect fix lands in L6 or L11, so most likely T48 unless the trace finds a configuration fault. |
| N708 · credentials R22 | Retire the `subscription` kind after M-Q2. | M-Q2 at Bob's first sign-in on 0.83.0 (M) | Yes. Bob's sign-in failed (K3053). | Connect working, then the measurement | — (L2 closed: T48) |
| N670 · "read in my language" | Read notes, questions and notices in my language; offer a translation to the library. | No act or owner; it comes after N669 (Dep) | Partly. N669's translation screens are in T47-58, and `translations` is in the 50-screen registry. The owner is BOB's to name. | BOB names the owner and checks whether DEC-127 (3) is drawn; UX-DESIGN if not | L11 (or T48) |
| `legal_facts` triggers at their moment | Detect a legal fact when it happens (attending, recording). | No registry screen for attending or recording (D) | Yes. PR #33's 50-screen registry has none. | UX-DESIGN draws the screens | L11 if drawn by its START, else T48 |
| The v0.2 constructs' screens not yet drawn | The remaining action-construct screens. | Not drawn (D) | Partly. plan, start-send, request, action and matter are drawn (T47-64). The plan audit (A4) names the rest. | UX-DESIGN, after BOB's audit lists them | L11 / T48 |
| The installer's deploy | Deploy the installer. | OAuth scope; Bob's dashboard act (A) | Yes | Bob (the same act as N1003) | — |
| N757 (later) | AI proposals for photo areas. | Bob's "N757: A": members mark by hand (B) | **Not a hold.** Bob rejected AI proposals (K2425). | BOB drops the row (closed by ruling) | — |
| N563, N579, N632, N641, N643 (part), N645 (part), N652 (part), N698 (part) | Measured detectors, prompt arms, registries, the vendor model, "Noticed" disparities, portal following, proposal search. | Each is a measurement (gold sets, sources, site terms) (M) | Yes. No gold set or source has been captured. | Each one's measurement | — |
| N703 (part: Cloudflare's blocked-request counts) | Cloudflare's blocked counts on the Security screen. | A zone and read token per group (M/A) | Yes. The screen already handles the counts being absent ("where the plan reports it"). | Optional for biosmoke7: Bob creates a read-only analytics token. Per group: the installer's later work. | — |
| N650 · case-import | Policy and standard packs. | LAW L5's pack path (Dep) | Yes | BOB, when LAW L5 is planned | — |
| N666 · jurisdictions, local-facts, entities | A group's own place rules (DEC-151 "B" capabilities). | Bob's: after the first public release (B) | Yes (DEC-151). Note that N858's D8 already built member-drafted jurisdiction rules (applied in T45), which overlaps part of it. | Time · Bob | — |
| gate.mjs aggregate + T47's L3+ rows | The next promotion stamp. | Order (O) | Yes, structural | T48's promotion | — |

## Table 2: BOB's and Bob's owed acts (handoff, "BOB's acts", "Settled")

| act | hold (cat.) | still holds? | who · clears what |
|---|---|---|---|
| A1 N1000 census | — | this file | BOB |
| A2 N1001 connect trace | (N) | owed | BOB worker (read-only) |
| A3 Fold DEC-200 (PR #33, U178–U181) | (N) | owed; DEC-200 is answered on `4803ca7d00` | BOB. Clears N997; N971's scanner wording (file-safety R42 → "file scanner", "safe view": can go to FILE-SAFETY's restart START, L3); N976 and N978 (answered by DEC-200 (1)–(3)); and the new rows' words. |
| A3 B158/B159 answers | (D) | **unanswered.** No commit after `4803ca7d00`. UX-DESIGN runs on the **primary** account, and K3054 says nothing more is to run there. | Bob decides where the design session runs (Q-G). Blocks N999, N1003, N1005, N847's words. |
| A4 Plan audit, screen by screen (K3052) | (N) | owed | BOB worker |
| A5 One rendered page for Bob | (N) | owed | BOB |
| B7 Restart CAPTURE, FILE-SAFETY, SOURCES | Bob's "Stop development" (K3057) (A) | yes | Bob says resume |
| B9 N943, N945, N996, N898 | (S, M, N) | owed | BOB (see Table 1) |
| Legacy census: "whether legacy-ui retires is Bob's, asked at T47's close" | (B) | **No.** K3052 answers it. | BOB updates the legacy census to "retires for users (N1002)" |
| Settled doubt (9): hiding the setup page's daily sections is Bob's | (B) | **No.** K3052 answers it (N1002). | BOB |
| Release at T47's close: cut, signing, deploys (plane, fleet, installer, legacy-ui retirement) | (A) | yes; each one is Bob's in session (K1716) | Bob, at release time, after N1004 passes |
| Bob's weekly meter on the secondary | (A) | at resume | Bob |
| `current.md` Counts line says 75; there are 77 entries | (N) | yes | BOB, a one-line fix |

## Table 3: entries already scheduled in T47 (not held)

N889 (T47-51) · N897 (1) (T47-56…64) · N908 (T47-27, -31…-33, -35, -40) · N939 (-6 ✓) · N940 (-8 ✓) · N941 (-12, L3, waiting for the restart) · N942 (-5 ✓) · N944, N950 (-4 ✓) · N946 (-14) · N947 (-13 L3, -15, -26, -30) · N948 (-3 ✓) · N949 (-20, -22…-24) · N951 (-30, -34) · N952 (-25, -27, -28) · N953 (-25, -26, -29, -76) · N954 (-29) · N955 (-9 ✓, -20, -61, -65, -66) · N956 (-1 ✓, -44) · N957 (-41) · N958 (-1 ✓, -35) · N959 (-36) · N960 (-38, -39) · N961 (-36…-39, -42, -49) · N962 (-42) · N963, N964 (-43) · N965 (-39) · N966 (-43, -44) · N967 (-46, -51) · N968 (-39, -44, -50) · N969 (-11 L3, -21, -45, -59) · N970 (-55) · N971 (-2 ✓, -11, -12 L3; its wording is now answered by DEC-200 (5)) · N972 (-8 ✓, -60) · N973 (-16) · N974 (-18, -61) · N975, N977 (-17) · N976 (-19, -61; its label is answered by DEC-200 (3)) · N978 (words only; answered by DEC-200 (1), (2)) · N979 (-11 L3, -59) · N980 (-53, -59) · N981 (-9 ✓, -65, -66, -75) · N982 (-75) · N983 (-68 ✓, -11, -13 L3, -69, -42, -73) · N984 (-47, -58) · N985…N987 (-56, -48, -58, -59, -61) · N988 (-72) · N989 (-7 ✓, -58, -74, -75) · N990 (-67 ✓) · N991 (-7 ✓) · N992 (L1–L11) · N993 (-66) · N995 (-34).

✓ = merged. Entries whose owning merges are all done can move to `archive/next-applied.md`: N939, N940, N942, N944, N948, N950, N990, N991.

## Summary

### 1. Holds that no longer stand (straight into T47)
- **N794, N865** (legacy-ui reds): K3052 retires legacy-ui for users. Fold them into N1002 → **L11**.
- **N997** (help, places, recovery): drawn in DEC-200 (8) → **L11** (screens-settings; help in N1005's module).
- **N999** (front door): Bob's D1–D3 are settled (K3052, K3053). It now waits only on the B158 drawings → **L11**.
- **N1006 Q3**: answered by K3052 (the new public case page replaces legacy-ui's) → **L11** (screens-publish).
- **N757 (later)**: not a hold. Bob ruled no AI proposals. Drop the row.
- **Settled doubt (9)** and **legacy-ui's retirement question**: both answered by K3052 → N1002, **L11**.
- **N945**: not reproduced on 0.83.0 (K3048). Close it after a short read-only study.
- **N1001, N1004**: no hold → **L6 + L11** and **L11**.

### 2. Roadblocks BOB can clear itself
1. Fold DEC-200 and the 50-screen registry (A3). Send file-safety R42's "file scanner" / "safe view" wording to FILE-SAFETY's restart START (L3).
2. N842: write the requirements for the interactive `enquire` path → L6/L7/L8/L11. The test-instance label covers the bar.
3. N847: name the pointer's provider (instance-setup, L11).
4. N1001: the trace, then logging requirements placed outside credentials (L6 agent-runner and agent-worker; L11 control-plane, screens-settings, plane).
5. N1004: name the owner, a not_product `journey-check` helper, L11 last.
6. N1005: placement against the size mark (perhaps a new `screens-arrive` module).
7. N670 (owner), N882 (requirement → `following`, L10), N880 U4 (placement). Recommended for T48: none of the three is on the journey.
8. The N943 and N996 split maps (splits in T48). N898 during the pause. N945 study closed.
9. Put N933 to ACTIONS-DESIGN. Update the legacy census, fix the Counts line, and move the merged entries to the archive.
10. For Bob's trial install into account 20b5…, point the installer at the images already copied there (N780, technical).

### 3. Bob's decisions
- **Q-A: the assistant in a group the installer creates.** Today such a group is never a test instance (K2816), and with an empty test set its assistant is switched off. So the founder's "first work" in the trial would have no assistant.
  - A: the trial group runs without the assistant, and says so.
  - B: let the deployer (Bob) mark the trial group as a test instance, with every AI output labelled as untested (this widens K2816 (2) for the trial only).
  - C: wait for the test set.
  - **Recommend B.** It is the only way Bob can try the whole journey now, and the label keeps it honest.
- **Q-B (N829): who writes the test set's matters?** Matters must be real public cases with answers written by people (D11, D14 C).
  - A: Bob and Believe in Oakland volunteers write about 20.
  - B: BOB drafts candidate matters from public records, and a named person writes each answer.
  - C: defer until the first public release.
  - **Recommend B, started now.** Without these matters, no real group gets the assistant.
- **Q-C (N858): the records-request template.**
  - A: keep it withheld until a named writer and a lawyer's review exist.
  - B: Bob names a writer and a pro bono reviewer now.
  - C: ship it labelled "draft, not reviewed".
  - **Recommend B.** It is the commonest first action; C carries legal exposure.
- **Q-D (N923): the stewards' contact address.**
  - A: a new dedicated mailbox at Believe in Oakland.
  - B: an existing Believe in Oakland address.
  - **Recommend A.** It is not needed for the trial, but a public release cannot go out without it.
- **Q-E (N780): before the first public release, publish the assistant's images publicly?**
  - A: yes, in a public registry.
  - B: no; other installs run without the assistant and scanner.
  - **Recommend A**, at public-release time. Not needed now.
- **Q-F (N1006):**
  - Q1, the welcome wizard. **Recommend A**: offered at the top of Home.
  - Q2, People. **Recommend A**: Find over people.
  - Q4, signing in the new interface. Options: paste-back through `/sign`, or an in-shell signer. **Recommend the in-shell signer**: paste-back fails K3052's real-users test.
- **Q-G: where the UX design session runs.** B158 and B159 are unanswered, and the session is on the primary account, which K3054 stopped.
  - A: start a new UX-DESIGN session on the secondary.
  - B: wait for the primary's weekly reset.
  - **Recommend A.** N999, N1003 and N1005 are blocked on it.

### 4. Waiting on the UX design stream
- B158: the front door, sign-in, sign-out, expiry, forgotten password (N999, N1005).
- B159: the founder's link page, the installer steps, the hand-over into setup (N1003).
- N847: the pointer's words.
- `legal_facts`: attending and recording screens.
- The residual v0.2 construct screens.
- N670, if DEC-127 (3) is undrawn.
- N880 U4's words.
- DEC-200 is answered; it only needs folding.

### 5. Waiting on a deployment, measurement or one of Bob's account acts
- **Bob:**
  - the installer's OAuth `connectivity-directory.bind` dashboard act (N1003, K2164);
  - the resume word (B7);
  - each release deploy and signing, and legacy-ui's Worker retirement (N1002);
  - the weekly meter;
  - optionally, a Cloudflare read token (N703).
- **Measurements and deployments:**
  - the live check of the assistant's investigate mode and M-Q2 (N647, N708), both after connect works;
  - N751, N853c;
  - N563, N579, N632, N641, N643, N645, N652, N698 (each part);
  - N824 (an email deployment, after upload is in use).

### 6. Counts per category (63 rows across Tables 1 and 2; Table 1 has 51 entries, with the eight measurement items counted one by one)

| Category | Rows | Holds still standing |
|---|---|---|
| Measurement or deployment | 16 (N751, N853c, N647, N708, N945, N703, the eight measurement items, N829, N824 also Bob) | 13; N945 partly |
| Bob's decision | 12 (N780, N794, N865, N824, N858, N923, N1006, N757, N666, N999, doubt 9, the legacy census) | 6 |
| Design not drawn | 7 (N847, N997, N1005, N999-now, `legal_facts`, the v0.2 screens, N1003-screens) | 6 |
| Dependency not built | 7 (N842, N880, N882, N933, N670, N650, N858's writer) | 2 fully; 4 partly or BOB-clearable |
| Bob's account act | 5 (the installer dashboard/deploy, B7 resume, the release deploys, the meter, N1002's deploy) | all |
| Size or split | 2 (N943, N996) | both; maps are BOB's now |
| Order or structure | 3 (N994, N998, the gate stamp) | all → T48 |
| None, or BOB's own act | 11 (N898, N1001, N1004, A1–A5, the Counts fix, ...) | — |

**Cleared or clearable into T47 by BOB:** 13. **Genuine Bob questions:** 7 (Q-A to Q-G).
