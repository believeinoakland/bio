/* standards R65 (T53; N1260, DEC-410, DEC-447): `standardsBinding`, the standards that bind a body. Not yet met: BOB
   writes the module's `standardsBinding` line (the requirement's own owed note), and the op is not yet built, so its
   test is held as a todo and named here (K208). */
import test from "node:test";

test.todo("R65 standardsBinding({body, limit?, after?, viewer}) answers the adoption and imposition rows whose body is the entity, newest first, at most `limit` (1 to 200, default 50), a benchmark never answered, a standard the viewer may not see uncounted; NO_ENTITY, NO_SUCH_ENTITY and an out-of-range limit refused; it writes nothing; DECLARED_OPS gains the row; standardRead's bindings (R63) unchanged");
