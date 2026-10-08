// node_modules/@cloudflare/containers/dist/lib/helpers.js
function generateId(length = 9) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += alphabet[bytes[i] % alphabet.length];
  }
  return result;
}
function parseTimeExpression(timeExpression) {
  if (typeof timeExpression === "number") {
    return timeExpression;
  }
  if (typeof timeExpression === "string") {
    const match = timeExpression.match(/^(\d+)([smh])$/);
    if (!match) {
      throw new Error(`invalid time expression ${timeExpression}`);
    }
    const value = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 60 * 60;
      default:
        throw new Error(`unknown time unit ${unit}`);
    }
  }
  throw new Error(`invalid type for a time expression: ${typeof timeExpression}`);
}

// node_modules/@cloudflare/containers/dist/lib/container.js
import { DurableObject, WorkerEntrypoint } from "cloudflare:workers";
var NO_CONTAINER_INSTANCE_ERROR = "there is no container instance that can be provided to this durable object";
var RATE_LIMITED_ERROR = "you are requesting too many containers per second";
var RUNTIME_SIGNALLED_ERROR = "runtime signalled the container to exit:";
var UNEXPECTED_EXIT_ERROR = "container exited with unexpected exit code:";
var NOT_LISTENING_ERROR = "the container is not listening";
var CONTAINER_STATE_KEY = "__CF_CONTAINER_STATE";
var OUTBOUND_CONFIGURATION_KEY = "OUTBOUND_CONFIGURATION";
var MAX_ALARM_RETRIES = 3;
var PING_TIMEOUT_MS = 5e3;
var DEFAULT_SLEEP_AFTER = "10m";
var INSTANCE_POLL_INTERVAL_MS = 300;
var TIMEOUT_TO_GET_CONTAINER_MS = 8e3;
var TIMEOUT_TO_GET_PORTS_MS = 2e4;
var FALLBACK_PORT_TO_CHECK = 33;
var outboundHandlersRegistry = /* @__PURE__ */ new Map();
var defaultOutboundHandlerNameRegistry = /* @__PURE__ */ new Map();
var outboundByHostRegistry = /* @__PURE__ */ new Map();
var signalToNumbers = {
  SIGINT: 2,
  SIGTERM: 15,
  SIGKILL: 9
};
function isErrorOfType(e, matchingString) {
  const errorString = e instanceof Error ? e.message : String(e);
  return errorString.toLowerCase().includes(matchingString);
}
var isNoInstanceError = (error) => isErrorOfType(error, NO_CONTAINER_INSTANCE_ERROR);
var isRateLimitedError = (error) => isErrorOfType(error, RATE_LIMITED_ERROR);
var isRuntimeSignalledError = (error) => isErrorOfType(error, RUNTIME_SIGNALLED_ERROR);
var isNotListeningError = (error) => isErrorOfType(error, NOT_LISTENING_ERROR);
var isContainerExitNonZeroError = (error) => isErrorOfType(error, UNEXPECTED_EXIT_ERROR);
function getExitCodeFromError(error) {
  if (!(error instanceof Error)) {
    return null;
  }
  if (isRuntimeSignalledError(error)) {
    return +error.message.toLowerCase().slice(error.message.toLowerCase().indexOf(RUNTIME_SIGNALLED_ERROR) + RUNTIME_SIGNALLED_ERROR.length + 1);
  }
  if (isContainerExitNonZeroError(error)) {
    return +error.message.toLowerCase().slice(error.message.toLowerCase().indexOf(UNEXPECTED_EXIT_ERROR) + UNEXPECTED_EXIT_ERROR.length + 1);
  }
  return null;
}
function addTimeoutSignal(existingSignal, timeoutMs) {
  const controller = new AbortController();
  if (existingSignal?.aborted) {
    controller.abort();
    return controller.signal;
  }
  existingSignal?.addEventListener("abort", () => controller.abort());
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  controller.signal.addEventListener("abort", () => clearTimeout(timeoutId));
  return controller.signal;
}
function simpleGlobMatch(pattern, value) {
  const parts = pattern.split("*");
  if (parts.length === 1)
    return pattern === value;
  if (!value.startsWith(parts[0]))
    return false;
  if (!value.endsWith(parts[parts.length - 1]))
    return false;
  let pos = parts[0].length;
  for (let i = 1; i < parts.length - 1; i++) {
    const idx = value.indexOf(parts[i], pos);
    if (idx === -1)
      return false;
    pos = idx + parts[i].length;
  }
  return pos <= value.length - parts[parts.length - 1].length;
}
function matchesHostList(hostname, patterns) {
  return patterns.some((pattern) => simpleGlobMatch(pattern, hostname));
}
function normalizeHostname(hostname) {
  let end = hostname.length;
  while (end > 0 && hostname[end - 1] === ".") {
    end--;
  }
  return hostname.slice(0, end);
}
var ContainerState = class {
  storage;
  status;
  constructor(storage) {
    this.storage = storage;
  }
  async setRunning() {
    await this.setStatusAndupdate("running");
  }
  async setHealthy() {
    await this.setStatusAndupdate("healthy");
  }
  async setStopping() {
    await this.setStatusAndupdate("stopping");
  }
  async setStopped() {
    await this.setStatusAndupdate("stopped");
  }
  async setStoppedIfUnchanged(previousState) {
    if (this.status !== previousState) {
      return;
    }
    await this.setStopped();
  }
  async setStoppedWithCode(exitCode) {
    this.status = { status: "stopped_with_code", lastChange: Date.now(), exitCode };
    await this.update();
  }
  async getState() {
    if (!this.status) {
      const state = await this.storage.get(CONTAINER_STATE_KEY);
      if (!state) {
        this.status = {
          status: "stopped",
          lastChange: Date.now()
        };
        await this.update();
      } else {
        this.status = state;
      }
    }
    return this.status;
  }
  async setStatusAndupdate(status) {
    this.status = { status, lastChange: Date.now() };
    await this.update();
  }
  async update() {
    if (!this.status)
      throw new Error("status should be init");
    await this.storage.put(CONTAINER_STATE_KEY, this.status);
  }
};
var ContainerProxy = class extends WorkerEntrypoint {
  async fetch(request) {
    const url = new URL(request.url);
    const hostname = normalizeHostname(url.hostname);
    const { className, containerId, outboundByHostOverrides, outboundHandlerOverride, enableInternet, allowedHosts, deniedHosts, interceptAll } = this.ctx.props;
    const baseCtx = { containerId, className };
    if (deniedHosts && matchesHostList(hostname, deniedHosts)) {
      return new Response("Origin is disallowed", { status: 520 });
    }
    if (allowedHosts && !matchesHostList(hostname, allowedHosts)) {
      return new Response("Origin is disallowed", { status: 520 });
    }
    const handlers = outboundHandlersRegistry.get(className);
    if (outboundByHostOverrides && handlers) {
      const override = outboundByHostOverrides[hostname] ?? Object.entries(outboundByHostOverrides).find(([pattern]) => pattern !== hostname && simpleGlobMatch(pattern, hostname))?.[1];
      if (override && handlers[override.method]) {
        return handlers[override.method](request, this.env, {
          ...baseCtx,
          params: override.params
        });
      }
    }
    const handlersByHost = outboundByHostRegistry.get(className);
    if (handlersByHost) {
      const handler = handlersByHost[hostname] ?? Object.entries(handlersByHost).find(([pattern]) => pattern !== hostname && simpleGlobMatch(pattern, hostname))?.[1];
      if (handler) {
        return handler(request, this.env, baseCtx);
      }
    }
    if (!interceptAll) {
      if (allowedHosts || enableInternet) {
        return fetch(request);
      }
      return new Response("Origin is disallowed", { status: 520 });
    }
    if (outboundHandlerOverride && handlers?.[outboundHandlerOverride.method]) {
      return handlers[outboundHandlerOverride.method](request, this.env, {
        ...baseCtx,
        params: outboundHandlerOverride.params
      });
    }
    const defaultOutboundHandlerName = defaultOutboundHandlerNameRegistry.get(className);
    if (defaultOutboundHandlerName && handlers?.[defaultOutboundHandlerName]) {
      return handlers[defaultOutboundHandlerName](request, this.env, baseCtx);
    }
    if (allowedHosts) {
      return fetch(request);
    }
    if (enableInternet) {
      return fetch(request);
    }
    return new Response("Origin is disallowed", { status: 520 });
  }
};
var Container = class extends DurableObject {
  static get outboundByHost() {
    return outboundByHostRegistry.get(this.name);
  }
  static set outboundByHost(handlers) {
    outboundByHostRegistry.set(this.name, handlers);
  }
  static get outboundHandlers() {
    return outboundHandlersRegistry.get(this.name);
  }
  static set outboundHandlers(handlers) {
    const existing = outboundHandlersRegistry.get(this.name) ?? {};
    outboundHandlersRegistry.set(this.name, { ...existing, ...handlers });
  }
  static get outbound() {
    const handlerName = defaultOutboundHandlerNameRegistry.get(this.name);
    if (!handlerName)
      return void 0;
    return outboundHandlersRegistry.get(this.name)?.[handlerName];
  }
  static set outbound(handler) {
    const key = "__outbound__";
    const existing = outboundHandlersRegistry.get(this.name) ?? {};
    outboundHandlersRegistry.set(this.name, { ...existing, [key]: handler });
    defaultOutboundHandlerNameRegistry.set(this.name, key);
  }
  static get outboundProxies() {
    return this.outboundHandlers;
  }
  static set outboundProxies(handlers) {
    this.outboundHandlers = handlers;
  }
  static get outboundProxy() {
    return this.outbound;
  }
  static set outboundProxy(handler) {
    this.outbound = handler;
  }
  // =========================
  //     Public Attributes
  // =========================
  // Default port for the container (undefined means no default port)
  defaultPort;
  // Required ports that should be checked for availability during container startup
  // Override this in your subclass to specify ports that must be ready
  requiredPorts;
  // Timeout after which the container will sleep if no activity
  // The signal sent to the container by default is a SIGTERM.
  // The container won't get a SIGKILL if this threshold is triggered.
  sleepAfter = DEFAULT_SLEEP_AFTER;
  // Container configuration properties
  // Set these properties directly in your container instance
  envVars = {};
  entrypoint;
  enableInternet = true;
  labels = {};
  // When true, outbound HTTPS traffic from the container will be intercepted.
  // The container must trust /etc/cloudflare/certs/cloudflare-containers-ca.crt
  interceptHttps = false;
  // Hosts that are allowed to access the internet, even when enableInternet is false.
  // Useful for allowing specific domains on a per-host basis.
  allowedHosts;
  // Hosts that are denied internet access, even when enableInternet is true.
  // Also blocks hosts from being handled by the catch-all outbound handler.
  deniedHosts;
  // pingEndpoint is the host and path value that the class will use to send a request to the container and check if the
  // instance is ready.
  //
  // The user does not have to implement this route by any means,
  // but it's still useful if you want to control the path that
  // the Container class uses to send HTTP requests to.
  pingEndpoint = "ping";
  applyOutboundInterceptionPromise = Promise.resolve();
  usingInterception = false;
  // =========================
  //     PUBLIC INTERFACE
  // =========================
  constructor(ctx, env, options) {
    super(ctx, env);
    if (ctx.container === void 0) {
      throw new Error("Containers have not been enabled for this Durable Object class. Have you correctly setup your Wrangler config? More info: https://developers.cloudflare.com/containers/get-started/#configuration");
    }
    this.state = new ContainerState(this.ctx.storage);
    const persistedOutboundConfiguration = this.restoreOutboundConfiguration();
    this.ctx.blockConcurrencyWhile(async () => {
      await this.scheduleNextAlarm();
      this.renewActivityTimeout();
      const ctor = this.constructor;
      if (persistedOutboundConfiguration !== void 0 || ctor.outboundByHost !== void 0 || ctor.outbound !== void 0 || ctor.outboundHandlers !== void 0 || this.effectiveAllowedHosts !== void 0 || this.effectiveDeniedHosts !== void 0) {
        this.usingInterception = true;
      }
      if (this.container.running) {
        this.applyOutboundInterceptionPromise = this.applyOutboundInterception();
      }
    });
    this.container = ctx.container;
    if (options) {
      if (options.defaultPort !== void 0)
        this.defaultPort = options.defaultPort;
      if (options.sleepAfter !== void 0)
        this.sleepAfter = options.sleepAfter;
      if (options.envVars !== void 0)
        this.envVars = options.envVars;
      if (options.entrypoint !== void 0)
        this.entrypoint = options.entrypoint;
      if (options.enableInternet !== void 0)
        this.enableInternet = options.enableInternet;
    }
    this.sql`
      CREATE TABLE IF NOT EXISTS container_schedules (
        id TEXT PRIMARY KEY NOT NULL DEFAULT (randomblob(9)),
        callback TEXT NOT NULL,
        payload TEXT,
        type TEXT NOT NULL CHECK(type IN ('scheduled', 'delayed')),
        time INTEGER NOT NULL,
        delayInSeconds INTEGER,
        created_at INTEGER DEFAULT (unixepoch())
      )
    `;
    if (this.container.running) {
      this.monitor = this.container.monitor();
      this.setupMonitorCallbacks();
    }
  }
  /**
   * Gets the current state of the container
   * @returns Promise<State>
   */
  async getState() {
    return { ...await this.state.getState() };
  }
  // ====================================
  //     OUTBOUND INTERCEPTION CONFIG
  // ====================================
  /**
   * Set the catch-all outbound handler to a named method from `outboundHandlers`.
   * Overrides the default `outbound` at runtime via ContainerProxy props.
   *
   * @param methodName - Name of a method defined in `static outboundHandlers`
   * @param params - Optional params passed to the handler as `ctx.params`
   * @throws Error if the method name is not found in `outboundHandlers`
   */
  async setOutboundHandler(methodName, ...paramsArg) {
    this.validateOutboundHandlerMethodName(methodName);
    this.outboundHandlerOverride = paramsArg.length === 0 ? { method: methodName } : { method: methodName, params: paramsArg[0] };
    await this.refreshOutboundInterception();
  }
  /**
   * Add or override a hostname-specific outbound handler at runtime,
   * referencing a named method from `outboundHandlers`.
   * Overrides any matching entry in `static outboundByHost` for this hostname.
   *
   * @param hostname - The hostname or ip:port to intercept (e.g. `'google.com'`)
   * @param methodName - Name of a method defined in `static outboundHandlers`
   * @param params - Optional params passed to the handler as `ctx.params`
   * @throws Error if the method name is not found in `outboundHandlers`
   */
  async setOutboundByHost(hostname, methodName, ...paramsArg) {
    this.validateOutboundHandlerMethodName(methodName);
    this.outboundByHostOverrides[hostname] = paramsArg.length === 0 ? { method: methodName } : { method: methodName, params: paramsArg[0] };
    await this.refreshOutboundInterception();
  }
  /**
   * Remove a runtime hostname override added via `setOutboundByHost`.
   * The default handler from `static outboundByHost` (if any) will be used again.
   *
   * @param hostname - The hostname or ip:port to stop overriding
   */
  async removeOutboundByHost(hostname) {
    delete this.outboundByHostOverrides[hostname];
    await this.refreshOutboundInterception();
  }
  /**
   * Replace all runtime hostname overrides at once.
   * Each value may be either a method name or an object with `method` and `params`.
   *
   * @param handlers - Record mapping hostnames to handler configs in `outboundHandlers`
   * @throws Error if any method name is not found in `outboundHandlers`
   */
  async setOutboundByHosts(handlers) {
    for (const handler of Object.values(handlers)) {
      const methodName = typeof handler === "string" ? handler : handler.method;
      this.validateOutboundHandlerMethodName(methodName);
    }
    this.outboundByHostOverrides = Object.fromEntries(Object.entries(handlers).map(([hostname, handler]) => [
      hostname,
      typeof handler === "string" ? { method: handler } : handler
    ]));
    await this.refreshOutboundInterception();
  }
  // ====================================
  //     ALLOWED / DENIED HOSTS CONFIG
  // ====================================
  /**
   * Replace all allowed hosts at runtime.
   * Allowed hosts get internet access even when `enableInternet` is false.
   *
   * @param hosts - Array of hostnames to allow (e.g. `['api.stripe.com', 'example.com']`)
   */
  async setAllowedHosts(hosts) {
    this.allowedHostsOverride = [...hosts];
    this.usingInterception = true;
    await this.refreshOutboundInterception();
  }
  /**
   * Replace all denied hosts at runtime.
   * Denied hosts are blocked unconditionally, even when `enableInternet` is true
   * or a catch-all outbound handler is set.
   *
   * @param hosts - Array of hostnames to deny (e.g. `['evil.com', 'blocked.org']`)
   */
  async setDeniedHosts(hosts) {
    this.deniedHostsOverride = [...hosts];
    this.usingInterception = true;
    await this.refreshOutboundInterception();
  }
  /**
   * Add a single hostname to the allowed hosts list at runtime.
   *
   * @param hostname - The hostname to allow (e.g. `'api.stripe.com'`)
   */
  async allowHost(hostname) {
    const effective = this.effectiveAllowedHosts ?? [];
    if (!effective.includes(hostname)) {
      this.allowedHostsOverride = [...effective, hostname];
    }
    this.usingInterception = true;
    await this.refreshOutboundInterception();
  }
  /**
   * Add a single hostname to the denied hosts list at runtime.
   *
   * @param hostname - The hostname to deny (e.g. `'evil.com'`)
   */
  async denyHost(hostname) {
    const effective = this.effectiveDeniedHosts ?? [];
    if (!effective.includes(hostname)) {
      this.deniedHostsOverride = [...effective, hostname];
    }
    this.usingInterception = true;
    await this.refreshOutboundInterception();
  }
  /**
   * Remove a hostname from the allowed hosts list.
   *
   * @param hostname - The hostname to remove from the allow list
   */
  async removeAllowedHost(hostname) {
    this.allowedHostsOverride = (this.effectiveAllowedHosts ?? []).filter((h) => h !== hostname);
    await this.refreshOutboundInterception();
  }
  /**
   * Remove a hostname from the denied hosts list.
   *
   * @param hostname - The hostname to remove from the deny list
   */
  async removeDeniedHost(hostname) {
    this.deniedHostsOverride = (this.effectiveDeniedHosts ?? []).filter((h) => h !== hostname);
    await this.refreshOutboundInterception();
  }
  // ==========================
  //     CONTAINER STARTING
  // ==========================
  /**
   * Start the container if it's not running and set up monitoring and lifecycle hooks,
   * without waiting for ports to be ready.
   *
   * It will automatically retry if the container fails to start, using the specified waitOptions
   *
   *
   * @example
   * await this.start({
   *   envVars: { DEBUG: 'true', NODE_ENV: 'development' },
   *   entrypoint: ['npm', 'run', 'dev'],
   *   enableInternet: false,
   *   labels: { tenant: 'acme', env: 'prod' },
   * });
   *
   * @param startOptions - Override `envVars`, `entrypoint`, `enableInternet` and `labels` on a per-instance basis
   * @param waitOptions - Optional wait configuration with abort signal for cancellation. Default ~8s timeout.
   * @returns A promise that resolves when the container start command has been issued
   * @throws Error if no container context is available or if all start attempts fail
   */
  async start(startOptions, waitOptions) {
    const portToCheck = waitOptions?.portToCheck ?? this.defaultPort ?? (this.requiredPorts ? this.requiredPorts[0] : FALLBACK_PORT_TO_CHECK);
    const pollInterval = waitOptions?.waitInterval ?? INSTANCE_POLL_INTERVAL_MS;
    await this.startContainerIfNotRunning({
      signal: waitOptions?.signal,
      waitInterval: pollInterval,
      retries: waitOptions?.retries ?? Math.ceil(TIMEOUT_TO_GET_CONTAINER_MS / pollInterval),
      portToCheck
    }, startOptions);
    this.setupMonitorCallbacks();
    await this.ctx.blockConcurrencyWhile(async () => {
      await this.onStart();
    });
  }
  async startAndWaitForPorts(portsOrArgs, cancellationOptions, startOptions) {
    let ports;
    let resolvedCancellationOptions;
    let resolvedStartOptions;
    if (typeof portsOrArgs === "object" && portsOrArgs !== null && !Array.isArray(portsOrArgs)) {
      ports = portsOrArgs.ports;
      resolvedCancellationOptions = portsOrArgs.cancellationOptions;
      resolvedStartOptions = portsOrArgs.startOptions;
    } else {
      ports = portsOrArgs;
      resolvedCancellationOptions = cancellationOptions;
      resolvedStartOptions = startOptions;
    }
    const portsToCheck = await this.getPortsToCheck(ports);
    await this.syncPendingStoppedEvents();
    resolvedCancellationOptions ??= {};
    const containerGetTimeout = resolvedCancellationOptions.instanceGetTimeoutMS ?? TIMEOUT_TO_GET_CONTAINER_MS;
    const pollInterval = resolvedCancellationOptions.waitInterval ?? INSTANCE_POLL_INTERVAL_MS;
    const containerGetRetries = Math.ceil(containerGetTimeout / pollInterval);
    const waitOptions = {
      signal: resolvedCancellationOptions.abort,
      retries: containerGetRetries,
      waitInterval: pollInterval,
      portToCheck: portsToCheck[0]
    };
    const triesUsed = await this.startContainerIfNotRunning(waitOptions, resolvedStartOptions);
    const totalPortReadyTries = Math.ceil((resolvedCancellationOptions.portReadyTimeoutMS ?? TIMEOUT_TO_GET_PORTS_MS) / pollInterval);
    let triesLeft = totalPortReadyTries - triesUsed;
    for (const port of portsToCheck) {
      triesLeft = await this.waitForPort({
        signal: resolvedCancellationOptions.abort,
        waitInterval: pollInterval,
        retries: triesLeft,
        portToCheck: port
      });
    }
    this.setupMonitorCallbacks();
    await this.ctx.blockConcurrencyWhile(async () => {
      await this.state.setHealthy();
      await this.onStart();
    });
  }
  /**
   *
   * Waits for a specified port to be ready
   *
   * Returns the number of tries used to get the port, or throws if it couldn't get the port within the specified retry limits.
   *
   * @param waitOptions -
   * - `portToCheck`: The port number to check
   * - `abort`: Optional AbortSignal to cancel waiting
   * - `retries`: Number of retries before giving up (default: TRIES_TO_GET_PORTS)
   * - `waitInterval`: Interval between retries in milliseconds (default: INSTANCE_POLL_INTERVAL_MS)
   */
  async waitForPort(waitOptions) {
    const port = waitOptions.portToCheck;
    const tcpPort = this.container.getTcpPort(port);
    const abortedSignal = new Promise((res) => {
      waitOptions.signal?.addEventListener("abort", () => {
        res(true);
      });
    });
    const pollInterval = waitOptions.waitInterval ?? INSTANCE_POLL_INTERVAL_MS;
    const tries = waitOptions.retries ?? Math.ceil(TIMEOUT_TO_GET_PORTS_MS / pollInterval);
    for (let i = 0; i < tries; i++) {
      try {
        const combinedSignal = addTimeoutSignal(waitOptions.signal, PING_TIMEOUT_MS);
        await tcpPort.fetch(`http://${this.pingEndpoint}`, { signal: combinedSignal });
        break;
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        if (!this.container.running) {
          try {
            await this.onError(new Error(`Container crashed while checking for ports, did you start the container and setup the entrypoint correctly?`));
          } catch {
          }
          throw e;
        }
        if (i === tries - 1) {
          try {
            await this.onError(`Failed to verify port ${port} is available after ${(i + 1) * pollInterval}ms, last error: ${errorMessage}`);
          } catch {
          }
          throw e;
        }
        await Promise.any([
          new Promise((resolve) => setTimeout(resolve, pollInterval)),
          abortedSignal
        ]);
        if (waitOptions.signal?.aborted) {
          throw new Error("Container request aborted.", { cause: e });
        }
      }
    }
    return tries;
  }
  // =======================
  //     LIFECYCLE HOOKS
  // =======================
  /**
   * Send a signal to the container.
   * @param signal - The signal to send to the container (default: 15 for SIGTERM)
   */
  async stop(signal = "SIGTERM") {
    if (this.container.running) {
      this.container.signal(typeof signal === "string" ? signalToNumbers[signal] : signal);
    }
    await this.syncPendingStoppedEvents();
  }
  /**
   * Destroys the container with a SIGKILL. Triggers onStop.
   */
  async destroy() {
    await this.container.destroy();
  }
  /**
   * Lifecycle method called when container starts successfully
   * Override this method in subclasses to handle container start events
   */
  onStart() {
  }
  /**
   * Lifecycle method called when container shuts down
   * Override this method in subclasses to handle Container stopped events
   * @param params - Object containing exitCode and reason for the stop
   */
  onStop(params) {
    void params;
  }
  /**
   * Lifecycle method called when the container is running, and the activity timeout
   * expiration (set by `sleepAfter`) has been reached.
   *
   * If you want to shutdown the container, you should call this.stop() here
   *
   * By default, this method calls `this.stop()`
   */
  async onActivityExpired() {
    console.log("Activity expired, signalling container to stop");
    if (!this.container.running) {
      return;
    }
    await this.stop();
  }
  /**
   * Error handler for container errors
   * Override this method in subclasses to handle container errors
   * @param error - The error that occurred
   * @returns Can return any value or throw the error
   */
  onError(error) {
    console.error("Container error:", error);
    throw error;
  }
  /**
   * Renew the container's activity timeout
   *
   * Call this method whenever there is activity on the container
   */
  renewActivityTimeout() {
    const timeoutInMs = parseTimeExpression(this.sleepAfter) * 1e3;
    this.sleepAfterMs = Date.now() + timeoutInMs;
  }
  /**
   * Decrement the inflight request counter.
   * When the counter transitions to 0, renew the activity timeout so the
   * inactivity window starts fresh from the moment the last request completes.
   */
  decrementInflight() {
    this.inflightRequests = Math.max(0, this.inflightRequests - 1);
    if (this.inflightRequests === 0) {
      this.renewActivityTimeout();
    }
  }
  // ==================
  //     SCHEDULING
  // ==================
  /**
   * Schedule a task to be executed in the future.
   *
   * We strongly recommend using this instead of the `alarm` handler.
   *
   * @template T Type of the payload data
   * @param when When to execute the task (Date object or number of seconds delay)
   * @param callback Name of the method to call
   * @param payload Data to pass to the callback
   * @returns Schedule object representing the scheduled task
   */
  async schedule(when, callback, payload) {
    const id = generateId(9);
    if (typeof callback !== "string") {
      throw new Error("Callback must be a string (method name)");
    }
    if (typeof this[callback] !== "function") {
      throw new Error(`this.${callback} is not a function`);
    }
    if (when instanceof Date) {
      const timestamp = Math.floor(when.getTime() / 1e3);
      this.sql`
        INSERT OR REPLACE INTO container_schedules (id, callback, payload, type, time)
        VALUES (${id}, ${callback}, ${JSON.stringify(payload)}, 'scheduled', ${timestamp})
      `;
      await this.scheduleNextAlarm();
      return {
        taskId: id,
        callback,
        payload,
        time: timestamp,
        type: "scheduled"
      };
    }
    if (typeof when === "number") {
      const time = Math.floor(Date.now() / 1e3 + when);
      this.sql`
        INSERT OR REPLACE INTO container_schedules (id, callback, payload, type, delayInSeconds, time)
        VALUES (${id}, ${callback}, ${JSON.stringify(payload)}, 'delayed', ${when}, ${time})
      `;
      await this.scheduleNextAlarm();
      return {
        taskId: id,
        callback,
        payload,
        delayInSeconds: when,
        time,
        type: "delayed"
      };
    }
    throw new Error("Invalid schedule type. 'when' must be a Date or number of seconds");
  }
  // ============
  //     HTTP
  // ============
  /**
   * Send a request to the container (HTTP or WebSocket) using standard fetch API signature
   *
   * This method handles HTTP requests to the container.
   *
   * WebSocket requests done outside the DO won't work until https://github.com/cloudflare/workerd/issues/2319 is addressed.
   * Until then, please use `switchPort` + `fetch()`.
   *
   * Method supports multiple signatures to match standard fetch API:
   * - containerFetch(request: Request, port?: number)
   * - containerFetch(url: string | URL, init?: RequestInit, port?: number)
   *
   * Starts the container if not already running, and waits for the target port to be ready.
   *
   * @returns A Response from the container
   */
  async containerFetch(requestOrUrl, portOrInit, portParam) {
    const { request, port } = this.requestAndPortFromContainerFetchArgs(requestOrUrl, portOrInit, portParam);
    const state = await this.state.getState();
    if (!this.container.running || state.status !== "healthy") {
      try {
        await this.startAndWaitForPorts(port, { abort: request.signal });
      } catch (e) {
        if (isNoInstanceError(e)) {
          return new Response("There is no Container instance available at this time.\nThis is likely because you have reached your max concurrent instance count (set in wrangler config) or are you currently provisioning the Container.\nIf you are deploying your Container for the first time, check your dashboard to see provisioning status, this may take a few minutes.", { status: 503 });
        }
        if (isRateLimitedError(e)) {
          return new Response(e instanceof Error ? e.message : String(e), { status: 429 });
        }
        return new Response(`Failed to start container: ${e instanceof Error ? e.message : String(e)}`, {
          status: 500
        });
      }
    }
    const tcpPort = this.container.getTcpPort(port);
    const containerUrl = request.url.replace("https:", "http:");
    this.inflightRequests++;
    try {
      this.renewActivityTimeout();
      const res = await tcpPort.fetch(containerUrl, request);
      if (res.webSocket !== null) {
        const containerWs = res.webSocket;
        const [client, server] = Object.values(new WebSocketPair());
        let settled = false;
        const settleInflight = () => {
          if (!settled) {
            settled = true;
            this.decrementInflight();
          }
        };
        containerWs.accept();
        server.accept();
        server.addEventListener("message", async (event) => {
          this.renewActivityTimeout();
          try {
            const data = event.data instanceof Blob ? await event.data.arrayBuffer() : event.data;
            containerWs.send(data);
          } catch {
            server.close(1011, "Failed to forward message to container");
          }
        });
        containerWs.addEventListener("message", async (event) => {
          this.renewActivityTimeout();
          try {
            const data = event.data instanceof Blob ? await event.data.arrayBuffer() : event.data;
            server.send(data);
          } catch {
            containerWs.close(1011, "Failed to forward message to client");
          }
        });
        server.addEventListener("close", (event) => {
          settleInflight();
          const code = event.code === 1005 || event.code === 1006 ? 1e3 : event.code;
          containerWs.close(code, event.reason);
        });
        containerWs.addEventListener("close", (event) => {
          settleInflight();
          const code = event.code === 1005 || event.code === 1006 ? 1e3 : event.code;
          server.close(code, event.reason);
        });
        server.addEventListener("error", () => {
          settleInflight();
          containerWs.close(1011, "Client WebSocket error");
        });
        containerWs.addEventListener("error", () => {
          settleInflight();
          server.close(1011, "Container WebSocket error");
        });
        return new Response(null, { status: res.status, webSocket: client, headers: res.headers });
      }
      if (res.body !== null) {
        const { readable, writable } = new IdentityTransformStream();
        res.body?.pipeTo(writable).finally(() => {
          this.decrementInflight();
        });
        return new Response(readable, res);
      }
      this.decrementInflight();
      return res;
    } catch (e) {
      this.decrementInflight();
      if (!(e instanceof Error)) {
        throw e;
      }
      if (e.message.includes("Network connection lost.")) {
        return new Response("Container suddenly disconnected, try again", { status: 500 });
      }
      console.error(`Error proxying request to container ${this.ctx.id}:`, e);
      return new Response(`Error proxying request to container: ${e instanceof Error ? e.message : String(e)}`, { status: 500 });
    }
  }
  /**
   *
   * Fetch handler on the Container class.
   * By default this forwards all requests to the container by calling `containerFetch`.
   * Use `switchPort` to specify which port on the container to target, or this will use `defaultPort`.
   * @param request The request to handle
   */
  async fetch(request) {
    if (this.defaultPort === void 0 && !request.headers.has("cf-container-target-port")) {
      throw new Error("No port configured for this container. Set the `defaultPort` in your Container subclass, or specify a port with `container.fetch(switchPort(request, port))`.");
    }
    let portValue = this.defaultPort;
    if (request.headers.has("cf-container-target-port")) {
      const portFromHeaders = parseInt(request.headers.get("cf-container-target-port") ?? "");
      if (isNaN(portFromHeaders)) {
        throw new Error("port value from switchPort is not a number");
      } else {
        portValue = portFromHeaders;
      }
    }
    return await this.containerFetch(request, portValue);
  }
  // ===============================
  // ===============================
  //     PRIVATE METHODS & ATTRS
  // ===============================
  // ===============================
  // ==========================
  //     PRIVATE ATTRIBUTES
  // ==========================
  container;
  // onStopCalled will be true when we are in the middle of an onStop call
  onStopCalled = false;
  state;
  monitor;
  // Coalesces concurrent calls to startContainerIfNotRunning so we never
  // call `this.container.start()` twice. Without this guard, two requests
  // racing the readiness path can both pass the `if (this.container.running)`
  // early-return (each yielding the DO input gate at storage awaits) and
  // both reach the synchronous workerd `start()`, causing the second to
  // throw "start() cannot be called on a container that is already running."
  // See https://github.com/cloudflare/containers/issues/173.
  startInFlight;
  monitoredPromise;
  sleepAfterMs = 0;
  inflightRequests = 0;
  // Outbound interception runtime overrides (passed through ContainerProxy props)
  outboundByHostOverrides = {};
  outboundHandlerOverride;
  // Only set when the user calls setAllowedHosts/setDeniedHosts at runtime
  allowedHostsOverride;
  deniedHostsOverride;
  // The runtime does not expose a way to remove outbound interceptions yet, so
  // once we promote an instance to intercept-all we must keep using it.
  hasInterceptAllRegistration = false;
  // ==========================
  //     GENERAL HELPERS
  // ==========================
  /**
   * Validates that a method name exists in the outboundHandlers registry for this class.
   * @throws Error if the method name is not found
   */
  validateOutboundHandlerMethodName(methodName) {
    const handlers = outboundHandlersRegistry.get(this.constructor.name);
    if (!handlers || !(methodName in handlers)) {
      throw new Error(`Outbound handler method '${methodName}' not found in outboundHandlers for ${this.constructor.name}`);
    }
  }
  get effectiveAllowedHosts() {
    return this.allowedHostsOverride ?? this.allowedHosts;
  }
  get effectiveDeniedHosts() {
    return this.deniedHostsOverride ?? this.deniedHosts;
  }
  getOutboundConfiguration() {
    return {
      outboundByHostOverrides: Object.keys(this.outboundByHostOverrides).length > 0 ? this.outboundByHostOverrides : void 0,
      outboundHandlerOverride: this.outboundHandlerOverride,
      allowedHosts: this.effectiveAllowedHosts,
      deniedHosts: this.effectiveDeniedHosts,
      hasInterceptAllRegistration: this.hasInterceptAllRegistration || void 0
    };
  }
  persistOutboundConfiguration(configuration) {
    this.ctx.storage.kv.put(OUTBOUND_CONFIGURATION_KEY, {
      ...configuration,
      allowedHosts: this.allowedHostsOverride,
      deniedHosts: this.deniedHostsOverride
    });
  }
  restoreOutboundConfiguration() {
    const configuration = this.ctx.storage.kv.get(OUTBOUND_CONFIGURATION_KEY);
    if (!configuration) {
      return void 0;
    }
    this.outboundHandlerOverride = void 0;
    if (configuration.outboundHandlerOverride !== void 0) {
      try {
        this.validateOutboundHandlerMethodName(configuration.outboundHandlerOverride.method);
        this.outboundHandlerOverride = configuration.outboundHandlerOverride;
      } catch (error) {
        console.warn("Ignoring invalid persisted outbound handler override:", error);
      }
    }
    this.outboundByHostOverrides = {};
    for (const [hostname, override] of Object.entries(configuration.outboundByHostOverrides ?? {})) {
      try {
        this.validateOutboundHandlerMethodName(override.method);
        this.outboundByHostOverrides[hostname] = override;
      } catch (error) {
        console.warn(`Ignoring invalid persisted outbound override for ${hostname}:`, error);
      }
    }
    this.hasInterceptAllRegistration = configuration.hasInterceptAllRegistration === true;
    if (configuration.allowedHosts) {
      this.allowedHostsOverride = configuration.allowedHosts;
    }
    if (configuration.deniedHosts) {
      this.deniedHostsOverride = configuration.deniedHosts;
    }
    return this.getOutboundConfiguration();
  }
  /**
   * Returns true if a catch-all outbound HTTP interception is needed.
   * This is the case when a static `outbound` handler or a runtime
   * `outboundHandlerOverride` (catch-all) is configured.
   * When false, we only intercept specific hosts to avoid overhead.
   */
  needsCatchAllInterception() {
    const ctor = this.constructor;
    return ctor.outbound !== void 0 || this.outboundHandlerOverride !== void 0;
  }
  hasMutableOutboundConfiguration() {
    return Object.keys(this.outboundByHostOverrides).length > 0 || this.allowedHostsOverride !== void 0 || this.deniedHostsOverride !== void 0;
  }
  shouldInterceptAllOutbound() {
    return this.hasInterceptAllRegistration || this.needsCatchAllInterception() || this.effectiveAllowedHosts !== void 0 || this.effectiveDeniedHosts !== void 0 || this.hasMutableOutboundConfiguration();
  }
  getStaticOutboundByHostKeys() {
    const ctor = this.constructor;
    return ctor.outboundByHost ? Object.keys(ctor.outboundByHost) : [];
  }
  /**
   * Collects all hostnames that need per-host outbound interception.
   * This path is only used for the narrow optimized case where outbound
   * handling is static and host-specific.
   */
  getHostsToIntercept() {
    const hosts = /* @__PURE__ */ new Set();
    const ctor = this.constructor;
    if (ctor.outboundByHost) {
      for (const hostname of Object.keys(ctor.outboundByHost)) {
        hosts.add(hostname);
      }
    }
    for (const hostname of Object.keys(this.outboundByHostOverrides)) {
      hosts.add(hostname);
    }
    return [...hosts];
  }
  async refreshOutboundInterception() {
    if (!this.usingInterception) {
      return;
    }
    this.applyOutboundInterceptionPromise = this.applyOutboundInterception();
    await this.applyOutboundInterceptionPromise;
  }
  /**
   * Applies (or re-applies) outbound HTTP interception with the current
   * default registries + runtime overrides passed through ContainerProxy props.
   *
   * Uses per-host interception only for static host-specific outbound handlers.
   * As soon as the config needs to evaluate all hosts (catch-all outbound,
   * allow/deny lists, or runtime-mutated outbound config), we promote the
   * container to intercept-all and keep it there until the instance restarts.
   *
   * When `interceptHttps` is enabled, also applies HTTPS interception:
   * - Intercept-all mode: `interceptOutboundHttps('*', ...)` for all HTTPS traffic
   * - Per-host mode: `interceptOutboundHttps(host, ...)` for each known host
   */
  async applyOutboundInterception() {
    const ctx = this.ctx;
    if (ctx.exports === void 0) {
      throw new Error("ctx.exports is undefined, please try to update your compatibility date or export ContainerProxy from the containers package in your worker entrypoint");
    }
    if (ctx.exports.ContainerProxy === void 0) {
      throw new Error("ctx.exports.ContainerProxy is undefined, export ContainerProxy from the containers package in your worker entrypoint");
    }
    const interceptAll = this.shouldInterceptAllOutbound();
    if (interceptAll) {
      this.hasInterceptAllRegistration = interceptAll;
    }
    const outboundConfiguration = this.getOutboundConfiguration();
    this.persistOutboundConfiguration(outboundConfiguration);
    const hosts = this.getHostsToIntercept();
    const props = {
      enableInternet: this.enableInternet,
      containerId: this.ctx.id.toString(),
      className: this.constructor.name,
      outboundByHostOverrides: outboundConfiguration.outboundByHostOverrides,
      outboundHandlerOverride: outboundConfiguration.outboundHandlerOverride,
      allowedHosts: outboundConfiguration.allowedHosts,
      deniedHosts: outboundConfiguration.deniedHosts,
      interceptAll
    };
    const fetcher = ctx.exports.ContainerProxy({
      props
    });
    if (interceptAll) {
      for (const host of this.getStaticOutboundByHostKeys()) {
        await this.container.interceptOutboundHttp(host, fetcher);
        if (this.interceptHttps) {
          await this.container.interceptOutboundHttps(host, fetcher);
        }
      }
      if (this.interceptHttps) {
        await this.container.interceptOutboundHttps("*", fetcher);
      }
      await this.container.interceptAllOutboundHttp(fetcher);
    } else {
      for (const host of hosts) {
        await this.container.interceptOutboundHttp(host, fetcher);
        if (this.interceptHttps) {
          await this.container.interceptOutboundHttps(host, fetcher);
        }
      }
    }
  }
  /**
   * Execute SQL queries against the Container's database
   */
  sql(strings, ...values) {
    const query = strings.reduce((acc, str2, i) => acc + str2 + (i < values.length ? "?" : ""), "");
    return [...this.ctx.storage.sql.exec(query, ...values)];
  }
  requestAndPortFromContainerFetchArgs(requestOrUrl, portOrInit, portParam) {
    let request;
    let port;
    if (requestOrUrl instanceof Request) {
      request = requestOrUrl;
      port = typeof portOrInit === "number" ? portOrInit : void 0;
    } else {
      const url = typeof requestOrUrl === "string" ? requestOrUrl : requestOrUrl.toString();
      const init = typeof portOrInit === "number" ? {} : portOrInit || {};
      port = typeof portOrInit === "number" ? portOrInit : typeof portParam === "number" ? portParam : void 0;
      request = new Request(url, init);
    }
    port ??= this.defaultPort;
    if (port === void 0) {
      throw new Error("No port specified for container fetch. Set defaultPort or specify a port parameter.");
    }
    return { request, port };
  }
  /**
   *
   * The method prioritizes port sources in this order:
   * 1. Ports specified directly in the method call
   * 2. `requiredPorts` class property (if set)
   * 3. `defaultPort` (if neither of the above is specified)
   * 4. Falls back to port 33 if none of the above are set
   */
  async getPortsToCheck(overridePorts) {
    if (overridePorts !== void 0) {
      return Array.isArray(overridePorts) ? overridePorts : [overridePorts];
    }
    if (this.requiredPorts && this.requiredPorts.length > 0) {
      return [...this.requiredPorts];
    }
    return [this.defaultPort ?? FALLBACK_PORT_TO_CHECK];
  }
  // ===========================================
  //     CONTAINER INTERACTION & MONITORING
  // ===========================================
  /**
   * Tries to start a container if it's not already running
   * Returns the number of tries used
   */
  async startContainerIfNotRunning(waitOptions, options) {
    if (this.startInFlight) {
      return this.startInFlight;
    }
    if (this.container.running) {
      if (!this.monitor) {
        this.monitor = this.container.monitor();
      }
      return 0;
    }
    const startPromise = this.doStartContainer(waitOptions, options);
    this.startInFlight = startPromise;
    try {
      return await startPromise;
    } finally {
      if (this.startInFlight === startPromise) {
        this.startInFlight = void 0;
      }
    }
  }
  async doStartContainer(waitOptions, options) {
    const abortedSignal = new Promise((res) => {
      waitOptions.signal?.addEventListener("abort", () => {
        res(true);
      });
    });
    const pollInterval = waitOptions.waitInterval ?? INSTANCE_POLL_INTERVAL_MS;
    const totalTries = waitOptions.retries ?? Math.ceil(TIMEOUT_TO_GET_CONTAINER_MS / pollInterval);
    for (let tries = 0; tries < totalTries; tries++) {
      const envVars = options?.envVars ?? this.envVars;
      const entrypoint = options?.entrypoint ?? this.entrypoint;
      const enableInternet = options?.enableInternet ?? this.enableInternet;
      const labels = options?.labels ?? this.labels;
      const startConfig = {
        enableInternet
      };
      if (envVars && Object.keys(envVars).length > 0)
        startConfig.env = envVars;
      if (entrypoint)
        startConfig.entrypoint = entrypoint;
      if (labels && Object.keys(labels).length > 0)
        startConfig.labels = labels;
      this.renewActivityTimeout();
      const handleError = async () => {
        const err = await this.monitor?.catch((err2) => err2);
        if (typeof err === "number") {
          const toThrow = new Error(`Container exited before we could determine the container health, exit code: ${err}`);
          await this.state.setStoppedWithCode(err);
          this.monitor = void 0;
          try {
            await this.onError(toThrow);
          } catch {
          }
          throw toThrow;
        } else if (!isNoInstanceError(err)) {
          await this.state.setStopped();
          this.monitor = void 0;
          try {
            await this.onError(err);
          } catch {
          }
          throw err;
        }
      };
      if (tries > 0 && !this.container.running) {
        await handleError();
      }
      await this.scheduleNextAlarm();
      if (!this.container.running) {
        await this.refreshOutboundInterception();
        this.container.start(startConfig);
        this.monitor = this.container.monitor();
        await this.state.setRunning();
      } else {
        await this.scheduleNextAlarm();
      }
      this.renewActivityTimeout();
      const port = this.container.getTcpPort(waitOptions.portToCheck);
      try {
        const combinedSignal = addTimeoutSignal(waitOptions.signal, PING_TIMEOUT_MS);
        await port.fetch("http://containerstarthealthcheck", { signal: combinedSignal });
        return tries;
      } catch (error) {
        if (isNotListeningError(error) && this.container.running) {
          return tries;
        }
        if (!this.container.running && isNotListeningError(error)) {
          await handleError();
        }
        await Promise.any([
          new Promise((res) => setTimeout(res, waitOptions.waitInterval)),
          abortedSignal
        ]);
        if (waitOptions.signal?.aborted) {
          throw new Error("Aborted waiting for container to start as we received a cancellation signal", { cause: error });
        }
        if (totalTries === tries + 1) {
          if (error instanceof Error && error.message.includes("Network connection lost")) {
            this.ctx.abort();
          }
          await handleError();
          await this.state.setStopped();
          this.monitor = void 0;
          throw new Error(NO_CONTAINER_INSTANCE_ERROR, { cause: error });
        }
        continue;
      }
    }
    throw new Error(`Container did not start after ${totalTries * pollInterval}ms`);
  }
  setupMonitorCallbacks() {
    const monitor = this.monitor;
    if (!monitor || this.monitoredPromise === monitor) {
      return;
    }
    this.monitoredPromise = monitor;
    monitor.then(async () => {
      await this.ctx.blockConcurrencyWhile(async () => {
        if (this.monitor === monitor) {
          await this.state.setStoppedWithCode(0);
        }
      });
    }).catch(async (error) => {
      if (this.monitor !== monitor) {
        return;
      }
      if (isNoInstanceError(error)) {
        await this.ctx.blockConcurrencyWhile(async () => {
          if (this.monitor === monitor) {
            await this.state.setStopped();
          }
        });
        return;
      }
      const exitCode = getExitCodeFromError(error);
      if (exitCode !== null) {
        await this.ctx.blockConcurrencyWhile(async () => {
          if (this.monitor === monitor) {
            await this.state.setStoppedWithCode(exitCode);
          }
        });
        return;
      }
      await this.ctx.blockConcurrencyWhile(async () => {
        if (this.monitor === monitor) {
          await this.state.setStopped();
        }
      });
      if (this.monitor !== monitor) {
        return;
      }
      try {
        await this.onError(error);
      } catch {
      }
    }).finally(() => {
      if (this.monitor !== monitor) {
        return;
      }
      this.monitoredPromise = void 0;
      this.monitor = void 0;
      if (this.timeout) {
        if (this.resolve)
          this.resolve();
        clearTimeout(this.timeout);
      }
    });
  }
  deleteSchedules(name) {
    this.sql`DELETE FROM container_schedules WHERE callback = ${name}`;
  }
  // ============================
  //     ALARMS AND SCHEDULES
  // ============================
  /**
   * Method called when an alarm fires
   * Executes any scheduled tasks that are due
   */
  async alarm(alarmProps) {
    if (alarmProps !== void 0 && alarmProps.isRetry && alarmProps.retryCount > MAX_ALARM_RETRIES) {
      const scheduleCount = Number(this.sql`SELECT COUNT(*) as count FROM container_schedules`[0]?.count) || 0;
      const hasScheduledTasks = scheduleCount > 0;
      if (hasScheduledTasks || this.container.running) {
        await this.scheduleNextAlarm();
      }
      return;
    }
    const prevAlarm = Date.now();
    await this.ctx.storage.setAlarm(prevAlarm);
    await this.ctx.storage.sync();
    const result = this.sql`
         SELECT * FROM container_schedules;
       `;
    let minTime = Date.now() + 3 * 60 * 1e3;
    const now = Date.now() / 1e3;
    for (const row of result) {
      if (row.time > now) {
        continue;
      }
      const callback = this[row.callback];
      if (!callback || typeof callback !== "function") {
        console.error(`Callback ${row.callback} not found or is not a function`);
        continue;
      }
      const schedule = this.getSchedule(row.id);
      try {
        const payload = row.payload ? JSON.parse(row.payload) : void 0;
        await callback.call(this, payload, await schedule);
      } catch (e) {
        console.error(`Error executing scheduled callback "${row.callback}":`, e);
      }
      this.sql`DELETE FROM container_schedules WHERE id = ${row.id}`;
    }
    const resultForMinTime = this.sql`
         SELECT * FROM container_schedules;
       `;
    const minTimeFromSchedules = Math.min(...resultForMinTime.map((r) => r.time * 1e3));
    if (!this.container.running) {
      await this.syncPendingStoppedEvents();
      if (resultForMinTime.length == 0) {
        await this.ctx.storage.deleteAlarm();
      } else {
        await this.ctx.storage.setAlarm(minTimeFromSchedules);
      }
      return;
    }
    if (this.isActivityExpired()) {
      await this.onActivityExpired();
      this.renewActivityTimeout();
      return;
    }
    minTime = Math.min(minTimeFromSchedules, minTime, this.sleepAfterMs);
    const timeout = Math.max(0, minTime - Date.now());
    await new Promise((resolve) => {
      this.resolve = resolve;
      if (!this.container.running) {
        resolve();
        return;
      }
      this.timeout = setTimeout(() => {
        resolve();
      }, timeout);
    });
    await this.ctx.storage.setAlarm(Date.now());
  }
  timeout;
  resolve;
  // synchronises container state with the container source of truth to process events
  async syncPendingStoppedEvents() {
    const state = await this.state.getState();
    if (!this.container.running && (state.status === "healthy" || state.status === "running")) {
      await this.callOnStop({ exitCode: 0, reason: "exit" }, state);
      return;
    }
    if (!this.container.running && state.status === "stopped_with_code") {
      await this.callOnStop({ exitCode: state.exitCode ?? 0, reason: "exit" }, state);
      return;
    }
  }
  async callOnStop(onStopParams, stateBeforeOnStop) {
    if (this.onStopCalled) {
      return;
    }
    this.onStopCalled = true;
    const promise = this.onStop(onStopParams);
    if (promise instanceof Promise) {
      await promise.finally(() => {
        this.onStopCalled = false;
      });
    } else {
      this.onStopCalled = false;
    }
    await this.state.setStoppedIfUnchanged(stateBeforeOnStop);
  }
  /**
   * Schedule the next alarm based on upcoming tasks
   */
  async scheduleNextAlarm(ms = 1e3) {
    const nextTime = ms + Date.now();
    if (this.timeout) {
      if (this.resolve)
        this.resolve();
      clearTimeout(this.timeout);
    }
    await this.ctx.storage.setAlarm(nextTime);
    await this.ctx.storage.sync();
  }
  async listSchedules(name) {
    const result = this.sql`
      SELECT * FROM container_schedules WHERE callback = ${name} LIMIT 1
    `;
    if (!result || result.length === 0) {
      return [];
    }
    return result.map(this.toSchedule);
  }
  toSchedule(schedule) {
    let payload;
    try {
      payload = JSON.parse(schedule.payload);
    } catch (e) {
      console.error(`Error parsing payload for schedule ${schedule.id}:`, e);
      payload = void 0;
    }
    if (schedule.type === "delayed") {
      return {
        taskId: schedule.id,
        callback: schedule.callback,
        payload,
        type: "delayed",
        time: schedule.time,
        delayInSeconds: schedule.delayInSeconds
      };
    }
    return {
      taskId: schedule.id,
      callback: schedule.callback,
      payload,
      type: "scheduled",
      time: schedule.time
    };
  }
  /**
   * Get a scheduled task by ID
   * @template T Type of the payload data
   * @param id ID of the scheduled task
   * @returns The Schedule object or undefined if not found
   */
  async getSchedule(id) {
    const result = this.sql`
      SELECT * FROM container_schedules WHERE id = ${id} LIMIT 1
    `;
    if (!result || result.length === 0) {
      return void 0;
    }
    const schedule = result[0];
    return this.toSchedule(schedule);
  }
  isActivityExpired() {
    if (this.inflightRequests > 0) {
      this.renewActivityTimeout();
      return false;
    }
    return this.sleepAfterMs <= Date.now();
  }
};

