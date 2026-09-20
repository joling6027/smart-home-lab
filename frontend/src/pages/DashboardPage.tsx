import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import type {
    AppDispatch,
    RootState
} from "../store/store";

import { fetchDevices } from "../features/devices/devicesSlice";

export default function DashboardPage() {
    const dispatch = useDispatch<AppDispatch>();

    const { entities, loading, error } = useSelector((state: RootState) => state.devices);

    useEffect(() => {
        dispatch(fetchDevices());
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

            {entities.map(entity => (
                <div key={entity.entity_id}>
                    <strong>
                        {entity.attibutes.friendly_name ?? entity.entity_id}
                    </strong>
                    <div>{entity.state}</div>
                </div>
            ))}
        </main>
    )
}