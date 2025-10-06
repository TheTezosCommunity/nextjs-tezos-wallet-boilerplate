/** @type {import('next').NextConfig} */

const nextConfig = {
  compiler: {
    // Remove all console logs
    removeConsole: false,
  },
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { 
        fs: false, 
        crypto: false,
        ...config.resolve.fallback 
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ipfs.io",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "ipfs.teia.cafe",
        pathname: "/ipfs/**",
      },

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
};

export default nextConfig;
