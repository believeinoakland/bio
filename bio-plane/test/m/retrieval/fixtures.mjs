/* retrieval's published fixtures (fix round 10): what a user module's test takes in place of retrieval's answers or
   retrieval itself. Each is made by retrieval's real code when the test runs, over `world()`, and is never stored. */
import { world, V } from "./fixture.mjs";

/** R53, R56: the real retrieval's two registrars, the seam `actions`, `action-clocks` and `action-plans` register on.
 *  `registered` is what they answered; the registrations are held by the real retrieval (`retrieval`). */
export function actionRegistrar() {
  const w = world();
  const { retrieval } = w;
  return {
    world: w, retrieval,
    registerActionFacts: (module, fn) => retrieval.registerActionFacts(module, fn),
    registerProjectionDecoration: (module, fn) => retrieval.registerProjectionDecoration(module, fn),
  };
}

/** R10, R31 (C-23.2): the real answer of `meaningRows` to a `rows` that names no arm. */
export function meaningRowsUnknownArm({ rows = "bogus", viewer = V("vera") } = {}) {
  const w = world();
  return w.retrieval.meaningRows({ rows, viewer });
}

/** R19, R31 (C-33.20): a real retrieval over an empty store, whose `selectionResolve` holds no selection at all, and its
 *  answer for `handle`. */
export function noSelection({ handle = "sel-none", viewer = V("vera"), owner = "o" } = {}) {
  const w = world();
  return {
    world: w, retrieval: w.retrieval,
    selectionResolve: (args) => w.retrieval.selectionResolve(args),
    answer: w.retrieval.selectionResolve({ handle, viewer, owner }),
  };
}

/** R18, R19, R20, R77: a real retrieval holding documents `INFO-001`..`INFO-<docs>`; `selection(ids, owner)` makes an
 *  enumerated selection and answers its handle; `resolve` and `read` are the real `selectionResolve` and `selectionRead`. */
export function selectionResolve({ docs = 3, viewer = V("vera") } = {}) {
  const w = world();
  const ids = [];
  for (let i = 1; i <= docs; i++) { const id = `INFO-${String(i).padStart(3, "0")}`; w.doc(id); ids.push(id); }
  return {
    world: w, retrieval: w.retrieval, ids, viewer,
    async selection(members = ids, owner = "o") {
      const s = await w.retrieval.selectionCreate({ owner, viewer, ids: members });
      if (!s.ok) throw new Error(`fixture selection refused: ${JSON.stringify(s).slice(0, 300)}`);
      return s.handle;
    },
    resolve: (args) => w.retrieval.selectionResolve({ viewer, ...args }),
    read: (args) => w.retrieval.selectionRead({ viewer, ...args }),
  };
}
