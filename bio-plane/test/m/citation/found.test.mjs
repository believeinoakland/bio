/* citation: citing a passage "Find in this" turned up (`found`, retrieval R73's match) with the optional question it
   was looked for for (R1, R3; T35-42, N698, DEC-164 (4), (5)), and the words members read (R12; DEC-149), at the
   module's interface. Every `found` here is what the real `retrieval.findIn` answers over the fixture's captures, or
   that match with one field changed. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, STAMP, sha, projMd, NOW } from "./fixture.mjs";
import { Citation, CITE_CHECKS, CITE_EXTENT_CHECKS, foundExtentBag } from "../../../src/citation/index.mjs";

const ANN = { viewer: V("ann"), owner: "o", author: "member:ann", identity: V("ann") };
const VERA = { viewer: V("vera"), owner: "v", author: "member:vera", identity: V("vera") };

const carries = (r, family, code) => {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 300));
  assert.equal(r.reason, code);
  assert.equal(r.check, family[code].check);
  assert.equal(r.translation, family[code].translation);
};
const blockOf = (md, key) => {
  const m = new RegExp(`\\n${key}:\\n((?:  .*\\n)+)`).exec(md);
  return m ? m[1] : null;
};

/* A document with one capture whose second page says "budget", the real match for it, and two questions. */
function setup() {
  const w = world();
  const cap = w.info("INFO-2026-0001");
  w.info("INFO-2026-0002");
  const [match] = w.find("INFO-2026-0001", "budget", { pages: { [cap]: ["Nothing here.", "The budget line is set."] } });
  assert.deepEqual([match.capture_sha, match.extent, match.origin], [cap, { kind: "pdf-page", page: 1 }, "search"]);
  w.inquiry("INQ-2026-0001");
  w.inquiry("INQ-2026-0002");
  return { w, cap, match, p: w.project(), q: "INQ-2026-0001" };
}

test("R1, R2: a found match cited onto a question writes the leg byte-identical to a selection of its one document with that part, pinned to the capture it was found in", async () => {
  const { w, cap, match } = setup();
  const h = await w.select(["INFO-2026-0001"]);
  const byHandle = w.cit.cite({ project: "INQ-2026-0001", handle: h, ...ANN, role: "supports", note: "n",
                                extent: { extent_kind: "pdf-page", extent_page: "1" } });
  const byFound = w.cit.cite({ project: "INQ-2026-0002", found: match, ...ANN, role: "supports", note: "n" });
  assert.equal(byFound.ok, true, JSON.stringify(byFound).slice(0, 300));
  assert.equal(blockOf(w.md("INQ-2026-0002"), "basis"), blockOf(w.md("INQ-2026-0001"), "basis"));
  assert.equal(blockOf(w.md("INQ-2026-0002"), "basis"),
    `  - target: INFO-2026-0001\n    role: supports\n    note: "n"\n    extent_kind: "pdf-page"\n    extent_capture: "${cap}"\n    extent_page: 1\n`);
  assert.deepEqual(blockOf(w.md("INQ-2026-0002"), "references"), blockOf(w.md("INQ-2026-0001"), "references"));
  assert.deepEqual(byFound.legs, byHandle.legs);
  assert.deepEqual([byFound.cited, byFound.legs[0].pinned_capture, byFound.legs[0].extent], [["INFO-2026-0001"], cap, { kind: "pdf-page", page: 1 }]);
  /* The words are the search's and are never written: only the capture and the part are read. */
  assert.doesNotMatch(w.md("INQ-2026-0002"), /budget line/);
  const odd = w.cit.cite({ project: w.inquiry("INQ-2026-0003"), found: { ...match, words: "anything at all", kind: "money" }, ...ANN, role: "supports", note: "n" });
  assert.equal(odd.ok, true);
  assert.equal(blockOf(w.md("INQ-2026-0003"), "basis"), blockOf(w.md("INQ-2026-0002"), "basis"));
});

test("R1: the found extent is the part bag a named part arrives in, field for field", () => {
  assert.deepEqual(foundExtentBag({ kind: "pdf-page", page: 3, rect: [1, 2.5, 30, 40], ref: "table 2" }),
                   { extent_kind: "pdf-page", extent_page: "3", extent_rect: "[1, 2.5, 30, 40]", extent_ref: "table 2" });
  assert.deepEqual(foundExtentBag({ kind: "sheet-range", sheet: "Budget", range: "B2:B9", space: null }),
                   { extent_kind: "sheet-range", extent_sheet: "Budget", extent_range: "B2:B9" });
  assert.deepEqual(foundExtentBag({ kind: "pdf-page", space: "user", undetermined: { level: "page" } }),
                   { extent_kind: "pdf-page", extent_space: "user", extent_undetermined: '{"level":"page"}' });
});

