/* screens-action's seam tests' helper (fix round 4, R-SEAM): the screens driven by the member's own presses over the REAL merged providers,
   never a scripted double of one. The world is `filings`' own test world (the real record, membership, promotion, `actions`, `entities`,
   `filing-templates`, `filings` and the layer-9 modules over a real SQLite standing in for the object's storage, K253); each op the path
   sends is answered by its owner's op map, as the door calls it (`url` with the stamps the control plane makes, and `body`), and wrapped
   in the door's envelope. What the path does not run through a stored result (the shell's frame, the names, the project titles) is the
   harness's default answer. */
import { world, V } from "../filings/fixture.mjs";
import { filingsOps } from "../../../src/filings/index.mjs";
import { actionsOps } from "../../../src/actions/index.mjs";
import { entitiesOps } from "../../../src/entities/index.mjs";
import { actionClocksOf, actionClocksOps } from "../../../src/action-clocks/index.mjs";
import { get as profileOf, combine } from "../../../../jurisdictions/index.mjs";
import { OP_ALIASES } from "../../../src/op-declarations/index.mjs";
import { membershipOps } from "../../../src/membership/index.mjs";
import { projectRosterOps } from "../../../src/project-roster/index.mjs";
import { boot as bootSetup } from "../instance-setup/fixture.mjs";
import { open, ok, DATA_PLANE } from "./page.mjs";

/** The real world with the first real profile active (`profile` an id `jurisdictions` holds), the member `olive` the project's owner. */
export function realWorld(profile = "oakland-alameda") {
  const x = world({ profiles: [profile] });
  x.w.record.setSetting("jurisdiction_profiles", [profile], V("olive"));
  /* action-clocks (the due date a member adopts and the reminders), the real one, on the same host */
  x.clocks = actionClocksOf(x.w.host, { record: x.w.record, membership: x.w.membership, actions: x.actions, conformance: x.conformance,
    now: () => Date.parse(x.w.clock.now) });
  return x;
}

/** The door's stamps and envelope around each owner's op: `member` is the session's member (the viewer and the author). With `roster`, the
 *  real `membership` (`projectjoin`) and `project-roster` (`projectlist`, her own `participation` in each project) answer too, the door
 *  stamping `by` (the member's id) for them as it does for a roster act (E9, K4557). */
export function realPlane(x, member = V("olive"), base = DATA_PLANE, { roster = false } = {}) {
  const owners = [(url, body) => filingsOps(x.f, url, body), (url, body) => actionsOps(x.actions, url, body), (url, body) => entitiesOps(x.ents, url, body),
    (url, body) => actionClocksOps(x.clocks, url, body)];
  if (roster) owners.push((url, body) => membershipOps(x.w.membership, url, body, {}), (url, body) => projectRosterOps(x.roster, url, body, {}));
  const plane = {};
  const names = new Set();
  for (const make of owners) for (const op of Object.keys(make(new URL("http://do/"), null))) names.add(op);
  /* the door resolves the name a screen sends to the arm its owner serves (`OP_ALIASES`, op-declarations: `filingrecordsent` is `filingsent`) */
  for (const [al, arm] of Object.entries(OP_ALIASES)) if (names.has(arm)) names.add(al);
  for (const op of names) {
    plane[op] = async (req) => {
      const url = new URL(req.url, "http://do");
      url.searchParams.set("viewer", member);
      url.searchParams.set("author", member);
      if (roster) url.searchParams.set("by", String(member).replace(/^member:/, ""));
      const body = req.body && typeof req.body === "object" ? { ...req.body } : req.body;
      if (op === "entitycreate" && body && typeof body === "object") body.declaredBy = member;
      for (const make of owners) {
        const ops = make(url, body);
        const arm = Object.hasOwn(OP_ALIASES, op) ? OP_ALIASES[op] : op;
        if (Object.hasOwn(ops, arm)) return ok(await ops[arm]());
      }
      throw new Error(`realPlane: no owner serves ${op}`);
    };
  }
  return { ...base, ...plane };
}

export { open, world, V };

/** The real owners answer on their own time: wait, settling the page between looks, until `done()` holds (the page redraws when an answer
 *  lands), never longer than about two seconds. */
export async function until(p, done, what) {
  for (let i = 0; i < 200; i++) {
    if (done()) return;
    await new Promise((r) => setTimeout(r, 10));
    await p.settle();
  }
  throw new Error(`waited for ${what}`);
}

/** The REAL `profiles()` of `instance-setup`, booted as the plane boots it with the first profile chosen: the answer the screens read. */
export async function realProfiles(id = "oakland-alameda") {
  const s = await bootSetup();
  const set = s.m.profilesSet({ profiles: [id], by: "admin" });
  if (!set || set.ok === false) throw new Error(`profiles not set: ${JSON.stringify(set).slice(0, 200)}`);
  return () => ok(s.m.profiles());
}

/** The `profiles` answer for the active profile `id`, from `jurisdictions.combine` whole: what `instance-setup`'s `profiles()` must carry in
 *  `view` for the screens (`records_laws`, `records_help`, `name`, beside `deadlines`; INSTANCE-SETUP #27, instance-setup R12). It stands in
 *  for `realProfiles` only to prove the rest of the path while that provider has not merged; `seam-t51.test.mjs` runs both. */
export function profilesOf(id = "oakland-alameda") {
  const p = profileOf(id), c = combine([id]);
  return ok({ ok: true, profiles: [{ id, name: p.name, covers: p.covers }], conflicts: [], choices: [], stage_findings: [], view: { ...(c.view || {}), name: p.name } });
}
