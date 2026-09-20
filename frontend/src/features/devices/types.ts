// export interface Device {
//     id: string;
//     name: string;
//     type: "light" | "fan" | "sensor";
//     state: string;
// }

export interface HomeAssistantEntity {
    entity_id: string;
    state: string;

    attibutes: {
        friendly_name?: string;
        unit_of_measurement?: string;
        brightness?: number;
        percentage?: number;

        [key: string]: unknown;
    };

    last_changed: string;
    last_updated: string;
}