type OutputCallback = (type: "stdout" | "stderr", data: string) => void;
export declare function startShell(onOutput: OutputCallback): void;
export declare function executeCommand(command: string): void;
export declare function stopShell(): void;
export {};
//# sourceMappingURL=command.d.ts.map