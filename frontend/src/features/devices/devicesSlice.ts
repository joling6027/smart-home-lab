import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
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

export const fetchDevices = createAsyncThunk(
    "devices/fetchDevices",
    async () => {
        return await getStates();
    }
)

const devicesSlice = createSlice({
    name: "devices",
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchDevices.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDevices.fulfilled, (state, action) => {
                state.loading = false;
                state.entities = action.payload;
            })
            .addCase(fetchDevices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Failed to fetch devices";
            });
    }
});

export default devicesSlice.reducer;