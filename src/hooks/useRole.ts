import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser, useOrganization } from "@clerk/clerk-react";

export type UserRole = "client" | "admin" | "platform:superadmin";

interface UseRoleResult {
    role: UserRole | null;
    isLoading: boolean;
    isAdmin: boolean;
    isPlatformAdmin: boolean;
    orgId: string | null;
    user: any;
}

/**
 * Hook to get the current user's role and permissions
 * Uses Clerk for auth state and Convex for role data
 */
export function useRole(): UseRoleResult {
    const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
    const { organization } = useOrganization();

    // Get the Convex user record
    const convexUser = useQuery(api.users.current);

    const isLoading = !isUserLoaded || convexUser === undefined;

    // Determine role from Convex user record
    const role = (convexUser?.role as UserRole) || "client";

    // Check if user is an admin (org admin or platform admin)
    const isAdmin = role === "admin" || role === "platform:superadmin";

    // Check if user is a platform superadmin (global access)
    const isPlatformAdmin = role === "platform:superadmin";

    return {
        role,
        isLoading,
        isAdmin,
        isPlatformAdmin,
        orgId: organization?.id || null,
        user: convexUser,
    };
}

/**
 * Check if user has at least the specified role
 */
export function hasRole(userRole: UserRole | null, requiredRole: UserRole): boolean {
    if (!userRole) return false;

    const roleHierarchy: Record<UserRole, number> = {
        "client": 1,
        "admin": 2,
        "platform:superadmin": 3,
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
