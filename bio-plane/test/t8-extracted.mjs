/* T8 (legacy-tests), 2026-09-28: layers 8 to 10 of tranche T8 EXTRACTED `case-authoring`, `ratification`,
   `publication`, `review`, `actions`, `monitoring` and `scheduler` out of the legacy store (`src/store.mjs`) into
   `src/<module>/`, the same way T5's and T7's modules left it: one-line delegations
   (`x(...a) { return publicationOf(this.ctx).y(...a); }`) and spreads of each module's routes
   (`...publicationOps(publicationOf(this.ctx), url, body),`). A walk whose subject is the store's own class read as a
   census reads those and finds the code gone.

   `t5-extracted.mjs`' `reinlineLayer5` already re-inlines any module map it is handed (`{ modules }`, T7's widening),
   and every T8 spread and delegation is spelled the way it reads (`<of>(this.ctx)` or `<of>(this.ctx, this.env)`;
   routes `url, body`). So this file holds ONLY the map, keyed by the factory as the store's dispatch and delegations
   call it; the re-inliner itself is not copied or changed. The callers pass it as a THIRD pass over the text T7's pass
   made (`{ modules: T8_MODULES }`), which leaves every earlier substitution as it was. */
export const T8_MODULES = {
  caseAuthoringOf: "case-authoring", ratificationOf: "ratification", publicationOf: "publication",
  reviewOf: "review", actionsOf: "actions", monitoringOf: "monitoring", schedulerOf: "scheduler",
};
