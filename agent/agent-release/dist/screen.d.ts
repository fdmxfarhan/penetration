type FrameCallback = (frame: Buffer) => void;
export declare function startScreenCapture(onFrame: FrameCallback, fps?: number): void;
export declare function stopScreenCapture(): void;
export declare function isScreenCaptureRunning(): boolean;
export declare function getScreenCaptureFps(): number;
export {};
//# sourceMappingURL=screen.d.ts.map