import mqtt from "mqtt";

const client = mqtt.connect("mqtt://localhost:1883", {
  clientId: "smart-home-simulator"
});

const TEMPERATURE_TOPIC = "home/living-room/temperature";

const LAMP_STATE_TOPIC = "home/living-room/floor-lamp/state";
const LAMP_COMMAND_TOPIC = "home/living-room/floor-lamp/set";
const LAMP_BRIGHTNESS_STATE_TOPIC = "home/living-room/floor-lamp/brightness/state";
const LAMP_BRIGHTNESS_COMMAND_TOPIC = "home/living-room/floor-lamp/brightness/set";
// fan
const FAN_STATE_TOPIC = "home/living-room/fan/state";
const FAN_COMMAND_TOPIC = "home/living-room/fan/set";
const FAN_SPEED_STATE_TOPIC = "home/living-room/fan/speed/state";
const FAN_SPEED_COMMAND_TOPIC = "home/living-room/fan/speed/set";

let lampState = "OFF";
let lampBrightness = 128;
let fanState = "OFF";
let fanSpeed = 0;

client.on("connect", () => {
  console.log("Connected to MQTT broker");

  // Temperature sensor discovery
  client.publish(
    "homeassistant/sensor/living_room_temperature/config",
    JSON.stringify({
      name: "Living Room Temperature",
      unique_id: "living_room_temperature",
      state_topic: TEMPERATURE_TOPIC,
      unit_of_measurement: "°C",
      device_class: "temperature",
      state_class: "measurement"
    }),
    { retain: true }
  );

  // Floor lamp discovery
  client.publish(
    "homeassistant/light/living_room_floor_lamp/config",
    JSON.stringify({
      name: "Floor Lamp",
      unique_id: "living_room_floor_lamp",
      state_topic: LAMP_STATE_TOPIC,
      command_topic: LAMP_COMMAND_TOPIC,
      payload_on: "ON",
      payload_off: "OFF",

      brightness_state_topic: LAMP_BRIGHTNESS_STATE_TOPIC,
      brightness_command_topic: LAMP_BRIGHTNESS_COMMAND_TOPIC,
      brightness_scale: 255
    }),
    { retain: true }
  );

  client.publish(
    "homeassistant/fan/living_room_fan/config",
    JSON.stringify({
      name: "Fan",
      unique_id: "living_room_fan",
      state_topic: FAN_STATE_TOPIC,
      command_topic: FAN_COMMAND_TOPIC,
      payload_on: "ON",
      payload_off: "OFF",
      percentage_state_topic: FAN_SPEED_STATE_TOPIC,
      percentage_command_topic: FAN_SPEED_COMMAND_TOPIC,
      speed_range_min: 1,
      speed_range_max: 100
    }),
    { retain: true }
  );

  client.subscribe([LAMP_COMMAND_TOPIC, LAMP_BRIGHTNESS_COMMAND_TOPIC, FAN_COMMAND_TOPIC, FAN_SPEED_COMMAND_TOPIC], (error) => {
    if (error) {
      console.error("Failed to subscribe:", error);
      return;
    }

    console.log("Subscribed to: lamp command topics");
  });

  // Publish initial lamp state
  client.publish(LAMP_STATE_TOPIC, lampState, {
    retain: true
  });
  client.publish(LAMP_BRIGHTNESS_STATE_TOPIC, lampBrightness.toString(), {
    retain: true
  });
  // Publish initial fan state
  client.publish(FAN_STATE_TOPIC, fanState, {
    retain: true
  });
  client.publish(FAN_SPEED_STATE_TOPIC, fanSpeed.toString(), {
    retain: true
  })

});
// Fake temperature updates
setInterval(() => {
  const temperature = 20 + Math.random() * 4;

  client.publish(
    TEMPERATURE_TOPIC,
    temperature.toFixed(1)
  );

  console.log(
    `Temperature: ${temperature.toFixed(1)}°C`
  );
}, 3000);

client.on("message", (topic, message) => {
  const rawMessage = message.toString();

  console.log("MQTT message received:", topic, rawMessage);

  // ON / OFF
  if (topic === LAMP_COMMAND_TOPIC) {
    const command = rawMessage.trim().toUpperCase();
    if (command !== "ON" && command !== "OFF") {
      console.log("Invalid brightness command");
      return;
    }
    lampState = command;
    console.log(`Floor lamp: ${lampState}`);
    console.log(`Floor lamp brightness: ${lampBrightness}`);

    client.publish(
      LAMP_STATE_TOPIC,
      lampState,
      { retain: true }
    );
    return;
  }

  // lamp brightness
  if (topic === LAMP_BRIGHTNESS_COMMAND_TOPIC) {
    const brightness = Number(rawMessage);

    if (
      Number.isNaN(brightness) ||
      brightness < 0 ||
      brightness > 255
    ) {
      console.log("Invalid brightness value: ", brightness);
      return;
    }

    lampBrightness = brightness;
    if (lampBrightness === 0) {
      lampState = "OFF";
    } else {
      lampState = "ON";
    }

    console.log(`Floor lamp brightness: ${lampBrightness}`);
    console.log(`Floor lamp: ${lampState}`);

    client.publish(
      LAMP_BRIGHTNESS_STATE_TOPIC,
      lampBrightness.toString(),
      { retain: true }
    );
    client.publish(
      LAMP_STATE_TOPIC,
      lampState,
      { retain: true }
    );
    return;
  };
  // fan
  if (topic === FAN_COMMAND_TOPIC) {
    const command = rawMessage.trim().toUpperCase();

    if (command !== "ON" && command !== "OFF") {
      return;
    };

    fanState = command;

    if (fanState === "OFF") {
      fanSpeed = 0;
    } else if (fanSpeed === 0) {
      fanSpeed = 50;
    }

    console.log(`Fan: ${fanState}`);
    console.log(`Fan speed: ${fanSpeed}%`);

    client.publish(
      FAN_STATE_TOPIC,
      fanState,
      { retain: true }
    )
    client.publish(
      FAN_SPEED_STATE_TOPIC,
      fanSpeed.toString(),
      { retain: true }
    )
    return;
  }

  if (topic === FAN_SPEED_COMMAND_TOPIC) {
    const speed = Number(rawMessage);

    if (
      Number.isNaN(speed) ||
      speed < 0 ||
      speed > 100
    ) {
      console.log("Invalid speed value: ", rawMessage);
      return;
    }

    fanSpeed = speed;
    fanState = fanSpeed === 0 ? "OFF" : "ON";

    console.log(`Fan speed: ${fanSpeed}%`);
    console.log(`Fan: ${fanState}`);

    client.publish(
      FAN_SPEED_STATE_TOPIC,
      fanSpeed.toString(),
      { retain: true }
    );
    client.publish(
      FAN_STATE_TOPIC,
      fanState,
      { retain: true}
    );
    return;
  }
});

client.on("error", (error) => {
  console.error("MQTT error:", error);
});
