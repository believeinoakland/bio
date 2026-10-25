/* The world for places, grouprules and bias (screens-settings R19, R25, R46, R60, R61 ...): the team's state made by the real acts of
   the owners, over store-request's world. A table is kept only to script a fault (`"none"`, a read made to fail) or an answer
   the owner gives that the page cannot be made to ask for, which is built here from the owner's own answer. */
import { storeWorld } from "./kit.mjs";
import { env } from "./fixtures.mjs";

export const PROFILE = "oakland-alameda";

/** A world with the founder (its one active administrator) and dev (a member who administers nothing), the Oakland profile active unless `profile: false`. */
export async function team({ profile = true, env = {} } = {}) {
  const w = await storeWorld({ env });
  const founder = await w.signIn("founder");
  const dev = await w.signIn("dev");
  if (profile) await w.recipes.profiles(founder, [PROFILE]);
  return { w, founder, dev };
}

/** An act of a machine class (the root of trust's token): what the team's seeding does, an author the screens read as `class:admin`. Throws when refused. */
export async function machineAct(w, op, body) {
  const a = await w.door({ url: `/api/?op=${op}`, init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } }, { token: w.env.ADMIN_TOKEN });
  const r = a.json && a.json.result;
  if (a.status >= 400 || !r || r.ok === false) throw new Error(`${op} was refused: ${JSON.stringify(a.json).slice(0, 300)}`);
  return r;
}

/** The owner's own answer to a request the page cannot be made to send (an act with a body of the caller's choosing): the whole enveloped answer. */
export async function rawAnswer(w, as, op, body, query = {}) {
  const a = await w.door({ url: `/api/?${new URLSearchParams({ op, ...query })}`, init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } }, as);
  return a.json;
}

/** `n` offices the team holds, the last made by a machine (so that it reads as seeded), one page and one more of the offices read (500 a page). */
export async function manyOffices(w, founder, n) {
  for (let i = 0; i < n - 1; i++) await founder.act("entitycreate", { body: { kind: "office", label: "Office " + String(i).padStart(4, "0"), note: "n" } });
  await machineAct(w, "entitycreate", { kind: "office", label: "Seeded office", note: "n" });
}

/** Every page of the offices (the owner's own reads, 500 a page). */
export async function officesOf(as) {
  const out = []; let after = null;
  do {
    const r = await as.read("entitieskind", { query: { kind: "office", limit: "500", ...(after ? { after } : {}) } });
    out.push(...r.entities); after = r.next;
  } while (after);
  return out;
}

/** A table that answers every read of `op` as the world does, but a read `after` a first page, silently failing (a later page that cannot be read). */
export const laterPageFails = (as) => ({ entitieskind: async (q) => (q.after ? "none" : env(await as.read("entitieskind", { query: q }))) });
/** A table that answers the courts read silently failing, every other read as the world does. */
export const courtsFail = (as) => ({ entitieskind: async (q) => (q.kind === "body" ? "none" : env(await as.read("entitieskind", { query: q }))) });
/** The world's answer to `startfrom`, with the elsewhere route's pointer unread (null): a list that could not be read. */
export const pointerUnread = (as) => ({ startfrom: async () => { const r = await as.read("startfrom"); return env({ ...r, routes: r.routes.map((x) => (x.route === "elsewhere" ? { ...x, pointer: null } : x)) }); } });
/** The world's answer to `profiles`, with a profile held that is only for tests among those active (the world refuses to activate one). */
export const testProfileActive = (as) => ({ profiles: async () => { const r = await as.read("profiles"); return env({ ...r, profiles: [{ id: "test-port-ellery", name: "Port Ellery", covers: [], test: true }] }); } });
/** The world's answer to `profiles`, with no profile offered to choose (the world's jurisdictions always offer one). */
export const noChoices = (as) => ({ profiles: async () => env({ ...(await as.read("profiles")), choices: [] }) });

/* ---- grouprules ---- */

/** The paragraphs of the document the rules are drafted from. */
export const RULES_TEXT = ["Comments close five days before the meeting.", "Speakers register by noon on the meeting day."];

/** `as` holds a text document (`name` ends .txt so that it is read as text); the reading job runs on the scheduler's alarm, so its text units
 *  (the passages, each with the extent it is found at) are the owner's own. Answers `{sha, bundle, units}`. */
export async function holdDoc(w, as, name = "rules.txt", paragraphs = RULES_TEXT) {
  const h = await w.recipes.hold(as, name, paragraphs.join("\n\n"));
  await w.tick(60000);
  const r = await as.read("reading", { query: { sha256: h.sha } });
  if (!r.found || !Array.isArray(r.text_units) || r.text_units.length < paragraphs.length) throw new Error("the document was not read: " + JSON.stringify(r).slice(0, 200));
  return { ...h, units: r.text_units };
}

