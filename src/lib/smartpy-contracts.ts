/**
 * SmartPy Contract Examples
 * Pre-compiled Michelson contracts for testing and deployment
 */

// Simple Counter Contract
export const counterContract = [
    {
        prim: "parameter",
        args: [
            {
                prim: "or",
                args: [
                    { prim: "unit", annots: ["%decrement"] },
                    {
                        prim: "or",
                        args: [
                            { prim: "int", annots: ["%increment"] },
                            { prim: "unit", annots: ["%reset"] },
                        ],
                    },
                ],
            },
        ],
    },
    {
        prim: "storage",
        args: [{ prim: "int" }],
    },
    {
        prim: "code",
        args: [
            [
                { prim: "UNPAIR" },
                {
                    prim: "IF_LEFT",
                    args: [
                        [{ prim: "DROP" }, { prim: "PUSH", args: [{ prim: "int" }, { int: "1" }] }, { prim: "SUB" }],
                        [
                            {
                                prim: "IF_LEFT",
                                args: [
                                    [{ prim: "ADD" }],
                                    [
                                        { prim: "DROP" },
                                        { prim: "DROP" },
                                        { prim: "PUSH", args: [{ prim: "int" }, { int: "0" }] },
                                    ],
                                ],
                            },
                        ],
                    ],
                },
                { prim: "NIL", args: [{ prim: "operation" }] },
                { prim: "PAIR" },
            ],
        ],
    },
];

// Calculator Contract
export const calculatorContract = [
    {
        prim: "parameter",
        args: [
            {
                prim: "or",
                args: [
                    {
                        prim: "pair",
                        args: [{ prim: "int" }, { prim: "int" }],
                        annots: ["%add"],
                    },
                    {
                        prim: "or",
                        args: [
                            {
                                prim: "pair",
                                args: [{ prim: "int" }, { prim: "int" }],
                                annots: ["%subtract"],
                            },
                            {
                                prim: "pair",
                                args: [{ prim: "int" }, { prim: "int" }],
                                annots: ["%multiply"],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        prim: "storage",
        args: [{ prim: "int" }],
    },
    {
        prim: "code",
        args: [
            [
                { prim: "UNPAIR" },
                {
                    prim: "IF_LEFT",
                    args: [
                        [{ prim: "UNPAIR" }, { prim: "ADD" }],
                        [
                            {
                                prim: "IF_LEFT",
                                args: [
                                    [{ prim: "UNPAIR" }, { prim: "SUB" }],
                                    [{ prim: "UNPAIR" }, { prim: "MUL" }],
                                ],
                            },
                        ],
                    ],
                },
                { prim: "NIL", args: [{ prim: "operation" }] },
                { prim: "PAIR" },
            ],
        ],
    },
];

// Simple Storage Contract (Key-Value Store)
export const storageContract = [
    {
        prim: "parameter",
        args: [
            {
                prim: "or",
                args: [
                    {
                        prim: "pair",
                        args: [{ prim: "string" }, { prim: "string" }],
                        annots: ["%store"],
                    },
                    { prim: "string", annots: ["%retrieve"] },
                ],
            },
        ],
    },
    {
        prim: "storage",
        args: [
            {
                prim: "big_map",
                args: [{ prim: "string" }, { prim: "string" }],
            },
        ],
    },
    {
        prim: "code",
        args: [
            [
                { prim: "UNPAIR" },
                {
                    prim: "IF_LEFT",
                    args: [
                        [
                            { prim: "UNPAIR" },
                            { prim: "SOME" },
                            { prim: "DIG", args: [{ int: "2" }] },
                            { prim: "UPDATE" },
                        ],
                        [{ prim: "DROP" }],
                    ],
                },
                { prim: "NIL", args: [{ prim: "operation" }] },
                { prim: "PAIR" },
            ],
        ],
    },
];

/* eslint-disable @typescript-eslint/no-explicit-any */

export type MichelsonCode = any[];

export interface SmartPyContract {
    name: string;
    description: string;
    code: MichelsonCode;
    initialStorage: number | string | Record<string, unknown>;
    entrypoints: {
        name: string;
        description: string;
        parameters: any;
        example: any;
    }[];
}

export const smartPyExamples: SmartPyContract[] = [
    {
        name: "Counter",
        description: "A simple counter that can be incremented, decremented, or reset",
        code: counterContract,
        initialStorage: 0,
        entrypoints: [
            {
                name: "increment",
                description: "Add a value to the counter",
                parameters: { prim: "int" },
                example: 5,
            },
            {
                name: "decrement",
                description: "Subtract 1 from the counter",
                parameters: { prim: "unit" },
                example: null,
            },
            {
                name: "reset",
                description: "Reset counter to 0",
                parameters: { prim: "unit" },
                example: null,
            },
        ],
    },
    {
        name: "Calculator",
        description: "A calculator that can add, subtract, and multiply two numbers",
        code: calculatorContract,
        initialStorage: 0,
        entrypoints: [
            {
                name: "add",
                description: "Add two numbers",
                parameters: { prim: "pair", args: [{ prim: "int" }, { prim: "int" }] },
                example: { prim: "Pair", args: [{ int: "10" }, { int: "5" }] },
            },
            {
                name: "subtract",
                description: "Subtract second number from first",
                parameters: { prim: "pair", args: [{ prim: "int" }, { prim: "int" }] },
                example: { prim: "Pair", args: [{ int: "10" }, { int: "3" }] },
            },
            {
                name: "multiply",
                description: "Multiply two numbers",
                parameters: { prim: "pair", args: [{ prim: "int" }, { prim: "int" }] },
                example: { prim: "Pair", args: [{ int: "4" }, { int: "7" }] },
            },
        ],
    },
    {
        name: "Storage",
        description: "A key-value store for storing and retrieving string data",
        code: storageContract,
        initialStorage: {},
        entrypoints: [
            {
                name: "store",
                description: "Store a key-value pair",
                parameters: { prim: "pair", args: [{ prim: "string" }, { prim: "string" }] },
                example: { prim: "Pair", args: [{ string: "mykey" }, { string: "myvalue" }] },
            },
            {
                name: "retrieve",
                description: "Retrieve a value by key (view-only)",
                parameters: { prim: "string" },
                example: { string: "mykey" },
            },
        ],
    },
];

// Helper functions for contract deployment
export const getContractByName = (name: string): SmartPyContract | undefined => {
    return smartPyExamples.find((contract) => contract.name.toLowerCase() === name.toLowerCase());
};

export const formatMichelsonParameter = (entrypoint: string, value: any, contract: SmartPyContract): any => {
    const ep = contract.entrypoints.find((e) => e.name === entrypoint);
    if (!ep) throw new Error(`Entrypoint ${entrypoint} not found`);

    switch (entrypoint) {
        case "increment":
            return { int: value.toString() };
        case "decrement":
        case "reset":
            return { prim: "Unit" };
        case "add":
        case "subtract":
        case "multiply":
            return {
                prim: "Pair",
                args: [{ int: value.left.toString() }, { int: value.right.toString() }],
            };
        case "store":
            return {
                prim: "Pair",
                args: [{ string: value.key }, { string: value.value }],
            };
        case "retrieve":
            return { string: value };
        default:
            return value;
    }
};
