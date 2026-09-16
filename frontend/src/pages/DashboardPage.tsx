import { useSelector} from "react-redux";
import type { RootState } from "../store/store";

export default function DashboardPage() {
    const devices = useSelector(
        (state: RootState) => state.devices.items
    );

    return (
        <main>
            <h1>Smart Home</h1>
            <section>
                <h2>Living Room</h2>

                { devices.map(device => (
                    <div key={device.id}>
                        <strong>{device.name}</strong>
                        <p>{device.state}</p>
                    </div>
                ))}
            </section>
        </main>
    )
}