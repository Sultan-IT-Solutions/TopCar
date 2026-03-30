'use client';

import { createContext, useContext } from 'react';
import { SiteConfig, defaultSiteConfig } from '@/lib/site-config';

const SiteConfigContext = createContext<SiteConfig>(defaultSiteConfig);

export function SiteConfigProvider({
    initialValue,
    children,
}: {
    initialValue?: SiteConfig;
    children: React.ReactNode;
}) {
    return (
        <SiteConfigContext.Provider value={initialValue ?? defaultSiteConfig}>
            {children}
        </SiteConfigContext.Provider>
    );
}

export function useSiteConfig() {
    return useContext(SiteConfigContext);
}
