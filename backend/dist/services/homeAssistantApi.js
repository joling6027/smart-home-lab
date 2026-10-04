"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHomeAssistantStates = getHomeAssistantStates;
exports.callHomeAssistantService = callHomeAssistantService;
const config_js_1 = require("../config.js");
async function getHomeAssistantStates() {
    const response = await fetch(`${config_js_1.HA_URL}/api/states`, {
        headers: {
            Authorization: `Bearer ${config_js_1.HA_TOKEN}`,
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch Home Assistant states: ${response.status}`);
    }
    return response.json();
}
async function callHomeAssistantService(domain, service, data) {
    const response = await fetch(`${config_js_1.HA_URL}/api/services/${domain}/${service}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config_js_1.HA_TOKEN}`,
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Home Assistant service failed: ${response.status} ${body}`);
    }
    const text = await response.text();
    if (!text) {
        return null;
    }
    return JSON.parse(text);
}
