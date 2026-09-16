import { client } from "./mqttClient";
import { setupTemeratureSensor } from "./devices/temperature";
import { setupLamp, handleLampMessage } from "./devices/lamp";
import { setupFan, handleFanMessage } from "./devices/fan";

client.on("connect", () => {
  console.log("Connected to MQTT broker");

  setupTemeratureSensor();
  setupLamp();
  setupFan();
});

// Fake temperature updates


client.on("message", (topic, message) => {
  const rawMessage = message.toString();

  console.log("MQTT message received:", topic, rawMessage);

  if (handleLampMessage(topic, rawMessage)) {
    return;
  }
  if (handleFanMessage(topic, rawMessage)) {
    return;
  }
});

client.on("error", (error) => {
  console.error("MQTT error:", error);
});
