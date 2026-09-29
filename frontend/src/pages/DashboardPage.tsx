import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import type {
    AppDispatch,
    RootState
} from "../store/store";

import { devicesSelectors, fetchDevices } from "../features/devices/devicesSlice";
import { connectHomeAssistantSocket } from "../services/homeAssistantSocket";

import LightCard from "../components/devices/LightCard";
import FanCard from "../components/devices/FanCard";
import SensorCard from "../components/devices/SensorCard";

export default function DashboardPage() {
    const dispatch = useDispatch<AppDispatch>();

    const entities = useSelector(devicesSelectors.selectAll);
    const loading = useSelector((state: RootState) => state.devices.loading);
    const error = useSelector((state: RootState) => state.devices.error);

    useEffect(() => {
        dispatch(fetchDevices());

        const socket = connectHomeAssistantSocket(dispatch);
        return () => {
            socket.close();
        }
    }, [dispatch]);

    if (loading) {
        return <p>Loading devices...</p>;
    }

    if (error) {
        return <p>{error}</p>
    }

    return (
        <main>
            <h1>Smart Home</h1>

            {entities.map(entity => {
                if (entity.entity_id.startsWith("light.")) {
                    return (
                        <LightCard
                            key={entity.entity_id}
                            entity={entity}
                        />
                    )
                }

                if (entity.entity_id.startsWith("fan.")) {
                    return (
                        <FanCard
                            key={entity.entity_id}
                            entity={entity}
                        />
                    )
                }

                if (entity.entity_id.startsWith("sensor.")) {
                    return (
                        <SensorCard
                            key={entity.entity_id}
                            entity={entity}
                        />
                    )
                }

                return null;
            })}
        </main>
    )
}