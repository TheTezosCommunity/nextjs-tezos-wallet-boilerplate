# nextjs-tezos-wallet-boilerplate

A modern, production-ready boilerplate for building Tezos dApps with Next.js.

## Tech Stack

-   Next.js 15 - React framework with server-side rendering
-   Tailwind CSS 4.1 - Utility-first CSS framework
-   AirGap Beacon 4.5.1 - Wallet connection and interaction
-   Taquito v21 - Tezos blockchain interaction library
-   shadcn/ui - Reusable UI components

## Features

-   🔐 Tezos wallet integration with Beacon
-   🎨 Modern UI with Tailwind CSS and shadcn
-   ⚡ Fast page loads with Next.js
-   🔧 Type-safe contract interactions
-   📱 Responsive design out of the box

## Getting Started

```bash
# Clone the repository
git clone https://github.com/skullzarmy/nextjs-tezos-wallet-boilerplate
```

Choose your preferred package manager:

```bash
# npm
npm install
npm run dev

# yarn
yarn install
yarn dev

# pnpm
pnpm install
pnpm dev

# bun
bun install
bun dev
```

## Project Structure

```text
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js App Router (pages, layouts, global styles)
│   ├── components/     # DApp-specific UI components
│   │   └── ui/         # shadcn/ui reusable UI primitives
│   └── lib/            # Utility functions and constants
├── next.config.ts      # Next.js configuration
├── tailwind.config.ts  # Tailwind CSS configuration
├── postcss.config.mjs  # PostCSS configuration
├── eslint.config.mjs   # ESLint configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Project metadata and scripts
```

## Environment Variables

Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_TEZOS_NETWORK=ghostnet
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
