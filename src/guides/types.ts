// src/guides/types.ts

export type GuideStatus = 'available' | 'coming-soon' | 'beta';

export type ProductCategory = 
    | 'application-services'
    | 'cloudflare-one'
    | 'developer-platform';

export interface GuideMetadata {
    id: string;
    slug: string;
    title: string;
    shortTitle: string;
    description: string;
    category: ProductCategory;
    status: GuideStatus;
    icon?: string;
    estimatedDuration?: string;
    tags?: string[];
    version?: string;
    lastUpdated?: string;
    /** When true, guide is hidden from public landing page (shows "Work in Progress") */
    draft?: boolean;
}

export interface GuideCategory {
    id: ProductCategory;
    title: string;
    description: string;
    icon: string;
    color: string;
    guides: GuideMetadata[];
}

export interface GuidesRegistry {
    categories: GuideCategory[];
    getGuideBySlug: (slug: string) => GuideMetadata | undefined;
    getGuidesByCategory: (category: ProductCategory) => GuideMetadata[];
}
