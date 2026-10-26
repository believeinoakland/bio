/* The answers this module publishes for its users' tests (K4990, K4993, K4995, K5044): each is made by this module's real
   code when the test runs, never stored. A user's test takes its value from here instead of building the answer by hand. */
import { seeded, imp, caseFile, door, V, SOURCE, CASE, LENS, F1, F2, F3 } from "./fixture.mjs";
import { docketAddressOf, caseImportOps } from "../../../src/case-import/index.mjs";
import { importedFindingRef } from "../../../src/inquiry-grammar/index.mjs";
import { world as citationWorld, V as citationV } from "../citation/fixture.mjs";
import { citationOps } from "../../../src/citation/index.mjs";
import { acceptedWorkOf } from "../../../src/accepted-work/index.mjs";

const g = (grade) => ({ state: "graded", grade });
const BY = "alice";

/* R1, R6, R7, R8, R9, R4: the real `caseImportOf` over seeded imports. `imports` is a list of
   `{group, case, lens, findings, editions: [{edition, accepted: [finding], flags: [{finding, issue, clear}], withdrawn}]}`
   (all but `editions` defaulted); each edition is imported in order with `importCaseFile` as a member does, then accepted
   with `acceptImported`, flagged with `flagImported` (and cleared with `clearFlag` when `clear` is given), and its
   acceptance withdrawn with `withdrawAcceptance` when `withdrawn` is set. Every act is the module's own and is checked to
   have been done. Answers the world (`w`, `ci`) and, per import, its id and the flag ids it raised, by edition. */
export async function importedWorld({ imports = [{ editions: [{ edition: 1, accepted: [F1] }] }], who = BY } = {}) {
  const w = seeded();
  const out = [];
  for (const spec of imports) {
    const { group = SOURCE, case: caseId = CASE, lens = LENS, findings = [F1, F2, F3], editions = [{ edition: 1 }] } = spec;
    const entry = { group, case: caseId, import: null, editions: {} };
    for (const ed of editions) {
      const pairs = Object.fromEntries(findings.map((f) => [f, { capture: g("B"), connection: g("C") }]));
      const r = await imp(w, caseFile({ group, case: caseId, edition: ed.edition, lens, findings, pairs }), who);
      if (r.ok !== true) throw new Error(`importedWorld: the import was refused: ${JSON.stringify(r).slice(0, 300)}`);
      entry.import = r.import;
      const done = { flags: [] };
      if (ed.accepted?.length) {
        const a = w.ci.acceptImported({ import: r.import, edition: ed.edition, findings: ed.accepted, checked: "every passage against its document",
                                        reason: "We recreated it whole.", by: V(who), viewer: V(who) });
        if (a.ok !== true) throw new Error(`importedWorld: the acceptance was refused: ${JSON.stringify(a).slice(0, 300)}`);
      }
      for (const f of ed.flags ?? []) {
        const x = w.ci.flagImported({ import: r.import, edition: ed.edition, finding: f.finding ?? null, issue: f.issue, by: V(who), viewer: V(who) });
        if (x.ok !== true) throw new Error(`importedWorld: the flag was refused: ${JSON.stringify(x).slice(0, 300)}`);
        done.flags.push(x.flag);
        if (f.clear) {
          const c = w.ci.clearFlag({ flag: x.flag, reason: f.clear, by: V(who), viewer: V(who) });
          if (c.ok !== true) throw new Error(`importedWorld: the clearing was refused: ${JSON.stringify(c).slice(0, 300)}`);
        }
      }
      if (ed.withdrawn) {
        const x = w.ci.withdrawAcceptance({ import: r.import, edition: ed.edition, reason: ed.withdrawn, by: V(who), viewer: V(who) });
        if (x.ok !== true) throw new Error(`importedWorld: the withdrawal was refused: ${JSON.stringify(x).slice(0, 300)}`);
      }
      entry.editions[ed.edition] = done;
    }
    out.push(entry);
  }
  return { w, ci: w.ci, imports: out };
}

/* R9: the real reads of `openFlagsOn` and `acceptanceOf` when the store cannot be read: they never throw, and answer
   `{flags: [], complete: false}` and `null`. The store is the world's own database, closed. */
