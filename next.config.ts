import { NextConfig } from "next";
const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin')

const nextConfig: NextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },

    experimental: {
        outputFileTracingIgnores: ["./generated/client/**/*"],
    } as any,

    webpack: (config, { isServer }) => {
        if (isServer) {
            config.plugins = [...config.plugins, new PrismaPlugin()]
        }
        return config
    },
}

export default nextConfig

