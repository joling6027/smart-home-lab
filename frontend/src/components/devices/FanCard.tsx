import {
  useEffect,
  useRef,
  useState
} from "react";

import type { HomeAssistantEntity } from "../../features/devices/types";

import {
  turnOnFan,
  turnOffFan,
  setFanSpeed
} from "../../services/homeAssistantApi";

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
  const timerRef = useRef<ReturnType<typeof setTimeout | null>>(null);

  useEffect(() => {
    setSliderValue(percentage);
  },[percentage]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }
  },[])

  async function handleToggle() {
    try {
      if (isOn) {
        await turnOffFan(entity.entity_id)
      } else {
        await turnOnFan(entity.entity_id)
      }
    } catch (error) {
      console.error("Failed to toggle fan:", error);
    }
  }

  async function handleSpeedChange(
    speed: number
  ) {
    setSliderValue(speed);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Wait until the user pauses
    timerRef.current = setTimeout(async () => {
      try {
        await setFanSpeed(
          entity.entity_id,
          speed
        );
      } catch (error) {
        console.error(
          "Failed to change speed:",
          error
        );
      }
    })
  }

  return (
    <article>
      <h3>
        {entity.attributes?.friendly_name ??
          entity.entity_id}
      </h3>

      <button onClick={handleToggle}>
        {isOn ? "Turn Off" : "Turn On"}
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
      </div>
    </article>
  );
}