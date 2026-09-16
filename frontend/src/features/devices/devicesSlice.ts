import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Device } from "./types";

interface DevicesState {
    items: Device[];
}

const initialState: DevicesState = {
    items: [
        {
            id: "light.floor_lamp",
            name: "Floor Lamp",
            type: "light",
            state: "off"
        },
        {
            id: "fan.living_room_fan",
            name: "Living Room Fan",
            type: "fan",
            state: "off"
        },
        {
            id: "sensor.living_room_temperature",
            name: "Living Room Temperature",
            type: "sensor",
            state: "22.5"
        }
    ],
};

const devicesSlice = createSlice({
    name: "devices",
    initialState,
    reducers: {
        updateDeviceState(
            state,
            action: PayloadAction<{ id: string; state: string }>
        ) {
            const device = state.items.find(
                item => item.id === action.payload.id
            );

            if (device) {
                device.state = action.payload.state;
            }
        }
    }
});

export const { updateDeviceState } = devicesSlice.actions;
export default devicesSlice.reducer;