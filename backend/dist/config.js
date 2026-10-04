"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HA_TOKEN = exports.HA_URL = exports.PORT = void 0;
const PORT = Number(process.env.PORT ?? 3000);
exports.PORT = PORT;
const haUrl = process.env.HA_URL;
const haToken = process.env.HA_TOKEN;
if (!haUrl || !haToken) {
    throw new Error("HA_URL and HA_TOKEN must be defined.");
}
const HA_URL = haUrl;
exports.HA_URL = HA_URL;
const HA_TOKEN = haToken;
exports.HA_TOKEN = HA_TOKEN;
