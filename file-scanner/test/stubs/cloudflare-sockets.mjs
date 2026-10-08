// `cloudflare:sockets` under Node: the bundle's TCP door, recorded so a test can see where it would have dialled.
export const dialled = [];
export function connect(address, options) { dialled.push({ address, options }); throw new Error('no sockets under test'); }
