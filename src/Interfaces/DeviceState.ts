export interface DeviceState {
    state: "Open" | "Closed" | "On" | "Off" | "Unknown" | "Occupied" | "Unoccupied";
    speed?: "High" | "MediumHigh" | "Medium" | "Low" | "Off";
    level?: number;
    tilt?: number;
}
