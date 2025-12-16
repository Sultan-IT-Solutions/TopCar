import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Define the base URL of your site
  const siteUrl = 'https://topcar.club';

  // Static routes according to requirements
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date('2025-08-30'),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/autopark`,
      lastModified: new Date('2025-08-30'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/services`,
      lastModified: new Date('2025-08-30'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/contacts`,
      lastModified: new Date('2025-08-30'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date('2025-08-30'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified: new Date('2025-08-30'),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  return staticRoutes;
}