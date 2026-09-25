/* SK-7's NEGATIVE CONTROL HARNESS. Declared in
 * `test/content-machine-mint.test.mjs`, run from `bio-plane/` in one step:
 *
 *     node test/nc-sk7.mjs             # every arm, in order, baseline first
 *     node test/nc-sk7.mjs label       # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it. `nc-rec83.mjs`'s shape, and this file is a deliberate COPY
 * of that harness rather than an import — a control harness that shares
 * machinery with another item's harness shares that harness's defects, and both
 * REC-82's and REC-83's runs found arms of their own wrong on the first pass.
 *
 * THE RULES THIS HARNESS OBEYS, each with its receipt in WORKER.md:
 *   - ONE ARM AT A TIME, every other defence held OPEN.
 *   - A BASELINE ROW that arms nothing. It is the only row that distinguishes
 *     all-arms-broken from all-arms-working.
 *   - EVERY ARM DECLARES, BEFORE IT RUNS, what MUST fail and what MUST NOT.
 *   - EVERY ARM REPORTS WHETHER IT ARMED (the patch's match count, and a count
 *     that is not exactly 1 is a FINDING, not a retry).
 *   - EVERY RESTORE is verified against a UNIQUELY-NAMED per-arm pristine copy
 *     by sha256 AND by CONTENT, with a byte count printed and a minimum
 *     guarded. `git checkout --` is never used: it restores to HEAD, not to
 *     what was there, and has twice discarded a session's own uncommitted work.
 *   - A SURPRISING GREEN IS A FINDING ABOUT THE ARM and is printed, not smoothed.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { controlPen } from "./pen.mjs";
import { ANCHOR_DRY, anchorPatch, anchorEach } from "../scripts/anchortable.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
/* THE PEN IS OUTSIDE THE WORKTREE (M0-182, BOB #32). `controlPen` is `mkdtempSync` under the system
   temp root, so neither the battery's discovery nor the fleet walk can enrol what it holds, and the
   tree stays CLEAN while the control runs — which matters because since D-293 a gate on a dirty tree
   RECORDS NOTHING. `mkdtemp`, not a fixed name, is what keeps it isolated: the shared scratchpad and
   `/tmp` are not isolated between sessions, and a harness there was once overwritten mid-turn by a
   concurrent worker. */
const SAFE = controlPen("sk7");
mkdirSync(SAFE, { recursive: true });

const STORE = join(PLANE, "src/store.mjs");
const INDEX = join(PLANE, "src/index.mjs");
const CHECKS = join(PLANE, "checks/bio-checks.mjs");
/* The SURFACE. Outside `bio-plane/` — the first file this harness arms that is,
   and named here rather than reached through a relative string at the arm. */
const APP = join(REPO, "civicos-ui/app.html");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;   // store.mjs is over a megabyte; a restore over a stub must fail loudly.

/* The subject: this item's own suite, run alone. Captured to a FILE-sized buffer
   and not a pipe the child can outrun — D-282: a suite that calls
   process.exit() discards unflushed PIPE writes, and a control whose tally
   reads -1 because of it reports the wrong arm as wrong. */
const PLANE_SUITE   = { cwd: PLANE, script: "test/content-machine-mint.test.mjs" };
/* THE SURFACE SUITE IS A SECOND SUBJECT, ADDED BY THE RESPAWN, and it is here
   because the item gained a surface between the two workers. UI-61 landed
   `legReferentHtml` while this harness's author was gone, so *labelled
   everywhere it is shown* acquired a screen to be shown on, and an arm that
   drops the label from that screen has to be judged by the suite that reads
   that screen. Run from the REPO root because every civicos-ui suite is. */
const SURFACE_SUITE = { cwd: REPO,  script: "civicos-ui/test/content-extent.test.mjs" };

const runSuite = (subject = PLANE_SUITE) => {
  const r = spawnSync(process.execPath, [subject.script],
    { cwd: subject.cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  /* A TypeError inside an assertion goes through no assertion at all and ends
     the module while the tally reads clean, so a MISSING tally is reported as
     -1 and never as 0 — the suite did not reach its own FOOT. */
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()) };
};

