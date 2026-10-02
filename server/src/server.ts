import http from "http";
import app from "./app";
import WebSocket, { WebSocketServer } from "ws";
import { AgentManager } from "./agents/AgentManager";
const microphoneViewers = new Map<string, Set<WebSocket>>();
const terminalViewers = new Map<string, Set<WebSocket>>();

const PORT = 3011;

const server = http.createServer(app);

export const agentManager = new AgentManager();

const wss = new WebSocketServer({ noServer: true });
const microphoneWss = new WebSocketServer({ noServer: true });
const terminalWss = new WebSocketServer({ noServer: true });
server.on("upgrade", (request, socket, head) => {
    const url = new URL(
        request.url ?? "/",
        `http://${request.headers.host}`
    );

    console.log(
        `WebSocket upgrade request: ${url.pathname}`
    );

    if (url.pathname === "/agent") {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit("connection", ws, request);
        });

        return;
    }

    if (url.pathname === "/microphone") {
        microphoneWss.handleUpgrade(
            request,
            socket,
            head,
            (ws) => {
                microphoneWss.emit(
                    "connection",
                    ws,
                    request
                );
            }
        );

        return;
    }

    if (url.pathname === "/terminal") {
        terminalWss.handleUpgrade(
            request,
            socket,
            head,
            (ws) => {
                terminalWss.emit(
                    "connection",
                    ws,
                    request
                );
            }
        );

        return;
    }
    socket.destroy();
});

wss.on("connection", (socket, request) => {
    console.log("Agent WebSocket connected");

    let registeredAgentId: string | null = null;

    socket.on("message", (data, isBinary) => {
        // console.log(
        //     `Agent message received: ${isBinary
        //         ? `binary ${data.length} bytes`
        //         : data.toString()
        //     }`
        // );

        if (isBinary) {
            // console.log(
            //     `Received audio: ${data.length} bytes`
            // );

            if (registeredAgentId) {
                const viewers =
                    microphoneViewers.get(registeredAgentId);

                if (viewers) {
                    for (const viewer of viewers) {
                        if (viewer.readyState === WebSocket.OPEN) {
                            viewer.send(data);
                        }
                    }
                }
            }

            return;
        }

        try {
            const message = JSON.parse(data.toString());

            console.log("Agent message:", message);
            if (message.type === "terminal_output") {
                if (!registeredAgentId) {
                    return;
                }

                const viewers =
                    terminalViewers.get(
                        registeredAgentId
                    );

                if (!viewers) {
                    return;
                }

                const response = JSON.stringify({
                    type: "terminal_output",
                    stream: message.stream,
                    data: message.data
                });

                for (const viewer of viewers) {
                    if (
                        viewer.readyState ===
                        WebSocket.OPEN
                    ) {
                        viewer.send(response);
                    }
                }

                return;
            }
            if (message.type === "command_result") {
                if (!registeredAgentId) {
                    return;
                }

                const viewers =
                    terminalViewers.get(registeredAgentId);

                if (!viewers) {
                    return;
                }

                const response = JSON.stringify({
                    type: "command_result",
                    requestId: message.requestId,
                    stdout: message.stdout,
                    stderr: message.stderr,
                    exitCode: message.exitCode
                });

                for (const viewer of viewers) {
                    if (viewer.readyState === WebSocket.OPEN) {
                        viewer.send(response);
                    }
                }

                return;
            }
            if (message.type === "agent_register") {
                registeredAgentId = message.agentId;

                agentManager.register({
                    id: message.agentId,
                    hostname: message.hostname,
                    platform: message.platform,
                    architecture: message.architecture,
                    username: message.username,
                    agentVersion: message.agentVersion,
                    connectedAt: new Date(),
                    socket
                });

                console.log(
                    `Agent registered: ${message.hostname} (${message.agentId})`
                );

                socket.send(
                    JSON.stringify({
                        type: "registration_success",
                        agentId: message.agentId
                    })
                );

                console.log("Registration success sent");
            }
        } catch (error) {
            console.error("Failed to process agent message:", error);
        }
    });

    socket.on("close", (code, reason) => {
        console.log(
            `Agent disconnected. Code: ${code}, Reason: ${reason.toString()}`
        );

        if (registeredAgentId) {
            agentManager.remove(registeredAgentId);
        }
    });

    socket.on("error", (error) => {
        console.error("Agent WebSocket error:", error);
    });
});

microphoneWss.on("connection", (socket, request) => {
    const url = new URL(
        request.url ?? "/",
        `http://${request.headers.host}`
    );

    const deviceId =
        url.searchParams.get("device");

    console.log(
        `Microphone viewer requested: ${deviceId}`
    );

    if (!deviceId) {
        socket.close(
            1008,
            "Missing device ID"
        );
        return;
    }

    const agent =
        agentManager.get(deviceId);

    if (!agent) {
        console.log(
            `Device offline: ${deviceId}`
        );

        socket.close(
            1008,
            "Device offline"
        );

        return;
    }

    let viewers =
        microphoneViewers.get(deviceId);

    if (!viewers) {
        viewers = new Set<WebSocket>();
        microphoneViewers.set(
            deviceId,
            viewers
        );
    }

    viewers.add(socket);

    console.log(
        `Microphone viewer connected for ${deviceId}`
    );

    socket.on("close", () => {
        viewers?.delete(socket);

        if (viewers?.size === 0) {
            microphoneViewers.delete(deviceId);
        }

        console.log(
            `Microphone viewer disconnected for ${deviceId}`
        );
    });
}
);

terminalWss.on("connection", (socket, request) => {
    const url = new URL(
        request.url ?? "/",
        `http://${request.headers.host}`
    );

    const deviceId =
        url.searchParams.get("device");

    if (!deviceId) {
        socket.close(
            1008,
            "Missing device ID"
        );
        return;
    }

    if (!agentManager.has(deviceId)) {
        socket.close(
            1008,
            "Device offline"
        );
        return;
    }

    let viewers =
        terminalViewers.get(deviceId);

    if (!viewers) {
        viewers = new Set<WebSocket>();
        terminalViewers.set(
            deviceId,
            viewers
        );
    }

    viewers.add(socket);

    console.log(
        `Terminal connected for ${deviceId}`
    );

    socket.on("close", () => {
        viewers?.delete(socket);

        if (viewers?.size === 0) {
            terminalViewers.delete(deviceId);
        }
    });
}
);

server.on("error", (error) => {
    console.error("HTTP server error:", error);
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});