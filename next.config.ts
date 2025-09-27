// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            // IPFS Gateways
            {
                protocol: "https",
                hostname: "ipfs.fileship.xyz",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "ipfs.io",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "gateway.pinata.cloud",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "cloudflare-ipfs.com",
                port: "",
                pathname: "/**",
            },
            // NFT Marketplaces & CDNs
            {
                protocol: "https",
                hostname: "media.bootloader.art",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "assets.objkt.media",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "objkt.media",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "cdn.fxhash.xyz",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "gateway.fxhash2.xyz",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "hen.teztools.io",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "teia.art",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "versum.xyz",
                port: "",
                pathname: "/**",
            },
            // Arweave
            {
                protocol: "https",
                hostname: "arweave.net",
                port: "",
                pathname: "/**",
            },
            // Wildcard for any HTTPS image source (most permissive)
            {
                protocol: "https",
                hostname: "**",
                port: "",
                pathname: "/**",
            },
        ],
    },
    webpack: (config, { isServer }) => {
        // Modify the config only for the server-side build.
        if (isServer) {
            config.externals.push({
                bufferutil: "bufferutil",
                "utf-8-validate": "utf-8-validate",
                encoding: "encoding",
                "pino-pretty": "pino-pretty",
            });
        }
        // Provide a fallback for the "fs" module (not available in browsers).
        config.resolve.fallback = { fs: false };
        return config;
    },
};

export default nextConfig;
