/* screens-intake R8, R9 and the screen contract (interface-shell R21, R5, R10, R12) over all five screens, on the real
 * served page: `interfacePage(SCREENS)` through interface-shell's harness. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { interfacePage, interfaceScript, interfaceScriptHash, checkScreens, SHELL_OPS } from "../../../src/interface-shell/index.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import { ALL_STAND_INS } from "../../../src/screens-intake/standins.mjs";
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";
import { SCREEN_REGISTRY } from "../../../src/wizard-scripts/index.mjs";
import { OPS, SESSION_OPS, NEEDS } from "../../../src/op-declarations/index.mjs";
import { pending } from "../interface-shell/harness.mjs";
import { open, html, text, main, ok, refused, MEMBER, rawKeys, fill, press, word, hasWord } from "./page.mjs";

const SHA = "a".repeat(64);
const PATHS = { capture: ["/app/capture/address", "/app/capture/address/INQ-2026-0001-q", "/app/capture/file", "/app/capture/saw"], held: ["/app/held"], archive: [`/app/archive/${SHA}`],
                "open-file": [`/app/open-file/${SHA}`], inbox: ["/app/inbox", "/app/inbox/KNOCK-2026-10-03-9c1f0a2b"] };
const VALUES = {
  heldcaptures: { ok: true, held: [{ bundle_id: "INFO-1", title: "T", project: "P", age_days: 1, eligible: false, class: "contested",
                                     captured_for: { questions: [{ question: "Q", title: "Q?", asker: "Ana" }], withheld: "w" } }], truncated: true },
  threatof: { ok: true, threat: "high", reasons: [{ code: "x", translation: "Why." }], scan_hold: { names: ["N"] } },
  originalstate: { may_open: true, path: "warned" }, verdictnotes: { ok: true, notes: [{ tool: "t", engine: "e", result: "clean", scanned_at: "2026-10-01T00:00:00Z" }] },
  scanfindings: { ok: true, findings: [{ captureSha: SHA, findings: ["N"] }] }, scanstatus: { queued: 1, overdue: 0, held: 1 },
  inbox: { inbox: [{ knock_id: "KNOCK-2026-10-03-9c1f0a2b", bytes: 10, received: "2026-10-03T00:00:00Z", status: "new", note: "n", pseudonym: "p" }] },
  inboxget: { ok: true, item: { knock_id: "KNOCK-2026-10-03-9c1f0a2b", bytes: 10, status: "pulled", note: "n", capture_sha: SHA } },
  sourceof: { ok: true, captureSha: SHA, sourceId: "SRC-2026-0001", source: {}, history: [] },
  sourcerung: { ok: true, source: "SRC-2026-0001", rung: "same_knocker" },
  archivelist: { ok: true, archive: { sha256: SHA, grade: { grade: "B", determined: true }, bytes: 10, entries: 1, opened: true, refused: null },
                 summary: { filed: 1, already_held: 0, not_filed: 0, folders: 0, waiting: 0 },
                 entries: [{ index: 1, name: "a.pdf", state: "filed", sha256: SHA, bundle: "INFO-2026-0002-a" }] },
  gradenote: { ok: true, note: "A note." },
  opencaptures: { ok: true, captures: [{ session: "S-1", locator: "https://x.example/a", primary_sha: SHA, started: "2026-10-01T00:00:00Z", outstanding: 2 }], truncated: false },
  search: { hits: [{ bundle_id: "INQ-2026-0001-q", title: "Q?" }] },
  captureaccounts: { ok: true, captureSha: SHA, actors: [{ actor: "member:mai", at: "2026-10-01T00:00:00Z" }], accounts: [] },
  projectlist: { projects: [{ id: "PROJ-1", name: "P" }] },
  memberlist: { members: [{ member_id: "mai", handle: "mai-h", role: "member", status: "active" }] },
  capturerequests: { ok: true, requests: [{ request: "CR-1", host: "records.example.gov", state: "refused", source_reason: "login", requested_at: "2026-10-01T00:00:00Z", principal_plane: "member:mai" }] },
};
const EMPTY = { heldcaptures: { ok: true, held: [] }, verdictnotes: { ok: true, notes: [] }, inbox: { inbox: [] }, opencaptures: { ok: true, captures: [] },
                archivelist: { ok: true, archive: {}, summary: {}, entries: [] } };
const READS = Object.keys(VALUES);
/* the ops a screen declares: its reads' and its acts' */
const declared = (id) => { const s = SCREENS.find((x) => x.id === id); return [s, Object.values(s.reads({ subject: SHA, me: MEMBER, data: {}, ui: {} })).map((r) => r.op), s.acts.map((a) => a.op)]; };

