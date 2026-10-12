/* screens-intake R8, R9 and the screen contract (interface-shell R21, R5, R10) over all four screens, at the module's
 * interface: `SCREENS` and `SCREEN_WORDS` as exported, every function run as the page would hold it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SCREENS, SCREEN_WORDS } from "../../../src/screens-intake/index.mjs";
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";
import { SCREEN_REGISTRY } from "../../../src/wizard-scripts/index.mjs";
import { OPS, SESSION_OPS } from "../../../src/op-declarations/index.mjs";
import { pageScreen, kit, viewOf, press, ok } from "./kit.mjs";

const SHA = "a".repeat(64);
const SUBJECTS = { capture: [null, "address", "file", "saw"], held: [null], "open-file": [SHA], inbox: [null, "KNOCK-2026-10-03-9c1f0a2b"] };
const VALUES = {
  held: ok({ held: [{ bundle_id: "INFO-1", title: "T", project: "P", age_days: 1, eligible: false, class: "contested",
                      captured_for: { questions: [{ question: "Q", title: "Q?", asker: "Ana" }], withheld: "w" } }], truncated: true }),
  threat: ok({ threat: "high", reasons: [{ code: "x", translation: "Why." }], scan_hold: { names: ["N"] } }),
  state: ok({ may_open: true, path: "warned" }), notes: ok({ notes: [{ tool: "t", engine: "e", result: "clean", scanned_at: "2026-10-01T00:00:00Z" }] }),
  findings: ok({ findings: [{ captureSha: SHA, findings: ["N"] }] }), status: ok({ queued: 1, overdue: 0, held: 1 }),
  list: ok({ inbox: [{ knock_id: "KNOCK-2026-10-03-9c1f0a2b", bytes: 10, received: "2026-10-03T00:00:00Z", status: "new", note: "n", pseudonym: "p" }] }),
  knock: ok({ ok: true, item: { knock_id: "KNOCK-2026-10-03-9c1f0a2b", bytes: 10, status: "new", note: "n" } }),
};
const ME = { member: "MEM-1", administer: true };
const UI = { capture: { captured: { title: "T", bundleId: "INFO-1" }, requested: "https://x.example/a", watching: "T", uploaded: { name: "f" },
                        testified: "INFO-2", draft: { text: "D", untested: true }, promoteRefused: "No." },
             held: { setAside: ["INFO-1"], waiting: [{ asker: "Ana", title: "Q?" }], released: 1, restored: 1 },
             "open-file": { opened: true, release: "pending", safe: { kind: "data", sheets: [{ name: "S", cells: [{ ref: "A1", value: 1 }] }] }, deeper: { state: "running" }, refused: "No." },
             inbox: { pulled: "pulled", discarded: true, linked: true } };

/* Every view of a screen: each subject, each read in each of R10's four states, with and without what acts leave. */
function* everyView(S) {
  for (const subject of SUBJECTS[S.id]) for (const reachable of [false, true]) for (const withUi of [false, true]) {
    const reads = Object.keys(S.reads(viewOf(S, { subject, me: ME })));
    for (const st of ["ok", "loading", "empty", "failed"]) {
      const data = {};
      for (const k of reads) data[k] = st === "ok" ? VALUES[k] : st === "failed" ? { state: "failed", refusal: { code: "X", words: "it failed" } } : { state: st };
      yield viewOf(S, { subject, data, me: ME, reachable, ui: withUi ? structuredClone(UI[S.id]) : {} });
    }
  }
}

test("R8 SCREENS meets interface-shell R21: the four registry screens, each {id, reads, render, acts, words}, frozen", () => {
  assert.deepEqual(SCREENS.map((s) => s.id), ["capture", "held", "open-file", "inbox"]);
  assert.ok(Object.isFrozen(SCREENS));
  for (const s of SCREENS) {
    assert.ok(Object.isFrozen(s));
    assert.equal(typeof s.reads, "function");
    assert.equal(typeof s.render, "function");
    assert.ok(Array.isArray(s.acts) && s.acts.length);
    assert.ok(SCREEN_REGISTRY.some((r) => r.id === s.id), `${s.id} is a registry screen`);
    for (const a of s.acts) assert.equal(typeof a.send, "function", `${s.id} ${a.op}`);
  }
});

