import {
  useEffect,
  useState
} from "react";

import type { HomeAssistantEntity } from "../../features/devices/types";

import {
  turnOnFan,
  turnOffFan,
  setFanSpeed
} from "../../services/homeAssistantApi";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";

interface FanCardProps {
  entity: HomeAssistantEntity;
}

export default function FanCard({
  entity
}: FanCardProps) {
  const isOn = entity.state === "on";

  const percentage =
    typeof entity.attributes?.percentage === "number"
      ? entity.attributes.percentage
      : 0;

  const [sliderValue, setSliderValue] = useState(percentage);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sliderError, setSliderError] = useState<string | null>(null);

  const debouncedSetFanSpeed = useDebouncedCallback(
    async (speed: number) => {
      try {
        setSliderError(null);

        await setFanSpeed(
          entity.entity_id,
          speed
        );
      } catch (error) {
        console.error(
          "Failed to change fan speed:",
          error
        );
      }
    }, 300
  )

  useEffect(() => {
    setSliderValue(percentage);
  },[percentage]);

  async function handleToggle() {
    try {
      setIsUpdating(true);
      setSliderError(null);

      if (isOn) {
        await turnOffFan(entity.entity_id)
      } else {
        await turnOnFan(entity.entity_id)
      }
    } catch (error) {
      console.error("Failed to toggle fan:", error);

      setSliderError("Failed to update fan.");
    } finally {
      setIsUpdating(false);
    }
  }

  function handleSpeedChange(
    speed: number
  ) {
    setSliderValue(speed);

    debouncedSetFanSpeed(speed);
  }

  return (
    <article>
      <h3>
        {entity.attributes?.friendly_name ??
          entity.entity_id}
      </h3>

      <button onClick={handleToggle}>
        {isUpdating ? "Updating..." 
          : isOn 
            ? "Turn Off" 
            : "Turn On"}
      </button>

      <div>
        <label>
          Speed: {sliderValue}%
        </label>

        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={event =>
            handleSpeedChange(
              Number(event.target.value)
            )
          }
        />
        {sliderError && (
          <p role="alert">{sliderError}</p>
        )}
      </div>
    </article>
  );
}