import { spawn } from "node:child_process";
let shell = null;
export function startShell(onOutput) {
    if (shell) {
        return;
    }
    shell = spawn(process.env.ComSpec || "cmd.exe", [], {
        cwd: process.env.USERPROFILE,
        windowsHide: true,
        stdio: "pipe"
    });
    shell.stdout.setEncoding("utf8");
    shell.stderr.setEncoding("utf8");
    shell.stdout.on("data", (data) => {
        onOutput("stdout", data.toString());
    });
    shell.stderr.on("data", (data) => {
        onOutput("stderr", data.toString());
    });
    shell.on("close", () => {
        shell = null;
    });
    shell.on("error", (error) => {
        console.error("Shell error:", error);
        shell = null;
    });
    console.log("Persistent shell started");
}
export function executeCommand(command) {
    if (!shell) {
        throw new Error("Shell is not running");
    }
    shell.stdin.write(command + "\r\n");
}
export function stopShell() {
    if (!shell) {
        return;
    }
    shell.kill();
    shell = null;
    console.log("Persistent shell stopped");
}
//# sourceMappingURL=command.js.map