// fleet-member.json
var fleet_member_default = {
  name: "file-scanner",
  kind: "container",
  entry: "src/worker.mjs",
  testDir: "test",
  surface: {
    "POST /scan": "R1-R4: ClamAV's verdicts on a duplicate of each target's stored bytes",
    "POST /mirror": "R6: one run of the signature mirror (also the daily scheduled trigger)",
    "POST /render": "R7: the safe view, a PDF of page images",
    "GET /version": "R8: the build, ClamAV's and the renderer's versions, the mirror's and lists' state, the catalogue, the bounds",
    "POST /provider/scan": "R5: an outside scanner's verdicts",
    "POST /provider/sandbox": "R23: a sandbox submission",
    "POST /provider/sandbox/result": "R23: a sandbox's result",
    "POST /provider/cdr": "R24: an outside tool's rebuilt file",
    "POST /provider/reputation": "R25: an address's reputation, by Cloudflare's lookup or a hash prefix",
    "POST /provider/refresh": "R26: a hash-prefix tool's local list refreshed",
    "POST /provider/forward": "R27: a counts record forwarded",
    "POST /provider/test": "R28: a tool's test probe",
    "GET /providers": "R29: the catalogue, offered, refused, held, and the generic transports",
    "anything else": 'R9: 404 {ok: false, code: "UNKNOWN"}'
  },
  containers: [
    {
      class_name: "FileScanner",
      image: {
        repository: "docker.io/civicos/file-scanner-scanner",
        digest: null,
        platform: "linux/amd64",
        port: 8080,
        schedulingPolicy: "default",
        base: {
          repository: "docker.io/library/node",
          digest: "sha256:efd0ab5780c2d9ab1f0f869571a00d5edb17793bff4cce4a2792e3eb0ffc7562"
        },
        packages: "packages-scanner.json"
      },
      instance_type: "standard-1",
      memory: "4 GiB",
      max_instances: 3,
      bind: [
        {
          member: "file-scanner",
          binding: "SCANNER"
        }
      ],
      build: {
        dockerfile: "Dockerfile.scanner",
        context: ".",
        command: "docker build --platform linux/amd64 -f Dockerfile.scanner -t <repository>:<version> file-scanner"
      }
    },
    {
      class_name: "SafeViewRenderer",
      image: {
        repository: "docker.io/civicos/file-scanner-renderer",
        digest: null,
        platform: "linux/amd64",
        port: 8080,
        schedulingPolicy: "default",
        base: {
          repository: "docker.io/library/node",
          digest: "sha256:efd0ab5780c2d9ab1f0f869571a00d5edb17793bff4cce4a2792e3eb0ffc7562"
        },
        packages: "packages-renderer.json"
      },
      instance_type: "standard-1",
      memory: "4 GiB",
      max_instances: 3,
      bind: [
        {
          member: "file-scanner",
          binding: "RENDERER"
        }
      ],
      build: {
        dockerfile: "Dockerfile.renderer",
        context: ".",
        command: "docker build --platform linux/amd64 -f Dockerfile.renderer -t <repository>:<version> file-scanner"
      }
    }
  ],
  bundle: {
    entry: "src/worker.mjs",
    outfile: "dist/file-scanner.bundled.mjs",
    manifest: "dist/file-scanner.bundle.json",
    external: [
      "cloudflare:workers",
      "cloudflare:sockets",
      "node:*"
    ]
  },
  triggers: {
    crons: [
      "17 4 * * *"
    ]
  },
  optional_bindings: [
    {
      binding: "SECURITY_VPC",
      kind: "workers_vpc",
      added_by: 'installer, for a tool whose descriptor states reach "tunnel" (R21 REACH_NOT_BOUND until then)'
    }
  ],
  egress: {
    containers: [],
    worker: "database.clamav.net (R6), and per call only the hosts of the called tool's descriptor for the spec's region, or the spec's own host (R12)"
  },
  note: "The fleet-member marker of a container member with two classes (R10; bundler R24, R25, R27 as T36-2 amended them, K2077). `bundle` is the Worker that answers the plane's FILE_SCANNER service binding (`callers`) and hosts both classes (src/worker.mjs), built by `npm run build` and guarded as every member's bundle is. Each entry of `containers` is one class: its image, named only as repository@digest once the release publishes it (`digest` null until then, as agent-runner's was), its base pinned by digest (as its Dockerfile's FROM), and its package statement (the Debian packages it installs, bundler R27); `bind` is the binding through which the member's own Worker reaches the class. Both containers run with no internet (`egress.containers` empty): the Worker reads every byte from the group's bucket and hands them copies.",
  callers: [
    {
      member: "bio-plane",
      binding: "FILE_SCANNER",
      kind: "service"
    }
  ]
};

