/* The answers this module publishes for its users' tests (K4990, K4993, K4995, K5044): each is made by this module's real
   code when the test runs, never stored. A user's test takes its value from here instead of building the answer by hand. */
import { seeded, imp, caseFile, V, SOURCE, CASE, LENS, F1, F2, F3 } from "./fixture.mjs";
import { docketAddressOf } from "../../../src/case-import/index.mjs";

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
