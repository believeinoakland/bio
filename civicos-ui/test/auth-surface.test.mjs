/* UI-24 — THE AUTHENTICATION SURFACE, AND THE PUBLISHED LIST. The two screens
 * every member meets FIRST, and until this file NOTHING IN THIS REPOSITORY HAD
 * EVER RUN EITHER OF THEM.
 *
 * WHY THIS EXISTS, and it is a measurement rather than a tidy-up. UI-23 swept
 * the D-173 envelope class across `app.html` and found a sixth instance that no
 * runtime instrument could have seen: `signIn` read `l.token` off `api("login")`
 * — off the ENVELOPE — so **member sign-in by password had never worked against
 * a real plane**, from the day it was written. The refusal half was worse: a
 * wrong password arrives as `{ok:true, result:{ok:false, reason:…, detail:…}}`,
 * so `l.ok === false` never fired either and the gate showed the member the
 * envelope instead of the record's own reason. It was found by the STATIC arm of
 * `check-mock-envelope.mjs`, because arm B — the runtime one, which watches what
 * a mock actually answered — IS ONLY AS WIDE AS THE HARNESS, and the harness
 * reached neither `signIn` nor `pubList`. Both paths sat outside every
 * instrument this project owns.
 *
 * So this suite is the instrument, and its subject is deliberately unglamorous:
 * no surface is redesigned here, and where reality disagreed with the code's
 * assumptions the assertion is corrected and says why (CLAUDE.md), never
 * exempted.
 *
 * WHAT IT DRIVES, end to end, through `app.html`'s own handlers:
 *
 *   1 SIGN IN, CORRECT PASSWORD — `op=login` answered in the WIRE shape
 *     (`{ok:true, result:{ok:true, role, token, expires}}`, which is what
 *     `index.mjs`'s login handler returns: it hands the Durable Object's answer
 *     back VERBATIM). The token must be read off `result`, the session must be
 *     marked, and — the assertion that actually bites — EVERY op the surface
 *     sends afterwards must carry that token. A token read off the envelope is
 *     `undefined`, `rec` drops the parameter entirely, and the whole session is
 *     unauthenticated while every screen still paints.
 *
 *   2 THE SESSION LANDS WHERE `boot()` EXPECTS IT. `boot` is the other half of
 *     the gap: no harness had ever run it either, so `PLANE.me`, the rail, the
 *     act-source load and the landing route were all reached only by suites that
 *     set them up by hand. Driven here for real — `op=whoami` -> `PLANE.me`,
 *     `op=affordances` -> the published vocabularies, the gate closed, the
 *     working space opened, and the queue asked for.
 *
 *   3 SIGN IN, REFUSED — the plane's refusal, rendered as the plane's, with the
 *     composed-wording instrument over it (UI-13's arm (d)): a sentence this
 *     surface wrote FAILS even when the reason code sitting beside it is right.
 *     Nothing is written, no session is marked, and `boot()` is never entered.
 *     **WHAT THE PLANE ANSWERS HERE CHANGED UNDER THIS SUITE**, and the
 *     correction is at `PLANE_WORDS` below: REC-41 collapsed the two refusal
 *     codes into one and added the `detail` SENTENCE the plane never had, so the
 *     gate renders the sentence and this file reads it OUT OF THE PLANE rather
 *     than holding a copy of it.
 *
 *   3b NO RETIRED LOGIN CODE SURVIVES ANYWHERE UNDER `civicos-ui/` — a
 *     source-level sweep over every file in the package, because the way this
 *     defect came back would be a stale copy in a file no harness runs (it had
 *     already happened twice: this suite's own mock and a comment in
 *     `app.html`). A retired wire string is not a naming preference: matching on
 *     one is matching on something the plane cannot send.
 *
 *   4 THE PUBLISHED LIST — `pubList` against `op=publishedmanifest`, which
 *     `index.mjs` re-wraps explicitly (`json({ok:true, result:(await
 *     r.json()).result})`). The public space is reached with NO credential, and
 *     that is asserted: a published-record screen that quietly authenticated
 *     would be a different product.
 *     **AND THE MANIFEST FIXTURE COULD NOT REPRESENT THE RECORD IT DRIVES —
 *     M0-24, 2026-09-10**, measured by arm C of `check-mock-envelope.mjs` rather
 *     than noticed. `published[]` carried 7 of the plane's 9 columns AND answered
 *     two keys the plane has never sent; `cases[]` and `caseMembers[]` were absent
 *     entirely. So a loose ratified finding WITH a frozen pair — REC-49's branch,
 *     and the reason that correction exists — was outside this fixture's
 *     vocabulary, and the suite was green against a record it could not describe.
 *     The fixture is corrected at its site, the corrected shape is PINNED against
 *     `store.mjs`'s own SELECT in (4b), and both halves of the published list are
 *     driven in (4c). Without the pin the correction is decoration, which is what
 *     M0-23 measured when its own control came back green.
 *
 *   5 THE COVERAGE LINE ITSELF. `check-mock-envelope.mjs`'s arm B reports the
 *     ops the harness exercises, and UI-24's accepts-when is that the line MOVED.
 *     Rather than read that off a log, this suite re-runs ITSELF under the
 *     guard's own probe (`test/envelope-probe.mjs`, the same `--import`
 *     mechanism the guard uses) in a child process and asserts from the probe's
 *     own output that `login` and `publishedmanifest` are now observed, and
 *     observed WRAPPED. Measured, in the loop the reader runs.
 *
 * THE MOCKS ANSWER THE WIRE SHAPE. `op=login` and `op=publishedmanifest` are
 * both WRAPPED — neither is in the guard's FLAT list, and this file asserts that
 * rather than assuming it, so the day either grows a flattening handler in
 * `index.mjs` this suite fails instead of drifting.
 *
 * AND THE ENVELOPE IS NOT THE ONLY WAY A MOCK CAN BE WRONG — UI-30, 2026-08-04,
 * and it is this file's own correction rather than someone else's. This suite
 * shipped saying the mocks answer the wire shape "from birth", and it was true
 * of the SHAPE and false of the CONTENT: the refusal branch hand-answered a
 * reason code, and when REC-41 retired that code the suite stayed 62/62 GREEN
 * while asserting against something the plane cannot produce. A copy that
 * agrees with the plane at zero cost is not evidence (CLAUDE.md), and the
 * envelope guard cannot see this class — it judges shape, not content. So the
 * refusal's wording is now READ OUT OF `bio-plane/src/store.mjs`, and a
 * source-level sweep keeps the retired codes out of the whole package. The
 * corrected reasoning is at `PLANE_WORDS` below, where the old one stood.
 *
 * NEGATIVE CONTROL, NINE ARMS — (a)-(d) RUN 2026-08-04 (UI-30), (e) RUN
 * 2026-08-04 (UI-32), (f) RUN 2026-08-05 (UI-25), (g)-(i) RUN 2026-09-10 (M0-24).
 * (The count was stale at "FIVE" while six arms stood — CORRECTED 2026-09-10 with
 * the two new ones, since a hand-carried number in a header nobody re-measures is
 * this project's most-repeated finding and this header was an instance of it.)
 * Arms (a)-(c) are ALSO run mechanically below in
 * their own VM context built from a mutated copy of the source — nothing on
 * disk is touched by those, so there is no restore to get wrong. EVERY ARM WAS
 * ALSO RUN ONCE ON DISK, 2026-08-04 (UI-30), against the FINAL file, which is
 * the run that answers "does the LOOP THE READER RUNS fail" — and the counts
 * below are that run's. Only `app.html` is ever mutated (arm (c) needs no
 * mutation at all, see below), and it was restored BYTE-IDENTICAL after each
 * arm: sha256 3788ef1bf9b3424eeafbf8d651687e01b0cd5025a1ae3065a5307a94f4043b28
 * before and after all four.
 *
 *   (a) BREAK THE TOKEN READ — `apiR` and `apiQ`, the untokened transports'
 *       seams, stop opening the envelope (`return (j && j.result !== undefined)
 *       ? j.result : j;` -> `return j;`, spliced INSIDE each function's own
 *       body). That is D-173's sixth instance restored exactly.
 *       ON-DISK RUN: **27 of 71 assertions FAIL** — the token, the session, the
 *       authentication of every op after it, all fifteen of `boot()`'s, the
 *       record's own sentence at the gate, and both published-list rows. THE
 *       POINT OF THE ARM: the identical edit could not fail ANYTHING before
 *       UI-24, because nothing in this repository ran these two paths.
 *       SPLICED INSIDE THE FUNCTION BODY DELIBERATELY — `recR` and `recPostR`
 *       carry a byte-identical line and both come EARLIER in the file, so a
 *       plain string replace mutates the wrong seam and reports green. That is
 *       UI-22's measured instrument finding, applied rather than re-learned.
 *
 *   (b) THE COMPOSED-WORDING INSTRUMENT — the refusal branch renders a sentence
 *       this surface wrote. RETARGETED 2026-08-04 (UI-30) to the shape REC-41
 *       landed, and the retarget made it SHARPER: the mutation now prints the
 *       plane's own reason CODE and then adds prose of its own, so it looks
 *       more faithful than the surface that shipped and every code-shaped
 *       assertion is green against it. Only subtracting what the plane said and
 *       reading the remainder can see it.
 *       ON-DISK RUN: **6 of 71 FAIL** — the sentence missing, the code exposed
 *       to a member, the residue scan naming the surface as author, and the
 *       three control/contrast assertions that ride with them.
 *
 *   (c) UNWRAP THE LOGIN MOCK — the guard's own arm. In the in-VM half a child
 *       process drives this suite with a login mock that answers flat and the
 *       probe records it flat against a wire map that says WRAPPED.
 *       ON-DISK RUN, and it is the receipt for why arm B exists at all. The
 *       mutation is reached through this file's own `UI24_FLAT_LOGIN` switch
 *       rather than by editing the mock, so NOTHING IS WRITTEN TO DISK and the
 *       arm is re-runnable in one step: `UI24_FLAT_LOGIN=1 node
 *       check-mock-envelope.mjs` exits 1 with
 *         FAIL: auth-surface.test.mjs answers op=login UNWRAPPED (2 of 2
 *         answers; top-level keys ["ok","role","token","expires"]) …
 *       naming the suite and the op — WHILE THE SURFACE ASSERTIONS IN THIS FILE
 *       ALL STAY GREEN, because a flat answer happens to put `token` where the
 *       correct read looks. `UI24_FLAT_LOGIN=1 node test/auth-surface.test.mjs`
 *       moves only 4 of 71, and every one of them is a control or a coverage
 *       assertion rather than a claim about the surface. A mock shaped like the
 *       bug proves nothing, and this file cannot tell on its own; the guard can.
 *
 *   (d) RESTORE A RETIRED LOGIN CODE — UI-30's own, and the arm that answers
 *       "could a stale copy come back silently". One of the two codes REC-41
 *       retired is put back into the `app.html` comment that used to spell it.
 *       ON-DISK RUN: **2 of 71 FAIL**, and the first NAMES both the file and
 *       the string it found: `NO RETIRED LOGIN CODE survives anywhere under
 *       civicos-ui/ — app.html still carries …`. The second is the probe child
 *       re-running this suite, which fails with it.
 *       THERE IS NO IN-VM HALF FOR THIS ARM AND THAT IS NOT AN OMISSION: the
 *       sweep's subject is what is ON DISK in this package, so an arm run
 *       against a mutated string in memory would be measuring a different
 *       thing. The mutation is the smallest one that reproduces the defect this
 *       item found — a retired wire string surviving in a file no harness runs.
 *
 *   (e) RESTORE THE CONTENT-FALSE MOCK — UI-32's, and it is UI-30's own lesson
 *       one field further in. Put the `capture_acts` fixture back the way it
 *       stood: `label` hand-typed and `prompt:null` for the attest act.
 *       ON-DISK RUN 2026-08-04: **2 of 73 FAIL**, and the measurement is the
 *       71 THAT DO NOT. A fixture answering a shape the plane cannot send for
 *       this act — `attest` has carried a `prompt` since REC-43 — was invisible
 *       to every assertion in this file, because this suite renders no attest
 *       surface. The two that fail are the new content pin and the guard's own
 *       probe child re-running this suite behind it. That is D-173's family
 *       stated exactly: a mock must answer the wire CONTENT, not merely the
 *       wire SHAPE, and the only thing that catches the difference is reading
 *       the field off the PUBLICATION instead of typing it.
 *       `auth-surface.test.mjs` restored byte-identical, sha256 12c78c52… .
 *
 *   (f) STRIP THE PLANE'S DETAIL SENTENCE — RUN 2026-08-05 (UI-25), on disk,
 *       against `bio-plane/src/store.mjs` and not against this package at all.
 *       Every `detail: Store.LOGIN_REFUSAL_DETAIL.<CODE>` is deleted from the
 *       arms that answer the refusal, leaving the code bare; `store.mjs`
 *       restored byte-identical, sha256
 *       95332d64f73e115445eb77f73eae887ab1c24eddad7dbbf5b40019ecc4b32dab before
 *       and after.
 *       ON-DISK RUN: **2 of 74 FAIL** — "EVERY arm that answers the refusal
 *       code answers the sentence with it — none is left bare", plus the probe
 *       child re-running this suite behind it.
 *       WHY THIS ARM IS RECORDED HERE RATHER THAN CLOSING SOMETHING. UI-25
 *       carried a batch rider routed out of REC-39, whose measurement was that
 *       this suite stayed **green at all 62** under exactly this mutation,
 *       because `PLANE_WORDS` was then a HAND COPY of the plane's sentences and
 *       a hand copy agrees with its source at zero cost. **UI-30 had already
 *       closed it** on 2026-08-04 by reading the constant out of `store.mjs`,
 *       and this arm is the receipt: the same mutation that once moved NOTHING
 *       now fails by name. The rider is recorded as CLOSED-BY-MEASUREMENT
 *       rather than deleted unmeasured, because "someone else already fixed it"
 *       is a claim, and running the control is the evidence.
 *
 *
 *   (g) RESTORE ONE PHANTOM KEY — M0-24's, RUN ON DISK 2026-09-10 against the
 *       FINAL file, armed ALONE. `manifest_sha:"d".repeat(64)` put back on the
 *       first `published[]` row, which is exactly where it stood before this
 *       item and is a key `publishedManifest()`'s `published` SELECT has never
 *       carried.
 *       ON-DISK RUN: **3 of 92 FAIL**, and the first NAMES the key and the row it
 *       is on: "…PHANTOM INQ-2026-0004-sewer: manifest_sha". The second is the
 *       by-name pin on the two `cases[]` columns, and the third is the probe
 *       child re-running this suite behind it, as in arms (d) and (e).
 *       AND THE INSTRUMENT'S HALF, measured in the same arm: arm C of
 *       `check-mock-envelope.mjs` re-reports the row as WIDER THAN THE WIRE
 *       naming `manifest_sha` — and the guard still EXITS 0. That is the declared
 *       behaviour and not a miss: the census REPORTS, and this file is where the
 *       reporting becomes a failure. Before this item the census said the same
 *       sentence about two keys and nothing in the estate failed, which is the
 *       decoration M0-23 measured on its own correction.
 *       Restored byte-identical, sha256 719519e9… (73,766 B).
 *
 *   (h) OVER-STRICTNESS — M0-24's, RUN ON DISK 2026-09-10, armed ALONE, and it
 *       is run in BOTH spellings because a fence is only shown not to overreach
 *       by pointing it at work it should let through.
 *       NARROW (as shipped): `cases[]` carries 6 of the plane's 9 columns —
 *       `bias_acknowledgement`, `bar` and `project_id` omitted because M0-23's
 *       census measured ZERO reads of any of the three in `app.html`. The census
 *       NAMES it ("carries 6 of the 9 column(s) … MISSING …") and EXITS 0.
 *       Nothing fails. That is the correct disposition for an open question.
 *       WIDE (the spelling this item did not anticipate): all three added to the
 *       `cases[]` row — the honest widening of the day a surface renders the bar
 *       or the publishing project. **92 of 92 green, nothing fails**, and the
 *       census simply re-reports `cases[]` at 9/9 and drops it from the narrow
 *       list. The pin in (4b) is indifferent to `cases[]` in both directions, by
 *       construction rather than by promise.
 *       THIS ARM FOUND ITS OWN SUBJECT WRONG AND IT IS RECORDED RATHER THAN
 *       SMOOTHED: the first draft of (4b)'s last assertion pinned the three
 *       columns ABSENT, so the WIDE spelling went RED — a suite that claimed to
 *       defend against a fence tighter than its rule, being one. It is corrected
 *       at its site to assert what `pubList` demonstrably reads instead, and the
 *       defect was found by ARMING the control and never by reading the code.
 *       Restored byte-identical, sha256 f0174f2f… (74,467 B).
 *
 *   (i) PUT `required` BACK TO NULL ON THE ROSTERED MEMBER — M0-24's, RUN ON DISK
 *       2026-09-10, armed ALONE, and it exists because `required` is the SECOND
 *       column this item restored and a restored column nothing reads is the
 *       decoration M0-23 measured on its own correction. The first draft of this
 *       fixture carried `required: null` on both rows and a declared bar on the
 *       LOOSE one, where `pubList` renders no bar at all — so the column was
 *       carried, counted by the census, and opened by nothing.
 *       ON-DISK RUN: **3 of 94 FAIL** — both DEC-17 assertions in (4c), plus the
 *       probe child behind them. With the bar on the row the surface actually
 *       renders one from, the column is READ and not merely present.
 *       Restored byte-identical, sha256 a9afa3a2… (80,517 B).
 *
 * Run alone: `node test/auth-surface.test.mjs`.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not
   discard the writer's own output. SHARED from the plane's test estate rather than copied into
   this one — ONE implementation, so `bio-plane/test/tally-through-pipe.test.mjs` guards it for
   both estates and a node release closing the private door goes red once instead of half. The
   import is for its SIDE EFFECT and is idempotent. Census: `stdio-census.test.mjs`. */
