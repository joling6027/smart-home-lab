import type { HomeAssistantEntity } from "../features/devices/types";

const HA_TOKEN = import.meta.env.VITE_HA_TOKEN;

export async function getStates(): Promise<HomeAssistantEntity[]> {
    const response = await fetch("/api/states", {
        headers: {
            Authorization: `Bearer ${HA_TOKEN}`,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(
            `Failed to fetch Home Assistant states: ${response.status}`
        )
    }

    return response.json();
}