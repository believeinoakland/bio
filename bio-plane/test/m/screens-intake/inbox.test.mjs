/* screens-intake R7: the `inbox` screen on the real served page, its reads and three acts. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, html, text, main, btn, fill, press, ok, refused, rawKeys, word, hasWord, says, saysIn } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

/* cs.date's form (interface-shell R6), by its keys */
const day = (d, m, y) => word("date.daymonthyear", { day: String(d), month: word(`date.month.${m}`), year: String(y) });
const rung = (k) => word(`screen.inbox.ladder.${k}`);

const K1 = { knock_id: "KNOCK-2026-10-03-9c1f0a2b", sha256: "1".repeat(64), bytes: 3 * 1048576, note: "The inspection sheets they don't publish.",
             received: "2026-10-03T10:00:00Z", status: "new", pseudonym: "P-1", knocker_digest: "dd" };
const K2 = { knock_id: "KNOCK-2026-09-12-11aa22bb", sha256: "2".repeat(64), bytes: 500, note: null, received: "2026-09-12T10:00:00Z",
             status: "discarded", resolve_reason: "Spam.", pseudonym: "P-1", knocker_digest: "dd" };
const K3 = { knock_id: "KNOCK-2026-09-01-33cc44dd", sha256: "3".repeat(64), bytes: 2048, note: "", received: "2026-09-01T10:00:00Z",
             status: "pulled", pseudonym: null, knocker_digest: null, capture_sha: "3".repeat(64) };
const LIST = ok({ inbox: [K1, K2, K3] });
const knock = (k, plane = {}) => open(`/app/inbox/${k.knock_id}`, { plane: { inbox: LIST, inboxget: ok({ ok: true, item: k }), ...plane } });

test("R7 reads inbox always and inboxget for the knock the address names", async () => {
  const p = await open("/app/inbox", { plane: { inbox: LIST } });
  assert.equal(p.byOp("inbox").length, 1);
  assert.equal(p.byOp("inboxget").length, 0);
  const q = await knock(K1);
  assert.equal(q.byOp("inboxget")[0].query.id, K1.knock_id);
  const e = await open("/app/inbox", { plane: { inbox: ok({ inbox: [] }) } });
  assert.ok(says(e, "screen.inbox.empty"));
});

test("R7 each knock: what was handed in, its note, the same-knocker mark and, opened, the identification ladder", async () => {
  const p = await knock(K1);
  const t = text(p);
  assert.ok(t.includes(`${word("screen.inbox.knock", { size: "3.0 MB" })} ${day(3, "october", 2026)}`));
  assert.ok(t.includes(word("screen.inbox.note", { note: "The inspection sheets they don't publish." })));
  assert.ok(t.includes(word("screen.inbox.same", { count: 1 })));
  assert.ok(t.includes(word("screen.inbox.nonote")));
  assert.ok(t.includes(word("screen.inbox.resolved", { reason: "Spam." })));
  assert.equal(main(p).querySelector('[data-ladder="ident"] [aria-current="step"]').textContent, rung("same"));
  assert.deepEqual(rawKeys(p), []);
  /* control: a knock with no secret stands at Unknown */
  assert.equal(main(await knock(K3)).querySelector('[data-ladder="ident"] [aria-current="step"]').textContent, rung("unknown"));
});

test("R7 a new knock offers inboxpull and inboxresolve; one already pulled offers neither; the list alone draws no act", async () => {
  const p = await knock(K1);
  assert.ok(btn(p, "inboxpull"));
  assert.ok(btn(p, "inboxresolve"));
  assert.equal(btn(p, "sourcelink"), null, "a knock not in the record has no source yet (R12)");
  assert.ok(says(p, "screen.inbox.link.nosource"));
  const q = await knock(K3);
  assert.equal(btn(q, "inboxpull"), null);
  assert.equal(btn(q, "inboxresolve"), null);
  assert.equal(main(await open("/app/inbox", { plane: { inbox: LIST } })).querySelector("button[data-act]"), null);
});

