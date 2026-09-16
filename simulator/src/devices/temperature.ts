import { client } from "../mqttClient";

const TEMPERATURE_TOPIC = "home/living-room/temperature";

export function setupTemeratureSensor() {
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
}