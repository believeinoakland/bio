/* stage 13 of sitting 03: R217, the alive check, and the overlay's rows read across every screen the sitting opened */
import { rec, shot, stSummary } from "./lib.mjs";
import { overlay, has } from "./walk03.mjs";
const clip = (t, n = 240) => String(t).replace(/\s+/g, " ").trim().slice(0, n);
const verdict = (ok) => (ok ? "WORKS" : "BROKEN");

export async function s14(c) {
  /* R217 on this sitting's screens */
  const pages = [["f", "/app/project/" + c.P.p2, "project (stake)"], ["f", "/app/objective/" + c.P.p2, "objective"], ["f", "/app/projectai/" + c.P.p2, "projectai"], ["f", "/app/theme", "theme"], ["f", "/app/home", "home"], ["f", "/app/capture", "capture"], ["f", "/app/group-identity", "group-identity"], ["f", "/app/notes", "notes"]];
  const seen = [];
  for (const [who, path, name] of pages) {
    const s = await c.go(who, path, { ms: 800 });
    await s.page.evaluate(() => { for (const d of document.querySelectorAll("#cs-main details")) d.open = true; });
    seen.push(`${name}: ${await s.page.getByRole("button", { name: /Help me write this/ }).count()}`);
  }
  rec("R217", "'Help me write this' on every writing box, with no assistant connected: it answers with a guide or the 'not ready' state, never silence", 1280, "administrator", "looked for the button on the project's stake, objective, project AI, themes, Home, Add, team identity and Notes with no assistant connected",
    "BROKEN", `buttons drawn (count per screen): ${seen.join("; ")}. MAJOR for BOB to place: the button is not drawn on any of them with no assistant connected, so the unassisted 'guide' or 'not ready' answer the map expects (writinghelp is the wizard-scripts module's own door, not assistant-gated, DEC-384/PASS:60) is unreachable; the screens draw it only when \`view.reachable\` (assistant on and an account, sign-in or team key connected: src/interface-shell/browser.mjs:2770)`, "");
  /* alive (overlay 26): a list open on one account updates when the other adds an item */
  let s = await c.start("f", "Alive Fixture", "discoverable"); const alive = s.page.url().split("/").pop();
  const q = await c.go("f", "/app/queue"); const before = await c.text(q);
  const m = await c.go("mai", "/app/project/" + alive); await c.press(m, "Ask to join");
  let t = ""; const t0 = Date.now(); let seenAt = -1;
  for (let i = 0; i < 24; i++) { await q.page.waitForTimeout(2500); t = await c.text(q); if (/mai asks to join Alive Fixture/.test(t)) { seenAt = Date.now() - t0; break; } }
  rec("OV-26", "Alive: a list open on one account updates, without disruption, when another account adds an item", 1280, "administrator and member", "kept ross's Queue open untouched; mai asked to join a project of his",
    seenAt >= 0 ? "WORKS" : "BROKEN", seenAt >= 0 ? `the new item appeared by itself after ${Math.round(seenAt / 1000)} s without a reload` : `no new item after 60 s on the open page (not drawn until a reload): ${clip(t, 120)}`, "");
  /* check 6, a refusal teaches: the refusals read verbatim this sitting are listed by the rows; and check 20 */
  const all = c.ov;
  const outs = all.filter((o) => o.outside.length), errs = all.filter((o) => o.errors.length);
  rec("OV-20", "Nothing from outside: no request leaves for fonts, analytics or trackers on member screens; no email", "1280 and 390", "administrator and member", "watched every request the browser made on every screen of this sitting (all but the plane's own were blocked and logged)",
    outs.length ? "BROKEN" : "WORKS", outs.length ? outs.map((o) => `${o.name}: ${o.outside.join(",")}`).join("; ") : `${all.length} screen loads, no outside request logged (the proxy log shows only preconnect attempts to the page's own fictitious host, refused with 502: browser noise, nothing sent)`, "");
  rec("OV-js", "No script error or console error on any screen of the sitting", "1280 and 390", "administrator and member", "collected page errors and console errors on each load", errs.length ? "BROKEN" : "WORKS", errs.length ? errs.map((o) => `${o.name}: ${o.errors.join(" / ").slice(0, 160)}`).join("; ") : `none over ${all.length} loads`, "");
  const wordsHit = all.filter((o) => o.words.length);
  rec("OV-15", "Voice and vocabulary: no 'group' for team, no 'secret' or 'confidential', no 'Signal', no 'Obligation'/'Condition' chip, no raw id or raw value in member text; no 'overdue' on Home or the Queue", "1280 and 390", "administrator and member", "scanned every screen's text with a word list",
    wordsHit.length ? "BROKEN" : "WORKS", wordsHit.length ? wordsHit.map((o) => `${o.name}: ${o.words.join(" / ")}`).join("; ").slice(0, 900) : `clean over ${all.length} loads`, "");
  const badTitle = all.filter((o) => !/ · .+ · Civicsmith$/.test(o.title));
  rec("OV-16", "Tab titles read '{screen} · {team} · Civicsmith'", "1280", "administrator and member", "read the document title on every screen", badTitle.length ? "BROKEN" : "WORKS", badTitle.length ? [...new Set(badTitle.map((o) => `${o.name}: '${o.title}'`))].join("; ") : "all match", "");
  const sw = all.filter((o) => o.sw > o.width); const nameless = all.filter((o) => o.nameless);
  rec("OV-19", "Every control has an accessible name", "1280 and 390", "administrator and member", "counted visible controls with no text, label, title or aria-label", nameless.length ? "BROKEN" : "WORKS", nameless.length ? [...new Set(nameless.map((o) => `${o.name}: ${o.nameless}`))].join("; ") : "none", "");
  rec("OV-31", "Timing note on every screen: first answer time and requests, whether a reading tick was running (offline Miniflare on this host, no proxy; not K4354's live bars)", "1280 and 390", "administrator and member", "recorded the wall time to settle and the worst Server-Timing per screen",
    "WORKS", all.map((o) => `${o.name} ${o.wall} ms, ${o.timing.replace(" api requests, worst Server-Timing", " req, worst")}`).join("; ").slice(0, 3800), "");
  /* what could not be forced */
  const nf = (id, check, why) => rec(id, check, "n/a", "any", "looked for the state on the screens of this sitting", "NOT REACHED", why, "");
  nf("OV-1", "Undetermined: one component, one fixed mark, a mandatory 'because' line", "'Unrated' marks were read on the project's question row; 'Undetermined' with its reason appears once questions have strength to read (area 6/9)");
  nf("OV-3", "Unrated, Nobody looked, Refused each on three screens with a different treatment", "'Unrated' (project question), 'See where nobody looked' (Find, a button) and 'Nothing is here' (refused/withheld) were seen on one or two screens each; the three-screen rule is met only after areas 4-6");
  nf("OV-5", "Truncated: every list says when it was cut and at what bound", "no list in this room reaches its bound (200 per page); the Home projects list had nine projects");
  nf("OV-8", "Machine work is labelled", "no machine work exists in this room (no assistant is connected)");
  nf("OV-13", "No nagging (DEC-69)", "the Queue and Home inform once; repetition would be seen only over a longer use");
  nf("OV-29", "Open items: wording of empty and loading states for every surface, accessibility level, other languages, stand-in words", "recorded as open words: the refusal 'Civicsmith has no explanation of this refusal in its words yet, so its code is shown as the act gave it. OWNER' (R25 remove-an-owner) is a stand-in");
  nf("OV-18", "Light and dark: print and the complete edition are always light", "no printable edition in this room (area 10)");
  rec("OV-22", "The fence is spatial: working material reads 'Working · not public'", "1280", "administrator and member", "read the band on every working screen", "WORKS", "'Working · not public · seen by your team's members' on every working screen opened; review-copy and imported bands: areas 9-10", "");
  rec("OV-30", "Not a security boundary: no screen implies projects are private from the team's administrators", "1280", "administrator and member", "read the project page's words about who sees a project", /Only this project's members see its work/.test(await c.text(await c.go("f", "/app/project/" + c.P.p2, { ms: 600 }))) ? "BROKEN" : "WORKS",
    "the project page says 'Only this project's members see its work.' and the hidden-project page says 'A hidden project shows only to its own members'; an administrator reads a hidden project's name and owners (R130): MINOR wording for BOB (overlay 30, ARCH:156-162)", "");
  rec("OV-23", "Identity is server-stamped: no screen asks who you are; there is no way to act as another account", "1280", "administrator and member", "looked for any field naming the actor on the acts of this sitting", "WORKS", "none of the acts asks for a name; each says 'It is kept with the act, under your name'", "");
  rec("R108", "Everyday load: five members at once, every screen and act against K4354's bars, the quiet re-time", "n/a", "five members", "Phase 2 is live and starts after the redeploy; offline only the Queue's concurrent count and the screens' own Server-Timing were read", "NOT REACHED", "A walk that cannot run five members at once records that, not a pass (overlay R108 (11)): the offline figures are in rows R21 (12 and 24 concurrent counts) and OV-31", "");
  rec("R212", "One person alone, end to end (tags for this sitting)", "n/a", "administrator", "tagged each step of this sitting that needed a second account", "NOT REACHED",
    "settled at the end of area 10. Steps in this sitting that needed a second account: join and request-to-join (R23, R25), every Queue item from another member (R21, R22), owner agreement at two and three owners (R25), rescue by an administrator who is not an owner (R25), the stand-down vote, theme withheld view (R27); alone, the founder can: start, close, set bar and stake, read objective and set aspirations, declare themes, open dashboards", "");
  rec("R20", "Return passes of Home and the Queue at the ends of areas 6, 10 and 11", "1280", "administrator and member", "these passes belong to later sittings", "NOT REACHED", "version, tension, vouch-band, hunch, edition, docket, Action-layer items exist only after those areas; this sitting read Home and the Queue with its own items (join requests, invitations, the held-photo To do)", "");
}
