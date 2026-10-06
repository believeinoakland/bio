/* workbooks' ops map (requirements: `build/requirements/workbooks.md`, R15): one route arm per act and read, as entries of
 * the plane's one op map, which the control plane appends in one place and stamps. A read takes `viewer` from the URL
 * (the control plane's stamp, never the body's); an act takes its fields from the body, where the control plane stamps
 * `by`. Which credential reaches each op is `op-declarations`' and `control-plane`'s, never this map's. */

/** The ops this module answers. */
export const WORKBOOKS_OPS = Object.freeze(["workbookadd", "workbook", "workbookbind", "workbookunbind", "workbookinputs",
  "workbookrecompute", "workbooklint", "workbooklintexplain", "workbookmethodnote", "workbooksecondcheck", "workbookexport"]);

const base64 = (bytes) => {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
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
