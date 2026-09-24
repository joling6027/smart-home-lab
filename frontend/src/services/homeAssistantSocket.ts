import type { AppDispatch } from "../store/store";
import { updateEntity } from "../features/devices/devicesSlice";

const HA_TOKEN = import.meta.env.VITE_HA_TOKEN;

export function connectHomeAssistantSocket(
  dispatch: AppDispatch
) {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws";
  const socket = new WebSocket(
    `${protocol}://${window.location.host}/api/websocket`
  );

  socket.addEventListener("open", () => {
    console.log("WebSocket connected");
  });

  socket.addEventListener("message", event => {
    const message = JSON.parse(event.data);

    console.log("HA WebSocket message:", message);

    if (message.type === "auth_required") {
      socket.send(
        JSON.stringify({
          type: "auth",
          access_token: HA_TOKEN
        })
      );
      return;
    }

    if (message.type === "auth_ok") {
      socket.send(
        JSON.stringify({
          id: 1,
          type: "subscribe_events",
          event_type: "state_changed"
        })
      );
      return;
    }

    if (
      message.type === "event" &&
      message.event?.event_type === "state_changed"
    ) {
      const newState = message.event.data?.new_state;

      console.log(
        "State changed:",
        message.event.data?.entity_id,
        newState
      );

      if (!newState) {
        return;
      }
      dispatch(updateEntity(newState));
    }
  });

  socket.addEventListener("close", () => {
    console.log("WebSocket disconnected");
  })

  return socket;
}