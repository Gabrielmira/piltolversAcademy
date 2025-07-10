const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    experimental: {
        outputFileTracingIgnores: ["./generated/client/**/*"],
    } as any,
};

export default nextConfig;