import vm from "vm"; import fs from "fs"; import path from "path"; import os from "os";
import { webcrypto } from "crypto";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { appScript } from "./extract.mjs";
import { unknownOpWire } from "./plane-refusal-wire.mjs";   /* UI-100: the dispatch miss is DERIVED from index.mjs and the DEC-49
      catalogue, never typed — see that module's header. */
/* UI-32: the act catalogue this suite hands the surface is the RECORD'S, read
   off the same array `op=affordances` maps over. `affordances.mjs` reaches no
   `cloudflare:workers` binding, so a node harness can import it — UI-28's
   finding, and the reason this correction costs two lines instead of a textual
   read of the plane's source. */
import { CAPTURE_ACTS, ATTEST_FENCE } from "../../bio-plane/src/affordances.mjs";
/* D-257 — the retired-login-code sweep below walks the working tree and FLOORS
   on what it found. One mechanism, imported; the argument is at the walk. */
import { readGitProvenance, repoPath, reportProvenance } from "../../bio-plane/scripts/provenance.mjs";

const SELF = fileURLToPath(import.meta.url);
/* Set when this file is re-run by its own coverage/NC arms, so the child does
   the driving and skips the arms that would spawn another one. */
const CHILD = process.env.UI24_PROBE_CHILD || "";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

/* ============================================================
   THE PLANE, MIRRORED AT THE WIRE
   ============================================================ */

const TOKEN = "sess_" + "a".repeat(32);
const HANDLE = "alice";
const GOOD_PW = "correct horse battery staple";

/* `op=whoami`'s answer, in index.mjs's own field order. */
const WHOAMI = {
  tokenClass: null, session: true, member: "m_alice", handle: HANDLE,
  administer: false, rootOfTrust: false, capabilities: ["contribute"],
  vocabulary: ["contribute", "publish", "administer"],
  detail: "capabilities are set by an administrator and gate what this account may DO, not what it may see",
};

