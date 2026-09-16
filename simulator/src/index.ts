import mqtt from "mqtt";

const client = mqtt.connect("mqtt://localhost:1883", {
  clientId: "smart-home-simulator"
});

const TEMPERATURE_TOPIC = "home/living-room/temperature";

const LAMP_STATE_TOPIC = "home/living-room/floor-lamp/state";
const LAMP_COMMAND_TOPIC = "home/living-room/floor-lamp/set";
const LAMP_BRIGHTNESS_STATE_TOPIC = "home/living-room/floor-lamp/brightness/state";
const LAMP_BRIGHTNESS_COMMAND_TOPIC = "home/living-room/floor-lamp/brightness/set";

let lampState = "OFF";
let lampBrightness = 128;

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

    client.subscribe([LAMP_COMMAND_TOPIC, LAMP_BRIGHTNESS_COMMAND_TOPIC], (error) => {
        if (error) {
            console.error("Failed to subscribe:", error);
            return;
        }

        console.log(`Subscribed to: lamp command topics`);
    });

    // Publish initial lamp state
    client.publish(LAMP_STATE_TOPIC, lampState, {
        retain: true
    });
    client.publish(LAMP_BRIGHTNESS_STATE_TOPIC, lampBrightness.toString(), {
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

  // brightness
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
  }
});

client.on("error", (error) => {
    console.error("MQTT error:", error);
});