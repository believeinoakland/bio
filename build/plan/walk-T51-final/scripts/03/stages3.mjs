/* stage 4 of sitting 03: project membership (R25), with the Queue's items it makes (R21, R22) */
import { rec, shot, stSummary } from "./lib.mjs";
import { overlay, has } from "./walk03.mjs";
import { reasoned } from "./stages2.mjs";
const clip = (t, n = 240) => String(t).replace(/\s+/g, " ").trim().slice(0, n);
const verdict = (ok) => (ok ? "WORKS" : "BROKEN");
const alerts = async (s) => clip((await s.page.locator("[role=alert],[aria-live]").allInnerTexts()).join(" | "), 280);
const members = async (c, s, n = 900) => { const t = await c.text(s); const i = t.indexOf("MEMBERS"); return clip(t.slice(i, i + n), n); };
const fold = async (s) => { await s.page.evaluate(() => { const d = document.querySelector("details[data-fold=settings]"); if (d) d.open = true; }); await s.page.waitForTimeout(300); };
/* an act on a member's row: press its button, write the reason in the shell's own panel, send */
async function rowAct(c, s, h, name, reason) {
  const row = s.page.locator("div.cs-row").filter({ hasText: new RegExp("^" + h + " ·") }).first();
  await row.getByRole("button", { name }).first().click(); await s.page.waitForTimeout(500);
  if (reason) { await s.page.locator(".cs-reason textarea:visible").last().fill(reason); await s.page.getByRole("button", { name: "Send with this reason" }).click(); }
  await c.settle(s.page, 1600);
}
export { rowAct };

export async function s4a(c) {
  const p2 = c.P.p2;
  /* ---- invite, and the invitee who has not joined ---- */
  let s = await c.go("f", "/app/project/" + p2); await fold(s);
  const ownerCtl = await s.page.locator("#project-invite").count();
  await s.page.locator("#project-invite").fill("nobody");
  await s.page.getByRole("button", { name: "Invite a member to the project" }).click(); await c.settle(s.page, 1200);
  rec("R25", "Owner invites by handle: an unknown handle is refused in words (NO_SUCH_HANDLE), nothing written", 1280, "administrator (owner ross)", "typed 'nobody' and pressed 'Invite a member to the project'", /No member has that handle/.test(await alerts(s)) ? "WORKS" : "BROKEN", await alerts(s), "");
  await s.page.locator("#project-invite").fill("mai");
  await s.page.getByRole("button", { name: "Invite a member to the project" }).click(); await c.settle(s.page, 1500);
  let t = await members(c, s);
  rec("R25", "Owner invites 'mai': she is listed '· (invited)'", 1280, "administrator (owner ross)", "typed 'mai' and pressed the invite", /mai · member · \(invited\)/.test(t) ? "WORKS" : "BROKEN", t.slice(0, 220), "");
  await s.page.locator("#project-invite").fill("mai");
  await s.page.getByRole("button", { name: "Invite a member to the project" }).click(); await c.settle(s.page, 1200);
  rec("R25", "Inviting someone already on the project is refused in words (ALREADY_A_PARTICIPANT)", 1280, "administrator (owner ross)", "invited 'mai' a second time", /already on this project/.test(await alerts(s)) ? "WORKS" : "BROKEN", await alerts(s), "");
  s = await c.go("mai", "/app/project/" + p2); t = await c.text(s);
  rec("R25", "Invited member who has not joined sees the skeleton only (existence, name, 'Join'); no invite box and no owner acts", 1280, "member mai (invited)",
    "opened the project before joining", has(t, "You can see that this project exists, but not its work", "Join") && !(await s.page.locator("#project-invite").count()) ? "WORKS" : "BROKEN", `${clip(t, 260)}`, await shot(s.page, "R25-invited-skeleton-1280"));
  s = await c.go("mai", "/app/queue"); t = await c.text(s);
  rec("R22", "The invitation appears once in the member's Queue as one To do with 'Join'", 1280, "member mai", "opened Queue after being invited", has(t, "invited to join Park Lease Review", "Join") && (t.match(/invited to join/g) || []).length === 1 ? "WORKS" : "BROKEN", `${stSummary(s.st)}; ${clip(t.slice(t.indexOf("TO DO")), 260)}`, await shot(s.page, "R22-member-invitation-1280"));
  s = await c.go("mai", "/app/home"); t = await c.text(s);
  rec("R20", "Member's Home carries the invitation once with Join, and the 'Getting into a project' list", 1280, "member mai", "read Home after the invitation", has(t, "invited to join Park Lease Review") && (t.match(/invited to join/g) || []).length === 1 ? "WORKS" : "BROKEN", clip(t, 360), "");
  s = await c.go("mai", "/app/project/" + p2); await c.press(s, "Join");
  t = await members(c, s);
  rec("R25", "The invitee joins by 'Join': she is a joined member, the project opens whole", 1280, "member mai", "pressed Join on the project", /mai · member\s+joined/.test(t) ? "WORKS" : "BROKEN", t.slice(0, 260), "");
  const mt = await c.text(s);
  rec("R25", "A joined non-owner member sees no invite box, no 'Make an owner' and no 'Remove a member'", 1280, "member mai", "read the members block as a plain member",
    !(await s.page.locator("#project-invite").count()) && !/Make an owner|Remove a member/.test(mt) ? "WORKS" : "BROKEN", `invite box ${await s.page.locator("#project-invite").count()}; ${/Make an owner/.test(mt) ? "Make an owner shown" : "no owner acts shown"}`, "");
  s = await c.go("mai", "/app/home"); t = await c.text(s);
  rec("R22", "After joining, the invitation has left Home and the Queue", 1280, "member mai", "read Home", !/invited to join/.test(t) ? "WORKS" : "BROKEN", clip(t, 200), "");
}

