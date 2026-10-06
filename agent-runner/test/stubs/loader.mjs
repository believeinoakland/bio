// Resolves `cloudflare:workers` to the stub beside this file; everything else as Node resolves it.
export async function resolve(specifier, context, next) {
  if (specifier === 'cloudflare:workers') return { url: new URL('./cloudflare-workers.mjs', import.meta.url).href, shortCircuit: true };
  return next(specifier, context);
}