test("R8 every act names one op OPS holds and a member's session reaches, the registry's for its screen or its re-point", () => {
  for (const s of SCREENS) {
    const reg = SCREEN_REGISTRY.find((r) => r.id === s.id);
    const listed = new Set([...(reg.acts || []).map((a) => (typeof a === "string" ? a : a.op)), ...(reg.owed || []).map((o) => o.op)]);
    if (listed.has("capture")) listed.add("captureupload");   /* draft-T46-interface.md §3 item 1 */
    for (const a of s.acts) {
      assert.ok(OPS[a.op], `${s.id}: ${a.op} in OPS`);
      assert.ok(SESSION_OPS.member.has(a.op), `${s.id}: ${a.op} reached by a member's session`);
      assert.ok(listed.has(a.op), `${s.id}: ${a.op} the registry's`);
    }
    /* every registry act is drawn by the screen (DEC-139 (6)), but the re-pointed `capture` */
    for (const op of listed) if (op !== "capture") assert.ok(s.acts.some((a) => a.op === op), `${s.id} draws ${op}`);
    for (const r of Object.values(s.reads(viewOf(s, { subject: SUBJECTS[s.id].at(-1), me: ME }))))
      assert.ok(OPS[r.op] && OPS[r.op].mutating === false && SESSION_OPS.member.has(r.op), `${s.id}: read ${r.op} is a read a member reaches`);
  }
});

test("R8 after an act the screen reads again what it changed (every read, or none on a screen with none)", () => {
  for (const s of SCREENS) {
    const reads = Object.keys(s.reads(viewOf(s, { subject: SUBJECTS[s.id].at(-1), me: ME })));
    for (const a of s.acts) {
      if (reads.length) assert.equal(a.rereads, undefined, `${s.id} ${a.op} reads everything again`);
      else assert.deepEqual([...(a.rereads || [])], [], `${s.id} ${a.op}`);
    }
  }
});

test("R8 (interface-shell R5, R10) every view of every screen draws only held words, and each read's four states", () => {
  const WR = new Set(WORD_ROWS.map((r) => r[0]));
  for (const raw of SCREENS) {
    const S = pageScreen(raw);
    for (const w of S.words) if (!Array.isArray(w)) assert.ok(WR.has(w), `${S.id}: ${w} is a WORD_ROWS key`);
    for (const view of everyView(S)) {
      const { cs } = kit(S, view);
      const html = S.render(cs, view);   /* the stand-in's w throws on any key no list holds for the screen */
      assert.equal(typeof html, "string");
      const states = Object.values(view.data).map((d) => d.state);
      if (states.includes("failed")) { assert.match(html, /data-state="failed"/); assert.doesNotMatch(html, /data-state="empty"/); }
      if (states.includes("empty")) { assert.doesNotMatch(html, /data-state="failed"/); }
      if (states.includes("loading")) assert.match(html, /data-state="loading"/);
    }
  }
});