/** `as` drafts a rule from the passage `unit` (the document's text unit) of `doc`, by the real ruledraft. Answers the owner's answer. */
export const draftRule = (as, doc, unit, section, entry, reason = "It is stated there.") =>
  as.act("ruledraft", { body: { section, entry, source: { captureSha: doc.sha, extent: doc.units[unit].extent }, reason } });

const deadline = (rule, applies_to, citation, over = {}) => ({ rule, applies_to, units: "days", amount: 5, starts: "hearing", citation, effective_from: "2026-07-01", ...over });
const fact = (key, statement, citation, over = {}) => ({ key, trigger: "pending_measure_or_candidate", statement, citation, effective_from: "2026-03-01", ...over });

/** A team holding rules in each of the states the screen draws (local-facts R10-R13): ana drafted a tier 1 deadline (public comment), a tier 2 one (party
 *  participation) and a legal fact for no kind (tier undetermined); dev, who views, drafted a legal fact; a legal fact was confirmed by lu; a deadline
 *  was drafted and withdrawn. `ids` names each rule by the owner's own id. */
export async function rulesTeam() {
  const t = await team();
  t.ana = await t.w.signIn("ana");
  t.lu = await t.w.signIn("lu");
  t.doc = await holdDoc(t.w, t.ana);
  const id = async (p) => (await p).rule;
  t.ids = {
    tier1: await id(draftRule(t.ana, t.doc, 0, "deadlines", deadline("parks_comment_cutoff", "public_comment", "Parks Commission Rule 4(b)"))),
    tier2: await id(draftRule(t.ana, t.doc, 0, "deadlines", deadline("rent_board_statement", "party_participation", "Hearing Rule 6(a)", { amount: 10, effective_from: "2026-01-01" }))),
    mine: await id(draftRule(t.dev, t.doc, 1, "legal_facts", fact("council_speakers", "Speakers register by noon on the meeting day", "Council Rules of Procedure 3.2", { applies_to: ["public_comment"] }))),
    noKind: await id(draftRule(t.ana, t.doc, 1, "legal_facts", fact("city_clerk_office_hours", "A recording needs notice", "Clerk Rule 2", { trigger: "recording", effective_from: "2026-10-01" }))),
    inForce: await id(draftRule(t.ana, t.doc, 1, "legal_facts", fact("three_minutes", "Each speaker gets three minutes", "Planning Commission Bylaws, Article 5", { applies_to: ["public_comment"], effective_from: "2026-01-01" }))),
    withdrawn: await id(draftRule(t.ana, t.doc, 0, "deadlines", deadline("withdrawn_rule", "public_comment", "x", { effective_from: "2026-01-01" }))),
  };
  await t.lu.act("ruleconfirm", { body: { rule: t.ids.inForce } });
  await t.lu.act("rulewithdraw", { body: { rule: t.ids.withdrawn, reason: "wrong" } });
  return t;
}

/** The team's own key, held and switched on by the real acts (the password asked again first, as an administrator's page does): the assistant is reachable. */
export const SEAL = { ACCOUNT_SEAL_SECRET: "a-long-seal-secret-for-the-settings-test-only" };
export async function holdKey(w, founder, key = "sk-ant-api03-TEAM-KEY-0123456789abcdef") {
  await founder.act("reauth", { body: { password: w.password } });
  await founder.act("groupkeyset", { body: { key } });
  await founder.act("groupkeyswitch", { body: { on: true } });
}

/** `as` vouches for the held document `bundle` (the selection and its release, as Home's "Vouch" does). */
export async function vouch(as, bundle) {
  const s = await as.act("select", { body: { ids: [bundle] } });
  return as.act("release", { query: { handle: s.handle }, body: { handle: s.handle, acknowledgment: "They are what they say.", mitigation: "I read them." } });
}

/** The pages of the owner's picker read, as the screen asks it: the first (200) and, while it says truncated, those the cursor names (1000 each). */
export async function pickerPages(as, state = "held_and_vouched") {
  const pages = []; let q = { state, fields: "picker", limit: "200" };
  for (;;) {
    const r = await as.read("heldcaptures", { query: q });
    pages.push(r);
    if (!r.truncated || !r.next) return pages;
    q = { state, fields: "picker", limit: "1000", after: r.next };
  }
}

/** n documents held by `as`, each its own text (the owner's own held list). */
export async function manyDocs(w, as, n) {
  for (let i = 0; i < n; i++) await w.recipes.hold(as, "Document " + (i + 1), "Document number " + (i + 1) + ".");
}
