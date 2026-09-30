# instance-setup (T15)

**Status** · session_01MPeZXWNffPSns1vrpkvF5F · depth 2 · WORKING · handled B1

## J1 · QUESTION

B1 says my tests confirm the frame "through control-plane's door". control-plane is after instance-setup in the order (it uses instance-setup), and `checks/architecture.mjs` checks the imports of `tests` too, so `test/m/instance-setup/` may not import `src/control-plane/dispatch.mjs`. My best reading, which I am building on: as the plan's N348 wording (draft-T14-wordings-2 point 3) says, the fixture builds its own frame over `instanceSetupOps`: R26's body read (`BAD_JSON` 400), the own-keys route lookup (unknown op 400), the `{ok: true, result}` envelope and R25's catch (500 `STORE_INTERNAL_ERROR` with a correlation id, no stack), reproducing control-plane's door as instance-setup's tests reach it. The confirmation through the real door is control-plane's `store-class.test.mjs` (R35), which already drives all fourteen routes through `D.Store`. No test of mine imports control-plane.

## J2 · REPORT

For control-plane (runs beside me in layer 11): removing `instanceSetupStore` and `instanceSetupRoute` from `bio-plane/src/setup.mjs` breaks control-plane's `bio-plane/test/m/control-plane/store-class.test.mjs`, which imports both as its "before" comparison: :93 (`new (S.instanceSetupStore(D.Store))(...)`, the legacy-index wrapper arm of the first R35 test), :115 (`S.instanceSetupRoute(m, req(drive))`, the per-route before/after comparison) and :167 (`S.instanceSetupRoute(...)`, the negative control that the old door leaked the stack). Its header comment (:3) also names `instanceSetupRoute`. Those three arms need rewording by CONTROL-PLANE #6 (e.g. compare against `instanceSetupOps(m, url, body)[op]()` directly, and drop the wrapper arm now that no wrapper exists). Comment-only mentions outside my tests, no code: `bio-plane/test/bounds.test.mjs`:182 and `bio-plane/test/identity-claims.test.mjs`:183 (legacy-tests'). Nothing in `bio-plane/src/` other than setup.mjs itself references either name (legacy-index dropped its wrap in T14).
