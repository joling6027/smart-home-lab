import { client } from "../mqttClient";

const STATE_TOPIC = "home/living-room/floor-lamp/state";
const COMMAND_TOPIC = "home/living-room/floor-lamp/set";

const BRIGHTNESS_STATE_TOPIC =
  "home/living-room/floor-lamp/brightness/state";

const BRIGHTNESS_COMMAND_TOPIC =
  "home/living-room/floor-lamp/brightness/set";

let state = "OFF";
let brightness = 128;

export function setupLamp() {
  client.publish(
    "homeassistant/light/living_room_floor_lamp/config",
    JSON.stringify({
      name: "Floor Lamp",
      unique_id: "living_room_floor_lamp",
      state_topic: STATE_TOPIC,
      command_topic: COMMAND_TOPIC,
      payload_on: "ON",
      payload_off: "OFF",
      brightness_state_topic: BRIGHTNESS_STATE_TOPIC,
      brightness_command_topic: BRIGHTNESS_COMMAND_TOPIC,
      brightness_scale: 255
    }),
    { retain: true }
  );

  client.subscribe([
    COMMAND_TOPIC,
    BRIGHTNESS_COMMAND_TOPIC
  ]);

  client.publish(
    STATE_TOPIC,
    state,
    { retain: true }
  );

  client.publish(
    BRIGHTNESS_STATE_TOPIC,
    brightness.toString(),
    { retain: true }
  );
}

export function handleLampMessage(
  topic: string,
  rawMessage: string
) {
  if (topic === COMMAND_TOPIC) {
    const command = rawMessage.trim().toUpperCase();

    if (command !== "ON" && command !== "OFF") {
      return false;
    }

    state = command;

    client.publish(
      STATE_TOPIC,
      state,
      { retain: true }
    );

    console.log(`Floor lamp: ${state}`);

    return true;
  }

  if (topic === BRIGHTNESS_COMMAND_TOPIC) {
    const value = Number(rawMessage);

    if (
      Number.isNaN(value) ||
      value < 0 ||
      value > 255
    ) {
      return false;
    }

    brightness = value;
    state = brightness === 0 ? "OFF" : "ON";

    client.publish(
      BRIGHTNESS_STATE_TOPIC,
      brightness.toString(),
      { retain: true }
    );

    client.publish(
      STATE_TOPIC,
      state,
      { retain: true }
    );

    console.log(`Brightness: ${brightness}`);

    return true;
  }

  return false;
}