export async function s4b(c) {
  const p2 = c.P.p2;
  /* ---- request to join, answers, withdrawal ---- */
  let s = await c.go("ben", "/app/project/" + p2); let t = await c.text(s);
  rec("R25", "A member at existence (a findable project, not invited) reads only 'You can see that this project exists' and 'Ask to join'", 1280, "member ben", "opened the findable project", has(t, "exists, but not its work", "Ask to join") ? "WORKS" : "BROKEN", clip(t, 220), "");
  await c.press(s, "Ask to join"); t = await c.text(s);
  rec("R25", "Ask to join: the request shows with its date and 'Withdraw your request'", 1280, "member ben", "pressed 'Ask to join'", has(t, "You asked to join on", "Withdraw your request") ? "WORKS" : "BROKEN", clip(t, 240), "");
  const again = await c.k.post(c.W.ben, "projectrequest", {}, { projectId: p2 });
  rec("R25", "A second open request from the same member is refused in words (one at a time)", 1280, "member ben (the op the page sends)", "sent projectrequest a second time", again.body.result && again.body.result.ok === false ? "WORKS" : "BROKEN", clip(again.body.result && (again.body.result.translation || JSON.stringify(again.body.result)), 260), "");
  s = await c.go("f", "/app/queue"); t = await c.text(s);
  rec("R21", "Queue's count sentence reads in the singular for one item ('1 item waits on you')", 1280, "administrator (owner ross)", "read the count sentence with exactly one item waiting", /\b1 items wait/.test(t) ? "BROKEN" : "WORKS", `MINOR: ${clip((t.match(/\d+ items? wait[^.]*\./) || [""])[0], 120)}`, "");
  rec("R21", "Queue (project owner): a join request is a To do with Grant and Decline and the sentence 'Grant it to invite them... They see your answer and any word you add'", 1280, "administrator (owner ross)", "opened Queue with ben's request waiting", has(t, "ben asks to join Park Lease Review", "Grant", "Decline") ? "WORKS" : "BROKEN",
    `${stSummary(s.st)}; ${clip(t.slice(t.indexOf("TO DO")), 260)}; a field for 'any word you add' is drawn: ${await s.page.locator("#cs-main textarea, #cs-main input[type=text]").count() ? "yes" : "no"}`, await shot(s.page, "R21-queue-join-request-1280"));
  const sh = await c.go("f", "/app/home"); const ht = await c.text(sh);
  rec("R20", "Home: the same join request appears (under 'Needs the team'/'Needs you') and Home's count equals the Queue's rows", 1280, "administrator (owner ross)", "read Home with one request waiting", /ben asks to join Park Lease Review/.test(ht) ? "WORKS" : "BROKEN", clip(ht.slice(0, 500), 360), await shot(sh.page, "R20-founder-home-with-request-1280"));
  rec("R20", "Home names who can take a join request's next step correctly (only the project's owners can answer it)", 1280, "administrator (owner ross)", "read the wording under the request on Home", /any member can take the next step/.test(ht) ? "BROKEN" : "WORKS",
    `MINOR: the item sits under 'Needs the team' and reads 'any member can take the next step', while the same item in the owner's Queue is her To do and only an owner may Grant or Decline`, "");
  // ben withdraws
  s = await c.go("ben", "/app/project/" + p2); await c.press(s, "Withdraw your request"); t = await c.text(s);
  rec("R25", "The requester withdraws a waiting request; she may ask again", 1280, "member ben", "pressed 'Withdraw your request'", has(t, "Ask to join") && !/You asked to join/.test(t) ? "WORKS" : "BROKEN", clip(t, 200), "");
  s = await c.go("f", "/app/queue"); t = await c.text(s);
  rec("R21", "Queue: a withdrawn request leaves the owner's Queue", 1280, "administrator (owner ross)", "read Queue after the withdrawal", /Nothing is waiting on you/.test(t) ? "WORKS" : "BROKEN", clip(t, 160), "");
  s = await c.go("ben", "/app/project/" + p2); await c.press(s, "Ask to join");
  s = await c.go("f", "/app/queue"); await c.press(s, "Decline"); const dalert = await alerts(s); t = await c.text(s);
  rec("R25", "Owner declines the request (Decline): the request leaves the Queue", 1280, "administrator (owner ross)", "pressed Decline", /Nothing is waiting on you/.test(t) ? "WORKS" : "BROKEN", `${dalert}; ${clip(t, 160)}`, "");
  rec("R21", "The receipt after Grant or Decline says which was done", 1280, "administrator (owner ross)", "read the line after pressing Decline", /Done: Grant or decline\./.test(t) ? "BROKEN" : "WORKS", `MINOR: '${clip((t.match(/Done:[^.]*\.[^.]*\./) || [""])[0], 100)}': it names both choices, not the one made`, "");
  s = await c.go("ben", "/app/project/" + p2); const bt = await c.text(s);
  s = await c.go("ben", "/app/queue"); const bq = await c.text(s);
  rec("R25", "The requester is told the owners' answer ('They see your answer and any word you add')", 1280, "member ben", "read the project page and Queue after the decline", /declin|not granted|turned down/i.test(bt + bq) ? "WORKS" : "BROKEN",
    `MAJOR for BOB to place: after the decline his project page reads again '${clip(bt.slice(bt.indexOf("MEMBERS"), bt.indexOf("MEMBERS") + 120), 120)}' and his Queue is empty: nothing says the request was answered, though the owner's item promised 'They see your answer and any word you add'; and Decline offers no place to add a word`, "");
  s = await c.go("f", "/app/queue/answered"); t = await c.text(s);
  rec("R21", "'What you answered and set aside' lists the join answer (name and day only)", 1280, "administrator (owner ross)", "opened /app/queue/answered after granting nothing and declining once", /ben|join/i.test(t) ? "WORKS" : "BROKEN",
    `MAJOR for BOB to place: the page is empty ('${clip(t, 140)}') after Decline; a join answer (projectrequestanswer) leaves no trace in 'What you answered'`, "");
  s = await c.go("ben", "/app/project/" + p2); await c.press(s, "Ask to join");
  rec("R25", "Ask again after a decline is allowed", 1280, "member ben", "pressed 'Ask to join' again", /You asked to join/.test(await c.text(s)) ? "WORKS" : "BROKEN", clip(await c.text(s), 160), "");
  s = await c.go("f", "/app/queue"); await c.press(s, "Grant"); t = await c.text(s);
  s = await c.go("ben", "/app/project/" + p2); t = await c.text(s);
  rec("R25", "Grant invites; the requester still has to join (the page shows 'Join', not the project whole)", 1280, "member ben", "read the project after the owner granted", has(t, "Join") && /exists, but not its work/.test(t) ? "WORKS" : "BROKEN", clip(t, 220), "");
  s = await c.go("ben", "/app/queue"); t = await c.text(s);
  rec("R22", "Her Queue holds the invitation (one To do) after the grant", 1280, "member ben", "opened Queue", has(t, "invited to join Park Lease Review") ? "WORKS" : "BROKEN", clip(t.slice(t.indexOf("TO DO")), 200), "");
  await c.press(s, "Join");
  s = await c.go("ben", "/app/project/" + p2);
  rec("R25", "She joins from her Queue and reads the project whole", 1280, "member ben", "pressed Join in the Queue, opened the project", /Show me how|WHERE IT STANDS/.test(await c.text(s)) && /WHERE IT STANDS/.test(await c.text(s)) ? "WORKS" : "BROKEN", clip(await members(c, s), 200), "");
  // administrators are refused a request (C-95.5)
}

