# BOB to test-support (T19)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` layer 1, test-support (new, N22): R2 now covers a tree a test left read-only when the process does not run as root (`build/requirements/test-support.md`, marked not yet met): the sweep makes the part writable and retries on `EACCES`, so the sandbox never leaks. Test it by running a child as a non-root user (`setpriv` or `runuser` exist in the container) and at the interface with an injected `EACCES`; strike the "not yet met" mark when met. Do not delete old suites (K619).
