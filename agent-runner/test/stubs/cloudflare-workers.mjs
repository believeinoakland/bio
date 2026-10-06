// `cloudflare:workers` as the Workers runtime gives it, for loading the Worker bundle under Node (R12): the two base
// classes the container library extends, each keeping its `ctx` and `env`.
export class DurableObject {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; }
}
export class WorkerEntrypoint {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; }
}
