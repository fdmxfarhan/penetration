import os from "node:os";

export function getDeviceInfo() {

    return {
        hostname: os.hostname(),
        platform: os.platform(),
        architecture: os.arch(),
        release: os.release(),
        username: os.userInfo().username
    };

}