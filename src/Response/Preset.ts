import { Address } from "./Address";
import { PresetAssignment } from "./PresetAssignment";

/**
 * Defines a preset.
 * @private
 */
export type Preset = Address & {
    /**
     * Preset name.
     */
    Name: string;

    /**
     * Parent node address.
     */
    Parent: Address;

    /**
     * Child preset assignment.
     */
    ChildPresetAssignment: PresetAssignment;

    /**
     * Current preset assignments.
     */
    PresetAssignments: Address[];

    /**
     * Assignements for fans.
     */
    FanSpeedAssignments: Address[];

    /**
     * Assignments for blinds.
     */
    TiltAssignments: Address[];

    /**
     * Assignments for dimmers.
     */
    DimmedLevelAssignments: Address[];

    /**
     * Assignments for favorites.
     */
    FavoriteCycleAssignments: Address[];

    /**
     * Assignments for track blinds.
     */
    NextTrackAssignments: Address[];

    /**
     * Assignments for sonos.
     */
    PauseAssignments: Address[];

    /**
     * Assignments for sonos.
     */
    PlayPauseToggleAssignments: Address[];

    /**
     * Assignments for track blinds.
     */
    RaiseLowerAssignments: Address[];

    /**
     * Assignments for track blinds.
     */
    ShadeLevelAssignments: Address[];

    /**
     * Assignments for sonos.
     */
    SonosPlayAssignments: Address[];

    /**
     * Assignments for switches.
     */
    SwitchedLevelAssignments: Address[];

    /**
     * Assignments for let strips.
     */
    WhiteTuningLevelAssignments: Address[];
};