test("R1: CITE_ONE_SOURCE (C-45.14), first and writing nothing, for both a selection and a found, for neither, and for a found beside a named part", async () => {
  const { w, match, q, p } = setup();
  const h = await w.select(["INFO-2026-0001"]);
  const snap = w.snapshot();
  for (const args of [{ handle: h, found: match }, {}, { handle: null, found: null }, { handle: "", found: undefined },
                      { found: match, extent: { extent_kind: "pdf-page", extent_page: "1" } }]) {
    /* Asked before anything: a bad note, an absent citing object and a bad question do not come first. */
    carries(w.cit.cite({ project: "PROJ-2026-0000-none", ...ANN, role: "supports", note: '"', question: "nope", ...args }),
            CITE_EXTENT_CHECKS, "CITE_ONE_SOURCE");
  }
  assert.deepEqual(w.snapshot(), snap, "nothing written");
  /* Negative controls: each source alone cites; empty part fields beside a found are no part. */
  assert.equal(w.cit.cite({ project: p, handle: h, ...ANN }).ok, true);
  assert.equal(w.cit.cite({ project: q, found: match, extent: { extent_kind: "", extent_page: " " }, ...ANN, role: "supports" }).ok, true);
});

test("R1, R9: FOUND_MALFORMED (C-45.15) for a found naming no capture, no part, or no document — a capture held nowhere and one held in a document the viewer may not see answered alike", async () => {
  const { w, match, q } = setup();
  /* A capture in a project only ann sees. */
  const hidden = { path: "snapshots/h.txt", text: "hidden bytes", sha: sha("hidden bytes") };
  const proj = w.put(null, projMd("Hidden case"), { author: V("ann"), owner: "ann", captures: [hidden] }).bundleId;
  const snap = w.snapshot();
  const answers = [];
  for (const found of [{ ...match, capture_sha: undefined }, { ...match, capture_sha: "not-a-sha" }, { ...match, extent: null },
                       { ...match, extent: { page: 1 } }, { ...match, extent: { kind: " " } }, "a string", [], 7,
                       { ...match, capture_sha: "f".repeat(64) }, { ...match, capture_sha: hidden.sha }]) {
    const r = w.cit.cite({ project: q, found, ...VERA, role: "supports" });
    carries(r, CITE_EXTENT_CHECKS, "FOUND_MALFORMED");
    answers.push(r);
  }
  assert.deepEqual(w.snapshot(), snap, "nothing written");
  /* Held nowhere and unseen: the same answer, byte for byte. */
  assert.deepEqual(answers.at(-1), answers.at(-2));
  assert.deepEqual(answers.at(-1).missing, ["document"]);
  /* An upper-case spelling of a held capture is the capture. */
  assert.equal(w.cit.cite({ project: q, found: { ...match, capture_sha: match.capture_sha.toUpperCase() }, ...VERA, role: "supports" }).ok, true);
  /* Control: ann sees the project, so its capture names a document, and the member is judged as any member is —
     a case is not citable. */
  const seen = w.cit.cite({ project: q, found: { ...match, capture_sha: hidden.sha, extent: { kind: "document" } }, ...ANN, role: "supports" });
  assert.deepEqual([seen.reason, seen.offenders], ["NOT_CITABLE", [proj]]);
});

