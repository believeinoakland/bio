/* Fix round 10 (K5044): the answers this module publishes in fixtures.mjs, each called and its real answer checked. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { importedWorld, openFlagsUnread, watchedImports } from "./fixtures.mjs";
import { SOURCE, CASE, F1, F2, V } from "./fixture.mjs";

test("R6 R7 R8 R9 importedWorld: the real importCaseFile, acceptImported, flagImported, clearFlag and withdrawAcceptance leave what acceptanceOf and openFlagsOn read", async () => {
  const { ci, imports } = await importedWorld({ imports: [
    { editions: [{ edition: 1, accepted: [F1] },
                 { edition: 2, accepted: [F1, F2], flags: [{ finding: F1, issue: "page 3 is misread" }, { finding: null, issue: "the whole thing is late", clear: "it is not" }] }] },
    { group: "other-group", case: "CASE-2026-0900", lens: "b2".repeat(32), editions: [{ edition: 1, accepted: [F1], withdrawn: "the source corrected it" }] },
  ] });
  const [a, b] = imports;
  assert.notEqual(a.import, b.import);
  assert.deepEqual([a.group, a.case, b.group, b.case], [SOURCE, CASE, "other-group", "CASE-2026-0900"]);
  assert.notEqual(ci.acceptanceOf({ import: a.import, edition: 1, finding: F1 }), null);
  assert.notEqual(ci.acceptanceOf({ import: a.import, edition: 2, finding: F2 }), null);
  assert.equal(ci.acceptanceOf({ import: a.import, edition: 1, finding: F2 }), null, "a finding not accepted");
  assert.equal(ci.acceptanceOf({ import: b.import, edition: 1, finding: F1 }), null, "withdrawn: counts for nothing again");
  const open = ci.openFlagsOn({ import: a.import, edition: 2 });
  assert.equal(open.complete, true);
  assert.deepEqual(open.flags.map((f) => [f.flag, f.finding, f.issue]), [[a.editions[2].flags[0], F1, "page 3 is misread"]], "the cleared flag is no longer open");
  assert.deepEqual(ci.openFlagsOn({ import: a.import, edition: 1 }), { flags: [], complete: true });
  assert.equal(ci.importedCase({ import: a.import, edition: 2, viewer: V("alice") }).ok, true);
  assert.equal(ci.importedCase({ import: a.import, edition: 9, viewer: V("alice") }).reason, "IMPORT_NO_SUCH_EDITION");
});

test("R9 openFlagsUnread: the real reads of a store that cannot be read answer {flags: [], complete: false} and null, and do not throw", async () => {
  const r = await openFlagsUnread();
  assert.deepEqual(r.flags, { flags: [], complete: false });
  assert.equal(r.acceptance, null);
  const sound = await importedWorld();
  assert.equal(sound.ci.openFlagsOn({ import: sound.imports[0].import, edition: 1 }).complete, true, "control: a readable store is complete");
  assert.notEqual(sound.ci.acceptanceOf({ import: sound.imports[0].import, edition: 1, finding: F1 }), null, "control: the acceptance reads");
});

test("R17 R18 R20 watchedImports: the real watches in import order, the real IMPORT_NOT_WATCHED refusal of recordDocketRead, and watchItems with nothing read", async () => {
  const f = await watchedImports();
  assert.equal(f.watched.length, 3);
  assert.deepEqual(f.watches.watches.map((x) => x.import), f.watched.map((x) => x.import).sort());
  assert.deepEqual(f.watches.watches.map((x) => x.docket).sort(), f.watched.map((x) => x.docket).sort());
  assert.equal(f.watches.watches.every((x) => x.last_read === null && x.set_by), true, "never read");
  const page = f.ci.watchedImports({ limit: 2 });
  assert.deepEqual([page.watches.length, page.cursor], [2, page.watches[1].import]);
  assert.equal(f.notWatched.refusal.ok, false);
  assert.equal(f.notWatched.refusal.reason, "IMPORT_NOT_WATCHED");
  assert.deepEqual(f.items, { entries: [], refused: [], unreadable: [] });
  const none = await watchedImports({ publishers: [], unwatched: false });
  assert.deepEqual([none.watches.watches, none.notWatched], [[], null]);
});
