/* D-176 — THE LIMIT OF UI-14's ALL-CLEAR IS STATED BESIDE THE ENTRY THAT CLAIMS IT.
 *
 * BOB #32 (2026-09-23): `CIVICOS_UI_STATE.md` is UI's file, and UI states the limit beside v46's
 * UI-14 entry. The limit: the queue's all-clear rests on an INTERPRETED feed-emptiness (the
 * resolutions feed counts the receipts THIS PAGE would paint, not its rows), that interpretation is
 * relative to page memory (`QUEUE_SEEN`) the record does not hold, and that memory is unbounded
 * for the life of the page. The literal fix is a RECORD read that is not built.
 *
 * TWO HALVES, because a statement is only worth pinning while it is TRUE:
 *   ARM A — the statement is in the ledger, BESIDE v46 (between v46's first line and the next
 *           entry's), naming the three facts it states. Missing or moved away → fails by name.
 *   ARM B — the code still carries the limit the statement describes. If somebody makes the
 *           all-clear literal or bounds the map, ARM B fails by name, and the remedy is to correct
 *           the D-176 block (the ledger is prepend-never-edit, so: a new dated addendum saying the
 *           limit is gone) — not to exempt this arm.
 *
 * WHAT THIS CANNOT SEE: ARM B is STRUCTURAL over `app.html`'s text (function bodies located by
 * name), not a drive of the screen — `queue.test.mjs` drives the all-clear's behaviour. A
 * `QUEUE_SEEN` emptied by some spelling other than `.delete(`, `.clear(` or reassignment would
 * pass ARM B unseen.
 *
 * NEGATIVE CONTROL: (A) the D-176 block deleted from CIVICOS_UI_STATE.md → exit 1 at
 * "A1 the D-176 limit block sits between v46 (UI-14) and v45"; (B) `QUEUE_SEEN.clear();` added to
 * renderQueue → exit 1 at "B3 nothing deletes from, clears or reassigns QUEUE_SEEN"; over-strictness
 * arm: the block reflowed to different line breaks → still green. Each restored and verified by
 * sha256 + cmp (2026-09-24, D-176 worker).
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282: this suite exits by process.exit; flush first (stdio-census ARM B1). */
import fs from "fs";
import { fileURLToPath } from "url";

const REPO = fileURLToPath(new URL("../../", import.meta.url));
const LEDGER = fs.readFileSync(REPO + "docs/development/CIVICOS_UI_STATE.md", "utf8");
const APP = fs.readFileSync(REPO + "civicos-ui/app.html", "utf8");
let n = 0; const fails = [];
function ok(name, cond){ n++; if(!cond){ fails.push(name); console.error("FAIL", name); } }

/* Floors: a check over an empty corpus passes for free. */
ok("corpus: the ledger is read (> 100 KB)", LEDGER.length > 100000);
ok("corpus: app.html is read (> 1 MB)", APP.length > 1000000);

/* ---- ARM A: the statement, beside v46 ---- */
{
  const lines = LEDGER.split("\n");
  const v46 = lines.findIndex(l => /^v46, .*\bUI-14\b/.test(l));
  const next = v46 < 0 ? -1 : lines.findIndex((l, i) => i > v46 && /^v\d+, /.test(l));
  ok("A0 v46's UI-14 entry and the entry after it are found", v46 >= 0 && next > v46);
  const span = v46 >= 0 && next > v46 ? lines.slice(v46, next).join("\n") : "";
  /* Reflow-proof: quote markers and line breaks collapsed before matching. */
  const flat = span.replace(/\n>\s?/g, " ").replace(/\s+/g, " ");
  ok("A1 the D-176 limit block sits between v46 (UI-14) and v45",
     /D-176 · THE LIMIT OF v46's ALL-CLEAR/.test(flat));
  ok("A2 it states the all-clear is an INTERPRETED emptiness (queueNotices, not the feed's rows)",
     /INTERPRETED feed-emptiness/.test(flat) && /queueNotices\(\)\.length/.test(flat) && /NOT the feed's rows/.test(flat));
  ok("A3 it states the all-clear is relative to page memory (QUEUE_SEEN) the record does not hold",
     /QUEUE_SEEN/.test(flat) && /the record does not hold/.test(flat));
  ok("A4 it states QUEUE_SEEN is unbounded for the life of the page",
     /unbounded for the life of the page/.test(flat));
  ok("A5 it names the literal alternative (a RECORD read) as NOT built",
     /what left this member's queue since they last looked/.test(flat) && /not built/.test(flat));
  ok("A6 it names this suite as its pin", /queue-allclear-limit\.test\.mjs/.test(flat));
}

/* ---- ARM B: the code still carries the limit ---- */
function body(name){
  const i = APP.search(new RegExp(`(?:async\\s+)?function\\s+${name}\\s*\\(`));
  if(i < 0) return "";
  const open = APP.indexOf("{", i); let d = 0;
  for(let j = open; j < APP.length; j++){
    if(APP[j] === "{") d++; else if(APP[j] === "}" && --d === 0) return APP.slice(i, j + 1);
  }
  return "";
}
{
  const yieldFn = body("queueFeedYield"), allClear = body("queueAllClearHtml");
  ok("B0 queueFeedYield and queueAllClearHtml are found", yieldFn.length > 0 && allClear.length > 0);
  ok("B1 the resolutions feed's yield is the receipts this page would paint, not its rows",
     /id\s*===\s*"resolutions"\)\s*return\s+queueNotices\(\)\.length/.test(yieldFn));
  ok("B2 the all-clear is gated on queueFeedYield", /queueFeedYield\(/.test(allClear));
  ok("B3 nothing deletes from, clears or reassigns QUEUE_SEEN",
     !/QUEUE_SEEN\s*\.\s*(delete|clear)\s*\(/.test(APP) &&
     (APP.match(/QUEUE_SEEN\s*=(?!=)/g) || []).length === 1);
  ok("B4 QUEUE_SEEN is filled by queueRemember, from what was painted",
     /QUEUE_SEEN\.set\(/.test(body("queueRemember")));
  ok("B5 queueNotices reads receipts only for ids in QUEUE_SEEN", /of QUEUE_SEEN/.test(body("queueNotices")));
}

if(fails.length){ console.error(`queue-allclear-limit: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`queue-allclear-limit: ${n} assertions, all green — D-176's limit is stated beside v46's UI-14 entry, and the code still carries the interpreted, page-relative, unbounded all-clear it describes`);
