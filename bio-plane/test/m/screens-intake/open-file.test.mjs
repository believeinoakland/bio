/* screens-intake R5, R6: the `open-file` screen on the real served page: its reads, its three states and its five acts. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { open, html, text, main, btn, fill, press, ok, refused, bytes, ADMIN, rawKeys, word, hasWord, says, saysIn } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const day = (d, m, y) => word("date.daymonthyear", { day: String(d), month: word(`date.month.${m}`), year: String(y) });

const SHA = "f".repeat(64);
/* R39: an original is checked in the browser against the capture's fingerprint, so a test that opens one serves bytes whose SHA-256
   is the subject's: `OPENED` are those bytes, `DSHA` their digest, the subject of the page that opens them */
const OPENED = "%PDF-1.7";
const DSHA = createHash("sha256").update(OPENED, "utf8").digest("hex");
const NOTE = { note_id: 1, kind: "scan", tool: "clamav", engine: "ClamAV", engine_version: "1.4.2", scanned_at: "2026-10-06T03:10:00Z", result: "clean", findings: [] };
const BASE = { verdictnotes: ok({ ok: true, notes: [NOTE] }), scanfindings: ok({ ok: true, findings: [] }) };
const STATES = {
  low: { threatof: ok({ ok: true, threat: "low", reasons: [], scan_hold: null }), originalstate: ok({ may_open: true, path: "plain", why: null }) },
  warned: { threatof: ok({ ok: true, threat: "high", reasons: [{ code: "active:macro", translation: "macro in the document" }], scan_hold: null }),
            originalstate: ok({ may_open: true, path: "warned", why: null }) },
  deeper: { threatof: ok({ ok: true, threat: "high", reasons: [], scan_hold: null }), originalstate: ok({ may_open: true, path: "deeper", why: null }) },
  closed: { threatof: ok({ ok: true, threat: "high", reasons: [], scan_hold: null }), originalstate: ok({ may_open: false, path: null, why: "NOT_SCANNED" }) },
  held: { threatof: ok({ ok: true, threat: "high", reasons: [{ code: "scan_hold", translation: "A scanner found something." }], scan_hold: { names: ["X"] } }),
          originalstate: ok({ may_open: false, path: null, why: "SCAN_HOLD" }),
          scanfindings: ok({ ok: true, findings: [{ captureSha: SHA, findings: ["Xls.Downloader.Agent-917"], held: true }, { captureSha: "0".repeat(64), findings: ["Other"] }] }) },
};
const at = (k, plane = {}, o = {}, sha = SHA) => open(`/app/open-file/${sha}`, { plane: { ...BASE, ...STATES[k], ...plane }, ...o });
const atBytes = (k, plane = {}, o = {}) => at(k, plane, o, DSHA);

test("R5 reads threatof, originalstate, verdictnotes and scanfindings for the capture; scanstatus only for a session that administers", async () => {
  const p = await at("low");
  for (const op of ["threatof", "originalstate", "verdictnotes"]) assert.equal(p.byOp(op)[0].query.capture, SHA, op);
  assert.equal(p.byOp("scanfindings").length, 1);
  assert.equal(p.byOp("scanstatus").length, 0);
  const a = await at("low", { scanstatus: ok({ queued: 3, overdue: 1, held: 0 }) }, { me: ADMIN });
  assert.equal(a.byOp("scanstatus").length, 1);
  assert.ok(says(a, "screen.open-file.status.line", { parts: `${word("screen.open-file.status.queued", { count: 3 })}, ${word("screen.open-file.status.overdue", { count: 1 })}` }));
  /* control: no capture named, nothing read */
  const n = await open("/app/open-file");
  assert.equal(n.byOp("threatof").length, 0);
  assert.ok(says(n, "shell.unavailable.nothing.title"), "R20: nothing is here");
});

test("R5 a low-risk file draws openoriginal with its checks, and offers no warned path and no release", async () => {
  const p = await at("low");
  assert.ok(main(p).querySelector('[data-risk="low"]'));
  assert.ok(btn(p, "openoriginal"));
  assert.ok(says(p, "screen.open-file.note.line", { tool: word("screen.open-file.tool.clamav"), result: word("screen.open-file.result.clean") }));
  assert.ok(text(p).includes(`${word("screen.open-file.note.at")} ${day(6, "october", 2026)}`));
  assert.equal(btn(p, "openwithwarning"), null);
  assert.equal(btn(p, "releasescanhold"), null);
  assert.deepEqual(rawKeys(p), []);
});