/* `op=publishedmanifest`'s answer — store.mjs publishedManifest(), whose whole
   point is that anyone can verify it without this instance's cooperation.

   CORRECTED 2026-09-10 (M0-24, M0-23's census delegation), AND NOT EXEMPTED. The
   old fixture was WRONG IN BOTH DIRECTIONS AT ONCE on one array, which is why it
   is worth stating rather than quietly rewriting:

     NARROWER — `published[]` carried 7 of the 9 columns the plane's own SELECT
     carries, MISSING `strength` and `required`. Those two are the frozen pair and
     the declared bar of a RATIFIED FINDING, and REC-49 put them on this index
     deliberately, so that a finding answers with its own pair inside the awaiting
     window as much as outside it. A fixture without them cannot represent a loose
     ratified finding that HAS a pair — precisely the state REC-49 corrected
     `pubList` to render — so this suite drove the published list for a month
     against a manifest in which that branch was unreachable. Nothing was red; the
     branch was simply outside the fixture's vocabulary, which is D-173's class one
     altitude down and is exactly what a mock-shape gap costs.

     WIDER — and the same rows answered `manifest` and `manifest_sha`, two keys the
     `published` SELECT does not carry AT ALL. They belong to `cases[]`, where the
     container's manifest and its hash actually live, and a bundle row has never
     had either. A fixture inventing a column is the same defect pointing the other
     way: an assertion could have been written against a key no plane can send, and
     it would have been green forever. They are DELETED from `published[]` and
     appear below on the `cases[]` row, which is the row the plane puts them on.

   AND THE ARRAYS THE PLANE ALWAYS SENDS ARE HERE NOW. `publishedManifest()`
   answers `cases[]` and `caseMembers[]` on every call; this fixture answered
   neither, so the four published rows could only ever render as findings in no
   case. Both are added, with the roster row joined to its finding THROUGH ITS PIN
   (`caseMembers[].version_sha` -> `published[].bundle_sha`, never edition to
   edition — the plane says so in its own `production` sentence and UI-56 corrected
   `pubList` to it), so this suite can now drive both halves of the published list.

   `cases[]` IS LEFT AT 6 OF THE 9 COLUMNS ON PURPOSE, matching both peer suites
   (`publishedcase.test.mjs` and `preauth-vocabulary.test.mjs`). M0-23's census
   measured ZERO reads in `app.html` of `bias_acknowledgement`, of `project_id` and
   of a case-level `bar`. Carrying them here would be a fixture column added for
   its own sake — a fence tighter than its rule — and the census NAMES the gap on
   every run, which is the correct disposition for it and is this item's
   over-strictness control. It becomes real work the day a surface renders one.

   THE SHAPES OF `strength` AND `required` ARE THE PLANE'S, not this file's
   invention: `strength` is the ARRAY of per-axis objects `pubPair` reads (a pair
   is both axes or it is not a pair), and `required` is the bar object `declared`
   gates. Both are modelled on the wire rows `publishedcase.test.mjs` already
   carries for the same two columns. */

/* One loose finding's frozen pair. GRADED on capture, UNRATED on connection —
   the DEC-18 boundary case, so the rendered pair cannot be mistaken for a single
   letter about the whole finding. */
const LOOSE_PAIR = [
  { axis:"capture", state:"graded", grade:"B", weakest:"INFO-2026-4401", load_bearing:1, population:2,
    detail:"capture B — no stronger than the weakest capture it rests on, which is INFO-2026-4401." },
  { axis:"connection", state:"unrated", grade:null, weakest:null, load_bearing:0, population:1,
    detail:"UNRATED on connection: no leg on this axis carries an established grade, so this conclusion rests on nothing established here." },
];
/* THE TWO STATES OF `required`, BOTH ON THE PAGE. An ABSENT bar is not a bar of
   zero — the plane says so in its own sentence and `pubBarHtml` prints that
   sentence rather than a dash — so a fixture that carried only one of the two
   could not tell the surface's two branches apart. The DECLARED one goes on the
   rostered member, which is where `pubList` actually renders a bar. */
const BAR_DECLARED = { declared:true, source:"group", capture:"B", connection:"C",
  declared_by:"vera", declared_at:"2026-05-02",
  detail:"the group's default required strength: capture B, connection C, declared by vera on 2026-05-02." };
const BAR_ABSENT = { declared:false, source:"none", capture:null, connection:null,
  detail:"no required evidentiary strength was declared for this finding, by the group or by any project citing it, so nothing here was measured against one. An absent bar is not a bar of zero, and this finding makes no claim to have cleared any standard." };

const CASE_ID = "CASE-2026-0002-marina";

const MANIFEST = {
  ok: true, scope: "published",
  /* NINE COLUMNS, IN THE PLANE'S OWN ORDER, AND NOTHING THE PLANE DOES NOT SEND.
     The assertion that holds this true reads the column list OUT OF store.mjs
     rather than repeating it here — see "(4b)" below. */
  published: [
    /* LOOSE AND WITH A PAIR: this finding is in no case (no roster row points at
       its hash) and carries its own frozen pair. REC-49's branch, representable
       here for the first time. */
    { bundle_id:"INQ-2026-0004-sewer", edition:1, title:"Why did the sewer contract skip competitive bid?",
      bundle_sha:"c".repeat(64), ratified_at:"2026-07-14T09:00:00Z", attestor_key:"SHA256:zzz",
      gate_version:"1.4", strength:LOOSE_PAIR, required:BAR_ABSENT },
    /* IN A CASE, WITH NO PAIR ON THE RECORD AND A BAR THAT WAS DECLARED. Every
       field here is the OPPOSITE of the row above, deliberately: `strength: null`
       is what the plane answers for a ratified finding it holds no pair for — a
       fact about the record rather than a gap — so the no-pair sentence is
       reachable, and the declared bar is on the row `pubList` actually renders a
       bar from. The two rows between them reach all four branches, where two
       copies of one state would have reached two. */
    { bundle_id:"INQ-2026-0011-transfer", edition:2, title:"Where does the transfer basis come from?",
      bundle_sha:"e".repeat(64), ratified_at:"2026-07-30T12:00:00Z", attestor_key:"SHA256:zzz",
      gate_version:"1.4", strength:null, required:BAR_DECLARED },
  ],
  /* WAS 6 of 9 DELIBERATELY, WIDENED TO 9 of 9 AT THE CASE-6 MERGE (2026-09-10,
     CONDUCT). M0-24 left `bias_acknowledgement`, `bar` and `project_id` off this
     row because the census measured ZERO reads of them in `app.html` — and
     CASE-6, landing in the same integration, made `pubList` read `bar` and
     `project_id` (the case's own standard, drawn once, DEC-72 clause 2). The
     zero-readers ground is gone, so the narrowness went with it: this is the
     honest widening M0-24's own over-strictness arm existed to keep legal.
     `manifest_sha` and `manifest` are HERE, on the row the plane actually
     selects them from. */
  cases: [
    { case_id:CASE_ID, edition:1, scope:"Did the marina works get paid for out of the sewer fund?",
      ratified_at:"2026-07-30T12:30:00Z", manifest_sha:"f".repeat(64), manifest:"{}",
      bar:BAR_DECLARED, project_id:"PRJ-2026-0007",
      bias_acknowledgement:"Authored for edition 1: the publisher works the sewer-fund beat and says so." },
  ],
  /* 6 of 6. The pin is the join: `version_sha` is the transfer finding's
     `bundle_sha`, and the case's edition (1) DIVERGES from the finding's own (2),
     so a join on edition-to-edition would silently drop this member — which is
     what UI-56 measured and corrected in `pubList`. */
  caseMembers: [
    { case_id:CASE_ID, edition:1, ord:0, bundle_id:"INQ-2026-0011-transfer",
      version_sha:"e".repeat(64), role:"load_bearing" },
  ],
  shas: [],
  detail: "every hash here is verifiable by anyone with ssh-keygen and the doorbell, without this "
        + "instance's cooperation or continued existence. Nothing unpublished appears, by construction: "
        + "this reads the published projection and never the working corpus.",
};

/* THE PLANE'S OWN WORDS FOR A REFUSED LOGIN — READ FROM THE PLANE, NOT TYPED.
   ==========================================================================
   CORRECTED 2026-08-04 (UI-30), AND THE OLD VERSION WAS WRONG IN BOTH HALVES
   RATHER THAN MERELY OUT OF DATE. It read:

     `store.mjs login()` answers [the two now-retired reason codes, spelled out
     here as string literals] and NOTHING ELSE — no `detail`, no sentence. So
     the honest thing for the gate to render is the reason … The gap is real and
     is raised for CONDUCT rather than closed here with an invention.

   (The two codes are described rather than quoted, here and everywhere below.
   The sweep at the end of this section is what keeps them out of this package,
   and a file that enforces an absence cannot be an instance of it.)

   (1) THE CODES ARE GONE. REC-41 (landed on main, I3 6.0.0) collapsed both into
       ONE, `SIGN_IN_REFUSED`, because with `op=bootstrap`'s roster closed a
       distinguishable refusal is the enumeration surface that replaces it. So
       from that landing until this correction THIS SUITE WAS 62/62 GREEN
       AGAINST A SHAPE THE PLANE CANNOT PRODUCE: the mock hand-answered a
       retired code and every assertion about "the record's own reason" was
       satisfied by the mock agreeing with itself. That is D-173's class exactly
       — a UI mock must answer the WIRE shape — and CLAUDE.md's rule is to
       CORRECT the assertion with a dated reason, never exempt it.

   (2) THE GAP THIS COMMENT RAISED FOR CONDUCT IS CLOSED, BY THE PLANE, WHICH IS
       THE ONLY PLACE IT COULD HAVE BEEN CLOSED. `op=login` now carries a
       `detail` SENTENCE beside the code, from `Store.LOGIN_REFUSAL_DETAIL`. The
       reasoning the old comment reached for is unchanged and is why this is not
       a reversal: a surface may render a refusal it RECEIVED and may never
       compose one (DEC-8). Nothing was invented here or in `app.html`; the
       plane learned to say it, and the gate now renders what it says instead of
       showing a member a machine code to decode.

   AND THE SENTENCE IS READ OUT OF `store.mjs`, never copied into this file.
   REC-43 measured, for the fourth time in this project, that a hand-typed copy
   agrees with its source at ZERO COST and leaves every behavioural assertion
   green while the two drift — which is the very defect this correction is
   cleaning up, one layer over. `store.mjs` cannot be imported here (it opens
   with `import … from "cloudflare:workers"` and only workerd provides that), so
   it is read TEXTUALLY, the way `check-semantics.mjs` already reads it. That
   extraction is itself asserted below: an extraction that silently yields ""
   would make every `includes()` in this file trivially true, which is the same
   costless equality wearing different clothes. */
const STORE_SRC = fs.readFileSync(new URL("../../bio-plane/src/store.mjs", import.meta.url), "utf8");
function planeLoginRefusal(){
  const block = /static LOGIN_REFUSAL_DETAIL = \{\n([\s\S]*?)\n {2}\};/.exec(STORE_SRC);
  if(!block) return null;
  const out = {};
  /* One entry per `KEY:` at the constant's own indentation; a value is the
     concatenated string literals that follow it, joined the way the source
     joins them with `+`. */
  for(const part of block[1].split(/^ {4}(?=[A-Z_]+:)/m)){
    const k = /^([A-Z_]+):/.exec(part);
    if(!k) continue;
    const lits = [...part.slice(k[0].length).matchAll(/"((?:[^"\\]|\\.)*)"/g)]
      .map(m => JSON.parse('"' + m[1] + '"'));
    if(lits.length) out[k[1]] = lits.join("");
  }
  return out;
}
const REFUSAL = planeLoginRefusal();
const REFUSAL_CODE = REFUSAL ? Object.keys(REFUSAL)[0] : "";
const REFUSAL_SENTENCE = REFUSAL ? REFUSAL[REFUSAL_CODE] : "";

