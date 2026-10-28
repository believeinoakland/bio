// `cloudflare:workers` as the runtime gives it, for loading the Worker bundle under Node: the base classes the
// container library extends, each keeping its `ctx` and `env`.
export class DurableObject {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; }
}
export class WorkerEntrypoint {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; }
}
