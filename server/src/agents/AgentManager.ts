import WebSocket from "ws";

const microphoneViewers = new Map<string, Set<WebSocket>>();

export interface Agent {
    id: string;
    hostname: string;
    platform: string;
    architecture: string;
    username: string;
    agentVersion: string;
    connectedAt: Date;
    socket: WebSocket;
}

export class AgentManager {

    private agents = new Map<string, Agent>();

    register(agent: Agent) {
        this.agents.set(agent.id, agent);
    }

    remove(id: string) {
        this.agents.delete(id);
    }

    get(id: string) {
        return this.agents.get(id);
    }

    getAll() {
        return Array.from(this.agents.values());
    }

    has(id: string) {
        return this.agents.has(id);
    }
}