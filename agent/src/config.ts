import fs from "node:fs";
import path from "node:path";

export interface AgentConfig {
    server: string;
    agentVersion: string;
}

const configPath = path.join(process.cwd(), "config.json");

if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
}

const config: AgentConfig = JSON.parse(
    fs.readFileSync(configPath, "utf8")
);

if (!config.server) {
    throw new Error("Missing 'server' in config.json");
}

export default config;