export async function openFlagsUnread() {
  const { w, ci, imports } = await importedWorld();
  const [{ import: id }] = imports;
  w.st.db.close();
  return { ci, import: id, flags: ci.openFlagsOn({ import: id, edition: 1 }), acceptance: ci.acceptanceOf({ import: id, edition: 1, finding: F1 }) };
}

/* R17, R18, R20: the real watches of `watchImport` over `n` imports (each of its own case, so its own import id) at the
   publishers given, with `watchedImports`' own pages, the real `recordDocketRead` refusal IMPORT_NOT_WATCHED for an
   import nobody watches, and `watchItems`' answer while no docket has been read. */
export async function watchedImports({ publishers = ["https://publisher1.example.org", "https://publisher2.example.org", "https://publisher3.example.org"], unwatched = true } = {}) {
  const w = seeded();
  const watched = [];
  for (const [i, publisher] of publishers.entries()) {
    const caseId = `CASE-2026-010${i + 1}`;
    const a = await imp(w, caseFile({ case: caseId }));
    if (a.ok !== true) throw new Error(`watchedImports: the import was refused: ${JSON.stringify(a).slice(0, 300)}`);
    const r = w.ci.watchImport({ import: a.import, publisher, by: V(BY), viewer: V(BY) });
    if (r.ok !== true) throw new Error(`watchedImports: the watch was refused: ${JSON.stringify(r).slice(0, 300)}`);
    watched.push({ import: a.import, case: caseId, publisher, docket: docketAddressOf(publisher, caseId) });
  }
  let notWatched = null;
  if (unwatched) {
    const a = await imp(w, caseFile({ case: "CASE-2026-0199" }));
    notWatched = { import: a.import, refusal: await w.ci.recordDocketRead({ import: a.import, docket: docketAddressOf("https://nobody.example.org", "CASE-2026-0199"),
                                                                            at: "2026-10-03T12:00:00Z", outcome: "unreadable", reason: "down" }) };
  }
  return { w, ci: w.ci, watched, notWatched, watches: w.ci.watchedImports({}), items: w.ci.watchItems({ viewer: V(BY) }) };
}

/* R4 (K5148; WALK-FINAL-10B R98): the real `importedCases` and `importedCase` of one imported case file whose case document
   states a `case_scope` and whose first two findings' files state a `title` (the third states none, so it answers `null`,
   never its id). Answers `{w, ci, scope, titles, import, list, one}`: the list and the case as the module answers them. */
export async function importedNamed({ scope = "Did the clerk stamp the contract before the vote?",
                                       titles = { [F1]: "The stamp predates the vote", [F2]: "The contract was signed in March" } } = {}) {
  const w = seeded();
  const r = await imp(w, caseFile({ scope, titles }));
  if (r.ok !== true) throw new Error(`importedNamed: the import was refused: ${JSON.stringify(r).slice(0, 300)}`);
  const list = w.ci.importedCases({ viewer: V(BY) });
  const one = w.ci.importedCase({ import: r.import, viewer: V(BY) });
  return { w, ci: w.ci, scope, titles, import: r.import, list, one };
}

/* K5175 (fix round 10): the answers of the five ops the screens and the door read: `importedcases`, `importedcase`,
   `rerunstart`, `rerunpair` and `rerunread`. Each is the door's answer (`caseImportOps`, the route the store calls) over
   the module's real methods, run over a world this module builds when called; nothing is stored, and each call builds its
   own world. A read whose fields are URL query parameters (`importedcase`) goes through `doorQuery`. */
