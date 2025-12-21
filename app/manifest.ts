import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Sales Management System',
        short_name: 'SalesSystem',
        description: 'Complete sales tracking and management for your business',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ef4444',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
