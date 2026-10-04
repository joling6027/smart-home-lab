"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const homeAssistantApi_js_1 = require("../services/homeAssistantApi.js");
const router = (0, express_1.Router)();
router.get("/", async (_req, res) => {
    try {
        const states = await (0, homeAssistantApi_js_1.getHomeAssistantStates)();
        res.json(states);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch devices"
        });
    }
});
router.post("/light/:entityId/on", async (req, res) => {
    try {
        const result = await (0, homeAssistantApi_js_1.callHomeAssistantService)("light", "turn_on", {
            entity_id: req.params.entityId
        });
        res.json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to turn on light"
        });
    }
});
router.post("/light/:entityId/off", async (req, res) => {
    try {
        const result = await (0, homeAssistantApi_js_1.callHomeAssistantService)("light", "turn_off", {
            entity_id: req.params.entityId
        });
        res.json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to turn off light"
        });
    }
});
router.post("/light/:entityId/brightness", async (req, res) => {
    try {
        const { brightness } = req.body;
        const result = await (0, homeAssistantApi_js_1.callHomeAssistantService)("light", "turn_on", {
            entity_id: req.params.entityId,
            brightness
        });
        res.json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to update brightness"
        });
    }
});
router.post("/fan/:entityId/on", async (req, res) => {
    try {
        const result = await (0, homeAssistantApi_js_1.callHomeAssistantService)("fan", "turn_on", {
            entity_id: req.params.entityId
        });
        res.json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to turn on fan"
        });
    }
});
router.post("/fan/:entityId/off", async (req, res) => {
    try {
        const result = await (0, homeAssistantApi_js_1.callHomeAssistantService)("fan", "turn_off", {
            entity_id: req.params.entityId
        });
        res.json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to turn off fan"
        });
    }
});
router.post("/fan/:entityId/percentage", async (req, res) => {
    try {
        const { percentage } = req.body;
        const result = await (0, homeAssistantApi_js_1.callHomeAssistantService)("fan", "set_percentage", {
            entity_id: req.params.entityId,
            percentage
        });
        res.json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to update fan speed"
        });
    }
});
exports.default = router;