/* ---- T51 (CHANGE B15): R53 ---- */
test("R53 each scan result draws the note's line by key: its tool and its result are words, never the note's raw result", async () => {
  for (const result of ["clean", "found", "failed", "not_scanned"]) {
    const p = await at("low", { verdictnotes: ok({ ok: true, notes: [{ ...NOTE, result }] }) });
    assert.ok(says(p, "screen.open-file.note.line", { tool: word("screen.open-file.tool.clamav"), result: word(`screen.open-file.result.${result}`) }), result);
    assert.ok(!text(p).includes(`${word("screen.open-file.result.clean")}: ${result}`), "no raw result in the line");
  }
  assert.doesNotMatch(text(await at("low", { verdictnotes: ok({ ok: true, notes: [{ ...NOTE, result: "not_scanned" }] }) })), /not_scanned/, "never the raw state");
});

test("R53 a scan that ran draws its engine, version and date; a note not scanned draws none of them", async () => {
  const clean = await at("low");
  assert.ok(text(clean).includes("ClamAV 1.4.2"), "the engine and its version");
  assert.ok(text(clean).includes(`${word("screen.open-file.note.at")} ${day(6, "october", 2026)}`), "the date");
  const none = await at("low", { verdictnotes: ok({ ok: true, notes: [{ ...NOTE, result: "not_scanned" }] }) });
  assert.ok(says(none, "screen.open-file.note.line", { tool: word("screen.open-file.tool.clamav"), result: word("screen.open-file.result.not_scanned") }));
  assert.ok(!text(none).includes("ClamAV"), "no engine");
  assert.ok(!text(none).includes(word("screen.open-file.note.at")), "no date");
  /* control: a tool or result the words do not hold is not drawn raw: the shell's "could not be read" */
  const unknown = await at("low", { verdictnotes: ok({ ok: true, notes: [{ ...NOTE, tool: "zzz-scanner" }] }) });
  assert.ok(says(unknown, "shell.unread"));
  assert.ok(!text(unknown).includes("zzz-scanner"));
});

test("R5 a high-risk file draws safeview first and deepercheck; openwithwarning only on the warned path, sent only with both confirmations", async () => {
  const p = await atBytes("warned", { openwithwarning: bytes(OPENED, "application/msword") });
  const h = html(p);
  assert.ok(main(p).querySelector('[data-risk="high"]'));
  assert.ok(h.indexOf('data-act="safeview"') < h.indexOf('data-act="deepercheck"'));
  assert.ok(h.indexOf('data-act="safeview"') < h.indexOf('data-act="openwithwarning"'));
  assert.ok(text(p).includes("macro in the document"), "the reason is data the plane gave");
  fill(p, { "co-device": true });
  const r = await press(p, "openwithwarning");
  assert.equal(p.byOp("openwithwarning").length, 0, "nothing sent before both are ticked");
  assert.ok(saysIn(r.slot(), "screen.open-file.warn.both"));
  fill(p, { "co-device": true, "co-macros": true });
  await press(p, "openwithwarning");
  const q = p.byOp("openwithwarning")[0];
  assert.equal(q.query.capture, DSHA);
  assert.deepEqual(q.body, { warned: { own_device: true, no_macros: true } });
  assert.equal(p.files.length, 1, "handed to the browser as a file");
  /* control: no path open (not checked this week): no warned path, no original; the reason stated */
  const c = await at("closed");
  assert.equal(btn(c, "openwithwarning"), null);
  assert.equal(btn(c, "openoriginal"), null);
  assert.ok(says(c, "screen.open-file.closed", { why: "NOT_SCANNED" }));
  /* the deeper path (a fresh clean deeper check) opens the original by override */
  const d = await atBytes("deeper", { openoriginal: bytes(OPENED) });
  await press(d, "openoriginal");
  assert.equal(d.byOp("openoriginal")[0].query.override, "1");
});

