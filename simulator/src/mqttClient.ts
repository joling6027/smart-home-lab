import mqtt from "mqtt";

export const client = mqtt.connect("mqtt://localhost:1883", {
  clientId: "smart-home-simulator"
});