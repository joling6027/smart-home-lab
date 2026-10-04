"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HA_TOKEN = exports.HA_URL = exports.PORT = void 0;
const PORT = Number(process.env.PORT ?? 3000);
exports.PORT = PORT;
const HA_URL = process.env.HA_URL;
exports.HA_URL = HA_URL;
const HA_TOKEN = process.env.HA_TOKEN;
exports.HA_TOKEN = HA_TOKEN;
if (!HA_URL || !HA_TOKEN) {
    throw new Error("HA_URL and HA_TOKEN must be defined.");
}
