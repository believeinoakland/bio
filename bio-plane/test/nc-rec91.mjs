/* REC-91's NEGATIVE CONTROL HARNESS. Declared in `test/capture-text-index.test.mjs`,
 * run from `bio-plane/` in one step:
 *
 *     node test/nc-rec91.mjs             # every arm, in order, baseline first
 *     node test/nc-rec91.mjs replace     # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it (the `nc-rec82` / `nc-rec85` / `nc-rec93` / `nc-rec94`
 * precedent).
 *
 * IT IS `nc-rec94.mjs`'s HARNESS WITH THIS ITEM'S ARMS, deliberately and without
 * improvement: a second harness of one shape is the drift this repository keeps
 * measuring, and the arms are the part that is this item's.
 *
 * WHAT THESE ARMS CANNOT SEE, stated rather than left to be discovered. Every
 * one is a source-level mutation inside this plane. Nothing here exercises a
 * second instance, a real network fetch, a real OCR engine, a `passage:` query
 * (REC-92's, which does not exist), or a real PDF producer's text reaching the
 * wire. Nor can any of them see a defect in the ACQUIRE ANSWER's shape beyond
 * the three containers this suite assembles: a seventh producer returning a
 * fourth per-unit list is outside every arm below, which is the price of
 * recognising units by SHAPE rather than by a list of names — the recognition
 * is open, and so is the blind spot.
 *
 * AND ONE ARM IS DELIBERATELY NOT HERE. There is no arm that sends a capture
 * over §4.3's 2 MiB per-capture bound, because NOTHING CAN: `op=promote` refuses
 * an inline bundle file over `INLINE_MAX` (1,048,576 B) first, measured at
 * 2,460,076 B by this item's own suite. The `overstrict` arm lowers the bound
 * instead, which is the only way that branch is reachable — a control arm
 * reaching a branch the product's own route cannot is a finding about the ROUTE,
 * and it is reported as a DESIGN GAP rather than hidden inside a green arm.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { controlPen } from "./pen.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
/* THE PEN IS OUTSIDE THE WORKTREE (M0-182, BOB #32). `controlPen` is `mkdtempSync` under the system
   temp root, so neither the battery's discovery nor the fleet walk can enrol what it holds, and the
   tree stays CLEAN while the control runs — which matters because since D-293 a gate on a dirty tree
   RECORDS NOTHING. `mkdtemp`, not a fixed name, is what keeps it isolated: the shared scratchpad and
   `/tmp` are not isolated between sessions, and a harness there was once overwritten mid-turn by a
   concurrent worker. */
const SAFE = controlPen("rec91");
mkdirSync(SAFE, { recursive: true });