test("R8 R15 SCREENS meets interface-shell R21: eight registry screens, archive and the three of the T51 fix round among them, served by interfacePage without a throw", () => {
  assert.deepEqual(SCREENS.map((s) => s.id), ["capture", "held", "archive", "open-file", "inbox", "about-knocker", "leads", "watching"]);
  assert.ok(Object.isFrozen(SCREENS));
  assert.equal(checkScreens(SCREENS), true);
  /* interface-shell R1, R2 (fix round 3): the page loads the shell as one external script named by its hash, with no inline script and no nonce;
     the screens' functions are in that script */
  const page = interfacePage(SCREENS, { version: "9" });
  assert.equal((page.match(/<script\b/g) || []).length, 1, "one script element");
  assert.match(page, /<script src="\/app\/shell-9\.js" integrity="sha256-[^"]+"><\/script>/);
  assert.ok(!/<script nonce=/.test(page) && !/nonce/.test(page), "no nonce slot");
  assert.ok(page.includes(`integrity="${interfaceScriptHash(SCREENS, {})}"`), "named by its hash");
  assert.ok(interfaceScript(SCREENS).includes("capture"), "the screens are in the external script");
  for (const s of SCREENS) {
    assert.equal(typeof s.reads, "function");
    assert.equal(typeof s.render, "function");
    for (const a of s.acts) assert.equal(typeof a.send, "function", `${s.id} ${a.op}`);
  }
});

test("R8 every act names one op OPS holds and a member's session reaches, the registry's for its screen or its re-point; every registry act is drawn", () => {
  for (const s of SCREENS) {
    const reg = SCREEN_REGISTRY.find((r) => r.id === s.id);
    const listed = new Set([...(reg.acts || []).map((a) => (typeof a === "string" ? a : a.op)), ...(reg.owed || []).map((o) => o.op)]);
    if (listed.has("capture")) listed.add("captureupload");   /* draft-T46-interface.md §3 item 1 */
    for (const a of s.acts) {
      assert.ok(OPS[a.op], `${s.id}: ${a.op} in OPS`);
      /* interface-shell R12: SESSION_OPS gates mutating ops alone; a read is reached when the session's class is among its OPS classes */
      assert.ok(OPS[a.op].mutating ? SESSION_OPS.member.has(a.op) : OPS[a.op].classes.includes("member"), `${s.id}: ${a.op} reached by a member's session`);
      assert.ok(listed.has(a.op), `${s.id}: ${a.op} the registry's`);
    }
    for (const op of listed) if (op !== "capture") assert.ok(s.acts.some((a) => a.op === op), `${s.id} draws ${op}`);
  }
});

test("R8 after an act the screen reads again what it changed (every read, or none on a screen with none)", () => {
  for (const s of SCREENS) {
    const reads = Object.keys(s.reads({ subject: s.id === "capture" ? "address" : SHA, me: MEMBER, data: {}, ui: {} }));
    for (const a of s.acts) {
      /* what an act changed is read again, not every read (C14: an act does not read a whole list it did not change): an act names
         reads the screen has, or names none (it reads all); a screen with no reads has nothing to name */
      if (reads.length) assert.ok(a.rereads === undefined || [...a.rereads].every((n) => reads.includes(n)), `${s.id} ${a.op} names reads the screen has`);
      else assert.deepEqual([...(a.rereads || [])], [], `${s.id} ${a.op}`);
    }
  }
});

test("R8 (interface-shell R5, R10) every screen in each read's four states draws only words, and failed never as empty", async () => {
  const states = {
    ok: Object.fromEntries(READS.map((op) => [op, ok(VALUES[op])])),
    empty: Object.fromEntries(READS.map((op) => [op, ok(EMPTY[op] ?? VALUES[op])])),
    failed: Object.fromEntries(READS.map((op) => [op, refused("STORE_SILENT", "store silent (test fixture)")])),
    loading: Object.fromEntries(READS.map((op) => [op, pending])),
  };
  for (const [state, plane] of Object.entries(states)) for (const paths of Object.values(PATHS)) for (const path of paths) {
    const p = await open(path, { plane, reachable: true });
    assert.deepEqual(rawKeys(p), [], `${path} ${state}`);
    const marks = main(p).querySelectorAll("[data-state]").map((e) => e.getAttribute("data-state"));
    if (state === "failed") assert.ok(!marks.includes("empty"), `${path}: a failed read is never drawn empty`);
    if (state === "loading" && !path.startsWith("/app/capture")) assert.ok(marks.includes("loading"), `${path} loading`);
    if (state === "failed" && !path.startsWith("/app/capture")) assert.ok(marks.includes("failed"), `${path} failed`);
  }
});

test("R26 (interface-shell R5) each screen's words are the keys it reads, all of them words of the list; the module holds none of its own English", async () => {
  const mod = await import("../../../src/screens-intake/index.mjs");
  assert.equal(mod.SCREEN_WORDS, undefined, "no list of the module's own sentences");
  for (const s of SCREENS) {
    assert.ok(Object.isFrozen(s.words), s.id);
    assert.equal(new Set(s.words).size, s.words.length, `${s.id}: keys distinct`);
    for (const w of s.words) {
      /* fix round 10 (R-WORDS, K3943): the one exception is a stand-in row `[id, en]` of standins.mjs, written once as `localize(id, en)` and owed to
         the design's list; the list's row replaces it when it holds the id. Any other pair is refused. */
      if (Array.isArray(w)) { assert.ok(ALL_STAND_INS.includes(w), `${s.id}: ${w[0]} is a stand-in of standins.mjs`); continue; }
      assert.equal(typeof w, "string", `${s.id}: a key, never a [key, en] row of its own`);
      assert.ok(hasWord(w), `${s.id}: ${w} is a word of the list`);
    }
  }
  assert.ok(SCREENS.every((s) => s.words.every((w) => Array.isArray(w) || WORD_ROWS.some((r) => r[0] === w))));
});