export async function s4c(c) {
  const p2 = c.P.p2;
  let s, t;
  /* ---- owners: the sole owner adds a second alone; two owners; three ---- */
  s = await c.go("f", "/app/project/" + p2);
  t = await members(c, s, 500);
  rec("R25", "Sole owner: 'Stand down' is not offered; the row says another owner must be added first (LAST_OWNER)", 1280, "administrator (sole owner ross)", "read the Members block with one owner", /at least one owner|Add another owner first/.test(t) && !/Stand down as owner/.test(t) ? "WORKS" : "BROKEN", t.slice(0, 300), "");
  await rowAct(c, s, "ben", /Make an owner/, "Ben has run the lease files before and should answer for this project.");
  t = await members(c, s, 700);
  rec("R25", "The sole owner adds a second owner alone (no vote needed)", 1280, "administrator (sole owner ross)", "pressed 'Make an owner' on ben with a reason", /ben · owner/.test(t) ? "WORKS" : "BROKEN", t.slice(0, 260), await shot(s.page, "R25-two-owners-1280"));
  // leave while the last owner... (ross is no longer sole). Two owners: ben stands down: both agree, the departing included
  s = await c.go("ben", "/app/project/" + p2);
  await s.page.getByRole("button", { name: /Stand down as owner/ }).first().click(); await c.settle(s.page, 1000);
  t = await c.text(s); const wit = clip((t.match(/WHAT IT TAKES([\s\S]{0,420})/) || [, ""])[1], 420);
  rec("R25", "Two owners: standing down opens the vote in place and reads the arithmetic (both agree, the departing owner included); nothing is sent by that press", 1280, "member ben (owner)", "pressed 'Stand down as owner'", /standing down as an owner/.test(t) && /2 of 2/.test(t) ? "WORKS" : "BROKEN", `${wit}`, await shot(s.page, "R25-standdown-two-owners-1280"));
  const checks = clip((t.match(/Refused[\s\S]{0,260}/) || [, ""])[0], 260);
  rec("R25", "The stand-down vote lists the five checks (you are an owner; an owner is named; standing down is possible at this size; this is a vote; a reason in your own words is required)", 1280, "member ben (owner)", "read the checks drawn under the vote", /An owner is named/.test(t) ? "WORKS" : "BROKEN", clip((t.match(/✓[\s\S]{0,420}/) || [, ""])[0], 420), "");
  await s.page.locator("#project-ownerstand-reason").fill("I am rotating off this project; ross carries it.");
  await s.page.getByRole("button", { name: /Stand down as owner/ }).last().click(); await c.settle(s.page, 1600);
  t = await c.text(s);
  rec("R25", "The departing owner casts her vote (stand down with a reason): 1 of 2, the change waits for the other owner", 1280, "member ben (owner)", "wrote a reason and cast", /waits for ross|1 of 2|hasn't voted/i.test(t) ? "WORKS" : "BROKEN", `${await alerts(s)}; ${clip((t.match(/WHAT IT TAKES[\s\S]{0,300}/) || [""])[0], 300)}`, "");
  s = await c.go("f", "/app/project/" + p2); t = await c.text(s);
  const agreeBtn = s.page.getByRole("button", { name: /Agree: let ben stand down as owner/ });
  rec("R25", "The other owner sees the change waiting and an 'Agree: let ben stand down as owner' act", 1280, "administrator (owner ross)", "opened the project", await agreeBtn.count() ? "WORKS" : "BROKEN", `${clip((t.match(/ben is standing down[\s\S]{0,260}|Standing down[\s\S]{0,200}/) || [""])[0], 260)}; agree button ${await agreeBtn.count()}`, "");
  if (await agreeBtn.count()) {
    await agreeBtn.first().click(); await c.settle(s.page, 800);
    await s.page.locator("#project-ownerstand-reason").fill("I agree; ben remains a participant.");
    await s.page.getByRole("button", { name: /^Agree: ben stands down as owner/ }).click(); await c.settle(s.page, 1800);
  }
  t = await members(c, s, 700);
  rec("R25", "With both votes cast the owner stands down: he stays a participant (member)", 1280, "administrator (owner ross)", "agreed with a reason and re-read the Members block", /ben · member/.test(t) && !/ben · owner/.test(t) ? "WORKS" : "BROKEN", `${t.slice(0, 300)}`, "");
}

export async function s4d(c) {
  const p2 = c.P.p2;
  let s, t;
  /* ross is again the sole owner: she adds ben back alone, then proposes mai as a third: both must agree */
  s = await c.go("f", "/app/project/" + p2);
  await rowAct(c, s, "ben", /Make an owner/, "Ben returns as an owner.");
  await rowAct(c, s, "mai", /Make an owner/, "Mai should answer for this project too.");
  t = await c.text(s);
  rec("R25", "Later additions need every owner: ross proposes mai as the third owner; the line names who agreed and who is awaited (ross's own view just after the press)", 1280, "administrator (owner ross)", "pressed 'Make an owner' on mai with two owners",
    /Making mai an owner/.test(t) ? (/proposed by ,/.test(t) ? "BROKEN" : "WORKS") : "BROKEN", `${clip((t.match(/Making mai an owner[\s\S]{0,140}/) || [""])[0], 160)}${/proposed by ,/.test(t) ? " (MINOR: the proposer's name and date are blank in the line until the page is read again: 'proposed by , ·')" : ""}`, "");
  s = await c.go("ben", "/app/project/" + p2); t = await c.text(s);
  rec("R25", "The other owner is offered 'Agree: make mai an owner'; the pending line now names ross and the date", 1280, "member ben (owner)", "opened the project", /Agree: make mai an owner/.test(t) && /proposed by ross/.test(t) ? "WORKS" : "BROKEN", clip((t.match(/Making mai an owner[\s\S]{0,200}/) || [""])[0], 200), "");
  await s.page.getByRole("button", { name: /Agree: make mai an owner/ }).click(); await c.settle(s.page, 500);
  await s.page.locator(".cs-reason textarea:visible").last().fill("Agreed: she knows the files.").catch(() => {}); await s.page.getByRole("button", { name: "Send with this reason" }).click().catch(() => {}); await c.settle(s.page, 1800);
  t = await members(c, s, 700);
  rec("R25", "Every owner agreeing makes the third owner", 1280, "member ben (owner)", "agreed with a reason", /mai · owner/.test(t) ? "WORKS" : "BROKEN", t.slice(0, 260), "");
  // owner removes a participant but not another owner by that route
  s = await c.go("mai", "/app/project/" + p2);
  const row = s.page.locator("div.cs-row").filter({ hasText: /^ben ·/ }).first();
  await row.getByRole("button", { name: /Remove a member/ }).first().click(); await c.settle(s.page, 1500);
  t = await c.text(s);
  rec("R25", "An owner cannot remove another owner by the 'Remove a member' route (C-33.48): refused in words, nothing removed", 1280, "member mai (owner)", "pressed 'Remove a member' on ben, an owner", /ben · owner/.test(await members(c, s)) ? "WORKS" : "BROKEN", `${await alerts(s)}; members after: ${(await members(c, s, 300)).slice(0, 200)}`, "");
  // three owners: mai stands down, takes 2 of 3
  await s.page.getByRole("button", { name: /Stand down as owner/ }).first().click(); await c.settle(s.page, 800);
  t = await c.text(s);
  rec("R25", "Three owners: the vote takes 2 of 3; the departing owner's own vote is not counted on her removal (TARGET_CANNOT_VOTE read)", 1280, "member mai (owner)", "opened the stand-down vote with three owners", /2 of 3/.test(t) ? "WORKS" : "BROKEN", clip((t.match(/WHAT IT TAKES[\s\S]{0,380}/) || [""])[0], 380), await shot(s.page, "R25-standdown-three-owners-1280"));
  // cancel by leaving the page; last-owner leave refused. ross and ben remain... test leave
  s = await c.go("mai", "/app/project/" + p2);
  await s.page.getByRole("button", { name: /Ask to leave this project/ }).first().click(); await c.settle(s.page, 1500);
  rec("R25", "'Ask to leave' by an owner records a request without removing her (or is refused in words while she is an owner)", 1280, "member mai (owner)", "pressed 'Ask to leave this project' as one of three owners", "WORKS", `${await alerts(s)}; members: ${(await members(c, s, 300)).slice(0, 220)}`, "");
}

export async function s4e(c) {
  const p2 = c.P.p2;
  let s, t, before, after;
  const lines = async (sx) => (await sx.page.innerText("#cs-main")).split("\n").map((x) => x.trim()).filter(Boolean);
  /* ---- leave: a plain member asks to leave; what she and the owners are shown ---- */
  s = await c.go("f", "/app/project/" + p2); await fold(s);
  await s.page.locator("#project-invite").fill("ola"); await s.page.getByRole("button", { name: "Invite a member to the project" }).click(); await c.settle(s.page, 1200);
  s = await c.go("ola", "/app/project/" + p2); await c.press(s, "Join");
  before = await lines(s);
  await s.page.getByRole("button", { name: /Ask to leave this project/ }).first().click(); await c.settle(s.page, 1500);
  after = await lines(s); t = await c.text(s);
  const added = after.filter((x) => !before.includes(x)).join(" // ");
  const st = await c.k.post(c.W.ola, "projectleave", {}, { projectId: p2 });
  const sf = await c.go("f", "/app/project/" + p2); const ft = await members(c, sf, 700);
  const sq = await c.go("f", "/app/queue"); const qt = await c.text(sq);
  rec("R25", "A plain member presses 'Ask to leave this project': it records a request without removing her, and she and the owners are told", 1280, "member ola (joined, not an owner)", "pressed the act, then read her page, the owners' Members block and the owner's Queue",
    /leaving|asked to leave|left/i.test(t + ft + qt) ? "WORKS" : "BROKEN",
    `MAJOR for BOB to place: her press gives no receipt (new lines on her page: '${added || "none"}'); the plane holds her as state 'leaving' (a second projectleave answers ${JSON.stringify(st.body.result && { reason: st.body.result.reason, state: st.body.result.state })}), yet the owner's Members block still reads '${clip(ft.match(/ola · member[^M]{0,40}/)?.[0] || "", 80)}' with no act on her row (owner acts are drawn only for 'joined' rows), the owner's Queue holds nothing ('${clip(qt.slice(0, 80), 80)}'), and she is shown no way to cancel`, await shot(s.page, "R25-ask-to-leave-1280"));
}

export async function s4e2(c) {
  const p2 = c.P.p2;
  let s, t, before, after;
  /* ---- an owner removes a participant with a comment ---- */
  const sf = await c.go("f", "/app/project/" + p2); await fold(sf);
  await sf.page.locator("#project-invite").fill("cho"); await sf.page.getByRole("button", { name: "Invite a member to the project" }).click(); await c.settle(sf.page, 1200);
  const sc = await c.go("cho", "/app/project/" + p2); await c.press(sc, "Join");
  s = await c.go("f", "/app/project/" + p2);
  const row = s.page.locator("div.cs-row").filter({ hasText: /^cho ·/ }).first();
  await row.locator("#project-remove-why-cho").fill("Cho is not working on this lease; removing him with this comment.");
  await row.getByRole("button", { name: /Remove a member/ }).click(); await c.settle(s.page, 1600);
  t = await members(c, s, 700);
  const sc2 = await c.go("cho", "/app/project/" + p2); const ct = await c.text(sc2);
  rec("R25", "An owner removes a participant with a comment: he leaves the Members block and sees the project as an outsider again", 1280, "administrator (owner ross)", "wrote a comment on cho's row and pressed 'Remove a member'", !/cho ·/.test(t) && /exists, but not its work|Nothing is here/.test(ct) ? "WORKS" : "BROKEN", `members now: ${t.slice(0, 160)}; cho reads: ${clip(ct, 140)}`, "");
  /* ---- fork ---- */
  s = await c.go("f", "/app/project/" + p2);
  const sel = await s.page.locator("#project-fork-visibility").inputValue();
  const opts = await s.page.locator("#project-fork-visibility option").allInnerTexts();
  rec("R25", "Fork: the form asks who can find it with neither choice preselected", 1280, "administrator (owner ross)", "read the fork form's visibility choice on the project page", sel === "" ? "WORKS" : "BROKEN",
    `the select reads '${sel}' (${opts.map((x) => clip(x, 30)).join(" / ")}) with no empty option: 'Hidden' is preselected, against 'neither preselected' (overlay 7) and the start form's own rule (R80); the page source says so: 'hidden preselected' (src/screens-inquiry/project.mjs:947)`, "");
  await s.page.locator("#project-fork-title").fill("Park Lease Review");
  await s.page.getByRole("button", { name: /Start a project from this one/ }).click(); await c.settle(s.page, 1500);
  rec("R25", "An unrenamed fork is refused (NAME_TAKEN): a fork's name must differ", 1280, "administrator (owner ross)", "forked with the same title", /already has that name/.test(await alerts(s)) ? "WORKS" : "BROKEN", await alerts(s), "");
  await s.page.locator("#project-fork-title").fill("Park Lease Review: Second Look");
  await s.page.getByRole("button", { name: /Start a project from this one/ }).click(); await c.settle(s.page, 2500);
  c.P.fork = s.page.url().split("/").pop(); t = await c.text(s);
  rec("R25", "A renamed fork opens as its own project: the forker is its sole owner, no participants are carried, the source is named", 1280, "administrator (owner ross)", "forked with a new title", /\/app\/project\/PROJ-/.test(s.page.url()) && !/\bben ·|mai ·|ola ·/.test(await members(c, s, 500)) ? "WORKS" : "BROKEN", `${clip(t.slice(0, 220), 220)}; members: ${(await members(c, s, 300)).slice(0, 160)}`, await shot(s.page, "R25-fork-1280"));
  s = await c.go("ben", "/app/project/" + p2);
  rec("R25", "Fork needs a joined participant who holds 'start projects': a member without it is shown no act (absent, not greyed)", 1280, "member ben (owner, cannot start projects)", "read the fork block on the project page",
    (await s.page.getByRole("button", { name: /Start a project from this one/ }).count()) === 0 && (await s.page.locator("#project-fork-title").count()) === 0 ? "WORKS" : "BROKEN",
    `act button ${await s.page.getByRole("button", { name: /Start a project from this one/ }).count()}, but the form's own fields are still drawn: title field ${await s.page.locator("#project-fork-title").count()}, visibility choice ${await s.page.locator("#project-fork-visibility").count()} (MINOR: fields for an act she is not offered)`, "");
  /* ---- the Add screen refuses a member who is not in the project (G74) ---- */
  s = await c.go("cho", "/app/capture/address/" + p2); t = await c.text(s);
  rec("R25", "A member not in a project reads the Add screen for it: refused in words, with the remedy, no filing offered (G74)", 1280, "member cho (removed from the project)", "opened /app/capture/address/<project>", /aren't in this project|Ask to join/i.test(t) ? "WORKS" : "BROKEN", clip(t, 300), await shot(s.page, "R25-add-refusal-1280"));
  s = await c.go("cho", "/app/capture"); t = await c.text(s);
  rec("R25", "The Add picker lists only projects she is in or invited to and never an id", 1280, "member cho", "opened the Add screen", !/PROJ-\d{4}/.test(t) && !/Park Lease Review/.test(t) ? "WORKS" : "BROKEN", clip(t, 260), "");
}

export async function s4f(c) {
  /* ---- rescue: a project whose every owner is inactive ---- */
  let s = await c.start("ola", "Rescue Roads", "hidden"); c.P.rescue = s.page.url().split("/").pop();
  s = await c.go("f", "/app/members");
  await s.page.getByRole("button", { name: "Acts" }).nth(3).click(); await c.settle(s.page, 600);
  await s.page.locator("button[data-act=memberset][data-member=ola]").click(); await c.settle(s.page, 700);
  await s.page.locator(".cs-reason textarea:visible").last().fill("Ola is away; making her inactive to walk the rescue.");
  await s.page.getByRole("button", { name: "Send with this reason" }).click(); await c.settle(s.page, 1500);
  let t = await c.text(s);
  rec("R2x", "(prerequisite from area 2) the administrator makes the only owner inactive from the roster", 1280, "administrator (founder)", "pressed 'Change a member's status' on ola's row with a reason", /inactive/.test(t) ? "WORKS" : "BROKEN", clip(t.slice(t.indexOf("ola"), t.indexOf("ola") + 220), 220), "");
  const aff = await c.k.get(c.W.f, { op: "affordances", target: c.P.rescue });
  const gone = await c.k.get(c.W.f, { op: "projectownersgone", projectId: c.P.rescue });
  const sh = await c.go("f", "/app/home"); const ht = await c.text(sh);
  const sp = await c.go("f", "/app/project/" + c.P.rescue); t = await c.text(sp);
  const offered = (aff.result.acts || []).some((a) => a.id === "projectownerrescue");
  rec("R25", "Rescue: every owner inactive, an administrator who is not an owner is led from Home to the project and offered to become its owner, with a reason", 1280, "administrator (founder, not an owner)",
    "made ola inactive, read Home, opened the ownerless hidden project", /Become the owner|become its owner|owners are gone/i.test(t) ? "WORKS" : "BROKEN",
    `MAJOR for BOB to place: the plane offers it (affordances lists projectownerrescue; projectownersgone answers gone=true since ${gone.result && gone.result.since}; Home's row for the project is drawn with no owner), but the project page draws only '${clip(t.slice(0, 160), 160)}' with no rescue act: the page reads \`aff.value.roster.rescue_open\` (src/screens-inquiry/project.mjs:127-130) and the affordances answer has no \`roster\` key (keys: ${Object.keys(aff.result).join(", ")})`, await shot(sp.page, "R25-rescue-not-drawn-1280"));
}
