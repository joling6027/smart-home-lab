export interface Device {
    id: string;
    name: string;
    type: "light" | "fan" | "sensor";
    state: string;
}