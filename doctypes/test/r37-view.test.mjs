/* doctypes — R37 over a classification view (fix round 9, K4892). Every registered type's `detect`, over the view docprofile
 * hands the types for a 3 MiB sheet (CLASSIFY_VIEW_MAX_CHARS, 1.5 M characters), leaves little uncollected garbage: each type
 * flattens the view once per `detect`, not once per pass. Measured in a child (./r37-view-child.mjs) with a 2 MB young
 * generation and no collection after the `detect`, as the plane's isolate runs: a large-object string is freed only by a major
 * collection, so in one tick of an isolate that is shared they pile up. Before the fix `regulation` left 37.0 MB, `meeting_minutes`
 * 12.6 MB, `meeting_agenda` 1.1 MB, `staff_report` 1.0 MB. The bar is counts of megabytes, never a time (R-CLOCK).
 * The answers are unchanged on every fixture: bounded.test.mjs, g140.test.mjs, doctypes.test.mjs and the type suites. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { DOCTYPES } from "../index.mjs";
import { flatWindows, counted } from "../windows.mjs";

/* Proposed (BOB records): a detect leaves under 6 MB of garbage over the 1.5 M-character view. Measured at 3.8 MB for the
   worst type (`regulation`: the one flat string and its parts), 0.0 to 1.0 for the rest; 37.0 before. */
const LEFT_MB = 6;
const CHILD = fileURLToPath(new URL("./r37-view-child.mjs", import.meta.url));

function child() {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, ["--expose-gc", CHILD], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code) => resolve({ code, out, err }));
    setTimeout(() => p.kill("SIGKILL"), 120_000).unref();
  });
}

test("R37 every type's detect over a 3 MiB sheet's classification view leaves under 6 MB uncollected, with no collection in the stretch", async () => {
  const r = await child();
  assert.equal(r.code, 0, r.err.slice(-400));
  const m = JSON.parse(r.out.trim().split("\n").pop());
  assert.ok(m.of > 3_000_000 && m.chars < m.of && m.chars <= 1.5 * 1024 * 1024, `the view is ${m.chars} of ${m.of} characters`);
  assert.deepEqual(Object.keys(m.types), DOCTYPES.map((t) => t.key), "every registered type is measured");
  for (const [key, t] of Object.entries(m.types)) assert.ok(t.leftMB < LEFT_MB, `${key} left ${t.leftMB.toFixed(1)} MB over a ${m.chars}-character view`);
  for (const [key, t] of Object.entries(m.types))
    if (key !== "generic") assert.ok(t.work > 0 && t.work <= 4 * m.chars, `${key} charged ${t.work} characters to ctx.work (R40)`);
});

test("R37 the one flat string a detect scans is flatten(text): every white-space character, lone surrogates and every length of run", () => {
  const WS = ["\t", "\n", "\v", "\f", "\r", " ", " ", " ", " ", " ", " ", " ", " ", " ", "　", "﻿"];
  const NOT = ["\u0085", "᠎", "​", "⁠", "a", "Z", "9", "😀", "\ud83d", "\ude00", "é", "-"];
  let seed = 7;
  const rnd = (n) => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % n;
  for (let round = 0; round < 40; round++) {
    let text = "";
    for (let i = 0, n = 1 + rnd(900); i < n; i++) text += rnd(3) ? (rnd(2) ? WS[rnd(WS.length)] : NOT[rnd(NOT.length)]) : WS[rnd(WS.length)].repeat(1 + rnd(4));
    const want = text.replace(/\s+/g, " ");
    /* in a detect (one flat string) and outside one (windows of 7 characters with 3 of padding) */
    let inside = null;
    counted({ key: "t", detect(ctx) { inside = [...flatWindows(ctx.text)]; return { match: false }; } }).detect({ text, work: { chars: 0 } });
    assert.equal(inside.length, 1, "one window");
    assert.equal(inside[0].buf.slice(inside[0].from, inside[0].to), want);
    let outside = "";
    for (const w of flatWindows(text, { chunk: 7, pad: 3 })) outside += w.buf.slice(w.from, w.to);
    assert.equal(outside, want);
  }
});