test("R1: FOUND_CAPTURE_MOVED (C-45.16) for a match found in a capture other than the one the leg would be pinned to, naming both, nothing written", async () => {
  const { w, cap, q } = setup();
  /* A second capture of the same document: a leg on it is pinned to one of the two (content.captureFor, R2), and a
     match in the other is refused. */
  const newer = { path: "snapshots/b.txt", text: "newer bytes of INFO-2026-0001", sha: sha("newer bytes of INFO-2026-0001") };
  const first = { path: "snapshots/a.txt", text: "the bytes of INFO-2026-0001", sha: cap };
  w.put("INFO-2026-0001", w.md("INFO-2026-0001"), { captures: [first, newer] });
  const pinned = w.content.captureFor("INFO-2026-0001");
  const other = pinned === cap ? newer.sha : cap;
  assert.ok([cap, newer.sha].includes(pinned));
  const matches = w.find("INFO-2026-0001", "budget", { pages: { [newer.sha]: ["A budget page."] } });
  const [inOther] = matches.filter((m) => m.capture_sha === other);
  const [inPinned] = matches.filter((m) => m.capture_sha === pinned);
  assert.ok(inOther && inPinned, "a match in each capture (a control)");
  const before = w.md(q);
  const r = w.cit.cite({ project: q, found: inOther, ...ANN, role: "supports" });
  carries(r, CITE_EXTENT_CHECKS, "FOUND_CAPTURE_MOVED");
  assert.deepEqual([r.document, r.found_capture, r.pinned_capture], ["INFO-2026-0001", other, pinned]);
  assert.equal(w.md(q), before);
  /* Control: the match in the capture the record cites is cited. */
  const ok = w.cit.cite({ project: q, found: inPinned, ...ANN, role: "supports" });
  assert.deepEqual([ok.ok, ok.legs[0].pinned_capture], [true, pinned]);
});

test("R1: the found document and part meet every refusal a member and a part meet — EXTENT_NOT_APPLICABLE on a project, a retired document, a severed edge, an unknown field, an unwritable value, the leg grammar", async () => {
  const { w, cap, match, p, q } = setup();
  /* On a case a found extent is a part, refused as any part is (C-45.8). */
  const onP = w.cit.cite({ project: p, found: match, ...ANN });
  carries(onP, CITE_EXTENT_CHECKS, "EXTENT_NOT_APPLICABLE");
  assert.deepEqual(onP.got, ["extent_kind", "extent_page"]);
  /* A part field no leg carries is refused by name, never dropped. */
  const unk = w.cit.cite({ project: q, found: { ...match, extent: { ...match.extent, space: "user" } }, ...ANN, role: "supports" });
  carries(unk, CITE_EXTENT_CHECKS, "UNKNOWN_EXTENT_FIELD");
  assert.deepEqual(unk.got, ["extent_space"]);
  carries(w.cit.cite({ project: q, found: { ...match, extent: { ...match.extent, ref: 'say "this"' } }, ...ANN, role: "supports" }),
          CITE_EXTENT_CHECKS, "BAD_EXTENT_VALUE");
  assert.equal(w.cit.cite({ project: q, found: { ...match, extent: { kind: "dom" } }, ...ANN, role: "supports" }).reason, "BASIS_REFUSED");
  /* The role, the note and sight of the citing object, as with a selection. */
  carries(w.cit.cite({ project: q, found: match, ...ANN }), CITE_CHECKS, "NO_ROLE");
  carries(w.cit.cite({ project: q, found: match, ...ANN, role: "supports", note: '"' }), CITE_CHECKS, "BAD_NOTE");
  assert.equal(w.cit.cite({ project: p, found: match, ...VERA }).reason, "NO_SUCH_PROJECT");
  /* A severed edge on the case, a retired document on the question. */
  const h = await w.select(["INFO-2026-0001"]);
  w.cit.cite({ project: p, handle: h, ...ANN });
  w.cit.sever({ project: p, handle: h, ...ANN, reason: "cut" });
  carries(w.cit.cite({ project: p, found: { ...match, extent: { kind: "document" } }, ...ANN }), CITE_CHECKS, "SEVERED_EDGE");
  const old = w.info("INFO-2026-0003", { state: "retired" });
  const [inRetired] = w.find("INFO-2026-0003", "budget", { pages: { [old]: ["The budget, as it was."] } });
  const ret = w.cit.cite({ project: q, found: inRetired, ...ANN, role: "supports" });
  carries(ret, CITE_CHECKS, "RETIRED_NOT_CITABLE");
  assert.deepEqual(ret.offenders, ["INFO-2026-0003"]);
  assert.equal(cap, match.capture_sha);
});

test("R1: an already-cited found document is reported, not rewritten; its part is said to have been written nowhere", () => {
  const { w, match, q } = setup();
  assert.equal(w.cit.cite({ project: q, found: match, ...ANN, role: "supports" }).ok, true);
  const snap = w.snapshot();
  const again = w.cit.cite({ project: q, found: match, ...ANN, role: "supports" });
  assert.deepEqual([again.ok, again.cited, again.alreadyCited, again.handle, again.drift, again.moved, again.question],
                   [true, [], ["INFO-2026-0001"], null, false, false, null]);
  assert.match(again.detail, /written NOWHERE/);
  assert.deepEqual(w.snapshot(), snap);
});

