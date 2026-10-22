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
import { get as profileOf, combine } from "../../../../jurisdictions/index.mjs";
import { OP_ALIASES } from "../../../src/op-declarations/index.mjs";
import { open, ok, DATA_PLANE } from "./page.mjs";

/** The real world with the first real profile active (`profile` an id `jurisdictions` holds), the member `olive` the project's owner. */
export function realWorld(profile = "oakland-alameda") {
  const x = world({ profiles: [profile] });
  x.w.record.setSetting("jurisdiction_profiles", [profile], V("olive"));
  return x;
}

/** The door's stamps and envelope around each owner's op: `member` is the session's member (the viewer and the author). */
export function realPlane(x, member = V("olive"), base = DATA_PLANE) {
  const owners = [(url, body) => filingsOps(x.f, url, body), (url, body) => actionsOps(x.actions, url, body), (url, body) => entitiesOps(x.ents, url, body)];
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
      const body = req.body && typeof req.body === "object" ? { ...req.body } : req.body;
      if (op === "entitycreate" && body && typeof body === "object") body.declaredBy = member;
      for (const make of owners) {
        const ops = make(url, body);
        const arm = Object.hasOwn(OP_ALIASES, op) ? OP_ALIASES[op] : op;
        if (Object.hasOwn(ops, arm)) return ok(await ops[arm]());
      }
      return ok({ ok: false, reason: "NO_OWNER" });
    };
  }
  return { ...base, ...plane };
}

export { open, world, V };

/** The `profiles` answer for the active profile `id`, from `jurisdictions.combine` whole: what `instance-setup`'s `profiles()` must carry in
 *  `view` for the screens (`records_laws`, `records_help`, `name`, beside `deadlines`). The real `profiles()` is run, and found to omit
 *  them, by the red test in `seam-t51.test.mjs`; this stands in only for the parts of the path that follow it. */
export function profilesOf(id = "oakland-alameda") {
  const p = profileOf(id), c = combine([id]);
  return ok({ ok: true, profiles: [{ id, name: p.name, covers: p.covers }], conflicts: [], choices: [], stage_findings: [], view: { ...(c.view || {}), name: p.name } });
}
