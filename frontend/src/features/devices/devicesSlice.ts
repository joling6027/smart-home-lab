import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { HomeAssistantEntity } from "./types";
import { getStates } from "../../services/homeAssistantApi";

interface DevicesState {
    entities: HomeAssistantEntity[];
    loading: boolean;
    error: string | null;
}

const initialState: DevicesState = {
    entities: [],
    loading: false,
    error: null
};

const TRACKED_ENTITY_IDS = new Set([
    "sensor.living_room_temperature",
    "light.floor_lamp",
    "fan.fan"
]);

export const fetchDevices = createAsyncThunk(
    "devices/fetchDevices",
    async () => {
        return await getStates();
    }
)

const devicesSlice = createSlice({
    name: "devices",
    initialState,
    reducers: {
        updateEntity(
            state,
            action: PayloadAction<HomeAssistantEntity>
        ) {
            const entity = action.payload;

            console.log(
                "Redux updating entity:",
                entity.entity_id,
                entity.state,
                entity.attributes
            );
            
            const index = state.entities.findIndex(
                item => item.entity_id === entity.entity_id
            );
            if (index === -1) {
                return;
            }
            state.entities[index] = entity;
        }
    },
    extraReducers: builder => {
        builder
            .addCase(fetchDevices.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDevices.fulfilled, (state, action) => {
                state.loading = false;
                state.entities = action.payload.filter(entity => 
                    TRACKED_ENTITY_IDS.has(entity.entity_id)
                );
            })
            .addCase(fetchDevices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Failed to fetch devices";
            });
    }
});

export default devicesSlice.reducer;
export const { updateEntity } = devicesSlice.actions;