test("R7 inboxpull moves the knock into the record", async () => {
  const p = await knock(K1, { inboxpull: ok({ ok: true, document: {} }) });
  await press(p, "inboxpull", { reason: "It bears on our question." });
  assert.equal(p.byOp("inboxpull")[0].body.knockId, K1.knock_id);
  assert.ok(says(p, "screen.inbox.pulled"));
  const q = await knock(K1, { inboxpull: ok({ ok: true, existed: true }) });
  await press(q, "inboxpull", { reason: "again" });
  assert.ok(says(q, "screen.inbox.existed"));
});

test("R7 inboxresolve to discarded with the member's reason asked first; RESOLVE_NO_REASON drawn by its words, the knock left as it was", async () => {
  const p = await knock(K1, { inboxresolve: ok({ ok: true, status: "discarded" }) });
  const r0 = await press(p, "inboxresolve");
  assert.equal(p.byOp("inboxresolve").length, 0, "the reason is asked first");
  assert.ok(r0.slot().querySelector("textarea"));
  await press(p, "inboxresolve", { reason: "Nothing in it bears on our questions." });
  assert.deepEqual(p.byOp("inboxresolve")[0].body, { knockId: K1.knock_id, status: "discarded", reason: "Nothing in it bears on our questions." });
  assert.ok(says(p, "screen.inbox.discarded"));
  const q = await knock(K1, { inboxresolve: refused("RESOLVE_NO_REASON", "the owner's words") });
  const r = await press(q, "inboxresolve", { reason: "x" });
  assert.ok(saysIn(r.slot(), "screen.inbox.refusal.RESOLVE_NO_REASON"));
  assert.ok(!says(q, "screen.inbox.discarded"));
});

test("R10 each knock named is a reference of the kind knock, opening inbox at it, its card naming what was handed in and when", async () => {
  assert.ok(hasWord("shell.card.knock"), "interface-shell R27 holds the knock's card word");
  const p = await open("/app/inbox", { plane: { inbox: LIST } });
  for (const k of [K1, K2, K3]) {
    const a = main(p).querySelector(`a.cs-ref[href="/app/inbox/${k.knock_id}"][data-nav]`);
    assert.ok(a, k.knock_id);
    assert.equal(a.textContent, k.knock_id);
    assert.ok(a.getAttribute("data-tip").startsWith(`<b>${word("shell.card.knock")}</b>`), k.knock_id);
  }
  const tip = main(p).querySelector(`a.cs-ref[href="/app/inbox/${K1.knock_id}"]`).getAttribute("data-tip");
  assert.match(tip, /3\.0 MB/);
  assert.ok(tip.includes(day(3, "october", 2026)));
  assert.match(tip, /The inspection sheets/);
});

/* R12: the sources as sources R1, R9 answer them; a member's session reads them (op-declarations R56) */
const K4 = { knock_id: "KNOCK-2026-08-20-55ee66ff", sha256: "4".repeat(64), bytes: 900, note: "Earlier.", received: "2026-08-20T10:00:00Z",
             status: "pulled", pseudonym: "P-1", knocker_digest: "dd", capture_sha: "4".repeat(64) };
const K5 = { knock_id: "KNOCK-2026-08-01-77aa88bb", sha256: "5".repeat(64), bytes: 100, note: "", received: "2026-08-01T10:00:00Z",
             status: "pulled", pseudonym: null, knocker_digest: null, capture_sha: "5".repeat(64) };
const SRC = { ["3".repeat(64)]: "SRC-2026-0003", ["4".repeat(64)]: "SRC-2026-0004", ["5".repeat(64)]: "SRC-2026-0005" };
const sourceof = (req) => (SRC[req.query.capture] ? ok({ ok: true, captureSha: req.query.capture, sourceId: SRC[req.query.capture], source: {}, history: [] })
  : refused("NO_SUCH_SOURCE", "No source."));
const PULLED = { ...K3, pseudonym: "P-1", knocker_digest: "dd" };
const pulled = (plane = {}) => open(`/app/inbox/${PULLED.knock_id}`, { plane: { inbox: ok({ inbox: [K1, PULLED, K4, K5] }),
  inboxget: ok({ ok: true, item: PULLED }), sourceof, sourcerung: ok({ ok: true, source: "SRC-2026-0003", rung: "partly_known", ladder: [] }), ...plane } });