ok("the plane's login-refusal constant is readable from here", !!REFUSAL && !!REFUSAL_CODE);
ok("ONE code and ONE sentence — a second entry means the refusals split again and this suite must be re-read, not re-pointed",
   !!REFUSAL && Object.keys(REFUSAL).length === 1);
/* The extraction is REAL prose, not an empty string or a fragment. Without
   this, a regex that stopped matching would hand every assertion below a free
   pass. */
ok("and the sentence extracted is a whole sentence rather than an empty read",
   REFUSAL_SENTENCE.length > 200 && /^[a-z].*\.$/s.test(REFUSAL_SENTENCE)
   && !REFUSAL_SENTENCE.includes('"') && !/\s\+\s/.test(REFUSAL_SENTENCE));
/* AND EVERY REFUSAL ARM IN THE PLANE PAIRS THE CODE WITH THE SENTENCE. Reading
   the constant proves the sentence exists; this proves it is what `op=login`
   actually returns — including the DO dispatch's own wrapper arm, which refuses
   before `login()` is ever reached. An arm that answered the code bare would
   send this gate back to rendering a machine code with nothing to say. */
{
  const codes = [...STORE_SRC.matchAll(new RegExp(`reason: "${REFUSAL_CODE}"`, "g"))].length;
  const paired = [...STORE_SRC.matchAll(
    new RegExp(`reason: "${REFUSAL_CODE}",\\s*detail: Store\\.LOGIN_REFUSAL_DETAIL\\.${REFUSAL_CODE}`, "g"))].length;
  ok("the plane refuses a sign-in in more than one place, so the pairing is worth asserting", codes >= 2);
  ok("EVERY arm that answers the refusal code answers the sentence with it — none is left bare",
     codes > 0 && paired === codes);
}

/* Everything the plane said about this refusal, in one list, so the residue
   scan below can subtract ALL of it before asking whether what remains reads
   like a refusal this surface wrote. */
const PLANE_WORDS = [REFUSAL_CODE, REFUSAL_SENTENCE];

/* ---- NO RETIRED LOGIN CODE SURVIVES ANYWHERE UNDER `civicos-ui/` ----------
   A source-level sweep, because the runtime assertions above can only see the
   paths this harness drives, and the way this defect came back would be a copy
   sitting in a file nobody runs — which is exactly where BOTH of the instances
   UI-30 found were sitting (this suite's mock, and a worked example inside an
   `app.html` comment). Matching on a retired wire string is not a naming
   preference: it is matching on something the plane cannot send.
   THE NAMES ARE ASSEMBLED FROM PIECES so that the file enforcing the absence is
   not itself an instance of what it forbids — a sweep that finds itself either
   fails forever or gets weakened into a sweep that finds nothing. */
const RETIRED_LOGIN_CODES = [["BAD", "PASSWORD"], ["NO", "SUCH", "ROLE"]].map(p => p.join("_"));
{
  const root = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
  const walk = d => fs.readdirSync(d, { withFileTypes:true }).flatMap(e => {
    if(e.name === "node_modules" || e.name.startsWith(".")) return [];
    const p = path.join(d, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
  const files = walk(root);
  /* A walk that reached nothing would pass silently, so it is measured.
     AND THE MEASUREMENT IS THE REPRODUCIBLE ONE (D-257 / M0-16): this walk reads
     the WORKING TREE, `refs/stash` is repository-wide across all sixty worktrees
     and `push -u` carries untracked files, so a phantom deposited here used to
     raise `files.length` — the floor — the wrong way. The SWEEP still reads the
     whole working tree (a retired code in an uncommitted file is still a finding
     and must still red this suite); the FLOOR reads `git ls-tree HEAD` alone.
     `inCommit` says true for everything when git cannot answer, and
     `reportProvenance` prints UNVERIFIED rather than clean. */
  const REPO = fileURLToPath(new URL("../../", import.meta.url));
  const PROV = readGitProvenance(REPO);
  const filesRepro = files.filter(f => PROV.inHead === null || PROV.inHead.has(repoPath(REPO, f)));
  reportProvenance({
    prov: PROV,
    items: files.map(f => ({ path: repoPath(REPO, f), what: path.relative(root, f),
      counted: "read for retired login codes, and counted into this sweep's reach floor" })),
    instrument: "this suite's retired-code sweep",
    corpus: `civicos-ui/: ${files.length} file(s) walked, ${filesRepro.length} of them in the commit`,
    totals: PROV.inHead === null ? [] : [
      { label: "files swept", contaminated: files.length, reproducible: filesRepro.length, source: "files" },
    ],
  });
  /* SAY UNVERIFIED, NEVER CLEAN (provenance.mjs rule 4) — see D-257 control ARM 3. */
  const HEAD_SAYS = PROV.inHead === null
    ? "UNVERIFIED — git could not answer `ls-tree HEAD`, so this is the whole working-tree walk"
    : `in the commit at HEAD (${PROV.headSha})`;
  ok(`the sweep reads the whole package, including the surface and this suite — ${files.length} file(s) walked,`
     + ` floored on the ${filesRepro.length} ${HEAD_SAYS}, floor 20`,
     filesRepro.length > 20 && files.includes(path.join(root, "app.html")) && files.includes(SELF));
  const found = [];
  for(const f of files){
    let src = ""; try{ src = fs.readFileSync(f, "utf8"); }catch(_){ continue; }
    for(const code of RETIRED_LOGIN_CODES){
      if(src.includes(code)) found.push(path.relative(root, f) + " still carries " + code);
    }
  }
  ok("NO RETIRED LOGIN CODE survives anywhere under civicos-ui/ — "
     + (found.length ? found.join(" · ") : "none, over " + files.length + " files"),
     found.length === 0);
}

/* THE ACT CATALOGUE `boot()` loads. Only the fields boot's own path touches.
 *
 * CORRECTED 2026-08-04 BY UI-32, NEVER EXEMPTED, and it is the SAME defect this
 * suite's own header was corrected for by UI-30 — one field further in. What
 * stood here hand-typed `label:"Co-attest this capture"` and answered
 * `prompt:null` for the attest act. Both were content the RECORD publishes: the
 * label has been on `capture_acts` since REC-38, and REC-43 put the honesty
 * fence there as `prompt` under DEC-39, so on the wire this act has carried a
 * prompt since before UI-28 shipped. `prompt:null` is not a shape the plane can
 * send for `attest` at all.
 *
 * IT WAS GREEN, AND ONLY BECAUSE THIS SUITE RENDERS NO ATTEST SURFACE. That is
 * exactly D-173's family and UI-30's finding in this file: a mock must answer
 * the wire CONTENT, not merely the wire SHAPE — a mock that is shape-correct and
 * content-false passes until the day some assertion here needs the field, and
 * then it fails somewhere that has nothing to do with the lie. `attestFence()`
 * answers "" on a null prompt and every entry point checks it, so a surface
 * booted against this mock would have offered the act with no fence, or removed
 * the control, and this suite would have called that the application's
 * behaviour.
 *
 * SO THE CONTENT COMES FROM THE PUBLICATION. `id`, `label` and `prompt` are read
 * off `CAPTURE_ACTS`, which is the array `op=affordances` actually maps over;
 * the four decorated fields are index.mjs's `decorateAct` tables and stay
 * literal here, because those are what a fixture is for. */
const PUBLISHED_ATTEST = CAPTURE_ACTS.find(a => a.id === "attest");
const AFFORDANCES = {
  target: null, catalog: [], vocabularies: { dispositions:["deferred","dismissed"] },
  capture_acts: [{ id: PUBLISHED_ATTEST.id, label: PUBLISHED_ATTEST.label,
                   weight:null, needs:"contribute", mode:"session", rung:"attested",
                   prompt: PUBLISHED_ATTEST.prompt ?? null }],
  detail: "pass target=<bundle id> for the acts available on that object right now",
};
ok("the act catalogue this suite hands the surface answers the wire CONTENT, not merely its shape",
   AFFORDANCES.capture_acts[0].label === PUBLISHED_ATTEST.label
   && AFFORDANCES.capture_acts[0].prompt === ATTEST_FENCE);
ok("and the record does publish a prompt for this act, so the null it used to answer was unsendable",
   typeof ATTEST_FENCE === "string" && ATTEST_FENCE.length > 200);

/* `op=queue` / `op=tasks` — boot lands on the queue, so they are asked. Empty
   feeds: this suite's subject is the door, not what is behind it. */
const QUEUE = { ok:true, items:[], cases:[], detail:"nothing is asking for anybody right now" };
const TASKS = { ok:true, tasks:[] };

/* ---- the mock, wrapping every answer the way the plane does --------------
   `mode.login` picks which login answer comes back; `mode.flatLogin` is arm
   (c)'s mutation and is reached only from the child process. */
function makePlane(mode){
  const CALLS = [];
  /* Arm (c) reaches this through the environment, because the mutation it makes
     is to the MOCK and the mock lives in this file — the child process is the
     only way to have the probe watch a differently-shaped answer. */
  const opts = { flatLogin: !!process.env.UI24_FLAT_LOGIN, ...(mode || {}) };
  async function fetch(u, init){
    const url = new URL(String(u), "https://plane.test");
    const op = url.searchParams.get("op");
    let body = null; try{ body = init && init.body ? JSON.parse(init.body) : null; }catch(_){}
    CALLS.push({ op, method:(init&&init.method)||"GET", body,
                 params:Object.fromEntries(url.searchParams.entries()),
                 token:url.searchParams.get("token") });
    const R = o => ({ ok:true, json:async()=>o });
    /* The envelope the Durable Object really sends, which index.mjs passes
       through: `{ok:true, result:<the store's own return>}`. */
    const W = r => R({ ok:true, result:r, store:"bio", tokenClass:null });

    if(op === "login"){
      /* store.mjs login(): a refusal is a VALUE inside the envelope, exactly as
         a success is. That is the whole shape D-173's sixth instance missed. */
      const inner = (body && body.password === GOOD_PW)
        ? { ok:true, role:"member:m_alice", token:TOKEN, expires: 1785000000000 }
        /* CORRECTED 2026-08-04 (UI-30): the refusal is the ONE code REC-41 left
           and the SENTENCE it now carries, both read out of `store.mjs` above
           rather than typed here. */
        : { ok:false, reason:REFUSAL_CODE, detail:REFUSAL_SENTENCE };
      /* NEGATIVE CONTROL (c): the mock answers the one shape the plane never
         sends. Reached only when this file is re-run by its own arm. */
      return opts.flatLogin ? R({ ok:true, ...inner }) : W(inner);
    }
    if(op === "publishedmanifest") return W(MANIFEST);
    if(op === "whoami")            return W(WHOAMI);
    if(op === "affordances")       return W(AFFORDANCES);
    if(op === "queue")             return W(QUEUE);
    if(op === "tasks")             return W(TASKS);
    if(op === "list")              return W([]);
    /* A control-plane refusal IS flat, legitimately, and is how an op this
       suite does not model announces itself rather than being answered with a
       fabricated success. */
    /* CORRECTED 2026-09-24 (UI-100), never exempted, and it was wrong on the same
       TWO counts as `preauth-vocabulary`'s fallthrough that UI-84 corrected: it
       composed `"unknown op " + op`, a sentence the plane has NEVER sent (`error` is
       "unknown op" byte-identical and the op travels in its own key), and it carried
       none of D-278's decoration. The point of the arm is unchanged — an op this
       suite does not model announces itself rather than being answered with a
       fabricated success — and it is now the announcement the wire makes. */
    return { ok:false, json:async()=>unknownOpWire(op) };
  }
  return { CALLS, fetch };
}

/* ---- a DOM stub with REAL class lists, because the gate and the two spaces
   are switched entirely through classes and a no-op classList would let every
   one of those assertions pass on nothing. ---- */
function makeCtx(plane){
  const els = new Map();
  function el(){
    const classes = new Set();
    const e = {
      classList: { add:(...c)=>c.forEach(x=>classes.add(x)),
                   remove:(...c)=>c.forEach(x=>classes.delete(x)),
                   toggle:(c,on)=>{ if(on===undefined){ classes.has(c)?classes.delete(c):classes.add(c); }
                                    else if(on) classes.add(c); else classes.delete(c); },
                   contains:c=>classes.has(c) },
      classes, style:{}, dataset:{}, value:"", _html:"", textContent:"", scrollTop:0,
      disabled:false, offsetHeight:120, addEventListener(){}, removeEventListener(){},
      querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(p,h){ e._html += h; },
      focus(){}, click(){}, remove(){}, setAttribute(){}, getAttribute:()=>null, onclick:null, oninput:null,
    };
    Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}});
    return e;
  }
  const doc = {
    querySelector:s=>{ if(!els.has(s)) els.set(s, el()); return els.get(s); },
    querySelectorAll:()=>[], addEventListener(){},
    documentElement:{ _attrs:{}, setAttribute(k,v){ this._attrs[k]=v; }, getAttribute(k){ return this._attrs[k]; } },
    getElementById:()=>el(), hidden:false, createElement:()=>el(), body:{ appendChild(){} },
  };
  const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
    Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto:webcrypto, Blob:class{},
    IntersectionObserver:undefined, setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1},
    clearTimeout(){}, requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
    document:doc, location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){} },
    localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
    fetch:async(u,init)=>plane.fetch(u,init) };
  ctx.globalThis = ctx; vm.createContext(ctx); ctx.__els = els; ctx.__doc = doc;
  return ctx;
}