test("R5 a file held after a finding: no way to open the original, the finding named, releasescanhold with a reason", async () => {
  const p = await at("held", { releasescanhold: ok({ ok: true, state: "pending_second" }) });
  assert.ok(main(p).querySelector('[data-risk="held"]'));
  assert.equal(btn(p, "openoriginal"), null);
  assert.equal(btn(p, "openwithwarning"), null);
  assert.ok(says(p, "screen.open-file.findings", { names: "Xls.Downloader.Agent-917" }));
  assert.doesNotMatch(text(p), /Other/, "another capture's finding is not this file's");
  await press(p, "releasescanhold", { reason: "The city's own file." });
  const q = p.byOp("releasescanhold")[0];
  assert.equal(q.query.capture, SHA);
  assert.deepEqual(q.body, { reason: "The city's own file." });
  assert.ok(says(p, "screen.open-file.release.pending"));
  const r = await at("held", { releasescanhold: ok({ ok: true, state: "released", by: ["a", "b"] }) });
  await press(r, "releasescanhold", { reason: "Second." });
  assert.ok(says(r, "screen.open-file.release.done"));
  /* control: offered only while file-safety answers the file held */
  assert.equal(btn(await at("warned"), "releasescanhold"), null);
});

test("R5 the safe view: marked machine work, a safe copy derived from the original, cite the original; a sheet drawn as data", async () => {
  const p = await at("warned", { safeview: ok({ ok: true, kind: "data", derived: true, sheets: [{ name: "FY22", cells: [{ ref: "A1", value: "Transfer", type: "s" }] }] }) });
  assert.ok(main(p).querySelector('[data-origin="machine"]'));
  assert.ok(says(p, "screen.open-file.safe.origin"));
  assert.ok(says(p, "screen.open-file.safe.cite"));
  await press(p, "safeview", { reason: "to read it" });
  assert.equal(p.byOp("safeview")[0].query.capture, SHA);
  assert.ok(says(p, "screen.open-file.safe.sheet", { name: "FY22" }));
  assert.match(html(p), /<td>A1<\/td><td>Transfer<\/td>/);
  assert.equal(p.files.length, 0, "a sheet is drawn, not downloaded");
  const q = await at("warned", { safeview: bytes("%PDF") });
  await press(q, "safeview", { reason: "to read it" });
  assert.equal(q.files.length, 1);
  assert.ok(says(q, "screen.open-file.safe.ready"));
  /* a refusal is drawn with the owner's words */
  const r = await at("warned", { safeview: refused("SAFE_VIEW_PENDING", "The safe view is being made.") });
  await press(r, "safeview", { reason: "to read it" });
  assert.match(text(r), /The safe view is being made\./);
});

test("R5 deepercheck asks for the capture and draws its state", async () => {
  const p = await at("warned", { deepercheck: ok({ ok: true, state: "queued", check_id: "c1" }) });
  await press(p, "deepercheck", { reason: "check it" });
  assert.equal(p.byOp("deepercheck")[0].query.capture, SHA);
  assert.ok(says(p, "screen.open-file.deeper.state", { state: word("screen.open-file.deeper.queued") }));
});

test("R6 opening the original is a download under the session header, its address naming only the capture; its object address released; no link carries a token", async () => {
  const p = await atBytes("low", { openoriginal: bytes(OPENED) });
  await press(p, "openoriginal");
  const q = p.byOp("openoriginal")[0];
  assert.deepEqual(Object.keys(q.query).sort(), ["capture", "op"]);
  assert.equal(q.headers.Authorization, "Bearer tok-1");
  assert.doesNotMatch(q.url, /tok-1/);
  assert.equal(p.files.length, 1);
  assert.ok(p.objectUrls.every((u) => u.released), "the object address is released");
  assert.ok(says(p, "screen.open-file.opened"));
  for (const k of Object.keys(STATES)) assert.doesNotMatch((await at(k)).root().innerHTML, /tok-1/);
  /* a refusal is drawn beside the act with the owner's words, and nothing is saved */
  const r = await atBytes("low", { openoriginal: refused("SCAN_PENDING_NOT_WORDED", "It is being checked.") });
  await press(r, "openoriginal");
  assert.equal(r.files.length, 0);
  assert.match(text(r), /It is being checked\./);
  /* a code the table holds is drawn by its word, not by the answer's text (DEC-342) */
  assert.ok(hasWord("refusal.SCAN_PENDING"));
  const w = await atBytes("low", { openoriginal: refused("SCAN_PENDING", "builder detail that is never drawn") });
  await press(w, "openoriginal");
  assert.ok(says(w, "refusal.SCAN_PENDING"));
  assert.doesNotMatch(text(w), /builder detail/);
});

