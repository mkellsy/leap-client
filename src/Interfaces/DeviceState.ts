export interface DeviceState {
    state: "Open" | "Closed" | "On" | "Off" | "Unknown";
    speed?: "High" | "MediumHigh" | "Medium" | "Low" | "Off";
    level?: number;
    tilt?: number;
}
