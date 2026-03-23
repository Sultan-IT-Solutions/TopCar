const path = require('path');

function getSupabaseRemotePatterns() {
    const patterns = [
        {
            protocol: 'https',
            hostname: '**.supabase.co',
            pathname: '/storage/v1/object/**',
        },
    ];

    const configuredUrls = [
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_URL,
    ].filter((value): value is string => Boolean(value));

    for (const value of configuredUrls) {
        try {
            const url = new URL(value);
            patterns.push({
                protocol: url.protocol.replace(':', ''),
                hostname: url.hostname,
                pathname: '/**',
            });
        } catch {
            // Ignore invalid URLs in env and keep the wildcard Supabase rule.
        }
    }

    return patterns;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    outputFileTracingRoot: path.join(__dirname, '..', '..'),
    distDir: process.env.NEXT_DIST_DIR || '.next',
    eslint: {
        ignoreDuringBuilds: true,
    },

    // Performance optimizations
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
        remotePatterns: getSupabaseRemotePatterns(),
        dangerouslyAllowSVG: true,
        contentDispositionType: 'inline',
        contentSecurityPolicy:
            "default-src 'self'; script-src 'none'; sandbox;",
    },

    // Compression
    compress: true,

    webpack(
        config: import('webpack').Configuration,
        { dev }: { dev: boolean }
    ) {
        if (dev) {
            config.cache = false;
        }

        return config;
    },

    // Headers для кеширования
    async headers() {
        const isProduction = process.env.NODE_ENV === 'production';

        if (!isProduction) {
            return [
                {
                    source: '/_next/static/:path*',
                    headers: [
                        {
                            key: 'Cache-Control',
                            value: 'no-store, no-cache, max-age=0, must-revalidate',
                        },
                        {
                            key: 'Pragma',
                            value: 'no-cache',
                        },
                        {
                            key: 'Expires',
                            value: '0',
                        },
                    ],
                },
            ];
        }

        return [
            {
                source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/_next/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
