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
    "fan.fan"
]);

const devicesAdapter =
    createEntityAdapter<HomeAssistantEntity, string>({
        selectId: entity => entity.entity_id
    });

interface PendingCommand {
    type: "state" | "brightness" | "percentage";
    expectedValue: string | number;
    startedAt: number;
}

const initialState = devicesAdapter.getInitialState({
    loading: false,
    error: null as string | null,

    pendingCommands: {} as Record<
        string,
        PendingCommand | undefined
    >,

    commandErrors: {} as Record<
        string,
        string | undefined
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

            if (!pending) return;

            let confirmed = false;

            if (
                pending.type === "state" &&
                entity.state === pending.expectedValue
            ) {
                confirmed = true;
            }

            if (pending.type === "brightness" &&
                entity.attributes?.brightness === pending.expectedValue
            ) {
                confirmed = true;
            }

            if (confirmed) {
                delete state.pendingCommands[entity.entity_id];
                delete state.commandErrors[entity.entity_id];
            }
        },

        commandStarted(
            state,
            action: PayloadAction<{
                entityId: string;
                type: PendingCommand["type"];
                expectedValue: string | number;
            }>
        ) {
            const {
                entityId,
                type,
                expectedValue
            } = action.payload;

            state.pendingCommands[entityId] = {
                type,
                expectedValue,
                startedAt: Date.now()
            };

            delete state.commandErrors[entityId];
        },

        commandFailed(
            state,
            action: PayloadAction<{
                entityId: string;
                message: string;
            }>
        ) {
            const {
                entityId,
                message
            } = action.payload;

            delete state.pendingCommands[entityId];
            state.commandErrors[entityId] = message;
        },

        commandTimedOut(
            state,
            action: PayloadAction<string>
        ) {
            const entityId = action.payload;

            if (!state.pendingCommands[entityId]) {
                return;
            }

            delete state.pendingCommands[entityId];

            state.commandErrors[entityId] = "The device did not confirm the change.";
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
    commandFailed,
    commandTimedOut
} = devicesSlice.actions;

export default devicesSlice.reducer;

export const devicesSelectors = devicesAdapter.getSelectors<RootState>(
    state => state.devices
);