/** Apply exactly one textual patch, reporting the match count. */
function arm(file, find, replace) {
  if (ANCHOR_DRY) return (anchorPatch(file, find, replace), { armed: true, matches: 1 });   /* M0-197: read, never armed */
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that distinguishes all-arms-broken from all-arms-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },

  /* ARM (b). THE FENCE THIS ITEM CAME TO FIND. Restoring the body read puts the
     pre-SK-7 world back exactly: C-35.10 fires only for a caller that names
     itself a machine. BOTH mouths of the hole are declared — the machine
     attesting under a member's name, and the member's own act being attributed
     to whatever the body said — because an arm that caught only one of them
     would have passed on the pre-item tree. */
  attest: {
    files: [STORE],
    why: "restore the PRE-ITEM CODE at op=attesttext's DO route — the attestor read from the request "
       + "BODY instead of from the control plane's stamp — which is the world in which C-35.10 fired "
       + "only for a caller that volunteered a machine-shaped name",
    mustFail: ["the assistant's own credential cannot attest, naming a real member",
               "the assistant's own credential cannot attest, naming a principal string",
               "the MEMBER_TOKEN credential is refused the same way",
               "the ADMIN_TOKEN root of trust is refused the same way",
               "A MEMBER ATTESTS AND THE ACT LANDS, attributed to the signed-in member"],
    mustPass: "the two arms that were ALREADY holding before this item — the credential naming ITSELF "
            + "(`class:ai`) and the one naming NOBODY are still refused by C-35.10, which is exactly "
            + "why the fence looked present while it was not; and every mint, label and finding "
            + "assertion stays green, because this arm is about attestation and nothing else",
    /* THE ARM WAS RE-CUT AFTER ITS FIRST RUN AND THE FIRST CUT IS RECORDED,
       because the mistake is the one this whole harness exists to catch. It
       first neutered the STAMP in index.mjs — which leaves the attestor ABSENT
       rather than caller-supplied, so `checkAttestation` refused EVERYTHING
       including the member's own act. Four of five declared failures did not
       occur, and they did not occur because the arm had broken attestation
       outright: a gate that refuses everything reads as a fence holding. That
       is the identical shape the item itself found in the product, arriving in
       the control. The arm now restores the PRE-ITEM CODE at the DO route —
       the attestor read from the request BODY — which is what the world
       actually looked like, and the four machine arms then fail because the
       attestations LAND. */
    patch: () => arm(STORE,
      `        attesttext: () => this.attestText({ ...(body || {}),\n                                            member: url.searchParams.get("attestor") }),`,
      `        attesttext: () => this.attestText(body || {}),`),
  },

  /* ARM (c). THE LABEL, DROPPED FROM ONE SURFACE ONLY. `#contentStanding` feeds
     `op=content` and `earned.content`; `op=contentmint` and `op=promote` label
     through other call sites and stay LABELLED. So this arm is precisely the
     row's own NEGATIVE CONTROL line — *the label dropped from one surface* —
     and what must fail is the TOTALITY arm, NAMING the surface. An arm that
     dropped the label everywhere would not test that. */
  label: {
    files: [STORE],
    why: "delete the `mint:` line from `#contentStanding`, dropping the label from op=content and "
       + "from earned.content while op=contentmint and op=promote stay labelled — the row's own "
       + "declared control, a label dropped from ONE surface",
    /* THE DECLARATION WAS CORRECTED AFTER THIS ARM'S FIRST RUN, and the
       correction went to the DECLARATION rather than to the assertion — which
       is the direction WORKER.md's *a surprising green is a finding about your
       ARM* points in. The field-set pin was declared as a MUST FAIL and stayed
       GREEN, correctly: it destructures the `mint` block out before comparing,
       so it asks whether REC-83's OWN sixteen fields moved — and this arm does
       not move them. It belongs in MUST PASS, where it holds the arm open, and
       it is the assertion that would catch a label change that REWROTE an
       existing field instead of adding one. */
    mustFail: ["AND NOT ONE CONTENT ROW REACHED A CALLER UNLABELLED",
               "and the machine-minted row says out loud what it is",
               "while the row still says a machine marked it",
               "it is now IN the finding, and labelled there too"],
    mustPass: "op=contentmint's own answer and op=promote's content[] array stay labelled, so the "
            + "totality arm names TWO surfaces and not four — which is what makes the failure a "
            + "location and not a count; every fence and finding assertion stays green; and the "
            + "field-set pin STAYS GREEN because it compares REC-83's own fields with the label "
            + "block removed, so it measures a REWRITE and not an absence",
    patch: () => arm(STORE,
      `      mint: Store.#mintLabel(r.minted_by),\n      transcription, connection,`,
      `      transcription, connection,`),
  },

  /* ARM (d). 5.7's THIRD CLAUSE, and the arm exists because the clause is held
     STRUCTURALLY rather than by a check anyone could point at: the registry
     answers `earned.content` only over ids the CALLER named, and the callers
     that name them are bases of legs members authored. Make it answer over every
     row in the store and a passage nobody cited is suddenly in a finding. */
  finding: {
    files: [STORE],
    why: "make `earnedBasisRegistry` answer its content block over EVERY content row of the cited "
       + "documents rather than over the ids the caller named — the ordinary way a new reader "
       + "widens an answer, and the way 5.7's *part of a finding only when a member cites it* "
       + "would be lost without anyone deciding to lose it",
    mustFail: ["AND IT IS ABSENT FROM THE FINDING"],
    mustPass: "everything else — the row is still minted, still labelled, still unattestable; this "
            + "arm moves ONE property, which is what makes the failure attributable",
    patch: () => arm(STORE,
      `    if (Array.isArray(contentIds) && contentIds.length)\n      out.earned.content = this.#contentEarned(contentIds, out.earned.connection);`,
      `    if (Array.isArray(contentIds) && contentIds.length)\n      out.earned.content = this.#contentEarned(\n        this.#rows(\`SELECT content_id FROM content\`).map((r) => r.content_id),\n        out.earned.connection);`),
  },

  /* ARM (e). THE OVER-STRICTNESS DIRECTION, and its HELD-OPEN half is the whole
     point. Every content row that existed before this item was minted by the
     PLANE at promotion, as the referent of a citation a member authored. The
     arm makes the classifier answer `machine` for that value — the ordinary way
     a new classifier silently relabels an old row, and the exact failure that
     would have the record tell a member their own citation was machine work.
     Every MACHINE-side assertion must stay green, because a classifier that
     said `machine` for everything would otherwise read as a pass. */
  overstrict: {
    files: [CHECKS],
    why: "make `contentMintState` answer `machine` for the PLANE's own value, so a row minted as the "
       + "referent of a member's own citation is relabelled as the assistant's work — the direction "
       + "that OVERCLAIMS, and the one this item must not have taken",
    mustFail: ["A PLANE-MINTED ROW IS UNMOVED",
               "the PLANE's own mint is NOT machine work"],
    mustPass: "EVERY machine-side assertion — the mint, the `class:ai/<tokenId>` stamp, the label on "
            + "all four surfaces, C-35.10 on every credential class, and absent-until-cited. A "
            + "classifier that answered `machine` for everything would pass those, which is why "
            + "this arm's verdict is about the two failures AND about that green half together",
    patch: () => arm(CHECKS,
      `  if (s.toLowerCase() === CONTENT_MINTED_BY_PLANE) return 'plane_minted';`,
      `  if (s.toLowerCase() === CONTENT_MINTED_BY_PLANE) return 'machine_marked';`),
  },

  /* ARM (f). THE SURFACE, AND IT IS THE RESPAWN'S OWN ARM. The five arms above
     were declared and run against a tree on which `op=content` had NO consumer
     anywhere — measured, and true when it was measured. UI-61 landed one while
     this item's first worker was dead, so the plane's label began reaching a
     screen and being dropped there, and the row's own NEGATIVE CONTROL line —
     *the label dropped from ONE surface* — acquired a surface arm (c) cannot
     see, because arm (c) is judged by a plane suite that never opens the page.

     SO THE SUBJECT IS THE SURFACE SUITE. The arm removes the LABEL CALL from
     `legReferentHtml` and leaves `legMintLabelHtml` itself intact — which is
     the realistic failure (a renderer that stops asking, not a helper that
     disappears), and the one a reader merging two branches actually produces.
     THE HELD-OPEN HALF IS THE POINT: every other assertion in that suite —
     UI-61's own `ref`, jump, stale-pane and the §7 over-strictness DIGEST —
     must stay green, because an arm that broke the whole renderer would fail
     the label assertions for a reason that has nothing to do with the label. */
  uilabel: {
    files: [APP],
    subject: SURFACE_SUITE,
    why: "remove the mint label's CALL SITE from `legReferentHtml` in civicos-ui/app.html, so the "
       + "plane still composes the label on every projection and the ONE surface that shows a "
       + "content row to a member stops rendering it — the row's declared control, taken on the "
       + "surface that did not exist when the other five were declared",
    mustFail: ["a machine-minted row is LABELLED on the surface a member reads it on",
               "and the sentence is the PLANE's own, verbatim"],
    mustPass: "every other assertion in UI-61's suite, and the §7 OVER-STRICTNESS DIGEST above all "
            + "— a leg with no referent must still render byte-identically to the pristine tree at "
            + "ce6e7cf, which is what says this arm removed a label and did not damage a renderer; "
            + "and the four NEGATIVE arms of §8 (plane-minted, member-marked, unstated, and the "
            + "machine-shaped `by` with `machine_work: false`) stay green for the uninteresting "
            + "reason that they assert the ABSENCE this arm makes universal",
    /* SINGLE-QUOTED, NOT A TEMPLATE LITERAL, and that is not a style choice:
       the text being matched IS `${...}` interpolation, and writing it in
       backticks would have this harness substitute variables that do not exist
       here instead of matching the source. The other arms above are backticked
       because none of their text contains a `${`. */
    patch: () => arm(APP,
      '${jump}</div>${legMintLabelHtml(s)}`;',
      '${jump}</div>`;'),
  },
};

anchorEach(ARMS, (a) => a.patch());   /* M0-197: tools/anchordrift.mjs reads the arms' anchors; a no-op otherwise */

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
  const armed = a.patch();
  console.log(`  ARMED      ${armed.armed ? "yes" : "NO"}  (patch matched ${armed.matches}×)`);
  if (!armed.armed && name !== "baseline") {
    console.log(`  FINDING    the arm DID NOT ARM. An arm that did not arm is a finding, never a retry.`);
    finding++;
  }
  const r = runSuite(a.subject || PLANE_SUITE);
  console.log(`  RESULT     ${r.pass} pass, ${r.fail} fail, exit ${r.exit}`);
  for (const l of r.failing) console.log(`             ${l}`);
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
    const ok = r.fail > 0 && hit.length === a.mustFail.length;
    console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present, ${r.fail} total failing`);
    if (!ok) {
      finding++;
      for (const m of a.mustFail.filter((x) => !r.failing.some((l) => l.includes(x))))
        console.log(`  MISSING    declared failure did NOT occur: ${m}`);
    }
  }
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);
