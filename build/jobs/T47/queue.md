# queue (T47)

**Status** · session_01LGyJtZ45XatgTxY114jhrD · depth 2 · WORKING · handled B1

## J1 · QUESTION

R53 says the clock is `queueOf`'s option `now`, "`Date.now` by default". Today, with no `now` given, queue falls back to the instance binding `env.BIO_NOW_MS` before the wall clock (as tasks, actions, action-holds, network-notices and progressions do), and plane tests (`test/m/plane/watch.test.mjs`, `docket.test.mjs`, `accepted.test.mjs`) set the whole store's clock through that binding.

My best reading, on which I am carrying on: the default clock is the server's own, i.e. `env.BIO_NOW_MS` when the instance binds it, else `Date.now`. The binding is server-side configuration, never request-borne, so R53's point (no instant from the request) holds; production binds none, so the default is `Date.now` there. If you mean `Date.now` strictly (the binding no longer read by queue), say so and I will drop it; the plane tests would then judge queue ages at the wall clock.

Not blocking: the rest of the job (route ignores `now`, door stops forwarding it, `queueOf` adopts and compares `now`) does not depend on the answer.
