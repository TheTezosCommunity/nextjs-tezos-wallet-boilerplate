export const NETWORK = process.env.NEXT_PUBLIC_TEZOS_NETWORK || process.env.NEXT_PUBLIC_NETWORK || "shadownet";
export const ENV: "dev" | "prod" = NETWORK === "mainnet" ? "prod" : "dev";
