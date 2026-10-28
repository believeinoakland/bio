/* proto-mem/1f (THROWAWAY): starts the VENDORED reader-container server (vendor/reader-container/container/server.mjs, a verbatim copy of lane/platform's) on 127.0.0.1:$PORT. */
import { listen } from "../vendor/reader-container/container/server.mjs";
await listen(Number(process.env.PORT), "127.0.0.1");
