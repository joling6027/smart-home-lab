import type { HomeAssistantEntity } from "../features/devices/types";

const HA_TOKEN = import.meta.env.VITE_HA_TOKEN;

async function callService(
    domain: string,
    service: string,
    data: Record<string, unknown>
) {
    const response = await fetch(
        `/api/services/${domain}/${service}`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${HA_TOKEN}`,
                "Content-type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );

    if (!response.ok) {
        throw new Error(
            `Failed to call ${domain}.${service}: ${response.status}`
        );
    }
    return response.json();
}

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

// lamp
export function turnOnLight(entityId: string) {
    return callService("light", "turn_on", {
        entity_id: entityId
    })
}

export function turnOffLight(entityId: string) {
    return callService("light", "turn_off", {
        entity_id: entityId
    })
}

export function setLightBrightness(entityId: string, brightness: number) {
    return callService("light", "turn_on", {
        entity_id: entityId,
        brightness
    })
}

// fan
export function turnOffFan(entityId: string) {
    return callService("fan", "turn_off", {
        entity_id: entityId
    });
}

export function turnOnFan(entityId: string) {
    return callService("fan", "turn_on", {
        entity_id: entityId
    });
}

export function setFanSpeed(entityId: string, percentage: number) {
    return callService("fan", "set_percentage", {
        entity_id: entityId,
        percentage
    });
}