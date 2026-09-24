import type { HomeAssistantEntity } from "../../features/devices/types";
import { useEffect, useRef, useState } from 'react'
import {
  turnOnLight,
  turnOffLight,
  setLightBrightness
} from "../../services/homeAssistantApi";

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
  const timerRef = useRef<ReturnType<typeof setTimeout | null>>(null);

  useEffect(() => {
    setSliderValue(brightness);
  }, [brightness]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }
  })

  async function handleToggle() {
    try {
      if (isOn) {
        await turnOffLight(entity.entity_id)
      } else {
        await turnOnLight(entity.entity_id)
      }
    } catch (error) {
      console.error("Failed to toggle light:", error);
    }
  }
  async function handleBrightnessChange(
    value: number
  ) {

    setSliderValue(value);

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(async () => {
      try {
        await setLightBrightness(
          entity.entity_id,
          value
        );
      } catch (error) {
        console.error(
          "Failed to change brightness:",
          error
        );
      }
    }, 300)
  }

  return (
    <article>
      <h3>
        {entity.attributes?.friendly_name ?? entity.entity_id}
      </h3>

      <button onClick={handleToggle}>
        {isOn? "Turn Off" : "Turn On"}
      </button>

      <div>
        <label>
          Brightness: {brightness}
        </label>

        <input
          type="range"
          min="0"
          max="255"
          value={brightness}
          onChange={event => handleBrightnessChange(
            Number(event.target.value)
          )}
        ></input>
      </div>
    </article>
  )
}