test("R39 matching bytes open and the screen says the fingerprint was checked; the sentence that the original was handed over stays its own", async () => {
  const p = await atBytes("low", { openoriginal: bytes(OPENED) });
  assert.ok(!says(p, "screen.open-file.digest.checked"), "nothing is said before an opening");
  await press(p, "openoriginal");
  assert.equal(p.files.length, 1);
  assert.ok(says(p, "screen.open-file.digest.checked"));
  assert.ok(says(p, "screen.open-file.opened"));
  /* the warned path is checked the same way */
  const w = await atBytes("warned", { openwithwarning: bytes(OPENED, "application/msword") });
  fill(w, { "co-device": true, "co-macros": true });
  await press(w, "openwithwarning");
  assert.equal(w.files.length, 1);
  assert.ok(says(w, "screen.open-file.digest.checked"));
});

test("R39 altered bytes hand nothing over: refusal.DIGEST_MISMATCH beside the act, nothing said as checked or opened, and the act is usable again", async () => {
  const held = ok({ ok: true, held: true, copy: {}, versions: 1, truncated: false, changed: { state: "undetermined", basis: "x", as_of: null, earlier_differs: false } });
  const p = await atBytes("low", { openoriginal: bytes("altered bytes"), heldat: held });
  await press(p, "openoriginal");
  assert.equal(p.files.length, 0, "nothing is saved");
  assert.ok(says(p, "refusal.DIGEST_MISMATCH"));
  assert.ok(!says(p, "refusal.DIGEST_MISMATCH.unheld"));
  assert.ok(!says(p, "screen.open-file.digest.checked") && !says(p, "screen.open-file.opened"));
  assert.ok(!btn(p, "openoriginal").hasAttribute("disabled"), "the act stays usable");
  assert.deepEqual(p.byOp("heldat").map((r) => r.query), [{ op: "heldat", sha256: DSHA }], "the one read made to tell which sentence: by digest, no check, nothing of the member's");
  /* where the team holds no file under that fingerprint, its own sentence */
  const u = await atBytes("low", { openoriginal: bytes("altered bytes"), heldat: ok({ ok: true, held: false, copy: null, versions: 0, truncated: false, changed: { state: "undetermined", basis: "x", as_of: null, earlier_differs: false } }) });
  await press(u, "openoriginal");
  assert.equal(u.files.length, 0);
  assert.ok(says(u, "refusal.DIGEST_MISMATCH.unheld"));
  /* a warned opening of altered bytes is refused the same way */
  const w = await atBytes("warned", { openwithwarning: bytes("altered bytes", "application/msword"), heldat: held });
  fill(w, { "co-device": true, "co-macros": true });
  await press(w, "openwithwarning");
  assert.equal(w.files.length, 0);
  assert.ok(says(w, "refusal.DIGEST_MISMATCH"));
});

test("R39 controls: the safe view is not verified against the original's digest; no digest of the member's is kept", async () => {
  const p = await atBytes("warned", { safeview: bytes("derived pages, not the original's bytes") });
  await press(p, "safeview", { reason: "to read it" });
  assert.equal(p.files.length, 1, "the safe view downloads though its bytes are not the original's");
  assert.ok(!says(p, "refusal.DIGEST_MISMATCH") && !says(p, "screen.open-file.digest.checked"));
  assert.equal(p.byOp("heldat").length, 0);
  assert.deepEqual([...p.store.keys()].filter((k) => k !== "bio-session:frame"), []);
  for (const k of p.local.keys()) assert.match(k, /^(cs-|bio-session(:active)?$)/);
});

test("R26 every key the open-file screen reads is a word of the list, and its three states draw word(key, vars)", async () => {
  for (const k of SCREENS.find((x) => x.id === "open-file").words) assert.ok(hasWord(k), k);
  for (const [state, kind] of [["low", "low"], ["warned", "high"], ["held", "held"]]) {
    const p = await at(state);
    assert.ok(says(p, `screen.open-file.risk.${kind}`), kind);
    assert.ok(says(p, `screen.open-file.risk.${kind}.means`), kind);
  }
});