// src/limits.mjs
var NAMESPACES = Object.freeze(["bio", "scratch"]);
var PLANE_OPS = Object.freeze([]);
var SCAN_MAX_BYTES = 268435456;
var SCAN_BATCH_MAX = 200;
var SIGNATURES_MAX_AGE_MS = 2592e5;
var SAFE_VIEW_DPI = 150;
var SAFE_VIEW_PAGES_MAX = 500;
var PROVIDER_TIMEOUT_MS = 12e4;
var SANDBOX_TIMEOUT_MS = 36e5;
var REPUTATION_LIST_MAX_AGE_MS = 864e5;
var LOG_COUNT_KINDS = Object.freeze([
  "files_scanned",
  "files_found",
  "holds_placed",
  "holds_released",
  "deeper_checks",
  "sandbox_submissions",
  "safe_views",
  "safe_copies",
  "reputation_listed",
  "signin",
  "credential",
  "rate",
  "handover",
  "through"
]);
var SCAN_TIME_MS = 9e5;
var RENDER_TIME_MS = 6e5;
var MEMBER_LIMITS = Object.freeze({ cpu_ms: 3e5 });
var MEMBER_LIMITS_STATEMENT = "bio-member-limits/1 cpu_ms=300000";
var BOUNDS = Object.freeze({
  SCAN_MAX_BYTES,
  SCAN_BATCH_MAX,
  SIGNATURES_MAX_AGE_MS,
  SAFE_VIEW_DPI,
  SAFE_VIEW_PAGES_MAX,
  PROVIDER_TIMEOUT_MS,
  SANDBOX_TIMEOUT_MS,
  REPUTATION_LIST_MAX_AGE_MS,
  SCAN_TIME_MS,
  RENDER_TIME_MS,
  LOG_COUNT_KINDS
});

// src/store.mjs
import { createHash } from "node:crypto";
var HEX64 = /^[0-9a-f]{64}$/;
var WRITABLE = /^(clamav|reputation)\/[A-Za-z0-9._/-]+$/;
var AREAS = Object.freeze({ captures: "captures", derived: "derived" });
var objectKey = (store, area, sha) => `${store}/${AREAS[area]}/${sha}`;
function normaliseTarget(t) {
  if (!t || typeof t !== "object" || Array.isArray(t) || !HEX64.test(t.capture_sha || "")) return null;
  if (t.area !== void 0 && t.area !== "derived") return null;
  const area = t.area === "derived" ? "derived" : "captures";
  if (t.parts === null || t.parts === void 0) return { capture_sha: t.capture_sha, parts: null, area };
  if (!Array.isArray(t.parts) || t.parts.length === 0) return null;
  for (const p of t.parts) {
    if (!p || typeof p !== "object" || !HEX64.test(p.sha256 || "") || !Number.isSafeInteger(p.bytes) || p.bytes < 0) return null;
  }
  return { capture_sha: t.capture_sha, parts: t.parts.map((p) => ({ sha256: p.sha256, bytes: p.bytes })), area };
}
var knownStore = (s) => typeof s === "string" && NAMESPACES.includes(s);
async function sizeTarget(bucket, store, t, max = SCAN_MAX_BYTES) {
  if (t.parts) {
    const declared = t.parts.reduce((n, p) => n + p.bytes, 0);
    if (declared > max) return { ok: false, reason: "TOO_LARGE" };
    let total = 0;
    for (const p of t.parts) {
      const h2 = await bucket.head(objectKey(store, t.area, p.sha256));
      if (!h2) return { ok: false, reason: "NOT_FOUND" };
      if (h2.size !== p.bytes) return { ok: false, reason: "DIGEST_MISMATCH" };
      total += h2.size;
    }
    return { ok: true, bytes: total };
  }
  const h = await bucket.head(objectKey(store, t.area, t.capture_sha));
  if (!h) return { ok: false, reason: "NOT_FOUND" };
  if (h.size > max) return { ok: false, reason: "TOO_LARGE" };
  return { ok: true, bytes: h.size };
}
function targetStream(bucket, store, t) {
  const keys = t.parts ? t.parts.map((p) => [objectKey(store, t.area, p.sha256), p.sha256]) : [[objectKey(store, t.area, t.capture_sha), null]];
  const whole = createHash("sha256");
  let settle;
  const outcome = new Promise((r) => {
    settle = r;
  });
  let i = 0, reader = null, part = null;
  const fail = (controller, reason) => {
    settle({ ok: false, reason });
    controller.error(new Error(reason));
  };
  const stream = new ReadableStream({
    async pull(controller) {
      try {
        for (; ; ) {
          if (!reader) {
            if (i >= keys.length) {
              if (whole.digest("hex") !== t.capture_sha) return fail(controller, "DIGEST_MISMATCH");
              settle({ ok: true });
              return controller.close();
            }
            const obj = await bucket.get(keys[i][0]);
            if (!obj) return fail(controller, "NOT_FOUND");
            reader = obj.body.getReader();
            part = keys[i][1] ? createHash("sha256") : null;
          }
          const { done, value } = await reader.read();
          if (done) {
            if (part && part.digest("hex") !== keys[i][1]) return fail(controller, "DIGEST_MISMATCH");
            reader = null;
            i++;
            continue;
          }
          const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);
          whole.update(chunk);
          if (part) part.update(chunk);
          controller.enqueue(chunk);
          return;
        }
      } catch (e) {
        return fail(controller, "NOT_FOUND");
      }
    },
    cancel() {
      settle({ ok: false, reason: "CANCELLED" });
      if (reader) reader.cancel().catch(() => {
      });
    }
  });
  return { stream, outcome };
}
async function verifyTarget(bucket, store, t) {
  const { stream, outcome } = targetStream(bucket, store, t);
  const r = stream.getReader();
  try {
    for (; ; ) {
      const { done } = await r.read();
      if (done) break;
    }
  } catch {
  }
  return outcome;
}
async function writeObject(bucket, key, body, options) {
  if (!WRITABLE.test(key) || key.includes("..")) throw new Error(`file-scanner never writes ${key}`);
  return bucket.put(key, body, options);
}
async function deleteObject(bucket, key) {
  if (!WRITABLE.test(key) || key.includes("..")) throw new Error(`file-scanner never deletes ${key}`);
  return bucket.delete(key);
}
async function readJson(bucket, key) {
  const o = await bucket.get(key);
  if (!o) return null;
  try {
    return JSON.parse(await o.text());
  } catch {
    return null;
  }
}

