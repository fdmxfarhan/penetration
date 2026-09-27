import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const ID_FILE = path.join(DATA_DIR, "agent-id");

export function getAgentId(): string {

    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(ID_FILE)) {
        return fs.readFileSync(ID_FILE, "utf8").trim();
    }

    const agentId = crypto.randomUUID();

    fs.writeFileSync(ID_FILE, agentId);

    return agentId;
}