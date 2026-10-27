import { localize } from "../setup-words/index.mjs";
/* workbooks' ops map (requirements: `build/requirements/workbooks.md`, R15): one route arm per act and read, as entries of
 * the plane's one op map, which the control plane appends in one place and stamps. A read takes `viewer` from the URL
 * (the control plane's stamp, never the body's); an act takes its fields from the body, where the control plane stamps
 * `by`. Which credential reaches each op is `op-declarations`' and `control-plane`'s, never this map's. */

/** The ops this module answers. */
export const WORKBOOKS_OPS = Object.freeze(["workbookadd", "workbook", "workbookbind", "workbookunbind", "workbookinputs",
  "workbookrecompute", "workbooklint", "workbooklintexplain", "workbookmethodnote", "workbooksecondcheck", "workbookexport"]);

/* R22: encoded in pieces of a multiple of three bytes, so no piece joins to another until the answer's one string; the
   file is never first made a whole-file binary string for `btoa` */
const PIECE = 0x6000;
const base64 = (bytes) => {
  const out = [];
  for (let i = 0; i < bytes.length; i += PIECE) out.push(btoa(String.fromCharCode.apply(null, bytes.subarray(i, i + PIECE))));
  return out.join("");
};

/** R15: the route arms, each a function of no arguments answering what its service answers. */
export function workbooksOps(workbooks, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  const at = () => ({ captureSha: q("capture"), project: q("project"), viewer: q("viewer") });
  return {
    workbookadd: () => workbooks.addWorkbook({ captureSha: b.captureSha, question: b.question, period: b.period, project: b.project, by: b.by }),
    workbook: () => workbooks.readWorkbook(at()),
    workbookbind: () => workbooks.bind({ captureSha: b.captureSha, project: b.project, range: b.range, input: b.input, by: b.by }),
    workbookunbind: () => workbooks.unbind({ bindingId: b.bindingId, reason: b.reason, by: b.by }),
    workbookinputs: () => workbooks.inputsOf(at()),
    workbookrecompute: () => workbooks.recompute({ captureSha: b.captureSha, project: b.project, by: b.by }),
    workbooklint: () => workbooks.lint(at()),
    workbooklintexplain: () => workbooks.explainLint({ captureSha: b.captureSha, project: b.project, finding: b.finding, note: b.note, by: b.by }),
    workbookmethodnote: () => workbooks.recordMethodNote({ captureSha: b.captureSha, project: b.project, purpose: b.purpose,
                                                           sources: b.sources, steps: b.steps, limitations: b.limitations, by: b.by }),
    workbooksecondcheck: () => workbooks.recordCheck({ captureSha: b.captureSha, project: b.project, outcome: b.outcome, note: b.note, by: b.by }),
    /* the bytes travel as base64, never raw octets, as content's crop does (its R32) */
    workbookexport: async () => {
      const r = await workbooks.exportRecipe({ calcId: q("calc"), viewer: q("viewer") });
      if (!r || !r.found) return r;
      const { bytes, ...rest } = r;
      return { ...rest, bytes_base64: base64(bytes) };
    },
  };
}

/* R19 (T51; K4168; op-declarations R80, op-grades R49): the ops this module serves that the screens send, declared by their owner beside
   the ops map: each row's class, weight and description are the op's existing rows', its fields are what the arm reads. */
export const DECLARED_OPS = Object.freeze({
  addworkbook: { classes: ["admin","member","probe"], mutating: true, weight: "undetermined", description: localize("workbooks.declared.addworkbook", "workbook-directed: keyed by (capture, project); writes workbooks' rows and moves no bundle"),
    fields: { accepts: ["captureSha","question","period","project"], requires: ["captureSha","question","period","project"] } },
  bind: { classes: ["admin","member","probe"], mutating: true, weight: "reversible", description: localize("workbooks.declared.bind", "workbook-directed: keyed by (capture, project) and a range; writes a binding and moves no bundle"),
    fields: { accepts: ["captureSha","project","range","input"], requires: ["captureSha","project","range","input"] } },
  recordcheck: { classes: ["admin","member","probe"], mutating: true, weight: "undetermined", description: localize("workbooks.declared.recordcheck", "workbook-directed: keyed by (capture, project); a second member's check, disclosed and never a gate"),
    fields: { accepts: ["captureSha","project","outcome","note"], requires: ["captureSha","project","outcome"] } },
});