// src/clamav.mjs
var MIRROR_HOST = "database.clamav.net";
var DATABASES = Object.freeze(["main.cvd", "daily.cvd", "bytecode.cvd"]);
var CURRENT = "clamav/current.json";
var STATE = "clamav/state.json";
var runId = (now) => `r${new Date(now).toISOString().replace(/[-:.TZ]/g, "")}${Math.random().toString(36).slice(2, 8)}`;
var reply = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
function signaturesOf(current) {
  if (!current) return null;
  const v = (db) => {
    const f = Object.entries(current.files).find(([n]) => n.split(".")[0] === db);
    return f && Number.isFinite(Number(f[1].version)) ? Number(f[1].version) : null;
  };
  return { main: v("main"), daily: v("daily"), bytecode: v("bytecode"), published: current.published };
}
async function ask(container2, path, init) {
  try {
    const r = await container2(path, init);
    const body = await r.json().catch(() => null);
    return r.ok && body && body.ok ? body : null;
  } catch {
    return null;
  }
}
async function ensureSet(deps, current) {
  const held = await ask(deps.scanner, "/sigs");
  if (!held) return null;
  const version2 = held.clamav_version || "not reported";
  if (held.set === current.set) return version2;
  for (const [name, f] of Object.entries(current.files)) {
    const obj = await deps.bucket.get(f.key);
    if (!obj) return null;
    const put = await ask(deps.scanner, `/sigs/${current.set}/${name}`, { method: "PUT", body: obj.body, duplex: "half" });
    if (!put) return null;
  }
  return await ask(deps.scanner, `/sigs/${current.set}/load`, { method: "POST" }) ? version2 : null;
}
async function scan(deps, body) {
  const started = deps.now();
  if (!body || !knownStore(body.store)) return reply(400, { ok: false, code: "NAMESPACE_UNKNOWN" });
  const targets = body.targets;
  if (!Array.isArray(targets) || targets.length < 1 || targets.length > SCAN_BATCH_MAX) return reply(400, { ok: false, code: "BAD_BATCH" });
  if (!deps.bucket) return reply(503, { ok: false, code: "R2_NOT_CONFIGURED" });
  const store = body.store;
  const current = await readJson(deps.bucket, CURRENT);
  const signatures = signaturesOf(current);
  let engineVersion = "not reported";
  const verdict2 = (capture_sha, fields) => ({
    capture_sha,
    tool: "clamav",
    engine: "clamav",
    engine_version: null,
    signatures,
    scanned_at: new Date(deps.now()).toISOString(),
    findings: [],
    latency_ms: Math.max(0, deps.now() - started),
    ...fields
  });
  const notScanned = (sha, reason) => verdict2(typeof sha === "string" ? sha : null, { result: "not_scanned", reason });
  const shaOf = (t) => t && typeof t === "object" ? t.capture_sha : null;
  const out = new Array(targets.length);
  let setReason = null;
  if (!current) setReason = "SIGNATURES_ABSENT";
  else if (!(Date.parse(current.published) >= deps.now() - SIGNATURES_MAX_AGE_MS)) setReason = "SIGNATURES_STALE";
  else {
    const v = await ensureSet(deps, current);
    if (v) engineVersion = v;
    else setReason = "SCANNER_UNAVAILABLE";
  }
  const job = runId(deps.now());
  const staged = [];
  for (let i = 0; i < targets.length; i++) {
    const t = normaliseTarget(targets[i]);
    if (!t) {
      out[i] = notScanned(shaOf(targets[i]), "BAD_TARGET");
      continue;
    }
    if (setReason) {
      out[i] = notScanned(t.capture_sha, setReason);
      continue;
    }
    const size = await sizeTarget(deps.bucket, store, t);
    if (!size.ok) {
      out[i] = notScanned(t.capture_sha, size.reason);
      continue;
    }
    const { stream, outcome } = targetStream(deps.bucket, store, t);
    const put = await ask(deps.scanner, `/job/${job}/${i}`, { method: "PUT", body: stream, duplex: "half" });
    const o = await Promise.race([outcome, new Promise((res) => setTimeout(() => res({ ok: true, unread: true }), 0))]);
    if (o.unread || !o.ok || !put) {
      await ask(deps.scanner, `/job/${job}/${i}`, { method: "DELETE" });
      out[i] = notScanned(t.capture_sha, o.ok || o.unread ? "SCANNER_UNAVAILABLE" : o.reason);
      continue;
    }
    staged.push([i, t.capture_sha]);
  }
  if (staged.length) {
    const r = await ask(deps.scanner, `/job/${job}/scan?set=${encodeURIComponent(current.set)}`, { method: "POST" });
    if (r) engineVersion = r.engine_version || "not reported";
    for (const [i, sha] of staged) {
      const v = r && r.results[i];
      out[i] = v ? verdict2(sha, { result: v.result, findings: v.findings || [], ...v.detail ? { detail: v.detail } : {} }) : notScanned(sha, "SCANNER_UNAVAILABLE");
    }
  } else {
    await ask(deps.scanner, `/job/${job}`, { method: "DELETE" });
  }
  for (const v of out) v.engine_version = engineVersion;
  return reply(200, { ok: true, verdicts: out });
}
async function putStream(bucket, key, response) {
  const len = Number(response.headers.get("content-length"));
  let body = response.body;
  if (typeof FixedLengthStream === "function" && Number.isSafeInteger(len) && len > 0) {
    const fixed = new FixedLengthStream(len);
    response.body.pipeTo(fixed.writable).catch(() => {
    });
    body = fixed.readable;
  } else if (typeof FixedLengthStream !== "function") {
    body = new Uint8Array(await response.arrayBuffer());
  }
  return writeObject(bucket, key, body);
}
async function runMirror(deps) {
  const now = deps.now();
  const previous = await readJson(deps.bucket, CURRENT);
  const run = runId(now);
  const staged = [];
  const files = {};
  let error = null;
  try {
    for (const db of DATABASES) {
      const prev = previous && previous.files[db];
      const headers = { "user-agent": `file-scanner/${deps.version || "unknown"} (signature mirror; as cvdupdate)` };
      if (prev && prev.last_modified) headers["if-modified-since"] = prev.last_modified;
      let r;
      try {
        r = await deps.fetch(`https://${MIRROR_HOST}/${db}`, { headers });
      } catch {
        throw new Error(`UNREACHABLE:${db}`);
      }
      if (r.status === 304 && prev) {
        files[db] = prev;
        continue;
      }
      if (r.status !== 200 || !r.body) throw new Error(`REFUSED:${db}:${r.status}`);
      const key = `clamav/sets/${run}/${db}`;
      await putStream(deps.bucket, key, r);
      staged.push(key);
      files[db] = { key, last_modified: r.headers.get("last-modified") || null };
    }
    const fresh = Object.entries(files).filter(([, f]) => staged.includes(f.key));
    if (fresh.length) {
      for (const [db, f] of fresh) {
        const obj = await deps.bucket.get(f.key);
        if (!obj || !await ask(deps.scanner, `/verify/${run}/${db}`, { method: "PUT", body: obj.body, duplex: "half" })) {
          throw new Error(`VERIFIER_UNAVAILABLE:${db}`);
        }
      }
      const v = await ask(deps.scanner, `/verify/${run}`, { method: "POST" });
      if (!v) throw new Error("VERIFIER_UNAVAILABLE");
      for (const [db, f] of fresh) {
        const s = v.files[db];
        if (!s || !s.verified) throw new Error(`SIGNATURE_INVALID:${db}`);
        Object.assign(f, { version: s.version, build_time: s.build_time, sigs: s.sigs });
      }
    }
    const published = Object.values(files).map((f) => Date.parse(f.build_time)).filter(Number.isFinite);
    if (!published.length) throw new Error("NO_BUILD_TIME");
    const current = {
      set: fresh.length ? run : previous.set,
      files,
      published: new Date(Math.max(...published)).toISOString(),
      mirrored_at: new Date(now).toISOString()
    };
    await writeObject(deps.bucket, CURRENT, JSON.stringify(current));
    const keep = new Set(Object.values(files).map((f) => f.key));
    for (const f of Object.values(previous && previous.files || {})) if (!keep.has(f.key)) await deleteObject(deps.bucket, f.key);
    await writeObject(deps.bucket, STATE, JSON.stringify({ last_attempt: new Date(now).toISOString(), last_error: null }));
    return { ok: true, versions: signaturesOf(current), published: current.published };
  } catch (e) {
    error = String(e.message || e);
    for (const key of staged) await deleteObject(deps.bucket, key).catch(() => {
    });
    await writeObject(deps.bucket, STATE, JSON.stringify({ last_attempt: new Date(now).toISOString(), last_error: error }));
    const last = previous ? signaturesOf(previous) : null;
    return { ok: false, versions: last, published: previous ? previous.published : null, error };
  }
}
async function mirror(deps) {
  if (!deps.bucket) return reply(503, { ok: false, code: "R2_NOT_CONFIGURED" });
  return reply(200, await runMirror(deps));
}
async function signatureState(bucket) {
  const current = bucket ? await readJson(bucket, CURRENT) : null;
  const state = bucket ? await readJson(bucket, STATE) : null;
  return {
    versions: signaturesOf(current),
    published: current ? current.published : null,
    mirrored_at: current ? current.mirrored_at : null,
    last_attempt: state ? state.last_attempt : null,
    last_error: state ? state.last_error : null
  };
}

// src/render.mjs
var STATUS = { NOT_FOUND: 404, DIGEST_MISMATCH: 409, TOO_LARGE: 413 };
var refuse = (status, code, extra = {}) => new Response(
  JSON.stringify({ ok: false, code, ...extra }),
  { status, headers: { "content-type": "application/json" } }
);
var KNOWN = /* @__PURE__ */ new Set(["ENCRYPTED", "NOT_RENDERABLE", "TIME_LIMIT", "RENDER_FAILED"]);
var PASSED = ["content-type", "x-derived-sha256", "x-pages", "x-source-pages", "x-truncated"];
async function checkOne(deps, body) {
  if (!body || !knownStore(body.store)) return { refusal: refuse(400, "NAMESPACE_UNKNOWN") };
  const t = normaliseTarget(body.target);
  if (!t) return { refusal: refuse(400, "BAD_TARGET") };
  if (!deps.bucket) return { refusal: refuse(503, "R2_NOT_CONFIGURED") };
  return { t, store: body.store };
}
async function render(deps, body) {
  const c = await checkOne(deps, body);
  if (c.refusal) return c.refusal;
  if (body.route !== "pdf" && body.route !== "office") return refuse(400, "NOT_RENDERABLE");
  const size = await sizeTarget(deps.bucket, c.store, c.t);
  if (!size.ok) return refuse(STATUS[size.reason], size.reason);
  const { stream, outcome } = targetStream(deps.bucket, c.store, c.t);
  let r;
  try {
    r = await deps.renderer(
      `/render?route=${body.route}&dpi=${SAFE_VIEW_DPI}&max=${SAFE_VIEW_PAGES_MAX}`,
      { method: "POST", body: stream, duplex: "half" }
    );
  } catch {
    r = null;
  }
  const PENDING = {};
  let o = await Promise.race([outcome, new Promise((res) => setTimeout(() => res(PENDING), 0))]);
  if (o === PENDING) {
    if (r && r.status === 200) {
      await r.body?.cancel().catch(() => {
      });
      r = null;
    }
    o = { ok: true };
  }
  if (!o.ok) return refuse(STATUS[o.reason] || 409, o.reason in STATUS ? o.reason : "DIGEST_MISMATCH");
  if (!r) return refuse(503, "RENDER_FAILED", { message: "the renderer could not be reached" });
  if (r.status !== 200) {
    const e = await r.json().catch(() => ({}));
    const code = KNOWN.has(e.code) ? e.code : "RENDER_FAILED";
    const message = code === "RENDER_FAILED" ? String(e.message || `the renderer answered ${r.status}`).slice(0, 300) : void 0;
    return refuse(code === "TIME_LIMIT" ? 504 : code === "RENDER_FAILED" ? 500 : 422, code, message ? { message } : {});
  }
  const headers = new Headers();
  for (const h of PASSED) if (r.headers.get(h) !== null) headers.set(h, r.headers.get(h));
  return new Response(r.body, { status: 200, headers });
}

