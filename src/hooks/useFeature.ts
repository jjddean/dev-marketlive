import React from 'react';
import { useOrganization, useUser } from "@clerk/clerk-react";

export type Feature =
    | "UNLIMITED_SHIPMENTS"
    | "API_ACCESS"
    | "TEAM_COLLAB"
    | "ADVANCED_ANALYTICS"
    | "COMPLIANCE_AI"
    | "PREDICTIVE_INSIGHTS"
    | "E_SIGN_DOCS"
    | "PRIORITY_SUPPORT";

const TIER_FEATURES: Record<string, Feature[]> = {
    free: [],
    pro: ["UNLIMITED_SHIPMENTS", "API_ACCESS", "TEAM_COLLAB", "ADVANCED_ANALYTICS", "COMPLIANCE_AI", "PREDICTIVE_INSIGHTS", "E_SIGN_DOCS"],
    enterprise: ["UNLIMITED_SHIPMENTS", "API_ACCESS", "TEAM_COLLAB", "ADVANCED_ANALYTICS", "COMPLIANCE_AI", "PREDICTIVE_INSIGHTS", "E_SIGN_DOCS", "PRIORITY_SUPPORT"],
};

export function useFeature(feature: Feature) {
    const { organization, isLoaded: isOrgLoaded } = useOrganization();
    const { user, isLoaded: isUserLoaded } = useUser();

    if (!isOrgLoaded || !isUserLoaded) return false;

    return React.useMemo(() => {
        // 1. Check Organization Context - Organization Tier Takes Precedence if Active
        if (organization) {
            const tier = (organization.publicMetadata?.subscriptionTier as string) || "free";
            const normalizedTier = tier.toLowerCase();
            return TIER_FEATURES[normalizedTier]?.includes(feature) || false;
        }

        // 2. Fallback to Personal Context - Check User Metadata
        if (user) {
            const tier = (user.publicMetadata?.subscriptionTier as string) || "free";
            const normalizedTier = tier.toLowerCase();
            return TIER_FEATURES[normalizedTier]?.includes(feature) || false;
        }

        return false;
    }, [organization, user, feature, isOrgLoaded, isUserLoaded]);
}
