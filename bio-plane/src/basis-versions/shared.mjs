/* basis-versions — what the module's files share (P6): R12/R16's reason bound and R13's own test. */

/** R12, R16: a reason, conclusion, falsifier or commentary written into the frontmatter (no escapes). */
export const VERSION_REASON_MAX = 500;

/* R13's own test, over a project's parsed document: it holds a `cites` reference to the inquiry not marked `severed`. */
export const drawsOn = (fm, inquiryId) => (Array.isArray(fm?.references) ? fm.references : []).some((x) =>
  x && typeof x === "object" && x.rel === "cites" && x.status !== "severed" && String(x.target ?? "").trim() === inquiryId);


/** R51, R58: the extent fields of a leg (every one a citation carries, `citation`'s EXTENT_PARAMS), with the type `narrow` reads each as, and the leg fields a copied leg carries. */
export const EXTENT_FIELDS = {
  extent_kind: "text", extent_ref: "text", extent_page: "int", extent_rect: "nums",
  extent_sheet: "text", extent_cell: "text", extent_slide: "int", extent_shape: "int",
  extent_para: "int", extent_run: "int", extent_range: "text", extent_table: "int", extent_part: "text",
  extent_cited_as: "text", content_id: "text",
};
/* `target_edition` so a leg on another group's finding is copied whole (N522) */
export const LEG_COPY_KEYS = ["target", "target_edition", "derivation_kind", "derivation_from", "derivation_to",
                       "derivation_as_of", "derivation_method", "role", "ground", "grade", "grade_axis", "grade_source", "note", "date",
                       "extent_capture", ...Object.keys(EXTENT_FIELDS)];
