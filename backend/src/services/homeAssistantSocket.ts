import WebSocket, {
  WebSocketServer
} from "ws";

import {
  HA_TOKEN,
  HA_URL
} from "../config.js";

export function connectHomeAssistantSocket(
  wss: WebSocketServer
) {
  const haWsUrl =
    HA_URL.replace(/^http/, "ws") +
    "/api/websocket";

  const haSocket =
    new WebSocket(haWsUrl);

  haSocket.on("message", raw => {
    const message =
      JSON.parse(raw.toString());

    if (message.type === "auth_required") {
      haSocket.send(
        JSON.stringify({
          type: "auth",
          access_token: HA_TOKEN
        })
      );

      return;
    }

    if (message.type === "auth_ok") {
      haSocket.send(
        JSON.stringify({
          id: 1,
          type: "subscribe_events",
          event_type: "state_changed"
        })
      );

      return;
    }

    if (message.type === "event") {
      const payload =
        JSON.stringify(message);

      for (const client of wss.clients) {
        if (
          client.readyState ===
          WebSocket.OPEN
        ) {
          client.send(payload);
        }
      }
    }
  });

  haSocket.on("error", error => {
    console.error(
      "Home Assistant WebSocket error:",
      error
    );
  });

  return haSocket;
}