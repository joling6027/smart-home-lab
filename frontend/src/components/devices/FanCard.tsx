import {
  useDispatch, useSelector
} from 'react-redux';

import type {
  AppDispatch, RootState
} from '../../store/store';

import {
  useEffect,
  useState,
  useRef
} from "react";

import { commandStarted, commandFailed, commandTimedOut } from '../../features/devices/devicesSlice';
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

  const commandTimeoutRef = useRef<number | null>(null);

  const [sliderValue, setSliderValue] = useState(percentage);
  const [sliderError, setSliderError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const pendingCommand = useSelector(
    (state: RootState) => state.devices.pendingCommands[entity.entity_id]
  )

  const isUpdating = Boolean(pendingCommand);

  const debouncedSetFanSpeed = useDebouncedCallback(
    async (speed: number) => {
      try {
        dispatch(
          commandStarted({
            entityId: entity.entity_id,
            type: "percentage",
            expectedValue: speed
          })
        )

        await setFanSpeed(
          entity.entity_id,
          speed
        );
      } catch (error) {
        dispatch(commandFailed({
          entityId: entity.entity_id,
          message: "Failed to update speed."
        }))
      }
    }, 300
  )

  useEffect(() => {
    setSliderValue(percentage);
  },[percentage]);

  useEffect(() => {
    return () => {
      if (commandTimeoutRef.current !== null) {
        clearTimeout(commandTimeoutRef.current);
      }
    }
  },[])

  useEffect(() => {
    if (!pendingCommand &&
      commandTimeoutRef.current !== null
    ) {
      clearTimeout(commandTimeoutRef.current);
      commandTimeoutRef.current = null;
    }
  },[pendingCommand])

  async function handleToggle() {
    const expectedState = isOn ? "off": "on";

    try {
      setSliderError(null);

      dispatch(
        commandStarted({
          entityId: entity.entity_id,
          type: "state",
          expectedValue: expectedState
        })
      );

      commandTimeoutRef.current = window.setTimeout(() => {
        dispatch(
          commandTimedOut(entity.entity_id)
        )
      },5000)

      if (isOn) {
        await turnOffFan(entity.entity_id)
      } else {
        await turnOnFan(entity.entity_id)
      }
    } catch (error) {
      if (commandTimeoutRef.current !== null) {
        clearTimeout(commandTimeoutRef.current);
      }

      dispatch(
        commandFailed({ entityId: entity.entity_id, message: "Failed to update speed." })
      )
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