const RERUN_PROJECT = "PRJ-2026-0001-rerun";
const RERUN_OWN = ["INQ-2026-0101-own-transfers", "INQ-2026-0102-own-contracts", "INQ-2026-0103-own-payroll"];
const RERUN_STATEMENTS = [
  { bundle: "BIA-src", id: "scrutiny-official-statements", kind: "scrutiny", subject: "official statements", text: "Check each official statement twice.", justification: "j", citations: [] },
  { bundle: "BIA-src", id: "pattern-late-filings", kind: "pattern", subject: "late filings", text: "Late filings are usual here.", justification: "j", citations: [] },
];
const RERUN_APPS = [{ finding: F1, ord: 0, target: "leg", statement: "scrutiny-official-statements", effect: "grade_lowered", from: "B", to: "C" }];
const own = (cap, con) => ({ capture: cap ? g(cap) : { state: "unrated", grade: null }, connection: con ? g(con) : { state: "unrated", grade: null } });
const ALICE = { viewer: V(BY), by: V(BY) };

function doorQuery(w, op, { viewer = null, ...params } = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...params, viewer })) if (v !== null && v !== undefined) q.set(k, String(v));
  return caseImportOps(w.ci, new URL(`http://x/?${q}`), {})[op]();
}

/* R4 (importedcases): the list of two imports, one of them with a withdrawn acceptance, as the door answers it to an
   active member. Answers `{w, answer}`. */
export async function importedCasesAnswer() {
  const { w } = await importedWorld({ imports: [
    { editions: [{ edition: 1, accepted: [F1] }, { edition: 2, accepted: [F1, F2], flags: [{ finding: F1, issue: "page 3 is misread" }] }] },
    { group: "other-group", case: "CASE-2026-0900", lens: "b2".repeat(32), editions: [{ edition: 1, accepted: [F1], withdrawn: "the source corrected it" }] },
  ] });
  return { w, answer: door(w, "importedcases", { viewer: V(BY) }) };
}

/* R4 (importedcase): one import of two editions, the second accepted in part and flagged, as the door answers it to an
   active member. `edition` names one (null: the latest). Answers `{w, import, answer}`. */
export async function importedCaseAnswer({ edition = null } = {}) {
  const { w, imports } = await importedWorld({ imports: [
    { editions: [{ edition: 1, accepted: [F1] }, { edition: 2, accepted: [F1, F2], flags: [{ finding: F1, issue: "page 3 is misread" }] }] },
  ] });
  const [{ import: importId }] = imports;
  return { w, import: importId, answer: doorQuery(w, "importedcase", { viewer: V(BY), import: importId, edition }) };
}

/* the rerun world (R29–R31): an import of one case whose first finding a re-check lowers (`RERUN_APPS`), a project alice
   owns and bob has joined, and three of its own findings. Answers `{w, import}`. */
async function rerunWorld() {
  const w = seeded();
  w.script.set(F1, { role: "load_bearing", result: "recreated", pair: { capture: g("C"), connection: g("C") } });
  const a = await imp(w, caseFile({ apps: RERUN_APPS, printedLens: RERUN_STATEMENTS }));
  if (a.ok !== true) throw new Error(`rerunWorld: the import was refused: ${JSON.stringify(a).slice(0, 300)}`);
  w.project(RERUN_PROJECT, { owner: BY, joined: ["bob"] });
  w.ownFinding(RERUN_PROJECT, RERUN_OWN[0], own("B", "C"));
  w.ownFinding(RERUN_PROJECT, RERUN_OWN[1], own("B", "C"));
  w.ownFinding(RERUN_PROJECT, RERUN_OWN[2], own(null, null));
  return { w, import: a.import };
}

/* R29 (rerunstart): the owner declares the project a re-run of edition 1 of the import. `twice` makes the second, refused
   declaration the answer (RERUN_ALREADY). Answers `{w, import, answer}`. */
export async function rerunStartAnswer({ twice = false } = {}) {
  const { w, import: importId } = await rerunWorld();
  const start = () => door(w, "rerunstart", { ...ALICE, project: RERUN_PROJECT, import: importId, edition: 1 });
  const first = start();
  return { w, import: importId, answer: twice ? start() : first };
}

/* R30 (rerunpair): the project's own finding (`own`, default the first) is paired with the import's first finding, after the
   re-run is declared; `withdraw` takes the pairing back instead. Answers `{w, import, answer}`. */
