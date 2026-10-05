/* calc-grammar: the pure engine of calculation (requirements: `build/requirements/calc-grammar.md`). Layer 1: no
 * record, no store, no network, no clock, and no user code. */

export { parseFigure } from "./figures.mjs";
export { add, subtract, multiply, divide, round, MODES, PRECISIONS } from "./decimal.mjs";
export { checkRecipe, evaluate, resultKey, METHOD, OPS, TESTS, FIELD_TYPES, SPAN_UNITS, SUM_RULE, RATIO_DEFAULT }
  from "./recipe.mjs";
export { draw, interval, DRAW_METHOD, INTERVAL_METHOD } from "./draw.mjs";
