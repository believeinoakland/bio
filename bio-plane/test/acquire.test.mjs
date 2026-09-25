/* NEGATIVE CONTROL: (run 2026-07-31) overclaim the capture grade in the acquire path (index.mjs: a direct fetch stamps "A" instead of "B") -> 1 assertion fails (the load-bearing "acquire says B, a Worker cannot produce a grade-A capture"); restored, 72 pass. (run 2026-08-04, REC-48) publish op=acquire's `note:` as a hand-typed literal copy instead of the composed `ACQUIRE_GRADE_NOTE` -> THIS SUITE STAYS GREEN and only hygiene.test.mjs's structural sweep fails; then move the enforced ceiling to C and 5 assertions here fail naming the note that still says B. The three arms are below IN THIS SAME DECLARATION, each RUN.
   SHAPE RESTORED BY M0-9 (2026-08-04), and it is the point rather than tidying. REC-48 wrote the arms as a continuation of this block, `coverage.mjs` then reported BOTH this suite and hygiene.test.mjs as declaring NO CONTROL — its detector could not read past the marker's own line — and the arms were moved into a second comment the register never saw, so the register quoted a summary while the evidence sat outside it. The detector now reads the whole block (scripts/control-register.mjs), which is why the arms are back where they belong: a declaration ends at its comment's close or at a blank line, so keep this paragraph unbroken and it stays one declaration.
   (run 2026-08-04, M0-9) hide this suite's declaration entirely — replace every control marker in this file -> `node scripts/coverage.mjs --strict` run DIRECTLY with `$?` read unpiped EXITS 1, reports 97 of 98 and NAMES acquire.test.mjs under "No declared control", and the register's arm total falls 246 -> 241, exactly the five arms below. Restored byte-identical, sha256 e065c8e0… before and after. Three more arms on the register itself are recorded in hygiene.test.mjs, where the detector's self-test lives.
   REC-48's THREE ARMS (run 2026-08-04, rec48-agent), each broken ALONE and every file restored BYTE-IDENTICALLY with sha256 compared before and after (src/index.mjs 16cf4e2f..., checks/bio-checks.mjs d8da7b9d...); whole = acquire 79, hygiene 369, earnedbasis 54; ALL THREE RE-RUN against the final files, so the counts name the files that are on disk.
   (a) THE ITEM'S OWN — PUBLISH THE NOTE AS A HAND-TYPED LITERAL COPY. Replace `note: ACQUIRE_GRADE_NOTE,` in src/index.mjs with the same sentence typed out ("Grade B: bytes as fetched … Co-attestation raises B toward evidentiary weight.") -> THIS SUITE STAYS 79 PASS, 0 FAIL. Every behavioural pin — the wire equality, the composer equality, both interpolation pins, the not-the-attest-fence pin — is satisfied by a copy that agrees today at zero cost. Only hygiene.test.mjs moves: 367/2, both detectors naming `index.mjs:1822 "Grade B"` and `"Grade A"`. REC-35's finding restated a fifth time and REC-43's measurement reproduced on a second sentence: THE STRUCTURAL PIN IS THE WHOLE OF THIS CONTROL, and a suite that owns the sentence cannot be the suite that catches the copy.
   (b) THE SAME LITERAL, AND THEN MOVE THE RULE — keep the literal and set `EARNED_CAPTURE_CEILING = 'C'` in checks/bio-checks.mjs -> 74 pass, 5 FAIL, and they name the note that still says B in both directions: the letter claimed is no longer the letter the gate enforces, the ceiling is not interpolated, the derived unreachable grade is not named, the wire is not the composition, and it is not the published constant. THIS IS WHAT THE COPY COSTS — a caller is told the capture it just made is Grade B while the gate refuses any leg above C, the record overclaiming on a doctrine sentence, which CLAUDE.md ranks worse than a missing feature. hygiene 367/2 and earnedbasis 50/4 alongside.
   (c) THE COMPOSED NOTE UNDER THE SAME MOVED RULE -> 78 pass, 1 FAIL, and the difference between (b) and (c) is the whole item: the note now says Grade C and no caller is told a grade the gate will not accept. The ONE remaining failure is a REAL FINDING and not this item's doing — "the letter it claims is the one the gate ENFORCES" fires on `src/index.mjs`'s `grade: via === "archive.org" ? "C" : "B"`, the STAMPED grade, which is a value copy of the ceiling that REC-48 deliberately did not close because its other arm (the archive-sourced letter) has no exported constant to compose from and minting one is a doctrine act. Routed to CONDUCT; the assertion is left in so the gap is MEASURED rather than remembered.
   D-469's TWO ARMS (run 2026-09-24, worker D-469), each broken ALONE in src/index.mjs and restored by cp from a per-arm pristine copy, sha256 2be01329... before and after and cmp identical; whole = 87 pass. (a) THE ITEM'S OWN — move the head() back after flush(): replace `existed = partHeldBefore[0];` with the old `existed = !!(await env.CAPTURES.head(`${storeName}/captures/${sha}`));` -> 86 pass, 1 FAIL, "a first acquire says the store did not already hold the bytes" (want false, got true): the head finds the object the same call just wrote, the overclaim M-123 measured live. The idempotent pin and the multi-part pin stay green, as declared. (b) OVER-CORRECTION — hard-code `existed = false;` -> 86 pass, 1 FAIL, "acquiring the same document again is idempotent" (want true, got false): the first-acquire pin alone would pass a field that never says true, so the two pins are one control and neither may be dropped.
   D-476's FIVE ARMS PLUS D-469's TWO RE-RUN (run 2026-09-24, worker D-476, drivers `nc-d476.py` and `nc-d469-rerun.py` in the session scratchpad), each arm ALONE against the REAL src/index.mjs and src/store.mjs with every other defence held open, each anchor asserted to match EXACTLY ONCE (an arm that did not arm is a finding), and every restore by cp from a uniquely-named per-arm pristine copy verified by sha256 AND cmp with the byte count printed and a floor guarded -- index.mjs 810,235 B sha256 23422365a59c..., store.mjs 3,239,252 B sha256 f2446058a8ec..., identical before and after EVERY arm. BASELINE 95/0, and the TRUE pre-item baseline measured on this machine at origin/main e9b21be6 by copying all three pristine files in: 87/0, exactly the figure the brief carried. (a) THE ROW'S OWN -- restore the per-part answer, the whole D-476 else-block removed so `existed` stays D-469's flat false -> 91 pass, 4 FAIL, AS DECLARED and all four by name: "a first multi-part acquire states undetermined, never that the bytes are new" (want null, got false), "and says why it cannot say...", "carrying the parts already held as an observation...", and "and the register answers for the whole: the bytes are HELD, never new" (want true, got false). THAT LAST ONE IS THE ROW'S RE-FETCH ARM and it is what the false costs: a document the register holds, re-fetched, answered as new bytes. (b) OVER-CORRECTION -- the register's answer ignored so `existed` is null even for a document it holds -> 93/2 AS DECLARED, "...the bytes are HELD, never new" (want true, got null) and "so nothing is stated as undetermined" (the sentence now travels where nothing is undetermined): the null ALONE is not the fix, the lookup is load-bearing, and the two halves are ONE control. (c) the holder-exists join dropped from `registerHolds` -> 95/0, DECLARED GREEN: purge deletes a bundle's register rows with it, so no op here leaves an orphan for the join to skip -- MEASURED UNREACHABLE in this suite and kept as the defence D-179's ruling requires, exactly as d179onehome's own nojoin arm is. (d) THE STORE IS SILENT -- the `registerholds` route renamed so `doAnswer` reports unanswered -> 93/2, the same two as (b) AS DECLARED, and this arm is the only thing that drives the silent branch at all: the three first-multipart pins STAY GREEN over its differently-worded sentence, which is what shows they pin the STRUCTURE (the register named, the tally in this fetch's own figures) rather than a copy of one sentence. (e) OVER-STRICTNESS -- the same rule in two spellings nothing anticipated, the join rewritten as an EXISTS subquery and the sentence's tail reworded -> 95/0 AS DECLARED. AND D-469's TWO ARMS RE-RUN ON THIS TREE, because a suite coupled to behaviour can survive a change that disarms the control coupled to shape: (a) head() moved back after flush() -> 94 pass, 1 FAIL, "a first acquire says the store did not already hold the bytes"; (b) the single-part answer hard-coded false -> 94/1, "acquiring the same document again is idempotent". BOTH AS ORIGINALLY DECLARED, so D-476 does not disarm D-469's control. EVERY ARM AS DECLARED ON ITS FIRST RUN, and nothing came back surprising. The figures name index.mjs and store.mjs as they stand on disk; only this paragraph, a comment in the SUITE, was written after the runs. */
