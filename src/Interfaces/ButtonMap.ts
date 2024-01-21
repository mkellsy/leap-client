import { Button } from "./Button";

export const ButtonMap = new Map<string, Map<number, Button>>([
    [
        "Pico2Button",
        new Map([
            [0, { Label: "On", Index: 1, RaiseLower: false }],
            [2, { Label: "Off", Index: 2, RaiseLower: false }],
        ]),
    ],
    [
        "Pico2ButtonRaiseLower",
        new Map([
            [0, { Label: "On", Index: 1, RaiseLower: false }],
            [2, { Label: "Off", Index: 4, RaiseLower: false }],
            [3, { Label: "Raise", Index: 2, RaiseLower: true }],
            [4, { Label: "Lower", Index: 3, RaiseLower: true }],
        ]),
    ],
    [
        "Pico3Button",
        new Map([
            [0, { Label: "On", Index: 1, RaiseLower: false }],
            [1, { Label: "Center", Index: 2, RaiseLower: false }],
            [2, { Label: "Off", Index: 3, RaiseLower: false }],
        ]),
    ],
    [
        "Pico3ButtonRaiseLower",
        new Map([
            [0, { Label: "On", Index: 1, RaiseLower: false }],
            [1, { Label: "Center", Index: 3, RaiseLower: false }],
            [2, { Label: "Off", Index: 5, RaiseLower: false }],
            [3, { Label: "Raise", Index: 2, RaiseLower: true }],
            [4, { Label: "Lower", Index: 4, RaiseLower: true }],
        ]),
    ],
    [
        "Pico4Button2Group",
        new Map([
            [1, { Label: "Group 1 On", Index: 1, RaiseLower: false }],
            [2, { Label: "Group 1 Off", Index: 2, RaiseLower: false }],
            [3, { Label: "Group 2 On", Index: 3, RaiseLower: false }],
            [4, { Label: "Group 2 Off", Index: 4, RaiseLower: false }],
        ]),
    ],
    [
        "Pico4ButtonScene",
        new Map([
            [1, { Label: "Button 1", Index: 1, RaiseLower: false }],
            [2, { Label: "Button 2", Index: 2, RaiseLower: false }],
            [3, { Label: "Button 3", Index: 3, RaiseLower: false }],
            [4, { Label: "Button 4", Index: 4, RaiseLower: false }],
        ]),
    ],
    [
        "Pico4ButtonZone",
        new Map([
            [1, { Label: "Button 1", Index: 1, RaiseLower: false }],
            [2, { Label: "Button 2", Index: 2, RaiseLower: false }],
            [3, { Label: "Button 3", Index: 3, RaiseLower: false }],
            [4, { Label: "Button 4", Index: 4, RaiseLower: false }],
        ]),
    ],
    [
        "PaddleSwitchPico",
        new Map([
            [0, { Label: "On", Index: 1, RaiseLower: false }],
            [2, { Label: "Off", Index: 2, RaiseLower: false }],
        ]),
    ],
    [
        "Pico4Button",
        new Map([
            [1, { Label: "Button 1", Index: 1, RaiseLower: false }],
            [2, { Label: "Button 2", Index: 2, RaiseLower: false }],
            [3, { Label: "Button 3", Index: 3, RaiseLower: false }],
            [4, { Label: "Button 4", Index: 4, RaiseLower: false }],
        ])
    ]
]);
