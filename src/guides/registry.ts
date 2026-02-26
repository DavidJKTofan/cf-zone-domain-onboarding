// src/guides/registry.ts

import type { GuideCategory, GuideMetadata, ProductCategory } from './types';

export const GUIDE_CATEGORIES: GuideCategory[] = [
    {
        id: 'application-services',
        title: 'Application Services',
        description: 'CDN, DNS, SSL/TLS, WAF, DDoS protection, and performance optimization for web applications.',
        icon: 'globe',
        color: '#f6821f',
        guides: [
            {
                id: 'zero-downtime-migration',
                slug: 'zero-downtime-migration',
                title: 'Zero-Downtime Domain Migration',
                shortTitle: 'Domain Migration',
                description: 'Migrate your domain to Cloudflare with zero downtime using Partial (CNAME) Setup transitioning to Full Setup.',
                category: 'application-services',
                status: 'available',
                icon: 'arrow-right-circle',
                estimatedDuration: '2-4 hours',
                tags: ['dns', 'migration', 'ssl', 'proxy'],
                version: '2026.2',
            },
            {
                id: 'cloudflare-for-saas',
                slug: 'cloudflare-for-saas',
                title: 'Cloudflare for SaaS & Custom Hostnames',
                shortTitle: 'Custom Hostnames',
                description: 'Extend security and performance benefits to your customers via their own custom or vanity domains.',
                category: 'application-services',
                status: 'available',
                icon: 'users',
                estimatedDuration: '2-4 hours',
                tags: ['saas', 'custom-hostnames', 'ssl', 'vanity-domains'],
                version: '2026.2',
            },
        ],
    },
    {
        id: 'cloudflare-one',
        title: 'Cloudflare One',
        description: 'SASE platform combining Zero Trust security with network connectivity services.',
        icon: 'shield',
        color: '#6366f1',
        guides: [
            {
                id: 'sase-onboarding',
                slug: 'sase-onboarding',
                title: 'SASE & Zero Trust Onboarding',
                shortTitle: 'SASE Onboarding',
                description: 'Deploy Cloudflare One SASE platform with Zero Trust security for your organization.',
                category: 'cloudflare-one',
                status: 'available',
                icon: 'shield-check',
                estimatedDuration: '2-4 weeks',
                tags: ['sase', 'zero-trust', 'ztna', 'swg', 'vpn-replacement'],
                version: '2026.2',
                draft: true,
            },
        ],
    },
    {
        id: 'developer-platform',
        title: 'Developer Platform',
        description: 'Build and deploy serverless applications with Workers, Pages, R2, D1, and more.',
        icon: 'code',
        color: '#10b981',
        guides: [],
    },
];

export function getGuideBySlug(slug: string): GuideMetadata | undefined {
    for (const category of GUIDE_CATEGORIES) {
        const guide = category.guides.find((g) => g.slug === slug);
        if (guide) return guide;
    }
    return undefined;
}

export function getGuidesByCategory(categoryId: ProductCategory): GuideMetadata[] {
    const category = GUIDE_CATEGORIES.find((c) => c.id === categoryId);
    return category?.guides ?? [];
}

export function getCategoryById(categoryId: ProductCategory): GuideCategory | undefined {
    return GUIDE_CATEGORIES.find((c) => c.id === categoryId);
}