/* Acquisition: the fetch layer, and the honesty of what it claims.
 *
 * Negative-control detail: overclaim the capture grade in the acquire path (index.mjs: a direct fetch stamps "A" instead of "B") -> 1 assertion fails (the load-bearing "acquire says B, a Worker cannot produce a grade-A capture"); restored, 72 pass.
 *
 * The intake doctrine's Section 3 makes grade a claim about the CAPTURE CHAIN,
 * not about the source and not about the information: "a claim about evidence is
 * only as strong as its weakest named layer". Grade A requires a WACZ or
 * equivalent capture of the source as served; a Worker cannot produce one. So the
 * load-bearing assertion in this suite is that acquire says B, because a surface
 * that overclaimed its grade would corrupt every downstream judgement that rests
 * on it, silently and permanently.
 *
 * The other load-bearing assertion is the locator fence. This op makes the plane
 * fetch a URL a member typed, which is the one place an instance can be turned
 * into a probe of things it should not reach. The fence is the catalog's own
 * isPublicHttpsLocator, the same function that guards the gathering queue, so
 * there is one definition of a reachable address rather than two.
 *
 * CORRECTED 2026-08-04 BY REC-48, and stated rather than quietly reworded: the
 * paragraph above says "Grade A requires a WACZ … so the load-bearing assertion
 * in this suite is that acquire says B". That is still the doctrine and it is
 * still where the load sits — but the two letters are no longer WRITTEN in the
 * op's answer. `note:` interpolates them from `EARNED_CAPTURE_CEILING` and the
 * derived `UNREACHABLE_CAPTURE_GRADE`, so what this suite pins is that the
 * sentence a caller reads is a FUNCTION of the rule `checkEarnedLeg` enforces,
 * not a third copy of it. The letters survive in this header on purpose: it is
 * prose about the doctrine, it reaches no caller, and stating the rule is the
 * only way the correction is legible.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
/* REC-48: the note is composed, so the suite composes the expectation the same
   way instead of typing the sentence. Both modules are pure — neither imports
   `cloudflare:workers` — so they load in the node harness, which is the
   precedent REC-43 set for the attest fence. */
