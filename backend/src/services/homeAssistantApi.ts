import { HA_TOKEN, HA_URL } from "../config.js";

export async function getHomeAssistantStates() {
  const response = await fetch(
    `${HA_URL}/api/states`,
    {
      headers: {
        Authorization: `Bearer ${HA_TOKEN}`,
      }
    }
  )
  if (!response.ok) {
    throw new Error(
      `Failed to fetch Home Assistant states: ${response.status}`
    )
  }
  return response.json();
}

export async function callHomeAssistantService(
  domain: string,
  service: string,
  data: Record<string, unknown>
) {
  const response = await fetch(
    `${HA_URL}/api/services/${domain}/${service}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HA_TOKEN}`,
      },
      body: JSON.stringify(data)
    }
  )

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `Home Assistant service failed: ${response.status} ${body}`
    )
  }
  const text = await response.text();

if (!text) {
    return null;
  }

  return JSON.parse(text);
}