test("R1: the question — NO_SUCH_QUESTION (C-33.52) alike for an absent id and one the viewer may not see, NOT_AN_INQUIRY (C-33.53) for a seen item that is not a question, each writing nothing; a seen question changes no other judgement", async () => {
  const { w, match, p, q } = setup();
  const hiddenCase = w.project("Hidden", "ann");
  const h = await w.select(["INFO-2026-0002"], { viewer: V("vera"), owner: "v" });
  const snap = w.snapshot();
  const absent = w.cit.cite({ project: q, handle: h, ...VERA, role: "supports", question: "INQ-2026-9999" });
  const unseen = w.cit.cite({ project: q, handle: h, ...VERA, role: "supports", question: hiddenCase });
  carries(absent, CITE_CHECKS, "NO_SUCH_QUESTION");
  carries(unseen, CITE_CHECKS, "NO_SUCH_QUESTION");
  assert.deepEqual({ ...unseen, question: null }, { ...absent, question: null }, "an unseen item answers as an absent one");
  /* No viewer sees nothing, a real question included. */
  carries(w.cit.cite({ project: q, handle: h, viewer: null, owner: "v", role: "supports", question: "INQ-2026-0002" }),
          CITE_CHECKS, "NO_SUCH_QUESTION");
  /* Seen, but not a question: a document, and a case its viewer sees. */
  for (const what of ["INFO-2026-0001", hiddenCase]) {
    const r = w.cit.cite({ project: q, found: match, ...ANN, role: "supports", question: what });
    carries(r, CITE_CHECKS, "NOT_AN_INQUIRY");
    assert.equal(r.question, what);
  }
  /* Asked after the source and before the selection and the citing object. */
  assert.equal(w.cit.cite({ project: "PROJ-2026-0000-none", handle: "sel-000000000000000000000000", ...ANN, question: "INQ-2026-9999" }).reason, "NO_SUCH_QUESTION");
  carries(w.cit.cite({ project: q, found: { ...match, extent: null }, ...ANN, question: "INQ-2026-9999" }), CITE_EXTENT_CHECKS, "FOUND_MALFORMED");
  assert.deepEqual(w.snapshot(), snap, "nothing written");
  /* Control: a seen question, on either source and either arm, changes nothing else: a part on a case is still refused. */
  carries(w.cit.cite({ project: p, found: match, ...ANN, question: "INQ-2026-0002" }), CITE_EXTENT_CHECKS, "EXTENT_NOT_APPLICABLE");
  const ok = w.cit.cite({ project: q, found: match, ...ANN, role: "supports", question: " INQ-2026-0002 " });
  assert.deepEqual([ok.ok, ok.question], [true, "INQ-2026-0002"]);
  assert.equal(w.cit.cite({ project: p, handle: await w.select(["INFO-2026-0002"]), ...ANN, question: "INQ-2026-0002" }).question, "INQ-2026-0002");
});

test("R3: with found the Session Log names the match's document and says the part was found by search, drift and moved answer false and handle null; with a question the entry names it and the answer carries it", async () => {
  const { w, cap, match, p, q } = setup();
  const r = w.cit.cite({ project: q, found: match, ...ANN, role: "supports", note: "the line", question: "INQ-2026-0002" });
  assert.equal(r.ok, true);
  assert.deepEqual([r.handle, r.drift, r.moved, r.question, r.weight, r.gate, r.expires], [null, false, false, "INQ-2026-0002", "report", null, null]);
  assert.deepEqual(Object.keys(r).sort(), ["alreadyCited", "bundleSha", "cited", "citingObjectType", "drift", "expires", "gate",
    "gradesFilled", "gradesUndetermined", "handle", "legs", "moved", "ok", "project", "question", "role", "rowVersion", "severed", "weight"].sort());
  assert.equal(w.fm(q).last_updated, STAMP);
  assert.match(w.md(q), new RegExp(`## Session Log\\n\\n### Session ${STAMP} \\| Rested this question on 1 record \\(supports\\) \\| member:ann\\n`
    + `Trigger: a part of INFO-2026-0001 found by search in capture ${cap}; for question INQ-2026-0002\\n`
    + `Changes: basis legs added for INFO-2026-0001, each with role supports\\. Grades: 0 filled from the record's own `
    + `resolutions to this question's subject; 1 left undetermined and stated\\. Note: the line\\.\\n\\n## Review Notes`));
  /* Without a question the entry names none; on a case, a selection with a question names it after the selection. */
  const q2 = w.inquiry("INQ-2026-0005");
  w.cit.cite({ project: q2, found: match, ...ANN, role: "supports" });
  assert.match(w.md(q2), new RegExp(`\\nTrigger: a part of INFO-2026-0001 found by search in capture ${cap}\\nChanges:`));
  const h = await w.select(["INFO-2026-0002"]);
  w.cit.cite({ project: p, handle: h, ...ANN, question: "INQ-2026-0001" });
  assert.match(w.md(p), new RegExp(`\\nTrigger: selection ${h}; for question INQ-2026-0001\\nChanges: cites edges added to INFO-2026-0002\\.\\n`));
});

