export interface DeviceState {
    state:
        | "On"
        | "Off"
        | "Open"
        | "Closed"
        | "Heat"
        | "Cool"
        | "Auto"
        | "Occupied"
        | "Unoccupied"
        | "Unknown";
    speed?: number;
    level?: number;
    tilt?: number;
    temprature?: number;
}