/* ---- T50 (T50-30): R36 ---- */
const MINE = { threatof: ok({ ok: true, threat: "high", reasons: [{ code: "source_not_fetched", translation: "Nothing fetched it: it was handed in." }], scan_hold: null }),
               originalstate: ok({ may_open: false, path: null, why: "NOT_SCANNED" }), verdictnotes: ok({ ok: true, notes: [] }),
               captureaccounts: ok({ ok: true, captureSha: SHA, actors: [{ actor: "member:mai", at: "2026-10-04T10:00:00Z" }], accounts: [] }) };
const mine = (plane = {}, o = {}) => open(`/app/open-file/${SHA}`, { plane: { ...BASE, ...MINE, ...plane }, ...o });

test("R36 a file the viewer added opens as her own: High risk with the yours sentence, the next steps, the safe view primary and a deeper check; checks said in words", async () => {
  const p = await mine({ scanstatus: ok({ queued: 1, overdue: 0, held: 0 }) });
  assert.ok(main(p).querySelector('[data-risk="high"]'));
  assert.ok(says(p, "screen.open-file.risk.high"));
  assert.ok(says(p, "screen.open-file.high.yours"));
  assert.ok(!says(p, "screen.open-file.risk.high.means"), "the generic line is replaced");
  assert.ok(says(p, "screen.open-file.next.head"));
  assert.ok(says(p, "screen.open-file.next.yours"));
  assert.equal(btn(p, "safeview").getAttribute("data-tone"), "primary", "Read the safe view is primary");
  assert.ok(btn(p, "deepercheck"));
  assert.ok(btn(p, "safeview").textContent.includes(word("act.safeview.label.open-file")));
  assert.ok(says(p, "screen.open-file.check.notyet"), "its checks, in words");
  const t = text(p);
  assert.doesNotMatch(t, /not_scanned|NOT_SCANNED|SAFE_VIEW_ONLY/i, "never a scanner's raw state");
  assert.ok(!t.includes(word("screen.open-file.status.queued", { count: 1 })), "never '1 files waiting'");
  assert.equal(btn(p, "openoriginal"), null, "the original never opens before a check");
  assert.deepEqual(rawKeys(p), []);
  assert.equal(p.byOp("captureaccounts")[0].query.capture, SHA);
});

test("R36 the safe view of a plain-text file is drawn as text, line by line, nothing in it run or followed; the cut is said when the file was longer", async () => {
  const p = await mine({ safeview: ok({ ok: true, kind: "text", derived: true, text: "first line of the notice\n<script>alert(1)</script>\n[a link](http://x.example/)", truncated: false }) });
  await press(p, "safeview");
  assert.equal(p.byOp("safeview")[0].query.capture, SHA);
  assert.ok(says(p, "screen.open-file.safetext"));
  assert.ok(!says(p, "screen.open-file.safetext.cut"));
  const lines = main(p).querySelectorAll('[data-safetext] p').map((e) => e.textContent);
  assert.deepEqual(lines, ["first line of the notice", "<script>alert(1)</script>", "[a link](http://x.example/)"], "each line as text");
  assert.equal(main(p).querySelector("[data-safetext] script"), null, "nothing is run");
  assert.equal(main(p).querySelector("[data-safetext] a"), null, "nothing is followed");
  assert.equal(p.files.length, 0, "drawn, not downloaded");
  const cut = await mine({ safeview: ok({ ok: true, kind: "text", derived: true, text: "a\nb", truncated: true }) });
  await press(cut, "safeview");
  assert.ok(says(cut, "screen.open-file.safetext.cut"));
});

test("R36 a file with no safe view draws refusal.NO_SAFE_VIEW; any other refusal its own words, an answer with none the shell's — never nothing", async () => {
  const png = await mine({ safeview: refused("NO_SAFE_VIEW", "the owner's words") });
  await press(png, "safeview");
  assert.ok(says(png, "refusal.NO_SAFE_VIEW"));
  assert.ok(!text(png).includes("the owner's words"));
  const other = await mine({ safeview: refused("SAFE_VIEW_PENDING", "The safe view is being made.") });
  await press(other, "safeview");
  assert.match(text(other), /The safe view is being made\./);
  const none = await mine({ safeview: refused("SOMETHING", "") });
  await press(none, "safeview");
  assert.ok(says(none, "shell.unread"));
});

