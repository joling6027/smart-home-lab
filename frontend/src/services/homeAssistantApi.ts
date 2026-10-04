import type { HomeAssistantEntity } from "../features/devices/types";

// async function callService(
//     domain: string,
//     service: string,
//     data: Record<string, unknown>
// ) {
//     const response = await fetch(
//         `/api/services/${domain}/${service}`,
//         {
//             method: "POST",
//             headers: {
//                 "Content-type": "application/json"
//             },
//             body: JSON.stringify(data)
//         }
//     );

//     if (!response.ok) {
//         throw new Error(
//             `Failed to call ${domain}.${service}: ${response.status}`
//         );
//     }
//     return response.json();
// }

async function postJson(
  url: string,
  body?: Record<string, unknown>
): Promise<void> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: body
      ? JSON.stringify(body)
      : undefined
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      `Request failed: ${response.status} ${message}`
    );
  }
}

export async function getStates(): Promise<HomeAssistantEntity[]> {
    const response = await fetch("/api/devices", {
        headers: {
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
    return postJson(`/api/devices/light/${encodeURIComponent(entityId)}/on`);
}

export function turnOffLight(entityId: string) {
    return postJson(`/api/devices/light/${encodeURIComponent(entityId)}/off`);
}

export function setLightBrightness(entityId: string, brightness: number) {
    return postJson(
    `/api/devices/light/${encodeURIComponent(entityId)}/brightness`,
    { brightness }
  );
}

// fan
export function turnOffFan(entityId: string) {
    return postJson(
    `/api/devices/fan/${encodeURIComponent(entityId)}/off`
  );
}

export function turnOnFan(entityId: string) {
    return postJson(
    `/api/devices/fan/${encodeURIComponent(entityId)}/on`
  );
}

export function setFanSpeed(entityId: string, percentage: number) {
    return postJson(
    `/api/devices/fan/${encodeURIComponent(entityId)}/percentage`,
    { percentage }
  );
}
