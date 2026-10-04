import "dotenv/config";

import cors from "cors";
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";

import { PORT } from "./config.js";
import devicesRouter from "./routes/devices.js";
import healthRouter from "./routes/health.js";
import {
  connectHomeAssistantSocket
} from "./services/homeAssistantSocket.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/devices", devicesRouter);

const server =
  http.createServer(app);

const wss =
  new WebSocketServer({
    server,
    path: "/ws"
  });

wss.on("connection", () => {
  console.log(
    "Frontend WebSocket connected"
  );
});

connectHomeAssistantSocket(wss);

server.listen(PORT, () => {
  console.log(
    `Backend running at http://localhost:${PORT}`
  );
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