test("R36 controls: a file the team's Civicsmith fetched, or one another member added, is not worded as the viewer's own", async () => {
  const fetched = await at("warned", { captureaccounts: ok({ ok: true, captureSha: SHA, actors: [{ actor: "member:mai", at: "2026-10-04T10:00:00Z" }], accounts: [] }) });
  assert.ok(!says(fetched, "screen.open-file.high.yours"), "a fetched file the viewer also captured has active content, not 'added by you'");
  assert.ok(says(fetched, "screen.open-file.risk.high.means"));
  const other = await mine({ captureaccounts: ok({ ok: true, captureSha: SHA, actors: [{ actor: "member:rosa", at: "2026-10-04T10:00:00Z" }], accounts: [] }) });
  assert.ok(!says(other, "screen.open-file.high.yours"));
  assert.ok(!says(other, "screen.open-file.next.head"));
  assert.ok(says(other, "screen.open-file.closed", { why: "NOT_SCANNED" }), "the generic line for a file that is not hers");
  const unknown = await mine({ captureaccounts: refused("STORE_SILENT", "x") });
  assert.ok(!says(unknown, "screen.open-file.high.yours"), "who added it unknown: not worded as hers");
});

/* ---- fix round 10, cause 14 (G3; walk C7): an added file's other reasons are said ---- */
const reasonsOf = (...codes) => ok({ ok: true, threat: "high", scan_hold: null, reasons: codes.map((code) => ({ code, translation: `the plane's words for ${code}` })) });
const NOTE_CLEAN = ok({ ok: true, notes: [NOTE] });
/* the design's line "its inside could not be checked" is owed (K4269); until its row is held the reasons' own words say it, so the line is asserted where the row is held */
const INSIDE = "screen.open-file.check.inside";
const insideSaid = (p) => text(p).includes(word(INSIDE));
const mineWith = (...codes) => mine({ threatof: reasonsOf(...codes), verdictnotes: NOTE_CLEAN });

test("R5 R36 cause 14: a file the viewer added, with a clean scanner note, still says that its inside could not be checked, and the other reason's words", async () => {
  for (const other of ["encrypted", "active:vba-project", "format_unchecked"]) {
    const p = await mineWith("source_not_fetched", other);
    assert.ok(says(p, "screen.open-file.high.yours"), `${other}: still her own file`);
    assert.ok(text(p).includes(`the plane's words for ${other}`), `${other}: the reason is said in the plane's words`);
    assert.ok(says(p, "screen.open-file.why", { reasons: `the plane's words for ${other}` }), `${other}: beside the "why" line`);
    if (hasWord(INSIDE)) assert.ok(insideSaid(p), `${other}: the scanner's "Clean" does not stand for the inside`);
    assert.ok(says(p, "screen.open-file.note.line", { tool: word("screen.open-file.tool.clamav"), result: word("screen.open-file.result.clean") }), `${other}: the note stays`);
  }
});

test("R5 R36 cause 14 control: source_not_fetched alone draws no empty why line and no inside line; a reason that does not hide the inside draws only its words", async () => {
  const alone = await mineWith("source_not_fetched");
  assert.ok(says(alone, "screen.open-file.high.yours"));
  assert.ok(!text(alone).includes(word("screen.open-file.why", { reasons: "" })), "no empty why line");
  assert.ok(!main(alone).querySelector(".mk-small[data-risk], p.mk-small:empty"), "and no empty paragraph");
  assert.ok(!hasWord(INSIDE) || !insideSaid(alone));
  const macro = await mineWith("source_not_fetched", "active:macro");
  assert.ok(text(macro).includes("the plane's words for active:macro"));
  assert.ok(!hasWord(INSIDE) || !insideSaid(macro), "a macro in a readable file: its inside was checked");
  /* a file that is not hers keeps the one line for every reason */
  const hers = await at("warned", { threatof: reasonsOf("encrypted") });
  assert.ok(!hasWord(INSIDE) || insideSaid(hers), "a fetched file with an encrypted inside says it too");
});
