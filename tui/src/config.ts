import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CONFIG_DIR = join(homedir(), ".config", "terminaltype");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

type Config = {
  displayName: string;
  backendUrl: string;
};

const defaultConfig: Config = {
  displayName: "",
  // where backend is hosted:
  backendUrl: "wss://terminaltype.duckdns.org",
};

function readConfig(): Config {
  if (!existsSync(CONFIG_PATH)) return defaultConfig;
  try {
    const raw = readFileSync(CONFIG_PATH, "utf-8");
    return { ...defaultConfig, ...JSON.parse(raw) };
  } catch {
    return defaultConfig;
  }
}

function writeConfig(config: Config) {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export function getDisplayName(): string {
  return readConfig().displayName;
}

export function setDisplayName(name: string) {
  writeConfig({ ...readConfig(), displayName: name });
}

export function getBackendUrl(): string {
  return readConfig().backendUrl;
}

export function setBackendUrl(url: string) {
  writeConfig({ ...readConfig(), backendUrl: url });
}

export function getHealthUrl(): string {
  return getBackendUrl().replace(/^ws/, "http") + "/api/health";
}