// src/providers/descriptor.mjs
var KINDS = Object.freeze(["scan", "cdr", "sandbox", "url_reputation", "log_sink"]);
var TRANSPORTS = Object.freeze(["https", "icap", "syslog_tls", "azure_blob"]);
var SAMPLE_SHARING = Object.freeze(["none", "vendor_internal_research", "third_parties", "public", "not stated"]);
var SENDS = Object.freeze(["file_bytes", "url", "hostname", "hash_prefix", "counts"]);
var NEVER_SENDS_REQUIRED = Object.freeze(["file_name", "member_identity", "ip_address"]);
var NOT_STATED = "not stated";
var HANDLING_FIELDS = [
  "sends",
  "never_sends",
  "recipient",
  "sub_processors",
  "region",
  "file_retention",
  "result_retention",
  "sample_sharing"
];
var FIELDS = [
  "provider_id",
  "vendor",
  "product",
  "kinds",
  "transport",
  "reach",
  "hosts",
  "engine_family",
  "credentials",
  "config",
  "test_probe",
  "handling",
  "mode_required",
  "mode_check",
  "licence_note",
  "source_urls",
  "read_on"
];
var OWN = ["max_bytes", "template", "host_from_spec", "per_engine"];
var PROBES = ["eicar", "macro_document", "test_address", "zero_counts"];
var CLOUDFLARE = /^cloudflare\b/i;
var str = (v) => typeof v === "string" && v.length > 0;
var strList = (v, nonEmpty) => Array.isArray(v) && (!nonEmpty || v.length > 0) && v.every(str);
var stated = (v, check) => v === NOT_STATED || check(v);
var hostName = (h) => str(h) && /^(\*\.)?[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(h);
var CONFIG_NAME = /^[a-z][a-z0-9_]*$/;
function configList(v) {
  if (!Array.isArray(v)) return false;
  const names2 = /* @__PURE__ */ new Set();
  for (const f of v) {
    if (!f || typeof f !== "object" || Array.isArray(f)) return false;
    if (Object.keys(f).length !== 3 || !CONFIG_NAME.test(f.name || "") || !str(f.label) || typeof f.required !== "boolean") return false;
    if (names2.has(f.name)) return false;
    names2.add(f.name);
  }
  return true;
}
function malformed(d) {
  if (!d || typeof d !== "object" || Array.isArray(d)) return "descriptor";
  for (const k of Object.keys(d)) if (!FIELDS.includes(k) && !OWN.includes(k)) return k;
  for (const k of FIELDS) if (!(k in d)) return k;
  if (!str(d.provider_id) || !/^[a-z0-9][a-z0-9-]*$/.test(d.provider_id)) return "provider_id";
  if (!str(d.vendor)) return "vendor";
  if (!str(d.product)) return "product";
  if (!strList(d.kinds, true) || !d.kinds.every((k) => KINDS.includes(k)) || new Set(d.kinds).size !== d.kinds.length) return "kinds";
  if (!TRANSPORTS.includes(d.transport)) return "transport";
  if (d.reach !== "public" && d.reach !== "tunnel") return "reach";
  const own = d.template === true || d.host_from_spec === true;
  if (Array.isArray(d.hosts)) {
    if (!d.hosts.every(hostName) || !own && d.hosts.length === 0) return "hosts";
  } else if (d.hosts && typeof d.hosts === "object") {
    const lists = Object.entries(d.hosts);
    if (!lists.length || !lists.every(([r, l]) => str(r) && Array.isArray(l) && l.every(hostName))) return "hosts";
  } else return "hosts";
  if (!strList(d.engine_family, true)) return "engine_family";
  if (!strList(d.credentials, false)) return "credentials";
  if (!configList(d.config)) return "config";
  if (!d.test_probe || !PROBES.includes(d.test_probe.kind) || d.test_probe.kind === "test_address" && !str(d.test_probe.address)) return "test_probe";
  const h = d.handling;
  if (!h || typeof h !== "object" || Array.isArray(h)) return "handling";
  for (const k of Object.keys(h)) if (!HANDLING_FIELDS.includes(k)) return `handling.${k}`;
  if (!stated(h.sends, (v) => strList(v, true) && v.every((s) => SENDS.includes(s)))) return "handling.sends";
  if (!stated(h.never_sends, (v) => strList(v, false))) return "handling.never_sends";
  for (const k of ["recipient", "region", "file_retention", "result_retention"]) if (!str(h[k])) return `handling.${k}`;
  if (!stated(h.sub_processors, (v) => strList(v, false))) return "handling.sub_processors";
  if (!SAMPLE_SHARING.includes(h.sample_sharing)) return "handling.sample_sharing";
  if (d.mode_required !== null && !(d.mode_required && typeof d.mode_required === "object" && str(d.mode_required.description) && d.mode_required.params && typeof d.mode_required.params === "object")) return "mode_required";
  if (d.mode_check !== null && !str(d.mode_check)) return "mode_check";
  if (!str(d.licence_note)) return "licence_note";
  if (!strList(d.source_urls, !own) || !d.source_urls.every((u) => /^https:\/\//.test(u))) return "source_urls";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.read_on || "")) return "read_on";
  if (d.max_bytes !== void 0 && !(Number.isSafeInteger(d.max_bytes) && d.max_bytes > 0)) return "max_bytes";
  for (const k of ["template", "host_from_spec", "per_engine"]) if (d[k] !== void 0 && d[k] !== true) return k;
  return null;
}
function validateDescriptor(d) {
  try {
    const field2 = malformed(d);
    if (field2) return { ok: false, code: "DESCRIPTOR_MALFORMED", field: field2 };
    const h = d.handling;
    if (h.sample_sharing === "third_parties" || h.sample_sharing === "public") return { ok: false, code: "PROVIDER_SHARES_SAMPLES" };
    if (h.sample_sharing === NOT_STATED) return { ok: false, code: "HANDLING_NOT_STATED" };
    if (h.never_sends === NOT_STATED || !NEVER_SENDS_REQUIRED.every((x) => h.never_sends.includes(x))) {
      return { ok: false, code: "NEVER_SENDS_INCOMPLETE" };
    }
    if (d.kinds.includes("url_reputation") && Array.isArray(h.sends) && (h.sends.includes("url") || h.sends.includes("hostname")) && !CLOUDFLARE.test(h.recipient)) {
      return { ok: false, code: "ADDRESS_WOULD_LEAVE" };
    }
    if (d.mode_required && !d.mode_check) return { ok: false, code: "PRIVATE_MODE_UNVERIFIABLE" };
    return { ok: true };
  } catch {
    return { ok: false, code: "DESCRIPTOR_MALFORMED", field: "descriptor" };
  }
}
function normaliseFamily(list) {
  const out = [...new Set((list || []).map((n) => String(n).trim().toLowerCase()).filter(Boolean))];
  if (out.some((n) => /clam/.test(n)) && !out.includes("clamav")) out.push("clamav");
  return out;
}

// src/providers/catalogue.mjs
var READ_ON = "2026-10-07";
var NEVER = Object.freeze(["file_name", "member_identity", "ip_address"]);
var ADMIN = "stated by the administrator";
var descriptor = (d) => Object.freeze({
  mode_required: null,
  mode_check: null,
  credentials: [],
  read_on: READ_ON,
  ...d,
  config: Object.freeze((d.config || []).map((f) => Object.freeze({ ...f }))),
  handling: Object.freeze({ never_sends: NEVER, sub_processors: [], ...d.handling })
});
var field = (name, label, required) => ({ name, label, required });
var TEMPLATE_CONFIG = (familyRequired) => [
  field("engine_family", "The engines the tool runs, as its maker names them", familyRequired),
  field("handling", "The tool's statement of what it receives, keeps and shares", true),
  field("source_urls", "Where that statement is published", false)
];
var AZURE_TENANT = field("tenant_id", "Microsoft Entra tenant ID", true);
var METADEFENDER_ENGINES = [
  "ahnlab",
  "antiy",
  "avira",
  "bitdefender",
  "bkav",
  "clamav",
  "comodo",
  "crowdstrike",
  "cyren",
  "emsisoft",
  "eset",
  "filseclab",
  "fortinet",
  "huorong",
  "ikarus",
  "jiangmin",
  "k7",
  "mcafee",
  "microsoft",
  "nanoav",
  "quickheal",
  "sophos",
  "tachyon",
  "trendmicro",
  "varist",
  "vir.it",
  "xvirus",
  "zillya",
  "metadefender-unlisted"
];
var MD_PRIVATE = Object.freeze({
  params: Object.freeze({ samplesharing: "0", privateprocessing: "1" }),
  description: "private mode: samplesharing 0 and private processing on every call (paid licence only)"
});
var MD_CHECK = "GET /v4/apikey/ before each send: the key's licence is paid and private processing is on";
var MD_URLS = [
  "https://www.opswat.com/docs/mdcloud/operation/private-scanning-with-metadefender-cloud-apis",
  "https://www.opswat.com/docs/mdcloud/metadefender-cloud-api-v4",
  "https://www.opswat.com/legal/terms-of-service"
];
var INTELIX = {
  vendor: "Sophos Ltd",
  product: "SophosLabs Intelix",
  transport: "https",
  reach: "public",
  hosts: {
    us: ["us.api.labs.sophos.com", "api.labs.sophos.com"],
    de: ["de.api.labs.sophos.com", "api.labs.sophos.com"],
    au: ["au.api.labs.sophos.com", "api.labs.sophos.com"]
  },
  engine_family: ["sophos"],
  credentials: ["client_id", "client_secret"],
  handling: {
    sends: ["file_bytes"],
    recipient: "Sophos Ltd",
    sub_processors: [],
    region: "the region chosen; dynamic analysis traffic may be routed to another region; malicious files to the SophosLabs Hub (UK)",
    file_retention: "clean files up to 30 days; malicious files retained indefinitely in the SophosLabs Hub (UK)",
    result_retention: "metadata up to 6 months for research",
    sample_sharing: "vendor_internal_research"
  },
  licence_note: "the organization's own Intelix account (free monthly allowance, then pay as you go)",
  source_urls: ["https://www.sophos.com/en-us/legal/product-privacy-information/sophoslabs-intelix"]
};
var PROVIDERS = Object.freeze([
  // ── scan
  descriptor({
    provider_id: "scanii",
    vendor: "Uva Software, LLC",
    product: "Scanii",
    kinds: ["scan"],
    transport: "https",
    reach: "public",
    max_bytes: 2147483648,
    hosts: {
      us1: ["api-us1.scanii.com"],
      eu1: ["api-eu1.scanii.com"],
      eu2: ["api-eu2.scanii.com"],
      ap1: ["api-ap1.scanii.com"],
      ap2: ["api-ap2.scanii.com"],
      ca1: ["api-ca1.scanii.com"]
    },
    // Its own engine with Sophos as the second (N705 §2.1); one family with Sophos Intelix (K1946 T7).
    engine_family: ["scanii", "sophos"],
    credentials: ["api_key", "api_secret"],
    test_probe: { kind: "eicar" },
    handling: {
      sends: ["file_bytes"],
      recipient: "Uva Software, LLC",
      sub_processors: ["Amazon Web Services"],
      region: "chosen by the group: US1, EU1, EU2, AP1, AP2 or CA1; content never leaves it",
      file_retention: "deleted on completion of analysis",
      result_retention: "up to 400 days in the processing region",
      sample_sharing: "none"
    },
    licence_note: "the group's own key; terms allow use within its own products made available to its clients",
    source_urls: [
      "https://docs.scanii.com/article/142-privacy-policy",
      "https://docs.scanii.com/article/143-terms-of-service",
      "https://docs.scanii.com/article/144-version-2-0-resources"
    ]
  }),
  descriptor({
    provider_id: "metadefender-cloud",
    vendor: "OPSWAT, Inc.",
    product: "MetaDefender Cloud (private mode)",
    kinds: ["scan"],
    transport: "https",
    reach: "public",
    hosts: ["api.metadefender.com"],
    max_bytes: 146800640,
    per_engine: true,
    engine_family: METADEFENDER_ENGINES,
    credentials: ["api_key"],
    test_probe: { kind: "eicar" },
    mode_required: MD_PRIVATE,
    mode_check: MD_CHECK,
    handling: {
      sends: ["file_bytes"],
      recipient: "OPSWAT, Inc.",
      sub_processors: "not stated",
      region: "not stated",
      file_retention: "private mode: not stored or shared; permanently removed from storage",
      result_retention: "scan results remain in the MetaDefender Cloud database, limited to the submitter",
      sample_sharing: "none"
    },
    licence_note: `the organization's own paid licence; "solely for Your internal use" (OPSWAT's written yes needed for product use)`,
    source_urls: MD_URLS
  }),
  descriptor({
    provider_id: "metadefender-core",
    vendor: "OPSWAT, Inc.",
    product: "MetaDefender Core",
    kinds: ["scan"],
    transport: "https",
    reach: "tunnel",
    hosts: [],
    host_from_spec: true,
    per_engine: true,
    engine_family: METADEFENDER_ENGINES,
    credentials: ["api_key"],
    test_probe: { kind: "eicar" },
    handling: {
      sends: ["file_bytes"],
      recipient: "the organization's own MetaDefender Core server",
      region: "the organization's own servers",
      file_retention: "as the organization configures its server",
      result_retention: "as the organization configures its server",
      sample_sharing: "none"
    },
    licence_note: "the organization's own licence",
    source_urls: ["https://www.opswat.com/docs/mdcore/metadefender-core"]
  }),
  descriptor({
    provider_id: "icap",
    vendor: ADMIN,
    product: "any ICAP server (RFC 3507)",
    kinds: ["scan"],
    transport: "icap",
    reach: "public",
    hosts: [],
    template: true,
    engine_family: [ADMIN],
    test_probe: { kind: "eicar" },
    config: [
      ...TEMPLATE_CONFIG(true),
      field("service", "ICAP service name (default avscan)", false),
      field("tls", "Connect over TLS (port 11344 unless the address names one)", false)
    ],
    handling: {
      sends: ["file_bytes"],
      recipient: ADMIN,
      region: ADMIN,
      file_retention: ADMIN,
      result_retention: ADMIN,
      sample_sharing: "none"
    },
    licence_note: "the organization's own server and licence",
    source_urls: []
  }),
  descriptor({
    provider_id: "defender-storage",
    vendor: "Microsoft Corporation",
    product: "Microsoft Defender for Storage",
    kinds: ["scan"],
    transport: "azure_blob",
    reach: "public",
    max_bytes: 2147483648,
    hosts: ["*.blob.core.windows.net", "login.microsoftonline.com"],
    engine_family: ["microsoft-defender"],
    credentials: ["client_id", "client_secret"],
    test_probe: { kind: "eicar" },
    config: [
      AZURE_TENANT,
      field("storage_account", "Azure storage account name", true),
      field("container", "Blob container the files are scanned in", true)
    ],
    handling: {
      sends: ["file_bytes"],
      recipient: "Microsoft (the organization's own Azure storage account)",
      region: "the storage account's region; content read within it",
      file_retention: "the service does not retain the scanned content; this adapter deletes the blob after the result",
      result_retention: "the blob's index tag, deleted with it; alerts as the organization's Defender for Cloud keeps them",
      sample_sharing: "none"
    },
    licence_note: "the organization's own Azure subscription, billed per GB scanned",
    source_urls: ["https://learn.microsoft.com/en-us/azure/defender-for-cloud/on-upload-malware-scanning"]
  }),
  descriptor({
    provider_id: "sophos-intelix",
    ...INTELIX,
    kinds: ["scan", "sandbox"],
    max_bytes: 33554432,
    test_probe: { kind: "eicar" }
  }),
  // ── cdr
  descriptor({
    provider_id: "opswat-deep-cdr",
    vendor: "OPSWAT, Inc.",
    product: "Deep CDR (MetaDefender Cloud or Core)",
    kinds: ["cdr"],
    transport: "https",
    reach: "public",
    hosts: { cloud: ["api.metadefender.com"], core: [] },
    max_bytes: 146800640,
    engine_family: ["opswat-deep-cdr"],
    credentials: ["api_key"],
    test_probe: { kind: "macro_document" },
    mode_required: MD_PRIVATE,
    mode_check: MD_CHECK,
    handling: {
      sends: ["file_bytes"],
      recipient: "OPSWAT, Inc. (Cloud), or the organization's own Core server",
      sub_processors: "not stated",
      region: "not stated (Cloud); the organization's own servers (Core)",
      file_retention: "Cloud: not stored in private mode; the sanitized copy deleted after 24 hours",
      result_retention: "Cloud: scan results remain, limited to the submitter",
      sample_sharing: "none"
    },
    licence_note: "the organization's own licence",
    source_urls: [
      "https://www.opswat.com/docs/mdcloud/operation/data-sanitization-on-metadefender-cloud",
      "https://www.opswat.com/docs/mdcore/metadefender-core"
    ]
  }),
  descriptor({
    provider_id: "glasswall-halo",
    vendor: "Glasswall Solutions Ltd",
    product: "Glasswall Halo",
    kinds: ["cdr"],
    transport: "https",
    reach: "public",
    hosts: [],
    host_from_spec: true,
    max_bytes: 1073741824,
    engine_family: ["glasswall"],
    credentials: ["api_token"],
    test_probe: { kind: "macro_document" },
    handling: {
      sends: ["file_bytes"],
      recipient: "the Glasswall Halo deployment the organization runs or subscribes to",
      region: "where that deployment runs",
      file_retention: "removed according to the deployment's file retention policy",
      result_retention: "the analysis report, as the deployment keeps it",
      sample_sharing: "none"
    },
    licence_note: "an entitlement to a number of files or a volume a day",
    source_urls: ["https://docs.glasswall.com/rest-api/about-glasswall-apis", "https://docs.glasswall.com/halo/2.18.1/glasswall-halo-faqs"]
  }),
  // ── sandbox
  descriptor({
    provider_id: "joe-sandbox",
    vendor: "Joe Security LLC",
    product: "Joe Sandbox Cloud (Light and above)",
    kinds: ["sandbox"],
    transport: "https",
    reach: "public",
    hosts: ["jbxcloud.joesecurity.org"],
    max_bytes: 104857600,
    engine_family: ["joe-sandbox"],
    credentials: ["api_key"],
    test_probe: { kind: "eicar" },
    mode_required: Object.freeze({
      params: Object.freeze({ "accept-tac": "1" }),
      description: "an edition of Light or above, whose analyses and results are private"
    }),
    mode_check: "POST /api/v2/account/info before each send: the account is not of the Basic edition",
    handling: {
      sends: ["file_bytes"],
      recipient: "Joe Security LLC",
      region: "not stated",
      file_retention: "kept until the customer deletes it; then securely deleted in near real time",
      result_retention: "kept until the customer deletes it",
      sample_sharing: "none"
    },
    licence_note: "the organization's own Light, Pro or Enterprise subscription",
    source_urls: ["https://joesecurity.org/joe-sandbox-cloud", "https://www.joesandbox.com/pdpp"]
  }),
  descriptor({
    provider_id: "vmray",
    vendor: "VMRay GmbH",
    product: "VMRay Analyzer (cloud)",
    kinds: ["sandbox"],
    transport: "https",
    reach: "public",
    hosts: { us: ["cloud.vmray.com"], de: ["eu.cloud.vmray.com"] },
    max_bytes: 104857600,
    engine_family: ["vmray"],
    credentials: ["api_key"],
    test_probe: { kind: "eicar" },
    handling: {
      sends: ["file_bytes"],
      recipient: "VMRay GmbH",
      region: "US or Germany, as the account is hosted",
      file_retention: "not stated beyond the account",
      result_retention: "kept in the account",
      sample_sharing: "none"
    },
    licence_note: "the organization's own subscription",
    source_urls: ["https://www.vmray.com/?p=3550"]
  }),
  descriptor({
    provider_id: "falcon-sandbox",
    vendor: "CrowdStrike, Inc.",
    product: "Falcon Sandbox (Falcon Intelligence)",
    kinds: ["sandbox"],
    transport: "https",
    reach: "public",
    max_bytes: 104857600,
    hosts: { "us-1": ["api.crowdstrike.com"], "us-2": ["api.us-2.crowdstrike.com"], "eu-1": ["api.eu-1.crowdstrike.com"] },
    engine_family: ["crowdstrike"],
    credentials: ["client_id", "client_secret"],
    test_probe: { kind: "eicar" },
    config: [field("environment_id", "Sandbox environment ID (default 160, Windows 10 64-bit)", false)],
    mode_required: Object.freeze({
      params: Object.freeze({ is_confidential: "true" }),
      description: "community access off: every upload confidential"
    }),
    mode_check: "GET /falconx/entities/settings/v1 before each send: community access is off for the API client",
    handling: {
      sends: ["file_bytes"],
      recipient: "CrowdStrike, Inc.",
      region: "the Falcon cloud chosen",
      file_retention: "stored in the Falcon platform; period not stated",
      result_retention: "kept in the Falcon platform",
      sample_sharing: "none"
    },
    licence_note: "with the organization's Falcon subscription",
    source_urls: ["https://developer.crowdstrike.com/api-reference/collections/falconx-sandbox/"]
  }),
  descriptor({
    provider_id: "wildfire",
    vendor: "Palo Alto Networks, Inc.",
    product: "WildFire (standalone API)",
    kinds: ["sandbox"],
    transport: "https",
    reach: "public",
    max_bytes: 104857600,
    hosts: {
      global: ["wildfire.paloaltonetworks.com"],
      eu: ["eu.wildfire.paloaltonetworks.com"],
      jp: ["jp.wildfire.paloaltonetworks.com"],
      sg: ["sg.wildfire.paloaltonetworks.com"],
      uk: ["uk.wildfire.paloaltonetworks.com"],
      ca: ["ca.wildfire.paloaltonetworks.com"],
      au: ["au.wildfire.paloaltonetworks.com"]
    },
    engine_family: ["wildfire"],
    credentials: ["api_key"],
    test_probe: { kind: "eicar" },
    handling: {
      sends: ["file_bytes"],
      recipient: "Palo Alto Networks, Inc.",
      region: "the regional cloud chosen; some metadata shared across regional clouds",
      file_retention: "benign 14 days; malicious 10 years",
      result_retention: "signatures and reports kept indefinitely",
      sample_sharing: "vendor_internal_research"
    },
    licence_note: "the organization's own WildFire API subscription (150 submissions a day base)",
    source_urls: [
      "https://docs.paloaltonetworks.com/wildfire/u-v/wildfire-whats-new/latest-wildfire-cloud-features/standalone-wildfire-api-subscription",
      "https://docs.paloaltonetworks.com/wildfire/u-v/wildfire-whats-new/latest-wildfire-cloud-features/updated-wildfire-retention-period"
    ]
  }),
  // ── url_reputation
  descriptor({
    provider_id: "cloudflare-intel",
    vendor: "Cloudflare, Inc.",
    product: "Cloudflare URL intelligence",
    kinds: ["url_reputation"],
    transport: "https",
    reach: "public",
    hosts: ["api.cloudflare.com"],
    engine_family: ["cloudflare-intel"],
    credentials: ["api_token"],
    config: [field("account_id", "Cloudflare account ID", true)],
    test_probe: { kind: "test_address", address: "https://malware.testcategory.com/" },
    handling: {
      sends: ["url"],
      recipient: "Cloudflare, Inc. (the group's own account)",
      region: "Cloudflare's network",
      file_retention: "no file is sent",
      result_retention: "not stated",
      sample_sharing: "none"
    },
    licence_note: "the group's own Cloudflare account, a token with Intel Read",
    source_urls: ["https://developers.cloudflare.com/api/resources/intel/subresources/urls/methods/get"]
  }),
  descriptor({
    provider_id: "google-web-risk",
    vendor: "Google LLC",
    product: "Web Risk (Update API)",
    kinds: ["url_reputation"],
    transport: "https",
    reach: "public",
    hosts: ["webrisk.googleapis.com"],
    engine_family: ["google-web-risk"],
    credentials: ["api_key"],
    test_probe: { kind: "test_address", address: "http://testsafebrowsing.appspot.com/s/malware.html" },
    handling: {
      sends: ["hash_prefix"],
      recipient: "Google LLC",
      region: "not stated",
      file_retention: "no file is sent; the server sees only a hash prefix on a local match",
      result_retention: "not stated",
      sample_sharing: "none"
    },
    licence_note: "the organization's own Google Cloud project; results must not be redistributed",
    source_urls: ["https://docs.cloud.google.com/web-risk/docs/overview", "https://cloud.google.com/web-risk/pricing"]
  }),
  // ── log_sink
  descriptor({
    provider_id: "splunk-hec",
    vendor: "Splunk LLC",
    product: "Splunk HTTP Event Collector",
    kinds: ["log_sink"],
    transport: "https",
    reach: "public",
    hosts: [],
    host_from_spec: true,
    engine_family: ["splunk-hec"],
    credentials: ["hec_token"],
    test_probe: { kind: "zero_counts" },
    handling: {
      sends: ["counts"],
      recipient: "the organization's own Splunk",
      region: "where it runs",
      file_retention: "no file is sent",
      result_retention: "as the organization keeps its logs",
      sample_sharing: "none"
    },
    licence_note: "the organization's own Splunk",
    source_urls: ["https://help.splunk.com/en/splunk-enterprise/get-data-in/collect-http-event-data/use-curl-to-manage-http-event-collector-tokens-events-and-services"]
  }),
  descriptor({
    provider_id: "sentinel",
    vendor: "Microsoft Corporation",
    product: "Microsoft Sentinel (Logs Ingestion API)",
    kinds: ["log_sink"],
    transport: "https",
    reach: "public",
    hosts: ["*.ingest.monitor.azure.com", "login.microsoftonline.com"],
    engine_family: ["sentinel"],
    credentials: ["client_id", "client_secret"],
    test_probe: { kind: "zero_counts" },
    config: [
      AZURE_TENANT,
      field("endpoint", "Data collection endpoint host", true),
      field("dcr_id", "Data collection rule immutable ID", true),
      field("stream", "Stream name in the rule", true)
    ],
    handling: {
      sends: ["counts"],
      recipient: "Microsoft (the organization's own workspace)",
      region: "the workspace's region",
      file_retention: "no file is sent",
      result_retention: "as the workspace keeps its logs",
      sample_sharing: "none"
    },
    licence_note: "the organization's own Azure workspace",
    source_urls: ["https://learn.microsoft.com/en-us/azure/azure-monitor/logs/logs-ingestion-api-overview"]
  }),
  descriptor({
    provider_id: "google-secops",
    vendor: "Google LLC",
    product: "Google Security Operations (ImportLogs)",
    kinds: ["log_sink"],
    transport: "https",
    reach: "public",
    hosts: {
      us: ["us-chronicle.googleapis.com", "oauth2.googleapis.com"],
      europe: ["europe-chronicle.googleapis.com", "oauth2.googleapis.com"],
      "asia-southeast1": ["asia-southeast1-chronicle.googleapis.com", "oauth2.googleapis.com"]
    },
    engine_family: ["google-secops"],
    credentials: ["service_account_key"],
    test_probe: { kind: "zero_counts" },
    config: [
      field("project", "Google Cloud project ID", true),
      field("location", "Instance location", true),
      field("instance", "Instance (customer) ID", true),
      field("log_type", "Log type the counts are imported as", true)
    ],
    handling: {
      sends: ["counts"],
      recipient: "Google LLC (the organization's own instance)",
      region: "the instance's region",
      file_retention: "no file is sent",
      result_retention: "as the instance keeps its logs",
      sample_sharing: "none"
    },
    licence_note: "the organization's own instance",
    source_urls: ["https://docs.cloud.google.com/chronicle/docs/reference/ingestion-methods"]
  }),
  descriptor({
    provider_id: "elastic",
    vendor: "Elasticsearch B.V.",
    product: "Elastic (_bulk API)",
    kinds: ["log_sink"],
    transport: "https",
    reach: "public",
    hosts: [],
    host_from_spec: true,
    engine_family: ["elastic"],
    credentials: ["api_key"],
    test_probe: { kind: "zero_counts" },
    config: [field("index", "Index the counts are written to (default civicsmith-security-counts)", false)],
    handling: {
      sends: ["counts"],
      recipient: "the organization's own Elastic deployment",
      region: "where it runs",
      file_retention: "no file is sent",
      result_retention: "as the organization keeps its logs",
      sample_sharing: "none"
    },
    licence_note: "the organization's own deployment",
    source_urls: ["https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-bulk"]
  }),
  descriptor({
    provider_id: "syslog-tls",
    vendor: ADMIN,
    product: "any syslog collector (RFC 5424 over TLS)",
    kinds: ["log_sink"],
    transport: "syslog_tls",
    reach: "public",
    hosts: [],
    template: true,
    engine_family: ["syslog"],
    test_probe: { kind: "zero_counts" },
    config: TEMPLATE_CONFIG(false),
    handling: {
      sends: ["counts"],
      recipient: ADMIN,
      region: ADMIN,
      file_retention: "no file is sent",
      result_retention: ADMIN,
      sample_sharing: "none"
    },
    licence_note: "the organization's own collector",
    source_urls: []
  }),
  descriptor({
    provider_id: "https-webhook",
    vendor: ADMIN,
    product: "any HTTPS endpoint taking a JSON POST",
    kinds: ["log_sink"],
    transport: "https",
    reach: "public",
    hosts: [],
    template: true,
    engine_family: ["webhook"],
    credentials: ["token"],
    test_probe: { kind: "zero_counts" },
    config: [...TEMPLATE_CONFIG(false), field("path", "Path on the endpoint (default /)", false)],
    handling: {
      sends: ["counts"],
      recipient: ADMIN,
      region: ADMIN,
      file_retention: "no file is sent",
      result_retention: ADMIN,
      sample_sharing: "none"
    },
    licence_note: "the organization's own endpoint",
    source_urls: []
  })
]);
var REFUSED_PROVIDERS = Object.freeze([
  ["virustotal-upload", "PROVIDER_SHARES_SAMPLES"],
  ["jotti", "PROVIDER_SHARES_SAMPLES"],
  ["hybrid-analysis", "PROVIDER_SHARES_SAMPLES"],
  ["joe-sandbox-basic", "PROVIDER_SHARES_SAMPLES"],
  ["urlscan-io", "PROVIDER_SHARES_SAMPLES"],
  ["any-run", "NOT_OFFERED"],
  ["virustotal-url-submit", "ADDRESS_WOULD_LEAVE"],
  ["google-web-risk-lookup", "ADDRESS_WOULD_LEAVE"],
  ["sophos-intelix-url", "ADDRESS_WOULD_LEAVE"],
  ["metadefender-url", "ADDRESS_WOULD_LEAVE"],
  ["cloudflare-url-scanner", "NOT_OFFERED"],
  ["cloudflare-logpush", "NOT_OFFERED"]
].map(([provider_id, reason]) => Object.freeze({ provider_id, reason })));
var HELD_PROVIDERS = Object.freeze(["trend-vision-one", "votiro", "checkpoint-threat-extraction"].map((provider_id) => Object.freeze({ provider_id, missing: "HANDLING_NOT_STATED" })));
var GENERIC = Object.freeze(PROVIDERS.filter((d) => d.template).map((d) => d.provider_id));
var CATALOGUE_READ_ON = READ_ON;
var BY_ID = new Map(PROVIDERS.map((d) => [d.provider_id, d]));
var providerById = (id) => BY_ID.get(id) || null;
function resolveDescriptor(d, spec) {
  if (!d.template) return { ok: true, descriptor: d };
  const config = spec && spec.config || {};
  const host = spec && spec.host;
  const family = (v2) => Array.isArray(v2) ? normaliseFamily(v2) : v2;
  const resolved = {
    ...d,
    template: void 0,
    hosts: host ? [String(host).split(":")[0]] : [],
    engine_family: d.kinds.includes("scan") ? family(config.engine_family) : family(config.engine_family || d.engine_family),
    handling: { ...d.handling, ...config.handling || {} },
    source_urls: config.source_urls || []
  };
  delete resolved.template;
  resolved.host_from_spec = true;
  const v = validateDescriptor(resolved);
  return v.ok ? { ok: true, descriptor: Object.freeze(resolved) } : v;
}
for (const d of PROVIDERS) {
  const v = validateDescriptor(d);
  if (!v.ok) throw new Error(`catalogue: ${d.provider_id} fails R19 (${v.code}${v.field ? ` ${v.field}` : ""})`);
}

// src/providers/net.mjs
var ToolError = class extends Error {
  constructor(code, extra = {}) {
    super(code);
    this.code = code;
    Object.assign(this, extra);
  }
};
function hostAllowed(host, allowed) {
  const h = String(host || "").toLowerCase();
  return allowed.some((a) => a.startsWith("*.") ? h.endsWith(a.slice(1)) && h.length > a.length - 1 : h === a);
}
function callHosts(d, spec) {
  if (d.host_from_spec || d.template) return spec.host ? [hostPart(spec.host)] : [];
  if (Array.isArray(d.hosts)) return d.hosts;
  const list = d.hosts[spec.region];
  if (list && list.length === 0) return spec.host ? [hostPart(spec.host)] : [];
  return list || [];
}
var hostPart = (h) => String(h).replace(/^[a-z]+:\/\//i, "").split("/")[0].replace(/:\d+$/, "").toLowerCase();
var portPart = (h, fallback) => {
  const m = /:(\d+)(?:\/|$)/.exec(String(h).replace(/^[a-z]+:\/\//i, ""));
  return m ? Number(m[1]) : fallback;
};
var NEUTRAL = "sample";
function multipart(fields, fileField, file) {
  const boundary = `----civicsmith${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
  const enc = new TextEncoder();
  let head = "";
  for (const [k, v] of Object.entries(fields)) head += `--${boundary}\r
Content-Disposition: form-data; name="${k}"\r
\r
${v}\r
`;
  head += `--${boundary}\r
Content-Disposition: form-data; name="${fileField}"; filename="${NEUTRAL}"\r
Content-Type: application/octet-stream\r
\r
`;
  const a = enc.encode(head), z = enc.encode(`\r
--${boundary}--\r
`);
  const src = file.stream();
  const body = new ReadableStream({
    async start(c) {
      c.enqueue(a);
    },
    async pull(c) {
      const reader = src.getReader();
      for (; ; ) {
        const { done, value } = await reader.read();
        if (done) break;
        c.enqueue(value);
      }
      c.enqueue(z);
      c.close();
    }
  });
  return { body, headers: { "content-type": `multipart/form-data; boundary=${boundary}`, "content-length": String(a.length + file.bytes + z.length) } };
}
function makeNet(deps, d, spec, started) {
  const allowed = callHosts(d, spec);
  const left = () => PROVIDER_TIMEOUT_MS - (deps.now() - started);
  const guard = (host, port) => {
    if (!hostAllowed(host, allowed)) throw new ToolError("HOST_NOT_ALLOWED", { host });
    if (Number(port) === 25) throw new ToolError("PORT_REFUSED");
  };
  async function http(url, init = {}) {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") throw new ToolError("HOST_NOT_ALLOWED", { host: u.host });
    if (u.username || u.password) throw new ToolError("TOOL_ADDRESS_HAS_CREDENTIAL");
    guard(u.hostname, u.port);
    if (left() <= 0) throw new ToolError("TIME_LIMIT");
    const via = d.reach === "tunnel" ? deps.vpc && ((req) => deps.vpc.fetch(req)) : (req) => deps.fetch(req);
    if (!via) throw new ToolError("REACH_NOT_BOUND");
    const signal = AbortSignal.timeout(left());
    const opts = { ...init, signal };
    if (init.body && typeof init.body.getReader === "function") opts.duplex = "half";
    try {
      return await via(new Request(url, opts));
    } catch (e) {
      if (signal.aborted || e && e.name === "TimeoutError") throw new ToolError("TIME_LIMIT");
      throw new ToolError("SERVICE_UNREACHABLE");
    }
  }
  async function tcp(host, port, options = {}) {
    guard(host, port);
    const connect = d.reach === "tunnel" ? deps.vpc && deps.vpc.connect && ((a, o) => deps.vpc.connect(a, o)) : deps.connect;
    if (!connect) throw new ToolError(d.reach === "tunnel" ? "REACH_NOT_BOUND" : "SERVICE_UNREACHABLE");
    try {
      return connect({ hostname: host, port }, options);
    } catch {
      throw new ToolError("SERVICE_UNREACHABLE");
    }
  }
  return { http, tcp, left, allowed };
}
async function jsonOf(res) {
  if (!res.ok) {
    await res.body?.cancel().catch(() => {
    });
    throw new ToolError("SERVICE_REFUSED", { status: res.status });
  }
  try {
    return await res.json();
  } catch {
    throw new ToolError("SERVICE_REFUSED", { status: res.status });
  }
}
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function clientToken(net, url, { client_id, client_secret, scope, basic: basic2 }) {
  const form = new URLSearchParams({ grant_type: "client_credentials" });
  const headers = { "content-type": "application/x-www-form-urlencoded" };
  if (basic2) headers.authorization = `Basic ${btoa(`${client_id}:${client_secret}`)}`;
  else {
    form.set("client_id", client_id);
    form.set("client_secret", client_secret);
  }
  if (scope) form.set("scope", scope);
  const j = await jsonOf(await net.http(url, { method: "POST", headers, body: form.toString() }));
  if (!j.access_token) throw new ToolError("SERVICE_REFUSED", { status: 401 });
  return j.access_token;
}

// src/providers/scanners.mjs
var POLL_MS = 2e3;
var basic = (a, b) => `Basic ${btoa(`${a}:${b}`)}`;
var baseOf = (ctx) => ctx.spec.host ? `https://${String(ctx.spec.host).replace(/^https?:\/\//, "").replace(/\/$/, "")}` : `https://${ctx.net.allowed[0]}`;
var scanii = {
  async scan(ctx, file) {
    const mp = multipart({}, "file", file);
    const j = await jsonOf(await ctx.net.http(`${baseOf(ctx)}/v2.1/files`, {
      method: "POST",
      headers: { ...mp.headers, authorization: basic(ctx.cred("api_key"), ctx.cred("api_secret")) },
      body: mp.body
    }));
    const findings = (j.findings || []).filter((f) => /malicious|malware|virus|trojan|eicar/i.test(f));
    return [{ result: findings.length ? "found" : "clean", findings, vendor_ref: j.id }];
  }
};
function metadefenderBase(ctx) {
  return ctx.cloud ? "https://api.metadefender.com/v4" : baseOf(ctx);
}
async function metadefenderModeCheck(ctx) {
  const j = await jsonOf(await ctx.net.http(`${metadefenderBase(ctx)}/apikey/`, { headers: { apikey: ctx.cred("api_key"), ...ctx.modeParams } }));
  return j.paid_mode === true && j.private_scanning === true;
}
function metadefenderContradicts(j) {
  const on = (v) => v === 1 || v === "1" || v === true;
  const off = (v) => v === 0 || v === "0" || v === false;
  return on(j.sample_sharing) || off(j.private_processing);
}
async function metadefenderUpload(ctx, file, extra = {}) {
  const headers = {
    apikey: ctx.cred("api_key"),
    "content-type": "application/octet-stream",
    "content-length": String(file.bytes),
    ...ctx.cloud ? ctx.modeParams : {},
    ...extra
  };
  const j = await jsonOf(await ctx.net.http(`${metadefenderBase(ctx)}/file`, { method: "POST", headers, body: file.stream() }));
  if (ctx.cloud && metadefenderContradicts(j)) throw new ToolError("PRIVATE_MODE_NOT_HONOURED");
  if (!j.data_id) throw new ToolError("SERVICE_REFUSED", { status: 502 });
  return j.data_id;
}
async function metadefenderPoll(ctx, id, done) {
  for (; ; ) {
    const j = await jsonOf(await ctx.net.http(
      `${metadefenderBase(ctx)}/file/${encodeURIComponent(id)}`,
      { headers: { apikey: ctx.cred("api_key"), ...ctx.cloud ? ctx.modeParams : {} } }
    ));
    if (ctx.cloud && metadefenderContradicts(j)) throw new ToolError("PRIVATE_MODE_NOT_HONOURED");
    if (done(j)) return j;
    if (ctx.net.left() <= POLL_MS) throw new ToolError("TIME_LIMIT");
    await sleep(POLL_MS);
  }
}
var metadefender = (cloud) => ({
  cloud,
  modeCheck: cloud ? metadefenderModeCheck : void 0,
  async scan(ctx, file) {
    const id = await metadefenderUpload(ctx, file);
    const j = await metadefenderPoll(ctx, id, (x) => x.scan_results && x.scan_results.progress_percentage === 100);
    return Object.entries(j.scan_results.scan_details || {}).map(([engine, e]) => {
      const threat = e.threat_found ? [String(e.threat_found)] : [];
      const found = threat.length > 0 || e.scan_result_i === 1 || e.scan_result_i === 2;
      return {
        engine,
        engine_version: e.eng_version || void 0,
        signatures: e.def_time ? { def_time: e.def_time } : null,
        result: found ? "found" : "clean",
        findings: found ? threat.length ? threat : ["infected"] : [],
        vendor_ref: id
      };
    });
  }
});
function icapRequest(host, port, service, length) {
  const resHdr = `HTTP/1.1 200 OK\r
Content-Type: application/octet-stream\r
Content-Length: ${length}\r
\r
`;
  return { head: `RESPMOD icap://${host}:${port}/${service} ICAP/1.0\r
Host: ${host}\r
Allow: 204\r
Encapsulated: res-hdr=0, res-body=${resHdr.length}\r
\r
${resHdr}` };
}
function icapVerdict(text) {
  const status = Number((/^ICAP\/1\.0 (\d{3})/.exec(text) || [])[1]);
  const header = (name) => {
    const m = new RegExp(`^${name}:\\s*(.+)$`, "mi").exec(text.split("\r\n\r\n")[0]);
    return m ? m[1].trim() : null;
  };
  if (status === 204) return { result: "clean", findings: [] };
  if (status === 200) {
    const inf = header("X-Infection-Found"), id = header("X-Virus-ID");
    if (!inf && !id) return { result: "clean", findings: [] };
    const names2 = [];
    if (inf) {
      const t = /Threat=([^;]+)/i.exec(inf);
      names2.push(t ? t[1].trim() : inf);
    }
    if (id) names2.push(id);
    return { result: "found", findings: [...new Set(names2)] };
  }
  return { result: "unknown", findings: [], detail: `ICAP:${Number.isFinite(status) ? status : "unreadable"}` };
}
var icap = {
  async scan(ctx, file) {
    const host = hostPart(ctx.spec.host), port = portPart(ctx.spec.host, ctx.config.tls ? 11344 : 1344);
    const socket = await ctx.net.tcp(host, port, ctx.config.tls ? { secureTransport: "on" } : {});
    const enc = new TextEncoder();
    const w = socket.writable.getWriter();
    try {
      await w.write(enc.encode(icapRequest(host, port, ctx.config.service || "avscan", file.bytes).head));
      const reader = file.stream().getReader();
      for (; ; ) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value.length) {
          await w.write(enc.encode(`${value.length.toString(16)}\r
`));
          await w.write(value);
          await w.write(enc.encode("\r\n"));
        }
      }
      await w.write(enc.encode("0\r\n\r\n"));
      const r = socket.readable.getReader();
      let text = "";
      const dec = new TextDecoder();
      while (!text.includes("\r\n\r\n")) {
        const { done, value } = await r.read();
        if (done) break;
        text += dec.decode(value, { stream: true });
        if (ctx.net.left() <= 0) throw new ToolError("TIME_LIMIT");
      }
      return [icapVerdict(text)];
    } catch (e) {
      if (e instanceof ToolError) throw e;
      throw new ToolError("SERVICE_UNREACHABLE");
    } finally {
      try {
        await socket.close();
      } catch {
      }
    }
  }
};
var RESULT_TAG = "Malware Scanning scan result";
function blobTag(xml2) {
  for (const m of String(xml2).matchAll(/<Tag>\s*<Key>([^<]*)<\/Key>\s*<Value>([^<]*)<\/Value>\s*<\/Tag>/g)) if (m[1] === RESULT_TAG) return m[2];
  return null;
}
var defender = {
  async scan(ctx, file) {
    const token = await clientToken(
      ctx.net,
      `https://login.microsoftonline.com/${encodeURIComponent(String(ctx.config.tenant_id || ""))}/oauth2/v2.0/token`,
      { client_id: ctx.cred("client_id"), client_secret: ctx.cred("client_secret"), scope: "https://storage.azure.com/.default" }
    );
    const account = String(ctx.config.storage_account || "");
    if (!/^[a-z0-9]{3,24}$/.test(account) || !/^[a-z0-9-]{3,63}$/.test(String(ctx.config.container || ""))) throw new ToolError("SERVICE_REFUSED", { status: 400 });
    const blob = `https://${account}.blob.core.windows.net/${ctx.config.container}/${crypto.randomUUID()}`;
    const h = { authorization: `Bearer ${token}`, "x-ms-version": "2021-08-06" };
    const put = await ctx.net.http(blob, { method: "PUT", headers: { ...h, "x-ms-blob-type": "BlockBlob", "content-length": String(file.bytes) }, body: file.stream() });
    if (!put.ok) throw new ToolError("SERVICE_REFUSED", { status: put.status });
    try {
      for (; ; ) {
        const r = await ctx.net.http(`${blob}?comp=tags`, { headers: h });
        if (!r.ok) throw new ToolError("SERVICE_REFUSED", { status: r.status });
        const tag = blobTag(await r.text());
        if (tag === "No threats found") return [{ result: "clean", findings: [] }];
        if (tag === "Malicious") return [{ result: "found", findings: ["Malicious"] }];
        if (tag) return [{ result: "unknown", findings: [], detail: `DEFENDER:${tag}` }];
        if (ctx.net.left() <= POLL_MS) throw new ToolError("TIME_LIMIT");
        await sleep(POLL_MS);
      }
    } finally {
      await ctx.net.http(blob, { method: "DELETE", headers: h }).catch(() => {
      });
    }
  }
};
async function intelixToken(ctx) {
  return clientToken(
    ctx.net,
    "https://api.labs.sophos.com/oauth2/token",
    { client_id: ctx.cred("client_id"), client_secret: ctx.cred("client_secret"), basic: true }
  );
}
var intelixHost = (ctx) => ctx.net.allowed[0];
function intelixResult(report) {
  const score = Number(report && report.score);
  const names2 = [report && (report.malwareName || report.detection && report.detection.name)].filter(Boolean);
  if (score < 20) return { result: "found", findings: names2.length ? names2 : ["malicious"] };
  if (score < 30) return { result: "suspicious", findings: names2.length ? names2 : ["suspicious"] };
  return { result: "clean", findings: [] };
}
async function intelixSubmit(ctx, file, kind) {
  const token = await intelixToken(ctx);
  const mp = multipart({}, "file", file);
  const j = await jsonOf(await ctx.net.http(
    `https://${intelixHost(ctx)}/analysis/file/${kind}/v1`,
    { method: "POST", headers: { ...mp.headers, authorization: token }, body: mp.body }
  ));
  return { token, j };
}
var intelix = {
  async scan(ctx, file) {
    const { token, j: first } = await intelixSubmit(ctx, file, "static");
    let j = first;
    while (j.jobStatus !== "SUCCESS") {
      if (!j.jobId) throw new ToolError("SERVICE_REFUSED", { status: 502 });
      if (ctx.net.left() <= POLL_MS) throw new ToolError("TIME_LIMIT");
      await sleep(POLL_MS);
      j = await jsonOf(await ctx.net.http(
        `https://${intelixHost(ctx)}/analysis/file/static/v1/reports/${encodeURIComponent(j.jobId)}`,
        { headers: { authorization: token } }
      ));
    }
    const r = intelixResult(j.report);
    return [{ ...r, result: r.result === "suspicious" ? "found" : r.result, vendor_ref: j.jobId }];
  }
};
var SCANNERS = Object.freeze({
  scanii,
  "metadefender-cloud": metadefender(true),
  "metadefender-core": metadefender(false),
  icap,
  "defender-storage": defender,
  "sophos-intelix": intelix
});

// src/providers/sandboxes.mjs
var POLL_AFTER_MS = 6e4;
var JOE = "https://jbxcloud.joesecurity.org/api/v2";
var joeForm = (ctx, extra) => {
  const f = new URLSearchParams({ apikey: ctx.cred("api_key"), ...ctx.modeParams, ...extra });
  return { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: f.toString() };
};
var joeVerdict = (d) => d === "malicious" ? "found" : d === "suspicious" ? "suspicious" : "clean";
var joe = {
  async modeCheck(ctx) {
    const j = await jsonOf(await ctx.net.http(`${JOE}/account/info`, joeForm(ctx, {})));
    const type = j && j.data && j.data.type;
    return typeof type === "string" && type.length > 0 && !/basic/i.test(type);
  },
  async submit(ctx, file) {
    const mp = multipart({ apikey: ctx.cred("api_key"), ...ctx.modeParams }, "sample", file);
    const j = await jsonOf(await ctx.net.http(`${JOE}/submission/new`, { method: "POST", headers: mp.headers, body: mp.body }));
    if (j.data && j.data.public === true) throw new ToolError("PRIVATE_MODE_NOT_HONOURED");
    const id = j.data && (j.data.submission_id || (j.data.submission_ids || [])[0]);
    if (!id) throw new ToolError("SERVICE_REFUSED", { status: 502 });
    return { vendor_ref: String(id), poll_after_ms: POLL_AFTER_MS };
  },
  async result(ctx, ref) {
    const j = await jsonOf(await ctx.net.http(`${JOE}/submission/info`, joeForm(ctx, { submission_id: ref })));
    const d = j.data || {};
    if (d.public === true) throw new ToolError("PRIVATE_MODE_NOT_HONOURED");
    if (d.status !== "finished") return { state: "running" };
    const a = d.most_relevant_analysis || {};
    const result = joeVerdict(a.detection);
    const names2 = [a.classification, a.threatname].filter((x) => typeof x === "string" && x);
    return { state: "done", engines: [{
      result,
      findings: result === "clean" ? [] : names2.length ? names2 : [a.detection],
      sha256: d.analyses && d.analyses[0] && d.analyses[0].sha256 || void 0
    }] };
  }
};
var vmrayAuth = (ctx) => ({ authorization: `api_key ${ctx.cred("api_key")}` });
var vmray = {
  async submit(ctx, file) {
    const mp = multipart({}, "sample_file", file);
    const j = await jsonOf(await ctx.net.http(
      `https://${ctx.net.allowed[0]}/rest/sample/submit`,
      { method: "POST", headers: { ...mp.headers, ...vmrayAuth(ctx) }, body: mp.body }
    ));
    const sub = j.data && j.data.submissions && j.data.submissions[0];
    const sample = j.data && j.data.samples && j.data.samples[0];
    if (!sub || !sample) throw new ToolError("SERVICE_REFUSED", { status: 502 });
    return { vendor_ref: `${sub.submission_id}:${sample.sample_id}`, poll_after_ms: POLL_AFTER_MS };
  },
  async result(ctx, ref) {
    const [sid, sample] = String(ref).split(":");
    if (!/^\d+$/.test(sid || "") || !/^\d+$/.test(sample || "")) throw new ToolError("BAD_VENDOR_REF");
    const s = await jsonOf(await ctx.net.http(`https://${ctx.net.allowed[0]}/rest/submission/${sid}`, { headers: vmrayAuth(ctx) }));
    if (!(s.data && s.data.submission_finished)) return { state: "running" };
    const j = await jsonOf(await ctx.net.http(`https://${ctx.net.allowed[0]}/rest/sample/${sample}`, { headers: vmrayAuth(ctx) }));
    const d = j.data || {};
    const result = joeVerdict(d.sample_verdict);
    const names2 = [...d.sample_threat_names || [], ...d.sample_classifications || []].map(String);
    return { state: "done", engines: [{
      result,
      findings: result === "clean" ? [] : names2.length ? names2 : [d.sample_verdict],
      sha256: d.sample_sha256hash || void 0
    }] };
  }
};
var falconToken = (ctx) => clientToken(
  ctx.net,
  `https://${ctx.net.allowed[0]}/oauth2/token`,
  { client_id: ctx.cred("client_id"), client_secret: ctx.cred("client_secret") }
);
var falcon = {
  async modeCheck(ctx) {
    const token = await falconToken(ctx);
    const j = await jsonOf(await ctx.net.http(`https://${ctx.net.allowed[0]}/falconx/entities/settings/v1`, { headers: { authorization: `Bearer ${token}` } }));
    const r = j.resources && j.resources[0];
    return !!r && r.community_access === false;
  },
  async submit(ctx, file) {
    const token = await falconToken(ctx);
    const auth = { authorization: `Bearer ${token}` };
    const mp = multipart({ ...ctx.modeParams, file_name: "sample" }, "sample", file);
    const up = await jsonOf(await ctx.net.http(
      `https://${ctx.net.allowed[0]}/samples/entities/samples/v2`,
      { method: "POST", headers: { ...mp.headers, ...auth }, body: mp.body }
    ));
    const sample = up.resources && up.resources[0];
    if (!sample || !sample.sha256) throw new ToolError("SERVICE_REFUSED", { status: 502 });
    if (sample.is_confidential === false) throw new ToolError("PRIVATE_MODE_NOT_HONOURED");
    const env = Number(ctx.config.environment_id) || 160;
    const sub = await jsonOf(await ctx.net.http(`https://${ctx.net.allowed[0]}/falconx/entities/submissions/v1`, {
      method: "POST",
      headers: { ...auth, "content-type": "application/json" },
      body: JSON.stringify({ sandbox: [{ sha256: sample.sha256, environment_id: env }], send_email_notification: false })
    }));
    const id = sub.resources && sub.resources[0] && sub.resources[0].id;
    if (!id) throw new ToolError("SERVICE_REFUSED", { status: 502 });
    return { vendor_ref: id, poll_after_ms: POLL_AFTER_MS };
  },
  async result(ctx, ref) {
    const token = await falconToken(ctx);
    const auth = { authorization: `Bearer ${token}` };
    const s = await jsonOf(await ctx.net.http(`https://${ctx.net.allowed[0]}/falconx/entities/submissions/v1?ids=${encodeURIComponent(ref)}`, { headers: auth }));
    const state = s.resources && s.resources[0] && s.resources[0].state;
    if (state === "error") return { state: "done", engines: [{ result: "unknown", findings: [], detail: "FALCON:error" }] };
    if (state !== "success") return { state: "running" };
    const r = await jsonOf(await ctx.net.http(`https://${ctx.net.allowed[0]}/falconx/entities/report-summaries/v1?ids=${encodeURIComponent(ref)}`, { headers: auth }));
    const rep = r.resources && r.resources[0] || {};
    const verdict2 = String(rep.verdict || "");
    const result = /malicious/i.test(verdict2) ? "found" : /suspicious/i.test(verdict2) ? "suspicious" : "clean";
    const sb = rep.sandbox && rep.sandbox[0] || {};
    const names2 = [...sb.classification || [], sb.threat_name].filter((x) => typeof x === "string" && x);
    return { state: "done", engines: [{ result, findings: result === "clean" ? [] : names2.length ? names2 : [verdict2], sha256: sb.sha256 || void 0 }] };
  }
};
var xml = (text, tag) => {
  const m = new RegExp(`<${tag}>\\s*([^<]*?)\\s*</${tag}>`).exec(text);
  return m ? m[1] : null;
};
var WF_NAMES = { 1: "WildFire.malware", 2: "WildFire.grayware", 4: "WildFire.phishing", 5: "WildFire.c2" };
async function xmlOf(res) {
  if (!res.ok) {
    await res.body?.cancel().catch(() => {
    });
    throw new ToolError("SERVICE_REFUSED", { status: res.status });
  }
  return res.text();
}
var wildfire = {
  async submit(ctx, file) {
    const mp = multipart({ apikey: ctx.cred("api_key") }, "file", file);
    const t = await xmlOf(await ctx.net.http(`https://${ctx.net.allowed[0]}/publicapi/submit/file`, { method: "POST", headers: mp.headers, body: mp.body }));
    const sha = xml(t, "sha256");
    if (!sha) throw new ToolError("SERVICE_REFUSED", { status: 502 });
    return { vendor_ref: sha, poll_after_ms: POLL_AFTER_MS };
  },
  async result(ctx, ref) {
    const body = new URLSearchParams({ apikey: ctx.cred("api_key"), hash: ref }).toString();
    const t = await xmlOf(await ctx.net.http(
      `https://${ctx.net.allowed[0]}/publicapi/get/verdict`,
      { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body }
    ));
    const v = Number(xml(t, "verdict"));
    if (v === -100) return { state: "running" };
    if (v === 0) return { state: "done", engines: [{ result: "clean", findings: [], sha256: ref }] };
    if (v === 2) return { state: "done", engines: [{ result: "suspicious", findings: [WF_NAMES[2]], sha256: ref }] };
    if (WF_NAMES[v]) return { state: "done", engines: [{ result: "found", findings: [WF_NAMES[v]], sha256: ref }] };
    return { state: "done", engines: [{ result: "unknown", findings: [], detail: `WILDFIRE:${Number.isFinite(v) ? v : "unreadable"}`, sha256: ref }] };
  }
};
var intelixDynamic = {
  async submit(ctx, file) {
    const { j } = await intelixSubmit(ctx, file, "dynamic");
    if (!j.jobId) throw new ToolError("SERVICE_REFUSED", { status: 502 });
    return { vendor_ref: j.jobId, poll_after_ms: POLL_AFTER_MS };
  },
  async result(ctx, ref) {
    const token = await intelixToken(ctx);
    const j = await jsonOf(await ctx.net.http(
      `https://${intelixHost(ctx)}/analysis/file/dynamic/v1/reports/${encodeURIComponent(ref)}`,
      { headers: { authorization: token } }
    ));
    if (j.jobStatus !== "SUCCESS") return { state: "running" };
    return { state: "done", engines: [{ ...intelixResult(j.report), sha256: j.report && j.report.sha256 || void 0 }] };
  }
};
var SANDBOXES = Object.freeze({ "joe-sandbox": joe, vmray, "falcon-sandbox": falcon, wildfire, "sophos-intelix": intelixDynamic });

// src/providers/cdr.mjs
var UNSUPPORTED = /unsupported|not supported|file type/i;
async function bytesOf(res) {
  if (res.status === 415 || res.status === 422) {
    await res.body?.cancel().catch(() => {
    });
    throw new ToolError("CDR_UNSUPPORTED_TYPE");
  }
  if (!res.ok) {
    await res.body?.cancel().catch(() => {
    });
    throw new ToolError("SERVICE_REFUSED", { status: res.status });
  }
  return { bytes: new Uint8Array(await res.arrayBuffer()), content_type: res.headers.get("content-type") || "application/octet-stream" };
}
var deepCdr = {
  modeCheck: metadefenderModeCheck,
  modeApplies: (ctx) => ctx.cloud,
  async cdr(ctx, file) {
    const id = await metadefenderUpload(ctx, file, { rule: "sanitize" });
    const j = await metadefenderPoll(ctx, id, (x) => x.sanitized && Number(x.sanitized.progress_percentage) === 100);
    const s = j.sanitized;
    if (!/allowed|sanitized|success/i.test(String(s.result))) {
      if (UNSUPPORTED.test(String(s.reason || s.result))) throw new ToolError("CDR_UNSUPPORTED_TYPE");
      throw new ToolError("SERVICE_REFUSED", { status: 422 });
    }
    const removed = (s.details || []).filter((d) => /remov|sanitiz/i.test(String(d.action))).map((d) => String(d.object_name));
    const out = await bytesOf(await ctx.net.http(
      `${metadefenderBase(ctx)}/file/converted/${encodeURIComponent(id)}`,
      { headers: { apikey: ctx.cred("api_key"), ...ctx.cloud ? ctx.modeParams : {} } }
    ));
    return { ...out, removed };
  }
};
var halo = {
  async cdr(ctx, file) {
    const mp = multipart({}, "file", file);
    const res = await ctx.net.http(
      `${baseOf(ctx)}/api/v3/cdr-file`,
      { method: "POST", headers: { ...mp.headers, authorization: `Bearer ${ctx.cred("api_token")}` }, body: mp.body }
    );
    let removed = [];
    try {
      removed = JSON.parse(res.headers.get("x-sanitisation-items") || "[]").map(String);
    } catch {
      removed = [];
    }
    return { ...await bytesOf(res), removed };
  }
};
var CDRS = Object.freeze({ "opswat-deep-cdr": deepCdr, "glasswall-halo": halo });

// src/providers/reputation.mjs
import { createHash as createHash2 } from "node:crypto";

// ../bio-plane/src/tokens.mjs
var sha256hex = async (v) => {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
};

// src/providers/reputation.mjs
var names = (l) => Array.isArray(l) ? l.map((x) => String(x && typeof x === "object" ? x.name : x)).filter(Boolean) : [];
var cloudflare = {
  lookup_privacy: "cloudflare_account",
  async reputation(ctx, address) {
    const account = String(ctx.config.account_id || "");
    if (!/^[0-9a-f]{32}$/.test(account)) throw new ToolError("SERVICE_REFUSED", { status: 400 });
    const j = await jsonOf(await ctx.net.http(
      `https://api.cloudflare.com/client/v4/accounts/${account}/intel/url?url=${encodeURIComponent(address)}`,
      { headers: { authorization: `Bearer ${ctx.cred("api_token")}` } }
    ));
    const r = Array.isArray(j.result) ? j.result[0] || {} : j.result || {};
    const risk = names(r.risk_types);
    return { listed: risk.length > 0, categories: names(r.content_categories), risk };
  }
};
var THREATS = Object.freeze(["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"]);
var listRoot = (toolId) => `reputation/${toolId}`;
var listState = (toolId) => `${listRoot(toolId)}/state.json`;
var API = "https://webrisk.googleapis.com/v1";
var b64ToBytes = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
var bytesToB64 = (b) => btoa(String.fromCharCode(...b));
var hex = (b) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
var unhex = (h) => Uint8Array.from(h.match(/../g) || [], (x) => parseInt(x, 16));
function rawPrefixes(additions) {
  const out = [];
  for (const r of additions && additions.rawHashes || []) {
    const b = b64ToBytes(r.rawHashes || "");
    const n = Number(r.prefixSize);
    if (!(n >= 4 && n <= 32) || b.length % n) throw new ToolError("LIST_UNREADABLE");
    for (let i = 0; i < b.length; i += n) out.push(hex(b.subarray(i, i + n)));
  }
  return out;
}
function listChecksum(sorted) {
  const h = createHash2("sha256");
  for (const p of sorted) h.update(unhex(p));
  return bytesToB64(new Uint8Array(h.digest()));
}
function applyDiff(prev, diff) {
  let list = diff.responseType === "RESET" ? [] : [...prev || []];
  const removed = new Set((diff.removals && diff.removals.rawIndices && diff.removals.rawIndices.indices || []).map(Number));
  if (removed.size) list = list.filter((_, i) => !removed.has(i));
  list.push(...rawPrefixes(diff.additions));
  return [...new Set(list)].sort();
}
async function refresh(ctx) {
  const now = ctx.now();
  const LIST_STATE = listState(ctx.spec.tool_id);
  const prev = await readJson(ctx.bucket, LIST_STATE);
  const run = `r${now}`;
  const staged = [];
  const lists = {};
  try {
    for (const t of THREATS) {
      const old = prev && prev.lists && prev.lists[t] ? await readJson(ctx.bucket, prev.lists[t].key) : null;
      const q = new URLSearchParams({ threatType: t, "constraints.supportedCompressions": "RAW" });
      if (old && old.version_token) q.set("versionToken", old.version_token);
      const diff = await jsonOf(await ctx.net.http(`${API}/threatLists:computeDiff?${q}`, { headers: { "x-goog-api-key": ctx.cred("api_key") } }));
      const list = applyDiff(old ? old.prefixes : [], diff);
      const stated2 = diff.checksum && diff.checksum.sha256;
      if (!stated2 || listChecksum(list) !== stated2) throw new ToolError("LIST_CHECKSUM_MISMATCH", { detail: t });
      const key = `${listRoot(ctx.spec.tool_id)}/${run}/${t}.json`;
      await writeObject(ctx.bucket, key, JSON.stringify({ version_token: diff.newVersionToken || null, prefixes: list }));
      staged.push(key);
      lists[t] = { key, version_token: diff.newVersionToken || null };
    }
    const list_version = (await sha256hex(THREATS.map((t) => lists[t].version_token).join(":"))).slice(0, 16);
    const fetched_at = new Date(now).toISOString();
    await writeObject(ctx.bucket, LIST_STATE, JSON.stringify({ lists, list_version, fetched_at, last_error: null }));
    for (const t of THREATS) if (prev && prev.lists && prev.lists[t]) await deleteObject(ctx.bucket, prev.lists[t].key).catch(() => {
    });
    return { ok: true, list_version, fetched_at };
  } catch (e) {
    for (const k of staged) await deleteObject(ctx.bucket, k).catch(() => {
    });
    const error = e instanceof ToolError ? `${e.code}${e.detail ? `:${e.detail}` : ""}${e.status ? `:${e.status}` : ""}` : "LIST_UNREADABLE";
    if (prev) await writeObject(ctx.bucket, LIST_STATE, JSON.stringify({ ...prev, last_error: error }));
    else await writeObject(ctx.bucket, LIST_STATE, JSON.stringify({ lists: null, list_version: null, fetched_at: null, last_error: error }));
    return { ok: false, list_version: prev ? prev.list_version : null, fetched_at: prev ? prev.fetched_at : null, error };
  }
}
function expressions(address) {
  let s = String(address).replace(/[\t\r\n]/g, "").replace(/#.*$/, "");
  for (let i = 0; i < 16; i++) {
    let d;
    try {
      d = decodeURIComponent(s);
    } catch {
      break;
    }
    if (d === s) break;
    s = d;
  }
  const u = new URL(s.replace(/ /g, "%20"));
  const host = u.hostname.replace(/^\.+|\.+$/g, "").replace(/\.{2,}/g, ".").toLowerCase();
  const path = (u.pathname || "/").replace(/\/{2,}/g, "/");
  const query = u.search;
  const hosts = [host];
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(host) && !host.includes(":")) {
    const parts = host.split(".");
    const tail = parts.slice(-5);
    for (let i = 1; i < tail.length - 1 && hosts.length < 5; i++) hosts.push(tail.slice(i).join("."));
  }
  const paths = [path + query, path];
  const segs = path.split("/").filter(Boolean);
  let acc = "/";
  paths.push(acc);
  for (let i = 0; i < segs.length - 1 && paths.length < 6; i++) {
    acc += `${segs[i]}/`;
    paths.push(acc);
  }
  const out = [];
  for (const h of hosts) for (const p of paths) out.push(`${h}${p}`);
  return [...new Set(out)];
}
async function lookup(ctx, address) {
  const st = await readJson(ctx.bucket, listState(ctx.spec.tool_id));
  if (!st || !st.lists || !st.fetched_at) throw new ToolError("REPUTATION_LIST_ABSENT");
  if (!(Date.parse(st.fetched_at) >= ctx.now() - ctx.maxAge)) throw new ToolError("REPUTATION_LIST_STALE");
  const full = expressions(address).map((e) => hex(new Uint8Array(createHash2("sha256").update(e).digest())));
  const matches = /* @__PURE__ */ new Set();
  for (const t of THREATS) {
    const l = await readJson(ctx.bucket, st.lists[t].key);
    if (!l) throw new ToolError("REPUTATION_LIST_ABSENT");
    const set = new Set(l.prefixes);
    const sizes = [...new Set(l.prefixes.map((p) => p.length))];
    for (const h of full) for (const n of sizes) if (set.has(h.slice(0, n))) matches.add(h.slice(0, n));
  }
  const risk = /* @__PURE__ */ new Set();
  for (const prefix of matches) {
    const q = new URLSearchParams({ hashPrefix: bytesToB64(unhex(prefix)) });
    for (const t of THREATS) q.append("threatTypes", t);
    const j = await jsonOf(await ctx.net.http(`${API}/hashes:search?${q}`, { headers: { "x-goog-api-key": ctx.cred("api_key") } }));
    for (const th of j.threats || []) {
      if (full.includes(hex(b64ToBytes(th.hash || "")))) for (const tt of th.threatTypes || []) risk.add(String(tt));
    }
  }
  return { listed: risk.size > 0, categories: [], risk: [...risk].sort() };
}
var webRisk = { lookup_privacy: "hash_prefix", localList: true, reputation: lookup, refresh };
var REPUTATIONS = Object.freeze({ "cloudflare-intel": cloudflare, "google-web-risk": webRisk });
async function reputationLists(bucket) {
  if (!bucket) return [];
  const listed = await bucket.list({ prefix: "reputation/", delimiter: "/" });
  const out = [];
  for (const p of listed && listed.delimitedPrefixes || []) {
    const tool_id = p.slice("reputation/".length, -1);
    const st = await readJson(bucket, listState(tool_id));
    if (st) out.push({ tool_id, list_version: st.list_version, fetched_at: st.fetched_at, last_error: st.last_error });
  }
  return out;
}

// src/providers/sinks.mjs
var ok = async (res) => {
  if (!res.ok) {
    await res.body?.cancel().catch(() => {
    });
    throw new ToolError("SERVICE_REFUSED", { status: res.status });
  }
};
var json = (body) => ({ "content-type": "application/json", body: JSON.stringify(body) });
var post = (ctx, url, headers, payload) => ctx.net.http(url, { method: "POST", headers: { ...headers, "content-type": payload["content-type"] }, body: payload.body });
var splunk = {
  async forward(ctx, record) {
    const j = await jsonOf(await post(ctx, `${baseOf(ctx)}/services/collector/event`, { authorization: `Splunk ${ctx.cred("hec_token")}` }, json({ event: record })));
    if (j.code !== void 0 && j.code !== 0) throw new ToolError("SERVICE_REFUSED", { status: 400 });
  }
};
var sentinel = {
  async forward(ctx, record) {
    const token = await clientToken(
      ctx.net,
      `https://login.microsoftonline.com/${encodeURIComponent(String(ctx.config.tenant_id || ""))}/oauth2/v2.0/token`,
      { client_id: ctx.cred("client_id"), client_secret: ctx.cred("client_secret"), scope: "https://monitor.azure.com//.default" }
    );
    const host = hostPart(ctx.config.endpoint || "");
    const dcr = encodeURIComponent(String(ctx.config.dcr_id || "")), stream = encodeURIComponent(String(ctx.config.stream || ""));
    await ok(await post(
      ctx,
      `https://${host}/dataCollectionRules/${dcr}/streams/${stream}?api-version=2023-01-01`,
      { authorization: `Bearer ${token}` },
      json([record])
    ));
  }
};
var b64url = (b) => btoa(typeof b === "string" ? b : String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
async function googleToken(ctx) {
  let key;
  try {
    key = JSON.parse(ctx.cred("service_account_key"));
  } catch {
    throw new ToolError("CREDENTIALS_MISSING");
  }
  const pem = String(key.private_key || "").replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  let signer;
  try {
    signer = await crypto.subtle.importKey(
      "pkcs8",
      Uint8Array.from(atob(pem), (c) => c.charCodeAt(0)),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );
  } catch {
    throw new ToolError("CREDENTIALS_MISSING");
  }
  const iat = Math.floor(ctx.now() / 1e3);
  const unsigned = `${b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${b64url(JSON.stringify({
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat,
    exp: iat + 600
  }))}`;
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", signer, new TextEncoder().encode(unsigned));
  const form = new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${b64url(sig)}` });
  const j = await jsonOf(await ctx.net.http(
    "https://oauth2.googleapis.com/token",
    { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: form.toString() }
  ));
  if (!j.access_token) throw new ToolError("SERVICE_REFUSED", { status: 401 });
  return j.access_token;
}
var secops = {
  async forward(ctx, record) {
    const token = await googleToken(ctx);
    const c = ctx.config;
    const seg = (v) => encodeURIComponent(String(v || ""));
    const host = ctx.net.allowed.find((h) => h.endsWith("-chronicle.googleapis.com"));
    const url = `https://${host}/v1alpha/projects/${seg(c.project)}/locations/${seg(c.location)}/instances/${seg(c.instance)}/logTypes/${seg(c.log_type)}/logs:import`;
    const data = btoa(JSON.stringify(record));
    await ok(await post(
      ctx,
      url,
      { authorization: `Bearer ${token}` },
      json({ inline_source: { logs: [{ data, log_entry_time: record.period.to, collection_time: record.period.to }] } })
    ));
  }
};
var elastic = {
  async forward(ctx, record) {
    const index = String(ctx.config.index || "civicsmith-security-counts");
    const body = `${JSON.stringify({ index: { _index: index } })}
${JSON.stringify(record)}
`;
    const j = await jsonOf(await ctx.net.http(`${baseOf(ctx)}/_bulk`, {
      method: "POST",
      headers: { authorization: `ApiKey ${ctx.cred("api_key")}`, "content-type": "application/x-ndjson" },
      body
    }));
    if (j.errors) throw new ToolError("SERVICE_REFUSED", { status: 400 });
  }
};
function syslogFrame(record) {
  const msg = `<110>1 ${record.period.to} - civicsmith - security-counts - ${JSON.stringify(record)}`;
  return `${new TextEncoder().encode(msg).length} ${msg}`;
}
var syslog = {
  async forward(ctx, record) {
    const socket = await ctx.net.tcp(hostPart(ctx.spec.host), portPart(ctx.spec.host, 6514), { secureTransport: "on" });
    const w = socket.writable.getWriter();
    try {
      await w.write(new TextEncoder().encode(syslogFrame(record)));
      await w.close();
    } catch {
      throw new ToolError("SERVICE_UNREACHABLE");
    } finally {
      try {
        await socket.close();
      } catch {
      }
    }
  }
};
var webhook = {
  async forward(ctx, record) {
    const path = String(ctx.config.path || "/");
    if (!path.startsWith("/") || /[?#]/.test(path)) throw new ToolError("SERVICE_REFUSED", { status: 400 });
    await ok(await post(ctx, `${baseOf(ctx)}${path}`, { authorization: `Bearer ${ctx.cred("token")}` }, json(record)));
  }
};
var SINKS = Object.freeze({ "splunk-hec": splunk, sentinel, "google-secops": secops, elastic, "syslog-tls": syslog, "https-webhook": webhook });

// src/providers/probes.mjs
var EICAR_PARTS = ["X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR", "-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*"];
var eicar = () => new TextEncoder().encode(EICAR_PARTS.join(""));
var MACRO_DOCM = "UEsDBBQAAAAIALm7R133vsWA+wAAAOABAAATAAAAW0NvbnRlbnRfVHlwZXNdLnhtbIWRQVPDIBCF/wrD1QlED47jJOlB61F7qD9gA5sEhYUBGtt/L2mrB8fqEd5+772FZrV3ls0Yk/HU8mtRc4akvDY0tvx1+1TdcZYykAbrCVt+wMRXXbM9BEyssJRaPuUc7qVMakIHSfiAVJTBRwe5HOMoA6h3GFHe1PWtVJ4yUq7y4sG75hEH2NnM1vtyfeoR0SbOHk6DS1bLIQRrFOSiy5n0j5TqnCAKeZxJkwnpqgxw+WvColwOuMz1hv4p5lLlh8EoFHMPm+jfUOXF7KW8cjQa2QZifgZXUPnho5baq50rduLvTmfvBRHfiAMV/Zqgt1hUMPS1sjz+UPcJUEsDBBQAAAAIALm7R12b/TfqrQAAACkBAAALAAAAX3JlbHMvLnJlbHONzzsOwjAMBuCrRN5pWgaEUNMuCKkrKgewEjetaB5KwqO3JwMDRQyMtn9/luv2aWZ2pxAnZwVURQmMrHRqslrApT9t9sBiQqtwdpYELBShbeozzZjyShwnH1k2bBQwpuQPnEc5ksFYOE82TwYXDKZcBs09yitq4tuy3PHwacDaZJ0SEDpVAesXT//YbhgmSUcnb4Zs+nHiK5FlDJqSgIcLiqt3u8gs8KbmqxebF1BLAwQUAAAACAC5u0ddS4lBeKQAAADkAAAAEQAAAHdvcmQvZG9jdW1lbnQueG1sRY5BDoIwEEWv0nQvRRfGEAo7T4AHqO0ITehM06kit5diopv3M5nJ+9P27zCLFyT2hFoeq1oKQEvO46jlbbgeLlJwNujMTAharsCy79qlcWSfATCLTYDcLFpOOcdGKbYTBMMVRcBt96AUTN7GNKqFkouJLDBv/jCrU12fVTAeZVHeya0lY0EqyN0AnMWva/F5EkYEYxNVrSoHhWln3PmVqP+D3QdQSwMEFAAAAAgAubtHXXVmGb6xAAAAFQEAABwAAAB3b3JkL19yZWxzL2RvY3VtZW50LnhtbC5yZWxzbc9BjsIwDAXQq0TeT11mgdCoKbuR2CEEBzCp22Zo4iiOENye7BgES/+v/yR321tYzJWzeokWVk0LhqOTwcfJwun4+7UBo4XiQItEtnBnhW3fHXihUic6+6SmGlEtzKWkH0R1MwfSRhLH2oySA5V65gkTuQtNjN9tu8b834BX0+wGC3k3rMAc74nf7OBdFpWxNE4Cyjh690nF65n2Wf7YlQpRnrhYeGbN2UfAvsOXd/oHUEsDBBQAAAAIALm7R10bYICBSQAAAF0AAAATAAAAd29yZC92YmFQcm9qZWN0LmJpbrtwXvDBwo1SDxlwAMeSkqLMpNKSVIUwp3i/xNxUBVsFpZCMzGKX/OTS3NS8EiVeruDSJAXH0pJ8/4LUPA1NXi7XvBQFoBgvFwBQSwECFAMUAAAACAC5u0dd977FgPsAAADgAQAAEwAAAAAAAAAAAAAAgAEAAAAAW0NvbnRlbnRfVHlwZXNdLnhtbFBLAQIUAxQAAAAIALm7R12b/TfqrQAAACkBAAALAAAAAAAAAAAAAACAASwBAABfcmVscy8ucmVsc1BLAQIUAxQAAAAIALm7R11LiUF4pAAAAOQAAAARAAAAAAAAAAAAAACAAQICAAB3b3JkL2RvY3VtZW50LnhtbFBLAQIUAxQAAAAIALm7R111Zhm+sQAAABUBAAAcAAAAAAAAAAAAAACAAdUCAAB3b3JkL19yZWxzL2RvY3VtZW50LnhtbC5yZWxzUEsBAhQDFAAAAAgAubtHXRtggIFJAAAAXQAAABMAAAAAAAAAAAAAAIABwAMAAHdvcmQvdmJhUHJvamVjdC5iaW5QSwUGAAAAAAUABQBEAQAAOgQAAAAA";
var macroDocument = () => Uint8Array.from(atob(MACRO_DOCM), (c) => c.charCodeAt(0));
function zeroCounts(now) {
  const to = new Date(Math.floor(now / 1e3) * 1e3);
  return {
    period: { from: new Date(to.getTime() - 36e5).toISOString(), to: to.toISOString() },
    counts: Object.fromEntries(LOG_COUNT_KINDS.map((k) => [k, 0]))
  };
}

// src/providers/routes.mjs
import { createHash as createHash3 } from "node:crypto";
var ADAPTERS = { scan: SCANNERS, sandbox: SANDBOXES, cdr: CDRS, url_reputation: REPUTATIONS, log_sink: SINKS };
var STATUS2 = {
  NAMESPACE_UNKNOWN: 400,
  R2_NOT_CONFIGURED: 503,
  BAD_TARGET: 400,
  NOT_FOUND: 404,
  DIGEST_MISMATCH: 409,
  TOO_LARGE: 413,
  SERVICE_REFUSED: 502,
  SERVICE_UNREACHABLE: 502,
  TIME_LIMIT: 504,
  PRIVATE_MODE_UNCONFIRMED: 409,
  PRIVATE_MODE_NOT_HONOURED: 502,
  CDR_UNSUPPORTED_TYPE: 422,
  REPUTATION_LIST_ABSENT: 409,
  REPUTATION_LIST_STALE: 409,
  COUNTS_RECORD_INVALID: 400,
  BAD_ADDRESS: 400,
  PORT_REFUSED: 400,
  REACH_NOT_BOUND: 400,
  HOST_NOT_ALLOWED: 400
};
var reply2 = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
var refuse2 = (code, extra = {}) => reply2(STATUS2[code] || 400, { ok: false, code, ...extra });
var isoInstant = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(s) && Number.isFinite(Date.parse(s));
var TOOL_ID = /^[A-Za-z0-9._-]{1,64}$/;
function checkSpec(deps, spec, kind) {
  if (!spec || typeof spec !== "object" || typeof spec.provider_id !== "string") return { ok: false, code: "PROVIDER_UNKNOWN" };
  const id = spec.provider_id;
  const refused = REFUSED_PROVIDERS.find((r2) => r2.provider_id === id);
  if (refused) return { ok: false, code: "PROVIDER_REFUSED", reason: refused.reason, provider_id: id };
  if (HELD_PROVIDERS.some((h) => h.provider_id === id)) return { ok: false, code: "PROVIDER_HELD", provider_id: id };
  const base = providerById(id);
  if (!base) return { ok: false, code: "PROVIDER_UNKNOWN" };
  const regional = base.hosts && !Array.isArray(base.hosts);
  if (regional && !(spec.region in base.hosts)) return { ok: false, code: "REGION_UNKNOWN", provider_id: id };
  const needsHost = base.template || base.host_from_spec || regional && base.hosts[spec.region].length === 0;
  if (needsHost && !(typeof spec.host === "string" && spec.host)) return { ok: false, code: "PROVIDER_UNKNOWN", provider_id: id };
  const config = configOf(base, spec);
  if (config.missing) return { ok: false, code: "CONFIG_MISSING", field: config.missing, provider_id: id };
  const r = resolveDescriptor(base, { ...spec, config: config.config });
  if (!r.ok) return { ...r, provider_id: id };
  const d = r.descriptor;
  if (!d.kinds.includes(kind)) return { ok: false, code: "KIND_NOT_OFFERED", provider_id: id };
  const creds = spec.credentials && typeof spec.credentials === "object" ? spec.credentials : {};
  const missing = d.credentials.find((n) => !(typeof creds[n] === "string" && creds[n]));
  if (missing) return { ok: false, code: "CREDENTIALS_MISSING", field: missing, provider_id: id };
  if (d.handling.sample_sharing === "vendor_internal_research" && spec.handling_confirmed !== true) {
    return { ok: false, code: "HANDLING_NOT_CONFIRMED", provider_id: id };
  }
  if (d.reach === "tunnel" && !deps.vpc) return { ok: false, code: "REACH_NOT_BOUND", provider_id: id };
  if (spec.host && portPart(spec.host, 0) === 25) return { ok: false, code: "PORT_REFUSED", provider_id: id };
  if (!TOOL_ID.test(String(spec.tool_id || ""))) return { ok: false, code: "TOOL_SPEC_MALFORMED", field: "tool_id", provider_id: id };
  if (spec.monthly_limit_left !== void 0 && !(Number(spec.monthly_limit_left) > 0)) return { ok: false, code: "MONTHLY_LIMIT_REACHED", provider_id: id };
  return { ok: true, d, adapter: ADAPTERS[kind][id], config: config.config };
}
var present = (v) => v !== void 0 && v !== null && v !== "";
function configOf(d, spec) {
  const given = spec.config && typeof spec.config === "object" && !Array.isArray(spec.config) ? spec.config : {};
  const config = {};
  for (const f of d.config) {
    const v = Object.hasOwn(given, f.name) ? given[f.name] : void 0;
    if (present(v)) config[f.name] = v;
    else if (f.required) return { missing: f.name };
  }
  return { config: Object.freeze(config) };
}
function contextOf(deps, spec, c, started) {
  return {
    spec,
    d: c.d,
    config: c.config,
    bucket: deps.bucket,
    now: deps.now,
    maxAge: REPUTATION_LIST_MAX_AGE_MS,
    cred: (n) => String(spec.credentials[n]),
    modeParams: c.d.mode_required && c.d.mode_required.params || {},
    cloud: spec.provider_id === "metadefender-cloud" || spec.region === "cloud",
    net: makeNet(deps, c.d, spec, started)
  };
}
async function modeConfirmed(ctx, adapter) {
  if (!ctx.d.mode_required || adapter.modeApplies && !adapter.modeApplies(ctx)) return true;
  try {
    return await adapter.modeCheck(ctx) === true;
  } catch {
    return false;
  }
}
function engineName(d, reported) {
  const family = normaliseFamily(d.engine_family);
  if (!d.per_engine || !reported) return family[0];
  const n = String(reported).toLowerCase(), squash = (s) => s.replace(/[^a-z0-9]/g, "");
  if (family.includes(n)) return n;
  const hit = family.find((f) => f !== "metadefender-unlisted" && (squash(n).includes(squash(f)) || squash(f).includes(squash(n))));
  return hit || (family.includes("metadefender-unlisted") ? "metadefender-unlisted" : family[0]);
}
function verdict(d, capture_sha, started, now, fields) {
  return {
    capture_sha,
    tool: d.provider_id,
    engine: engineName(d, fields.engine),
    engine_version: fields.engine_version || "not reported",
    signatures: fields.signatures || null,
    scanned_at: new Date(now).toISOString(),
    result: fields.result,
    findings: fields.result === "found" || fields.result === "suspicious" ? (fields.findings || []).map(String) : [],
    ...fields.reason ? { reason: fields.reason } : {},
    ...fields.detail ? { detail: fields.detail } : {},
    ...fields.vendor_ref ? { vendor_ref: String(fields.vendor_ref) } : {},
    latency_ms: Math.max(0, now - started)
  };
}
var reasonOf = (e) => e instanceof ToolError ? e.code : "SERVICE_UNREACHABLE";
var detailOf = (e) => e instanceof ToolError && e.status ? `HTTP:${e.status}` : void 0;
async function prepare(deps, body, kind) {
  if (!body || !knownStore(body.store)) return { refusal: refuse2("NAMESPACE_UNKNOWN") };
  if (!deps.bucket) return { refusal: refuse2("R2_NOT_CONFIGURED") };
  const c = checkSpec(deps, body.tool, kind);
  if (!c.ok) {
    const { ok: ok2, ...rest } = c;
    return { refusal: reply2(400, { ok: false, ...rest }) };
  }
  const started = deps.now();
  const ctx = contextOf(deps, body.tool, c, started);
  const raw = body.target;
  const t = normaliseTarget(raw);
  const sha = t ? t.capture_sha : raw && typeof raw.capture_sha === "string" ? raw.capture_sha : null;
  if (!t) return { c, ctx, sha, started, reason: "BAD_TARGET" };
  const max = Math.min(SCAN_MAX_BYTES, c.d.max_bytes || SCAN_MAX_BYTES);
  const size = await sizeTarget(deps.bucket, body.store, t, max);
  if (!size.ok) return { c, ctx, sha, started, reason: size.reason };
  const whole = await verifyTarget(deps.bucket, body.store, t);
  if (!whole.ok) return { c, ctx, sha, started, reason: whole.reason };
  if (!await modeConfirmed(ctx, c.adapter)) return { c, ctx, sha, started, reason: "PRIVATE_MODE_UNCONFIRMED" };
  const outcomes = [];
  const file = { bytes: size.bytes, stream: () => {
    const s = targetStream(deps.bucket, body.store, t);
    outcomes.push(s.outcome);
    return s.stream;
  } };
  const intact = async () => (await Promise.all(outcomes)).every((o) => o.ok || o.reason === "CANCELLED");
  return { c, ctx, sha, started, file, intact };
}
var notHonoured = (id) => reply2(502, { ok: false, code: "PRIVATE_MODE_NOT_HONOURED", provider_id: id });
async function providerScan(deps, body) {
  const p = await prepare(deps, body, "scan");
  if (p.refusal) return p.refusal;
  const { c, ctx, sha, started } = p;
  const one = (fields) => reply2(200, { ok: true, verdicts: [verdict(c.d, sha, started, deps.now(), fields)] });
  if (p.reason) return one({ result: "not_scanned", reason: p.reason });
  try {
    const engines = await c.adapter.scan(ctx, p.file);
    if (!await p.intact()) return one({ result: "not_scanned", reason: "DIGEST_MISMATCH" });
    if (!engines.length) return one({ result: "unknown", detail: "NO_ENGINE_REPORTED" });
    return reply2(200, { ok: true, verdicts: engines.map((e) => verdict(c.d, sha, started, deps.now(), e)) });
  } catch (e) {
    if (reasonOf(e) === "PRIVATE_MODE_NOT_HONOURED") return notHonoured(c.d.provider_id);
    return one({ result: "not_scanned", reason: reasonOf(e), detail: detailOf(e) });
  }
}
async function sandboxSubmit(deps, body) {
  const p = await prepare(deps, body, "sandbox");
  if (p.refusal) return p.refusal;
  if (p.reason) return refuse2(p.reason);
  try {
    const s = await p.c.adapter.submit(p.ctx, p.file);
    if (!await p.intact()) return refuse2("DIGEST_MISMATCH");
    return reply2(200, { ok: true, state: "submitted", vendor_ref: s.vendor_ref, poll_after_ms: s.poll_after_ms });
  } catch (e) {
    if (reasonOf(e) === "PRIVATE_MODE_NOT_HONOURED") return notHonoured(p.c.d.provider_id);
    return refuse2(reasonOf(e), detailOf(e) ? { detail: detailOf(e) } : {});
  }
}
async function sandboxResult(deps, body) {
  const c = checkSpec(deps, body && body.tool, "sandbox");
  if (!c.ok) {
    const { ok: ok2, ...rest } = c;
    return reply2(400, { ok: false, ...rest });
  }
  if (typeof body.vendor_ref !== "string" || !body.vendor_ref || !isoInstant(body.submitted_at)) return refuse2("BAD_RESULT_REQUEST");
  const started = deps.now();
  const ctx = contextOf(deps, body.tool, c, started);
  const expired = deps.now() - Date.parse(body.submitted_at) > SANDBOX_TIMEOUT_MS;
  try {
    const r = await c.adapter.result(ctx, body.vendor_ref);
    if (r.state === "running") {
      if (expired) return reply2(200, { ok: true, state: "done", verdicts: [verdict(c.d, null, started, deps.now(), { result: "not_scanned", reason: "TIME_LIMIT", vendor_ref: body.vendor_ref })] });
      return reply2(200, { ok: true, state: "running", poll_after_ms: 6e4 });
    }
    return reply2(200, { ok: true, state: "done", verdicts: r.engines.map((e) => verdict(c.d, e.sha256 || null, started, deps.now(), { ...e, vendor_ref: body.vendor_ref })) });
  } catch (e) {
    if (reasonOf(e) === "PRIVATE_MODE_NOT_HONOURED") return notHonoured(c.d.provider_id);
    return refuse2(reasonOf(e), detailOf(e) ? { detail: detailOf(e) } : {});
  }
}
async function providerCdr(deps, body) {
  const p = await prepare(deps, body, "cdr");
  if (p.refusal) return p.refusal;
  if (p.reason) return refuse2(p.reason);
  try {
    const out = await p.c.adapter.cdr(p.ctx, p.file);
    if (!await p.intact()) return refuse2("DIGEST_MISMATCH");
    const sha = createHash3("sha256").update(out.bytes).digest("hex");
    return new Response(out.bytes, { status: 200, headers: {
      "content-type": out.content_type,
      "x-derived-sha256": sha,
      "x-of": p.sha,
      "x-output-type": out.content_type,
      "x-removed": JSON.stringify(out.removed || []),
      "x-tool": p.c.d.provider_id
    } });
  } catch (e) {
    if (reasonOf(e) === "PRIVATE_MODE_NOT_HONOURED") return notHonoured(p.c.d.provider_id);
    return refuse2(reasonOf(e), detailOf(e) ? { detail: detailOf(e) } : {});
  }
}
function publicAddress(a) {
  if (typeof a !== "string" || a.length > 8192) return null;
  let u;
  try {
    u = new URL(a);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:" || u.username || u.password) return null;
  const h = u.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!h.includes(".") && !h.includes(":")) return null;
  if (/^(localhost|.*\.localhost|.*\.local|.*\.internal|.*\.arpa)$/.test(h)) return null;
  const v4 = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(h);
  if (v4) {
    const [a1, a2] = [Number(v4[1]), Number(v4[2])];
    if (a1 === 0 || a1 === 10 || a1 === 127 || a1 === 169 && a2 === 254 || a1 === 172 && a2 >= 16 && a2 <= 31 || a1 === 192 && a2 === 168 || a1 === 100 && a2 >= 64 && a2 <= 127 || a1 >= 224) return null;
  }
  if (h.includes(":") && /^(::1?|fe[89ab][0-9a-f]:.*|f[cd][0-9a-f]{2}:.*|::ffff:.*)$/.test(h)) return null;
  return u.href;
}
async function providerReputation(deps, body) {
  const address = publicAddress(body && body.address);
  if (!address) return refuse2("BAD_ADDRESS");
  const c = checkSpec(deps, body.tool, "url_reputation");
  if (!c.ok) {
    const { ok: ok2, ...rest } = c;
    return reply2(400, { ok: false, ...rest });
  }
  if (c.adapter.localList && !deps.bucket) return refuse2("R2_NOT_CONFIGURED");
  const ctx = contextOf(deps, body.tool, c, deps.now());
  try {
    const r = await c.adapter.reputation(ctx, address);
    return reply2(200, {
      ok: true,
      listed: r.listed === true,
      categories: r.categories,
      risk: r.risk,
      source: c.d.provider_id,
      lookup_privacy: c.adapter.lookup_privacy
    });
  } catch (e) {
    return refuse2(reasonOf(e), detailOf(e) ? { detail: detailOf(e) } : {});
  }
}
async function providerRefresh(deps, body) {
  const c = checkSpec(deps, body && body.tool, "url_reputation");
  if (!c.ok) {
    const { ok: ok2, ...rest } = c;
    return reply2(400, { ok: false, ...rest });
  }
  if (!c.adapter.refresh) return refuse2("NO_LOCAL_LIST");
  if (!deps.bucket) return refuse2("R2_NOT_CONFIGURED");
  return reply2(200, await c.adapter.refresh(contextOf(deps, body.tool, c, deps.now())));
}
function checkRecord(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) return { ok: false, key: "record" };
  for (const k of Object.keys(record)) if (k !== "period" && k !== "counts") return { ok: false, key: k };
  const p = record.period;
  if (!p || typeof p !== "object" || Array.isArray(p)) return { ok: false, key: "period" };
  for (const k of Object.keys(p)) if (k !== "from" && k !== "to") return { ok: false, key: `period.${k}` };
  if (!isoInstant(p.from)) return { ok: false, key: "period.from" };
  if (!isoInstant(p.to) || !(Date.parse(p.from) < Date.parse(p.to))) return { ok: false, key: "period.to" };
  const c = record.counts;
  if (!c || typeof c !== "object" || Array.isArray(c)) return { ok: false, key: "counts" };
  for (const [k, v] of Object.entries(c)) {
    if (!LOG_COUNT_KINDS.includes(k)) return { ok: false, key: `counts.${k}` };
    if (typeof v !== "number" || !Number.isSafeInteger(v) || v < 0) return { ok: false, key: `counts.${k}` };
  }
  return { ok: true };
}
async function providerForward(deps, body) {
  const v = checkRecord(body && body.record);
  if (!v.ok) return refuse2("COUNTS_RECORD_INVALID", { key: v.key });
  const c = checkSpec(deps, body.tool, "log_sink");
  if (!c.ok) {
    const { ok: ok2, ...rest } = c;
    return reply2(400, { ok: false, ...rest });
  }
  const record = { period: { from: body.record.period.from, to: body.record.period.to }, counts: { ...body.record.counts } };
  try {
    await c.adapter.forward(contextOf(deps, body.tool, c, deps.now()), record);
    return reply2(200, { ok: true, sent_at: new Date(deps.now()).toISOString() });
  } catch (e) {
    return refuse2(reasonOf(e), detailOf(e) ? { detail: detailOf(e) } : {});
  }
}
async function providerTest(deps, body) {
  const spec = body && body.tool;
  const base = spec && providerById(spec.provider_id);
  const probe = base && base.test_probe && base.test_probe.kind;
  const kind = !base ? "scan" : probe === "eicar" ? base.kinds.includes("scan") ? "scan" : "sandbox" : probe === "macro_document" ? "cdr" : probe === "test_address" ? "url_reputation" : "log_sink";
  const c = checkSpec(deps, spec, kind);
  if (!c.ok) {
    const { ok: ok2, ...rest } = c;
    return reply2(400, { ok: false, ...rest });
  }
  const started = deps.now();
  const ctx = contextOf(deps, spec, c, started);
  const answer = (passed, detail) => reply2(200, { ok: true, passed, detail });
  const inMemory = (bytes) => ({ bytes: bytes.length, stream: () => new Response(bytes).body });
  try {
    if (kind === "scan" || kind === "sandbox" || kind === "cdr") {
      if (!await modeConfirmed(ctx, c.adapter)) return answer(false, "PRIVATE_MODE_UNCONFIRMED");
    }
    if (kind === "scan") {
      const engines = await c.adapter.scan(ctx, inMemory(eicar()));
      return engines.some((e) => e.result === "found") ? answer(true, "the EICAR test file answered found") : answer(false, "the EICAR test file did not answer found");
    }
    if (kind === "sandbox") {
      const s = await c.adapter.submit(ctx, inMemory(eicar()));
      for (; ; ) {
        const r = await c.adapter.result(ctx, s.vendor_ref);
        if (r.state === "done") {
          return r.engines.some((e) => e.result === "found") ? answer(true, "the EICAR test file answered found") : answer(false, "the EICAR test file did not answer found");
        }
        const wait = Math.min(s.poll_after_ms || 5e3, 5e3);
        if (ctx.net.left() <= wait) return answer(false, `the sandbox was still running after ${PROVIDER_TIMEOUT_MS} ms`);
        await sleep(wait);
      }
    }
    if (kind === "cdr") {
      const out = await c.adapter.cdr(ctx, inMemory(macroDocument()));
      return out.bytes.length && (out.removed || []).length ? answer(true, `removed: ${out.removed.join(", ")}`) : answer(false, out.bytes.length ? "the rebuilt file reported nothing removed" : "no rebuilt file");
    }
    if (kind === "url_reputation") {
      const look = () => c.adapter.reputation(ctx, c.d.test_probe.address);
      const r = await look().catch(async (e) => {
        if (!c.adapter.refresh || !/^REPUTATION_LIST_(ABSENT|STALE)$/.test(reasonOf(e))) throw e;
        const f = await c.adapter.refresh(ctx);
        if (!f.ok) throw new ToolError(String(f.error).split(":")[0]);
        return look();
      });
      return r.listed ? answer(true, "the test address answered listed") : answer(false, "the test address did not answer listed");
    }
    await c.adapter.forward(ctx, zeroCounts(deps.now()));
    return answer(true, "a test record of zero counts was accepted");
  } catch (e) {
    return answer(false, `${reasonOf(e)}${detailOf(e) ? ` ${detailOf(e)}` : ""}`);
  }
}
function providersList() {
  return reply2(200, {
    ok: true,
    offered: PROVIDERS,
    refused: REFUSED_PROVIDERS,
    held: HELD_PROVIDERS,
    transports: PROVIDERS.filter((d) => GENERIC.includes(d.provider_id))
  });
}

// packages-scanner.json
var packages_scanner_default = {
  ecosystem: "Debian:12",
  base: {
    repository: "docker.io/library/node",
    digest: "sha256:efd0ab5780c2d9ab1f0f869571a00d5edb17793bff4cce4a2792e3eb0ffc7562"
  },
  image: "scanner",
  class_name: "FileScanner",
  source: "https://snapshot.debian.org/archive/debian/20261006T000000Z bookworm main",
  packages: [
    {
      name: "clamav",
      version: "1.4.3+dfsg-1~deb12u2"
    },
    {
      name: "clamav-base",
      version: "1.4.3+dfsg-1~deb12u2"
    },
    {
      name: "clamav-freshclam",
      version: "1.4.3+dfsg-1~deb12u2"
    },
    {
      name: "libclamav12",
      version: "1.4.3+dfsg-1~deb12u2"
    }
  ],
  note: "The package statement of the ClamAV image (bundler R27): each Debian package Dockerfile.scanner installs, pinned, from the snapshot named, over the base pinned by digest (node:22-bookworm-slim, its linux/amd64 manifest as read on 2026-10-06, the base agent-runner pins). Its server is container/scanner.mjs and container/common.mjs, run by the base's Node; no npm package is installed."
};

// packages-renderer.json
var packages_renderer_default = {
  ecosystem: "Debian:12",
  base: {
    repository: "docker.io/library/node",
    digest: "sha256:efd0ab5780c2d9ab1f0f869571a00d5edb17793bff4cce4a2792e3eb0ffc7562"
  },
  image: "renderer",
  class_name: "SafeViewRenderer",
  source: "https://snapshot.debian.org/archive/debian/20261006T000000Z bookworm main; https://snapshot.debian.org/archive/debian-security/20261006T000000Z bookworm-security main",
  packages: [
    {
      name: "fonts-dejavu-core",
      version: "2.37-6"
    },
    {
      name: "fonts-liberation2",
      version: "2.1.5-1"
    },
    {
      name: "libreoffice-core",
      version: "4:7.4.7-1+deb12u14"
    },
    {
      name: "libreoffice-impress",
      version: "4:7.4.7-1+deb12u14"
    },
    {
      name: "libreoffice-writer",
      version: "4:7.4.7-1+deb12u14"
    },
    {
      name: "poppler-utils",
      version: "22.12.0-2+deb12u3"
    }
  ],
  note: "The package statement of the safe-view image (bundler R27): each Debian package Dockerfile.renderer installs, pinned, from the snapshots named, over the base pinned by digest (as packages-scanner.json's). Its server is container/renderer.mjs and container/common.mjs; no npm package is installed."
};

// src/handler.mjs
var reply3 = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
var UNKNOWN = () => reply3(404, { ok: false, code: "UNKNOWN" });
var versionOf = (list, name) => (list.packages.find((p) => p.name === name) || {}).version || "not reported";
async function version(deps) {
  return reply3(200, {
    ok: true,
    name: "file-scanner",
    version: deps.version || "unknown",
    clamav_version: versionOf(packages_scanner_default, "clamav"),
    signatures: await signatureState(deps.bucket),
    providers: {
      catalogue_read_on: CATALOGUE_READ_ON,
      offered: PROVIDERS.map((d) => d.provider_id),
      refused: REFUSED_PROVIDERS.map((d) => d.provider_id),
      held: HELD_PROVIDERS.map((d) => d.provider_id)
    },
    reputation_lists: await reputationLists(deps.bucket),
    renderer_version: `libreoffice ${versionOf(packages_renderer_default, "libreoffice-core")}; poppler-utils ${versionOf(packages_renderer_default, "poppler-utils")}`,
    bounds: BOUNDS
  });
}
var POSTS = {
  "/scan": scan,
  "/render": render,
  "/provider/scan": providerScan,
  "/provider/sandbox": sandboxSubmit,
  "/provider/sandbox/result": sandboxResult,
  "/provider/cdr": providerCdr,
  "/provider/reputation": providerReputation,
  "/provider/refresh": providerRefresh,
  "/provider/forward": providerForward,
  "/provider/test": providerTest
};
async function handle(request, deps) {
  const { pathname } = new URL(request.url);
  if (request.method === "GET" && pathname === "/version") return version(deps);
  if (request.method === "GET" && pathname === "/providers") return providersList();
  if (request.method === "POST" && pathname === "/mirror") return mirror(deps);
  const route = request.method === "POST" && Object.hasOwn(POSTS, pathname) ? POSTS[pathname] : null;
  if (!route) return UNKNOWN();
  let body = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  return route(deps, body && typeof body === "object" && !Array.isArray(body) ? body : null);
}

// src/worker.mjs
var classOf = (name) => fleet_member_default.containers.find((c) => c.class_name === name);
var FileScanner = class extends Container {
  defaultPort = classOf("FileScanner").image.port;
  sleepAfter = "10m";
  enableInternet = false;
  async fetch(request) {
    return this.containerFetch(request, this.defaultPort);
  }
};
var SafeViewRenderer = class extends Container {
  defaultPort = classOf("SafeViewRenderer").image.port;
  sleepAfter = "5m";
  enableInternet = false;
  async fetch(request) {
    return this.containerFetch(request, this.defaultPort);
  }
};
function container(ns, name) {
  if (!ns) return async () => {
    throw new Error("container not bound");
  };
  return (path, init = {}) => ns.get(ns.idFromName(name)).fetch(new Request(`http://container${path}`, init));
}
async function socketConnect(address, options) {
  const { connect } = await import("cloudflare:sockets");
  return connect(address, options);
}
function depsOf(env) {
  return {
    bucket: env.CAPTURES || null,
    scanner: container(env.SCANNER, "file-scanner"),
    renderer: container(env.RENDERER, "safe-view"),
    fetch: (req) => fetch(req),
    connect: socketConnect,
    vpc: env.SECURITY_VPC || null,
    now: () => Date.now(),
    version: env.VERSION
  };
}
var worker_default = {
  // installer R39: the member's limits, stated in the bundle a release signs.
  limits: MEMBER_LIMITS_STATEMENT,
  fetch(request, env) {
    return handle(request, depsOf(env));
  },
  scheduled(event, env, ctx) {
    ctx.waitUntil(runMirror(depsOf(env)));
  }
};
export {
  ContainerProxy,
  FileScanner,
  SafeViewRenderer,
  worker_default as default
};
