export interface DeviceState {
    state: "Open" | "Closed" | "On" | "Off" | "Unknown";
    availability: "Available" | "Unavailable" | "Mixed" | "Unknown";
    speed?: "High" | "MediumHigh" | "Medium" | "Low" | "Off";
    level?: number;
    tilt?: number;
}
