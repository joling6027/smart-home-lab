import { client } from "../mqttClient";

// fan
const STATE_TOPIC = "home/living-room/fan/state";
const COMMAND_TOPIC = "home/living-room/fan/set";
const SPEED_STATE_TOPIC = "home/living-room/fan/speed/state";
const SPEED_COMMAND_TOPIC = "home/living-room/fan/speed/set";

let fanState = "OFF";
let fanSpeed = 0;

export function setupFan() {
    client.publish(
        "homeassistant/fan/living_room_fan/config",
        JSON.stringify({
            name: "Fan",
            unique_id: "living_room_fan",
            state_topic: STATE_TOPIC,
            command_topic: COMMAND_TOPIC,
            payload_on: "ON",
            payload_off: "OFF",
            percentage_state_topic: SPEED_STATE_TOPIC,
            percentage_command_topic: SPEED_COMMAND_TOPIC,
            speed_range_min: 1,
            speed_range_max: 100
        }),
        { retain: true }
    );

    client.subscribe([
        COMMAND_TOPIC,
        SPEED_COMMAND_TOPIC
    ]);
};

export function handleFanMessage(
    topic: string,
    rawMessage: string
) {
    // fan
    if (topic === COMMAND_TOPIC) {
        const command = rawMessage.trim().toUpperCase();

        if (command !== "ON" && command !== "OFF") {
            return false;
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
            STATE_TOPIC,
            fanState,
            { retain: true }
        )
        client.publish(
            SPEED_STATE_TOPIC,
            fanSpeed.toString(),
            { retain: true }
        )
        return true;
    }

    if (topic === SPEED_COMMAND_TOPIC) {
        const speed = Number(rawMessage);

        if (
            Number.isNaN(speed) ||
            speed < 0 ||
            speed > 100
        ) {
            console.log("Invalid speed value: ", rawMessage);
            return false;
        }

        fanSpeed = speed;
        fanState = fanSpeed === 0 ? "OFF" : "ON";

        console.log(`Fan speed: ${fanSpeed}%`);
        console.log(`Fan: ${fanState}`);

        client.publish(
            SPEED_STATE_TOPIC,
            fanSpeed.toString(),
            { retain: true }
        );
        client.publish(
            STATE_TOPIC,
            fanState,
            { retain: true }
        );
        return true;
    }
    return false;
}