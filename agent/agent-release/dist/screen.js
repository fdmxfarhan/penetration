import screenshot from "screenshot-desktop";
let running = false;
let frameCallback = null;
let currentFps = 5;
let captureLoopPromise = null;
export function startScreenCapture(onFrame, fps = 5) {
    if (running) {
        console.log("Screen capture already running");
        return;
    }
    currentFps = Math.max(1, Math.min(30, fps));
    frameCallback = onFrame;
    running = true;
    console.log(`Starting screen capture at ${currentFps} FPS`);
    captureLoopPromise = captureLoop();
}
async function captureLoop() {
    const interval = 1000 / currentFps;
    while (running) {
        const startTime = Date.now();
        try {
            const image = await screenshot({
                format: "jpg"
            });
            if (running && frameCallback) {
                frameCallback(image);
            }
        }
        catch (error) {
            console.error("Screen capture error:", error);
        }
        // Calculate how long the capture took
        const elapsed = Date.now() - startTime;
        // Only wait for the remaining interval.
        const delay = Math.max(0, interval - elapsed);
        if (running && delay > 0) {
            await sleep(delay);
        }
    }
    captureLoopPromise = null;
}
function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
export function stopScreenCapture() {
    if (!running) {
        return;
    }
    console.log("Stopping screen capture");
    running = false;
    frameCallback = null;
}
export function isScreenCaptureRunning() {
    return running;
}
export function getScreenCaptureFps() {
    return currentFps;
}
//# sourceMappingURL=screen.js.map