import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DATA_DIR =
    process.env.PROGRAMDATA
        ? path.join(process.env.PROGRAMDATA, "PenetrationAgent")
        : path.join(process.cwd(), "data");

const ID_FILE = path.join(DATA_DIR, "agent-id");

export function getAgentId(): string {

    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(ID_FILE)) {
        const existingId = fs.readFileSync(ID_FILE, "utf8").trim();

        if (existingId) {
            return existingId;
        }
    }

    const agentId = crypto.randomUUID();

    fs.writeFileSync(ID_FILE, agentId, "utf8");

    return agentId;
}