const EXPORTS = ";globalThis.__PLANE=PLANE;globalThis.__signIn=signIn;globalThis.__boot=boot;"
  + "globalThis.__pubList=pubList;globalThis.__enterPublished=enterPublished;"
  + "globalThis.__actVocab=actVocab;globalThis.__captureAct=captureAct;";

function boot(source, plane){
  const ctx = makeCtx(plane);
  vm.runInContext((source || appScript()) + EXPORTS, ctx);
  return ctx;
}
const SRC = appScript();
/* One element, asked for THE WAY THE SURFACE ASKS FOR IT — through the
   document's own querySelector, so a selector the surface never touched is
   created here rather than read back as undefined and quietly asserted on. */
const E = (c, sel) => c.__doc.querySelector(sel);
const H = c => E(c, "#g-err")._html;

/* ============================================================
   (1) SIGN IN WITH THE CORRECT PASSWORD — the token comes off `result`
   ============================================================ */
const plane = makePlane();
const ctx = boot(SRC, plane);
E(ctx, "#g-handle").value = "member:m_alice";
E(ctx, "#g-pw").value = GOOD_PW;
await ctx.__signIn();

const loginCall = plane.CALLS.find(c=>c.op==="login");
ok("sign-in reaches the plane at op=login, as a POST carrying the authored role and password",
   !!loginCall && loginCall.method==="POST" && loginCall.body
   && loginCall.body.role==="member:m_alice" && loginCall.body.password===GOOD_PW);
ok("the untokened transport sends NO token — there is no session to send one from",
   !!loginCall && loginCall.token===null);

/* THE ASSERTION THE DEFECT LIVED UNDER. `l.token` off the envelope is
   `undefined` and the surface would carry on as if signed in. */
ok("THE TOKEN IS READ OFF `result`, not off the envelope", ctx.__PLANE.token === TOKEN);
ok("the surface marks this a SESSION (not a pasted machine token)", ctx.__PLANE.session === true);
ok("no error is shown to a member whose password was right",
   !E(ctx, "#g-err")._html || E(ctx, "#g-err").classList.contains("hidden"));

/* AND THE ONE THAT BITES: an undefined token is silently DROPPED by `rec`'s
   URLSearchParams spread, so every screen paints and nothing is authenticated. */
const tokened = plane.CALLS.filter(c=>c.op!=="login");
ok("boot() actually sent ops after sign-in", tokened.length > 0);
ok("EVERY op after sign-in carries the session token — the session lands where the transport expects it",
   tokened.length > 0 && tokened.every(c=>c.token===TOKEN));

/* ============================================================
   (2) THE SESSION LANDS WHERE `boot()` EXPECTS IT
   ============================================================
   `boot()` had never been run by any harness either. Every suite in this
   directory sets `PLANE.me` by hand and calls a renderer, which is why
   `loadActSource`'s missing caller survived until UI-22 read the source: a mock
   supplying what the application never did. This drives the real thing. */
ok("boot asks op=whoami", plane.CALLS.some(c=>c.op==="whoami"));
ok("and PLANE.me is the OP'S answer, opened out of the envelope",
   ctx.__PLANE.me && ctx.__PLANE.me.handle===HANDLE && ctx.__PLANE.me.session===true
   && Array.isArray(ctx.__PLANE.me.capabilities) && ctx.__PLANE.me.capabilities.includes("contribute"));
ok("boot loads the published act source BEFORE any screen paints (UI-22's no-caller defect, pinned)",
   plane.CALLS.some(c=>c.op==="affordances"));
ok("and the published vocabulary is readable from the surface afterwards",
   ctx.__actVocab("dispositions").length === 2);
ok("REC-38's capture_acts block arrives on the same read and is readable",
   !!ctx.__captureAct("attest") && ctx.__captureAct("attest").label.length > 0);
ok("the affordances read is ordered BEFORE the landing route's own ops",
   plane.CALLS.findIndex(c=>c.op==="affordances") < plane.CALLS.findIndex(c=>c.op==="queue"));

ok("the gate is closed once the session exists", E(ctx, "#gate").classList.contains("hidden"));
ok("the working space is opened", E(ctx, "#work").classList.contains("on"));
ok("the published space is closed", !E(ctx, "#pub").classList.contains("on"));
ok("the document root records which space the member is in",
   ctx.__doc.documentElement.getAttribute("data-space") === "working");
ok("the member's own handle is shown, from op=whoami and not from what they typed",
   E(ctx, "#m-handle")._html.includes(HANDLE));
ok("with no address in the bar the member lands on the queue", plane.CALLS.some(c=>c.op==="queue"));
ok("the queue screen painted", /The queue/.test(E(ctx, "#content")._html));

/* ============================================================
   (3) A REFUSED SIGN-IN — the plane's refusal, in the plane's words
   ============================================================ */
const planeB = makePlane();
const ctxB = boot(SRC, planeB);
E(ctxB, "#g-handle").value = "member:m_alice";
E(ctxB, "#g-pw").value = "not the password";
await ctxB.__signIn();

ok("a refused login writes NO token", !ctxB.__PLANE.token);
ok("a refused login marks NO session", ctxB.__PLANE.session !== true);
ok("a refused login NEVER enters boot() — no op is sent after it",
   planeB.CALLS.filter(c=>c.op!=="login").length === 0);
ok("the gate stays open", !E(ctxB, "#gate").classList.contains("hidden"));
/* CORRECTED 2026-08-04 (UI-30). This assertion used to pin the retired reason
   CODE, and it passed on a mock that answered a code the plane had stopped
   emitting. What the gate owes a member is the plane's SENTENCE, word for word
   and whole — `includes` over the entire sentence, so a truncation or a
   re-wording is a failure and not a near miss. */
ok("the member is shown the RECORD'S OWN SENTENCE, whole and word for word",
   REFUSAL_SENTENCE.length > 0 && H(ctxB).includes(REFUSAL_SENTENCE));
/* AND THE MACHINE CODE IS NOT WHAT A MEMBER READS. The plane sends it and the
   surface received it; rendering the sentence INSTEAD is a selection between two
   things the plane said, which is not a composition. `SIGN_IN_REFUSED` printed
   at a sign-in gate is vocabulary a member is being made to decode. */
ok("and NOT the machine code that rode with it — nothing here is left for a member to decode",
   !!REFUSAL_CODE && !H(ctxB).includes(REFUSAL_CODE));
ok("and the error is actually visible", !E(ctxB, "#g-err").classList.contains("hidden"));

/* THE COMPOSED-WORDING INSTRUMENT for this site (UI-13's arm (d)). The gate
   MINUS the plane's own words must contain no sentence that reads as a refusal
   — a correct reason code with a sentence this surface wrote is what DEC-8
   forbids and what a code-only assertion cannot see. */
