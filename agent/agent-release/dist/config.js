import fs from "node:fs";
import path from "node:path";
const configPath = path.join(process.cwd(), "config.json");
if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
}
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
if (!config.server) {
    throw new Error("Missing 'server' in config.json");
}
export default config;
//# sourceMappingURL=config.js.map