test("R26 word(key, vars): a missing placeholder and an unknown key throw their codes, so a screen never draws a key or a half-filled sentence", () => {
  assert.throws(() => word("screen.held.age", {}), /WORD_VAR_MISSING/);
  assert.throws(() => word("screen.nothing.here"), /UNKNOWN_WORD/);
});

test("R8 (interface-shell R12) an act is drawn only when the session may do it: without contribute no act needing it appears", async () => {
  const plane = Object.fromEntries(READS.map((op) => [op, ok(VALUES[op])]));
  for (const path of Object.values(PATHS).flat()) {
    const p = await open(path, { plane, me: { ...MEMBER, capabilities: [] }, reachable: true });
    for (const b of main(p).querySelectorAll("button[data-act]")) {
      const op = b.getAttribute("data-act");
      assert.ok(NEEDS[op] === null || NEEDS[op] === undefined, `${path}: ${op} needs ${NEEDS[op]}, drawn without it`);
    }
  }
});

test("R9 no act or read records which member opened which file: every request is an op naming no member, and the screens store nothing", async () => {
  /* the shell's own frame reads, `bootstrap` among them (interface-shell R36: public, once, for the test-instance band), read from
     the shell's declaration of them (N1073) */
  const FRAME = new Set(SHELL_OPS);
  const ours = new Set([...SCREENS.flatMap((s) => s.acts.map((a) => a.op)), ...READS, "allocid", "promote", "select", "image", "heldat", "projectquestions", "captureseenin"]);
  const plane = { ...Object.fromEntries(READS.map((op) => [op, ok(VALUES[op])])),
                  openoriginal: { status: 200, bytes: "b", type: "application/pdf" }, openwithwarning: { status: 200, bytes: "b", type: "application/pdf" } };
  const pages = [];
  /* the ops that name only the capture are open-file's own: the reads it asks for a capture, and its five acts (R5) */
  const [OF, ofReads, ofActs] = declared("open-file");
  const OF_OPS = new Set([...Object.values(OF.reads({ subject: SHA, me: MEMBER, data: {}, ui: {} })).filter((r) => r.query && r.query.capture).map((r) => r.op), ...ofActs]);
  assert.ok(OF_OPS.size >= 9 && ofReads.length >= 5);
  /* open-file, every act pressed */
  const f = await open(`/app/open-file/${SHA}`, { plane: { ...plane, threatof: ok({ ok: true, threat: "high", reasons: [], scan_hold: null }) } });
  fill(f, { "co-device": true, "co-macros": true });
  await press(f, "openwithwarning");
  await press(f, "safeview", { reason: "r" });
  await press(f, "deepercheck", { reason: "r" });
  pages.push(f);
  const l = await open(`/app/open-file/${SHA}`, { plane: { ...plane, threatof: ok({ ok: true, threat: "low", reasons: [] }) } });
  await press(l, "openoriginal");
  pages.push(l);
  const h = await open(`/app/open-file/${SHA}`, { plane });
  await press(h, "releasescanhold", { reason: "r" });
  pages.push(h);
  for (const path of [...PATHS.held, ...PATHS.archive, ...PATHS.inbox, ...PATHS.capture]) pages.push(await open(path, { plane, reachable: true }));
  for (const p of pages) {
    for (const r of p.requests) {
      if (FRAME.has(r.op)) continue;
      assert.ok(ours.has(r.op), `request ${r.op} is one of the screens' ops`);
      /* R4 (fix round 10, cause 33; DEC-97 clause 1): the Held list's own filter, the `member` of `heldcaptures` (the op's own field), names the viewer's own id and no
         file; no other request names a member (R9 is about which member opened which file) */
      const own = (k) => k === "member" && r.op === "heldcaptures" && r.query.member === MEMBER.member;
      for (const k of [...Object.keys(r.query).filter((x) => x !== "op"), ...Object.keys(r.body && typeof r.body === "object" ? r.body : {})])
        assert.ok(own(k) || !["member", "viewer", "by", "author", "who", "opened_by", "session", "token"].includes(k), `${r.op} names ${k}`);
      if (OF_OPS.has(r.op)) assert.deepEqual(Object.keys(r.query).filter((k) => !["op", "override"].includes(k)), ["capture"], r.op);
    }
    /* the page's storage holds only the shell's own keys: the session record (interface-shell R32, in local storage) and
       its level, theme and width; nothing of these screens */
    assert.deepEqual([...p.store.keys()].filter((k) => k !== "bio-session:frame"), [], "session storage holds nothing");
    assert.ok(p.local.has("bio-session"), "the session record, in local storage");
    for (const k of p.local.keys()) assert.match(k, /^(cs-|bio-session(:active)?$)/, `local storage key ${k} is the shell's`);
  }
});