test("R12 a pulled knock's source is read through sourceof by its capture digest, its rung through sourcerung, and the ladder drawn at that rung", async () => {
  const p = await pulled();
  assert.equal(p.byOp("sourceof").find((r) => r.query.capture === "3".repeat(64)).query.capture, "3".repeat(64));
  assert.deepEqual(p.byOp("sourcerung").map((r) => r.query.source_id), ["SRC-2026-0003"]);
  assert.equal(main(p).querySelector('[data-ladder="ident"] [aria-current="step"]').textContent, rung("partly"));
  assert.ok(says(p, "screen.inbox.source", { source: "SRC-2026-0003" }));
  for (const [named, at] of [["unknown", "unknown"], ["same_knocker", "same"], ["known_to_group", "group"], ["publicly_known", "public"]]) {
    const q = await pulled({ sourcerung: ok({ ok: true, source: "SRC-2026-0003", rung: named }) });
    assert.equal(main(q).querySelector('[data-ladder="ident"] [aria-current="step"]').textContent, rung(at), named);
  }
  /* control: a knock not yet pulled reads no source; the same knocker (its secret) stands at "Same knocker" */
  const n = await knock(K1);
  assert.equal(n.byOp("sourceof").filter((r) => r.query.capture === K1.sha256).length, 0);
  assert.equal(n.byOp("sourcerung").length, 0);
});

test("R7 R12 sourcelink names the source read and a source chosen among the earlier knocks' (the same knocker's first), with the evidence: no id typed", async () => {
  const p = await pulled({ sourcelink: ok({ ok: true }) });
  assert.equal(main(p).querySelector('input#cx-source, input#cx-to'), null, "no field to type a source id");
  const opts = p.doc.getElementById("cx-to").querySelectorAll("option");
  assert.deepEqual(opts.map((o) => o.getAttribute("value")), ["SRC-2026-0004", "SRC-2026-0005"], "the same knocker's source first, its own left out");
  assert.equal(opts[0].textContent, word("screen.inbox.link.samechoice", { source: "SRC-2026-0004", knock: "KNOCK-2026-08-20-55ee66ff" }));
  fill(p, { "cx-to": "SRC-2026-0005", "cx-evidence": "Same handwriting on the cover note." });
  await press(p, "sourcelink");
  assert.deepEqual(p.byOp("sourcelink")[0].body, { source: "SRC-2026-0003", to: "SRC-2026-0005", evidence: "Same handwriting on the cover note." });
  assert.ok(says(p, "screen.inbox.link.done"));
  /* nothing is sent without the evidence */
  const q = await pulled();
  fill(q, { "cx-evidence": "" });
  assert.ok(saysIn((await press(q, "sourcelink")).slot(), "screen.inbox.link.missing", { fields: word("screen.inbox.link.evidence") }));
  assert.equal(q.byOp("sourcelink").length, 0);
  /* control: with no other source read, nothing to link to and no act */
  const r = await open(`/app/inbox/${PULLED.knock_id}`, { plane: { inbox: ok({ inbox: [PULLED] }), inboxget: ok({ ok: true, item: PULLED }), sourceof,
    sourcerung: ok({ ok: true, rung: "unknown" }) } });
  assert.equal(btn(r, "sourcelink"), null);
  assert.ok(says(r, "screen.inbox.link.none"));
  /* control: a source sourceof refuses is not offered */
  const s = await pulled({ sourceof: (req) => (req.query.capture === "4".repeat(64) ? refused("NO_SUCH_SOURCE", "No.") : sourceof(req)) });
  assert.deepEqual(s.doc.getElementById("cx-to").querySelectorAll("option").map((o) => o.getAttribute("value")), ["SRC-2026-0005"]);
});

test("R26 every key the inbox screen reads is a word of the list, and its states draw word(key, vars)", async () => {
  for (const k of SCREENS.find((x) => x.id === "inbox").words) assert.ok(hasWord(k), k);
  const p = await open("/app/inbox", { plane: { inbox: LIST } });
  for (const k of ["screen.inbox.sub", "screen.inbox.status.new", "screen.inbox.status.pulled", "screen.inbox.status.discarded"]) assert.ok(says(p, k), k);
});
