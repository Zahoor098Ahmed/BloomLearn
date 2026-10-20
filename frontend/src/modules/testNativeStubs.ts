/// <reference types="node" />
/**
 * Node-only stand-ins for native Expo modules, for the tsx unit tests. Import
 * this first in a test whose module pulls in apiKeys.ts: `expo-constants`
 * only resolves inside the app bundler, so plain Node gets an empty config.
 */
import Module from "node:module";

const STUBS: Record<string, unknown> = {
  "expo-constants": { __esModule: true, default: { expoConfig: null } },
};

type Loader = (request: string, parent: unknown, isMain: boolean) => unknown;
const mod = Module as unknown as { _load: Loader };
const load = mod._load;
mod._load = function (request, parent, isMain) {
  return request in STUBS ? STUBS[request] : load.call(this, request, parent, isMain);
};

(globalThis as { __DEV__?: boolean }).__DEV__ ??= false;
