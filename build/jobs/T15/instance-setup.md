# instance-setup (T15)

**Status** · session_01MPeZXWNffPSns1vrpkvF5F · depth 2 · WORKING · handled B1

## J1 · QUESTION

B1 says my tests confirm the frame "through control-plane's door". control-plane is after instance-setup in the order (it uses instance-setup), and `checks/architecture.mjs` checks the imports of `tests` too, so `test/m/instance-setup/` may not import `src/control-plane/dispatch.mjs`. My best reading, which I am building on: as the plan's N348 wording (draft-T14-wordings-2 point 3) says, the fixture builds its own frame over `instanceSetupOps`: R26's body read (`BAD_JSON` 400), the own-keys route lookup (unknown op 400), the `{ok: true, result}` envelope and R25's catch (500 `STORE_INTERNAL_ERROR` with a correlation id, no stack), reproducing control-plane's door as instance-setup's tests reach it. The confirmation through the real door is control-plane's `store-class.test.mjs` (R35), which already drives all fourteen routes through `D.Store`. No test of mine imports control-plane.