export async function rerunPairAnswer({ own: ownFinding = RERUN_OWN[0], withdraw = false } = {}) {
  const { w, import: importId } = await rerunStartAnswer();
  const answer = door(w, "rerunpair", { ...ALICE, project: RERUN_PROJECT, source_finding: importedFindingRef(importId, F1),
                                         own_finding: ownFinding, withdraw });
  return { w, import: importId, answer };
}

/* R31 (rerunread): the project's re-runs read after the pairing (`paired: true`), or after the declaration alone (`paired:
   false`, the source finding then pairs with nothing). Answers `{w, import, answer}`. */
export async function rerunReadAnswer({ paired = true } = {}) {
  const { w, import: importId } = paired ? await rerunPairAnswer() : await rerunStartAnswer();
  return { w, import: importId, answer: door(w, "rerunread", { viewer: V(BY), project: RERUN_PROJECT }) };
}

/* K5195 (fix round 11): the answer of `importregrade`, the read of one imported edition under a lens: the source's own
   edition with one lowered grade (F1's capture, lowered from B to C by `RERUN_APPS`' statement), read through the door
   (`caseImportOps`) over the module's real `regradeImported` in a world this module builds when called. `lens` is one of
   as_published, removed or own; nothing is stored, and each call builds its own world. Answers `{w, import, answer}`. */
export async function importRegradeAnswer({ lens = "removed" } = {}) {
  const w = seeded();
  w.script.set(F1, { role: "load_bearing", result: "recreated", pair: { capture: g("C"), connection: g("C") } });
  w.bar({ capture: "B", connection: "C" });
  const a = await imp(w, caseFile({ apps: RERUN_APPS, printedLens: RERUN_STATEMENTS }));
  if (a.ok !== true) throw new Error(`importRegradeAnswer: the import was refused: ${JSON.stringify(a).slice(0, 300)}`);
  return { w, import: a.import, answer: door(w, "importregrade", { viewer: V(BY), import: a.import, edition: 1, lens }) };
}

/* R16 (citeimported; fix round 10, K5175): the door's answer to citation's `citeimported`, a question resting on an accepted
   finding of this module's import at the edition shown. Citation is earlier in the order, so it cannot publish this answer
   (its fixture would import this module's test support); this module builds it, over its own real accepted import (edition 1
   with F1 accepted) and citation's real module on a world of its own, whose accepted-work service has this module's five
   providers registered as `start` registers them. The viewer reads this module's acceptance, so is a member of both groups.
   Answers `{w, caseImport, import, finding, edition, ref, answer}`: the citation world, this module's world, the import, the
   finding, its edition, the ref the basis carries, and the door's answer. Nothing is stored; each call builds its own worlds. */
const CITE_Q = "INQ-2026-0001-q";
export async function citeimportedAnswer({ role = "supports", note = "the audit is public", finding: chosen = F1 } = {}) {
  const caseImport = await importedWorld({ imports: [{ editions: [{ edition: 1, accepted: [F1] }] }] });
  const [{ import: importId }] = caseImport.imports;
  const finding = chosen, edition = 1, ref = importedFindingRef(importId, finding);
  const w = citationWorld({ inquiry: true, members: ["ann", "alice"] });
  w.inquiry(CITE_Q);
  const ci = caseImport.ci;
  const reg = acceptedWorkOf(w.host).registerAcceptedWork("case-import", {
    finding: (q) => ci.findingFacts(q || {}),
    openFlags: (q) => ci.openFlagsFacts(q || {}),
    withdrawals: (q) => ci.withdrawals(q || {}),
    moves: (q) => ci.moves(q || {}),
    flagHistory: (q) => ci.flagHistoryFacts(q || {}),
  });
  if (reg?.ok !== true) throw new Error(`citeimportedAnswer: the registration of case-import was refused: ${JSON.stringify(reg).slice(0, 300)}`);
  const q = new URLSearchParams({ inquiry: CITE_Q, import: importId, finding, edition: String(edition), role, note,
                                  viewer: citationV("alice"), author: "member:alice", identity: citationV("alice") });
  const answer = citationOps(w.cit, new URL(`http://x/?${q}`)).citeimported();
  return { w, caseImport: caseImport.w, import: importId, finding, edition, ref, answer };
}
