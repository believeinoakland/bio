/* screens-action R1, R12, R17, R21, R25, R31, R32 (T51 fix round 2, C94; the shell's `memberName`): a member is named by her handle wherever the module draws a person, never
   by her id (the founder's is `admin`, her handle `sparky`); a member with no handle known is the kit's word, never the id. Every sentence is
   asserted by its key. */
import test from "node:test";
import assert from "node:assert/strict";
import { actionWorld, openIn, planIn, colleague } from "./world-D.mjs";
import { open, main, text, ok, W, D, DATA_PLANE, ROUTES, ACTION, ACTION_ID, PRESSURE, PROJECT, PLAN, TEMPLATES, GUIDES, HOLDS_DUE, STAKE } from "./page.mjs";

const ROSTER = ok({ members: [{ member_id: "admin", handle: "sparky", founder: true }, { member_id: "u-2", handle: "rosa" }, { member_id: "u-3", handle: null }] });
const NOBODY = W("shell.card.member");
const PLANE = { ...DATA_PLANE, memberlist: ROSTER };
const said = (p, key, vars) => assert.ok(text(p).includes(W(key, vars)), key + " " + JSON.stringify(vars));
const noIds = (p, ids = ["admin", "u-2", "u-3"]) => { const t = text(p); for (const id of ids) assert.ok(!new RegExp("(^|[^\\w-])" + id + "([^\\w-]|$)").test(t), "an id is drawn: " + id); };
const links = (p) => main(p).querySelectorAll("a").map((a) => a.getAttribute("href"));

test("R1, R25 (C94): the plan names who opened it by her handle, on its page and in the project's list; a member with no handle is the kit's word", async () => {
  /* the founder's id is `admin`, her handle the world's; rosa opens a plan of her own: both are named by handle, in the plan and in the list */
  const { world, me, project } = await actionWorld({ founder: true });
  const rosa = await colleague(world, me, project, "rosa");
  const mineRow = await planIn(world, me, project, "The founder's plan");
  const rosaRow = await planIn(world, me, project, "Rosa's plan", { who: rosa });
  const mine = await openIn(world, me, `/app/plan/${mineRow.id}`);
  said(mine, "screen.plan.opened", { date: D(mineRow.opened_at), name: me.handle });
  noIds(mine, ["admin"]);
  /* (a member with no handle known cannot be made by real acts: every member the store holds has one; this page stays over a scripted plan) */
  const bare = await open(ROUTES.plan, { ...PLANE, plan: ok({ ...PLAN, opened_by: "member:u-3" }) });
  said(bare, "screen.plan.opened", { date: D("2026-10-03"), name: NOBODY });
  noIds(bare);
  const list = await openIn(world, me, `/app/plan/${project}`);
  said(list, "screen.plan.opened", { date: D(mineRow.opened_at), name: me.handle });
  said(list, "screen.plan.opened", { date: D(rosaRow.opened_at), name: "rosa" });
  noIds(list, ["admin"]);
  const row = (id, by) => ({ id, project: PROJECT, title: "T " + id, state: "open", opened_by: by, opened_at: "2026-10-03T10:00:00Z", subjects: [] });
  const nameless = await open(`/app/plan/${PROJECT}`, { ...PLANE, plans: ok({ ok: true, items: [row("PLN-2026-a-plan", "member:u-3"), row("PLN-2026-b-plan", "member:u-3")], truncated: false, cursor: null, limit: 200 }) });
  said(nameless, "screen.plan.opened", { date: D("2026-10-03"), name: NOBODY });
  noIds(nameless);
});

test("R12, R17, R31 (C94): an action names who sent it, who marked pressure, who approved a template or a guide, who stated its laws and who set its risk by handle; an agent is not a member", async () => {
  const correspondence = ACTION.correspondence.map((e, i) => (i === 0 ? { ...e, author: "member:admin" } : e));
  const pressure = { ...PRESSURE, items: [{ ...PRESSURE.items[0], kind: "retaliation", by: "member:u-2", hold: null }] };
  const templates = { ...TEMPLATES, versions: [{ ...TEMPLATES.versions[0], approved_by: "member:admin" }] };
  const guides = { ...GUIDES, guides: GUIDES.guides.map((g) => (g.approved_by ? { ...g, approved_by: "member:u-2" } : g)) };
  const action = { ...ACTION, correspondence, governing_laws: { ...ACTION.governing_laws, by: "member:admin" },
    risk_tier_history: { ...ACTION.risk_tier_history, revisions: ACTION.risk_tier_history.revisions.map((h) => ({ ...h, by: "member:u-2" })) },
    risk_tier_proposals: { ...ACTION.risk_tier_proposals, proposals: ACTION.risk_tier_proposals.proposals.map((x) => (x.by === "member:asha" ? { ...x, by: "member:u-3" } : x)) } };
  const p = await open(ROUTES.action, { ...PLANE, action: ok(action), pressurefor: ok(pressure), templatesforaction: ok(templates), procedureguides: ok(guides) });
  said(p, "screen.action.sentby", { date: D("2026-10-02"), who: "sparky" });
  said(p, "screen.action.pressuremark.by", { who: "rosa" });
  said(p, "screen.action.templates.approved", { member: "sparky", date: D("2026-09-30") });
  said(p, "screen.action.templates.approved", { member: "rosa", date: D("2026-10-01") });
  said(p, "law.stated", { who: "sparky", date: D("2026-10-01") });
  said(p, "risk.set", { who: "rosa", date: D("2026-10-03"), reason: "the office has fought requests before", prior: W("risk.tier.1") });
  said(p, "law.proposal.not", { who: "agent:claude", date: D("2026-10-02") });
  said(p, "risk.proposal", { who: NOBODY, tier: "1", words: W("risk.tier.1") });
  noIds(p);
  const bare = await open(ROUTES.action, { ...PLANE, pressurefor: ok({ ...pressure, items: [{ ...pressure.items[0], by: "member:u-3" }] }) });
  said(bare, "screen.action.pressuremark.by", { who: NOBODY });
  noIds(bare);
});

test("R21, R32 (C94): the hold screen names who marked what wants a hold by handle, and the stake names who set it", async () => {
  const items = HOLDS_DUE.items.map((m, i) => ({ ...m, marked_by: ["member:admin", "member:u-2", "member:u-3"][i] })).concat([{ ...HOLDS_DUE.items[1], marked_by: "member:u-3" }]);
  const h = await open(ROUTES.hold, { ...PLANE, holdsdue: ok({ ...HOLDS_DUE, items }) });
  said(h, "screen.hold.marked", { member: "sparky" });
  said(h, "screen.hold.marked", { member: "rosa" });
  said(h, "screen.hold.marked", { member: NOBODY });
  noIds(h);
  const s = await open(ROUTES.request, { ...PLANE, stakeatpreparation: ok(STAKE({ matter_stake: { ...STAKE().matter_stake, set_by: "admin" } })) });
  said(s, "stake.source.project", { who: "sparky", date: D("2026-10-09") });
  noIds(s);
});
