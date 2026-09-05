import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CONFIG_DIR = join(homedir(), ".config", "partytype");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

type Config = {
  displayName: string;
};

const defaultConfig: Config = { displayName: "" };

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