const STORE = join(PLANE, "src/store.mjs");
const INDEX = join(PLANE, "src/index.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 10000;   /* both files are hundreds of KB; a restore over a stub
                              must fail loudly rather than quietly. */

const runSuite = (file) => {
  const r = spawnSync(process.execPath, [file], { cwd: PLANE, encoding: "utf8",
                                                 maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  /* `-?\d+` AND NOT `\d+`. The suite prints `-1 pass` when its own foot guard
     did not fire, and an unsigned pattern matches the `1` inside `-1` — so a
     suite that DIED EARLY would read as one that passed a single assertion.
     nc-rec94's harness paid for this line and it is carried unchanged. */
  const m = /(-?\d+) pass, (-?\d+) fail/.exec(out);
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status, out,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ") || l.includes("THREW"))
                       .map((l) => l.trim()) };
};
const SUBJECT = "test/capture-text-index.test.mjs";
const HYGIENE = "test/hygiene.test.mjs";

/** Apply exactly one textual patch, reporting the match count. */
function arm(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

const ARMS = {
  baseline: {
    files: [], suite: SUBJECT,
    why: "nothing armed — the row that distinguishes six-arms-broken from six-arms-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },

  /* D-113's OWN ARM. A derived table left out of `purge` makes a whole-store
     purge report scope ALL while rows stand — and here the rows are the WORDS of
     documents nobody holds, so a later search would answer out of a purged
     corpus. This is the queue row's own first control: *the FTS arm dropped from
     purge → the purge scope test names the table*. */
  nopurge: {
    files: [STORE], suite: SUBJECT,
    why: "drop `capture_text` from purge's TABLES, so a purged corpus keeps its indexed passages",
    /* CORRECTED AFTER THE FIRST RUN, AND THE CORRECTION IS THE MORE USEFUL
       RESULT. This arm was declared to leave rows behind. It does something
       WORSE and the suite could not finish saying so: with `capture_text` out of
       TABLES, the whole-store arm's `DELETE FROM capture_text_fts` runs while
       the base rows are still there, and clearing an external-content index
       ahead of its content answers `SQLITE_CORRUPT_VTAB` — so the store is left
       CORRUPT and the next promote throws. The three declared assertions all
       went red, and then the suite died, so the tally read -1 and the verdict
       read NOT AS DECLARED over an arm that had done more damage than predicted.
       The declaration now names the throw as well, which is what a reader
       needs: this is not "a purge that leaves rows", it is "a purge that breaks
       the store", and it is the strongest evidence in this set that the SWEEP's
       ordering is load-bearing rather than tidy. */
    mustFail: ["A7: `capture_text` is in purge's TABLES",
               "E1: the PER-BUNDLE arm takes that document's units",
               "E2: the WHOLE-STORE arm empties both",
               "THREW"],
    mustPass: "every write arm — this arm takes nothing away from the writer, which is what makes "
            + "it a statement about purge rather than about indexing",
    alsoRun: HYGIENE,
    alsoMustFail: true,
    alsoWhy: "hygiene's D-113 census must ALSO go red — it is the check that would have caught "
           + "this at the moment the mistake was made, and a control that only the item's own "
           + "suite can see is a control that does not protect the next item",
    patch: () => arm(STORE, `                    "capture_text"];`, `                    ];`),
  },

  /* THE CHAIN-MOVE ARM, and it is the one that is INVISIBLE on a first
     promotion. §4.1: the capture's previous text rows are deleted first, so a
     revised chain never leaves a unit claiming an engine that did not produce
     it. Without the delete, a re-extraction ADDS to the index instead of
     replacing it — and the record then answers a search with text the current
     chain never produced. */
  nodelete: {
    files: [STORE], suite: SUBJECT,
    why: "remove the leading DELETE in the writer, so a chain move ADDS units instead of replacing "
       + "them and the superseded engine's text stays searchable",
    /* CORRECTED AFTER THE FIRST RUN, AND WHAT IT FOUND IS A DEFENCE NOBODY HAD
       CLAIMED. This arm was declared to make a chain move ADD units rather than
       replace them, leaving the superseded engine's text searchable. It does
       not get that far: the PRIMARY KEY is the ADDRESS, so re-writing a page the
       capture already holds fails with `SQLITE_CONSTRAINT_PRIMARYKEY` and the
       whole promotion is refused. The staleness this arm was written to
       demonstrate is therefore UNREACHABLE by this route — the key refuses it —
       and the real failure mode of a missing delete is a REFUSED PROMOTE, which
       is loud and safe. The `replace` arm below is the one that reaches the
       silent version, by defeating the key as well.
       That is two different facts about one line and it is why both arms exist.
       A single arm that changed both would have shown neither. */
    mustFail: ["A6: the writer DELETES the capture's rows",
               "THREW"],
    mustPass: "every FIRST-promote arm — on a first promotion there is nothing to delete, so this "
            + "defect is invisible there, which is exactly why the chain-move arm has to exist. "
            + "The suite DIES at the chain-move promote rather than reaching `D2`, because the "
            + "primary key refuses the write; `D2` is therefore NOT in this arm's declared set, "
            + "and the arm that reaches it is `replace`",
    patch: () => arm(STORE,
      "    this.sql.exec(`DELETE FROM capture_text WHERE capture_sha=?`, captureSha);",
      "    /* ARMED */"),
  },

  /* THE MEASURED SILENT-CORRUPTION ARM, and it is the one this item would not
     have thought to write without probing first. `INSERT OR REPLACE` looks like
     a tidier way to write the same rows. It is not: SQLite does not fire delete
     triggers for REPLACE conflict resolution, so the superseded row's
     external-content index entry is ORPHANED — and an orphan STILL MATCHES. The
     base table is correct, every count of it is correct, and a search answers
     out of text the record no longer holds. */
  replace: {
    files: [STORE], suite: SUBJECT,
    why: "write the units with INSERT OR REPLACE and drop the delete — the index entry of every "
       + "superseded row is orphaned and still matches, while the base table looks perfect",
    /* THIS ARM CAME BACK 2/3 ON ITS FIRST RUN AND THE MISSING THIRD WAS A
       DEFECT IN THE SUITE, NOT IN THE ARM — the most valuable result in this
       set. `D2b` was written as `textIndexed === textUnits` and stayed GREEN
       over a real orphan, because an FTS5 external-content table answers
       `count(*)` OUT OF ITS CONTENT TABLE: the two figures were one figure read
       twice, which is CLAUDE.md's costs-nothing rule inside the one instrument
       written to catch this exact corruption. `op=stats` now reports
       `textIndexOk` from FTS5's `integrity-check` AT RANK 1, which compares the
       index against the content table — measured to catch the orphan that rank 0
       passes over — and `D2b` asserts that. The declaration is unchanged; what
       changed is that the third assertion can now fail. */
    mustFail: ["A6: the writer DELETES the capture's rows",
               "D2: A CHAIN MOVE REPLACES THE UNITS AND DOES NOT ADD TO THEM",
               "D2b: and the FTS index moved with it"],
    mustPass: "every arm about a FIRST promotion, and every count of the BASE table — the whole "
            + "point of this arm is that the damage is invisible to the base table",
    patch: () => {
      const a = arm(STORE,
        "    this.sql.exec(`DELETE FROM capture_text WHERE capture_sha=?`, captureSha);",
        "    /* ARMED */");
      if (!a.armed) return a;
      return arm(STORE, "        `INSERT INTO capture_text\n", "        `INSERT OR REPLACE INTO capture_text\n");
    },
  },

  /* THE OBSERVATION, SEPARATED FROM THE WRITE. The units and the statement about
     them are two different obligations — §4.3 puts the `indexed` state in the
     observation log precisely so that *not extracted*, *over the bound* and
     *indexed* are one vocabulary in one place. This arm removes the statement
     and leaves the write, so the rows are all there and nothing can say so. */
  noobs: {
    files: [STORE], suite: SUBJECT,
    why: "neuter the `indexed` observation, so the units are written and the record cannot say "
       + "what it holds — which is the sparse rule failing at the one surface that reads absence",
    mustFail: ["C2: the DOCUMENT's content axis says its text is FULLY indexed",
               "C3: the WORKBOOK says NONE with a REASON",
               "D1b: and the capture says its text is fully indexed",
               "D3: a unit over the PER-UNIT cap",
               "D4: a capture whose text did not fit"],
    mustPass: "every ROW-COUNT arm (C1, C1b, D1, D2, D2b, E1, E2, E3) — they read `op=stats` and "
            + "not the log, which is what separates the OBSERVATION from the WRITE",
    patch: () => arm(STORE,
      "  #observeIndexed(bundleId, captureSha, result, { author = null, hadText = false,\n"
      + "                                                  unitArm = true, armReason = null } = {}) {",
      "  #observeIndexed(bundleId, captureSha, result, { author = null, hadText = false,\n"
      + "                                                  unitArm = true, armReason = null } = {}) {\n"
      + "    if (true) return null;   /* ARMED */"),
  },

  /* THE FALSE-ABSENCE ARM, AND IT IS THE DIRECTION THIS ITEM'S WHOLE VOCABULARY
     EXISTS TO REFUSE. A workbook's text is extracted and this record cannot
     address a passage of it. Treating every container as having a unit arm makes
     that capture read as one whose producer returned nothing — *we looked and
     there is nothing* about a document holding 72 MB of text across the census.
     M-20 measured the size of the gap; this arm measures what happens when the
     record forgets it is a gap. */
  armsopen: {
    files: [STORE], suite: SUBJECT,
    why: "treat every container as having an indexing unit arm, so a workbook reads as a document "
       + "whose producer returned nothing rather than as one this record cannot address",
    /* CORRECTED AFTER THE FIRST RUN, AND THE CORRECTION IS A FINDING ABOUT THE
       DESIGN RATHER THAN ABOUT THE ARM. This was declared to fail `C3` and
       `C3b`. It fails only `C3b`: with every container armed, the workbook's
       producer returns no units, the writer's zero-units branch fires, and the
       capture still answers the NONE member — the STATE is identical and only
       the REASON changes, from *this record cannot address a passage of an xlsx*
       to *this container produced no unit carrying text*.
       THAT IS THE DESIGN WORKING AND IT IS ALSO A WARNING. Two genuinely
       different facts land on one state, and the only thing that tells them
       apart is the sentence — which is exactly why §4.3's member is
       `none (reason)` and not `none`, and why `C3b` asserts the sentence rather
       than the state. A surface that rendered the state alone would show a
       workbook the record cannot index and a workbook nobody could read as the
       same answer. */
    mustFail: ["C3b: and the reason NAMES the container"],
    mustPass: "`C3` — THE STATE DOES NOT MOVE, only the reason, which is the finding this arm "
            + "recorded rather than the failure it predicted — and every arm about the DOCUMENT "
            + "and the DECK, which really do have unit arms",
    patch: () => arm(STORE,
      `const CAPTURE_TEXT_UNIT_CONTAINERS = new Set(["pdf", "docx", "odt", "pptx", "odp"]);`,
      `const CAPTURE_TEXT_UNIT_CONTAINERS = { has: () => true };   /* ARMED */`),
  },

  /* THE OVER-STRICTNESS DIRECTION, ARMED AGAINST THE BOUND RATHER THAN THE
     WRITER — because a bound tighter than its rule is not a safer bound. It
     makes the record say it holds LESS than it does, and a member reading
     `partial` over a whole document would re-extract something already complete.
     It is also the only way the store's per-capture branch is reachable at all
     (see this file's header), which is itself the finding. */
  overstrict: {
    files: [STORE], suite: SUBJECT,
    why: "drop the per-capture bound to 64 B, so an ordinary document is reported as partly "
       + "indexed when the record holds all of it",
    mustFail: ["C2: the DOCUMENT's content axis says its text is FULLY indexed",
               "D1b: and the capture says its text is fully indexed",
               "D3: a unit over the PER-UNIT cap"],
    mustPass: "`D4` (the capture that really IS partial stays partial), `C3` (the workbook's "
            + "no-unit-arm answer is about the CONTAINER and no bound can change it), and every "
            + "purge and index arm — a bound is not a refusal and must move no refusal",
    patch: () => arm(STORE,
      "const CAPTURE_TEXT_CAPTURE_BOUND = 2 * 1024 * 1024;",
      "const CAPTURE_TEXT_CAPTURE_BOUND = 64;   /* ARMED */"),
  },

  /* THE WIRE, NOT THE STORE. Every arm above breaks the store; this one breaks
     the ACQUIRE half, which is where the units come from at all. It is separate
     because a suite that went red for both would not be able to say whether the
     producer or the writer was at fault — and because the wire's emission is the
     one piece of this item that lives in a file three other workers hold regions
     of. */
  nowire: {
    files: [INDEX], suite: SUBJECT,
    why: "stop the acquire answer carrying the units at all, so the producers emit them and "
       + "nothing reaches the store",
    /* THIS ARM KILLED THE SUITE ON ITS FIRST RUN AND THAT WAS THE SUITE'S
       DEFECT. With no units on the wire, `B4`'s bare spread of `text_units`
       threw a TypeError — which goes through NO assertion at all, ending the
       module while the tally read clean — so the verdict read 4/6 when the truth
       was that the suite never reached the two arms that would have answered.
       WORKER.md's own receipt, met again. `B4` is null-safe now and this arm
       reaches its whole declared set. */
    mustFail: ["B1: the DOCUMENT emits one `doc-para` unit per paragraph",
               "B1b: and the unit's TEXT is the document's text",
               "B2: the DECK emits ONE unit per SLIDE",
               "B2b: and the one slide unit carries BOTH",
               "C1: the units are PERSISTED",
               "C2: the DOCUMENT's content axis says its text is FULLY indexed"],
    mustPass: "`B3` (the workbook emits nothing either way — which is why the workbook arm alone "
            + "cannot tell a wire failure from a container with no unit arm, and why this arm and "
            + "`armsopen` are two arms), and every `pdf-page` arm, which is driven through "
            + "`op=promote` with an authored document and never touches this wire",
    patch: () => arm(INDEX,
      "                textUnits = kept.length ? kept : null;",
      "                textUnits = null;   /* ARMED */"),
  },
};

const want = process.argv[2];
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm '${want}'. arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

let finding = 0;
for (const name of names) {
  const a = ARMS[name];
  console.log(`\n===== ARM ${name} =====`);
  console.log(`  WHY        ${a.why}`);
  console.log(`  MUST FAIL  ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing — baseline)"}`);
  console.log(`  MUST PASS  ${a.mustPass}`);
  /* Pristine copies, UNIQUELY NAMED PER ARM, taken before the patch. */
  const saved = a.files.map((f) => {
    const dest = join(SAFE, `${name}.${f.split("/").pop()}`);
    copyFileSync(f, dest);
    return { f, dest, sha: sha(f), bytes: statSync(f).size };
  });
  for (const s of saved) {
    console.log(`  PRISTINE   ${s.f.replace(REPO + "/", "")}  ${s.bytes} bytes  sha256 ${s.sha.slice(0, 12)}…`);
    if (s.bytes < MIN_BYTES) { console.log(`  FINDING    pristine copy is under ${MIN_BYTES} bytes — refusing to proceed`); process.exit(2); }
  }
  const before = saved.map((s) => s.sha);
  const armed = a.patch();
  console.log(`  ARMED      ${armed.armed ? "yes" : "NO"}  (patch matched ${armed.matches}×)`);
  if (!armed.armed && name !== "baseline") {
    console.log(`  FINDING    the arm DID NOT ARM. An arm that did not arm is a finding, never a retry.`);
    finding++;
  }
  /* AND THE BYTES REALLY CHANGED — a patch that matched once and wrote the same
     text back is an arm that did not arm while reporting that it did. */
  saved.forEach((s, i) => {
    const now = sha(s.f);
    if (name !== "baseline" && now === before[i]) {
      console.log(`  FINDING    ${s.f.replace(REPO + "/", "")} is byte-identical AFTER the patch — the arm changed nothing`);
      finding++;
    }
  });
  const r = runSuite(a.suite);
  console.log(`  RESULT     ${r.pass} pass, ${r.fail} fail, exit ${r.exit}`);
  for (const l of r.failing) console.log(`             ${l}`);
  let alsoOk = true;
  if (a.alsoRun) {
    const r2 = runSuite(a.alsoRun);
    alsoOk = a.alsoMustFail ? r2.fail > 0 : r2.fail === 0;
    console.log(`  ALSO       ${a.alsoRun}: ${r2.pass} pass, ${r2.fail} fail — ${alsoOk ? "AS DECLARED" : "NOT AS DECLARED"}`);
    console.log(`             ${a.alsoWhy}`);
    if (!alsoOk) finding++;
  }
  /* Restore, and MEASURE the restore. */
  for (const s of saved) {
    copyFileSync(s.dest, s.f);
    const back = sha(s.f);
    const sameBytes = readFileSync(s.f).equals(readFileSync(s.dest));
    console.log(`  RESTORED   ${s.f.replace(REPO + "/", "")}  byte-identically: ${back === s.sha && sameBytes ? "YES" : "NO"}  ${statSync(s.f).size} bytes  sha256 ${back.slice(0, 12)}…`);
    if (!(back === s.sha && sameBytes)) { console.log("  FINDING    restore FAILED — stopping before the next arm measures the wrong tree"); process.exit(2); }
  }
  /* The declared verdict, checked. */
  if (name === "baseline") {
    const ok = r.fail === 0 && r.pass > 0;
    console.log(`  VERDICT    ${ok ? "AS DECLARED — green" : "NOT AS DECLARED"}`);
    if (!ok) finding++;
  } else {
    const hit = a.mustFail.filter((m) => r.failing.some((l) => l.includes(m)));
    /* `r.fail > 0` IS NOT THE TEST WHEN A THROW IS DECLARED. An arm whose damage
       ENDS the suite reports its tally as -1 — correctly, because the suite did
       not reach its own foot — and requiring a positive failure count would
       score the most damaging arms in this set as NOT AS DECLARED while every
       declared failure was present and a throw was predicted. So an arm that
       DECLARED a throw is judged on its declared set alone, and the -1 is
       printed rather than hidden. An arm that did NOT declare one still has to
       show a positive count, so a suite dying unexpectedly is still a finding. */
    const declaredThrow = a.mustFail.includes("THREW");
    const ok = hit.length === a.mustFail.length && (declaredThrow ? r.pass === -1 : r.fail > 0);
    console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present, ${r.fail} total failing`);
    if (!ok) finding++;
  }
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);
