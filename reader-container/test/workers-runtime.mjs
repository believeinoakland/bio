// Loads the committed Worker bundle under Node, `cloudflare:workers` resolved to the runtime's base classes below
// (workers-base.mjs), as file-scanner's tests load its bundle.
import * as nodeModule from 'node:module';

const BASE = new URL('./workers-base.mjs', import.meta.url).href;
nodeModule.registerHooks({ resolve: (specifier, context, next) => (specifier === 'cloudflare:workers' ? { url: BASE, shortCircuit: true } : next(specifier, context)) });

export const loadWorker = () => import('../dist/reader-container.bundled.mjs');