const residue = h => PLANE_WORDS.reduce((acc,w)=>acc.split(w).join(" "), String(h));
const REFUSAL_PROSE =
  /(not correct|incorrect|try again|check your|wrong password|does not match|could not sign|couldn't sign|please )/i;
ok("no sentence at the gate that is not the record's own reads as a refusal",
   !REFUSAL_PROSE.test(residue(H(ctxB))));

/* A REFUSAL IS A VALUE INSIDE A SUCCESSFUL ENVELOPE — the half of D-173's sixth
   instance that is not about the token. Read off the envelope, `l.ok === false`
   never fires, and the member is shown the envelope rather than the reason. */
ok("the refusal was carried inside a 200 envelope and still refused the sign-in",
   planeB.CALLS.some(c=>c.op==="login") && !ctxB.__PLANE.session);
ok("the gate does not show the member the envelope's own ok:true",
   !/\bok\b\s*[:=]\s*true/i.test(H(ctxB)));

/* ============================================================
   (4) THE PUBLISHED LIST — public, uncredentialed, and wrapped
   ============================================================ */
const planeP = makePlane();
const ctxP = boot(SRC, planeP);
ctxP.__enterPublished();
await new Promise(r=>setTimeout(r,0));      // enterPublished fires pubList and does not await it

const manCall = planeP.CALLS.find(c=>c.op==="publishedmanifest");
ok("the published space reads op=publishedmanifest", !!manCall);
ok("IT CARRIES NO CREDENTIAL — the published record needs none, and asking for one would be a different product",
   !!manCall && manCall.token===null);
/* CORRECTED 2026-09-22 (UI-77), never exempted: this read `every(c => c.op === "publishedmanifest")`. The
   published space's header now reads `op=instancegroup` — PUBLIC since REC-163 (IC-174), the slug and nothing
   else — to show whose record this is instead of a literal group name (Publication §7 point 1). The old
   assertion was right that nothing of the WORKING record may be touched; it was wrong to equate that with one
   op, because the group's slug is a public fact of the published record's own header. What it protects is
   kept: every op reached is one of the two public reads, and none carries a credential. */
ok("no other op is reached from the published space — nothing of the working record is touched (the case list and the header's public group read, credential-free, only)",
   planeP.CALLS.every(c=>(c.op==="publishedmanifest" || c.op==="instancegroup") && c.token===null));

const pl = E(ctxP, "#pl")._html;
ok("every ratified case file in the manifest is listed",
   MANIFEST.published.every(p=>pl.includes(p.bundle_id)));
ok("each row carries the case's own title from the projection",
   pl.includes("Why did the sewer contract skip competitive bid?"));
ok("each row states the ratification date and the bundle hash — the two facts a stranger verifies against",
   pl.includes("2026-07-14") && pl.includes("c".repeat(16)));
ok("the list is not the empty statement when the record HAS published something",
   !/has not published any case files/i.test(pl));
ok("the published space is the one that is open", E(ctxP, "#pub").classList.contains("on"));
ok("and the document root says so",
   ctxP.__doc.documentElement.getAttribute("data-space") === "published");

/* THE EMPTY CASE, which is a CLAIM about the group and must be stated as one.

   CORRECTED 2026-09-10 (M0-24), AND NOT EXEMPTED — this is an assertion the
   corrected fixture MOVED, and it moved because the old fixture could not
   represent the state the assertion names. It emptied `published[]` alone, which
   was a complete description of "has published nothing" only while the fixture
   had no `cases[]`: `pubList` builds a row per CASE as well as per loose finding,
   so with the manifest's case left standing the page would have drawn a case file
   over an empty published list and the empty statement would never have been
   reached. The assertion would have gone red for a fixture that got MORE
   faithful, which is the shape that makes a suite argue for its own blind spot.
   A group that has published nothing has published no cases either, so all three
   arrays are emptied and restored together. */
{
  const planeE = makePlane();
  const saved = { published: MANIFEST.published, cases: MANIFEST.cases, caseMembers: MANIFEST.caseMembers };
  MANIFEST.published = []; MANIFEST.cases = []; MANIFEST.caseMembers = [];
  const ctxE = boot(SRC, planeE);
  ctxE.__enterPublished();
  await new Promise(r=>setTimeout(r,0));
  const ple = E(ctxE, "#pl")._html;
  MANIFEST.published = saved.published; MANIFEST.cases = saved.cases; MANIFEST.caseMembers = saved.caseMembers;
  ok("a group that has published nothing says so, and says a stranger could verify one if it had",
     /has not published any case files/i.test(ple) && /verify/i.test(ple));
  /* The restore is asserted rather than assumed: a fixture mutated for one arm
     and silently left mutated would make every assertion after it measure a
     different manifest, and this block sits BEFORE the ones that read the
     corrected shape. */
  ok("and the manifest fixture is restored whole for the assertions that follow",
     MANIFEST.published.length === 2 && MANIFEST.cases.length === 1 && MANIFEST.caseMembers.length === 1);
}

/* ============================================================
   (4b) THE FIXTURE'S OWN SHAPE, READ OUT OF THE PLANE — M0-24, 2026-09-10
   ============================================================
   WHY THIS BLOCK EXISTS AT ALL, and it is M0-23's measured finding rather than
   caution. M0-23 corrected a `caseMembers[]` fixture to the wire shape in another
   suite, ran its own negative control — deleted the corrected column again — and
   the suite came back GREEN. The census RENDERED the defect and no assertion READ
   it, so by the item's own criterion the correction was decoration. Correcting a
   fixture and asserting nothing about it buys a cleaner census line and nothing
   else, because the next hand to widen or narrow it meets no resistance.

   So the corrected shape is PINNED, and the pin is DERIVED, never a list. The
   nine columns are read out of `publishedManifest()`'s own `SELECT` in
   `store.mjs`, the same text `check-mock-envelope.mjs`'s arm C reads and the same
   way this file already reads the refusal sentence. A hand copy of the column
   list would agree with the plane at zero cost, which is the very defect one
   layer up that this suite was written to stop (UI-30, REC-43). Add a tenth
   column to that SELECT and this fails the same day; the census would have
   NAMED it and nothing would have failed.

   IT PINS `published[]` ONLY, DELIBERATELY. `cases[]` here is legitimately
   narrower than the wire — three columns no surface in `app.html` reads, measured
   by M0-23's census — and a pin over it would be a fence tighter than its rule,
   forcing a fixture to carry columns for their own sake. The census NAMES that
   gap every run, which is the disposition an open question gets in this estate.
   Both halves are this item's controls: the pin must BITE on `published[]`, and
   it must not reach `cases[]`. */
{
  /* The method body, then the `published:` query inside it. Brace-matched rather
     than line-counted so it cannot silently read half a method, and the comments
     are stripped first because the plane documents these queries in block
     comments that quote column names IN BACKTICKS — the exact trap arm C's own
     first run fell into and recorded. */
  const mm = /^ {2}publishedManifest\s*\(\s*\)\s*\{/m.exec(STORE_SRC);
  ok("store.mjs's publishedManifest() is readable from here — the fixture has a source to be pinned against", !!mm);
  let wireCols = [];
  if(mm){
    let i = STORE_SRC.indexOf("{", mm.index), depth = 0, body = "";
    for(let j = i; j < STORE_SRC.length; j++){
      if(STORE_SRC[j] === "{") depth++;
      else if(STORE_SRC[j] === "}"){ depth--; if(depth === 0){ body = STORE_SRC.slice(i, j + 1); break; } }
    }
    const at = body.indexOf("published: this.#rows(");
    const rest = at < 0 ? "" : body.slice(at + "published: this.#rows(".length)
      .replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");
    const tick = rest.indexOf("`"), end = tick < 0 ? -1 : rest.indexOf("`", tick + 1);
    const sql = end < 0 ? "" : rest.slice(tick + 1, end);
    const sel = /SELECT\s+([\s\S]*?)\s+FROM\s/i.exec(sql);
    wireCols = !sel ? [] : sel[1].split(",").map(c => {
      const t = c.trim().replace(/\s+/g, " ");
      const as = / AS ([A-Za-z0-9_]+)$/i.exec(t);
      if(as) return as[1];
      const bare = t.split(".").pop();
      return /^[A-Za-z0-9_]+$/.test(bare) ? bare : null;
    }).filter(Boolean);
  }
  /* THE EXTRACTION IS ASSERTED BEFORE IT IS USED. An extraction that silently
     yields [] makes the set comparison below trivially true in BOTH directions —
     no column missing and no column extra over an empty wire — which is this
     project's "headline totality assertion over an empty corpus", shipped three
     times. The floor is low on purpose (it is a guard against nothing, not a
     restatement of the count) and the two named columns are the ones the
     published surface demonstrably joins and renders on, so a SELECT that lost
     either would be a different query. */
  ok("the wire's published[] columns were actually extracted — not an empty list making every comparison below free",
     wireCols.length >= 5 && wireCols.includes("bundle_id") && wireCols.includes("bundle_sha"));
  ok("the fixture is not empty — a shape census over zero rows reports a clean fixture for nothing",
     MANIFEST.published.length > 0);

  const wire = new Set(wireCols);
  const missing = new Map(), extra = new Map();
  for(const r of MANIFEST.published){
    const keys = Object.keys(r);
    const m = wireCols.filter(c => !keys.includes(c));
    const x = keys.filter(k => !wire.has(k));
    if(m.length) missing.set(r.bundle_id, m);
    if(x.length) extra.set(r.bundle_id, x);
  }
  ok(`every published[] row carries EVERY column the plane selects (${wireCols.length} of them) — a fixture `
     + `narrower than the wire cannot assert about what it dropped` + (missing.size ? ` · MISSING ${[...missing].map(([b,c])=>b+": "+c.join("/")).join(" · ")}` : ""),
     missing.size === 0);
  ok(`and NO published[] row answers a key the plane's SELECT does not carry — a fixture wider than the wire `
     + `invents a column an assertion could be written against forever`
     + (extra.size ? ` · PHANTOM ${[...extra].map(([b,c])=>b+": "+c.join("/")).join(" · ")}` : ""),
     extra.size === 0);
  /* THE TWO PHANTOMS BY NAME, because the general rule above would also be
     satisfied by a fixture that never had them, and this item's subject is that
     THESE TWO were there. They are `cases[]`'s columns and a bundle row has never
     had either. */
  ok("`manifest` and `manifest_sha` are gone from published[] specifically — they are cases[] columns and a "
     + "ratified finding's row has never carried them",
     MANIFEST.published.every(r => !("manifest" in r) && !("manifest_sha" in r)));
  ok("and they are on cases[], which is the row the plane's SELECT actually takes them from",
     MANIFEST.cases.length > 0 && MANIFEST.cases.every(c => "manifest" in c && "manifest_sha" in c));
  /* THE OVER-STRICTNESS ARM, ASSERTED RATHER THAN PROMISED, AND ITS FIRST DRAFT
     WAS THE DEFECT IT EXISTS TO PREVENT — recorded rather than smoothed, because
     it was found by ARMING the control and not by reading the code. That draft
     asserted `cases[]` does NOT carry `bias_acknowledgement`, `bar` or
     `project_id`, which reads as "the narrowness is deliberate" and IS a fence
     tighter than its rule: the day CASE-5's bar gets a surface, the honest
     widening of this fixture would have gone RED against a suite claiming to
     defend against exactly that. Correct work in a spelling the author did not
     anticipate must PASS.
     What it says instead is the property that is actually load-bearing: this
     fixture carries every `cases[]` column the published surface DEMONSTRABLY
     reads. The three it omits are free in both directions — the census NAMES
     them every run, which is the disposition an open question gets here, and a
     later hand may add them without arguing with this file. */
  ok("cases[] carries every column pubList actually reads, and the three with no measured reader are free in "
     + "BOTH directions — named by the census, mandated by nothing here",
     MANIFEST.cases.every(c => ["case_id","edition","scope","ratified_at","manifest_sha","manifest"]
       .every(k => k in c)));
}

/* ============================================================
   (4c) A LOOSE RATIFIED FINDING THAT HAS A PAIR — REC-49's branch, DRIVEN
   ============================================================
   THE STATE THE OLD FIXTURE COULD NOT REACH. UI-29 wrote, honestly for the shape
   it had, that a ratified bundle in no case has "no case identity, no scope
   statement and no completeness assertion" and no pair — and REC-49 corrected the
   fourth of those, because a frozen pair belongs to a FINDING and a finding can
   perfectly well carry one while belonging to no case. Until this item nothing in
   this repository drove that branch from a fixture that could hold a pair: with
   `strength` absent from every row, `pubPair()` returned null for all of them and
   the page took the no-pair sentence every time. Green, and blind. */
{
  const LOOSE = "INQ-2026-0004-sewer";      // in no case, and the plane holds its pair
  const INCASE = "INQ-2026-0011-transfer";  // rostered, and the plane holds NO pair for it

  ok("the loose finding is genuinely loose — no roster row points at it, by the pin or by the old key",
     MANIFEST.caseMembers.every(m => m.version_sha !== "c".repeat(64) && m.bundle_id !== LOOSE));
  ok("it is drawn as a ratified bundle that is in no case", pl.includes(`data-notacase="${LOOSE}"`));
  /* THE PAIR ITSELF, and it is read as a PAIR: two axis marks, each naming the
     finding it belongs to. DEC-44's rule is structural on this surface — a mark
     that cannot name an owner is a mark about nothing — so asserting the owner is
     asserting the rule, not the markup. */
  ok("REC-49: and its own frozen pair is ON it — the loose row carries a strength mark for the finding",
     pl.includes(`class="pub-axisrow" data-finding="${LOOSE}"`));
  ok("BOTH axes, because a pair is both or it is not a pair (DEC-18/D-160) — and the UNRATED half says so "
     + "in words rather than being drawn as a weak grade",
     new RegExp(`data-axis="capture" data-finding="${LOOSE}"`).test(pl)
     && new RegExp(`data-axis="connection" data-finding="${LOOSE}"`).test(pl)
     && /Links UNRATED/.test(pl));
  ok("and the no-pair sentence is NOT said about it — that sentence is a claim about the record and would "
     + "be false here",
     !pl.includes(`data-nopair="${LOOSE}"`));
  /* THE CONTRAST, on the same page, so neither assertion above passes for the
     reason that everything renders a pair. `strength: null` is what the plane
     answers for a ratified finding it holds no pair for. */
  ok("the CONTRAST: the rostered finding the plane holds no pair for gets the no-pair sentence, so the two "
     + "assertions above are not passing over a page that marks everything",
     pl.includes(`data-nopair="${INCASE}"`) && !pl.includes(`class="pub-axisrow" data-finding="${INCASE}"`));
  /* AND THE CASE HALF, which is what makes the loose half mean anything: the
     roster row joins to its finding THROUGH ITS PIN, across a case edition (1)
     that diverges from the finding's own (2). UI-56's correction, now
     representable in this suite's fixture. */
  ok("the case is drawn, and the plane's own recorded fact decides it is finished — `manifest_sha` is the "
     + "edition's completion, never a count of the roster (REC-49)",
     pl.includes(`data-caserow="${MANIFEST.cases[0].case_id}"`) && pl.includes('data-caseedition="complete"'));
  ok("UI-56: its member joined through its PIN across DIVERGED editions — the case is edition 1 and the "
     + "finding is edition 2, so an edition-to-edition join would have dropped it and drawn it as awaiting",
     Number(MANIFEST.caseMembers[0].edition) !== Number(MANIFEST.published[1].edition)
     && pl.includes(`data-findingsec="${INCASE}"`)
     && !new RegExp(`data-member="awaiting" data-findingsec="${INCASE}"`).test(pl));
  ok("and it is NOT also listed as belonging to no case — the same finding twice on one page, contradicting "
     + "itself, was UI-56's third false statement",
     !pl.includes(`data-notacase="${INCASE}"`));
  /* CORRECTED 2026-09-10 AT THE CASE-6 MERGE (CONDUCT), NEVER EXEMPTED. The two
     assertions here were written by M0-24 against the pre-arc surface: "DEC-17
     as amended — the bar is the FINDING's, frozen into its own bytes ... a
     case-level bar would be a claim the record does not make." That was RIGHT
     when written and is WRONG under DEC-72 clause 2, which CASE-6 landed in the
     same integration: bars never attach to findings — the bar is the CASE's,
     the publishing project's property, drawn ONCE — and CASE-5b removed
     `required_strength` from finding bytes entirely. Two items green alone and
     red on the pair; the ratchet fired correctly and the assertion was the
     superseded half. What survives per finding is STRENGTH, and a REFERENCE to
     the case's one standard — never a second copy of it. */
  ok("DEC-72 clause 2: the case's DECLARED bar is drawn ONCE, as the case's own, from the plane's two values",
     new RegExp(`data-casebar="declared" data-case="${CASE_ID}"[\\s\\S]*?Documents ${BAR_DECLARED.capture} &middot; Links ${BAR_DECLARED.connection}`).test(pl));
  ok("and whose standard it is travels WITH it — the publishing project the plane serves beside the bar, "
     + "because a standard with no publisher named is a requirement nobody asserted",
     new RegExp(`data-casebar="declared"[\\s\\S]{0,600}?PRJ-2026-0007`).test(pl));
  ok("and the bar appears ONCE — no finding section carries a bar of its own (the per-member `bar:` block "
     + "is GONE, CASE-5b's deletion reaching this surface; the per-finding REFERENCE lives on the finding "
     + "page, not this index), while the finding's own STRENGTH still renders per finding",
     (pl.match(/data-casebar="declared"/g) || []).length === 1
     && !pl.includes("bar: Documents")
     && !new RegExp(`data-findingsec="${INCASE}"[\\s\\S]{0,400}?data-casebar="`).test(pl));
}

/* ============================================================
   (5) THE WIRE MAP THIS SUITE RELIES ON, ASSERTED RATHER THAN ASSUMED
   ============================================================
   Both ops are WRAPPED, which is the guard's default and is why nothing was
   added to its FLAT list. If either grows a flattening handler in
   `index.mjs`, this fails here instead of drifting quietly. */
{
  const guard = fs.readFileSync(new URL("../check-mock-envelope.mjs", import.meta.url), "utf8");
  const flatBlock = /const FLAT_OPS = new Map\(Object\.entries\(\{([\s\S]*?)\}\)\);/.exec(guard);
  ok("the guard's FLAT list is readable from here", !!flatBlock);
  if(flatBlock){
    ok("op=login is not on the guard's FLAT list — the plane hands the DO's answer back verbatim",
       !/^\s*login\s*:/m.test(flatBlock[1]));
    ok("op=publishedmanifest is not on it either — index.mjs re-wraps it explicitly",
       !/^\s*publishedmanifest\s*:/m.test(flatBlock[1]));
  }
  /* CORRECTED 2026-08-04 at the UI-18/UI-24 merge: UI-18 added `apiQ` (the
   published region's untokened seam) to the guard's set. The property under
   test is unchanged — the untokened transports are named seams. */
  ok("the guard names `apiR` and `apiQ` as the seams for the untokened transport",
     /API_SEAMS = new Set\(\["api", "apiR", "apiQ"\]\)/.test(guard));
}

/* ============================================================
   (6) THE ARM-B COVERAGE LINE, MEASURED
   ============================================================
   UI-24's accepts-when is that the envelope guard's arm B now covers both ops.
   Arm B is only as wide as the harness, so "covered" means: when this suite runs
   under the guard's probe, the probe SEES both ops and sees them wrapped. That
   is measured here by re-running this file under `test/envelope-probe.mjs` — the
   guard's own instrument, loaded the guard's own way — and reading its output,
   rather than by reading a number off a log. */
function probeSelf(env){
  const probe = new URL("./envelope-probe.mjs", import.meta.url).pathname;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ui24-probe-"));
  const out = path.join(dir, "probe.json");
  let ran = true;
  try{
    execFileSync("node", ["--import", "file://" + probe, SELF],
      { stdio:"pipe", env:{ ...process.env, UI_ENVELOPE_PROBE_OUT: out, UI24_PROBE_CHILD:"1", ...(env||{}) } });
  }catch(_){ ran = false; }
  let data = { calls:0, ops:[] };
  try{ data = JSON.parse(fs.readFileSync(out, "utf8")); }catch(_){}
  try{ fs.rmSync(dir, { recursive:true, force:true }); }catch(_){}
  return { ran, data };
}

if(!CHILD){
  const { ran, data } = probeSelf();
  const row = id => (data.ops||[]).find(o=>o.op===id) || null;
  ok("COVERAGE: this suite runs clean under the guard's own probe", ran);
  ok("COVERAGE: the probe observed op=login — the first harness that has ever reached it",
     !!row("login") && (row("login").wrapped + row("login").flat) > 0);
  ok("COVERAGE: the probe observed op=publishedmanifest — likewise",
     !!row("publishedmanifest") && (row("publishedmanifest").wrapped + row("publishedmanifest").flat) > 0);
  ok("COVERAGE: both are answered WRAPPED, which is what arm B judges them against",
     !!row("login") && row("login").flat === 0
     && !!row("publishedmanifest") && row("publishedmanifest").flat === 0);
  /* `boot()` brings whoami with it, which no harness had reached either — the
     rail, the credential sentence and every capability-shaped control in this
     file were only ever exercised against a hand-set `PLANE.me`. */
  ok("COVERAGE: op=whoami is reached too, because boot() is finally driven",
     !!row("whoami") && row("whoami").flat === 0);
}

/* ============================================================
   NEGATIVE CONTROLS — run, not described
   ============================================================ */
if(!CHILD){
  /* (a) BREAK THE TOKEN READ. `apiR` stops opening the envelope, which is
     D-173's sixth instance exactly as it shipped. THE SPLICE IS SCOPED TO
     `apiR`'S OWN BODY: `recR` and `recPostR` carry a byte-identical return and
     both come EARLIER in the file, so a plain replace mutates the wrong seam
     and the arm reports green having tested nothing (UI-22's instrument
     finding, applied). */
  /* CORRECTED 2026-08-04 at the UI-18/UI-24 merge: pubList moved from `apiR`
     to UI-18's `apiQ`, so the arm now breaks BOTH untokened seams — each splice
     scoped to its own body per UI-22's instrument finding — or the published-
     list half of the demonstrated harm silently stops being demonstrated. */
  const breakSeam = (src, decl) => {
    const h = src.indexOf(decl);
    if (h < 0) return src;
    const cut = src.indexOf("return (j && j.result !== undefined)", h);
    const tl = src.indexOf("}", cut);
    if (cut < 0 || tl <= h) return src;
    return src.slice(0, h)
      + src.slice(h, tl).replace("return (j && j.result !== undefined) ? j.result : j;", "return j;")
      + src.slice(tl);
  };
  /* CORRECTED 2026-09-23 (UI-68), never exempted: `apiQ` gained a third argument (the recipient's comment body on
     a review copy), so the old anchor `apiQ(op, params){` matched nothing and `breakSeam` returned the source
     UNCHANGED for that seam — the arm went on breaking `apiR` alone, and the published-list half of the harm
     stopped being demonstrated, which the three assertions below named. The anchor is the seam's new signature. */
  const BROKEN = breakSeam(breakSeam(SRC, "async function apiR(op, body){"), "async function apiQ(op, params, body){");
  ok("NEG-CONTROL (a): the mutation actually changed the source", BROKEN !== SRC);
  /* CORRECTED 2026-08-04 with the widened splice: TWO envelope-opens go (apiR
     and apiQ), and recR/recPostR's byte-identical returns stay — the scoping
     property is unchanged, the count moved from -1 to -2. */
  ok("NEG-CONTROL (a): and it changed apiR and apiQ, not the two rec seams above them",
     BROKEN.includes("async function apiR(op, body){\n  const j = await api(op, body);\n  return j;\n}")
     && (BROKEN.match(/return \(j && j\.result !== undefined\) \? j\.result : j;/g)||[]).length
        === (SRC.match(/return \(j && j\.result !== undefined\) \? j\.result : j;/g)||[]).length - 2);
  {
    const p = makePlane();
    const c = boot(BROKEN, p);
    E(c, "#g-handle").value = "member:m_alice";
    E(c, "#g-pw").value = GOOD_PW;
    await c.__signIn();
    ok("NEG-CONTROL (a): with the envelope unopened, the correct password reads NO token",
       c.__PLANE.token !== TOKEN);
    ok("NEG-CONTROL (a): so no op after sign-in is authenticated — which is what shipped",
       p.CALLS.filter(x=>x.op!=="login").every(x=>x.token===null));
    /* THE OTHER HALF: a refusal read off the envelope has `ok:true`, so the
       gate lets a WRONG password through instead of refusing it. */
    const p2 = makePlane();
    const c2 = boot(BROKEN, p2);
    E(c2, "#g-handle").value = "member:m_alice";
    E(c2, "#g-pw").value = "not the password";
    await c2.__signIn();
    ok("NEG-CONTROL (a): and a WRONG password no longer meets the record's own sentence",
       !H(c2).includes(REFUSAL_SENTENCE));
    /* And the published list does not render the case files — the honest-looking
       blank screen D-173 is named for.
       **CORRECTED 2026-08-04 BY UI-37, AND THE OLD ASSERTION IS WORTH KNOWING
       ABOUT BECAUSE IT MEASURED A SECOND DEFECT WITHOUT ANYBODY NOTICING.** As
       written, this arm required the broken surface to render "This group has
       not published any case files yet" — and it passed, for years of items,
       which means D-173's "honest-looking blank screen" WAS LITERALLY THAT
       SENTENCE. The blank screen and D-195's false negative are the same
       rendering: `pubList` read `(r && r.published) || []`, so an answer it
       could not open and an answer that said nothing were one thing, and the
       page filled the gap with a claim about the whole published record.
       UI-37 closed that at the site, so the old assertion now describes the
       BUG rather than the behaviour and would have gone red for the fix. It is
       CORRECTED rather than exempted (CLAUDE.md), and it is corrected to assert
       BOTH halves, because dropping either would lose a demonstration:
         (i) the harm D-173 names is UNCHANGED — the two case files in the
             manifest still do not reach the reader when the envelope is not
             opened, so this control still bites;
         (ii) and the surface no longer LIES about it. A broken seam now
             produces a page that says it cannot say what this group published,
             which is the honest form of the same failure. */
    const p3 = makePlane();
    const c3 = boot(BROKEN, p3);
    c3.__enterPublished();
    await new Promise(r=>setTimeout(r,0));
    const pl3 = E(c3, "#pl")._html;
    ok("NEG-CONTROL (a): and the published list renders NEITHER case file over a manifest that has two — "
       + "the harm D-173 names, unchanged",
       MANIFEST.published.every(p => !pl3.includes(p.bundle_id)));
    ok("NEG-CONTROL (a): CORRECTED 2026-08-04 (UI-37, D-195) — and it no longer says the group has "
       + "published nothing. That sentence WAS D-173's honest-looking blank screen, and it was a claim "
       + "about the whole record made out of an answer this surface could not read; a broken seam now "
       + "says it cannot say",
       !/has not published any case files/i.test(pl3)
       && /cannot say what this group has published/.test(pl3));
  }
  ok("NEG-CONTROL (a) contrast: the intact surface signed in, authenticated every op, and listed both case files",
     ctx.__PLANE.token===TOKEN && tokened.every(c=>c.token===TOKEN)
     && MANIFEST.published.every(p=>pl.includes(p.bundle_id)));

  /* (b) THE COMPOSED-WORDING INSTRUMENT: the gate words the refusal itself.
     RETARGETED 2026-08-04 (UI-30) TO THE NEW SHAPE, and the retargeting made
     the arm sharper rather than merely current. It used to print an invented
     sentence and nothing else; now it prints the plane's REASON CODE — which is
     correct, which is what the plane sent, and which is what the gate rendered
     for the whole of this suite's previous life — and then adds a sentence of
     its own. So the mutation is a surface that looks MORE faithful than the one
     that shipped, and every code-shaped assertion in this file is green against
     it. Only subtracting what the plane said and reading the remainder can see
     it. That is the whole point of keeping this arm through the change: if
     `app.html` ever starts composing wording of its own, this fires.
     ANCHOR CORRECTED 2026-09-23 BY UI-73, never exempted: `signIn()`'s refusal
     line now hands `teach` the plane's canned `translation` beside its `detail`
     (DEC-49, chosen by `refusalWords`), so the old anchor — the `detail`-only
     line — matched nothing and this arm stopped arming; its own first assertion
     ("the mutation actually changed the source") is what said so. The mutation
     is unchanged: it still replaces the whole refusal line with composed words. */
  {
    const src = SRC.replace(
      'if(!l || l.ok===false || !l.token){ teach($("#g-err"), l && (l.translation || l.detail) ? { translation:l.translation, detail:l.detail } : (l||{})); return; }',
      'if(!l || l.ok===false || !l.token){ const e=$("#g-err"); e.innerHTML=esc(String((l&&l.reason)||"")) + " — that password is not correct. Try again, or ask an administrator to reset it."; e.classList.remove("hidden"); return; }');
    ok("NEG-CONTROL (b): the mutation actually changed the source", src !== SRC);
    const p = makePlane();
    const c = boot(src, p);
    E(c, "#g-handle").value = "member:m_alice";
    E(c, "#g-pw").value = "not the password";
    await c.__signIn();
    ok("NEG-CONTROL (b): the sign-in is still REFUSED — a code-only suite is green here",
       !c.__PLANE.token && c.__PLANE.session !== true);
    ok("NEG-CONTROL (b): and the plane's own CODE is still on the page, so a suite pinning the code is green too",
       H(c).includes(REFUSAL_CODE));
    ok("NEG-CONTROL (b): but the record's own SENTENCE is GONE", !H(c).includes(REFUSAL_SENTENCE));
    ok("NEG-CONTROL (b): and the residue scan names the SURFACE as the author of what stands there",
       REFUSAL_PROSE.test(residue(H(c))));
  }
  ok("NEG-CONTROL (b) contrast: the intact gate renders the record's own sentence and no invented one",
     H(ctxB).includes(REFUSAL_SENTENCE) && !REFUSAL_PROSE.test(residue(H(ctxB))));

  /* (c) UNWRAP THE LOGIN MOCK — the guard's own arm, measured at the probe.
     A mock that answers `op=login` flat is exactly the input
     `check-mock-envelope.mjs` fails on, because the wire map says WRAPPED. */
  {
    const { data } = probeSelf({ UI24_FLAT_LOGIN:"1" });
    const row = (data.ops||[]).find(o=>o.op==="login") || null;
    ok("NEG-CONTROL (c): with the mock unwrapped the probe records op=login as FLAT",
       !!row && row.flat > 0);
    ok("NEG-CONTROL (c): and it records the top-level keys the guard names in its failure",
       !!row && Array.isArray(row.sampleKeys) && row.sampleKeys.includes("token") && !row.sampleKeys.includes("result"));
  }
}

if(fails.length){ console.error(`auth-surface: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`auth-surface: ${n} assertions, all green — sign-in through the wrapped shape · the token off \`result\` · every op after it authenticated · boot() driven for the first time · the refusal SENTENCE read out of store.mjs and rendered whole, with the code no member has to decode · no retired login code anywhere under civicos-ui/ · pubList uncredentialed against the published projection · the manifest fixture at the plane's own nine published[] columns, PINNED against store.mjs's SELECT rather than a list, with the two phantom keys gone and cases[] widened to the wire at the CASE-6 merge (the bar became a read column) · a LOOSE ratified finding WITH its frozen pair driven (REC-49) against a rostered one with none · arm-B coverage MEASURED at the probe; negative controls RUN (a) the token read broken (b) right code + invented sentence (c) the login mock unwrapped (d) a retired code restored on disk (g) a phantom key restored (h) over-strictness: cases[] narrow and NAMED, wide and GREEN (i) the restored bar put back to null`);
