import { Address } from "./Address";
import { AssociatedArea } from "./AssociatedArea";
import { AssociatedSensor } from "./AssociatedSensor";

/**
 * Defines a group of occupancy sensors.
 */
export type OccupancyGroup = Address & {
    /**
     * Assigned area addresses.
     */
    AssociatedAreas?: AssociatedArea[];

    /**
     * Assigned sensor addresses.
     */
    AssociatedSensors?: AssociatedSensor[];

    /**
     * Sensor group programming model.
     */
    ProgrammingModel?: Address;

    /**
     * Sensor group programming type.
     */
    ProgrammingType?: string;

    /**
     * Sensor enabled/disabled schedule
     */
    OccupiedActionSchedule?: { ScheduleType: string };

    /**
     * Sensor enabled/disabled schedule
     */
    UnoccupiedActionSchedule?: { ScheduleType: string };
};
