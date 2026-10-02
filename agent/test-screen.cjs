const screenshot = require("screenshot-desktop");
const fs = require("fs");

(async () => {
    try {
        console.log("Taking screenshot...");

        const image = await screenshot({
            format: "jpg"
        });

        fs.writeFileSync("test-screen.jpg", image);

        console.log("Screenshot saved to test-screen.jpg");
        console.log(`Size: ${image.length} bytes`);
    } catch (error) {
        console.error("SCREENSHOT FAILED:");
        console.error(error);
    }
})();