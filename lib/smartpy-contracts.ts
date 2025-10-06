/**
 * SmartPy Contract Examples
 * Simple contract templates for deployment and interaction
 */

export interface SmartPyEntrypoint {
    name: string;
    parameters?: string;
    description?: string;
    example?: string | object;
}

export interface SmartPyContract {
    name: string;
    description: string;
    code: object;
    initialStorage: unknown;
    entrypoints: SmartPyEntrypoint[];
}

// Simple counter contract example
const counterContract: SmartPyContract = {
    name: "Simple Counter",
    description: "A basic counter contract with increment, decrement, and reset operations",
    code: [
        {
            prim: "parameter",
            args: [
                {
                    prim: "or",
                    args: [
                        { prim: "unit", annots: ["%increment"] },
                        { prim: "or", args: [{ prim: "unit", annots: ["%decrement"] }, { prim: "unit", annots: ["%reset"] }] }
                    ]
                }
            ]
        },
        { prim: "storage", args: [{ prim: "int" }] },
        {
            prim: "code",
            args: [
                [
                    { prim: "UNPAIR" },
                    {
                        prim: "IF_LEFT",
                        args: [
                            [{ prim: "DROP" }, { prim: "PUSH", args: [{ prim: "int" }, { int: "1" }] }, { prim: "ADD" }],
                            [
                                {
                                    prim: "IF_LEFT",
                                    args: [
                                        [{ prim: "DROP" }, { prim: "PUSH", args: [{ prim: "int" }, { int: "1" }] }, { prim: "SUB" }],
                                        [{ prim: "DROP" }, { prim: "DROP" }, { prim: "PUSH", args: [{ prim: "int" }, { int: "0" }] }]
                                    ]
                                }
                            ]
                        ]
                    },
                    { prim: "NIL", args: [{ prim: "operation" }] },
                    { prim: "PAIR" }
                ]
            ]
        }
    ],
    initialStorage: 0,
    entrypoints: [
        { name: "increment", description: "Increment counter by 1" },
        { name: "decrement", description: "Decrement counter by 1" },
        { name: "reset", description: "Reset counter to 0" }
    ]
};

// Simple storage contract example
const storageContract: SmartPyContract = {
    name: "Key-Value Storage",
    description: "Store and retrieve string values",
    code: [
        {
            prim: "parameter",
            args: [{ prim: "string" }]
        },
        { prim: "storage", args: [{ prim: "string" }] },
        {
            prim: "code",
            args: [
                [
                    { prim: "CAR" },
                    { prim: "NIL", args: [{ prim: "operation" }] },
                    { prim: "PAIR" }
                ]
            ]
        }
    ],
    initialStorage: { string: "" },
    entrypoints: [
        { name: "default", parameters: "string", description: "Store a string value" }
    ]
};

export const smartPyExamples: SmartPyContract[] = [
    counterContract,
    storageContract
];

export function formatMichelsonParameter(param: unknown): string {
    if (typeof param === "object") {
        return JSON.stringify(param, null, 2);
    }
    return String(param);
}
