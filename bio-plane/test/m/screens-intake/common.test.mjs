/* screens-intake R8, R9 and the screen contract (interface-shell R21, R5, R10, R12) over all five screens, on the real
 * served page: `interfacePage(SCREENS)` through interface-shell's harness. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { interfacePage, checkScreens } from "../../../src/interface-shell/index.mjs";
import { SCREENS, SCREEN_WORDS } from "../../../src/screens-intake/index.mjs";
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";
import { SCREEN_REGISTRY } from "../../../src/wizard-scripts/index.mjs";
import { OPS, SESSION_OPS, NEEDS } from "../../../src/op-declarations/index.mjs";
import { pending } from "../interface-shell/harness.mjs";
import { open, html, text, main, ok, refused, MEMBER, rawKeys, fill, press } from "./page.mjs";

const SHA = "a".repeat(64);
const PATHS = { capture: ["/app/capture/address", "/app/capture/file", "/app/capture/saw"], held: ["/app/held"], archive: [`/app/archive/${SHA}`],
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
};
const EMPTY = { heldcaptures: { ok: true, held: [] }, verdictnotes: { ok: true, notes: [] }, inbox: { inbox: [] },
                archivelist: { ok: true, archive: {}, summary: {}, entries: [] } };
const READS = Object.keys(VALUES);

test("R8 R15 SCREENS meets interface-shell R21: five registry screens, archive among them, served by interfacePage without a throw", () => {
  assert.deepEqual(SCREENS.map((s) => s.id), ["capture", "held", "archive", "open-file", "inbox"]);
  assert.ok(Object.isFrozen(SCREENS));
  assert.equal(checkScreens(SCREENS), true);
  assert.match(interfacePage(SCREENS), /<script nonce=/);
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
      assert.ok(SESSION_OPS.member.has(a.op), `${s.id}: ${a.op} reached by a member's session`);
      assert.ok(listed.has(a.op), `${s.id}: ${a.op} the registry's`);
    }
    for (const op of listed) if (op !== "capture") assert.ok(s.acts.some((a) => a.op === op), `${s.id} draws ${op}`);
  }
});

test("R8 after an act the screen reads again what it changed (every read, or none on a screen with none)", () => {
  for (const s of SCREENS) {
    const reads = Object.keys(s.reads({ subject: SHA, me: MEMBER, data: {}, ui: {} }));
    for (const a of s.acts) {
      if (reads.length) assert.equal(a.rereads, undefined, `${s.id} ${a.op} reads everything again`);
      else assert.deepEqual([...(a.rereads || [])], [], `${s.id} ${a.op}`);
    }
  }
});

test("R8 (interface-shell R5, R10) every screen in each read's four states draws only words, and failed never as empty", async () => {
  const states = {
    ok: Object.fromEntries(READS.map((op) => [op, ok(VALUES[op])])),
    empty: Object.fromEntries(READS.map((op) => [op, ok(EMPTY[op] ?? VALUES[op])])),
    failed: Object.fromEntries(READS.map((op) => [op, refused("STORE_SILENT", "The record did not answer.")])),
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

test("R8 (interface-shell R5) SCREEN_WORDS: frozen [key, en, protected] rows, keys distinct, the screens' own or the re-held two", () => {
  assert.ok(Object.isFrozen(SCREEN_WORDS));
  const keys = SCREEN_WORDS.map((r) => r[0]);
  assert.equal(new Set(keys).size, keys.length);
  for (const r of SCREEN_WORDS) {
    assert.equal(r.length, 3);
    assert.equal(typeof r[1], "string");
    assert.equal(typeof r[2], "boolean");
    assert.ok(/^screen\.(capture|held|archive|open-file|inbox)\./.test(r[0]) || ["mark.gap.refused.means", "ai.label.untested"].includes(r[0]), r[0]);
  }
  /* DEC-149: the re-held mark names the group's Civicsmith, never bare */
  assert.match(SCREEN_WORDS.find((r) => r[0] === "mark.gap.refused.means")[1], /your group's Civicsmith/);
  assert.equal(SCREEN_WORDS.find((r) => r[0] === "ai.label.untested")[1],
    "Not yet tested: this part of the assistant has not yet passed Civicsmith's tests on real matters. Check what it says against the record.");
  const WR = new Set(WORD_ROWS.map((r) => r[0]));
  for (const s of SCREENS) for (const w of s.words) if (!Array.isArray(w)) assert.ok(WR.has(w), `${s.id}: ${w} is a WORD_ROWS key`);
  const listed = new Set(SCREENS.flatMap((s) => s.words.map((w) => (Array.isArray(w) ? w[0] : w))));
  for (const k of keys) assert.ok(listed.has(k), k);
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
  /* the shell's own frame reads, `bootstrap` among them (interface-shell R36: public, once, for the test-instance band) */
  const FRAME = new Set(["bootstrap", "whoami", "interfacewords", "groupidentity", "queue", "infolevel", "assistantstate", "accountreference", "subscriptionsignin", "groupkeystate"]);
  const ours = new Set([...SCREENS.flatMap((s) => s.acts.map((a) => a.op)), ...READS, "allocid", "promote", "select"]);
  const plane = { ...Object.fromEntries(READS.map((op) => [op, ok(VALUES[op])])),
                  openoriginal: { status: 200, bytes: "b", type: "application/pdf" }, openwithwarning: { status: 200, bytes: "b", type: "application/pdf" } };
  const pages = [];
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
      for (const k of [...Object.keys(r.query).filter((x) => x !== "op"), ...Object.keys(r.body && typeof r.body === "object" ? r.body : {})])
        assert.ok(!["member", "viewer", "by", "author", "who", "opened_by", "session", "token"].includes(k), `${r.op} names ${k}`);
      if (["threatof", "originalstate", "verdictnotes", "openoriginal", "openwithwarning", "safeview", "deepercheck", "releasescanhold"].includes(r.op))
        assert.deepEqual(Object.keys(r.query).filter((k) => !["op", "override"].includes(k)), ["capture"], r.op);
    }
    /* the page's storage holds only the shell's own keys: the session record (interface-shell R32, in local storage) and
       its level, theme and width; nothing of these screens */
    assert.deepEqual([...p.store.keys()], [], "session storage holds nothing");
    assert.ok(p.local.has("bio-session"), "the session record, in local storage");
    for (const k of p.local.keys()) assert.match(k, /^(cs-|bio-session(:active)?$)/, `local storage key ${k} is the shell's`);
  }
});
