// The same resolution as runtime.mjs, for a Node without module.registerHooks.
const STUBS = { 'cloudflare:workers': new URL('./cloudflare-workers.mjs', import.meta.url).href,
  'cloudflare:sockets': new URL('./cloudflare-sockets.mjs', import.meta.url).href };
export async function resolve(specifier, context, next) {
  if (STUBS[specifier]) return { url: STUBS[specifier], shortCircuit: true };
  return next(specifier, context);
}