import { acquireGradeNote, ACQUIRE_GRADE_NOTE, ATTEST_FENCE } from "../src/affordances.mjs";
/* REC-50: `BASIS_GRADES` joins them — the array `checkEarnedLeg` compares
   against, so the ordering this suite pins between the two stamped letters is
   the record's own ranking rather than a second statement of it. */
import { EARNED_CAPTURE_CEILING, UNREACHABLE_CAPTURE_GRADE,
         BASIS_GRADES } from "../checks/bio-checks.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

/* A scripted source. outboundService intercepts what the Worker fetches, so the
   suite exercises the real fetch path without touching the network. */
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-acq", MEMBER_TOKEN: "mem-acq", PROBE_TOKEN: "prb-acq", VERSION: "test",
              /* D-95: this suite is about acquisition, not pacing; a huge appetite
                 keeps the governor in the path while never gating a fake host.
                 The governor has its own suite driving REAL pacing. */
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    if (u.pathname === "/report.pdf")
      return new Response(DOC, { headers: { "content-type": "application/pdf" } });
    if (u.pathname === "/empty") return new Response(new Uint8Array(0));
    if (u.pathname === "/huge") {
      const b = new Uint8Array(21 * 1024 * 1024);
      for (let i = 0; i < b.length; i++) b[i] = (i * 31 + 7) % 256;
      return new Response(b);
    }
    if (u.pathname === "/enormous") return new Response(new Uint8Array(257 * 1024 * 1024));
    if (u.pathname === "/gone") return new Response("nope", { status: 404 });
    return new Response("unscripted", { status: 500 });
  },
});

const DOC = new Uint8Array(4096).map((_, i) => (i * 11) % 256);
const DOC_SHA = createHash("sha256").update(DOC).digest("hex");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const acquire = async (body, token = "mem-acq") =>
  (await mf.dispatchFetch("http://x/api/?op=acquire&token=" + token,
    { method: "POST", body: JSON.stringify(body) })).json();

const GOOD = { locator: "https://www.oaklandca.gov/report.pdf", authority: "City Auditor" };

console.log("\n--- a public https locator is fetched, hashed, and stored ---");
const a = await acquire(GOOD);
t("acquisition succeeds", a.ok, true);
/* D-469: the FIRST acquire of bytes the store has never seen must say so. The
   idempotent pin further down asserted only the second half, an equality that
   costs nothing: `existed` was asked AFTER the write and read true every time,
   so the record claimed it already held bytes it had never seen. */
t("a first acquire says the store did not already hold the bytes", a.existed, false);
t("the bytes hash to what the source served", a.document.capture.sha256, DOC_SHA);
t("the size is recorded", a.document.capture.bytes, DOC.length);
t("the locator is carried verbatim", a.document.locator, GOOD.locator);
t("the authority is carried", a.document.authority, "City Auditor");
t("the instant is ISO 8601 UTC", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(a.document.retrieved), true);
t("the content type the source declared is kept", a.document.capture.content_type, "application/pdf");

console.log("\n--- the grade is honest ---");
/* PIN CORRECTED 2026-08-04 (REC-48). It read `t("acquire claims Grade B, never A",
   …, "B")` and `t("and says in words why A is not available", /chain-of-custody/…)`.
   Neither was wrong about the plane; both were wrong about WHAT THEY GUARDED.
   The first named two letters in its own label and compared against a third copy
   of one of them; the second checked that a reason-shaped phrase appeared and
   would have gone on passing if every letter in the sentence had moved. Between
   them they let `note:` state the capture-grade doctrine in its own letters for
   as long as the op has existed. The literal wire pin is KEPT — it is the claim
   that this plane says B today, and it is what would catch a silent doctrine
   move — and the pins that were doing nothing are replaced by the ones that make
   the sentence a FUNCTION of the rule.
   KEPT AND RE-JUSTIFIED 2026-08-04 (REC-50), because its job changed under it.
   While the plane STAMPED "B" this pin and the one below it said the same thing
   twice; now that the stamp is `EARNED_CAPTURE_CEILING` it is the only assertion
   in the battery that still witnesses the VALUE — what this plane answers a
   caller TODAY — while the one below witnesses the RELATION to the rule. A
   doctrine move is supposed to fail here, loudly and by name, and be answered by
   a session correcting it with a reason rather than by a field that followed the
   move silently. */
t("acquire claims the ceiling letter and never the one above it", a.document.capture.grade, "B");
t("and the letter it claims is the one the gate ENFORCES, not a copy that agrees today",
  a.document.capture.grade, EARNED_CAPTURE_CEILING);

