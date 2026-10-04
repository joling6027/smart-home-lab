"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const config_js_1 = require("./config.js");
const devices_js_1 = __importDefault(require("./routes/devices.js"));
const health_js_1 = __importDefault(require("./routes/health.js"));
const homeAssistantSocket_js_1 = require("./services/homeAssistantSocket.js");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/health", health_js_1.default);
app.use("/api/devices", devices_js_1.default);
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({
    server,
    path: "/ws"
});
wss.on("connection", () => {
    console.log("Frontend WebSocket connected");
});
(0, homeAssistantSocket_js_1.connectHomeAssistantSocket)(wss);
server.listen(config_js_1.PORT, () => {
    console.log(`Backend running at http://localhost:${config_js_1.PORT}`);
});
// app.get("/api/health", (_req, res) => {
//   res.json({
//     status: "ok"
//   });
// });
// app.get("/api/devices", async (_req, res) => {
//   try {
//     const response = await fetch(
//       `${HA_URL}/api/states`,
//       {
//         headers: {
//           Authorization: `Bearer ${HA_TOKEN}`
//         }
//       }
//     );
//     if (!response.ok) {
//       return res.status(response.status).json({
//         error: "Failed to fetch Home Assistant states"
//       });
//     }
//     const states = await response.json();
//     res.json(states);
//   } catch (error) {
//     console.error(
//       "Failed to fetch devices:",
//       error
//     )
//     res.status(500).json({
//       error: "Internal server error"
//     })
//   }
// })
// app.post("/api/devices/light/:entityId/on",
//   async (req, res) => {
//     try {
//       const { entityId } = req.params;
//       const result = await callHomeAssistantService(
//         "light",
//         "turn_on",
//         {
//           entity_id: entityId
//         }
//       );
//       res.json(result);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({
//         error: "Failed to turn on light."
//       })
//     }
//   }
// )
// app.post("/api/devices/light/:entityId/off", async (req, res) => {
//   try {
//     const { entityId } = req.params;
//     const result = await callHomeAssistantService(
//       "light",
//       "turn_off",
//       {
//         entity_id: entityId
//       }
//     );
//     res.json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       error: "Failed to turn light off."
//     })
//   }
// });
// app.post("/api/devices/light/:entityId/brightness", async (req, res) => {
//   try {
//     const { entityId } = req.params;
//     const { brightness } = req.body;
//     console.log(
//         "Brightness request:",
//         entityId,
//         brightness
//       );
//     if (typeof brightness !== "number" || brightness < 0 || brightness > 255) {
//       return res.status(400).json({
//         error: "Brightness must be between 0 and 255."
//       });
//     }
//     const result = await callHomeAssistantService(
//       "light",
//       "turn_on",
//       {
//         entity_id: entityId,
//         brightness
//       }
//     )
//     res.json(result);
//   } catch(error) {
//     console.error(error);
//     res.status(500).json({
//       error: "Failed to adjust brightness"
//     })
//   }
// })
// app.post("/api/devices/fan/:entityId/on", async (req, res) => {
//   try {
//     const { entityId } = req.params;
//     const result = await callHomeAssistantService(
//       "fan",
//       "turn_on",
//       {
//         entity_id: entityId
//       }
//     );
//     res.json(result)
//   } catch(error) {
//     console.error(error);
//     res.status(500).json({
//       error: "Failed to turn on fan."
//     })
//   }
// });
// app.post("/api/devices/fan/:entityId/off", async (req, res) => {
//   try {
//     const { entityId } = req.params;
//     const result = await callHomeAssistantService(
//       "fan",
//       "turn_off",
//       {
//         entity_id: entityId
//       }
//     );
//     res.json(result)
//   }catch(error) {
//     console.error(error);
//     res.status(500).json({
//       error: "Failed to turn off fan."
//     })
//   }
// })
// app.post("/api/devices/fan/:entityId/percentage", async (req, res) => {
//   try {
//     const { entityId } = req.params;
//     const { percentage } = req.body;
//     const result = await callHomeAssistantService(
//       "fan",
//       "set_percentage",
//       {
//         entity_id: entityId,
//         percentage
//       }
//     );
//     res.json(result);
//   }catch (error) {
//     console.error(error);
//     res.status(500).json({
//       error: "Failed to update fan speed."
//     })
//   }
// })
// app.listen(PORT, () => {
//   console.log(
//     `Backend running at http://localhost:${PORT}`
//   );
// });
