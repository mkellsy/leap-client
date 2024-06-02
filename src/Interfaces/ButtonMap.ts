export const ButtonMap = new Map<string, Map<number, (number | boolean)[]>>([
    [
        "Pico2Button",
        new Map([
            [0, [1, false]],
            [2, [2, false]],
        ]),
    ],
    [
        "Pico2ButtonRaiseLower",
        new Map([
            [0, [1, false]],
            [2, [4, false]],
            [3, [2, true]],
            [4, [3, true]],
        ]),
    ],
    [
        "Pico3Button",
        new Map([
            [0, [1, false]],
            [1, [2, false]],
            [2, [3, false]],
        ]),
    ],
    [
        "Pico3ButtonRaiseLower",
        new Map([
            [0, [1, false]],
            [1, [3, false]],
            [2, [5, false]],
            [3, [2, true]],
            [4, [4, true]],
        ]),
    ],
    [
        "Pico4Button2Group",
        new Map([
            [1, [1, false]],
            [2, [2, false]],
            [3, [3, false]],
            [4, [4, false]],
        ]),
    ],
    [
        "Pico4ButtonScene",
        new Map([
            [1, [1, false]],
            [2, [2, false]],
            [3, [3, false]],
            [4, [4, false]],
        ]),
    ],
    [
        "Pico4ButtonZone",
        new Map([
            [1, [1, false]],
            [2, [2, false]],
            [3, [3, false]],
            [4, [4, false]],
        ]),
    ],
    [
        "PaddleSwitchPico",
        new Map([
            [0, [1, false]],
            [2, [2, false]],
        ]),
    ],
    [
        "Pico4Button",
        new Map([
            [1, [1, false]],
            [2, [2, false]],
            [3, [3, false]],
            [4, [4, false]],
        ]),
    ],
]);