/* THE STAMPED GRADE IS COMPOSED FROM THE ENFORCED RULE, WHICH IS REC-50 — and
 * this block is the pin that BITES, because the two wire pins above cannot see
 * the difference between a composition and a hand-typed letter that agrees with
 * it today. REC-43 measured that on the attest fence and REC-48 measured it
 * again on this op's own `note:`: an identical copy satisfies every behavioural
 * assertion at zero cost, and only a STRUCTURAL pin can tell them apart. Nor
 * does hygiene.test.mjs's sweep reach this one — that sweep looks for a letter
 * beside the WORD "Grade", and a bare `"B"` in a ternary spells no word. So the
 * pin is here, and it reads the plane's own source at the site.
 *
 * NEGATIVE CONTROL ARMS FOR REC-50 are recorded at the foot of this block, and
 * they are HERE rather than in this file's `NEGATIVE CONTROL:` header because a
 * concurrent worker (M0-9) holds that header block; the arms are one grep away
 * and CONDUCT folds them in at integration.
 *
 * THE ARCHIVE-SOURCED LETTER IS NOT CLOSED HERE, AND THAT IS THE POINT OF
 * STATING IT. `op=acquire` stamps two letters. The direct-fetch one IS the
 * ceiling by definition, so composing it names no new doctrine. The
 * archive-sourced one is a SECOND capture-axis doctrine value — what an
 * archive-sourced capture EARNS, and whether that is a ceiling or a fixed grade
 * — and minting a constant for it would settle a question that is Bob's ruling
 * (QUEUE.md REC-50 says so in as many words; REC-48 left the same question open
 * one axis over for the same reason). It therefore stays a typed literal, ON
 * PURPOSE, and the assertions below say SO EXPLICITLY so that the next reader
 * knows it is open by decision and not by oversight.
 *
 * What is already RULED about it is the ORDERING — "grade tracks directness,
 * never technique", an archive hop is one more party between us and the
 * publisher — so the ordering is what this suite pins, and pinning it is not a
 * ruling because it asserts no value. It is also what makes the doctrine move
 * VISIBLE: move the ceiling and the composed letter follows while the typed one
 * does not, and the record would claim an archive-sourced capture is worth as
 * much as a direct one. That failure is the measurement this item leaves behind
 * in place of a constant it must not write. */
{
  const indexSrc = readFileSync(SRC, "utf8");
  /* Both arms of the stamp, read as WRITTEN: an identifier or a quoted letter. */
  const STAMP = /grade:\s*via === "archive\.org"\s*\?\s*("?[A-Za-z_$][\w$]*"?)\s*:\s*("?[A-Za-z_$][\w$]*"?)\s*,/;
  const m = STAMP.exec(indexSrc);

  /* ITS OWN REACH FIRST. An extraction that silently matched nothing would make
     every assertion below vacuous — the zero-cost-equality failure arriving in
     the INSTRUMENT rather than in the subject (REC-41 hit exactly this). So the
     reader is shown to fire on a planted control AND on the real source, and the
     source is shown to be the whole file rather than an empty read. */
  const PLANT = 'grade: via === "archive.org" ? "Z" : "Y",';
  t("the stamp reader fires on a planted control and finds the real site in src/index.mjs",
    [indexSrc.length > 100000, STAMP.test(PLANT), m !== null], [true, true, true]);

  const archiveArm = m ? m[1] : "", directArm = m ? m[2] : "";
  t("the DIRECT-FETCH arm interpolates the enforced ceiling and spells no letter of its own",
    [directArm, /^"[A-Z]"$/.test(directArm)], ["EARNED_CAPTURE_CEILING", false]);
  t("and index.mjs takes that symbol from the module where the refusal is computed",
    /import \{[\s\S]*?\bEARNED_CAPTURE_CEILING\b[\s\S]*?\} from "\.\.\/checks\/bio-checks\.mjs"/.test(indexSrc),
    true);

  const archiveLetter = archiveArm.replace(/"/g, "");
  t("the ARCHIVE-SOURCED arm is still a TYPED letter, which is OPEN BY DECISION and not by oversight — naming it is a ruling",
    /^"[A-Z]"$/.test(archiveArm), true);
  t(`and the typed archive letter ${JSON.stringify(archiveLetter)} still ranks strictly BELOW the enforced ceiling ${JSON.stringify(EARNED_CAPTURE_CEILING)} — grade tracks directness (RULED)`,
    [BASIS_GRADES.includes(archiveLetter),
     BASIS_GRADES.indexOf(archiveLetter) > BASIS_GRADES.indexOf(EARNED_CAPTURE_CEILING)],
    [true, true]);
}
/* REC-50's NEGATIVE CONTROL ARMS (run 2026-08-04, rec50-agent), each broken
   ALONE with every file restored BYTE-IDENTICALLY and sha256 compared before and
   after, and ALL RE-RUN against the final files. Whole suite = 84.
   (d) THE ITEM'S OWN — hand-type the letter back: `: EARNED_CAPTURE_CEILING` ->
       `: "B"` in src/index.mjs, an identical copy that agrees today -> 83 pass,
       1 FAIL, and it is the STRUCTURAL pin ALONE. Both wire pins pass. And
       hygiene.test.mjs STAYS 369/0 — REC-48's sweep cannot see this copy,
       because a bare `"B"` in a ternary spells no word for it to find beside a
       letter. That is why this pin had to be written here and at this altitude,
       and it is the third measurement of REC-35's finding on a third subject.
   (e) THAT LITERAL KEPT AND THE RULE MOVED — `EARNED_CAPTURE_CEILING = 'C'` in
       checks/bio-checks.mjs -> 81 pass, 3 FAIL (hygiene 368/1 and earnedbasis
       50/4 alongside). This is what the copy COSTS: the plane hands a caller a
       capture stamped B while `checkEarnedLeg` refuses any leg above C — the
       record overclaiming on the capture's own grade, which is worse than the
       sentence ABOUT the grade that REC-43 and REC-48 closed.
   (f) THE COMPOSED STAMP UNDER THE SAME MOVED RULE — REC-48's arm (c) exactly,
       re-run against this item's file -> 82 pass, 2 FAIL, and REC-48's ONE
       remaining failure ("the letter it claims is the one the gate ENFORCES")
       is GONE. It is the evidence this item closed what it claimed: run the
       same arm on the tree before this change and it fires; run it after and it
       does not. What fails INSTEAD is exactly what should: the today-value
       witness above, which is supposed to fail on a doctrine move so a session
       corrects it deliberately, and the archive-ordering pin — naming the typed
       archive letter that did NOT follow the ceiling and now claims an
       archive-sourced capture is worth as much as a direct one. That second
       failure IS the open ruling, made to speak instead of being remembered. */
t("the note still says in words why the grade above the ceiling is unavailable",
  /chain-of-custody/.test(a.note), true);

/* THE NOTE IS COMPOSED FROM THE ENFORCED RULE, WHICH IS REC-48. The letters are
   INTERPOLATED from `EARNED_CAPTURE_CEILING` and the DERIVED
   `UNREACHABLE_CAPTURE_GRADE`, so the sentence a caller reads and the refusal
   `checkEarnedLeg` makes cannot say different things. These four pins are
   BEHAVIOURAL and they are deliberately not the whole guard: a hand-typed
   literal identical to the composition would satisfy every one of them at zero
   cost (REC-43 measured exactly that on the attest fence). The pin that bites is
   STRUCTURAL and lives in hygiene.test.mjs — no module of src/ may spell a grade
   letter beside the word at all. Both are needed: this one says the sentence is
   RIGHT, that one says it is not a copy. */
t("the note interpolates the enforced ceiling rather than spelling it",
  a.note.includes(`Grade ${EARNED_CAPTURE_CEILING}:`), true);
t("and names the unreachable grade the rule DERIVES, not a typed letter",
  a.note.includes(`Grade ${UNREACHABLE_CAPTURE_GRADE} needs a chain-of-custody`), true);
t("the note over the wire IS the composition, character for character",
  a.note, acquireGradeNote(EARNED_CAPTURE_CEILING, UNREACHABLE_CAPTURE_GRADE));
t("and is the published constant the plane composes once",
  a.note === ACQUIRE_GRADE_NOTE, true);

/* IT IS NOT THE ATTEST FENCE, and a later session must not "simplify" it into
   one. Different act, different reader, different moment: the fence is the
   prompt on the act a member is DECIDING to take (DEC-39), this is the receipt
   for bytes already captured. REC-48's scope says so in as many words; this pin
   is what makes that survive the next reader who notices they overlap. */
t("op=acquire's note is its own sentence and not the attest act's fence",
  [a.note === ATTEST_FENCE, a.note.length > 0, ATTEST_FENCE.length > 0], [false, true, true]);

/* The composer refuses to write a sentence it cannot make true — a load failure,
   never a fallback that ships "Grade null needs a chain-of-custody web archive". */
{
  let threw = false;
  try { acquireGradeNote(EARNED_CAPTURE_CEILING, null); } catch { threw = true; }
  t("with no grade above the ceiling the note is not composed at all", threw, true);
}
t("the method names the surface that did it", /bio-plane acquire/.test(a.document.capture.method), true);

console.log("\n--- the bytes are really in the store, content-addressed ---");
const back = await mf.dispatchFetch(`http://x/api/?op=capture&token=mem-acq&sha256=${DOC_SHA}`);
t("the capture reads back", back.status, 200);
t("byte-identical", createHash("sha256").update(Buffer.from(await back.arrayBuffer())).digest("hex"), DOC_SHA);
const again = await acquire(GOOD);
t("acquiring the same document again is idempotent", again.existed, true);

console.log("\n--- the locator fence ---");
for (const [locator, why] of [
  ["http://www.oaklandca.gov/report.pdf", "not https"],
  ["https://localhost/report.pdf", "localhost"],
  ["https://203.0.113.10/report.pdf", "bare IP"],
  ["https://user:pw@www.oaklandca.gov/report.pdf", "credentials in the address"],
  ["https://intranet/report.pdf", "no public dot"],
  ["file:///etc/passwd", "not a URL this fence admits"],
  ["", "empty"],
]) t(`refused: ${why}`, (await acquire({ ...GOOD, locator })).reason, "BAD_LOCATOR");

console.log("\n--- D-97: authority is three-valued, and undetermined is a task, not a refusal ---");
/* The rule this replaces refused a capture that named no authority, which
   forced callers to invent one to get past the gate: exactly the false
   assertion the ruling exists to prevent. The old assertions encoded the
   superseded rule and are CORRECTED rather than exempted, per standing
   lesson 3. */
const noauth = await acquire({ locator: GOOD.locator });
t("a capture with no assertion succeeds", noauth.ok, true);
t("and is honestly undetermined", noauth.document.authority_state, "undetermined");
t("with a dated basis saying why", /no assertion was supplied/.test(noauth.document.authority_basis || ""), true);
t("and no invented authority field", "authority" in noauth.document, false);
const blank = await acquire({ ...GOOD, authority: "   " });
t("a blank assertion is no assertion", blank.document.authority_state, "undetermined");
const asserted = await acquire(GOOD);
t("an asserted authority is recorded", asserted.document.authority, GOOD.authority);
t("as determined", asserted.document.authority_state, "determined");
t("with the assertion named as the basis", /asserted by the capturing/.test(asserted.document.authority_basis || ""), true);
t("and the basis is dated", asserted.document.authority_basis.includes(asserted.document.retrieved), true);
console.log("\n--- D-97: a direct fetch is one provenance hop ---");
t("the chain exists", Array.isArray(asserted.document.provenance_chain), true);
t("with exactly one hop", asserted.document.provenance_chain.length, 1);
t("naming who fetched", /^instance /.test(asserted.document.provenance_chain[0].who), true);
t("what is asserted", asserted.document.provenance_chain[0].asserts.includes(GOOD.locator), true);
t("that the assertion is stated, not cryptographically bound", asserted.document.provenance_chain[0].bound, false);
t("and the source it came via", asserted.document.provenance_chain[0].via, "direct");

console.log("\n--- what the source does wrong is reported, not swallowed ---");
t("a 404 is named with its status",
  (await acquire({ ...GOOD, locator: "https://www.oaklandca.gov/gone" })).reason, "SOURCE_REFUSED");
t("an empty body is not a capture",
  (await acquire({ ...GOOD, locator: "https://www.oaklandca.gov/empty" })).reason, "EMPTY");
console.log("\n--- a document too large to hold is captured in parts ---");
const HUGE = new Uint8Array(21 * 1024 * 1024);
for (let i = 0; i < HUGE.length; i++) HUGE[i] = (i * 31 + 7) % 256;
const HUGE_SHA = createHash("sha256").update(HUGE).digest("hex");
const huge = await acquire({ ...GOOD, locator: "https://www.oaklandca.gov/huge" });
t("the capture succeeds where it used to be refused", huge.ok, true);
t("it came in parts", huge.parts > 1, true);
/* CORRECTED 2026-09-24 BY D-476, never exempted, and the old assertion was WRONG
   rather than merely superseded. It read `t("a first multi-part acquire does not
   claim the bytes were held", huge.existed, false)`, and D-469's comment beside it
   called that an under-claim that "never over-claims". IT IS NOT AN UNDER-CLAIM.
   `false` is the positive claim THESE BYTES ARE NEW, answered on a question
   nobody asked — the whole is never stored under its own hash, so R2 was not
   consulted at all — and acquire made it on every multi-part capture, a re-fetch
   of a document the record holds included. The honest answer when it cannot be
   established is `null` WITH THE SENTENCE that says why, which is what these
   three pin: the value, that the reason names the register (the one thing that
   CAN answer by the whole hash), and that the part tally travels as an
   observation computed from THIS fetch rather than as the answer. The sentence is
   pinned as a FUNCTION of the fetch's own figures, not as a copy of its words —
   REC-48's lesson, since a hand copy agrees for free. */
t("a first multi-part acquire states undetermined, never that the bytes are new", huge.existed, null);
t("and says why it cannot say, naming the register that answers by the whole hash",
  /register/.test(huge.existed_undetermined || ""), true);
t("carrying the parts already held as an observation, in this fetch's own figures",
  new RegExp(`\\b\\d+ of this fetch's ${huge.parts} parts\\b`).test(huge.existed_undetermined || ""), true);
t("and the whole hashes correctly across them", huge.document.capture.sha256, HUGE_SHA);
t("the recorded size is the whole document", huge.document.capture.bytes, HUGE.length);
t("each part names a file inside the bundle",
  huge.document.parts.every((p) => /^snapshots\/.+\.part\d{3}$/.test(p.file)), true);
t("the parts sum to the whole",
  huge.document.parts.reduce((a, p) => a + p.bytes, 0), HUGE.length);
t("the method says it streamed", /streamed in \d+ parts/.test(huge.document.capture.method), true);

/* The point of parts is that the catalog can verify the whole from them without
   any consumer ever holding it: C-18.6 streams them through the same incremental
   hasher the plane used on the way in. */
{
  const { checkBundle } = await import("../checks/bio-checks.mjs");
  const ID = "INFO-2026-0800-parted";
  const files = new Map();
  const bodyMd = [
    "---", `id: ${ID}`, "object_type: information", "schema: information@2",
    'title: "Parted capture"', "current_state: collected", "prior_state: null",
    "created: 2026-07-24T00:00:00Z", "last_updated: 2026-07-24T00:00:00Z",
    "produced_by:", "  mode: assisted", "  capability_tier: session",
    "group: believe-in-oakland", "references: []", "state_history: []",
    "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
    "  source: null", "visuals: []", "criticality: supporting",
    "source_status: unchanged", "source:",
    "  locator: https://www.oaklandca.gov/huge", "  authority: City Auditor",
    "  retrieved: 2026-07-24T00:00:00Z",
    "monitoring:", "  enabled: false", "  frequency: none", "---", "",
    "## Summary", "", "A large document, captured in parts.", "",
    "## Provenance Notes", "", "## Session Log", "", "## Review Notes", "",
  ].join("\n");
  files.set("bundle.md", bodyMd);
  files.set("data/provenance.json", JSON.stringify({ documents: [huge.document] }, null, 1));
  /* The parts, as bytes, exactly as the store holds them. */
  let at = 0;
  for (const p of huge.document.parts) {
    files.set(p.file, HUGE.subarray(at, at + p.bytes));
    at += p.bytes;
  }
  const { findings } = await checkBundle({ folderName: ID, files,
    sha256: async (v) => createHash("sha256").update(typeof v === "string" ? Buffer.from(v, "utf8") : Buffer.from(v)).digest("hex"),
    sha512: async (b) => new Uint8Array(await (await import("node:crypto")).webcrypto.subtle.digest("SHA-512", b)),
    resolveTarget: () => true });
  const errs = findings.filter((x) => x.severity === "error");
  for (const x of errs) console.log(`         ${x.check}: ${x.message.slice(0, 130)}`);
  t("the catalog verifies the whole from the parts alone", errs.length, 0);
}

console.log("\n--- and there is still a ceiling ---");
t("a document beyond the parts ceiling is refused",
  (await acquire({ ...GOOD, locator: "https://www.oaklandca.gov/enormous" })).reason, "TOO_LARGE");

console.log("\n--- the record it hands back is the shape C-18.1 wants ---");
for (const k of ["file", "locator", "authority", "retrieved", "capture", "origin", "attestation_attempts"])
  t(`document carries ${k}`, k in a.document, true);
for (const k of ["method", "grade", "actor_class", "sha256", "encoding"])
  t(`capture carries ${k}`, k in a.document.capture, true);
t("origin is a named request by default", a.document.origin.kind, "named_request");
t("attestation attempts start empty and honest, not absent", a.document.attestation_attempts, []);
t("a sweep origin records what deemed it",
  (await acquire({ ...GOOD, matchedSweep: "sweep-2026-07" })).document.origin.matched_sweep, "sweep-2026-07");

console.log("\n--- it writes no bundle state ---");
t("the store is still empty: intake never writes live state",
  (await (await mf.dispatchFetch("http://x/api/?op=stats&token=mem-acq")).json()).result.bundles, 0);

console.log("\n--- and it is not a public surface ---");
t("unauthenticated is refused",
  (await (await mf.dispatchFetch("http://x/api/?op=acquire", { method: "POST", body: "{}" })).json()).error,
  "unauthenticated");
t("a GET is refused", (await (await mf.dispatchFetch("http://x/api/?op=acquire&token=mem-acq")).json()).error,
  "acquire is a POST");

console.log("\n--- acquisition becomes evidence in the record ---");
{
  /* End to end: the browser's own assembly of a captured document into a bundle,
     then the catalog's verdict on the result. The document is registered as a
     blob and its bytes are supplied here so the byte checks actually run, which
     the gate deliberately skips (they were proven at capture). */
  const { SETUP_HTML } = await import("../src/setup.mjs");
  const script = SETUP_HTML.slice(SETUP_HTML.lastIndexOf("<script>") + 8, SETUP_HTML.lastIndexOf("</script>"));
  const el = () => ({ addEventListener() {}, classList: { add() {}, remove() {} },
    textContent: "", innerHTML: "", value: "", style: {}, hidden: false, dataset: {} });
  const sb = {
    document: { querySelector: () => el(), querySelectorAll: () => [], getElementById: () => el(),
                addEventListener() {}, createElement: () => el(), body: { appendChild() {}, removeChild() {} } },
    location: { hash: "", pathname: "/", origin: "https://x" }, history: { replaceState() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    fetch: async () => ({ ok: true, status: 200, json: async () => ({ ok: true }) }),
    URLSearchParams, console, JSON, Date, RegExp, String, Number, Object, Array,
    crypto: (await import("node:crypto")).webcrypto, setTimeout, TextEncoder,
    navigator: { clipboard: { writeText: async () => {} } },
  };
  sb.window = sb;
  const ui = new Function(...Object.keys(sb),
    script + "\n;return { mdFor, docFiles, FIRST_STATE, schemaFor };")(...Object.values(sb));

  const NOW = "2026-07-24T12:00:00Z";
  const ID = "INFO-2026-0600-captured-report";
  t("a bundle carrying a document is information@2", ui.schemaFor("information", true), "information@2");
  t("and one without stays information@1", ui.schemaFor("information", false), "information@1");

  const body = ui.mdFor(ID, "information", "collected", "Captured report", "What the report shows.", NOW, true);
  const sha256Text = async (v) => createHash("sha256").update(v, "utf8").digest("hex");
  const files = await ui.docFiles(body, a.document, await sha256Text(body));
  t("three files: the record, the register, and the document", files.map((f) => f.path).sort(),
    ["bundle.md", "data/provenance.json", "snapshots/report.pdf"]);
  t("the document is a blob reference, not inlined", files.find((f) => f.path === a.document.file).blobSha, DOC_SHA);

  const { checkBundle, withProducingGroup } = await import("../checks/bio-checks.mjs");
  const map = new Map();
  for (const fl of files) map.set(fl.path, fl.text !== undefined ? fl.text : DOC);
  /* CORRECTED 2026-09-21 BY D-436 (IC-172), never exempted. The page's bundle.md used to be complete as sent only
     because it carried a LITERAL producing group — true of one instance, false of every other. The page now sends no
     `group:` line and the plane writes the store's recorded group into every creation, so the bundle is judged AS THE
     PLANE HOLDS IT: the page's bytes through the catalogue's `withProducingGroup`, the function the store's stamp calls.
     The page's side is pinned too — its own bytes name no group. */
  t("the page's own bundle.md names no producing group — the plane writes it at creation (D-436)",
    /^group:/m.test(map.get("bundle.md")), false);
  map.set("bundle.md", withProducingGroup(map.get("bundle.md"), "acquire-fixture"));
  const { findings } = await checkBundle({
    folderName: ID, files: map,
    sha256: async (v) => createHash("sha256").update(typeof v === "string" ? Buffer.from(v, "utf8") : Buffer.from(v)).digest("hex"),
    sha512: async (b) => new Uint8Array(await (await import("node:crypto")).webcrypto.subtle.digest("SHA-512", b)),
    resolveTarget: () => true,
  });
  const errs = findings.filter((x) => x.severity === "error");
  for (const x of errs) console.log(`         ${x.check}: ${x.message.slice(0, 130)}`);
  t("the assembled bundle has zero findings", errs.length, 0);
}

console.log("\n--- op=archivelookup is reachable through the control plane ---");
/* Before this, no suite drove op=archivelookup: the archive fallback's DECIDE
   surface (op=acquire with via=archive.org is the CAPTURE surface, tested above)
   had no caller at all — the D-43 class, where op=invitelook shipped a
   ReferenceError while 1276 assertions passed. The claim here is reachability,
   not a successful lookup: a fresh store has recorded no source failures, so the
   eligibility fence (D-104) refuses, and a STRUCTURED refusal proves the op was
   reached and answered rather than crashing. The fence's own logic is proven in
   reachability.test.mjs; this only proves a caller can get to it. */
{
  const al = await (await mf.dispatchFetch(
    "http://x/api/?op=archivelookup&token=mem-acq&address="
    + encodeURIComponent("https://www.oaklandca.gov/report.pdf"))).json();
  t("archivelookup is reached and answers structurally, not with a crash", al.ok, false);
  t("and refuses by the eligibility fence rather than an exception", al.reason, "NOT_ELIGIBLE");
  t("carrying the reachability verdict the fence rested on", typeof al.reachability, "object");
}

console.log("\n--- D-476: a re-fetched multi-part capture never claims the bytes are new ---");
/* THE ANSWER'S OTHER HALF. The pins up at the parts section fix what acquire says
   when it CANNOT establish whether the record holds the bytes; this fixes what it
   says when it CAN. `register` is keyed by `capture_sha` — the identity of the
   bytes across the whole system — and one capture has one home (D-179; Intake
   Doctrine section 8), so the register is the one read that answers by the WHOLE
   hash for a document the store holds only in parts. Registered: `true`. Not
   registered: `null` with the sentence, above. Never `false`.
   *
   * IT RUNS LAST ON PURPOSE. It is the first thing in this suite to write live
   * bundle state, and "the store is still empty: intake never writes live state"
   * further up has to measure a store that intake alone has touched. Moving this
   * block above that pin would flip it, which is the finding, not the fixture.
   *
   * DRIVEN THROUGH THE OPS, both of them: op=promote puts the register row there
   * (a store-level insert would not prove a caller can reach this) and op=acquire
   * re-fetches the same 21 MB locator and answers over it. */
{
  const NOW = "2026-09-24T00:00:00Z";
  const POST = async (q, body) => (await (await mf.dispatchFetch(`http://x/api/?${q}`,
    { method: "POST", body: JSON.stringify(body ?? {}) })).json());
  t("the instance claims, so a bundle can register the capture",
    (await POST("op=claim", { bootstrapToken: "adm-acq", password: "founder-passphrase-476" })).ok, true);
  const ID = "INFO-2026-0900-huge-registered";
  const md = ["---", `id: ${ID}`, "object_type: information", "schema: information@1",
    `title: "Info ${ID}"`, "current_state: collected", "prior_state: null", `created: "${NOW}"`,
    `last_updated: "${NOW}"`, "produced_by:", "  mode: agent", "  capability_tier: high",
    "group: believe-in-oakland", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
    "---", "", "## Summary", "", "The parted document, registered.", "",
    "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const promoted = await POST("op=promote&token=adm-acq", {
    bundleId: ID, base: null, snapKey: "20260924T000001Z_d476",
    files: [{ path: "bundle.md", text: md, bytes: Buffer.byteLength(md),
              sha256: createHash("sha256").update(md, "utf8").digest("hex") }],
    register: [{ path: "snapshots/huge.bin", sha256: HUGE_SHA, encoding: "binary", bytes: HUGE.length }],
    meta: { object_type: "information", group: "believe-in-oakland",
            current_state: "collected", created: NOW, last_updated: NOW } });
  t("the whole document's bytes are registered under a bundle that exists", promoted.ok, true);

  const refetch = await acquire({ ...GOOD, locator: "https://www.oaklandca.gov/huge" });
  t("the re-fetch still comes in more than one part", refetch.parts > 1, true);
  t("and the register answers for the whole: the bytes are HELD, never new", refetch.existed, true);
  t("so nothing is stated as undetermined", "existed_undetermined" in refetch, false);
  t("and the whole still hashes to the same document", refetch.document.capture.sha256, HUGE_SHA);
}

await mf.dispose();
console.log(`\nacquire: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
