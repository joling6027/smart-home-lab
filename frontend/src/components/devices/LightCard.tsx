import {
  useDispatch, useSelector
} from 'react-redux';

import type {
  AppDispatch, RootState
} from '../../store/store';

import { commandStarted, commandFailed, commandTimedOut } from '../../features/devices/devicesSlice';

import type { HomeAssistantEntity } from "../../features/devices/types";
import { useEffect, useState, useRef } from 'react'
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

  const commandTimeoutRef = useRef<number | null>(null);

  const [sliderValue, setSliderValue] = useState(brightness);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const pendingCommand = useSelector(
    (state: RootState) => state.devices.pendingCommands[entity.entity_id]
  );

  const isUpdating = Boolean(pendingCommand);
  const reduxError = useSelector(
    (state: RootState) => state.devices.commandErrors[
      entity.entity_id
    ]
  )

  const debouncedSetLightBrightness = useDebouncedCallback(
    async (brightness: number) => {
      try {
        dispatch(
          commandStarted({
            entityId: entity.entity_id,
            type: "brightness",
            expectedValue: brightness
          })
        )

        await setLightBrightness(entity.entity_id, brightness);
      } catch (error) {
        dispatch(commandFailed({
          entityId: entity.entity_id,
          message: "Failed to update brightness."
        }))
      }
    },
    300
  )

  useEffect(() => {
    setSliderValue(brightness);
  }, [brightness]);

  useEffect(() => {
    return () => {
      if (commandTimeoutRef.current !== null) {
        clearTimeout(commandTimeoutRef.current);
      }
    }
  }, []);

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
      setError(null);

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
      }, 5000)

      if (isOn) {
        await turnOffLight(entity.entity_id)
      } else {
        await turnOnLight(entity.entity_id)
      }

    } catch (error) {

      if (commandTimeoutRef.current !== null) {
        clearTimeout(commandTimeoutRef.current);
      }

      dispatch(
        commandFailed({entityId: entity.entity_id, message: "Failed to update light."})
      )
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
        {(reduxError || error) && (
          <p role="alert">{reduxError || error}</p>
        )}
      </div>
    </article>
  )
}