test("R8 (interface-shell R5) SCREEN_WORDS: frozen [key, en, protected] rows, keys distinct, the screens' own or the re-held two", () => {
  assert.ok(Object.isFrozen(SCREEN_WORDS));
  const keys = SCREEN_WORDS.map((r) => r[0]);
  assert.equal(new Set(keys).size, keys.length);
  for (const r of SCREEN_WORDS) {
    assert.ok(Object.isFrozen(r) || Array.isArray(r));
    assert.equal(r.length, 3);
    assert.equal(typeof r[1], "string");
    assert.equal(typeof r[2], "boolean");
    assert.ok(/^screen\.(capture|held|open-file|inbox)\./.test(r[0]) || ["mark.gap.refused.means", "ai.label.untested"].includes(r[0]), r[0]);
  }
  /* DEC-149: the re-held mark names the group's Civicsmith, never bare */
  const refused = SCREEN_WORDS.find((r) => r[0] === "mark.gap.refused.means")[1];
  assert.match(refused, /your group's Civicsmith/);
  assert.equal(SCREEN_WORDS.find((r) => r[0] === "ai.label.untested")[1],
    "Not yet tested: this part of the assistant has not yet passed Civicsmith's tests on real matters. Check what it says against the record.");
  /* every own row is drawn by some screen's words list */
  const listed = new Set(SCREENS.flatMap((s) => s.words.map((w) => (Array.isArray(w) ? w[0] : w))));
  for (const k of keys) assert.ok(listed.has(k), k);
});

test("R8 every act's label is a held word, and every act control is drawn only when the session may do it (shell R12)", () => {
  for (const raw of SCREENS) {
    const S = pageScreen(raw);
    const keys = new Set(S.words.map((w) => (Array.isArray(w) ? w[0] : w)));
    for (const a of S.acts) assert.ok(keys.has(a.label), `${S.id} ${a.op} label ${a.label}`);
    for (const view of everyView(S)) {
      const html = S.render(kit(S, view, { can: () => false }).cs, view);
      assert.doesNotMatch(html, /data-act=/, `${S.id}: no act when none is allowed`);
    }
  }
});

/* Every act of every screen pressed with its fields filled. */
async function pressAll() {
  const out = [];
  const values = { "ci-address": "https://x.example/a.pdf", "ci-how-made": true, "ci-where": "w", "ci-what": "x", "ci-words": "x", "ci-when": "2026-10-01T00:00:00Z",
                   "co-device": true, "co-macros": true, "cx-source": "SRC-1", "cx-to": "SRC-2", "cx-evidence": "e" };
  const answers = { acquire: { ok: true, document: { capture: { sha256: SHA, bytes: 1 }, file: "f" } }, allocid: { ok: true, id: "INFO-2026-0001" },
                    promote: { ok: true, bundleId: "INFO-2026-0001-a-pdf" }, select: { ok: true, handle: "SEL" },
                    openoriginal: { bytes: 1 }, openwithwarning: { bytes: 1 }, safeview: { bytes: 1, pages: 1 } };
  for (const raw of SCREENS) {
    const S = pageScreen(raw);
    for (const a of S.acts) {
      const view = viewOf(S, { subject: SUBJECTS[S.id].at(-1), me: ME, reachable: true, data: { state: ok({ path: "warned", may_open: true }) },
                               ui: structuredClone(UI[S.id]) });
      const r = await press(S, view, a.op, { values, files: { "ci-file": { name: "f.jpg" } }, picked: ["INFO-1"], reason: "r",
                                             fields: { acknowledgment: "a", mitigation: "m" }, dataset: { bundle: "INFO-1" }, answers });
      out.push({ screen: S.id, op: a.op, requests: r.kit.requests });
    }
  }
  return out;
}

test("R9 no act or read records which member opened which file: every request is an op naming no member, and nothing is stored", async () => {
  /* the functions run as the page holds them, in a context with no storage, cookie, fetch or document: any use throws */
  const pressed = await pressAll();
  assert.equal(pressed.length, SCREENS.reduce((n, s) => n + s.acts.length, 0));
  for (const p of pressed) {
    assert.ok(p.requests.length, `${p.screen} ${p.op} made its request`);
    for (const q of p.requests) {
      assert.ok(OPS[q.op], `${p.screen}: ${q.op} is an op`);
      for (const k of [...Object.keys(q.query || {}), ...Object.keys(q.body && typeof q.body === "object" ? q.body : {})])
        assert.ok(!["member", "viewer", "by", "author", "who", "opened_by", "session", "token"].includes(k), `${p.screen} ${q.op} names ${k}`);
    }
  }
  /* open-file's requests carry the capture's digest and nothing of the member's */
  for (const p of pressed.filter((x) => x.screen === "open-file"))
    for (const q of p.requests) assert.deepEqual(Object.keys(q.query).filter((k) => k !== "override"), ["capture"], `${p.op}`);
  /* the views as well: rendering every view of open-file touches nothing but the kit */
  const S = pageScreen(SCREENS.find((s) => s.id === "open-file"));
  for (const view of everyView(S)) {
    const k = kit(S, view);
    S.render(k.cs, view);
    assert.equal(k.requests.length, 0, "a render makes no request");
  }
});
