import type { HomeAssistantEntity } from "../../features/devices/types";
import { useEffect, useState } from 'react'
import {
  turnOnLight,
  turnOffLight,
  setLightBrightness
} from "../../services/homeAssistantApi";

import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";

interface LightCardProps {
  entity: HomeAssistantEntity;
}

export default function LightCard({
  entity
}: LightCardProps) {
  const isOn = entity.state === "on";

  const brightness =
    typeof entity.attributes?.brightness === "number"
    ? entity.attributes.brightness
    : 0;

  const [sliderValue, setSliderValue] = useState(brightness);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSetLightBrightness = useDebouncedCallback(
    async (brightness: number) => {
      try {
        setError(null);

        await setLightBrightness(entity.entity_id, brightness);
      } catch (error) {
        console.error("Failed to change light brightness");
        setError("Failed to update light brightness");
      }
    },
    300
  )

  useEffect(() => {
    setSliderValue(brightness);
  }, [brightness]);

  async function handleToggle() {
    try {
      setIsUpdating(true);
      setError(null);

      if (isOn) {
        await turnOffLight(entity.entity_id)
      } else {
        await turnOnLight(entity.entity_id)
      }
    } catch (error) {
      console.error("Failed to toggle light:", error);

      setError("Failed to update light.");
    } finally {
      setIsUpdating(false);
    }
  }
  function handleBrightnessChange(
    value: number
  ) {

    setSliderValue(value);
    debouncedSetLightBrightness(value);
  }

  return (
    <article>
      <h3>
        {entity.attributes?.friendly_name ?? entity.entity_id}
      </h3>

      <button onClick={handleToggle} disabled={isUpdating}>
        {isUpdating ? "Updating..." 
          : isOn 
            ? "Turn Off" 
            : "Turn On"}
      </button>

      <div>
        <label>
          Brightness: {sliderValue}
        </label>

        <input
          type="range"
          min="0"
          max="255"
          value={sliderValue}
          onChange={event => handleBrightnessChange(
            Number(event.target.value)
          )}
        ></input>
        {error && (
          <p role="alert">{error}</p>
        )}
      </div>
    </article>
  )
}


