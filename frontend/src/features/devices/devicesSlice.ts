import {
    createAsyncThunk,
    createEntityAdapter,
    createSlice,
    type PayloadAction
} from "@reduxjs/toolkit";

import type { RootState } from "../../store/store";
import type { HomeAssistantEntity } from "./types";
import { getStates } from "../../services/homeAssistantApi";

const TRACKED_ENTITY_IDS = new Set([
    "sensor.living_room_temperature",
    "light.floor_lamp",
    "fan.living_room_fan"
]);

const devicesAdapter =
    createEntityAdapter<HomeAssistantEntity, string>({
        selectId: entity => entity.entity_id
    });

interface PendingCommand {
    expectedState: string;
}

const initialState = devicesAdapter.getInitialState({
    loading: false,
    error: null as string | null,

    pendingCommands: {} as Record<
        string,
        PendingCommand | undefined
    >
});

export const fetchDevices = createAsyncThunk(
    "devices/fetchDevices",
    async () => {
        return await getStates();
    }
);

const devicesSlice = createSlice({
    name: "devices",

    initialState,

    reducers: {
        updateEntity(
            state,
            action: PayloadAction<HomeAssistantEntity>
        ) {
            const entity = action.payload;

            if (!TRACKED_ENTITY_IDS.has(entity.entity_id)) {
                return;
            }

            devicesAdapter.upsertOne(state, entity);

            const pending =
                state.pendingCommands[entity.entity_id];

            if (
                pending &&
                entity.state === pending.expectedState
            ) {
                delete state.pendingCommands[
                    entity.entity_id
                ];
            }
        },

        commandStarted(
            state,
            action: PayloadAction<{
                entityId: string;
                expectedState: string;
            }>
        ) {
            const {
                entityId,
                expectedState
            } = action.payload;

            state.pendingCommands[entityId] = {
                expectedState
            };
        },

        commandFailed(
            state,
            action: PayloadAction<string>
        ) {
            delete state.pendingCommands[
                action.payload
            ];
        }
    },

    extraReducers: builder => {
        builder
            .addCase(fetchDevices.pending, state => {
                state.loading = true;
                state.error = null;
            })

            .addCase(
                fetchDevices.fulfilled,
                (state, action) => {
                    state.loading = false;

                    const trackedEntities =
                        action.payload.filter(entity =>
                            TRACKED_ENTITY_IDS.has(
                                entity.entity_id
                            )
                        );

                    devicesAdapter.setAll(
                        state,
                        trackedEntities
                    );
                }
            )

            .addCase(
                fetchDevices.rejected,
                (state, action) => {
                    state.loading = false;

                    state.error =
                        action.error.message ??
                        "Failed to load devices";
                }
            );
    }
});

export const {
    updateEntity,
    commandStarted,
    commandFailed
} = devicesSlice.actions;

export default devicesSlice.reducer;

export const devicesSelectors = devicesAdapter.getSelectors<RootState>(
    state => state.devices
);