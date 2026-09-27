import { Microphone } from "decibri";

let microphone: Microphone | null = null;

export function startMicrophone(
    onAudio: (chunk: Buffer) => void
) {
    if (microphone) {
        console.log("Microphone already running");
        return;
    }

    console.log("Starting microphone...");

    microphone = new Microphone({
        sampleRate: 16000,
        channels: 1,
        framesPerBuffer: 1600
    });

    microphone.on("data", (chunk: Buffer) => {
        onAudio(chunk);
    });

    microphone.on("error", (error) => {
        console.error("Microphone error:", error);
    });

    microphone.on("end", () => {
        console.log("Microphone ended");
    });

    console.log("Microphone started");
}

export function stopMicrophone() {
    if (!microphone) {
        return;
    }

    console.log("Stopping microphone...");

    microphone.stop();
    microphone = null;

    console.log("Microphone stopped");
}