test("R7: a found is cited at report weight, whatever the caller sends", () => {
  const { w, match, q } = setup();
  const r = w.cit.cite({ project: q, found: match, ...ANN, role: "supports", weight: "refuse" });
  assert.deepEqual([r.ok, r.weight], [true, "report"]);
});

test("R12: every member-facing string calls the group's own Civicsmith \"your group's Civicsmith\" or needs no name — the sweep row index.mjs:378, INQUIRY_UNAVAILABLE's detail, and every row's translation", async () => {
  const { w, match, p, q } = setup();
  const bare = new Citation({ record: w.record, membership: w.membership, promotion: w.promotion, content: w.content,
                              retrieval: w.retrieval, provenance: w.prov, now: () => NOW });
  const h = await w.select(["INFO-2026-0001"]);
  const r = bare.cite({ project: q, handle: h, ...ANN, role: "supports" });
  assert.equal(r.reason, "INQUIRY_UNAVAILABLE");
  assert.equal(r.detail, "citing onto a question needs the inquiry module's role vocabulary, leg grammar and earned "
                       + "registry, and your group's Civicsmith was created without them, so nothing was written.");
  assert.equal(bare.cite({ project: q, found: match, ...ANN, role: "supports" }).reason, "INQUIRY_UNAVAILABLE");
  /* No member-facing string names the Civicsmith any other way: every row's translation, and the detail of every refusal
     and answer the three acts give, new and old. */
  const FORBIDDEN = /\b(instance|plane|server|copy)\b/i;
  for (const row of [...Object.values(CITE_CHECKS), ...Object.values(CITE_EXTENT_CHECKS)]) assert.doesNotMatch(row.translation, FORBIDDEN, row.check);
  const answers = [r,
    w.cit.cite({ project: q, ...ANN }), w.cit.cite({ project: q, found: { ...match, extent: null }, ...ANN }),
    w.cit.cite({ project: q, found: { ...match, capture_sha: "f".repeat(64) }, ...ANN }),
    w.cit.cite({ project: q, handle: h, ...ANN, question: "INQ-2026-9999" }),
    w.cit.cite({ project: q, handle: h, ...ANN, question: "INFO-2026-0001" }),
    w.cit.cite({ project: q, handle: h, ...ANN, note: '"' }), w.cit.cite({ project: q, handle: h, ...ANN }),
    w.cit.cite({ project: q, handle: h, ...ANN, role: "x" }), w.cit.cite({ project: p, handle: h, ...ANN, role: "supports" }),
    w.cit.cite({ project: q, handle: h, ...ANN, role: "supports", extent: { nope: "1" } }),
    w.cit.cite({ project: p, found: match, ...ANN }), w.cit.cite({ project: "INFO-2026-0001", handle: h, ...ANN }),
    w.cit.cite({ project: p, handle: h, ...ANN }), w.cit.cite({ project: p, handle: h, ...ANN }),
    w.cit.sever({ project: p, handle: h, ...ANN }), w.cit.sever({ project: p, handle: h, ...ANN, reason: "x" }),
    w.cit.cite({ project: p, handle: h, ...ANN }), w.cit.reinstate({ project: p, handle: h, ...ANN, reason: "y" }),
    w.cit.reinstate({ project: p, handle: h, ...ANN, reason: "y" })];
  assert.ok(answers.filter((a) => typeof a.detail === "string").length >= 15, "the details are read (a control)");
  for (const a of answers) if (typeof a.detail === "string") assert.doesNotMatch(a.detail, FORBIDDEN, a.reason);
});
