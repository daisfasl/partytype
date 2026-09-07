import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CONFIG_DIR = join(homedir(), ".config", "partytype");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

type Config = {
  displayName: string;
  backendUrl: string;
};

const defaultConfig: Config = {
  displayName: "",
  // No hosted backend yet (see ROADMAP.md Phase F) - point at a local
  // dev server by default. Override by editing the config file directly.
  backendUrl: "ws://localhost:8000",
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
