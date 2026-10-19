// Prints what GET /providers serves and the two probe sentences the routes hold, read under the pseudo-locale (register.mjs).
import { handle } from '../../src/handler.mjs';
import { EICAR_NOT_FOUND, NO_SAFE_VIEW } from '../../src/providers/routes.mjs';
import { depsWith } from '../helpers.mjs';

const r = await handle(new Request('https://file-scanner/providers'), depsWith());
process.stdout.write(JSON.stringify({ providers: await r.json(), probes: [EICAR_NOT_FOUND, NO_SAFE_VIEW] }));
