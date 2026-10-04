"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectHomeAssistantSocket = connectHomeAssistantSocket;
const ws_1 = __importDefault(require("ws"));
const config_js_1 = require("../config.js");
function connectHomeAssistantSocket(wss) {
    const haWsUrl = config_js_1.HA_URL.replace(/^http/, "ws") +
        "/api/websocket";
    const haSocket = new ws_1.default(haWsUrl);
    haSocket.on("message", raw => {
        const message = JSON.parse(raw.toString());
        if (message.type === "auth_required") {
            haSocket.send(JSON.stringify({
                type: "auth",
                access_token: config_js_1.HA_TOKEN
            }));
            return;
        }
        if (message.type === "auth_ok") {
            haSocket.send(JSON.stringify({
                id: 1,
                type: "subscribe_events",
                event_type: "state_changed"
            }));
            return;
        }
        if (message.type === "event") {
            const payload = JSON.stringify(message);
            for (const client of wss.clients) {
                if (client.readyState ===
                    ws_1.default.OPEN) {
                    client.send(payload);
                }
            }
        }
    });
    haSocket.on("error", error => {
        console.error("Home Assistant WebSocket error:", error);
    });
    return haSocket;
}
